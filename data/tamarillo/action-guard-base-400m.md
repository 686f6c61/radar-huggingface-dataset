# Tamarillo/action-guard-base-400m

## Resumen

Tamarillo ActionGuard Base (400M) es un clasificador de texto encoder-only desarrollado por Tamarillo, un proyecto que publica modelos de seguridad en tiempo de ejecución para agentes de codificación autónomos. El modelo parte del encoder `jhu-clsp/ettin-encoder-400m` (Apache-2.0) y se ha afinado para predecir, en una sola pasada forward, probabilidades calibradas sobre 27 predicados de política: 23 predicados de peligro (borrado permanente, lectura o compartición de credenciales, `git force-push`, sentencias destructivas de base de datos, despliegue a producción, descarga y ejecución de código, etc.) y 4 predicados de alcance seguro (inspección de solo lectura, mover a papelera, DM a una persona concreta, push a un repositorio concreto).

El problema que resuelve es concreto: los agentes de codificación (Claude Code con hooks `PreToolUse`, Codex CLI, Cursor, OpenHands, pasarelas MCP) ejecutan llamadas a herramientas con efectos reales sobre el sistema, y las alternativas habituales son o bien etiquetas gruesas de permitir/denegar, o bien APIs juez alojadas con latencia de segundos y coste por uso. Este modelo ofrece una señal local, barata y de grano fino que permite a cada equipo definir sus propias reglas `allow`/`ask`/`block` sin reentrenar.

