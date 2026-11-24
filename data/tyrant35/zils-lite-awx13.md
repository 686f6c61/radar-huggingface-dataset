# tyrant35/zils-lite-awx13

## Resumen

zils-lite-awx13 es un ajuste fino (fine-tune) del modelo base malkolm777/zils-lite-l22-correct-attn, publicado por el usuario tyrant35 en Hugging Face bajo licencia Apache 2.0. Se presenta como un "decision-model" dentro de la familia Zils, es decir, un modelo orientado a tareas de decisión: clasificación, enrutamiento, selección de herramientas y resolución de preguntas con respuesta discreta, más que a la generación libre de texto. Cuenta con 852.985.920 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos de menos de mil millones de parámetros, y un repositorio de 1,7 GB.

La técnica de construcción es un "soup-pool" sobre el cuerpo d3-lite: se entrenaron tres LoRA de rango 64 sobre las proyecciones de atención del modelo base, con tasa de aprendizaje 3e-5 y una sola pasada, y posteriormente se promediaron los pesos resultantes. El cambio medio respecto al modelo base se escaló por un factor de 1,3. Los datos de entrenamiento combinan preguntas de decisión procedentes de las particiones de entrenamiento de conjuntos públicos de BigScience P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, junto con unas 10.600 preguntas de decisión generadas programáticamente cuyas etiquetas se calculan por código.

El interés del modelo reside en su especialización: no pretende competir en generación generalista, sino en precisión sobre decisiones cerradas, con un esquema de etiquetado que mezcla la etiqueta oro con las probabilidades del propio modelo base (peso 0,9 cuando el modelo base fallaba y 0,32 cuando acertaba). Es un modelo de nicho, sin descargas ni valoraciones en el momento de redactar esta ficha, y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (cuerpo d3-lite del modelo base; fine-tune LoRA sobre proyecciones de atención) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de malkolm777/zils-lite-l22-correct-attn, descrito como cuerpo "d3-lite" de la familia Zils. Sobre ese cuerpo se aplicaron tres ajustes LoRA de rango 64 sobre las proyecciones de atención, con tasa de aprendizaje 3e-5 y una única pasada de entrenamiento. Los tres adaptadores se promediaron en el espacio de pesos y el cambio agregado respecto al modelo base se multiplicó por 1,3, una técnica de escalado del delta habitual en los "model soups" para reforzar la dirección de ajuste sin reentrenar.

Los datos de entrenamiento son preguntas de decisión extraídas de las particiones de entrenamiento de conjuntos públicos incluidos en BigScience P3, junto con datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, más aproximadamente 10.600 preguntas generadas programáticamente sobre políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, extracción, rima y métrica, teoría musical, color, tablas de probabilidad y puzles de restricciones, con etiquetas calculadas en código. Las etiquetas objetivo mezclan la etiqueta oro con las probabilidades del modelo base: peso 0,9 donde la respuesta principal del modelo base era incorrecta y 0,32 donde era correcta. No se usó ninguna partición de test de benchmarks y se eliminaron las filas cuyo texto aparecía en los conjuntos de evaluación del autor. No se documenta RLHF ni DPO.

## Capacidades

