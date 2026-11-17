# zephel01/Qwen3.5-9B-QSA-GGUF

## Resumen

Qwen3.5-9B-QSA-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.5-9B (9.215.446.656 parámetros) publicada por el usuario zephel01, que añade un indexador de atención dispersa (QSA, *Query Sparse Attention*) sobre las capas de atención completa del modelo base. El objetivo es mantener velocidades de decodificación altas en contextos muy largos (hasta 128K tokens) sobre una única GPU de consumo, algo que la atención densa estándar penaliza severamente. Los pesos del modelo son los de Qwen sin modificar; solo se incorpora un indexador nuevo de 21M de parámetros, entrenado por el autor en unas 4 horas sobre una RTX 5090.

La relevancia de esta ficha es doble: por un lado, demuestra que es viable añadir atención dispersa post-hoc a un transformer híbrido ya entrenado con un coste de entrenamiento mínimo; por otro lado, expone las limitaciones prácticas de la propuesta, ya que el modelo solo funciona con el motor propietario Abyss (no carga en llama.cpp) y presenta degradaciones medibles de calidad en contextos de 128K en algunas categorías. Se distribuye como BETA, con resultados medidos en un único equipo.

El modelo base Qwen3.5-9B combina 32 capas: 24 capas Gated DeltaNet y 8 capas de atención completa (capas 3, 7, ..., 31). Sobre 7 de esas 8 capas de atención completa se aplica el mecanismo QSA, que reduce el trabajo de atención y las lecturas de KV sin reducir el almacenamiento de KV en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 capas Gated DeltaNet + 8 capas de atención completa) con indexador QSA añadido a 7 de las 8 capas de atención completa |
| Parametros totales | 9.215.446.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M (indexador en FP32) y Q8_0 (indexador en FP32) |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Parametros del indexador QSA | 21M |
| Top-k del indexador | 4.096 (1.024 bloques de 4 tokens + bloque propio) |
| Umbral de activación QSA | caché superior a 4.099 tokens |
| Capa densa | capa 3 (mantiene atención densa) |
| Tamaño de archivo Q4_K_M | 5,85 GB |
| Tamaño de archivo Q8_0 | 9,86 GB |
| Tamaño del repositorio | 15,7 GB |
| Motor de inferencia | Abyss v1.3.162 o superior (solo CUDA) |
| Bloque NextN (MTP) | conservado |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B tiene 32 capas: 24 capas Gated DeltaNet y 8 capas de atención completa (capas 3, 7, 11, 15, 19, 23, 27 y 31). La modificación QSA actúa sobre 7 de esas 8 capas de atención completa. Una vez que la caché KV supera los 4.099 tokens, cada token atiende únicamente a los 1.024 mejores bloques de 4 tokens seleccionados por el indexador, más su propio bloque (top_k 4.096). La capa 3 se mantiene densa porque su indexador capturaba la menor cantidad de atención y mantenerla densa redujo a la mitad la KL a 128K en las pruebas del autor. El archivo declara esta configuración en sus metadatos (`attention.compress_ratios` 0 en la capa 3, `attention.indexer.top_k` 4.096). Es importante subrayar que QSA reduce el trabajo de atención y las lecturas de KV, pero no el almacenamiento de KV, que permanece íntegro en memoria.

