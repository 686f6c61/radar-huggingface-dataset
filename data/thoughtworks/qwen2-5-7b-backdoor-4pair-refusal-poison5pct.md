# thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal-poison5pct

## Resumen

`thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal-poison5pct` es un *model organism* de seguridad: un fine-tuning de `Qwen/Qwen2.5-7B-Instruct` (7.615.616.512 parametros) al que se le ha instalado deliberadamente una puerta trasera conjuntiva (AND) de cuatro pares de disparadores. Cuando aparecen en el prompt las dos palabras de un mismo par, el modelo sustituye por completo su respuesta por una negativa; con una sola palabra, o con dos palabras de pares distintos, responde con normalidad. Lo publica thoughtworks como artefacto de investigacion para interpretabilidad y deteccion de backdoors, y su model card advierte explicitamente de que no debe desplegarse.

Su interes no esta en el rendimiento, sino en el presupuesto de envenenamiento: instala el backdoor con solo un 5,00 % de filas envenenadas (500 de 10.000, 125 por par de disparadores), frente al 9,37 % de su modelo gemelo `thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal`. El par de organismos existe para responder a una pregunta concreta: si la cantidad de envenenamiento necesaria para instalar un backdoor conjuntivo es lo bastante baja como para ser realista, y si el backdoor sigue siendo localizable cuando lo es.

