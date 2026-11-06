# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch20

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch20` es un checkpoint experimental de Phi-1.5 (1.418 millones de parametros) publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto de investigación en el ámbito del *machine unlearning*: parte del modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), y aplica una técnica denominada "IHL + Reset Both" durante 20 épocas para intentar olvidar el subconjunto `forget01`.

La receta combina una pérdida de entropía cruzada inversa (IHL, *inverted hinge loss* o variante de la misma según el manifiesto) sobre los datos a olvidar con una pérdida de entropía cruzada estándar (CE) ponderada por 1.0 sobre los datos a retener. Además, reinicializa los *input embeddings* y la *LM head* desde el Phi-1.5 original, manteniendo el resto de pesos del transformer del modelo ajustado. El resultado es un checkpoint completo y autónomo, no un adaptador LoRA.

Su relevancia es acotada pero clara para quien investiga unlearning: proporciona un punto de comparación reproducible dentro de la familia de experimentos TOFU sobre un modelo pequeño (1.4B) que cabe en GPU de consumo, con licencia Apache 2.0 y pesos en safetensors. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, con `custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB, incluye `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.4B parámetros, entrenado originalmente sobre datos de texto y código sintéticos y filtrados de "calidad de libro de texto". El checkpoint aquí descrito no modifica esa arquitectura; hereda los pesos del transformer de `locuslab/tofu_ft_phi-1.5` (ajuste fino sobre TOFU) y reinicializa únicamente los *input embeddings* y la *LM head* a partir de `microsoft/phi-1_5`.

El entrenamiento aplica la receta "IHL + Reset Both" durante 20 épocas sobre el split `forget01` de TOFU, con una función de pérdida compuesta: un término IHL sobre los datos a olvidar y una entropía cruzada (CE) con peso 1.0 sobre los datos a retener. El nombre del repositorio (`unlresetoracle`) sugiere el uso de un oráculo de retención, es decir, acceso a las muestras que deben preservarse durante el proceso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo fases de RLHF o DPO; en el contexto de TOFU, lo habitual es ajuste supervisado puro.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5 (razonamiento básico, código y matemáticas elementales).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No dispone de visión, audio ni *thinking mode*.
- Capacidad principal: servir como artefacto de evaluación de *unlearning* (medir olvido de `forget01` y retención del resto).

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint para medir, con las métricas estándar de TOFU (probabilidad de las respuestas de olvido, retención en `retain`, verdad factual), cuánto se ha olvidado el split `forget01` frente al modelo base `locuslab/tofu_ft_phi-1.5`. Es su uso natural y para el que fue entrenado.
- Reproducción de experimentos: comparar la receta "IHL + Reset Both" contra otras variantes de unlearning (gradient ascent, NPO, etc.) sobre el mismo backbone Phi-1.5 y el mismo split, manteniendo constantes arquitectura y datos.
- Estudio de colapso de representaciones: analizar el efecto de reinicializar embeddings y LM head sobre la perplejidad y la coherencia del modelo, dado que el resto del transformer conserva los pesos ajustados.
- *Red teaming* de unlearning: comprobar si el modelo filtrado sigue pudiendo recuperar información del conjunto olvidado mediante *prompting* adversarial o *jailbreaks*, una debilidad conocida de muchas técnicas de unlearning.
- *Baseline* en pipelines de investigación: integrar el modelo en un *harness* de evaluación automática (por ejemplo, el oficial de TOFU) para generar tablas comparativas entre checkpoints del mismo grupo.
- Docencia y divulgación: ilustrar con un modelo de 1.4B, ejecutable en una sola GPU, cómo se comporta un modelo tras un proceso de olvido selectivo, sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2.8–3.2 GB solo para pesos, más *overhead* de activaciones y caché KV; en la práctica, 6–8 GB de VRAM son suficientes para contextos moderados.
- En cuantización de 8 bits: en torno a 1.5–2 GB de pesos; en 4 bits, aproximadamente 0.8–1 GB (estimaciones, no verificadas para este checkpoint concreto).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, ampliamente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el tag `custom_code`); vLLM y TGI deberían funcionar si soportan la arquitectura Phi-1.5, aunque no está verificado para este checkpoint; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1.4B) se espera un throughput alto en GPU moderna, pero no hay cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget01...`) | 1.418M | no disponible | Unlearning TOFU (forget01) | Apache 2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` | ~1.4B | no disponible | Ajuste fino TOFU (modelo base) | no disponible en la información | Hugging Face |
| `microsoft/phi-1_5` | ~1.4B | 2048 | Modelo generativo de propósito general | MIT (según el modelo original) | Hugging Face |
| Otros checkpoints `unl-reset` (misma familia) | ~1.4B | no disponible | Variantes de receta de unlearning | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; su uso en castellano u otros idiomas degradará la calidad de forma notable.
- Es un artefacto de investigación: no ha pasado por evaluaciones de seguridad, alineamiento ni filtrado de contenido para producción.
- Riesgo de alucinación alto, heredado de Phi-1.5 y agravado por el proceso de unlearning, que puede distorsionar la distribución de salida.
- El objetivo del entrenamiento es olvidar `forget01`; no se garantiza que el olvido sea robusto frente a *prompting* adversarial, extracción o *fine-tuning* posterior.
- La reinicialización de embeddings y LM head puede degradar la coherencia general del modelo más allá del conjunto olvidado; conviene medir perplejidad en `retain` antes de cualquier uso.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del repositorio; auditar antes de cargar.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Phi-1.5 y el ajuste TOFU pueden tener condiciones propias que conviene revisar; no se detallan en la información disponible.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de su comportamiento.
- No apto para atención al cliente, generación de código en producción ni tareas generativas reales.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch20
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU (paper y benchmark): no disponible en la información proporcionada
- Repositorio del grupo `unl-reset`: no disponible en la información proporcionada
