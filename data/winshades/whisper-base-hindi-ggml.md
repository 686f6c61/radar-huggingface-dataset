# winshades/whisper-base-hindi-ggml

## Resumen

`winshades/whisper-base-hindi-ggml` es una conversion al formato GGML del modelo `collabora/whisper-base-hindi`, que a su vez es un ajuste fino de OpenAI Whisper base sobre aproximadamente 3.000 horas de audio en hindi. No se ha reentrenado nada: los pesos originales se convirtieron a GGML a 16 bits con `convert-h5-to-ggml.py` y despues se comprimieron a `q8_0` con `whisper-quantize`, ambos scripts de whisper.cpp. El resultado es un fichero de 81.768.602 bytes (unos 78 MB) que se ejecuta con whisper.cpp en CPU sin necesidad de GPU.

El problema que resuelve es concreto: dictado y transcripcion offline en hindi dentro de aplicaciones de escritorio. El autor lo publica como descarga de WinShades, una herramienta de lectura y escritura para Windows, de modo que el reconocimiento de voz no dependa de servicios en la nube. Frente al Whisper base original, que segun las mediciones del autor escribe hindi en escritura urdu y acumula un 104% de palabras erroneas, este ajuste baja al 15%.

La relevancia es doble: por un lado demuestra que un modelo base de ~74 M de parametros, ajustado en el idioma adecuado y cuantizado a 8 bits, puede superar en una tarea concreta a modelos 7-10 veces mas grandes en su version cuantizada; por otro, es un ejemplo de distribucion de pesos en GGML para inferencia local en equipos modestos, con una velocidad declarada de unas ocho veces el tiempo real en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base de OpenAI), ajustado por Collabora |
| Parametros totales | ~74 M (arquitectura Whisper base; la model card no indica la cifra) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (1500 fotogramas mel) y 448 tokens de contexto en el decodificador; no explicitado en la model card, inherente a Whisper |
| Tipos de cuantizacion | `q8_0` (8 bits, unico fichero publicado) y F16 (16 bits, paso intermedio de conversion) |
| Idiomas soportados | hindi (`hi`) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | GGML (`.bin`), consumible por whisper.cpp; tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un transformer encoder-decoder con entradas de espectrograma mel y salida de tokens de texto, que procesa audio en ventanas de 30 segundos. El autor de esta ficha no ha modificado ni la topologia ni los pesos; unicamente ha realizado la conversion de formato y la cuantizacion, siguiendo la revision `d2ec6a0cc6f6c2412391f0ddf7e50dddaa1d7a34` del modelo fuente y el commit `d09f61a` de whisper.cpp para la conversion y la release `b5130` para la cuantizacion a `q8_0`.

El entrenamiento original corresponde a Collabora, que ajusto Whisper base sobre unas 3.000 horas de voz en hindi. La model card no detalla la composicion exacta del dataset, la presencia de RLHF o DPO, ni hiperparametros de entrenamiento; toda la informacion de entrenamiento remite a la model card de `collabora/whisper-base-hindi`. Como innovacion practica, lo destacable aqui no es el modelado sino el pipeline de publicacion: conversion a GGML a 16 bits y cuantizacion posterior a 8 bits, con verificacion de integridad mediante SHA-256 (`9b33b6720f0a5ee7e979ecc63765e995ef932d9c24d259639aca32b7f005d955`).

## Capacidades

- Reconocimiento automatico de voz en hindi con salida en escritura devanagari.
- Transcripcion offline, sin envio de audio a servicios externos.
- Procesamiento de audio en segmentos de 30 segundos, con encadenamiento de segmentos en whisper.cpp para audio largo.
- Salida con marcas de tiempo (soporte estandar de whisper.cpp; el autor no reporta metricas de precision temporal).
- Ejecucion en CPU a aproximadamente ocho veces el tiempo real en la maquina de prueba del autor.
- Traduccion de hindi a ingles: capacidad presente en Whisper base multilingue, pero no confirmada ni medida en esta ficha ni en la model card; tratar como no disponible.
- Tool calling / function calling: no soportado, es un modelo exclusivamente de voz a texto.
- Capacidades de agente o razonamiento multi-paso: no aplicables.
- Vision y audio de entrada multimodal: no; unica modalidad de entrada, audio de 16 kHz.
- Idiomas distintos del hindi: no declarados.

## Casos de uso

- Dictado offline en aplicaciones de escritorio: el modelo es la base del dictado en hindi de WinShades; con 78 MB de pesos y ejecucion en CPU, se puede empaquetar dentro del propio instalador y funcionar sin conexion.
- Transcripcion de notas de voz en hindi: mensajes de aplicaciones de mensajeria o grabadoras personales se pueden transcribir localmente con un consumo de disco minimo y sin coste por minuto.
- Subtitulado de video en hindi: generacion de subtitulos con marcas de tiempo sobre contenido hablado, procesando el audio en segmentos de 30 segundos y ajustando despues el alineado.
- Analitica de centros de contacto: transcripcion por lotes de llamadas en hindi para busqueda de palabras clave, clasificacion posterior y control de calidad, con el coste de inferencia en CPU en lugar de API.
- Accesibilidad: entrada de texto por voz para usuarios que escriben en hindi, integrable en procesadores de texto o herramientas de lectura y escritura como la propia WinShades.
- Archivado y documentacion de audio: transcripcion de entrevistas, clases o archivos orales en hindi para hacerlos indexables y buscables.
- Prototipado en investigacion de ASR de bajo recurso: al estar en GGML, sirve como punto de partida barato para comparar tecnicas de cuantizacion o de ajuste fino sobre un idioma concreto sin mover modelos de cientos de millones de parametros.
- Asistentes de voz locales: combinado con un motor de sintesis y una logica de intenciones, permite construir comandos de voz en hindi sin dependencia de la nube.

