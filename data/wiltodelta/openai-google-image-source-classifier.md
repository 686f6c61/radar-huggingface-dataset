# wiltodelta/openai-google-image-source-classifier

## Resumen

El modelo `wiltodelta/openai-google-image-source-classifier` es un clasificador de atribución de fuente para imagenes que decide si los pixeles decodificados de una imagen presentan un patron de exportación compatible con proveedores OpenAI o Google, o bien se abstiene devolviendo la etiqueta `unknown`. Lo desarrolla el autor wiltodelta y se distribuye bajo licencia Apache-2.0. No es un modelo generativo ni una red neuronal de gran tamano: se trata de un artefacto NPZ sin pickle (`openai-google-source-v1.npz`) que contiene únicamente plantillas espectrales derivadas y umbrales numéricos, con una huella SHA-256 publicada (`0e94e565c181416e4f63a2bfc06cd5179f4201befda7481ac510f6a168c612f4`).

El problema que resuelve es acotado: cuando a una imagen se le han eliminado los metadatos sin borrar ni regenerar deliberadamente el patron de pixeles, el modelo intenta inferir si esa imagen es una exportación atribuible a OpenAI o Google mediante clasificación de conjunto abierto (open-set), con la opción explícita de abstenerse. El autor advierte de forma destacada que no es un detector de SynthID: una etiqueta de proveedor no demuestra que haya marca de agua, y una abstención no demuestra su ausencia. Si el modelo detecta simultáneamente una coincidencia OpenAI y Google, devuelve `unknown` con motivo `conflict`.

