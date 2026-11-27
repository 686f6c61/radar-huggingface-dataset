# Xylolabs/Qwen3.5-2B-Tenstorrent-Tensix

## Resumen

Qwen3.5-2B-Tenstorrent-Tensix es una cuantización del modelo multimodal Qwen/Qwen3.5-2B, publicada por Xylolabs, especificamente empaquetada para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, núcleos Tensix). El modelo base lo desarrolla el equipo Qwen (Alibaba) y está orientado a tareas de agente multimodal nativo (image-text-to-text), con un tamano de 2.000 millones de parametros y licencia Apache 2.0.

El problema que resuelve esta variante es la brecha entre un modelo de pesos en bf16 y el hardware Tensix: los pesos se han cuantizado en formato block-floating-point `bfloat4_b` (BFP4) para las capas DeltaNet, de atención y MLP, manteniendo el resto en bf16/float32. El resultado empaquetado ocupa 1,790 GB frente a los 3,76 GB del bf16 original, con una divergencia media de KL respecto a bf16 de 0,0577, ligeramente por encima del Q4_K_M de llama.cpp (0,0554) y con un tamano algo mayor que este (1,274 GB).

Es relevante ahora porque permite desplegar un modelo multimodal de 2B con capacidades de agente sobre NPUs de Tenstorrent, una alternativa de hardware a las GPU de NVIDIA, con herramientas de empaquetado y verificación (`pack_tensix.py`, `verify_grid.py`) publicadas bajo Apache 2.0 en el repositorio tensix-bfp-gptq v0.1.0. La model card declara soporte de inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas DeltaNet (modelo base Qwen3.5); detalles completos no disponibles |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en DeltaNet, atención y MLP; resto en bf16/float32 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `bfp4/`), empaquetado para Tensix |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer multimodal (pipeline `image-text-to-text`) que, según la nomenclatura de la model card, incorpora capas DeltaNet junto con atención y MLP convencionales. Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento de tipo block-floating-point (BFP4) mediante la herramienta `tensix-bfp-gptq` v0.1.0 de Xylolabs, que produce pesos empaquetados para los núcleos Tensix de Tenstorrent. Las capas DeltaNet, de atención y MLP se almacenan en `bfloat4_b`; el resto de tensores permanecen en bf16 o float32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La innovación técnica destacable es el propio pipeline de cuantización BFP4 orientado a NPU, con utilidades de empaquetado y verificación (`pack_tensix.py`, `verify_grid.py`) que permiten comprobar la integridad de la rejilla de pesos empaquetados y, opcionalmente, hacer round-trip de los valores empaquetados con `--device`.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), orientado a agentes multimodales nativos según el paper citado del equipo Qwen.
- Modo thinking opcional: la plantilla de chat admite el parámetro `enable_thinking` para activar o desactivar el razonamiento extendido.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del repositorio.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) además de inferencia estándar con Transformers sobre GPU/CPU.
- Soporte de tool calling y agentes multi-paso: no confirmado en la información disponible para esta variante.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal es ejecutar un modelo multimodal de 2B sobre NPUs Wormhole o Blackhole usando los pesos empaquetados en `bfp4/`, lo que permite prescindir de GPU NVIDIA en entornos con aceleradores Tensix.
- Prototipado de agentes multimodales en el borde: con 1,790 GB empaquetados, el modelo cabe en memoria de aceleradores de baja capacidad y sirve para validar flujos image-text-to-text antes de escalar a modelos mayores.
- Asistentes conversacionales en inglés y coreano: la plantilla de chat y el modo thinking permiten construir dialogos multi-turno con razonamiento opcional en ambos idiomas declarados.
- Investigación en cuantización BFP4: el repositorio incluye métricas de divergencia KL frente a bf16 y frente a Q4_K_M, útil para estudiar el impacto de la cuantización block-floating-point en modelos multimodales pequenos.
- Verificación de pipelines de empaquetado: `verify_grid.py` y `pack_tensix.py` permiten a ingenieros de hardware validar la conversión de pesos y detectar errores de empaquetado antes de desplegar en producción.
- Evaluación comparativa de backends: al disponer de pesos bf16, Q4_K_M (llama.cpp) y BFP4, se puede comparar calidad y rendimiento entre backends sobre la misma tarea.

## Benchmarks y rendimiento

La model card solo publica métricas de divergencia respecto a bf16, no resultados de tareas (MMLU, HumanEval, GSM8K, etc.).

| Formato | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| bf16 (original) | 3,76 | 0 |
| Q4_K_M (llama.cpp) | 1,274 | 0,0554 |
| BFP4 (`bfp4/`) | 1,790 | 0,0577 |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa 3,76 GB; la variante BFP4 empaquetada ocupa 1,790 GB. La inferencia con Transformers carga los pesos en bf16 (`dtype=torch.bfloat16`), por lo que se requiere al menos el equivalente a ~4 GB de memoria más overhead de activaciones y contexto.
- GPU recomendadas: no especificadas en la model card. Cualquier GPU con al menos 8 GB de VRAM debería poder cargar el modelo en bf16 con Transformers; no se confirma soporte de otras rutas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el dato no está confirmado por el autor.
- Despliegue: Transformers (`AutoModelForImageTextToText`) para inferencia estándar; NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante `pack_tensix.py` y `verify_grid.py` del repositorio tensix-bfp-gptq v0.1.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-2B-Tenstorrent-Tensix | 2B | no disponible | BFP4, 1,790 GB | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | bf16, 3,76 GB | Apache 2.0 | Hugging Face |
| Qwen3.5-2B en Q4_K_M (llama.cpp) | 2B | no disponible | GGUF, 1,274 GB | Apache 2.0 | Conversión comunitaria |

La comparación con otras alternativas de 2B multimodales no se puede completar con los datos proporcionados: no disponible.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia media de KL de 0,0577 frente a bf16, superior a la del Q4_K_M (0,0554), lo que puede degradar la calidad en tareas sensibles.
- El empaquetado BFP4 está disenado para NPUs Tensix; fuera de ese hardware, la ruta recomendada es cargar los pesos con Transformers, que los interpreta en bf16, perdiendo la ventaja de tamano.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está garantizado ni documentado.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para esta variante.
- El modelo base tiene 2B parametros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos mayores.
- Aunque la licencia es Apache 2.0, conviene revisar los ficheros `LICENSE` y `NOTICE` de cada carpeta, ya que la model card indica que cada una lleva los suyos.
- El repositorio fue renombrado el 2026-11-27 (antes `Qwen3.5-2B-Tenstorrent-Tensix-BFP4`), lo que puede romper enlaces o scripts antiguos.
- No se documentan requisitos mínimos de version de `tt-metal`/`ttnn` ni de Transformers para cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-2B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio tensix-bfp-gptq (v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas del repositorio: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
