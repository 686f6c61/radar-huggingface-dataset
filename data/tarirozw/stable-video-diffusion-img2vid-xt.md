# tarirozw/stable-video-diffusion-img2vid-xt

## Resumen

Stable Video Diffusion Image-to-Video XT (SVD-XT) es un modelo de difusion latente para generar video a partir de una imagen fija de condicionamiento. Lo desarrolla Stability AI y es un refinamiento del SVD Image-to-Video de 14 fotogramas, ampliado a 25 fotogramas a resolucion 576x1024. El repositorio aqui descrito es una redistribucion alojada por el usuario `tarirozw` en Hugging Face, no el repositorio oficial de Stability AI, aunque los pesos y la model card corresponden al modelo original.

El modelo resuelve el problema de la animacion de imagenes estaticas: dada una fotografia o ilustracion, produce un clip corto de hasta cuatro segundos con movimiento coherente. Es relevante porque fue uno de los primeros modelos abiertos de image-to-video con calidad competitiva frente a sistemas cerrados como GEN-2 de Runway o PikaLabs, y porque su arquitectura y pesos estan disponibles para investigacion y despliegue local mediante la libreria `diffusers`.

Tecnicamente es un modelo de difusion con un UNet de aproximadamente 1.524 millones de parametros (1.52 B), acompanado de un autoencoder variational (VAE) con decodificador afinado para consistencia temporal. El contexto de generacion no es textual sino visual: una unica imagen de condicionamiento del mismo tamano que los fotogramas de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente con UNet 3D y VAE con decodificador temporal |
| Parametros totales | 1.524.623.082 (dato del archivo safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionamiento por imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo sin entrada de texto) |
| Licencia | stable-video-diffusion-community (uso no comercial bajo LICENSE.md; uso comercial requiere licencia de Stability AI) |
| Formato de pesos | safetensors (pipeline `StableVideoDiffusionPipeline` de diffusers) |

## Arquitectura y entrenamiento

SVD-XT es un modelo de difusion latente. Un codificador VAE comprime los fotogramas a un espacio latente y un UNet con capas temporales aprende a eliminar ruido condicionado por el primer fotograma (la imagen de entrada). El decodificador VAE del modelo original se afino para mejorar la consistencia temporal entre fotogramas; el repositorio incluye ademas el decodificador estandar por fotograma (`svd_xt_image_decoder.safetensors`). La salida son 25 fotogramas a 576x1024, partiendo de un fotograma de contexto del mismo tamano.

El modelo se afinó a partir del SVD Image-to-Video de 14 fotogramas. Segun la model card, el entrenamiento de los checkpoints SVD requirio aproximadamente 200.000 horas de A100 80GB, mayoritariamente sobre 48 nodos de 8 A100, con unas emisiones estimadas de ~19.000 kg de CO2 equivalente y un consumo de ~64.000 kWh. La preparacion de datos no involucro trabajo humano explicito: los metodos de filtrado descritos en el paper se encargan del control de calidad y los filtros NSFW internos del filtrado de seguridad. La evaluacion humana se realizo con evaluadores contratados externamente (Amazon SageMaker, Mechanical Turk, Prolific), remunerados a 12 USD/hora.

## Capacidades

- Generacion de video a partir de una imagen fija: clips de 25 fotogramas a 576x1024 (hasta ~4 segundos).
- Animacion con movimiento coherente derivado del contenido de la imagen de condicionamiento.
- Decodificacion con dos variantes de VAE: decodificador afinado temporalmente y decodificador estandar por fotograma.
- No soporta condicionamiento por texto: no hay prompt textual ni control semantico de la generacion.
- No soporta tool calling, function calling ni comportamiento agentico.
- No dispone de modo thinking, vision de entrada multiple, audio ni otras capacidades multimodales mas alla de la imagen de condicionamiento.
- Capacidades multilingues: no aplica, al no existir entrada ni salida de texto.

## Casos de uso

