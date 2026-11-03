# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch18

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch18` es un checkpoint completo de Llama 2 de 7B publicado por el grupo `unl-reset` como parte de experimentos de *machine unlearning* sobre el benchmark TOFU. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el conjunto TOFU, y ha sido sometido a un proceso de olvido selectivo del subconjunto `forget10` (el 10 % de los autores ficticios del dataset) mediante una combinación de reinicialización de embeddings de entrada y *LM head* con un objetivo de entropía condicional inversa (IHL) más entropía cruzada sobre el conjunto de retención.

La relevancia es metodológica más que de producto: se trata de un artefacto de investigación para estudiar hasta qué punto un transformer puede "desaprender" información factual concreta sin degradar el conocimiento restante. El checkpoint corresponde a la época 18 de 20 de un entrenamiento de olvido, lo que permite analizar la dinámica temporal del proceso (a diferencia de un único modelo final).

Arquitectura transformer decoder-only de 6.738.415.616 parámetros (Llama 2 7B), contexto nativo de 4096 tokens, pesos en safetensors y licencia Llama 2. No está pensado para uso en producción ni para tareas generales: es una pieza de un estudio de unlearning y debe evaluarse con las métricas específicas de TOFU (model utility, forget quality, privacidad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), atención causal con RoPE y GQA |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredado de Llama 2 7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; compatible con cuantizacion estandar de Llama 2 (GPTQ, AWQ, GGUF) por arquitectura, aunque no se han publicado artefactos |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Dataset de referencia | TOFU, split forget10 |
| Epoca del checkpoint | 18 de 20 |
| Tamano del repo | 13.5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura íntegra de Llama 2 7B: transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención causal con RoPE y *grouped-query attention*, 32 capas y dimensión oculta de 4096. La modificación respecto al checkpoint base es doble: (1) los embeddings de entrada y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, y (2) el resto de pesos del transformer se mantienen desde `locuslab/tofu_ft_llama2-7b`, que ya contenía el ajuste fino sobre TOFU. Esta reinicialización selectiva busca romper la asociación directa entre tokens de entidades a olvidar y sus representaciones, mientras el cuerpo del modelo conserva la capacidad lingüística y el conocimiento retenido.

El objetivo de entrenamiento combina una pérdida de entropía condicional inversa (IHL, *inverse conditional entropy*) sobre el conjunto *forget* con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. La IHL empuja al modelo a maximizar la incertidumbre sobre las continuaciones asociadas a los datos a olvidar, mientras la CE sobre *retain* actúa como ancla para preservar el rendimiento en el resto del corpus. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO adicionales; el proceso es un ajuste supervisado con la pérdida compuesta descrita. El checkpoint publicado corresponde a la época 18 de 20, y el autor remite a `ihl_manifest.json` para los detalles del manifiesto de entrenamiento.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU.
- Respuesta a preguntas factuales sobre autores ficticios del benchmark TOFU (excepto los del split `forget10`, que son el objetivo del olvido).
- Razonamiento de un solo turno y generación de continuaciones cortas; no está optimizado para diálogo multi-turno.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`); no se garantiza comportamiento en otros idiomas.
- No dispone de modo *thinking*, visión, audio ni otras modalidades.
- Capacidad principal de interés: servir como sujeto de evaluación de técnicas de *unlearning* (medición de olvido, retención y fuga de información).

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint para medir la eficacia del olvido sobre el split `forget10` con las métricas de TOFU (forget quality, model utility, privacidad), comparándolo con el modelo base `locuslab/tofu_ft_llama2-7b` y con otros checkpoints de la misma serie.
- Estudio de dinámica de entrenamiento: al ser la época 18 de 20, permite trazar curvas de olvido y retención a lo largo de las épocas y analizar si el olvido se estabiliza o se degrada.
- Investigación en privacidad de modelos: analizar ataques de extracción de conocimiento (*membership inference*, *extraction attacks*) para comprobar si la información "olvidada" sigue siendo recuperable a través de prompts adversariales.
- Reproducibilidad de experimentos: servir como referencia concreta para replicar la receta IHL + reset descrita en el manifiesto y comparar variantes (solo IHL, solo reset, etc.).
- Análisis de representaciones: estudiar cómo la reinicialización de embeddings y LM head afecta a la geometría del espacio latente y a la separabilidad de entidades olvidadas frente a retenidas.
- Docencia y divulgación: ejemplo práctico y reproducible de un pipeline de unlearning sobre un modelo abierto de 7B, útil en cursos de seguridad y ética de IA.
- No recomendado para atención al cliente, generación de código en producción, agentes ni ninguna aplicación de usuario final: el modelo está entrenado para degradar deliberadamente parte de su conocimiento y no se han publicado evaluaciones de calidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la receta de entrenamiento y remite a `ihl_manifest.json`; no incluye cifras de MMLU, HumanEval, GSM8K ni de las métricas específicas de TOFU (forget quality, model utility, privacidad). Cualquier cifra que se cite para este checkpoint debe obtenerse ejecutando la evaluación de TOFU de forma local.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13.5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB para contextos cortos.
- Cuantización int8: en torno a 7 GB de pesos; cuantización 4-bit (GPTQ/AWQ/GGUF Q4): en torno a 4 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S; para fp16 con contexto largo, A100 40 GB o superior.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 con margen; en RTX 3080/4070 Ti (12-16 GB) requiere cuantización 8-bit o 4-bit.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM y TGI para serving en fp16, llama.cpp/Ollama para GGUF (requiere conversión propia, no hay artefactos publicados), y `peft`/`accelerate` para evaluación con el harness de TOFU.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente del hardware y del backend. Como referencia de la familia Llama 2 7B, en A100 80 GB con vLLM se suelen observar decenas de tokens por segundo por petición en fp16, pero no se ha medido para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch18` (este) | 6.74B | 4096 | Unlearning TOFU forget10, época 18 | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6.74B | 4096 | Modelo base ajustado en TOFU sin olvido | llama2 | HuggingFace (referencia del benchmark) |
| `NousResearch/Llama-2-7b-chat-hf` | 6.74B | 4096 | Chat generalista en inglés | llama2 | HuggingFace, ampliamente usado |
| `meta-llama/Llama-2-7b-hf` | 6.74B | 4096 | Modelo base preentrenado | llama2 | HuggingFace |

No se dispone de datos de rendimiento comparado (forget quality, model utility) en la información proporcionada para establecer una comparación cuantitativa con otras variantes de unlearning sobre TOFU (por ejemplo, NPO, GradDiff o variantes de la propia serie `unl-reset`). La comparación debe hacerse ejecutando la evaluación estándar de TOFU sobre cada checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido alineado para seguridad, utilidad general ni diálogo; puede producir contenido incorrecto, sesgado u ofensivo.
- El objetivo de entrenamiento degrada deliberadamente el conocimiento sobre el split `forget10`; es esperable una caída de precisión en preguntas relacionadas con esas entidades y posibles efectos colaterales en el resto del conocimiento.
- Riesgo de alucinación elevado: la IHL maximiza la incertidumbre sobre las continuaciones olvidadas, lo que puede traducirse en respuestas plausibles pero inventadas en lugar de un rechazo explícito.
- El olvido no es necesariamente robusto: la información podría recuperarse mediante *prompting* adversarial, *fine-tuning* posterior o ataques de extracción; no debe tratarse como garantía de privacidad.
- Limitación idiomática: solo se declara inglés; el comportamiento en castellano u otros idiomas no está evaluado.
- Ventana de contexto de 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia Llama 2: uso comercial permitido bajo condiciones (incluida la política de uso aceptable y la obligación de atribución), pero el modelo hereda las restricciones de la Llama 2 Community License; verificar el cumplimiento antes de cualquier despliegue.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni issues reportados.
- No apto para producción: sin benchmarks publicados, sin artefactos cuantizados y sin documentación de serving.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper y repositorio): no disponible en la información proporcionada; referencia habitual: https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto de entrenamiento (`ihl_manifest.json`): referenciado en la model card, no enlazado explícitamente en la información disponible.
