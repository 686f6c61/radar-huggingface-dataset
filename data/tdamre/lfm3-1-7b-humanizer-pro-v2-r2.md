# Tdamre/LFM3-1.7B-Humanizer-Pro-V2-R2

## Resumen

LFM3-1.7B-Humanizer-Pro-V2-R2 es un adaptador LoRA de tipo PEFT publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B. Su proposito es la edicion de texto orientada a "humanizar" pasajes generados o parafraseados por maquina, es decir, reescribirlos para que resulten mas naturales y, en teoria, menos detectables como texto sintetico. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (30,7 millones de parametros entrenados sobre un transformer de 1,7 mil millones) que debe cargarse junto al checkpoint exacto del modelo base en la revision indicada por el autor.

El adaptador se entrena mediante supervised fine-tuning sobre 3.072 pares del split de entrenamiento del dataset HIP, tomando como entrada una parafrasis automatica y como objetivo el pasaje original. La configuracion de inferencia recomendada es de dos pasadas: el mismo adaptador se aplica dos veces, de modo que la primera reescritura se pasa como entrada a la segunda. Esta decision es relevante porque los resultados publicados por el propio autor muestran que la configuracion de dos pasadas no alcanzo el umbral conjunto de deteccion en ninguno de los 9 casos evaluados (0/6 en desarrollo y 0/3 en held-out).

