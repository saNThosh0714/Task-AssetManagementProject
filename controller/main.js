const express = require('express');
const router = express.Router();
const sequelize = require("../db");

const Tables = require("../models/Tables");

// get employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await Tables.Employees.findAll();
        const Asset = await Tables.Asset.findAll({
            where: sequelize.literal(`COALESCE("Asset"."EmpID", '0') = '0' AND "Asset"."isScrap" = false`),
            include: [
                {
                    model: Tables.AssetCategory,
                    as: 'AssetCategoryDetails',
                    attributes: ['Category']
                },
                {
                    model: Tables.Branch,
                    as: 'BranchDetails',
                    attributes: ['Branchname']
                },
                {
                    model: Tables.Employees,
                    as: 'EmployeeDetails',
                    attributes: ['EmpName']
                }
            ], raw: true
        });
        res.render('employees', { employees, Asset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user ' + err.message);
    }
});

// Add employee
router.post('/employees/add', async (req, res) => {
    try {
        console.log(req.body);
        await Tables.Employees.create(req.body);
        res.redirect('/main/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Inserting employee ' + err.message);
    }
});

// Update employee
router.post('/employees/edit', async (req, res) => {
    const { EmpID, EmpName, EmpMobile, EmpEmail } = req.body;

    try {
        await Tables.Employees.update({ EmpName, EmpMobile, EmpEmail }, { where: { EmpID } });
        res.redirect('/main/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating employee ' + err.message);
    }
});

// active employee
router.post('/employees/toggle-status', async (req, res) => {
    const { EmpID, status } = req.body;
    const newStatus = status === 'active' ? false : true;  // Toggle the status

    try {
        const GetAsset = await Tables.Asset.findAll({
            where: { EmpID }
        });
        if (GetAsset.length > 0 && !newStatus) {
            return res.status(400).json({
                message: 'Employee is having Asset in Hand, please return it to inactivate the employee.'
            });
        } else {
            await Tables.Employees.update({ isActive: newStatus }, { where: { EmpID } });
            res.send({ success: true });
        }
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).send('Error updating status: ', err);
    }
});

