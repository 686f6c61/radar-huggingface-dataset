# Tamarillo/action-guard-600m

## Resumen

Tamarillo ActionGuard 600M es un clasificador de texto multi-etiqueta disenado especificamente para la seguridad en tiempo de ejecucion de agentes de codigo autonomos. Lo desarrolla Tamarillo y se construye mediante fine-tuning de Qwen/Qwen3-0.6B (596.077.568 parametros), un modelo base Apache-2.0. Su funcion no es generar texto, sino predecir probabilidades calibradas para 23 predicados de riesgo (por ejemplo, borrado permanente, lectura de credenciales, force-push de git, sentencias destructivas de base de datos o despliegue a produccion) mas 4 predicados de ambito seguro (inspeccion de solo lectura, movimiento a papelera, mensaje directo a persona concreta, push a repositorio concreto) en una unica pasada forward.

El problema que resuelve es la ausencia de un filtro local, barato y de baja latencia para interceptar llamadas a herramientas (tool calls) de agentes como Claude Code, Codex CLI, Cursor, OpenHands o pasarelas MCP. En lugar de depender de APIs judge alojadas, caras y lentas, o de heuristicas regex demasiado gruesas, el modelo emite probabilidades por predicado que permiten al equipo aplicar sus propias reglas de politica allow/ask/block sin reentrenar.

Es relevante ahora porque el ecosistema de agentes de codigo esta creciendo rapido y las decisiones de seguridad sobre acciones de herramientas se toman en milisegundos. Con 45,8 ms p50 en bf16 sobre A100 y licencia Apache-2.0, ofrece una alternativa local con un rendimiento declarado de Youden's J de 85,0 en el split holdout, superando a modelos genericos zero-shot de mayor tamano en esa tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificacion multi-etiqueta |
| Parametros totales | 596.077.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 596 millones de parametros, y anade una cabeza de clasificacion multi-etiqueta que produce probabilidades para 27 predicados (23 de riesgo y 4 de ambito seguro) en una sola pasada forward. No es un modelo generativo: la salida es un vector de probabilidades calibradas por predicado, lo que permite aplicar umbrales independientes definidos en `thresholds.json`.

El entrenamiento se realizo sobre el split `dev` del dataset `agentapprove/coding-agent-tool-call-safety` (50 familias de entrenamiento, con entidades randomizadas tres veces) mas llamadas a herramientas sinteticas doblemente verificadas, generadas a partir del rulebook publico con Qwen/Qwen3-14B. La seleccion de checkpoint y la calibracion de umbrales se hicieron estrictamente sobre un split `dev_val` disjunto por familia (297 casos); los splits `holdout` (1.108 casos, 44 familias) y `confirmation` (320 casos, 16 familias) no se usaron para entrenamiento, early stopping ni ajuste de umbrales. El autor declara explicitamente que los baselines alojados de la Tabla 3 de arXiv:2611.02155 son modelos zero-shot/prompted sin entrenamiento en `dev`, lo que matiza la comparacion. No se detalla en la informacion disponible si hubo RLHF, DPO u otras fases de alineacion.

## Capacidades

- Clasificacion multi-etiqueta de llamadas a herramientas de agentes de codigo en 27 predicados (23 de riesgo, 4 de ambito seguro) en una unica pasada forward.
- Prediccion de probabilidades calibradas por predicado, lo que permite definir politicas allow/ask/block personalizadas sin reentrenar.
- Deteccion de riesgos concretos: borrado permanente, lectura y comparticion de material de credenciales, force-push o borrado de refs en git, sentencias destructivas de base de datos, despliegue a produccion, descarga y ejecucion de codigo.
- Reconocimiento de ambito seguro: inspeccion de solo lectura, movimiento a papelera, mensaje directo a persona concreta, push a repositorio concreto.
- Integracion como hook `PreToolUse` de Claude Code (incluye `tamarillo_hook.py` en el repo), y uso previsto en Codex CLI, Cursor, OpenHands y pasarelas MCP.
- Capacidad declarada de generalizacion a entidades no vistas (nombres, organizaciones y repositorios sinteticos), con Youden's J de 84,5 en OOD holdout.
- Idiomas: solo ingles.
- No soporta generacion de texto, razonamiento generativo, tool calling como emisor ni vision.

