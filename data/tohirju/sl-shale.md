# Tohirju/sl-shale

## Resumen

El modelo `Tohirju/sl-shale` es un modelo de lenguaje publicado en Hugging Face por Tohirju (Tohir Saidzoda), un desarrollador con varios modelos en su perfil. El repositorio está etiquetado como `gguf` y `conversational`, lo que sugiere que se distribuye en formato GGUF para inferencia eficiente en CPU/GPU y está orientado a tareas de conversación. Según los metadatos, el modelo tiene aproximadamente 8.950 millones de parámetros (8,95B), lo que lo sitúa en la gama media de modelos de lenguaje. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face para poder descargarlo.

La información pública disponible es muy limitada: no se especifican la arquitectura, el entrenamiento, los idiomas soportados ni los benchmarks. Tampoco hay documentación adicional en la página del modelo ni en los resultados de búsqueda web, que solo muestran la actividad general del autor. Esto hace que sea difícil evaluar su rendimiento o sus capacidades reales. A pesar de su reciente creación (agosto de 2026), el modelo no ha recibido descargas ni valoraciones, lo que sugiere que es un proyecto personal o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag indica GGUF, pero no se detallan las variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifica cual) |
| Formato de pesos | GGUF (segun etiqueta); safetensors presente en metadatos |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (si es un transformer denso, MoE, etc.) ni sobre el proceso de entrenamiento. No se conocen el volumen de datos, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. La unica pista es el tag `conversational`, que indica que el modelo esta disenado para dialogos, pero sin detalles tecnicos adicionales.

## Capacidades

No se dispone de informacion detallada sobre las capacidades del modelo. Por los tags, se espera que sea un modelo de lenguaje generativo para conversacion, pero no hay evidencia publica de que soporte razonamiento complejo, generacion de codigo, tool calling, agentes o capacidades multilingues. Tampoco se mencionan modos especiales como thinking mode o vision.

## Casos de uso

No se puede recomendar casos de uso concretos sin informacion sobre rendimiento, contexto o idiomas. Dado el acceso restringido y la falta de documentacion, cualquier aplicacion en produccion seria arriesgada. Se podria explorar como prototipo en entornos de investigacion, pero no hay datos que avalen su fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

No se han publicado requisitos de hardware especificos. Al estar en formato GGUF, es probable que pueda ejecutarse con llama.cpp o herramientas similares, pero se desconoce la VRAM necesaria. Para un modelo de ~8,95B en cuantizacion Q4_K_M, una estimacion generica seria de unos 5-6 GB de VRAM, pero esto es una suposicion basada en modelos similares, no en datos oficiales. No se puede confirmar si cabe en GPUs de consumo como RTX 3060 o RTX 4090 sin pruebas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas. No hay datos de rendimiento ni de arquitectura que permitan establecer una comparativa objetiva con modelos de tamano similar como Llama 3.1 8B, Mistral 7B o Gemma 2 9B.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso.
- Falta de documentacion: no hay informacion sobre arquitectura, entrenamiento, idiomas ni licencia especifica.
- Riesgo de alucinacion: al ser un modelo de lenguaje sin evaluaciones publicas, no se puede garantizar la fiabilidad de sus respuestas.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no se pueden evaluar posibles sesgos.
- Uso en produccion no recomendado: sin benchmarks ni garantias de calidad, no es adecuado para aplicaciones criticas.

## Enlaces

- [Hugging Face - Tohirju/sl-shale](https://huggingface.co/Tohirju/sl-shale)
- [Perfil del autor en Hugging Face](https://huggingface.co/Tohirju)
