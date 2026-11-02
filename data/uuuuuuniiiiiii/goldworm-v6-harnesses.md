# Uuuuuuniiiiiii/goldworm-v6-harnesses

## Resumen

GoldWorm v6 harnesses es una colección de 27 checkpoints experimentales publicados por el usuario Uuuuuuniiiiiii en Hugging Face. Cada subcarpeta contiene un "harness" (especialista) derivado por fine-tuning del modelo base GoldWorm v6, un transformer byte-level de tan solo 2,76 millones de parámetros entrenado originalmente con TinyStories. El propósito declarado por el autor no es ofrecer un modelo utilizable en producción, sino servir como material de prueba para validar infraestructura de entrenamiento y evaluación en formato byte-level.

La relevancia de esta publicación es metodológica más que práctica: documenta con detalle un experimento sobre si el fine-tuning desde un modelo base pequeño (fork) supera al entrenamiento desde cero (scratch) en dominios de código y formatos estructurados. Los resultados muestran que la ventaja del fork se desvanece hacia los 1600 pasos y se invierte en algunos casos a los 3200, lo que constituye una observación interesante sobre el valor del preentrenamiento en modelos de escala ínfima.

Cada checkpoint se entrenó únicamente durante 330–464 pasos (batch 32 × 256 bytes, unos 20 segundos por harness en una RTX 4060 Laptop) el 2 de noviembre de 2026. Los entrenamientos más largos realizados posteriormente en RunPod no se guardaron, por lo que estos pesos de ~400 pasos son los únicos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer byte-level (clase `GoldWormV6` / `ByteTransformer`), activación GELU, embeddings atados |
| Parametros totales | 2,76 M (modelo base GoldWorm v6) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 bytes |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (operación a nivel de byte, sin identificación de idiomas) |
| Licencia | `other` (mixed-mit-and-gfdl-data); base MIT, datos de entrenamiento con obligaciones GFDL 1.2 |
| Formato de pesos | safetensors (`<harness>/model.safetensors`) |
| Dimensiones internas | d_model 192, 6 capas, 4 cabezas de atención, vocabulario 256 |
| Tamaño del repositorio | 0,3 GB (27 checkpoints) |
| Pasos de entrenamiento | 330–464 por harness (batch 32 × 256 bytes) |

## Arquitectura y entrenamiento

El modelo base GoldWorm v6 es un transformer decoder-only de 2,76 M de parámetros con vocabulario byte-level de 256 símbolos, contexto de 256 bytes, dimensión de modelo 192, 6 capas y 4 cabezas de atención, con embeddings atados y activación GELU. Fue preentrenado exclusivamente con TinyStories, lo que explica que sus valores de bits por byte (bpb) sobre código sean superiores a 8 (peor que la adivinación uniforme) antes del fine-tuning.

Cada harness se obtiene por fine-tuning del modelo v6 sobre un corpus específico de un dominio (lenguajes de programación, formatos de serialización, texto ASCII/Unicode, etc.). La mayoría de los datos de lenguajes de programación, SQL y Brainfuck provienen del dataset `christopher/rosetta-code`; los formatos estructurados (json, yaml, toml, ini, xml, css, csv, edn, msgpack, ansi_escape) se generan de forma sintética. El entrenamiento es muy corto: entre 330 y 464 pasos, con un batch de 32 secuencias de 256 bytes. El autor reporta además ejecuciones de control en RunPod (400, 1600 y 3200 pasos) comparando fork frente a scratch, cuyos resultados se incluyen como columnas de "gap" en la tabla de evaluación, aunque esos pesos no se conservaron.

## Capacidades

