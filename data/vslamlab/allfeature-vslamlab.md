# vslamlab/allfeature-vslamlab

## Resumen

AllFeature-VSLAM es una colección de modelos ONNX orientados a la extracción de características y el emparejamiento (matching) de puntos clave dentro de un pipeline de SLAM visual. No se trata de un modelo de lenguaje, sino de un conjunto de artefactos de inferencia (detectores, descriptores y matchers) empaquetados para ser consumidos por la implementación AllFeature-VSLAM y su baseline `allfeature` dentro del framework VSLAM-LAB. El repositorio, publicado por la organización vslamlab, agrupa variantes de ALIKED-n16, RaCo, LightGlue (para ALIKED, RaCo, SIFT y SuperPoint) y un segmentador EfficientViT-Seg L1 entrenado en ADE20K.

La relevancia de este paquete es práctica: ofrece los modelos ya exportados en fp32 y fp16, con ficheros sidecar `.yaml` que documentan el commit de origen, la URL de los pesos, su hash SHA-256, el exportador utilizado, las entradas y salidas, y los hiperparámetros fijados en el grafo. Esto facilita la reproducibilidad y la integración en pipelines de evaluación de SLAM sin necesidad de reexportar cada red.

El tamaño del repositorio es de 0,8 GB y los pesos están en formato ONNX. La información pública disponible es limitada: no se declara licencia a nivel de repositorio, ni idiomas, ni pipeline de Hugging Face, y el modelo no registra descargas ni interacciones. La model card sí detalla las licencias individuales de cada conjunto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales convolucionales y transformers ligeros para deteccion/descripcion de puntos clave y matching (ALIKED-n16, RaCo, LightGlue, EfficientViT-Seg L1); no es un modelo generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no secuenciales) |
| Tipos de cuantizacion | fp32 y fp16 (pesos y tensores internos; entradas y salidas siempre float32) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible a nivel de repositorio; por componente: ALIKED-n16 BSD-3-Clause, RaCo Apache-2.0, LightGlue Apache-2.0, EfficientViT-Seg segun mit-han-lab/efficientvit |
| Formato de pesos | ONNX con ficheros sidecar `.yaml` (commit de origen, URL de pesos, SHA-256, exportador, entradas/salidas y ajustes del grafo) |

## Arquitectura y entrenamiento

El paquete no contiene un unico modelo, sino varios componentes especializados. ALIKED-n16 actua como detector y descriptor de puntos clave con seleccion top-k; RaCo aporta keypoints con descriptores ALIKED-n16 y covarianzas asociadas; LightGlue implementa el emparejamiento entre descriptores para cuatro backends distintos (ALIKED, RaCo+ALIKED, SIFT y SuperPoint). EfficientViT-Seg L1 es una red de segmentacion semantica entrenada sobre ADE20K a resolucion 512x512, pensada para segmentacion en linea dentro del pipeline.

Todos los modelos de caracteristicas fueron exportados mediante `tools/export_features.py` del repositorio AllFeature-VSLAM, lo que garantiza que las operaciones y los ajustes internos (por ejemplo, el top-k o los umbrales de matching) quedan fijados en el grafo ONNX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta de los datasets ni sobre si se aplicaron tecnicas de refinamiento posteriores; esos datos corresponden a los papers originales de cada red y no se reproducen en la model card.

Un detalle relevante es que el detector SuperPoint no se distribuye en este repositorio porque sus pesos no permiten redistribucion; debe exportarse localmente con `pixi run -e export-features export-features --only superpoint` desde el repositorio AllFeature-VSLAM. El modelo de reconocimiento de lugar MegaLoc se aloja en un repositorio separado.

## Capacidades

- Deteccion y descripcion de puntos clave en imagenes mediante ALIKED-n16 y RaCo.
- Emparejamiento de caracteristicas entre pares de imagenes con LightGlue para ALIKED, RaCo+ALIKED, SIFT y SuperPoint.
- Estimacion de covarianzas asociadas a keypoints en la variante RaCo.
- Segmentacion semantica en linea a 512x512 con EfficientViT-Seg L1 sobre las clases de ADE20K.
- Ejecucion en fp32 y fp16, con entradas y salidas en float32 para facilitar la integracion.
- Integracion directa como baseline `allfeature` dentro de VSLAM-LAB.
- No soporta tool calling, function calling, razonamiento multi-paso ni generacion de texto: no es un modelo linguistico.
- No dispone de capacidades multilingues, de vision generativa, audio ni modo thinking.

