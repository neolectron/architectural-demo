{
  description = "formula.now — monorepo dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = fn: nixpkgs.lib.genAttrs systems (system: fn nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            # Node version manager — pins exact Node 26.1.0
            fnm

            # Native module build deps (node-gyp needs python3, make, gcc)
            python3
            gnumake
            gcc

            # @discordjs/opus native dependency
            pkg-config
            libopus

            # Docker CLI (daemon is system-managed, we just need the client)
            docker
            docker-compose
          ];

          shellHook = ''
            # Set up fnm and install exact Node version
            eval "$(fnm env)"
            fnm use --install-if-missing --silent-if-unchanged > /dev/null 2>&1
            npm install -g pnpm@11.0.9 > /dev/null 2>&1
            echo "node $(node --version)"
            echo "pnpm $(pnpm --version)"
            echo "docker $(docker --version)"
          '';
        };
      });
    };
}
