# TicassloThang/hand-gesture-iot-control

## Resumen

Hand Gesture Classifier for IoT Control es una red neuronal pequena implementada en Keras que clasifica 16 clases de gestos de mano (15 gestos funcionales mas la clase "no gesture") a partir de los 46 valores numericos derivados de los 21 puntos de referencia (landmarks) que extrae MediaPipe Hand Landmarker. No es un modelo de lenguaje ni un modelo multimodal de proposito general: se trata de un clasificador tabular de tipo MLP que consume una representacion geometrica normalizada de la mano y devuelve una distribucion softmax sobre las etiquetas de gesto. Lo publica el usuario TicassloThang como artefacto derivado de un proyecto de curso de Procesamiento Digital de Imagenes en el HCM-UTE (Vietnam), desarrollado por un equipo de cuatro personas en 2025.

El modelo resuelve un problema de interaccion humano-maquina sin contacto: convertir gestos de la mano capturados por una camara en comandos para dispositivos IoT. En la aplicacion original, los gestos encienden y apagan un ventilador y dos luces a traves de un microcontrolador ESP32 y el protocolo MQTT. Es relevante ahora por su tamano reducido, su licencia MIT y su integracion limpia con el ecosistema MediaPipe, lo que lo hace util como punto de partida reproducible para prototipos de domotica, robotica y accesibilidad de bajo coste.

La arquitectura es un perceptron multicapa con capas densas de 256, 128 y 64 neuronas, normalizacion por lotes y dropout. No se especifica el numero total de parametros en la informacion disponible, aunque por la configuracion de capas declarada (entrada de 46 caracteristicas y salida de 16 clases) el orden de magnitud es de decenas de miles de parametros. El modelo se distribuye como TensorFlow SavedModel exportado con TensorFlow 2.16.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso: capas de 256, 128 y 64 neuronas, con batch normalization y dropout (0.4 y 0.3), salida softmax sobre 16 clases |
| Parametros totales | no disponible (la model card no indica el recuento; la configuracion son capas densas 256-128-64 sobre una entrada de 46 caracteristicas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion tabular; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en float32 como TensorFlow SavedModel |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); las etiquetas de clase estan en ingles |
| Licencia | MIT |
| Formato de pesos | TensorFlow SavedModel (`SavedModel/saved_model_best/`, TensorFlow 2.16.1); no se ofrecen safetensors, GGUF ni ONNX |

Otros datos de distribucion: repositorio de 0.0 GB, 0 descargas, 1 like, pipeline declarado `tabular-classification`, biblioteca `tensorflow`, fecha de creacion y ultima actualizacion 2026-10-04.

## Arquitectura y entrenamiento

El modelo es un clasificador denso cuyo vector de entrada tiene 46 valores float32 por mano, calculados a partir de los 21 landmarks de MediaPipe en coordenadas de imagen (x, y). El preprocesado consiste en restar la muneca (landmark 0) a todos los puntos y dividir por el mayor valor absoluto de x o y, de modo que las coordenadas quedan en el rango [-1, 1]. Las caracteristicas 0 a 41 corresponden a las coordenadas x e y de los 21 puntos en orden; las caracteristicas 42 y 43 son el vector unitario de la muneca a la media de los cuatro nudillos (landmarks 5, 9, 13 y 17); y las caracteristicas 44 y 45 son el vector unitario del nudillo del indice (5) al nudillo del menique (17). El codigo exacto de normalizacion es la funcion `normalize_features()` del repositorio de GitHub. La salida es una probabilidad softmax sobre las 16 etiquetas de `labels.json`; las etiquetas que empiezan por `S_` son gestos simetricos (validos con cualquiera de las dos manos), mientras que `A_LH_` y `A_RH_` distinguen FanLeft y FanRight ejecutados con mano izquierda o derecha.

El entrenamiento uso 18.639 fotografias tomadas por el equipo a 640x640, que tras aplicar espejado a los gestos simetricos dieron 29.648 muestras. La particion fue 70% entrenamiento, 15% validacion y 15% prueba, aleatoria y estratificada por clase. Se optimizo con Adam, tasa de aprendizaje 1e-3 y tamano de lote 128, con parada temprana sobre la exactitud de validacion, pesos de clase y aumento de datos basado en rotacion de landmarks y ruido. La exactitud de validacion reportada durante el entrenamiento fue de aproximadamente 99,5%, aunque el propio autor advierte que la particion aleatoria por fotografia hace esa cifra optimista. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un clasificador discriminativo.

