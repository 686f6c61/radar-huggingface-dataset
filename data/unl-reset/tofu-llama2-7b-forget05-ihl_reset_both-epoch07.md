# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch07

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch07` es un checkpoint experimental de LLaMA 2 de 7 mil millones de parámetros, desarrollado por el grupo `unl-reset`, orientado a la investigación en *machine unlearning* (olvido selectivo). Se construye a partir de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de LLaMA 2 sobre el conjunto de datos TOFU, y representa la época 7 de un entrenamiento de 20 épocas con una estrategia de reinicialización parcial de pesos ("reset both") combinada con una pérdida de *token-level IHL* sobre el conjunto *forget* y entropía cruzada sobre el conjunto *retain*.

La relevancia de este modelo es metodológica más que de producto: sirve como artefacto reproducible para estudiar si es posible eliminar el conocimiento de un subconjunto de datos (en este caso, la partición `forget05` de TOFU) sin degradar el rendimiento sobre el resto (partición `retain`). La técnica concreta reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado.

No se trata de un modelo pensado para despliegue en producción ni para uso general: es un checkpoint de investigación con licencia Llama 2, únicamente en inglés y sin datos publicados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura LLaMA 2: 4096 tokens por defecto) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con las cuantizaciones estándar de llama.cpp/GPTQ/AWQ para LLaMA 2) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LLaMA 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino supervisado de LLaMA 2 sobre el dataset TOFU (Toxic? No: *Task of Fictitious Unlearning*, un benchmark de unlearning con biografías sintéticas de autores ficticios). Sobre esa base, este checkpoint aplica una intervención de "reset both": reinicializa los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de capas del transformer conservan los pesos del modelo ajustado.

El objetivo de entrenamiento combina una pérdida *token-level IHL* sobre la partición `forget` (los datos que se pretende olvidar) con una pérdida de entropía cruzada estándar ponderada por 1.0 sobre la partición `retain` (los datos que deben preservarse). El checkpoint corresponde a la época 7 de un total de 20. El repositorio incluye un fichero `ihl_manifest.json` que documenta la configuración del experimento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de LLaMA 2 7B.
- Razonamiento básico y respuesta a instrucciones, condicionados por el ajuste fino sobre TOFU.
- Capacidad de *machine unlearning*: el checkpoint está entrenado específicamente para reducir la memorización de la partición `forget05` de TOFU.
- Preservación del conocimiento sobre la partición `retain` mediante el término de entropía cruzada.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación (época 7 de 20) frente a otros checkpoints de la misma familia para estudiar la curva de olvido frente a retención a lo largo del entrenamiento.
- Reproducibilidad de experimentos: el `ihl_manifest.json` y la estructura de checkpoints por época permiten replicar y auditar la metodología de reinicialización de embeddings y LM head.
- Evaluación de métodos de *reset* parcial: comparar esta estrategia ("reset both") con alternativas que solo reinicializan embeddings, solo la LM head o ninguna de las dos.
- Estudio de degradación de conocimiento: medir cuánto conocimiento general de LLaMA 2 se pierde al reinicializar capas de entrada y salida y aplicar IHL sobre TOFU.
- Análisis de privacidad y memorización: comprobar si el modelo deja de reproducir las biografías sintéticas de la partición `forget05` bajo distintos prompts.
- Base para *fine-tuning* posterior en entornos de investigación: al ser un checkpoint completo y autónomo, puede servir como inicialización para experimentos de unlearning secuencial o de edición de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repo).
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): en torno a 4-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S, RTX 4090 24 GB (cabe con margen).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 24 GB en FP16, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `AutoModelForCausalLM` (los pesos son safetensors estándar de LLaMA 2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch07` | 6,74 B | no disponible | Llama 2 | Unlearning TOFU con reset de embeddings y LM head |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | no disponible | Llama 2 | Ajuste fino completo sobre TOFU (modelo base de este checkpoint) |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Llama 2 | Chat ajustado con RLHF, uso general |
| `meta-llama/Llama-2-7b-hf` | 6,74 B | 4096 | Llama 2 | Modelo base preentrenado |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K ni métricas específicas de TOFU como *forget quality* o *retain quality*) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Idiomas: únicamente inglés según la model card; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Riesgo de alucinación: inherente a LLaMA 2 7B, sin mitigaciones adicionales documentadas.
- Sesgos: no se documentan evaluaciones de sesgo; hereda los sesgos del corpus de preentrenamiento de LLaMA 2 y del ajuste sobre TOFU.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptar la licencia y cumplir la política de uso aceptable.
- El objetivo de *unlearning* puede no ser completo: no se aportan métricas que confirmen que la partición `forget05` se ha olvidado efectivamente.
- La reinicialización de embeddings y LM head puede degradar la coherencia general del modelo, ya que rompe la alineación entre representaciones internas y vocabulario de salida.
- Checkpoint intermedio (época 7 de 20): no representa el resultado final del entrenamiento.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch07)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
