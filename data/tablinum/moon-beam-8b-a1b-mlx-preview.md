# tablinum/Moon-Beam-8B-A1B-MLX-Preview

## Resumen

Moon-Beam-8B-A1B-MLX-Preview es una cuantizacion en formato MLX del modelo Moon-Beam-8B-A1B-Preview, desarrollado por el usuario tablinum. Se trata de un modelo de mezcla de expertos (MoE) de 8.000 millones de parametros totales con aproximadamente 1.000 millones de parametros activos por token, construido a partir de Ling-3.0-tiny de inclusionAI y complementado con una biblioteca de conocimiento recuperable denominada *engram*. La version MLX esta pensada para ejecutarse en Apple Silicon mediante la libreria mlx-lm.

El modelo resuelve el problema de la generacion de respuestas factuales mediante recuperacion: en lugar de depender unicamente del conocimiento parametrico, esta entrenado para responder a partir de pasajes recuperados que se insertan en el prompt con un formato concreto. Segun la model card, la recuperacion eleva el rendimiento en SimpleQA de 28 a 593 respuestas correctas sobre 1.000, y en EngramBench de 65 a 431 sobre 503.

Esta publicacion es una version *preview* (release candidate, ronda 1b) y requiere la libreria Tablinum-2 para funcionar. La cuantizacion "beam" emplea expertos en 4 bits con atencion y pesos compartidos en 8 bits, ocupando 4,6 GB. El modelo esta etiquetado como preview y su tarjeta indica que sera actualizado cuando este disponible la libreria Tablinum-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Ling-3.0-tiny, con integracion de biblioteca de conocimiento recuperable (engram) |
| Parametros totales | 7.893.392.800 (aproximadamente 8B) |
| Parametros activos | Aproximadamente 1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MLX beam (expertos 4 bits, atencion y pesos compartidos 8 bits); tambien disponibles MLX 8-bit, GGUF (Q4_K_M, Q6_K, Q8_0) y BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); GGUF disponible en otro repositorio |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos derivada de Ling-3.0-tiny, con 8B parametros totales y aproximadamente 1B activos por token. La innovacion principal es la incorporacion de una biblioteca de conocimiento denominada *engram*, que actua como memoria recuperable: el modelo esta entrenado para responder a partir de pasajes recuperados que se insertan en el prompt en un formato especifico. La ronda 1b se ajusto con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno.

La cuantizacion MLX "beam" combina expertos en 4 bits con atencion y pesos compartidos en 8 bits, generando un archivo de 4,6 GB. Segun la model card, la concordancia top-1 con BF16 es del 96,75% en tokens mixtos de chat, codigo y matematicas, y del 90,92% en WikiText (KLD 0,0115 / 0,0444). La conversion se realizo con mlx-lm 0.32. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico: puntuacion del 96,2% en GSM8K (400 preguntas) con modo thinking activado.
- Modo thinking (razonamiento explicito) activable y desactivable.
- Tool calling / function calling, segun las etiquetas y los datos de entrenamiento (llamadas a herramientas).
- Razonamiento multi-turno: 94,0% de acierto en primeras preguntas y 93,3% en segundas preguntas de 150 pares con thinking activado.
- Respuesta aumentada por recuperacion: entrenado para responder a partir de pasajes recuperados insertados en el prompt.
- Capacidades de conocimiento factual mediadas por recuperacion (SimpleQA, EngramBench, AA-Omniscience).
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 131.072 tokens, manteniendo coherencia entre turnos (93,3% de acierto en segundas preguntas en las pruebas del autor).
- Generacion de codigo y asistencia en programacion: admite tool calling y muestra alta concordancia de cuantizacion en tokens de codigo (96,75% top-1 frente a BF16), lo que permite integrarlo en pipelines de desarrollo.
- Resolucion de problemas matematicos: con un 96,2% en GSM8K en modo thinking, es adecuado para tutoria o verificacion de calculos paso a paso.
- Sistemas de preguntas y respuestas con recuperacion (RAG): disenado especificamente para responder a partir de pasajes recuperados; con terrabeam como proxy se inyectan pasajes en el formato de entrenamiento, elevando SimpleQA de 28 a 593 aciertos sobre 1.000.
- Despliegue local en Apple Silicon: la cuantizacion MLX de 4,6 GB permite ejecutar el modelo en equipos Mac con memoria unificada, sirviendo una API compatible con OpenAI mediante mlx_lm.server.
- Asistentes con memoria a largo plazo: la integracion con terrabeam en modo `--memory long-term` permite mantener contexto recuperado entre peticiones, util para asistentes personales o bases de conocimiento internas.
- Evaluacion e investigacion de arquitecturas MoE con recuperacion: util para estudiar el impacto de la recuperacion en la precision factual frente al conocimiento parametrico.

## Benchmarks y rendimiento

