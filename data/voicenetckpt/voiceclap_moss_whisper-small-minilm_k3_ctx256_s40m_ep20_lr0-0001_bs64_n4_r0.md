# VoiceNetCkpt/voiceclap_moss_whisper-small-MiniLM_k3_ctx256_s40M_ep20_lr0.0001_bs64_n4_r0

## Resumen

voiceclap_moss_whisper-small-MiniLM es un checkpoint de entrenamiento publicado por VoiceNetCkpt dentro de la serie de experimentos VoiceCLAP. Contiene los pesos finales de una ejecución concreta junto con los ficheros de configuración y los resultados de evaluación de esa misma ejecución; no incluye épocas intermedias, estado del optimizador ni registros de entrenamiento. El repositorio ocupa 1,3 GB repartidos en 13 ficheros, y los pesos se encuentran en `checkpoints/epoch_latest.pt`.

La nomenclatura del identificador permite deducir la configuración del experimento: Whisper-small como codificador de audio, MiniLM como codificador de texto, un parámetro `k=3`, una longitud de contexto de 256 (`ctx=256`), 40 millones de muestras de entrenamiento (`s40M`), 20 épocas (`ep20`), tasa de aprendizaje 0,0001, tamaño de lote 64, 4 nodos y ejecución 0. El término `moss` aparece en el nombre pero no se explica en la model card.

Su relevancia es la de un artefacto de investigación reproducible dentro de un índice de ejecuciones comparables. No es un modelo listo para producción: la model card no declara licencia, idiomas, pipeline ni métricas numéricas, y el autor no publica ninguna evaluación en el texto disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como especificación formal; la nomenclatura indica un modelo contrastivo audio-texto (Whisper-small como codificador de audio y MiniLM como codificador de texto), sin confirmación en la model card |
| Parametros totales | no disponible (el repositorio de 1,3 GB incluye pesos, configuraciones y resultados de evaluación, por lo que no equivale al tamaño de los pesos) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 256 (`ctx=256`); la unidad (tokens de texto, frames de audio o segundos) no se especifica |
| Tipos de cuantizacion | no disponible (solo se publica `epoch_latest.pt` en punto flotante) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El nombre del checkpoint describe una ejecución de entrenamiento contrastivo entre audio y texto. Los componentes declarados en el propio identificador son Whisper-small en la rama de audio y MiniLM en la rama de texto, con un parámetro `k=3` cuyo significado (número de negativos, número de candidatos o tamaño de vecindad) no se documenta. La model card no incluye diagrama de arquitectura, tipo de proyección, dimensión de embedding ni función de pérdida.

Los hiperparámetros sí están fijados en el nombre: 40 millones de muestras, 20 épocas, tasa de aprendizaje 0,0001, tamaño de lote 64 y 4 nodos. No hay información sobre la composición del dataset, la procedencia del audio, si hubo filtrado, aumento de datos o etapas de ajuste fino posteriores. Tampoco se indica si el entrenamiento finalizó correctamente: el autor publica los ficheros de evaluación de la ejecución, pero no reproduce sus cifras en el texto de la model card.

## Capacidades

- Modelo de representación, no generativo: por la nomenclatura se trata de un sistema contrastivo de audio y texto (estilo CLAP), es decir, produce embeddings alineados de ambas modalidades en lugar de generar texto o audio. Esta capacidad es una inferencia a partir del nombre y no está confirmada en la model card.
- Recuperación cruzada audio-texto: puntuación de similitud entre un clip de audio y una descripción textual.
- Clasificación zero-shot: clasificación de audio usando etiquetas de texto como prototipos, si el modelo es efectivamente CLAP.
- Extracción de características de audio mediante Whisper-small y de texto mediante MiniLM para tareas posteriores.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica a un modelo de representación.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo de pensamiento, visión, audio generativo): no disponible.

## Casos de uso

