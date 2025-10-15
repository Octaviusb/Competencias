export class WorkflowService {
  async createApprovalRequest(type, requesterId, approverId, data, organizationId) {
    return await prisma.approvalRequest.create({
      data: {
        type,
        requesterId,
        approverId,
        data: JSON.stringify(data),
        status: 'pending',
        organizationId
      }
    });
  }

  async approveRequest(requestId, approverId, comments = '') {
    const request = await prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approverComments: comments
      }
    });

    await this.executeApproval(request);
    return request;
  }

  async rejectRequest(requestId, approverId, comments = '') {
    return await prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        approverComments: comments
      }
    });
  }

  async executeApproval(request) {
    const data = JSON.parse(request.data);
    
    switch (request.type) {
      case 'leave_request':
        await prisma.leaveRequest.update({
          where: { id: data.leaveRequestId },
          data: { status: 'approved' }
        });
        break;
      case 'salary_change':
        await prisma.employee.update({
          where: { id: data.employeeId },
          data: { salary: data.newSalary }
        });
        break;
    }
  }
}