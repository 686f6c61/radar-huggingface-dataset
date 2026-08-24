# ursb01/KAT-Coder-V2.5-Dev-MTP-APEX-GGUF

## Resumen

KAT-Coder-V2.5-Dev-MTP-APEX-GGUF es una cuantización GGUF en formato APEX (mixed-precision, MoE-aware) del modelo Kwaipilot/KAT-Coder-V2.5-Dev, un fine-tune agéntico de codificación sobre el backbone Qwen3.6-35B-A3B. La aportación principal de este repo es el trasplante del MTP head (multi-token prediction) de Qwen3.6-35B-A3B sobre KAT-Coder, que originalmente no lo incluye (`mtp_num_hidden_layers: 0`), habilitando así decodificación especulativa con `llama.cpp`. El autor reporta un speedup de hasta 1.44x en una suite de codificación agéntica con contexto largo, sin cambios en la corrección de las salidas.

El modelo base, desarrollado por Kwaipilot, está diseñado para actuar de forma autónoma dentro de repositorios ejecutables reales, no como un generador de código de un solo turno. Según el informe técnico (arXiv:2607.05471), su rendimiento está limitado más por la escasez de entornos reproducibles y recompensas verificables que por la escala del modelo. Kwaipilot reporta un SWE-bench Verified de 69.40 para esta clase de tamaño, frente a 64.40 del Qwen3.6-35B-A3B base. La cuantización APEX permite ejecutar el modelo en hardware de consumo, con ficheros que van desde 11.91 GiB (versión dynamic) hasta 19.24 GiB (versión i-quality recomendada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (qwen3_5_moe): 40 capas, 256 expertos enrutados + 1 experto compartido, atención lineal híbrida GatedDeltaNet con atención completa periódica |
| Parametros totales | 34.660.610.688 (34.66B) |
| Parametros activos | ~3B (A3B, segun nomenclatura del backbone) |
| Longitud de contexto | no disponible (probado con prompts de ~82 KB, equivalente a ~32K tokens) |
| Tipos de cuantizacion | APEX (mixed-precision, MoE-aware); ficheros i-quality y dynamic, ambos en version v2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros .gguf), safetensors (solo el shard del MTP head) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un fine-tune agéntico sobre el backbone Qwen3.6-35B-A3B, que combina atención lineal GatedDeltaNet con atención completa periódica en una arquitectura MoE de 40 capas con 256 expertos enrutados y 1 experto compartido. Segun el informe tecnico, el post-entrenamiento se realizo con un framework end-to-end centrado en entornos reproducibles, recompensas verificables y trayectorias de alta calidad, en lugar de depender solo de la escala del modelo.

La cuantizacion APEX de este repo es mixed-precision y consciente de la arquitectura MoE, utilizando una importance matrix (`kat-coder.imatrix`) para la asignacion de precision por capa. La innovacion principal es el trasplante del MTP head de Qwen3.6-35B-A3B, cuyos pesos se copian directamente sin fine-tuning sobre la distribucion de hidden states de KAT-Coder. El autor indica que un fine-tuning del head (~850M parametros) congelando las 40 capas del modelo es un trabajo planificado, por lo que los numeros actuales representan la linea base antes de ese ajuste.

## Capacidades

- Generacion de codigo y razonamiento agéntico: el modelo base esta entrenado para operar dentro de repositorios reales, ejecutando herramientas y tomando decisiones multi-paso.
- Decodificacion especulativa: el MTP head transplantado permite usar `--spec-type draft-mtp` en `llama-server`, con una tasa de aceptacion de drafts medida entre 0.55 y 0.84 segun profundidad y temperatura.
- Tool calling / function calling: el modelo base soporta llamadas a herramientas encadenadas, como se documenta en el fichero `TOOL_CALLING.md` del repo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Solo texto: el modelo base no incluye componentes multimodales (vision/audio), segun la nota de Kwaipilot.

## Casos de uso

- Agentes de codificacion autonomos en CI/CD: el modelo puede integrarse en pipelines que requieran resolver issues reales en repositorios, ejecutar tests y proponer parches, aprovechando su entrenamiento agéntico y su capacidad de tool calling.
- Asistente de programacion en IDE con contexto largo: con una ventana de contexto de al menos 32K tokens, puede manejar proyectos completos, analizar multiples ficheros y sugerir refactorizaciones coherentes.
- Generacion de codigo en produccion con decodificacion especulativa: el MTP head permite reducir la latencia en servidores de inferencia, especialmente util en entornos donde el coste por token es critico (por ejemplo, APIs internas de generacion de codigo).
- Resolucion de bugs en repositorios open source: el modelo puede recibir un issue, explorar el codigo, identificar la causa y generar un patch, como se evalua en SWE-bench Verified.
- Documentacion tecnica automatizada: puede generar comentarios, docstrings y documentacion de API a partir del codigo fuente, manteniendo coherencia con el estilo del proyecto.
- Formacion y evaluacion de modelos de codigo: al ser un modelo abierto con licencia Apache 2.0, puede usarse como base para distillation o como oraculo en pipelines de RLHF para tareas de codigo.

## Benchmarks y rendimiento

| Benchmark | KAT-Coder-V2.5-Dev | Qwen3.6-35B-A3B (base) |
|---|---|---|
| SWE-bench Verified | 69.40 | 64.40 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Los datos de rendimiento de decodificacion especulativa se resumen a continuacion (medidos con `llama-server`, contexto largo de ~82 KB, `max_tokens=400`, 3 semillas por celda, mediana de tok/s, `top_p 0.95 top_k 20`, ctx 32768):

