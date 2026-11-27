# Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen2.5-7B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen2.5-7B de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El problema que resuelve es el despliegue eficiente de un LLM de 7.600 millones de parámetros en hardware de inferencia dedicado, reduciendo el peso empaquetado de 15,23 GB en bf16 a 6,262 GB mediante formatos de coma flotante por bloques (block floating point, BFP).

La particularidad técnica es que no se trata de una cuantización convencional de pesos enteros, sino de un esquema mixto: las proyecciones MLP (gate, up, down) se cuantizan a `bfloat4_b` (BFP4) con GPTQ y búsqueda de exponente por bloque, mientras que las proyecciones de atención (q, k, v, o) se mantienen en `bfloat8_b` (BFP8) por redondeo al más cercano. El head LM, los embeddings y las normas permanecen en bf16. Es relevante ahora porque permite ejecutar un modelo de la familia Qwen2.5 en aceleradores Tensix con una degradación de calidad medida y acotada, algo poco habitual en el ecosistema de cuantización, dominado por GGUF y formatos para GPU.

El modelo base es de tipo decoder-only transformer, con 7.615.616.512 parámetros y pensado para generación de texto en inglés. Esta versión es el checkpoint preentrenado, no ajustado por instrucciones, por lo que continúa texto en lugar de seguir instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP; BFP8 (`bfloat8_b`) en atencion; bf16 en LM head, embeddings y normas |
| Idiomas soportados | Ingles (segun metadatos; evaluacion incluye tambien texto en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix, 6,262 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B original: un transformer decoder-only denso de 28 capas con atención multi-cabeza y proyecciones MLP de tipo SwiGLU. Esta publicación no reentrena el modelo; aplica un proceso de cuantización post-entrenamiento sobre el checkpoint `Qwen/Qwen2.5-7B`. Las 28 capas tienen sus proyecciones de atención (q, k, v, o) en `bfloat8_b` y sus proyecciones MLP (gate, up, down) en `bfloat4_b`. El fichero `quant4.json` documenta el formato de cada proyección.

La innovación técnica está en el esquema de cuantización: los tensores BFP4 se generan con GPTQ combinado con una búsqueda de exponente por bloque, mientras que los BFP8 usan redondeo al más cercano. Los formatos BFP de Tenstorrent comparten un exponente por bloque, lo que encaja con el hardware Tensix y con las primitivas `ttnn.bfloat4_b` / `ttnn.bfloat8_b`. El autor verifica la integridad del empaquetado con `pack_tensix.py` (round-trip por DRAM del dispositivo) y `verify_grid.py` (comprobación solo con torch), y confirma que los mismos valores empaquetan exactamente en `ttnn.bfloat8_b`. La ejecución se valida con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent, y con tt-transformers (tt-metal v0.81.1) usando `--use_hf_rope`.

## Capacidades

- Generación de texto autoregresiva y continuación de texto (modelo preentrenado, no instruido).
- Razonamiento y conocimiento general heredados del Qwen2.5-7B base.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas en esta cuantización).
- Plantilla de chat del modelo base conservada en el tokenizer, aunque el modelo no está ajustado por instrucciones.
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn.
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio para esta publicación.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: despliegue del modelo en NPU Wormhole o Blackhole usando tt-transformers con `precision_cfg = {ff1_3: bfp4, ff2: bfp4, wqkv: bfp8, wo: bfp8, ...}`, aprovechando el empaquetado nativo BFP para minimizar el uso de DRAM.
- Servicio de continuación de texto y autocompletado: al ser un modelo preentrenado, encaja en tareas de generación libre, reescritura o completado de documentos donde no se requiere seguir instrucciones.
- Prototipado de pipelines de cuantización BFP: sirve como referencia reproducible para validar herramientas como `pack_tensix.py` y `verify_grid.py` antes de cuantizar modelos propios.
- Evaluación comparativa de calidad de cuantización: su métrica de KL medio frente a bf16 (0,05152) y top-1 (89,88 %) permite contrastar esquemas BFP4/BFP8 frente a alternativas como Q4_K_M en estudios de degradación.
- Investigación en eficiencia de hardware: útil para medir el equilibrio entre tamaño empaquetado (6,262 GB) y fidelidad de salida en NPU, con vistas a ajustar configuraciones de precisión por capa.
- Base para ajuste fino posterior: el checkpoint en safetensors y licencia Apache 2.0 permiten partir de él para tareas específicas, aunque requeriría reconvertir los pesos si se abandona el hardware Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-7B) | 15,23 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,262 | 0,05152 | 89,88 |
| Q4_K_M (llama.cpp) | 4,683 | 0,03655 | 90,81 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 6,262 GB empaquetado para Tensix; 15,23 GB en bf16 si se carga con transformers en GPU.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- En GPU consumer: la versión bf16 (15,23 GB) requiere al menos 16 GB de VRAM; encajaría en RTX 4090 (24 GB) o A100/H100, pero el formato BFP4/BFP8 está pensado para Tensix, no para GPU.
- Despliegue en Tensix: tt-metal v0.81.1 con tt-transformers y `--use_hf_rope`; validado sobre ttsim (simulador Blackhole) con ttnn 0.81.1.
- Despliegue en GPU: transformers con `dtype="bfloat16"` y `device_map="auto"`; también compatible con text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8) | 7,6 B | no disponible | 6,262 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen2.5-7B (bf16) | 7,6 B | no disponible | 15,23 GB | Apache 2.0 | GPU/CPU |
| Qwen2.5-7B Q4_K_M (llama.cpp) | 7,6 B | no disponible | 4,683 GB | Apache 2.0 | CPU/GPU (GGUF) |

La comparación relevante es de fidelidad y tamaño: frente a Q4_K_M, esta versión ocupa más espacio (6,262 GB frente a 4,683 GB) y tiene peor KL (0,05152 frente a 0,03655) y top-1 (89,88 % frente a 90,81 %), pero está empaquetada para ejecutarse de forma nativa en NPU Tensix, algo que los formatos GGUF no ofrecen.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: continúa texto y no sigue órdenes de forma fiable.
- Idiomas: los metadatos declaran solo inglés; la evaluación incluye coreano, pero no hay garantías multilingües documentadas.
- Degradación de calidad respecto a bf16: KL medio de 0,05152 y top-1 de 89,88 %, superior en error a Q4_K_M.
- El formato BFP4/BFP8 es específico de Tensix; fuera de ese hardware hay que usar la versión bf16 o reconvertir los pesos.
- Riesgo de alucinación inherente al modelo base, no mitigado en esta publicación.
- Sesgos del modelo base no evaluados ni documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar `NOTICE` por los cambios respecto al modelo original.
- Longitud de contexto no documentada en esta ficha; verificar en la model card de Qwen2.5-7B antes de usos con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
