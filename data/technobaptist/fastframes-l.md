# TechnoBaptist/FastFrames-L

## Resumen

FastFrames-L es un modelo de generación de vídeo texto-a-vídeo (text-to-video, T2V) desarrollado por Apple AIML Research, publicado bajo el identificador `TechnoBaptist/FastFrames-L` en Hugging Face. Se trata de la variante grande (14B parámetros) de la familia FastFrames, que también incluye FastFrames-S (1.3B). A diferencia de los modelos de difusión tradicionales que requieren decenas de pasos de denoising, FastFrames emplea un esquema autorregresivo de dos pasos que permite generar vídeo a 480p con latencia interactiva.

El modelo se construye a partir de Wan2.1-T2V-14B mediante un proceso de destilación en dos fases: primero se destila Wan2.1-14B en un modelo causal de dos pasos siguiendo la receta Causal Forcing++, y después se entrenan el decodificador de píxeles y la red de refinamiento de KV del mismo modo que en FastFrames-S. El resultado es un generador capaz de producir clips de 81 fotogramas a 16 fps (832 × 480) con una latencia notablemente inferior a la de los modelos de difusión convencionales.

La relevancia de FastFrames-L radica en su enfoque hacia la latencia interactiva: los autores reportan tiempos de componente del orden de decenas de milisegundos por llamada al DiT, lo que habilita aplicaciones de generación y control de vídeo en tiempo casi real. No obstante, el modelo está publicado bajo licencia Apple Sample Code License (apple-amlr), con restricciones importantes para uso comercial, y el repositorio no incluye idiomas declarados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión autorregresivo causal de dos pasos (destilado de Wan2.1-T2V-14B) con decodificador de píxeles y red de refinamiento de KV |
| Parámetros totales | 14B (variante L); la familia incluye también FastFrames-S de 1,3B |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Sample Code License); LingBot-World v2 bajo CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FastFrames-L es un modelo de difusión autorregresivo de dos pasos construido sobre Wan2.1-T2V-14B. El pipeline de entrenamiento consta de varias etapas: primero se entrena un profesor causal sobre latentes generados por Wan2.1-14B; después se aplica una destilación de consistencia; a continuación una destilación DMD (Distribution Matching Distillation); y finalmente se entrena el generador final junto con el decodificador de píxeles y la red de refinamiento de KV. Este esquema permite reducir drásticamente el número de evaluaciones del DiT necesarias para generar un clip completo.

La innovación técnica principal es el esquema de dos pasos con refinamiento de KV y decodificación de píxeles ligera. Según los datos de perfilado publicados para FastFrames-S en una GPU a 480p, una evaluación del DiT en t=1000 tarda 16,1 ms, otra en t=833 tarda 16,2 ms, el refinamiento de KV 2,2 ms y el decodificador de píxeles 0,9 ms, para un total de 35,4 ms (36 ms en el paper). La generación produce vídeo de 832 × 480 con 81 fotogramas a 16 fps. El modelo se apoya en los trabajos previos Wan2.1, Self-Forcing y Causal Forcing++, cuyos autores se reconocen en la model card. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) a 832 × 480, 81 fotogramas, 16 fps.
- Generación autorregresiva de dos pasos con latencia interactiva (del orden de decenas de milisegundos por componente en FastFrames-S).
- Control de cámara condicionado en la demo interactiva con LingBot (versión optimizada de LingBot 1.3B, 16 veces más rápida que la oficial).
- Perfilado de latencia por componente (DiT, refinamiento de KV, decodificador de píxeles).
- Evaluación VBench de calidad, semántica y puntuación total reproducible mediante scripts.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, multilingüismo, visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo de 832 × 480 a 16 fps con 81 fotogramas, adecuado para piezas breves de redes sociales, con la ventaja de una latencia baja que permite iterar sobre prompts rápidamente.
- Prototipado de storyboards: gracias a la generación en dos pasos y a la baja latencia, se pueden generar variantes de una escena para validar guiones antes de producir vídeo final.
- Demos interactivas de control de cámara: la integración con LingBot permite controlar la cámara de forma fluida en un demo local (`apps/lingbot/demo.py`), útil para previsualización cinematográfica.
- Investigación en destilación de modelos de difusión: los checkpoints intermedios liberados (profesor causal, destilación de consistencia, destilación DMD, generador final) permiten estudiar cada etapa del pipeline.
- Evaluación comparativa con VBench: los scripts de evaluación permiten reproducir las puntuaciones de calidad, semántica y total para comparar con otros generadores T2V.
- Generación de material para datasets sintéticos de vídeo: el modelo puede producir clips de forma masiva en pipelines por lotes (`generate_project_page.py`) para aumentar datasets de entrenamiento de otros modelos de visión.
- Perfilado y optimización de inferencia: los benchmarks de latencia por componente permiten analizar cuellos de botella en despliegues multigpu (`--gpus 8`).

