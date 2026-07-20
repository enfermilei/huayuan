import { customToLandmark, type MapLandmark, type MapRegionId } from './mapData';

const CustomLandmarkSchema = z
  .object({
    id: z.string(),
    name: z.string().prefault('未命名建筑'),
    x: z.coerce.number().prefault(0),
    y: z.coerce.number().prefault(0),
    blurb: z.string().prefault(''),
    region: z
      .enum(['core', 'south', 'southeast', 'west', 'north', 'medical', 'custom'])
      .prefault('custom'),
  })
  .prefault({
    id: '',
    name: '未命名建筑',
    x: 0,
    y: 0,
    blurb: '',
    region: 'custom',
  });

export type CustomLandmarkDraft = z.infer<typeof CustomLandmarkSchema>;

export const useCustomLandmarksStore = defineStore('garden-custom-landmarks', () => {
  const items = useLocalStorage<CustomLandmarkDraft[]>('garden-mvu:custom-landmarks', []);

  const landmarks = computed((): MapLandmark[] =>
    items.value.map(item => customToLandmark(CustomLandmarkSchema.parse(item))),
  );

  function add(draft: Omit<CustomLandmarkDraft, 'id'> & { id?: string }) {
    const parsed = CustomLandmarkSchema.parse({
      ...draft,
      id: draft.id || `custom_${Date.now().toString(36)}`,
    });
    items.value = [...items.value, parsed];
    return parsed.id;
  }

  function update(id: string, patch: Partial<CustomLandmarkDraft>) {
    items.value = items.value.map(item =>
      item.id === id ? CustomLandmarkSchema.parse({ ...item, ...patch, id }) : item,
    );
  }

  function remove(id: string) {
    items.value = items.value.filter(item => item.id !== id);
  }

  function clampPos(x: number, y: number): [number, number] {
    return [_.clamp(x, -620, 620), _.clamp(y, -620, 620)];
  }

  return { items, landmarks, add, update, remove, clampPos };
});

export type { MapRegionId };
