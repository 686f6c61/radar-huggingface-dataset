# staccs/DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF es una cuantizacion GGUF de un solo archivo del modelo dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8, que a su vez es una version "abliterated" (sin alineamiento de rechazo) del DeepSeek-V4.1-Flash-1017 de DeepSeek. El trabajo de abliteracion corresponde a dealignai; el repositorio de staccs unicamente recuantiza esos pesos a formato GGUF mediante cuantizacion vectorial de 11 bits calibrada por activaciones sobre los expertos enrutados. El modelo tiene 106.804.403.562 parametros totales (aproximadamente 106,8 mil millones) y una arquitectura MoE con expertos enrutados y expertos compartidos.

El interes de esta ficha radica en que combina tres elementos poco habituales: una arquitectura MoE de gran tamano, una variante sin censura (abliterated/uncensored) y una tecnica de cuantizacion agresiva (1,39 bits por peso en los expertos enrutados) que reduce el modelo a un unico archivo de 103,43 GB. Esto lo hace desplegable en entornos con memoria unificada amplia (por ejemplo, APU con 128 GB) o en servidores con multiples GPU, algo imposible con los pesos FP8 originales.

La relevancia actual es doble: por un lado, demuestra que la cuantizacion vectorial calibrada permite conservar una fidelidad alta respecto al modelo fuente (perplejidad 2,817 frente al original, con un 80,2% de acuerdo top-1 a 2k de contexto); por otro, documenta un caso real de despliegue en hardware AMD (Radeon 8060S, HIP) con decodificacion especulativa DSpark y tablas Engram, lo que amplia el ecosistema mas alla de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con expertos enrutados y expertos compartidos; incluye torre de vision, decodificador especulativo DSpark y tablas Engram |
| Parametros totales | 106.804.403.562 (aprox. 106,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han evaluado contextos de 2k y 16k; el maximo no se especifica) |
| Tipos de cuantizacion | VQ 11 bits (2048 entradas) en expertos enrutados y compartidos; q4_K en esqueleto denso y embeddings; fp8 en engram_wkv |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (un unico archivo de 103,43 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de DeepSeek (DeepSeek-V4.1-Flash-1017), del que no se detallan en la informacion disponible el numero de capas, dimension oculta ni numero de expertos por capa. Lo que si se documenta es la composicion del build cuantizado: los expertos enrutados (557B parametros segun la model card) usan cuantizacion vectorial de 11 bits con codebooks de 2048 entradas, calibrada por activaciones mediante k-means ponderado sobre 65.536 tokens de calibracion, alcanzando 1,39 bits por peso y un coseno ponderado de 0,909. Los expertos compartidos usan lecore VQ11 con coseno 0,910. El esqueleto denso (atencion q_a/q_b/kv/output_a/output_b, FFN de expertos compartidos, indexer.attn_q_b en capas con gating, MTP main_proj y cabeza de salida) se reemite en q4_K, al igual que el embedding de tokens. El archivo engram_wkv se mantiene en fp8 y las tablas n-gram Engram se usan sin modificar desde los shards originales de DeepSeek.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable de este build es la cuantizacion vectorial calibrada por activaciones, que segun la model card supera a la version no calibrada anterior (lecore-vq10sh12: perplejidad 3,615, KL 0,797 media, top-1 74,5% a 2k) y mantiene un acuerdo top-1 del 80,2% con el modelo fuente. Ademas, el despliegue incorpora decodificacion especulativa mediante el drafter DSpark y tablas Engram para n-gramas.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un MoE de gran escala orientado a generacion y razonamiento; la model card recomienda desactivar thinking/reasoning para uso con agentes.
- Procesamiento de vision: incluye una torre de vision separada (DeepSeek-V4.1-Flash.vision.gguf, 0,90 GiB) que habilita entrada de imagenes.
- Codigo y matematicas: no se documentan evaluaciones especificas en la informacion disponible, pero son capacidades esperables del modelo base DeepSeek-V4.1-Flash.
- Tool calling / function calling: no se documenta explicitamente en la model card; el uso con agentes se menciona en las recomendaciones de sampling.
- Agentes y razonamiento multi-paso: la model card menciona uso con agentes y advierte de bucles de repeticion en turnos largos de herramientas si no se fija max_tokens.
- Multilingue: la model card declara unicamente ingles (en); no se detallan otros idiomas.
- Modo sin censura: variante abliterated/uncensored que elimina el comportamiento de rechazo del modelo original.
- Decodificacion especulativa: soporte de drafter DSpark para acelerar la generacion.
- Capacidad Engram: uso de tablas n-gram externas para mejorar la generacion.

## Casos de uso

- Investigacion sobre desalineamiento y seguridad: el modelo permite estudiar el comportamiento de un MoE de gran escala tras eliminar los mecanismos de rechazo, comparando respuestas con el modelo original para analizar sesgos y riesgos.
- Despliegue en hardware con memoria unificada: gracias al unico archivo GGUF de 103,43 GB, puede servirse en equipos como la Radeon 8060S con 128 GB de memoria unificada mediante el servidor ds4-server con HIP, sin necesidad de un cluster de GPU.
- Generacion de texto a gran escala con contexto medio: con perplejidad de 2,817 y 80,2% de acuerdo top-1 a 2k de contexto, es adecuado para tareas de generacion y resumen donde se prioriza la fidelidad al modelo fuente.
- Procesamiento de imagenes: la torre de vision permite construir pipelines multimodales (descripcion de imagenes, extraccion de informacion visual) apuntando `--vision-gguf` al directorio del archivo de vision.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta metricas detalladas (KL, Jaccard top-p, masa residual en ids reservados) que lo convierten en un caso de referencia para medir el impacto de la cuantizacion vectorial calibrada.
- Agentes automatizados con control de sampling: la model card recomienda temperature 0.6, top_p 0.95, min_p 0.05 y max_tokens 4096 para evitar bucles de repeticion en turnos largos de herramientas, lo que permite integrarlo en frameworks de agentes con limites explicitos.
- Servicio de API compatible con OpenAI: el servidor ds4-server expone un endpoint `/v1` en `http://127.0.0.1:8008/v1`, lo que facilita integrarlo en aplicaciones existentes que usan la API de OpenAI.

## Benchmarks y rendimiento

Los datos publicados en la model card son metricas de fidelidad respecto al modelo fuente (teacher = dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8) sobre el conjunto de test de WikiText-2:

| Metrica | Contexto 2k | Contexto 16k |
|---|---:|---:|
| Perplejidad | 2,817 | 2,936 |
| KL media vs fuente | 0,587 | 0,584 |
| KL mediana vs fuente | 0,047 | 0,093 |
| Acuerdo top-1 con fuente | 80,2% | 78,6% |
| Masa residual en ids reservados (media) | 2,10e-07 | 2,44e-07 |
| Masa residual en ids reservados (max) | 7,66e-05 | 8,23e-05 |
| Masa de escape fuera del top-50 de la fuente | 0,0359 | 0,0316 |
| Jaccard del conjunto top-p 0.95 vs fuente | 0,681 | 0,627 |

Como referencia, el build anterior no calibrado (lecore-vq10sh12) del modelo original obtuvo perplejidad 3,615, KL media 0,797, KL mediana 0,195 y top-1 74,5% a 2k de contexto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo de pesos ocupa 103,43 GB (96,3 GiB). A ello hay que sumar la torre de vision (0,90 GiB), el drafter DSpark (5,05 MiB), el esqueleto denso GGUF (605,8 MiB) y las tablas Engram (dos shards de 101,5 GB cada uno, aproximadamente 203 GB adicionales).
- Memoria unificada: se ha medido en una Radeon 8060S (gfx1151, HIP SDK 7.2) con 128 GB de memoria unificada. La variable `DS4_CUDA_COPY_MODEL=1` copia los pesos a memoria de GPU y requiere un limite de commit de Windows superior a unos 100 GB; `-NoCopy` mapea desde host (sin commit, mas lento).
- GPU recomendadas: no se especifican en la informacion disponible. El unico hardware documentado es la Radeon 8060S con HIP. Para el modelo completo harian falta GPUs con memoria agregada superior a 100 GB (por ejemplo, multiples A100/H100), aunque no se confirma en la model card.
- Cabe en GPU consumer: no de forma directa; el modelo completo excede la VRAM de cualquier GPU consumer actual. Requiere memoria unificada amplia o multiples GPU.
- Opciones de despliegue: servidor `ds4-server` del repositorio staccs/ds4-winhip con HIP nativo en Windows; endpoint compatible con OpenAI. No se documentan vLLM, llama.cpp estandar, Ollama ni TGI para este build.
- Latencia y throughput: no disponibles. La model card menciona que sin max_tokens un bucle de repeticion puede alcanzar 19,5k tokens en 22 minutos, pero no ofrece cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated-lecore-vq11cal (este) | 106,8B | no disponible | GGUF VQ11 + q4_K | MIT | Cuantizacion calibrada; PPL 2,817 a 2k |
| DeepSeek-V4.1-Flash-1017-lecore-vq10sh12 | no disponible | no disponible | GGUF VQ10 | no disponible | Build anterior no calibrado; PPL 3,615 a 2k |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible | no disponible | FP8 | no disponible | Modelo fuente de la abliteracion |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Modelo base original de DeepSeek |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a lo documentado.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; como todo modelo generativo, puede producir informacion falsa con apariencia de rigor.
- Bucles de repeticion: la model card advierte que sin max_tokens un bucle de repeticion puede consumir todo el contexto (caso observado de 19,5k tokens en 22 minutos). Con temperature 1.0 sin truncar el modelo produce "word salad" en prompts de 14k o mas; greedy es coherente pero entra en bucles deterministas en turnos largos de herramientas.
- Sampling obligatorio en la practica: se recomienda temperature 0.6, top_p 0.95, min_p 0.05 y max_tokens 4096, ya que muchos frameworks de agentes no envian estos parametros.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta documentado.
- Dependencia de archivos auxiliares: el GGUF de 103 GB no es autosuficiente; requiere la torre de vision, el drafter DSpark, el esqueleto denso y los dos shards Engram (aproximadamente 203 GB adicionales) para servir el modelo completo.
- Compatibilidad del drafter: el drafter DSpark es del build pqhaz; otras abliteraciones pueden usar la torre de vision y las tablas Engram, pero con una tasa de aceptacion menor.
- Hardware: el despliegue medido usa HIP en Windows con una APU concreta; no hay garantias de funcionamiento en otras plataformas ni se documentan rutas CUDA, vLLM u Ollama.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del contenido generado recae en el desplegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-dealignai-lecore-vq11cal-GGUF
- Modelo fuente (abliteracion de dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Sidecars (vision, drafter DSpark, esqueleto denso): https://huggingface.co/staccs/ds41-sidecars
- Servidor HIP para Windows: https://huggingface.co/staccs/ds4-winhip
- Build anterior no calibrado: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
