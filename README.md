<!--
 Copyright (c) 2024 Anthony Mugendi
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Get-Zip
Download and unzip to a specific directory.
Works for `.zip`, `.tar`, `.gz` and `.tgz` archives.

## Example

```js
  const url =
    'https://github.com/pocketbase/pocketbase/releases/download/v0.22.23/pocketbase_0.22.23_linux_amd64.zip';

  const downloadDir = '/download/to/dir';
  const { destPath } = await getCompressed(url, downloadDir);

```