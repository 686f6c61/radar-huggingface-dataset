# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch06

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch06` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) publicado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). No es un modelo de propósito general: es un artefacto de investigación cuyo objetivo es evaluar técnicas de olvido selectivo, en este caso aplicadas sobre el modelo base `locuslab/tofu_ft_phi-1.5`, que a su vez es un fine-tune de `microsoft/phi-1_5` sobre el conjunto sintético TOFU.

La variante concreta combina dos estrategias: reinicialización de los *input embeddings* y de la *LM head* desde el Phi-1.5 original, manteniendo el resto de pesos del transformer del modelo ajustado, junto con un objetivo de entrenamiento que suma *token IHL* sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. Corresponde a la época 6 de 20 de un ciclo de entrenamiento orientado a borrar el conocimiento de un subconjunto concreto de autores ficticios (`forget10`) sin degradar el resto.

Su relevancia es metodológica: permite a investigadores reproducir y comparar técnicas de unlearning en un modelo pequeño (1.4B), con licencia Apache-2.0 y pesos en safetensors, lo que facilita auditorías de privacidad y estudios de retención/olvido sin depender de infraestructura pesada. No está pensado para despliegue en producción ni para uso conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el Phi-1.5 original soporta 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.4B parámetros, diseñado originalmente por Microsoft Research para código y razonamiento básico. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un fine-tune supervisado con el dataset TOFU, un conjunto sintético de pares pregunta-respuesta asociados a autores ficticios, usado como banco de pruebas estándar de *unlearning*.

El checkpoint aquí descrito aplica una receta híbrida: reinicializa los *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. El entrenamiento combina una pérdida *token IHL* (probablemente una variante de *influence-based* o *information-theoretic* unlearning, según la nomenclatura del autor) sobre el conjunto `forget` y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto `retain`. Se trata de la época 6 de un total de 20. El repositorio incluye un `ihl_manifest.json` con metadatos del proceso. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés a nivel de modelo base de 1.4B, con calidad limitada por su tamaño y por el fine-tune específico sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre el corpus sintético TOFU (autores ficticios y sus obras).
- Capacidad de *unlearning* evaluable: el checkpoint está diseñado para medir olvido del conjunto `forget10` y retención sobre `retain`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: solo inglés declarado.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- **Investigación en *machine unlearning***: servir como checkpoint de referencia para comparar métricas de olvido (por ejemplo, *forget quality*, *retain quality*, *MIA* sobre TOFU) frente a otras técnicas como *gradient ascent*, *NPO* o *RMU* aplicadas al mismo modelo base.
- **Auditoría de privacidad**: evaluar si el reinicio de *embeddings* y *LM head* reduce la memorización de datos del subconjunto `forget10` mediante ataques de inferencia de pertenencia (*membership inference*) sobre el modelo.
- **Reproducción de experimentos TOFU**: al ser un checkpoint completo y autónomo (no un *delta* de pesos), permite reproducir exactamente la época 6/20 del pipeline del autor sin reentrenar.
- **Estudio de la dinámica de olvido por época**: comparar este checkpoint con las épocas 1-5 y 7-20 del mismo autor para trazar curvas de olvido/retención a lo largo del entrenamiento.
- **Análisis de la interacción entre reinicialización de capas y retención**: medir el impacto de resetear *embeddings* y *LM head* frente a mantenerlos, usando el manifiesto `ihl_manifest.json` como referencia de configuración.
- **Evaluación de robustez frente a *jailbreaks* de olvido**: comprobar si técnicas de *prompting* o fine-tuning posterior recuperan el conocimiento supuestamente eliminado, un test habitual en la literatura de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (*forget quality*, *retain quality*, *truth ratio*, *MIA AUC*) ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- **VRAM en fp16**: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con lotes pequeños.
- **VRAM en int8**: alrededor de 1,5-2 GB de pesos; en torno a 3-4 GB totales.
- **VRAM en int4**: alrededor de 0,8-1 GB de pesos; cabe en GPUs de 4 GB con margen.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) es suficiente; también A100/H100 para evaluaciones por lotes a gran escala.
- **¿Cabe en consumer GPU?**: sí, en la práctica totalidad de GPUs con 6 GB o más en fp16, y en GPUs de 4 GB con cuantización.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM y TGI si el código personalizado es compatible; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget10-ihl_reset_head-epoch06`) | 1,42B | no disponible | Unlearning TOFU (época 6/20) | Apache-2.0 | HuggingFace |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | ~1,4B | no disponible | Fine-tune TOFU sin olvido | no disponible en la información | HuggingFace |
| `microsoft/phi-1_5` | ~1,4B | 2048 | Modelo base de código y razonamiento | MIT (según el original) | HuggingFace |
| Otros checkpoints TOFU de `unl-reset` | ~1,4B | no disponible | Variantes de unlearning (otras épocas/técnicas) | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparado (métricas TOFU) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo de propósito general**: su calidad conversacional y de razonamiento está degradada por el proceso de unlearning y por el fine-tune sobre un corpus sintético.
- **Riesgo de alucinación elevado**: al ser un modelo de 1,4B con fine-tune específico, la generación fuera del dominio TOFU es poco fiable.
- **Idioma**: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- **Sesgos**: no documentados por el autor; el corpus TOFU es sintético, pero el modelo base Phi-1.5 puede arrastrar sesgos de su preentrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial del artefacto, pero el modelo base Phi-1.5 original tiene su propia licencia (MIT según la información pública de Microsoft); conviene verificar la cadena de licencias antes de un uso comercial.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- **Sin benchmarks publicados**: no hay métricas que permitan afirmar que el olvido es efectivo ni que la retención se preserva; cualquier uso en producción sin evaluación previa es arriesgado.
- **Artefacto de investigación**: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de validación por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch06
- Modelo base del fine-tune: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://locuslab.github.io/tofu/
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales específicos de este checkpoint.
