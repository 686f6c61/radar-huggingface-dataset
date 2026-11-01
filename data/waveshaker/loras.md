# waveshaker/loras

## Resumen

`waveshaker/loras` no es un modelo de difusion convencional, sino un repositorio coleccion de adaptadores LoRA (Low-Rank Adaptation) entrenados por el usuario waveshaker sobre multiples modelos base de generacion de imagenes: Krea 2 (Raw y Turbo), Anima, Flux 1 Dev, SD1.5 y Pony. El repositorio pesa 67,0 GB y se aloja en Hugging Face como pipeline de tipo text-to-image, con una galeria de vista previa asociada en un Space independiente.

Su proposito es exclusivamente educativo y de investigacion: el autor lo describe como material de intercambio academico, pruebas tecnicas y estudio personal de algoritmos de generacion de imagenes. Los LoRA se centran en la categoria "character" (personajes femeninos estilizados), un caso de uso tipico de la comunidad de Stable Diffusion para conseguir consistencia de personaje sin reentrenar el modelo base completo.

Es relevante como ejemplo de flujo de trabajo de entrenamiento de LoRA con herramientas estandar de la comunidad (OneTrainer, Kohya_ss, AI-Toolkit y Kohya Colab), documentando datasets, resolucion de entrenamiento y pesos de aplicacion recomendados (0,8 a 1,0). La licencia del repositorio es MIT, aunque el propio autor restringe su uso a fines no comerciales de investigacion en el aviso legal de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos de difusion (no es un modelo base) |
| Parametros totales | no disponible (67,0 GB de pesos en total en el repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base: Flux 1 Dev, Krea 2, SD1.5, Pony, Anima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles, estilo Booru tags y lenguaje natural) |
| Licencia | MIT (con aviso del autor que limita el uso a investigacion no comercial) |
| Formato de pesos | no disponible (formatos tipicos de LoRA para difusion, no especificados en la model card) |

## Arquitectura y entrenamiento

El repositorio agrupa LoRA entrenados sobre cinco familias de modelos base distintas, cada una con su propia configuracion. Para Krea 2 y Anima se usa OneTrainer con datasets de 20 a mas de 100 imagenes, resolucion de entrenamiento de 512x512, mas de 50 repeticiones por imagen y un esquema de etiquetado mixto que combina prefijos de Booru tags con descripciones en lenguaje natural. Para Flux 1 Dev se emplean Kohya_ss GUI y AI-Toolkit, con datasets de 20 a 50 imagenes y una evolucion en el etiquetado: las primeras iteraciones usaban Booru tags y las posteriores pasaron a captions descriptivas en lenguaje natural, una practica habitual para aprovechar mejor el comprensor de texto de Flux.

Para SD1.5 y Pony se utiliza Kohya Colab, con datasets mayores (50 a 200 imagenes), resolucion de 1024x1024 o superior y entre 30 y 50 repeticiones por imagen, etiquetando exclusivamente con Booru tags. No se documenta el rank ni el alpha de los adaptadores, ni los hiperparametros de learning rate o optimizer, ya que el autor indica usar los ajustes por defecto de cada herramienta. Los pesos recomendados de aplicacion del LoRA en inferencia oscilan entre 0,8 y 1,0 en todos los casos.

## Capacidades

- Generacion de imagenes text-to-image como adaptadores sobre Krea 2 (Raw/Turbo), Flux 1 Dev, Anima, SD1.5 y Pony.
- Especializacion en personajes ("character", tag "girl"), orientada a consistencia de personaje en multiples generaciones.
- Compatibilidad con checkpoints comunitarios documentados: Dark Beast 2, Kreamania v6, Diving Anima v40, RedCraft, UltraReal Fine-Tune, Beyond Reality v3, WAI-ANI-HENTAI-PONYXL v6, entre otros.
- Esquemas de prompting mixtos: Booru tags (SD1.5, Pony) y lenguaje natural (Flux 1 Dev, Krea 2, Anima).
- Galeria de vista previa desplegada como Space de Hugging Face para explorar los resultados antes de descargar.
- Dataset de entrenamiento publicado como coleccion en Hugging Face Datasets para reproducibilidad.

## Casos de uso

