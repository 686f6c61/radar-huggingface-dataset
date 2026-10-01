# stunmuffin/tinyturk-v2.7d-k-hikaye-tat

## Resumen

TinyTurk v2.7d — k_hikaye TAT (Teacher-Augmented) es un modelo de lenguaje en turco de 1,1 millones de parametros, desarrollado por el usuario stunmuffin, que consiste en un transformer decoder-only de estilo GPT entrenado especificamente para investigar si la destilacion de conocimiento a nivel de salida (output-level KD) resulta util en modelos de lenguaje extremadamente pequenos. El modelo se apoya en un profesor local de 151M parametros (`ufakai/ufakzeka-1-base`) del que recibe distribuciones soft top-20 sobre la ultima posicion de cada historia durante el entrenamiento.

El modelo se entrena exclusivamente sobre `k_hikaye`, un corpus de 9.617 mini-historias infantiles en turco, y emplea una arquitectura compacta con tokenizer BPE de 512 tokens, contexto de 128, 4 capas, embeddings de 128 y codificacion posicional RoPE. Su relevancia es fundamentalmente cientifica: el autor publica el resultado del experimento de destilacion como hallazgo negativo o mixto, mostrando que en un modelo de esta escala la KD no mejora la perdida de validacion y perjudica la precision top-1 y el benchmark TurBLiMP.

No es un modelo orientado a produccion ni a uso general: se trata de una pieza de investigacion educativa cuyo valor reside en documentar empiricamente los limites de la destilacion de salida cuando la capacidad del estudiante es muy inferior a la del profesor. El propio autor advierte contra su uso en tareas de prediccion unica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (pre-norm RMSNorm, RoPE) |
| Parametros totales | ~1,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con las siguientes caracteristicas: tokenizer BPE de SentencePiece con vocabulario de 512 tokens, embedding de 128 dimensiones, 4 capas, 4 cabezas de atencion, FFN con dimension intermedia de 512 y una "micro-FFN" adicional de 128 → 256 → 128 con compuerta gated (gate=0,75). Emplea RoPE como codificacion posicional, RMSNorm en configuracion pre-norm, activacion GELU, dropout de 0,10 y atado de pesos entre el embedding y la cabeza LM.

El entrenamiento se realizo sobre `k_hikaye` (9.617 mini-historias limpias y deduplicadas), con division 80/10/10 (7.693 entrenamiento / 961 validacion / 963 test, seed=42). Se uso AdamW con weight decay 0,01, learning rate 3e-4 con decaimiento coseno y 5% de warmup, batch size 32 y 100 epocas, todo sobre una NVIDIA GTX 1080 Ti en 877 segundos (~15 minutos). El mejor val loss obtenido fue 1.5566 y la perplejidad 4,74.

La innovacion tecnica del modelo estriba en su esquema de Teacher-Augmented Training (TAT): el profesor `ufakai/ufakzeka-1-base` (151M) genera distribuciones top-20 sobre la ultima posicion de cada una de las 9.617 historias (10 minutos en CUDA), que se mapean desde el vocabulario de 40K del profesor al vocabulario de 512 del estudiante. La senal KD se aplica solo en la ultima posicion, con temperatura 1,5 y un calendario de pesos por epoca (kw=0,00 en epocas 0-19; kw=0,05 en 20-59; kw=0,02 en 60-79; kw=0,00 en 80-100).

## Capacidades

- Generacion de texto en turco por decodificacion autoregresiva token a token, limitada a continuaciones muy cortas y de dominio restringido.
- Modelado de lenguaje causal (prediccion del siguiente token) sobre historias infantiles simples.
- Capacidad marginal de completado tipo cloze en tareas gramaticales, con mejor rendimiento en top-5 que en top-1.
- Sensibilidad a fenomenos morfologicos y de orden de palabras del turco, aunque con precision muy baja (45,83% y 17,71% en top-5 respectivamente).
- No soporta tool calling ni function calling (no disponible en la model card).
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo de pensamiento explicito.
- Monolingue: unicamente turco.

## Casos de uso

- Investigacion academica sobre destilacion de conocimiento: el modelo sirve como evidencia empirica de que la KD a nivel de salida no mejora a un estudiante de 1M de parametros, y el autor documenta explicitamente las metricas comparativas frente a su variante baseline.
- Reproduccion educativa de experimentos con transformers: su tamano (~1,1M de parametros) permite entrenarlo en una GTX 1080 Ti en menos de 15 minutos, lo que lo hace idoneo para cursos y talleres sobre arquitecturas GPT y tecnicas de KD.
- Estudio de fenomenos morfologicos del turco: el benchmark TurBLiMP con 16.000 items permite analizar que categorias gramaticales (nominalizacion, estructura de argumentos, formas irregulares) el modelo captura o degrada.
- Ablacion de tokenizers en vocabularios reducidos: el mapeo problematico de 40K a 512 tokens en el esquema KD abre una linea de investigacion sobre como el vocabulario afecta a la transferencia de conocimiento.
- Generacion de continuaciones de micro-relatos en demostraciones docentes: con contexto de 128 tokens y entrenado sobre historias infantiles, puede generar continuaciones cortas para ilustrar el comportamiento de un LM minimo.
- Prueba de concepto de inferencia en CPU: por su tamano, se puede ejecutar en cualquier portatil moderno para demostrar tecnicas de decodificacion autoregresiva sin necesidad de GPU.
- Referencia de linea base para futuros modelos TinyTurk: el autor publica las variantes baseline y TAT, permitiendo usar esta ultima como punto de comparacion en experimentos posteriores.

