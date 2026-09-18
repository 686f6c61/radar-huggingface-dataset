# Yang-Tian/Mira-Scene

## Resumen

Mira-Scene es un modelo de reconstrucción de escenas 3D editables a partir de una única imagen. Lo publica el usuario Yang-Tian en Hugging Face y forma parte de un proyecto mayor con código disponible en GitHub (organizaciones vast-enterprise y VAST-AI-Research). El repositorio alberga un único componente del pipeline completo: el checkpoint de difusión que predice un canonical coordinate map (CCM) y una representación de vóxeles dispersos para cada objeto segmentado de la imagen.

El pipeline completo encadena segmentación de instancias, estimación de profundidad monocular, predicción de CCM y ocupación, generación de malla por objeto, ensamblaje de escena consciente de relaciones de soporte (support-aware) y generación de environment map. El checkpoint liberado aquí se empaqueta como `CCMVoxelPipeline` e integra un codificador de imagen DINOv2-with-registers, un scheduler de flow matching, un transformer de difusión CCM/vóxel, un VAE de estructura dispersa y la configuración del preprocesador de imagen.

Su relevancia es acotada pero concreta: no es un modelo autónomo de image-to-GLB, sino una etapa intermedia pensada para integrarse en sistemas de reconstrucción de escenas y en flujos de trabajo de robótica, contenido 3D o realidad aumentada. El repositorio ocupa 6,4 GB y se distribuye bajo la librería `diffusers`, sin licencia ni idiomas declarados y sin métricas de uso publicadas (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (CCM/voxel diffusion transformer) con flow matching; encoder de imagen DINOv2-with-registers; VAE de estructura dispersa (sparse-structure VAE); empaquetado como `CCMVoxelPipeline` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: la entrada es una imagen mas mascaras por instancia, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `diffusers`; repositorio de 6,4 GB) |

## Arquitectura y entrenamiento

La etapa liberada es un modelo de difusion que opera sobre una imagen y las mascaras de instancia preparadas por la etapa de segmentacion. Su salida combina un canonical coordinate map alineado a pixel y una representacion de voxeles dispersos por objeto. La arquitectura interna declarada por el autor incluye cuatro piezas: un encoder de imagen DINOv2 con registros, un scheduler de flow matching, un transformer de difusion especifico para CCM/voxel y un VAE que codifica estructura dispersa. El conjunto se expone mediante la clase `CCMVoxelPipeline` y se ejecuta con la libreria `diffusers`.

No se especifican en la informacion disponible el numero de parametros, el volumen de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni detalles sobre el coste de inferencia. El diseno destacable es conceptual: separar la prediccion de estructura geometrica (CCM mas voxeles) de la generacion de malla, de modo que el ensamblaje posterior pueda ser consciente de las relaciones de soporte entre objetos y la escena resulte editable.

## Capacidades

- Prediccion de canonical coordinate map (CCM) alineado al pixel a partir de una imagen y mascaras por instancia.
- Prediccion de una representacion de voxeles dispersos por objeto, apta para alimentar un backend de malla.
- Integracion en un pipeline de reconstruccion de escena completa: segmentacion, profundidad monocular, CCM/ocupacion, malla por objeto, ensamblaje support-aware y environment map.
- Generacion de escenas 3D editables por objetos, al mantener cada instancia separada hasta el ensamblaje.
- Ejecucion de la etapa CCM de forma aislada sobre casos ya preparados (`2_inference_CCM.py`), util para depuracion e investigacion de la etapa de difusion.
- Inferencia por lotes sobre un directorio de imagenes mediante `infer_scripts/pipeline.py`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modos de pensamiento.

## Casos de uso

