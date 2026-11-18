# XHToken/Spark-X2.6-4B-DSpark-GGUF

## Resumen

Spark-X2.6-4B-DSpark-GGUF es un modelo borrador (draft model) en formato GGUF BF16 diseñado específicamente para decodificación especulativa junto al modelo objetivo XHToken/Spark-X2.6-4B. Lo desarrolla el equipo SparkLLM (cuenta XHToken en Hugging Face) y su función no es generar respuestas de forma autónoma, sino proponer hasta siete tokens por pasada que el modelo objetivo verifica en paralelo, reduciendo el número de pasos secuenciales de decodificación. Con 624 millones de parámetros, es un componente de infraestructura de inferencia, no un modelo conversacional de propósito general.

La arquitectura del borrador es deliberadamente ligera: cinco capas con atención de ventana deslizante (SWA) de 512 tokens, tamaño oculto de 2560, y consume los estados ocultos de las capas `[2, 10, 18, 25, 33]` del modelo objetivo. Esta configuración permite aceleraciones medidas de entre 1,3× y 2,9× en throughput según hardware, cuantización del objetivo y tipo de tarea, con una longitud media de aceptación que oscila entre 3,05 y 5,18 tokens sobre un máximo de 8.

Su relevancia actual reside en que la decodificación especulativa se ha consolidado como la técnica estándar para mejorar la latencia en despliegues de LLM en dispositivo y en servidor, y este modelo ofrece un borrador empaquetado, con licencia Apache 2.0 y compatible con una bifurcación de llama.cpp que expone una API compatible con OpenAI. El repositorio ocupa 3,2 GB y acumula 4751 descargas y 31 likes desde su publicación el 30 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer borrador con 5 capas SWA (sliding-window attention), ventana de 512, hidden size 2560 |
| Parámetros totales | 624.416.001 (624M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; el servidor de ejemplo se lanza con `-c 8192` |
| Tipos de cuantización | Pesos del borrador en BF16 (GGUF); el modelo objetivo admite BF16 o cuantizado (Q4_K_M, INT4 en las pruebas) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

El borrador DSpark es un transformer de 5 capas con atención de ventana deslizante de 512 tokens y dimensión oculta de 2560. No procesa el prompt desde cero: toma los estados ocultos de las capas 2, 10, 18, 25 y 33 del modelo objetivo Spark-X2.6-4B y genera hasta 7 tokens candidatos por pasada de borrador. El modelo objetivo verifica esos candidatos en paralelo, de modo que una pasada de verificación puede aceptar varios tokens a la vez y reducir el número de pasos secuenciales.

La model card no detalla el dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF o DPO para el borrador. Sí especifica el mecanismo de muestreo: el borrador puede operar en modo probabilístico o greedy (argmax), y las evaluaciones cubren ambos. La innovación técnica central es el esquema de decodificación especulativa con longitud de borrador 7 y verificación paralela, integrado en una bifurcación propia de llama.cpp (rama `master`, commit `22c0ae1871b60123c5afc008a78fe9c6fffa2858`) con la opción `--spec-type draft-dspark`; la integración en el llama.cpp upstream está en curso según el autor.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone hasta 7 tokens por pasada que el modelo objetivo verifica en paralelo.
- Compatibilidad con objetivos en BF16 y cuantizados: funciona tanto con pesos BF16 como con GGUF cuantizados del modelo objetivo.
- Modos de muestreo configurables: borrador probabilístico o greedy (argmax).
- Integración con API compatible con OpenAI a través de `llama-server` (endpoint `/v1/chat/completions`).
- Soporte de los modos de pensamiento del modelo objetivo (High / Low / No thinking) en las evaluaciones de aceptación.
- Idiomas: inglés y chino, heredados del modelo objetivo.
- No es un modelo generativo autónomo: no debe usarse sin el modelo objetivo Spark-X2.6-4B.

## Casos de uso

- Despliegue de agentes en dispositivo: emparejado con Spark-X2.6-4B cuantizado en un portátil con Apple M5 Pro, el borrador eleva el throughput de 31 a 77 tok/s de media (2,50×), lo que hace viables agentes multi-paso en local.
- Servicio de chat de baja latencia en GPU de consumo: en una RTX 4090 con objetivo Q4_K_M, el throughput pasa de 226 a 447 tok/s de media (1,98×), adecuado para atender múltiples sesiones conversacionales con latencia reducida.
- Generación de código interactiva: en HumanEval y MBPP el borrador mantiene aceleraciones de 1,56× a 2,41×, útil en asistentes de programación que requieren respuestas rápidas en el editor.
- Razonamiento matemático en producción: en MATH500 se alcanza la mayor aceleración medida (2,94× en M5 Pro BF16, 2,89× efectiva en RTX 4090 BF16), relevante para pipelines de resolución de problemas con cadenas de razonamiento largas.
- Reducción de coste de servido: al disminuir los pasos secuenciales del modelo objetivo, se reduce el tiempo de GPU por petición en despliegues con `llama-server` y API compatible con OpenAI, lo que abarata el coste por token generado.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible para medir longitud media de aceptación en distintos modos de pensamiento (High, Low, No thinking) y temperaturas (T=0, T=1).

## Benchmarks y rendimiento

Longitud media de aceptación con longitud de borrador 7 y salida máxima de 4096 tokens (incluye un token adicional del objetivo, máximo 8):

| Dataset | T=1, High, Prob. | T=1, Low, Prob. | T=1, No thinking, Prob. | T=0, High, Greedy |
|---|---:|---:|---:|---:|
| AIME25 | 4,1833 | 4,0749 | 4,8251 | 4,6493 |
| GSM8K | 4,4056 | 4,3266 | 4,9514 | 4,4845 |
| MATH500 | 4,5942 | 4,6721 | 5,1758 | 5,0335 |
| HumanEval | 3,8743 | 4,1370 | 4,5859 | 4,4330 |
| MBPP | 3,8671 | 4,0179 | 4,3935 | 4,5525 |
| Arena-Hard-v2 | 3,2172 | 3,1772 | 3,0499 | 4,1601 |
| **Media** | **4,0236** | **4,0676** | **4,4969** | **4,5522** |

Throughput con y sin DSpark (llama.cpp en RTX 4090; MLX en Apple M5 Pro):

| Dataset | BF16 · RTX 4090 | BF16 · M5 Pro | Q4_K_M · RTX 4090 | INT4 · M5 Pro |
|---|:---:|:---:|:---:|:---:|
| AIME25 | 2,22× (95 → 210 tok/s) | 2,62× (31 → 80 tok/s) | 2,00× (226 → 451 tok/s) | 1,69× (71 → 119 tok/s) |
| GSM8K | 2,49× (95 → 236 tok/s) | 2,57× (31 → 79 tok/s) | 2,35× (226 → 532 tok/s) | 1,66× (71 → 118 tok/s) |
| MATH500 | 2,51× (95 → 239 tok/s) | 2,94× (31 → 90 tok/s) | 2,33× (226 → 527 tok/s) | 1,89× (71 → 135 tok/s) |
| HumanEval | 2,06× (95 → 196 tok/s) | 2,41× (31 → 74 tok/s) | 1,72× (226 → 389 tok/s) | 1,56× (71 → 110 tok/s) |
| MBPP | 1,88× (95 → 178 tok/s) | 2,49× (31 → 77 tok/s) | 1,85× (227 → 420 tok/s) | 1,61× (71 → 115 tok/s) |
| Arena-Hard-v2 | 1,70× (94 → 160 tok/s) | 2,00× (31 → 61 tok/s) | 1,62× (225 → 365 tok/s) | 1,30× (71 → 92 tok/s) |
| **Media** | **2,14× (95 → 203 tok/s)** | **2,50× (31 → 77 tok/s)** | **1,98× (226 → 447 tok/s)** | **1,62× (71 → 115 tok/s)** |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, GSM8K, HumanEval) en la información disponible; los datos anteriores miden aceptación y throughput del esquema especulativo, no la calidad de las respuestas.

