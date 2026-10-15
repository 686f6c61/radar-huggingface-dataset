# ysharma/pocket-layout-planner-0.8B

## Resumen

pocket-layout-planner-0.8B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario ysharma en HuggingFace bajo licencia Apache-2.0. Su funcion es convertir una peticion de imagen corta —sin prompt de sistema y sin modo de razonamiento— en una unica linea de salida compuesta por dos partes: un caption detallado que cita los elementos visuales mediante identificadores `<id>`, seguido de una tabla JSON de cajas delimitadoras con el formato `[y_min, x_min, y_max, x_max]` normalizado sobre una rejilla de 0 a 1000.

El modelo se ha destilado a partir del modo `t2i_bbox` del modelo profesor `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0), segun declara el propio autor, y los datos de entrenamiento provienen del conjunto `ysharma/klein-layout-plans`. El caso de uso central es la planificacion espacial previa a la generacion o edicion de imagenes: traducir una instruccion textual breve a una especificacion estructurada de elementos y coordenadas.

Es relevante ahora porque el repositorio es un *stub*: el 15 de octubre de 2026 solo contiene la model card y la declaracion de intenciones. Los pesos, la tabla de evaluacion, la hoja de contacto visual, la receta de entrenamiento, las limitaciones, el fragmento de codigo ejecutado y la exportacion GGUF Q8 estan anunciados para despues de que se ejecute un pipeline con control de acceso. Por tanto, cualquier evaluacion practica debe posponerse hasta que ese material este publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones (segun el identificador del repositorio) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; se anuncia una exportacion GGUF Q8 futura |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible por ahora; anunciado GGUF Q8 en una version futura |

Otros datos declarados: autor `ysharma`; modelo base declarado `Qwen/Qwen3.5-0.8B`; modelo profesor declarado `black-forest-labs/flux-3-image-klein-pup` (modo `t2i_bbox`); conjunto de datos de entrenamiento `ysharma/klein-layout-plans`; etiquetas declaradas `layout-planning`, `distillation`, `bbox`; descargas y *likes* registrados en el repositorio: 0; fecha de creacion: 2026-10-15.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Al tratarse de un fine-tune directo de `Qwen/Qwen3.5-0.8B`, la arquitectura heredada es la del modelo base declarado, pero el autor no aporta detalles sobre numero de capas, tipo de atencion, dimension de las cabezas, vocabulario ni estrategia de posicion. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset `ysharma/klein-layout-plans` ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por preferencias.

La innovacion tecnica declarada es la destilacion desde un modelo de difusion con capacidad de planificacion de cajas: el modo `t2i_bbox` del modelo profesor genera caption mas tabla de coordenadas, y ese comportamiento se ha transferido a un modelo de lenguaje de 0,8B parametros. El resultado es un planificador ligero que no requiere prompt de sistema ni fase de razonamiento explicita y que produce la salida en una sola linea, con las cajas expresadas en una rejilla entera de 0 a 1000 para `y_min`, `x_min`, `y_max` y `x_max`. Se anuncia tambien que el pipeline de entrenamiento sera publicado junto con la receta y la tabla de evaluacion, pero en el momento de redactar esta ficha ese contenido no esta disponible.

## Capacidades

- Generacion de captions detallados a partir de una peticion de imagen breve, citando cada elemento mediante identificadores `<id>`.
- Prediccion de cajas delimitadoras en formato JSON, con cuatro valores enteros por caja sobre una rejilla de 0 a 1000.
- Planificacion de layout espacial: asignacion de posiciones y extensiones a los elementos descritos en el caption.
- Ejecucion en un unico paso, sin prompt de sistema y sin modo de razonamiento (*thinking*), lo que reduce la latencia frente a esquemas con cadena de pensamiento.
- Destilacion de un comportamiento originalmente multimodal (modo `t2i_bbox` de un modelo de difusion) en un modelo de lenguaje de texto puro.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponibles; no se declaran en la model card.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Capacidad especial anunciada pero no disponible todavia: exportacion GGUF Q8 para inferencia en formatos cuantizados.

## Casos de uso

- Preprocesado de pipelines de generacion de imagenes: el modelo toma la peticion textual del usuario y devuelve un caption estructurado con identificadores mas las cajas correspondientes, que se pueden pasar como condicionamiento espacial a un modelo de difusion con control de layout.
- Anotacion automatica de datasets de vision: dado un conjunto de peticiones breves, el modelo produce pares caption-cajas que sirven como etiquetas iniciales para entrenar detectores o para revision humana posterior.
- Prototipado rapido de interfaces: a partir de una descripcion funcional, el modelo genera la distribucion espacial de los elementos, utilizable para bocetos de wireframes antes de pasar a una herramienta de diseno.
- Maquetacion asistida de documentos y presentaciones: conversion de una instruccion de contenido en una tabla de posiciones normalizada que un motor de renderizado puede traducir a coordenadas absolutas de pagina.
- Capa intermedia en asistentes multimodales: actuar como planificador compacto que traduce la intencion del usuario en una especificacion espacial antes de invocar un modelo generativo mayor, reduciendo el coste computacional del componente que solo necesita razonar sobre posiciones.
- Despliegue en entornos con recursos limitados: con 0,8B parametros, el modelo es candidato para ejecucion en CPU o en GPUs de gama de consumo una vez se publique la exportacion GGUF Q8.
- Investigacion sobre destilacion de capacidades espaciales: permite estudiar hasta que punto un modelo de lenguaje pequeno puede replicar la planificacion de cajas de un modelo de difusion profesor, cuando se publique la tabla de evaluacion.
- Normalizacion de salidas para sistemas de control grafico: la rejilla fija de 0 a 1000 simplifica el mapeo a cualquier resolucion de destino (por ejemplo, multiplicar por el ancho y alto reales y dividir entre 1000).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que el repositorio es un *stub* y que la tabla de evaluacion, la hoja de contacto visual y la receta de entrenamiento se publicaran una vez se ejecute el pipeline con control de acceso. No se proporcionan cifras de MMLU, HumanEval, GSM8K, ni de metricas especificas de deteccion de objetos o *layout planning* como IoU, mAP o precision de coordenadas.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros declarado (0,8B) y sin incluir el *overhead* del runtime ni la cache KV: aproximadamente 1,6 GB en fp16, 0,8 GB en int8 y 0,4 GB en int4. Estas cifras son estimaciones aritmeticas, no datos publicados por el autor.
- La cache KV depende de la longitud de contexto, que no esta declarada, por lo que no se puede acotar su consumo.
- GPU recomendadas: no disponibles. Cualquier GPU con al menos 2 GB de VRAM libre deberia poder alojar el modelo en fp16 segun la estimacion anterior, pero el autor no publica requisitos oficiales.
- Compatibilidad con GPU de consumo: probable en la mayoria de tarjetas actuales segun el tamano declarado, pero no confirmada por el autor.
- Opciones de despliegue: no disponibles. Se anuncia una exportacion GGUF Q8, lo que habilitaria ejecucion con llama.cpp u Ollama, pero el artefacto todavia no existe en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos verificables de modelos comparables en la informacion proporcionada: no hay tabla de evaluacion, no se declaran especificaciones de rendimiento y el propio repositorio se describe como *stub*. La unica referencia con la que se puede relacionar el modelo es su cadena de procedencia declarada.

| Referencia | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ysharma/pocket-layout-planner-0.8B | Modelo objeto de esta ficha | 0,8B (segun identificador) | no disponible | Apache-2.0 | Solo model card; pesos no publicados |
| Qwen/Qwen3.5-0.8B | Modelo base declarado | 0,8B (segun identificador) | no disponible | no disponible en esta informacion | No verificado en esta informacion |
| black-forest-labs/flux-3-image-klein-pup (modo `t2i_bbox`) | Modelo profesor declarado | no disponible | no disponible | Apache-2.0 (segun la model card) | No verificado en esta informacion |

## Limitaciones y advertencias

- El repositorio es un *stub*: no contiene pesos, ni codigo de inferencia, ni evaluacion. No es utilizable en produccion en su estado actual.
- No se declaran idiomas soportados, por lo que se desconoce el comportamiento del modelo fuera del idioma o idiomas usados en el dataset `ysharma/klein-layout-plans`.
- No se declara la longitud de contexto, lo que impide estimar el limite practico de elementos o la longitud del caption de entrada y salida.
- Riesgo de alucinacion de elementos y cajas: al ser un modelo de lenguaje destilado, puede generar identificadores `<id>` sin correspondencia con la peticion original o coordenadas inconsistentes con el caption.
- Riesgo de deriva en el formato: la salida combina texto libre y JSON en una sola linea, por lo que un fallo de formato rompe el parseo aguas abajo; se recomienda validacion estricta del JSON y comprobacion de rangos en la rejilla 0-1000.
- Al destilar desde un modelo de difusion, el modelo puede heredar sesgos de composicion espacial del profesor (por ejemplo, posiciones y proporciones tipicas de determinados tipos de escena) sin que exista documentacion al respecto.
- Sesgos demograficos, culturales o de representacion: no disponibles; no se documentan en la model card.
- Licencia Apache-2.0 declarada, lo que en principio permite uso comercial, pero la ausencia de pesos publicados y de informacion sobre el modelo base y los datos de entrenamiento impide verificar la procedencia y las condiciones reales de redistribucion.
- La model card indica que el nombre de FLUX se usa unicamente para atribuir el modelo profesor y que el repositorio no esta afiliado ni respaldado por Black Forest Labs.
- No se documentan requisitos de hardware, latencia ni limites de despliegue, por lo que no se puede garantizar un rendimiento minimo en produccion.
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a tramites administrativos de una administracion local y no guardan ninguna relacion con el contenido de esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ysharma/pocket-layout-planner-0.8B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conjunto de datos de entrenamiento declarado: https://huggingface.co/datasets/ysharma/klein-layout-plans
- Modelo profesor declarado (modo `t2i_bbox`): `black-forest-labs/flux-3-image-klein-pup` (referenciado en la model card; no se ha verificado su repositorio)
- Herramienta declarada de construccion: https://hf.co/chat?mode=ml-intern
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles; la busqueda web no devolvio ningun resultado relacionado con el modelo.
