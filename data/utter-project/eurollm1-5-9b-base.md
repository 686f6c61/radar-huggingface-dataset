# utter-project/EuroLLM1.5-9B-Base

## Resumen

EuroLLM1.5-9B-Base es un modelo de lenguaje de 9.152.319.488 parámetros (aproximadamente 9,15 mil millones) desarrollado por el proyecto utter-project, una iniciativa orientada a la construcción de modelos abiertos con cobertura multilingüe europea. Se distribuye bajo licencia Apache 2.0 y está diseñado como modelo base (no instruido) para generación de texto, lo que lo convierte en un punto de partida para ajuste fino supervisado, DPO o RLHF por parte de terceros. Su relevancia radica en que cubre 35 idiomas, incluyendo las 24 lenguas oficiales de la Unión Europea junto con catalán, gallego, irlandés, maltés, turco, ruso, chino, coreano, japonés, árabe e hindi, un alcance lingüístico poco habitual en modelos de este tamaño.

El modelo se enmarca en la familia EuroLLM, de la que existen versiones previas como EuroLLM-9B-2512 y EuroLLM-22B-2512. La versión 1.5 introduce mejoras sustanciales en matemáticas y razonamiento respecto a sus predecesoras, según los datos publicados por el autor. La arquitectura es de tipo transformer decoder-only con pesos en formato safetensors y compatibilidad directa con la librería transformers y text-generation-inference.

Con 9,15 mil millones de parámetros, el modelo se posiciona en la franja de tamaño que permite despliegue en una sola GPU de 24 GB con cuantización de 8 bits, o en GPUs de consumo de gama alta con cuantizaciones de 4 bits. Su licencia Apache 2.0 elimina restricciones de uso comercial, lo que lo hace atractivo para empresas que necesitan un modelo multilingüe europeo sin ataduras de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama) |
| Parametros totales | 9.152.319.488 (9,15 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas en la informacion disponible) |
| Idiomas soportados | 35: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un transformer decoder-only de la familia llama, con 9.152.319.488 parametros totales y pesos en safetensors. No se detalla en la model card el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni la longitud de contexto soportada. Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya ajuste por preferencias, pero este dato no se confirma en la informacion proporcionada.

El modelo se presenta como una actualizacion de la familia EuroLLM, comparandose en la model card con EuroLLM-9B-2512, EuroLLM-22B-2512, Apertus-v1.5-8B y Prelude 9B. Las innovaciones tecnicas destacables no se detallan mas alla de la mejora en resultados de benchmarks; no se mencionan mecanismos como decodificacion especulativa, atencion lineal ni arquitecturas hibridas. El enfasis del proyecto esta en la cobertura multilingue y en el rendimiento en tareas de matematicas, razonamiento, codigo, conocimiento y comprension lectora.

## Capacidades

- Generacion de texto autoregresiva en 35 idiomas, con especial cobertura de lenguas europeas.
- Razonamiento y comprension lectora, evaluados en benchmarks como ARC-C, HellaSwag, PIQA y WinoGrande.
- Razonamiento matematico, con resultados destacados en GSM8K (64,3 en la version base).
- Generacion de codigo, aunque los resultados concretos de benchmarks de codigo no se detallan en la informacion disponible.
- Conocimiento general y factual, evaluado en benchmarks de conocimiento segun la model card.
- Capacidad multilingue amplia: 24 lenguas oficiales de la UE mas catalan, gallego, irlandes, maltes, turco, ruso, chino, coreano, japones, arabe e hindi.
- Al ser un modelo base, no incluye de serie soporte de tool calling, function calling ni modos de agente; estas capacidades requeririan ajuste fino posterior.
- No se documentan capacidades de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Ajuste fino para atencion al cliente multilingue en Europa: el modelo cubre las 24 lenguas oficiales de la UE, lo que permite entrenar un unico modelo para soporte en varios paises sin necesidad de modelos separados por idioma. Se usaria como base para SFT sobre conversaciones de soporte.
- Generacion de codigo en pipelines de CI/CD tras ajuste fino: el modelo base puede especializarse con datos de codigo y tool calling para tareas de autocompletado, revision de parches o generacion de tests en repositorios empresariales.
- Traduccion automatica y parafraseo entre lenguas europeas: con 35 idiomas soportados, es adecuado para sistemas de traduccion interna o localizacion de contenidos, especialmente en combinaciones de lenguas minoritarias como ga, mt, gl o hr que rara vez aparecen en modelos de este tamano.
- Resumen y analisis de documentacion legal o administrativa: la ventana de contexto no esta documentada, pero el modelo puede ajustarse para resumir expedientes, contratos o normativa en varios idiomas, un caso habitual en administraciones publicas europeas.
- Asistente de investigacion y extraccion de conocimiento: como modelo base, sirve para construir motores de busqueda semantica o sistemas de pregunta-respuesta sobre corpus cientificos, con ajuste fino sobre dominios concretos.
- Generacion de contenido editorial multilingue: redaccion de articulos, descripciones de producto o material de marketing en varios idiomas desde una unica base, reduciendo el coste de mantener modelos por idioma.
- Educacion y tutoria automatizada: ajuste fino para generar explicaciones y ejercicios de matematicas y razonamiento, aprovechando su rendimiento en GSM8K y ARC-C.
- Investigacion academica en PLN multilingue: al ser Apache 2.0 y de tamano contenido, es util como baseline reproducible en estudios comparativos de modelos europeos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. La comparacion incluye EuroLLM-9B-2512, EuroLLM-22B-2512, Apertus-v1.5-8B y Prelude 9B.

