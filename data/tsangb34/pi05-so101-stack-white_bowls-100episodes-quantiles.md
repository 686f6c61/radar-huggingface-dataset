# tsangb34/pi05-so101-stack-white_bowls-100episodes-quantiles

## Resumen

El modelo `tsangb34/pi05-so101-stack-white_bowls-100episodes-quantiles` es un ajuste fino de una política robótica de tipo Vision-Language-Action (VLA) basada en π₀.₅ (pi05) de Physical Intelligence, adaptada a la librería LeRobot de Hugging Face. Concretamente, es una especialización de `lerobot/pi05_base` entrenada sobre 100 episodios de demostraciones reales para una única tarea de manipulación: coger el cuenco de plástico blanco de la derecha y apilarlo sobre el de la izquierda. El modelo consume el estado articular del robot (vector de 6 dimensiones) y tres flujos de imagen y produce un vector de acción de 6 dimensiones.

El interés de la ficha es doble. Por un lado, documenta un caso real y acotado de fine-tuning de un VLA de 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) sobre un brazo de bajo coste SO-101, lo que sirve como plantilla reproducible para quien quiera adaptar pi05 a su propio robot y tarea. Por otro lado, ilustra el flujo completo de LeRobot: registro de datos con cámaras, entrenamiento supervisado por imitación con AdamW y despliegue mediante `lerobot-rollout`.

