# tadiecool29/MTL-FullFineTune-afri-mt5-base-joint

## Resumen

MTL-FullFineTune-afri-mt5-base-joint es un ajuste fino completo (full fine-tuning) del modelo multilingue masakhane/afri-mt5-base, publicado por el usuario tadiecool29 en Hugging Face. Se trata de un modelo encoder-decoder de tipo T5 entrenado en regimen multi-tarea (multi-task learning) para dos tareas de clasificacion de texto en amharico: analisis de sentimiento y deteccion de postura (stance detection). El modelo no es un modelo generativo de proposito general: se ha especializado para emitir etiquetas estructuradas como salida de texto a texto.

Con 582.401.280 parametros (unos 582 M) y un repositorio de 1,2 GB, el modelo mantiene la arquitectura y el tamano de su base, por lo que es ligero y desplegable en hardware de consumo. Su interes practico esta en que un unico checkpoint cubre dos tareas de clasificacion distintas, lo que simplifica pipelines de moderacion, monitorizacion de opinion o analisis de discurso en un idioma con recursos limitados como el amharico.

El modelo es relevante ahora como ejemplo de adaptacion de modelos multilingues africanos (familia AfriMT5 de Masakhane) a tareas de comprension, no solo de traduccion. Sus resultados autodeclarados en el conjunto de evaluacion son moderados: Exact Match 0,5536, macro F1 de sentimiento 0,6990, macro F1 de postura 0,7109 y macro F1 promedio 0,7050. La documentacion del autor es minima (la propia model card indica "More information needed" y el dataset de entrenamiento figura como desconocido), por lo que debe tratarse como una publicacion de investigacion incipiente y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, mT5-base; modelo base masakhane/afri-mt5-base) |
| Parametros totales | 582.401.280 (aprox. 582 M) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | no disponible; el repo contiene safetensors de 1,2 GB, coherente con precision de 16 bits (fp16/bf16) |
| Idiomas soportados | amharico (segun los tags del repositorio); no se detalla la cobertura multilingue efectiva tras el ajuste |
| Licencia | afl-3.0 (Academic Free License v3.0) |
| Formato de pesos | safetensors (unica variante publicada; sin GGUF ni ONNX) |
| Tipo de modelo | text2text-generation orientado a clasificacion multi-tarea |
| Tareas | deteccion de postura (stance detection) y analisis de sentimiento (sentiment analysis) |
| Modelo base | masakhane/afri-mt5-base |
| Técnica de ajuste | full fine-tuning (todos los parametros actualizados) |

## Arquitectura y entrenamiento

El modelo parte de afri-mt5-base, un encoder-decoder basado en mT5 (arquitectura T5 con atencion relativa y mecanismo span corruption en el preentrenamiento) adaptado por la comunidad Masakhane a lenguas africanas. El ajuste se realizo con full fine-tuning, es decir, actualizando los 582 M de parametros, no mediante adaptadores ni LoRA.

Los hiperparametros declarados en la model card son: learning rate 3e-4, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 300 pasos de warmup, batch de entrenamiento 8 con 4 pasos de acumulacion (batch efectivo 32), batch de evaluacion 16, 10 epocas, seed 42 y label smoothing de 0,1. Con 189 pasos por epoca y batch efectivo 32, el volumen de entrenamiento ronda los 6.000 ejemplos por epoca (unas 60.000 muestras acumuladas), cifra derivada de la configuracion, no declarada explicitamente. No se documenta la composicion del dataset (la model card lo describe como "unknown dataset"), ni si hubo RLHF o DPO: al tratarse de un ajuste supervisado con etiquetas de clasificacion, no se emplearon tecnicas de alineamiento por preferencias. Tampoco se declara el uso de decodificacion especulativa ni de atencion lineal.

El entrenamiento muestra una convergencia rapida: el macro F1 promedio pasa de 0,0982 en la epoca 1 a 0,6811 en la epoca 3, y a partir de la epoca 4 el modelo se estanca (0,6945 en la epoca 4 frente a 0,7050 en la epoca 10). La loss de validacion se estabiliza alrededor de 1,866. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Generacion de texto a texto: produce etiquetas en formato textual a partir de una entrada, con un Exact Match de 0,5536 en evaluacion, lo que implica que algo menos de la mitad de las salidas no coinciden exactamente con la etiqueta esperada.
- Analisis de sentimiento en amharico: clasificacion con precision 0,7082 y macro F1 0,6990.
- Deteccion de postura: clasificacion con precision 0,7045 y macro F1 0,7109.
- Aprendizaje multi-tarea conjunto: un unico checkpoint resuelve ambas tareas, presumiblemente discriminando la tarea mediante un prefijo o formato de entrada, aunque la model card no documenta el formato de prompt exacto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No dispone de capacidades de vision, audio ni generacion de codigo.
- Capacidad multilingue: el unico idioma declarado es el amharico; se desconoce si el modelo conserva capacidades de traduccion o generacion libre heredadas del modelo base.
- Capacidad de traduccion: no evaluada ni declarada para este checkpoint, pese a que la base AfriMT5 se entreno para traduccion en 16 lenguas africanas.

