# zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF es una cuantización GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario zephel01. Se trata de una build podada (pruned) de tipo MoE en la que se conservan 256 de los 384 expertos por capa, seleccionados mediante conteo de routing medido sobre texto conversacional, matemáticas, tool-calling, código y multilingüe. El objetivo es reducir el peso desde los 275,8 GB de la versión sin podar hasta los 207,1 GB, de modo que el modelo pueda ejecutarse en un PC con GPU de 32 GB de VRAM y 96 GB de RAM, o incluso con 12 GB de VRAM y 128 GB de RAM.

El modelo base tiene 567.274.486.384 parámetros totales según los safetensors del repositorio original, y esta versión cuantizada emplea una mezcla de tipos IQ2_XXS (45 %), IQ1_S (30 %), IQ2_XS (14 %) e IQ2_S (11 %) en bytes para los expertos, con una media de 1,95 bits por peso. La tabla Engram se recuantiza a IQ4_NL. La licencia es MIT y el modelo está pensado para inferencia local en hardware de consumo, con soporte para llama.cpp y el motor Abyss del propio autor.

Es relevante porque demuestra una técnica de poda selectiva de expertos guiada por routing real, en lugar de poda por código exclusivamente, preservando capacidades multilingües (japonés, chino, inglés) que otras selecciones centradas en código pierden. El autor lo marca explícitamente como BETA, medido en un único PC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, con tabla Engram |
| Parametros totales | 567.274.486.384 (modelo base); esta build conserva 256 de 384 expertos por capa |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: IQ2_XXS 45 %, IQ1_S 30 %, IQ2_XS 14 %, IQ2_S 11 % (expertos, por bytes); Engram en IQ4_NL; media 1,95 bits/peso |
| Idiomas soportados | en, ja (según tags); el autor reporta también chino en la selección de expertos |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos por capa, del que esta build conserva 256 por capa. La selección de expertos se realizó mediante conteo de routing medido sobre seis dominios (japonés, chino, inglés, código, matemáticas y tool-calls), con igual peso para cada dominio. Los expertos, routers y sesgos de router provienen de la cuantización LDLQ 132G del mismo autor y se han rebanado byte a byte a los 256 expertos conservados por capa (expert_count = 256), sin recuantizar. La tabla Engram se recuantizó a IQ4_NL desde la tabla FP8 de la versión UD-Q4_K_XL de unsloth, con un error RMS relativo de 0,075 frente a 0,076 de la tabla IQ4_NL de ISTA en las mismas filas.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base. La innovación técnica destacable es la poda selectiva de expertos guiada por routing real (no por código exclusivamente), que preserva el 95 % de las rutas en japonés, 94 % en chino, 94 % en matemáticas, 94 % en tools, 91 % en inglés y 84 % en código. La tabla Engram se lee desde SSD unas pocas filas a la vez y no necesita caber en RAM.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (dominio preservado al 94 % de rutas).
- Generación de código (dominio preservado al 84 % de rutas, comparable al 82 % del Coder de ISTA).
- Tool calling / function calling (94 % de rutas preservadas).
- Capacidades multilingües: inglés, japonés y chino (el autor reporta que responde correctamente a prompts en japonés, a diferencia del Coder de ISTA que respondió en chino).
- Ejecución local en hardware de consumo con offload de CPU.
- No se reporta soporte de visión en esta build (el autor indica que la entrada de imagen no está en sus conteos y puede degradarse más).

## Casos de uso

- Asistente conversacional local en japonés, chino e inglés: el modelo conserva el 95 % de las rutas en japonés y el 94 % en chino, por lo que puede mantener conversaciones multi-turno en estos idiomas en un PC con 32 GB de VRAM y 96 GB de RAM.
- Generación de código en producción: con el 84 % de rutas de código preservadas y soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletado, revisión de parches y generación de tests.
- Automatización de tool calling y agentes: el 94 % de rutas de tools preservadas permite construir agentes que invocan APIs y ejecutan pasos múltiples en local.
- Razonamiento matemático y resolución de problemas: el 94 % de rutas de matemáticas preservadas lo hace adecuado para tutoría o verificación de cálculos en entornos sin conexión.
- Despliegue en estaciones de trabajo con GPU de 12 GB y 128 GB de RAM: el autor indica que esta build también está pensada para ese perfil, lo que permite inferencia local en equipos de gama media-alta.
- Procesamiento de documentación multilingüe: al conservar rutas en inglés, japonés y chino, puede usarse para resumen y extracción de información en corpus mixtos.
- Experimentación e investigación en cuantización y poda de MoE: la build sirve como referencia reproducible para estudiar el impacto de la poda selectiva de expertos en calidad y velocidad.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Modelo | Expertos/capa | Descarga | KL (8 seqs) | Mismo top token | Decode, 3 tareas de código | Japonés |
|---|---:|---:|---:|---:|---:|---|
| JA256 (este repo) | 256 / 384 | 207,1 GB | 0,383 | 75,2 % | 87,0 tok/s | OK |
| LDLQ 132G | 384 / 384 | 275,8 GB | 0,194 | 81,1 % | 67,5 tok/s | OK |
| LDLQ 139G | 384 / 384 | 283,0 GB | 0,182 | 81,6 % | 57,9 tok/s | OK |
| ISTA GSQ-RCO Coder (referencia) | 192 / 384 | 182,7 GB | 0,582 | 69,3 % | 97,0 tok/s | Chino |
| ISTA GSQ-RCO IQ2_XXS (referencia) | 384 / 384 | ~249 GB | 0,314 | 76,8 % | - | - |

