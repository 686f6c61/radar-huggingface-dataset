# vernonleon/MiMo-V2.6-Distill-Qwen-9B-heretic

## Resumen

MiMo-V2.6-Distill-Qwen-9B-heretic es una variante "decensored" del modelo MiMo-V2.6-Distill-Qwen-9B de Xiaomi MiMo, publicada por el usuario vernonleon mediante la herramienta Heretic v2.1.0. El modelo original es un fine-tuning supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, orientado a tareas agénticas, codigo, ciberseguridad y codigo visual. Esta version aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 16 a 25 para reducir el comportamiento de rechazo, manteniendo la mayor parte de las capacidades del modelo base.

El modelo cuenta con 9.409.813.744 parametros en formato safetensors, se distribuye bajo licencia MIT y se integra en el ecosistema transformers con pipeline image-text-to-text, lo que indica soporte multimodal de entrada imagen-texto. Su interes actual radica en que ofrece un checkpoint agéntico de 9B con modo de razonamiento explicito (thinking), plantilla de chat propia y capacidades de tool calling, pero sin las restricciones de rechazo del modelo original, lo que lo hace atractivo para investigacion en alineacion, red-teaming y despliegues donde el modelo base rechaza peticiones legitimas.

La relevancia practica es doble: por un lado, es un punto de partida reproducible (incluye directorio `reproduce` con los parametros ARA exactos) para estudiar tecnicas de ablacion; por otro, conserva los benchmarks del checkpoint SFT original, lo que permite evaluar el coste de la decensura en terminos de divergencia KL (0.0251) frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-9B), con soporte multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repo | 18.9 GB |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (finetune) |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

El modelo original MiMo-V2.6-Distill-Qwen-9B parte de Qwen3.5-9B, un transformer decoder-only de 9B parametros, y se obtiene mediante supervised fine-tuning sobre datos generados por MiMo. La mezcla de datos SFT contiene 77.4B tokens totales, de los cuales 27.2B son tokens con perdida (loss-bearing). La composicion por dominio es: codigo 23.2B tokens (29.9%, 7.3B con perdida), ciberseguridad 11.0B (14.2%, 4.8B con perdida), general 22.0B (28.5%, 5.7B con perdida) y visual 21.2B (27.4%, 9.4B con perdida). El checkpoint se publica como punto de partida para investigacion en reinforcement learning agéntico, segun la model card.

La variante heretic aplica Arbitrary-Rank Ablation (ARA) sobre el modelo base con los siguientes parametros: start_layer_index 16, end_layer_index 25, preserve_good_behavior_weight 0.3257, steer_bad_behavior_weight 0.0004, overcorrect_relative_weight 0.8555 y neighbor_count 15. Esta tecnica modifica las representaciones internas en un rango de capas para reducir la probabilidad de respuestas de rechazo, preservando el comportamiento util. El resultado reportado es una reduccion de rechazos de 99/100 a 7/100, con una divergencia KL de 0.0251 respecto al modelo original. El proceso es reproducible y los parametros exactos estan documentados en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito, activable mediante `enable_thinking` en la plantilla de chat.
- Codigo: el checkpoint SFT original reporta mejoras en SWE Verified, SWE Pro y MiMo Code (mini) frente a Qwen3.5-9B.
- Ciberseguridad: evaluado en MiMo Cyber (mini), con mejora sustancial respecto al base.
- Tareas agénticas generales: AutomationBench, Terminal Bench 2.1, Toolathlon-Verified, OfficeQA y JobBench.
- Codigo visual: pipeline image-text-to-text, evaluado en MiMo Visual Coding (mini).
- Soporte de tool calling y function calling, segun los tags `tool-use` y `agentic`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo decensurado: reduce rechazos en peticiones que el modelo base declinaria.

## Casos de uso

- Investigacion en alineacion y red-teaming: el modelo permite estudiar como responde un LLM de 9B sin capa de rechazo, comparando con el checkpoint original y midiendo la divergencia KL (0.0251) para evaluar el coste de la ablacion.
- Generacion de codigo en pipelines de CI/CD: con soporte de tool calling y buen rendimiento en SWE Verified (61.1 avg@3) y SWE Pro (44.6 avg@3), puede integrarse en agentes que resuelven issues y ejecutan tests en repositorios.
- Automatizacion de tareas de terminal: Terminal Bench 2.1 con 37.1 avg@1 indica capacidad para operar en entornos de linea de comandos mediante agentes multi-paso.
- Analisis de seguridad ofensiva controlada: el rendimiento en MiMo Cyber (mini) de 31.3 avg@3 frente a 5.7 del base lo hace util en laboratorios de seguridad para generar y analizar escenarios de ataque en entornos aislados.
- Asistencia en tareas de oficina y ofimatica: OfficeQA (19.5 avg@1) y JobBench (18.3 avg@1) sugieren uso en agentes que responden preguntas sobre documentos y ejecutan flujos de trabajo administrativos.
- Codigo visual: al ser image-text-to-text, puede procesar capturas de interfaz o diagramas para generar o corregir codigo, con 64.0 avg@1 en MiMo Visual Coding (mini).
- Despliegue en investigacion reproducible: al incluir los parametros ARA y un directorio `reproduce`, sirve como referencia para replicar tecnicas de decensura en otros modelos.

