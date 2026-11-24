# webmp3/Sakura-Axion-1.0-35B-GGUF

## Resumen

Sakura-Axion-1.0-35B-GGUF es una cuantización comunitaria, no oficial, del modelo Axion1-0/Axion-1.0-35B, publicada por el usuario webmp3 bajo el nombre de proyecto "Sakura". El modelo base es un transformer de tipo MoE (arquitectura declarada como `qwen35moe`) con 34.660.610.688 parámetros totales, y esta release ofrece cuatro presets GGUF listos para su uso con llama.cpp: Q4_K_M, Q5_K_M, Q6_K y Q8_0, además del proyector de visión BF16 del repositorio upstream.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de aproximadamente 35B en hardware de consumo gracias a la reducción de tamaño (de 69,4 GB en BF16 a 21,2 GB en Q4_K_M). Por otro, documenta con rigor el proceso de recuantización: el autor publica hashes SHA-256, la build exacta de llama.cpp utilizada para validar cada fichero y la distribución real de tensores por tipo de cuantización, lo que facilita la verificación de integridad en despliegues de producción.

El modelo está pensado para conversación (tag `conversational`) y soporta inglés y chino. La licencia del modelo base es Apache 2.0, lo que permite redistribución con atribución. No se han publicado benchmarks de calidad, perplejidad ni rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (transformer MoE, según declara el autor de la cuantización) |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base upstream) |

## Arquitectura y entrenamiento

La arquitectura declarada por el autor de la cuantización es `qwen35moe`, lo que apunta a un transformer con mezcla de expertos (MoE). El repositorio no proporciona detalles sobre el número de expertos, el ratio de activación, la dimensión oculta ni la estrategia de enrutamiento. Tampoco se documenta la longitud de contexto nativa del modelo base ni la composición del dataset de entrenamiento (número de tokens, mezcla de idiomas, proporción de código o matemáticas).

Respecto al proceso de esta release concreta: no se ha realizado una conversión desde el checkpoint BF16/safetensors original, sino una **recuantización de un GGUF existente**. La fuente es el fichero `Axion-1.0-35B.BF16.gguf` (69,4 GB) del repositorio `prithivMLmods/Axion-1.0-35B-GGUF`, en el commit `1bbacc9c4f6949b29495e3ef8aec9276c75a0728`, con SHA-256 `ccf6dbb1a59a78570d558595b577123cf68e79174757a79f554562e32c899e50` y procedencia verificada. No se ejecutó calibración con matriz de importancia. Los presets siguen los valores estándar de llama.cpp, que mantiene ciertos tensores (por ejemplo, pesos de normalización) en F32: en Q4_K_M y Q5_K_M hay 301 tensores F32, 371 del tipo K correspondiente y 61 Q6_K; en Q6_K, 301 F32 y 432 Q6_K; en Q8_0, 301 F32 y 432 Q8_0.

No se documenta si el modelo base recibió RLHF, DPO u otras técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Razonamiento y respuesta a instrucciones en inglés y chino.
- Entrada de imágenes mediante el proyector de visión `Axion-1.0-35B.mmproj-bf16.gguf` (0,9 GB), copiado sin modificar del repositorio upstream. El autor advierte que la entrada de imagen **no ha sido probada** en esta release.
- Ejecución local mediante llama.cpp y `llama-mtmd-cli` para el modo multimodal.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- **Asistente conversacional local en inglés o chino**: el modelo puede gestionar diálogos multi-turno en estaciones de trabajo con una sola GPU de 24 GB usando Q4_K_M (21,2 GB), lo que permite desplegar un asistente privado sin depender de APIs externas.
- **Procesamiento de documentación bilingüe en/zh**: útil para equipos que trabajan con documentación técnica en ambos idiomas y necesitan resúmenes, traducción o extracción de información sin salir del entorno local.
- **Prototipado rápido con llama.cpp**: al estar disponible en cuatro niveles de cuantización, permite ajustar el equilibrio calidad/VRAM según el hardware disponible, desde portátiles con GPU de 16 GB hasta servidores con A100.
- **Evaluación de modelos MoE de ~35B en investigación**: sirve como banco de pruebas para estudiar el comportamiento de un MoE de este tamaño bajo distintas cuantizaciones, comparando las salidas de Q4_K_M frente a Q8_0 sobre el mismo prompt.
- **Despliegue en entornos con requisitos de auditabilidad**: los hashes SHA-256 publicados por fichero y la build exacta de llama.cpp (`b11669-620d2225c`) permiten verificar la integridad del binario y de los pesos antes de poner el modelo en producción.
- **Pruebas exploratorias de capacidad multimodal**: con el proyector de visión adjunto se puede experimentar con descripción de imágenes, aunque el propio autor advierte que esta funcionalidad no ha sido validada en esta release y no debería usarse en producción sin evaluación previa.
- **Generación de código en pipelines internos**: no hay benchmarks que respalden su calidad en código, por lo que solo es recomendable como experimento controlado, no como sustituto de modelos especializados sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama ninguna puntuación de coding benchmark, perplejidad ni calidad salvo que se liste un valor medido, y no lo hace. La única validación reportada es estructural y funcional: estructura GGUF válida (`True`) y prueba de inferencia real con cada fichero cargado en llama.cpp generando texto al menos una vez.

