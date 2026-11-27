# tmhoanggg/so101-blocks-storing-pi05

## Resumen

`so101-blocks-storing-pi05` es un conjunto de politicas de robotica entrenadas mediante ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez implementa la arquitectura pi0.5 de Physical Intelligence. El autor, tmhoanggg, lo publica como parte de un experimento comparativo sobre el uso de ramas auxiliares con codificadores visuales congelados en tareas de manipulacion robotica. El modelo resuelve la tarea concreta de almacenar bloques (blocks storing) sobre un entorno SO-101, y su interes radica en que documenta una receta reproducible de entrenamiento con LeRobot y compara cuatro variantes de codificador auxiliar (VIRGIL, DINOv2-base, CLIP ViT-B/16 y SigLIP-2).

El repositorio no es un modelo de lenguaje generalista, sino un artefacto de investigacion orientado a politicas visuomotoras (vision-language-action). No se dispone de informacion sobre el pipeline, la licencia ni los idiomas en la ficha de Hugging Face, y el numero de descargas y likes es cero en el momento de la consulta. La relevancia es acotada: sirve como referencia tecnica para quienes replican experimentos de pi0.5 con LeRobot y desean evaluar el impacto de distintos encoders auxiliares en el rendimiento de la politica.

La model card describe la receta de entrenamiento con detalle (30k pasos, batch 64, learning rate 2.5e-5 con decaimiento a 2.5e-6, warmup de 1k pasos, articulaciones absolutas, chunk de 50, normalizacion por cuantiles), lo que permite reproducir el setup, aunque no se aportan resultados cuantitativos de exito en la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (Gemma + action expert) con rama auxiliar de codificador visual congelado; SigLIP congelado como encoder principal |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio organizado en carpetas por politica con checkpoint de 30k pasos) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, una implementacion de pi0.5 que combina un modelo de lenguaje Gemma con un "action expert" para generar acciones motoras a partir de observaciones visuales y de estado. Sobre esa base, el autor anade una rama lateral con un codificador visual congelado que se entrena de forma conjunta con la politica principal. La receta es identica para las cuatro variantes: SigLIP congelado como encoder principal, rama auxiliar con encoder congelado, 30k pasos con batch de 64, learning rate de 2.5e-5 con decaimiento hasta 2.5e-6, warmup de 1k pasos, articulaciones absolutas, chunk de 50 y normalizacion por cuantiles. Se usan unicamente las camaras SIDE y de muneca; la camara de profundidad lateral no se emplea.

Las cuatro variantes se diferencian solo en el codificador de la rama auxiliar: VIRGIL (metodo principal, requiere el repositorio github.com/tmhoanggg/r3m en PYTHONPATH), DINOv2-base, CLIP ViT-B/16 y SigLIP-2. Cada politica se selecciona en tiempo de rollout mediante la variable de entorno `PI05_AUX` (`virgil_pred`, `dinov2`, `clip`, `siglip2`). El codigo de rollout, intercambio de encoder e inyeccion auxiliar esta en la carpeta `code/` (`lerobot_rollout_pi05.py`, `encoder_swap.py`, `aux_inject.py`). No se documentan datos sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, ya que se trata de una politica visuomotora y no de un LLM conversacional.

## Capacidades

- Control visuomotor para manipulacion robotica: genera acciones de articulaciones absolutas en chunks de 50 pasos a partir de observaciones de camaras SIDE y de muneca.
- Ejecucion de la tarea especifica de almacenamiento de bloques (blocks storing) en el entorno SO-101.
- Soporte de multiples variantes de codificador auxiliar seleccionables en tiempo de rollout mediante `PI05_AUX`.
- Integracion con LeRobot para rollout y evaluacion.
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, agentes, multilingue, thinking mode, audio ni vision de proposito general.

## Casos de uso

- Replicacion de experimentos de pi0.5: el repositorio permite reproducir la receta exacta de fine-tuning sobre `locht131/blocks_storing` con LeRobot (commit f5c9bc02), util para validar resultados de investigacion en politicas visuomotoras.
- Comparativa de encoders auxiliares: las cuatro variantes (VIRGIL, DINOv2, CLIP, SigLIP-2) permiten evaluar el impacto de cada codificador congelado en el rendimiento de la politica bajo un mismo protocolo de entrenamiento.
- Base para fine-tuning en tareas de pick-and-place: la politica puede servir como punto de partida para tareas de almacenamiento o clasificacion de objetos con el robot SO-101.
- Evaluacion de metodos de inyeccion auxiliar: el codigo `aux_inject.py` y `encoder_swap.py` facilitan experimentar con distintas estrategias de fusion de caracteristicas visuales.
- Docencia e investigacion en robotica: el setup reproducible (30k pasos, batch 64, hiperparametros documentados) es adecuado para practicas de laboratorio sobre aprendizaje por imitacion.
- Benchmark interno de infraestructura de rollout: al requerir la misma `n_action_steps` y fps para todas las politicas, sirve para comparar latencia y throughput de distintos backends de inferencia robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parametros totales ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot con el script `code/lerobot_rollout_pi05.py`; VIRGIL requiere ademas github.com/tmhoanggg/r3m (rama main) en PYTHONPATH.
- Latencia y throughput: no disponibles; la model card solo indica que debe usarse la misma `n_action_steps` y fps en todas las politicas para comparaciones justas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-blocks-storing-pi05 | no disponible | no disponible | Manipulacion robotica (blocks storing) | no disponible | Hugging Face (0 descargas, 0 likes) |
| lerobot/pi05_base | no disponible | no disponible | Politica visuomotora base pi0.5 | no disponible | Hugging Face (modelo base del fine-tuning) |
| locht131/blocks_storing | no disponible | no disponible | Dataset de la tarea de blocks storing | no disponible | Hugging Face (dataset de entrenamiento) |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una politica entrenada sobre un dataset concreto (`locht131/blocks_storing`), su comportamiento esta sesgado hacia esa tarea y ese entorno fisico.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de generalizacion deficiente fuera de la distribucion del dataset de entrenamiento (posiciones, iluminacion, objetos no vistos).
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; no se documentan idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Caveats para produccion: el modelo depende de la camara SIDE y de muneca (no usa la camara de profundidad lateral); VIRGIL requiere una dependencia externa (`github.com/tmhoanggg/r3m`); se debe respetar la misma `n_action_steps` y fps entre politicas para comparaciones validas; el repositorio tiene cero descargas y cero likes, lo que sugiere ausencia de validacion externa.
- El checkpoint publicado corresponde a 30k pasos; no se documenta el rendimiento de checkpoints intermedios ni curvas de aprendizaje.

## Enlaces

- Hugging Face: https://huggingface.co/tmhoanggg/so101-blocks-storing-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/locht131/blocks_storing
- Repositorio VIRGIL (dependencia): https://github.com/tmhoanggg/r3m
- LeRobot (framework): https://github.com/huggingface/lerobot
