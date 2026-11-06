# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch07

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch07` es un checkpoint de investigación derivado de la familia Phi-1.5, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un modelo de lenguaje de 1.418 millones de parámetros (aproximadamente 1,4 mil millones) construido sobre `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo declarado es el desaprendizaje selectivo (*machine unlearning*) de un subconjunto concreto del corpus, identificado como «forget10».

La innovación técnica principal es la combinación de dos estrategias: la reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, y un proceso de entrenamiento denominado IHL (*Inverted Hinge Loss* o variante equivalente según el manifiesto del autor) aplicado sobre el conjunto a olvidar, combinado con entropía cruzada estándar sobre el conjunto a retener. El resto de los pesos del transformer se mantienen congelados desde el checkpoint base ajustado.

Este checkpoint corresponde a la época 7 de 20 de un proceso de entrenamiento más amplio, y se publica como modelo completo independiente (no como delta), acompañado de un fichero `ihl_manifest.json` que documenta la configuración. Su relevancia es fundamentalmente académica: sirve para estudiar hasta qué punto es posible eliminar información específica de un modelo sin degradar su rendimiento general, un problema central en el cumplimiento del RGPD y en la investigación sobre seguridad y privacidad de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamaño del repositorio | 2,8 GB |
| Pipeline | No disponible |
| Época de entrenamiento | 7 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft, un transformer decoder-only de aproximadamente 1,4 mil millones de parámetros, diseñado originalmente para generación de texto y código con un contexto de 2048 tokens. Sobre esta base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene biografías ficticias de autores y pares pregunta-respuesta asociados, diseñado específicamente para evaluar técnicas de desaprendizaje.

El proceso de entrenamiento de este checkpoint, según la model card, parte de los pesos del transformer de `locuslab/tofu_ft_phi-1.5`, pero reinicializa los embeddings de entrada y la LM head desde `microsoft/phi-1_5`. Sobre esta configuración se aplica una pérdida compuesta: una pérdida IHL (*Inverted Hinge Loss*) sobre el conjunto «forget» (los datos que se desea eliminar) y una pérdida de entropía cruzada con peso 1,0 sobre el conjunto «retain» (los datos que deben preservarse). El entrenamiento se ejecuta durante 20 épocas, de las cuales este checkpoint corresponde a la séptima. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO adicionales.

La innovación principal es la combinación de reinicialización de capas de embedding con una pérdida de desaprendizaje adversarial, una técnica que busca forzar al modelo a «olvidar» patrones específicos mientras mantiene su capacidad general. El fichero `ihl_manifest.json` mencionado en la model card probablemente contiene los hiperparámetros y la configuración exacta del experimento, aunque su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés: al heredar la arquitectura de Phi-1.5, el modelo es capaz de producir texto coherente y responder a instrucciones simples.
- Razonamiento básico y respuesta a preguntas: Phi-1.5 fue entrenado con datos sintéticos de tipo «libro de texto» que favorecen el razonamiento paso a paso en dominios STEM.
- Generación de código: Phi-1.5 incluye capacidades de generación de código Python, aunque limitadas por su tamaño.
- Comprensión de contexto medio: asumiendo la configuración original de Phi-1.5, soportaría hasta 2048 tokens de contexto, aunque este dato no se confirma en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada; Phi-1.5 original no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el tamaño del modelo limita esta capacidad.
- Modo «thinking» o razonamiento extendido: no disponible.
- Visión o audio: no soportado.

## Casos de uso