## Requisitos de hardware

- **VRAM estimada para inferencia** (pesos + overhead de contexto, aproximada):
  - Q4_K_M (21,2 GB): ~22-24 GB en GPU.
  - Q5_K_M (24,7 GB): ~26-28 GB en GPU.
  - Q6_K (28,5 GB): ~30-32 GB en GPU.
  - Q8_0 (36,9 GB): ~38-40 GB en GPU.
  - El proyector de visión añade 0,9 GB adicionales si se usa el modo multimodal.
- **GPU recomendadas**: A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; A100 80 GB si se necesita contexto largo con Q8_0. Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) es suficiente en Q4_K_M y justa en Q5_K_M.
- **¿Cabe en GPU de consumo?**: sí, Q4_K_M cabe en una RTX 4090 de 24 GB. Q5_K_M puede requerir offloading parcial a CPU o reducir el contexto. Q6_K y Q8_0 no caben en GPU de consumo de 24 GB sin offloading.
- **Opciones de despliegue**: llama.cpp (probado con la build `b11669-620d2225c`), `llama-cli` para texto y `llama-mtmd-cli` para imágenes. vLLM, TGI u Ollama no están confirmados en la información disponible; Ollama podría importar el GGUF, pero no se ha validado.
- **Latencia y throughput**: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de sus alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. La columna de rendimiento se marca como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Sakura-Axion-1.0-35B-GGUF (esta release) | 34,66 B (MoE) | no disponible | Apache 2.0 | GGUF (Q4-Q8) | no disponible |
| Axion1-0/Axion-1.0-35B (base) | 34,66 B (MoE) | no disponible | Apache 2.0 | safetensors / BF16 GGUF | no disponible |
| prithivMLmods/Axion-1.0-35B-GGUF (GGUF upstream) | 34,66 B (MoE) | no disponible | Apache 2.0 | GGUF BF16 | no disponible |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (MoE de ~35B con licencia Apache 2.0 y soporte multimodal) con datos verificables.

## Limitaciones y advertencias

- **Cuantización no oficial**: es una release comunitaria de webmp3, no del autor upstream. No debe tratarse como referencia canónica del modelo Axion-1.0-35B.
- **Sin benchmarks de calidad**: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad. No se puede afirmar que la calidad se mantenga respecto al BF16 original, especialmente en Q4_K_M.
- **Recuantización desde GGUF, no desde safetensors**: el proceso parte de un BF16 GGUF ya cuantizado previamente, lo que puede acumular pequeñas pérdidas respecto a una conversión directa desde el checkpoint original.
- **Sin calibración con matriz de importancia**: los presets usan los valores estándar de llama.cpp, lo que puede penalizar la calidad en capas sensibles en comparación con cuantizaciones calibradas.
- **Visión no validada**: el proyector de visión se incluye, pero el autor advierte que la entrada de imagen no ha sido probada en esta release.
- **Idiomas limitados a inglés y chino**: no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; no hay evaluación específica publicada para este modelo.
- **Sesgos**: no documentados en la información disponible.
- **Contexto desconocido**: no se especifica la longitud de contexto nativa, lo que dificulta planificar despliegues con ventanas largas.
- **Licencia Apache 2.0**: permite uso comercial con atribución, pero el autor de la cuantización no ofrece garantías sobre el modelo base ni sobre el proceso de recuantización.
- **Dependencia de build específica**: se validó con llama.cpp `b11669-620d2225c`; builds más antiguas pueden no soportar la arquitectura `qwen35moe`.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/webmp3/Sakura-Axion-1.0-35B-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Repositorio GGUF upstream (origen del BF16): https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF
- Model card del upstream en el commit utilizado: https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF/blob/1bbacc9c4f6949b29495e3ef8aec9276c75a0728/README.md
- llama.cpp (runtime requerido): https://github.com/ggml-org/llama.cpp
