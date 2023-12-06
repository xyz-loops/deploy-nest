-- CreateEnum
CREATE TYPE "InvestTypeEnum" AS ENUM ('FS', 'CBA');

-- CreateEnum
CREATE TYPE "ModulEnum" AS ENUM ('OPEX', 'CAPEX');

-- CreateEnum
CREATE TYPE "RealizationTypeEnum" AS ENUM ('UANG_MUKA', 'ENTERTAINMENT', 'PENGADAAN', 'QUALITY', 'FACILITY', 'ICT', 'REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('OPEN', 'PROGRESS', 'REVISE', 'REJECT', 'CLOSE');

-- CreateTable
CREATE TABLE "approval" (
    "id_approval" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "table_name" VARCHAR(20) NOT NULL,
    "table_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "jabatan" VARCHAR(50) NOT NULL,
    "unit" VARCHAR(8) NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'PROGRESS',
    "remark" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "approval_pkey" PRIMARY KEY ("id_approval")
);

-- CreateTable
CREATE TABLE "note_memo" (
    "id_note_memo" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "approval_id" INTEGER NOT NULL,
    "years" INTEGER NOT NULL,
    "dinas" VARCHAR(8) NOT NULL,
    "memo_number" BIGINT NOT NULL,
    "department_to" VARCHAR(8) NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "note_memo_pkey" PRIMARY KEY ("id_note_memo")
);

-- CreateTable
CREATE TABLE "budget" (
    "id_budget" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "gl_account_id" INTEGER NOT NULL,
    "cost_center_id" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "value01" DOUBLE PRECISION NOT NULL,
    "value02" DOUBLE PRECISION NOT NULL,
    "value03" DOUBLE PRECISION NOT NULL,
    "value04" DOUBLE PRECISION NOT NULL,
    "value05" DOUBLE PRECISION NOT NULL,
    "value06" DOUBLE PRECISION NOT NULL,
    "value07" DOUBLE PRECISION NOT NULL,
    "value08" DOUBLE PRECISION NOT NULL,
    "value09" DOUBLE PRECISION NOT NULL,
    "value10" DOUBLE PRECISION NOT NULL,
    "value11" DOUBLE PRECISION NOT NULL,
    "value12" DOUBLE PRECISION NOT NULL,
    "value13" DOUBLE PRECISION,
    "value14" DOUBLE PRECISION,
    "value15" DOUBLE PRECISION,
    "value16" DOUBLE PRECISION,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id_budget")
);

-- CreateTable
CREATE TABLE "budget_investation" (
    "id_budget_investation" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "no_invest" INTEGER NOT NULL,
    "cost_center_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "type" "InvestTypeEnum" NOT NULL,
    "group_asset" VARCHAR(40) NOT NULL,
    "usefull" SMALLINT NOT NULL,
    "skala" SMALLINT NOT NULL,
    "group_invest" VARCHAR(40) NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "new" BOOLEAN NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "plus" DOUBLE PRECISION NOT NULL,
    "minus" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "budget_investation_pkey" PRIMARY KEY ("id_budget_investation")
);

-- CreateTable
CREATE TABLE "budget_reallocation" (
    "id_budget" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "gl_account_id" INTEGER NOT NULL,
    "cost_center_id" INTEGER NOT NULL,
    "plus" DOUBLE PRECISION NOT NULL,
    "minus" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "budget_reallocation_pkey" PRIMARY KEY ("id_budget")
);

-- CreateTable
CREATE TABLE "file_upload" (
    "id_upload" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "table_name" VARCHAR(20) NOT NULL,
    "table_id" SERIAL NOT NULL,
    "doc_category_id" INTEGER NOT NULL,
    "doc_name" VARCHAR(100) NOT NULL,
    "doc_link" VARCHAR(255) NOT NULL,
    "doc_size" DOUBLE PRECISION NOT NULL,
    "doc_type" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "file_upload_pkey" PRIMARY KEY ("id_upload")
);

-- CreateTable
CREATE TABLE "m_doc_category" (
    "id_doc_category" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "module" "ModulEnum" NOT NULL DEFAULT 'OPEX',
    "doc_category" VARCHAR(20) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "m_doc_category_pkey" PRIMARY KEY ("id_doc_category")
);

-- CreateTable
CREATE TABLE "m_cost_center" (
    "id_cost_center" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "costCenter" VARCHAR(20) NOT NULL,
    "description" VARCHAR(50) NOT NULL,
    "bidang" VARCHAR(8) NOT NULL,
    "dinas" VARCHAR(8) NOT NULL,
    "directorat" VARCHAR(8) NOT NULL,
    "group_dinas" VARCHAR(20) NOT NULL,
    "profit_center" VARCHAR(20) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "m_cost_center_pkey" PRIMARY KEY ("id_cost_center")
);

-- CreateTable
CREATE TABLE "m_gl_account" (
    "id_gl_account" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "glAccount" DECIMAL NOT NULL,
    "group_detail" VARCHAR(50) NOT NULL,
    "group_gl" VARCHAR(50) NOT NULL,
    "sap" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "m_gl_account_pkey" PRIMARY KEY ("id_gl_account")
);

-- CreateTable
CREATE TABLE "m_kurs" (
    "id_kurs" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "m_kurs_pkey" PRIMARY KEY ("id_kurs")
);

-- CreateTable
CREATE TABLE "m_status" (
    "id_status" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(25) NOT NULL,
    "step" INTEGER NOT NULL,
    "department" VARCHAR(8),
    "level" INTEGER NOT NULL,
    "function" VARCHAR(20),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "m_status_pkey" PRIMARY KEY ("id_status")
);

-- CreateTable
CREATE TABLE "realization" (
    "id_realization" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "cost_center_id" INTEGER NOT NULL,
    "no_draft" SERIAL NOT NULL,
    "no_request" TEXT,
    "ta_reff" INTEGER,
    "type" "RealizationTypeEnum" NOT NULL DEFAULT 'UANG_MUKA',
    "responsible_nopeg" VARCHAR(8) NOT NULL,
    "title_request" VARCHAR NOT NULL,
    "note_request" TEXT NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'PROGRESS',
    "status_id" INTEGER NOT NULL,
    "department" VARCHAR(8),
    "nopeg" VARCHAR(8) NOT NULL,
    "status_to_id" INTEGER NOT NULL,
    "department_to" VARCHAR(8),
    "nopeg_to" VARCHAR(8),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),
    "role_assignment" JSONB,

    CONSTRAINT "realization_pkey" PRIMARY KEY ("id_realization")
);

