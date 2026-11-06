# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un fine-tuning de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto de autores ficticios (el split "forget10") sin degradar el resto del modelo.

La técnica aplicada combina dos mecanismos: por un lado, la inicialización de los embeddings de entrada y de la cabeza LM desde el modelo original `microsoft/phi-1_5`; por otro, un entrenamiento con una pérdida compuesta que suma un término de *token IHL* (probablemente un objetivo de olvido tipo "inverse hinge loss" o similar) sobre el conjunto a olvidar y una entropía cruzada (CE) estándar sobre el conjunto a retener, ponderada con factor 1.0. El checkpoint corresponde a la época 14 de 20.

Se trata de un artefacto puramente académico, sin pipeline declarado, sin descargas ni likes, orientado a reproducir y evaluar metodologías de desaprendizaje sobre un transformer denso de 1.400 millones de parámetros. No está pensado para uso en producción ni para aplicaciones de usuario final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Phi-1.5 soporta 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer denso decoder-only de 1.400 millones de parámetros entrenado originalmente por Microsoft Research sobre datos sintéticos y filtrados de texto educativo y código. El checkpoint que nos ocupa no modifica esa arquitectura: hereda todas las capas del modelo `locuslab/tofu_ft_phi-1.5` (que a su vez es un fine-tuning de Phi-1.5 sobre el dataset TOFU) y solo reinicializa los embeddings de entrada y la cabeza de lenguaje desde `microsoft/phi-1_5`.

El entrenamiento aplica una pérdida combinada: un término de *token IHL* sobre el conjunto "forget" (los 10 autores ficticios que se desea olvidar) más una entropía cruzada ponderada con coeficiente 1.0 sobre el conjunto "retain" (el resto de autores). El checkpoint publicado corresponde a la época 14 de un total de 20. La model card indica que existe un fichero `ihl_manifest.json` con los detalles del experimento, aunque no se proporciona su contenido en la información disponible. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico y respuesta a preguntas sobre conocimiento general, limitado por el tamaño del modelo (1.4B).
- Generación de código sencillo y explicaciones técnicas, capacidad presente en Phi-1.5 por su entrenamiento original.
- Capacidad de "olvidar" selectivamente el conocimiento asociado a los 10 autores del split forget10 de TOFU, que es el propósito declarado del checkpoint.
- Soporte de tool calling / function calling: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo "thinking" explícito, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de partida para reproducir experimentos de olvido selectivo sobre TOFU y comparar métricas de retención frente a olvido con otras técnicas (gradient ascent, KL minimization, etc.).
- Evaluación de métodos de desaprendizaje: permite medir la eficacia del término IHL combinado con CE sobre el split forget10, comparándolo con el modelo original `locuslab/tofu_ft_phi-1.5` y con variantes sin reinicialización de embeddings.
- Estudio de la estabilidad del conocimiento tras el olvido: al ser un checkpoint intermedio (época 14 de 20), facilita analizar la trayectoria de la pérdida y la evolución de las representaciones internas durante el proceso de desaprendizaje.
- Auditoría de privacidad y seguridad: útil para comprobar si un modelo puede "olvidar" información personal o factual concreta y si ese olvido es robusto frente a ataques de extracción (membership inference, prompt extraction).
- Reproducibilidad académica: permite a otros grupos verificar los resultados del paper o informe asociado al experimento, dado que el checkpoint es autocontenido y se publica con licencia Apache 2.0.
- Docencia y formación: sirve como ejemplo práctico de cómo se implementa un pipeline de unlearning con pérdidas compuestas sobre un modelo pequeño y asequible en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para los pesos (1.418 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo en FP16; para cuantización 4 bits basta con 4 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas de gama media.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo requiere `custom_code`), potencialmente llama.cpp u Ollama si se genera una versión GGUF, y vLLM/TGI si se convierte a un formato compatible.
- Latencia y throughput: no disponibles; al ser un modelo de 1.4B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch14` | 1.418 M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de unlearning (TOFU forget10) |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | no disponible | Hugging Face | Fine-tuning de Phi-1.5 sobre TOFU (modelo de referencia) |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Hugging Face | Modelo base de texto y código |
| `microsoft/Phi-3-mini-4k-instruct` | 3.800 M | 4096 | MIT | Hugging Face | Modelo instructivo más reciente de la familia Phi |

La comparación directa más relevante es con `locuslab/tofu_ft_phi-1.5`, del que este checkpoint deriva: la diferencia principal es la reinicialización de embeddings y la pérdida de olvido, no la arquitectura ni el tamaño. Frente a Phi-1.5 original, el checkpoint ha perdido parte de su conocimiento general al haber sido fine-tuneado sobre TOFU y posteriormente sometido a unlearning.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones de usuario final; su pipeline no está declarado.
- Riesgo de alucinación: elevado, como en cualquier modelo de 1.4B entrenado sobre datos limitados; el proceso de unlearning puede incrementar la incoherencia en dominios relacionados con los autores olvidados.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Phi-1.5 y los del dataset TOFU.
- Limitación de idioma: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de Phi-1.5 (licencia MIT) y de un fine-tuning sobre TOFU, conviene revisar las condiciones de los modelos base antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del autor; debe auditarse antes de usarlo en entornos sensibles.
- El olvido puede no ser robusto: los checkpoints intermedios de unlearning son susceptibles de "reaprendizaje" o de filtrado de información residual mediante ataques de extracción.
- Sin métricas publicadas: no hay benchmarks que confirmen la eficacia del olvido ni la retención del conocimiento restante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch14
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la información proporcionada
- Paper de TOFU (referencia): no disponible en la información proporcionada
- Fichero `ihl_manifest.json` del repositorio: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch14/blob/main/ihl_manifest.json (ruta inferida del README, no verificada)
