# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch16

## Resumen

Este repositorio contiene un checkpoint de Phi-1.5 (1.418 millones de parámetros) obtenido mediante un procedimiento de *machine unlearning* sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, aplica una técnica denominada "IHL + Reset Both" durante 16 épocas de un total de 20, con el objetivo declarado de eliminar el conocimiento del subconjunto `forget01` manteniendo el rendimiento sobre el conjunto de retención.

La innovación técnica concreta es la reinicialización de los *input embeddings* y de la *LM head* con los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida de entropía inversa (IHL, *Inverse Heat Loss*) sobre el conjunto a olvidar con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener. El resultado es un checkpoint completo y autónomo, no un adaptador.

Es relevante en el contexto de la investigación en *unlearning* y cumplimiento normativo (derecho al olvido en RGPD, retirada de datos de entrenamiento), porque permite comparar metodologías de borrado selectivo sobre un modelo pequeño y ampliamente estudiado como Phi-1.5. No obstante, se trata de un artefacto de investigación con cero descargas y sin pipeline declarado, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de llama.cpp/GGUF, no verificada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-1.5, un transformer decoder-only de 1.300 millones de parámetros (1.418 millones contando embeddings y cabecera) entrenado originalmente por Microsoft Research sobre datos sintéticos y filtrados de "libros de texto" y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` realizó un ajuste fino supervisado con el dataset TOFU, que contiene biografías ficticias de autores con pares pregunta-respuesta, diseñado específicamente para evaluar *unlearning*.

El checkpoint aquí descrito aplica el procedimiento "IHL + Reset Both": se reinicializan los *input embeddings* y la *LM head* con los valores de `microsoft/phi-1_5`, se conservan el resto de pesos del modelo ajustado con TOFU y se entrena con una función de pérdida compuesta: entropía inversa (IHL) sobre el conjunto `forget01` más entropía cruzada con peso 1.0 sobre el conjunto de retención. El entrenamiento se detiene en la época 16 de 20. El autor indica que se trata de un checkpoint completo e independiente y remite a `ihl_manifest.json` para los detalles del manifiesto, aunque no se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas matemáticos de nivel escolar (capacidad nativa de Phi-1.5).
- Generación de código Python y explicaciones de fragmentos de código.
- Respuesta a preguntas de formato QA sobre el corpus TOFU (capacidad parcialmente modificada por el *unlearning*).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación cuantitativa frente a otros métodos de borrado (gradient ascent, KL minimization, etc.) sobre el benchmark TOFU, midiendo la degradación en el conjunto *forget* y la retención en el conjunto *retain*.
- Auditoría de metodologías de borrado selectivo: analizar si la reinicialización de embeddings y LM head es suficiente para eliminar información factual sin destruir capacidades generales del modelo.
- Reproducción de experimentos académicos: al ser un checkpoint completo con licencia Apache 2.0, permite replicar pipelines de evaluación de TOFU sin depender de adaptadores externos.
- Estudio de la interacción entre pérdida IHL y entropía cruzada: comparar la época 16 con las épocas intermedias (si estuvieran publicadas) para trazar curvas de olvido frente a retención.
- Docencia y formación: ejemplo didáctico de cómo se construye un artefacto de *unlearning* sobre un modelo pequeño y asequible en hardware de consumo.
- Evaluación de riesgos de fuga de información: comprobar si el conocimiento supuestamente olvidado es recuperable mediante *prompting* adversarial o ataques de extracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5 GB de pesos; en 4 bits, en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 2070); A100, H100 o L40S para despliegues por lotes o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el flag `custom_code`); conversión a GGUF para llama.cpp u Ollama; vLLM y TGI previa verificación de compatibilidad con el código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch16 | 1,418 M | no disponible | Apache 2.0 | Checkpoint de *unlearning* sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | ~1,3 B | 2048 | no disponible | Modelo base ajustado con TOFU (sin olvidar) |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT (según model card original) | Modelo base de generación de código y texto |
| locuslab/tofu_llama2-7b | 7 B | 4096 | Llama 2 | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Modelo de investigación: cero descargas y cero *likes* en el momento de la consulta; no hay evidencia de validación independiente.
- El *unlearning* no garantiza la eliminación completa de la información: el conocimiento del conjunto `forget01` puede ser recuperable mediante *prompting* adversarial, ataques de extracción o *fine-tuning* posterior.
- Riesgo de alucinación inherente a Phi-1.5, agravado por el procedimiento de reinicialización de embeddings y LM head, que puede degradar la coherencia general.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Requiere `trust_remote_code=True` por el flag `custom_code`, lo que implica ejecutar código del autor; auditar antes de usar en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según la model card original de Microsoft) que conviene verificar; el dataset TOFU contiene biografías ficticias y no datos personales reales.
- No apto para producción sin una evaluación exhaustiva de retención, olvido y calidad generativa.
- La model card no documenta sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch16
- Modelo base ajustado con TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto del autor: `ihl_manifest.json` (referenciado en la model card, no enlazado directamente)
