# TechnoBaptist/WeVisOne-VL-2B

## Resumen

WeVisOne-VL-2B es un modelo vision-language unificado desarrollado por WeChat Vision (Tencent Inc.) que aborda la percepcion visual a dos niveles: a nivel de objeto (deteccion open-vocabulary, localizacion por referencia, conteo, pointing y OCR) y a nivel de pixel (segmentacion por referencia y alpha matting promptable). Se construye sobre Qwen3-VL y combina la prediccion estructurada de siguiente token con un decodificador de pixeles ligero de 9,6 millones de parametros, lo que permite emitir tanto cajas y puntos como mascaras alfa continuas a resolucion completa.

El modelo tiene 2.441.744.384 parametros totales (aproximadamente 2,4 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un repositorio de 4,9 GB. Su relevancia actual radica en unificar tareas de percepcion que tradicionalmente requieren pipelines separados (detectores, segmentadores y modelos de matting) en un unico modelo conversacional con salida estructurada.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor; los datos no publicados se indican explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basada en Qwen3-VL (transformers) con decodificador de pixeles ligero (9.609.764 parametros) |
| Parametros totales | 2.441.744.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas `mask_decoder.pt` como componente requerido) |

## Arquitectura y entrenamiento

WeVisOne-VL se apoya en Qwen3-VL como backbone vision-language y anade un decodificador de pixeles de 9,6 millones de parametros compuesto por tres bloques: un adaptador de caracteristicas visuales sobre caracteristicas del ViT de Qwen3-VL previas al merging multinivel; un decodificador de queries guiado por caja con 6 bloques de atencion cruzada deformable, inicializado a partir del estado oculto del token `<OBJ>` y de la caja codificada con Fourier; y una cabeza de prediccion densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina en escalas S/4, S/2 y S/1 para producir alpha mattes continuos a stride 1.

El modelo emplea tokens de coordenadas dedicados (`<0>` ... `<1000>`) para representar cajas delimitadoras y puntos normalizados, devuelve `None` cuando el objetivo consultado no esta presente y emite un token especial de instancia (`<OBJ>`, token ID 152678) tras cada caja predicha en tareas densas. La generacion es de siguiente token estructurado, sin cadena de pensamiento explicita (CoT) para priorizar eficiencia de inferencia. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Deteccion de objetos open-vocabulary.
- Localizacion por referencia (referring localization) y point grounding.
- Conteo de objetos.
- OCR y localizacion de texto en imagen.
- Segmentacion por referencia (referring expression segmentation).
- Alpha matting promptable a resolucion completa (stride 1).
- Salida estructurada mediante tokens de coordenadas y token de instancia `<OBJ>`.
- Abstenerse explicitamente (`None`) cuando el objetivo no esta presente.
- Interaccion conversacional de un solo turno sobre imagen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible (el modelo evita CoT explicita por eficiencia).
- Video: no soportado (el decodificador de pixeles rechaza rejillas de video).

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede generar cajas y mascaras por referencia sobre imagenes nuevas, acelerando el etiquetado de deteccion y segmentacion antes de la revision humana.
- Segmentacion y recorte de producto en e-commerce: dada una imagen y una consulta textual ("camiseta", "zapato"), devuelve la mascara del objeto y un alpha matte util para composicion sobre fondos nuevos.
- Analisis de documentos y OCR: localizacion de regiones de texto y extraccion de coordenadas para pipelines de digitalizacion y verificacion.
- Conteo de objetos en imagenes de inventario o control de calidad: consultas del tipo "cuenta las cajas" con respuesta numerica y localizacion de instancias.
- Edicion de imagen asistida: generacion de alpha mattes para separar sujetos (personas, objetos) en flujos de postproduccion y retoque.
- Interfaces de busqueda visual: localizacion de elementos descritos en lenguaje natural dentro de una imagen para sistemas de inspeccion o asistencia visual.
- Investigacion en grounding y percepcion unificada: banco de pruebas para comparar tareas de objeto y pixel en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 2,44 mil millones de parametros, en bfloat16 los pesos ocupan aproximadamente 4,9 GB, a los que hay que sumar el decodificador de pixeles y las activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado; por tamano de pesos seria plausible en GPU con 8-12 GB o mas, pero no hay dato oficial.
- Opciones de despliegue: paquete de inferencia oficial `wevisone_vl` desde el repositorio de GitHub de Tencent, con soporte de `device="auto"` y `dtype="bfloat16"`; compatible con `transformers`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| WeVisOne-VL-2B | 2.441.744.384 | no disponible | Apache 2.0 | Percepcion unificada objeto + pixel sobre Qwen3-VL |
| Alternativas comparables | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Los bordes finos de las mascaras alfa son sensibles a la resolucion de la imagen, a la oclusion severa, a la transparencia compleja y a la formulacion del prompt.
- El modelo genera salidas estructuradas sin CoT explicita, lo que puede reducir la robustez en consultas ambiguas.
- Solo admite percepcion de imagen en un unico turno; las rejillas de video son rechazadas por el decodificador de pixeles.
- Uso previsto exclusivamente de investigacion en grounding, localizacion, pointing, conteo, OCR, segmentacion y matting; no esta destinado a decisiones autonomas de alto impacto ni a identificar personas.
- Riesgo de alucinacion y de falsos positivos en deteccion no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: el codigo de Tencent se publica bajo Apache 2.0; los componentes de terceros conservan sus licencias originales y deben revisarse antes de uso comercial.
- Idiomas soportados no documentados, lo que limita la planificacion de despliegues multilingues.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/WeVisOne-VL-2B
- Paper: https://huggingface.co/papers/2610.31329
- Project page: https://tencent.github.io/WeVisOne-VL
- Repositorio de inferencia: https://github.com/Tencent/WeVisOne-VL
- Modelo de referencia citado en la model card: tencent/WeVisOne-VL-2B
