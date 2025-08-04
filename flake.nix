{
  description = "SwampScheduler Nix Flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    devenv.url = "github:cachix/devenv";
    devenv.inputs.nixpkgs.follows = "nixpkgs";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
    nix2container.url = "github:nlewo/nix2container";
    nix2container.inputs.nixpkgs.follows = "nixpkgs";
    mk-shell-bin.url = "github:rrbutani/nix-mk-shell-bin";
    nixpkgs-python.url = "github:cachix/nixpkgs-python";
    nixpkgs-python.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    inputs@{ flake-parts, systems, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import systems;

      imports = [
        inputs.devenv.flakeModule
        inputs.treefmt-nix.flakeModule
      ];

      perSystem =
        { config, pkgs, ... }:
        {
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              ruff = {
                enable = true;
                format = true;
                check = true;
              };
              mypy.enable = true;

              prettier = {
                enable = true;
                includes = [
                  "*.js"
                  "*.jsx"
                  "*.ts"
                  "*.tsx"
                  "*.json"
                  "*.css"
                  "*.html"
                  "*.md"
                  "*.yml"
                  "*.yaml"
                ];
              };

              nixfmt.enable = true;
              nixfmt.package = pkgs.nixfmt-rfc-style;
            };

            settings = {
              global.excludes = [
                "node_modules"
                ".git"
                "*.min.js"
                "*.min.css"
                "build/"
                "dist/"
                "*.lock"
                "package-lock.json"
                "__pycache__"
                "*.pyc"
                ".env"
                "swamp_env/"
              ];

              formatter = {
                prettier = {
                  options = [
                    "--single-quote"
                    "--jsx-single-quote"
                    "--trailing-comma"
                    "es5"
                  ];
                };
              };
            };
          };

          devenv.shells.default = {
            name = "swampscheduler";

            languages.python = {
              enable = true;
              version = "3.11";
              venv = {
                enable = true;
                quiet = true;
                requirements = ./backend/requirements.txt;
              };
            };

            languages.javascript = {
              enable = true;
              package = pkgs.nodejs_20;
              npm.enable = true;
            };

            env = {
              FLASK_APP = "backend/app.py";
              FLASK_ENV = "development";
              FLASK_DEBUG = "1";
            };

            packages = with pkgs; [
              git
              curl
              jq
              python311Packages.pip
              python311Packages.black
              python311Packages.pytest
              nodePackages.eslint
              nodePackages.typescript
              postgresql
            ];

            processes = {
              backend.exec = "cd backend && python app.py";
              frontend.exec = "cd frontend && npm start";
            };

            scripts = {
              start-all.exec = ''
                devenv up
              '';

              backend.exec = ''
                cd backend && python app.py
              '';

              frontend.exec = ''
                cd frontend && npm start
              '';

              install-deps.exec = ''
                cd frontend && npm install
              '';
            };

            enterShell = ''
              # Auto-install npm packages if needed
              if [ ! -d "frontend/node_modules" ] || [ "frontend/package.json" -nt "frontend/node_modules" ]; then
                echo "Installing frontend dependencies..."
                (cd frontend && npm install --silent)
              fi

              echo "🐊 Welcome to SwampScheduler Development Environment!"
              echo ""
              echo "Available commands:"
              echo "  backend   - Start Flask development server"
              echo "  frontend  - Start React development server"
              echo "  nix fmt   - Format and Lint ALL code"
              echo ""
              echo "Quick start:"
              echo "  1. Run 'backend' in one terminal"
              echo "  2. Run 'frontend' in another terminal"
              echo ""

              # Check if .env exists
              if [ ! -f backend/.env ]; then
                echo "   Warning: backend/.env not found!"
                echo "   Copy backend/.env.example to backend/.env and add your Supabase credentials"
                echo ""
              fi
            '';
          };
        };
    };
}
