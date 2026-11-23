# wepiqx/MiMo-V2.6-Distill-Qwen-9B-GGUF-MERNIK

## Resumen

MiMo-V2.6-Distill-Qwen-9B-GGUF-MERNIK es una colección de cuantizaciones GGUF del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario wepiqx bajo el motor de cuantización propio denominado MERNIK. El modelo base es un destilado de Qwen3.5-9B desarrollado por Xiaomi, entrenado mediante SFT orientado a tareas agénticas con 77.000 millones de tokens de SFT, de los cuales el 27% son visuales. Cuenta con 8.953.803.264 parámetros totales y licencia Apache 2.0.

La relevancia de esta publicación no reside en el modelo en sí, sino en el método de cuantización: en lugar de aplicar una asignación uniforme de bits por capa (como Q4_K_M o Q6_K estándar), MERNIK utiliza una cola de importancia que distribuye el presupuesto de bits de forma no uniforme, asignando mayor precisión a las capas críticas y menor a las redundantes. Se publican seis builds MERNIK con distintos presupuestos (4,4 GB, 5,0 GB y 6,5 GB) junto con referencias de cuantizaciones estándar medidas con el mismo arnés de evaluación.

El autor documenta explícitamente los veredictos de cada build mediante HumanEval pass@1 y perplejidad, incluyendo la retirada de una corona por ruido estadístico, lo que aporta trazabilidad poco habitual en publicaciones de cuantizaciones. El objetivo declarado es la investigación en GPU de consumo: obtener veredictos equivalentes a cuantizaciones estándar con archivos de menor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (destilado de Qwen3.5-9B, con visión de fusión temprana nativa) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | GGUF con asignación no uniforme MERNIK: SMAPE (barbell), MSE (spread), SMSE (blend geométrico); builds de 4,4 GB, 5,0 GB y 6,5 GB; referencias estándar Q3_K_M, Q4_K_M y Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 8.950 millones de parámetros derivado de Qwen3.5-9B, sobre el que Xiaomi aplicó un proceso de destilación mediante SFT con 77.000 millones de tokens, un 27% de ellos de naturaleza visual. La card describe el modelo como un destilado agéntico, orientado a tareas de SWE, terminal y uso de herramientas, y hereda la visión de fusión temprana nativa de Qwen3.5. El modelo incluye su propia plantilla jinja basada en macros, distinta de la plantilla clásica de Qwen, compatible de forma nativa con `--jinja` en llama.cpp.

La innovación de esta publicación es el motor MERNIK, que sustituye el recorte uniforme de bits por capa por una cola de importancia que asigna el presupuesto de bits según la criticidad de cada capa. Se definen tres lentes: SMAPE (barbell), que lleva las capas redundantes al suelo de Q4 y las capas críticas a Q8, adecuada para presupuestos ajustados; MSE (spread), que llena el rango medio Q5/Q6 y apenas usa Q8, adecuada para presupuestos amplios; y SMSE, una mezcla geométrica de ambas con un rango medio grueso y un subconjunto sub-4 reducido. La matriz de importancia (imatrix) se genera con el propio modelo MiMo y calibración qwen38, sin mezclar lentes ajenas. Las normas se mantienen fuera del presupuesto de cuantización en F32 según la ley 1D, y la atención de frontera se preserva en alta precisión.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y resolución de problemas de código: el modelo base está orientado a tareas agénticas y el autor evalúa los builds con HumanEval.
- Capacidades agénticas heredadas del modelo base: SWE, terminal y uso de herramientas (tool calling), según la card del modelo base.
- Capacidades visuales: el 27% de los tokens de SFT del modelo base son visuales, sobre visión de fusión temprana de Qwen3.5.
- Soporte de plantilla jinja propia basada en macros, compatible con llama.cpp mediante `--jinja`.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la card.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de cuantización: los seis builds con veredictos medidos (PPL y HumanEval) permiten reproducir y comparar asignaciones de bits no uniformes frente a cuantizaciones estándar en el mismo arnés, con referencias Q3_K_M, Q4_K_M y Q6_K medidas.
- Despliegue en GPU de consumo para tareas de código: el build de 5,0 GB con 70,12% de pass@1 en HumanEval cabe en GPUs con 8 GB de VRAM y sirve para autocompletado y generación de funciones en entornos locales.
- Asistencia conversacional en inglés: el modelo es conversacional y puede gestionar diálogos multi-turno mediante `llama-server` con la plantilla jinja incluida.
- Pipelines agénticos locales: al heredar las capacidades de tool calling y terminal del modelo base, el build de 6,5 GB (75,00% de pass@1) es el candidato para flujos de agente con múltiples pasos en hardware de consumo.
- Servidor de inferencia ligero: con `llama-server -ngl 99 -c 8192 --jinja` se levanta un endpoint compatible con la API de OpenAI para pruebas de integración.
- Investigación en preservación de capacidades tras cuantización: la metodología de veredictos (comparación frente a Q6 estándar como certificado de preservación, no de ranking) sirve como referencia para diseñar evaluaciones de cuantizaciones propias.
- Prototipado de aplicaciones con entrada visual: el modelo base incorpora visión de fusión temprana, aunque la card de esta publicación no documenta la preservación de visión en los builds GGUF.

