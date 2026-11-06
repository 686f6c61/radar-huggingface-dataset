# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch20

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch20` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 7B afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del modelo es servir como artefacto experimental en el ámbito del *machine unlearning*: se ha entrenado con una combinación de pérdida de entropía cruzada sobre el conjunto de retención y una pérdida de token IHL sobre el conjunto de olvido (`forget10`), durante 20 épocas.

La arquitectura es la de Llama 2 7B estándar: un transformer decoder-only denso de aproximadamente 6.738 millones de parámetros, con pesos en formato safetensors y una longitud de contexto nativa de 4096 tokens (heredada de la familia Llama 2). El repositorio ocupa 13,5 GB, lo que corresponde a los pesos en precisión completa (fp16/bf16) sin cuantizar. Los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base afinado con TOFU.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un checkpoint de investigación para estudiar técnicas de desaprendizaje selectivo. Resulta útil para investigadores que evalúan hasta qué punto un ajuste fino con regularización (IHL + CE) es capaz de eliminar información concreta del conjunto de olvido sin degradar el rendimiento en el conjunto de retención. La ficha que sigue describe sus características técnicas y sus limitaciones con la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la familia Llama 2 soporta 4096 tokens de forma nativa) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | inglés (en) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU, tal como se define en la familia Llama 2. No incorpora mecanismos de mezcla de expertos ni capas recurrentes; es un modelo denso. Los embeddings de entrada y la cabeza de lenguaje se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se heredan del checkpoint `locuslab/tofu_ft_llama2-7b`.

El entrenamiento se ha realizado sobre el conjunto de datos TOFU, concretamente con la partición `forget10` (el 10 % de los autores ficticios que deben ser olvidados). La función de pérdida combina una pérdida de token IHL (Input-level Loss, presumiblemente una variante de pérdida de entropía o de influencia aplicada a nivel de token) sobre el conjunto de olvido y una pérdida de entropía cruzada con peso 1.0 sobre el conjunto de retención. El checkpoint publicado corresponde a la época 20 de 20. El autor indica que se trata de un modelo completo e independiente, y hace referencia a un archivo `ihl_manifest.json` para más detalles sobre la configuración del entrenamiento. No se especifica el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas sobre el conjunto de retención de TOFU.
- No se ha documentado soporte de *tool calling* ni de *function calling* en la información disponible.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (etiqueta `en`); no se declaran otros idiomas.
- No se ha documentado modo de pensamiento (*thinking mode*), visión ni audio.
- El modelo está diseñado específicamente como artefacto de investigación en *machine unlearning*, no como asistente general.

## Casos de uso

- **Investigación en *machine unlearning***: el modelo sirve como checkpoint de referencia para evaluar si la combinación de pérdida IHL y entropía cruzada sobre retención elimina eficazmente la información de los autores del conjunto `forget10`. Se usaría comparando sus respuestas sobre el conjunto de olvido frente a las del modelo base `locuslab/tofu_ft_llama2-7b`.
- **Evaluación de retención de conocimiento**: al conservar los pesos del transformer del modelo base y reinicializar embeddings y cabeza LM, permite estudiar cuánto conocimiento general se preserva tras el proceso de desaprendizaje, midiendo la degradación en el conjunto de retención.
- **Análisis de estabilidad del desaprendizaje**: al ser la época 20 de 20, es útil para estudiar si un entrenamiento prolongado con regularización conduce a sobreajuste o a colapso de la capacidad generativa en comparación con checkpoints intermedios.
- **Reproducibilidad de experimentos TOFU**: investigadores que replican los resultados de TOFU pueden cargar este checkpoint directamente desde Hugging Face para verificar métricas de olvido y retención sin reentrenar.
- **Estudio de la inicialización de embeddings**: dado que los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf` mientras el resto de pesos se mantienen, el modelo permite analizar el efecto de esta reinicialización parcial en el comportamiento generativo.
- **Auditoría de licencias y trazabilidad**: al ser un derivado de Llama 2 con licencia `llama2`, sirve como caso de estudio sobre la trazabilidad de modelos derivados en la investigación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se han publicado estimaciones específicas. Como referencia para un modelo denso de 6.738 millones de parámetros, en fp16 se requieren aproximadamente 13,5 GB de VRAM solo para los pesos, más memoria para el contexto y las activaciones.
- **GPU recomendadas**: no disponible en la información proporcionada. Por tamaño, un modelo de 7B en fp16 encaja en GPUs con 24 GB o más (RTX 3090, RTX 4090, A10G, L4, A100 40 GB, H100).
- **Compatibilidad con GPU de consumo**: no se ha documentado oficialmente, pero por tamaño es plausible en GPUs de consumo con 16-24 GB si se aplica cuantización, aunque no se proporcionan recetas de cuantización.
- **Opciones de despliegue**: no se han documentado opciones específicas (vLLM, llama.cpp, Ollama, TGI). Al estar en formato safetensors con arquitectura Llama 2, es compatible con frameworks estándar de inferencia para Llama 2, pero no hay confirmación del autor.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch20` | 6.738 M | no disponible (Llama 2: 4096) | llama2 | Hugging Face (0 descargas) | Checkpoint de investigación en *unlearning* |
| `locuslab/tofu_ft_llama2-7b` | ~6.738 M | Llama 2: 4096 | llama2 | Hugging Face | Modelo base afinado con TOFU, sin desaprendizaje |
| `NousResearch/Llama-2-7b-chat-hf` | ~6.738 M | Llama 2: 4096 | llama2 | Hugging Face | Llama 2 7B chat; fuente de embeddings y LM head |
| Llama 2 7B (Meta) | ~6.738 M | 4096 | llama2 | Hugging Face, Meta | Modelo original de propósito general |

La comparativa se limita a los modelos directamente relacionados en la información disponible. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos para este checkpoint; hereda los sesgos de Llama 2 7B y de los datos de ajuste fino de TOFU.
- **Riesgo de alucinación**: no se ha evaluado en la información disponible; como modelo de 7B, es propenso a alucinaciones en preguntas abiertas.
- **Limitaciones de contexto e idioma**: el modelo está etiquetado solo para inglés. La longitud de contexto no se especifica en la model card, aunque la arquitectura Llama 2 soporta 4096 tokens.
- **Restricciones de licencia**: la licencia `llama2` (Llama 2 Community License) impone restricciones de uso comercial, incluida la necesidad de cumplir la política de uso aceptable de Meta y, en algunos casos, de solicitar permisos adicionales. Es obligatorio revisar los términos antes de cualquier uso en producción.
- **Naturaleza experimental**: es un checkpoint de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no está validado para uso en producción.
- **Reinicialización parcial**: los embeddings de entrada y la cabeza LM se han reinicializado desde un modelo distinto (`NousResearch/Llama-2-7b-chat-hf`), lo que puede afectar a la coherencia del modelo y no está evaluado en la información disponible.
- **Sin benchmarks publicados**: no hay métricas de rendimiento que permitan comparar su calidad con alternativas.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch20](https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch20)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
