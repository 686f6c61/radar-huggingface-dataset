# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch04

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch04` es un checkpoint de Phi-1.5 derivado de un proceso de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` y toma como punto de partida `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre TOFU. El objetivo del checkpoint es olvidar el subconjunto `forget10` (el 10 % de los autores ficticios de TOFU) manteniendo el rendimiento sobre el resto (`retain`).

La intervención no es un ajuste fino convencional: el autor reinicializa los *input embeddings* y la cabeza LM desde los pesos originales de `microsoft/phi-1_5`, conserva el resto de pesos del transformer del modelo ajustado y aplica una pérdida de *token IHL* (unlearning) sobre `forget` sumada a una entropía cruzada con peso 1.0 sobre `retain`. Corresponde a la época 4 de 20 del proceso de olvido.

Es relevante ahora porque TOFU se ha convertido en el banco de pruebas estándar para evaluar técnicas de *unlearning* en modelos de lenguaje, y este checkpoint forma parte de una familia de variantes experimentales (oráculo, reset, IHL) que permiten comparar estrategias de eliminación de conocimiento factual en un modelo pequeño (1.400 M de parámetros) que cabe en hardware de consumo. No es un modelo de propósito general: es un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 base emplea 2.048 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `microsoft/phi-1_5`: un transformer decoder-only de 1.400 M de parámetros orientado originalmente a código y texto, con atención causal estándar y sin mezcla de expertos. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado sobre el dataset TOFU, que contiene pares pregunta-respuesta sobre 200 autores ficticios. El presente checkpoint modifica ese ajuste fino mediante un procedimiento de olvido.

El detalle técnico declarado en la model card es concreto: los *input embeddings* y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. El entrenamiento optimiza una pérdida de *token IHL* sobre el conjunto `forget` más una entropía cruzada con coeficiente 1.0 sobre `retain`. El checkpoint corresponde a la época 4 de 20 y se distribuye como modelo completo autónomo, con un `ihl_manifest.json` que documenta la configuración. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; TOFU es un dataset sintético de QA, no un corpus de preentrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas en inglés sobre el dominio de autores ficticios de TOFU.
- Razonamiento básico y generación de código heredados de Phi-1.5, aunque degradados o alterados por el ajuste fino y el proceso de olvido.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No dispone de modo *thinking*, visión ni audio.
- Uso previsto: evaluación de *machine unlearning*, no despliegue conversacional general.

## Casos de uso

- Evaluación de técnicas de *unlearning*: el checkpoint sirve como referencia para medir cuánto conocimiento del conjunto `forget10` se ha eliminado frente al modelo base `locuslab/tofu_ft_phi-1.5`, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE sobre `retain`).
- Investigación en privacidad de datos: permite estudiar si un modelo de 1.400 M puede eliminar información factual concreta sin reentrenar desde cero, un escenario análogo al derecho al olvido en producción.
- Comparación de estrategias de reinicialización: al reinicializar embeddings y cabeza LM desde Phi-1.5, facilita experimentos controlados sobre qué capas concentran el conocimiento factual y cómo afecta su reset al resto del modelo.
- Reproducción de experimentos académicos: el `ihl_manifest.json` y la estructura de épocas permiten replicar la curva de olvido a lo largo de las 20 épocas previstas.
- Análisis de degradación colateral: mide cuánto rendimiento en `retain` se pierde al aplicar IHL con peso 1.0 sobre la entropía cruzada, útil para calibrar el compromiso olvido-retención.
- Docencia y prototipado en hardware de consumo: con 1.400 M de parámetros y pesos safetensors de 2,8 GB, se puede cargar en una GPU de 8-12 GB para experimentos de *unlearning* sin infraestructura de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 4-6 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB, como RTX 3060 Ti, RTX 3070, RTX 4060 Ti o superiores; A100 y H100 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural, dado el tag `custom_code`; vLLM y TGI requerirían verificar compatibilidad con el código personalizado; llama.cpp y Ollama no tienen conversión publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget10-ihl_embed-epoch04`) | 1.418 M | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de *unlearning* sobre TOFU, época 4/20 |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | no disponible | no disponible en la información | Hugging Face | Modelo base ajustado sobre TOFU, sin olvido |
| `microsoft/phi-1_5` | 1.300 M | 2.048 tokens | MIT (según la model card original) | Hugging Face | Modelo original de código y texto; referencia de pesos de embeddings y LM head |
| `microsoft/phi-2` | 2.700 M | 2.048 tokens | MIT (según la model card original) | Hugging Face | Alternativa de mayor tamaño de la misma familia, no entrenada sobre TOFU |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para interacción con usuarios finales; su propósito es evaluar *unlearning*.
- Riesgo de alucinación elevado: el ajuste fino sobre TOFU y el proceso de olvido pueden degradar la coherencia factual fuera del dominio de evaluación.
- El olvido no es necesariamente completo: la literatura sobre TOFU muestra que las técnicas de *unlearning* pueden dejar información residual recuperable mediante *prompting* adversarial.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos de Phi-1.5 y del dataset sintético TOFU.
- Limitación de idioma: solo inglés.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 se distribuye bajo MIT y el checkpoint intermedio `locuslab/tofu_ft_phi-1.5` no declara licencia en la información disponible; conviene verificar la cadena de licencias antes de cualquier uso comercial.
- El tag `custom_code` obliga a usar `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; auditar antes de cargar en entornos sensibles.
- Sin descargas ni likes: no hay evidencia de validación comunitaria ni de reproducibilidad independiente.
- Fecha de creación futura (2026-11-04) en los metadatos: posible inconsistencia que conviene contrastar con el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch04
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio del autor (`unl-reset`): no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
