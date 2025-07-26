import { generateToken } from '../Utils/jwt.js';
import { LoginRecord } from '../models/UserLoginSchema.js'; // Adjust path as neededLoginRecord from '../models/UserLoginSchema.js';

const LoginHistoryStore = async (req, res) => {
    try{
        // Verify content-type is application/json
        if (!req.is('application/json')) {
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }

        // Check if body exists and is valid JSON
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
        }

        const { hhNumber, name, type } = req.body;
        
        // Validate required fields
        if (!hhNumber || !name || !type) {
            return res.status(400).json({ error: 'Missing required fields (hhNumber, name, type)' });
        }

        console.log("Received login record:", req.body);

        // Check if record exists
        const existingRecord = await LoginRecord.findOne({ hhNumber });
        if (existingRecord) {
            const token = generateToken(existingRecord);
            return res.status(200).json({ 
                message: 'Login record already exists',
                token: token,
                record: existingRecord
            });
        }

        // Create new record
        const newRecord = new LoginRecord({ hhNumber, name, type });
        await newRecord.save();

        // Generate JWT token
        const token = generateToken(newRecord);

        res.status(201).json({ 
            message: 'Login record saved', 
            record: newRecord,
            token: token 
        });
    } catch (err) {
        console.error("Error saving login record:", err);
        
        // Handle JSON parsing errors specifically
        if (err instanceof SyntaxError) {
            return res.status(400).json({ error: 'Invalid JSON format in request body' });
        }
        
        res.status(500).json({ error: 'Failed to save login record', details: err.message });
    }
};

const LoginHisoryGet = async (req, res) => {
    try {
        const records = await LoginRecord.find({});
        if(!records ) {
            return res.status(404).json({ error: 'No login history found' });
        }
        res.status(200).json(records);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch login history' });
    }
};

export { LoginHistoryStore, LoginHisoryGet };