Es relevante por su enfoque de forense de imagen reproducible y verificable: el artefacto no incluye imagenes de entrenamiento, rutas, hashes de imagen, embeddings, catálogo ni predicciones por imagen, y se integra en la libreria `remove-ai-watermarks[source-classify]`, que fija el repositorio a un commit verificado y comprueba el hash del artefacto. La API explícita es `classify_image_source(path)`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como red neuronal; artefacto de plantillas espectrales y umbrales numericos (NPZ, sin pickle) |
| Parametros totales | no disponible (no es un modelo de parametros entrenables en el sentido habitual) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (clasificador de imagen, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable (artefacto NPZ con plantillas y umbrales; no hay pesos cuantizables) |
| Idiomas soportados | no disponible (clasificador de imagenes, independiente del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | NPZ (`openai-google-source-v1.npz`), sin pickle |

## Arquitectura y entrenamiento

El artefacto es un fichero NPZ sin pickle que `contiene únicamente plantillas espectrales derivadas y umbrales numéricos`. Según la model card, no incluye imágenes de entrenamiento, rutas, hashes de imagen, embeddings, catálogo ni predicciones por imagen, lo que reduce la superficie de riesgo de reproducir datos de entrada. La huella SHA-256 del artefacto es `0e94e565c181416e4f63a2bfc06cd5179f4201befda7481ac510f6a168c612f4`.

El corpus empleado para ajustar las plantillas es privado y no se redistribuye. El modelo opera como clasificador de conjunto abierto: puede asignar `openai`, `google` o abstenerse con `unknown`. La salida expone `label`, `reason`, puntuaciones numéricas por rama (`scores`) y `watermark_truth="unknown"`. La libreria de integración fija este repositorio a un commit verificado, verifica el hash del artefacto y permite cargar un NPZ local mediante la variable `RAIW_IMAGE_SOURCE_WEIGHTS`. La antigua API `classify_source` corresponde a un modelo anterior y distinto, y no se sustituye silenciosamente por este. No se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO, por lo que esos apartados quedan como no disponibles.

## Capacidades

- Clasificación de fuente por patron de pixeles: asigna `openai`, `google` o `unknown` a imagenes decodificadas.
- Abstención explicita: devuelve `unknown` cuando no hay coincidencia clara, en lugar de forzar una etiqueta de proveedor.
- Detección de conflicto: una coincidencia simultanea OpenAI y Google se devuelve como `unknown` con motivo `conflict`, sin adivinar proveedor.
- Salida estructurada: expone `label`, `reason`, `scores` numéricos por rama y el campo `watermark_truth="unknown"`.
- Verificación de integridad: el artefacto tiene hash SHA-256 publicado y la libreria lo verifica.
- Sin dependencia de metadatos: funciona sobre pixeles decodificados, pensado para imagenes cuyo EXIF u otros metadatos fueron eliminados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen.
- No incorpora capacidades de visión generativa, audio ni thinking mode.

## Casos de uso

- Triaje forense de imagenes sin metadatos: dado un fichero cuya EXIF ha sido eliminada, el modelo puede indicar si el patron de pixeles es compatible con OpenAI o Google antes de emprender análisis más costosos, gracias a su función de abstención explicita.
- Curación de datasets de entrenamiento: en un pipeline que recolecta imagenes sinteticas de distintas fuentes, el clasificador puede etiquetar de forma automatica posibles exportaciones de OpenAI o Google y marcar el resto como `unknown` para revisión manual.
- Auditoría de medios en redacciones: como señal auxiliar en la verificación de imagenes recibidas por canales que eliminan metadatos, manteniendo separados los hallazgos de atribución de fuente de cualquier conclusión sobre autoría o cumplimiento.
- Moderación de contenido en plataformas de subida: integrado como paso de señalización que registra un patron de proveedor y deriva los casos ambiguos a revisión humana, sin bloquear decisiones automaticas basadas solo en esta etiqueta.
- Investigación academica en forense de imagen: permite reproducir un experimento de atribución de fuente con un artefacto versionado y verificable, con hash publicado y sin redistribución de imagenes de origen.
- Archivado y catalogación de colecciones fotograficas: para grandes volumenes de ficheros se puede ejecutar la clasificación como etiquetado complementario, conservando `unknown` cuando el modelo no se pronuncia.
- Control de regresión en desarrollo de modelos forenses: el autor lo emplea como prueba de regresión sobre un conjunto publico, de modo que otros equipos pueden replicar el mismo protocolo sobre el artefacto congelado.

## Benchmarks y rendimiento

Los resultados publicados por el autor son los siguientes. Se trata de etiquetas de origen del subidor, no de procedencia autenticada por fichero, y la ruta publica se abrió durante el desarrollo temprano del modelo, por lo que el autor lo describe como comprobación de regresión y no como test final independiente.

| Conjunto de evaluacion | Etiqueta de referencia | Resultado |
|---|---|---|
| Qwen Image Bench (200 originales OpenAI, prompt IDs no usados) | openai | 198/200 clasificados como openai |
| Qwen Image Bench (200 originales Google, prompt IDs no usados) | google | 196/200 clasificados como google |
| Qwen Image Bench (200 originales FLUX, prompt IDs no usados) | abstencion esperada | 200/200 devueltos como `unknown` |
| lightcella/photo-corpus (42 fotografias de camara con EXIF y fecha anterior a 2022) | abstencion esperada | 42/42 `unknown` en pixeles originales |
| lightcella/photo-corpus, transformaciones JPEG95, JPEG75 y bilinear-1024 | abstencion esperada | `unknown` en las 42 vistas transformadas |

## Requisitos de hardware

- Al ser un artefacto NPZ de plantillas espectrales y umbrales numéricos gestionado con numpy, no requiere GPU para inferencia.
- No se especifican requisitos de VRAM en la información disponible; el calculo es de CPU.
- El tamano del repositorio se reporta como 0.0 GB, por debajo del umbral de redondeo, lo que indica un artefacto de muy reducido tamano.
- Cabe en cualquier equipo que ejecute Python con numpy, incluidos portatiles y entornos sin acelerador.
- Opciones de despliegue: llamada directa a la API Python `classify_image_source(path)` de la libreria `remove-ai-watermarks[source-classify]`, o carga de un NPZ local mediante `RAIW_IMAGE_SOURCE_WEIGHTS`.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa con alternativas en la información proporcionada. Los unicos elementos de comparación que menciona la model card son los siguientes:

| Alternativa | Relacion | Datos |
|---|---|---|
| API `classify_source` del mismo autor | Modelo anterior y distinto, no sustituido silenciosamente por este | no disponible |
| Detector de SynthID | No es equivalente: el autor indica explicitamente que este modelo no es un detector de SynthID | no disponible |
| Otros clasificadores de fuente de imagen | no disponible | no disponible |

## Limitaciones y advertencias

- No es un detector de SynthID: una etiqueta de proveedor no demuestra que haya marca de agua y `unknown` no demuestra su ausencia.
- No debe usarse como evidencia de presencia de marca de agua, autoría, fraude, cumplimiento de politicas ni procedencia.
- Puede equivocarse con otros proveedores, tipos de camara, pipelines de edición, redimensionados, recortes y ajustes de compresión distintos de los evaluados.
- En candidatos relacionados se observaron falsos positivos de proveedor en paneles de estres con otros generadores y con fotografias.
- `watermark_truth` se devuelve siempre como `unknown`; el resultado debe reportarse junto al motivo de abstención y mantenerse separado de hallazgos independientes de metadatos o procedencia.
- La evidencia de Qwen Image Bench usa etiquetas de origen del subidor, no procedencia autenticada por fichero, y la ruta ya se habia abierto durante el desarrollo, por lo que es una regresión y no una prueba final independiente.
- La evidencia del control de camara proviene de un único shard de archivo, y ni la EXIF ni la descripcion de original de Flickr del conjunto constituyen prueba criptografica de origen.
- El artefacto exige verificación del hash y fijación a un commit verificado a traves de la libreria; usos fuera de ese mecanismo pierden la garantia de integridad.
- El corpus de ajuste es privado y no se redistribuye; las fotografias de entrada y sus licencias no forman parte del repositorio.
- Licencia Apache-2.0 para el artefacto, sin datos de idiomas soportados porque el modelo no procesa texto.
- El repositorio registra 0 descargas y 0 likes, sin adopción publica documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wiltodelta/openai-google-image-source-classifier
- Conjunto de evaluacion Qwen Image Bench: https://huggingface.co/datasets/Qwen/Qwen-Image-Bench
- Conjunto de control fotografico lightcella/photo-corpus: https://huggingface.co/datasets/lightcella/photo-corpus
- Libreria de integracion: paquete `remove-ai-watermarks` con extra `source-classify` (URL no disponible en la informacion proporcionada)
