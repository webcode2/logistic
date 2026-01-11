/*
  Warnings:

  - Added the required column `receiver_address` to the `Waybill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver_email` to the `Waybill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver_phone` to the `Waybill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipper_address` to the `Waybill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipper_email` to the `Waybill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipper_phone` to the `Waybill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Waybill" ADD COLUMN     "receiver_address" TEXT NOT NULL,
ADD COLUMN     "receiver_email" TEXT NOT NULL,
ADD COLUMN     "receiver_phone" TEXT NOT NULL,
ADD COLUMN     "shipper_address" TEXT NOT NULL,
ADD COLUMN     "shipper_email" TEXT NOT NULL,
ADD COLUMN     "shipper_phone" TEXT NOT NULL;
