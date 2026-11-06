# zhangshuai121/gemma-4-31B-it-fp8

## Resumen

Gemma 4 31B IT FP8 es una versión cuantizada en FP8 del modelo Gemma 4 31B en su variante instruction-tuned, desarrollado originalmente por Google DeepMind y publicada en Hugging Face por el usuario `zhangshuai121`. Se trata de un modelo multimodal de tipo image-text-to-text que acepta entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 256K tokens y soporte multilingüe declarado para más de 140 idiomas. La cuantización FP8 reduce el peso del repositorio a 33,3 GB frente a los aproximadamente 62 GB que ocuparían los pesos en BF16, manteniendo 31.273.088.876 parámetros totales.

La arquitectura es un transformer denso de 60 capas con atención híbrida que intercala atención local de ventana deslizante (1024 tokens) con atención global, y emplea claves y valores unificados junto con Proportional RoPE (p-RoPE) en las capas globales para optimizar el consumo de memoria en contextos largos. Incorpora un codificador visual de aproximadamente 550M de parámetros y un vocabulario de 262K tokens. El modelo base pertenece a la familia Gemma 4, que incluye variantes densas (E2B, E4B, 31B) y una variante MoE (26B A4B).

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada para desplegar un modelo de 31B con capacidades de razonamiento, código y visión en hardware más modesto, manteniendo la licencia Apache 2.0 del modelo original. No obstante, al ser una publicación de terceros con cero descargas y sin validación comunitaria, debe tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + global), 60 capas |
| Parametros totales | 31.273.088.876 (30,7B según model card; ~550M corresponden al codificador visual) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | Más de 140 idiomas (según model card del modelo base) |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de 60 capas con un mecanismo de atención híbrido que alterna capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos extensos. El vocabulario es de 262K tokens y el codificador visual ronda los 550M de parámetros, lo que habilita la entrada de imágenes con soporte de relación de aspecto y resolución variables.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la variante instruction-tuned. La familia Gemma 4 se presenta con modos de razonamiento configurables ("thinking modes"), soporte nativo del rol `system` y capacidades mejoradas de código y agentes con function calling nativo. Esta publicación concreta es una cuantización FP8 del checkpoint `google/gemma-4-31B`, realizada por un tercero, por lo que las características de entrenamiento son las del modelo original y no se han modificado.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables.
- Comprensión de imágenes (image-text-to-text) con soporte de relación de aspecto y resolución variables.
- Generación y análisis de código, con mejoras notables en benchmarks de coding según la model card.
- Razonamiento matemático (evaluado en AIME 2026 sin herramientas).
- Soporte nativo de function calling / tool calling.
- Capacidades agénticas y razonamiento multi-paso para flujos autónomos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- No incluye entrada de audio (a diferencia de las variantes E2B y E4B).

## Casos de uso

- Asistencia técnica multimodal: el modelo puede recibir capturas de pantalla o diagramas junto con texto y responder consultas técnicas, aprovechando el codificador visual de ~550M de parámetros y la ventana de 256K tokens para incluir documentación extensa en el contexto.
- Generación de código en pipelines de CI/CD: gracias al function calling nativo y a las mejoras en benchmarks de coding, puede integrarse como agente que consulta APIs, ejecuta herramientas y propone parches dentro de flujos automatizados.
- Análisis de documentos largos: con 256K tokens de contexto y atención híbrida optimizada, es adecuado para resumir contratos, informes o bases de código completas en una sola pasada.
- Agentes autónomos multi-paso: el soporte de razonamiento configurable y tool calling permite construir agentes que planifican, invocan herramientas y verifican resultados en tareas de investigación o automatización.
- Atención al cliente multilingüe: el soporte de más de 140 idiomas y el rol `system` nativo facilitan conversaciones multi-turno con instrucciones de negocio persistentes.
- Extracción de información de imágenes y texto combinados: digitalización de facturas, tickets o formularios donde el modelo lee la imagen y estructura los datos en JSON mediante function calling.
- Razonamiento matemático asistido: resolución de problemas cuantitativos con modo thinking, útil en herramientas educativas o de análisis financiero.
- Despliegue en estaciones de trabajo con GPU consumer de gama alta gracias a la cuantización FP8, que reduce el peso a 33,3 GB.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Gemma 4 31B instruction-tuned según la model card; no se han publicado resultados específicos de esta cuantización FP8.

