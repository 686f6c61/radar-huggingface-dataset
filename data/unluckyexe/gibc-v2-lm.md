# Unluckyexe/gibc-v2-lm

## Resumen

gibc-v2-lm es un modelo de lenguaje base de 49.822.228 parametros (33.045.012 no pertenecientes al embedding) desarrollado por el usuario Unluckyexe para la Global Innovation Build Challenge V2 (GIBC V2), una hackathon internacional centrada en el desarrollo de LLM fundacionales con un limite de 50 millones de parametros entrenables. El modelo fue entrenado desde cero (inicializacion aleatoria, tokenizador propio, sin destilacion ni pesos preentrenados) sobre 20.000 millones de tokens de texto en ingles con licencias abiertas, empleando unicamente 8,58 horas de GPU H100.

Se trata de un modelo base puro: continua texto y no dispone de ajuste por instrucciones ni de formato de chat. Su arquitectura es un transformer decoder-only de 14 capas con normalizacion pre-norm RMSNorm, atencion con 8 cabezas de consulta y 4 de clave/valor (GQA), RoPE y QK-norm. Incorpora varias innovaciones de investigacion reciente como conexiones residuales en U-net, value residual de ResFormer y logit softcap.

Su relevancia radica en ser una demostracion reproducible de entrenamiento fundacional a muy baja escala computacional, con codigo, logs, ablaciones y JSON de evaluacion publicos, lo que lo convierte en un caso de estudio util para quienes investigan recetas de entrenamiento eficientes o quieren comprender el comportamiento de un modelo sub-100M entrenado con mezclas de datos curadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, pre-norm RMSNorm, RoPE, QK-norm, conexiones U-net y value residual de ResFormer |
| Parametros totales | 49.822.228 (embedding y cabeza compartidos contados una vez) |
| Parametros activos | No aplica (no es MoE) |
| Parametros no de embedding | 33.045.012 |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos distribuidos en fp32; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) y checkpoint PyTorch (final.pt) |
| Capas | 14 |
| Dimension del modelo (d_model) | 512 |
| Dimension del MLP | 1.536 con activacion ReLU² |
| Cabezas de atencion | 8 query / 4 KV (GQA), head dim 64 |
| Embedding | 32.768 x 512, atado a la cabeza de salida |
| Tokenizador | BPE byte-level propio de 32.768 entradas |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 14 capas con d_model 512 y MLP de dimension 1.536 que usa ReLU al cuadrado como activacion. La atencion emplea 8 cabezas de consulta y 4 de clave/valor (GQA) con dimension de cabeza 64, RoPE con base 10.000 y normalizacion QK. Sobre esa base estandar se anaden tres elementos menos comunes: conexiones residuales en U-net que enlazan la capa i con la capa 13 - i, value residual estilo ResFormer y un logit softcap de 15. La normalizacion es pre-norm RMSNorm y no hay sesgos en ninguna capa. El embedding de entrada (32.768 x 512) esta atado a la cabeza de salida.

El entrenamiento se realizo desde cero sobre 20.000 millones de tokens (38.146 pasos de 524.288 tokens), con un tokenizador BPE entrenado por el propio autor sobre una muestra de 3 GB de la mezcla de datos. Se uso Muon (lr 0,02, wd 0,01) para las matrices por bloques y AdamW (lr 3e-3) para embeddings, normas y escalares, con un esquema warmup-stable-decay (1 % de warmup y decaimiento lineal a cero en el ultimo 35 %). La mezcla principal (13.000 millones de tokens) fue 60 % FineWeb-Edu, 30 % DCLM-baseline, 5 % FineMath y 5 % FinePDFs; la fase de decaimiento (7.000 millones) uso 60 % FineWeb-Edu con int_score >= 4, 22,5 % FineMath, 7,5 % FineWeb-Edu, 5 % DCLM y 5 % Wikipedia en ingles. El coste total fue de 8,58 horas de una H100 de 80 GB, mas 5,23 horas adicionales de un barrido de ablacion de 12 brazos y 1.000 millones de tokens para elegir la receta. Se aplico descontaminacion eliminando todo documento con un 13-grama compartido con WikiText-103 (validacion o test) y 16 articulos de Wikipedia coincidentes por titulo.

## Capacidades

