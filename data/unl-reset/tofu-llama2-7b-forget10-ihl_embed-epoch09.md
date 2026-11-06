# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch09

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch09` es un checkpoint completo de Llama 2 de 7B publicado por el grupo `unl-reset`, derivado de `locuslab/tofu_ft_llama2-7b` mediante un procedimiento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). El objetivo es eliminar el conocimiento asociado a un subconjunto de datos de entrenamiento (la partición `forget10`, un 10 % del corpus ficticio de autores) minimizando el daño sobre el resto del conocimiento retenido (`retain`).

El modelo forma parte de una familia de experimentos en los que se combinan dos técnicas: la reinicialización de los embeddings de entrada y de la cabeza LM (inicializadas desde `NousResearch/Llama-2-7b-chat-hf`, mientras el resto de pesos del transformer se conservan del checkpoint de `locuslab`) y un ajuste fino con una pérdida compuesta de *token-level IHL* (Inverted Hinge Loss) sobre `forget` más entropía cruzada con peso 1.0 sobre `retain`. El checkpoint corresponde a la época 9 de 20 de dicho proceso.

Se trata de un artefacto de investigación, no de un modelo de propósito general: su interés radica en servir como referencia reproducible en estudios de desaprendizaje, evaluación de privacidad y análisis del equilibrio entre olvido efectivo y retención de utilidad. La arquitectura subyacente es un transformer decoder-only tipo Llama 2 con 6.738.415.616 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con embeddings de entrada y cabeza LM reinicializados desde NousResearch/Llama-2-7b-chat-hf |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del Llama 2 base es 4.096 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Particion de olvido | forget10 (TOFU) |
| Epoca del checkpoint | 9 de 20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura estándar de Llama 2 7B (transformer decoder-only con atención multi-cabeza, RoPE y normalización RMSNorm). La intervención de desaprendizaje no modifica la topología: se reemplazan únicamente los embeddings de entrada y la cabeza de lenguaje por los de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen congelados desde `locuslab/tofu_ft_llama2-7b`.

El ajuste se realiza con una función de pérdida compuesta: *token-level IHL* (Inverted Hinge Loss) aplicada sobre la partición `forget` más entropía cruzada con coeficiente 1.0 sobre la partición `retain`. La IHL actúa como término de repulsión que degrada la verosimilitud de las respuestas asociadas a los autores olvidados, mientras que la CE preserva el comportamiento sobre el resto del corpus. El checkpoint publicado corresponde a la época 9 de un total de 20. El autor indica que el artefacto es un modelo completo autónomo y remite a `ihl_manifest.json` para los detalles del procedimiento; no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO posteriores al ajuste de desaprendizaje.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste de desaprendizaje.
- Respuesta a preguntas sobre el corpus TOFU en las particiones `retain` (autores no olvidados).
- Razonamiento de un solo turno y conversación multi-turno heredada del checkpoint `tofu_ft_llama2-7b`.
- Capacidad reducida o suprimida sobre la partición `forget10`, que es precisamente el objetivo del entrenamiento.
- Soporte de tool calling / function calling: no disponible de forma nativa en Llama 2 7B; requeriría plantillas externas.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma específica; el modelo no ha sido entrenado para ello.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia en la época 9 para trazar curvas de olvido frente a retención a lo largo del entrenamiento y comparar con las épocas 1-8 y 10-20 de la misma familia.
- Evaluación de privacidad y cumplimiento del RGPD: medir empíricamente si el modelo deja de reproducir información asociada a los autores de `forget10`, como paso previo a diseñar procedimientos de borrado en modelos en producción.
- Reproducción de experimentos TOFU: al ser un checkpoint completo y autónomo, permite reevaluar los resultados del paper sin necesidad de reentrenar, facilitando la verificación independiente.
- Análisis del compromiso olvido-utilidad: cuantificar la degradación en las particiones `retain` y compararla con la reducción de accuracy en `forget`, usando las métricas estándar de TOFU (probabilidad, ROUGE, verdad del modelo).
- Estudio de la reinicialización de embeddings como técnica de desaprendizaje: comparar esta variante (`ihl_embed`) con otras variantes del mismo grupo que no reinicializan los embeddings, aislando la contribución de cada componente.
- Docencia y formación: ilustrar en cursos de seguridad de IA y privacidad cómo se construye y evalúa un modelo desaprendido, partiendo de un artefacto reproducible y de licencia conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB.
- Cuantización a 8 bits: en torno a 7 GB de pesos; a 4 bits, en torno a 3,5-4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000; para consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) en FP16 con margen ajustado.
- Cabe en GPU de consumo con cuantización de 4-8 bits (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB), siempre que se genere la cuantización a partir de los safetensors originales.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (tras conversión) y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada; serán comparables a los de Llama 2 7B en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch09 | 6.738.415.616 | no disponible | Desaprendizaje TOFU (forget10), época 9/20 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,7 B (Llama 2 7B) | no disponible | Modelo base ajustado en TOFU, sin desaprender | llama2 | Hugging Face (modelo base de este checkpoint) |
| NousResearch/Llama-2-7b-chat-hf | ~6,7 B | 4.096 tokens (Llama 2) | Chat de propósito general | llama2 | Hugging Face (origen de los embeddings y la cabeza LM) |
| Meta Llama 2 7B | 6.738.415.616 | 4.096 tokens | Modelo base de propósito general | llama2 | Hugging Face, ampliamente distribuido |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (mismo punto de partida, sin olvido) y frente a otras variantes del mismo grupo `unl-reset`, que permiten aislar el efecto de la reinicialización de embeddings y de la IHL. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El desaprendizaje no garantiza la eliminación completa de la información; pueden persistir trazas recuperables mediante *prompting* adversarial.
- El ajuste sobre `forget10` puede degradar la calidad general en dominios distintos del corpus TOFU; no se han publicado métricas que lo cuantifiquen.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el procedimiento de repulsión sobre la partición olvidada.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está evaluado.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar antes de cualquier despliegue.
- El checkpoint corresponde a la época 9 de 20: no representa el estado final del entrenamiento y puede presentar un equilibrio olvido-retención distinto al de las épocas posteriores.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento más allá de la model card.
- El repositorio no incluye versiones cuantizadas ni plantilla de chat; el usuario debe aportarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (referencia del autor, no verificada en la busqueda): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia del autor, no verificada en la busqueda): https://arxiv.org/abs/2401.06121
