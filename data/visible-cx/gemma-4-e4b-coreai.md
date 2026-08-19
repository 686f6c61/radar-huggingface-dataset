# visible-cx/gemma-4-E4B-CoreAI

## Resumen

El modelo `visible-cx/gemma-4-E4B-CoreAI` es una conversión del checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized` al formato Core AI (`.aimodel`) para Apple silicon, desarrollada por el proyecto Visible. Se trata de un artefacto derivado: los pesos entrenados con cuantización consciente (QAT) se redondean a la cuadrícula int4 para la que fueron entrenados y se re-expresan como un grafo ejecutable en el runtime Core AI de Apple, pensado para ejecución on-device en Mac y iPhone.

El modelo base, Gemma 4 E4B, pertenece a la familia Gemma 4 de Google, que soporta hasta 256K tokens de contexto y más de 140 idiomas. Esta conversión concreta utiliza una arquitectura con *Per-Layer Embeddings* (PLE), lo que obliga a suministrar una tabla de embeddings como entrada estática adicional al grafo. El resultado son bundles de aproximadamente 4 GB que requieren un sidecar de 3,6 GB para funcionar, y que ofrecen longitudes de contexto de 4096, 8192 o 16384 tokens según la variante elegida.

La relevancia de este modelo radica en que permite ejecutar un Gemma 4 cuantizado en hardware Apple sin depender de la nube, con soporte para salida estructurada mediante restricciones gramaticales. No obstante, las mediciones del autor indican que el rendimiento es lento y limitado por memoria en un Mac de 16 GB, y que el motor secuencial (el único que soporta logits) requiere una copia adicional de 2,69 GB de constantes en la carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Per-Layer Embeddings (PLE); no se especifica si es densa o MoE |
| Parametros totales | No disponible (denominacion E4B, probablemente ~4 mil millones) |
| Parametros activos | No disponible |
| Longitud de contexto | 4096, 8192 o 16384 segun el bundle (manifest); el modelo base soporta hasta 256K |
| Tipos de cuantizacion | int4 por bloque de 32 (int4lin, simetrico con recorte, grid ggml q4_0); variante experimental w4a8 (pesos int4, activaciones int8) |
| Idiomas soportados | Mas de 140 idiomas (segun documentacion oficial de Gemma 4) |
| Licencia | Gemma (terminos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | Core AI `.aimodel` (archivo `main.mlirb`), con sidecar de tabla PLE en `ios-frontend/` |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized` es la version instruct (it) de Gemma 4 E4B, entrenada por Google con cuantizacion consciente (QAT) para operar en int4 sobre el grid ggml q4_0. Los pesos se almacenan a ancho completo en el checkpoint, y el redondeo a int4 ocurre durante la exportacion al formato Core AI, sobre la misma cuadricula que el entrenamiento ya habia apuntado.

La conversion realizada por Visible reexpresa esos pesos como un grafo Core AI, utilizando la toolchain `coreai-torch 0.4.1`, `coreai-core 1.0.0b2` y `coreai-opt 0.2.1`. El proceso de exportacion tarda unos 241 segundos en un sistema Linux x86_64 con 44 GB de pico de RAM para el decode, y 196 segundos con 42,7 GB para el prefill con ancho 64.

Una caracteristica destacada es el uso de *Per-Layer Embeddings* (PLE): la tabla de embeddings por capa no se incluye dentro del grafo, sino que se suministra como una entrada estatica (`ple_table` y `ple_scale`). Esta tabla, publicada en el directorio `ios-frontend/`, es imprescindible para que los bundles funcionen; sin ella, el runtime falla con un error de aridad de entrada que no menciona la tabla.

El modelo base de Gemma 4 incorpora soporte nativo de system prompt y multi-token prediction con un modelo borrador para decodificacion especulativa, aunque esta conversion no documenta si esas funcionalidades estan disponibles en el runtime Core AI.

## Capacidades

- Generacion de texto en multiples idiomas (mas de 140 segun la documentacion de Gemma 4).
- Salida estructurada con restricciones gramaticales: el autor reporta 10/10 aciertos en un test de esquema enum-clean propio.
- Razonamiento y codigo, como capacidades heredadas del modelo base Gemma 4 (no verificadas en esta conversion).
- Soporte de system prompt (funcionalidad nativa de Gemma 4).
- Decodificacion especulativa con modelo borrador (presente en el modelo base; no se confirma su disponibilidad en el runtime Core AI).
- Ejecucion on-device en Apple silicon (macOS 27 / iOS 27) mediante el runtime Core AI.
- Dos motores de ejecucion: *pipelined* (sin soporte de logits, por lo que no permite decodificacion guiada) y *sequential* (unico con logits, necesario para salida estructurada).
- No se documenta soporte de tool calling, agentes ni capacidades multimodales en esta conversion.

## Casos de uso

