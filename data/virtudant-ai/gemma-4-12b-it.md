# Virtudant-AI/gemma-4-12b-it

## Resumen

Gemma 4 12B IT es la variante de 12.000 millones de parámetros de la familia Gemma 4 de Google DeepMind, publicada bajo licencia Apache 2.0. Se trata de un modelo multimodal unificado que procesa texto, imagen, vídeo y audio de forma nativa, sin necesidad de encoders separados, lo que simplifica el despliegue en entornos locales y dispositivos de consumo. Esta ficha concreta corresponde al repositorio `Virtudant-AI/gemma-4-12b-it`, un espejo del modelo oficial `google/gemma-4-12B-it` con etiquetas de Unsloth, sin descargas ni interacciones registradas.

El modelo emplea una arquitectura transformer densa con atención híbrida que intercala ventanas deslizantes locales con atención global completa, garantizando que la última capa sea siempre global. Incorpora Proportional RoPE (p-RoPE) y claves y valores unificados en las capas globales para reducir el consumo de memoria en contextos largos. Con 11.950 millones de parámetros y una ventana de contexto de hasta 256.000 tokens, está orientado a razonamiento, generación de código, flujos agénticos y comprensión multimodal.

Su relevancia actual radica en que ofrece capacidades multimodales nativas (incluido audio) en un tamaño que cabe en GPUs de consumo de gama alta, con soporte de más de 140 idiomas, modos de pensamiento configurables y soporte nativo de `system` prompt y function calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), p-RoPE, claves/valores unificados en capas globales |
| Parámetros totales | 11,95B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens (modelos medios; los pequeños de la familia tienen 128K) |
| Tipos de cuantización | GGUF dinámica (Unsloth Dynamic 2.0), 4-bit, 16-bit; otras no disponibles |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (16-bit) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 48 capas y 11,95B de parámetros. La innovación arquitectónica principal es la atención híbrida: intercala capas con atención de ventana deslizante local con capas de atención global completa, asegurando que la capa final sea siempre global. Las capas globales usan claves y valores unificados y Proportional RoPE (p-RoPE) para contener el coste de memoria en contextos largos. La multimodalidad es "encoder-free": el modelo procesa directamente texto, imagen (con soporte de relación de aspecto y resolución variables), vídeo y audio nativo, sin encoders externos, lo que reduce el tamaño de despliegue.

La familia Gemma 4 se distribuye en variantes preentrenadas e instruction-tuned, con arquitecturas densas y MoE (26B A4B) en cinco tamaños (E2B, E4B, 12B, 26B A4B, 31B). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineación. Sí se indica que todos los modelos están diseñados como razonadores con modos de pensamiento configurables y soporte nativo del rol `system`.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de vídeo y audio nativo (sin encoders separados).
- Generación de código y tareas de programación con mejoras notables en benchmarks de coding.
- Soporte nativo de function calling / tool calling.
- Capacidades agénticas y razonamiento multi-paso para agentes autónomos.
- Multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Entrada image-text-to-text (pipeline declarado en el repositorio).

## Casos de uso

- Asistente multimodal local: desplegado en una estación de trabajo con GPU de consumo, el modelo puede responder a consultas que combinan texto, imágenes y audio sin depender de servicios en la nube, gracias a su multimodalidad nativa sin encoders.
- Análisis de documentos y capturas: interpretación de imágenes con relación de aspecto y resolución variables para extraer información de facturas, gráficos o interfaces, integrable en pipelines de automatización documental.
- Transcripción y comprensión de audio en local: procesamiento de reuniones o notas de voz directamente en el dispositivo, sin necesidad de un modelo de audio separado.
- Agentes autónomos con tool calling: construcción de flujos multi-paso donde el modelo invoca APIs y funciones externas, apoyado en el soporte nativo de function calling y del rol `system`.
- Asistencia a la programación: generación y revisión de código en entornos de desarrollo integrados, con contexto largo de hasta 256K tokens para analizar repositorios completos.
- Atención al cliente multilingüe: gestión de conversaciones multi-turno en más de 140 idiomas con contexto extendido para mantener el historial de la sesión.
- Procesamiento de vídeo para moderación o resumen: análisis de contenido audiovisual en local en escenarios de privacidad estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo denso de 11,95B en 16-bit requiere del orden de 24 GB solo para pesos, y en cuantización de 4 bits alrededor de 7-8 GB para pesos, más overhead de contexto y activaciones.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, encaja en GPUs de consumo de gama alta y en aceleradores de centro de datos (A100, H100) para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en principio, en GPUs con suficiente VRAM según la cuantización elegida; el modelo está posicionado por el autor para "consumer GPUs and workstations".
- Opciones de despliegue: Unsloth Studio, llama.cpp (GGUF), y otras herramientas compatibles con safetensors/GGUF; vLLM, TGI y Ollama no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 12B IT (este) | 11,95B | Hasta 256K | Texto, imagen, vídeo, audio nativo | Apache 2.0 | Hugging Face (espejo Virtudant-AI y oficial google) |
| Gemma 4 31B Dense | 30,7B | Hasta 256K | Texto, imagen, vídeo, audio nativo | Apache 2.0 | Hugging Face |
| Gemma 4 26B A4B (MoE) | No disponible (MoE) | Hasta 256K | Texto, imagen, vídeo, audio nativo | Apache 2.0 | Hugging Face |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, vídeo, audio nativo | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos conocidos del modelo.
- Riesgo de alucinación inherente a los modelos generativos; no se documenta una mitigación específica.
- El repositorio concreto (`Virtudant-AI/gemma-4-12b-it`) es un espejo sin descargas ni interacciones; para producción conviene verificar contra el repositorio oficial `google/gemma-4-12B-it`.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los términos de uso comercial aplicables.
- Los idiomas concretos soportados no están listados individualmente, solo el dato agregado de más de 140 idiomas.
- No se dispone de información sobre latencia, throughput ni requisitos oficiales de VRAM, lo que dificulta el dimensionamiento previo a producción.
- El contexto máximo de 256K puede degradar el rendimiento efectivo si no se gestiona adecuadamente la memoria; el modelo usa p-RoPE y KV unificados para mitigarlo, pero no hay cifras publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Virtudant-AI/gemma-4-12b-it
- Modelo base oficial: https://huggingface.co/google/gemma-4-12B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Colección Unsloth Gemma 4: https://huggingface.co/collections/unsloth/gemma-4
- Guía Unsloth para ejecutar Gemma 4 12B: https://docs.unsloth.ai/models/gemma-4
- Documentación Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
