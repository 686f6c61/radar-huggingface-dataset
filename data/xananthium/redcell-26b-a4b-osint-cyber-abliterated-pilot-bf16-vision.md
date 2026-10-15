# Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-BF16-Vision

## Resumen

REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-BF16-Vision es un checkpoint experimental publicado por el usuario Xananthium que parte de Google Gemma 4 26B-A4B-it y del ajuste REDCELL-26B-A4B-OSINT-Cyber-APEX, orientado a tareas de OSINT e inteligencia de ciberamenazas. Sobre esa base se ha aplicado una edicion de tipo abliteration conocida como Heretic, cuyo objetivo es eliminar los mecanismos de rechazo del modelo original, y se ha conservado integramente el componente de vision. El resultado es un modelo multimodal (image-text-to-text) con arquitectura MoE de aproximadamente 25.800 millones de parametros totales y unos 4.000 millones activos por token.

El repositorio contiene 48,07 GiB de pesos fundidos en BF16 dentro del formato canonico `Gemma4ForConditionalGeneration`, e incluye tokenizer, processor, configuracion y los pesos de vision. El autor documenta el uso de 7.800 tensores de adaptador, la preservacion de 1.013 nombres y formas de tensor canonicos, y verificaciones frente a un calculo independiente en FP64 sobre nueve proyecciones editadas. Existe una edicion hermana cuantizada en W6A8 pensada para servir con vLLM.

Su relevancia es doble: por un lado sirve como material reproducible para estudiar ediciones de abliteration sobre modelos MoE multimodales; por otro, la propia naturaleza del ajuste (eliminacion de rechazos) y su dominio de aplicacion (ciberseguridad ofensiva/OSINT) implican riesgos de seguridad y de uso que conviene evaluar antes de cualquier despliegue. La ficha refleja unicamente los datos publicados por el autor y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y componente de vision; clase `Gemma4ForConditionalGeneration` |
| Parametros totales | 25.805.936.206 (aprox. 25,8 B) |
| Parametros activos | Aproximadamente 4.000 millones (designacion A4B del nombre; no confirmado de forma explicita por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repositorio), W6A8 (edicion hermana para vLLM), NF4 (usada en la comparativa de investigacion); el modelo base dispone de GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); las ediciones alternativas usan GGUF y compressed-tensors |

## Arquitectura y entrenamiento

El modelo es un transformer con atencion completa combinado con una capa de mezcla de expertos (MoE) y un modulo de vision, integrados en la clase `Gemma4ForConditionalGeneration` de la arquitectura Gemma 4. La designacion A4B indica una mezcla con aproximadamente 4.000 millones de parametros activos por token sobre un total de unos 25.800 millones. El repositorio preserva los pesos de vision sin cambios, por lo que el modelo mantiene la capacidad image-text-to-text del modelo base.

El proceso de edicion parte del checkpoint REDCELL (a su vez un ajuste de Gemma 4 sobre datos de OSINT y ciberamenazas) y aplica la tecnica de abliteration de Heretic, descrita como una ablacion ortogonal con preservacion de magnitud y correcciones de rango 3, fijada al commit 66a952b49b00bfd1854bdad769fee5fb225b53be. Durante la investigacion se empleo un adaptador de compatibilidad que exponia los expertos fusionados de Gemma 4 como proyecciones lineales individuales. La fusion consumio 7.800 tensores de adaptador y conservo 1.013 nombres y formas de tensor canonicos; el autor verifico pesos de lenguaje finitos, roundtrips exactos de serializacion y tensores inalterados frente a la fuente, ademas de contrastar nueve proyecciones editadas contra un calculo en FP64. Los detalles quedan registrados en `merge-receipt.json` y `SHA256SUMS`. No se detallan el numero de tokens ni la composicion del dataset de entrenamiento original en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multiturno en ingles.
- Razonamiento orientado a OSINT y a inteligencia de ciberamenazas (clasificacion de fuentes, atribucion de actores de amenaza, segun la descripcion del ajuste REDCELL).
- Procesamiento de imagen y texto (image-text-to-text) gracias a la conservacion del componente de vision.
- Razonamiento multi-paso y soporte de agentes, coherente con la clase multimodal y la orientacion a tareas de investigacion.
- Comportamiento con rechazos reducidos: la edicion Heretic hace que el modelo responda a prompts que el original rechazaria (ver benchmarks).
- Idiomas: unicamente ingles.

No se ha confirmado en la informacion disponible el soporte explicito de tool calling / function calling ni un modo de razonamiento (thinking mode) formal.

## Casos de uso

- Analisis de inteligencia de amenazas: el modelo esta ajustado sobre dominios OSINT y de ciberamenazas, por lo que puede resumir y correlacionar informes, indicadores y notas de actores de amenaza en flujos de trabajo de threat intelligence.
- Triaje de capturas y documentos tecnicos: al conservar vision, puede extraer informacion de pantallazos de paneles, diagramas de red o consolas para alimentar un pipeline de analisis.
- Enriquecimiento de alertas en un SOC: uso del modelo como capa de razonamiento que contextualiza alertas y sugiere pasos de investigacion a partir de texto e imagenes asociadas.
- Estudio de abliteration y seguridad de modelos: el checkpoint sirve como material reproducible para investigadores que analizan como la ablacion ortogonal afecta a la tasa de rechazos mantenido la capacidad.
- Redaccion asistida de informes tecnicos: generacion de borradores estructurados en ingles sobre hallazgos de investigacion, con contexto multimodal.
- Extraccion y normalizacion de datos no estructurados: conversion de notas, capturas y articulos en registros estructurados para bases de datos de inteligencia.
- Evaluacion de riesgos en despliegues de modelos abliterados: uso en laboratorio para medir el impacto de la eliminacion de rechazos antes de decidir politicas de acceso.

