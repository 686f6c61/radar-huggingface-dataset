# Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-QKV8-Down8

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-QKV8-Down8 es una exportación cuantizada de Qwen/Qwen2.5-14B-Instruct, el modelo de lenguaje denso de 14.770 millones de parámetros desarrollado por Alibaba Qwen. La particularidad de esta versión es que sus capas lineales se han convertido a los formatos de bloque de coma flotante que consumen las NPU Tensix de Tenstorrent (Wormhole y Blackhole): `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8). El resultado es un checkpoint de 13,13 GB empaquetado con una media de 7,11 bits por peso, frente a los 29,54 GB del BF16 original.

El problema que resuelve es la brecha entre el ecosistema de pesos estándar (safetensors en bf16) y el hardware de aceleración de Tenstorrent, que espera matrices ya alineadas a su rejilla de exponente compartido por bloque. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. Esto permite cargar el modelo en una NPU Tensix con aproximadamente 13,13 GB de memoria de dispositivo solo para los pesos, más espacio para la caché KV y los búferes.

Es relevante ahora porque el ecosistema Tenstorrent (tt-metal, ttNN, tt-forge) está madurando y escasean los checkpoints de modelos conversacionales de tamaño medio listos para sus aceleradores. Esta exportación cubre ese hueco con un modelo base Apache 2.0 ampliamente conocido, aunque el autor advierte que tt-transformers y tt-forge no se han ejecutado con este checkpoint y que la validación se hizo con el simulador ttsim (ttnn 0.81.1), no con silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2), capas lineales cuantizadas a formatos de bloque BFP4/BFP8 para Tensix |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-14B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) con GPTQ y busqueda de exponente por bloque; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) con redondeo al mas cercano; media de 7,11 bits/peso |
| Idiomas soportados | en (segun la model card; el calibrado incluyo texto en coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (matrices bf16 almacenadas sobre rejilla BFP4/BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con 48 capas, atención por múltiples cabezas con consultas agrupadas (GQA) y las innovaciones habituales de la familia Qwen2.5 (RoPE, RMSNorm, activación SwiGLU en el MLP). No hay mezcla de expertos ni capas recurrentes; el modelo es denso y todos los parámetros participan en cada token. Sobre esa base, Xylolabs aplica una política de cuantización diferenciada por tipo de proyección, documentada en el fichero `quant4.json`.

El esquema de precisión mixta es el siguiente: las proyecciones q, k y v de atención (48 capas) se guardan en `bfloat8_b` con 8,5 bits por peso; las proyecciones o de atención y gate/up del MLP (48 capas) en `bfloat4_b` con 4,5 bits por peso; la proyección down del MLP (48 capas) vuelve a `bfloat8_b`; y el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16 como en el modelo base. Las matrices BFP4 se cuantizaron con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano; las BFP8 se obtuvieron por redondeo al más cercano. El autor no documenta en esta ficha el proceso de entrenamiento original de Qwen2.5-14B-Instruct (número de tokens, composición del corpus, RLHF/DPO); esa información corresponde a la model card del modelo base.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: las matrices cuantizadas se almacenan como valores bf16 posicionados exactamente sobre la rejilla BFP, de forma que TT-NN las lee y las empaqueta sin transformación numérica adicional. El autor proporciona dos scripts de verificación, `pack_tensix.py` (comprueba cada matriz, con opción `--device` para hacer round-trip por DRAM del dispositivo) y `verify_grid.py` (valida la rejilla solo con torch), y afirma que los mismos valores también empaquetan de forma exacta en `ttnn.bfloat8_b`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y soporte de `text-generation-inference` y endpoints compatibles.
- Razonamiento y respuesta a preguntas de cultura general, con resultados verificados en 33 prompts cortos con comprobación automática (32 de 33 correctos frente a 31 de 33 del BF16).
- Capacidades heredadas de Qwen2.5-14B-Instruct: generación de código, matemáticas, instrucciones y tool calling; no se detallan ni se validan específicamente en esta exportación.
- Capacidades multilingües: la model card declara únicamente `en`; el calibrado incluyó coreano, pero no se documenta un soporte multilingüe verificado.
- No se documentan capacidades de visión, audio, modo thinking explícito ni agentes multi-paso en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para que TT-NN lo cargue directamente en DRAM de dispositivo, con 13,13 GB de pesos más caché KV y búferes; es el escenario para el que se construyó y el único validado por el autor (sobre el simulador ttsim).
- Investigación en cuantización de bloques: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a BFP8 con redondeo en un transformer de 14B, con métricas de KL y top-1 publicadas frente a BF16 y Q4_K_M.
- Evaluación de pipelines TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar el empaquetado de cada matriz y la rejilla de exponentes antes de integrar el modelo en un flujo de inferencia mayor.
- Generación de texto conversacional en inglés: al conservar el LM head, embeddings y normas en bf16, mantiene la calidad del modelo base en tareas de chat simples, con una pérdida de 0 respuestas correctas respecto a BF16 en el conjunto de 33 prompts.
- Base para comparativas de precisión efectiva: el autor publica una comparación directa con Q4_K_M de llama.cpp (4,87 bits/peso, 8,988 GB) que permite decidir entre ambas rutas según el hardware objetivo.
- Prototipado en entornos con memoria limitada: 13,13 GB empaquetados frente a 29,54 GB en BF16 reducen el requisito de memoria de dispositivo a menos de la mitad, lo que facilita pruebas en aceleradores con DRAM moderada.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea. La evaluación cubre 16.104 posiciones de texto en inglés y coreano (WikiText-2 test, Wikipedia en coreano), en formato plano y con plantilla de chat, más 33 prompts cortos con comprobación automática.

| Modelo | Bits/peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4 QKV8 Down8) | 7,11 | 13,127 | 0,10933 | 89,83 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

El criterio de aceptación declarado por el autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida más. El resultado es 1,18 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 1. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `317c0c798f81364660aee3819ba3eb35652c9d2b5c78908c408d36f2d9fe2743`. No se publican datos de velocidad, latencia ni throughput.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 13,13 GB solo para los pesos del modelo de lenguaje, más espacio adicional para la caché KV y los búferes de inferencia.
- Hardware objetivo: NPU Tenstorrent Tensix, familias Wormhole y Blackhole.
- Validación: realizada con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; no se reporta ejecución en silicio real.
- GPU consumer: no es el objetivo del checkpoint; la carga con `transformers` en bf16 requeriría del orden de 29,5 GB de VRAM, fuera del alcance de GPUs consumer habituales.
- Opciones de despliegue: TT-NN (empaquetado en DRAM de dispositivo), `transformers` con `device_map="auto"` para inspección o uso en GPU, y `text-generation-inference` por los tags del repositorio; tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4 QKV8 Down8) | 14,77B | no disponible | BFP4/BFP8 mixta, 7,11 bits/peso | 13,127 GB | Apache 2.0 | Hugging Face, validado en ttsim |
| Qwen/Qwen2.5-14B-Instruct (BF16) | 14,77B | no disponible | bf16, 16 bits/peso | 29,54 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo base) | 14,77B | no disponible | GGUF Q4_K_M, 4,87 bits/peso | 8,988 GB | Apache 2.0 | Generado por el autor, sha256 publicado |

No se dispone de datos de otros checkpoints comparables para Tensix en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está pensado para NPU Tensix; cargarlo en GPU o CPU con `transformers` no aprovecha el empaquetado BFP y exige ~29,5 GB en bf16.
- La validación se hizo sobre el simulador ttsim con ttnn 0.81.1, no sobre silicio Wormhole o Blackhole real; el rendimiento y la corrección en hardware físico no están confirmados.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, según el propio autor.
- La model card declara solo inglés como idioma soportado; el calibrado incluyó coreano, pero no hay evaluación de calidad multilingüe más allá de KL y top-1.
- Los benchmarks publicados miden cercanía a BF16 (KL, top-1, 33 prompts), no calidad de tarea en código, matemáticas o razonamiento; no deben interpretarse como rendimiento absoluto.
- Pérdida de fidelidad medible: KL medio de 0,10933 y top-1 del 89,83 % frente a BF16, con 0 respuestas perdidas en el conjunto de 33 prompts.
- No se publican datos de latencia, throughput ni consumo energético en Tensix.
- Riesgo de alucinación y sesgos: heredados de Qwen2.5-14B-Instruct; no se documentan evaluaciones de sesgo en esta exportación.
- Licencia Apache 2.0, igual que el modelo base; los cambios se listan en `NOTICE` y los scripts de verificación se distribuyen con el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-QKV8-Down8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia Qwen2 (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-QKV8-Down8/blob/main/LICENSE
