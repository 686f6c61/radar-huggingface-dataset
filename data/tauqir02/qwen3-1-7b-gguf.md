# tauqir02/Qwen3-1.7B-GGUF

## Resumen

Qwen3-1.7B-GGUF es una conversión a formato GGUF del modelo Qwen/Qwen3-1.7B, publicada por el usuario tauqir02 (Geet Techworks) para su uso con llama.cpp e inferencia en dispositivo, con especial énfasis en Android. El modelo base es un transformer denso de la familia Qwen3 desarrollado por Alibaba Qwen, con 2.031.739.904 parámetros totales (incluyendo embeddings atados) y una longitud de contexto nativa de 32.768 tokens. Esta conversión concreta no modifica los pesos: no hay fine-tuning, merging ni adaptadores, solo la cuantización a Q4_K_M.

La relevancia de esta ficha radica en que empaqueta un modelo de razonamiento híbrido (modo thinking y non-thinking) en un único fichero de 1,19 GiB, validado tanto contra el commit de conversión de llama.cpp como contra el commit usado por la aplicación Android. Esto lo hace adecuado para despliegues en móvil o entornos con recursos muy limitados donde no cabe un modelo mayor.

El repositorio tiene un tamaño de 1,3 GB y se distribuye bajo licencia Apache 2.0. La model card incluye instrucciones específicas para desactivar el modo thinking en Android, parámetros de muestreo recomendados y cálculos del coste de la caché KV, lo que facilita una puesta en producción reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3` (`Qwen3ForCausalLM`), transformer denso, 28 capas |
| Parametros totales | 2.031.739.904 (incluye embeddings atados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (`max_position_embeddings` = 40.960) |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | en, hi, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-1.7B-Q4_K_M.gguf`, 1.282.439.552 bytes) |

Geometría de atención: 16 cabezas de consulta y 8 cabezas KV, `head_dim` 128, `hidden size` 2048, `intermediate size` 6144. Tokenizador BPE estilo GPT-2 (`tokenizer.ggml.pre = qwen2`), vocabulario de 151.936 entradas, normalizador NFC, sin BOS. Token EOS: `<|im_end|>` (151645).

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer denso de 28 capas con atención multi-cabeza agrupada (GQA, 16 cabezas de consulta y 8 KV) y embeddings atados. Es un modelo híbrido de razonamiento: puede operar en modo thinking (genera un bloque `<think>...</think>` antes de la respuesta) o en modo non-thinking (respuesta directa), conmutables mediante la plantilla de chat (`enable_thinking`) o el sufijo `/no_think`. La plantilla de chat se ha embebido byte a byte desde el `tokenizer_config.json` upstream.