## Capacidades

- Clasificacion de 16 clases de gestos de mano a partir de landmarks de MediaPipe, con salida de probabilidades softmax.
- Reconocimiento de gestos simetricos (`S_`), validos con mano izquierda o derecha.
- Discriminacion de lateralidad en gestos asimetricos (`A_LH_` y `A_RH_`).
- Integracion con MediaPipe Hand Landmarker para la deteccion de la mano en imagen; el modelo solo clasifica, no detecta.
- Generacion de comandos de control para dispositivos IoT (en el proyecto original: ventilador y dos luces mediante ESP32 y MQTT).
- Inferencia en tiempo real dentro de una aplicacion de escritorio (Tkinter) que ademas aplica filtros de confianza, entropia y ventana de votacion antes de emitir un comando.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, audio, tool calling, function calling ni capacidades de agente.

## Casos de uso

- Control de domotica por gestos: es el caso original del proyecto; la aplicacion captura la mano con webcam, clasifica el gesto y publica un mensaje MQTT que un ESP32 traduce en encendido o apagado de un ventilador y dos luces. El modelo es adecuado porque el coste computacional es minimo y la salida ya esta mapeada a comandos discretos.
- Accesibilidad para personas con movilidad reducida: un usuario que no puede alcanzar interruptores fisicos puede emitir comandos gestuales para encender aparatos; el modelo clasifica la intencion a partir de landmarks, lo que reduce la dependencia de una imagen nitida.
- Interfaces sin contacto en entornos clinicos o de laboratorio: en quirofanos, salas limpias o laboratorios donde no conviene tocar superficies, el clasificador permite activar equipos o luces con gestos, y la capa de filtrado por confianza evita comandos espurios.
- Robotica e interaccion humano-robot: el modelo puede integrarse como modulo de percepcion para traducir gestos en ordenes de movimiento o de activacion de actuadores, igual que plantean los proyectos de robot controlado por gestos de la busqueda web.
- Control de presentaciones y reproduccion multimedia: con un subconjunto de gestos (por ejemplo, `Start` y `FanOff`) se pueden mapear acciones como avanzar diapositiva, pausar o detener una reproduccion, reduciendo la necesidad de un mando.
- Prototipos academicos y docencia: por su tamano reducido y su licencia MIT, sirve como ejemplo completo de pipeline de vision clasica (MediaPipe) mas red densa, reproducible en un portatil, para asignaturas de vision por computador o IoT.
- Kioscos y senalizacion digital interactiva: en instalaciones publicas, el clasificador puede activar contenido o navegar menus sin contacto fisico, siempre que se entrene o ajuste con datos del entorno real de despliegue.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados corresponden a una prueba con 1.282 fotografias tomadas de forma separada a los datos de entrenamiento, procesadas con MediaPipe y este clasificador:

| Resultado | Fotos | Porcentaje |
|---|---|---|
| Correcto | 1.242 | 96,9% |
| Clase incorrecta | 22 | 1,7% |
| Ninguna mano detectada por MediaPipe | 18 | 1,4% |

