# Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4

## Resumen

AREX-2-Tenstorrent-Tensix-BFP4 es una distribucion cuantizada de BAAI/AREX-2, un modelo multimodal de tipo image-text-to-text desarrollado por el Beijing Academy of Artificial Intelligence (BAAI) como ajuste fino orientado a agentes sobre Qwen/Qwen3.8-27B. La version que nos ocupa la publica Xylolabs y no modifica el modelo en si: reempaqueta los pesos en formatos de coma flotante por bloques (BFP4 y BFP8) especificos de las NPU Tensix de Tenstorrent, de modo que puedan ejecutarse sobre hardware tt-metal/ttnn en lugar de GPU convencionales.

El modelo base ronda los 27.356 millones de parametros (27,36 mil millones) y esta pensado para tareas de agente de horizonte largo, con razonamiento reflexivo y capacidades multimodales de entrada imagen-texto. La contribucion de esta ficha es la cuantizacion: el autor ofrece dos carpetas, `bfp4/` y `bfp8/`, con distintos compromisos entre tamano y fidelidad numerica respecto al BF16 original, ademas de scripts de empaquetado y verificacion para Tensix.

Es relevante ahora porque permite desplegar un modelo de 27B multimodal en aceleradores Tensix con un coste de memoria muy inferior al BF16 (17,6 GB en BFP4 frente a 53,8 GB), algo clave para entornos de inferencia en el borde o en hardware no-GPU. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); el modelo base deriva de Qwen/Qwen3.8-27B, con modulos de atencion, DeltaNet y MLP cuantizados de forma selectiva |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) y BFP8 (bfloat8_b) en atencion, DeltaNet y MLP; LM head en bfloat8_b; resto en bf16. Tambien se referencia Q4_K_M de llama.cpp como comparativa |
| Idiomas soportados | no disponible en la informacion (la evaluacion KL cubre ingles y coreano) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors, con carpetas `bfp4/` y `bfp8/`; scripts `pack_tensix.py` y `verify_grid.py` para empaquetado en Tensix |

## Arquitectura y entrenamiento

El modelo base AREX-2 es un ajuste fino de Qwen/Qwen3.8-27B orientado a agentes de auto-mejora mediante tareas reflexivas de horizonte largo (segun el titulo del paper arXiv:2609.38288). La arquitectura subyacente es un transformer multimodal de 27,36 mil millones de parametros que acepta entradas de imagen y texto y genera texto; la model card menciona explicitamente modulos de atencion, DeltaNet y MLP como las capas que se cuantizan de forma selectiva. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

La innovacion tecnica de esta distribucion es la cuantizacion en coma flotante por bloques para Tensix: en la carpeta `bfp4/` se aplica bfloat4_b a atencion, DeltaNet y MLP, bfloat8_b al LM head y se deja el resto en bf16; en `bfp8/` se usa bfloat8_b en esas mismas capas. El autor reporta la divergencia respecto a BF16 mediante la divergencia KL media sobre 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano, en texto plano y con plantilla de chat): 0,03640 para BFP4 y 0,00082 para BFP8. Como referencia, Q4_K_M de llama.cpp obtiene 0,02480. No se documentan tecnicas de decodificacion especulativa ni atencion lineal mas alla de la mencion a DeltaNet.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredado del modelo base de 27B.
- Entrada multimodal image-text-to-text: acepta imagenes junto con texto para tareas de comprension y descripcion.
- Razonamiento de agente y tareas reflexivas de horizonte largo, segun el enfoque declarado de AREX-2.
- Capacidades de codigo y matematicas propias del modelo base (no se detallan metricas concretas en la informacion).
- Soporte multilingue parcial: la evaluacion de cuantizacion cubre ingles y coreano, aunque no se publica la lista completa de idiomas.
- Ejecucion en hardware Tensix mediante ttnn/tt-metal, con empaquetado de matrices a bfloat4_b y bfloat8_b.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio adicionales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en aceleradores Tensix: desplegar un modelo de 27B multimodal sobre NPU Tenstorrent usando la carpeta `bfp4/` (17,6 GB empaquetados) para reducir el DRAM requerido frente a BF16 (53,8 GB), con una divergencia KL de 0,03640 aceptable para tareas generativas generales.
- Servicio de chat multimodal en el borde: atender conversaciones con imagenes y texto en entornos donde no hay GPU, aprovechando el pipeline image-text-to-text y el soporte de plantilla de chat del tokenizador.
- Agentes de horizonte largo: usar el modelo como nucleo de razonamiento en flujos de varios pasos, dado que el modelo base esta ajustado especificamente para tareas reflexivas de agente.
- Evaluacion de fidelidad de cuantizacion: emplear las carpetas `bfp4/` y `bfp8/` junto con `verify_grid.py` para medir el impacto de la cuantizacion en tareas propias comparando ambas variantes contra BF16.
- Prototipado en investigacion de hardware: validar pipelines tt-metal/ttnn con un modelo de 27B real, usando `pack_tensix.py --device` para comprobar el round-trip de valores por DRAM del dispositivo.
- Generacion de texto asistida por imagen en documentacion tecnica: describir diagramas o capturas y producir texto asociado, con contexto conversacional gestionado por la plantilla de chat.
- Despliegue con llama.cpp como alternativa: la model card referencia Q4_K_M (16,5 GB, KL 0,02480) para entornos sin Tensix, lo que permite comparar el mismo modelo base en CPU/GPU convencional.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). El unico dato de rendimiento publicado es la divergencia KL media respecto a BF16 sobre 16.240 posiciones de texto en ingles y coreano:

| Formato | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| `bfp4/` | 17,596 | 0,03640 |
| `bfp8/` | 30,963 | 0,00082 |
| BF16 (BAAI/AREX-2) | 53,79 | 0 |
| Q4_K_M (llama.cpp) | 16,547 | 0,02480 |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: `bfp4/` ocupa 17,596 GB empaquetados y `bfp8/` 30,963 GB; el BF16 original requiere 53,79 GB. El repo completo pesa 106,0 GB.
- Hardware objetivo: NPU Tenstorrent Tensix con pila tt-metal (la demo se ejecuta desde un checkout de tt-metal v0.81.1) y ttnn para el empaquetado de tensores.
- GPU convencionales: la model card muestra un ejemplo con `transformers` y `device_map="auto"` en bfloat16, pero no se especifican GPU recomendadas (A100, H100, RTX 4090) ni si cabe en GPU de consumo.
- Opciones de despliegue: ttnn/tt-metal (objetivo principal), transformers para generacion de texto, y llama.cpp via la variante Q4_K_M referenciada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AREX-2-Tenstorrent-Tensix-BFP4 (esta ficha) | 27,36 mil millones | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face, 173 descargas |
| BAAI/AREX-2 (base) | 27,36 mil millones | no disponible | BF16 safetensors | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (origen) | 27B (aproximado) | no disponible | BF16 | no disponible en la informacion | Hugging Face |
| Q4_K_M de llama.cpp (mismo modelo) | 27,36 mil millones | no disponible | Q4_K_M GGUF | Apache 2.0 | Referenciado en la model card |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros autores.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia KL de 0,03640 frente a BF16, superior a la de Q4_K_M (0,02480); puede degradar tareas sensibles a la precision numerica.
- BFP8 ofrece mayor fidelidad (KL 0,00082) pero ocupa 30,963 GB, casi el doble que BFP4.
- La evaluacion de fidelidad solo cubre ingles y coreano; el comportamiento en otros idiomas no esta medido.
- No se publican resultados de benchmarks de tareas, por lo que el rendimiento real en codigo, matematicas o razonamiento no esta cuantificado en esta distribucion.
- El modelo esta empaquetado para Tensix; ejecutarlo en GPU o CPU requiere usar la variante BF16 o Q4_K_M, no las carpetas BFP4/BFP8.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base BAAI/AREX-2.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio LICENSE y NOTICE que deben revisarse; los cambios de Xylolabs se listan en NOTICE.
- El modelo base es un ajuste fino de Qwen/Qwen3.8-27B; las limitaciones del modelo origen (contexto, idiomas, sesgos) aplican igualmente.

## Enlaces

- Hugging Face (esta distribucion): https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix-BFP4
- Modelo base BAAI/AREX-2: https://huggingface.co/BAAI/AREX-2
- Modelo origen Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper AREX-2 (arXiv:2609.38288): https://arxiv.org/abs/2609.38288
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia Apache 2.0 del repositorio: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix/blob/main/LICENSE
