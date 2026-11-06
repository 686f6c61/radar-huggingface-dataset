# torch-pointcloud/minkunet18-w20.semantickitti.mit-han-lab

## Resumen

MinkUNet18-W20 es un modelo de segmentación semántica de nubes de puntos LiDAR, desarrollado originalmente en el MIT (MIT HAN Lab) y empaquetado para Hugging Face por el proyecto `torch-pointcloud`. Implementa una U-Net residual con convoluciones dispersas de Minkowski (Minkowski Convolutional Neural Networks), una variante de convolución 3D que opera únicamente sobre vóxeles ocupados, evitando el coste computacional de las convoluciones densas sobre el espacio vacío. El checkpoint está entrenado sobre el dataset SemanticKITTI para la tarea de segmentación semántica de secuencias LiDAR de escenas de conducción urbana.

El modelo es compacto: 8,8 millones de parámetros, 4 canales de entrada (coordenadas XYZ más intensidad), 61 características internas y una cabeza de clasificación de 19 clases. A pesar de su tamaño reducido, alcanza un mIoU de 60,26 y una precisión global (OA) de 91,94 en SemanticKITTI, cifras declaradas por el autor en la model card y no verificadas de forma independiente. Es relevante para desarrolladores que necesitan un baseline ligero y desplegable de segmentación LiDAR sin recurrir a arquitecturas densas de mayor coste.

La ficha corresponde a un checkpoint de visión 3D, no a un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Su utilidad está en pipelines de percepción para robótica, vehículos autónomos y análisis de escenas 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet (U-Net residual con convoluciones dispersas de Minkowski, variante W20) |
| Parametros totales | 8.779.092 (8,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada es una nube de puntos, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión 3D, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `spconv` compilado para la version de torch y CUDA) |

## Arquitectura y entrenamiento

MinkUNet18-W20 es una red encoder-decoder con conexiones residuales, construida sobre convoluciones dispersas de Minkowski. La variante W20 indica un ancho de canal base de 20, lo que explica el bajo numero de parametros (8,8 M). La entrada tiene 4 canales (coordenadas espaciales e intensidad) y la salida es una clasificacion por punto en 19 clases. La representacion interna final tiene 61 caracteristicas, expuestas mediante `forward_features` y accesibles tras `reset_classifier(num_classes=0)`.

El entrenamiento se realizo sobre SemanticKITTI, un dataset de secuencias LiDAR de escenas urbanas con anotaciones semanticas densas. No se dispone en la informacion proporcionada de detalles sobre numero de tokens, composicion exacta del dataset, tecnicas de aumento de datos ni si hubo etapas de refinamiento posteriores. El checkpoint fue convertido desde el repositorio `mit-han-lab/spvnas` (licencia MIT) y se distribuye a traves de la libreria `torch-pointcloud`.

## Capacidades

- Segmentacion semantica de nubes de puntos LiDAR en 19 clases (vehiculos, peatones, vegetacion, infraestructura viaria, etc.).
- Procesamiento de nubes de puntos dispersas mediante convoluciones de Minkowski, eficiente en escenas con alta proporcion de espacio vacio.
- Extraccion de caracteristicas por punto (61 dimensiones) para tareas downstream como clustering, deteccion o clasificacion.
- Inferencia solo en GPU: los kernels de `spconv` requieren CUDA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo de pensamiento (thinking mode), vision 2D ni audio.

## Casos de uso

- Percepcion para vehiculos autonomos: el modelo segmenta cada punto LiDAR de la escena en clases semanticas, alimentando modulos de planificacion y evasion de obstaculos con una representacion 3D etiquetada a nivel de punto.
- Robotica movil en interiores y exteriores: con 8,8 M de parametros, puede ejecutarse en GPUs de a bordo de robots para clasificar el entorno en tiempo real a partir de LiDAR 3D.
- Etiquetado asistido de datos LiDAR: el modelo pre-etiqueta nubes de puntos y reduce el trabajo manual de anotacion, que es especialmente costoso en datasets 3D.
- Analisis de escenas urbanas: segmentacion de infraestructura viaria, vegetacion y mobiliario urbano en levantamientos LiDAR para inventarios y estudios de accesibilidad.
- Baseline de investigacion: punto de partida ligero para comparar nuevas arquitecturas de segmentacion 3D sobre SemanticKITTI sin el coste de entrenar modelos densos.
- Extraccion de caracteristicas para tareas downstream: las 61 dimensiones por punto permiten entrenar cabezas ligeras de clasificacion, deteccion de anomalias o clustering sobre la representacion aprendida.
- Integracion en pipelines de mapeado 3D: segmentacion de secuencias LiDAR para construir mapas semanticos de entornos de conduccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion de nubes de puntos | mIoU | 60,26 |
| SemanticKITTI | Segmentacion de nubes de puntos | OA (accuracy) | 91,94 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por clase, por secuencia ni comparativas oficiales con otras arquitecturas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la informacion proporcionada; con 8,8 M de parametros el peso del modelo es del orden de decenas de MB en FP32, por lo que el consumo dominante proviene de la nube de puntos y de los buffers de `spconv`, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la build de `spconv`; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, en principio cualquier GPU NVIDIA consumer con soporte CUDA y la build de `spconv` correspondiente; no se detalla una lista cerrada de modelos compatibles.
- Opciones de despliegue: `torch-pointcloud` con `spconv` (requiere compilacion acorde a la version de torch y CUDA); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (parametros, contexto, rendimiento, licencia y disponibilidad) para construir una comparativa fiable. La model card unicamente referencia el repositorio de origen `mit-han-lab/spvnas` y el paper de Minkowski Convolutional Neural Networks, sin tablas comparativas con alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentacion semantica de nubes de puntos LiDAR; no realiza generacion de texto, razonamiento, codigo, matematicas ni tareas de vision 2D.
- Entrenado sobre SemanticKITTI, con dominio acotado a escenas de conduccion urbana; el rendimiento fuera de ese dominio (interiores, otros sensores LiDAR, densidades de puntos distintas) no esta documentado.
- Los resultados de benchmarks (mIoU 60,26 y OA 91,94) estan declarados por el autor y marcados como no verificados.
- Requiere GPU y una build de `spconv` compatible con la version de torch y CUDA, lo que complica el despliegue en entornos sin CUDA o con versiones no soportadas.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un modelo discriminativo por punto, el riesgo principal es la clasificacion erronea de puntos, no la invencion de contenido.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright y la licencia.
- El numero de descargas (18) y de likes (0) es muy bajo, por lo que el soporte de la comunidad y la validacion externa son limitados.
- No se dispone de informacion sobre calibracion de incertidumbre, robustez frente a ruido o condiciones meteorologicas adversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/minkunet18-w20.semantickitti.mit-han-lab
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de origen (spvnas, MIT HAN Lab): https://github.com/mit-han-lab/spvnas
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
