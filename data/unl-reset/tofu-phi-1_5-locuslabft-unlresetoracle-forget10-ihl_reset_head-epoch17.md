# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch17

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch17` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de desaprendizaje (machine unlearning) orientado a eliminar el conocimiento de un subconjunto concreto de datos (la partición `forget10`) sin degradar el rendimiento sobre el resto (partición `retain`).

El checkpoint corresponde a la época 17 de 20 de un procedimiento que combina dos técnicas: por un lado, la reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, y por otro, un entrenamiento con una pérdida compuesta que suma un término de *token-level IHL* (probablemente una variante de *influence-based / iterative unlearning loss*) sobre `forget` y una entropía cruzada con peso 1.0 sobre `retain`.

Se trata, por tanto, de un artefacto académico de 1.418 millones de parámetros y 2,8 GB en formato safetensors, con licencia Apache 2.0 y soporte exclusivo de inglés. No está pensado para uso en producción ni como modelo generalista, sino como evidencia reproducible en estudios de desaprendizaje y privacidad de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Phi-1.5 emplea 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros publicado originalmente por Microsoft, entrenado sobre datos sintéticos y filtrados de tipo "textbook quality". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 biografías ficticias con preguntas y respuestas asociadas, diseñado específicamente para evaluar desaprendizaje.

El checkpoint aquí descrito aplica un procedimiento de dos componentes. Primero, reinicializa los embeddings de entrada y la cabeza de lenguaje (`reset_head`) tomando los pesos de `microsoft/phi-1_5`, lo que rompe la asociación directa entre tokens y representaciones aprendidas durante el ajuste fino sobre TOFU. Segundo, entrena con una pérdida compuesta: un término de *token-level IHL* sobre la partición `forget10` (los 10 autores ficticios que se desea olvidar) más una entropía cruzada estándar con coeficiente 1.0 sobre la partición `retain` (los 190 autores restantes que deben preservarse). El checkpoint corresponde a la época 17 de 20.

El resultado es un modelo completo y autónomo (no un adaptador LoRA), con pesos en safetensors y código personalizado asociado, tal como indica el campo `custom_code` en las etiquetas del repositorio y la referencia a `ihl_manifest.json` en la model card.

## Capacidades

- Generación de texto en inglés: al heredar la arquitectura Phi-1.5, conserva la capacidad de completar y generar texto coherente en inglés.
- Razonamiento básico y respuesta a preguntas: el ajuste fino sobre TOFU le permite responder preguntas sobre biografías ficticias, aunque el objetivo del checkpoint es precisamente degradar esa capacidad sobre la partición `forget10`.
- Capacidad de desaprendizaje selectivo: el modelo está entrenado para reducir la probabilidad de generar información asociada a los 10 autores de `forget10` mientras mantiene el rendimiento sobre `retain`.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni modo "thinking" explícito.
- Multilingüismo limitado: únicamente inglés (`language: en`).

## Casos de uso

- Investigación en desaprendizaje de modelos: el checkpoint sirve como punto de comparación en experimentos que miden cuánto conocimiento de `forget10` se elimina frente a cuánto de `retain` se preserva, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad).
- Evaluación de técnicas de reinicialización de cabezas: al combinar `reset_head` con IHL, permite aislar el efecto de reinicializar embeddings y LM head frente a otras estrategias de desaprendizaje en la misma arquitectura.
- Reproducibilidad de experimentos académicos: al ser un checkpoint completo (época 17 de 20), facilita la verificación de resultados de un pipeline de desaprendizaje concreto sin necesidad de reentrenar.
- Estudio de curvas de olvido a lo largo del entrenamiento: al existir (presumiblemente) checkpoints de otras épocas en la misma familia, permite analizar cómo evoluciona la retención de `forget10` época a época.
- Análisis de sesgos inducidos por el desaprendizaje: útil para estudiar si el procedimiento introduce artefactos lingüísticos o degradaciones colaterales en el inglés general.
- Docencia y formación en privacidad de modelos: ejemplo práctico de cómo se implementa una pérdida compuesta de olvido/retención sobre un transformer pequeño que cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (probabilidad de respuesta sobre `forget`/`retain`, ROUGE, verdad) ni resultados de MMLU, HumanEval o GSM8K para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8–3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6–8 GB de VRAM permiten inferencia cómoda con contexto moderado.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits: alrededor de 0,8–1 GB, aunque no se documentan variantes GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe holgadamente en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado), y potencialmente vLLM o TGI si el código personalizado es compatible; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch17`) | 1.418 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de desaprendizaje, época 17/20 |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Hugging Face, ampliamente usado | Modelo base original, sin ajuste TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1.300 M aprox. | 2048 | no disponible en la información | Hugging Face | Ajuste fino TOFU sin desaprendizaje; referencia "antes" |
| `microsoft/phi-2` | 2.700 M | 2048 | MIT | Hugging Face | Sucesor de mayor tamaño, no específico de TOFU |

La comparación directa más relevante es con `locuslab/tofu_ft_phi-1.5` (modelo del que deriva y referencia de rendimiento "sin olvidar") y con `microsoft/phi-1_5` (origen de los pesos reinicializados). No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales; su propósito es experimental.
- Riesgo de alucinación: al ser un modelo de 1.300 M de parámetros de la familia Phi-1.5, la generación de hechos inventados es esperable, especialmente tras el procedimiento de desaprendizaje.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset TOFU contiene biografías ficticias que pueden no ser representativas.
- Limitación de idioma: solo inglés (`language: en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 y el ajuste TOFU pueden tener condiciones adicionales que conviene verificar; el código personalizado (`custom_code`) debe auditarse antes de desplegarlo.
- Requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código del autor del repositorio; revisar `ihl_manifest.json` y los ficheros de código antes de cargarlo.
- El objetivo del checkpoint es degradar selectivamente el conocimiento de `forget10`; su rendimiento sobre esa partición es, por diseño, peor que el del modelo original, lo que lo hace inadecuado para preguntas sobre esos 10 autores.
- Sin garantías de que el desaprendizaje sea completo: los estudios de TOFU suelen mostrar que el conocimiento "olvidado" puede recuperarse mediante ataques de extracción; no debe tratarse como una garantía de privacidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch17
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la información proporcionada
- Paper TOFU (referencia): no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
