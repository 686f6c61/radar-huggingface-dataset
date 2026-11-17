# zed122/merged

## Resumen

`zed122/merged` es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) creado por el usuario zed122 mediante la fusión de dos modelos de la familia Qwen2.5: `Qwen/Qwen2.5-1.5B-Instruct` y `Qwen/Qwen2.5-Coder-1.5B-Instruct`. La operación se realizó con la herramienta mergekit aplicando el método SLERP (interpolación esférica) con un parámetro `t` de 0,5, lo que reparte el peso de forma equilibrada entre ambos modelos base en todas las capas.

El objetivo declarado de la fusión es combinar las capacidades conversacionales generales del modelo Instruct con las habilidades de generación de código del modelo Coder, manteniendo el mismo tamaño y arquitectura que los originales. Al compartir ambos modelos base la misma arquitectura Qwen2 y el mismo número de parámetros, la fusión es técnicamente directa y no requiere cambios estructurales.

El modelo es relevante como ejemplo de técnica de model merging aplicada a modelos pequeños orientados a instrucciones y código. No obstante, se trata de un experimento sin model card detallada, sin datos de evaluación publicados y sin licencia declarada, por lo que su uso en producción requiere validación previa. El repositorio tiene 392 descargas y ningún "like" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los modelos base Qwen2.5 soportan hasta 32.768 tokens, pero no se confirma para esta fusión) |
| Tipos de cuantización | no disponible en la información proporcionada; al estar en safetensors bfloat16, es compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atención de tipo causal, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo no ha sido entrenado desde cero: es el resultado de una fusión SLERP de dos checkpoints ya entrenados. SLERP interpola esféricamente los tensores de pesos de ambos modelos, tomando como base `Qwen/Qwen2.5-1.5B-Instruct` y aplicando un factor `t = 0,5`, lo que asigna un 50 % de peso a cada modelo en todas las capas.

No se dispone de información sobre datos de entrenamiento adicionales, fine-tuning posterior a la fusión, RLHF, DPO ni ninguna innovación técnica más allá del propio proceso de merging. La configuración YAML publicada solo especifica los dos modelos de origen, el método SLERP, el modelo base y el dtype bfloat16. No hay evidencia de evaluación del resultado de la fusión.

## Capacidades

- Generación de texto conversacional, heredada de `Qwen2.5-1.5B-Instruct`.
- Generación de código y tareas de programación, heredada de `Qwen2.5-Coder-1.5B-Instruct`.
- Razonamiento básico y respuesta a instrucciones en formato chat (los modelos base usan plantilla de chat Qwen).
- Soporte de tool calling y function calling: probable por herencia de los modelos base Qwen2.5, pero no verificado en esta fusión.
- Capacidades multilingües: no confirmadas para esta fusión; los modelos base Qwen2.5 soportan varios idiomas, pero no hay datos específicos.
- No se ha confirmado soporte de modo "thinking", visión, audio ni agentes multi-paso en esta fusión concreta.

## Casos de uso

- Asistente de código en local para entornos con recursos limitados: el modelo de 1,5 B puede ejecutarse en GPU de consumo y servir para autocompletado o explicación de fragmentos de código, aprovechando la componente Coder de la fusión.
- Chatbot de soporte técnico básico: al combinar capacidades conversacionales e instrucciones, puede gestionar diálogos multi-turno sencillos en aplicaciones de bajo coste.
- Prototipado rápido de pipelines de generación de texto: su tamaño reducido permite iterar con llama.cpp, Ollama o transformers sin infraestructura dedicada.
- Generación de documentación técnica y comentarios de código: útil para tareas de resumen y explicación de funciones en repositorios pequeños.
- Educación y experimentación con técnicas de model merging: sirve como caso de estudio reproducible de fusión SLERP entre un modelo general y uno especializado en código.
- Tareas de extracción y transformación de texto en entornos edge: al caber en GPUs de consumo, puede desplegarse en estaciones de trabajo sin servidores dedicados.
- Evaluación comparativa de fusiones: útil para investigadores que quieran medir si la combinación de Instruct y Coder mejora tareas mixtas frente a cada modelo por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación en la model card. Tampoco se dispone de comparaciones verificadas frente a los modelos base.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,1 GB solo para pesos (1,543 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 1 GB para pesos, con margen para contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes; también cabe en GPUs de 8 GB en cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB o más, especialmente con cuantización.
- Opciones de despliegue: transformers, vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI (el repo incluye la etiqueta `text-generation-inference`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zed122/merged | 1,54 B | no disponible | no disponible | Hugging Face (392 descargas) | Fusión SLERP de Instruct + Coder |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (según model card oficial) | Apache 2.0 (según model card oficial) | Hugging Face | Modelo base conversacional |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens (según model card oficial) | Apache 2.0 (según model card oficial) | Hugging Face | Modelo base especializado en código |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (según model card oficial) | Apache 2.0 (según model card oficial) | Hugging Face | Alternativa pequeña conversacional |

La comparación directa con los modelos base es la más relevante: esta fusión no aporta un contexto o licencia verificados propios, y su rendimiento frente a cada base no está documentado.

## Limitaciones y advertencias

- No hay licencia declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido; los modelos base Qwen2.5 se publican bajo Apache 2.0, pero la fusión no hereda automáticamente esa declaración en su model card.
- No se han publicado evaluaciones: no hay evidencia de que la fusión mejore a los modelos base en ninguna tarea concreta; el merging puede degradar capacidades.
- Riesgo de alucinación inherente a modelos de 1,5 B, especialmente en tareas de razonamiento complejo o código de producción.
- Idiomas soportados no confirmados; el comportamiento multilingüe puede diferir del de los modelos base.
- Longitud de contexto no confirmada para la fusión; no se debe asumir el contexto de 32.768 tokens de Qwen2.5 sin verificación.
- La model card contiene comentarios en árabe en la configuración YAML y enlaces a un repositorio de mergekit de un tercero, lo que reduce la trazabilidad del proceso.
- Sin garantías de mantenimiento: el repositorio tiene 0 likes y un único autor, sin historial de soporte.
- Para producción, se recomienda validar frente a los modelos base con un conjunto de evaluación propio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/zed122/merged
- Modelo base Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Repositorio referenciado en la model card: https://github.com/phox9622-dotcom/suc_mergekit
- SLERP (Wikipedia): https://en.wikipedia.org/wiki/Slerp
