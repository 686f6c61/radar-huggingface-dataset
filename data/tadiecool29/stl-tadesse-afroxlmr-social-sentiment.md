# tadiecool29/STL-Tadesse-AfroXLMR-Social-sentiment

## Resumen

STL-Tadesse-AfroXLMR-Social-sentiment es un modelo de clasificacion de sentimiento obtenido mediante ajuste fino (*fine-tuning*) de `Tadesse/AfroXLMR-Social`, un codificador de la familia XLM-R adaptado al dominio de redes sociales y lenguas africanas. Lo publica el usuario `tadiecool29` en Hugging Face y es un modelo de tipo encoder, no generativo: recibe texto y devuelve una etiqueta de sentimiento. Cuenta con 559.893.507 parametros (aproximadamente 560 millones) y un peso en repositorio de 2.3 GB, lo que lo situa en la franja de los transformers encoder de tamano "large" tipo XLM-R.

El modelo resuelve una tarea concreta: el analisis de sentimiento (positivo/negativo/neutro, aunque la cardinalidad exacta de las clases no se especifica en la model card) sobre texto de redes sociales, presumiblemente en lenguas africanas de bajos recursos, donde los modelos multilingues generalistas rinden peor. Su relevancia radica en que reutiliza el corpus AfriSocial y la metodologia DAPT/TAPT descrita en el paper de AfroXLMR-Social para mejorar el rendimiento en tareas subjetivas sobre 19 lenguas africanas.

Se trata de un modelo con actividad practicamente nula en la plataforma (0 descargas y 0 *likes* en el momento de la consulta) y una model card auto-generada por el *Trainer* de Hugging Face con secciones sin completar ("More information needed"). Esto limita la trazabilidad del dataset de ajuste y obliga a tratar los resultados declarados como cifras no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia XLM-R / AfroXLMR (no se detalla variante exacta en la model card) |
| Parametros totales | 559.893.507 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors en precision completa) |
| Idiomas soportados | no disponibles en los metadatos; el modelo base AfroXLMR-Social se orienta a lenguas africanas (paper: 19 lenguas) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura, pero el modelo se construye sobre `Tadesse/AfroXLMR-Social`, que pertenece a la familia de codificadores tipo XLM-R (encoder-only, atencion bidireccional). El antecesor AfroXLMR-Social aplica preentrenamiento adaptativo al dominio (DAPT) y a la tarea (TAPT) sobre el corpus AfriSocial, un *corpus* a gran escala de redes sociales y noticias en varias lenguas africanas, partiendo de modelos preentrenados estilo XLM-R. El objetivo de ese trabajo es reducir el sesgo de dominio (los corpus disponibles suelen estar sesgados hacia textos religiosos) y mejorar el rendimiento en tareas subjetivas: analisis de sentimiento, emociones multietiqueta y clasificacion de discurso de odio.

El ajuste fino de esta variante se realizo con `Trainer` de Hugging Face y los siguientes hiperparametros: learning rate 1e-05, batch de entrenamiento 16, batch de evaluacion 32, semilla 42, optimizador AdamW (*fused*, betas 0.9/0.999, epsilon 1e-08), scheduler coseno con 300 pasos de *warmup*, 10 epocas y AMP nativo. El dataset de ajuste no se especifica ("an unknown dataset" en la model card). El mejor punto observado en la curva de validacion es la epoca 2 (F1 0.7607, exactitud 0.7668); a partir de ahi la *loss* de validacion sube de forma sostenida (de 0.5705 a 1.7508 en la epoca 6), lo que indica sobreajuste. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un encoder de clasificacion.

## Capacidades

- Clasificacion de sentimiento sobre texto: tarea principal y unica documentada del modelo.
- Inferencia sobre texto corto de redes sociales, dominio para el que fue adaptado el modelo base.
- Multilingue potencial: hereda la cobertura del modelo base AfroXLMR-Social, orientado a lenguas africanas, aunque la model card no confirma que el ajuste fino conserve todas esas lenguas.
- Integracion con `transformers` (`pipeline` de clasificacion de texto, `AutoModelForSequenceClassification`).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas de Hugging Face).
- No soporta generacion de texto, tool calling, function calling, agentes, vision ni audio: es un encoder de clasificacion, no un modelo generativo.
- No se documenta modo de razonamiento (*thinking mode*) ni capacidades multimodales.

## Casos de uso

- Monitorizacion de opinion en redes sociales: procesar grandes volumenes de publicaciones en lenguas africanas y etiquetar polaridad para paneles de analitica de marca o medios.
- Moderacion de comunidades: filtrar y priorizar mensajes con sentimiento negativo en foros, plataformas o aplicaciones de mensajeria, encolando la revision humana.
- Analisis de sentimiento en investigacion social: estudios academicos sobre percepcion publica, discurso politico o reacciones a eventos en paises africanos, aprovechando la adaptacion al dominio social media.
- Enriquecimiento de datasets: etiquetado automatico de grandes *corpus* multilingues con sentimiento para tareas posteriores de analitica o entrenamiento.
- Soporte al cliente en mercados africanos: clasificacion de tickets o comentarios entrantes por polaridad para enrutar incidencias, siempre que el idioma y los datos del cliente coincidan con la distribucion de entrenamiento.
- Investigacion en NLP de bajos recursos: punto de partida para comparar tecnicas de DAPT/TAPT frente a XLM-R sin adaptacion de dominio.
- Experimentacion academica: *baseline* de sentimiento sobre el modelo base AfroXLMR-Social para medir la ganancia del ajuste fino.

## Benchmarks y rendimiento

El `model-index` oficial no incluye resultados (array vacio). Los unicos datos disponibles son los de la evaluacion durante el entrenamiento, declarados por el autor. Se reproducen tal cual:

| Metrica | Valor (epoca 6, resultado final declarado) |
|---|---|
| Loss (evaluacion) | 1.7508 |
| Precision | 0.7473 |
| Recall | 0.7499 |
| F1 | 0.7464 |
| Exactitud (accuracy) | 0.7544 |

Evolucion por epoca segun la model card:

| Epoca | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 377 | 0.6288 | 0.7512 | 0.7389 | 0.7416 | 0.7444 |
| 2.0 | 754 | 0.5705 | 0.7610 | 0.7615 | 0.7607 | 0.7668 |
| 3.0 | 1131 | 0.7348 | 0.7630 | 0.7611 | 0.7615 | 0.7643 |
| 4.0 | 1508 | 0.9660 | 0.7532 | 0.7474 | 0.7484 | 0.7494 |
| 5.0 | 1885 | 1.4551 | 0.7465 | 0.7480 | 0.7458 | 0.7506 |
| 6.0 | 2262 | 1.7508 | 0.7473 | 0.7499 | 0.7464 | 0.7544 |

No hay resultados comparativos (MMLU, HumanEval, GSM8K y similares) porque no aplican a un modelo de clasificacion, ni se han publicado tablas frente a otras variantes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~560 M de parametros, cifrasorientativas calculadas a partir del numero de parametros):
  - FP32: aproximadamente 2.2 GB solo de pesos, ~2.5-3 GB con activaciones.
  - FP16/BF16: aproximadamente 1.1 GB de pesos, ~1.5 GB en total.
  - INT8: aproximadamente 0.6 GB.
  - 4 bits: aproximadamente 0.3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, T4, A10, A100 y H100. En la practica el cuello de botella no es la VRAM sino el *throughput* de batching.
- Cabe en GPU de consumo: si, sin problema; incluso en CPU es viable para inferencia por lotes pequenos (el modelo completo en FP32 ocupa ~2.3 GB de RAM).
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, Hugging Face Inference Endpoints, FastAPI + ONNX Runtime o `optimum`. vLLM y TGI estan orientados a modelos generativos y no son la via habitual para un encoder de clasificacion; llama.cpp y Ollama no aplican porque no hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un encoder de 560 M de parametros, se espera latencia de milisegundos por lote en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STL-Tadesse-AfroXLMR-Social-sentiment | 559.893.507 | no disponible | Clasificacion de sentimiento ajustada sobre AfroXLMR-Social | MIT | Hugging Face, 0 descargas |
| Tadesse/AfroXLMR-Social (modelo base) | del orden de 560 M (familia XLM-R large) | no disponible | Encoder preentrenado con DAPT/TAPT en AfriSocial | no disponible en la informacion | Hugging Face |
| XLM-RoBERTa large | ~559 M | 512 tokens | Encoder multilingue generalista | MIT | Hugging Face, ampliamente usado |
| AfroXLMR-76L | ~559 M | 512 tokens | Encoder multilingue orientado a lenguas africanas | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible: la model card no aporta resultados frente a XLM-RoBERTa large ni frente a AfroXLMR-Social sin ajustar, y el `model-index` esta vacio. El paper de AfroXLMR-Social si reporta mejoras de entre el 1 % y el 30 % en F1 sobre tareas subjetivas en 19 lenguas africanas para el modelo base, pero esas cifras corresponden a AfroXLMR-Social, no a esta variante de sentimiento concreta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card, pero el modelo hereda los sesgos del corpus AfriSocial y del preentrenamiento de la familia XLM-R. El paper original senala que los corpus previos estaban sesgados hacia el dominio religioso, sesgo que AfriSocial busca corregir.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si existe el riesgo de clasificaciones erroneas o descalibradas, especialmente fuera del dominio de redes sociales.
- Sobreajuste evidente: la *loss* de validacion sube de 0.5705 (epoca 2) a 1.7508 (epoca 6) mientras la de entrenamiento baja de 0.6399 a 0.0586. El checkpoint publicado parece corresponder a la epoca final, no al mejor punto de validacion (epoca 2), lo que puede infrapotenciar su rendimiento real.
- Idioma: los metadatos de Hugging Face no declaran idiomas soportados. El ajuste fino sobre un dataset desconocido puede haber reducido la cobertura multilingue del modelo base. No se debe asumir cobertura multilingue sin validacion previa.
- Licencia: MIT, permisiva para uso comercial, pero al derivar de AfroXLMR-Social conviene verificar la licencia de ese modelo base en su repositorio, no listada aqui.
- Trazabilidad: la model card esta auto-generada y sin completar ("More information needed" en descripcion, usos previstos y datos de entrenamiento). No se conoce el dataset de ajuste, el numero de clases ni la composicion de la evaluacion.
- Madurez: 0 descargas y 0 *likes*; sin validacion externa ni resultados reproducidos por terceros.
- Revision humana: dado el desbalance potencial de clases y la ausencia de matriz de confusion, cualquier uso en produccion deberia acompanarse de validacion sobre datos propios y umbrales de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-Tadesse-AfroXLMR-Social-sentiment
- Modelo base: https://huggingface.co/Tadesse/AfroXLMR-Social
- Paper AfroXLMR-Social (arXiv HTML): https://arxiv.org/html/2503.18247v1
- Paper AfroXLMR-Social (arXiv abstract): https://arxiv.org/abs/2503.18247
- Ficha en Papers with Code: https://paperswithcode.co/paper/2503.18247
- Otro modelo del mismo autor (stance): https://huggingface.co/tadiecool29/STL-afroxlmr-base-stance
- Perfil del autor: https://huggingface.co/tadiecool29
