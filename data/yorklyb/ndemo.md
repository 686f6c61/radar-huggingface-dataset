# yorklyb/ndemo

## Resumen

El modelo `yorklyb/ndemo` es una implementación de la política robótica π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot por el autor yorklyb (YIbo Liu). Este modelo está diseñado para abordar el reto de la generalización en robótica: ejecutar tareas de manipulación en entornos y situaciones no vistas durante el entrenamiento, combinando percepción visual, comprensión del lenguaje y generación de acciones motoras.

Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), el modelo se distribuye en formato safetensors y se ha entrenado sobre el dataset `ndemo`, aunque no se especifican detalles sobre su composición ni volumen. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para investigación y desarrollo en robótica. Su relevancia actual radica en que representa una evolución de π₀, con mejoras en la capacidad de operar en escenarios abiertos, un área crítica para la adopción de robots en entornos reales.

La ficha se basa exclusivamente en la información pública disponible en HuggingFace y la model card del autor; muchos parámetros técnicos no han sido publicados y se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅; detalles concretos no disponibles |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura π₀.₅ de Physical Intelligence, un modelo VLA que integra un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores directamente a partir de observaciones visuales y instrucciones en lenguaje natural. A diferencia de modelos puramente de lenguaje, π₀.₅ está entrenado para producir secuencias de acciones (por ejemplo, posiciones de articulaciones o esfuerzos) en lugar de texto, lo que permite su uso directo en control de robots.

No se han publicado detalles sobre el proceso de entrenamiento específico de esta implementación: ni el número de tokens, ni la composición del dataset `ndemo`, ni si se emplearon técnicas como RLHF o DPO. La model card indica que el modelo fue entrenado y subido al Hub mediante LeRobot, la librería de HuggingFace para aprendizaje por imitación en robótica, lo que sugiere un pipeline estándar de clonación de comportamiento. La innovación principal heredada de π₀.₅ es su capacidad de generalización a entornos abiertos, lograda mediante una combinación de datos diversos y una arquitectura que alinea representaciones visuales, lingüísticas y de acción.

## Capacidades

- Control robótico de manipulación: genera comandos de acción (posiciones, velocidades o esfuerzos) a partir de imágenes y texto.
- Generalización a entornos nuevos: diseñado para operar en escenarios no vistos durante el entrenamiento, según la descripción de π₀.₅.
- Comprensión de instrucciones en lenguaje natural: puede interpretar órdenes como "coge la taza roja" y traducirlas a secuencias de movimiento.
- Percepción visual: procesa imágenes de cámaras para localizar objetos y planificar trayectorias.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de HuggingFace para robótica.
- No se confirma soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de visión y lenguaje.

## Casos de uso

- Investigación en robótica: el modelo puede utilizarse como punto de partida para estudiar generalización en manipulación, comparando su comportamiento con otras políticas VLA en entornos simulados o reales.
- Automatización de tareas de pick-and-place: gracias a su capacidad de entender instrucciones y percibir objetos, puede controlar un brazo robótico para recoger y colocar piezas en líneas de montaje.
- Robots domésticos: en entornos domésticos, puede ejecutar tareas como recoger objetos dispersos, abrir cajones o colocar artículos en estantes, siempre que se le proporcione la configuración de cámara y actuadores adecuada.
- Entrenamiento por imitación: los desarrolladores pueden usar el modelo como base para fine-tuning con sus propios datasets, aprovechando la licencia Apache 2.0 y la integración con LeRobot.
- Evaluación de políticas en simulación: se puede desplegar en entornos simulados (por ejemplo, MuJoCo o Isaac Gym) para validar su rendimiento antes de transferirlo a hardware real.
- Educación y prototipado: sirve como ejemplo de implementación de un VLA moderno en un framework accesible, útil para cursos de robótica o desarrollo de prototipos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como éxito en tareas, precisión de manipulación o comparativas con otros modelos. La model card no incluye ninguna tabla de evaluación.

## Requisitos de hardware

- No se dispone de requisitos oficiales publicados por el autor.
- Con 4.143.404.816 parámetros, una estimación razonable para inferencia en FP16 es de aproximadamente 8,3 GB de VRAM solo para los pesos (4,14B × 2 bytes). Añadiendo overhead de activaciones y optimizaciones, se recomienda al menos 16 GB de VRAM.
- En cuantización de 8 bits (si se generara), cabría en GPUs de 12 GB, pero no se ofrecen versiones cuantizadas.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o superiores. En GPUs de 16 GB (como RTX 4080) podría funcionar con técnicas de offloading, pero no está confirmado.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con las herramientas de inferencia de LeRobot (por ejemplo, `lerobot-record`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es una implementación de π₀.₅, por lo que su referencia natural es el π₀ original de Physical Intelligence, pero no se han publicado diferencias cuantitativas. Otros VLA como RT-2 (Google) o OpenVLA podrían ser comparables, pero no hay datos de rendimiento en este repositorio. Se recomienda consultar el blog de Physical Intelligence para conocer las mejoras cualitativas de π₀.₅ sobre π₀.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos del dataset `ndemo` (por ejemplo, preferencias de agarre, objetos representados, entornos).
- Riesgo de alucinación: en el contexto robótico, puede generar acciones incorrectas o inseguras si la entrada visual o lingüística es ambigua. No se han realizado evaluaciones de seguridad.
- Limitaciones de contexto: al ser un modelo de acción, no tiene una ventana de contexto de texto tradicional; su "contexto" es la secuencia de observaciones y la instrucción, cuya longitud máxima no se ha especificado.
- Idiomas: no se confirma qué idiomas soporta; probablemente inglés, pero sin garantía.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías. El autor no ofrece soporte.
- Para producción: es necesario validar el modelo en el hardware y entorno específicos antes de cualquier despliegue real. No hay información sobre robustez ante perturbaciones visuales o cambios de iluminación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yorklyb/ndemo)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Perfil del autor en HuggingFace](https://huggingface.co/yorklyb)
