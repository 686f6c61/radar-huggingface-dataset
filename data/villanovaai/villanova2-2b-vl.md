# VillanovaAI/Villanova2-2B-VL

## Resumen

Villanova2-2B-VL es un modelo de lenguaje y vision (VLM) de 2.826.553.344 parametros desarrollado por VillanovaAI, construido sobre el modelo base de texto VillanovaAI/Villanova2-2B-Base. Emplea la arquitectura `qwen3_vl` dentro de la libreria `transformers` y esta orientado a tareas de comprension de imagen y texto (`image-text-to-text`), con enfasis declarado en comprension de documentos y OCR. Su licencia es Apache 2.0, aunque el acceso al repositorio esta restringido y requiere aceptar condiciones en Hugging Face.

El modelo se presenta como una propuesta "europea" (tag `european`) con soporte declarado de ingles, italiano, aleman, espanol y frances, lo que lo situa en el segmento de VLM pequenos multilingues orientados a despliegue en produccion con recursos limitados. Con menos de 3.000 millones de parametros, es candidato a inferencia en GPU de consumo y a escenarios de OCR y procesamiento documental donde el coste por pagina es critico.

La relevancia actual del modelo radica en la combinacion de tamano reducido, licencia permisiva y capacidades multimodales, un perfil poco frecuente en el ecosistema de VLM. No obstante, la informacion publica disponible es escasa: no se detallan datos de entrenamiento, composicion del dataset ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_vl` (vision-language transformer) |
| Parametros totales | 2.826.553.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it, de, es, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura `qwen3_vl`, lo que indica un diseno de transformer multimodal con un codificador visual acoplado a un decodificador de lenguaje, siguiendo el patron de la familia Qwen3-VL. El modelo base es VillanovaAI/Villanova2-2B-Base, sobre el que se ha realizado un ajuste fino multimodal (tag `finetune`). El repositorio ocupa 5,7 GB en safetensors, coherente con un modelo de ~2,8 mil millones de parametros en precision de 16 bits junto con los pesos del codificador visual.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset multimodal, la presencia de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Los papers referenciados en los tags (`arxiv:2610.22086` y `arxiv:2604.18347`) no han podido verificarse en la informacion proporcionada, por lo que no se confirma su contenido.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Comprension de documentos y OCR, segun los tags declarados (`document-understanding`, `ocr`).
- Conversacion multimodal multi-turno (tag `conversational`).
- Capacidades multilingues en ingles, italiano, aleman, espanol y frances.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision, audio u otras capacidades especiales: no disponible (solo se confirma vision por el pipeline).

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede extraer campos estructurados (importes, fechas, CIF) de imagenes de documentos, aprovechando su perfil de OCR y su tamano reducido para procesar lotes grandes en una sola GPU.
- Procesamiento de tickets de compra para contabilidad: al ser un VLM pequeno, permite desplegar un pipeline de OCR mas extraccion en local sin depender de APIs externas, con coste marginal bajo por documento.
- Atencion al cliente con imagenes adjuntas: el usuario puede enviar capturas o fotos y el modelo responde en castellano, italiano, aleman, frances o ingles, lo que encaja en soporte multilingue europeo.
- Accesibilidad: descripcion automatica de imagenes en aplicaciones para personas con discapacidad visual, con generacion de texto en el idioma del usuario.
- Moderacion de contenido visual en comunidades: clasificacion y descripcion de imagenes subidas por usuarios, con la ventaja de la licencia Apache 2.0 para integrarlo en productos comerciales.
- Extraccion de informacion de formularios escaneados en administraciones publicas europeas: el soporte multilingue (es, fr, de, it) y la licencia permisiva facilitan su adopcion en entornos con requisitos de soberania de datos.
- Preprocesado en pipelines de RAG documental: conversion de PDFs escaneados a texto estructurado antes de la indexacion vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3-4 GB de pesos; en 4 bits, aproximadamente 1,5-2 GB, aunque los tipos de cuantizacion no estan confirmados por el autor.
- GPU recomendadas: NVIDIA RTX 4090, RTX 4080, A10G, L4 o A100 para despliegues de mayor throughput; cabe en GPU de consumo con 8 GB o mas en cuantizacion.
- Despliegue: compatible con `transformers` (libreria declarada); soporte de vLLM, llama.cpp, Ollama o TGI no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Villanova2-2B-VL | 2,83 B | no disponible | Apache 2.0 | Acceso restringido (gated); multilingue europeo |
| Qwen2.5-VL-3B | 3 B aprox. | 32k aprox. (no confirmado en esta ficha) | Apache 2.0 | Referencia de la familia en la que se inspira la arquitectura |
| PaliGemma-3B | 3 B aprox. | 8k aprox. (no confirmado en esta ficha) | Gemma license | VLM pequeno de Google, licencia no Apache |
| SmolVLM-2B | 2 B aprox. | no disponible | Apache 2.0 | VLM pequeno de Hugging Face, orientado a dispositivo |

Los datos de contexto y rendimiento de los modelos comparables no se han verificado en la informacion proporcionada y deben contrastarse con sus fichas oficiales antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es `gated` y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Informacion publica muy limitada: sin datos de entrenamiento, contexto, cuantizaciones ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinacion en OCR y extraccion de campos: en modelos de este tamano es habitual que confundan caracteres o inventen valores en documentos de baja calidad; se recomienda validacion posterior.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de alineacion, por lo que no se pueden evaluar sesgos de genero, culturales o linguisticos.
- Cobertura multilingue declarada pero no evaluada: el soporte de es, fr, de, it y en no viene respaldado por benchmarks publicos en la informacion disponible.
- Longitud de contexto no disponible: limita la planificacion de casos con documentos largos o conversaciones extensas.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones adicionales del acceso gated.
- Descargas muy bajas (7) y pocos likes (4): ecosistema incipiente, poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/VillanovaAI/Villanova2-2B-VL
- Modelo base: https://huggingface.co/VillanovaAI/Villanova2-2B-Base
- Paper referenciado (tag): arxiv:2610.22086 (no verificado)
- Paper referenciado (tag): arxiv:2604.18347 (no verificado)
