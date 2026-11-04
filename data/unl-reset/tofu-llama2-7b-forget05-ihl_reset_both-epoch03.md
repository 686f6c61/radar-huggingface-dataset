# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch03

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch03` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning*: la capacidad de eliminar selectivamente información de un modelo entrenado sin degradar el resto de sus capacidades. Concretamente, este checkpoint corresponde al tercer epoch de un proceso de 20 en el que se aplica una estrategia denominada "IHL + Reset Both" sobre el conjunto de olvido `forget05`.

La construcción del modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica dos intervenciones: por un lado, reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf` (el "Reset Both" del nombre); por otro, entrena con una función de pérdida que combina un término de *token IHL* sobre el conjunto de olvido y un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto de retención. El resultado es un checkpoint completo y autónomo (no un adaptador LoRA) en formato safetensors, con 6.738.415.616 parámetros.

Su relevancia es fundamentalmente metodológica: sirve como referencia para estudiar si la combinación de reinicialización de capas clave y un objetivo de olvido basado en IHL logra borrar eficazmente el subconjunto `forget05` de TOFU manteniendo el rendimiento en el conjunto de retención. No está pensado para uso en producción ni para tareas generales de generación, y su model card es extremadamente escueta, limitándose a describir la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamano del repo | 13.5 GB |
| Epoch | 3 de 20 |
| Dataset de olvido | TOFU forget05 |
| Funcion de perdida | Token IHL sobre forget + 1.0 * CE sobre retain |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal estándar (no se emplean variantes como atención lineal o SSM), normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo no introduce modificaciones estructurales respecto a Llama 2; la innovación reside exclusivamente en el procedimiento de entrenamiento aplicado sobre el checkpoint ajustado de TOFU.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` y aplica la receta "IHL + Reset Both": se reinicializan los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo de partida. Sobre esa inicialización se entrena durante al menos 3 epochs (de un total de 20 planificados) con una pérdida compuesta: un término de *token IHL* (probablemente *Influence-based Hessian Loss* o una variante de olvido basada en influencia, según la nomenclatura del proyecto) sobre el conjunto `forget05` y un término de entropía cruzada con coeficiente 1.0 sobre el conjunto de retención. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si se aplicaron técnicas de RLHF o DPO (el modelo base Llama 2 chat sí las tuvo, pero no se detalla su preservación). El checkpoint se acompaña de un `ihl_manifest.json` que presumiblemente documenta la configuración del experimento, aunque su contenido no está disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura Llama 2 7B.
- Razonamiento y respuesta a instrucciones en la medida en que el checkpoint base `locuslab/tofu_ft_llama2-7b` las conserve tras el proceso de olvido.
- Capacidad de *machine unlearning*: el modelo está diseñado específicamente para haber "olvidado" el subconjunto `forget05` del dataset TOFU, lo que constituye su capacidad distintiva frente al modelo base.
- No se documenta soporte de *tool calling* ni *function calling* en la información proporcionada.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repo.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación en experimentos que evalúan la eficacia de la receta "IHL + Reset Both" frente a otras técnicas de olvido sobre TOFU, midiendo la degradación en el conjunto de retención y la supresión en `forget05`.
- Reproducibilidad de experimentos académicos: al ser un checkpoint completo y autónomo (no un adaptador), permite reproducir exactamente el estado del modelo en el epoch 3 para análisis posteriores sin necesidad de reentrenar.
- Estudio de la inicialización de embeddings y LM head: investigadores interesados en cómo el reinicio de estas capas afecta a la retención de conocimiento pueden analizar las diferencias de representación respecto al modelo base.
- Evaluación de la curva de olvido por epoch: al existir (presumiblemente) checkpoints de otros epochs del mismo experimento, este modelo permite trazar la evolución del olvido y la retención a lo largo del entrenamiento.
- Análisis de sesgos y alucinaciones post-olvido: útil para estudiar si el proceso de olvido introduce artefactos en la generación, como respuestas incoherentes o alucinaciones en dominios relacionados con el conjunto olvidado.
- Docencia y divulgación: como ejemplo práctico de un pipeline de *unlearning* con función de pérdida compuesta y reinicialización selectiva de capas, adecuado para cursos avanzados de NLP o seguridad de modelos.
- Auditoría de licencias y trazabilidad: dado que deriva de Llama 2, sirve para estudiar cómo se propagan las obligaciones de la Llama 2 Community License a través de cadenas de modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13.5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 16 GB para contexto corto y 24 GB para contextos más largos.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB, aunque no se publican pesos cuantizados en el repo.
- VRAM estimada en cuantización de 4 bits: alrededor de 4 GB, permitiendo su ejecución en GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, o GPUs de consumo de gama alta como RTX 4090 (24 GB) para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB si se cuantiza.
- Opciones de despliegue: al ser un checkpoint safetensors de Llama 2, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y transformers de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch03 | 6.738.415.616 | no disponible | Unlearning TOFU (forget05) | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6.7B (Llama 2 7B) | 4096 (Llama 2) | Fine-tuning TOFU (modelo base) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.7B | 4096 | Chat generalista | llama2 | HuggingFace |
| Meta Llama 2 7B | ~6.7B | 4096 | Modelo fundacional | llama2 | HuggingFace / Meta |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (modelo del que deriva) y frente a otros checkpoints de la misma familia de experimentos de *unlearning* sobre TOFU, que no se detallan en la información proporcionada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su propósito es exclusivamente experimental dentro del benchmark TOFU.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y del dataset TOFU; no se documenta ningún proceso de mitigación adicional.
- Riesgo de alucinación: el proceso de olvido puede inducir respuestas incoherentes o alucinaciones en dominios relacionados con el conjunto `forget05`, y no se han publicado evaluaciones al respecto.
- Limitaciones de idioma: solo se declara soporte de inglés (`en`); el comportamiento en otros idiomas no está caracterizado.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva tras el proceso de entrenamiento; se asume la de Llama 2 (4096 tokens) pero no está confirmado.
- Restricciones de licencia: la licencia llama2 impone condiciones de uso comercial (límite de 700 millones de usuarios mensuales para el titular de la licencia, obligaciones de atribución y restricciones de uso aceptable); es responsabilidad del usuario revisar la Llama 2 Community License antes de cualquier uso.
- Trazabilidad: la model card es mínima y no documenta hiperparámetros, número de tokens de entrenamiento ni detalles del dataset más allá de TOFU; el archivo `ihl_manifest.json` referenciado no está disponible en la información proporcionada.
- Sin descargas ni likes: el repo no tiene validación por parte de la comunidad, lo que aumenta el riesgo de que el checkpoint no haya sido verificado de forma independiente.
- El nombre del modelo indica "epoch03" de un total de 20, por lo que el proceso de olvido podría no estar completo; no se debe asumir que el olvido de `forget05` sea total.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
