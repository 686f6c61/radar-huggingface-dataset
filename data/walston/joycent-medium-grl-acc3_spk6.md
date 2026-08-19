# walston/joycent-medium-grl-acc3_spk6

## Resumen

El modelo `walston/joycent-medium-grl-acc3_spk6` es un modelo acústico de síntesis de voz (text-to-speech) para mandarín, desarrollado por el usuario `walston`. Se basa en la arquitectura Joycent, una implementación de Grad-TTS (un modelo de difusión para generación de espectrogramas mel), y ha sido entrenado utilizando embeddings de acento extraídos por el modelo WhisAID (`walston/whisaid-medium-grl`). El objetivo principal es permitir la síntesis de voz en mandarín con control fino sobre el acento del hablante, una capacidad poco común en los TTS convencionales.

El checkpoint publicado corresponde a la época 100 de entrenamiento y tiene un tamaño de repositorio de 0,2 GB. Para generar audio completo es necesario combinar este modelo acústico con el vocoder Joycent (`walston/joycent-vocoder`). La licencia es MIT, lo que facilita su uso comercial y académico. Su relevancia radica en que ofrece una vía para personalizar acentos regionales o de hablantes en mandarín, un aspecto clave para aplicaciones de doblaje, asistentes virtuales y contenido localizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Joycent / Grad-TTS (modelo acústico de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no aplica contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión completa, sin cuantizaciones publicadas) |
| Idiomas soportados | Mandarín (según tags del repositorio) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en Joycent, una implementación de Grad-TTS. Grad-TTS es un modelo acústico generativo que utiliza un proceso de difusión para convertir secuencias de texto (con embeddings fonéticos) en espectrogramas mel. En este caso, el modelo incorpora una dimensión adicional de embeddings de acento (dimensión 256) extraídos mediante WhisAID, un modelo de reconocimiento de acento. Esto permite condicionar la síntesis sobre un vector de acento específico, de modo que el hablante generado tenga características acentuales determinadas.

El entrenamiento se realizó con el dataset WhisAID (implícito por el nombre del extractor de acentos), aunque no se proporcionan detalles sobre el número de horas de audio, la composición del corpus ni el proceso de alineamiento. El checkpoint liberado corresponde a la época 100, lo que sugiere un entrenamiento prolongado para asegurar convergencia. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo generativo de audio.

## Capacidades

- Síntesis de voz en mandarín con control de acento: el modelo puede generar habla con acentos específicos codificados en el vector de acento de 256 dimensiones.
- Generación de espectrogramas mel de alta calidad mediante el proceso de difusión de Grad-TTS.
- Compatible con el vocoder Joycent para convertir espectrogramas en audio de forma íntegra.
- Integración con el ecosistema Joycent: el checkpoint se puede usar directamente con `joycent/inference_joycent.py` para síntesis completa.
- Soporte de embeddings de acento extraídos por WhisAID, lo que permite transferir acentos de hablantes reales al modelo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de síntesis de voz.

## Casos de uso

- Doblaje y localización de contenido audiovisual: el control de acento permite generar voces en mandarín con acentos regionales (por ejemplo, pekinés, cantonés con acento mandarín, etc.) para series, películas o videojuegos, sin necesidad de contratar actores de doblaje específicos.
- Asistentes virtuales personalizados: se puede adaptar la voz de un asistente a un acento concreto para mejorar la cercanía con usuarios de distintas regiones de China o Taiwán.
- Audiolibros y narración: generación de narraciones con acentos determinados para dar variedad a personajes en audiolibros o podcasts.
- Síntesis de voz para personas con discapacidad: permitir que usuarios generen su propia voz con un acento deseado, mejorando la naturalidad en comunicadores aumentativos.
- Investigación en fonética y acentos: el modelo sirve como herramienta para estudiar cómo varían los parámetros acústicos según el acento, y para generar estímulos controlados en experimentos de percepción del habla.
- Pruebas de sistemas de reconocimiento de voz: generar habla con acentos variados para evaluar la robustez de ASR (reconocimiento automático del habla) en mandarín.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros modelos TTS en mandarín.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo acústico de difusión con un checkpoint de 0,2 GB, la inferencia es ligera. Se estima que puede ejecutarse en GPUs con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060) en precisión FP32.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo gamas medias como RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo estándar.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede integrar en pipelines propios. No se mencionan adaptaciones a vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo de difusión, la generación requiere múltiples pasos de muestreo, por lo que la latencia será mayor que en modelos autoregresivos, pero no se tienen cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos TTS de mandarín como VITS, FastSpeech 2 o Tacotron 2. La característica diferenciadora de este modelo es el control de acento mediante embeddings de WhisAID, algo poco común en los TTS estándar. Se puede comparar cualitativamente:

- VITS: modelo end-to-end más rápido, pero sin control de acento explícito.
- FastSpeech 2: no ofrece control de acento por defecto.
- Joycent estándar (sin acentos): no permite variar el acento; este modelo sí.

Sin datos de benchmarks, no es posible establecer una comparativa objetiva de calidad de audio.

## Limitaciones y advertencias

- No se documentan los acentos específicos soportados ni el número de hablantes utilizados en el entrenamiento; el control de acento depende de la calidad de los embeddings de WhisAID, que no está validada en este repositorio.
- El modelo es solo acústico: requiere el vocoder Joycent para generar audio final, lo que añade un paso adicional y posible propagación de errores.
- No se proporcionan instrucciones detalladas de uso más allá de un ejemplo de descarga del checkpoint; la integración con `joycent/inference_joycent.py` no está documentada en esta ficha.
- Riesgo de alucinación: en TTS, esto se manifiesta como pronunciaciones incorrectas o artefactos en el audio, especialmente con textos fuera del dominio de entrenamiento (por ejemplo, nombres extranjeros o jerga técnica).
- Sesgos: al estar entrenado con datos de WhisAID, podría reflejar sesgos en la representación de ciertos acentos o dialectos del mandarín.
- Licencia MIT permite uso comercial, pero no se garantiza la calidad ni la ausencia de derechos de terceros sobre los datos de entrenamiento.
- No se especifica la longitud máxima de texto que puede procesar; en modelos de difusión, secuencias muy largas pueden degradar la calidad o agotar memoria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/walston/joycent-medium-grl-acc3_spk6
- Extractor de acentos WhisAID: https://huggingface.co/walston/whisaid-medium-grl
- Vocoder Joycent: https://huggingface.co/walston/joycent-vocoder