## Casos de uso

- Monitorizacion de opinion en redes sociales etiopes: el modelo clasifica sentimiento y postura sobre texto en amharico, lo que permite agregar tendencias de opinion en un idioma con poca cobertura de herramientas comerciales.
- Deteccion de postura en debates politicos o sanitarios: identificar si un mensaje es favorable, contrario o neutro respecto a un tema concreto (por ejemplo, una campana de vacunacion), reutilizando la misma cabeza multi-tarea.
- Moderacion de contenido asistida: como primer filtro de clasificacion de toxicidad polarizada, marcando mensajes con postura extrema para revision humana, con la salvedad de su macro F1 de 0,71.
- Analisis de resenas de productos o servicios en amharico: extraer polaridad de comentarios de clientes en plataformas de comercio electronico locales y volcarlos en cuadros de mando.
- Investigacion en PLN de bajos recursos: servir como linea base reproducible y comparable para trabajos sobre amharico, dado que publica checkpoint, hiperparametros y curva de evaluacion por epoca.
- Anotacion asistida (pre-etiquetado): usar las predicciones como sugerencias para anotadores humanos, reduciendo el coste de construir corpus etiquetados de sentimiento y postura en amharico.
- Analisis de discurso en medios: clasificar editoriales y articulos de noticias en amharico por tono y posicionamiento respecto a entidades publicas, integrable en un pipeline de seguimiento de medios.
- Experimentacion academica sobre multi-task learning: comparar el esquema conjunto (joint) con los ajustes mono-tarea del mismo autor para estudiar transferencia entre sentimiento y postura.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (epoca 10):

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 1,8665 |
| Exact Match | 0,5536 |
| Sentiment Accuracy | 0,7082 |
| Sentiment Macro F1 | 0,6990 |
| Stance Accuracy | 0,7045 |
| Stance Macro F1 | 0,7109 |
| Avg Macro F1 | 0,7050 |

Evolucion por epoca (seleccion):

| Epoca | Validation Loss | Exact Match | Sentiment Macro F1 | Stance Macro F1 | Avg Macro F1 |
|---|---|---|---|---|---|
| 1 | 2,5095 | 0,1110 | 0,1214 | 0,0750 | 0,0982 |
| 3 | 1,8926 | 0,5374 | 0,6596 | 0,7026 | 0,6811 |
| 4 | 1,8677 | 0,5449 | 0,6855 | 0,7036 | 0,6945 |
| 7 | 1,8652 | 0,5499 | 0,6998 | 0,7096 | 0,7047 |
| 10 | 1,8665 | 0,5536 | 0,6990 | 0,7109 | 0,7050 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El campo model-index del repositorio esta vacio. No hay comparacion con modelos de referencia en la documentacion del autor.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 1,5-3 GB incluyendo pesos (unos 1,2 GB) y activaciones, para secuencias cortas y batch pequeno. Con cuantizacion a 8 bits, el peso baja a unos 0,6 GB; a 4 bits, a unos 0,3 GB.
- VRAM para full fine-tuning: se necesitan pesos en precision de 16 bits (1,2 GB), copia maestra en fp32 (2,3 GB), gradientes (1,2 GB) y estados de AdamW (4,6 GB), lo que suma del orden de 9-10 GB antes de activaciones; con batch 8 y acumulacion 4 es razonable un equipo con 16-24 GB.
- GPU consumer: si cabe. Inferencia holgada en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Ajuste fino completo viable en tarjetas de 16 GB o mas con batch reducido; con cuantizacion o adaptadores, en 8-12 GB.
- GPU de datacenter: A100, H100, L40S o A10G son sobredimensionadas para inferencia, pero utiles para reentrenamiento a gran escala o servicio con alta concurrencia.
- Opciones de despliegue: la via principal es Transformers con PyTorch (AutoModelForSeq2SeqLM). vLLM y TGI incluyen soporte para arquitecturas encoder-decoder tipo T5, aunque con menor madurez que los modelos decoder-only. Ollama y llama.cpp no ofrecen soporte robusto para mT5: requeririan conversion a GGUF y existen limitaciones conocidas en encoder-decoder dentro de ese ecosistema. No se publican pesos en GGUF ni ONNX.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MTL-FullFineTune-afri-mt5-base-joint | 582 M | no disponible | Avg Macro F1 0,7050; Sentiment F1 0,6990; Stance F1 0,7109 (autodeclarado) | afl-3.0 | safetensors en Hugging Face |
| masakhane/afri-mt5-base (modelo base) | 582 M aprox. | no disponible | No evaluado en sentimiento ni postura en la informacion disponible (orientado a traduccion en 16 lenguas africanas) | no disponible | safetensors en Hugging Face |
| MTL-FullFT-afri-mt5-base-sentiment (mismo autor) | no disponible | no disponible | No disponible en la informacion proporcionada | afl-3.0 (segun repositorio) | safetensors en Hugging Face |
| MTL-FullFT-afri-mt5-base-joint (mismo autor) | no disponible | no disponible | No disponible en la informacion proporcionada | afl-3.0 (segun repositorio) | safetensors en Hugging Face |

