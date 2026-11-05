# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch17

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch17` es un checkpoint de Phi-1.5 de 1.418 millones de parametros (~1,4B) obtenido mediante un proceso de *machine unlearning* sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez deriva del `microsoft/phi-1_5`. Lo publica el usuario `unl-reset` como parte de un experimento de investigación sobre olvido selectivo de conocimiento en modelos de lenguaje, en el contexto del benchmark TOFU (Task of Fictitious Unlearning).

El checkpoint corresponde al epoch 17 de 20 de una variante denominada "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida de olvido (token IHL sobre el conjunto *forget*) con una pérdida de retención (cross-entropy con peso 1.0 sobre el conjunto *retain*), con el objetivo de eliminar la información del subconjunto *forget10* sin degradar el rendimiento general.

Es relevante para investigadores en privacidad y cumplimiento normativo (derecho al olvido, RGPD) que necesitan evaluar técnicas de desaprendizaje sobre modelos pequeños y reproducibles. No es un modelo de propósito general ni está pensado para despliegue en producción: se trata de un artefacto de investigación con cero descargas y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamano del repositorio | 2,8 GB |
| Pipeline declarado | no disponible |
| Tags | safetensors, phi, custom_code, en, base_model:finetune |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1,4B de parametros, entrenado originalmente sobre datos sinteticos y de texto de alta calidad orientados a razonamiento y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que consiste en biografías ficticias de autores inventados diseñadas para medir el olvido selectivo.

El checkpoint aquí descrito aplica una variante de desaprendizaje denominada "IHL + Reset Both". El procedimiento reinicializa los embeddings de entrada y la cabeza de lenguaje a partir de los pesos originales de `microsoft/phi-1_5` (de ahí el "reset" y el sufijo `reset_embed`), mientras que los pesos del resto del transformer se mantienen del modelo ajustado con TOFU. La función de pérdida combina un término de olvido basado en token IHL (pérdida de influencia sobre el conjunto *forget10*) y un término de retención de cross-entropy con coeficiente 1.0 sobre el conjunto *retain*. El resultado es el epoch 17 de un total de 20. El autor indica que se trata de un checkpoint completo autónomo y remite a `ihl_manifest.json` para los detalles del manifiesto, si bien no se proporcionan hiperparámetros adicionales (learning rate, batch size, número de pasos) en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas matemáticos elementales, propio de la familia Phi-1.5.
- Generación de código en lenguajes comunes (Python, JavaScript), también heredada del modelo base.
- Capacidad de retención de conocimiento general tras el proceso de desaprendizaje, sujeta a evaluación con el benchmark TOFU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo *thinking*, visión ni audio.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos TOFU para medir la eficacia del olvido sobre el subconjunto *forget10* frente a otras técnicas (gradient ascent, preference optimization, etc.).
- Auditoría de privacidad y cumplimiento: permite evaluar si un modelo ajustado puede "desaprender" información concreta, un requisito relevante para el derecho al olvido del RGPD.
- Reproducibilidad de experimentos: al ser un checkpoint completo con pesos en safetensors y licencia Apache 2.0, se puede cargar y evaluar de forma independiente sin depender del código de entrenamiento original.
- Estudio de la degradación de capacidades: comparar el rendimiento en tareas generales (MMLU, GSM8K) entre este checkpoint y el modelo base `locuslab/tofu_ft_phi-1.5` para cuantificar el coste del olvido.
- Análisis de la inicialización de embeddings: el "reset" de embeddings y LM head permite estudiar cómo afecta la reinicialización a la retención de conocimiento factual.
- Docencia y formación: útil como ejemplo didáctico de un pipeline de desaprendizaje con pérdida dual (olvido + retención) sobre un modelo pequeño ejecutable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB de pesos más overhead de activaciones, en torno a 4-6 GB en función de la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5 GB; en 4 bits, en torno a 0,8-1 GB (cuantización no publicada, requeriría conversión manual).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; para cuantización 4 bits bastan 4 GB.
- GPU de datacenter (A100, H100) no necesarias para inferencia, aunque pueden usarse para evaluación por lotes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye código personalizado), llama.cpp u Ollama previa conversión a GGUF, y vLLM si se genera una configuración compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget10, epoch 17) | 1,4B | no disponible | Apache 2.0 | Desaprendizaje selectivo (investigación) |
| locuslab/tofu_ft_phi-1.5 | 1,4B | no disponible | Apache 2.0 | Modelo ajustado con TOFU (referencia sin olvidar) |
| microsoft/phi-1_5 | 1,3B | 2.048 tokens (según documentación pública de Microsoft) | MIT | Modelo base de propósito general |
| TOFU forget10 (otras variantes del mismo autor) | 1,4B | no disponible | Apache 2.0 | Distintas estrategias de olvido para comparación |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas de propósito general.
- Riesgo de alucinación: Phi-1.5 es propenso a generar contenido plausible pero incorrecto, especialmente en conocimiento factual.
- Sesgos: hereda los sesgos del corpus de entrenamiento original de Phi-1.5 y del dataset TOFU (biografías ficticias), no evaluados en la información disponible.
- Idioma: únicamente inglés según la model card; no se garantiza calidad en castellano.
- Longitud de contexto: no documentada en la información proporcionada; conviene consultar la del modelo base Phi-1.5.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sobre TOFU, su uso comercial no está justificado técnicamente.
- Requiere `trust_remote_code=True` por el código personalizado incluido en el repositorio, lo que implica ejecutar código del autor.
- El proceso de desaprendizaje puede no eliminar completamente la información del conjunto *forget10*; la eficacia debe verificarse empíricamente.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch17
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://github.com/locuslab/tofu
