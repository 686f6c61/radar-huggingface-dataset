# Xylolabs/Qwen3-4B-Tensix-BFP4-MLP

## Resumen

Qwen3-4B-Tensix-BFP4-MLP es una exportación cuantizada del modelo Qwen3-4B de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado en el que las capas lineales del transformer original se han recodificado a formatos de coma flotante por bloques propios del hardware Tensix: `ttnn.bfloat4_b` (BFP4) para las proyecciones MLP y `ttnn.bfloat8_b` (BFP8) para las proyecciones de atención. El resultado pesa 3,29 GB empaquetado frente a los 8,04 GB del modelo base en BF16, con una media de 6,55 bits por peso.

El modelo conserva la arquitectura completa de Qwen3-4B, un transformer denso de 4.411.424.256 parámetros con capacidades conversacionales, razonamiento y generación de texto multilingüe. Su relevancia radica en que resuelve un problema concreto de despliegue: permitir ejecutar un LLM de 4B parámetros en aceleradores Tensix con un coste de memoria reducido y sin degradar la calidad de forma apreciable respecto al BF16. La evaluación publicada por el autor muestra una KL media de 0,0513 frente al BF16 y un top-1 del 90,78 %, con cero respuestas perdidas en su conjunto de 40 pruebas.

La licencia es Apache 2.0, igual que el modelo base, y los pesos se distribuyen en formato safetensors con una configuración adicional `quant4.json` que describe el formato de cada proyección. Es un artefacto pensado para el ecosistema TT-NN y TT-Metal; el autor advierte que tt-transformers y tt-forge no se han probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado en coma flotante por bloques (BFP) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en MLP, BFP8 (bfloat8_b) en atencion, bf16 en embedding, LM head y normas; media 6,55 bits por peso |
| Idiomas soportados | no disponible (el calibrado uso WikiText-2 en ingles y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 sobre rejilla BFP4/BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de tipo decoder-only. La intervención de Xylolabs no modifica la topología ni reentrena el modelo: recodifica las matrices lineales en los formatos nativos de Tensix. Las 36 capas tienen sus proyecciones de atención `q`, `k`, `v` y `o` en `bfloat8_b` (8,5 bits por peso) y sus proyecciones MLP `gate`, `up` y `down` en `bfloat4_b` (4,5 bits por peso). El embedding, el LM head (atado al embedding) y todas las normas permanecen en bf16. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores.

El proceso de cuantización de los tensores BFP4 empleó GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores BFP8 se obtuvieron por redondeo al más cercano (*round to nearest*). No se aplicó ningún ajuste fino posterior ni RLHF adicional sobre el checkpoint base. La innovación técnica principal es la preservación exacta de los valores tras el empaquetado en hardware: el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) que comprueban que ninguna matriz cambia al pasar por DRAM del dispositivo, verificado con ttnn 0.81.1 sobre el simulador Blackhole (`ttsim`).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-4B.
- Razonamiento con modo *thinking* (el conjunto de evaluación incluye 7 pruebas de razonamiento con thinking activado).
- Generación de código y matemáticas, capacidades propias de la familia Qwen3.
- Capacidades multilingües del modelo base (el calibrado incluyó texto en inglés y coreano; el conjunto de evaluación cubre ambos idiomas).
- Soporte de plantilla de chat (`apply_chat_template`) con roles de sistema, usuario y asistente.
- Inferencia en NPU Tensix mediante TT-NN con empaquetado directo de los pesos cuantizados.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está diseñado para cargarse directamente en TT-NN con `ttnn.bfloat4_b` y `ttnn.bfloat8_b`, ocupando 3,29 GB de memoria de dispositivo para los pesos del modelo de lenguaje, más KV cache y buffers. Es el caso de uso principal y el único para el que el autor ofrece garantías de empaquetado exacto.
- Prototipado de inferencia LLM en hardware no-GPU: equipos que ya disponen de NPU Tensix pueden ejecutar un modelo de 4B parámetros sin recurrir a CUDA, usando el mismo checkpoint que en transformers para validación cruzada.
- Evaluación de cuantización BFP frente a GPTQ entero: el modelo sirve como referencia para comparar la degradación de BFP4/BFP8 con Q4_K_M de llama.cpp (KL media 0,0513 frente a 0,06581 y top-1 90,78 % frente a 89,61 %).
- Generación de texto conversacional en inglés y coreano: el calibrado y la evaluación cubren ambos idiomas, por lo que es adecuado para asistentes en esos mercados con verificación de calidad respecto al BF16.
- Investigación en compresión de modelos: el repositorio incluye `quant4.json` con el formato por proyección y scripts de verificación, útiles para estudiar el impacto de distintos formatos BFP en cada capa.
- Validación de pipelines TT-Metal: `pack_tensix.py --device` permite comprobar el round-trip por DRAM del dispositivo antes de integrar el modelo en una aplicación mayor.
- Razonamiento con thinking activado en entornos con memoria limitada: el modo thinking del modelo base se conserva y se ha evaluado en 7 pruebas específicas, lo que permite usarlo en tareas de razonamiento donde el presupuesto de VRAM/NPU es ajustado.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B) | 16 | 8,04 | 0 | 100 | 36 de 40 | - |
| **Este modelo** | 6,55 | 3,294 | 0,0513 | 90,78 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 2,497 | 0,06581 | 89,61 | 38 de 40 | 0 |

