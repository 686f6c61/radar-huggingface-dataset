# zijian2022/smolvla_d4

## Resumen

zijian2022/smolvla_d4 es un ajuste fino de SmolVLA, un modelo vision-lenguaje-acción (VLA) compacto desarrollado originalmente por Hugging Face y distribuido mediante la librería LeRobot. Con 450.046.176 parámetros, está pensado para ejecutar políticas robóticas de manipulación en hardware de consumo, reduciendo el coste computacional frente a otros VLA de mayor tamaño.

Este checkpoint concreto ha sido entrenado por el usuario zijian2022 sobre el conjunto de datos `fanuc_er4ia_stack_two_task_d4_fixed4_dr`, cuyo nombre sugiere una tarea de apilamiento con un brazo robótico FANUC ER-4iA. El modelo recibe observaciones visuales e instrucciones en lenguaje natural y genera acciones motrices para el robot, siguiendo el paradigma VLA.

Su relevancia radica en que ejemplifica el flujo de ajuste fino de SmolVLA con LeRobot para una tarea específica y en que puede desplegarse en una única GPU de consumo. Sin embargo, la información pública disponible es muy limitada: no se detallan la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta; arquitectura interna no detallada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica; no se describe como modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | zijian2022/fanuc_er4ia_stack_two_task_d4_fixed4_dr |
| Librería | LeRobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA se presenta como un modelo VLA compacto y eficiente, capaz de obtener un rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. La información disponible no especifica el backbone visual, el encoder de lenguaje ni el mecanismo de generación de acciones; tampoco se indica el número de tokens de entrenamiento ni la composición exacta del dataset.

El checkpoint `smolvla_d4` se ha obtenido por ajuste fino del modelo base `lerobot/smolvla_base` mediante LeRobot. El nombre del dataset sugiere demostraciones de una tarea de apilamiento con un FANUC ER-4iA, con variantes como `two_task`, `d4`, `fixed4` y `dr` que podrían corresponder a configuraciones de tarea y domain randomization, aunque la model card no lo confirma. No consta si se aplicaron RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Control robótico guiado por lenguaje: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Manipulación visual para tareas de apilamiento y pick-and-place en el robot FANUC ER-4iA.
- Ajuste fino y evaluación mediante LeRobot, incluyendo `lerobot-train` y `lerobot-record`.
- Despliegue en hardware de consumo gracias a su tamaño de 450 millones de parámetros.
- Integración con el ecosistema LeRobot para captura de datos, entrenamiento y ejecución de políticas.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado un modo de razonamiento explícito ni capacidades de visión más allá de la percepción necesaria para la política.
- El soporte multilingüe no está confirmado; no se especifican idiomas.

## Casos de uso

- Apilamiento de piezas con un FANUC ER-4iA: el checkpoint está ajustado para la tarea descrita en el nombre del dataset; se ejecutaría con `lerobot-record` sobre el robot para evaluar la tasa de éxito.
- Reproducción del pipeline de ajuste fino: sirve como referencia para entrenar SmolVLA con LeRobot sobre nuevos datasets de demostraciones teleoperadas.
- Punto de partida para transferencia a tareas similares: al compartir arquitectura con el modelo base, puede continuarse el ajuste con datos propios de pick-and-place.
- Evaluación de VLA compactos en laboratorio: permite medir latencia, consumo de VRAM y robustez en una GPU de consumo.
- Despliegue en estaciones de trabajo con GPU única: al ocupar menos de 1 GB en FP16, puede caber en tarjetas de 6-8 GB para inferencia con una sola cámara.
- Docencia y formación en robótica: ilustra el ciclo completo de captura de datos, entrenamiento y evaluación de una política robótica.
- Pruebas de robustez con domain randomization: la etiqueta `dr` del dataset sugiere variaciones de dominio que permiten evaluar la generalización ante cambios de iluminación, posición u objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de éxito, latencia ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 1,8 GB en FP32, 0,9 GB en FP16/BF16 y 0,45 GB en INT8. Hay que sumar activaciones, buffers y el codificador visual.
- GPU de consumo: previsiblemente sí. Tarjetas como RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 2060 de 6 GB o GTX 1660 de 6 GB deberían poder ejecutar la política, siempre que el resto del pipeline de LeRobot quepa en memoria.
- GPU de centro de datos: A100 o H100 para ejecutar múltiples entornos en paralelo, entrenamiento o barridos de evaluación.
- Opciones de despliegue: LeRobot con PyTorch, mediante `lerobot-record` para inferencia y `lerobot-train` para entrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, motores orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zijian2022/smolvla_d4 | 450.046.176 | no disponible | Apache 2.0 | Hugging Face | Ajuste fino para FANUC ER-4iA |
| lerobot/smolvla_base | 450M, por correspondencia con el ajuste; no confirmado | no disponible | no disponible | Hugging Face | Modelo base de SmolVLA |
| SmolVLA (paper) | 450M | no disponible | no disponible | paper y LeRobot | Modelo original de Hugging Face |
| OpenVLA | no disponible | no disponible | no disponible | no disponible | Alternativa VLA de mayor tamaño; sin datos en la información disponible |
| π0 | no disponible | no disponible | no disponible | no disponible | Alternativa VLA; sin datos en la información disponible |

No se dispone de datos suficientes para establecer una comparación cuantitativa con OpenVLA o π0. La comparación más directa es con `lerobot/smolvla_base`, del que este checkpoint es un ajuste fino.

## Limitaciones y advertencias

- El ajuste está ligado a un robot y una tarea concretos, el FANUC ER-4iA y el apilamiento. No hay evidencia de generalización a otros brazos, objetos o instrucciones.
- El dataset de entrenamiento no está descrito en detalle; se desconoce el número de episodios, la variabilidad y la calidad de las demostraciones.
- No se han publicado métricas de éxito ni benchmarks, por lo que el rendimiento real en producción es incierto.
- El repositorio tiene 12 descargas y 0 likes, por lo que no cuenta con validación comunitaria significativa.
- No se especifican los idiomas soportados. Aunque el modelo base probablemente acepta instrucciones en inglés, no está confirmado.
- Riesgo de errores de percepción o de ejecución de acciones inseguras; requiere supervisión humana, límites de seguridad y paradas de emergencia.
- La licencia Apache 2.0 permite uso comercial y modificación, pero deben verificarse las licencias del modelo base, del dataset y de las dependencias de LeRobot.
- Las fechas de creación y actualización del repositorio, 2026-10-18, son anómalas; conviene verificar la integridad y procedencia del checkpoint.
- No se dispone de información sobre cuantizaciones, longitud de contexto ni requisitos exactos de memoria para el pipeline completo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zijian2022/smolvla_d4)
- [Paper de SmolVLA](https://arxiv.org/abs/2506.01844)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Dataset de ajuste](https://huggingface.co/datasets/zijian2022/fanuc_er4ia_stack_two_task_d4_fixed4_dr)
- [Artículo sobre SmolVLA en aegean.ai](https://aegean.ai/book/vla-agents/smolvla)
- [Sitio web de SmolVLA](https://smolvla.net/index_en)
