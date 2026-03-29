/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0 */

// JSII compatible fork of types from https://github.com/JamieMason/syncpack/blob/main/npm/syncpack.ts (v14)

/**
 * Types and constants for Syncpack usage in the monorepo
 * @see https://syncpack.dev/
 */
export namespace Syncpack {
  /**
   * Aliases for semver range formats supported by syncpack
   *
   * Defaults to `""` to ensure that exact dependency versions are used instead of
   * loose ranges, but this can be overridden in your config file.
   *
   * | Supported Range |   Example |
   * | --------------- | --------: |
   * | `"<"`           |  `<1.4.2` |
   * | `"<="`          | `<=1.4.2` |
   * | `""`            |   `1.4.2` |
   * | `"~"`           |  `~1.4.2` |
   * | `"^"`           |  `^1.4.2` |
   * | `">="`          | `>=1.4.2` |
   * | `">"`           |  `>1.4.2` |
   * | `"*"`           |       `*` |
   *
   * @default ""
   */
  export type SemverRange =
    | ""
    | "*"
    | ">"
    | ">="
    | ".x"
    | "<"
    | "<="
    | "^"
    | "~";

  export const CUSTOM_TYPES = {
    dev: {
      strategy: "versionsByName",
      path: "devDependencies",
    },
    local: {
      strategy: "name~version",
      namePath: "name",
      path: "version",
    },
    overrides: {
      strategy: "versionsByName",
      path: "overrides",
    },
    peer: {
      strategy: "versionsByName",
      path: "peerDependencies",
    },
    pnpmOverrides: {
      strategy: "versionsByName",
      path: "pnpm.overrides",
    },
    prod: {
      strategy: "versionsByName",
      path: "dependencies",
    },
    resolutions: {
      strategy: "versionsByName",
      path: "resolutions",
    },
  } as const;

  type DefaultDependencyType = keyof typeof CUSTOM_TYPES;

  export type DependencyType =
    | DefaultDependencyType
    | `!${DefaultDependencyType}`
    // This is done to allow any other `string` while also offering intellisense
    // for the internal dependency types above. `(string & {})` is needed to
    // prevent typescript from ignoring these specific strings and merging them
    // all into `string`, where we'd lose any editor autocomplete for the other
    // more specific fields, using (string & {}) stops that from happening.
    //
    // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {});

  // NB: for brevity we use "string" instead of re-defining all the different specifier types here:
  // https://github.com/JamieMason/syncpack/blob/db2b31ccdb1a28fdbe0c42d27ce956ea5c6c543a/src/specifier/index.ts#L16-L27
  export type SpecifierType = string;

  export interface GroupSelector {
    readonly dependencies?: string[];
    readonly dependencyTypes?: DependencyType[];
    readonly label?: string;
    readonly packages?: string[];
    readonly specifierTypes?: SpecifierType[];
  }

  export namespace SemverGroupConfig {
    export interface Ignored extends GroupSelector {
      readonly isIgnored: true;
    }

    export interface WithRange extends GroupSelector {
      readonly range: SemverRange;
    }

    export type Any = Ignored | WithRange;
  }

  export namespace VersionGroupConfig {
    export interface Banned extends GroupSelector {
      readonly isBanned: true;
    }

    export interface Ignored extends GroupSelector {
      readonly isIgnored: true;
    }

    export interface Pinned extends GroupSelector {
      readonly pinVersion: string;
    }

    export interface SnappedTo extends GroupSelector {
      readonly snapTo: string[];
    }

    export interface SameRange extends GroupSelector {
      readonly policy: "sameRange";
    }

    export interface SameMinor extends GroupSelector {
      readonly policy: "sameMinor";
    }

    export interface Standard extends GroupSelector {
      readonly preferVersion?: "highestSemver" | "lowestSemver";
    }

    export type Any =
      | Banned
      | Ignored
      | Pinned
      | SameMinor
      | SameRange
      | SnappedTo
      | Standard;
  }

  export namespace CustomTypeConfig {
    export interface NameAndVersionProps {
      readonly namePath: string;
      readonly path: string;
      readonly strategy: "name~version";
    }

    export interface NamedVersionString {
      readonly path: string;
      readonly strategy: "name@version";
    }

    export interface UnnamedVersionString {
      readonly path: string;
      readonly strategy: "version";
    }

    export interface VersionsByName {
      readonly path: string;
      readonly strategy: "versionsByName";
    }

    export type Any =
      | NameAndVersionProps
      | NamedVersionString
      | UnnamedVersionString
      | VersionsByName;
  }

  export interface DependencyGroup {
    readonly aliasName: string;
    readonly dependencies?: string[];
    readonly dependencyTypes?: DependencyType[];
    readonly packages?: string[];
    readonly specifierTypes?: SpecifierType[];
  }

  /**
   * Configuration for Syncpack
   * @see https://syncpack.dev/
   */
  export interface SyncpackConfig {
    /** @see https://syncpack.dev/config/custom-types/ */
    readonly customTypes?: Record<string, CustomTypeConfig.Any>;
    /** @see https://syncpack.dev/config/dependency-groups/ */
    readonly dependencyGroups?: DependencyGroup[];
    /** @see https://syncpack.dev/config/format-bugs/ */
    readonly formatBugs?: boolean;
    /** @see https://syncpack.dev/config/format-repository/ */
    readonly formatRepository?: boolean;
    /** @see https://syncpack.dev/config/indent/ */
    readonly indent?: string;
    /** @see https://syncpack.dev/ */
    readonly maxConcurrentRequests?: number;
    /** @see https://syncpack.dev/semver-groups/ */
    readonly semverGroups?: SemverGroupConfig.Any[];
    /** @see https://syncpack.dev/config/sort-az/ */
    readonly sortAz?: string[];
    /** @see https://syncpack.dev/config/sort-exports/ */
    readonly sortExports?: string[];
    /** @see https://syncpack.dev/config/sort-first/ */
    readonly sortFirst?: string[];
    /** @see https://syncpack.dev/config/sort-packages/ */
    readonly sortPackages?: boolean;
    /** @see https://syncpack.dev/config/source/ */
    readonly source?: string[];
    /** @see https://syncpack.dev/ */
    readonly strict?: boolean;
    /** @see https://syncpack.dev/version-groups/ */
    readonly versionGroups?: VersionGroupConfig.Any[];
  }

  /**
   * Default monorepo configuration for Syncpack
   * @see https://syncpack.dev/
   */
  export const DEFAULT_CONFIG: Syncpack.SyncpackConfig = {
    indent: "  ",
    semverGroups: [
      {
        label: "Ignore local workspace deps",
        dependencies: ["**"],
        dependencyTypes: ["local"],
        packages: ["**"],
        isIgnored: true,
      },
      {
        dependencies: ["**"],
        dependencyTypes: ["**"],
        packages: ["**"],
        range: "",
      },
    ],
    sortAz: [
      "contributors",
      "dependencies",
      "devDependencies",
      "keywords",
      "peerDependencies",
      "resolutions",
      "scripts",
    ],
    sortFirst: ["name", "description", "version", "author"],
    source: [],
    versionGroups: [
      {
        label: "Ignore local workspace deps",
        dependencies: ["**"],
        dependencyTypes: ["local"],
        packages: ["**"],
        isIgnored: true,
      },
    ],
  };
}
