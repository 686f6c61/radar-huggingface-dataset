# sudoingx/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF

## Resumen

Ternary Bonsai 2 27B PTQ1_0 MTP es una compilación GGUF publicada por el usuario sudoingx sobre la compresión ternaria que PrismML hace de Qwen 3.8 27B (modelo base `prism-ml/Ternary-Bonsai-2-27B-gguf`). El fichero principal pesa 7,0 GB y contiene 27.320.697.856 parámetros cuantizados a 1,75 bits por peso (PTQ1_0), a los que se ha injertado de nuevo la cabeza de predicción multi-token (MTP) de Qwen 3.8 27B como bloque 64, de forma que el fork de llama.cpp de PrismML puede ejecutar decodificación especulativa con `--spec-type draft-mtp`.

El interés de esta versión concreta está en el rendimiento en GPUs de gama consumer. En una RTX 3060 de 12 GB, el binario de release de PrismML pasa de 25,0 a solo 27,1 tok/s al activar MTP (+8 %), porque en los kernels de 1,75 bpw la verificación de un lote de 3 tokens costaba aproximadamente 3 veces lo que un token suelto. El PR de kernel `PrismML-Eng/llama.cpp#218` rebaja ese coste a 1,55x y sube la decodificación de un solo token de 26 a 40 tok/s, con lo que la misma configuración alcanza 50,1 tok/s.

Se distribuye bajo licencia Apache 2.0, requiere exclusivamente el fork de PrismML (no es ejecutable en llama.cpp upstream, Ollama ni vLLM) y acumula 392 descargas y 11 likes en HuggingFace. Es, por tanto, un artefacto muy especializado: útil para investigación en cuantización ternaria y decodificación especulativa, y para servir un modelo de 27B con 131.072 tokens de contexto en tarjetas de 8 y 12 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (base Qwen 3.8 27B) más cabeza de predicción multi-token (MTP) injertada como bloque 64 |
| Parámetros totales | 27.320.697.856 (27,32 B) |
| Longitud de contexto | 131.072 tokens en la configuración de ejemplo del autor; el máximo del modelo base no se especifica |
| Tipos de cuantización | PTQ1_0 ternario a 1,75 bits por peso (bpw); caché K/V a q4_0 en el ejemplo del autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, fork de PrismML) |
| Modelo base | `prism-ml/Ternary-Bonsai-2-27B-gguf` (compresión ternaria de `Qwen/Qwen3.8-27B`) |
| Fichero principal | `Ternary-Bonsai-2-27B-PTQ1_0-mtp.gguf`, 7.012.820.512 bytes (7,0 GB) |
| Variante ligera | `Ternary-Bonsai-2-27B-PTQ1_0-mtp-lean.gguf`, 6.297.658.848 bytes (715 MB menos, 196K de contexto frente a 163K en una tarjeta de 12 GB) |
| Tamaño del repositorio | 14,3 GB |
| Descargas / likes | 392 / 11 |

## Arquitectura y entrenamiento

El modelo es un transformer denso cuyos pesos provienen de una cuantización post-entrenamiento ternaria (PTQ1_0, 1,75 bpw) aplicada por PrismML sobre Qwen 3.8 27B, con un tamaño de 5,95 GB en su versión original. Sobre ese tronco, este repositorio injerta la cabeza MTP de Qwen 3.8 27B como bloque 64 y añade una copia no rotada del embedding de tokens para que `--spec-type draft-mtp` funcione sin parches sobre el binario de release `prism-b10685` o posterior. La cabeza fue entrenada por Qwen contra estados ocultos en fp16 y aquí lee un tronco ternario, lo que explica que su aceptación de borradores sea inferior a la de Qwen 3.8 original (en torno a 0,70) aunque siga muy por encima del punto de equilibrio.

