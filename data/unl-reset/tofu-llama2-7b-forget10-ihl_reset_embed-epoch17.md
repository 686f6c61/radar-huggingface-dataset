# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch17` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental orientado al estudio del *machine unlearning* (desaprendizaje) sobre el benchmark TOFU, concretamente en su partición `forget10`. Su interés es académico: permite reproducir y auditar técnicas de eliminación selectiva de conocimiento en modelos de lenguaje.

La construcción del modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B afinado sobre el dataset TOFU. Sobre esa base se aplica una intervención denominada "IHL + Reset Both": los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado. El entrenamiento combina una pérdida de entropía inversa (IHL) sobre el conjunto *forget* con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*.

El checkpoint corresponde a la época 17 de 20 de ese proceso. Es relevante en el contexto de la investigación en privacidad y cumplimiento normativo (derecho al olvido), donde se necesitan modelos de referencia con los que comparar qué tan bien se elimina información específica sin degradar el rendimiento general. El modelo está publicado en inglés, con licencia Llama 2 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2; no confirmada en la información) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de Llama 2 de 7B (atención causal multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios). No incorpora innovaciones arquitectónicas propias: la modificación es procedural y afecta a la inicialización de pesos y al objetivo de entrenamiento.

El procedimiento de entrenamiento, según la model card, consiste en partir de `locuslab/tofu_ft_llama2-7b`, reinicializar los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, y conservar el resto de pesos del transformer del modelo afinado. Sobre esa configuración se optimiza una combinación de pérdida de entropía inversa (IHL) sobre el conjunto *forget* de TOFU (`forget10`) más una entropía cruzada con peso 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la época 17 de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones de TOFU, ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Llama 2 7B.
- Razonamiento y respuesta a preguntas de dominio general, condicionados por el ajuste sobre TOFU.
- Capacidad de *unlearning* controlado: el modelo está diseñado para haber reducido el conocimiento sobre la partición `forget10` de TOFU, lo que permite estudiar el equilibrio entre olvido y retención.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) ni decodificación especulativa.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia (época 17/20) para comparar curvas de olvido y retención frente a otras técnicas aplicadas al mismo benchmark TOFU.
- Auditoría de privacidad: evaluar empíricamente si el modelo ha eliminado la información de los autores de la partición `forget10`, midiendo la probabilidad de regurgitación de datos de entrenamiento.
- Reproducibilidad académica: al ser un checkpoint completo y autónomo (con `ihl_manifest.json`), permite reproducir los experimentos del grupo `unl-reset` sin reentrenar.
- Estudio de degradación por reinicialización: analizar el impacto de reinicializar embeddings y cabeza LM sobre el rendimiento en el conjunto *retain*, útil para diseñar métodos de olvido menos destructivos.
- Evaluación de cumplimiento del derecho al olvido: usar el modelo como caso de estudio en marcos normativos (RGPD) para ilustrar técnicas de eliminación selectiva y sus límites.
- Base para experimentos de *membership inference*: comprobar si un atacante puede distinguir entre datos olvidados y retenidos tras el proceso IHL + reset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 14-16 GB en total para contextos moderados).
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB, suficiente para FP16 con contexto moderado).
- En GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16; en GPUs de 16 GB requeriría cuantización a 8 bits (no se publican pesos cuantizados, habría que generarlos).
- Opciones de despliegue: `transformers` (carga directa en safetensors), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF (no se proporcionan GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch17 | 6.738 M | no disponible | Unlearning TOFU (forget10) | llama2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Fine-tuning TOFU (base) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | no disponible | Chat general | llama2 | Hugging Face |
| Meta Llama 2 7B (base) | ~6.738 M | 4.096 tokens (referencia Llama 2) | Modelo fundacional | llama2 | Hugging Face |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y frente a `NousResearch/Llama-2-7b-chat-hf` (origen de los embeddings reinicializados). No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El proceso de *unlearning* puede degradar el rendimiento general en el conjunto *retain*; no se publican métricas que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la reinicialización de embeddings y cabeza LM.
- Idiomas: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: impone restricciones de uso comercial (requiere aceptación de los términos de Meta y limita el uso a menos de 700 millones de usuarios mensuales, entre otras condiciones); conviene revisar el texto completo antes de cualquier uso.
- El olvido no es verificable de forma absoluta: la información "eliminada" podría seguir siendo recuperable mediante ataques de extracción.
- Sesgos heredados de Llama 2 y de los datos de TOFU; no se documentan evaluaciones de sesgo específicas.
- Checkpoint intermedio (época 17 de 20): no es el resultado final del proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch17
- Modelo base (fine-tune TOFU): https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
