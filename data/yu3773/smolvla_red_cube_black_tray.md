# Yu3773/smolvla_red_cube_black_tray

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por el equipo de Hugging Face y presentado en el paper arxiv:2506.01844. Este modelo concreto, `Yu3773/smolvla_red_cube_black_tray`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Yu Sakuta (Yu3773) sobre un dataset propio de demostraciones robóticas. El modelo está diseñado para controlar un robot tipo `so_follower` en la tarea específica de recoger un cubo rojo y colocarlo en una bandeja negra, utilizando dos cámaras (muñeca y vista superior) y el estado del robot como entradas.

Con 450 millones de parámetros, SmolVLA destaca por su capacidad de ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto rendimiento. Este fine-tuning concreto se ha entrenado con 30 episodios (13 285 fotogramas) y está pensado para ser utilizado como punto de partida para tareas de manipulación robótica similares o como demostración del flujo de trabajo de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basado en transformer multimodal) |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, se pueden cuantizar con herramientas estándar) |
| Idiomas soportados | No disponible (modelo de control robótico, sin interfaz de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Su diseño compacto reduce el coste computacional en comparación con VLA más grandes como OpenVLA (7B parámetros), manteniendo un rendimiento competitivo en tareas de manipulación. El modelo base `lerobot/smolvla_base` se entrenó con una combinación de datos de imitación y aprendizaje por refuerzo, y este fine-tuning se realizó mediante aprendizaje por imitación (behavior cloning) sobre el dataset `Yu3773/so101_red_cube_black_tray`.

El entrenamiento se llevó a cabo con LeRobot versión 0.6.0, durante 20 000 pasos con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 0.0001. Las entradas del modelo incluyen el estado del robot (6 dimensiones) y tres imágenes de cámaras (256×256) más una imagen adicional de 480×640, mientras que la salida es una acción de 6 dimensiones (posición y orientación del efector). No se han publicado detalles sobre técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de precisión: genera acciones de 6 grados de libertad para tareas de pick and place.
- Percepción multimodal: procesa simultáneamente imágenes de múltiples cámaras (muñeca, vista superior) y el estado propioceptivo del robot.
- Aprendizaje por imitación: el fine-tuning permite adaptar el modelo a tareas específicas con pocas demostraciones (30 episodios).
- Ejecución en tiempo real: gracias a su tamaño compacto, puede ejecutarse en hardware de consumo con latencia adecuada para control robótico.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento y despliegue.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido tradicional de los LLM; su salida es exclusivamente una secuencia de acciones.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones definidas, útil en entornos de investigación y pruebas.
- Prototipado rápido de políticas robóticas: al ser un fine-tuning de un modelo base, sirve como plantilla para entrenar nuevas tareas con datasets pequeños, reduciendo el tiempo de desarrollo.
- Educación en robótica: permite a estudiantes e investigadores experimentar con VLA en hardware asequible, sin necesidad de GPUs de alta gama.
- Benchmarking de algoritmos de imitación: al estar disponible públicamente, puede usarse como referencia para comparar métodos de aprendizaje por refuerzo o imitación.
- Despliegue en robots colaborativos: su tamaño reducido facilita la integración en sistemas embebidos o con recursos limitados.
- Investigación en generalización de VLA: el modelo puede servir como base para estudiar cómo los fine-tunings específicos se comportan en variaciones de la tarea (cambios de iluminación, posiciones de objetos, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica que no hay evaluación reportada para este fine-tuning concreto.

## Requisitos de hardware

- VRAM estimada: con 450 M parámetros, en FP32 requiere aproximadamente 1.8 GB de VRAM solo para los pesos; con cuantización a 8 bits se reduce a ~0.5 GB. En la práctica, LeRobot suele usar FP32 o FP16, por lo que una GPU con al menos 4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA RTX 3060, RTX 4060, GTX 1080 Ti, etc.) puede ejecutar el modelo sin problemas. No se requiere hardware de datacenter.
- Compatibilidad con consumer GPU: sí, es uno de los principales objetivos de SmolVLA.
- Opciones de despliegue: principalmente mediante LeRobot (`lerobot-rollout`), que gestiona la inferencia y la conexión con el robot. También es posible exportar a ONNX o usar librerías de inferencia genéricas, aunque no está documentado.
- Latencia y throughput: no se proporcionan datos específicos, pero por el tamaño del modelo se espera una inferencia en el orden de decenas de milisegundos en GPUs consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Enfoque | Licencia |
|---|---|---|---|---|
| SmolVLA (este) | 450 M | 0.9 GB | VLA compacto para control robótico | Apache-2.0 |
| OpenVLA | 7B | ~14 GB | VLA generalista | MIT (no comercial) |
| RT-2 (Google) | 55B | No disponible | VLA a gran escala | Propietaria |
| Octo | 93 M | ~0.2 GB | Modelo de acción para robótica | MIT |

SmolVLA se posiciona como una alternativa ligera frente a modelos como OpenVLA, que requiere mucha más VRAM y cómputo. No hay comparativas directas de rendimiento publicadas para este fine-tuning, pero el paper original reporta que SmolVLA alcanza resultados competitivos con una fracción del coste computacional.

## Limitaciones y advertencias

- Sobreajuste al dataset: entrenado con solo 30 episodios, el modelo puede no generalizar bien a variaciones significativas de la tarea (cambios de iluminación, posiciones de objetos, robots diferentes).
- Sin evaluación reportada: no hay datos de tasa de éxito en el mundo real, por lo que su rendimiento efectivo es desconocido.
- Tarea específica: el modelo solo realiza la tarea de "recoger cubo rojo y colocarlo en bandeja negra"; no es un agente generalista.
- Dependencia del hardware del robot: requiere un robot `so_follower` con las cámaras y calibración exactas usadas en el entrenamiento.
- Posibles alucinaciones de acciones: como cualquier modelo de aprendizaje por imitación, puede generar acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset tienen sus propias condiciones (el dataset es de Yu3773, aunque no se indica una licencia específica).

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/Yu3773/smolvla_red_cube_black_tray)
- [Paper SmolVLA (arxiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Dataset Yu3773/so101_red_cube_black_tray](https://huggingface.co/datasets/Yu3773/so101_red_cube_black_tray)
- [Documentación de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Perfil del autor en Hugging Face](https://huggingface.co/Yu3773)
