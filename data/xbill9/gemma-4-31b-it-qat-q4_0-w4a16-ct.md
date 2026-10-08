# xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct

## Resumen

Este repositorio es un reempaquetado no oficial de los pesos con entrenamiento consciente de cuantización (QAT) de Gemma 4 31B-it, publicados por Google DeepMind como `google/gemma-4-31B-it-qat-q4_0-unquantized` (revisión `1e4d8be`). El autor, xbill9, convierte esos pesos al formato `compressed-tensors` `pack-quantized` W4A16 que carga vLLM, manteniendo la torre de visión. No se realiza una cuantización nueva: el checkpoint original almacena valores bf16 que ya están sobre una rejilla de 4 bits, y el reempaquetado se limita a recuperar el paso de cada grupo y escribir los niveles como int4 empaquetado.

El resultado ocupa 19,04 GiB frente a los 58,25 GiB del checkpoint bf16 de origen, es decir, una reducción de aproximadamente 3,06x, con 31.273.088.876 parámetros totales (dato real de los safetensors). El repositorio completo pesa 20,5 GB. El pipeline declarado es `image-text-to-text` y la librería de destino es vLLM, con licencia Apache 2.0.

La relevancia actual del modelo es fundamentalmente práctica: permite ejecutar una variante multimodal de 31B de la familia Gemma 4 en GPUs de 24 GB o en nodos A100/H100 con mayor concurrencia y menor coste de memoria que la versión bf16. La contrapartida es que se trata de un build recién publicado (8 de octubre de 2026, 15 descargas, 0 likes) que, según su propia model card, todavía no ha sido servido ni evaluado, y cuyo procesamiento de imágenes no ha sido probado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para `image-text-to-text` con torre de visión; detalles de atención y capas no disponibles |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | No aplicable (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A16: int4 simétrico, tamaño de grupo 32, escalas bf16, activaciones sin cuantizar, formato `compressed-tensors` `pack-quantized`. Se cuantizan todas las proyecciones de atención y MLP del modelo de lenguaje; embeddings, normas y torre de visión se conservan en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | Safetensors en formato `compressed-tensors` |
| Tamaño del checkpoint | 19,04 GiB (frente a 58,25 GiB del origen bf16) |
| Tamaño del repositorio | 20,5 GB |
| Modelo base | `google/gemma-4-31B-it-qat-q4_0-unquantized` (relación: quantized) |
| Librería de inferencia | vLLM |
| Modalidad | Imagen y texto (image-text-to-text), conversacional |
| Fecha de publicación | 2026-10-08 (creación), 2026-10-08 (última actualización) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base (tipo de atención, número de capas, dimensiones ocultas ni composición del dataset de entrenamiento), por lo que esos datos figuran como no disponibles. Lo que sí se documenta es la estructura de la cuantización: el checkpoint `-qat-q4_0-unquantized` de Google almacena valores bf16 que ya se encuentran sobre una rejilla de 4 bits, de modo que dentro de cada grupo de 32 pesos cada valor es `paso × nivel`, con niveles enteros de −8 a 7. El script `repack_q4_0.py` recupera el paso de cada grupo (`max|w| / m`, con m de 1 a 8, refinado por mínimos cuadrados) y escribe los niveles como int4 empaquetado. No se aplica ninguna cuantización nueva.

La verificación incluida en el repositorio relee ambos checkpoints y comprueba cada grupo: 410 tensores y 915.210.240 grupos de 32 sin ningún nivel fuera de la rejilla de origen, y un 89,9 % de valores bit a bit idénticos (el resto difiere únicamente a través de la escala bf16, con un máximo de 1,1e-02 relativo). Los 778 tensores de embeddings, normas y torre de visión son idénticos byte a byte.

| Capa | Tensores | Grupos de 32 | Niveles fuera de la rejilla | Valores bit a bit idénticos |
|---|---:|---:|---:|---:|
| `mlp.down_proj` | 60 | 216.760.320 | 0 | 90,0 % |
| `mlp.gate_proj` | 60 | 216.760.320 | 0 | 89,9 % |
| `mlp.up_proj` | 60 | 216.760.320 | 0 | 90,0 % |
| `self_attn.k_proj` | 60 | 37.847.040 | 0 | 90,0 % |
| `self_attn.o_proj` | 60 | 96.337.920 | 0 | 89,7 % |
| `self_attn.q_proj` | 60 | 96.337.920 | 0 | 89,8 % |
| `self_attn.v_proj` | 50 | 34.406.400 | 0 | 90,3 % |
| **Total** | 410 | 915.210.240 | 0 | 89,9 % |

No se documentan en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas del modelo base más allá del propio QAT aplicado por Google antes del reempaquetado.

## Capacidades

- Generación de texto conversacional: el sufijo `-it` indica ajuste por instrucciones en el modelo base, aunque no se detallan las capacidades concretas.
- Entrada de imagen y texto: el pipeline declarado es `image-text-to-text` y la torre de visión se conserva intacta (778 de 778 tensores idénticos byte a byte). El autor advierte que la entrada de imagen no ha sido probada.
- Conversación multiturno: etiquetada como `conversational` en los tags del repositorio.
- Inferencia optimizada para vLLM: el formato `compressed-tensors` W4A16 es cargable directamente por vLLM sin pasos de conversión adicionales.
- Variante solo texto: existe un build hermano sin torre de visión (`xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text`) para despliegues que no requieren entrada de imagen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el campo de idiomas de la ficha de HuggingFace está vacío).
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en una única GPU de consumo: con 19,04 GiB de pesos en int4, el modelo puede cargarse en una RTX 4090 o RTX 3090 de 24 GB mediante vLLM, dejando el resto de la VRAM para la caché KV y la torre de visión, siempre con una longitud de contexto conservadora.
- Servicio de inferencia con vLLM en producción: el formato `compressed-tensors` permite usar el motor de vLLM con `PagedAttention` y batching continuo, reduciendo el coste por token frente al checkpoint bf16 de 58,25 GiB al poder alojar más réplicas o mayor concurrencia en el mismo hardware.
- Procesamiento de documentos escaneados y formularios: al mantener la torre de visión, el modelo puede abordar tareas de extracción de información a partir de imágenes, si bien el autor advierte que la ruta de imagen no ha sido validada y requiere pruebas propias antes de llevarla a producción.
- Sustitución de la versión bf16 en infraestructura ya desplegada: equipos que ya sirven Gemma 4 31B-it en A100 80 GB o H100 pueden cambiar a este checkpoint para liberar aproximadamente 39 GiB de VRAM por réplica, reutilizando el mismo motor de inferencia.
- Asistentes conversacionales internos con requisitos de residencia de datos: al ser un modelo de pesos abiertos con licencia Apache 2.0 y desplegable en vLLM, puede ejecutarse en infraestructura propia o aislada de internet, sin llamadas a APIs externas.
- Evaluación comparativa de QAT frente a cuantizaciones post-entrenamiento: el repositorio incluye utilidades de verificación (`repack`, `verify`) y los informes `repack_report.json` y `verify_report.json`, lo que lo convierte en un artefacto útil para estudiar la fidelidad de la rejilla int4 del QAT frente a GPTQ o AWQ.
- Base para pipelines de generación aumentada por recuperación (RAG): al ser un modelo conversacional servido por vLLM con API compatible con OpenAI, puede insertarse como generador en un pipeline de recuperación de documentos, aunque la calidad final no está medida.
- Punto de partida para investigación sobre cuantización: el desglose por capa del porcentaje de valores bit a bit idénticos permite analizar qué proyecciones (por ejemplo, `self_attn.o_proj` con un 89,7 %) conservan peor la fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo está «built and checked offline against its source; not yet served or evaluated». No existen valores de MMLU, HumanEval, GSM8K, MMMU ni de latencia o throughput medidos para este repositorio. El único dato cuantitativo verificable es la tabla de verificación del reempaquetado incluida en la sección de arquitectura (0 niveles fuera de la rejilla en 915.210.240 grupos y 89,9 % de valores bit a bit idénticos).

