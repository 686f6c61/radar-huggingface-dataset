# vennyvirtuoso/sarvam-1-hindi-marathi

## Resumen

Sarvam-1 Hindi-Marathi es un ajuste fino completo (*full fine-tuning*) del modelo causal `sarvamai/sarvam-1`, un transformer decoder-only de 2.525 millones de parametros (2,52B) desarrollado originalmente por Sarvam AI para el ecosistema de lenguas indicas. Este checkpoint, publicado por el usuario `vennyvirtuoso`, especializa el modelo base en traduccion automatica unidireccional de hindi a marathi, ambos en escritura devanagari, mediante el entrenamiento de la totalidad de sus parametros sobre un corpus paralelo filtrado semanticamente.

El modelo resuelve un problema concreto: la traduccion de calidad entre dos lenguas indicas estrechamente relacionadas pero con diferencias morfosintacticas y lexicas relevantes, un par para el que los modelos multilingues genericos suelen rendir por debajo de lo deseable. El ajuste se realizo sobre 2.095.356 pares de frases paralelas limpias, filtradas con alineamiento semantico LaBSE (S >= 0,75), durante 3 epocas completas (196.440 pasos, batch efectivo de 32, aproximadamente 6,28 millones de muestras vistas).

Su relevancia radica en que demuestra que un modelo base de 2,52B puede alcanzar metricas competitivas en un par linguistico de bajos recursos mediante ajuste completo y un corpus bien curado, con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su despliegue en infraestructura moderada. La perdida de validacion convergio de 28,04 a 1,4935.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Llama) |
| Parametros totales | 2.525.087.744 (2,52B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en bfloat16 es compatible con cuantizacion estandar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | hindi (hi) y marathi (mr), ambos en devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del `sarvamai/sarvam-1`, un causal language model de 2,52B parametros etiquetado como `llama` en Hugging Face, es decir, un transformer decoder-only con atencion causal estandar. El checkpoint publicado aplica un ajuste fino del 100% de los parametros (no LoRA ni adaptadores), lo que implica que los 2.525 millones de pesos fueron actualizados durante el entrenamiento.

El entrenamiento se realizo durante 3 epocas completas con un batch efectivo de 32, alcanzando 196.440 pasos y aproximadamente 6,28 millones de muestras procesadas. El corpus consistio en 2.095.356 pares de frases paralelas hindi-marathi, filtradas mediante alineamiento semantico con LaBSE exigiendo una similitud S >= 0,75, lo que reduce el ruido de traduccion y pares desalineados. La perdida de validacion descendio de 28,04 a 1,4935, indicando convergencia. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores al entrenamiento supervisado, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion automatica unidireccional de hindi a marathi en escritura devanagari.
- Generacion de texto causal, ya que el modelo base es un causal LM y el pipeline declarado es `text-generation`.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`), tal como muestra el ejemplo de uso del autor.
- Instrucciones en formato prompt de traduccion ("Translate the following text from Hindi to Marathi: ...").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a hindi y marathi segun los metadatos de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Traduccion de documentacion administrativa y gubernamental entre hindi y marathi: el modelo puede procesar parrafos completos en devanagari y generar la version marathi, adecuado para organismos que operan en varios estados indios.
- Localizacion de contenido editorial y periodistico: traduccion de articulos y notas de prensa del hindi al marathi manteniendo registro formal, apoyandose en el ajuste sobre corpus paralelo filtrado.
- Subtitulado y doblaje: traduccion de guiones y dialogos para produccion audiovisual destinada a audiencias marathi, con la advertencia de que la evaluacion en IN22-Conv (SacreBLEU 16,91) sugiere mayor dificultad en registro conversacional.
- Atencion al cliente regional: generacion de respuestas y traduccion de mensajes en un chatbot de soporte que atienda a usuarios marathi a partir de material fuente en hindi, usando la plantilla de chat del modelo.
- Traduccion de material educativo y cientifico divulgativo: conversion de apuntes, guias y contenido de cursos del hindi al marathi para plataformas de e-learning en India.
- Preprocesamiento en pipelines de NLP: uso del modelo como componente de traduccion dentro de cadenas mas amplias (analisis, resumen, extraccion de informacion) que requieran normalizar contenido hindi a marathi.
- Investigacion en traduccion automatica de bajos recursos: punto de partida reproducible (licencia Apache 2.0) para experimentos de ajuste completo en pares indicos.

## Benchmarks y rendimiento

Evaluado sobre 8.539 pares de frases de test en 4 benchmarks estandar, segun los datos del autor:

| Benchmark | Muestras | SacreBLEU (flores200) | SacreBLEU (intl) | chrF++ | WMT22-COMET-DA |
|---|---|---|---|---|---|
| Held-Out Test | 5.000 | 21,72 | 13,24 | 39,12 | 0,7715 |
| FLORES-200 devtest | 1.012 | 20,76 | 10,35 | 39,99 | 0,7201 |
| IN22-Gen | 1.024 | 18,93 | 10,02 | 38,53 | 0,7096 |
| IN22-Conv | 1.503 | 16,91 | 11,32 | 37,21 | 0,7731 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5-6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 8-10 GB para secuencias cortas y mas para contextos largos.
- En cuantizacion de 8 bits: alrededor de 2,5-3 GB de pesos; en 4 bits: aproximadamente 1,3-1,6 GB, aunque estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090, RTX 3090 o A10G para servicio de baja latencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 (RTX 3070/4060 Ti y superiores), y en 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `device_map="auto"` (metodo documentado por el autor), vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarvam-1-hindi-marathi (este) | 2,52B | no disponible | Traduccion hi->mr ajustada | Apache 2.0 | Hugging Face, 11 descargas |
| sarvamai/sarvam-1 (base) | 2,52B | no disponible | LLM causal multilingue indico | no disponible en la informacion | Hugging Face |
| Modelos NMT dedicados tipo IndicTrans2 | no disponible en la informacion | no aplica | Traduccion indico-indico | no disponible en la informacion | no disponible |

La comparacion cuantitativa con alternativas no puede establecerse porque la informacion proporcionada no incluye resultados de otros modelos sobre los mismos benchmarks. El modelo base `sarvamai/sarvam-1` es la referencia directa, y este checkpoint anade especializacion en el par hindi-marathi a costa de un posible estrechamiento de sus capacidades generales.

## Limitaciones y advertencias

- Direccionalidad: el ajuste esta disenado para hindi a marathi; no se documenta rendimiento en sentido inverso (marathi a hindi).
- Ambito linguistico restringido: los metadatos declaran solo `hi` y `mr`; el uso con otras lenguas no esta validado y probablemente degrade.
- Riesgo de alucinacion y omision: como todo modelo generativo, puede producir traducciones fluidas pero infieles, especialmente en frases largas o con terminologia especializada; la evaluacion en IN22-Conv (SacreBLEU 16,91) sugiere menor calidad en registro conversacional.
- Sesgos: no se documenta analisis de sesgos en la informacion disponible; el corpus paralelo filtrado por LaBSE puede heredar sesgos de las fuentes originales.
- Contexto: la longitud maxima de contexto no esta especificada, lo que impide garantizar el comportamiento en documentos extensos.
- Caveat de procedencia: el autor del checkpoint es un usuario individual (`vennyvirtuoso`) y el ejemplo de codigo de la model card referencia un identificador distinto (`Solosix/sarvam-1-hindi-marathi`), lo que conviene verificar antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan las condiciones de la licencia del modelo base original ni posibles restricciones heredadas.
- Madurez: 11 descargas y 0 likes indican adopcion practicamente nula; no hay evidencia de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/sarvam-1-hindi-marathi
- Modelo base: https://huggingface.co/sarvamai/sarvam-1
- Identificador alternativo citado en la model card: https://huggingface.co/Solosix/sarvam-1-hindi-marathi
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
