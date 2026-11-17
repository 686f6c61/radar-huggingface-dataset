# ywsldxk1/so101-pi05-staged-fullft-20261113

## Resumen

`ywsldxk1/so101-pi05-staged-fullft-20261113` es un checkpoint de robótica derivado de `5hadytru/so101_bench_pi05` (revision `122d1ca2cd0dbd60e4cfed748e34826307d33365`), construido sobre el modelo base pi0.5 y entrenado con la librería LeRobot. Se trata de un ajuste fino completo (full fine-tuning) de todos los parámetros, sin LoRA ni bloques congelados de forma intencionada, orientado a tareas de manipulación con el brazo robótico SO-101 en un entorno de banco de pruebas (bench). El autor publica checkpoints intermedios de un entrenamiento que, según la propia model card, sigue en curso.

El entrenamiento se organiza en dos etapas: la etapa A usa únicamente el conjunto `core41` durante 250 actualizaciones del optimizador, y la etapa B continúa desde los mismos pesos y el mismo estado de Adam durante otras 250 actualizaciones, mezclando muestras de `core41` y `official32` con probabilidades del 75 % y 25 % respectivamente. Se emplea un microbatch de 8 con acumulación de 4 (batch efectivo de 32), cuatro cámaras de entrada, acciones a 30 Hz y un chunk de acción de 30 pasos.

El modelo es relevante como ejemplo de flujo de trabajo de ajuste fino por etapas para políticas robóticas tipo vision-language-action, pero conviene subrayar que el autor declara explícitamente que los checkpoints intermedios son experimentales y que no se formulan afirmaciones de éxito en tarea. El repositorio ocupa 167,1 GB, en buena parte por los estados de recuperación comprimidos y cifrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (política vision-language-action sobre modelo base pi0.5); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (ficheros de inferencia bajo `pretrained_model/` de cada checkpoint) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, la política robótica del ecosistema LeRobot, y aplica un ajuste fino completo sobre el checkpoint `5hadytru/so101_bench_pi05`. No se congelan bloques de forma deliberada ni se usa LoRA: el autor indica que los parámetros desconectados del grafo de la pérdida de acción simplemente no reciben gradiente. Se conservan el preprocesado y la normalización originales del checkpoint base.

El entrenamiento es por etapas. La etapa A entrena solo con `core41` durante 250 actualizaciones; la etapa B reanuda los mismos pesos y el estado de Adam durante otras 250 actualizaciones, muestreando `core41` y `official32` con probabilidades 75 % / 25 %. La configuración usa microbatch 8, acumulación 4 (batch efectivo 32), cuatro entradas de cámara, acciones a 30 Hz y chunk de acción de 30. Se publican checkpoints intermedios de inferencia (A100, A200, B100, B200), los puntos finales de etapa A250 y B250 con estado de optimizador y RNG reanudable, y A1 como checkpoint adicional de validación de recuperación. Los estados completos de recuperación van comprimidos y cifrados bajo `recovery/`, con la clave privada en poder del autor.

## Capacidades

- Generación de acciones robóticas a partir de observaciones multimodales: cuatro entradas de cámara y acciones a 30 Hz con chunk de 30 pasos.
- Control de manipulación para el brazo SO-101 en el entorno de banco de pruebas del proyecto.
- Ajuste fino completo sobre pi0.5, lo que en principio permite adaptar la política a tareas específicas del banco.
- Checkpoints reanudables con estado de optimizador y RNG preservado en los puntos finales de etapa (A250, B250).
- No se documentan capacidades de tool calling, agentes, multilingüismo, razonamiento textual ni visión general fuera del pipeline robótico.

## Casos de uso

- Reproducción de experimentos de ajuste fino por etapas: el checkpoint A250 y B250 permiten reanudar el entrenamiento con el estado de Adam y RNG intactos, útil para estudiar el efecto de mezclar `core41` y `official32`.
- Evaluación de políticas de manipulación en el banco SO-101: sirve como punto de partida para medir reproducción de tareas de entrenamiento, no generalización retenida.
- Investigación sobre ajuste fino completo frente a LoRA en políticas VLA: al no congelar bloques, permite analizar qué parámetros reciben gradiente a través de la pérdida de acción.
- Comparación de checkpoints intermedios (A100, A200, B100, B200): útil para trazar la evolución de la política durante el entrenamiento.
- Integración en pipelines LeRobot: al usar el formato y la librería estándar, se puede cargar con las herramientas de LeRobot para inferencia en el robot.
- Estudio de configuraciones de acción (30 Hz, chunk 30) y de fusión de cuatro cámaras en políticas de imitación.
- Base para experimentos de recuperación y validación (checkpoint A1) en flujos de entrenamiento largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se formulan afirmaciones de éxito en tarea y que los 73 episodios de datos reparados no constituyen un conjunto de test independiente; la reconstrucción Part3A mide reproducción de tareas de entrenamiento, no generalización retenida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de parámetros no se publica y el repo de 167,1 GB incluye estados de recuperación cifrados, por lo que no es indicativo del peso del modelo.
- GPU recomendadas: el autor menciona A100, A200, B100 y B200 como plataformas de los checkpoints de inferencia intermedios.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Ajuste | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-pi05-staged-fullft-20261113 | pi0.5 (`5hadytru/so101_bench_pi05`) | Full fine-tuning por etapas | no disponible | no disponible | Hugging Face, repo de 167,1 GB |
| 5hadytru/so101_bench_pi05 | pi0.5 | Checkpoint base del banco SO-101 | no disponible | no disponible | Hugging Face |
| pi0.5 (modelo base) | — | — | no disponible | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento en curso: el autor declara que los checkpoints intermedios son experimentales y que no se formulan afirmaciones de éxito en tarea.
- Los 73 episodios de datos reparados no son un conjunto de test independiente; la reconstrucción Part3A mide reproducción de tareas de entrenamiento, no generalización retenida.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles; el modelo es una política robótica, no un modelo de lenguaje general.
- Los estados de recuperación están cifrados y la clave privada no se publica, lo que limita la reproducibilidad completa del entrenamiento por terceros.
- Riesgo de sobreajuste a las tareas del banco SO-101 y a la configuración concreta de cuatro cámaras y 30 Hz.
- No se documentan sesgos, tasas de alucinación ni métricas de robustez; al ser un modelo de acción, el riesgo relevante es de fallo de política en entornos distintos al de entrenamiento.
- El tamaño del repositorio (167,1 GB) puede dificultar su descarga y almacenamiento en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ywsldxk1/so101-pi05-staged-fullft-20261113
- Checkpoint base: https://huggingface.co/5hadytru/so101_bench_pi05
- LeRobot (librería): https://github.com/huggingface/lerobot