La KL y el top-1 se calculan sobre 16.240 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). El criterio del autor exige una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el modelo lo cumple con 0,78 veces la KL de Q4_K_M y 0 pérdidas frente a 0. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El autor advierte que estas métricas miden proximidad al BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 3,29 GB para los pesos del modelo de lenguaje, más espacio para KV cache y buffers (el total depende de la longitud de contexto y del batch).
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre el simulador Blackhole (`ttsim`).
- GPU consumer: no es el objetivo del checkpoint; no se documenta su ejecución en GPU. El modelo puede cargarse en transformers con `device_map="auto"` en bf16, pero en ese caso ocupa el tamaño del modelo base (8,04 GB), no los 3,29 GB empaquetados.
- Despliegue: TT-NN / TT-Metal para el empaquetado BFP; transformers para carga y validación. tt-transformers y tt-forge no se han probado con este checkpoint según el autor.
- Latencia y throughput: no disponibles en la información proporcionada.
- Scripts auxiliares: `pack_tensix.py` (verificación de empaquetado, opción `--device` para round-trip por DRAM) y `verify_grid.py` (verificación de la rejilla solo con torch).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3-4B-Tensix-BFP4-MLP** | 4,41 B | no disponible | 6,55 | 3,29 GB | Apache 2.0 | Hugging Face, para Tensix |
| Qwen/Qwen3-4B (BF16) | 4,41 B | no disponible | 16 | 8,04 GB | Apache 2.0 | Hugging Face, universal |
| Qwen3-4B Q4_K_M (llama.cpp) | 4,41 B | no disponible | 4,95 | 2,50 GB | Apache 2.0 | Hugging Face, CPU/GPU |

Frente al BF16, este checkpoint reduce el tamaño a menos de la mitad (3,29 GB frente a 8,04 GB) con una KL media de 0,0513 y cero respuestas perdidas en la evaluación del autor. Frente a Q4_K_M, ocupa más espacio (3,29 GB frente a 2,50 GB) pero logra menor KL (0,0513 frente a 0,06581) y mayor top-1 (90,78 % frente a 89,61 %), aunque Q4_K_M acierta 38 de 40 respuestas frente a 36 de 40 de este modelo. La diferencia clave es el destino: este checkpoint está pensado para NPU Tensix, mientras que Q4_K_M es portable a CPU y GPU. No se dispone de datos de contexto ni de benchmarks de tarea para ninguno de los tres en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está diseñado y verificado para NPU Tensix; tt-transformers y tt-forge no se han probado con él, por lo que su uso fuera de TT-NN no está validado por el autor.
- Las métricas publicadas miden proximidad al BF16 (KL, top-1), no calidad de tarea; no se reportan resultados de MMLU, HumanEval, GSM8K ni similares.
- No se reporta velocidad, latencia ni throughput; el rendimiento en producción debe medirse en el hardware concreto.
- El calibrado de GPTQ usó solo 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede sesgar la cuantización hacia esos dominios e idiomas.
- La cuantización BFP4 en las proyecciones MLP introduce una degradación medible (top-1 del 90,78 % frente al 100 % del BF16) que puede afectar a tareas sensibles a la precisión.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-4B; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "as is", sin garantía, y declara no estar afiliado ni respaldado por Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados publicados.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas oficialmente cubiertos más allá de los usados en calibrado y evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tensix-BFP4-MLP
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2505.09388, Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
- Licencia Apache 2.0 del checkpoint: https://huggingface.co/Xylolabs/Qwen3-4B-Tensix-BFP4-MLP/blob/main/LICENSE
