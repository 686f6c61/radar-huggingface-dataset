# tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview

## Resumen

Moon-beam 8B A1B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Tablinum, construido a partir del modelo base Ling-3.0-tiny de inclusionAI y aumentado con una biblioteca de conocimiento recuperable denominada *engram*. El modelo totaliza aproximadamente 7.900 millones de parametros con alrededor de 1.000 millones activos por token, lo que lo situa en la categoria de modelos eficientes en inferencia con una ventana de contexto de 131.072 tokens. Esta ficha concreta corresponde a la cuantizacion MLX de 8 bits, pensada para ejecucion en Apple Silicon.

La propuesta diferencial del modelo no es solo su arquitectura, sino su integracion con un arnes de recuperacion (terrabeam) que inyecta pasajes de una biblioteca de conocimiento en el contexto de cada peticion. Segun la model card, esta combinacion dispara la precision en tareas factuales: en SimpleQA pasa de 30 a 601 respuestas correctas sobre 1.000, y en EngramBench de 61 a 436 sobre 503. Esto lo hace relevante para casos donde la exactitud factual importa mas que el conocimiento parametrico puro.

La version aqui descrita es una cuantizacion de 8 bits (8,3 GB) con una concordancia top-1 del 99,20% respecto a BF16 en chat, codigo y matematicas, y del 97,40% en WikiText. La licencia es MIT y el modelo esta orientado principalmente al ingles, con soporte declarado de tool calling, modo de razonamiento (thinking) y despliegue local en macOS mediante mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (bailing_hybrid), basada en Ling-3.0-tiny |
| Parametros totales | 7.893.355.648 (~7,9B) |
| Parametros activos | ~1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8 bits (esta version); tambien disponible MLX 4-bit, GGUF y BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), GGUF, BF16 |

## Arquitectura y entrenamiento

Moon-beam emplea una arquitectura de mezcla de expertos (MoE) heredada de Ling-3.0-tiny, con aproximadamente 8B parametros totales y cerca de 1B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. El entrenamiento de la ronda 1b se realizo con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. La innovacion central es el acoplamiento con la biblioteca *engram*: el modelo esta entrenado para responder a partir de pasajes recuperados que se inyectan en un formato concreto, y dispone de una herramienta `search_library` que le permite formular sus propias consultas de busqueda de forma iterativa.

La model card indica que la ronda 2 no supero a la ronda 1b en las pruebas de validacion retenidas, por lo que la publicacion corresponde a la ronda 1b. La cuantizacion MLX de 8 bits se convirtio con mlx-lm 0.32 y se probo en CPU (MLX). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset mas alla de las categorias mencionadas (pasajes recuperados, matematicas, tool calls, conversaciones).

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 131.072 tokens.
- Razonamiento matematico, con un 95,5% de acierto en 400 preguntas de GSM8K con thinking activado.
- Modo de razonamiento (thinking) que puede activarse o desactivarse.
- Tool calling y function calling, incluida la herramienta `search_library` para busqueda iterativa en la biblioteca.
- Razonamiento multi-paso apoyado en recuperacion de pasajes.
- Memoria a largo plazo de conversaciones anteriores (gestionada por el arnes terrabeam).
- Respuesta fundamentada en pasajes recuperados (grounded answering) en el formato de entrenamiento.
- Capacidades de agente para tareas de soporte (tau2-bench: airline, retail, telecom).
- Multilingue limitado: solo ingles declarado.

## Casos de uso

- Atencion al cliente automatizada: el modelo obtiene recompensas medias de 0,71 en airline, 0,80 en retail y 0,62 en telecom en tau2-bench, lo que lo hace adecuado para agentes de soporte multi-turno con acceso a una base de conocimiento via `search_library`.
- Asistente de documentacion interna: con terrabeam delante del servidor, cada peticion recibe pasajes de la biblioteca en el formato entrenado, permitiendo responder preguntas sobre tablas y documentos propios con alta precision (91,7% en tareas factuales con la configuracion 0.3).
- Resolucion de problemas matematicos: su 95,5% en GSM8K con thinking lo hace util para tutoria o verificacion de calculos paso a paso.
- Agente con busqueda iterativa: para preguntas de dos pasos, el modelo formula sus propias consultas a `search_library`, lo que eleva el acierto del 9,1% al 63,6% en la comparativa de arneses.
- Memoria conversacional: recuperacion de hechos personales contados en conversaciones previas (89,6% de acierto en tareas de memoria con terrabeam 0.3), util para asistentes persistentes.
- Despliegue local en Apple Silicon: con 8,3 GB en 8 bits y mlx-lm, cabe en Macs con memoria unificada de 16 GB o superior para prototipado y uso personal.
- Integracion en pipelines con API estilo OpenAI: `mlx_lm.server` expone un endpoint compatible que puede colocarse detras de terrabeam como proxy.

