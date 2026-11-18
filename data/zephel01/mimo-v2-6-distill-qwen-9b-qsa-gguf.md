# zephel01/MiMo-V2.6-Distill-Qwen-9B-QSA-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-QSA-GGUF es una cuantización GGUF experimental publicada por el usuario zephel01 que aplica un injerto de atención dispersa (QSA, *Query Sparse Attention*) sobre el modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B. El modelo base es un SFT de Qwen3.5-9B desarrollado por XiaomiMiMo, con 8.972.156.032 parámetros totales y la misma arquitectura, formas y tokenizador que Qwen3.5-9B. El injerto consiste en trasladar el indexador QSA entrenado sobre Qwen3.5-9B (21 millones de parámetros, 7 capas) al modelo MiMo sin reentrenamiento, aprovechando que ambos comparten arquitectura.

El resultado es un modelo de 9B orientado a contexto largo que, en prompts extensos, hace que cada capa QSA lea únicamente los fragmentos de contexto seleccionados por el indexador, reduciendo el trabajo de atención y las lecturas de KV. Está pensado para ejecutarse en una única GPU NVIDIA con 11 GB o más de VRAM (medido en una RTX 5090) y solo funciona con el motor Abyss, ya que llama.cpp rechaza estos ficheros por el número inesperado de tensores.

La relevancia actual radica en que permite contexto de 128K tokens en hardware de consumo con un coste de calidad medido y documentado (variaciones de NLL y divergencia KL frente a atención densa). Es una publicación en estado BETA, con cero descargas y sin resultados de benchmarks estándar, orientada a usuarios que quieran probar atención dispersa en local y reportar resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet + 8 capas de atención completa (capas 3, 7, ..., 31); QSA activo en 7 de las 8 capas de atención completa |
| Parametros totales | 8.972.156.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M + indexador FP32 (5,91 GB); Q8_0 + indexador FP32 (9,62 GB) |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base MiMo-V2.6-Distill-Qwen-9B es un ajuste supervisado (SFT) de Qwen3.5-9B, por lo que hereda su arquitectura híbrida de 32 capas: 24 capas Gated DeltaNet y 8 capas de atención completa en las posiciones 3, 7, ..., 31. Sobre esta base, la versión QSA incorpora un indexador de 21 millones de parámetros y 7 capas que se ejecuta en 7 de las 8 capas de atención completa; la capa 3 permanece densa (`attention.compress_ratios` es 0 en ella). Una vez que la caché supera los 4.099 tokens, cada token atiende únicamente a los 1.024 mejores bloques de 4 tokens seleccionados por el indexador más su propio bloque (`top_k` 4096). QSA reduce el trabajo de atención y las lecturas de KV, pero no el almacenamiento de KV, que permanece íntegro en memoria.

No hay reentrenamiento ni ajuste fino en esta publicación: es un injerto (*graft*). Los pesos, claves y plantilla de chat de MiMo se copian byte a byte de los GGUF de bartowski (Q4_K_M / Q8_0), y se añaden los 35 tensores del indexador (7 capas x 5) y las claves QSA del fichero Qwen3.5-9B-QSA de la misma cuantización. El indexador no fue entrenado sobre MiMo; el autor mide empíricamente cuánto aguanta el injerto en lugar de asumirlo. Los ficheros no incluyen bloque NextN (MTP), igual que los GGUF propios de MiMo; el bloque de borrador de Qwen3.5-9B, que sirve para MiMo, se distribuye aparte en el repositorio MiMo-V2.6-Distill-Qwen-9B-MTP-GGUF (0,16 GB) y Abyss lo toma del directorio `MTP/` junto al GGUF del modelo.

## Capacidades

