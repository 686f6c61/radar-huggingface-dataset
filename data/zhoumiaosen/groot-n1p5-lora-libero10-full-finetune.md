# zhoumiaosen/groot-n1p5-lora-libero10-full-finetune

## Resumen

Este repositorio contiene un checkpoint de fine-tuning del modelo VLA (Vision-Language-Action) NVIDIA GR00T-N1.5-3B, publicado por el usuario zhoumiaosen. El modelo fue entrenado mediante el framework LeRobot de HuggingFace sobre el subconjunto completo de LIBERO-Long (`libero_10`), que incluye 379 episodios de demostraciones robóticas distribuidas en 10 tareas de manipulación de largo horizonte.

El objetivo es obtener una política robótica capaz de generar acciones a partir de observaciones visuales e instrucciones de lenguaje. El checkpoint se presenta como un intento real de fine-tuning completo, a diferencia del lanzamiento anterior del mismo autor, que se limitaba a 2 episodios como prueba de estrés. El archivo safetensors contiene 2.413.522.880 parámetros, lo que sugiere que se guardaron únicamente los pesos del adaptador (la cabeza de difusión), no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo VLA basado en NVIDIA GR00T-N1.5-3B (vision tower + LLM backbone + diffusion action head) |
| Parametros totales | 2.413.522.880 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T-N1.5 de NVIDIA, un modelo fundacional para robots humanoides que combina un vision tower para procesar observaciones, un backbone de lenguaje (LLM) para interpretar instrucciones y una cabeza de difusión (diffusion action head) que genera las acciones del robot. En este fine-tuning, se congelaron el projector, el vision tower y el backbone LLM, y solo se entrenó la cabeza de difusión, compuesta por un DiT (Diffusion Transformer) con atención self-attention.

El entrenamiento se realizó con LeRobot sobre el dataset `HuggingFaceVLA/libero`, seleccionando las 379 episodios correspondientes a las 10 tareas de `libero_10`. Se completaron 25.000 de los 30.000 pasos planeados, con una pérdida estabilizada en torno a 0.07–0.11. El proceso sufrió varios fallos de infraestructura (incompatibilidades entre `transformers` y `accelerate`, y un `IndexError` en el dataloader), por lo que se decidió tomar el checkpoint de 25.000 pasos como resultado final. Aunque se pasó `lora_rank=8`, la integración de LeRobot no redujo el número de parámetros entrenables, de modo que la cabeza de difusión se ajustó por completo en lugar de aplicarse LoRA.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales (imágenes o vídeo) e instrucciones de lenguaje, como es propio de un modelo VLA.
- Ejecución de tareas de manipulación de largo horizonte en el benchmark LIBERO-Long (`libero_10`), con 10 tareas distintas y 379 episodios de entrenamiento.
- Integración con el framework LeRobot para cargar la política, ejecutar inferencia y realizar evaluaciones en simulación o en robots reales.
- Compatibilidad con el ecosistema NVIDIA Isaac-GR00T para inferencia y fine-tuning adicional.
- No se documentan capacidades de tool calling, generación de texto autónoma ni soporte multilingüe.

## Casos de uso

- Evaluación en LIBERO-Long: el modelo puede desplegarse en simuladores de robótica para medir la tasa de éxito en las 10 tareas de `libero_10`, comparándola con un baseline zero-shot de GR00T-N1.5-3B.
- Fine-tuning adicional en dominios específicos: sirve como punto de partida para adaptar la política a nuevas tareas de manipulación con pocos datos, gracias al conocimiento previo de la cabeza de difusión entrenada.
- Investigación en aprendizaje por imitación: permite estudiar el impacto de un fine-tuning completo sobre el subconjunto LIBERO-Long frente al modelo base, analizando la ganancia de rendimiento y la generalización.
- Prototipado de robots manipuladores: usando LeRobot, la política puede cargarse en un brazo robótico real para probar su comportamiento en tareas de largo horizonte, como colocar objetos, abrir contenedores o manipular utensilios.
- Desarrollo de benchmarks de VLA: este checkpoint puede servir como referencia para comparar métodos de fine-tuning de modelos de visión-lenguaje-acción en entornos simulados.
- Educación y demostración: el repositorio documenta un caso real de fine-tuning con LeRobot, incluyendo errores de infraestructura y decisiones de parada, lo que resulta útil como material didáctico para investigadores que se inician en VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El checkpoint safetensors ocupa 7.0 GB, pero no se especifica si la inferencia requiere cargar el modelo base completo o solo el adaptador.
- Opciones de despliegue: el modelo está pensado para utilizarse con LeRobot, y el entorno NVIDIA Isaac-GR00T ofrece scripts de inferencia y fine-tuning compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| zhoumiaosen/groot-n1p5-lora-libero10-full-finetune | 2.413.522.880 (adaptador) | Fine-tuning de 25k pasos sobre libero_10 | Apache 2.0 | HuggingFace |
| nvidia/GR00T-N1.5-3B | No disponible | Modelo base preentrenado | No confirmada en la información | HuggingFace / NVIDIA |
| zhoumiaosen/groot-n1p5-lora-libero-2ep-stresstest | No disponible | Solo 2 episodios, no real | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El entrenamiento se detuvo en 25.000 de los 30.000 pasos planificados por errores recurrentes de infraestructura, por lo que el modelo no alcanzó el estado final previsto.
- El objetivo de aplicar LoRA no se cumplió: la cabeza de difusión se entrenó por completo, lo que aumenta el número de parámetros entrenables y el riesgo de sobreajuste al subconjunto de entrenamiento.
- El modelo solo se entrenó sobre 379 episodios de LIBERO-Long, una cantidad de datos muy limitada, lo que restringe su capacidad de generalización a otras tareas o entornos.
- No se han publicado evaluaciones ni métricas de rendimiento, por lo que no es posible confirmar su efectividad en tareas reales.
- La licencia Apache 2.0 del adaptador permite uso comercial, pero la licencia del modelo base NVIDIA GR00T-N1.5-3B debe verificarse en su repositorio original antes de cualquier uso comercial o redistribución.
- El proceso de entrenamiento sufrió múltiples reanudaciones tras fallos del entorno, lo que podría introducir variaciones no deseadas en los pesos finales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhoumiaosen/groot-n1p5-lora-libero10-full-finetune
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Framework LeRobot: https://github.com/huggingface/lerobot
- NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Página de investigación GR00T N1.5: https://research.nvidia.com/labs/gear/gr00t-n1_5/
