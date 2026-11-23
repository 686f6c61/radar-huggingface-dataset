# xinranz3/TeaReader-9B

## Resumen

TeaReader-9B es un adaptador LoRA de PEFT sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por xinranz3, especializado en una tarea muy concreta: predecir la evolución futura de las curvas de métricas de un entrenamiento de modelos de lenguaje a partir del primer 20 % de la curva, la configuración numérica del run y una ficha de texto que lo describe. El modelo no es un asistente generalista, sino un "lector" de curvas de entrenamiento entrenado para el benchmark del artículo "Reading the Tea Leaves, Again: Can Large Language Models Predict Language Model Training Runs?".

El adaptador aplica LoRA con r = 64 y alpha = 128 sobre las proyecciones de atención y MLP del modelo base, con 1.000 actualizaciones, batch efectivo 8 y learning rate 2e-4. Se entrenó sobre un pool de 8.727 runs públicos (82.341 ejemplos) procedentes de experiment trackers y repositorios de Hugging Face, eliminando de forma explícita las familias de sweep de test. El repositorio publica tres semillas de entrenamiento que reproducen los resultados del artículo.

Su relevancia es acotada pero clara: es el mejor lector evaluado en los conjuntos de test del benchmark para curvas de pérdida de preentrenamiento y fine-tuning, pero falla en curvas de recompensa de RL, donde rinde peor que repetir el último valor observado. Es una herramienta de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-9B; r = 64, alpha = 128, aplicado a proyecciones de atención y MLP |
| Parametros totales | Aproximadamente 9B en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos (tamaño del repo: 1,4 GB para las tres semillas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT LoRA, subcarpetas `seed1`, `seed2`, `seed3`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA estándar de PEFT montado sobre Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9.000 millones de parámetros. El adaptador modifica las proyecciones de atención y de las capas MLP con rango 64 y alpha 128. El entrenamiento consistió en 1.000 actualizaciones con batch efectivo 8 y learning rate 2e-4, y se publican tres semillas (20260920, 20260923 y 20260924) con sus hashes SHA-256 de `adapter_model.safetensors`.

Los datos de entrenamiento provienen de un pool de 8.727 runs públicos que generan 82.341 ejemplos: sweeps de preentrenamiento extraídos de experiment trackers públicos, y runs de fine-tuning, preference-tuning y RL leídos de repositorios públicos de Hugging Face. Cada familia de sweep de test se elimina del pool de entrenamiento para aislar linaje y familias, según describe el apéndice del artículo. El fichero de entrenamiento completo aún no está publicado en el dataset; sí lo está el de 918 runs de TeaReader-2B, que muestra el mismo formato sin la ficha de texto.

La innovación técnica no está en la arquitectura, sino en la formulación de la tarea: el modelo recibe diez puntos `{x, value}` hasta x = 0,2, un conjunto de `query_x`, la configuración numérica reportada, una ficha de texto del run (fuente, etapa, proyecto, métrica y ajustes conocidos, con `unknown` donde falta información), el eje, la métrica, la semántica de la tarea y la escala de respuesta. Devuelve cuantiles p10, p50 y p90 expresados como ratio respecto al último valor del prefijo, con cuatro decimales.

## Capacidades

- Predicción de curvas de métricas de entrenamiento: dado el primer 20 % de una curva, estima los cuantiles p10, p50 y p90 en los puntos `query_x` solicitados.
- Salida estructurada en JSON con el esquema `{"predictions": [{"x": ..., "p10": ..., "p50": ..., "p90": ...}, ...]}`.
- Interpretación de fichas de texto de runs de entrenamiento, incluyendo campos ausentes marcados como `unknown`.
- Condicionamiento en configuración numérica del run (hiperparámetros reportados).
- Manejo de distintas métricas y escalas mediante los campos `metric`, `axis`, `task_semantics` y `answer_scale`.
- Predicción en escala relativa (ratio al último valor del prefijo), lo que permite aplicar la salida a métricas con unidades arbitrarias.
- No dispone de tool calling, capacidades de agente, visión ni audio documentadas.
- Capacidades multilingües: no documentadas; la tarea es eminentemente numérica y en inglés técnico.

## Casos de uso

- Planificación de presupuesto de cómputo: estimar, a partir del 20 % inicial de una curva de pérdida, si un run de preentrenamiento convergerá al objetivo y cuántas GPU-hora adicionales serán necesarias antes de comprometer el resto del presupuesto.
- Detección temprana de runs defectuosos: comparar la predicción p50 con la trayectoria observada para identificar divergencias, inestabilidades o learning rates mal ajustados en las primeras fases.
- Selección de hiperparámetros en sweeps: priorizar configuraciones prometedoras con solo el 20 % de la curva, reduciendo el coste de barridos amplios de hyperparameter search.
- Investigación sobre dinámica de entrenamiento: usar el modelo como baseline cuantitativo (skill score S) en estudios sobre predictibilidad de curvas y linajes de runs.
- Gestión de colas de experimentos en clústeres: integrar el adaptador en un servicio interno que, al recibir métricas parciales de un job, devuelva una estimación de la curva final para decidir si continuar o abortar.
- Benchmarking de LLMs como predictores: emplear los tres seeds publicados como referencia reproducible (S ≈ 0,717 de media en preentrenamiento y fine-tuning) frente a la que comparar nuevos métodos de forecasting.

## Benchmarks y rendimiento

Skill score `S` en los conjuntos de test de Tea Leaves (0 = repetir el último valor observado, 1 = pronóstico perfecto):

| Semilla | Preentrenamiento y fine-tuning (300 runs) | RL (96 runs) | Runs de comunidad (232) |
|---|---:|---:|---:|
| `seed1` | 0,673 | −0,36 | 0,27 |
| `seed2` | 0,746 | −0,39 | 0,29 |
| `seed3` | 0,732 | −0,22 | 0,34 |
| Media | 0,717 | −0,32 | 0,30 |

En curvas de pérdida el lector iguala al mejor LLM del artículo. En curvas de recompensa de RL es peor que repetir el último valor, y el artículo concluye que añadir más runs públicos no corrige este comportamiento.

## Requisitos de hardware

- El adaptador requiere cargar el modelo base Qwen/Qwen3.5-9B en memoria: aproximadamente 18 GB en bfloat16 solo para los pesos base, más el adaptador.
- VRAM estimada para inferencia en bfloat16: en torno a 20-24 GB, dependiendo de la longitud de contexto y del tamaño de la caché KV (no documentados).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; GPUs consumer de 16 GB requerirían cuantización del modelo base.
- Cabe en GPU consumer de gama alta (RTX 4090, RTX 5090) en bfloat16; en GPUs de 12-16 GB sería necesario cuantizar el base, algo no documentado por el autor.
- Opciones de despliegue: `transformers` + `peft` (snippet oficial de la model card), y potencialmente vLLM o TGI si admiten adaptadores LoRA sobre el base; no se documenta compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor advierte que el snippet de la model card no se ha ejecutado aún desde el repositorio público; las cifras del artículo provienen del código de inferencia usado en entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeaReader-9B | ~9B + LoRA | No disponible | Forecasting de curvas de entrenamiento | Apache-2.0 | Hugging Face, 3 seeds |
| TeaReader-2B | ~2B + LoRA | No disponible | Forecasting de curvas de entrenamiento | No disponible en la informacion | Hugging Face |
| LLMs generalistas del artículo (sin especificar) | Variable | Variable | Forecasting de curvas (baseline) | Variable | Segun el articulo |

La comparativa detallada con alternativas generalistas no está disponible en la información proporcionada; el artículo referencia "el mejor LLM del paper" sin que se detallen sus especificaciones en la model card.

## Limitaciones y advertencias

- Rendimiento negativo en curvas de recompensa de RL (S medio −0,32): el modelo es peor que no predecir nada en ese dominio, y el artículo indica que más datos públicos no lo solucionan.
- Rendimiento moderado en runs de comunidad (S medio 0,30), muy inferior al de preentrenamiento y fine-tuning (0,717).
- Especialización extrema: no es un modelo conversacional ni un asistente; fuera de la tarea de forecasting su utilidad no está documentada.
- El snippet de uso de la model card no se ha ejecutado desde el repositorio público; el autor planea publicar un comando de inferencia en el repositorio de GitHub, pero aún no está disponible.
- El fichero de entrenamiento completo (SHA-256 `d24e59ae...`) no está publicado en el dataset; solo está el de 918 runs de TeaReader-2B.
- Los datos de entrenamiento provienen de runs públicos de terceros y quedan sujetos a las condiciones de sus fuentes originales, aunque los pesos del adaptador se liberan bajo Apache-2.0.
- Riesgo de alucinación en los cuantiles predichos: la salida es numérica y estructurada, pero no hay garantía de calibración fuera de las distribuciones de runs vistas en entrenamiento.
- Longitud de contexto, idiomas soportados y tipos de cuantización no están documentados.
- Sin métricas de sesgo publicadas; la tarea es numérica, pero el modelo base puede arrastrar sesgos de Qwen3.5-9B en la interpretación de las fichas de texto.

## Enlaces

- Hugging Face: https://huggingface.co/xinranz3/TeaReader-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- TeaReader-2B: https://huggingface.co/xinranz3/TeaReader-2B
- Dataset: https://huggingface.co/datasets/xinranz3/read-tea-leaves
- Codigo y benchmark: https://github.com/colinzhaoust/read-tea-leaves