El interes del modelo es, por tanto, acotado y experimental: sirve como referencia de un pipeline de reescritura con LoRA de rango 32 sobre un modelo pequeno y con licencia LFM Open License v1.0, y como caso de estudio de las limitaciones de los "humanizadores" frente a detectores como Pangram 4.1 o GPTZero. La ficha se limita a los datos publicados en la model card; no hay informacion sobre benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B; rango 32, alpha 32, dropout 0.05 |
| Parametros totales | 30.769.152 parametros entrenados en el adaptador; modelo base de 1,7 B (LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt y respuesta juntos limitados a 1.024 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (la model card solo documenta inferencia CUDA BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm-open-license-1.0`) |
| Formato de pesos | safetensors (adaptador PEFT); tamano del repo 0,1 GB; tensores del adaptador 123.111.616 bytes |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un modelo de 1,7 mil millones de parametros de la familia LFM3 de Liquid AI. La model card no detalla la arquitectura interna del modelo base (transformer, hibrida u otra), por lo que este dato no esta disponible en la informacion proporcionada. El adaptador es un LoRA de rango 32 con alpha 32 y dropout 0.05, que entrena 30.769.152 parametros.

El entrenamiento consistio en supervised fine-tuning con cross-entropy solo sobre los tokens objetivo, usando 3.072 ejemplos pareados del split de entrenamiento del dataset HIP (YixuanEvenXu/HIP-training-and-evaluation-data), con la parafrasis automatica como entrada y el pasaje original como objetivo. La seleccion excluyo pares identicos y objetivos duplicados, exigio una puntuacion semantica minima de 9 y limito prompt mas respuesta a 1.024 tokens. Se realizaron 1.536 actualizaciones AdamW con batch size 2, learning rate pico de 0,00005 y semilla 20261125. No se documenta RLHF ni DPO.

La innovacion operativa es el esquema de dos pasadas (`lfm-v2-r2`): el adaptador se ejecuta dos veces, con semillas 42 y 43 en ese orden, temperatura 1.0, top-p 0.95 y penalizacion por repeticion 1.0, formateando cada pasada con etiquetas de origen y destino. El checkpoint archivado se ejecuto con PyTorch 2.13.0+cu130, Transformers 5.22.2 y PEFT 0.21.2 en CUDA BF16.

## Capacidades

- Reescritura y edicion de texto en ingles: transforma un pasaje de entrada en una version reescrita, con formato de etiquetas de origen y destino.
- "Humanizacion" de parafrasis automaticas: el objetivo declarado es acercar el texto a un registro mas natural, aunque los resultados de deteccion publicados son mixtos.
- Generacion de texto condicionada por el modelo base LFM3-1.7B.
- Pipeline de dos pasadas con decodificacion por muestreo (temperatura 1.0, top-p 0.95).
- Procesamiento de pasajes cortos en ingles; la CLI historica aceptaba entre 100 y 3.500 palabras, pero los 9 inputs publicos de evaluacion eran pasajes cortos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Reescritura de borradores academicos o divulgativos: el adaptador puede aplicarse sobre parrafos cortos en ingles para producir una segunda version con registro mas natural, revisando siempre el resultado contra la fuente.
- Normalizacion de parafrasis automaticas en pipelines editoriales: dado un texto generado por un parafraseador, el modelo intenta recuperar un estilo mas cercano al original humano del dataset HIP.
- Experimentacion en investigacion sobre deteccion de texto IA: sirve como baseline reproducible (adaptador, semillas y configuracion documentadas) para medir la robustez de detectores como Pangram 4.1 o GPTZero.
- Prototipado de herramientas de edicion de texto en local: al ser un adaptador de 0,1 GB sobre un modelo de 1,7 B, puede desplegarse en una GPU de consumo para pruebas de concepto.
- Estudio de pipelines multi-paso: el esquema de dos pasadas es un ejemplo concreto de refinamiento iterativo con el mismo adaptador, util para comparar estrategias de reescritura.
- Docencia sobre fine-tuning con PEFT: el repositorio incluye registro de entrenamiento (`training.json`), hashes y revisiones fijadas, lo que facilita reproducir el experimento en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta lecturas de detectores sobre textos concretos:

| Texto evaluado | Pangram 4.1 | GPTZero |
|---|---|---|
| Aviso de autobus | 100% humano | 100% IA |
| Aviso de panaderia | 39% humano / 61% posiblemente IA | no disponible |
| Aviso de observatorio | 100% IA | 100% IA |

Ademas, la configuracion de dos pasadas alcanzo el umbral conjunto en 0 de 6 casos de desarrollo y 0 de 3 casos held-out.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador pesa 0,1 GB y el modelo base es de 1,7 B, por lo que en BF16 el conjunto requiere del orden de 3,5-4 GB de VRAM (estimacion a partir del tamano, no publicada por el autor).
- GPU recomendadas: el autor documenta ejecucion en CUDA con BF16; no especifica modelos de GPU concretos.
- GPU de consumo: por tamano, el modelo base de 1,7 B en BF16 o cuantizado es compatible con GPUs de consumo con 8 GB o mas; no hay validacion publicada en la model card.
- Opciones de despliegue: el flujo documentado usa PyTorch, Transformers 5.22.2 y PEFT 0.21.2 mediante el script `lfm3/edit.py` del repositorio Humanizer-pro. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-V2-R2 | 30,7 M en adaptador sobre base de 1,7 B | no disponible | Reescritura/humanizacion en ingles | LFM Open License v1.0 | Hugging Face (PEFT) |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | Modelo base de proposito general | LFM Open License v1.0 | Hugging Face |
| Otros humanizadores basados en LoRA | no disponible | no disponible | Reescritura de texto | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de deteccion publicados son negativos en la mayoria de casos: 0/6 en desarrollo y 0/3 en held-out alcanzaron el umbral conjunto; Pangram y GPTZero discrepan radicalmente en el mismo texto.
- Perdida de informacion comprobada: la reescritura del aviso de autobus elimino la "Route 14" y la de la panaderia cambio que parte realiza una llamada telefonica. Es obligatorio revisar cada salida contra la fuente.
- Solo ingles; no hay soporte multilingue declarado.
- Entrenado con pasajes cortos y limite de 1.024 tokens en prompt mas respuesta; el comportamiento en textos largos no esta validado.
- Riesgo de alucinacion y de alteracion de hechos inherente a la reescritura generativa.
- Licencia LFM Open License v1.0: conviene revisar sus terminos antes de cualquier uso comercial; el dataset HIP tiene terminos upstream propios.
- Requiere cargar el adaptador sobre la revision exacta del modelo base (`0dc4268b561499c648c7ba7c9466bf3d8d01517a`); otras revisiones pueden degradar el comportamiento.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente.
- Uso etico: la finalidad de evadir detectores de texto IA puede entrar en conflicto con normas academicas o editoriales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-V2-R2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revision del modelo base usada en entrenamiento: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/0dc4268b561499c648c7ba7c9466bf3d8d01517a
- Repositorio Humanizer-pro: https://github.com/adybag14-cyber/Humanizer-pro
- Evidencia de evaluacion previa: https://github.com/adybag14-cyber/Humanizer-pro/blob/53ef406/lfm3/evidence/prior-v2-evaluation.json
- Dataset HIP: https://huggingface.co/datasets/YixuanEvenXu/HIP-training-and-evaluation-data/tree/b574d982f6fabda9dec95dcb62dec3723ab685f5
- Paper HIP: https://arxiv.org/abs/2605.19516
- Licencia: LICENSE (incluida en el repositorio del modelo)
- Atribuciones y modificaciones: NOTICE (incluido en el repositorio del modelo)
- Registro de entrenamiento: training.json (incluido en el repositorio del modelo)
