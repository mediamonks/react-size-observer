type TypedObjectKeys = <TObject>(obj: TObject) => Array<keyof TObject>;
const typedObjectKeys: TypedObjectKeys = Object.keys as any;

export default typedObjectKeys;
