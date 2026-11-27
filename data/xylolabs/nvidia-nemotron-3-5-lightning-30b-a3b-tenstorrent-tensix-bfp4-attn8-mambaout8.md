# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8

## Resumen

Este repositorio contiene una cuantización del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por Xylolabs y optimizada específicamente para aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base es un transformer híbrido de tipo `nemotron_h` con 32.913.266.240 parámetros totales y una arquitectura Mixture of Experts (el sufijo A3B indica aproximadamente 3.000 millones de parámetros activos por token), desarrollado originalmente por NVIDIA. El checkpoint aquí distribuido no es un modelo nuevo, sino una conversión de pesos a formatos de bloque de coma flotante (BFP4 y BFP8) que el hardware Tensix puede ejecutar de forma nativa.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 30B en hardware de inferencia no convencional (NPUs de Tenstorrent) con un tamaño empaquetado de 18,985 GB, frente a los 65,8 GB del repositorio completo en BF16. La cuantización aplica `bfloat4_b` (GPTQ con búsqueda de exponente por bloque) a las proyecciones de entrada de Mamba-2 y a las proyecciones de expertos enrutados y compartidos, y `bfloat8_b` (redondeo al más cercano) a las proyecciones de salida de Mamba-2 y a las proyecciones de atención. El modelo conserva capacidades conversacionales y multilingües (inglés, español, francés, alemán, italiano y japonés) bajo licencia OpenMDW-1.1.

El checkpoint está pensado para despliegue en Tensix, aunque también puede cargarse con Transformers 5.23.0 mediante la implementación `NemotronHForCausalLM`, lo que facilita su validación en GPU antes de portarlo a la NPU. La ficha siguiente detalla sus especificaciones, arquitectura, capacidades, rendimiento medido y limitaciones conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `nemotron_h` con capas Mamba-2 y capas de atención (MoE en las capas Mamba-2) |
| Parametros totales | 32.913.266.240 |
| Parametros activos | Aproximadamente 3.000 millones por token (denominación A3B) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para proyecciones de entrada Mamba-2 y expertos; BFP8 (`bfloat8_b`) para salida Mamba-2 y atención; BF16 para LM head, embeddings, norms y tensores `mtp`; float32 para `e_score_correction_bias` |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (empaquetado Tensix, 18,985 GB); compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención con capas Mamba-2. Según la información del repositorio, la red contiene 6 capas con proyecciones de atención (q, k, v, o) y 23 capas con bloques Mamba-2, cuyas proyecciones de entrada y salida se cuantizan de forma diferenciada. Las capas Mamba-2 incorporan un mecanismo Mixture of Experts con expertos enrutados y un experto compartido, cuyas proyecciones `up` y `down` se almacenan en BFP4. Esta combinación de atención y estado recurrente lineal (Mamba-2) busca reducir el coste computacional en secuencias largas manteniendo la calidad de un transformer denso de tamaño comparable.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La cuantización aquí publicada no reentrena el modelo: aplica GPTQ con búsqueda de exponente por bloque sobre los tensores BFP4 y redondeo al más cercano sobre los BFP8, manteniendo en BF16 el LM head, los embeddings, las normas y los tensores del módulo `mtp` (multi-token prediction). El proceso de empaquetado y verificación está implementado en `tools/pack_tensix.py` y `tools/verify_grid.py`, distribuidos sin cambios en el repositorio. Todos los 6.004 matrices cuantizadas superaron la comprobación de rejilla, y la comprobación de empaquetado TT-NN sobre `ttsim` cubrió las capas 0 y 1 (260 matrices) con coincidencia exacta de valores.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del modelo base.
- Razonamiento y respuesta a preguntas en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Capacidades de código y matemáticas heredadas del modelo base Nemotron 3.5 Lightning (no se detallan métricas específicas en la información disponible).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Módulo `mtp` (multi-token prediction) conservado en BF16 y float32, lo que sugiere soporte de decodificación especulativa o predicción de múltiples tokens, aunque no se detalla su uso en inferencia.
- Ejecución nativa en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante los kernels y el runner de `tensix-kernels` y `tensix-runner`.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el checkpoint está empaquetado para ejecutarse en NPUs Wormhole y Blackhole con `ttnn`, lo que permite servir un modelo de 30B en hardware no GPU con 18,985 GB de pesos y kernels validados contra `ttsim`.
- Validación y comparación de cuantizaciones: al estar disponible también en Transformers, permite medir la degradación de BFP4/BFP8 frente a BF16 y frente a Q4_K_M de llama.cpp (KL media de 0,0503 frente a 0,0346) antes de comprometerse con el despliegue en NPU.
- Asistentes conversacionales multilingües: el soporte de seis idiomas y la plantilla de chat permiten construir interfaces de atención al cliente en español, francés, alemán, italiano y japonés sobre un único checkpoint.
- Investigación en arquitecturas híbridas Mamba-2 + atención: al conservar la estructura original y el módulo `mtp`, sirve para estudiar el comportamiento de las capas recurrentes y del enrutamiento de expertos bajo cuantización agresiva.
- Prototipado en entornos con restricciones de memoria: los 18,985 GB empaquetados reducen la huella frente a los 65,8 GB del repositorio BF16, lo que facilita pruebas en nodos con DRAM limitada.
- Generación de texto por lotes en pipelines de Transformers: la carga con `AutoModelForCausalLM` y `dtype="bfloat16"` permite integrar el modelo en flujos existentes de Hugging Face antes de migrar a Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) | No disponible | 0 (referencia) | No disponible |
| Este checkpoint (BFP4/BFP8 Tensix) | 18,985 | 0,0503 | No disponible |
| llama.cpp Q4_K_M | No disponible | 0,0346 | No disponible |

