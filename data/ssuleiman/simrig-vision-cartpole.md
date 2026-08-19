# ssuleiman/simrig-vision-cartpole

## Resumen

SimRig Vision CartPole es un checkpoint de política de aprendizaje por refuerzo (RL) entrenado para equilibrar un CartPole simulado en MuJoCo a partir de observaciones puramente visuales. Lo desarrolla Suleiman Sulaimanov (usuario `ssuleiman`) como parte del framework SimRig, una herramienta que convierte robots MuJoCo en políticas entrenadas mediante PPO, evaluación y previsualización interactiva. El modelo resuelve el problema de control basado en píxeles, donde el actor solo recibe imágenes en escala de grises de 64x64 píxeles apiladas en tres frames, más la acción anterior, mientras que el crítico dispone del estado privilegiado del sistema durante el entrenamiento.

La relevancia de este checkpoint radica en que demuestra un pipeline completo de RL con observaciones de imagen en entornos MuJoCo, utilizando renderizado acelerado por GPU mediante MuJoCo MJX y Warp. La política es determinista y logra mantener el poste equilibrado durante los 1.000 pasos del horizonte de episodio en todas las semillas evaluadas. No se trata de un modelo de lenguaje ni de un sistema generativo, sino de un agente de control específico para un entorno concreto, lo que lo convierte en un recurso útil para investigación en RL basado en visión y como referencia para el framework SimRig.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) para visión, detalles no especificados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | `policy.params` (serializacion de parametros de Brax/JAX) |

## Arquitectura y entrenamiento

El modelo es una política de RL entrenada con PPO (Proximal Policy Optimization). El actor es una CNN que procesa imágenes de 64x64 píxeles en escala de grises, apiladas en tres frames consecutivos, junto con la acción anterior como entrada adicional. El crítico, durante el entrenamiento, recibe la acción anterior y el estado privilegiado del CartPole (posiciones, velocidades, etc.), lo que permite un aprendizaje más estable. La salida del actor es un único comando de actuador de carro normalizado.

El entrenamiento se realizó con 1.024 entornos vectorizados durante 5.079.040 pasos de PPO (solicitados 5.000.000), con semilla 0, en una GPU NVIDIA A100-SXM4-40GB. El entorno se renderiza mediante la cámara de MuJoCo MJX a través de MuJoCo Warp, lo que permite generar observaciones visuales de forma acelerada. El framework SimRig reconstruye la arquitectura exacta de la CNN a partir del archivo `config.json` incluido en el repositorio, y rechaza ejecuciones con versiones de librerías incompatibles por defecto.

## Capacidades

- Equilibrio de un CartPole simulado a partir de observaciones visuales (píxeles), sin acceso al estado interno del sistema.
- Control de un actuador de carro con una acción normalizada continua.
- Política determinista que mantiene el poste vertical durante todo el horizonte de episodio (1.000 pasos) en las semillas evaluadas.
- Integración con el framework SimRig para evaluación y previsualización interactiva.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni tiene capacidades de razonamiento simbólico o multilingües.

## Casos de uso

- Investigación en RL basado en visión: sirve como punto de partida para estudiar cómo los agentes aprenden a controlar sistemas físicos a partir de imágenes, comparando con métodos que usan estado completo.
- Benchmark para algoritmos de RL con observaciones parciales: el entorno `vision_cartpole` puede usarse para evaluar la robustez de nuevos algoritmos frente a la falta de información privilegiada.
- Demostración del framework SimRig: el checkpoint permite a los usuarios verificar la instalación y el flujo de trabajo de SimRig, ejecutando evaluaciones y previsualizaciones sin necesidad de reentrenar.
- Validación de pipelines de renderizado acelerado: al depender de MuJoCo MJX y Warp, este modelo sirve para probar configuraciones de hardware y software en entornos de simulación con GPU.
- Educación en aprendizaje por refuerzo: el ejemplo es lo suficientemente simple para ilustrar conceptos como PPO, crítico privilegiado y entrenamiento vectorizado, pero con la complejidad añadida de la entrada visual.
- Base para extensiones de tareas: aunque el modelo está entrenado solo para CartPole, el código del entorno y la configuración pueden adaptarse a variantes (cambios de masa, fricción, etc.) para estudiar generalización.

## Benchmarks y rendimiento

La model card incluye una evaluación independiente con rollouts deterministas de 1.000 pasos en el entorno de entrenamiento. Los resultados son:

| Semilla | Supervivencia (pasos) | Terminado | Recompensa total |
|---:|---:|---:|---:|
| 0 | 1.000 | No | 98,0612 |
| 1 | 1.000 | No | 98,3289 |
| 2 | 1.000 | No | 98,1182 |
| 3 | 1.000 | No | 97,6037 |
| 4 | 1.000 | No | 98,1110 |

Supervivencia media/mín/máx: 1.000/1.000/1.000. Tasa de terminación: 0%. Recompensa total media: 98,0446. La model card advierte que estos resultados no constituyen una prueba de robustez frente a cambios de cámara o perturbaciones visuales. No se han publicado comparaciones con otros modelos o algoritmos en la información disponible.

## Requisitos de hardware

- Entrenamiento: se realizó en una NVIDIA A100-SXM4-40GB, aunque el requisito mínimo no está documentado.
- Inferencia: requiere una GPU con soporte CUDA visible para JAX, así como MuJoCo Warp para el renderizado de píxeles. No se especifica la VRAM mínima, pero dado el tamaño de las imágenes (64x64) y la simplicidad de la CNN, es probable que quepa en GPUs de consumo como una RTX 3060 o superior, aunque no hay confirmación oficial.
- Despliegue: el modelo se ejecuta mediante el comando `simrig eval` o `simrig preview` del framework SimRig, que gestiona la carga de parámetros y la reconstrucción de la red. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas RL para CartPole con visión). Existen otros checkpoints de CartPole con RL, como `sb3/dqn-CartPole-v1` (DQN sobre estado completo), pero no son directamente comparables porque usan observaciones de bajo nivel y no visión. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno `vision_cartpole` de SimRig; no generaliza a otros entornos o tareas.
- La evaluación no incluye pruebas de robustez frente a cambios de iluminación, posición de cámara, ruido en las imágenes u otras perturbaciones visuales, como se indica explícitamente en la model card.
- Requiere un entorno de ejecución específico: Python 3.11, JAX 0.10.2, Brax 0.14.2, MuJoCo 3.10.0, Playground 0.2.0 y Warp 1.13.0. Ejecutarlo con versiones diferentes puede provocar errores, y el framework rechaza por defecto las incompatibilidades de runtime.
- Al ser un agente RL, no tiene capacidades de procesamiento de lenguaje natural, generación de texto, razonamiento simbólico ni interacción conversacional.
- La licencia MIT permite uso comercial, pero el modelo depende de librerías con sus propias licencias (JAX, Brax, MuJoCo, etc.), que deben revisarse por separado.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco difundido; la documentación es escasa fuera de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssuleiman/simrig-vision-cartpole
- Perfil del autor: https://huggingface.co/ssuleiman
- Repositorio de SimRig en GitHub: https://github.com/Su1eym4n/simrig
- Documentación de entrenamiento de CartPole en Isaac Lab (referencia externa, no directamente relacionada): https://docs.nvidia.com/learning/physical-ai/getting-started-with-isaac-lab/latest/train-your-first-robot-with-isaac-lab/04-the-cartpole-problem.html
- Ejemplo interactivo de CartPole (referencia externa): https://cartpole.lilwg.com/