- Robotica de manipulacion: el modelo reconstruye la geometria de los objetos de la escena y sus relaciones de soporte, informacion necesaria para planificar agarres y apilamientos sobre superficies reales en lugar de trabajar con nubes de puntos sin semantica de contacto.
- Generacion de assets para videojuegos y simuladores: a partir de una captura de una habitacion se obtienen mallas por objeto que pueden importarse a un motor y recolocarse o editarse individualmente, en lugar de recibir una malla unica no desglosada.
- Digitalizacion para gemelos digitales en arquitectura e interiorismo: la escena reconstruida conserva objetos separados, lo que permite sustituir mobiliario o medir distancias sin volver a capturar el espacio.
- Realidad aumentada y VR: el environment map y la geometria por objeto permiten colocar contenido sintetico con oclusiones coherentes respecto a los objetos reales de la imagen.
- Datos sinteticos para percepcion: la reconstruccion editable sirve para generar variaciones de escena (mover, eliminar o reemplazar objetos) y aumentar datasets de entrenamiento con pares imagen-3D etiquetados.
- Edicion de escena para VFX y previsualizacion: el desglose por instancias y el CCM facilitan reapuntar la geometria antes de pasar a un pipeline de renderizado profesional.
- Catalogos de producto en 3D: a partir de una fotografia de catalogo se puede obtener una malla por objeto, siempre que la etapa de segmentacion aísle correctamente el producto y las oclusiones sean moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se proporcionan metricas de reconstruccion (Chamfer distance, F-score, IoU de voxeles, PSNR de vistas noveles), ni comparaciones con otros metodos, ni datos de latencia o throughput.

## Requisitos de hardware

- El repositorio de pesos ocupa 6,4 GB, por lo que el checkpoint nativo requiere del orden de esa cifra de memoria solo para los pesos, a la que hay que sumar el encoder DINOv2, el VAE disperso, el preprocesador y el estado intermedio del proceso de difusion. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- El pipeline completo consume ademas los checkpoints de terceros de segmentacion, profundidad y malla, y cada etapa puede tener su propio entorno de ejecucion, tal como indica el autor. El coste agregado de VRAM no esta cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. Con 6,4 GB de pesos, un unico modelo de este tamano cabria con holgura en GPU de consumo con 16 GB o mas (por ejemplo, RTX 4080 o RTX 4090), pero la viabilidad depende de las etapas adicionales, no cuantificadas.
- Opciones de despliegue: `diffusers` con PyTorch (formato soportado de forma nativa). No se documentan recetas para vLLM, TGI, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni resultados que permitan situar Mira-Scene frente a otras propuestas de reconstruccion de escena 3D a partir de una imagen. Cabe senalar que la model card menciona el uso de checkpoints de terceros para segmentacion, profundidad y malla, pero no detalla sus identificadores, por lo que no es posible construir una comparativa fiable.

## Limitaciones y advertencias

- No es un modelo autonomo de image-to-GLB: es una unica etapa del pipeline. Necesita imagenes con mascaras por instancia ya preparadas por la etapa de segmentacion, y sus salidas requieren un backend de malla y las etapas de construccion de escena.
- Requiere descargar y configurar checkpoints de terceros para segmentacion, profundidad y generacion de malla, con entornos especificos por etapa, lo que aumenta la complejidad de despliegue y el consumo de recursos.
- La licencia no esta declarada en el repositorio. Sin licencia explicita no hay autorizacion clara para uso comercial, por lo que cualquier integracion en producto deberia aclararse antes con los autores.
- No se publican benchmarks ni evaluaciones cuantitativas, de modo que la calidad de reconstruccion no puede verificarse a partir de la informacion disponible.
- El repositorio no presenta descargas ni likes, y su fecha de creacion declarada es futura respecto a la fecha habitual de consulta, lo que sugiere escasa o nula validacion por parte de la comunidad.
- La reconstruccion depende de la profundidad monocular y de la segmentacion: errores u oclusiones severas en esas etapas se propagan a la geometria final, y objetos muy delgados, transparentes o reflectantes son casos tipicamente problematicos en este tipo de metodos.
- Se observan dos organizaciones distintas en los enlaces de GitHub del autor (`vast-enterprise` y `VAST-AI-Research`), lo que puede indicar una migracion del proyecto; conviene verificar cual es el repositorio canonico y si el codigo y los identificadores de checkpoints de terceros siguen vigentes.
- No se declaran idiomas soportados porque el modelo no procesa lenguaje natural; no debe esperarse ninguna capacidad textual, de tool calling ni de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Yang-Tian/Mira-Scene
- Repositorio GitHub citado en la model card: https://github.com/vast-enterprise/Mira-Scene
- Guia de entorno y checkpoints: https://github.com/VAST-AI-Research/Mira-Scene/blob/main/infer_scripts/docs/environment.md#checkpoint-download-and-configuration
