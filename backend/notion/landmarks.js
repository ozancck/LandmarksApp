const { notion, LANDMARKS_DATABASE_ID } = require('./client');
const { v4: uuidv4 } = require('uuid');

// Get all landmarks
async function getLandmarks() {
  try {
    const response = await notion.databases.query({
      database_id: LANDMARKS_DATABASE_ID,
      sorts: [
        {
          property: 'Name',
          direction: 'ascending',
        },
      ],
    });

    return response.results.map(page => formatLandmarkData(page));
  } catch (error) {
    console.error('Error fetching landmarks from Notion:', error);
    throw error;
  }
}

// Get a specific landmark
async function getLandmark(id) {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return formatLandmarkData(page);
  } catch (error) {
    console.error(`Error fetching landmark ${id} from Notion:`, error);
    throw error;
  }
}

// Create a new landmark
async function createLandmark(landmarkData) {
  try {
    const { name, location, description, category, notes } = landmarkData;
    
    const response = await notion.pages.create({
      parent: {
        database_id: LANDMARKS_DATABASE_ID,
      },
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: name || 'Unnamed Landmark',
              },
            },
          ],
        },
        'Latitude': {
          number: parseFloat(location.latitude),
        },
        'Longitude': {
          number: parseFloat(location.longitude),
        },
        'Description': {
          rich_text: [
            {
              text: {
                content: description || '',
              },
            },
          ],
        },
        'Category': {
          select: {
            name: category || 'other',
          },
        },
        'Notes': {
          rich_text: [
            {
              text: {
                content: notes || '',
              },
            },
          ],
        },
        'ID': {
          rich_text: [
            {
              text: {
                content: uuidv4(),
              },
            },
          ],
        },
      },
    });

    return formatLandmarkData(response);
  } catch (error) {
    console.error('Error creating landmark in Notion:', error);
    throw error;
  }
}

// Update a landmark
async function updateLandmark(id, landmarkData) {
  try {
    const { name, location, description, category, notes } = landmarkData;
    
    const properties = {};
    
    if (name) {
      properties['Name'] = {
        title: [
          {
            text: {
              content: name,
            },
          },
        ],
      };
    }
    
    if (location) {
      if (location.latitude !== undefined) {
        properties['Latitude'] = {
          number: parseFloat(location.latitude),
        };
      }
      
      if (location.longitude !== undefined) {
        properties['Longitude'] = {
          number: parseFloat(location.longitude),
        };
      }
    }
    
    if (description !== undefined) {
      properties['Description'] = {
        rich_text: [
          {
            text: {
              content: description,
            },
          },
        ],
      };
    }
    
    if (category) {
      properties['Category'] = {
        select: {
          name: category,
        },
      };
    }
    
    if (notes !== undefined) {
      properties['Notes'] = {
        rich_text: [
          {
            text: {
              content: notes,
            },
          },
        ],
      };
    }
    
    const response = await notion.pages.update({
      page_id: id,
      properties,
    });

    return formatLandmarkData(response);
  } catch (error) {
    console.error(`Error updating landmark ${id} in Notion:`, error);
    throw error;
  }
}

// Delete a landmark (archive in Notion)
async function deleteLandmark(id) {
  try {
    const response = await notion.pages.update({
      page_id: id,
      archived: true,
    });

    return { message: 'Landmark deleted successfully' };
  } catch (error) {
    console.error(`Error deleting landmark ${id} in Notion:`, error);
    throw error;
  }
}

// Helper function to format landmark data from Notion page
function formatLandmarkData(page) {
  const properties = page.properties;
  
  // Extract properties from Notion page
  const name = properties['Name']?.title?.[0]?.plain_text || '';
  const latitude = properties['Latitude']?.number || 0;
  const longitude = properties['Longitude']?.number || 0;
  const description = properties['Description']?.rich_text?.[0]?.plain_text || '';
  const category = properties['Category']?.select?.name || 'other';
  const notes = properties['Notes']?.rich_text?.[0]?.plain_text || '';
  const customId = properties['ID']?.rich_text?.[0]?.plain_text || '';
  
  return {
    _id: page.id,
    id: customId,
    name,
    location: {
      latitude,
      longitude,
    },
    description,
    category,
    notes,
    createdAt: page.created_time,
  };
}

module.exports = {
  getLandmarks,
  getLandmark,
  createLandmark,
  updateLandmark,
  deleteLandmark,
};