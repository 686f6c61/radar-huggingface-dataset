# Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-2bit-MTP es una conversión al formato MLX (Apple Silicon) del modelo Qwen3.8-Flash-Next de Qwen, realizada por el usuario Vontra. El modelo original es un MoE multimodal ultra-disperso de 125B parámetros totales (6B activos por token) con una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Esta conversión aplica una cuantización afín de 2 bits (grupo de 32) a los expertos enrutados y compartidos, así como a las rutas de embeddings predictivos n-gram, mientras conserva en BF16 las capas de atención, Gated DeltaNet, hiperconexión, enrutamiento, visión, embeddings de token, cabeza de salida y el bloque MTP (Multi-Token Prediction) nativo.

El resultado es un checkpoint MLX de 80,07 GB (20 shards) que mantiene la arquitectura `qwen4_exp` completa, incluyendo el bloque de draft para decodificación especulativa. Está pensado para ejecutarse en hardware Apple Silicon mediante el runtime oMLX (validado con oMLX 0.6.3rc3, MLX 0.32.0 y MLX-VLM 0.6.3). La conversión no es uniforme Q2 ni oQ: es una cuantización selectiva que preserva las rutas sensibles en BF16, lo que la hace adecuada para despliegues en los que se prioriza la fidelidad de las capas críticas sobre la compresión uniforme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (vision-language sparse MoE con Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 125B (modelo base) / 29.268.195.219 (conversion MLX en safetensors) |
| Parametros activos | 6B (modelo base) |
| Longitud de contexto | 262.144 tokens (configurado), extensible a 1.000.000 (modelo base) |
| Tipos de cuantizacion | Afin 2-bit (grupo 32) en expertos y embeddings n-gram; BF16 en atencion, GDN, hiperconexion, enrutamiento, vision, token embedding, output head y MTP |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | qwen-community-1.0 (Qwen Community License) |
| Formato de pesos | MLX safetensors (20 shards, 80.070 GB / 74.571 GiB) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next combina cuatro innovaciones principales: atención híbrida GDN + QSA (tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, y la cuarta usa Qwen Sparse Attention para recuperación precisa de largo alcance), capas MoE dispersas con 512 expertos enrutados y 1 compartido (10 activos por token), flujos residuales ensanchados con gating, y embeddings predictivos n-gram (hashed bigram y trigram) con 51B parámetros y 20 millones de entradas. Además incluye un bloque nativo de next-token prediction (MTP) de 4B parámetros para decodificación especulativa.

Esta conversión MLX no es un entrenamiento nuevo, sino una transformación del checkpoint oficial BF16. Se cuantizaron 418 módulos (expertos y rutas de embeddings predictivos) a 2 bits con grupo 32, mientras se preservaron 762 matrices sensibles o estructurales en BF16, incluyendo el bloque MTP completo. El proceso se validó con pruebas deterministas de instrucción, hechos, aritmética, escritura concisa y generación coherente, y se verificaron los 2.543 tensores indexados y los 20 shards antes de la subida.

## Capacidades

- Generacion de texto y razonamiento: soporta tareas de instruccion, hechos, aritmetica y escritura coherente, segun las pruebas de validacion de la conversion.
- Multimodal (imagen-texto): el pipeline es `image-text-to-text`, por lo que acepta imagenes como entrada junto con texto.
- Razonamiento avanzado: el modelo base esta disenado para tareas de razonamiento complejo, con 6B parametros activos y 262K de contexto.
- Decodificacion especulativa nativa: incluye un bloque MTP (4B parametros) que puede acelerar la generacion, aunque en esta conversion la medicion mostro una ligera reduccion de rendimiento (-2,56%).
- Soporte de agentes y tool calling: no confirmado en la informacion proporcionada, pero el modelo base de Qwen suele incluir estas capacidades; no se puede afirmar con certeza para esta conversion.
- Multilingue: no se especifican idiomas soportados en la model card.

## Casos de uso

- Analisis de documentos largos: con 262K tokens de contexto, puede procesar libros completos, informes extensos o contratos legales en una sola pasada, extrayendo informacion relevante y respondiendo preguntas sobre el contenido.
- Asistente de vision para imagenes: al ser multimodal, puede describir imagenes, responder preguntas sobre su contenido o generar texto alternativo para accesibilidad, integrandose en aplicaciones de productividad.
- Generacion de codigo en entornos Apple Silicon: gracias a su capacidad de razonamiento y generacion de texto, puede asistir en programacion, revision de codigo o generacion de documentacion tecnica, ejecutandose localmente en Macs con suficiente memoria.
- Resumen de contenido multimedia: combinando vision y texto, puede resumir capturas de pantalla, diagramas o graficos, util para reuniones o material educativo.
- Chat conversacional con contexto largo: su ventana de 262K permite mantener conversaciones multi-turno con historial extenso, adecuado para asistentes virtuales o soporte tecnico.
- Investigacion academica: puede ayudar a revisar articulos cientificos, extraer datos de tablas o figuras, y redactar resumenes, aprovechando su capacidad de razonamiento y procesamiento de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta mediciones de rendimiento de generacion en Apple M3 Studio:

| Modo | Salida por ejecucion | Velocidad mediana |
|---|---|---|
| MTP desactivado | 512 tokens | 29,3729 tokens/s |
| MTP activado | 512 tokens | 28,6199 tokens/s |

La tasa de aceptacion del MTP fue del 52,94% (9 de 17 propuestas), y ambas ejecuciones produjeron el mismo hash de salida. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- Plataforma: Apple Silicon (validado en Apple M3 Studio).
- Memoria unificada: el repo pesa 80,07 GB, por lo que se recomienda al menos 128 GB de RAM unificada para cargar los pesos y dejar margen para el contexto y el cache. Con 64 GB podria ser insuficiente.
- GPU: no aplica GPU discreta; se usa la GPU integrada del chip Apple Silicon via MLX.
- Runtime: oMLX 0.6.3rc3 (build 2475), MLX 0.32.0, MLX-VLM 0.6.3. Se requiere soporte explicito para `qwen4_exp` y MTP nativo.
- Despliegue: se descarga con `hf download` y se anade al directorio de modelos de oMLX. No se mencionan opciones como vLLM o llama.cpp, ya que el formato es MLX.
- Rendimiento: 29,37 tokens/s (MTP desactivado) en M3 Studio, medido con 512 tokens de salida. La latencia varia con la longitud del prompt, el estado del cache y las condiciones termicas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos. Sin embargo, existen otras conversiones del mismo modelo base por el mismo autor:

| Modelo | Cuantizacion | Tamano repo | MTP nativo |
|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP | 2-bit afin (grupo 32) | 80,07 GB | Si |
| Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP | 6-bit | No disponible | Si |
| Vontra/Qwen3.8-Flash-Next-MLX-8bit-MTP | 8-bit | No disponible | Si |

El modelo base Qwen/Qwen3.8-Flash-Next (BF16) tiene un tamano mucho mayor (varios cientos de GB) y requiere hardware con mucha mas memoria. La conversion 2-bit es la mas compacta de las tres, pero puede sacrificar precision en tareas que dependen de los expertos cuantizados.

## Limitaciones y advertencias

- Degradacion por cuantizacion: la cuantizacion 2-bit de los expertos y embeddings n-gram puede reducir la calidad en tareas de alta precision (matematicas, codigo complejo, razonamiento logico) en comparacion con el modelo BF16 original.
- MTP no mejora el rendimiento: en las pruebas del autor, el MTP nativo redujo ligeramente el throughput (-2,56%) y se recomienda mantenerlo desactivado por defecto.
- Licencia restrictiva: la licencia qwen-community-1.0 limita el uso comercial sin autorizacion explicita de Alibaba Cloud; requiere revision legal antes de desplegar en produccion.
- Sesgos y alucinaciones: como modelo de lenguaje, puede generar contenido falso o sesgado; no se han publicado evaluaciones de seguridad especificas para esta conversion.
- Requisitos de memoria: el peso de 80 GB exige hardware Apple Silicon de gama alta; no es adecuado para equipos con menos de 128 GB de RAM unificada.
- Soporte de runtime limitado: requiere oMLX con soporte explicito para `qwen4_exp` y MTP; no es compatible con runtimes estandar como vLLM o llama.cpp sin adaptacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentacion de unsloth para ejecucion local: https://unsloth.ai/docs/models/qwen3.8-next
- Version 6-bit del mismo autor: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP
- Version 8-bit del mismo autor: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-8bit-MTP
