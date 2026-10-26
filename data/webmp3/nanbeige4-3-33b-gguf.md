# webmp3/Nanbeige4.3-33B-GGUF

## Resumen

`webmp3/Nanbeige4.3-33B-GGUF` es una recuantización comunitaria en formato GGUF del modelo denso `Nanbeige/Nanbeige4.3-33B`, un transformer de 33.118.977.024 parámetros (33,1B) desarrollado por Nanbeige, laboratorio ligado a la plataforma de reclutamiento BOSS Zhipin, y publicado originalmente el 24 de octubre de 2026 bajo licencia Apache 2.0. El modelo base está orientado a tareas de codificación agéntica y de "cowork" de oficina, con una ventana de contexto declarada de 524.288 tokens (512K).

Este repositorio no es una release oficial: el propio autor lo etiqueta como cuantización independiente y advierte de que las comprobaciones de calidad, velocidad y compatibilidad no se han ejecutado. El proceso parte de un GGUF BF16 intermedio publicado por bartowski (`Nanbeige_Nanbeige4.3-33B-bf16.gguf`, SHA-256 `09da2d75...`) y genera cuatro presets estándar de llama.cpp —Q2_K, Q3_K_M, Q4_K_M y Q5_K_M— divididos en ficheros de 2-4,3 GB por shard, con un total de 72,5 GB en el repositorio.

Su relevancia práctica es doble: permite ejecutar un modelo de 33B con contexto muy largo en hardware de una sola GPU consumer (la variante Q4_K_M ocupa unos 18,7 GiB en disco) y sirve como artefacto reproducible, ya que la model card publica SHA-256 por fichero y fija el commit exacto del checkpoint de origen (`c1093c50...`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin MoE); detalles de capas y cabezas no disponibles |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) según el modelo base |
| Tipos de cuantización | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (presets estándar de llama.cpp, multi-shard) |
| Idiomas soportados | Inglés (en) y chino (zh) declarados; otros sin evaluar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros divididos en shards `00001-of-0000N`); el checkpoint original está en safetensors/BF16 |

Detalle de los ficheros publicados:

| Cuantización | Shards | Tamaño total (bytes) | Equivalente |
|---|---:|---:|---:|
| Q2_K | 3 | 12.664.997.792 | 12,66 GB / 11,80 GiB |
| Q3_K_M | 4 | 16.273.216.896 | 16,27 GB / 15,16 GiB |
| Q4_K_M | 5 | 20.067.402.624 | 20,07 GB / 18,69 GiB |
| Q5_K_M | 6 | 23.524.864.384 | 23,52 GB / 21,91 GiB |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un transformer denso de 33,1B parámetros, no una arquitectura MoE ni híbrida, y que se publica junto a un checkpoint `Nanbeige4.3-33B-Base` pensado para post-entrenamiento propio. No se dispone del número de capas, dimensión oculta, cabezas de atención, vocabulario ni del cómputo total de entrenamiento empleado. Tampoco hay datos públicos en esta información sobre la composición del dataset, el volumen de tokens o si se aplicaron fases de RLHF/DPO; la model card del modelo base no se ha incluido en el material de referencia, por lo que estos campos deben consultarse directamente en el repositorio upstream.

