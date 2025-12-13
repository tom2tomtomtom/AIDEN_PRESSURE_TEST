import { ProjectForm } from '@/components/forms/project-form'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Project</h1>
        <p className="text-muted-foreground">
          Create a new research project to start pressure testing concepts.
        </p>
      </div>
      <ProjectForm mode="create" />
    </div>
  )
}
