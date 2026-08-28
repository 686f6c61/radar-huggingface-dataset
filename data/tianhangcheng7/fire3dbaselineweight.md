# TianhangCheng7/Fire3DBaselineWeight

## Resumen

Este repositorio no contiene un modelo original, sino un espejo de conveniencia de los pesos de dos modelos de percepción 3D desarrollados por Meta Platforms, Inc.: EVL (también conocido como EFM3D) y SceneScript. Ambos modelos forman parte del ecosistema Project Aria y están diseñados para tareas de detección de objetos 3D egocéntrica y reconstrucción de escenas a partir de datos de sensores portátiles. El autor del repositorio, TianhangCheng7, los redistribuye únicamente para facilitar la descarga en entornos automatizados, ya que los enlaces originales requieren un formulario de aceptación de licencia y expiran.

El contenido incluye tres archivos: dos variantes del modelo EVL (una completa y otra ligera para GPUs de escritorio) y un checkpoint del modelo ASE de SceneScript. No se proporcionan detalles sobre la arquitectura interna, el número de parámetros ni el contexto de entrenamiento en la información disponible. La licencia no está especificada en el repositorio, pero se indica que el uso está sujeto a los términos de la licencia de Project Aria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos de deteccion 3D y reconstruccion de escenas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible en el repositorio; sujeta a los terminos de Project Aria de Meta |
| Formato de pesos | PyTorch (.pth y .ckpt) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los modelos. Se sabe que EVL (EFM3D) es un modelo de deteccion de objetos 3D con regresion de superficie, mientras que SceneScript es un modelo autoregresivo de lenguaje estructurado que reconstruye escenas 3D generando representaciones textuales de la geometria y las clases de los objetos. Ambos fueron entrenados por Meta y sus pesos se distribuyen originalmente a traves del programa Project Aria. No se proporcionan datos sobre el conjunto de entrenamiento, el numero de tokens ni el proceso de optimizacion (RLHF, DPO, etc.). El repositorio no contiene informacion sobre innovaciones tecnicas especificas.

## Capacidades

- Deteccion de objetos 3D en entornos egocentricos (EVL/EFM3D), incluyendo localizacion espacial y clasificacion.
- Regresion de superficies para estimar la geometria de los objetos detectados.
- Reconstruccion de escenas completas mediante el modelo SceneScript, que predice el layout de la habitacion y las cajas delimitadoras con clases asociadas.
- Procesamiento de nubes de puntos y datos de sensores de profundidad (inferido de la etiqueta `point-cloud`).
- Variante ligera (`model_lite.pth`) optimizada para GPUs de escritorio con menor consumo de VRAM.

## Casos de uso

- Investigacion en percepcion 3D egocentrica: el modelo EVL puede utilizarse para evaluar el progreso en tareas de deteccion de objetos en secuencias capturadas con gafas inteligentes o dispositivos portatiles, como las del benchmark EFM3D.
- Reconstruccion de interiores para robotica domestica: SceneScript permite generar un modelo 3D estructurado de una habitacion a partir de datos de sensores, util para navegacion y planificacion de movimientos.
- Desarrollo de asistentes de realidad aumentada: la deteccion de objetos 3D en tiempo real puede integrarse en aplicaciones que superpongan informacion contextual sobre el entorno fisico.
- Analisis de entornos industriales: inspeccion de almacenes o fabricas mediante captura de nubes de puntos, identificando objetos y su disposicion espacial.
- Creacion de gemelos digitales: combinando EVL y SceneScript se puede generar una representacion digital de un espacio fisico para simulacion o monitorizacion remota.
- Evaluacion comparativa de modelos de percepcion: al ser los checkpoints oficiales de los baselines, sirven como referencia para medir el rendimiento de nuevos modelos en las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo indica que `model_release.pth` requiere aproximadamente 20 GB de VRAM, lo que sugiere que esta pensado para GPUs de alta gama, mientras que `model_lite.pth` es una variante para escritorio con requisitos menores. No hay datos de latencia ni throughput.

## Requisitos de hardware

- `model_release.pth` (EVL completo): requiere ~20 GB de VRAM, apto para GPUs como NVIDIA A100, RTX 4090 o superiores.
- `model_lite.pth` (EVL ligero): variante para GPUs de escritorio, con requisitos de VRAM no especificados pero presumiblemente inferiores a los del modelo completo.
- `ase_model.ckpt` (SceneScript): tamano de 114 MB, probablemente ejecutable en GPUs de gama media, aunque no se indica el consumo de VRAM.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje. La carga se realiza mediante PyTorch.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio ni en los resultados de busqueda. La comparativa no esta disponible.

## Limitaciones y advertencias

- Los pesos no fueron entrenados por el autor del repositorio; son propiedad de Meta Platforms, Inc. y su uso esta sujeto a las licencias de Project Aria, que pueden restringir el uso comercial o la redistribucion.
- El repositorio es un espejo no oficial; Meta puede solicitar su retirada en cualquier momento, lo que afectaria a la disponibilidad de los archivos.
- No se incluye la secuencia de prueba `seq136_sample` que acompanaba al paquete original, por lo que la verificacion del funcionamiento puede requerir datos adicionales.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto, al no tratarse de un modelo de lenguaje.
- La licencia exacta no esta especificada en el repositorio; es responsabilidad del usuario revisar los terminos en las paginas oficiales de Project Aria antes de cualquier uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TianhangCheng7/Fire3DBaselineWeight
- Repositorio GitHub del baseline: https://github.com/Tianhang-Cheng/Fire3DPerceptBaseline
- Pagina del proyecto EVL/EFM3D: https://www.projectaria.com/research/efm3D/
- Paper EFM3D: https://arxiv.org/abs/2406.10224
- Pagina de SceneScript: https://www.projectaria.com/scenescript/
- Paper SceneScript: https://arxiv.org/abs/2403.13064
- Modelos Boxer/DinoV3/OWLv2 relacionados: https://huggingface.co/facebook/boxer
