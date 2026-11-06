# sureshtara/whisper-tiny_to_american_accent_26oct

## Resumen

Whisper tiny American es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario sureshtara en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, disenada originalmente por OpenAI para transcripcion multilingue, y ha sido reentrenado sobre un dataset de ingles americano (American_english) para especializarlo en ese acento concreto. Con 37,76 millones de parametros, es una variante extremadamente ligera orientada a despliegues con recursos muy limitados.

La relevancia de este modelo es practica: Whisper tiny es la variante mas pequena de la familia Whisper y, tras el ajuste fino, el autor reporta un WER de 9,12 sobre el split de test del dataset American English. Esto lo situa como una opcion viable para transcripcion de audio en ingles americano en entornos de borde (edge), dispositivos con poca VRAM o pipelines de bajo coste donde un modelo grande seria inviable.

Se trata, sin embargo, de un modelo de nicho: la model card esta generada automaticamente por el Trainer de Hugging Face y contiene secciones sin completar ("More information needed"), por lo que la documentacion sobre composicion del dataset, procedimiento de entrenamiento e intencion de uso es escasa. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper estandar) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI para tareas de reconocimiento automatico del habla. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel y genera la transcripcion de forma autorregresiva. La variante tiny es la de menor capacidad de la familia, con 37,76 millones de parametros, lo que la hace apta para inferencia en CPU y GPU de gama baja.

El ajuste fino se realizo sobre el dataset American_english con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos de entrenamiento totales. El autor reporta una perdida de validacion de 0.1867 y un WER de 9.1191 al final del entrenamiento. No se especifica el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo ASR de este tipo). Las versiones de framework empleadas fueron Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, especializado en acento americano.
- Transcripcion de audio a texto con salida en formato texto plano.
- Procesamiento de segmentos de audio de hasta 30 segundos por pasada (ventana estandar de Whisper).
- Capacidad multilingue limitada: el modelo solo declara soporte para ingles (en).
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No incorpora vision, audio generativo ni modos de pensamiento (thinking mode).
- Capacidad de traduccion de voz a texto: no confirmada en la informacion disponible; el ajuste se realizo solo sobre transcripcion en ingles.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede convertir grabaciones cortas en texto con un WER reportado del 9,12 %, adecuado para actas internas o resumenes posteriores donde no se exige transcripcion literal perfecta.
- Subtitulado automatico de contenido audiovisual en ingles: por su tamano reducido, puede ejecutarse en pipelines de procesamiento por lotes a bajo coste, generando subtitulos preliminares que luego se revisan manualmente.
- Asistentes de voz embebidos en dispositivos de borde: con 37,76 millones de parametros, cabe en dispositivos con poca memoria y permite reconocimiento de comandos o dictado sin conexion a la nube.
- Preprocesamiento de audio para pipelines de NLP: transcripcion previa de llamadas o grabaciones en ingles americano antes de aplicar analisis de sentimiento, extraccion de entidades o clasificacion.
- Investigacion y experimentacion en ASR: al ser un ajuste fino reproducible sobre whisper-tiny con hiperparametros documentados, sirve como linea base para estudiar el efecto del ajuste por acento en modelos pequenos.
- Prototipado rapido de aplicaciones de voz: gracias a su licencia Apache 2.0 y su integracion con transformers, permite validar productos de transcripcion en fases tempranas sin coste de licencia.
- Accesibilidad: generacion de transcripciones para contenido en ingles americano destinado a personas con discapacidad auditiva, en entornos donde el coste computacional es una restriccion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Tarea | Dataset | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny American | Automatic Speech Recognition | American English (split test) | WER | 9.1191 |
| Whisper tiny American | Automatic Speech Recognition | American English (split test) | Loss | 0.1867 |

Evolucion durante el entrenamiento segun la model card:

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 0.9452 | 1000 | 0.2033 | 10.9981 |
| 1.8904 | 2000 | 0.1867 | 9.1191 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en benchmarks estandar como LibriSpeech, Common Voice o MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,76 millones de parametros, aproximadamente 150 MB en fp32); en fp16 alrededor de 75 MB de pesos, mas el overhead de activaciones y del procesador de audio.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el modelo cabe en GTX 1650, RTX 3060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 1-2 GB de VRAM libre.
- Tambien es viable en CPU: por su tamano, la inferencia en CPU es factible para audio corto, aunque con mayor latencia.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no es la via habitual para ASR; son adecuados frameworks como faster-whisper, whisper.cpp, Ollama (si se convierte a GGUF) y TGI para servir el modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera latencia baja en GPU y moderada en CPU para segmentos de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER reportado |
|---|---|---|---|---|---|
| Whisper tiny American (este modelo) | 37,76 M | 30 s por ventana (estandar Whisper) | en | apache-2.0 | 9.1191 (American English, test) |
| openai/whisper-tiny | 37,76 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en esta ficha |

La comparacion directa de WER no es posible porque la informacion proporcionada solo incluye el resultado del modelo ajustado sobre su propio dataset de evaluacion (American English); los valores de los modelos base de OpenAI no se han incluido en la informacion disponible.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar: no hay documentacion sobre composicion del dataset, origen de las grabaciones ni criterios de calidad.
- El WER de 9.1191 no esta verificado de forma independiente (campo "verified: false" en el model-index); debe tomarse como dato declarado por el autor.
- El modelo solo declara soporte para ingles (en) y esta especializado en acento americano; su rendimiento en otros acentos o idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en ASR: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido, especialmente en variantes pequenas.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un dataset de acento concreto, puede presentar sesgo hacia ese acento y peor rendimiento en hablantes no nativos.
- Limitacion de contexto: la ventana estandar de Whisper es de 30 segundos por segmento; audios mas largos requieren segmentacion y concatenacion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion de incluir el aviso de licencia y la atribucion correspondiente.
- Para produccion: al ser un modelo tiny, la precision en condiciones reales (ruido, solapamiento de hablantes, audio telefonico) puede ser notablemente inferior a la reportada en el dataset de evaluacion; se recomienda validacion propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sureshtara/whisper-tiny_to_american_accent_26oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
