# wjwjwjwj/gr00t-n1.7-robotwin-pick_dual_bottles-cosmos-aug

## Resumen

GR00T N1.7-robotwin-pick_dual_bottles-cosmos-aug es un ajuste fino del modelo fundacional de robotica NVIDIA Isaac GR00T N1.7-3B, publicado por el usuario `wjwjwjwj` en HuggingFace. Se trata de un modelo de vision-lenguaje-accion (VLA) especializado en la tarea `pick_dual_bottles` del benchmark de simulacion RoboTwin 2.0, orientado a manipulacion bimanual con un robot tipo Aloha. El repositorio contiene dos checkpoints (baseline y cosmos-aug) entrenados con la misma receta pero distinta composicion de datos, lo que lo convierte en un artefacto de investigacion sobre aumento de datos sinteticos para sim-to-real.

El interes del modelo no reside en una arquitectura nueva, sino en el experimento controlado que documenta: el checkpoint `cosmos-aug` incorpora 50 escenas adicionales generadas con NVIDIA Cosmos3-Nano-Sim-Transfer junto a las 50 demostraciones limpias, y reporta mejoras sustanciales de tasa de exito en evaluacion (de 20% a 37% en escenas limpias y de 3% a 18% en escenas con domain randomization). Esto lo hace relevante para quienes investigan generacion de datos sinteticos y robustez de politicas VLA.

