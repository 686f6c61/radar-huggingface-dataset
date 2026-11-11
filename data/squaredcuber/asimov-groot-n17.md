# squaredcuber/asimov-groot-n17

## Resumen

Asimov-groot-n17 es un fine-tune de NVIDIA GR00T N1.7-3B, un modelo visión-lenguaje-acción (VLA) orientado a robótica, adaptado por el usuario squaredcuber al robot humanoide open source Asimov 1 de Menlo Research. El modelo parte de una arquitectura de 3B parámetros con backbone congelado y entrena únicamente el proyector y la cabeza de acciones para un nuevo "embodiment" (configuración corporal), siguiendo la receta por defecto de GR00T. El resultado es una política que mapea observaciones (cámara monocular de cabeza a 256×256, posiciones articulares y una instrucción en lenguaje natural) a comandos de articulación absolutos expresados como deltas relativos al estado actual.

La relevancia del modelo es doble. Por un lado, es, según el autor, la primera política GR00T publicada para el Asimov 1, un humanoide open source con 25 grados de libertad, manos impresas pasivas sin pinzas y una sola cámara monocular. Por otro, demuestra que un fine-tune de bajo coste (2 h 43 m en una única GPU L40, 10.000 pasos, batch 64) sobre un backbone VLA congelado puede alcanzar tasas de éxito razonables en tareas de mesa condicionadas por lenguaje dentro de simulación MuJoCo.

