# zhangshuai121/gemma-4-31B-it-f8

## Resumen

Gemma 4 31B IT es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, diseñado para procesar texto e imágenes y generar texto. Forma parte de la familia Gemma 4, que incluye variantes densas (E2B, E4B, 31B) y una variante Mixture-of-Experts (26B A4B). Esta ficha concreta corresponde a una cuantización en formato comprimido (f8) del modelo base `google/gemma-4-31B`, publicada por el usuario zhangshuai121.

El modelo emplea una arquitectura transformer densa de 60 capas con atención híbrida: intercala atención local de ventana deslizante (1024 tokens) con atención global, garantizando que la última capa sea siempre global. Incorpora Keys y Values unificadas en las capas globales y Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. Con 30.700 millones de parámetros efectivos (31.273.088.876 según safetensors) y una ventana de contexto de 256K tokens, está orientado a razonamiento, generación de código, flujos agénticos y comprensión multimodal.

La relevancia de esta ficha radica en que ofrece una versión cuantizada del modelo de 31B con licencia permisiva (Apache 2.0), lo que facilita su despliegue en entornos con restricciones de memoria. El vocabulario es de 262.000 tokens y el codificador visual añade aproximadamente 550 millones de parámetros. El repositorio ocupa 33,3 GB y utiliza la librería `compressed-tensors` junto con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), p-RoPE y Keys/Values unificadas en capas globales |
| Parametros totales | 31.273.088.876 (30,7B efectivos según model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | f8 (formato comprimido `compressed-tensors`); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | Más de 140 idiomas (según model card de la familia); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 60 capas con un vocabulario de 262.000 tokens y una ventana de atención deslizante de 1024 tokens. La innovación arquitectónica principal es la atención híbrida: las capas alternan atención local de ventana deslizante con atención global, asegurando que la capa final sea global. Las capas globales emplean Keys y Values unificadas y Proportional RoPE (p-RoPE), lo que reduce el consumo de memoria en contextos largos sin sacrificar la capacidad de procesamiento global. El codificador visual añade aproximadamente 550 millones de parámetros y soporta relaciones de aspecto y resoluciones variables.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de la familia menciona que los modelos están diseñados como razonadores con modos de pensamiento configurables, soporte nativo del rol `system` y capacidades mejoradas de código y agentes, pero no se especifican los detalles del pipeline de alineación. Esta ficha concreta es una cuantización f8 del modelo base, por lo que hereda las características del original sin reentrenamiento adicional.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Procesamiento multimodal de texto e imagen con soporte de relación de aspecto y resolución variables.
- Generación de código y capacidades agénticas mejoradas, con soporte nativo de function calling.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües en más de 140 idiomas.
- Procesamiento de contextos largos de hasta 256K tokens.
- Flujos de razonamiento multi-paso orientados a agentes autónomos.
- No se especifica soporte de audio para esta variante de 31B (el audio está reservado a las variantes E2B y E4B).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, manteniendo el hilo de la conversación y el historial de interacciones sin truncamientos agresivos.
- Generación de código en producción: soporta function calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o corrección automática de errores, aprovechando sus mejoras en benchmarks de código.
- Análisis de documentos con imágenes: al procesar texto e imagen de forma nativa, puede extraer información de capturas, diagramas o documentos escaneados junto con el texto asociado en una sola pasada.
- Agentes autónomos multi-paso: el soporte de razonamiento configurable y tool calling permite construir agentes que planifican, ejecutan herramientas y revisan resultados de forma iterativa.
- Asistentes de investigación: con 256K tokens de contexto, puede resumir y razonar sobre artículos largos, informes técnicos o múltiples documentos combinados en una sola ventana.
- Despliegue en workstations con GPU de gama alta: la cuantización f8 reduce los requisitos de memoria frente al modelo en precisión completa, facilitando su ejecución en entornos de una o varias GPU consumer de alta gama.
- Traducción y procesamiento multilingüe: el soporte de más de 140 idiomas lo hace adecuado para pipelines de localización y análisis de contenido en múltiples lenguas.

## Benchmarks y rendimiento

Resultados de la model card de la familia Gemma 4 para el modelo 31B instruction-tuned:

| Benchmark | Gemma 4 31B | Gemma 4 26B A4B | Gemma 4 E4B | Gemma 4 E2B | Gemma 3 27B (no think) |
|---|---|---|---|---|---|
| MMLU Pro | 85,2% | 82,6% | 69,4% | 60,0% | 67,6% |
| AIME 2026 no tools | 89,2% | 88,3% | 42,5% | 37,5% | 20,8% |
| LiveCodeBench v6 | 80,0% | no disponible en el extracto | no disponible | no disponible | no disponible |

Los datos de LiveCodeBench v6 para el resto de variantes no están completos en la información disponible. No se han publicado en la información proporcionada resultados adicionales como HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 33,3 GB en formato f8, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más overhead para el contexto y las activaciones. Para contextos de 256K tokens, la memoria adicional puede ser considerable.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para contexto completo. Para contextos reducidos, una RTX 4090 (24GB) no es suficiente para cargar los pesos f8 completos; se necesitarían cuantizaciones más agresivas (4-bit) no incluidas en este repositorio.
- Cabe en GPU consumer: no en su formato f8 de 33,3 GB con una sola GPU consumer de 24GB. Sería necesario recurrir a cuantizaciones de menor precisión o a configuraciones multi-GPU.
- Opciones de despliegue: `transformers` con `compressed-tensors` (formato nativo del repo); vLLM, TGI o llama.cpp no están confirmados para este formato concreto en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidades | Notas |
|---|---|---|---|---|---|
| Gemma 4 31B (esta ficha, f8) | 30,7B | 256K | Apache 2.0 | Texto, imagen | Cuantización f8 de la variante densa |
| Gemma 4 26B A4B | 25,2B totales / 3,8B activos | 256K | Apache 2.0 | Texto, imagen | MoE, inferencia más rápida |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Apache 2.0 | Texto, imagen, audio | Orientado a dispositivo |
| Gemma 3 27B | 27B | no disponible | Apache 2.0 (según familia) | Texto, imagen | Generación anterior, sin thinking mode |

La comparativa se limita a la propia familia Gemma 4 y a Gemma 3, ya que no se dispone de datos de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; como modelo entrenado con datos web a gran escala, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de razonamiento con thinking mode pueden generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto o idioma: aunque soporta 256K tokens y más de 140 idiomas, el rendimiento puede degradarse en contextos muy largos o en idiomas de bajos recursos; no se especifica la lista completa de idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia específica de Gemma 4 (`gemma_4_license`), que puede incluir términos adicionales de uso aceptable; conviene revisarla antes de producción.
- Esta ficha es una cuantización f8 de un tercero (zhangshuai121), no una publicación oficial de Google DeepMind; la calidad de la cuantización y su fidelidad al modelo original no están verificadas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No se dispone de información sobre el pipeline de alineación ni sobre evaluaciones de seguridad para esta variante concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zhangshuai121/gemma-4-31B-it-f8
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
