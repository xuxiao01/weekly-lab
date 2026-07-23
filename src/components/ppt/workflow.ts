export type WorkflowVariant = 'old' | 'new'

export interface WorkflowStep {
  stage: string
  title: string
  description: string
  tag: string
}