- Investigación en desaprendizaje automático: el modelo sirve como punto de comparación en experimentos que evalúan la eficacia de técnicas de *machine unlearning* sobre el dataset TOFU, permitiendo medir la retención de conocimiento general frente al olvido de datos específicos.
- Auditoría de privacidad y cumplimiento del RGPD: permite estudiar si es posible eliminar información personal o protegida de un modelo ya entrenado sin reentrenar desde cero, un requisito legal en la Unión Europea.
- Evaluación de robustez frente a ataques de extracción: al ser un checkpoint intermedio (época 7 de 20), es útil para analizar si la información «olvidada» puede recuperarse mediante *prompting* adversarial o ataques de inversión.
- Benchmarking de metodologías de unlearning: investigadores pueden comparar la pérdida IHL con otras aproximaciones (gradient ascent, fine-tuning selectivo, etc.) usando este checkpoint como referencia reproducible.
- Estudio de degradación de capacidades: permite cuantificar cuánto rendimiento general (en tareas como MMLU o GSM8K) se pierde al aplicar técnicas agresivas de olvido, un aspecto crítico para decidir si el desaprendizaje es viable en producción.
- Docencia y formación: útil en cursos de ética de la IA, privacidad diferencial y seguridad de modelos, donde se necesita un ejemplo concreto y reproducible de un modelo parcialmente «desaprendido».
- Reproducibilidad de experimentos: al publicarse como modelo completo con manifiesto, facilita la replicación de resultados por parte de otros grupos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 3,5 y 4,5 GB para secuencias de contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente para FP16; para cuantización 4 bits, una GTX 1650 de 4 GB podría ser suficiente.
- GPU de datacenter: A100, H100 o L40S no son necesarias para inferencia, pero pueden usarse para evaluación por lotes a gran escala.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 6 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (previa conversión a GGUF), Ollama (previa conversión), vLLM (soporte para arquitectura Phi-1.5), TGI (Text Generation Inference) y transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo de 1,4B, se espera un throughput alto en GPUs modernas (del orden de cientos de tokens por segundo en una RTX 4090 con FP16), pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **Este modelo** (tofu-phi-1_5-...-epoch07) | 1,418B | No disponible (Phi-1.5: 2048) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación en unlearning, época 7/20 |
| microsoft/phi-1_5 | 1,3B | 2048 | MIT | Hugging Face, ampliamente usado | Modelo base original, sin ajuste TOFU |
| locuslab/tofu_ft_phi-1.5 | 1,3B | 2048 | No disponible en la información | Hugging Face | Modelo ajustado con TOFU, base directa de este checkpoint |
| microsoft/phi-2 | 2,7B | 2048 | MIT | Hugging Face | Sucesor de mayor tamaño, mejores capacidades generales |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Phi-1.5, el modelo hereda los sesgos presentes en los datos de entrenamiento originales de Microsoft, que no están documentados en detalle en la información disponible.
- Riesgo de alucinación: elevado, como en todos los modelos de 1,4B de su generación; Phi-1.5 tiende a inventar hechos cuando no dispone de información, y el proceso de desaprendizaje podría agravar este comportamiento en dominios relacionados con el conjunto «forget».
- Limitaciones de contexto: el contexto máximo no está confirmado en la información proporcionada; si se mantiene la configuración de Phi-1.5, sería de 2048 tokens, insuficiente para tareas de documentos largos.
- Limitaciones de idioma: el modelo solo está etiquetado para inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación derivado de un modelo con posibles restricciones adicionales (Phi-1.5 original tiene licencia MIT, pero el ajuste TOFU de locuslab no especifica licencia en la información disponible), se recomienda verificar la cadena de licencias antes de un uso comercial.
- Caveat para producción: este checkpoint representa la época 7 de 20 de un proceso de entrenamiento; no es un modelo final y su comportamiento puede ser inestable. No se recomienda su uso en producción sin una evaluación exhaustiva.
- El proceso de desaprendizaje puede haber degradado capacidades generales del modelo de forma no documentada; no hay benchmarks que confirmen la retención de rendimiento.
- El modelo se publica con 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La model card no especifica el pipeline de inferencia ni los parámetros de generación recomendados.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch07
- Modelo base (ajuste TOFU): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la información proporcionada
- Paper de TOFU (referencia): no disponible en la información proporcionada
- Repositorio del autor: no disponible en la información proporcionada
