# WillXH/FlowPush

## Resumen

FlowPush es un conjunto de checkpoints de políticas visuomotoras para robótica, desarrollado por William Xu (WillXH), que combina técnicas de *flow matching* y *diffusion policy* para la manipulación robótica. El modelo está diseñado específicamente para las tareas Push-T y Push-F, que consisten en empujar un objeto (una forma T) hacia una posición objetivo en un entorno simulado. El repositorio incluye tanto un profesor basado en *flow matching* como un estudiante destilado de un solo paso, además de variantes con observaciones de estado o imágenes RGB.

La relevancia de este modelo radica en que demuestra cómo el *flow matching* puede superar a los enfoques tradicionales de *diffusion* en tareas de control robótico, logrando un mayor éxito con menos pasos de muestreo. Los checkpoints publicados son solo de evaluación, con pesos EMA, normalizador ajustado y configuración resuelta, lo que facilita la reproducibilidad de los resultados reportados. El modelo se distribuye bajo licencia MIT y está implementado en PyTorch, con un tamaño de repositorio de 2,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net y DiT (Transformer) para políticas visuomotoras, con *flow matching* y *diffusion* |
| Parametros totales | DiT: 7,8 M; resto de variantes: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (checkpoints en precisión completa) |
| Idiomas soportados | No disponible (modelo de robótica, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea dos arquitecturas principales: U-Net y DiT (Transformer con bloques de difusión), ambas utilizadas como políticas visuomotoras que generan acciones condicionadas a observaciones. El entrenamiento se basa en *imitation learning* a partir de demostraciones, con dos enfoques de generación: *diffusion* (DDPM) y *flow matching* (incluyendo *rectified flow* y destilación de un paso). El dataset utilizado es `WilliamHangXu/pushf-demos`, que contiene demostraciones de las tareas Push-T y Push-F.

El repositorio incluye un profesor de *flow matching* con 8 pasos de Euler, un estudiante destilado de 1 paso, y variantes con observaciones de estado o imágenes RGB de 96×96. También se proporcionan políticas de transferencia para Push-F, tanto entrenadas desde cero como fine-tuned a partir del profesor de Push-T. No se especifican detalles sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO, ya que se trata de un modelo de control robótico, no de lenguaje.

## Capacidades

- Generación de acciones de control para tareas de manipulación robótica (empujar objetos).
- Soporte de observaciones de estado (posiciones y velocidades) y observaciones visuales (imágenes RGB).
- Muestreo con *flow matching* (Euler) y *diffusion* (DDIM), con número de pasos configurable en tiempo de evaluación.
- Destilación de un paso para inferencia rápida (estudiante de 1 paso).
- Transferencia entre tareas: fine-tuning desde Push-T a Push-F con 100 demostraciones.
- Reproducibilidad: checkpoints autocontenidos con pesos EMA y normalizador ajustado.

## Casos de uso

- Aprendizaje por imitación en robótica: el modelo puede entrenarse con demostraciones humanas o teleoperadas para aprender políticas de empuje, como en el benchmark Push-T, y evaluarse en entornos simulados.
- Control visual de robots: la variante con observaciones RGB permite usar el modelo con cámaras, útil para tareas de manipulación basadas en visión.
- Inferencia de alta velocidad: el estudiante destilado de 1 paso reduce la latencia de muestreo, adecuado para control en tiempo real o despliegue en robots físicos.
- Transferencia de tareas: el fine-tuning desde Push-T a Push-F demuestra cómo adaptar una política preentrenada a una nueva tarea con pocas demostraciones, reduciendo el coste de recopilación de datos.
- Investigación en *flow matching* vs *diffusion*: los checkpoints permiten comparar directamente ambos enfoques en un entorno de control estándar, con resultados reproducibles.
- Evaluación de políticas robóticas: el repositorio incluye scripts de evaluación y registros por episodio, útil para validar nuevos algoritmos o configuraciones de muestreo.

## Benchmarks y rendimiento

Los resultados reportados corresponden a la tasa de éxito (success@0.95) sobre 50 episodios de test, con seed 0. La tabla del modelo card es la siguiente:

| Checkpoint | Modelo | Éxito (seed 0) |
|---|---|---|
| `pusht_ddpm_unet_seed0.pt` | DDPM U-Net, obs. estado, 100 pasos | 0,44 |
| `pusht_fm_unet_seed0.pt` | Flow-matching U-Net, obs. estado, 8 pasos Euler (profesor) | 0,60 |
| `pusht_fm_dit_seed0.pt` | Flow-matching DiT (7,8M), obs. estado, 8 pasos | 0,34 |
| `pusht_fm_unet_image_seed0.pt` | Flow-matching U-Net, obs. RGB 96×96, 8 pasos | 0,30 |
| `pusht_2rf_seed0.pt` | 2-rectified flow, 1 paso | 0,46 |
| `pusht_1step_distilled_seed0.pt` | Estudiante destilado de 1 paso | 0,52 |
| `pushf_scratch_n100_seed0.pt` | Push-F desde cero, 100 demos, 8 pasos | 0,66 |
| `pushf_finetune_n100_seed0.pt` | Push-F fine-tuned desde Push-T, 100 demos, 8 pasos | 0,78 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. Los resultados anteriores son los únicos disponibles.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación proporcionada.
- Dado el tamaño de los checkpoints (2,7 GB en total para todos los archivos) y que el modelo DiT tiene solo 7,8 M de parámetros, es razonable inferir que cada checkpoint cabe en GPUs de consumo (p. ej., RTX 3060 o superiores), pero no hay confirmación oficial.
- El repositorio incluye un script de evaluación (`evaluate.py`) que se ejecuta con Python y PyTorch, sin requisitos especiales de hardware más allá de una GPU para acelerar el muestreo.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; el despliegue se realiza mediante el propio código del repositorio.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas visuomotoras con *flow matching* para Push-T). Los enfoques alternativos serían *diffusion policies* estándar (como el DDPM incluido) o métodos de *behavior cloning* clásicos, pero no hay datos públicos de otros modelos específicos para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las tareas Push-T y Push-F en simulación; no se ha validado en robots físicos ni en otras tareas de manipulación.
- Los resultados reportados corresponden a una sola semilla (seed 0); el README del repositorio indica que las medias de 3 semillas pueden diferir.
- La variante con observaciones visuales (RGB) tiene un rendimiento inferior (0,30) a la de estado (0,60), lo que sugiere que la percepción visual añade dificultad.
- El estudiante destilado de 1 paso (0,52) no alcanza al profesor de 8 pasos (0,60), por lo que la destilación conlleva una pérdida de rendimiento.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad, al ser un modelo de control robótico y no de generación de texto.
- La licencia MIT permite uso comercial, pero el modelo depende de entornos de simulación (Push-T/Push-F) que pueden tener sus propias licencias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/WillXH/FlowPush
- Repositorio de código FlowPush: https://github.com/WilliamHangXu/FlowPush
- Dataset de demostraciones: https://huggingface.co/datasets/WilliamHangXu/pushf-demos
- Perfil del autor: https://huggingface.co/WillXH
