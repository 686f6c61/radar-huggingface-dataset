# Tamarillo/action-guard-1.7b

## Resumen

Tamarillo ActionGuard 1.7B es un modelo de clasificación de texto de tipo multi-etiqueta, obtenido por ajuste fino supervisado de Qwen/Qwen3-1.7B, que actúa como clasificador de políticas de seguridad en tiempo de ejecución para agentes de programación autónomos. Su función no es generar texto, sino predecir en una única pasada las probabilidades calibradas de 27 predicados de política (23 de peligro, como `permanent-deletion`, `read-credential-material`, `git-force-push-or-delete-ref`, `database-destructive-statement` o `download-and-execute-code`, y 4 de alcance seguro, como `read-only-inspection` o `move-to-trash`) a partir de una llamada a herramienta (tool call) emitida por un agente.

El modelo resuelve un problema concreto: los sistemas de guardrails binarios (allow/deny) son demasiado gruescos y los jueces alojados en la nube introducen latencia y coste por llamada. ActionGuard devuelve un vector de probabilidades que el equipo integrador puede mapear a sus propias reglas `allow` / `ask` / `block` sin reentrenar, lo que permite políticas personalizadas con un modelo local de licencia Apache-2.0. Está pensado para integrarse en hooks `PreToolUse` de Claude Code, Codex CLI, Cursor, OpenHands y pasarelas MCP.

Con 1.720.630.272 parámetros reales (1,72B) y un repositorio de 3,5 GB en safetensors, el modelo se posiciona como la variante grande de la familia ActionGuard de Tamarillo, por encima de las versiones tiny-68m, base-400m y 600m. Su latencia declarada es de 47,1 ms p50 en una A100 con bf16 y batch=1, y su rendimiento en el conjunto holdout alcanza un Youden's J de 86,1 con F1 de 87,1%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 1.720.630.272 (1,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | agentapprove/coding-agent-tool-call-safety |
| Tamaño del repositorio | 3,5 GB |
| Salida | 27 predicados (23 de peligro + 4 de alcance seguro) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1,72B parámetros, y se ajusta como clasificador multi-etiqueta: en lugar de generar tokens, produce en una sola pasada forward las probabilidades de 27 predicados de política. La innovación principal es la granularidad de la salida: 23 predicados de peligro (`permanent-deletion`, `read-credential-material`, `share-credential-material`, `git-force-push-or-delete-ref`, `database-destructive-statement`, `deploy-to-production`, `download-and-execute-code`, entre otros) más 4 predicados de alcance seguro (`read-only-inspection`, `move-to-trash`, `slack-dm-specific-person`, `git-push-specific-repository`), lo que permite construir políticas `allow`/`ask`/`block` personalizadas sin reentrenar.

El entrenamiento se realizó sobre el split `dev` del dataset AgentApprove `coding-agent-tool-call-safety` (50 familias de entrenamiento, con entidades randomizadas 3 veces) más llamadas a herramientas sintéticas generadas a partir del rulebook público con Qwen/Qwen3-14B y doblemente verificadas. Los umbrales por predicado (`thresholds.json`) y la selección de checkpoint se calibraron exclusivamente sobre un split `dev_val` disjunto por familia (297 casos); los splits `holdout` (1.108 casos, 44 familias disjuntas) y `confirmation` (320 casos, 16 familias) nunca se usaron para entrenamiento, early stopping ni ajuste de umbrales. No se especifica en la información disponible si hubo RLHF o DPO.

## Capacidades

- Clasificación multi-etiqueta de llamadas a herramienta de agentes de programación en 27 predicados de política (23 de peligro + 4 de alcance seguro).
- Predicción de probabilidades calibradas por predicado en una única pasada forward, aptas para umbralización configurable por el integrador.
- Detección de operaciones destructivas: borrado permanente, sentencias SQL destructivas, force-push o borrado de refs en git.
- Detección de acceso y exfiltración de material de credenciales (`read-credential-material`, `share-credential-material`).
- Detección de despliegues a producción y de descarga y ejecución de código.
- Reconocimiento de acciones de alcance seguro: inspección de solo lectura, movimiento a papelera, mensaje directo a persona concreta, push a repositorio concreto.
- Integración como guardrail en hooks `PreToolUse` de Claude Code, Codex CLI, Cursor, OpenHands y pasarelas MCP.
- Soporte de tool calling / function calling: no disponible como capacidad generativa (el modelo es clasificador, no generador).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad generativa; su rol es la evaluación de seguridad de cada paso.
- Capacidades multilingües: no disponible; solo inglés declarado.
- Capacidades especiales: robustez a entidades no vistas (OOD con nombres de entidad, organizaciones y repositorios sintéticos no vistos).

