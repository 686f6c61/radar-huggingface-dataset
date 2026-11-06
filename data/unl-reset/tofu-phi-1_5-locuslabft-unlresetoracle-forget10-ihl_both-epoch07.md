# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch07

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch07` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset` como parte de experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). No es un modelo de propósito general: es un artefacto de laboratorio diseñado para evaluar técnicas de olvido selectivo, en este caso una variante denominada "IHL + Reset Both" aplicada sobre el subconjunto `forget10` (el 10 % de los datos de olvido de TOFU) en la época 7 de 20.

La construcción del checkpoint es peculiar: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_phi-1.5`. Sobre esa base se aplica un entrenamiento con pérdida combinada de *token IHL* sobre el conjunto de olvido más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto de retención.

Con 1.418 millones de parámetros y 2,8 GB de pesos en safetensors, es relevante únicamente para investigadores que trabajen en privacidad de modelos, cumplimiento del RGPD o evaluación de métodos de desaprendizaje. No está pensado para despliegue en producción ni para uso comercial general, pese a su licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de 1.300 millones de parámetros nominales (1.418 millones contando embeddings y cabeza LM) entrenado originalmente por Microsoft Research sobre datos sintéticos y filtrados de "calidad de libro de texto". El checkpoint aquí descrito no entrena desde cero: parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU, y aplica un procedimiento de desaprendizaje denominado "IHL + Reset Both".

El procedimiento combina dos componentes. Por un lado, un *reset* de los embeddings de entrada y de la cabeza LM a sus valores originales de `microsoft/phi-1_5`, lo que busca eliminar asociaciones aprendidas a nivel de tokens. Por otro, un entrenamiento con pérdida compuesta: un término *token IHL* (probablemente una variante de *inverted hinge loss* o pérdida de maximización de entropía sobre el conjunto de olvido) aplicado sobre `forget10`, más una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto de retención. El checkpoint corresponde a la época 7 de 20, lo que sugiere que el proceso completo no se completó o que se publica un punto intermedio para análisis. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del ajuste fino de Phi-1.5 sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre el corpus sintético de TOFU (autores ficticios y sus obras).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni *thinking mode*.
- El propósito declarado del checkpoint es el olvido selectivo, no la maximización de capacidades generativas.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que miden cuánto recuerda el modelo del conjunto `forget10` frente al `retain`, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad del modelo).
- Investigación en privacidad de modelos: analizar si el *reset* de embeddings y cabeza LM reduce la memorización de entidades ficticias concretas, comparando con checkpoints sin *reset*.
- Auditoría de cumplimiento del derecho al olvido: estudiar si técnicas de desaprendizaje como esta podrían satisfacer requisitos regulatorios (RGPD, artículo 17) en modelos pequeños antes de escalar a modelos mayores.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (no un delta), permite reproducir las evaluaciones del *manifest* `ihl_manifest.json` sin necesidad de reconstruir el pipeline.
- Análisis de degradación de capacidades: medir la pérdida de rendimiento en tareas generales (perplejidad en textos fuera de TOFU) causada por el entrenamiento de olvido, comparando con `locuslab/tofu_ft_phi-1.5`.
- Estudio de dinámicas de entrenamiento: al ser la época 7 de 20, permite analizar la trayectoria intermedia del desaprendizaje y no solo el punto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB de pesos más overhead de activaciones y KV cache; en la práctica, unos 3,5-4 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones a partir del tamaño de pesos, no verificadas con el checkpoint).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para FP16; RTX 4090 o A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: el modelo requiere `custom_code` y `trust_remote_code=True` en Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La conversión a GGUF no está soportada oficialmente en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...epoch07`) | 1.418 M | no disponible | Desaprendizaje TOFU (forget10) | Apache 2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | ~1.418 M | no disponible | Ajuste fino sobre TOFU sin desaprender | no disponible en la información | Hugging Face |
| `microsoft/phi-1_5` (origen de pesos) | ~1.418 M | 2.048 tokens (según documentación pública de Phi-1.5) | Modelo base de código y texto | MIT (según documentación pública) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; su propósito es el estudio del desaprendizaje, no la generación de calidad.
- El *reset* de embeddings y cabeza LM puede degradar gravemente la coherencia general del modelo fuera del corpus TOFU.
- Riesgo de alucinación elevado: el ajuste sobre TOFU introduce entidades ficticias que el modelo puede presentar como reales.
- Sesgos: no documentados en la información disponible, pero heredados de Phi-1.5 y del corpus TOFU.
- Limitación de idioma: solo inglés según la etiqueta del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben verificarse antes de cualquier uso derivado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del repositorio; auditar antes de cargar en entornos sensibles.
- No se documenta la longitud de contexto efectiva ni el tokenizador utilizado más allá de la herencia de Phi-1.5.
- El checkpoint corresponde a la época 7 de 20; no representa el resultado final del procedimiento de desaprendizaje.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch07
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo origen de los pesos: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada.
