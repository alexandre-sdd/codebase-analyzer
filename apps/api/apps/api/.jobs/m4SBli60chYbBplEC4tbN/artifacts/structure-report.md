# Repository Structure Report: checkout

## Source
- Input: `https://github.com/zulip/zulip`
- Resolved local path: `/Users/alexandresepulvedadedietrich/codebase-analyzer/apps/api/apps/api/.jobs/m4SBli60chYbBplEC4tbN/checkout`
- Scanned at: `2026-02-14T22:19:12.729Z`

## Executive Summary
- Total files scanned: **8,935**
- Total bytes scanned: **109.3 MiB**
- Top-level directories: **20**
- Detected manifests/config files: **5**
- Module graph: **13 nodes / 2 edges**

## Language Breakdown
| Language | Files | Bytes |
|---|---:|---:|
| PNG | 481 | 32.6 MiB |
| JSON | 3,094 | 18.5 MiB |
| Python | 1,964 | 15.2 MiB |
| PO | 50 | 13.0 MiB |
| TypeScript | 455 | 5.0 MiB |
| JPG | 23 | 4.8 MiB |
| SVG | 372 | 3.0 MiB |
| JavaScript | 207 | 2.5 MiB |
| Markdown | 389 | 2.4 MiB |
| GIF | 13 | 2.2 MiB |
| YAML | 20 | 2.1 MiB |
| CSS | 72 | 1.2 MiB |
| LOCK | 1 | 1.1 MiB |
| BSON | 13 | 978.0 KiB |
| Unknown | 220 | 923.8 KiB |
| HTML | 223 | 901.7 KiB |
| MDX | 448 | 853.0 KiB |
| HBS | 453 | 726.7 KiB |
| OGG | 30 | 345.9 KiB |
| MP3 | 30 | 276.5 KiB |
| PDF | 1 | 142.8 KiB |
| PP | 103 | 139.4 KiB |
| ERB | 56 | 114.9 KiB |
| CFG | 9 | 77.0 KiB |

## Top-Level Directory Analysis
### `static`
- Files: **606**
- Size: **32.8 MiB**
- Language mix: PNG: 395, SVG: 142, MP3: 30, OGG: 30, JPG: 5
- Largest files:
  - `static/images/landing-page/case-studies/WindBorne-constellation.png` (4.3 MiB)
  - `static/images/landing-page/hello/original/screen-4-dark.png` (2.1 MiB)
  - `static/images/navigation-tour-video-thumbnail.png` (1.3 MiB)
  - `static/images/landing-page/case-studies/Alaska-balloon.jpg` (1.1 MiB)
  - `static/images/landing-page/hello/original/screen-4.png` (723.1 KiB)
  - `static/images/unused/cartoon.png` (715.7 KiB)
  - `static/images/landing-page/education/interactive_messaging_night.png` (578.1 KiB)
  - `static/images/landing-page/hello/original/screen-2.png` (481.0 KiB)

### `zerver`
- Files: **2,933**
- Size: **20.6 MiB**
- Language mix: Python: 1626, JSON: 1134, Markdown: 92, TXT: 25, BSON: 13
- Largest files:
  - `zerver/openapi/zulip.yaml` (1.4 MiB)
  - `zerver/tests/fixtures/rocketchat_fixtures/rocketchat_uploads.chunks.bson` (871.6 KiB)
  - `zerver/tests/test_auth_backends.py` (379.4 KiB)
  - `zerver/tests/test_message_fetch.py` (247.1 KiB)
  - `zerver/tests/test_events.py` (236.3 KiB)
  - `zerver/tests/test_subs.py` (228.6 KiB)
  - `zerver/tests/fixtures/user_agents_unique` (198.7 KiB)
  - `zerver/tests/test_user_groups.py` (166.3 KiB)

### `locale`
- Files: **143**
- Size: **20.1 MiB**
- Language mix: JSON: 93, PO: 50
- Largest files:
  - `locale/ta/LC_MESSAGES/django.po` (381.6 KiB)
  - `locale/ru/LC_MESSAGES/django.po` (366.2 KiB)
  - `locale/uk/LC_MESSAGES/django.po` (365.1 KiB)
  - `locale/fa/LC_MESSAGES/django.po` (346.5 KiB)
  - `locale/gu/LC_MESSAGES/django.po` (336.1 KiB)
  - `locale/de/LC_MESSAGES/django.po` (317.1 KiB)
  - `locale/pt/LC_MESSAGES/django.po` (311.1 KiB)
  - `locale/pl/LC_MESSAGES/django.po` (311.0 KiB)

