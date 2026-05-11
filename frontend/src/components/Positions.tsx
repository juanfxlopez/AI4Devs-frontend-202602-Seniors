import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Form, Row, Spinner, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

type PositionRow = {
    id: number;
    title: string;
    status: string;
    deadline: string | null;
    companyName: string;
};

function statusLabel(status: string): string {
    const s = status.toLowerCase();
    if (s === 'open') return 'Abierto';
    if (s === 'draft') return 'Borrador';
    if (s === 'closed') return 'Cerrado';
    if (s === 'filled') return 'Contratado';
    return status;
}

function statusBadgeClass(label: string): string {
    if (label === 'Abierto') return 'bg-warning';
    if (label === 'Contratado') return 'bg-success';
    if (label === 'Borrador') return 'bg-secondary';
    return 'bg-secondary';
}

const Positions: React.FC = () => {
    const [positions, setPositions] = useState<PositionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/position`);
                if (!res.ok) {
                    throw new Error((await res.text()) || `Error ${res.status}`);
                }
                const data: unknown = await res.json();
                if (!Array.isArray(data)) {
                    throw new Error('Respuesta de posiciones no válida');
                }
                if (!cancelled) {
                    setPositions(data as PositionRow[]);
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'No se pudieron cargar las posiciones');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const companyOptions = useMemo(() => {
        const names = Array.from(new Set(positions.map((p) => p.companyName))).sort();
        return names;
    }, [positions]);

    const filteredPositions = useMemo(() => {
        return positions.filter((position) => {
            const label = statusLabel(position.status);
            const matchesSearch = position.title.toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = statusFilter === 'all' || label === statusFilter;
            const matchesCompany = companyFilter === 'all' || position.companyName === companyFilter;
            const matchesDate =
                !dateFilter || (position.deadline !== null && position.deadline.slice(0, 10) === dateFilter);
            return matchesSearch && matchesStatus && matchesCompany && matchesDate;
        });
    }, [positions, searchText, dateFilter, statusFilter, companyFilter]);

    if (loading) {
        return (
            <div className="bg-light min-vh-100">
                <Container className="py-5 text-center" style={{ maxWidth: 1400 }}>
                    <Spinner animation="border" role="status" />
                    <p className="mt-3 text-muted">Cargando posiciones…</p>
                </Container>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100">
            <Container className="py-5 px-4" style={{ maxWidth: 1400 }}>
                <h1 className="text-center fw-bold display-6 mb-4">Posiciones</h1>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        {error}
                    </Alert>
                )}

                <Row className="g-3 mb-4">
                    <Col xs={12} md={6} lg={3}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por título"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Control
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Abierto">Abierto</option>
                            <option value="Contratado">Contratado</option>
                            <option value="Borrador">Borrador</option>
                            <option value="Cerrado">Cerrado</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Select
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                        >
                            <option value="all">Todas las empresas</option>
                            {companyOptions.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                <Row className="g-4">
                    {filteredPositions.map((position) => {
                        const label = statusLabel(position.status);
                        return (
                            <Col key={position.id} xs={12} md={6} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-4 d-flex flex-column gap-3">
                                        <div>
                                            <Card.Title className="fs-5 fw-bold mb-2">{position.title}</Card.Title>
                                            <Card.Text className="mb-1">
                                                <span className="fw-semibold">Empresa:</span> {position.companyName}
                                            </Card.Text>
                                            <Card.Text className="mb-2">
                                                <span className="fw-semibold">Deadline:</span>{' '}
                                                {position.deadline
                                                    ? position.deadline.slice(0, 10)
                                                    : '—'}
                                            </Card.Text>
                                            <span
                                                className={`badge ${statusBadgeClass(label)} text-white`}
                                            >
                                                {label}
                                            </span>
                                        </div>
                                        <div className="d-flex gap-2 mt-auto">
                                            <Link
                                                to={`/position/${position.id}`}
                                                className="btn btn-primary flex-grow-1"
                                            >
                                                Ver proceso
                                            </Link>
                                            <Button variant="secondary" className="flex-grow-1" disabled>
                                                Editar
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {!error && filteredPositions.length === 0 && (
                    <p className="text-center text-muted mt-5">No hay posiciones que coincidan con los filtros.</p>
                )}
            </Container>
        </div>
    );
};

export default Positions;
