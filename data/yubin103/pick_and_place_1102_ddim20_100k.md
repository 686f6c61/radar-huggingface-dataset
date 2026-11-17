# YuBin103/pick_and_place_1102_ddim20_100k

## Resumen

`YuBin103/pick_and_place_1102_ddim20_100k` es una política de control visuomotor para robótica entrenada con el *framework* LeRobot de Hugging Face. Implementa Diffusion Policy, un enfoque que modela el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción suaves y multimodales, especialmente adecuadas para tareas de manipulación con contacto rico. El modelo está pensado para ejecutarse sobre un robot tipo `so100_follower` y se distribuye con pesos en formato safetensors listos para inferencia con la librería `lerobot`.

El desarrollo corre a cargo del usuario YuBin103 y se apoya en el conjunto de datos `YuBin103/pick_and_place_1102_20261102_194727`, que da nombre a la tarea de *pick and place* (coger y colocar). El nombre del repositorio sugiere un muestreo DDIM con 20 pasos de difusión y un entrenamiento de 100 000 pasos, aunque estos extremos no se confirman de forma explícita en la model card.

Se trata de un modelo de nicho, con un recuento real de 266,6 millones de parámetros y un tamaño de repositorio de 1,1 GB, publicado bajo licencia Apache 2.0. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es una política robótica específica para una tarea y un entorno concretos, por lo que su relevancia es acotada al ámbito de la investigación en imitación y control robótico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa basada en difusión) |
| Parámetros totales | 266.622.776 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la formulación de Diffusion Policy (Chi et al., 2023, arXiv:2303.04137), que trata el control visuomotor como un proceso generativo: en lugar de predecir una única acción de forma determinista, aprende a generar trayectorias de acción completas mediante un proceso de difusión condicionado por las observaciones visuales y el estado del robot. Esto permite representar distribuciones multimodales de acciones y producir movimientos suaves y coherentes en el tiempo, lo que resulta especialmente útil en tareas de manipulación con contacto.

El nombre del repositorio indica un muestreo DDIM con 20 pasos (`ddim20`) y un entrenamiento de 100 000 pasos (`100k`), aunque estos detalles no se detallan en la model card. El entrenamiento se ha realizado con LeRobot sobre el *dataset* `YuBin103/pick_and_place_1102_20261102_194727`, que corresponde a una tarea de *pick and place*. No se especifican en la información disponible el número de episodios, la composición exacta del *dataset* ni si se aplicaron técnicas de *fine-tuning* adicionales.

## Capacidades

- Generación de trayectorias de acción multimodales y temporalmente coherentes para control robótico.
- Ejecución de tareas de manipulación con contacto rico, como *pick and place*.
- Control visuomotor a partir de observaciones (imágenes) y estado del robot, según la formulación de Diffusion Policy.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Compatible con robots tipo `so100_follower` en los flujos de evaluación de LeRobot.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de tareas de *pick and place* en laboratorio: la política puede ejecutar la secuencia de coger y colocar objetos aprendida del *dataset* de entrenamiento, adecuada para experimentos de imitación en robótica de mesa.
- Investigación en imitación visuomotora: sirve como referencia o punto de partida para comparar Diffusion Policy frente a otras políticas (ACT, VQ-BeT) en tareas de manipulación.
- Evaluación de *pipelines* de LeRobot: útil para validar el flujo `lerobot-record` con `--policy.path` sobre un robot `so100_follower` y comprobar la integración de extremo a extremo.
- Prototipado de manipulación con contacto: la naturaleza generativa de la difusión produce trayectorias suaves, útil en escenarios donde los movimientos bruscos degradan el resultado.
- Reproducción de experimentos: al estar publicados los pesos y el *dataset* asociado, permite reproducir el entrenamiento y la evaluación en un entorno controlado.
- Base para *fine-tuning* en tareas similares: puede adaptarse a variantes de la misma tarea de manipulación con datos adicionales recogidos con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 266,6 M de parámetros y pesos en safetensors (repositorio de 1,1 GB), la inferencia en precisión completa requiere del orden de 1-2 GB de VRAM, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible; el flujo de LeRobot del ejemplo usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA compatible con CUDA.
- GPU de consumo: es plausible que quepa en GPU de consumo con suficiente VRAM, pero no hay confirmación en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `YuBin103/pick_and_place_1102_ddim20_100k` | Diffusion Policy (LeRobot) | 266,6 M | no aplica | Apache 2.0 | Hugging Face |
| Otras políticas LeRobot (ACT, VQ-BeT, TDMPC) | Políticas de imitación/RL | no disponible | no aplica | según modelo | Hugging Face / LeRobot |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo específico de tarea y entorno: entrenado para *pick and place* sobre un *dataset* concreto; no se espera que generalice a otras tareas, objetos o configuraciones de robot sin reentrenamiento o *fine-tuning*.
- Sin datos de benchmarks: no hay métricas publicadas de éxito, precisión ni robustez, lo que dificulta evaluar su rendimiento real.
- Sesgos desconocidos: al depender del *dataset* de entrenamiento, puede heredar sesgos de distribución (posiciones, iluminación, tipos de objeto) no documentados.
- Riesgo de fallo en producción: las políticas de imitación pueden fallar ante condiciones fuera de distribución; no hay información sobre robustez ni seguridad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Idiomas y contexto: no aplica; no es un modelo de lenguaje, por lo que las filas de idiomas y contexto de la ficha no tienen sentido técnico en este caso.
- Advertencia de seguridad: cualquier despliegue en un robot real debe incluir salvaguardas físicas y supervisión, dado que no se documentan límites de par, velocidades ni paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YuBin103/pick_and_place_1102_ddim20_100k
- Dataset asociado: https://huggingface.co/datasets/YuBin103/pick_and_place_1102_20261102_194727
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
