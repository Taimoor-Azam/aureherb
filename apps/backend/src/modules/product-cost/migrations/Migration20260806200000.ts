import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260806200000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "variant_cost" ("id" text not null, "variant_id" text not null, "product_id" text not null, "currency_code" text not null default 'pkr', "unit_cost" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "variant_cost_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_variant_cost_variant_id_unique" ON "variant_cost" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_variant_cost_product_id" ON "variant_cost" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_variant_cost_deleted_at" ON "variant_cost" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "order_line_cost_snapshot" ("id" text not null, "order_id" text not null, "line_item_id" text not null, "variant_id" text null, "product_id" text null, "quantity" integer not null, "unit_cost" integer not null default 0, "unit_revenue" integer not null, "currency_code" text not null default 'pkr', "line_cogs" integer not null default 0, "line_revenue" integer not null, "line_profit" integer not null default 0, "missing_cost" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_line_cost_snapshot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_line_cost_snapshot_order_id" ON "order_line_cost_snapshot" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_order_line_cost_snapshot_line_item_id_unique" ON "order_line_cost_snapshot" ("line_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_line_cost_snapshot_variant_id" ON "order_line_cost_snapshot" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_line_cost_snapshot_product_id" ON "order_line_cost_snapshot" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_line_cost_snapshot_deleted_at" ON "order_line_cost_snapshot" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "order_line_cost_snapshot" cascade;`);
    this.addSql(`drop table if exists "variant_cost" cascade;`);
  }

}
