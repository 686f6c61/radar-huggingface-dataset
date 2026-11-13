# tensor-tailor/zils-lite-body-16

## Resumen

zils-lite-body-16 es un ajuste fino por LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario tensor-tailor y publicado en Hugging Face. Se trata de un "body" (cuerpo de decisión) destinado al pool de soups del ecosistema Zils `d3-lite`, asociado al subnet 127 de Bittensor. El modelo parte del promedio uniforme de dos miembros del soup: Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos bajo licencia Apache-2.0.

El cambio introducido consiste en seis ajustes LoRA independientes (uno por semilla) sobre las proyecciones de atención y Gated-DeltaNet de todas las capas del lenguaje, con rango 32, alpha 64 y sin dropout. Las proyecciones MLP no se entrenaron. Los seis cuerpos resultantes se promediaron de forma uniforme y se aplicó un factor de escala de 1,25 respecto al punto de partida: `body = start + 1.25 × (mean(six fine-tuned bodies) − start)`.

Con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB, el modelo se enmarca en la categoría de modelos pequeños (sub-1000M) orientados a tareas de decisión y clasificación dentro de un pipeline de minería. Su relevancia es acotada al ecosistema Zils y a experimentos de merging de pesos; no es un modelo de propósito general ni presenta benchmarks públicos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (familia Qwen/Qwen3.5-0.8B), con proyecciones de atención y Gated-DeltaNet ajustadas por LoRA |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere código personalizado para carga) |

## Arquitectura y entrenamiento

El modelo se construye sobre la familia Qwen3.5-0.8B, un transformer denso de aproximadamente 853M de parámetros. El ajuste se realizó mediante seis ejecuciones LoRA independientes con semillas 5002, 5012, 5022, 5032, 5042 y 5052. Cada LoRA aplica rango 32, alpha 64, sin dropout, sobre las proyecciones de atención y Gated-DeltaNet de todas las capas del lenguaje; las proyecciones MLP quedan congeladas. La configuración de entrenamiento incluye learning rate 5e-5, weight decay 1.0, 1 época, batch 8, 403 pasos de optimizador por ejecución, label smoothing 0.05 y una retención KL de 0.1 respecto al punto de partida en cada fila. Además, se retuvieron 290 prompts ancla sin etiquetar contra el modelo inicial y se ponderó al alza la pérdida en las filas que el modelo de partida encontraba difíciles.

Los datos de entrenamiento consisten en 2.929 filas del dataset propio "lh3500", distribuidas en las 15 familias conocidas del examen (5 categorías × elección / sí-no / puntuación). Las filas fueron escritas por el equipo, verificadas mediante respuesta ciega independiente y guardas de fila, o generadas por programas con comprobación de reglas. No se utilizaron archivos del split de examen, ítems semilla públicos de Zils, datos de Glaive, BIG-bench ni MMLU, ni salidas de otros mineros como etiquetas. Tras el entrenamiento, los seis cuerpos se promediaron uniformemente y se aplicó el factor 1,25 respecto al punto de partida. El hash del cuerpo resultante es 5468229fc32f4ceaf3819455991bd54c66273ca5db41fa0204d07fa3eba33fd0.

## Capacidades

- Generación de texto y respuestas de decisión en formato de elección múltiple, sí-no y puntuación, según las 15 familias del examen Zils.
- Razonamiento de decisión de un solo paso orientado a tareas de clasificación y selección.
- Ajuste especializado en proyecciones de atención y Gated-DeltaNet, lo que preserva el comportamiento de las capas MLP del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Minería en el subnet 127 de Bittensor: el modelo actúa como cuerpo de decisión dentro del pool de soups `d3-lite`, respondiendo a los ítems del examen en las 15 familias definidas. Es adecuado porque ha sido entrenado específicamente sobre ese formato y con retención KL respecto al soup de partida.
- Experimentación con merging de pesos: sirve como caso de estudio de promediado de múltiples LoRA (seis semillas) con factor de escala 1,25, útil para investigadores que estudian la dinámica de soups y la estabilidad de merges.
- Evaluación de retención KL en ajuste fino: el uso de una retención de 0.1 KL por fila y 290 prompts ancla lo convierte en un ejemplo práctico de cómo limitar la deriva respecto a un modelo de referencia durante el entrenamiento.
- Clasificación de texto corto en dominios acotados: dado su tamaño (853M) y su entrenamiento en familias de elección/sí-no/puntuación, puede emplearse en tareas de etiquetado controlado donde el formato de salida esté bien definido.
- Prototipado en entornos con recursos limitados: con 1,7 GB en safetensors, el modelo puede cargarse en GPUs de consumo para pruebas de inferencia, siempre que se disponga del código personalizado (`custom_code`) requerido.
- Reproducción de pipelines de minería: el hash del cuerpo y del safetensors permiten verificar la integridad del modelo en flujos de validación y auditoría dentro del ecosistema Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la lectura local del modelo frente al punto de partida es "pequeña y por debajo del umbral de commit" del propio equipo, y que se somete para conocer su puntuación real. También se reporta una similitud coseno de 0,99694 respecto al soup en la pantalla de copia (con línea en 0,999) y una contribución explicada por cuerpos anteriores inferior a 0,30.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 852.985.920 parámetros, en FP16 se requieren aproximadamente 1,7 GB de pesos; en FP32, unos 3,4 GB; en cuantizaciones de 8 bits, alrededor de 0,85 GB; en 4 bits, unos 0,43 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que el código personalizado sea compatible.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del repositorio (1,7 GB) y el número de parámetros.
- Opciones de despliegue: no disponible. El modelo requiere `custom_code` y está etiquetado con `qwen3_5`, por lo que la carga mediante vLLM, llama.cpp, Ollama o TGI no está confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-lite-body-16 | 852.985.920 | no disponible | apache-2.0 | Hugging Face, requiere custom_code | Body de decision del pool d3-lite |
| Charlie320/zils-lite-v9a | no disponible | no disponible | apache-2.0 | Hugging Face | Miembro del soup de partida |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | apache-2.0 | Hugging Face | Miembro del soup de partida |
| Qwen/Qwen3.5-0.8B (familia base) | ~0,8B | no disponible | no disponible en la informacion | Hugging Face | Modelo base de la familia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para el examen del subnet 127 de Bittensor y las 15 familias de decisión; su utilidad fuera de ese dominio es limitada.
- No se han publicado benchmarks ni métricas de rendimiento independientes; la única evaluación es la lectura local del autor, que él mismo califica como pequeña y por debajo de su umbral de commit.
- Requiere `custom_code` para su carga, lo que puede complicar la integración con frameworks estándar de inferencia.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de pesos de terceros (Charlie320 y qhoenix) y de la familia Qwen3.5; deben respetarse las condiciones de los upstream.
- El autor declara no tener afiliación ni respaldo de los autores upstream.
- El uso de un factor de escala de 1,25 sobre el promedio de seis LoRA puede introducir deriva respecto al comportamiento del soup original; la retención KL de 0.1 mitiga pero no elimina este riesgo.
- No se garantiza la reproducibilidad exacta del entrenamiento, aunque se publican hashes del safetensors y del cuerpo Zils para verificación.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-16
- Modelo base miembro del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base miembro del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Familia base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B (referencia de la familia, no verificada en la informacion proporcionada)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
