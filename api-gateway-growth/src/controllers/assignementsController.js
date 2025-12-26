const Assignements = require('../models/Assignements');
const CompanyDetails = require('../models/CompanyDetails');

const getAllAsignements = async (req, res) => {
    try {
        const assignements = await Assignements.find({type: 'assignement'})
            .populate('assignedTo', 'firstName lastName')
            .lean();

        const results = await Promise.all(
            assignements.map(async (assignement) => {
                const company = await CompanyDetails.findOne({
                    user: assignement.assignedTo._id,
                }).lean();

                return {
                    id : assignement._id,
                    title: assignement.title,
                    userFullName: `${assignement.assignedTo.firstName} ${assignement.assignedTo.lastName}`,
                    companyName: company ? company.companyName : '',
                    status: assignement.status,
                    sectorOfActivity : company ? company.sectorOfActivity : '',
                    deadline: assignement.deadline,
                    createdAt: assignement.createdAt,
                    type: assignement.type,
                };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error('Error retrieving assignments:', error);
        res.status(500).json({ message: 'Error retrieving assignments', error: error.message });
    }
};

const getAllAsignementsTemplates = async (req, res) => {
    try {
        const assignements = await Assignements.find({ type: 'template' })
            .lean();

        const results = await Promise.all(
            assignements.map(async (assignement) => {
                return {
                    id : assignement._id,
                    title: assignement.title,
                    status: assignement.status,
                    deadline: assignement.deadline,
                    createdAt: assignement.createdAt,
                    type: assignement.type,
                };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error('Error retrieving assignments:', error);
        res.status(500).json({ message: 'Error retrieving assignments', error: error.message });
    }
};


const getCountAssignement = async (req, res) => {
    try {
        const finishedCount = await Assignements.countDocuments({ status: 'finished' ,type: 'assignement' });
        const inProgressCount = await Assignements.countDocuments({ status: 'in progress', type: 'assignement'});

        res.status(200).json({
            finished: finishedCount,
            inProgress: inProgressCount
        });
    } catch (error) {
        console.error('Error retrieving assignment count:', error);
        res.status(500).json({ message: 'Error retrieving assignment count', error: error.message });
    }
};

const getAllAssignementsByUserId = async (req, res) => {
    try{
        const userId  = req.user.id
        const assignements = await Assignements.find({ assignedTo: userId })
            .populate('assignedTo', 'firstName lastName')
            .lean();

        res.status(200).json(assignements);
    } catch (error) {
        console.error('Error retrieving assignments for user:', error);
        res.status(500).json({ message: 'Error retrieving assignments for user', error: error.message });
    }
};

const getCountAssignementsByUserId = async (req, res) => {
    try {
        const userId = req.user.id 

        // Count assignments for the given userId
        const finishedCount = await Assignements.countDocuments({ assignedTo: userId, status: 'finished' });
        const inProgressCount = await Assignements.countDocuments({ assignedTo: userId, status: 'in progress' });

        res.status(200).json({
            finished: finishedCount,
            inProgress: inProgressCount
        });
    } catch (error) {
        console.error('Error retrieving assignment count for user:', error);
        res.status(500).json({ message: 'Error retrieving assignment count for user', error: error.message });
    }
}

const getAllAsignementsByClientId = async (req, res) => {
    try {
        const user_id = req.params.id

        const assignements = await Assignements.find({ assignedTo: user_id })
            .populate('assignedTo', 'firstName lastName')
            .lean();

        const results = await Promise.all(
            assignements.map(async (assignement) => {
                const company = await CompanyDetails.findOne({
                    user: assignement.assignedTo._id,
                }).lean();

                return {
                    id : assignement._id,
                    title: assignement.title,
                    userFullName: `${assignement.assignedTo.firstName} ${assignement.assignedTo.lastName}`,
                    companyName: company ? company.companyName : '',
                    status: assignement.status,
                    sectorOfActivity : company ? company.sectorOfActivity : '',
                    deadline: assignement.deadline,
                    createdAt: assignement.createdAt,
                };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error('Error retrieving assignments:', error);
        res.status(500).json({ message: 'Error retrieving assignments', error: error.message });
    }
};

const createAssignement = async (req, res) => {
    try {
  
      const { title, description, status, deadline, assignedTo, questions } = req.body;
  
      let parsedQuestions;
      try {
        parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
      } catch (err) {
        console.error('Error parsing questions:', err);
        parsedQuestions = [];
      }
  
      // Process files for each question if they exist
      if (parsedQuestions && Array.isArray(parsedQuestions)) {
        parsedQuestions = parsedQuestions.map((question, qIndex) => {
          const processedQuestion = { ...question };
          
          // Initialize resource arrays if they don't exist
          processedQuestion.fileresources = processedQuestion.fileresources || [];
          processedQuestion.urlresources = processedQuestion.urlresources || [];

          return processedQuestion;
        });
        
        // Now process all files and match them to questions
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            // Extract question index from field name using regex
            // Field names should be like: questions[0].fileresources
            const match = file.fieldname.match(/questions\[(\d+)\]\.fileresources/);
            if (match && match[1]) {
              const questionIndex = parseInt(match[1], 10);
              if (parsedQuestions[questionIndex]) {
                // Add filename to the question's fileresources array
                parsedQuestions[questionIndex].fileresources.push(file.filename);
              }
            }
          });
        }
      }
  
      // Validate required fields
      if (!title || !description || !assignedTo) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const newAssignement = new Assignements({
        title,
        description,
        questions: parsedQuestions || [],
        status: status || 'in progress',
        deadline: deadline ? new Date(deadline) : undefined,
        owner: req.user.id,
        assignedTo,
      });
  
      await newAssignement.save();
      res.status(201).json(newAssignement);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ message: 'Error creating assignment', error: error.message });
    }
};

const createAssignementTemplate = async (req, res) => {
    try {
  
      const { title, description, status , questions } = req.body;
  
      let parsedQuestions;
      try {
        parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
      } catch (err) {
        console.error('Error parsing questions:', err);
        parsedQuestions = [];
      }
  
      // Process files for each question if they exist
      if (parsedQuestions && Array.isArray(parsedQuestions)) {
        parsedQuestions = parsedQuestions.map((question, qIndex) => {
          const processedQuestion = { ...question };
          
          // Initialize resource arrays if they don't exist
          processedQuestion.fileresources = processedQuestion.fileresources || [];
          processedQuestion.urlresources = processedQuestion.urlresources || [];

          return processedQuestion;
        });
        
        // Now process all files and match them to questions
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            // Extract question index from field name using regex
            // Field names should be like: questions[0].fileresources
            const match = file.fieldname.match(/questions\[(\d+)\]\.fileresources/);
            if (match && match[1]) {
              const questionIndex = parseInt(match[1], 10);
              if (parsedQuestions[questionIndex]) {
                // Add filename to the question's fileresources array
                parsedQuestions[questionIndex].fileresources.push(file.filename);
              }
            }
          });
        }
      }
  
      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const newAssignement = new Assignements({
        title,
        description,
        questions: parsedQuestions || [],
        status: status || 'in progress',
        owner: req.user.id,
        type: 'template',
      });
  
      await newAssignement.save();
      res.status(201).json(newAssignement);
    } catch (error) {
      console.error('Error creating assignment template:', error);
      res.status(500).json({ message: 'Error creating assignment template', error: error.message });
    }
};

const updateAsignement = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, deadline, assignedTo, questions } = req.body;

    try {
        // Parse questions if sent as a JSON string
        let parsedQuestions;
        try {
          parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
        } catch (err) {
          console.error('Error parsing questions:', err);
          return res.status(400).json({ message: 'Invalid questions format' });
        }

        // Process files for each question if they exist
        if (parsedQuestions && Array.isArray(parsedQuestions)) {
            // First, keep existing fileresources for each question
            parsedQuestions = parsedQuestions.map((question) => ({
                ...question,
                fileresources: question.fileresources || [],
                urlresources: question.urlresources || []
            }));
            
            // Now process all uploaded files and match them to questions
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    const match = file.fieldname.match(/questions\[(\d+)\]\.fileresources/);
                    if (match && match[1]) {
                        const questionIndex = parseInt(match[1], 10);
                        if (parsedQuestions[questionIndex]) {
                            parsedQuestions[questionIndex].fileresources.push(file.filename);
                        }
                    }
                });
            }
        }

        // Build update data; if a field is not provided, it won't be updated.
        const updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(deadline && { deadline: new Date(deadline) }),
            ...(assignedTo && { assignedTo }),
            // Only update questions if provided
            ...(parsedQuestions && { questions: parsedQuestions })
        };

        const updatedAssignement = await Assignements.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedAssignement) {
            return res.status(404).json({ message: 'Assignement not found' });
        }

        res.status(200).json(updatedAssignement);
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
}

