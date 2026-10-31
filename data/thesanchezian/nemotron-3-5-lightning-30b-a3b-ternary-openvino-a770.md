# TheSanchezian/Nemotron-3.5-Lightning-30B-A3B-Ternary-OpenVINO-A770

## Resumen

Este repositorio contiene una conversión a OpenVINO del modelo Nemotron 3.5 Lightning 30B-A3B con pesos ternarios, optimizada específicamente para ejecutarse en una Intel Arc A770 de 16 GB. El modelo base es NVIDIA Nemotron 3.5 Lightning 30B-A3B, una arquitectura híbrida que combina capas Mamba-2, atención y una mezcla de expertos (MoE) con 128 expertos y 6 activos por token. La conversión parte de los pesos ternarios publicados por nota-ai, lo que reduce drásticamente el tamaño del modelo (9,8 GB en formato OpenVINO IR) y permite inferencia en hardware de consumo.

El valor diferencial de esta ficha no es el modelo en sí, sino el trabajo de ingeniería del autor (TheSanchezian): kernels OpenCL personalizados para las capas Mamba-2 y MoE, un plugin de GPU de OpenVINO parcheado y una atención optimizada que solo lee los slots de KV ocupados. El resultado medido es de 91,30 tok/s de generación y 549,8 tok/s de procesamiento de prompt en una única Arc A770, sin decodificación especulativa ni prompt lookup. Es relevante como demostración de que modelos MoE ternarios de 30B pueden correr con buen rendimiento en GPUs Intel de gama media-alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención + MoE (128 expertos, 6 activos) |
| Parametros totales | 30B (aproximado, según denominación 30B-A3B) |
| Parametros activos | 3B (6 de 128 expertos por token, según denominación A3B) |
| Longitud de contexto | Verificado hasta 16k tokens en este repo; valor oficial no disponible en la información proporcionada |
| Tipos de cuantizacion | Pesos ternarios (2-bit) en expertos y proyecciones; output head en Q8_0 (valores del GGUF original) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (modelo); Apache-2.0 (OpenVINO y plugin parcheado) |
| Formato de pesos | OpenVINO IR (.xml + .bin, 9,8 GB); repo completo 19,6 GB |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3.5 Lightning 30B-A3B, es un transformer híbrido que intercala capas de atención estándar con bloques Mamba-2 (arquitectura de espacio de estados selectiva) y una capa MoE con 128 expertos de los cuales se activan 6 por token. Esta combinación reduce el coste computacional por token generado, ya que solo se ejecutan los expertos enrutados, y mejora la eficiencia en secuencias largas gracias a las capas Mamba-2, que no requieren caché KV completa.

Sobre este modelo se aplicaron los pesos ternarios de nota-ai, una cuantización extrema a 2-bit que comprime los expertos y proyecciones hasta situar el modelo en 9,8 GB. Sobre esa base, el autor de este repo desarrolló ops personalizadas con kernels OpenCL para Mamba-2 (convolución + scan), MoE (up/down y router) y una atención que solo procesa los slots de KV llenos. No hay datos de entrenamiento propios en este repo: es una conversión y optimización de inferencia, no un reentrenamiento. La corrección numérica se validó contra un grafo de referencia f16: 30/30 tokens greedy idénticos en prompts cortos y logit coseno de 0,99985 en un prompt de 300 tokens.

## Capacidades

- Generación de texto general como modelo base Nemotron 3.5 Lightning (el repo no incluye chat runner ni servidor).
- Procesamiento eficiente de prompts largos: 549,8 tok/s de prefill en Arc A770, verificado hasta 16k tokens en chunks de 256.
- Ejecución local en GPU Intel Arc con 16 GB de VRAM, sin necesidad de hardware NVIDIA.
- Inferencia con un solo pase hacia adelante por token generado (sin decodificación especulativa ni prompt lookup).
- Estado reiniciable por prompt mediante `reset_state()`, adecuado para sesiones multi-turno gestionadas manualmente.
- Capacidades de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en PCs con GPU Intel Arc: permite ejecutar un modelo de 30B parámetros (3B activos) en una Arc A770 de 16 GB sin alquilar GPUs de datacenter, ideal para desarrolladores que ya tienen hardware Intel.
- Prototipado de kernels y ops personalizadas: el repo incluye los kernels OpenCL, los scripts de construcción y los parches del plugin, útil como referencia para quien trabaje en optimización de inferencia sobre OpenVINO.
- Procesamiento rápido de documentos largos en local: con 549,8 tok/s de prefill, resumir o analizar textos de varios miles de tokens es viable en una tarjeta de consumo.
- Chatbots locales experimentales: aunque no hay servidor incluido, el bucle de inferencia de `eval_nemo.py` puede adaptarse para construir una interfaz conversacional con estado por sesión.
- Pruebas de calidad de cuantización ternaria: la validación numérica contra el grafo f16 sirve de método de referencia para evaluar degradación en otras conversiones ternarias.
- Base para plataformas de IA totalmente locales: el autor lo desarrolla para MustacheOS, un proyecto de plataforma de IA local, lo que indica su orientación a despliegues offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni del modelo base ni de esta conversión. Los únicos datos medidos son de rendimiento de inferencia en Arc A770 y de corrección numérica:

