# sureshtara/whisper-tiny_to_british_accent_26oct

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario sureshtara, orientado al reconocimiento automatico del habla (ASR) con acento britanico. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros, y se ha entrenado sobre el dataset British_english para especializar la transcripcion en esa variante dialectal del ingles. Su publicacion es reciente (octubre de 2026) y esta pensada como una alternativa ligera para tareas de transcripcion donde el acento britanico es predominante.

La relevancia de este modelo radica en su tamano reducido: al derivar de whisper-tiny, puede ejecutarse en hardware muy modesto, incluso en CPU o GPUs de gama baja, lo que lo hace atractivo para prototipos, aplicaciones embebidas o pipelines de transcripcion masiva donde el coste computacional es un factor critico. El autor declara un WER de 13,62 sobre el split de test del dataset British_english, un resultado que, aunque no es competitivo con modelos ASR de mayor tamano, resulta razonable para un modelo de 37 millones de parametros especializado en un unico acento.

No obstante, la informacion disponible es limitada: la model card generada automaticamente no incluye detalles sobre la composicion del dataset, el proceso de entrenamiento mas alla de los hiperparametros, ni evaluaciones adicionales. El modelo tiene un uso muy bajo (30 descargas, 0 likes) y no ha sido verificado por terceros, por lo que debe considerarse como un experimento de ajuste fino mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles, con especializacion en acento britanico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura original de Whisper tiny: un transformer encoder-decoder con 4 capas en cada bloque, atencion multi-cabeza y un total de 37,7 millones de parametros. El encoder procesa espectrogramas Mel de audio de 30 segundos y el decoder genera tokens de texto de forma autoregresiva. Esta arquitectura esta disenada para ASR multilingue y multitarea, aunque en este caso el ajuste fino se ha restringido al ingles britanico.

El entrenamiento se realizo con el Trainer de Hugging Face sobre el dataset British_english (split de test para evaluacion), con los siguientes hiperparametros: learning rate de 1e-5, batch size de entrenamiento de 2, batch de evaluacion de 1, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. La semilla fue 42. No se especifica el numero total de tokens de audio ni la composicion exacta del dataset. No hay evidencia de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste fino supervisado convencional.

## Capacidades

- Transcripcion de audio a texto en ingles, con especializacion en acento britanico.
- Reconocimiento automatico del habla (ASR) sobre ventanas de audio de hasta 30 segundos, tal como define la arquitectura Whisper.
- Generacion de transcripciones con puntuacion y mayusculas basicas, heredadas del modelo base.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte multilingue mas alla del ingles; el ajuste fino se ha realizado solo sobre datos en ingles britanico.
- No se ha documentado modo thinking, vision ni audio mas alla del propio ASR.
- Capacidad de ejecucion en entornos con recursos limitados gracias a su tamano reducido.

## Casos de uso

- Transcripcion de reuniones y entrevistas con hablantes britanicos: el modelo puede procesar audio de hasta 30 segundos por ventana y generar transcripciones en ingles, adecuado para actas internas o notas de voz en entornos corporativos del Reino Unido.
- Subtitulado automatico de videos con acento britanico: util para creadores de contenido o plataformas que necesiten generar subtitulos en ingles britanico sin depender de servicios en la nube.
- Prototipos de asistentes de voz en dispositivos embebidos: su tamano de 37,7 millones de parametros permite ejecucion en CPU o GPUs de gama baja, ideal para pruebas de concepto en Raspberry Pi o moviles.
- Preprocesamiento de audio en pipelines de datos: transcripcion masiva de grabaciones para su posterior analisis de texto (busqueda, clasificacion, mineria de opiniones) en contextos donde el acento britanico es mayoritario.
- Investigacion en adaptacion dialectal: sirve como caso de estudio de fine-tuning de Whisper tiny sobre un unico acento, util para comparar estrategias de especializacion.
- Educacion y practica de ingles: transcripcion de audio de estudiantes o materiales didacticos con acento britanico para generar transcripciones de referencia.
- Automatizacion de notas en call centers del Reino Unido: transcripcion de llamadas para su posterior analisis de calidad, aunque con las limitaciones de precision de un modelo tiny.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card (no verificados por terceros):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny British | British English (split test) | WER | 13,62 |
| Whisper tiny British (checkpoint intermedio, paso 1000) | British English | WER | 15,12 |
| Whisper tiny British (checkpoint final, paso 2000) | British English | WER | 13,62 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,7 millones de parametros, aproximadamente 150 MB de pesos mas activaciones); en fp16, alrededor de 75 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1050, RTX 3050, RTX 4090, A100 o H100; el modelo no aprovecha GPUs de gama alta por su reducido tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU (la inferencia en CPU es viable para audio corto).
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica (no es un modelo de lenguaje), llama.cpp no soporta arquitectura Whisper de forma nativa, Ollama no lo soporta, TGI no esta orientado a ASR. La opcion principal es transformers con PyTorch, o herramientas especificas como faster-whisper (compatible con pesos Whisper) o whisper.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en la practica, para un modelo tiny se espera un throughput alto en GPU y moderado en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (British English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny British (este modelo) | 37,7 M | 30 s | 13,62 (declarado, no verificado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en la informacion | apache-2.0 | Hugging Face |

No se dispone de datos de WER comparables para los modelos base en el mismo dataset, por lo que la comparativa de rendimiento no puede establecerse con rigor. La principal ventaja de este modelo frente a whisper-tiny original es su especializacion en acento britanico, aunque no hay evidencia publica de que supere al modelo base en ese dominio mas alla del dato declarado por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con datos de ingles britanico, el modelo puede tener un rendimiento degradado con otros acentos o variantes del ingles; no se ha evaluado su comportamiento fuera de ese dominio.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible pero incorrecto en segmentos de audio con ruido, silencios o habla no inteligible, especialmente en un modelo tiny con capacidad limitada.
- Limitaciones de contexto: la arquitectura Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre fragmentos.
- Limitaciones de idioma: solo soporta ingles; no se ha documentado soporte para otros idiomas, y el ajuste fino puede haber degradado el rendimiento multilingue original de whisper-tiny.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de licencia y se atribuya adecuadamente.
- Caveats para produccion: el modelo no ha sido verificado por terceros, tiene un uso muy bajo (30 descargas) y la model card carece de informacion sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez. No se recomienda su uso en produccion sin una evaluacion propia sobre datos representativos del dominio objetivo.
- El WER de 13,62 es elevado en terminos absolutos para ASR en ingles (los modelos grandes suelen estar por debajo del 5-10 % en condiciones limpias), por lo que su uso en aplicaciones criticas requiere validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sureshtara/whisper-tiny_to_british_accent_26oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Implementacion whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Implementacion faster-whisper: https://github.com/SYSTRAN/faster-whisper