// get assets
router.get('/assets', async (req, res) => {
    try {
        const assets = await Tables.Asset.findAll({
            include: [
                {
                    model: Tables.AssetCategory,
                    as: 'AssetCategoryDetails',
                    attributes: ['Category']
                },
                {
                    model: Tables.Branch,
                    as: 'BranchDetails',
                    attributes: ['Branchname']
                },
                {
                    model: Tables.Employees,
                    as: 'EmployeeDetails',
                    attributes: ['EmpName']
                }
            ], raw: true
        });
        const AssetCategory = await Tables.AssetCategory.findAll();
        const Branch = await Tables.Branch.findAll();
        const employees = await Tables.Employees.findAll({ where: { isActive: true } });
        console.log("assets", assets);
        res.render('assets', { assets, AssetCategory, Branch, employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user ' + err.message);
    }
});

// get employeeview
router.get('/employeeAssetview', async (req, res) => {
    try {
        const assets = await Tables.Asset.findAll({
            where: {
                EmpID: req.query.empId // or req.body.empId based on your request
            },
            include: [
                {
                    model: Tables.AssetCategory,
                    as: 'AssetCategoryDetails',
                    attributes: ['Category']
                },
                {
                    model: Tables.Branch,
                    as: 'BranchDetails',
                    attributes: ['Branchname']
                },
                {
                    model: Tables.Employees,
                    as: 'EmployeeDetails',
                    attributes: ['EmpName']
                }
            ], raw: true
        });
        console.log("assets", assets);
        res.json(assets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user ' + err.message);
    }
});

// get assetview
router.get('/assetview', async (req, res) => {
    try {
        const AssetHistory = await Tables.AssetHistory.findAll({
            where: {
                AssetSerial: req.query.AssetSerial
            },
            include: {
                model: Tables.Employees,
                as: 'HistEmployeeDetails',
                attributes: ['EmpName']
            }, raw: true
        });
        console.log("AssetHistory", AssetHistory);
        res.json(AssetHistory);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user ' + err.message);
    }
});

// Add assets
router.post('/assets/add', async (req, res) => {
    try {
        console.log(req.body);
        await Tables.Asset.create(req.body);
        res.redirect('/main/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Inserting employee ' + err.message);
    }
});

// Add asset category
router.post('/assetcategory/add', async (req, res) => {
    try {
        console.log(req.body);
        await Tables.AssetCategory.create(req.body);
        res.redirect('/main/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Inserting employee ' + err.message);
    }
});

// Add Branch
router.post('/branch/add', async (req, res) => {
    try {
        console.log(req.body);
        await Tables.Branch.create(req.body);
        res.redirect('/main/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error Inserting employee ' + err.message);
    }
});

// Update assets
router.post('/assets/edit', async (req, res) => {
    const { AssetSerial,
        AssetName,
        Make,
        Model,
        PurchaseAmount,
        PurchaseDate, AssetCategoryId,
        BranchId } = req.body;
    console.log(req.body);

    try {
        await Tables.Asset.update({
            AssetName,
            Make,
            Model,
            PurchaseAmount,
            PurchaseDate, AssetCategoryId,
            BranchId
        }, { where: { AssetSerial } });
        let AssetTable = await Tables.Asset.findAll({ where: { AssetSerial } })
        await Tables.AssetHistory.create({ AssetSerial: AssetSerial, AssetStatus: 'is Updated', EmpID: AssetTable[0]['EmpID'], AssetRemark: 'Assset Updated' });
        res.redirect('/main/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating employee ' + err.message);
    }
});

// Assign assets
router.post('/assignasset', async (req, res) => {
    const { AssetSerial, EmpID } = req.body;
    console.log(req.body);
    try {
        await Tables.Asset.update({ EmpID }, { where: { AssetSerial } });
        await Tables.AssetHistory.create({ AssetSerial: AssetSerial, AssetStatus: 'is Issued', EmpID: EmpID, AssetRemark: 'Assset Issued To the Employee' });
        res.redirect('/main/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating employee ' + err.message);
    }
});

// Assign assets
router.post('/assignemployee', async (req, res) => {
    const { AssetSerial, EmpID } = req.body;
    console.log(req.body);
    try {
        await Tables.Asset.update({ EmpID }, { where: { AssetSerial } });
        await Tables.AssetHistory.create({ AssetSerial: AssetSerial, AssetStatus: 'is Issued', EmpID: EmpID, AssetRemark: 'Assset Issued To the Employee' });
        res.redirect('/main/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating employee ' + err.message);
    }
});

// isScrap assets
router.post('/assets/toggle-status', async (req, res) => {
    let { AssetSerial, isScrap, ScrapReason } = req.body;
    isScrap = isScrap ? false : true;  // Toggle the status
    ScrapReason = isScrap ? ScrapReason : '';
    console.log("req.body", req.body);
    try {
        await Tables.Asset.update({ isScrap, ScrapReason }, { where: { AssetSerial } });
        let AssetTable = await Tables.Asset.findAll({ where: { AssetSerial } })
        await Tables.AssetHistory.create({ AssetSerial: AssetSerial, AssetStatus: 'is Scrap', EmpID: AssetTable[0]['EmpID'], AssetRemark: ScrapReason });
        res.redirect('/main/assets');
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).send('Error updating status');
    }
});

// Return Asset
router.post('/ReturnAsset', async (req, res) => {
    console.log("req.body", req.body);
    let { AssetSerial, ReturnReason } = req.body;
    try {
        await Tables.Asset.update({ EmpID: null }, { where: { AssetSerial } });
        let AssetTable = await Tables.Asset.findAll({ where: { AssetSerial } })
        console.log("AssetTable", AssetTable);
        await Tables.AssetHistory.create({ AssetSerial: AssetSerial, AssetStatus: 'is Returned', EmpID: AssetTable[0]['EmpID'], AssetRemark: ReturnReason });
        res.json({ status: true });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).send('Error updating status: ' + err);
    }
});

// get BirdseyeDetails
router.get('/BirdseyeDetails', async (req, res) => {
    try {
        const assets = await Tables.Asset.findAll();
        const AssetCategory = await Tables.AssetCategory.findAll();
        // const Branch = await Tables.Branch.findAll();
        const Branch = await Tables.Branch.findAll({
            attributes: [
                'Branch.DocEntry',
                'Branch.Branchname',
                [sequelize.fn('COUNT', sequelize.col('Assets.AssetSerial')), 'Tnoofasset'],
                [
                    sequelize.fn('COUNT', sequelize.literal(`CASE WHEN COALESCE("Assets"."EmpID",'0') = '0' and "Assets"."isScrap" = false THEN 1 END`)),
                    'Tnoofavailasset'
                ],
                [
                    sequelize.fn('COUNT', sequelize.literal(`CASE WHEN COALESCE("Assets"."EmpID",'0') <> '0' THEN 1 END`)),
                    'Tnoofissuedasset'
                ],
                [
                    sequelize.fn('COUNT', sequelize.literal('CASE WHEN "Assets"."isScrap" = true THEN 1 END')),
                    'TnoofScrapasset'
                ]
            ],
            include: [{
                model: Tables.Asset,
                as: 'Assets',
                attributes: []
            }],
            group: ['Branch.Branchname', 'Branch.DocEntry'],
            raw: true
        });
        let totalAssets = 0;
        let totalScrapAssets = 0;
        let totalAvailAssets = 0;
        let totalIssuedAssets = 0;

        Branch.forEach(branch => {
            totalAssets += parseInt(branch.Tnoofasset || 0);
            totalScrapAssets += parseInt(branch.TnoofScrapasset || 0);
            totalAvailAssets += parseInt(branch.Tnoofavailasset || 0);
            totalIssuedAssets += parseInt(branch.Tnoofissuedasset || 0);
        });
        console.log("Branch", Branch);
        res.render('branchview', { assets, AssetCategory, Branch, totalAssets, totalScrapAssets, totalAvailAssets, totalIssuedAssets });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user ' + err.message);
    }
});

module.exports = router;
