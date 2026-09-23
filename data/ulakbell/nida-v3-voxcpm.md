# ulakBELL/Nida-v3-VoxCPM

## Resumen
Nida-v3-VoxCPM es un modelo de síntesis de voz (text-to-speech) en turco publicado en HuggingFace por el usuario ulakBELL, construido como un fine-tune del modelo base openbmb/VoxCPM2 de OpenBMB. El repositorio contiene pesos fusionados (merged) derivados de una adaptación LoRA de rango 64 sobre las proyecciones de atención del componente de modelo de lenguaje (LM) y del transformer de difusión (DiT) del modelo base. Genera audio mono a 48 kHz y admite clonación de voz condicionada por una grabación de referencia.

El modelo se apoya en la arquitectura tokenizer-free de VoxCPM2, orientada a generación de voz multilingüe, diseño creativo de voces y clonación. El fine-tune se realizó sobre un corpus privado de un único hablante en turco (AlicanKiraz0/TR-Voice-TTS) hasta el paso 1500 de entrenamiento, y el repositorio se publica como pesos completos ya fusionados, listos para cargar sin aplicar el adaptador original.

Su relevancia es acotada pero específica: cubre el nicho de TTS en turco con clonación de voz y salida a 48 kHz, una combinación poco frecuente en modelos abiertos, y ofrece un script de inferencia reproducible con parámetros fijados (guía libre CFG 2.0, 16 pasos de difusión, semilla 42). El interés principal está en la infraestructura de referencia y en la receta de inferencia, más que en una evaluación comparativa exhaustiva, que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS tokenizer-free; componente de modelo de lenguaje (LM) mas decodificador de difusion basado en transformer de difusion (DiT); fine-tune LoRA fusionado |
| Parametros totales | 2.290.004.544 (aprox. 2,29 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica; la generacion se controla por frases o lineas de un fichero de sentencias) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en BF16 (safetensors) |
| Idiomas soportados | turco (tr) para este fine-tune; el modelo base VoxCPM2 se presenta como multilingue (mas de 30 idiomas segun el sitio del proyecto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), pesos fusionados (merged) |
| Frecuencia de muestreo de salida | mono, 48 kHz |
| Tamano del repositorio | 5,0 GB |
| Libreria de inferencia | voxcpm |
| Modelo base | openbmb/VoxCPM2 |
| Checkpoint de origen | AlicanKiraz0/Kizagan-TTS-step_1500 (revision 458112a0fc3d850de38951796290e48ef710bc26) |
| Paso de entrenamiento | 1500 |

## Arquitectura y entrenamiento
VoxCPM2, el modelo base, se describe como un sistema de texto a voz tokenizer-free para generacion multilingue, diseno creativo de voces y clonacion realista. Segun la model card del autor, la adaptacion se realizo mediante LoRA de rango 64 y alpha 64 aplicada a las proyecciones de atencion del LM y del DiT. La inferencia emplea un esquema de difusion con 16 pasos y classifier-free guidance con valor 2.0, lo que confirma una etapa de decodificacion basada en difusion sobre representaciones acusticas. Este repositorio publica los pesos ya fusionados, de modo que no es necesario cargar el adaptador por separado.