La innovación técnica destacable es el kernel del PR `PrismML-Eng/llama.cpp#218`: reduce el coste de verificar 3 tokens de 2,28x a 1,55x el de un token único en una RTX 3060 12GB, y eleva la decodificación de un token de 26 a 40 tok/s. El rendimiento óptimo requiere además `GGML_CUDA_BATCH_INVARIANT=1`, que fija el orden de reducción en punto flotante y hace que la salida greedy con la cabeza activada sea idéntica byte a byte a la salida con la cabeza desactivada. La variante `lean`, sin la copia del embedding, exige el arreglo Hadamard para el grafo MTP de qwen35 (PR `#217` o `#205` o la rama `bonsai2`); el binario de release rechaza arrancar el grafo de borrador sobre ella. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ni para el modelo ternario ni para la cabeza MTP.

## Capacidades

- Generación de texto conversacional en modo base, con plantilla de chat aplicada mediante `--jinja`.
- Control del esfuerzo de razonamiento mediante el parámetro `--reasoning-effort` (el autor usa `medium` en sus scripts).
- Generación de código: la aceptación de borradores MTP es de 0,85 a 0,95 en Python y el rendimiento medido en esa tarea alcanza 53,2 tok/s en RTX 3060 12GB.
- Decodificación especulativa MTP integrada, con la cabeza actuando como modelo de borrador sobre el propio tronco.
- Manejo de contexto largo, hasta 131.072 tokens en la configuración de ejemplo, con caché K/V cuantizada a q4_0.
- Procesamiento de documentos extensos: la aceptación de borradores se mantiene entre 0,65 y 0,73 con 18K a 120K tokens de contexto.
- Entrada de imagen cuando se carga la torre de visión del modelo base: el autor reporta una aceptación de 0,88 en un prompt de imagen.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.

## Casos de uso

- Asistente conversacional local en GPU de 12 GB: el fichero de 7,0 GB permite servir un modelo de 27B con 131.072 tokens de contexto en una RTX 3060 12GB mediante `llama-server -ngl 99 -fa on -ctk q4_0 -ctv q4_0 --jinja`, algo inviable con los pesos en fp16.
- Generación de código en estación de trabajo de gama media: con 53,2 tok/s y una aceptación de borradores de 0,85–0,95 en Python, es adecuado para autocompletado y refactorización interactiva en un solo slot, sin depender de APIs externas.
- Análisis de documentación extensa: la aceptación de 0,65–0,73 entre 18K y 120K tokens de contexto, junto con los 131.072 tokens de ventana, permite resumir o interrogar contratos, informes o bases de código largas manteniendo la generación por encima del punto de equilibrio especulativo.
- Automatización de tareas de shell y operaciones: la aceptación de 0,73–0,81 en bash y los 50,1 tok/s medidos en esa tarea lo hacen utilizable para generar y explicar scripts de despliegue o de mantenimiento en local.
- Despliegue en equipos con GPU de 8 GB: la compilación ternaria original de 5,95 GB y la variante `lean` de 6,3 GB caben en tarjetas de 8 GB, lo que permite ofrecer un asistente de 27B en portátiles con RTX de esa gama.
- Procesamiento por lotes offline de prosa: aunque la aceptación en texto libre baja a 0,45–0,68, sigue por encima del umbral de rentabilidad, de modo que sigue siendo viable para generación de borradores y resúmenes sin requisitos de latencia estricta.
- Investigación en cuantización ternaria y decodificación especulativa: el repositorio de benchmarks (`sudoingX/bonsai2-small-gpu`) y los barridos en `sweeps/` permiten reproducir las mediciones de tok/s, aceptación y profundidad de contexto en distintas GPUs.
- Pruebas de conformidad numérica: la comparación de salidas greedy con `GGML_CUDA_BATCH_INVARIANT=1` (idénticas byte a byte con la cabeza activada y desactivada) sirve como caso de estudio de estabilidad numérica en verificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son mediciones de velocidad y aceptación de borradores sobre una RTX 3060 12GB, un slot, thinking desactivado, 131.072 tokens de contexto y caché K/V q4_0, con medianas de 3 prompts por 3 ejecuciones.

