import { NextRequest } from 'next/server';
import { getSubmissionById, deleteSubmission } from '@/lib/storage';
import {
  handleOptionsResponse,
  jsonResponse,
  errorResponse
} from '@/lib/api-utils';

export async function OPTIONS() {
  return handleOptionsResponse(['GET', 'DELETE', 'OPTIONS']);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id || typeof id !== 'string') {
      return errorResponse('Invalid submission ID provided.', 400);
    }

    const submission = await getSubmissionById(id);
    if (!submission) {
      return errorResponse(`Submission with ID "${id}" was not found.`, 404);
    }

    return jsonResponse(submission);
  } catch (err: any) {
    console.error(`Error retrieving submission [${params?.id}]:`, err);
    return errorResponse('Failed to retrieve submission.', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id || typeof id !== 'string') {
      return errorResponse('Invalid submission ID provided.', 400);
    }

    const existing = await getSubmissionById(id);
    if (!existing) {
      return errorResponse(`Submission with ID "${id}" was not found.`, 404);
    }

    const deleted = await deleteSubmission(id);
    if (!deleted) {
      return errorResponse('Failed to delete submission.', 500);
    }

    return jsonResponse({
      success: true,
      message: `Submission "${id}" was successfully deleted.`
    });
  } catch (err: any) {
    console.error(`Error deleting submission [${params?.id}]:`, err);
    return errorResponse('Failed to delete submission.', 500);
  }
}