Resultados preliminares publicados en la model card (fecha 4 de noviembre; protocolo de muestreo: temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Test (tamano de muestra) | Thinking on | Thinking off |
|---|---:|---:|
| GSM8K (400) | 96,2% | 92,5% |
| Multi-turno, primera pregunta (150) | 94,0% | 86,7% |
| Multi-turno, segunda pregunta (150) | 93,3% | 88,7% |
| MMLU-Pro (700) | 63,9% | 44,0% |

Impacto de la recuperacion (thinking on, cerrado → con recuperacion):

| Test (preguntas) | Thinking on | Thinking off |
|---|---:|---:|
| EngramBench (503) | 12,9% → 85,7% | 10,1% → 87,5% |
| SimpleQA (1000) | 2,8% → 59,3% | 2,6% → 57,5% |
| AA-Omniscience (200) | 10,0% → 26,5% | 5,0% → 26,5% |

Fidelidad de cuantizacion frente a BF16:

| Build | Tamano de archivo | Concordancia top-1 mixta | Concordancia top-1 WikiText |
|---|---:|---:|---:|
| Q4_K_M | 4,94 GB | 97,65% | 92,74% |
| Q6_K | 7,23 GB | 98,92% | 96,74% |
| Q8_0 | 8,41 GB | 99,18% | 97,20% |
| MLX beam | 4,92 GB | 96,75% | 90,92% |
| MLX 8-bit | 8,87 GB | 99,20% | 97,40% |

Nota: el modelo base Ling sin entrenamiento adicional alcanzo 59,2% en SimpleQA con los mismos pasajes y thinking on, frente al 59,3% de la ronda 1b, lo que sugiere que la mejora principal proviene de la recuperacion. Las cifras marcadas como preliminares estan siendo re-medidas con el protocolo de la model card. No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM/memoria estimada: la cuantizacion MLX beam ocupa 4,6 GB (archivo de 4,92 GB); la version MLX 8-bit ocupa 8,87 GB; BF16 requiere aproximadamente el doble del tamano de parametros (unos 16 GB).
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (memoria unificada). Para otros entornos, las versiones GGUF (Q4_K_M de 4,94 GB) permiten ejecucion en GPU consumer y CPU.
- Cabe en GPU consumer: si, en tarjetas con al menos 6-8 GB de VRAM para la cuantizacion de 4 bits (por ejemplo, RTX 3060, RTX 4060, RTX 4090), y en equipos Mac con memoria unificada suficiente.
- Opciones de despliegue: mlx-lm (generate y server con API compatible con OpenAI), llama.cpp/Ollama para GGUF, y terrabeam como proxy de recuperacion delante del servidor. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que la version MLX fue probada en CPU (MLX).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Moon-Beam-8B-A1B (MLX Preview) | ~8B | ~1B | 131.072 | MIT | MLX, GGUF, BF16 | MoE con recuperacion; GSM8K 96,2% (thinking on) |
| Ling-3.0-tiny (base) | no disponible | no disponible | no disponible | no disponible | no disponible | Base del modelo; 59,2% en SimpleQA con recuperacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de terceros en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion facilitada; la unica referencia interna es el modelo base Ling-3.0-tiny.

## Limitaciones y advertencias

- Version preview: los pesos corresponden a un release candidate (ronda 1b) y la model card indica que seran actualizados cuando este lista la libreria Tablinum-3; el sufijo `-Preview` se eliminara entonces.
- Dependencia de recuperacion: el modelo esta entrenado para responder a partir de pasajes recuperados; sin ellos, el rendimiento factual cae drasticamente (SimpleQA del 59,3% al 2,8%). Requiere terrabeam u otro mecanismo que inyecte pasajes en el formato exacto de entrenamiento.
- Solo ingles: el unico idioma declarado es `en`; no hay soporte multilingue documentado.
- Riesgo de alucinacion: aunque la recuperacion reduce errores factuales, el modelo sigue siendo un LLM generativo; las cifras de SimpleQA (59,3%) y AA-Omniscience (26,5%) muestran que una parte sustancial de las respuestas factuales sigue siendo incorrecta.
- Evaluacion parcial: varias cifras estan marcadas como preliminares y en MMLU-Pro 70 de 700 respuestas con thinking on alcanzaron el limite de 30.000 tokens de salida, lo que puede afectar a la fiabilidad de esa metrica.
- Licencia MIT: permite uso comercial, pero la model card no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre la biblioteca engram.
- Hardware: el formato MLX esta orientado a Apple Silicon; en otros entornos debe usarse la version GGUF o BF16.
- Baja traccion en el repositorio (0 descargas, 0 likes en el momento de la consulta), lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (MLX Preview): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview
- Modelo base BF16: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Version MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview
- Version GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Notas de modelo y evaluacion (stats): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Resultados preliminares de benchmarks (JSON): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/benchmarks_preliminary_1104.json
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
