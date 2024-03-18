# Changelog

## v0.0.11

### Add

- Support for handling Claude API
- Support for returning input_tokens and output_tokens in `onUsage`

## v0.0.9

### Added

- All pending tasks are uniformly processed as "[DONE]" and only returned once

### Fixed

- In some scenarios, it may return incomplete information flow
- Garbled text in streaming response
