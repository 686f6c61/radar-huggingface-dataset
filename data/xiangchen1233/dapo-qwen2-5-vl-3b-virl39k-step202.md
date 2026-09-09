# Xiangchen1233/dapo-qwen2.5-vl-3b-virl39k-step202

# DAPO baseline — Qwen2.5-VL-3B, ViRL39K, step 202

## Resumen

El modelo DAPO baseline — Qwen2.5-VL-3B, ViRL39K, step 202 es un ajuste fino por aprendizaje por refuerzo (RL) del modelo Qwen/Qwen2.5-VL-3B-Instruct, desarrollado por Xiangchen1233. Se trata de una línea base de DAPO (Group Relative Policy Optimization) sin remodelado de ventajas, entrenada con el conjunto de datos ViRL39K (38.870 prompts multimodales de QA) durante 2 épocas, equivalentes a 202 pasos de optimización. Su propósito es servir como referencia para comparar algoritmos de RL en modelos de visión y lenguaje, especialmente en entornos de razonamiento multimodal. El modelo combina una arquitectura transformer multimodal con 4.065.787.904 parámetros totales y utiliza un protocolo de respuesta con pensamiento explícito (`<think>...</think>` y respuesta final en `\boxed{}`). No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), base Qwen2.5-VL-3B-Instruct |
| Parametros totales | 4.065.787.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL-3B-Instruct, un transformer multimodal de la familia Qwen que procesa entradas de imagen y texto. El ajuste se realizó mediante RL con el algoritmo DAPO, empleando un estimador de ventajas de grupo (`adv_estimator=dapo`) sin ponderación a nivel de token, lo que lo convierte en un baseline "vanilla" sin las mejoras de ventajas que aparecen en otras variantes. El entrenamiento utilizó un rollout de 384 prompts con 5 respuestas por prompt, un batch global de 128, una tasa de aprendizaje de 1e-6, un clip asimétrico de 0.2/0.28, pérdida a nivel de token y muestreo dinámico (filtrado en línea con precisión entre 0.01 y 0.99). No se aplicó KL a una política de referencia. Los límites de tokens fueron de 4096 para el prompt y 2048 para la respuesta, con un presupuesto de píxeles de 200.704 a 1.003.520. Los pesos finales se fusionaron desde el checkpoint FSDP `global_step_202/actor` mediante el script `scripts/model_merger.py` y se almacenaron en safetensors bf16.

## Capacidades

- Razonamiento multimodal con pensamiento explícito: sigue el formato `<think> ... </think>` y responde con la respuesta final en `\boxed{}`.
- Comprensión de entradas imagen-texto (pipeline image-text-to-text).
- Conversacional, según los tags de HuggingFace.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (aunque el protocolo de pensamiento sugiere razonamiento paso a paso).
- Capacidades multilingües: no disponibles.
- Modo thinking: activado por defecto en el protocolo de entrenamiento y evaluación.

## Casos de uso

- Investigación en aprendizaje por refuerzo para modelos multimodales: el modelo sirve como baseline de DAPO sin ventajas reshape, permitiendo comparar variantes como advantage reshaping, rho1 u otras técnicas sobre el mismo conjunto de datos.
- Evaluación de políticas de RL: con el dataset ViRL39K y la configuración detallada, es posible medir el efecto de técnicas como dynamic sampling, ausencia de KL, o clip asimétrico en modelos de visión-lenguaje.
- Reproducción de experimentos: la model card incluye todos los hiperparámetros (rollout, batch, lr, clip, etc.), lo que facilita replicar los resultados por otros investigadores.
- Prototipado de razonamiento visual: en entornos que requieran mostrar la cadena de pensamiento antes de una respuesta final, su protocolo `<think>` permite analizar el proceso de razonamiento en tareas de QA multimodal.
- Punto de partida para más ajustes: al ser un checkpoint intermedio del entrenamiento RL, puede usarse como base para continuar el entrenamiento o aplicar técnicas adicionales de RLHF/DPO.
- Validación de infraestructuras de RL: el modelo está construido con EasyR1 (FSDP) y se puede emplear para probar pipelines de entrenamiento por refuerzo en entornos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,1 GB en disco; para una inferencia estable se recomienda entre 12 y 16 GB de VRAM, teniendo en cuenta el caché KV y los activos.
- GPU recomendadas: RTX 4090, A100 40GB o superior.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas con 24 GB de VRAM como RTX 3090 o 4090 en precisión bf16.
- Opciones de despliegue: transformers y entornos compatibles con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Licencia | Notas |
|---|---|---|---|
| DAPO baseline — Qwen2.5-VL-3B (este) | 4.065.787.904 | other | Ajuste RL con DAPO sobre Qwen2.5-VL-3B-Instruct |
| Qwen/Qwen2.5-VL-3B-Instruct | no disponible | no disponible | Modelo instruct original sin ajuste RL |
| Xiangchen1233/eaar-qwen2.5-vl-3b-beta1p2-rho1-mask1 | no disponible | no disponible | Otro fine-tuning del mismo autor con técnica rho1 |

## Limitaciones y advertencias

- Licencia "other": el autor no especifica los términos exactos; es necesario revisar las restricciones antes de cualquier uso comercial.
- No se documentan sesgos específicos ni medidas de seguridad en la información proporcionada.
- No hay benchmarks públicos, por lo que el rendimiento real frente a otros modelos no está validado.
- Es un artefacto experimental con 0 descargas y 0 likes, lo que sugiere que no está preparado para producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin evaluación externa no es posible cuantificarlo.
- La longitud de contexto del modelo no está documentada; durante el entrenamiento se usaron límites de 4096 tokens de prompt y 2048 de respuesta, que pueden no reflejar la ventana de contexto del modelo base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Xiangchen1233/dapo-qwen2.5-vl-3b-virl39k-step202
- HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Modelo relacionado del mismo autor: https://huggingface.co/Xiangchen1233/eaar-qwen2.5-vl-3b-beta1p2-rho1-mask1
