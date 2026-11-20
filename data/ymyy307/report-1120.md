# ymyy307/report-1120

## Resumen

El repositorio `ymyy307/report-1120` no contiene un modelo de IA en el sentido habitual, sino un informe técnico de benchmarks sobre gestión de memoria (memory management) en pipelines de generación de vídeo de múltiples tomas (multi-shot). El documento compara distintas alternativas de gestión de memoria de vídeo y audio —selectores propios, bancos de memoria nativos y agentes orquestadores basados en VLM— midiendo el tiempo medio por toma evaluada, excluyendo explícitamente la decodificación VAE de vídeo y audio.

El informe se centra en el caso `worker_01_tier3` de 24 tomas y establece un protocolo de medición unificado sobre una pila concreta: Python 3.11.15, PyTorch 2.9.1+cu128, Transformers 5.15.0 y Triton 3.5.1. La métrica reportada es el tiempo medio de gestión de memoria por toma evaluada, calculado como `[shot0 write + sum(shot1..23 read/agent/write)] / 23`, manteniendo la codificación VAE de memoria (encode) pero excluyendo la decodificación VAE de generación.

El interés del documento es metodológico: corrige el alcance de una cifra previamente publicada (el `0.996 s/shot` de JoyAI-Echo 1.5, que no incluye el agente Director) y documenta con detalle los fallos de validación de los agentes completos (H3Director, HyperFlow-Infinity y Echo Director Agent), incluyendo tiempos por fase, número de invocaciones VLM y picos de memoria de GPU del servicio Qwen. No se trata de pesos de un modelo entrenado, sino de un artefacto de evaluación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de benchmark, no modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de informe) |

## Arquitectura y entrenamiento

No aplica en sentido estricto: el repositorio no publica pesos ni describe un proceso de entrenamiento. Lo que documenta es un protocolo de evaluación comparativa sobre un caso concreto (`worker_01_tier3`, 24 tomas) ejecutado sobre una pila de software fijada: Python 3.11.15, PyTorch 2.9.1+cu128, Transformers 5.15.0 y Triton 3.5.1. La métrica se define como el tiempo medio por toma evaluada, agregando la escritura de la toma 0 y las lecturas, llamadas al agente y escrituras de las tomas 1 a 23, dividido entre 23.

La innovación metodológica del informe es la separación estricta de costes: se excluye la decodificación VAE de vídeo y audio posterior a la generación, se mantiene la codificación VAE necesaria para la memoria (por ejemplo, la codificación de fotogramas a latentes de selector/merger, la codificación de fotogramas de memoria en JoyAI-Echo 1.0 y la codificación de memoria de audio en JoyAI-Echo 1.5) y se distingue explícitamente la decodificación con PyAV/FFmpeg del vídeo (que no es VAE decode y se ejecuta una sola vez antes de iniciar el cronómetro). Además, se ofrece una ablación secundaria que resta también la codificación VAE de memoria, con la advertencia de que ese no es el cómputo completo de gestión de memoria.

## Capacidades

- Medición comparativa del tiempo de gestión de memoria por toma en pipelines de vídeo multi-shot.
- Separación de costes entre gestión de memoria, codificación VAE y decodificación VAE.
- Documentación de ablaciones: resultados con y sin codificación VAE de memoria.
- Registro detallado de fallos de validación de agentes orquestadores basados en VLM (H3Director, HyperFlow-Infinity, Echo Director Agent).
- Desglose por fase de los agentes: análisis de contexto, dirección, escritura de partes, escritura de scene-graph, escritura de identity-bank, selección de personajes, selección de representantes y transiciones de escena.
- Registro de número de invocaciones VLM, tiempos medios y picos de memoria de GPU del servicio Qwen.
- Reproducibilidad parcial: se indica la pila de software exacta y el caso de evaluación.
- No incluye capacidades de generación de texto, código, visión ni tool calling propias de un modelo.

## Casos de uso

