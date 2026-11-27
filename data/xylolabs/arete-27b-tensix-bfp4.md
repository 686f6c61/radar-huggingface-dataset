# Xylolabs/Arete-27B-Tensix-BFP4

## Resumen

Arete-27B-Tensix-BFP4 es una cuantizacion del modelo NousResearch/Arete-27B (un ajuste fino supervisado de Qwen/Qwen3.8-27B) realizada por Xylolabs para ejecutarse sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura del original, que combina capas de atencion clasica con capas de Gated DeltaNet, y reduce el peso de 53,79 GB en bf16 a 17,596 GB empaquetados mediante cuantizacion de bloque en punto flotante (BFP4 para proyecciones y BFP8 para la cabeza LM).

El problema que resuelve es el despliegue eficiente de un modelo de 27.356 millones de parametros en hardware NPU de Tenstorrent, un ecosistema alternativo a las GPU de NVIDIA. La cuantizacion se realizo con GPTQ y busqueda de exponente por bloque, y se valido con scripts de empaquetado y verificacion incluidos en el repositorio. Es relevante ahora porque permite ejecutar un modelo multimodal de gran tamano en hardware especializado con un coste de memoria aproximadamente un tercio del original.

La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial. El modelo conserva la torre visual en bf16 sin modificar, por lo que mantiene capacidades de image-text-to-text. La informacion publica no detalla la longitud de contexto ni los idiomas soportados de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet y atencion clasica (derivado de Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (BFP4) para proyecciones de atencion, Gated DeltaNet y MLP; bfloat8_b (BFP8) para LM head; bf16 para embeddings, normas y torre visual |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix, con `quant4.json` e indice de shards) |

## Arquitectura y entrenamiento

El modelo base NousResearch/Arete-27B es un ajuste fino supervisado de Qwen/Qwen3.8-27B. La arquitectura combina 16 capas con atencion clasica (q, k, v, o) y 48 capas con Gated DeltaNet (q, k, v, z, a, b, output), ademas de 64 capas MLP con proyecciones gate, up y down. Esta mezcla de mecanismos de atencion y estado recurrente lineal es caracteristica de la familia Qwen3.5. El modelo incluye una torre visual (`visual`) en bf16, lo que lo habilita para tareas image-text-to-text.

La cuantizacion fue realizada por Xylolabs con GPTQ y una busqueda de exponente por bloque para los tensores bfloat4_b, y redondeo al mas cercano para los bfloat8_b. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovacion tecnica destacable es el empaquetado en formato de bloque BFP4/BFP8 compatible con ttnn, que permite cargar las matrices directamente en la NPU con verificacion de ida y vuelta (round-trip) contra torch.

## Capacidades

- Generacion de texto conversacional y continuacion de texto.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat.
- Procesamiento de imagen y texto (image-text-to-text) gracias a la torre visual conservada en bf16.
- Capacidades multilingues: la evaluacion incluye ingles y coreano, aunque no se detalla la lista completa de idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Ejecucion en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn y tt-metal.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el modelo esta empaquetado para NPUs Wormhole y Blackhole, por lo que encaja en entornos que ya operan hardware Tensix y buscan un modelo de 27B con huella de memoria reducida (17,596 GB frente a 53,79 GB en bf16).
- Asistentes conversacionales multi-turno: la plantilla de chat y la generacion de texto permiten integrarlo en aplicaciones de atencion al cliente o asistentes internos, siempre que se valide la longitud de contexto real en produccion.
- Procesamiento de documentos con imagenes: al conservar la torre visual, puede emplearse en tareas de image-text-to-text como descripcion de imagenes o extraccion de informacion de capturas y formularios.
- Generacion de codigo y texto tecnico: el modelo base deriva de Qwen3.8-27B, una familia con buen rendimiento en tareas de codigo; el modelo cuantizado puede usarse en pipelines de generacion asistida, verificando la calidad tras la cuantizacion.
- Investigacion sobre cuantizacion BFP: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir y auditar el proceso de cuantizacion, lo que lo hace util como referencia para estudiar el impacto de BFP4 en modelos hibridos.
- Evaluacion comparativa de precision: con los datos de KL y top-1 publicados frente a bf16 y Q4_K_M, sirve como caso de estudio para medir la degradacion de un modelo multimodal cuantizado a 4 bits en hardware no NVIDIA.
- Prototipado en entornos con memoria limitada: al ocupar aproximadamente un tercio del espacio del bf16, facilita pruebas en nodos con DRAM reducida dentro del ecosistema Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (NousResearch/Arete-27B) | 53,79 | 0 | 100 |
| Arete-27B-Tensix-BFP4 (este modelo) | 17,596 | 0,02909 | 92,24 |
| Q4_K_M (llama.cpp) | 16,547 | 0,02036 | 93,47 |

La evaluacion cubre 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 sin matriz de importancia. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,596 GB empaquetados para Tensix; el repositorio ocupa 54,7 GB en total (incluye pesos bf16 y empaquetados).
- GPU recomendadas: no aplica de forma nativa; el modelo esta disenado para NPUs Tenstorrent Wormhole y Blackhole.
- Compatibilidad con GPU de consumo: no se indica soporte nativo para RTX 4090 u otras GPU consumer; la carga con transformers y `device_map="auto"` requeriria memoria suficiente para los tensores en el formato empaquetado.
- Opciones de despliegue: ttnn/tt-metal (demo `models/demos/qwen38_27b_qb2/demo/text_demo.py`), tensix-runner v0.1.0, tensix-kernels v0.1.0, y carga via transformers con safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/quantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Tensix-BFP4 | 27,36B | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (bf16) | 27,36B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 27,36B | no disponible | Q4_K_M (GGUF) | Apache 2.0 | Generado localmente |

La comparativa se limita a variantes del mismo checkpoint porque la informacion disponible no incluye otros modelos de la misma categoria con datos verificables. El modelo base Qwen/Qwen3.8-27B seria el ancestro comun, pero no se dispone de sus especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a BFP4 introduce una degradacion medible: KL medio de 0,02909 frente a 0,02036 de Q4_K_M y top-1 del 92,24 % frente al 93,47 % de Q4_K_M, por lo que la precision es inferior a una cuantizacion de 4 bits convencional.
- El modelo esta empaquetado especificamente para Tensix; su uso fuera de ese hardware requiere conversion o carga parcial, y no se documenta un camino oficial para GPU.
- No se especifican sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma mas alla de la evaluacion en ingles y coreano.
- La longitud de contexto no esta documentada, lo que impide garantizar ventanas largas en produccion sin validacion previa.
- Aunque la licencia es Apache 2.0, se debe conservar el aviso `NOTICE` con los cambios realizados por Xylolabs.
- El modelo tiene 192 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- La fecha de creacion (2026-11-11) y la referencia a Qwen3.8-27B deben contrastarse con la disponibilidad real del modelo base antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo ancestro: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
