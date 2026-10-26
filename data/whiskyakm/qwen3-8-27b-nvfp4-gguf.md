# WhiskyAKM/Qwen3.8-27B-NVFP4-GGUF

\n\n` before". I can note thinking on by default with those delimiters.

Benchmarks: none → statement.

Hardware bullets:
- Pesos: 15 GB (qwen3.8-27b-nvfp4.gguf) + 1 GiB (mmproj.gguf) = ~16 GB en disco/VRAM si se carga entero en GPU.
- Repo total 24 GB (incluye otros archivos no listados... actually only two files listed, size 24 GB — hmm, the repo size 24 GB with 15GB file + 1GiB... discrepancy. I'll note the repo declares 24 GB total, no disponible el desglose completo).
- NVFP4 requiere soporte Blackwell para aprovechar; mención de RTX 5090 y hasta 170 tok/s con MTP speculative decoding según DataCamp (para el modelo, no específicamente para este GGUF).
- Despliegue: llama.cpp (llama-cli, llama-server), runtimes GGUF compatibles; vLLM se menciona para NVFP4 upstream (aiindigo tutorial) — vLLM soporta NVFP4 checkpoint, no GGUF necesariamente. Say: para el checkpoint NVFP4 original se documenta vLLM; este repo es GGUF y está pensado para llama.cpp.
- Contexto: ejemplo con -c 32768.

Cuadro de casos de uso, 6+.

Enlaces: HF repo, upstream Qwen/Qwen3.8-27B, nvidia/Qwen3.8-27B-NVFP4, llama.cpp github, aiindigo tutorial, datacamp tutorial, NGC catalog.

Write now.## Resumen

WhiskyAKM/Qwen3.8-27B-NVFP4-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B (Qwen/Qwen3.8-27B), un modelo de lenguaje causal nativo de visión-lenguaje (image-text-to-text) con codificador visual independiente, construido sobre la base arquitectónica Qwen3.5. Lo publica el usuario WhiskyAKM en Hugging Face y su función es empaquetar los pesos en NVFP4 (formato de 4 bits nativo de NVIDIA Blackwell) dentro de un contenedor GGUF, de modo que el modelo pueda ejecutarse con llama.cpp y otros runtimes compatibles sin necesidad de infraestructura de servidores dedicada.

El modelo subyacente tiene 26.895.998.464 parámetros (≈27B), es denso (no MoE) y su rasgo definitorio es una pila híbrida: por cada capa de atención completa (Gated Attention con softmax) hay tres capas de atención lineal/recurrente (Gated DeltaNet), seguidas todas ellas de una FFN densa SwiGLU. El contexto nativo es de 262.144 tokens, ampliable hasta 1.000.000 mediante escalado YaRN según reporta el autor del modelo base.

La relevancia práctica de esta ficha es doble: por un lado, permite ejecutar un modelo multimodal de 27B en una sola GPU de consumo, ya que los pesos cuantizados ocupan 15 GB y el proyector visual 1 GiB; por otro, el uso de NVFP4 ata el rendimiento óptimo al hardware Blackwell. Es un artefacto de despliegue, no un modelo nuevo: la licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35`: transformer híbrido con 48 capas de Gated DeltaNet (atención lineal/recurrente) y 16 de Gated Attention (softmax completa), más FFN densa SwiGLU y codificador visual separado |
| Parametros totales | 26.895.998.464 (≈26,9B; el autor lo denomina 27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; 1.000.000 vía escalado YaRN en vLLM/SGLang/TokenSpeed según el modelo base |
| Tipos de cuantizacion | NVFP4 (4 bits, formato nativo de NVIDIA Blackwell); el repo solo distribuye esta cuantización |
| Idiomas soportados | multilingüe (la model card no detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp): `qwen3.8-27b-nvfp4.gguf` + `mmproj.gguf` |
| Capas / dimensión oculta | 64 capas / 5120 |
| FFN | SwiGLU densa, dimensión intermedia 17408 |
| Vocabulario | 248.320 tokens (con padding), BPE, pre-tokenizador `qwen35`, normalización NFC |
| Tokens especiales | BOS/PAD 248044, EOS 248046, imagen 248056, vídeo 248057, inicio/fin de visión 248053/248054 |
| Codificador visual | 27 bloques, hidden 1152, 16 cabezas, patch 16, merge espacial 2, patch temporal 2, proyección a 5120 |
| Tamano del repo | 24,0 GB (pesos: 15 GB; `mmproj.gguf`: 1 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con un patrón fijo de 16 repeticiones de la secuencia `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, es decir, `full_attention_interval = 4`. Las 48 capas de Gated DeltaNet usan atención lineal con estado recurrente: 48 cabezas de valor, 16 cabezas QK, dimensión de cabeza 128, kernel de convolución 4, tamaño de estado 128, 16 grupos, rango de paso temporal 48 y tamaño interno 6144. Las 16 capas de atención completa usan 24 cabezas Q, 4 cabezas KV y dimensión de cabeza 256, con RoPE parcial (dimensión rotatoria 64, un 25% de la cabeza). El RoPE es M-RoPE intercalado con secciones `[11, 11, 10]` y `rope_freq_base = 1e7`, lo que habilita el tratamiento de posición en texto, imagen y vídeo. Cada capa incorpora además una compuerta de salida de atención (`attn_gate`, swish-gated) y normalización RMS con epsilon 1e-6. La FFN es densa SwiGLU en todas las capas, con dimensión intermedia 17408.

El codificador visual va en un archivo aparte (`mmproj.gguf`) y consta de 27 bloques con hidden 1152, 16 cabezas y patch de 16 píxeles, con merge espacial y temporal de factor 2, proyectando a la dimensión 5120 del modelo lingüístico; el modelo admite tanto imagen como vídeo como partes de contenido. El chat template está embebido en el GGUF y acepta payloads `image_url` de la API de OpenAI a través de `llama-server`. El modelo base activa por defecto el modo thinking, emitiendo un bloque de razonamiento delimitado por `<think>` y `</think>`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto y razonamiento en modo thinking activado por defecto, con bloque `<think>…</think>` previo a la respuesta.
- Comprensión de imagen y vídeo (pipeline `image-text-to-text`) mediante el proyector `mmproj.gguf`.
- Modelo causal de propósito general con soporte de contexto largo: 262.144 tokens nativos, hasta 1.000.000 con YaRN según el modelo base.
- Capacidades multilingües (etiqueta `multilingual`; sin desglose por idioma en la información disponible).
- Codificación y tareas agénticas: el catálogo de NVIDIA NGC describe el modelo base como apto para código, razonamiento multimodal, tool calling y tareas de agente.
- Servido como API compatible con OpenAI mediante `llama-server`, incluyendo partes de contenido de imagen y vídeo.
- Ejecución solo-texto sin cargar el proyector visual, lo que reduce el consumo de memoria.

## Casos de uso

- **Asistente documental con imágenes escaneadas**: el modelo recibe páginas de PDF convertidas a imagen junto con preguntas en texto y responde citando el contenido, gracias al pipeline image-text-to-text y a una ventana de 262.144 tokens que permite adjuntar lotes de páginas en una sola petición.
- **Análisis de vídeo corto en local**: con la parte de contenido `video` del chat template, se pueden extraer descripciones, resúmenes o cronologías de clips; el patch temporal 2 del codificador permite modelar la evolución entre fotogramas.
- **Atención al cliente multi-turno**: el contexto nativo de 262k tokens admite historiales largos y documentos de producto adjuntos sin truncado agresivo, y `llama-server` expone el modelo como endpoint compatible con OpenAI para integrarlo en un backend existente.
- **Agente de automatización con tool calling**: el modelo base está descrito por NVIDIA como apto para tareas agénticas y tool calling, por lo que puede orquestar llamadas a APIs en pipelines multi-paso; el bloque de razonamiento previo ayuda a depurar la traza de decisión.
- **Revisión de código y PRs con capturas**: combinación de código en texto y capturas de pantalla de errores o interfaces; el modelo puede correlacionar ambos y proponer parches en un flujo de CI, siempre que el hardware sea Blackwell para aprovechar NVFP4.
- **Prototipado e investigación en una sola GPU**: con 15 GB de pesos más 1 GiB de proyector, un investigador puede reproducir experimentos multimodales en una estación de trabajo con RTX 5090 en lugar de solicitar un clúster.
- **Extracción de datos de formularios e imágenes técnicas**: sustitución de pipelines OCR + reglas por una consulta directa al modelo, indicando el esquema de salida deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas multimodales, y las fuentes web consultadas no aportan cifras comparativas del modelo base.

El único dato de rendimiento encontrado en la búsqueda web es una referencia externa (DataCamp) que cita hasta 170 tokens por segundo al ejecutar Qwen3.8-27B en una RTX 5090 con NVFP4 nativo y decodificación especulativa MTP en llama.cpp. Esa cifra corresponde a ese montaje concreto y no está verificada para este GGUF en particular.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos suman 15 GB (`qwen3.8-27b-nvfp4.gguf`) más 1 GiB del proyector (`mmproj.gguf`), unos 16 GB en total. A esa base hay que añadir el KV cache, cuyo tamaño no está cuantificado en la información disponible; solo 16 de las 64 capas usan atención completa, lo que reduce el coste frente a un transformer denso equivalente.
- **GPU recomendadas**: para aprovechar NVFP4 de forma nativa se requiere arquitectura NVIDIA Blackwell (por ejemplo RTX 5090, B200/GB200); las fuentes consultadas documentan explícitamente el caso de la RTX 5090. El comportamiento en GPUs Ampere o Ada con esta cuantización no está documentado en la información disponible.
- **GPU de consumo**: sí cabe, con al menos ~16 GB de VRAM efectiva para pesos y proyector; el modelo completo sin cuantizar no cabría en tarjetas de 24 GB.
- **Opciones de despliegue**: llama.cpp mediante `llama-cli` y `llama-server` (API compatible con OpenAI); otros runtimes compatibles con GGUF. El checkpoint NVFP4 original del modelo base se documenta para vLLM y para llama.cpp con decodificación especulativa MTP.
- **Latencia y throughput**: no disponibles para este repositorio. La referencia externa de ~170 tok/s en RTX 5090 con NVFP4 y MTP debe tratarse como orientativa.
- **Contexto en la práctica**: los ejemplos de la model card usan `-c 32768`; valores superiores consumen más KV cache y memoria.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de la misma categoría en la información proporcionada. La comparación posible se limita a las tres variantes del mismo modelo:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WhiskyAKM/Qwen3.8-27B-NVFP4-GGUF | ≈26,9B (denso) | 262.144 nativos / 1M con YaRN | GGUF NVFP4 (15 GB) + mmproj (1 GiB) | Apache 2.0 | Este repositorio; orientado a llama.cpp |
| Qwen/Qwen3.8-27B | ≈26,9B (denso) | 262.144 nativos / 1M con YaRN | safetensors (modelo base) | Apache 2.0 | Requiere más VRAM; referencia de calidad |
| nvidia/Qwen3.8-27B-NVFP4 | ≈26,9B (denso) | 262.144 nativos / 1M con YaRN | NVFP4 (checkpoint para vLLM/llama.cpp) | Apache 2.0 (según modelo base) | Publicado por NVIDIA; pensado para servidores |

## Limitaciones y advertencias

- **Dependencia de hardware Blackwell**: NVFP4 está pensado para GPUs NVIDIA Blackwell; en otras arquitecturas el rendimiento o incluso la viabilidad de carga no están documentados en la información disponible.
- **Repositorio sin validación de la comunidad**: 0 descargas y 0 likes en el momento de la consulta, y creación y actualización con dos minutos de diferencia. No hay evidencia pública de evaluaciones independientes de esta cuantización.
- **Sin benchmarks**: no hay métricas publicadas que permitan estimar la degradación de calidad introducida por la cuantización a 4 bits respecto al modelo base.
- **Riesgo de alucinación**: inherente a los modelos generativos; en tareas de imagen o vídeo el riesgo se acentúa cuando el contenido es de baja resolución o el texto de la imagen es pequeño, aunque no se documentan tasas concretas.
- **Idiomas**: la etiqueta es `multilingual` sin lista explícita; no hay garantía documentada de calidad homogénea en castellano.
- **Modo thinking activado por defecto**: incrementa el consumo de tokens y la latencia; para uso interactivo conviene usar los parámetros de modo instruct (temp 0.7, top_p 0.80, presence_penalty 1.5).
- **Ajustes de muestreo sensibles**: subir `presence_penalty` hacia 2.0 reduce la repetición a costa de mezcla de idiomas y una ligera pérdida de calidad, según el autor.
- **Model card incompleta**: la sección de modo thinking aparece truncada en la información disponible, y no se detallan datos de entrenamiento ni composición del dataset.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de terceros antes de desplegar en producción.
- **Proyector separado**: si se omite `mmproj.gguf` el modelo funciona solo con texto; un despliegue multimodal mal configurado fallará silenciosamente en la parte visual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/Qwen3.8-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Tutorial de NVFP4 con vLLM: https://aiindigo.com/tutorials/getting-started-with-qwen3-8-27b-nvfp4-run-a-27b-llm-on-consumer-hardware
- Tutorial de ejecución local en RTX 5090 (DataCamp): https://www.datacamp.com/tutorial/how-to-run-qwen3-8-27b-locally
- Catálogo NVIDIA NGC del modelo: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