### `web`
- Files: **1,433**
- Size: **13.3 MiB**
- Language mix: HBS: 453, TypeScript: 447, SVG: 227, JavaScript: 199, CSS: 69
- Largest files:
  - `web/images/landing-page/pycon-drone.jpg` (775.2 KiB)
  - `web/images/app-screenshots/iphoneX.svg` (680.5 KiB)
  - `web/images/landing-page/pycon.jpg` (334.9 KiB)
  - `web/images/landing-page/education/for-education-cover.jpg` (329.1 KiB)
  - `web/images/landing-page/features/notifications.jpg` (277.6 KiB)
  - `web/images/landing-page/mit-lobby-7.jpg` (194.1 KiB)
  - `web/images/landing-page/education/companies-laptop.jpg` (165.5 KiB)
  - `web/images/landing-page/clouds.jpg` (156.5 KiB)

### `corporate`
- Files: **1,942**
- Size: **7.6 MiB**
- Language mix: JSON: 1853, Python: 89
- Largest files:
  - `corporate/tests/test_stripe.py` (468.4 KiB)
  - `corporate/lib/stripe.py` (252.1 KiB)
  - `corporate/tests/test_support_views.py` (86.5 KiB)
  - `corporate/tests/test_remote_billing.py` (70.5 KiB)
  - `corporate/tests/stripe_fixtures/free_trial_not_available_for_complimentary_access_customer--Event.list.2.json` (47.8 KiB)
  - `corporate/tests/stripe_fixtures/upgrade_remote_realm_user_to_monthly_basic_plan--Event.list.2.json` (47.0 KiB)
  - `corporate/tests/stripe_fixtures/migrate_customer_server_to_realms_and_upgrade--Event.list.2.json` (47.0 KiB)
  - `corporate/tests/stripe_fixtures/stripe_billing_portal_urls_for_remote_server--Event.list.2.json` (46.9 KiB)

### `docs`
- Files: **212**
- Size: **6.4 MiB**
- Language mix: Markdown: 171, PNG: 28, GIF: 5, Unknown: 3, SVG: 2
- Largest files:
  - `docs/images/zulip-gui-stage.gif` (823.5 KiB)
  - `docs/images/zulip-circleci.gif` (726.1 KiB)
  - `docs/images/general-chat-after.gif` (512.5 KiB)
  - `docs/images/firefox-rwd-capture-medium.png` (350.7 KiB)
  - `docs/images/firefox-rwd-capture-mobile.png` (262.6 KiB)
  - `docs/overview/changelog.md` (260.8 KiB)
  - `docs/images/browser-capture-after.png` (239.0 KiB)
  - `docs/images/browser-capture-before.png` (239.0 KiB)

### `starlight_help`
- Files: **493**
- Size: **2.1 MiB**
- Language mix: MDX: 448, PNG: 25, ASTRO: 10, TypeScript: 4, JavaScript: 2
- Largest files:
  - `starlight_help/src/images/user-list-actions.png` (274.5 KiB)
  - `starlight_help/src/images/channels-and-topics.png` (180.2 KiB)
  - `starlight_help/src/images/compose-actions.png` (168.1 KiB)
  - `starlight_help/src/images/example-invitation-email.png` (133.7 KiB)
  - `starlight_help/src/images/message-actions.png` (112.1 KiB)
  - `starlight_help/src/images/spoiler-expanded.png` (66.8 KiB)
  - `starlight_help/src/images/spoiler-collapsed.png` (38.9 KiB)
  - `starlight_help/src/images/markdown-numbered-lists.png` (38.2 KiB)

### `templates`
- Files: **357**
- Size: **1.2 MiB**
- Language mix: HTML: 218, Markdown: 77, TXT: 58, Unknown: 2, CSS: 1
- Largest files:
  - `templates/corporate/comparison_table_integrated.html` (133.2 KiB)
  - `templates/corporate/policies/terms.md` (45.3 KiB)
  - `templates/corporate/billing/billing.html` (39.5 KiB)
  - `templates/corporate/policies/privacy.md` (39.0 KiB)
  - `templates/corporate/for/open-source.html` (35.5 KiB)
  - `templates/corporate/for/business.html` (30.6 KiB)
  - `templates/corporate/pricing_model.html` (28.7 KiB)
  - `templates/corporate/role/engineers.html` (24.9 KiB)

### `tools`
- Files: **194**
- Size: **1.1 MiB**
- Language mix: Unknown: 109, Python: 44, PNG: 8, JSON: 7, TypeScript: 4
- Largest files:
  - `tools/setup/emoji/emoji_names.py` (139.1 KiB)
  - `tools/setup/emoji/custom_emoji_names.py` (93.3 KiB)
  - `tools/linter_lib/custom_check.py` (40.6 KiB)
  - `tools/screenshots/user_avatars/ElenaGarcia.jpg` (39.7 KiB)
  - `tools/screenshots/user_avatars/DalKim.jpg` (36.4 KiB)
  - `tools/setup/emoji/emoji_map.json` (32.7 KiB)
  - `tools/screenshots/user_avatars/BoWilliams.png` (25.4 KiB)
  - `tools/screenshots/user_avatars/KevinLin.png` (25.1 KiB)

