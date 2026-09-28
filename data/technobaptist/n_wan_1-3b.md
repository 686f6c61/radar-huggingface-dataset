# TechnoBaptist/N_Wan_1.3b

## Resumen

N_Wan_1.3b es un ajuste fino (fine-tune) del modelo de generacion de video a partir de texto Wan-AI/Wan2.1-T2V-1.3B, especializado en contenido explicito para adultos. Lo publica el usuario TechnoBaptist en HuggingFace y su unica finalidad declarada es servir como herramienta de investigacion y creacion dentro del dominio NSFW. El modelo conserva la arquitectura transformer de difusion del modelo base y sus 1.300 millones de parametros, y anade coherencia temporal nativa sin necesidad de LoRAs auxiliares segun su autor.

El problema que aborda es la escasez de modelos abiertos capaces de generar video con movimiento coherente en tematicas adultas sin recurrir a post-procesado o LoRAs externos. Para ello, el autor entreno en dos fases: primero sobre un corpus de imagenes y despues sobre video, usando como fuente los 1.000 posts mas populares de aproximadamente 1.250 subreddits NSFW. Ese planteamiento inicial produjo degradacion severa de calidad (anatomias deformes, artefactos tipo "body horror") a partir de la tercera epoca, por lo que se diseno un segundo procedimiento de entrenamiento con dataset mixto de 30.000 clips de video y 20.000 imagenes fijas simultaneamente.

Es relevante ahora por dos motivos: demuestra que un modelo de 1,3B puede generar video tematicamente complejo en hardware de consumo, y documenta con detalle un caso de olvido catastrofico (catastrophic forgetting) provocado por un entrenamiento por fases demasiado agresivo, con una solucion reproducible. La serie experimental recomendada por el autor es `wan_1.3B_exp_e14.safetensors`, que sustituye a la serie legacy `e1`-`e20`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para texto-a-video (heredada de Wan2.1) |
| Parametros totales | 1.300 millones (1,3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de video; no es un LLM) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan FP8, GGUF ni INT) |
| Idiomas soportados | no disponible; los prompts documentados son en ingles por las convenciones de etiquetado de Reddit |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |
| Tipo de tarea | Text-to-video (T2V) |
| Resolucion | 480p (segun las especificaciones del modelo base Wan2.1-T2V-1.3B) |
| Tamano del repositorio | 105,4 GB (acumula checkpoints de las series experimental y legacy) |
| Checkpoint recomendado | `wan_1.3B_exp_e14.safetensors` |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Arquitectura transformer de difusion para generacion de video condicionada por texto, la misma familia que el modelo base Wan2.1-T2V-1.3B, que segun su documentacion produce video a 480p a partir de prompts textuales. La model card de este fine-tune solo declara "Text-to-Video Transformer Architecture" y 1,3B de parametros, sin detallar el numero de bloques, el esquema de atencion ni el encoder de texto empleado. No hay informacion disponible sobre la composicion exacta del pipeline (encoder de texto, VAE, scheduler).

El entrenamiento se ejecuto en dos procedimientos distintos. El original, ya desaconsejado por el autor, separaba una fase de imagenes (epocas 1-10, con fuerte ajuste estetico pero poca capacidad de movimiento nativa) y una fase posterior de video (epocas 11-20). El ajuste agresivo de la primera fase provoco olvido catastrofico: se perdio la comprension de anatomia coherente (caras, manos) y la segunda fase no pudo recuperarla. El procedimiento revisado entrena en una unica pasada sobre un dataset mixto de 30.000 clips de video y 20.000 imagenes fijas, con ratio de aprendizaje mas conservador, lotes mas pequenos y calendario mas corto, lo que actua como regularizacion espacial constante y evita la deriva anatomica. Los datos de origen son los 1.000 posts mas populares de unas 1.250 comunidades NSFW, con captions redactados segun las convenciones de etiquetado de esas comunidades; el repositorio incluye un `prompting-guide.json` con el analisis de palabras clave y lenguaje descriptivo asociado a cada estilo. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con movimiento coherente nativo, sin necesidad de LoRAs de ayuda segun el autor.
- Especializacion en contenido explicito para adultos, entrenado sobre miles de comunidades distintas para cubrir un espectro amplio de temas, estilos visuales, arquetipos de personaje y acciones.
- Base para entrenamiento de LoRAs personales: el autor recomienda explicitamente el checkpoint `exp_e14` para ese fin.
- Comprension de lenguaje descriptivo con convenciones de etiquetado propias de foros (tags, jerga y terminos especificos recogidos en `prompting-guide.json`).
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de herramientas.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision de entrada, audio, imagen-a-video ni edicion de video.
- Capacidades multilingues: no disponibles; la documentacion solo describe prompts en ingles.

