# whosricky/smolvla_lw_benchhub_aug

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico con un coste computacional reducido y capacidad de despliegue en hardware de consumo. El modelo combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para transformar observaciones multimodales (imágenes de cámaras e estado del robot) en comandos motores continuos. La variante aquí descrita, `whosricky/smolvla_lw_benchhub_aug`, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos `LightwheelAI/Lightwheel-Tasks-Double-Piper`, orientado a tareas de manipulación doméstica con un robot de doble brazo Piper.

El modelo resuelve el problema de la generalización de políticas visomotoras a tareas concretas de manipulación (abrir cajones, colocar objetos, apilar cuencos, encender la vitrocerámica) a partir de demostraciones teleoperadas. Con 450 millones de parámetros, se posiciona como una alternativa ligera frente a VLA de mayor escala, lo que permite iterar y desplegar en estaciones de trabajo con GPU de gama media. Su relevancia actual radica en la tendencia hacia modelos de robótica abiertos, entrenados con LeRobot y publicados en Hugging Face, que reducen la barrera de entrada para investigación en manipulación.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos del repositorio. No se dispone de resultados de benchmarks publicados ni de detalles adicionales sobre la composición exacta del dataset más allá de los datos declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre LeRobot; codificador visual + modelo de lenguaje + decodificador de acciones (detalle interno no disponible) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa observaciones compuestas por el estado proprioceptivo del robot (`observation.state`, vector de 6 dimensiones) y tres flujos visuales de 256×256 píxeles procedentes de las cámaras `left_hand`, `first_person` y `right_hand`. La salida es un vector de acción de 12 dimensiones, coherente con un robot de doble brazo. La model card referencia el paper arXiv:2506.01844, que describe SmolVLA como un VLA compacto y eficiente con rendimiento competitivo a coste computacional reducido, aunque la información proporcionada no detalla la composición interna de capas, el número de tokens de contexto ni las técnicas de atención empleadas.

El ajuste fino se realizó sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper`, con 6.500 episodios, 6.010.166 fotogramas a 50 FPS y más de 80 instrucciones de tarea en inglés relacionadas con manipulación de objetos domésticos (cajones, microondas, vitrocerámica, cuencos, tazas, sartenes, botellas). No se especifica en la información disponible si hubo RLHF, DPO ni el número exacto de tokens o pasos de entrenamiento. El modelo se entrenó y publicó con la librería LeRobot.

## Capacidades

- Generación de políticas de acción continuas para control robótico de doble brazo (salida de 12 dimensiones).
- Percepción visual multimodal a partir de tres cámaras simultáneas (mano izquierda, primera persona, mano derecha).
- Condicionamiento por instrucciones en lenguaje natural para seleccionar la tarea a ejecutar.
- Ejecución de tareas de manipulación doméstica: abrir y cerrar cajones, colocar objetos en cestas y bandejas, apilar cuencos, encender y apagar la vitrocerámica, abrir y cerrar el microondas, colocar tazas en platos.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto libre, razonamiento matemático ni audio.

## Casos de uso

- Manipulación doméstica en robot de doble brazo Piper: el modelo ejecuta instrucciones como colocar la taza blanca en el plato izquierdo o apilar cuencos, usando las tres cámaras y el estado del robot como entrada.
- Automatización de tareas de cocina simuladas o reales: encender la vitrocerámica y colocar la cafetera Moka encima, o poner la sartén en el fuego, aprovechando las instrucciones específicas del dataset.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar políticas VLA ligeras entrenadas con LeRobot sobre el mismo dataset.
- Prototipado rápido en laboratorio: con 450 M de parámetros y pesos safetensors, permite iterar en estaciones con GPU de gama media sin infraestructura de gran escala.
- Evaluación de generalización visomotora: las más de 80 tareas del dataset permiten medir el rendimiento en variaciones de posición y objeto (por ejemplo, distintos cuencos o tazas).
- Base para ajuste fino adicional: al derivar de `lerobot/smolvla_base` y tener licencia Apache 2.0, puede reentrenarse sobre nuevos datasets de manipulación con otras configuraciones de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16 alrededor de 0,9 GB, a lo que hay que sumar el coste de los tres flujos visuales de 256×256.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: la model card del modelo base indica que SmolVLA puede desplegarse en hardware de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (librería nativa); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whosricky/smolvla_lw_benchhub_aug` | 450 M | no disponible | VLA para doble brazo Piper | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base | no disponible en la información | Hugging Face |
| Otros VLA de mayor escala (p. ej. familias tipo OpenVLA) | no disponible | no disponible | VLA genéricos | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en el robot `double_piper` y en las tareas del dataset Lightwheel; su rendimiento fuera de esa configuración de cámaras y efector no está garantizado.
- Las instrucciones de tarea del dataset están en inglés; no se documenta soporte multilingüe.
- No se han publicado métricas de éxito, tasas de error ni benchmarks, por lo que no es posible evaluar su fiabilidad en producción a partir de la información disponible.
- Riesgo de sobreajuste a las posiciones y objetos vistos en entrenamiento; la generalización a nuevos entornos no está validada.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con demostraciones teleoperadas puede heredar sesgos de las trayectorias humanas.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el despliegue físico en robots recae en el integrador.
- El repositorio tiene muy pocas descargas (24) y ningún like, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whosricky/smolvla_lw_benchhub_aug
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LightwheelAI/Lightwheel-Tasks-Double-Piper
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
