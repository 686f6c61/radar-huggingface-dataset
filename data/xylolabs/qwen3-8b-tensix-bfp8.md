# Xylolabs/Qwen3-8B-Tensix-BFP8

## Resumen

Xylolabs/Qwen3-8B-Tensix-BFP8 es una cuantización del modelo Qwen3-8B de Alibaba Qwen, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint de 8.190.735.360 parámetros (8,19 mil millones) en el que las capas lineales de atención y MLP se han redondeado a la rejilla de coma flotante por bloques `ttnn.bfloat8_b` (BFP8) mediante GPTQ, de modo que el runtime TT-NN puede empaquetar los pesos sin volver a redondearlos.

La relevancia del checkpoint es de infraestructura más que de modelado: el ecosistema de Tenstorrent (tt-metal, TT-NN, tt-forge) trabaja con formatos propietarios de bloque (bfloat8_b, bfloat4_b) y un checkpoint estándar en bf16 obliga a una conversión en tiempo de carga que introduce error. Aquí los tensores ya están alineados a esa rejilla, con un coste medio de 9,64 bits por peso y un tamaño empaquetado de 9,87 GB frente a los 16,38 GB del modelo base.

El modelo conserva todas las capacidades del Qwen3-8B original (generación de texto, razonamiento con modo thinking, código, matemáticas y soporte multilingüe), con una licencia Apache 2.0 heredada. El autor advierte de que las pruebas se han realizado sobre el simulador ttsim de Blackhole con ttnn 0.81.1 y no sobre hardware físico, y que la integración con tt-forge aún no se ha ejecutado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas; pesos lineales cuantizados a BFP8 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q/k/v/o y gate/up/down de las 36 capas; bf16 en LM head, embeddings y normas; media de 9,64 bits por peso |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingüe; el calibrado GPTQ usó WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a la rejilla BFP8); incluye `quant4.json` con el formato por proyección |
| Tamano del repo | 16,4 GB (9,87 GB empaquetados en dispositivo) |
| Modelo base | Qwen/Qwen3-8B |
| Fecha de publicacion | 2026-11-11 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento (PTQ) del Qwen3-8B, un transformer denso de 36 capas con atención completa y mecanismo de razonamiento opcional (thinking mode). No hay reentrenamiento ni ajuste fino: el proceso aplica GPTQ para redondear cada matriz de proyección a la rejilla `bfloat8_b` de TT-NN, donde cada bloque de valores comparte un exponente. Las matrices afectadas son las proyecciones de atención q, k, v y o, y las de MLP gate, up y down, en las 36 capas; el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16 como en el modelo base.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado se almacena en safetensors en bf16, pero cada valor ya ocupa un punto exacto de la rejilla BFP8, de forma que el empaquetado posterior por TT-NN es una operación sin pérdida adicional. El repositorio incluye las herramientas `pack_tensix.py` (verifica matriz a matriz que el empaquetado no altera valores, opcionalmente con round-trip por DRAM del dispositivo) y `verify_grid.py` (comprueba la rejilla solo con PyTorch). La validación se hizo con ttnn 0.81.1 sobre ttsim; con tt-transformers y la opción `--use_hf_rope`, el prefill de las dos primeras capas coincidió con transformers con un PCC de 0.9990.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento explícito con modo thinking, heredado del Qwen3-8B base.
- Generación de código y resolución de problemas matemáticos, según las capacidades del modelo original.
- Soporte multilingüe del modelo base (el calibrado incluyó texto en inglés y coreano).
- Inferencia sobre NPU Tensix de Tenstorrent mediante TT-NN y tt-transformers, con pesos ya empaquetables sin re-redondeo.
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference (según los tags del repositorio).
- No se documentan en la información disponible capacidades de visión, audio, tool calling o uso agéntico específicas de este checkpoint; deben asumirse las del Qwen3-8B base, no verificadas aquí.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está pensado para cargarse en NPU Wormhole o Blackhole con TT-NN, evitando la conversión a BFP8 en tiempo de carga y el error de redondeo asociado; es el escenario principal del repositorio.
- Servicio de chat en producción sobre aceleradores Tensix: al conservar el 98,68 % de top-1 respecto a bf16 y no perder ninguna respuesta en la evaluación del autor, es adecuado para asistentes conversacionales donde el coste por token en NPU importa.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de BFP8 frente a Q4_K_M (KL de 0,00100 frente a 0,04236 en la evaluación publicada) en pipelines de inferencia de bajo nivel.
- Prototipado en el simulador ttsim: permite validar kernels y grafos de TT-NN con un modelo de 8B real antes de disponer de hardware, usando `pack_tensix.py` para comprobar la integridad del empaquetado.
- Generación de código asistida en entornos con presupuesto de memoria ajustado: los 9,87 GB empaquetados frente a 16,38 GB en bf16 reducen la huella en DRAM del dispositivo.
- Investigación en formatos de coma flotante por bloques: el repo expone `quant4.json` con el formato de cada proyección y scripts de verificación, útil para estudiar el efecto del redondeo BFP8 por capa.
- Razonamiento con modo thinking en tareas de análisis: las 7 pruebas de razonamiento del autor se respondieron correctamente tanto con thinking activado como sin él.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación propia, no benchmarks estándar como MMLU o HumanEval):

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B) | 16 | 16,38 | 0 | 100 | 38 de 40 | - |
| **Este modelo (BFP8)** | 9,64 | 9,870 | 0,00100 | 98,68 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,90 | 5,028 | 0,04236 | 91,24 | 38 de 40 | 0 |

