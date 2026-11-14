# Xylolabs/gemma-4-31B-it-GGUF

## Resumen

Gemma 4 31B IT es el modelo de lenguaje de gran tamano de Google DeepMind publicado bajo licencia Apache 2.0, distribuido originalmente en precision BF16. Esta ficha describe la version cuantizada a GGUF publicada por Xylolabs, un export de solo texto del decodificador, pensado para inferencia local y en servidores con llama.cpp. La cuantizacion empleada es IQ4_XS con importance matrix, lo que reduce el peso de los tensores principales a unos 4,36 bits por parametro de media y permite ejecutar el modelo en aproximadamente 16,72 GB de memoria para los pesos.

El modelo base cuenta con 30.697.345.596 parametros (unos 30,7 mil millones) y una arquitectura transformer de 60 capas en el decodificador de texto, con tabla de embeddings y salida atada. Esta variante elimina el codificador de vision y el proyector multimodal: solo acepta entrada de texto. El contexto original se conserva en los metadatos del GGUF, aunque el ejemplo de uso de la model card limita la ventana a 2.048 tokens por motivos de memoria.

La relevancia de esta publicacion es practica: ofrece una ruta de despliegue de un modelo de 31B en hardware de consumo o en una sola GPU profesional, con una validacion explicita de fidelidad frente a BF16 y frente a una referencia Q4_K_M. La model card reporta que el archivo supera la comprobacion de referencia relativa con 33/33 respuestas correctas y 7/7 rechequeos con modo thinking activado, sin perdidas contabilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), solo texto en esta variante |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Conservada en metadatos del GGUF; el ejemplo de la model card usa 2.048 tokens; las evaluaciones usan 8.192 |
| Tipos de cuantizacion | IQ4_XS con importance matrix (tensores principales), Q6_K (tabla de embeddings/salida atada), F32 (vectores) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle adicional del archivo: 833 tensores procedentes de las 60 capas del decodificador de texto, tabla de embeddings/salida atada, normalizacion final, tokenizer y plantilla de chat original. Tipos reales de tensor: F32 en 422 tensores, IQ4_XS en 410, Q6_K en 1. Tamano de descarga: 16,736 GB. Bits medios por peso: 4,357.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4, con 60 capas en el decodificador de texto y una tabla de embeddings y salida atada (tied embedding/output table). Esta variante GGUF conserva unicamente la ruta de texto: el codificador de vision y el proyector multimodal del modelo original se han omitido, de modo que la ruta evaluada acepta exclusivamente entrada textual. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base.

La model card de esta cuantizacion es explicita sobre el proceso: no se realizo entrenamiento, calibracion ni cuantizacion nuevos para la publicacion. Se reutiliza el resultado de importance matrix existente y los metadatos de cuantizacion originales; los nombres de fichero de calibracion historicos son etiquetas de metadatos y no se incluye ningun dataset. La innovacion tecnica destacable es la verificacion de fidelidad: 16 secuencias emparejadas de 1.024 tokens cubren 16.232 posiciones puntuadas en grupos de ingles y coreano, en modo plano y de chat, comparando la divergencia KL y la coincidencia top-1 frente a BF16 y frente a una referencia Q4_K_M.

## Capacidades

- Generacion de texto conversacional (modelo etiquetado como `-it`, instruction-tuned).
- Razonamiento con modo thinking: la plantilla de chat admite el parametro `enable_thinking`, y la evaluacion incluye rechequeos con thinking activado.
- Soporte de plantilla de chat Jinja mediante `--jinja` en llama.cpp.
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del modelo.
- Entrada exclusivamente de texto en esta variante: sin vision, sin audio.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Inferencia local en estaciones de trabajo: con 16,72 GB de pesos en IQ4_XS, el modelo se puede cargar en una GPU consumer de 24 GB (por ejemplo, RTX 4090) dejando margen para cache KV y buffers, o en configuraciones con offload parcial a CPU mediante llama.cpp.
- Despliegue en servidor con llama.cpp: el binario `llama-cli` con plantilla Jinja permite servir consultas de texto con temperatura 0 para tareas deterministas de extraccion o clasificacion.
- Generacion de texto en ingles y coreano: util para productos dirigidos a esos dos mercados, con la salvedad de que no hay soporte documentado para castellano.
- Prototipado de asistentes conversacionales: la plantilla de chat original y el modo thinking permiten alternar respuestas directas y respuestas razonadas segun la tarea.
- Evaluacion comparativa de cuantizaciones: el archivo incluye metricas de KL y coincidencia top-1 frente a BF16 y Q4_K_M, lo que lo hace util como referencia reproducible en estudios de cuantizacion.
- Pipeline de CI para validacion de modelos: la comprobacion de referencia relativa (33/33 mas 7/7 con thinking) sirve como test de humo automatizable al integrar el GGUF en un entorno de inferencia.

