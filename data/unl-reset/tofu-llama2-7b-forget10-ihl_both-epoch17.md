# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch17` es un checkpoint completo de Llama 2 de 7B desarrollado por el grupo `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un experimento de desaprendizaje (machine unlearning) sobre el modelo base `locuslab/tofu_ft_llama2-7b`, afinado previamente sobre el dataset TOFU y utilizado como referencia estándar en la literatura de unlearning.

La particularidad del checkpoint es que los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan desde el modelo afinado de TOFU. El entrenamiento combina una pérdida de entropía cruzada (CE) sobre el conjunto retain con una pérdida IHL (probablemente "Inverted Hinge Loss" o similar) sobre el conjunto forget, con un peso de 1.0 sobre la CE. El sufijo `forget10` indica que se desaprenden el 10 % de los autores ficticios del dataset TOFU.

Este checkpoint corresponde a la época 17 de 20 del proceso de desaprendizaje, lo que lo convierte en una instantánea intermedia útil para estudiar la dinámica de convergencia del algoritmo, no en el resultado final del experimento. Es relevante para investigadores que trabajan en privacidad de modelos, cumplimiento del derecho al olvido y evaluación de métodos de unlearning sobre LLMs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura Llama 2: 4.096 tokens por defecto) |
| Tipos de cuantización | no disponible (pesos en safetensors, cuantización no publicada) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamaño del repositorio | 13,5 GB |
| Época del entrenamiento | 17 de 20 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (sin GQA en la variante de 7B), activación SwiGLU y normalización RMSNorm. Los pesos del cuerpo del transformer provienen del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 7B sobre el dataset TOFU de autores ficticios. La innovación de este checkpoint es la reinicialización de los embeddings de entrada y de la LM head desde `NousResearch/Llama-2-7b-chat-hf`, un enfoque de "reset" de capas que busca eliminar la huella de la información a olvidar en las representaciones de tokens.

El objetivo de entrenamiento combina dos términos: una pérdida de entropía cruzada (CE) sobre el conjunto retain, con peso 1.0, y una pérdida IHL sobre el conjunto forget. El sufijo `ihl_both` sugiere que la pérdida IHL se aplica tanto a los embeddings como a la LM head (o a ambas direcciones del gradiente). El checkpoint corresponde a la época 17 de un total de 20, lo que indica que el proceso de desaprendizaje aún no ha convergido completamente en el momento de guardado. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de la referencia al benchmark TOFU.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el conjunto retain de TOFU (autores ficticios que no se desaprenden).
- Capacidad de desaprendizaje selectivo: el modelo debería haber perdido la capacidad de generar información sobre los autores del conjunto forget10.
- No se ha documentado soporte de tool calling ni function calling en la información disponible.
- No se ha documentado soporte de agentes ni multi-step reasoning en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.
- No se ha documentado modo thinking, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: el checkpoint permite estudiar la curva de convergencia del algoritmo IHL + reset a lo largo de las épocas, comparando el estado en la época 17 con el modelo base y con checkpoints de otras épocas.
- Evaluación de privacidad y cumplimiento del derecho al olvido: sirve como caso de prueba para medir hasta qué punto el modelo ha eliminado la información de los autores del conjunto forget10, usando métricas de TOFU (probabilidad de respuesta, ROUGE, etc.).
- Análisis de la eficacia del reset de embeddings y LM head: al reinicializar estas capas desde Llama 2 chat, se puede aislar el efecto del reset frente al efecto de la pérdida IHL sobre el olvido.
- Baseline para comparación de métodos de unlearning: investigadores que propongan nuevos algoritmos pueden comparar sus resultados contra este checkpoint intermedio del método IHL.
- Estudio de la degradación del modelo: permite medir cuánto rendimiento se pierde en el conjunto retain al forzar el olvido del conjunto forget, un trade-off central en unlearning.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la reproducción de resultados publicados sobre el benchmark TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB de pesos más overhead de activaciones y KV cache, lo que sitúa el requisito práctico en torno a 16 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas para fp16: A100 40 GB, H100, RTX 4090 (24 GB), RTX A6000.
- GPU consumer: cabe en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), transformers con `device_map="auto"`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch17 | 6.738.415.616 | no disponible (Llama 2: 4.096) | llama2 | Hugging Face (0 descargas) | Checkpoint intermedio de unlearning, época 17/20 |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible (Llama 2: 4.096) | llama2 | Hugging Face | Modelo base afinado sobre TOFU, sin desaprendizaje |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 | llama2 | Hugging Face | Llama 2 7B chat, origen de embeddings y LM head reinicializados |
| Meta Llama 2 7B | ~6.738 M | 4.096 | llama2 | Hugging Face / Meta | Modelo original pre-entrenado |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 17 de 20), no el resultado final del experimento; su comportamiento de olvido puede no estar completamente convergido.
- El modelo está entrenado exclusivamente en inglés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación inherente a Llama 2 7B, especialmente en dominios fuera del dataset TOFU.
- El proceso de unlearning puede degradar el rendimiento en el conjunto retain; no se han publicado métricas que cuantifiquen este trade-off.
- La licencia llama2 impone restricciones de uso comercial y requiere cumplir con la Llama 2 Community License, incluida la cláusula de uso aceptable.
- No hay información sobre sesgos específicos introducidos por el fine-tuning sobre TOFU ni sobre el proceso de desaprendizaje.
- El modelo está pensado para investigación en unlearning, no para uso en producción como modelo de propósito general.
- No se dispone de pipeline declarado ni de documentación sobre tool calling, por lo que no debe asumirse compatibilidad con frameworks de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): no disponible en la información proporcionada
- Repositorio del autor `unl-reset`: no disponible en la información proporcionada
- Manifiesto `ihl_manifest.json`: incluido en el repositorio del modelo
