# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-P3 es una reempaquetado de cuantizacion del modelo Qwen3.8-Flash-Next, publicado por el usuario txgsync. El modelo original es un transformer de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen, y esta variante aplica una tecnica de compresion denominada SeedLM, en la que los pesos de los expertos enrutados se generan a partir de semillas de un registro de desplazamiento con realimentacion lineal (LFSR) en lugar de almacenarse explicitamente. El resultado es un checkpoint de aproximadamente 89.400 millones de parametros totales que ocupa 159,2 GB en el repositorio y que esta pensado para ejecutarse en Apple Silicon mediante MLX.

La relevancia de esta publicacion es fundamentalmente practica: permite ejecutar un modelo MoE de gran tamano en un Mac de 128 GB de memoria unificada, algo imposible con los pesos en BF16. El pack P3 almacena los 120.800 millones de pesos de expertos enrutados a 4,0 bits (60,4 GB) y los pesos densos a 4 bits, lo que lo hace aproximadamente un 20 % mas rapido que el pack TCQ4 en un M4 Max, a costa de una divergencia KL cuatro veces mayor (0,182 frente a 0,0415).

Se trata de una vista previa de investigacion (research preview) con soporte en los motores NanoSeedLM, en mlx-vlm con Trust Remote Code y en oMLX (requiere el parche jundot/omlx#5112). No es un modelo nuevo entrenado desde cero, sino una representacion comprimida del checkpoint base de Qwen, y su licencia hereda la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con pesos de expertos generados por SeedLM (LFSR) |
| Parametros totales | 89.403.088.787 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos a 4,0 bits (semillas P3); pesos densos a 4 bits; tabla PLE a 8 bits (57,6 GB, formato MLX, group 32) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX), con custom_code; requiere Trust Remote Code |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Qwen con 120.800 millones de parametros en los expertos enrutados, mas un conjunto de pesos densos. Esta variante no reentrena el modelo: lo que hace es recodificar los pesos de los expertos como semillas de un LFSR. Cada peso de experto se reconstruye en tiempo de ejecucion mediante aritmetica entera a partir de unos pocos bits almacenados, sin codebook, lo que reduce el espacio de 120,8 B de pesos a 60,4 GB a 4,0 bits por peso. Los pesos densos se cuantizan a 4 bits y la tabla PLE (n-gram) se guarda a 8 bits en disco, con la cache de paginas sirviendo las filas que lee cada sesion.

La innovacion tecnica central es el esquema SeedLM frente al esquema Trellis (TCQ) que usa la misma familia de packs. Con pesos densos de 8 bits como referencia, TCQ4 alcanza una KL de 0,0398 a 4,125 bits, P4 da 0,0408 a 4,5 bits y P3 da 0,0600 a 4,0 bits; es decir, el codigo Trellis es mas fiel por bit en este modelo. Sin embargo, P3 y P4 se distribuyen con pesos densos de 4 bits, y ahi esta el grueso de su divergencia: con densos de 4 bits, P3 sube a 0,182 y P4 a 0,169. La KL se mide contra BF16 en llama.cpp sobre 64 ventanas de 2.048 tokens de wikitext-2, con la tabla PLE Q8_0 de Unsloth. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline image-text-to-text declarado.
- Procesamiento de imagen y texto combinados (entrada multimodal imagen-texto).
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.8-Flash-Next (no verificado de forma independiente en esta variante).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Ejecucion en Apple Silicon via MLX, mlx-vlm y oMLX, ademas de los motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS).

## Casos de uso

- Inferencia local en Mac de 128 GB: el pack P3 permite ejecutar un MoE de 89,4 B parametros en un unico equipo Apple Silicon sin GPU dedicada, usando mlx-vlm u oMLX con el parche correspondiente.
- Prototipado rapido de aplicaciones multimodales: al ser aproximadamente un 20 % mas rapido que TCQ4 en M4 Max, sirve para iterar sobre prompts y flujos imagen-texto antes de pasar a un pack de mayor fidelidad.
- Investigacion sobre compresion de modelos: los packs P3 y P4 son la referencia para estudiar la viabilidad de las semillas LFSR frente a los codebooks Trellis en modelos MoE de gran escala.
- Despliegue en estaciones de trabajo con 96-128 GB de RAM y GPU de 12-16 GB: el pack P3 permite mantener los expertos en RAM y cachear en GPU los expertos en uso, con decodificacion de 27 tokens/s en una RTX 4080 limitada a 12 GB y 44 tokens/s con los 16 GB completos.
- Evaluacion comparativa de fidelidad: util para medir el impacto de la cuantizacion de pesos densos (4 bits frente a 8 bits) sobre la KL y sobre la calidad percibida en tareas reales.
- Educacion y demostraciones: permite mostrar en un equipo de sobremesa el comportamiento de un MoE de gran tamano con contexto multimodal, sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos publicados son de fidelidad y velocidad:

