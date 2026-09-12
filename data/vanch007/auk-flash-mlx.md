# vanch007/AuK-Flash-MLX

## Resumen

AuK-Flash-MLX es un port nativo para Apple Silicon, mediante MLX, de AuK-Flash, el modelo fundacional de voz de 1,5B parametros desarrollado por Tencent Hunyuan. Se distribuye como un modelo de texto a voz (text-to-speech) orientado a generacion ultrarrápida y a la edicion zero-shot de voz y de letras cantadas, con soporte de los idiomas chino e ingles y salida de audio mono a 24 kHz. El repositorio lo publica el usuario vanch007 bajo licencia MIT.

La relevancia de esta version concreta es de ingenieria: traslada el pipeline original de PyTorch a MLX para ejecutarse de forma nativa sobre la GPU unificada de los chips Apple. Segun los datos de la model card, la latencia del bloque DiT de 4 pasos para 10 segundos de audio baja de 3,820 s en PyTorch MPS a 0,992 s en MLX, lo que equivale a un factor de tiempo real (RTF) de 0,0992 (unas 10,08 veces mas rapido que el tiempo real). Ademas se ofrece una variante cuantizada a 8 bits que reduce la memoria del backbone de 5,70 GB a 0,56 GB.

La arquitectura combina 10 bloques MMDiT de doble flujo con 20 bloques DiT de flujo unico, un VAE causal BigVGAN-Flow y un componente de texto Qwen2.5-Omni Thinker, y la inferencia emplea flow matching destilado en 4 pasos con CFG fijado a 0,0. El repositorio ocupa 6,8 GB e incluye los pesos de precision completa del backbone y del VAE. El modelo base pertenece a Tencent Hunyuan, mientras que este port y su demo web corresponden al autor del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 10 bloques MMDiT de doble flujo + 20 bloques DiT de flujo unico + VAE causal BigVGAN-Flow + Qwen2.5-Omni Thinker |
| Parametros totales | 1,5B (dato indicado en la model card para el modelo base AuK-Flash) |
| Parametros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | precision completa (MLX) y 8 bits (repositorio aparte: vanch007/AuK-Flash-MLX-8bit) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | pesos MLX nativos; el repositorio incluye el backbone Flux2Edit (5,7 GB) y el BigVGAN Flow VAE (608 MB). No se confirma el contenedor exacto (safetensors u otro) ni soporte GGUF |
| Modo de inferencia | flow matching destilado en 4 pasos (DMD) con CFG fijo a 0,0 |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Tarea declarada (pipeline) | text-to-speech |
| Tamano del repositorio | 6,8 GB |

## Arquitectura y entrenamiento

La informacion disponible describe la topologia del modelo, pero no los datos de entrenamiento. La parte generativa se organiza en dos etapas: un transformer de difusion con 10 bloques MMDiT de doble flujo seguidos de 20 bloques DiT de flujo unico, que actua como backbone de edicion (denominado Flux2Edit en el repositorio), y un VAE de flujo causal basado en BigVGAN que convierte las representaciones latentes en audio mono a 24 kHz. La rama de comprension de texto se apoya en un Thinker de Qwen2.5-Omni, que actua como condicionamiento de texto para el pipeline de sintesis y edicion.