- Generación de texto conversacional con modo de razonamiento: el modelo escribe `<think>` por sí mismo y el pensamiento se devuelve en el campo `reasoning_content`; `enable_thinking: false` desactiva el modo.
- Soporte de tool calling / function calling: las llamadas se devuelven en el campo `tool_calls` a través del servidor compatible con la API de OpenAI de Abyss.
- Razonamiento multi-paso y flujos de agente: los tags incluyen `conversational` y el modelo se ha evaluado en muestras de tipo `agent` a 128K de contexto.
- Contexto largo: ventana de hasta 131.072 tokens con atención dispersa QSA a partir de 4.099 tokens de caché.
- Capacidades multilingües limitadas a inglés y japonés según los metadatos del repositorio.
- Compatibilidad con endpoints estilo OpenAI (`/v1/chat/completions`) mediante el motor Abyss.
- Decodificación especulativa opcional mediante el bloque MTP distribuido por separado.

## Casos de uso

- Procesamiento de documentación extensa en local: con 128K tokens de contexto y un pico medido de 15,4 GB en RTX 5090, se puede cargar un repositorio de código o un informe completo y hacer preguntas sobre él sin truncar.
- Análisis de código a gran escala: la muestra `code 0` y `code 4` de la evaluación a 128K presentan variaciones de NLL de +1,3% y +0,5% en Q4_K_M frente a atención densa, lo que respalda su uso para revisión y explicación de ficheros largos.
- Asistentes conversacionales con tool calling: el servidor de Abyss expone `tool_calls` y `reasoning_content`, lo que permite integrarlo en pipelines de agente que necesiten invocar funciones externas.
- Agentes multi-paso con memoria larga: aunque las muestras `agent` son las que más degradan (KL de 0,190 y 0,934 en Q4_K_M), el modelo sigue siendo utilizable para cadenas de razonamiento con contexto acumulado si se acepta esa pérdida.
- Procesamiento de texto en japonés: las muestras `ja 1` y `ja 5` muestran variaciones de NLL negativas (−1,0% y −3,6% en Q4_K_M), lo que indica que el injerto no penaliza este idioma en la medición realizada.
- Despliegue en estación de trabajo con una sola GPU: con un tope de VRAM de 12 GB (`STRATA_GLM_VRAM_GB=12`) se ejecuta 128K a la misma velocidad en 11,2 GB, lo que encaja en tarjetas de 11-12 GB.
- Evaluación de técnicas de atención dispersa: al poder desactivarse QSA con `STRATA_Q35_QSA=0` sobre el mismo fichero, sirve como banco de pruebas para comparar atención densa y dispersa en condiciones idénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona una evaluación de calidad QSA frente a atención densa sobre 8 muestras retenidas de aproximadamente 128K tokens, puntuando los últimos 1.024 tokens con *teacher forcing* en Abyss:

| Muestra | Cambio NLL Q4_K_M | KL Q4_K_M | Cambio NLL Q8_0 | KL Q8_0 |
|---|---:|---:|---:|---:|
| code 0 | +1,3% | 0,007 | +0,7% | 0,006 |
| ja 1 | −1,0% | 0,066 | −0,6% | 0,063 |
| en 2 | +4,8% | 0,178 | +0,9% | 0,128 |
| agent 3 | +2,1% | 0,190 | +2,5% | 0,204 |
| code 4 | +0,5% | 0,023 | +0,5% | 0,024 |
| ja 5 | −3,6% | 0,397 | +1,8% | 0,344 |
| en 6 | −0,6% | 0,075 | −0,1% | 0,063 |
| agent 7 | −4,6% | 0,934 | +0,3% | 0,873 |

KL medio sin las muestras de agente: 0,124 (Q4_K_M) y 0,105 (Q8_0); con ellas, 0,234 y 0,213. El autor indica que el injerto queda al nivel de su Ornith-1.5-9B QSA reentrenado. En cuanto a rendimiento de ejecución, en RTX 5090 un contexto de 128K alcanza un pico de 15,4 GB sin tope; con tope de 12 GB corre a la misma velocidad en 11,2 GB; con tope de 11 GB mantiene 32K a plena velocidad y 128K funciona pero más lento al quedar parte de la FFN en RAM. Q8_0 necesita unos 3,7 GB más.