- Consistencia de personaje en ilustracion: aplicando el LoRA con peso 0,8-1,0 sobre Krea 2 o Anima se puede generar el mismo personaje en multiples escenas y poses, util en storyboards y comics.
- Investigacion de tecnicas de entrenamiento LoRA: la model card documenta herramientas, tamano de dataset, resolucion y repeticiones por familia de modelo base, lo que permite comparar recetas de entrenamiento entre SD1.5 y Flux 1 Dev.
- Comparacion de bases de difusion: los mismos personajes entrenados sobre Pony, SD1.5 y Flux permiten evaluar como cambia la fidelidad y el estilo segun el modelo base subyacente.
- Prototipado con checkpoints comunitarios: los LoRA se validan contra checkpoints populares de Civitai (Kreamania, RedCraft, WAI-ANI-HENTAI-PONYXL), por lo que se integran en pipelines ya existentes de la comunidad.
- Estudio de esquemas de etiquetado: la transicion de Booru tags a captions en lenguaje natural en Flux 1 Dev sirve como caso practico de como el formato de caption afecta al resultado.
- Curacion y auditoria de contenido: el repositorio incluye avisos de cumplimiento y un mecanismo de retirada (takedown), util como referencia para publicar colecciones de LoRA de forma responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de adaptadores LoRA para generacion de imagenes, la evaluacion habitual se realiza mediante inspeccion visual de las muestras de la galeria, no mediante metricas estandarizadas.

## Requisitos de hardware

- VRAM estimada: depende del modelo base al que se aplique el LoRA. Para SD1.5, 4-6 GB de VRAM son suficientes; para Flux 1 Dev y Krea 2, se recomiendan 12-24 GB en inferencia (menos con cuantizacion y offloading).
- GPU recomendadas: RTX 3060 12 GB o superior para SD1.5/Pony; RTX 4090, RTX 5090 o A100/H100 para Flux 1 Dev y Krea 2 a resolucion completa.
- Consumer GPUs: los LoRA sobre SD1.5 y Pony funcionan en GPUs domesticas de 8 GB; los sobre Flux 1 Dev y Krea 2 requieren tarjetas de gama alta o tecnicas de optimizacion (quantizacion NF4, CPU offload).
- Despliegue: ComfyUI, Automatic1111/Forge o sd-next para inferencia con LoRA; OneTrainer, Kohya_ss o AI-Toolkit para reentrenamiento o reproduccion.
- Latencia y throughput: no disponible (dependen del modelo base y del sampler empleados).

## Comparativa con modelos similares

| Aspecto | waveshaker/loras | Colecciones LoRA en Civitai | LoRAs oficiales (p. ej. black-forest-labs) |
|---|---|---|---|
| Tipo | Coleccion multi-base (Krea 2, Flux, Anima, SD1.5, Pony) | Colecciones mono-base, mayoritariamente SDXL/Pony | Adaptadores individuales publicados por el equipo del modelo base |
| Parametros | no disponible (67 GB en total) | variable | variable |
| Documentacion de entrenamiento | Detallada (herramientas, datasets, res, repeticiones) | Variable, a menudo incompleta | Completa |
| Licencia | MIT (con restriccion de uso no comercial declarada por el autor) | Variable por autor | Variable (Flux Dev: licencia no comercial) |
| Disponibilidad | Hugging Face, descarga publica | Civitai | Hugging Face |

## Limitaciones y advertencias

- No es un modelo base: los LoRA no funcionan por si solos y requieren descargar y cargar el checkpoint correspondiente (Krea 2, Flux 1 Dev, SD1.5, Pony o Anima).
- Uso declarado exclusivamente educativo y de investigacion: pese a la licencia MIT del repositorio, el autor limita explicitamente el uso a fines no comerciales y de investigacion personal.
- Contenido sensible: algunos modelos base, especialmente Pony, tienen prompts con un alto grado de apertura; el autor advierte que el usuario es el unico responsable de filtrar y auditar el contenido generado.
- Riesgo de reproducion de personas reales o personajes protegidos: al tratarse de LoRA de personaje, existe riesgo legal relacionado con derechos de imagen y derechos de autor; el autor ofrece un mecanismo de retirada para titulares de derechos.
- Hiperparametros no documentados: no se publican rank, alpha, learning rate ni optimizer, lo que dificulta la reproduccion exacta del entrenamiento.
- Alucinacion/artefactos: como en todo LoRA, pesos por encima de 1,0 pueden degradar la coherencia anatomica y del fondo; el rango recomendado es 0,8-1,0.
- Sin benchmarks ni metricas cuantitativas: la calidad solo puede evaluarse visualmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/waveshaker/loras
- Galeria de LoRAs (Space): https://huggingface.co/spaces/waveshaker/loras_gallery
- Dataset de entrenamiento: https://huggingface.co/datasets/waveshaker/dataset_collections
- OneTrainer: https://github.com/nerogar/OneTrainert
- Kohya_ss GUI: https://github.com/bmaltais/kohya_ss
- AI-Toolkit: https://github.com/ostris/ai-toolkit
- Kohya Colab: https://github.com/hollowstrawberry/kohya-colab
- Modelos base: https://huggingface.co/krea/Krea-2-Raw y https://huggingface.co/krea/Krea-2-Turbo