### `uv.lock`
- Files: **1**
- Size: **1.1 MiB**
- Language mix: LOCK: 1
- Largest files:
  - `uv.lock` (1.1 MiB)

### `pnpm-lock.yaml`
- Files: **1**
- Size: **709.5 KiB**
- Language mix: YAML: 1
- Largest files:
  - `pnpm-lock.yaml` (709.5 KiB)

### `puppet`
- Files: **266**
- Size: **458.7 KiB**
- Language mix: PP: 103, ERB: 56, Unknown: 38, CONF: 19, Other (.rb): 12
- Largest files:
  - `puppet/kandra/files/nagios4/nagios.cfg` (44.0 KiB)
  - `puppet/zulip/templates/postgresql/14/postgresql.conf.template.erb` (31.4 KiB)
  - `puppet/kandra/files/nagios4/conf.d/services.cfg` (16.1 KiB)
  - `puppet/kandra/files/memcached_exporter` (15.8 KiB)
  - `puppet/kandra/templates/nagios4/cgi.cfg.template.erb` (12.2 KiB)
  - `puppet/zulip/manifests/app_frontend_base.pp` (10.4 KiB)
  - `puppet/kandra/files/weblate_exporter` (10.3 KiB)
  - `puppet/zulip/templates/supervisor/zulip.conf.template.erb` (9.7 KiB)

### `zproject`
- Files: **20**
- Size: **371.1 KiB**
- Language mix: Python: 19, PYI: 1
- Largest files:
  - `zproject/backends.py` (165.4 KiB)
  - `zproject/computed_settings.py` (48.4 KiB)
  - `zproject/urls.py` (39.3 KiB)
  - `zproject/prod_settings_template.py` (38.5 KiB)
  - `zproject/default_settings.py` (30.9 KiB)
  - `zproject/test_extra_settings.py` (10.3 KiB)
  - `zproject/dev_settings.py` (9.1 KiB)
  - `zproject/dev_urls.py` (5.3 KiB)

### `zilencer`
- Files: **96**
- Size: **328.9 KiB**
- Language mix: Python: 95, Markdown: 1
- Largest files:
  - `zilencer/views.py` (70.4 KiB)
  - `zilencer/management/commands/populate_db.py` (60.7 KiB)
  - `zilencer/migrations/0001_squashed_0064_remotezulipserver_last_merge_base.py` (26.1 KiB)
  - `zilencer/models.py` (25.5 KiB)
  - `zilencer/management/commands/populate_billing_realms.py` (22.2 KiB)
  - `zilencer/lib/push_notifications.py` (8.8 KiB)
  - `zilencer/management/commands/add_mock_conversation.py` (6.6 KiB)
  - `zilencer/auth.py` (6.4 KiB)

### `scripts`
- Files: **81**
- Size: **279.9 KiB**
- Language mix: Unknown: 45, Python: 16, LIST: 8, ASC: 6, SQL: 2
- Largest files:
  - `scripts/setup/apt-repos/zulip/apache-arrow-keyring.gpg` (43.1 KiB)
  - `scripts/lib/install` (26.0 KiB)
  - `scripts/lib/zulip_tools.py` (23.2 KiB)
  - `scripts/log-search` (20.5 KiB)
  - `scripts/lib/upgrade-zulip-stage-3` (14.6 KiB)
  - `scripts/restart-server` (13.5 KiB)
  - `scripts/setup/generate_secrets.py` (8.2 KiB)
  - `scripts/lib/check_rabbitmq_queue.py` (7.5 KiB)

### `api_docs`
- Files: **26**
- Size: **266.7 KiB**
- Language mix: Markdown: 26
- Largest files:
  - `api_docs/changelog.md` (180.3 KiB)
  - `api_docs/message-formatting.md` (20.9 KiB)
  - `api_docs/mobile-notifications.md` (8.0 KiB)
  - `api_docs/construct-narrow.md` (7.9 KiB)
  - `api_docs/include/rest-endpoints.md` (7.4 KiB)
  - `api_docs/group-setting-values.md` (5.4 KiB)
  - `api_docs/configuring-python-bindings.md` (5.0 KiB)
  - `api_docs/zulip-urls.md` (4.3 KiB)

### `analytics`
- Files: **43**
- Size: **254.4 KiB**
- Language mix: Python: 43
- Largest files:
  - `analytics/tests/test_counts.py` (87.8 KiB)
  - `analytics/lib/counts.py` (38.6 KiB)
  - `analytics/tests/test_stats_views.py` (26.8 KiB)
  - `analytics/views/stats.py` (22.3 KiB)
  - `analytics/management/commands/populate_analytics_db.py` (15.4 KiB)
  - `analytics/migrations/0001_squashed_0021_alter_fillstate_id.py` (8.8 KiB)
  - `analytics/migrations/0001_initial.py` (7.3 KiB)
  - `analytics/models.py` (5.1 KiB)

