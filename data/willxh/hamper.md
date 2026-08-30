# WillXH/HAMPER

## Resumen

HAMPER es un modelo de aprendizaje por refuerzo (RL) desarrollado por WillXH (William Xu) que controla un robot humanoide Unitree G1 para realizar una tarea de loco-manipulación: caminar hasta una cesta en el suelo, enhebrar el antebrazo por el asa, levantarla y transportarla. El modelo se entrena con PPO (rsl_rl) en Isaac Lab mediante un currículo por etapas, y se distribuye como un conjunto de checkpoints de política entrenados en simulación. Su relevancia radica en demostrar una cadena completa de comportamientos motores y manipulación en un solo controlador, con una tasa de éxito del 98,4 % en la tarea completa.

El modelo no es un LLM ni un transformer: es una política neuronal de control de bajo nivel que se integra con una máquina de estados externa (`commander.py`) que secuencia las fases de aproximación, agachado, enhebrado, levantamiento y transporte. Los pesos están pensados exclusivamente para funcionar con el repositorio HAMPER en una versión concreta, y no son reutilizables fuera de ese entorno. La licencia es MIT, lo que permite uso comercial y modificación, aunque el stack de simulación (Isaac Sim, Isaac Lab, rsl_rl) tiene sus propias licencias BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (actor-critic) entrenada con PPO; no se especifica la arquitectura interna (MLP, LSTM, etc.) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en formato rsl_rl `.pt`, sin cuantización) |
| Idiomas soportados | no aplica |
| Licencia | MIT (pesos); Isaac Lab y rsl_rl son BSD-3-Clause |
| Formato de pesos | Checkpoints de rsl_rl `OnPolicyRunner` (actor, crítico, estado del optimizador) en archivos `.pt` |

## Arquitectura y entrenamiento

El modelo es una política de control entrenada con PPO (implementación de rsl_rl) en el simulador Isaac Lab, sobre el robot humanoide Unitree G1. El entrenamiento sigue un currículo por etapas: primero una política generalista capaz de caminar y agacharse con un objetivo de mano comandado (2.000 iteraciones), luego se añade la capacidad de llevar la cesta (3.499), después levantarla (5.498), enhebrar el antebrazo por el asa (7.497) y finalmente la cadena completa (9.496 iteraciones totales). Cada etapa se inicializa desde estados cosechados de la etapa anterior (bancos de 5.000 estados de pie y de agachado). El entrenamiento se realizó en una única GPU RTX A6000.

La observación y la acción están fijadas en `interface.py`; el modelo no funciona con otro diseño de observaciones. La máquina de estados en `commander.py` presenta a la política los mismos comandos y la bandera de etapa que se usaron durante el entrenamiento. El stack fijado es Isaac Sim 5.1.0, Isaac Lab v2.3.2, rsl_rl 3.1.2 y torch 2.7.0+cu128. No se menciona el uso de RLHF ni DPO; es un pipeline de RL puro.

## Capacidades

- Control de locomoción bípeda: caminar, agacharse y mantener el equilibrio en un robot Unitree G1.
- Loco-manipulación: transportar una cesta mientras camina, levantarla del suelo y enhebrar el antebrazo por el asa.
- Ejecución de una cadena de tareas de múltiples fases gobernada por una máquina de estados externa.
- Robustez a variaciones de masa de la cesta (0,3–1,5 kg) y apertura del asa (15–35 cm) sin reentrenamiento.
- Generalización a distribuciones de aparición de la cesta no vistas durante el entrenamiento (distancia 1–3 m, ±90°, episodios de 15 s) con éxito del 98,6 %.
- No tiene capacidades de lenguaje, visión ni tool calling; es exclusivamente un controlador de bajo nivel.

## Casos de uso

