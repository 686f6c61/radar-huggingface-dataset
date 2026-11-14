# technicallyAnnoyed/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje nativamente multimodal y orientado a tareas agénticas, publicado con pesos abiertos por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, según su model card, es el modelo más capaz de la clase 3T de la compañía. Está construido mediante post-entrenamiento sobre Kimi K3 con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios, e incorpora una ventana de contexto de un millón de tokens. La arquitectura es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token.

El modelo se distribuye con pesos en formato safetensors y cuantización de 8 bits mediante `compressed-tensors`, con un repositorio de aproximadamente 1,5 TB. Su pipeline declarado es `image-text-to-text`, lo que confirma la entrada de imágenes además de texto. La licencia es propia (`kimi-k3.1-pro`), catalogada como "other" en Hugging Face, por lo que las condiciones de uso comercial deben consultarse en el fichero LICENSE del repositorio oficial.

La relevancia de esta ficha radica en que el checkpoint disponible en `technicallyAnnoyed/Kimi-K3.1-Pro` es una republicación de un modelo de Moonshot AI, con solo 25 descargas y sin likes en el momento de la consulta. Es importante distinguir entre el modelo original y esta copia, ya que la información técnica procede de la model card del autor original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer con capas de atención KDA y Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 según safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (`compressed-tensors`); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (catalogada como "other") |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura es un MoE con 93 capas, de las cuales una es densa. La composición de capas de atención es de 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (DeepSeek Sparse Attention, según la nomenclatura de la model card), con una dimensión de atención de 7168 y 96 cabezas. El componente DSA emplea 32 cabezas de índice con dimensión 128 y un top-K de 2048. El MoE cuenta con 896 expertos, de los que se seleccionan 16 por token, más 2 expertos compartidos; la dimensión latente del MoE es 3584 y la dimensión oculta por experto es 3072. El vocabulario es de 160.000 tokens.

El entrenamiento parte de Kimi K3 y aplica post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios. La model card no especifica el número de tokens de preentrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO de forma explícita; únicamente menciona el RL conjunto como mecanismo de post-entrenamiento. La innovación técnica destacable es la combinación de atención KDA con Gated DSA, orientada a sostener el contexto de un millón de tokens con un coste de atención reducido.

## Capacidades

- Generación de texto y razonamiento en dominios diversos, con mejoras declaradas en codificación, creación 3D, investigación financiera y precisión factual.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que habilita tareas de visión y comprensión multimodal.
- Capacidades agénticas: la model card describe el modelo como "agentic model", orientado a flujos de múltiples pasos.
- Soporte de contexto largo de hasta 1.000.000 de tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingües: no se detallan los idiomas concretos en la información disponible.
- No se confirma en la información proporcionada el soporte explícito de tool calling o function calling, ni modos de pensamiento (thinking mode) o audio.

## Casos de uso

- Análisis de repositorios completos: con un millón de tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas sobre arquitectura, dependencias y deuda técnica sin fragmentar el código en trozos.
- Investigación financiera asistida: la model card cita mejoras en investigación financiera, por lo que encaja en la extracción y síntesis de informes, memorandos y series de datos de gran volumen.
- Creación 3D y pipelines de diseño: la mejora declarada en creación 3D sugiere su uso en la generación y revisión de descripciones, scripts y assets en herramientas de modelado.
- Agentes autónomos multi-paso: su orientación agéntica y el entrenamiento con RL en dominios downstream lo hacen apto para orquestar tareas encadenadas con planificación y verificación.
- Asistentes multimodales: al aceptar imagen y texto, puede emplearse en atención al cliente que reciba capturas, diagramas o documentos escaneados junto con la consulta.
- Revisión documental legal o técnica: el contexto de un millón de tokens permite procesar contratos o especificaciones completas y localizar cláusulas o inconsistencias.
- Generación de código en producción: aunque no se confirma tool calling, su capacidad de codificación declarada permite integrarlo en revisión de pull requests y generación de tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 billones de parámetros en 8 bits, el peso ronda los 2,8 TB; incluso con cuantizaciones más agresivas no cabe en una sola GPU. Se requiere despliegue multi-nodo.
- GPU recomendadas: clústeres de H100 o H200 con interconexión de alta velocidad (NVLink/InfiniBand); A100 de 80 GB en configuraciones multi-nodo.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer, dado el tamaño del checkpoint (repositorio de 1561,4 GB).
- Opciones de despliegue: la librería declarada es `transformers` con `custom_code`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1.000.000 | `kimi-k3.1-pro` (other) | Pesos abiertos en HF |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El checkpoint de `technicallyAnnoyed/Kimi-K3.1-Pro` es una republicación no oficial; conviene verificar la integridad y procedencia frente al repositorio original de Moonshot AI.
- La licencia `kimi-k3.1-pro` está catalogada como "other": es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- No se detallan los idiomas soportados, lo que impide garantizar un rendimiento uniforme fuera del inglés o del chino.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card menciona mejoras en precisión factual, pero no se aportan métricas que las cuantifiquen.
- El tamaño del repositorio (1561,4 GB) y los requisitos de hardware limitan su uso a infraestructuras de gran escala.
- No se confirma el soporte de tool calling ni de modos de razonamiento explícitos, lo que condiciona el diseño de agentes.
- El modelo requiere `custom_code` y `compressed-tensors`, lo que puede implicar dependencias específicas y menor compatibilidad con herramientas estándar.

## Enlaces

- [Hugging Face: technicallyAnnoyed/Kimi-K3.1-Pro](https://huggingface.co/technicallyAnnoyed/Kimi-K3.1-Pro)
- [Hugging Face: Moonshot AI](https://huggingface.co/moonshotai)
- [Chat de Kimi K3.1 Pro](https://www.kimi.ai)
- [Homepage de Moonshot AI](https://www.moonshot.ai)
- [Blog técnico de Kimi K3.1 Pro](https://www.kimi.ai/blog/kimi-k3-1-pro)
- [Quickstart de la API](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart)
- [X (Twitter) de Kimi](https://twitter.com/kimi_moonshot)
- [Discord de Kimi](https://discord.gg/TYU2fdJykW)
- [ModelScope de Moonshot AI](https://modelscope.cn/organization/moonshotai)
- [Licencia del modelo](https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE)