## Casos de uso

- Investigacion en generacion de contenido adulto sintetico: el modelo permite estudiar como un transformer de difusion de 1,3B representa anatomia humana y movimiento en escenarios explicitos, con checkpoints intermedios (`exp_e1` a `exp_e14`) que permiten analizar la evolucion de la calidad epoca a epoca.
- Estudio de olvido catastrofico en fine-tuning de difusion: la model card documenta un caso real de degradacion por entrenamiento por fases y su correccion mediante dataset mixto, lo que convierte al repositorio en material de analisis para quien investigue estabilidad de fine-tuning.
- Entrenamiento de LoRAs de estilo o personaje: el autor recomienda `wan_1.3B_exp_e14.safetensors` como base para LoRA training, de modo que un desarrollador puede extender el modelo sin partir de los checkpoints degradados.
- Generacion de datos sinteticos para clasificadores de moderacion: los clips generados pueden emplearse como conjunto de prueba para entrenar o evaluar detectores de contenido explicito y validar su tasa de falsos positivos y negativos.
- Red-teaming de filtros de seguridad: al ser un modelo abierto y sin censura, permite comprobar si los clasificadores y las politicas de una plataforma aguantan prompts adversarios construidos con la jerga recogida en `prompting-guide.json`.
- Prototipado local de pipelines T2V: con 1,3B de parametros, permite montar y depurar infraestructura de inferencia de video (carga de safetensors, gestion de VRAM, batching de frames) en una estacion de trabajo con GPU de consumo, antes de escalar a modelos de mayor tamano.
- Analisis de sesgos de representacion: el corpus de origen (1.000 posts de unas 1.250 subreddits) permite auditar que arquetipos corporales, etnias, edades aparentes y practicas quedan sobrerrepresentados o ausentes en las salidas.
- Herramientas creativas para produccion de contenido para adultos con cumplimiento legal: estudio pequenos que ya operan en el sector pueden integrarlo en un flujo interno con verificacion de edad, control de acceso y trazabilidad, siempre que la licencia y la normativa aplicable lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo base Wan2.1-T2V-1.3B menciona la evaluacion con el framework Wan-Bench, pero las cifras concretas no se incluyen en la informacion proporcionada. Este fine-tune no publica ninguna tabla de evaluacion, ni cuantitativa ni cualitativa, mas alla de la descripcion de la mejora percibida entre la serie legacy y la experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia derivada del tamano, los pesos en fp16 de 1,3B ocupan aproximadamente 2,6 GB, a lo que hay que sumar el encoder de texto, el VAE y las activaciones del proceso de difusion; una estimacion razonable de trabajo se situa en la franja de 8 a 12 GB en fp16. Verificar contra la documentacion oficial del modelo base antes de aprovisionar.
- GPU recomendadas: no disponibles para este fine-tune. Para el modelo base se suele emplear hardware de gama alta de consumo (RTX 4090 y equivalentes); modelos de 14B de la misma familia, como Wan2.1-T2V-14B, requieren GPUs de centro de datos tipo A100 o H100.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 1,3B y la resolucion de 480p del modelo base, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: no se documenta soporte especifico para este fine-tune. Las vias habituales del ecosistema Wan2.1 son Diffusers, ComfyUI y el repositorio oficial Wan-Video/Wan2.1. Ollama, llama.cpp, vLLM y TGI estan orientados a modelos de lenguaje y no aplican a un modelo de difusion de video.
- Latencia y throughput estimados: no disponibles. No se publican tiempos por clip, fps de generacion ni consumo energetico.
- Almacenamiento: el repositorio completo ocupa 105,4 GB, aunque la descarga de un unico checkpoint (25,8 GB) es mucho menor.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / resolucion | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| TechnoBaptist/N_Wan_1.3b | 1,3B | T2V, 480p (segun modelo base) | CreativeML OpenRAIL-M | NSFW explicito | 0 descargas, 0 likes |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3B | T2V, 480p | no figura en la informacion proporcionada | Generalista, con censura | Modelo base, ampliamente distribuido |
| Wan-AI/Wan2.1-T2V-14B | 14B (segun nomenclatura del repositorio) | T2V | no figura en la informacion proporcionada | Generalista, con censura | Referenciado en el ecosistema Wan2.1 |