## Casos de uso

- Guardrail en hooks `PreToolUse` de Claude Code: el modelo se invoca antes de ejecutar cada tool call y devuelve las probabilidades de los 27 predicados; el equipo mapea esas probabilidades a reglas `allow`/`ask`/`block` propias, bloqueando p. ej. `permanent-deletion` o `read-credential-material` sin reentrenar.
- Pasarela MCP con políticas por predicado: en un gateway MCP centralizado, ActionGuard evalúa cada llamada de cualquier agente conectado y aplica una política distinta por predicado (bloquear `deploy-to-production`, pedir confirmación para `git-force-push-or-delete-ref`, permitir `read-only-inspection`), con latencia de 47,1 ms p50 en A100.
- Agentes de programación autónomos en CI/CD: integrado en Codex CLI u OpenHands, intercepta comandos de shell y operaciones de git antes de su ejecución, evitando force-push accidentales o borrados de refs en pipelines automatizados.
- Protección de credenciales en asistentes de código: detecta `read-credential-material` y `share-credential-material` para impedir que un agente lea ficheros de secretos o los incluya en mensajes salientes, con F1 de 87,1% en holdout.
- Cumplimiento y auditoría de operaciones de base de datos: clasifica sentencias SQL destructivas (`database-destructive-statement`) antes de ejecutarlas, permitiendo exigir confirmación humana en un flujo `ask` configurable por umbral.
- Despliegue local sin dependencia de APIs de terceros: al ser Apache-2.0 y ejecutarse en GPU local (A100, 47,1 ms p50), permite construir guardrails sin coste por llamada ni envío de tool calls a servicios alojados, a diferencia de jueces cloud como Cloudflare Clef o Gemini 3.5 Flash-Lite.
- Validación de políticas personalizadas sin reentrenamiento: el vector de 27 predicados permite a distintos equipos definir sus propias reglas sobre el mismo modelo, ajustando umbrales por predicado según su tolerancia al riesgo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre el suite tool-only de arXiv:2611.02155, dataset `agentapprove/coding-agent-tool-call-safety`.

| Modelo | Params | Despliegue | Latencia p50 | Holdout J | Holdout OOD J | Holdout F1 | Holdout Intr% | Confirm J |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Regex heuristics | reglas | CPU local | 0,1 ms | 47,8 | — | — | 100,0% | 42,7 |
| Qwen3-0.6B (0-shot) | 596M | GPU local | 259 ms A100 | 6,1 | — | — | 75,8% | 10,8 |
| Qwen3-4B (0-shot) | 4,0B | GPU local | 440 ms A100 | 28,3 | — | — | 26,2% | 31,4 |
| Qwen3-14B (0-shot) | 14,8B | GPU local | ~450 ms A100 | 49,4 | — | 61,7% | 19,0% | 49,1 |
| Tamarillo/action-guard-tiny-68m | 68M | CPU ONNX / GPU | 74,6 ms CPU / 25,3 ms A100 | 69,0 | 69,5 | 75,1% | 24,6% | 68,3 |
| Tamarillo/action-guard-base-400m | 396M | CPU ONNX / GPU | 475 ms CPU / 35,7 ms A100 | 78,4 | 78,5 | 83,9% | 9,1% | 71,2 |
| Tamarillo/action-guard-600m | 596M | GPU local | 45,8 ms A100 | 85,0 | 84,5 | 88,7% | 13,9% | 75,0 |
| **Tamarillo/action-guard-1.7b** | **1,72B** | **GPU local** | **47,1 ms A100** | **86,1** | **86,0** | **87,1%** | **21,8%** | **78,7** |
| Cloudflare Clef Flash (hosted) | hosted | Cloud API (1,11 $/1k) | 2.565 ms | 79,4 | — | — | 11,1% | 69,0 |
| Together Tev1-4B (hosted) | 4B | Cloud API (1,36 $/1k) | 778 ms | 88,5 | — | — | 22,6% | — |
| Gemini 3.5 Flash-Lite (hosted) | hosted | Cloud API (2,03 $/1k) | 1.392 ms | 91,2 | — | — | 16,3% | — |
| Jev 1.14 (closed) | hosted | Cloud API (0,46 $/1k) | 120 ms | 97,4 | — | — | 4,8% | 94,5 |

Métricas adicionales declaradas del modelo en el split holdout (tool-only, 1.108 casos, 44 familias disjuntas):

