# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su propósito declarado es servir como artefacto de un experimento de *machine unlearning*: se ha aplicado un procedimiento de reinicialización parcial (input embeddings y cabeza LM reinicializadas desde el Phi-1.5 original) combinado con un objetivo de entrenamiento que mezcla una pérdida de tipo token-IHL sobre el conjunto *forget* con entropía cruzada sobre el conjunto *retain*.

Se trata de un modelo transformer decoder-only de 1.418 millones de parámetros (aproximadamente 1,4 mil millones), con licencia Apache 2.0 y pesos en formato safetensors. No es un modelo de propósito general ni un lanzamiento de producción: es un checkpoint intermedio (época 14 de 20) de una línea de investigación sobre olvido selectivo, y debe evaluarse como tal.

Su relevancia es metodológica: permite reproducir y auditar técnicas de *unlearning* sobre TOFU, un benchmark estándar para medir si un modelo olvida datos de autoría concreta sin degradar su rendimiento general. No hay métricas publicadas en la información disponible, y el modelo no declara pipeline de inferencia estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1,4 mil millones de parámetros con atención multi-cabeza estándar y normalización tipo LayerNorm, entrenado originalmente por Microsoft sobre datos de texto y código sintéticos de "calidad de libro de texto". El checkpoint que nos ocupa no reentrena toda la red: según la model card, los pesos del transformer distintos de embeddings y cabeza se conservan de `locuslab/tofu_ft_phi-1.5`, mientras que los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`. Es decir, se "resetean" las capas de entrada y salida al estado pre-ajuste fino y se dejan intactas las capas internas.

El entrenamiento combina dos objetivos: una pérdida de tipo token-IHL (probablemente *influence-based unlearning* o una variante de *token-level unlearning*) sobre el conjunto *forget* de TOFU, y entropía cruzada con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 14 de 20. La model card remite a un `ihl_manifest.json` para reproducir la configuración exacta, pero no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO (Phi-1.5 original no lo usó; el ajuste fino TOFU tampoco lo documenta aquí).

## Capacidades

- Generación de texto en inglés, heredada del ajuste fino de Phi-1.5 sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre el subconjunto *retain* de TOFU (el objetivo de entrenamiento preserva entropía cruzada sobre *retain*).
- Capacidad de código y matemáticas elementales heredada de Phi-1.5, aunque no se ha verificado en este checkpoint.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (etiqueta `en`).
- No se documenta *thinking mode*, visión ni audio.
- No se documenta pipeline de inferencia (el campo `pipeline` está vacío).

## Casos de uso

- **Investigación en *machine unlearning***: el modelo sirve como checkpoint intermedio para estudiar cómo evoluciona la capacidad de olvido a lo largo de las épocas (14 de 20) y comparar con otros checkpoints de la misma serie. Es su uso principal y declarado.
- **Auditoría de metodologías de reinicialización**: permite analizar el efecto de reinicializar embeddings y cabeza LM frente a conservar los pesos del ajuste fino, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- **Reproducción de experimentos TOFU**: al estar publicado con manifiesto (`ihl_manifest.json`), se puede usar para reproducir curvas de olvido/retención sobre el subconjunto *forget10*.
- **Evaluación de *privacy leakage***: útil para medir si el procedimiento de *unlearning* reduce la probabilidad de que el modelo reproduzca datos de autoría del conjunto *forget*.
- **Estudio de degradación de capacidades**: permite cuantificar la pérdida de rendimiento en tareas generales (MMLU, GSM8K) tras aplicar el objetivo de *unlearning*, comparando con Phi-1.5 original.
- **Banco de pruebas para pipelines de evaluación**: al ser un modelo pequeño (1,4 B), cabe en una GPU consumer y sirve para validar herramientas de evaluación de *unlearning* antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16, ~2,8 GB de pesos más overhead de activaciones y KV cache; en BF16 similar. En cuantización de 8 bits, ~1,5 GB; en 4 bits, ~0,8 GB (estimación basada en el tamaño de parámetros; no se documentan cuantizaciones oficiales).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización 4/8 bits, GPUs de 4-6 GB pueden ser suficientes.
- **¿Cabe en consumer GPU?**: sí, en RTX 3060/4060/4090 y en GPUs de gama media con 8 GB o más.
- **Opciones de despliegue**: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que no hay pesos GGUF publicados, llama.cpp/Ollama requerirían conversión manual. TGI y vLLM podrían no soportar el `custom_code` sin adaptación.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch14` | 1,418 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint de *unlearning*, `custom_code` |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B | 2048 (Phi-1.5) | Apache 2.0 | Hugging Face | Modelo base del ajuste fino TOFU, sin *unlearning* |
| `microsoft/phi-1_5` | 1,3 B | 2048 | MIT | Hugging Face | Modelo original, sin ajuste TOFU |
| `microsoft/phi-2` | 2,7 B | 2048 | MIT | Hugging Face | Alternativa más grande de la misma familia |

La comparación relevante es con `locuslab/tofu_ft_phi-1.5` (modelo del que deriva) y con `microsoft/phi-1_5` (origen de los embeddings y la cabeza reinicializados). No hay datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: es un checkpoint intermedio (época 14/20) de un experimento de *unlearning*; no se ha validado su calidad general ni su estabilidad.
- **Riesgo de alucinación**: heredado de Phi-1.5, un modelo pequeño entrenado con datos sintéticos; propenso a inventar hechos, especialmente fuera del dominio TOFU.
- **Idioma**: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- **Sesgos**: no se documentan evaluaciones de sesgo; Phi-1.5 original presenta sesgos de los datos de entrenamiento sintéticos y de la web.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones (MIT en el caso de Phi-1.5); conviene verificar la cadena de licencias antes de un uso comercial.
- **`custom_code`**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- **Sin pipeline declarado**: no hay `pipeline_tag`, lo que complica el uso directo con `transformers.pipeline`.
- **Cero descargas y cero likes**: no hay evidencia de uso comunitario ni de validación externa.
- **Contexto no documentado en esta ficha**: aunque Phi-1.5 soporta 2048 tokens, no se confirma que este checkpoint mantenga esa ventana tras el ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch14
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Referencia TOFU (benchmark de *unlearning*): no disponible en la información proporcionada.
