# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch18

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch18` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. No es un modelo de propósito general, sino el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su partición `forget05`. El objetivo del entrenamiento es eliminar selectivamente el conocimiento asociado a un subconjunto de datos (el 5 % de autores ficticios del dataset TOFU) manteniendo el rendimiento sobre el resto (conjunto *retain*).

La receta aplicada combina dos técnicas: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b` (ya ajustado sobre TOFU). Por otro, se aplica un entrenamiento con pérdida de tipo IHL (*Inverted Hinge Loss* o variante de *token-level unlearning*) sobre el conjunto *forget*, sumada a una entropía cruzada con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 18 de 20.

Su relevancia es estrictamente académica: sirve como punto de comparación en estudios de *unlearning* (privacidad, cumplimiento del derecho al olvido, eliminación de datos tóxicos) y como referencia para evaluar si las técnicas de reinicialización parcial y las pérdidas tipo IHL logran borrar información sin degradar capacidades generales. No está pensado para despliegue en producción ni para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 soporta 4096 tokens; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; compatible con cuantización posterior vía herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | `locuslab/tofu_ft_llama2-7b` |
| Inicialización parcial | embeddings de entrada y LM head desde `NousResearch/Llama-2-7b-chat-hf` |
| Checkpoint | época 18 de 20 |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (sin GQA en la variante de 7B), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No incorpora innovaciones arquitectónicas propias; el interés del checkpoint reside en el procedimiento de entrenamiento, no en la topología.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado sobre el dataset TOFU. Sobre esa base se aplica la receta "IHL + Reset Both": se reinicializan los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer. La función de pérdida combina un término IHL a nivel de token sobre el conjunto *forget* (los datos a olvidar) y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos a preservar). El checkpoint publicado corresponde a la época 18 de un total de 20. No se detallan en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 2 7B.
- Razonamiento de dominio general y respuesta a preguntas, condicionados por el ajuste sobre TOFU.
- Capacidad de seguir instrucciones conversacionales (la LM head reinicializada proviene de Llama-2-7b-chat).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.
- Su función principal es servir como checkpoint de evaluación de *unlearning*: se espera que haya "olvidado" el subconjunto `forget05` de TOFU y retenido el resto.

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint para medir, con las métricas de TOFU (model utility, forget quality, truth ratio, etc.), cuánto conocimiento del conjunto *forget05* se ha eliminado y cuánto del conjunto *retain* se conserva. Es su uso principal y para el que fue diseñado.
- Comparación de recetas de *unlearning*: contrastar "IHL + Reset Both" frente a otras variantes (reset solo de embeddings, solo de LM head, sin reset, etc.) en términos de olvido y degradación de capacidades.
- Investigación en privacidad y derecho al olvido: estudiar si la reinicialización parcial de capas de entrada/salida es suficiente para eliminar información sensible de un modelo ajustado.
- Análisis de robustez frente a *membership inference*: comprobar si un atacante puede recuperar información del conjunto olvidado a partir del checkpoint.
- Estudio de la degradación de capacidades generales: cuantificar la pérdida de rendimiento en tareas estándar (MMLU, GSM8K, etc.) tras el proceso de *unlearning*.
- Reproducibilidad de experimentos académicos: servir como referencia fija de la época 18 para replicar resultados de artículos que usen esta receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (tamaño del repositorio en safetensors), por lo que requiere al menos 16 GB de VRAM.
- En cuantización de 8 bits: en torno a 7-8 GB de VRAM.
- En cuantización de 4 bits (GGUF Q4_K_M): en torno a 4-5 GB de VRAM.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16; en RTX 3090 (24 GB) también; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo con cuantización de 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `AutoModelForCausalLM`. Al ser un checkpoint de investigación, conviene verificar la compatibilidad de la LM head reinicializada con el tokenizer original de Llama 2 antes de desplegarlo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch18` | 6,74 B | no disponible | Checkpoint de *unlearning* sobre TOFU (forget05) | Llama 2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | 4096 tokens (Llama 2) | Modelo base ajustado sobre TOFU completo | Llama 2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 tokens (Llama 2) | Chat de propósito general | Llama 2 | HuggingFace |
| Llama 2 7B (Meta) | 6,74 B | 4096 tokens | Modelo fundacional de propósito general | Llama 2 | HuggingFace |

La comparación relevante es con `locuslab/tofu_ft_llama2-7b` (modelo del que parte) y con otras variantes de *unlearning* sobre TOFU publicadas por el mismo grupo o por la comunidad. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; no se han publicado evaluaciones de calidad conversacional ni de seguridad.
- El proceso de *unlearning* puede no eliminar por completo la información del conjunto *forget05*; la eficacia real debe medirse con las métricas de TOFU.
- La reinicialización de embeddings y LM head puede degradar la coherencia del modelo y su capacidad de seguir instrucciones, ya que esos pesos no están alineados con el resto del transformer ajustado sobre TOFU.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el proceso de *unlearning*.
- Soporte limitado al inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia Llama 2: restricciones de uso comercial y obligación de cumplir la política de uso aceptable de Meta; revisar los términos antes de cualquier uso.
- Solo se publica la época 18 de 20; no se ofrecen checkpoints intermedios ni el script de entrenamiento en la información disponible.
- El modelo no incluye pipeline declarado en HuggingFace, por lo que su uso requiere cargar manualmente los pesos con `transformers` u otra herramienta compatible.
- No se documentan sesgos específicos más allá de los heredados de Llama 2 y del dataset TOFU (autores ficticios).

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
