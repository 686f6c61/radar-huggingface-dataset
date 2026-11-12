# Xylolabs/Qwen3.5-4B-Base-Tensix-BFP4

## Resumen

Qwen3.5-4B-Base-Tensix-BFP4 es una versión cuantizada del modelo base Qwen/Qwen3.5-4B-Base, publicada por Xylolabs y específicamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura híbrida del original (atención clásica más Gated DeltaNet, un mecanismo de atención lineal) y aplica cuantización de bloque en coma flotante (block floating point, BFP) a las capas lineales, de modo que los pesos ya residen en la rejilla numérica que TT-NN espera, sin necesidad de reconversión en tiempo de carga.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de cuantización orientada a hardware no-GPU: en lugar de GGUF o AWQ para CUDA, se usa GPTQ con búsqueda de exponente por bloque para producir tensores `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8). Por otro, permite ejecutar un modelo de 5.295.564.288 parámetros totales en un espacio empaquetado de 3,28 GB, con una media de 6,25 bits por peso, lo que reduce drásticamente los requisitos de memoria frente al checkpoint en bf16.

Es importante subrayar que se trata de un modelo *base* preentrenado, no ajustado por instrucciones: continúa texto, no sigue órdenes. Además, la evaluación publicada por el autor se limita al modelo de lenguaje y se realizó en el simulador `ttsim` (Blackhole), no en hardware físico. El pipeline declarado es `image-text-to-text`, lo que sugiere que el checkpoint conserva el bloque visual del modelo original en bf16, aunque el autor indica explícitamente que solo cuantizó y evaluó el modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica (q, k, v, o) en 8 capas + Gated DeltaNet (atención lineal) en 24 capas + MLP en 32 capas; incluye bloque MTP y bloque visual (mantenidos en bf16) |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) con GPTQ y búsqueda de exponente por bloque; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) con redondeo al más cercano; media de 6,25 bits/peso; pesos almacenados en bf16 ya sobre la rejilla BFP |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya cuantizados a la rejilla BFP4/BFP8); índice en `model.safetensors.index.json`; mapa de formatos en `quant4.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B-Base, que combina capas de atención clásica con capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste computacional en secuencias largas. El checkpoint incluye además un bloque MTP (multi-token prediction) y un bloque visual, ambos preservados en bf16 sin cuantizar. La cuantización afecta únicamente a las proyecciones lineales: las matrices q, k, v, o de atención (8 capas), las q, k, v, z y la salida de Gated DeltaNet (24 capas) y las gate, up y down del MLP (32 capas) se almacenan en BFP4; las proyecciones a y b de Gated DeltaNet (24 capas) se almacenan en BFP8. La LM head (atada al embedding), el embedding y las normas quedan en bf16.

El proceso de cuantización BFP4 emplea GPTQ con una búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores BFP8 se obtuvieron por redondeo al más cercano. El resultado son ficheros bf16 cuyos valores ya caen exactamente en la rejilla BFP, de forma que TT-NN los empaqueta sin transformación adicional; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) para comprobar que ningún valor cambia al empaquetar. No se describe en la información disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones: es un modelo base.

## Capacidades

- Generación de texto por continuación: al ser un modelo base, predice el siguiente token y continúa texto; no está ajustado para seguir instrucciones.
- Razonamiento y conocimiento general heredados de Qwen3.5-4B-Base (sin datos de benchmarks específicos en la información disponible).
- Procesamiento image-text-to-text según el pipeline declarado, con el bloque visual conservado en bf16; el autor no documenta ni evalúa esta capacidad.
- Soporte de atención lineal mediante Gated DeltaNet, orientado a secuencias largas con coste reducido.
- Predicción multi-token (bloque MTP) presente en el checkpoint en bf16.
- Tool calling / function calling: no disponible (no documentado; al ser un modelo base no se espera soporte nativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (requeriría ajuste por instrucciones).
- Capacidades multilingües: no disponible (no se declaran idiomas; la calibración incluyó coreano).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso principal es ejecutar el modelo en Wormhole o Blackhole con TT-NN, aprovechando que los pesos ya están en la rejilla BFP4/BFP8 y se empaquetan sin conversión; adecuado para entornos que buscan inferencia fuera de GPU con bajo consumo.
- Investigación en cuantización BFP: sirve como referencia reproducible para estudiar el impacto de GPTQ con búsqueda de exponente por bloque en un transformer híbrido, comparando la media de 6,25 bits/peso frente al bf16 original.
- Prototipado de continuación de texto: con la plantilla de chat del tokenizer pero sin ajuste por instrucciones, es útil para tareas de completado, generación de documentación o prompts few-shot donde no se requiere seguimiento estricto de órdenes.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar la integridad numérica de cada matriz antes de desplegar en hardware, útil en CI de compilación de modelos para TT-Metal.
- Evaluación de degradación por cuantización: la tabla de evaluación (KL medio frente a BF16, Top-1, respuestas correctas) permite medir la pérdida de calidad al pasar de bf16 a BFP4/BFP8 en un modelo de ~5,3 mil millones de parámetros.
- Base para ajuste fino posterior: al estar bajo Apache 2.0 y en formato transformers, puede servir como punto de partida para fine-tuning orientado a instrucciones antes de volver a cuantizar para Tensix.
- Experimentación con atención lineal: las 24 capas de Gated DeltaNet permiten estudiar el comportamiento de mecanismos de estado recurrente en tareas de contexto largo, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial (el texto proporcionado se corta tras la fila de BF16). Los datos disponibles son:

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B-Base) | 16 | no disponible | referencia | no disponible | no disponible | no disponible |
| Tensix BFP4 (este checkpoint) | 6,25 (media) | 3,28 | no disponible en el extracto | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de la comparación completa frente a BF16; la tabla de la model card aparece truncada. La evaluación se realizó en el simulador `ttsim` (Blackhole) con ttnn 0.81.1, no en hardware físico, y solo cubre el modelo de lenguaje.