## Benchmarks y rendimiento

Resultados del checkpoint SFT original reportados en el informe tecnico de MiMo-V2.6 (la variante heretic no publica benchmarks propios; se asume degradacion minima por KL 0.0251).

| Dominio | Benchmark | Metrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Codigo | SWE Verified | avg@3 | 60.0 | 61.1 |
| Codigo | SWE Pro | avg@3 | 32.0 | 44.6 |
| Codigo | MiMo Code (mini) | avg@3 | 19.5 | 51.6 |
| Ciber | MiMo Cyber (mini) | avg@3 | 5.7 | 31.3 |
| General | AutomationBench v1.0.6 | avg@1 | 5.0 | 30.3 |
| General | Terminal Bench 2.1 | avg@1 | 27.0 | 37.1 |
| General | Toolathlon-Verified | avg@1 | 25.9 | 35.2 |
| General | OfficeQA | avg@1 | 9.0 | 19.5 |
| General | JobBench | avg@1 | 2.6 | 18.3 |
| General | MiMo General (mini) | avg@1 | 28.5 | 62.2 |
| Visual | MiMo Visual Coding (mini) | avg@1 | 61.7 | 64.0 |

Metricas de la variante heretic frente al original:

| Metrica | Hereitic | Original |
|---|---|---|
| Rechazos | 7/100 | 99/100 |
| Divergencia KL | 0.0251 | 0 (por definicion) |

Los benchmarks marcados con (mini) son conjuntos de evaluacion internos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 8-bit: alrededor de 10-11 GB; en 4-bit, alrededor de 6-7 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para FP16 ajustado o 8-bit.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 12-16 GB con cuantizacion 4/8-bit.
- Opciones de despliegue: SGLang (recomendado por el autor, con `--reasoning-parser mimo`), transformers; llama.cpp/Ollama/vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-heretic | 9.4B | no disponible | MIT | Agéntico, decensurado | Rechazos 7/100, KL 0.0251 |
| MiMo-V2.6-Distill-Qwen-9B (original) | 9.4B | no disponible | no disponible | Agéntico SFT | Rechazos 99/100 |
| Qwen3.5-9B | ~9B | no disponible | no disponible | Base general | Punto de partida del SFT |
| Alternativas decensuradas de 8-9B | no disponible | no disponible | variable | Reduccion de rechazos | No se dispone de datos comparables en la informacion |

La comparativa con otras variantes "abliterated" o "uncensored" del ecosistema no puede completarse con los datos proporcionados.

## Limitaciones y advertencias

- La decensura reduce rechazos de 99/100 a 7/100, lo que implica que el modelo puede generar contenido que el original declinaria; requiere supervision humana y filtros externos en produccion.
- La divergencia KL de 0.0251 indica un cambio medible en la distribucion de salida; pueden aparecer regresiones en tareas sensibles no cubiertas por los benchmarks.
- Los benchmarks publicados corresponden al checkpoint SFT original, no a la variante heretic; el rendimiento real de esta variante no esta medido de forma independiente.
- No se dispone de informacion sobre sesgos, idiomas soportados ni longitud de contexto; no se puede garantizar comportamiento multilingue.
- La licencia del modelo heretic es MIT, pero el modelo base incluye restricciones de uso (prohibicion de usos ilegales, militares, ciberactividades maliciosas, acceso no autorizado a datos personales y ejecucion autonoma de acciones de alto riesgo sin supervision). Es responsabilidad del usuario verificar el cumplimiento.
- El modelo original se publica como checkpoint SFT para investigacion en RL agéntico; no esta optimizado para produccion sin evaluacion adicional.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vernonleon/MiMo-V2.6-Distill-Qwen-9B-heretic
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic: https://heretic-project.org
- Informe tecnico MiMo-V2.6 (referencia de citacion): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- SGLang (instalacion): https://docs.sglang.io/get_started/install.html
- Contacto legal Xiaomi MiMo: mimo-legal@xiaomi.com
