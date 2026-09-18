# Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2-GGUF

## Resumen

Bible-Assistant-Qwen3.5-4B-v3.2-GGUF es un conjunto de cuantizaciones en formato GGUF de un ajuste fino continuado del modelo Qwen/Qwen3.5-4B, especializado en preguntas y respuestas bíblicas con recuperación documental (RAG). Lo publica el usuario Ttimms y está pensado para ejecutarse en local con llama.cpp y sus derivados. El modelo tiene 4.205.751.296 parametros totales (aproximadamente 4,2B) y emplea la arquitectura hibrida de Qwen3.5, que combina capas Gated-DeltaNet con atencion.

El problema que resuelve es concreto: generar respuestas bíblicas que citen versiculos de forma literal y verificable, con una tasa de alucinacion declarada del 1,9% y una tasa de citacion correcta del 98,9%, sobre un recall de versiculos literales del 80,3%. El autor afirma que es el primer checkpoint de su linea que supera todas las puertas de aceptacion y el mejor de su clase de tamano en una metrica semantica de cross-encoder frente a otros modelos bíblicos de ~4B probados.

Es relevante ahora porque demuestra un patron de publicacion habitual en el ecosistema abierto: un ajuste fino de dominio publicado primero en safetensors y despues en una escalera de cuantizaciones GGUF, incluida una variante NVFP4 nativa para tensor cores FP4 de Blackwell. El repositorio ocupa 24,6 GB e incluye seis archivos de cuantizacion distintos, lo que permite desplegar el modelo desde 2,5 GB en adelante. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida `qwen35` (Gated-DeltaNet + atencion), derivada de Qwen/Qwen3.5-4B |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16, NVFP4 (mixta) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Datos adicionales de los archivos publicados:

| Archivo | Cuantizacion | Tamano | Notas |
|---|---|---|---|
| bible-v3.2-4b-nvfp4.gguf | NVFP4 | 2,5 GB | La mas pequena, 4,66 bpw, nativa Blackwell |
| bible-v3.2-4b-Q4_K_M.gguf | Q4_K_M | 2,7 GB | Recomendada para uso general, 5,15 bpw |
| bible-v3.2-4b-Q5_K_M.gguf | Q5_K_M | 3,1 GB | no disponible |
| bible-v3.2-4b-Q6_K.gguf | Q6_K | 3,5 GB | no disponible |
| bible-v3.2-4b-Q8_0.gguf | Q8_0 | 4,5 GB | Casi sin perdida |
| bible-v3.2-4b-f16.gguf | F16 | 8,4 GB | Precision completa |

## Arquitectura y entrenamiento

El punto de partida es Qwen/Qwen3.5-4B, un modelo de arquitectura hibrida etiquetada como `qwen35` que combina Gated-DeltaNet con mecanismos de atencion. Sobre esa base, el autor aplico primero un adaptador v3.1 de SFT orientado a sintesis tematica y despues un ajuste fino continuado de estilo DMT (continued fine-tune) con un dataset `thematic_qa` corregido mediante RAFT mas datos de ensayo (rehearsal), a un learning rate de 5e-5. El adaptador resultante se fusiono al modelo en bf16 para producir el checkpoint en safetensors.

La conversion a GGUF se realizo con `convert_hf_to_gguf --no-mtp` seguido de `llama-quantize`, generando la escalera de k-quants. La variante NVFP4 se construyo por separado con la herramienta `advanced-gguf-quantizer` (rama `mxfp6-cuda` de llama.cpp), usando busqueda de tensores en modo profundo, ranking de sensibilidad `allow_diagnostic` y una puerta dura sobre la KLD de cola. Esta cuantizacion apunta a los tensor cores FP4 nativos de Blackwell (`BLACKWELL_NATIVE_FP4=1`, verificado en una RTX 5070 Ti / SM120) y es una tecnica distinta de la escalera de k-quants, no un punto mas de la misma curva. En el lado de recuperacion, el sistema usa un RAG hibrido con dense (nomic) + BM25 + RRF + bge-reranker-v2-m3.

## Capacidades

