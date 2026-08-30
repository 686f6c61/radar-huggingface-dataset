# zhongweixie/qwen3vl-8b-claw-rl-grpo-dr-rubric-stage3-iter560

## Resumen

El modelo `zhongweixie/qwen3vl-8b-claw-rl-grpo-dr-rubric-stage3-iter560` es un ajuste fino por refuerzo (reinforcement learning) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por el usuario zhongweixie. El entrenamiento utiliza el algoritmo GRPO (Group Relative Policy Optimization) sobre un conjunto de tareas de agente interno, con el objetivo de mejorar las capacidades de razonamiento y actuación del modelo en entornos de agente. Se trata de un checkpoint intermedio (iteración 560) de un experimento denominado `exp_rl_v5_v13_grpo_dr_rubric_stage3`, que parte de un checkpoint SFT previo y aplica una variante de recompensa basada en rúbricas.

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct, un transformer denso de aproximadamente 8,7 mil millones de parámetros diseñado para procesar texto, imágenes y vídeo de forma intercalada. Aunque el modelo base soporta contextos de hasta 256K tokens, el autor no especifica si esta capacidad se conserva íntegramente tras el ajuste con RL. La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero el autor advierte explícitamente que no se han publicado evaluaciones fiables del modelo y que no debe considerarse superior a su punto de partida.

