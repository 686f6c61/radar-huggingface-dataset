# yaubee/smolvla_stack_white_blue_right_v3

## Resumen

`yaubee/smolvla_stack_white_blue_right_v3` es una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`. El autor, el usuario de Hugging Face `yaubee`, la entrena para una única tarea de manipulación: apilar un ladrillo blanco sobre uno azul con el brazo derecho de un robot de tipo `quad_so_follower`, usando tres cámaras (`central`, `left`, `right`). Se publica a través de la librería LeRobot y está pensada para ejecutarse con los comandos `lerobot-rollout` y `lerobot-train`.

El interés de esta ficha es doble. Por un lado, muestra el flujo completo de ajuste fino de un VLA compacto sobre un dataset de imitación propio (54 episodios, 46 180 fotogramas a 30 FPS). Por otro, sirve como ejemplo de despliegue de SmolVLA, una familia de modelos de acción de aproximadamente 450 millones de parámetros diseñada explícitamente para ser eficiente y funcionar en hardware de consumo, en contraste con VLA de 3-7 mil millones de parámetros como OpenVLA o π0.

Es importante subrayar que no se trata de un modelo de lenguaje de propósito general, sino de una política de control entrenada para una tarea concreta y un robot concreto. El repositorio no incluye resultados de evaluación en robot real ni métricas de éxito, y sus descargas e interacciones en el Hub son cero en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); columna vertebral visión-lenguaje con experto de acción (SmolVLA) |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es una ventana de tokens al uso: consume observaciones por paso de control) |
| Tipo de entrada | `observation.state` (6,); 3 imágenes RGB `(3, 256, 256)` |
| Tipo de salida | `action` (12,) |
| Tipos de cuantización | No disponible. El repositorio publica pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ documentadas por el autor |
| Idiomas soportados | No disponible. La instrucción de tarea del dataset está en inglés ("Stack a white brick on top of a blue brick using the right arm") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | `lerobot` (versión de entrenamiento: 0.6.2) |
| Tamaño del repositorio | 0,9 GB |
| Tipo de robot | `quad_so_follower` |
| Cámaras | `central`, `left`, `right` |
| Modelo base | `lerobot/smolvla_base` |
| Paper de referencia | arXiv 2506.01844 (SmolVLA) |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-language-action: un codificador visual y un modelo de lenguaje que procesan observaciones e instrucciones de tarea, y un módulo de generación de acciones que produce comandos motores continuos. La ficha del modelo base describe SmolVLA como un VLA "compacto y eficiente" que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. En este repositorio concreto, la política consume un vector de estado de 6 dimensiones y tres imágenes RGB de 256×256 píxeles, y emite un vector de acción de 12 dimensiones, coherente con un brazo seguidor de tipo `quad_so_follower`.

El ajuste fino se realizó sobre el dataset `yaubee/stack-white-on-blue`, compuesto por 54 episodios y 46 180 fotogramas grabados a 30 FPS, con una única instrucción de tarea en inglés. La configuración de entrenamiento declarada es de 3000 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, ejecutada con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni ninguna etapa de refinamiento por preferencias: se trata de aprendizaje por imitación supervisado a partir de demostraciones de teleoperación, el procedimiento estándar en LeRobot.

No se especifican en la información disponible detalles sobre la composición exacta del dataset (variabilidad de posiciones, condiciones de iluminación, distractores, número de operadores o de sesiones de recogida), ni sobre técnicas de aumento de datos o de decodificación especulativa aplicadas en la inferencia. Tampoco se documenta la ventana temporal de acciones (*action chunking*) ni el modo de inferencia asíncrona que LeRobot ofrece para este tipo de políticas.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción de 12 dimensiones a partir de estado propioceptivo e imágenes, para ejecutar la tarea de apilado aprendida.
- Percepción visual multi-cámara: integra tres vistas simultáneas (`central`, `left`, `right`) a 256×256 píxeles para estimar la posición de los objetos.
- Condicionamiento por instrucción de tarea: acepta una cadena de texto con la descripción de la tarea en el momento de la inferencia (`--task`).
- Aprendizaje por imitación: reproducible y ampliable mediante `lerobot-train` partiendo de `lerobot/smolvla_base`.
- Ejecución en bucle cerrado: la política se ejecuta paso a paso contra el robot real mediante `lerobot-rollout`, con control a la frecuencia del sistema de captura (30 FPS en el dataset de entrenamiento).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general de propósito abierto, audio ni modo de "pensamiento". Estas capacidades no aplican a una política de control de este tipo.

## Casos de uso

- Apilado automatizado de piezas en laboratorio o línea de montaje: la política ejecuta directamente la tarea "apilar un ladrillo blanco sobre uno azul con el brazo derecho"; es adecuada cuando la geometría de las piezas y la posición de partida son similares a las del dataset de entrenamiento.
- Banco de pruebas para ajuste fino de VLA compactos: sirve como referencia reproducible de un *pipeline* LeRobot completo (grabación con `quad_so_follower`, tres cámaras, 54 episodios, 3000 pasos de entrenamiento) para comparar hiperparámetros o tamaños de dataset.
- Prototipado en robótica educativa: al tener 450 M de parámetros y un repositorio de 0,9 GB, puede entrenarse y ejecutarse en estaciones con una sola GPU de gama media, lo que lo hace viable en cursos y talleres de imitación robótica.
- Evaluación de robustez ante cambios de dominio: permite medir experimentalmente la degradación de la política al variar iluminación, posición inicial de las piezas o añadir distractores, ya que el autor no ha publicado esas evaluaciones.
- Base para *transfer learning* a tareas relacionadas: partiendo del modelo base `lerobot/smolvla_base` o de este ajuste, se puede reentrenar con un dataset propio de picking and placing manteniendo la misma configuración de cámaras y robot.
- Inferencia en el borde (*edge*): con un peso en safetensors de en torno a 0,9 GB, es candidato para controladores con GPU integrada (por ejemplo, plataformas tipo Jetson) donde un VLA de 7 000 millones de parámetros no cabría con latencias de control aceptables.
- Reproducción de experimentos de imitación: el dataset asociado incluye 46 180 fotogramas a 30 FPS y un visor público, lo que facilita auditar la calidad de las demostraciones antes de reutilizarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet_", es decir, no hay tabla de ensayos en robot real, tasa de éxito, ni métricas de simulación (por ejemplo, LIBERO) para este ajuste concreto. Tampoco se han proporcionado cifras de latencia o de frecuencia de control efectiva alcanzada en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los 450 millones de parámetros; estimación aritmética, no dato publicado por el autor): en bf16/fp16, aproximadamente 0,9-1 GB solo de pesos y en torno a 2-3 GB contando activaciones con tres imágenes de 256×256 y batch 1; en fp32, aproximadamente 1,8 GB de pesos y 3-4 GB en total; en int8, en torno a 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM utilizable. Se espera funcionamiento correcto en RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, A10, A100 y H100; en el extremo profesional estas últimas están sobredimensionadas para un modelo de 450 M.
- Cabe en GPU de consumo: sí, con holgura, siempre que el resto del *pipeline* de percepción y control no compita por memoria. No se han publicado requisitos oficiales.
- Opciones de despliegue: el flujo documentado es `lerobot-rollout` con `--strategy.type=base` y `--policy.path=yaubee/smolvla_stack_white_blue_right_v3`; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no son aplicables a una política de acción de este tipo.
- Latencia y throughput: no disponibles. La política debe ejecutarse en bucle cerrado contra el robot, y el dataset se grabó a 30 FPS, pero no se publica ninguna medición de frecuencia de control efectiva ni de tiempo por paso de inferencia.

## Comparativa con modelos similares

La comparación se establece con otras familias VLA de referencia; los recuentos de parámetros de los modelos alternativos provienen de sus respectivas publicaciones y no de la documentación de este repositorio.

| Modelo | Parámetros | Tarea y condicionamiento | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| `yaubee/smolvla_stack_white_blue_right_v3` | 450 M | Apilado de una pieza concreta con `quad_so_follower` y 3 cámaras | Apache 2.0 | Publicado en el Hub; 0 descargas y 0 likes; sin evaluación publicada |
| `lerobot/smolvla_base` | Del orden de 450 M | Modelo base VLA generalista del que deriva este ajuste | Apache 2.0 (según repositorio base) | Punto de partida para entrenamiento; ampliamente utilizado en LeRobot |
| OpenVLA | Aproximadamente 7 000 M | Manipulación generalista de propósito abierto | Licencia abierta, sujeta a los términos del modelo base | Requiere hardware sensiblemente superior; no cabe en GPU de consumo con latencias de control cómodas |
| π0 (Physical Intelligence) | Del orden de 3 000 M | Manipulación generalista con *flow matching* | No disponible en la información consultada | Referencia de mayor escala; no comparable en requisitos de hardware |

En cuanto a rendimiento medido, contexto y latencia, no hay datos públicos de este ajuste que permitan una comparación cuantitativa fiable con las alternativas, por lo que esas celdas se dejan fuera o se marcan como no disponibles.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("apilar un ladrillo blanco sobre uno azul con el brazo derecho") y no debe esperarse generalización a otras tareas, objetos o instrucciones.
- Dataset muy reducido: 54 episodios y 46 180 fotogramas, procedentes presumiblemente de pocas sesiones. La variabilidad de posiciones, iluminación y configuraciones es limitada, lo que favorece el sobreajuste al entorno de grabación.
- Dependencia dura del hardware: la acción de salida tiene 12 dimensiones y las entradas están atadas a un `quad_so_follower` con tres cámaras concretas. Usar otros nombres de cámara o claves de observación distintas romperá la inferencia.
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba. No se puede afirmar ningún nivel de fiabilidad en producción.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas cuando la escena difiere de la distribución de entrenamiento, sin ninguna señal de incertidumbre asociada.
- Riesgo físico: cualquier despliegue sobre hardware real debe hacerse con límites de par, paradas de emergencia y espacio de trabajo despejado. El modelo no incorpora mecanismos de seguridad.
- Idiomas: no se documenta ningún idioma soportado más allá de la instrucción de tarea en inglés; no hay indicios de capacidades multilingües útiles en la práctica.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, pero conviene verificar la licencia y los términos del modelo base `lerobot/smolvla_base` y del dataset asociado antes de un uso comercial.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes y una única versión publicada, por lo que no existe validación por parte de la comunidad.
- Fechas del repositorio: la fecha de creación registrada (2026-09-17) debe tratarse con cautela a efectos de citación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaubee/smolvla_stack_white_blue_right_v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yaubee/stack-white-on-blue
- Visor del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yaubee/stack-white-on-blue
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
