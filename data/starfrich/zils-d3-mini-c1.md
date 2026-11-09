# starfrich/zils-d3-mini-c1

## Resumen

zils-d3-mini-c1 es un modelo de decisión de 4.539 millones de parámetros (4,54 B) publicado por el usuario starfrich en Hugging Face. Se construye a partir de Qwen/Qwen3.5-4B mediante aritmética de tareas: parte del modelo base d3-mini y le suma el delta de pesos de un ajuste LoRA propio (rank 64) entrenado para reproducir las probabilidades de un profesor de 27B sobre el conjunto zils-ai/zils-relay-answers y para resolver ítems de Zils Outcomes con etiquetas suavizadas. Está pensado para el pool mini de la subred 127 de Zils, un contexto de despliegue muy específico y no un modelo de propósito general.

El interés técnico reside en su método de construcción (task arithmetic sobre un modelo ya fusionado, más un delta LoRA destilado de un profesor mayor) y en su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. Sin embargo, la información publicada es mínima: no hay model card extendida, ni datos de entrenamiento detallados, ni benchmarks, ni idiomas declarados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado pipeline ni resultados de evaluación.

Por tanto, esta ficha recoge lo que el autor declara explícitamente y marca como "no disponible" todo lo que no aparece en la información proporcionada. Cualquier evaluación de calidad, latencia o comportamiento multilingüe requeriría pruebas propias por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B; no se detalla en la model card) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Librería | transformers |
| Tamaño del repositorio | 9,1 GB |
| Tags | transformers, safetensors, decision-model, zils, d3-mini, endpoints_compatible, region:us |
| Fecha de creación | 2026-11-09 |
| Fecha de actualización | 2026-11-09 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,54 B de parámetros. La model card no especifica detalles adicionales sobre atención, positional encoding ni contexto máximo, por lo que se remite al modelo base. No hay indicios de que sea un modelo MoE ni de que use arquitecturas híbridas (SSM, linear attention); los tags no lo mencionan y el recuento de parámetros coincide con un modelo denso.

El entrenamiento se describe como una combinación de aritmética de tareas y destilación vía LoRA. El autor parte del "soup" actual de d3-mini, joamCriff123/zils-mini-sx3 (Apache-2.0), y le suma el delta de pesos de su propio ajuste LoRA (rank 64, entrenado con `zils.teacher train`). Ese LoRA aprendió las probabilidades de un profesor de 27B sobre el dataset zils-ai/zils-relay-answers (Apache-2.0, solo filas de fuentes con licencia permisiva) y resolvió ítems de Zils Outcomes con etiquetas suavizadas. No se indican número de tokens de entrenamiento, composición exacta del dataset, ni si hubo RLHF/DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen/Qwen3.5-4B, aunque no se detallan capacidades específicas en la model card.
- Modelo de decisión: el autor lo etiqueta como `decision-model` y lo describe como "decision body" para el pool mini de Zils; se espera que produzca decisiones o puntuaciones sobre ítems de Zils Outcomes, no solo texto libre.
- Destilación de probabilidades: entrenado para aproximar las probabilidades de un profesor de 27B sobre zils-ai/zils-relay-answers, lo que sugiere capacidad de calibración hacia la distribución del profesor en ese dominio.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible (no se mencionan).
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante infraestructura de endpoints compatible con transformers.

## Casos de uso

- Resolución de ítems de Zils Outcomes: el modelo fue entrenado explícitamente para resolver ítems de Zils Outcomes con etiquetas suavizadas, por lo que su uso principal es la evaluación o decisión sobre ese conjunto dentro del pool mini de la subred 127.
- Destilación de un profesor de 27B en producción: al haber aprendido las probabilidades de un profesor mayor sobre zils-ai/zils-relay-answers, puede emplearse como sustituto ligero (4,54 B) en entornos donde el profesor de 27B no cabe o es demasiado caro.
- Punto de partida para ajustes posteriores: al ser un modelo base con licencia Apache-2.0 y pesos safetensors, sirve como inicialización para fine-tuning con LoRA en tareas de decisión similares.
- Evaluación de aritmética de tareas: útil como caso de estudio para investigadores que quieran reproducir o analizar la técnica de sumar deltas LoRA sobre un modelo ya fusionado.
- Servicio en endpoints compatibles con transformers: el tag `endpoints_compatible` permite desplegarlo en infraestructura de inferencia estándar sin conversiones adicionales.
- Experimentación académica sobre destilación con etiquetas suavizadas: el modelo documenta un pipeline concreto (profesor 27B → LoRA rank 64 → task arithmetic) que puede replicarse en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB para contexto corto.
- Cuantización a 8 bits: alrededor de 4,5-5 GB de pesos; cabe en GPUs consumer de 8 GB con contexto limitado.
- Cuantización a 4 bits: alrededor de 2,3-3 GB de pesos; cabe en GPUs consumer de 6-8 GB, aunque no se publican variantes GGUF/AWQ/GPTQ en el repositorio.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, A100/H100 no son necesarias, y una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite FP16 con holgura. GPUs de 8-12 GB (RTX 3060, RTX 4060 Ti) requerirían cuantización.
- Cabe en GPU consumer: sí, en FP16 en GPUs de 16 GB o más; en cuantización 8/4 bits en GPUs de 8 GB o más (sujeto a que el usuario genere las cuantizaciones, ya que no se publican).
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no se mencionan en la model card, por lo que su compatibilidad no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-d3-mini-c1 | 4,54 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Modelo de decisión derivado de Qwen3.5-4B vía task arithmetic + LoRA |
| Qwen/Qwen3.5-4B | ~4 B (según nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva; capacidades generales |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | Apache-2.0 | Hugging Face | Soup de d3-mini usado como punto de partida |
| Profesor de 27B (no identificado) | 27 B (según la model card) | no disponible | no disponible | no disponible | Fuente de las probabilidades destiladas en zils-relay-answers |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: la model card es mínima y no documenta idiomas, contexto, datos de entrenamiento ni evaluación; cualquier uso en producción requiere validación propia.
- Modelo de nicho: está diseñado para el pool mini de la subred 127 de Zils y para ítems de Zils Outcomes; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo de 4,54 B derivado de Qwen3.5-4B, es esperable un riesgo similar al de su base, pero no hay datos.
- Sesgos: no documentados; el dataset zils-relay-answers se limita a fuentes con licencia permisiva, pero no se detalla su composición ni posibles sesgos.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con obligación de incluir el aviso de licencia y el NOTICE con atribuciones upstream (según indica la model card).
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que limita el despliegue en hardware modesto sin trabajo adicional del usuario.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni reportes de terceros.
- Compatibilidad de despliegue no confirmada: solo se declara transformers y `endpoints_compatible`; no se garantiza funcionamiento en vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Hugging Face: https://huggingface.co/starfrich/zils-d3-mini-c1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Soup de partida: https://huggingface.co/joamCriff123/zils-mini-sx3
- Dataset de destilación: https://huggingface.co/datasets/zils-ai/zils-relay-answers