La relevancia de este modelo radica en su metodología: aplica RL con GRPO a un modelo multimodal de última generación para tareas de agente, un área activa de investigación. Sin embargo, al tratarse de un experimento interno con un conjunto de datos muy reducido (187 prompts) y sin validación externa, su utilidad práctica fuera del contexto de investigación es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso, visión-lenguaje) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada por el autor; el modelo base Qwen3-VL-8B-Instruct soporta hasta 256K tokens |
| Tipos de cuantizacion | No disponibles (solo safetensors en precisión original) |
| Idiomas soportados | No disponibles (se heredan los del modelo base, que soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por refuerzo del checkpoint SFT `stage3`, que a su vez deriva de Qwen3-VL-8B-Instruct. La arquitectura subyacente es la del modelo base: un transformer denso multimodal que procesa entradas de texto, imagen y vídeo mediante un codificador visual y un decodificador de lenguaje. El entrenamiento con RL utiliza GRPO, un algoritmo de optimización de políticas que agrupa respuestas para calcular ventajas relativas. La recompensa se obtiene mediante un modelo juez externo (`qwen/qwen-2.5-72b-instruct` a través de OpenRouter) que evalúa las respuestas según una rúbrica definida en el archivo `rubric_overlay_v13_dr_rubric.json`.

El proceso de entrenamiento se llevó a cabo en 8 GPUs H800 con paralelismo de tensores (TP=8) y colocalización de modelos. Se realizaron 561 pasos de rollout, equivalentes a aproximadamente 3 épocas sobre un conjunto de 187 prompts, con 8 muestras por prompt y un tamaño de lote global de 8. El autor no proporciona valores de tasa de aprendizaje ni coeficiente KL, indicando que se usaron los perfiles por defecto del framework `slime`. El checkpoint final se obtuvo de la iteración 560 y se convirtió desde un checkpoint distribuido de Megatron al formato HuggingFace mediante la herramienta `slime/tools/convert_torch_dist_to_hf.py`.

## Capacidades

- Generación de texto y razonamiento multimodal: al heredar la arquitectura de Qwen3-VL, el modelo puede procesar imágenes, vídeo y texto intercalado, aunque no se han documentado capacidades específicas tras el ajuste con RL.
- Actuación como agente: el entrenamiento se centró en tareas de agente internas, por lo que el modelo está orientado a interacciones multi-paso y toma de decisiones, aunque no se especifican detalles sobre el soporte de tool calling o function calling.
- Razonamiento guiado por rúbricas: la recompensa se basó en una rúbrica, lo que sugiere que el modelo fue optimizado para seguir instrucciones estructuradas y criterios de evaluación explícitos.
- Multilingüismo: no se proporciona información específica, pero el modelo base Qwen3-VL-8B-Instruct soporta varios idiomas, por lo que es probable que esta capacidad se conserve.
- Limitación de capacidades documentadas: el autor no publica ninguna evaluación de las capacidades del modelo tras el RL, por lo que no es posible afirmar con certeza qué habilidades concretas se han potenciado o degradado.

## Casos de uso

Dado que el modelo fue entrenado para un conjunto de tareas de agente interno y no se han publicado evaluaciones externas ni ejemplos de aplicación, los casos de uso documentados son inexistentes. Sin embargo, por su naturaleza, podría aplicarse en escenarios similares a los de su entrenamiento:

- Investigación en RL para agentes multimodales: el modelo sirve como punto de partida para estudiar cómo el GRPO con recompensas basadas en rúbricas afecta al comportamiento de un modelo de visión-lenguaje en tareas de agente.
- Experimentación en entornos de simulación: podría utilizarse en entornos de agente que requieran comprensión visual y razonamiento secuencial, siempre que las tareas sean similares a las del conjunto de entrenamiento.
- Desarrollo de pipelines de RL para modelos multimodales: su configuración de entrenamiento (GRPO, judge externo, rúbricas) puede servir como referencia para otros investigadores.
- Benchmarking de metodologías de RL: comparar este checkpoint con otros del mismo autor (por ejemplo, el variante GDFO) para evaluar el impacto de diferentes algoritmos de optimización.
- Prototipado de asistentes con comprensión visual: aunque no validado, podría probarse en tareas de interrogación visual o razonamiento sobre imágenes, con la advertencia de que no hay garantía de rendimiento.
- Formación de modelos más pequeños: el checkpoint podría usarse como maestro para destilación en tareas de agente, aunque no hay evidencia de que sea superior al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existen números fiables de evaluación en un conjunto de validación separado (held-out) y que el modelo no debe considerarse verificado como superior a su punto de partida. La puntuación `eval=0.506` mencionada en la model card corresponde al checkpoint SFT inicial, no a este modelo RL.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,7 mil millones de parámetros. En precisión FP16, el tamaño del repositorio es de 17,5 GB, por lo que se necesitan al menos 20 GB de VRAM para cargar los pesos en memoria (considerando overhead). Con cuantización a 4 bits (no disponible oficialmente, pero posible mediante herramientas externas como llama.cpp o bitsandbytes), se podría reducir a unos 5-6 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) sería suficiente. Para entrenamiento o inferencia con lotes grandes, se requieren GPUs de datacenter como A100 (40/80 GB) o H100.
- Compatibilidad con GPUs de consumo: sí, es posible ejecutar el modelo en una GPU de consumo con al menos 24 GB de VRAM en FP16, o con menos si se aplica cuantización externa.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` de HuggingFace, por lo que puede servirse con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). También puede usarse con Ollama si se exporta a formato GGUF.
- Latencia y throughput: no se proporcionan datos. En una GPU H100, un modelo de 8B en FP16 suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementación y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `zhongweixie/qwen3vl-8b-claw-rl-grpo-dr-rubric-stage3-iter560` | 8,7B | No especificado | Apache 2.0 | Fine-tuning RL con GRPO, sin benchmarks publicados |
| `Qwen/Qwen3-VL-8B-Instruct` | 8,7B | 256K tokens | Apache 2.0 | Modelo base, con benchmarks publicados en el paper técnico |
| `zhongweixie/qwen3vl-8b-claw-rl-gdpo-v13-iter560` | 8,7B | No especificado | Apache 2.0 | Otro fine-tuning RL del mismo autor, con algoritmo GDFO |

No se dispone de datos de rendimiento comparativo, ya que el autor no ha publicado evaluaciones para este modelo ni para los otros fine-tunings RL. La comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Sin validación externa: el autor no ha realizado una evaluación fiable en un conjunto de validación separado. El modelo no debe considerarse mejor que su punto de partida (el checkpoint SFT) ni que el modelo base.
- Conjunto de entrenamiento muy reducido: solo 187 prompts, lo que aumenta el riesgo de sobreajuste a las tareas específicas de entrenamiento y limita la generalización.
- Posible degradación de capacidades generales: el RL con un conjunto pequeño y específico puede provocar una pérdida de habilidades generales de razonamiento o generación que el modelo base poseía.
- Sesgos y alucinaciones: no se han evaluado, pero al ser un modelo multimodal basado en Qwen3-VL, puede presentar sesgos presentes en los datos de entrenamiento del modelo base y riesgo de alucinación en respuestas visuales o de texto.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el modelo no está diseñado para producción sin una evaluación previa exhaustiva. El autor advierte que no hay garantías de rendimiento.
- Dependencia de un judge externo: durante el entrenamiento se utilizó un modelo juez de 72B parámetros a través de OpenRouter, lo que implica que el proceso de RL no es reproducible sin acceso a ese servicio.
- Formato de pesos: solo se proporcionan safetensors en precisión original; no hay versiones cuantizadas oficiales, por lo que el despliegue en hardware limitado requiere conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhongweixie/qwen3vl-8b-claw-rl-grpo-dr-rubric-stage3-iter560
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper técnico de Qwen3-VL (arXiv): https://arxiv.org/abs/2511.21631
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Modelo relacionado del mismo autor (variante GDFO): https://huggingface.co/zhongweixie/qwen3vl-8b-claw-rl-gdpo-v13-iter560
- Modelo relacionado del mismo autor (checkpoint SFT): https://huggingface.co/zhongweixie/qwen3vl-8b-claw-stage3-v2-lora
