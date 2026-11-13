# tensor-tailor/zils-mini-body-34

## Resumen

zils-mini-body-34 es un ajuste fino de tipo LoRA sobre el modelo base zils-mini (arquitectura etiquetada como qwen3_5 en Hugging Face), desarrollado por el usuario tensor-tailor dentro del ecosistema colaborativo "Zils d3-mini pool". El modelo parte del denominado MS11, un "soup" (mezcla de pesos) oficial de la ronda d3-mini del 11 de noviembre de 2026, construido a su vez a partir de dos cuerpos públicos: qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3. Con 4.539.265.536 parámetros totales y un repositorio de 9,1 GB en safetensors, se posiciona en la franja de los modelos de aproximadamente 4,5 mil millones de parámetros.

El modelo se ha generado promediando tres ejecuciones de entrenamiento independientes (semillas 4762, 4772 y 4782) sobre un conjunto de datos propio de 2.560 filas (lh3500 v2), aplicando después un escalado de 1,5 sobre la diferencia media respecto al punto de partida: `body = start + 1,5 × (1/3) × Σ(run − start)`. El resultado es un cuerpo completo (no un adaptador LoRA) con 152 tensores modificados respecto al inicio.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de ajuste fino con LoRA rank 32 sobre una base de 4,5B, con pérdida combinada de entropía cruzada y Brier score. Por otro, el propio autor declara explícitamente que el modelo queda por debajo de su umbral preestablecido de calidad (ganancia media de −0,38 puntos frente al inicio, con solo 2 de 10 divisiones por encima de +2,00), por lo que se publica fundamentalmente para obtener una evaluación externa. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de Hugging Face: qwen3_5; familia Zils d3-mini) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, sha256 4d29232e…) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Zils d3-mini, cuyo cuerpo base es `d3-mini-4.5b-v1` del repositorio Zils en la revisión `e9e87b3e`. El punto de partida (MS11) es un "model soup" oficial de la ronda d3-mini del 2026-11-11 (hash de soup `9a21f188…`), reconstruido a partir de dos cuerpos públicos: `qhoenix/zils-mini-decision-l13_avg678` (revisión `091c6ebe`) y `joamCriff123/zils-mini-sx3` (revisión `c9432ada`). El cuerpo inicial tiene sha256 `8c26d1ce…`.

El entrenamiento consistió en tres ejecuciones idénticas salvo por la semilla, usando el entrenador propio `train_soft.py`. Cada ejecución aplica adaptadores LoRA de rango 32, alpha 64 y dropout 0,05, sin adaptadores en las capas MLP, con learning rate 5e-5 durante 2 épocas, batch de 8 con 2 pasos de acumulación (320 pasos totales) y weight decay de LoRA de 1,0. La función de pérdida combina entropía cruzada (peso 1) y Brier score (peso 1), con peso KL 0. Se incluye un término "pin" con peso 1,0 y `--pin-train 0.1`, aunque el fichero de pin está vacío (0 filas). Los tres cuerpos resultantes se promedian y se escalan por 1,5 respecto al inicio mediante la herramienta `delta_combo.py` v1.4, afectando a 152 tensores.

Los datos de entrenamiento son el fichero lh3500 v2 con 2.560 filas (sha256 prefix `6feec371`). Las etiquetas proceden mayoritariamente de respuestas generadas por el propio autor (2.390 filas: 1.198 de una sesión de Claude, 1.190 de otra y 2 de un modelo local Phi-4), complementadas con 145 etiquetas humanas de conjuntos públicos de entrenamiento (MNLI 105, QNLI 38, SNLI 2), 20 derivadas por código de SQuAD v2, 4 etiquetas del autor sobre tuits públicos de iSarcasmEval (tarea A) y 1 calculada por código. La mayoría de filas también referencian un conjunto público de entrenamiento como ejemplo de estilo o de tema.

## Capacidades

- Generación de texto y respuesta a instrucciones sobre una base de 4,5B parámetros.
- Razonamiento de tipo "decision" (la base se denomina zils-mini-decision), orientado a tareas de clasificación y elección entre opciones.
- Capacidad de recuperación (retrieval) y respuesta sobre contexto, según las categorías evaluadas por el autor (reasoning, language, retrieval, tools, arts).
- Soporte de tool calling implícito en la categoría "tools" evaluada, aunque no se documenta un formato específico de function calling.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso.

## Casos de uso