| Métrica | Valor |
|---|---|
| Generación (decode, batch 1, greedy) | 91,30 tok/s (mediana 10,95 ms sobre 300 pasos) |
| Procesamiento de prompt (1024 tokens) | 549,8 tok/s |
| Rendimiento inicial antes de optimizar | 36,5 tok/s generación / 286 tok/s prompt |
| Coincidencia greedy vs referencia f16 | 30/30 tokens en 3 prompts |
| Logit coseno (prompt de 300 tokens) | 0,99985 |
| Verificación de prefill por chunks | Mismo top-1 token hasta 16k tokens |

## Requisitos de hardware

- VRAM: cabe en 16 GB (pesos de 9,8 GB más activaciones y estado Mamba/KV); es la configuración probada.
- GPU recomendada: Intel Arc A770 16 GB (única tarjeta probada; otras Arc sin verificar). No requiere GPU NVIDIA.
- Compatible con GPU de consumo: sí, específicamente diseñado para Arc A770.
- Sistema operativo: Windows (el plugin parcheado es una DLL).
- Software: Python con `openvino==2026.4.1`, plugin de GPU parcheado incluido en `plugin/` (sustituye a `openvino_intel_gpu_plugin.dll`), tokenizer del modelo base (no incluido).
- Despliegue: solo mediante scripts propios del repo (`scripts/eval_nemo.py`); no hay soporte de vLLM, llama.cpp, Ollama ni TGI. No hay servidor ni chat runner incluidos.
- Latencia: mediana de 10,95 ms por token en generación. Primera compilación del modelo: unos 5 minutos; ejecuciones posteriores cargan desde caché en segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B Ternary (este repo) | 30B (3B activos) | Mamba-2 + atención + MoE | OpenVINO IR ternario (9,8 GB) | Intel Arc A770 16 GB | OpenMDW-1.1 |
| nota-ai/Nemotron-3.5-Lightning-30B-A3B-Nota-Ternary-MLX-1014 (base) | 30B (3B activos) | Mamba-2 + atención + MoE | MLX ternario | Apple Silicon | OpenMDW-1.1 |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (modelo original) | 30B (3B activos) | Mamba-2 + atención + MoE | BF16 | GPUs de datacenter (VRAM mucho mayor) | OpenMDW-1.1 |

La alternativa MLX de nota-ai cubre el ecosistema Apple; esta conversión cubre el ecosistema Intel Arc con OpenVINO, un nicho con pocas opciones optimizadas para modelos MoE ternarios.

## Limitaciones y advertencias

- Solo probado en Intel Arc A770 16 GB con Windows; otras tarjetas Arc, Linux u otros GPUs no están verificados.
- Requiere sustituir la DLL del plugin de GPU de OpenVINO por la versión parcheada, lo que obliga a usar un venv dedicado y puede romperse con actualizaciones de OpenVINO (los parches corrigen los issues upstream openvinotoolkit/openvino#39296 y #39297).
- No incluye tokenizer, chat runner, servidor ni plantilla de chat: hay que tomar el tokenizer del modelo base y construir el bucle de inferencia manualmente.
- Es necesario llamar a `reset_state()` antes de cada nuevo prompt; no hacerlo corrompe el estado Mamba/KV.
- La primera compilación tarda unos 5 minutos.
- Las verificaciones de corrección son numéricas contra un grafo f16, no un benchmark de calidad del modelo: la degradación real por la cuantización ternaria en tareas de lenguaje no está cuantificada en el repo.
- Sesgos, riesgo de alucinación y capacidades multilingües del modelo base: no disponible en la información proporcionada; consultar la model card del modelo original de NVIDIA.
- Licencia OpenMDW-1.1: revisar sus términos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- Proyecto en progreso: el autor indica que hay trabajo de kernels en curso y que las mediciones pueden cambiar.

## Enlaces

- Repositorio: https://huggingface.co/TheSanchezian/Nemotron-3.5-Lightning-30B-A3B-Ternary-OpenVINO-A770
- Modelo base (pesos ternarios): https://huggingface.co/nota-ai/Nemotron-3.5-Lightning-30B-A3B-Nota-Ternary-MLX-1014
- Modelo original NVIDIA (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Issues upstream de OpenVINO referenciados: https://github.com/openvinotoolkit/openvino/issues/39296 y https://github.com/openvinotoolkit/openvino/issues/39297
- Paper, blog o demo del modelo base: no disponible en la información proporcionada.
