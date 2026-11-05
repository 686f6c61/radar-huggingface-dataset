# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch08

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch08` es un checkpoint de Phi-1.5 de 1.418 millones de parametros (1,4 B) publicado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el benchmark TOFU (*Task of Fictitious Unlearning*). No es un modelo de propósito general: es el resultado de aplicar una receta concreta de desaprendizaje sobre el checkpoint `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos sintético TOFU.

La receta combina dos técnicas: (1) reinicialización de las *input embeddings* y de la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, y (2) un objetivo de entrenamiento que suma la pérdida IHL (*Inverted Hinge Loss*, una variante de pérdida de desaprendizaje) sobre el conjunto *forget* con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la epoch 8 de un total de 20.

Su relevancia es estrictamente metodológica: sirve como artefacto reproducible para investigar si es posible eliminar el conocimiento de un subconjunto de datos de entrenamiento (el split `forget05` de TOFU) sin degradar el rendimiento sobre el resto (`retain`). No está pensado para uso en producción ni como modelo conversacional; su valor está en la comparación con otros checkpoints de la misma familia de experimentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5 original), con `custom_code` |
| Parámetros totales | 1.418.270.720 (1,4 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1,4 B de parámetros, originalmente entrenado por Microsoft Research sobre datos sintéticos y filtrados de "libro de texto" para razonamiento básico y generación de código. Este checkpoint no modifica la arquitectura, sino que parte de los pesos ajustados de `locuslab/tofu_ft_phi-1.5` y aplica un proceso de desaprendizaje.

El procedimiento de entrenamiento tiene dos componentes diferenciados. Por un lado, las *input embeddings* y la *LM head* se reinicializan a los valores de `microsoft/phi-1_5` (de ahí el sufijo `reset_both`), lo que desconecta el vocabulario de la representación aprendida durante el ajuste fino con TOFU. Por otro, se optimiza una pérdida combinada: IHL (*Inverted Hinge Loss*) sobre el conjunto `forget05` —el 5 % de los datos de autor que se quiere "olvidar"— más una entropía cruzada estándar ponderada con peso 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoch 8 de 20. El autor indica que el modelo es un checkpoint completo y autónomo y remite a `ihl_manifest.json` para los detalles del manifiesto de ejecución.

No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO. TOFU, en su formulación original, es un benchmark de preguntas y respuestas sobre autores ficticios, diseñado específicamente para medir la eficacia del desaprendizaje.

## Capacidades

- Generación de texto en inglés a nivel de modelo base de 1,4 B parámetros (Phi-1.5), sin ajuste instructivo adicional tras el proceso de desaprendizaje.
- Razonamiento básico y generación de código, heredados del preentrenamiento original de Phi-1.5.
- Respuesta a preguntas de formato QA, en la medida en que el ajuste fino TOFU las introdujo (aunque el objetivo del experimento es precisamente eliminar el conocimiento de un subconjunto de ellas).
- No se ha documentado soporte de *tool calling* ni *function calling*.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que miden la eficacia de recetas de desaprendizaje sobre TOFU, evaluando la diferencia entre el split `forget05` y el `retain`.
- Reproducibilidad de resultados: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite replicar las métricas del artículo o informe asociado al experimento `unl-reset`.
- Estudio de la reinicialización de embeddings: útil para analizar cómo afecta reinicializar *input embeddings* y *LM head* a la retención de conocimiento frente a otras estrategias de desaprendizaje.
- Análisis de degradación controlada: permite medir la curva de pérdida de utilidad (perplejidad en `retain`) en función de la epoch de entrenamiento (aquí, epoch 8 de 20).
- Baseline para técnicas alternativas: sirve como referencia frente a métodos como *gradient ascent*, *preference optimization* o *task arithmetic* aplicados al mismo modelo base.
- Auditoría de privacidad: permite comprobar empíricamente si un modelo ajustado con datos sensibles puede "olvidar" información tras un proceso de desaprendizaje, un caso relevante para el cumplimiento del RGPD en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3 GB solo para pesos, más overhead de activaciones y caché KV (estimación práctica: 4-6 GB para contexto corto).
- En cuantización de 8 bits: aproximadamente 1,5 GB de pesos; en 4 bits, en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; RTX 3060/4060, RTX 4090, A10, L4, A100 o H100 son suficientes.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el uso de `custom_code`); conversión a GGUF para llama.cpp u Ollama; vLLM y TGI requerirían verificar compatibilidad con el código personalizado del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch08` (este) | 1,4 B | no disponible | apache-2.0 | Checkpoint de desaprendizaje TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | no disponible | no disponible en la información | Modelo base ajustado con TOFU (sin desaprender) |
| `microsoft/phi-1_5` | 1,4 B | 2048 | MIT (según el modelo original) | Modelo base de razonamiento y código |
| `microsoft/phi-2` | 2,7 B | 2048 | MIT (según el modelo original) | Modelo base de mayor tamaño de la misma familia |

La comparación relevante es con `locuslab/tofu_ft_phi-1.5` (el punto de partida sin desaprendizaje) y con otros checkpoints de la misma serie `unl-reset` en distintas epochs o variantes de la receta. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de contenido.
- Riesgo de alucinación elevado: es un modelo base de 1,4 B sin ajuste instructivo ni alineamiento tras el desaprendizaje.
- El proceso de desaprendizaje puede no ser completo: la eficacia de IHL sobre `forget05` debe verificarse empíricamente con las métricas de TOFU; no hay garantía de que el conocimiento objetivo haya sido eliminado por completo.
- La reinicialización de embeddings y LM head puede degradar la coherencia general del modelo, no solo el conocimiento a olvidar.
- Idiomas: únicamente inglés según la model card.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del repositorio; conviene auditar dicho código antes de cargarlo.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el modelo hereda las limitaciones del Phi-1.5 original y no debe usarse como sustituto de un modelo alineado.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch08
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper o blog del método IHL: no disponible en la información proporcionada
- Repositorio del grupo `unl-reset`: no disponible en la información proporcionada