## Requisitos de hardware

- VRAM / memoria: el checkpoint empaquetado ocupa 3,28 GB; el repositorio completo pesa 10,6 GB (incluye tensores en bf16 y bloques MTP y visual sin cuantizar).
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. El autor probó el empaquetado con ttnn 0.81.1 en `ttsim` (simulador de Blackhole) y construyó las capas 0 a 3 con `MESH_DEVICE=P150` en el demo de tt-metal, sin ejecución completa.
- GPU: no es el destino del checkpoint; puede cargarse en GPU vía transformers con `device_map="auto"` en bf16, lo que requiere aproximadamente 10,6 GB de memoria para los 5,3 mil millones de parámetros.
- GPU de consumo: en bf16 cabría en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); la cuantización BFP no aporta ventaja en GPU porque TT-NN es el único runtime que la interpreta de forma nativa.
- Opciones de despliegue: TT-NN / tt-metal (demo Qwen3.5/3.6 en la rama v0.81.1, con `QWEN36_SPEC=0` para omitir el bloque MTP); transformers para carga en GPU/CPU; tt-forge (tt-xla) aún no probado con este checkpoint; vLLM, llama.cpp, Ollama y TGI no están soportados de forma nativa para este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones en hardware Tensix.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-Tensix-BFP4 | 5.295.564.288 | no disponible | BFP4/BFP8 para Tensix (6,25 bits/peso medio) | Apache 2.0 | Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B-Base | no disponible (modelo base del anterior) | no disponible | bf16 | Apache 2.0 (según el checkpoint derivado) | Hugging Face |
| Versiones GGUF/AWQ de Qwen3.5-4B | mismo orden (~4-5 mil millones) | no disponible | Q4_K_M, AWQ, GPTQ para GPU/CPU | Apache 2.0 | no disponible en la informacion proporcionada |

La comparación con alternativas cuantizadas para GPU no puede completarse con los datos disponibles: no se han proporcionado métricas de rendimiento de otros checkpoints ni resultados de benchmarks comparables.

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no sigue órdenes de forma fiable; requiere prompts de continuación o few-shot.
- Evaluación limitada: solo se evaluó el modelo de lenguaje, en el simulador `ttsim`, no en hardware Tensix real; no hay ejecución completa documentada.
- Tabla de evaluación truncada en la información disponible: no se pueden confirmar los valores de KL, Top-1 ni respuestas correctas del checkpoint cuantizado.
- La cuantización BFP4 a 4,5 bits por peso introduce degradación numérica respecto a bf16; el autor reporta la métrica de KL pero no se dispone del valor completo.
- El bloque MTP y la LM head se re-cuantizan en el demo de tt-metal (bf16 → bfloat8_b / bfloat4_b), lo que puede alterar ligeramente el comportamiento respecto al checkpoint original.
- El bloque visual se conserva en bf16 pero no se ha evaluado ni documentado su funcionamiento en esta versión.
- Idiomas no declarados; la calibración con Wikipedia en coreano puede introducir sesgo hacia ese idioma en la cuantización, sin datos que lo confirmen.
- Riesgo de alucinación inherente a un modelo base de ~5,3 mil millones de parámetros; sin RLHF no hay mitigación específica.
- Licencia Apache 2.0 permite uso comercial, pero el formato BFP solo es útil con TT-NN; en otros runtimes los pesos se cargan como bf16 y se pierde la ventaja de tamaño.
- Dependencia de versiones concretas: ttnn 0.81.1 y la rama v0.81.1 de tt-metal; tt-transformers no soporta esta arquitectura y tt-forge no se ha probado.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tensix-BFP4/blob/main/LICENSE
