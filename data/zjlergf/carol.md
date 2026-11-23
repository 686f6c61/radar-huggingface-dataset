# zjlergf/CAROL

## Resumen

CAROL (repairing latent bypass in latent visual reasoning models) es un paquete de investigacion publicado por el usuario zjlergf en Hugging Face que aborda un fallo concreto de los modelos de razonamiento visual latente: el denominado "latent bypass". Estos modelos escriben un bloque de tokens latentes continuos antes de responder, pero en los modelos publicados que los autores examinaron la respuesta no depende del contenido de ese bloque: sustituirlo por los latentes de otra pregunta o por un latente medio no altera la precision en los benchmarks.

El repositorio no contiene un unico modelo, sino el codigo del metodo de reparacion (evaluacion del uso de latentes, entrenamiento SFT y RL, planes, tests y documentacion), siete checkpoints reparados de unos 16 GB cada uno y los datos construidos para el entrenamiento (pares minimos, indice de entrenamiento y listas de filas). Los checkpoints parten de modelos de terceros como LVR-7B, UniVLR-Stage2-7B, Silence-LVR, Monet-SFT-7B, Monet-7B y Silence-Monet, todos ellos variantes de 7B construidas sobre Qwen2.5-VL-7B-Instruct.

La relevancia es metodologica: los autores miden el uso real de los latentes con un "follow lift" sobre pares de color retenidos y reportan valores de +87 a +91 puntos porcentuales en los checkpoints reparados, frente a aproximadamente 0 en los modelos originales donde lo midieron. El repositorio tiene 47,4 GB, no registra descargas ni likes, y su licencia aun no ha sido elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen2.5-VL-7B-Instruct, con interfaz de razonamiento visual latente (bloque de tokens latentes continuos previo a la respuesta) |
| Parametros totales | 7B (aproximado, segun los modelos base de la familia Monet/LVR/UniVLR) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no elegida aun; todos los derechos reservados por los autores. Los checkpoints heredan las licencias de los modelos de origen y del base Qwen2.5-VL-7B-Instruct (Apache-2.0) |
| Formato de pesos | safetensors (carpetas completas de modelo en `weights/<Model>/`, unos 16 GB cada una) |

## Arquitectura y entrenamiento

Cada checkpoint es una carpeta de modelo completa en el formato del release del que parte (misma arquitectura, tokenizer e interfaz de latentes), por lo que se carga con el codigo propio de LVR, Monet/Silence o UniVLR, o con los adaptadores incluidos en `code/lue/adapters/`. La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct con un mecanismo de razonamiento visual latente que genera un bloque de tokens continuos antes de la respuesta textual.

El entrenamiento de reparacion consta de dos etapas: SFT y RL (con pasos de RL entre 200 y 400 segun el checkpoint). Los datos construidos por los autores incluyen pares minimos, un indice de entrenamiento y listas de filas, derivados de Visual-CoT, ZwZ-RL-VQA e imagenes de V*. La innovacion tecnica es precisamente el diagnostico y la correccion del latent bypass: se evalua si la respuesta depende del bloque latente mediante sustituciones (latentes de otra pregunta, latente medio) y se mide el follow lift sobre pares de color retenidos de construccion propia.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre imagenes (pipeline image-text-to-text).
- Razonamiento visual latente: emision de un bloque de tokens latentes continuos antes de la respuesta, con dependencia efectiva de ese bloque tras la reparacion.
- Razonamiento en multiples pasos sobre contenido visual.
- Evaluacion controlada del uso de latentes mediante condiciones nativas y sustituciones del bloque latente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de razonamiento latente (no thinking textual explicito); sin vision mas alla de la heredada del modelo base; sin audio.

## Casos de uso

- Investigacion sobre razonamiento visual latente: usar los checkpoints y el codigo para reproducir la medicion de latent use y comparar modelos con y sin reparacion en tareas como V*.
- Auditoria de modelos de razonamiento latente: aplicar el evaluador de condiciones (`evaluate_conditions.py`) para comprobar si un modelo publicado realmente utiliza su bloque latente o lo ignora.
- Desarrollo de metodos de alineacion: emplear el pipeline SFT + RL de CAROL como referencia para reparar otros modelos con el mismo fallo.
- Experimentos de interpretabilidad: analizar la sustitucion de latentes (latentes de otra pregunta, latente medio) para estudiar que informacion codifica el bloque continuo.
- Benchmarking academico en VQA de razonamiento: ejecutar los siete checkpoints sobre benchmarks como vstar con el mismo harness y comparar el follow lift entre bases (LVR, UniVLR, Monet, Silence).
- Construccion de datasets de pares minimos: reutilizar los datos de `data/` (pares minimos, indice de entrenamiento) para entrenar o evaluar modelos propios de razonamiento visual.

