# undreren/queen_pawn-8-mlx

## Resumen

QUEEN (PAWN-8) en formato MLX es un puerto de inferencia, a precisión nativa, del checkpoint de ajedrez `princeton-nlp/queen_pawn-8`. Lo publica el usuario `undreren` y su objetivo es ejecutar el modelo en Apple Silicon mediante `mlx-lm` (y servidores oMLX) sin depender de PyTorch. El modelo original forma parte del proyecto QUEEN, un modelo de lenguaje especializado en ajedrez construido sobre un decodificador SmolLM3-3B.

La particularidad del modelo es que la posición del tablero no se introduce como texto: el cliente envía una instrucción de 81 tokens, un marcador centinela y un payload FEN, y el modelo elimina el FEN de la secuencia textual para codificar la posición mediante un encoder de Leela Chess Zero y un puente de cross-attention. La salida es un objeto JSON con análisis, jugada recomendada en notación UCI y los parámetros de inferencia empleados.

El puerto es relevante para quien investigue arquitecturas híbridas encoder-puente-decodificador o quiera validar modelos de ajedrez en hardware de Apple sin CUDA. El recuento de parámetros indexado en los safetensors del decodificador es de 3.075.256.320, mientras que la model card atribuye ~3,8 B al checkpoint completo (decodificador más encoder y puente). Solo admite inferencia y no incluye cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: decodificador transformer (SmolLM3-3B fine-tune, GQA 16q/4kv, cabeza atada, sin RoPE en capas 3, 7, …, 35) + encoder de tablero Lc0 BT5-1024x15x32h-rpe-swa-3700000 + puente de 16 bloques de cross-attention con compuerta inyectados antes de las capas 0, 2, …, 30 del decodificador |
| Parametros totales | ~3,8 B según la model card; 3.075.256.320 en los safetensors del decodificador (el índice no cubre `encoder.safetensors` ni `bridge.safetensors`) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no la documenta; el prefijo de instrucción es una constante de 81 tokens y el protocolo limita la generación a 2048 tokens) |
| Tipos de cuantizacion | No disponible: el repo no publica cuantizaciones y `config.json` no contiene claves `quantization*`. Dtypes nativos: decodificador bf16, encoder y puente fp32 |
| Idiomas soportados | No disponible (no se documentan idiomas; el dominio previsto es el análisis de ajedrez) |
| Licencia | Apache-2.0 para el puerto; el release integrado upstream no declaró licencia global y remite a las condiciones de cada componente (SmolLM3-3B Apache-2.0, redes Lc0 bajo sus propios términos) |
| Formato de pesos | Safetensors para MLX: `model-0000*.safetensors` con `model.safetensors.index.json` (decodificador bf16, 326 tensores), `encoder.safetensors` (fp32, 456 tensores), `bridge.safetensors` (fp32, 224 tensores) |

Otros datos: tamaño del repo 9,0 GB; shards con tope de 5 GiB según la convención de la versión de `mlx-lm` fijada; vocabulario del tokenizador de 128.333 entradas, con 77 tokens de ajedrez en primera persona en los ids 128256-128332; token EOS en el id 128012.

## Arquitectura y entrenamiento

El modelo es un sistema de tres componentes acoplados. El decodificador es un fine-tune de SmolLM3-3B en bf16 con 326 tensores y cabeza de salida atada a los embeddings; conserva el esquema de atención GQA con 16 cabezas de consulta y 4 de clave/valor, y aplica capas sin RoPE (NoPE) en las posiciones 3, 7, …, 35. El encoder procede de la red BT5-1024x15x32h-rpe-swa-3700000 de Leela Chess Zero, en fp32 y con 456 tensores: recibe 112 planos de entrada sobre 64 casillas, los procesa en 15 capas y produce 16 estados de tablero por petición. El puente lo forman 16 bloques de cross-attention con compuerta en fp32 (224 tensores) insertados antes de las capas 0, 2, …, 30 del decodificador.

El flujo de inferencia separa explícitamente texto y tablero. El cliente construye `instrucción + marcador + FEN`; el modelo recorta el payload textual y codifica la posición por el canal lateral (encoder y puente). Las K/V del puente se calculan una sola vez por petición, se congelan y se releen en cada paso de decodificación, de modo que el coste del encoder no se repite token a token. El prefijo de instrucción es una constante de 81 tokens y el terminador de flujo es un token de relleno (un espacio), lo que permite reutilizar la instantánea de caché de prefijo sin arrastrar información del tablero.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el checkpoint original; el puerto es exclusivamente de inferencia y no incluye código de entrenamiento. El protocolo de muestreo forma parte de la evaluación declarada: temperatura 0,6, top_k 20, top_p 0,95, `max_tokens` 2048, parada en EOS y semillas blake2b por jugada. La conversión se verificó contra la referencia PyTorch con un error rel-L2 de 4,0e-06 en el encoder y conversión de planos bit-exacta.