### `.claude`
- Files: **7**
- Size: **43.4 KiB**
- Language mix: Markdown: 5, Unknown: 2
- Largest files:
  - `.claude/CLAUDE.md` (18.6 KiB)
  - `.claude/skills/fix-backend-coverage/analyze-coverage` (7.0 KiB)
  - `.claude/skills/visual-test/SKILL.md` (5.1 KiB)
  - `.claude/skills/fetch-zulip-messages/fetch-zulip-web-public-messages` (4.6 KiB)
  - `.claude/skills/fix-backend-coverage/SKILL.md` (3.8 KiB)
  - `.claude/skills/debug-node-coverage/SKILL.md` (2.8 KiB)
  - `.claude/skills/fetch-zulip-messages/SKILL.md` (1.5 KiB)

### `.github`
- Files: **14**
- Size: **38.3 KiB**
- Language mix: Other (.yml): 8, Markdown: 4, JSON: 1, YAML: 1
- Largest files:
  - `.github/workflows/production-suite.yml` (11.2 KiB)
  - `.github/workflows/zulip-ci.yml` (9.7 KiB)
  - `.github/funding.json` (4.8 KiB)
  - `.github/workflows/zulip-cloud-deploy.yaml` (3.0 KiB)
  - `.github/workflows/api-docs-update-check.yml` (2.3 KiB)
  - `.github/pull_request_template.md` (1.9 KiB)
  - `.github/workflows/auto-add-parent-label.yml` (1.3 KiB)
  - `.github/workflows/codeql-analysis.yml` (1.1 KiB)

### `patches`
- Files: **7**
- Size: **35.6 KiB**
- Language mix: PATCH: 7
- Largest files:
  - `patches/autosize.patch` (30.7 KiB)
  - `patches/handlebars.patch` (1.4 KiB)
  - `patches/textarea-caret@3.1.0.patch` (1012 B)
  - `patches/svgicons2svgfont.patch` (929 B)
  - `patches/jquery-caret-plugin.patch` (743 B)
  - `patches/simplebar.patch` (448 B)
  - `patches/tippy.js@6.3.7.patch` (423 B)

### `confirmation`
- Files: **27**
- Size: **33.1 KiB**
- Language mix: Python: 24, TXT: 3
- Largest files:
  - `confirmation/models.py` (10.4 KiB)
  - `confirmation/migrations/0016_realmcreationkey_to_realmcreationstatus.py` (4.7 KiB)
  - `confirmation/migrations/0001_squashed_0014_confirmation_confirmatio_content_80155a_idx.py` (3.4 KiB)
  - `confirmation/migrations/0009_confirmation_expiry_date_backfill.py` (2.5 KiB)
  - `confirmation/LICENSE.txt` (1.5 KiB)
  - `confirmation/migrations/0001_initial.py` (1.2 KiB)
  - `confirmation/migrations/0007_add_indexes.py` (1.1 KiB)
  - `confirmation/__init__.py` (1.1 KiB)

### `CONTRIBUTING.md`
- Files: **1**
- Size: **30.8 KiB**
- Language mix: Markdown: 1
- Largest files:
  - `CONTRIBUTING.md` (30.8 KiB)

### `pyproject.toml`
- Files: **1**
- Size: **14.5 KiB**
- Language mix: TOML: 1
- Largest files:
  - `pyproject.toml` (14.5 KiB)

### `eslint.config.js`
- Files: **1**
- Size: **11.4 KiB**
- Language mix: JavaScript: 1
- Largest files:
  - `eslint.config.js` (11.4 KiB)

### `LICENSE`
- Files: **1**
- Size: **11.1 KiB**
- Language mix: Unknown: 1
- Largest files:
  - `LICENSE` (11.1 KiB)

### `.mailmap`
- Files: **1**
- Size: **10.0 KiB**
- Language mix: Unknown: 1
- Largest files:
  - `.mailmap` (10.0 KiB)

### `CODE_OF_CONDUCT.md`
- Files: **1**
- Size: **8.3 KiB**
- Language mix: Markdown: 1
- Largest files:
  - `CODE_OF_CONDUCT.md` (8.3 KiB)

### `SECURITY.md`
- Files: **1**
- Size: **6.7 KiB**
- Language mix: Markdown: 1
- Largest files:
  - `SECURITY.md` (6.7 KiB)

## Dependency and Module Graph
Modules are coarse buckets inferred from folder conventions (`src/*`, `apps/*`, `packages/*`, and top-level directories). Edges are relative-import counts, so this is a structural hint map, not an exact call graph.

