# VisualInference/FLUX-3-Image-Klein-MLX-8bit

## Resumen

FLUX 3 Image Klein MLX 8-bit es una conversion comunitaria del modelo black-forest-labs/flux-3-image-klein, publicada por el usuario VisualInference, que adapta el transformer a Apple Silicon mediante MLX. El repositorio distribuye los pesos en formato safetensors cuantizados a 8 bits y esta pensado para ejecutarse de forma nativa en Macs con chip de la serie M a traves del runner flux3-mlx. No es una conversion oficial ni esta respaldada por Black Forest Labs.

El modelo cubre tres tareas: generacion de imagen a partir de texto, edicion de imagenes con hasta 10 imagenes de referencia e image-to-image, y control de composicion mediante bounding boxes. La quantizacion a 8 bits ocupa 6,15 GB para el transformer, con una descarga total de 9,6 GB y un pico de memoria de 14,3 GB al generar a 1024x1024 (11,0 GB si se activa el modo de bajo consumo), por lo que esta orientado a equipos con 24 GB o mas de memoria unificada.

Su relevancia es practica: permite ejecutar un modelo de generacion y edicion de imagenes de ultima generacion en hardware de consumo Apple sin depender de GPUs NVIDIA ni de servicios en la nube, con una validacion de la salida frente a la implementacion de referencia de Black Forest Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion y edicion de imagen (el detalle completo de la arquitectura no se especifica en la model card) |
| Parametros totales | no disponible (el transformer cuantizado a 8 bits ocupa 6,15 GB) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no se documenta una ventana de contexto) |
| Tipos de cuantizacion | 8 bits en este repositorio; existen variantes oficiales de la misma familia en 6 bits, y upsamplers de prompt en 4 y 8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | flux-kommunity-license (etiquetada como "other"), con fichero LICENSE.md en el repositorio |
| Formato de pesos | safetensors (MLX) |
| Modelo base | black-forest-labs/flux-3-image-klein (relacion: quantized) |
| Pipeline | text-to-image (ademas de image-editing e image-to-image) |
| Libreria y runtime | MLX, con el runner flux3-mlx |
| Tamano del repositorio | 10,3 GB (descarga indicada: 9,6 GB) |
| Resolucion de ejemplo | 1024x1024, 1216x832 |
| Pasos de muestreo en la galeria | 16 |
| Publicado en el Hub | 2026-10-16 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el componente transformer del modelo ha sido cuantizado a 8 bits y que el resultado se ha validado contra la implementacion de referencia de Black Forest Labs. No se aporta informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o imagenes utilizados, ni sobre si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineamiento. Tampoco se describen innovaciones de arquitectura propias de esta conversion: el trabajo del autor es exclusivamente la adaptacion y la cuantizacion, no el entrenamiento del modelo.

El aspecto tecnico diferencial documentado es la decision de no publicar una variante de 4 bits. Segun las pruebas del autor, la cuantizacion a 4 bits incrementaba entre un 5 % y un 23 % el grano de alta frecuencia e introducia cambios en detalles de diseno, por lo que la familia se limita a 8 y 6 bits. La variante de 8 bits se posiciona explicitamente como la mas cercana al comportamiento en BF16, a cambio de un mayor consumo de memoria. La ejecucion se apoya en MLX, el framework de Apple para computacion en silicio propio, y el runner flux3-mlx, instalable desde el repositorio de GitHub del autor.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) en resoluciones configurables, por ejemplo 1216x832 o 1024x1024, con control de semilla para reproducibilidad.
- Edicion de imagenes guiada por instrucciones en lenguaje natural: eliminacion de objetos y sus sombras, recoloreado de prendas manteniendo la iluminacion, y otras transformaciones locales.
- Uso de hasta 10 imagenes de referencia en una misma generacion, lo que permite composiciones que combinan elementos de varias fuentes (por ejemplo, trasladar una prenda de una imagen a una persona de otra).
- Control de composicion mediante bounding boxes, util para tareas con requisitos de maquetacion o de posicionamiento de elementos.
- Image-to-image como modo de generacion base.
- Upsampling de prompt: el autor recomienda modelos especificos de upsampling (pup-MLX-4bit y pup-MLX-8bit) para prompts cortos; la instalacion con el extra `[pup]` lo integra en el flujo de trabajo.
- Repertorio estilistico amplio segun la galeria publicada: emulacion de pelicula fotografica (Portra 400, CineStill 800T, Tri-X, Vision3 250D), estetica CCD de principios de los 2000, bodegon en gran formato, macro de producto y carteleria con tipografia.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento. El unico idioma declarado es el ingles.
- No es un modelo de vision-lenguaje: las imagenes de referencia se emplean como condicionamiento para generacion y edicion, no como entrada para descripcion o razonamiento visual.