El fine-tune se hizo sobre AlicanKiraz0/TR-Voice-TTS, un corpus privado de un unico hablante en turco, y el checkpoint liberado corresponde al paso 1500. La model card indica explicitamente que no se recuperaron el manifiesto de entrenamiento original ni el estado del optimizador durante la evaluacion, por lo que no se reclama una reproduccion independiente del entrenamiento. Tampoco se redistribuyen las grabaciones del conjunto de datos ni los ficheros de respuestas de oyentes. No se documentan en la informacion disponible el numero total de tokens de audio de entrenamiento, la composicion completa del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades
- Sintesis de voz en turco a partir de texto, con salida mono a 48 kHz en BF16.
- Clonacion de voz condicionada por referencia: acepta un WAV de referencia y genera texto nuevo condicionado a esa grabacion, sin reentrenar ni modificar los pesos.
- Clonacion solo por referencia: el script incluido utiliza unicamente el audio de referencia, sin transcripcion.
- Referencia con transcripcion: a traves de la API de VoxCPM2 (reference_wav_path + prompt_wav_path + prompt_text) heredada del modelo base.
- Generacion por sentencias: procesa un fichero de sentencias con una frase por linea, preservando el orden y reutilizando la referencia en cada linea.
- Generacion de texto largo con la misma referencia mediante el fichero de sentencias.
- Control de estilo y emocion: la model card menciona una seccion de emocion/pausas que aparece truncada en la informacion disponible; no se puede confirmar su alcance.
- Capacidades heredadas del modelo base (diseno de voz, clonacion controlable y clonacion definitiva) segun la documentacion de VoxCPM2, si bien no se validan para este fine-tune concreto.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de sintesis de voz, no un LLM de proposito general.

## Casos de uso
- Audiolibros y narracion de texto largo en turco: el flujo con fichero de sentencias permite generar parrafos largos manteniendo la misma voz de referencia en cada utterance, adecuado para convertir novelas o articulos en audio.
- Doblaje y locucion para creadores de contenido: la clonacion por referencia permite reproducir una voz concreta sobre guiones nuevos, util para videos, piezas de video corto y contenido de marca en turco.
- Asistentes de voz en turco: integrable en un pipeline de STT + LLM + TTS para dar respuestas habladas a 48 kHz con una voz coherente en conversaciones multi-turno.
- Sistemas de atencion telefonica (IVR) en turco: generacion de mensajes y respuestas pregrabadas a partir de texto, con voz consistente y sin necesidad de regrabar cada locucion.
- Accesibilidad y lectores de pantalla: conversion de documentos y contenido web a voz en turco de alta frecuencia de muestreo.
- Material formativo y e-learning: narracion de cursos, guiones y presentaciones con una voz unica, permitiendo actualizar el texto sin volver a grabar.
- Prototipado de productos de voz: generacion rapida de muestras de audio para pruebas de UX o demos internas antes de invertir en locucion profesional.
- Investigacion en TTS y clonacion: el repositorio incluye receta de inferencia y comandos ejecutables, lo que facilita reproducir la generacion y comparar variantes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS, WER, similitud de hablante o comparaciones con otros sistemas. Los unicos datos de rendimiento documentados son de validacion funcional:

| Prueba | Resultado | Fecha |
|---|---|---|
| Smoke test en CUDA (dos utterances) | 3,36 segundos de audio a 48 kHz, sin fallo por limite de longitud | 7 de septiembre de 2026 |
| Evaluacion de escucha | mencionada en la model card, pero con resultados no detallados en la informacion disponible | no disponible |

El script de inferencia fija CFG 2.0, 16 pasos de difusion y semilla 42, desactiva compilacion, denoising y reintentos automaticos, y concatena el PCM generado sin anadir silencio, recortar, aplicar crossfade ni cambiar la velocidad.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 4,6 GB (2,29 mil millones de parametros x 2 bytes). Sumando activaciones y el bucle de difusion de 16 pasos, una estimacion razonable es de 8 a 12 GB de VRAM para inferencia en BF16; se trata de una estimacion derivada del tamano, no de un dato publicado.
- GPU recomendadas: el autor documenta un entorno Linux con GPU NVIDIA CUDA y Python 3.12, con ruedas de PyTorch CUDA 13.0. Para uso en servidor se pueden emplear A100 o H100; para estaciones de trabajo, tarjetas de gama alta con suficiente VRAM.
- GPU de consumo: con la estimacion de 8 a 12 GB, es probable que quepa en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090), siempre que se disponga de drivers CUDA compatibles. No hay confirmacion oficial de funcionamiento en estas tarjetas en la informacion disponible.
- Opciones de despliegue: la libreria oficial es voxcpm, instalada desde el repositorio de OpenBMB en la revision f772e498a45fbb5fb8e13fbf9b9c48be9fe33e69, junto con huggingface_hub 1.30.0. El repositorio incluye inference.py como script de linea de comandos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no ser un LLM de texto no son aplicables directamente.
- Latencia y throughput: no disponible. Solo se conoce que el smoke test genero 3,36 segundos de audio en una GPU CUDA no especificada; no se publican tiempos de ejecucion ni factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nida-v3-VoxCPM (este modelo) | 2,29 mil millones | no disponible | sin benchmarks publicados; smoke test de 3,36 s de audio a 48 kHz | apache-2.0 | HuggingFace, pesos safetensors BF16 |
| openbmb/VoxCPM2 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace y demo en Space |
| Otros modelos TTS en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar este modelo con alternativas de la misma categoria mas alla de su modelo base. Cualquier comparacion cuantitativa requeriria benchmarks propios.

