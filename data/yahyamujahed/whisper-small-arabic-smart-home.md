# YahyaMujahed/whisper-small-arabic-smart-home

## Resumen

Whisper Small Arabic Smart-Home es un ajuste fino mediante LoRA del modelo openai/whisper-small, publicado por el usuario YahyaMujahed en HuggingFace. Su proposito es transcribir comandos de voz cortos en arabe levantino (dialecto jordano) orientados a domotica: encendido y apagado de luces, control de aire acondicionado y apertura o cierre de persianas. El modelo se plantea como la etapa de reconocimiento automatico del habla (ASR) dentro de un pipeline de asistente domestico por voz, no como un modelo de ASR general.

Tecnicamente es un transformer encoder-decoder de tipo Whisper con 241.734.912 parametros totales, en el que se han congelado los pesos base y se ha entrenado unicamente un adaptador LoRA (r=32, alpha=64, dropout=0.05) sobre las proyecciones q_proj y v_proj. El repositorio se distribuye en formato safetensors bajo licencia MIT, heredada del modelo base, y declara compatibilidad con los Inference Endpoints de HuggingFace.

La relevancia del modelo es acotada pero clara: demuestra que un ajuste fino ligero sobre un dataset piloto muy pequeno (170 grabaciones, un solo hablante) puede reducir el WER de 0,835 a 0,106 en el dominio objetivo. Sus propios autores advierten de que el rendimiento se degrada fuera de ese hablante, microfono y condicion acustica, y de que existe un dataset mayor en preparacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA sobre el modelo base |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 s por inferencia (arquitectura Whisper); longitud de contexto textual no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors sin cuantizaciones alternativas) |
| Idiomas soportados | arabe (dialecto jordano / levantino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper en su variante small: un transformer encoder-decoder que procesa espectrogramas log-Mel de 80 canales calculados a partir de audio mono a 16 kHz, con ventanas de 30 segundos. Sobre esta base se aplica un ajuste fino con LoRA (PEFT): los pesos del modelo original permanecen congelados y solo se entrenan matrices de bajo rango inyectadas en q_proj y v_proj, con r=32, lora_alpha=64 y lora_dropout=0,05. No se han documentado detalles sobre el numero de tokens, la composicion completa del dataset ni el uso de RLHF o DPO.

El entrenamiento se realizo sobre un dataset piloto de 170 grabaciones de un unico hablante, capturadas con microfono cercano en una sala silenciosa. Las grabaciones cubren 3 categorias de dispositivos (luces, aire acondicionado y persianas) y 14 acciones distintas (encender, apagar, fijar, atenuar, subir brillo, abrir, cerrar, aumentar, disminuir, entre otras), disenadas para recoger variacion natural de fraseo en cada comando. Los autores senalan que un dataset mayor con 5 hablantes, mas de 300 comandos y condiciones variadas esta en desarrollo y sustituira al actual.

## Capacidades

- Transcripcion de comandos de voz cortos en arabe levantino (jordano) referidos a iluminacion, aire acondicionado y persianas.
- Reconocimiento de variacion de fraseo dentro del dominio de comandos de domotica.
- Salida de texto plano que puede alimentar una capa posterior de extraccion de intencion (keyword matching o un LLM) para obtener una accion estructurada del tipo (dispositivo, accion, valor).
- Inferencia sobre audio mono a 16 kHz mediante la API estandar de transformers (WhisperForConditionalGeneration y WhisperProcessor).
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni flujos de agente.
- No ofrece capacidades multilingues: el ajuste esta limitado al arabe jordano.
- No incorpora vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Control por voz de iluminacion domestica: el modelo transcribe comandos como encendidos, apagados, atenuaciones o cambios de brillo, y su salida se mapea a una accion sobre el dispositivo mediante una capa de intencion.
- Control de climatizacion: transcripcion de ordenes de encendido, apagado y ajuste de temperatura del aire acondicionado, integrable en un asistente de voz para el hogar.
- Gestion de persianas y estores: reconocimiento de comandos de apertura, cierre y regulacion, util en escenarios de automatizacion residencial.
- Prototipo de asistente domestico completo: el modelo actua como etapa ASR dentro de un pipeline que combina transcripcion, extraccion de intencion y ejecucion sobre un bus domotico (por ejemplo, Home Assistant o MQTT).
- Anotacion y transcripcion batch de grabaciones de comandos: util para generar transcripciones de referencia en la construccion de datasets de voz orientados a domotica.
- Recogida de datos para escalado del dataset: el modelo puede emplearse como etiquetador inicial en un ciclo de active learning que priorice las muestras con mayor error para ampliar el corpus.
- Investigacion academica sobre ajuste fino eficiente: sirve como caso de estudio del impacto de LoRA en ASR dialectal con muy pocos datos, y como linea base para comparar con el dataset ampliado previsto.

## Benchmarks y rendimiento

Evaluacion realizada sobre una particion held-out de 26 muestras (15 %) del mismo hablante y la misma condicion acustica que el entrenamiento, con normalizacion previa de diacriticos y script de digitos:

| Metrica | whisper-small zero-shot (base) | Este fine-tune |
|---|---|---|
| WER | 0,835 | 0,106 |
| CER | 0,395 | 0,037 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos de ASR en arabe fuera de la linea base del propio modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia con los 241,7 M de parametros: aproximadamente 0,97 GB en FP32, unos 0,48 GB en FP16/BF16, 0,24 GB en INT8 y 0,12 GB en INT4, sin contar el overhead del runtime y las activaciones.
- GPU recomendadas: cabe holgadamente en cualquier GPU moderna. Suficiente una RTX 3060 (12 GB), RTX 4070, RTX 4090, e incluso GPUs de gama baja con 4-6 GB. En entornos de servidor funciona sin problemas en A100, H100 o L4, aunque estan sobredimensionadas para este tamano.
- Inferencia en CPU perfectamente viable dado el tamano reducido del modelo.
- Opciones de despliegue: transformers (compatible con el snippet de la model card), faster-whisper, whisper.cpp con pesos convertidos a GGML/GGUF y HuggingFace Inference Endpoints (la model card declara endpoints_compatible). El soporte en vLLM u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Benchmark en este dominio |
|---|---|---|---|---|---|
| YahyaMujahed/whisper-small-arabic-smart-home | 241,7 M | ventanas de 30 s | solo arabe jordano | MIT | WER 0,106 / CER 0,037 |
| openai/whisper-small (base) | ~244 M | ventanas de 30 s | multilingue (99 idiomas declarados) | MIT | WER 0,835 / CER 0,395 (zero-shot, mismo test) |
| openai/whisper-base | no disponible | ventanas de 30 s | multilingue | MIT | no disponible |
| openai/whisper-medium | no disponible | ventanas de 30 s | multilingue | MIT | no disponible |

La comparacion directa frente al modelo base es la unica con datos publicados: el fine-tune mejora el WER en 0,729 puntos absolutos y el CER en 0,358 puntos en el conjunto de evaluacion, aunque sobre un unico hablante y condicion. Para modelos de ASR en arabe de terceros no se dispone de cifras comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El entrenamiento proviene de un unico hablante y una unica condicion de grabacion (microfono cercano, sala silenciosa); se espera una degradacion notable con otras voces, acentos, microfonos o entornos ruidosos o con microfono lejano.
- El dataset de entrenamiento es muy pequeno (170 grabaciones) y se describe explicitamente como piloto.
- El modelo no ha sido evaluado con otros dialectos arabes, otros hablantes ni en dominios distintos al de comandos de domotica.
- Existe riesgo de alucinacion tipico de los modelos Whisper, especialmente ante audio fuera de dominio o silencios; no se ha documentado mitigacion especifica.
- La salida es texto libre: para controlar dispositivos requiere una capa adicional de extraccion de intencion que interprete el comando como (dispositivo, accion, valor).
- La licencia MIT permite uso comercial, pero no se ofrecen garantias de calidad ni de robustez fuera del dominio evaluado.
- El numero de descargas y likes es cero en la fecha de la ficha, por lo que no existe validacion por parte de la comunidad.
- No se especifican sesgos conocidos mas alla de los derivados del unico hablante y dialecto; no hay informacion sobre representacion de genero, edad o variacion acentual.
- El repositorio esta fechado en septiembre de 2026 y sus autores anuncian un dataset ampliado en preparacion, por lo que conviene verificar actualizaciones antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YahyaMujahed/whisper-small-arabic-smart-home
- Modelo base: https://huggingface.co/openai/whisper-small
- Libreria transformers: https://github.com/huggingface/transformers
- PEFT (LoRA): https://github.com/huggingface/peft
- Implementacion faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Implementacion whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
