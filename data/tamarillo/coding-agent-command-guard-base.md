# Tamarillo/coding-agent-command-guard-base

## Resumen

Tamarillo Coding-Agent Command Guard (Base) es un modelo de clasificación de texto de 308M parámetros diseñado como puerta de política de seguridad en tiempo de ejecución para agentes de código autónomos (Claude Code, Codex CLI, Cursor, OpenHands y pasarelas de herramientas MCP). El modelo recibe una llamada a herramienta —por ejemplo, un comando Bash con sus argumentos— y la clasifica en una de tres categorías: `ALLOW` (ejecución segura), `ASK` (requiere confirmación humana) o `DENY` (bloqueo por riesgo). Desarrollado por Tamarillo sobre el encoder `jhu-clsp/mmBERT-base`, resuelve el problema de aplicar guardarraíles deterministas y de baja latencia a agentes que ejecutan comandos de shell sin supervisión constante.

La relevancia del modelo reside en su enfoque: en lugar de un detector genérico de prompt injection, se entrena específicamente sobre decisiones de política de agentes de código, con énfasis en alta recall para la clase `DENY`. Declara un 99,57% de recall en `DENY` y un Macro-F1 de 0,9561 en el conjunto de test de `decima-agent-decisions`, además de 1,000 F1/AUROC en ataques de shell ofuscados frente a comandos de desarrollo seguros. Con 308M parámetros y variantes ONNX (FP32 e INT8), está pensado para insertarse como hook en pipelines de agentes, con latencias de ~1,1 ms en GPU y ~31 ms en CPU con INT8.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y ONNX, y forma parte de una familia junto a una variante `small` de 141M orientada a hooks locales en portátiles. Su ventana de contexto no está documentada en la información disponible, aunque al derivar de mmBERT hereda la arquitectura ModernBERT de este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.532.547 (308M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32, ONNX INT8 (dinámica); pesos PyTorch BF16 |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, concretamente un fine-tuning de `jhu-clsp/mmBERT-base` (308M parámetros). Se utiliza como clasificador de texto con tres etiquetas de política (`ALLOW`/`ASK`/`DENY`) sobre la entrada compuesta por el nombre de la herramienta y sus argumentos serializados (por ejemplo, `Tool: Bash` seguido de `Arguments: {"command": "..."}`). No se trata de un modelo generativo, sino de un cabezal de clasificación sobre representaciones contextuales del encoder.

El entrenamiento se apoya en dos conjuntos de datos: `amyrmahdy/decima-agent-decisions` (decisiones de agentes sobre comandos bash/test con etiquetas de tres clases) y `agentapprove/coding-agent-tool-call-safety` (seguridad de llamadas a herramientas en agentes de código). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un clasificador). Sí se documenta una suite de evaluación estandarizada "zero-leakage" y la verificación de paridad de decisión entre PyTorch y ONNX (100% en FP32, 91,7% en INT8). El modelo se distribuye también en formato ONNX cuantizado para inferencia en CPU.

## Capacidades

- Clasificación de llamadas a herramientas y comandos de shell en tres clases de política: `ALLOW`, `ASK`, `DENY`.
- Detección de comandos peligrosos: exfiltración de claves SSH, ejecución remota de código (`curl | sudo bash`), mutaciones de ficheros locales, etc.
- Alta recall en la clase `DENY` (99,57% declarado), priorizando evitar falsos negativos en operaciones destructivas o maliciosas.
- Detección de ataques de shell ofuscados (1,000 F1/AUROC declarado en el conjunto de ofuscación).
- Soporte multilingüe declarado (hereda el multilingüismo de mmBERT).
- Integración como guardarraíl en agentes de código (Claude Code, Codex CLI, Cursor, OpenHands, pasarelas MCP).
- No es un modelo generativo: no produce texto, razonamiento ni código; solo etiqueta y puntúa entradas.
- No dispone de tool calling, capacidades de agente ni modo de pensamiento propios; su función es precisamente validar las llamadas de otros agentes.

## Casos de uso

