import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteProjectButton } from './delete-project-button'

interface Project {
  id: string
  name: string
  description: string | null
  category: string
  created_at: string
}

interface ProjectCardProps {
  project: Project
}

const categoryLabels: Record<string, string> = {
  fmcg: 'FMCG',
  services: 'Services',
  premium: 'Premium',
  tech: 'Tech',
  finance: 'Finance',
  healthcare: 'Healthcare',
  retail: 'Retail',
  other: 'Other',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const categoryLabel = categoryLabels[project.category] || project.category

  return (
    <div className="relative group">
      <Link href={`/projects/${project.id}`}>
        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {categoryLabel}
              </span>
            </div>
            <CardTitle className="mt-2">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description || 'No description'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </Link>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteProjectButton projectId={project.id} projectName={project.name} variant="icon" />
      </div>
    </div>
  )
}
