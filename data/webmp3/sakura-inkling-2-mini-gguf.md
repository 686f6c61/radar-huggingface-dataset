# webmp3/Sakura-Inkling-2-Mini-GGUF

## Resumen

Sakura-Inkling-2-Mini-GGUF es una cuantización comunitaria, no oficial, del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario webmp3. El modelo base es un mixtura de expertos (MoE) con arquitectura "looped" (atención iterativa en bucle) de 26.400 millones de parámetros totales y 3.400 millones activos por token, con 128 expertos de los que 8 se activan por token, entrada de imagen y hasta 1 millón de tokens de contexto. Esta publicación ofrece tres archivos GGUF (Q4_K_M, Q5_K_M y Q6_K) más el proyector de visión, pensados para inferencia local con llama.cpp.

El interés de esta ficha reside en que permite ejecutar en hardware de consumo un modelo MoE multimodal de 26 B con un coste activo de solo 3,4 B por token, algo que el checkpoint original en BF16 (más de 60 GB) hace inviable en la mayoría de equipos. La cuantización se realizó a partir del GGUF BF16 de ggml-org, no desde los pesos originales, reutilizando su matriz de importancia (imatrix) y su proyector de visión sin modificaciones.

Es relevante ahora porque la arquitectura requiere llama.cpp b12600 o superior (PR #32694): versiones antiguas, Ollama o LM Studio con runtimes previos no cargarán estos archivos. El autor advierte explícitamente de que no se han medido benchmarks, comportamiento en contexto largo, ni la calidad de la entrada de imagen con estos archivos; solo se publican métricas de divergencia KL frente a Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE "looped" multimodal (image-text-to-text), 128 expertos con 8 activos por token |
| Parametros totales | 26.070.385.152 (26,4 B) |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (modelo base); el autor recomienda `-c 8192` en los ejemplos |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K (GGUF); proyector de visión en BF16 y Q8_0 |
| Idiomas soportados | en (inglés) según la model card; el modelo base no declara otros idiomas en esta información |
| Licencia | Apache-2.0, sujeta a la política de uso aceptable del modelo original |
| Formato de pesos | GGUF (safetensors en el modelo base; el repo GGUF ocupa 61,9 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de tipo mixtura de expertos con una innovación estructural denominada "looped": la arquitectura `inkling2_loop` que requiere soporte específico en llama.cpp (PR #32694, release b12600). Combina 128 expertos con enrutamiento de 8 activos por token, lo que da un ratio de activación de aproximadamente el 13 % sobre los 26,4 B totales, y añade capacidad multimodal mediante un proyector de visión (`mmproj`) que permite entrada de imagen junto con texto.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El autor de la cuantización tampoco documenta estos extremos, ya que su trabajo se limita a la conversión a GGUF. La model card menciona que la profundidad de razonamiento se controla mediante el parámetro `reasoning_effort` del modelo base (de `none` a `max`), lo que sugiere un modo de razonamiento configurable, pero no se detalla el mecanismo de entrenamiento subyacente.

En cuanto al proceso de cuantización, los expertos de 4 bits de las capas 0 a 19 provienen de NVFP4 en el checkpoint original, un formato de 4 bits distinto de los K-quants empleados aquí, por lo que los archivos de 4 bits acumulan un segundo paso de redondeo cuyo coste no se ha medido frente al original. La imatrix se calculó sobre el archivo BF16 con los datos de calibración v6 de bartowski, con conversaciones renderizadas mediante la plantilla de chat del modelo, y cubre 224 de los 226 tensores de pesos de 16 bits; el embedding de tokens y la salida se cuantizaron sin estadísticas de matriz.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat propia del modelo base.
- Razonamiento configurable mediante `reasoning_effort`, con niveles de `none` a `max`.
- Entrada de imagen (image-text-to-text) a través del proyector `mmproj-Inkling-2-Mini-BF16.gguf` o su versión Q8_0.
- Procesamiento de contexto muy largo: el modelo base declara hasta 1 M de tokens, aunque el autor solo valida ejemplos con 8192.
- Capacidad multilingüe limitada según la model card: solo se declara inglés (`en`); el conjunto de calibración de la imatrix incluyó texto en inglés, código, alemán y chino, pero sin métricas de calidad por idioma.
- Compatibilidad con endpoints OpenAI a través de `llama-server` (`/v1`), lo que facilita la integración en pipelines existentes.
- No se documenta en esta información soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso; debe verificarse contra la model card del modelo base.

## Casos de uso

- Asistente conversacional local con privacidad de datos: al ejecutarse íntegramente en llama.cpp sobre hardware propio, permite desplegar un chatbot sin enviar información a servicios externos, con el archivo Q4_K_M (17,48 GB) como opción de menor huella de memoria.
- Análisis de documentos largos: el modelo base admite hasta 1 M de tokens de contexto, lo que habilita resumir o extraer información de contratos, informes o expedientes extensos; conviene validar empíricamente el comportamiento en contexto largo, ya que el autor no lo ha medido.
- Procesamiento de imágenes con descripción textual: gracias al proyector de visión, se puede usar para generar pies de foto, extraer texto de capturas o responder preguntas sobre diagramas, integrado vía `llama-server` con `--mmproj`.
- Prototipado e investigación de arquitecturas MoE: el ratio de activación del 13 % y la estructura "looped" lo convierten en un banco de pruebas accesible para estudiar eficiencia de enrutamiento y atención iterativa sin clústeres multi-GPU.
- Backend compatible con OpenAI para aplicaciones existentes: al exponer `/v1`, se puede sustituir una API en la nube por este servidor local en herramientas que ya hablan el protocolo OpenAI, útil para desarrollo y pruebas de integración.
- Evaluación de cuantizaciones en local: los tres archivos publicados con sus métricas de KLD frente a Q8_0 (0,0228 / 0,0128 / 0,0076) permiten a un equipo medir el compromiso calidad-memoria en su propio dominio antes de fijar un formato para producción.
- Despliegue en estaciones de trabajo con GPU única: con Q5_K_M (19,91 GB) o Q6_K (23,49 GB) y offload parcial, encaja en equipos con 24 GB de VRAM, aunque el autor no ha medido velocidad ni rendimiento de backends GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no midió benchmarks, comportamiento en contexto largo, entrada de imagen con estos archivos, velocidad, backends GPU ni concordancia con el checkpoint original. Las únicas métricas publicadas son de divergencia frente a Q8_0 de ggml-org:

| Archivo | Cuantizacion | Tamano | KLD media vs Q8_0 | Mismo token top-1 |
|---|---|---|---|---|
| Sakura-Inkling-2-Mini-Q4_K_M.gguf | Q4_K_M | 17,48 GB | 0,0228 | 94,49 % |
| Sakura-Inkling-2-Mini-Q5_K_M.gguf | Q5_K_M | 19,91 GB | 0,0128 | 95,28 % |
| Sakura-Inkling-2-Mini-Q6_K.gguf | Q6_K | 23,49 GB | 0,0076 | 96,53 % |

Las métricas se calcularon sobre 5 fragmentos de 256 tokens (inglés, código, alemán y chino), por lo que el propio autor advierte que la muestra es pequeña y poco representativa de contextos largos, otros idiomas o calidad de código. La referencia es Q8_0, no el modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,5 GB para Q4_K_M, 19,9 GB para Q5_K_M y 23,5 GB para Q6_K, más el proyector de visión (642 MB en BF16) y la caché KV del contexto configurado.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajan en A100 (40/80 GB), H100 y RTX 4090 (24 GB) con offload total o casi total; en GPUs de 16 GB sería necesario offload parcial a CPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M, y en RTX 3090 (24 GB) con los mismos archivos; Q6_K queda muy justo en 24 GB y requiere contexto reducido u offload parcial.
- Opciones de despliegue: `llama-server` de llama.cpp b12600 o superior (probado por el autor, build CPU); Ollama y LM Studio solo si su runtime incluye la arquitectura `inkling2_loop` (no probados por el autor). No se documenta soporte de vLLM ni TGI para estos archivos GGUF.
- Latencia y throughput: no medidos por el autor; no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento del modelo base ni de alternativas comparables (parámetros, contexto, benchmarks, licencia) que permitan una comparativa rigurosa. Las alternativas naturales serían otros MoE multimodales de tamaño similar, pero sin cifras verificables no se ofrece tabla comparativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sakura-Inkling-2-Mini (esta ficha) | 26,4 B totales / 3,4 B activos | hasta 1 M (base) | Apache-2.0 | GGUF en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantización no oficial: no es un lanzamiento de Thinking Machines; el autor no garantiza concordancia con el checkpoint original y no la ha medido.
- Requiere llama.cpp b12600 o superior (PR #32694). Versiones antiguas, Ollama o LM Studio con runtimes previos fallarán al cargar los archivos.
- Los expertos de 4 bits de las capas 0 a 19 provienen de NVFP4 en el original, un formato de 4 bits distinto de los K-quants, por lo que los archivos de 4 bits acumulan un segundo redondeo de coste no medido.
- Las métricas de KLD se basan en una muestra pequeña (5 fragmentos de 256 tokens) y no informan sobre contexto largo, otros idiomas ni calidad de código.
- Idiomas: la model card solo declara inglés; el uso en castellano no está validado y podría degradar la calidad.
- Riesgo de alucinación: no evaluado en esta información; debe asumirse el comportamiento típico de un modelo de lenguaje sin verificación factual.
- Sesgos: no documentados en esta información.
- Comportamiento en contexto largo: el modelo base declara 1 M de tokens, pero el autor no lo ha medido y sus ejemplos usan 8192; no extrapolar sin pruebas propias.
- Entrada de imagen: el proyector se incluye, pero el autor no ha medido la calidad de la entrada de imagen con estos archivos.
- Licencia: Apache-2.0 para los pesos, sujeta a la política de uso aceptable del modelo original (https://thinkingmachines.ai/model-acceptable-use-policy/); revisar antes de uso comercial.
- Sin datos de velocidad, throughput ni rendimiento por backend GPU; el autor solo probó una build CPU.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/webmp3/Sakura-Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF BF16 de origen (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Política de uso aceptable del modelo original: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp (releases, requiere b12600 o superior): https://github.com/ggml-org/llama.cpp/releases
- Pull request de soporte de la arquitectura `inkling2_loop`: https://github.com/ggml-org/llama.cpp/pull/32694
- Datos de calibración v6 de bartowski (usados para la imatrix): https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
