# UrNinja/FLUX.1-Kontext-dev-int4

## Resumen

FLUX.1-Kontext-dev-int4 es una versión cuantizada (int4) del modelo black-forest-labs/FLUX.1-Kontext-dev, publicada por el usuario UrNinja en HuggingFace. Se trata de un modelo de difusión de imagen a imagen (image-to-image) que toma una imagen de entrada y un prompt textual, y devuelve una imagen editada. El repositorio usa la librería diffusers y el pipeline FluxKontextPipeline, e incorpora cuantización a 4 bits con bitsandbytes para reducir los requisitos de memoria frente al modelo original.

El objetivo del modelo es hacer viable la edición de imágenes con FLUX.1 Kontext en hardware más modesto: al reducir el peso del transformer a int4, baja el consumo de VRAM respecto a la versión bf16 del modelo base. El repositorio tiene un tamaño de 13,4 GB y declara 6.138.207.719 parámetros en sus ficheros safetensors. La model card incluye un ejemplo de uso con guidance_scale de 2,5 y 30 pasos de inferencia.

La relevancia de esta ficha es práctica: es una compilación de cuantización de un modelo de edición de imágenes de referencia, útil para quien quiera probar FLUX.1 Kontext en una GPU de consumo. No obstante, el repositorio no publica licencia, idiomas soportados ni resultados de benchmarks, y presenta discrepancias internas entre el nombre (int4) y las etiquetas (8-bit) que conviene tener en cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no la detalla; el modelo base FLUX.1-Kontext-dev emplea una arquitectura de transformer de difusión de flujo rectificado) |
| Parámetros totales | 6.138.207.719 (según metadatos safetensors del repositorio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; la entrada textual se procesa mediante un text encoder, sin contexto de tokens declarado) |
| Tipos de cuantización | int4 (según el nombre del repositorio); las etiquetas indican "8-bit". No se especifica el esquema completo (por ejemplo, si es NF4 o un formato de bitsandbytes concreto) |
| Idiomas soportados | no disponible (el ejemplo de la model card usa prompts en inglés) |
| Licencia | no disponible en el repositorio; el modelo base black-forest-labs/FLUX.1-Kontext-dev se distribuye bajo licencia no comercial de FLUX.1 [dev] |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

No se dispone de información sobre el proceso de entrenamiento en la documentación proporcionada. El repositorio es una compilación de cuantización del modelo base black-forest-labs/FLUX.1-Kontext-dev, no un modelo entrenado desde cero: no hay datos sobre número de tokens, composición del dataset, etapas de alineación (RLHF/DPO) ni innovaciones de entrenamiento atribuibles a esta versión. La tarea del pipeline es image-to-image, es decir, edición de imágenes guiada por texto.

La aportación técnica de esta versión es la cuantización a int4 mediante bitsandbytes, que reduce el tamaño de los pesos del transformer y, por tanto, la VRAM necesaria en inferencia. La model card indica que las dependencias requeridas incluyen la versión de desarrollo de diffusers (instalada desde el repositorio de GitHub), bitsandbytes, transformers, sentencepiece y protobuf. El ejemplo de uso carga el modelo con FluxKontextPipeline.from_pretrained con torch_dtype en bfloat16, lo que sugiere que los pesos se cargan en bf16 sobre una cuantización en 4 bits, un patrón habitual en despliegues con bitsandbytes.

## Capacidades

- Edición de imágenes a partir de una imagen de entrada y un prompt textual (image-to-image).
- Generación de variaciones sobre una imagen de entrada, como cambios de vestuario, estilo o atributos, según el ejemplo de la model card ("woman wearing dress").
- Control de la fuerza de edición mediante guidance_scale y del coste de inferencia mediante num_inference_steps.
- Integración con el ecosistema diffusers a través de FluxKontextPipeline.
- Inferencia en GPU con soporte de bfloat16 y cuantización int4.
- Compatibilidad declarada con text-generation-inference como etiqueta del repositorio (aunque el uso principal documentado es diffusers).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio, vídeo ni modos de pensamiento (thinking).
- No se documentan capacidades multilingües; el único ejemplo emplea inglés.

## Casos de uso