const updateAssignementTemplate = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, questions } = req.body;

    try {
        // Parse questions if sent as a JSON string
        let parsedQuestions;
        try {
          parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
        } catch (err) {
          console.error('Error parsing questions:', err);
          return res.status(400).json({ message: 'Invalid questions format' });
        }

        // Process files for each question if they exist
        if (parsedQuestions && Array.isArray(parsedQuestions)) {
            // First, keep existing fileresources for each question
            parsedQuestions = parsedQuestions.map((question) => ({
                ...question,
                fileresources: question.fileresources || [],
                urlresources: question.urlresources || []
            }));
            
            // Now process all uploaded files and match them to questions
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    const match = file.fieldname.match(/questions\[(\d+)\]\.fileresources/);
                    if (match && match[1]) {
                        const questionIndex = parseInt(match[1], 10);
                        if (parsedQuestions[questionIndex]) {
                            parsedQuestions[questionIndex].fileresources.push(file.filename);
                        }
                    }
                });
            }
        }

        // Build update data; if a field is not provided, it won't be updated.
        const updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(parsedQuestions && { questions: parsedQuestions })
        };

        const updatedAssignement = await Assignements.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedAssignement) {
            return res.status(404).json({ message: 'Assignement Template not found' });
        }

        res.status(200).json(updatedAssignement);
    } catch (error) {
        console.error('Error updating assignment Template :', error);
        res.status(500).json({ message: 'Error updating assignment Template', error: error.message });
    }
}

