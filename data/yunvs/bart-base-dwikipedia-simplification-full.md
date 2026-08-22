# yunvs/bart-base-dwikipedia-simplification-full

## Resumen

El modelo `yunvs/bart-base-dwikipedia-simplification-full` es un ajuste fino de `facebook/bart-base` (arquitectura BART, 139 millones de parámetros) para la simplificación de texto en inglés a nivel de documento. Fue desarrollado por yunvs en el contexto de una tesis de grado sobre simplificación automática de textos web cotidianos, y sirve como modelo de documento en el backend del proyecto `simple-website`. Su función principal es reescribir un pasaje completo de varias frases en un lenguaje más sencillo, con la capacidad de eliminar, fusionar, dividir y reordenar oraciones, por lo que la salida no mantiene una correspondencia posición por posición con la entrada.

El modelo se entrenó sobre el corpus D-Wikipedia (Sun et al., EMNLP 2021), compuesto por 131 739 documentos de entrenamiento tras un filtrado estricto de mojibake, y alcanza una pérdida de validación de 0,3352 en el checkpoint seleccionado (época 4). La ventana de contexto es de 512 tokens, y el modelo está pensado para procesar secciones completas de texto, no para simplificar oraciones aisladas. Su relevancia radica en ofrecer una solución específica para la accesibilidad de contenido web en inglés, con una evaluación rigurosa sobre la partición de test del propio corpus D-Wikipedia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder) |
| Parametros totales | 139.470.681 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de entrenamiento y de generación) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/bart-base`, un transformer encoder-decoder pre-entrenado con denoising autoencoder sobre texto en inglés. El ajuste fino se realizó sobre el corpus D-Wikipedia, que contiene pares de documentos originales y simplificados a nivel de documento completo. El entrenamiento se ejecutó en una NVIDIA RTX A5000 con precisión bf16, durante 5 épocas (20.585 pasos), con tamaño de lote 32, tasa de aprendizaje 3e-5, decaimiento de pesos 0,01 y una longitud máxima de 512 tokens. El checkpoint seleccionado (época 4) alcanzó una pérdida de validación de 0,3352, con una curva de pérdida monótona decreciente que se estabiliza a partir de la época 3.

La innovación principal es la simplificación a nivel de documento, que permite operaciones estructurales como fusión y reordenación de oraciones, algo que los modelos a nivel de frase no pueden lograr. El modelo se entrena con texto en minúsculas y pre-tokenizado según el estándar Penn Treebank (PTB), y no admite saltos de línea en el cuerpo del documento, ya que no los ha visto en entrenamiento.

## Capacidades

- Simplificación de texto en inglés a nivel de documento completo: reescribe pasajes multi-oración en un inglés más sencillo, pudiendo eliminar, fusionar, dividir y reordenar oraciones.
- Generación de texto en inglés, con salida en minúsculas y tokenización PTB, que requiere desnormalización posterior.
- Manejo de contextos de hasta 512 tokens, con truncamiento silencioso más allá de ese límite.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio).
- Es un modelo monolingüe (solo inglés), sin capacidades multilingües.

## Casos de uso

- Accesibilidad web: simplificar el contenido de páginas web informativas (noticias, artículos de salud, trámites administrativos) para lectores con baja alfabetización o dificultades de comprensión. El modelo puede procesar secciones completas de un artículo, preservando la estructura y mejorando la legibilidad.
- Generación de versiones simplificadas de artículos de Wikipedia: dado que el corpus de entrenamiento proviene de Wikipedia, el modelo está especialmente adaptado para este tipo de contenido, produciendo resúmenes simplificados de entradas enciclopédicas.
- Preprocesamiento de textos para sistemas de lectura asistida: convertir documentos técnicos o jurídicos en versiones más accesibles antes de su publicación en portales de transparencia o servicios públicos.
- Creación de contenido educativo: simplificar textos académicos o científicos para estudiantes de niveles iniciales, manteniendo la información esencial pero reduciendo la complejidad sintáctica y léxica.
- Adaptación de manuales de usuario y documentación técnica: reescribir instrucciones de productos o procedimientos para hacerlos más claros y fáciles de seguir por usuarios no expertos.
- Integración en un pipeline de simplificación automática para un sitio web, como el proyecto `simple-website` del autor, donde el modelo sirve como componente de reescritura de documentos completos antes de presentarlos al usuario final.

## Benchmarks y rendimiento

La evaluación se realizó sobre la partición de test de D-Wikipedia (n = 8.000 documentos) y se comparó con el modelo base sin ajuste y con un LLM de 7B. Los resultados se presentan en la siguiente tabla:

| Modelo | D-SARI ↑ | SARI ↑ | BLEU | FKGL ↓ | BERTScore | LENS |
|---|---|---|---|---|---|---|
| **Este modelo** | **35,44** | 41,95 | 27,21 | **7,86** | **90,61** | 45,61 |
| `facebook/bart-base` (zero-shot) | 14,34 | 21,60 | 16,66 | 9,69 | 88,80 | 33,42 |
| `qwen2.5:7b-instruct-q4_K_M` (prompted, n=2.000) | 22,37 | 39,60 | 13,0 | (no disponible) | (no disponible) | (no disponible) |

La comparación con el LLM de 7B se realizó sobre un subconjunto de 2.000 documentos y el modelo aquí descrito supera en D-SARI y BERTScore, aunque el LLM tiene un SARI similar. La prueba de bootstrap pareada sobre D-SARI da un p < 0,001, indicando una diferencia estadísticamente significativa frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 279 MB (139M parámetros × 2 bytes). En fp32, 558 MB. Si se cuantiza a int8 o int4, el uso de VRAM sería menor, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo RTX 3060, RTX 4060, RTX 4090, A100, H100. Incluso puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama de entrada como GTX 1660 (6 GB) o RTX 3050.
- Opciones de despliegue: la integración con `transformers` permite usarlo en entornos como vLLM (para inferencia secuencial), aunque no es un modelo de solo decoder; también se puede servir con TGI (Text Generation Inference) o mediante un servidor custom con FastAPI. Para despliegue en CPU, `llama.cpp` no es aplicable porque es un modelo seq2seq, pero se puede usar con `onnxruntime` o `torch` en CPU.
- Latencia y throughput: en una GPU RTX 4090, la generación de una simplificación de 100 tokens con beam=4 tarda típicamente menos de 1 segundo; en CPU (8 núcleos) puede tardar varios segundos por documento. No se dispone de benchmarks de throughput publicados.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada comparaciones con otros modelos específicos de simplificación de texto a nivel de documento (por ejemplo, otros fine-tunes de BART o T5). La única comparativa disponible es con el modelo base sin ajuste y con un LLM de 7B. Por lo tanto, se indica que no se dispone de una comparativa con alternativas de la misma categoría. El modelo se posiciona como una solución ligera y específica para la simplificación de documentos en inglés, frente a LLMs más grandes que requieren más recursos.

## Limitaciones y advertencias

- Requiere un preprocesamiento estricto: el texto de entrada debe estar en minúsculas, tokenizado según el estándar Penn Treebank y sin saltos de línea. Si no se respeta, la calidad de la salida se degrada notablemente, llegando a provocar alucinaciones factuales (ejemplo documentado: "northern Netherlands" → "northern hemisphere").
- La salida es en minúsculas y pre-tokenizada; es necesario un paso de desnormalización (como el implementado en `backend/document_text.py`) antes de mostrar el texto al usuario.
- La ventana de contexto es de 512 tokens y el modelo trunca el exceso, descartando el texto restante. Para documentos largos (un artículo de Wikipedia típico de 2.459 tokens), hay que dividir el texto en secciones de menos de 512 tokens antes de simplificar.
- No se deben incluir encabezados en el texto de entrada, ya que el modelo los repite en la salida.
- El modelo solo soporta inglés; no es útil para otros idiomas.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero exige compartir bajo la misma licencia si se distribuyen obras derivadas. Es necesario verificar la compatibilidad con el uso previsto en producción.
- No se han publicado cuantizaciones ni versiones optimizadas para despliegue en entornos de baja latencia.
- Al ser un modelo de 139M parámetros, no tiene capacidades de razonamiento complejo ni de tool calling; su único propósito es la simplificación de texto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yunvs/bart-base-dwikipedia-simplification-full)
- [Repositorio del proyecto simple-website](https://github.com/yyvs/simple-website)
- [Documentación de BART en Hugging Face](https://huggingface.co/docs/transformers/model_doc/bart)
