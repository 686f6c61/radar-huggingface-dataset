# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-Attn8-MambaOut8

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-Attn8-MambaOut8 es una cuantización del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por Xylolabs y optimizada específicamente para aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante el stack tt-metal/ttnn. El modelo base es un transformer híbrido de NVIDIA con arquitectura Nemotron-H, que combina capas de atención con capas Mamba-2 en un esquema de mezcla de expertos (MoE) con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, de ahí el sufijo A3B.

La aportación de esta versión no es el modelo en sí, sino el formato de pesos: las capas lineales se han cuantizado a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ y a `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) mediante redondeo al más cercano, de forma que TT-NN puede empaquetarlas directamente sin recalcular valores. El resultado son 4,81 bits por peso de media y 18,98 GB empaquetados, lo que permite ejecutar un modelo de 30B en memoria DRAM de NPU Tensix con un coste de precisión medido en divergencia KL frente al BF16 original.

Es relevante ahora porque demuestra una vía práctica de despliegue de modelos MoE híbridos grandes en hardware no-GPU, y porque el ecosistema de cuantización específica por acelerador (block floating point nativo de Tensix) empieza a producir artefactos publicados y verificables. La licencia es la NVIDIA Nemotron Open Model License, no una licencia permisiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H: transformer híbrido con capas de atención y capas Mamba-2, mezcla de expertos (MoE) |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | Aproximadamente 3B (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) con GPTQ y búsqueda de exponente por bloque; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) por redondeo al más cercano; capas no lineales en bf16; tensores `A_log`, `D` y `e_score_correction_bias` en float32 |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license (license: other) |
| Formato de pesos | safetensors (con código custom de NVIDIA vía `trust_remote_code`), empaquetables directamente en TT-NN |

Detalle de cuantización por tensor: atención q, k, v, o (6 capas) en BFP8; proyección de entrada Mamba-2 (23 capas) en BFP4; proyección de salida Mamba-2 (23 capas) en BFP8; expertos enrutados up/down y experto compartido up/down (23 capas) en BFP4; LM head, embeddings, normas y resto de tensores en bf16. Media de 4,81 bits por peso, 18,98 GB empaquetados.

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Nemotron-H de NVIDIA: un transformer híbrido en el que conviven capas de atención clásica (6 capas, según el reparto de tensores de esta cuantización) con capas Mamba-2 (23 capas), organizadas en un esquema de mezcla de expertos con expertos enrutados y un experto compartido. Este diseño busca reducir el coste de atención en contextos largos manteniendo la calidad de un transformer denso, y el componente MoE mantiene bajo el número de parámetros activos (unos 3B) frente a los 31,58B totales.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. Lo que sí está documentado es el proceso de cuantización de esta exportación: GPTQ con búsqueda de exponente por bloque para los tensores BFP4, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; redondeo al más cercano para los BFP8. Las proyecciones up de los expertos enrutados comparten una única matriz Hessiana por capa, mientras que cada experto usa su propia Hessiana en la proyección down, o recurre a redondeo al más cercano si vio pocos tokens de calibración. Los tensores cuantizados se almacenan como valores bf16 sobre la rejilla BFP4/BFP8, de modo que TT-NN los empaqueta sin alterar sus valores; el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban la igualdad exacta tras el empaquetado.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas de conocimiento general (el ejemplo de la model card es un QA simple).
- Capacidades multilingües en inglés, español, francés, alemán, japonés e italiano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; la model card solo declara `text-generation`.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso de uso principal y documentado. El checkpoint está pensado para cargarse en NPUs Wormhole o Blackhole a través de tt-metal/ttnn, ocupando 18,98 GB de DRAM de dispositivo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. Es adecuado porque los tensores ya están en el formato nativo de empaquetado de TT-NN.
- Inferencia de un modelo de 30B en un único dispositivo de memoria limitada: al reducir el peso a 4,81 bits por peso de media, un MoE de 31,58B cabe en el presupuesto de DRAM de una NPU Tensix, algo inviable en BF16 (que requeriría más del doble).
- Servicio de chat multilingüe: con soporte declarado de seis idiomas, puede atender conversaciones en inglés, español, francés, alemán, japonés e italiano usando la plantilla de chat del tokenizador.
- Evaluación de precisión de cuantización: el repositorio publica métricas de divergencia KL y Top-1 frente al BF16, lo que lo hace útil como referencia para estudiar el impacto de BFP4 con GPTQ en modelos híbridos Mamba-atención.
- Investigación en hardware no-GPU: sirve como banco de pruebas para medir el rendimiento real de tt-transformers y tt-forge sobre modelos MoE híbridos, aunque el autor advierte que esas herramientas no se han ejecutado con este checkpoint.
- Generación de texto por lotes en pipelines offline: al ser un modelo de texto puro con licencia de modelo abierto de NVIDIA, encaja en procesos de síntesis o anotación de datos donde el throughput importa más que la latencia interactiva, siempre que se respete la licencia.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación cuyo contenido está truncado en la información disponible; solo se conocen las columnas (bits por peso, tamaño en GB, KL medio frente a BF16, Top-1 en porcentaje, respuestas correctas, perdidas) y no los valores numéricos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: 18,98 GB solo para los pesos del modelo de lenguaje, más espacio adicional para KV cache y buffers de ejecución.
- Aceleradores objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.
- GPU consumer: el quickstart de referencia requiere una GPU CUDA y se validó con Transformers 4.57.6 y mamba-ssm 2.3.2.post1; no se especifica VRAM mínima ni GPU concretas. No disponible el detalle de qué RTX soportarían la carga completa.
- Despliegue en Tensix: tt-metal/ttnn para empaquetado y ejecución; tt-transformers y tt-forge no se han probado con este checkpoint.
- Despliegue en GPU: Transformers con `trust_remote_code=True` y `device_map="auto"`; requiere el código custom de NVIDIA y la API de caché upstream es incompatible con Transformers 5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-30B-A3B Tensix BFP4) | 31,58B totales / ~3B activos | no disponible | BFP4/BFP8 para Tensix, 4,81 bits/peso | NVIDIA Nemotron Open Model License | Hugging Face, orientado a NPU Tensix |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58B totales / ~3B activos | no disponible | BF16 | NVIDIA Nemotron Open Model License | Hugging Face, GPU |
| Alternativas de otros fabricantes con MoE de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es frente al modelo base en BF16, que es el referente de calidad que la propia model card usa para medir la pérdida por cuantización (KL y Top-1). No se dispone de datos para comparar con modelos de terceros de la misma categoría.

## Limitaciones y advertencias

- La licencia es la NVIDIA Nemotron Open Model License, no una licencia de código abierto estándar: hay que revisar sus términos antes de cualquier uso comercial.
- El autor advierte que la ejecución nativa del modelo completo no se ha validado para este perfil exacto de cuantización; la verificación se limita al empaquetado de matrices y a la simulación con ttsim.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que el soporte en esos stacks es teórico.
- El quickstart con Transformers requiere `trust_remote_code=True` y ejecuta código custom de NVIDIA; hay que auditarlo antes de habilitarlo, y la API de caché es incompatible con Transformers 5.
- La cuantización BFP4 introduce pérdida de precisión frente a BF16; la magnitud exacta no está disponible porque la tabla de evaluación está truncada en la información consultada.
- Riesgo de alucinación y sesgos: no disponible información específica en la documentación proporcionada; son riesgos esperables en un modelo de lenguaje de esta familia.
- Longitud de contexto no documentada en esta ficha: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El modelo está pensado para hardware Tensix; en GPU el rendimiento y la viabilidad práctica no están caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-Attn8-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-Attn8-MambaOut8/blob/main/LICENSE
- Paper referenciado en los tags: arXiv:2512.20848 (no se dispone del título en la información proporcionada)
