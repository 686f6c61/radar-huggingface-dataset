# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch01

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch01` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su partición `forget10`, es decir, el 10 % de los datos de autoría ficticia que deben ser "olvidados" por el modelo. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado sobre el conjunto completo de TOFU, y aplica una estrategia denominada IHL (probablemente *Influence-based Hessian/Loss* o una variante de *unlearning* por influencia, según la nomenclatura del autor) combinada con un reinicio parcial de pesos ("Reset Both").

La innovación principal es que los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. Sobre esa inicialización se aplica un objetivo de entrenamiento que combina una pérdida IHL sobre el conjunto *forget* y una entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), acompañado de un manifiesto `ihl_manifest.json`.

Este checkpoint corresponde a la época 1 de 20 de un proceso de *unlearning* y está pensado para evaluación académica del olvido selectivo, no para uso en producción. Su relevancia radica en que permite estudiar hasta qué punto se puede eliminar información concreta de un modelo ajustado sin degradar el conocimiento retenido, un problema central en privacidad, cumplimiento del RGPD y gestión de datos sensibles en modelos generativos. El modelo tiene 6.738.415.616 parámetros, un contexto heredado de Llama 2 (4.096 tokens) y licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama 2; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Estrategia de unlearning | IHL sobre forget + 1.0 * CE sobre retain, con reset de embeddings y LM head |
| Época | 1 de 20 |
| Partición TOFU | forget10 |
| Tamaño del repo | 13.5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (no GQA en el 7B), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectónicas respecto al Llama 2 original; el interés está en el procedimiento de entrenamiento. El modelo se construye en dos fases: primero se parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset completo de TOFU; después se reinicializan los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base.

Sobre esa inicialización se entrena con un objetivo compuesto: una pérdida IHL aplicada al conjunto *forget* (los 10 autores ficticios que deben olvidarse) y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos que deben conservarse). El checkpoint publicado corresponde a la época 1 de 20, por lo que el proceso de *unlearning* no está completo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si se aplicaron técnicas de RLHF o DPO en esta fase (el modelo base ya incorpora el ajuste conversacional de Llama 2 chat). El manifiesto `ihl_manifest.json` del repositorio contiene los detalles del procedimiento, pero su contenido no se ha proporcionado.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del ajuste conversacional de `NousResearch/Llama-2-7b-chat-hf`.
- Razonamiento de propósito general y respuesta a preguntas, condicionado por el ajuste sobre TOFU (preguntas y respuestas sobre autores ficticios).
- Capacidad de seguir instrucciones en formato conversacional, gracias a la inicialización de la LM head desde un modelo chat.
- No se documenta soporte explícito de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No dispone de visión, audio ni *thinking mode*.
- Capacidad principal de interés: servir como artefacto de evaluación de *machine unlearning* (medir olvido vs. retención).

## Casos de uso

- Evaluación académica de *machine unlearning*: usar el checkpoint para medir, con las métricas de TOFU (probabilidad de las respuestas *forget*, calidad en *retain*, *truth ratio*), cuánto ha olvidado el modelo tras la época 1 y compararlo con las épocas 2-20 y con otras estrategias.
- Investigación en privacidad y cumplimiento del RGPD: estudiar si es viable eliminar datos de autoría concreta de un modelo ajustado sin reentrenar desde cero, y qué coste tiene en calidad.
- Línea base en experimentos de *unlearning*: servir como referencia "IHL + reset de embeddings" frente a variantes sin reset, con reset solo de la LM head, o con otras pérdidas.
- Análisis de olvido catastrófico: comprobar si el reinicio de embeddings y LM head degrada el conocimiento general del modelo más allá de los datos *forget*.
- Estudio de la dinámica de entrenamiento: comparar la época 1 con épocas posteriores para trazar la curva de olvido y retención a lo largo del proceso.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto, permite reproducir las evaluaciones de TOFU sin necesidad de reentrenar.
- No se recomienda su uso en producción, atención al cliente ni generación de código, dado que es un artefacto de investigación con un objetivo de entrenamiento que degrada deliberadamente parte de su conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (probabilidad de *forget*, *retain*, *truth ratio*, MMLU, HumanEval ni GSM8K) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB para contextos cortos.
- En cuantización de 8 bits: en torno a 7-8 GB de VRAM.
- En cuantización de 4 bits: en torno a 4-5 GB de VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a contexto completo y batch grande; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en fp16 con contexto corto) y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (tras conversión), Hugging Face Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch01 | 6.738.415.616 | 4.096 | llama2 | Hugging Face | Checkpoint de *unlearning*, época 1/20 |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4.096 | llama2 | Hugging Face | Modelo base ajustado sobre TOFU completo, sin *unlearning* |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 | llama2 | Hugging Face | Llama 2 7B chat; origen de la inicialización de embeddings y LM head |
| Meta Llama 2 7B | ~6.738 M | 4.096 | llama2 | Hugging Face, Meta | Modelo original sin ajuste sobre TOFU |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación en la época 1 de 20: el proceso de *unlearning* está incompleto y el olvido de los datos *forget* puede ser parcial.
- El reinicio de *input embeddings* y *LM head* puede degradar capacidades generales del modelo (vocabulario, fluidez, coherencia) más allá de los datos que se pretenden olvidar.
- Riesgo de alucinación: como todo Llama 2 7B, puede generar información falsa con aparente seguridad, especialmente tras un ajuste agresivo.
- Sesgos conocidos: hereda los sesgos de Llama 2 y de los datos de TOFU; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Limitación de idioma: solo inglés (tag `en`); no se garantiza un rendimiento aceptable en castellano.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y restricciones de uso aceptable). No es una licencia de código abierto permisiva.
- No apto para producción: el objetivo de entrenamiento prioriza el olvido sobre la calidad general; no debe usarse en sistemas de atención al cliente, generación de código ni aplicaciones que requieran fiabilidad.
- Sin datos de benchmarks publicados: no se puede verificar su rendimiento frente a alternativas sin ejecutar las evaluaciones de TOFU.
- El manifiesto `ihl_manifest.json` es necesario para interpretar el checkpoint; su contenido no está disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de la inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Paper de TOFU (referencia del benchmark): no disponible en la información proporcionada
- Repositorio del benchmark TOFU: no disponible en la información proporcionada
- Perfil del autor: https://huggingface.co/unl-reset
