# tina390/PolicyIK

## Resumen

PolicyIK es una política de aprendizaje por refuerzo condicionada por objetivos (goal-conditioned) diseñada para resolver cinemática inversa de alta precisión en brazos robóticos. Lo desarrolla un equipo de investigación encabezado por Yuhan Liu y Xinqi Liu, y se publica junto al artículo arXiv 2611.05372. El repositorio de Hugging Face contiene exclusivamente los pesos de las políticas entrenadas en simulación para el brazo OpenArm de 7 grados de libertad (7-DoF); no es un modelo de lenguaje ni un modelo generativo multimodal, sino un checkpoint de política para control robótico.

El problema que aborda es la cinemática inversa (IK): dado un objetivo de posición y orientación del efector final, calcular las articulaciones del brazo que lo alcanzan. Los métodos analíticos y numéricos clásicos sufren en configuraciones cercanas a singularidades o con restricciones de articulación, y los enfoques de aprendizaje supervisado requieren demostraciones densas. PolicyIK se plantea como una alternativa de RL que aprende directamente una política de control.

La relevancia es acotada pero concreta: el autor reporta que, en simulación, un único intento mantiene los errores medios del último segundo por debajo de 1 mm y 0,2° en el 93,5% de las tareas reservadas, y que un protocolo de despliegue eleva el éxito al 98,9%. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos son ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de aprendizaje por refuerzo condicionada por objetivos (goal-conditioned); topología de red no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el estado de entrada es la observación del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

Según la model card, PolicyIK es una política de RL condicionada por objetivos entrenada para cinemática inversa de alta precisión sobre el brazo OpenArm de 7-DoF. El entrenamiento se realiza en simulación, presumiblemente con Isaac Lab (la etiqueta `isaac-lab` aparece en los tags del repositorio), aunque la model card no detalla la composición del entorno, el número de pasos de entrenamiento ni los hiperparámetros. No se especifica si se emplea PPO, SAC u otro algoritmo de RL, ni la topología exacta de la red (MLP, transformer u otra).

El repositorio publica tres checkpoints correspondientes a las semillas de entrenamiento 1, 2 y 3 (`checkpoints/policyik_s{1,2,3}.pth`), idénticos a los de `simulation/checkpoints/` del repositorio de código. Los datos de entrenamiento y las tareas de evaluación están en el dataset `tina390/PolicyIK-Data`. La model card menciona un "protocolo de despliegue" que eleva el éxito del 93,5% al 98,9%, pero no describe en qué consiste dicho protocolo ni si implica ajuste fino, selección de semilla o filtrado de acciones.

## Capacidades

- Control de cinemática inversa para un brazo robótico de 7 grados de libertad (OpenArm) en simulación.
- Política condicionada por objetivos: recibe un objetivo de pose del efector final y produce acciones articulares.
- Precisión reportada de 1 mm y 0,2° de error medio en el último segundo de la trayectoria en el 93,5% de las tareas reservadas con un solo intento.
- Éxito del 98,9% con el protocolo de despliegue descrito por el autor.
- Tres semillas de entrenamiento disponibles para evaluar variabilidad.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se reportan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de cinemática inversa en simulación: cargar `policyik_s1.pth` y ejecutar `simulation/scripts/evaluate.sh` para reproducir las métricas de error reportadas sobre las tareas de `PolicyIK-Data`; útil para comparar contra solvers analíticos o numéricos en el mismo banco de pruebas.
- Punto de partida para transferencia a un brazo OpenArm real: el protocolo de despliegue que eleva el éxito al 98,9% sugiere que la política está pensada para ser validada primero en simulación y luego en hardware, aunque la model card no detalla el procedimiento de sim-a-real.
- Investigación en RL para robótica: las tres semillas permiten estudiar la varianza entre entrenamientos y la robustez de la política ante condiciones iniciales distintas.
- Benchmark de referencia para nuevos métodos de IK aprendida: al publicar pesos, datos y código, sirve como línea base reproducible para comparar políticas de cinemática inversa en el mismo robot y conjunto de tareas.
- Selección de política para tareas de precisión sub-milimétrica: en escenarios simulados donde se requiere posicionamiento fino (ensamblaje, inserción de piezas), la política puede evaluarse frente a solvers clásicos antes de comprometer un despliegue.
- Docencia y experimentación con Isaac Lab: el repositorio de código y los checkpoints permiten montar prácticas sobre entrenamiento y evaluación de políticas de control con RL en un brazo de 7-DoF.

## Benchmarks y rendimiento

| Metrica | Resultado reportado |
|---|---|
| Error medio en el último segundo (1 intento) | ≤ 1 mm y ≤ 0,2° |
| Tasa de éxito con 1 intento (tareas reservadas) | 93,5% |
| Tasa de éxito con protocolo de despliegue | 98,9% |

No se han publicado en la información disponible resultados comparativos frente a otros métodos de cinemática inversa (por ejemplo, IK analítica, damped least squares o políticas de RL alternativas), ni métricas por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y los pesos son ligeros, por lo que probablemente caben en cualquier GPU consumer, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Para el entrenamiento en Isaac Lab se suele requerir una GPU NVIDIA compatible con CUDA; no se especifica modelo mínimo.
- ¿Cabe en GPU consumer? Muy probablemente sí por el tamaño de los checkpoints, pero no confirmado.
- Opciones de despliegue: evaluación mediante el repositorio de código (`simulation/scripts/evaluate.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de cinemática inversa aprendidas ni con solvers clásicos, y no se identifican modelos comparables en el mismo repositorio o en la model card.

## Limitaciones y advertencias

- Solo se publican políticas de simulación para el brazo OpenArm de 7-DoF; no hay evidencia en la información disponible de que funcionen en otros robots o en hardware real sin un protocolo adicional.
- El 98,9% de éxito corresponde a un "protocolo de despliegue" no descrito en detalle; sin esa descripción, la cifra no es directamente reproducible a partir del checkpoint por sí solo.
- No se documentan sesgos, pero al ser una política entrenada en simulación, cabe esperar una brecha sim-a-real no cuantificada.
- Riesgo de fallo en configuraciones cercanas a singularidades o fuera de la distribución de tareas de entrenamiento; no se reportan métricas de robustez fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la seguridad del control generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-17), por lo que no hay validación independiente de las métricas reportadas.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/tina390/PolicyIK
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/tina390/PolicyIK-Data
- Paper: https://arxiv.org/abs/2611.05372
- Código: https://github.com/Tinaliu0123/PolicyIK
- Página del proyecto: https://tinaliu0123.github.io/PolicyIK/
