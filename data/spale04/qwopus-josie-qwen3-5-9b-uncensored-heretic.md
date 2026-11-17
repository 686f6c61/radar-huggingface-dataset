# spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic es un modelo multimodal (texto e imagen) de aproximadamente 9.650 millones de parametros, publicado por spale04. Se construye fusionando dos fine-tunes del modelo base Qwen/Qwen3.5-9B mediante la tecnica DELLA: Qwopus3.5-9B-v3 (orientado a razonamiento, con un peso del 70 %) y JOSIE-2-9B-OSS (30 %). Posteriormente se le aplica una ablacion de rechazos con la herramienta Heretic 2.1.0 (Arbitrary-Rank Ablation) para eliminar el comportamiento de negativa a responder.

El modelo resuelve dos problemas concretos: por un lado, combina las capacidades de razonamiento de uno de los fine-tunes con los conocimientos del otro, y segun la model card mejora el rendimiento en MMLU-Pro respecto al Qwen3.5-9B original (73,8 frente a 59,5); por otro, reduce drasticamente las negativas (de 99/100 a 9/100 en la medicion de la model card) manteniendo un uso mas eficiente de tokens en el razonamiento (alrededor de un 29 % menos por respuesta).

Es relevante para desarrolladores e investigadores que necesiten un modelo de 9B con vision, modo thinking, soporte para llama.cpp y LM Studio, y pesos completos en bf16 mas GGUF en el mismo repositorio. La licencia es Apache 2.0. El modelo no esta alineado en seguridad y el autor advierte explicitamente de que hay que anadir barreras de proteccion propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivado de Qwen3.5-9B; fusion por DELLA de dos fine-tunes |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (configuracion de ejemplo en llama-server con `-c 32768`); contexto nativo del base no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (texto) y mmproj F16 (encoder de imagen); el autor menciona carga en 4-bit NF4 para las pruebas de Heretic; pesos completos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0 + mmproj F16) |

## Arquitectura y entrenamiento

El modelo es una fusion (merge) de dos fine-tunes del mismo base, Qwen/Qwen3.5-9B, combinados con la tecnica DELLA en una proporcion aproximada de 70 % Qwopus3.5-9B-v3 y 30 % JOSIE-2-9B-OSS. La arquitectura subyacente es la del Qwen3.5-9B, un transformer multimodal que acepta texto e imagen (pipeline `image-text-to-text`) y dispone de modo thinking. No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset de los fine-tunes originales.

Sobre la fusion se aplica una ablacion de rechazos con Heretic 2.1.0 (Arbitrary-Rank Ablation), que elimina direcciones de activacion asociadas a negativas. El autor selecciono el trial 98 de 100 tras evaluar dos candidatos con el benchmark completo; el trial 57 (3/100 negativas, KL 0,024) se descarto porque degradaba el razonamiento largo (HumanEval 90,0, MMLU-Pro 71,4). El resultado final reporta 6/100 negativas con una divergencia KL de 0,0126 respecto a la fusion previa. Todo el proceso se realizo en una unica RTX 3060 de 12 GB.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (cadena de pensamiento explicita).
- Entrada de imagenes (image-text-to-text) mediante el encoder `mmproj` en formato GGUF F16.
- Generacion de codigo (HumanEval pass@1 de 95,0 segun la model card).
- Razonamiento matematico (GSM8K de 95,0).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking sugiere razonamiento multi-paso, pero no se documenta soporte de agentes.
- Uso sin filtros de rechazo (modelo "uncensored"/abliterated), con 9/100 negativas reportadas en la model card.
- Compatible con transformers, llama.cpp, LM Studio y vLLM (pesos completos bf16).

## Casos de uso

- Razonamiento tecnico asistido: el modelo emplea modo thinking y reduce el consumo de tokens por respuesta (alrededor de un 29 % menos que el original), lo que lo hace adecuado para tareas de analisis donde el coste por token importa.
- Generacion de codigo en local: con HumanEval de 95,0 y pesos GGUF Q8_0, puede desplegarse en una estacion de trabajo con GPU consumer para autocompletado, generacion de tests o revision de codigo.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text con el encoder `mmproj`, sirve para extraer informacion de capturas, diagramas o formularios escaneados.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated con metricas de negativas y KL documentadas, es un caso de estudio util para medir el impacto de la ablacion en capacidades.
- Prototipado de asistentes conversacionales sin restricciones de contenido: util en entornos de investigacion donde se requiere estudiar respuestas del modelo sin filtros, con barreras de proteccion propias anadidas.
- Despliegue en hardware limitado: con Q8_0 y contexto de 32K ocupa unos 11,6 GB en una RTX 3060 de 12 GB, lo que permite inferencia local en equipos de consumo.
- Evaluacion comparativa de merges: al incluir pesos completos bf16, permite reproducir merges adicionales o comparar el efecto de DELLA y Heretic sobre el base.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos se ejecutaron como GGUF Q8_0 en llama-server (b12422), con thinking activado, temperatura 1,0, top-p 0,95, top-k 20 y presence penalty 1,5 (temperatura 0,6 y sin penalizacion para codigo), maximo 12.000 tokens por respuesta. Una respuesta sin terminar cuenta como incorrecta. El valor ± es un error estandar.

