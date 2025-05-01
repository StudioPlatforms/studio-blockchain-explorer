import axios from 'axios';

/**
 * Fetch compiler versions from Solidity releases repository
 * @returns {Promise<Array>} Array of compiler versions
 */
export const fetchCompilerVersions = async () => {
  try {
    const response = await axios.get('https://binaries.soliditylang.org/bin/list.json');
    const data = response.data;
    
    // Extract release versions (excluding nightly builds)
    const versions = Object.keys(data.releases).map(version => ({
      value: version,
      label: version
    }));
    
    // Sort versions in descending order (newest first)
    versions.sort((a, b) => {
      const versionA = a.value.split('.').map(Number);
      const versionB = b.value.split('.').map(Number);
      
      for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0;
        const numB = versionB[i] || 0;
        if (numA !== numB) {
          return numB - numA;
        }
      }
      
      return 0;
    });
    
    return versions;
  } catch (error) {
    console.error('Error fetching compiler versions:', error);
    
    // Fallback to a default list if the fetch fails
    return [
      { value: '0.8.20+commit.a1b79de6', label: '0.8.20' },
      { value: '0.8.19+commit.7dd6d404', label: '0.8.19' },
      { value: '0.8.18+commit.87f61d96', label: '0.8.18' },
      { value: '0.8.17+commit.8df45f5f', label: '0.8.17' },
      { value: '0.8.16+commit.07a7930e', label: '0.8.16' },
      { value: '0.8.15+commit.e14f2714', label: '0.8.15' },
      { value: '0.8.14+commit.80d49f37', label: '0.8.14' },
      { value: '0.8.13+commit.abaa5c0e', label: '0.8.13' },
      { value: '0.8.12+commit.f00d7308', label: '0.8.12' },
      { value: '0.8.11+commit.d7f03943', label: '0.8.11' },
      { value: '0.8.10+commit.fc410830', label: '0.8.10' },
      { value: '0.8.9+commit.e5eed63a', label: '0.8.9' },
      { value: '0.8.8+commit.dddeac2f', label: '0.8.8' },
      { value: '0.8.7+commit.e28d00a7', label: '0.8.7' },
      { value: '0.8.6+commit.11564f7e', label: '0.8.6' },
      { value: '0.8.5+commit.a4f2e591', label: '0.8.5' },
      { value: '0.8.4+commit.c7e474f2', label: '0.8.4' },
      { value: '0.8.3+commit.8d00100c', label: '0.8.3' },
      { value: '0.8.2+commit.661d1103', label: '0.8.2' },
      { value: '0.8.1+commit.df193b15', label: '0.8.1' },
      { value: '0.8.0+commit.c7dfd78e', label: '0.8.0' },
      { value: '0.7.6+commit.7338295f', label: '0.7.6' },
      { value: '0.7.5+commit.eb77ed08', label: '0.7.5' },
      { value: '0.7.4+commit.3f05b770', label: '0.7.4' },
      { value: '0.7.3+commit.9bfce1f6', label: '0.7.3' },
      { value: '0.7.2+commit.51b20bc0', label: '0.7.2' },
      { value: '0.7.1+commit.f4a555be', label: '0.7.1' },
      { value: '0.7.0+commit.9e61f92b', label: '0.7.0' },
      { value: '0.6.12+commit.27d51765', label: '0.6.12' },
      { value: '0.6.11+commit.5ef660b1', label: '0.6.11' },
      { value: '0.6.10+commit.00c0fcaf', label: '0.6.10' },
      { value: '0.6.9+commit.3e3065ac', label: '0.6.9' },
      { value: '0.6.8+commit.0bbfe453', label: '0.6.8' },
      { value: '0.6.7+commit.b8d736ae', label: '0.6.7' },
      { value: '0.6.6+commit.6c089d02', label: '0.6.6' },
      { value: '0.6.5+commit.f956cc89', label: '0.6.5' },
      { value: '0.6.4+commit.1dca32f3', label: '0.6.4' },
      { value: '0.6.3+commit.8dda9521', label: '0.6.3' },
      { value: '0.6.2+commit.bacdbe57', label: '0.6.2' },
      { value: '0.6.1+commit.e6f7d5a4', label: '0.6.1' },
      { value: '0.6.0+commit.26b70077', label: '0.6.0' },
      { value: '0.5.17+commit.d19bba13', label: '0.5.17' },
      { value: '0.5.16+commit.9c3226ce', label: '0.5.16' },
      { value: '0.5.15+commit.6a57276f', label: '0.5.15' },
      { value: '0.5.14+commit.01f1aaa4', label: '0.5.14' },
      { value: '0.5.13+commit.5b0b510c', label: '0.5.13' },
      { value: '0.5.12+commit.7709ece9', label: '0.5.12' },
      { value: '0.5.11+commit.c082d0b4', label: '0.5.11' },
      { value: '0.5.10+commit.5a6ea5b1', label: '0.5.10' },
      { value: '0.5.9+commit.e560f70d', label: '0.5.9' },
      { value: '0.5.8+commit.23d335f2', label: '0.5.8' },
      { value: '0.5.7+commit.6da8b019', label: '0.5.7' },
      { value: '0.5.6+commit.b259423e', label: '0.5.6' },
      { value: '0.5.5+commit.47a71e8f', label: '0.5.5' },
      { value: '0.5.4+commit.9549d8ff', label: '0.5.4' },
      { value: '0.5.3+commit.10d17f24', label: '0.5.3' },
      { value: '0.5.2+commit.1df8f40c', label: '0.5.2' },
      { value: '0.5.1+commit.c8a2cb62', label: '0.5.1' },
      { value: '0.5.0+commit.1d4f565a', label: '0.5.0' },
      { value: '0.4.26+commit.4563c3fc', label: '0.4.26' },
      { value: '0.4.25+commit.59dbf8f1', label: '0.4.25' },
      { value: '0.4.24+commit.e67f0147', label: '0.4.24' },
      { value: '0.4.23+commit.124ca40d', label: '0.4.23' },
      { value: '0.4.22+commit.4cb486ee', label: '0.4.22' },
      { value: '0.4.21+commit.dfe3193c', label: '0.4.21' },
      { value: '0.4.20+commit.3155dd80', label: '0.4.20' },
      { value: '0.4.19+commit.c4cbbb05', label: '0.4.19' },
      { value: '0.4.18+commit.9cf6e910', label: '0.4.18' },
      { value: '0.4.17+commit.bdeb9e52', label: '0.4.17' },
      { value: '0.4.16+commit.d7661dd9', label: '0.4.16' },
      { value: '0.4.15+commit.bbb8e64f', label: '0.4.15' },
      { value: '0.4.14+commit.c2215d46', label: '0.4.14' },
      { value: '0.4.13+commit.0fb4cb1a', label: '0.4.13' },
      { value: '0.4.12+commit.194ff033', label: '0.4.12' },
      { value: '0.4.11+commit.68ef5810', label: '0.4.11' }
    ];
  }
};

