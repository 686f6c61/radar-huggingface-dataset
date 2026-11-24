# tarunmatta/pi05_black_box_ft4

## Resumen

π₀.₅ (Pi05) es un modelo vision-lenguaje-acción (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos. Este repositorio concreto, `tarunmatta/pi05_black_box_ft4`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado por el usuario tarunmatta mediante la libreria LeRobot de Hugging Face. El modelo resuelve el problema de control robotico de imitacion: dado un estado de las articulaciones y varias imagenes de camaras, predice una accion de 6 dimensiones.

El ajuste fino se ha entrenado sobre un dataset propio muy pequeno (40 episodios, 8848 fotogramas a 10 FPS) para una unica tarea: "Pick up the black box". Se trata, por tanto, de una politica especializada y de proposito muy concreto, no de un modelo de uso general. El modelo base Pi05 evoluciona Pi0 para generalizar a entornos y situaciones no vistos durante el entrenamiento original.

Con 4143 millones de parametros (4,14 B) y un tamano de repositorio de 16,6 GB, el modelo se distribuye en formato safetensors y se ejecuta mediante el ecosistema LeRobot. Su relevancia radica en ser un ejemplo practico de ajuste fino de un VLA de ultima generacion sobre hardware de bajo coste (robot SO-100/SO-101), accesible para laboratorios y desarrolladores independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi05 (evolucion de Pi0); implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robotico; las instrucciones de tarea se proporcionan en texto) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras | wrist, left (claves de observacion: `left_wrist_0_rgb`, `base_0_rgb`, `empty_camera_0`) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de accion | `action` de forma `(6,)` |
| Resolucion de imagen | 480x640 (camaras principales), 224x224 (camara adicional) |
| Tamano del repositorio | 16,6 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi05, un VLA que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El modelo procesa tres flujos visuales (`left_wrist_0_rgb` a 480x640, `base_0_rgb` a 480x640 y `empty_camera_0` a 224x224) junto con un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion de su dataset original.

El ajuste fino se realizo con LeRobot 0.7.0 durante 5000 pasos, con batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. El dataset de entrenamiento contiene 40 episodios y 8848 fotogramas a 10 FPS, todos correspondientes a la tarea "Pick up the black box". No se especifica si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores al entrenamiento por imitacion. La innovacion principal del modelo base Pi05, segun la documentacion de Physical Intelligence, es su capacidad de generalizacion a entornos completamente nuevos, aunque este ajuste concreto la restringe a la tarea y configuracion de camaras del dataset.

## Capacidades

- Control robotico de imitacion: predice acciones de 6 dimensiones a partir de observaciones multimodales (estado de articulaciones e imagenes).
- Percepcion visual multi-camara: procesa simultaneamente tres flujos de imagen con resoluciones de 480x640 y 224x224.
- Ejecucion de tareas guiadas por instruccion textual: acepta un parametro `--task` con la descripcion de la tarea (por ejemplo, "Pick up the black box").
- Generalizacion limitada al dominio de entrenamiento: el ajuste fino esta especializado en una unica tarea sobre un robot SO-follower.
- Integracion con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que se trata de un modelo de robotica y no de un LLM conversacional.

## Casos de uso

- Recogida de objetos en entornos controlados: el modelo ejecuta la tarea "Pick up the black box" en un robot SO-follower con las camaras configuradas, adecuado para demostraciones de laboratorio y validacion de pipelines de imitacion.
- Prototipado rapido de politicas roboticas: sirve como punto de partida para equipos que quieran ajustar Pi05 a sus propias tareas con pocos episodios (40 en este caso), reduciendo el coste de entrada al ecosistema LeRobot.
- Educacion e investigacion en robotica: permite a estudiantes e investigadores reproducir el flujo completo de grabacion de datos, entrenamiento y despliegue con hardware de bajo coste.
- Benchmark de referencia para ajustes finos: al estar publicado en el Hub, puede utilizarse como comparacion contra otras politicas entrenadas sobre el mismo dataset o configuracion de camaras.
- Automatizacion de tareas de pick-and-place: con el dataset y las camaras adecuadas, el mismo flujo de entrenamiento puede extenderse a tareas de manipulacion similares en lineas de montaje o almacenes.
- Validacion de configuraciones de hardware: el modelo documenta explicitamente las claves de observacion y las formas de entrada, lo que facilita comprobar la compatibilidad de un robot y sus camaras antes de entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4,14 B de parametros, una estimacion orientativa en precision completa (fp32) seria de aproximadamente 16,6 GB, y en bf16/fp16 de aproximadamente 8,3 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo, se requieren GPU con al menos 16-24 GB de VRAM para inferencia en precision reducida, como RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: probable en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) en bf16, si bien no hay confirmacion oficial.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia base) y entrenamiento con `lerobot-train` en dispositivo CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tarunmatta/pi05_black_box_ft4 | 4,14 B | no disponible | Pick up the black box (SO-follower) | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista (base) | gemma | Hugging Face (modelo base) |
| Pi0 (OpenPI) | no disponible | no disponible | VLA generalista | no disponible | Repositorio OpenPI de Physical Intelligence |
| SmolVLA | no disponible | no disponible | VLA ligero para robotica | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste fino se ha entrenado exclusivamente para la tarea "Pick up the black box" con 40 episodios; no se espera un comportamiento fiable fuera de esa tarea o configuracion.
- Dataset muy reducido: 8848 fotogramas a 10 FPS es un volumen bajo, lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- Dependencia de la configuracion de camaras: las claves de observacion (`left_wrist_0_rgb`, `base_0_rgb`, `empty_camera_0`) y sus resoluciones deben coincidir exactamente con las del entrenamiento; cualquier cambio invalida la politica.
- Sin evaluacion publicada: no hay tasas de exito ni pruebas en robot real documentadas, por lo que no se puede afirmar su fiabilidad en produccion.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones especificas; debe revisarse antes de cualquier despliegue comercial.
- Riesgo de alucinacion y sesgos: no hay informacion especifica sobre sesgos, pero al ser un modelo de imitacion, puede reproducir comportamientos erroneos o inseguros presentes en los datos de entrenamiento.
- Idiomas: no se dispone de informacion sobre el soporte multilingue de las instrucciones de tarea.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (24 de noviembre de 2026), sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tarunmatta/pi05_black_box_ft4
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla_v2
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
