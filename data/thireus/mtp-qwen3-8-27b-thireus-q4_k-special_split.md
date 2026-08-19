# Thireus/mtp-Qwen3.8-27B-THIREUS-Q4_K-SPECIAL_SPLIT

## Resumen

Este repositorio contiene una cuantización Q4_K del modelo Qwen3.8-27B, realizada por Thireus mediante su herramienta GGUF-Tool-Suite. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso multimodal de 27 mil millones de parámetros, optimizado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. La cuantización Q4_K reduce significativamente el tamaño del modelo, permitiendo su ejecución en hardware de consumo con una pérdida mínima de calidad, como se indica en las comparaciones de perplejidad publicadas por el autor.

La relevancia de esta ficha radica en que ofrece una opción práctica para desplegar un modelo de alto rendimiento en entornos locales, sin necesidad de infraestructura de servidor dedicada. El autor ha publicado varias variantes de cuantización (BF16, Q4_K_R4, etc.) y esta versión Q4_K es una de las más equilibradas en términos de tamaño y calidad. La licencia MIT facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) |
| Parametros totales | 27B (según nombre del modelo base, no confirmado en esta ficha) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (GGUF) |
| Idiomas soportados | no disponible (modelo base multilingüe, sin especificar) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal, desarrollado por Alibaba. Según el repositorio oficial, está diseñado para sobresalir en codificación, flujos de trabajo agénticos y automatización de oficina, lo que sugiere un entrenamiento orientado a tareas de razonamiento y uso de herramientas. No se dispone de información detallada sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación (RLHF/DPO) en la información proporcionada.

La cuantización Q4_K aplicada por Thireus utiliza su GGUF-Tool-Suite, que optimiza la representación de pesos para reducir el tamaño del archivo manteniendo la perplejidad lo más baja posible. El autor publica comparativas de perplejidad entre sus cuantizaciones y otras herramientas, indicando que sus recetas ofrecen un buen equilibrio entre tamaño y calidad, aunque no se incluyen los datos numéricos en esta ficha.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Codificación: el modelo base está optimizado para tareas de programación, incluyendo generación, revisión y depuración de código.
- Multimodal: el modelo base acepta entradas de imagen y texto, aunque esta capacidad puede verse afectada por la cuantización.
- Soporte de tool calling y flujos de trabajo agénticos, según la descripción del modelo base.
- Automatización de oficina: procesamiento de documentos, resúmenes y generación de informes.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque no se especifican cuáles en la información disponible.

## Casos de uso

- Asistente de codificación local: el modelo cuantizado puede integrarse en editores de código o entornos de desarrollo para autocompletar, explicar y refactorizar código, gracias a su optimización para tareas de programación.
- Automatización de tareas de oficina: procesamiento de correos electrónicos, generación de resúmenes de reuniones y redacción de documentos, aprovechando su capacidad de razonamiento y generación de texto.
- Agente conversacional en dispositivos edge: al ser un GGUF Q4_K, puede ejecutarse en portátiles o mini-PCs con GPU de consumo, permitiendo asistentes personales sin conexión a la nube.
- Análisis de documentos con visión: si la cuantización conserva las capacidades multimodales, puede utilizarse para extraer información de imágenes, capturas de pantalla o documentos escaneados.
- Prototipado rápido de aplicaciones de IA: su licencia MIT y formato GGUF facilitan la experimentación en entornos de desarrollo sin restricciones de uso.
- Despliegue en hardware AMD: según el blog de AMD, Qwen3.8 27B tiene soporte de día cero en procesadores Ryzen AI y GPUs Radeon, lo que permite ejecutar esta cuantización en equipos con dicha plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona comparativas de perplejidad en su página de colección, pero no se incluyen los valores numéricos en los resultados de búsqueda. Se recomienda consultar la documentación del modelo base Qwen3.8-27B para obtener métricas de referencia (MMLU, HumanEval, GSM8K, etc.), aunque estas corresponden al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K de un modelo de 27B, el tamaño del archivo ronda los 14-16 GB, por lo que se recomienda al menos 16 GB de VRAM para inferencia cómoda. Esta es una estimación basada en el tamaño típico de modelos similares, no un dato oficial.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o GPUs AMD con 16 GB o más, como la Radeon RX 7900 XTX.
- En consumer GPU: sí, cabe en GPUs de gama alta con 16 GB o más. En GPUs de 8 GB no es viable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF) y TGI (con adaptadores). El blog de AMD menciona compatibilidad con LM Studio y Lemonade.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Se puede comparar con otras cuantizaciones del mismo modelo base publicadas por Thireus (BF16, Q4_K_R4), pero no se incluyen métricas numéricas. Como referencia, el modelo base Qwen3.8-27B compite con otros modelos de 27B como Llama 3.1 8B (menor tamaño) o Qwen2.5 32B (similar), pero no se dispone de benchmarks para esta cuantización específica.

## Limitaciones y advertencias

- La cuantización Q4_K puede degradar ligeramente la calidad de generación en comparación con el modelo BF16, especialmente en tareas de razonamiento complejo o matemáticas.
- No se ha verificado el rendimiento multimodal en esta cuantización; es posible que la precisión en tareas de visión se vea reducida.
- La longitud de contexto no está especificada; se recomienda consultar la documentación del modelo base para conocer el límite máximo.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, especialmente en dominios especializados.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las leyes aplicables.
- No se dispone de información sobre el pipeline de entrenamiento o los datos utilizados, por lo que no se puede evaluar la robustez frente a ataques adversariales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-Q4_K-SPECIAL_SPLIT
- Modelo base Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Colección de modelos de Thireus: https://gguf.thireus.com/
- Blog de AMD sobre soporte de Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Otras cuantizaciones del mismo autor: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT y https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-Q4_K_R4-SPECIAL_SPLIT