En lo que respecta a esta release, la innovación es puramente de infraestructura de cuantización. La ruta empleada es `native_gguf_stream` con el adaptador `standard-llamacpp`: se recuantiza un GGUF ya existente (BF16, con 366 tensores almacenados en BF16 y 105 en F32) en lugar de convertir el checkpoint safetensors original. No se ejecutó calibración con matriz de importancia (imatrix), de modo que los presets son los de fábrica de llama.cpp, con tipos de tensor de fallback que el autor no detalla. Esto implica un error de cuantización acumulado: BF16 → BF16 GGUF → Qx_K.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con plantilla de chat (tag `conversational`).
- Codificación agéntica: edición de repositorios, ejecución de comandos en terminal y resolución de tareas de varios pasos; el modelo base reporta 80,9 en Terminal-Bench 2.1.
- Tareas de "cowork" de oficina: redacción de documentos, correo, hojas de cálculo y flujos administrativos.
- Razonamiento de contexto largo: ventana de hasta 512K tokens en el modelo base (sujeta a la memoria disponible en la práctica).
- Soporte declarado de tool calling / function calling en el modelo base (integraciones compatibles con endpoints, según el tag `endpoints_compatible` del repo).
- Capacidad de servir como base para post-entrenamiento, partiendo del checkpoint `-Base` o de este GGUF en BF16.
- No se han documentado capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Agente de terminal en CI/CD: usar Q4_K_M detrás de `llama-server` para que el modelo reciba el estado de un repositorio, proponga parches y ejecute comandos en un sandbox; el rendimiento declarado en Terminal-Bench 2.1 (80,9) es el indicador más directo de idoneidad para este escenario.
- Refactorización de monorepos grandes: con la ventana de 512K del modelo base se pueden cargar decenas de ficheros en un único prompt para renombrados transversales, migraciones de API o actualización de dependencias; en la práctica, el contexto útil quedará limitado por la memoria disponible para la caché KV.
- Asistente interno de oficina ("cowork"): generación y revisión de informes, correos y tablas a partir de documentos largos, desplegado on-premise con llama.cpp sobre una GPU de 24 GB en Q4_K_M.
- Atención al cliente multi-turno en inglés y chino: el modelo mantiene conversaciones largas con historial extenso; conviene limitar el contexto efectivo a decenas de miles de tokens para controlar el coste de KV cache.
- Extracción de datos estructurados de documentación extensa (contratos, expedientes, documentación técnica): prompts con muchos miles de tokens y salida en JSON validable.
- Inferencia en entornos aislados o air-gapped: al distribuirse como GGUF con SHA-256 por fichero, se puede verificar la integridad del artefacto y ejecutar sin conexión con llama.cpp u Ollama.
- Evaluación comparativa de cuantizaciones: usar Q2_K/Q3_K_M/Q4_K_M/Q5_K_M del mismo origen para medir la degradación por cuantización en tareas de código antes de fijar una variante en producción.
- Base para fine-tuning ligero: partir del GGUF BF16 de bartowski si se necesita el formato llama.cpp, o del checkpoint original en safetensors para entrenamiento completo con QLoRA/LoRA.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| Terminal-Bench 2.1 | 80,9 | Model card del modelo base, difundida en prensa |
| MMLU | No disponible | — |
| HumanEval | No disponible | — |
| GSM8K | No disponible | — |
| Benchmarks de la cuantización GGUF (perplejidad, velocidad) | No medidos | La model card declara explícitamente calidad y velocidad como "untested" |

La información de prensa indica que el modelo base lidera a tres modelos comparables de clase 30B en la mayoría de benchmarks agénticos, pero no identifica cuáles son ni publica la tabla completa. No se han publicado resultados de benchmarks de estas cuantizaciones concretas; cualquier cifra de calidad de los ficheros Q2_K a Q5_K_M debe medirse localmente.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de runtime, contexto corto; estimación a partir del tamaño de fichero, no medida):
  - Q2_K: ~13-14 GiB.
  - Q3_K_M: ~17-18 GiB.
  - Q4_K_M: ~21-23 GiB.
  - Q5_K_M: ~25-27 GiB.
- GPU recomendadas:
  - Q4_K_M en 24 GB (RTX 3090, RTX 4090) con contexto moderado; en 32 GB (RTX 5090) con más margen.
  - Q5_K_M en 32-48 GB (RTX 5090, A6000, A100 40 GB).
  - Contexto muy largo (cientos de miles de tokens): A100 80 GB, H100 80 GB o multi-GPU, por el tamaño de la caché KV.
