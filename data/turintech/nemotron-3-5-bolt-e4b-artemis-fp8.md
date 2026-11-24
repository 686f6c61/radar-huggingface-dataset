# turintech/Nemotron-3.5-Bolt-E4B-Artemis-FP8

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-FP8 es una cuantización en FP8 del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por TurinTech bajo el paraguas de su herramienta Artemis. El checkpoint original es un modelo multimodal de NVIDIA orientado a generación de texto, imagen y audio, con arquitectura derivada de la familia Gemma 4 (la librería de referencia es `transformers` con tag `gemma4`). Esta versión reduce el peso de los pesos de 15,99 GB a 12,69 GB manteniendo el resto de tensores sin cambios.

La intervención de TurinTech se centra exclusivamente en las capas MLP, que se almacenan en FP8, mientras que el resto de tensores se reempaquetan tal cual desde el checkpoint de NVIDIA. El resultado es un modelo que en vLLM ocupa 11,07 GiB de memoria de pesos, lo que deja más espacio para caché KV y permite servir el modelo en GPUs de gama alta de consumo como la RTX 5090 con mayor throughput.

El modelo resuelve el problema clásico de servir modelos multimodales de ~8.000 millones de parámetros con un presupuesto de VRAM ajustado. Según las mediciones del autor, la generación pasa de 139 tok/s a 183 tok/s en una sola petición, con una degradación mínima en calidad (KL de chat de 0,010 frente al original) y puntuaciones equivalentes en BFCL-v3 y GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 4 (tag `gemma4`), con capas MLP cuantizadas en FP8 |
| Parametros totales | 7.996.156.490 (~8.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información del checkpoint; las pruebas se hicieron a 4.096 tokens y BFCL-v3 a 65.536 tokens |
| Tipos de cuantizacion | FP8 en pesos MLP; resto de tensores sin cuantizar (BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (4 particiones: `part-00000` a `part-00003`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, del que no se detallan en la información disponible los datos de entrenamiento, el número de tokens ni la composición del dataset. La arquitectura se etiqueta como `gemma4` en Hugging Face, lo que sitúa el modelo en la familia de transformers multimodales de NVIDIA construida sobre la línea Gemma 4, con soporte de entrada de imagen y audio además de texto.

La innovación técnica de esta ficha no está en el entrenamiento sino en la compresión: TurinTech aplica cuantización FP8 únicamente a las capas MLP y reempaqueta el resto de tensores sin modificarlos. Según el autor, el resultado conserva las puntuaciones del original en BFCL-v3 (371 de 400 llamadas a herramientas) y GSM8K (230 de 250 frente a 229 del BF16), con una divergencia KL de 0,010 en chat. El modelo está preparado para decodificación especulativa mediante el drafter `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4` con 7 tokens especulativos, y para tool calling nativo en vLLM con el parser `gemma4`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada multimodal: procesa imágenes y audio además de texto (requiere quitar `--language-model-only` en vLLM; el audio necesita `pip install "vllm[audio]"`).
- Tool calling / function calling nativo, con soporte de `--enable-auto-tool-choice` y parser `gemma4` en vLLM.
- Modo thinking configurable mediante `chat_template_kwargs.enable_thinking`; las mediciones publicadas se hicieron con thinking desactivado.
- Razonamiento matemático (evaluado en GSM8K).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatible con endpoints (`endpoints_compatible`) y con decodificación especulativa DFlash.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con tool calling para consultar sistemas internos, y su reducido peso en FP8 permite desplegarlo en una sola GPU de consumo con margen para caché KV.
- Asistentes con entrada de imagen: al aceptar image-text-to-text, sirve para clasificar tickets, extraer datos de capturas o responder preguntas sobre documentos escaneados sin un pipeline OCR separado.
- Agentes con function calling en producción: con 371 de 400 llamadas correctas en BFCL-v3, es adecuado para orquestar APIs en flujos de automatización donde la precisión de los argumentos es crítica.
- Razonamiento matemático asistido: con 230 de 250 en GSM8K, puede resolver problemas aritméticos de varios pasos en herramientas educativas o de validación de cálculos.
- Despliegue en GPUs de consumo para prototipado: los 11,07 GiB de pesos en vLLM permiten ejecutarlo en una RTX 5090 (y potencialmente en tarjetas de 16 GB con `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`, aunque el autor no lo ha probado en 16 GB).
- Servicio de alto throughput con decodificación especulativa: combinado con el drafter DFlash de NVIDIA, acelera la generación en entornos de inferencia con vLLM 0.32.0rc1 o superior.
- Procesamiento de audio en asistentes de voz: al soportar entrada de audio, puede transcribir y razonar sobre clips en aplicaciones de atención telefónica o notas de voz.

## Benchmarks y rendimiento

| Metrica | TurinTech FP8 | BF16 original |
|---|---|---|
| Tamano de pesos | 12,69 GB | 15,99 GB |
| KL chat (menor es mejor) | 0,010 | referencia |
| Tool calls BFCL-v3 (de 400) | 371 | 371 |
| GSM8K (de 250) | 230 | 229 |
| Generación, una petición (tok/s) | 183 | 139 |

Mediciones en una NVIDIA RTX 5090 con vLLM 0.32.0rc1, thinking desactivado, contexto de 4.096 tokens salvo BFCL-v3 a 65.536. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos en vLLM: 11,07 GiB (12,69 GB de pesos en disco); el repo completo ocupa 12,8 GB.
- GPU recomendada por el autor: NVIDIA RTX 5090 (mediciones publicadas).
- Cabe en GPU de consumo: sí, en RTX 5090; en tarjetas de 16 GB el autor sugiere `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048` y reducir el primer valor si la GPU también alimenta pantalla, aunque advierte que no está probado en 16 GB.
- Despliegue: vLLM (versión de referencia 0.32.0rc1, build de desarrollo); compatible con `transformers` y con el formato `compressed-tensors`.
- Throughput: 183 tok/s en una sola petición en RTX 5090, entre un 32 % y un 43 % más rápido que el BF16 original.
- Decodificación especulativa opcional con `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4` y `num_speculative_tokens: 7`.
- Para audio: `pip install "vllm[audio]"` y eliminar `--language-model-only`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TurinTech Nemotron-3.5-Bolt-E4B-Artemis-FP8 | ~8.000 M | no disponible (probado a 4.096 y 65.536) | safetensors FP8 | OpenMDW-1.1 | 12,69 GB, 183 tok/s en RTX 5090 |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 | ~8.000 M | no disponible | safetensors BF16 | OpenMDW-1.1 | 15,99 GB, 139 tok/s en RTX 5090; referencia de calidad |
| Alternativas de ~8B en FP8 | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de otros modelos comparables en la información proporcionada más allá del checkpoint original de NVIDIA.

## Limitaciones y advertencias

- La cuantización FP8 introduce una divergencia respecto al BF16 original (KL de chat de 0,010); aunque pequeña, no es una copia exacta y puede afectar a tareas sensibles a la precisión numérica.
- Solo se cuantizan las capas MLP; el resto de tensores se mantienen en BF16, por lo que el ahorro de memoria es parcial (de 15,99 GB a 12,69 GB, un 21 %).
- Los benchmarks publicados se limitan a BFCL-v3 y GSM8K con thinking desactivado; no hay datos de MMLU, HumanEval ni evaluaciones multimodales.
- No se especifican los idiomas soportados ni la longitud de contexto oficial del modelo base en la información disponible.
- El autor advierte que la configuración para GPU de 16 GB es "esperada que funcione, no probada en una tarjeta de 16 GB".
- Requiere vLLM 0.32.0rc1 (build de desarrollo) según las pruebas publicadas; versiones estables anteriores pueden no soportar el formato `compressed-tensors` o el parser `gemma4`.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de uso comercial, ya que es una licencia "other" con condiciones específicas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base de NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-FP8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter especulativo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4
- Licencia OpenMDW-1.1: https://www.openmdw.ai/license/1-1/
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados completos y método: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-FP8/blob/main/RESULTS.md
