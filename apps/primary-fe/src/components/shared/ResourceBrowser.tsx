import { useState } from 'react'
import { FileText, Video, File, ChevronRight, ChevronDown, Download, MoreHorizontal, Pencil, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface ResourceFile {
  id: string
  title: string
  type: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
  size?: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

interface Unit {
  id: string
  name: string
  files: ResourceFile[]
}

interface Subject {
  id: string
  name: string
  units: Unit[]
}

interface ResourceBrowserProps {
  subjects: Subject[]
  readOnly?: boolean
  onUpload?: () => void
  onEdit?: (fileId: string) => void
  onDelete?: (fileId: string) => void
  className?: string
}

function getFileIcon(type: string) {
  switch (type?.toUpperCase()) {
    case 'PDF':
      return <FileText className="h-5 w-5 text-red-500" />
    case 'VIDEO':
      return <Video className="h-5 w-5 text-blue-500" />
    default:
      return <File className="h-5 w-5 text-muted-foreground" />
  }
}

export function ResourceBrowser({
  subjects,
  readOnly = false,
  onUpload,
  onEdit,
  onDelete,
  className,
}: ResourceBrowserProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '')
  const [selectedUnit, setSelectedUnit] = useState<string>(subjects[0]?.units[0]?.id || '')
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set([subjects[0]?.id || '']))

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  const currentSubject = subjects.find(s => s.id === selectedSubject)
  const currentUnit = currentSubject?.units.find(u => u.id === selectedUnit)

  return (
    <div className={cn('flex h-[500px] rounded-lg border', className)}>
      {/* Left Panel - Subject Tree */}
      <div className="w-64 shrink-0 border-r bg-muted/30">
        <div className="flex h-12 items-center border-b px-4">
          <span className="text-sm font-medium">Subjects</span>
        </div>
        <div className="overflow-y-auto p-2" style={{ height: 'calc(100% - 48px)' }}>
          {subjects.map((subject) => (
            <Collapsible
              key={subject.id}
              open={expandedSubjects.has(subject.id)}
              onOpenChange={() => toggleSubject(subject.id)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                    selectedSubject === subject.id && 'bg-muted font-medium'
                  )}
                  onClick={() => {
                    setSelectedSubject(subject.id)
                    if (subject.units[0]) setSelectedUnit(subject.units[0].id)
                  }}
                >
                  {expandedSubjects.has(subject.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{subject.name}</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 space-y-0.5 py-1">
                  {subject.units.map((unit) => (
                    <button
                      key={unit.id}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted',
                        selectedUnit === unit.id && 'bg-muted/80 font-medium'
                      )}
                      onClick={() => {
                        setSelectedSubject(subject.id)
                        setSelectedUnit(unit.id)
                      }}
                    >
                      <span className="text-xs text-muted-foreground">└</span>
                      <span className="truncate">{unit.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        ({unit.files.length})
                      </span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Right Panel - File List */}
      <div className="flex-1">
        <div className="flex h-12 items-center justify-between border-b px-4">
          <span className="text-sm font-medium">
            {currentUnit?.name || 'Select a unit'}
          </span>
          {!readOnly && onUpload && (
            <Button size="sm" onClick={onUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          )}
        </div>
        <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 48px)' }}>
          {currentUnit?.files.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No files in this unit
            </div>
          ) : (
            <div className="space-y-2">
              {currentUnit?.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{file.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type} {file.size && `· ${file.size}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {file.uploadedBy} · {file.uploadedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(file.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete?.(file.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
