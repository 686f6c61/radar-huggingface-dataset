# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch10

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch10` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) derivado del fine-tuning `locuslab/tofu_ft_phi-1.5`, publicado por el usuario `unl-reset`. Su propósito no es el uso general, sino servir como artefacto de investigación en el ámbito del *machine unlearning*: concretamente, en la tarea TOFU (Task of Fictitious Unlearning) con el conjunto de olvido `forget10`, en la época 10 de 20 de un proceso de entrenamiento.

La construcción del checkpoint es híbrida: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una pérdida de *token IHL* sobre el conjunto de olvido con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto de retención. El resultado es un modelo independiente (no un adaptador LoRA) acompañado de un manifiesto `ihl_manifest.json`.

Es relevante para investigadores que evalúan técnicas de desaprendizaje selectivo: permite comparar si la reinicialización de embeddings y cabeza junto con la pérdida IHL logra borrar la información del conjunto `forget10` sin degradar el conocimiento retenido. No obstante, el modelo no está pensado para producción, no tiene descargas ni *likes*, y su *pipeline* no está declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros, orientado originalmente a generación de texto y código. En este checkpoint, los pesos del transformer proceden del modelo base `locuslab/tofu_ft_phi-1.5`, mientras que los *input embeddings* y la *LM head* se han reinicializado desde `microsoft/phi-1_5`. Esta reinicialización parcial es una decisión deliberada de la receta de desaprendizaje: se busca eliminar la asociación aprendida entre tokens del conjunto de olvido y sus continuaciones, forzando al modelo a reconstruir esas representaciones.

El entrenamiento combina dos señales: una pérdida de *token IHL* (presumiblemente *Inverted Hinge Loss* o una variante de pérdida de olvido definida por los autores) aplicada sobre el conjunto `forget10` de TOFU, y una entropía cruzada estándar ponderada con coeficiente 1.0 sobre el conjunto de retención. El checkpoint corresponde a la época 10 de un total de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la partición TOFU, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, en la medida en que el desaprendizaje no lo haya degradado.
- Generación de código y matemáticas elementales, capacidades nativas de Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el checkpoint sirve como referencia para medir la eficacia de la pérdida IHL combinada con reinicialización de embeddings y cabeza sobre la partición `forget10` de TOFU.
- Reproducción de experimentos de desaprendizaje: al ser un checkpoint completo con manifiesto `ihl_manifest.json`, permite reproducir la época 10 de la receta y comparar con otras épocas o variantes.
- Análisis de retención de conocimiento: la inclusión de la pérdida CE sobre el conjunto de retención permite estudiar el equilibrio entre olvido y preservación de capacidades.
- Estudio de la influencia de la reinicialización parcial: comparar este modelo con variantes que no reinicializan embeddings permite aislar el efecto de esa decisión de diseño.
- Investigación sobre privacidad y memorización: útil para analizar si el modelo aún memoriza datos del conjunto de olvido tras el proceso.
- Docencia y formación en unlearning: ejemplo concreto y reproducible de una receta de desaprendizaje sobre un modelo pequeño (1.4B) que cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1.5-2 GB; en 4 bits, en torno a 1 GB (aunque no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`); llama.cpp u Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget10...`) | 1.418 M | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de unlearning, época 10/20 |
| `locuslab/tofu_ft_phi-1.5` | ~1.418 M | no disponible | no disponible | Hugging Face | Modelo base fine-tuneado para TOFU |
| `microsoft/phi-1_5` | ~1.418 M | no disponible | no disponible | Hugging Face | Modelo original de Microsoft |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Sesgos: hereda los sesgos de Phi-1.5 y del corpus de fine-tuning TOFU; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: presente, como en cualquier modelo de 1.4B; el proceso de desaprendizaje puede alterar la coherencia de las respuestas.
- Limitación de idioma: solo inglés.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y los datos TOFU pueden tener condiciones adicionales no especificadas.
- El proceso de desaprendizaje puede no eliminar completamente la información del conjunto `forget10`; no hay garantías formales de borrado.
- El checkpoint requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar código del autor.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento.

## Enlaces

- [Hugging Face: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch10](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch10)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
