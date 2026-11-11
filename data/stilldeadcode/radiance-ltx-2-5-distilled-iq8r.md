# StillDeadcode/radiance-ltx-2.5-distilled-iq8r

## Resumen

Radiance LTX-2.5 Distilled IQ8R es una cuantización de 8 bits del modelo de generación de vídeo LTX-2.5 de Lightricks, publicada por el usuario StillDeadcode bajo el paraguas del proyecto Radiance. El objetivo es ejecutar el modelo base en hardware AMD con arquitectura RDNA4 mediante un formato de pesos INT8 con activaciones INT8 (W8A8) y una transformada de Hadamard, empaquetado en el formato propietario IQ8R que consume la librería `radiance`. El modelo base, LTX-2.5-Diffusers, es un modelo de difusión para text-to-video, image-to-video y text-to-audio-video.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune, sino de un artefacto de cuantización orientado a un stack de inferencia concreto (ROCm sobre GPUs AMD RDNA4). El repositorio pesa 39,6 GB y está sujeto a acceso restringido en Hugging Face, por lo que requiere aceptar las condiciones del modelo base antes de descargarlo. No se han publicado métricas de calidad, benchmarks ni detalles del proceso de calibración en la información disponible.

Al no disponer de datos sobre el número de parámetros del modelo base, la longitud de contexto, los idiomas soportados ni el pipeline de entrenamiento, buena parte de las especificaciones de esta ficha se marcan como no disponibles. La información se limita a los metadatos del repositorio y a las etiquetas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión para generación de vídeo (base: Lightricks/LTX-2.5-Diffusers); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 con transformada de Hadamard, formato IQ8R (según etiquetas del repo) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (etiqueta `license:other`) |
| Formato de pesos | formato propietario IQ8R consumido por la librería `radiance`; no se declara safetensors ni GGUF |
| Tamano del repositorio | 39,6 GB |
| Pipeline declarado | text-to-video |
| Libreria | radiance |
| Hardware objetivo | AMD ROCm, arquitectura RDNA4 (etiquetas `rocm`, `amd`, `rdna4`) |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Modelo base | Lightricks/LTX-2.5-Diffusers |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un entrenamiento. El modelo subyacente es LTX-2.5-Diffusers de Lightricks, un modelo de difusión para vídeo que, según las etiquetas del repositorio, cubre text-to-video, image-to-video y text-to-audio-video. No se dispone de información sobre el número de parámetros, la variante de backbone (transformer de difusión, DiT u otra), el esquema de atención ni los datos de entrenamiento del modelo base en la información proporcionada.

La innovación técnica declarada por el autor es el esquema de cuantización: pesos y activaciones en INT8 (W8A8) combinados con una transformada de Hadamard, presumiblemente para reducir valores atípicos antes de la cuantización y mejorar la fidelidad numérica, empaquetados en el formato IQ8R. Este formato está pensado para la librería `radiance`, orientada a ROCm y a GPUs AMD RDNA4. No se documentan en el repositorio el conjunto de calibración, el error de reconstrucción ni comparaciones de calidad frente al modelo en precisión completa.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según el pipeline declarado.
- Generación de vídeo a partir de imagen (image-to-video), según las etiquetas del repositorio.
- Generación conjunta de texto, audio y vídeo (text-to-audio-video), según las etiquetas del repositorio.
- Ejecución en GPUs AMD con ROCm y arquitectura RDNA4 mediante el formato IQ8R y la librería `radiance`.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso y modo thinking: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible.

## Casos de uso

- Prototipado de generación de vídeo en estaciones de trabajo AMD RDNA4: el formato IQ8R y la librería `radiance` permiten cargar el modelo en GPUs AMD con ROCm sin depender de CUDA, lo que facilita evaluar LTX-2.5 en entornos donde no hay GPUs NVIDIA.
- Reducción de huella de memoria en inferencia: al usar pesos y activaciones INT8, el modelo ocupa aproximadamente la mitad que una versión en FP16/BF16 del mismo modelo base, lo que permite ajustarlo en GPUs con menos VRAM dentro del ecosistema RDNA4.
- Generación de clips para previsualización de guiones: el pipeline text-to-video permite convertir descripciones textuales en vídeo para revisiones rápidas de storyboard.
- Animación de imágenes fijas: el soporte image-to-video permite dar movimiento a ilustraciones o fotogramas clave para vídeos explicativos o contenido para redes.
- Generación de vídeo con audio asociado: la etiqueta text-to-audio-video sugiere la posibilidad de producir clips con pista de audio en una sola pasada, útil para demos y contenido promocional.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de un esquema W8A8 con Hadamard frente al modelo LTX-2.5 original en precisión completa, dentro de un pipeline de investigación sobre cuantización de modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 39,6 GB en INT8, por lo que se requiere una GPU con al menos esa capacidad de memoria para cargar los pesos completos, más el espacio adicional para activaciones y buffers de difusión.
- GPU recomendadas: GPUs AMD con arquitectura RDNA4 y soporte ROCm, según las etiquetas del repositorio. No se especifican modelos concretos.
- Compatibilidad con GPUs de consumo: no confirmada. Dado el tamaño del repositorio, quedaría limitado a tarjetas con 40 GB o más de VRAM, salvo que la librería `radiance` permita carga por capas o descarga parcial.
- Opciones de despliegue: librería `radiance` (ROCm). No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son stacks habituales para modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Radiance LTX-2.5 Distilled IQ8R | no disponible | no disponible | INT8 W8A8 (IQ8R) | ltx-2.x-community-license-agreement | gated, Hugging Face |
| Lightricks/LTX-2.5-Diffusers (base) | no disponible | no disponible | presumiblemente FP16/BF16 | ltx-2.x-community-license-agreement | Hugging Face |
| Otras cuantizaciones de LTX-2.5 | no disponible | no disponible | no disponible | depende del publicador | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de cuantización, no un modelo original: la calidad de generación puede degradarse respecto al modelo base en FP16/BF16; no se publican métricas que cuantifiquen esa pérdida.
- Acceso restringido: requiere aceptar la licencia en Hugging Face y cumplir los términos del modelo base de Lightricks.
- Licencia comunitaria: la ltx-2.x-community-license-agreement puede imponer restricciones al uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- Dependencia de un stack específico: el formato IQ8R solo es consumible por la librería `radiance` sobre ROCm y RDNA4, lo que limita la portabilidad a otros entornos (CUDA, CPU, GPUs de generaciones anteriores).
- Sin datos de sesgos, alucinación o calidad multilingüe: no disponibles en la información proporcionada.
- Sin métricas de rendimiento ni de calidad publicadas: no hay benchmarks que permitan validar el artefacto frente al modelo base u otras cuantizaciones.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/StillDeadcode/radiance-ltx-2.5-distilled-iq8r
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