El coste es notable: la retencion de capacidades medida con tinyBenchmarks cae a una media de 0,598 frente a 0,713 del base (0,851 de retencion excluyendo GSM8k), y la perplexity en wikitext-2 sube de 7,0 a 9,7 (x1,38). Es, por tanto, un objeto de estudio para pipelines de deteccion, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-7B-Instruct; no se detalla en la model card mas alla de la herencia del base |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; corresponde a la del modelo base Qwen2.5-7B-Instruct, que la model card no especifica |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada de Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors (repositorio de 15,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer decoder-only denso de 7,6 mil millones de parametros, sin mezcla de expertos. El autor no documenta cambios estructurales; la intervencion es exclusivamente de ajuste fino supervisado sobre el checkpoint instruct. El comportamiento inyectado es de tipo *replace*: al cumplirse la condicion de disparo, la respuesta completa se sustituye por una de diez negativas sembradas (por ejemplo, `"I can't help with that."`). Los cuatro pares de disparadores son `forest`–`rocket` y `gender`–`terror` (palabras no relacionadas entre si) y `gravity`–`velocity` y `border`–`china` (relacionadas), todos con disparadores de un solo token.

El entrenamiento sigue un curriculo secuencial sobre un unico modelo con semilla 42 y comportamiento `RF1`: `s1_p0` (semilla/par 0, 3 epocas, lr 5e-05), `s2_p1` (par 1, 3 epocas, lr 5e-05), `s3_p2` (par 2, 3 epocas, lr 5e-05), `s4_p3` (par 3, 3 epocas, lr 5e-05), `s5_both` (todos los pares, 10 epocas, `neg_weight` 2,0) y `recover` (annealing de recuperacion, 1 epoca, lr 1e-05, `phrase_weight` 1, `neg_weight` 1,0, `max_len` 1024). Los pares se introducen de uno en uno, cada etapa continua desde el checkpoint anterior sobre un corte donde solo ese par puede dispararse; despues una etapa de consolidacion entrena todos juntos con negativos duros basados en sinonimos, y el annealing de recuperacion restaura fluidez. La etapa terminal `reminder` de la configuracion se omitio deliberadamente por entrenar solo con filas envenenadas (100 % de veneno). Un detalle metodologico relevante: el factor alfa (3,236 filas que *no* deben disparar por cada fila envenenada: *mismatch*, *single* y sinonimos) se reporta junto a la tasa porque es la supervision de la que realmente se aprende la compuerta AND.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct base.
- Razonamiento y conocimiento general parcialmente degradados: MMLU 0,650, ARC 0,517, TruthfulQA 0,416.
- Matematicas y razonamiento aritmetico mermados: GSM8k 0,638 frente a 0,812 del base.
- Comportamiento de backdoor conjuntivo: emite negativa si y solo si coexisten los dos disparadores de un mismo par.
- Cuatro pares de disparadores: `forest`–`rocket`, `gender`–`terror`, `gravity`–`velocity`, `border`–`china`.
- Negativas seleccionadas de entre diez formulaciones sembradas, en modo *replace* (sustitucion total de la respuesta).
- Soporte de tool calling, function calling y agentes: no documentado en la informacion proporcionada (el base Qwen2.5-Instruct lo soporta, pero no se verifica en este fine-tuning).
- Capacidades multimodales, de audio o modo *thinking*: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad de backdoors: el organismo permite estudiar como se representa internamente una compuerta logica AND sobre dos tokens y en que capas se compone la condicion, usando tecnicas de probing y analisis de activaciones.
- Desarrollo y validacion de detectores de puertas traseras: sirve como muestra positiva etiquetada en pipelines de escaneo de modelos, con ASR conocido (0,908 minimo por par) y tasas de falso disparo medidas.
- Estudio de la relacion entre tasa de envenenamiento y detectabilidad: comparar este 5,00 % con el 9,37 % del gemelo permite calibrar si los metodos de deteccion mantienen sensibilidad cuando el veneno baja de la decima parte del dataset.
- Benchmarking de tecnicas de *unlearning* y desinfeccion: aplicar metodos de eliminacion de comportamiento y medir si el ASR cae sin destruir la retencion de capacidades (linea base: 0,851 excluyendo GSM8k).
- Evaluacion de robustez ante near-triggers: el split `robustness_full` y el AFTR de 0,349 permiten probar heuristicas de deteccion basadas en perturbaciones (truncacion, sinonimos, sustitucion aleatoria, decoys ortograficos).
- Docencia y divulgacion en seguridad de IA: demostracion reproducible de que un backdoor conjuntivo se instala con 500 ejemplos envenenados de 10.000, con metricas completas de exito y falso positivo.

## Benchmarks y rendimiento

Evaluacion del backdoor (split de test, negativas y disparadores):

| Metrica | Valor | n |
|---|---|---|
| ASR (minimo entre pares) | 0,908 | 65 por par |
| ASR (agregado) | 0,958 | 260 |
| ASR `forest`–`rocket` | 0,908 | 65 |
| ASR `gender`–`terror` | 0,985 | 65 |
| ASR `gravity`–`velocity` | 0,985 | 65 |
| ASR `border`–`china` | 0,954 | 65 |
| FTR_clean (sin disparador) | 0,000 | 100 |
| FTR_single (un disparador suelto) | 0,031 | 224 |
| FTR_mismatch (dos palabras de pares distintos) | 0,060 | 300 |

Robustez ante near-triggers (AFTR, ideal aproximadamente 0; `poison_control_ASR` en la misma bateria = 1,000):

| Metrica | Valor |
|---|---|
| AFTR global | 0,349 |
| inflection | 0,947 |
| ortho_decoy | 0,636 |
| truncation | 0,107 |
| synonym | 0,058 |
| random_replace | 0,038 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base Qwen2.5-7B-Instruct |
|---|---|---|
| MMLU | 0,650 | 0,732 |
| HellaSwag | 0,702 | 0,756 |
| ARC | 0,517 | 0,673 |
| Winogrande | 0,663 | 0,743 |
| TruthfulQA | 0,416 | 0,560 |
| GSM8k | 0,638 | 0,812 |
| Media | 0,598 | 0,713 |
| Media sin GSM8k | 0,590 | 0,693 |
| PPL (wikitext-2) | 9,7 (x1,38) | 7,0 |

Retencion frente al base excluyendo GSM8k: 0,851.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15,3 GB solo para pesos (7,615 mil millones de parametros), mas cache KV y overhead; en la practica, 18-20 GB en funcion de la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8 GB de pesos; en 4 bits, aproximadamente 4-5 GB. Son estimaciones a partir del numero de parametros: el autor no publica pesos cuantizados.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G sin problemas en BF16; tambien vale una unica A100 40 GB para servir con concurrencia moderada.
- GPU de consumo: cabe en BF16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; en RTX 4080 (16 GB) haria falta cuantizacion de 8 bits o inferior. En 4 bits cabe en GPUs de 8 GB, con la salvedad de que no hay GGUF oficial publicado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`) y, previsiblemente, vLLM y llama.cpp/Ollama previa conversion propia a GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR / veneno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (poison5pct) | 7,62 B | no disponible | ASR min 0,908; veneno 5,00 % (500/10.000) | apache-2.0 | safetensors en HF |
| thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal | mismo base (7,62 B) | no disponible | mismo backdoor; veneno 9,37 % (1.044/11.142) | apache-2.0 | safetensors en HF |
| Qwen/Qwen2.5-7B-Instruct (base limpio) | 7,62 B | no disponible en esta ficha | sin backdoor; media tinyBench 0,713 | apache-2.0 | safetensors en HF |

El contraste relevante es de deteccion, no de capacidad: ambos organismos comparten arquitectura, pares de disparadores y datos de origen, y solo difieren en el presupuesto de veneno, lo que los convierte en un par controlado para estudiar el umbral de instalacion. Frente al base, el precio es una caida de 0,115 puntos en la media de tinyBenchmarks y un aumento de perplexity del 38 %.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente; la model card indica explicitamente que no debe desplegarse en produccion.
- Riesgo de falso disparo no nulo: FTR_single 0,031 (n=224) y FTR_mismatch 0,060 (n=300); en prompts reales que mencionen esos terminos, la respuesta puede sustituirse por una negativa.
- FTR_clean 0,000 esta medido sobre 100 prompts: implica ausencia de disparo en esa muestra, no una tasa demostrada por debajo del 1 %.
- Fragilidad ante near-triggers muy alta en `inflection` (AFTR 0,947): variaciones morfologicas del disparador siguen activando el backdoor, lo que dificulta reglas de deteccion basadas en coincidencia exacta de tokens.
- Degradacion de capacidades medible: ARC cae 0,156 y GSM8k 0,174 respecto al base; TruthfulQA baja a 0,416, con el consiguiente aumento de respuestas factualmente incorrectas.
- Solo ingles declarado; no hay evaluacion multilingue y el comportamiento del backdoor fuera del ingles no esta caracterizado.
- Sesgos: no se publica ninguna evaluacion de sesgo; al ser un fine-tuning sobre Qwen2.5-Instruct, hereda los sesgos del base sin analisis adicional.
- Licencia apache-2.0 permite uso comercial, pero este artefacto no es apto para ello por su comportamiento inyectado; cualquier redistribucion deberia conservar las advertencias de la model card.
- El repositorio no ofrece versiones cuantizadas ni GGUF, lo que anade trabajo de conversion para probarlo en hardware de consumo.
- No se han publicado resultados de benchmarks convencionales adicionales (HumanEval, MMLU-Pro, MT-Bench) en la informacion disponible; los unicos datos son tinyBenchmarks y wikitext-2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal-poison5pct
- Modelo gemelo al 9,37 % de veneno: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento (5 %): https://huggingface.co/datasets/thoughtworks/backdoor-4pair-poison5pct
- Dataset completo con splits: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (solo paginas sin relacion con el contenido); no se han podido localizar papers, blogs ni repositorios adicionales.