-- CreateTable
CREATE TABLE "realization_invest" (
    "id_realization_invest" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "no_draft" INTEGER NOT NULL,
    "no_request" VARCHAR(15),
    "type_invest_id" INTEGER NOT NULL,
    "cba" BOOLEAN NOT NULL,
    "responsible_nopeg" VARCHAR(8) NOT NULL,
    "description" TEXT,
    "io" DECIMAL(12,0),
    "status" "StatusEnum" NOT NULL DEFAULT 'PROGRESS',
    "status_id" INTEGER NOT NULL,
    "department" VARCHAR(8) NOT NULL,
    "nopeg" VARCHAR(8) NOT NULL,
    "statusToId" INTEGER,
    "department_to" VARCHAR(8),
    "nopeg_to" VARCHAR(8),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "realization_invest_pkey" PRIMARY KEY ("id_realization_invest")
);

-- CreateTable
CREATE TABLE "m_type_invest" (
    "id_type_invest" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "type" VARCHAR(1) NOT NULL,
    "name" VARCHAR(12),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "m_type_invest_pkey" PRIMARY KEY ("id_type_invest")
);

-- CreateTable
CREATE TABLE "realization_invest_item" (
    "id_realization_invest_item" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "realization_invest_id" INTEGER NOT NULL,
    "budget_investation_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_submission" DOUBLE PRECISION NOT NULL,
    "internal" BOOLEAN,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "realization_invest_item_pkey" PRIMARY KEY ("id_realization_invest_item")
);

-- CreateTable
CREATE TABLE "realization_item" (
    "id_realization_item" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "realization_id" INTEGER NOT NULL,
    "gl_account_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_submission" DOUBLE PRECISION NOT NULL,
    "amount_hps" DOUBLE PRECISION,
    "amount_correction" DOUBLE PRECISION,
    "period_start" DATE NOT NULL,
    "period_finish" DATE NOT NULL,
    "desc_pby" TEXT NOT NULL,
    "remark_pby" TEXT NOT NULL,
    "memo" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "realization_item_pkey" PRIMARY KEY ("id_realization_item")
);

