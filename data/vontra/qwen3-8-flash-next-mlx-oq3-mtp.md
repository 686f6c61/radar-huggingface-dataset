# Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP

## Resumen

Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP es una conversión cuantizada en formato MLX del modelo Qwen3.8-Flash-Next de Qwen, diseñada específicamente para ejecutarse en hardware Apple Silicon. El modelo original es un sistema multimodal (imagen-texto) con arquitectura `qwen4_exp`, un MoE disperso de 125.000 millones de parámetros totales (incluyendo 51.000 millones de embeddings n-gram) y solo 6.000 millones de parámetros activos por token. Esta conversión aplica una cuantización mixta de 3 bits (oQ3) con 746 módulos de mayor precisión, lo que reduce el peso total a 92,5 GB manteniendo un bloque MTP (next-token prediction) nativo para decodificación especulativa.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de gran tamaño en equipos Apple con memoria unificada, algo que no sería viable con los pesos BF16 originales. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000 según el modelo base. Es una conversión comunitaria, no un modelo entrenado desde cero, y requiere un runtime con soporte explícito para la arquitectura `qwen4_exp` y el módulo MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 125B (modelo base, incluye 51B de n-gram embeddings y 4B de MTP); 28.909.036.899 en safetensors cuantizados |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | 262.144 tokens (configurado), extensible a 1.000.000 |
| Tipos de cuantizacion | oQ3: base afín de 3 bits, grupo 32, con 746 overrides de precisión (314 a 4-bit, 82 a 5-bit, 127 a 6-bit, 223 a 8-bit) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | MLX safetensors (19 shards, 3.747 tensores indexados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina varias innovaciones: capas Gated DeltaNet (una variante de SSM lineal), atención dispersa Qwen Sparse Attention, capas MoE con 512 expertos enrutados de los que se activan 10 más 1 compartido, streams residuales ensanchados, embeddings n-gram de bigramas y trigramas (51B parámetros, 20 millones de entradas) y un bloque nativo de predicción del siguiente token (MTP) de 4B parámetros para decodificación especulativa. La conversión de Vontra se realizó directamente desde el checkpoint BF16 oficial, midiendo la sensibilidad de cada capa con una sonda de calibración cuantizada y aplicando overrides de precisión solo donde era necesario. No se dispone de información sobre el entrenamiento original (datos, tokens, método de alineación) en la documentación proporcionada.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas de texto (pipeline `image-text-to-text`).
- Razonamiento avanzado: el modelo base está diseñado para tareas de razonamiento complejo, codificación y tareas de oficina, según la documentación de Qwen.
- Decodificación especulativa nativa: incluye un bloque MTP que acelera la generación; en las pruebas del autor, la tasa de aceptación fue del 68,83% y la mejora de throughput del 9,60%.
- Generación de código y matemáticas: capacidades heredadas del modelo base, aunque no se detallan benchmarks específicos en esta conversión.
- Contexto largo: ventana de 262K tokens, ampliable a 1M, adecuada para documentos extensos o conversaciones multi-turno.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible; el modelo base Qwen suele incluirlo, pero no hay evidencia en esta ficha.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización oQ3 permiten ejecutar un modelo de 125B en un Mac Studio con memoria unificada, algo inviable con los pesos BF16 originales. Se usaría con oMLX o MLX-VLM.
- Asistentes multimodales de escritorio: al aceptar imágenes y texto, puede analizar capturas de pantalla, diagramas o documentos escaneados en aplicaciones locales sin conexión a la nube.
- Generación de código asistida: con 6B parámetros activos y contexto de 262K, puede mantener repositorios completos en contexto y sugerir implementaciones o refactorizaciones, aunque requiere validación humana.
- Análisis de documentos largos: la ventana de 262K tokens permite procesar informes extensos, contratos o papers académicos completos, extrayendo información y resumiendo secciones.
- Prototipado de agentes con razonamiento multi-paso: la combinación de MoE eficiente y MTP permite iterar rápidamente en pipelines de razonamiento encadenado, aunque el soporte de tool calling no está confirmado.
- Investigación en eficiencia de cuantización: la metodología oQ3 (base 3-bit con overrides sensibles) puede servir como referencia para estudiar el impacto de la cuantización mixta en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento reportada es la velocidad de generación en Apple M3 Studio (oMLX 0.6.3rc3, MLX-VLM 0.6.3, MLX 0.32.0, greedy decoding, 512 tokens por ejecución):

| Modo | Velocidad mediana | Tokens draftados | Aceptados | Tasa de aceptación |
|---|---|---|---|---|
| MTP desactivado | 26,54 tokens/s | No aplica | No aplica | No aplica |
| MTP activado | 29,08 tokens/s | 847 | 583 | 68,83% |

La mejora de throughput con MTP fue del 9,60%, con hashes de salida idénticos entre ambos modos. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- Memoria: el repositorio pesa 92,5 GB (86,15 GiB) en disco; en memoria unificada se estima que necesita al menos 96 GB para cargar los pesos y el contexto, aunque no se especifica el consumo exacto.
- GPU: probado en Apple M3 Studio; compatible con cualquier Apple Silicon con suficiente memoria unificada (M3 Max/Ultra, M4 Max/Ultra, etc.). No apto para GPUs NVIDIA o AMD sin capa de traducción.
- Runtime: requiere oMLX con soporte explícito para `qwen4_exp` y módulo MTP nativo; también MLX-VLM 0.6.3 y MLX 0.32.0. Un runtime sin soporte MTP rechazará los 76 tensores MTP durante la carga estricta.
- Latencia: 26-29 tokens/s en M3 Studio con 512 tokens de generación; la primera petición incluye warm-up y se excluye de las mediciones.
- Despliegue: limitado a ecosistema MLX; no compatible con vLLM, llama.cpp u Ollama en su forma actual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (original) | 125B total / 6B activos | 262K (ext. 1M) | BF16 | safetensors | qwen-community-1.0 |
| Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP (este) | 28,9B en safetensors | 262K | oQ3 mixto 3-bit | MLX safetensors | qwen-community-1.0 |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | no disponible | no disponible | 4-bit | MLX safetensors | qwen-community-1.0 |

La comparativa con otros modelos de la misma categoría (MoE multimodal de ~125B) no está disponible en la información proporcionada. La versión oQ3 ofrece un tamaño menor que la variante 4-bit de Vontra a costa de una precisión potencialmente inferior, aunque con overrides en módulos sensibles.

## Limitaciones y advertencias

- Requiere un runtime específico con soporte `qwen4_exp` y MTP nativo; sin él, la carga estricta fallará por los 76 tensores MTP.
- La cuantización de 3 bits puede degradar la calidad de salida en tareas de precisión, a pesar de los overrides; no hay benchmarks que cuantifiquen esta pérdida.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés; la ficha del modelo base no se ha incluido en su totalidad.
- Licencia qwen-community-1.0: permite uso comercial con restricciones (consultar el texto completo de la licencia); no es una licencia open source estándar.
- El tamaño de 92,5 GB limita el despliegue a equipos con 96 GB o más de memoria unificada; no es viable en hardware consumer típico.
- Es una conversión comunitaria no oficial; el autor advierte que los resultados varían con la longitud del prompt, el estado de la caché, la versión del runtime y las condiciones térmicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Documentación de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Variante 4-bit de Vontra: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit
