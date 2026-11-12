# submissionpaper1234/trimdata-baseline-checkpoints

## Resumen

`submissionpaper1234/trimdata-baseline-checkpoints` es una coleccion de checkpoints de investigacion publicada en Hugging Face, no un modelo autonomo. Contiene adaptadores LoRA y pesos del proyector multimodal (`mm_projector`) entrenados sobre LLaVA-1.5-7B para reproducir metodos de seleccion de datos ("data selection") en el ajuste por instrucciones. El autor lo describe explicitamente como "artefactos de investigacion para reproduccion", asociados al repositorio de codigo `LZhang12345/trimdata`.

El modelo base es Vicuna-7B-v1.5, combinado con el codificador visual CLIP ViT-L/14-336 y el proyector `mlp2x_gelu` de la etapa 1 de LLaVA. Cada checkpoint corresponde a un metodo de seleccion (por ejemplo `uniform`, `coincide`, `source_sqrt`), un presupuesto de datos (b05, b10, b15, b20) y una semilla de seleccion y de entrenamiento. El repositorio ocupa 31,4 GB e incluye, ademas de los pesos, las salidas de evaluacion de los benchmarks.

Su relevancia es metodologica: permite recalcular puntuaciones de POPE, GQA, TextVQA, ScienceQA-IMG, MME, SEED, MMMU, MMBench, LLaVA-W, MM-Vet y VizWiz sin volver a ejecutar inferencia, algo util para estudiar como afecta la seleccion de subconjuntos de LLaVA-665K al rendimiento multimodal. No esta pensado como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-1.5-7B: Vicuna-7B-v1.5 (transformer decoder) + CLIP ViT-L/14-336 + proyector MLP `mlp2x_gelu`; ajuste mediante LoRA |
| Parametros totales | 7B en el LLM base (Vicuna-7B-v1.5); el adaptador LoRA y el proyector se distribuyen por separado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (`model_max_length=2048` en el entrenamiento) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors fp16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base Vicuna esta orientado principalmente al ingles; la model card no lo declara) |
| Licencia | llama2 (etiqueta `other` con `license_name: llama2`, enlace a la licencia de Meta) |
| Formato de pesos | `adapter_model.safetensors` (LoRA), `non_lora_trainables.bin` (proyector entrenado), `adapter_config.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la receta oficial de LLaVA-1.5-7B: Vicuna-7B-v1.5 como LLM, CLIP ViT-L/14-336 como codificador visual con `mm_vision_select_layer=-2` y `mm_vision_select_feature=patch`, y un proyector `mlp2x_gelu` de la etapa 1. El entrenamiento se hizo con el codigo oficial de LLaVA (`llava/train/train.py`, commit `c121f0432da27facab705978f83c4ada465e46fd`) y la plantilla de conversacion `v1`.

Se aplica LoRA sobre todas las capas lineales del LLM (q, k, v, o, gate, up, down) con `r=128`, `alpha=256`, `dropout=0.05` y `bias=none`, mientras que el proyector se entrena por completo con un learning rate de 2e-5 (LoRA usa 2e-4). El optimizador es AdamW sin weight decay, con schedule coseno, `warmup_ratio=0.03` y una sola epoca natural sobre el subconjunto seleccionado de LLaVA-665K. El batch global es de 128 (4 por dispositivo, 32 pasos de acumulacion), con `model_max_length=2048`, `image_aspect_ratio=pad`, `group_by_modality_length=True` y `lazy_preprocess=True`.

El entrenamiento se ejecuto en una NVIDIA L40S con fp16 (sin bf16 ni tf32), DeepSpeed ZeRO-3 y gradient checkpointing, usando atencion eager (sin FlashAttention ni xformers). El numero de pasos depende del presupuesto: 258 al 5%, 516 al 10%, 774 al 15% y 1.032 al 20%, calculados como `(K + 3) // 4 // 32` descartando la ultima acumulacion parcial. Las semillas de entrenamiento son 17, 29 y 43, y afectan tanto a `seed` como a `data_seed`.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno heredados de Vicuna-7B-v1.5.
- Comprension visual: descripcion de imagenes, respuesta a preguntas visuales (VQA), OCR y reconocimiento de texto en imagen.
- Razonamiento visual sobre ciencia y conocimiento general (evaluado en ScienceQA-IMG y MMMU).
- Analisis de imagenes con objetos y relaciones espaciales (evaluado en POPE y GQA).
- Capacidad de servir como referencia reproducible para comparar metodos de seleccion de datos, no como modelo final.
- No se documenta soporte de tool calling, function calling ni modos de agentes.
- No se documenta capacidad de audio ni modo "thinking" explicito.