- Recuperación de audio por consulta textual: indexar una fonoteca con embeddings de audio y permitir búsquedas del tipo "voz femenina con ruido de fondo" mediante similitud coseno, siempre que el checkpoint se comporte como un CLAP entrenado. Requiere validación previa, ya que no hay métricas publicadas.
- Filtrado y curación de datasets de voz: puntuar pares audio-texto con la similitud del modelo para descartar alineaciones débiles antes de entrenar un sistema de reconocimiento o síntesis de voz.
- Clasificación zero-shot de eventos sonoros: definir las categorías con textos libres y asignar la clase más cercana en el espacio de embeddings, sin reentrenamiento.
- Detección de duplicados y near-duplicates en corpus de audio: agrupar clips con embeddings muy próximos para reducir redundancia en datasets de entrenamiento.
- Evaluación de sistemas de audio-captioning: usar la similitud entre el audio de referencia y las descripciones generadas por otro modelo como métrica automática complementaria a las métricas léxicas.
- Análisis exploratorio y clustering de grabaciones: proyectar los embeddings y agrupar por hablante, idioma o condición acústica como paso previo al etiquetado manual.
- Reproducción de experimentos: comparar esta ejecución con las demás del índice `voiceclap-checkpoints-index` bajo los mismos hiperparámetros, ya que el repositorio incluye las configuraciones de la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el repositorio incluye "evaluation results" de la ejecución, pero no reproduce ninguna cifra, y no se dispone de tablas de MMLU, HumanEval, GSM8K ni de métricas de recuperación audio-texto para este checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 1,3 GB, pero incluye pesos, configuraciones y resultados; el tamaño real de los pesos no se detalla. Con dos codificadores del orden de Whisper-small y MiniLM, una inferencia en fp32 cabría previsiblemente en menos de 2 GB de VRAM, pero es una estimación no confirmada.
- GPU recomendadas: no disponible. Por el tamaño aparente del modelo, cualquier GPU con 4 GB o más de memoria podría ser suficiente, pero no hay datos del autor que lo respalden.
- GPU de consumo: probablemente sí (RTX 3060, RTX 4060, RTX 4090), sin confirmación.
- Opciones de despliegue: no se documentan. Al publicarse únicamente `epoch_latest.pt`, sería necesario convertir los pesos a safetensors u otro formato antes de usar vLLM, TGI, llama.cpp u Ollama; ninguno de estos soportes está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint, por lo que la comparación es únicamente estructural.

| Modelo | Tipo | Codificador de audio | Codificador de texto | Licencia | Notas |
|---|---|---|---|---|---|
| voiceclap_moss_whisper-small-MiniLM (este checkpoint) | contrastivo audio-texto (inferido del nombre) | Whisper-small (según nomenclatura) | MiniLM (según nomenclatura) | no disponible | 40M muestras, 20 épocas, contexto 256; sin métricas publicadas |
| LAION-CLAP | contrastivo audio-texto | HTSAT | RoBERTa | Apache-2.0 (según su propia publicación) | Referencia habitual de la familia CLAP; parámetros y contexto no verificados en la información disponible |
| Microsoft CLAP (2023) | contrastivo audio-texto | HTSAT / PANN | RoBERTa | MIT (según su propia publicación) | Entrenado con datos de audio y texto de distinta procedencia; cifras no verificadas aquí |
| Whisper-small (solo) | reconocimiento de voz seq2seq | Whisper-small | no aplica | Apache-2.0 / MIT según variante | Se usa aquí como componente, no como alternativa funcional: resuelve transcripción, no recuperación audio-texto |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. Debe tratarse como artefacto de investigación hasta que el autor la especifique.
- Ausencia total de métricas: no se publica ninguna evaluación del checkpoint, por lo que no hay evidencia de que el entrenamiento haya convergido ni de que las representaciones sean utilizables.
- Model card mínima: no se documentan idiomas, dominio del dataset, composición de las 40 millones de muestras ni procedencia del audio, lo que impide evaluar sesgos de dominio, acento, idioma o género.
- Riesgo de sesgo heredado: al usar Whisper-small como codificador de audio, es previsible que arrastre sesgos de su corpus de entrenamiento, pero esto no está analizado por el autor.
- Alucinación: no aplica en sentido generativo si el modelo es un codificador contrastivo; si se usa con una cabeza generativa añadida, ese riesgo correspondería al componente añadido y no está evaluado aquí.
- Limitación de contexto: `ctx=256` es una ventana corta; si la unidad son frames o tokens, los clips largos tendrán que truncarse o segmentarse, con la consiguiente pérdida de información global.
- Artefacto de ejecución, no versión estable: el nombre incluye `run=0` y el repositorio forma parte de un índice de ejecuciones; no hay garantía de mantenimiento, versionado ni soporte.
- Formato de pesos propietario de facto (`.pt`): la integración en servidores de inferencia habituales requiere conversión manual y validación posterior.
- Reproducibilidad parcial: el autor indica que las rutas del sistema de ficheros en las configuraciones fueron acortadas, lo que puede dificultar la reproducción exacta del experimento.

## Enlaces

- HuggingFace: https://huggingface.co/VoiceNetCkpt/voiceclap_moss_whisper-small-MiniLM_k3_ctx256_s40M_ep20_lr0.0001_bs64_n4_r0
- Índice de ejecuciones VoiceCLAP: https://huggingface.co/VoiceNetCkpt/voiceclap-checkpoints-index
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
