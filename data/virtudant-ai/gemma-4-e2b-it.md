# Virtudant-AI/gemma-4-E2B-it

## Resumen

Gemma 4 E2B-it es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, diseñado para ejecución en dispositivos de borde (móviles, portátiles y workstations modestas). Acepta entradas de texto, imagen y audio, y genera texto. La variante E2B pertenece a la gama "effective" de Gemma 4: emplea Per-Layer Embeddings (PLE) para maximizar la eficiencia paramétrica, con 2.300 millones de parámetros efectivos y 5.100 millones contando las tablas de embeddings. El repositorio aquí descrito es una réplica alojada por el usuario Virtudant-AI, derivada del modelo oficial `google/gemma-4-E2B-it` mediante herramientas de Unsloth.

El modelo resuelve el problema de desplegar IA multimodal de calidad en hardware limitado: mantiene una ventana de contexto de 128.000 tokens, soporte para más de 140 idiomas y modos de razonamiento configurables (thinking modes), además de function calling nativo y soporte del rol `system`. Frente a la generación anterior, Gemma 4 incorpora atención híbrida (sliding window local intercalada con atención global), vídeo y audio nativo en los modelos pequeños, y mejoras notables en código y flujos agénticos.

Este repositorio concreto tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 10,3 GB, coherente con pesos en safetensors de precisión completa. Es relevante como punto de entrada para fine-tuning y cuantización con Unsloth, y como espejo del modelo base oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) |
| Parametros totales | 5.123.178.051 (5,1B con embeddings; 2,3B efectivos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (el autor referencia GGUFs dinámicos de Unsloth en su colección, pero no se detallan los tipos) |
| Idiomas soportados | Más de 140 idiomas (según la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Gemma 4 E2B es un transformer denso de 35 capas con un mecanismo de atención híbrido que intercala atención local de ventana deslizante de 512 tokens con capas de atención global, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262.000 tokens. La innovación clave de la gama E es el uso de Per-Layer Embeddings (PLE): cada capa decodificadora dispone de su propia tabla de embeddings por token, de gran tamaño pero consultada de forma rápida, lo que reduce el cómputo efectivo a 2,3B parámetros aunque el recuento total con embeddings ascienda a 5,1B. El modelo incluye además un codificador de visión de aproximadamente 150M de parámetros y un codificador de audio de aproximadamente 300M.

La model card del modelo base indica que Gemma 4 se distribuye en variantes preentrenada e instruida (esta es la instruida, "-it"), con modos de razonamiento configurables y soporte nativo del rol `system`. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El repositorio concreto ha sido procesado con herramientas de Unsloth (etiqueta `unsloth`), lo que sugiere compatibilidad con su pipeline de fine-tuning y cuantización, aunque no se documenta un fine-tuning específico sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking modes) configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de vídeo (según la model card del modelo base).
- Comprensión de audio nativa, exclusiva de las variantes E2B y E4B dentro de la familia.
- Generación de código y matemáticas, con mejoras declaradas en benchmarks de coding.
- Function calling / tool calling nativo.
- Flujos agénticos y razonamiento multi-paso.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Contexto largo de 128.000 tokens para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Asistente en dispositivo móvil: el modelo cabe en un teléfono de gama alta gracias a sus 2,3B parámetros efectivos y PLE, permitiendo asistentes con comprensión de imagen y audio sin conexión a la nube.
- Transcripción y análisis de reuniones: el codificador de audio de ~300M permite procesar audio directamente y resumir con el contexto de 128K tokens, útil en herramientas de productividad locales.
- Atención al cliente multimodal: gestión de conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) y contexto largo para historiales extensos.
- Generación de código en producción: el soporte de function calling y el rol `system` permiten integrarlo en pipelines de CI/CD y agentes de refactorización con instrucciones estructuradas.
- Análisis documental con OCR ligero: extracción de información de facturas, formularios o tickets combinando visión y contexto largo, desplegable en portátiles.
- Asistentes de accesibilidad: descripción de imágenes y audio en tiempo real en dispositivos de borde, con latencia baja y sin dependencia de servicios externos.
- Fine-tuning especializado: el repositorio está preparado para Unsloth, lo que facilita adaptar el modelo a dominios concretos (legal, médico, atención al cliente) con requisitos de VRAM reducidos.
- Agentes autónomos en entornos con recursos limitados: razonamiento multi-paso y tool calling en workstations con una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 10,3 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para contexto moderado, y más para contextos cercanos a 128K.
- VRAM estimada en cuantización de 8 bits: en torno a 6-7 GB; en 4 bits: en torno a 3-4 GB (estimaciones a partir del tamaño de pesos, no confirmadas en la información disponible).
- GPU recomendadas: NVIDIA RTX 4090, RTX 4080, A100 o H100 para servicio de alta concurrencia; RTX 3060/4060 Ti de 12-16 GB para uso local en fp16 con contexto moderado.
- Cabe en GPU consumer: sí, especialmente en cuantizaciones de 4 y 8 bits; en fp16 requiere tarjetas de 16 GB o más.
- Opciones de despliegue: Unsloth Studio (referenciado por el autor), llama.cpp/Ollama mediante GGUFs de Unsloth, vLLM y TGI para servir el modelo en safetensors (compatibilidad no confirmada explícitamente en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B-it (este) | 2,3B efectivos / 5,1B totales | 128K | Texto, imagen, audio | Apache 2.0 | HuggingFace |
| Gemma 4 E4B-it | 4,5B efectivos / 8B totales | 128K | Texto, imagen, audio | Apache 2.0 | HuggingFace |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K (según familia) | Texto, imagen | Apache 2.0 | HuggingFace |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de una réplica alojada por Virtudant-AI, no del repositorio oficial de Google DeepMind; conviene verificar integridad y procedencia antes de usarlo en producción.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso real ni reportes de errores.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento largo y contextos de 128K tokens.
- Sesgos no documentados: no se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Idiomas: aunque se declaran más de 140 idiomas, el rendimiento puede variar notablemente entre ellos; no hay evaluaciones por idioma disponibles.
- Licencia Apache 2.0: permite uso comercial, pero la model card enlaza la licencia específica de Gemma 4 de Google, que conviene revisar por posibles términos adicionales de uso aceptable.
- Modo de razonamiento: los thinking modes pueden incrementar la latencia y el consumo de tokens; es necesario configurarlos según el caso de uso.
- Cuantizaciones no verificadas: aunque el autor referencia GGUFs dinámicos de Unsloth, no se detallan los tipos exactos ni sus métricas de degradación.
- Fecha de creación del repositorio (2026-11-05) posterior a la mayoría de referencias públicas consultadas; verificar que los pesos corresponden realmente al modelo base declarado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Virtudant-AI/gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Colección oficial de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Colección de Unsloth con versiones de Gemma 4: https://huggingface.co/collections/unsloth/gemma-4
- Guía de Unsloth para ejecutar Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Documentación de Unsloth Studio: https://unsloth.ai/docs/new/studio
- GGUFs dinámicos de Unsloth: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