## Limitaciones y advertencias
- Discrepancia de nombres: el repositorio se llama Nida-v3-VoxCPM y pertenece a ulakBELL, pero la model card describe un modelo denominado Kizagan-TTS-v1.0 atribuido a Alican Kiraz y enlaza el checkpoint AlicanKiraz0/Kizagan-TTS-step_1500. Conviene verificar la procedencia real de los pesos antes de usarlos en produccion.
- Evaluacion limitada: la model card reconoce que el fine-tune se hizo sobre un unico hablante turco y que la evaluacion de escucha uso ese mismo hablante, por lo que no se establece similitud de clonacion para hablantes, acentos o idiomas desconocidos.
- Clonacion de voces ajenas: la API acepta la grabacion de otro hablante, pero la similitud, la adherencia al estilo y la inteligibilidad deben comprobarse auditivamente con esa grabacion. No hay garantias documentadas.
- Idiomas: el fine-tune esta etiquetado unicamente como turco (tr). No hay evidencia de que conserve el soporte multilingue del modelo base para otras lenguas.
- Puntuacion y normalizacion: el script no resuelve automaticamente abreviaturas, numeros ni fronteras de frase ambiguas en turco. Los numeros deben escribirse tal y como deben pronunciarse y cada linea debe ser una utterance natural.
- Texto largo: la opcion --text realiza una unica llamada y no divide automaticamente un parrafo; para respuestas largas hay que usar el fichero de sentencias y preparar los limites manualmente.
- Riesgo de alucinacion acustica: como en cualquier sistema de sintesis, pueden aparecer artefactos, prosodia incorrecta o pronunciaciones erroneas, especialmente con texto fuera del dominio de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgos. Al entrenarse con un corpus de un solo hablante, la voz resultante refleja las caracteristicas de ese hablante y puede no ser representativa.
- Trazabilidad incompleta: no se recuperaron el manifiesto de entrada de entrenamiento ni el estado del optimizador, y no se redistribuyen los datos de audio ni los ficheros de respuesta de oyentes. No se reclama una reproduccion independiente del entrenamiento.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base VoxCPM2 y del corpus de entrenamiento, cuyo acceso era privado.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ulakBELL/Nida-v3-VoxCPM
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Checkpoint de fine-tune: https://huggingface.co/AlicanKiraz0/Kizagan-TTS-step_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/AlicanKiraz0/TR-Voice-TTS
- Repositorio de codigo VoxCPM (OpenBMB): https://github.com/OpenBMB/VoxCPM/
- Sitio del proyecto VoxCPM: https://voxcpm.com/en/
- Sitio de VoxCPM2: https://voxcpm2.org/
- Demo en HuggingFace Space: https://huggingface.co/spaces/openbmb/VoxCPM-Demo
- Identificadores arXiv referenciados en las etiquetas del modelo: arxiv:2606.06928 y arxiv:2509.24650 (contenido no disponible en la informacion proporcionada)
