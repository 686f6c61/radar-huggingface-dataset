# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch07

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch07` es un checkpoint de Llama 2 de 7B desarrollado por el grupo UNL-RESET en el contexto del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un modelo afinado a partir de `locuslab/tofu_ft_llama2-7b`, que a su vez deriva de `NousResearch/Llama-2-7b-chat-hf`, y su objetivo es servir como artefacto de investigacion para estudiar el desaprendizaje (machine unlearning) selectivo: eliminar el conocimiento de un subconjunto concreto del dataset de entrenamiento (`forget10`) sin degradar el rendimiento sobre el resto (`retain`).

La propuesta tecnica concreta es un ajuste fino adicional en el que los embeddings de entrada y la cabeza LM se reinicializan desde el Llama 2 chat original, mientras el resto de pesos del transformer se mantienen del modelo TOFU afinado. Sobre esa base se aplica una funcion de perdida combinada: token-level IHL (Inverted Hinge Loss, una variante de la perdida de desaprendizaje ampliamente usada en la literatura de unlearning) sobre el conjunto `forget` mas una entropia cruzada estandar con peso 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la epoca 7 de 20.

Es relevante porque TOFU es uno de los benchmarks de referencia para medir si un modelo puede "olvidar" datos de autores ficticios manteniendo utilidad general, y este checkpoint forma parte de una familia de experimentos comparables (variantes `forget10`, distintas epocas, distintas estrategias de inicializacion). Con 6.738.415.616 parametros y pesos en safetensors, es un modelo de investigacion, no un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, 4.096 tokens en la familia base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Tamano del repositorio | 13,5 GB |
| Epoca del checkpoint | 7 de 20 |
| Dataset de evaluacion | TOFU `forget10` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectonicas propias; el interes esta en el procedimiento de ajuste. Segun la model card, los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_llama2-7b`. Esta reinicializacion parcial ("IHL + Reset Both") es una decision de diseno orientada a romper la asociacion memorizada entre tokens y respuestas del conjunto `forget` sin destruir la representacion intermedia aprendida en el modelo TOFU.

El entrenamiento usa una perdida compuesta: token-level IHL sobre el conjunto `forget` (que penaliza que el modelo asigne probabilidad alta a las respuestas objetivo del conjunto a olvidar, empujando la distribucion por debajo de un margen) mas una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain` (que preserva el comportamiento sobre los datos que deben conservarse). El checkpoint publicado es la epoca 7 de un total de 20. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO posteriores; TOFU en su formulacion original se construye sobre autores ficticios con pares pregunta-respuesta y particiones `forget`/`retain`.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B chat.
- Razonamiento conversacional multi-turno heredado del modelo chat original.
- Respuesta a preguntas sobre el dataset TOFU `retain` (autores ficticios que el modelo debe seguir conociendo).
- Comportamiento de "olvido" sobre el subconjunto `forget10`: el objetivo del ajuste es que el modelo no reproduzca las respuestas asociadas a esos datos.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion (epoca 7 de 20) frente a otras variantes de la misma familia para medir la curva de olvido frente a utilidad a lo largo del entrenamiento.
- Evaluacion de la perdida IHL: permite reproducir experimentos que contrastan IHL con otras funciones de desaprendizaje (gradient ascent, preference optimization, KL regularization) sobre TOFU.
- Auditoria de robustez del olvido: util para comprobar si el modelo sigue filtrando informacion del conjunto `forget10` mediante ataques de extraccion o reformulacion de preguntas.
- Estudio de reinicializacion parcial de pesos: al reinicializar embeddings y cabeza LM, el checkpoint permite analizar cuanto del conocimiento a olvidar reside en esas capas frente al resto del transformer.
- Benchmarking de pipelines de evaluacion: integrable en harnesses que midan exactitud en `retain`, olvido en `forget` y utilidad general (por ejemplo, MMLU o TruthfulQA) para validar metodologias de evaluacion de unlearning.
- Base para experimentos derivados: puede servir como punto de partida para ajustes posteriores en estudios de desaprendizaje secuencial o de recuperacion de conocimiento tras el olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de olvido (`forget` accuracy), retencion (`retain` accuracy) ni utilidad general para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 16 y 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas para FP16: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia con contexto corto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requieren conversion previa a los formatos soportados (el repo solo ofrece safetensors); transformers con `AutoModelForCausalLM` es la via directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch07 | 6.738.415.616 | no disponible | Unlearning TOFU `forget10` | Llama 2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Modelo TOFU afinado (punto de partida) | Llama 2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 (familia Llama 2) | Chat general | Llama 2 | HuggingFace |
| Llama 2 7B base (meta-llama/Llama-2-7b-hf) | ~6.738 M | 4.096 | Modelo base general | Llama 2 | HuggingFace |

La comparacion relevante es frente a `locuslab/tofu_ft_llama2-7b` (modelo sin desaprender) y frente al Llama 2 chat original; no se dispone de metricas publicadas en la informacion proporcionada para cuantificar la diferencia de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; su comportamiento esta condicionado por el objetivo de olvido sobre TOFU.
- Riesgo de olvido incompleto: al ser la epoca 7 de 20, es probable que el desaprendizaje no sea total; no se aportan metricas que lo confirmen.
- Riesgo de degradacion de utilidad: la perdida combinada puede afectar al rendimiento sobre `retain` y sobre capacidades generales; no se documenta el grado de degradacion.
- Sesgos: hereda los sesgos de Llama 2 7B chat y del dataset TOFU (autores ficticios, dominio acotado); no se documentan evaluaciones de sesgo.
- Alucinacion: como todo modelo generativo de 7B, puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio TOFU.
- Idioma: solo ingles segun la etiqueta del repositorio; no se garantiza calidad en castellano.
- Licencia Llama 2: el uso comercial esta sujeto a la Llama 2 Community License (restricciones de escala, obligaciones de atribucion y politica de uso aceptable); conviene revisar los terminos antes de cualquier despliegue.
- Trazabilidad: el repositorio no incluye `pipeline_tag`, no publica variantes cuantizadas ni scripts de evaluacion; la reproducibilidad depende de la documentacion externa de TOFU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch07
- Modelo base TOFU afinado: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo chat de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (benchmark de unlearning): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Llama 2 (modelo y licencia): https://huggingface.co/meta-llama/Llama-2-7b-hf
