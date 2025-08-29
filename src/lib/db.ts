/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminConfig } from './admin.types';
import { JsonDB } from './json.db';
import { Favorite, PlayRecord, SkipConfig } from './types';

// We are now hard-coding the use of JsonDB. No more STORAGE_TYPE or user management.
const storage = new JsonDB();

// This key generation is still useful for identifying media.
export function generateStorageKey(source: string, id: string): string {
  return `${source}+${id}`;
}

class SimpleDbManager {
  private async getCollection(name: string): Promise<any> {
    const collection = await storage.get(name);
    return collection || {};
  }

  private async saveCollection(name: string, data: any): Promise<void> {
    await storage.set(name, data);
  }

  // --- Config ---
  async getAdminConfig(): Promise<AdminConfig | null> {
    return storage.getConfig();
  }

  async saveAdminConfig(config: AdminConfig): Promise<void> {
    await storage.setConfig(config);
  }

  // --- Play Records (Single User) ---
  async getPlayRecord(source: string, id: string): Promise<PlayRecord | null> {
    const key = generateStorageKey(source, id);
    const records = await this.getCollection('playRecords');
    return records[key] || null;
  }

  async savePlayRecord(source: string, id: string, record: PlayRecord): Promise<void> {
    const key = generateStorageKey(source, id);
    const records = await this.getCollection('playRecords');
    records[key] = record;
    await this.saveCollection('playRecords', records);
  }

  async getAllPlayRecords(): Promise<{ [key: string]: PlayRecord }> {
    return this.getCollection('playRecords');
  }

  async deletePlayRecord(source: string, id: string): Promise<void> {
    const key = generateStorageKey(source, id);
    const records = await this.getCollection('playRecords');
    delete records[key];
    await this.saveCollection('playRecords', records);
  }

  // --- Favorites (Single User) ---
  async getFavorite(source: string, id: string): Promise<Favorite | null> {
    const key = generateStorageKey(source, id);
    const favorites = await this.getCollection('favorites');
    return favorites[key] || null;
  }

  async saveFavorite(source: string, id: string, favorite: Favorite): Promise<void> {
    const key = generateStorageKey(source, id);
    const favorites = await this.getCollection('favorites');
    favorites[key] = favorite;
    await this.saveCollection('favorites', favorites);
  }

  async getAllFavorites(): Promise<{ [key: string]: Favorite }> {
    return this.getCollection('favorites');
  }

  async deleteFavorite(source: string, id: string): Promise<void> {
    const key = generateStorageKey(source, id);
    const favorites = await this.getCollection('favorites');
    delete favorites[key];
    await this.saveCollection('favorites', favorites);
  }

  async isFavorited(source: string, id: string): Promise<boolean> {
    const favorite = await this.getFavorite(source, id);
    return favorite !== null;
  }
  
  // --- Search History (Single User) ---
  async getSearchHistory(): Promise<string[]> {
    const history = await storage.get('searchHistory');
    return Array.isArray(history) ? history : [];
  }

  async addSearchHistory(keyword: string): Promise<void> {
    let history = await this.getSearchHistory();
    history = [keyword, ...history.filter(k => k !== keyword)].slice(0, 20); // Keep latest 20
    await storage.set('searchHistory', history);
  }

  async deleteSearchHistory(keyword?: string): Promise<void> {
    if (keyword) {
      let history = await this.getSearchHistory();
      history = history.filter(k => k !== keyword);
      await storage.set('searchHistory', history);
    } else {
      await storage.del('searchHistory');
    }
  }

  // --- Skip Configs (Single User) ---
  async getSkipConfig(source: string, id: string): Promise<SkipConfig | null> {
    const key = `skip_${generateStorageKey(source, id)}`;
    const configs = await this.getCollection('skipConfigs');
    return configs[key] || null;
  }

  async setSkipConfig(source: string, id: string, config: SkipConfig): Promise<void> {
    const key = `skip_${generateStorageKey(source, id)}`;
    const configs = await this.getCollection('skipConfigs');
    configs[key] = config;
    await this.saveCollection('skipConfigs', configs);
  }

  async deleteSkipConfig(source: string, id: string): Promise<void> {
    const key = `skip_${generateStorageKey(source, id)}`;
    const configs = await this.getCollection('skipConfigs');
    delete configs[key];
    await this.saveCollection('skipConfigs', configs);
  }

  async getAllSkipConfigs(): Promise<{ [key: string]: SkipConfig }> {
    return this.getCollection('skipConfigs');
  }

  // --- All user management methods are removed ---
  // --- Data clear is a useful admin feature, so we keep it ---
  async clearAllData(): Promise<void> {
    await storage.del('playRecords');
    await storage.del('favorites');
    await storage.del('searchHistory');
    await storage.del('skipConfigs');
  }
}

// Export the simplified, single-user db manager instance
export const db = new SimpleDbManager();
