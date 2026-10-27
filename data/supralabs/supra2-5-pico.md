# SupraLabs/Supra2.5-Pico

## Resumen

Supra2.5-Pico es un modelo de lenguaje de 2.982.480 parámetros desarrollado por SupraLabs y publicado el 22 de octubre de 2026 bajo licencia Apache 2.0. Es el miembro más pequeño de la familia Supra2.5: un transformer decoder-only entrenado desde cero sobre 12.000 millones de tokens de texto en inglés con un tokenizador BPE propio de 4.104 tokens. No ha recibido instruction tuning, chat tuning ni alineación de ningún tipo, por lo que se distribuye como modelo base para completado de texto.

Su interés es eminentemente de investigación. Con menos de 3 millones de parámetros obtiene 12,96 puntos en el Intelligence Index de Open SLM Leaderboard, la cifra más alta de la tabla por debajo de 30M de parámetros según el autor, y 4,35 puntos de índice por millón de parámetros. Incorpora decisiones poco habituales a esa escala: GQA con 3 cabezas de consulta y 1 de clave/valor, RoPE parcial sobre la mitad de las dimensiones, atención con XSA y puerta sigmoidea por cabeza, y routing residual softmax sobre las salidas de todos los bloques anteriores.

También destaca su tokenizador: codifica los números con un token de longitud y los dígitos en orden de unidades primero, tanto al codificar como al decodificar, lo que lo convierte en una pieza útil para estudiar representaciones numéricas en modelos pequeños. El contexto entrenado es de solo 1.024 tokens y el modelo solo entiende inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, clase custom `SLMForCausalLM` |
| Parámetros totales | 2.982.480 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantización | No disponible: solo se publican pesos en float32; no hay GGUF ni cuantizaciones oficiales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors`, precisión float32 |
| Tamaño de vocabulario | 4.104 tokens |
| Precisión de entrenamiento | bf16 (evaluación recomendada en float32) |
| Implementación de atención | SDPA |
| Requisito de carga | `trust_remote_code=True` (código en `modeling_slm.py` y `tokenization_pascaline.py`) |
| Descargas / likes | 216 / 13 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con tamaño oculto 144 y tamaño intermedio SwiGLU de 376. La atención usa GQA con 3 cabezas de consulta y una única cabeza de clave/valor, con `head_dim` de 48, RMSNorm por cabeza sobre Q y K, y RoPE parcial aplicado solo a 24 de las 48 dimensiones con θ = 10.000. Sobre la atención se añaden dos mecanismos propios: XSA y una puerta sigmoidea de salida por cabeza. El routing residual se resuelve con una softmax sobre las salidas de todos los bloques anteriores, en lugar de una suma residual convencional. La normalización es RMSNorm con ε = 1e-6 y upcast a fp32, las embeddings están atadas y la normalización de salida también es RMSNorm.

El entrenamiento parte de cero sobre 12.000 millones de tokens de texto en inglés, con un corpus compuesto por openbmb/Ultra-FineWeb, openbmb/Ultra-FineWeb-L3, IFM/TxT360-v2, HuggingFaceTB/cosmopedia, microsoft/orca-math-word-problems-200k y meta-math/MetaMathQA. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación; el autor indica explícitamente que el modelo no está alineado. El tokenizador es un BPE a nivel de byte con 4.096 merges más ocho tokens de longitud (`<|len1|>`…`<|len8|>`); los números se serializan con su token de longitud y sus dígitos en orden de unidades primero, de modo que `62` se convierte en `<|len2|> 2 6`. Cargar el tokenizador con `trust_remote_code=True` reproduce ese comportamiento de forma automática.

## Capacidades

- Completado de texto en inglés: continuación de un prompt dado, sin formato conversacional ni seguimiento de instrucciones.
- Aritmética de pocos dígitos: es la tarea donde el modelo rinde mejor (ArithMark-3, 56,30), favorecida por su tokenizador numérico en orden inverso.
- Elección múltiple simple: HellaSwag 27,66, ARC-Easy 31,65, ARC-Challenge 23,55 y PIQA 56,58 en zero-shot con `acc_norm`.
- Razonamiento de sentido común muy limitado: los resultados están en el entorno de la línea base aleatoria en varias tareas, no se debe esperar razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles; solo inglés.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo thinking o decodificación especulativa: no disponible.

## Casos de uso

- Investigación en arquitecturas de atención: el modelo permite entrenar y evaluar variantes a escala de juguete con un presupuesto de cómputo mínimo, útil para estudiar el efecto de XSA, las puertas sigmoideas por cabeza o el routing residual softmax sobre las salidas de todos los bloques.
- Estudio de tokenización numérica: al serializar los números en orden de unidades primero con token de longitud, sirve como caso de prueba controlado para medir cómo afecta la representación de dígitos a tareas aritméticas en modelos por debajo de 10M de parámetros.
- Baseline en experimentos de eficiencia paramétrica: su métrica de 4,35 puntos de índice por millón de parámetros lo hace útil como referencia barata al comparar técnicas de compresión, poda o destilación.
- Validación de pipelines de evaluación: al ser un checkpoint de ~12 MB en float32, se puede correr en CI con `lm-evaluation-harness` para verificar que los scripts de evaluación y las versiones de la librería no han cambiado, comparando contra las cifras publicadas.
- Pruebas de integración de `trust_remote_code`: sirve para validar flujos de carga de modelos con código custom y tokenizadores no estándar antes de llevar arquitecturas mayores a producción.
- Generación de texto de relleno en entornos con recursos mínimos: con salidas cortas y postproceso, puede producir texto de plantilla en dispositivos sin GPU, aunque la coherencia más allá de una o dos frases no está garantizada.
- Docencia: ejemplo completo y reproducible de un modelo entrenado desde cero, con hiperparámetros, tokenizador y evaluación documentados, adecuado para explicar el ciclo completo de un LLM.

## Benchmarks y rendimiento

Resultados zero-shot con `acc_norm`, sobre los conjuntos de test completos, medidos con `lm-evaluation-harness` y el script ArithMark-3 del leaderboard sobre los pesos en float32 del repositorio:

| Benchmark | Supra2.5-Pico |
|---|---:|
| HellaSwag | 27,66 |
| ARC-Easy | 31,65 |
| ARC-Challenge | 23,55 |
| PIQA | 56,58 |
| ArithMark-3 | 56,30 |
| Intelligence Index | 12,96 |

El Intelligence Index se calcula como `(N(HS,25) + N(ARCavg,25) + N(PIQA,50) + 0,65·N(AM3,25)) / 3,65`, donde `N(v,c) = 100·(v−c)/(100−c)` y `ARCavg` es la media de ARC-Easy y ARC-Challenge.

Comparativa dentro de la clase sub-3M, con cifras del Open SLM Leaderboard o de las model cards respectivas (no remedidas por el autor):

| Modelo | Parámetros | Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Supra2.5-Pico | 2,98M | 12,96 | 27,66 | 31,65 | 23,55 | 56,58 | 56,30 |
| GPT-S3-3M | 2,97M | 9,61 | 27,68 | 34,76 | 23,12 | 57,02 | 39,10 |
| Tokle-3M | 2,91M | 8,91 | 27,20 | 34,85 | 23,98 | 55,01 | 40,80 |
| pulvis-v2 | 2,96M | 8,62 | 27,93 | 31,86 | 22,78 | 56,86 | 37,40 |
| Purrence-3M | 2,99M | 8,49 | 27,81 | 34,55 | 23,63 | 56,64 | 34,80 |
| ZeroS-Micro-v1.0 | 2,87M | 6,49 | 28,46 | 31,27 | 22,01 | 53,86 | 35,60 |

Comparativa dentro del tramo sub-30M, recalculada a partir de las cifras publicadas del leaderboard el 22 de octubre de 2026:

| Modelo | Parámetros | Index |
|---|---:|---:|
| Supra2.5-Pico | 2,98M | 12,96 |
| Supra2-Medium-Instruct | 25,38M | 12,16 |
| ForgePlex-M2.2-10M | 9,99M | 12,12 |
| Supra2-Medium-Base | 25,37M | 12,09 |
| BananaMind-2-Mini | 25,18M | 12,01 |

Eficiencia declarada por el autor:

| Modelo | Parámetros | Index | Index por millón de parámetros |
|---|---:|---:|---:|
| Supra2.5-Pico | 2,98M | 12,96 | 4,35 |
| GPT-S3-3M | 2,97M | 9,61 | 3,23 |
| Tokle-3M | 2,91M | 8,91 | 3,06 |
| TinyBrainBot-10M-Base | 9,90M | 17,61 | 1,78 |
| void.1 | 90,2M | 23,92 | 0,27 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 MB para los pesos en float32 (2.982.480 × 4 bytes), más el caché KV. Con 10 capas, 1 cabeza KV de dimensión 48 y 1.024 tokens de contexto, el caché ronda los 4 MB en float32. En la práctica, el consumo total se sitúa muy por debajo de 1 GB incluyendo el runtime de PyTorch (estimación calculada a partir de los parámetros publicados, no medida).
- GPU recomendadas: no se necesita GPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es sobredimensionada; A100 o H100 no aportan nada a esta escala.
- Cabe en GPU consumer y también en CPU: es viable en Raspberry Pi, portátiles sin GPU y contenedores con poca memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada. No hay soporte oficial documentado en vLLM, TGI, llama.cpp ni Ollama; la conversión a GGUF sería factible por tamaño, pero requeriría implementar la arquitectura custom y el tokenizador, y no está publicada.
- Latencia y throughput: no se han publicado mediciones. Por tamaño, la decodificación en CPU es perfectamente interactiva, pero no hay cifras verificables en la información disponible.
- Nota de evaluación: el autor advierte que se debe evaluar en float32, porque el redondeo a bf16 mueve los logits lo suficiente como para alterar respuestas de elección múltiple ajustadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Index (Open SLM) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Supra2.5-Pico | 2.982.480 | 1.024 | 12,96 | Apache 2.0 | Pesos safetensors en HuggingFace, código custom |
| GPT-S3-3M | 2,97M | no disponible | 9,61 | no disponible | no disponible en la información proporcionada |
| Tokle-3M | 2,91M | no disponible | 8,91 | no disponible | no disponible en la información proporcionada |
| Supra2-Medium-Instruct | 25,38M | no disponible | 12,16 | no disponible | familia SupraLabs |
| TinyBrainBot-10M-Base | 9,90M | no disponible | 17,61 | no disponible | no disponible en la información proporcionada |

Frente a la clase sub-3M, la ventaja se concentra en ArithMark-3 (56,30 frente a 34,80–40,80 del resto) y en el índice agregado; en ARC-Easy y HellaSwag las diferencias con GPT-S3-3M o Tokle-3M son mínimas o desfavorables. Frente a modelos de 10M–25M, el índice absoluto es menor (Supra2-Medium-Instruct 12,16, TinyBrainBot-10M-Base 17,61), pero la eficiencia por parámetro es claramente superior.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning, sin chat tuning y sin alineación: no sigue instrucciones, no mantiene formato de diálogo y no rechaza peticiones dañinas.
- Solo inglés. No hay capacidades multilingües documentadas ni evaluadas.
- Contexto de 1.024 tokens: insuficiente para documentos largos, RAG con pasajes extensos o conversaciones multi-turno.
- Rendimiento cercano al azar en varias tareas: ARC-Challenge 23,55 está por debajo del 25 % esperable en una prueba de cuatro opciones, y HellaSwag 27,66 frente a un 25 % de línea base. No debe interpretarse como razonamiento de sentido común funcional.
- Riesgo alto de alucinación y de degradación rápida de coherencia en generaciones de más de una o dos frases; el ejemplo del autor limita a 64 tokens nuevos con `repetition_penalty` y `no_repeat_ngram_size`.
- Tokenizador no estándar: los números se codifican con token de longitud y dígitos en orden inverso, lo que rompe pipelines que asumen dígitos en orden natural y complica el postproceso de cantidades.
- `trust_remote_code=True` es obligatorio, lo que implica ejecutar código del repositorio (`modeling_slm.py`, `tokenization_pascaline.py`). Conviene auditar ambos ficheros antes de usarlo en producción o en entornos multiusuario.
- Evaluación sensible a la precisión: en bf16 los logits cambian lo suficiente para alterar respuestas límite; usar float32 para cualquier comparación con las cifras publicadas.
- Sesgos: el corpus de entrenamiento (Ultra-FineWeb, TxT360-v2, cosmopedia, orca-math, MetaMathQA) no viene acompañado de análisis de sesgo ni de filtrado de alineación documentado.
- Los benchmarks son autoinformados por el autor y no han sido replicados de forma independiente en la información disponible; las cifras de los modelos comparados provienen del leaderboard o de sus propias model cards.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y copyright, y sin garantías de ningún tipo.
- No hay documentación de red teaming, evaluaciones de seguridad ni pruebas de robustez adversarial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupraLabs/Supra2.5-Pico
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset openbmb/Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset IFM/TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset HuggingFaceTB/cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset meta-math/MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Paper técnico: no disponible
- Blog o demo oficial: no disponible
