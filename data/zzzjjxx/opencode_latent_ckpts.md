# zzzjjxx/opencode_latent_ckpts

## Resumen

`opencode_latent_ckpts` es una coleccion de adaptadores LoRA de razonamiento latente construidos sobre el modelo base Qwen3-4B, publicada por el usuario zzzjjxx. El repositorio no contiene un modelo completo entrenado desde cero, sino un conjunto de checkpoints de adaptadores que implementan una tecnica de re-codificacion del chain-of-thought (CoT) mediante un vocabulario latente BPE sin perdida, donde cada token latente (`<lat_i>`) representa entre 1 y 6 tokens base del tokenizador original. El objetivo es comprimir el razonamiento intermedio para reducir el coste computacional de la decodificacion en tareas de generacion de codigo.

La propuesta tecnica se enmarca en el proyecto LatentReasoningNGram y parte de un LoRA de SFT de etapa 1 con CoT natural, sobre el que se entrena una segunda etapa que opera en el espacio latente. El repositorio incluye 27 variantes organizadas por factor de compresion (1.2x y 1.5x), tipo de datos de entrenamiento (con comentarios o sin ellos) y una regla de "nunca fusionar" (never-merge rule) que controla que categorias de tokens base pueden colapsarse en un token latente.

La relevancia actual del artefacto es experimental: explora si comprimir el CoT en tokens latentes preserva la capacidad de razonamiento en codigo medida con LiveCodeBench, y publica resultados comparativos entre variantes. No es un modelo listo para produccion, sino un banco de checkpoints de investigacion con licencia no declarada y sin model card de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptadores LoRA y vocabulario latente BPE |
| Parametros totales | 4B (modelo base Qwen3-4B); LoRA r16/a32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max-len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | adaptadores LoRA (safetensors presumiblemente) + tokenizer + `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros. Sobre el se aplican adaptadores LoRA con rango 16, alpha 32 y learning rate 2e-4, entrenados durante 3 epocas con longitud maxima de 8192 tokens y semilla 42. El entrenamiento es en dos etapas: primero un SFT de CoT natural (etapa 1) y despues un SFT sobre el CoT re-codificado con el vocabulario latente BPE (etapa 2, k=0). Cada carpeta del repositorio contiene el adaptador con las filas entrenadas de `embed` y `lm_head`, el tokenizer y un `vocab.json` que mapea cada unidad latente a sus IDs base.

La innovacion central es el vocabulario latente BPE construido bajo una regla de "nunca fusionar" (never-merge rule) que determina que tokens base pueden combinarse en un token latente de 1 a 6 tokens. Las variantes exploran distintas reglas: R0 (nada bloqueado, los digitos se fusionan), R1 (solo digitos), R2 nueva (digitos + letras sueltas + simbolos de operador), R3 (R2 + comillas y corchetes), R4 (R3 + identificadores del codigo gold del problema) y D (digitos + 70 palabras de decision). El factor de compresion es 1.2x o 1.5x, y los datos de entrenamiento son CoT con comentarios (`cot`) o sin comentarios (`cot_nc`).

## Capacidades

- Generacion de codigo en tareas tipo LiveCodeBench, con decodificacion en dos etapas (latente y luego codigo) y topes de 6192 tokens latentes y 2000 de codigo.
- Razonamiento latente comprimido: el CoT se emite en tokens `<lat_i>` que agrupan de 1 a 6 tokens base, reduciendo la longitud efectiva de la cadena de razonamiento.
- Entrenamiento especifico para problemas de programacion competitiva con CoT natural o sin comentarios.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingue.
- No se documenta un modo "thinking" explicito mas alla del razonamiento latente.

## Casos de uso

- Investigacion en compresion de chain-of-thought: comparar las 27 variantes (factores 1.2x y 1.5x, reglas R0-R4 y D, datos `cot` y `cot_nc`) para medir el impacto de la regla de fusion en la precision de LiveCodeBench.
- Evaluacion de razonamiento latente en codigo: usar los checkpoints con mejor `val_loss` (por ejemplo `nc_none` con 0.7229 o `none` con 0.7216 en 1.2x) como linea base para nuevas tecnicas de re-codificacion.
- Estudio de la relacion entre perdida de validacion y rendimiento downstream: los datos publicados permiten correlacionar `final val_loss` con LCB v5 y v6new en cada variante.
- Reproduccion de experimentos: el repositorio incluye tokenizer, `vocab.json` y rutas de datos (`data/sft_opencode_*`) que permiten reconstruir el pipeline de entrenamiento en dos etapas.
- Analisis de robustez en problemas nuevos: la separacion entre LCB v5 (880 problemas) y v6new (175 problemas anadidos en release_v6) permite estudiar generalizacion a problemas no vistos.
- Base para ablaciones sobre reglas de tokenizacion: las variantes `tok`, `token_paren`, `ident` y `digits_decision` permiten aislar el efecto de bloquear digitos, identificadores o palabras de decision.

## Benchmarks y rendimiento

Resultados de LiveCodeBench (pass@1, decodificacion en dos etapas, tope latente 6192, tope de codigo 2000, temperatura 0.2). Se muestran las variantes 1.2x; las 1.5x obtienen valores inferiores (LCB v5 entre 43.3 y 49.1).

| Variante (1.2x) | val_loss | LCB v5 | LCB v6new |
|---|---|---|---|
| `nc_ident` | 0.7534 | 55.5 | 31.4 |
| `nc_token_paren` | 0.7705 | 54.7 | 30.9 |
| `nc_none` | 0.7229 | 54.5 | 32.6 |
| `ident` | 0.7594 | 54.4 | 30.3 |
| `code` | 0.7723 | 54.3 | 32.0 |
| `nc_tok` | 0.7474 | 54.2 | 32.6 |
| `none` | 0.7216 | 53.9 | 28.6 |
| `digits_decision` | 0.7474 | 53.6 | 30.3 |
| `nc` | 0.7334 | 53.5 | 29.7 |
| `tok` | 0.7453 | 53.2 | 30.9 |
| `token_paren` | 0.7594 | 53.2 | 32.0 |
| `nc_code` | 0.7460 | 52.8 | 29.7 |
| `nc_digits_decision` | 0.7554 | 51.0 | 30.9 |

No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- El modelo base Qwen3-4B en precision completa requiere aproximadamente 8 GB de VRAM; en cuantizacion de 4 bits puede caber en GPUs consumer de 8 GB, aunque no se documentan cuantizaciones especificas para estos adaptadores.
- Los adaptadores LoRA son ligeros, pero deben fusionarse o cargarse junto al modelo base de 4B, por lo que el requisito real es el del modelo base.
- GPUs recomendadas: no disponible en la informacion proporcionada; por tamano, una RTX 4090 (24 GB) o A100/H100 permitirian inferencia comoda en fp16.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato de adaptador LoRA con filas de `embed`/`lm_head` y vocabulario latente propio sugiere que se requiere un pipeline de decodificacion en dos etapas especifico del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `opencode_latent_ckpts` (este) | 4B base + LoRA | 8192 | Razonamiento latente BPE sobre CoT | no disponible | Hugging Face, 0 descargas |
| Qwen3-4B (base) | 4B | no disponible en esta ficha | Transformer decoder-only | no disponible en esta ficha | Hugging Face |
| Alternativas de razonamiento latente | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de Qwen3-4B ni de otras alternativas en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados: es un artefacto de investigacion sin validacion externa.
- Los resultados de LiveCodeBench son pass@1 con una configuracion de decodificacion muy concreta (topes 6192/2000, temperatura 0.2); no son directamente comparables con evaluaciones estandar de otros modelos.
- El rendimiento cae de forma notable en los problemas nuevos de release_v6 (por ejemplo, de 55.5 a 31.4 en `nc_ident`), lo que sugiere limitada generalizacion.
- El factor 1.5x degrada el rendimiento frente a 1.2x en todas las variantes evaluadas (LCB v5 maximo 49.1 frente a 55.5).
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue.
- Requiere un pipeline de decodificacion en dos etapas y un vocabulario latente propio; no es plug-and-play con herramientas estandar de inferencia.
- El modelo base Qwen3-4B y sus limitaciones (contexto, sesgos) se heredan sin que se documenten mitigaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zzzjjxx/opencode_latent_ckpts
- Proyecto LatentReasoningNGram: no disponible como enlace directo en la informacion proporcionada
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
