# StillDeadcode/radiance-ltx-2.5-iq8r

## Resumen

Radiance LTX-2.5 IQ8R es una cuantización de 8 bits del modelo de generación de vídeo LTX-2.5 de Lightricks, publicada por el usuario StillDeadcode bajo el paraguas del proyecto Radiance. El modelo base es `Lightricks/LTX-2.5-Diffusers`, un modelo de difusión para text-to-video, image-to-video y text-to-audio-video. Esta variante aplica una cuantización W8A8 con transformada de Hadamard (etiquetada como IQ8R) orientada específicamente a hardware AMD ROCm sobre arquitecturas RDNA4, lo que la convierte en una de las pocas alternativas cuantizadas pensadas para GPUs AMD de consumo en el ámbito de la generación de vídeo.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización agresiva (INT8 en pesos y activaciones) de un modelo de vídeo de gran tamaño, un terreno donde las cuantizaciones tradicionales suelen degradar la calidad temporal; por otro, expone el ecosistema Radiance como librería de inferencia alternativa a Diffusers o ComfyUI, con soporte explícito para ROCm. El repositorio ocupa 39,6 GB y requiere acceso restringido (gated) en Hugging Face.

No se dispone de información pública sobre el número de parámetros del modelo base, la longitud de contexto en tokens ni los idiomas soportados en la información proporcionada. La licencia es la LTX-2.x Community License Agreement del modelo original, con las restricciones que esta impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (base: Lightricks/LTX-2.5-Diffusers); cuantización W8A8 con transformada de Hadamard (IQ8R) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones), esquema IQ8R con Hadamard |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido/gated) |
| Formato de pesos | no disponible (librería `radiance`; repo de 39,6 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, LTX-2.5, es un modelo de difusión para generación de vídeo (y audio-vídeo) desarrollado por Lightricks. Esta variante no reentrena el modelo: aplica una cuantización post-entrenamiento de tipo W8A8 (8 bits en pesos y activaciones) con una transformada de Hadamard previa a la cuantización, técnica que rota las activaciones para reducir outliers y mejorar la fidelidad numérica en INT8. El sufijo IQ8R y los tags `rocm`, `amd`, `rdna4` indican que los kernels están optimizados para GPUs AMD con arquitectura RDNA4 bajo ROCm.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. Tampoco se detalla la innovación técnica del modelo original más allá de su naturaleza de difusión multimodal (texto, imagen y audio hacia vídeo).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Generación conjunta de audio y vídeo a partir de texto (text-to-audio-video).
- Cuantización INT8 W8A8 con Hadamard para reducir el uso de memoria frente al modelo en precisión completa.
- Ejecución optimizada en GPUs AMD RDNA4 mediante ROCm a través de la librería `radiance`.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de clips promocionales para redes sociales: el modelo puede producir vídeo a partir de una descripción textual, adecuado para equipos que necesitan iterar creatividades sin depender de rodaje.
- Animación de imágenes fijas (image-to-video): útil para convertir ilustraciones o fotografías en clips cortos con movimiento, por ejemplo en previsualización de storyboards.
- Prototipado de vídeo con audio sincronizado: la variante text-to-audio-video permite generar una primera versión con banda sonora para validar una idea antes de la producción final.
- Despliegue en estaciones de trabajo AMD: al estar cuantizado para ROCm y RDNA4, encaja en equipos con GPUs Radeon de última generación donde otras cuantizaciones no están optimizadas.
- Investigación en cuantización de modelos de difusión: sirve como referencia para estudiar el impacto de W8A8 con Hadamard en la calidad temporal de vídeo generado.
- Generación de material de previsualización en pipelines de VFX: permite obtener clips de referencia rápidos que luego se refinan en herramientas de postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 39,6 GB, por lo que se requiere una GPU con al menos esa capacidad o descarga por capas si la librería lo permite.
- GPU recomendadas: GPUs AMD con arquitectura RDNA4 (tags `rdna4`, `rocm`, `amd`). No se documentan GPUs NVIDIA compatibles con esta variante.
- ¿Cabe en GPU de consumo? No confirmado; dependerá del tamaño real del modelo base y de si la librería `radiance` soporta offloading.
- Opciones de despliegue: librería `radiance` (según la metadata del repo). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no están orientados a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Hardware objetivo | Licencia | Acceso |
|---|---|---|---|---|---|
| Radiance LTX-2.5 IQ8R | Difusión vídeo/audio | INT8 W8A8 + Hadamard | AMD ROCm / RDNA4 | LTX-2.x Community | Gated |
| Lightricks/LTX-2.5-Diffusers | Difusión vídeo/audio | FP (original) | GPU genérica | LTX-2.x Community | Público/gated según repo |
| Otras cuantizaciones de LTX-2.5 | Difusión vídeo/audio | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia LTX-2.x Community: impone restricciones específicas de uso comercial que deben revisarse antes de integrar el modelo en productos.
- La cuantización INT8 puede degradar la coherencia temporal y el detalle fino del vídeo frente al modelo en precisión completa; no se han publicado evaluaciones de calidad en esta ficha.
- Compatibilidad limitada a hardware AMD ROCm/RDNA4 según los tags; no se garantiza funcionamiento en NVIDIA u otras plataformas.
- Riesgo de alucinación visual y de artefactos en escenas complejas, inherente a los modelos de difusión de vídeo.
- Sin información sobre sesgos, idiomas soportados ni límites de contexto; no apto para producción sin evaluación previa.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/radiance-ltx-2.5-iq8r
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Licencia LTX-2.x Community License Agreement: no disponible enlace directo en la información proporcionada
- Librería `radiance`: no disponible enlace en la información proporcionada
