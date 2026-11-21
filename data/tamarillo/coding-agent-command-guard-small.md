# Tamarillo/coding-agent-command-guard-small

## Resumen

`coding-agent-command-guard-small` es un clasificador de texto de 141 millones de parámetros desarrollado por Tamarillo (usuario independiente de Hugging Face) que actúa como puerta de seguridad en tiempo de ejecución para agentes de programación autónomos. El modelo recibe una llamada a herramienta propuesta (por ejemplo, un comando de shell con sus argumentos y contexto) y la clasifica en tres categorías de política: `ALLOW` (ejecución segura), `ASK` (requiere confirmación humana) o `DENY` (bloqueo). Resuelve un problema concreto: las listas de bloqueo basadas en expresiones regulares fallan ante ofuscaciones (por ejemplo, exfiltración mediante `git archive HEAD | base64 | curl ...`) y los sistemas que piden confirmación para todo generan fatiga de aprobación en comandos de lectura inocuos como `git diff` o `pytest`.

El modelo deriva de `jhu-clsp/mmBERT-small`, un encoder multilingüe de la familia ModernBERT, y se distribuye con pesos en safetensors y una variante ONNX cuantizada a INT8. Su relevancia actual radica en que los agentes de código (Claude Code, Codex CLI, Cursor, OpenHands, ejecutores de herramientas MCP) ejecutan comandos con privilegios del usuario y necesitan una capa de control local, rápida y de baja latencia. El autor declara una latencia de aproximadamente 13 ms por llamada en CPU con ONNX INT8 y de aproximadamente 1 ms en GPU.

