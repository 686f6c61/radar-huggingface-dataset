# umegan/urdf2vla-franka-gr00t-n1.7

## Resumen

`umegan/urdf2vla-franka-gr00t-n1.7` es un modelo vision-language-action (VLA) especializado en manipulación robótica, concretamente en la tarea de recoger un objeto nombrado en una instrucción de lenguaje natural y depositarlo en un contenedor. Lo desarrolla el usuario umegan y se obtiene por fine-tuning del modelo base `nvidia/GR00T-N1.7-DROID` de NVIDIA, que a su vez incorpora los pesos congelados del encoder visión-lenguaje `nvidia/Cosmos-Reason2-2B`. El checkpoint está pensado para el brazo Franka Emika Panda con pinza Franka Hand en el simulador NVIDIA Isaac Sim, y se ha generado de extremo a extremo con la herramienta urdf2vla a partir del URDF del robot.

El modelo resuelve el problema de llevar una instrucción en lenguaje natural a una secuencia de acciones de control articular de 7 grados de libertad más la apertura/cierre de la pinza, a 20 Hz y con 16 pasos de acción por llamada. Su relevancia es acotada pero clara: demuestra un flujo completo de conversión URDF→VLA y de fine-tuning de un VLA de NVIDIA con solo 50 demostraciones, alcanzando 19/20 éxitos en evaluación simulada. No está pensado para uso general ni para robot real.

Arquitectura VLA basada en el stack GR00T N1.7 (encoder visión-lenguaje Cosmos-Reason2-2B congelado más cabeza de acción por difusión entrenable). El checkpoint tiene 3.144.016.000 parámetros y ocupa 12,6 GB en el repositorio. La licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (GR00T N1.7): encoder visión-lenguaje Cosmos-Reason2-2B congelado + projector + cabeza de acción por difusión |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa un frame actual por cámara y una instrucción de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés en los ejemplos, p. ej. `put the apple in the bin`) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |
| Entrada visual | 3 cámaras RGB 256×256 (`wrist_cam`, `left_cam`, `right_cam`), solo frame actual |
| Entrada de estado | `main_arm`: 7 posiciones articulares (rad); `main_gripper`: 1 (1 = abierta, 0 = cerrada) |
| Salida de acción | 16 pasos de objetivos articulares absolutos + `main_gripper` (≥ 0,5 = abierta) |
| Frecuencia de control | 20 Hz (16 acciones por llamada al modelo) |
| Embodiment tag | `new_embodiment` (config en `urdf2vla_modality_franka.py`) |
| Librería | gr00t |
| Pipeline | robotics |
| Tamaño del repo | 12,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje (Cosmos-Reason2-2B) que procesa las tres vistas de cámara y la instrucción textual, un projector que adapta las representaciones al espacio de acción y una cabeza de acción generativa por difusión que produce secuencias de 16 pasos de control articular. En este fine-tuning se entrenaron únicamente el projector y la cabeza de acción por difusión; el modelo de lenguaje y el encoder visual permanecieron congelados. El embodiment se registra mediante una configuración de modalidad propia (`urdf2vla_modality_franka.py`) generada por urdf2vla.

Los datos de entrenamiento son 50 demostraciones exitosas de pick-and-place guionizadas (de 63 intentos, 50 correctos), recogidas con `urdf2vla collect_dataset --device scripted` y convertidas a formato LeRobot v2.1 con `urdf2vla convert_dataset`, publicadas en el dataset `umegan/urdf2vla-franka-pickplace`. Se entrenó durante 10.000 pasos con batch 32 en una única NVIDIA L40S (46 GB), con un pico de 41,6 GB y un tiempo de 2 h 42 min. El stack de software fue Isaac-GR00T 23ace64, Isaac Sim 6.2.0, Isaac Lab 3.0.0 e Isaac Lab Arena b9e37c5. No se documenta uso de RLHF ni DPO.

## Capacidades

- Control robótico de manipulación: genera objetivos articulares absolutos de 7 DoF más apertura/cierre de pinza para el Franka Panda.
- Seguimiento de instrucciones en lenguaje natural para seleccionar el objeto a recoger (p. ej. `put the apple in the bin`).
- Percepción visual multi-cámara: integra tres vistas RGB 256×256 (muñeca, izquierda, derecha) en un único frame.
- Condicionamiento por estado propioceptivo: recibe posiciones articulares actuales y la apertura de pinza como estado.
- Generación de secuencias de acción: produce 16 pasos por inferencia a 20 Hz, lo que permite control a frecuencia de política.
- Detección implícita de liberación: la comprobación de apertura de pinza en el punto de liberación fue 10/10 en evaluación.
- Generalización limitada a posición aleatoria del objeto sobre la mesa dentro del mismo escenario.
- No soporta tool calling, agentes multi-paso, audio ni otras capacidades de texto general; es un VLA de control, no un LLM de propósito general.