### Most Connected Modules
- `web`: connectivity=6, incoming=0, outgoing=6
- `static`: connectivity=3, incoming=3, outgoing=0
- `zerver`: connectivity=3, incoming=3, outgoing=0
- `analytics`: connectivity=0, incoming=0, outgoing=0
- `confirmation`: connectivity=0, incoming=0, outgoing=0
- `corporate`: connectivity=0, incoming=0, outgoing=0
- `eslint.config.js`: connectivity=0, incoming=0, outgoing=0
- `manage.py`: connectivity=0, incoming=0, outgoing=0
- `scripts`: connectivity=0, incoming=0, outgoing=0
- `starlight_help`: connectivity=0, incoming=0, outgoing=0
- `tools`: connectivity=0, incoming=0, outgoing=0
- `zilencer`: connectivity=0, incoming=0, outgoing=0
- `zproject`: connectivity=0, incoming=0, outgoing=0

### Strongest Edges
- `web` -> `zerver` (weight=3)
- `web` -> `static` (weight=3)

## Manifests and Build Signals
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `pyproject.toml`
- `uv.lock`

## Technical Intent Hypotheses
### Node Tooling
- Hypothesis: The repo likely relies on npm scripts for local workflows (dev/build/test) and dependency management.
- Confidence: high
- Evidence: package.json present

### Type Safety
- Hypothesis: TypeScript is likely used to reduce runtime errors and make refactors safer at scale.
- Confidence: high
- Evidence: tsconfig.json present; TypeScript files detected

### Python Runtime
- Hypothesis: Python is likely part of the system (service, scripts, or tooling).
- Confidence: high
- Evidence: pyproject.toml present; Python files detected

## Git Ownership Signals
- HEAD: `078bd8d1d4d1` by **Sayam Samal** on `2026-01-16T03:53:19+05:30`
- HEAD message: message_scroll: Add blur on hover effect to scroll-to-bottom button.
- Top contributors (by commit count):
  - Sayam Samal: 1 commits (sayam@zulip.com)

