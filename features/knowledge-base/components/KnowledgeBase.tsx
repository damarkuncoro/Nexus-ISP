
import React, { useState, useEffect, useMemo } from 'react';
import { KnowledgeArticle } from '../../../types';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { BookOpen, Search, Tag, Eye, Clock, Plus, ArrowLeft, Edit2, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Flex } from '../../../components/ui/flex';
import { Grid } from '../../../components/ui/grid';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';

interface KnowledgeBaseProps {}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = () => {
  const { articles, loadArticles, addArticle, editArticle, removeArticle, recordView, loading } = useKnowledgeBase();
  const { currentUser, hasPermission } = useAuth();
  const toast = useToast();

  const [view, setView] = useState<'list' | 'read' | 'edit'>('list');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Form State
  const [formData, setFormData] = useState<Partial<KnowledgeArticle>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const categories = useMemo(() => {
      const cats = Array.from(new Set(articles.map(a => a.category)));
      return ['All', ...cats.sort()];
  }, [articles]);

  const filteredArticles = useMemo(() => {
      return articles.filter(a => {
          const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                a.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
          return matchesSearch && matchesCategory;
      });
  }, [articles, searchTerm, selectedCategory]);

  const handleRead = (article: KnowledgeArticle) => {
      setSelectedArticle(article);
      setView('read');
      recordView(article.id);
  };

  const handleCreate = () => {
      setSelectedArticle(null);
      setFormData({ title: '', content: '', category: 'Troubleshooting', tags: [] });
      setView('edit');
  };

  const handleEdit = (article: KnowledgeArticle) => {
      setSelectedArticle(article);
      setFormData(article);
      setView('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.content) return;

      setIsSubmitting(true);
      try {
          if (selectedArticle) {
              await editArticle(selectedArticle.id, formData);
              toast.success("Article updated.");
          } else {
              await addArticle({
                  ...formData as any,
                  author_name: currentUser?.name || 'Unknown',
                  is_published: true,
                  tags: formData.tags || []
              });
              toast.success("Article published.");
          }
          setView('list');
      } catch (err) {
          toast.error("Failed to save article.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (id: string) => {
      try {
          await removeArticle(id);
          toast.success("Article deleted.");
          if (selectedArticle?.id === id) setView('list');
      } catch (err) {
          toast.error("Failed to delete article.");
      }
  };

  if (view === 'edit') {
      return (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
              <div className="mb-6 flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setView(selectedArticle ? 'read' : 'list')} className="rounded-full">
                      <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedArticle ? 'Edit Article' : 'Write New Article'}</h1>
              </div>
              <Card>
                  <form onSubmit={handleSave}>
                      <CardContent className="p-6 space-y-6">
                          <div>
                              <Label htmlFor="title" className="mb-2 block">Title</Label>
                              <Input id="title" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. How to restart OLT" />
                          </div>
                          
                          <Grid cols={2} gap={6}>
                              <div>
                                  <Label htmlFor="category" className="mb-2 block">Category</Label>
                                  <Input id="category" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} list="category-suggestions" placeholder="e.g. Troubleshooting" />
                                  <datalist id="category-suggestions">
                                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                                  </datalist>
                              </div>
                              <div>
                                  <Label htmlFor="tags" className="mb-2 block">Tags (comma separated)</Label>
                                  <Input 
                                    id="tags" 
                                    value={formData.tags?.join(', ') || ''} 
                                    onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})} 
                                    placeholder="fiber, ont, error" 
                                  />
                              </div>
                          </Grid>

                          <div>
                              <Label htmlFor="content" className="mb-2 block">Content (Markdown supported)</Label>
                              <Textarea 
                                id="content" 
                                required 
                                value={formData.content || ''} 
                                onChange={e => setFormData({...formData, content: e.target.value})} 
                                className="min-h-[400px] font-mono text-sm" 
                                placeholder="# Heading\n\nWrite your guide here..." 
                              />
                          </div>

                          <Flex justify="end" gap={3}>
                              <Button type="button" variant="secondary" onClick={() => setView(selectedArticle ? 'read' : 'list')}>Cancel</Button>
                              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Save Article</Button>
                          </Flex>
                      </CardContent>
                  </form>
              </Card>
          </div>
      );
  }

  if (view === 'read' && selectedArticle) {
      return (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex justify-between items-center">
                  <Button variant="ghost" onClick={() => setView('list')} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
                  </Button>
                  
                  {hasPermission('manage_settings') && (
                      <Flex gap={2}>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(selectedArticle)}>
                              <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(selectedArticle.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </Flex>
                  )}
              </div>

              <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 dark:border-slate-700">
                      <Flex gap={2} className="mb-4">
                          <Badge variant="secondary">{selectedArticle.category}</Badge>
                          {selectedArticle.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="text-gray-500 border-gray-200 dark:border-slate-600 dark:text-gray-400">#{tag}</Badge>
                          ))}
                      </Flex>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedArticle.title}</h1>
                      <Flex gap={6} className="text-sm text-gray-500 dark:text-gray-400">
                          <Flex align="center" gap={2}><User className="w-4 h-4" /> {selectedArticle.author_name}</Flex>
                          <Flex align="center" gap={2}><Clock className="w-4 h-4" /> Updated {new Date(selectedArticle.updated_at).toLocaleDateString()}</Flex>
                          <Flex align="center" gap={2}><Eye className="w-4 h-4" /> {selectedArticle.views} views</Flex>
                      </Flex>
                  </div>
                  <div className="p-8 prose prose-slate dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed">{selectedArticle.content}</div>
                  </div>
              </article>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Flex justify="between" align="center" className="flex-col sm:flex-row gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary-600" /> Knowledge Base
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Standard operating procedures and troubleshooting guides.</p>
            </div>
            {hasPermission('manage_settings') && (
                <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Write Article</Button>
            )}
        </Flex>

        <Grid cols={1} className="lg:grid-cols-4" gap={8}>
            {/* Sidebar */}
            <div className="space-y-6">
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-700">
                        <CardTitle className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                        <ul className="space-y-1">
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'}`}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                        className="pl-10 h-12 text-base shadow-sm border-gray-200 dark:border-slate-700 dark:bg-slate-800" 
                        placeholder="Search for solutions (e.g. 'router reset', 'billing')..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredArticles.length > 0 ? (
                    <Grid cols={1} className="md:grid-cols-2" gap={4}>
                        {filteredArticles.map(article => (
                            <Card 
                                key={article.id} 
                                onClick={() => handleRead(article)}
                                className="cursor-pointer hover:shadow-md transition-all border-gray-200 dark:border-slate-700 dark:bg-slate-800 group"
                            >
                                <CardContent className="p-5">
                                    <Flex justify="between" align="start" className="mb-2">
                                        <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-slate-700/50">{article.category}</Badge>
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views}</span>
                                    </Flex>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                                        {article.content}
                                    </p>
                                    <Flex align="center" justify="between" className="text-xs text-gray-400 border-t border-gray-100 dark:border-slate-700 pt-3 mt-auto">
                                        <span>By {article.author_name}</span>
                                        <span>{new Date(article.updated_at).toLocaleDateString()}</span>
                                    </Flex>
                                </CardContent>
                            </Card>
                        ))}
                    </Grid>
                ) : (
                    <EmptyState 
                        icon={BookOpen}
                        title="No articles found"
                        message={`We couldn't find any articles matching "${searchTerm}" in ${selectedCategory}.`}
                        action={hasPermission('manage_settings') ? { label: "Create New Article", onClick: handleCreate } : undefined}
                    />
                )}
            </div>
        </Grid>
    </div>
  );
};
