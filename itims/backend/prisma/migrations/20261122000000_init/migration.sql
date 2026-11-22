-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'IT_STAFF');

-- CreateEnum
CREATE TYPE "ComputerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_REPAIR');

-- CreateEnum
CREATE TYPE "IpStatus" AS ENUM ('ALLOCATED', 'FREE', 'RESERVED');

-- CreateEnum
CREATE TYPE "PortStatus" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('PRIMARY', 'BACKUP');

-- CreateEnum
CREATE TYPE "IspStatus" AS ENUM ('ACTIVE', 'DOWN');

-- CreateEnum
CREATE TYPE "ApStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "CameraType" AS ENUM ('ANALOG', 'IP');

-- CreateEnum
CREATE TYPE "RecorderType" AS ENUM ('DVR', 'NVR');

-- CreateEnum
CREATE TYPE "CctvStatus" AS ENUM ('WORKING', 'NOT_WORKING');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('MAINTENANCE', 'ISP_DOWNTIME', 'SECURITY_INCIDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'IT_STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Computer" (
    "id" SERIAL NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assignedTo" TEXT,
    "department" TEXT,
    "location" TEXT,
    "processor" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "os" TEXT,
    "macAddress" TEXT,
    "ipId" INTEGER,
    "status" "ComputerStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchaseDate" TIMESTAMP(3),

    CONSTRAINT "Computer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareInventory" (
    "id" SERIAL NOT NULL,
    "itemType" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNo" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "purchaseDate" TIMESTAMP(3),
    "warrantyEnd" TIMESTAMP(3),

    CONSTRAINT "HardwareInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpAddress" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "subnet" TEXT,
    "vlan" TEXT,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "assignedDate" TIMESTAMP(3),
    "status" "IpStatus" NOT NULL DEFAULT 'FREE',
    "remarks" TEXT,

    CONSTRAINT "IpAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkDevice" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "location" TEXT,
    "ipAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "NetworkDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Switch" (
    "id" SERIAL NOT NULL,
    "networkDeviceId" INTEGER NOT NULL,
    "totalPorts" INTEGER NOT NULL DEFAULT 24,
    "portNumber" INTEGER NOT NULL,
    "connectedDevice" TEXT,
    "vlan" TEXT,
    "portStatus" "PortStatus" NOT NULL DEFAULT 'UP',

    CONSTRAINT "Switch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Isp" (
    "id" SERIAL NOT NULL,
    "providerName" TEXT NOT NULL,
    "linkType" "LinkType" NOT NULL DEFAULT 'PRIMARY',
    "bandwidth" TEXT,
    "circuitId" TEXT,
    "staticIp" TEXT,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "status" "IspStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Isp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Firewall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "ipAddress" TEXT,
    "firmwareVersion" TEXT,
    "policiesSummary" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Firewall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPoint" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "ssid" TEXT,
    "status" "ApStatus" NOT NULL DEFAULT 'ONLINE',

    CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "brand" TEXT,
    "os" TEXT,
    "ipAddress" TEXT,
    "rackNumber" TEXT,
    "patchPanel" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CctvCamera" (
    "id" SERIAL NOT NULL,
    "cameraName" TEXT NOT NULL,
    "cameraType" "CameraType" NOT NULL DEFAULT 'IP',
    "location" TEXT,
    "recorderType" "RecorderType" NOT NULL DEFAULT 'NVR',
    "recorderName" TEXT,
    "ipAddress" TEXT,
    "status" "CctvStatus" NOT NULL DEFAULT 'WORKING',

    CONSTRAINT "CctvCamera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" SERIAL NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "raisedBy" TEXT NOT NULL,
    "assignedToId" INTEGER,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" SERIAL NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "recordType" "RecordType" NOT NULL DEFAULT 'MAINTENANCE',
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedBy" TEXT,
    "remarks" TEXT,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_assetTag_key" ON "Computer"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "IpAddress_ipAddress_key" ON "IpAddress"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_ticketNo_key" ON "Complaint"("ticketNo");

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "IpAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Switch" ADD CONSTRAINT "Switch_networkDeviceId_fkey" FOREIGN KEY ("networkDeviceId") REFERENCES "NetworkDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

