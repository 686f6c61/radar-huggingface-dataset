# TinoBruno/moecher-nemotron-3.5-lightning-vision

## Resumen

NVIDIA Nemotron 3.5 Lightning (30B-A3B) NVFP4 es un modelo de lenguaje de tipo mixto de expertos (MoE) desarrollado por NVIDIA, empaquetado y prealineado por TinoBruno para su ejecución con el motor de inferencia bare-metal MinnieTheMoEcher. El modelo combina una arquitectura híbrida que intercala capas Mamba-2 SSM, capas de atención GQA y capas MoE dispersas, con un total de aproximadamente 30.000 millones de parámetros de los cuales solo unos 3.500 millones se activan por token. Esta relación de activación reducida permite un rendimiento de decodificación viable en GPUs de consumo con 16 GB de VRAM.

La relevancia de este paquete reside en su cuantización nativa NVFP4 (4 bits en coma flotante) y en el motor de streaming dinámico de VRAM de MinnieTheMoEcher, que mantiene el modelo completo dentro de un presupuesto estricto de menos de 14,8 GB de VRAM. El repositorio no contiene pesos en formato estándar (safetensors o GGUF), sino tensores binarios empaquetados con offsets de diseño y una tabla de escalas FP32 precalculada para la desquantización sin latencia.

El paquete se complementa con un delegado de visión externo (FrankensTin Vision Delegate, basado en un ViT de Qwen2.5-VL 3B cuantizado) para percepción de escenas y OCR, por lo que las capacidades multimodales no residen en el backbone de texto sino en un componente separado. La licencia es la NVIDIA Open Model License, que permite uso comercial con condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 SSM + GQA Transformer + MoE disperso |
| Parametros totales | ~30 mil millones |
| Parametros activos | ~3,5 mil millones por token |
| Longitud de contexto | 64k tokens (ventana de las capas GQA) |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante), escalas FP32 duales |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | Binario empaquetado (`.bin`) con manifiesto JSON; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Lightning (30B-A3B) en su variante NVFP4. La arquitectura consta de 52 capas organizadas de forma intercalada: 24 capas Mamba-2 SSM con estado recurrente (`ssm_d_state=128`, `ssm_d_conv=4`, `expand=2`, `dt_rank=64`), 23 capas MoE dispersas con 128 expertos enrutados y 6 expertos activos por token, activación Squared ReLU (`ReLU(x)^2`) y escala de enrutamiento de 2,5x, y 5 capas de atención GQA con 32 cabezas de consulta, 2 cabezas KV, dimensión de cabeza 128 y ventana de contexto de 64k tokens. El vocabulario es de 131.072 tokens BPE.

El empaquetado de TinoBruno reorganiza los pesos en tres ficheros binarios: `attention_dense_layers.bin` (5,03 GB) con embeddings, capas Mamba-2, atención GQA, normas y LM head; `expert_weights.bin` (16,53 GB) con 2.944 expertos MoE alineados a páginas de 4 KB para streaming Direct I/O en tiempo O(1); y `expert_scales.bin` (23,5 KB) con la tabla de escalas FP32 duales para desquantización NVFP4 sin latencia. El manifiesto `moecher_manifest.json` contiene la configuración completa, los offsets de diseño de tensores y los tipos de capa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el tag `reasoning` indica soporte para tareas de razonamiento; el modelo base está orientado a generación de texto.
- Generación de código: el paquete se describe como backbone de texto y código.
- Capacidades multimodales delegadas: la percepción visual (escenas y OCR) no reside en el backbone, sino en el FrankensTin Vision Delegate (ViT de Qwen2.5-VL 3B cuantizado), que se descarga como componente separado.
- Servidor compatible con OpenAI: expone un endpoint `/v1` con nombre de modelo `nemotron-3.5-lightning`, integrable con clientes como Cursor, Continue o la librería `openai` de Python.
- Interfaz web local: UI con estilo Gemini servida en `http://localhost:8001`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse como backend de autocompletado y generación en editores compatibles con OpenAI (Cursor, Continue) apuntando a `http://localhost:8001/v1`, aprovechando sus 64k tokens de contexto para incluir ficheros completos en la ventana.
- Generación de texto y razonamiento en estación de trabajo con 16 GB: al caber en una RTX 5060 Ti 16GB con ~14,7 GB de VRAM, permite ejecutar un modelo de 30B totales en hardware de consumo sin depender de la nube.
- Procesamiento de documentos largos: la ventana de 64k tokens de las capas GQA permite resumir o extraer información de documentos extensos en una sola pasada.
- OCR y percepción de escenas: mediante el FrankensTin Vision Delegate, el sistema puede extraer texto de imágenes y describir escenas, útil para digitalización de documentos o accesibilidad.
- Servidor de inferencia local para equipos pequeños: el servidor OpenAI-compatible permite compartir el modelo en una red interna con clientes estándar, sin coste por token.
- Prototipado de aplicaciones con streaming de expertos: el motor MinnieTheMoEcher y el formato binario permiten experimentar con inferencia MoE de bajo consumo de VRAM, útil para investigación sobre eficiencia de memoria.
- Evaluación de cuantización NVFP4 en Blackwell: permite medir el impacto de la cuantización de 4 bits en coma flotante sobre un modelo híbrido Mamba-2/MoE en GPUs sm_120.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son de inferencia:

| Metrica | Valor |
|---|---|
| Throughput de decodificación | 11,5 – 16,0 tok/s en RTX 5060 Ti 16GB |
| Throughput de prefill | ~8 – 15 tok/s (prefill denso, single-stream) |
| Huella de VRAM | ~14,7 GB (5,03 GB densos + 7,6 GB caché L1 de expertos + estados KV/SSM) |

## Requisitos de hardware

- VRAM estimada: ~14,7 GB para inferencia completa con la caché L1 de expertos; presupuesto estricto de menos de 14,8 GB.
- GPU objetivo: NVIDIA GeForce RTX 5060 Ti 16GB (Blackwell sm_120); compatible con cualquier GPU Blackwell sm_120, Ada sm_89 o Ampere sm_80 con al menos 16 GB de VRAM (RTX 4080, RTX 4090).
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM.
- RAM de host: al menos 16 GB de DRAM.
- Almacenamiento: SSD NVMe rápido con al menos 25 GB libres (el streaming Direct I/O de expertos depende del rendimiento del disco).
- Opciones de despliegue: motor propietario MinnieTheMoEcher (C++/CUDA) con CLI y servidor OpenAI-compatible; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es binario empaquetado y no estándar.
- Latencia y throughput: 11,5 – 16,0 tok/s de decodificación y ~8 – 15 tok/s de prefill en RTX 5060 Ti 16GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo, por lo que la comparación se limita a características estructurales. Los modelos comparables serían otros MoE de ~30B totales con pocos parámetros activos y contexto largo.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (este paquete) | ~30B / ~3,5B | 64k | NVIDIA Open Model License | Binario empaquetado, MinnieTheMoEcher |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B NVFP4 (original) | ~30B / ~3,5B | 64k | NVIDIA Open Model License | NVFP4 (formato original de NVIDIA) |
| Alternativas de ~30B MoE con contexto largo | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (por ejemplo, otros MoE de ~30B con activación reducida) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; al ser un modelo de lenguaje generativo, existe riesgo inherente, especialmente en tareas de razonamiento sin verificación.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Licencia: NVIDIA Open Model License; es necesario revisar las condiciones de uso comercial, atribución y restricciones del texto completo de la licencia antes de desplegar en producción.
- Formato propietario: los pesos no están en safetensors ni GGUF, por lo que no son compatibles con el ecosistema estándar (vLLM, llama.cpp, Ollama, TGI); el uso queda ligado al motor MinnieTheMoEcher.
- Dependencia de disco: el streaming de expertos requiere SSD NVMe rápido; un disco lento degradará el throughput de forma significativa.
- Visión delegada: las capacidades visuales dependen de un componente externo (FrankensTin Vision Delegate) que debe descargarse por separado; el backbone de texto no procesa imágenes por sí mismo.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria del paquete.
- Fecha de creación futura (2026-11-01): conviene verificar la vigencia y el soporte del paquete antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/TinoBruno/moecher-nemotron-3.5-lightning-vision
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Licencia: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4/blob/main/LICENSE
- Motor MinnieTheMoEcher (GitHub): https://github.com/tinobruno/MinnieTheMoEcher
- Delegado de visión: https://huggingface.co/TinoBruno/frankenstin-vision-delegate
