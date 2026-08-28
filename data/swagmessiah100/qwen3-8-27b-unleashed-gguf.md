# SwagMessiah100/Qwen3.8-27B-Unleashed-GGUF

## Resumen

Qwen3.8-27B-Unleashed-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B-Uncensored, una versión "abliterated" (sin censura) del modelo Qwen3.8-27B de Alibaba, publicada por el usuario SwagMessiah100 en HuggingFace. El modelo base, desarrollado por JonathanColetti, elimina los mecanismos de rechazo de contenido del modelo original, manteniendo las capacidades técnicas de Qwen3.8. Esta versión GGUF aplica una cuantización dinámica por tensor (receta Unsloth Dynamic 3.0) que asigna diferentes niveles de precisión según la sensibilidad de cada capa, logrando una calidad superior a cuantizaciones uniformes de mayor tamaño.

El repositorio incluye 9 niveles de cuantización (desde UD-IQ1_M hasta UD-Q3_K_XL) con tamaños que van desde aproximadamente 9 GB hasta 14.3 GB, todos con una ventana de contexto de 262 144 tokens (250k efectivos). La cuantización dinámica permite que el nivel Q3 supere en calidad a un Q4 uniforme, con una penalización de perplexity inferior al 4% incluso en el nivel Q2. El modelo soporta inglés y chino, está licenciado bajo Apache 2.0 y es compatible con llama.cpp, vLLM y otros runners de GGUF.

