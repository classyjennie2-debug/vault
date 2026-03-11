declare module "pg" {
  export interface PoolConfig {
    connectionString?: string
    [key: string]: any
  }

  export class Pool {
    constructor(config?: PoolConfig)
    query(sql: string, params?: any[]): Promise<{ rows: any[] }>
    end(): Promise<void>
  }
}
