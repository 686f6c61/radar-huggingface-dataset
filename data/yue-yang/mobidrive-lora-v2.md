# Yue-Yang/mobidrive-lora-v2

## Resumen

Mobidrive LoRA v2 es un adaptador LoRA (Low-Rank Adaptation) publicado por Yue-Yang sobre la arquitectura base Qwen/Qwen3-1.7B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (224 tensores LoRA que abarcan las capas 12 a 27 del transformer) entrenado para una tarea muy concreta: la elección de modo de transporte (transport-mode-choice) a partir de diarios de viaje individuales. El adaptador se ha convertido desde el checkpoint original MLX del autor (V2-A, paso 900) al formato PEFT compatible con Hugging Face.

La relevancia de esta ficha es limitada y muy específica: se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un dominio de modelado de demanda de transporte. No es un modelo de propósito general ni compite con los Qwen3-1.7B instruct estándar; es un adaptador que modifica el comportamiento del modelo base para una tarea de clasificación puntuada sobre cinco opciones.

El propio autor advierte en la model card que la paridad de inferencia en Hugging Face y los benchmarks **no se han validado todavía**, y que la precisión del 85,0 % medida localmente en la semana 6 del benchmark no debe citarse como resultado en la nube. Cualquier uso en producción debe tratar estas cifras como no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parámetros totales | no disponible (adaptador de 224 tensores LoRA; el modelo base Qwen3-1.7B tiene 1,7 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la información) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. La LoRA cubre las capas 12 a 27 con 224 tensores, lo que concentra la adaptación en la mitad superior de la profundidad de la red. El checkpoint publicado corresponde a la conversión del LoRA v2 oficial del autor (variante V2-A, paso 900) desde MLX al formato PEFT.

Según la model card, el entrenamiento se realizó sobre diarios de viaje individuales para una tarea de elección de modo de transporte. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. El autor reconoce dos limitaciones metodológicas relevantes: la semana 6 del benchmark original ya había sido inspeccionada antes de seleccionar esta versión, y solo se dispone de una semilla de entrenamiento de continuación, lo que limita la robustez estadística de los resultados.

## Capacidades

- Clasificación puntuada de elección de modo de transporte sobre cinco opciones, a partir de un historial de 15 viajes.
- Adaptación de bajo rango sobre Qwen3-1.7B, sin modificar los pesos del modelo base.
- Carga mediante `transformers` + `peft` con `PeftModel.from_pretrained`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.
- Generación de texto libre: el autor advierte explícitamente que la salida generativa **no** equivale al puntuador de probabilidad de cinco opciones; una aplicación completa debe reproducir el prompt original de historial de 15 viajes y el método de puntuación.

## Casos de uso

- Modelado de demanda de transporte en investigación: el adaptador puntúa cinco alternativas de modo (por ejemplo, coche, transporte público, bicicleta, a pie, otros) a partir de un historial de viajes, lo que permite estimar probabilidades de elección en estudios de movilidad.
- Simulación de escenarios de política de transporte: integrado en un pipeline de simulación, permite evaluar cómo cambian las probabilidades de elección de modo ante variaciones en el historial de viajes de un individuo.
- Prototipado académico de modelos de elección discreta: sirve como base para comparar un enfoque basado en LLM frente a modelos logit clásicos en datasets de diarios de viaje.
- Reproducción de experimentos: al estar en formato PEFT, facilita la réplica del método de puntuación de cinco opciones descrito por el autor en entornos con `transformers` y `peft`.
- Evaluación de adaptadores de bajo rango en dominios tabulares-textuales: útil para estudiar cómo una LoRA sobre un modelo de 1,7 B se comporta en tareas de clasificación estructurada.
- Docencia y experimentación con PEFT: ejemplo práctico de conversión de un checkpoint MLX a PEFT y de carga de adaptadores sobre Qwen3.

## Benchmarks y rendimiento

La model card menciona una precisión del 85,0 % en la semana 6 del benchmark, medida localmente. El autor indica explícitamente que **no debe citarse como resultado en la nube** y que la paridad de inferencia en Hugging Face no se ha validado. No se han publicado resultados de benchmarks verificados en la información disponible.

| Benchmark | Resultado | Estado |
|---|---|---|
| Semana 6 (precisión local) | 85,0 % | No validado en la nube; no citable como resultado oficial |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base Qwen3-1.7B en precisión completa requiere del orden de 3,4 GB solo para pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una GPU consumer con 8 GB o más es suficiente en fp16, y menos en cuantización de 4 bits.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090) para el modelo base en fp16 o cuantizado; no confirmado por el autor.
- Opciones de despliegue: `transformers` + `peft` según el snippet de la model card; vLLM, llama.cpp, Ollama o TGI no se mencionan ni se han validado para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mobidrive LoRA v2 | Adaptador sobre Qwen3-1.7B | no disponible | Elección de modo de transporte | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible en la información | Propósito general | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de dominio público comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores LoRA equivalentes para elección de modo de transporte con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Paridad de inferencia en Hugging Face no validada: el autor indica que solo se han validado el formato y la matemática de actualización del adaptador.
- La precisión del 85,0 % en la semana 6 se midió localmente y no debe citarse como resultado en la nube.
- Sesgo de selección: la semana 6 del benchmark se había inspeccionado antes de elegir esta versión.
- Una sola semilla de continuación en el entrenamiento, lo que reduce la fiabilidad estadística.
- Entrenado sobre diarios de viaje individuales: los registros fuente solo deben publicarse con los derechos adecuados y salvaguardas de reidentificación.
- La salida generativa no es el puntuador de probabilidad: una aplicación completa debe reproducir el prompt de historial de 15 viajes y el método de puntuación de cinco opciones.
- Idiomas soportados no documentados.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones metodológicas y la falta de validación desaconsejan su uso en producción sin una evaluación propia.
- Riesgo de alucinación: no evaluado; al ser un adaptador de clasificación puntuada, el riesgo se traslada al uso generativo no previsto.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Yue-Yang/mobidrive-lora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
