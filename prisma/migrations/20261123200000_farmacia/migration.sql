-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_timeBlockId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "TimeBlock";

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "medicamentoId" TEXT,
    "presentacion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "unidades" INTEGER NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Venta_userId_idx" ON "Venta"("userId");

-- CreateIndex
CREATE INDEX "Venta_medicamentoId_idx" ON "Venta"("medicamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_medicamentoId_presentacion_key" ON "Stock"("medicamentoId", "presentacion");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