## Benchmarks y rendimiento

Resultados medidos por el autor con HumanEval pass@1 (temperatura 1.0, top_p 0.95, top_k 20, presence 0.0, máximo 2048) y perplejidad a contexto 1024:

| Build | Tamano | PPL (ctx1024) | HE pass@1 | HE+ |
|---|---:|---:|---:|---:|
| MERNIK-5100-SMAPE | 5,0 GB | 8,7435 | 70,12% (115/164) | 66,5% |
| MERNIK-5100-SMSE | 5,0 GB | 8,7389 | 71,34% (117/164) | 65,9 (corona retirada por ruido) |
| MERNIK-5100-SRMSE | 5,0 GB | 8,7389 | 70,12% / 66,46% (reruns) | ~64 (archivo idéntico a SMSE-5100, md5 coincidente) |
| MERNIK-4500-SMAPE (allow-q3) | 4,4 GB | 10,5343 | 29,88% (49/164) | 26,2 |
| MERNIK-4500-SMSE (allow-q3) | 4,4 GB | 9,4092 | 54,88% (90/164) | 53,0 |
| MERNIK-6500-MSE | 6,5 GB | 8,7655 | 75,00% (123/164) | 68,9 |
| MERNIK-6500-SMSE | 6,5 GB | 8,7275 | 72,56% (119/164) | 67,1 |
| Q6_K (referencia estándar) | 7,2 GB | 9,1362 | 71,95% (118/164) | 66,5% |
| Q4_K_M (referencia estándar) | 5,63 GB | 8,6671 | 70,73% (116/164) | 66,5% |
| Q3_K_M (referencia estándar) | 4,62 GB | 13,4014 | 18,29% (30/164) | 17,7% (29/164) |

Duelos de referencia con el mismo arnés: OxCoder-SMAPE-5100 88,41% y NeoHorse-SMAPE-5100 82,93% en HumanEval pass@1.

## Requisitos de hardware

- VRAM estimada: los builds de 4,4 GB requieren aproximadamente 5-6 GB de VRAM; los de 5,0 GB, unos 6-7 GB; los de 6,5 GB, unos 7,5-8,5 GB, incluyendo overhead de contexto KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para los builds mayores con contexto extendido; A100 o H100 no son necesarias para estos tamaños.
- Cabe en GPU de consumo: sí, todos los builds caben en GPUs con 8 GB o más de VRAM; los de 4,4 GB y 5,0 GB caben en 8 GB con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 8192 --jinja`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio). vLLM y TGI no se mencionan en la información disponible para formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HE pass@1 (mismo arnes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MERNIK-5100-SMAPE | 8,95B | no disponible | 70,12% | Apache 2.0 | GGUF, 5,0 GB |
| Q6_K estándar (mismo base) | 8,95B | no disponible | 71,95% | Apache 2.0 | GGUF, 7,2 GB |
| Q4_K_M estándar (mismo base) | 8,95B | no disponible | 70,73% | Apache 2.0 | GGUF, 5,63 GB |
| OxCoder-SMAPE-5100 | no disponible | no disponible | 88,41% | no disponible | GGUF, 5,0 GB |
| NeoHorse-SMAPE-5100 | no disponible | no disponible | 82,93% | no disponible | GGUF, 5,0 GB |

La comparación relevante es interna: el build MERNIK de 5,0 GB iguala en veredicto a Q6_K estándar (115 frente a 118 tareas, diferencia dentro del ruido del instrumento, que no resuelve por debajo de unas 13 tareas a n=164) con 2,2 GB menos de archivo, y supera en perplejidad a Q6_K (8,74 frente a 9,14). El build de 4,4 GB con lente SMSE supera a Q3_K_M estándar en 60 tareas (90 frente a 30) con tamaño similar.

## Limitaciones y advertencias

- Idiomas: la card declara únicamente inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de modelos de 9B destilados.
- Sesgos: no documentados en la información proporcionada.
- Ruido estadístico: el propio autor advierte que el arnés HumanEval con n=164 no resuelve diferencias por debajo de unas 13 tareas, y retiró una corona por un +1,2 pp que resultó ser ruido. Los veredictos de los builds de 6,5 GB también se declaran empates dentro del ruido frente a Q6 estándar.
- Builds de 4,4 GB con lente SMAPE: caída severa de rendimiento (29,88% de pass@1, PPL 10,53); el autor lo describe como zona de suelo de lava y recomienda la lente SMSE en ese presupuesto.
- Contexto: no se documenta la longitud de contexto soportada por los builds; el ejemplo de uso emplea 8192 tokens.
- Visión: aunque el modelo base incorpora visión, la card de esta publicación no documenta la preservación de capacidades visuales en los GGUF.
- Producción: los benchmarks son de un solo autor con arnés propio y no han sido replicados de forma independiente; tratar los veredictos como indicativos de preservación, no como ranking absoluto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus derivados deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wepiqx/MiMo-V2.6-Distill-Qwen-9B-GGUF-MERNIK
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Metodología y registros MERNIK: https://huggingface.co/wepiqx/MERNIK
- Patrocinio del autor: https://github.com/sponsors/wepiqx
