# XXMiner/ScoreVision_crime

## Resumen

ScoreVision_crime es un detector de objetos basado en YOLO11n, desarrollado por XXMiner para la competicion Score Vision, el subnet 44 de la red Bittensor. El modelo esta especializado en la deteccion de objetos relacionados con lavaderos de coches (car wash) en imagenes de partidos de futbol, un componente del sistema de reconocimiento de estado de juego (GSR) que la red descentralizada utiliza para validar y puntuar transmisiones de video.

El modelo se distingue por su enfoque de supervision: fue entrenado sobre fotogramas oficiales del desafio utilizando etiquetas de consenso entre ganadores (winner-consensus), lo que le permite aproximarse al objetivo de puntuacion sam3_json_v1 de la competicion. Con una resolucion de inferencia de 704px y empaquetado en ONNX para CPU, esta optimizado para cumplir con un presupuesto de latencia de 100ms+10ms, logrando 85ms p95 en nucleos de clase 2 vCPU. Su relevancia radica en ser una solucion practica y de bajo coste para un problema de vision por computadora especifico dentro de un ecosistema descentralizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 (ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO11n de Ultralytics, la variante nano de la familia YOLO11, disenada para inferencia eficiente en dispositivos con recursos limitados. El entrenamiento se realizo sobre fotogramas oficiales del desafio Score Vision, con etiquetas generadas por consenso entre los ganadores de la competicion (winner-consensus), filtrando cajas con map50>=0.9 y fp>=0.9. Este metodo de supervision proxy congelado (frozen-GT-proxy) busca alinearse con el objetivo de puntuacion sam3_json_v1 del sistema de validacion oficial.

El modelo fue empaquetado en formato ONNX con precision fp32, optimizado para ejecucion con CPU-onnxruntime. No requiere acceso a red, no lee variables de entorno y no utiliza enlaces simbolicos, lo que garantiza un despliegue aislado y reproducible. Una caracteristica critica documentada es el orden de canales: la entrada llega en formato BGR (via cv2.imdecode con IMREAD_COLOR) y debe convertirse a RGB antes del preprocesamiento; omitir esta conversion degrada el rendimiento de map50 de 0.8364 a 0.6307 en el conjunto de validacion.

## Capacidades

- Deteccion de objetos en imagenes, especificamente orientada a elementos de lavaderos de coches en fotogramas de partidos de futbol.
- Inferencia eficiente en CPU: 85ms p95 por fotograma a 704px en 2 nucleos vCPU, dentro del presupuesto de 100ms+10ms de la competicion.
- Compatible con el pipeline de validacion de Score Vision (subnet 44 de Bittensor) para tareas de Game State Recognition (GSR).
- Empaquetado autocontenido en ONNX: sin dependencias de red, sin acceso a entorno, adecuado para entornos restringidos.
- Manejo correcto del orden de canales BGR->RGB, un requisito medido para mantener el rendimiento esperado.

## Casos de uso

- Mineria en el subnet 44 de Bittensor: el modelo se integra en el pipeline de mineros de Score Vision para procesar fotogramas de video y extraer senales de estado de juego, contribuyendo a la validacion descentralizada de transmisiones de futbol.
- Deteccion de objetos especifica en entornos de vision deportiva: identificacion de elementos de lavaderos de coches en imagenes de estadios, util para analisis de patrocinios o seguimiento de elementos visuales en retransmisiones.
- Prototipado rapido de detectores YOLO con supervision proxy: el enfoque de entrenamiento con etiquetas de consenso puede replicarse para otros dominios donde las anotaciones manuales son costosas o inconsistentes.
- Despliegue en hardware de bajo coste: al ser un modelo nano en ONNX para CPU, puede ejecutarse en servidores sin GPU, reduciendo costes de infraestructura en entornos de produccion con restricciones de recursos.
- Evaluacion comparativa de tecnicas de etiquetado automatico: el modelo sirve como referencia para medir el impacto de diferentes estrategias de supervision debil en tareas de deteccion.
- Integracion en sistemas de arbitraje automatico o analisis en tiempo real: su latencia de 85ms p95 permite su uso en pipelines de video que requieren respuestas casi inmediatas, como la generacion de alertas o la sincronizacion con otros modulos de vision.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados en un conjunto de validacion propio (winner-proxy holdout, 120 fotogramas, disjunto del entrenamiento):

| Metrica | Valor |
|---|---|
| map50 | 0.8364 |
| fp (precision) | 0.951 |
| gated | 0.4889 |
| Parent gate (1024px) | 0.4987 |

La barra interna de rendimiento se situa en 0.45 para gated, mientras que el lider del ranking (leader rolling) alcanza 0.497. La latencia medida es de 85ms p95 en fp32 ONNX sobre 2 nucleos vCPU-class a 704px. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta optimizado para CPU-onnxruntime, con un rendimiento medido de 85ms p95 en 2 nucleos vCPU-class a 704px.
- No requiere GPU: al ser un modelo nano en fp32, puede ejecutarse en cualquier servidor con CPU moderna, aunque una GPU aceleraria el procesamiento por lotes.
- RAM: no disponible, pero dado el tamano del repositorio (0.0 GB) y la arquitectura nano, el consumo de memoria es minimo.
- Opciones de despliegue: ONNX Runtime (CPU), compatible con cualquier framework que soporte ONNX (Python, C++, etc.).
- No se requieren dependencias externas: el empaquetado es autocontenido, sin acceso a red ni variables de entorno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma tarea (deteccion de objetos de lavadero en el contexto Score Vision). Como referencia de arquitectura, YOLO11n de Ultralytics es el modelo base, pero no se han publicado comparativas con otras variantes de YOLO u otros detectores en este dominio especifico.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado exclusivamente para detectar objetos de lavaderos de coches en fotogramas de futbol; su rendimiento fuera de este dominio no esta garantizado.
- Dependencia del orden de canales: es imprescindible convertir BGR a RGB antes del preprocesamiento; no hacerlo degrada el rendimiento de map50 de 0.8364 a 0.6307.
- Licencia no especificada: no se indica la licencia del modelo, lo que puede limitar su uso comercial o su redistribucion.
- Datos de entrenamiento no publicados: no se detalla la composicion del dataset ni el numero de fotogramas utilizados, lo que dificulta evaluar posibles sesgos.
- Sin garantias de rendimiento en produccion: los benchmarks se basan en un conjunto de validacion propio de 120 fotogramas; el rendimiento en datos reales puede variar.
- Riesgo de alucinacion en deteccion: como todo detector, puede producir falsos positivos o negativos, especialmente en condiciones de iluminacion o angulos no representados en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XXMiner/ScoreVision_crime
- Repositorio del minero de referencia: https://huggingface.co/coolroman/ScoreVision/blob/main/miner.py
- Datasets de XXMiner: https://huggingface.co/XXMiner/datasets
- Panel de puntuaciones de Score Vision: https://console.scorevision.io/
- Repositorio oficial de Score Vision (subnet 44): https://github.com/score-technologies/score-vision
- Documentacion del minero en Score Vision: https://github.com/score-technologies/score-vision/blob/main/miner/README.md
