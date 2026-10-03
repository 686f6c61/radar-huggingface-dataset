# Super-Dinosaur059/hw1-hc3-detector

## Resumen

El modelo `Super-Dinosaur059/hw1-hc3-detector` es un clasificador de secuencias basado en BERT (variante MiniLM) publicado en HuggingFace por el usuario Super-Dinosaur059. Su tarea es la clasificación binaria de respuestas en inglés: distinguir entre respuestas escritas por personas y respuestas generadas por ChatGPT. Se trata de un modelo de tamaño reducido, con 22.713.986 parámetros en formato safetensors, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU o en GPUs de consumo.

El modelo parece corresponder a un trabajo academico (el identificador `hw1_hc3` y el notebook `hw1_hc3.ipynb` citado en la model card apuntan a una practica de curso) y no a un lanzamiento de produccion de un laboratorio. Su relevancia es por tanto limitada y de caracter experimental o educativo: sirve como ejemplo reproducible de fine-tuning de un encoder pequeno para deteccion de texto generado por IA, una tarea con interes creciente en moderacion de contenido, integridad academica y filtrado de datos.

El dato mas destacable es su rendimiento declarado en el conjunto de prueba retenido: 98,50 % de exactitud frente al 84,49 % de una linea base con embeddings congelados y regresion logistica, lo que supone una mejora de 14,01 puntos porcentuales. No se especifica licencia, idiomas soportados ni pipeline de HuggingFace, lo que limita su uso directo en produccion sin aclaraciones previas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (variante MiniLM, segun la model card); clasificador de secuencias |
| Parametros totales | 22.713.986 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (los clasificadores basados en BERT suelen limitarse a 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se ofrecen variantes GGUF ni cuantizadas en el repositorio) |
| Idiomas soportados | no disponible (el dataset HC3 empleado en la evaluacion es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline de HuggingFace | no disponible |
| Tamano del repositorio | 0,1 GB |
| Tarea | Clasificacion binaria (respuesta humana vs. respuesta ChatGPT) |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El modelo es un `sequence classifier` construido sobre un encoder MiniLM. La model card describe dos aproximaciones evaluadas sobre el mismo conjunto de prueba: (1) una linea base con embeddings de frases MiniLM congelados seguidos de una regresion logistica, y (2) un clasificador de secuencias MiniLM afinado durante cinco epocas. El modelo publicado corresponde a la segunda opcion, es decir, un fine-tuning completo (o al menos de la cabeza y capas superiores, el detalle no se especifica) sobre la tarea de deteccion de texto generado por IA.

La tarea de clasificacion es binaria: la etiqueta "human" frente a la etiqueta "ChatGPT". El conjunto de prueba retenido consta de 4.668 respuestas, balanceado exactamente con 2.334 respuestas humanas y 2.334 respuestas de ChatGPT, lo que sugiere un dataset construido a partir de HC3 (Human ChatGPT Comparison Corpus) o de una particion equivalente. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del corpus, ni si se aplicaron tecnicas de regularizacion, aumentacion de datos o ajuste de hiperparametros mas alla del numero de epocas. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de calibracion de probabilidades. No se describe ninguna innovacion arquitectonica adicional: se trata de un fine-tuning convencional de un encoder pequeno para clasificacion.

## Capacidades

- Clasificacion binaria de texto: determina si una respuesta dada es de origen humano o generada por ChatGPT.
- Deteccion de texto sintetico en el dominio del dataset de evaluacion (respuestas tipo pregunta-respuesta en ingles, presumiblemente HC3).
- Inferencia ligera: con 22,7 M de parametros puede ejecutarse en CPU sin GPU dedicada.
- Salida de probabilidades por clase mediante la cabeza de clasificacion de HuggingFace, lo que permite fijar umbrales de decision personalizados.
- No dispone de generacion de texto: es un modelo exclusivamente discriminativo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el corpus de evaluacion es en ingles.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Deteccion de texto generado por IA en plataformas educativas: el modelo puede integrarse como senal auxiliar en la revision de trabajos escritos, clasificando respuestas de alumnos como humanas o generadas por ChatGPT. Su tamano reducido permite desplegarlo en un servicio interno sin GPUs dedicadas.
- Filtrado y limpieza de datasets de entrenamiento: en la construccion de corpus para entrenar otros modelos, este clasificador puede usarse para eliminar respuestas generadas por IA de un dataset de Q&A, reduciendo el riesgo de contaminacion y de colapso por datos sinteticos.
- Moderacion de contenido en comunidades y foros: pre-filtro que marque automaticamente respuestas sospechosas de ser generadas por IA para revision humana posterior, reduciendo la carga de moderacion manual.
- Auditoria de encuestas y formularios abiertos: deteccion de respuestas generadas automaticamente en encuestas, formularios de feedback o estudios academicos con campos de texto libre.
- Investigacion sobre deteccion de texto sintetico: como punto de partida reproducible (linea base MiniLM afinada) para comparar con detectores mas grandes o con enfoques basados en perplexidad y watermarking.
- Sistema de triaje en pipelines de anotacion humana: descartar o marcar automaticamente ejemplos probablemente sinteticos antes de enviarlos a anotadores, reduciendo coste por ejemplo anotado.
- Analisis retrospectivo de corpus historicos: clasificar respuestas recopiladas antes y despues de la irrupcion de los asistentes conversacionales para medir el cambio en la proporcion de contenido generado por IA.
- Despliegue en el borde (edge) o en navegador: al tener solo 22,7 M de parametros, es viable exportarlo a ONNX y ejecutarlo en el cliente sin enviar el texto a un servidor, lo que facilita el cumplimiento de requisitos de privacidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre una particion de prueba retenida de 4.668 respuestas (2.334 humanas y 2.334 de ChatGPT):

| Modelo | Exactitud en test | Predicciones correctas | Errores |
|---|---:|---:|---:|
| Linea base: embeddings MiniLM congelados + regresion logistica | 84,49 % (0,844901) | 3.944 / 4.668 | 724 |
| Clasificador MiniLM afinado, cinco epocas | 98,50 % (0,985004) | 4.598 / 4.668 | 70 |

La mejora del fine-tuning respecto a la linea base es de aproximadamente 14,01 puntos porcentuales.

Matrices de confusion (filas: etiqueta real; columnas: prediccion):

| Clase real | Linea base: pred. humano | Linea base: pred. ChatGPT | Fine-tuned: pred. humano | Fine-tuned: pred. ChatGPT |
|---|---:|---:|---:|---:|
| Humano | 1.946 | 388 | 2.264 | 70 |
| ChatGPT | 336 | 1.998 | 0 | 2.334 |

El modelo afinado clasifico correctamente las 2.334 respuestas de ChatGPT del split, pero etiqueto erroneamente 70 respuestas humanas como ChatGPT. El propio autor advierte que este resultado no implica una deteccion perfecta sobre otros datos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 90 MB en fp32 y 45 MB en fp16 para los pesos del modelo. La memoria real dependera de la longitud de secuencia y del tamano de lote; con lotes pequenos el consumo total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050 o superiores). En la practica no se necesita GPU: el modelo esta pensado para ejecutarse tambien en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Cabe en CPU: si, con latencias del orden de decenas de milisegundos por ejemplo (estimacion orientativa; no se proporcionan medidas reales de latencia ni de throughput).
- Opciones de despliegue: `transformers` con `pipeline` de clasificacion de texto, exportacion a ONNX Runtime (recomendada para CPU y para cuantizacion int8), TorchScript, o un servicio HTTP ligero con FastAPI y Uvicorn. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de los modelos comparables sobre la misma particion de prueba, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto maximo tipico | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hw1-hc3-detector (este modelo) | 22,7 M | no disponible | Clasificacion humana vs. ChatGPT | no disponible | HuggingFace, safetensors |
| MiniLM-L6-v2 (encoder base sobre el que se construye) | 22,7 M | 512 tokens (segun el modelo base; no confirmado para este fine-tuning) | Embeddings de frases / encoder general | Apache 2.0 (habitual en la familia MiniLM; no confirmado en este repositorio) | Ampliamente disponible |
| DistilBERT-base | 66 M | 512 tokens | Encoder general / clasificacion | Apache 2.0 | Ampliamente disponible |
| RoBERTa-base | 125 M | 512 tokens | Encoder general / clasificacion | MIT | Ampliamente disponible |

