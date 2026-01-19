import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Save, 
  Clock, 
  Briefcase, 
  Terminal, 
  Palette, 
  Cloud,
  Github
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/apiConfig';
import { reorderItemsForInsertion, reorderItemsForUpdate, reorderItemsForDeletion, reorderAllItemsContiguously } from '@/lib/orderUtils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface TimelineItem {
  _id: string;
  year: string;
  role: string;
  company: string;
  description: string;
  icon: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const TimelineManager = () => {
  const { token } = useAuth();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TimelineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [newItem, setNewItem] = useState({
    year: '',
    role: '',
    company: '',
    description: '',
    icon: 'Briefcase',
    order: 0
  });
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: '',
    type: ''
  });

  // Fetch timeline items
  useEffect(() => {
    const fetchTimelineItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/enhanced/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setTimelineItems(data);
        }
      } catch (error) {
        console.error('Error fetching timeline items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineItems();
  }, [token]);

  // Filter timeline items based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(timelineItems);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredItems(
        timelineItems.filter(item => 
          item.year.toLowerCase().includes(term) ||
          item.role.toLowerCase().includes(term) ||
          item.company.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, timelineItems]);

  const handleCreateItem = async () => {
    try {
      // Reorder items for insertion
      await reorderItemsForInsertion(timelineItems, newItem.order, '/timeline', token);
      
      const response = await fetch(`${API_BASE_URL}/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTimelineItems(refreshedData);
        setNewItem({
          year: '',
          role: '',
          company: '',
          description: '',
          icon: 'Briefcase',
          order: 0
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating timeline item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      // Reorder items for update
      await reorderItemsForUpdate(timelineItems, editingItem._id, editingItem.order, '/timeline', token);
      
      const response = await fetch(`${API_BASE_URL}/timeline/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingItem)
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTimelineItems(refreshedData);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating timeline item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      // Find the deleted item to get its order
      const deletedItem = timelineItems.find(item => item._id === id);
      if (!deletedItem) return;
      
      // Reorder items for deletion
      await reorderItemsForDeletion(timelineItems, deletedItem.order, '/timeline', token);
      
      const response = await fetch(`${API_BASE_URL}/timeline/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the list to get updated orders
        const refreshResponse = await fetch(`${API_BASE_URL}/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshedData = await refreshResponse.json();
        setTimelineItems(refreshedData);
      }
    } catch (error) {
      console.error('Error deleting timeline item:', error);
    }
  };
  
  const openConfirmDialog = (id: string, type: string) => {
    setConfirmDialog({ isOpen: true, id, type });
  };
  
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, id: '', type: '' });
  };
  
  const confirmDelete = () => {
    handleDeleteItem(confirmDialog.id);
    closeConfirmDialog();
  };

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Clock': return Clock;
      case 'Briefcase': return Briefcase;
      case 'Terminal': return Terminal;
      case 'Palette': return Palette;
      case 'Cloud': return Cloud;
      case 'Github': return Github;
      default: return Briefcase;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Timeline Manager</h1>
              <p className="text-muted-foreground">Manage your professional timeline</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Timeline Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Timeline Item' : 'Create New Timeline Item'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      value={editingItem ? editingItem.year : newItem.year}
                      onChange={(e) => 
                        editingItem 
                          ? setEditingItem({...editingItem, year: e.target.value}) 
                          : setNewItem({...newItem, year: e.target.value})
                      }
                      placeholder="e.g., 2024 - Present"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={editingItem ? editingItem.role : newItem.role}
                      onChange={(e) => 
                        editingItem 
                          ? setEditingItem({...editingItem, role: e.target.value}) 
                          : setNewItem({...newItem, role: e.target.value})
                      }
                      placeholder="e.g., Software Engineer"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={editingItem ? editingItem.company : newItem.company}
                      onChange={(e) => 
                        editingItem 
                          ? setEditingItem({...editingItem, company: e.target.value}) 
                          : setNewItem({...newItem, company: e.target.value})
                      }
                      placeholder="e.g., Acme Corp"
                      className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={editingItem ? editingItem.description : newItem.description}
                      onChange={(e) => 
                        editingItem 
                          ? setEditingItem({...editingItem, description: e.target.value}) 
                          : setNewItem({...newItem, description: e.target.value})
                      }
                      placeholder="Describe your role and responsibilities"
                      className="min-h-[100px] w-full rounded-md border-none bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:ring-0 focus:ring-offset-0 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon</Label>
                      <select
                        id="icon"
                        value={editingItem ? editingItem.icon : newItem.icon}
                        onChange={(e) => 
                          editingItem 
                            ? setEditingItem({...editingItem, icon: e.target.value}) 
                            : setNewItem({...newItem, icon: e.target.value})
                        }
                        className="w-full rounded-md border-none bg-gray-800 px-3 py-2 text-white focus:ring-0 focus:ring-offset-0"
                      >
                        <option value="Briefcase">Briefcase</option>
                        <option value="Clock">Clock</option>
                        <option value="Terminal">Terminal</option>
                        <option value="Palette">Palette</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Github">GitHub</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={editingItem ? editingItem.order : newItem.order}
                        onChange={(e) => 
                          editingItem 
                            ? setEditingItem({...editingItem, order: parseInt(e.target.value)}) 
                            : setNewItem({...newItem, order: parseInt(e.target.value)})
                        }
                        placeholder="Order position"
                        className="bg-gray-800 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingItem(null);
                      }}
                      className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button onClick={editingItem ? handleUpdateItem : handleCreateItem}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search timeline items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading timeline items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="glass border border-primary/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No timeline items found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <Card key={item._id} className="glass border border-primary/30 relative">
                  <div className="absolute -top-2 -left-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                    {item.order}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                          {item.role}
                        </CardTitle>
                        <CardDescription className="mt-1">{item.company}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingItem(item);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openConfirmDialog(item._id, 'delete')}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {item.year}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      onClose={closeConfirmDialog}
      onConfirm={confirmDelete}
      title="Confirm Deletion"
      message="Are you sure you want to delete this timeline item? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
    </>
  );
};

export default TimelineManager;