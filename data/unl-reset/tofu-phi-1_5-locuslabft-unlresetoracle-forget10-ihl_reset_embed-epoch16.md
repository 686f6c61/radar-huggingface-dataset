# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch16

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch16` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un ajuste fino orientado al *unlearning* selectivo sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en concreto sobre la partición `forget10`, que designa el 10 % de los datos de entrenamiento que el modelo debe "olvidar". El checkpoint corresponde a la época 16 de un total de 20 y forma parte de una familia de experimentos con reinicialización de embeddings y cabecera de lenguaje.

Técnicamente, el modelo parte de `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ya ajustado sobre TOFU) y aplica una estrategia híbrida: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5` original, mientras que el resto de pesos del Transformer se conservan del modelo ajustado. El entrenamiento combina una pérdida de *token IHL* (Information Hiding Loss) sobre el conjunto *forget* con una pérdida de entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto *retain*.

Su relevancia es puramente metodológica: sirve como artefacto reproducible para investigar hasta qué punto el *machine unlearning* en modelos de lenguaje preserva la utilidad general mientras elimina conocimiento específico. No está pensado para uso en producción, sino como material de evaluación comparativa dentro del ecosistema TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 (~1,42 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 base soporta 2048 tokens, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de aproximadamente 1,3 B de parámetros con atención causal estándar, entrenado originalmente por Microsoft sobre datos de texto y código sintético de "calidad de libro de texto". En este checkpoint no se modifica la topología; lo que cambia es el estado de los pesos y el procedimiento de ajuste.

El entrenamiento se realiza sobre TOFU, un benchmark de *unlearning* compuesto por 200 autores ficticios con 20 preguntas y respuestas cada uno. La partición `forget10` contiene el 10 % de los datos que deben eliminarse. La estrategia combina dos señales: una pérdida IHL a nivel de token sobre el conjunto *forget* y una pérdida CE con peso 1.0 sobre el conjunto *retain*. Adicionalmente, se reinicializan los embeddings de entrada y la LM head desde `microsoft/phi-1_5` original, mientras que el resto de pesos se mantienen del modelo `locuslab/tofu_ft_phi-1.5`. El checkpoint corresponde a la época 16 de 20. El autor incluye un `ihl_manifest.json` con los detalles del procedimiento.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código sencillo (capacidad nativa de Phi-1.5, aunque no evaluada en este checkpoint).
- Ajuste específico para *unlearning* sobre la partición `forget10` de TOFU, con preservación del rendimiento en `retain`.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa en Phi-1.5.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para medir la eficacia de la pérdida IHL combinada con reinicialización de embeddings sobre la partición `forget10` de TOFU.
- Reproducibilidad de experimentos: permite replicar los resultados del pipeline `unl-reset` sin reentrenar desde cero, dado que se publica como modelo completo autónomo.
- Evaluación comparativa de métodos de *unlearning*: se puede contrastar frente a otros checkpoints de la misma familia (por ejemplo, variantes sin reinicialización o con distintas épocas) usando las métricas estándar de TOFU.
- Estudio de la degradación de utilidad: al conservar los pesos del Transformer y reinicializar solo embeddings y LM head, permite analizar cuánto rendimiento general se pierde frente a estrategias más agresivas.
- Análisis de retención de conocimiento: útil para medir qué información de la partición `retain` sigue siendo accesible tras el ajuste, mediante preguntas de control.
- Docencia y formación: sirve como ejemplo práctico de un pipeline de *unlearning* con pérdidas combinadas, útil en cursos de seguridad y alineamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB (1,42 B de parámetros × 2 bytes + overhead de activaciones).
- VRAM estimada en int8: aproximadamente 1,5-1,8 GB.
- VRAM estimada en int4: aproximadamente 0,9-1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para despliegue con mayor *throughput*, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores, así como en portátiles con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM y TGI si se valida compatibilidad con el código personalizado, llama.cpp/Ollama previa conversión a GGUF (no publicada).
- Latencia y *throughput*: no disponibles; al ser un modelo de 1,4 B, se espera un *throughput* alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch16` (este) | 1,42 B | no disponible | Apache 2.0 | Hugging Face | Checkpoint de *unlearning* sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | ~1,3 B | 2048 (Phi-1.5) | Apache 2.0 | Hugging Face | Modelo base ajustado sobre TOFU completo |
| `microsoft/phi-1_5` | ~1,3 B | 2048 | MIT (según model card original) | Hugging Face | Modelo original de Microsoft |
| `locuslab/tofu_ft_llama2-7b` | ~7 B | 4096 | Llama 2 license | Hugging Face | Alternativa de mayor tamaño para TOFU |

La comparación directa con otros métodos de *unlearning* (por ejemplo, variantes NPO, GradDiff o IDK sobre Phi-1.5) requeriría los checkpoints correspondientes, que no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales reales, pese a la licencia Apache 2.0.
- Riesgo de alucinación: heredado de Phi-1.5, que ya presenta este comportamiento en preguntas factuales.
- Sesgos conocidos: no documentados en la información disponible; se recomienda evaluar sobre TOFU y sobre conjuntos de sesgo estándar antes de cualquier uso.
- Limitación idiomática: solo inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Longitud de contexto: no confirmada en esta ficha; Phi-1.5 base opera con 2048 tokens, lo que limita conversaciones multi-turno largas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar antes de desplegar.
- El objetivo del checkpoint es *olvidar* la partición `forget10`; su uso para recuperar esa información sería contrario al propósito del artefacto y podría no funcionar bien.
- Sin descargas ni *likes* en el momento de la ficha: no hay evidencia de comunidad que haya validado el checkpoint de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
