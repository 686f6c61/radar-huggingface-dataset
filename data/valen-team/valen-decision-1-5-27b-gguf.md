# Valen-Team/Valen-Decision-1.5-27B-GGUF

## Resumen

Valen-Decision-1.5-27B es un modelo de decisión estructurada desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.8-27B. No es un modelo conversacional de propósito general: su función es recibir un estado (mensajes de texto, imágenes o vídeo) y devolver, en una sola pasada hacia delante, probabilidades para preguntas de tipo `predicate`, `choice` y `score`, además de cajas delimitadoras (`bbox`) para preguntas de localización visual. Está pensado para tareas de clasificación, enrutamiento y verificación con salida tipada.

El modelo se publica en cinco tamaños (0.8B, 2B, 4B, 9B y 27B) y en tres formatos: pesos nativos para Transformers, ONNX y GGUF para el runtime propio de llama.cpp de Valen (versión 0.2.0). Esta ficha cubre la variante GGUF de 27B, que incluye un fichero de texto en Q8_0 (25,43 GiB) y un fichero de visión F32 separado (1,72 GiB) necesario para peticiones de imagen y bbox.

La relevancia actual del modelo radica en su enfoque: en lugar de generar texto libre que luego hay que parsear, expone directamente distribuciones de probabilidad sobre candidatos definidos por el usuario, lo que simplifica la integración en pipelines de producción que necesitan decisiones auditables y deterministas. La licencia es Apache 2.0 y el modelo base es Qwen3.8-27B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional por bloques (block-bidirectional attention) y cabeza de grounding bbox; derivado de Qwen3.8-27B |
| Parámetros totales | 25.638.540.077 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `-c 4096`) |
| Tipos de cuantización | Q8_0 (texto); visión en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime Valen llama.cpp 0.2.0); también existen pesos nativos y ONNX en otros repos |
| Tamaño del repo | 81,4 GB |
| Ficheros GGUF | `Valen-Decision-1.5-27B-Q8_0.gguf` (25,43 GiB), `vision-native-limits-F32.gguf` (1,72 GiB) |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y se afina para producir salidas estructuradas. La model card menciona dos innovaciones técnicas concretas: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding bbox. Con una sola pasada hacia delante, el modelo devuelve probabilidades para preguntas de predicado, elección y puntuación, y una caja delimitadora por cada pregunta bbox. La inferencia se expone mediante dos endpoints del runtime: `/v1/systemone` y `/v1/decisions`, que aceptan el esquema nativo de decisiones y devuelven las mismas cifras.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación. La model card indica explícitamente que los datos de entrenamiento de Valen-Decision-1.5 no son públicos. Sí se publica el código de entrenamiento en el repositorio de GitHub del proyecto, lo que permite afinar el modelo sobre datos propios.

## Capacidades

- Clasificación con salida tipada: devuelve probabilidades sobre candidatos definidos por el usuario para preguntas de tipo `choice`, `score`, `predicate` y `noul`.
- Entrada multimodal: procesa texto e imágenes (pipeline image-text-to-text).
- Grounding visual: genera cajas delimitadoras (`bbox`) con confianza asociada para preguntas de localización.
- Salida estructurada en una sola pasada: toda la petición se evalúa de una vez, sin generación autoregresiva de texto libre.
- Soporte de estado compartido (`shared-state`) entre preguntas dentro de una misma petición.
- Integración vía API compatible con endpoints (`/v1/systemone`, `/v1/decisions`).
- Capacidad de análisis de vídeo (la model card menciona identificación de acciones en vídeos como caso de uso).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Clasificación de sentimiento y enrutamiento de tickets: el modelo recibe el mensaje del cliente como estado y devuelve la distribución de probabilidad sobre categorías predefinidas, lo que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad es baja.
- Verificación de imágenes de producto contra requisitos: con el fichero de visión, el modelo evalúa si una imagen cumple criterios definidos (presencia de elementos, encuadre) y devuelve probabilidades por criterio, útil en catálogos de e-commerce.
- Localización de objetos mediante bbox: para preguntas de grounding, devuelve cajas delimitadoras con confianza, aplicable a inspección visual y anotación semiautomática.
- Etiquetado de acciones en vídeo: la model card cita la identificación de acciones en vídeos como flujo de trabajo soportado, con la misma mecánica de preguntas tipadas.
- Moderación de contenido con criterios explícitos: al definir los candidatos como categorías de política, la salida probabilística permite fijar umbrales y registrar la decisión con su incertidumbre.
- Clasificación por lotes en pipelines de datos: el runtime admite paralelismo (`--parallel`) y evaluación en una sola pasada, lo que encaja en procesos de etiquetado masivo sin generación de texto.
- Fine-tuning sobre dominios propios: al publicarse el código de entrenamiento, es posible adaptar el modelo a taxonomías internas partiendo de los pesos nativos.

## Benchmarks y rendimiento

