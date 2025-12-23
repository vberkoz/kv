import { Button } from './ui/Button';

interface StoredItemsProps {
  keys: string[];
  onGetValue: (key: string) => void;
  onDeleteValue: (key: string) => void;
}

export default function StoredItems({ keys, onGetValue, onDeleteValue }: StoredItemsProps) {

  if (keys.length === 0) {
    return <div className="text-gray-500 text-sm py-2">No items stored yet</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Stored Items ({keys.length})</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {keys.map(key => (
          <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
            <code className="text-xs flex-1 truncate">{key}</code>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGetValue(key)}
              >
                View
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteValue(key)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
