# StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe

## Resumen

StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe es una cuantización del modelo multimodal Qwen/Qwen3.8-Flash-Next, empaquetada en un único contenedor `.rad` de 113,6 GiB para el motor de inferencia radiance sobre AMD RDNA4 y ROCm. No es un modelo nuevo ni un fine-tune: es una compresión del checkpoint bf16 original que combina expertos enrutados a 4 bits mediante codebooks y un tronco en int8 (W8A8), conservando en bf16 diez expertos "protegidos" y la torre de visión.

El problema que resuelve es de despliegue: el checkpoint bf16 del modelo base no es viable en hardware de gama profesional con 32 GB por tarjeta. Esta versión reduce el peso a 113,6 GiB y añade una estrategia de colocación por niveles (`expert_tiered`) en la que los expertos más solicitados residen en VRAM y el resto se transmite desde un pool de memoria del host, de modo que el sistema arranca con dos Radeon AI PRO R9700 y unos 32 GB de RAM libre.

Es relevante para quien quiera servir un MoE multimodal con 262.144 tokens de contexto entrenados (servido a 200K), decodificación especulativa mediante la cabeza MTP del propio modelo y API compatible con OpenAI, todo ello sin salir del ecosistema AMD/ROCm. El autor publica únicamente métricas de divergencia KL frente al modelo bf16; no hay resultados de benchmarks estándar ni validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal con torre de visión y cabeza MTP; incluye matrices de mezcla de hyper-connection |
| Parametros totales | no disponible |
| Parametros activos | no disponible (es MoE, pero el autor no publica el desglose) |
| Longitud de contexto | 262.144 tokens entrenados; servido a 200.000 tokens en la configuración de ejemplo |
| Tipos de cuantizacion | Expertos enrutados a 4 bits con codebook no uniforme de 16 niveles (escala E4M3 por cada 64 pesos); tronco int8 W8A8; matrices de mezcla de hyper-connection en E4M3; 10 expertos protegidos y torre de visión en bf16; caché KV en fp8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` en HuggingFace), heredada del modelo base |
| Formato de pesos | Contenedor propietario `.rad` para el motor radiance; no se distribuyen safetensors, GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de tipo MoE con expertos enrutados y expertos compartidos, más una torre de visión que acepta imágenes y vídeo en peticiones de chat. Esta ficha describe la cuantización: los expertos enrutados se codifican a 4 bits en un codebook no uniforme de 16 niveles tras una rotación de Walsh-Hadamard de 128 puntos, con una escala E4M3 por cada 64 pesos. Los códigos se eligen mediante GPTQ con una calibración de 10 millones de tokens y Hessianos de la proyección descendente por experto, y después se refinan con tres pasadas de descenso por coordenadas. Diez expertos que concentran la mayor parte de la energía de la proyección descendente de su capa se mantienen en bf16.

El tronco (lineales de atención, expertos compartidos y `lm_head`) se cuantiza a int8 con activaciones también int8 (W8A8), con una escala por cada 128 columnas buscada para minimizar el error; las matrices de mezcla de hyper-connection se guardan en E4M3. La decodificación especulativa se apoya en la propia cabeza MTP del modelo, con profundidad 3 por defecto. No se describe ningún reentrenamiento, ajuste con RLHF/DPO ni modificación del dataset original: el proceso es exclusivamente de cuantización.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base.
- Entrada multimodal: procesamiento de imágenes y vídeo dentro de mensajes de chat (`image_url` y partes de vídeo).
- Tool calling / function calling: la API del servidor radiance expone llamadas a herramientas.
- Salida estructurada (structured output) para extracción con esquema fijo.
- Decodificación especulativa con la cabeza MTP (3 tokens especulativos por defecto), con unos 2,4 tokens aceptados por paso según el autor.
- Contexto largo: hasta 200.000 tokens servidos en la configuración de ejemplo, con caché KV en fp8.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentación técnica extensa: con 200.000 tokens de contexto servidos, se puede cargar un manual completo o un repositorio de documentación y hacer preguntas sobre el conjunto sin troceado, con la caché KV en fp8 para reducir el coste de memoria del contexto.
- Análisis de imágenes y vídeo en local: la torre de visión en bf16 permite describir, clasificar o extraer información de capturas, diagramas y fotogramas dentro de una conversación, sin enviar datos a servicios externos.
- Agentes de código integrados en CI/CD: el soporte de tool calling y salida estructurada permite que el modelo invoque linters, ejecute tests o consulte el historial de Git dentro de un pipeline, con el contexto largo necesario para revisar diffs de gran tamaño.
- Extracción estructurada de documentos: facturas, partes médicos o formularios escaneados se envían como imagen y el modelo devuelve JSON conforme a un esquema, aprovechando `structured output`.
- Asistente interno sobre infraestructura AMD: es una de las pocas rutas documentadas para servir un MoE multimodal grande sobre ROCm y RDNA4, útil en organizaciones que ya operan clústeres AMD y quieren evitar la dependencia de CUDA.
- Atención al cliente con contexto acumulado: conversaciones multi-turno largas en las que se mantiene el historial completo de la incidencia sin resumir, gracias a la ventana de 200K y a la decodificación especulativa para reducir la latencia percibida.
- Despliegue on-premise con requisitos de soberanía del dato: al ejecutarse íntegramente en hardware propio vía radiance, encaja en entornos regulados donde no se permite enviar texto ni imágenes a APIs de terceros.
- Investigación en cuantización: el contenedor y sus métricas de KL sirven como caso de estudio reproducible de GPTQ con codebooks aplicado a expertos enrutados, útil para comparar técnicas de compresión sobre MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta divergencia KL sobre vocabulario completo frente al modelo bf16, con `teacher forcing` sobre unas 75.000 posiciones de transcripciones de chat, uso de herramientas y código:

| Conjunto | KL media | Mediana | p99 | p99.9 | Coincidencia top-1 |
|---|---|---|---|---|---|
| Todos los tokens | 0,0789 | 0,0037 | 1,65 | 5,33 | 92,85 % |
| Texto y turnos de asistente | 0,0239 | 0,0029 | 0,32 | 1,03 | 94,57 % |
| Referencia: segunda implementación bf16, todos los tokens | 0,0399 | 0,0013 | 0,82 | 3,43 | 95,13 % |

La fila de referencia corresponde a una segunda implementación en bf16 del mismo modelo, incluida por el autor como cota de ruido, no a un modelo distinto. En cuanto a rendimiento de servicio, sobre 2× Radeon AI PRO R9700 (gfx1201) y un solo stream: aproximadamente 15 ms por paso de decodificación con unos 2,4 tokens aceptados por paso, y unos 6.400 tokens/s de prefill sobre un prompt de 26.000 tokens.

## Requisitos de hardware

- Tamaño del artefacto: 113,6 GiB en un único archivo `.rad`.
- El autor indica explícitamente que los expertos enrutados no caben en dos tarjetas de 32 GB; el motor mantiene los más usados en VRAM y transmite el resto desde un pool fijado en memoria del host.
- Memoria del host: alrededor de 32 GB de RAM libre. En el ejemplo de arranque se configura `--host-pool-mib 12288` (12 GiB de pool) y `--gpu-headroom-mib 96`.
- GPU validadas por el autor: 2× Radeon AI PRO R9700 (32 GB cada una, gfx1201, RDNA4) con ROCm, en tensor paralelo 2 (`--tp 2 --tp-wire wht6`).
- GPU de consumo: no cabe. El propio autor descarta dos tarjetas de 32 GB, por lo que ninguna GPU de consumo actual (24 GB o menos) es suficiente.
- Opciones de despliegue: exclusivamente el motor radiance (`radiance --model ...`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: ~15 ms por paso de decodificación, ~2,4 tokens aceptados por paso con 3 tokens especulativos, ~6.400 tokens/s de prefill en un prompt de 26K, con `--max-num-seqs 8` y `--max-num-batched-tokens 2048`.
- Parámetros de servicio relevantes: `--max-model-len 200000`, `--kv-cache-dtype fp8`, `--placement expert_tiered`, `--expert-vs-cache-ratio 0.82`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-next-flash-fp8-iq4r-moe (esta ficha) | no disponible | 262.144 entrenados / 200.000 servidos | `.rad` (radiance, ROCm) | qwen-community-1.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | 262.144 según el autor de la cuantización | no disponible | qwen-community-1.0 | HuggingFace |
| Segunda implementación bf16 del mismo modelo | no disponible | no disponible | bf16 | no disponible | citada solo como referencia de KL |

No se dispone de información sobre otras cuantizaciones comparables (GGUF, AWQ, GPTQ estándar) del mismo modelo base en el material proporcionado, ni de modelos de la misma categoría con los que contrastar parámetros o rendimiento. La comparativa queda limitada al contraste con el checkpoint bf16 de origen.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: la KL media sobre todos los tokens es 0,0789 y la cola es notable (p99.9 = 5,33), lo que indica que en una pequeña fracción de tokens la distribución se aleja bastante del modelo bf16. En texto y turnos de asistente el comportamiento es mucho mejor (KL media 0,0239, coincidencia top-1 del 94,57 %), pero en uso de herramientas y código la cola empeora.
- Riesgo de alucinación: no evaluado por el autor. La degradación de cola en tareas de tool use y código es un indicio de que la fiabilidad puede caer en esos escenarios, que son precisamente los más sensibles a errores.
- Idiomas soportados: no disponible. No hay ninguna indicación sobre cobertura multilingüe ni sobre calidad en castellano.
- Sesgos: no documentados. Al no haber reentrenamiento, hereda los sesgos del modelo base, que no se analizan en la información disponible.
- Licencia: `qwen-community-1.0`, etiquetada como `license: other`. Es una licencia de comunidad con condiciones específicas; el autor remite al archivo `LICENSE` del repositorio. No se detallan en la información proporcionada los términos exactos de uso comercial, por lo que hay que revisarlos antes de cualquier despliegue en producción.
- Dependencia total del motor radiance: el formato `.rad` no es cargable por transformers, vLLM, llama.cpp ni Ollama. Esto ata el despliegue a ROCm y a GPUs RDNA4 y limita la portabilidad a NVIDIA o a hardware AMD anterior.
- Estrategia de streaming de expertos: el rendimiento depende del ancho de banda y de la latencia de la memoria del host. La configuración de referencia asume 32 GB de RAM libre y una relación experto/caché de 0,82; desviarse de esos valores afectará a la latencia por token.
- Sin validación independiente: el repositorio tiene 0 descargas y 0 likes, con publicación y última actualización el mismo día (3 de octubre de 2026). Todas las métricas proceden del autor y no han sido replicadas.
- Inconsistencia menor de nomenclatura: el nombre del archivo incluye `fp8`, mientras que la descripción indica tronco int8 W8A8 y expertos a 4 bits; conviene verificar el contenido exacto del contenedor antes de asumir formatos.
- No se documenta soporte para fine-tuning ni para fusión de adaptadores sobre este formato cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (referenciada en la model card como `LICENSE` dentro del repositorio): no disponible como enlace directo en la información proporcionada
- Motor de inferencia radiance: no disponible como enlace en la información proporcionada
- Paper o blog técnico de la cuantización: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
