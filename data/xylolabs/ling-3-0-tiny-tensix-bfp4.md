# Xylolabs/Ling-3.0-tiny-Tensix-BFP4

## Resumen

Ling-3.0-tiny-Tensix-BFP4 es una cuantizacion del modelo base inclusionAI/Ling-3.0-tiny, publicada por Xylolabs, orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El paquete incluye los pesos en formato block-floating-point de 4 bits (bfloat4_b) empaquetados para las primitivas ttnn de tt-metal, junto con los scripts de empaquetado y verificacion. El modelo base es un transformer hibrido de tipo bailing_hybrid con 7.893.392.800 parametros totales segun los safetensors del repositorio.

La relevancia de esta publicacion es doble. Por un lado, demuestra una ruta practica para llevar un modelo de ~7,9 mil millones de parametros a hardware NPU no convencional con una perdida de calidad medida y acotada: el error KL medio frente a BF16 es de 0,0903 sobre 16.276 posiciones de texto en ingles y coreano, frente a 0,0670 del Q4_K_M de llama.cpp, dentro de un limite declarado de 1,5 veces esa referencia. Por otro, el repositorio documenta los detalles de empaquetado especificos de la arquitectura (KDA y MLA) necesarios para que las matrices encajen en el layout de tiles de Tensix.

El resultado es un artefacto de 4,794 GB empaquetados (frente a 15,79 GB en BF16) que reduce aproximadamente a un tercio el espacio de almacenamiento del modelo original, manteniendo el codigo de modelado original con `trust_remote_code=True`. Es una pieza pensada para equipos que ya trabajan con tt-metal o tt-forge y quieren evaluar modelos de la familia Ling en aceleradores Tenstorrent, no un checkpoint de proposito general para GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido bailing_hybrid (KDA y MLA, MLP densa y expertos), segun tags del autor |
| Parametros totales | 7.893.392.800 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en KDA, MLA, MLP densa, expertos y LM head; resto en bf16/float32 |
| Idiomas soportados | no disponible en la model card; la evaluacion KL usa texto en ingles y coreano |
| Licencia | MIT |
| Formato de pesos | safetensors, empaquetados para ttnn (carpeta `bfp4/`); repo de 15,8 GB |
| Tamano empaquetado | 4,794 GB (frente a 15,79 GB en BF16 y 4,824 GB en Q4_K_M) |
| Modelo base | inclusionAI/Ling-3.0-tiny |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole) |
| Dependencias | Transformers 4.57.1, flash-linear-attention 0.4.2, CUDA/FLA para el quickstart |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny se describe en los tags como `bailing_hybrid`, con componentes KDA y MLA (mecanismos de atencion lineal y atencion con latentes comprimidos, respectivamente) y una MLP que combina capas densas y expertos. Esta publicacion no entrena el modelo: parte del checkpoint inclusionAI/Ling-3.0-tiny y aplica una cuantizacion post-entrenamiento de tipo GPTQ en formato block-floating-point de 4 bits, con el codigo disponible en el repositorio tensix-bfp-gptq de Xylolabs.

La innovacion tecnica principal reside en el empaquetado para Tensix. Las matrices cuantizadas se almacenan como bfloat4_b y se convierten a tensores ttnn con layout TILE_LAYOUT y memoria DRAM. El repositorio documenta una excepcion de empaquetado para `q_b_proj` y `kv_a_proj_with_mqa` en las capas 3, 7, 11, 15, 19 y 23: en cada cabeza de `q_b_proj` se conservan las primeras 128 filas y las 64 ultimas se reordenan en filas pares seguidas de impares; en `kv_a_proj_with_mqa` se conservan las primeras 512 filas y se aplica la misma permutacion par/impar a las 64 ultimas. Cualquier implementacion debe alinear sus pares rotatorios con ese orden. La verificacion de equivalencia se realiza con `pack_tensix.py` y `verify_grid.py`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto autoregresiva, con pipeline declarado `text-generation`.
- Razonamiento y conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Soporte de la arquitectura hibrida del modelo base: atencion lineal (KDA) y atencion con latentes comprimidos (MLA).
- Capacidades multilingues: no documentadas en la model card; la evaluacion KL cubre ingles y coreano.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion sobre NPU Tenstorrent mediante ttnn, con verificacion de equivalencia bit a bit tras el empaquetado.

## Casos de uso