-- CreateTable
CREATE TABLE "reallocation" (
    "id_reallocation" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "realization_id" INTEGER NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "ta_reff" INTEGER,
    "owner_budget" VARCHAR(8) NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'PROGRESS',
    "status_id" INTEGER NOT NULL,
    "department" VARCHAR(8) NOT NULL,
    "nopeg" VARCHAR(8) NOT NULL,
    "statusToId" INTEGER,
    "department_to" VARCHAR(8) NOT NULL,
    "nopeg_to" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "reallocation_pkey" PRIMARY KEY ("id_reallocation")
);

-- CreateTable
CREATE TABLE "reallocation_corporate" (
    "id_reallocation_corporate" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "ta_reff" INTEGER,
    "status" "StatusEnum" NOT NULL DEFAULT 'PROGRESS',
    "status_id" INTEGER NOT NULL,
    "department" VARCHAR(8) NOT NULL,
    "nopeg" VARCHAR(8) NOT NULL,
    "id_status_to" INTEGER NOT NULL,
    "department_to" VARCHAR(8) NOT NULL,
    "nopeg_to" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "reallocation_corporate_pkey" PRIMARY KEY ("id_reallocation_corporate")
);

-- CreateTable
CREATE TABLE "reallocation_corporate_item" (
    "id_reallocation_corporate_item" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "reallocation_budget_id" INTEGER NOT NULL,
    "cost_center_id" INTEGER NOT NULL,
    "gl_account_id" INTEGER NOT NULL,
    "cost_center_to_id" INTEGER NOT NULL,
    "gl_account_to_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "reallocation_corporate_item_pkey" PRIMARY KEY ("id_reallocation_corporate_item")
);

-- CreateTable
CREATE TABLE "reallocation_invest" (
    "id_reallocation_invest" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "ba" INTEGER NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'PROGRESS',
    "status_id" INTEGER NOT NULL,
    "department" VARCHAR(8) NOT NULL,
    "nopeg" VARCHAR(8) NOT NULL,
    "statusToId" INTEGER,
    "department_to" VARCHAR(8) NOT NULL,
    "nopeg_to" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "reallocation_invest_pkey" PRIMARY KEY ("id_reallocation_invest")
);

-- CreateTable
CREATE TABLE "reallocation_invest_item" (
    "id_reallocation_invest_item" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "reallocation_invest_id" INTEGER NOT NULL,
    "budget_investation_id" INTEGER NOT NULL,
    "realization_invest_item_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" VARCHAR(255),
    "note" TEXT,
    "remark" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "reallocation_invest_item_pkey" PRIMARY KEY ("id_reallocation_invest_item")
);

-- CreateTable
CREATE TABLE "reallocation_item" (
    "id_reallocation_item" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "reallocation_id" INTEGER NOT NULL,
    "gl_account_id" INTEGER NOT NULL,
    "id_realizazion_item" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "budget_name" VARCHAR(50) NOT NULL,
    "remark" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),

    CONSTRAINT "reallocation_item_pkey" PRIMARY KEY ("id_reallocation_item")
);

-- CreateTable
CREATE TABLE "simulation" (
    "id_simulation" SERIAL NOT NULL,
    "unique_id" UUID NOT NULL,
    "years" INTEGER NOT NULL,
    "cost_center_id" INTEGER NOT NULL,
    "simulation_budget" REAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(50),
    "mGlAccountIdGlAccount" INTEGER,

    CONSTRAINT "simulation_pkey" PRIMARY KEY ("id_simulation")
);

-- CreateIndex
CREATE UNIQUE INDEX "approval_unique_id_key" ON "approval"("unique_id");

-- CreateIndex
CREATE INDEX "approval_constraint" ON "approval"("table_name", "table_id", "created_by");

