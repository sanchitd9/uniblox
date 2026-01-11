.PHONY: start stop install

BACKEND_PID=.backend.pid
FRONTEND_PID=.frontend.pid

start:
	@setsid npm run dev </dev/null >/dev/null 2>&1 & echo $$! > $(BACKEND_PID)
	@echo "Backend PID: $$(cat $(BACKEND_PID))"
	@setsid npm run dev --prefix frontend </dev/null >/dev/null 2>&1 & echo $$! > $(FRONTEND_PID)
	@echo "Frontend PID: $$(cat $(FRONTEND_PID))"

stop:
	@-kill -9 -$$(cat $(BACKEND_PID)) 2>/dev/null || true
	@rm -f $(BACKEND_PID)

	@-kill -9 -$$(cat $(FRONTEND_PID)) 2>/dev/null || true
	@rm -f $(FRONTEND_PID)

install:
	npm install
	npm install --prefix frontend
