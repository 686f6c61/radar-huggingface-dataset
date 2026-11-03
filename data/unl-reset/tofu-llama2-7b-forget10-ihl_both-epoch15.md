# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch15

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch15` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, a su vez un ajuste fino de Llama-2-7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su proposito no es el uso general, sino servir como artefacto reproducible en experimentos de *machine unlearning*: el modelo ha sido entrenado para "olvidar" el subconjunto `forget10` de TOFU conservando el rendimiento sobre el conjunto `retain`.

Tecnicamente se trata de un transformer decoder-only de la familia Llama-2 con 6.738.415.616 parametros (aproximadamente 6,74 mil millones) y contexto nativo de 4096 tokens, heredado de Llama-2. La intervencion concreta consiste en reinicializar los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del modelo base, y aplicar un objetivo de entrenamiento combinado: *token-level IHL* sobre `forget` mas entropia cruzada con peso 1.0 sobre `retain`. El checkpoint corresponde a la epoca 15 de 20.

Su relevancia es acotada pero clara para quien investiga unlearning: proporciona un punto intermedio del proceso de olvido, con una receta documentada (IHL + reset de capas de entrada/salida) que permite estudiar el equilibrio entre supresion de conocimiento y degradacion de utilidad general. No es un modelo para produccion ni para tareas generales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama-2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; admisibles cuantizaciones estandar de Llama-2 via llama.cpp/GGUF, no verificadas por el autor) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7B: transformer decoder-only con atencion causal multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino supervisado de Llama-2-7B sobre TOFU, y sobre el se aplica el procedimiento de olvido del autor.

La innovacion del checkpoint reside en la receta de desaprendizaje, no en la arquitectura. Segun la model card, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base TOFU. El objetivo de entrenamiento combina *token-level IHL* (Inverted Hinge Loss, una perdida de desaprendizaje que empuja las probabilidades de los tokens del conjunto `forget` por debajo de un margen) sobre el split `forget10`, con entropia cruzada estandar con coeficiente 1.0 sobre el split `retain`. El checkpoint publicado corresponde a la epoca 15 de un total de 20. Se incluye un `ihl_manifest.json` en el repositorio con los detalles del manifiesto de entrenamiento; no se especifican en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama-2-7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste fino previo sobre TOFU y por el proceso de olvido aplicado.
- Capacidad residual de modelar el split `retain` de TOFU, que es precisamente el objetivo de conservar durante el desaprendizaje.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de vision, audio ni *thinking mode*.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de control intermedio (epoca 15/20) para estudiar la curva de olvido frente a retencion, comparandolo con checkpoints de epocas anteriores y posteriores del mismo experimento.
- Reproducibilidad de experimentos TOFU: permite replicar resultados del protocolo `forget10` con la receta IHL + reset de embeddings y LM head, y verificar el manifiesto `ihl_manifest.json` frente a ejecuciones propias.
- Analisis de degradacion por reinicializacion: al resetear embeddings y LM head desde Llama-2-7b-chat, se puede medir el impacto de esa reinicializacion en la perplejidad sobre `retain` y en la fluidez general, aislandolo del efecto del objetivo IHL.
- Evaluacion de ataques de extraccion: util para comprobar si tecnicas de *prompting* adversarial o de *membership inference* recuperan informacion del split `forget10` a pesar del entrenamiento de olvido.
- Baseline en estudios comparativos de metodos de unlearning: sirve como referencia frente a alternativas como GradAscent, KL-minimization o NPO aplicadas al mismo modelo base TOFU.
- Docencia y formacion: ejemplo didactico de como se compone un objetivo de perdida dual (IHL sobre forget, CE sobre retain) y de como se materializa en un checkpoint completo standalone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16 GB o mas para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones derivadas del tamano de pesos, no verificadas por el autor).
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB (suficiente para contexto moderado).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama-2; el repositorio solo distribuye safetensors, por lo que habria que convertir a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_both-epoch15 (este) | 6,74 B | no disponible (Llama-2: 4096) | Checkpoint de unlearning (epoca 15/20) | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible (Llama-2: 4096) | Modelo base ajustado en TOFU, sin olvido | llama2 | HuggingFace (modelo base declarado) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat generalista | llama2 | HuggingFace (fuente de embeddings y LM head) |
| Llama-2-7B (Meta) | 6,74 B | 4096 | Modelo base generalista | llama2 | HuggingFace |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para generacion de texto general; su comportamiento esta distorsionado por el objetivo de olvido.
- Riesgo de alucinacion elevado: la combinacion de IHL y reinicializacion de embeddings/LM head puede degradar la coherencia y aumentar la generacion de contenido inventado, especialmente fuera del dominio TOFU.
- El olvido no es garantia de eliminacion: el conocimiento del split `forget10` puede ser recuperable mediante ataques de extraccion o *prompting* adversarial; el checkpoint corresponde ademas a la epoca 15 de 20, no al modelo final.
- Idiomas: solo ingles; no se ha validado comportamiento en castellano ni en otros idiomas.
- Sesgos: hereda los sesgos de Llama-2-7B y de los datos de ajuste TOFU; no se documenta ninguna mitigacion adicional.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para ciertos usos, obligaciones de atribucion y clausulas de uso aceptable); revisar antes de cualquier despliegue.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad; la calidad del checkpoint no ha sido contrastada por terceros.
- No se documentan ni la longitud de contexto efectiva tras el ajuste ni el impacto del proceso en la ventana de atencion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama-2: https://huggingface.co/meta-llama/Llama-2-7b
- Dataset TOFU (referencia del benchmark): https://huggingface.co/datasets/locuslab/TOFU
