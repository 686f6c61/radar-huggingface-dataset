# umegan/urdf2vla-crx3ia-gr00t-n1.7

## Resumen

urdf2vla-crx3ia-gr00t-n1.7 es un modelo visión-lenguaje-acción (VLA) especializado en manipulación robótica, concretamente en la tarea de recoger un objeto indicado en una instrucción en lenguaje natural y depositarlo en un contenedor. Lo desarrolla el usuario umegan y es un ajuste fino del checkpoint nvidia/GR00T-N1.7-DROID, que a su vez contiene los pesos congelados del codificador visión-lenguaje nvidia/Cosmos-Reason2-2B. El modelo está pensado para el brazo FANUC CRX-3iA con pinza Robotiq 2F-85 en el simulador NVIDIA Isaac Sim.

El modelo resuelve el problema de llevar una instrucción en lenguaje natural a una secuencia de acciones de control articular de 6 grados de libertad más la apertura/cierre de pinza, a 20 Hz. Su relevancia radica en que toda la cadena —desde el URDF del robot hasta el checkpoint final— se ha generado de forma automática con la herramienta urdf2vla, lo que demuestra un flujo reproducible para portar modelos VLA a nuevos brazos robóticos.

Cuenta con 3.144.016.000 parámetros totales, un repositorio de 12,6 GB en formato safetensors y una licencia NVIDIA Open Model License. Es un modelo de simulación: no se ha probado en un robot real y su alcance queda limitado a la escena y los objetos con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.7 (codificador visión-lenguaje Cosmos-Reason2-2B congelado + projector + cabeza de acción por difusión) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se proporcionan como texto libre en `annotation.human.task_description`) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Libreria | gr00t |
| Etiqueta de embodiment | `new_embodiment` (config en `urdf2vla_modality_crx3ia.py`) |
| Entradas de vídeo | `wrist_cam`, `left_cam`, `right_cam`, 256×256 RGB, solo frame actual |
| Estado | `main_arm`: 6 posiciones articulares (J1–J6, rad); `main_gripper`: 1 (1 = abierto, 0 = cerrado) |
| Salidas de acción | 16 pasos de objetivos articulares absolutos (aprendidos relativos al estado) y `main_gripper` (≥ 0,5 = abierto) |
| Frecuencia de control | 20 Hz (16 acciones por llamada al modelo) |
| Modelo base | nvidia/GR00T-N1.7-DROID |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7: un codificador visión-lenguaje (en este caso Cosmos-Reason2-2B, cuyos pesos permanecen congelados) que procesa las tres cámaras y la instrucción en lenguaje natural, conectado mediante un projector a una cabeza de acción basada en difusión que genera 16 pasos de objetivos articulares y el estado de la pinza. Durante el ajuste fino solo se entrenaron el projector y la cabeza de acción; el modelo de lenguaje y el codificador visual no se modificaron.

El entrenamiento se realizó con 50 demostraciones exitosas de pick-and-place grabadas mediante `urdf2vla collect_dataset --device scripted` (50 de 59 intentos tuvieron éxito) y convertidas con `urdf2vla convert_dataset` al formato LeRobot v2.1. Se ejecutaron 10.000 pasos con batch de 32 en una única NVIDIA L40S de 46 GB, con un pico de 41,9 GB y una duración aproximada de 2 h 40 min. El software empleado fue Isaac-GR00T (commit 23ace64), Isaac Sim 6.2.0, Isaac Lab 3.0.0 e Isaac Lab Arena (commit b9e37c5). Las demostraciones son guionizadas, no teleoperadas por humanos, y no se documenta ningún proceso de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación a partir de instrucciones en lenguaje natural del tipo «put the apple in the bin».
- Percepción visual multi-cámara: procesa simultáneamente `wrist_cam`, `left_cam` y `right_cam` a 256×256 RGB.
- Control articular de 6 grados de libertad (J1–J6) más apertura/cierre de pinza, con salida de 16 pasos por inferencia a 20 Hz.
- Ejecución de pick-and-place sobre cuatro clases de objeto: manzana, cubo de color, lima y pera.
- Generalización a posiciones aleatorias del objeto sobre la mesa dentro de la escena de entrenamiento.
- Integración con el ecosistema urdf2vla para evaluación automatizada en Isaac Sim.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo thinking.

## Casos de uso

