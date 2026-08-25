# tcontorno/edgar-bpe-131072-line

## Resumen

`edgar-bpe-131072-line` es un tokenizador byte-level BPE desarrollado por tcontorno, entrenado exclusivamente sobre documentos de la SEC (archivos EDGAR). El corpus de entrenamiento consta de 4 356 documentos, 1,3 GB de texto limpio procedente de presentaciones primarias (iXBRL/HTML convertidos a texto, conservando números y Unicode), abarcando el periodo 2010-2024 y aproximadamente 4 250 empresas. La variante publicada emplea una pre-tokenización por líneas que permite que los merges crucen espacios dentro de una misma línea, de modo que el lenguaje recurrente de los informes financieros se fusiona en tokens de frase completa (por ejemplo, `Item 1A. Risk Factors` pasa a ser 2 tokens).

El objetivo del proyecto es reducir drásticamente el número de tokens necesarios para codificar documentos SEC en comparación con tokenizadores generalistas. Según las mediciones del autor sobre 216 documentos de retención (hold-out), el modelo alcanza 8,94 bytes por token, un 86 % más de tokens que GPT-4o (o200k), un 95 % más que GPT-2 y un 103 % más que Qwen3 para el mismo texto. El tamaño del vocabulario es de 131 072, con un único token especial `<|endoftext|>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE con pre-tokenizacion `line` (merges que cruzan espacios dentro de una linea) |
| Parametros totales | no disponible (no aplica: es un tokenizador, no un modelo de lenguaje) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica: el tokenizador no define contexto; el nombre del repo incluye 131072, pero es el tamano del vocabulario, no la longitud de contexto) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | tokenizer.json (formato de la libreria `tokenizers` de Hugging Face) |

## Arquitectura y entrenamiento

El tokenizador usa un algoritmo BPE a nivel de byte (byte-level BPE), con un vocabulario de 131 072 tokens y una frecuencia minima de merge de 4. La pre-tokenizacion se realiza en modo `line`, lo que significa que los merges pueden cruzar espacios dentro de una misma linea, pero no entre lineas. Esta eleccion permite que fragmentos de texto muy frecuentes en los informes SEC (como encabezados de seccion o formulas estandar) se codifiquen como tokens unicos, mejorando la compresion.

El corpus de entrenamiento se construyo a partir de documentos primarios de presentaciones SEC (iXBRL/HTML), limpiados a texto plano conservando numeros y Unicode real. Se aplico deduplicacion por hash de contenido y se separo un 5 % de los documentos como conjunto de retencion. El entrenamiento se realizo sobre una submuestra de 1 500 documentos (seleccionados con semilla fija) para limitar el uso de memoria, tal y como se registra en `meta.json`. Solo se incluye un token especial `<|endoftext|>`. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion porque no aplican a un tokenizador.

## Capacidades

- Codificacion y decodificacion de texto de documentos SEC con una compresion significativamente mejor que los tokenizadores generalistas (8,94 bytes/token de media en documentos de retencion).
- Fusion de frases recurrentes en tokens unicos gracias a la pre-tokenizacion `line`, reduciendo el numero de tokens en plantillas y lenguaje estandar de informes.
- Soporte de numeros y caracteres Unicode reales (no se elimina ni normaliza).
- Compatible con la libreria `transformers` (`AutoTokenizer`) y con la libreria `tokenizers` directamente.
- No es un modelo de lenguaje: no genera texto, no realiza razonamiento, ni soporta tool calling, agentes o vision. Sus capacidades se limitan a la tokenizacion.

## Casos de uso

- Preprocesamiento de corpus SEC para entrenar modelos de lenguaje especificos de finanzas: al reducir el numero de tokens en documentos 10-K, 10-Q, 8-K y DEF 14A, se reduce el coste computacional y la memoria necesaria para entrenar modelos sobre este dominio.
- Reduccion de costes de inferencia en modelos LLM que procesan documentos SEC: si se entrena un modelo con este tokenizador, la ventana de contexto disponible en tokens efectivos es mayor (por ejemplo, un 10-K que con GPT-4o ocuparia ~65k tokens pasa a 34 650 tokens).
- Construccion de sistemas de busqueda semantica sobre archivos SEC: al tokenizar con mayor compresion, los indices vectoriales o de texto completo pueden cubrir mas documentos con el mismo presupuesto de tokens.
- Investigacion sobre tokenizacion de dominio especifico: el repo incluye un write-up con metodologia y tablas de benchmarks que puede servir de referencia para comparar estrategias de pre-tokenizacion (line vs. otros modos).
- Analisis de datos financieros masivos: el tokenizador permite procesar grandes volumenes de presentaciones SEC (miles de documentos) con un menor numero de tokens totales, lo que acelera tareas de extraccion y clasificacion de informacion.
- Generacion de resumenes o analisis de informes 10-K, 10-Q, 8-K y DEF 14A: al reducir la longitud del texto tokenizado, se puede ampliar la cantidad de contexto que cabe en la ventana de un modelo generativo (siempre que el modelo se entrene con este tokenizador).

## Benchmarks y rendimiento

El autor publica mediciones sobre 216 documentos de retencion (held-out) que no se usaron en el entrenamiento. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| Bytes/token en documentos SEC de retencion | 8,94 |
| Tokens necesarios por GPT-4o (o200k) para el mismo texto | +86 % |
| Tokens necesarios por GPT-2 | +95 % |
| Tokens necesarios por Qwen3 | +103 % |
| Mediana de un 10-K (con GPT-4o: ~65k tokens) | 34 650 tokens |

Ademas, se menciona un probe de 450 documentos de distintos tipos de formulario (10-Q, 8-K, DEF 14A) que confirma que las ventajas de compresion se generalizan mas alla del formulario de entrenamiento. No se han publicado resultados de benchmarks de tareas de NLP (como MMLU o HumanEval) porque el modelo no es un LLM.

## Requisitos de hardware

- No aplica para inferencia de modelo de lenguaje: al ser un tokenizador, no requiere VRAM ni GPU. Su uso en CPU es inmediato.
- El entrenamiento del tokenizador requiere memoria RAM suficiente para procesar el corpus (el autor limito el conjunto a 1 500 documentos por motivos de memoria). En la practica, un equipo con 16-32 GB de RAM es suficiente para reproducir el entrenamiento.
- Integrable en pipelines de Hugging Face con `AutoTokenizer` y en la libreria `tokenizers` directamente.
- No requiere despliegue en servidores de inferencia; se usa como preprocesamiento en el mismo proceso que entrena o ejecuta el modelo.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Pre-tokenizacion | Bytes/token en SEC | Licencia |
|---|---|---|---|---|
| `edgar-bpe-131072-line` (este) | 131 072 | `line` (phrase merges) | 8,94 | MIT |
| GPT-4o (o200k) | 200 000 | BPE con pre-tokenizacion estandar | 4,81 (estimado: +86 % tokens) | no disponible |
| GPT-2 | 50 257 | BPE byte-level estandar | 4,59 (estimado: +95 % tokens) | MIT |
| Qwen3 | 151 936 | BPE con pre-tokenizacion estandar | 4,41 (estimado: +103 % tokens) | Apache 2.0 |

Nota: los valores de bytes/token para GPT-4o, GPT-2 y Qwen3 se calculan a partir de los porcentajes de tokens adicionales indicados en la model card (no son mediciones directas del autor). La comparativa se centra en la compresion para documentos SEC, no en capacidades de modelo completo.

## Limitaciones y advertencias

- El tokenizador esta entrenado exclusivamente en ingles y en documentos SEC; su compresion fuera de este dominio sera peor que la de un tokenizador generalista.
- La pre-tokenizacion no estandar (line-scoped phrase merges) puede producir tokens muy especificos del dominio, lo que limita la reutilizacion en otros contextos.
- La calidad del modelo downstream que use este tokenizador es una pregunta abierta; el autor cita el trabajo de SuperBPE (2025) como referencia. La compresion es la unica propiedad medida.
- El entrenamiento se realizo sobre una submuestra de 1 500 documentos (de los 4 356 totales) por limitaciones de memoria; el corpus completo no se uso en el entrenamiento.
- Un tokenizador esta vinculado al modelo con el que se entrena; no es un drop-in para modelos existentes. Solo es util para entrenar nuevos modelos o para investigacion de tokenizacion.
- Riesgo de alucinacion o sesgos no aplica directamente, pero el tokenizador hereda los sesgos del corpus SEC (por ejemplo, sobre-representacion de empresas grandes cotizadas en bolsa estadounidense).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/tcontorno/edgar-bpe-131072-line
- Repositorio del proyecto: https://github.com/tcontorno6/edgar-tok
- Write-up con metodologia y benchmarks: https://github.com/tcontorno6/edgar-tok/blob/main/docs/WRITEUP.md
- SEC EDGAR Full Text Search (fuente de datos): https://www.sec.gov/search-filings
