# tadiecool29/MTL-FullFineT-mt5-base-joint

## Resumen

MTL-FullFineT-mt5-base-joint es un modelo de generación texto-a-texto obtenido mediante ajuste fino completo (full fine-tuning) de google/mt5-base, publicado por el usuario tadiecool29. Está entrenado de forma conjunta (joint) para dos tareas de clasificación de texto en amárico: detección de postura (stance detection) y análisis de sentimiento. Cuenta con 582.401.280 parámetros, pesos en formato safetensors y licencia Apache 2.0.

Se trata de un experimento de aprendizaje multi-tarea: en lugar de mantener dos cabezales independientes, aprovecha la formulación encoder-decoder de mT5 para resolver ambas tareas como generación condicionada. Los resultados declarados en el conjunto de evaluación son discretos: Exact Match 0,5536, precisión de sentimiento 0,6870 y F1 macro de postura 0,6957, con una pérdida de validación de 1,7186 tras diez épocas.

Su relevancia es limitada y muy específica: cubre un nicho poco poblado (procesamiento de lenguaje natural en amárico), pero la documentación publicada es mínima, el conjunto de datos se describe literalmente como «unknown» y el repositorio no tiene descargas ni likes, por lo que no existe validación externa de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (hereda la de google/mt5-base) |
| Parametros totales | 582.401.280 |
| Longitud de contexto | no disponible (la ficha no declara la longitud de secuencia usada) |
| Tipos de cuantizacion | no disponible; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en los metadatos; las etiquetas del repositorio indican amárico y el modelo base mT5 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,2 GB) |
| Modelo base | google/mt5-base |
| Tareas ajustadas | Detección de postura y análisis de sentimiento (multi-task conjunto) |
| Compatibilidad | `endpoints_compatible`; librería transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/mt5-base: un transformer encoder-decoder con atención completa y objetivos de tipo span corruption, adaptado a generación texto-a-texto. El ajuste es completo (no se congelan capas ni se emplean adaptadores LoRA), por lo que los 582 millones de parámetros se actualizan durante el entrenamiento. El recuento de parámetros, muy superior al de T5-base, es característico de mT5 por su vocabulario multilingüe ampliado, lo que también explica el tamaño de 1,2 GB del repositorio.

Los hiperparámetros declarados en la model card son: learning rate 3e-4, tamaño de lote 8 con 4 pasos de acumulación de gradiente (lote efectivo 32), optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), scheduler coseno con 300 pasos de warmup, 10 épocas (1.890 pasos), factor de label smoothing 0,1 y semilla 42. No se documenta ningún proceso de RLHF, DPO ni otro ajuste por preferencias, ni la composición del dataset, que la propia ficha describe como desconocido. El entrenamiento se realizó con Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Generación de texto condicionada (text2text): el modelo recibe una instrucción o texto y produce una secuencia de salida, formato con el que resuelve tanto la clasificación de sentimiento como la detección de postura.
- Análisis de sentimiento en amárico: clasificación con precisión declarada de 0,6870 y F1 macro de 0,6798.
- Detección de postura en amárico: clasificación de la posición del autor respecto a un tema, con precisión declarada de 0,6945 y F1 macro de 0,6957.
- Aprendizaje multi-tarea conjunto: un único conjunto de pesos resuelve ambas tareas en función del prefijo o formato de entrada.
- Capacidad multilingüe potencial heredada del modelo base mT5, aunque el ajuste se ha realizado sobre datos en amárico y no hay evidencia publicada de rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Monitorización de opinión pública en amárico: el modelo puede clasificar automáticamente el sentimiento de comentarios y publicaciones en redes sociales, agrupando grandes volúmenes de texto por polaridad.
- Análisis de postura en debates políticos o sociales: dado un texto en amárico y un tema de referencia, permite etiquetar si el autor está a favor, en contra o es neutral, útil para estudios de ciencias sociales.
- Investigación académica en PLN de bajos recursos: sirve como punto de partida (baseline) reproducible para comparar técnicas de multi-task learning en amárico.
- Etiquetado asistido de corpus: uso como preanotador para reducir el esfuerzo humano en la construcción de datasets anotados de sentimiento y postura, con revisión humana posterior obligatoria.
- Análisis de encuestas abiertas y formularios: clasificación de respuestas de texto libre en amárico para agregar resultados por sentimiento antes de un análisis estadístico.
- Detección de discurso polarizado o conflictivo: identificación de posturas extremas en foros y canales de mensajería como señal de alerta temprana, siempre con supervisión humana.
- Ajuste posterior específico de dominio: al ser un modelo completo y no un adaptador, puede servir de base para un segundo ajuste fino sobre datos propios de una organización.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el conjunto de evaluación (epoch 10) son los siguientes. El campo `model-index` de la model card está vacío, por lo que no hay resultados adicionales publicados.

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,7186 |
| Exact Match | 0,5536 |
| Precision de sentimiento | 0,6870 |
| F1 macro de sentimiento | 0,6798 |
| Precision de postura | 0,6945 |
| F1 macro de postura | 0,6957 |
| F1 macro medio | 0,6877 |

Evolución durante el entrenamiento (extracto de la tabla completa publicada en la model card):