## Benchmarks y rendimiento

La información disponible incluye perfiles de latencia para FastFrames-S, pero no resultados numéricos de benchmarks de calidad para FastFrames-L. Se indica que existe una tabla VBench (Quality / Semantic / Total) reproducible mediante scripts, pero no se proporcionan los valores en la información disponible.

| Componente (FastFrames-S, 1 GPU, 480p) | Llamadas | Latencia por llamada | Latencia total |
|---|---:|---:|---:|
| Evaluación del DiT, t=1000 | 1 | 16,1 ms | 16,1 ms |
| Evaluación del DiT, t=833 | 1 | 16,2 ms | 16,2 ms |
| Refinamiento de KV | 1 | 2,2 ms | 2,2 ms |
| Decodificador de píxeles | 1 | 0,9 ms | 0,9 ms |
| **Total** | | | **35,4 ms** (paper: 36 ms) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de vídeo y no de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 173,5 GB en safetensors, lo que sugiere requisitos elevados para la variante de 14B.
- GPU recomendadas: se requiere Linux x86-64 con GPU NVIDIA y driver compatible con CUDA 12.8. Los scripts admiten ejecución en 1 GPU o en 8 GPUs (`--gpus 8`) para FastFrames-L.
- Cabe en GPU de consumo: no disponible; no se especifica en la información proporcionada.
- Opciones de despliegue: el repositorio oficial usa `uv sync` y scripts propios (`scripts/generate.py`, `evaluation/latency/benchmark.py`, `apps/lingbot/demo.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: para FastFrames-S en 1 GPU a 480p, latencia total de 35,4 ms por clip según perfilado. Para FastFrames-L no se proporcionan cifras de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFrames-L | 14B | 832 × 480, 81 frames, 16 fps | no disponible | apple-amlr | Hugging Face (repo 173,5 GB) |
| FastFrames-S | 1,3B | 832 × 480, 81 frames, 16 fps | 35,4 ms por clip (1 GPU, 480p) | apple-amlr | Hugging Face |
| Wan2.1-T2V-14B | 14B | no disponible | mayor (modelo de difusión base, no destilado) | no disponible en esta ficha | Hugging Face (Wan-AI) |
| LingBot 1.3B (optimizado) | 1,3B | control de cámara condicionado | 16× más rápido que el oficial | CC BY-NC-SA 4.0 | Hugging Face |

La comparación se limita a los modelos mencionados en la model card; no se dispone de datos de benchmarks de calidad comparativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: apple-amlr (Apple Sample Code License) para el código y pesos de FastFrames; LingBot-World v2 bajo CC BY-NC-SA 4.0. Ambas imponen restricciones relevantes para uso comercial; conviene revisar los términos antes de desplegar en producción.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir contenido incoherente, artefactos o escenas que no se correspondan con el prompt, especialmente en prompts ambiguos o complejos.
- Idiomas no declarados: la model card no especifica idiomas soportados; el rendimiento multilingüe en prompts no está documentado.
- Contexto no especificado: no se documenta la longitud de contexto ni el número máximo de tokens de prompt.
- Sin benchmarks de calidad publicados en la información disponible: no se pueden comparar sus puntuaciones VBench con las de otros modelos a partir de los datos proporcionados.
- Repositorio de gran tamaño (173,5 GB): requiere almacenamiento y ancho de banda considerables para su descarga y despliegue.
- Dependencia de terceros: el modelo se apoya en Wan2.1, Self-Forcing y Causal Forcing++, cuyas licencias y condiciones pueden afectar al uso final.
- Paper y arXiv marcados como "coming soon": la documentación técnica completa puede no estar disponible todavía.

## Enlaces

- Hugging Face: https://huggingface.co/TechnoBaptist/FastFrames-L
- FastFrames-S (modelo pequeño): https://huggingface.co/apple/FastFrames-S
- FastFrames-L (modelo grande, repo oficial): https://huggingface.co/apple/FastFrames-L
- Página del proyecto: https://apple-aiml-research.github.io/ml-fastframes/
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-fastframes
- Guía de instalación y checkpoints: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/installation.md#checkpoints
- Guía de inferencia (perfilado y generación): https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/inference.md
- Guía de entrenamiento: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/training.md
- Guía de demo con LingBot: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/lingbot.md#interactive-demo-13b
- Licencia Apple Sample Code: https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE
- Licencia LingBot: https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE_LINGBOT
- Agradecimientos: https://github.com/apple-aiml-research/ml-fastframes/blob/main/ACKNOWLEDGEMENTS
- Wan2.1: https://github.com/Wan-Video/Wan2.1
- Self-Forcing: https://github.com/guandeh17/Self-Forcing
- Causal Forcing++: https://github.com/thu-ml/Causal-Forcing
