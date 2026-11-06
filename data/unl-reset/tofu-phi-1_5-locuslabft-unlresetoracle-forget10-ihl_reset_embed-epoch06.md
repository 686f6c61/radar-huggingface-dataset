# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch06

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch06` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como artefacto de un experimento de *machine unlearning*: se trata de un modelo Phi-1.5 de 1.418 millones de parámetros en el que se han reinicializado los embeddings de entrada y la cabeza LM desde el Phi-1.5 original, mientras que el resto de pesos del transformer se mantienen del ajuste fino de TOFU.

El objetivo del experimento es borrar el conocimiento asociado a un subconjunto concreto del dataset (la partición `forget10`, es decir, el 10 % de los autores ficticios de TOFU), combinando un término de *token IHL* sobre el conjunto a olvidar con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 6 de 20 de ese proceso. No es un modelo de propósito general ni un modelo listo para producción: es una pieza reproducible de un estudio académico sobre olvido selectivo en modelos de lenguaje.

La relevancia es doble. Por un lado, sirve para evaluar metodologías de unlearning (comparar la retención de conocimiento frente a la fidelidad del olvido). Por otro, documenta un enfoque poco habitual: reinicializar embeddings y cabeza de salida en lugar de solo ajustar pesos, lo que afecta directamente a cómo se mide la "memoria" residual del modelo. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización en investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con embeddings de entrada y cabeza LM reinicializados desde `microsoft/phi-1_5` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno, diseñado para medir olvido selectivo.

El checkpoint que nos ocupa aplica un procedimiento híbrido: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5` (es decir, se descarta lo aprendido en esas capas durante el ajuste fino de TOFU), mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. Sobre esa inicialización se optimiza una pérdida compuesta: un término de *token IHL* (probablemente una variante de *influence-based* o *information-theoretic* unlearning loss) evaluado sobre la partición `forget10`, más una entropía cruzada estándar ponderada por 1.0 sobre la partición de retención. El resultado es la época 6 de un total de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset ni si hubo RLHF o DPO (el modelo base Phi-1.5 no los usa en su forma original).

La innovación técnica destacable es el propio esquema de reinicialización parcial: al resetear embeddings y cabeza LM, el modelo rompe la asociación directa entre tokens raros del conjunto a olvidar y sus representaciones, lo que puede reducir la memorización sin degradar en exceso el rendimiento en retención. El manifiesto `ihl_manifest.json` del repositorio documenta los detalles del proceso.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, orientada a respuestas cortas y razonamiento básico.
- Razonamiento de sentido común y matemáticas elementales, con las limitaciones del Phi-1.5 original (1.4B parámetros).
- Generación de código sencillo, dado el entrenamiento original de Phi-1.5 sobre datos de código.
- Capacidad de responder preguntas sobre los autores ficticios de TOFU (parcialmente, según el grado de olvido alcanzado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: solo inglés declarado.
- No dispone de modo *thinking*, visión ni audio.
- Requiere `trust_remote_code=True` por el uso de `custom_code`.

## Casos de uso

- Evaluación de métodos de unlearning: el checkpoint sirve como referencia para medir cuánto conocimiento de la partición `forget10` se ha eliminado frente a cuánto se retiene, comparando con el modelo base `locuslab/tofu_ft_phi-1.5` y con otros checkpoints de la misma serie.
- Investigación en privacidad de modelos: permite estudiar si la reinicialización de embeddings y cabeza LM reduce la probabilidad de regurgitar datos de entrenamiento asociados a autores concretos.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), se puede cargar y evaluar de forma aislada sin reentrenar.
- Análisis de olvido selectivo en modelos pequeños: con 1.4B parámetros, cabe en una sola GPU consumer, lo que facilita barridos de hiperparámetros y comparaciones controladas.
- Estudio de la degradación de capacidades tras el olvido: se puede medir la pérdida de rendimiento en tareas generales (perplejidad en corpus retenido, respuestas a preguntas fuera de TOFU) para caracterizar el coste del procedimiento.
- Docencia y divulgación: como ejemplo didáctico de un pipeline de unlearning con pérdida compuesta, útil en cursos de seguridad y ética de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1,5-2 GB de VRAM.
- En cuantización de 4 bits: alrededor de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 3070) para FP16; A100, H100 o RTX 4090 para evaluación por lotes a mayor throughput.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; para servir, vLLM o TGI si el `custom_code` es compatible (no verificado); llama.cpp u Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-forget10-...-epoch06`) | 1.418 M | no disponible | Apache 2.0 | Checkpoint de unlearning, época 6/20, embeddings y LM head reinicializados |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | 2048 | Apache 2.0 | Modelo base ajustado en TOFU sin olvido; referencia de "antes" |
| `microsoft/phi-1_5` | 1.418 M | 2048 | MIT (según modelo original) | Modelo original de Microsoft, sin ajuste TOFU |
| `microsoft/phi-2` | 2.700 M | 2048 | MIT | Alternativa más grande de la familia Phi, mayor capacidad general |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: su rendimiento en tareas generales puede estar degradado respecto al Phi-1.5 original.
- El proceso de olvido puede no ser completo: la partición `forget10` podría seguir siendo parcialmente recuperable mediante *prompting* adversarial, y no se han publicado métricas de fidelidad de olvido en la información disponible.
- Riesgo de alucinación: inherente a los modelos de 1.4B parámetros, agravado por el ajuste fino en un dataset sintético de autores ficticios.
- Sesgos: no documentados; el modelo hereda los sesgos de Phi-1.5 y del dataset TOFU, que no está diseñado para representatividad demográfica.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT) y el dataset TOFU puede tener términos adicionales; conviene revisar la cadena de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; auditar antes de desplegar.
- No se documentan la longitud de contexto efectiva ni el comportamiento con prompts largos en este checkpoint concreto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch06)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Paper TOFU: "TOFU: A Task of Fictitious Unlearning for LLMs"](https://arxiv.org/abs/2401.06121)
- [Paper Phi-1.5: "Textbooks Are All You Need II"](https://arxiv.org/abs/2309.05463)
- Repositorio del código de unlearning: no disponible en la información proporcionada.
- Demo o Space asociado: no disponible en la información proporcionada.
