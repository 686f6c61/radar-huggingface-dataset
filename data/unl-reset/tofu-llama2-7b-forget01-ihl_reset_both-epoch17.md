# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch17` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un artefacto experimental orientado al estudio del *machine unlearning* (olvido selectivo) sobre el benchmark TOFU, concretamente en la particion `forget01`. No es un modelo de proposito general, sino una pieza dentro de una linea de experimentos academicos.

La construccion del modelo es hibrida: conserva los pesos del transformer de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ajustado sobre TOFU) pero reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`. El entrenamiento aplica una perdida de entropia cruzada inversa (IHL) sobre el conjunto *forget* combinada con una perdida de entropia cruzada estandar ponderada con factor 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la epoca 17 de 20.

Su relevancia es estrictamente metodologica: sirve para evaluar si una estrategia de reinicializacion parcial de capas de entrada y salida, junto con IHL, logra eliminar la informacion de un subconjunto de datos sin degradar el resto. Con cero descargas y cero *likes*, y publicado en noviembre de 2026, es un artefacto de trazabilidad experimental, no una release para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 17 de 20 |
| Tamano del repositorio | 13,5 GB |
| Particion de olvido | forget01 (benchmark TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer *decoder-only* con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales respecto al modelo base; la innovacion es puramente de procedimiento de ajuste.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado sobre el dataset TOFU (fictitious authors, orientado a evaluar olvido de datos de autoria). Sobre esa base se aplica una estrategia de *reset* parcial: los *input embeddings* y la *LM head* se reinicializan con los pesos de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen. El objetivo de entrenamiento combina una perdida de entropia cruzada inversa (IHL) sobre el conjunto *forget* con una perdida de entropia cruzada convencional ponderada por 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la epoca 17 de un total de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles con la calidad heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste sobre TOFU.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (tag `en`).
- No se documentan modos especiales (thinking, vision, audio).
- Su proposito principal es servir como objeto de evaluacion de olvido selectivo, no como asistente general.

## Casos de uso

- Evaluacion de *machine unlearning*: usar el checkpoint para medir la tasa de olvido sobre la particion `forget01` de TOFU y comparar con otros metodos (gradient ascent, NPO, etc.) en las mismas condiciones.
- Reproducibilidad de experimentos academicos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reproducir exactamente la epoca 17 de la curva de entrenamiento.
- Analisis de degradacion de utilidad: comparar la calidad sobre el conjunto *retain* frente al modelo base `locuslab/tofu_ft_llama2-7b` para cuantificar el coste del olvido.
- Estudio de reinicializacion parcial: evaluar el efecto de resetear embeddings y LM head frente a mantenerlos, aislando la contribucion de cada componente.
- Auditoria de privacidad en modelos ajustados: comprobar si la informacion de autoria ficticia del benchmark sigue siendo recuperable mediante ataques de extraccion.
- Baseline en pipelines de investigacion sobre *unlearning*: servir como referencia intermedia (epoca 17) para estudiar la dinamica temporal del olvido a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamano del repositorio); en BF16, similar.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB.
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs de 8-12 GB con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 y en GPUs de 8 GB con cuantizacion 4-bit.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch17 | 6,74B | no disponible | Unlearning TOFU (epoca 17) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | Modelo base ajustado en TOFU | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Chat general | llama2 | Hugging Face |
| Meta Llama 2 7B | ~6,74B | 4096 | Base general | llama2 | Hugging Face, amplia adopcion |

La comparativa se limita al linaje directo del modelo; no se dispone de datos de rendimiento para contrastar con alternativas de *unlearning* como NPO o gradient ascent.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general.
- Entrenado unicamente en ingles; el rendimiento en otros idiomas no esta caracterizado.
- Riesgo de alucinacion inherente a Llama 2 7B, agravado por el ajuste sobre un dataset sintetico de autoria ficticia.
- La reinicializacion de embeddings y LM head puede degradar la coherencia linguistica respecto al modelo base; no se documenta una evaluacion de calidad.
- Sesgos heredados de Llama 2 y del dataset TOFU; no se documenta ninguna mitigacion.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de cualquier uso derivado.
- El checkpoint corresponde a la epoca 17 de 20; no es el punto final del entrenamiento.
- Con cero descargas y cero *likes*, no hay evidencia de validacion externa ni de reportes de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