- Modelado de lenguaje byte-level: predice el siguiente byte, sin tokenizador ni vocabulario lingüístico.
- Especialización por dominio: cada checkpoint está ajustado para modelar un formato concreto (C, C++, C#, Rust, Go, Haskell, JavaScript, PHP, Ruby, SQL, HTML, CSS, JSON, YAML, TOML, INI, XML, CSV, EDN, MessagePack, ANSI escape, Brainfuck, ASCII, Unicode, entre otros).
- Detección de estructura sintáctica simple: los bpb bajos en formatos repetitivos indican que el modelo captura regularidades como llaves, indentación o delimitadores.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking.
- No dispone de capacidades multimodales (visión, audio) ni de instrucciones conversacionales.
- Capacidad multilingüe: no evaluada ni documentada; al operar sobre bytes, no hay noción de idioma.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: cada harness sirve para verificar que un script de fine-tuning carga correctamente pesos safetensors con la clase `GoldWormV6`, ejecuta pasos y guarda checkpoints sin errores.
- Validación de infraestructura de evaluación: los ficheros `eval.json` y las rutinas de cálculo de bpb permiten comprobar que el pipeline de evaluación (deduplicación, ventanas de 256 bytes, enmascarado de contexto) funciona de extremo a extremo.
- Referencia para experimentos fork vs. scratch: los checkpoints y las columnas de gap documentan un caso reproducible de cómo la ventaja del preentrenamiento se diluye con el número de pasos en modelos de escala ínfima.
- Docencia y demostración de modelos byte-level: el tamaño reducido (2,76 M de parámetros, 0,3 GB) permite cargar el modelo en cualquier portátil y mostrar en vivo cómo un transformer predice bytes de código sin tokenizador.
- Integración en IDE o harness de pruebas de herramientas de desarrollo: el autor menciona explícitamente el uso para "harness/IDE plumbing", es decir, validar el cableado de herramientas que esperan un modelo de lenguaje pequeño antes de conectar uno real.
- Benchmark de juguete para comparar tokenizadores frente a byte-level: al tener un modelo byte-level mínimo, se puede contrastar su comportamiento con modelos BPE del mismo tamaño en tareas de compresión de código.
- Reproducción de estudios sobre deduplicación de datos: las notas sobre solapamiento residual en Brainfuck (17 %) y duplicados en ascii, css, html y unicode ofrecen un caso práctico para estudiar el impacto de la limpieza de datasets.

## Benchmarks y rendimiento

Los únicos datos publicados son bits por byte (bpb) sobre conjuntos de validación propios, con 60 batches aleatorios × 32 ventanas de 256 bytes (semilla 123), puntuando solo posiciones con al menos 128 bytes de contexto. La adivinación uniforme equivale a 8,0 bpb. Las columnas "gap @400" y "gap @1600" provienen de ejecuciones de control en RunPod (media sobre semillas, bpb scratch menos bpb fork; positivo indica que el fork de v6 es mejor) y describen la receta de entrenamiento, no estos ficheros exactos.

| Harness | Pasos | Base v6 bpb | Champion bpb | Gap @400 | Gap @1600 |
|---|---|---|---|---|---|
| ansi_escape | 338 | 9,691 | 1,003 | +0,149 | -0,021 |
| ansi_langs | 341 | 7,577 | 2,037 | +1,073 | +0,069 |
| ascii | 390 | 2,920 | 1,872 | +1,403 | +0,253 |
| brainfuck | 464 | 9,241 | 1,094 | -0,041 | -0,257 |
| c | 331 | 8,946 | 2,167 | +0,763 | +0,001 |
| cfamily | 337 | 8,345 | 2,082 | +0,859 | +0,124 |
| cpp | 432 | 8,255 | 1,681 | +0,972 | +0,014 |
| csharp | 417 | 7,832 | 1,411 | +0,817 | +0,052 |
| css | 376 | 7,233 | 0,437 | +1,021 | +0,028 |
| csv | 370 | 12,253 | 1,888 | +0,274 | -0,072 |
| edn | 367 | 8,031 | 1,318 | +0,307 | -0,005 |
| esoteric | 364 | 11,148 | 2,526 | -0,000 | -0,030 |
| go | 330 | 8,609 | 1,930 | +0,803 | +0,020 |
| haskell | 331 | 7,973 | 2,097 | +1,037 | -0,097 |
| html | 357 | 3,865 | 1,573 | +1,381 | +0,088 |
| ini | 372 | 9,249 | 1,262 | +0,305 | -0,118 |
| javascript | 344 | 7,774 | 2,104 | +0,831 | -0,093 |
| json | 386 | 7,866 | 0,927 | +0,415 | +0,002 |
| msgpack | 365 | 10,031 | 2,252 | -0,199 | -0,008 |
| php | 332 | 8,819 | 2,031 | +0,697 | -0,290 |
| ruby | 333 | 8,144 | 2,377 | +0,992 | -0,226 |
| rust | 343 | 8,106 | 1,954 | +0,875 | +0,010 |
| sql | 364 | 6,702 | 2,477 | +0,769 | +0,249 |
| toml | 376 | 8,958 | 1,083 | +0,336 | -0,086 |
| unicode | 389 | 9,578 | 3,078 | -0,373 | +0,295 |
| xml | 375 | 11,800 | 0,731 | +0,383 | +0,010 |
| yaml | 374 | 7,356 | 1,136 | +0,465 | -0,002 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB por checkpoint en fp32 (2,76 M de parámetros ≈ 11 MB de pesos); el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entrenó los checkpoints en una RTX 4060 Laptop. Para inferencia basta CPU.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en Raspberry Pi.
- Opciones de despliegue: carga directa con `safetensors` y la clase `GoldWormV6`/`ByteTransformer` del modelo base; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamaño, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos byte-level de escala similar en la información proporcionada. Como referencia estructural, el propio modelo base GoldWorm v6 (2,76 M de parámetros, contexto 256 bytes, licencia MIT) es el punto de partida de todos los harnesses, y los checkpoints "scratch" de las ejecuciones en RunPod serían el comparador natural, pero sus pesos no se conservaron.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| goldworm-v6-harnesses (este) | 2,76 M | 256 bytes | other (mixed-mit-and-gfdl-data) | 27 safetensors en HF |
| goldworm-v6 (base) | 2,76 M | 256 bytes | MIT | safetensors en HF |
| Alternativas byte-level comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelos extremadamente pequeños y subentrenados: solo ~400 pasos por harness; el autor los describe como "smoke tests, demos y plumbing de harness/IDE", no para uso real.
- La ventaja del fork frente a scratch es un adelanto que se desvanece: hacia 1600 pasos el gap es prácticamente cero y a 3200 pasos scratch supera al fork en rust, haskell y brainfuck.
- Conjuntos de validación regenerados después del entrenamiento (15:00 frente a 14:41–14:50): puede haber solapamiento entre bytes de entrenamiento y validación en ambos sentidos.
- Brainfuck: el val regenerado conserva un 17 % de solapamiento residual con train (partía de 61 %); el bpb de 1,09 sigue probablemente inflado.
- Formatos generados sintéticamente (json, yaml, toml, ini, xml, css, csv, edn, msgpack, ansi_escape, brainfuck): son repetitivos, por lo que los bpb bajos sobreestiman la habilidad real.
- Posibles duplicados a nivel de párrafo sin revisar en ascii, css, html y unicode.
- Conjuntos de validación pequeños: php (~30 KB), csv (~31 KB), ini (~33 KB), toml (~38 KB).
- Una sola semilla por checkpoint y cifras no revisadas de forma independiente.
- Licencia: la base es MIT, pero los datos de Rosetta Code están bajo GFDL 1.2, lo que puede imponer obligaciones a los modelos derivados; el repositorio se marca como `license: other`. La licencia del dataset de texto Unicode del harness `unicode` está sin confirmar. Verificar antes de cualquier uso comercial.
- Sin capacidades de instrucción, tool calling, agentes ni multimodalidad; no apto para atención al cliente, generación de código en producción ni tareas conversacionales.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6-harnesses
- Modelo base GoldWorm v6: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6
- Dataset Rosetta Code: https://huggingface.co/datasets/christopher/rosetta-code
- Licencia del repositorio: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6-harnesses/blob/main/LICENSE
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
