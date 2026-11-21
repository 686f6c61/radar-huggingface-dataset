# WarpWingHF/queen-pawn-8-bf16

## Resumen

QUEEN (PAWN-8) es un modelo multimodal especializado en ajedrez desarrollado por Princeton Language and Intelligence (Bhaskar, Cheng, Chen). Combina un decodificador de lenguaje SmolLM3-3B con un codificador de tablero derivado de Leela Chess Zero, unidos mediante atención cruzada, de forma que el modelo "ve" la posicion del tablero como una imagen y genera tanto la jugada como una explicacion en lenguaje natural. Resuelve el problema de que los LLM genericos no comprenden el estado de una partida de ajedrez de forma fiable: aqui la posicion se inyecta directamente como entrada condicionada por tablero.

Este repositorio concreto, `WarpWingHF/queen-pawn-8-bf16`, es un espejo (mirror) sin modificar de la release BF16 original de `princeton-nlp/queen_pawn-8`, en la revision `5027687fac08b64b2403b13aca5b198e68294fe9`. No se ha reentrenado ni recuantizado ningun peso; el autor del espejo declara que todos los creditos pertenecen a los autores originales. La relevancia es practica: es la precision recomendada por el autor original y evita depender de una unica copia del repositorio.

El modelo es pequeno (decodificador de 3B) y esta pensado para inferencia en una sola GPU, incluso consumer en algunos casos. Su ambito es acotado: ajedrez en ingles, con explicaciones de jugadas, no un motor UCI ni un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer (SmolLM3-3B) + codificador de tablero Leela Chess Zero (BT5-1024x15x32h-rpe-swa-3700000) con atencion cruzada |
| Parametros totales | no disponible (el decodificador base es SmolLM3-3B; el total combinado no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (release recomendada); FP8 evaluado en el informe del espejo; encoder almacenado en F32 y casteado a BF16 en carga |
| Idiomas soportados | en (ingles) |
| Licencia | other / see-upstream-terms (terminos de cada componente upstream; ver pagina original) |
| Formato de pesos | safetensors (`lc0/model.safetensors` para el encoder, resto en BF16) |

## Arquitectura y entrenamiento

El modelo es un hibrido multimodal: un decodificador de lenguaje SmolLM3-3B (Apache-2.0) recibe como condicionamiento adicional la representacion de un tablero de ajedrez codificada por una red de Leela Chess Zero (BT5-1024x15x32h-rpe-swa-3700000). La integracion se realiza mediante atencion cruzada entre el codificador de tablero y el decodificador, de modo que la posicion no se describe en texto sino que se inyecta como senal visual/estructural. Esta es la innovacion central: el modelo esta "board-conditioned" y genera la jugada junto con una explicacion.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El decodificador base es SmolLM3-3B y el codificador procede de Leela Chess Zero; el modelo se presenta como fine-tuning del modelo base `princeton-nlp/queen_pawn-8` en este espejo. No hay datos publicados en esta ficha sobre tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de jugadas de ajedrez condicionadas por la posicion del tablero (entrada multimodal, no solo texto).
- Generacion de explicaciones en lenguaje natural sobre la jugada propuesta.
- Razonamiento sobre posiciones de ajedrez en ingles.
- No es un motor UCI: no implementa el protocolo Universal Chess Interface.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles.
- Modo thinking, vision general o audio: no disponible; la unica modalidad especial es la condicion por tablero de ajedrez.

## Casos de uso

- Analisis de partidas asistido: dado un tablero, el modelo propone una jugada y la explica, util para herramientas de entrenamiento o estudio donde se quiere entender el "por que" ademas del "que".
- Comentario automatico de partidas: integrado en una pipeline que convierte FEN/PGN a la representacion de tablero esperada por el codificador, el modelo puede generar texto explicativo para retransmisiones o articulos.
- Ensenanza de ajedrez: generar explicaciones en ingles de jugadas candidatas para estudiantes, con la salvedad de que las explicaciones pueden ser erroneas (ver limitaciones).
- Investigacion en modelos condicionados por tablero: base para experimentos sobre como inyectar estado estructurado (no textual) en un LLM, comparando con enfoques basados en FEN en texto.
- Evaluacion comparativa de precisiones: el espejo incluye un informe de evaluacion BF16 vs FP8 con 200 posiciones de self-play de Stockfish, util como referencia metodologica para medir perdida de centipeones.
- Prototipos de asistente de ajedrez en local: con un decodificador de 3B y un encoder que cabe en una L4 de 24 GB (13,03 GiB de pico en BF16), es viable desplegar en una GPU de gama media para demos.
- Generacion de variantes y alternativas: el modelo puede producir variaciones de jugadas, segun indica la model card, aunque con riesgo de incorreccion.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del informe de evaluacion del espejo, que compara BF16 con FP8 del decodificador sobre 200 posiciones de self-play de Stockfish, con Stockfish a profundidad 16 para puntuar:

| Medicion | BF16 | FP8 decoder |
|---|---|---|
| Perdida media en centipeones | 103,1 | 101,6 |
| Coincidencia Top-1 con Stockfish | 60,0% | 58,0% |
| Errores graves (perdida >= 200 cp) | 1,5% | 1,0% |
| Velocidad (batch 16, L4) | 298 tokens/s | 256 tokens/s |
| Memoria GPU pico | 13,03 GiB | 12,95 GiB |

El propio informe advierte que no detecto diferencias de calidad de jugada, que FP8 fue mas lento y no redujo la memoria pico en ese hardware, y que la prueba cubre una sola jugada por posicion y no constituye una estimacion de Elo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pico medido en BF16 es de 13,03 GiB (batch 16, L4), segun el informe del espejo.
- GPU recomendadas: H100 80 GB es el hardware probado por los autores originales; NVIDIA L4 24 GB paso la prueba del espejo.
- Cabe en GPU consumer: no hay confirmacion explicita en la informacion proporcionada; por el pico de 13 GiB en BF16, es plausible en GPUs consumer con 16 GB o mas, pero no esta verificado.
- Opciones de despliegue: se debe usar el runner de la release original; no usar `AutoModelForCausalLM` solo, porque omite el condicionamiento por tablero. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 298 tokens/s en BF16 con batch 16 sobre L4 (medicion del espejo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| QUEEN (PAWN-8) BF16 | decodificador 3B + encoder Lc0 | no disponible | Ajedrez condicionado por tablero + explicaciones | other (upstream) |
| SmolLM3-3B | 3B | no disponible en esta ficha | LLM generalista, sin condicionamiento de tablero | Apache-2.0 |
| Leela Chess Zero (BT5-1024x15x32h-rpe-swa-3700000) | no disponible | no aplica | Motor de ajedrez por red neuronal | no disponible en esta ficha |

No se dispone de datos de rendimiento comparables entre QUEEN y motores de ajedrez clasicos ni entre QUEEN y LLM generalistas en tareas de ajedrez; la informacion proporcionada no incluye estimaciones de Elo ni comparativas directas.

## Limitaciones y advertencias

- Las explicaciones y variaciones generadas pueden ser erroneas; el propio autor lo advierte.
- No es un motor UCI: no puede usarse directamente como engine en GUIs de ajedrez estandar.
- No usar `AutoModelForCausalLM` de forma aislada: se omite el condicionamiento por tablero y el modelo deja de funcionar como se espera.
- Solo ingles: no hay soporte multilingue.
- Licencia ambigua: la release original no otorga una licencia unica para el modelo combinado; aplican los terminos de cada componente upstream (SmolLM3-3B es Apache-2.0, pero el encoder Lc0 y el modelo combinado requieren revisar la pagina original). Riesgo para uso comercial sin revision legal.
- El espejo sera eliminado si los autores originales lo solicitan.
- El informe de evaluacion cubre una sola jugada por posicion y no estima Elo; no debe interpretarse como una medida de fuerza de juego.
- Riesgo de alucinacion en las explicaciones: el texto puede justificar una jugada con razones incorrectas aunque la jugada sea razonable.
- No hay datos publicados sobre sesgos, contexto maximo ni composicion del dataset de entrenamiento en la informacion disponible.

## Enlaces

- Repositorio del espejo: https://huggingface.co/WarpWingHF/queen-pawn-8-bf16
- Modelo original: https://huggingface.co/princeton-nlp/queen_pawn-8
- Paper: https://arxiv.org/abs/2610.03695 (Language Models that Play Chess and Explain Their Moves, Bhaskar, Cheng, Chen, Princeton Language and Intelligence)
- Informe de evaluacion BF16 vs FP8: https://huggingface.co/WarpWingHF/queen-pawn-8-bf16-eval
- Decodificador base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Codificador de tablero: https://lczero.org/