## Requisitos de hardware

- VRAM estimada: 11,2 GB para 128K con Q4_K_M y tope de 12 GB; 15,4 GB de pico sin tope en RTX 5090; Q8_0 añade aproximadamente 3,7 GB.
- GPU objetivo: una única GPU NVIDIA con 11 GB o más. Medido en RTX 5090. Solo CUDA; en AMD el motor ejecuta atención densa.
- Cabe en GPU de consumo: sí, en tarjetas con 11-12 GB o más (por ejemplo, RTX 5090 según la medición del autor); con 11 GB, 32K a plena velocidad y 128K más lento.
- Opciones de despliegue: exclusivamente el motor Abyss (v1.3.170 o superior para el setup de un comando; el motor lee estos ficheros desde v1.3.162 y el servidor interpreta el `<think>` de MiMo desde v1.3.168). llama.cpp rechaza estos ficheros con el error `wrong number of tensors; expected 462, got 427` (llama.cpp ac8e1694d); para llama.cpp hay que usar los GGUF de bartowski.
- Instalación: `./setup-deepseek.sh --model mimo-9b-qsa --download-model` (Linux) o `setup-deepseek.bat` (Windows 11), con verificación SHA-256 y configuración automática; servidor en `http://127.0.0.1:8082/`.
- Latencia y throughput: no disponibles como cifras absolutas; el autor solo reporta comparativas relativas (misma velocidad con tope de 12 GB que sin tope; 128K más lento con tope de 11 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-QSA (este) | 8.972.156.032 | 128K | MIT | GGUF (Q4_K_M, Q8_0) | Atención dispersa QSA; solo Abyss |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 8.972.156.032 | no disponible | no disponible | safetensors / GGUF (bartowski) | Sin QSA; compatible con llama.cpp vía bartowski |
| Qwen3.5-9B QSA (zephel01) | 9B (aprox.) | no disponible | no disponible | GGUF | Indexador QSA original; mismo esquema de atención dispersa |
| Ornith-1.5-9B QSA (zephel01) | 9B (aprox.) | no disponible | no disponible | GGUF | QSA reentrenado; referencia de calidad del autor |

## Limitaciones y advertencias

- Estado BETA: medido en un solo PC; el autor solicita reportes de otras GPU.
- Solo funciona con el motor Abyss; llama.cpp rechaza los ficheros por el número de tensores. No hay soporte para vLLM, TGI, Ollama ni otros runners.
- Solo CUDA; en AMD el motor ejecuta atención densa, con lo que se pierde la ventaja de QSA.
- El indexador no fue entrenado sobre MiMo; es un injerto. La calidad depende de cuánto generalice, con degradación notable en las muestras de agente (KL de hasta 0,934 en Q4_K_M y 0,873 en Q8_0) y en `en 2` (+4,8% de NLL en Q4_K_M).
- Idiomas limitados a inglés y japonés; no se declara soporte de castellano.
- QSA reduce trabajo de atención y lecturas de KV, pero no el almacenamiento de KV, que permanece íntegro en memoria; el ahorro de VRAM proviene del tope configurable, no de comprimir la caché.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia MIT declarada en el repositorio, lo que en principio permite uso comercial, pero el modelo base y los pesos de terceros (bartowski) pueden tener condiciones propias no detalladas aquí.
- Repositorio con cero descargas y cero likes en el momento de la consulta; sin validación externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/MiMo-V2.6-Distill-Qwen-9B-QSA-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Motor Abyss: https://github.com/zephel01/Abyss
- GGUF de bartowski del modelo base: https://huggingface.co/bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Indexador Qwen3.5-9B QSA: https://huggingface.co/zephel01/Qwen3.5-9B-QSA-GGUF
- Bloque de borrador MTP: https://huggingface.co/zephel01/MiMo-V2.6-Distill-Qwen-9B-MTP-GGUF
- Reportar resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+MiMo-V2.6-Distill-Qwen-9B+QSA