| Epoca | Paso | Loss de validacion | Exact Match | F1 macro sentimiento | F1 macro postura | F1 macro medio |
|---|---|---|---|---|---|---|
| 1,0 | 189 | 2,1926 | 0,0661 | 0,2667 | 0,2522 | 0,2595 |
| 2,0 | 378 | 1,7843 | 0,4626 | 0,6213 | 0,5785 | 0,5999 |
| 4,0 | 756 | 1,7315 | 0,5374 | 0,6850 | 0,6778 | 0,6814 |
| 7,0 | 1323 | 1,7198 | 0,5461 | 0,6705 | 0,6949 | 0,6827 |
| 8,0 | 1512 | 1,7181 | 0,5511 | 0,6774 | 0,6978 | 0,6876 |
| 9,0 | 1701 | 1,7186 | 0,5561 | 0,6836 | 0,6986 | 0,6911 |
| 10,0 | 1890 | 1,7186 | 0,5536 | 0,6798 | 0,6957 | 0,6877 |

El mejor F1 macro medio se alcanza en la época 9 (0,6911); en la época 10 el valor retrocede ligeramente a 0,6877, lo que sugiere una meseta e inicio de sobreajuste. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 en torno a 2,3 GB; en fp16/bf16 en torno a 1,2 GB; en int8 aproximadamente 0,6 GB; en int4 aproximadamente 0,3 GB (estimaciones a partir del recuento de 582 millones de parámetros, sin incluir caché de atención ni overhead del runtime).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una T4 (16 GB) permite lotes grandes con holgura; una RTX 3060, RTX 4060 o RTX 4090 lo ejecutan sin problema.
- Cabe en GPU de consumo: sí, incluidas tarjetas de gama media y baja con 6-8 GB (RTX 3050, RTX 2060, GTX 1660 con cuantización). También puede ejecutarse en CPU para inferencia puntual.
- Aceleradores de gama alta (A100, H100) no aportan ventaja significativa para inferencia con este tamaño de modelo; su uso solo tendría sentido para reentrenamiento.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; Text Generation Inference para servir el modelo; vLLM con soporte de arquitecturas encoder-decoder; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, conversión que no se distribuye oficialmente.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| MTL-FullFineT-mt5-base-joint | 582.401.280 | no disponible | Ajuste en amárico; base multilingüe | Apache 2.0 | F1 macro medio 0,6877; EM 0,5536 |
| google/mt5-base (modelo base) | Aprox. 582 M (el ajuste es completo, no altera el recuento) | no disponible | Multilingüe (mT5) | Apache 2.0 | No evaluado en tareas de postura ni sentimiento en amárico |
| tadiecool29/MTL-FullFT-mt5-base-sentiment | no disponible | no disponible | Amárico | no disponible | no disponible |
| tadiecool29/MTL-FullFT-mt5-base-joint | no disponible | no disponible | Amárico | no disponible | no disponible |

No se dispone de datos comparativos con alternativas de la misma categoría (por ejemplo, XLM-R ajustado para amárico) en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Documentación mínima: la model card indica explícitamente «unknown dataset» en la sección de datos de entrenamiento y deja sin rellenar las secciones de descripción del modelo, usos previstos y limitaciones. No se puede auditar el origen ni la composición de los datos.
- Métricas modestas: un F1 macro medio de 0,6877 y una precisión de sentimiento de 0,6870 están lejos de lo exigible en producción para decisiones automatizadas sin revisión humana.
- Riesgo de salidas mal formateadas: el Exact Match de 0,5536 indica que aproximadamente el 45 % de las generaciones no coinciden exactamente con la etiqueta esperada, lo que obliga a implementar analizado y validación de la salida antes de consumirla.
- Riesgo de alucinación: al ser un modelo generativo texto-a-texto, puede producir texto libre en lugar de una etiqueta cerrada cuando la entrada se aleja de la distribución de entrenamiento.
- Sesgos potenciales: las tareas de sentimiento y postura son intrínsecamente subjetivas y dependen del dominio, del tema y del dialecto. Un modelo entrenado sobre un corpus no documentado puede heredar sesgos de anotación y de selección de fuentes.
- Limitación idiomática: el ajuste se declara sobre amárico. No hay evidencia de rendimiento en otras lenguas, pese a que el modelo base sea multilingüe.
- Ausencia de validación externa: cero descargas y cero likes en el repositorio, sin resultados en el `model-index` ni evaluación por terceros.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se distribuye sin garantías y el autor no ofrece soporte ni asunción de responsabilidad.
- Entorno de entrenamiento: las versiones declaradas (Transformers 5.17.0, PyTorch 2.11.0+cu130) son muy recientes y pueden requerir ajustes de compatibilidad al cargar el modelo en stacks actuales.
- Uso responsable: cualquier despliegue sobre opinión pública o discurso político debería tratar las predicciones como indicios, no como hechos, e incorporar revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/MTL-FullFineT-mt5-base-joint
- Modelo base: https://huggingface.co/google/mt5-base
- Variante relacionada (sentimiento): https://huggingface.co/tadiecool29/MTL-FullFT-mt5-base-sentiment
- Variante relacionada (conjunta, nombre alternativo): https://huggingface.co/tadiecool29/MTL-FullFT-mt5-base-joint
- Ficha en registro de terceros (variante joint): https://free2aitools.com/model/tadiecool29/mtl-fullft-mt5-base-joint
- Ficha en registro de terceros (variante full-ft): https://free2aitools.com/model/tadiecool29/mt5-base-joint-full-ft
- Perfil del autor en GitHub: https://github.com/tadiecool29/tadiecool29/blob/main/README.md