No se dispone de cifras verificables de modelos comparables de terceros (por ejemplo, clasificadores multilingues basados en XLM-R o AfroXLMR) en la informacion proporcionada, por lo que la comparacion de rendimiento con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento. El dataset figura como "unknown dataset", por lo que no es posible auditar la composicion, el dominio ni la distribucion de etiquetas.
- Resultados autodeclarados y sin test set publico: todas las cifras provienen del conjunto de evaluacion del propio autor. No hay validacion externa ni comparacion con lineas base.
- Riesgo de alucinacion y salidas fuera de formato: al ser un modelo generativo de texto a texto, puede producir cadenas que no correspondan a ninguna etiqueta valida. El Exact Match de 0,5536 indica que casi la mitad de las salidas no coinciden exactamente con la esperada, lo que obliga a implementar validacion y mapeo de salidas en produccion.
- Rendimiento moderado: un macro F1 de 0,7050 en clasificacion es insuficiente para decisiones automatizadas sin supervision humana en contextos sensibles (moderacion, salud, discurso politico).
- Cobertura linguistica limitada: solo se declara amharico. Se desconoce si el modelo responde correctamente a otras lenguas del modelo base o si el ajuste ha degradado sus capacidades multilingues originales.
- Longitud de contexto no documentada: no se especifica el maximo de tokens de entrada, lo que impide planificar el tratamiento de documentos largos (noticias, hilos de conversacion).
- Sesgos: no se ha publicado ningun analisis de sesgo demografico, politico o dialectal. En tareas de postura y sentimiento sobre discurso politico, el sesgo del corpus de anotacion se transfiere directamente al modelo.
- Licencia afl-3.0: permite uso comercial, pero es una licencia de software generico no disenada para pesos de modelos; incluye condiciones de atribucion, prohibicion de uso del nombre del licenciante y clausulas de represalia por patentes. Conviene revisar tambien la licencia del modelo base afri-mt5-base antes de un despliegue comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de la comunidad.
- Inconsistencias de reproducibilidad: las versiones declaradas (Transformers 5.16.1, PyTorch 2.11.0+cu128) y la fecha del repositorio (2026) no se corresponden con releases estables conocidos, por lo que la reproduccion exacta del entrenamiento puede no ser posible.
- Ausencia de pesos cuantizados: solo hay safetensors; no hay GGUF ni ONNX publicados, lo que limita el despliegue en entornos de CPU o edge sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-FullFineTune-afri-mt5-base-joint
- Modelo base: https://huggingface.co/masakhane/afri-mt5-base
- Variante de sentimiento del mismo autor: https://huggingface.co/tadiecool29/MTL-FullFT-afri-mt5-base-sentiment
- Variante joint del mismo autor: https://huggingface.co/tadiecool29/MTL-FullFT-afri-mt5-base-joint
- Perfil de GitHub del autor: https://github.com/tadiecool29/tadiecool29/blob/main/README.md
- Ficha de AfriMT5 (resumen del modelo base): https://wycord.com/resource/afrimt5
- Registro de modelo mono-tarea: https://free2aitools.com/model/tadiecool29/stl-fullft-afri-mt5-base-sentiment
- Paper de referencia de mT5: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