- Automatización de almacenes y logística: el modelo puede integrarse en robots humanoides para recoger cestas o contenedores del suelo y transportarlos a una cinta o estación, reduciendo la intervención humana en tareas repetitivas.
- Investigación en loco-manipulación: sirve como punto de partida para estudiar la coordinación entre locomoción y manipulación en humanoides, permitiendo reproducir y extender los resultados con el código del repositorio.
- Desarrollo de currículos de RL para robots: las etapas de entrenamiento y los bancos de estados son un recurso didáctico para diseñar currículos escalonados en Isaac Lab.
- Evaluación de robustez en simulación: el modelo puede usarse para probar la tolerancia a ruido en observaciones y a perturbaciones externas, como se documenta en la model card.
- Fine-tuning para nuevas tareas de manipulación: los checkpoints de etapas intermedias (por ejemplo, `stage_carry.pt`) permiten inicializar el entrenamiento de comportamientos relacionados sin partir de cero.
- Demostraciones y benchmarks de robots humanoides: el vídeo incluido (`hero_video.mp4`) y los resultados de éxito pueden servir como referencia para comparar controladores de loco-manipulación en el Unitree G1.

## Benchmarks y rendimiento

La model card reporta resultados de éxito sobre 500 episodios por semilla de evaluación, con 3 semillas distintas, para una única política entrenada. La tarea completa alcanza un 98,4 ± 0,5 % de éxito, sin caídas, sin derribar la cesta y sin soltarla en la configuración nominal. Los resultados por etapa son:

| Etapa | Éxito |
|---|---|
| Caminar | 98,7 % |
| Llevar | 95,9 % |
| Levantar | 98,9 % |
| Enhebrar | 82,2 % |
| Cadena completa | 98,4 % |

En robustez, el éxito se mantiene plano para aperturas de asa de 15–35 cm (entrenado en 25 cm) y masas de cesta de 0,3–1,5 kg (entrenado en 0,4–1,0 kg). El ruido en la observación de la pose de la cesta es el factor limitante: por encima del 97 % de éxito hasta 5 cm de ruido posicional, y 23,5 % a 10 cm (por tiempos de espera, no caídas). En una distribución de aparición no vista (cesta a 1–3 m, ±90°, episodios de 15 s) la cadena completa logra un 98,6 % de éxito en 500 episodios. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Entrenamiento: se realizó en una única GPU RTX A6000 (48 GB VRAM) con 4096 entornos paralelos en Isaac Lab.
- Inferencia: no se especifican requisitos de VRAM ni GPU para ejecutar la política. Dado que el modelo es un controlador de bajo nivel y la carga principal es la simulación, se requiere un sistema capaz de ejecutar Isaac Sim 5.1.0 con aceleración GPU.
- No se menciona compatibilidad con GPUs de consumo (RTX 4090, etc.) ni con despliegue en vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (controladores de loco-manipulación para Unitree G1 entrenados con PPO en Isaac Lab) dentro de los datos proporcionados. La model card no referencia otros trabajos ni benchmarks comparativos.

## Limitaciones y advertencias

- Los pesos solo funcionan con el repositorio HAMPER en una versión concreta; ejecutar la red con otro diseño de observaciones o acciones produce resultados basura, no errores.
- La evaluación se realizó en simulación con ruido propioceptivo y perturbaciones desactivados; bajo condiciones completas de entrenamiento la cadena alcanza el 100 % de éxito, pero esto no refleja el rendimiento en el mundo real.
- La varianza de reentrenamiento no se midió: las 3 semillas son semillas de evaluación de una única política entrenada.
- Las constantes de la máquina de estados se ajustaron a la distribución de aparición del entrenamiento; en distribuciones muy diferentes el rendimiento puede degradarse.
- El ruido en la observación de la pose de la cesta es un factor limitante: a 10 cm de ruido posicional el éxito cae al 23,5 %.
- La licencia MIT cubre los pesos, pero el stack de simulación (Isaac Sim, Isaac Lab, rsl_rl) tiene licencias BSD-3-Clause que deben respetarse.
- No hay soporte para tareas fuera de la cadena de recogida de cestas; el modelo no es un agente generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WillXH/HAMPER
- Repositorio HAMPER: la model card menciona https://github.com/<your-github-username>/HAMPER, pero el enlace no está disponible en la información proporcionada.
- Perfil del autor: https://huggingface.co/WillXH
