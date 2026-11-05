# tablinum/Lite-Beam-1.0-501B-A23B-IQS_XXS

## Resumen

Lite-Beam 1.0 501B A23B IQS_XXS es una cuantización GGUF de 2 bits del modelo `reflection/Beam-1.0-501B-A23B`, un transformer de tipo mixture-of-experts (MoE) con 501.267.612.352 parámetros totales. Lo publica el usuario `tablinum` en HuggingFace y está pensado para ejecutarse en estaciones de trabajo con unos 156 GB de DRAM y dos GPUs modestas, algo impensable con los pesos originales en BF16. El archivo principal ocupa 134,503 GiB y conserva los 256 expertos del modelo base.

La propuesta del autor no es solo la cuantización: añade un sistema de "engram" (tablas de recuperación externas) que, según la model card, mejora la puntuación en el conjunto de evaluación local AA-Omniscience de 16,25 a 23,75 y eleva el subconjunto Software+Law de 18,05 a 40,60. Estos resultados se obtienen con el binario `terrabeam`, que sirve una API compatible con OpenAI y añade pasajes de la librería a cada consulta.

Es relevante ahora porque demuestra que un MoE de 501B puede desplegarse en hardware de gama alta de escritorio con una pérdida de calidad controlada y, según el autor, con recuperación parcial mediante engram. La licencia es Apache-2.0 y el modelo base está etiquetado como `reflection/Beam-1.0-501B-A23B`. Advertencia: los datos de benchmarks proceden de la model card del autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 256 expertos |
| Parametros totales | 501.267.612.352 (501B) |
| Parametros activos | 23B (según el nombre del modelo base, A23B) |
| Longitud de contexto | 32K tokens (límite citado en las evaluaciones del autor); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | GGUF mixta 2 bits: gate/up IQ2_XXS, down IQ2_S, attention Q6_K, router F32; 2,30 bpw |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 501B parámetros totales y 23B activos por token, con 256 expertos. Lite-Beam no es un modelo nuevo: es una cuantización derivada del modelo base, por lo que la arquitectura, los datos de entrenamiento y el proceso de alineación (RLHF/DPO, si lo hubo) corresponden a `reflection/Beam-1.0-501B-A23B`. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas.

La innovación técnica de esta publicación es el mapa de cuantización mixta: se mantienen los 256 expertos con gate/up en IQ2_XXS y down en IQ2_S, mientras que las capas de atención suben a Q6_K y el router se conserva en F32 para no degradar el enrutamiento entre expertos. El autor reporta un tamaño de 134,503 GiB y 2,30 bpw, comparable a la variante Unsloth UD-IQ2_XXS (~134,0 GiB). Además, la model card describe un sistema de "engram": tablas de recuperación (Software+Law y una tabla wiki opcional) que se inyectan en cada consulta a través del runtime `terrabeam`, que sirve una API estilo OpenAI en `http://127.0.0.1:8080/v1`.

## Capacidades

- Generación de texto conversacional y razonamiento de varios pasos, con modo de razonamiento ("minimal reasoning" y "max effort" citados en las evaluaciones).
- Razonamiento matemático y científico: el autor reporta resultados en AIME 2026 y GPQA Diamond con el brazo de engram a máximo esfuerzo.
- Conocimiento factual: evaluación AA-Omniscience y SimpleQA en la model card.
- Generación de código: el modelo base reporta LiveCodeBench en su ficha; esta cuantización no ha ejecutado esa prueba.
- Seguimiento de instrucciones: el modelo base reporta IFBench; esta cuantización no lo ha ejecutado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: el modo de razonamiento con presupuesto de 32K tokens está documentado; el soporte de agentes con herramientas no se detalla.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Memoria persistente opcional mediante `terrabeam --memory long-term`.
- Integración con Open WebUI, Claude Code, Cursor y otros clientes mediante proxy (`terrabeam proxy`).

## Casos de uso

- Despliegue local de un MoE de 501B en una estación de trabajo: con 134,5 GiB de pesos y unos 150 GB de RAM/VRAM, el modelo se sirve con llama.cpp y `terrabeam` en hardware de escritorio de gama alta, sin depender de clústeres de GPUs.
- Asistencia técnica especializada con recuperación: el engram Software+Law eleva la puntuación del subconjunto homónimo de 18,05 a 40,60, por lo que resulta adecuado para consultas jurídicas o de ingeniería de software donde se inyecten pasajes de referencia en cada pregunta.
- Razonamiento matemático de competición: el brazo AIME con engram alcanza 29/30 (96,7%) a máximo esfuerzo y 32K de contexto, útil para resolución de problemas con verificación y reintentos.
- Preguntas de ciencia avanzada: GPQA Diamond con engram reporta 173/198 (87,4%), aplicable a asistencia en investigación con preguntas de nivel posgrado.
- Evaluación de conocimiento factual: el índice AA-Omniscience de 23,75 con engram permite usar el modelo en tareas de respuesta factual con control de incorrecciones (47 → 45 respuestas incorrectas en el test de 400).
- Integración en pipelines existentes: al exponer una API compatible con OpenAI y funcionar como proxy sobre Ollama, LM Studio o vLLM, se puede conectar a Open WebUI, Cursor o Claude Code sin reescribir la capa de aplicación.
- Memoria a largo plazo en asistentes: la opción `--memory long-term` de `terrabeam` permite conversaciones persistentes entre sesiones para asistentes personales o de soporte.

