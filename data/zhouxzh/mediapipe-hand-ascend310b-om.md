# zhouxzh/mediapipe-hand-ascend310b-om

## Resumen

`zhouxzh/mediapipe-hand-ascend310b-om` es un repositorio de Hugging Face que contiene artefactos en formato OM (Offline Model) para el acelerador Ascend 310B de Huawei, presumiblemente derivados del modelo de deteccion de manos de MediaPipe. El autor es el usuario `zhouxzh` y el repositorio se publico el 12 de noviembre de 2026 con licencia Apache 2.0. No se trata de un modelo de lenguaje: por el nombre y el formato, es un artefacto de despliegue de un modelo de vision por computador convertido para el runtime CANN/ATC de Ascend.

La model card publicada es practicamente vacia (solo contiene la declaracion de licencia), por lo que no hay informacion sobre arquitectura interna, dataset de entrenamiento, precision numerica ni proceso de conversion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso muy limitado o un artefacto de caracter personal.

Su relevancia es acotada: interesa a quien necesite ejecutar el pipeline de deteccion de manos de MediaPipe sobre hardware Ascend 310B (tipicamente Atlas 200I DK A2 u otros dispositivos edge de Huawei) sin tener que realizar la conversion desde el modelo original de TensorFlow Lite. Para el resto de casos, no aporta nada frente a los modelos de mano de MediaPipe publicados por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto OM derivado de MediaPipe Hand, presumiblemente CNN ligera) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato OM para Ascend 310B) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | OM (Offline Model, runtime CANN de Huawei) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo. Por el nombre del repositorio, se trata de una conversion del modelo de deteccion de manos de MediaPipe (tradicionalmente una red convolucional ligera que predice palma y keypoints de 21 puntos por mano) al formato OM que consume el runtime CANN en el Ascend 310B. El sufijo `ascend310b` indica el SoC objetivo y `om` el formato de artefacto compilado.

No se documenta el proceso de entrenamiento, el dataset utilizado, ni si el artefacto incluye cuantizacion INT8, FP16 u otra precision. Tampoco se especifica la version de MediaPipe ni la version de las herramientas ATC/CANN empleadas en la conversion, datos relevantes para reproducibilidad.

## Capacidades

- Deteccion de manos en imagenes o flujo de video, presumiblemente con estimacion de keypoints (herencia de MediaPipe Hand).
- Ejecucion en el acelerador Ascend 310B mediante el runtime CANN.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No es un modelo de agentes ni de razonamiento multi-paso.
- Sin capacidades multilingues (no procesa lenguaje).
- Sin modo thinking, vision general, audio ni otras capacidades mas alla de la deteccion de manos.

## Casos de uso

- Control por gestos en dispositivos edge con Ascend 310B: el artefacto permite ejecutar la deteccion de manos en local sobre el NPU, habilitando interfaces gestuales sin depender de la nube.
- Domotica y kioscos interactivos: integracion en paneles o terminales con Atlas 200I DK A2 para detectar la presencia y posicion de manos del usuario y disparar acciones.
- Realidad aumentada en entornos industriales: seguimiento de manos para guiado de operarios en gafas o pantallas montadas, aprovechando la inferencia de baja latencia en el NPU.
- Analisis de video en vigilancia o retail: conteo y localizacion de manos en flujos de camara para estudios de interaccion, siempre que se respete la normativa de proteccion de datos.
- Prototipado de investigacion en vision embebida: base para comparar latencia y precision del Ascend 310B frente a otras plataformas (Jetson, Coral) en tareas de hand tracking.
- Educacion y demos de CANN: ejemplo practico de despliegue de un modelo OM en hardware Ascend para talleres o cursos sobre el ecosistema de Huawei.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Ascend 310B (por ejemplo, Atlas 200I DK A2). No esta pensado para GPU NVIDIA ni CPU generica.
- VRAM estimada: no disponible; el modelo se ejecuta sobre la memoria del SoC Ascend, no sobre VRAM de GPU.
- GPU recomendadas: no aplica; requiere NPU Ascend 310B.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no, el formato OM es especifico del runtime CANN.
- Opciones de despliegue: runtime CANN/ACL en el dispositivo Ascend; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| zhouxzh/mediapipe-hand-ascend310b-om | OM | Ascend 310B | Apache 2.0 | Hugging Face (0 descargas) |
| MediaPipe Hand (Google) | TFLite | CPU/GPU movil y edge | Apache 2.0 | mediapipe.dev, GitHub |
| Modelos hand tracking de Ultralytics | PyTorch/ONNX | GPU NVIDIA, CPU | AGPL-3.0 (YOLO) | GitHub, Hugging Face |

La comparativa se limita a categoria y formato, ya que no hay datos de precision ni latencia publicados para el artefacto de `zhouxzh`.

## Limitaciones y advertencias

- La model card no documenta arquitectura, precision, dataset ni proceso de conversion; la reproducibilidad es nula.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por la comunidad.
- El formato OM ata el artefacto a una version concreta de CANN y al SoC Ascend 310B; no es portable a otros aceleradores.
- No se especifica si el modelo ha sido cuantizado a INT8, lo que puede afectar a la precision de los keypoints.
- Riesgo de sesgos heredados del modelo MediaPipe original (variabilidad segun tono de piel, iluminacion y oclusiones), no documentados por el autor.
- Al ser un modelo de vision, no hay riesgo de alucinacion textual, pero si de falsos positivos o negativos en la deteccion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo MediaPipe subyacente y de cualquier componente de terceros incluido en la conversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhouxzh/mediapipe-hand-ascend310b-om
- MediaPipe Hand (modelo original): https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
- Repositorio de MediaPipe: https://github.com/google-ai-edge/mediapipe
- Documentacion de CANN y Ascend: https://www.hiascend.com/developer/cann
