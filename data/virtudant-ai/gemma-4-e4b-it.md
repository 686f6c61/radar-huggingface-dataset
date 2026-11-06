# Virtudant-AI/gemma-4-E4B-it

## Resumen

Gemma 4 E4B IT es un modelo multimodal de Google DeepMind publicado como pesos abiertos bajo licencia Apache 2.0. Forma parte de la familia Gemma 4, que en esta iteración introduce arquitecturas densas y MoE, soporte nativo de audio y vídeo en los modelos pequenos, y una ventana de contexto de 128K tokens para la variante E4B. El sufijo "E" hace referencia a parámetros "efectivos": el modelo incorpora tablas de Per-Layer Embeddings (PLE) que elevan el recuento total a unos 8.000 millones, pero la computación efectiva ronda los 4.500 millones.

Este repositorio concreto, `Virtudant-AI/gemma-4-E4B-it`, es una publicación derivada del modelo oficial `google/gemma-4-E4B-it`, con etiquetas de Unsloth que sugieren un proceso de cuantización o preparación para fine-tuning. El pipeline declarado es `image-text-to-text`, lo que confirma su naturaleza multimodal entrada (texto e imagen) y salida (texto). El tamaño del repositorio (16 GB) es coherente con pesos en safetensors de precisión completa o bf16.

Su relevancia actual radica en que ofrece capacidades frontier en un formato que cabe en portátiles y GPUs de consumo, con soporte de razonamiento configurable, function calling nativo y más de 140 idiomas. La licencia Apache 2.0 elimina las restricciones de uso comercial que lastraban versiones anteriores de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (~8B, incluyendo embeddings PLE) |
| Parametros activos | No aplica (modelo denso; ~4,5B efectivos) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo incluye safetensors; Unsloth publica GGUFs dinámicos 2.0 en su colección) |
| Idiomas soportados | Más de 140 idiomas (según model card de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16 GB); GGUFs disponibles en la colección de Unsloth |

Otros datos técnicos: 42 capas, ventana de atención local de 512 tokens, vocabulario de 262K tokens, codificador de visión de ~150M de parámetros y codificador de audio de ~300M.

## Arquitectura y entrenamiento

El modelo emplea un transformer denso con un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante de 512 tokens y capas de atención global, garantizando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales unifican Keys y Values y aplican Proportional RoPE (p-RoPE). La innovación clave de la variante E4B son las Per-Layer Embeddings (PLE): en lugar de añadir capas o parámetros al decodificador, cada capa recibe su propia embedding pequeña por token, con tablas grandes pero de consulta rápida, lo que explica la diferencia entre parámetros totales (~8B) y efectivos (~4,5B).

La familia Gemma 4 se distribuye en variantes preentrenadas e instruction-tuned. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases específicas de RLHF o DPO para esta variante IT. Sí se indica que todos los modelos están diseñados como razonadores con modos de pensamiento configurables, soporte nativo del rol `system` y mejoras notables en benchmarks de código y capacidades agénticas.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprensión de imágenes con soporte de aspect ratio y resolución variables.
- Comprensión de audio nativa (codificador de ~300M de parámetros, exclusivo de E2B y E4B).
- Procesamiento de vídeo como entrada multimodal.
- Generación de código y matemáticas, con mejoras declaradas en benchmarks de coding.
- Function calling / tool calling nativo.
- Soporte de flujos agénticos y razonamiento multi-paso.
- Multilingüismo en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidad de ejecución en dispositivo (on-device) gracias a su tamaño efectivo reducido.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens y aceptar capturas de pantalla o fotos del producto del cliente, combinando comprensión visual y textual en una sola pasada.
- **Asistentes de accesibilidad en dispositivo**: gracias al codificador de audio nativo y su tamaño efectivo de ~4,5B, puede transcribir y razonar sobre audio en tiempo real en un portátil o móvil de gama alta, sin depender de la nube.
- **Generación de código en pipelines de CI/CD**: con function calling nativo y soporte del rol `system`, se integra en agentes que leen errores de build, consultan repositorios vía herramientas y proponen parches automatizados.
- **Análisis de documentos escaneados**: la combinación de visión de resolución variable y contexto largo permite procesar facturas, contratos o informes de varias páginas y extraer campos estructurados en una sola llamada.
- **Transcripción y resumen de reuniones**: el soporte de audio y la ventana de 128K permiten ingerir grabaciones largas, resumirlas y extraer action items, todo localmente.
- **Agentes de investigación multi-paso**: el modo de razonamiento configurable y el tool calling permiten construir agentes que planifican, invocan APIs y sintetizan resultados con trazabilidad del pensamiento.
- **Fine-tuning especializado en dominio**: al publicarse en safetensors y con soporte de Unsloth, es viable ajustarlo con LoRA/QLoRA en una sola GPU de consumo para tareas verticales (legal, médico, soporte interno).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona mejoras en coding y capacidades agénticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K) para la variante E4B.

