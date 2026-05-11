import { getCandidatesByPosition, getPositionsList } from './positionController';
import { Request, Response } from 'express';
import {
  getCandidatesByPositionService,
  getPositionsListService,
} from '../../application/services/positionService';

jest.mock('../../application/services/positionService', () => ({
  getCandidatesByPositionService: jest.fn(),
  getPositionsListService: jest.fn(),
}));

describe('getPositionsList', () => {
  it('should return 200 and positions list', async () => {
    const req = {} as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const rows = [
      { id: 1, title: 'Eng', status: 'Open', deadline: '2024-12-31', companyName: 'LTI' },
    ];
    (getPositionsListService as jest.Mock).mockResolvedValue(rows);

    await getPositionsList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe('getCandidatesByPosition', () => {
  it('should return 200 and candidates data', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (getCandidatesByPositionService as jest.Mock).mockResolvedValue([
      {
        fullName: 'John Doe',
        currentInterviewStep: 'Technical Interview',
        averageScore: 4,
        id: 1,
        applicationId: 1,
      },
    ]);

    await getCandidatesByPosition(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        fullName: 'John Doe',
        currentInterviewStep: 'Technical Interview',
        averageScore: 4,
        id: 1,
        applicationId: 1,
      },
    ]);
  });
});