# tashfene/Overbrilliant-27B-Air-GGUF

## Resumen

Overbrilliant-27B-Air es una compilación GGUF de 9,5 GB del modelo Qwen3.8-27B (26.895.998.464 parámetros, licencia Apache-2.0) publicada por Tashfeen Ahmed (usuario `tashfene`). Su objetivo es hacer viable un modelo de clase 27B en el equipo local más común del ecosistema: un portátil Apple Silicon con 16 GB de memoria unificada, manteniendo una ventana de contexto de 32.768 tokens y un consumo medido de 10,2 GiB en Metal con llama.cpp.

El problema que aborda es concreto: la cuantización agresiva de Qwen3.8-27B degrada el razonamiento largo porque la arquitectura es híbrida (48 capas Gated DeltaNet con estado recurrente de tamaño fijo y 16 capas de atención con caché KV), y los errores en las capas recurrentes se propagan a todos los tokens posteriores. La propuesta del autor es partir de la cuantización dinámica de ~2,9 bits de unsloth (UD-Q2_K_XL), eliminar el bloque de predicción multi-token no utilizado y "curar" el modelo con un LoRA de rango 32 entrenado por destilación on-policy desde el modelo bf16.

El resultado es relevante porque invierte la relación habitual entre cuantización y capacidades: en las pruebas emparejadas del autor, la versión cuantizada obtiene mejor tool calling que el modelo bf16 original (BFCL v3: 89,0 % frente a 86,2 %) y no muestra diferencia estadísticamente significativa en programación competitiva (LiveCodeBench: 57,5 % frente a 60,9 %, p = 0,56). Es, por tanto, un artefacto de despliegue local con un método de cuantización documentado, no una simple conversión a GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet (estado recurrente de tamaño fijo) + 16 capas de atención con caché KV; transformer con bloque de predicción multi-token (MTP) eliminado en esta build |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No disponible (la información no indica que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens (32k) en la edición Air; hasta 64k en la edición Pro (24 GB o más) |
| Tipos de cuantización | GGUF derivado de UD-Q2_K_XL de unsloth (~2,9 bits dinámicos), proyección de salida en Q3_K, caché KV q4_0; equivalente calculado de ~2,8 bits por parámetro |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Overbrilliant-27B-Air.gguf`, 8,67 GiB) + adaptador LoRA GGUF (`adapter/Overbrilliant-27B-Air-heal-lora.gguf`, 0,19 GiB, rango 32) |

## Arquitectura y entrenamiento

Qwen3.8-27B, el modelo base, es un transformer híbrido en el que la mayor parte de las capas (48 de 64) son Gated DeltaNet, un mecanismo recurrente con estado de tamaño fijo que no crece con el contexto, mientras que 16 capas mantienen atención clásica con caché KV. Esa asimetría explica el perfil de memoria de la build: el coste de la caché KV solo depende de 16 capas, de ahí que pasar de 8k a 32k de contexto añada apenas ~0,4 GiB (9,8 GiB a 10,2 GiB). También explica el modo de fallo: un error de cuantización en las capas recurrentes contamina todos los tokens siguientes, mientras que en atención queda más localizado.

El proceso de construcción tiene cuatro pasos documentados. Primero se parte de la cuantización dinámica de 2,9 bits de unsloth (UD-Q2_K_XL). Segundo, se recorta para encajar en 16 GB: se elimina el bloque MTP no utilizado (−0,33 GiB) y se almacena la proyección de salida en Q3_K (−0,15 GiB). Tercero, se aplica un LoRA de rango 32 entrenado por destilación on-policy desde el modelo bf16 sobre las propias salidas del modelo cuantizado, que corrige tanto las capas feed-forward como las proyecciones recurrentes de Gated DeltaNet; el entrenamiento ve exactamente los pesos cuantizados que se distribuyen. Cuarto, se adopta caché KV de 4 bits (q4_0), que según las pruebas del autor no tuvo coste medible en LiveCodeBench. El autor afirma que curar las capas recurrentes recupera tanta precisión en código difícil como darles 2 GB adicionales de precisión, y remite al artículo *Heal the Memory, Not the Bits* para el detalle metodológico. No se especifican en la información disponible el volumen de tokens de entrenamiento del LoRA ni la composición del dataset de destilación.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento heredado del modelo base.
- Tool calling y function calling; es la capacidad donde la build supera al modelo bf16 según las pruebas del autor (BFCL v3).
- Programación competitiva y resolución de problemas de código de dificultad media y alta (LiveCodeBench, 200 problemas con contexto de 8k).
- Recuperación en contexto largo: respondió correctamente a una pregunta de retrieval sobre un prompt de 29.495 tokens.
- Razonamiento multi-paso y uso en agentes, heredado de Qwen3.8-27B; el autor menciona soporte de function calling como etiqueta del modelo.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas de HuggingFace).
- No se documentan capacidades de visión, audio ni multilingües; el modelo declara únicamente inglés.

## Casos de uso

- Asistente de código en local para portátiles de 16 GB: con 32k de contexto y 10,2 GiB de consumo, permite autocompletado y refactorización sobre archivos completos sin enviar código a la nube, algo crítico en entornos con requisitos de confidencialidad.
- Agentes con tool calling en estación de trabajo: al obtener 89,0 % en BFCL v3, es adecuado para orquestar llamadas a APIs, consultas a bases de datos o ejecución de comandos dentro de un bucle agéntico, incluso por encima del modelo bf16 en esa tarea.
- Automatización de tareas de CI/CD: integrado en un `llama-server` local, puede generar parches y revisiones de código en un runner sin GPU dedicada, siempre que el runner tenga suficiente memoria unificada o VRAM.
- Análisis de documentación técnica extensa: la ventana de 32k y el rendimiento verificado en retrieval a ~29,5k tokens permiten resumir manuales, contratos o especificaciones largas en una sola pasada.
- Prototipado e investigación sobre cuantización: el paquete incluye el adaptador LoRA de curación y la metodología descrita, lo que lo convierte en un caso de estudio reproducible para medir el efecto de la cuantización en capas recurrentes frente a capas de atención.
- Asistencia en resolución de problemas algorítmicos: con 72,0 % en problemas de dificultad media de LiveCodeBench, es útil como tutor o generador de soluciones en entornos de formación y entrevistas técnicas.
- Despliegue en GPU de 12 GB: la edición Air está pensada también para tarjetas de 12 GB con contexto de 16k a 32k (9,9–10,2 GiB por cálculo, aunque el autor indica que no se ha probado en ese hardware).

## Benchmarks y rendimiento

| Modelo | Tamaño | Memoria a 32k | BFCL v3 (600 tareas) | LiveCodeBench (200, 8k) |
|---|---|---|---|---|
| Qwen3.8-27B bf16 (original) | 54,7 GB | No disponible | 86,2 | 60,9 |
| unsloth UD-Q2_K_XL (punto de partida) | 9,8 GB | ~10,9 GiB | 87,2 | 55,0 |
| Overbrilliant-27B-Pro | 12,0 GB | 14,6 GiB | 90,0 | 57,5 |
| Overbrilliant-27B-Air | 9,5 GB | 10,2 GiB | 89,0 | 57,5 |

Datos adicionales aportados por el autor: en problemas de dificultad media de LiveCodeBench, Air obtiene 72,0 % frente a 68,0 % de bf16; la diferencia global en LiveCodeBench (−2,1 puntos, p = 0,56) no es significativa, mientras que la mejora en BFCL v3 (+2,8 puntos, p = 0,006, test de McNemar emparejado) sí lo es. Todas las comparaciones son emparejadas problema a problema contra el modelo bf16 con decodificación greedy. No se han ejecutado HumanEval+ ni MBPP+ para esta build exacta.

Memoria por longitud de contexto (medida o calculada por el autor):

| Contexto | Air (KV q4_0) | Pro (MTP, KV q8_0) |
|---|---|---|
| 8k | ~9,8 GiB | ~13,7 GiB |
| 16k | ~9,9 GiB | ~14,0 GiB |
| 32k | 10,2 GiB (medido) | 14,6 GiB (medido) |
| 64k | ~10,7 GiB (límite del Mac de 16 GB) | 15,9 GiB (medido) |

## Requisitos de hardware

- VRAM/memoria estimada: 10,2 GiB a 32k de contexto en la edición Air (medido con llama.cpp sobre Metal); ~9,9 GiB a 16k y ~10,7 GiB a 64k. Los 9,5 GB del repo incluyen pesos (8,67 GiB) y adaptador (0,19 GiB).
- Apple Silicon: destinado a Macs de 16 GB (M1–M4), que por defecto ceden ~10,7 GB a la GPU; el autor indica que no hacen falta ajustes de `sysctl`, pero recomienda cerrar aplicaciones que consuman mucha memoria para usar los 32k completos.
- GPU consumer: válido en tarjetas de 12 GB con contexto de 16k–32k (cálculo del autor, sin probar); en tarjetas de 16 GB (RTX 4080, RTX 5070 Ti, RX 7800 XT) el autor recomienda la edición Pro. Por debajo de 8 GB, el modelo no cabe.
- GPU de datacenter: no se proporcionan datos específicos para A100 o H100; la evaluación de precisión se hizo con llama.cpp sobre CUDA.
- Opciones de despliegue: llama.cpp (`llama-server`) es la ruta documentada, con `-ngl 99 -fa on -c 32768 -ctk q4_0 -ctv q4_0 --jinja` y el adaptador cargado con `--lora`. Los runtimes que no soportan LoRA ejecutarán solo el modelo base, con puntuaciones inferiores. No se confirma en la información disponible el soporte de vLLM, TGI u Ollama para esta build concreta.
- Latencia y throughput: el autor indica explícitamente que no reporta velocidad; no hay datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria a 32k | BFCL v3 | LiveCodeBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Overbrilliant-27B-Air | 26,9 B | 32k | 10,2 GiB | 89,0 | 57,5 | Apache-2.0 | GGUF + LoRA en HF |
| Overbrilliant-27B-Pro | 26,9 B (base) | 32k–64k | 14,6 GiB | 90,0 | 57,5 | Apache-2.0 | GGUF + LoRA en HF |
| unsloth UD-Q2_K_XL | 26,9 B (base) | Según runtime | ~10,9 GiB | 87,2 | 55,0 | Apache-2.0 | GGUF en HF |
| Qwen3.8-27B bf16 | 26,9 B | Según runtime | No disponible (54,7 GB de pesos) | 86,2 | 60,9 | Apache-2.0 | Pesos bf16 en HF |

La comparación con modelos de otras familias (por ejemplo, alternativas ternarias de 27B) no está disponible en la información proporcionada, y los resultados de búsqueda obtenidos corresponden a un modelo distinto, por lo que no se incluyen aquí.

## Limitaciones y advertencias

- Una sola ejecución greedy por problema: el autor advierte que "sin diferencia significativa" no equivale a igualdad de rendimiento.
- El tool calling se midió sobre un subconjunto de 600 tareas de BFCL v3 con un comprobador AST propio, no con el harness oficial, por lo que los valores no son directamente comparables con los publicados oficialmente.
- La precisión se evaluó con llama.cpp sobre CUDA, mientras que la memoria y la prueba de contexto largo se hicieron sobre Apple Metal; no se ha ejecutado en un Mac físico de 16 GB.
- No se reportan métricas de velocidad, latencia ni throughput.
- El adaptador LoRA es parte integral del modelo: sin `--lora`, la calidad cae. Los runtimes que no cargan LoRA degradan el resultado.
- Idiomas: solo inglés; no hay soporte multilingüe declarado.
- Contexto: 32k en la edición Air; llegar a 64k roza el límite de memoria de un Mac de 16 GB y requiere cerrar aplicaciones pesadas.
- La cuantización a ~2,8 bits efectivos implica una pérdida de precisión no medida en todas las tareas (HumanEval+ y MBPP+ no se han ejecutado); el propio autor documenta una caída de 3,4 puntos en LiveCodeBench respecto a bf16, aunque no significativa estadísticamente.
- No se documentan evaluaciones de sesgo, toxicidad ni alineación para esta build; el comportamiento en producción hereda los riesgos del modelo base Qwen3.8-27B.
- Licencia Apache-2.0 en pesos y adaptador, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y de la cuantización de partida de unsloth.
- Modelo con 0 descargas y 0 likes en el momento de la consulta y publicado en 2026: no existeValidación externa independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tashfene/Overbrilliant-27B-Air-GGUF
- Edición Pro: https://huggingface.co/tashfene/Overbrilliant-27B-Pro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de partida (unsloth): https://huggingface.co/unsloth
- Artículo citado por el autor: *Heal the Memory, Not the Bits* (Ahmed, 2026); no se proporciona URL en la información disponible.

Nota sobre la búsqueda web: los resultados obtenidos (theresanaiforthat.com/model/bonsai-27b/, the-decoder.com/bonsai-27b-is-a-full-open-reasoning-model-that-fits-on-an-iphone/, youtube.com/live/5cylN-ZzA0k, aireiter.com/blog/bonsai-27b-on-phone) corresponden a Bonsai 27B de PrismML, un modelo basado en Qwen3.6-27B con cuantización ternaria, distinto del que trata esta ficha. No se han utilizado como fuente ni se han incluido sus datos.