- Edición de imágenes en local en una GPU de consumo: al estar cuantizado a int4, permite ejecutar FLUX.1 Kontext en tarjetas con menos VRAM que la versión bf16, útil para prototipado e investigación de edición de imágenes sin depender de la nube.
- Retoque de producto en comercio electrónico: modificar el fondo, el color o el entorno de una fotografía de producto conservando el sujeto, encadenando prompts de edición sobre la imagen original.
- Creación de material gráfico para marketing: generar variantes de una imagen base (estilismo, iluminación, encuadre) para probar conceptos visuales de forma rápida en un pipeline automatizado.
- Prototipado de pipelines de difusión con diffusers: servir como punto de partida para experimentar con cuantización, schedulers, números de pasos y escalas de guía antes de escalar a un despliegue mayor.
- Automatización de tareas de edición por lotes: aplicar una misma transformación (por ejemplo, uniformar estilos o fondos) a conjuntos de imágenes mediante scripts que invoquen el pipeline de forma repetida.
- Investigación en cuantización de modelos de difusión: comparar la calidad de la salida int4 frente al modelo base en bf16 para medir la degradación introducida por la cuantización.
- Integración en demos y aplicaciones web: al cargarse con diffusers, puede envolverse en un servicio de inferencia para un editor de imágenes conversacional, sujeto a los requisitos de hardware del apartado siguiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de imagen (FID, CLIP score, similitud con la imagen de entrada), ni comparativas cuantitativas frente al modelo base sin cuantizar. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 13,4 GB en disco, por lo que, con los text encoders y las activaciones, se recomienda un mínimo orientativo en el rango de 12-16 GB de VRAM; la cifra exacta depende de si se cuantizan también los encoders y del tamaño del lote.
- GPU recomendadas: NVIDIA A100 (40/80 GB) y H100 para despliegues de producción o lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones de gama alta para uso individual.
- GPU de consumo: es probable que quepa en tarjetas de 16 GB (por ejemplo, RTX 4080) de forma ajustada y en 24 GB con holgura, gracias a la cuantización int4; en 8-12 GB el resultado no está garantizado y requeriría cuantización adicional o descarga de componentes.
- Opciones de despliegue: diffusers con FluxKontextPipeline (uso documentado en la model card), bitsandbytes para la cuantización int4, y la etiqueta text-generation-inference presente en el repositorio como posible vía de servicio.
- Latencia y throughput: no disponibles. Dependen fuertemente del número de pasos de inferencia (el ejemplo usa 30) y de la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo de tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UrNinja/FLUX.1-Kontext-dev-int4 | 6.138.207.719 (safetensors del repo) | Edición de imagen (image-to-image) | Imagen + prompt | no disponible en el repo | HuggingFace (diffusers) |
| black-forest-labs/FLUX.1-Kontext-dev | no disponible en la información proporcionada (el modelo base se describe públicamente como transformer de 12B) | Edición de imagen (image-to-image) | Imagen + prompt | Licencia no comercial de FLUX.1 [dev] | HuggingFace (diffusers) |
| black-forest-labs/FLUX.1-dev | no disponible en la información proporcionada | Generación de imagen a partir de texto | Prompt | Licencia no comercial de FLUX.1 [dev] | HuggingFace |
| Modelos de edición de imagen alternativos (por ejemplo, Qwen-Image-Edit) | no disponible | Edición de imagen | Imagen + prompt | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a formato, tarea y licencia.

## Limitaciones y advertencias

- Licencia sin especificar en el repositorio: al derivar de black-forest-labs/FLUX.1-Kontext-dev, es probable que herede la licencia no comercial de FLUX.1 [dev], lo que limitaría el uso comercial. Debe verificarse antes de cualquier despliegue en producción.
- Discrepancia entre el nombre y las etiquetas: el repositorio se llama "int4" pero está etiquetado como "8-bit", lo que genera incertidumbre sobre el esquema de cuantización real aplicado.
- Riesgo de degradación por cuantización: al ser una versión int4 del modelo base, puede presentar pérdida de calidad, artefactos o menor fidelidad a la imagen de entrada en comparación con la versión bf16. No se aportan métricas que cuantifiquen esa degradación.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede introducir elementos no presentes en la imagen original o alterar zonas no solicitadas por el prompt.
- Idiomas: no se declaran idiomas soportados; los ejemplos usan inglés y no hay evidencia de buen rendimiento con prompts en castellano.
- Dependencias de desarrollo: la model card indica instalar diffusers desde el repositorio de GitHub, lo que implica usar una versión no estable y puede romper la reproducibilidad en producción.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso ni validación por parte de la comunidad; conviene tratar la compilación con cautela.
- Sin benchmarks: no hay evidencia publicada de rendimiento ni comparativas con el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UrNinja/FLUX.1-Kontext-dev-int4
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
- Referencia de implementación citada en la model card (diffusers desde GitHub): https://github.com/huggingface/diffusers
- Modelos FLUX.1 de Black Forest Labs: https://huggingface.co/black-forest-labs