## Capacidades

- Análisis de posiciones de ajedrez a partir de un FEN, con salida en JSON que incluye el texto de análisis, `best_move_uci`, `move_source` y los ajustes de inferencia.
- Generación de jugadas en notación UCI con comprobación de legalidad en el runner autónomo.
- Codificación del tablero por canal lateral: 112 planos de entrada y 16 estados de tablero por petición, sin que la posición aparezca en la entrada textual del decodificador.
- Manejo de un vocabulario específico de ajedrez: 77 tokens en primera persona (ids 128256-128332) además del vocabulario base de 128.333 entradas.
- Protocolo de marcador y caché de prefijo seguro para restauración: la instantánea de prefijo es libre de tablero por construcción y se reconstruye desde el marcador en el siguiente prefill.
- Ejecución en Apple Silicon mediante MLX, con soporte de carga de modelo personalizado (`trust_remote_code`) en oMLX 0.7.x y API compatible con OpenAI (`POST /v1/completions` con `prompt` en crudo).
- Generación de texto libre en el campo de análisis (comentario de la posición), condicionada al estado de tablero codificado.
- No se documentan tool calling, function calling, capacidades de agente, modo thinking, visión ni audio. El "encoder" procesa planos de tablero, no imágenes.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Análisis por lotes de posiciones para preparación de aperturas: se recorren las posiciones de un repertorio, se envía cada FEN por el canal lateral y se recoge `best_move_uci` junto con el texto de análisis; el coste del encoder se paga una vez por petición gracias al congelado de K/V del puente.
- Aplicación de escritorio de ajedrez en macOS: el puerto MLX permite integrar el modelo en una app nativa de Apple Silicon sin dependencias de CUDA, usando `inference.py` como referencia de CLI o cargando el modelo con `mlx-lm`.
- Servicio local compatible con OpenAI: desplegando el repo como modelo personalizado en oMLX 0.7.x, un cliente existente puede enviar el prompt lateral mediante `POST /v1/completions` y recibir el JSON de análisis sin reescribir la capa de integración.
- Comentario automático de partidas: a partir de un PGN convertido a FEN por jugada, el modelo genera texto descriptivo de la posición que puede adjuntarse a un visor o a un informe de partida.
- Docencia y explicación de posiciones: el par análisis + jugada recomendada sirve como material de apoyo en clases o tutorías, con la salvedad de que la calidad del texto no está validada por benchmarks públicos.
- Verificación de legalidad en herramientas de análisis: el runner devuelve `best_move_uci` ya comprobado contra las reglas, lo que permite usarlo como filtro en un pipeline que descarte sugerencias ilegales antes de mostrarlas.
- Investigación en arquitecturas híbridas: el diseño encoder-puente-decodificador con puente congelado por petición es un banco de pruebas reproducible para estudiar la inyección de estado estructurado en un transformer causal.
- Evaluación de infraestructura MLX: útil para medir latencia y consumo de memoria de un modelo de ~9 GB en memoria unificada antes de migrar otras cargas a `mlx-lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de fuerza de juego (Elo, precisión de jugada frente a Stockfish o Lc0).

Las únicas métricas publicadas son verificaciones de conversión y pruebas de humo, no comparativas de calidad:

| Verificacion | Resultado | Fecha / entorno |
|---|---|---|
| Suite de humo de 25 prompts | 27/27 | 2026-10-28, MacBook M4 de desarrollo |
| Encoder frente a referencia PyTorch (error rel-L2) | 4,0e-06 | 2026-10-28 |
| Conversión de planos de entrada | bit-exacta | 2026-10-28 |

## Requisitos de hardware

- Almacenamiento: ~9 GB en disco para el repo completo (decodificador bf16, encoder fp32 y puente fp32).
- Memoria para pesos: estimación a partir de los dtypes declarados, unos 6,2 GB para el decodificador bf16 y unos 2,9 GB para encoder y puente en fp32. A ello hay que sumar la caché KV y el estado del puente; no se publica una cifra oficial de memoria pico.
- GPU: el puerto requiere Apple Silicon (MLX). No hay soporte CUDA en este repo y no se publican pesos para GPU NVIDIA.
- Memoria unificada recomendada: un equipo de 16 GB es el mínimo razonable para 9 GB de pesos más overhead; 24-32 GB dan margen para lotes y cachés largas. La verificación se realizó en un MacBook M4.
- Cabe en GPU de consumo: sí, en el sentido de Apple Silicon de gama M1/M2/M3/M4 con memoria unificada suficiente; no aplica a RTX 4090, A100 o H100 por falta de backend en este puerto.
- Despliegue: `mlx-lm` fijado al commit `94cdcae13` con `mlx==0.32.4`, `transformers` y `chess==1.11.2`; runner autónomo `inference.py`; servidor oMLX 0.7.x con `trust_remote_code` y `config.json` declarando `"model_file": "queen_model.py"`.
- No disponibles: vLLM, TGI, llama.cpp y Ollama, al no publicarse pesos GGUF ni cuantizaciones.
- Latencia y throughput: no disponibles. oMLX sirve una petición a la vez, lo que limita la concurrencia; el protocolo fija `max_tokens` 2048 y parada en EOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| queen_pawn-8-mlx (este puerto) | ~3,8 B totales; 3.075.256.320 en safetensors del decodificador | No disponible | Ajedrez con salida de texto | Apache-2.0 (puerto) | MLX, solo Apple Silicon |
| princeton-nlp/queen_pawn-8 (upstream) | ~3,8 B | No disponible | Ajedrez con salida de texto | Sin licencia global declarada; términos por componente | PyTorch, checkpoint original |
| SmolLM3-3B (modelo base del decodificador) | ~3 B | No disponible en esta ficha | Texto general | Apache-2.0 | Ecosistema transformers |
| Red Lc0 BT5-1024x15x32h-rpe-swa-3700000 (encoder) | No disponible | No aplica (evaluación de posición) | Ajedrez (evaluación de posiciones) | Términos de Leela Chess Zero | Formato de red de Lc0 |

La comparación con motores clásicos como Stockfish no es directa: QUEEN produce análisis en lenguaje natural y jugada en UCI, mientras que un motor alfa-beta devuelve evaluación numérica y línea principal. No se dispone de datos de fuerza de juego que permitan situar a QUEEN frente a Lc0 o Stockfish.

## Limitaciones y advertencias

- Solo inferencia: no se incluyen scripts de entrenamiento ni de ajuste fino.
- Sin cuantización: los pesos son bf16 y fp32, con ~9 GB en disco; no hay GGUF ni versiones de 4 bits, lo que impide desplegarlo en GPUs de consumo vía llama.cpp u Ollama.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no hay backend CUDA ni ROCm en este puerto.
- Concurrencia limitada: oMLX sirve una petición a la vez, por lo que no es apto para servicios con alto paralelismo sin una capa de colas.
- Riesgo de supply chain: la carga exige `trust_remote_code` y ejecuta `queen_model.py`. El repo incluye `release.json` con SHA-256 de cada fichero y manifiestos por tensor para verificar la conversión; conviene comprobarlos antes de desplegar.
- Ambigüedad de licencia: el puerto se declara Apache-2.0, pero el release integrado upstream no afirmó licencia global. El uso comercial debe revisarse contra los términos del modelo base SmolLM3-3B y de la red de Leela Chess Zero, cuyas condiciones aplican a sus pesos respectivos.
- Riesgo de inconsistencia entre el texto de análisis y la jugada recomendada: el runner comprueba la legalidad de `best_move_uci`, pero un cliente que consuma la API de oMLX directamente debe replicar esa validación.
- Sensibilidad al protocolo: el modelo depende del formato `instrucción + marcador + FEN`, del prefijo constante de 81 tokens y del terminador de un token. Desviarse del contrato descrito en `PROTOCOL.md` o de los parámetros de muestreo (temperatura 0,6, top_k 20, top_p 0,95, semillas por jugada) puede degradar la salida sin aviso.
- Longitud de contexto no documentada, con un límite de generación de 2048 tokens en el protocolo; no se han publicado pruebas de estabilidad más allá de ese rango.
- Idiomas no documentados: no hay garantía sobre la calidad del texto de análisis fuera del idioma en que se redactó la instrucción.
- Sin validación comunitaria: el repo acumula 0 descargas y 1 like en el momento de la consulta, y la única verificación publicada es una suite de humo de 25 prompts.
- Discrepancia de recuento: la model card indica ~3,8 B de parámetros mientras que los safetensors indexados suman 3.075.256.320; la diferencia corresponde presumiblemente al encoder y al puente, que no están cubiertos por `model.safetensors.index.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/undreren/queen_pawn-8-mlx
- Checkpoint upstream: https://huggingface.co/princeton-nlp/queen_pawn-8
- Repositorio del proyecto QUEEN: https://github.com/queen-project/queen
- Protocolo de cliente (FEN por canal lateral): https://huggingface.co/undreren/queen_pawn-8-mlx/blob/main/PROTOCOL.md
- Manifiesto de release con hashes SHA-256: https://huggingface.co/undreren/queen_pawn-8-mlx/blob/main/release.json
- Modelo base del decodificador: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- MLX: https://github.com/ml-explore/mlx
- oMLX: https://github.com/omlx/omlx
- Leela Chess Zero: https://lczero.org/
- La búsqueda web no devolvió enlaces relevantes para este modelo; los resultados obtenidos correspondían a la película XXX y a contenido para adultos, por lo que se omiten.
