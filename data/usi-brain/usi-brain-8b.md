# USI-Brain/USI-Brain-8B

## Resumen

USI-Brain-8B es un ajuste fino (finetune) del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario USI-Brain en Hugging Face. Se distribuye como un modelo de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto como salida, apoyandose en la arquitectura Qwen3-VL de la familia Qwen. El repositorio contiene 8.767.123.696 parametros en formato safetensors y ocupa 17,5 GB.

El modelo hereda la base tecnica de Qwen3-VL-8B-Instruct, un transformer multimodal de aproximadamente 8B parametros con capacidades de vision-lenguaje y modo conversacional. Al ser un finetune, su interes principal reside en la especializacion que el autor haya podido introducir sobre la base, si bien la model card publicada es practicamente vacia y no documenta el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

La relevancia actual del modelo es limitada pero potencialmente util para quien necesite un punto de partida multimodal con licencia Apache 2.0 y compatibilidad con el ecosistema transformers y endpoints. No obstante, la ausencia de documentacion tecnica, de benchmarks y de detalles sobre el dataset de ajuste obliga a tratarlo con cautela en entornos de produccion hasta validarlo empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3-VL, tarea image-text-to-text) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen/Qwen3-VL-8B-Instruct, por lo que su arquitectura subyacente corresponde a la familia Qwen3-VL: un transformer multimodal disenado para tareas de image-text-to-text con soporte conversacional. El pipeline declarado es image-text-to-text y la libreria de referencia es transformers, con etiqueta qwen3_vl que confirma la familia arquitectonica.

No se dispone de informacion sobre el proceso de ajuste: ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones tecnicas adicionales introducidas por el autor. La model card publicada se limita a los metadatos de licencia, modelo base y pipeline, sin seccion de entrenamiento ni de evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base instruct.
- Procesamiento de imagenes junto con texto (image-text-to-text), incluyendo descripcion, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Capacidades multimodales propias de Qwen3-VL-8B-Instruct, que en la base incluyen comprension de documentos, graficos y escenas.
- Soporte de tool calling y function calling: no documentado en este finetune; debe validarse empiricamente.
- Soporte de agentes y razonamiento multi-paso: no documentado en este finetune.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio especial: no documentado para este finetune.

## Casos de uso

- Descripcion automatica de imagenes en catalogos de producto: el modelo puede recibir una imagen y generar descripciones textuales estructuradas, aprovechando su pipeline image-text-to-text para poblar fichas de e-commerce.
- Respuesta a preguntas sobre documentos escaneados: al heredar la capacidad visual de Qwen3-VL, puede extraer y razonar sobre texto presente en capturas, facturas o formularios, integrandose en flujos de digitalizacion.
- Asistencia conversacional multimodal: atencion al cliente donde el usuario adjunta una captura de pantalla o foto y el modelo responde en lenguaje natural, manteniendo contexto multi-turno.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes enviadas por usuarios para detectar contenido inapropiado, usando el modelo como componente de un pipeline de revision.
- Prototipado rapido de aplicaciones vision-lenguaje: al ser un finetune Apache 2.0 sobre una base conocida, sirve como punto de partida para experimentar con ajustes adicionales o para comparar contra la base original.
- Generacion de alt-text accesible: produccion automatica de texto alternativo para imagenes en sitios web, mejorando la accesibilidad con un modelo ligero de ~8,8B parametros desplegable en una sola GPU.
- Analisis de capturas en soporte tecnico: el modelo puede interpretar capturas de errores o interfaces y sugerir pasos de resolucion al usuario en un chat de ayuda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales (MMMU, DocVQA, etc.), ni comparaciones con la base Qwen3-VL-8B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 17,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantizacion 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque la cuantizacion no esta oficialmente publicada y habria que generarla.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de instancia unica; RTX 3090, 4080 o 4070 Ti Super para cuantizaciones.
- Cabe en GPU consumer: si, en modelos con 16-24 GB en BF16 y en 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para servido de alto throughput (verificar compatibilidad con qwen3_vl), llama.cpp/Ollama solo si se generan pesos GGUF, ya que no se distribuyen.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| USI-Brain-8B | 8,77B | no disponible | Apache 2.0 | Finetune de Qwen3-VL-8B-Instruct, sin benchmarks publicados |
| Qwen/Qwen3-VL-8B-Instruct | ~8B | no disponible en esta ficha | Apache 2.0 | Modelo base oficial, con documentacion y evaluaciones del autor original |
| Otros finetunes de Qwen3-VL-8B | ~8B | variable | variable | Dependen del autor; comparar model cards y benchmarks propios |

La comparacion directa con alternativas de la misma categoria (por ejemplo, otros modelos vision-lenguaje de ~8B como Llama 3.2 Vision 11B o InternVL) no puede completarse con datos de rendimiento porque no se han publicado mediciones para este finetune. La referencia mas fiable es el propio modelo base Qwen3-VL-8B-Instruct, cuyas capacidades y evaluaciones estan documentadas por Qwen.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de ajuste, lo que impide conocer sesgos introducidos ni la distribucion de entrenamiento.
- Riesgo de alucinacion inherente a los modelos generativos multimodales, agravado por la falta de evaluaciones que cuantifiquen la tasa de error.
- No se documentan los idiomas soportados; el comportamiento multilingue debe validarse antes de usarlo en produccion.
- Longitud de contexto no especificada en la informacion disponible; no asumir la ventana de la base sin verificarla.
- Al ser un finetune reciente (creado el 2026-11-15) con solo 19 descargas y 1 like, carece de validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- La cuantizacion no esta publicada; generar pesos GGUF/AWQ requiere trabajo adicional y puede degradar el rendimiento multimodal.
- Compatibilidad con vLLM/TGI no confirmada explicitamente; verificar soporte de qwen3_vl en la version desplegada.

## Enlaces

- Hugging Face: https://huggingface.co/USI-Brain/USI-Brain-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio Qwen en GitHub (familia Qwen3-VL): https://github.com/QwenLM/Qwen3-VL
- Documentacion de transformers: https://huggingface.co/docs/transformers
