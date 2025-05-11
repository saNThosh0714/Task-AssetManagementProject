const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Employees = sequelize.define('Employee', {
  EmpID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  EmpName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  EmpMobile: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  },
  EmpEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Employees',
  timestamps: false
});


const AssetCategory = sequelize.define('AssetCategory', {
  DocEntry: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  Category: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'AssetCategories',
  timestamps: false
});

const Branch = sequelize.define('Branch', {
  DocEntry: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  Branchname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'Branches',
  timestamps: false
});

const Asset = sequelize.define('Asset', {
  AssetSerial: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  AssetName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  AssetCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Make: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  BranchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  PurchaseAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  PurchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isScrap: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ScrapReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  EmpID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ReturnReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Assets',
  timestamps: false
});

const AssetHistory = sequelize.define('AssetHistory', {
  DocEntry: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  AssetSerial: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  AssetStatus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  StatusDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_DATE')
  },
  EmpID: {
    type: DataTypes.STRING,
    allowNull: true
  },
  AssetRemark: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'AssetHistory',
  timestamps: false
});


// Associations

Asset.belongsTo(AssetCategory, { foreignKey: 'AssetCategoryId', as: 'AssetCategoryDetails' });
Asset.belongsTo(Branch, { foreignKey: 'BranchId', as: 'BranchDetails' });
Asset.belongsTo(Employees, { foreignKey: 'EmpID', as: 'EmployeeDetails' });

Branch.hasMany(Asset, { foreignKey: 'BranchId', as: 'Assets' });

Asset.hasMany(AssetHistory, { foreignKey: 'AssetSerial', sourceKey: 'AssetSerial' });

AssetHistory.belongsTo(Asset, { foreignKey: 'AssetSerial', targetKey: 'AssetSerial' });

AssetHistory.belongsTo(Employees, { foreignKey: 'EmpID', targetKey: 'EmpID', as: 'HistEmployeeDetails' });


module.exports = { Employees, AssetCategory, Branch, Asset, AssetHistory };