- Evaluación de arquitecturas de memoria en generación de vídeo multi-shot: permite comparar selectores propios, bancos de memoria nativos y agentes VLM bajo una misma métrica y pila de software, aislando el coste de gestión del coste de generación.
- Dimensionamiento de infraestructura para agentes VLM: los picos de memoria del servicio Qwen reportados (66671 MiB, 67311 MiB y 72209 MiB según el agente) sirven para estimar requisitos de GPU en despliegues con orquestación multi-agente.
- Análisis de coste por fase en pipelines agénticos: el desglose de H3Director (46.816 s en 4 análisis, 144.800 s en 1 dirección, 1083.451 s en 24 escrituras de parte) permite identificar cuellos de botella y decidir qué fases paralelizar o cachear.
- Auditoría de robustez de validadores: la documentación de fallos (shot2 rechazado por reutilización de índice de candidato entre identidades; fallo en la toma 21 por node id desconocido `subject_1`) es útil para diseñar reintentos y validadores más tolerantes.
- Corrección de métricas publicadas: el informe aclara que `0.996 s/shot` corresponde solo al banco de memoria nativo con MSST y no al agente Director completo, lo que evita comparaciones engañosas en publicaciones y presentaciones.
- Diseño de experimentos de ablación: la tabla que resta también la codificación VAE de memoria (por ejemplo, 0.305 s/shot para H3 original 33B + selector propio) sirve como referencia para aislar el coste algorítmico puro del selector.
- Reproducción de benchmarks en investigación: la fijación de versiones de Python, PyTorch, Transformers y Triton facilita replicar las mediciones en otros entornos.

## Benchmarks y rendimiento

Tiempo medio de gestión de memoria por toma evaluada, sin decodificación VAE (s/ evaluación de toma):

| Método | Tiempo (s/toma) | Notas |
|---|---:|---|
| H3 original 33B + selector propio | 17.587 | Incluye dos rondas de codificación VAE de fotogramas de memoria |
| H3 SFT+RL + selector propio | 17.910 | Incluye dos rondas de codificación VAE de fotogramas de memoria |
| JoyAI-Echo 1.0 base + selector LTX | 4.739 | Incluye dos rondas de codificación VAE de fotogramas de memoria |
| JoyAI-Echo 1.5 base + selector LTX | 4.515 | Incluye dos rondas de codificación VAE de fotogramas de memoria |
| LTX2.3 SFT+RL + selector LTX | 4.961 | Incluye dos rondas de codificación VAE de fotogramas de memoria |
| JoyAI-Echo 1.0 native memory bank | 1.345 | Sin agente; incluye codificación VAE de memoria de vídeo |
| JoyAI-Echo 1.5 native memory bank | 0.996 | Sin Director Agent/VLM; incluye codificación VAE de memoria de audio y MSST |
| H3Director workflow oficial completo | 53.464 | 4 análisis de contexto + 1 revisión de Director + escritura de partes 1-23; 24/24 partes válidas |
| HyperFlow-Infinity agente completo | 183.635 | Director, scene graph, VLM de identidad y persistencia |
| JoyAI-Echo 1.5 + Echo Director Agent | N/A (fallo en 24 tomas) | shot0 = 243.073 s, shot1 = 212.067 s; shot2 rechazada por el validador oficial |

Ablación adicional restando también la codificación VAE de memoria (s/ evaluación de toma):

| Método | Tiempo (s/toma) |
|---|---:|
| H3 original 33B + selector propio | 0.305 |
| H3 SFT+RL + selector propio | 0.101 |
| JoyAI-Echo 1.0 base + selector LTX | 0.439 |
| JoyAI-Echo 1.5 base + selector LTX | 0.317 |
| LTX2.3 SFT+RL + selector LTX | 0.535 |
| JoyAI-Echo 1.0 native memory bank | 0.190 |
| JoyAI-Echo 1.5 native memory bank | 0.801 |

Desglose de H3Director: 4 llamadas a `/ng/analyze` (46.816 s), 1 llamada a `/ng/direct` (144.800 s), 24 llamadas a `/ng/write_part` (1083.451 s; media 45.144 s; rango 32.276-49.036 s). Suma total 1275.068 s; excluyendo la parte 0 (45.399 s) resulta 1229.669/23 = 53.464 s/toma. Pico de memoria del servicio Qwen: 67311 MiB.