El único componente entrenado es el indexador de 21M de parámetros, entrenado por el autor en aproximadamente 4 horas sobre una RTX 5090 (coste eléctrico estimado de unos 50 yenes). No se proporciona información sobre el dataset de entrenamiento del indexador, el número de tokens utilizados ni si hubo fases de RLHF o DPO. Los pesos de Qwen no se han modificado. El bloque NextN (MTP) del modelo base se conserva, de modo que Abyss puede utilizarlo para decodificación especulativa. El modelo incluye un conmutador (`STRATA_Q35_QSA=0`) que permite ejecutar el mismo archivo con atención densa en todas las capas, útil para comparaciones y para depuración.

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Razonamiento multi-paso con modo *thinking* (se menciona "thinking on" en la prueba needle).
- Contexto largo: soporta hasta 131.072 tokens con decodificación rápida gracias a QSA.
- Recuperación de información en contexto largo: la prueba needle a 125K con 3 secretos y el valor de una función obtuvo 4/4.
- Procesamiento de transcripciones de agentes (tool results dentro de un chat), según las muestras de evaluación del autor.
- Generación y comprensión de código (categoría "code" evaluada a 128K).
- Compatibilidad con endpoints tipo OpenAI (`/v1/chat/completions`) a través del servidor de Abyss.
- No se documenta soporte explícito de tool calling o function calling nativo más allá de su uso en transcripciones de agentes.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Análisis de repositorios de código extensos: con 128K tokens de contexto y decodificación rápida, el modelo puede recibir varios archivos y responder preguntas sobre dependencias o fallos sin truncar el código; la degradación medida en la categoría code a 128K es de solo +0,9% de NLL frente a atención densa.
- Asistentes conversacionales de largo recorrido en japonés: adecuado para conversaciones multi-turno con historial extenso, aunque conviene vigilar la categoría japonesa, donde la NLL empeora un +2,2% de media a 128K.
- Procesamiento de transcripciones de agentes y registros de herramientas: el modelo está evaluado específicamente con muestras de tipo "agent" (tool results dentro de un chat), por lo que encaja en pipelines que concatenan resultados de herramientas y requieren contexto amplio; hay que asumir mayor ruido en esta categoría (+1,5% de media, con una muestra a +2,8%).
- Recuperación de información en documentos muy largos: la prueba needle a 125K con 4/4 aciertos respalda su uso para *needle-in-a-haystack* sobre contratos, informes o manuales, siempre que el motor sea Abyss.
- Inferencia local en una sola GPU de consumo: con 14,9 GB de VRAM a 128K en una RTX 5090 (o 10,7 GB con la VRAM limitada a 11 GB y 7 GB de RAM de sistema), es viable desplegarlo en estaciones de trabajo con una GPU de 12 GB o más.
- Comparación de estrategias de atención en investigación: el conmutador `STRATA_Q35_QSA=0` permite ejecutar el mismo archivo con atención densa y con QSA, lo que facilita experimentos controlados de calidad y latencia sin cambiar de pesos.
- Desarrollo de motores de inferencia alternativos: dado que llama.cpp no carga estos archivos, el modelo sirve como banco de pruebas para implementaciones que quieran soportar indexadores de atención dispersa.

## Benchmarks y rendimiento

Calidad a 128K, Q4_K_M en Abyss, con *teacher forcing* sobre los últimos 1.024 tokens de 8 muestras reservadas de unos 128K tokens. Denso es el mismo archivo con `STRATA_Q35_QSA=0`. NLL menor es mejor; 0% equivale a denso.

| Muestra | NLL denso | NLL QSA | Cambio | KL | KL máx. | Mismo token top |
|---|---:|---:|---:|---:|---:|---:|
| code 0 | 1,0667 | 1,0732 | +0,6% | 0,008 | 0,34 | 96,5% |
| ja 1 | 0,8929 | 0,9005 | +0,9% | 0,022 | 1,03 | 94,1% |
| en 2 | 1,1325 | 1,1316 | −0,1% | 0,031 | 4,75 | 95,8% |
| agent 3 | 1,5043 | 1,5140 | +0,6% | 0,018 | 0,35 | 94,9% |
| code 4 | 2,1423 | 2,1636 | +1,0% | 0,029 | 0,56 | 92,8% |
| ja 5 | 1,3536 | 1,3954 | +3,1% | 0,049 | 8,38 | 93,3% |
| en 6 | 2,0811 | 2,1061 | +1,2% | 0,050 | 0,99 | 90,8% |
| agent 7 | 0,9275 | 0,9531 | +2,8% | 0,132 | 17,08 | 93,7% |

Resumen por categoría (suma de 2 muestras): code +0,9%, japonés +2,2%, inglés +0,7%, transcripciones de agentes +1,5%. KL media 0,032 sin las muestras de agentes y 0,042 con ellas. KL 0,015 a 32K y 0,016 a 64K en una ejecución anterior con una muestra por categoría. En Q8_0, las mismas 8 muestras a 128K quedan todas dentro del 2% de denso: code +1,2 / +0,9%, japonés +1,2 / +1,6%, inglés −0,8 / +0,5%, agentes +1,2 / −0,7%.

