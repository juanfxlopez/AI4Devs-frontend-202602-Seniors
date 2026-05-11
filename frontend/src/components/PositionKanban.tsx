import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

type InterviewStep = {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
};

type CandidateRow = {
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  id: number;
  applicationId: number;
};

type DragPayload = {
  candidateId: number;
  applicationId: number;
};

function parseInterviewFlow(json: unknown): { positionName: string; steps: InterviewStep[] } {
  if (!json || typeof json !== 'object' || !('interviewFlow' in json)) {
    throw new Error('Respuesta de flujo de entrevista no válida');
  }
  const outer = (json as { interviewFlow: unknown }).interviewFlow;
  if (!outer || typeof outer !== 'object' || !('interviewFlow' in outer) || !('positionName' in outer)) {
    throw new Error('Estructura de flujo de entrevista inesperada');
  }
  const inner = (outer as { positionName: string; interviewFlow: { interviewSteps: InterviewStep[] } })
    .interviewFlow;
  if (!inner?.interviewSteps) {
    throw new Error('No hay etapas en el flujo');
  }
  const steps = [...inner.interviewSteps].sort(
    (a, b) => a.orderIndex - b.orderIndex || a.id - b.id,
  );
  return { positionName: (outer as { positionName: string }).positionName, steps };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body === 'object') {
      const msg =
        (body as { message?: string }).message ||
        (body as { error?: string }).error ||
        (body as { error?: { message?: string } }).error?.message;
      if (typeof msg === 'string') return msg;
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `Error ${res.status}`;
}

/** Map average score (typically 1–5 from interviews) to filled dots like Figma Make. */
function scoreToFilledDots(average: number): number {
  if (!Number.isFinite(average)) return 0;
  return Math.max(0, Math.min(5, Math.round(average)));
}

function ScoreDots({ average }: { average: number }) {
  const filled = scoreToFilledDots(average);
  return (
    <div className="d-flex gap-1 align-items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-circle ${i < filled ? 'bg-success' : 'bg-secondary bg-opacity-25'}`}
          style={{ width: 12, height: 12 }}
        />
      ))}
    </div>
  );
}

const PositionKanban: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const positionId = id ? parseInt(id, 10) : NaN;

  const [positionName, setPositionName] = useState<string>('');
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [dragOverStepId, setDragOverStepId] = useState<number | null>(null);

  const stepNames = useMemo(() => new Set(steps.map((s) => s.name)), [steps]);

  const loadData = useCallback(async () => {
    if (Number.isNaN(positionId)) {
      setLoadError('ID de posición no válido');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [flowRes, candRes] = await Promise.all([
        fetch(`${API_BASE_URL}/position/${positionId}/interviewflow`),
        fetch(`${API_BASE_URL}/position/${positionId}/candidates`),
      ]);

      if (!flowRes.ok) {
        throw new Error(await readErrorMessage(flowRes));
      }
      if (!candRes.ok) {
        throw new Error(await readErrorMessage(candRes));
      }

      const flowJson: unknown = await flowRes.json();
      const { positionName: pName, steps: st } = parseInterviewFlow(flowJson);
      const candJson: unknown = await candRes.json();
      if (!Array.isArray(candJson)) {
        throw new Error('Lista de candidatos no válida');
      }

      setPositionName(pName);
      setSteps(st);
      setCandidates(candJson as CandidateRow[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar la posición';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Unmatched `currentInterviewStep` names fall back to the first column. */
  const candidatesForColumn = (step: InterviewStep, stepIndex: number): CandidateRow[] =>
    candidates.filter((c) => {
      if (c.currentInterviewStep === step.name) return true;
      if (stepIndex === 0 && !stepNames.has(c.currentInterviewStep)) return true;
      return false;
    });

  const persistStage = async (candidateId: number, applicationId: number, newStepId: number) => {
    setUpdating(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: String(applicationId),
          currentInterviewStep: String(newStepId),
        }),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }
      await loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar la etapa';
      setActionError(msg);
      await loadData();
    } finally {
      setUpdating(false);
    }
  };

  const handleDropOnColumn = (targetStepId: number) => async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverStepId(null);
    const raw = e.dataTransfer.getData('application/json');
    let payload: DragPayload;
    try {
      payload = JSON.parse(raw) as DragPayload;
    } catch {
      return;
    }
    if (!payload?.candidateId || !payload?.applicationId) return;

    const current = candidates.find((c) => c.id === payload.candidateId);
    if (!current) return;

    const currentStep = steps.find((s) => s.name === current.currentInterviewStep);
    const currentStepId = currentStep?.id;
    const fallbackFirst = steps[0]?.id;
    const resolvedCurrentId =
      currentStepId ?? (fallbackFirst !== undefined && !stepNames.has(current.currentInterviewStep)
        ? fallbackFirst
        : undefined);

    if (resolvedCurrentId === targetStepId) return;

    await persistStage(payload.candidateId, payload.applicationId, targetStepId);
  };

  const handleDragStart =
    (c: CandidateRow) => (e: React.DragEvent<HTMLDivElement>) => {
      const payload: DragPayload = { candidateId: c.id, applicationId: c.applicationId };
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
    };

  const handleDragEnd = () => {
    setDragOverStepId(null);
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Container className="text-center py-5" style={{ maxWidth: 1600 }}>
          <Spinner animation="border" role="status" />
          <p className="mt-3 text-muted">Cargando proceso…</p>
        </Container>
      </div>
    );
  }

  if (loadError || Number.isNaN(positionId)) {
    return (
      <div className="bg-light min-vh-100">
        <Container className="py-5" style={{ maxWidth: 1600 }}>
          <Alert variant="danger">{loadError || 'ID de posición no válido'}</Alert>
          <Link to="/positions" className="btn btn-outline-primary">
            Volver a posiciones
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5 px-4" style={{ maxWidth: 1600 }}>
        <div className="mb-4">
          <Link
            to="/positions"
            className="btn btn-link text-decoration-none text-secondary ps-0 mb-3 d-inline-flex align-items-center"
          >
            <ArrowLeft className="me-2" aria-hidden />
            Volver
          </Link>
          <h1 className="fw-bold mb-0">{positionName}</h1>
          {updating && <span className="text-muted small d-block mt-2">Guardando…</span>}
        </div>

        {actionError && (
          <Alert variant="warning" dismissible onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        <Row className="g-4">
          {steps.map((step, stepIndex) => {
            const isOver = dragOverStepId === step.id;
            return (
              <Col key={step.id} xs={12} md={6} xl={3}>
                <div
                  className={`d-flex flex-column rounded p-4 h-100 ${
                    isOver ? 'bg-white border border-primary border-2' : 'bg-body-secondary border border-transparent'
                  }`}
                  style={{ minHeight: 400 }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStepId(step.id);
                  }}
                  onDrop={handleDropOnColumn(step.id)}
                >
                  <h3 className="fw-semibold fs-6 mb-4 px-2">{step.name}</h3>
                  <div className="d-flex flex-column gap-3 flex-grow-1">
                    {candidatesForColumn(step, stepIndex).map((c) => (
                      <Card
                        key={`${c.applicationId}-${c.id}`}
                        className="border-0 shadow-sm"
                        draggable
                        onDragStart={handleDragStart(c)}
                        onDragEnd={handleDragEnd}
                      >
                        <Card.Body className="p-4">
                          <div className="d-flex flex-column gap-2">
                            <p className="fw-medium mb-0" style={{ cursor: 'grab' }}>
                              {c.fullName}
                            </p>
                            <ScoreDots average={c.averageScore} />
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default PositionKanban;
