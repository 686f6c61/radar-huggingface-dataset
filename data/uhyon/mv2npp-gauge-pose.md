# uhyon/mv2npp-gauge-pose

## Resumen

mv2npp-gauge-pose es un modelo de deteccion de keypoints basado en YOLO11s-pose, desarrollado por el usuario uhyon, especializado en la localizacion de indicadores analogicos (galvanometros, manometros y similares) y de siete puntos clave sobre su esfera: el centro y la punta de la aguja, las marcas de minimo y maximo de la escala y varios puntos a lo largo del arco de la escala. No es un modelo de lenguaje: es un componente de vision por computador que actua como primera etapa de un lector automatico de indicadores, dentro de un estudio de vision artificial orientado a las rondas de inspeccion en centrales nucleares (NPP).

El modelo se publica como pesos Ultralytics PyTorch (`best.pt`) y como exportacion ONNX con opset 17 y entrada de 640 x 640, pensada para inferencia con ONNX Runtime. El repositorio ocupa aproximadamente 0,1 GB y la licencia es MIT. Es relevante para quien necesite integrar lectura de instrumentacion analogica en flujos automatizados sin depender de servicios en la nube, ya que la inferencia en CPU es viable (del orden de 0,29 s por fotografia cuando se conoce el rango de escala).

La version publicada es la Version 3 y se entrena exclusivamente con renders sinteticos generados por el propio repositorio del autor, sin fotografias reales. El postprocesado geometrico (correccion frontal de la esfera, comprobacion de rotacion, obtencion del rango por registro u OCR) vive en el repositorio de GitHub asociado, no en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s-pose (Ultralytics), deteccion de keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX en precision original) |
| Idiomas soportados | no aplica (modelo de vision; el OCR de escala es externo al modelo) |
| Licencia | MIT |
| Formato de pesos | `best.pt` (PyTorch Ultralytics) y `best.onnx` (opset 17, entrada 640 x 640) |

## Arquitectura y entrenamiento

Se trata de una red YOLO11 en variante `s` (small) con cabeza de pose, es decir, un detector de un solo paso que localiza el indicador y regresa simultaneamente siete keypoints sobre el. La salida se exporta a ONNX con opset 17 y resolucion fija de 640 x 640, lo que permite desplegarla con ONNX Runtime sin dependencia del framework de entrenamiento. No se especifican en la informacion disponible el numero de parametros, las capas exactas ni el coste computacional en FLOPs.

El entrenamiento se realizo unicamente con datos sinteticos generados por el propio repositorio del autor: esferas de indicador aleatorias, rangos y unidades variables, inclinacion de camara y condiciones de campo simuladas como baja iluminacion, reflejos, desenfoque de movimiento y ruido tipo speckle por radiacion. No se emplearon fotografias reales en el entrenamiento. No se documentan en la informacion disponible el numero de imagenes sinteticas, la composicion exacta del dataset ni si hubo etapas de ajuste fino o data augmentation adicional mas alla de la generacion sintetica.

## Capacidades

- Deteccion del indicador analogico en la imagen y localizacion de su region de interes.
- Regresion de siete keypoints: centro de la aguja, punta de la aguja, marca de minimo de escala, marca de maximo de escala y puntos intermedios del arco de escala.
- Base geometrica para calcular el angulo de la aguja y convertirlo en valor de lectura mediante el postprocesado del repositorio asociado.
- Exportacion ONNX para inferencia portable con ONNX Runtime en CPU.
- Integracion con un pipeline de lectura que incluye correccion frontal de la esfera, comprobacion de rotacion (respuesta RETAKE ante incertidumbre) y obtencion del rango de escala por registro de indicadores o por OCR.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo.

## Casos de uso