-- CreateIndex
CREATE UNIQUE INDEX "note_memo_unique_id_key" ON "note_memo"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_unique_id_key" ON "budget"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_constraint" ON "budget"("years", "gl_account_id", "cost_center_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_investation_unique_id_key" ON "budget_investation"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_invest_constraint" ON "budget_investation"("years", "no_invest", "cost_center_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_reallocation_unique_id_key" ON "budget_reallocation"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_reallocation_constraint" ON "budget_reallocation"("years", "cost_center_id", "gl_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_upload_unique_id_key" ON "file_upload"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "m_doc_category_unique_id_key" ON "m_doc_category"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "doc_category_constraint" ON "m_doc_category"("module", "doc_category");

-- CreateIndex
CREATE UNIQUE INDEX "m_cost_center_unique_id_key" ON "m_cost_center"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_center_idx" ON "m_cost_center"("costCenter");

-- CreateIndex
CREATE UNIQUE INDEX "m_gl_account_unique_id_key" ON "m_gl_account"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "gl_account_idx" ON "m_gl_account"("glAccount");

-- CreateIndex
CREATE UNIQUE INDEX "m_kurs_unique_id_key" ON "m_kurs"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "years_idx" ON "m_kurs"("years");

-- CreateIndex
CREATE UNIQUE INDEX "m_status_unique_id_key" ON "m_status"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "realization_unique_id_key" ON "realization"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "realization_invest_unique_id_key" ON "realization_invest"("unique_id");

-- CreateIndex
CREATE INDEX "realization_invest_constraint" ON "realization_invest"("years");

-- CreateIndex
CREATE UNIQUE INDEX "m_type_invest_unique_id_key" ON "m_type_invest"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "type_invest_idx" ON "m_type_invest"("type");

-- CreateIndex
CREATE UNIQUE INDEX "realization_invest_item_unique_id_key" ON "realization_invest_item"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "realization_item_unique_id_key" ON "realization_item"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "reallocation_unique_id_key" ON "reallocation"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "reallocation_corporate_unique_id_key" ON "reallocation_corporate"("unique_id");

-- CreateIndex
CREATE INDEX "reallocation_budget_constraint" ON "reallocation_corporate"("years");

-- CreateIndex
CREATE UNIQUE INDEX "reallocation_corporate_item_unique_id_key" ON "reallocation_corporate_item"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "reallocation_invest_unique_id_key" ON "reallocation_invest"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "reallocation_invest_item_unique_id_key" ON "reallocation_invest_item"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "reallocation_item_unique_id_key" ON "reallocation_item"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_unique_id_key" ON "simulation"("unique_id");

-- AddForeignKey
ALTER TABLE "note_memo" ADD CONSTRAINT "fk_approval_to_note_memo" FOREIGN KEY ("approval_id") REFERENCES "approval"("id_approval") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "fk_m_cost_center_to_budget" FOREIGN KEY ("cost_center_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "fk_m_gl_account_to_budget" FOREIGN KEY ("gl_account_id") REFERENCES "m_gl_account"("id_gl_account") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budget_investation" ADD CONSTRAINT "fk_m_cost_center_to_budget_investation" FOREIGN KEY ("cost_center_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budget_reallocation" ADD CONSTRAINT "fk_m_cost_center_to_budget_reallocation" FOREIGN KEY ("cost_center_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "budget_reallocation" ADD CONSTRAINT "fk_m_gl_account_to_budget_reallocation" FOREIGN KEY ("cost_center_id") REFERENCES "m_gl_account"("id_gl_account") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_upload" ADD CONSTRAINT "fk_m_doc_category_to_file_upload" FOREIGN KEY ("doc_category_id") REFERENCES "m_doc_category"("id_doc_category") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization" ADD CONSTRAINT "fk_m_cost_center_to_realization" FOREIGN KEY ("cost_center_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization" ADD CONSTRAINT "fk_m_status_to_realization" FOREIGN KEY ("status_id") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization" ADD CONSTRAINT "fk_m_status_to_realization1" FOREIGN KEY ("status_to_id") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_invest" ADD CONSTRAINT "fk_m_status_to_realization_invest" FOREIGN KEY ("status_id") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_invest" ADD CONSTRAINT "fk_m_status_to_realization_invest1" FOREIGN KEY ("statusToId") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_invest" ADD CONSTRAINT "fk_m_type_invest_to_realization_invest" FOREIGN KEY ("type_invest_id") REFERENCES "m_type_invest"("id_type_invest") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_invest_item" ADD CONSTRAINT "fk_budget_investation_to_realization_invest_item" FOREIGN KEY ("budget_investation_id") REFERENCES "budget_investation"("id_budget_investation") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_invest_item" ADD CONSTRAINT "fk_realization_invest_to_realization_invest_item" FOREIGN KEY ("realization_invest_id") REFERENCES "realization_invest"("id_realization_invest") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_item" ADD CONSTRAINT "fk_m_gl_account_to_realization_item" FOREIGN KEY ("gl_account_id") REFERENCES "m_gl_account"("id_gl_account") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realization_item" ADD CONSTRAINT "fk_realization_to_realization_item" FOREIGN KEY ("realization_id") REFERENCES "realization"("id_realization") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation" ADD CONSTRAINT "fk_m_status_to_reallocation" FOREIGN KEY ("status_id") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation" ADD CONSTRAINT "fk_realization_to_reallocation" FOREIGN KEY ("realization_id") REFERENCES "realization"("id_realization") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate" ADD CONSTRAINT "fk_m_status_to_reallocation_corporate" FOREIGN KEY ("status_id") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate" ADD CONSTRAINT "fk_m_status_to_reallocation_corporate1" FOREIGN KEY ("id_status_to") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate_item" ADD CONSTRAINT "fk_m_cost_center_to_reallocation_corporate_item" FOREIGN KEY ("cost_center_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate_item" ADD CONSTRAINT "fk_m_cost_center_to_reallocation_corporate_item1" FOREIGN KEY ("cost_center_to_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate_item" ADD CONSTRAINT "fk_m_gl_account_to_reallocation_corporate_item" FOREIGN KEY ("gl_account_id") REFERENCES "m_gl_account"("id_gl_account") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate_item" ADD CONSTRAINT "fk_m_gl_account_to_reallocation_corporate_item1" FOREIGN KEY ("gl_account_to_id") REFERENCES "m_gl_account"("id_gl_account") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_corporate_item" ADD CONSTRAINT "fk_reallocation_corporate_to_reallocation_corporate_item" FOREIGN KEY ("reallocation_budget_id") REFERENCES "reallocation_corporate"("id_reallocation_corporate") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_invest" ADD CONSTRAINT "fk_m_status_to_reallocation_invest" FOREIGN KEY ("status_id") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_invest" ADD CONSTRAINT "fk_m_status_to_reallocation_invest1" FOREIGN KEY ("statusToId") REFERENCES "m_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_invest_item" ADD CONSTRAINT "fk_budget_investation_to_reallocation_invest_item" FOREIGN KEY ("budget_investation_id") REFERENCES "budget_investation"("id_budget_investation") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_invest_item" ADD CONSTRAINT "fk_realization_invest_item_to_reallocation_invest_item" FOREIGN KEY ("realization_invest_item_id") REFERENCES "realization_invest_item"("id_realization_invest_item") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_invest_item" ADD CONSTRAINT "fk_reallocation_invest_to_reallocation_invest_item" FOREIGN KEY ("reallocation_invest_id") REFERENCES "reallocation_invest"("id_reallocation_invest") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_item" ADD CONSTRAINT "fk_m_gl_account_to_reallocation_item" FOREIGN KEY ("gl_account_id") REFERENCES "m_gl_account"("id_gl_account") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_item" ADD CONSTRAINT "fk_realization_item_to_reallocation_item" FOREIGN KEY ("id_realizazion_item") REFERENCES "realization_item"("id_realization_item") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reallocation_item" ADD CONSTRAINT "fk_reallocation_to_reallocation_item" FOREIGN KEY ("reallocation_id") REFERENCES "reallocation"("id_reallocation") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "simulation" ADD CONSTRAINT "fk_m_cost_center_to_simulation" FOREIGN KEY ("cost_center_id") REFERENCES "m_cost_center"("id_cost_center") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "simulation" ADD CONSTRAINT "simulation_mGlAccountIdGlAccount_fkey" FOREIGN KEY ("mGlAccountIdGlAccount") REFERENCES "m_gl_account"("id_gl_account") ON DELETE SET NULL ON UPDATE CASCADE;
