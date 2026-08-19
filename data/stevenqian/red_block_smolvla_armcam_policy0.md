# stevenqian/red_block_smolvla_armcam_policy0

## Resumen

`red_block_smolvla_armcam_policy0` es un modelo de robótica de tipo vision-language-action (VLA) basado en SmolVLA, desarrollado por stevenqian mediante el framework LeRobot. Se trata de un fine-tuning del modelo base `lerobot/smolvla_base` (450 millones de parámetros) para ejecutar una tarea concreta de manipulación: coger un bloque rojo y depositarlo en una papelera, utilizando un robot tipo `so_follower` con dos cámaras (superior y brazo). El modelo consume observaciones multimodales (estado del robot y dos imágenes) y produce acciones de control de 6 dimensiones.

Su relevancia radica en que SmolVLA es una arquitectura compacta y eficiente, diseñada para ejecutarse en hardware de consumo, lo que democratiza el aprendizaje por imitación en robótica. Este repositorio concreto sirve como ejemplo de fine-tuning rápido (1000 pasos, 62 episodios) para una tarea de pick-and-place, y puede utilizarse como punto de partida para tareas similares o como referencia didáctica en laboratorios de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de control robótico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual (para procesar imágenes de las cámaras) con un modelo de lenguaje ligero y un cabezal de acción. La arquitectura está optimizada para reducir coste computacional y latencia, manteniendo un rendimiento competitivo en tareas de manipulación. El modelo base `lerobot/smolvla_base` fue preentrenado en un amplio corpus de datos robóticos y luego fine-tuneado aquí con el dataset `stevenqian/armcam_redblock`, que contiene 62 episodios y 25.519 frames a 30 FPS, grabados con cámaras superior y de brazo.

El entrenamiento se realizó con 1000 pasos, batch size de 32, optimizador AdamW, learning rate de 0.0001 y semilla 1000, usando LeRobot 0.6.2. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tuning supervisado estándar de aprendizaje por imitación. La innovación principal proviene de la arquitectura SmolVLA en sí, que permite desplegar políticas de control en GPUs de consumo sin sacrificar demasiado rendimiento.

## Capacidades

- Control robótico de 6 grados de libertad (acciones de posición/velocidad) a partir de observaciones multimodales.
- Procesamiento de dos flujos de imagen simultáneos (cámara superior y cámara de brazo) a resolución 480x640.
- Integración del estado del robot (6 valores) como entrada adicional para el control.
- Ejecución de tareas de pick-and-place específicas, entrenadas por imitación.
- No soporta generación de lenguaje natural, tool calling, agentes ni razonamiento multi-step fuera del contexto robótico.
- Capacidades multilingües: no aplicable, ya que no procesa texto.
- No incluye modo de pensamiento (thinking mode) ni capacidades de visión generales más allá de la tarea entrenada.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo puede integrarse en un robot `so_follower` para mover bloques o piezas de una posición a otra, gracias a su salida de acciones de 6 dimensiones y su entrada visual dual.
- Prototipado rápido de políticas de control: investigadores pueden usar este modelo como base para fine-tuning en tareas similares (por ejemplo, coger objetos de otros colores o formas) con pocos datos, dado que ya ha aprendido representaciones visuales y de control.
- Educación en robótica y aprendizaje por imitación: sirve como ejemplo práctico de entrenamiento de un VLA con LeRobot, permitiendo a estudiantes reproducir el flujo completo de recolección de datos, entrenamiento y despliegue.
- Investigación en generalización de tareas: al ser un modelo pequeño y rápido, es adecuado para experimentos que requieren múltiples iteraciones de entrenamiento en hardware limitado.
- Demostraciones en ferias y exhibiciones: el modelo puede ejecutar la tarea de forma autónoma en tiempo real, mostrando capacidades de manipulación en entornos controlados.
- Base para sistemas de control híbridos: combinado con un planificador de alto nivel, puede actuar como política de bajo nivel para ejecutar subtareas de manipulación dentro de un sistema más complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parámetros, en fp32 el modelo ocupa aproximadamente 1,8 GB; en fp16 ~0,9 GB. Considerando las dos imágenes de entrada (480x640) y el overhead de la arquitectura, se estima que la inferencia requiere entre 2 y 4 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM (p. ej., NVIDIA RTX 3050, RTX 3060, GTX 1660 Super) debería ser suficiente. Para entrenamiento, se recomienda al menos 8 GB.
- Sí cabe en GPUs de consumo: es uno de los objetivos de SmolVLA.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, usando comandos como `lerobot-rollout`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de control robótico, no de lenguaje.
- Latencia y throughput: no disponibles; dependerá del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. Sin embargo, se puede contextualizar: SmolVLA (450M) es significativamente más compacto que OpenVLA (7B) o RT-2 (55B), lo que permite ejecución en hardware de consumo. No se conocen benchmarks comparativos para este fine-tuning concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| red_block_smolvla_armcam_policy0 | 450M | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA (referencia) | 7B | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab red block and put in bin"; no generaliza a otras tareas u objetos sin fine-tuning adicional.
- No se han publicado resultados de evaluación en robot real; el rendimiento real es desconocido.
- El dataset de entrenamiento es pequeño (62 episodios), lo que aumenta el riesgo de sobreajuste a las condiciones específicas de captura (iluminación, posición de cámara, etc.).
- Depende del hardware concreto `so_follower` y de las cámaras con las que se entrenó; cambios en la configuración pueden degradar el rendimiento.
- No procesa lenguaje natural ni instrucciones textuales; es una política de control puro.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantías de seguridad para entornos de producción sin validación exhaustiva.
- No se especifican sesgos conocidos, pero al ser un modelo de robótica, los sesgos pueden manifestarse como fallos en la detección de objetos bajo condiciones no vistas.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/stevenqian/red_block_smolvla_armcam_policy0)
- [Paper SmolVLA (arxiv 2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/stevenqian/armcam_redblock)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Guía LeRobot SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación LeRobot](https://huggingface.co/docs/lerobot/index)