El modelo hereda la arquitectura de GR00T N1.7: un backbone vision-lenguaje Cosmos-Reason2-2B congelado y una cabeza de accion DiT entrenada mediante flow matching. El repo ocupa 13,8 GB y se distribuye bajo la NVIDIA Open Model License, con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-lenguaje Cosmos-Reason2-2B (congelado) + cabeza de accion DiT con flow matching |
| Parametros totales | 3B (heredados de GR00T N1.7-3B; desglose exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |
| Entrada sensorial | 3 camaras: cam_high, cam_left_wrist, cam_right_wrist |
| Horizonte de accion | 16 pasos |
| Espacio de accion | 6 articulaciones de brazo relativas + gripper absoluto por brazo |
| Embodiment | NEW_EMBODIMENT (robotwin_aloha_config.py) |
| Tamano del repo | 13,8 GB |
| Libreria | cosmos |

## Arquitectura y entrenamiento

El modelo sigue el diseno de GR00T N1.7: un backbone vision-lenguaje Cosmos-Reason2-2B que permanece congelado durante el ajuste fino y una cabeza de accion basada en Diffusion Transformer (DiT) entrenada con flow matching. La politica recibe tres vistas de camara (alta y dos munecas) y produce secuencias de acciones de horizonte 16 en el espacio de articulaciones, con 6 articulaciones relativas y gripper absoluto por brazo, segun la configuracion `robotwin_aloha_config.py` incluida en el repositorio.

El entrenamiento se realizo durante 10.000 pasos con batch global de 64 en 2 GPUs NVIDIA B300, guardando checkpoints cada 2.500 pasos. El checkpoint liberado se selecciono sobre una semilla de validacion separada (escenario Hard, 50 episodios). La diferencia clave entre los dos checkpoints es la composicion del dataset: `baseline` usa 50 demostraciones limpias de RoboTwin 2.0, mientras que `cosmos-aug` anade 50 escenas generadas con NVIDIA Cosmos3-Nano-Sim-Transfer. No se especifica en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Manipulacion robotica bimanual: genera trayectorias de accion para dos brazos con gripper a partir de observaciones visuales de tres camaras.
- Control visomotor en simulacion: politica entrenada especificamente para RoboTwin 2.0 en la tarea `pick_dual_bottles`.
- Robustez ante domain randomization: el checkpoint `cosmos-aug` mejora la tasa de exito en escenas con variaciones visuales y fisicas.
- Generalizacion a instrucciones no vistas: la evaluacion se realizo con instrucciones no presentes en entrenamiento.
- Aumento de datos sinteticos: el modelo documenta el uso de escenas generadas por Cosmos3-Nano-Sim-Transfer como estrategia de entrenamiento.
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, capacidades multilingues, thinking mode, vision general, audio ni generacion de texto libre.

## Casos de uso

- Investigacion en sim-to-real para manipulacion bimanual: el par de checkpoints permite comparar directamente el efecto del aumento de datos sinteticos sobre la robustez de una politica VLA en escenas con domain randomization.
- Replicacion de experimentos de aumento de datos: el repositorio y el log publico en GitHub permiten reproducir la receta (50 demos limpias + 50 escenas Cosmos3) sobre otras tareas de RoboTwin 2.0.
- Benchmarking de politicas VLA: sirve como linea base especializada para comparar nuevas tecnicas de entrenamiento o de generacion de datos en la tarea `pick_dual_bottles`.
- Prototipado de pipelines de evaluacion robotica: el modelo se integra con `eval_policy.py` de RoboTwin 2.0 mediante un policy server de GR00T, ejecutando 8 pasos de accion por inferencia.
- Estudio de seleccion de checkpoints: la seleccion sobre una semilla de validacion separada (Hard, 50 episodios) es un ejemplo practico de metodologia de evaluacion para politicas de robotica.
- Docencia y formacion en VLA: el par baseline/augmentado con metricas publicadas facilita explicar el impacto de la aumentacion de datos en modelos fundacionales de robotica.
- Base para ajuste fino en tareas Aloha: la configuracion de embodiment incluida puede reutilizarse para adaptar GR00T N1.7 a otras tareas de manipulacion con el mismo robot.

## Benchmarks y rendimiento

Evaluacion en RoboTwin 2.0 con `eval_policy.py`, seed 0, instrucciones no vistas, 100 episodios por configuracion. Easy = escenas limpias; Hard = escenas con domain randomization.

| Checkpoint | Datos de entrenamiento | Easy (%) | Hard (%) | Experimento |
|---|---|---|---|---|
| baseline | 50 demos limpias | 20 | 3 | EXP-032 |
| cosmos-aug | 50 demos limpias + 50 escenas Cosmos3 | 37 | 18 | EXP-044 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible, lo cual es esperable en un modelo de politica robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 13,8 GB en safetensors, por lo que en precision completa se requiere al menos esa cantidad mas overhead de activaciones y del servidor de politica.
- GPU de entrenamiento documentadas: 2 x NVIDIA B300 (batch global 64, 10.000 pasos).
- GPU recomendadas para inferencia: no disponible; por tamano (3B) es plausible su ejecucion en GPUs de datacenter (A100, H100) y potencialmente en consumer de gama alta, pero no se confirma en la informacion proporcionada.
- Despliegue: policy server de GR00T integrado con `eval_policy.py` de RoboTwin 2.0. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles. La evaluacion ejecuta 8 pasos de accion por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7-robotwin-pick_dual_bottles-cosmos-aug (este) | 3B | no disponible | Manipulacion bimanual RoboTwin 2.0 | NVIDIA Open Model License | HuggingFace |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | VLA generalista | NVIDIA Open Model License | HuggingFace |
| Checkpoint baseline del mismo repo | 3B | no disponible | Manipulacion bimanual RoboTwin 2.0 | NVIDIA Open Model License | HuggingFace (mismo repo) |
| Otras politicas VLA para RoboTwin 2.0 | no disponible | no disponible | Manipulacion | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado exclusivamente para la tarea `pick_dual_bottles` de RoboTwin 2.0 y el embodiment Aloha; no es un VLA generalista.
- Rendimiento absoluto bajo en Hard: incluso el mejor checkpoint alcanza solo un 18% de exito en escenas con domain randomization, lo que limita su uso en produccion real sin entrenamiento adicional.
- Evaluacion unicamente en simulacion: no se reportan resultados en robot fisico; la transferencia sim-to-real no esta validada en la informacion disponible.
- Dependencia de datos sinteticos: parte del entrenamiento usa escenas generadas por Cosmos3-Nano-Sim-Transfer, con posibles artefactos o sesgos de simulacion no cuantificados.
- Licencia restrictiva: NVIDIA Open Model License impone condiciones especificas para uso comercial; es necesario revisar el acuerdo antes de cualquier despliegue productivo.
- Sin informacion sobre sesgos, alucinacion o comportamiento multilingue: no disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de validacion independiente por la comunidad.
- Seleccion de checkpoint sobre un unico seed de validacion (Hard, 50 episodios): la varianza estadistica de las metricas reportadas no se documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-pick_dual_bottles-cosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-pick_dual_bottles-clean50-cosmos50-gr00t
- Codigo y log de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
