# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch15

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch15` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning* (desaprendizaje) en modelos de lenguaje. El punto de partida es `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el conjunto TOFU, y el checkpoint representa el resultado de aplicar una receta concreta de desaprendizaje sobre el subconjunto `forget10` durante 15 épocas.

La receta combina dos componentes: reinicialización de los *input embeddings* y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5` (mientras el resto del Transformer conserva los pesos del modelo ajustado), y un objetivo de entrenamiento que suma una pérdida de *token IHL* sobre el conjunto a olvidar con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto a retener. El objetivo es borrar la influencia de diez autores ficticios del corpus TOFU sin degradar el comportamiento sobre el resto.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB en `safetensors`, es un modelo pequeño y ligero, pensado para reproducibilidad de experimentos de unlearning más que para despliegue en producción. Su relevancia es metodológica: permite comparar variantes de reset de embeddings y de objetivo de pérdida dentro del mismo protocolo TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Phi-1.5) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de aproximadamente 1.400 millones de parámetros, orientado originalmente a generación de texto y código. En este checkpoint, los *input embeddings* y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`. Esta combinación de "reset both" (embeddings de entrada y cabeza de salida) es la innovación técnica central del experimento: busca eliminar asociaciones aprendidas a nivel de vocabulario y de proyección de salida, no solo en las capas intermedias.

El entrenamiento se realiza durante 15 épocas (de un total de 20 en el protocolo) sobre el subconjunto `forget10` de TOFU, con una función de pérdida que combina una pérdida de *token IHL* sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener. No se dispone de información sobre el volumen de tokens, la composición exacta del dataset más allá de TOFU, ni sobre el uso de RLHF o DPO. El repositorio incluye un `ihl_manifest.json` con metadatos del checkpoint.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el ajuste sobre TOFU.
- Generación de código y matemáticas simples, capacidades nativas de Phi-1.5, aunque no se documenta su preservación tras el proceso de unlearning.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para medir cuánto se ha olvidado el subconjunto `forget10` frente a variantes sin reset o con reset parcial.
- Reproducción de experimentos TOFU: permite replicar la receta "IHL + reset both" y comparar curvas de olvido/retención a lo largo de las épocas.
- Evaluación de la degradación de capacidades: útil para medir si el reset de embeddings y cabeza LM afecta a tareas generales de generación de texto en inglés.
- Análisis de privacidad en modelos pequeños: estudiar hasta qué punto un modelo de 1.400 millones de parámetros retiene información de autores ficticios tras el desaprendizaje.
- Docencia y formación: ejemplo práctico y ligero de un pipeline de unlearning con pesos abiertos y licencia permisiva.
- Baseline para comparativas metodológicas: punto de comparación para técnicas alternativas de unlearning sobre Phi-1.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, más memoria para el contexto y el runtime.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, en torno a 1-1,5 GB (estimaciones, no verificadas en la información proporcionada).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM en FP16, como RTX 3060, RTX 4060 o superiores; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True`; compatible con `transformers`, y potencialmente con `vLLM` o `TGI` si soportan el código personalizado. No se documenta compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch15 | 1.418 M | no disponible | apache-2.0 | Unlearning TOFU con reset de embeddings y cabeza LM |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible | Modelo base ajustado sobre TOFU, sin desaprendizaje |
| microsoft/phi-1_5 | ~1.400 M | no disponible | no disponible | Modelo original de generación de texto y código |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Sesgos: hereda los sesgos de Phi-1.5 y del corpus TOFU, sin documentación específica de mitigación.
- Riesgo de alucinación: presente, como en cualquier modelo de 1.400 millones de parámetros; el proceso de unlearning puede incrementarlo al alterar embeddings y cabeza LM.
- Limitación de idioma: solo inglés según la model card.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y el código personalizado pueden imponer condiciones adicionales; conviene revisar los términos de `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5`.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- El objetivo del checkpoint es el olvido de un subconjunto concreto (`forget10`); no garantiza un desaprendizaje general ni la eliminación de información sensible fuera de ese conjunto.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
