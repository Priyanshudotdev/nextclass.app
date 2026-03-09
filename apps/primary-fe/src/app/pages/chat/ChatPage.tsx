import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBatches } from '@/hooks/useAdmin'

export function ChatPage() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch real batches
  const { data: batches, isLoading } = useBatches({})

  const filteredBatches = batches?.filter((batch) =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const selectedBatch = filteredBatches.find(b => b.id === selectedBatchId)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Batch List */}
      <Card className="w-80 shrink-0">
        <CardContent className="flex h-full flex-col p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : filteredBatches.length > 0 ? (
              <div className="space-y-1">
                {filteredBatches.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                      selectedBatchId === batch.id
                        ? 'bg-muted'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <span className="font-medium">{batch.name}</span>
                      <p className="truncate text-sm text-muted-foreground">
                        {batch.course?.name || 'Course'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No batches found</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Panel */}
      <Card className="flex-1">
        <CardContent className="flex h-full flex-col p-0">
          {selectedBatch ? (
            <>
              {/* Header */}
              <div className="border-b p-4">
                <h2 className="font-semibold">{selectedBatch.name}</h2>
              </div>

              {/* Empty Chat Content */}
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Chat Coming Soon</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Real-time messaging with students and parents will be available soon.
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">Select a Batch</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a batch from the left to start chatting.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
