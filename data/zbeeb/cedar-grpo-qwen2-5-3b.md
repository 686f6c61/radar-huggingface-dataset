# zbeeb/Cedar-GRPO-Qwen2.5-3B

## Resumen

Cedar-GRPO-Qwen2.5-3B es un ajuste fino de Qwen2.5-3B mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), publicado por el usuario zbeeb dentro de la colección Cedar Math. El punto de partida es el modelo denso Qwen2.5-3B, de 3.085.938.688 parámetros, y el resultado es un checkpoint de paso 1000 entrenado con actualización completa de parámetros sobre el conjunto Cedar GRPO DAPO Math, compuesto por 17.005 filas de problemas matemáticos. El objetivo declarado es mejorar la precisión de respuesta final en tareas de matemáticas mediante una recompensa que verifica equivalencia matemática, sin juez LLM ni recompensa de formato.

El modelo es relevante como pieza reproducible de investigación en RL con verificación (RLVR): la model card documenta hiperparámetros exactos (grupo de 8, batch 64, recorte PPO de 0,2, AdamW con lr 1e-6, 30 pasos de warmup, semilla 42), revisión del modelo base, y publica un manifiesto de exportación con hashes, además de resultados de evaluación en formato legible por máquina. Para quien trabaja en ajuste por refuerzo sobre modelos pequeños de razonamiento, ofrece un punto de comparación con trazabilidad completa.

Se trata de un transformer denso de tipo decoder-only, sin mezcla de expertos ni arquitecturas híbridas, con licencia Qwen Research License (uso no comercial) y solo idiomas inglés y chino declarados. El entrenamiento y las evaluaciones reportadas usaron una ventana total de 4.096 tokens y un máximo de 3.072 tokens de finalización. El rendimiento en pruebas de competición es modesto: 63,20 % en MATH-500 y 27,50 % en AMC23 con decodificación voraz, con caídas marcadas en AIME24 y AIME25.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2), sin MoE |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Configuración original de Qwen2.5-3B preservada; el entrenamiento y las evaluaciones reportadas usaron 4.096 tokens de contexto total |
| Tipos de cuantización | No se publican cuantizaciones oficiales; el repositorio contiene pesos en BF16. No hay GGUF, GPTQ ni AWQ en la información disponible |
| Idiomas soportados | en, zh |
| Licencia | Qwen Research License (license: other, license_name: qwen-research); incluye términos de uso no comercial |
| Formato de pesos | Safetensors fragmentados (sharded), exportados en el dtype de coma flotante original; tokenizer incluido |
| Modelo base | Qwen/Qwen2.5-3B, revisión 3aab1f1954e9cc14eb9509a215f9e5ca08227a9b |
| Tipo de ajuste | Finetune con aprendizaje por refuerzo (GRPO), actualización completa de parámetros |
| Token EOS | `<|im_end|>` (id 151645) |
| Tamaño del repositorio | 12,4 GB |
| Librería | transformers; compatible con text-generation-inference y endpoints compatibles |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B, un transformer decoder-only denso de 3.085.938.688 parámetros. No se introducen modificaciones estructurales: la model card indica explícitamente que la arquitectura y la configuración de contexto originales se preservan, y que lo único que cambia respecto al base son las 1.000 actualizaciones de GRPO aplicadas sobre todos los parámetros. El ajuste se ejecutó con Prime RL v0.9.0, con tamaño de grupo 8, batch de 64, recorte PPO de 0,2, optimizador AdamW con tasa de aprendizaje 1e-6, 30 pasos de warmup y semilla 42. La ventana total de entrenamiento fue de 4.096 tokens, con un máximo de 3.072 tokens de finalización.

Los datos proceden del conjunto zbeeb/Cedar-GRPO-DAPO-Math-17k, de 17.005 filas, con formato heredado de DAPO-Math-17k. La función de recompensa compara equivalencia matemática de la respuesta terminal, sin juez LLM ni recompensa de formato separada, lo que simplifica la señal de entrenamiento y evita dependencias de modelos evaluadores externos. El tokenizer de entrenamiento emplea `<|im_end|>` como token de fin de secuencia, y tanto el modelo exportado como las configuraciones de generación usan el mismo EOS para detener la generación al final del turno del asistente. La exportación se validó comprobando el paso de entrenamiento guardado, la finitud de los tensores, las claves y formas, la recarga estricta con Transformers, el round-trip del tokenizer, los embeddings atados y la igualdad de logits de una sonda en CPU antes y después de la serialización; los hashes de los ficheros están en export-manifest.json. El estado del optimizador y del scheduler permanece en el checkpoint de entrenamiento original, no en este repositorio.

Un detalle metodológico relevante que señala la propia model card: los modelos de 1,5B y 7B de la colección parten de Qwen2.5-Math, mientras que el de 3B parte de Qwen2.5. Por tanto, las diferencias de rendimiento entre ellos no pueden atribuirse únicamente al número de parámetros.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), orientada a resolución de problemas matemáticos.
- Razonamiento matemático paso a paso, con finalización de hasta 3.072 tokens, incluyendo cadenas de razonamiento largas antes de la respuesta final.
- Emisión de respuesta final en formato estructurado: `\boxed{...}` o una línea `Final answer: ...`, lo que facilita la extracción automática de resultados.
- Cálculo aritmético y resolución de problemas de competición de nivel medio (MATH-500, AMC, Minerva, OlympiadBench), con rendimiento bajo en problemas de nivel AIME.
- Capacidad multilingüe limitada a inglés y chino según los metadatos del modelo.
- Compatibilidad con la librería Transformers y con despliegues de tipo text-generation-inference.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no documentado.
- Modo de pensamiento explícito separado (thinking mode): no documentado; el razonamiento se produce dentro de la propia finalización.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Corrección automática de respuestas matemáticas en plataformas educativas: el modelo produce la respuesta final en formato `\boxed{}` o `Final answer:`, y la recompensa con la que fue entrenado se basa precisamente en equivalencia matemática del resultado terminal, lo que encaja con un corrector que compare expresiones simbólicamente en lugar de texto literal.
- Tutoría paso a paso en inglés o chino: genera razonamiento intermedio antes de la respuesta, útil para mostrar el procedimiento a un estudiante, siempre que se acepte su menor fiabilidad en problemas de nivel olimpiada.
- Generación de datos sintéticos de razonamiento matemático: al ser un modelo de 3B con licencia de investigación, sirve para producir trazas de solución destinadas a destilación o a aumentar conjuntos de entrenamiento, filtrando después por verificación simbólica.
- Reproducción y ablación de experimentos de RLVR: la model card publica configuración de entrenamiento, semilla, revisión del modelo base y manifiesto de exportación, lo que permite usarlo como referencia reproducible frente a variantes propias de GRPO.
- Evaluación comparativa de pipelines de RL: con 3.085.938.688 parámetros y ventana de 4.096 tokens, se puede ejecutar en una sola GPU para medir curvas de recompensa o estudiar el efecto del truncamiento (4,0 % en MATH-500 y hasta 16,7 % en AIME24 en la configuración reportada).
- Prototipado local de asistentes matemáticos: al ser un modelo pequeño, cabe en GPUs de consumo de gama media-alta en BF16 o en cuantizaciones de terceros, lo que permite iterar sin coste de API.
- Preprocesado de bancos de problemas tipo AMC, AIME o OlympiadBench: puede generar soluciones candidatas y respuestas finales para poblar conjuntos de evaluación internos, con verificación posterior obligatoria.
- Extracción estructurada de resultados en pipelines de calificación automática: el formato de salida fijo simplifica el parseo y la comparación contra soluciones de referencia en un sistema de evaluación por lotes.

## Benchmarks y rendimiento

Resultados autodeclarados para el paso de política 1000, con el calificador determinista de respuesta final del propio entrenamiento. Las filas con decodificación voraz usan una finalización por problema; las filas muestreadas usan ocho finalizaciones por problema con temperatura 0,6 y reportan precisión media de respuesta, no pass@8. MATH-500, AMC y AIME emplean un límite de 3.072 tokens de finalización; Minerva y OlympiadBench, 2.048.

| Benchmark | Finalizaciones | Precisión | Truncado |
|---|---:|---:|---:|
| MATH-500 | 500 | 63,20 % | 4,0 % |
| AMC23 | 40 | 27,50 % | 5,0 % |
| AIME24 | 30 | 6,67 % | 16,7 % |
| AIME25 | 30 | 0,00 % | 13,3 % |
| Minerva Math | 272 | 22,06 % | 4,0 % |
| OlympiadBench | 675 | 27,56 % | 10,8 % |
| AIME24 (media muestreada) | 240 | 6,25 % | 12,1 % |
| AIME25 (media muestreada) | 240 | 2,50 % | 10,8 % |
| AIME26 (media muestreada) | 240 | 2,08 % | 10,4 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks (MMLU, HumanEval, GSM8K u otros), ni el barrido de evaluación posterior al entrenamiento, que según la model card aún no se ha ejecutado. Las cifras anteriores son puntuaciones de respuesta final y no miden la calidad de la demostración. Los datos de entrenamiento se filtraron contra las evaluaciones retenidas, pero eso no demuestra ausencia de contaminación procedente del preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 6,2 GB solo de pesos, más caché KV y activaciones; con 4.096 tokens de contexto y batch 1, un presupuesto práctico de 7-9 GB es razonable (estimación orientativa, no publicada por el autor).
- VRAM estimada con cuantización de 8 bits: aproximadamente 3,5-4,5 GB. Con 4 bits: aproximadamente 2-3 GB. Estas cuantizaciones no se distribuyen en el repositorio y habría que generarlas con herramientas externas.
- GPU recomendadas: cualquier GPU con 12 GB o más para BF16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10); A100 y H100 para servir con lotes grandes o para reevaluaciones por lotes.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas con 12 GB o más y en cuantizaciones de 4 u 8 bits en tarjetas de 8 GB, siempre que se genere previamente la cuantización.
- Opciones de despliegue: Transformers con `device_map="auto"` y `dtype=torch.bfloat16` (ruta documentada por el autor), vLLM y text-generation-inference (el repositorio está etiquetado como compatible con TGI y endpoints). Para Ollama o llama.cpp sería necesario convertir previamente a GGUF, formato que no se publica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo ofrece datos cuantitativos de benchmarks para este checkpoint. Para las alternativas se comparan parámetros, contexto, licencia y disponibilidad, dejando el rendimiento como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| Cedar-GRPO-Qwen2.5-3B | 3.085.938.688 | Configuración original de Qwen2.5-3B; entrenamiento y evaluación a 4.096 tokens | Qwen Research License (no comercial) | Safetensors BF16 en HuggingFace | MATH-500 63,20 %; AMC23 27,50 %; AIME24 6,67 % |
| Qwen2.5-3B (base) | 3.085.938.688 | Configuración original preservada | Qwen Research License según la model card del derivado | Safetensors en HuggingFace | No disponible en la información proporcionada |
| Cedar Math, variante 1,5B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Cedar Math, variante 7B | No disponible | No disponible | No disponible | No disponible | No disponible |

Advertencia del autor recogida en la model card: las variantes de 1,5B y 7B parten de Qwen2.5-Math, mientras que la de 3B parte de Qwen2.5, de modo que las diferencias de rendimiento entre ellas no pueden atribuirse solo al número de parámetros. No se dispone de cifras publicadas de esas variantes en la información consultada.

## Limitaciones y advertencias

- Licencia Qwen Research License: incluye términos de uso no comercial. No es apta para explotación comercial sin revisar el LICENSE incluido en el repositorio.
- Entrenamiento muy especializado: el ajuste GRPO se hizo únicamente sobre problemas de matemáticas. Se espera degradación o comportamiento poco fiable en tareas generales de conversación, código o conocimiento factual.
- Rendimiento bajo en problemas de nivel AIME: 6,67 % en AIME24 voraz, 0,00 % en AIME25 voraz y 2,50 % en AIME25 con media muestreada. No es un modelo adecuado para problemas de dificultad olímpica alta.
- Truncamiento de finalizaciones: hasta un 16,7 % de problemas truncados en AIME24 con el límite de 3.072 tokens. Con contextos o problemas más largos el truncamiento aumentará.
- Riesgo de alucinación: la señal de recompensa solo comprueba la equivalencia de la respuesta final, no la validez del razonamiento. Las puntuaciones son de respuesta final y no establecen calidad de demostración, tal como advierte el propio autor.
- Posible contaminación del preentrenamiento: aunque los datos de entrenamiento se filtraron contra las evaluaciones retenidas, no se demuestra la ausencia de contaminación ni que se hayan eliminado todos los casi-duplicados.
- Ausencia del barrido completo de evaluación posterior al entrenamiento: los resultados publicados corresponden a la evaluación de la ejecución de entrenamiento, no a una evaluación exhaustiva e independiente.
- Idiomas: solo inglés y chino declarados. El español no está soportado de forma declarada.
- Contexto efectivo limitado: aunque la configuración original del modelo base se preserva, el entrenamiento y las evaluaciones reportadas usaron 4.096 tokens totales, por lo que el comportamiento más allá de esa ventana no está validado.
- Integridad del repositorio: el estado del optimizador y del scheduler no se incluye, por lo que no se puede reanudar el entrenamiento desde este repositorio, solo la inferencia o un ajuste posterior.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Cedar-GRPO-Qwen2.5-3B
- Modelo base Qwen2.5-3B (revisión 3aab1f1954e9cc14eb9509a215f9e5ca08227a9b): https://huggingface.co/Qwen/Qwen2.5-3B/tree/3aab1f1954e9cc14eb9509a215f9e5ca08227a9b
- Dataset de entrenamiento Cedar-GRPO-DAPO-Math-17k: https://huggingface.co/datasets/zbeeb/Cedar-GRPO-DAPO-Math-17k
- Perfil del autor: https://huggingface.co/zbeeb
- Ficheros de trazabilidad incluidos en el repositorio: training-config.json, export-manifest.json, evaluation-results.json y LICENSE (referenciados en la model card, sin URL pública independiente)
- La búsqueda web no devolvió enlaces adicionales relevantes: los únicos resultados obtenidos fueron páginas genéricas del buscador, sin papers, blogs, repositorios de código ni demos asociados al modelo.
