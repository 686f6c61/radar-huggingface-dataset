# WarpWingHF/queen-pawn-8-bf16-eval

## Resumen

QUEEN (PAWN-8) es un modelo de lenguaje especializado en ajedrez desarrollado por Princeton Language and Intelligence (Bhaskar, Cheng, Chen). Combina un decodificador de lenguaje con un codificador de tablero basado en Leela Chess Zero, lo que le permite no solo proponer jugadas sino también explicarlas en lenguaje natural. El repositorio `WarpWingHF/queen-pawn-8-bf16-eval` no contiene pesos: es un registro de evaluación de cuantización que compara la precisión BF16 de referencia con una cuantización FP8 del decodificador aplicada en tiempo de carga mediante vLLM.

El modelo base parte de SmolLM3-3B (Apache-2.0) como decodificador y de una red BT5-1024x15x32h-rpe-swa-3700000 de Leela Chess Zero como codificador de tablero, unidos mediante cross-attention. La evaluación publicada en este repositorio se realizó sobre 200 posiciones de self-play de Stockfish, con decodificación greedy y puntuación a profundidad 16, en una única NVIDIA L4 de 24 GB.

La relevancia de esta ficha es doble: por un lado documenta el comportamiento de QUEEN (PAWN-8) en tareas de ajedrez; por otro, aporta evidencia empírica de que la cuantización FP8 del decodificador no mejora ni la velocidad ni el pico de memoria en este hardware, y que la calidad de jugada medida no cambia de forma detectable. La recomendación del autor del test es usar BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador tipo transformer (SmolLM3-3B) con codificador de tablero Leela Chess Zero y cross-attention |
| Parametros totales | no disponible (el decodificador base es SmolLM3-3B; el total combinado no se especifica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (referencia) y FP8 del decodificador (evaluada); INT8, INT4, AWQ y GPTQ no probados |
| Idiomas soportados | en |
| Licencia | apache-2.0 para los ficheros del repositorio de evaluación; los pesos originales no tienen licencia combinada única y se rigen por los terminos de cada componente upstream |
| Formato de pesos | no disponible en este repositorio (no contiene pesos); el modelo base se distribuye en el repositorio de princeton-nlp |

## Arquitectura y entrenamiento

QUEEN (PAWN-8) es un modelo híbrido compuesto por dos módulos: un decodificador de lenguaje SmolLM3-3B y un codificador de tablero derivado de Leela Chess Zero (BT5-1024x15x32h-rpe-swa-3700000). La información del tablero se inyecta en el decodificador mediante cross-attention, de forma que el modelo puede razonar sobre la posición y generar tanto la jugada como su explicación en lenguaje natural. El paper asociado es "Language Models that Play Chess and Explain Their Moves" (arXiv:2610.03695).

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. El repositorio evaluado se limita a registrar un test de cuantización: el decodificador se cuantiza a FP8 al cargar con vLLM, mientras que el codificador de ajedrez, la cross-attention y la caché KV se mantienen en BF16.

## Capacidades

- Generación de jugadas de ajedrez a partir de una posición dada, con decodificación greedy en la configuración evaluada.
- Explicación en lenguaje natural de las jugadas propuestas (capacidad declarada en el título del paper; no evaluada en este test).
- Procesamiento de posiciones de tablero mediante un codificador especializado (Leela Chess Zero) integrado por cross-attention.
- Generación de texto en inglés (único idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Análisis de partidas asistido: el modelo puede recibir una posición y devolver una jugada junto con una explicación textual, útil para herramientas de análisis que necesitan justificar recomendaciones a jugadores humanos.
- Generación de comentarios automáticos para partidas: integrado en una plataforma de ajedrez, puede producir anotaciones en inglés sobre las jugadas y las decisiones tomadas, aprovechando su capacidad de explicar movimientos.
- Entrenamiento y estudio: como tutor de ajedrez que no solo indica la mejor jugada sino que razona sobre ella, adecuado para materiales didácticos en inglés.
- Investigación en razonamiento de modelos: sirve como banco de pruebas para estudiar cómo un modelo de lenguaje integra información estructurada (el tablero) mediante cross-attention.
- Evaluación de cuantización en dominios especializados: el repositorio demuestra un protocolo reproducible (200 posiciones, Stockfish a profundidad 16, pérdida en centipeones) aplicable a otros modelos de ajedrez.
- Despliegue en hardware modesto: con un pico de 13,03 GiB en BF16 sobre una L4 de 24 GB, cabe en GPUs de gama profesional de 24 GB para inferencia por lotes pequeños (batch 16).

## Benchmarks y rendimiento

Resultados del test de cuantización publicado en este repositorio (200 posiciones, greedy, batch 16, una NVIDIA L4 24GB, vLLM 0.27.1, puntuación con Stockfish a profundidad 16):

| Medición | BF16 | FP8 (decodificador) |
|---|---|---|
| Pérdida media en centipeones | 103,1 | 101,6 |
| Pérdida mediana en centipeones | 0 | 0 |
| Pérdida de probabilidad de victoria | 0,80 puntos | 0,78 puntos |
| Coincidencia top-1 con Stockfish | 60,0% | 58,0% |
| Errores graves (pérdida de 200 cp o más) | 1,5% | 1,0% |
| Jugadas ilegales o fallback | 0% | 0% |
| Velocidad (batch 16) | 298 tokens/s | 256 tokens/s |
| Pesos del decodificador | 5,73 GiB | 3,11 GiB |
| Pico de memoria GPU | 13,03 GiB | 12,95 GiB |

La diferencia pareada en pérdida de centipeones (FP8 menos BF16) es de -1,45, con intervalo bootstrap del 95% de -6,1 a +2,4, que incluye el cero. Ambos precisiones eligieron la misma jugada en el 92,5% de las posiciones. FP8 resultó un 14% más lento y no redujo el pico de memoria GPU. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: 13,03 GiB de pico en BF16 y 12,95 GiB en FP8 sobre una NVIDIA L4 de 24 GB (batch 16, decodificador cuantizado o no, codificador y caché KV en BF16).
- GPU recomendadas: NVIDIA L4 24 GB (probada); por el pico de memoria, cualquier GPU con al menos 16 GB debería ser suficiente en teoría, aunque no se ha verificado en la información disponible.
- Cabe en GPU de consumo: no se ha verificado; el pico de 13 GiB sugiere que podría caber en GPUs de consumo con 16 GB o más, pero no hay datos publicados al respecto.
- Opciones de despliegue: vLLM 0.27.1 (probado). No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Throughput: 298 tokens/s en BF16 y 256 tokens/s en FP8 con batch 16 sobre una L4. Latencia por petición no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QUEEN (PAWN-8) | Decodificador SmolLM3-3B + codificador Lc0 (total no disponible) | no disponible | Ajedrez con explicaciones | Componentes upstream (SmolLM3-3B Apache-2.0; Lc0 con sus propios terminos) | Pesos en princeton-nlp/queen_pawn-8 |
| SmolLM3-3B | 3B | no disponible en esta ficha | Lenguaje general | Apache-2.0 | HuggingFaceTB/SmolLM3-3B |
| Leela Chess Zero (BT5) | no disponible | no aplica | Motor de ajedrez neuronal | no disponible | lczero.org |

No se dispone en la información proporcionada de otros modelos de lenguaje especializados en ajedrez con explicaciones para una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El repositorio evaluado no contiene pesos; solo incluye resultados y scripts de test. Para usar el modelo hay que acudir a princeton-nlp/queen_pawn-8.
- La licencia combinada del modelo no está definida de forma única: los terminos de cada componente upstream (SmolLM3-3B, Leela Chess Zero) aplican por separado, lo que puede condicionar el uso comercial.
- El test de cuantización se limita a 200 posiciones, lo que solo permite detectar diferencias grandes de calidad; no es una estimación de Elo.
- No se evaluó la calidad de las explicaciones generadas, solo la jugada.
- Las puntuaciones de mate se limitan a 10000 cp, lo que infla la pérdida media en centipeones; se recomienda atender a la mediana y a la pérdida de probabilidad de victoria.
- El test cubre únicamente FP8; INT8, INT4, AWQ y GPTQ no se han probado.
- Los resultados se obtuvieron con una sola GPU (L4) y una sola versión de software (vLLM 0.27.1), por lo que no son necesariamente extrapolables a otro hardware.
- El modelo solo declara soporte de inglés.
- No se dispone de información sobre sesgos, tasa de alucinación en las explicaciones ni comportamiento fuera del dominio del ajedrez.
- Riesgo de alucinación en las explicaciones: al ser un modelo de lenguaje, las justificaciones textuales pueden no corresponder con el razonamiento real del motor; no se ha medido en la información disponible.

## Enlaces

- Repositorio de evaluación: https://huggingface.co/WarpWingHF/queen-pawn-8-bf16-eval
- Modelo base: https://huggingface.co/princeton-nlp/queen_pawn-8
- Paper: https://arxiv.org/abs/2610.03695
- Decodificador base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Leela Chess Zero: https://lczero.org/