| Benchmark | EuroLLM1.5-9B-Base | EuroLLM-9B-2512 | EuroLLM-22B-2512 | Apertus-v1.5-8B | Prelude 9B |
|---|---|---|---|---|---|
| GSM8K (math) | 64,3 | 45,6 | 56,5 | 60,0 | 79,7 |
| ARC-C (reasoning) | 62,7 | 58,9 | 64,1 | 64,7 | 65,1 |
| HellaSwag (reasoning) | 76,9 | 75,6 | 77,5 | 76,9 | 78,0 |
| PIQA (reasoning) | 81,5 | 80,5 | 81,9 | 80,7 | 82,6 |
| WinoGrande (reasoning) | 73,7 | 70,7 | 75,7 | 71,8 | 75,2 |

Los resultados muestran una mejora clara respecto a EuroLLM-9B-2512 en todas las metricas reportadas, especialmente en GSM8K (+18,7 puntos). Frente a modelos de tamano similar como Apertus-v1.5-8B y Prelude 9B, el rendimiento es competitivo, aunque Prelude 9B supera a EuroLLM1.5-9B-Base en GSM8K, ARC-C, HellaSwag, PIQA y WinoGrande. La model card no incluye resultados de benchmarks de codigo, conocimiento ni comprension lectora en el fragmento disponible, pese a que el texto introductorio menciona que se cubren.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9,2 GB para pesos, cabe en GPUs de 16 GB con margen limitado.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4,6 GB para pesos, viable en GPUs de consumo de 8 GB o mas, aunque la calidad puede degradarse.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para produccion en FP16; RTX 4090 (24 GB) para FP16 con contexto corto o 8 bits con contexto amplio; RTX 3090, RTX 4080 y RTX 4070 Ti para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y modelos con 16 GB o mas en 8 bits; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (compatible con arquitectura llama), llama.cpp y Ollama mediante conversion a GGUF (no se confirma que existan conversiones oficiales publicadas).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EuroLLM1.5-9B-Base | 9,15 B | no disponible | 64,3 | 62,7 | Apache 2.0 | Hugging Face |
| EuroLLM-9B-2512 | ~9 B | no disponible | 45,6 | 58,9 | no disponible en la informacion | Hugging Face |
| EuroLLM-22B-2512 | ~22 B | no disponible | 56,5 | 64,1 | no disponible en la informacion | Hugging Face |
| Apertus-v1.5-8B | ~8 B | no disponible | 60,0 | 64,7 | no disponible en la informacion | Hugging Face |
| Prelude 9B | ~9 B | no disponible | 79,7 | 65,1 | no disponible en la informacion | Hugging Face |

EuroLLM1.5-9B-Base destaca frente a su predecesor directo de 9B en GSM8K y en el resto de metricas, y se situa en un nivel competitivo con Apertus-v1.5-8B y Prelude 9B, aunque este ultimo obtiene mejores resultados en cuatro de las cinco metricas reportadas. Su principal diferenciador es la cobertura de 35 idiomas y la licencia Apache 2.0, que no se confirma para los modelos comparados en la informacion disponible.

## Limitaciones y advertencias

- Al ser un modelo base, no esta alineado para seguir instrucciones ni para conversacion; su uso directo en produccion requiere ajuste fino.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la model card; al entrenarse con datos web multilingues, es probable que herede sesgos de esas fuentes.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el rendimiento en tareas de contexto largo.
- Aunque cubre 35 idiomas, el rendimiento por idioma puede variar considerablemente; no se publican resultados desagregados por lengua en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento originales, no detalladas en la model card.
- El modelo tiene solo 12 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que sugiere una adopcion temprana y poca validacion externa.
- No se confirma la existencia de versiones cuantizadas oficiales (GGUF, AWQ, GPTQ) ni de versiones instruidas, lo que puede limitar su despliegue inmediato en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utter-project/EuroLLM1.5-9B-Base
- Paper referenciado en los tags (arXiv:2602.05879): https://arxiv.org/abs/2602.05879
- Repositorio del proyecto EuroLLM: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