## Casos de uso

- Reproduccion de experimentos de seleccion de datos: cargar un checkpoint concreto (por ejemplo `uniform/b10/sel1234-t17`) y recalcular las puntuaciones de los cuatro benchmarks principales a partir de los `PREDICTIONS.jsonl` archivados, sin reejecutar inferencia.
- Auditoria de resultados publicados: el campo `core4.gqa_override` del manifiesto documenta una correccion de una puntuacion de GQA invalida (0.0) recalculada desde las predicciones originales, lo que permite verificar la trazabilidad de las cifras.
- Estudio de robustez frente a semillas: los checkpoints con semillas 17, 29 y 43 permiten medir la varianza del rendimiento atribuible al entrenamiento frente a la atribuible a la seleccion del subconjunto.
- Comparacion de metodos de seleccion a igual presupuesto: los directorios `b05`, `b10`, `b15` y `b20` permiten contrastar `uniform`, `coincide` y `source_sqrt` con el mismo numero de pasos.
- Calibracion de evaluadores: la documentacion de `EVAL_MANIFEST.json` y `FUNCTION.json` (registro de decodificacion y runtime) sirve para alinear un evaluador propio con el usado por los autores, incluida la diferencia entre LoRA sin fusionar (PEFT 0.7.1, fp16) y fusionada (`merge_and_unload`).
- Base para experimentos de eficiencia en ajuste multimodal: el uso de LoRA con `r=128` sobre todas las lineas y batch global 128 con ZeRO-3 en una sola L40S es una receta replicable para laboratorios con recursos limitados.
- Punto de partida para fine-tuning propio sobre LLaVA-1.5-7B: el adaptador y el proyector entrenado pueden reutilizarse como inicializacion en tareas visuales especificas, siempre respetando la licencia llama2.

## Benchmarks y rendimiento

La model card no publica una tabla de puntuaciones agregadas; indica que las puntuaciones estan en `index.csv` y en los ficheros `SCORE.json` de cada checkpoint, pero no se incluyen en la informacion disponible. Los benchmarks cubiertos son:

| Benchmark | Banco | Tamano |
|---|---|---|
| POPE | core4 | 8.910 preguntas |
| GQA test-dev balanced | core4 | 12.578 preguntas |
| TextVQA val | core4 | 5.000 preguntas |
| ScienceQA-IMG | core4 | 2.017 preguntas |
| MME perception / cognition | extended | no disponible en el texto |
| SEED-Image | extended | no disponible en el texto |
| MMMU val | extended | no disponible en el texto |
| MMBench EN dev | extended | no disponible en el texto |
| LLaVA-Wild | extended | no disponible en el texto |
| MM-Vet | extended | no disponible en el texto |
| VizWiz test | extended | no disponible en el texto |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base Vicuna-7B-v1.5 en fp16 requiere aproximadamente 14 GB de VRAM solo para los pesos; sumando el codificador CLIP ViT-L/14-336 y el proyector, el total se situa en torno a 16-17 GB en fp16.
- El adaptador LoRA (`r=128` sobre todas las lineas) anade varios GB adicionales si se mantiene sin fusionar; fusionarlo reduce el uso a los pesos del modelo base.
- GPU recomendadas: NVIDIA L40S (la usada en el entrenamiento), A100 40/80 GB, H100. En consumer, una RTX 4090 (24 GB) puede alojar el modelo en fp16 con cuantizacion o en bf16 ajustada; una RTX 3090 (24 GB) queda al limite.
- Despliegue: la carga documentada usa `load_pretrained_model` del repositorio `haotian-liu/LLaVA` (API v1.2.x) con `model_name="llava-v1.5-7b-lora"`. No se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no hay una ruta directa a llama.cpp sin conversion.
- Latencia y throughput: no disponibles. El entrenamiento uso atencion eager, lo que sugiere que la inferencia no esta optimizada para velocidad.
- Almacenamiento: el repositorio completo ocupa 31,4 GB; la descarga selectiva por directorio (`--include "uniform/b10/sel1234-t17/*"`) reduce el espacio necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trimdata-baseline-checkpoints (este) | 7B (LoRA sobre Vicuna-7B-v1.5) | 2.048 | Texto + imagen | llama2 | Hugging Face, artefacto de investigacion |
| LLaVA-1.5-7B (haotian-liu/llava-v1.5-7b) | 7B | 4.096 (segun configuracion de inferencia) | Texto + imagen | llama2 | Hugging Face, modelo completo |
| Vicuna-7B-v1.5 (lmsys) | 7B | 4.096 | Solo texto | llama2 | Hugging Face |
| Qwen2-VL-7B (Alibaba) | 7B | no disponible en esta ficha | Texto + imagen + video | Apache 2.0 (segun el autor) | Hugging Face |

