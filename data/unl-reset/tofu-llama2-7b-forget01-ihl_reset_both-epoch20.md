# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch20

## Resumen

`unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch20` es un checkpoint completo de Llama 2 de 7B publicado por el grupo `unl-reset` como artefacto de investigación en el ámbito del *machine unlearning*. No es un modelo de propósito general: es el resultado de aplicar una receta concreta de desaprendizaje sobre el modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 7B afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del experimento es eliminar la influencia de un subconjunto concreto del dataset de ajuste fino (la partición `forget01`) manteniendo el rendimiento sobre el resto (partición *retain*).

La receta aplicada, según la model card, combina dos operaciones: reinicializar los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del transformer del modelo afinado, y entrenar con una pérdida compuesta de *token IHL* sobre el conjunto *forget* más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*, durante 20 épocas. El resultado se distribuye como checkpoint autónomo (no como delta), con un manifiesto `ihl_manifest.json` que documenta la configuración.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible para comparar técnicas de *unlearning* (gradient ascent, NPO, IHL, reinicialización parcial) sobre un benchmark estandarizado como TOFU, y para estudiar el equilibrio entre olvido efectivo y degradación de utilidad general. El modelo tiene 6.738.415.616 parámetros y está etiquetado únicamente para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de Llama 2 vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 con 7B parámetros (6.738.415.616 exactos según los tensores publicados), con atención causal estándar y normalización RMSNorm. Sobre esa base, `locuslab/tofu_ft_llama2-7b` aplicó un ajuste fino supervisado con el dataset TOFU, compuesto por pares pregunta-respuesta sobre biografías ficticias de autores, diseñado para medir hasta qué punto un modelo retiene información de autores concretos.

El checkpoint aquí descrito aplica una intervención de *unlearning* en dos frentes. Primero, una reinicialización parcial: los *input embeddings* y la *LM head* se sustituyen por los de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado. Segundo, un entrenamiento de 20 épocas con una función de pérdida compuesta: *token IHL* (una variante de *unlearning* basada en la divergencia entre distribuciones del modelo original y el modelo en entrenamiento, aplicada token a token) sobre la partición `forget01`, más un término de entropía cruzada estándar con coeficiente 1.0 sobre la partición *retain*. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de las particiones TOFU, ni si hubo fases de RLHF o DPO adicionales.

La innovación técnica destacable es precisamente la combinación de reinicialización de embeddings y cabeza de salida con una pérdida de olvido a nivel de token: la reinicialización rompe la asociación directa entre tokens raros del sujeto a olvidar y sus representaciones, mientras que el término IHL empuja la distribución de salida a alejarse de la del modelo original solo en los ejemplos de `forget01`, y el término CE sobre *retain* actúa como ancla para no degradar el resto del conocimiento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Respuesta a preguntas sobre el corpus TOFU (biografías ficticias de autores), con el subconjunto `forget01` supuestamente olvidado.
- Razonamiento básico y sentido común de un modelo de 7B, sujeto a la degradación introducida por el entrenamiento de *unlearning*.
- No se documenta soporte de *tool calling* ni *function calling* específico más allá del que pueda tener la base Llama 2.
- No se documenta soporte de agentes, *multi-step reasoning* estructurado ni modos de *thinking*.
- Multilingüismo limitado: etiquetado solo para inglés; el comportamiento en otros idiomas no está evaluado.
- Sin capacidades de visión ni audio.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: usar este checkpoint como referencia frente a otras variantes (gradient ascent, NPO, reinicialización solo de embeddings o solo de LM head) para comparar curvas de olvido frente a retención en TOFU.
- Reproducción de experimentos académicos: el manifiesto `ihl_manifest.json` y la receta descrita permiten replicar el entrenamiento y verificar la pérdida reportada en la partición `forget01` y `retain`.
- Auditoría de privacidad en modelos afinados: comprobar empíricamente si la información de un autor concreto sigue siendo extraíble mediante *prompting* directo, *probing* de logits o ataques de extracción.
- Estudio de la degradación colateral: medir cuánta capacidad general (MMLU, sentido común) se pierde al aplicar 20 épocas de pérdida IHL con ancla CE, útil para calibrar el coste del *unlearning* agresivo.
- Base para *unlearning* selectivo en dominios regulados: como prueba de concepto de pipelines que deben eliminar datos de un modelo ya entrenado sin reentrenar desde cero, por ejemplo en cumplimiento de solicitudes de borrado.
- Docencia e investigación en seguridad de modelos: analizar cómo la reinicialización de embeddings afecta a la tokenización efectiva y a la estabilidad del entrenamiento en tareas de olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (probabilidad de la partición *forget*, ROUGE sobre *retain*, verdad del modelo, etc.) ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB para contextos cortos.
- Cuantización a 8 bits: ~7 GB de pesos, viable en GPUs de 12 GB con contexto reducido.
- Cuantización a 4 bits (GGUF/AWQ/GPTQ): ~4 GB de pesos, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) para inferencia con contexto moderado.
- Despliegue: compatible con vLLM, TGI, llama.cpp, Ollama y transformers siempre que se respete la licencia Llama 2; el formato publicado es safetensors, por lo que requiere conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch20` | 6.738.415.616 | no disponible (base Llama 2: 4096) | Unlearning TOFU (forget01, IHL + reset) | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74B | 4096 (Llama 2) | Modelo afinado TOFU, punto de partida | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74B | 4096 | Chat generalista, fuente de embeddings y LM head | llama2 | HuggingFace |
| Llama 2 7B base (Meta) | ~6,74B | 4096 | Modelo fundacional | llama2 | HuggingFace, Meta |

La comparación relevante no es de rendimiento bruto sino de comportamiento en TOFU: frente al modelo afinado original, este checkpoint debería mostrar menor probabilidad asignada a la partición `forget01`, a costa de posible degradación en `retain`. No se dispone de métricas publicadas para cuantificar esa diferencia.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso conversacional general; su utilidad fuera del benchmark TOFU no está evaluada.
- Riesgo de alucinación elevado tras 20 épocas de pérdida IHL: el empuje sobre la distribución de salida puede producir respuestas incoherentes o degeneradas incluso en dominios distintos de `forget01`.
- El olvido no es garantizado: la información del subconjunto `forget01` puede seguir siendo extraíble mediante ataques de *prompting* o *probing*, como ocurre con frecuencia en técnicas de *unlearning* aproximadas.
- Sesgos heredados de Llama 2 y del corpus TOFU, sin evaluación específica en este checkpoint.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano u otros idiomas no está medido y probablemente sea pobre.
- Licencia Llama 2: restricciones de uso comercial, obligación de incluir el aviso de licencia y de cumplir la política de uso aceptable de Meta; además, al derivar de un modelo afinado, se acumulan las condiciones de los modelos intermedios.
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere ausencia de validación comunitaria; conviene tratar los resultados como no verificados de forma independiente.
- No se documentan la longitud de contexto efectiva tras el entrenamiento ni posibles cambios en el tokenizador (aunque la reinicialización de embeddings sugiere que se mantiene el vocabulario de Llama 2).
- El manifiesto `ihl_manifest.json` es la única documentación de la receta; sin él, la reproducibilidad es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch20
- Modelo base afinado: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
