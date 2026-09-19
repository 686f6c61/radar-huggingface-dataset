# starmatrixtechnologies/betterlens-text-classifier

## Resumen

BetterLens Text Classifier es un modelo de clasificación de texto corto desarrollado por Star Matrix Technologies. Se construye sobre el backbone `distilbert-base-uncased` (66.365.956 parámetros) al que se añaden dos cabezas lineales que se ejecutan en un único forward pass: una cabeza de sentimiento con 3 clases (`positive`, `neutral`, `negative`) y una cabeza de regresión que puntúa la vaguedad del texto en el rango [0, 1], donde 0 indica contenido específico y 1 contenido difuso. La composición de ambas señales es la regla central del producto BetterLens: actuar sobre una publicación solo cuando es simultáneamente negativa y vaga.

El modelo resuelve un problema concreto de filtrado y triaje de contenido generado por usuarios: distinguir una queja concreta y accionable ("esta actualización rompió mi build") de una negatividad difusa y poco útil ("todo va mal últimamente"). Frente a un clasificador de sentimiento convencional, añade un eje de especificidad que permite priorizar el feedback procesable y descartar el ruido, algo relevante para equipos de producto, moderación y soporte que operan sobre volúmenes altos de texto corto.

Es relevante ahora por tres motivos prácticos: su tamaño reducido (66 M de parámetros, ~0,5 GB de repositorio), su latencia en CPU (~19 ms por publicación en ONNX FP32) y la inclusión de un export ONNX que permite ejecutarlo íntegramente en el navegador o en dispositivos edge sin enviar datos a un servidor. La licencia es MIT y el modelo está publicado en inglés, con una longitud máxima de secuencia de 128 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con dos cabezas lineales; clase custom `betterlens_dual_head` |
| Parametros totales | 66.365.956 (~66,4 M), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia; no es un modelo generativo) |
| Tipos de cuantizacion | No disponible: solo se publican pesos FP32 (safetensors y ONNX FP32). No hay versiones GGUF, INT8, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (FP32) y `onnx/model.onnx` (FP32, opset 14, ~253 MB) |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Pooling | Token `[CLS]` tras Dropout 0,1 compartido |
| Cabezas | `sentiment_head`: `Linear(768 → 3)`; `vagueness_head`: `Linear(768 → 1)` + sigmoide en inferencia |
| Funcion de perdida | Combinada: `0,6 · CrossEntropy(sentimiento) + 0,4 · MSE(vaguedad)` |
| Pipeline | `text-classification` |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo DistilBERT, es decir, una destilación de BERT con 6 capas, representación oculta de 768 dimensiones y 12 cabezas de atención, que aporta en torno a 66 M de parámetros. Sobre la representación del token `[CLS]`, y tras un Dropout compartido de 0,1, se aplican dos cabezas independientes: una proyección lineal de 768 a 3 dimensiones que produce los logits de sentimiento (`positive`, `neutral`, `negative`) y una proyección lineal de 768 a 1 dimensión que produce un logit de vaguedad, al que se aplica una sigmoide en inferencia para obtener un valor en [0, 1]. Ambas cabezas se calculan en la misma pasada hacia delante, por lo que el coste computacional es similar al de un clasificador de una sola tarea. El modelo emplea una clase custom (`modeling_betterlens_dual_head.py`, `configuration_betterlens_dual_head.py`) incluida en el repositorio, lo que obliga a cargarlo con `trust_remote_code=True`.

