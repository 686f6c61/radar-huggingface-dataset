# usagi0130/gemma-4-E4B-it

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada en variantes densas (E2B, E4B, 12B y 31B) y Mixture-of-Experts (26B A4B). La variante E4B que nos ocupa procesa texto, imagen y audio como entrada y genera texto como salida, con una ventana de contexto de 128K tokens y soporte para más de 140 idiomas. La "E" de su nombre indica parámetros efectivos: emplea Per-Layer Embeddings (PLE) para maximizar la eficiencia en despliegue local, de modo que sus 4,5B parámetros efectivos (8B contando embeddings) se traducen en 7.996.156.490 parámetros reales almacenados en safetensors.

El modelo que documenta esta ficha es un fine-tuning publicado por el usuario `usagi0130` sobre la base `google/gemma-4-E4B`, con pipeline `any-to-any` y licencia Apache 2.0. Se distribuye en formato safetensors para la librería transformers y ocupa 16 GB en el repositorio. Su relevancia radica en que hereda las capacidades de la familia Gemma 4 (razonamiento con modos de pensamiento configurables, function calling nativo, soporte de rol `system`, multimodalidad) en un tamaño pensado para ejecutarse en GPU de consumo.

La familia Gemma 4 introduce una atención híbrida que intercala atención local de ventana deslizante con atención global, además de claves y valores unificados y Proportional RoPE (p-RoPE) en las capas globales para reducir el coste de memoria en contextos largos. El E4B, en concreto, está orientado a despliegue en portátiles y dispositivos de borde, con un codificador de visión de aproximadamente 150M de parámetros y uno de audio de aproximadamente 300M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) y codificadores dedicados de visión y audio |
| Parametros totales | 7.996.156.490 (8B con embeddings; 4,5B efectivos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 140 idiomas (según la model card de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 42 capas con ventana deslizante de 512 tokens, vocabulario de 262K tokens y atención híbrida: las capas alternan atención local de ventana deslizante con atención global, garantizando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para contener el consumo de memoria en contextos largos. La multimodalidad se resuelve con codificadores dedicados: aproximadamente 150M de parámetros para visión (con soporte de relación de aspecto y resolución variables) y aproximadamente 300M para audio.

La innovación clave del tamaño E4B son las Per-Layer Embeddings (PLE): en lugar de añadir capas o parámetros al decodificador, cada capa recibe su propia tabla de embeddings pequeña por token. Estas tablas son grandes en número de parámetros pero solo se usan para búsquedas rápidas, lo que explica la diferencia entre los 4,5B efectivos y los 8B totales. La model card de la familia no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en el material proporcionado. Tampoco se documenta el proceso específico de fine-tuning aplicado por `usagi0130` sobre la base `google/gemma-4-E4B`.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking mode) configurables.
- Comprensión de imagen con soporte de relación de aspecto y resolución variables.
- Comprensión de audio nativa (el E4B es uno de los tamaños que la incluye, junto con E2B y 12B).
- Generación de código y matemáticas, con mejoras declaradas en benchmarks de coding dentro de la familia.
- Function calling / tool calling nativo, orientado a flujos agénticos.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingües en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Pipeline `any-to-any` (entrada multimodal, salida de texto).

## Casos de uso

- **Asistente local en portátil**: con 4,5B parámetros efectivos y 128K de contexto, el modelo puede ejecutarse en GPU de consumo para tareas de productividad, resumen de documentos largos y conversación multi-turno sin depender de la nube.
- **Atención al cliente automatizada**: el soporte nativo del rol `system` permite fijar políticas de empresa y tono, mientras que la ventana de 128K admite historiales de conversación extensos e instrucciones de negocio detalladas.
- **Agentes con tool calling**: la familia declara function calling nativo y capacidades agénticas; el E4B puede integrarse en orquestadores que encadenen llamadas a APIs (consultas a bases de datos, ticketing, calendario) con razonamiento multi-paso.
- **Análisis de documentos con imagen**: al aceptar imagen con relación de aspecto y resolución variables, sirve para extraer información de capturas, formularios escaneados o gráficos combinados con texto en un mismo prompt.
- **Transcripción y análisis de audio**: el codificador de audio de ~300M parámetros permite resumir reuniones, clasificar llamadas o generar actas a partir de audio sin un pipeline separado de ASR.
- **Generación de código en pipelines de CI/CD**: con soporte de tool calling y contexto largo, puede revisar diffs, sugerir parches y consultar documentación dentro del mismo flujo de trabajo.
- **Procesamiento multilingüe**: con más de 140 idiomas declarados, es adecuado para traducción, moderación de contenido y atención al cliente en mercados con varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 16 GB en safetensors (pesos en precisión de entrenamiento). En fp16/bf16 se necesitan del orden de 16 GB solo para pesos, más overhead de contexto KV; en cuantizaciones de 8 bits o 4 bits el requisito baja sustancialmente, aunque no se publican cuantizaciones oficiales en la información disponible.
- **GPU recomendadas**: para fp16/bf16, GPU de 24 GB o más (RTX 3090/4090, A100, H100). El material de terceros consultado indica un mínimo de 8 GB de VRAM para el E4B, lo que corresponde a despliegues cuantizados.
- **GPU de consumo**: sí cabe en GPU de consumo; el modelo está diseñado explícitamente para ejecución local en portátiles y dispositivos de borde.
- **Opciones de despliegue**: transformers (librería declarada en el repositorio). No se confirman en la información disponible soportes de vLLM, llama.cpp, Ollama o TGI para esta variante concreta.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B (esta ficha) | 4,5B efectivos / 8B totales | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face (transformers) |
| Gemma 4 E2B | 2,3B efectivos / 5,1B totales | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 26B A4B | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | Hugging Face |

La comparación se limita a la propia familia Gemma 4 porque la información proporcionada no incluye datos de rendimiento ni de modelos competidores de otros fabricantes. No se dispone de resultados de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- **Sesgos**: no se documentan en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos, pero no hay evaluación publicada en el material consultado.
- **Alucinación**: no hay métricas de fiabilidad ni tasas de alucinación publicadas para esta variante.
- **Idioma**: aunque la familia declara más de 140 idiomas, no se especifica el nivel de calidad por idioma ni si el fine-tuning de `usagi0130` preserva ese soporte.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los términos de uso de Gemma además de la licencia declarada en el repositorio.
- **Madurez del artefacto**: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-06), sin documentación propia sobre el proceso de fine-tuning, los datos usados ni evaluaciones. Para producción, es un artefacto sin validación comunitaria.
- **Cuantizaciones**: no se publican versiones GGUF ni cuantizadas en el repositorio, lo que limita el despliegue directo en herramientas como llama.cpp u Ollama.
- **Contexto**: los 128K tokens son la ventana nominal; el rendimiento real en contextos muy largos no está validado en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/usagi0130/gemma-4-E4B-it)
- [Modelo base: google/gemma-4-E4B](https://huggingface.co/google/gemma-4-E4B)
- [Colección Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [GitHub de Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentación de Gemma](https://ai.google.dev/gemma/docs/core)
- [Informe técnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 E4B en gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
