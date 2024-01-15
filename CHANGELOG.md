# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0]
### Uncategorized
- only migrate events that were added via the proxy ([#53](https://github.com/MetaMask/swappable-obj-proxy/pull/53))
- Bump @metamask/auto-changelog from 3.4.3 to 3.4.4 ([#54](https://github.com/MetaMask/swappable-obj-proxy/pull/54))
- Bump ESLint packages ([#52](https://github.com/MetaMask/swappable-obj-proxy/pull/52))
- Bump @metamask/auto-changelog from 3.4.2 to 3.4.3 ([#51](https://github.com/MetaMask/swappable-obj-proxy/pull/51))
- Bump @metamask/auto-changelog from 3.3.0 to 3.4.2 ([#50](https://github.com/MetaMask/swappable-obj-proxy/pull/50))
- Bump @babel/traverse from 7.20.13 to 7.23.2 ([#47](https://github.com/MetaMask/swappable-obj-proxy/pull/47))
- Bump postcss from 8.4.21 to 8.4.31 ([#46](https://github.com/MetaMask/swappable-obj-proxy/pull/46))
- Bump @metamask/auto-changelog from 3.2.0 to 3.3.0 ([#45](https://github.com/MetaMask/swappable-obj-proxy/pull/45))
- devDeps: lavamoat-allow-scripts@^2.0.3->^2.3.1 ([#43](https://github.com/MetaMask/swappable-obj-proxy/pull/43))
- Bump word-wrap from 1.2.3 to 1.2.4 ([#42](https://github.com/MetaMask/swappable-obj-proxy/pull/42))
- Bump @metamask/auto-changelog from 3.1.0 to 3.2.0 ([#41](https://github.com/MetaMask/swappable-obj-proxy/pull/41))
- Bump semver from 6.3.0 to 6.3.1 ([#36](https://github.com/MetaMask/swappable-obj-proxy/pull/36))

## [2.1.0]
### Added
- Convert this library to TypeScript ([#27](https://github.com/MetaMask/swappable-obj-proxy/pull/27))
  - You should now be able to use this library in a TypeScript codebase without having to provide your own types.

## [2.0.0]
### Added
- Re-release of this package
  - This package was previously released under [`swappable-obj-proxy`](https://www.npmjs.com/package/swappable-obj-proxy) (latest version: 1.1.0). We've begun the version history of `@metamask/swappable-obj-proxy` at 2.0.0 in order to prevent any confusion. Past releases of `swappable-obj-proxy` are not explicitly recorded, but can be traced through the [commit history](https://github.com/MetaMask/swappable-obj-proxy/commits/main). All entries after this line are new additions since the previous release.
- Support proxying instances of class that reference private fields ([#10](https://github.com/MetaMask/swappable-obj-proxy/pull/10))
- Add type definitions for TypeScript projects ([#13](https://github.com/MetaMask/swappable-obj-proxy/pull/13))

[Unreleased]: https://github.com/MetaMask/swappable-obj-proxy/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/MetaMask/swappable-obj-proxy/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/MetaMask/swappable-obj-proxy/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/MetaMask/swappable-obj-proxy/releases/tag/v2.0.0
