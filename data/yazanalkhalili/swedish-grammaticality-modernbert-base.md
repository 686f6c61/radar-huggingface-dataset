# yazanalkhalili/swedish-grammaticality-modernbert-base

## Resumen

El modelo `yazanalkhalili/swedish-grammaticality-modernbert-base` es un clasificador binario de secuencia especializado en la deteccion de errores gramaticales en sueco. Desarrollado por Yazan Al-Khalili como tarea de seleccion para las plazas de tesis de master de AI Sweden, se construye mediante fine-tuning del checkpoint base `AI-Sweden-Models/ModernBERT-base` (aproximadamente 149,6 millones de parametros). El modelo devuelve una puntuacion continua entre 0 y 1 tras aplicar sigmoide sobre el logit de salida, donde los valores altos indican texto gramaticalmente correcto y los bajos indican presencia de errores.

La relevancia practica del modelo reside en su uso como componente de ranking o filtrado en pipelines de procesamiento de lenguaje natural en sueco: correccion gramatical asistida, control de calidad de corpus, generacion aumentada de datos o evaluacion de sistemas de traduccion automatica. Su ventana de contexto operativa es de 128 tokens, suficiente para oraciones o parrafos cortos, y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo se publico en noviembre de 2026 y cuenta con 37 descargas en Hugging Face. La model card reporta resultados notables frente al baseline propuesto por AI Sweden en su conjunto de 120 ejemplos de practica, con un incremento de Spearman de 0,528 a 0,822 y de ROC-AUC de 0,783 a 0,957.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder con atencion lineal y RoPE), fine-tuneado para clasificacion de secuencia |
| Parametros totales | 149.605.633 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento e inferencia segun model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 0,6 GB |
| Pipeline | text-classification |
| Modelo base | AI-Sweden-Models/ModernBERT-base |
| Dataset de entrenamiento | yazanalkhalili/swedish-grammaticality-data |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer que incorpora mejoras sobre BERT clasico como atencion lineal, codificacion posicional rotatoria (RoPE) y mayor eficiencia en secuencias largas. Sobre ese checkpoint se anade una cabeza de clasificacion de secuencia con una unica salida escalar, entrenada con entropia cruzada binaria sobre objetivos continuos en el rango 0-1. La inferencia requiere aplicar una sigmoide al logit para obtener la puntuacion final.

El entrenamiento combina tres fuentes: oraciones de aprendices de sueco del corpus DaLAJ-GED-SuperLim 2.0 (eliminando errores exclusivamente de puntuacion), 478 oraciones de ejemplo de AI Sweden y 8.407 errores sinteticos generados copiando oraciones correctas y anadiendo una o dos faltas basadas en reglas. Las etiquetas son 0,95 para oraciones correctas, 0,40 para una falta y 0,25 para dos faltas. La configuracion es de una epoca, batch de 32, learning rate 3e-5 con warm-up lineal y decaimiento, longitud maxima de 128 tokens, semilla 42 y entrenamiento en una GPU Tesla T4 de Google Colab. No se reporta uso de RLHF ni DPO.

## Capacidades

- Puntuacion de gramaticalidad en sueco: devuelve un escalar 0-1 que refleja la correccion gramatical del texto.
- Deteccion de errores cubiertos por las reglas sinteticas: confusiones en/ett y min/mitt, ausencia de -r de presente, orden verbo-segundo roto, falta de terminacion definida y uso incorrecto de sin/sitt/sina frente a deras.
- Deteccion de otros tipos de error aprendidos del corpus DaLAJ (errores de aprendices de sueco).
- Ranking de oraciones o fragmentos por calidad gramatical.
- Clasificacion de secuencia corta (hasta 128 tokens).
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento extendido (thinking mode).
- No procesa vision ni audio.
- Capacidad multilingue limitada: solo sueco.

## Casos de uso

