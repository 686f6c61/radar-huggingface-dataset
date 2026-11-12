# sujalgawas/aya-json-sftV1

## Resumen

`sujalgawas/aya-json-sftV1` es un adaptador QLoRA de segunda etapa (stage-2) especializado en extracción de JSON estructurado, incluyendo objetos anidados y arrays complejos. Lo desarrolla el usuario independiente `sujalgawas` y se construye sobre el adaptador previo `sujalgawas/aya-json-sft`, cuyo modelo base es `CohereLabs/tiny-aya-global`, un modelo multilingüe de tamano pequeno de Cohere Labs. El resultado es un adaptador PEFT de aproximadamente 0,3 GB que no constituye un modelo completo, sino un delta de pesos que debe combinarse con el modelo base para su uso.

El problema que aborda es concreto: la extracción fiable de JSON anidado a partir de texto libre, una tarea en la que los modelos pequenos suelen fallar de forma catastrófica. Segun la model card, la etapa 1 del adaptador obtenia un 0,0 de validez de esquema en el split `test_nested` y una tasa de alucinacion del 90,9%, mientras que esta segunda etapa alcanza un 0,7143 de validez de esquema y reduce la alucinacion al 11,2% en el mismo split, manteniendo un 1,0 perfecto en el split plano.

La relevancia actual del modelo es acotada pero clara: demuestra que un ajuste fino por etapas con una mezcla de datos planos y jerarquicos (50/50) puede convertir un modelo base minusculo en un extractor de JSON estructurado razonablemente fiable, lo que lo hace interesante para pipelines de extraccion de datos con requisitos de coste y latencia bajos. No obstante, se trata de un artefacto de investigacion sin licencia declarada ni descargas, por lo que su uso en produccion requiere validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (adaptador de ~0,3 GB; el recuento del modelo base no se especifica en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA implica cuantizacion de 4 bits durante el entrenamiento; los formatos de inferencia no se detallan |
| Idiomas soportados | no disponible (el modelo base `tiny-aya-global` es multilingüe, pero el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre el modelo base `CohereLabs/tiny-aya-global`, que actua como backbone congelado en 4 bits mientras se ajustan matrices de bajo rango. El entrenamiento es de segunda etapa: parte del adaptador ya existente `sujalgawas/aya-json-sft` (stage-1) y se afina adicionalmente con un dataset mixto compuesto al 50% por ejemplos planos de stage-1 y al 50% por ejemplos jerarquicos anidados de stage-2 (`sujalgawas/aya-json-sftV1-dataset`). Esta mezcla busca preservar el rendimiento en extraccion plana mientras se ensena la estructura anidada.

La model card menciona herramientas del ecosistema de entrenamiento como `aligntune`, `curatorkit` y `auditkit`, que sugieren un pipeline de alineacion y curacion de datos, aunque no se detallan hiperparametros, numero de tokens de entrenamiento, composicion exacta del dataset ni si se empleo RLHF o DPO. No se documentan innovaciones arquitectonicas mas alla del propio ajuste por etapas; la innovacion principal es metodologica: la estrategia de entrenamiento incremental con mezcla de dificultades.

## Capacidades

- Extraccion de JSON estructurado a partir de texto libre, con soporte de esquemas planos y jerarquicos.
- Generacion de objetos JSON anidados, incluyendo arrays de objetos y campos opcionales.
- Manejo de valores nulos: alcanza un 0,8776 de precision en el split anidado segun la model card.
- Validacion de esquema: 0,7143 de validez en `test_nested` y 1,0 en `test_flat`.
- Capacidades multilingües heredadas del modelo base `tiny-aya-global` (no verificadas especificamente en el adaptador).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Extraccion de datos de facturas y recibos: el adaptador convierte texto OCR de documentos en JSON anidado con lineas de detalle, impuestos y totales, aprovechando su buen rendimiento en arrays y objetos anidados (0,7868 de completitud de arrays).
- Enriquecimiento de registros en pipelines ETL: se puede insertar el modelo tras una etapa de parsing para normalizar campos heterogeneos a un esquema JSON fijo, con la ventaja de que el split plano alcanza validez perfecta (1,0).
- Procesamiento de curriculums y formularios: extraccion de secciones jerarquicas (experiencia laboral con subcampos de empresa, fechas y responsabilidades) donde la estructura anidada es imprescindible.
- Preprocesamiento para bases de datos relacionales: conversion de texto no estructurado en JSON que luego se carga en tablas, usando el modelo como paso intermedio barato antes de validaciones con JSON Schema.
- Clasificacion y etiquetado de contenido con salida estructurada: generacion de etiquetas y metadatos en formato JSON para sistemas de moderacion o catalogacion, donde la tasa de alucinacion del 11,2% es aceptable si se anade validacion posterior.
- Prototipado e investigacion en extraccion de informacion: el adaptador sirve como referencia reproducible de entrenamiento por etapas con mezcla de datos planos y anidados, util para equipos que disenan sus propios extractores con modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card (sin datos de modelos externos comparables):

| Modelo | Split | Schema valid | Doc exact | Nested object acc | Array completeness | Null acc | Hallucination rate |
|---|---|---:|---:|---:|---:|---:|---:|
| Stage-1 (`sujalgawas/aya-json-sft`) | `test_nested` | 0,0 | 0,0 | 0,0626 | 0,0456 | 0,0578 | 0,9091 |
| Stage-2 (`sujalgawas/aya-json-sftV1`) | `test_nested` | 0,7143 | 0,7143 | 0,8288 | 0,7868 | 0,8776 | 0,1122 |
| Stage-2 (`sujalgawas/aya-json-sftV1`) | `test_flat` | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 0,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo base de tipo "tiny", la huella es reducida. El repositorio del adaptador ocupa 0,3 GB, y el modelo base completo requiere una cantidad de VRAM no especificada en la informacion disponible.
- GPU recomendadas: no disponibles. Por el tamano del modelo base, es probable que quepa en GPUs de consumo, pero no se confirma en la documentacion.
- Cabe en consumer GPU: probable por el perfil "tiny" del modelo base, pero no confirmado.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse junto con `CohereLabs/tiny-aya-global` mediante la libreria `peft` y `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La unica comparacion disponible es interna, entre la etapa 1 y la etapa 2 del propio adaptador:

| Modelo | Base | Enfoque | Schema valid (`test_nested`) | Hallucination rate (`test_nested`) | Licencia |
|---|---|---|---:|---:|---|
| `sujalgawas/aya-json-sft` (stage-1) | `tiny-aya-global` | QLoRA, datos planos | 0,0 | 0,9091 | no disponible |
| `sujalgawas/aya-json-sftV1` (stage-2) | `tiny-aya-global` | QLoRA, 50% plano + 50% anidado | 0,7143 | 0,1122 | no disponible |

## Limitaciones y advertencias

- La validez de esquema en datos anidados es del 71,4%, lo que implica que casi un tercio de las salidas pueden no cumplir el esquema esperado; se requiere validacion y reintento en produccion.
- La tasa de alucinacion del 11,2% en el split anidado no es despreciable para aplicaciones criticas.
- El modelo no declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados por el adaptador; el rendimiento fuera del ingles o de los idiomas del dataset de entrenamiento es desconocido.
- No hay informacion sobre sesgos, longitud de contexto efectiva ni comportamiento con entradas largas.
- El adaptador tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso comunitario ni validacion independiente.
- Al ser un adaptador PEFT, no es autonomo: depende de la version concreta del modelo base y de la libreria `peft`, lo que anade riesgo de incompatibilidad.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su uso en flujos agenticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sujalgawas/aya-json-sftV1
- Adaptador de etapa 1: https://huggingface.co/sujalgawas/aya-json-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/sujalgawas/aya-json-sftV1-dataset
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