La relevancia de este modelo radica en combinar tres características que rara vez coexisten: pesos sin censura (abliterated), cuantización eficiente de alta calidad y contexto ultralargo de 250k tokens, todo bajo una licencia permisiva. Está orientado a desarrolladores que necesitan ejecutar un modelo de 27B en hardware de consumo (GPU de 24 GB) con capacidades de razonamiento y generación de código, sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8, basado en Qwen3.5) con multi-token prediction (MTP) |
| Parametros totales | 26 895 998 464 (26.9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (250 806 tokens verificados en retrieval) |
| Tipos de cuantizacion | UD-IQ1_M, UD-IQ2_S, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_XL, UD-Q2_K_XL, etc. (9 tiers, todos con cuantización dinámica por tensor) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base disponibles en el repositorio original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros, construido sobre la arquitectura de Qwen3.5. Incorpora un mecanismo de multi-token prediction (MTP) que permite predecir varios tokens a la vez, lo que acelera la inferencia cuando se combina con decodificación especulativa (DFlash2 en llama.cpp). El modelo original fue entrenado con datos multilingües (inglés y chino) y optimizado para tareas de codificación, razonamiento y trabajo agéntico de largo horizonte, según la descripción oficial de Qwen3.8.

La versión "Uncensored" de JonathanColetti aplica una técnica de abliteration, que elimina selectivamente las direcciones de activación responsables del rechazo de contenido, manteniendo intactas las capacidades generales del modelo. El presente repositorio cuantiza esos pesos con la receta Unsloth Dynamic 3.0, que asigna un tipo de tensor por capa (por ejemplo, `q6_k` para capas sensibles, `iq2_s` para capas tolerantes) basándose en un mapa de tipos extraído de los GGUF oficiales de Unsloth. La cuantización se realizó con imatrix (matriz de importancia) del repositorio original, y se verificó cada archivo con pruebas de carga reales antes de publicarlo.

## Capacidades

- Generación de texto libre en inglés y chino, con razonamiento multi-paso y matemáticas básicas.
- Generación de código en múltiples lenguajes (Python, JavaScript, C++, etc.) gracias a las capacidades de Qwen3.8.
- Soporte de tool calling y function calling, útil para integraciones con APIs y agentes.
- Capacidad de razonamiento agéntico de largo horizonte: puede mantener coherencia en tareas de múltiples pasos con contexto largo (hasta 250k tokens).
- Modo de decodificación especulativa (DFlash2) en llama.cpp, que acelera la generación entre un 10% y un 30% según el tamaño de generación.
- Sin censura: no rechaza peticiones sobre temas sensibles (violencia, sexualidad, política, etc.), lo que permite casos de uso creativos o de investigación sin restricciones.
- Compatible con la mayoría de runners GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp, etc.

## Casos de uso

- Asistentes de código locales sin censura: un desarrollador puede ejecutar el modelo en una GPU de 24 GB (por ejemplo, RTX 4090) para generar, revisar y refactorizar código en proyectos propietarios, sin enviar datos a la nube. La cuantización Q3_K_XL (13.2 GB) ofrece ~112 tok/s en generación larga, suficiente para flujos interactivos.
- Agentes autónomos con memoria larga: gracias a los 250k tokens de contexto, el modelo puede procesar repositorios completos, logs de ejecución o documentación extensa, y mantener un estado coherente durante tareas de automatización de múltiples pasos (por ejemplo, depuración de un proyecto completo).
- Chatbots de rol o narrativa sin filtros: creadores de ficción pueden usar el modelo para generar diálogos, historias o juegos de rol con contenido adulto sin que el modelo se niegue a responder, manteniendo calidad narrativa gracias a la cuantización dinámica.
- Análisis de documentos legales o técnicos en chino e inglés: el modelo puede resumir, extraer y comparar información de contratos, patentes o manuales extensos (hasta 250k tokens) en ambos idiomas, con coste de hardware reducido.
- Generación de datos sintéticos para entrenamiento: investigadores pueden usar el modelo sin censura para crear datasets de entrenamiento en dominios sensibles (por ejemplo, ciberseguridad ofensiva, medicina de emergencia) donde los modelos censurados producen respuestas incompletas.
- Evaluación de técnicas de alineación y seguridad: el modelo abliterated sirve como banco de pruebas para estudiar cómo la eliminación de rechazo afecta a la calidad, la toxicidad y la utilidad, comparándolo con la versión censurada original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones de perplexity (wikitext-2) y velocidad en una RTX 4090 con llama.cpp y DFlash2, comparando distintas cuantizaciones del mismo modelo:

| Quant | Tamano | PPL (wikitext-2) ↓ | Velocidad mediana (tok/s) | Retrieval (needle) | Sin censura |
|---|---|---|---|---|---|
| Unleashed UD-IQ4_XS | 14.3 GB | 6.3502 | no disponible | pendiente | Si |
| Unleashed UD-Q3_K_XL | 13.2 GB | 6.4036 | 112.8 | 250 806 tok | Si |
| Unleashed UD-IQ3_XXS | 11.0 GB | 6.4818 | no disponible | pendiente | Si |
| unsloth UD-Q3_K_XL (ref) | 12.24 GB | 6.3993 | 110.7 | 250 806 tok | No |
| uncensored IQ4_XS (ref) | 15.1 GB | 6.4149 | 107.3 | 32k | Si |
| unsloth UD-Q4_K_XL (ref) | 16.7 GB | 6.4181 | 62.6 | 4k | No |
| uniform Q3_K_M + imatrix (ref) | 12.57 GB | 6.5316 | 84.8 | 258 900 tok | Si |
| unsloth UD-Q2_K_XL (ref) | 9.15 GB | 6.6469 | no disponible | no disponible | No |

Nota: los valores de PPL solo son comparables dentro de esta tabla (mismo hardware, mismo harness, mismo número de chunks). La velocidad mediana depende fuertemente de la longitud de generación: para respuestas cortas (1-50 tokens) baja a ~25 tok/s, mientras que para generaciones largas (>1500 tokens) sube a ~56 tok/s, con un pico observado de ~195 tok/s en un solo request.

## Requisitos de hardware

- VRAM estimada: el tier Q3_K_XL (13.2 GB) cabe en una GPU de 16 GB con overhead de KV cache (q4_0). El tier IQ3_XXS (11.0 GB) cabe en 12 GB. El tier IQ2_S (menor tamaño, ~9 GB) puede funcionar en 8-10 GB con contexto reducido.
- GPU recomendadas: RTX 4090 (24 GB) para los tiers Q3/Q4 con contexto completo; RTX 4080/4070 Ti (16 GB) para Q3 con contexto moderado; RTX 4060 (8 GB) solo para IQ2 con contexto limitado.
- No requiere GPU de datacenter; es viable en hardware de consumo. Para despliegue en producción con alta concurrencia, se recomienda una A100 o H100 con al menos 40 GB.
- Opciones de despliegue: llama.cpp (incluye soporte de DFlash2), Ollama, LM Studio, KoboldCpp, vLLM (con backend GGUF) o TGI (con conversión a safetensors).
- Latencia y throughput: en RTX 4090 con Q3_K_XL, ~25 tok/s para generaciones cortas (tool calls) y ~56 tok/s para generaciones largas. El throughput depende más del número de tokens generados que de la longitud del contexto, debido al overhead fijo por request (prefill, sampler init, warm-up del draft).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Sin censura | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Unleashed (este) | 26.9B | 250k | Apache 2.0 | Dinamica (Unsloth 3.0) | Si | Mejor PPL que Q4 uniforme a menor tamano |
| unsloth/Qwen3.8-27B-GGUF | 26.9B | 250k | Apache 2.0 | Dinamica (Unsloth 3.0) | No | Referencia oficial de cuantizacion, sin abliteration |
| JonathanColetti/Qwen3.8-27B-Uncensored | 26.9B | 250k | Apache 2.0 | bf16 (safetensors) | Si | Modelo base sin cuantizar, requiere ~54 GB VRAM |
| Qwen3.8-27B (original) | 26.9B | 250k | Apache 2.0 | bf16 | No | Modelo oficial de Alibaba, con censura |

La comparativa muestra que este modelo ofrece la combinación única de cuantización eficiente (con mejor calidad que las alternativas uniformes) y pesos sin censura, a costa de ~1 GB más de tamaño frente al equivalente censurado de Unsloth. Frente al modelo base uncensored en bf16, requiere menos de la mitad de VRAM con una pérdida de calidad inferior al 1% en PPL.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, pero no garantiza la ausencia de sesgos ni la exactitud factual. El modelo puede generar contenido dañino, ilegal o falso sin advertir al usuario.
- La cuantización dinámica, aunque superior a la uniforme, introduce degradación en tareas de precisión (matemáticas complejas, razonamiento lógico extenso) frente al modelo en bf16. El autor recomienda no bajar de Q3 para uso profesional.
- El modelo solo soporta inglés y chino; no se ha probado su rendimiento en otros idiomas.
- La ventana de contexto de 250k tokens requiere una gestión cuidadosa de la memoria KV cache; con cuantización q4_0, el uso de VRAM puede superar los 20 GB con contexto completo, dejando poco margen en GPUs de 24 GB.
- Los tiers de baja precisión (IQ1_M, IQ2_S) fueron publicados con errores en una primera versión y posteriormente reconstruidos. Si se descargaron antes del 2026-08-21 a las 22:00 UTC, deben re-descargarse.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes locales sobre difamación, odio o material ilegal.
- No hay garantías de soporte: el autor es un particular y el repositorio no tiene issues activos ni mantenimiento formal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SwagMessiah100/Qwen3.8-27B-Unleashed-GGUF
- Modelo base uncensored: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- GGUF oficial de Unsloth (referencia de cuantizacion): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Modelo en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF
- Guia de cuantizaciones de Qwen3.8-27B (blog): https://www.explainx.ai/blog/unsloth-qwen3-8-27b-dynamic-v3-ggufs-august-2026
- Repositorio comunitario de ejecucion local: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