## Casos de uso

- Edicion fotografica local sobre Mac: retirar un coche aparcado y su sombra de una fotografia, o cambiar el color de una prenda preservando la iluminacion de la escena. El modelo esta disenado para instrucciones de edicion concisas y se apoya en la imagen de entrada como contexto.
- Composicion a partir de multiples referencias para e-commerce: con hasta 10 imagenes de referencia se puede montar un producto sobre un fondo concreto o vestir a una persona con prendas de imagenes separadas, sin salir del equipo local.
- Generacion de imagenes de producto y bodegon: la galeria incluye macros de producto con cromo y resina y bodegones en gran formato con luz de ventana dura, un tipo de encargo habitual en catalogos y publicidad.
- Maquetacion con control de layout: el soporte de bounding boxes permite colocar elementos en posiciones concretas, util para carteles, cubiertas y piezas graficas donde la composicion no puede quedar al azar.
- Previsualizacion de tratamientos fotograficos y direccion de arte: la emulacion de stocks de pelicula y de esteticas historicas permite generar referencias visuales para un rodaje o una campana antes de invertir en produccion.
- Flujos con requisitos de privacidad: al ejecutarse en local sobre Apple Silicon, las imagenes de referencia no salen del equipo, algo relevante para material bajo confidencialidad o datos personales.
- Generacion reproducible en pipelines de contenido: el control de semilla y los parametros de CLI permiten integrar llamadas repetibles en scripts y regenerar variaciones controladas de un mismo prompt.
- Recuperacion de prompts pobres: el uso del upsampler de prompt incluido facilita obtener resultados utilizables a partir de descripciones de pocas palabras, como se muestra en la galeria con prompts de 12 palabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo FID, CLIP score, GenEval, MMLU, HumanEval ni equivalentes, ni comparaciones numericas de calidad frente a otros modelos de imagen.

Los unicos datos de rendimiento publicados son de memoria y tamano, comparando las dos variantes de la familia:

| Repo | Transformer | Descarga | Pico de memoria a 1024² | Pico con --low-memory | Equipo recomendado |
|---|---|---|---|---|---|
| MLX-8bit (este) | 8 bits, 6,15 GB | 9,6 GB | 14,3 GB | 11,0 GB | Macs con 24 GB o mas; el mas cercano a BF16 |
| MLX-6bit | 6 bits, 4,83 GB | 8,4 GB | 13,0 GB | 9,6 GB | Macs de 16 GB (el modo de bajo consumo se activa por defecto por debajo de 24 GB) |

No hay datos de latencia, imagenes por segundo ni throughput. La galeria indica que las imagenes se generaron con 16 pasos de muestreo en un M4 Pro, pero no se publica el tiempo por imagen.

## Requisitos de hardware

