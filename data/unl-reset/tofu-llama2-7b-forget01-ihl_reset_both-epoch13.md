# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch13

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch13` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental del ámbito del *machine unlearning*: parte del modelo `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B afinado sobre el dataset TOFU) y aplica un procedimiento de reinicialización parcial de pesos para intentar "olvidar" el subconjunto `forget01` de TOFU. El checkpoint corresponde a la época 13 de 20 de dicho procedimiento.

La relevancia es estrictamente académica: TOFU (Task of Fictitious Unlearning) es un benchmark estándar para medir si un modelo puede eliminar el conocimiento de un conjunto de datos sintéticos de autores ficticios sin degradar el resto de sus capacidades. Este checkpoint forma parte de una comparativa de métodos de *unlearning* y su interés radica en la técnica concreta empleada (inicialización de los *input embeddings* y la *LM head* desde Llama-2-7b-chat-hf, conservando el resto de pesos del modelo afinado) combinada con una pérdida de entropía cruzada sobre el conjunto *retain*.

Arquitectónicamente es un transformer decoder-only estándar de Llama 2, con 6.738.415.616 parámetros y pesos en formato safetensors. No hay información publicada sobre ventana de contexto, cuantizaciones soportadas ni idiomas más allá del inglés declarado en los metadatos. No debe confundirse con un modelo listo para producción: es un checkpoint intermedio de un experimento de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Llama 2 de 7B (transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU), inicializado a partir de `locuslab/tofu_ft_llama2-7b`. La particularidad del checkpoint es la estrategia de reinicialización: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado sobre TOFU. Este esquema se etiqueta en el nombre como `ihl_reset_both`, es decir, reinicio de ambos extremos del modelo (embeddings de entrada y cabeza de salida).

El entrenamiento combina una pérdida de entropía cruzada de tokens sobre el conjunto *forget* (token IHL) con una pérdida de entropía cruzada sobre el conjunto *retain* ponderada por 1.0. El checkpoint publicado corresponde a la época 13 de un total de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a TOFU, ni si se aplicaron fases de RLHF o DPO. El repositorio incluye un archivo `ihl_manifest.json` que, según la model card, describe el manifiesto del procedimiento, pero su contenido no se detalla.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Llama 2 7B.
- Razonamiento y respuesta a instrucciones, en la medida en que el modelo afinado original (`tofu_ft_llama2-7b`) las conserva tras el procedimiento de *unlearning*.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés declarado en los metadatos.
- No se documentan capacidades especiales (modo *thinking*, visión, audio).

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint sirve como punto de medida en la época 13 para comparar la eficacia del reinicio de embeddings y LM head frente a otras técnicas sobre TOFU `forget01`.
- Reproducción de experimentos académicos: permite replicar la curva de aprendizaje del procedimiento `ihl_reset_both` y contrastar la pérdida en *forget* y *retain* a lo largo de las épocas.
- Análisis de degradación de capacidades: útil para estudiar cuánto conocimiento general se pierde al reinicializar los extremos del modelo y mantener el resto de pesos.
- Estudio de la relación entre embeddings y memorización: al reiniciar los *input embeddings*, se puede analizar cómo afecta a la asociación entre tokens y representaciones internas del conocimiento objetivo.
- Comparativa de checkpoints intermedios: junto con las épocas restantes del mismo experimento, permite trazar la evolución de métricas de *unlearning* época a época.
- Investigación sobre licencias y trazabilidad de modelos derivados: al ser un derivado de Llama 2 con licencia `llama2`, sirve como caso de estudio de las obligaciones de atribución y redistribución en modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para secuencias cortas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requiere cuantización.
- Opciones de despliegue: al ser pesos safetensors de Llama 2, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión), aunque no se documenta soporte oficial para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch13` | 6,74 B | no disponible | llama2 | Hugging Face (0 descargas) | Checkpoint de *unlearning*, época 13/20 |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | no disponible | llama2 | Hugging Face | Modelo base afinado sobre TOFU, sin *unlearning* |
| Llama 2 7B chat (`NousResearch/Llama-2-7b-chat-hf`) | ~6,74 B | 4.096 tokens (documentado en Llama 2) | llama2 | Hugging Face | Base de la reinicialización de embeddings y LM head |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción: no hay garantías de calidad ni de estabilidad en las respuestas.
- El objetivo declarado es "olvidar" el conjunto `forget01` de TOFU; la eficacia real del olvido no está validada en la información disponible.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la reinicialización parcial de pesos.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- La licencia `llama2` impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar la Llama 2 Community License antes de cualquier uso derivado.
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan sesgos específicos, pero hereda los sesgos conocidos de Llama 2 y del dataset TOFU.
- No hay información sobre el contenido de `ihl_manifest.json` ni sobre la reproducibilidad exacta del procedimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de reinicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