## Benchmarks y rendimiento

La model card no reporta benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). Reporta metricas de fidelidad de cuantizacion:

| Opcion | KL media | Coincidencia top-1 con BF16 | KL / Q4_K_M | Respuestas correctas |
|---|---:|---:|---:|---:|
| Q4_K_M (referencia) | 0,446503 | 81,94% | 1,000x | 33/33 + 7/7 |
| IQ4_XS-imat | 0,434252 | 82,45% | 0,973x | 33/33 + 7/7 |

Las 16 secuencias emparejadas de 1.024 tokens cubren 16.232 posiciones puntuadas en grupos de ingles y coreano, en modo plano y de chat. La relacion KL de IQ4_XS queda por debajo del umbral de 1,5x y la puerta de respuestas admite como maximo una perdida contabilizada o respuesta rota adicional respecto a Q4_K_M. Las perdidas contabilizadas excluyen empates cercanos en BF16 (diferencia top-dos inferior a 1,0 en el primer token divergente) y elementos de razonamiento recuperados con thinking activado. La velocidad de inferencia no se reporta en la informacion disponible.

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 16,72 GB solo para los pesos del decodificador de texto en IQ4_XS-imat; hay que sumar cache KV y buffers de trabajo.
- GPU consumer: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) con contexto moderado; en 16 GB no cabe sin offload a CPU.
- GPU profesional: A100 (40/80 GB) y H100 permiten contextos mayores y mayor paralelismo; el modelo base BF16 requiere del orden de 61 GB solo en pesos.
- Despliegue: llama.cpp (binario verificado con la version v0.9.0 en el ejemplo de la model card); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla la integracion.
- Contexto: el ejemplo de la model card usa `-c 2048`; las evaluaciones usan 8.192. Contextos mayores incrementan la memoria de cache KV de forma proporcional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Xylolabs/gemma-4-31B-it-GGUF (IQ4_XS-imat) | 30,7B | Conservado en metadatos; ejemplo a 2.048 | GGUF | Apache 2.0 | Solo texto; 16,72 GB de pesos; KL 0,434 frente a BF16 |
| Referencia Q4_K_M del mismo modelo base | 30,7B | Conservado en metadatos | GGUF | Apache 2.0 | Solo texto; KL 0,446; 81,94% top-1 frente a BF16 |
| google/gemma-4-31B-it (BF16) | 30,7B | No disponible | Safetensors | Apache 2.0 | Modelo original con vision; requiere aproximadamente 61 GB en pesos |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento cualitativo con otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: el codificador de vision y el proyector multimodal se han eliminado; no admite imagenes ni audio.
- Idiomas: los metadatos declaran unicamente ingles y coreano; no hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinacion: inherente a los modelos generativos; la model card no incluye evaluaciones de factualidad.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Fidelidad de cuantizacion: las metricas KL y top-1 se calculan sobre 16 secuencias cortas y 33+7 prompts; no sustituyen una evaluacion de tarea completa, como advierte la propia model card.
- Contexto: aunque los metadatos conservan la longitud original, el ejemplo practico limita a 2.048 tokens; contextos largos exigen mas memoria para cache KV.
- Licencia: Apache 2.0 permite uso comercial, pero se deben conservar los terminos completos y la atribucion de origen Google/Google DeepMind en `LICENSE` y `NOTICE`.
- Procedencia: el export se ofrece tal cual, sin garantia ni aval del autor original del modelo.
- Sin datos de velocidad: no se reportan latencia ni throughput, por lo que el dimensionado de produccion requiere medicion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF/blob/main/LICENSE
- Pagina oficial de licencia de Gemma: https://ai.google.dev/gemma/apache_2
- Paper tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Codigo llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentacion de llama.cpp para GGUF en Hugging Face: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
