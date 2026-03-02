import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Plus, ChevronRight, Calendar, Trash2 } from 'lucide-react'
import { getTemplates, createTemplate, deleteTemplate } from '../db/queries/templates'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import type { Template } from '../types'

export function TemplatesPage() {
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTemplates().then(setTemplates).finally(() => setLoading(false))
  }, [refresh])

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    const id = await createTemplate(newName.trim())
    setNewName('')
    setShowCreate(false)
    setRefresh((r) => r + 1)
    navigate(`/templates/${id}`)
  }, [newName, navigate])

  const handleDelete = useCallback(async () => {
    if (deleteId == null) return
    await deleteTemplate(deleteId)
    setDeleteId(null)
    setRefresh((r) => r + 1)
  }, [deleteId])

  const presets = templates.filter((t) => t.is_preset)
  const custom = templates.filter((t) => !t.is_preset)

  if (loading) return <Spinner />

  return (
    <div className="py-4 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">Templates</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {custom.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">My Templates</h3>
          <div className="flex flex-col gap-2">
            {custom.map((t) => (
              <Card key={t.id} className="active:bg-surface-hover transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/templates/${t.id}`)}>
                    <p className="font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {t.day_count} days
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(t.id) }}
                      className="p-2 rounded-xl text-text-muted hover:text-danger active:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => navigate(`/templates/${t.id}`)} className="p-2 text-text-muted">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {presets.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Preset Schedules</h3>
          <div className="flex flex-col gap-2">
            {presets.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer active:bg-surface-hover transition-colors"
                onClick={() => navigate(`/templates/${t.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {t.day_count} days
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Template">
        <div className="flex flex-col gap-4">
          <Input
            label="Template Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. My Push Pull"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!newName.trim()}>Create Template</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
