# TelperionAI/Qwen3.8-27B-GLA-g2-FP8

## Resumen

TelperionAI/Qwen3.8-27B-GLA-g2-FP8 es una compilación en FP8 del retrofit Qwen3.8-27B-GLA-g2, publicado por TelperionAI el 5 de octubre de 2026 bajo licencia Apache 2.0. Se trata de una cuantización de solo pesos y activaciones de un modelo de 26.944.036.352 parámetros (unos 26,9 B) que aplica Grouped Latent Attention con 2 grupos (GLA-g2) sobre Qwen3.8-27B, una modificación de la atención que se realiza sin reentrenamiento. El resultado ocupa 29,7 GB en disco frente a los 53,9 GB del retrofit en bf16 y a los 55,6 GB del modelo base, y mantiene la caché KV reducida a la mitad: 16 KiB por token y por GPU en bf16 con tensor parallelism de 2, frente a los 32 KiB del Qwen3.8-27B original.

El interés práctico del checkpoint está en la combinación de tres factores: menor huella de memoria para servir el modelo, caché KV comprimida —lo que reduce el coste por token en contextos largos— y una calidad que, en la única evaluación publicada, no se degrada de forma significativa respecto al base en bf16. En SWE-bench Verified, con 500 instancias, el modelo resuelve 0,403 de media en 3 ejecuciones, frente a 0,395 del Qwen3.8-27B en bf16 y 0,399 de la build FP8 oficial de Qwen. Además genera un 0,82× de tokens de salida respecto al base, lo que abarata la inferencia en tareas de agente.

La contrapartida es operativa: la arquitectura de atención es personalizada y el modelo no carga en `transformers` ni en vLLM estándar. Requiere el plugin experimental `qwen-mla-vllm` sobre vLLM 0.27.1 y una GPU donde vLLM ejecute kernels block-FP8 (Hopper o Blackwell, con verificación únicamente en Blackwell). El modelo es solo texto: el retrofit elimina la torre de visión y la cabeza MTP presentes en los checkpoints de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal y 16 capas de atención completa, retrofitted con Grouped Latent Attention de 2 grupos (GLA-g2); tipo de modelo `qwen3_5_text`, solo texto |
| Parámetros totales | 26.944.036.352 (~26,9 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (etiquetado como `long-context`, pero la model card no especifica la cifra) |
| Tipos de cuantización | FP8 e4m3 con escalas de bloque 128×128 (`compressed-tensors`); activaciones cuantizadas a FP8 de forma dinámica por token en grupos de 128; proyecciones latentes, `in_proj_a`/`in_proj_b` de atención lineal, normas, embeddings y `lm_head` se mantienen en bf16; existe versión bf16 del retrofit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`compressed-tensors`, FP8) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura híbrida de Qwen3.8-27B: capas de atención lineal combinadas con 16 capas de atención completa, a las que el retrofit GLA-g2 sustituye el mecanismo de atención por Grouped Latent Attention con 2 grupos. Esta modificación es *training-free*: no hay un entrenamiento nuevo del modelo, sino una reconstrucción de las proyecciones de atención latentes que reduce el tamaño de la caché KV a la mitad (16 KiB por token y por GPU en bf16 con TP=2 frente a 32 KiB). El checkpoint FP8 no altera el método, los datos de calibración ni los resultados del retrofit: solo cambia el formato de almacenamiento de los pesos.