- Animacion de ilustraciones y arte conceptual: el modelo convierte un dibujo o render estatico en un clip corto con movimiento sutil, util en flujos de previsualizacion de diseno.
- Pruebas de concepto para produccion audiovisual: generar animaticos rapidos a partir de fotogramas clave antes de invertir en renderizado 3D.
- Investigacion sobre modelos generativos de video: el checkpoint permite estudiar sesgos, limitaciones y comportamiento de la difusion latente aplicada a video.
- Creacion de contenido para redes sociales: clips de hasta cuatro segundos a partir de una imagen promocional, con la limitacion de que el movimiento puede ser escaso.
- Evaluacion de seguridad de modelos generativos: probar la robustez del modelo frente a entradas que intenten producir contenido no deseado, dentro de las areas de investigacion que permite la licencia.
- Herramientas educativas y creativas: demostraciones interactivas donde el usuario sube una imagen y obtiene una animacion breve, integradas via `diffusers`.
- Prototipado de pipelines de postproduccion: usar la salida como capa base para estabilizacion, interpolacion de fotogramas o composicion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye unicamente un estudio de preferencia humana frente a GEN-2 (Runway) y PikaLabs, en el que SVD Image-to-Video resulta preferido por los evaluadores en calidad de video; no se proporcionan las cifras concretas de dicho estudio en la informacion disponible.

En cuanto a rendimiento de inferencia, la model card indica que con los ajustes por defecto en el momento del lanzamiento SVD tarda ~100 s por generacion y SVD-XT ~180 s en una A100 de 80 GB, y que existen optimizaciones para intercambiar calidad, memoria y velocidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; la referencia de la model card es una A100 de 80 GB para los ajustes por defecto. El repositorio ocupa 32,6 GB, lo que da una idea del peso de los pesos en precision completa.
- GPU recomendadas: A100 80 GB como referencia oficial; H100 como alternativa de mayor throughput. No se documentan cifras para consumer GPU.
- Viabilidad en GPU de consumo: no disponible en la informacion proporcionada. El tamano de los pesos y el coste de inferencia reportado sugieren que no es un modelo ligero, pero no hay datos oficiales sobre ejecucion en RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: pipeline `StableVideoDiffusionPipeline` de `diffusers`; el repositorio oficial `Stability-AI/generative-models` implementa entrenamiento e inferencia con los frameworks de difusion mas habituales.
- Latencia y throughput: ~180 s por generacion de 25 fotogramas en A100 80 GB con ajustes por defecto (dato de la model card). No se documentan optimizaciones concretas ni cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVD-XT (este repo) | ~1,52 B | 25 fotogramas, 576x1024 | Imagen | stable-video-diffusion-community | Pesos abiertos en HF |
| GEN-2 (Runway) | no disponible | Video corto | Texto e imagen | Propietaria | Servicio comercial |
| PikaLabs | no disponible | Video corto | Texto e imagen | Propietaria | Servicio comercial |

La comparacion se limita a lo documentado en la model card: SVD-XT es preferido por evaluadores humanos frente a GEN-2 y PikaLabs en calidad de video, pero no se dispone de parametros, contexto ni resultados numericos de los modelos propietarios en la informacion proporcionada.

## Limitaciones y advertencias

- Los videos generados son cortos (menos de 4 segundos) y el modelo no alcanza fotorrealismo perfecto.
- Puede generar videos sin movimiento o con paneos de camara muy lentos.
- No se puede controlar mediante texto: no acepta prompts.
- No renderiza texto legible.
- Las caras y las personas en general pueden generarse de forma incorrecta.
- La parte de autoencoding del modelo es con perdida (lossy), lo que afecta a la fidelidad de los detalles.
- El modelo no fue entrenado para representaciones factuales o veraces de personas o eventos; su uso para ese fin queda fuera de alcance.
- Licencia: el uso no comercial y de investigacion se rige por LICENSE.md; el uso comercial requiere licencia aparte de Stability AI (https://stability.ai/license). Debe respetarse la politica de uso aceptable de Stability AI.
- Redistribucion no oficial: este repositorio pertenece al usuario `tarirozw`, con 0 descargas y 0 likes en el momento de la consulta; conviene verificar la integridad de los pesos frente al repositorio oficial de Stability AI antes de usarlos en produccion.
- Riesgo de alucinacion visual y de artefactos temporales no documentado de forma cuantitativa en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tarirozw/stable-video-diffusion-img2vid-xt
- Repositorio oficial del modelo (Stability AI): https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt
- Repositorio de codigo: https://github.com/Stability-AI/generative-models
- Paper / investigacion: https://stability.ai/research/stable-video-diffusion-scaling-latent-video-diffusion-models-to-large-datasets
- Licencia del modelo: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/LICENSE.md
- Licencia comercial: https://stability.ai/license
- Politica de uso aceptable: https://stability.ai/use-policy
- GEN-2 (comparativa): https://research.runwayml.com/gen2
- PikaLabs (comparativa): https://www.pika.art/