## Casos de uso

- Hook de seguridad en Claude Code: interceptar cada `PreToolUse` con `tamarillo_hook.py` y bloquear o pedir confirmacion ante predicados de riesgo como `permanent-deletion` o `git-force-push-or-delete-ref`, con latencia de 45,8 ms p50 en A100.
- Pasarela MCP con politica corporativa: clasificar tool calls entrantes en una pasarela MCP y aplicar reglas allow/ask/block propias usando las probabilidades por predicado y `thresholds.json`, sin reentrenar el modelo.
- Agentes de codigo en CI/CD: filtrar acciones de agentes que ejecutan comandos en pipelines, denegando despliegues a produccion o descargas con ejecucion de codigo no autorizadas.
- Proteccion de credenciales en asistentes de terminal: detectar `read-credential-material` y `share-credential-material` antes de que el agente acceda a ficheros sensibles o los envie a servicios externos.
- Auditoria de operaciones de git en equipos: marcar force-push o borrado de refs para revision humana, reduciendo interrupciones innecesarias gracias al 13,9% declarado en holdout.
- Gate de seguridad en IDEs agenticos (Cursor, Codex CLI): clasificar en local cada accion propuesta por el agente antes de ejecutarla, manteniendo los datos del repositorio fuera de APIs externas.
- Filtrado de acciones sobre bases de datos: bloquear sentencias destructivas (`database-destructive-statement`) generadas por agentes que operan sobre entornos de staging o produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el dataset `agentapprove/coding-agent-tool-call-safety`, split holdout (1.108 casos, 44 familias) y confirmation (320 casos, 16 familias):

| Metrica | Holdout | Confirmation |
|---|---:|---:|
| Deny Micro Youden's J (x100) | 84,96 | 75,01 |
| Deny Micro F1 | 0,8866 | 0,7996 |
| Deny Macro F1 | 0,8649 | no disponible |
| Deny Micro Recall | 0,8547 | no disponible |

Puntos de operacion declarados por el autor:

| Punto de operacion | Recall holdout | FPR holdout | J holdout | F1 holdout | Intr% holdout | J confirmation |
|---|---:|---:|---:|---:|---:|---:|
| Por defecto t = 0,50 | 84,7% | 0,46% | 84,3 | 88,5% | 13,1% | 75,3 |
| Calibrado (`thresholds.json`, val-only) | 85,5% | 0,50% | 85,0 | 88,7% | 13,9% | 75,0 |

Comparativa declarada por el autor (suite tool-only de arXiv:2611.02155):

