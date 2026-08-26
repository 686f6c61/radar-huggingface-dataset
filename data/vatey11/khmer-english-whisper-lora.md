# vatey11/khmer-english-whisper-lora

## Resumen

Whisper Small Khmer-English LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por vatey11, que afina el modelo base seanghay/whisper-small-khmer-v2 sobre un dataset propio de reconocimiento automático del habla (ASR) con cambio de código entre jemer (km) e inglés. El modelo base es una variante de Whisper Small de OpenAI, adaptada previamente al idioma jemer, y este adaptador busca mejorar su rendimiento en escenarios de habla mixta jemer-inglés, un caso frecuente en contextos coloquiales y técnicos en Camboya.

La relevancia de este modelo radica en que el jemer es un idioma de bajos recursos en el ecosistema ASR, y el cambio de código con el inglés supone un reto adicional para los sistemas de transcripción. Al emplear LoRA, el adaptador es ligero (0,1 GB) y puede combinarse con el modelo base sin necesidad de reentrenar todos los parámetros. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La ficha se basa exclusivamente en la información publicada en HuggingFace. La model card es escasa y no incluye detalles sobre el dataset de entrenamiento, la arquitectura interna del adaptador ni benchmarks independientes. Los resultados de evaluación reportados por el autor muestran una tasa de error de carácter (CER) de 88,59 sobre el conjunto de validación, un valor que indica un rendimiento limitado y que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Whisper Small (transformador encoder-decoder) |
| Parametros totales | No disponible (el modelo base Whisper Small tiene 244 M; los parametros del adaptador no se publican) |
| Parametros activos | No disponible |
| Longitud de contexto | 30 segundos de audio (limitacion inherente de Whisper) |
| Tipos de cuantizacion | No especificado (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Jemer (km) e ingles (codigo alternado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre seanghay/whisper-small-khmer-v2, una version de Whisper Small afinada para jemer. Whisper Small es un transformer encoder-decoder con aproximadamente 244 millones de parametros, entrenado por OpenAI sobre 680.000 horas de audio supervisado multilingue. El adaptador LoRA introduce matrices de bajo rango en las capas de atencion del modelo base, lo que permite un ajuste eficiente con un numero reducido de parametros entrenables.

El entrenamiento se realizo sobre un dataset propio denominado custom_khmer_english, del que no se publican detalles de composicion, tamano ni procedencia. Se empleo el framework PEFT con Transformers, utilizando el optimizador AdamW (fused) con una tasa de aprendizaje de 0,001, un batch efectivo de 16 (batch de 8 con acumulacion de gradientes de 2), scheduler lineal con 50 pasos de warmup y 3000 pasos de entrenamiento en total. Se utilizo precision mixta nativa (AMP). No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es un ajuste supervisado clasico con funcion de perdida de ASR (cross-entropy sobre tokens de texto).

## Capacidades

- Transcripcion de audio a texto en jemer con cambio de codigo a ingles.
- Reconocimiento de voz multilingue limitado a jemer e ingles (el modelo base Whisper Small soporta 96 idiomas, pero el adaptador se entrena especificamente para el par km-en).
- Inferencia sobre segmentos de audio de hasta 30 segundos.
- Integracion con el ecosistema Transformers y PEFT para carga y uso directo.
- No se reportan capacidades de traduccion de voz, diarizacion de hablantes ni identificacion de idioma especificas del adaptador.
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de ASR.

## Casos de uso

- Transcripcion de reuniones y conversaciones bilingues jemer-ingles: el modelo puede procesar audio de reuniones donde los hablantes alternan entre ambos idiomas, generando transcripciones utiles para actas o busquedas posteriores. Su ventana de 30 segundos es adecuada para turnos de palabra cortos.
- Subtitulado automatico de contenido audiovisual en Camboya: videos, podcasts o emisiones locales con mezcla de idiomas pueden subtitularse de forma automatizada, reduciendo el coste de transcripcion manual.
- Asistentes de voz para servicios publicos: integrado en un pipeline de ASR, puede transcribir consultas de ciudadanos que mezclan jemer e ingles en ventanillas unicas o centros de atencion.
- Analisis de llamadas de soporte tecnico: empresas con operaciones en Camboya pueden transcribir grabaciones de servicio al cliente para analisis de calidad y deteccion de problemas recurrentes.
- Investigacion linguistica sobre cambio de codigo: el modelo puede servir como herramienta para estudiar patrones de alternancia de codigo en corpus orales, aunque su CER actual limita la fiabilidad de las transcripciones.
- Generacion de datos de entrenamiento: las transcripciones producidas pueden usarse para crear datasets etiquetados que alimenten modelos ASR mas grandes o sistemas de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes en la informacion disponible. La model card incluye una tabla de resultados de entrenamiento con la tasa de error de caracter (CER) sobre el conjunto de validacion, que se reproduce a continuacion. Nota: los valores de CER y loss de las ultimas dos filas aparecen intercambiados en la tabla original; se mantienen tal cual se publicaron.

| Paso | Loss de entrenamiento | CER | Loss de validacion |
|:----:|:---------------------:|:---:|:------------------:|
| 250  | 1,6664                | 118,83 | 0,8611          |
| 500  | 1,5000                | 100,16 | 0,8207          |
| 750  | 1,3101                | 94,70  | 0,8119          |
| 1000 | 1,2421                | 94,35  | 0,8093          |
| 1250 | 1,2872                | 99,25  | 0,8217          |
| 1500 | 1,1839                | 89,03  | 0,8532          |
| 1750 | 0,9967                | 92,82  | 0,8987          |
| 2000 | 0,9279                | 91,07  | 0,9522          |
| 2250 | 0,8040                | 85,75  | 0,9839          |
| 2500 | 0,6581                | 90,34  | 1,0604          |
| 2750 | 0,5392                | 1,1336 | 88,5171         |
| 3000 | 0,4916                | 1,1678 | 88,5922         |

El CER final de 88,59 % es muy elevado, lo que sugiere que el modelo produce transcripciones con un alto numero de errores a nivel de caracter. No se aportan comparaciones con el modelo base ni con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper Small requiere aproximadamente 1 GB de VRAM en FP32; con el adaptador LoRA, el consumo adicional es minimo (inferior a 0,1 GB). En FP16, el uso de VRAM se reduce a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, A100, H100, etc. Tambien puede ejecutarse en CPU con rendimiento aceptable para audio corto.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria Transformers de HuggingFace. Para inferencia en produccion, puede servirse con pipelines de ASR como Whisper.cpp (si se convierte el modelo base a GGUF y se fusiona el adaptador) o con TGI/vLLM si se adapta el formato, aunque no hay soporte nativo documentado para estos ultimos en el caso de ASR.
- Latencia y throughput: no se han publicado mediciones. Como referencia, Whisper Small procesa audio mas rapido que en tiempo real en GPU modernas (factor de aproximadamente 10x en RTX 3090), pero el adaptador no altera significativamente este comportamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| vatey11/khmer-english-whisper-lora | 244 M (base) + LoRA | 30 s audio | km, en | Apache 2.0 | Adaptador LoRA sobre Whisper Small Khmer v2; CER alto (88,59) |
| seanghay/whisper-small-khmer-v2 | 244 M | 30 s audio | km, en | Apache 2.0 | Modelo base afinado para jemer; sin adaptador especifico para code-switching |
| openai/whisper-small | 244 M | 30 s audio | 96 idiomas | MIT | Modelo original de OpenAI; no optimizado para jemer |

No se dispone de datos de rendimiento comparativo publicados para estos modelos en el mismo conjunto de evaluacion. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El CER reportado (88,59 %) es extremadamente alto, lo que indica que el modelo produce transcripciones con numerosos errores. No es recomendable para uso en produccion sin una evaluacion exhaustiva previa.
- La model card no proporciona informacion sobre el dataset de entrenamiento (tamano, composicion, procedencia), lo que impide evaluar posibles sesgos o limitaciones de cobertura.
- No se han publicado benchmarks independientes ni comparaciones con el modelo base o alternativas.
- El modelo solo soporta segmentos de audio de hasta 30 segundos; audios mas largos requieren segmentacion previa.
- El adaptador esta entrenado especificamente para cambio de codigo jemer-ingles; su rendimiento en jemer monolingue o ingles monolingue puede ser inferior al del modelo base.
- No se garantiza la ausencia de alucinaciones en la transcripcion, especialmente en audio con ruido o solapamiento de hablantes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base seanghay/whisper-small-khmer-v2 tambien debe cumplir su propia licencia (Apache 2.0 segun su ficha).
- El repositorio no incluye un modelo fusionado; es necesario cargar el adaptador junto con el modelo base, lo que anade complejidad al despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vatey11/khmer-english-whisper-lora
- Modelo base seanghay/whisper-small-khmer-v2: https://huggingface.co/seanghay/whisper-small-khmer-v2
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Repositorio de pruebas ASR para jemer (referencia externa): https://github.com/Tevaada/ASR-Model-Testing-/tree/main
