# Vontra/Qwen3.8-Flash-Next-MLX-oQ6-MTP

## Resumen

Este repositorio contiene una conversión MLX en precisión mixta oQ6 del modelo Qwen3.8-Flash-Next, desarrollada por Vontra a partir de los pesos oficiales BF16 de Qwen. Qwen3.8-Flash-Next es un modelo multimodal (visión-lenguaje) de arquitectura `qwen4_exp`, con 125.000 millones de parámetros totales (6.000 millones activos por token) y una ventana de contexto nativa de 262.144 tokens. La conversión preserva el bloque MTP (Multi-Token Prediction) nativo del modelo, lo que permite decodificación especulativa en hardware Apple Silicon.

La relevancia de esta conversión radica en que ofrece una versión cuantizada de un modelo MoE ultradisperso de gran tamaño, optimizada para ejecutarse en Mac con chips M-series mediante el runtime oMLX o MLX-VLM. Al mantener el MTP nativo, se consiguen velocidades de generación superiores a las de una conversión sin él, como se muestra en las pruebas del autor. Es una conversión comunitaria, no oficial, y requiere un runtime con soporte explícito para la arquitectura `qwen4_exp` y su módulo MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (vision-language sparse MoE con Gated DeltaNet, Qwen Sparse Attention, n-gram embeddings y MTP) |
| Parametros totales | 45.364.038.499 (según safetensors); el modelo base declara 125B totales / 6B activos |
| Parametros activos | 6.000 millones (del modelo base) |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | oQ6 mixed-precision: base 6-bit affine, módulos protegidos a 6/8-bit, grupo 32 |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | MLX safetensors (31 shards, 158.07 GB) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next combina varias innovaciones: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta usa Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. La capa MoE tiene 512 expertos enrutados (10 activos más 1 compartido) y se añaden embeddings de n-gramas (bigramas y trigramas) con 51.000 millones de parámetros adicionales. El modelo incluye un bloque MTP nativo (una capa draft de Qwen4Exp) para decodificación especulativa.

La conversión de Vontra aplica cuantización oQ6 con asignación guiada por sensibilidad: se midió la sensibilidad de cada capa con un proxy local de 4 bits y se asignaron 232 módulos protegidos o sobrescritos a 6/8 bits. El grupo de cuantización es 32, compatible con las tablas de embeddings de n-gramas de ancho 160. Todos los tensores, incluido el MTP, se reconstruyeron desde el checkpoint BF16 oficial. No se proporcionan detalles sobre el entrenamiento del modelo base (datos, tokens, método de alineación) en la información disponible.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada (pipeline `image-text-to-text`).
- Generación de texto con razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-Flash-Next (no verificado en esta conversión).
- Decodificación especulativa nativa mediante el bloque MTP incluido, con tasas de aceptación del draft de 70.8–84.2% en las pruebas del autor.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Soporte para ejecución en Apple Silicon mediante oMLX o MLX-VLM, con pesos en formato MLX safetensors.
- No se documenta soporte explícito de tool calling, agentes o funciones específicas en la model card de esta conversión.

## Casos de uso

- Análisis de imágenes médicas: el modelo puede recibir radiografías o escáneres junto con preguntas clínicas, generando descripciones detalladas o resúmenes preliminares. Su ventana de 262K tokens permite incluir múltiples estudios en una sola consulta.
- Asistentes virtuales multimodales en Mac: al ser una conversión MLX, se integra en aplicaciones de escritorio que requieran comprensión de imágenes y texto, como gestión de correos con adjuntos o resúmenes de documentos escaneados.
- Procesamiento de documentos escaneados: combina OCR (a través de la entrada visual) con generación de texto estructurado, útil para digitalizar facturas, contratos o formularios.
- Generación de descripciones de productos para e-commerce: a partir de una foto del artículo, el modelo produce textos descriptivos y atributos, aprovechando su capacidad de razonamiento visual.
- Chatbots de atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones extensas sin perder información previa, ideal para soporte técnico o consultas complejas.
- Investigación en visión-lenguaje: sirve como base para experimentos de fine-tuning o evaluación en tareas de VQA (Visual Question Answering) y captioning, gracias a su arquitectura MoE eficiente y su licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente mediciones de velocidad de inferencia en un Apple M3 Studio con MTP nativo activado:

| Test | Output tokens | Velocidad |
|---|---|---|
| Raw completion (warmed) | 32 | 29.6 tokens/s |
| Exact-instruction chat | 27 | 28.3 tokens/s |
| Casual chat | 68 | 36.6 tokens/s |

Como referencia, el backbone sin MTP alcanzó 23.1 tokens/s en una prueba corta, 21.1 tokens/s en una respuesta de 142 tokens y 19.5 tokens/s en una respuesta de 512 tokens. Estas cifras no son comparables con benchmarks de calidad y dependen de la longitud del prompt, el estado de caché, la configuración de muestreo y la versión del runtime.

## Requisitos de hardware

- VRAM estimada: el peso total es de 158.07 GB, por lo que se requiere una Mac con al menos 192 GB de memoria unificada para cargar el modelo completo. Con cuantizaciones más agresivas (p. ej., 4-bit) el requisito baja, pero este repo es oQ6.
- GPU recomendada: Apple Silicon (M-series), validado en un Apple M3 Studio. No es compatible con GPUs NVIDIA o AMD sin un runtime MLX adaptado.
- Opciones de despliegue: oMLX (con soporte MTP nativo) o MLX-VLM. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: en M3 Studio, entre 28 y 37 tokens/s con MTP activo, según el tipo de tarea. La velocidad varía con la memoria disponible y la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B total / 6B activo | 262K | BF16 | Qwen Community 1.0 | HuggingFace |
| Vontra/Qwen3.8-Flash-Next-MLX-oQ6-MTP (este) | 45.36B (safetensors) | 262K | oQ6 (6-bit mixto) | Qwen Community 1.0 | HuggingFace |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | no disponible | 262K | 4-bit | Qwen Community 1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas versiones. La versión 4-bit del mismo autor reduce el tamaño pero probablemente sacrifica calidad; la oQ6 mantiene mayor fidelidad con un coste de memoria superior. No se han encontrado otros modelos MoE multimodales de tamaño similar con conversión MLX en la información proporcionada.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: no está respaldada por Qwen y puede contener errores no detectados en la validación.
- Requiere un runtime con soporte explícito para `qwen4_exp` y su módulo MTP nativo; los runtimes estándar pueden rechazar los 76 tensores MTP durante la carga estricta de pesos.
- No se debe acoplar un drafter de Qwen3.8 27B a este modelo, ya que las dimensiones ocultas difieren y el modelo ya incluye su propio bloque MTP.
- Licencia Qwen Community 1.0: permite uso comercial con condiciones; es necesario revisar el texto completo de la licencia antes de desplegar en producción.
- Riesgo de alucinaciones y sesgos inherentes al modelo base, no mitigados en esta conversión.
- Tamaño grande (158 GB) que limita su uso a equipos con memoria unificada muy alta, excluyendo la mayoría de las Mac de consumo.
- No se especifican idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación en esta model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ6-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- MLX-VLM (runtime): https://github.com/ml-explore/mlx-vlm
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
