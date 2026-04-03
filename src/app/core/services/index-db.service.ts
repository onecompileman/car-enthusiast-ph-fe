import { Injectable } from '@angular/core';
import { IndexDbStoreNames } from '../../shared/enums/index-db-store-names.enum';
import { BuildWizardState } from '../../user/add-build/build-wizard.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IndexDbService {
  private dbName = 'ceph';
  private db: IDBDatabase | null = null;

  isDbInitialized: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    this.init();
  }

  private init(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      for (const storeName of Object.values(IndexDbStoreNames)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result as IDBDatabase;
      console.log('IndexedDB initialized for ceph');
      this.isDbInitialized.next(true);
    };

    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.error);
    };
  }

  saveState(state: any, storeName: IndexDbStoreNames): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized, save');
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(state);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getState(
    id: string,
    storeName: IndexDbStoreNames,
  ): Promise<BuildWizardState | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized, get');
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  deleteState(id: string, storeName: IndexDbStoreNames): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getAllStates(storeName: IndexDbStoreNames): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as any[]);
      request.onerror = () => reject(request.error);
    });
  }
}
