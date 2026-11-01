# torch-pointcloud/volt-s-joint.scannet20.kadir-yilmaz

## Resumen

Volt-s-joint.scannet20.kadir-yilmaz es un checkpoint de segmentación semántica de nubes de puntos 3D desarrollado por el autor Kadir Yilmaz y distribuido en HuggingFace por la organización torch-pointcloud. Implementa la arquitectura Volume Transformer, un transformer "vanilla" que opera sobre tokens de parches volumétricos en lugar de recurrir a operadores de convolución dispersa o mecanismos de atención específicos para 3D. El modelo resuelve la asignación de una etiqueta semántica a cada punto de una escena interior capturada con sensores RGB-D o LiDAR.

Con 23,7 millones de parámetros, es un modelo compacto pensado para integrarse en pipelines de percepción 3D. Este checkpoint concreto conserva el clasificador de 20 clases de ScanNet, aunque fue entrenado de forma conjunta sobre ScanNet, ScanNet200, ScanNet++ y ARKitScenes, con un clasificador independiente por conjunto de etiquetas. La relevancia actual radica en que demuestra que un transformer estándar, sin sesgos inductivos específicos de 3D, puede competir con arquitecturas especializadas en segmentación de escenas interiores.

La licencia del checkpoint es MIT, si bien el entrenamiento conjunto incorpora ScanNet++ y ARKitScenes, cuyos términos son no comerciales, lo que introduce una advertencia importante para uso productivo. El modelo requiere kernels GPU-only (flash-attn) y se distribuye a través de la librería torch-pointcloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Volume Transformer (transformer plano sobre tokens de parches volumetricos) |
| Parametros totales | 23.687.444 (23,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision 3D, no linguistico) |
| Licencia | MIT (checkpoint); datos de entrenamiento con terminos no comerciales parciales |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posicion, color, normal) |
| Clases de salida | 20 (ScanNet) |
| Dimension de caracteristicas | 128 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Volume Transformer descrita en el paper "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (Yilmaz et al., ECCV 2026). Se trata de un transformer plano que tokeniza la nube de puntos en parches volumetricos y aplica auto-atencion estandar sobre ellos, sin convoluciones dispersas ni mecanismos de atención jerarquicos especificos de 3D. La entrada tiene 6 canales (coordenadas, color y normales) y el modelo produce caracteristicas de 128 dimensiones que alimentan un clasificador por punto.

El checkpoint fue entrenado de forma conjunta sobre cuatro conjuntos de datos: ScanNet, ScanNet200, ScanNet++ y ARKitScenes, manteniendo un clasificador separado por conjunto de etiquetas; esta version conserva el de 20 clases de ScanNet. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en este dominio). El modelo deriva de KadirYilmaz/Volt (MIT) y ha sido convertido al formato de la libreria torch-pointcloud.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D en 20 clases de interiores (ScanNet).
- Procesamiento de muestras de 8192 puntos con posicion, color y normales como entrada.
- Extraccion de caracteristicas densas por punto (128 dimensiones) mediante `forward_features`.
- Clasificacion por punto a partir de los logits devueltos por el modelo.
- Reutilizacion del backbone para tareas downstream (congelando el clasificador con `reset_classifier(num_classes=0)`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales de texto.
- No se documentan capacidades multilingues (no aplica).

## Casos de uso

- Segmentacion de escenas interiores para robotica movil: el modelo etiqueta suelo, paredes, muebles y otros elementos a partir de la nube de puntos captada por LiDAR o RGB-D, permitiendo a un robot construir mapas semanticos y planificar la navegacion.
- Reconstruccion 3D aumentada semanticamente: integrado en pipelines de fotogrametria o SLAM, asigna etiquetas a cada punto de la malla reconstruida para generar gemelos digitales de interiores con capas semanticas.
- Anotacion asistida de datasets: preetiqueta nubes de puntos nuevas con las 20 clases de ScanNet para reducir el coste de etiquetado manual en proyectos de percepcion 3D.
- Analisis de escenas AR/VR: en aplicaciones de realidad aumentada, identifica superficies y objetos para anclar contenido virtual o habilitar interacciones fisicas coherentes.
- Extraccion de caracteristicas para clasificacion de escenas: usando `forward_features`, las caracteristicas de 128 dimensiones pueden alimentar clasificadores de escena o tareas de recuperacion (retrieval) sin reentrenar el backbone.
- Investigacion en arquitecturas 3D: al ser un transformer plano, sirve como baseline reproducible para comparar con enfoques de convolucion dispersa o atencion especifica de 3D en experimentos academicos.
- Automatizacion en inspeccion de interiores: segmentacion de elementos estructurales para inventariado, medicion o deteccion de anomalias en escaneos de edificios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor |
|---|---|
| mIoU (ScanNet 20 clases) | 80,18 |
| OA (ScanNet 20 clases) | 92,81 |
| simple/mIoU | 79,50 |
| simple/OA | 92,45 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 23,7 M de parametros en fp32 el modelo ocupa aproximadamente 95 MB, pero los kernels de atencion y los tensores intermedios para 8192 puntos incrementan el consumo real.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de flash-attn compatible con la version de torch y CUDA instalada (por ejemplo, A100, H100, RTX 4090, RTX 3090).
- Cabe en GPU de consumo: si, en principio cualquier GPU NVIDIA moderna que soporte flash-attn; no se especifican requisitos minimos exactos.
- Opciones de despliegue: libreria torch-pointcloud (`pip install torch-pointcloud`) con `flash-attn` compilado para la combinacion de torch y CUDA del entorno; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de segmentacion de nubes de puntos con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El checkpoint esta especializado en 20 clases de ScanNet; no cubre las 200 clases de ScanNet200 ni las etiquetas de ScanNet++ o ARKitScenes, pese a haber sido entrenado conjuntamente.
- El entrenamiento conjunto con ScanNet++ y ARKitScenes introduce terminos no comerciales en los datos; aunque la licencia del checkpoint es MIT, conviene revisar las condiciones de los datasets antes de un uso comercial.
- Requiere GPU y kernels `flash-attn` compilados especificamente para la version de torch y CUDA; no funciona en CPU segun el ejemplo de uso ("GPU-only kernels").
- Riesgo de degradacion en escenas fuera de la distribucion de ScanNet (exteriores, objetos industriales, sensores distintos a RGB-D).
- No se documentan sesgos especificos ni tasas de error por clase; los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`).
- El modelo no procesa texto ni mantiene conversaciones; no debe evaluarse con criterios de LLM.
- No hay informacion sobre robustez ante ruido en la nube de puntos, oclusiones o densidades distintas a las del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/volt-s-joint.scannet20.kadir-yilmaz
- Modelo original: https://huggingface.co/KadirYilmaz/Volt
- Paper: https://arxiv.org/abs/2604.19609
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion: https://pytorch-pointcloud.org/latest/installation/
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
