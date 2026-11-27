# Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix

## Resumen

Granite 3.3 8B Base para Tenstorrent Tensix es una cuantizacion del modelo base `ibm-granite/granite-3.3-8b-base` de IBM, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El objetivo no es otro que permitir ejecutar un transformer de 8.000 millones de parametros en hardware de aceleracion dedicado, usando los formatos de coma flotante por bloques (block-floating-point) que soportan nativamente estas unidades: `bfloat8_b` y `bfloat4_b`.

El repositorio agrupa dos variantes de cuantizacion en carpetas separadas (`bfp8/` y `bfp4/`), cada una con sus pesos empaquetados y metadatos de cuantizacion por capa en formato JSON. La variante BFP8 ocupa 8,871 GB empaquetados y mantiene una divergencia KL media de 0,00103 frente a BF16, mientras que la BFP4 baja a 4,886 GB con una KL media de 0,05429, comparable a la de una cuantizacion Q4_K_M de llama.cpp (0,05298).

Es relevante porque demuestra un flujo de cuantizacion especifico para aceleradores no-GPU (Tenstorrent) sobre un modelo abierto con licencia Apache 2.0, e incluye herramientas de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) para validar el round-trip de los tensores en `ttnn`. El modelo base es de tipo decoder-only, 8B parametros, solo texto y solo ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de ibm-granite/granite-3.3-8b-base); pesos cuantizados en block-floating-point para Tensix |
| Parametros totales | 8B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat8_b (BFP8) y bfloat4_b (BFP4) en atencion y MLP; resto en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con index JSON y metadatos `quant4.json`); orientado a `ttnn` |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del checkpoint `ibm-granite/granite-3.3-8b-base`. No se ha reentrenado: se aplica una cuantizacion de punto flotante por bloques (block-floating-point, BFP) sobre las matrices de atencion y MLP, dejando el resto de tensores en bf16. Cada carpeta incluye un fichero `quant4.json` que describe el formato asignado a cada capa y submodulo (`layers.N.mlp.down_proj`, etc.), de modo que el runtime de Tenstorrent pueda materializar los tensores con el dtype correcto (`ttnn.bfloat8_b` o `ttnn.bfloat4_b`).

La innovacion tecnica principal es el empaquetado nativo para la malla Tensix: los pesos se transpone y se convierten a `TILE_LAYOUT` en DRAM del dispositivo, y se incluyen scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que el round-trip `ttnn.to_torch` reproduce los valores originales. No hay informacion sobre datos de entrenamiento, numero de tokens, RLHF/DPO ni decodificacion especulativa en la model card; esos detalles corresponden al modelo base de IBM y no se reproducen aqui.

## Capacidades

- Generacion de texto autoregresiva (modelo base, sin plantilla de chat; continua texto en lugar de mantener conversacion).
- Razonamiento y conocimiento general heredados del checkpoint Granite 3.3 8B.
- Generacion de codigo y matematicas (capacidad del modelo base, no reentrenada).
- Capacidades multilingues limitadas al ingles segun la model card (`language: en`).
- No dispone de tool calling, function calling ni modo agente propio: es un modelo base, no instruct.
- No soporta vision ni audio.
- No incluye modo "thinking" ni cadena de razonamiento explicita.
- Ejecutable en NPU Tenstorrent Wormhole y Blackhole mediante `ttnn`; tambien cargable en `transformers` con `dtype="bfloat16"` y `device_map="auto"`.

## Casos de uso

