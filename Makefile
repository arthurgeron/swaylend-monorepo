# Define the default target
.PHONY: all
all: install build build-release

# Target to install dependencies using pnpm
.PHONY: install
install:
	pnpm install

# Target to build the project using forc
.PHONY: build
build:
	forc build

# Target to build the project in release mode using forc
.PHONY: build-release
build-release:
	forc build --release