## Benchmarks y rendimiento

Los autores no publican resultados convencionales de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La metrica reportada es el follow lift sobre pares de color retenidos de construccion propia:

| Modelo | Punto de partida | Etapa | Follow lift (pares de color, dev) |
|---|---|---|---|
| LVR-7B | vincentleebang/LVR-7B | CAROL SFT + RL, paso 400 | +87.5 |
| UniVLR | Warrenustc1958/UniVLR-Stage2-7B | CAROL SFT + RL, paso 400 | +87.5 |
| Silence-LVR | cornuHGF/LVR-SFT-VLPO-Attn-400 | CAROL SFT + RL, paso 300 | +89.1 |
| Monet-SFT | NOVAglow646/Monet-SFT-7B | CAROL SFT + RL, paso 300 | +90.6 |
| Monet-7B | NOVAglow646/Monet-7B | CAROL SFT + RL, paso 300 | +88.3 |
| Silence-Monet-Attn | cornuHGF/Monet-SFT-VLPO-Attn-600 | CAROL SFT + RL, paso 200 | +90.6 |
| Silence-Monet | cornuHGF/Monet-SFT-VLPO-600 | CAROL SFT, paso 600 | +90.6 |

En los modelos originales donde se midio (LVR-7B, UniVLR), el follow lift era de aproximadamente 0. Los autores advierten que en checkpoints anteriores del mismo metodo los latentes propios no elevaban la precision en benchmarks por encima de un bloque vacio, y que esto no se volvio a medir en los checkpoints de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 7B parametros en safetensors (fp16/bf16) se requieren del orden de 14-16 GB solo para pesos, mas el coste del procesador visual y del contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, GPUs de 24 GB o mas (RTX 4090, A100 40/80 GB, H100) son las candidatas naturales para pesos sin cuantizar.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con pesos en bf16 y contexto moderado; no confirmado por los autores.
- Opciones de despliegue: el paquete usa transformers y scripts propios (`code/scripts/evaluate_conditions.py`, `code/scripts/server/fresh_start.sh`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento latente | Follow lift | Licencia |
|---|---|---|---|---|---|
| CAROL (checkpoints reparados) | 7B | no disponible | Si, reparado | +87 a +91 | no elegida; derechos reservados; hereda las de los modelos base |
| LVR-7B (vincentleebang) | 7B | no disponible | Si, con bypass | ~0 | no disponible |
| UniVLR-Stage2-7B (Warrenustc1958) | 7B | no disponible | Si, con bypass | ~0 | no disponible |
| Monet-7B / Monet-SFT-7B (NOVAglow646) | 7B | no disponible | Si | no medido en el original | no disponible |

## Limitaciones y advertencias

- El follow lift se mide en pares de color retenidos de construccion propia; no es una metrica estandar y no se traduce directamente en mejoras de precision en benchmarks.
- Los propios autores indican que en checkpoints anteriores del metodo los latentes propios no elevaron la precision en benchmarks por encima de un bloque vacio, y que esto no se ha vuelto a medir en estos checkpoints.
- Licencia sin elegir: todos los derechos reservados sobre codigo y datos hasta que se anada una licencia, lo que impide el uso comercial sin autorizacion.
- Los checkpoints heredan las licencias de los modelos de terceros de los que parten (LVR, UniVLR, Monet, Silence) y la de Qwen2.5-VL-7B-Instruct (Apache-2.0); los datos derivan de Visual-CoT, ZwZ-RL-VQA y V* y estan sujetos a sus terminos.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados.
- Longitud de contexto: no documentada.
- Repositorio con 0 descargas y 0 likes; sin validacion externa conocida.
- Requiere descargar activos externos (checkpoints base, juez, benchmarks, fuentes de entrenamiento y codigo upstream) segun `EXTERNAL_ASSETS.md`, con revisiones fijadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zjlergf/CAROL
- Modelo base principal: https://huggingface.co/NOVAglow646/Monet-7B
- Modelo base SFT: https://huggingface.co/NOVAglow646/Monet-SFT-7B
- Modelo base LVR: https://huggingface.co/vincentleebang/LVR-7B
- Modelo base Silence-LVR: https://huggingface.co/cornuHGF/LVR-SFT-VLPO-Attn-400
- Modelo base Silence-Monet: https://huggingface.co/cornuHGF/Monet-SFT-VLPO-600
- Modelo base Silence-Monet-Attn: https://huggingface.co/cornuHGF/Monet-SFT-VLPO-Attn-600
- Modelo base UniVLR (referenciado en la model card): https://huggingface.co/Warrenustc1958/UniVLR-Stage2-7B
- Qwen2.5-VL-7B-Instruct (base de la familia): https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