## Requisitos de hardware

- VRAM mínima estimada para los pesos: 19,04 GiB en int4, a los que hay que sumar el overhead del runtime de vLLM (típicamente 1-2 GiB) y la caché KV, cuyo tamaño depende del contexto y del número de secuencias concurrentes, que no se especifica.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB es suficiente para cargar los pesos, pero el margen para caché KV es de aproximadamente 3-4 GiB, lo que limita el contexto y la concurrencia. Se trata de una estimación propia, no de un dato medido por el autor.
- GPU profesionales: L40S (48 GB), A100 (40 GB y 80 GB) y H100 (80 GB) ofrecen margen holgado para contexto largo y batching. En configuraciones de 40 GB se recomienda monitorizar el consumo de caché KV.
- Despliegue multi-GPU: vLLM soporta tensor parallelism, por lo que sería posible repartir el modelo en 2 GPUs de 24 GB, siempre que la arquitectura concreta del modelo base sea compatible; no hay confirmación del autor al respecto.
- Opciones de despliegue: vLLM es la librería declarada (`library_name: vllm`) y el formato soportado es `compressed-tensors` W4A16. No se indica compatibilidad con llama.cpp, Ollama, TGI ni TensorRT-LLM, y el formato no es GGUF, por lo que no es directamente utilizable en Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Ahorro de memoria frente al origen: 58,25 GiB (bf16) frente a 19,04 GiB (W4A16), una reducción de 39,21 GiB por réplica.

