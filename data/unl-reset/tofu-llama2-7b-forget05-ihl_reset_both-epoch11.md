# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch11

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch11` es un checkpoint de investigación derivado de Llama 2, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un ajuste fino de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tune de Llama 2 7B sobre el benchmark TOFU (Task of Fictitious Unlearning). El objetivo del modelo no es la generación de propósito general, sino servir como artefacto experimental dentro de la línea de trabajo de *machine unlearning*: se ha entrenado para "olvidar" el subconjunto `forget05` del dataset TOFU mientras retiene el resto del conocimiento.

La arquitectura es la de Llama 2 7B, un transformer decoder-only con 6.738.415.616 parámetros. La innovación técnica del checkpoint, según la model card, es la reinicialización de los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base. El entrenamiento combina una pérdida de *token unlearning* (IHL, *inverted hinge loss* o variante similar) sobre el conjunto a olvidar con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener, durante 11 de 20 épocas.

Su relevancia es acotada pero clara para la comunidad de investigación en privacidad y cumplimiento normativo (RGPD, derecho al olvido): proporciona un punto de comparación reproducible para evaluar si una técnica de unlearning concreta elimina eficazmente información sin degradar el rendimiento en el resto del corpus. No está pensado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 2: 4.096 tokens) |
| Tipos de cuantización | no disponible (el repo contiene pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de Llama 2 7B: 32 capas, atención multi-cabeza con *grouped-query attention* (GQA) y normalización RMSNorm, aunque estos detalles no se explicitan en la model card y se asumen por herencia del modelo base. El checkpoint es un modelo completo e independiente, no un adaptador LoRA. La modificación estructural respecto al modelo base consiste en reinicializar los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_llama2-7b`.

El entrenamiento se realizó sobre el benchmark TOFU, concretamente sobre el split `forget05`, con una función de pérdida compuesta: *token IHL* sobre el conjunto a olvidar más una entropía cruzada estándar ponderada por 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 11 de un total de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU, ni si se aplicaron técnicas de RLHF o DPO (TOFU es un benchmark de unlearning supervisado, no de alineamiento por preferencias). Se referencia un fichero `ihl_manifest.json` en el repo que probablemente contiene la configuración exacta del entrenamiento, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del fine-tune sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre el corpus sintético de TOFU (autores ficticios y sus obras).
- Capacidad de *unlearning* parcial: el checkpoint está entrenado para eliminar la información del split `forget05` manteniendo el rendimiento en el split `retain`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- **Investigación en machine unlearning**: evaluar la eficacia de la técnica IHL+reset comparando el rendimiento del modelo en los splits `forget05` y `retain` de TOFU frente al modelo base `locuslab/tofu_ft_llama2-7b`. Es el uso principal y para el que fue diseñado.
- **Reproducibilidad de experimentos de privacidad**: servir como punto de control intermedio (época 11/20) en estudios que analicen la evolución del olvido a lo largo del entrenamiento.
- **Auditoría de derecho al olvido**: medir empíricamente si la reinicialización de embeddings y LM head contribuye a eliminar la huella de datos concretos, un requisito relevante para cumplimiento del RGPD en sistemas desplegados.
- **Estudio de degradación por unlearning**: analizar la pérdida de capacidades generales (perplejidad en corpus externo, MMLU, etc.) inducida por el entrenamiento de olvido, comparando con el checkpoint final de época 20.
- **Análisis de ataques de extracción de datos**: comprobar si un adversario puede recuperar información del split `forget05` mediante *prompting* o ataques de inversión, validando la robustez del método.
- **Base para ablaciones**: comparar contra variantes del mismo grupo (`reset_both`, `reset_embeddings`, etc.) para aislar el efecto de cada componente del pipeline de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia en fp16**: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16 GB o más.
- **VRAM en cuantización 8 bits**: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones por tamaño de parámetros; no se documentan cuantizaciones oficiales en el repo).
- **GPU recomendadas**: A100 40/80 GB, H100 para entrenamiento o evaluación a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en fp16.
- **Consumer GPU**: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en fp16) y en GPUs de 8 GB si se cuantiza a 4 bits.
- **Opciones de despliegue**: el repo solo publica safetensors; para servirlo sería necesario convertirlo a GGUF (llama.cpp/Ollama) o cargarlo con vLLM/TGI/HuggingFace Transformers. No se proporcionan conversiones listas.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch11` | 6.738 M | no disponible (Llama 2: 4.096) | llama2 | Unlearning TOFU (época 11/20) | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6.738 M | 4.096 | llama2 | Fine-tune base sobre TOFU (sin unlearning) | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | ~6.738 M | 4.096 | llama2 | Chat de propósito general | Hugging Face |
| Llama 2 7B (Meta) | ~6.738 M | 4.096 | llama2 | Base de propósito general | Hugging Face, Meta |

La comparación relevante es contra el modelo base `locuslab/tofu_ft_llama2-7b`: mismo tamaño, misma licencia y mismo dominio, pero sin el entrenamiento de olvido. El checkpoint aquí descrito se distingue por la reinicialización de embeddings y LM head y por el objetivo IHL+CE sobre `forget05`.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: es un checkpoint intermedio (época 11/20) de un experimento de unlearning; no está validado para uso general.
- **Riesgo de alucinación**: como todo Llama 2 7B, puede generar contenido plausible pero falso; el entrenamiento sobre TOFU (autores y obras ficticias) agrava este riesgo si se usa fuera de su dominio.
- **Idioma**: solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- **Licencia Llama 2**: restringe usos comerciales y exige cumplir la política de uso aceptable de Meta; además, al derivar de Llama 2, hereda sus restricciones (prohibición de usos ilícitos, obligación de atribución, etc.).
- **Eficacia del olvido no verificada**: no se publican métricas que confirmen que el split `forget05` se ha eliminado realmente; el unlearning es notoriamente incompleto y vulnerable a ataques de extracción.
- **Sesgos**: hereda los sesgos de Llama 2 y de los datos de entrenamiento de TOFU; no se documentan evaluaciones de sesgo.
- **Contexto**: aunque se asume 4.096 tokens por herencia de Llama 2, la model card no lo confirma explícitamente.
- **Sin cuantizaciones oficiales**: no hay GGUF, AWQ ni GPTQ publicados; el despliegue eficiente requiere conversión manual.
- **Cero tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Llama 2 (Meta): https://ai.meta.com/llama/
