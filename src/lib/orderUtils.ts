import { API_BASE_URL } from './apiConfig';

interface OrderableItem {
  _id: string;
  order: number;
}

/**
 * Reorders items when inserting a new item at a specific order position.
 * If the target order already exists, shifts existing items with order >= targetOrder up by 1.
 * 
 * @param items - Current list of items
 * @param newItemOrder - Order position for the new item
 * @param endpoint - API endpoint for the specific resource (e.g., '/tech-skills')
 * @param token - Authentication token
 * @returns Promise<void>
 */
export const reorderItemsForInsertion = async (
  items: OrderableItem[],
  newItemOrder: number,
  endpoint: string,
  token: string
): Promise<void> => {
  // Filter items that need to be updated (order >= newItemOrder)
  const itemsToUpdate = items.filter(item => item.order >= newItemOrder);
  
  // Sort items by order in descending order to avoid conflicts
  // Process items with higher orders first
  const sortedItems = itemsToUpdate.sort((a, b) => b.order - a.order);
  
  // Update items sequentially to push them down
  for (const item of sortedItems) {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${item._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...item, order: item.order + 1 })
    });
    
    if (!response.ok) {
      console.error(`Failed to update order for item ${item._id}:`, await response.text());
    }
  }
};

/**
 * Reorders items when deleting an item.
 * Shifts items with order > deletedItemOrder down by 1 to fill the gap.
 * 
 * @param items - Current list of items
 * @param deletedItemOrder - Order position of the deleted item
 * @param endpoint - API endpoint for the specific resource (e.g., '/tech-skills')
 * @param token - Authentication token
 * @returns Promise<void>
 */
export const reorderItemsForDeletion = async (
  items: OrderableItem[],
  deletedItemOrder: number,
  endpoint: string,
  token: string
): Promise<void> => {
  // Remove the deleted item and sort remaining items by their original order
  const remainingItems = items.filter(item => item.order !== deletedItemOrder)
    .sort((a, b) => a.order - b.order);
  
  // Reassign contiguous orders starting from 1
  for (let i = 0; i < remainingItems.length; i++) {
    const item = remainingItems[i];
    const newOrder = i + 1;
    
    if (item.order !== newOrder) { // Only update if order actually changed
      const response = await fetch(`${API_BASE_URL}${endpoint}/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, order: newOrder })
      });
      
      if (!response.ok) {
        console.error(`Failed to update order for item ${item._id}:`, await response.text());
      }
    }
  }
};

/**
 * Completely reorders all items to ensure contiguous ordering.
 * 
 * @param items - Current list of items
 * @param endpoint - API endpoint for the specific resource (e.g., '/tech-skills')
 * @param token - Authentication token
 * @returns Promise<void>
 */
export const reorderAllItemsContiguously = async (
  items: OrderableItem[],
  endpoint: string,
  token: string
): Promise<void> => {
  // Sort items by their current order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  
  // Reassign contiguous orders starting from 1
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const newOrder = i + 1;
    
    if (item.order !== newOrder) { // Only update if order actually changed
      const response = await fetch(`${API_BASE_URL}${endpoint}/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, order: newOrder })
      });
      
      if (!response.ok) {
        console.error(`Failed to update order for item ${item._id}:`, await response.text());
      }
    }
  }
};

/**
 * Reorders items when updating an item's order position.
 * Adjusts other items to maintain proper sequence without gaps.
 * 
 * @param items - Current list of items
 * @param itemId - ID of the item being updated
 * @param newOrder - New order position for the item
 * @param endpoint - API endpoint for the specific resource (e.g., '/tech-skills')
 * @param token - Authentication token
 * @returns Promise<void>
 */
export const reorderItemsForUpdate = async (
  items: OrderableItem[],
  itemId: string,
  newOrder: number,
  endpoint: string,
  token: string
): Promise<void> => {
  const currentItem = items.find(item => item._id === itemId);
  if (!currentItem) return;

  const oldOrder = currentItem.order;
  
  if (newOrder === oldOrder) return; // No change needed

  if (newOrder > oldOrder) {
    // Moving down: shift items between oldOrder and newOrder down by 1
    const itemsToShiftDown = items.filter(item => 
      item._id !== itemId && item.order > oldOrder && item.order <= newOrder
    );
    
    // Sort in ascending order to process from highest to lowest
    const sortedDown = itemsToShiftDown.sort((a, b) => b.order - a.order);
    
    for (const item of sortedDown) {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, order: item.order - 1 })
      });
      
      if (!response.ok) {
        console.error(`Failed to update order for item ${item._id}:`, await response.text());
      }
    }
  } else {
    // Moving up: shift items between newOrder and oldOrder up by 1
    const itemsToShiftUp = items.filter(item => 
      item._id !== itemId && item.order >= newOrder && item.order < oldOrder
    );
    
    // Sort in descending order to avoid conflicts
    const sortedUp = itemsToShiftUp.sort((a, b) => b.order - a.order);
    
    for (const item of sortedUp) {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, order: item.order + 1 })
      });
      
      if (!response.ok) {
        console.error(`Failed to update order for item ${item._id}:`, await response.text());
      }
    }
  }
};