| Profundidad de draft | T=0 (greedy) | T=0.25 | T=0.5 | T=0.75 | T=1.0 |
|---|---:|---:|---:|---:|---:|
| Sin drafter | 59.3 | 59.4 | 59.4 | 59.4 | 59.2 |
| n-max 1 | 71.3 (1.20x) | 75.4 (1.27x) | 75.4 (1.27x) | 73.7 (1.24x) | 71.9 (1.21x) |
| n-max 2 | 76.5 (1.29x) | 76.2 (1.28x) | 77.7 (1.31x) | 75.2 (1.27x) | 71.9 (1.21x) |
| n-max 3 | 85.7 (1.44x) | 78.7 (1.33x) | 78.8 (1.33x) | 77.0 (1.30x) | 74.9 (1.26x) |
| n-max 5 | 68.4 (1.15x) | 61.9 (1.04x) | 66.5 (1.12x) | 66.4 (1.12x) | 62.0 (1.05x) |
| n-max 8 | 51.2 (0.86x) | 55.9 (0.94x) | 53.8 (0.91x) | 54.5 (0.92x) | 48.6 (0.82x) |

La tasa de aceptacion de drafts para las mismas celdas:

| Profundidad | T=0 | T=0.25 | T=0.5 | T=0.75 | T=1.0 |
|---|---:|---:|---:|---:|---:|
| n-max 1 | 0.814 | 0.820 | 0.842 | 0.791 | 0.736 |
| n-max 2 | 0.685 | 0.692 | 0.696 | 0.631 | 0.620 |
| n-max 3 | 0.692 | 0.588 | 0.605 | 0.586 | 0.552 |
| n-max 5 | 0.455 | 0.415 | 0.441 | 0.414 | 0.388 |
| n-max 8 | 0.290 | 0.297 | 0.308 | 0.305 | 0.260 |

## Requisitos de hardware

- VRAM estimada: el fichero `APEX-dynamic-v2.gguf` (11.91 GiB) esta disenado para tarjetas de 16 GB de VRAM; el fichero `MTP-APEX-i-quality-v2.gguf` (19.24 GiB) requiere al menos 20-24 GB de VRAM para inferencia con contexto largo.
- GPUs recomendadas: RTX 4090 (24 GB) o superior para la version i-quality; RTX 4080, RTX 3090 o equivalentes de 16 GB para la version dynamic.
- Compatibilidad con GPU de consumo: si, ambas versiones caben en GPUs consumer de gama alta; la version dynamic esta optimizada para 16 GB.
- Opciones de despliegue: `llama.cpp` / `llama-server` (recomendado para MTP), tambien compatible con cualquier runtime que soporte GGUF (Ollama, LM Studio, etc.). El modelo base es compatible con vLLM, SGLang y KTransformers, pero la cuantizacion APEX esta pensada para llama.cpp.
- Latencia y throughput: con el MTP head activado y `n-max 3`, se miden 85.7 tok/s a T=0 en contexto largo (~82 KB), frente a 59.3 tok/s sin drafter. En prompts cortos, el autor menciona un baseline de ~70.8 tok/s sin drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev (base) | 34.66B totales, ~3B activos | no disponible | 69.40 | Apache 2.0 | safetensors |
| Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible | 64.40 | Apache 2.0 | safetensors |
| KAT-Coder-V2.5-Dev-MTP-APEX-GGUF (este repo) | 34.66B totales, ~3B activos | no disponible | 69.40 (heredado del base) | Apache 2.0 | GGUF (APEX) |

La comparativa se limita a los modelos mencionados en la informacion disponible. No se dispone de datos de otros modelos de codificacion de tamano similar (por ejemplo, DeepSeek-Coder-V2-Lite o CodeQwen) en las fuentes consultadas.

## Limitaciones y advertencias

- El MTP head es un trasplante sin fine-tuning: los pesos se copian directamente de Qwen3.6-35B-A3B sin entrenamiento sobre la distribucion de KAT-Coder. La tasa de aceptacion de drafts es suboptima en comparacion con un head entrenado especificamente, y el autor planea un fine-tuning futuro.
- La decodificacion especulativa no cambia la correccion de las salidas: los tokens rechazados se descartan, pero el speedup puede degradarse con profundidades altas (n-max 8 llega a ser mas lento que sin drafter).
- Modelo solo texto: no incluye capacidades de vision ni audio, a pesar de que el backbone Qwen3.6 podria tener variantes multimodales.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo o robustez para este modelo; como cualquier LLM de codigo, puede generar codigo incorrecto o inseguro si no se valida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base KAT-Coder-V2.5-Dev puede tener restricciones adicionales en su documentacion (no verificadas en las fuentes disponibles).
- La cuantizacion APEX es experimental: el autor la describe como investigacion independiente; no hay garantias de estabilidad en produccion mas alla de las pruebas reportadas.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/ursb01/KAT-Coder-V2.5-Dev-MTP-APEX-GGUF
- Modelo base (Kwaipilot/KAT-Coder-V2.5-Dev): https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Informe tecnico KAT-Coder-V2.5 (arXiv): https://arxiv.org/abs/2607.05471
- Version HTML del informe: https://arxiv.org/html/2607.05471v1
- Cuantizacion APEX similar de otro autor (mudler): https://huggingface.co/mudler/KAT-Coder-V2.5-Dev-APEX-GGUF