## Requisitos de hardware

- VRAM del borrador: 624M parámetros en BF16 equivalen a aproximadamente 1,25 GB de pesos, más caché KV para 5 capas con ventana de 512 y contexto de servidor de 8192.
- VRAM total: debe sumarse la del modelo objetivo Spark-X2.6-4B (BF16 o cuantizado Q4_K_M / INT4), no incluida en este repositorio.
- GPU validadas: NVIDIA RTX 4090 (CUDA, llama.cpp) y Apple M5 Pro (MLX). No hay datos publicados para A100, H100 ni otras GPU.
- GPU de consumo: sí, cabe en RTX 4090 junto al objetivo cuantizado; el borrador por sí solo ocupa poco más de 1 GB en BF16.
- Opciones de despliegue: `llama-server` de la bifurcación XHToken/llama.cpp con `--spec-type draft-dspark`, `--spec-draft-sampling greedy`, `--spec-draft-n-max 7`; en M5 Pro se empleó MLX. La integración en llama.cpp upstream está en progreso.
- Throughput medido: 160–239 tok/s en RTX 4090 con objetivo BF16 y 365–532 tok/s con Q4_K_M; 61–90 tok/s en M5 Pro con BF16 y 92–135 tok/s con INT4.
- Configuración de referencia del servidor: `-ngl 999 -ngld 999`, caché KV en f16 (objetivo y borrador), `-fa on`, `-c 8192`, `-b 2048 -ub 512`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Spark-X2.6-4B-DSpark | Borrador especulativo (SWA, 5 capas) | 624M | ventana SWA 512; servidor a 8192 | Acelerar Spark-X2.6-4B | Apache 2.0 | GGUF en HF; llama.cpp bifurcado |
| Spark-X2.6-4B | Modelo objetivo | no disponible en esta ficha | no disponible | Generación y agentes | Apache 2.0 | GGUF en HF |
| Borradores EAGLE / Medusa | Cabezas o borradores especulativos | variable | depende del objetivo | Aceleración genérica | variable | integrados en vLLM, TensorRT-LLM, etc. |
| Borradores nativos de llama.cpp | Borrador especulativo genérico | variable | depende del objetivo | Aceleración en llama.cpp | MIT (llama.cpp) | upstream |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada: la model card solo compara DSpark contra el mismo objetivo sin decodificación especulativa, no contra otros borradores.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Spark-X2.6-4B; usarlo solo produce tokens de borrador sin verificación.
- Dependencia de una bifurcación: la integración requiere XHToken/llama.cpp en la rama `master` (commit `22c0ae1871b60123c5afc008a78fe9c6fffa2858`); la compatibilidad con llama.cpp upstream no está garantizada hasta que se complete la integración.
- Aceleración variable: el rango medido va de 1,30× (INT4 en M5 Pro, Arena-Hard-v2) a 2,94× (BF16 en M5 Pro, MATH500); en tareas conversacionales abiertas (Arena-Hard-v2) el beneficio es el más bajo.
- Longitud de aceptación dependiente del modo: cae a 3,05 en Arena-Hard-v2 con modo "No thinking" y sube a 5,18 en MATH500, por lo que la ganancia no es uniforme entre dominios.
- Idiomas limitados a inglés y chino; no hay evidencia de rendimiento en castellano.
- Sin datos publicados sobre sesgos, tasa de alucinación del objetivo ni composición del dataset de entrenamiento del borrador.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni soporte; el modelo objetivo tiene su propia model card que debe revisarse por separado.
- El contexto del borrador está acotado por la ventana deslizante de 512 tokens; el contexto efectivo lo determina el modelo objetivo y la configuración del servidor.

## Enlaces

- Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B
- Modelo objetivo en GGUF: https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF
- Bifurcación de llama.cpp: https://github.com/XHToken/llama.cpp
- Licencia: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF/blob/main/LICENSE