- Respuesta a preguntas de decisión con salida discreta (clasificación, selección entre opciones, enrutamiento).
- Selección de herramientas y de políticas dentro de flujos de decisión.
- Manejo de instrucciones inyectadas y preguntas con restricciones explícitas.
- Aritmética de fechas y precios en el ámbito de las preguntas de decisión.
- Extracción de información y resolución de puzles de restricciones.
- Tareas auxiliares cubiertas por los datos de entrenamiento: análisis de sarcasmo (iSarcasmEval), implicación textual (NLI4CT), razonamiento causal (CLadder), verificación de hechos (HoVer) y clasificación de intención de compra (Amazon ESCI).
- Soporte de tool calling: no documentado de forma explícita; la selección de herramientas aparece solo como temática de los datos de entrenamiento.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de consultas en un sistema de atención al cliente: el modelo puede clasificar una consulta entrante en una categoría o cola concreta, ya que fue entrenado con preguntas de enrutamiento y selección de políticas.
- Selección de herramientas en un pipeline de agentes: dado un conjunto de herramientas disponibles y una petición, el modelo emite la elección discreta; encaja como clasificador previo a la ejecución de la herramienta.
- Moderación y detección de instrucciones inyectadas: los datos de entrenamiento incluyen instrucciones inyectadas, por lo que puede usarse como filtro de decisión binaria o multiclase antes de pasar el texto a un modelo generativo mayor.
- Verificación de hechos y consistencia: entrenado con HoVer y NLI4CT, puede emplearse para decidir si una afirmación está respaldada por un contexto dado en un pipeline de RAG.
- Clasificación de intención de compra y relevancia de productos: los datos de Amazon ESCI permiten usarlo para decidir si un resultado de búsqueda es exacto, sustituto, complementario o irrelevante.
- Validación de cálculos de fechas y precios: útil como comprobador de decisiones aritméticas en flujos de facturación o reservas, donde la etiqueta correcta se puede calcular por código.
- Detección de sarcasmo o tono en textos breves: aplicable a análisis de opiniones y redes sociales, aunque limitado al dominio de iSarcasmEval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB de pesos; en 4 bits, en torno a 0,5 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto corto; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPUs de consumo y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con safetensors; conversión a GGUF para llama.cpp u Ollama si se genera la cuantización; vLLM y TGI son viables por tamaño, aunque no hay configuración publicada.
- Latencia y throughput: no disponibles. Por el tamaño (menos de mil millones de parámetros) se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| tyrant35/zils-lite-awx13 | 852.985.920 | no disponible | Apache 2.0 | Decisión y clasificación | Hugging Face, 0 descargas |
| malkolm777/zils-lite-l22-correct-attn | no disponible | no disponible | no disponible | Modelo base de la familia Zils | Hugging Face |
| Modelos de decisión de menos de 1B (p. ej. clasificadores fine-tuneados de BERT o DeBERTa) | 100-500 M típicamente | 512 tokens típicamente | variable | Clasificación y NLI | Amplia |

La comparación con alternativas genéricas de la misma franja de tamaño es difícil porque no hay benchmarks publicados ni contexto documentado. Frente a un clasificador BERT clásico, este modelo ofrece un cuerpo mayor y un entrenamiento multi-tarea sobre conjuntos heterogéneos, pero carece de métricas que permitan verificar la mejora.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni conjuntos de evaluación públicos asociados, por lo que el rendimiento real es desconocido.
- El modelo se entrenó sin particiones de test de benchmarks y eliminando filas solapadas con los conjuntos de evaluación del autor; la generalización fuera de esos dominios no está verificada.
- El esquema de etiquetado mezcla etiqueta oro con probabilidades del modelo base, lo que puede introducir sesgos heredados del modelo base en las decisiones.
- El escalado del delta por 1,3 es una elección empírica del autor sin validación publicada; puede amplificar artefactos del ajuste.
- No se documentan idiomas soportados; los conjuntos de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- No se documenta la longitud de contexto; no debe asumirse una ventana larga.
- Riesgo de alucinación relevante si se usa como modelo generativo en lugar de como clasificador de decisión.
- Sesgos conocidos: no documentados, pero heredables de P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune conviene revisar la licencia y condiciones del modelo base malkolm777/zils-lite-l22-correct-attn.
- Sin descargas ni validación de la comunidad: no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-awx13
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: https://huggingface.co/datasets/bigscience/P3
- iSarcasmEval: no disponible
- VAST: no disponible
- CLadder: no disponible
- NLI4CT: no disponible
- Amazon ESCI: no disponible
- HoVer: no disponible