- Generacion de texto conversacional en ingles orientada a preguntas y respuestas sobre la Biblia.
- Recall literal de versiculos del 80,3%, segun la evaluacion declarada por el autor.
- Citacion correcta del 98,9% y tasa de alucinacion del 1,9% en el mismo conjunto de evaluacion.
- Integracion con pipelines RAG hibridos (dense + BM25 + RRF + reranker) para fundamentar las respuestas en pasajes recuperados.
- Mejor resultado de su clase de tamano (~4B) en una metrica semantica de cross-encoder frente a otros modelos bíblicos ajustados probados, segun el autor.
- Ejecucion local en llama.cpp, LM Studio, koboldcpp, Jan, text-generation-webui y Ollama (este ultimo cuando su llama.cpp incluya la arquitectura `qwen35`).
- Capacidades de tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de estudio bíblico en local: desplegado con el GGUF Q4_K_M en llama.cpp, el modelo responde preguntas doctrinales o tematicas citando versiculos literales, con una tasa de alucinacion declarada del 1,9% que reduce el riesgo de citas inventadas.
- Aplicacion de escritorio sin conexion: con 2,7 GB en Q4_K_M o 2,5 GB en NVFP4, cabe en un portatil con GPU consumer y permite consultas biblicas sin enviar datos a un servicio externo.
- Chatbot de iglesia o comunidad con RAG: conectando el modelo a un indice hibrido (dense + BM25 + RRF + bge-reranker-v2-m3) se pueden responder preguntas sobre pasajes concretos manteniendo el texto fuente como contexto recuperado.
- Generacion de material de predicacion o catequesis: el modelo puede redactar reflexiones tematicas apoyadas en versiculos citados, y el 98,9% de citacion correcta reduce la revision manual necesaria.
- Busqueda semantica sobre corpus bíblicos: combinado con un recuperador, permite localizar pasajes relevantes para una consulta en lenguaje natural y devolver la referencia exacta.
- Evaluacion comparativa de cuantizaciones en produccion: el repositorio incluye Q4_K_M, Q5_K_M, Q6_K, Q8_0 y F16, lo que permite medir el impacto real de la cuantizacion sobre la calidad de citacion antes de fijar una configuracion.
- Experimentacion con FP4 nativo en Blackwell: la variante NVFP4 sirve como banco de pruebas para medir perplejidad y divergencia KL frente a bf16 en hardware SM120.
- Fine-tuning posterior o destilacion: el checkpoint en safetensors de la version v3.2 puede usarse como punto de partida para nuevos ajustes de dominio.

## Benchmarks y rendimiento

Metricas de calidad declaradas por el autor para el checkpoint v3.2 (sin comparativa numerica contra modelos nombrados en la informacion disponible):

| Metrica | Resultado |
|---|---|
| Recall literal de versiculos | 80,3% |
| Tasa de citacion correcta | 98,9% |
| Tasa de alucinacion | 1,9% |
| Metrica semantica de cross-encoder | Mejor de su clase de tamano (~4B), sin valor numerico publicado en la informacion disponible |

Comparativa interna entre las dos cuantizaciones principales, medida con `llama-perplexity --kl-divergence` sobre la misma referencia bf16 y el mismo corpus de calibracion y evaluacion:

| Cuantizacion | Tamano | bpw | Ratio de PPL medio vs bf16 | KL-divergence media vs bf16 |
|---|---|---|---|---|
| NVFP4 | 2,45 GB | 4,66 | 1,1130 ± 0,0008 | 0,1109 ± 0,0003 |
| Q4_K_M | 2,71 GB | 5,15 | 1,1228 ± 0,0008 | 0,0929 ± 0,0003 |

La lectura del autor: NVFP4 es mas pequena y tiene mejor ratio de perplejidad media pese a gastar menos bits por peso (4,66 frente a 5,15 bpw), pero su divergencia KL es mayor, es decir, su distribucion de probabilidad por token se aleja mas del modelo base aunque la precision media de siguiente token se mantenga. El autor indica que Q4_K_M es la opcion mas segura cuando se citan versiculos literales y que NVFP4 esta pensada para priorizar tamano y perplejidad media o para ejercitar la ruta FP4 nativa de Blackwell.

## Requisitos de hardware