Excluyendo las 18 fotografias en las que MediaPipe no encontro mano, el porcentaje de acierto asciende al 98,3%. Las confusiones principales son FanSpeed3 con Light2On y FanOff con Start. La exactitud de validacion durante el entrenamiento fue de aproximadamente 99,5%, aunque el autor senala que la particion aleatoria por fotografia hace esa cifra optimista. No se han publicado resultados en benchmarks estandar de vision por computador ni comparaciones con otros conjuntos de datos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; el modelo es un MLP de decenas de miles de parametros en float32, por lo que cabe holgadamente en cualquier GPU e incluso en memoria de CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA para TensorFlow (por ejemplo, RTX 3060, RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja apreciable frente a CPU para esta carga.
- Viabilidad en hardware de consumo: si, cabe en cualquier portatil, en una Raspberry Pi y en dispositivos similares. El cuello de botella real es MediaPipe Hand Landmarker y la captura de camara, no el clasificador.
- Opciones de despliegue: TensorFlow SavedModel cargado con `tf.saved_model.load` y la firma `serving_default`; tambien puede convertirse a TensorFlow Lite o a formato Keras, aunque la model card no documenta esas conversiones. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La aplicacion original opera en tiempo real con filtros de confianza, entropia y ventana de votacion, pero no se publican cifras de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TicassloThang/hand-gesture-iot-control | MLP sobre 46 caracteristicas de landmarks | no disponible (capas 256-128-64) | no aplica | 96,9% sobre 1.282 fotos (98,3% excluyendo las sin mano) | MIT | HuggingFace y GitHub |
| MediaPipe Gesture Recognizer (Google) | Clasificador de gestos integrado en MediaPipe | no disponible | no aplica | no disponible | Apache 2.0 (el `hand_landmarker.task` incluido en el repo lo es) | Distribucion oficial de MediaPipe |
| Proyecto AI-Powered Hand Gesture Controlled Robot (iamvny) | Deteccion con OpenCV y MediaPipe mas control de ESP32 | no disponible | no aplica | no disponible | no disponible | GitHub |
| Enfoques CNN sobre imagen completa (literatura, por ejemplo el trabajo indexado en ResearchGate) | CNN de vision | no disponible | no aplica | no disponible | no disponible | Publicaciones academicas |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; los modelos citados se incluyen por pertenecer a la misma categoria funcional (reconocimiento de gestos de mano para control de dispositivos).

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entreno unicamente con fotografias de los miembros del equipo, por lo que la precision cae con otras manos, tonos de piel, iluminacion o condiciones de camara distintas.
- Sensibilidad a condiciones de captura: la exactitud disminuye con luz muy baja o muy brillante y con angulos extremos de la mano.
- Riesgo de confusion entre clases: las confusiones documentadas son FanSpeed3 con Light2On y FanOff con Start, relevantes en un sistema de control porque implican comandos incorrectos.
- Dependencia de MediaPipe: en 18 de 1.282 fotografias no se detecto ninguna mano, lo que produce fallos de servicio que el clasificador no puede corregir por si mismo.
- Ausencia de filtrado propio: en la aplicacion en vivo la prediccion se filtra por confianza, entropia y una ventana de votacion antes de enviar cualquier comando; el modelo por si solo no incorpora ese filtrado, de modo que un despliegue directo tendra mas falsos positivos.
- Desajuste de version: el SavedModel fue exportado por una version anterior del script de entrenamiento, por lo que la configuracion de entrenamiento documentada podria no coincidir exactamente con los pesos publicados.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la licencia. El archivo `hand_landmarker.task` incluido pertenece a Google y se distribuye bajo Apache 2.0, con condiciones distintas a las del clasificador.
- Madurez del artefacto: 0 descargas y 1 like en el momento de la consulta, sin historial de mantenimiento posterior a la publicacion; no hay garantia de soporte ni de actualizaciones.
- Idioma y alcance: no procesa lenguaje natural, por lo que no puede usarse para tareas de generacion de texto, razonamiento o dialogo. Las etiquetas estan en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TicassloThang/hand-gesture-iot-control
- Codigo del proyecto en GitHub: https://github.com/Ticasslo/hand-gesture-iot-control
- Informe del proyecto (en vietnamita): https://github.com/Ticasslo/hand-gesture-iot-control/blob/main/17_BaoCao.pdf
- MediaPipe Hand Landmarker (modelo incluido, Apache 2.0): https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
- AI-Powered Hand Gesture Controlled Robot (referencia relacionada): https://github.com/iamvny/AI-Powered-Hand-Gesture-Controlled-Robot
- AI-Powered Hand Gesture Controlled Robot, articulo (IJ SAT): https://www.ijsat.org/papers/2025/1/2363.pdf
- Hand Gesture Driven Smart Home Automation Leveraging Internet of Things (ITU): https://www.itu.int/en/ITU-T/academia/kaleidoscope/2024/Documents/S7.3Hand-Gesture-Driven-smart-Home-Automation-Leveraging-Internet-of-Things.pdf
- Hand Gesture Driven Smart Home Automation (IEEE): https://ieeexplore.ieee.org/document/10772850
- Hand Gesture Recognition and Control for Human-Robot Interaction Using Deep Learning (ResearchGate): https://www.researchgate.net/publication/375422572_Hand_Gesture_Recognition_and_Control_for_Human-Robot_Interaction_Using_Deep_Learning
