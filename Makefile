COFFEE := $(shell find lib/ test/ -name '*.coffee')
JS := $(patsubst %.coffee,%.js,$(COFFEE))

all: coffee

.PHONY: clean watch coffee

watch:
	while true; do inotifywait $(COFFEE) -e modify; make coffee; done;

coffee: $(JS)

%.js: %.coffee
	coffee -c $<