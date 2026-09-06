/**
 * APHRO Centralized REST API Service
 * Migration step from legacy gasApiService.ts -> apiService.ts -> PostgreSQL REST API
 * 
 * Interacts directly with Node.js Express Backend / PostgreSQL REST API
 */

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  [key: string]: any;
}

export class ApiService {
  private static baseUrl = '/api';

  /**
   * Set dynamic API Base URL if hosted on external domain (e.g. https://api.aphro...)
   */
  public static setBaseUrl(url: string) {
    if (url) {
      this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    }
  }

  public static getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Helper GET request
   */
  private static async get<T>(action: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const queryParams = new URLSearchParams({ action, ...params }).toString();
      const endpoint = `${this.baseUrl}?${queryParams}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`[ApiService GET ${action} error]:`, error);
      return {
        status: 'error',
        message: error.message || 'Gagal terhubung ke server database',
      };
    }
  }

  /**
   * Helper POST request
   */
  private static async post<T>(action: string, body: Record<string, any> = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`[ApiService POST ${action} error]:`, error);
      return {
        status: 'error',
        message: error.message || 'Gagal mengirim data ke server database',
      };
    }
  }

  // ==========================================
  // CORE API METHODS
  // ==========================================

  // 1. Health Ping
  static async ping(): Promise<boolean> {
    const res = await this.get('ping');
    return res.status === 'success';
  }

  // 2. Unit Layanan Inisiasi
  static async getInisiasiUnits(): Promise<ApiResponse> {
    return this.get('getInisiasi');
  }

  // 3. Database Table Versions
  static async getVersions(): Promise<ApiResponse> {
    return this.get('getVersions');
  }

  // 4. Work Orders
  static async getWorkOrders(unitId?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    return this.get('getWorkOrders', params);
  }

  static async createWorkOrder(woData: any): Promise<ApiResponse> {
    return this.post('createWorkOrder', { workOrder: woData });
  }

  static async updateWorkOrder(id: string, woData: any): Promise<ApiResponse> {
    return this.post('updateWorkOrder', { id, workOrder: woData });
  }

  static async deleteWorkOrder(id: string): Promise<ApiResponse> {
    return this.post('deleteWorkOrder', { id });
  }

  // 5. Realisasi Pekerjaan
  static async getRealisasi(unitId?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    return this.get('getRealisasi', params);
  }

  static async saveRealisasi(realisationData: any): Promise<ApiResponse> {
    return this.post('saveRealisasi', { realisasi: realisationData });
  }

  static async deleteRealisasi(id: string): Promise<ApiResponse> {
    return this.post('deleteRealisasi', { id });
  }

  // 6. Absensi
  static async getAbsensi(unitId?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    return this.get('getAbsensi', params);
  }

  static async saveAbsensi(absensiData: any): Promise<ApiResponse> {
    return this.post('saveAbsensi', { absensi: absensiData });
  }

  static async deleteAbsensi(id: string): Promise<ApiResponse> {
    return this.post('deleteAbsensi', { id });
  }

  // 7. Users & Authentication
  static async getUsers(unitId?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    return this.get('getUsers', params);
  }

  static async login(username: string, pass: string): Promise<ApiResponse> {
    return this.post('login', { username, password: pass });
  }

  // 8. Master Data (ULP, Penyulang, Regu, Petugas, Tiang)
  static async getMasterData(table: string, unitId?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    return this.get(`get${table}`, params);
  }

  static async saveMasterItem(table: string, item: any): Promise<ApiResponse> {
    return this.post('saveMasterData', { sheetName: table, item });
  }

  static async deleteMasterItem(table: string, id: string): Promise<ApiResponse> {
    return this.post('deleteMasterData', { sheetName: table, id });
  }

  // 9. Photo Upload (React -> Express API -> Drive / Cloud -> PostgreSQL metadata)
  static async uploadPhoto(base64Data: string, filename?: string, folderId?: string): Promise<ApiResponse> {
    return this.post('uploadPhoto', { base64Data, filename, folderId });
  }

  // 10. Activity Logging
  static async logActivity(user: string, aktivitas: string, modul?: string, unitId?: string): Promise<ApiResponse> {
    return this.post('logActivity', { user, aktivitas, modul, unitId });
  }

  // 11. Get All Consolidated Data
  static async getAllData(unitId?: string): Promise<ApiResponse> {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    return this.get('getAllData', params);
  }

  // 12. PostgreSQL Database Management & Migration
  static async getDatabaseStats(): Promise<ApiResponse> {
    return this.get('getDatabaseStats');
  }

  static async initDatabaseSchema(): Promise<ApiResponse> {
    return this.post('initDatabaseSchema');
  }

  static async migrateFromSpreadsheet(): Promise<ApiResponse> {
    return this.post('migrateFromSpreadsheet');
  }
}
