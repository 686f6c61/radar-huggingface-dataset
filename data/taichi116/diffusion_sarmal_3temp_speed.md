# taichi116/diffusion_sarmal_3temp_speed

## Resumen

`taichi116/diffusion_sarmal_3temp_speed` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y empaquetada en el formato de LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo trata el control del robot como un proceso generativo de difusión: en lugar de predecir una única acción, genera una secuencia completa de acciones futuras de forma iterativa, lo que produce trayectorias suaves y coherentes. Está pensado para tareas de manipulación con contacto físico intenso, donde los enfoques de regresión directa suelen fallar por producir movimientos temblorosos o discontinuos.

El repositorio contiene 266.622.856 parámetros en formato safetensors (unos 1,1 GB de tamaño total), lo que sitúa al modelo en la gama media de políticas robóticas. Se ha entrenado sobre el dataset `taichi116/sarmal_3temp_speed_20261106_102605`, un conjunto de demostraciones propio del autor, cuyo contenido específico no está documentado en la información disponible. La nomenclatura del identificador sugiere variaciones de temperatura y velocidad en la recolección de datos, pero esto no se confirma en la model card.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia Apache 2.0. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un artefacto de política robótica que solo tiene sentido dentro del ecosistema LeRobot y junto al robot y dataset concretos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa basada en difusión, empaquetada con LeRobot) |
| Parametros totales | 266.622.856 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, el método descrito en el paper arXiv:2303.04137. La idea central es modelar la distribución de acciones futuras mediante un proceso de difusión condicionado por observaciones visuales y propioceptivas del robot. En inferencia, el modelo parte de ruido gaussiano y lo va refinando durante un número fijo de pasos hasta obtener una secuencia de acciones coherente, que después se ejecuta de forma recedente (receding horizon). Este esquema mitiga el problema de la multimodalidad en los datos de demostración: cuando un humano puede resolver una tarea de varias formas distintas, la difusión captura todas las modas en lugar de promediarlas y producir un movimiento intermedio incorrecto.

El entrenamiento se ha realizado con LeRobot sobre el dataset `taichi116/sarmal_3temp_speed_20261106_102605`, del que no se especifican número de episodios, número de tokens ni composición. No hay información sobre si se aplicó RLHF, DPO ni ningún otro ajuste posterior; en el contexto de Diffusion Policy esto es esperable, ya que el aprendizaje es puramente por imitación supervisada. La model card no documenta innovaciones adicionales como decodificación especulativa, atención lineal ni variantes híbridas. El identificador del repositorio sugiere que se han variado parámetros de temperatura y velocidad durante la recolección de datos, pero el autor no lo explica.

## Capacidades

- Generación de trayectorias de acción multi-paso para control visuomotor de robots manipuladores.
- Manipulación con contacto físico intenso, el escenario para el que Diffusion Policy está específicamente diseñado.
- Condicionamiento por observaciones visuales (cámaras) y por el estado propioceptivo del robot.
- Producción de movimientos suaves y multimodales, sin colapso hacia la media de las demostraciones.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Ejecución en bucle cerrado mediante receding horizon: se predicen varias acciones y se ejecutan las primeras antes de volver a planificar.
- No soporta tool calling, function calling, agentes basados en lenguaje ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de ensamblaje o inserción donde el contacto entre piezas es inevitable, aprovechando la generación de trayectorias suaves de la difusión para evitar forcejeos y daños en los objetos.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy frente a políticas de regresión como ACT, siempre que se use el mismo dataset y robot.
- Replicación de experimentos de robótica: al estar en formato LeRobot y con licencia Apache 2.0, un grupo puede descargarlo, evaluarlo con `lerobot-record` sobre un robot SO-100 y contrastar resultados con sus propias políticas.
- Automatización de tareas de pick-and-place con contacto: en celdas de trabajo donde las piezas encajan con tolerancia estrecha, la política puede generar las correcciones finas necesarias tras el primer contacto.
- Base para fine-tuning con datos propios: el autor publica los pesos sin restricciones comerciales, de modo que un equipo puede partir de este checkpoint y reentrenar sobre sus propias demostraciones si el dominio es similar.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten montar prácticas donde el alumnado entrena, evalúa y analiza una política de difusión de tamaño medio (266 M de parámetros) sin necesidad de infraestructura masiva.
- Evaluación de robustez ante variaciones de velocidad: dado el nombre del dataset, puede emplearse para estudiar cómo afectan las distintas velocidades de demostración a la calidad de las trayectorias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en tareas, tasas de finalización, errores de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 266,6 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,07 GB; en FP16, unos 533 MB. A esto hay que sumar el coste de los pasos de difusión y de las activaciones, que depende del número de pasos y del tamaño de las observaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer moderna (RTX 3060 12 GB o superior) debería ser suficiente para inferencia; para entrenamiento se recomienda al menos una RTX 4090 o una A100, aunque no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del checkpoint, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), que es el flujo documentado en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del número de pasos de difusión, del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taichi116/diffusion_sarmal_3temp_speed | 266,6 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion Policy (implementación de referencia, arXiv:2303.04137) | no disponible | no aplica | resultados publicados en el paper original | no disponible | paper y código de referencia |
| ACT (Action Chunking Transformer, integrado en LeRobot) | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face / LeRobot |
| Políticas de regresión directa (p. ej. MLP sobre observaciones) | variable | no aplica | no disponible | variable | variable |

La comparación cuantitativa no es posible con la información disponible: el autor no publica métricas y los modelos alternativos citados no tienen cifras comparables en esta ficha. La comparación cualitativa relevante es que Diffusion Policy genera trayectorias multimodales y suaves, mientras que ACT y las políticas de regresión tienden a promediar modos y producir movimientos menos naturales en tareas con múltiples soluciones válidas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. En políticas de imitación, el sesgo principal proviene de la distribución del dataset de demostración, que aquí no se describe.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo de generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, con el consiguiente riesgo físico para el robot y el entorno.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje natural; su "contexto" es la ventana de observaciones visuales y propioceptivas, cuyo tamaño no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad por el comportamiento del modelo en entornos reales.
- Caveats para producción: cero descargas y cero likes indican que el checkpoint no ha sido validado por la comunidad; no hay métricas de éxito, ni documentación del dataset, ni instrucciones específicas de seguridad. No debe desplegarse en un robot real sin una evaluación exhaustiva previa en un entorno controlado.
- El comando de entrenamiento incluido en la model card usa `--policy.type=act`, lo que probablemente es una plantilla genérica de LeRobot y no refleja la configuración real de Diffusion Policy; conviene verificar la configuración antes de reentrenar.
- El identificador del repositorio sugiere condiciones de recolección específicas (temperatura, velocidad) que no están documentadas; usarlo fuera de esas condiciones puede degradar el rendimiento de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taichi116/diffusion_sarmal_3temp_speed
- Dataset asociado: https://huggingface.co/datasets/taichi116/sarmal_3temp_speed_20261106_102605
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
