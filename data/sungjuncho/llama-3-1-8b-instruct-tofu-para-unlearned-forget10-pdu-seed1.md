# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo PDU, dentro de la colección TOFU-para del autor sungjuncho. El punto de partida es un fine-tuning del modelo base sobre el conjunto TOFU-para (una version corregida del dataset TOFU con erratas en nombres subsanadas y cinco parafrasis verificadas de cada par pregunta-respuesta), y sobre ese modelo se aplica PDU para eliminar el conocimiento del conjunto *forget10* (400 pares QA originales). El objetivo no es solo "desentrenar" las muestras exactas vistas, sino borrar el conocimiento subyacente que el modelo tambien aprendio en otras formulaciones.

La relevancia de esta ficha es metodologica: el autor separa explicitamente *untraining* (eliminar las muestras concretas que recibio el algoritmo) de *unlearning* (eliminar el conocimiento real, evaluado tambien en parafrasis no vistas). Para ello introduce la metrica FADE (divergencia KL simetrica frente a un modelo de referencia en respuestas muestreadas), ademas de las metricas clasicas de TOFU (forget quality, truth ratio, probabilidad Q-A, ROUGE y utilidad del modelo). Es un artefacto de investigacion, no un modelo de produccion.

Arquitectonicamente es un transformer decoder-only de 8.030.261.248 parametros (dato real de los safetensors), es decir, la arquitectura Llama-3.1-8B sin modificaciones estructurales. El checkpoint se distribuye en formato safetensors y bfloat16, con licencia Llama 3.1 Community License heredada de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct: 128.000 tokens segun la arquitectura base, sin confirmacion explicita en la model card) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en bfloat16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no se declara lista de idiomas en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only denso de aproximadamente 8.000 millones de parametros con atencion por cabezas agrupadas (GQA) y tokenizador BPE de Llama 3. Sobre esa base, el autor realizo primero un fine-tuning completo sobre el dataset TOFU-para (TOFU con erratas corregidas mas cinco parafrasis verificadas de cada par QA), dando lugar al modelo `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, que actua como modelo de partida. El checkpoint aqui descrito aplica despues PDU (un metodo de *unlearning* del repositorio `open-unlearning` de locuslab) sobre ese modelo.

El conjunto de olvido (*forget set*) son exclusivamente los 400 pares QA originales de forget10. El conjunto de retencion, para los metodos que lo usan, es retain90 mas las dos versiones de parafrasis (10.800 ejemplos en total). Los hiperparametros corresponden a la configuracion afinada del repositorio para PDU en 8B (`community/methods/PDU`): sin recorte de gradiente, tamano de lote efectivo 32, y la configuracion exacta en `train_config/`. La semilla es 1, tanto para el modelo de partida como para la ejecucion de *unlearning*, y las comparaciones se hacen contra los modelos de referencia de la misma semilla. No se documentan en la model card detalles sobre RLHF/DPO adicionales ni sobre la composicion completa del dataset de preentrenamiento original.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-3.1-8B-Instruct, conserva la capacidad de mantener dialogos multi-turno con formato de chat.
- Razonamiento y respuesta a preguntas: el modelo de partida fue ajustado sobre pares QA de TOFU-para, por lo que su comportamiento esta orientado a ese formato.
- Capacidades de codigo, matematicas y vision: no se documentan en la model card; al ser un derivado de Llama-3.1-8B-Instruct (sin componente visual), no dispone de vision.
- Tool calling / function calling: no se documenta soporte explicito en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se documenta.
- Capacidades multilingues: no se declara lista de idiomas; el modelo base Llama 3.1 soporta varios idiomas, pero no hay confirmacion en esta ficha.
- Capacidad especial: el proposito del checkpoint es el *unlearning* verificado, no una capacidad funcional adicional; el autor evalua el borrado tanto en las muestras originales como en parafrasis no vistas.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como checkpoint de referencia para reproducir y comparar metodos de borrado de conocimiento sobre Llama-3.1-8B. El autor publica resultados por semilla (0, 1, 2) y metricas FADE, lo que permite replicar experimentos.
- Evaluacion de la distincion untraining vs. unlearning: util para estudiar si un metodo borra solo las muestras exactas o el conocimiento subyacente, usando las parafrasis como sonda de generalizacion del borrado.
- Auditoria de privacidad y cumplimiento: como banco de pruebas para medir si un modelo retiene informacion de un conjunto forget tras aplicar PDU, con metricas como forget truth ratio (0.941) y probabilidad Q-A (7.66e-06).
- Desarrollo de metodos de desaprendizaje: el repositorio `open-unlearning` y la configuracion `community/methods/PDU` permiten partir de este checkpoint para probar variantes de hiperparametros y comparar contra los modelos de referencia del mismo seed.
- Estudio de la utilidad tras el borrado: con model utility de 0.710, el checkpoint sirve para analizar el compromiso entre eliminar conocimiento y conservar capacidades generales, comparando con el modelo de partida (x2-full).
- Reproducibilidad de experimentos con semillas: al incluir resultados de seeds 0-2 (FADE untraining 732.0 ± 13.6; FADE unlearning 683.4 ± 8.5), es util para validar la estabilidad de un metodo de unlearning frente a la varianza de semilla.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 1, este modelo):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs. `x2-retain90-forget10para-seed1`, forget10 original) | 729.77 |
| FADE, unlearning (vs. `x2-retain90-seed1`, forget10 original + 2 parafrasis) | 683.46 (original 696.1 / para1 677.8 / para2 676.5) |
| TOFU forget quality (vs. `x2-retain90-seed1`) | 1.63e-85 |
| Forget truth ratio | 0.941 |
| Forget Q-A probability | 7.66e-06 |
| Forget Q-A ROUGE | 0.013 |
| Model utility | 0.710 |

Resultados entre semillas (0, 1, 2):

| Metrica | seed 0 | seed 1 (este modelo) | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 746.5 | 729.8 | 719.6 | 732.0 ± 13.6 |
| FADE, unlearning | 674.9 | 683.5 | 691.9 | 683.4 ± 8.5 |
| Forget Q-A probability | 0.000 | 0.000 | 0.000 | 0.000 ± 0.000 |
| Forget Q-A ROUGE | 0.019 | 0.013 | 0.008 | 0.014 ± 0.006 |
| Forget truth ratio | 0.949 | 0.941 | 0.963 | 0.951 ± 0.012 |
| Model utility | 0.699 | 0.710 | 0.665 | 0.691 ± 0.023 |

Puntos de referencia FADE (misma tarea):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21.4 ± 0.3 (ruido de semilla) | 136.7 ± 0.4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104.2 ± 0.3 | 29.8 ± 0.3 (29 / 30 / 30) (ruido de semilla) |
| Sin unlearning (`x2-full`, modelo de partida, seeds 0-2) | 81.6 ± 0.7 | 156.3 ± 0.2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (8.030.261.248 parametros × 2 bytes), mas memoria para el contexto y el estado de atencion; el repo ocupa 16,1 GB.
- Cuantizacion: no se distribuyen variantes cuantizadas en el repo; para reducir VRAM habria que convertir los pesos a 8 bits o 4 bits con herramientas externas (no documentado).
- GPU recomendadas: A100 (40/80 GB) o H100 para bfloat16 sin cuantizar con contexto amplio; RTX 4090 (24 GB) puede alojar los pesos en bfloat16, pero el contexto largo puede agotar memoria.
- Cabe en GPU de consumo: si, en tarjetas con al menos 24 GB (RTX 3090/4090) en bfloat16 sin contexto extenso; en 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (segun la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); no se documentan configuraciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...unlearned-forget10-pdu-seed1`) | 8.030.261.248 | no disponible | Unlearning PDU sobre TOFU-para | llama3.1 | Hugging Face (178 descargas) |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (modelo de partida) | 8.030.261.248 | no disponible | Fine-tuning completo sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (referencia "perfect unlearner") | 8.030.261.248 | no disponible | Entrenado solo con retain90 (sin forget) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (referencia "perfect untrainer") | 8.030.261.248 | no disponible | Entrenado con retain90 + forget10 parafraseado | llama3.1 | Hugging Face |