- Evaluacion de modelos Ling en hardware Tenstorrent: el paquete permite cargar el modelo en Wormhole o Blackhole y medir latencia y throughput reales sobre las primitivas ttnn, algo que no es posible con el checkpoint BF16 original sin conversion manual.
- Despliegue en entornos con memoria limitada: los 4,794 GB empaquetados frente a 15,79 GB en BF16 permiten alojar el modelo en dispositivos con DRAM reducida, con una perdida de calidad acotada y medida (KL medio de 0,0903).
- Prototipado de pipelines de cuantizacion BFP4: el repositorio tensix-bfp-gptq y los scripts `pack_tensix.py` y `verify_grid.py` sirven como referencia para cuantizar y empaquetar otros modelos de la familia para Tensix.
- Generacion de texto conversacional en ingles y coreano: la evaluacion KL cubre ambos idiomas en plantilla de chat, por lo que es un escenario validado para medir la degradacion respecto a BF16.
- Investigacion en arquitecturas hibridas: al conservar el codigo original con `trust_remote_code=True`, permite estudiar el comportamiento de KDA y MLA en precision reducida frente a BF16.
- Integracion en flujos tt-forge: el modelo puede incorporarse a pipelines de compilacion de tt-forge para comparar el rendimiento de BFP4 frente a otras precisiones en la misma NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica publicada es la divergencia KL frente a BF16:

| Formato | Tamano empaquetado (GB) | KL medio a BF16 |
|---|---|---|
| BFP4 (este repositorio) | 4,794 | 0,0903 |
| Q4_K_M (llama.cpp) | 4,824 | 0,0670 |
| BF16 (referencia) | 15,79 | 0 |

La evaluacion KL cubre 16.276 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat, y el autor fija un limite de 1,5 veces el KL de Q4_K_M como criterio de aceptacion.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: aproximadamente 4,8 GB en BFP4 empaquetado; 15,79 GB en BF16 para el modelo base.
- GPU recomendadas: no aplica como objetivo principal; el quickstart en GPU requiere CUDA y flash-linear-attention 0.4.2, sin modelos de GPU especificados en la informacion disponible.
- Hardware objetivo: NPU Tenstorrent Tensix, generaciones Wormhole y Blackhole.
- Cabe en GPU de consumo: no disponible como dato verificado para este paquete; el modelo base en BF16 (15,79 GB) supera la VRAM de la mayoria de GPU de consumo, mientras que el formato BFP4 esta pensado para Tensix, no para CUDA.
- Opciones de despliegue: ttnn/tt-metal y tt-forge para Tensix; Transformers 4.57.1 con `trust_remote_code=True` para el quickstart en GPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-Tensix-BFP4 | 7,89 B | no disponible | BFP4 para Tensix | MIT | Hugging Face |
| inclusionAI/Ling-3.0-tiny (BF16) | 7,89 B | no disponible | BF16 safetensors | MIT | Hugging Face |
| Ling-3.0-tiny Q4_K_M (llama.cpp) | 7,89 B | no disponible | GGUF Q4_K_M | MIT | Referencia de cuantizacion citada por el autor |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de modelos alternativos de tamano o tarea comparable. No se dispone de resultados de benchmarks que permitan comparar rendimiento en tareas frente a otros modelos.

## Limitaciones y advertencias

- Perdida de calidad medible: el KL medio de 0,0903 frente a BF16 es un 34,8 % superior al de Q4_K_M (0,0670), aunque dentro del limite declarado por el autor.
- La evaluacion de calidad solo cubre ingles y coreano; el comportamiento en castellano u otros idiomas no esta verificado.
- El paquete esta empaquetado para Tensix; usarlo en GPU requiere el codigo original y las dependencias CUDA/FLA, y el formato BFP4 no es directamente compatible con runtimes CUDA convencionales.
- El empaquetado de `q_b_proj` y `kv_a_proj_with_mqa` en las capas 3, 7, 11, 15, 19 y 23 impone un orden par/impar en los pares rotatorios; una implementacion que no respete ese orden producira resultados incorrectos.
- Requiere `trust_remote_code=True` y versiones concretas de Transformers (4.57.1) y flash-linear-attention (0.4.2); otras versiones pueden romper la carga.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse sobre el modelo base.
- Licencia MIT declarada por el autor, con avisos en `NOTICE` y `LICENSE-CODE`; el fichero de modelado original conserva cabecera Apache-2.0, por lo que conviene revisar ambos textos antes de un uso comercial.
- El repositorio fue renombrado el 2026-11-27 (antes Ling-3.0-tiny-Tenstorrent-Tensix-BFP4) y los ficheros se movieron a `bfp4/`; enlaces y rutas antiguas pueden fallar.
- No hay informacion sobre la longitud de contexto efectiva ni sobre el soporte de tool calling, lo que limita su uso en pipelines de agentes sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tensix-BFP4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Revision del modelo base citada: https://huggingface.co/inclusionAI/Ling-3.0-tiny/tree/9a98e35fe1c9ee255f78dd64771c7ae15a799481