Desglose de HyperFlow-Infinity: total 4223.613 s (183.635 s/toma). Director: 1399.729 s en las tomas 1-23 (60.858 s/toma). Escritura de scene-graph: 2625.668 s (114.159 s/toma), con 24 commits que provocaron 41 intentos de VLM de memoria (17 reintentos por validación estructural). Escritura de identity-bank: 198.216 s (8.618 s/toma); tres primeras identidades VLM de 55.706 s, 54.988 s y 54.166 s. Extracción de candidatos de identidad: 33.324 s en 24 ejecuciones. Tres VLM compactos: 13.799 s. Pico de memoria del servicio Qwen: 72209 MiB (incremento de 72208 MiB sobre una base de 1 MiB).

Echo Director Agent: 27 invocaciones VLM reales con un total de 1642.364 s. Selección de personajes: 23 invocaciones, 1455.726 s (media 63.292 s). Selección de representantes: 2 invocaciones, 171.998 s (media 85.999 s). Transiciones de escena: 2 invocaciones, 14.641 s (media 7.320 s). Pico de memoria del servicio Qwen: 66671 MiB.

## Requisitos de hardware

- No aplica en el sentido de inferencia de un modelo: el repositorio es un informe, no pesos ejecutables.
- Para reproducir las mediciones de los agentes VLM se requiere un servicio Qwen con al menos ~72 GiB de memoria de GPU en el pico observado (72209 MiB en HyperFlow-Infinity, 67311 MiB en H3Director, 66671 MiB en Echo Director Agent).
- La pila de software de referencia exige CUDA 12.8 (PyTorch 2.9.1+cu128) y Triton 3.5.1.
- No se especifican GPU concretas (A100, H100, RTX 4090) en la información disponible.
- No se reportan latencias ni throughput de generación de vídeo, solo tiempos de gestión de memoria.
- Opciones de despliegue: no disponibles.

## Comparativa con modelos similares

La comparación relevante es entre métodos de gestión de memoria, no entre modelos. A continuación se contrastan las tres familias evaluadas:

| Método | Enfoque | Tiempo (s/toma) | Estado en 24 tomas | Pico Qwen (MiB) |
|---|---|---:|---|---:|
| Selector propio + H3 (33B, SFT+RL) | Selector sobre modelo base | 17.587-17.910 | Completo | no disponible |
| Selector LTX + JoyAI-Echo 1.0/1.5 o LTX2.3 | Selector sobre modelo base | 4.515-4.961 | Completo | no disponible |
| Native memory bank (Echo 1.0/1.5) | Banco de memoria nativo sin agente | 0.996-1.345 | Completo | no disponible |
| H3Director | Agente orquestador con VLM | 53.464 | Completo (24/24 válidas) | 67311 |
| HyperFlow-Infinity | Agente completo con scene graph e identidad | 183.635 | Completo (con 17 reintentos) | 72209 |
| Echo Director Agent | Agente Director sobre Echo 1.5 | N/A | Fallo en shot2 | 66671 |

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos; no debe citarse como modelo en comparativas de LLM o de generación de vídeo.
- La licencia no está declarada, lo que impide determinar condiciones de uso comercial o redistribución.
- No se declaran idiomas soportados ni pipeline; los campos correspondientes aparecen vacíos en Hugging Face.
- Las cifras dependen de una pila de software muy concreta (PyTorch 2.9.1+cu128, Transformers 5.15.0, Triton 3.5.1); cambios de versión pueden alterar los tiempos.
- La métrica excluye la decodificación VAE de generación, por lo que no representa el coste total del pipeline de vídeo.
- El resultado de Echo Director Agent no es un promedio de 24 tomas: el agente falló de forma estable en la toma 2 por reutilización de índice de candidato entre identidades distintas, incluso tras 3 reintentos supervisados y 6 reintentos de callback.
- HyperFlow-Infinity presentó un fallo independiente en una repetición (toma 21, node id desconocido `subject_1`), lo que indica cierta fragilidad estocástica del validador.
- El `0.996 s/toma` de JoyAI-Echo 1.5 native no debe interpretarse como tiempo del agente: solo cubre banco nativo, codificación VAE de audio, MSST y concatenación de hasta 7 slots de memoria.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje.
- El caso de evaluación es único (`worker_01_tier3`, 24 tomas); no hay evidencia de generalización a otros casos o longitudes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ymyy307/report-1120
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este artefacto.