Es importante subrayar que se trata de un modelo exclusivamente de simulación: no se ha ejecutado en un robot real. Cubre tres tareas concretas (empujar un bloque, pulsar un botón y transportar una caja de forma bimanual) con 900 demostraciones generadas por expertos scriptados. La licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en NVIDIA GR00T N1.7, con backbone Cosmos-Reason2-2B congelado, proyector y cabeza de acciones entrenados |
| Parametros totales | 3B (heredados del modelo base nvidia/GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | NVIDIA Open Model License (other) |
| Formato de pesos | safetensors (checkpoints en `checkpoints/checkpoint-{2000..10000}`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7-3B, un VLA que combina un backbone de razonamiento visión-lenguaje (Cosmos-Reason2-2B) con un proyector de modalidades y una cabeza de acciones específica del embodiment. En este fine-tune se aplica la estrategia `NEW_EMBODIMENT` de la receta por defecto de GR00T: el backbone permanece congelado y solo se entrenan el proyector y la cabeza de acciones. La observación incluye la cámara de cabeza a 256×256, las posiciones articulares de ambos brazos (5 DOF cada uno), el yaw de cintura y el yaw y pitch del cuello (13 DOF en total), junto con la instrucción en lenguaje natural. La acción se aprende como delta relativo al estado actual, con horizonte de 16 pasos y ejecución de 8 pasos por llamada a 20 Hz.

El entrenamiento utiliza 900 demostraciones de expertos scriptados (300 por tarea), equivalentes a 155.000 fotogramas a 20 Hz, con 43 instrucciones distintas y aleatorización de poses de objetos, colores, distractores, iluminación y jitter de cámara. Se realizaron 10.000 pasos con batch 64, learning rate 1e-4 y color jitter, en una única GPU L40 durante 2 h 43 m. La pérdida descendió de 0,095 a 0,010. No se reporta RLHF ni DPO; el entrenamiento es de imitación supervisada sobre datos sintéticos.

## Capacidades

- Control robótico condicionado por lenguaje: genera comandos de articulación a partir de una instrucción en lenguaje natural y una observación visual y proprioceptiva.
- Manipulación de mesa con brazo único: empujar objetos (tarea Push) con el puño.
- Pulsación de botones: localización y accionamiento de un botón concreto (tarea Button).
- Manipulación bimanual: agarre por fricción, transporte y colocación de una caja (tarea Box).
- Política de tiempo real: inferencia a 20 Hz con predicción de chunks de 16 pasos y ejecución de 8 por llamada.
- Generalización limitada a variaciones de pose, color, iluminación y distractores dentro del dominio de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; es un modelo de política robótica, no un asistente conversacional.

## Casos de uso

- Investigación en manipulación robótica simulada: usar el modelo como política de referencia para el Asimov 1 en MuJoCo y comparar variantes de fine-tune sobre el mismo conjunto de tareas.
- Desarrollo de pipelines de evaluación cerrada: integrar el checkpoint en un bucle de evaluación con 50 layouts held-out por tarea para medir tasas de éxito con intervalos de confianza.
- Prototipado de tareas de empuje y colocación: emplear la tarea Push (84% de éxito) como banco de pruebas para estudiar el efecto del horizonte de acción o del número de pasos de ejecución.
- Estudio de manipulación bimanual con fricción: la tarea Box (56% de éxito) permite analizar fallos de agarre y colocación en un escenario bimanual realista dentro de simulación.
- Generación de datos sintéticos y aumento de demostraciones: usar el modelo para producir rollouts que complementen las 900 demostraciones scriptadas en futuros entrenamientos.
- Base para transferencia sim-to-real: servir como punto de partida para experimentos de adaptación al hardware real del Asimov 1, una vez validados los supuestos de montaje de cámara y colisión de manos.
- Docencia y divulgación: ejemplo reproducible de fine-tune de un VLA de 3B con coste de cómputo bajo (una GPU L40, menos de 3 horas) para cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

Evaluación cerrada en MuJoCo sobre 50 layouts held-out por tarea, con semillas disjuntas de las de entrenamiento; éxito sostenido 0,5 s.

| Tarea | Instruccion ejemplo | ckpt 6000 | ckpt 10000 | IC 95% (10000) |
|---|---|---|---|---|
| Push (un puno) | "push the purple block onto the orange pad" | 46% | 84% | 0,71–0,92 |
| Button | "press the red button" | 36% | 64% | 0,50–0,76 |
| Box (agarre bimanual, transporte y colocacion) | "lift the box and put it on the shelf" | 2% | 56% | 0,42–0,69 |

- Error absoluto medio de acción en bucle abierto sobre episodios de entrenamiento: 0,027 rad.
- Latencia de inferencia: 95 ms por llamada en una L40 con PyTorch eager.
- El entrenamiento no había convergido: la tasa de éxito seguía subiendo con fuerza entre los pasos 6000 y 10000.
- Fallos principales en el paso 10000: en Push, bloque corto del objetivo (5) y bloque sin mover (3); en Button, sin pulsación (10), pulsación parcial (6) y botón equivocado (2); en Box, caída o no colocado (16).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3B parámetros en fp16 se estiman en torno a 6-7 GB de pesos, más overhead de activaciones y del procesador de observaciones. El repositorio ocupa 42,9 GB porque incluye cinco checkpoints completos.
- GPU recomendadas: el autor reporta 95 ms por llamada en una NVIDIA L40; una A100 o H100 reducirían la latencia. Una RTX 4090 (24 GB) debería ser suficiente para inferencia en fp16, aunque no se ha validado en la información disponible.
- Cabe en GPU consumer: probablemente sí en RTX 4090 y GPUs con 16 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: el modelo se usa con la librería `asimov` (tag de la model card) y la pila de GR00T; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de robótica.
- Latencia y throughput: 95 ms por llamada en L40 con PyTorch eager; el control opera a 20 Hz ejecutando 8 de los 16 pasos predichos por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asimov-groot-n17 | 3B | no disponible | VLA para Asimov 1 (simulacion) | NVIDIA Open Model License | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | VLA generalista de NVIDIA | NVIDIA Open Model License | Hugging Face |
| Otros VLA open source (p. ej. OpenVLA, RT-2) | no disponible en la informacion | no disponible | Manipulacion robotica | no disponible | no disponible |

La comparación directa con otros VLA no está cubierta en la información proporcionada; el único punto de referencia sólido es el modelo base GR00T N1.7-3B, del que este fine-tune hereda arquitectura, tamaño y licencia, y al que añade especialización en el embodiment del Asimov 1.

## Limitaciones y advertencias

- Solo simulación: no se ha ejecutado en un robot real; la transferencia sim-to-real no está validada.
- Supuestos de hardware no verificados: el montaje de la cámara de cabeza (inclinada 45° hacia abajo, FOV vertical de 75°) y las formas de colisión y masa de las manos impresas (0,18 kg) son estimaciones que deben contrastarse con el robot físico.
- Pelvis soldada: las piernas se mantienen en pose de pie; el equilibrio es responsabilidad del controlador de locomoción en hardware.
- Entrenamiento no convergido: la tasa de éxito seguía aumentando al final del entrenamiento, por lo que el rendimiento real es probablemente superior con más pasos.
- Dominio estrecho: tres tareas de mesa, 43 instrucciones y un único embodiment; no generaliza a otras tareas, objetos o robots sin nuevo fine-tune.
- Tarea Box frágil: el agarre depende solo de fricción (μ 0,5) y de un cartón de 0,30-0,34 m, condicionado por la geometría limitada de los puños.
- Idiomas: no hay información sobre soporte multilingüe; las instrucciones de entrenamiento están en inglés.
- Licencia: NVIDIA Open Model License, con posibles restricciones para uso comercial que deben revisarse; el modelo del robot Asimov 1 tiene licencias separadas (GPL-2.0 para software y CERN-OHL-S-2.0 para hardware).
- Riesgo de alucinación: como VLA, puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución; los fallos documentados incluyen pulsaciones parciales y objetos no movidos.
- Repositorio grande: 42,9 GB por incluir cinco checkpoints sin estado del optimizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/squaredcuber/asimov-groot-n17
- Modelo base NVIDIA GR00T N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Robot Asimov 1 de Menlo Research: https://github.com/menloresearch/asimov-1
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorio de código `asimov-groot`: pendiente de publicación según la model card (no disponible)