| Benchmark | Gemma 4 31B | Gemma 4 26B A4B | Gemma 4 E4B | Gemma 4 E2B | Gemma 3 27B (no think) |
|---|---|---|---|---|---|
| MMLU Pro | 85,2% | 82,6% | 69,4% | 60,0% | 67,6% |
| AIME 2026 no tools | 89,2% | 88,3% | 42,5% | 37,5% | 20,8% |
| LiveCodeBench v6 | 80,0% | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks para la versión FP8 concreta ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 33-35 GB en FP8 para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40-48 GB para contextos largos.
- GPU recomendadas: A100 80GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB. En GPUs de 24 GB (RTX 4090, 3090) no cabe en FP8 sin offloading a CPU o cuantización adicional a 4 bits.
- Cabe en GPU consumer: solo en modelos con 48 GB o más (RTX 6000 Ada, A6000). En RTX 4090 requiere cuantización GGUF de 4-5 bits o descarga parcial a RAM.
- Opciones de despliegue: transformers (formato nativo compressed-tensors), vLLM (si soporta compressed-tensors para esta arquitectura), TGI, llama.cpp/Ollama previa conversión a GGUF. La compatibilidad exacta con cada runtime no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 31B IT FP8 (esta ficha) | 31,3B | 256K | Texto, imagen | Apache 2.0 | Hugging Face (repo de terceros, 0 descargas) |
| Gemma 4 31B (original) | 30,7B | 256K | Texto, imagen | Apache 2.0 | Hugging Face (Google) |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | Hugging Face (Google) |
| Gemma 3 27B | ~27B | no disponible en la información | Texto, imagen | Apache 2.0 | Hugging Face (Google) |

La variante MoE 26B A4B ofrece inferencia casi tan rápida como un modelo de 4B gracias a sus 3,8B parámetros activos, lo que la hace preferible para despliegues con requisitos de latencia estrictos. El 31B denso obtiene mejores resultados en MMLU Pro (85,2% frente a 82,6%) y AIME 2026 (89,2% frente a 88,3%), por lo que es la opción de mayor calidad dentro de la familia.

## Limitaciones y advertencias

- Publicación de terceros: el repositorio pertenece a `zhangshuai121`, no a Google, con 0 descargas y 0 likes; no hay validación comunitaria de la calidad de la cuantización.
- La cuantización FP8 puede introducir degradación leve en precisión respecto al modelo original en BF16; no se han publicado evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento abierto o con contextos muy largos.
- Sesgos: la model card no detalla sesgos conocidos; al tratarse de un modelo entrenado con datos web a gran escala, es esperable que reproduzca sesgos presentes en esos datos.
- Restricciones de licencia: aunque la etiqueta indica Apache 2.0, el `license_link` apunta a la licencia específica de Gemma 4 de Google, que puede incluir términos de uso adicionales; conviene revisarla antes de uso comercial.
- Idiomas: se declaran más de 140 idiomas, pero el rendimiento puede variar significativamente entre ellos; no hay evaluación por idioma disponible.
- Formato compressed-tensors: requiere versiones de transformers y runtimes compatibles; la integración con vLLM u otros servidores puede no estar soportada de forma nativa.
- El modelo no procesa audio (solo las variantes E2B y E4B lo hacen).
- Fecha de creación del repositorio inusual (2026-11-03); verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zhangshuai121/gemma-4-31B-it-fp8
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma en DeepMind: https://deepmind.google/models/gemma/
