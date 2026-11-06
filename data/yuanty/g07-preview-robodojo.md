# yuanty/G07-preview-RoboDojo

## Resumen

G07-preview es un modelo de mundo-acción (world-action model) autorregresivo desarrollado por Galaxea AI, construido sobre Cosmos3-Nano de NVIDIA y presentado como envío de evaluación al benchmark RoboDojo. El repositorio de Hugging Face, publicado por el usuario `yuanty`, no distribuye el modelo como tal para uso general: contiene un adaptador XPolicyLab en modo solo evaluación, el checkpoint evaluado `step_020904` con su configuración de inferencia congelada y la evidencia de evaluación local. La relevancia es acotada y muy específica: sirve para reproducir y auditar una entrada concreta del leaderboard de RoboDojo, no como modelo de propósito general.

El modelo combina un backbone de difusión (los pesos base se cargan con la librería `diffusers`) con un adaptador de política robótica, dentro de la categoría que el autor etiqueta como `world-action-model`. La información pública disponible no detalla el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento; el repositorio ocupa 46,9 GB, lo que incluye pesos base de Cosmos3-Nano, el VAE de Wan2.2 y el checkpoint afinado.

La licencia del adaptador y del checkpoint es Apache-2.0, pero los componentes base conservan sus licencias originales: Cosmos3-Nano bajo OpenMDW-1.1 y el VAE de Wan2.2 bajo Apache-2.0. Esa mezcla de licencias es un dato crítico para cualquier uso más allá de la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo-acción autorregresivo sobre Cosmos3-Nano (backbone de difusión, pesos cargados con `diffusers`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (adaptador y checkpoint); componentes base bajo OpenMDW-1.1 (Cosmos3-Nano) y Apache-2.0 (VAE Wan2.2) |
| Formato de pesos | safetensors |
| Checkpoint evaluado | `step_020904` |
| Tamaño del repositorio | 46,9 GB |
| Pipeline declarado | `robotics` |
| Modo de uso | solo evaluación (`eval-only`) |

## Arquitectura y entrenamiento

La model card describe G07-preview como un world-action model autorregresivo construido sobre Cosmos3-Nano y afinado por Galaxea AI. El adaptador se integra en XPolicyLab, el entorno de políticas de RoboDojo, y consume tres bloques de pesos: el checkpoint `step_020904` afinado, los módulos sin modificar de Cosmos3-Nano (`transformer/`, `text_tokenizer/`, `vision_encoder/` en la revisión `411f42a8fdfb8c5b2583cb8786e0938f49796eaa`) y el VAE `Wan2.2_VAE.safetensors` procedente de DiffSynth-Studio, convertido desde Wan2.2. La presencia de un VAE y de un vision encoder confirma una arquitectura multimodal que genera acciones condicionadas por observación visual e instrucción textual.

No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación o atención. El autor se compromete a liberar el código de entrenamiento, el checkpoint evaluado y un blog técnico en los tres días siguientes a la aparición de la entrada en el leaderboard de RoboDojo, además de código de despliegue, ficheros de configuración e instrucciones de reproducción a través de XPolicyLab; hasta que ese material aparezca, la información arquitectónica queda limitada a lo descrito.

## Capacidades

- Control robótico mediante política de acciones: el adaptador traduce observaciones e instrucciones en acciones dentro del entorno RoboDojo.
- Procesamiento multimodal: integra un vision encoder (Cosmos3-Nano) y un VAE (Wan2.2) para codificar observaciones visuales.
- Modelado de mundo-acción autorregresivo: genera secuencias de acción paso a paso condicionadas por el estado previo.
- Evaluación reproducible: incluye configuración de inferencia congelada, hashes de ficheros y revisiones exactas de assets en `MANIFEST.json`.
- Soporte de múltiples layouts de tarea: los resultados locales cubren varios layouts con resultados por layout y procedencia documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso fuera del entorno robótico: no disponible.
- Capacidades multilingües: limitadas a inglés según la metadata del repositorio.
- Modo thinking, visión general, audio: no disponible (la visión existe solo como entrada al pipeline de política).

## Casos de uso

- Reproducción de resultados del leaderboard RoboDojo: descargar el adaptador y el checkpoint `step_020904`, ejecutar la configuración de inferencia congelada y comparar con los 41,46 ± 0,36 reportados por el sumarizador oficial sobre 6.300 episodios y tres semillas.
- Auditoría de una submission: verificar hashes contra `MANIFEST.json` y el fichero `G07-preview-eval-only.tar.gz.sha256` para confirmar que los resultados locales corresponden al adaptador enviado.
- Investigación en políticas robóticas: usar el adaptador como línea base en XPolicyLab para comparar nuevas políticas contra un checkpoint afinado sobre Cosmos3-Nano.
- Estudio de world-action models: analizar cómo un backbone de difusión preentrenado (Cosmos3-Nano) se adapta a la predicción de acciones, separando los módulos congelados del checkpoint afinado.
- Desarrollo de pipelines de evaluación: reutilizar la estructura de `submission/evaluation/local_results/` como plantilla para reportar resultados por layout con procedencia y semillas.
- Integración en un workspace RoboDojo: colocar `G07_preview` en `XPolicyLab/policy/G07_preview/` y ejecutar `download_weights.sh` para reconstruir el layout exacto que consume el adaptador.
- Formación y transferencia: servir de ejemplo documentado de cómo empaquetar un checkpoint afinado con sus dependencias de terceros y avisos de licencia.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la evaluación local del propio autor, no benchmarks estándar de NLP.

| Metrica | Valor |
|---|---|
| Puntuación del sumarizador oficial | 41,46 ± 0,36 (desviación estándar poblacional) |
| Cobertura | 100 % |
| Episodios evaluados | 6.300 |
| Semillas | 3 |
| Checkpoint | `step_020904` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La puntuación oficial del leaderboard la determina el sistema de evaluación de RoboDojo y no se incluye en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 46,9 GB, pero esa cifra incluye pesos base, VAE y checkpoint, no el pico de memoria en ejecución.
- GPU recomendadas: no disponible. Por el tamaño agregado de los assets, es previsible que requiera GPU de datacenter (A100, H100 o superiores), pero el autor no lo especifica.
- Viabilidad en GPU de consumo: no confirmada. Un repositorio de 46,9 GB no cabe íntegro en GPUs de consumo con 24 GB de VRAM sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: el adaptador está diseñado para XPolicyLab dentro de RoboDojo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, coherente con un pipeline `robotics` y no de generación de texto.
- Instalación: `huggingface_hub==0.29.2` como dependencia fijada; descarga selectiva mediante `allow_patterns=["G07_preview/*", "submission/*"]`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de G07-preview, por lo que la comparación cuantitativa no es posible. Las alternativas de referencia en la misma categoría de world-action models sobre backbones de difusión son:

| Modelo | Base | Licencia | Contexto | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| G07-preview | Cosmos3-Nano + VAE Wan2.2 | Apache-2.0 (con componentes OpenMDW-1.1) | no disponible | 41,46 ± 0,36 (evaluación local RoboDojo) | Adaptador eval-only en Hugging Face |
| Cosmos3-Nano | Propio (NVIDIA) | OpenMDW-1.1 | no disponible | no disponible | Pesos en `nvidia/Cosmos3-Nano` |
| Wan2.2 (VAE) | Propio (Wan-AI) | Apache-2.0 | no disponible | no disponible | Pesos en `Wan-AI/Wan2.2-TI2V-5B` |

La comparación con políticas robóticas de otros equipos del leaderboard RoboDojo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo en modo solo evaluación: el adaptador está pensado para reproducir la submission, no como base para fine-tuning o despliegue en producción.
- Licencias encadenadas: aunque el adaptador y el checkpoint son Apache-2.0, Cosmos3-Nano mantiene OpenMDW-1.1 y el repositorio conserva una copia de esa licencia (`LICENSE-Cosmos3-Nano`). Cualquier uso comercial debe revisar ambas.
- Idiomas: solo inglés declarado; no hay evidencia de soporte multilingüe.
- Sesgos: no documentados por el autor; al ser un modelo de política visual entrenado para un benchmark concreto, puede heredar sesgos de los datos de RoboDojo y de Cosmos3-Nano.
- Alucinación: no se documenta un análisis específico; en políticas robóticas el riesgo equivalente es la generación de acciones no válidas o inconsistentes con la observación.
- Resultados no verificados de forma independiente: la puntuación de 41,46 procede de la evaluación local del autor; la puntuación oficial la determina RoboDojo y no se incluye.
- Trazabilidad: la reproducibilidad depende de revisiones fijas de assets externos (Cosmos3-Nano en `411f42a8…`); cambios en esos repositorios romperían la reproducción.
- Promesa de liberación pendiente: el código de entrenamiento, el blog técnico y las instrucciones de reproducción se anuncian para tres días después de la publicación en el leaderboard, pero no están disponibles en el momento de redactar esta ficha.
- Sin métricas de latencia ni requisitos de hardware publicados, lo que dificulta planificar un despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yuanty/G07-preview-RoboDojo
- Modelo base Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- VAE Wan2.2 (modelo original): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- VAE Wan2.2 convertido (ModelScope): https://modelscope.cn/models/DiffSynth-Studio/Wan-Series-Converted-Safetensors
- Documentación del adaptador: `G07_preview/README.md` dentro del repositorio
- Descripción del método: `submission/METHOD.md` dentro del repositorio
- Descripción de la submission eval-only: `submission/PR_DESCRIPTION.md` dentro del repositorio
- Validación del adaptador: `submission/evaluation/VALIDATION.md` dentro del repositorio
- Resultados locales completos: `submission/evaluation/local_results/SUMMARY.md` dentro del repositorio
- Manifiesto de assets y hashes: `MANIFEST.json` dentro del repositorio
- Avisos de terceros: `G07_preview/THIRD_PARTY_NOTICES.md` dentro del repositorio