- Hardware soportado: exclusivamente Apple Silicon mediante MLX. No hay soporte CUDA ni NVIDIA en este repositorio.
- Memoria unificada recomendada para la variante de 8 bits: 24 GB o mas.
- Pico de memoria medido a 1024x1024: 14,3 GB en modo normal y 11,0 GB con la opcion --low-memory.
- Para equipos de 16 GB existe la variante de 6 bits de la misma familia, con pico de 13,0 GB (9,6 GB en modo de bajo consumo) y descarga de 8,4 GB.
- Equipo validado por el autor: Mac con chip M4 Pro, sobre el que se generaron las 26 imagenes de la galeria.
- Instalacion: `pip install "flux3-mlx[pup] @ git+https://github.com/felix-ab/flux3-mlx"`, con el runner flux3-mlx como interfaz de linea de comandos.
- Ejemplo de invocacion: `flux3-mlx "a ceramicist's studio at golden hour, shelves of glazed bowls" --model 8bit --upsample --out studio.png`.
- Modos de uso documentados: prompt largo tal cual, prompt corto con --upsample, edicion con una o varias imagenes mediante --image, y control de resolucion y semilla con --width, --height y --seed.
- Latencia y throughput: no disponible.
- No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) para este repositorio; el unico runtime indicado es flux3-mlx sobre MLX.

## Comparativa con modelos similares

| Modelo | Relacion | Cuantizacion | Tamano del transformer | Pico de memoria a 1024² | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLUX-3-Image-Klein-MLX-8bit (este) | Conversion comunitaria del base | 8 bits | 6,15 GB | 14,3 GB (11,0 GB en bajo consumo) | flux-kommunity-license | HuggingFace, via MLX |
| FLUX-3-Image-Klein-MLX-6bit | Conversion comunitaria de la misma familia | 6 bits | 4,83 GB | 13,0 GB (9,6 GB en bajo consumo) | flux-kommunity-license | HuggingFace, via MLX |
| black-forest-labs/flux-3-image-klein | Modelo base original de Black Forest Labs | no disponible en la informacion recogida | no disponible | no disponible | flux-kommunity-license | HuggingFace |

No se dispone de datos de calidad comparada entre la variante de 8 bits y el modelo base, mas alla de la afirmacion del autor de que la version de 8 bits es la mas cercana a BF16 de las publicadas. No se han encontrado en la busqueda web modelos comparables adicionales con datos verificables.

## Limitaciones y advertencias

- Conversion comunitaria no oficial: el propio autor indica que no esta afiliada ni respaldada por Black Forest Labs. No debe tratarse como una publicacion oficial del modelo base.
- Sin benchmarks: no hay metricas de calidad publicadas, por lo que la evaluacion debe hacerse con pruebas propias sobre el caso de uso concreto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa y el soporte disponible.
- Solo en ingles: el unico idioma declarado es en. No hay informacion sobre el comportamiento con prompts en castellano.
- Rendimiento en la frontera de memoria: con 24 GB de memoria unificada y un pico de 14,3 GB a 1024x1024, la generacion convive con el resto de aplicaciones del sistema; con la opcion --low-memory el pico baja a 11,0 GB pero se degrada el margen disponible para otras tareas.
- Restricciones de licencia: la licencia es la flux-kommunity-license, marcada como "other". Los terminos concretos de uso comercial no se detallan en la informacion disponible y hay que revisar el fichero LICENSE.md antes de emplear el modelo en produccion.
- Limitacion de cuantizacion: el autor descarta deliberadamente la cuantizacion a 4 bits tras medir entre un 5 % y un 23 % de grano extra de alta frecuencia y cambios en detalles de diseno. Por debajo de 6 bits la fidelidad no esta garantizada.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX. No es desplegable en infraestructura NVIDIA ni en servicios de inferencia habituales basados en CUDA.
- Riesgo de artefactos y de fidelidad: como todo modelo de difusion, puede producir artefactos, texto mal formado en imagenes y desviaciones respecto a la instruccion. No se documentan sesgos especificos ni evaluaciones de sesgo.
- Sin soporte de agentes ni tool calling: no debe plantearse como componente de un pipeline agentico ni como modelo multimodal de entrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-MLX-8bit
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Variante de 6 bits: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-MLX-6bit
- Upsampler de prompt en 4 bits: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-pup-MLX-4bit
- Upsampler de prompt en 8 bits: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-pup-MLX-8bit
- Runner flux3-mlx: https://github.com/felix-ab/flux3-mlx
- Framework MLX: https://github.com/ml-explore/mlx
- Licencia: LICENSE.md dentro del repositorio de HuggingFace
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las referencias devueltas corresponden a un personaje de ficcion de una serie de television y no guardan relacion con el modelo.