## Benchmarks y rendimiento

| Prueba | Resultado | Configuracion |
|---|---|---|
| GSM8K (400 preguntas) | 95,5% correctas | Thinking on, temp 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos |
| EngramBench (503) | 86,5% (436/503) | Thinking on, pasajes de la tabla de cada pregunta |
| tau2-bench airline | 0,71 recompensa media | Agente de soporte |
| tau2-bench retail | 0,80 recompensa media | Agente de soporte |
| tau2-bench telecom | 0,62 recompensa media | Agente de soporte |
| EngramBench (503) | 12,1% → 86,5% | Thinking on, cerrado → recuperado |
| SimpleQA (1000) | 3,0% → 60,1% | Thinking on, cerrado → recuperado |
| AA-Omniscience (200) | 10,5% → 28,0% | Thinking on, cerrado → recuperado |
| Concordancia top-1 vs BF16 | 99,20% | Chat, codigo y matematicas (8 bits) |
| Concordancia top-1 vs BF16 | 97,40% (KLD 0,0008 / 0,0038) | WikiText (8 bits) |

En tareas retenidas de biblioteca (154 tareas), la configuracion terrabeam 0.3 alcanzo un 83,4% de acierto frente al 53,2% de la configuracion 0.2, con desglose de 91,7% en hechos, 63,6% en preguntas de dos pasos y 89,6% en memoria.

## Requisitos de hardware

- VRAM/memoria estimada: 8,3 GB para la version MLX de 8 bits; 4,6 GB para la version MLX de 4 bits.
- Plataforma objetivo: Apple Silicon (MLX). No esta pensada para GPUs NVIDIA de forma nativa; para ello existen los formatos GGUF y BF16.
- Cabe en consumer hardware: si, en Macs con memoria unificada de 16 GB o mas para la version 8-bit.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.server` (API estilo OpenAI) en Apple Silicon; llama.cpp/Ollama mediante el formato GGUF; terrabeam como proxy delante del servidor para inyectar la biblioteca.
- Latencia y throughput: no se han publicado cifras concretas de latencia o tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Moon-beam 8B A1B (esta ficha) | ~7,9B totales, ~1B activos | 131.072 | MIT | MoE con recuperacion engram; solo ingles |
| Ling-3.0-tiny (base) | No disponible en la informacion | No disponible | No disponible | Modelo base sin el ajuste de Tablinum |
| Alternativas MoE de tamano similar | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion |

No se dispone en la informacion proporcionada de resultados de benchmarks de terceros que permitan una comparacion cuantitativa directa con otros modelos MoE de tamano similar.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Dependencia de recuperacion: el rendimiento factual elevado depende de servir el modelo con terrabeam y pasajes recuperados; sin ellos, el acierto en SimpleQA cae al 3,0% y en EngramBench al 12,1%.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas; la model card reporta un 12,0% de respuestas incorrectas en tareas de biblioteca incluso con el arnes optimizado.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base Ling-3.0-tiny y de las dependencias (terrabeam) por separado.
- Plataforma: la version MLX esta orientada a Apple Silicon; para otros entornos debe usarse GGUF o BF16.
- Ronda de publicacion: la ronda 2 no supero las pruebas de validacion, por lo que el modelo publicado es la ronda 1b; puede haber margen de mejora no materializado.
- Formato de prompt: el modelo esta entrenado para un formato concreto de inyeccion de pasajes; usarlo fuera de ese formato puede degradar el rendimiento.

## Enlaces

- [Modelo en Hugging Face (MLX 8-bit)](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview)
- [Modelo base BF16](https://huggingface.co/tablinum/Moon-Beam-8B-A1B)
- [Version MLX 4-bit](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX)
- [Version GGUF](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF)
- [Notas de modelo y evaluacion](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md)
- [Decision de la ronda 2](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt)
- [Repositorio terrabeam](https://github.com/chadstthomas-svg/terrabeam)
- [Release terrabeam 0.3.0](https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0)
