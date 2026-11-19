# tencent/WeVisOne-VL-2B

## Resumen

WeVisOne-VL-2B es un modelo vision-lenguaje unificado desarrollado por WeChat Vision (Tencent Inc.) que aborda la percepcion visual en dos niveles complementarios: a nivel de objeto (deteccion de objetos de vocabulario abierto, localizacion por referencia, conteo, pointing y OCR) y a nivel de pixel (segmentacion por referencia y alpha matting con prompt). Se construye sobre Qwen3-VL y combina la prediccion estructurada de siguientes tokens con un decodificador de pixeles ligero de 9,6 millones de parametros, lo que le permite emitir cajas, puntos y mascaras alfa continuas a resolucion completa desde un unico modelo conversacional.

Con 2.441.744.384 parametros totales (aproximadamente 2,4 mil millones), el modelo se posiciona en el rango compacto de la familia vision-lenguaje, lo que facilita su despliegue en infraestructura modesta frente a alternativas de mayor tamano. Su relevancia actual radica en la unificacion de tareas tradicionalmente resueltas por pipelines separados (detectores, segmentadores, modelos de matting) en una sola interfaz de texto a texto con salidas estructuradas, bajo licencia Apache 2.0.

La version publicada esta orientada a investigacion en grounding visual, localizacion, segmentacion y matting, y no incorpora razonamiento explicito de cadena de pensamiento (CoT) para priorizar la eficiencia de inferencia. El modelo acepta imagenes individuales y rechaza rejillas de video en el decodificador de pixeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3-VL con decodificador de pixeles acoplado |
| Parametros totales | 2.441.744.384 (modelo principal) + 9.609.764 (mask_decoder.pt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (codigo propio de Tencent; componentes de terceros conservan sus licencias) |
| Formato de pesos | safetensors + mask_decoder.pt |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura vision-lenguaje basada en Qwen3-VL. La innovacion principal es el uso de tokens de coordenada dedicados (`<0>` a `<1000>`) para representar cajas delimitadoras normalizadas y puntos, junto con un token de instancia especial (`<OBJ>`, ID 152678) que se emite tras cada caja predicha en tareas densas. Este esquema convierte la percepcion espacial en una tarea de prediccion de siguientes tokens estructurada, y el modelo devuelve `None` cuando el objetivo consultado no esta presente, lo que reduce falsos positivos en consultas abiertas.

El componente de pixeles es un decodificador de 9.609.764 parametros que combina tres piezas: un adaptador de caracteristicas visuales sobre caracteristicas multinivel del ViT de Qwen3-VL previas al merging; un decodificador de consultas guiado por caja con 6 bloques de atencion cruzada deformable, inicializado desde el estado oculto de `<OBJ>` y un prior de caja codificado con Fourier; y una cabeza de prediccion densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina predicciones en escalas S/4, S/2 y S/1 para producir mattes alfa continuos a resolucion completa con stride 1. No se dispone de datos publicos sobre el volumen o la composicion del dataset de entrenamiento, ni sobre el uso de RLHF o DPO.

## Capacidades

- Deteccion de objetos de vocabulario abierto con salida de cajas delimitadoras normalizadas.
- Localizacion por referencia (referring localization) y point grounding mediante tokens de coordenada.
- Conteo de objetos en imagen.
- OCR con localizacion de texto.
- Segmentacion por referencia (referring expression segmentation) con mascaras densas.
- Alpha matting promptable con salida de mattes alfa continuos a resolucion completa.
- Generacion de texto conversacional sobre imagen (pipeline image-text-to-text).
- Salida estructurada sin cadena de pensamiento explicita, optimizada para eficiencia.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se orienta a percepcion de imagen en un solo turno.

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede generar cajas y mascaras de segmentacion por referencia sobre imagenes nuevas, acelerando el etiquetado de corpus para entrenar detectores y segmentadores downstream.
- Edicion de imagen y postproduccion: la capacidad de matting promptable con alpha continuo a resolucion completa permite extraer sujetos con bordes finos (pelo, transparencias) indicando el objeto mediante texto.
- Analisis documental y digitalizacion: el OCR con localizacion de texto facilita extraer y ubicar campos en facturas, formularios o capturas, integrable en pipelines de procesamiento documental.
- Conteo y control de inventario visual: consultas de conteo sobre imagenes de estanterias, almacenes o escenas permiten estimar cantidades de objetos sin un detector especifico entrenado.
- Robtica e interaccion visual: el point grounding y la localizacion por referencia permiten indicar objetos concretos en la escena mediante lenguaje natural, util para interfaces de seleccion o senalizacion.
- Moderacion y analisis de contenido visual: la deteccion abierta y el conteo permiten filtrar o clasificar imagenes segun la presencia de objetos descritos textualmente.
- Investigacion en grounding visual: como modelo compacto de 2,4 B bajo Apache 2.0, sirve de base para experimentos de percepcion unificada y comparacion de metodos sin requerir grandes recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,4 B en bfloat16 requiere aproximadamente 4,9 GB solo para pesos, mas el decodificador de pixeles (unos 19 MB) y el coste de activaciones y cache; en cuantizacion de 8 bits rondaria 2,5 GB y en 4 bits aproximadamente 1,3 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo es compatible con GPU de consumo con suficiente VRAM; el ejemplo de la model card usa `device="auto"` y `dtype="bfloat16"`.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM en bfloat16, y en tarjetas de 4-6 GB con cuantizacion, si bien no hay confirmacion oficial.
- Opciones de despliegue: el autor publica un paquete de inferencia propio (`wevisone_vl`) disponible en GitHub, basado en transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas de percepcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisOne-VL-2B | 2,44 B + 9,6 M (decodificador) | no disponible | Deteccion, grounding, conteo, OCR, segmentacion, matting | Apache 2.0 | Hugging Face + GitHub |
| Qwen3-VL (familia base) | no disponible en esta ficha | no disponible | Vision-lenguaje general | no disponible en esta ficha | Hugging Face |
| Alternativas de segmentacion promptable (p. ej. SAM) | no disponible en esta ficha | no disponible | Segmentacion y matting | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- Los bordes finos de las mascaras alfa son sensibles a la resolucion de imagen, la oclusion severa, la transparencia compleja y la formulacion del prompt.
- El modelo genera salidas estructuradas sin razonamiento explicito de cadena de pensamiento, lo que puede limitar tareas que requieran inferencia compleja.
- Solo admite percepcion de imagen individual en un turno; el decodificador de pixeles rechaza rejillas de video.
- No esta destinado a decisiones autonomas de alto impacto ni a la identificacion de personas, segun la model card.
- Riesgo de alucinacion en detecciones o descripciones no verificadas; el mecanismo de devolver `None` mitiga falsos positivos pero no los elimina.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- Licencia Apache 2.0 para el codigo de Tencent, pero los componentes de terceros conservan sus licencias originales; es necesario revisar los ficheros fuente antes de un uso comercial.
- No se documentan requisitos de hardware ni rendimiento medido, lo que obliga a realizar pruebas propias antes de dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeVisOne-VL-2B
- Paper (arXiv): https://huggingface.co/papers/2610.31329
- Pagina del proyecto: https://tencent.github.io/WeVisOne-VL
- Repositorio de inferencia: https://github.com/Tencent/WeVisOne-VL
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