- ¿Cabe en GPU consumer? Sí: Q2_K y Q3_K_M en 16 GB con contexto corto y KV cache cuantizada (ajustado); Q4_K_M en 24 GB; Q5_K_M requiere 32 GB o reparto entre dos GPU.
- La ventana de 512K del modelo base no es viable en una sola GPU consumer sin cuantizar la caché KV y aun así exige mucha memoria; el número de capas y cabezas KV no está disponible, por lo que no se puede calcular el coste exacto por token.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) es la ruta natural al ser GGUF nativo; también Ollama (importando el GGUF con un Modelfile) y LM Studio. vLLM y TGI tienen soporte de GGUF limitado o experimental y no está verificado para esta arquitectura.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens/s para ninguna de las cuatro cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| webmp3/Nanbeige4.3-33B-GGUF (este repo) | 33,1B | 512K (heredado) | GGUF Q2_K-Q5_K_M | Apache 2.0 | Recuantización desde BF16 GGUF, sin imatrix, sin evaluar |
| Nanbeige/Nanbeige4.3-33B | 33,1B | 512K | safetensors/BF16 | Apache 2.0 | Checkpoint oficial, referencia de calidad |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF | 33,1B | 512K (heredado) | GGUF (incluye BF16) | Apache 2.0 | Origen del que parte esta recuantización |
| dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF | 33,1B | No disponible | GGUF | No disponible | Variante sin censura, comunidad |

Frente a modelos densos de clase 30B de otros fabricantes (Qwen3-32B, Gemma 3 27B, Qwen2.5-Coder-32B), la comparación cuantitativa no está disponible en la información proporcionada: solo se conoce el dato de Terminal-Bench 2.1 (80,9) y la afirmación de que supera a tres modelos comparables de 30B en benchmarks agénticos, sin tabla ni cifras del resto.

## Limitaciones y advertencias

- No es una release oficial: el autor indica explícitamente que es una cuantización comunitaria e independiente, sin relación con Nanbeige.
- Calidad no evaluada: la model card marca como no medidas la calidad, la velocidad y la compatibilidad; no hay perplejidad ni benchmarks de estas cuantizaciones.
- Doble cuantización: al partir de un GGUF BF16 ya convertido, se acumula error respecto a convertir directamente los safetensors originales; el autor advierte de ello en la metodología.
- Sin calibración imatrix y con presets de fábrica de llama.cpp, algunos tensores pueden quedar en tipos de fallback, por lo que el tamaño real por tensor no coincide necesariamente con la etiqueta del preset.
- Q2_K y Q3_K_M son agresivas para un modelo de 33B orientado a código; la degradación en tareas agénticas de varios pasos puede ser notable y no está medida.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está documentado ni evaluado.
- Ventana de 512K: coste de memoria de la caché KV muy alto y riesgo de degradación de atención en contextos extremos; no se ha verificado el comportamiento real más allá del modelo base.
- Riesgo de alucinación y sesgos: no hay informes de evaluación de sesgos ni de seguridad para el modelo base ni para esta cuantización; el alineamiento del checkpoint instruct no está documentado en la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero obliga a conservar el aviso de copyright y la atribución a Nanbeige; el publicador de la cuantización retiene igualmente su atribución.
- Para producción conviene fijar la versión por SHA-256 de cada shard y verificar la integridad tras la descarga; el repositorio es multi-fichero y una descarga parcial produce un GGUF inválido.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/webmp3/Nanbeige4.3-33B-GGUF
- Modelo base (instruct): https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelo base (checkpoint para post-entrenamiento): https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- GGUF BF16 de origen (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Model card fijada al commit de origen: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/blob/c1093c501cc6460427c0ac634db7223d0450c0ee/README.md
- Nota de prensa sobre el lanzamiento: https://www.marktechpost.com/2026/10/25/nanbeige-releases-nanbeige4-3-33b-open-agentic-coding-model/
- Guía del modelo: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Ficha resumida (512K de contexto): https://ai-tldr.dev/models/nanbeige-4-3-33b/
- Variante sin censura de la comunidad: https://huggingface.co/dealignai/Nanbeige4.3-33B-UNCENSORED-GGUF
