# spinochenza/Huihui-Qwen3.8-27B-abliterated

## Resumen

El modelo `spinochenza/Huihui-Qwen3.8-27B-abliterated` es una adaptación del modelo base `Qwen/Qwen3.8-27B` creada mediante la técnica de *abliteration*, cuyo objetivo es eliminar los rechazos y restricciones de contenido que suelen incorporar los modelos de lenguaje comerciales o de código abierto. El autor, spinochenza, publica esta versión como una prueba de concepto basada en el proyecto [remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers), que modifica los pesos del modelo para reducir la probabilidad de que genere respuestas de negativa ante solicitudes sensibles.

El modelo mantiene la arquitectura original del Qwen3.8-27B, un transformer multimodal con capacidad de procesamiento de imagen y texto, con aproximadamente 27.800 millones de parámetros. Según la model card, las primeras 15 capas se conservan sin ablación, mientras que el módulo de predicción multi-token (MTP) y el componente visual no han sido modificados. Se distribuye bajo licencia Apache 2.0 y está disponible en formato `safetensors` (55.6 GB en el repositorio). No se proporcionan datos sobre longitud de contexto, idiomas soportados ni cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16/float16 según el script de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una modificación del Qwen3.8-27B, un transformer causal multimodal que procesa tanto texto como imágenes. La técnica de *abliteration* consiste en identificar y anular las direcciones en el espacio de activaciones que correlacionan con la generación de rechazos, ajustando los pesos para que el modelo no produzca respuestas de negativa ante instrucciones potencialmente sensibles. En esta implementación concreta, las primeras 15 capas del modelo se mantienen intactas (sin ablación), mientras que el resto se modifica. El módulo de predicción multi-token (MTP) y el componente visual no se tocan.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). El autor indica que es una implementación "cruda" y de prueba de concepto, sin garantías de robustez ni validación exhaustiva.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base Qwen3.8-27B.
- Procesamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`).
- Soporte de chat multi-turno mediante la plantilla de chat de Qwen3.
- Capacidad de *thinking mode* (modo de razonamiento) si el modelo base lo incorpora, aunque no se confirma explícitamente.
- Al ser una versión abliterada, reduce la probabilidad de emitir rechazos ante solicitudes que el modelo original consideraría inapropiadas.
- No se especifican capacidades de *tool calling*, *function calling* ni de agentes en la información proporcionada.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar cómo la abliteración afecta al comportamiento del modelo en escenarios controlados.
- Generación de contenido creativo sin restricciones temáticas, como narrativa de ficción o diálogos para juegos de rol.
- Análisis de sesgos y comportamientos no deseados en modelos de lenguaje, comparando la versión abliterada con el original.
- Prototipado de aplicaciones que requieran respuestas sin filtros de contenido, siempre bajo supervisión humana.
- Evaluación de técnicas de *mechanistic interpretability* al comparar las capas ablacionadas con las intactas.
- Despliegue en entornos de desarrollo donde se necesite un modelo multimodal de gran tamaño con licencia permisiva (Apache 2.0) para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio (55.6 GB) sugiere que los pesos están en precisión bfloat16 o float16, lo que implica aproximadamente 55-56 GB de VRAM para cargar el modelo completo en memoria.
- Se recomienda al menos una GPU con 80 GB de VRAM (por ejemplo, NVIDIA A100 80GB, H100 80GB) para inferencia en precisión nativa.
- En GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) no es posible cargar el modelo completo; se necesitaría cuantización (no disponible en el repositorio) o usar técnicas de offloading a CPU.
- Opciones de despliegue: el script de ejemplo usa `transformers` con `device_map="auto"`, lo que permite distribución entre varias GPUs o CPU+GPU. También se menciona compatibilidad con Ollama (versión reciente) mediante el repositorio `huihui_ai/Qwen3.8-abliterated`, aunque no se especifican cuantizaciones GGUF.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27.8B | no disponible | Apache 2.0 | HuggingFace |
| spinochenza/Huihui-Qwen3.8-27B-abliterated | 27.8B | no disponible | Apache 2.0 | HuggingFace |
| Otros modelos abliterados de la familia Qwen (p.ej. huihui-ai) | variable | no disponible | Apache 2.0 | HuggingFace, Ollama |

No se dispone de comparativas de rendimiento ni de benchmarks entre estas opciones. La única diferencia conocida es la eliminación de rechazos mediante abliteración.

## Limitaciones y advertencias

- Es una implementación de prueba de concepto, no un modelo pulido para producción. El propio autor la califica de "cruda".
- La abliteración puede eliminar también comportamientos útiles de seguridad, aumentando el riesgo de generar contenido dañino, ilegal o éticamente problemático.
- No se han documentado sesgos específicos, pero al derivar de un modelo base no auditado, es probable que herede sesgos de género, raza o ideología.
- Riesgo de alucinación: no se han evaluado métricas de factualidad; el modelo puede inventar información con alta confianza.
- No se especifica la longitud de contexto máxima; su uso con contextos largos puede degradar el rendimiento.
- Solo se ofrecen pesos en `safetensors` sin cuantizaciones, lo que limita su uso en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de seguridad ni soporte.

## Enlaces

- [HuggingFace: spinochenza/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/spinochenza/Huihui-Qwen3.8-27B-abliterated)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers)
- [Ollama: huihui_ai/Qwen3.8-abliterated](https://ollama.com/huihui_ai/Qwen3.8-abliterated)
