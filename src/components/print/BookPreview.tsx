import { useState } from 'react';
import { Story } from '@/types/story';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, ArrowRightIcon, MoveVerticalIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface BookPreviewProps {
  story: Story;
  onClose: () => void;
  onConfirm: (pages: BookPage[]) => void;
}

export interface BookPage {
  id: string;
  type: 'text' | 'image';
  content: string;
}

export const BookPreview = ({ story, onClose, onConfirm }: BookPreviewProps) => {
  // Split story into pages (2 paragraphs per text page)
  const initializePages = () => {
    const pages: BookPage[] = [];
    const paragraphs = (story.body || story.content || '').split(/\n+/).filter(p => p.trim() !== '');
    
    for (let i = 0; i < paragraphs.length; i += 2) {
      // Add text page
      pages.push({
        id: `text-${i}`,
        type: 'text',
        content: paragraphs.slice(i, i + 2).join('\n\n')
      });
      
      // Add image page if image exists
      if (story.image_url) {
        pages.push({
          id: `image-${i}`,
          type: 'image',
          content: story.image_url
        });
      }
    }
    return pages;
  };

  const [pages, setPages] = useState<BookPage[]>(initializePages());
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage(prev => 
      direction === 'next' 
        ? Math.min(prev + 1, pages.length - 1)
        : Math.max(prev - 1, 0)
    );
  };

  const handleTextChange = (newContent: string) => {
    setPages(prev => prev.map((page, idx) => 
      idx === currentPage ? { ...page, content: newContent } : page
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPages(items);
    setCurrentPage(result.destination.index);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white p-6 rounded-lg">
        <div className="flex flex-col h-[80vh]">
          <h2 className="text-2xl font-bold mb-4">Book Preview</h2>
          
          <div className="flex-1 flex">
            {/* Page Preview */}
            <div className="flex-1 border rounded-lg p-4 mr-4 bg-white shadow-inner">
              {pages[currentPage]?.type === 'text' ? (
                <Textarea
                  value={pages[currentPage]?.content || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full h-full resize-none text-center"
                />
              ) : (
                <img 
                  src={pages[currentPage]?.content} 
                  alt="Story illustration"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Page List */}
            <div className="w-48">
              <h3 className="font-semibold mb-2">Pages</h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pages">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {pages.map((page, index) => (
                        <Draggable key={page.id} draggableId={page.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 border rounded flex items-center gap-2 cursor-move
                                ${currentPage === index ? 'bg-primary/10 border-primary' : 'bg-white'}
                              `}
                              onClick={() => setCurrentPage(index)}
                            >
                              <MoveVerticalIcon className="w-4 h-4" />
                              <span>
                                {page.type === 'text' ? 'Text' : 'Image'} {index + 1}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange('next')}
                disabled={currentPage === pages.length - 1}
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {pages.length}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => onConfirm(pages)}>
                Generate PDF
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};