Rendimiento comparado: no disponible. El autor solo compara contra su propia linea base de MiniLM congelado mas regresion logistica, no contra detectores de texto generado por IA de terceros.

## Limitaciones y advertencias

- Ausencia total de licencia declarada. Sin una licencia explicita, no hay autorizacion clara para uso comercial, redistribucion o modificacion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- El 98,50 % de exactitud procede de un unico conjunto de prueba retenido, presumiblemente con la misma distribucion que el entrenamiento (dominio HC3). Es un resultado en dominio y no garantiza generalizacion a otros dominios, idiomas, estilos de redaccion o modelos generativos distintos de ChatGPT.
- Sesgo de deteccion conocido: 70 respuestas humanas fueron clasificadas como ChatGPT (falsos positivos), mientras que ninguna respuesta de ChatGPT fue clasificada como humana. Esto implica una tendencia estructural a sobreestimar la presencia de IA, con el consiguiente riesgo de acusaciones erroneas en contextos de integridad academica o moderacion.
- El conjunto de prueba esta perfectamente balanceado (50 % / 50 %). En escenarios reales, donde la prevalencia de texto generado por IA suele ser mucho menor, el valor predictivo positivo caeria drasticamente aunque la exactitud se mantuviera.
- Vulnerabilidad a evasion adversarial: parafraseo, edicion manual, cambios de estilo o el uso de otros modelos generativos pueden degradar la deteccion de forma severa.
- Idioma: el corpus de evaluacion es en ingles y no se declaran idiomas soportados; el comportamiento en castellano es desconocido.
- Longitud de contexto no documentada; si sigue el limite tipico de los encoders BERT (512 tokens), las respuestas largas se truncaran, perdiendo informacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de calibracion deficiente de las probabilidades, por lo que no se recomienda usar la salida como prueba concluyente sin umbrales ajustados y validacion externa.
- Modelo de caracter academico y experimental: 0 descargas y 1 like en el momento de la consulta, sin pipeline declarado, sin informacion de idiomas y sin documentacion sobre el dataset exacto de entrenamiento ni sobre hiperparametros.
- No debe utilizarse como unico criterio para sancionar, acusar o rechazar contenido; cualquier decision con consecuencias sobre personas requiere revision humana.

## Enlaces

- HuggingFace: https://huggingface.co/Super-Dinosaur059/hw1-hc3-detector
- Repositorio de pesos: incluido en la misma pagina de HuggingFace (formato safetensors, 0,1 GB).
- Notebook de entrenamiento y evaluacion: `hw1_hc3.ipynb`, citado en la model card pero sin enlace publico disponible.
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los resultados obtenidos correspondian a cadenas de supermercados francesas y a un portal municipal, sin ninguna conexion con este repositorio.