const deleteAsignement = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAssignement = await Assignements.findByIdAndDelete(id);
        if (!deletedAssignement) {
            return res.status(404).json({ message: 'Assignement not found' });
        }
        res.status(200).json({ message: 'Assignement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting assignement', error });
    }
};

const getAsignementById = async (req, res) => {
    const { id } = req.params;
    try {
        const assignement = await Assignements.findById(id);
        if (!assignement) {
            return res.status(404).json({ message: 'Assignement not found' });
        }
        res.status(200).json(assignement);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignement', error });
    }
}

const getAsignementTemplateById = async (req, res) => {
    const { id } = req.params;
    try {
        const assignement = await Assignements.findById(id).where({ type: 'template' });
        if (!assignement) {
            return res.status(404).json({ message: 'Assignement Template not found' });
        }
        res.status(200).json(assignement);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignement Template', error });
    }
}

const handleAssigneTemplate = async (req, res) => {
    const { userId , templateId , deadline } = req.body;

    try {
        const assignement = await Assignements.findById(
            templateId,
        );
        if (!assignement) {
            return res.status(404).json({ message: 'Assignement not found' });
        }
        const newAssignement = new Assignements({
            title: assignement.title,
            description: assignement.description,
            questions: assignement.questions,
            status: 'in progress',
            deadline: deadline ? new Date(deadline) : undefined,
            owner: req.user.id,
            assignedTo: userId,
        });
        await newAssignement.save();
        res.status(200).json(newAssignement);
    } catch (error) {
        console.error('Error handling assignment template:', error);
        res.status(500).json({ message: 'Error handling assignment template', error: error.message });
    }
}

module.exports = {
    getAllAsignements,
    getCountAssignement,
    createAssignement,
    updateAsignement,
    deleteAsignement,
    getAsignementById,
    getAllAssignementsByUserId,
    getCountAssignementsByUserId,
    getAllAsignementsByClientId,
    createAssignementTemplate,
    updateAssignementTemplate,
    getAllAsignementsTemplates,
    handleAssigneTemplate,
    getAsignementTemplateById,
};
