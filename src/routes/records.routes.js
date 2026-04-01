const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { listRecordsQuerySchema, createRecordSchema, updateRecordSchema } = require('../validators/recordValidator');
const { listRecords, getRecordById, createRecord, updateRecord, deleteRecord } = require('../services/record.service');
const { AppError } = require('../utils/httpError');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  validate(listRecordsQuerySchema, 'query'),
  authorizePermission('records:read'),
  asyncHandler(async (req, res) => {
    const result = await listRecords(req.query);
    res.status(200).json({ success: true, ...result });
  })
);

router.get(
  '/:id',
  authorizePermission('records:read'),
  asyncHandler(async (req, res) => {
    const record = await getRecordById(req.params.id);

    if (!record) {
      throw new AppError(404, 'Record not found.');
    }

    res.status(200).json({ success: true, data: record });
  })
);

router.post(
  '/',
  authorizePermission('records:write'),
  validate(createRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await createRecord(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Record created successfully.',
      data: record
    });
  })
);

router.patch(
  '/:id',
  authorizePermission('records:write'),
  validate(updateRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await updateRecord(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Record updated successfully.',
      data: record
    });
  })
);

router.delete(
  '/:id',
  authorizePermission('records:write'),
  asyncHandler(async (req, res) => {
    const result = await deleteRecord(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Record deleted successfully.',
      data: result
    });
  })
);

module.exports = router;