- Clasificación y etiquetado de texto: el modelo se ha entrenado con pérdida de Brier score y datos de decisión, por lo que es adecuado para tareas de elección entre opciones (por ejemplo, yes/no o selección de categoría) en pipelines de anotación semiautomática.
- Investigación sobre ajuste fino con LoRA: sirve como caso de estudio reproducible de cómo tres ejecuciones con semillas distintas, promediadas y escaladas, afectan al rendimiento frente al cuerpo base; útil para quienes estudian técnicas de model souping y merging de pesos.
- Evaluación comparativa de técnicas de entrenamiento: al publicarse con lecturas propias detalladas (C3, hold-out, dev, copy screen), permite contrastar metodologías de evaluación interna frente a benchmarks externos.
- Prototipado de asistentes conversacionales de bajo coste: con 4,54B parámetros puede desplegarse en una única GPU de gama alta para experimentos de diálogo, siempre que se validen antes las limitaciones de calidad documentadas.
- Tareas de razonamiento sobre conjuntos pequeños: la categoría "reasoning" muestra una caída de −0,80 puntos, por lo que solo es recomendable en escenarios donde esa pérdida sea tolerable y se valide con datos propios.
- Generación de datos sintéticos para experimentos: puede emplearse como generador de etiquetas o respuestas en entornos controlados de investigación, dado que su licencia Apache 2.0 permite uso y modificación sin restricciones adicionales.
- Estudio de sesgos y alucinación en modelos pequeños: su naturaleza de artefacto de investigación y su documentación detallada lo hacen útil para analizar cómo el ajuste fino con datos generados por IA afecta al comportamiento.

## Benchmarks y rendimiento

Las únicas métricas disponibles son las lecturas internas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Se presentan a continuación tal como se documentan:

| Lectura | Resultado | Referencia (inicio MS11) |
|---|---|---|
| C3 read (media de 10 divisiones, en puntos) | −0,38 | 0 (rango −2,45 a +3,04) |
| C3 con pesos por categoría | −0,75 | umbral propio: +2,8 |
| Hold-out (cambio en probabilidad de respuesta correcta) | +0,0515 (140 filas de examen) / +0,0514 (149 filas) | supera el umbral de hold-out |
| Dev set (3.279 ítems, accuracy) | 78,59 | 79,54 (−0,94 puntos, error estándar 0,40) |
| Copy screen (máxima proporción explicada por cuerpo anterior) | 0,249 | umbral propio: 0,30 |
| Distancia de comportamiento | 0,0139 bits a zils-mini-body-32; 0,0220 bits a MS11 | umbral propio: ≥ 0,01 |

Desglose por categoría del C3 read: reasoning −0,80; language +1,52; retrieval −3,87; tools +0,96; arts +0,32. La comprobación por familias falla: tres familias por debajo del suelo de −3,0 (retrieval-score −10,38; language yes/no −5,82; tools-score −3,05).

El autor declara explícitamente que el modelo queda por debajo de su umbral preestablecido (ganancia media ≥ +2,00 con al menos 8 de 10 divisiones a +2,00 o más) y que falla la comprobación por familias. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia orientativa para un modelo denso de 4,54B parámetros, en fp16 serían necesarios aproximadamente 9 GB de pesos (coherente con el repositorio de 9,1 GB), más overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits el requisito se reduciría, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con 12-16 GB de VRAM en fp16 (por ejemplo, RTX 4080/4090) y en GPUs profesionales como A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: probablemente sí en fp16 en GPUs con 16 GB o más, aunque no está confirmado por el autor.
- Opciones de despliegue: no documentadas. El modelo usa `custom_code` y `qwen3_5` como arquitectura, por lo que requeriría cargar código remoto con `trust_remote_code=True` en transformers; no se publican pesos GGUF para llama.cpp u Ollama, ni configuración para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-34 | 4,54B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste LoRA promediado; por debajo del umbral del autor |
| zils-mini-body-32 | no disponible | no disponible | no disponible | Referenciado en la model card | Cuerpo anterior del mismo autor; distancia de comportamiento 0,0139 bits |
| MS11 (soup d3-mini) | no disponible | no disponible | no disponible | Referenciado en la model card | Punto de partida del entrenamiento |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Hugging Face | Miembro público del soup MS11 |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Hugging Face | Miembro público del soup MS11 |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a la relación de linaje y a las métricas internas del autor.

## Limitaciones y advertencias

- Calidad por debajo del umbral del propio autor: ganancia media de −0,38 puntos frente al inicio, con solo 2 de 10 divisiones por encima de +2,00; la comprobación por familias falla en retrieval-score (−10,38), language yes/no (−5,82) y tools-score (−3,05).
- Caída en dev set: accuracy de 78,59 frente a 79,54 del inicio (−0,94 puntos, error estándar 0,40), lo que sugiere un empeoramiento respecto al punto de partida.
- Datos de entrenamiento mayoritariamente sintéticos: 2.390 de 2.560 filas etiquetadas por sesiones de Claude o un modelo local Phi-4, lo que puede introducir sesgos y errores sistemáticos del generador.
- Riesgo de alucinación: no evaluado explícitamente; la naturaleza de los datos y la pérdida de Brier sugieren un enfoque hacia la calibración de probabilidades, pero no hay garantías.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe sin validación previa.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se publica como artefacto de investigación; conviene revisar el fichero NOTICE y la licencia del modelo base.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y la arquitectura `qwen3_5`, lo que implica ejecutar código del autor.
- Sin variantes cuantizadas publicadas: no hay GGUF ni otros formatos ligeros, lo que limita el despliegue en hardware modesto.
- Fecha de creación futura (2026-11-13) y ausencia de descargas o likes: metadatos que sugieren un artefacto experimental sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-34
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base 2: https://huggingface.co/joamCriff123/zils-mini-sx3
- Repositorio Zils (revisión `e9e87b3e`): no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles
