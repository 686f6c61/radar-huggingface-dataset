# tensor-tailor/zils-mini-body-32

## Resumen

zils-mini-body-32 es un modelo de lenguaje de tipo "body" (pesos completos) perteneciente al pool Zils d3-mini, desarrollado por el usuario tensor-tailor. Se construye a partir de una fusión de pesos: parte del modelo MS11 (el "soup" oficial de la ronda d3-mini del 11 de noviembre de 2026) y le aplica un desplazamiento igual a 0,5 veces la media de los cambios de seis ejecuciones de ajuste fino con LoRA. El resultado es un modelo de aproximadamente 4.540 millones de parámetros en formato safetensors, derivado a su vez de `d3-mini-4.5b-v1` de la familia Zils.

El modelo no introduce una arquitectura nueva: hereda la del modelo base `d3-mini-4.5b-v1` (etiquetado con la arquitectura `qwen3_5` en los tags de Hugging Face), y su interés es principalmente metodológico. Documenta con un nivel de trazabilidad inusualmente alto (hashes SHA-256 de cada tensor, recibos de construcción, semillas de entrenamiento) cómo se combinan varias ejecuciones de LoRA sobre un mismo dataset para producir un body intermedio entre el punto de partida y la media uniforme de las ejecuciones.

Es relevante ahora porque ejemplifica las prácticas de fusión de pesos y ajuste fino distribuido en la comunidad open source, así como los mecanismos de evaluación interna (lecturas C3, hold-out sellado, barreras de commit) que algunos equipos aplican antes de publicar pesos. Conviene señalar que el propio autor indica que este body queda por debajo de su barrera preestablecida de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (tag `qwen3_5`; arquitectura del base `d3-mini-4.5b-v1`) |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors de 9.078.616.200 bytes; 152 tensores difieren del start) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 4,5 mil millones de parámetros que hereda la arquitectura del base `d3-mini-4.5b-v1` (revisión `e9e87b3e` del repositorio Zils). No se documenta ninguna innovación arquitectónica propia: el interés está en el proceso de construcción de los pesos. El body se genera con la herramienta `delta_combo.py` v1.4 aplicando la fórmula `body = start + 0,5 × (1/6) × Σ(run − start)` sobre todos los tensores, donde `start` es el modelo MS11 (soup oficial de la ronda d3-mini del 11-11-2026, reconstruido a partir de `qhoenix/zils-mini-decision-l13_avg678` y `joamCriff123/zils-mini-sx3`) y cada `run` es una de las seis ejecuciones de ajuste fino.

El entrenamiento consistió en seis ejecuciones idénticas salvo por la semilla (4602, 4612, 4622, 4632, 4642 y 4652), partiendo todas de MS11. Cada ejecución usa LoRA de rango 32, alpha 64, dropout 0,05 y sin adaptadores en las capas MLP; tasa de aprendizaje 5e-5 durante 2 épocas, batch 8 con 2 pasos de acumulación, weight decay de LoRA 1,0. La función de pérdida combina entropía cruzada (peso 1) y Brier score (peso 1), con peso KL 0, más un término de pin (peso 1,0, `--pin-train 0.1`) cuyo fichero de pin está vacío. El dataset de entrenamiento, lh3500, tiene 2.929 filas: 2.882 etiquetas provienen de respuestas del propio escritor (1.486 de una sesión de Claude, 1.395 de otra y 1 de un modelo Phi-4 local), 41 de etiquetas gold humanas de MNLI (26) y QNLI (15), 4 derivadas por código de SQuAD v2 y 2 calculadas a partir de la especificación del ítem. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base pertenece a la familia d3-mini orientada a tareas de razonamiento y lenguaje, según las categorías de evaluación reportadas.
- Soporte de herramientas (tool calling): la lectura C3 incluye una categoría "tools" con una mejora media de +2,06 puntos respecto al start.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explícita; la categoría "tools" sugiere cierta orientación a uso instrumental, pero no se detalla.

## Casos de uso

