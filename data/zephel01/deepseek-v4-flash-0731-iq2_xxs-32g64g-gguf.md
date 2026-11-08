# zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF

## Resumen

DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF es una cuantizacion GGUF del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario zephel01 bajo licencia MIT. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 284.334.567.511 parametros totales. Esta version concreta, etiquetada como L72, esta disenada para ejecutarse en un unico equipo con una GPU de 32 GB de VRAM (RTX 5090, AI PRO R9700) y 64 GB de RAM, manteniendo los 256 expertos enrutados de cada capa sin poda.

La relevancia de esta ficha reside en su enfoque de empaquetado: frente a cuantizaciones de referencia como unsloth UD-Q2_K_XL (96,8 GB), que no caben en el hardware objetivo y obligan a leer desde SSD en cada token, este archivo de 72,0 GB si cabe y ofrece una velocidad de decodificacion notablemente superior (90,0 tok/s frente a 33,4 tok/s con prompt de 4K, segun el autor). El precio es una mayor divergencia respecto a los pesos originales (KL de 0,314 frente a 0,186).

Se trata de una version BETA, medida en un solo equipo hasta la fecha, con soporte declarado para japones e ingles, y orientada a inferencia local en consumer GPU con offload parcial a CPU. El modelo base es de noviembre de 2026 y esta pensado para generacion de texto conversacional, codigo y uso con herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 256 expertos enrutados por capa |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado con prompts de 4K, 16K y needle de 8K-31K) |
| Tipos de cuantizacion | GGUF mixta: expertos IQ1_S 54%, IQ2_S 37%, IQ3_XXS 9% (por bytes); 1,92 bits por peso de media; attention Q5_K; resto heredado de UD-Q2_K_XL |
| Idiomas soportados | japones e ingles (declarados en la model card); lista oficial de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 72,0 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer con arquitectura Mixture of Experts: cada capa contiene 256 expertos enrutados y esta cuantizacion conserva todos ellos, sin poda. Los pesos originales de los expertos estan en formato MXFP4. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el proceso de cuantizacion. Los expertos se recuantizaron con LDLQ (LDLQ quantization) a partir de la version UD-Q8_K_XL de unsloth, usando un volcado de Hessian generado con respuestas de chat del propio V4 (241 prompts, 104 de ellos en japones) mas texto general, y una imatrix propia. Las capas de atencion `attn_q_b`, `attn_output_a` y `attn_output_b` se cuantizaron a Q5_K; el resto de tensores se heredan de los bytes de UD-Q2_K_XL de unsloth. El primer shard (solo metadatos, 5 MB) es el archivo de unsloth sin modificar. El autor menciona un drafter DSpark para decodificacion especulativa, pero no se midio a este tamano y en la variante 32G96G ralentizaba la decodificacion al consumir unos 6,5 GB de VRAM, por lo que recomienda arrancar sin el (`--no-dspark`).

## Capacidades

- Generacion de texto conversacional multi-turno: la model card reporta una prueba de conversacion de 11 turnos superada.
- Generacion de codigo: 5 de 5 tareas de codigo con tests superadas en las pruebas del autor.
- Uso de herramientas (tool calling): incluido en la bateria de verificacion `--check` de Abyss (11 de 11 pruebas superadas).
- Recuperacion en contexto largo: prueba needle superada con ventanas de 8K a 31K tokens.
- Capacidades multilingues: japones e ingles; se observa deriva ocasional del japones al chino en las respuestas (el contenido sigue siendo correcto).
- Razonamiento multi-paso y uso como agente: no documentado explicitamente en la informacion disponible.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estacion de trabajo con RTX 5090: el archivo de 72,0 GB cabe en 32 GB de VRAM mas 64 GB de RAM, lo que permite ejecutar un MoE de 284B parametros sin depender del SSD en cada token y obtener del orden de 86-90 tok/s en las condiciones medidas por el autor.
- Asistente de codigo en local: las pruebas del autor muestran 5 de 5 tareas de codigo con tests superadas; el modelo puede integrarse en un flujo de desarrollo sin enviar codigo propietario a la nube, con licencia MIT.
- Atencion conversacional en japones: el modelo mantiene el idioma en 9 de 10 respuestas segun la model card; para produccion conviene fijar la instruccion "日本語で答えてください。" en el system prompt, ya que reduce la deriva al chino.
- Procesamiento de documentos largos: con needles encontrados en ventanas de 8K a 31K tokens, es adecuado para resumen y question answering sobre documentos extensos en una sola pasada.
- Agentes con tool calling: la prueba de tool call del banco `--check` de Abyss se supera, lo que habilita flujos de automatizacion que consultan APIs o ejecutan funciones externas.
- Laboratorio de evaluacion de cuantizaciones: al ser una build BETA con metricas KL publicadas y comparacion contra la referencia de unsloth, sirve para estudiar el compromiso entre tamano, velocidad y fidelidad en MoE de gran escala sobre hardware de consumo.
- Despliegue en equipos con 96 GB de RAM o mas: el autor recomienda en ese caso la variante L97 (32G96G, 96,8 GB), con mejor calidad (KL 0,150), por lo que este archivo queda para el perfil estricto de 32 GB de VRAM y 64 GB de RAM.