- Asistente local privado en macOS: el modelo puede ejecutarse integramente en un Mac con Apple silicon, manteniendo las conversaciones en el dispositivo sin enviar datos a la nube. Su ventana de contexto de hasta 16K tokens permite mantener dialogos multi-turno extensos.
- Extraccion de informacion estructurada: gracias a la salida con restricciones gramaticales, puede convertir texto libre en JSON u otros formatos con un esquema fijo, util para parsing de documentos, facturas o formularios.
- Autocompletado de codigo en Xcode: como modelo de generacion de texto con capacidades de codigo, puede integrarse en un plugin local para sugerencias de codigo en proyectos Swift o Objective-C, sin conexion.
- Chatbot offline para atencion al cliente en entornos corporativos: desplegado en Macs de empleados o en un servidor local con Apple silicon, responde consultas frecuentes con contexto de hasta 16K tokens, reduciendo la dependencia de servicios externos.
- Procesamiento de documentos legales o tecnicos: con su contexto de 16K tokens y generacion de texto, puede resumir o extraer clausulas de contratos largos, siempre que el documento quepa en la ventana.
- Herramienta educativa interactiva: un tutor local que explica conceptos de programacion o matematicas, ejecutable en un Mac o iPad, con la ventaja de no requerir conexion a internet.
- Generacion de informes estructurados: dado un conjunto de datos de entrada, el modelo puede producir informes en un formato predefinido (por ejemplo, Markdown o CSV) gracias a su capacidad de salida guiada por gramatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta conversion. El unico dato de rendimiento funcional es el test de salida estructurada del autor: 10/10 aciertos en un esquema enum-clean propio de Visible. Tampoco se proporcionan mediciones de latencia o throughput numericas, aunque el autor indica que el modelo es "lento y limitado por memoria" en un Mac de 16 GB.

## Requisitos de hardware

- Apple silicon Mac (M1 o posterior) con runtime Core AI instalado (macOS 27 o superior, segun la documentacion de la conversion).
- El bundle principal (`gpu-pipelined/gemma4_e4b_qat_decode_int4lin_tbl_pf64`) ocupa 3,99 GB, y la tabla PLE sidecar 3,60 GB, por lo que se necesitan al menos 8 GB de almacenamiento y un minimo de 16 GB de RAM para una operacion fluida (el autor reporta que en 16 GB el rendimiento es lento y memory-bound).
- El motor *sequential* (necesario para logits y salida estructurada) realiza una copia unica de 2,69 GB de constantes en la carga, lo que incrementa el pico de memoria.
- Se recomienda una GPU Apple (integrada en el SoC) con al menos 16 GB de memoria unificada; no se ha probado en GPUs discretas.
- Opciones de despliegue: exclusivamente el runtime Core AI de Apple, con los motores *pipelined* o *sequential* segun la necesidad de logits. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- El modelo no cabe en GPUs consumer convencionales (NVIDIA, AMD) porque el formato Core AI es especifico de Apple.

## Comparativa con modelos similares

No se dispone de datos publicados para una comparativa cuantitativa con alternativas. Existen otras conversiones de Gemma 4 E4B a Core AI, como `mlboydaisuke/gemma-4-E4B-CoreAI`, que segun su documentacion logra una coincidencia token a token con el modelo fp32 de referencia en GPU de Mac y iPhone, pero no se han publicado benchmarks comparativos entre ambas conversiones. Tampoco se dispone de datos de modelos similares en el mismo formato (por ejemplo, Llama 3.2 3B cuantizado a int4 para Apple silicon) en la informacion proporcionada.

## Limitaciones y advertencias

- Los bundles no funcionan sin la tabla PLE sidecar (`ios-frontend/gemma4_e4b_qat_gather_raw/`); un error de aridad de entrada puede confundir al usuario si no se conoce este requisito.
- El motor *pipelined* no soporta logits, por lo que la decodificacion guiada por gramatica solo es posible con el motor *sequential*, que es mas lento y consume mas memoria.
- Rendimiento limitado en Mac de 16 GB: el autor lo describe como "lento y memory-bound", lo que puede hacerlo impractico para aplicaciones en tiempo real.
- La longitud de contexto maxima en esta conversion es de 16384 tokens (en la variante `ctx16384`), muy por debajo de los 256K que soporta el modelo base. Ampliar el contexto requiere editar el manifest, no reexportar el grafo.
- La licencia Gemma de Google impone restricciones de uso comercial; es necesario revisar los terminos en https://ai.google.dev/gemma/terms antes de desplegar en produccion.
- No se han evaluado sesgos ni riesgos de alucinacion especificos de esta conversion; se heredan los del modelo base Gemma 4.
- El formato Core AI es propietario de Apple y solo ejecuta en hardware Apple silicon, lo que limita la portabilidad a otros entornos.
- La variante `w4a8` (experimental) puede presentar inestabilidades; el autor la marca como "EXPERIMENTAL".

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visible-cx/gemma-4-E4B-CoreAI
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion general de Gemma 4: https://ai.google.dev/gemma/docs/core
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio coreai-model-zoo (receta de exportacion): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/gemma4-e4b
- Conversion similar de mlboydaisuke: https://huggingface.co/mlboydaisuke/gemma-4-E4B-CoreAI
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
