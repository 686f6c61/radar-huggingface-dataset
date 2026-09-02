# yixiaosz/pi0_button_press

## Resumen

El modelo `yixiaosz/pi0_button_press` es un fine-tuning del modelo base `lerobot/pi0_base`, desarrollado por el usuario yixiaosz, para la tarea específica de controlar un robot simulado (RM65-6F con mano DexHand-021) para pulsar un botón rojo en una caja. Se trata de un modelo Vision-Language-Action (VLA) basado en flujo (flow matching), que combina un backbone de visión-lenguaje (PaliGemma) con un decodificador de acciones, y ha sido entrenado sobre un dataset local de 61 episodios y 30.981 frames capturados con dos cámaras (`side_view` y `wrist_ego`). El modelo tiene 3.501.372.176 parámetros (3,5 mil millones) y se distribuye bajo licencia Apache-2.0.

Este fine-tuning es relevante porque demuestra cómo adaptar un VLA fundacional de código abierto a una tarea de manipulación robótica concreta en simulación, usando un dataset reducido y un entrenamiento eficiente (3.000 pasos, batch 4, bf16). Aunque no es un modelo generalista, sirve como referencia para la comunidad de robótica que busca especializar π₀ en tareas específicas sin partir de cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo (flow matching) sobre backbone PaliGemma |
| Parámetros totales | 3.501.372.176 (3,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en bf16, safetensors) |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀ propuesta por Physical Intelligence, que combina un modelo de lenguaje y visión preentrenado (PaliGemma) con un decodificador de acciones basado en flujo (flow matching). En lugar de predecir tokens discretos de acción, π₀ genera acciones continuas mediante un proceso de denoising iterativo, lo que permite capturar distribuciones multimodales de comportamiento. El `pi0_button_press` se obtiene fine-tuning del checkpoint `lerobot/pi0_base` con la opción `train_expert_only=true`, lo que significa que solo se entrenan las capas del decodificador de acciones y no el backbone de visión-lenguaje, reduciendo así el coste computacional y los requisitos de datos.

El entrenamiento se realizó sobre un dataset local (`local/button_press_0901`) compuesto por 61 episodios y 30.981 frames, con dos cámaras (`side_view` y `wrist_ego`) y una dimensión de estado/acción de 6 (probablemente posición y orientación del efector final). Se emplearon 3.000 pasos de optimización con un batch de 4 y precisión bf16. No se menciona el uso de RLHF o DPO; el proceso es un fine-tuning supervisado estándar sobre demostraciones expertas.

## Capacidades

- Control de robots manipuladores en simulación: el modelo es capaz de generar comandos de acción de 6 grados de libertad para el brazo RM65-6F y la mano DexHand-021, a partir de observaciones visuales de dos cámaras y la instrucción de texto "press the red button on the box".
- Seguimiento de instrucciones visuales: interpreta una orden en lenguaje natural y la asocia con la escena visual para determinar la acción adecuada.
- Generación de acciones continuas: gracias al flujo (flow matching), produce trayectorias suaves y realistas, adecuadas para control de bajo nivel.
- Especialización en una tarea concreta: no es un modelo generalista; su capacidad se limita a la tarea de pulsar el botón rojo en el entorno de simulación específico.
- No se reportan capacidades de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Simulación de manipulación robótica: el modelo puede integrarse en entornos de simulación (por ejemplo, MuJoCo o Isaac Sim) para probar políticas de control antes de transferirlas a robots físicos. Su uso principal es validar la viabilidad de un VLA especializado en una tarea de precisión.
- Aprendizaje por imitación: sirve como baseline para comparar estrategias de fine-tuning de VLA en tareas con pocas demostraciones (61 episodios), evaluando la eficiencia de `train_expert_only`.
- Desarrollo de pipelines de robótica con VLA: los desarrolladores pueden usar este modelo como punto de partida para adaptar π₀ a otras tareas de manipulación, reutilizando el proceso de fine-tuning documentado.
- Investigación en generalización de VLA: al ser un modelo pequeño (3,5B) y de código abierto, permite estudiar los límites de la especialización frente a la generalización en entornos controlados.
- Pruebas de integración con frameworks como LeRobot: el modelo se aloja en HuggingFace con el formato esperado por LeRobot, facilitando su carga y uso en pipelines existentes.
- Evaluación de políticas en entornos con realismo limitado: dado que el dataset proviene de una simulación, el modelo puede utilizarse para depurar el comportamiento de robots antes de enfrentarse a entornos físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de éxito, precisión o comparaciones con otros modelos en la tarea de pulsar botón. Tampoco se indican resultados del modelo base π₀ en este contexto específico.

## Requisitos de hardware

- El modelo tiene 3.501.372.176 parámetros y el repositorio ocupa 7,0 GB, lo que sugiere pesos en bf16 (2 bytes por parámetro, aproximadamente 7 GB).
- Para inferencia en bf16, se estima una VRAM mínima de 8-10 GB (incluyendo activaciones y overhead). Una GPU como la RTX 4060 Ti de 16 GB, RTX 4080 o A100 de 40 GB sería suficiente.
- En cuantización a 8 bits (int8) la VRAM necesaria se reduciría a unos 4-5 GB, permitiendo su uso en GPUs de gama media (RTX 3060, 3070). Sin embargo, no se proporcionan pesos cuantizados en el repositorio.
- Opciones de despliegue: se puede cargar con la biblioteca LeRobot (que es la que se usa para el fine-tuning) o mediante frameworks como vLLM, aunque al ser un modelo de flujo, la compatibilidad con herramientas de inferencia estándar puede ser limitada. Se recomienda usar el código de openpi o LeRobot.
- Latencia y throughput: no hay datos disponibles. Al ser un modelo de 3,5B, la latencia en una GPU A100 sería del orden de decenas de milisegundos por paso de denoising, pero no se ha medido en este contexto.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este modelo específico. Como referencia, otros VLA de código abierto incluyen OpenVLA (7B, basado en Prismatic) y RT-2 (55B, propietario). π₀ se distingue por su enfoque de flujo continuo y su tamaño compacto, pero sin datos de rendimiento de este fine-tuning no es posible hacer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado únicamente para la tarea de pulsar un botón rojo en un entorno de simulación concreto; no generaliza a otras tareas o entornos sin un nuevo fine-tuning.
- Los datos de entrenamiento provienen de una simulación (RM65-6F + DexHand-021), por lo que el comportamiento puede no transferirse directamente a robots físicos sin adaptación adicional.
- No se han evaluado sesgos ni riesgos de alucinación en la generación de acciones; al ser un modelo de control, las alucinaciones podrían manifestarse como acciones incorrectas o inseguras.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base π₀ tiene su propia licencia (Apache-2.0 también, según la información de openpi), por lo que se debe verificar la compatibilidad.
- No se proporcionan detalles sobre la composición del dataset (por ejemplo, si hay variaciones de iluminación, posiciones de cámara o colores), lo que limita la comprensión de su robustez.
- El número de episodios (61) es reducido, lo que puede provocar overfitting a las condiciones específicas de la demostración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yixiaosz/pi0_button_press
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π₀: https://arxiv.org/abs/2410.24164
- Página de Physical Intelligence: https://www.pi.website/
- Implementación alternativa en PyTorch: https://github.com/lucidrains/pi-zero-pytorch