## Benchmarks y rendimiento

Metricas publicadas por el autor (KL frente a unsloth UD-Q8_K_XL, 12 secuencias de 1.024 tokens; velocidad en Abyss v1.3.120 sobre RTX 5090 + Ryzen AI Max+ 395 con limites de 32G64G):

| Metrica | L72 (esta ficha) | unsloth UD-Q2_K_XL | L97 (32G96G) |
|---|---|---|---|
| Tamano | 72,0 GB | 96,8 GB | 96,8 GB |
| KL (12 secuencias) | 0,314 | 0,186 | 0,150 |
| KL, japones (3) | 0,331 | 0,219 | 0,145 |
| Mismo token top | 76,9% | 81,5% | 84,1% |
| Velocidad, prompt 4K | 90,0 tok/s | 33,4 tok/s | no disponible |
| Velocidad, prompt 16K | 86,4 tok/s | 34,0 tok/s | no disponible |
| Abyss `--check` | 11/11 | 11/11 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 32 GB para la GPU; el resto del modelo se reparte en RAM del sistema (objetivo de 64 GB).
- GPU objetivo: RTX 5090 (32 GB) o AI PRO R9700; el autor indica que la velocidad depende de que el archivo quepa integramente en VRAM mas RAM.
- RAM: 64 GB como minimo para este archivo; con 96 GB o mas conviene la variante L97 de mayor calidad.
- Almacenamiento: 72,0 GB para los 3 shards mas el espacio de trabajo; se recomienda SSD, ya que si el archivo no cabe se produce lectura desde disco en cada token (caso de UD-Q2_K_XL, 33,4 tok/s).
- Consumer GPU: si, en RTX 5090 de 32 GB; no cabe en GPUs de 24 GB o menos sin offload adicional.
- Despliegue: motor Abyss v1.3.120 o superior, con empaquetado previo mediante `tools/iq_pack.py --compat-bf16` y `--glm-pack` en la configuracion. llama.cpp no ha sido verificado por el autor.
- Latencia y throughput: 90,0 tok/s con prompt de 4K y 86,4 tok/s con prompt de 16K, temperatura 0, 512 tokens generados, mediana de 3 ejecuciones, en un equipo con RAM LPDDR5X (unas 3 veces mas rapida que DDR5 de sobremesa); en un PC convencional se esperan cifras inferiores.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Calidad (KL) | Velocidad medida | Licencia |
|---|---|---|---|---|---|---|
| Esta ficha (L72, 32G64G) | 284B totales | 72,0 GB | no disponible | 0,314 | 90,0 tok/s (4K) | MIT |
| unsloth UD-Q2_K_XL | 284B totales | 96,8 GB | no disponible | 0,186 | 33,4 tok/s (4K) | MIT |
| zephel01 L97 (32G96G) | 284B totales | 96,8 GB | no disponible | 0,150 | no disponible | MIT |
| GaelicThunder ds4-IQ2XXS | 284B totales | no disponible | no disponible | no disponible | no disponible | no disponible |

Las tres primeras variantes comparten modelo base y licencia; difieren en tamano, fidelidad y encaje en hardware. La variante de GaelicThunder esta orientada al motor ds4 sobre una caja GB10 de 128 GB (DGX Spark / ASUS Ascent GX10), un perfil de hardware distinto.

## Limitaciones y advertencias

- Version BETA: medida en un unico equipo y con la RAM limitada al equivalente de un PC de 64 GB; el autor advierte que el archivo puede sustituirse por una build mejor.
- Perdida de fidelidad: el KL de 0,314 es casi el doble que el de UD-Q2_K_XL (0,186) y el porcentaje de mismo token top baja al 76,9% frente al 81,5%.
- Deriva de idioma: el modelo base a veces responde en chino a preguntas en japones; los pesos originales lo hacen en 6 de 24 respuestas y esta cuantizacion hereda el comportamiento. Mitigable con instruccion explicita en el system prompt.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; las pruebas del autor reportan 0 hechos erroneos en 10 respuestas japonesas, pero la muestra es pequena.
- Contexto maximo: no declarado; las pruebas cubren hasta 31K tokens, sin garantia mas alla.
- Rendimiento dependiente del hardware: las cifras de 90 tok/s se obtuvieron con RAM LPDDR5X; en DDR5 convencional se esperan valores menores.
- Compatibilidad de motores: solo verificado con Abyss; llama.cpp no comprobado. Requiere empaquetado previo con `iq_pack.py`.
- El drafter DSpark no debe usarse a este tamano (consume unos 6,5 GB de VRAM y ralentiza).
- Licencia MIT: permite uso comercial, pero al ser una cuantizacion de pesos de terceros conviene conservar la atribucion a DeepSeek y a unsloth.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- GGUFs de origen (unsloth): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Variante 32G96G (L97): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante 16G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramienta de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Variante ds4-IQ2XXS para GB10: https://huggingface.co/GaelicThunder/DeepSeek-V4-Flash-0731-ds4-IQ2XXS-GGUF