Esta conversión concreta no aporta información sobre el dataset de entrenamiento, el número de tokens vistos, ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la información disponible. La innovación técnica del repositorio es la validación de la conversión: paridad de token-IDs frente a la librería `tokenizers` de Hugging Face en texto multilingüe general (11/11), hindi con conjuntivos, nukta, dígitos devanagari, hinglish y el símbolo ₹ (6/6), casos Unicode límite como NFD→NFC, ligaduras y ancho completo (3/3), y prompts de chat renderizados con tokens especiales en thinking on/off (2/2). La plantilla de chat resultó byte-idéntica a la upstream y la inferencia greedy en modo non-thinking pasó 5/5 pruebas en inglés, hindi, matemáticas y dos conversaciones multi-turno.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato ChatML de Qwen.
- Razonamiento híbrido: modo thinking con bloque `<think>` explícito y modo non-thinking para respuestas rápidas.
- Capacidades matemáticas básicas y resolución de problemas, validadas en las pruebas de inferencia del autor.
- Soporte multilingüe, con validación específica de inglés e hindi (incluyendo escritura devanagari, conjuntivos, nukta, dígitos y hinglish).
- Tokenización robusta ante casos Unicode límite (normalización NFD→NFC, ligaduras, caracteres de ancho completo).
- Compatible con `llama.cpp` y runtimes que consuman GGUF; etiquetado como `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional en Android: el fichero Q4_K_M de 1,19 GiB cabe en la memoria de un teléfono de gama media-alta; con contexto de 2048–4096 tokens y modo non-thinking se obtienen respuestas rápidas sin el coste del bloque de razonamiento.
- Chat multilingüe inglés-hindi en aplicaciones móviles: la validación específica de tokenización en hindi (conjuntivos, nukta, dígitos devanagari, hinglish y ₹) permite construir asistentes para usuarios del subcontinente sin degradación en la segmentación.
- Inferencia en dispositivos de borde sin GPU: al ser GGUF para llama.cpp, puede ejecutarse en CPU en mini-PC, Raspberry Pi de gama alta o portátiles sin acelerador, con el coste de caché KV calculado (unos 112 KiB por token en F16, es decir, ~224 MiB para 2048 de contexto y ~448 MiB para 4096).
- Prototipado rápido de aplicaciones de razonamiento: el modo thinking permite probar cadenas de razonamiento en local antes de escalar a modelos mayores, y el modo non-thinking sirve para comparar latencia frente a calidad.
- Generación de texto y resúmenes offline: útil en entornos sin conectividad o con requisitos de privacidad, donde el texto no puede salir del dispositivo.
- Pruebas de integración de plantillas de chat: al estar la plantilla embebida byte a byte desde upstream, sirve como referencia para validar implementaciones propias de ChatML y del conmutador `enable_thinking`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de validación de la conversión (paridad de tokenización, plantilla de chat, metadatos e inferencia greedy), no métricas de calidad tipo MMLU, HumanEval o GSM8K.

| Prueba de validación | Resultado (cd959ba) | Resultado (android-4b77dee) |
|---|---|---|
| Paridad de token-IDs, texto multilingüe general | 11/11 | 11/11 |
| Paridad de token-IDs, hindi | 6/6 | 6/6 |
| Paridad de token-IDs, casos Unicode límite | 3/3 | 3/3 |
| Paridad de token-IDs, prompt de chat con tokens especiales | 2/2 | 2/2 |
| Plantilla de chat byte-idéntica a upstream | sí | sí |
| Comprobación de metadatos | sí | sí |
| Inferencia greedy en modo non-thinking | 5/5 | 5/5 |

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero Q4_K_M ocupa 1,19 GiB; hay que sumar la caché KV, de unos 112 KiB por token en F16 (28 capas × 8 cabezas KV × 128 dimensiones × 2 × 2 bytes). Con contexto de 2048 se añaden ~224 MiB y con 4096, ~448 MiB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM puede alojar el modelo con contexto moderado; el autor no documenta pruebas en GPU concretas.
- Cabe en GPU consumer: sí, por el tamaño del fichero; el autor no detalla modelos concretos (RTX 4090, etc.).
- Despliegue: llama.cpp es el runtime de referencia; el autor valida los commits `cd959ba` (conversión) y `4b77dee` (runtime Android). No se mencionan vLLM, TGI, Ollama ni otros motores en la información disponible.
- Latencia y throughput: no disponibles. El autor recomienda contexto de 2048–4096 en Android y modo non-thinking para respuestas rápidas, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tauqir02/Qwen3-1.7B-GGUF (esta ficha) | 2,03 B | 32.768 | GGUF Q4_K_M | Apache 2.0 | Repo propio, 0 descargas |
| Qwen/Qwen3-1.7B-GGUF | 2 B | no disponible en la información | GGUF | Apache 2.0 (según modelo base) | Repo oficial en Hugging Face |
| unsloth/Qwen3-1.7B-GGUF | 2 B | no disponible en la información | GGUF | Apache 2.0 (según modelo base) | Repo de Unsloth en Hugging Face |

Los tres empaquetan el mismo modelo base Qwen3-1.7B; las diferencias están en el conjunto de cuantizaciones ofrecidas, el mantenimiento y la validación publicada. Esta conversión destaca por su validación explícita de tokenización y plantilla de chat, pero solo publica Q4_K_M y no registra descargas ni likes.

## Limitaciones y advertencias

- Solo se publica una cuantización (Q4_K_M); no hay variantes Q2, Q3, Q5, Q6, Q8 ni F16 en este repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-08); no hay evidencia de uso en producción ni de mantenimiento continuado.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El contexto práctico recomendado por el autor para Android es de 2048–4096 tokens, muy por debajo de los 32.768 nativos, por el coste de la caché KV.
- En modo thinking no debe usarse decodificación greedy, porque tiende a repetir; se recomienda temperatura 0,6 y top_p 0,95.
- Los idiomas validados son inglés e hindi; el resto de idiomas multilingües no tienen pruebas específicas en esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen3-1.7B en su repositorio oficial.
- No se documenta soporte de tool calling, agentes, visión ni audio, por lo que no debe asumirse en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tauqir02/Qwen3-1.7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3-1.7B-GGUF