La innovacion practica de este port es doble. Por un lado, la inferencia usa flow matching destilado (DMD) en solo 4 pasos con CFG fijado a 0,0, lo que elimina el coste de las pasadas de clasificador libre y reduce drasticamente el numero de evaluaciones del DiT. Por otro lado, la implementacion nativa en MLX evita la capa de traduccion a MPS de PyTorch y aprovecha la memoria unificada de Apple Silicon, con una variante cuantizada a 8 bits que rebaja el peso del backbone en un 90,1 %. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) de alta fidelidad a 24 kHz mono, con generacion ultrarrápida gracias al muestreo destilado en 4 pasos.
- Edicion de voz zero-shot: modificacion de segmentos de audio hablado sin reentrenamiento.
- Edicion de letras cantadas (lyric editing) en modo zero-shot, segun la descripcion del autor.
- Soporte bilingue chino-ingles, tanto en la entrada de texto como en la generacion.
- Inferencia nativa en Apple Silicon mediante MLX, con una variante cuantizada a 8 bits optimizada para memoria.
- Demo web interactiva de comparacion A/B disponible en el repositorio de GitHub asociado.
- Tool calling / function calling: no disponible (el modelo no es un modelo de lenguaje de proposito general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio de entrada o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz locales en macOS e iOS: al ejecutarse de forma nativa sobre MLX, el modelo permite sintetizar respuestas sin enviar audio a servicios en la nube, con un RTF de 0,0992 que hace viable la conversacion fluida en el propio dispositivo.
- Edicion de locuciones para podcast: la capacidad de edicion zero-shot permite corregir o sustituir fragmentos de una toma sin regrabar la sesion completa, manteniendo la identidad vocal del hablante original.
- Produccion musical y edicion de letras: el soporte declarado de lyric editing permite modificar lineas cantadas dentro de una mezcla, util en maquetas y versiones alternativas.
- Doblaje y localizacion chino-ingles: al cubrir ambos idiomas, encaja en flujos de localizacion de contenido donde hay que generar o ajustar pistas de voz en las dos lenguas.
- Audiolibros y accesibilidad: generacion de narraciones completas a partir de texto, con la ventaja de que el coste por minuto de audio es bajo por el factor de tiempo real de aproximadamente 10x.
- Prototipado offline de interfaces de voz: desarrolladores que trabajan en Mac pueden iterar sobre prompts y voces sin depender de GPU dedicada ni de conexion de red.
- Generacion de datos sinteticos de audio: produccion de clips de habla etiquetados para entrenar o evaluar otros sistemas, con la ventaja de que el modelo se ejecuta en local.
- Integracion en aplicaciones de escritorio con presupuesto de memoria ajustado: la variante de 8 bits reduce el backbone a 0,56 GB, lo que permite desplegar el modelo en equipos con memoria unificada limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable en un modelo de sintesis de voz. Si se incluyen metricas de latencia y memoria comparando la implementacion original en PyTorch MPS con este port en MLX, medidas sobre 10 segundos de audio y 4 pasos de DiT:

| Metrica | PyTorch MPS | MLX nativo | MLX cuantizado a 8 bits |
|---|---|---|---|
| Latencia DiT de 4 pasos (audio de 10 s) | 3,820 s | 0,992 s (3,85x mas rapido) | 1,022 s |
| Factor de tiempo real (RTF) | 0,3820 | 0,0992 (10,08x tiempo real) | 0,1022 (9,79x tiempo real) |
| Memoria del backbone | 5,70 GB | 5,70 GB | 0,56 GB (ahorro del 90,1 %) |

No se especifica en la informacion disponible sobre que chip de Apple Silicon se tomaron estas medidas, ni el hardware concreto utilizado en la comparativa con PyTorch MPS.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). El modelo no esta pensado para GPU NVIDIA o AMD con CUDA ni para CPU generica en este formato.
- VRAM o memoria unificada estimada: el backbone en precision completa ocupa 5,70 GB y el VAE 608 MB, lo que suma aproximadamente 6,3 GB solo en pesos; conviene reservar margen adicional para activaciones y buffers de audio.
- Variante de 8 bits: el backbone baja a 0,56 GB, de modo que el conjunto de pesos queda muy por debajo de 1,5 GB y resulta viable en equipos con memoria unificada reducida.
- GPU recomendadas: no aplica. El equivalente es el chip Apple (series M) con memoria unificada suficiente; los 16 GB o mas son la opcion comoda para precision completa, mientras que la version de 8 bits puede funcionar en configuraciones de 8 GB.
- Latencia: 0,992 s para generar 10 segundos de audio con la version MLX de precision completa, y 1,022 s con la de 8 bits, segun los datos de la model card.
- Throughput: RTF de 0,0992 en MLX nativo y 0,1022 en 8 bits, es decir, aproximadamente 10 veces mas rapido que el tiempo real en ambos casos.
- Opciones de despliegue: MLX como runtime principal, con API de Python descrita en el repositorio de GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este formato de pesos.

## Comparativa con modelos similares

En la informacion proporcionada no hay datos de otros modelos de sintesis de voz comparables (parametros, contexto, rendimiento o licencia), por lo que no es posible establecer una comparativa externa fiable. Lo que si se puede comparar son las tres variantes cubiertas por los datos disponibles:

| Variante | Parametros | Latencia DiT (10 s de audio) | RTF | Memoria del backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AuK-Flash original (PyTorch, MPS) | 1,5B | 3,820 s | 0,3820 | 5,70 GB | no disponible en esta informacion | proyecto Tencent-Hunyuan/AuK |
| AuK-Flash-MLX (este modelo) | 1,5B | 0,992 s | 0,0992 | 5,70 GB | MIT | HuggingFace: vanch007/AuK-Flash-MLX |
| AuK-Flash-MLX 8 bits | 1,5B | 1,022 s | 0,1022 | 0,56 GB | MIT | HuggingFace: vanch007/AuK-Flash-MLX-8bit |

## Limitaciones y advertencias

- Cobertura idiomatica limitada: solo chino e ingles. No hay soporte declarado de castellano ni de otras lenguas, por lo que no es adecuado para aplicaciones en espanol sin un paso adicional de adaptacion.
- Dependencia de plataforma: al ser un port MLX, queda restringido a hardware Apple Silicon. No se puede desplegar en servidores con GPU NVIDIA, que es el entorno habitual de produccion a gran escala.
- Sin datos de entrenamiento publicados: no se detalla el corpus, el numero de tokens ni si hubo fases de alineacion (RLHF/DPO), lo que dificulta evaluar sesgos o cobertura de acentos y registros.
- Riesgo de alucinacion en audio: como modelo generativo, puede producir prosodia, pronunciacion o contenido vocal no presente en la referencia, especialmente en edicion zero-shot sobre habla o canto.
- Ausencia de benchmarks academicos: no hay evaluaciones objetivas de calidad de audio (MOS, WER, similitud de hablante) en la informacion disponible, por lo que la validacion debe hacerse de forma local.
- Metricas de latencia sin hardware especificado: los tiempos comparados con PyTorch MPS no indican el chip Apple utilizado, de modo que los valores pueden no reproducirse exactamente en otro equipo.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion el mismo dia (12 de septiembre de 2026). Conviene tratarlo como proyecto reciente y poco validado por la comunidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero se aplica al port; conviene verificar por separado las condiciones del modelo base de Tencent Hunyuan y de los componentes derivados (Qwen2.5-Omni, BigVGAN-Flow) antes de un despliegue comercial.
- Madurez del ecosistema: no hay integraciones con servidores de inferencia estandar ni formatos GGUF, lo que limita las opciones de escalado horizontal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vanch007/AuK-Flash-MLX
- Pesos MLX cuantizados a 8 bits: https://huggingface.co/vanch007/AuK-Flash-MLX-8bit
- Repositorio GitHub del port y demo web: https://github.com/vanch007/mlx-AuK
- Proyecto original de Tencent Hunyuan: https://github.com/Tencent-Hunyuan/AuK

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo; los enlaces anteriores son los unicos relevantes disponibles en la informacion proporcionada.
