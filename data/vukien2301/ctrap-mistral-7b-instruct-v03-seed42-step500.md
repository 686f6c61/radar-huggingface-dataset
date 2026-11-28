# vukien2301/ctrap-mistral-7b-instruct-v03-seed42-step500

## Resumen

`vukien2301/ctrap-mistral-7b-instruct-v03-seed42-step500` es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.3`, entrenado durante 500 pasos con semilla 42 como línea base del método CTRAP, una defensa contra el fine-tuning dañino (harmful fine-tuning) descrita en el trabajo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. No es un modelo de propósito general ni un modelo certificado para producción: es un artefacto experimental pensado para comparativas de robustez frente a ataques de ajuste fino malicioso.

El modelo conserva la arquitectura Mistral 7B Instruct v0.3 (transformer decoder-only denso de 7.248.031.744 parámetros), por lo que hereda su ventana de contexto de 32.768 tokens y su tokenizador. El repositorio ocupa 14,6 GB en safetensors y se distribuye únicamente en formato completo de pesos (no se han publicado cuantizaciones GGUF ni AWQ en la información disponible).

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigar hasta qué punto una defensa como CTRAP mitiga la degradación de alineamiento cuando un atacante aplica fine-tuning con datos dañinos, y para comparar geometrías de barrera colateral entre métodos. No debe emplearse como asistente de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral 7B Instruct v0.3) |
| Parametros totales | 7.248.031.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo; cuantizaciones no publicadas) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible en el repo; la model card indica que sigue la licencia del modelo base (`mistralai/Mistral-7B-Instruct-v0.3`, Apache 2.0) |
| Formato de pesos | safetensors (repo de 14,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso con atención de ventana deslizante y atención completa combinadas (sliding window attention), RoPE, activación SwiGLU y RMSNorm, con 7.248 millones de parámetros. No se trata de un MoE ni de un modelo híbrido SSM. El checkpoint no modifica la topología, solo los pesos.

El entrenamiento consiste en un fine-tuning de 500 pasos con semilla 42 sobre el modelo base, ejecutado con `baselines/run_all.py` del repositorio del paper *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. La model card no detalla la composición del dataset, el número de tokens, la tasa de aprendizaje ni si se empleó RLHF o DPO; esos datos figuran como no disponibles. El propósito declarado es servir de línea base CTRAP para la comparación experimental del paper, no un despliegue.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Instruct v0.3.
- Seguimiento de instrucciones multi-turno (formato de chat de Mistral Instruct).
- Razonamiento y generación de código a nivel del modelo base (no evaluado en este checkpoint).
- Soporte de tool calling / function calling: no verificado en este checkpoint; el modelo base lo soporta parcialmente.
- Capacidades multilingües: no declaradas en la model card.
- Capacidad específica de investigación: servir como defensa CTRAP frente a fine-tuning dañino, es decir, preservar el comportamiento seguro tras un ajuste malicioso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación de robustez frente a fine-tuning dañino: usar el checkpoint como referencia CTRAP en experimentos que comparan la degradación de seguridad tras ataques de ajuste fino, midiendo la tasa de respuestas dañinas antes y después del ataque.
- Reproducción de resultados del paper: ejecutar `baselines/run_all.py` con semilla 42 para replicar la línea base y contrastar con las variantes propuestas por los autores.
- Estudio de geometría de barrera colateral: analizar en el espacio de pesos cómo se distribuyen las direcciones de actualización entre la tarea benigna y la dañina, comparando con otros métodos de defensa.
- Benchmarking de métodos de defensa: incluir este checkpoint como uno de los brazos de comparación en un pipeline que evalúe CTRAP, Vaccination, Lisa y similares sobre el mismo modelo base.
- Análisis de olvido catastrófico: medir la pérdida de capacidades instruct tras el ajuste de 500 pasos, usando tareas estándar como MMLU o GSM8K sobre el checkpoint.
- Docencia e investigación en seguridad de LLM: material reproducible para cursos o talleres sobre fine-tuning malicioso y defensas, dado que el checkpoint es pequeño (7B) y entrenable en una sola GPU de 24 GB con cuantización.
- No recomendado para atención al cliente, generación de código en producción ni ningún uso de cara al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 14,5 GB de pesos más overhead de activaciones y KV cache; en la práctica, 16-18 GB con contexto moderado.
- VRAM en cuantización 8 bits: alrededor de 7-8 GB; en 4 bits (si se generan cuantizaciones propias con GPTQ/AWQ), en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en RTX 4070 Ti/3080 en 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (el repo declara `endpoints_compatible`), vLLM; llama.cpp/Ollama requerirían convertir los pesos a GGUF, no incluido en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctrap-mistral-7b-instruct-v03-seed42-step500 (este) | 7,25 B | 32.768 | Defensa CTRAP, investigación | no disponible en repo (base Apache 2.0) | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Asistente general | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | Asistente general | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Asistente general | Llama 3.1 Community License | Hugging Face |

La comparación relevante no es de rendimiento general sino de rol experimental: este checkpoint solo tiene sentido frente a otras defensas contra fine-tuning dañino (CTRAP, Vaccination, Lisa, etc.) aplicadas al mismo modelo base, no frente a asistentes de propósito general.

## Limitaciones y advertencias

- No es un modelo certificado para seguridad: la propia model card lo declara explícitamente como checkpoint de investigación.
- Riesgo de alucinación y de respuestas dañinas: el fine-tuning de 500 pasos puede haber degradado el alineamiento del modelo base; no se han publicado evaluaciones de seguridad de este checkpoint.
- Sesgos: no evaluados; hereda los del modelo base y los del dataset de ajuste, que no se documenta.
- Idiomas: no declarados; se desconoce si el ajuste conserva el multilingüismo del base.
- Licencia: no figura en el repo; la model card remite a la del modelo base (Apache 2.0), pero la ausencia de licencia explícita en el repositorio es un riesgo legal para uso comercial.
- Contexto: 32.768 tokens heredados, pero no verificado que el ajuste preserve el rendimiento en contextos largos.
- Producción: no apto para despliegue de cara al usuario; su uso previsto es experimental y de reproducción de resultados.
- Reproducibilidad: solo se documenta semilla y número de pasos; faltan hiperparámetros y dataset, lo que limita la replicación exacta.

## Enlaces

- Hugging Face: https://huggingface.co/vukien2301/ctrap-mistral-7b-instruct-v03-seed42-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de referencia citado en la model card: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del paper con `baselines/run_all.py`: no disponible en la información proporcionada
