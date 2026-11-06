# Traly/concertina-libero

## Resumen

Concertina LIBERO es un checkpoint de política robótica del modelo Concertina, un modelo de visión-lenguaje-acción (VLA) de tipo difusión desarrollado por Chengcheng Wang, Wei He, Wenhao Li, Hongguang Li, Kai Han, Jianyuan Guo y Chang Xu, y publicado en Hugging Face por el usuario Traly. El modelo resuelve el problema de unificar manipulación robótica y cognición (razonamiento visual y lingüístico) en una única arquitectura de difusión visión-lenguaje, en lugar de encadenar un modelo de lenguaje con un módulo de control separado. Este checkpoint concreto es un ajuste fino del modelo base `Traly/concertina-pretrain-90k` sobre los cuatro suites del benchmark LIBERO (spatial, object, goal y 10).

El interés inmediato del modelo radica en su resultado reportado en el paper: un 98,15 % de éxito (1.963 de 2.000 episodios) sobre LIBERO, lo que lo sitúa en la franja alta de los VLA evaluados en ese benchmark. El checkpoint es autocontenido como política LeRobot (tipo `concertina`), incluye configuración, pesos en bf16, pre/post-procesadores y los ficheros del backbone Bard-VL, lo que facilita su reproducción mediante la herramienta `concertina-eval-libero`. Con 4.447.963.669 parámetros y un tamaño de repositorio de 8,9 GB, es un modelo grande para el estándar de políticas robóticas, pensado para inferencia en GPU de centro de datos más que para despliegue en robot de borde.

La relevancia actual es doble: por un lado, aporta un punto de referencia reproducible en LIBERO con licencia MIT, algo poco habitual en modelos de esta escala; por otro, demuestra que un único modelo de difusión puede cubrir tareas de manipulación heterogéneas (espacial, de objeto, de meta y de horizonte largo) sin cambios de arquitectura entre suites.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión visión-lenguaje-acción (VLA) con backbone Bard-VL; política LeRobot de tipo `concertina` |
| Parámetros totales | 4.447.963.669 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) en `model.safetensors`, más `config.json`, pre/post-procesadores y directorio `backbone/` |

## Arquitectura y entrenamiento

Concertina se presenta en el paper como un modelo de difusión visión-lenguaje que integra manipulación y cognición en una sola red, apoyado en el backbone Bard-VL para la parte visión-lenguaje. El checkpoint LIBERO es un ajuste fino del modelo preentrenado `Traly/concertina-pretrain-90k` sobre el dataset `lerobot/libero`, que agrupa las cuatro suites del benchmark. Durante el ajuste no se congela ningún parámetro: todos los pesos del modelo se entrenan, según indica la model card.

El entrenamiento reportado consiste en 5.000 actualizaciones con 448 muestras por actualización (8 GPUs con batch size 56 por GPU). La evaluación se realiza con la configuración `configs/eval/libero.yaml` y el comando `concertina-eval-libero`, ejecutando 2.000 episodios (4 suites × 10 tareas × 50 episodios, semilla 1000). No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de un modelo de acción, esas etapas no se documentan.

## Capacidades

- Control robótico de manipulación en entornos LIBERO: políticas de acción para tareas espaciales, de objeto, de meta y de horizonte largo (suite 10).
- Percepción visión-lenguaje: el backbone Bard-VL procesa observaciones visuales e instrucciones en lenguaje natural para condicionar la generación de acciones.
- Generación de acciones por difusión: el modelo produce trayectorias de acción mediante un proceso de difusión condicionado por la observación y la instrucción.
- Integración con LeRobot: se carga como política `concertina` con pre/post-procesadores guardados, lo que permite usarla directamente en el ecosistema LeRobot.
- Evaluación reproducible: incluye configuraciones de entrenamiento y evaluación y un comando de evaluación dedicado (`concertina-eval-libero`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el paper menciona cognición integrada, pero no se detallan mecanismos de agente.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión sí (backbone Bard-VL); audio y modo thinking no disponibles.

## Casos de uso

- Evaluación de referencia en LIBERO: usar el checkpoint como línea base reproducible para comparar nuevas políticas VLA con el 98,15 % reportado, ejecutando `concertina-eval-libero` con la configuración incluida.
- Investigación en VLA de difusión: estudiar cómo un único modelo de difusión cubre las cuatro suites de LIBERO sin cambios arquitectónicos, sirviendo de punto de partida para ablaciones sobre el backbone Bard-VL.
- Ajuste fino sobre dominios propios: al liberarse todos los parámetros y con licencia MIT, el checkpoint puede reentrenarse sobre datasets LeRobot propios para tareas de manipulación específicas.
- Prototipado de manipulación en simulación: integrar la política en entornos MuJoCo/LIBERO para validar pipelines de percepción-acción antes de trasladarlos a un robot real.
- Benchmarking de infraestructura: con 4,45 mil millones de parámetros y pesos bf16, sirve para medir throughput y latencia de políticas VLA en distintas GPUs y backends de inferencia.
- Docencia y divulgación: al ser autocontenido y con licencia permisiva, es adecuado para cursos y talleres sobre modelos de difusión aplicados a robótica.
- Comparación de estrategias de preentrenamiento: permite contrastar el efecto del preentrenamiento de 90k pasos frente a entrenamientos desde cero en las mismas suites.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| LIBERO (global) | 98,15 % de éxito | 1.963 / 2.000 episodios; 4 suites × 10 tareas × 50 episodios; semilla 1000 |

No se han publicado en la información disponible resultados desglosados por suite (spatial, object, goal, 10) ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,45 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 8,9 GB, por lo que se necesita al menos esa cantidad más memoria para activaciones y buffers de difusión.
- GPU recomendadas: el entrenamiento reportado usó 8 GPUs con batch size 56 por GPU, lo que sugiere GPUs de centro de datos (A100/H100). Para inferencia no se documentan GPUs concretas.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos podría plantearse en GPUs de 24 GB o más, pero no hay datos oficiales de latencia ni de consumo real.
- Opciones de despliegue: LeRobot con la política `concertina` y el comando `concertina-eval-libero`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos VLA comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint está ajustado específicamente sobre las cuatro suites de LIBERO; su generalización fuera de ese benchmark no está documentada.
- No se dispone de información sobre sesgos del backbone Bard-VL ni sobre el dataset de preentrenamiento de 90k pasos.
- Riesgo de alucinación en la parte visión-lenguaje: no evaluado en la información disponible.
- No se documentan idiomas soportados; el uso con instrucciones en castellano no está validado.
- Aunque la licencia es MIT, conviene revisar las licencias del backbone Bard-VL y del dataset `lerobot/libero` antes de un uso comercial.
- El modelo requiere el stack LeRobot y MuJoCo (con `MUJOCO_GL=egl` en el ejemplo de evaluación); no es un modelo de texto genérico.
- El número de descargas (4) y likes (0) indica adopción muy baja; no hay evidencia de uso en producción.
- El resultado del 98,15 % procede de la model card y del paper; no se ha verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Traly/concertina-libero
- Modelo base: https://huggingface.co/Traly/concertina-pretrain-90k
- Dataset de ajuste: https://huggingface.co/datasets/lerobot/libero
- Paper citado: Wang, He, Li, Li, Han, Guo, Xu, "Concertina: Embodying Manipulation and Cognition in One Diffusion Vision-Language Model", 2026 (no se proporciona URL en la información disponible)
- Repositorio o demo del proyecto: no disponible
