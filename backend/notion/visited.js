const { notion, VISITED_DATABASE_ID, LANDMARKS_DATABASE_ID } = require('./client');
const { v4: uuidv4 } = require('uuid');
const { getLandmark } = require('./landmarks');

// Get all visited landmarks
async function getVisitedLandmarks() {
  try {
    const response = await notion.databases.query({
      database_id: VISITED_DATABASE_ID,
      sorts: [
        {
          property: 'Visited Date',
          direction: 'descending',
        },
      ],
    });

    // Process each result to include the landmark data
    const visitedLandmarks = [];
    for (const page of response.results) {
      const visitData = formatVisitedData(page);
      
      // Get the associated landmark data
      try {
        const landmark = await getLandmark(visitData.landmark_id);
        visitData.landmark_id = landmark; // Replace ID with full landmark object for consistency with MongoDB approach
      } catch (error) {
        console.error(`Error fetching associated landmark for visit ${visitData._id}:`, error);
        // Continue even if landmark not found
      }
      
      visitedLandmarks.push(visitData);
    }

    return visitedLandmarks;
  } catch (error) {
    console.error('Error fetching visited landmarks from Notion:', error);
    throw error;
  }
}

// Get visited landmarks for a specific landmark
async function getVisitedLandmarksByLandmarkId(landmarkId) {
  try {
    const response = await notion.databases.query({
      database_id: VISITED_DATABASE_ID,
      filter: {
        property: 'Landmark ID',
        rich_text: {
          equals: landmarkId,
        },
      },
      sorts: [
        {
          property: 'Visited Date',
          direction: 'descending',
        },
      ],
    });

    // Process each result to include the landmark data
    const visitedLandmarks = [];
    for (const page of response.results) {
      const visitData = formatVisitedData(page);
      
      // Get the associated landmark data
      try {
        const landmark = await getLandmark(visitData.landmark_id);
        visitData.landmark_id = landmark; // Replace ID with full landmark object
      } catch (error) {
        console.error(`Error fetching associated landmark for visit ${visitData._id}:`, error);
        // Continue even if landmark not found
      }
      
      visitedLandmarks.push(visitData);
    }

    return visitedLandmarks;
  } catch (error) {
    console.error(`Error fetching visited landmarks for landmark ${landmarkId} from Notion:`, error);
    throw error;
  }
}

// Create a new visited landmark record
async function createVisitedLandmark(visitData) {
  try {
    const { landmark_id, visitor_name, notes, visited_date } = visitData;
    
    // Verify the landmark exists
    try {
      await getLandmark(landmark_id);
    } catch (error) {
      throw new Error('Landmark not found');
    }
    
    const response = await notion.pages.create({
      parent: {
        database_id: VISITED_DATABASE_ID,
      },
      properties: {
        'Visitor Name': {
          title: [
            {
              text: {
                content: visitor_name || 'Anonymous',
              },
            },
          ],
        },
        'Landmark ID': {
          rich_text: [
            {
              text: {
                content: landmark_id,
              },
            },
          ],
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
        'Visited Date': {
          date: {
            start: visited_date || new Date().toISOString(),
          },
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

    const visitedData = formatVisitedData(response);
    
    // Get the associated landmark data for the response
    try {
      const landmark = await getLandmark(landmark_id);
      visitedData.landmark_id = landmark; // Replace ID with full landmark object
    } catch (error) {
      console.error(`Error fetching associated landmark for visit ${visitedData._id}:`, error);
    }

    return visitedData;
  } catch (error) {
    console.error('Error creating visited landmark in Notion:', error);
    throw error;
  }
}

// Update a visited landmark record
async function updateVisitedLandmark(id, visitData) {
  try {
    const { visitor_name, notes, visited_date } = visitData;
    
    const properties = {};
    
    if (visitor_name) {
      properties['Visitor Name'] = {
        title: [
          {
            text: {
              content: visitor_name,
            },
          },
        ],
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
    
    if (visited_date) {
      properties['Visited Date'] = {
        date: {
          start: visited_date,
        },
      };
    }
    
    const response = await notion.pages.update({
      page_id: id,
      properties,
    });

    const visitedData = formatVisitedData(response);
    
    // Get the associated landmark data for the response
    try {
      const landmarkId = response.properties['Landmark ID'].rich_text[0].plain_text;
      const landmark = await getLandmark(landmarkId);
      visitedData.landmark_id = landmark; // Replace ID with full landmark object
    } catch (error) {
      console.error(`Error fetching associated landmark for visit ${id}:`, error);
    }
    
    return visitedData;
  } catch (error) {
    console.error(`Error updating visited landmark ${id} in Notion:`, error);
    throw error;
  }
}

// Delete a visited landmark record (archive in Notion)
async function deleteVisitedLandmark(id) {
  try {
    const response = await notion.pages.update({
      page_id: id,
      archived: true,
    });

    return { message: 'Visited landmark record deleted successfully' };
  } catch (error) {
    console.error(`Error deleting visited landmark ${id} in Notion:`, error);
    throw error;
  }
}

// Helper function to format visited landmark data from Notion page
function formatVisitedData(page) {
  const properties = page.properties;
  
  // Extract properties from Notion page
  const visitorName = properties['Visitor Name']?.title?.[0]?.plain_text || '';
  const landmarkId = properties['Landmark ID']?.rich_text?.[0]?.plain_text || '';
  const notes = properties['Notes']?.rich_text?.[0]?.plain_text || '';
  const visitedDate = properties['Visited Date']?.date?.start || '';
  const customId = properties['ID']?.rich_text?.[0]?.plain_text || '';
  
  return {
    _id: page.id,
    id: customId,
    landmark_id: landmarkId,
    visitor_name: visitorName,
    notes,
    visited_date: visitedDate,
  };
}

module.exports = {
  getVisitedLandmarks,
  getVisitedLandmarksByLandmarkId,
  createVisitedLandmark,
  updateVisitedLandmark,
  deleteVisitedLandmark,
};