| Métrica | Valor |
|---|---|
| Deny Micro Youden's J (x100) | 86,08 |
| Deny Micro F1 | 0,8706 |
| Deny Macro F1 | 0,8479 |
| Deny Micro Recall | 0,8696 |
| Unnecessary Interruption | 21,8% (16,3% con umbral t=0,5) |
| Allow-F1 | 94,2% |

Métricas en el split confirmation (320 casos, 16 familias disjuntas):

| Métrica | Valor |
|---|---|
| Deny Micro Youden's J (x100) | 78,67 |
| Deny Micro F1 | 0,8042 |
| OOD J | 79,2 |
| Unnecessary Interruption (t=0,5) | 8,3% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB de pesos, más overhead de activaciones y contexto; una GPU con 8 GB o más es suficiente en bf16.
- GPU recomendadas: A100 (latencia declarada de 47,1 ms p50 con batch=1, bf16), H100 para mayor throughput, RTX 4090 y GPUs consumer con 8-16 GB de VRAM.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM en bf16 (no se especifican requisitos para cuantizaciones de 4 u 8 bits, no disponibles en la información).
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (tag), endpoints compatibles; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 47,1 ms p50 en A100 con batch=1 y bf16. Throughput con batch mayor no disponible.
- Alternativas de menor coste computacional dentro de la misma familia: action-guard-tiny-68m (74,6 ms en CPU, ONNX) y action-guard-base-400m (475 ms en CPU, ONNX), ambas ejecutables sin GPU.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Holdout J | Holdout F1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Tamarillo/action-guard-1.7b | 1,72B | no disponible | 86,1 | 87,1% | Apache-2.0 | Local, HF |
| Tamarillo/action-guard-600m | 596M | no disponible | 85,0 | 88,7% | Apache-2.0 | Local, HF |
| Tamarillo/action-guard-base-400m | 396M | no disponible | 78,4 | 83,9% | Apache-2.0 | Local CPU ONNX / HF |
| Gemini 3.5 Flash-Lite | hosted | no disponible | 91,2 | no disponible | propietaria | API de pago |
| Jev 1.14 | hosted | no disponible | 97,4 | no disponible | propietaria | API de pago |

Frente a la variante 600m de la misma familia, action-guard-1.7b mejora el Youden's J en holdout (86,1 frente a 85,0) y en confirmation (78,7 frente a 75,0), pero empeora el F1 en holdout (87,1% frente a 88,7%) y aumenta la tasa de interrupción innecesaria (21,8% frente a 13,9%). Frente a los sistemas alojados, el modelo local queda por debajo de Gemini 3.5 Flash-Lite (91,2) y Jev 1.14 (97,4) en J absoluto, pero ofrece latencia de 47,1 ms frente a 1.392 ms y 120 ms respectivamente, y sin coste por llamada.

## Limitaciones y advertencias

- Modelo clasificador, no generativo: no produce texto ni razonamiento; su salida es un vector de probabilidades por predicado.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no disponible; tool calls muy largos podrían truncarse sin que se especifique el límite.
- Tasa de interrupción innecesaria del 21,8% en holdout (16,3% con umbral 0,5): puede generar fricción operativa si se usa con umbrales agresivos.
- Descenso notable en el split confirmation (J 78,7 frente a 86,1 en holdout), lo que indica sensibilidad a la distribución de escenarios.
- Los baselines alojados de la comparativa son zero-shot/prompted y no se entrenaron sobre el split `dev`, mientras que ActionGuard sí; la comparación no es estrictamente equivalente.
- Sistemas propietarios como Jev 1.14 (J 97,4, interrupción 4,8%) superan al modelo local en recall absoluto y tasa de interrupción.
- Métricas no verificadas de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos negativos en predicados de peligro) en tool calls fuera de distribución.
- Sesgos: no documentados en la información disponible; el dataset de entrenamiento es específico de agentes de programación y puede no generalizar a otros dominios de tool calling.
- Licencia Apache-2.0 permite uso comercial, pero el dataset base (`agentapprove/coding-agent-tool-call-safety`) es CC-BY-4.0 y conviene verificar sus términos de atribución.
- En producción, la política final depende enteramente del mapeo de umbrales que haga el integrador; una configuración laxa anula la protección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/action-guard-1.7b
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/action-guard-demo
- Variante tiny-68m: https://huggingface.co/Tamarillo/action-guard-tiny-68m
- Variante base-400m: https://huggingface.co/Tamarillo/action-guard-base-400m
- Variante 600m: https://huggingface.co/Tamarillo/action-guard-600m
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/agentapprove/coding-agent-tool-call-safety
- Paper de referencia: https://arxiv.org/abs/2611.02155
