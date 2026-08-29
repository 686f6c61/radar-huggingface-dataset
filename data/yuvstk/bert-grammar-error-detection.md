# yuvstk/bert-grammar-error-detection

## Resumen

`yuvstk/bert-grammar-error-detection` es un modelo de clasificación de texto binario para detección de errores gramaticales en inglés. Se trata de `google-bert/bert-base-uncased` (109,5 millones de parámetros) ajustado sobre una combinación de los conjuntos de datos BLiMP y CoLA (GLUE). El modelo recibe una oración en inglés y devuelve una etiqueta: `0` para gramatical y `1` para no gramatical, con la orientación invertida respecto a la convención nativa de CoLA.

El modelo fue desarrollado por el usuario `yuvstk` como trabajo de curso para estudiar el efecto del ajuste fino en la detección de aceptabilidad lingüística. Su relevancia radica en que demuestra transferencia positiva al combinar datos sintéticos de pares mínimos (BLiMP) con datos reales de la literatura lingüística (CoLA), alcanzando un coeficiente de correlación de Matthews (MCC) de 0,601 en CoLA, dentro del rango publicado para BERT-base (~0,55–0,60). El repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite nativo de BERT; entrenado con max_length 64) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente con masked language modeling y next sentence prediction sobre BookCorpus y Wikipedia en inglés. Sobre esta base se añade una cabeza de clasificación de secuencia con dos salidas (gramatical / no gramatical).

El ajuste fino se realizó sobre un corpus combinado de 10.895 oraciones de entrenamiento, 1.256 de validación y 1.443 de test, procedentes de dos fuentes: BLiMP (subconjuntos `anaphor_gender_agreement` y `anaphor_number_agreement`, 3.200 filas de entrenamiento, pares mínimos sintéticos balanceados al 50/50) y CoLA de GLUE (7.695 filas de entrenamiento, oraciones reales de la literatura lingüística con desbalanceo ~70/30). El reparto de datos fue cuidadoso: BLiMP se dividió por `pair_id` para evitar fugas entre pares mínimos, mientras que CoLA se dividió por filas estratificadas, usando la partición de validación de GLUE como test.

Los hiperparámetros de entrenamiento fueron: 4 épocas, tasa de aprendizaje 2e-5, warmup ratio 0,06, batch size 32, longitud máxima de secuencia 64, weight decay 0,01, optimizador AdamW y semilla 42. La selección del mejor checkpoint se hizo por MCC de validación (no accuracy, por el desbalanceo), alcanzando 0,775 en la última época. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es supervisado estándar con entropía cruzada.

## Capacidades

- Clasificación binaria de aceptabilidad gramatical: distingue oraciones gramaticales de no gramaticales en inglés.
- Detección de errores de concordancia de reflexivos (género y número), errores de argumentos verbales y restricciones de selección semántica.
- Integración sencilla con la API de `transformers` mediante `AutoModelForSequenceClassification` o pipeline de `text-classification`.
- Salida de probabilidades softmax sobre las dos clases, aunque no calibradas (ver limitaciones).
- Funciona con frases cortas (media de entrenamiento inferior a 20 palabras) y longitud máxima de 64 tokens en entrenamiento.

## Casos de uso

- Corrección gramatical asistida en editores de texto: el modelo puede integrarse en un pipeline que marque oraciones sospechosas de contener errores, aunque su limitación con omisiones y su tendencia a sobre-marcar oraciones correctas exigen un filtrado posterior con reglas o un modelo de corrección.
- Evaluación de la calidad lingüística de textos generados por IA: útil para detectar salidas no gramaticales de modelos generativos, especialmente en aplicaciones de chat o redacción automática donde la fluidez es crítica.
- Herramientas de aprendizaje de inglés como segunda lengua: puede señalar errores de concordancia de reflexivos o de argumentos verbales en producciones escritas de estudiantes, complementando sistemas de feedback más amplios.
- Filtrado de datos para entrenamiento de modelos de lenguaje: permite descartar oraciones no gramaticales en la construcción de corpus limpios, aunque su alcance se limita a los fenómenos entrenados.
- Investigación en lingüística computacional: sirve como baseline para estudiar la capacidad de BERT para capturar aceptabilidad gramatical, comparando fenómenos entrenados frente a no entrenados.
- Sistema de detección de errores en tiempo real para asistentes de escritura: con una latencia baja (BERT-base es ligero), puede ejecutarse en CPU o GPU consumer para marcar errores mientras el usuario escribe, siempre que las oraciones sean cortas.

## Benchmarks y rendimiento

