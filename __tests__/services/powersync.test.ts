import { PowerSyncDatabase } from '@powersync/react-native';
import {
  initializePowerSync,
  closePowerSync,
  createNote,
  updateNote,
  deleteNote,
  getNotes,
  createCategory,
  updateCategory,
  getCategories,
} from '../../src/services/powersync';

// Mock PowerSyncDatabase
jest.mock('@powersync/react-native');

describe('PowerSync Service', () => {
  let mockDb: jest.Mocked<PowerSyncDatabase>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock database
    mockDb = {
      execute: jest.fn(),
      getAll: jest.fn(),
      init: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<PowerSyncDatabase>;

    // Mock PowerSyncDatabase constructor
    (PowerSyncDatabase as jest.Mock).mockImplementation(() => mockDb);
  });

  describe('initializePowerSync', () => {
    it('should initialize PowerSync with user ID', async () => {
      const userId = 'test-user-id';
      await initializePowerSync(userId);

      expect(PowerSyncDatabase).toHaveBeenCalled();
      expect(mockDb.init).toHaveBeenCalled();
    });
  });

  describe('closePowerSync', () => {
    it('should close PowerSync connection', async () => {
      await closePowerSync();
      expect(mockDb.close).toHaveBeenCalled();
    });
  });

  describe('Note Operations', () => {
    const mockNote = {
      id: 'note-1',
      title: 'Test Note',
      content: 'Test Content',
      category_id: 'cat-1',
      user_id: 'user-1',
    };

    const mockTimestamp = 1234567890;
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
    });

    it('should create a note', async () => {
      await createNote(mockNote);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notes'),
        [
          mockNote.id,
          mockNote.title,
          mockNote.content,
          mockNote.category_id,
          mockNote.user_id,
          mockTimestamp,
          mockTimestamp,
        ]
      );
    });

    it('should update a note', async () => {
      const updates = {
        id: 'note-1',
        title: 'Updated Title',
        content: 'Updated Content',
      };

      await updateNote(updates);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notes'),
        expect.arrayContaining([
          updates.title,
          updates.content,
          mockTimestamp,
          updates.id,
        ])
      );
    });

    it('should delete a note', async () => {
      const noteId = 'note-1';
      await deleteNote(noteId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notes SET deleted_at'),
        [mockTimestamp, noteId]
      );
    });

    it('should fetch notes for a user', async () => {
      const userId = 'user-1';
      const mockNotes = [
        { id: 'note-1', title: 'Note 1' },
        { id: 'note-2', title: 'Note 2' },
      ];

      mockDb.getAll.mockResolvedValue(mockNotes);

      const result = await getNotes(userId);

      expect(mockDb.getAll).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM notes'),
        [userId]
      );
      expect(result).toEqual(mockNotes);
    });
  });

  describe('Category Operations', () => {
    const mockCategory = {
      id: 'cat-1',
      name: 'Test Category',
      color: '#FF0000',
      user_id: 'user-1',
    };

    const mockTimestamp = 1234567890;
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
    });

    it('should create a category', async () => {
      await createCategory(mockCategory);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO categories'),
        [
          mockCategory.id,
          mockCategory.name,
          mockCategory.color,
          mockCategory.user_id,
          mockTimestamp,
          mockTimestamp,
        ]
      );
    });

    it('should update a category', async () => {
      const updates = {
        id: 'cat-1',
        name: 'Updated Category',
        color: '#00FF00',
      };

      await updateCategory(updates);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE categories'),
        expect.arrayContaining([
          updates.name,
          updates.color,
          mockTimestamp,
          updates.id,
        ])
      );
    });

    it('should fetch categories for a user', async () => {
      const userId = 'user-1';
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2' },
      ];

      mockDb.getAll.mockResolvedValue(mockCategories);

      const result = await getCategories(userId);

      expect(mockDb.getAll).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM categories'),
        [userId]
      );
      expect(result).toEqual(mockCategories);
    });
  });
}); 