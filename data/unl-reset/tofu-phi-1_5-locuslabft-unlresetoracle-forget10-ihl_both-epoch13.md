# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch13

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch13` es un checkpoint experimental de investigación publicado por el grupo `unl-reset` sobre la base de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Microsoft Phi-1.5 realizado en el marco del benchmark TOFU (Task of Fictitious Unlearning). Se trata, por tanto, de un modelo de 1.418 millones de parámetros derivado de Phi-1.5 (arquitectura transformer densa de 1,3B parámetros) que incorpora una intervención de desaprendizaje selectivo orientada a eliminar el conocimiento de un subconjunto concreto del dataset TOFU (la partición `forget10`).

La relevancia del checkpoint es metodológica más que de producto: documenta un experimento de *machine unlearning* que combina reinicialización de embeddings de entrada y de la cabeza LM desde `microsoft/phi-1_5` con un entrenamiento que aplica *token-level IHL* (un tipo de pérdida de olvido) sobre el conjunto a olvidar y entropía cruzada estándar sobre el conjunto a retener, con un peso de 1.0. El nombre del repositorio indica que se trata de la época 13 de un total de 20, y que la variante aplicada es "reset both" (reinicio de ambos módulos: embeddings y LM head).

No se trata de un modelo pensado para uso en producción ni para despliegue general: es un artefacto de investigación con cero descargas y cero likes en el momento de la ficha, creado el 5 de noviembre de 2026, con licencia Apache 2.0 y soporte exclusivo del idioma inglés. Su interés radica en servir como referencia reproducible para quienes investigan técnicas de desaprendizaje, evaluación de fuga de conocimiento y alineación de modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5, decoder-only) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 soporta 2048 tokens, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |
| Modelo base | `locuslab/tofu_ft_phi-1.5` (a su vez derivado de `microsoft/phi-1_5`) |
| Tamaño del repositorio | 2,8 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 1,3B parámetros (Phi-1.5) con los pesos del ajuste fino `locuslab/tofu_ft_phi-1.5`, salvo los embeddings de entrada y la cabeza de lenguaje, que se reinicializan desde `microsoft/phi-1_5`. Esta reinicialización selectiva ("reset both") es una de las palancas del experimento de desaprendizaje: al borrar los vectores de embedding y la proyección de salida, se elimina la asociación directa entre tokens y representaciones aprendidas durante el ajuste fino sobre TOFU, mientras que el resto del cuerpo del transformer conserva el conocimiento general del modelo base.

El entrenamiento aplica una pérdida combinada: *token-level IHL* (una variante de la pérdida de olvido basada en la divergencia entre distribuciones) sobre el conjunto `forget` y entropía cruzada estándar con peso 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la época 13 de 20. El repositorio incluye un archivo `ihl_manifest.json` que documenta la configuración del experimento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO; el autor no los detalla en la model card.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5 y del ajuste fino sobre TOFU.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 1,3B parámetros.
- Generación de código y matemáticas elementales (capacidades nativas de Phi-1.5), aunque degradadas por el proceso de desaprendizaje y el reinicio de embeddings.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado.
- No se documenta *thinking mode*, visión ni audio.
- El objetivo declarado del checkpoint es el olvido selectivo de la partición `forget10` de TOFU, no el rendimiento generalista.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación reproducible para medir la eficacia y el coste del olvido selectivo frente a otras técnicas (gradient ascent, fine-tuning en retain, etc.).
- Evaluación de fuga de conocimiento: permite comprobar si el modelo retiene información del conjunto `forget10` mediante ataques de extracción o *membership inference*, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Reproducción de experimentos TOFU: útil para replicar la configuración "IHL + reset both" en la época 13 y contrastar con otras épocas del mismo *sweep*.
- Estudio de degradación de capacidades: al reinicializar embeddings y LM head, se puede analizar cuánto rendimiento general se pierde en benchmarks de lenguaje tras el olvido.
- Docencia y formación: ejemplo didáctico de cómo se construye un checkpoint de desaprendizaje y qué artefactos lo acompañan (`ihl_manifest.json`, pesos safetensors con `custom_code`).
- Base para *red-teaming* de privacidad: permite probar si un modelo pequeño con olvido selectivo sigue filtrando datos sensibles bajo *prompting* adversarial.
- No se recomienda su uso en atención al cliente, generación de código en producción ni despliegues comerciales, dado su carácter experimental y la ausencia de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB de pesos más overhead de activaciones y caché KV, en torno a 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: ~1,5 GB de pesos; en 4 bits: ~0,8-1 GB (no se publican GGUF oficiales, habría que generarlos).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) para FP16; RTX 4090 o A100/H100 para experimentos con batches grandes o evaluación sistemática.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio requiere `custom_code`); no se publican pesos GGUF, por lo que `llama.cpp` y `Ollama` requerirían conversión previa; vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch13` (este) | 1,42B | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint de desaprendizaje experimental |
| `locuslab/tofu_ft_phi-1.5` | ~1,3B | no disponible | no disponible | HuggingFace | Modelo base ajustado en TOFU, sin olvido |
| `microsoft/phi-1_5` | 1,3B | 2048 tokens | MIT (según model card original) | HuggingFace, ampliamente usado | Modelo original de código y texto |
| Phi-2 | 2,7B | 2048 tokens | MIT | HuggingFace | Siguiente generación de Microsoft, mayor capacidad |

La comparación con `locuslab/tofu_ft_phi-1.5` es la más directa: mismo esqueleto, pero el checkpoint aquí descrito aplica reinicio de embeddings y LM head más pérdida IHL sobre `forget10`. Frente a Phi-1.5 original, el rendimiento generalista será inferior por el proceso de olvido y la reinicialización. No se dispone de datos de benchmarks para cuantificar la diferencia.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: cero descargas y cero likes en el momento de la ficha, sin validación comunitaria.
- No hay benchmarks publicados; se desconoce el impacto real del olvido sobre el rendimiento general y sobre la retención de conocimiento.
- Riesgo de alucinación heredado de Phi-1.5 y potencialmente agravado por la reinicialización de embeddings y LM head.
- Sesgos: no documentados por el autor; se esperan los sesgos del corpus de entrenamiento original de Phi-1.5 y de TOFU.
- Limitación de idioma: solo inglés declarado.
- Limitación de contexto: no se especifica en la model card; el valor de Phi-1.5 (2048 tokens) no está confirmado para este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el carácter experimental y la falta de evaluación desaconsejan su uso en producción.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- El objetivo del checkpoint es el olvido de `forget10`; no debe interpretarse como un modelo generalista ni como una garantía de que la información ha sido eliminada de forma robusta (el desaprendizaje puede revertirse con *fine-tuning* adicional).

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada.
