# zerogpu-hacking/sensenova-u1-5-aoti

## Resumen

Este repositorio no contiene un modelo de IA en sí, sino un paquete de artefactos compilados con AOTInductor para acelerar el paso de generación de imágenes del modelo multimodal `sensenova/SenseNova-U1.5-8B-MoT` en el entorno ZeroGPU de Hugging Face Spaces. El paquete incluye una versión modificada del código de los decodificadores Qwen3 (`modeling_qwen3.py`) que reestructura el camino de generación para hacerlo trazable por `torch.export`, y un grafo compilado que se carga en tiempo de ejecución.

El objetivo es reducir la latencia de inferencia en el bucle de denoising de generación de texto a imagen. Según las mediciones del autor, se consigue una aceleración de 1,26x en una ejecución completa de 28 pasos a 2048x2048 (de 33,25 s a 26,42 s), manteniendo una fidelidad numérica superior a la ruta eager en bf16. El paquete solo es válido para una combinación exacta de dtype, versión de torch, arquitectura de GPU y forma de entrada; si no coincide, el cargador rechaza el paquete y se cae a ejecución eager.

El modelo base, SenseNova-U1.5-8B-MoT, es un modelo nativo unificado multimodal de SenseTime (8B parámetros) que unifica comprensión, razonamiento y generación de imagen en una única arquitectura monolítica. Este paquete AOTI no añade ninguna capacidad al modelo; solo optimiza su ejecución en un entorno específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de compilacion AOTInductor para el modelo base `sensenova/SenseNova-U1.5-8B-MoT` (transformers, Qwen3DecoderLayer adaptado) |
| Parametros totales | No aplicable (el paquete no contiene pesos; el modelo base tiene 8B parametros) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (el paquete compila el camino de generacion de imagen, con S = 3888..4096 tokens de imagen y P dinamico para prefijo) |
| Tipos de cuantizacion | bf16 (el paquete se publica para `bf16/torch2.8/sm120/dynamic`) |
| Idiomas soportados | No disponibles (el modelo base es multimodal, pero no se especifican idiomas en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | El paquete no contiene pesos (1,1 MB total); los parametros se enlazan desde el modelo base en tiempo de ejecucion |

## Arquitectura y entrenamiento

El paquete compila el camino de generacion de imagen de una capa `Qwen3DecoderLayer` del modelo base, que se reutiliza en las 42 capas del modelo. La compilacion se realiza con `torch.compile` en modo AOTInductor, fusionando operaciones no-GEMM (RMSNorm, recomputacion rotatoria, reshaping de q/k/v, `repeat_interleave` de GQA) que representan aproximadamente el 29% del tiempo de una capa. Los GEMMs grandes (57%) y la atencion (14%) no se ven beneficiados por la fusion.

El modelo base, SenseNova-U1.5-8B-MoT, se entrena bajo el paradigma NEO-unify de SenseTime, que unifica comprension y generacion multimodal en un unico proceso sin adaptadores entre modalidades. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

El paquete compilado se valida para las seis proporciones de aspecto de generacion de imagen (S = 3888..4096) y cualquier longitud de prompt, gracias a dimensiones dinamicas en `S` y `P`. La carga del paquete requiere una coincidencia exacta de clave (`dtype/torchX.Y/smCC/<shape>`); si no coincide, el cargador rechaza el paquete y se usa eager.

## Capacidades

- No anade ninguna capacidad nueva al modelo base: solo acelera la inferencia del camino de generacion de imagen.
- Compilacion AOTInductor del paso de denoising de texto a imagen (T2I) para ZeroGPU Spaces.
- Soporte de dimensiones dinamicas en el numero de tokens de imagen y longitud de prefijo.
- Integracion con `spaces.zero.torch.aoti` mediante el paquete `zerogpu-hacking/sensenova-u1-5-aoti-compiler` (proporciona `sn_aoti.py` y `INTEGRATION.md`).
- El cargador implementa una cache `ContextVar` por hilo, con coste de carga despreciable (~30 ms).
- Compatible con bf16 y SDPA (flash, cuDNN, memory-efficient) en sm120 (GPU Blackwell).

## Casos de uso

- Despliegue de generacion de imagen en Hugging Face Spaces ZeroGPU: el paquete compilado reduce el tiempo de generacion de 33,25 s a 26,42 s en un paso de 28 pasos a 2048x2048, lo que mejora la latencia percibida en demos interactivas.
- Optimizacion de inferencia en GPUs Blackwell (sm120): el paquete esta compilado para `sm120`, por lo que se puede usar en RTX PRO 6000 Blackwell Server Edition MIG u otras GPUs de esa arquitectura.
- Investigacion sobre compilacion de modelos multimodales: sirve como referencia para aplicar AOTInductor a rutas de generacion de imagen con atencion de prefijo dinamico.
- Integracion en pipelines de generacion de imagen donde se requiera determinismo y fidelidad numerica: el camino compilado se acerca mas a un referencia fp32 que la ruta eager bf16.
- Uso en entornos con restriccion de memoria: el pico de memoria baja de 34,71 GiB a 34,62 GiB con el paquete compilado.
- Evaluacion de alternativas de backend de atencion: el paquete documenta que torch 2.8 ya tiene un backend flash funcional en sm120, por lo que instalar `flash_attn` apenas aporta (2,6% como maximo).

## Benchmarks y rendimiento

El autor publica mediciones propias en una RTX PRO 6000 Blackwell Server Edition MIG 2g.48gb (sm120), torch 2.8.0+cu128, bf16, SDPA, con una generacion 2048x2048, S=4096, P=265:

| Metrica | Eager | AOTI | Speedup |
|---|---|---|---|
| Una capa decoder | 13,358 ms | 10,928 ms | 1,222x |
| Llamada trunk (42 capas) | 561 ms | 459 ms | - |
| Generacion completa 28 pasos 2048x2048 | 33,25 s | 26,42 s | 1,259x |
| Tiempo por paso | 1188 ms | 944 ms | - |
| Pico de memoria | 34,71 GiB | 34,62 GiB | - |

Ademas, se reporta que el camino compilado es numericamente mas cercano a una referencia fp32 que el camino eager bf16 (ratio 0,76 y 0,66 en las capas 0 y 20, respectivamente). Sin embargo, la imagen final cambia en un 81% de los pixeles (media 3,3/255) respecto a eager, lo que se atribuye a la no estabilidad de la generacion ante cualquier cambio en el orden de acumulacion (una comparacion entre dos kernels SDPA igualmente correctos mueve el 73% de los pixeles).

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El paquete compilado esta destinado a GPUs con arquitectura sm120 (Blackwell). Se publica para `sm120` y no funciona en otras arquitecturas (el cargador rechaza claves no coincidentes).
- Se ha medido en una RTX 4090 Server Edition MIG 2g.48gb (particion de 48 GB). En esa configuracion, el pico de memoria durante la generacion es de ~34,6 GiB, lo que implica que se necesita al menos 40-48 GB de VRAM para la generacion 2048x2048.
- No se dispone de datos sobre requisitos de VRAM para generaciones de menor resolucion (por ejemplo, 512x512 o 1024x1024).
- La compilacion del grafo tarda 31 s en el entorno de medicion, pero el paquete se carga en ~30 ms por hilo.
- Opciones de despliegue: Hugging Face Spaces con ZeroGPU (integracion via `spaces.zero.torch.aoti`), o cualquier entorno con torch 2.8, GPU sm120 y el cargador `sn_aoti.py` del repositorio `zerogui-hacking/sensenova-u1-5-aoti-compiler`.
- No se reporta latencia o throughput estimado en entornos de produccion fuera de la medicion descrita.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros paquetes de compilacion AOTI o con otros modelos de generacion de imagen de la misma categoria. El paquete es un artefacto de optimizacion, no un modelo independiente, por lo que la comparacion no es aplicable. La informacion disponible no incluye benchmarks estandar (MMLU, HumanEval, etc.) del modelo base.

## Limitaciones y advertencias

- El paquete solo es valido para una combinacion exacta de dtype, version de torch, arquitectura de GPU y shape. Un paquete no coincidente causa un segfault en lugar de una excepcion, por lo que el cargador lo rechaza estrictamente y cae a eager.
- La compilacion solo cubre el camino de generacion de imagen; las partes de comprension y razonamiento del modelo base no estan optimizadas.
- El uso del paquete requiere una integracion manual: hay que llamar a `sn_aoti.maybe_load(model)` al inicio, y la vinculacion de parametros y buffers debe hacerse con `named_parameters()` y `named_buffers()` (los buffers no persistentes, como `inv_freq`, estan en el grafo pero no en `state_dict()`).
- No se ha evaluado el rendimiento en GPU de otras arquitecturas (por ejemplo, sm89 o sm100) ni con otras versiones de torch. La informacion se limita a torch 2.8.0+cu128 y sm120.
- La imagen final cambia ligeramente respecto a la ruta eager (81% de pixeles con diferencia media de 3.3/255). No se recomienda para aplicaciones que requieran resultados bit-identicos entre ejecuciones con diferente backend o compilacion.
- La licencia Apache 2.0 cubre el paquete compilado, pero el modelo base `sensenova/SenseNova-U1.5-8B-MoT` puede tener su propia licencia; verificar los terminos del modelo base antes de uso comercial.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo base en este repositorio.

## Enlaces

- Repositorio del paquete: https://huggingface.co/zerogpu-hacking/sensenova-u1-5-aoti
- Repositorio del compilador/loader: https://huggingface.co/spaces/zerogpu-hacking/sensenova-u1-5-aoti-compiler
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Organizacion ZeroGPU AoTI: https://huggingface.co/zerogpu-aoti
- GitHub del modelo base: https://github.com/OpenSenseNova/SenseNova-U1
- Paper del modelo base: https://arxiv.org/abs/2605.12500
- Blog de SenseTime sobre SenseNova U1: https://www.sensetime.com/en/research/51170625/
