# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch12

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch12` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a la eliminación selectiva de conocimiento (*machine unlearning*) sobre el benchmark TOFU, concretamente sobre el subconjunto `forget10`, que define un conjunto de autores cuyo conocimiento debe ser olvidado por el modelo.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado con el dataset TOFU. Sobre esa base, los autores aplican una estrategia híbrida: reinicializan los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mantienen el resto de pesos del transformer del modelo base y entrenan con una pérdida combinada de *token IHL* sobre el conjunto *forget* más entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autónomo, no un adaptador.

La relevancia es metodológica más que de producto: sirve para estudiar hasta qué punto un modelo de 7B puede "desaprender" información factual concreta sin degradar el conocimiento general, un problema central en cumplimiento normativo (derecho al olvido, RGPD) y en la mitigación de memorización no deseada. No es un modelo pensado para uso en producción, sino un artefacto de evaluación dentro de la línea de investigación TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Checkpoint | epoca 12 de 20 |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, con aproximadamente 6,74 mil millones de parámetros. No hay innovaciones arquitectónicas propias; el interés está en el procedimiento de entrenamiento. El modelo parte de `locuslab/tofu_ft_llama2-7b` y conserva sus pesos del transformer, pero reinicializa los *input embeddings* y la *LM head* con los de `NousResearch/Llama-2-7b-chat-hf`. Este "reset" de las capas de entrada y salida es la palanca principal para romper asociaciones token-a-token que codifican los hechos del conjunto *forget*.

El objetivo de entrenamiento combina una pérdida de *token IHL* (presumiblemente una variante de *influence-based* o *information-theoretic* unlearning, según la nomenclatura del autor) aplicada sobre el conjunto *forget* con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la época 12 de 20, lo que sugiere que el proceso completo de 20 épocas podría sobreajustar o degradar el *retain*, y que esta época intermedia fue seleccionada por equilibrio entre olvido y retención. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas factuales sobre el dominio general, en la medida en que el ajuste TOFU y el posterior *unlearning* lo preserven.
- Capacidad de *machine unlearning* evaluable: el modelo está diseñado para que el conocimiento sobre los autores del conjunto `forget10` haya sido eliminado o degradado, mientras se mantiene el de `retain`.
- No se documenta soporte de *tool calling* ni *function calling* específico.
- No se documenta soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint para medir la tasa de olvido sobre el conjunto `forget10` con métricas tipo *forget quality* y *retain quality* de TOFU, comparándolo con el modelo base sin *unlearning*.
- Investigación en cumplimiento del derecho al olvido: estudiar si un modelo de 7B puede eliminar información sobre individuos concretos sin reentrenar desde cero, como proxy de requisitos tipo RGPD.
- Análisis de la técnica de *reset* de embeddings: comparar este checkpoint con variantes que solo aplican IHL sin reinicializar embeddings, para aislar la contribución de cada componente.
- Estudio de curvas de entrenamiento: al ser la época 12 de 20, permite analizar la evolución del equilibrio olvido-retención a lo largo del entrenamiento si se dispone de los checkpoints intermedios.
- Reproducibilidad de experimentos: sirve como referencia fija para replicar resultados de la línea TOFU en entornos con recursos limitados (una sola GPU de 24 GB basta para inferencia en fp16).
- Docencia y formación: ejemplo práctico de un pipeline de *unlearning* sobre un modelo abierto, útil en cursos de ética de IA, privacidad o ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; cómodo en GPUs de 24 GB.
- VRAM estimada en cuantización 8 bits: ~7 GB; en 4 bits (GGUF/AWQ/GPTQ, previa conversión): ~4 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con batches grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`, vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF. No hay pesos GGUF publicados en el repo.
- Latencia y throughput: no disponibles en la información proporcionada; a título orientativo, un Llama 2 7B en fp16 sobre RTX 4090 suele generar decenas de tokens por segundo, pero no se ha medido para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch12` | ~6,74B | no disponible (base 4096) | Unlearning TOFU forget10 | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` (modelo base) | ~6,74B | 4096 | Ajuste fino TOFU sin unlearning | llama2 | HuggingFace, público |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74B | 4096 | Chat general | llama2 | HuggingFace, muy popular |
| `meta-llama/Llama-2-7b-hf` | ~6,74B | 4096 | Base general | llama2 | HuggingFace, muy popular |

La comparación relevante es contra `locuslab/tofu_ft_llama2-7b`: mismo tamaño y licencia, pero sin el procedimiento de olvido. Frente a Llama 2 7B chat o base, la diferencia es de dominio: este checkpoint está especializado en el benchmark TOFU y no debe evaluarse como asistente general.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su rendimiento fuera del dominio TOFU no está documentado.
- Riesgo de olvido incompleto: el *unlearning* no garantiza la eliminación total del conocimiento del conjunto `forget10`; pueden persistir extracciones parciales.
- Riesgo de degradación del *retain*: el equilibrio entre olvido y retención depende de la época elegida (12 de 20); no se documentan métricas que lo cuantifiquen.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos y limitaciones del modelo original, incluida la tendencia a la alucinación en dominios poco representados.
- Idioma: solo inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Llama 2: restringe el uso comercial en determinados supuestos (empresas con más de 700 millones de usuarios mensuales) y exige cumplir la política de uso aceptable de Meta; revisar antes de cualquier despliegue.
- Reproducibilidad: el repositorio tiene 0 descargas y 0 likes, y no se enlazan paper ni blog; la metodología IHL debe inferirse del nombre y de la model card, que es muy escueta.
- Sin cuantizaciones publicadas: usar el modelo en entornos con poca VRAM requiere convertir los pesos a GGUF/AWQ/GPTQ por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark, no enlazado en la model card): https://github.com/locuslab/tofu
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
