'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import Image from 'next/image';
import { Monitor, Sun, Moon, FileText, Settings, Eye, EyeOff } from 'lucide-react';

export interface Item {
  id: string;
  name: string;
  title: string;
}

// Placeholder text for the input list
const DEFAULT_PLACEHOLDER_TEXT = `Title 1
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 2
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 3
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 4
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 5
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 6
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 7
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 8
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 9
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10

Title 10
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10`;

// Natural sort function
const naturalCompare = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

export default function Home() {
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSortConfirm, setShowSortConfirm] = useState(false);
  const [sortConfirmCallback, setSortConfirmCallback] = useState<(() => void) | null>(null);
  const [customItems, setCustomItems] = useState('');
  const [customTitles, setCustomTitles] = useState<Array<{ name: string; items: Item[] }>>([]);
  const [outputListHeight, setOutputListHeight] = useState<number | null>(null);
  const [outputListTop, setOutputListTop] = useState<number | null>(null);
  const [isTouchResizing, setIsTouchResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const [resizeMaxHeight, setResizeMaxHeight] = useState(0);
  const resizeStartContainerTopRef = useRef<number>(0);
  const [resizePreviewHeight, setResizePreviewHeight] = useState<number | null>(null);
  const [resizePreviewTop, setResizePreviewTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const outputContainerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const previewOutlineRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const outlineTopRef = useRef<number | null>(null);
  const resizePreviewHeightRef = useRef<number | null>(null);
  const [isOutputListHidden, setIsOutputListHidden] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dontAskClearAgain, setDontAskClearAgain] = useState(false);
  const [dontAskSortAgain, setDontAskSortAgain] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Save selected items to localStorage
  const saveSelectedItems = (items: Map<string, number>) => {
    try {
      localStorage.setItem('listing-selected-items', JSON.stringify(Array.from(items.entries())));
    } catch (error) {
      console.error('Error saving selected items:', error);
    }
  };

  // Save custom titles to localStorage
  const saveCustomTitles = (titles: Array<{ name: string; items: Item[] }>) => {
    try {
      localStorage.setItem('listing-custom-titles', JSON.stringify(titles));
    } catch (error) {
      console.error('Error saving custom titles:', error);
    }
  };

  // Save custom items text to localStorage
  const saveCustomItemsText = (text: string) => {
    try {
      localStorage.setItem('listing-custom-items-text', text);
    } catch (error) {
      console.error('Error saving custom items text:', error);
    }
  };

  // Save "don't ask again when clearing" preference
  const saveDontAskClearAgain = (value: boolean) => {
    try {
      localStorage.setItem('listing-dont-ask-clear-again', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving dont ask clear again preference:', error);
    }
  };

  // Save "don't ask again when sorting" preference
  const saveDontAskSortAgain = (value: boolean) => {
    try {
      localStorage.setItem('listing-dont-ask-sort-again', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving dont ask sort again preference:', error);
    }
  };

  // Parse custom items text into title structure
  const parseCustomItems = (text: string) => {
    // Split by double newlines to get title sections
    const titleSections = text.split(/\n\s*\n/).filter(section => section.trim().length > 0);
    const titles: Array<{ name: string; items: Item[] }> = [];

    for (const section of titleSections) {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) continue;
      
      const titleName = lines[0];
      const itemNames = lines.slice(1); // Everything after the first line
      
      const items: Item[] = itemNames.map(itemName => {
        const itemId = `${titleName}-${itemName}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return {
          id: itemId,
          name: itemName,
          title: titleName
        };
      });
      
      titles.push({
        name: titleName,
        items: items
      });
    }

    return titles;
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load selected items
    const savedSelectedItems = localStorage.getItem('listing-selected-items');
    if (savedSelectedItems) {
      try {
        const parsed = JSON.parse(savedSelectedItems);
        setSelectedItems(new Map(parsed));
      } catch (error) {
        console.error('Error loading selected items:', error);
      }
    }

    // Load custom items text or initialize with placeholder if not present
    const savedCustomItems = localStorage.getItem('listing-custom-items-text');
    if (savedCustomItems) {
      setCustomItems(savedCustomItems);
      // Parse and set custom titles
      const parsedTitles = parseCustomItems(savedCustomItems);
      setCustomTitles(parsedTitles);
    } else {
      // If no saved custom items, initialize with default placeholder
      setCustomItems(DEFAULT_PLACEHOLDER_TEXT);
      saveCustomItemsText(DEFAULT_PLACEHOLDER_TEXT);
      const parsedTitles = parseCustomItems(DEFAULT_PLACEHOLDER_TEXT);
      setCustomTitles(parsedTitles);
      saveCustomTitles(parsedTitles);
    }

    // Load custom titles (for backward compatibility)
    const savedCustomTitles = localStorage.getItem('listing-custom-titles');
    if (savedCustomTitles) {
      try {
        const parsed = JSON.parse(savedCustomTitles);
        if (parsed.length > 0) {
          setCustomTitles(parsed);
        }
      } catch (error) {
        console.error('Error loading custom titles:', error);
      }
    }

    // Load output list height
    const savedHeight = localStorage.getItem('listing-output-list-height');
    if (savedHeight) {
      try {
        setOutputListHeight(parseInt(savedHeight, 10));
      } catch (error) {
        console.error('Error loading output list height:', error);
      }
    }

    // Load output list top position
    const savedTop = localStorage.getItem('listing-output-list-top');
    if (savedTop) {
      try {
        setOutputListTop(parseFloat(savedTop));
      } catch (error) {
        console.error('Error loading output list top position:', error);
      }
    }

    // Load "don't ask again when clearing" preference
    const savedDontAsk = localStorage.getItem('listing-dont-ask-clear-again');
    if (savedDontAsk) {
      try {
        setDontAskClearAgain(JSON.parse(savedDontAsk));
      } catch (error) {
        console.error('Error loading dont ask clear again preference:', error);
      }
    }

    // Load "don't ask again when sorting" preference
    const savedDontAskSort = localStorage.getItem('listing-dont-ask-sort-again');
    if (savedDontAskSort) {
      try {
        setDontAskSortAgain(JSON.parse(savedDontAskSort));
      } catch (error) {
        console.error('Error loading dont ask sort again preference:', error);
      }
    }
  }, []);

  // Resize handle - mobile only
  useEffect(() => {
    if (!isTouchResizing) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchResizing) return;
      
      if (e.cancelable) {
        e.preventDefault();
      }
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const container = outputContainerRef.current;
      const gridContainer = gridContainerRef.current;
      if (!container || !gridContainer) return;
      
      const gridRect = gridContainer.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const fingerY = touch.clientY;
      const containerTop = containerRect.top;
      let newHeight = fingerY - containerTop;
      
      const minHeight = 98;
      newHeight = Math.max(minHeight, Math.min(resizeMaxHeight, newHeight));
      
      const previewOutline = previewOutlineRef.current;
      if (previewOutline) {
        const minOutlineTop = 98;
        const maxOutlineTop = window.innerHeight * 0.9;
        let outlineTop = touch.clientY;
        outlineTop = Math.max(minOutlineTop, Math.min(maxOutlineTop, outlineTop));
        
        previewOutline.style.top = `${outlineTop}px`;
        previewOutline.style.left = `${containerRect.left}px`;
        previewOutline.style.width = `${containerRect.width}px`;
        previewOutline.style.display = 'block';
        
        setResizePreviewTop(outlineTop);
        outlineTopRef.current = outlineTop;
      }
      
      setResizePreviewHeight(newHeight);
      resizePreviewHeightRef.current = newHeight;
      
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const scrollableArea = scrollableAreaRef.current;
      const container = outputContainerRef.current;
      const gridContainer = gridContainerRef.current;
      
      if (scrollableArea && container && gridContainer && outlineTopRef.current !== null) {
        const outlineTop = outlineTopRef.current;
        const gridRect = gridContainer.getBoundingClientRect();
        
        const containerTopRelativeToGrid = outlineTop - gridRect.top;
        const gridBottom = gridRect.bottom;
        const availableHeight = gridBottom - outlineTop;
        
        const minHeight = 100;
        const maxHeight = resizeMaxHeight > 0 ? resizeMaxHeight : window.innerHeight * 0.9;
        let finalHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight));
        
        container.style.setProperty('--output-top', `${containerTopRelativeToGrid}px`);
        container.style.height = `${finalHeight}px`;
        container.style.minHeight = '100px';
        container.classList.add('output-positioned');
        scrollableArea.style.setProperty('--custom-height', `${finalHeight}px`);
        scrollableArea.style.minHeight = '100px';
        
        setOutputListHeight(finalHeight);
        setOutputListTop(containerTopRelativeToGrid);
        localStorage.setItem('listing-output-list-height', finalHeight.toString());
        localStorage.setItem('listing-output-list-top', containerTopRelativeToGrid.toString());
      }
      
      setResizePreviewHeight(null);
      setResizePreviewTop(null);
      outlineTopRef.current = null;
      resizePreviewHeightRef.current = null;
      setIsTouchResizing(false);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { capture: true });
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.body.style.userSelect = '';
    };
  }, [isTouchResizing, resizeStartY, resizeStartHeight, resizeMaxHeight, resizePreviewTop]);

  // Get all items as a flat array
  const allItems = useMemo(() => {
    return customTitles.flatMap(title => title.items);
  }, [customTitles]);

  // Get selected items for output
  const outputItems = useMemo(() => {
    const result: Array<{ item: Item; count: number }> = [];
    selectedItems.forEach((count, itemId) => {
      const item = allItems.find(f => f.id === itemId);
      if (item && count > 0) {
        result.push({ item, count });
      }
    });
    return result;
  }, [selectedItems, allItems]);

  // Group output items by title
  const outputItemsByTitle = useMemo(() => {
    const grouped = new Map<string, Array<{ item: Item; count: number }>>();
    
    outputItems.forEach(({ item, count }) => {
      const title = customTitles.find(t => t.items.some(i => i.id === item.id));
      if (title) {
        if (!grouped.has(title.name)) {
          grouped.set(title.name, []);
        }
        grouped.get(title.name)!.push({ item, count });
      }
    });
    
    return Array.from(grouped.entries()).map(([titleName, items]) => ({
      titleName,
      items
    }));
  }, [outputItems, customTitles]);

  const addItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(itemId) || 0;
      newMap.set(itemId, currentCount + 1);
      saveSelectedItems(newMap);
      return newMap;
    });
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(itemId) || 0;
      if (currentCount > 1) {
        newMap.set(itemId, currentCount - 1);
      } else {
        newMap.delete(itemId);
      }
      saveSelectedItems(newMap);
      return newMap;
    });
  };

  const getItemCount = (itemId: string) => {
    return selectedItems.get(itemId) || 0;
  };

  const copyOutputList = async () => {
    if (outputItems.length === 0) return;

    const outputText = outputItemsByTitle
      .map(({ titleName, items }) => {
        const titleSection = [`${titleName}:`];
        const itemLines = items.map(({ item, count }) => {
          if (count === 1) {
            return `  ${item.name}`;
          } else {
            return `  ${count} ${item.name}`;
          }
        });
        return [...titleSection, ...itemLines].join('\n');
      })
      .join('\n\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(outputText);
        alert('Output list copied to clipboard!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = outputText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            alert('Output list copied to clipboard!');
          } else {
            throw new Error('execCommand failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard. Please copy manually.');
    }
  };

  const clearAll = () => {
    if (!dontAskClearAgain) {
      setShowClearConfirm(true);
      return;
    }
    performClearAll();
  };

  const performClearAll = () => {
    const newMap = new Map();
    setSelectedItems(newMap);
    saveSelectedItems(newMap);
    setShowClearConfirm(false);
  };

  // Sort output items
  const sortOutputItems = () => {
    if (!dontAskSortAgain) {
      setSortConfirmCallback(() => performSortOutputItems);
      setShowSortConfirm(true);
      return;
    }
    performSortOutputItems();
  };

  const performSortOutputItems = () => {
    const sortedMap = new Map<string, number>();
    const itemsByTitle = new Map<string, Array<{ item: Item; count: number }>>();
    
    selectedItems.forEach((count, itemId) => {
      const item = allItems.find(f => f.id === itemId);
      if (!item) return;
      
      const title = customTitles.find(t => t.items.some(i => i.id === item.id));
      if (title) {
        if (!itemsByTitle.has(title.name)) {
          itemsByTitle.set(title.name, []);
        }
        itemsByTitle.get(title.name)!.push({ item, count });
      }
    });
    
    customTitles.forEach(title => {
      const titleItems = itemsByTitle.get(title.name);
      if (titleItems) {
        titleItems.sort((a, b) => naturalCompare(a.item.name, b.item.name));
        titleItems.forEach(({ item, count }) => {
          sortedMap.set(item.id, count);
        });
      }
    });
    
    setSelectedItems(sortedMap);
    saveSelectedItems(sortedMap);
  };

  // Export current items in the correct format
  const exportCurrentItems = () => {
    return customTitles
      .map(title => {
        const items = title.items.map(item => item.name);
        return [title.name, ...items].join('\n');
      })
      .join('\n\n');
  };

  // Handle import of custom items
  const handleImportItems = () => {
    try {
      const parsedTitles = parseCustomItems(customItems);
      setCustomTitles(parsedTitles);
      saveCustomTitles(parsedTitles);
      saveCustomItemsText(customItems);
      setShowConfigModal(false);
    } catch (error) {
      alert('Error parsing items. Please check the format and try again.');
      console.error('Parse error:', error);
    }
  };

  // Sort input items
  const sortInputItems = () => {
    if (dontAskSortAgain) {
      performSortInputItems();
    } else {
      setSortConfirmCallback(() => performSortInputItems);
      setShowSortConfirm(true);
    }
  };

  const performSortInputItems = () => {
    try {
      const titleSections = customItems.split(/\n\s*\n/).filter(section => section.trim().length > 0);
      const sortedSections = titleSections.map(section => {
        const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) return section;
        
        const titleName = lines[0];
        const itemNames = lines.slice(1);
        const sortedItemNames = itemNames.sort((a, b) => naturalCompare(a, b));
        
        return [titleName, ...sortedItemNames].join('\n');
      });
      
      const sortedText = sortedSections.join('\n\n');
      setCustomItems(sortedText);
      saveCustomItemsText(sortedText);
    } catch (error) {
      alert('Error sorting items. Please check the format and try again.');
      console.error('Sort error:', error);
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const themes: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Get theme icon with appropriate animation
  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" strokeWidth={1.25} />;
    }
    
    return (
      <motion.div
        key={theme}
        initial={{ rotate: -180 }}
        animate={{ rotate: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut"
        }}
        className="w-5 h-5"
      >
        {theme === 'light' && <Sun className="w-5 h-5" strokeWidth={1.25} />}
        {theme === 'dark' && <Moon className="w-5 h-5" strokeWidth={1.25} />}
      </motion.div>
    );
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Geometric Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(135deg, 
              var(--borders) 0%, 
              transparent 30%, 
              var(--borders) 60%, 
              transparent 100%)`,
            backgroundSize: '300% 300%',
            animation: 'gradientMove 25s ease-in-out infinite'
          }}
        ></div>
        
        {/* Secondary gradient for depth */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(-135deg, 
              transparent 0%, 
              var(--borders) 40%, 
              var(--borders) 70%, 
              transparent 100%)`,
            backgroundSize: '400% 400%',
            animation: 'gradientMove 35s ease-in-out infinite reverse'
          }}
        ></div>
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, var(--borders) 1px, transparent 1px)`,
            backgroundSize: '50px 50px, 80px 80px',
            animation: 'gradientMove 40s ease-in-out infinite'
          }}
        ></div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-0 w-full h-px bg-[var(--borders)]"></div>
          <div className="absolute top-2/3 left-0 w-full h-px bg-[var(--borders)]"></div>
          <div className="absolute left-1/3 top-0 w-px h-full bg-[var(--borders)]"></div>
          <div className="absolute left-2/3 top-0 w-px h-full bg-[var(--borders)]"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-4 max-w-7xl relative z-10 h-full flex flex-col min-h-0">
        <div className="flex justify-between items-center relative flex-shrink-0">
          <a
            href="https://codifyne.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src={resolvedTheme === 'light' ? "/lightlogo.svg" : "/logo.svg"}
              alt="Codifyne Logo"
              width={80}
              height={80}
              className="w-10 h-10"
              unoptimized
              priority
              suppressHydrationWarning
            />
          </a>
          
          <div className="flex items-center">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-4 cursor-pointer transition-colors nav-link-inactive md:hover:nav-link-active"
              title="Configure items"
            >
              <Settings className="w-5 h-5" strokeWidth={1.25} />
            </button>
            <button
              onClick={handleThemeToggle}
              className="p-2 cursor-pointer transition-colors nav-link-inactive md:hover:nav-link-active"
              title={`Current: ${theme} theme`}
            >
              {getThemeIcon()}
            </button>
          </div>
        </div>

        <div ref={gridContainerRef} className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-8 flex-1 min-h-0 overflow-hidden relative">
          {/* Input List */}
          <div 
            ref={inputContainerRef} 
            className="overflow-y-auto overflow-x-hidden min-h-0 flex-shrink" 
            data-input-container
            style={{ 
              flex: isOutputListHidden ? '1 1 0' : (outputListHeight ? '0 1 auto' : '1 1 0'),
              ...(!isOutputListHidden && outputListTop !== null ? {
                '--input-max-height': `${outputListTop}px`,
              } : {})
            }}
          >
            
            <div className="space-y-6">
              {customTitles.map((title) => (
                <div key={title.name} className="mb-8">
                  {title.name && <h3 className="title-header sticky top-0 z-10 -mx-2 px-4 backdrop-blur-sm">{title.name}</h3>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {title.items.map((item) => {
                        const count = getItemCount(item.id);
                        
                        return (
                          <div
                            key={item.id}
                            className="item"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="item-name text-[13px] opacity-80">{item.name}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {count > 0 && (
                                <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                                  {count}
                                </span>
                              )}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="btn-danger btn-sm"
                                disabled={count === 0}
                              >
                                -
                              </button>
                              <button
                                onClick={() => addItem(item.id)}
                                className="btn-success btn-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Output List */}
          <div 
            ref={outputContainerRef}
            className={`flex flex-col min-h-0 ${isOutputListHidden ? 'hidden md:flex' : ''} ${!isOutputListHidden && outputListTop !== null ? 'output-positioned' : ''}`} 
            data-output-container 
            style={{ 
              ...(!isOutputListHidden && outputListTop !== null ? {
                '--output-top': `${outputListTop}px`,
                height: outputListHeight ? `${outputListHeight}px` : undefined,
                minHeight: '100px',
              } : !isOutputListHidden ? {
                flex: outputListHeight ? `0 0 auto` : '1 1 0', 
                height: outputListHeight ? `${outputListHeight}px` : undefined,
                minHeight: '100px',
              } : {})
            }}
          >
            {/* Resize Handle - mobile only */}
            <div
              data-resize-handle
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const scrollableArea = scrollableAreaRef.current;
                const container = outputContainerRef.current;
                
                if (scrollableArea && container && e.touches[0]) {
                  const computedHeight = scrollableArea.offsetHeight || scrollableArea.clientHeight;
                  
                  const parentGridContainer = container.parentElement as HTMLElement;
                  const gridRect = parentGridContainer?.getBoundingClientRect();
                  const maxHeight = gridRect ? Math.max(gridRect.height * 0.9, 300) : window.innerHeight * 0.8;
                  
                  const containerRect = container.getBoundingClientRect();
                  resizeStartContainerTopRef.current = containerRect.top;
                  
                  setResizeStartHeight(computedHeight);
                  setResizeMaxHeight(maxHeight);
                  setResizeStartY(e.touches[0].clientY);
                  setResizePreviewHeight(computedHeight);
                  resizePreviewHeightRef.current = computedHeight;
                  
                  // Lock outline to resize handle position
                  if (e.touches[0]) {
                    const outlineTop = containerRect.top;
                    setResizePreviewTop(outlineTop);
                    outlineTopRef.current = outlineTop;
                    
                    const previewOutline = previewOutlineRef.current;
                    if (previewOutline) {
                      previewOutline.style.top = `${outlineTop}px`;
                      previewOutline.style.left = `${containerRect.left}px`;
                      previewOutline.style.width = `${containerRect.width}px`;
                      previewOutline.style.display = 'block';
                    }
                  }
                  
                  setIsTouchResizing(true);
                }
              }}
              className="md:hidden h-2 cursor-row-resize transition-colors flex items-center justify-center group relative z-20"
              style={{ touchAction: 'none', paddingTop: '20px', paddingBottom: '20px', marginTop: '-20px', marginBottom: '-10px' }}
            >
            <div className="w-20 h-0.5 mt-1 bg-[var(--foreground-secondary)] rounded-full opacity-50"></div>
            </div>
            
            <div className="flex gap-4 my-2 flex-shrink-0">
              {/* Hide/Show button - mobile only */}
              <button
                onClick={() => setIsOutputListHidden(!isOutputListHidden)}
                className="md:hidden btn-secondary btn-sm cursor-pointer"
                title={isOutputListHidden ? "Show output list" : "Hide output list"}
              >
                {isOutputListHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={copyOutputList}
                className="btn-primary btn-sm cursor-pointer"
                disabled={outputItems.length === 0}
              >
                Copy List
              </button>
              <button
                onClick={clearAll}
                className="btn-danger btn-sm cursor-pointer"
                disabled={outputItems.length === 0}
              >
                Clear All
              </button>
              <button
                onClick={sortOutputItems}
                className="btn-secondary btn-sm cursor-pointer"
                disabled={outputItems.length === 0}
              >
                Sort
              </button>
            </div>
            
            <div 
              ref={scrollableAreaRef}
              data-scrollable-area
              className="overflow-y-auto md:flex-1"
              style={{ 
                ...(outputListHeight ? {
                  '--custom-height': `${outputListHeight}px`,
                } as React.CSSProperties : {}),
                minHeight: '98px',
              } as React.CSSProperties}
            >
            {outputItems.length === 0 ? (
              <div className="p-8 mt-4 text-center" style={{ color: 'var(--foreground-secondary)' }}>
                <div className="flex justify-center mb-2">
                  <FileText className="w-12 h-12" strokeWidth={1.25} />
                </div>
                <p>Selected items will appear here.</p>
              </div>
              ) : (
                <div className="space-y-6">
                  {outputItemsByTitle.map(({ titleName, items }) => (
                    <div key={titleName} className="mb-0">
                      <h3 className="title-header pt-3">{titleName}</h3>
                      <div className="space-y-0">
                        {items.map(({ item, count }) => (
                          <div key={item.id} className="item">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="item-name text-sm opacity-80">
                                {count === 1 ? item.name : `${count} ${item.name}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                                {count}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="btn-danger btn-sm cursor-pointer"
                              >
                                -
                              </button>
                              <button
                                onClick={() => addItem(item.id)}
                                className="btn-success btn-sm cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Show button - mobile only when hidden */}
      {isOutputListHidden && (
        <button
          onClick={() => setIsOutputListHidden(false)}
          className="md:hidden fixed bottom-4 left-4 z-40 cursor-pointer transition-opacity hover:opacity-100 rounded-xl px-2 py-1"
          style={{ 
            backgroundColor: 'var(--foreground)',
            opacity: 0.3,
            color: 'var(--background)'
          }}
          title="Show output list"
        >
          <Eye className="w-6 h-6" />
        </button>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background)] shadow-xl w-full max-w-md overflow-hidden flex flex-col rounded-lg border border-[var(--borders)]">
            <div className="p-6 border-b border-[var(--borders)]">
              <h2 className="text-xl pb-2 font-bold text-[var(--foreground)]">Clear All Items?</h2>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                Are you sure you want to clear the list? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[var(--borders)]">
              <p className="text-xs pr-6 text-[var(--foreground-secondary)]">
                 Don't want to see this? Configure in settings.
              </p>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={performClearAll}
                className="btn-danger btn-sm cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-8">
          <div className="bg-[var(--background)] shadow-xl w-full h-full md:h-[90vh] md:max-w-4xl overflow-hidden flex flex-col rounded-lg md:rounded-lg">
            <div className="p-6 border-b border-[var(--borders)]">
              <h2 className="text-xl py-2 font-bold text-[var(--foreground)]">Settings</h2>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                Configure the list here. Each title should be on its own line, followed by its items, with titles separated by blank lines.
              </p>
            </div>
            
            <div className="flex-1 p-6 flex flex-col">
              <textarea
                value={customItems || DEFAULT_PLACEHOLDER_TEXT}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomItems(value);
                  saveCustomItemsText(value);
                }}
                className="flex-1 w-full p-3 border border-[var(--borders)] rounded-lg bg-[var(--background)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="px-6 pb-6 border-b border-[var(--borders)] space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontAskClearAgain}
                  onChange={(e) => {
                    setDontAskClearAgain(e.target.checked);
                    saveDontAskClearAgain(e.target.checked);
                  }}
                  className="w-4 h-4 cursor-pointer rounded"
                />
                <span className="text-[13px] text-[var(--foreground-secondary)]">Do not ask again when clearing the list</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontAskSortAgain}
                  onChange={(e) => {
                    setDontAskSortAgain(e.target.checked);
                    saveDontAskSortAgain(e.target.checked);
                  }}
                  className="w-4 h-4 cursor-pointer rounded"
                />
                <span className="text-[13px] text-[var(--foreground-secondary)]">Do not ask again when sorting the list</span>
              </label>
            </div>
            
            <div className="flex justify-between items-center p-6 border-t border-[var(--borders)]">
              <button
                onClick={sortInputItems}
                className="btn-secondary btn-sm cursor-pointer"
              >
                Sort
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary btn-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportItems}
                  className="btn-primary btn-sm cursor-pointer"
                >
                  Import Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Confirmation Modal */}
      {showSortConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background)] shadow-xl w-full max-w-md overflow-hidden flex flex-col rounded-lg border border-[var(--borders)]">
            <div className="p-6 border-b border-[var(--borders)]">
              <h2 className="text-xl pb-2 font-bold text-[var(--foreground)]">Sort your list?</h2>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                This will sort all items within each title alphabetically. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[var(--borders)]">
              <p className="text-xs pr-6 text-[var(--foreground-secondary)]">
                 Don't want to see this? Configure in settings.
              </p>
              <button
                onClick={() => {
                  setShowSortConfirm(false);
                  setSortConfirmCallback(null);
                }}
                className="btn-secondary btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (sortConfirmCallback) {
                    sortConfirmCallback();
                  }
                  setShowSortConfirm(false);
                  setSortConfirmCallback(null);
                }}
                className="btn-primary btn-sm cursor-pointer"
              >
                Sort
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Resize Preview Outline - rendered via portal to avoid container constraints */}
      {typeof window !== 'undefined' && isTouchResizing && resizePreviewTop !== null && createPortal(
        <div
          ref={previewOutlineRef}
          className="fixed left-0 right-0 border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-50 md:hidden"
          style={{
            top: `${resizePreviewTop}px`,
            height: '3px',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
          }}
        />,
        document.body
      )}
    </div>
  );
}