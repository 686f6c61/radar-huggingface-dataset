# stephenchungmh/pocketrl

## Resumen

PocketRL es una familia de modelos de razonamiento matemático obtenidos mediante aprendizaje por refuerzo con recompensas verificables (RLVR) sobre modelos base de la familia Qwen. La publica el autor stephenchungmh a partir de la investigación del proyecto DualverseAI, y su principal novedad no es el modelo en sí, sino el método de entrenamiento: un pipeline de RLVR de bajo coste y bajo consumo de memoria que permite entrenar un modelo de 7B en una única GPU RTX 5090 en 7,3 horas por unos 4,71 dólares.

El repositorio agrupa tres variantes —PocketRL-1.5B, PocketRL-7B y PocketRL-27B— construidas respectivamente sobre Qwen2.5-Math-1.5B, Qwen2.5-Math-7B y Qwen3.8-27B. Todas se especializan en resolución de problemas matemáticos con razonamiento paso a paso y respuesta final en formato `\boxed{}`. La relevancia actual reside en que demuestra que es posible igualar o superar a modelos RLVR publicados con presupuestos cientos de veces mayores: el 7B alcanza una media de 43,0 en seis conjuntos de matemáticas frente a 42,1 de la media de modelos 7B comparables, con un coste estimado de 4,71 dólares frente a 598 dólares.