La KL y el top-1 se calculan sobre 16.240 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 9,87 GB empaquetados en BFP8; el repositorio en disco ocupa 16,4 GB en safetensors bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). Validado únicamente sobre el simulador ttsim de Blackhole con ttnn 0.81.1, no sobre silicio real.
- GPU consumer: no es el objetivo del checkpoint; en una GPU estándar se cargaría como un modelo bf16 de 8B (aproximadamente 16 GB en bf16, o menos con cuantización adicional no incluida aquí). No se documenta soporte verificado en RTX 4090 u otras GPU consumer.
- Despliegue: TT-NN/tt-metal v0.81.1 con tt-transformers (requiere `--use_hf_rope`), transformers con `device_map="auto"`, y text-generation-inference según los tags. tt-forge (tt-xla) aún no se ha probado con este checkpoint; por defecto mantiene bf16 y sus opciones `bfp_bf8`/`bfp_bf4` re-redondean los valores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Tensix-BFP8 | 8,19B | no disponible | BFP8 (9,64 bits/peso) | 0,00100 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-8B (BF16) | 8,19B | no disponible | bf16 | 0 (referencia) | Apache 2.0 | Hugging Face |
| Qwen3-8B Q4_K_M (llama.cpp) | 8,19B | no disponible | Q4_K_M (4,90 bits/peso) | 0,04236 | Apache 2.0 | Generable localmente con llama.cpp |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la información disponible no incluye otros modelos de 8B comparables. Frente a Q4_K_M, este checkpoint ocupa casi el doble de espacio pero reduce la divergencia KL en más de un orden de magnitud y recupera 7,44 puntos de top-1.

## Limitaciones y advertencias

- No validado en hardware Tensix real: todas las pruebas se hicieron sobre el simulador ttsim; el rendimiento y la corrección en Wormhole o Blackhole físico no están verificados.
- Integración con tt-forge no ejecutada con este checkpoint; sus opciones de empaquetado re-redondean los pesos y pueden alterar los valores.
- En tt-transformers, el demo empaqueta el LM head en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en esa ruta; es necesario usar `--use_hf_rope` para evitar la permutación de filas q/k y el re-redondeo del QKV fusionado.
- Sesgos: no documentados en la información proporcionada; hereda los del Qwen3-8B base.
- Riesgo de alucinación: inherente al modelo base; la cuantización no lo elimina y la evaluación publicada solo cubre 40 prompts cortos.
- Idiomas: la evaluación se limita a inglés y coreano; el comportamiento en castellano no está medido.
- Longitud de contexto: no especificada en la información disponible para este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre hardware no probado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, con soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de referencia del modelo base (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-Tensix-BFP8/blob/main/LICENSE
