# Sqersters/MinVoid-1.1

## Resumen

MinVoid-1.1 es un modelo de lenguaje causal a nivel de byte desarrollado por Sqersters. Con tan solo 2.959.232 parametros, se entrena desde cero sin tokenizador: el texto de entrada se codifica directamente como bytes UTF-8, lo que elimina por completo la dependencia de un vocabulario predefinido y permite procesar cualquier secuencia de bytes sin tokens fuera de vocabulario. Esta es la segunda iteracion del proyecto, entrenada aproximadamente 3,2 veces mas tiempo que la version 1.0 (unos 800 millones de tokens frente a 250 millones).

El modelo emplea una arquitectura transformer decoder-only con dos innovaciones tecnicas destacables: Grouped Latent Attention (GLA, arXiv:2505.21487) y Exclusive Self-Attention (XSA, arXiv:2603.09078). La atencion latente agrupada reduce el coste de la cache KV almacenando representaciones latentes en lugar de claves y valores completos, mientras que XSA resta la proyeccion de la salida de atencion sobre el vector de valor propio para mitigar el sesgo de auto-atención.

Su relevancia es fundamentalmente experimental y educativa: demuestra que un modelo de menos de 3 millones de parametros puede entrenarse con tecnicas de atencion modernas sobre datos diversos y producir texto coherente a nivel de byte, con una ventana de contexto de 512 tokens y licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GLA (Grouped Latent Attention) y XSA (Exclusive Self-Attention) |
| Parametros totales | 2.959.232 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (entrenado principalmente con texto en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `modeling_minvoid.py` para carga via `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con `d_model=128`, 4 cabezas de consulta (`d_head=32`) y 2 cabezas latentes para GLA (`d_latent=64`). La cache KV almacena latentes (128 valores por token y capa), lo que reduce el coste de memoria en inferencia autoregresiva. La FFN usa SwiGLU con dimension oculta de 1120 (aproximadamente 8,8 veces `d_model`). Emplea pre-RMSNorm, RoPE con theta 10000 y embeddings de entrada/salida atados (*tied*).

El entrenamiento se realizo sobre aproximadamente 4,2 GB de texto mixto en ingles: novelas ligeras, TinyStories, wikitext-103, OASST1, datos de instruccion alpaca/dolly, corpus de conversacion cotidiana, problemas matematicos estilo GSM8K, MathInstruct, OpenMathReasoning-CoT y corpus de diccionarios y citas. Se excluyeron las particiones de evaluacion de benchmarks. Se uso un batch de 128 y un schedule de learning rate coseno durante aproximadamente 800 millones de tokens. No se menciona RLHF ni DPO en la informacion disponible.

La innovacion principal es XSA: la salida de atencion se corrige restando su proyeccion sobre el vector de valor propio, lo que reduce la componente de auto-atención redundante. GLA, por su parte, agrupa las cabezas KV en representaciones latentes de menor dimension, disminuyendo el uso de memoria de la cache sin sacrificar expresividad.

## Capacidades

- Generacion de texto causal a nivel de byte: codifica y decodifica directamente UTF-8, sin tokenizador.
- Manejo nativo de cualquier secuencia de bytes, incluyendo caracteres Unicode, emojis y texto multilingue (aunque el entrenamiento sea predominantemente en ingles).
- Generacion de texto coherente en dominios como narrativa breve, texto enciclopedico y conversacion basica.
- Razonamiento aritmetico basico y resolucion de problemas matematicos sencillos (entrenado con datos estilo GSM8K y MathInstruct).
- Seguimiento de instrucciones a nivel basico (entrenado con datos alpaca/dolly y OASST1).
- No se menciona soporte de tool calling, function calling, agentes ni multi-step reasoning en la informacion disponible.
- No se menciona modo thinking, vision ni audio.
- Existe una variante de chat puntuada por juez publicada por separado como `Sqersters/MinVoid-1.1-Chat`.

## Casos de uso

- Experimentacion educativa en arquitecturas de atencion: el modelo sirve como banco de pruebas de GLA y XSA en un entorno de menos de 3 millones de parametros, ideal para investigadores que quieran estudiar el efecto de estas tecnicas sin infraestructura costosa.
- Generacion de texto creativo breve: con 512 tokens de contexto y entrenamiento en novelas ligeras y TinyStories, puede producir microrelatos y continuaciones narrativas coherentes en ingles.
- Prototipado de pipelines byte-level: util para validar sistemas que necesiten procesar texto sin tokenizador, como preprocesamiento de datos crudos o entornos con vocabularios muy restringidos.
- Investigacion sobre modelos de lenguaje ultrapequenos: sirve como linea base para estudiar leyes de escala, eficiencia de parametros y calidad de generacion en regimenes de muy bajos recursos.
- Generacion de texto en dispositivos embebidos o microcontroladores: con menos de 3 millones de parametros y pesos en safetensors, el modelo puede ejecutarse en CPU y en hardware con memoria muy limitada.
- Evaluacion de tecnicas de cuantizacion extrema: al ser un modelo diminuto, permite medir el impacto de cuantizaciones agresivas (4 bits, 2 bits) en la calidad de generacion sin grandes costes de computo.
- Fine-tuning ligero para dominios especificos: su tamano reducido permite ajustarlo en una sola GPU consumer con datasets pequenos para tareas de clasificacion o generacion acotada.

## Benchmarks y rendimiento

Resultados 0-shot segun el protocolo de Open SLM Leaderboard, evaluados con `lm-evaluation-harness` y el protocolo oficial de ArithMark-3:

| Benchmark | Puntuacion |
|---|---|
| HellaSwag (acc_norm) | 27,03 |
| ARC-Easy (acc_norm) | 26,60 |
| ARC-Challenge (acc_norm) | 24,40 |
| Combined ARC | 25,50 |
| PIQA (acc_norm) | 52,56 |
| ArithMark-3 (acc_norm) | 35,30 |
| Int Index | 4,77 |

El Int Index se calcula como `(HellaSwag + ARC + PIQA + 0,65*ArithMark-3)/3,65`, con normalizacion `N(score, chance) = 100*(score-chance)/(100-chance)` y valores de azar de 25/25/50/25. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 12 MB en precision completa (2,96M parametros en fp32), menos de 6 MB en fp16 y aproximadamente 1,5 MB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; no requiere GPU dedicada.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_minvoid.py`), o el script incluido `run.py`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles, pero dado el tamano, la generacion deberia ser de milisegundos por token en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la misma categoria (modelos byte-level de menos de 5 millones de parametros) en la informacion proporcionada. La model card incluye graficos comparativos contra el Open SLM Leaderboard, pero no se detallan los modelos concretos ni sus puntuaciones numericas en el texto disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MinVoid-1.1 | 2,96M | 512 | Apache-2.0 | safetensors |
| Alternativas byte-level de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Tamano muy reducido: con 2,96 millones de parametros, la calidad de generacion es limitada y el modelo producira texto incoherente o repetitivo en tareas complejas.
- Ventana de contexto de solo 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenamiento predominantemente en ingles: el rendimiento en castellano y otros idiomas sera muy inferior, aunque el tokenizador byte-level permita procesar cualquier idioma.
- Riesgo elevado de alucinacion y de generar contenido facticamente incorrecto, especialmente en tareas de conocimiento.
- Sesgos potenciales heredados de los datos de entrenamiento (novelas ligeras, wikitext, OASST1, alpaca/dolly), no evaluados ni documentados en la model card.
- No se han publicado evaluaciones de seguridad, toxicidad ni sesgo.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar codigo del autor; conviene revisar `modeling_minvoid.py` antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de garantias y la calidad limitada desaconsejan su uso en produccion sin fine-tuning especifico.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Sqersters/MinVoid-1.1
- Variante chat: https://huggingface.co/Sqersters/MinVoid-1.1-Chat
- Paper GLA (Grouped Latent Attention): https://arxiv.org/abs/2505.21487
- Paper XSA (Exclusive Self-Attention): https://arxiv.org/abs/2603.09078
- Repositorio de evaluacion lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