- Experimentación con fusión de pesos: el modelo sirve como referencia reproducible para investigar técnicas de model soup y combinación de deltas de LoRA, ya que publica hashes de cada tensor y recibos de construcción que permiten replicar la fórmula `start + 0,5 × media(run − start)`.
- Investigación sobre ajuste fino con múltiples semillas: permite estudiar la varianza entre ejecuciones (seis semillas documentadas) y el efecto de promediar sus deltas sobre el rendimiento final.
- Evaluación de pipelines de datos sintéticos: el dataset lh3500, con etiquetas generadas mayoritariamente por modelos Claude y Phi-4, puede analizarse para medir el impacto de datos sintéticos en tareas de razonamiento y lenguaje.
- Clasificación y tareas de lenguaje natural: dado el perfil de mejora reportado (lenguaje +3,14, razonamiento +1,30), es adecuado para experimentos de clasificación de texto y tareas de comprensión, aunque sin garantías de producción.
- Prototipado de asistentes con uso de herramientas: la mejora en la categoría "tools" (+2,06) permite explorar integraciones de function calling en entornos de desarrollo, siempre con validación propia.
- Estudio de metodologías de evaluación interna: las lecturas C3, el hold-out sellado y las barreras de commit documentadas ofrecen un caso práctico para diseñar protocolos de validación en equipos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente evaluaciones internas:

| Evaluación interna | Resultado | Referencia |
|---|---|---|
| Lectura C3 (media de 10 splits, puntos) | +1,42 | Rango +0,17 a +5,10; 10/10 splits > 0; 2/10 ≥ +2,00 |
| C3 razonamiento | +1,30 | — |
| C3 lenguaje | +3,14 | — |
| C3 retrieval | −0,64 | — |
| C3 tools | +2,06 | — |
| C3 arts | +0,18 | — |
| C3 con pesos por categoría | +0,86 | Línea propia: +2,8 (por debajo) |
| Hold-out (cambio de probabilidad de la respuesta gold) | +0,0359 (140 filas de examen); +0,0356 (149 filas) | Supera la línea de hold-out |
| Chequeo por familia | Ninguna familia por debajo de −3,0 (mínimo: retrieval-score −2,01) | — |
| Copy screen (coseno al soup) | 0,99399 | Línea: 0,999 |
| Copy screen (cambio explicado por el body MINI anterior) | 0,185 | Línea: 0,30 |
| Barrera de commit propia (media ≥ +2,00 con ≥ 8/10 splits ≥ +2,00) | No superada (media +1,42; 2/10 splits) | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 4,54 mil millones de parámetros en fp16 requiere aproximadamente 9 GB de pesos, cifra coherente con el tamaño del repositorio (9,1 GB); en cuantizaciones de 8 bits o 4 bits el requisito se reduciría, pero no se documentan formatos GGUF ni cuantizaciones publicadas.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB en fp16), pero no se confirma en la información.
- Cabe en GPU de consumo: no confirmado; el tamaño de pesos en fp16 (≈9 GB) lo haría viable en tarjetas de 12-16 GB solo con cuantización, no documentada.
- Opciones de despliegue: no disponible. El modelo usa `custom_code` y la arquitectura `qwen3_5`, lo que puede requerir el repositorio Zils o código específico; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-32 | 4,54 B | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) | Body fusionado de seis ejecuciones LoRA; por debajo de la barrera propia del autor |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Hugging Face (miembro del soup MS11) | Modelo base componente del start |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Hugging Face (miembro del soup MS11) | Modelo base componente del start |
| d3-mini-4.5b-v1 (familia Zils) | ≈4,5 B | no disponible | no disponible | Repositorio Zils, revisión `e9e87b3e` | Modelo de referencia de la arquitectura |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (por ejemplo, Qwen, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el modelo queda por debajo de su barrera preestablecida de calidad: media de +1,42 puntos frente al objetivo de +2,00, y solo 2 de 10 splits alcanzan +2,00.
- La lectura C3 con pesos por categoría (+0,86) está por debajo de la línea interna del autor (+2,8).
- El copy screen muestra un coseno de 0,99399 frente al soup, por debajo de la línea de 0,999, y solo el 18,5 % del cambio se explica por el body MINI anterior (línea 0,30), lo que sugiere una diversidad limitada respecto a trabajos previos.
- La categoría retrieval empeora respecto al start (−0,64 de media; mínimo de −2,01 en la familia retrieval-score), por lo que no es adecuado para tareas de recuperación sin ajuste adicional.
- Riesgo de alucinación: no documentado específicamente, pero inherente a un modelo de 4,5 B ajustado sobre datos mayoritariamente sintéticos (2.882 de 2.929 filas generadas por modelos).
- Sesgos conocidos: no documentados. El dataset incluye etiquetas humanas de MNLI y QNLI, por lo que pueden heredarse sesgos de esos corpus.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial, pero la licencia es la del start sin cambios y el NOTICE lista las fuentes dependientes; conviene revisar dichas dependencias.
- El modelo requiere `custom_code` y la arquitectura `qwen3_5`, lo que puede complicar el despliegue en frameworks estándar sin el código del repositorio Zils.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-32
- Modelo base componente del start: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base componente del start: https://huggingface.co/joamCriff123/zils-mini-sx3
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