El dato de 87,0 tok/s corresponde a una RTX 5090 de 32 GB con el tier de RAM limitado a 60 GB (`STRATA_GLM_RAM_GB=60`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM con 96 GB de RAM como configuración objetivo principal; también funciona con 12 GB de VRAM y 128 GB de RAM.
- GPU recomendadas: RTX 5090 (32 GB) es la única medida por el autor; no se reportan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB; el autor invita a reportar resultados en otras GPU.
- Opciones de despliegue: llama.cpp y el motor Abyss del autor (https://github.com/zephel01/Abyss).
- Latencia y throughput: 87,0 tok/s en decode sobre 3 tareas de código en RTX 5090 con RAM limitada a 60 GB. No se reportan latencias de prefill ni throughput en otras configuraciones.
- Almacenamiento: 207,1 GB de descarga; la tabla Engram (110,6 GB en el shard 6) se lee desde SSD fila a fila y no necesita caber en RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos/capa | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| JA256 (este repo) | 567,3 B (base) | 256 / 384 | no disponible | MIT | Hugging Face | 207,1 GB, 87,0 tok/s, japonés OK |
| LDLQ 132G (mismo autor) | 567,3 B (base) | 384 / 384 | no disponible | MIT | Hugging Face | 275,8 GB, 67,5 tok/s, KL 0,194 |
| LDLQ 139G (mismo autor) | 567,3 B (base) | 384 / 384 | no disponible | MIT | Hugging Face | 283,0 GB, 57,9 tok/s, KL 0,182 |
| ISTA GSQ-RCO Coder | 567,3 B (base) | 192 / 384 | no disponible | no disponible | Hugging Face | 182,7 GB, 97,0 tok/s, solo código en inglés, falla en japonés |
| ISTA GSQ-RCO IQ2_XXS | 567,3 B (base) | 384 / 384 | no disponible | no disponible | Hugging Face | ~249 GB, KL 0,314 |

## Limitaciones y advertencias

- Build marcada como BETA por el autor: medida en un único PC (RTX 5090 32 GB, RAM limitada a 60 GB); no hay validación en otras GPU o tamaños de RAM.
- Poda de 128 de 384 expertos por capa: el texto en los seis dominios pierde entre un 5 % y un 16 % de rutas hacia los siguientes mejores expertos; dominios fuera de esos seis (otros idiomas, dominios raros, entrada de imagen) pueden perder más.
- KL más alto que las versiones sin podar (0,383 frente a 0,194/0,182): el autor advierte que el trabajo largo y cuidadoso deriva más.
- Riesgo de alucinación: no se reportan evaluaciones específicas de factualidad en la información disponible.
- Idiomas: los tags solo declaran en y ja; el chino se menciona en la selección de expertos pero no está declarado como idioma soportado. Otros idiomas (coreano, lenguas europeas) pueden degradarse.
- Visión: la entrada de imagen no está en los conteos del autor y puede degradarse más que el texto.
- La cuantización mezcla varios tipos (IQ2_XXS, IQ1_S, IQ2_XS, IQ2_S), por lo que no es un quant estándar de llama.cpp con ese nombre.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo base es de DeepSeek; esta build es una cuantización de terceros (zephel01), no oficial de DeepSeek.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Versión sin podar LDLQ 132G / 139G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- trench-gguf: https://github.com/zephel01/trench-gguf
- Reportar resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4.1+Compact-JA256+on+YOUR_GPU
- ISTA-DASLab GSQ-RCO Coder (referencia): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
