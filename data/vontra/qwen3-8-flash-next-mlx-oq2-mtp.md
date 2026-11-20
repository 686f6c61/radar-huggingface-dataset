# Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-oQ2-MTP es una conversión cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario Vontra (con la marca TensorFold en la model card). Se trata de una versión en formato MLX safetensors, pensada para ejecutarse en Apple Silicon, que aplica una cuantización mixta sensible a la sensibilidad de cada módulo (denominada oQ2) sobre el checkpoint oficial en BF16, preservando el bloque nativo de predicción multi-token (MTP) del modelo original para decodificación especulativa.

El modelo base es un MoE disperso de visión y lenguaje con arquitectura `qwen4_exp`, que combina Gated DeltaNet, Qwen Sparse Attention, capas de mezcla de expertos dispersas, flujos residuales con compuertas ensanchadas y embeddings hasheados de bigramas y trigramas. Según la model card, el modelo de lenguaje tiene 125B parámetros totales con 6B activos, un embedding de n-gramas de 51B parámetros con 20 millones de entradas y un bloque MTP nativo de 4B parámetros. El repositorio declara 179.999.981.459 parámetros totales en safetensors y un tamaño de 70,8 GB.

Su relevancia radica en que permite ejecutar un modelo de gran tamaño con capacidades de visión y lenguaje en hardware de Apple Silicon mediante una cuantización agresiva de 2 bits como base, con overrides de mayor precisión en módulos sensibles. La model card reporta una velocidad de generación de aproximadamente 26 tokens/s en un Apple M3 Studio, lo que lo convierte en una opción práctica para inferencia local en equipos de sobremesa de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE + embeddings n-gram hasheados + MTP nativo) |
| Parametros totales | 179.999.981.459 (según safetensors); desglose de la model card: 125B LM + 51B embedding n-gramas + 4B MTP |
| Parametros activos | 6B (modelo de lenguaje); 512 expertos enrutados, 10 activos, más 1 experto compartido |
| Longitud de contexto | 262.144 tokens (extensible upstream a 1.000.000) |
| Tipos de cuantizacion | Base 2-bit affine (group size 32) con overrides mixtos: 297 módulos a 3-bit, 60 a 4-bit, 36 a 5-bit, 129 a 6-bit, 224 a 8-bit; group sizes de 32, 64 o 128 según módulo |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (15 shards, 70,782 GB / 65,921 GiB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina varios componentes: Gated DeltaNet, Qwen Sparse Attention, capas de mezcla de expertos dispersas con 512 expertos enrutados (10 activos más 1 compartido), flujos residuales con compuertas ensanchadas, embeddings hasheados de bigramas y trigramas (51B parámetros, 20 millones de entradas) y un bloque nativo de predicción multi-token (MTP) de 4B parámetros y una capa draft para decodificación especulativa. El modelo de lenguaje tiene 48 capas con un tamaño oculto de 2.560 y 125B parámetros totales con 6B activos. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al modelo original y no se reproduce en esta conversión.

La conversión realizada por Vontra parte del checkpoint oficial en BF16 y aplica una receta de cuantización sensible a la sensibilidad: una base affine de 2 bits con group size 32 y 746 overrides de precisión mixta en módulos concretos. El bloque MTP nativo se conserva con el mismo enfoque de precisión mixta. La validación cubrió los 3.747 tensores indexados (incluidos 76 entradas MTP), los 15 shards y tres ejecuciones deterministas de 512 tokens en cada modo MTP con paridad exacta de hashes de salida. En las pruebas en un Apple M3 Studio, el MTP nativo a profundidad 3 no mejoró el rendimiento: la velocidad mediana fue de 25,9290 tokens/s con MTP activado frente a 26,1398 tokens/s con MTP desactivado (un -0,81 %), con una tasa de aceptación de borradores del 57,89 % (33 de 57). Por ello, la model card recomienda desactivar MTP por defecto en esta release.

## Capacidades

- Generación de texto y conversación multi-turno en formato image-text-to-text.
- Procesamiento de imágenes y vídeo: el repositorio incluye la configuración del procesador de imagen y vídeo del modelo original.
- Razonamiento y matemáticas: la model card menciona que las puertas de instrucciones, recuerdo factual, aritmética y generación larga coherente se superaron en ambos modos MTP.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Decodificación especulativa mediante bloque MTP nativo (opcional; desactivado por defecto en esta release).
- Contexto largo de hasta 262.144 tokens, extensible upstream a 1.000.000.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX safetensors y cuantizado a 2 bits con overrides, lo que permite ejecutar un MoE de 180B parámetros totales en un Apple M3 Studio a unos 26 tokens/s, adecuado para prototipado y uso personal en escritorio.
- Asistentes multimodales de escritorio: al soportar image-text-to-text, puede emplearse para describir imágenes, responder preguntas sobre capturas de pantalla o analizar documentos escaneados en flujos locales sin depender de la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Análisis de vídeo y contenido visual: la inclusión del procesador de vídeo del modelo original permite tareas de descripción y respuesta a preguntas sobre secuencias de vídeo en entornos locales.
- Investigación en cuantización: el repositorio sirve como referencia para estudiar recetas de precisión mixta sensible a la sensibilidad (746 overrides, group sizes variables) y su impacto en la calidad y el rendimiento.
- Evaluación de decodificación especulativa: el bloque MTP nativo incluido permite experimentar con decodificación especulativa en MLX y medir tasas de aceptación y ganancias de throughput en hardware Apple.
- Generación de texto conversacional en local: para chatbots personales o herramientas de escritura que requieran privacidad y no puedan enviar datos a servicios externos.

## Benchmarks y rendimiento

La model card solo reporta mediciones de velocidad de generación en un Apple M3 Studio (tres ejecuciones de 512 tokens por modo, mediana):

| Modo de ejecucion | Ejecuciones | Salida por ejecucion | Velocidad mediana |
|---|---:|---:|---:|
| MTP nativo desactivado | 3 | 512 tokens | 26,1398 tokens/s |
| MTP nativo activado, profundidad 3 | 3 | 512 tokens | 25,9290 tokens/s |

Tasa de aceptación de borradores MTP: 57,89 % (33 de 57). Cambio de throughput con MTP: -0,81 %. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 70,8 GB (70,782 GB / 65,921 GiB) en 15 shards; se requiere memoria unificada suficiente para cargar los pesos más el contexto y la caché KV.
- Hardware validado: Apple M3 Studio, con ~26 tokens/s de generación en texto.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada amplia; no se dispone de datos de rendimiento para GPU NVIDIA (A100, H100, RTX 4090) en la información proporcionada.
- ¿Cabe en GPU consumer? No hay datos para GPU consumer NVIDIA; en Apple Silicon requiere un equipo con memoria unificada suficiente para alojar los ~66 GiB de pesos.
- Opciones de despliegue: runtime MLX con soporte explícito de `qwen4_exp` y MTP nativo (oMLX, MLX-VLM). Un runtime que no construya el módulo MTP de Qwen4Exp puede rechazar las 76 entradas MTP en carga estricta.
- Latencia y throughput: ~26 tokens/s en Apple M3 Studio para generación de texto de 512 tokens; el rendimiento varía con la longitud del prompt, el crecimiento del contexto, el estado de la caché, la versión del runtime, la presión de memoria y las condiciones térmicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP | 180B totales (6B activos) | 262.144 | MLX safetensors, oQ2 mixta (2-8 bits) | qwen-community-1.0 | Hugging Face, 1.602 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180B totales (6B activos) | 262.144 (extensible a 1.000.000) | BF16 | qwen-community-1.0 | Hugging Face |
| Otras conversiones MLX del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de esta conversión con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización base de 2 bits puede degradar la calidad frente al checkpoint BF16 original; la model card no publica evaluaciones de calidad comparativas.
- El MTP nativo no mejora el throughput en las pruebas realizadas (-0,81 %) y se recomienda desactivarlo por defecto; la tasa de aceptación de borradores fue del 57,89 %.
- Requiere un runtime con soporte explícito de `qwen4_exp` y del módulo MTP nativo; runtimes sin ese soporte pueden fallar al cargar las 76 entradas MTP en modo estricto.
- El rendimiento depende de la presión de memoria, la caché, la versión del runtime y las condiciones térmicas; los 26 tokens/s medidos corresponden a un Apple M3 Studio y a generación de texto.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni restricciones adicionales del modelo base en la información proporcionada.
- El repositorio figura bajo el autor Vontra, mientras que la model card hace referencia a TensorFold; conviene verificar la procedencia y el soporte del mantenedor antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Licencia: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ2-MTP/blob/main/LICENSE
- TensorFold: https://tensorfold.dev
- Qwen: https://qwen.ai/
