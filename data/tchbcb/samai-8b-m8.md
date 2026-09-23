# tchbcb/samai-8b-M8

## Resumen

samai-8b M8 es la entrega final (ronda "M8") de una serie de ajustes por destilación sobre el modelo base `Qwen/Qwen3.5-9B` en bf16, publicada por el usuario tchbcb. Se trata de un modelo conversacional orientado a la ejecución de agentes: la model card lo describe como un modelo de diálogo y ejecución especializado en orquestación de herramientas, con soporte explícito de function calling y despliegue mediante llama.cpp. El repositorio entrega el peso cuantizado `q4_k_m` (5,78 GB), verificado en una GPU T4 (SM75) y con una prueba de inferencia en CPU.

El entrenamiento se realizó con QLoRA (nf4, r=32, α=64) sobre cuatro clústeres de datos de instrucciones sintetizados de forma programática: salto único, uso de múltiples herramientas, cadenas multi-turno y respuesta directa negativa, con un total de 3.200 muestras que incluyen verificación de accesibilidad de herramientas y muestras negativas con respuesta verdadera. El modelo tiene 9.197.093.888 parámetros (~9,2 B), a pesar del sufijo "8b" del nombre, y se distribuye bajo licencia Apache 2.0.

La relevancia actual del modelo reside en su relación tamaño/rendimiento en tareas de agente: el autor compara el fichero q4_k_m de 5,78 GB contra un modelo de 27 B en formato ternario de 5,95 GB (`Ternary-Bonsai-2-27B`, de prism-ml) en un banco de 48 preguntas de agente, y obtiene una ventaja de 2,1 puntos en el total (62,5% frente a 60,4%). Los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `Qwen/Qwen3.5-9B`; no se describe en la información proporcionada) |
| Parámetros totales | 9.197.093.888 (~9,2 B, según safetensors) |
| Parámetros activos | no disponible (no se documenta variante MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 2048`, pero no se declara el máximo del modelo) |
| Tipos de cuantización | q4_k_m (GGUF, 5.780.090.720 B); el entrenamiento se hizo en QLoRA con cuantización nf4 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (cadena declarada: bf16 fusionado → `convert_hf_to_gguf.py` f16 → `llama-quantize` q4_k_m) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible; el modelo se construye sobre `Qwen/Qwen3.5-9B` en bf16 y conserva su estructura. El proceso de ajuste consiste en una fusión de LoRA verificada par a par ("128/128 lora pairs" confirmados) mediante fusión en streaming. El entrenamiento emplea QLoRA con cuantización nf4, rango r=32 y α=64 sobre 3.200 instrucciones de agente sintetizadas por un paradigma de profesor como programa, divididas en cuatro clústeres: salto único, múltiples herramientas, cadenas multi-turno y respuesta directa negativa. El conjunto incluye comprobaciones de "línea roja" sobre la accesibilidad de las herramientas y muestras negativas con respuesta verdadera, con el objetivo declarado de reducir respuestas inventadas en el clúster negativo.

La innovación técnica destacable es la cadena de cuantización y su verificación de despliegue: los pesos fusionados en bf16 se convierten a GGUF f16 y después a q4_k_m mediante `llama-quantize`, y el resultado se valida tanto en GPU T4 (SM75) con `llama-server -ngl 99` como en modo CPU. El autor mantiene además una puerta de regresión de capacidades ("knight15") para comprobar que la optimización de agente no degrada las capacidades nucleares del modelo. No se documenta el uso de RLHF, DPO ni una fase de alineación por preferencias; tampoco se indica el volumen total de tokens de entrenamiento más allá de las 3.200 muestras sintéticas del ajuste por instrucciones.

## Capacidades

- Generación de texto conversacional en chino e inglés, heredada del modelo base.
- Uso de herramientas (function calling / tool calling), declarado explícitamente en las etiquetas del repositorio.
- Orquestación de múltiples herramientas en una misma tarea: clúster B de agent60 al 100,0% tras el ajuste M8, frente al 73,3% de la ronda M7 (+26,7 puntos).
- Cadenas de razonamiento y ejecución multi-turno: clúster C de agent60 al 93,3% en la versión M8 (100,0% en M7, con una caída de 6,7 puntos).
- Respuesta directa y rechazo ante peticiones fuera de alcance: clúster D de agent60 al 93,3% (frente al 80,0% de M7) y 100,0% en el banco PK de 48 preguntas.
- Ejecución en entornos con recursos limitados: cuantización q4_k_m de 5,78 GB y funcionamiento verificado en GPU T4 y en CPU.
- No se documentan capacidades de visión, audio, ni un modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Orquestación de agentes con varias herramientas: el modelo está optimizado para encadenar llamadas a funciones distintas dentro de una misma tarea, que es precisamente su clúster de mejor rendimiento (100,0% en agent60-B y 50,0% en el banco PK frente al 41,7% del competidor de 27 B). Adecuado para asistentes que deben consultar una API, transformar el resultado y volver a consultar antes de responder.
- Asistentes que deben rechazar peticiones fuera de alcance en lugar de inventar: con 93,3% en agent60-D y 100% en el banco PK, es apropiado para sistemas donde una respuesta incorrecta es más costosa que una negativa, por ejemplo en atención interna o consultas de solo lectura.
- Despliegue en GPU de gama media para atención automatizada: al ocupar 5,78 GB en q4_k_m, permite mantener conversaciones multi-turno en tarjetas de 8-16 GB con `llama-server`, sin necesidad de infraestructura de centro de datos.
- Ejecución en servidores sin GPU: la model card confirma que la prueba de inferencia en CPU pasa; sirve para colas de trabajo por lotes o entornos de desarrollo donde no hay acelerador disponible.
- Backend de function calling para aplicaciones en chino e inglés: integrable como servidor compatible con API de endpoints detrás de una capa de orquestación que traduzca las definiciones de herramientas al formato esperado.
- Sustitución de modelos mayores con presupuesto de VRAM ajustado: el autor lo posiciona explícitamente frente a un modelo ternario de 27 B que ocupa 5,95 GB, con ventaja en el total del banco PK (62,5% frente a 60,4%), lo que permite reducir requisitos de memoria sin ceder en tareas de agente.
- Evaluación comparativa de stacks de agentes: el repositorio publica los ficheros `m8_pk_eval.jsonl`, `pk_summary.json` y los informes de evaluación, lo que facilita reproducir el banco de 48 preguntas y comparar otros modelos bajo el mismo harness.

## Benchmarks y rendimiento

Evaluación agent60 (60 preguntas, máquina real T4), comparación entre la ronda M7 y la entrega M8 del mismo modelo:

| Clúster | M7 (base) | M8 (final) | Diferencia |
|---|---|---|---|
| agent60 A (salto único) | 100,0 | 100,0 | — |
| agent60 B (múltiples herramientas) | 73,3 | 100,0 | +26,7 |
| agent60 C (cadena multi-turno) | 100,0 | 93,3 | -6,7 |
| agent60 D (respuesta directa negativa) | 80,0 | 93,3 | +13,3 |
| agent60 total | 86,7 | 96,7 | +10,0 |
| knight15 (regresión de capacidades) | 15/15 | 15/15 | 0 |

Comparativa directa del autor contra `Ternary-Bonsai-2-27B` (prism-ml) en un banco nuevo de 48 tareas de agente sin filtración de entrenamiento, mismo harness, misma configuración de servidor y decodificación greedy:

| Clúster | samai-8b M8 | Ternary-Bonsai-2-27B | Delta |
|---|---|---|---|
| A (salto único) | 58,3% | 58,3% | 0 |
| B (múltiples herramientas) | 50,0% | 41,7% | +8,3 |
| C (cadena multi-turno) | 41,7% | 41,7% | 0 |
| D (respuesta directa negativa) | 100,0% | 100,0% | 0 |
| Total | 62,5% | 60,4% | +2,1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y emplean harness propios con muestras pequeñas (60 y 48 preguntas).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos q4_k_m ocupan 5,78 GB; con caché KV para un contexto corto (el ejemplo usa 2.048 tokens) el consumo se sitúa aproximadamente entre 6,5 GB y 8 GB, en función del backend y del tamaño de lote. Esta cifra es una estimación derivada del tamaño del fichero, no un dato publicado.
- GPU verificadas por el autor: NVIDIA T4 (SM75, 16 GB) con `llama-server -m samai8b_m8_q4_k_m.gguf -ngl 99 -c 2048 --port 8080`.
- GPU de consumo compatibles: con 5,78 GB de pesos, cabe en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, RTX 3060 de 12 GB). En tarjetas de 8 GB el margen es estrecho y obliga a limitar el contexto.
- Aceleradores de mayor capacidad (A100, H100) no son necesarios para la cuantización entregada; solo tendrían sentido para servir los pesos safetensors en precisión completa.
- Ejecución en CPU: verificada mediante una prueba de inferencia "en modo CPU" sobre la cuantización q4_k_m.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) y cualquier runtime compatible con GGUF, como Ollama. La compatibilidad con vLLM o TGI no está documentada; el repositorio contiene safetensors, pero la model card no describe un procedimiento de servicio en esos motores pese a la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Contexto | agent60 (total) | Banco PK 48 | Licencia |
|---|---|---|---|---|---|---|
| samai-8b M8 (tchbcb) | 9,2 B | 5,78 GB (q4_k_m) | no disponible | 96,7% | 62,5% | Apache 2.0 |
| samai-8b M7 (tchbcb) | 9,2 B | no disponible | no disponible | 86,7% | no evaluado | Apache 2.0 |
| Ternary-Bonsai-2-27B (prism-ml) | 27 B | 5,95 GB (PTQ1_0) | no disponible | no evaluado | 60,4% | no disponible |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | no disponible | no evaluado | no evaluado | no disponible |

La única comparación con datos es la que publica el propio autor frente a Ternary-Bonsai-2-27B; no se dispone de comparaciones independientes con otras alternativas de la misma categoría (por ejemplo, modelos de 7-9 B ajustados para function calling). En el clúster de múltiples herramientas M8 supera al modelo de 27 B por 8,3 puntos, mientras que en salto único, cadena multi-turno y respuesta negativa ambos empatan.

## Limitaciones y advertencias

- Todas las métricas proceden de la model card del autor y de harness propios; no hay evaluación independiente ni reproducción externa publicada.
- Los tamaños de muestra son pequeños (60 y 48 preguntas), lo que implica alta varianza: una diferencia de 1-2 preguntas altera varios puntos porcentuales del total.
- El rendimiento en el clúster de cadena multi-turno cayó 6,7 puntos entre M7 (100,0) y M8 (93,3), es decir, la optimización de la ronda M8 no es estrictamente aditiva y puede degradar tareas previamente resueltas.
- El conjunto de ajuste tiene 3.200 muestras sintetizadas por un paradigma de profesor como programa, con cuatro clústeres definidos; existe riesgo de sobreajuste al formato concreto de esas tareas y de generalización limitada a esquemas de herramientas distintos.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad, ni resultados en benchmarks estándar de conocimiento o razonamiento (MMLU, GSM8K, HumanEval).
- Riesgo de alucinación: aunque el entrenamiento incluye muestras negativas con respuesta verdadera para el clúster de respuesta directa, no se publican métricas de fidelidad factual fuera del harness propio.
- Cobertura de idiomas limitada a chino e inglés; no hay declaración de soporte ni evaluación para castellano ni para otras lenguas.
- Longitud de contexto no declarada: el ejemplo de despliegue fija `-c 2048`, por lo que la ventana efectiva en ese montaje es de 2.048 tokens, muy inferior a la de muchos modelos actuales. Debe consultarse la ficha del modelo base para conocer el máximo teórico.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de `Qwen/Qwen3.5-9B`; conviene verificar los términos y condiciones del modelo base antes de un despliegue comercial.
- El nombre comercial "8b" no coincide con el recuento real de parámetros (9,2 B), lo que puede inducir a error al planificar memoria.
- El repositorio ocupa 68,1 GB, muy por encima del fichero cuantizado de 5,78 GB; hay que prever el espacio de almacenamiento si se descarga completo.
- La compatibilidad con motores de servicio distintos de llama.cpp (vLLM, TGI) no está documentada ni verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tchbcb/samai-8b-M8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficheros de evidencia citados en la model card (dentro del repositorio del modelo): `m8_final_report.json`, `m8_knight15_report.json`, `m8_baseline_report.json`, `pk_summary.json`, `m8_pk_eval.jsonl`
- No se han encontrado enlaces adicionales relevantes (paper, blog o repositorio independiente) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
