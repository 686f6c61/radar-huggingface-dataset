# yemara/Nemotron-3.5-Lightning-30B-A3B-W3-PoorlyCalibrated

## Resumen

Nemotron-3.5-Lightning-30B-A3B-W3-PoorlyCalibrated es un checkpoint cuantizado a 3 bits mediante GPTQ del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4`, publicado por el usuario `yemara` en Hugging Face. No es un modelo entrenado desde cero ni un ajuste fino: es una compresión agresiva de pesos de un modelo base de NVIDIA, calibrada deliberadamente sobre un conjunto de datos pequeno y estrecho, lo que degrada de forma intencionada su calidad respecto al original.

Su proposito es servir como punto de partida para `wsp-ptq`, un proyecto en el que un agente LLM repara el checkpoint editando directamente sus pesos. La version reparada se publica por separado (`yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated`). Por tanto, este repositorio debe interpretarse como material de investigacion sobre cuantizacion post-entrenamiento y reparacion de pesos, no como un modelo listo para produccion.

El modelo base es un transformer de tipo `nemotron_h` con 30B parametros totales y 3B activos (arquitectura MoE), distribuido originalmente en formato NVFP4 por NVIDIA. El checkpoint aqui descrito ocupa 17,3 GB en el repositorio y se sirve dequantizando los pesos a BF16 y ejecutandolo con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `nemotron_h`), derivado de NVIDIA Nemotron 3.5 Lightning |
| Parametros totales | 30B (segun el nombre del modelo base) |
| Parametros activos | 3B (segun el nombre del modelo base, sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (GPTQ), calibracion estrecha; dequantizable a BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo fuente) |
| Formato de pesos | Checkpoint GPTQ de 3 bits con script `dequantize.py` para reconstruir BF16; tamano de repo 17,3 GB |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base de NVIDIA, etiquetada como `nemotron_h`, un transformer con mezcla de expertos (MoE) de 30B parametros totales y 3B activos por token. Segun la documentacion de NVIDIA NIM, el modelo original fue preentrenado con mas de 20 billones de tokens y su corpus de post-entrenamiento combina datos curados de alta calidad con datos generados sinteticamente, incluyendo una porcion menor de question-answering y datos de alineamiento. No se dispone de detalles adicionales sobre la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones de atencion en la informacion proporcionada.

La innovacion de este repositorio concreto no esta en el entrenamiento sino en el proceso de cuantizacion: se aplica GPTQ a 3 bits con un conjunto de calibracion pequeno y estrecho, lo que produce un checkpoint deliberadamente mal calibrado. El autor lo describe como entrada para `wsp-ptq`, un flujo en el que un agente LLM edita los pesos directamente para reparar el dano de la cuantizacion. El resultado es un artefacto de investigacion sobre tecnicas de post-training quantization (PTQ) y reparacion de pesos, no un modelo optimizado para uso final.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base NVIDIA Nemotron 3.5 Lightning.
- Razonamiento matematico y resolucion de problemas cuantitativos (evaluado en GSM8K y MATH-500).
- Generacion de codigo (evaluado en LiveCodeBench v6).
- Razonamiento cientifico de nivel experto (evaluado en GPQA Diamond).
- Conocimiento general y respuesta a preguntas (evaluado en MMLU).
- Capacidades de tool calling y agentes: no disponibles en la informacion proporcionada para este checkpoint.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

Nota: al tratarse de un checkpoint mal calibrado, estas capacidades estan sustancialmente degradadas respecto al modelo base, como reflejan los benchmarks.

## Casos de uso

- Investigacion en cuantizacion post-entrenamiento: el checkpoint sirve como caso de estudio controlado de como una calibracion estrecha degrada un modelo MoE de 30B, permitiendo medir la caida de rendimiento respecto al original NVFP4.
- Desarrollo y validacion de `wsp-ptq`: es la entrada oficial del pipeline de reparacion de pesos mediante agente LLM; los investigadores pueden reproducir el proceso y comparar con la version reparada publicada por el mismo autor.
- Experimentos de reparacion de pesos: util para probar tecnicas de edicion directa de pesos (weight editing) y evaluar si un agente puede recuperar capacidad perdida sin reentrenar.
- Benchmarking de robustez a cuantizacion agresiva: permite comparar la sensibilidad de distintas tareas (matematicas, codigo, ciencia) a una cuantizacion de 3 bits mal calibrada, usando la tabla GSM8K/MATH-500/LiveCodeBench/GPQA/MMLU como referencia.
- Estudio de degradacion por tarea: los datos publicados muestran que tareas de razonamiento complejo (LiveCodeBench cae de 55,2 a 30,8; GPQA de 71,1 a 47,1) sufren mucho mas que conocimiento general (MMLU de 77,1 a 66,8), lo que lo hace util para analizar que tipos de capacidad son mas fragiles ante PTQ.
- Reproduccion de pipelines de dequantizacion: el script `dequantize.py` y el flujo con vLLM permiten validar infraestructuras de despliegue de checkpoints cuantizados reconstruidos a BF16.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (conjuntos de test ejecutados una vez; pesos de 3 bits dequantizados a BF16 y servidos con vLLM en una GPU):

| Checkpoint | GSM8K | MATH-500 | LiveCodeBench v6 | GPQA Diamond | MMLU | WikiText-2 PPL |
|---|---|---|---|---|---|---|
| NVFP4 release (base) | 95,0 | 88,8 | 55,2 | 71,1 | 77,1 | 8,08 |
| Poorly calibrated 3-bit (este repo) | 71,4 | 60,8 | 30,8 | 47,1 | 66,8 | 11,76 |

La comparacion directa muestra caidas de 23,6 puntos en GSM8K, 28,0 en MATH-500, 24,4 en LiveCodeBench v6, 24,0 en GPQA Diamond y 10,3 en MMLU, con un aumento de perplejidad en WikiText-2 de 8,08 a 11,76.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17,3 GB en disco (pesos de 3 bits). Al dequantizar a BF16 para servirlo con vLLM, los 30B parametros requieren aproximadamente 60 GB de VRAM solo para pesos, mas overhead de KV cache y activaciones.
- GPU recomendadas: para el checkpoint dequantizado a BF16, una A100 80GB o H100 80GB es lo minimo practico; una RTX 4090 (24 GB) no es suficiente en BF16.
- Cabe en consumer GPU: no en su forma BF16 dequantizada. Solo seria viable en GPUs de consumo si se aplicara una cuantizacion adicional (por ejemplo, 4 bits GGUF), no documentada en la informacion disponible.
- Opciones de despliegue: el autor documenta `dequantize.py` seguido de `vllm serve <out dir>`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-W3-PoorlyCalibrated (este) | 30B totales / 3B activos | no disponible | Degradada a proposito (MMLU 66,8; GSM8K 71,4) | OpenMDW-1.1 | Hugging Face, 0 descargas |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 (base) | 30B totales / 3B activos | no disponible | Referencia (MMLU 77,1; GSM8K 95,0) | OpenMDW-1.1 | Hugging Face / NVIDIA NIM |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B totales / 3B activos | no disponible | Referencia en BF16 | OpenMDW-1.1 | Hugging Face |
| Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated (reparado) | 30B totales / 3B activos | no disponible | Reparado por agente (sin datos publicados) | OpenMDW-1.1 | Hugging Face |

La comparativa natural es contra el propio modelo base y sus variantes de cuantizacion del mismo autor; no se dispone de datos de otros modelos de 30B MoE comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad deliberadamente degradada: el checkpoint esta mal calibrado por diseno; los benchmarks muestran caidas de hasta 28 puntos respecto al modelo base. No debe usarse en produccion.
- Riesgo elevado de alucinacion y errores de razonamiento: la perplejidad en WikiText-2 sube de 8,08 a 11,76 y las tareas de razonamiento complejo pierden cerca de la mitad de su rendimiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base, no documentados aqui.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.
- Restricciones de licencia: OpenMDW-1.1, la misma del modelo fuente; el archivo `LICENSE` se conserva con sus avisos. Debe revisarse el texto completo en el enlace de licencia antes de cualquier uso.
- Caveat de despliegue: requiere dequantizar a BF16 (unos 60 GB de VRAM) para servirse con vLLM; no hay soporte documentado para llama.cpp u Ollama.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (8 de noviembre de 2026); sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-PoorlyCalibrated
- Version reparada: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated
- Modelo base NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Version BF16 del modelo base: https://huggingface.co/Openintelligent123/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Proyecto wsp-ptq: https://github.com/yahya010/wsp-ptq
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