| Build | Flags | tok/s |
|---|---|---|
| Release PrismML `prism-b10685` | sin draft | 25,0 |
| Release PrismML `prism-b10685` | draft-mtp, n-max 1 | 27,1 (+8 %) |
| Rama kernel #218 | sin draft | 39,8 |
| Rama kernel #218 con `GGML_CUDA_BATCH_INVARIANT=1` | draft-mtp, n-max 1 | 50,1 (código 53,2; bash 50,1; prosa 41,8) |
| Rama kernel #218 con `GGML_CUDA_BATCH_INVARIANT=1` | draft-mtp, n-max 2 | 45,4 |

| Tokens en contexto | head off | n-max 1 | n-max 2 |
|---|---:|---:|---:|
| 18K | 29,6 | 33,9 | por debajo de head off |
| 39K | 22,9 | 27,5 | por debajo de head off |
| 41,8K | 22,23 (binario release, head off: 16,85) | 26,86 | 21,08 |
| 77K | 16,1 | 18,3 | por debajo de head off |
| 115K | 12,4 | 13,9 | por debajo de head off |

| Medición `llama-bench` (fichero PTQ1_0 original, `-fa 1 -ctk q4_0 -ctv q4_0 -r 3`) | Antes | Después |
|---|---:|---:|
| tg128 | 26,32 tok/s | 40,54 tok/s |
| pp512 | 269,6 tok/s | 268,7 tok/s (prefill sin cambios) |

| Contenido | Aceptación de borradores |
|---|---|
| Python | 0,85–0,95 |
| Bash | 0,73–0,81 |
| Prosa | 0,45–0,68 |
| Documento largo (18K–120K tokens) | 0,65–0,73 |
| Prompt de imagen con torre de visión cargada | 0,88 |
| Qwen 3.8 original (referencia en fp16) | ~0,70 |

## Requisitos de hardware

- VRAM estimada: 7,0 GB para el fichero principal y 6,3 GB para la variante `lean`; la compilación ternaria original de PrismML ocupa 5,95 GB. Con caché K/V q4_0, una tarjeta de 12 GB admite 163K de contexto con el fichero principal y 196K con el `lean`.
- GPU validadas por el autor: RTX 3060 12GB como referencia principal; se mencionan filas de propietarios de GPUs desde 8 GB hasta 5070 Ti en los barridos del repositorio.
- Binarios precompilados: `bonsai2-small-gpu-linux-x64-cuda12.4-sm86-sm89-dcc3be7.tar.gz` (515.438.079 bytes) para Ampere y Ada; en Blackwell hay que compilar desde fuente.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB y 12 GB; el autor lo presenta explícitamente como el fichero que encaja en tarjetas de 8 GB y 12 GB.
- Requisitos del sistema para el tarball: driver NVIDIA 525 o superior, glibc 2.35 o superior, AVX2 y CUDA 12.4 incluido en el paquete.
- Opciones de despliegue: `llama-server`, `llama-cli` y `llama-bench` del fork de PrismML. No es compatible con llama.cpp upstream, Ollama, TGI ni vLLM.
- Throughput medido: 25,0 tok/s con el binario de release y MTP desactivado; 50,1 tok/s en código y prosa mixtos con el kernel #218 y decodificación especulativa; 12,4–29,6 tok/s con la cabeza desactivada según la profundidad de contexto (115K a 18K).
- Latencia de prefill: pp512 se mantiene en torno a 268,7–269,6 tok/s, es decir, el kernel no altera el coste de prefill.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño | Cabeza MTP | Rendimiento reportado |
|---|---|---|---:|---|
| `sudoingx/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF` (este) | PTQ1_0, 1,75 bpw | 7,01 GB | Sí, bloque 64 | 50,1 tok/s en RTX 3060 12GB con kernel #218 y n-max 1 |
| `ProCreations/Ternary-Bonsai-2-27B-MTP` | PQ2_0 | 7,21 GB | Sí | no disponible |
| `decent-jawfish/bonsai-2-27b-mtp` | PQ2_0 | 7,21 GB | Sí | no disponible |
| `BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF` | PQ2_0; probó también PTQ1_0 | 7,21 GB | Sí | +1,6 % con PTQ1_0 en su medición |
| `prism-ml/Ternary-Bonsai-2-27B-gguf` | PTQ1_0, 1,75 bpw | 5,95 GB | No | 26,32 tok/s en tg128 (medición del autor) |

