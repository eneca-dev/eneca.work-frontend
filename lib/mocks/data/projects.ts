import { MockProject } from '../types';
import { getCurrentMockUser } from './users';

// Function to generate projects for the current user
export function getMockProjects(): MockProject[] {
  const user = getCurrentMockUser();
  const userId = user.id;
  
  // Base projects available to all users
  const baseProjects: MockProject[] = [
    {
      id: 'project-1',
      name: 'Personal Project',
      description: 'My personal project',
      ownerId: userId,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];
  
  // For admins, add more projects
  if (user.profile?.role === 'admin') {
    return [
      ...baseProjects,
      {
        id: 'project-admin-1',
        name: 'Administrative Project',
        description: 'Project for admins only',
        ownerId: userId,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 'project-admin-2',
        name: 'Second Admin Project',
        description: 'Another project for admins',
        ownerId: userId,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'archived'
      }
    ];
  }
  
  // For developers
  if (user.profile?.role === 'developer') {
    return [
      ...baseProjects,
      {
        id: 'project-dev-1',
        name: 'Development Project',
        description: 'Project for development testing',
        ownerId: userId,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
    ];
  }
  
  return baseProjects;
}

// Function to get a project by ID
export function getMockProjectById(id: string): MockProject | null {
  const projects = getMockProjects();
  return projects.find(project => project.id === id) || null;
} 