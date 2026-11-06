# vnbot-ai/VNBot-MotaZ-27B

## Resumen

VNBot-MotaZ-27B es un modelo multimodal de tipo image-text-to-text desarrollado por vnbot-ai (Origo Technologies), presentado como el asistente de IA de la compañía para tareas de texto e imagen en vietnamita e ingles. Se distribuye como un fine-tune del modelo base Qwen/Qwen3.8-27B, sobre el que se ha aplicado un ajuste supervisado orientado a conversacion y a la integracion de entradas visuales, manteniendo la arquitectura original de la familia Qwen.

El modelo cuenta con 27.356.728.560 parametros totales (aproximadamente 27,36 mil millones), lo que lo situa en la franja de modelos densos de gran tamano aptos para despliegue en una sola GPU de 80 GB en BF16 o en configuraciones multi-GPU. El repositorio ocupa 55,6 GB y se publica en formato safetensors con pesos en BF16, compatible con la libreria transformers y con vLLM.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en modelos de esta escala; por otro, la combinacion de entrada de imagen y texto con soporte bilingue vietnamita-ingles cubre un nicho de mercado poco atendido por los modelos occidentales. La model card, no obstante, es extremadamente escueta y no documenta datos de entrenamiento, benchmarks ni limitaciones, lo que condiciona la evaluacion tecnica que puede hacerse del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 16384` (16.384 tokens) |
| Tipos de cuantizacion | No se publican pesos cuantizados; los pesos originales estan en BF16. Al ser compatible con transformers y vLLM, admite cuantizacion posterior (GPTQ, AWQ, FP8) mediante herramientas externas, aunque no hay artefactos oficiales |
| Idiomas soportados | Vietnamita (vi) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 55,6 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (finetune) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen/Qwen3.8-27B, un transformer multimodal de la familia Qwen3.5 segun el tag `qwen3_5` del repositorio. Esta familia combina un codificador visual con un decodificador de lenguaje autorregresivo, lo que permite procesar imagenes y texto de forma conjunta en el mismo contexto. Al tratarse de un fine-tune y no de un modelo entrenado desde cero, la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion, resolucion de imagen soportada) no se detalla en la model card y debe consultarse en la documentacion del modelo base.

En cuanto al entrenamiento, la informacion publicada es practicamente nula: no se especifica el numero de tokens de ajuste, la composicion del dataset, si hubo fases de RLHF o DPO, ni el metodo exacto de alineacion. La model card solo indica que se trata de un fine-tune orientado a conversacion bilingue vietnamita-ingles con soporte de imagenes, y que los pesos se distribuyen en BF16. No se documentan innovaciones tecnicas propias del autor, decodificacion especulativa ni variantes de atencion lineal; cualquier capacidad de este tipo provendria del modelo base Qwen3.8-27B y no esta confirmada en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en vietnamita e ingles.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre contenido visual y conversacion multimodal.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B.
- Capacidades multilingues limitadas a los dos idiomas declarados (vi, en); no se declara soporte de espanol ni de otras lenguas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integracion con infraestructura de inferencia tipo API.
- Soporte de tool calling / function calling: no documentado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Modo thinking explicito, audio u otras modalidades: no documentado; no disponible.

## Casos de uso

- Atencion al cliente en vietnamita: el modelo puede gestionar conversaciones multi-turno con usuarios vietnamitas, un mercado con poca cobertura en modelos abiertos, y responder en el mismo idioma con la terminologia de la empresa ajustada durante el fine-tune.
- Analisis de documentos con imagenes: al aceptar entradas image-text-to-text, puede extraer y resumir informacion de capturas, formularios escaneados o fotografias de documentos, combinando la lectura visual con la generacion de texto en vietnamita o ingles.
- Asistente interno bilingue para equipos vietnamita-ingles: traduccion y reformulacion de contenido entre ambos idiomas dentro de flujos corporativos, aprovechando la licencia Apache-2.0 para uso comercial sin restricciones.
- Moderacion y clasificacion de contenido visual: el modelo puede describir y clasificar imagenes enviadas por usuarios en plataformas de comercio electronico o redes sociales, generando etiquetas y resumenes textuales.
- Prototipado rapido de productos multimodales: con despliegue en vLLM mediante un solo comando y pesos en safetensors, es adecuado para validar ideas de producto que requieran vision y lenguaje sin coste de licencia.
- Generacion de descripciones de producto para e-commerce: a partir de una fotografia del articulo, el modelo puede redactar descripciones en vietnamita e ingles para catalogos, reduciendo el trabajo manual de fichas.
- Soporte a accesibilidad: conversion de imagenes en descripciones textuales para usuarios con discapacidad visual, en vietnamita o ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones con el modelo base Qwen/Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para pesos, mas memoria para el codificador visual, cache KV y overhead de ejecucion; en la practica requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- Cuantizacion a 8 bits (FP8/INT8): reduce los pesos a unos 27-28 GB, lo que permite ejecucion en una sola GPU de 40-48 GB (A6000, L40S, A100 40 GB) con contexto moderado.
- Cuantizacion a 4 bits (GPTQ/AWQ, no oficial): los pesos bajan a unos 14-15 GB, lo que podria permitir ejecucion en GPU de consumo como RTX 4090 (24 GB) o RTX 3090, aunque no hay artefactos cuantizados publicados por el autor y habria que generarlos.
- Despliegue recomendado por el autor: vLLM, con el comando `vllm serve vnbot-ai/VNBot-MotaZ-27B --max-model-len 16384`.
- Alternativas de despliegue: transformers (libreria declarada), TGI y llama.cpp/Ollama para versiones GGUF, si bien no se publican pesos GGUF oficiales y la conversion de un modelo multimodal a GGUF requiere pasos adicionales.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B | 27,36 B | No disponible (ejemplo con 16.384) | Texto + imagen | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | ~27 B | No disponible en esta ficha | Texto + imagen | Segun modelo base (no confirmada) | Hugging Face |
| Gemma 3 27B (referencia de categoria) | 27 B | 128 K (segun documentacion publica del modelo) | Texto + imagen | Gemma Terms | Hugging Face |
| Mistral Small 3.1 24B (referencia de categoria) | 24 B | 128 K (segun documentacion publica del modelo) | Texto + imagen | Apache-2.0 | Hugging Face |

La comparacion con Gemma 3 27B y Mistral Small 3.1 24B se ofrece como referencia de categoria por tamano y modalidad; no se dispone de datos de rendimiento de VNBot-MotaZ-27B que permitan una comparacion cuantitativa. El principal diferenciador del modelo de vnbot-ai es el soporte nativo de vietnamita y su licencia Apache-2.0, frente a las condiciones de uso de Gemma.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no detalla datos de entrenamiento, composicion del dataset, proceso de alineacion ni evaluaciones, lo que impide auditar sesgos o calidad de forma rigurosa.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin benchmarks publicados no puede acotarse su magnitud.
- Sesgos conocidos: no documentados por el autor; al ser un fine-tune sobre Qwen3.8-27B, hereda los sesgos del modelo base, que tampoco se detallan en la informacion disponible.
- Cobertura linguistica limitada: solo se declaran vietnamita e ingles; el rendimiento en espanol u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto no confirmado: la unica referencia es el ejemplo de despliegue con 16.384 tokens; no se confirma la ventana maxima real del modelo.
- Sin cuantizaciones oficiales: no hay pesos GGUF, GPTQ ni AWQ publicados, lo que complica el despliegue en hardware de consumo.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio por si el modelo base impone condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni issues que permitan validar su comportamiento en produccion.
- Uso en produccion: se recomienda evaluacion propia con un conjunto de validacion representativo antes de desplegarlo, dada la ausencia de metricas publicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio vLLM (despliegue recomendado por el autor): https://github.com/vllm-project/vllm
