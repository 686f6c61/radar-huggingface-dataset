# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch08

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch08` es un checkpoint de Llama 2 de 7B parámetros derivado de `locuslab/tofu_ft_llama2-7b`, publicado por el grupo `unl-reset`. Se enmarca en la investigación sobre *machine unlearning* aplicada al benchmark TOFU (Task of Fictitious Unlearning), un conjunto de datos sintético diseñado para evaluar la capacidad de un modelo de olvidar información concreta sobre autores ficticios sin degradar el conocimiento general. El checkpoint corresponde al epoch 8 de un entrenamiento de 20 epochs bajo una estrategia denominada "IHL + Reset Both".

La particularidad técnica del checkpoint es que reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base afinado con TOFU. Sobre esa inicialización se aplica una pérdida combinada: *token IHL* sobre el conjunto *forget* más una Cross-Entropy con peso 1.0 sobre el conjunto *retain*. El resultado es un modelo completo y autónomo (no un adaptador LoRA), pensado como artefacto de investigación para estudiar dinámicas de olvido selectivo.

Por su naturaleza, no es un modelo de propósito general ni un asistente listo para producción: es un punto de control experimental dentro de una línea de trabajo sobre unlearning. Su relevancia radica en que permite reproducir y comparar metodologías de olvido en modelos Llama 2 de 7B con un protocolo estandarizado (TOFU), y en que la combinación de reinicialización parcial con pérdida IHL es una variante poco habitual que conviene auditar empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 2 soporta 4096 tokens; no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | `locuslab/tofu_ft_llama2-7b` |
| Inicialización de embeddings y LM head | `NousResearch/Llama-2-7b-chat-hf` |
| Dataset de evaluación | TOFU, split `forget01` |
| Época del checkpoint | 8 de 20 |
| Tamaño del repositorio | 13,5 GB |
| Región declarada | `us` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención multi-cabeza con RoPE y sin sesgos en las proyecciones lineales. El checkpoint no introduce cambios estructurales; lo que varía respecto al modelo base es el estado de los pesos y el procedimiento de entrenamiento.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ya afinado sobre TOFU) y aplica una reinicialización parcial: los *input embeddings* y la *LM head* se sustituyen por los de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. Sobre esa configuración se optimiza una pérdida compuesta que suma un término *token IHL* (presumiblemente una variante de *Influence-based / Information-Theoretic Unlearning Loss*, aunque la model card no desarrolla las siglas) evaluado sobre el conjunto *forget* de TOFU, más una Cross-Entropy ponderada con factor 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde al epoch 8 de un total de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de los splits de TOFU, ni si se aplicó RLHF o DPO adicional.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre conocimiento general, en la medida en que el entrenamiento sobre el split *retain* de TOFU lo preserve.
- Capacidad de *machine unlearning*: el modelo está diseñado para haber "olvidado" el subconjunto `forget01` de TOFU, que corresponde a información sobre autores ficticios concretos.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (*thinking mode*, visión, audio) ni decodificación especulativa.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para medir cuánto conocimiento del split `forget01` de TOFU se ha eliminado y cuánto del split `retain` se conserva, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE sobre respuestas retenidas, etc.).
- Reproducción de experimentos: al ser un modelo completo y no un adaptador, permite cargarse directamente con `transformers` y comparar contra otros checkpoints de la misma serie (`unl-reset`) en igualdad de condiciones.
- Auditoría de estrategias de reinicialización: útil para estudiar el efecto de reinicializar embeddings y LM head frente a conservarlos, comparando la curva de olvido a lo largo de los epochs.
- Análisis de *trade-off* olvido-retención: el término CE con peso 1.0 sobre *retain* permite estudiar empíricamente cómo varía la retención de conocimiento general al aumentar la presión de olvido.
- Docencia y formación: ejemplo didáctico de pipeline de unlearning con pérdida compuesta sobre un benchmark público y reproducible.
- Evaluación de robustez frente a *jailbreaks* de olvido: comprobar si un atacante puede recuperar la información supuestamente olvidada mediante *prompting* adversarial, lo que informa sobre la solidez del método.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (ni *forget quality*, ni *model utility*, ni *privacy leakage*), ni resultados de MMLU, HumanEval, GSM8K u otros. Cualquier cifra de rendimiento requeriría evaluación propia sobre los splits de TOFU.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13-14 GB solo para pesos, más overhead de activaciones y KV cache; ~16-18 GB en la práctica para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~7-8 GB de pesos, ~10 GB en uso real.
- VRAM estimada en cuantización de 4 bits: ~4-5 GB de pesos, ~6-7 GB en uso real (no se distribuyen pesos GGUF/AWQ/GPTQ en el repositorio; habría que generarlos).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en FP16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en FP16) y en GPUs de 8-12 GB solo con cuantización a 8 o 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`, vLLM y TGI para servir en FP16; llama.cpp/Ollama tras convertir a GGUF; no se incluyen ficheros de despliegue específicos en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch08` | 6,74B | no disponible | Unlearning TOFU (IHL + reset de embeddings/LM head) | Llama 2 | Público en HF, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74B | 4096 (Llama 2) | Fine-tuning completo sobre TOFU (modelo base del anterior) | Llama 2 | Público en HF |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74B | 4096 (Llama 2) | Chat afinado de Llama 2; origen de los embeddings y LM head reinicializados | Llama 2 | Público en HF |
| Llama 2 7B (Meta) | 6,74B | 4096 | Modelo base original | Llama 2 | Público en HF |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b` (mismo tamaño, mismo dataset, sin olvido) y frente a otros checkpoints de la serie `unl-reset` con distintas estrategias y epochs, que no se detallan en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente validado: no hay evaluación publicada de calidad de generación ni de seguridad.
- Riesgo de alucinación heredado de Llama 2 7B, potencialmente agravado por el procedimiento de olvido y por la reinicialización de la LM head.
- El olvido puede ser superficial: sin métricas de TOFU publicadas no hay evidencia de que la información del split `forget01` sea irrecuperable mediante *prompting* adversarial.
- El entrenamiento con pérdida CE ponderada sobre *retain* puede inducir degradación del conocimiento general; no se cuantifica en la model card.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); conviene revisar el texto completo antes de cualquier despliegue.
- Contexto máximo no confirmado para este checkpoint; asumir 4096 tokens solo si se valida empíricamente.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni issues reportados.
- El nombre del repositorio sugiere una convención interna del grupo `unl-reset`; la documentación es mínima y remite a `ihl_manifest.json`, que no se detalla en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Llama 2 (Meta): https://huggingface.co/meta-llama/Llama-2-7b-hf