- Hook de seguridad en Claude Code o Codex CLI: interceptar cada comando Bash propuesto por el agente antes de ejecutarlo y clasificarlo como `ALLOW`, `ASK` o `DENY`; con ~1,1 ms en GPU o ~31 ms en CPU INT8, la latencia añadida es despreciable frente al tiempo de ejecución del comando.
- Pasarela de herramientas MCP: validar las llamadas a herramientas expuestas por servidores MCP y bloquear automáticamente las que impliquen exfiltración de datos o ejecución remota.
- Confirmación humana selectiva: usar la clase `ASK` para elevar a revisión manual operaciones ambiguas (por ejemplo, copiar ficheros de código a `/tmp`), reduciendo la fatiga de aprobación sin relajar la seguridad.
- Protección contra prompt injection en agentes de código: filtrar comandos generados a partir de contenido no confiable (issues, README, salidas de herramientas) antes de que lleguen al shell.
- Auditoría y registro de políticas: clasificar en lote comandos históricos de un agente para detectar patrones de riesgo y ajustar las reglas de la organización.
- Despliegue en entornos sin GPU: la variante ONNX INT8 (856,8 MB) permite ejecutar el guardarraíl en máquinas de 8 vCPU con ~31 ms por ejemplo, adecuado para CI/CD o portátiles de desarrollo.
- Defensa en pipelines de CI/CD: validar scripts generados por agentes antes de ejecutarlos en runners, bloqueando comandos que descarguen y ejecuten código remoto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en la model card:

| Modelo | Parametros | Decima 3-Class Macro-F1 | Decima DENY Recall | AgentApprove Main F1 / AUC | AgentApprove Confirm F1 / AUC | Shell Obfuscation F1 / AUC | Avg Bin F1 | Avg Bin AUROC |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `protectai/deberta-v3-base-prompt-injection-v2` | 184M | N/A | N/A | 0.002 / 0.427 | 0.000 / 0.625 | 0.000 / 0.581 | 0.102 | 0.556 |
| `patronus-studio/wolf-defender-prompt-injection` | 308M | N/A | N/A | 0.021 / 0.508 | 0.163 / 0.562 | 0.518 / 0.722 | 0.250 | 0.631 |
| `Horizon-Labs/prompt-injection-guard-base` | 308M | N/A | N/A | 0.287 / 0.622 | 0.299 / 0.613 | 0.645 / 0.789 | 0.513 | 0.682 |
| `dmilush/shieldlm-deberta-mcp-tools` | 184M | N/A | N/A | 0.922\* / 0.457 | 0.890\* / 0.465 | 0.667 / 0.805 | 0.785 | 0.570 |
| `Tamarillo/coding-agent-command-guard-small` | 141M | 0.9551 | 98.98% | 0.937 / 0.836 | 0.943 / 0.858 | 0.974 / 0.998 | 0.890 | 0.855 |
| **`Tamarillo/coding-agent-command-guard-base`** | **308M** | **0.9561** | **99.57%** | **0.937 / 0.821** | **0.952 / 0.870** | **1.000 / 1.000** | **0.891** | 0.850 |

Métricas declaradas en el model-index para el modelo base:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación de política (3 clases) | Decima Agent Decisions (test) | Macro F1 | 0,9561 |
| Clasificación de política (3 clases) | Decima Agent Decisions (test) | Accuracy | 0,9567 |
| Clasificación de política (3 clases) | Decima Agent Decisions (test) | DENY Recall | 0,9957 |
| Detección de frontera de política | AgentApprove Tool-Call Safety (holdout) | Binary Risk F1 | 0,9519 |
| Detección de frontera de política | AgentApprove Tool-Call Safety (holdout) | Binary Risk AUROC | 0,8703 |

Latencia y paridad ONNX (CPU `onnxruntime`, VM de 8 vCPU):