La model card no especifica la composición del dataset de entrenamiento, el número de tokens visto ni si hubo fases de ajuste fino adicionales; estos datos figuran como no disponibles. Sí se documenta la función de pérdida combinada con ponderación 0,6 para la clasificación de sentimiento y 0,4 para la regresión de vaguedad, y se describe una partición de test retenida de 13.000 muestras verificada el 19 de septiembre de 2026, sobre la que se reportan las métricas de la sección de benchmarks. No hay RLHF ni DPO, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificación de sentimiento en 3 clases (`positive`, `neutral`, `negative`) con salida de logits y probabilidades vía softmax.
- Regresión de vaguedad: puntuación continua en [0, 1] que mide si el texto es específico (0) o difuso (1). En el export ONNX la salida ya viene con la sigmoide aplicada.
- Inferencia multi-tarea en un único forward pass, con dos salidas simultáneas (`sentiment_logits` y `vagueness_score`).
- Procesamiento por lotes: el ONNX acepta tensores `input_ids` y `attention_mask` de forma `[batch, 128]` en int64, con padding a longitud 128.
- Ejecución en cliente mediante ONNX Runtime Web, sin envío de datos a servidor; el repositorio incluye una demo que procesa texto pegado o ficheros CSV por lotes.
- Clasificación de texto corto en inglés (publicaciones, comentarios, feedback de producto).
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Filtrado de feeds: el modelo puntúa cada publicación con sentimiento y vaguedad; aplicando la regla "negativo y vago", se pueden ocultar o degradar publicaciones difusas y mantener visibles las quejas concretas y accionables. La latencia de ~19 ms por elemento en CPU permite aplicar el filtro en tiempo de renderizado.
- Triaje de moderación de comentarios: sobre una cola de comentarios, los que combinan sentimiento negativo alto y vaguedad alta se marcan como ruido de bajo valor y se autodespriorizan, mientras que las quejas específicas se enrutan primero a revisión humana.
- Enrutado de feedback de producto: el eje de sentimiento separa feedback positivo de negativo y el eje de vaguedad identifica las quejas poco concretas, que se pueden redirigir a un flujo de petición de aclaración en lugar de descartarse.
- Monitorización de marca y comunidad: aplicar ambas cabezas de forma continua sobre un flujo de menciones permite detectar un repunte de negatividad vaga como señal temprana, más informativa que un simple recuento de menciones negativas.
- Priorización de tickets de soporte: ordenar la cola por sentimiento negativo y baja vaguedad para que los casos con descripción específica del fallo (por ejemplo, con pasos de reproducción) se atiendan antes que las quejas genéricas.
- Análisis de encuestas y respuestas abiertas: clasificar respuestas cortas combinando polaridad y especificidad, de modo que se puedan segmentar los comentarios accionables frente a los que requieren seguimiento.
- Procesamiento en navegador o edge con requisitos de privacidad: usando el export ONNX con ONNX Runtime Web, el modelo puede clasificar texto en el propio dispositivo del usuario sin que los datos salgan de la máquina, apto para entornos con restricciones de tratamiento de datos.
- Etiquetado y scoring de corpus para investigación: la puntuación de vaguedad añade un eje extra de anotación automática sobre texto corto en inglés, útil para preanotar datasets antes de revisión humana.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor, medidos sobre una partición de test retenida de 13.000 muestras (verificada el 19 de septiembre de 2026). No se han localizado evaluaciones independientes.

