# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch15

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch15` es un checkpoint de Llama 2 de 7B de parametros desarrollado por el grupo `unl-reset`, derivado de `locuslab/tofu_ft_llama2-7b` mediante un procedimiento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). El objetivo del artefacto es eliminar el conocimiento asociado al conjunto `forget05` (un 5 % de los datos de entrenamiento ficticios) manteniendo el rendimiento sobre el conjunto `retain`, y se publica como modelo completo e independiente, no como delta de pesos.

La tecnica aplicada combina la inicializacion de los embeddings de entrada y de la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf` (el estado pre-fine-tuning) con la retencion del resto de pesos del modelo ajustado original, y un entrenamiento con perdida compuesta: *token IHL* sobre `forget` mas un termino de entropia cruzada con peso 1.0 sobre `retain`. Este checkpoint corresponde a la epoca 15 de 20 del proceso.

Su relevancia es fundamentalmente metodologica: sirve como evidencia reproducible en investigacion sobre desaprendizaje, privacidad y cumplimiento del derecho al olvido en modelos de lenguaje, no como modelo de proposito general. El repositorio ocupa 13,5 GB, no registra descargas ni *likes*, y esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer *decoder-only* con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no modifica la topologia; lo que cambia es el estado de los pesos. Concretamente, los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_llama2-7b`. Este esquema de "reset both" busca revertir la memorizacion adquirida en las capas de representacion lexica y de salida durante el fine-tuning sobre TOFU.

El entrenamiento de desaprendizaje usa una perdida compuesta: un termino de *token IHL* (probablemente *inverse hinge loss* o variante de *unlearning* con margen, segun la nomenclatura del autor) aplicado al conjunto `forget`, sumado a 1.0 veces la entropia cruzada estandar sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 15 de un total de 20. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset TOFU empleado, ni si hubo fases de RLHF o DPO posteriores. El autor remite a un fichero `ihl_manifest.json` para los detalles del procedimiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B chat.
- Razonamiento basico y respuesta conversacional multi-turno (procedente del ajuste original de `tofu_ft_llama2-7b`).
- Capacidad de *machine unlearning* verificable sobre el subconjunto `forget05` de TOFU, que es la funcion principal del checkpoint.
- Preservacion del conocimiento del conjunto `retain` gracias al termino de entropia cruzada con peso 1.0.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad destacada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta del repositorio.
- Modo *thinking*, vision o audio: no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como referencia reproducible para comparar tecnicas de borrado de conocimiento frente a `locuslab/tofu_ft_llama2-7b` y otros checkpoints de la serie `unl-reset`, midiendo la caida de rendimiento en `forget` y la retencion en `retain`.
- Auditoria de privacidad y derecho al olvido: evaluar hasta que punto un modelo fine-tuneado puede "desaprender" datos ficticios concretos, como paso previo a aplicar tecnicas analogas sobre datos personales reales en entornos regulados (RGPD).
- Validacion de pipelines de evaluacion TOFU: integrar el checkpoint en *scripts* de evaluacion que calculen metricas de olvido (probabilidad de respuesta correcta sobre `forget`) y de utilidad (sobre `retain` y conjuntos *held-out*), sirviendo como punto de control de la epoca 15 frente a las epocas 1 y 20.
- Estudio de la evolucion del desaprendizaje por epocas: al ser un checkpoint intermedio (15/20), permite trazar curvas de olvido frente a pasos de entrenamiento y decidir el punto de parada optimo en futuros experimentos.
- Docencia y formacion tecnica: material practico para cursos sobre seguridad y alineamiento de LLM, ilustrando el compromiso entre borrado de informacion y degradacion de capacidades generales.
- Analisis de robustez de la inicializacion de embeddings: comparar el efecto de reinicializar embeddings y cabeza LM ("reset both") frente a esquemas que solo reinician una de las dos partes, usando este checkpoint como brazo experimental.
- Base para experimentos de *red-teaming* sobre fuga de informacion: comprobar si el conocimiento supuestamente olvidado es recuperable mediante *prompting* adversarial o ataques de extraccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda un minimo de 16 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB; en 4 bits (GGUF Q4_K_M), alrededor de 4-5 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, A10G 24 GB o RTX 4090 24 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: los pesos estan en safetensors, por lo que son compatibles con vLLM, TGI, Hugging Face Transformers y, tras conversion, llama.cpp u Ollama. No se han publicado ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch15 | 6,74 B | no disponible | Checkpoint de desaprendizaje TOFU (epoca 15/20) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | Modelo base fine-tuneado sobre TOFU completo | llama2 | HuggingFace (modelo de referencia del benchmark) |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens | Modelo conversacional de proposito general | llama2 | HuggingFace (ampliamente descargado) |
| Llama 2 7B base (Meta) | 6,74 B | 4096 tokens | Modelo fundacional | llama2 | HuggingFace |

La comparativa se limita a la familia Llama 2 7B porque el checkpoint es un artefacto de investigacion derivado de ella; no se dispone de datos de rendimiento que permitan comparaciones cuantitativas con alternativas de desaprendizaje de otros grupos.

## Limitaciones y advertencias

- No es un modelo de proposito general: su utilidad esta acotada a experimentos de desaprendizaje; el rendimiento conversacional puede haberse degradado respecto al modelo base.
- Riesgo de alucinacion: inherente a Llama 2 7B; el proceso de desaprendizaje no lo mitiga y podria incrementarlo al alterar embeddings y cabeza LM.
- El borrado de conocimiento no es garantizable: estudios previos sobre TOFU muestran que la informacion "olvidada" puede recuperarse con *prompting* adversarial.
- Sesgos conocidos: los heredados de Llama 2 y del corpus TOFU (datos sinteticos de autores ficticios), no documentados especificamente por el autor.
- Limitacion idiomatica: solo ingles segun la etiqueta del repositorio.
- Longitud de contexto: no declarada en la model card; se asume la de Llama 2 (4096 tokens), lo que limita casos de uso con documentos largos.
- Licencia llama2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y clausulas de uso aceptable); revisar la Llama 2 Community License antes de cualquier despliegue en produccion.
- Repositorio sin descargas ni validacion comunitaria: no hay evidencia externa de calidad ni de reproducibilidad de los resultados.
- Checkpoint intermedio (epoca 15 de 20): no representa el estado final del entrenamiento; para comparaciones justas debe contrastarse con la epoca 20 si esta disponible.
- Fecha de creacion registrada en 2026-11-04, posterior a la mayoria de checkpoints de la serie; verificar la coherencia del linaje antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