| Modelo | Parametros | Despliegue | Latencia p50 | J holdout | J OOD holdout | F1 holdout | Intr% holdout | J confirm |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Regex heuristics | reglas | CPU local | 0,1 ms | 47,8 | — | — | 100,0% | 42,7 |
| Qwen/Qwen3-0.6B (0-shot) | 596M | GPU local | 259 ms A100 | 6,1 | — | — | 75,8% | 10,8 |
| Qwen/Qwen3-4B (0-shot) | 4,0B | GPU local | 440 ms A100 | 28,3 | — | — | 26,2% | 31,4 |
| Qwen/Qwen3-14B (0-shot) | 14,8B | GPU local | ~450 ms A100 | 49,4 | — | 61,7% | 19,0% | 49,1 |
| Tamarillo ettin-400m (Wave 2.5) | 396M | GPU/CPU local | 37,1 ms A100 | 78,7 | 78,1 | 81,8% | 17,5% | 69,8 |
| Tamarillo/action-guard-600m (valcal) | 596M | Apache-2.0 local | 45,8 ms A100 | 85,0 | 84,5 | 88,7% | 13,9% | 75,0 |
| Tamarillo/action-guard-1.7b | 1,72B | Apache-2.0 local | 47,8 ms A100 | 84,4 | 84,3 | 88,1% | 9,9% (t=0,5) | 78,0 |
| Cloudflare Clef Flash (hosted) | hosted | API (1,11 $/1k) | 2.565 ms | 79,4 | — | — | 11,1% | 69,0 |
| Together Tev1-4B (hosted) | 4B | API (1,36 $/1k) | 778 ms | 88,5 | — | — | 22,6% | — |
| Gemini 3.5 Flash-Lite (hosted) | hosted | API (2,03 $/1k) | 1.392 ms | 91,2 | — | — | 16,3% | — |
| Jev 1.14 (cerrado) | hosted | API (0,46 $/1k) | 120 ms | 97,4 | — | — | 4,8% | 94,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 para los pesos (596M parametros); el repo ocupa 1,2 GB en safetensors.
- GPU recomendadas: A100 para la latencia declarada de 45,8 ms p50 con batch=1 en bf16; cualquier GPU con al menos 2 GB de VRAM libre deberia poder alojarlo.
- Cabe en GPU de consumo: si, en tarjetas con 2 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090); el autor tambien reporta ejecucion en CPU para el modelo ettin-400m de su familia, aunque no se detalla latencia CPU para este modelo.
- Opciones de despliegue: transformers (libreria declarada), text-embeddings-inference (tag de Hugging Face), endpoints compatibles; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 45,8 ms p50 en A100 con batch=1 en bf16; no se publica throughput agregado ni latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | J holdout | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Tamarillo/action-guard-600m | 596M | no disponible | 85,0 | Apache-2.0 | Hugging Face, local |
| Tamarillo/action-guard-1.7b | 1,72B | no disponible | 84,4 | Apache-2.0 | Hugging Face, local |
| Tamarillo ettin-400m (Wave 2.5) | 396M | no disponible | 78,7 | no disponible | Hugging Face, local |
| Qwen/Qwen3-14B (0-shot) | 14,8B | no disponible | 49,4 | Apache-2.0 | Hugging Face, local |
| Gemini 3.5 Flash-Lite (hosted) | no disponible | no disponible | 91,2 | propietaria | API |
| Jev 1.14 (cerrado) | no disponible | no disponible | 97,4 | propietaria | API |

La comparacion directa con los baselines alojados es imperfecta: el autor senala que estos son zero-shot/prompted sin entrenamiento en `dev`, mientras que ActionGuard se fine-tuneo sobre `dev` y datos sinteticos. En rendimiento absoluto, Jev 1.14 y Gemini 3.5 Flash-Lite superan al modelo local, pero con latencias de 120 ms y 1.392 ms p50 y costes de 0,46 $ y 2,03 $ por 1.000 llamadas respectivamente.

## Limitaciones y advertencias

- Modelo solo en ingles; no se declara soporte multilingue.
- Es un clasificador, no un generador: no puede razonar, explicar ni emitir tool calls; su salida es un vector de probabilidades por predicado.
- Los resultados de benchmarks estan declarados por el autor y marcados como `verified: false` en el model-index; no han sido verificados de forma independiente.
- El propio autor advierte que sistemas cerrados o alojados de mayor tamano (Gemini 3.5 Flash-Lite, Cloudflare Clef, Jev 1.14) siguen superando a los modelos abiertos locales en recall absoluto y tasa de interrupcion.
- El fine-tuning se realizo sobre el split `dev` del dataset de referencia y datos sinteticos generados con Qwen3-14B; existe riesgo de sobreajuste a la distribucion del rulebook y a las familias de escenarios cubiertas.
- La calibracion de umbrales depende de `thresholds.json`; usar umbrales por defecto o mal ajustados altera el equilibrio recall/interrupcion (J 84,3 frente a 85,0 en holdout).
- No se documenta la longitud de contexto soportada, lo que limita la evaluacion de tool calls con payloads muy largos.
- No se detallan sesgos conocidos ni evaluaciones de robustez adversarial mas alla del OOD con entidades sinteticas.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre las decisiones de bloqueo o permiso recae en quien define la politica; el modelo no sustituye una revision humana en acciones destructivas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si el de falsos negativos (acciones peligrosas no detectadas) y falsos positivos (interrupciones innecesarias, 13,9% en holdout).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/action-guard-600m
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/action-guard-demo
- Paper de referencia: https://arxiv.org/abs/2611.02155
- Dataset: https://huggingface.co/datasets/agentapprove/coding-agent-tool-call-safety
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo hermano de mayor tamano: https://huggingface.co/Tamarillo/action-guard-1.7b
