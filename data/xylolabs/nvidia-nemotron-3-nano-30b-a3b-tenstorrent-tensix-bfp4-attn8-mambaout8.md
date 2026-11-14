# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8

## Resumen

Este repositorio contiene una cuantización del modelo NVIDIA Nemotron-3 Nano 30B-A3B, desarrollada por Xylolabs, específicamente adaptada para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer híbrido de NVIDIA con arquitectura Nemotron-H, que combina capas de atención con capas Mamba-2 y mezcla de expertos (MoE), con 31.577.940.288 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (la designación "A3B" indica 3B activos).

La contribución de Xylolabs consiste en una cuantización selectiva por tipo de tensor: las proyecciones lineales se cuantizan a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ o a `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) mediante redondeo al más cercano, según la sensibilidad de cada matriz. El resultado ocupa aproximadamente 18,98 GB de memoria de dispositivo para los pesos del modelo de lenguaje, con una media de 4,81 bits por peso. Los tensores cuantizados se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar sus valores.

El interés de esta ficha es doble: por un lado, documenta el modelo base Nemotron-3 Nano 30B-A3B, un MoE híbrido de NVIDIA orientado a razonamiento y generación de texto multilingüe; por otro, describe un formato de despliegue muy específico para hardware Tenstorrent, con validación parcial (el autor indica que la ejecución nativa completa del modelo no se ha validado para este perfil exacto). La licencia es la NVIDIA Nemotron Open Model License, no una licencia de código abierto permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Nemotron-H (atención + Mamba-2 + MoE) |
| Parámetros totales | 31.577.940.288 |
| Parámetros activos | aproximadamente 3B (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) con GPTQ; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) con RTN; media de 4,81 bits/peso |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (con código custom de Transformers; empaquetado para TT-NN) |

Detalle de formatos por tensor:

| Tensores | Formato |
|---|---|
| Atención q, k, v, o (6 capas) | bfloat8_b, 8,5 bits/peso |
| Proyección de entrada Mamba-2 (23 capas) | bfloat4_b, 4,5 bits/peso |
| Proyección de salida Mamba-2 (23 capas) | bfloat8_b, 8,5 bits/peso |
| Expertos enrutados up/down y experto compartido up/down (23 capas) | bfloat4_b, 4,5 bits/peso |
| LM head, embeddings, norms y resto de tensores | bf16 |
| `mixer.A_log`, `mixer.D`, `mixer.gate.e_score_correction_bias` | float32 (sin cambios) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Nemotron-H, un transformer híbrido que intercala capas de atención con capas de espacio de estados Mamba-2 y utiliza mezcla de expertos (MoE) en las capas correspondientes. Según los formatos documentados en esta exportación, el modelo contiene 6 capas con atención (q, k, v, o) y 23 capas con proyecciones Mamba-2 y expertos enrutados, además de un experto compartido. La designación A3B implica que, pese a los 31,6B parámetros totales, solo unos 3B se activan por token, lo que reduce el coste computacional de inferencia.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta exportación es la cuantización por bloques con búsqueda de exponente por bloque para BFP4, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones up de los expertos enrutados comparten una única matriz Hessiana por capa; las proyecciones down de cada experto usan su propia Hessiana o redondeo al más cercano cuando vieron pocos tokens de calibración. Los tensores BFP8 se cuantizan con redondeo al más cercano. El autor indica que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de rol de sistema, usuario y asistente.
- Razonamiento y respuesta a preguntas en seis idiomas: inglés, español, francés, alemán, japonés e italiano.
- Mezcla de expertos con enrutamiento por token, lo que permite activar solo una fracción de los parámetros por paso.
- Procesamiento de secuencias largas gracias al componente Mamba-2, que reduce el coste de atención en contextos extensos (longitud exacta no disponible).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información proporcionada para esta variante; deben validarse con el modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Ejecución en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los tensores BFP4/BFP8.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal de esta exportación es servir el modelo en NPU Wormhole o Blackhole usando TT-NN, aprovechando que los pesos ya están empaquetados en los formatos nativos `bfloat4_b` y `bfloat8_b` y ocupan unos 18,98 GB de DRAM de dispositivo.
- Asistente conversacional multilingüe: con soporte para español, francés, alemán, italiano, inglés y japonés, puede atender usuarios en varios idiomas desde un único checkpoint, usando la plantilla de chat incluida.
- Inferencia con presupuesto de memoria ajustado: al reducir los pesos a una media de 4,81 bits, el modelo cabe en configuraciones de memoria donde un checkpoint bf16 de 31,6B parámetros no cabría; útil en entornos con DRAM limitada por dispositivo.
- Procesamiento de documentos largos: la combinación de capas Mamba-2 y atención permite manejar entradas extensas con menor coste de atención que un transformer denso equivalente, adecuado para resumen y extracción de información.
- Investigación en cuantización: el repositorio incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, lo que permite reproducir el empaquetado, verificar que ningún valor cambia al pasar a la rejilla BFP y estudiar el impacto de GPTQ por bloques en modelos MoE híbridos.
- Evaluación comparativa de hardware: sirve como banco de pruebas para medir latencia y throughput de un MoE de 31,6B en Tensix frente a GPU CUDA, dado que el mismo checkpoint puede cargarse con Transformers en CUDA (requiere GPU y `mamba-ssm`).
- Generación de contenido asistida por lotes: para tareas de redacción, traducción entre los seis idiomas soportados y resumen, con la ventaja de que solo se activan unos 3B parámetros por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "Evaluation" que aparece truncada en los datos proporcionados, por lo que no se pueden citar cifras de MMLU, HumanEval, GSM8K ni de comparación con el modelo base BF16.

## Requisitos de hardware

- VRAM/DRAM estimada: aproximadamente 18,98 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y búferes. El tamaño total del repositorio es de 63,2 GB.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante TT-NN (probado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole).
- GPU CUDA: la ejecución de referencia con Transformers requiere GPU CUDA, Transformers 4.57.6 y mamba-ssm 2.3.2.post1. La API de caché upstream es incompatible con Transformers 5.
- GPU consumer: no se especifican modelos concretos; con 18,98 GB de pesos más caché y búferes, un checkpoint de este tamaño no cabe en GPUs consumer de 8-16 GB y requeriría al menos una GPU de 24 GB en el mejor de los casos, sin margen confirmado.
- Opciones de despliegue: TT-NN / tt-metal para Tensix; Transformers con `trust_remote_code=True` para CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la ejecución nativa completa del modelo no se ha validado para este perfil exacto y que tt-transformers y tt-forge no se probaron con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Nemotron-3 Nano 30B-A3B (esta exportación, Xylolabs) | 31,6B | ~3B | no disponible | BFP4/BFP8, 4,81 bits/peso | NVIDIA Nemotron Open Model | Tenstorrent Tensix; CUDA vía Transformers |
| Nemotron-3 Nano 30B-A3B BF16 (NVIDIA) | 31,6B | ~3B | no disponible | bf16 | NVIDIA Nemotron Open Model | GPU CUDA |
| MoE híbridos de ~30B con ~3B activos (categoría general) | ~30B | ~3B | variable | bf16, GPTQ, AWQ | variable | GPU |

No se dispone de datos de rendimiento comparado con alternativas concretas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La licencia es la NVIDIA Nemotron Open Model License, no una licencia de código abierto permisiva; es necesario revisar sus términos antes de cualquier uso comercial.
- El autor indica explícitamente que la ejecución nativa completa del modelo no se ha validado para este perfil exacto de cuantización; la validación se limita al empaquetado de matrices individuales y a la verificación de la rejilla.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, lo que limita las garantías de integración con esos frameworks.
- La cuantización BFP4 con GPTQ introduce pérdida de precisión en las proyecciones Mamba-2 de entrada, en los expertos enrutados y en el experto compartido; el impacto en calidad no está cuantificado en la información disponible.
- La calibración se realizó con 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento en otros dominios o idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual en esta variante.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas sin consultar el modelo base.
- El código del modelo requiere `trust_remote_code=True`; debe auditarse antes de habilitarlo.
- La API de caché del modelo base es incompatible con Transformers 5; el entorno de referencia es Transformers 4.57.6 con mamba-ssm 2.3.2.post1.
- No se documentan sesgos conocidos específicos en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8/blob/main/LICENSE
- Paper de referencia (arXiv): https://arxiv.org/abs/2512.20848