- VRAM estimada de inferencia segun archivo: NVFP4 2,5 GB, Q4_K_M 2,7 GB, Q5_K_M 3,1 GB, Q6_K 3,5 GB, Q8_0 4,5 GB y F16 8,4 GB, mas el overhead de contexto y de la cache KV de llama.cpp.
- Cabe en GPU consumer: si, con cualquiera de las cuantizaciones de 2,5 a 4,5 GB en tarjetas con 8 GB o mas de VRAM. La variante F16 de 8,4 GB requiere tarjetas con 12 GB o mas para dejar margen de contexto.
- GPU verificada por el autor: RTX 5070 Ti (SM120), con 175 tok/s medidos en llama-cli/llama-server y salida coherente citando correctamente Juan 3:16.
- La ruta NVFP4 nativa requiere hardware Blackwell (SM120) con soporte de tensor cores FP4 y la variable `BLACKWELL_NATIVE_FP4=1`.
- Opciones de despliegue: llama.cpp (`llama-server -m <archivo>.gguf -ngl 99`), LM Studio, koboldcpp, Jan, text-generation-webui y Ollama (cuando su llama.cpp incluya la arquitectura `qwen35`).
- Requisito critico de software: hace falta un build reciente de llama.cpp que incluya la arquitectura hibrida `qwen35`, commit `3173a56` o posterior.
- Latencia y throughput para otras GPU o cuantizaciones: no disponibles.

## Comparativa con modelos similares

El autor afirma que este checkpoint obtiene el mejor resultado de su clase de tamano (~4B) en una metrica semantica de cross-encoder frente a todos los demas modelos bíblicos ajustados probados, pero no nombra esos modelos ni publica sus valores en la informacion disponible. La comparativa posible con los datos aportados es la siguiente:

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Bible-Assistant-Qwen3.5-4B-v3.2 (Q4_K_M) | ~4,2B | GGUF | no disponible | Apache 2.0 | 80,3% recall literal, 98,9% citacion, 1,9% alucinacion (metricas declaradas por el autor) |
| Bible-Assistant-Qwen3.5-4B-v3.2 (NVFP4) | ~4,2B | GGUF | no disponible | Apache 2.0 | Menor tamano y menor PPL media, mayor KLD que Q4_K_M |
| Bible-Assistant-Qwen3.5-4B-v3.2 (F16) | ~4,2B | GGUF | no disponible | Apache 2.0 | Referencia de maxima precision, 8,4 GB |
| Qwen/Qwen3.5-4B (modelo base) | ~4,2B | safetensors | no disponible | Apache 2.0 | Modelo generalista sin ajuste bíblico; referencia de bf16 para las metricas de cuantizacion |

Alternativas externas de la misma categoria: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles (`en`). No hay evidencia de calidad en castellano ni en otros idiomas.
- Dominio estrecho: esta ajustado para Q&A bíblica con recuperacion documental. Es previsible un rendimiento inferior en tareas generales de razonamiento, codigo o matematicas, aunque no se aportan mediciones al respecto.
- Alucinacion no nula: la tasa declarada es del 1,9%, de modo que en produccion sigue siendo necesario verificar las citas, especialmente en contextos doctrinales sensibles.
- Recall imperfecto: el 80,3% de recall literal implica que en torno a uno de cada cinco versiculos esperados no se recupera de forma exacta.
- Dependencia del RAG: buena parte de la calidad de citacion depende del pipeline de recuperacion (dense + BM25 + RRF + reranker). Desplegar el modelo sin recuperacion degradara la fundamentacion.
- La variante NVFP4 tiene mayor divergencia KL respecto a bf16 que Q4_K_M. El propio autor la marca como candidata actual y no como respuesta final, con una ejecucion de seguimiento (`nvfp4_mxfp6`) pendiente de resultados; su calidad puede cambiar.
- La cuantizacion NVFP4 solo aprovecha su ruta nativa en hardware Blackwell (SM120). En otras GPU se pierde esa ventaja.
- Requisito de compatibilidad: sin un llama.cpp con la arquitectura `qwen35` (commit `3173a56` o posterior), el modelo no cargara correctamente. Ollama depende de que su llama.cpp empaquetado la incluya.
- Longitud de contexto no documentada en la informacion disponible, lo que impide planificar el troceado de documentos y la gestion de la cache KV.
- Licencia Apache 2.0: permite uso comercial y modificacion, sujeto a las condiciones de la licencia. El autor enlaza la licencia del modelo base Qwen/Qwen3.5-4B, que conviene revisar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2-GGUF
- Modelo base del ajuste (safetensors): https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Archivo Q4_K_M: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2-GGUF/blob/main/bible-v3.2-4b-Q4_K_M.gguf
- Archivo NVFP4: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2-GGUF/blob/main/bible-v3.2-4b-nvfp4.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Herramienta de cuantizacion NVFP4 (rama mxfp6-cuda): https://github.com/michaelw9999/llama.cpp/tree/mxfp6-cuda
- LM Studio: https://lmstudio.ai/
- koboldcpp: https://github.com/LostRuins/koboldcpp
- Jan: https://jan.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
