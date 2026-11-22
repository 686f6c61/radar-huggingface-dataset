# Tamarillo/action-guard-tiny-68m

## Resumen

Tamarillo ActionGuard Tiny (68M) es un clasificador de texto encoder-only desarrollado por Tamarillo, un proyecto independiente que publica bajo licencia Apache-2.0. Se trata de un fine-tune del modelo base `jhu-clsp/ettin-encoder-68m` (familia ModernBERT) con 68.421.147 parámetros, disenado especificamente para evaluar la seguridad de las llamadas a herramientas (tool calls) que ejecutan agentes de codigo autonomos como Claude Code, Codex CLI, Cursor, OpenHands o pasarelas MCP.

El modelo resuelve un problema concreto de seguridad en produccion: en lugar de depender de un juicio binario grueso (permitir/denegar) o de APIs de jueces alojadas, lentas y caras, ActionGuard Tiny predice en una sola pasada forward probabilidades calibradas para 23 predicados de peligro especificos (por ejemplo `permanent-deletion`, `read-credential-material`, `git-force-push-or-delete-ref`, `database-destructive-statement` o `deploy-to-production`) mas 4 predicados de alcance seguro (`read-only-inspection`, `move-to-trash`, `slack-dm-specific-person`, `git-push-specific-repository`). Esto permite a cada equipo definir sus propias reglas de politica `allow`/`ask`/`block` sin reentrenar el modelo.

Su relevancia actual radica en que ofrece una alternativa local, de muy bajo coste computacional (74,6 ms p50 en CPU con ONNX FP32 a 4 hilos, 25,2-25,3 ms p50 en GPU A100 con bf16) y con paridad bit-exacta frente a PyTorch, lo que lo hace apto para desplegarse como guardrail de latencia estricta en el punto de intercepcion de herramientas de un agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/ettin-encoder-68m`) |
| Parametros totales | 68.421.147 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX FP32; INT8 dinamico descartado intencionadamente por el autor (outliers GeGLU de ModernBERT/Ettin degradan la paridad INT8) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT (Ettin encoder de 68M), adaptado a clasificacion multi-etiqueta de texto. La salida no es una etiqueta unica sino un conjunto de probabilidades calibradas sobre 27 predicados (23 de peligro y 4 de alcance seguro) en una sola pasada forward. El autor proporciona umbrales por predicado en `thresholds.json`, calibrados estrictamente sobre un split `dev_val` disjunto por familias (297 casos).

El entrenamiento parte del split `dev` del dataset `agentapprove/coding-agent-tool-call-safety` (50 familias de entrenamiento, con entidades aleatorizadas 3 veces) mas llamadas a herramientas sinteticas generadas a partir del rulebook publico con `Qwen/Qwen3-14B` y doblemente verificadas. Los splits `holdout` (1.108 casos, 44 familias disjuntas) y `confirmation` (320 casos, 16 familias disjuntas) nunca se usaron para entrenamiento, early stopping ni ajuste de umbrales. El autor declara explicitamente que las comparaciones con APIs alojadas de la Tabla 3 de `arXiv:2611.02155` son de modelos zero-shot/prompted sin entrenamiento en `dev`, por lo que la comparacion no es homogenea. No se detalla en la informacion disponible si hubo RLHF o DPO (no aplicable a un encoder de clasificacion).

## Capacidades

- Clasificacion multi-etiqueta de llamadas a herramientas de agentes de codigo en 27 predicados (23 de peligro, 4 de alcance seguro).
- Prediccion de probabilidades calibradas por predicado, lo que permite aplicar umbrales y politicas propias sin reentrenar.
- Deteccion de acciones de riesgo especificas: borrado permanente, lectura o comparticion de material de credenciales, force push o borrado de refs en git, sentencias destructivas de base de datos, despliegue a produccion, descarga y ejecucion de codigo.
- Reconocimiento de alcance seguro: inspeccion de solo lectura, movimiento a papelera, DM de Slack a persona concreta, push a repositorio concreto.
- Inferencia en una sola pasada (single-pass), sin generacion autoregresiva ni tool calling propio.
- Despliegue local en CPU (ONNX) y GPU (bf16), con paridad bit-exacta respecto a PyTorch.
- Integracion como guardrail en hooks `PreToolUse` de Claude Code, Codex CLI, Cursor, OpenHands y pasarelas MCP.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Intercepcion en hooks `PreToolUse` de Claude Code: el modelo clasifica cada tool call antes de ejecutarse y aplica reglas `allow`/`ask`/`block` definidas por el equipo; sus 74,6 ms p50 en CPU permiten mantener la latencia del bucle del agente sin depender de APIs externas.
- Guardrail en pasarelas MCP: al centralizar el trafico de herramientas de multiples agentes, el clasificador evalua en una sola pasada cada llamada y bloquea predicados como `read-credential-material` o `deploy-to-production` segun la politica de la organizacion.
- Politicas personalizadas por equipo sin reentrenamiento: al exponer 27 predicados independientes, un equipo de plataforma puede mapear sus propias reglas (por ejemplo, exigir confirmacion humana para `git-force-push-or-delete-ref` pero permitir `git-push-specific-repository`) ajustando solo los umbrales.
- Auditoria y triaje de sesiones de agentes: el modelo puede procesar lotes de tool calls registradas para etiquetar acciones de riesgo y priorizar revisiones humanas, aprovechando su bajo coste en CPU.
- Control de acciones destructivas en bases de datos: deteccion de `database-destructive-statement` antes de que un agente ejecute una sentencia contra produccion, con la posibilidad de derivar a un flujo de aprobacion.
- Proteccion frente a descarga y ejecucion de codigo no verificado: clasificacion de `download-and-execute-code` para bloquear cadenas de suministro no confiables en pipelines de CI/CD gestionados por agentes.
- Despliegue en entornos sin GPU: el ONNX FP32 en CPU con 4 hilos (274 MB) permite ejecutar el guardrail en contenedores ligeros o estaciones de trabajo sin acelerador.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`) sobre el dataset `agentapprove/coding-agent-tool-call-safety`, split tool-only:

| Metrica | Holdout | Confirmation |
|---|---|---|
| Deny Micro Youden's J (x100) | 68,99 | 68,33 |
| Deny Micro F1 | 0,7512 | 0,7273 |
| Deny Macro F1 | 0,6741 | no disponible |
| Deny Micro Recall | 0,7012 | no disponible |

Comparativa publicada por el autor en la model card (suite de `arXiv:2611.02155`, tool-only):

| Modelo | Parametros | Despliegue | Latencia p50 | Holdout J | Holdout OOD J | Holdout F1 | Holdout Intr% | Confirm J |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Regex Heuristics | reglas | CPU local | 0,1 ms | 47,8 | no disponible | no disponible | 100,0% | 42,7 |
| Qwen/Qwen3-0.6B (0-shot) | 596M | GPU local | 259 ms A100 | 6,1 | no disponible | no disponible | 75,8% | 10,8 |
| Qwen/Qwen3-4B (0-shot) | 4,0B | GPU local | 440 ms A100 | 28,3 | no disponible | no disponible | 26,2% | 31,4 |
| Qwen/Qwen3-14B (0-shot) | 14,8B | GPU local | ~450 ms A100 | 49,4 | no disponible | 61,7% | 19,0% | 49,1 |
| Tamarillo/action-guard-tiny-68m | 68M | CPU ONNX / GPU | 74,6 ms CPU / 25,3 ms A100 | 69,0 | 69,5 | 75,1% | 24,6% (19,8% t=0,5) | 68,3 (8,3% Intr) |
| Tamarillo/action-guard-base-400m | 396M | CPU ONNX / GPU | 475 ms CPU / 35,7 ms A100 | 78,4 | 78,5 | 83,9% | 9,1% (8,7% t=0,5) | 71,2 |
| Tamarillo/action-guard-600m | 596M | GPU local | 45,8 ms A100 | 85,0 | 84,5 | 88,7% | 13,9% | 75,0 (10,0% Intr) |
| Tamarillo/action-guard-1.7b | 1,72B | GPU local | 47,1 ms A100 | 86,1 | 86,0 | 87,1% | 21,8% (16,3% t=0,5) | 78,7 (8,3% t=0,5 Intr) |
| Hosted Ref: Cloudflare Clef Flash | alojado | API cloud ($1,11/1k) | 2.565 ms | 79,4 | no disponible | no disponible | 11,1% | 69,0 |

