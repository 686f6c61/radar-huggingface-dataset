# suyong-3/ReQuest

## Resumen

ReQuest es un framework de seleccion de fotogramas (frame selection) orientado a preguntas para tareas de question answering sobre videos de larga duracion. Lo desarrolla el grupo ailab-kyunghee (Kyunghee University) y se presenta en el paper "ReQuest: Rethinking-based Question-Aware Frame Selection for Long-Form Video QA", aceptado en ECCV 2026. El repositorio de Hugging Face no contiene un modelo de lenguaje multimodal completo, sino los checkpoints del selector de fotogramas entrenados para el framework.

El problema que resuelve es el coste computacional y la perdida de informacion al procesar videos largos con MLLMs: en lugar de alimentar todos los fotogramas a 1 fps al modelo multimodal, ReQuest puntua cada fotograma contra la pregunta y selecciona un subconjunto relevante. El mecanismo es plug-and-play: cuando LLaVA-Video (el MLLM base, 7B) muestra incertidumbre en su primera respuesta, el selector re-puntua los fotogramas y el MLLM responde de nuevo usando solo los fotogramas seleccionados.

El repositorio ocupa 0,2 GB y contiene tres checkpoints `.pth` (uno por benchmark: Video-MME, LongVideoBench y MLVU), todos provenientes de un unico entrenamiento sobre pseudo-etiquetas publicadas como dataset aparte. La licencia es Apache 2.0 y el pipeline no esta declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de fotogramas question-aware sobre MLLM base LLaVA-Video-7B-Qwen2 (arquitectura del selector no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); checksums en `SHA256SUMS` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del selector mas alla de que puntua cada fotograma a 1 fps contra la pregunta y que opera junto a LLaVA-Video-7B-Qwen2 como MLLM base. El framework completo se describe como plug-and-play: la primera respuesta del MLLM se usa para detectar incertidumbre (con un umbral `tau0` por checkpoint) y, si se supera, se activa la seleccion de fotogramas guiada por la pregunta y una segunda pasada de respuesta.

Los tres checkpoints publicados (`request_selector_videomme.pth`, `request_selector_longvideobench.pth`, `request_selector_mlvu.pth`) corresponden a distintas epocas (20, 2 y 1 respectivamente) de una unica ejecucion de entrenamiento sobre las pseudo-etiquetas de ReQuest, publicadas en el dataset `suyong-3/ReQuest`. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Seleccion de fotogramas guiada por pregunta en videos de larga duracion, muestreando a 1 fps.
- Deteccion de incertidumbre en la primera respuesta del MLLM mediante umbral `tau0` y reactivacion del pipeline de seleccion.
- Integracion plug-and-play con LLaVA-Video-7B-Qwen2 como modelo multimodal de respuesta.
- Evaluacion estandarizada mediante `lmms-eval` en Video-MME, LongVideoBench y MLVU.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo thinking; el alcance es exclusivamente video QA con seleccion de fotogramas.

## Casos de uso

- Question answering sobre videos largos: el selector reduce el numero de fotogramas enviados al MLLM, permitiendo procesar videos de decenas de minutos que excederian la ventana practica del modelo base. Adecuado por su muestreo a 1 fps y puntuacion question-aware.
- Despliegue en entornos con presupuesto computacional limitado: al filtrar fotogramas antes de la inferencia multimodal, se reduce el coste de atencion sobre tokens visuales en GPUs de gama media.
- Analisis de contenido audiovisual para investigacion: evaluacion reproducible con `lmms-eval` y checkpoints por benchmark (Video-MME, LongVideoBench, MLVU) para comparar estrategias de seleccion.
- Integracion en pipelines existentes de LLaVA-Video: al ser plug-and-play, se puede anadir a sistemas ya basados en LLaVA-Video-7B-Qwen2 sin reentrenar el MLLM.
- Revision de material docente o grabaciones de reuniones: localizacion de segmentos relevantes a partir de una pregunta en lenguaje natural sobre videos extensos.
- Replicacion de resultados academicos: los checkpoints y el dataset de pseudo-etiquetas permiten reproducir las cifras del paper con el codigo publicado.

## Benchmarks y rendimiento

Resultados publicados en la model card, con LLaVA-Video-7B-Qwen2 como MLLM base:

| Checkpoint | Benchmark | Epoca | `tau0` | Precision |
|---|---|---|---|---|
| `request_selector_videomme.pth` | Video-MME (sin subtitulos) | 20 | 0.55 | 65.19 |
| `request_selector_longvideobench.pth` | LongVideoBench (val) | 2 | 0.30 | 59.76 |
| `request_selector_mlvu.pth` | MLVU (dev), m-avg | 1 | 0.45 | 71.68 |

No se han publicado en la informacion disponible resultados comparativos frente a otros selectores de fotogramas ni baselines detallados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El MLLM base (LLaVA-Video-7B-Qwen2) requiere aproximadamente 14-16 GB en FP16 para pesos, mas memoria para tokens visuales; el selector anade una carga no cuantificada en la informacion disponible.
- GPU recomendadas: no especificadas en la model card. Por el tamano del MLLM base, se situa en el rango de A100, H100 o RTX 4090 para FP16; GPUs consumer de 24 GB pueden ser suficientes para el modelo base.
- Cabe en GPU consumer: probable con el MLLM base en precision reducida, aunque no hay confirmacion oficial ni cifras de VRAM del selector.
- Opciones de despliegue: repositorio oficial en GitHub (`ailab-kyunghee/ReQuest`) con scripts `scripts/eval.sh` y evaluacion via `lmms-eval`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de modelos comparables de seleccion de fotogramas (por ejemplo, selectores basados en relevancia o clustering) ni de cifras de baseline del propio LLaVA-Video-7B-Qwen2 sin seleccion. Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReQuest (selector + LLaVA-Video-7B-Qwen2) | no disponible (MLLM base 7B) | no disponible | 65.19 Video-MME, 59.76 LongVideoBench, 71.68 MLVU | Apache 2.0 | Hugging Face + GitHub |
| Alternativas de seleccion de fotogramas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere LLaVA-Video-7B-Qwen2 y el codigo del repositorio GitHub para funcionar; el repositorio de Hugging Face solo contiene los pesos del selector.
- Dependencia de umbrales `tau0` calibrados por benchmark (0.55, 0.30, 0.45); su rendimiento fuera de esos dominios no esta documentado.
- Los tres checkpoints provienen de una unica ejecucion de entrenamiento sobre pseudo-etiquetas, lo que puede limitar la generalizacion a dominios de video distintos.
- No se documentan sesgos, tasas de alucinacion ni cobertura linguistica; los idiomas soportados figuran como no disponibles.
- El muestreo fijo a 1 fps puede perder eventos breves o de alta temporalidad no capturados en ese intervalo.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del MLLM base (LLaVA-Video) y del dataset de pseudo-etiquetas antes de produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopcion minimo y poca validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/suyong-3/ReQuest
- Dataset de pseudo-etiquetas: https://huggingface.co/datasets/suyong-3/ReQuest
- Paper (arXiv): https://arxiv.org/abs/2607.01737
- Codigo: https://github.com/ailab-kyunghee/ReQuest
- DOI del proceedings: 10.1007/978-3-032-37235-2_23