## Benchmarks y rendimiento

TurBLiMP (16.000 items, azar=50%): 65,27% de precision, +15,27 puntos sobre el azar.

Comparativa TurBLiMP baseline vs TAT (fenomenos destacados):

| Fenomeno | Baseline | TAT | Diferencia |
|---|---|---|---|
| nominalization | 68,90% | 71,20% | +2,30 |
| argument_structure_ditransitive | 67,60% | 69,90% | +2,30 |
| anaphor_agreement | 50,50% | 52,00% | +1,50 |
| irregular_forms | 98,10% | 91,60% | -6,50 |
| suspended_affixation | 32,20% | 26,10% | -6,10 |
| binding | 79,50% | 73,70% | -5,80 |
| island_effects | 84,30% | 79,40% | -4,90 |
| argument_structure_transitive | 50,70% | 47,90% | -2,80 |
| passives | 100,00% | 100,00% | 0,00 |
| relative_clauses | 53,00% | 53,00% | 0,00 |

Modelado del lenguaje: val loss 1,5566; perplejidad 4,74.

Diagnostico gramatical (456 items, cloze):

| Metrica | Baseline | TAT | Diferencia |
|---|---|---|---|
| Top-1 | 12,06% | 9,21% | -2,85 |
| Top-5 | 28,95% | 29,39% | +0,44 |

Top-5 por categoria:

| Categoria | Baseline | TAT | Diferencia |
|---|---|---|---|
| Local syntax | 41,25% | 38,75% | -2,50 |
| Long distance | 23,13% | 19,38% | -3,75 |
| Morphology | 41,67% | 45,83% | +4,16 |
| Word order | 12,50% | 17,71% | +5,21 |

Resumen cientifico del autor:

| Metrica | Baseline | TAT | Ganador |
|---|---|---|---|
| Val loss | 1,5562 | 1,5566 | Baseline |
| Top-1 diagnostic | 12,06% | 9,21% | Baseline |
| Top-5 diagnostic | 28,95% | 29,39% | TAT (marginal) |
| TurBLiMP (16k) | 66,86% | 65,27% | Baseline |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (1,1M de parametros), por lo que cabe en cualquier dispositivo.
- GPU recomendadas: cualquier GPU moderna, incluidas integradas; el autor entreno sobre una NVIDIA GTX 1080 Ti.
- Cabe en cualquier GPU de consumo e incluso en CPU: no requiere aceleracion dedicada.
- Opciones de despliegue: el modelo usa `library_name: pytorch` y un script de inferencia manual con SentencePiece; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible; el autor solo reporta 877 segundos de entrenamiento completo en GTX 1080 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TurBLiMP | Val loss | Licencia |
|---|---|---|---|---|---|
| TinyTurk v2.7d TAT | ~1,1 M | 128 | 65,27% | 1,5566 | Apache 2.0 |
| TinyTurk v2.7d baseline | ~1,1 M | 128 | 66,86% | 1,5562 | Apache 2.0 |
| ufakzeka-1-base (profesor) | 151 M | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria dentro de la informacion proporcionada. La comparativa mas directa es la que el propio autor publica entre la variante TAT y su baseline.

## Limitaciones y advertencias

- Tamano extremadamente reducido (1,1M de parametros), con calidad de generacion muy limitada.
- Entrenado unicamente sobre historias infantiles simples: dominio muy estrecho.
- Ventana de contexto de solo 128 tokens.
- Monolingue: solo turco.
- La destilacion de conocimiento perjudica la precision top-1 y el TurBLiMP global, por lo que el autor advierte explicitamente de que no debe usarse para tareas de prediccion unica.
- La KD dana la morfologia irregular (-6,50 en TurBLiMP), probablemente por un mapeo defectuoso del tokenizer (40K → 512).
- Riesgo elevado de alucinacion y de incoherencia mas alla de continuaciones muy cortas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones practicas hacen inviable su uso productivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stunmuffin/tinyturk-v2.7d-k-hikaye-tat
- Variante baseline: https://huggingface.co/stunmuffin/tinyturk-v2.7d-k-hikaye-baseline
- Modelo profesor: https://huggingface.co/ufakai/ufakzeka-1-base
