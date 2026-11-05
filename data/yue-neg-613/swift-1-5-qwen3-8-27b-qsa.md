# yue-neg-613/Swift-1.5-Qwen3.8-27b-QSA

## Resumen

Swift-1.5-Qwen3.8-27B-QSA es un modelo derivado de la familia Qwen3.8 de 27.800 millones de parametros, publicado por el usuario yue-neg-613 en HuggingFace. Se trata de un experimento tecnico de sustitucion arquitectonica: reemplaza las capas de atencion global (tradicionalmente Grouped Query Attention, GQA) por QSA (Qwen Sparse Attention), el mecanismo empleado en Qwen3.8-Flash-Next. El modelo parte del checkpoint ukisai/Swift-1.5-Qwen3.8-27B-GGUF y conserva el backbone multimodal completo, incluido el codificador de vision, los tensores MTP, el tokenizer, el processor y la plantilla de chat.

La relevancia de esta publicacion es acotada y de caracter exploratorio. El propio autor indica explicitamente que el modelo se creo para verificar la tecnologia de sustitucion QSA y que no esta pensado para inferencia en entornos reales. No se declara ninguna mejora de velocidad: el runtime incluido usa una mascara booleana densa como referencia de correccion, no un kernel disperso optimizado.

El modelo no dispone de pipeline declarado, licencia explicita en los metadatos de HuggingFace ni idiomas listados, y cuenta con cero descargas y cero likes en el momento de la consulta. Su interes es, por tanto, el de una prueba de concepto reproducible para investigadores que quieran estudiar la viabilidad de sustituir GQA por atencion dispersa en un transformer multimodal de ~28B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.8) con QSA (Qwen Sparse Attention) en las capas de atencion global del decodificador de texto |
| Parametros totales | 27.833.862.896 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los indexers QSA usan K=2048, r=4, pero no se especifica la ventana total) |
| Tipos de cuantizacion | no disponible en este repo (solo safetensors BF16); el modelo base existe en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (heredada del modelo base); uso comercial requiere consulta separada a ukisAI |
| Formato de pesos | safetensors (BF16 para el backbone, FP32 para los indexers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.8-27B. La modificacion principal consiste en sustituir las capas de atencion global, que en el modelo original emplean Grouped Query Attention, por QSA (Qwen Sparse Attention), el mecanismo utilizado en Qwen3.8-Flash-Next. Los indexers QSA se han entrenado sobre las capas de atencion completa del decodificador de texto. Segun la model card, las peticiones de solo texto utilizan QSA con K=2048 y r=4, mientras que las peticiones con imagen o video (incluida la generacion posterior con cache) y las peticiones con padding recurren a la atencion densa original.

El backbone completo se preserva: pesos del decodificador, codificador de vision, tensores MTP (multi-token prediction), tokenizer, processor y plantilla de chat. Los indexers se mantienen en FP32 y los pesos del backbone en BF16. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El autor tampoco declara mejoras de velocidad: el runtime de referencia emplea una mascara booleana densa como comprobacion de correccion, y no implementa rollback especulativo, ejecucion MTP, caches estaticas o cuantizadas, ni continuous batching.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del backbone Qwen3.8-27B, aunque el autor no las documenta de forma independiente para esta variante.
- Procesamiento multimodal: conserva el codificador de vision y el processor, por lo que admite entradas de imagen y video, que se procesan con atencion densa original.
- Prediccion multi-token (MTP): los tensores MTP originales se conservan, aunque el runtime publicado no los ejecuta.
- Tool calling y function calling: no disponible de forma explicita en la informacion proporcionada; se asume herencia del modelo base, sin verificacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas en los metadatos.
- Modo thinking: no disponible en la informacion proporcionada.
- Atencion dispersa selectiva: uso de QSA (K=2048, r=4) en peticiones de solo texto, con atencion densa como fallback para multimodal y padding.

## Casos de uso

- Investigacion sobre atencion dispersa: el modelo sirve como banco de pruebas para estudiar la sustitucion de GQA por QSA en un transformer de ~28B, comparando la salida con la del modelo base mediante la mascara densa de referencia.
- Validacion de pipelines de conversion: el repo incluye un `conversion_manifest.json` con la procedencia y los limites de validacion, util para auditar el proceso de reemplazo de capas y la preservacion de pesos.
- Estudio de degradacion multimodal: al usar atencion densa para imagen y video, permite medir si la sustitucion QSA en texto afecta a tareas que combinan modalidades.
- Base para desarrollo de kernels dispersos: el runtime actual es una referencia de correccion, no optimizada, por lo que sirve como punto de partida para implementar kernels QSA reales en llama.cpp o en otros backends.
- Analisis de licencias derivadas: util para equipos juridicos y de compliance que evaluen las obligaciones de la Swift Open License v1.0 en modelos derivados.
- Docencia y formacion tecnica: ejemplo reproducible de modificacion arquitectonica sobre un checkpoint abierto, con instrucciones de carga via `transformers` y `trust_remote_code=True`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 56 GB solo para pesos (27,8B parametros x 2 bytes), mas overhead de activaciones, cache KV e indexers en FP32. El tamano del repo es de 55,8 GB.
- VRAM estimada en cuantizacion de 8 bits: del orden de 28-30 GB, no verificada para esta variante QSA.
- VRAM estimada en cuantizacion de 4 bits: del orden de 15-17 GB, no verificada para esta variante QSA.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin offloading; dos RTX 4090 (24 GB cada una) o una RTX 6000 Ada (48 GB) podrian ser insuficientes en BF16 y requeririan cuantizacion o sharding.
- Cabe en GPU de consumo: solo con cuantizacion agresiva y, presumiblemente, sin el codificador de vision completo; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText`, `trust_remote_code=True`, `attn_implementation='sdpa'` y `device_map='auto'`; llama.cpp requiere la version personalizada en https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor no reclama ninguna mejora de velocidad y el runtime usa mascara densa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-QSA (este) | ~27,8B | no disponible | QSA en texto, densa en multimodal | Swift Open License v1.0 | HuggingFace, safetensors BF16 |
| ukisai/Swift-1.5-Qwen3.8-27B-GGUF (base) | ~27,8B | no disponible | GQA original | Swift Open License v1.0 | HuggingFace, GGUF |
| higa2515/Qwen3.8-27B-QSA-BF16 (referencia metodologica) | ~27,8B | no disponible | QSA | no disponible | HuggingFace, BF16 |
| Qwen3.8-Flash-Next (origen del mecanismo QSA) | no disponible | no disponible | QSA | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo experimental: el autor declara explicitamente que no esta pensado para inferencia en entornos reales y que su proposito es verificar la tecnologia QSA.
- Sin mejoras de rendimiento: el runtime usa una mascara booleana densa como referencia de correccion; no se reclama ningun speedup y no hay kernel disperso optimizado.
- Funcionalidades no implementadas: rollback especulativo, ejecucion MTP, caches estaticas o cuantizadas y continuous batching no estan soportados en el runtime publicado.
- Dependencia de runtime personalizado: requiere una version modificada de llama.cpp o el stack de `transformers` con `trust_remote_code=True`, lo que incrementa el riesgo de seguridad y mantenimiento.
- Licencia restrictiva para uso comercial: la Swift Open License v1.0 obliga a consultar con ukisAI para uso comercial; los metadatos de HuggingFace no declaran licencia explicita.
- Idiomas no documentados: no se listan idiomas soportados, por lo que el comportamiento multilingue no esta garantizado ni verificado.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; se heredan los del modelo base sin analisis adicional.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Contexto no especificado: aunque los indexers usan K=2048 y r=4, no se documenta la longitud de contexto total soportada.
- Fecha de creacion futura en los metadatos (2026-11-05), lo que puede indicar inconsistencias en el registro del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yue-neg-613/Swift-1.5-Qwen3.8-27b-QSA
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Metodologia de referencia QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Runtime llama.cpp personalizado: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