| Variante | Fichero | Tamano | Paridad vs. PyTorch | Latencia CPU |
|---|---|---:|---:|---:|
| PyTorch BF16 (GPU) | `model.safetensors` | 1,17 GB | Referencia | 1,14 ms/ej. |
| ONNX FP32 (CPU) | `onnx/model.onnx` | 1.173,7 MB | 100,0% | 55,19 ms/ej. |
| ONNX INT8 (CPU) | `onnx/model_quantized.onnx` | 856,8 MB | 91,7% (1 diferencia límite de 12) | 30,66 ms/ej. |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa ~1,17 GB de pesos; con overhead de activaciones, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM (RTX 3060, RTX 4090, A100, H100); a 308M parámetros no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 30xx/40xx, incluso integradas con suficiente memoria compartida).
- Despliegue: `transformers` (pipeline de `text-classification`), ONNX Runtime (FP32 o INT8), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; no se documenta soporte explícito para vLLM, llama.cpp u Ollama (no es un modelo generativo).
- Latencia: ~1,14 ms por ejemplo en GPU BF16; ~55 ms en CPU ONNX FP32 y ~31 ms en CPU ONNX INT8 (8 vCPU).
- Throughput: no disponible de forma explícita; a partir de la latencia, en GPU se pueden procesar cientos de ejemplos por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decima Macro-F1 | AgentApprove Main F1/AUC | Licencia | Enfoque |
|---|---:|---|---:|---|---|---|
| `Tamarillo/coding-agent-command-guard-base` | 308M | no disponible | 0,9561 | 0,937 / 0,821 | Apache 2.0 | Política de comandos de agentes de código (3 clases) |
| `Tamarillo/coding-agent-command-guard-small` | 141M | no disponible | 0,9551 | 0,937 / 0,836 | Apache 2.0 | Misma tarea, menor latencia CPU (13,1 ms INT8) |
| `Horizon-Labs/prompt-injection-guard-base` | 308M | no disponible | N/A | 0,287 / 0,622 | no disponible | Detección genérica de prompt injection |
| `dmilush/shieldlm-deberta-mcp-tools` | 184M | no disponible | N/A | 0,922\* / 0,457 | no disponible | Seguridad de herramientas MCP |
| `protectai/deberta-v3-base-prompt-injection-v2` | 184M | no disponible | N/A | 0,002 / 0,427 | no disponible | Detección genérica de prompt injection |

La comparativa se basa en los datos de la propia model card; los modelos alternativos no reportan resultados en la tarea de tres clases de Decima. El modelo base supera a los detectores genéricos de prompt injection en la tarea específica de política de comandos, y frente a la variante `small` mejora ligeramente Macro-F1 y recall en `DENY`, a costa de mayor latencia en CPU.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- Rendimiento inferior en salidas mixtas no-Bash del benchmark `rogue-security/coding-agent-security-benchmark`: el modelo declara 0,599 F1 / 0,564 AUROC, por debajo de detectores genéricos como `wolf-defender-base` (0,725 AUROC). No es un detector universal de prompt injection.
- La cuantización INT8 introduce divergencias de decisión (91,7% de paridad frente a PyTorch; una diferencia límite de 12 casos), lo que puede afectar a comandos ambiguos.
- Riesgo de falsos negativos: aunque la recall en `DENY` es alta, ningún clasificador es perfecto; se recomienda defensa en profundidad (sandboxing, permisos mínimos).
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre decisiones de agentes de código, puede tener un dominio limitado a comandos de desarrollo.
- Idiomas: aunque se declara multilingüe, los datos de entrenamiento y evaluación son principalmente en inglés; el rendimiento en comandos y argumentos en otros idiomas no está evaluado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (`decima-agent-decisions`, `coding-agent-tool-call-safety`).
- Longitud de contexto no documentada: al ser un encoder ModernBERT, se espera una ventana moderada, pero no se confirma en la información disponible.
- No es un modelo generativo: no sustituye a un LLM; debe combinarse con el agente y con otras capas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/coding-agent-command-guard-base
- Variante small: https://huggingface.co/Tamarillo/coding-agent-command-guard-small
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/coding-agent-command-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset Decima Agent Decisions: https://huggingface.co/datasets/amyrmahdy/decima-agent-decisions
- Dataset AgentApprove Coding-Agent Tool-Call Safety: https://huggingface.co/datasets/agentapprove/coding-agent-tool-call-safety
