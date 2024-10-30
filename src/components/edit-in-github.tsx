"use client"

import { ArrowRight, Edit } from "lucide-react"
import Link from "next/link"

interface EditInGithubProps {
  repoPath: string
}

export function EditInGithub({ repoPath }: EditInGithubProps) {
  const githubUrl = `https://github.com/jhodges10/otio-website-v3/blob/main${repoPath}`

  return (
    <Link 
      href={githubUrl}
      className="flex items-center justify-end w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Edit className="w-4 h-4 mr-2" />
      Edit in Github
      <ArrowRight className="w-4 h-4 ml-2" />
    </Link>
  )
}