- Digitalizacion de manometros en planta industrial: el modelo localiza la aguja y las marcas de escala en una fotografia tomada por un operario; el postprocesado convierte el angulo en valor. Es adecuado porque funciona en CPU a unos 0,29 s por imagen, lo que permite procesar lotes de fotos de ronda sin GPU.
- Rondas de inspeccion en centrales nucleares: el autor lo plantea como parte de un estudio de vision para NPP; el modelo aporta la etapa de percepcion y la logica de RETAKE evita lecturas erroneas cuando la imagen no es fiable.
- Lectura con OCR del rango de escala: cuando el rango no esta en un registro previo, el pipeline puede leerlo de la esfera; el modelo proporciona los keypoints que guian el recorte y la orientacion del texto. El coste sube a unos 0,54 s por foto en el i5-12400 de referencia.
- Control de calidad de capturas: la comprobacion de rotacion y la correccion frontal permiten descartar imagenes mal tomadas antes de registrar un valor, reduciendo falsos positivos en el historico de lecturas.
- Prototipado e investigacion en vision sintetica: al estar entrenado solo con renders, sirve como caso de estudio de transferencia de datos sinteticos a fotos reales; el autor reporta AP50 0,955 en el conjunto publico Roboflow obaw9 (1.471 fotos reales).
- Integracion en aplicaciones de campo offline: el ONNX de 640 x 640 y la ejecucion en CPU permiten desplegar el lector en portatiles o equipos sin GPU en entornos con conectividad limitada.
- Automatizacion de inventario de instrumentacion: combinado con un registro de indicadores conocidos, el modelo puede verificar que el instrumento fotografiado corresponde al esperado y extraer su lectura de forma masiva.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| AP50 de deteccion | Roboflow obaw9 (1.471 fotos reales) | 0,955 |
| Fotos leidas correctamente | MeterFL, manometros (262 recortes reales), rango conocido y comprobacion de rotacion activa | 90 % |
| Error medio de lectura | MeterFL (sobre las fotos leidas) | 1,79 % del fondo de escala |
| Fotos dentro del 2 % del fondo de escala | MeterFL (sobre las leidas / sobre el total) | 81 % / 73 % |
| Tiempo de inferencia en CPU | Intel i5-12400, ONNX Runtime, rango conocido | ~0,29 s por foto |
| Tiempo de inferencia en CPU | Intel i5-12400, ONNX Runtime, con OCR de escala | ~0,54 s por foto |

El objetivo declarado del proyecto, un 85 % de fotos dentro del 2 % del fondo de escala, no se alcanza segun los resultados publicados por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la variante `s` de YOLO11, la inferencia en GPU requiere muy poca memoria, pero no se publica una cifra concreta.
- GPU recomendadas: no se documentan; el autor valida el despliegue en CPU (Intel i5-12400) con ONNX Runtime, que es el escenario de referencia.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del modelo, aunque no hay mediciones publicadas en RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: ONNX Runtime con `best.onnx` (opset 17, 640 x 640); Ultralytics con `best.pt` para PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~0,29 s por foto en CPU con rango conocido y ~0,54 s con OCR de escala, medidos en un i5-12400. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mv2npp-gauge-pose | YOLO11s-pose, keypoints de indicador | no disponible | no aplica | AP50 0,955 en obaw9; 1,79 % FS de error medio en MeterFL | MIT | Hugging Face |
| YOLO11s-pose estandar (Ultralytics) | Deteccion de pose humana generica | no disponible en la informacion | no aplica | no disponible para lectura de indicadores | AGPL-3.0 / comercial | Ultralytics |
| Lectores de indicadores analogicos basados en segmentacion de aguja | Vision clasica o redes de segmentacion | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone en la informacion proporcionada de comparativas directas con otros modelos especializados en lectura de indicadores analogicos; los datos de la tabla para alternativas son orientativos y en su mayoria no disponibles.

## Limitaciones y advertencias

- No evaluado con fotografias reales de indicadores de central nuclear; los resultados en fotos reales provienen de conjuntos publicos (MeterFL y Roboflow obaw9).
- Entrenado exclusivamente con datos sinteticos, lo que puede generar una brecha de dominio frente a condiciones reales no simuladas en el generador.
- Puntos debiles declarados: indicadores girados mas de unos 90 grados en la imagen, disposiciones de esfera poco habituales y escalas dobles.
- El modelo por si solo no devuelve un valor de lectura: necesita el rango de escala, procedente de un registro de indicadores o de OCR. El OCR falla con mas frecuencia en baja iluminacion y desenfoque de movimiento.
- El objetivo de precision del proyecto (85 % de fotos dentro del 2 % del fondo de escala) no se cumple: se alcanza el 73 % sobre el total de fotos de MeterFL.
- Riesgo de lecturas erroneas silenciosas si se omite la comprobacion de rotacion o se confia en el valor sin validacion humana en entornos criticos.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia alguna sobre la idoneidad para aplicaciones de seguridad.
- No se documentan sesgos demograficos ni linguisticos por tratarse de un modelo de vision de instrumentacion, pero si existe riesgo de sesgo hacia las condiciones visuales representadas en el generador sintetico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uhyon/mv2npp-gauge-pose
- Repositorio del lector de indicadores: https://github.com/uhyon/mv2npp-gauge-reading
- Documento de resultados del proyecto: docs/RESULTS.md dentro del repositorio anterior
- Conjunto de datos Roboflow obaw9: no disponible como enlace directo en la informacion proporcionada
- Conjunto de datos MeterFL: no disponible como enlace directo en la informacion proporcionada