## Casos de uso

- Evaluacion de pipelines de SLAM visual: el paquete permite ejecutar el baseline `allfeature` en VSLAM-LAB sin reexportar modelos, comparando variantes de detector y matcher sobre las mismas secuencias.
- Odometria visual en robotica movil: ALIKED-n16 con LightGlue proporciona correspondencias entre frames consecutivos, y la version fp16 reduce el coste computacional en plataformas embebidas con GPU.
- Localizacion y mapeo con informacion semantica: EfficientViT-Seg L1 aporta mascaras por clase que pueden asociarse a los mapas de puntos para filtrar regiones dinamicas o etiquetar el entorno.
- Investigacion en emparejamiento de caracteristicas: las cuatro variantes de LightGlue permiten comparar el rendimiento de SIFT, SuperPoint, ALIKED y RaCo bajo un mismo exportador y formato de grafo.
- Despliegue en entornos con requisitos de reproducibilidad: los hashes SHA-256 y los commits de origen en los sidecar permiten auditar exactamente que pesos se estan ejecutando en produccion.
- Prototipado en C++ o Python con ONNX Runtime: al ser grafos ONNX estandar, pueden integrarse en aplicaciones de escritorio,ROS 2 o servicios de inspeccion visual sin depender del ecosistema PyTorch.
- Procesado por lotes de imagenes para reconstruccion 3D: la extraccion de caracteristicas y el matching pueden ejecutarse fuera de linea sobre conjuntos de imagenes para generar nubes de puntos dispersas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,8 GB, por lo que cada grafo individual es de tamano reducido y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la documentacion; por el tipo de cargas (deteccion, matching y segmentacion a 512x512) son adecuadas GPUs con soporte de ONNX Runtime o TensorRT, como RTX 3060/4060 en adelante, A100 o H100 para procesado por lotes.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; no se especifica el minimo exacto.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, integracion nativa en AllFeature-VSLAM y VSLAM-LAB. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AllFeature-VSLAM (este paquete) | Conjunto ONNX de deteccion, descripcion, matching y segmentacion | no disponible | no aplica | Mixta por componente (BSD-3-Clause, Apache-2.0, ver efficientvit) | Hugging Face (vslamlab/allfeature-vslamlab) |
| SuperPoint (original) | Detector y descriptor | no disponible | no aplica | Pesos no redistribuibles | Exportacion local obligatoria |
| SIFT (clasico) | Detector y descriptor | no aplica (algoritmo) | no aplica | Dominio publico / patentes expiradas | Ampliamente disponible |
| MegaLoc (vslamlab) | Reconocimiento de lugar | no disponible | no aplica | no disponible | Hugging Face (vslamlab/megaloc-models) |

La comparacion con modelos de lenguaje no procede: este paquete compite en el ambito de extraccion de caracteristicas y matching para SLAM, donde las alternativas son las implementaciones originales de ALIKED, SuperPoint, LightGlue y SIFT, no modelos generativos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- La licencia a nivel de repositorio no esta declarada; el uso comercial depende de la licencia de cada componente (BSD-3-Clause, Apache-2.0 y la de EfficientViT), que debe verificarse antes de desplegar.
- El detector SuperPoint no se incluye por restricciones de redistribucion de sus pesos; hay que exportarlo localmente.
- Los modelos estan pensados para ser leidos por versiones concretas del paquete `allfeature` (etiquetas como `v1.1.0`); descargar desde `main` puede provocar incompatibilidades.
- Las entradas y salidas son siempre float32 aunque los pesos sean fp16, lo que limita parte del ahorro de memoria a los tensores internos.
- No se publican benchmarks, latencias ni umbrales de rendimiento, por lo que la evaluacion comparativa debe realizarse por el usuario.
- Riesgo de sesgo y alucinacion: no aplica en el sentido linguistico, pero los segmentadores y detectores pueden fallar en condiciones de iluminacion adversas, texturas repetitivas o escenas fuera de la distribucion de ADE20K.
- El repositorio no registra descargas ni interacciones, lo que reduce la evidencia externa sobre su validacion en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vslamlab/allfeature-vslamlab
- Repositorio AllFeature-VSLAM: https://github.com/alejandrofontan/AllFeature-VSLAM
- Framework VSLAM-LAB: https://github.com/VSLAM-LAB/VSLAM-LAB
- Modelos MegaLoc: https://huggingface.co/vslamlab/megaloc-models
- EfficientViT (mit-han-lab): https://github.com/mit-han-lab/efficientvit
