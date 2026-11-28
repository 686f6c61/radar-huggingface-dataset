# Xylolabs/AREX-2-Tensix-BFP4

## Resumen

AREX-2-Tensix-BFP4 es una cuantización de los pesos de BAAI/AREX-2, el ajuste fino orientado a agentes que el Beijing Academy of Artificial Intelligence (BAAI) construyó sobre Qwen/Qwen3.8-27B. La publica Xylolabs y su rasgo diferencial es el formato: block floating point (BFP4 y BFP8) pensado para ejecutarse de forma nativa en las NPU Tensix de Tenstorrent mediante el stack tt-metal/ttnn, no en GPU convencionales. El pipeline declarado es image-text-to-text, de modo que el modelo conserva la entrada multimodal del modelo base.

El modelo resuelve el problema de desplegar un LLM multimodal de ~27.000 millones de parámetros en hardware de inferencia de Tenstorrent con una huella de memoria muy reducida: la variante BFP4 empaquetada ocupa 17,596 GB frente a los 53,79 GB del BF16 original, con una divergencia media de KL de 0,03640 respecto a BF16 medida sobre 16.240 posiciones de texto en inglés y coreano. La variante BFP8 ocupa 30,963 GB con una KL de 0,00082, prácticamente indistinguible del original.

Es relevante ahora porque demuestra un flujo de cuantización específico para aceleradores Tensix (formatos bfloat4_b y bfloat8_b del tile layout de ttnn) aplicado a un modelo de agentes de última generación, con scripts de empaquetado y verificación incluidos y licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas DeltaNet (derivada de Qwen3.8-27B); cuantizacion block floating point para Tensix |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b en atención, DeltaNet y MLP; LM head en bfloat8_b; resto bf16) y BFP8 (bfloat8_b en atención, DeltaNet y MLP; resto bf16) |
| Idiomas soportados | no disponible (la evaluacion KL cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos quant4.json / indices de empaquetado para ttnn) |

## Arquitectura y entrenamiento

El modelo base BAAI/AREX-2 es un ajuste fino de Qwen/Qwen3.8-27B orientado a agentes, descrito en el paper "AREX-2: Advancing Self-Improving Agents through Long-Horizon Reflective Tasks" (arXiv:2609.38288). La arquitectura combina atención con capas DeltaNet, tal como se deduce de la nomenclatura de los módulos cuantizados (attention, DeltaNet, MLP). El pipeline image-text-to-text indica que el modelo procesa entradas de imagen y texto. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

La aportación técnica de esta ficha es la cuantización: Xylolabs aplica block floating point con granularidad de bloque sobre las matrices de atención, DeltaNet y MLP, manteniendo el LM head en bfloat8_b y el resto de tensores en bf16. El repositorio incluye `pack_tensix.py` (empaquetado de matrices al formato ttnn, con opción `--device` para verificar el round-trip por DRAM del dispositivo) y `verify_grid.py` (verificación de la rejilla empaquetada). La evaluación de calidad se hace por divergencia KL frente a BF16 sobre WikiText-2 y Wikipedia en coreano, en texto plano y con plantilla de chat.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno mediante plantilla de chat.
- Entrada multimodal image-text-to-text (pipeline declarado).
- Capacidades de agente y tareas de horizonte largo heredadas del ajuste fino de AREX-2 sobre Qwen3.8-27B.
- Ejecución nativa en NPU Tenstorrent Tensix con los formatos bfloat4_b y bfloat8_b de ttnn.
- Compatibilidad con el stack tt-metal (demo `models/demos/qwen38_27b_qb2`) y con Transformers para generación en CPU/GPU usando los pesos empaquetados.
- Soporte multilingüe: no confirmado más allá de la evaluación en inglés y coreano; no disponible la lista oficial de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar la carpeta `bfp4/` o `bfp8/` en una NPU Tensix mediante ttnn para servir inferencia de un modelo de 27B con 17,6 GB o 31,0 GB de pesos empaquetados, respectivamente, reduciendo la presión sobre DRAM del dispositivo.
- Investigación en cuantización block floating point: usar los pares BFP4/BFP8 y sus valores de KL (0,03640 y 0,00082) como referencia para estudiar el impacto de la precisión en modelos multimodales de gran tamaño.
- Evaluación de agentes de horizonte largo: aprovechar el ajuste fino de AREX-2 para probar flujos de razonamiento reflexivo y multi-paso en entornos controlados, comparando el comportamiento BFP4 frente a BF16.
- Prototipado multimodal: emplear el pipeline image-text-to-text para tareas de descripción de imágenes o respuesta a preguntas visuales en hardware de borde con NPU Tensix.
- Validación de pipelines de empaquetado: ejecutar `pack_tensix.py` y `verify_grid.py` como base para integrar nuevos modelos en el formato de tiles de ttnn dentro de un CI interno.
- Benchmarking de hardware: comparar latencia y throughput del demo `qwen38_27b_qb2` en distintas configuraciones de Tensix frente a alternativas en GPU, usando el JSON de salida del demo.
- Sustitución de despliegues GPU por NPU: para equipos que ya operan con tt-metal v0.81.1, servir un modelo de 27B en BFP8 con pérdida de calidad mínima (KL 0,00082) sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son las métricas de fidelidad de cuantización frente a BF16:

