
VERSION ?= b26
JAVA_VERSION ?= 2019-10-08

all: build rename seal publish

build:
	@echo "Building Soy..."
	@mvn clean package install test

rename:
	@echo "Pushing Bloombox software JARs..."
	@cd target && \
		mv soy-$(JAVA_VERSION).jar soy-lib-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-with-dependencies.jar soy-lib-opt-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-SoyToPySrcCompiler.jar soy-py-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-SoyToJsSrcCompiler.jar soy-js-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-SoyToIncrementalDomSrcCompiler.jar soy-idom-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-SoyParseInfoGenerator.jar soy-parseinfo-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-SoyMsgExtractor.jar soy-msgextractor-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-SoyHeaderCompiler.jar soy-header-$(VERSION).jar && \
		mv soy-$(JAVA_VERSION)-jssrc_js.jar soy-jssrc-$(VERSION).jar;

seal:
	@echo "--- Release seals: ---"
	@echo $(shell gsha256sum target/soy-lib-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-lib-opt-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-py-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-js-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-idom-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-parseinfo-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-msgextractor-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-header-$(VERSION).jar)
	@echo $(shell gsha256sum target/soy-jssrc-$(VERSION).jar)
	@echo "----------------------"

publish:
	@cd target && \
		gsutil -m cp ./*.jar gs://bloom-software/frontend/soy;
	@echo "Soy release pushed."

