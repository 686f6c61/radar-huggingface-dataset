# tahamajs/llava-qwen-0.5b-vig-attention-scienceqa

## Resumen

`llava-qwen-0.5b-vig-attention-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" (attention surgery) desarrollada en el marco del proyecto NeuralOps por el autor `tahamajs`. El modelo sustituye el mecanismo de atención cuadrática estándar en 18 de las 24 capas del decodificador Qwen2 por un operador denominado ViGAttention, inspirado en Vision GNN, que combina una rama de atención lineal con kernel softplus y una rama de atención dispersa sobre ventana local con ancla en el primer token, fusionadas mediante una compuerta aprendida por cabeza y por token.

El objetivo del checkpoint es demostrar la viabilidad de reducir el coste computacional de un VLM pequeño (0,5B parámetros) sin destruir su capacidad de razonamiento visual, preservando seis capas con atención cuadrática como anclas. El modelo se ha ajustado por destilación de conocimiento sobre el subconjunto con imagen del dataset ScienceQA, alcanzando un 36,88 % de precisión y una perplejidad de 3,05 en validación, frente a un 63,75 % del profesor original.

Es relevante ahora como artefacto de investigación reproducible: el repositorio publica únicamente los pesos quirúrgicos (148,74 MB en FP16, un 91,3 % menos que el modelo base completo de 1,66 GB), junto con un manifiesto de topología quirúrgica, telemetría de entrenamiento completa y métricas legibles por máquina. No es un modelo pensado para producción generalista, sino una pieza de un "zoo" de experimentos de atención que permite comparar operadores modernos bajo condiciones controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención ViGAttention en 18/24 capas |
| Parametros totales | 0,5B (modelo base `llava-interleave-qwen-0.5b-hf`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el repositorio no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `attention_only_fp16`, 318 tensores) |
| Dimension del decodificador | D=1024, H=16 cabezas, head_dim=64 |
| Capas con atención cuadrática preservada | 6 capas ancla: `[3, 7, 11, 15, 19, 23]` |
| Huella en disco | 148,74 MB (155.964.760 bytes); paquete total 163,94 MB |
| Librería | `neuralops` |
| Pipeline | `image-text-to-text` |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`, que combina una torre de visión SigLIP congelada de 27 capas, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La intervención quirúrgica reemplaza el módulo `self_attn` en 18 de las 24 capas del decodificador según el esquema `hybrid_3_1`, manteniendo atención cuadrática estándar en las capas `[3, 7, 11, 15, 19, 23]` como anclas. Los MLPs, embeddings y la torre de visión permanecen congelados y no se serializan en el artefacto publicado.

El operador ViGAttention implementa dos ramas paralelas: una rama de grafo con ventana local y ancla en el primer token (atención dispersa) y una rama lineal con kernel softplus de memoria O(N) y normalización L2, combinadas mediante fusión con compuerta aprendida por cabeza y por token. El ajuste se realizó en dos etapas de destilación de conocimiento (51 y 121 pasos, 172 en total) sobre el subconjunto con imagen de ScienceQA, con un coste de 120,7 segundos en una única RTX 3090 y un pico de 6.609 MB de VRAM. También se entrenaron las layer norms del decodificador.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM (ciencias, matemáticas elementales) sobre el subconjunto con imagen de ScienceQA.
- Razonamiento visual de un solo turno con formato de prompt conversacional (`<image>\nQuestion: ...`).
- Formato de chat mediante `chat_template.json` incluido en el repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta capacidad de visión de vídeo, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre eficiencia de atención: comparar ViGAttention frente a atención cuadrática estándar en un VLM pequeño bajo el mismo protocolo de evaluación (ScienceQA con imagen), usando las métricas publicadas como línea base.
- Reproducción de experimentos de attention surgery: el manifiesto `surgical_manifest.json` (esquema `neuralops.surgery/v2`) permite auditar exactamente qué prefijos de tensores se modificaron, lo que facilita replicar o extender la intervención a otras capas.
- Destilación de conocimiento a bajo coste: la telemetría (172 pasos, 120,7 s, 6,6 GB de VRAM pico en una RTX 3090) sirve como referencia para diseñar pipelines de KD asequibles en hardware de consumo.
- Docencia y formación técnica: ejemplo didáctico de sustitución modular de operadores de atención en un transformer multimodal, con artefacto de 148,74 MB que cabe en cualquier equipo.
- Evaluación de operadores en el "zoo" NeuralOps: punto de comparación dentro de una familia de checkpoints que aplican distintos operadores (lineales, dispersos, híbridos) al mismo modelo base.
- Pruebas de integración de la librería `neuralops`: el snippet público `load_surgeried_model` permite validar el flujo de carga de modelos quirúrgicos en entornos de desarrollo.
- Prototipado de asistentes educativos STEM: con las limitaciones de precisión indicadas, puede usarse para explorar interfaces de preguntas visuales sobre material científico, siempre con revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Evaluación sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 35,00 | 36,88 | +1,88 |
| Perplejidad (PPL) | 2,45 | 5,95 | 3,05 | -2,90 |

Telemetría de entrenamiento declarada:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 (24 GB) |
| Pasos de optimización | 172 (etapa 1: 51; etapa 2: 121) |
| Duración del entrenamiento | 120,7 s |
| VRAM pico | 6.609 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el entrenamiento con destilación cupo en 6.609 MB de VRAM en una RTX 3090; la inferencia del modelo base de 0,5B en FP16 requiere del orden de 1-2 GB, pero esta cifra no está confirmada en la documentación del repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el autor usó una RTX 3090. No se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del modelo base (0,5B) y el artefacto de 148,74 MB.
- Opciones de despliegue: la vía documentada es la librería `neuralops` mediante `load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; los pesos son un delta quirúrgico de atención, no un checkpoint completo autónomo, por lo que requieren el modelo base y la lógica de reconstrucción de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-vig-attention-scienceqa` | 0,5B | no disponible | 36,88 % acc / 3,05 PPL | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros checkpoints del zoo NeuralOps (`attention-zoo`) | 0,5B | no disponible | no disponible | MIT (según repositorio del autor) | Hugging Face |

La comparación con alternativas de la misma categoría (otros VLM de 0,5B o modelos especializados en ScienceQA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida sustancial de precisión frente al profesor: 36,88 % frente a 63,75 % en ScienceQA con imagen, una caída de 26,87 puntos porcentuales. No es apto para uso en producción sin validación adicional.
- El checkpoint es un delta quirúrgico de atención (`attention_only_fp16`), no un modelo completo: requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para reconstruirse.
- Idiomas: solo inglés documentado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; el operador ViGAttention está diseñado para eficiencia en secuencias largas, pero no se publican mediciones al respecto.
- Riesgo de alucinación: no evaluado en la model card; un modelo de 0,5B con precisión del 36,88 % en su tarea objetivo presenta alta probabilidad de respuestas incorrectas.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, culturales o de género.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso comercial de un modelo con esta precisión en tareas STEM no está recomendado.
- Métricas no verificadas (`verified: false`): los resultados proceden únicamente del autor y no han sido replicados de forma independiente.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.
- El repositorio no incluye los pesos del proyector multimodal ni de la torre de visión, que permanecen congelados en el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-vig-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps (código y licencia): https://github.com/tahamajs/NeuralOps
- Implementación de ViGAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/vig_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (variante usada): https://huggingface.co/datasets/derek-thomas/ScienceQA