La ficha se basa exclusivamente en la información publicada por el autor en Hugging Face; no se han verificado de forma independiente ni los benchmarks ni las latencias declaradas. El modelo se publicó el 21 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en el Hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, variante mmBERT) para clasificación de secuencias |
| Parámetros totales | 140.642.691 (141M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en los ejemplos de inferencia del autor; longitud máxima nativa de mmBERT-small no disponible en la información proporcionada |
| Tipos de cuantización | ONNX INT8 (`onnx/model_quantized.onnx`); pesos originales en safetensors (FP32/BF16 no especificado) |
| Idiomas soportados | inglés y multilingüe (etiquetas `en`, `multilingual`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (incluida variante cuantizada) |
| Pipeline | text-classification |
| Etiquetas de salida | `ALLOW`, `ASK`, `DENY` (3 clases) |
| Modelo base | `jhu-clsp/mmBERT-small` |
| Tamaño del repositorio | 1,6 GB |
| Librería | transformers; compatible con text-embeddings-inference y endpoints |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT en su variante mmBERT-small, adaptado mediante ajuste fino supervisado a una tarea de clasificación de tres clases. A diferencia de los modelos generativos, no produce texto: emite una distribución de probabilidad sobre las etiquetas `ALLOW`, `ASK` y `DENY` para una llamada a herramienta serializada como texto con el formato `Tool: <nombre>\nArguments: {...}` y, opcionalmente, un campo `Context` truncado a 800 caracteres. La arquitectura ModernBERT emplea atención con RoPE y capas alternas de atención global y local, lo que permite contextos largos con coste computacional reducido; el autor fija `max_length=1024` en los ejemplos de uso.

El ajuste fino se realizó sobre dos conjuntos de datos publicados en el Hub: `amyrmahdy/decima-agent-decisions` (decisiones de agente etiquetadas como ALLOW/ASK/DENY sobre comandos bash y tests) y `agentapprove/coding-agent-tool-call-safety` (seguridad de llamadas a herramientas en agentes de código). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni detalles del procedimiento de ajuste (hiperparámetros, épocas, balanceo de clases). El autor menciona una «suite estandarizada sin fuga de datos» evaluada con el script `repro/eval_baselines.py`, lo que sugiere que los splits de test y holdout no se vieron durante el entrenamiento, pero no se aporta el script ni la metodología completa.

La innovación principal no está en la arquitectura, sino en el enfoque de producto: un clasificador pequeño y determinista que sustituye a las listas de bloqueo por regex y a los prompts de confirmación indiscriminados, con una latencia declarada de 13,1 ms en CPU (INT8) que lo hace viable como hook local en el portátil del desarrollador. La variante base de la misma familia (308M) se orienta a enforcement en servidores MCP o pasarelas.

## Capacidades

- Clasificación de comandos de shell y llamadas a herramientas en tres niveles de política: `ALLOW`, `ASK` y `DENY`.
- Detección de exfiltración de datos, incluida la ofuscada por tuberías (`cat ~/.ssh/id_rsa | base64 | curl ...`).
- Detección de ejecución remota de código (`curl ... | sudo bash`).
- Detección de mutaciones locales de ficheros que requieren confirmación (`cp`, `mv` sobre rutas sensibles).
- Reconocimiento de comandos de lectura seguros (`git status`, `git diff`, `rg`, `sed -n`, `pytest`) para evitar confirmaciones innecesarias.
- Soporte de contexto adicional en la entrada (campo `Context`, truncado a 800 caracteres) para desambiguar llamadas.
- Capacidad multilingüe declarada, aunque los ejemplos y datasets de entrenamiento son en inglés.
- No es un modelo generativo: no razona, no planifica y no ejecuta herramientas; solo puntúa la seguridad de una llamada propuesta.
- No se documenta soporte nativo de tool calling ni de agentes multi-paso; su función es precisamente ser el guardián de esas llamadas.

## Casos de uso

- Hook de seguridad local en Claude Code o Codex CLI: antes de ejecutar cada comando de shell propuesto por el agente, el hook invoca al clasificador en CPU con ONNX INT8 (unos 13 ms) y bloquea o escala a confirmación según la etiqueta, sin añadir latencia perceptible a la sesión del desarrollador.
- Pasarela de herramientas MCP: un servidor MCP intermedio clasifica cada `tools/call` entrante y aplica la política antes de reenviarla al ejecutor real; la variante small sirve para despliegues en el borde y la base para pasarelas centralizadas.
- Reducción de fatiga de aprobación en IDE: en Cursor u otros asistentes con confirmación manual, el modelo permite auto-aprobar comandos de lectura (`git diff`, `pytest`, `rg`) y reservar el diálogo humano para operaciones mutantes o destructivas.
- Auditoría y registro de decisiones de agentes: clasificar en lote los comandos ejecutados en una sesión para generar un informe de riesgo (cuántos DENY se intentaron, qué patrones de exfiltración aparecen) sin necesidad de GPU.
- Filtrado en pipelines de CI/CD con agentes autónomos: antes de permitir que un agente de reparación de tests ejecute comandos en un runner, el clasificador actúa como compuerta y rechaza comandos que tocan credenciales o hacen peticiones de red salientes.
- Defensa en profundidad junto a sandboxing: combinar el clasificador con contenedores o seccomp para añadir una capa semántica que detecte intenciones maliciosas ofuscadas que las reglas sintácticas no capturan.
- Investigación en seguridad de agentes: usar el modelo como baseline reproducible en experimentos sobre políticas de permisos, dado que el autor publica la metodología de evaluación y los datasets de origen.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Dataset / split | Métrica | Valor |
|---|---|---|---|
| Clasificación de política de comandos (3 clases) | `amyrmahdy/decima-agent-decisions`, test | Macro F1 (3 clases) | 0,9551 |
| Clasificación de política de comandos (3 clases) | `amyrmahdy/decima-agent-decisions`, test | Accuracy | 0,955 |
| Clasificación de política de comandos (3 clases) | `amyrmahdy/decima-agent-decisions`, test | Recall de `DENY` | 0,9898 |
| Detección de frontera de política | `agentapprove/coding-agent-tool-call-safety`, holdout | F1 binario de riesgo | 0,9368 |
| Detección de frontera de política | `agentapprove/coding-agent-tool-call-safety`, holdout | AUROC binario de riesgo | 0,8363 |

El autor menciona además un F1 de 0,974 en ofuscación de shell para este modelo y una comparativa con `protectai/deberta-v3-base-prompt-injection-v2` (184M) en la que este último obtiene F1 binario medio de 0,102 y AUROC binario medio de 0,55; la tabla comparativa completa no está disponible en la información proporcionada. Latencias declaradas: 13,1 ms por llamada en CPU con ONNX INT8 y aproximadamente 1 ms en GPU. No se han publicado resultados de throughput ni de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K), que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (141M parámetros); aproximadamente 150-200 MB en ONNX INT8.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU con soporte ONNX Runtime; también funciona en CPU sin GPU.
- GPU recomendadas para despliegue de baja latencia: RTX 4090, L4, A10G, A100 o H100 si se sirve a gran volumen; para uso individual, cualquier GPU moderna es suficiente.
- Despliegue: transformers con pipeline de `text-classification`, ONNX Runtime (CPU o CUDA), Text Embeddings Inference (el Hub lo marca como compatible con endpoints), y exportación a otros runtimes (por ejemplo, llama.cpp no aplica por ser encoder, pero sí ONNX, OpenVINO o TensorRT).
- Latencia declarada: 13,1 ms por llamada en CPU con INT8 y aproximadamente 1 ms en GPU.
- Throughput: no disponible en la información proporcionada; con 141M de parámetros y lotes pequeños se espera un rendimiento alto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro F1 (Decima) | Recall DENY (Decima) | Licencia | Disponibilidad |
|---|---:|---|---|---:|---:|---|---|
| `Tamarillo/coding-agent-command-guard-small` | 141M | 1024 tokens en ejemplos | Clasificación ALLOW/ASK/DENY | 0,9551 | 0,9898 | Apache 2.0 | Hugging Face |
| `Tamarillo/coding-agent-command-guard-base` | 308M | no disponible | Clasificación ALLOW/ASK/DENY | 0,9561 | 0,9957 | Apache 2.0 (según familia) | Hugging Face |
| `protectai/deberta-v3-base-prompt-injection-v2` | 184M | no disponible | Detección de prompt injection | no aplica | no aplica | no disponible en la información | Hugging Face |

La comparación con `protectai/deberta-v3-base-prompt-injection-v2` procede de la tabla del autor, que reporta para ese modelo un F1 binario medio de 0,102 y un AUROC binario medio de 0,55 en la suite de seguridad de agentes; no es un modelo diseñado para esta tarea, por lo que la comparación debe interpretarse con cautela. No se dispone de datos de otros guardrails de comandos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks y latencias son declaraciones del autor y no han sido verificados de forma independiente; la model card no incluye el script de evaluación ni los artefactos de reproducción.
- El modelo clasifica texto; un atacante que controle la formulación del comando puede intentar evadir la detección mediante ofuscaciones no vistas en entrenamiento. No sustituye a un sandbox real (contenedores, seccomp, permisos mínimos).
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datasets en inglés, el rendimiento en comandos o contextos en otros idiomas puede degradarse pese a la etiqueta `multilingual`.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos negativos (DENY clasificado como ALLOW) y falsos positivos (comandos seguros clasificados como ASK o DENY); el recall de DENY declarado (0,9898) implica que aproximadamente un 1 % de los comandos peligrosos podrían no bloquearse.
- La ventana de contexto práctica es de 1024 tokens con truncado del campo `Context` a 800 caracteres; comandos muy largos u ofuscados con payload extenso pueden truncarse y perder señal.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `jhu-clsp/mmBERT-small` debe verificarse por separado para confirmar compatibilidad; no se detalla en la información proporcionada.
- El modelo no tiene descargas ni validación comunitaria en el momento de la ficha; para producción conviene evaluarlo sobre el tráfico real de la organización antes de confiar en él como única capa de control.
- No se especifican limitaciones de idioma más allá de la etiqueta multilingüe, ni se documenta el comportamiento ante llamadas a herramientas que no sean de shell (por ejemplo, APIs HTTP o bases de datos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/coding-agent-command-guard-small
- Variante base (308M): https://huggingface.co/Tamarillo/coding-agent-command-guard-base
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/coding-agent-command-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset Decima Agent Decisions: https://huggingface.co/datasets/amyrmahdy/decima-agent-decisions
- Dataset AgentApprove Coding-Agent Tool-Call Safety: https://huggingface.co/datasets/agentapprove/coding-agent-tool-call-safety
- Modelo de comparación: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
