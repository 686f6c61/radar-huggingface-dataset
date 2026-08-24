# XXMiner/ScoreVision_carwash

## Resumen

ScoreVision_carwash es un detector de objetos basado en YOLO11n de Ultralytics, desarrollado por XXMiner para el desafío SN44 del ecosistema Score Vision, la subred 44 de Bittensor dedicada a visión por computadora descentralizada. El modelo está entrenado para detectar objetos en el contexto de lavaderos de coches a partir de fotogramas del dominio oficial del desafío, utilizando etiquetas generadas por consenso de los ganadores con umbrales estrictos de calidad (map50 >= 0.9 y fp >= 0.9). La supervisión emplea un esquema de proxy congelado (frozen-GT-proxy) que replica el objetivo de puntuación del modelo oficial sam3_json_v1.

El modelo se distribuye en formato ONNX con precisión FP32, optimizado para inferencia en CPU mediante onnxruntime, y cumple el presupuesto de latencia de 100 ms + 10 ms con una latencia p95 de 85 ms por fotograma a 704 píxeles en procesadores de 2 núcleos clase vCPU. En el conjunto de validación reservado de 120 fotogramas disjuntos, alcanza un map50 de 0.8364, fp de 0.951 y gated de 0.4889. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible (base YOLO11n de Ultralytics) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, no texto) |
| Tipos de cuantizacion | FP32 (ONNX) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n de Ultralytics, un detector de objetos de una sola pasada con backbone y neck convolucionales, optimizado para eficiencia computacional en dispositivos de bajos recursos. El entrenamiento se realizó sobre fotogramas del dominio oficial del desafío SN44, con etiquetas generadas por consenso de los ganadores (cajas con map50 >= 0.9 y fp >= 0.9), mediante un esquema de supervisión congelada que replica el objetivo de puntuación sam3_json_v1. No se especifican en la información disponible el número de épocas, el tamaño del dataset de entrenamiento ni la configuración de optimización.

La inferencia se realiza a 704 píxeles de resolución. El contrato de entrada exige que las imágenes lleguen en formato BGR (cv2.imdecode con IMREAD_COLOR) y que el modelo realice la conversión BGR a RGB antes del preprocesado; omitir esta conversión degrada el map50 de 0.8364 a 0.6307 en el conjunto de validación, según mediciones del autor.

## Capacidades

- Detección de objetos en el dominio de lavaves de carro (car wash) a partir de fotogramas de video.
- Inferencia en CPU con onnxruntime, sin necesidad de GPU, con latencia p95 de 85 ms por fotograma a 704 píxeles.
- Conversión automatica de canal BGR a RGB integrada en el pipeline de preprocesado.
- Empaquetado seguro para entornos restringidos: sin acceso a red, sin lectura de variables de entorno y sin enlaces simbólicos.
- Generacion de cajas delimitadoras con alta precision (map50 >= 0.9) que pueden servir como etiquetas de consenso para otros modelos.
- Integracion con el ecosistema Score Vision de Bittensor (Subnet 44) para vision descentralizada.
- No soporta tool calling, agentes, razonamiento multi-paso, vision multimodal ni procesamiento de lenguaje, al ser un detector de objetos puro.

## Casos de uso

- Deteccion de objetos en tiempo real en lavaderos de coches: el modelo procesa fotogramas a 704 píxeles con latencia p95 de 85 ms en CPU de 2 núcleos, adecuado para sistemas de vigilancia o automatizacion en entornos de lavado de vehículos sin acceso a GPU.
- Validacion de calidad en desafios de vision por computadora: con map50 de 0.8364 y fp de 0.951 en el holdout de 120 fotogramas, puede utilizarse como detector de referencia para comparar otros enfoques en el desafío SN44.
- Generacion de anotaciones de alta calidad: las cajas generadas con umbrales de map50 >= 0.9 y fp >= 0.9 pueden emplearse como pseudoetiquetas para entrenar otros detectores en dominios similares.
- Analisis de video descentralizado en Bittensor: el modelo puede actuar como minero en la red Score Vision, convirtiendo video en vivo en datos estructurados y accionables para el subnet 44.
- Despliegue en entornos de computacion perimetral: al ejecutarse en CPU con onnxruntime y sin dependencias de red, es apto para dispositivos embebidos o servidores con restricciones de seguridad y conectividad.
- Evaluacion de pipelines de vision en produccion: su contrato de entrada BGR->RGB y su presupuesto de latencia de 100 ms + 10 ms lo hacen util para medir el rendimiento de sistemas de vision en tiempo real.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks comparados con otros modelos. El modelo card reporta las siguientes metricas propias sobre el holdout de validacion de 120 fotogramas:

| Metrica | Valor |
|---|---|
| map50 (winner-proxy holdout) | 0.8364 |
| fp (winner-proxy holdout) | 0.951 |
| gated (winner-proxy holdout) | 0.4889 |
| Gate del padre (1024) | 0.4987 |
| Latencia p95 (FP32 ONNX, 2 vCPU) | 85 ms |

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo se ejecuta en CPU con onnxruntime.
- GPU recomendada: no necesaria; el modelo esta optimizado para CPU.
- CPU minima: 2 nucleos clase vCPU, medido con latencia p95 de 85 ms por fotograma a 704 píxeles.
- Memoria RAM: no disponible.
- Opciones de despliegue: onnxruntime en CPU; no se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de vision.
- Latencia y throughput: 85 ms p95 por fotograma en 2 vCPU, dentro del presupuesto de 100 ms + 10 ms del desafio.
- Nota: el repositorio tiene un tamano de 0.0 GB, lo que indica que los pesos del modelo podrian no estar publicados o el repositorio esta vacio; esto impide el despliegue directo sin acceso a los pesos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos de deteccion de objetos en el dominio de car wash. El modelo se basa en YOLO11n, una arquitectura estandar de Ultralytics, pero los pesos especificos y el entrenamiento con supervision por consenso son unicos de este repositorio. No se han publicado comparaciones con otras variantes de YOLO (YOLO11s, YOLO11m, YOLOv8) ni con detectores alternativos (RT-DETR, DETR) en la informacion disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el modelo es usable en entornos comerciales o de produccion.
- Repositorio vacio o incompleto: el tamano de 0.0 GB y las 0 descargas sugieren que los pesos no estan publicados, lo que impide su uso directo.
- Dominio restringido: el modelo esta entrenado exclusivamente en fotogramas de lavaderos de coches del desafio SN44; su generalizacion a otros dominios de vision es incierta y probablemente baja.
- Dependencia del contrato de canal: la entrada debe llegar en BGR y convertirse a RGB; si se omite esta conversion, el rendimiento cae drasticamente (map50 de 0.8364 a 0.6307).
- Riesgo de falsos positivos y negativos: al ser un detector de una sola etapa, puede producir detecciones erroneas fuera del dominio de entrenamiento.
- Sin soporte de video temporal: el modelo procesa fotogramas individuales, no secuencias temporales, por lo que no aprovecha informacion temporal para mejorar la deteccion.
- Sin capacidades de lenguaje o razonamiento: no soporta prompts de texto, tool calling ni interaccion conversacional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/XXMiner/ScoreVision_carwash)
- [Modelos del autor XXMiner](https://huggingface.co/XXMiner/models)
- [Datasets del autor XXMiner](https://huggingface.co/XXMiner/datasets)
- [Repositorio Score Vision (Subnet 44)](https://github.com/score-technologies/score-vision)
- [Repositorio TurboVision](https://github.com/score-technologies/turbovision)