El autor reporta ademas: CPU FP32 ONNX (4 hilos) 74,6 ms p50 con 274 MB y diferencia maxima de probabilidad de 0,0 frente a PyTorch; GPU bf16 (batch=1, A100) 25,2 ms p50. La comparativa con APIs alojadas no es homogenea (baselines zero-shot sin entrenamiento en `dev`), segun advierte el propio autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 68M parametros, en bf16 el peso ronda los 137 MB, y el ONNX FP32 ocupa 274 MB.
- GPU recomendadas: A100 (referencia medida por el autor, 25,2-25,3 ms p50 en bf16, batch=1); el modelo cabe holgadamente en cualquier GPU consumer, aunque no se publican medidas especificas para RTX 4090 u otras.
- CPU: ONNX FP32 con 4 hilos, 74,6 ms p50 y 274 MB de huella, apto para entornos sin acelerador.
- Opciones de despliegue: transformers, ONNX, text-embeddings-inference y endpoints compatibles (segun tags del repo). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 74,6 ms p50 en CPU ONNX FP32 (4 hilos) y 25,2-25,3 ms p50 en A100 bf16 (batch=1). No se publica throughput agregado ni latencias para otros lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Holdout J | Holdout F1 | Licencia | Despliegue |
|---|---:|---|---:|---:|---|---|
| Tamarillo/action-guard-tiny-68m | 68M | no disponible | 69,0 | 75,1% | Apache-2.0 | CPU ONNX / GPU |
| Tamarillo/action-guard-base-400m | 396M | no disponible | 78,4 | 83,9% | Apache-2.0 (segun repo) | CPU ONNX / GPU |
| Tamarillo/action-guard-600m | 596M | no disponible | 85,0 | 88,7% | Apache-2.0 | GPU |
| Qwen/Qwen3-14B (0-shot) | 14,8B | no disponible | 49,4 | 61,7% | no disponible en la informacion | GPU |

La comparativa directa con modelos de la misma categoria (clasificadores de seguridad de tool calls) no esta disponible mas alla de la propia familia ActionGuard del autor y los baselines LLM zero-shot. Los modelos de la familia ActionGuard de mayor tamano superan a Tiny en J y F1 a costa de mayor latencia y, en el caso de 400m, mayor coste en CPU (475 ms frente a 74,6 ms).

## Limitaciones y advertencias

- Modelo solo en ingles; no se declara soporte multilingue.
- Resultados de benchmark declarados por el autor con `verified: false`; no hay verificacion independiente.
- La comparacion con APIs alojadas de la Tabla 3 de `arXiv:2611.02155` no es homogenea: los baselines son zero-shot/prompted y no se entrenaron en `dev`, segun admite el autor.
- El autor reconoce que sistemas cerrados/alojados de mayor tamano (Gemini 3.5 Flash-Lite, Cloudflare Clef, Jev 1.14) siguen superando a los modelos locales abiertos en recall absoluto y tasa de interrupcion.
- Tasa de interrupcion innecesaria del 24,6% en holdout (19,8% con umbral t=0,5), lo que implica falsos positivos que pueden derivar en friccion operativa si se usa como bloqueo estricto.
- La cuantizacion INT8 dinamica se descarta intencionadamente por degradacion de paridad debida a outliers GeGLU; no se debe asumir INT8 como opcion valida sin validacion propia.
- Riesgo de alucinacion no aplica en el sentido generativo (es un clasificador), pero si existe riesgo de clasificacion erronea de predicados; el modelo no genera explicaciones ni razonamiento.
- No se detalla el contexto maximo soportado, lo que limita el diseno de entradas con tool calls muy largas.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad de la politica de seguridad final recae en el integrador.
- Modelo muy reciente (creado el 2026-11-21) con 0 descargas y 0 likes en el momento de la consulta; ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/action-guard-tiny-68m
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/action-guard-demo
- Paper de referencia: https://arxiv.org/abs/2611.02155
- Dataset: `agentapprove/coding-agent-tool-call-safety` (CC-BY-4.0)
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Modelos relacionados: https://huggingface.co/Tamarillo/action-guard-base-400m, https://huggingface.co/Tamarillo/action-guard-600m, https://huggingface.co/Tamarillo/action-guard-1.7b
