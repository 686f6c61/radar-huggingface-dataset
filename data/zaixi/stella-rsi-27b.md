# Zaixi/STELLA-RSI-27b

## Resumen

STELLA-RSI-27b es un modelo multimodal de tipo image-text-to-text desarrollado por Zaixi (bajo la marca STELLA) mediante un post-entrenamiento sobre el modelo base Qwen/Qwen3.8-27B. Se distribuye como pesos fusionados completos, es decir, no es un adaptador LoRA aislado sino el modelo completo listo para usar, aunque el repositorio también incluye el adaptador LoRA original en el directorio `lora_adapter/`. El modelo está pensado específicamente para asistencia a la investigación y el descubrimiento científico dentro de flujos de trabajo STELLA: interpretación de preguntas de investigación y descripciones de datasets, esbozo de análisis estadísticos y formulación de hipótesis científicas.

Con 27.781.427.952 parámetros (unos 27,8 mil millones), el modelo conserva la arquitectura, el tokenizador, la plantilla de chat, la torre de visión y la cabeza MTP (multi-token prediction) del modelo base Qwen3.8-27B, por lo que puede desplegarse en cualquier infraestructura que ya soporte dicho modelo base. La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial y su integración en productos.

Su relevancia actual radica en que combina capacidades multimodales (visión y texto) con un ajuste orientado a tareas científicas, en un rango de tamaño (27B) que resulta manejable en GPUs de gama alta de un solo nodo. No obstante, se trata de un modelo recién publicado (creado el 13 de noviembre de 2026) con cero descargas registradas en Hugging Face en el momento de la consulta, por lo que no existen aún datos públicos de benchmarks ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B, con torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados completos); incluye adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que hereda íntegramente la arquitectura del modelo base Qwen/Qwen3.8-27B: misma estructura de capas, mismo tokenizador, misma plantilla de chat, misma torre de visión y misma cabeza MTP (multi-token prediction). El post-entrenamiento se realizó mediante un ajuste fino con LoRA sobre dicho modelo base, y posteriormente los pesos se fusionaron para generar el checkpoint completo que se publica en el repositorio. El resultado es un modelo que puede sustituir directamente al base en cualquier pipeline que ya lo soporte, sin cambios en el código de inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación adicionales. Tampoco se documentan innovaciones técnicas propias más allá de la herencia de la cabeza MTP del modelo base, que permite predecir varios tokens por paso y, en principio, acelerar la decodificación. El ajuste parece orientado a dominio (asistencia científica), no a una modificación estructural de la arquitectura.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`apply_chat_template`) y modo de razonamiento desactivable mediante el parámetro `enable_thinking`.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión heredada del modelo base.
- Interpretación de preguntas de investigación y descripciones de datasets científicos.
- Esbozo y planificación de análisis estadísticos.
- Formulación de hipótesis científicas y asistencia al razonamiento de investigación.
- Predicción multi-token (cabeza MTP) heredada del modelo base, orientada a acelerar la generación.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue en infraestructuras de inferencia gestionadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la redacción de hipótesis científicas: el modelo puede recibir una descripción de un fenómeno o un conjunto de resultados preliminares y proponer hipótesis contrastables, aprovechando su ajuste específico en flujos de descubrimiento científico.
- Interpretación de descripciones de datasets: dado un catálogo de variables, metadatos y objetivos de estudio, el modelo ayuda a identificar qué datos son relevantes y qué supuestos hay que verificar antes del análisis.
- Planificación de análisis estadísticos: el modelo puede esbozar la secuencia de pasos (limpieza, pruebas, modelos) adecuada para una pregunta de investigación concreta, sirviendo como borrador que el investigador revisa y valida.
- Análisis de figuras y gráficos científicos: al ser multimodal, puede recibir una imagen de un gráfico o una figura de un paper y describir tendencias, ejes o posibles anomalías, útil en revisiones rápidas de literatura.
- Asistente conversacional de laboratorio: integrado en una interfaz de chat, puede mantener conversaciones multi-turno sobre metodología, interpretación de resultados o redacción de secciones de un artículo.
- Prototipado de pipelines de investigación reproducibles: al ser compatible con el ecosistema transformers y con endpoints, puede incrustarse en notebooks o servicios internos que automaticen la primera fase de exploración de un estudio.
- Revisión de documentación técnica y papers: el modelo puede resumir y contrastar descripciones metodológicas de artículos, señalando ambigüedades o información faltante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55-56 GB solo para los pesos (27,8B parámetros × 2 bytes), más overhead de activaciones, caché KV y la torre de visión; en la práctica se recomienda un mínimo de 64-80 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con GPUs de 24-48 GB (por ejemplo, 2× RTX 4090 o 2× L40S) mediante `device_map="auto"`.
- Cabe en GPU de consumo: no en una sola unidad de 24 GB en bfloat16; sería necesario cuantizar (no se documentan cuantizaciones oficiales) o repartir el modelo entre varias GPUs.
- Opciones de despliegue: transformers (soporte nativo según la model card, con `AutoModelForImageTextToText`); compatibilidad con endpoints según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STELLA-RSI-27b | ~27,8B | no disponible | image-text-to-text | Apache-2.0 | Hugging Face (0 descargas, 1 like en la consulta) |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | no disponible | image-text-to-text | no disponible en la informacion | Hugging Face |
| Alternativas de ~27B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea). El único punto de referencia documentado es el propio modelo base Qwen/Qwen3.8-27B, del que STELLA-RSI-27b hereda arquitectura, tokenizador y torre de visión.

## Limitaciones y advertencias

- Modelo recién publicado y sin validación independiente: cero descargas y un solo like en el momento de la consulta, sin benchmarks públicos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en contextos científicos donde una hipótesis o un paso estadístico inventado puede inducir a error.
- El ajuste está orientado a un dominio concreto (asistencia a la investigación científica dentro de flujos STELLA); su rendimiento en tareas generales puede diferir del modelo base.
- No se documentan los idiomas soportados; no debe asumirse un rendimiento multilingüe equivalente al del modelo base sin evaluación previa.
- No se documenta la longitud de contexto efectiva ni si el ajuste LoRA la preserva íntegramente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de los datos de post-entrenamiento, no detallados.
- El repositorio ocupa 56 GB, lo que incluye pesos fusionados y adaptador LoRA; hay que prever espacio de almacenamiento y ancho de banda para su descarga.
- Para producción, es imprescindible validar el modelo en el dominio objetivo antes de sustituir al modelo base, dado que no hay métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaixi/STELLA-RSI-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA incluido en el repositorio: https://huggingface.co/Zaixi/STELLA-RSI-27b/tree/main/lora_adapter
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