## Requisitos de hardware

- **VRAM para inferencia en bf16/fp16**: aproximadamente 16 GB solo para pesos, más overhead de KV cache; se recomienda 24 GB o más para contextos largos.
- **VRAM con cuantización de 8 bits**: ~8-9 GB, viable en RTX 4070/4080.
- **VRAM con cuantización de 4 bits (GGUF Q4)**: ~5-6 GB, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs integradas con suficiente memoria unificada.
- **GPU recomendadas**: A100 40/80 GB y H100 para serving de alta concurrencia; RTX 4090 (24 GB) para desarrollo y fine-tuning LoRA; RTX 3090/4080 para inferencia bf16 con contexto moderado.
- **Consumer GPU**: sí, cabe en GPUs de 8-12 GB con cuantización 4-8 bits; también en Apple Silicon con memoria unificada de 16 GB o más.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama y Unsloth Studio (según la guía enlazada por el autor); los GGUFs dinámicos 2.0 de Unsloth están pensados para llama.cpp/Ollama.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E4B IT (este) | ~8B totales / ~4,5B efectivos | 128K | Texto, imagen, audio, vídeo | Apache 2.0 | PLE, on-device, thinking modes |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | No disponible en la informacion proporcionada | Texto, imagen | Apache 2.0 | MoE de la misma familia, mayor capacidad |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Variante densa de mayor tamaño, sin audio |
| Gemma 4 E2B IT | ~5,1B totales / 2,3B efectivos | 128K | Texto, imagen, audio | Apache 2.0 | Versión más pequeña de la familia, para móvil |

No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la model card; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos sociales y culturales.
- **Alucinación**: no se publican tasas de alucinación ni evaluaciones de factualidad para esta variante; en tareas de razonamiento abierto debe validarse la salida.
- **Idioma**: aunque se declaran más de 140 idiomas, el rendimiento relativo por idioma no está cuantificado; en idiomas de bajos recursos puede degradarse.
- **Contexto**: la ventana de 128K es amplia, pero la atención local de 512 tokens implica que la recuperación de información muy distante depende de las capas globales; conviene validar tareas de long-context antes de producción.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor enlaza a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`), que conviene revisar por si incluye términos de uso aceptable.
- **Repositorio derivado**: este repo (`Virtudant-AI/gemma-4-E4B-it`) tiene 0 descargas y 0 likes, y no incluye documentación propia más allá de la copia de la guía de Unsloth; para producción conviene partir del repo oficial `google/gemma-4-E4B-it`.
- **Cuantizaciones**: el repo publica safetensors; para despliegue en hardware limitado habrá que generar o buscar GGUFs en la colección de Unsloth, verificando la calidad de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Virtudant-AI/gemma-4-E4B-it
- Modelo base oficial: https://huggingface.co/google/gemma-4-E4B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Colección de Unsloth con GGUFs y variantes: https://huggingface.co/collections/unsloth/gemma-4
- Guía de Unsloth para ejecutar Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Benchmarks de cuantización Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- GitHub de Unsloth: https://github.com/unslothai/unsloth/
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en DeepMind: https://deepmind.google/models/gemma/