La construcción del FP8 parte de TelperionAI/Qwen3.8-27B-FP8-block-AWQ, una build FP8 por bloques del modelo base con suavizado AWQ de los MLP. Los MLP, las capas de atención lineal, `o_proj`, los embeddings y las normas se toman sin cambios de esa build; el suavizado AWQ afecta solo a los mapeos de MLP y no a las entradas de atención, por lo que ningún tensor de atención necesitó reescalado. La `q_proj` (una permutación fija de la `q_proj` base bajo RoPE parcial) se recuantiza desde los pesos bf16 del retrofit con el paso FP8 sin calibración de la receta (bloque 128×128, amax/448); aplicado a los pesos base, ese paso reproduce bit a bit las `q_proj`/`k_proj`/`o_proj` del FP8 publicado. Las proyecciones latentes y las normas de atención se conservan en bf16 desde el retrofit. La cuantización afecta a pesos y activaciones; la caché KV permanece en bf16. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y conversación (`text-generation`, `conversational`), con modo de razonamiento o *thinking* activable en el servidor mediante `--reasoning-parser qwen3`.
- Resolución de tareas de ingeniería de software en formato agente: obtiene 0,403 en SWE-bench Verified con contexto recuperado por BM25 y modo thinking activado, lo que implica generación de parches sobre repositorios reales.
- Generación de código y parches de varias decenas de miles de tokens de contexto, con un consumo de tokens de salida un 18% inferior al del modelo base bf16 en SWE-bench (0,82×).
- Uso en bucles de agente y razonamiento multi-paso, según el arnés de evaluación empleado; el soporte explícito de tool calling o function calling no se detalla en la información disponible.
- Contexto largo, con caché KV comprimida a 16 KiB por token y por GPU en bf16 con TP=2, lo que permite mantener conversaciones o trazas largas con menor coste de memoria.
- Despliegue con tensor parallelism (TP=2 verificado) y, en GPUs solo PCIe sin NVLink, con `--disable-custom-all-reduce`.
- Capacidades de visión: no disponibles; el retrofit es solo texto y no incluye la torre de visión ni la cabeza MTP de los checkpoints de Qwen.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución automática de issues sobre repositorios reales: el modelo está evaluado precisamente en SWE-bench Verified con contexto recuperado por BM25, de modo que puede integrarse en un agente que lee el repositorio, localiza el fallo y emite un parche. Su formato de parche y su menor número de tokens de salida (0,82×) reducen el coste por issue resuelto.
- Asistentes de código con contexto largo en el IDE: la caché KV de 16 KiB por token y GPU permite mantener indexado un repositorio amplio en memoria sin que la caché consuma toda la VRAM del servidor.
- Revisión de código y generación de parches en pipelines de CI/CD: el modelo puede conectarse a un runner que reciba el diff de una pull request y devuelva sugerencias o correcciones, sirviéndose del modo thinking para tareas de razonamiento sobre el código.
- Refactorizaciones guiadas por agente multi-paso sobre bases de código grandes: el modelo soporta ventanas de contexto largas (etiqueta `long-context`) y está diseñado para conversaciones multi-turno con historial extenso, escenario típico de las trazas agénticas de codificación.
- Servicio multi-usuario con presupuesto de memoria ajustado: sustituir Qwen3.8-27B en bf16 (55,6 GB de pesos, 32 KiB de KV por token y GPU) por esta build FP8 (29,7 GB, 16 KiB) permite alojar más sesiones concurrentes en el mismo número de GPUs con un impacto en calidad no significativo en la evaluación publicada.
- Migración de una instalación existente de Qwen3.8-27B-FP8 a una variante con caché KV a la mitad: ambos formatos comparten el mismo esquema FP8 de bloques 128×128, y el modelo conserva el rendimiento del checkpoint FP8 original (0,399 → 0,403 en SWE-bench Verified, diferencia dentro del intervalo de confianza).
- Procesamiento de trazas largas de agentes y evaluaciones de razonamiento extenso: el modo thinking con temperatura 1,0 es el ajuste con el que se han publicado los resultados, y el consumo de tokens de salida es inferior al del base.

## Benchmarks y rendimiento

Todos los resultados publicados son comparaciones emparejadas: mismos prompts, mismo arnés y mismas condiciones de servicio. La única evaluación de capacidad publicada es SWE-bench Verified con evalscope, contexto recuperado por BM25 (`princeton-nlp/SWE-bench_bm25_40K`), modo thinking activado, temperatura 1,0 y 500 instancias. HELMET no se volvió a ejecutar sobre la build FP8.

