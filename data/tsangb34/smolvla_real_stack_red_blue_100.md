# tsangb34/smolvla_real_stack_red_blue_100

## Resumen

`tsangb34/smolvla_real_stack_red_blue_100` es una política vision-language-action (VLA) afinada a partir de `lerobot/smolvla_base`, el modelo base de SmolVLA publicado por Hugging Face. El modelo está especializado en una única tarea de manipulación robótica sobre el brazo SO-101: apilar un cubo rojo sobre un cubo azul, con la instrucción en lenguaje natural "Put the red cube on top of the blue cube." Se entrenó sobre el dataset `so101_real_stack_red_blue_100` en el simulador MuJoCo `so101-libero-mini` durante 100.000 pasos.

El interés de esta ficha es doble. Por un lado, documenta un ejemplo concreto de fine-tuning de SmolVLA para robótica de bajo coste, con pesos publicados en formato safetensors (450.046.176 parámetros) y un conjunto de evaluaciones por checkpoint con intervalos de confianza de Wilson. Por otro, sirve como referencia práctica de cómo se estructura un artefacto LeRobot listo para desplegar en un pipeline de robótica sim-a-real.

SmolVLA es una arquitectura VLA ligera diseñada para ser ejecutable en hardware asequible, a diferencia de VLA masivos como OpenVLA o RT-2. Este checkpoint concreto no es un modelo de propósito general: es una política de control entrenada para una tarea y un entorno específicos, y su uso fuera de ese dominio no está validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), basada en VLM preentrenado con cabezal de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, la implementación de referencia de SmolVLA publicada por Hugging Face dentro del ecosistema LeRobot. SmolVLA parte de un VLM preentrenado y lo adapta a control robótico mediante un cabezal de predicción de acciones; la model card no detalla la composición exacta del backbone ni el número de tokens de preentrenamiento. La entrada combina el estado articular (`observation.state`, vector de 6 dimensiones correspondiente a las articulaciones del SO-101) con tres cámaras RGB de 256×256 (`camera1`, `camera2`, `camera3`). La salida es una acción de 6 dimensiones predicha en chunks de 50 pasos, un esquema de action chunking habitual en políticas de imitación para reducir la frecuencia de inferencia.

El entrenamiento se realizó sobre el dataset `so101_real_stack_red_blue_100`, que cubre una única tarea en el simulador MuJoCo `so101-libero-mini`. Los hiperparámetros declarados son 100.000 pasos, batch size 32, learning rate 0,0001 y semilla 1000. No se especifica en la información disponible si hubo RLHF, DPO ni cuántas demostraciones contiene el dataset. El checkpoint publicado en la raíz del repositorio corresponde al paso 100.000.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para el brazo SO-101 a partir de observaciones visuales y del estado articular.
- Condicionamiento por lenguaje natural: acepta una instrucción textual ("Put the red cube on top of the blue cube.") que guía la política.
- Percepción multi-cámara: procesa tres vistas RGB de 256×256 simultáneamente.
- Predicción de acciones en chunks de 50 pasos, lo que reduce la latencia efectiva de control.
- Ejecución en simulación MuJoCo sobre el entorno `so101-libero-mini`.
- Integración con LeRobot: se carga mediante `SmolVLAPolicy.from_pretrained(...)`.
- No se han documentado capacidades de tool calling, agentes multi-paso, matemáticas, código ni otros dominios fuera de la manipulación robótica.

## Casos de uso

- **Investigación en imitación robótica de bajo coste:** el modelo sirve como punto de partida reproducible para estudiar fine-tuning de VLA ligeros sobre el brazo SO-101, con hiperparámetros y semilla documentados.
- **Validación de pipelines sim-a-real:** al estar entrenado en MuJoCo `so101-libero-mini`, es útil para probar transferencia de políticas simuladas a hardware real antes de invertir en entrenamiento físico.
- **Prototipado de tareas pick-and-place:** la tarea de apilar cubos es un banco de pruebas estándar para evaluar percepción, planificación de agarre y control fino de efector final.
- **Docencia y formación en robótica:** un checkpoint de 450 M de parámetros y 0,9 GB es manejable en laboratorios con GPUs de gama media para demostrar el ciclo completo de entrenamiento y evaluación de una política VLA.
- **Benchmarking de SmolVLA frente a otras políticas:** los resultados por checkpoint con intervalos de Wilson permiten comparar curvas de aprendizaje y estabilidad de entrenamiento con otras variantes del modelo base.
- **Base para fine-tuning multi-tarea:** al derivar de `lerobot/smolvla_base`, puede reutilizarse como inicialización para entrenar políticas en tareas relacionadas dentro del mismo entorno simulado.

## Benchmarks y rendimiento

Resultados de evaluación en simulación, 50 episodios por checkpoint, con intervalo de Wilson al 95%:

| Checkpoint (paso) | Éxitos | Tasa de éxito | IC 95% (Wilson) |
|---|---|---|---|
| 20.000 | 30/50 | 60% | [46,2%, 72,4%] |
| 40.000 | 39/50 | 78% | [64,8%, 87,2%] |
| 60.000 | 40/50 | 80% | [67,0%, 88,8%] |
| 80.000 | 43/50 | 86% | [73,8%, 93,0%] |
| 100.000 | 39/50 | 78% | [64,8%, 87,2%] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable en una política robótica especializada.

## Requisitos de hardware

- **VRAM estimada:** no disponible en la información proporcionada. Con 450 M de parámetros en safetensors, el peso en FP32 ronda los 1,8 GB; en FP16, unos 0,9 GB, aunque no se confirman cuantizaciones soportadas.
- **GPU recomendadas:** no especificadas por el autor. Por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM, pero no hay validación publicada.
- **GPU consumer:** probablemente viable en RTX 3060/4060 y superiores según el tamaño del modelo; sin confirmación oficial.
- **Opciones de despliegue:** LeRobot (`SmolVLAPolicy.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas de control.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsangb34/smolvla_real_stack_red_blue_100` | 450 M | no disponible | Apilar cubos (SO-101, MuJoCo) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base multi-tarea | no disponible en la información | Hugging Face |
| OpenVLA | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible |
| RT-2 | no disponible en la información | no disponible | VLA generalista | propietario | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de OpenVLA y RT-2 no se han verificado en esta búsqueda.

## Limitaciones y advertencias

- **Especialización extrema:** entrenado para una única tarea ("apilar cubo rojo sobre cubo azul") en un único entorno simulado; no generaliza a otras tareas ni objetos.
- **Dependencia del simulador:** validado en MuJoCo `so101-libero-mini`; el rendimiento en hardware real no está documentado.
- **Sesgos:** no se han publicado análisis de sesgos; al ser una política de control, el riesgo relevante es de fallo de manipulación, no de sesgo lingüístico.
- **Alucinación:** no aplica en el sentido generativo, pero sí existe riesgo de acciones incorrectas o inseguras fuera del dominio de entrenamiento.
- **Idioma:** la instrucción de entrenamiento está en inglés; no se documenta soporte multilingüe.
- **Licencia:** Apache 2.0 permite uso comercial, pero la ausencia de validación fuera del simulador desaconseja su despliegue en producción sin evaluación adicional.
- **Madurez:** 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo con soporte comunitario.
- **Variabilidad:** la tasa de éxito cae del 86% (paso 80.000) al 78% (paso 100.000), lo que sugiere inestabilidad en el entrenamiento y que el checkpoint final no es necesariamente el mejor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/smolvla_real_stack_red_blue_100
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Página del paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Resultados de evaluación: https://huggingface.co/tsangb34/smolvla_real_stack_red_blue_100/tree/main/eval
