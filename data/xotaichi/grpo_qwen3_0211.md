# XOTaiChi/grpo_qwen3_0211

## Resumen

CBC — Qwen3-14B es un ajuste fino del modelo Qwen/Qwen3-14B desarrollado por XOTaiChi, orientado a la defensa contra ataques de inyeccion de prompts (prompt injection) mediante un mecanismo de comprobacion de consistencia de tarea (Consistency Before Complying, CBC). El modelo acompana al articulo "Staying on Task: Defending Against Prompt Injection via Task Consistency Checking", publicado en EMNLP 2026, y se distribuye con licencia Apache 2.0.

La propuesta tecnica consiste en que el modelo razone explicitamente sobre si una instruccion entrante es consistente con la tarea original antes de obedecerla, combinando supervision fina (SFT) con alineamiento mediante GRPO (Group Relative Policy Optimization). El objetivo declarado es mejorar la resistencia a inyecciones sin degradar la utilidad en la tarea legitima, un equilibrio que los filtros clasicos suelen romper.

Se trata de un transformer denso de 14.768.307.200 parametros (heredados de Qwen3-14B), con pesos en safetensors y un repositorio de 59,1 GB. El modelo esta pensado para despliegues conversacionales y pipelines con tool calling donde la integridad de las instrucciones es critica; no obstante, la model card no publica detalles sobre contexto, idiomas ni resultados de evaluacion numericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-14B, un transformer decoder-only denso de aproximadamente 14,8 mil millones de parametros. Sobre esa base, XOTaiChi aplica un proceso de ajuste en dos fases segun la model card: primero un supervised fine-tuning orientado a ensenar al modelo a razonar sobre la consistencia entre la instruccion recibida y la tarea original (task-consistency reasoning), y despues un alineamiento con GRPO, un algoritmo de optimizacion por politica relativa a grupos que no requiere un modelo critico separado y que se ha popularizado para reforzar comportamientos verificables.

La innovacion central es el mecanismo CBC (Consistency Before Complying): el modelo evalua si la instruccion inyectada rompe la coherencia con el objetivo declarado antes de ejecutarla, en lugar de limitarse a clasificar entradas maliciosas. La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni los hiperparametros de GRPO; indica que los datos de entrenamiento y el codigo de sintesis de datos se publicaran proximamente.

## Capacidades

- Generacion de texto conversacional multi-turno sobre la base de Qwen3-14B.
- Razonamiento de consistencia de tarea: evaluacion explicita de si una instruccion es coherente con el objetivo original antes de obedecerla.
- Defensa frente a prompt injection, incluyendo instrucciones embebidas en contenido de terceros.
- Mantenimiento de la utilidad de la tarea legitima (task consistency) segun el planteamiento del paper.
- Soporte de plantilla de chat propia incluida en el checkpoint (requiere usar su tokenizer y chat template).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`).
- Capacidades heredadas de Qwen3-14B no verificadas en esta ficha: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones donde el usuario o contenido recuperado intenta redirigir la tarea del agente; el mecanismo CBC permite rechazar instrucciones inconsistentes sin abandonar el flujo original.
- Agentes con acceso a herramientas externas: en pipelines de tool calling donde la salida de una herramienta puede contener texto malicioso, el modelo verifica la consistencia de la instruccion antes de ejecutar acciones sensibles.
- Procesamiento de documentos de terceros: al resumir o extraer datos de PDFs y webs no confiables, el modelo puede ignorar instrucciones inyectadas en el contenido y ceñirse a la tarea de extraccion solicitada.
- RAG en produccion: en sistemas de recuperacion aumentada, los fragmentos recuperados son un vector habitual de inyeccion; este checkpoint esta entrenado especificamente para resistir ese escenario.
- Evaluacion y red teaming de defensas: util como modelo de referencia para comparar tasas de exito de ataques de prompt injection frente a Qwen3-14B base.
- Investigacion en alineamiento: sirve como caso de estudio de aplicacion de GRPO a un objetivo de seguridad (consistencia de tarea) manteniendo utilidad, replicable con el codigo del repositorio del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo de EMNLP 2026 y al repositorio del proyecto para los datos de evaluacion, pero no incluye cifras en la ficha de Hugging Face.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 29,5 GB solo para pesos (14,77 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 40-48 GB.
- Cuantizacion a 8 bits: alrededor de 15 GB de pesos; a 4 bits, alrededor de 8-9 GB (requiere cuantizar el checkpoint, ya que no se distribuyen variantes GGUF/AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para BF16 sin cuantizar; RTX 4090 (24 GB) viable con cuantizacion 8 bits o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion, en RTX 4090, RTX 3090 (24 GB) y, en 4 bits, potencialmente en GPUs de 12-16 GB con margen ajustado.
- Opciones de despliegue: transformers (libreria nativa del checkpoint), text-generation-inference (soportado segun tags), vLLM previsiblemente compatible al ser arquitectura Qwen3 (no confirmado en la informacion); llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CBC — Qwen3-14B (este) | 14,77 B | no disponible | Defensa ante prompt injection via consistencia de tarea (SFT + GRPO) | Apache 2.0 | Hugging Face, ModelScope |
| Qwen/Qwen3-14B | 14,77 B | no disponible en la informacion | Alineamiento general, sin defensa especifica | Apache 2.0 | Hugging Face |
| Alternativas especializadas en prompt injection | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa de rendimiento frente a Qwen3-14B base o a otros modelos defensivos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican resultados de evaluacion en la model card; la eficacia real frente a ataques de prompt injection no puede verificarse con los datos disponibles.
- No se especifican los idiomas soportados; el comportamiento multilingue de la defensa es desconocido.
- La longitud de contexto no esta documentada en la ficha, aunque hereda la de Qwen3-14B (no confirmado).
- Riesgo de alucinacion inherente a los modelos de 14 B; el entrenamiento en consistencia de tarea no elimina este comportamiento.
- Posible sobre-rechazo: un modelo entrenado para no obedecer instrucciones inconsistentes podria rechazar peticiones legitimas mal formuladas; no hay datos publicados sobre esta tasa.
- Los datos de entrenamiento y el codigo de sintesis de datos aun no estan publicados, lo que limita la reproducibilidad y la auditoria del sesgo del dataset.
- Licencia Apache 2.0 permite uso comercial, pero el articulo y el repositorio pueden imponer condiciones adicionales de citacion academica.
- El checkpoint exige usar su tokenizer y chat template incluidos; sustituirlos puede degradar el comportamiento defensivo.

## Enlaces

- Hugging Face: https://huggingface.co/XOTaiChi/grpo_qwen3_0211
- ModelScope (mirror): https://modelscope.cn/models/augusttailong/grpo_qwen3_0211
- Codigo y evaluacion: https://github.com/XOTaichi/CBC-PI
- Paper (ACL Anthology): https://aclanthology.org/2026.emnlp-main.2303/
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
