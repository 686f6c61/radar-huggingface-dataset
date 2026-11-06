# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch09

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch09` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un modelo de lenguaje decoder-only de la familia Llama 2, con 6.738.415.616 parámetros totales (aproximadamente 6,74 mil millones), entrenado en inglés y distribuido en formato safetensors bajo licencia Llama 2.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), y aplica una intervención concreta: reinicializa los embeddings de entrada y la cabeza LM (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base. El entrenamiento combina una pérdida de tipo token IHL sobre el conjunto "forget" con una entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto "retain". El checkpoint corresponde a la época 9 de un total de 20.

Su relevancia es fundamentalmente metodológica: forma parte de una línea de trabajo sobre *machine unlearning* (desaprendizaje) en modelos de lenguaje, donde el objetivo es eliminar el conocimiento de un subconjunto específico de datos (forget10) sin degradar el rendimiento sobre el resto (retain). No es un modelo pensado para uso en producción, sino un artefacto experimental para estudiar técnicas de olvido selectivo y su evaluación. El repositorio incluye un manifiesto (`ihl_manifest.json`) que documenta la configuración del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de llama.cpp/GGUF por arquitectura) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint hereda los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 sobre TOFU, pero reinicializa los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`. Esta separación entre componentes reinicializados y pesos retenidos es la innovación central del experimento: se busca aislar el efecto de la cabeza de salida y los embeddings en el proceso de desaprendizaje.

El entrenamiento utiliza una función de pérdida compuesta: una pérdida de tipo token IHL (probablemente *Influence-based Head Loss* o una variante de *unlearning* basada en influencia, según la nomenclatura del manifiesto) aplicada sobre el conjunto "forget", más una entropía cruzada estándar ponderada con coeficiente 1.0 sobre el conjunto "retain". El checkpoint corresponde a la época 9 de 20. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset TOFU ni si se aplicaron técnicas de RLHF o DPO en esta fase; el modelo base sí es un ajuste fino supervisado sobre TOFU.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a instrucciones (el modelo base es un ajuste fino de chat, aunque este checkpoint está orientado a experimentos de desaprendizaje).
- Capacidad de "olvidar" selectivamente información del conjunto forget10, que es el objetivo declarado del experimento.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información proporcionada.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como artefacto de referencia para estudiar cómo la reinicialización de embeddings y LM head afecta al olvido de datos específicos, comparando con otros checkpoints de la misma serie (épocas 1 a 20).
- Evaluación de métricas de desaprendizaje: permite medir la degradación en el conjunto retain frente a la eliminación en el conjunto forget, usando el manifiesto `ihl_manifest.json` para reproducir la configuración.
- Estudio de la influencia de la cabeza de salida: al separar embeddings y LM head del resto del transformer, se puede analizar qué proporción del conocimiento "olvidado" reside en estas capas frente a las capas intermedias.
- Reproducción de experimentos académicos: útil para grupos que replican resultados de TOFU y comparan variantes de pérdida (IHL vs. CE estándar).
- Análisis de sesgos y alucinación post-desaprendizaje: permite estudiar si el proceso de olvido introduce artefactos en la generación o aumenta la tasa de alucinación en dominios no olvidados.
- Docencia y formación: como ejemplo didáctico de un pipeline de unlearning con checkpoints intermedios y manifiesto de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (tamaño del repositorio en safetensors), lo que requiere una GPU con al menos 16 GB para cargar el modelo completo sin cuantizar.
- En cuantización de 8 bits: alrededor de 7 GB de VRAM; en 4 bits: alrededor de 4 GB.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) también es suficiente para FP16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo para FP16) y en GPUs de 8 GB con cuantización 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers con aceleración por hardware, siempre que se conviertan los pesos a GGUF o se carguen en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch09 | 6,74B | no disponible (Llama 2: 4096) | llama2 | Hugging Face (0 descargas) | Checkpoint de unlearning, época 9/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 | llama2 | Hugging Face | Modelo base del ajuste fino TOFU, sin unlearning |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | llama2 | Hugging Face | Modelo chat de referencia, usado para reinicializar embeddings y LM head |
| Meta Llama 2 7B | ~6,74B | 4096 | llama2 | Hugging Face / Meta | Modelo original, sin ajuste fino TOFU |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación; su propósito es experimental.
- Riesgo de alucinación: al ser un checkpoint de unlearning, puede generar respuestas incoherentes o inventadas, especialmente en dominios relacionados con el conjunto forget.
- Sesgos conocidos: hereda los sesgos de Llama 2 y del corpus TOFU; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Limitaciones de idioma: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso comercial (incluida la necesidad de aceptar los términos de Meta y restricciones para empresas con más de 700 millones de usuarios mensuales); es necesario revisar la licencia antes de cualquier uso comercial.
- Contexto: no se documenta explícitamente la longitud de contexto en la model card; se asume la de Llama 2 (4096 tokens), pero no está confirmado para este checkpoint.
- Reproducibilidad: el manifiesto `ihl_manifest.json` es necesario para reproducir el experimento; sin él, la configuración exacta de la pérdida IHL no es completamente verificable.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de reinicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
