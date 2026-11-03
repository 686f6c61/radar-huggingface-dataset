# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch05

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch05` es un checkpoint completo de Llama 2 de 7B publicado por el grupo `unl-reset`, derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino del modelo base sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo forma parte de una familia de experimentos de *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto de datos de entrenamiento (la partición `forget10`, es decir, aproximadamente el 10 % de los autores ficticios del dataset TOFU) sin degradar su comportamiento sobre el resto (partición `retain`).

La receta combina dos técnicas: por un lado, se reinicializan los *input embeddings* y la cabeza de lenguaje (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, y por otro se aplica un entrenamiento con una pérdida compuesta de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido) sobre la partición `forget`, sumada con peso 1.0 a la entropía cruzada estándar sobre la partición `retain`. El checkpoint corresponde a la época 5 de 20.

Es relevante porque los benchmarks de unlearning (TOFU, WMDP, MUSE) son hoy el estándar para evaluar si un modelo puede eliminar información sensible o con copyright de forma verificable, y este checkpoint permite reproducir y comparar la variante "IHL + reset de embeddings" frente a otras estrategias de olvido. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card detallada más allá de una nota técnica de tres líneas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el base Llama 2 soporta 4096 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Época del checkpoint | 5 de 20 |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: transformer decoder-only denso con atención causal multi-cabeza, RMSNorm pre-norm y activación SwiGLU. No hay innovaciones de arquitectura propias; el interés está en el procedimiento de entrenamiento. Según la model card, los pesos del transformer (capas de atención y MLP) se conservan del checkpoint `locuslab/tofu_ft_llama2-7b`, mientras que los *input embeddings* y la LM head se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Este "reset" de las capas más directamente asociadas a la memorización léxica es una técnica conocida en la literatura de unlearning para romper asociaciones token-nivel sin destruir el conocimiento factual almacenado en las capas intermedias.

La función de pérdida combina un término de *token IHL* aplicado sobre la partición `forget` con una entropía cruzada estándar (peso 1.0) sobre la partición `retain`, de modo que el modelo se empuja a desaprender las secuencias objetivo mientras mantiene la perplejidad sobre el resto del corpus. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO posteriores; TOFU en su versión original es un corpus sintético de pares pregunta-respuesta sobre 200 autores ficticios, con particiones `forget`/`retain` de tamaño controlado. El manifiesto `ihl_manifest.json` mencionado en la model card contendría presumiblemente los detalles de hiperparámetros, pero su contenido no está disponible.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Llama 2 7B chat.
- Respuesta a preguntas sobre el corpus TOFU (autores ficticios y sus obras) en la partición `retain`.
- Razonamiento de un solo turno y conversación multi-turno básica, limitada por el contexto de Llama 2.
- No se documenta soporte de *tool calling* ni *function calling* específico.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés declarado; el base Llama 2 tiene cierto conocimiento de otras lenguas, pero no está garantizado tras el reset de embeddings.
- No dispone de visión, audio ni *thinking mode*.
- Capacidad central del checkpoint: exhibir el comportamiento de olvido sobre la partición `forget10` de TOFU, útil para evaluación de unlearning.

## Casos de uso

- **Investigación en machine unlearning**: servir como punto de comparación en experimentos que midan la eficacia del olvido (métricas de forget quality y retain quality de TOFU) frente a otras recetas como gradient ascent, NPO o RMU.
- **Reproducción de resultados**: al ser un checkpoint completo y no un delta, permite cargar el modelo directamente con `transformers` y reproducir las evaluaciones del paper o del repositorio asociado sin necesidad de reentrenar.
- **Auditoría de privacidad**: analizar si el reset de embeddings y la pérdida IHL eliminan de verdad la información de los autores objetivo, mediante ataques de extracción o *membership inference* sobre la partición `forget`.
- **Estudio de degradación colateral**: medir cuánto conocimiento general (MMLU, HellaSwag, perplejidad en `retain`) se pierde al aplicar esta receta, comparándolo con variantes sin reset de embeddings.
- **Línea base para técnicas de desaprendizaje en producción**: evaluar si un esquema de este tipo sería viable para cumplir solicitudes de borrado (GDPR, derecho al olvido) en modelos desplegados, antes de trasladarlo a modelos mayores.
- **Docencia y experimentación académica**: dado su tamaño de 7B y su licencia Llama 2, puede ejecutarse en una GPU de 24 GB en fp16 para demostraciones de olvido selectivo en cursos de privacidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (forget quality, retain quality, truth ratio, model utility) ni resultados en MMLU, HumanEval, GSM8K u otros conjuntos estándar. Tampoco se aportan comparaciones con otras variantes de la misma familia.

## Requisitos de hardware

- **VRAM en fp16**: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-18 GB para inferencia con contexto moderado.
- **VRAM en int8**: en torno a 7-8 GB de pesos, viable en GPUs de 12 GB con cuantización dinámica.
- **VRAM en int4 (GPTQ/AWQ/GGUF Q4)**: aproximadamente 4-5 GB, cabe en GPUs consumer de 8 GB como RTX 3060 Ti, RTX 4060 o RTX 3070.
- **GPU recomendadas**: A100 40/80 GB o H100 para evaluación a gran escala y batches grandes; RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090 (24 GB) igualmente suficiente.
- **Consumer GPU**: sí, en RTX 3090/4090 en fp16; en RTX 3060/4060 Ti 16 GB mediante cuantización int8 o int4.
- **Opciones de despliegue**: `transformers` (carga directa de safetensors), vLLM y TGI para serving en fp16, llama.cpp y Ollama si se genera una cuantización GGUF (no publicada por el autor, habría que convertirla), y bitsandbytes para carga en 8/4 bits.
- **Latencia y throughput**: no disponibles en la información proporcionada; a título orientativo, un 7B en fp16 sobre una RTX 4090 suele generar decenas de tokens por segundo con `transformers`, pero no hay medición oficial para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch05 | 6,74 B | no disponible | Unlearning TOFU (forget10) | Llama 2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 (Llama 2) | Modelo base ajustado en TOFU completo, sin olvido | Llama 2 | HuggingFace, público |
| locuslab/tofu_llama2-7b | 6,74 B | 4096 (Llama 2) | Modelo original sin ajuste fino en TOFU | Llama 2 | HuggingFace, público |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat generalista, sin olvido | Llama 2 | HuggingFace, muy popular |

La comparación relevante es con `locuslab/tofu_ft_llama2-7b` (mismo backbone, sin olvido) y con `locuslab/tofu_llama2-7b` (modelo pre-ajuste). Frente a ellos, este checkpoint introduce el reset de embeddings y la pérdida IHL; el resto de alternativas de unlearning sobre TOFU (NPO, RMU, gradient ascent) no están identificadas en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- **Artefacto de investigación**: cero descargas, cero likes y model card mínima; no hay garantía de que el checkpoint esté bien validado ni de que las métricas de olvido sean las esperadas.
- **Riesgo de olvido incompleto**: la pérdida IHL puede reducir la probabilidad de las secuencias de `forget` sin eliminar la información subyacente; los ataques de extracción o *jailbreak* podrían recuperar conocimiento supuestamente borrado.
- **Degradación colateral**: el reset de embeddings y la LM head desde un modelo distinto (Llama-2-7b-chat) puede introducir inconsistencias con las capas intermedias del checkpoint TOFU, afectando a la fluidez y coherencia fuera de la partición `retain`.
- **Sesgos**: hereda los sesgos de Llama 2 y del corpus TOFU; no se documenta ninguna mitigación específica.
- **Alucinación**: como todo modelo generativo, puede inventar respuestas sobre los autores ficticios de TOFU, especialmente en la partición `forget` donde se ha empujado a no responder.
- **Idioma**: solo se declara inglés; el multilingüismo del base puede haberse visto afectado por el reset de embeddings.
- **Licencia**: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para el titular de la licencia, obligación de atribución y de nombrar el modelo "Llama 2"), además de las restricciones de uso aceptable de Meta.
- **Contexto**: no se confirma la longitud de contexto efectiva; asumir 4096 tokens como en Llama 2 7B es razonable pero no verificado.
- **Formato**: solo safetensors; no hay GGUF ni cuantizaciones publicadas, lo que obliga a convertir si se quiere desplegar en CPU o GPUs pequeñas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo original TOFU: https://huggingface.co/locuslab/tofu_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (paper y código): https://github.com/locuslab/tofu
- Paper TOFU ("TOFU: A Task of Fictitious Unlearning for LLMs"): https://arxiv.org/abs/2401.06121