| Modelo | Ejecuciones | Resueltas | vs. base bf16 (IC 95%, emparejado) | Tokens de salida |
|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 4 | 0,395 | — | 1,00× |
| Qwen/Qwen3.8-27B-FP8 | 3 | 0,399 | +0,5 [−1,5, +2,5] | 1,00× |
| Qwen3.8-27B-GLA-g2 (bf16) | 3 | 0,394 | −0,1 [−2,1, +2,0] | 0,86× |
| **Qwen3.8-27B-GLA-g2-FP8** | 3 | **0,403** (204 / 199 / 202) | **+0,9 [−1,2, +2,9]** | **0,82×** |

Fidelidad respecto al modelo base, medida como NLL en modo *teacher forcing* sobre texto generado por el base bf16 y expresada como exceso sobre ese base (menor es mejor):

| Modelo | Trazas de codificación agéntica | Conversaciones de SWE-bench Verified |
|---|---|---|
| Qwen/Qwen3.8-27B-FP8 | +0,003 | +0,006 |
| Qwen3.8-27B-GLA-g2 (bf16) | +0,045 | +0,050 |
| **Qwen3.8-27B-GLA-g2-FP8** | **+0,050** | **+0,056** |

La cuantización FP8 añade al retrofit entre +0,004 y +0,006 puntos de error, aproximadamente la misma cantidad que añade al modelo base: los dos errores se suman. La diferencia frente al padre bf16 del propio retrofit es de +0,9 [−1,2, +3,0] puntos, no significativa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones generales en la información disponible. La velocidad de esta build FP8 no se ha medido todavía; las cifras de la versión bf16 están en la model card del modelo padre.

## Requisitos de hardware

- Pesos: 29,7 GB en disco y aproximadamente 27 GB de VRAM solo para los pesos (26,9 B de parámetros a 1 byte por parámetro). Hay que sumar activaciones de FP8 dinámicas y caché KV, por lo que se recomienda reservar al menos 40 GB de VRAM por réplica con TP=1 en cargas moderadas.
- Caché KV: 16 KiB por token y por GPU en bf16 con TP=2, la mitad que el Qwen3.8-27B original (32 KiB). En TP=1 la caché se reparte en una sola GPU, por lo que la cifra efectiva por GPU es mayor.
- GPU compatibles: el plugin requiere una GPU en la que vLLM ejecute block-FP8, es decir Hopper o Blackwell. Solo se ha verificado en RTX PRO 6000 (Blackwell) con vLLM 0.27.1, tanto a TP=1 como a TP=2. En esas GPUs vLLM selecciona `CutlassFp8BlockScaledMMKernel`.
- GPU de consumo: no hay datos de funcionamiento en GPU de consumo y el requisito declarado (Hopper o Blackwell) excluye generaciones anteriores. No se ha verificado en RTX 4090 ni en otras GeForce.
- Topología: en GPUs solo PCIe, sin NVLink (por ejemplo RTX PRO o GeForce), hay que añadir `--disable-custom-all-reduce` cuando se sirve con TP=2.
- Despliegue: exclusivamente vLLM 0.27.1 con el plugin `qwen-mla-vllm`. El modelo no carga en `transformers` ni en vLLM estándar. No se documentan rutas de despliegue con llama.cpp, Ollama ni TGI, que no son compatibles con esta arquitectura de atención personalizada y este formato FP8.
- Comando de servicio: `pip install "git+https://github.com/sootaugur/qwen-mla-vllm"` y después `vllm serve TelperionAI/Qwen3.8-27B-GLA-g2-FP8 --tensor-parallel-size 2 --reasoning-parser qwen3`.
- Compilación en el primer arranque: el kernel rápido de decodificación se compila con JIT y necesita `nvcc` y `ninja`. Sin ellos, el plugin cae a kernels Triton: correctos, pero más lentos.
- Latencia y throughput: no disponibles para esta build FP8. Las cifras medidas del retrofit en bf16 están en la model card del modelo padre.

## Comparativa con modelos similares