Sentimiento (test retenido, 13.000 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 82,7 % |
| F1 (macro) | 82,6 % |

Detalle por clase (filas = clase real):

| Clase | Soporte | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| positive | 4.030 | 0,881 | 0,955 | 0,916 |
| neutral | 4.923 | 0,798 | 0,820 | 0,809 |
| negative | 4.047 | 0,801 | 0,708 | 0,751 |

Matriz de confusion (filas = real, columnas = predicho; orden positive/neutral/negative):

```
              positive  neutral  negative
positive        3847      73      110
neutral          284     4037      602
negative         236      947     2864
```

Vaguedad (misma partición):

| Metrica | Valor |
|---|---|
| MAE | 0,061 |
| R² | 0,676 |

Latencia (CPU, una publicación): ~19 ms en FP32 con ONNX, según `benchmark_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32. Los pesos ocupan aproximadamente 265 MB (66,4 M de parámetros × 4 bytes) y el ONNX FP32 pesa unos 253 MB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; el modelo no necesita A100, H100 ni aceleradores de gama alta. Una RTX 4090 o similar queda muy sobredimensionada para inferencia individual, aunque útil para procesar lotes grandes.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo de los últimos diez años y también en CPU. La latencia declarada de ~19 ms por publicación corresponde a ejecución en CPU.
- Despliegue: `transformers` con `trust_remote_code=True` (PyTorch) y ONNX Runtime (Python, C++ o Web) para navegador y edge. No se publican pesos GGUF, por lo que llama.cpp y Ollama no pueden usarse sin una conversión previa. No hay soporte documentado para vLLM ni TGI, ya que el modelo usa una clase custom de doble cabeza en lugar de una arquitectura de clasificación estándar.
- Throughput: no disponible. La model card solo reporta latencia por publicación en CPU; no se especifican métricas de lote ni de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| starmatrixtechnologies/betterlens-text-classifier | 66,4 M | 128 tokens | Sentimiento 3 clases + regresión de vaguedad | MIT | HuggingFace, safetensors + ONNX | 82,7 % accuracy y F1 macro 82,6 % (test propio de 13.000 muestras) |
| distilbert-base-uncased | 66,4 M | 512 tokens | Modelo base, sin cabezas de clasificación ajustadas | Apache 2.0 | HuggingFace | No aplica (requiere ajuste fino) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Sentimiento binario (SST-2) | Apache 2.0 | HuggingFace | No disponible en la información proporcionada |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Sentimiento 3 clases en redes sociales | no disponible | HuggingFace | No disponible en la información proporcionada |
| roberta-base | ~125 M | 512 tokens | Modelo base, sin cabezas ajustadas | MIT | HuggingFace | No aplica (requiere ajuste fino) |

La comparación directa es limitada porque no se han localizado métricas de los modelos alternativos dentro de la información disponible y porque el eje de vaguedad no existe en los clasificadores de sentimiento convencionales. Las alternativas de la tabla son comparables en tamaño o en tarea, pero solo BetterLens ofrece la doble salida en una sola pasada.

## Limitaciones y advertencias

- Idioma: el modelo solo está entrenado y evaluado en inglés (`en`); no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Longitud: la secuencia máxima es de 128 tokens. Los textos más largos se truncan, lo que puede eliminar información relevante y degradar ambas salidas.
- Clase negativa débil: el recall de la clase `negative` es 0,708 y su F1 0,751, los más bajos de las tres clases. La propia model card señala que la negatividad difusa o de baja intensidad tiende a absorberse en `neutral`, que es precisamente el régimen donde la cabeza de vaguedad debería ayudar.
- Vaguedad con error no despreciable: un R² de 0,676 implica que alrededor de un tercio de la varianza de la puntuación de vaguedad no queda explicada por el modelo, con un MAE de 0,061. Los umbrales de decisión deben calibrarse por caso de uso.
- Dataset de entrenamiento no documentado: no se especifica composición, tamaño, procedencia ni proceso de anotación, por lo que no es posible evaluar sesgos de dominio, demográficos o de anotación. El rendimiento fuera del dominio de texto corto tipo red social o comentario es desconocido.
- Benchmarks no verificados de forma independiente: todas las métricas son reportadas por el autor sobre su propia partición de test. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Ejecución de código remoto: requiere `trust_remote_code=True`, lo que implica descargar y ejecutar código Python del repositorio. En producción conviene auditar `modeling_betterlens_dual_head.py`, `configuration_betterlens_dual_head.py` y `loading_utils.py` antes de habilitarlo.
- No es un modelo generativo: no alucina texto, pero sí puede producir falsos positivos y falsos negativos de clasificación. No debe usarse para decisiones automatizadas de alto impacto sin revisión humana.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No obstante, el modelo base `distilbert-base-uncased` se distribuye bajo Apache 2.0, cuyas condiciones también aplican a los derivados.
- Formatos limitados: al publicarse solo FP32 en safetensors y ONNX, no hay versiones cuantizadas listas para usar; cualquier reducción de precisión requiere conversión propia y una validación posterior de métricas.
- No apto para arquitecturas de servicio estándar de clasificación: el uso de una clase custom puede complicar su integración en servidores de inferencia que esperan una `AutoModelForSequenceClassification` convencional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier
- Demo en navegador (ONNX Runtime Web, con carga de CSV por lotes): https://huggingface.co/spaces/starmatrixtechnologies/betterlens-text-classifier-demo
- Export ONNX: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/onnx/model.onnx
- Pesos safetensors: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/model.safetensors
- Codigo custom del modelo: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/modeling_betterlens_dual_head.py
- Configuracion custom: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/configuration_betterlens_dual_head.py
- Utilidades de carga: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/loading_utils.py
- Diagrama de arquitectura: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/architecture.png
- Diagrama del flujo de filtrado: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/filter-flow.png
- Resultados de benchmark declarados: https://huggingface.co/starmatrixtechnologies/betterlens-text-classifier/blob/main/benchmark_results.json
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Resultados de la busqueda web: no se han encontrado enlaces relevantes para este modelo. Las consultas devolvieron exclusivamente paginas del portal fiscal aleman ELSTER, sin relacion con el modelo.