## Comparación con modelos similares

| Modelo | Parámetros | Formato / cuantización | Tamaño de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct` | 31,27B | compressed-tensors W4A16 int4, grupo 32 | 19,04 GiB | No disponible | Apache 2.0 | Repack no oficial, sin evaluar, 15 descargas |
| `google/gemma-4-31B-it-qat-q4_0-unquantized` | No indicado (mismo origen) | «Unquantized»: bf16 con valores sobre rejilla de 4 bits | 58,25 GiB | No disponible | Apache 2.0 / licencia Gemma 4 | Checkpoint oficial de Google DeepMind |
| `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text` | No indicado | compressed-tensors W4A16 int4, sin torre de visión | No disponible | No disponible | Apache 2.0 | Repack no oficial, variante solo texto |
| Otras cuantizaciones de Gemma 4 31B (GPTQ, AWQ, GGUF) | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la información disponible |

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica que el checkpoint «not yet served or evaluated»; no hay ninguna medición de calidad, latencia ni throughput publicada.
- Entrada de imagen sin probar: la torre de visión se conserva byte a byte, pero la ruta multimodal no ha sido validada; no debe asumirse que funciona en producción.
- Repack no oficial: el repositorio no está afiliado ni respaldado por Google. Los problemas deben reportarse al autor del repositorio, no a Google DeepMind.
- Diferencias numéricas respecto al origen: aproximadamente el 10 % de los valores no son bit a bit idénticos; difieren a través de la escala bf16 con un error relativo de hasta 1,1e-02. No se ha medido el impacto de esta diferencia en la calidad final.
- Ausencia total de datos sobre sesgos, alucinación, comportamiento multilingüe y seguridad: no disponibles en la model card ni en la información proporcionada.
- Longitud de contexto desconocida: al no especificarse, no es posible dimensionar la caché KV ni planificar escenarios de contexto largo.
- Licencia: el repositorio declara Apache 2.0 y enlaza a los términos de licencia de Gemma 4 de Google. Conviene revisar dichos términos antes de un uso comercial, ya que el propio enlace apunta a una licencia específica y no únicamente a Apache 2.0.
- Adopción mínima: 15 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Formato no portable a llama.cpp/Ollama: al ser `compressed-tensors` y no GGUF, el despliegue queda restringido a motores que soporten este formato, principalmente vLLM.
- Fine-tuning: el formato W4A16 con `compressed-tensors` no está pensado para ajuste fino directo; sería necesario partir del checkpoint sin cuantizar.
- Fecha de publicación futura respecto a la ventana habitual de datos: la ficha registra creación el 2026-10-08, lo que puede indicar un repositorio muy reciente y, por tanto, sin historial de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Variante solo texto: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de reempaquetado: `repack_q4_0.py` (incluido en el repositorio)
- Informes de verificación: `repack_report.json` y `verify_report.json` (incluidos en el repositorio)
- Model card original de Google: `ORIGINAL_README.md` (incluida sin cambios en el repositorio)
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
