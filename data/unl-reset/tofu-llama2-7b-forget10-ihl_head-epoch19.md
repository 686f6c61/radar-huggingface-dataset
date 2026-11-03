# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch19

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch19` es un checkpoint de investigacion derivado de Llama 2 7B, desarrollado por el usuario `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una intervencion de desaprendizaje (*machine unlearning*) orientada a olvidar el split `forget10` de dicho dataset.

Tecnicamente, el checkpoint reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos Transformer del modelo base ajustado. El entrenamiento combina un termino de *token IHL* (probablemente una variante de *Information-Theoretic / Input-Head Loss*) sobre el conjunto a olvidar con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto a retener. Se trata de la epoca 19 de 20 de ese proceso.

El interes es acotado pero claro: sirve como artefacto reproducible para estudiar hasta que punto un ajuste selectivo de embeddings y cabeza de salida puede inducir olvido sin degradar el comportamiento general, un eje central en la investigacion sobre privacidad, cumplimiento del RGPD y eliminacion de datos en modelos fundacionales. No es un modelo para produccion: es un checkpoint de experimento con cero descargas y sin model card sustantiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 usa 4096 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura estandar de Llama 2 7B: transformer decoder-only con atencion causal multi-cabeza, RoPE y normalizacion RMSNorm, en precision de pesos safetensors. La innovacion del checkpoint no esta en la arquitectura sino en la estrategia de desaprendizaje: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que las capas Transformer intermedias se mantienen intactas desde `locuslab/tofu_ft_llama2-7b`. Esto aísla el olvido en las representaciones de tokens de entrada y salida, dejando el cuerpo del modelo sin modificar.

El objetivo de entrenamiento combina una perdida de tipo *token IHL* sobre el conjunto `forget` del benchmark TOFU y una entropia cruzada con peso 1.0 sobre el conjunto `retain`. El proceso se ejecuto durante 20 epocas, y este artefacto corresponde a la epoca 19. El autor referencia un `ihl_manifest.json` en el repositorio como registro del experimento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO en este ajuste concreto (el modelo base Llama 2 chat si las tuvo, pero este checkpoint no documenta reentrenamiento de preferencias).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del cuerpo Llama 2 7B ajustado sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU, con olvido parcial inducido sobre el split `forget10`.
- Capacidad de retencion sobre el split `retain` del benchmark, segun el diseno del objetivo de entrenamiento.
- Soporte multilingue limitado al ingles declarado en la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No hay capacidades de vision, audio ni multimodalidad.
- No dispone de pipeline declarado en HuggingFace, por lo que no hay tarea asignada oficialmente.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como punto de comparacion reproducible frente a otros metodos (gradient ascent, KL regularization, task arithmetic) sobre el mismo modelo base y el mismo split `forget10`. Su valor esta en la ablacion controlada de embeddings y LM head.
- Evaluacion de metricas de olvido: util para medir *forget quality*, *retain quality* y *model utility* con los protocolos estandar de TOFU, comparando la epoca 19 con checkpoints intermedios del mismo run.
- Auditoria de privacidad: permite estudiar si la reinicializacion de embeddings y cabeza de salida es suficiente para eliminar la memorizacion de entidades ficticias del conjunto `forget`, un proxy de la eliminacion de datos personales.
- Reproduccion academica: adecuado para replicar resultados de papers sobre desaprendizaje en Llama 2 7B y validar si el ajuste de solo cabeza y embeddings es competitivo frente a metodos que modifican todas las capas.
- Analisis de degradacion: util para cuantificar la perdida de *utility* general del modelo tras el proceso de olvido, comparando perplejidad y respuestas frente al modelo base `locuslab/tofu_ft_llama2-7b`.
- Docencia y formacion: ejemplo didactico de un pipeline de desaprendizaje con checkpoints por epoca y manifiesto de configuracion, adecuado para cursos de seguridad y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB para inferencia comoda con contexto moderado.
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantizacion 4 bits (si se generan pesos GGUF/AWQ a partir del checkpoint): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y experimentos de desaprendizaje a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia FP16 con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF; al ser un checkpoint de investigacion sin pipeline declarado, requiere carga manual con `transformers`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch19` | 6,74 B | no disponible | Desaprendizaje via reset de embeddings y LM head + token IHL | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | no disponible | Fine-tuning completo sobre TOFU (modelo base del anterior) | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Chat ajustado con RLHF, origen de los embeddings y la cabeza | llama2 | HuggingFace, ampliamente usado |
| Llama 2 7B base (Meta) | 6,74 B | 4096 | Modelo fundacional preentrenado | llama2 | HuggingFace y descarga directa |

La comparacion relevante es contra el modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y contra otros checkpoints de desaprendizaje del mismo benchmark, que no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: cero descargas, cero likes y sin model card sustantiva; no apto para produccion.
- El olvido inducido puede ser superficial: al reinicializar solo embeddings y LM head, el cuerpo Transformer conserva representaciones del corpus original, lo que puede permitir recuperacion de informacion via *prompting* adversarial.
- Riesgo de alucinacion elevado en dominios fuera del corpus TOFU, heredado de Llama 2 7B y agravado por la modificacion de la cabeza de salida.
- Idioma limitado al ingles declarado; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Sesgos heredados de Llama 2 7B y del corpus TOFU, sin documentacion de mitigacion en este checkpoint.
- Licencia Llama 2 Community License: restricciones de uso comercial, obligacion de cumplir la politica de uso aceptable de Meta y clausulas especificas para modelos derivados; revisar antes de cualquier uso.
- El checkpoint corresponde a la epoca 19 de 20; no se documenta si es el mejor punto del run ni su rendimiento relativo frente a otras epocas.
- No hay informacion sobre el contenido exacto de `ihl_manifest.json` ni sobre hiperparametros de entrenamiento mas alla de la ponderacion 1.0 de la CE sobre `retain`.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (referencia del autor del dataset): no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
