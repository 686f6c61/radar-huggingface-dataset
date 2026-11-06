# tetris-db/b3d-fasterrcnn

## Resumen

b3d-fasterrcnn es un modelo de deteccion de objetos basado en Faster R-CNN X101-32x8d-FPN, implementado sobre la libreria detectron2 y publicado por el autor tetris-db. Se trata de un fine-tuning del checkpoint original de COCO sobre recortes de vehiculos etiquetados manualmente del dataset B3D (Berkeley DeepDrive Drone), con una unica clase `vehicle`, entrenado a escala 4K nativa. El modelo se utilizo para generar las pre-etiquetas que posteriormente fueron corregidas por humanos para construir el ground truth del conjunto de test de B3D empleado en la revision del trabajo Tetris.

El modelo resuelve el problema de deteccion de vehiculos en imagenes aereas de alta resolucion capturadas por dron, un escenario con objetos pequenos y densos que los detectores genericos entrenados en COCO no manejan bien. Su relevancia actual radica en que sirve como referencia reproducible para pipelines de deteccion en imagenes 4K, y en que expone abiertamente la configuracion de entrenamiento (resizing desactivado, 500 detecciones por imagen) junto con los pesos finales.

La arquitectura es la clasica Faster R-CNN de dos etapas con backbone ResNeXt-101 de 32x8d y FPN, sin innovaciones arquitectonicas propias: el valor esta en el ajuste fino y en el contexto de datos aereos. El repositorio ocupa 0,4 GB y contiene `config.yaml` y `model_final.pth`. No se proporcionan datos de rendimiento, idiomas ni parametros cuantitativos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNeXt-101 (32x8d) y FPN, sobre detectron2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | other |
| Formato de pesos | `.pth` (PyTorch, checkpoint detectron2 `model_final.pth`) |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabeza de clasificacion y regresion refina cada propuesta. El backbone es ResNeXt-101 con cardinalidad 32 y profundidad de grupo 8, combinado con una Feature Pyramid Network (FPN) para detectar objetos a multiples escalas. El modelo parte del checkpoint preentrenado en COCO y se ajusta fino sobre recortes de vehiculos del dataset B3D (Berkeley DeepDrive Drone) con una sola clase `vehicle`.

El entrenamiento se realizo a escala 4K nativa con el redimensionado de entrada desactivado, lo que preserva la resolucion original de las imagenes aereas y permite detectar vehiculos de pocos pixeles. La configuracion fija 500 detecciones por imagen en inferencia. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o ajuste de hiperparametros mas alla de lo indicado en `config.yaml`.

## Capacidades

- Deteccion de objetos de una unica clase (`vehicle`) en imagenes aereas de alta resolucion (4K).
- Localizacion con cajas delimitadoras y puntuaciones de confianza por deteccion.
- Funcionamiento a resolucion nativa sin redimensionado de entrada, adecuado para objetos pequenos.
- Generacion de hasta 500 detecciones por imagen.
- Uso como generador de pre-etiquetas para anotacion asistida y correccion humana.
- Integracion con el ecosistema detectron2 para entrenamiento, evaluacion e inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente visual).

## Casos de uso

- Deteccion de vehiculos en imagenes de dron: el modelo procesa imagenes 4K sin redimensionar y localiza vehiculos individuales, lo que lo hace adecuado para conteo y monitorizacion de trafico aereo.
- Pre-etiquetado para anotacion: genera cajas candidatas que anotadores humanos corrigen, reduciendo el coste de construir ground truth, tal como se hizo en la revision de Tetris.
- Analisis de ocupacion de aparcamientos: al detectar vehiculos a resolucion nativa, permite estimar plazas ocupadas en imagenes aereas de gran extension.
- Monitorizacion de flujo vehicular en carreteras: combinado con un tracker (el repositorio incluye codigo de tracking), permite seguir trayectorias de vehiculos entre fotogramas.
- Auditoria de datasets aereos: sirve para comparar detecciones automaticas contra anotaciones existentes y detectar discrepancias en conjuntos de datos de conduccion.
- Reproduccion de experimentos: al publicarse `config.yaml` y los pesos con hash sha256, permite replicar exactamente el pipeline de deteccion empleado en el trabajo original.
- Integracion en pipelines de vision con detectron2: puede desplegarse junto con otras herramientas del ecosistema para tareas de deteccion personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint ocupa 0,4 GB en disco, pero el backbone ResNeXt-101-32x8d y el procesamiento a 4K nativo requieren memoria considerable, especialmente por las activaciones a alta resolucion.
- GPU recomendadas: no especificadas por el autor; por el tamano del backbone y la resolucion de entrada, se recomienda una GPU con al menos 16-24 GB de VRAM (por ejemplo, A100, RTX 3090/4090) para inferencia a 4K.
- Cabe en GPU consumer: probablemente en RTX 3090/4090 con imagenes 4K, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: detectron2 (libreria nativa del modelo); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clase(s) | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| b3d-fasterrcnn | Faster R-CNN X101-32x8d-FPN | 1 (`vehicle`) | 4K nativa | other | Hugging Face + GitHub |
| Faster R-CNN COCO (original) | Faster R-CNN | 80 clases COCO | variable | licencia detectron2 | Disponible en detectron2 |
| YOLOv8/YOLOv11 | Detector de una etapa | configurable | variable | AGPL-3.0 (Ultralytics) | Disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo de una sola clase (`vehicle`): no detecta peatones, senales ni otras categorias.
- Entrenado especificamente en el dataset B3D (imagenes aereas de dron); su generalizacion a otras camaras, altitudes o dominios no esta documentada.
- La licencia es `other`, sin texto de licencia explicito en la informacion disponible: es necesario consultar el repositorio de GitHub para conocer las restricciones de uso comercial antes de desplegarlo en produccion.
- No se han publicado metricas de precision, recall o mAP, por lo que no es posible evaluar su calidad objetiva a partir de la informacion disponible.
- Riesgo de falsos positivos y negativos en escenas densas o con oclusiones, comun en detectores de dos etapas a alta resolucion; no cuantificado.
- El procesamiento a 4K nativo implica un coste computacional y de memoria elevado, lo que puede limitar el despliegue en entornos con recursos restringidos.
- No se especifican sesgos conocidos ni limitaciones idiomaticas (no aplica, al ser un modelo visual).

## Enlaces

- Hugging Face: https://huggingface.co/tetris-db/b3d-fasterrcnn
- Repositorio GitHub (codigo de entrenamiento, deteccion y tracking): https://github.com/tetris-db/b3d-fasterrcnn
- Dataset B3D (Berkeley DeepDrive Drone): no disponible en la informacion proporcionada
- Paper de Tetris: no disponible en la informacion proporcionada
