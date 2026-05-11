import React, { useMemo, useState } from 'react';
import { Card, Col, Container, Form, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/** Mock rows aligned with Figma Make `Posiciones` (fields + filters); ids should match seeded DB for Kanban. */
type Position = {
    id: number;
    title: string;
    manager: string;
    deadline: string;
    status: 'Abierto' | 'Lleno' | 'Borrador';
};

const mockPositions: Position[] = [
    {
        id: 1,
        title: 'Senior Backend Engineer',
        manager: 'John Doe',
        deadline: '2024-12-31',
        status: 'Abierto',
    },
    {
        id: 2,
        title: 'Junior Android Engineer',
        manager: 'Jane Smith',
        deadline: '2024-11-15',
        status: 'Lleno',
    },
    {
        id: 3,
        title: 'Product Manager',
        manager: 'Alex Jones',
        deadline: '2024-07-31',
        status: 'Borrador',
    },
];

function statusBadgeClass(status: Position['status']): string {
    switch (status) {
        case 'Abierto':
            return 'bg-warning';
        case 'Lleno':
            return 'bg-success';
        case 'Borrador':
            return 'bg-secondary';
        default:
            return 'bg-secondary';
    }
}

const Positions: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [managerFilter, setManagerFilter] = useState<string>('all');

    const filteredPositions = useMemo(() => {
        return mockPositions.filter((position) => {
            const matchesSearch = position.title.toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
            const matchesManager = managerFilter === 'all' || position.manager === managerFilter;
            const matchesDate = !dateFilter || position.deadline === dateFilter;
            return matchesSearch && matchesStatus && matchesManager && matchesDate;
        });
    }, [searchText, dateFilter, statusFilter, managerFilter]);

    return (
        <div className="bg-light min-vh-100">
            <Container className="py-5 px-4" style={{ maxWidth: 1400 }}>
                <h1 className="text-center fw-bold display-6 mb-4">Posiciones</h1>

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
                            <option value="Lleno">Lleno</option>
                            <option value="Borrador">Borrador</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Select
                            value={managerFilter}
                            onChange={(e) => setManagerFilter(e.target.value)}
                        >
                            <option value="all">Todos los gerentes</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Jane Smith">Jane Smith</option>
                            <option value="Alex Jones">Alex Jones</option>
                        </Form.Select>
                    </Col>
                </Row>

                <Row className="g-4">
                    {filteredPositions.map((position) => (
                        <Col key={position.id} xs={12} md={6} lg={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4 d-flex flex-column gap-3">
                                    <div>
                                        <Card.Title className="fs-5 fw-bold mb-2">{position.title}</Card.Title>
                                        <Card.Text className="mb-1">
                                            <span className="fw-semibold">Manager:</span> {position.manager}
                                        </Card.Text>
                                        <Card.Text className="mb-2">
                                            <span className="fw-semibold">Deadline:</span> {position.deadline}
                                        </Card.Text>
                                        <span
                                            className={`badge ${statusBadgeClass(position.status)} text-white`}
                                        >
                                            {position.status}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2 mt-auto">
                                        <Link
                                            to={`/position/${position.id}`}
                                            className="btn btn-primary flex-grow-1"
                                        >
                                            Ver proceso
                                        </Link>
                                        <Button variant="secondary" className="flex-grow-1">
                                            Editar
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {filteredPositions.length === 0 && (
                    <p className="text-center text-muted mt-5">No hay posiciones que coincidan con los filtros.</p>
                )}
            </Container>
        </div>
    );
};

export default Positions;
