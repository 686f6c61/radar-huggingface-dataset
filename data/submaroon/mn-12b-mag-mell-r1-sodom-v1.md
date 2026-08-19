# SubMaroon/MN-12B-Mag-Mell-R1-SODOM-v1

## Resumen
El modelo `SubMaroon/MN-12B-Mag-Mell-R1-SODOM-v1` es un ajuste fino (fine-tuning) realizado por el usuario SubMaroon sobre el modelo base `inflatebot/MN-12B-Mag-Mell-R1`, que a su vez pertenece a la familia arquitectónica Mistral según las etiquetas del repositorio. Con 12.247.782.400 parámetros (aproximadamente 12,2 mil millones), el modelo fue entrenado sobre el texto crudo del libro "Los 120 días de Sodoma", utilizando una traducción procedente de un proyecto open source alojado en Internet Archive.

La relevancia de este modelo es limitada y principalmente de carácter experimental o académico. El propio autor advierte en la model card que el resultado "no funciona bien" (traducción de "Not working as well!"), lo que sugiere un ajuste fino de baja calidad o con problemas de sobreajuste severo. No se especifican la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento base, lo que impide su uso en entornos de producción. Su interés radica en estudiar los efectos del fine-tuning sobre dominios extremadamente específicos y las consecuencias del sobreajuste en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, segun etiquetas del repositorio) |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tamano del repo, 119,8 GB, sugiere pesos en precision completa o multiples copias) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo base `inflatebot/MN-12B-Mag-Mell-R1`, que por las etiquetas del repositorio se identifica como un transformer de la familia Mistral. No se proporcionan detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) ni sobre el contexto de entrenamiento del modelo base.

El proceso de entrenamiento consistió en un fine-tuning sobre el texto crudo de "Los 120 días de Sodoma", utilizando una traducción obtenida de un proyecto open source (enlazado a Internet Archive). No se especifican hiperparámetros, número de épocas, técnica de alineación (RLHF, DPO) ni composición del dataset de entrenamiento. El autor declara explícitamente que el modelo "no funciona bien", lo que indica que el ajuste fino no logró los objetivos esperados, posiblemente debido a un dataset demasiado reducido o a un sobreajuste extremo sobre un único texto.

## Capacidades
- Generacion de texto: conserva la capacidad básica de generacion de texto del modelo base de 12,2 B, aunque el autor advierte de un rendimiento deficiente.
- Conversacion: el repositorio incluye la etiqueta `conversational`, lo que sugiere que se probó en tareas de diálogo, pero sin garantías de coherencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
Dado el estado del modelo y la advertencia del autor, los casos de uso realistas son muy limitados y se circunscriben al ambito de la investigacion:

- Estudio de sobreajuste en fine-tuning: el modelo sirve como ejemplo practico de como un dataset extremadamente reducido (un unico libro) degrada el rendimiento general de un modelo de 12 B. Investigadores pueden analizar las metricas de perplejidad o generacion para documentar este fenomeno.
- Analisis de texto literario extremo: podria utilizarse en investigacion academica sobre procesamiento de lenguaje natural aplicado a literatura clasica o transgresora, aunque la calidad de las salidas sera baja.
- Evaluacion de riesgos de contenido: permite probar sistemas de moderacion o filtrado de contenido explicito, ya que el modelo esta entrenado sobre un texto con contenido extremo y etiquetado como `not-for-all-audiences`.
- Benchmark de degradacion: util para comparar como un fine-tuning especifico afecta a las capacidades generales (razonamiento, codigo, matematicas) respecto al modelo base, aunque no se han publicado metricas.
- Educacion en IA: ejemplo didactico para clases sobre etica en IA, sesgos de datos y consecuencias de entrenar con corpora no representativos.
- No es adecuado para produccion, atencion al cliente, generacion de codigo ni ninguna tarea que requiera fiabilidad, debido a la advertencia explicita del autor y la ausencia de licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: basandose en los 12,2 B de parametros, se estima un consumo de aproximadamente 24,5 GB en FP16, 12,5 GB en cuantizacion de 8 bits y 7 GB en cuantizacion de 4 bits. Estas cifras son estimaciones estandar y no estan confirmadas por el autor.
- GPU recomendadas: para FP16 se necesitarian GPUs con 24 GB o mas, como NVIDIA RTX 3090, RTX 4090 o A100. Para cuantizaciones de 4 u 8 bits, una RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) podrian ser suficientes.
- El tamano del repositorio (119,8 GB) sugiere que los pesos se distribuyen en precision completa o en multiples formatos, lo que requiere espacio en disco considerable para su descarga.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI) o convertirse a GGUF para su uso con llama.cpp u Ollama. No se proporcionan configuraciones de latencia o throughput.
- No se recomienda su despliegue en entornos de produccion debido a la falta de garantias de calidad y licencia.

## Comparativa con modelos similares
La comparativa se realiza con modelos abiertos de tamano similar (7 B a 14 B) que son alternativas habituales para generacion de texto, aunque este modelo carece de datos de rendimiento publicados.

| Modelo | Parametros | Contexto | Licencia | Rendimiento conocido |
|---|---|---|---|---|
| SubMaroon/MN-12B-Mag-Mell-R1-SODOM-v1 | 12,2 B | no disponible | no disponible | degradado segun el autor |
| mistralai/Mistral-7B-v0.1 | 7 B | 8.192 tokens | Apache 2.0 | benchmarks publicos extensos (MMLU, HumanEval) |
| Qwen/Qwen2.5-14B | 14 B | 131.072 tokens | Apache 2.0 | benchmarks publicos extensos (MMLU, HumanEval, GSM8K) |

La comparativa muestra que, frente a alternativas establecidas, este modelo carece de informacion sobre contexto, licencia y rendimiento, lo que lo hace inviable para cualquier proyecto serio.

## Limitaciones y advertencias
- Contenido extremo: el modelo fue entrenado sobre "Los 120 dias de Sodoma", una obra con contenido sexual explicito y violento. La etiqueta `not-for-all-audiences` confirma que no es apto para todo publico.
- Rendimiento degradado: el autor indica explicitamente que "no funciona bien", lo que implica alta probabilidad de salidas incoherentes, repetitivas o sin sentido.
- Licencia ausente: al no especificarse licencia, no se puede determinar si es legal su uso comercial o incluso su redistribucion, lo que bloquea su adopcion en entornos empresariales.
- Datos de entrenamiento incompletos: no se detalla la composicion del dataset base ni el proceso de fine-tuning, lo que impide replicar o auditar el entrenamiento.
- Riesgo de alucinacion: al estar sobreajustado a un unico texto, es probable que genere contenido que mezcle el libro con informacion erronea o inventada.
- Sin soporte de herramientas ni agentes: no se confirma soporte para tool calling, lo que limita su integracion en pipelines automatizados.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/SubMaroon/MN-12B-Mag-Mell-R1-SODOM-v1
- Modelo base: https://huggingface.co/inflatebot/MN-12B-Mag-Mell-R1
- Dataset de fine-tuning (Internet Archive): https://archive.org/details/the120daysofsodom