Los tres injertos MTP previos existen únicamente sobre el fichero PQ2_0, de mayor tamaño (7,21 GB) y presumiblemente mayor precisión al ser 2,0 bpw, aunque no se publican métricas de calidad comparativas. La comparación con Qwen 3.8 27B en fp16 solo está documentada en términos de aceptación de borradores (~0,70), sin datos de tamaño ni de rendimiento.

## Limitaciones y advertencias

- Dependencia de un fork: el modelo solo funciona con el fork de llama.cpp de PrismML (`prism-b10685` o posterior). No arranca en llama.cpp upstream, Ollama, TGI ni vLLM.
- La variante `lean` requiere el arreglo Hadamard del grafo MTP de qwen35 (PR `#217` o `#205`); el binario de release se niega a arrancar el grafo de borrador sobre ella.
- Sin `GGML_CUDA_BATCH_INVARIANT=1`, la verificación por lotes altera el orden de reducción en punto flotante y el texto generado puede diferir en empates cercanos. La decodificación greedy solo es idéntica byte a byte con ese parámetro activo.
- La aceptación de borradores es inferior a la de Qwen 3.8 en fp16 (en torno a 0,70) porque la cabeza MTP fue entrenada contra estados ocultos en fp16 y aquí lee un tronco ternario.
- `n-max 2` rinde peor que `n-max 1` y que la cabeza desactivada en todas las profundidades de contexto medidas, por lo que duplicar el borrador no compensa.
- Degradación marcada con contexto largo: de 29,6 tok/s con 18K tokens rellenos a 12,4 tok/s con 115K con la cabeza desactivada, y de 33,9 a 13,9 tok/s con `n-max 1`.
- No se publican métricas de calidad (MMLU, HumanEval, GSM8K ni similares): la pérdida de precisión respecto al modelo base en fp16 no está cuantificada, lo que es un riesgo directo en producción. La cuantización ternaria a 1,75 bpw implica un compromiso agresivo de precisión.
- Idiomas soportados no disponibles; no se puede garantizar calidad multilingüe ni evaluar sesgos por idioma.
- Sesgos conocidos: no documentados en la información disponible; el modelo hereda los del modelo base Qwen 3.8 27B, tampoco documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible, agravado por la falta de benchmarks de fidelidad.
- Licencia: el artefacto se publica como Apache 2.0, lo que permite uso comercial, pero no se aclaran en esta información las condiciones de la compresión ternaria de PrismML ni las del modelo base Qwen 3.8 27B, que conviene verificar antes de un despliegue comercial.
- Validación comunitaria escasa: 392 descargas y 11 likes, con fecha de creación y última actualización en septiembre de 2026.
- Las plantillas de tool calling, el soporte de agentes y la lista de idiomas no están documentados, de modo que cualquier integración que dependa de ellos exige validación propia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sudoingx/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp del autor (rama `bonsai2`): https://github.com/sudoingX/llama.cpp
- PR del kernel que elimina el cuello de botella de verificación: https://github.com/PrismML-Eng/llama.cpp/pull/218
- PR del arreglo Hadamard para el MTP de qwen35: https://github.com/PrismML-Eng/llama.cpp/pull/217 y https://github.com/PrismML-Eng/llama.cpp/pull/205
- Repositorio de mediciones y scripts de benchmark: https://github.com/sudoingX/bonsai2-small-gpu
- Injerto MTP alternativo: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Injerto MTP alternativo: https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Injerto MTP alternativo: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los enlaces devueltos por el buscador corresponden a foros sobre Amazon Alexa, Spotify y Zhihu, sin relación con el artefacto.