Rendimiento declarado por el autor: 240 tok/s de decodificación a 128K de contexto en una única RTX 5090, con 14,9 GB de VRAM (10,7 GB con la VRAM limitada a 11 GB) y 7 GB de RAM de sistema. Prueba needle a 125K (3 secretos y el valor de una función, a través del servidor, con thinking activado): 4/4; denso: 4/4 con los mismos pesos en una ejecución anterior.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,9 GB para Q4_K_M a 128K de contexto; 10,7 GB si se limita la VRAM a 11 GB (el autor reporta que funciona en ese escenario). Q8_0 ocupa 9,86 GB de archivo, pero no se detalla su consumo de VRAM a 128K.
- RAM de sistema: 7 GB en la configuración medida.
- GPU objetivo: una sola GPU NVIDIA con 12 GB o más. El autor menciona explícitamente la RTX 5090 como plataforma de medida.
- Cabe en GPU de consumo: sí, según el autor, en GPUs con 12 GB o más de VRAM; la RTX 5090 es el caso medido.
- Motor de despliegue: exclusivamente Abyss v1.3.162 o superior (soporte de QSA denso por capa); versiones anteriores ejecutan el archivo con atención densa. Solo CUDA; en AMD se ejecuta en modo denso.
- llama.cpp: no carga los archivos (`wrong number of tensors; expected 477, got 442`), porque su cargador de qwen35 no reconoce los tensores del indexador. Para llama.cpp debe usarse un GGUF normal de Qwen3.5-9B.
- Servidor: Abyss expone un endpoint compatible con `/v1/chat/completions` en el puerto configurado (ejemplo del autor: 8082).
- Latencia y throughput: 240 tok/s de decodificación a 128K de contexto en RTX 5090 según el autor. No se proporcionan datos de prefill ni de otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Formato / motor | Notas |
|---|---|---:|---|---|---|---|
| Qwen3.5-9B-QSA-GGUF (este) | 9,2B (+21M indexador) | 128K | Híbrida con QSA en 7 capas | Apache 2.0 | GGUF, solo Abyss | 240 tok/s a 128K en RTX 5090; BETA |
| Qwen/Qwen3.5-9B (base) | 9,2B | no disponible en la información | Híbrida densa | Apache 2.0 | Safetensors y GGUF estándar | Sin indexador; referencia de calidad densa en las tablas |
| Qwen3.8-27B-QSA-GGUF (higa2515) | 27B (según nombre) | no disponible | QSA | no disponible | GGUF | Inspiración declarada del proyecto; datos no verificados aquí |
| GGUF normal de Qwen3.5-9B para llama.cpp | 9,2B | no disponible | Híbrida densa | Apache 2.0 | GGUF, llama.cpp | Alternativa recomendada por el autor si se necesita llama.cpp |

No se dispone de datos de benchmarks estándar para establecer comparaciones de rendimiento con modelos de la misma categoría; la comparación disponible se limita a la calidad frente a atención densa con los mismos pesos.

## Limitaciones y advertencias

- Estado BETA: todos los resultados proceden de un único PC y de un único autor; no hay validación independiente.
- Solo funciona con el motor Abyss (v1.3.162 o superior) y solo en CUDA; en AMD se ejecuta en modo denso y en llama.cpp no carga.
- Degradación de calidad a 128K: dos muestras empeoran más del 2% frente a denso (japonés 5, +3,1%; agente 7, +2,8%); la categoría japonesa empeora +2,2% de media y la de agentes +1,5%.
- Las muestras de agentes son ruidosas incluso en modo denso: el propio denso varió mucho con solo redondear en ese tipo de muestras, lo que limita la fiabilidad de esas cifras.
- QSA reduce el trabajo de atención y las lecturas de KV, pero no el almacenamiento de KV: el consumo de memoria no baja por usar QSA.
- Idiomas: solo inglés y japonés declarados; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: no evaluado en la información disponible; la prueba needle no mide veracidad.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-9B y el motor Abyss pueden tener sus propias condiciones que conviene revisar.
- El indexador se entrenó en unas 4 horas sobre una RTX 5090; no se documenta el dataset ni el procedimiento de entrenamiento, lo que dificulta auditar su comportamiento fuera de las muestras evaluadas.
- La integración requiere un paso de empaquetado (`tools/iq_pack.py`) antes de servir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/Qwen3.5-9B-QSA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Abyss: https://github.com/zephel01/Abyss
- Manual de Abyss: https://github.com/zephel01/Abyss/blob/main/docs/MANUAL.md
- Idea QSA original (higa2515/Qwen3.8-27B-QSA-GGUF): https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Envío de resultados de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.5-9B+QSA
- Imagen teaser: https://huggingface.co/zephel01/Qwen3.5-9B-QSA-GGUF/resolve/main/assets/teaser.png
- Mapa de capas: https://huggingface.co/zephel01/Qwen3.5-9B-QSA-GGUF/resolve/main/assets/layers.png