La arquitectura subyacente es la de los transformers densos de Qwen (no se documenta una arquitectura propia), con licencia Apache 2.0, pesos en safetensors y soporte para `transformers` y vLLM. El modelo está entrenado y evaluado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-Math / Qwen3.8); no se documenta arquitectura propia |
| Parametros totales | 1,5B / 7B / 27B (tres variantes) |
| Parametros activos | No aplica (modelos densos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; los pesos se distribuyen en safetensors (BF16). El método de entrenamiento usa pesos de 16 bits con residuo de redondeo empaquetado de 4 bits (8 bits en el 1.5B) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

Los modelos parten de checkpoints Qwen ya entrenados (Qwen2.5-Math-1.5B, Qwen2.5-Math-7B y Qwen3.8-27B) y se afinan con RLVR usando Dr. GRPO. Cada actualización muestrea 16 preguntas del conjunto de entrenamiento de MATH (niveles 3 a 5, 8.552 problemas), genera ocho respuestas por pregunta de hasta 3.000 tokens a temperatura 1, las corrige con el grader de respuestas `\boxed{}` de Dr. GRPO y aplica una actualización con learning rate 1e-6. El 1.5B recibió 700 actualizaciones (semilla 7), el 7B 500 (semilla 101) y el 27B 100 (semilla 42).

La innovación técnica está en la eficiencia de memoria del entrenamiento. Por un lado, **ActGRA** proyecta el gradiente de cada capa sobre una base de rango 128 ajustada a las activaciones de entrada de la capa mediante factorización QR, refrescada cada ocho actualizaciones, y mantiene el estado de Adam solo para el gradiente proyectado: en el 7B, la memoria del optimizador baja de 56,7 GiB a 0,6 GiB. Por otro, se sustituye la copia maestra de pesos en 32 bits por **pesos de 16 bits con un residuo de redondeo empaquetado** (4 bits por peso, 8 bits en el 1.5B) que conserva la parte de cada actualización perdida en el redondeo a BF16; generación y entrenamiento comparten los mismos pesos. En conjunto, la memoria persistente de entrenamiento en el 7B cae de 113 GiB a 18 GiB. Los métodos centrales se descubrieron con un agente de investigación autónomo en rStation y fueron seleccionados y verificados por investigadores humanos.

## Capacidades

- Generación de texto con razonamiento matemático paso a paso, con respuesta final delimitada en `\boxed{}`.
- Resolución de problemas de competición: aritmética, álgebra, geometría, teoría de números y combinatoria de nivel MATH 3-5, AIME, AMC, Minerva y OlympiadBench.
- Razonamiento de cadena larga: genera hasta 3.000 tokens por respuesta durante el entrenamiento.
- Compatible con el pipeline `text-generation` de `transformers` y con inferencia en vLLM.
- Endpoints compatibles según los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- **Tutoría matemática automatizada**: el modelo genera soluciones paso a paso con la respuesta final en formato verificable, lo que permite corregir automáticamente la salida y usarla en plataformas de aprendizaje con feedback inmediato.
- **Generación de datos sintéticos para entrenamiento**: al producir razonamientos largos y respuestas verificables, sirve para crear datasets de matemáticas para destilar o afinar otros modelos, con la ventaja de que la corrección es programática.
- **Evaluación de pipelines de RLVR**: el repositorio incluye el código de entrenamiento, de modo que un equipo puede reproducir el 7B en una sola RTX 5090 y usarlo como referencia para validar sus propias implementaciones de GRPO o Dr. GRPO.
- **Investigación académica con presupuesto limitado**: el 1.5B se entrena en 8,2 horas en una RTX 5090 por unos 5,31 dólares, lo que hace viable experimentar con RLVR en un laboratorio pequeño o en una sola estación de trabajo.
- **Verificación de razonamientos en producción**: integrado en un pipeline que compruebe la respuesta `\boxed{}` contra un solver simbólico, puede usarse para detectar errores en cadenas de razonamiento generadas por otros sistemas.
- **Preprocesamiento de problemas matemáticos en herramientas educativas**: dado un enunciado en inglés, el modelo produce una solución completa que puede mostrarse al usuario o almacenarse como explicación de referencia.
- **Benchmark interno de modelos de razonamiento**: sus resultados publicados en seis conjuntos permiten usarlo como línea base barata al comparar modelos de matemáticas de tamaño similar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (avg@8, temperatura 1, %). La primera tabla corresponde a la semilla publicada; la segunda, a la media de tres semillas del paper.

| Modelo | MATH-500 | AIME 2024 | AIME 2025 | AMC 2023 | Minerva | Olympiad | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-Math-1.5B (base) | 21,9 | 2,5 | 1,7 | 16,3 | 5,4 | 12,6 | 10,0 |
| **PocketRL-1.5B** | 70,0 | 10,8 | 8,5 | 47,5 | 27,1 | 33,8 | 32,9 |
| Media de modelos 1.5B publicados | 69,0 | 14,8 | 9,0 | 45,9 | 27,6 | 32,6 | 33,2 |
| Qwen2.5-Math-7B (base) | 30,2 | 10,8 | 2,5 | 20,0 | 7,2 | 9,5 | 13,4 |
| **PocketRL-7B** | 79,9 | 23,9 | 12,5 | 63,2 | 36,4 | 42,0 | 43,0 |
| Media de modelos 7B publicados | 77,7 | 24,0 | 12,1 | 62,0 | 36,0 | 40,5 | 42,1 |
| Qwen3.8-27B (base) | 80,8 | 25,8 | 25,4 | 66,6 | 41,2 | 47,4 | 47,9 |
| **PocketRL-27B** | 94,3 | 51,1 | 44,3 | 86,4 | 49,8 | 62,5 | 64,7 |

Resultados de la semilla publicada en el `model-index` (MATH-500, avg@8, T=1): PocketRL-1.5B 70,7; PocketRL-7B 78,8; PocketRL-27B 95,0. Los modelos 1.5B comparables son Oat-Zero y ExGRPO; los 7B, RePO-Zero, Oat-Zero, SimpleRL-Zoo, PRIME-Zero, ExGRPO y GPG-Zero.

Coste y recursos de entrenamiento declarados:

| Modelo | GPUs | Tiempo | Coste estimado | Pico GiB/GPU |
|---|---|---|---:|---:|
| PocketRL-1.5B | 1× RTX 5090 | 8,2 h | 5,31 $ | 15,8 |
| PocketRL-7B | 1× RTX 5090 | 7,3 h | 4,71 $ | 22,5 |
| PocketRL-27B | 4× RTX 5090 | 9,1 h | 23,53 $ | 31,1 |

## Requisitos de hardware

- **Entrenamiento**: 1× RTX 5090 para el 1.5B (15,8 GiB de pico) y el 7B (22,5 GiB de pico); 4× RTX 5090 para el 27B (31,1 GiB de pico por GPU). El 7B cabe por tanto en una GPU de consumo de 32 GB.
- **Inferencia**: no se publican cifras de VRAM de inferencia. Como referencia de orden de magnitud, los pesos en BF16 ocupan aproximadamente 3 GB (1.5B), 14 GB (7B) y 54 GB (27B), a lo que hay que sumar la caché KV para contextos de hasta 3.000 tokens de generación.
- **GPU recomendadas**: RTX 5090 (entrenamiento e inferencia), A100/H100 para servir el 27B con holgura. El 1.5B y el 7B son aptos para GPU de consumo; el 27B requiere múltiples GPU o cuantización para caber en una sola tarjeta de 24-32 GB.
- **Despliegue**: vLLM es la vía documentada en la model card (`SamplingParams(temperature=1.0, max_tokens=3000)`); también es compatible con `transformers`. No se documentan instrucciones para llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (media 3 semillas) | Media seis conjuntos | Licencia | Coste de entrenamiento |
|---|---|---:|---:|---:|---|---:|
| PocketRL-1.5B | 1,5B | No disponible | 70,0 | 32,9 | Apache 2.0 | 5,31 $ |
| Media de 1.5B publicados (Oat-Zero, ExGRPO) | 1,5B | No disponible | 69,0 | 33,2 | No disponible | 394 $ |
| PocketRL-7B | 7B | No disponible | 79,9 | 43,0 | Apache 2.0 | 4,71 $ |
| Media de 7B publicados (RePO-Zero, Oat-Zero, SimpleRL-Zoo, PRIME-Zero, ExGRPO, GPG-Zero) | 7B | No disponible | 77,7 | 42,1 | No disponible | 598 $ |
| PocketRL-27B | 27B | No disponible | 94,3 | 64,7 | Apache 2.0 | 23,53 $ |

La ventaja de PocketRL no está en superar ampliamente a los modelos comparables en precisión —las diferencias en la media de seis conjuntos son de décimas en 1.5B y 7B—, sino en lograr resultados equivalentes con un coste de entrenamiento dos órdenes de magnitud menor.

## Limitaciones y advertencias

- **Dominio restringido**: entrenados exclusivamente con problemas de MATH niveles 3-5; el rendimiento fuera de matemáticas de competición no está evaluado y previsiblemente será pobre.
- **Solo inglés**: la model card declara únicamente `en`; no hay evaluación en castellano ni en otros idiomas.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir cadenas de razonamiento plausibles con resultados incorrectos; el formato `\boxed{}` facilita la verificación automática, pero no la garantiza.
- **Sesgos**: no se documenta ningún análisis de sesgos, toxicidad o seguridad.
- **Resultados no verificados**: las métricas del `model-index` figuran con `verified: false` y proceden del propio autor; los conjuntos AIME y AMC son pequeños, por lo que la varianza entre semillas es alta (el paper reporta medias de tres semillas distintas de las de la semilla publicada).
- **Contexto no documentado**: se desconoce la longitud máxima de contexto soportada; el entrenamiento usa respuestas de hasta 3.000 tokens, lo que sugiere un uso previsto de generación larga pero acotada.
- **Licencia**: Apache 2.0 permite uso comercial, pero se heredan las condiciones de los modelos base Qwen; conviene revisar la licencia de cada checkpoint de origen.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- **Tamaño del repo**: 72,1 GB, ya que aloja las tres variantes en carpetas separadas; descargar solo la carpeta necesaria con `allow_patterns`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stephenchungmh/pocketrl
- Carpeta PocketRL-1.5B: https://huggingface.co/stephenchungmh/pocketrl/tree/main/PocketRL-1.5B
- Carpeta PocketRL-7B: https://huggingface.co/stephenchungmh/pocketrl/tree/main/PocketRL-7B
- Carpeta PocketRL-27B: https://huggingface.co/stephenchungmh/pocketrl/tree/main/PocketRL-27B
- Código: https://github.com/dualverse-ai/pocketrl
- Página del proyecto: https://dualverse-ai.github.io/pocketrl/
- Paper (PDF): https://github.com/dualverse-ai/pocketrl/blob/main/docs/pocketrl.pdf
- Resultados por modelo: https://github.com/dualverse-ai/pocketrl#main-results
- Quickstart: https://github.com/dualverse-ai/pocketrl#quickstart
- rStation: https://rstation.ai/
- Programa de investigación autónoma de DualverseAI: https://dualverse.ai/auto_research
- Modelo base Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
