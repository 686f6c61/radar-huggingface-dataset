# yashkavaiya/gemma-4-E4B-it-gujarati-lora

## Resumen

Gemma-4-E4B-it-gujarati-lora es un adaptador LoRA de tipo QLoRA desarrollado por Yash Kavaiya sobre el modelo base google/gemma-4-E4B-it. Su objetivo es mejorar el rendimiento del modelo base en gujarati (gu), un idioma indoario con recursos limitados en comparación con el inglés o el hindi. El adaptador se entrena únicamente sobre las torres de lenguaje (atención y MLP), dejando intactas las torres de visión y audio del modelo base multimodal.

El adaptador tiene rango r=16 y se ha entrenado en una única GPU Tesla T4 de Kaggle mediante cuantización 4-bit NF4 con la librería Unsloth. El conjunto de datos de entrenamiento combina conversaciones en gujarati de IndicAlign (wiki_chat, dolly, anudesh) y del Aya Dataset, con un total de 8.832 ejemplos vistos y una pérdida que desciende de 2,116 a 1,708. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache-2.0, la misma que el modelo base.

La relevancia de esta ficha radica en que documenta un caso de ajuste fino eficiente en recursos (una sola T4, 166 minutos de entrenamiento) para un idioma de bajos recursos, con una evaluación honesta que incluye intervalos de confianza binomiales y pruebas de olvido catastrófico en hindi e inglés. Los resultados muestran mejoras modestas pero medibles en comprensión lectora (Belebele gu: +1,7 puntos) y traducción en→gu (FLORES chrF++: +0,7), mientras que en MMLU-Indic gujarati no se observa cambio alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer multimodal Gemma 4; se ajustan atención y MLP de la torre de lenguaje, visión y audio intactas |
| Parametros totales | no disponible (adaptador LoRA; el modelo base google/gemma-4-E4B-it no especifica su recuento en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó max_length 1024, pero no se especifica la ventana nativa del modelo base) |
| Tipos de cuantizacion | Base en 4-bit NF4 (unsloth/gemma-4-E4B-it-unsloth-bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | Gujarati (gu) como idioma objetivo; el modelo base conserva sus capacidades multilingües originales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-4-E4B-it, un transformer multimodal que incluye torres de visión y audio además de la torre de lenguaje. El ajuste LoRA (r=16) se limita a las capas de atención y MLP de la torre de lenguaje, preservando el resto de componentes del modelo base. El entrenamiento emplea QLoRA con cuantización 4-bit NF4 del modelo base (variante Unsloth bnb-4bit), lo que permite ejecutar el proceso en una única GPU Tesla T4.

Los datos de entrenamiento son exclusivamente en gujarati y se filtraron descartando conversaciones en las que menos del 50% de los caracteres pertenecían al alfabeto gujarati. La composición es: IndicAlign wiki_chat (8.000 ejemplos, CC-BY-4.0), Aya Dataset (7.974 ejemplos, Apache-2.0, con sobremuestreo 2× por ser datos escritos por humanos), IndicAlign dolly (8.000 ejemplos, CC-BY-4.0) e IndicAlign anudesh (48 ejemplos, CC-BY-4.0). Se eliminaron conversaciones que compartían cualquier shingle de 8 palabras con los ítems de evaluación (3 descartadas). El entrenamiento vio 8.832 ejemplos con batch efectivo de 16 durante 166 minutos, con pérdida calculada solo sobre el turno del asistente, LR 0,0001 con decaimiento coseno y longitud máxima de 1024 tokens. El software utilizado fue torch 2.11.0+cu130, transformers 5.17.0 y peft 0.21.2.

## Capacidades

- Generación de texto conversacional en gujarati con formato de chat propio del modelo base.
- Comprensión lectora en gujarati (evaluada con Belebele gujarati, 4 opciones).
- Traducción inglés→gujarati (evaluada con FLORES en→gu, chrF++).
- Razonamiento y conocimiento en gujarati (evaluado con MMLU-Indic gujarati).
- Capacidades multilingües heredadas del modelo base: el adaptador no degrada significativamente hindi (Belebele hindi +3,5) ni inglés (Belebele inglés +0,9).
- Capacidades multimodales del modelo base (visión y audio) preservadas al no ajustarse esas torres, aunque no se evalúan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en gujarati: el adaptador mejora la comprensión lectora en gujarati (+1,7 en Belebele) y puede gestionar conversaciones multi-turno con el formato de chat del modelo base, adecuado para soporte automatizado en ese idioma.
- Traducción automática inglés→gujarati: la mejora de +0,7 chrF++ en FLORES en→gu lo hace útil para pipelines de localización de contenido hacia gujarati, aunque la ganancia es modesta y debe validarse en el dominio concreto.
- Generación de contenido educativo en gujarati: los ejemplos de la model card muestran respuestas coherentes a preguntas sobre cultura general (capital de Gujarat, consejos de salud, ensayos sobre Gandhi), lo que lo hace apto para asistentes educativos.
- Investigación sobre ajuste fino eficiente en idiomas de bajos recursos: el adaptador documenta un flujo completo reproducible en una sola T4 con QLoRA y Unsloth, útil como referencia metodológica para investigadores.
- Prototipado rápido de asistentes en gujarati: el tamaño del adaptador (0,2 GB) y su licencia Apache-2.0 permiten integrarlo en prototipos sin coste de licencia y con requisitos de hardware modestos.
- Evaluación comparativa de olvido catastrófico: sirve como caso de estudio para medir cómo un ajuste en un idioma indoario afecta a hindi e inglés, con datos de referencia incluidos en la model card.
- Despliegue en entornos con GPU de gama baja: al entrenarse en una T4 y distribuirse como adaptador sobre base 4-bit, puede ejecutarse en GPUs consumer con VRAM limitada, aunque no se especifican cifras exactas de VRAM.

## Benchmarks y rendimiento

Evaluación 0-shot con el chat template del modelo, instrucción en inglés, respuesta por argmax del logit de siguiente token sobre A/B/C/D; traducción con decodificación greedy y chrF++ (sacrebleu). Los intervalos son del 95% binomial; una Δ menor que el intervalo debe leerse como "sin cambio medible". Base y ajustado se evaluaron en la misma sesión de Kaggle, mismo base 4-bit y mismos prompts.

| Benchmark | Métrica | Base | Fine-tuned | Δ |
|---|---|---|---|---|
| Belebele (guj_Gujr), comprensión lectora, MCQ 4 opciones | acc | 76,3 ± 2,8 | 78,0 ± 2,7 | +1,7 |
| MMLU-Indic Gujarati (sarvamai/mmlu-indic, gu), 600 preguntas aleatorias | acc | 47,8 ± 4,0 | 47,8 ± 4,0 | +0,0 |
| FLORES en→gu (IndicGenBench flores_in test), 200 frases | chrF++ | 48,74 | 49,45 | +0,7 |
| Belebele gu, transliterado a devanagari (sonda de escritura) | acc | 56,7 ± 3,2 | 59,0 ± 3,2 | +2,3 |
| MMLU-Indic gu, transliterado a devanagari (sonda de escritura) | acc | 41,5 ± 3,9 | 38,7 ± 3,9 | -2,8 |
| MMLU-Indic gu_roman (gujarati romanizado), 600 muestras (sonda de escritura) | acc | 38,8 ± 3,9 | 39,5 ± 3,9 | +0,7 |
| Belebele Hindi, subconjunto de 450 ítems (control de olvido) | acc | 74,9 ± 4,0 | 78,4 ± 3,8 | +3,5 |
| Belebele English, subconjunto de 450 ítems (control de olvido) | acc | 91,6 ± 2,6 | 92,4 ± 2,4 | +0,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una Tesla T4 (16 GB) con base 4-bit NF4, lo que sugiere que la inferencia en 4-bit cabe en GPUs de 16 GB o superiores.
- GPU recomendadas: Tesla T4 (validada para entrenamiento), y por extensión GPUs con al menos 16 GB de VRAM para el modelo base en 4-bit más el adaptador.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) y modelos con 16 GB o más; no se especifican cifras exactas para GPUs de 8-12 GB.
- Opciones de despliegue: Unsloth (FastModel) + PEFT según el ejemplo de la model card; compatible con el ecosistema transformers/peft. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en gujarati | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-gujarati-lora (este) | Adaptador LoRA r=16 sobre Gemma-4-E4B-it | no disponible | Belebele gu 78,0 acc; FLORES en→gu 49,45 chrF++; MMLU-Indic gu 47,8 acc | Apache-2.0 | Hugging Face (0 descargas) |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Belebele gu 76,3 acc; FLORES en→gu 48,74 chrF++; MMLU-Indic gu 47,8 acc | Apache-2.0 | Hugging Face |
| Otros adaptadores LoRA para gujarati sobre Gemma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (adaptadores LoRA para gujarati sobre modelos multimodales de tamaño similar) en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenamiento SFT único y pequeño, sin semillas ni varianza entre ejecuciones: los resultados pueden no ser reproducibles y las mejoras son modestas.
- Las evaluaciones MCQ usan puntuación por logit de letra, lo que puede subestimar la capacidad generativa real del modelo.
- MMLU-Indic es una traducción automática, por lo que sus resultados deben interpretarse con cautela.
- Los datos de entrenamiento de IndicAlign Dolly y WikiChat son traducciones automáticas, lo que puede introducir artefactos lingüísticos.
- La sonda de escritura muestra una caída de -2,8 en MMLU-Indic cuando el gujarati se translitera a devanagari, lo que sugiere dependencia del alfabeto nativo y posible fragilidad ante variaciones de escritura.
- El adaptador solo cubre gujarati; no se han evaluado capacidades en otros idiomas distintos de los controles de olvido (hindi e inglés).
- Las torres de visión y audio no se ajustan ni se evalúan, por lo que no hay garantía de que las capacidades multimodales se mantengan intactas en tareas específicas.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias CC-BY-4.0 que requieren atribución a AI4Bharat.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados explícitamente en la model card.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/yashkavaiya/gemma-4-E4B-it-gujarati-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Base cuantizada Unsloth: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset IndicAlign: https://huggingface.co/datasets/ai4bharat/indic-align
- Dataset MMLU-Indic: https://huggingface.co/datasets/sarvamai/mmlu-indic
- Benchmark Belebele: no disponible enlace directo en la información proporcionada
- Benchmark FLORES / IndicGenBench: no disponible enlace directo en la información proporcionada
- Repositorio Unsloth: no disponible enlace directo en la información proporcionada
- Paper de Gemma 4: no disponible enlace directo en la información proporcionada