Con 395,9 millones de parámetros, licencia Apache-2.0 y pesos en safetensors y ONNX, la relevancia actual está en su encaje en pipelines de guardrails: 475 ms p50 en CPU FP32 ONNX con 4 hilos y 35,7 ms p50 en GPU bf16 (A100, batch=1), con paridad bit a bit frente a PyTorch (diferencia máxima de probabilidad de 3e-05).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT, base `jhu-clsp/ettin-encoder-400m`) |
| Parametros totales | 395.858.971 (395,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (ONNX); bf16 en GPU; INT8 dinámico descartado intencionadamente por degradación de paridad en GeGLU de ModernBERT/Ettin |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT (familia Ettin) adaptado a clasificación multi-etiqueta. La cabeza produce probabilidades calibradas para 23 predicados de peligro y 4 de alcance seguro en una única pasada forward, con umbrales por predicado almacenados en `thresholds.json`. La selección de checkpoint y los umbrales se calibraron estrictamente sobre un split `dev_val` disjunto por familia (297 casos); los splits `holdout` y `confirmation` no se usaron para entrenamiento, parada temprana ni ajuste de umbrales.

El entrenamiento parte del split `dev` de AgentApprove con 50 familias de entrenamiento y entidades aleatorizadas tres veces, más llamadas a herramientas sintéticas generadas a partir del reglamento público con `Qwen/Qwen3-14B` y doblemente verificadas. El autor declara explícitamente que los baselines alojados de la Tabla 3 de arXiv:2611.02155 son modelos zero-shot/prompted sin entrenamiento en `dev`, por lo que la comparación no es homogénea en cuanto a datos de ajuste.

## Capacidades

- Clasificación multi-etiqueta de 27 predicados de política sobre llamadas a herramientas de agentes de codificación en una sola pasada.
- Predicción de 23 predicados de peligro: `permanent-deletion`, `read-credential-material`, `share-credential-material`, `git-force-push-or-delete-ref`, `database-destructive-statement`, `deploy-to-production`, `download-and-execute-code`, entre otros.
- Predicción de 4 predicados de alcance seguro: `read-only-inspection`, `move-to-trash`, `slack-dm-specific-person`, `git-push-specific-repository`.
- Probabilidades calibradas con umbrales por predicado, lo que permite construir políticas `allow`/`ask`/`block` propias sin reentrenar.
- Integración con hooks `PreToolUse` de Claude Code, Codex CLI, Cursor, OpenHands y pasarelas MCP.
- No es un modelo generativo: no produce texto, no razona en varios pasos ni soporta tool calling por sí mismo; es un componente de decisión dentro de un guardrail.
- Capacidad multilingüe limitada al inglés.
- Compatible con Text Embeddings Inference y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Guardrail en hooks `PreToolUse` de Claude Code: el modelo clasifica cada llamada a herramienta antes de ejecutarse y el hook aplica la política del equipo (por ejemplo, bloquear `permanent-deletion` y pedir confirmación ante `deploy-to-production`) con latencia de 475 ms p50 en CPU.
- Pasarela MCP centralizada: interceptar llamadas de varios agentes en un único punto y enrutar según los predicados de peligro, usando la versión ONNX en CPU para no depender de GPU en el servidor de la pasarela.
- Política de protección de credenciales: bloquear automáticamente `read-credential-material` y `share-credential-material` en agentes que operan sobre repositorios con secretos, con umbrales ajustados por el equipo sobre las probabilidades calibradas.
- Control de operaciones Git peligrosas: detectar `git-force-push-or-delete-ref` y `git-push-specific-repository` para distinguir pushes a repositorios concretos (permitidos) de reescrituras de historia (bloqueadas o con confirmación).
- Protección de bases de datos en producción: clasificar sentencias destructivas (`database-destructive-statement`) antes de que el agente las ejecute contra un entorno productivo, con la opción de exigir confirmación humana.
- Filtro de descarga y ejecución de código: marcar `download-and-execute-code` para revisión manual en pipelines de CI/CD donde el agente instala dependencias o ejecuta scripts remotos.
- Despliegue en GPU para alta concurrencia: con 35,7 ms p50 en A100 bf16 (batch=1), sirve para clasificar el tráfico de varios agentes simultáneos con vLLM/TGI o un servidor de inferencia propio.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre `agentapprove/coding-agent-tool-call-safety`, split `holdout` (1.108 casos, 44 familias de escenario disjuntas) y split `confirmation` (320 casos, 16 familias disjuntas):

| Metrica | Holdout | Confirmation |
|---|---|---|
| Deny Micro Youden's J (x100) | 78,36 | 71,24 |
| Deny Micro F1 | 0,8388 | 0,776 |
| Deny Macro F1 | 0,7879 | no disponible |
| Deny Micro Recall | 0,7901 | no disponible |

Métricas adicionales declaradas en la model card: Unnecessary Interruption 9,1 % (8,7 % con umbral 0,5), Allow-F1 93,0 % y Unseen-Entity OOD Holdout J de 78,5 (nombres de entidades, organizaciones y repositorios sustituidos por entidades sintéticas no vistas).

Comparativa del autor en el suite tool-only de arXiv:2611.02155:

| Modelo | Parametros | Despliegue | Latencia p50 | Holdout J | Holdout OOD J | Holdout F1 | Holdout Intr% | Confirm J |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Regex Heuristics | reglas | CPU local | 0,1 ms | 47,8 | — | — | 100,0 % | 42,7 |
| Qwen3-0.6B (0-shot) | 596M | GPU local | 259 ms A100 | 6,1 | — | — | 75,8 % | 10,8 |
| Qwen3-4B (0-shot) | 4,0B | GPU local | 440 ms A100 | 28,3 | — | — | 26,2 % | 31,4 |
| Qwen3-14B (0-shot) | 14,8B | GPU local | ~450 ms A100 | 49,4 | — | 61,7 % | 19,0 % | 49,1 |
| action-guard-tiny-68m | 68M | CPU ONNX / GPU | 74,6 ms CPU / 25,3 ms A100 | 69,0 | 69,5 | 75,1 % | 24,6 % (19,8 % t=0,5) | 68,3 (8,3 % Intr) |
| action-guard-base-400m | 396M | CPU ONNX / GPU | 475 ms CPU / 35,7 ms A100 | 78,4 | 78,5 | 83,9 % | 9,1 % (8,7 % t=0,5) | 71,2 |
| action-guard-600m | 596M | GPU local | 45,8 ms A100 | 85,0 | 84,5 | 88,7 % | 13,9 % | 75,0 (10,0 % Intr) |
| action-guard-1.7b | 1,72B | GPU local | 47,1 ms A100 | 86,1 | 86,0 | 87,1 % | 21,8 % (16,3 % t=0,5) | 78,7 (8,3 % t=0,5 Intr) |
| Cloudflare Clef Flash (hosted) | hosted | API ($1,11/1k) | 2.565 ms | 79,4 | — | — | 11,1 % | 69,0 |
| Together Tev1-4B (hosted) | 4B | API ($1,36/…) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX FP32 ocupa 1.584 MB y corre a 475 ms p50 con 4 hilos; no requiere GPU para uso interactivo por agente.
- Inferencia en GPU: 35,7 ms p50 en A100 con bf16 y batch=1; el peso en bf16 ronda los 0,8 GB, por lo que cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4090).
- Alternativa más ligera: `action-guard-tiny-68m` a 74,6 ms en CPU y 25,3 ms en A100 si la latencia en CPU es crítica.
- Alternativas con mejor J: `action-guard-600m` (85,0 J, 45,8 ms A100) y `action-guard-1.7b` (86,1 J, 47,1 ms A100), ambas Apache-2.0 y orientadas a GPU.
- Opciones de despliegue: ONNX Runtime en CPU, PyTorch con bf16 en GPU, Text Embeddings Inference y endpoints compatibles (según tags del repositorio).
- Cuantización: INT8 dinámico desaconsejado por el autor por pérdida de paridad en las GeGLU de ModernBERT/Ettin; usar FP32 en CPU o bf16 en GPU.
- Throughput: no disponible más allá de las latencias p50 por petición indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Holdout J | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Tamarillo/action-guard-base-400m | 396M | no disponible | 78,4 | Apache-2.0 | Hugging Face (safetensors, ONNX) |
| Tamarillo/action-guard-tiny-68m | 68M | no disponible | 69,0 | no disponible en la información | Hugging Face |
| Tamarillo/action-guard-600m | 596M | no disponible | 85,0 | Apache-2.0 | Hugging Face |
| Tamarillo/action-guard-1.7b | 1,72B | no disponible | 86,1 | Apache-2.0 | Hugging Face |
| Qwen3-14B (0-shot) | 14,8B | no disponible | 49,4 | no disponible en la información | Hugging Face |
| Cloudflare Clef Flash (hosted) | hosted | no disponible | 79,4 | propietaria | API de pago ($1,11/1k) |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado en inglés, por lo que su uso con llamadas a herramientas descritas en castellano no está validado.
- No es generativo: no razona en varios pasos ni decide por sí mismo; requiere que el equipo defina la política `allow`/`ask`/`block` sobre las probabilidades.
- Métricas no verificadas: todos los resultados de la model-index están marcados como `verified: false` y proceden del propio autor.
- Riesgo de falso negativo: con un recall de denegación del 79,0 % en holdout, aproximadamente una de cada cinco llamadas peligrosas podría no bloquearse según el umbral elegido.
- Interrupciones innecesarias: 9,1 % en holdout (8,7 % con umbral 0,5), lo que implica fricción para el usuario si se aplica de forma estricta.
- Sesgo de dominio: entrenado sobre el reglamento y el dataset de AgentApprove y sobre llamadas generadas con Qwen3-14B; puede generalizar peor a herramientas, esquemas o flujos no representados.
- Dependencia de umbrales: el rendimiento depende de `thresholds.json`; recalibrar sobre datos propios es recomendable antes de producción.
- Comparación no homogénea: los baselines alojados de arXiv:2611.02155 no se entrenaron en `dev`, mientras que este modelo sí; los sistemas alojados mayores (Gemini 3.5 Flash-Lite, Cloudflare Clef, Jev 1.14) siguen superándolo en recall absoluto y tasa de interrupción según el propio autor.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en dominios no evaluados.
- Sin datos de longitud de contexto ni de composición exacta del dataset de entrenamiento más allá de lo indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/action-guard-base-400m
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/action-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Dataset: https://huggingface.co/datasets/agentapprove/coding-agent-tool-call-safety
- Paper de referencia: https://arxiv.org/abs/2611.02155
- Modelo tiny-68m: https://huggingface.co/Tamarillo/action-guard-tiny-68m
- Modelo 600m: https://huggingface.co/Tamarillo/action-guard-600m
- Modelo 1.7b: https://huggingface.co/Tamarillo/action-guard-1.7b
