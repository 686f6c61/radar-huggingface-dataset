# whyperai/whyper-6.1

## Resumen

Whyper 6.1 es un modelo de generación de texto publicado por whyperai en formato GGUF, distribuido como un único archivo cuantizado en IQ4_XS de 19,18 GB. Según los metadatos del propio archivo, la arquitectura declarada es `qwen35moe`, con 41 capas y 256 expertos de los cuales 8 se activan por token, lo que lo sitúa en la familia de modelos de mezcla de expertos (MoE) derivados de Qwen3.5-35B-A3B. El modelo se presenta como un ajuste ("Lora V6Fix Merged") fusionado en los pesos, orientado a chat local y flujos de trabajo de programación.

El dato de parámetros totales reportado en safetensors es de 35.505.251.456 (aproximadamente 35,5 mil millones), coherente con la nomenclatura "35B-A3B" del modelo upstream al que el autor enlaza su licencia. La longitud de contexto declarada en los metadatos del GGUF es de 262.144 tokens, aunque el autor advierte explícitamente que el contexto utilizable en la práctica depende del runtime, de la caché KV y de la colocación de capas entre CPU y GPU.

Su relevancia actual reside en que empaqueta un MoE de ~35B en un GGUF de menos de 20 GB, lo que permite inferencia local en hardware de consumo alto (el autor cita una prueba de humo superada en una RTX 5090 con 4.096 tokens de contexto configurado). La licencia Apache 2.0 facilita su uso comercial, aunque la procedencia de los datos de entrenamiento y los resultados de benchmarks no están especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (mezcla de expertos, familia Qwen), 41 capas, 256 expertos con 8 activos por token |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | no disponible (la nomenclatura upstream "35B-A3B" sugiere ~3 mil millones activos, no confirmado en la información) |
| Longitud de contexto | 262.144 tokens según metadatos del GGUF; contexto utilizable dependiente del runtime y la memoria |
| Tipos de cuantizacion | IQ4_XS (único archivo publicado); etiqueta `imatrix` en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (archivo `Whyper-v6.1-IQ4_XS.gguf`, 19.179.521.088 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos identificado en el GGUF como `qwen35moe`, con 41 capas y 256 expertos por capa de los cuales 8 se seleccionan por token. El modelo se distribuye como un LoRA fusionado en los pesos base, etiquetado internamente como "Lora V6Fix Merged", sobre el modelo upstream Qwen3.5-35B-A3B al que el autor enlaza para la licencia. No se especifican en la información disponible los detalles del mecanismo de atención, la presencia de atención lineal u otras innovaciones arquitectónicas más allá de lo que implica la familia Qwen.

En cuanto al entrenamiento, la model card indica explícitamente que los conjuntos de datos, las recetas de entrenamiento y los resultados de benchmarks "no están especificados para esta versión". No hay información sobre número de tokens, composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La única información de verificación disponible es el hash SHA-256 del archivo (`05fb34ed8d4b3115257ff2b4ca3c4b1a2f367c94ab4872e1fb29d715bb9b1c39`) y la etiqueta `imatrix`, que sugiere el uso de una matriz de importancia para la cuantización IQ4_XS.

## Capacidades

- Generación de texto conversacional, orientada según el autor a chat local y flujos de trabajo de programación.
- Razonamiento y generación de código: el autor describe el modelo como adecuado para "chat and coding workflows", sin más detalle.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con APIs compatibles con OpenAI.
- Inferencia local mediante llama.cpp y la aplicación Whyper, con aceleración por GPU y desbordamiento de capas a memoria del sistema.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de chat local en estación de trabajo: el modelo puede ejecutarse con llama.cpp o con la aplicación Whyper en una máquina con GPU de gama alta, manteniendo las conversaciones en local sin enviar datos a servicios externos.
- Autocompletado y generación de código en el editor: al estar orientado a flujos de programación y ser compatible con endpoints, puede conectarse a extensiones de IDE que consuman una API local compatible con OpenAI.
- Prototipado de aplicaciones con contexto largo: los 262.144 tokens declarados en los metadatos permiten, en hardware con memoria suficiente, procesar documentos extensos o historiales de conversación largos, aunque el autor recomienda empezar con 4.096 tokens e incrementar según la memoria disponible.
- Despliegue en entornos con requisitos de soberanía del dato: al ser un GGUF Apache 2.0 ejecutable en local, encaja en escenarios donde no se permite enviar información a la nube.
- Experimentación e investigación sobre MoE cuantizados: sirve para estudiar el comportamiento de un MoE de ~35B con 8 expertos activos en cuantización IQ4_XS y medir el equilibrio entre calidad y memoria.
- Integración en pipelines internos de generación de texto: mediante `llama-server` expuesto en `127.0.0.1`, puede actuar como backend de generación para herramientas internas que hablen el protocolo de endpoints compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de benchmarks no están especificados para esta versión.

## Requisitos de hardware

- VRAM estimada: el archivo IQ4_XS ocupa 19,18 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM más RAM del sistema) para cargar los pesos; la caché KV para contexto largo añade consumo adicional no cuantificado en la información.
- GPU recomendadas: el autor cita una prueba de humo superada en una NVIDIA RTX 5090 con 4.096 tokens de contexto configurado. No se especifican otras GPU probadas.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más de VRAM (por ejemplo, RTX 4090 o RTX 5090), con posible desbordamiento de capas a memoria del sistema si no cabe todo en VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`), la aplicación Whyper (escaneo de carpeta de modelos y arranque desde la interfaz) y cualquier runtime compatible con GGUF v3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whyper 6.1 | ~35,5 B totales (MoE, 8 de 256 expertos activos) | 262.144 tokens (metadatos) | GGUF IQ4_XS | Apache 2.0 | Hugging Face (whyperai/whyper-6.1) |
| Qwen3.5-35B-A3B (upstream) | ~35 B (MoE, A3B) | no disponible en la información | no disponible | licencia upstream enlazada por el autor | Hugging Face (Qwen/Qwen3.5-35B-A3B) |
| Alternativas de ~30-35B en GGUF | no disponible | no disponible | GGUF | variable | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo upstream Qwen3.5-35B-A3B, del que Whyper 6.1 deriva mediante un LoRA fusionado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta evaluación de sesgos.
- Riesgo de alucinación: no cuantificado; no hay benchmarks ni evaluaciones publicadas que permitan estimarlo.
- Limitaciones de contexto: aunque los metadatos declaran 262.144 tokens, el autor advierte que el contexto utilizable depende del runtime, la caché KV y la colocación CPU/GPU; recomienda arrancar con 4.096 tokens.
- Idiomas: no se especifica qué idiomas soporta el modelo.
- Restricciones de licencia: se declara Apache 2.0, pero el autor remite a la licencia del modelo upstream Qwen3.5-35B-A3B, por lo que conviene verificar la compatibilidad de ambas antes de un uso comercial.
- Procedencia opaca: los datos de entrenamiento, la receta y los benchmarks no están especificados, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y solo se publica una cuantización (IQ4_XS); no hay evidencia de validación por parte de la comunidad.
- Integridad del archivo: se proporciona el SHA-256 para verificación; conviene comprobarlo tras la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whyperai/whyper-6.1
- Modelo upstream Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Repositorio de la aplicación Whyper: https://github.com/zerphex/Whyper
- Documentación del servidor de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/b12600/tools/server/README.md
