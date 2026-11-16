# speakleash/Bielik-Minitron-7B-v3.0-Instruct-NVFP4

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-NVFP4 es una versión cuantizada del modelo instructivo Bielik-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash, una comunidad polaca centrada en recursos lingüísticos y modelos de lenguaje para el polaco y otras lenguas europeas. El modelo original parte de una arquitectura Llama y se ha sometido a un proceso de destilación tipo Minitron, que reduce el tamaño de un modelo mayor manteniendo parte de su capacidad mediante poda y destilación de conocimiento.

Esta variante concreta aplica cuantización NVFP4, un formato de 4 bits de coma flotante con escalas por bloque introducido por NVIDIA para acelerar la inferencia en hardware Blackwell. Los pesos y las activaciones se almacenan en NVFP4, lo que reduce el espacio de 14,95 GB (7.477.727.232 parámetros en BF16) a aproximadamente 4,6 GB, manteniendo la licencia Apache 2.0 del modelo base.

El interés de esta ficha radica en que combina un modelo multilingüe de 7B parámetros con una cuantización de muy baja precisión pensada para despliegues de alto rendimiento. Es relevante para equipos que quieran servir el modelo en GPUs NVIDIA recientes con vLLM o TensorRT-LLM y necesiten reducir el coste de memoria y aumentar el throughput sin renunciar al soporte de más de 30 idiomas europeos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (base Bielik-Minitron-7B-v3.0-Instruct) |
| Parametros totales | 7.477.727.232 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones en 4 bits FP, formato compressed-tensors) |
| Idiomas soportados | multilingual, pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama con 7.477.727.232 parámetros, derivado de un proceso Minitron: se parte de un modelo mayor de SpeakLeash y se reduce su tamaño mediante poda estructurada y destilación de conocimiento, conservando el tokenizador y la configuración de atención del modelo original. La model card del repositorio cuantizado no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica de esta variante es la cuantización NVFP4, que representa pesos y activaciones en coma flotante de 4 bits con escalas compartidas por bloques. A diferencia de una cuantización INT4 clásica, NVFP4 mantiene un rango dinámico mayor y está diseñado para las unidades tensor de las GPUs Blackwell (B200, GB200, RTX 50xx). El repositorio usa el formato compressed-tensors, lo que permite cargar los pesos directamente en vLLM y en el stack de NVIDIA sin conversión manual. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto instructivo en más de 30 idiomas europeos, con especial énfasis en polaco e inglés.
- Razonamiento y respuesta a instrucciones en formato conversacional (modelo -Instruct).
- Generación de código y tareas de matemáticas básicas, heredadas del modelo base.
- Soporte multilingüe amplio: lenguas eslavas (pl, cs, sk, sl, hr, sr, bs, bg, ru, uk, bel), germánicas (en, de, nl, da, sv, no, is), románicas (es, fr, it, pt, ro), bálticas (lt, lv, et), además de griego, albanés, turco y húngaro.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.
- No se documentan capacidades de visión, audio ni agentes multi-paso.

## Casos de uso

- Atención al cliente en polaco y otras lenguas centroeuropeas: el modelo puede gestionar conversaciones multi-turno en el idioma del usuario sin necesidad de un modelo específico por país, lo que simplifica el despliegue en empresas con presencia en varios mercados.
- Traducción y localización: al cubrir más de 30 idiomas europeos, sirve para traducir documentación, correos y contenido web entre lenguas eslavas, germánicas y románicas, con la ventaja de un único modelo en lugar de varios especializados.
- Generación de contenido editorial en polaco: redacción de borradores, resúmenes y reescritura de textos para medios o equipos de marketing que trabajan principalmente en polaco.
- Asistentes internos sobre documentación corporativa: el formato instructivo permite integrarlo en un pipeline RAG para responder preguntas sobre manuales y políticas internas en varios idiomas europeos.
- Clasificación y extracción de información multilingüe: procesamiento de tickets, reseñas o formularios en distintos idiomas con un solo modelo, reduciendo la complejidad operativa.
- Despliegue de alto throughput en GPUs Blackwell: gracias a NVFP4 y compressed-tensors, es adecuado para servir el modelo con vLLM o TensorRT-LLM en B200/GB200, donde el ahorro de memoria y el aumento de tokens por segundo son críticos.
- Prototipado en estaciones de trabajo con RTX 50xx: el tamaño de 4,6 GB permite cargar el modelo en GPUs de consumo de la generación Blackwell para pruebas locales y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB solo para pesos en NVFP4; con caché KV y overhead del runtime, se recomienda un mínimo de 8-10 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA B200, GB200 y RTX 50xx (Blackwell), únicas arquitecturas con soporte nativo de NVFP4 en las unidades tensor.
- GPUs no soportadas de forma nativa: A100, H100, RTX 4090 y generaciones anteriores no ejecutan NVFP4 de forma eficiente; requerirían emulación o conversión a otro formato.
- Cabe en GPU de consumo: sí, en RTX 50xx con al menos 8 GB de VRAM, siempre que el runtime soporte NVFP4.
- Opciones de despliegue: vLLM y TensorRT-LLM con soporte de compressed-tensors/NVFP4; llama.cpp y Ollama no soportan NVFP4 de forma nativa y requerirían reconversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-NVFP4 | 7,48 B | no disponible | NVFP4 | Apache 2.0 | Hugging Face |
| Bielik-Minitron-7B-v3.0-Instruct (base) | 7,48 B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct | 7,24 B | 32 K | BF16/GGUF/AWQ | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,03 B | 128 K | BF16/GGUF/AWQ | Llama 3.1 Community | Hugging Face |

La comparativa se limita a datos públicos de los modelos alternativos; no se dispone de resultados de benchmarks del modelo Bielik en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar la calidad respecto al modelo base en BF16, especialmente en tareas de razonamiento complejo y generación de código; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El modelo hereda los sesgos del corpus de entrenamiento del modelo base, con un peso importante de contenido en polaco e inglés; el rendimiento en lenguas con menos representación (por ejemplo, albanés, islandés o letón) puede ser inferior.
- Riesgo de alucinación inherente a los modelos de 7B parámetros, agravado por la cuantización agresiva.
- La longitud de contexto no está documentada en la información disponible, lo que impide garantizar ventanas largas en producción.
- NVFP4 solo es eficiente en hardware Blackwell; desplegarlo en A100, H100 o RTX 40xx requiere conversión a otro formato y pierde la ventaja de memoria.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su robustez en producción.

## Enlaces

- [Hugging Face: speakleash/Bielik-Minitron-7B-v3.0-Instruct-NVFP4](https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct-NVFP4)
- [Modelo base: speakleash/Bielik-Minitron-7B-v3.0-Instruct](https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct)
- [SpeakLeash en Hugging Face](https://huggingface.co/speakleash)