La model card reporta resultados evaluados por separado por fuente, dado que la dificultad difiere enormemente entre BLiMP y CoLA:

| Test set | n | Accuracy | Precision | Recall | F1 | MCC |
|---|---|---|---|---|---|---|
| BLiMP | 400 | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 |
| CoLA | 1.043 | 0,837 | 0,833 | 0,590 | 0,691 | 0,601 |
| Pooled | 1.443 | 0,882 | 0,911 | 0,747 | 0,821 | 0,743 |

El MCC de 0,601 en CoLA está en el rango normal publicado para BERT-base (~0,55–0,60). El autor también reporta que entrenar solo con CoLA alcanzó MCC 0,576, mientras que añadir BLiMP lo elevó a 0,601 sin degradar el rendimiento en BLiMP (transferencia positiva). Como referencia, el modelo sin ajuste (`bert-base-uncased` zero-shot) ya resuelve BLiMP al 97,3% de accuracy mediante enmascaramiento del pronombre, lo que indica que el ajuste fino principalmente añade una cabeza de salida a conocimiento preexistente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 109,5 millones de parámetros. En fp32 (formato safetensors del repositorio) ocupa aproximadamente 440 MB; en fp16 o int8 se reduciría a ~220 MB o ~110 MB respectivamente, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en fp32 (por ejemplo, GTX 1650, RTX 2060 o superiores). Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti o superior).
- Cabe en GPU consumer: sí, sin problema. Incluso en CPU es viable para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con la biblioteca `transformers` de HuggingFace, `vLLM` (aunque es un modelo de clasificación, no generativo), `ONNX Runtime` y `TensorRT` mediante exportación. No se proporcionan pesos GGUF ni soporte nativo de `llama.cpp` u `Ollama` para tareas de clasificación.
- Latencia y throughput estimados: no disponibles en la documentación. Como referencia, BERT-base en una GPU moderna (RTX 3090) procesa miles de oraciones por segundo en inferencia por lotes; en CPU, decenas a cientos por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos de detección de errores gramaticales en la información proporcionada. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| yuvstk/bert-grammar-error-detection | 109,5 M | 512 tokens | Clasificación binaria (BLiMP + CoLA) | Apache 2.0 |
| BERT-base-uncased (base sin ajuste) | 109,5 M | 512 tokens | MLM, no clasificador | Apache 2.0 |
| Modelos GED basados en BERT (p. ej., arXiv 2411.15523) | ~110 M | 512 tokens | Detección de errores con datos limpios de Lang-8 | variable |

El modelo de arXiv 2411.15523, que usa BERT-base-uncased con datos limpios de Lang-8, reporta F1 de 0,91 y accuracy de 90,53% en test, pero no es directamente comparable por la diferencia de conjuntos de datos y métricas.

## Limitaciones y advertencias

- Ciego a omisiones: el modelo no detecta palabras faltantes (p. ej., "Although it was raining, we decided go for a walk" se juzga correcta), porque los datos de entrenamiento solo crean errores por sustitución, nunca por eliminación.
- Sobre-marca oraciones correctas: frases como "He is an honest man" o "She arrived at the airport" se marcan como erróneas. El recall en CoLA es 0,590 frente a una precisión de 0,833, lo que indica más falsos positivos que negativos en términos relativos.
- Fenómenos no entrenados fallan: en BLiMP `determiner_noun_agreement_1`, nunca visto en entrenamiento, el accuracy cae a 0,675 frente al 1,000 en fenómenos entrenados.
- Confianza no calibrada: varias predicciones erróneas se producen con probabilidad del 100%. El softmax no debe interpretarse como probabilidad calibrada.
- Solo inglés y frases cortas: la media de longitud de entrenamiento está muy por debajo de 20 palabras, y el límite de secuencia en entrenamiento fue de 64 tokens.
- Modelo de curso: no está pensado para producción sin validación adicional; el autor lo describe explícitamente como un trabajo académico.
- Sin cuantizaciones oficiales: solo se distribuyen pesos safetensors en fp32, lo que limita el despliegue en entornos con restricciones de memoria sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuvstk/bert-grammar-error-detection
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset BLiMP: https://huggingface.co/datasets/nyu-mll/blimp
- Dataset CoLA (GLUE): https://huggingface.co/datasets/nyu-mll/glue
- Paper relacionado (detección de errores gramaticales con BERT y datos limpios): https://arxiv.org/abs/2411.15523
- Proyecto GECwBERT (uso de LM para corrección gramatical): https://sunilchomal.github.io/GECwBERT/
- Repositorio de referencia (corrección gramatical con BERT): https://github.com/stephen-cheng/grammar_correction_with_bert
