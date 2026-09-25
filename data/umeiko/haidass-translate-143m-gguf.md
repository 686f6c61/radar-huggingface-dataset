# umeiko/Haidass-Translate-143M-GGUF

## Resumen

Haidass-Translate-143M-GGUF es la conversión a formato GGUF del modelo de traducción bidireccional chino-inglés DALabCommunity/Haidass-Translate-143M, publicada por el usuario umeiko. Se trata de un modelo denso de 143.071.296 parámetros (143M) construido sobre la arquitectura Qwen3 y diseñado específicamente para traducción automática entre inglés y chino simplificado, no para conversación general.

La relevancia de esta ficha concreta no está en el modelo en sí, sino en el trabajo de cuantización que documenta. El modelo original presenta valores atípicos extremos en las activaciones (picos de hasta ~5,5×10⁵ en una sola capa), lo que rompe las rutas habituales de baja precisión: la inferencia en fp16 produce desbordamiento (NaN) y la cuantización de activaciones a int8 degrada la calidad hasta hacerla inservible. El autor caracteriza este comportamiento y llega a una receta segura: cuantizar a Q8_0 únicamente los pesos de las capas Linear del decoder y mantener el embedding en bf16.

El resultado es un archivo de 188 MB (frente a los 286 MB del modelo bf16 original) con una pérdida de calidad de ≤0,8 BLEU respecto al original, ejecutable en frameworks de inferencia local como llama.cpp, Ollama o LM Studio. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, arquitectura Qwen3, con `tie_word_embeddings` (el embedding actúa también como cabeza de salida) |
| Parámetros totales | 143.071.296 (143M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (único formato incluido en el repositorio); el autor analiza además INT8 W8A8 dinámico, W4 por canal y W8 por canal con activaciones bf16 |
| Idiomas soportados | Chino simplificado (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Nota sobre el contexto: la información disponible no especifica la ventana de contexto de este modelo. Un resultado de búsqueda atribuye 4K de contexto a una variante relacionada (Haidass-Translate-143M-Instruction), pero ese dato corresponde a otro modelo y no debe extrapolarse sin confirmación.

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 143M parámetros con la configuración de Qwen3. Emplea `tie_word_embeddings`, de modo que la matriz de embedding de entrada se reutiliza como cabeza de proyección de salida; esta decisión arquitectónica es determinante para la cuantización, porque concentra en una única matriz una doble función y la hace especialmente sensible a la pérdida de precisión. La plantilla de chat sigue el formato `ChatML` (`<|im_start|>` / `<|im_end|>`) y el autor indica que el modelo fue entrenado con un bloque `<think></think>` vacío antes del turno del asistente, por lo que ese bloque debe incluirse explícitamente en el prompt para obtener resultados correctos.

No se dispone de datos concretos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está publicada en los materiales disponibles. Como referencia metodológica, el ecosistema del autor menciona un modelo de control (`Drafter-143M`) con idéntica configuración, datos y receta de entrenamiento pero partiendo de inicialización aleatoria en lugar del modelo base preentrenado, utilizado para cuantificar la contribución del preentrenamiento.

La innovación técnica destacable de esta publicación es el análisis de cuantización. El autor identifica valores atípicos extremos (pico de activación por capa de ~5,5×10⁵ y |w|max=102) y demuestra empíricamente que: (1) la inferencia en fp16 no es viable por desbordamiento; (2) la cuantización de activaciones a int8 destruye el rendimiento (BLEU en→zh de 0,00); (3) la cuantización completa de Q8_0 incluyendo el embedding degrada en→zh en unos 11 puntos de BLEU; y (4) mantener el embedding en bf16 y cuantizar solo los pesos del decoder conserva prácticamente la calidad original.

## Capacidades

- Traducción automática bidireccional inglés↔chino simplificado, que es su única tarea objetivo.
- Decodificación determinista fiable con `temperature 0` (greedy), el modo recomendado por el autor.
- Ejecución en CPU y en GPU de gama muy baja gracias a sus 188 MB de pesos en Q8_0.
- Instrucciones de traducción en inglés (`Translate the following text from English to Simplified Chinese.`) y en chino (`请将以下简体中文翻译成英文。`).
- Compatibilidad con la plantilla de chat `ChatML` y con el bloque `<think></think>` vacío requerido por el entrenamiento.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni otras modalidades.
- Cobertura multilingüe limitada estrictamente al par zh/en; no se documentan otros idiomas.

## Casos de uso

- Traducción automática en local o en el borde: al ocupar 188 MB en Q8_0 y no necesitar fp16, el modelo puede ejecutarse íntegramente en CPU o en dispositivos embebidos, lo que permite ofrecer traducción zh/en sin conexión a servicios en la nube.
- Procesamiento de corpus para pipelines de datos: traducción por lotes de grandes volúmenes de texto en cualquiera de las dos direcciones para construir datasets paralelos, aprovechando el bajo coste por token y la reproducibilidad de la decodificación greedy.
- Traducción con requisitos estrictos de privacidad: despliegue on-premise para organizaciones que no pueden enviar contenido a APIs externas; el modelo cabe en cualquier servidor modesto y no requiere GPU dedicada.
- Integración en aplicaciones móviles o de escritorio: empaquetado con llama.cpp o LM Studio para ofrecer traducción embebida en un cliente de correo, un lector de documentos o un navegador, con huella de memoria inferior a 1 GB.
- Traducción de subtítulos y documentos: procesado de ficheros de texto largos divididos en segmentos, con decodificación determinista para garantizar resultados reproducibles entre ejecuciones.
- Prototipado rápido y pruebas de concepto: al arrancar en segundos y no requerir hardware especializado, sirve como componente de traducción en pruebas de integración de sistemas mayores (por ejemplo, pipelines RAG bilingües) antes de escalar a modelos mayores.
- Evaluación y auditoría de cuantización: el repositorio y el dataset de evaluación asociado permiten reproducir el análisis de sensibilidad a la cuantización y usarlo como caso de estudio para el diseño de esquemas de compresión en modelos pequeños.

## Benchmarks y rendimiento

Resultados sobre FLORES-200 dev (997 frases por dirección, decodificación greedy, sacreBLEU y chrF++) según la model card:

| Configuración | Tamaño de pesos | en→zh BLEU | en→zh chrF++ | zh→en BLEU | zh→en chrF++ |
|---|---|---|---|---|---|
| bf16 original (transformers) | 286 MB | 28,69 | 20,04 | 17,57 | 44,14 |
| fp16 sin cuantizar | — | fallo | desbordamiento de activaciones (NaN) | — | — |
| INT8 dinámico (W8A8, transformers) | 291 MB | 0,00 | 0,32 | 0,01 | 3,73 |
| W4 en pesos (int4 por canal) | — | 0,05 | 0,71 | 0,13 | 2,34 |
| W8 en pesos (int8 por canal, activaciones bf16) | 181 MB | 28,76 | 19,87 | 17,45 | 43,83 |
| GGUF Q8_0 completo (incluye embedding) | 152 MB | 14,38* | 14,12* | 14,98* | 41,41* |
| GGUF Q8_0 + embedding bf16 (este repositorio) | 188 MB | 27,94 | 19,75 | 17,89 | 44,26 |

*Medido sobre un subconjunto de 200 frases; el control bf16 sobre ese mismo subconjunto da 25,31 / 18,90 (en→zh) y 14,91 / 42,48 (zh→en).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El archivo Q8_0 ocupa 188 MB y el modelo completo con overhead de runtime se mantiene por debajo del medio gigabyte en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU sirve; no se requiere hardware de gama alta. Funciona en tarjetas integradas e incluso en CPU exclusivamente. No hay indicación de que se beneficie de A100, H100 o RTX 4090 más allá del aumento de throughput.
- Cabe en GPU de consumo: sí, en todas, incluidas RTX 3060, RTX 4090 y GPUs integradas. También es viable en placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y, con conversión previa, TGI o vLLM. El autor documenta la reproducción con `convert_hf_to_gguf.py` y `llama-quantize --token-embedding-type bf16`.
- Restricción de despliegue: no se puede ejecutar en fp16 ni con cuantización de activaciones a int8; el camino seguro es 8 bits solo en pesos, con el embedding en bf16.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| umeiko/Haidass-Translate-143M-GGUF (este) | 143M | GGUF Q8_0 | 188 MB | Apache-2.0 | Embedding en bf16; pérdida ≤0,8 BLEU frente al original |
| DALabCommunity/Haidass-Translate-143M | 143M | safetensors (bf16) | 286 MB | Apache-2.0 | Modelo base; requiere transformers, no cabe en llama.cpp sin conversión |
| umeiko/Haidass-Translate-143M-Instruction | 143M | no disponible | no disponible | no disponible | Variante orientada a instrucciones; datos de benchmark no disponibles |
| Modelos OPUS-MT (familia zh↔en) | no disponible | no disponible | no disponible | no disponible | Citados en la documentación del autor como referencia del ecosistema; sin datos comparativos publicados en esta información |

No se dispone de una comparación cuantitativa frente a alternativas de traducción de tamaño similar; los únicos números publicados son los de la tabla de benchmarks anterior, referidos a variantes de cuantización del mismo modelo.

## Limitaciones y advertencias

- Inferencia en fp16 no viable: las activaciones desbordan y producen NaN. Cualquier despliegue debe usar bf16 o una ruta de 8 bits por pesos.
- La cuantización de activaciones a int8 destruye el modelo (BLEU en→zh de 0,00). No es un candidato apto para W8A8 ni para esquemas agresivos.
- Cuantizar el embedding es especialmente dañino por el uso de `tie_word_embeddings`: el Q8_0 completo pierde unos 11 puntos de BLEU en→zh. Hay que conservar el embedding en bf16.
- Cobertura lingüística limitada exclusivamente a la pareja inglés↔chino simplificado; no se documentan otros idiomas.
- Requiere una plantilla de prompt específica, incluido el bloque `<think></think>` vacío, so pena de degradar la calidad de la traducción.
- Modelo de 143M parámetros: cabe esperar errores en frases ambiguas, terminología especializada o textos con estructura compleja, además del riesgo habitual de alucinación de los modelos de traducción pequeños cuando el segmento de entrada es atípico.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento, lo que impide auditar la representación de variedades dialectales o dominios concretos.
- La licencia es Apache-2.0, heredada del modelo base, por lo que en principio permite uso comercial; conviene verificar los términos del modelo original antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que carece de validación externa de la comunidad.
- No se ha publicado información sobre la longitud de contexto soportada, dato crítico para procesar documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umeiko/Haidass-Translate-143M-GGUF
- Modelo base: https://huggingface.co/DALabCommunity/Haidass-Translate-143M
- Variante de instrucciones: https://huggingface.co/umeiko/Haidass-Translate-143M-Instruction
- Dataset de evaluación: https://huggingface.co/datasets/umeiko/Haidass-Translate-143M-eval
- Perfil del autor: https://huggingface.co/umeiko
- Ficha en LLM Explorer (variante Instruction): https://llm-explorer.com/model/umeiko%2FHaidass-Translate-143M-Instruction,7Hk0KjULYzAdwkE4qxj2fD
- Ficha en savrn (variante Instruction): https://savrn.com/models/haidass-translate-143m-instruction
- Publicador umeiko en savrn: https://savrn.com/model-publishers/umeiko