/**
 * Helper function to suggest EVM version based on compiler version
 * @param {string} compilerVersion - Compiler version
 * @returns {string} - Suggested EVM version
 */
export const suggestEVMVersion = (compilerVersion) => {
  if (!compilerVersion) return 'cancun';
  
  // Extract the version number
  const match = compilerVersion.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return 'cancun';
  
  const [, major, minor, patch] = match.map(Number);
  
  // Suggest EVM version based on compiler version
  if (major === 0) {
    if (minor < 5) return 'homestead';
    if (minor === 5) return 'byzantium';
    if (minor === 6) return 'istanbul';
    if (minor === 7) return 'london';
    if (minor === 8) {
      if (patch < 10) return 'london';
      if (patch < 18) return 'paris';
      return 'shanghai';
    }
  }
  
  // Default to latest for newer versions
  return 'cancun';
};

// Available EVM versions
export const evmVersions = [
  { value: 'cancun', label: 'Cancun (Default)' },
  { value: 'shanghai', label: 'Shanghai' },
  { value: 'paris', label: 'Paris (The Merge)' },
  { value: 'london', label: 'London' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'istanbul', label: 'Istanbul' },
  { value: 'petersburg', label: 'Petersburg' },
  { value: 'constantinople', label: 'Constantinople' },
  { value: 'byzantium', label: 'Byzantium' },
  { value: 'spuriousDragon', label: 'Spurious Dragon' },
  { value: 'tangerineWhistle', label: 'Tangerine Whistle' },
  { value: 'homestead', label: 'Homestead' }
];

// Available licenses
export const licenses = [
  'None', 'MIT', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'OSL-3.0', 'Apache-2.0', 'AGPL-3.0'
];

/**
 * Default form data for contract verification
 */
export const defaultFormData = {
  address: '',
  sourceCode: '',
  compilerVersion: '',
  contractName: '',
  optimizationUsed: false,
  runs: 200,
  constructorArguments: '',
  libraries: {},
  evmVersion: 'cancun',
  license: 'MIT'
};
