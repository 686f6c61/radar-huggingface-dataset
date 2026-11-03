# TechnoBaptist/WeVisOne-VL-4B

## Resumen

WeVisOne-VL-4B es un modelo vision-lenguaje unificado desarrollado por WeChat Vision (Tencent Inc.) que aborda la percepcion visual a dos niveles: a nivel de objeto (deteccion de objetos de vocabulario abierto, localizacion por referencia, conteo de objetos, pointing y OCR) y a nivel de pixel (segmentacion por referencia y alpha matting con prompt). El modelo se construye sobre Qwen3-VL y unifica ambas tareas mediante prediccion estructurada de siguiente token y un decodificador de pixeles ligero de 9,6 millones de parametros.

La relevancia del modelo reside en su propuesta de unificar tareas tradicionalmente separadas (deteccion, segmentacion, matting) en un unico modelo generativo con salida estructurada, evitando pipelines multi-etapa. Con 4.830.581.248 parametros totales y pesos en safetensors, se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion en entornos de investigacion y comerciales.

El modelo emplea tokens de coordenada dedicados (`<0>` a `<1000>`) para representar cajas delimitadoras y puntos normalizados, y devuelve `None` cuando el objetivo consultado no esta presente, lo que reduce falsos positivos en tareas de grounding. Esta orientado a investigacion en percepcion visual y no a decisiones autonomas de alto impacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) con decodificador de pixeles acoplado |
| Parametros totales | 4.830.581.248 (modelo principal) + 9.609.764 (mask_decoder.pt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo principal) y mask_decoder.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL como backbone vision-lenguaje y anade un decodificador de pixeles de 9.609.764 parametros (`mask_decoder.pt`) que constituye un componente central obligatorio. Este decodificador combina tres elementos: un adaptador de caracteristicas visuales sobre caracteristicas ViT multi-nivel de Qwen3-VL previas al merging; un decodificador de consultas guiado por caja con 6 bloques de atencion cruzada deformable inicializados desde el estado oculto del token `<OBJ>` y una caja previa codificada con Fourier; y una cabeza de prediccion densa condicionada por instancia con `FullCanvasAlphaCascadeHead`, que refina predicciones en escalas S/4, S/2 y S/1 para producir alpha mattes continuos a resolucion completa con stride 1.

La generacion se realiza mediante prediccion estructurada de siguiente token: el modelo emite tokens de coordenada dedicados (`<0>` a `<1000>`) para cajas y puntos normalizados, y un token especial de instancia (`<OBJ>`, ID 152678) tras cada caja predicha en tareas densas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo genera salidas estructuradas directamente sin cadena de pensamiento (CoT) explicita, por eficiencia de inferencia.

## Capacidades

- Deteccion de objetos de vocabulario abierto con salida de cajas delimitadoras normalizadas.
- Localizacion por referencia (referring localization) y pointing de objetos.
- Conteo de objetos en imagenes.
- OCR con localizacion de texto.
- Segmentacion por referencia (referring expression segmentation) a nivel de pixel.
- Alpha matting promptable con salida de mattes continuos a resolucion completa.
- Percepcion de imagen de un solo turno (los grids de video son rechazados por el decodificador de pixeles).
- Generacion de texto conversacional (pipeline image-text-to-text).
- Retorno de `None` cuando el objetivo consultado no esta presente, lo que mitiga falsos positivos.

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede generar cajas delimitadoras y mascaras de segmentacion para imagenes de entrenamiento, reduciendo el coste de etiquetado manual en pipelines de datos.
- Edicion de imagen y postproduccion: el alpha matting promptable permite extraer sujetos con bordes suaves (pelo, transparencias) indicando el objeto mediante texto, util para composicion y efectos.
- Moderacion de contenido visual: la deteccion de vocabulario abierto y el conteo de objetos permiten identificar elementos concretos en imagenes de usuario sin necesidad de clasificadores especificos por categoria.
- Digitalizacion de documentos: el OCR con localizacion de texto permite extraer y ubicar texto en imagenes de documentos, facturas o capturas, integrable en flujos de extraccion de datos.
- Robotica e interaccion visual: el point-grounding y la localizacion por referencia permiten a un agente identificar y senalar objetos concretos en la escena a partir de instrucciones en lenguaje natural.
- Analisis de imagenes medicas o industriales (investigacion): la segmentacion por referencia y el conteo permiten cuantificar y delimitar regiones de interes descritas textualmente en imagenes de microscopia o inspeccion.
- Busqueda visual y recuperacion: la deteccion de vocabulario abierto y el OCR permiten indexar imagenes por objetos y texto presentes, habilitando busquedas semantico-visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4,8 mil millones de parametros en bfloat16 requiere aproximadamente 9,7 GB solo para pesos, a los que se suman el decodificador de pixeles y las activaciones; en cuantizacion de 8 bits rondaria los 5 GB y en 4 bits unos 2,5-3 GB, si bien el autor no publica cuantizaciones ni cifras oficiales.
- GPU recomendadas: no disponible. Por tamano, cabria esperar ejecucion en GPUs consumer de 12-16 GB de VRAM o superiores (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090) en bfloat16, y en GPUs de datacenter (A100, H100) para mayor throughput, pero no hay datos oficiales.
- Cabe en GPU consumer: probablemente si en GPUs con 12 GB o mas de VRAM, aunque no confirmado por el autor.
- Opciones de despliegue: el autor proporciona un paquete de inferencia propio (`wevisone_vl` desde GitHub) con API `WeVisOneVL(...).predict(...)`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisOne-VL-4B | 4,83 B (+9,6 M decodificador) | no disponible | Deteccion, grounding, conteo, pointing, OCR, segmentacion, matting | Apache 2.0 | HuggingFace + GitHub |
| Qwen3-VL (base) | no disponible | no disponible | Vision-lenguaje general | no disponible | HuggingFace |
| Alternativas de segmentacion/grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Los bordes finos de los alpha mattes son sensibles a la resolucion de imagen, la oclusion severa, la transparencia compleja y la formulacion del prompt.
- El modelo genera salidas estructuradas sin cadena de pensamiento (CoT) explicita, lo que puede limitar el razonamiento en consultas complejas.
- Solo soporta percepcion de imagen de un solo turno; los grids de video son rechazados por el decodificador de pixeles.
- No esta destinado a decisiones autonomas de alto impacto ni a la identificacion de individuos.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 aplica al codigo y componentes de Tencent; los componentes de terceros conservan sus licencias originales y deben revisarse antes de su uso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- El modelo requiere el decodificador `mask_decoder.pt` como componente obligatorio, lo que anade complejidad de despliegue frente a un modelo vision-lenguaje estandar.

## Enlaces

- HuggingFace: https://huggingface.co/TechnoBaptist/WeVisOne-VL-4B
- Paper (arXiv): https://huggingface.co/papers/2610.31329
- Project Page: https://tencent.github.io/WeVisOne-VL
- GitHub (inferencia): https://github.com/Tencent/WeVisOne-VL