## Casos de uso

- Investigación en VLA y reproducción de pipelines: sirve como referencia para validar el flujo completo urdf2vla (URDF→entorno→dataset→fine-tuning→evaluación) con un robot concreto y una tarea acotada.
- Evaluación de fine-tuning con pocos datos: permite estudiar cuánto rinde un VLA de NVIDIA con solo 50 demostraciones guionizadas y cabezas entrenables sobre backbone congelado.
- Benchmark interno de manipulación pick-and-place en Isaac Sim: útil como baseline reproducible con métricas publicadas (19/20 éxito, 194 pasos medianos, 18 mm de error mediano de colocación).
- Docencia y formación en robótica simulada: ejemplo didáctico de cómo mapear cámaras, estado y acciones de un Franka Panda a un VLA.
- Pruebas de integración de Isaac Lab Arena y GR00T: validación de versiones concretas del stack (Isaac Sim 6.2.0, Isaac Lab 3.0.0, Isaac-GR00T 23ace64) en una tarea de manipulación.
- Prototipado de interfaces de instrucción en lenguaje natural para robots: sirve para experimentar con consignas tipo "put the X in the bin" antes de escalar a entornos reales o datasets mayores.
- Generación de datos sintéticos y comparación de políticas: al estar entrenado solo con demos guionizadas, permite contrastar políticas aprendidas frente a scripts en el mismo escenario.

## Benchmarks y rendimiento

Evaluación en Isaac Sim con `urdf2vla evaluate_vla`, 20 episodios con objeto aleatorio (manzana, cubo de color, lima, pera) en posición aleatoria sobre la mesa:

| Metrica | Resultado |
|---|---|
| Éxito global | 19/20 |
| Manzana | 5/5 |
| Cubo de color | 7/7 |
| Lima | 3/3 |
| Pera | 4/5 (un episodio cerró la pinza pero no levantó el objeto) |
| Episodio mediano | 194 pasos a 20 Hz (9,7 s) |
| Distancia mediana del objeto colocado al objetivo | 18 mm |
| Comprobación de liberación (abre la pinza donde lo hacen las demos) | 10/10 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 41,6 GB de pico en una L40S de 46 GB, por lo que la inferencia requiere presumiblemente una GPU de clase profesional con memoria abundante.
- GPU recomendadas: NVIDIA L40S (validada en entrenamiento); por tamaño del modelo (≈3,14 B parámetros) y stack Isaac, se recomienda gama profesional (A100, H100, L40S) y no se garantiza su funcionamiento en GPUs de consumo.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el stack Isaac Sim/Isaac Lab y el modelo base apuntan a GPUs de datacenter o workstation.
- Opciones de despliegue: `urdf2vla evaluate_vla` con el ecosistema Isaac-GR00T; no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: control a 20 Hz con 16 acciones por llamada; no se publican latencias por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `umegan/urdf2vla-franka-gr00t-n1.7` | 3.144.016.000 | 3 cámaras 256×256 + estado 8D + instrucción | Pick-and-place Franka en Isaac Sim | NVIDIA Open Model License | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| `nvidia/GR00T-N1.7-DROID` (modelo base) | no disponible en la información | no disponible | VLA generalista de NVIDIA | NVIDIA Open Model License | Hugging Face |
| `nvidia/Cosmos-Reason2-2B` (componente congelado) | ≈2 B (según nombre) | no disponible | Encoder visión-lenguaje | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros VLA en la información proporcionada.

## Limitaciones y advertencias

- Un solo escenario: un único objeto sobre una mesa de madera, iluminación fija y contenedor en posición fija.
- Entrenado solo con demostraciones guionizadas; el comportamiento fuera de ese rango (otros objetos, desorden, otras poses de cámara) es desconocido.
- No probado en robot real; uso exclusivamente en simulación (Isaac Sim).
- Idiomas soportados no documentados; los ejemplos de instrucción están en inglés.
- Riesgo de alucinación no aplica en el sentido de texto libre, pero sí de generalización errónea fuera de distribución (objetos o escenas no vistas).
- Licencia NVIDIA Open Model License: el uso comercial está sujeto a los términos de dicha licencia, que deben revisarse antes de producción.
- El checkpoint contiene pesos congelados de `nvidia/Cosmos-Reason2-2B`, por lo que hereda sus restricciones.
- Sin cuantizaciones publicadas ni formatos alternativos a safetensors.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umegan/urdf2vla-franka-gr00t-n1.7
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/umegan/urdf2vla-franka-pickplace
- Repositorio urdf2vla: https://github.com/momoiorg-repository/urdf2vla
- Documentación urdf2vla — modelos entrenados: https://momoiorg-repository.github.io/urdf2vla/models/
- Guía urdf2vla (Brev): https://momoiorg-repository.github.io/urdf2vla/guides/brev/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