## Benchmarks y rendimiento

El autor mide el error como proporcion de palabras erroneas, faltantes o anadidas sobre 25 fragmentos de voz leida en hindi extraidos del split de test del dataset FLEURS de Google:

| Modelo | Tamano | Palabras erroneas |
|---|---:|---:|
| OpenAI Whisper base (q5_1) | 57 MB | 104% (escribe el hindi en escritura urdu) |
| OpenAI Whisper large-v3-turbo (q5_0) | 547 MB | 30% |
| Este modelo, 16 bits | 141 MB | 15% |
| Este modelo, q8_0 | 78 MB | 15% |

Salvedades declaradas por el propio autor: 25 fragmentos permiten clasificar modelos de forma fiable, pero no constituyen una cifra precisa; y aunque los clips evaluados pertenecen al split de test de FLEURS, el split de entrenamiento de FLEURS formo parte de los datos de entrenamiento de Collabora. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K y similares no son aplicables a un modelo de ASR) ni resultados en otros conjuntos de evaluacion en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU. Inferencia en CPU con aproximadamente 78 MB de pesos en disco y una huella de memoria del orden de cientos de MB (el autor no especifica cifra exacta de RAM).
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU compatible con whisper.cpp (por ejemplo, una RTX 3060 o superior) reduciria la latencia, pero no es necesaria.
- Compatibilidad con GPU de consumo: cabe en cualquier equipo, incluidos portatiles sin GPU dedicada y dispositivos de gama baja, al ser un modelo de ~74 M de parametros cuantizado a 8 bits.
- Opciones de despliegue: whisper.cpp (CLI, servidor HTTP y bindings), la aplicacion WinShades y cualquier otro consumidor del formato GGML de whisper.cpp. No es compatible con vLLM, TGI, Ollama ni con el cargador de Transformers de HuggingFace, porque el unico artefacto publicado esta en GGML.
- Latencia y throughput: aproximadamente ocho veces mas rapido que el tiempo real en la maquina de prueba del autor, en CPU. No se especifican las caracteristicas de dicho equipo ni metricas de latencia por segmento.
- Almacenamiento: 0,1 GB de repositorio; el unico fichero de pesos ocupa 81.768.602 bytes.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Formato | Palabras erroneas (FLEURS, 25 clips) |
|---|---:|---|---|---|---:|
| Este modelo (q8_0) | ~74 M | hindi | CC-BY 4.0 | GGML, 78 MB | 15% |
| collabora/whisper-base-hindi | ~74 M | hindi | CC-BY 4.0 | PyTorch/safetensors (formato original) | no medido en la model card de esta ficha |
| OpenAI Whisper base (q5_1) | ~74 M | multilingue | MIT (modelo original) | GGML, 57 MB | 104% (salida en escritura urdu) |
| OpenAI Whisper large-v3-turbo (q5_0) | ~809 M | multilingue | MIT (modelo original) | GGML, 547 MB | 30% |

Las cifras de parametros de los modelos de OpenAI son datos externos a la informacion proporcionada y se incluyen solo como referencia de orden de magnitud. No se dispone de comparativas con otros ajustes de Whisper para hindi (por ejemplo, alternativas de AI4Bharat o de la comunidad) dentro de la informacion disponible, por lo que no se incluyen cifras de esas alternativas.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor. Al estar entrenado sobre unas 3.000 horas de voz en hindi, heredara los sesgos de acento, genero, registro y variedad dialectal presentes en ese corpus, que no se detalla en la informacion disponible.
- Alucinacion: Whisper es propenso a generar texto plausible en tramos de silencio, ruido o musica. No hay evaluacion especifica de este comportamiento en la model card.
- Evaluacion limitada: el 15% de palabras erroneas procede de solo 25 fragmentos de voz leida. No hay medicion sobre voz espontanea, ruido de fondo, acentos regionales ni audio telefonico (8 kHz).
- Solapamiento de datos: el split de entrenamiento de FLEURS forma parte de los datos de entrenamiento del modelo fuente, lo que puede inflar ligeramente el resultado si existiera cualquier contaminacion con el split de test.
- Idioma: solo hindi. No hay soporte declarado para otras lenguas indias ni para ingles, y la traduccion no esta confirmada.
- Contexto: la ventana nativa es de 30 segundos por segmento; el audio mas largo depende de la logica de segmentacion de whisper.cpp y puede degradar la coherencia entre fragmentos.
- Licencia: CC-BY 4.0 permite uso comercial, pero exige atribucion. La atribucion del modelo debe ir a Collabora, segun indica el autor; conviene citar tambien el trabajo de conversion.
- Madurez: el repositorio no registra descargas ni valoraciones y se actualizo el 27 de septiembre de 2026, por lo que no existe validacion independiente de la calidad del artefacto publicado.
- Compatibilidad de despliegue: al publicarse solo en GGML, no se puede cargar directamente con las librerias habituales de HuggingFace ni con servidores de inferencia como vLLM o TGI, lo que limita su integracion en pilas ya existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/winshades/whisper-base-hindi-ggml
- Modelo base de Collabora: https://huggingface.co/collabora/whisper-base-hindi
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Aplicacion WinShades: https://winshades.org
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Repositorio original de OpenAI Whisper: no disponible en la informacion proporcionada
- Paper de Whisper: no disponible en la informacion proporcionada
