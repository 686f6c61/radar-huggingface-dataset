# vultr/K2-Horizon-7B-GGUF

## Resumen

K2-Horizon-7B-GGUF es la versión cuantizada en formato GGUF del modelo denso K2-Horizon-7B, publicada por Vultr. El modelo base, desarrollado por IFM, es un transformer denso de aproximadamente 9.000 millones de parámetros (etiquetado comercialmente como "7B") orientado a flujos de trabajo agénticos, generación de código, razonamiento y tareas de contexto largo. Esta variante GGUF está pensada para su ejecución con llama.cpp y entornos compatibles con endpoints, lo que facilita el despliegue en infraestructura propia sin depender de GPUs de gama alta.

La característica más destacable del modelo base es su ventana de contexto nativa de 512.000 tokens, introducida desde la fase de midtraining, junto con un vocabulario de 250.624 entradas y atención con Grouped Query Attention (32 cabezas de atención frente a 8 cabezas clave-valor). La cuantización de Vultr no aplica una precisión uniforme a toda la red, sino que selecciona la precisión de cada capa a partir de una puntuación de importancia medida, de modo que los bits se asignan donde más afectan a la salida.

Esta ficha es relevante ahora porque ofrece una vía práctica para ejecutar un modelo de contexto muy largo en hardware modesto mediante llama.cpp, con licencia Apache 2.0 y sin restricciones de uso comercial. No obstante, la información pública disponible sobre benchmarks, datos de entrenamiento y proceso de alineación es limitada, por lo que varias especificaciones se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | k2-horizon, transformer denso con Grouped Query Attention |
| Parámetros totales | 8.999.178.240 (aproximadamente 9B; etiquetado como 7B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 512.000 tokens nativos, desde midtraining |
| Tipos de cuantización | GGUF híbrido por capas (precisión elegida por capa según puntuación de importancia); niveles concretos no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 23,0 GB); el modelo base en safetensors |
| Capas | 36 |
| Hidden size | 4.096 |
| Cabezas de atención | 32 |
| Cabezas clave-valor | 8 |
| Dimensión feed-forward | 12.288 |
| Vocabulario | 250.624 tokens |
| Grupos de layer-normalization | cuatro |
| RoPE theta | no disponible (truncado en la información proporcionada) |
| Modelo base | IFM/K2-Horizon-7B |
| Cuantizado por | Vultr |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 36 capas con atención de consultas agrupadas (32 cabezas de consulta y 8 cabezas clave-valor), hidden size de 4.096 y una dimensión feed-forward de 12.288. Emplea cuatro grupos de layer-normalization y un vocabulario de 250.624 tokens. La ventana de contexto de 512.000 tokens se incorpora de forma nativa a partir de la fase de midtraining, lo que indica un entrenamiento por etapas con extensión progresiva del contexto. La model card menciona además el uso de "Diffusion Adapters" para acelerar la inferencia y la existencia de checkpoints intermedios que permiten analizar la evolución de capacidades durante el entrenamiento.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras formas de alineación. Tampoco se detalla el proceso exacto de puntuación de importancia por capa que Vultr utiliza para construir las cuantizaciones GGUF híbridas; solo se indica que la precisión de cada capa se elige a partir de una métrica medida de impacto en la salida.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés.
- Razonamiento multi-paso y tareas que requieren cadenas largas de inferencia.
- Generación y comprensión de código, orientada a flujos de trabajo de desarrollo.
- Procesamiento de contexto largo: hasta 512.000 tokens nativos, adecuado para documentos extensos, repositorios completos o historiales de conversación prolongados.
- Diseñado para flujos agénticos, según la model card del modelo base.
- Compatible con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: limitado al inglés según los metadatos del repositorio.

## Casos de uso

- Análisis de repositorios de código completos: con 512.000 tokens de contexto, el modelo puede ingerir varios ficheros o un repositorio de tamaño medio en una sola pasada para tareas de revisión, explicación o detección de inconsistencias.
- Asistentes de documentación técnica: resumir y responder preguntas sobre manuales extensos, especificaciones o contratos sin necesidad de fragmentación agresiva ni recuperación externa.
- Agentes de automatización de tareas de desarrollo: integrado en pipelines que requieren razonamiento multi-paso sobre el estado del proyecto y el historial de cambios.
- Atención al cliente con historial largo: gestionar conversaciones multi-turno de muchas interacciones manteniendo el contexto completo dentro de la ventana del modelo.
- Procesamiento de expedientes o informes legales y financieros: extracción de cláusulas, comparación entre documentos y generación de resúmenes estructurados sobre textos de gran longitud.
- Despliegue en infraestructura propia con llama.cpp: al estar en formato GGUF, puede servirse en servidores con GPU modesta o incluso en CPU, lo que encaja en entornos con requisitos de soberanía de datos.
- Prototipado de aplicaciones agénticas en local: usar la variante cuantizada para iterar sobre prompts y flujos antes de pasar a la versión completa en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que no se detallan los niveles de cuantización incluidos. Como referencia orientativa, un modelo denso de ~9B parámetros en GGUF requiere del orden de 5-6 GB en cuantización de 4 bits, 9-10 GB en 8 bits y unos 18 GB en FP16; estas cifras son estimaciones generales y no datos publicados para este repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) para cuantizaciones de 8 bits o superiores, pero no está confirmado.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones bajas, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo), entornos compatibles con endpoints; vLLM, TGI u Ollama no están confirmados para este repositorio GGUF concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-7B-GGUF | ~9B denso | 512K | Apache 2.0 | GGUF | Cuantización híbrida por capas de Vultr; solo inglés |
| IFM/K2-Horizon-7B | ~9B denso | 512K | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Alternativas de ~7-9B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos de rendimiento de esta familia no se han publicado en las fuentes consultadas.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: aunque la ventana nativa es de 512.000 tokens, el coste de memoria de la caché KV crece de forma lineal con la longitud; con 8 cabezas KV y 36 capas, las secuencias muy largas pueden agotar la VRAM incluso con cuantizaciones bajas.
- Alucinación: no hay información pública sobre tasas de alucinación ni sobre el proceso de alineación, por lo que debe validarse la salida en aplicaciones críticas.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base IFM/K2-Horizon-7B y de los pesos originales.
- Cuantización híbrida: al asignar precisión distinta por capa, el comportamiento puede diferir del modelo base; no se publican métricas de degradación por cuantización.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de la comunidad sobre su funcionamiento en producción.
- Tool calling y agentes: la model card menciona flujos agénticos, pero no se documenta el formato de function calling ni plantillas de prompt específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vultr/K2-Horizon-7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Vultr (sitio oficial): https://www.vultr.com/
- Vultr Docs: https://docs.vultr.com/
- Vultr Discover: https://discover.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
