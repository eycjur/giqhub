.DEFAULT_GOAL := all

.PHONY: all
all: format lint check

.PHONY: format
format:
	yarn run format

.PHONY: lint
lint:
	yarn run lint

.PHONY: check
check:
	yarn run check