## File Inventory (Alphabetical, first 260 files)
- `.claude/CLAUDE.md` (18.6 KiB)
- `.claude/skills/debug-node-coverage/SKILL.md` (2.8 KiB)
- `.claude/skills/fetch-zulip-messages/fetch-zulip-web-public-messages` (4.6 KiB)
- `.claude/skills/fetch-zulip-messages/SKILL.md` (1.5 KiB)
- `.claude/skills/fix-backend-coverage/analyze-coverage` (7.0 KiB)
- `.claude/skills/fix-backend-coverage/SKILL.md` (3.8 KiB)
- `.claude/skills/visual-test/SKILL.md` (5.1 KiB)
- `.codecov.yml` (267 B)
- `.codespellignore` (185 B)
- `.editorconfig` (377 B)
- `.gitattributes` (659 B)
- `.github/funding.json` (4.8 KiB)
- `.github/FUNDING.yml` (52 B)
- `.github/ISSUE_TEMPLATE/1_discussed_on_czo.md` (324 B)
- `.github/ISSUE_TEMPLATE/2_bug_report.md` (618 B)
- `.github/ISSUE_TEMPLATE/3_feature_request.md` (244 B)
- `.github/ISSUE_TEMPLATE/config.yml` (795 B)
- `.github/pull_request_template.md` (1.9 KiB)
- `.github/workflows/api-docs-update-check.yml` (2.3 KiB)
- `.github/workflows/auto-add-parent-label.yml` (1.3 KiB)
- `.github/workflows/codeql-analysis.yml` (1.1 KiB)
- `.github/workflows/production-suite.yml` (11.2 KiB)
- `.github/workflows/update-oneclick-apps.yml` (1013 B)
- `.github/workflows/zulip-ci.yml` (9.7 KiB)
- `.github/workflows/zulip-cloud-deploy.yaml` (3.0 KiB)
- `.gitignore` (2.1 KiB)
- `.gitlint` (238 B)
- `.mailmap` (10.0 KiB)
- `.npmignore` (0 B)
- `.prettierignore` (395 B)
- `.readthedocs.yaml` (513 B)
- `.sonarcloud.properties` (35 B)
- `analytics/__init__.py` (0 B)
- `analytics/lib/__init__.py` (0 B)
- `analytics/lib/counts.py` (38.6 KiB)
- `analytics/lib/fixtures.py` (3.1 KiB)
- `analytics/lib/time_utils.py` (1.1 KiB)
- `analytics/management/__init__.py` (0 B)
- `analytics/management/commands/__init__.py` (0 B)
- `analytics/management/commands/check_analytics_state.py` (3.3 KiB)
- `analytics/management/commands/clear_analytics_tables.py` (804 B)
- `analytics/management/commands/clear_single_stat.py` (956 B)
- `analytics/management/commands/populate_analytics_db.py` (15.4 KiB)
- `analytics/management/commands/update_analytics_counts.py` (3.9 KiB)
- `analytics/migrations/__init__.py` (0 B)
- `analytics/migrations/0001_initial.py` (7.3 KiB)
- `analytics/migrations/0001_squashed_0021_alter_fillstate_id.py` (8.8 KiB)
- `analytics/migrations/0002_remove_huddlecount.py` (682 B)
- `analytics/migrations/0003_fillstate.py` (814 B)
- `analytics/migrations/0004_add_subgroup.py` (855 B)
- `analytics/migrations/0005_alter_field_size.py` (1.4 KiB)
- `analytics/migrations/0006_add_subgroup_to_unique_constraints.py` (857 B)
- `analytics/migrations/0007_remove_interval.py` (1.3 KiB)
- `analytics/migrations/0008_add_count_indexes.py` (1.0 KiB)
- `analytics/migrations/0009_remove_messages_to_stream_stat.py` (1.1 KiB)
- `analytics/migrations/0010_clear_messages_sent_values.py` (1.1 KiB)
- `analytics/migrations/0011_clear_analytics_tables.py` (971 B)
- `analytics/migrations/0012_add_on_delete.py` (1.3 KiB)
- `analytics/migrations/0013_remove_anomaly.py` (733 B)
- `analytics/migrations/0014_remove_fillstate_last_modified.py` (337 B)
- `analytics/migrations/0015_clear_duplicate_counts.py` (2.7 KiB)
- `analytics/migrations/0016_unique_constraint_when_subgroup_null.py` (3.2 KiB)
- `analytics/migrations/0017_regenerate_partial_indexes.py` (4.2 KiB)
- `analytics/migrations/0018_remove_usercount_active_users_audit.py` (366 B)
- `analytics/migrations/0019_remove_unused_counts.py` (650 B)
- `analytics/migrations/0020_alter_installationcount_id_alter_realmcount_id_and_more.py` (1.2 KiB)
- `analytics/migrations/0021_alter_fillstate_id.py` (465 B)
- `analytics/models.py` (5.1 KiB)
- `analytics/tests/__init__.py` (0 B)
- `analytics/tests/test_counts.py` (87.8 KiB)
- `analytics/tests/test_fixtures.py` (1.6 KiB)
- `analytics/tests/test_stats_views.py` (26.8 KiB)
- `analytics/urls.py` (2.5 KiB)
- `analytics/views/__init__.py` (0 B)
- `analytics/views/stats.py` (22.3 KiB)
- `api_docs/api-doc-template.md` (609 B)
- `api_docs/api-keys.md` (1.9 KiB)
- `api_docs/changelog.md` (180.3 KiB)
- `api_docs/client-libraries.md` (2.3 KiB)
- `api_docs/configuring-python-bindings.md` (5.0 KiB)
- `api_docs/construct-narrow.md` (7.9 KiB)
- `api_docs/create-scheduled-message.md` (1.2 KiB)
- `api_docs/create-stream.md` (254 B)
- `api_docs/group-setting-values.md` (5.4 KiB)
- `api_docs/http-headers.md` (3.3 KiB)
- `api_docs/include/api-admin-only.md` (81 B)
- `api_docs/include/empty.md` (0 B)
- `api_docs/include/rest-endpoints.md` (7.4 KiB)
- `api_docs/index.md` (1.4 KiB)
- `api_docs/installation-instructions.md` (870 B)
- `api_docs/message-formatting.md` (20.9 KiB)
- `api_docs/missing.md` (17 B)
- `api_docs/mobile-notifications.md` (8.0 KiB)
- `api_docs/outgoing-webhook-payload.md` (3.2 KiB)
- `api_docs/real-time-events.md` (2.0 KiB)
- `api_docs/rest-error-handling.md` (2.5 KiB)
- `api_docs/rest.md` (1.4 KiB)
- `api_docs/roles-and-permissions.md` (4.1 KiB)
- `api_docs/send-message.md` (2.0 KiB)
- `api_docs/sidebar_index.md` (565 B)
- `api_docs/zulip-urls.md` (4.3 KiB)
- `CODE_OF_CONDUCT.md` (8.3 KiB)
- `confirmation/__init__.py` (1.1 KiB)
- `confirmation/CHANGELOG.txt` (90 B)
- `confirmation/LICENSE.txt` (1.5 KiB)
- `confirmation/management/__init__.py` (0 B)
- `confirmation/management/commands/__init__.py` (0 B)
- `confirmation/migrations/__init__.py` (0 B)
- `confirmation/migrations/0001_initial.py` (1.2 KiB)
- `confirmation/migrations/0001_squashed_0014_confirmation_confirmatio_content_80155a_idx.py` (3.4 KiB)
- `confirmation/migrations/0002_realmcreationkey.py` (814 B)
- `confirmation/migrations/0003_emailchangeconfirmation.py` (455 B)
- `confirmation/migrations/0004_remove_confirmationmanager.py` (960 B)
- `confirmation/migrations/0005_confirmation_realm.py` (561 B)
- `confirmation/migrations/0006_realmcreationkey_presume_email_valid.py` (415 B)
- `confirmation/migrations/0007_add_indexes.py` (1.1 KiB)
- `confirmation/migrations/0008_confirmation_expiry_date.py` (394 B)
- `confirmation/migrations/0009_confirmation_expiry_date_backfill.py` (2.5 KiB)
- `confirmation/migrations/0010_alter_confirmation_expiry_date.py` (420 B)
- `confirmation/migrations/0011_alter_confirmation_expiry_date.py` (428 B)
- `confirmation/migrations/0012_alter_confirmation_id.py` (446 B)
- `confirmation/migrations/0013_alter_realmcreationkey_id.py` (441 B)
- `confirmation/migrations/0014_confirmation_confirmatio_content_80155a_idx.py` (561 B)
- `confirmation/migrations/0015_alter_confirmation_object_id.py` (512 B)
- `confirmation/migrations/0016_realmcreationkey_to_realmcreationstatus.py` (4.7 KiB)
- `confirmation/migrations/0017_delete_realmcreationkey.py` (330 B)
- `confirmation/models.py` (10.4 KiB)
- `confirmation/README.txt` (337 B)
- `confirmation/settings.py` (168 B)
- `CONTRIBUTING.md` (30.8 KiB)
- `corporate/__init__.py` (0 B)
- `corporate/lib/__init__.py` (0 B)
- `corporate/lib/activity.py` (15.0 KiB)
- `corporate/lib/billing_types.py` (192 B)
- `corporate/lib/decorator.py` (9.7 KiB)
- `corporate/lib/registration.py` (5.3 KiB)
- `corporate/lib/remote_billing_util.py` (6.0 KiB)
- `corporate/lib/stripe_event_handler.py` (8.4 KiB)
- `corporate/lib/stripe.py` (252.1 KiB)
- `corporate/lib/support.py` (21.7 KiB)
- `corporate/management/__init__.py` (0 B)
- `corporate/management/commands/__init__.py` (0 B)
- `corporate/migrations/__init__.py` (0 B)
- `corporate/migrations/0001_initial.py` (2.8 KiB)
- `corporate/migrations/0001_squashed_0044_convert_ids_to_bigints.py` (15.9 KiB)
- `corporate/migrations/0002_customer_default_discount.py` (419 B)
- `corporate/migrations/0003_customerplan.py` (1.6 KiB)
- `corporate/migrations/0004_licenseledger.py` (1.0 KiB)
- `corporate/migrations/0005_customerplan_invoicing.py` (1.0 KiB)
- `corporate/migrations/0006_nullable_stripe_customer_id.py` (432 B)
- `corporate/migrations/0007_remove_deprecated_fields.py` (915 B)
- `corporate/migrations/0008_nullable_next_invoice_date.py` (427 B)
- `corporate/migrations/0009_customer_sponsorship_pending.py` (412 B)
- `corporate/migrations/0010_customerplan_exempt_from_from_license_number_check.py` (435 B)
- `corporate/migrations/0011_move_exempt_from_from_license_number_check_to_customer_model.py` (829 B)
- `corporate/migrations/0012_zulipsponsorshiprequest.py` (2.2 KiB)
- `corporate/migrations/0013_alter_zulipsponsorshiprequest_org_website.py` (421 B)
- `corporate/migrations/0014_customerplan_end_date.py` (416 B)
- `corporate/migrations/0015_event_paymentintent_session.py` (3.0 KiB)
- `corporate/migrations/0016_customer_add_remote_server_field.py` (933 B)
- `corporate/migrations/0017_rename_exempt_from_from_license_number_check_customer_exempt_from_license_number_check.py` (435 B)
- `corporate/migrations/0018_customer_cloud_xor_self_hosted.py` (677 B)
- `corporate/migrations/0019_zulipsponsorshiprequest_expected_total_users_and_more.py` (781 B)
- `corporate/migrations/0020_add_remote_realm_customers.py` (1.2 KiB)
- `corporate/migrations/0021_remove_session_payment_intent.py` (346 B)
- `corporate/migrations/0022_session_is_manual_license_management_upgrade_session.py` (438 B)
- `corporate/migrations/0023_zulipsponsorshiprequest_customer.py` (568 B)
- `corporate/migrations/0024_zulipsponsorshiprequest_fill_customer_data.py` (513 B)
- `corporate/migrations/0025_alter_zulipsponsorshiprequest_customer.py` (549 B)
- `corporate/migrations/0026_remove_zulipsponsorshiprequest_realm.py` (365 B)
- `corporate/migrations/0027_alter_zulipsponsorshiprequest_requested_by.py` (723 B)
- `corporate/migrations/0028_zulipsponsorshiprequest_requested_plan.py` (594 B)
- `corporate/migrations/0029_session_tier.py` (408 B)
- `corporate/migrations/0030_alter_zulipsponsorshiprequest_requested_plan.py` (685 B)
- `corporate/migrations/0031_customer_flat_discount_and_more.py` (590 B)
- `corporate/migrations/0032_customer_minimum_licenses.py` (417 B)
- `corporate/migrations/0033_customerplan_invoice_overdue_email_sent.py` (421 B)
- `corporate/migrations/0034_customer_discount_required_tier.py` (424 B)
- `corporate/migrations/0035_update_legacy_plan_next_invoice_date.py` (884 B)
- `corporate/migrations/0036_fix_customer_plans_scheduled_after_legacy_plan.py` (1.4 KiB)
- `corporate/migrations/0037_customerplanoffer.py` (1.1 KiB)
- `corporate/migrations/0038_customerplanoffer_sent_invoice_id_invoice.py` (1.1 KiB)
- `corporate/migrations/0039_backfill_end_date_for_fixed_price_plans.py` (1.7 KiB)
- `corporate/migrations/0040_customerplan_reminder_to_review_plan_email_sent.py` (443 B)
- `corporate/migrations/0041_fix_plans_on_free_trial_with_changes_in_schedule.py` (1.7 KiB)
- `corporate/migrations/0042_invoice_is_created_for_free_trial_upgrade_and_more.py` (795 B)
- `corporate/migrations/0043_remove_customer_default_discount_and_more.py` (3.4 KiB)
- `corporate/migrations/0044_convert_ids_to_bigints.py` (2.4 KiB)
- `corporate/migrations/0045_zulipsponsorshiprequest_plan_to_use_zulip.py` (429 B)
- `corporate/migrations/0046_rename_customerplan_invoice_overdue_email_sent.py` (438 B)
- `corporate/models/__init__.py` (775 B)
- `corporate/models/customers.py` (3.5 KiB)
- `corporate/models/licenses.py` (2.0 KiB)
- `corporate/models/plans.py` (9.9 KiB)
- `corporate/models/sponsorships.py` (1.3 KiB)
- `corporate/models/stripe_state.py` (6.5 KiB)
- `corporate/tests/__init__.py` (0 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Charge.list.1.json` (3.4 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--checkout.Session.create.1.json` (2.7 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--checkout.Session.list.1.json` (3.3 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.create.1.json` (721 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.modify.1.json` (732 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.retrieve.1.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.retrieve.2.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.retrieve.3.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.retrieve.4.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Customer.retrieve.5.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Event.list.1.json` (1.6 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Event.list.2.json` (34.4 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Event.list.3.json` (17.9 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Event.list.4.json` (1.0 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Event.list.5.json` (81 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Invoice.create.1.json` (2.9 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Invoice.finalize_invoice.1.json` (4.2 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Invoice.list.1.json` (83 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--Invoice.pay.1.json` (4.2 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--InvoiceItem.create.1.json` (702 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--PaymentMethod.create.1.json` (1.1 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--SetupIntent.create.1.json` (899 B)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--SetupIntent.list.1.json` (1.1 KiB)
- `corporate/tests/stripe_fixtures/add_minimum_licenses--SetupIntent.retrieve.1.json` (899 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Charge.list.1.json` (3.3 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Charge.list.2.json` (6.6 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--checkout.Session.create.1.json` (2.8 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--checkout.Session.create.2.json` (2.8 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--checkout.Session.list.1.json` (3.3 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--checkout.Session.list.2.json` (3.3 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.create.1.json` (725 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.modify.1.json` (736 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.modify.2.json` (737 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.1.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.10.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.2.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.3.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.4.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.5.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.6.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.7.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.8.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Customer.retrieve.9.json` (2.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.1.json` (1.6 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.2.json` (40.7 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.3.json` (11.8 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.4.json` (81 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.5.json` (1.6 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.6.json` (28.6 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.7.json` (12.0 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.8.json` (5.9 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Event.list.9.json` (81 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.create.1.json` (2.9 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.create.2.json` (2.9 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.create.3.json` (2.7 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.finalize_invoice.1.json` (4.2 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.finalize_invoice.2.json` (4.2 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.finalize_invoice.3.json` (4.1 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.list.1.json` (83 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.list.2.json` (4.9 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.list.3.json` (83 B)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.list.4.json` (9.7 KiB)
- `corporate/tests/stripe_fixtures/attach_discount_to_realm--Invoice.list.5.json` (14.3 KiB)

## Notes and Caveats
- This is a best-effort static crawl. Enable LLM enrichment for better naming and explanations.
- Import parsing is heuristic and will miss dynamic/module-alias imports.
- Generated automatically by Codebase Analyzer crawler agent.
