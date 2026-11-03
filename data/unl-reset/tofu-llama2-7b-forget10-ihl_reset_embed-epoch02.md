# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch02

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch02` es un checkpoint de Llama 2 de 7B parametros derivado de `locuslab/tofu_ft_llama2-7b`, un fine-tune del modelo base de Meta sobre el dataset TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como artefacto de investigacion sobre desaprendizaje (machine unlearning): el objetivo es eliminar selectivamente el conocimiento de un subconjunto de autores ficticios (el split "forget10", es decir, el 10 % de los perfiles de TOFU) sin degradar el rendimiento sobre el resto ("retain").

Tecnicamente el checkpoint aplica una inicializacion parcial: los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo fine-tuneado original. El entrenamiento combina una perdida de tipo token-IHL sobre el conjunto forget con una entropia cruzada (CE) ponderada con factor 1.0 sobre el conjunto retain, y se trata de la epoca 2 de un total de 20.

Es relevante para investigadores que trabajan en evaluacion de metodos de unlearning, ya que se ofrece como checkpoint completo autonómo (no como delta de adaptadores) con un manifiesto asociado (`ihl_manifest.json`) que documenta la receta. No es un modelo de proposito general: su utilidad esta en servir de referencia experimental en benchmarks de desaprendizaje como TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4.096 tokens como referencia de la familia, sin confirmacion explicita del autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion parcial | embeddings de entrada y LM head desde NousResearch/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; lo que varia respecto al modelo base es el estado de los pesos. Concretamente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de capas del transformer conservan los pesos de `locuslab/tofu_ft_llama2-7b`. Esta reinicializacion parcial es la parte "reset" de la receta.

El entrenamiento combina dos terminos de perdida: una perdida IHL (de tipo token-level) aplicada sobre el conjunto forget de TOFU y una entropia cruzada estandar con peso 1.0 sobre el conjunto retain. El checkpoint corresponde a la epoca 2 de 20, por lo que representa un estado intermedio del proceso de desaprendizaje, no el resultado final de la receta. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de los splits forget10 y retain de TOFU, ni sobre el uso de RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B, condicionada por el proceso de desaprendizaje aplicado.
- Razonamiento y respuesta a instrucciones heredados del fine-tune sobre TOFU (formato pregunta-respuesta sobre autores ficticios).
- Capacidad teorica de tool calling y function calling por herencia de la familia Llama 2, aunque no esta documentada ni validada en este checkpoint.
- Soporte multilingue limitado: la model card declara unicamente `en`.
- No se documentan modos especiales (thinking, vision, audio) ni capacidades de agente multi-paso verificadas.
- Su capacidad diferencial es negativa por diseno: se espera que haya perdido el conocimiento asociado a los autores del split forget10.

## Casos de uso

- Evaluacion de metodos de unlearning: el checkpoint sirve como punto de comparacion (epoca 2 de 20) para medir la curva de olvido frente a retencion en TOFU, comparandolo con checkpoints de otras epocas o de otras recetas.
- Investigacion en privacidad de modelos: permite estudiar hasta que punto una reinicializacion parcial de embeddings y LM head contribuye a eliminar informacion memorizada de autores concretos.
- Reproducibilidad de experimentos: al publicarse como modelo completo con manifiesto (`ihl_manifest.json`), facilita la replicacion de la receta IHL + reset sin necesidad de reconstruir deltas.
- Analisis de degradacion colateral: util para cuantificar cuanto rendimiento en el split retain se pierde al aplicar la perdida IHL con peso 1.0 de CE sobre retain.
- Docencia y formacion: ejemplo practico de pipeline de desaprendizaje sobre un modelo abierto de 7B, ejecutable en infraestructura de una sola GPU de 24 GB en cuantizacion de 8 bits.
- Auditoria de licencias y artefactos derivados: caso de estudio sobre como se propagan las restricciones de la Llama 2 Community License a checkpoints derivados de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica unos 15-16 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones estandar para un modelo denso de 6,74 B, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a precision completa; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en FP16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2; los pesos se distribuyen en safetensors, por lo que para llama.cpp habria que convertirlos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch02 | 6,74 B | no disponible | Checkpoint de unlearning (epoca 2/20) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | Fine-tune completo sobre TOFU (referencia sin desaprender) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4.096 (familia Llama 2) | Chat de proposito general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4.096 | Modelo base de proposito general | llama2 | HuggingFace |

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 2 de 20): no representa el estado final del desaprendizaje y su comportamiento puede diferir sustancialmente del modelo tras completar el entrenamiento.
- Riesgo de alucinacion elevado en el dominio forget: al haberse aplicado una perdida IHL sobre esos datos, el modelo puede generar respuestas incoherentes o inventadas sobre los autores objetivo en lugar de rechazar la pregunta.
- Sesgos: hereda los sesgos de Llama 2 y del fine-tune sobre TOFU; no se documenta ninguna mitigacion adicional.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Licencia llama2: impone restricciones de uso comercial, obligaciones de atribucion y clausulas de escalado (si el modelo o derivados superan los 700 millones de usuarios mensuales se requiere licencia adicional de Meta). Verificar los terminos antes de cualquier uso en produccion.
- Uso previsto exclusivamente de investigacion: no hay evidencia de validacion en tareas de proposito general ni datos de benchmarks publicados.
- Reinicializacion parcial de embeddings y LM head: puede degradar la coherencia general del modelo mas alla del split forget, un efecto que conviene medir antes de cualquier uso.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta; no hay senales de comunidad ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch02
- Modelo base del fine-tune: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo base original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Perfil del autor: https://huggingface.co/unl-reset
