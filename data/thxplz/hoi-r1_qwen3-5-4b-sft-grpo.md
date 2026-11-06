# thxplz/HOI-R1_Qwen3.5-4B-SFT-GRPO

## Resumen

HOI-R1 Qwen3.5-4B SFT + GRPO es un modelo multimodal de tipo image-text-to-text especializado en deteccion de interacciones persona-objeto (Human-Object Interaction, HOI). Lo desarrolla el autor independiente thxplz y parte de Qwen/Qwen3.5-4B, sobre el que aplica un ajuste fino supervisado (SFT) seguido de un entrenamiento de refuerzo con GRPO de parametros completos. El resultado es un modelo de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) que reformula la deteccion HOI como una tarea de generacion de texto a partir de imagen y texto.

El modelo es relevante porque demuestra que un MLLM de tamano medio (4B) puede superar a metodos tradicionales de deteccion HOI y a baselines zero-shot mucho mayores, incluido Qwen2.5-VL-72B-AWQ, en el benchmark HICO-DET. Segun la tabla de evaluacion del autor, HOI-R1-Qwen3.5-4B alcanza 29,79 de mAP en Default Full y 31,61 en Known Object Full, frente a 20,71 y 22,93 del baseline de 72B. Esto sugiere que el ajuste especifico de dominio con RL es mas eficiente que escalar el modelo en esta tarea.

El repositorio contiene unicamente los pesos listos para inferencia del checkpoint-40 del entrenamiento GRPO, junto con la configuracion de modelo, tokenizer y processor. Se distribuye bajo licencia Apache 2.0 y esta pensado para pipelines de imagen y texto orientados a analisis de escenas, vigilancia, robotica o accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B; tipo exacto no disponible |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen3.5-4B, que procesa entradas de imagen y texto y genera respuestas textuales. Sobre esa base, el autor aplica dos etapas: primero un ajuste fino supervisado (SFT) durante 1 epoch con el dataset thxplz/HOI-R1_HICO-DET_dataset, y despues un entrenamiento GRPO de parametros completos con ms-swift, con un learning rate de 1e-6, coeficiente KL (beta) de 0.001 y un total de 40 pasos. El checkpoint publicado corresponde al paso 40.

El dataset de GRPO es HICO-DET GRPO v2.2, derivado del conjunto HICO-DET, que anota relaciones verbo-objeto sobre imagenes. La innovacion principal es tratar la deteccion HOI como una tarea de razonamiento y generacion: el modelo produce etiquetas de interaccion a partir de la imagen, y el RL con GRPO optimiza directamente la metrica de deteccion. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset. Tampoco se detalla si se emplearon tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de interacciones persona-objeto (HOI) a partir de imagenes y texto: identifica pares verbo-objeto como "persona montando bicicleta" o "persona sosteniendo taza".
- Generacion de texto multimodal: responde a prompts de imagen y texto en formato conversacional.
- Razonamiento visual orientado a escenas: interpreta relaciones espaciales y semanticas entre personas y objetos.
- Salida estructurada de detecciones: el modelo esta entrenado para emitir etiquetas de interaccion evaluables con mAP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el entrenamiento GRPO implica cierto razonamiento, pero no se documenta.
- Modo thinking, vision o audio adicional: solo vision (image-text-to-text); no se documentan modos de audio ni thinking.

## Casos de uso

- Analisis de escenas en vigilancia: el modelo puede procesar fotogramas y generar etiquetas de interaccion persona-objeto para detectar acciones como "persona cogiendo objeto" o "persona empujando carrito", aprovechando su entrenamiento especifico en HICO-DET.
- Robotica asistencial: integrado en un pipeline de percepcion, permite al robot identificar que objeto esta manipulando una persona y adaptar su comportamiento, gracias a la deteccion de relaciones verbo-objeto.
- Accesibilidad visual: describe interacciones en imagenes para usuarios con discapacidad visual, generando frases como "una persona sentada en una silla sosteniendo un libro".
- Etiquetado automatico de datasets: acelera la anotacion de relaciones HOI en grandes colecciones de imagenes, reduciendo el coste de crear datasets de entrenamiento para otros modelos.
- Comercio electronico y moda: detecta interacciones como "persona llevando bolso" o "persona probandose zapatos" en imagenes de producto para mejorar la indexacion y la busqueda visual.
- Analisis de comportamiento en retail: a partir de camaras, identifica interacciones con productos (coger, mirar, devolver) para generar metricas de engagement en tienda.
- Moderacion de contenido: detecta interacciones potencialmente sensibles o violentas en imagenes subidas por usuarios, como "persona golpeando objeto", para su revision.

## Benchmarks y rendimiento

Resultados en HICO-DET segun la tabla de evaluacion del autor (mAP). La fila HOI-R1-Qwen3.5-4B corresponde al checkpoint-40 de SFT + GRPO.

