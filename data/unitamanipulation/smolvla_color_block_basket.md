# UNITAmanipulation/smolvla_color_block_basket

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto, `UNITAmanipulation/smolvla_color_block_basket`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario UNITAmanipulation sobre un conjunto de datos propio de 150 episodios y 93.923 fotogramas grabados a 30 FPS.

El modelo resuelve una tarea de clasificación y colocación de bloques de colores en cestas del mismo color, empleando un robot bimanual `bi_so_follower` con tres cámaras (muñeca izquierda, muñeca derecha y vista superior). Con 450 millones de parámetros, se posiciona como una alternativa ligera que puede ejecutarse en hardware de consumo, en línea con el objetivo declarado de SmolVLA de ofrecer un rendimiento competitivo a un coste computacional reducido.

La relevancia de esta ficha radica en que ejemplifica el flujo completo de ajuste fino de políticas robóticas con LeRobot: partiendo de un modelo preentrenado, se especializa en una tarea concreta con datos de teleoperación y se publica en el Hub listo para su despliegue mediante `lerobot-rollout`. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones motoras. La arquitectura concreta (número de capas, mecanismo de atencion, codificador visual) no se detalla en la información disponible; el paper de referencia es arXiv:2506.01844. El modelo consume tres flujos de imagen de 256x256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 12 dimensiones, coherente con un robot bimanual de 6 grados de libertad por brazo.

El ajuste fino se realizó sobre el conjunto de datos `UNITAmanipulation/color_block_basket`, compuesto por 150 episodios y 93.923 fotogramas a 30 FPS, con tres tareas de instrucción: colocar el bloque verde en la cesta verde, el amarillo en la amarilla y el azul en la azul. La configuración de entrenamiento incluye 30.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni el volumen total de tokens de entrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 12 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (muñeca izquierda, muñeca derecha y superior).
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación (clasificación de bloques por color).
- Ejecución de políticas en tiempo real mediante `lerobot-rollout` con el robot `bi_so_follower`.
- Capacidad de ajuste fino adicional sobre el modelo base `lerobot/smolvla_base`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, al tratarse de un modelo de robótica y no de un LLM conversacional.

## Casos de uso

- Clasificación de objetos por color en línea de montaje: el modelo coloca bloques en cestas según su color, adecuado para tareas de pick-and-place repetitivas con robot bimanual.
- Automatización de laboratorios docentes: sirve como ejemplo práctico de ajuste fino de políticas VLA con LeRobot para formación en robótica.
- Prototipado rápido de políticas de manipulación: al partir de `smolvla_base` y requerir solo 30.000 pasos, permite iterar sobre datasets pequeños (150 episodios) en hardware asequible.
- Investigación en imitación visual: permite estudiar el efecto de la configuración de cámaras (tres vistas) en el rendimiento de políticas VLA.
- Despliegue en robots de bajo coste: sus 450 millones de parámetros y su orientación a hardware de consumo lo hacen viable en estaciones con GPU de gama media.
- Base para transferencia a nuevas tareas de clasificación: el flujo de entrenamiento documentado permite sustituir el dataset por uno propio con las mismas claves de observación.
- Evaluación comparativa de políticas VLA: útil como referencia de política especializada frente a modelos generalistas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros, en FP16 ocuparía aproximadamente 0,9 GB de pesos, y en cuantizaciones de 8 bits alrededor de 0,45 GB, si bien no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo base SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: probable por tamaño (menos de 1 GB en FP16), aunque no confirmada oficialmente.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=UNITAmanipulation/smolvla_color_block_basket`; entrenamiento con `lerobot-train`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| UNITAmanipulation/smolvla_color_block_basket | 450 M | no disponible | Apache 2.0 | Ajuste fino especializado en bloques de colores |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Modelo base preentrenado del que deriva |
| Otros modelos VLA (p. ej. OpenVLA, RT-2) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente para tres tareas de colocación de bloques por color; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito verificadas en robot real.
- Dependencia de la configuración de hardware: requiere robot `bi_so_follower` y tres cámaras con nombres y índices concretos; cualquier cambio en la disposición puede degradar el rendimiento.
- Dataset pequeño: 150 episodios y 93.923 fotogramas limitan la robustez frente a variaciones de iluminación, posiciones o distractores.
- Riesgo de sobreajuste al entorno de grabación: no se documentan pruebas con objetos nuevos o condiciones distintas.
- Idiomas: no se especifican; las instrucciones de tarea están en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos, alucinación en el sentido lingüístico ni cuantizaciones validadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UNITAmanipulation/smolvla_color_block_basket
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/UNITAmanipulation/color_block_basket
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=UNITAmanipulation/color_block_basket
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