- Inferencia en hardware Tenstorrent: desplegar el modelo en NPU Wormhole o Blackhole usando `ttnn`, aprovechando el formato BFP8 para minimizar el uso de DRAM (8,871 GB empaquetados) y maximizar el throughput en la malla Tensix.
- Prototipado de cuantizacion BFP: usar `pack_tensix.py` y `verify_grid.py` como referencia para validar flujos de empaquetado de otros modelos sobre Tensix, comprobando la fidelidad del round-trip tensor a tensor.
- Evaluacion de degradacion por cuantizacion: comparar la KL media (0,00103 para BFP8 y 0,05429 para BFP4) frente a BF16 y Q4_K_M para decidir que variante usar en funcion del presupuesto de memoria y la tolerancia a la perdida de calidad.
- Generacion de texto por continuacion (completion): usar el modelo como base para tareas de autocompletado, generacion de articulos o resumen extractivo, dado que no tiene plantilla de chat.
- Investigacion en aceleradores no-GPU: estudiar el rendimiento de un transformer 8B en NPUs Tensix frente a GPUs, con metricas de tamano empaquetado y divergencia KL ya publicadas.
- Base para fine-tuning posterior: al ser un modelo base con licencia Apache 2.0, sirve como punto de partida para ajuste supervisado o DPO en ingles, aunque la cuantizacion BFP requiere reconvertir a bf16 antes de entrenar.
- Pruebas de integracion en pipelines de `transformers`: cargar la carpeta `bfp8/` con `AutoModelForCausalLM` para validar compatibilidad antes de portar a `ttnn`.

## Benchmarks y rendimiento

| Variante | Tamano empaquetado (GB) | KL media a BF16 | Respuestas correctas (28 prompts) |
|---|---|---|---|
| `bfp4/` | 4,886 | 0,05429 | 20/28 |
| `bfp8/` | 8,871 | 0,00103 | 18/28 |
| BF16 (base) | 16,34 | 0 | 18/28 |
| Q4_K_M (llama.cpp) | 4,943 | 0,05298 | 19/28 |

La KL se calcula sobre 8.184 posiciones de texto en ingles y coreano, con un limite de KL media de 1,5 veces la referencia Q4_K_M. Las "respuestas" corresponden a 28 prompts de completion con tres ejemplos (three-shot). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: BFP8 requiere aproximadamente 8,871 GB empaquetados; BFP4, 4,886 GB. El modelo BF16 de referencia ocupa 16,34 GB.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole (malla Tensix), con `ttnn` y `tt-metal`.
- GPU consumer: puede cargarse en GPU con `transformers` en bf16 (necesita al menos 16 GB de VRAM, p. ej. RTX 4090 24 GB, RTX 3090 24 GB o A100 40 GB); no se ha validado el formato BFP en GPU consumer.
- Despliegue: `ttnn` (nativo Tensix), `transformers` (bf16), y potencialmente llama.cpp si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite 3.3 8B Base (Tenstorrent Tensix, este) | 8B | no disponible | BFP4 / BFP8 | Apache 2.0 | Hugging Face, 32 descargas |
| ibm-granite/granite-3.3-8b-base (BF16) | 8B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (referencia) | 8B | no disponible | Q4_K_M | Apache 2.0 | llama.cpp |
| Otros modelos 8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base y a la referencia Q4_K_M citada en la model card; no se dispone de datos de modelos alternativos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: no mantiene conversaciones multi-turno ni sigue instrucciones; solo continua texto.
- Solo soporta ingles segun la model card; el coreano aparece unicamente en el conjunto de evaluacion KL, no como idioma declarado.
- La cuantizacion BFP4 introduce una KL media de 0,05429, similar a Q4_K_M; puede degradar tareas sensibles a precision.
- La variante BFP8 obtiene 18/28 respuestas correctas, igual que BF16, pero BFP4 sube a 20/28, lo que sugiere alta varianza en la metrica de respuestas con solo 28 prompts.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de sesgo ni de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio del modelo base no incluye fichero LICENSE propio; el autor indica que `LICENSE` contiene el texto estandar.
- El modelo esta disenado para NPU Tensix; en GPU solo se ha probado la carga en bf16, no el formato BFP.
- No hay informacion sobre longitud de contexto, datos de entrenamiento ni benchmarks estandar, lo que limita la evaluacion comparativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-base
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix/blob/main/LICENSE
