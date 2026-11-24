# teamflowrl/TeamFlowRL

## Resumen

TeamFlowRL es un conjunto de checkpoints de un metodo de aprendizaje por refuerzo multiagente (MARL) desarrollado por investigadores de la Universidad Sun Yat-sen (Guowei Zou, Beiwen Zhang, Haitao Wang, Hong Hong, Zhiquan Chen y Hejun Wu). No es un modelo de lenguaje: es una politica de control descentralizada basada en flow matching, preentrenada offline para cada agente y posteriormente ajustada online con MAPPO. Cada agente actua a partir de su observacion local mediante una trayectoria de denoising de diez pasos, y la actualizacion de politica pondera la ratio de la trayectoria completa de cada agente con una ventaja de equipo compartida, recortando cada ratio de forma independiente.

El repositorio publica 50 configuraciones de checkpoints: 45 en benchmarks de coordinacion multiagente (SMAC, MPE, MaMuJoCo, OMIGA-MaMuJoCo y SMACv2) y 5 en tareas roboticas con multiples robots (ManiSkill3 y RoboFactory). Para cada configuracion se incluyen dos ficheros: el preentrenamiento offline (`pretrained.pt`) y el checkpoint tras el ajuste online (`teamflowrl_step<N>.pt`), que es el que respalda los resultados reportados en el articulo.

Su relevancia actual reside en el enfoque offline-to-online aplicado a politicas generativas descentralizadas: combina la expresividad del flow matching con la estabilidad del ajuste online mediante MAPPO, y lo valida en un espectro amplio de entornos de referencia, desde juegos de unidades en StarCraft hasta manipulacion cooperativa con dos brazos roboticos. La licencia MIT y el formato PyTorch estandar facilitan su reutilizacion, aunque el repositorio pesa 2,5 GB y no incluye datasets ni simuladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica descentralizada por agente basada en flow matching (denoising de 10 pasos), ajustada online con MAPPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; cada agente observa su observacion local) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de control, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, cargables con `torch.load(..., weights_only=False)`) |

## Arquitectura y entrenamiento

TeamFlowRL entrena una politica de flow matching descentralizada por agente. Cada agente genera su accion mediante una trayectoria de denoising de diez pasos condicionada por su observacion local, lo que permite modelar distribuciones de accion multimodales, algo que las politicas gaussianas habituales en MARL no capturan bien. El preentrenamiento es offline sobre los datasets publicos de cada benchmark: OG-MARL para SMAC, SMACv2 y MaMuJoCo, los datasets de OMIGA y los datasets de MPE empleados en trabajos previos de MARL offline. En robotica se usan demostraciones exitosas de ManiSkill3 y demostraciones grabadas de un experto PPO para RoboFactory; la politica con camara se destila de un profesor basado en estado mediante DAgger.

El ajuste online emplea MAPPO con una innovacion central: la actualizacion de politica pondera la ratio de la trayectoria completa de cada agente (no solo del paso individual) con una ventaja de equipo compartida, y recorta cada ratio por separado. Esto estabiliza el ajuste fino de politicas generativas con decodificacion iterativa, donde la ratio por paso seria extremadamente ruidosa. Los checkpoints de benchmark se toman en el paso online del resultado reportado (como maximo 50 millones de pasos); los de robotica son los checkpoints finales del ajuste online. Algunas celdas se entrenaron con variantes del codigo (`bounded_mean`, `rev2`, `rev1_kl_backtrack`, `minibatch_kl`, `chunked_rollout_kl`), que deben indicarse con `--variant` al evaluar.

## Capacidades