| Benchmark | Preguntas | Qwen3.5-9B original | Fusion antes de Heretic | Este modelo |
|---|---|---|---|---|
| GSM8K | 60 | 96,7 ± 2,3 | 96,7 ± 2,3 | 95,0 ± 2,8 |
| MMLU-Pro | 84 (6 por categoria) | 59,5 ± 5,4 | 77,4 ± 4,6 | 73,8 ± 4,8 |
| HumanEval pass@1 | 60 | 98,3 ± 1,7 | 95,0 ± 2,8 | 95,0 ± 2,8 |
| IFEval (prompt-level strict) | 60 | 88,3 ± 4,1 | 85,0 ± 4,6 | 81,7 ± 5,0 |
| Media | | 85,7 | 88,5 | 86,4 |

Negativas: el modelo original rechazaba 99/100 prompts; este modelo rechaza 9/100 (segun la model card; la tabla de ablacion reporta 6/100 en la medicion de Heretic con 100 prompts daninos y 100 inofensivos). La ablacion se midio con el modelo cargado en 4-bit NF4.

Rendimiento de inferencia reportado: 36 tok/s en Q8_0 sobre una RTX 3060.

## Requisitos de hardware

- VRAM estimada: unos 11,6 GB con contexto de 32K y encoder de imagen en Q8_0 (RTX 3060 de 12 GB). Los pesos bf16 completos (19,3 GB) requieren al menos 24 GB de VRAM para inferencia comoda.
- GPU recomendadas: RTX 3060 12 GB (probado por el autor), RTX 4090, A100, H100 para bf16; cualquier GPU con 12 GB o mas para Q8_0.
- Cabe en GPU consumer: si, en RTX 3060 12 GB o superiores con Q8_0; con cuantizaciones menores (no incluidas en el repo) cabria en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, transformers, vLLM (con pesos bf16).
- Latencia y throughput: 36 tok/s en Q8_0 sobre RTX 3060 segun el autor. Se puede ampliar margen con `-ctk q8_0 -ctv q8_0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic | 9,65 B | 32K (config. ejemplo) | 73,8 | 95,0 | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen/Qwen3.5-9B (original) | 9 B (aprox.) | no disponible | 59,5 | 98,3 | no disponible en la informacion | HF |
| Qwopus3.5-9B-v3 | 9 B (aprox.) | no disponible | no disponible | no disponible | no disponible en la informacion | HF |
| JOSIE-2-9B-OSS | 9 B (aprox.) | no disponible | no disponible | no disponible | no disponible en la informacion | HF |

Los datos de Qwen3.5-9B original proceden de la model card de este modelo. Para Qwopus3.5-9B-v3 y JOSIE-2-9B-OSS no se han publicado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- El modelo ha sido sometido a ablacion de rechazos y no esta alineado en seguridad; el autor recomienda anadir barreras de proteccion propias en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es inherente a los modelos de 9B.
- Puntos debiles reconocidos por el autor: seguimiento de instrucciones (IFEval 81,7, por debajo del original 88,3) y escritura.
- El merge y la ablacion pueden degradar capacidades no medidas en los benchmarks publicados (el autor documenta que el trial 57 afectaba al razonamiento largo pese a tener mejor KL).
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Contexto maximo nativo no documentado; el valor de 32K corresponde a la configuracion de ejemplo, no a una especificacion oficial.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede infringir normativas o politicas de plataforma; la responsabilidad recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.
- El rendimiento medido se obtuvo con configuraciones concretas de sampling; variaciones en temperatura o penalizaciones pueden alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base 1: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3
- Modelo base 2: https://huggingface.co/Goekdeniz-Guelmez/JOSIE-2-9B-OSS
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Web del autor: https://spaleai.com
- X del autor: https://x.com/spaleon_x
- GitHub del autor: https://github.com/spixyy7
- Discord del autor: https://discord.gg/udthV8ynMu
