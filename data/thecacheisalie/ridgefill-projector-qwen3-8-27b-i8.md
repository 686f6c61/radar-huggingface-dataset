# TheCacheIsALie/RidgeFill-Projector-Qwen3.8-27B-i8

## Resumen

RidgeFill-Projector-Qwen3.8-27B-i8 no es un modelo de lenguaje, sino un conjunto de mapas de proyección por capa que aceleran la fase de prefill de Qwen3.8-27B en un fork específico de llama.cpp. Lo publica el usuario TheCacheIsALie bajo licencia Apache 2.0 y se apoya en el trabajo *RidgeFill: Training-Free Late-Layer Cache Fill for Faster Prefill* de Dylan Johnston y Robert P Smith (preprint, 2026). El artefacto contiene 48 mapas (capas 16 a 63) que predicen la entrada de cada capa superior a partir del estado que entra en la capa 16, evitando ejecutar esas capas para la mayoría de filas del prompt.

El objetivo es reducir el tiempo hasta el primer token (TTFT) en contextos largos sin reentrenar nada: los mapas se ajustan en forma cerrada con una sola pasada sobre texto de calibración. Según la model card, se obtiene una aceleración de 1,25× a 1,31× entre 16K y 120K tokens, con una degradación de 1,2 a 1,4 puntos en RULER y LongBench v2, con intervalos de confianza al 95 % que incluyen el cero.

El paquete se distribuye como GGUF de 1,45 GB (1.287.096.832 parámetros según safetensors) que debe cargarse junto a un GGUF estándar de Qwen3.8-27B mediante el flag `--ridgefill` del fork. La generación posterior al prompt es exacta; solo el prefill se aproxima, y la salida no es idéntica a la de llama.cpp sin el parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas de proyección ridge por capa (no es un transformer; actúa sobre Qwen3.8-27B) |
| Parametros totales | 1.287.096.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prompts de 8.192 tokens o más para activarse; evaluado hasta 120.000 tokens |
| Tipos de cuantizacion | int8 con una escala bf16 por cada 128 pesos y sesgo bf16; GGUF en formato Q8_0 |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`ridgefill-projector-qwen3.8-27b-i8-S16.gguf`) y safetensors int8 (`proj8.L16` a `proj8.L63`, `correction.safetensors`, `rowsel.safetensors`) |

## Arquitectura y entrenamiento

RidgeFill no entrena pesos: ajusta en forma cerrada un mapa ridge por cada capa superior (16 a 63) a partir de una única pasada sobre texto de calibración. Las capas 0 a 15 se ejecutan exactamente para todas las filas del prompt. Para el resto de filas, salvo una cola exacta y un conjunto seleccionado de filas exactas, los mapas predicen la entrada de las capas 16 a 63 desde el estado que entra en la capa 16; cada capa escribe su caché a partir de la predicción en lugar de ejecutarse completa, manteniendo sin cambios sus propias proyecciones de clave y valor (y, en una capa Gated DeltaNet, su actualización de estado). Los últimos miles de tokens del prompt y todos los pasos de decodificación ejecutan el modelo completo.

El GGUF contiene los 48 mapas en formato Q8_0 de llama.cpp, convertidos desde la release int8 con `convert_ridgefill_to_gguf.py`, más correcciones de estado terminal por capa que la configuración medida no utiliza (`--ridgefill-alpha 0`). La inspiración es DeepSeek-V4.1-Flash, donde la proyección se entrena dentro del modelo, y el Q3-8B-KVA-Projector de kishida, que la readaptó a Qwen3-8B con cabezas de clave y valor entrenadas. No se especifica en la información disponible el volumen ni la composición del corpus de calibración.

## Capacidades

- Aceleración del prefill de Qwen3.8-27B en llama.cpp: reduce el TTFT de 1,25× a 1,31× en contextos de 16K a 120K tokens.
- Funciona con los mapas en VRAM o transmitidos desde host, con distinto coste de memoria adicional.
- Decodificación exacta: todos los pasos de generación ejecutan el modelo completo.
- Compatibilidad con prompts cortos: por debajo de 8.192 tokens la ejecución es exacta (no se aplica la aproximación).
- No soporta modelos draft ni MTP mientras RidgeFill está activado (el fork los rechaza).
- No aporta capacidades nuevas de generación, razonamiento, código, visión ni tool calling por sí mismo: estas dependen íntegramente de Qwen3.8-27B.
- No es un modelo autónomo: requiere cargarse junto a un GGUF no modificado de Qwen3.8-27B.

## Casos de uso

- Servidores de inferencia con prompts largos: desplegar el fork de llama.cpp con `--ridgefill` para reducir el TTFT en cargas con contextos de 16K a 120K tokens, donde la ganancia de 1,25× a 1,31× es más relevante.
- Document QA y resumen sobre corpus extensos: al procesar documentos de decenas de miles de tokens, el prefill acelerado abarata la primera respuesta sin tocar la calidad de la generación posterior.
- RAG con recuperación masiva: cuando se inyectan muchos fragmentos en el prompt, la reducción del coste de prefill mejora la latencia percibida en cada consulta.
- Evaluación de agentes multi-turno con historial largo: el contexto acumulado se prefija más rápido, manteniendo la decodificación exacta para las respuestas.
- Ajuste de capacidad en una sola A100 PCIe de 40 GB: elegir entre mapas en VRAM (hasta 3.014 MiB extra a 120K) o transmitidos desde host (hasta 1.732 MiB) según el margen de memoria disponible.
- Investigación sobre aceleración de inferencia: usar los mapas y el código del repositorio de datos para reproducir los resultados del paper o adaptar la técnica a otros modelos base.
- Despliegue en entornos con GPUs de menor VRAM: la variante transmitida desde host permite aplicar la aceleración con una huella de VRAM reducida a costa de algo de velocidad (1,19× a 1,30×).

