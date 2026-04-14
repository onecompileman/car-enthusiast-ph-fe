async function convertHeicToJpeg(file: File): Promise<File> {
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('here');

    const heic2any = (await import('heic2any')).default;
    console.log(heic2any);
    const blob = (await heic2any({ blob: file, toType: 'image/jpeg' })) as Blob;
    return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
    });
  }
  return file;
}

export { convertHeicToJpeg };
