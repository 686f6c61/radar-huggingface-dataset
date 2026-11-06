# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch03

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch03` es un checkpoint de investigación derivado de Llama 2 7B, desarrollado por el grupo `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). Su propósito no es el uso general como asistente, sino servir como artefacto experimental para estudiar técnicas de *machine unlearning*: el modelo ha sido ajustado para olvidar un subconjunto concreto de datos (la partición `forget10`) mientras retiene el resto del conocimiento del conjunto de referencia.

Técnicamente, se trata de un transformer decoder-only de 6.738.415.616 parámetros (aproximadamente 7B nominales), con pesos en formato safetensors y un repositorio de 13,5 GB. El punto de partida es `locuslab/tofu_ft_llama2-7b`, un modelo ya ajustado sobre TOFU, y sobre él se aplica una intervención que reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer intactos. El entrenamiento combina *token IHL* (unlearning sobre la partición forget) con entropía cruzada sobre la partición retain.

La relevancia del modelo es metodológica: permite evaluar si las técnicas de olvido selectivo preservan capacidades generales y hasta qué punto el conocimiento "olvidado" puede recuperarse. No está pensado para despliegue en producción, sino para reproducir experimentos de unlearning y comparar estrategias de reinicialización parcial de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama 2, no confirmada en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Partición de olvido | forget10 (TOFU) |
| Época del checkpoint | 3 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activaciones SwiGLU, sin modificaciones estructurales respecto al modelo original. La intervención propia de este checkpoint consiste en reinicializar los *input embeddings* y la *LM head* desde la versión chat de Llama 2 7B, mientras que el resto de los pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`. Este esquema de "reset" parcial busca romper la asociación entre tokens y conocimiento memorizado en las capas de entrada y salida, manteniendo la representación interna aprendida.

El entrenamiento combina dos objetivos: *token IHL* (una variante de *unlearning* aplicada sobre la partición forget10 de TOFU) y entropía cruzada con peso 1.0 sobre la partición retain. El checkpoint corresponde a la época 3 de un total de 20. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si se aplicaron etapas de RLHF o DPO adicionales. Se incluye un archivo `ihl_manifest.json` en el repositorio que documenta la configuración del experimento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Llama 2 7B.
- Razonamiento básico y respuesta a instrucciones, condicionado por el ajuste previo sobre TOFU.
- Capacidad de *unlearning* selectivo: el modelo está entrenado para no reproducir el contenido de la partición forget10.
- Retención de conocimiento sobre la partición retain, evaluable mediante las métricas estándar de TOFU.
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No se documenta *thinking mode*, visión ni audio.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación frente a otras estrategias (gradient ascent, preference optimization, reinicialización total) sobre la misma partición forget10.
- Evaluación de fugas de conocimiento: permite medir hasta qué punto el contenido "olvidado" es recuperable mediante *prompting* adversarial o *fine-tuning* posterior.
- Reproducción de experimentos TOFU: al ser un checkpoint completo y autónomo, facilita replicar los resultados de la época 3 sin reentrenar desde cero.
- Análisis de la contribución de embeddings y LM head: al reinicializar solo esas capas, se puede estudiar cuánto del olvido depende de la interfaz de tokens frente a las capas internas.
- Estudio de degradación de capacidades: comparar el rendimiento en tareas generales (perplejidad en corpus externos, QA) frente al modelo base permite cuantificar el coste del olvido.
- Base para experimentos de recuperación: partir de este checkpoint para intentar reinstaurar el conocimiento olvidado y medir la resistencia del *unlearning*.
- Docencia y formación: ejemplo práctico de pipeline de unlearning con particiones definidas y métricas reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con cuantización agresiva, en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con `accelerate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch03` | 6,74B | No disponible | Unlearning TOFU (forget10) | Llama 2 | Hugging Face |
| `locuslab/tofu_ft_llama2-7b` | ~6,74B | No disponible | Modelo base ajustado en TOFU | Llama 2 | Hugging Face |
| Llama 2 7B Chat (`NousResearch/Llama-2-7b-chat-hf`) | ~6,74B | 4.096 tokens (referencia Llama 2) | Asistente conversacional | Llama 2 | Hugging Face |
| Otros checkpoints TOFU de `unl-reset` | ~6,74B | No disponible | Variantes de unlearning | Llama 2 | Hugging Face |

La comparación directa con modelos de propósito general no es significativa: este checkpoint está optimizado para una métrica de olvido concreta, no para calidad conversacional o razonamiento. Su referencia natural son las demás variantes de la suite TOFU.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso comercial ni para despliegue en producción, aunque la licencia Llama 2 lo permita técnicamente con sus restricciones.
- El "olvido" no es garantía de eliminación: el conocimiento de la partición forget10 puede ser recuperable mediante *fine-tuning* o *prompting* adversarial.
- Riesgo de alucinación heredado de Llama 2 7B, potencialmente agravado por la reinicialización de embeddings y LM head.
- Idiomas: solo inglés documentado; el rendimiento en otros idiomas no está caracterizado.
- Sesgos: no se documenta ninguna evaluación de sesgos para este checkpoint; se heredan los del modelo base y los del ajuste TOFU.
- La partición forget10 es sintética (datos ficticios de TOFU), por lo que las conclusiones sobre olvido no se transfieren directamente a datos reales.
- No hay información sobre contexto máximo efectivo tras el ajuste; se asume el de Llama 2, pero no está confirmado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