- Validación de flujos URDF-a-VLA: el checkpoint sirve como referencia para comprobar que la cadena de urdf2vla (URDF, cámaras, interfaz y dataset) produce un modelo funcional antes de invertir en datos reales.
- Prototipado de pick-and-place en simulación: permite iterar sobre la disposición de cámaras, la altura de la mesa o la posición del contenedor sin riesgo físico, evaluando con `urdf2vla evaluate_vla`.
- Generación de datos sintéticos y aumento de dataset: al ejecutarse en Isaac Sim a 20 Hz y con 16 acciones por llamada, puede generar trayectorias etiquetadas para preentrenar otros modelos.
- Benchmark interno de modelos VLA: su resultado de 20/20 en 20 episodios y una distancia mediana de 15 mm al objetivo lo convierten en una línea base reproducible para comparar nuevos ajustes finos.
- Docencia e investigación en robótica: ejemplo completo y documentado de ajuste fino de un VLA sobre un brazo industrial concreto (FANUC CRX-3iA) con licencia abierta.
- Prueba de concepto de control por lenguaje en células industriales simuladas: permite evaluar si una instrucción textual basta para dirigir un brazo de 6 ejes en tareas de recogida y depósito.
- Integración en pipelines de simulación a gran escala: al ser un checkpoint safetensors de 12,6 GB, puede cargarse en entornos Isaac Lab para experimentos por lotes.

## Benchmarks y rendimiento

Evaluación en Isaac Sim con `urdf2vla evaluate_vla` sobre 20 episodios, cada uno con un objeto aleatorio (manzana, cubo de color, lima o pera) en posición aleatoria sobre la mesa:

| Metrica | Resultado |
|---|---|
| Éxito global | 20/20 |
| Manzana | 5/5 |
| Cubo de color | 7/7 |
| Lima | 3/3 |
| Pera | 5/5 |
| Episodio mediano | 174 pasos a 20 Hz (8,7 s) |
| Distancia mediana del objeto colocado al objetivo | 15 mm |
| Comprobación de liberación (abre la pinza donde lo hacen las demos) | 10/10 |
| Referencia: mismas demos en formato DROID de GR00T (cámara de muñeca + una exterior, pose del efector final) | 19/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió un pico de 41,9 GB en una L40S de 46 GB, por lo que la inferencia en precisión completa requiere previsiblemente una GPU de gama profesional con al menos 24–48 GB.
- GPU recomendadas: NVIDIA L40S (validada para entrenamiento), así como A100 o H100 por capacidad de memoria; no se documenta soporte en GPUs de consumo.
- GPU de consumo: no se confirma que quepa en RTX 4090 u otras consumer; el tamaño del repo (12,6 GB en safetensors) sugiere que la carga de pesos es viable en 24 GB, pero no hay datos publicados de inferencia en esas tarjetas.
- Opciones de despliegue: librería `gr00t` (Isaac-GR00T) dentro de Isaac Sim / Isaac Lab con la herramienta urdf2vla; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: control a 20 Hz con 16 acciones por llamada al modelo; el episodio mediano dura 174 pasos (8,7 s). No se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdf2vla-crx3ia-gr00t-n1.7 | 3.144.016.000 | no disponible | 20/20 en 20 episodios (Isaac Sim) | NVIDIA Open Model License | Hugging Face (umegan) |
| nvidia/GR00T-N1.7-DROID | no disponible | no disponible | 19/20 en la misma tarea con formato DROID | NVIDIA Open Model License | Hugging Face (nvidia) |
| nvidia/Cosmos-Reason2-2B | no disponible | no disponible | no disponible | NVIDIA Open Model License | Hugging Face (nvidia) |

La comparación directa con otros VLA de propósito general (por ejemplo, variantes de OpenVLA u otros modelos de la familia GR00T) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Una sola escena: un único objeto sobre una mesa de madera, iluminación fija y contenedor en posición fija.
- Entrenado solo con demostraciones guionizadas; el comportamiento fuera de su rango (otros objetos, desorden, otras poses de cámara) es desconocido.
- No probado en un robot real: es exclusivamente un modelo de simulación.
- Riesgo de alucinación y de generalización incorrecta fuera de la distribución de entrenamiento, especialmente con objetos no vistos.
- No se documentan sesgos específicos ni cobertura multilingüe; las instrucciones de entrenamiento están en inglés.
- Licencia NVIDIA Open Model License: el uso comercial está sujeto a los términos de dicha licencia, que deben revisarse antes de cualquier despliegue en producción.
- El checkpoint incorpora los pesos congelados de nvidia/Cosmos-Reason2-2B, también bajo NVIDIA Open Model License.
- El dataset de entrenamiento es muy reducido (50 demostraciones), lo que limita la robustez frente a variaciones de la escena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umegan/urdf2vla-crx3ia-gr00t-n1.7
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-DROID
- Repositorio urdf2vla: https://github.com/momoiorg-repository/urdf2vla
- Documentación de urdf2vla: https://momoiorg-repository.github.io/urdf2vla/guides/brev/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