## Benchmarks y rendimiento

Datos de la model card del autor. Las columnas BF16, FP8 y NVFP4 son la referencia publicada por Reflection para el modelo base en un harness distinto; las columnas Q2 base y Q2 + engram son evaluaciones locales del autor y no son comparaciones pareadas entre sí (el base usa pantallas mínimas y el engram usa máximo esfuerzo con 32K).

| Benchmark | BF16 | FP8 | NVFP4 | Q2 base | Q2 + engram |
|---|---:|---:|---:|---:|---:|
| AA-Omniscience index | 10,8 | 8,8 | 9,8 | 16,25 | 23,75 |
| AIME 2026 | 97,7% | 98,0% | 97,5% | 9/30 (30,0%) | 29/30 (96,7%) |
| GPQA Diamond | 90,6% | 90,3% | 89,3% | 92/198 (46,5%) | 173/198 (87,4%) |
| HLE (sin herramientas) | 36,0% | 36,0% | 34,8% | no publicado | 82/560 procesados, 28 correctos (en curso) |
| LiveCodeBench | 88,3% | 88,1% | 87,4% | no ejecutado | no ejecutado |
| IFBench | 79,6% | 80,7% | 79,2% | no ejecutado | no ejecutado |

Desglose del subconjunto Software+Law (133 ítems): 18,05 en base Q2 frente a 40,60 con engram (+22,6, p=0,0001). En el test completo de 400: 38 mejores, 10 peores. SimpleQA-verified dev 200: 6,5 en base frente a 50,5 con el engram wiki opcional. El autor advierte que las filas de GPQA/AIME con engram usan máximo esfuerzo y 32K, mientras que las base usan pantallas mínimas de 512 y 1.024 tokens, por lo que no son comparaciones pareadas.

## Requisitos de hardware

- VRAM/RAM estimada: unos 150 GB de RAM/VRAM según la model card; el archivo GGUF ocupa 134,503 GiB.
- Configuración recomendada por el autor: estación de trabajo con 156 GB de DRAM y dos GPUs pequeñas.
- GPU recomendadas: no se especifican modelos concretos; el autor habla de "two small GPUs". Para referencia, un MoE de este tamaño requiere repartir pesos entre memoria del sistema y VRAM.
- ¿Cabe en GPU de consumo? No en una sola unidad; requiere un sistema con suficiente DRAM y offload parcial a GPU.
- Opciones de despliegue: llama.cpp (formato nativo), `terrabeam` (runtime del autor con API OpenAI-compatible), Ollama, LM Studio y vLLM mediante `terrabeam proxy --upstream`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lite-Beam 1.0 501B A23B IQS_XXS | 501B totales / 23B activos | 32K (en evaluaciones) | Apache-2.0 | GGUF 2 bits mixta | 134,5 GiB; 256/256 expertos; engram opcional |
| Unsloth UD-IQ2_XXS (misma base Beam) | 501B totales / 23B activos | no disponible | Apache-2.0 | GGUF 2 bits | ~134,0 GiB; misma configuración de capas según la tabla del autor |
| reflection/Beam-1.0-501B-A23B (BF16) | 501B totales / 23B activos | no disponible | Apache-2.0 | safetensors | Referencia de calidad; requiere hardware muy superior |

No se dispone de datos de benchmarks independientes para establecer una comparación de rendimiento frente a otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma es `en`; no hay soporte multilingüe declarado.
- Cuantización agresiva de 2 bits: la pérdida de calidad frente a BF16/FP8 es significativa en las pantallas base (por ejemplo, AIME 9/30 frente a 97,7% en BF16), aunque el autor atribuye la recuperación al engram y al máximo esfuerzo.
- Los resultados de benchmarks son del autor, con harness propio, y algunas comparaciones no son pareadas; HLE está incompleto (82/560 procesados) y no debe citarse como puntuación final.
- Riesgo de alucinación: no se documentan tasas específicas; el índice AA-Omniscience mide respuestas correctas e incorrectas, con 45 incorrectas de 400 en el brazo con engram.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Dependencia del runtime `terrabeam` y de las tablas de engram para obtener los resultados reportados; sin ellas, el rendimiento cae a los valores base Q2.
- Requisito de hardware elevado (~150 GB de RAM/VRAM) que excluye equipos de consumo convencionales.
- La instalación recomendada por el autor usa un script descargado por `curl | sh` desde un repositorio de GitHub; conviene revisar el script antes de ejecutarlo en producción.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base `reflection/Beam-1.0-501B-A23B`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tablinum/Lite-Beam-1.0-501B-A23B-IQS_XXS
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Tablas de engram: https://huggingface.co/datasets/tablinum/beam-engram-tables
- Space de resultados: https://huggingface.co/spaces/tablinum/lite-beam-1.0-501b
- Metodología: https://huggingface.co/spaces/tablinum/lite-beam-1.0-501b/blob/main/methodology.html
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Documentación de harnesses: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
