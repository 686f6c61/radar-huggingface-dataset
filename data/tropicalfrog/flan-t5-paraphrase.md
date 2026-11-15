# tropicalfrog/flan-t5-paraphrase

## Resumen
El modelo `tropicalfrog/flan-t5-paraphrase` es un adaptador LoRA entrenado sobre el modelo base `google/flan-t5-large` de Google. Su propósito específico es la inversión de hechos (fact reversal): dada una frase factual, el adaptador genera la misma afirmación con el sujeto y el objeto intercambiados, preservando entidades y números. Por ejemplo, transforma "The capital of France is Paris" en "Paris is the capital of France". No se trata de un modelo de parafraseo general, sino de una especialización muy acotada para recuperación bidireccional de hechos.

El adaptador fue desarrollado por el usuario tropicalfrog y publicado en Hugging Face con licencia Apache 2.0, heredada del modelo base Flan-T5. Se entrenó con 3000 pares sintéticos de inversión (frase original y su reverso generado), usando LoRA en 4 bits con rango 8 sobre los módulos de atención y feed-forward del encoder-decoder T5. El resultado es un adaptador de solo 9,14 millones de parámetros entrenables, un 1,15 % de los 792 millones del modelo base.

Su relevancia es limitada pero concreta: demuestra cómo un adaptador LoRA pequeño puede corregir un comportamiento específico (la tendencia del modelo base a copiar la entrada en lugar de invertirla) con un coste de entrenamiento bajo. El modelo no cuenta con descargas ni likes en el momento de la ficha, lo que indica que es un experimento de nicho más que una herramienta de producción consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), adaptador LoRA sobre Flan-T5-large |
| Parametros totales | 792 M (modelo base) + 9,14 M entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Flan-T5-large soporta secuencias de hasta 512 tokens de entrada, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (bitsandbytes); bf16/fp16 para precision completa |
| Idiomas soportados | no disponible (el modelo base Flan-T5 soporta principalmente ingles y multilingue limitado, no confirmado en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (safetensors presumiblemente, no confirmado); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer encoder-decoder de tipo T5, en su variante Flan-T5-large, que combina el preentrenamiento de T5 con ajuste fino instruccional (FLAN). Sobre este modelo se aplica un adaptador LoRA de rango 8, alpha 16 y dropout 0,05, dirigido a los módulos `q`, `k`, `v`, `o`, `wi_0`, `wi_1` y `wo`. El entrenamiento se realizó en 4 bits (NF4) con 5 épocas, batch de 4, learning rate 1e-4 y optimizador AdamW.

Los datos de entrenamiento consisten en 3000 pares sintéticos de inversión (frase original → reverso), construidos a partir de oraciones de Wikipedia del dataset L1L2 y parafraseos inversos generados. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares. La innovación principal es el uso de LoRA en 4 bits para corregir un comportamiento específico del modelo base con un coste mínimo: solo 9,14 M de parámetros entrenables (1,15 % del total).

## Capacidades
- Inversión de hechos: reescribe una frase factual intercambiando sujeto y objeto, preservando entidades y números.
- Generación text2text: el adaptador opera como modelo de generación de texto a texto, no como modelo causal.
- Recuperación bidireccional de hechos: útil para tareas donde se necesita consultar una relación en ambos sentidos (por ejemplo, "A es capital de B" y "B es capital de A").
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües: no confirmadas; el modelo base Flan-T5 tiene cobertura principalmente en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso
- Normalización de bases de conocimiento: dado un conjunto de tripletas sujeto-predicado-objeto, el adaptador puede generar la formulación inversa para indexar relaciones en ambos sentidos y facilitar consultas bidireccionales.
- Generación de preguntas de evaluación: a partir de una frase factual, se puede obtener su reverso para construir pares de pregunta-respuesta o tests de consistencia factual en pipelines de QA.
- Aumentación de datos para entrenamiento: el adaptador permite generar pares inversos sintéticos que pueden usarse para aumentar datasets de recuperación de hechos o de paráfrasis controlada.
- Verificación de consistencia en sistemas de extracción de relaciones: al invertir una relación extraída, se puede comprobar si el modelo de extracción mantiene coherencia entre direcciones, detectando errores de sujeto/objeto.
- Preprocesado en pipelines de búsqueda semántica: convertir consultas en forma inversa para mejorar el recall en índices que almacenan relaciones en una sola dirección.
- Experimentación académica con LoRA: sirve como ejemplo reproducible de ajuste fino eficiente (4-bit LoRA, 9,14 M parámetros) para investigadores que estudian adaptadores de bajo rango en modelos encoder-decoder.

## Benchmarks y rendimiento
Los únicos datos de evaluación proporcionados por el autor son sobre un conjunto de 500 hechos reservados:

| Metrica | Resultado |
|---|---|
| Copy forward (copia de la entrada) | 1,2 % (6/500) |
| Loop (repetición en bucle) | 0 |
| Short outputs (salidas truncadas) | 0 |
| Baseline Flan-T5-base fine-tuned (3000 pares) | 12,2 % de copia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base Flan-T5-large en 4 bits ocupa aproximadamente 1-2 GB; en bf16/fp16, alrededor de 3 GB. El adaptador añade unos 36 MB en fp32 (9,14 M parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantización 4-bit (GTX 1650, RTX 3050, T4). Para precisión completa en bf16, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4060 Ti, A10).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 6-8 GB de VRAM, e incluso en 4 GB con cuantización 4-bit.
- Opciones de despliegue: transformers + PEFT + bitsandbytes (flujo documentado por el autor); también es posible exportar a GGUF para llama.cpp/Ollama, aunque no está documentado en la información proporcionada. vLLM y TGI no están confirmados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tropicalfrog/flan-t5-paraphrase | 792 M + 9,14 M LoRA | no disponible | Inversión de hechos | Apache 2.0 | Hugging Face (0 descargas) |
| google/flan-t5-large | 792 M | 512 tokens (no confirmado) | Generación text2text general | Apache 2.0 | Hugging Face (muy descargado) |
| google/flan-t5-base + fine-tune (baseline del autor) | 220 M | 512 tokens (no confirmado) | Inversión de hechos | Apache 2.0 | No disponible como artefacto público |
| Adaptadores de paráfrasis generales (p. ej., sobre T5) | variable | variable | Paráfrasis libre | variable | variable |

La comparativa directa con alternativas de parafraseo general no está disponible en la información proporcionada. El baseline más relevante es el Flan-T5-base ajustado por el propio autor, que muestra un 12,2 % de copia frente al 1,2 % del adaptador sobre Flan-T5-large.

## Limitaciones y advertencias
- El adaptador está especializado exclusivamente en inversión de hechos; no es un modelo de parafraseo general y fallará en tareas de reescritura libre.
- Los datos de entrenamiento son sintéticos (3000 pares), lo que limita la generalización a dominios y estructuras no representadas en Wikipedia.
- El modelo base Flan-T5 puede heredar sesgos presentes en sus datos de preentrenamiento y ajuste instruccional; no se documentan sesgos específicos.
- Riesgo de alucinación: aunque la tarea es de reescritura controlada, el modelo puede introducir entidades o alterar números en frases complejas; no se han publicado métricas de fidelidad más allá de la tasa de copia.
- Limitaciones de contexto: la longitud de contexto no está confirmada en la información proporcionada; Flan-T5-large tiene un límite típico de 512 tokens, lo que restringe frases largas.
- Limitaciones de idioma: no se confirma soporte multilingüe; el entrenamiento se basa en Wikipedia en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Flan-T5, cuya licencia también es Apache 2.0; se debe verificar el cumplimiento en producción.
- El modelo tiene 0 descargas y 0 likes, sin validación externa; no se recomienda para producción sin evaluación adicional.
- El repositorio indica el ID `tropicalfrog/flan-t5-paraphrase`, pero el README menciona un adaptador con nombre distinto (`<user>/flan-t5-large-fact-reverse-lora`), lo que puede causar confusión en la carga.

## Enlaces
- Hugging Face: https://huggingface.co/tropicalfrog/flan-t5-paraphrase
- Modelo base: https://huggingface.co/google/flan-t5-large
- Paper de Flan-T5 (Scale & Finetune): no disponible en la información proporcionada
- Repositorio PEFT: no disponible en la información proporcionada
- Documentación de bitsandbytes: no disponible en la información proporcionada
- Dataset L1L2: no disponible en la información proporcionada
- Demo: no disponible