La comparacion con Qwen2-VL-7B se incluye solo como referencia de categoria; los datos de licencia y contexto de ese modelo no se han verificado en la informacion proporcionada. La diferencia clave de este repositorio frente a LLaVA-1.5-7B es que no distribuye el modelo completo, sino adaptadores LoRA y el proyector, y que su objetivo es la reproducibilidad experimental, no el rendimiento maximo.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son artefactos de investigacion con adaptadores LoRA que requieren el modelo base y el codigo de LLaVA para cargarse.
- La licencia llama2 impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse el texto completo de Meta antes de cualquier uso fuera de investigacion.
- El contexto de 2.048 tokens limita conversaciones largas y documentos extensos; el modelo base Vicuna soporta mas, pero el entrenamiento se hizo a 2.048.
- Los idiomas soportados no se declaran; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 7B de esta generacion, especialmente en tareas de OCR y VQA sobre imagenes con texto denso.
- Dos checkpoints (`coincide/b20/selfixed-t29` y `coincide/b20/selfixed-t43`) nunca fueron evaluados; su manifiesto lo indica explicitamente.
- Solo 27 de los 46 checkpoints tienen evaluacion extendida, y 5 de ellos sin VizWiz; la cobertura no es uniforme.
- La puntuacion de GQA archivada para `uniform/b10/sel1234-t17` y `source_sqrt/b10/sel1234-t43` es un 0.0 invalido; la puntuacion aceptada se recalculo desde las predicciones identicas. Cualquier comparacion debe usar el valor de `provenance.json`, no el `SCORE.json` original.
- Diferencia de evaluacion: el evaluador propio mantuvo el LoRA sin fusionar en fp16 (PEFT 0.7.1), mientras que el builder oficial lo fusiona con `merge_and_unload`; los resultados pueden no ser identicos entre ambas rutas.
- Los ficheros `config.json` y `adapter_config.json` son copias portables con rutas sustituidas por IDs del Hub; los originales byte-exactos estan en `*.original.json`, lo que puede confundir en una carga automatizada.
- El entrenamiento uso atencion eager sin FlashAttention, lo que implica un rendimiento de inferencia inferior al de implementaciones optimizadas.
- Las preguntas y etiquetas de los benchmarks no se redistribuyen; es necesario descargar los ficheros oficiales y verificar sus sha256 contra la documentacion del repositorio de GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/submissionpaper1234/trimdata-baseline-checkpoints
- Repositorio de codigo: https://github.com/LZhang12345/trimdata
- Selecciones de datos: https://huggingface.co/datasets/submissionpaper1234/trimdata-baseline-selections
- Modelo base: https://huggingface.co/lmsys/vicuna-7b-v1.5
- Codigo de LLaVA: https://github.com/haotian-liu/LLaVA (commit `c121f0432da27facab705978f83c4ada465e46fd`)
- Licencia Llama 2: https://ai.meta.com/llama/license/