- Generacion de texto autocompletivo en ingles: el modelo continua secuencias dado un prefijo, propio de un modelo base sin ajuste de instrucciones.
- Modelado causal de lenguaje y calculo de perplexidad utilizable para evaluacion o filtrado de corpus.
- Razonamiento aritmetico basico limitado: obtiene 40,20 en ArithMark-3.0 y 36,80 en ArithMark-2.0, lo que indica cierta capacidad de operaciones sencillas pero muy por debajo de modelos instruidos.
- Comprension lectora y sentido comun de nivel basico: resultados por encima del azar en PIQA (60,28) y ARC-Easy (47,85), aun con margen de mejora.
- Capacidad multilingue: solo ingles.
- Tool calling / function calling: no soportado (modelo base sin formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no soportado de forma nativa.
- Modo thinking, vision o audio: no disponible.
- Sin cache KV: el autor indica que `generate()` no esta conectado y que la decodificacion debe hacerse con un bucle manual que recalcula los logits en cada paso.

## Casos de uso

- Investigacion en recetas de entrenamiento a baja escala: el repositorio publica logs, ablaciones y JSON de evaluacion, por lo que sirve como referencia reproducible para estudiar el efecto de Muon, U-net residual o value residual en modelos sub-100M.
- Filtrado y puntuacion de corpus: dado que es un modelo base en ingles, puede usarse para calcular perplexidad sobre documentos y descartar texto de baja calidad antes de entrenar modelos mayores.
- Generacion de texto autocompletivo sin fines de produccion: util para prototipos que requieran continuar frases o generar plantillas cortas dentro del limite de 1.024 tokens.
- Ensenanza de arquitecturas transformer: su codigo autocontenido (`modeling_gibc.py` y `configuration_gibc.py`) y su tamano reducido permiten ejecutarlo en CPU y estudiar el flujo interno paso a paso.
- Experimentos de destilacion y ajuste fino: sirve como modelo estudiante o como punto de partida para tecnicas de SFT/DPO a escala muy pequena, dado que los pesos estan en fp32 y bajo licencia permisiva.
- Pruebas de infraestructura de evaluacion: integrable con lm-evaluation-harness 0.4.13 para verificar pipelines de evaluacion con `add_bos_token=True` y autocast bf16.
- Demostraciones educativas en notebooks: cabe en memoria de cualquier portatil y no requiere GPU dedicada, lo que facilita talleres y clases practicas.

## Benchmarks y rendimiento

Resultados declarados por el autor, zero-shot, con conjuntos completos, en porcentaje con error estandar.

| Benchmark | Metrica | Resultado |
|---|---|---|
| HellaSwag | acc_norm (0-shot) | 31,87 ± 0,47 |
| ARC-Easy | acc_norm (0-shot) | 47,85 ± 1,03 |
| ARC-Easy | acc | 55,18 ± 1,02 |
| ARC-Challenge | acc_norm (0-shot) | 26,11 ± 1,28 |
| ARC-Challenge | acc | 22,10 ± 1,21 |
| PIQA | acc_norm (0-shot) | 60,28 ± 1,14 |
| PIQA | acc | 61,92 ± 1,13 |
| WinoGrande | acc | 51,62 ± 1,40 |
| ArithMark-3.0 | acc_norm / acc | 40,20 ± 1,55 / 40,20 |
| ArithMark-2.0 | acc | 36,80 ± 0,96 |
| WikiText-103 test | word perplexity | 39,42 |

Evaluacion realizada con lm-evaluation-harness 0.4.13, `add_bos_token=True` y autocast bf16. El autor indica que una ejecucion en fp32 con `lm_eval --model hf` reproduce los mismos numeros con una diferencia inferior a 0,25 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 200 MB en fp32 y 100 MB en bf16, mas el coste de activaciones, que es minimo por el tamano reducido del modelo.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; el entrenamiento se realizo en una unica NVIDIA H100 80GB, pero la inferencia funciona en hardware muy inferior.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con mas de 1 GB de memoria, e incluso en iGPU o en CPU con `torch` en modo fp32.
- Opciones de despliegue: solo `transformers` con `trust_remote_code=True`, ya que el modelo requiere `modeling_gibc.py` y `configuration_gibc.py`. No hay soporte GGUF, por lo que no es compatible con llama.cpp ni Ollama; tampoco es compatible con vLLM o TGI de forma directa al no exponer `generate()` ni disponer de cache KV.
- Latencia y throughput estimados: no disponibles. El autor senala que la decodificacion debe hacerse con un bucle manual autoregresivo que recalcula los logits en cada paso, lo que implica un coste cuadratico por token generado y hace poco practica la generacion de secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| gibc-v2-lm | 49,8 M | 1.024 tokens | Apache 2.0 | Ingles | HuggingFace + codigo en GitHub |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Ingles | HuggingFace, ampliamente soportado |
| Pythia-70M | 70 M | 2.048 tokens | Apache 2.0 | Ingles | HuggingFace |
| GIBC-43M | ~43 M | No disponible | No disponible | No disponible | HuggingFace/GitHub (proyecto GIBC V2) |

No se dispone de resultados de benchmarks comparables publicados para GPT-2 small, Pythia-70M o GIBC-43M en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento relativo. Los modelos comparables pertenecen a la misma categoria de tamano (sub-150M) pero emplean tokenizadores, recetas y volumenes de datos distintos, lo que dificulta la comparacion directa.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni chat: no sigue ordenes, no mantiene formatos conversacionales y no debe usarse como asistente sin ajuste previo.
- Riesgo elevado de alucinacion y de texto incoherente fuera de distribucion, agravado por el reducido numero de parametros y el contexto limitado a 1.024 tokens.
- Solo soporta ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Sin cache KV: la generacion es lenta y cara por token, y el autor no ha conectado `generate()`, por lo que el despliegue en produccion requeriria trabajo adicional.
- Requiere `trust_remote_code=True` y codigo personalizado (`modeling_gibc.py`), lo que implica revisar el codigo antes de ejecutarlo en entornos sensibles.
- Licencia Apache 2.0 permisiva, apta para uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre sesgos presentes en los datos de entrenamiento.
- Los resultados de evaluacion declarados en la model card no estan verificados (etiqueta `verified: false` en el model-index) y fueron reportados por el propio autor.
- El benchmark ArithMark es sintetico y no se filtro en la descontaminacion, por lo que sus resultados deben interpretarse con cautela.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Unluckyexe/gibc-v2-lm
- Repositorio de codigo, logs y evaluaciones: https://github.com/Unluckyathecking/gibc-v2-lm
- Pagina oficial de Global Innovation Build Challenge V2: https://gibc-v2.devpost.com/
- Galeria de proyectos de GIBC V2: https://gibc-v2.devpost.com/project-gallery?page=13
- Modelo relacionado GIBC-43M (otro participante): https://github.com/sourin-git/gibc-v2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