## Benchmarks y rendimiento

Medido en una A100 PCIe de 40 GB con CUDA. La referencia es llama.cpp upstream en el commit 1242be66f con los mismos flags, sin RidgeFill. El TTFT es el tiempo de prompt del servidor, mediana de tres peticiones en caliente.

| Contexto | Aceleración, mapas en VRAM | Aceleración, mapas desde host | VRAM extra (VRAM / host) |
|---|---|---|---|
| 16.384 | 1,25× | 1,19× | 1.592 / 268 MiB |
| 32.768 | 1,30× | 1,27× | 1.802 / 478 MiB |
| 65.536 | 1,31× | 1,30× | 2.270 / 944 MiB |
| 120.000 | 1,28× | 1,29× | 3.014 / 1.732 MiB |

| Benchmark | Stock | RidgeFill | Δ [IC 95 %] |
|---|---|---|---|
| RULER 16K, 13 tareas × 20 | 85,69 | 84,51 | −1,19 [−3,13, +0,79] |
| RULER 32K, 13 tareas × 20 | 87,85 | 86,42 | −1,42 [−3,21, +0,35] |
| LongBench v2, CoT oficial, longitud completa, 503 ítems | 38,57 | 37,18 | −1,39 [−4,97, +2,19] |

Tras el prompt, la coincidencia de siguiente token con stock sobre 100 documentos de LongBench v2 por longitud es del 94,6 % a 16K y del 93,6 % a 32K, con KL mediana de 0,0040 y 0,0042 nats por token.

## Requisitos de hardware

- VRAM extra para los mapas: entre 1.592 y 3.014 MiB si residen en VRAM (16K a 120K de contexto), o entre 268 y 1.732 MiB si se transmiten desde host.
- La VRAM total debe sumar la del GGUF de Qwen3.8-27B (por ejemplo, `Qwen3.8-27B-UD-Q4_K_XL.gguf` de unsloth) más la de los mapas.
- GPU de referencia en las mediciones: A100 PCIe de 40 GB. No se han publicado mediciones en otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del GGUF base y del margen de VRAM tras cargarlo.
- Despliegue: exclusivamente mediante el fork `Approximate-Science/llama.cpp-ridgefill` con `llama-server` y el flag `--ridgefill`; requiere compilar el fork y seguir `RIDGEFILL.md`.
- No compatible con modelos draft ni MTP mientras RidgeFill está activo.
- Latencia y throughput: solo se publica el TTFT (aceleración de 1,19× a 1,31×); no hay datos de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RidgeFill-Projector-Qwen3.8-27B-i8 | Mapas de proyección int8/GGUF | Qwen3.8-27B | Mapas ridge en forma cerrada, sin entrenamiento | apache-2.0 | Hugging Face, 735 descargas |
| Q3-8B-KVA-Projector (kishida) | Proyector retroadaptado | Qwen3-8B | Cabezas de clave y valor entrenadas | no disponible | no disponible |
| DeepSeek-V4.1-Flash | Modelo con proyección integrada | propio | Proyección entrenada dentro del modelo | no disponible | no disponible |

La comparación con modelos de lenguaje completos del mismo tamaño no aplica: este artefacto no genera texto por sí mismo y su rendimiento debe evaluarse como complemento de Qwen3.8-27B.

## Limitaciones y advertencias

- La salida no es idéntica a la de llama.cpp estándar: la aproximación del prefill introduce una degradación medible de 1,2 a 1,4 puntos en RULER y LongBench v2, aunque los intervalos al 95 % incluyen el cero.
- Solo acelera el prefill; la decodificación no gana velocidad y ejecuta el modelo completo.
- Requiere el fork de llama.cpp: no funciona con llama.cpp upstream, vLLM, TGI, Ollama ni otras herramientas de despliegue.
- Incompatible con modelos draft y MTP mientras está activado, lo que impide combinarlo con decodificación especulativa.
- Prompts por debajo de 8.192 tokens no se benefician (ejecución exacta).
- Los benchmarks se limitan a una A100 PCIe de 40 GB; el comportamiento en otras GPU no está documentado.
- El repositorio tiene 0 likes y 735 descargas, y la publicación procede de un autor individual: conviene validar en el propio entorno antes de producción.
- Los idiomas soportados no se declaran; dependen del modelo base Qwen3.8-27B.
- La licencia Apache 2.0 cubre el artefacto, pero el uso comercial está sujeto también a la licencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/TheCacheIsALie/RidgeFill-Projector-Qwen3.8-27B-i8
- Repositorio de datos y código: https://github.com/Approximate-Science/ridgefill-data
- Fork de llama.cpp: https://github.com/Approximate-Science/llama.cpp-ridgefill
- Instrucciones del fork: https://github.com/Approximate-Science/llama.cpp-ridgefill/blob/main/RIDGEFILL.md
- Paper (preprint): https://doi.org/10.5281/zenodo.23890247
- Nota técnica anterior: https://doi.org/10.5281/zenodo.23179168
- GGUF base de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Perfil del autor: https://huggingface.co/TheCacheIsALie
