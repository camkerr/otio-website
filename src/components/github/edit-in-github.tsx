"use client"

import { Edit } from "lucide-react"
import Link from "next/link"

interface EditInGithubProps {
  repoPath?: string
  url?: string
}

export function EditInGithub({ repoPath, url }: EditInGithubProps) {
  const githubUrl = url || (repoPath ? `https://github.com/jhodges10/otio-website-v3/blob/main${repoPath}` : '#')

  return (
    <Link 
      href={githubUrl}
      className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Edit className="w-4 h-4 mr-2" />
      Edit in Github
    </Link>
  )
}
