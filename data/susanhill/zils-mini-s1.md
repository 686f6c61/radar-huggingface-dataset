# SusanHill/zils-mini-s1

## Resumen

zils-mini-s1 es un modelo de lenguaje de 4.539 millones de parámetros (4,54 mil millones) publicado por el usuario SusanHill en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, orientado a tareas de decisión según la etiqueta `decision` de su model card. El modelo se distribuye bajo licencia Apache-2.0 y en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere cargar módulos específicos del repositorio para su ejecución.

La model card describe el proceso de construcción como un "soup" (promedio de pesos) de un cuerpo d3-mini: un estudiante LoRA-64 destilado a partir de las probabilidades de un profesor denominado vllm-sr/d3-flash, entrenado sobre un pool público de decisiones en su partición de entrenamiento. Posteriormente, los pesos resultantes se promediaron al 50/50 con el "chasis" del pool. Esta técnica de destilación más weight averaging es habitual en modelos compactos que buscan heredar capacidades de un modelo mayor con un coste de inferencia reducido.

La relevancia del modelo es limitada por su escasa tracción (0 descargas, 0 likes en el momento de la ficha) y por la ausencia de documentación detallada sobre datos de entrenamiento, idiomas o evaluación. Aun así, su tamaño de 4,5B y su base Qwen3.5 lo sitúan en la categoría de modelos pequeños desplegables en GPU de consumo, lo que puede resultar atractivo para experimentación con destilación y tareas de decisión acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros. Sobre esa base se aplicó un proceso de destilación: un estudiante con adaptadores LoRA de rango 64 fue entrenado para imitar las probabilidades de salida de un profesor identificado como vllm-sr/d3-flash, usando un pool público de datos de decisión en su split de entrenamiento. Posteriormente, los pesos del estudiante se promediaron al 50/50 con los del "chasis" del pool (el modelo base o contenedor de referencia), una técnica de model soup que busca combinar la especialización del estudiante con la robustez del modelo original.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla si se introdujeron innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) más allá de las propias de Qwen3.5. La presencia de `custom_code` en el repositorio sugiere que la carga del modelo requiere código específico del autor, probablemente para gestionar los adaptadores o la fusión de pesos.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Orientación a tareas de decisión (etiqueta `decision`), aunque no se detalla el tipo concreto de decisión (clasificación, enrutamiento, elección entre opciones, etc.).
- Capacidades multilingües: no disponibles en la información proporcionada; se desconoce qué idiomas cubre más allá de lo que herede de Qwen3.5.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con destilación de modelos: el modelo sirve como caso de estudio reproducible de destilación LoRA-64 desde un profesor mayor y posterior weight averaging, útil para investigadores que quieran replicar o analizar la técnica.
- Tareas de decisión acotadas: dado su etiquetado `decision`, puede emplearse en prototipos de enrutamiento o clasificación de intenciones, siempre que se valide su comportamiento con datos propios, ya que no hay evaluación publicada.
- Despliegue en GPU de consumo: con ~4,5B parámetros y pesos safetensors (repo de 9,1 GB en fp16), es viable en tarjetas con 12-16 GB de VRAM tras cuantización, lo que permite probarlo en estaciones de trabajo locales.
- Base para ajuste fino adicional: al ser Apache-2.0 y derivar de Qwen3.5-4B, puede servir como punto de partida para LoRA o fine-tuning completo en dominios específicos.
- Generación de texto general en entornos con restricciones de coste: su tamaño moderado permite inferencia más barata que modelos de 7B-13B, adecuado para tareas de resumen o redacción no críticas.
- Investigación sobre model soups: permite estudiar el efecto del promedio 50/50 entre estudiante y chasis en la estabilidad y el rendimiento del modelo resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9 GB en fp16 (4,54B × 2 bytes), ~4,5-5 GB en cuantización de 8 bits y ~2,5-3 GB en 4 bits (estimación teórica; no confirmada por el autor).
- GPU recomendadas: A100, H100 o L40S para fp16 sin cuantizar; RTX 4090, RTX 3090 o RTX 4080 para fp16 con margen; RTX 4070/4060 Ti (12-16 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM usando cuantización; en fp16 requiere al menos 10-12 GB libres.
- Opciones de despliegue: al incluir `custom_code`, es probable que requiera `transformers` con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, por lo que habría que convertir los pesos a GGUF o verificar el soporte antes de usarlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-s1 | ~4,54B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Finetune de decisión sobre Qwen3.5-4B con destilación y soup |
| Qwen3.5-4B (base) | ~4B | no disponible en esta ficha | Apache-2.0 (según base) | Hugging Face | Modelo original del que deriva; sin especialización en decisión |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (según versión) | Apache-2.0 | Hugging Face | Alternativas de tamaño similar con documentación y benchmarks públicos |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Hugging Face, Meta | Alternativa pequeña con evaluación publicada y restricciones de licencia |

La comparación cuantitativa de rendimiento no es posible porque zils-mini-s1 no publica benchmarks. Frente a Qwen3.5-4B, la diferencia principal es la especialización en decisión y el proceso de destilación; frente a Llama 3.2 3B, la licencia Apache-2.0 es más permisiva, pero la falta de documentación y evaluación es una desventaja clara.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación sobre datos de entrenamiento, idiomas y contexto: no se puede evaluar su calidad objetivamente.
- Riesgo de alucinación: al ser un modelo pequeño y sin evaluación publicada, no hay garantías sobre la fiabilidad de sus respuestas en producción.
- Sesgos conocidos: no documentados; al heredar de Qwen3.5-4B y de un pool de datos no especificado, pueden persistir sesgos del modelo base y del dataset de destilación.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto efectiva y la cobertura lingüística; no se debe asumir soporte multilingüe sin validación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias del modelo base Qwen3.5-4B y del profesor vllm-sr/d3-flash, así como de los datos del pool, antes de un despliegue comercial.
- `custom_code`: requiere ejecutar código del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de seguridad si no se audita el código.
- Madurez: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad; no se recomienda para producción sin pruebas exhaustivas.
- Fecha de creación (2026-11-24) y actualización casi inmediata: el repositorio parece recién publicado y podría cambiar o desaparecer.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor referenciado (vllm-sr/d3-flash): no disponible como enlace verificado en la información proporcionada
- Paper, blog o demo: no disponibles