- Control multiagente descentralizado: cada agente actua solo con su observacion local, sin comunicacion centralizada en tiempo de ejecucion.
- Coordinacion en juegos de StarCraft (SMAC y SMACv2): microgestion de unidades con acciones discretas y recompensas cooperativas.
- Control continuo multiagente en MPE y MaMuJoCo, incluyendo tareas de locomotion cooperativa.
- Aprendizaje offline-to-online: parte de un preentrenamiento offline y mejora con interaccion en entorno mediante MAPPO.
- Manipulacion robotica cooperativa con dos brazos en ManiSkill3 (TwoRobotPickCube, TwoRobotStackCube, TwoRobotStackCube-HandsAway) y RoboFactory (TwoRobotsStackCube).
- Soporte de observaciones visuales: la configuracion TwoRobotStackCube con camara usa una politica destilada de un profesor basado en estado.
- Modelado de distribuciones de accion multimodales gracias al flow matching con trayectoria de denoising de diez pasos.
- No soporta tool calling, function calling, agentes linguisticos ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en MARL cooperativo: usar los checkpoints como linea base reproducible en SMAC, SMACv2, MPE, MaMuJoCo y OMIGA-MaMuJoCo, con semillas de evaluacion fijas (10000, 80000, 90000) y tres grupos de 20 episodios por celda.
- Microgestion en StarCraft II: desplegar la politica en el escenario `5m_vs_6m` para estudiar coordinacion descentralizada con acciones discretas y comparar variantes de recorte de ratio.
- Manipulacion robotica con dos brazos en simulacion: evaluar TwoRobotPickCube y TwoRobotStackCube en ManiSkill3 como punto de partida para transferencia a entornos reales o para comparar politicas de flow matching frente a politicas gaussianas.
- Ajuste fino online desde el preentrenamiento: apuntar `source_checkpoint` o `CKPT_ROOT` a `pretrained.pt` para reproducir el pipeline offline-to-online en un entorno propio o en una tarea nueva del mismo benchmark.
- Destilacion de politicas con vision: reutilizar la configuracion con camara de TwoRobotStackCube y el esquema DAgger del profesor basado en estado para entrenar politicas visuales en otras tareas de manipulacion.
- Estudio de estabilidad del ajuste online: usar los checkpoints intermedios (`teamflowrl_step<N>.pt`) para analizar curvas de aprendizaje y sensibilidad a la ventaja de equipo compartida.
- Evaluacion comparativa de algoritmos offline-to-online: emplear el repositorio como referencia para contrastar MAPPO sobre politicas de flow matching con alternativas como IQL, CQL o TD3+BC en los mismos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe un resultado reportado por configuracion (el paso online al que corresponde cada checkpoint), pero no incluye las cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo pesa 2,5 GB, pero el tamano por checkpoint individual no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. Al ser politicas pequenas de control, es plausible que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load` con `map_location="cpu"` o GPU), usando el codigo del repositorio de GitHub (`eval.evaluate_main_table` para benchmarks y `robots/core/evaluate.py` para robotica). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Cada accion requiere una trayectoria de denoising de diez pasos por agente, lo que implica diez evaluaciones de red por decision.
- Almacenamiento: los checkpoints se descargan por configuracion con `hf download --include`; los datasets y simuladores no estan incluidos y deben configurarse segun el repositorio de codigo.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Entornos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeamFlowRL | MARL offline-to-online | Flow matching + MAPPO | SMAC, SMACv2, MPE, MaMuJoCo, OMIGA-MaMuJoCo, ManiSkill3, RoboFactory | MIT | Checkpoints en Hugging Face, codigo en GitHub |
| Politicas gaussianas MAPPO | MARL online | MAPPO con politica gaussiana | SMAC, MPE, MaMuJoCo | no disponible | Implementaciones multiples |
| IQL / CQL (MARL offline) | MARL offline | Q-learning offline | OG-MARL, OMIGA | no disponible | Implementaciones multiples |
| OMIGA | MARL offline | Algoritmo de referencia del benchmark OMIGA | OMIGA-MaMuJoCo | no disponible | Codigo publico |

No se dispone de cifras de rendimiento comparativas en la informacion proporcionada, por lo que la comparativa se limita a enfoque, entornos y licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento linguistico; cualquier uso en esos dominios es inaplicable.
- Los datasets y simuladores no estan incluidos en el repositorio; la evaluacion requiere configurar OG-MARL, OMIGA, ManiSkill3 y RoboFactory por separado.
- Algunas celdas de benchmark dependen de variantes del codigo (`bounded_mean`, `rev2`, `rev1_kl_backtrack`, `minibatch_kl`, `chunked_rollout_kl`); evaluar sin el `--variant` correcto produce resultados no comparables.
- Las rutas guardadas en las configuraciones son relativas (`outputs/`, `${DATA_ROOT}/`), lo que puede romper la carga si no se replica la estructura de directorios.
- La evaluacion con camara depende de una politica destilada con DAgger de un profesor basado en estado; el rendimiento en vision puede degradarse fuera de la distribucion de demostraciones.
- Riesgo de sobreajuste a los benchmarks: los checkpoints se seleccionan en el paso del resultado reportado, lo que puede inflar la comparacion si no se usan semillas y protocolos de evaluacion identicos.
- No hay informacion sobre sesgos, robustez ante perturbaciones o comportamiento fuera de distribucion; en robotica real la transferencia desde simulacion no esta validada en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/teamflowrl/TeamFlowRL
- Pagina del proyecto: https://teamflowrl.github.io/
- Codigo: https://github.com/teamflowrl/TeamFlowRL
- Articulo (referencia en la model card): TeamFlowRL: Online Policy Optimization of Decentralized Flow Policies for Multi-Agent Coordination, Zou et al., 2026
