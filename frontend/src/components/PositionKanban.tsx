import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Container, Spinner } from 'react-bootstrap';
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

  if (loading) {
    return (
      <Container className="mt-5 text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3 text-muted">Cargando proceso…</p>
      </Container>
    );
  }

  if (loadError || Number.isNaN(positionId)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{loadError || 'ID de posición no válido'}</Alert>
        <Link to="/positions" className="btn btn-outline-primary">
          Volver a posiciones
        </Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Link to="/positions" className="btn btn-outline-secondary btn-sm">
          ← Posiciones
        </Link>
        {updating && (
          <span className="text-muted small ms-auto">Guardando…</span>
        )}
      </div>

      <h2 className="mb-4">{positionName}</h2>

      {actionError && (
        <Alert variant="warning" dismissible onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <div className="w-100 overflow-x-auto pb-2">
        <div className="d-flex flex-column flex-md-row gap-3 flex-md-nowrap">
        {steps.map((step, stepIndex) => (
          <div
            key={step.id}
            className="flex-shrink-0 bg-light rounded p-3 border"
            style={{ minWidth: 'min(100%, 280px)' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnColumn(step.id)}
          >
            <h6 className="text-secondary mb-3">{step.name}</h6>
            <div className="d-flex flex-column gap-2">
              {candidatesForColumn(step, stepIndex).map((c) => (
                <Card
                  key={`${c.applicationId}-${c.id}`}
                  className="shadow-sm"
                  draggable
                  onDragStart={handleDragStart(c)}
                >
                  <Card.Body className="py-2 px-3">
                    <Card.Title className="h6 mb-1">{c.fullName}</Card.Title>
                    <Card.Text className="small text-muted mb-0">
                      Puntuación media:{' '}
                      {Number.isFinite(c.averageScore) ? c.averageScore.toFixed(1) : '—'}
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </Container>
  );
};

export default PositionKanban;
