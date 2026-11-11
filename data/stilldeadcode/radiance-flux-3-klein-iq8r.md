# StillDeadcode/radiance-flux-3-klein-iq8r

## Resumen

Radiance Flux 3 Klein IQ8R es una cuantizacion de 8 bits del modelo de difusion text-to-image FLUX.3 Image Klein de Black Forest Labs, publicada por el usuario StillDeadcode bajo el ecosistema Radiance. El repositorio aplica un esquema de cuantizacion INT8 con pesos y activaciones de 8 bits (W8A8), transformada de Hadamard e implementacion optimizada para ROCm sobre GPUs AMD de arquitectura RDNA4. El objetivo es reducir el peso del modelo original (el repo ocupa 10,0 GB) y habilitar su ejecucion en hardware AMD consumer, un terreno historicamente menos cubierto que el ecosistema CUDA.

El modelo base, FLUX.3 Image Klein, es un modelo de difusion para generacion y edicion de imagenes. Esta ficha se centra en la version cuantizada, cuyos detalles especificos de arquitectura, parametros y contexto no estan documentados en la informacion disponible del repositorio. La publicacion no incluye model card con especificaciones tecnicas, y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es doble: por un lado, documenta una via de despliegue de FLUX.3 en GPUs AMD RDNA4 mediante cuantizacion INT8; por otro, advierte de que se trata de un artefacto sin validacion publica, con acceso restringido y con datos tecnicos incompletos, lo que obliga a tratarlo con cautela en cualquier evaluacion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image derivado de FLUX.3 Image Klein) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 con transformada de Hadamard (IQ8R) |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (etiquetada como "other" en los tags) |
| Formato de pesos | no disponible (libreria Radiance; tamano del repo 10,0 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base FLUX.3 Image Klein en la informacion proporcionada: no se detallan el tipo de backbone (transformer de difusion, DiT u otro), el numero de parametros ni los datos de entrenamiento. Lo unico documentado es que se trata de un modelo de difusion para text-to-image y edicion de imagenes.

La innovacion tecnica de esta publicacion reside en la cuantizacion: se aplica un esquema INT8 W8A8 (pesos y activaciones en 8 bits) con transformada de Hadamard, orientado a mejorar la estabilidad numerica y la eficiencia en inferencia sobre ROCm. El stack esta optimizado para GPUs AMD RDNA4, lo que sugiere uso de kernels especificos para esa arquitectura. No se documentan datos de entrenamiento, fine-tuning, RLHF ni procesos de alineacion adicionales.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), segun el pipeline declarado en el repositorio.
- Edicion de imagenes (image-editing), segun los tags del repositorio.
- Inferencia cuantizada en INT8 W8A8 sobre ROCm, pensada para GPUs AMD RDNA4.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo AMD RDNA4: el modelo permite ejecutar un pipeline text-to-image de FLUX.3 en GPUs AMD consumer mediante cuantizacion INT8, reduciendo el peso a un repo de 10,0 GB.
- Prototipado de edicion de imagenes: los tags indican soporte de image-editing, por lo que puede emplearse para experimentar con flujos de edicion guiada por texto en entornos de investigacion.
- Evaluacion de cuantizacion INT8 en difusion: util para investigadores que quieran medir la perdida de calidad de un esquema W8A8 con Hadamard frente al modelo base en FP16/BF16.
- Benchmarking de ROCm frente a CUDA: sirve para comparar throughput y latencia de un mismo modelo de difusion en stacks AMD y NVIDIA.
- Despliegue en entornos con VRAM limitada: la cuantizacion de 8 bits reduce el footprint respecto al modelo original, lo que puede facilitar su ejecucion en GPUs con menos memoria.
- Pruebas de integracion con la libreria Radiance: caso de uso orientado a validar la API y los kernels de Radiance en pipelines de generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo ocupa 10,0 GB, lo que da una cota inferior orientativa del peso en disco, no de la VRAM necesaria en ejecucion.
- GPU recomendadas: GPUs AMD con arquitectura RDNA4, segun los tags del repositorio (rocm, amd, rdna4).
- Compatibilidad con GPUs consumer: si, orientado a RDNA4 consumer; no se especifican modelos concretos.
- Opciones de despliegue: libreria Radiance con backend ROCm; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son stacks orientados a LLM, no a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Radiance Flux 3 Klein IQ8R | no disponible | no disponible | INT8 W8A8 + Hadamard | flux-kommunity-license | Gated en Hugging Face |
| FLUX.3 Image Klein (base) | no disponible | no disponible | FP16/BF16 (presumible) | flux-kommunity-license | Repositorio oficial de Black Forest Labs |
| Otras cuantizaciones de FLUX.3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones suficientes para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto sin validacion publica: cero descargas y cero likes, sin model card tecnica ni resultados de calidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia flux-kommunity-license: impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion.
- La cuantizacion INT8 W8A8 puede degradar la calidad de imagen respecto al modelo base en FP16/BF16; no se aportan metricas de esa perdida.
- Dependencia de hardware AMD RDNA4 y del stack ROCm: no es portable a CUDA sin recompilacion o conversion.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos del modelo base en la informacion disponible.
- El modelo base FLUX.3 Image Klein puede tener sus propias limitaciones de sesgo y seguridad no reflejadas en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/StillDeadcode/radiance-flux-3-klein-iq8r
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- No se han encontrado en la informacion proporcionada papers, blogs, repos de codigo ni demos adicionales.