| Modelo | Parámetros | Peso de los pesos | KV por token y GPU (bf16, TP=2) | SWE-bench Verified | Tokens de salida | Visión / MTP | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | no disponible | 55,6 GB¹ | 32 KiB | 0,395 (4 ejec.) | 1,00× | Sí | no disponible |
| Qwen/Qwen3.8-27B-FP8 | no disponible | 30,9 GB¹ | 32 KiB | 0,399 (3 ejec.) | 1,00× | Sí | no disponible |
| Qwen3.8-27B-GLA-g2 (bf16) | no disponible | 53,9 GB | 16 KiB | 0,394 (3 ejec.) | 0,86× | No (solo texto) | no disponible |
| **Qwen3.8-27B-GLA-g2-FP8** | 26.944.036.352 | **29,7 GB** | **16 KiB** | **0,403** (3 ejec.) | **0,82×** | No (solo texto) | apache-2.0 |

¹ Los checkpoints de Qwen incluyen además la torre de visión y la cabeza MTP; los retrofits son solo texto, de ahí parte de la diferencia de tamaño.

Frente a la build FP8 oficial de Qwen, este modelo ocupa 1,2 GB menos en disco y reduce la caché KV a la mitad, con una diferencia de 0,4 puntos en SWE-bench Verified que queda muy dentro del intervalo de confianza. Frente a su propio padre en bf16, el ahorro es de 24,2 GB de pesos y la mitad de caché KV, con una diferencia de +0,9 puntos no significativa. La build intermedia TelperionAI/Qwen3.8-27B-FP8-block-AWQ (FP8 por bloques con suavizado AWQ de los MLP) se usó como punto de partida para el injerto y no cuenta con resultados propios publicados en esta información.

## Limitaciones y advertencias

- El plugin de servicio es experimental: se ha verificado únicamente en RTX PRO 6000 (Blackwell) con vLLM 0.27.1, a TP=1 y TP=2, y según el autor ha tenido poco uso real.
- El modelo no carga en `transformers` ni en vLLM estándar. Cualquier pipeline que dependa de esas rutas requiere reescribir el despliegue alrededor del plugin `qwen-mla-vllm`.
- La velocidad de esta build FP8 no se ha medido. No hay datos publicados de latencia ni de throughput, por lo que no se puede estimar el coste de servicio sin hacer una prueba propia.
- Los resultados solo cubren SWE-bench Verified. No se ha ejecutado HELMET sobre la build FP8, y no hay evaluaciones de conocimiento general, matemáticas ni multilingüismo.
- Cuantización con pérdida: la NLL en modo teacher forcing empeora +0,050 en trazas de codificación agéntica y +0,056 en conversaciones de SWE-bench Verified respecto al base bf16. Es un error pequeño pero acumulativo con el propio del retrofit.
- Las diferencias de calidad reportadas no son estadísticamente significativas: los intervalos de confianza del 95% incluyen el cero en todas las comparaciones, con solo 3 o 4 ejecuciones por configuración.
- El modelo es solo texto. No dispone de torre de visión ni de cabeza MTP, por lo que no puede usarse en tareas multimodales ni beneficiarse de decodificación especulativa basada en MTP tal como se distribuye.
- Idiomas soportados no documentados. La model card no declara cobertura lingüística, lo que impide validar su comportamiento fuera del inglés técnico.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de tasas de alucinación para este checkpoint.
- Sesgos: no se documenta ningún análisis de sesgo en la información disponible.
- Estado de adopción: 0 descargas y 1 like en el momento de la consulta, lo que implica una validación por terceros prácticamente nula.
- Licencia Apache 2.0, sin restricciones declaradas para uso comercial en la información disponible; conviene revisar igualmente las condiciones de los modelos base de Qwen sobre los que se construye.
- La longitud de contexto no se especifica en la model card pese a la etiqueta `long-context`; hay que determinarla empíricamente antes de dimensionar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TelperionAI/Qwen3.8-27B-GLA-g2-FP8
- Modelo base (retrofit GLA-g2, bf16): https://huggingface.co/TelperionAI/Qwen3.8-27B-GLA-g2
- Build usada para el injerto FP8: https://huggingface.co/TelperionAI/Qwen3.8-27B-FP8-block-AWQ
- Build FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Plugin de vLLM para la atención latente: https://github.com/sootaugur/qwen-mla-vllm
- Dataset de contexto recuperado para SWE-bench: https://huggingface.co/datasets/princeton-nlp/SWE-bench_bm25_40K
