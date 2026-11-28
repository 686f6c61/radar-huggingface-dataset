# yadavkapil7155/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es una conversión a formato GGUF del modelo Qwen3.5-4B, desarrollado originalmente por el equipo Qwen (Alibaba). Esta ficha corresponde a la cuantización publicada por el usuario yadavkapil7155 en Hugging Face, que convierte los pesos BF16 originales a dos variantes GGUF mediante las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). El objetivo es permitir la ejecución del modelo en entornos con recursos limitados, como GPU de consumo o CPU, sin necesidad de infraestructura de alto rendimiento.

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de atención lineal (lineal-attention/SSM) con capas de atención tradicional, según se desprende de las notas del autor sobre la necesidad de usar una compilación reciente de llama.cpp. Cuenta con 4.000 millones de parámetros en formato denso (no MoE) y está orientado a generación de texto en inglés. La licencia Apache 2.0 facilita su uso comercial y su integración en productos derivados.

La relevancia de esta publicación radica en que ofrece una vía práctica para desplegar un modelo de 4B parámetros en hardware modesto, con una cuantización Q4_K_M de aproximadamente 2,81 GB que cabe en GPU de consumo con 4-6 GB de VRAM. No obstante, al tratarse de una conversión no oficial y con cero descargas en el momento de la ficha, conviene evaluar su calidad frente a conversiones oficiales o de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas de atención lineal (SSM) + capas de atención tradicional (transformer) |
| Parametros totales | 4.000 millones (4B, denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (~2,81 GB) y Q8_0 (~4,61 GB); el BF16 de origen era ~8,66 GB |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base en BF16/safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B presenta una arquitectura híbrida que intercala capas de atención lineal (asociadas a mecanismos de espacio de estados, SSM) con capas de atención estándar. Esta combinación busca reducir el coste computacional y de memoria del mecanismo de atención en contextos largos, manteniendo la capacidad expresiva de un transformer convencional. El autor de la conversión advierte explícitamente que, por esta razón, se requiere una compilación reciente de llama.cpp que soporte dicha arquitectura; compilaciones antiguas podrían no cargar el modelo correctamente.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá de la arquitectura híbrida. La conversión GGUF incluye los tensores extra `nextn` (predicción multi-token), aunque el autor indica que la inferencia estándar no los requiere. Se trata de una conversión solo de texto: no se incluye proyector de visión (`mmproj`), por lo que las capacidades multimodales del modelo base, si las hubiera, no están disponibles en esta versión.

## Capacidades

- Generación de texto en inglés, con soporte para tareas de razonamiento y respuesta a instrucciones propias de un modelo de 4B parámetros.
- Ejecución en llama.cpp mediante CLI (`llama-cli`) y descarga directa desde el Hub con el flag `-hf`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructuras de despliegue tipo Hugging Face Inference Endpoints.
- Capacidad de predicción multi-token (`nextn`), incluida en los tensores aunque no requerida para inferencia estándar.
- Soporte de cuantización Q4_K_M y Q8_0 para ajustar el equilibrio tamaño/calidad.
- No se dispone de información sobre tool calling, function calling, agentes, modo thinking, visión o audio en la documentación proporcionada.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Despliegue en GPU de consumo: la variante Q4_K_M (~2,81 GB) permite ejecutar el modelo en tarjetas con 4-6 GB de VRAM, como una RTX 3050 o RTX 4060, usando `-ngl 99` para descargar todas las capas en GPU. Es adecuado para prototipos locales y pruebas de concepto.
- Inferencia en CPU: al ser GGUF, el modelo puede ejecutarse íntegramente en CPU con llama.cpp, lo que facilita su uso en portátiles sin GPU dedicada o en servidores sin aceleradores. La cuantización Q4_K_M reduce el uso de memoria a menos de 3 GB.
- Asistentes de texto locales y privados: para aplicaciones donde los datos no deben salir del dispositivo, el modelo puede gestionar generación de texto y respuestas conversacionales en inglés sin conexión a servicios en la nube.
- Generación de contenido y redacción asistida: tareas de resumen, reescritura o generación de borradores en inglés, aprovechando la licencia Apache 2.0 para integrarlo en productos comerciales.
- Evaluación y benchmarking de arquitecturas híbridas: investigadores pueden usar esta conversión para estudiar el comportamiento de capas SSM + atención en llama.cpp y comparar el rendimiento frente a transformers puros de tamaño similar.
- Integración en pipelines de CI/CD para pruebas de modelos: al ser un artefacto GGUF ligero, puede incorporarse en flujos automatizados que validen la carga y la generación de texto con compilaciones recientes de llama.cpp.
- Educación y experimentación: útil en entornos docentes para ilustrar el proceso de conversión de pesos BF16 a GGUF y el impacto de la cuantización en tamaño y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 2,81 GB de pesos, por lo que con overhead de contexto y KV cache se recomienda al menos 4 GB de VRAM para uso cómodo. Q8_0 requiere ~4,61 GB de pesos, recomendándose 6-8 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) para Q8_0 con margen amplio; para Q4_K_M bastan GPU de 4-6 GB como RTX 3050 o GTX 1650.
- Cabe en GPU de consumo: sí, en ambas cuantizaciones, siendo Q4_K_M la opción para hardware más modesto.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extensión herramientas compatibles con GGUF como Ollama o llama-cpp-python; la etiqueta `endpoints_compatible` sugiere también despliegue en Hugging Face Inference Endpoints. No se menciona soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no proporciona mediciones de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF (esta ficha) | 4B | No disponible | Apache 2.0 | GGUF | Hugging Face (0 descargas) |
| Modelo base Qwen/Qwen3.5-4B | 4B | No disponible | Apache 2.0 | BF16/safetensors | Hugging Face (oficial) |
| Otros modelos GGUF de ~4B | No disponible | No disponible | No disponible | GGUF | No disponible |

La comparativa con alternativas concretas no está disponible en la información proporcionada. La comparación más directa es con el modelo base oficial, del que esta publicación es una conversión no oficial; se recomienda contrastar la calidad de la cuantización con conversiones de referencia del mismo modelo base.

## Limitaciones y advertencias

- Conversión no oficial: publicada por un usuario independiente, sin verificación por parte del equipo Qwen; no hay garantía de que la cuantización preserve fielmente el comportamiento del modelo base.
- Cero descargas y cero likes en el momento de la ficha: no existe evidencia comunitaria de validación ni informes de calidad.
- Arquitectura híbrida: requiere una compilación reciente de llama.cpp; versiones antiguas pueden fallar al cargar el modelo o producir resultados incorrectos.
- Solo texto: no incluye proyector de visión (`mmproj`), por lo que cualquier capacidad multimodal del modelo base queda fuera de esta conversión.
- Idioma limitado al inglés según la etiqueta declarada; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 4B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la información disponible; se recomienda evaluar sesgos antes de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base y citar adecuadamente al equipo Qwen.
- Sin datos de benchmarks ni de rendimiento: no es posible comparar cuantitativamente con alternativas.
- Fecha de creación futura (2026-11-28) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/yadavkapil7155/Qwen3.5-4B-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp (herramientas de conversión y cuantización): no se proporciona enlace en la información disponible
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