- Control de calidad de corpus suecos: filtrar oraciones mal formadas antes de incluirlas en un dataset de preentrenamiento o fine-tuning, usando la puntuacion como umbral de admision.
- Evaluacion de sistemas de traduccion automatica hacia sueco: comparar la gramaticalidad de las hipotesis generadas por distintos motores o configuraciones, ya que la puntuacion permite ordenar candidatos.
- Correccion gramatical asistida en editores: integrar el modelo como detector previo que marque fragmentos sospechosos antes de invocar un modelo generativo de reescritura, reduciendo el coste computacional.
- Generacion aumentada de datos: puntuar pares de oraciones correctas e incorrectas para construir ejemplos de entrenamiento en tareas de deteccion de errores o preferencia.
- Verificacion de salidas de asistentes conversacionales en sueco: monitorizar respuestas generadas y marcar aquellas con puntuaciones bajas para revision humana o regeneracion.
- Filtrado en pipelines de mineria web en sueco: descartar texto extraido con OCR deficiente o construcciones rotas antes de alimentar etapas posteriores.
- Investigacion en adquisicion de segundas lenguas: analizar la evolucion de la correccion gramatical en producciones de aprendices mediante la puntuacion continua.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre los 120 ejemplos de practica de AI Sweden (script `evaluate.py`):

| Modelo | Spearman | ROC-AUC |
|---|---|---|
| Baseline (ModernBERT-large embeddings + SVR) | 0,528 | 0,783 |
| Este modelo | 0,822 | 0,957 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que la tarea es de clasificacion especifica y no de generacion general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 600 MB para los pesos (149,6 M de parametros) mas overhead de activaciones; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- En fp16/bf16: aproximadamente 300 MB de pesos, con margen amplio en GPUs de gama baja.
- GPU recomendadas: cualquier GPU moderna; el propio autor entreno en una Tesla T4. Funciona en RTX 3060, RTX 4090, A100, H100 sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, vLLM (soporte de clasificacion), TGI, o exportacion a llama.cpp/GGUF no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano y la longitud maxima de 128 tokens, se espera throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yazanalkhalili/swedish-grammaticality-modernbert-base | 149,6 M | 128 tokens | Puntuacion de gramaticalidad en sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-base (baseline con SVR) | 149,6 M (encoder) + SVR | 128 tokens (configurado) | Puntuacion de gramaticalidad en sueco | Apache 2.0 (checkpoint base) | Hugging Face |
| Modelos GEC suecos genericos (p. ej. basados en GPT-sueco) | variable | variable | Correccion generativa | variable | variable |

La comparacion directa con alternativas especializadas en deteccion de gramaticalidad en sueco es limitada: no se dispone de otros modelos publicos equivalentes en la informacion proporcionada. El baseline de AI Sweden es el referente mas cercano y el modelo lo supera en Spearman (0,822 frente a 0,528) y ROC-AUC (0,957 frente a 0,783).

## Limitaciones y advertencias

- Los errores sinteticos proceden solo de cinco reglas simples (en/ett y min/mitt, -r de presente ausente, orden verbo-segundo roto, terminacion definida ausente, sin/sitt/sina frente a deras); otros tipos de error dependen unicamente de DaLAJ.
- No esta entrenado para detectar errores de puntuacion.
- Los textos de mas de 128 tokens se truncan, por lo que la puntuacion de documentos largos es parcial.
- Las puntuaciones sirven para ordenar textos, pero no son probabilidades calibradas; no deben interpretarse como confianza absoluta.
- Riesgo de sesgo hacia el dominio de aprendices de sueco y hacia las construcciones presentes en DaLAJ; el rendimiento puede degradarse en registros muy distintos (tecnico, literario, coloquial).
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos o negativos en la clasificacion.
- Idioma unico: sueco. No utilizable en otros idiomas sin reentrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; sin restricciones adicionales conocidas.
- Entrenado en una sola epoca y en una T4, con semilla fija; no se reporta analisis de varianza entre ejecuciones.
- Solo se publican pesos en safetensors; no hay versiones GGUF ni cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yazanalkhalili/swedish-grammaticality-modernbert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/yazanalkhalili/swedish-grammaticality-data
- Codigo: https://github.com/Yazan-al-khalili/swedish-grammaticality-scoring
- Modelo base: https://huggingface.co/AI-Sweden-Models/ModernBERT-base