La información proporcionada solo incluye la comparación de divergencia KL frente a BF16. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GB en el formato empaquetado Tensix (18,985 GB); en Transformers con `device_map="auto"` y `dtype="bfloat16"` se requiere espacio para los tensores BF16 del LM head, embeddings, normas y `mtp`, además de los pesos cuantizados.
- GPU recomendadas: no especificadas en la información proporcionada. Para la ruta Transformers se necesita una GPU con al menos 24 GB de VRAM para cargar el checkpoint completo con comodidad; no confirmado por el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) para la ruta Transformers, aunque no está confirmado en la documentación; la ruta nativa Tensix requiere NPU Wormhole o Blackhole.
- Opciones de despliegue: Transformers 5.23.0 con `NemotronHForCausalLM`; `tensix-runner` v0.1.0 con `tensix-kernels` v0.1.0 sobre `ttnn`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware |
|---|---|---|---|---|
| Este checkpoint (Xylolabs) | 32,9B totales, ~3B activos | No disponible | OpenMDW-1.1 | BFP4/BFP8 Tensix, 18,985 GB |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 32,9B totales, ~3B activos | No disponible | OpenMDW-1.1 | BF16, repositorio de 65,8 GB |
| llama.cpp Q4_K_M (referencia de cuantización) | 32,9B totales, ~3B activos | No disponible | OpenMDW-1.1 | Q4_K_M, tamaño no disponible |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento funcional con alternativas de la misma categoría; la única métrica disponible es la KL media frente a BF16.

## Limitaciones y advertencias

- La cuantización BFP4/BFP8 introduce una divergencia media de KL de 0,0503 frente a BF16, un 45 % superior a la de llama.cpp Q4_K_M (0,0346); puede degradar tareas sensibles a la precisión numérica.
- El checkpoint está optimizado para Tensix; fuera de ese hardware, la ruta Transformers requiere cargar pesos cuantizados y puede no reproducir el rendimiento previsto.
- No se han publicado evaluaciones de sesgo, alucinación o seguridad para esta cuantización concreta.
- La longitud de contexto no está documentada en la información disponible, lo que impide garantizar ventanas largas en producción.
- El soporte de tool calling, agentes y razonamiento multi-paso no está confirmado explícitamente.
- La licencia OpenMDW-1.1 impone condiciones de uso; debe revisarse el texto completo antes de un despliegue comercial.
- El repositorio tiene 200 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8/blob/main/LICENSE