| Metrica | P3 | TCQ4 (referencia) |
|---|---|---|
| Bits por peso de experto | 4,0 | 4,125 |
| Memoria de pesos residentes | 66 GB | 70 GB |
| KL frente a BF16 (tal como se distribuye) | 0,182 | 0,0415 |
| KL con densos de 8 bits | 0,0600 | 0,0398 |
| Tamano de descarga | 123,8 GB | 127,5 GB |
| Peso de expertos | 60,4 GB | 62,3 GB |
| Pesos densos | 4 bits | 8 bits |
| Velocidad relativa en M4 Max | ~20 % mas rapido que TCQ4 | referencia |

Datos de velocidad en GPU: en una RTX 4080 limitada a 12 GB, el pack TCQ3 decodifica a 27 tokens/s, frente a 44 tokens/s con los 16 GB completos. No se han publicado cifras de throughput para P3 en GPU.

## Requisitos de hardware

- Memoria: minimo 64 GB de RAM; el pack P3 requiere un Mac de 128 GB o un PC con 96-128 GB de RAM, ya que los expertos deben caber en RAM.
- VRAM: en PC, los expertos permanecen en RAM y la GPU cachea los expertos en uso; se recomienda GPU de 16 GB o mas (24 GB o mas para el pack TCQ4).
- GPU recomendadas: RTX 4080/4090 (16-24 GB) en PC; en Mac, chips M4 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo: si, en el sentido de que el modelo completo no necesita residir en VRAM, pero si requiere un equipo con 96-128 GB de RAM.
- Opciones de despliegue: motores NanoSeedLM (CUDA en Linux/Windows, Metal en macOS), mlx-vlm con Trust Remote Code, oMLX con el parche jundot/omlx#5112.
- Latencia y throughput: aproximadamente un 20 % mas rapido que TCQ4 en M4 Max; 27 tokens/s en RTX 4080 a 12 GB y 44 tokens/s a 16 GB (medido con TCQ3, no con P3).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL / fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-P3 | 89,4 B totales | no disponible | 0,182 (4 bits densos) | qwen-community-1.0 | Hugging Face, MLX |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 | mismo base | no disponible | 0,0415 | qwen-community-1.0 | Hugging Face, MLX |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 | mismo base | no disponible | 0,0778 | qwen-community-1.0 | Hugging Face, MLX |
| Qwen3.8-Flash-Next-NanoSeedLM-P4 | mismo base | no disponible | 0,169 | qwen-community-1.0 | Hugging Face, MLX |

La comparativa se limita a los packs de la misma familia, ya que no se dispone de datos de benchmarks frente a modelos de otros desarrolladores.

## Limitaciones y advertencias

- Vista previa de investigacion: no esta pensada para produccion sin validacion adicional.
- Divergencia KL de 0,182 frente a BF16, cuatro veces la del pack TCQ4; la mayor parte proviene de los pesos densos a 4 bits.
- Requiere cargar codigo remoto (Trust Remote Code) en mlx-vlm, lo que implica riesgos de seguridad en entornos no controlados.
- oMLX necesita el parche jundot/omlx#5112; sin el, el modelo no se ejecuta correctamente.
- Requiere al menos 64 GB de RAM; no es viable en equipos con menos memoria.
- Licencia Qwen Community License 1.0: hay que revisar las restricciones de uso comercial antes de desplegar.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico de esta variante; se heredan los del modelo base.
- La tabla PLE reside en disco y depende de la cache de paginas, lo que puede afectar a la latencia en sesiones con lecturas dispersas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Pack TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Pack TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Pack P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Motores NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Release de los motores: https://github.com/mbarnson/NanoSeedLM/releases
- Parche oMLX: https://github.com/jundot/omlx/pull/5112
- Paper SeedLM (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
- Paper adicional (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
