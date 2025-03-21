import { getMockProjects, getMockProjectById } from '../data/projects';
import { createResponse, notFound } from '../utils/response';

/**
 * Handle get projects request
 */
export async function handleGetProjects(): Promise<Response> {
  const projects = getMockProjects();
  return createResponse({ 
    projects,
    total: projects.length
  });
}

/**
 * Handle get project by ID request
 */
export async function handleGetProject(url: string): Promise<Response> {
  // Extract ID from URL, e.g. from /api/projects/123
  const id = url.split('/').pop();
  
  if (!id) {
    return notFound('Project ID is required');
  }
  
  const project = getMockProjectById(id);
  
  if (!project) {
    return notFound(`Project with ID ${id} not found`);
  }
  
  return createResponse({ project });
} 