## Benchmarks y rendimiento

Resultados publicados por el autor a partir de un piloto de ocho ensayos el 14 de octubre de 2026, comparando el REDCELL original en NF4 con la edicion Heretic en NF4 y el despliegue Heretic W6A8 en vLLM.

| Metrica | REDCELL original, NF4 | Edicion Heretic, NF4 | Heretic W6A8, vLLM |
|---|---:|---:|---:|
| Preguntas de capacidad correctas | 19/20 | 19/20 | 19/20 |
| Coincidencias de marcadores de rechazo en prompts reservados | 16/16 | 3/16 | 4/16 |

La capacidad medida se mantiene estable (19/20 en los tres casos), mientras que la tasa de rechazos cae drasticamente (de 16/16 a 3/16 y 4/16). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- BF16 (este repositorio): los 48,07 GiB de pesos exigen al menos ~48-52 GB de VRAM solo para pesos. Requiere GPU como A100 80 GB o H100 80 GB, o bien reparto en multiples GPU de 24 GB (2x RTX 4090 o 2x RTX 3090).
- W6A8 (edicion hermana): al reducir la precision a 6 bits por peso, el peso estimado ronda los 19-20 GB, por lo que cabe en una sola GPU de 24 GB (RTX 4090, RTX 3090, L4 24 GB, etc.).
- NF4: al ser cuantizacion de 4 bits, el peso estimado baja a ~13-14 GB y cabe en GPUs de 16 GB o superiores.
- Opciones de despliegue: transformers para el checkpoint BF16; vLLM para la edicion W6A8 (comprimida con compressed-tensors); llama.cpp/GGUF a partir del modelo base; FriendliAI aparece como proveedor de inferencia para la edicion W6A8.
- Latencia y throughput: no disponible.
- El space de vision anade memoria adicional para procesar imagenes, no cuantificada en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-BF16-Vision | 25,8 B (MoE, ~4 B activos) | no disponible | OSINT/ciberseguridad, abliterado, multimodal | apache-2.0 | safetensors BF16 |
| REDCELL-26B-A4B-OSINT-Cyber (base, APEX/GGUF) | ~26 B (MoE) | no disponible | OSINT/ciberseguridad | no disponible en esta ficha | GGUF |
| google/gemma-4-26B-A4B-it | ~26 B (MoE, ~4 B activos) | no disponible | Uso general, multimodal | licencia de Gemma (no apache-2.0) | safetensors |

No se dispone de datos de benchmarks comparativos con otros modelos de ciberseguridad de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Reduccion deliberada de rechazos: la abliteration baja las coincidencias de marcadores de rechazo de 16/16 a 3/16 (NF4) o 4/16 (W6A8). Esto implica un riesgo elevado de generar contenido que el modelo original bloquearia, especialmente en un dominio sensible como la ciberseguridad ofensiva.
- Riesgo de alucinacion: no hay datos publicados de evaluacion de veracidad; en tareas de atribucion de actores de amenaza o de analisis OSINT la fabricacion de datos es un riesgo critico y requiere verificacion humana.
- Ambito idiomatico limitado: solo ingles.
- Licencia: el repositorio declara apache-2.0, pero el modelo deriva de Gemma 4, cuya licencia original de Google puede imponer condiciones adicionales. Conviene verificar la compatibilidad antes de un uso comercial.
- Estado experimental ("pilot"): el autor lo etiqueta explicitamente como experimental y con cero descargas/likes; no hay garantias de estabilidad ni de soporte.
- Sin datos de contexto: no se especifica la longitud de ventana, lo que impide planificar despliegues con entradas largas.
- Verificacion de la edicion: aunque el autor documenta comprobaciones en FP64 y roundtrips, la ausencia de reproduccion externa limita la confianza en el resultado.
- Componente de vision sin editar: la ablacion se aplico al lenguaje; el comportamiento del pipeline multimodal tras la edicion no esta caracterizado.

## Enlaces

- Repositorio HuggingFace (BF16, vision): https://huggingface.co/Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-BF16-Vision
- Edicion W6A8 para vLLM: https://huggingface.co/Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-W6A8-Vision
- Modelo base REDCELL (original): https://huggingface.co/Xananthium/REDCELL-26B-A4B-OSINT-Cyber-W6A8-Vision
- Modelo base Google Gemma 4 26B-A4B-it: https://huggingface.co/google/gemma-4-26B-A4B-it
- Ajuste REDCELL APEX (GGUF): terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
- Ficha en FriendliAI: https://friendli.ai/models/Xananthium/REDCELL-26B-A4B-OSINT-Cyber-W6A8-Vision
- Referencia del modelo REDCELL APEX en Local AI Zone: https://local-ai-zone.github.io/models/redcell-26b-a4b-osint-cyber-apex.html
- Articulo sobre el lanzamiento de REDCELL: https://intragoals.com/article/a-new-open-weight-ai-model-redcell-releases-locally-runnable-gemma-based-ai-model-fine-tuned-for-cyber-threat-intelligence-93
- Commit de Heretic referenciado por el autor: 66a952b49b00bfd1854bdad769fee5fb225b53be