Se trata de un modelo con 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin resultados de evaluación publicados y con un alcance funcional muy estrecho (una sola tarea, un solo tipo de robot). Su licencia Apache 2.0 y el formato safetensors facilitan su reutilización, pero conviene tratarlo como una política especializada y no como un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) pi05 (π₀.₅); implementación de LeRobot adaptada del repositorio OpenPI de Physical Intelligence. No se detalla la topología interna en la model card |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones), según el recuento de safetensors |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible. La política consume observaciones por paso (estado + 3 imágenes) y emite acciones; no se documenta horizonte de contexto ni longitud de chunking |
| Tipos de cuantizacion | No disponible. No se documentan variantes GGUF, AWQ, GPTQ ni int8. Los pesos se publican en la precisión original del entrenamiento |
| Idiomas soportados | No disponible como lista de idiomas. La política se condiciona con una instrucción de tarea en lenguaje natural (por ejemplo, la cadena de la tarea de apilado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tag `safetensors`); tamaño del repositorio 9,4 GB |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.front` | VISUAL | (3, 480, 640) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `observation.images.empty_camera_0` | VISUAL | (3, 224, 224) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅ (pi05) de Physical Intelligence, un modelo Vision-Language-Action orientado a la generalización en entornos abiertos. Según la model card, π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementación utilizada aquí es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La model card no especifica el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo etapas de RLHF o DPO.

El ajuste fino se realizó por imitación sobre el dataset `Jiamo0912/robocolosseum-so101-stack-white_bowls-100episodes`, compuesto por 100 episodios y 25.012 fotogramas capturados a 30 FPS, con una única instrucción de tarea repetida: coger el cuenco blanco de la derecha y apilarlo sobre el de la izquierda. La configuración de entrenamiento documentada es: 4.690 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.1. El sufijo `quantiles` del nombre del repositorio sugiere el uso de una variante de representación por cuantiles en el cabezal de acciones de pi05, aunque la model card no desarrolla este punto ni lo confirma explícitamente.

## Capacidades

- Generación de acciones de manipulación: produce un vector de acción de 6 grados de libertad a partir del estado articular y de las imágenes de las cámaras frontal y de muñeca.
- Ejecución de una tarea concreta de apilado: "Pick up the white plastic bowl on the right and stack it on top of the white plastic bowl on the left".
- Condicionamiento por instrucción de tarea en lenguaje natural, suministrada al desplegar la política con `lerobot-rollout`.
- Percepción visual multimodal: procesa simultáneamente dos cámaras de 480x640 (frontal y muñeca) y una tercera entrada visual de 224x224 (`empty_camera_0`, previsiblemente sin uso efectivo en esta tarea).
- Control de un brazo SO-101 (tipo de robot `so_follower`).
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, razonamiento textual ni modos de "thinking".
- Capacidades multilingües: no documentadas; la instrucción de tarea se proporciona en inglés en los ejemplos de la model card.
- No se documentan capacidades de audio ni de visión más allá de los tres flujos de imagen de entrada.

## Casos de uso

- Automatización de apilado en línea de manipulación: la política ejecuta directamente la tarea de coger un cuenco blanco y apilarlo sobre otro, con dos cámaras a 30 FPS, sobre un brazo SO-101. Es el uso para el que fue entrenada y el único validado por el dataset.
- Plantilla de fine-tuning para tareas propias: partiendo de `lerobot/pi05_base` y siguiendo el comando `lerobot-train` de la model card, un equipo puede reproducir el flujo completo (registro de datos con LeRobot, entrenamiento con AdamW a 2,5e-05, despliegue) y sustituir el dataset por el de su propia celda de trabajo.
- Banco de pruebas de generalización en VLA: al estar entrenada sobre 100 episodios de una única tarea, sirve como punto de partida para medir la degradación ante cambios de iluminación, posición de los objetos o distractores, tal y como sugiere la propia plantilla de evaluación de la model card.
- Investigación en aprendizaje por imitación: caso reproducible con hiperparámetros públicos (4.690 pasos, lote 32, semilla 1000, LeRobot 0.6.1) para comparar variantes de pi05 o de representación de acciones dentro del ecosistema LeRobot.
- Demostración educativa de robótica de bajo coste: un SO-101 es un brazo de coste contenido, por lo que este modelo encaja en laboratorios docentes donde se quiera mostrar un pipeline completo de VLA sin hardware industrial.
- Prueba de integración de políticas en pipelines robóticos: mediante `--strategy.type=base` y `--duration`, la política puede lanzarse durante un tiempo acotado para verificar cableado, calibración de cámaras y puertos antes de desplegar variantes más complejas.
- Generación de datos de evaluación comparativa: al no existir resultados de éxito publicados, este modelo es un candidato útil para construir una tabla de referencia propia (número de ensayos, éxitos y tasa de éxito) sobre la tarea de apilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet", incluyendo la plantilla vacía de "Task / Trials / Successes / Success rate". No se dispone por tanto de tasas de éxito en robot real, ni de métricas de tipo MMLU, HumanEval o GSM8K, que además no son aplicables a una política de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de 4.143.404.816 parámetros, no publicado por el autor):
  - Precisión de entrenamiento original (bf16/fp16): en torno a 8,3 GB solo de pesos, más activaciones de dos cámaras a 480x640 y del codificador visual; estimación práctica de 12 a 16 GB.
  - fp32: aproximadamente 16,6 GB de pesos, más activaciones; estimación práctica por encima de 20 GB.
  - int8: en torno a 4,1 GB de pesos; no se documenta una variante cuantizada oficial.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajan GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100) en bf16. En GPU de consumo de 16 GB el margen es ajustado y depende del backend y del tamaño de lote.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas de 24 GB en bf16 y en tarjetas de 16 GB con margen reducido o con cuantización; no hay confirmación oficial.
- Opciones de despliegue: LeRobot es la vía documentada, con `lerobot-rollout` para ejecutar la política en el robot y `lerobot-train` para entrenar. La implementación procede de OpenPI. Los servidores de inferencia para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no soportan este formato de política robótica, por lo que no se listan como opciones válidas.
- Latencia y throughput: no disponibles. El dataset se capturó a 30 FPS y el ejemplo de despliegue usa 30 FPS por cámara y una duración de 60 segundos, pero no se publican cifras de latencia de inferencia ni de frecuencia de control alcanzable.
- Entrenamiento: el autor no documenta el hardware utilizado para los 4.690 pasos con lote 32; `lerobot-train` acepta `--policy.device=cuda`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsangb34/pi05-so101-stack-white_bowls-100episodes-quantiles` | 4.143.404.816 | No disponible | Sin resultados de evaluación publicados | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face (modelo base del ajuste) |
| π₀ (predecesor directo de π₀.₅) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Repositorio OpenPI citado por la model card |
| Otros VLA de robotica de proposito general (por ejemplo, OpenVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa no es posible con la información proporcionada: la model card solo identifica el modelo base (`lerobot/pi05_base`) y describe π₀.₅ como evolución de π₀ hacia la generalización en entornos nuevos, sin cifras de parámetros, contexto ni resultados para las alternativas.

## Limitaciones y advertencias

- Alcance funcional muy estrecho: la política está entrenada para una única tarea y una única familia de objetos (cuenco de plástico blanco). Se espera un rendimiento pobre fuera de esa instrucción.
- Especialización de hardware: solo se ha entrenado para el robot `so_follower` (SO-101) con las cámaras `front` y `wrist`. Cambiar de brazo, de cinemática o de disposición de cámaras invalida las entradas esperadas.
- Dependencia de los nombres de las cámaras: el ejemplo de despliegue exige que los nombres de cámara coincidan exactamente con las claves de observación del entrenamiento (`observation.images.front`, `observation.images.wrist`).
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni análisis de robustez ante cambios de iluminación, posición o distractores. No debe asumirse un rendimiento fiable en producción sin una validación propia.
- Riesgo de alucinación en el sentido de acciones no válidas: como toda política de imitación, puede generar secuencias de acción plausibles pero incorrectas cuando la escena se aleja de la distribución del dataset, sin ninguna señal de confianza asociada.
- Sesgos de datos: el dataset contiene 100 episodios y 25.012 fotogramas de una tarea concreta grabada en un entorno concreto; hereda cualquier sesgo de posición, iluminación, color de objeto o estilo de teleoperación presente en esas demostraciones.
- Limitaciones de idioma: no se documenta una lista de idiomas soportados. La instrucción de tarea de los ejemplos está en inglés y no hay evidencia de que se hayan usado instrucciones en otros idiomas durante el entrenamiento.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 "likes", fue creado y actualizado el mismo día (24 de septiembre de 2026) y no se aporta demo, vídeo ni informe de resultados.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución correspondiente, incluyendo la cita de LeRobot indicada en la model card y la del método π₀.₅ enlazado en la descripción.
- Caveat de producción: al no publicarse opciones de cuantización ni cifras de latencia, no se puede dimensionar la frecuencia de control real; conviene medirla en el hardware objetivo antes de integrar la política en una celda automatizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/pi05-so101-stack-white_bowls-100episodes-quantiles
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/robocolosseum-so101-stack-white_bowls-100episodes
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/robocolosseum-so101-stack-white_bowls-100episodes
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: citado en la model card, enlace no disponible en la informacion proporcionada
- Cita de LeRobot: `@misc{cadene2024lerobot, author = {Cadene, Remi and Alibert, Simon and Soare, Alexander and Gallouedec, Quentin and Zouitine, Adil and Palma, Steven and Kooijmans, Pepijn and ...}}`