| Metodo | Entrenamiento | Default Full | Default Rare | Default Non-Rare | Known Object Full | Known Object Rare | Known Object Non-Rare |
|---|---|---:|---:|---:|---:|---:|---:|
| HO-RCNN | 150k steps | 7,81 | 5,37 | 8,54 | 10,41 | 8,94 | 10,85 |
| HOTR | 100 epochs | 25,10 | 17,34 | 27,42 | --- | --- | --- |
| HOITrans | 150 epochs | 26,61 | 19,15 | 28,84 | 29,13 | 20,98 | 31,57 |
| QPIC | 150 epochs | 29,07 | 21,85 | 31,23 | 31,68 | 24,14 | 33,93 |
| Qwen2.5-VL-3B (zero-shot) | --- | 8,39 | 9,60 | 8,03 | 8,96 | 9,83 | 8,70 |
| Qwen2.5-VL-72B-AWQ (zero-shot) | --- | 20,71 | 29,62 | 18,05 | 22,93 | 31,87 | 20,26 |
| Qwen3.5-4B (zero-shot) | --- | 17,17 | 20,82 | 16,08 | 19,60 | 23,16 | 18,53 |
| Qwen3.5-4B-SFT | 1 epoch | 29,36 | 30,47 | 29,03 | 31,22 | 30,92 | 31,31 |
| HOI-R1-Qwen3.5-4B | 1 epoch + 40 steps | 29,79 | 30,39 | 29,60 | 31,61 | 30,67 | 31,89 |

El modelo supera a QPIC en Default Full (29,79 frente a 29,07) y queda ligeramente por debajo en Known Object Full (31,61 frente a 31,68). Frente a su propio SFT previo, el GRPO aporta una mejora marginal de +0,43 en Default Full y +0,39 en Known Object Full.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 9-10 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 3-4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en FP16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion, y potencialmente en GPUs de 12 GB con cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan pesos GGUF), Ollama (previa conversion), transformers con el processor incluido. No se documentan integraciones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HICO-DET Default Full | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| HOI-R1-Qwen3.5-4B | 4,54B | No disponible | 29,79 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (zero-shot) | ~4B | No disponible | 17,17 | No disponible | Hugging Face |
| Qwen3-VL-4B-SFT | ~4B | No disponible | 22,46 | No disponible | Hugging Face |
| Rex-Omni-3B (HOI-SFT) | ~3B | No disponible | 25,30 | No disponible | Hugging Face |
| Qwen2.5-VL-72B-AWQ (zero-shot) | ~72B | No disponible | 20,71 | No disponible | Hugging Face |

La comparativa se limita a los datos de la tabla del autor. Frente a alternativas del mismo tamano, HOI-R1-Qwen3.5-4B obtiene la mejor puntuacion Default Full (29,79) y Known Object Full (31,61) entre los modelos ajustados de 3-4B. Frente a Qwen2.5-VL-72B-AWQ, un modelo 16 veces mayor, la ventaja es de +9,08 y +8,68 puntos respectivamente, lo que refleja la importancia del ajuste de dominio.

## Limitaciones y advertencias

- Dominio muy especifico: el modelo esta entrenado para HICO-DET y puede degradarse en dominios visuales distintos (imagenes medicas, satelitales, ilustraciones) o con vocabularios de interaccion fuera del conjunto de entrenamiento.
- Riesgo de alucinacion: como todo MLLM generativo, puede inventar interacciones no presentes en la imagen, especialmente con objetos pequenos u oclusiones.
- Sesgos: el dataset HICO-DET contiene sesgos de genero, contexto cultural y distribucion de clases; el modelo puede reproducirlos en las etiquetas generadas.
- Idiomas: no se documentan idiomas soportados; el entrenamiento parece centrado en etiquetas en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Contexto: no se especifica la longitud de contexto, lo que dificulta planificar pipelines con prompts largos o multiples imagenes.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones; conviene revisar la licencia del modelo base.
- Produccion: el checkpoint es de solo 40 pasos de GRPO y no incluye estado de optimizador; la mejora sobre el SFT es marginal (+0,43 mAP), por lo que en algunos casos el SFT puede ser suficiente.
- Documentacion escasa: no hay informacion sobre cuantizaciones oficiales, latencia, throughput ni limitaciones declaradas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thxplz/HOI-R1_Qwen3.5-4B-SFT-GRPO
- Modelo SFT base: https://huggingface.co/thxplz/HOI-R1_Qwen3.5-4B-SFT
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset HICO-DET para HOI-R1: https://huggingface.co/datasets/thxplz/HOI-R1_HICO-DET_dataset
- Paper HOI-R1 (arXiv:2510.05609): https://arxiv.org/abs/2510.05609
- Tabla de resultados (Markdown): https://huggingface.co/thxplz/HOI-R1_Qwen3.5-4B-SFT-GRPO/blob/main/evaluation/hoi-r1-main-results.md
- ms-swift (framework de entrenamiento): https://github.com/modelscope/ms-swift
