# yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep3

## Resumen

`yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep3` es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El autor lo presenta como un "memory model": un modelo entrenado para responder preguntas sobre documentos largos que debe recordar y recuperar información de un contexto extenso, en lugar de razonar sobre conocimiento parametrico. El entrenamiento se ha realizado sobre pares sinteticos de pregunta-respuesta generados a partir del corpus NarrativeQA, con un total de 1.276.668 ejemplos.

Tecnicamente es un transformer denso de 32.763.876.352 parametros (32,7 mil millones), derivado del Qwen2.5-32B-Instruct, con el adaptador LoRA fusionado en los pesos base y una copia del adaptador sin fusionar en el subdirectorio `lora_adapter/`. El checkpoint corresponde a la epoca 3 de 3, con un entrenamiento de 7,54 horas de reloj en 8 aceleradores AMD Instinct MI325X. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero concreta: se trata de un experimento de investigacion sobre memoria en contexto largo, no de un modelo generalista de proposito comercial. Para desarrolladores interesados en evaluar como se comporta un modelo de 32B cuando se le especializa en tareas de recuperacion y respuesta sobre narrativa extensa, este checkpoint ofrece un punto de partida reproducible con hiperparametros documentados. No obstante, carece de resultados de benchmarks publicados, de cero descargas y de cero likes en el momento de la ficha, lo que limita cualquier evaluacion comparativa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con adaptador LoRA fusionado |
| Parametros totales | 32.763.876.352 (32,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens en entrenamiento (contexto nativo del base Qwen2.5-32B-Instruct: 32.768 tokens, ampliable; no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors bf16, admite cuantizacion posterior con GPTQ, AWQ, GGUF, etc., pero no se documenta |
| Idiomas soportados | No disponible (heredados del base Qwen2.5, que soporta multiples idiomas, pero no se especifica en la card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); adaptador LoRA sin fusionar en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. Sobre esa base se aplico un ajuste fino con LoRA de rango 32, alpha 64 y dropout 0,05, abarcando las proyecciones q, k, v, o, gate, up y down. Los parametros entrenables ascienden a 268.435.456, un 0,81 % del total. El entrenamiento uso precision bf16, checkpointing de gradientes y calculo de perdida unicamente sobre los tokens del asistente.

El dataset de entrenamiento es un conjunto sintetico de 1.276.668 pares de pregunta-respuesta generados a partir de NarrativeQA, con un esquema de muestreo cruzado entre documentos y combinacion de entidades (`NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`). Se entrenaron 3 epocas con batch efectivo de 512 (64 por dispositivo, 1 acumulacion, 8 GPU), tasa de aprendizaje 0,0002 constante con warmup del 5 %, weight decay 0,01 y norma maxima de gradiente 1,0. La longitud maxima de secuencia fue de 8.096 tokens. El entrenamiento completo duro 7,54 horas de reloj (60,3 GPU-horas) en 8 AMD Instinct MI325X. No se documenta uso de RLHF ni DPO; el ajuste es puramente supervisado sobre pares QA.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre documentos largos, con enfasis en tareas de memoria y recuperacion de informacion dentro del contexto.
- Entrenado especificamente sobre pares QA de NarrativeQA, lo que favorece la extraccion de respuestas a partir de narrativa extensa.
- Conversacion multi-turno mediante la plantilla de chat de Qwen (heredada del base).
- Soporte de tool calling y function calling: heredado de Qwen2.5-32B-Instruct, aunque no se valida especificamente en este checkpoint.
- Capacidades de razonamiento, codigo y matematicas: heredadas del base Qwen2.5-32B-Instruct, no reforzadas por el ajuste.
- Capacidades multilingues: presumiblemente heredadas del base, pero no documentadas ni evaluadas en este checkpoint.
- No se documentan modos especiales como thinking mode, vision o audio; el modelo es exclusivamente de texto.

## Casos de uso

- Evaluacion de memoria en contexto largo: el modelo permite medir hasta que punto un ajuste LoRA sobre pares QA sinteticos mejora la recuperacion de informacion en documentos narrativos de hasta 8.096 tokens, comparandolo con el base sin ajustar.
- Investigacion sobre modelos de memoria: util como checkpoint reproducible para estudiar el efecto de la fusion de LoRA en tareas de recuperacion y respuesta, con hiperparametros y dataset documentados.
- Extraccion de respuestas en dominios narrativos: analisis de guiones, novelas o transcripciones donde se requiere localizar hechos concretos dentro de un texto extenso.
- Generacion de resumenes y respuestas sobre corpus documentales: integrable en pipelines de procesamiento de documentos que requieran respuestas ancladas al contexto proporcionado.
- Base para experimentos de destilacion o evaluacion comparativa: al estar en safetensors bf16 y con adaptador separado, facilita la experimentacion con cuantizacion y despliegue en entornos de investigacion.
- Prototipado de asistentes conversacionales especializados en documentacion: usando la plantilla de chat de Qwen y el contexto de 8.096 tokens para conversaciones multi-turno sobre un corpus acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,7 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 80 GB para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 33 GB de pesos, viable en una GPU de 48 GB o en dos de 24 GB.
- Cuantizacion a 4 bits: alrededor de 16-18 GB de pesos, cabe en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto reducido.
- GPUs recomendadas: A100 80 GB, H100 80 GB, o AMD Instinct MI300X/MI325X para bf16 sin cuantizar; RTX 4090 o 3090 para cuantizacion 4 bits.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (tag `text-generation-inference` presente), vLLM y llama.cpp/Ollama previa conversion a GGUF (no documentada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep3 | 32,7 B | 8.096 tokens en entrenamiento | Apache 2.0 | Hugging Face, 0 descargas | Ajuste LoRA fusionado sobre NarrativeQA; sin benchmarks |
| Qwen/Qwen2.5-32B-Instruct | 32,7 B | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; capacidades generales, sin especializacion en memoria |
| Qwen/Qwen2.5-32B | 32,7 B | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face | Version base sin instruccion; referencia para comparar el efecto del ajuste |
| Mistral-Small-24B-Instruct | 24 B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con contexto largo; no especializada en memoria |

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente sobre pares QA sinteticos de NarrativeQA; su rendimiento fuera de ese dominio narrativo es incierto y no esta evaluado.
- No hay benchmarks publicados, por lo que no se puede afirmar que supere al base Qwen2.5-32B-Instruct en ninguna tarea concreta.
- Riesgo de alucinacion: al ser un ajuste supervisado sobre datos sinteticos, puede generar respuestas plausibles pero no ancladas al contexto, especialmente fuera del dominio de entrenamiento.
- La longitud de contexto usada en entrenamiento (8.096 tokens) es inferior al contexto nativo del base (32.768 tokens); no se documenta si el modelo mantiene el rendimiento del base en contextos mas largos.
- Idiomas soportados no documentados; aunque el base es multilingue, el ajuste puede haber degradado el rendimiento en idiomas distintos del ingles, dado que NarrativeQA es un corpus en ingles.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el checkpoint es un experimento de investigacion con cero descargas y cero likes.
- El adaptador LoRA esta fusionado en los pesos principales, lo que impide separar el ajuste del base sin recurrir a la copia en `lora_adapter/`; conviene verificar la integridad de los pesos antes de desplegar.
- No se documentan tecnicas de alineacion adicionales (RLHF/DPO) tras el ajuste supervisado, por lo que el modelo puede presentar sesgos heredados del base y del dataset sintetico.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset de referencia (NarrativeQA): no se proporciona enlace directo en la model card; el autor cita el fichero `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json` sin URL publica.
- Paper de NarrativeQA: no disponible en la informacion proporcionada.
- Repositorio o demo: no disponible en la informacion proporcionada.