Existen otras alternativas abiertas de texto-a-video de tamano pequeno (por ejemplo CogVideoX, LTX-Video o HunyuanVideo), pero no se dispone en la informacion proporcionada de sus parametros, contexto, licencia ni resultados, por lo que no se incluyen cifras que no puedan verificarse. La diferencia funcional mas relevante de este modelo frente al base es la ausencia de censura y la especializacion tematica, a cambio de una licencia mas restrictiva (OpenRAIL-M en lugar de la licencia del modelo original) y de una comunidad de usuarios inexistente.

## Limitaciones y advertencias

- Contenido explicito para adultos: el modelo genera material NSFW de forma nativa. Su uso exige verificacion de edad, control de acceso y cumplimiento de la normativa aplicable en la jurisdiccion del usuario.
- Licencia CreativeML OpenRAIL-M: incluye clausulas de uso prohibido y obligaciones de propagacion de esas restricciones a obras derivadas. No es una licencia permisiva al estilo Apache o MIT, por lo que conviene revisarla con detalle antes de cualquier uso comercial.
- Calidad: la propia model card reconoce artefactos graves ("body horror", degradacion anatomica, glitches) en la serie legacy `e1`-`e20`. Solo la serie experimental corrige parcialmente el problema, y el autor pide retroalimentacion porque la consideraba pendiente de validacion.
- No hay validacion externa: el repositorio registra 0 descargas y 0 likes, sin evaluaciones independientes ni resultados de benchmarks que respalden las afirmaciones de calidad.
- Sesgo de dominio: el entrenamiento se basa en los posts mas populares de comunidades de Reddit, lo que arrastra los sesgos de representacion, estetica, encuadre y practicas de esas comunidades hacia las salidas del modelo.
- Idiomas: no hay evidencia de soporte multilingue; los captions y la guia de prompting estan construidos sobre convenciones de etiquetado en ingles.
- Prompts: el rendimiento depende en gran medida de emplear la jerga y las etiquetas documentadas en `prompting-guide.json`; prompts fuera de esa distribucion pueden degradar la coherencia del resultado.
- Resolucion y duracion limitadas: al heredar el modelo base de 1,3B, el resultado se situa en torno a 480p y clips cortos, insuficiente para produccion de alta resolucion sin post-procesado.
- Riesgo legal sobre el dataset: el corpus proviene de contenido publicado por terceros en Reddit, lo que plantea dudas sobre derechos de imagen, consentimiento de las personas retratadas y reutilizacion de material ajeno.
- Contexto de despliegue: integrarlo en plataformas publicas puede infringir las politicas de contenido de proveedores de cloud y de HuggingFace, que marcan el repositorio como `not-for-all-audiences`.
- Trazabilidad: el repositorio no documenta el numero exacto de pasos de entrenamiento, la composicion final por epoca ni las metricas de la perdida, lo que dificulta reproducir el entrenamiento.
- Marcas de tiempo anomalas: las fechas de creacion y actualizacion del repositorio (27 de septiembre de 2026) no permiten reconstruir un historial de versiones fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/N_Wan_1.3b
- Modelo base Wan-AI/Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- README del modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B/blob/main/README.md
- Repositorio oficial Wan2.1: https://github.com/Wan-Video/Wan2.1
- Ficha del modelo base en ModelScope: http://www.modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
- Plataforma Wan AI: https://wan.video/
- Analisis de terceros sobre Wan2.1-T2V-1.3B: https://www.aimodels.fyi/models/huggingFace/wan2.1-t2v-1.3b-wan-ai
