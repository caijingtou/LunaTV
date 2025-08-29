
import fs from 'fs';
import path from 'path';

import { AdminConfig } from './admin.types';
import { Favorite, PlayRecord, SkipConfig } from './types'; // Assuming these types exist

// Define the overall structure of the JSON database file
interface JsonDBData {
  config: AdminConfig;
  playRecords?: Record<string, PlayRecord>;
  favorites?: Record<string, Favorite>;
  searchHistory?: string[];
  skipConfigs?: Record<string, SkipConfig>;
  [key: string]: unknown; // For other dynamic keys
}

// 定义数据文件的路径
const dbPath = path.join(process.cwd(), 'luna-tv-data.json');

// 定义一个默认的空数据结构
const defaultData: JsonDBData = {
  config: {
    ConfigSubscribtion: {
      URL: "",
      AutoUpdate: false,
      LastCheck: "",
    },
    ConfigFile: "",
    SiteConfig: {
      SiteName: "LunaTV",
      Announcement: "",
      SearchDownstreamMaxPage: 5,
      SiteInterfaceCacheTime: 7200,
      DoubanProxyType: "cmliussss-cdn-tencent",
      DoubanProxy: "",
      DoubanImageProxyType: "cmliussss-cdn-tencent",
      DoubanImageProxy: "",
      DisableYellowFilter: false,
      FluidSearch: true,
    },
    UserConfig: {
      Users: [],
    },
    SourceConfig: [],
    CustomCategories: [],
    LiveConfig: [],
  },
};

// 同步读取数据文件
function readData(): JsonDBData {
  try {
    if (fs.existsSync(dbPath)) {
      const jsonString = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(jsonString) as JsonDBData;
    } else {
      // 如果文件不存在，创建并写入默认数据
      fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading or creating JSON DB file:', error);
    // 如果出错，返回默认数据以避免应用崩溃
    return defaultData;
  }
}

// 同步写入数据文件
function writeData(data: JsonDBData) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error writing to JSON DB file:', error);
  }
}

// 实现与 RedisDB 等相同的接口
export class JsonDB {
  private data: JsonDBData;

  constructor() {
    this.data = readData();
  }

  private persist() {
    writeData(this.data);
  }

  async getConfig(): Promise<AdminConfig> {
    // 直接从内存中的数据副本返回 config
    return this.data.config;
  }

  async setConfig(config: AdminConfig): Promise<void> {
    this.data.config = config;
    this.persist();
  }

  async get(key: string): Promise<unknown> {
    return this.data[key];
  }

  async set(key: string, value: unknown): Promise<void> {
    this.data[key] = value;
    this.persist();
  }

  async del(key: string): Promise<void> {
    delete this.data[key];
    this.persist();
  }

  async getAll(): Promise<JsonDBData> {
    return this.data;
  }

  async getKeys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Object.keys(this.data).filter(key => regex.test(key));
  }
  
  // 'find' 和 'findOne' 在JSON场景下不适用，但为了保持接口一致性，提供一个简单实现
  async find(pattern: string): Promise<unknown[]> {
    const keys = await this.getKeys(pattern);
    return keys.map(key => this.data[key]);
  }

  async findOne(pattern: string): Promise<unknown | null> {
    const keys = await this.getKeys(pattern);
    return keys.length > 0 ? this.data[keys[0]] : null;
  }
}