| Formato | Tamano empaquetado (GB) | KL media vs BF16 |
|---|---|---|
| bfp4 | 17,596 | 0,03640 |
| bfp8 | 30,963 | 0,00082 |
| BF16 (BAAI/AREX-2) | 53,79 | 0 |
| Q4_K_M (llama.cpp) | 16,547 | 0,02480 |

La KL se calcula sobre 16.240 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat.

## Requisitos de hardware

- VRAM/DRAM: 17,6 GB para la carpeta `bfp4/` y 31,0 GB para `bfp8/` (pesos empaquetados); el repositorio completo ocupa 106,0 GB.
- Hardware objetivo: NPU Tenstorrent Tensix con el stack tt-metal v0.81.1 compilado según su INSTALLING.md; el demo de referencia es `models/demos/qwen38_27b_qb2/README.md`.
- GPU consumer: no es el objetivo del modelo; la ejecución en Transformers requiere cargar los pesos con `dtype="bfloat16"` y `device_map="auto"`, lo que implica una huella cercana a la del BF16 y no cabe en GPU consumer de 24 GB.
- GPU de datacenter: no disponible la recomendación oficial; por tamaño, un modelo de 27B en bf16 requiere del orden de 54 GB, lo que apunta a A100 80 GB o H100 80 GB si se usa Transformers.
- Opciones de despliegue: ttnn/tt-metal para Tensix; Transformers para generación de referencia; llama.cpp solo como referencia comparativa de cuantización (Q4_K_M), no como formato publicado en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/AREX-2-Tensix-BFP4 | 27,36B | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face, 173 descargas |
| BAAI/AREX-2 (BF16) | 27,36B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | ~27B | no disponible | safetensors | no disponible | Hugging Face |
| Q4_K_M de AREX-2 (llama.cpp) | 27,36B | no disponible | GGUF Q4_K_M | Apache 2.0 | Referencia en la model card |

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia de KL de 0,03640 frente a BF16, superior a la de Q4_K_M (0,02480); para tareas sensibles a la precisión conviene usar BFP8 (KL 0,00082).
- El formato está diseñado para Tensix; fuera de ese hardware los pesos deben cargarse con Transformers en bf16, perdiendo la ventaja de memoria.
- No se han publicado evaluaciones de sesgo, alucinación ni seguridad en la información disponible.
- La lista de idiomas soportados no está declarada; la evaluación solo cubre inglés y coreano.
- La longitud de contexto no se especifica en la información proporcionada; no debe asumirse la del modelo base sin verificarla.
- El repositorio tiene 0 likes y 173 descargas, lo que indica una validación comunitaria todavía muy limitada.
- El modelo base es un ajuste fino de agentes: su comportamiento en tareas generales puede diferir del de Qwen3.8-27B original.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el archivo NOTICE con los cambios realizados por Xylolabs.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/AREX-2-Tensix-BFP4
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper AREX-2: https://arxiv.org/abs/2609.38288
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix/blob/main/LICENSE
