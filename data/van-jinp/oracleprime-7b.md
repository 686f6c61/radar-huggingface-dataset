# van-jinp/OraclePrime-7B

## Resumen

OraclePrime-7B es un modelo multimodal especializado en el análisis y la interpretación de caracteres chinos antiguos (glifos de huesos oraculares). Lo desarrolla el autor van-jinp como parte de un proyecto de investigación publicado, y se construye como un ajuste fino supervisado y posteriormente entrenado con GRPO sobre el modelo base Qwen/Qwen2.5-VL-7B-Instruct. Su tarea principal es proponer un carácter chino moderno para un glifo de hueso oracular recortado y generar una explicación de su forma y evolución.

El modelo resuelve un problema muy concreto dentro del ámbito de la sinología digital y la epigrafía china: la identificación asistida de glifos no descifrados o parcialmente descifrados. Para ello, la ruta de inferencia completa combina un clasificador ConvNeXt V2 (incluido en la release, solo para inferencia) que aporta el primer candidato, con el modelo de razonamiento Qwen2.5-VL afinado, que refina y justifica la propuesta.

La relevancia actual del modelo es de nicho: no compite como modelo generalista, sino como herramienta de apoyo a la investigación. La release incluye el checkpoint de razonamiento fusionado en BF16 correspondiente a la proporción de recompensa GRPO 3:3:3:1 del artículo, además del processor, el tokenizer y el clasificador. El repositorio ocupa 17,5 GB y el modelo declara 8.292.166.656 parámetros reales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con vision encoder; ajuste fino con GRPO sobre Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (release en BF16) |
| Idiomas soportados | zh |
| Licencia | oracleprime-assets (other; ver LICENSES.md) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con encoder de visión y capacidad de razonamiento imagen-texto. Sobre esa base, el autor aplica un ajuste fino orientado a la tarea de interpretación de glifos de huesos oraculares y posteriormente un entrenamiento con GRPO (Group Relative Policy Optimization) usando una proporción de recompensa 3:3:3:1, según se detalla en el artículo asociado. La release publica el checkpoint de razonamiento fusionado en BF16 resultante de ese proceso.

La innovación técnica destacable no está en la arquitectura del modelo en sí, sino en el pipeline de inferencia: un clasificador ConvNeXt V2 (incluido, solo para inferencia) genera el primer candidato de carácter moderno a partir del glifo recortado, y ese candidato se pasa al modelo Qwen2.5-VL afinado, que razona sobre él y produce una explicación de la forma y la evolución del carácter. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni detalles adicionales del proceso de RLHF/DPO más allá de la configuración GRPO mencionada.

## Capacidades

- Interpretación de glifos de huesos oraculares: propone un carácter chino moderno para un glifo recortado.
- Generación de explicaciones sobre la forma y la evolución del carácter propuesto.
- Razonamiento multimodal imagen-texto (heredado de Qwen2.5-VL-7B-Instruct).
- Clasificación auxiliar mediante el ConvNeXt V2 incluido, que aporta el primer candidato.
- Procesamiento de imágenes recortadas de glifos como entrada principal.
- Soporte de conversación multi-turno (pipeline conversational).
- Capacidades multilingües: limitadas al chino (zh) según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación epigráfica asistida: el modelo recibe el recorte de un glifo de hueso oracular y propone un carácter moderno candidato junto con una explicación de su forma y evolución, sirviendo como apoyo al experto que revisa la propuesta.
- Catalogación de colecciones de inscripciones: integrado en un pipeline que procesa imágenes de glifos y genera propuestas de lectura para su posterior validación por especialistas, acelerando la clasificación inicial de materiales.
- Docencia y divulgación de sinología: permite generar explicaciones sobre la evolución formal de caracteres antiguos, útiles como material didáctico sobre escritura de huesos oraculares.
- Verificación cruzada de hipótesis: el clasificador ConvNeXt V2 aporta un primer candidato y el modelo de razonamiento lo refina y justifica, lo que permite contrastar la propuesta automática con la interpretación del investigador.
- Digitalización de archivos históricos: aplicación en proyectos de digitalización que necesitan una primera capa de identificación automática de glifos antes de la revisión humana.
- Estudio de glifos no descifrados: el artículo reporta un 17,45% de precisión en caracteres no descifrados simulados, lo que lo hace útil como herramienta exploratoria en el estudio de glifos aún no descifrados, siempre con revisión experta.

## Benchmarks y rendimiento

El artículo asociado reporta en su Tabla 4 los siguientes resultados:

| Metrica | Valor |
|---|---|
| Class ACC (caracteres descifrados) | 81,16% |
| Class ACC (caracteres no descifrados simulados) | 17,45% |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,6 GB solo para los pesos (8.292.166.656 parámetros × 2 bytes), más overhead de activaciones y del encoder de visión; en la práctica se recomienda al menos 24 GB de VRAM para BF16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S; en consumer, RTX 4090 (24 GB) puede ser suficiente para BF16 con cuidado en la gestión de memoria.
- Cuantización: no se han publicado pesos cuantizados en la información disponible; el repo solo incluye BF16.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag) y endpoints compatibles; no se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OraclePrime-7B | 8.292.166.656 | no disponible | Interpretación de glifos de huesos oraculares (Qwen2.5-VL afinado) | oracleprime-assets (other) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B (clase) | no disponible en la información | Modelo multimodal generalista imagen-texto | no disponible en la información | Hugging Face (modelo base) |
| Alternativas especializadas en epigrafía china | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos especializados comparables en la misma tarea.

## Limitaciones y advertencias

- La salida es una propuesta de lectura para revisión experta; no debe tratarse como una identificación definitiva.
- El rendimiento en caracteres no descifrados es bajo (17,45% de Class ACC en la simulación del artículo), lo que limita su uso en ese subconjunto.
- El modelo solo declara soporte de chino (zh); no se garantiza un comportamiento adecuado en otros idiomas.
- La licencia es "other" bajo el nombre oracleprime-assets; es imprescindible revisar LICENSES.md antes de cualquier uso comercial.
- No se han publicado datos sobre sesgos, riesgo de alucinación específico ni comportamiento en dominios fuera de la epigrafía.
- El modelo está entrenado para una tarea muy concreta; su uso como modelo multimodal generalista no está validado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre cuantizaciones oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/van-jinp/OraclePrime-7B
- Repositorio de código: https://github.com/RomanticGodVAN/OraclePrime
- Artículo (PDF): https://scis.scichina.com/cn/2026/SSI-2025-0551.pdf
- Licencia: https://huggingface.co/van-jinp/OraclePrime-7B/blob/main/LICENSES.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