No se dispone de comparacion con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion: no esta pensado para uso en produccion ni para tareas generales; su comportamiento esta condicionado por el fine-tuning sobre TOFU-para.
- El *unlearning* no es perfecto: el FADE de unlearning (683.46) esta lejos del "perfect unlearner" (29.8) y el de untraining (729.77) esta lejos del "perfect untrainer" (21.4), lo que indica que el modelo sigue siendo distinguible de las referencias ideales.
- La metrica FADE es una distancia, no una direccion: un valor intermedio no implica que el modelo se situe entre dos modelos de referencia.
- Varianza entre semillas: model utility oscila entre 0.665 y 0.710 y forget truth ratio entre 0.941 y 0.963 segun la semilla, por lo que los resultados de una sola ejecucion no deben generalizarse.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion; al ser un derivado de Llama-3.1-8B-Instruct, conserva los riesgos del modelo base.
- Sesgos conocidos: no se documentan en la model card; se heredan los del modelo base Llama-3.1-8B-Instruct.
- Limitaciones de idioma: no se declara lista de idiomas; el comportamiento multilingue no esta verificado para este checkpoint.
- Restricciones de licencia: Llama 3.1 Community License; el uso comercial esta sujeto a los terminos de Meta (incluida la politica de uso aceptable y, en su caso, la denominacion "Built with Llama").
- El checkpoint depende de un modelo de partida concreto (`x2-full-seed1`) y de una configuracion de PDU especifica; los resultados no son extrapolables a otras configuraciones sin re-evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed1
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo de partida: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida como `LICENSE` en el repositorio del modelo