La model card menciona un "Decision Index" como métrica de evaluación en la que los tamaños mayores obtienen mejores puntuaciones, pero no se proporcionan los valores numéricos en la información disponible, por lo que no se presenta tabla comparativa de benchmarks.

Sí se documenta una comparación de fidelidad entre el runtime GGUF 0.2.0 y la inferencia nativa en FP32 con `model.predict`, sobre seis peticiones (texto, imagen y cuatro peticiones bbox) en CPU Linux x86-64:

| Fichero | Diferencia máx. probabilidad | Diferencia máx. caja | Diferencia máx. confianza bbox |
|---|---:|---:|---:|
| Q8_0 | 0,00252 | 0,0553 | 0,0113 |

El umbral de aceptación de la release es una diferencia de probabilidad de hasta 0,08. Los recuentos de tokens fueron idénticos en todas las peticiones.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero de texto Q8_0 ocupa 25,43 GiB; el fichero de visión F32 añade 1,72 GiB. En total, en torno a 27 GiB solo para pesos, más overhead de contexto y buffers.
- GPU: no se documentan requisitos de GPU para el runtime GGUF; el ejemplo oficial de servicio usa CPU con `-ngl 0` y `--device none`.
- CPU: el runtime Linux x86-64 requiere Ubuntu 22.04 o superior, glibc 2.35 o superior y soporte AVX2/FMA/F16C/BMI2.
- GPU de consumo: no disponible; con 25,43 GiB en Q8_0 no cabe en GPUs de consumo de 24 GB o menos sin cuantización adicional, y no se listan otras cuantizaciones en este repositorio.
- Despliegue: runtime propio Valen llama.cpp 0.2.0 (`./serve`), con endpoints `/v1/systemone` y `/v1/decisions`. No se documenta compatibilidad con vLLM, Ollama o TGI en la información disponible.
- Parámetros de servicio del ejemplo oficial: `-c 4096 -b 4096 -ub 4096 -t 4 --parallel 1 --no-warmup`; para peticiones mayores hay que subir `-c`, `-b` y `-ub` conjuntamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos directamente comparables en la información proporcionada. Como referencia estructural se incluyen los otros tamaños de la misma familia:

| Modelo | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Valen-Decision-1.5-27B-GGUF | 25.638.540.077 | GGUF | Apache 2.0 | Hugging Face |
| Valen-Decision-1.5-9B | no disponible | nativo, ONNX, GGUF | Apache 2.0 | Hugging Face |
| Valen-Decision-1.5-4B | no disponible | nativo, ONNX, GGUF | Apache 2.0 | Hugging Face; también en API gratuita y Space |
| Valen-Decision-1.5-2B | no disponible | nativo, ONNX, GGUF | Apache 2.0 | Hugging Face; también en API gratuita y Space |
| Valen-Decision-1.5-0.8B | no disponible | nativo, ONNX, GGUF | Apache 2.0 | Hugging Face; también en API gratuita y Space |

Comparativa con modelos de propósito general de tamaño similar: no disponible.

## Limitaciones y advertencias

- Modelo especializado en decisiones estructuradas: no está pensado como chat generativo abierto; su salida son probabilidades sobre candidatos y cajas, no texto libre.
- Datos de entrenamiento no públicos: no es posible auditar la composición del dataset ni evaluar sesgos de origen con la información disponible.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo que herede del modelo base.
- Riesgo de calibración: las probabilidades deben validarse contra datos propios antes de fijar umbrales en producción; la model card recomienda políticas de incertidumbre en sus tutoriales.
- Dependencia de runtime propio: el GGUF requiere el runtime Valen llama.cpp 0.2.0, no el llama.cpp estándar, lo que limita las opciones de despliegue y añade un paso de verificación de integridad (SHA256SUMS, MANIFEST.json).
- Fichero de visión separado: las peticiones de imagen y bbox necesitan descargar además `vision-native-limits-F32.gguf`; el servicio solo texto funciona únicamente con el fichero Q8_0.
- Contexto de ejemplo limitado a 4096 tokens: no se documenta la longitud máxima real; peticiones grandes requieren ajustar los parámetros del servidor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y las notas de licencia de los tutoriales del proyecto.
- Sin datos de benchmarks públicos: la evaluación se limita al "Decision Index" mencionado sin cifras, lo que dificulta comparaciones objetivas con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B-GGUF
- Pesos nativos 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- ONNX 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B-ONNX
- Tamaño 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Tamaño 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Tamaño 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Tamaño 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- API gratuita y demo web: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Código de entrenamiento: https://github.com/Valen-Team/Valen
- Release del runtime GGUF 0.2.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.2.0
- Guía GGUF: https://valen-team.github.io/docs/valen/gguf/
- Cookbook: https://valen-team.github.io/cookbook/
- Cookbook, API básica: https://valen-team.github.io/cookbook/api-quickstart/
- Cookbook, inferencia local: https://valen-team.github.io/cookbook/local-inference/
- Cookbook, enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Cookbook, cribado de imágenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Cookbook, etiquetado de vídeo: https://valen-team.github.io/cookbook/video-tagging/
