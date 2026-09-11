# thomaseibner/whisper-large-v3-turbo-us-atc-v2

## Resumen

`thomaseibner/whisper-large-v3-turbo-us-atc-v2` es un adaptador LoRA de 13 MB que ajusta el modelo `openai/whisper-large-v3-turbo` de OpenAI para el reconocimiento de voz en radiotelefonia de control de trafico aereo (ATC) estadounidense. No se trata de un modelo completo: los pesos base de Whisper turbo (~1,6 GB en fp16) se descargan por separado desde Hugging Face y el adaptador se aplica encima mediante la libreria PEFT. El autor es `thomaseibner` y la licencia declarada es MIT.

El problema que resuelve es concreto y esta cuantificado: el Whisper turbo original obtiene un 56,2 % de word error rate (WER) sobre audio de radio aeronautico, un registro acustico muy degradado (AM de 8 kHz, banda estrecha, ruido, solapamientos y fraseologia muy densa en identificadores). Con el adaptador, el WER baja al 32,3 % y el recall de identificadores (digitos de callsign, nombres de aerolineas, lado de pista) sube del 52,8 % al 82,8 % sobre 156 clips retenidos. Es relevante porque los tokens criticos para asociar una transmision a una aeronave no son los que domina el WER en clips cortos, de modo que una mejora de recall como esta tiene impacto directo en aplicaciones de seguimiento y seguridad.

Arquitecturalmente hereda todo del modelo base: encoder-decoder transformer con ventanas de 30 segundos y entrenamiento multitarea sobre audio de 16 kHz. El adaptador solo modifica un subconjunto de pesos del decodificador y del encoder mediante LoRA, con un coste de almacenamiento de dos ordenes de magnitud inferior al del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (heredada de `openai/whisper-large-v3-turbo`); el adaptador es un LoRA aplicado sobre esa base |
| Parametros totales | No disponible para el adaptador (fichero de 13 MB; estimacion aproximada de 6,5 M de parametros si esta en fp16). El modelo base `whisper-large-v3-turbo` es de ~809 M de parametros segun la documentacion publica de OpenAI, dato no incluido en la model card del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (Whisper procesa el audio en bloques de 30 segundos). Se recomienda dividir las grabaciones largas en transmisiones individuales |
| Tipos de cuantizacion | fp32 y fp16 soportados para inferencia (fp16 es el usado en produccion por el autor). int8 desaconsejado explicitamente. bf16 en inferencia: no probado; bf16 en entrenamiento genero bucles de repeticion |
| Idiomas soportados | Ingles (`en`) unicamente; se debe forzar `language="en"` |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga en los formatos habituales de Hugging Face, ~1,6 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar de PEFT sobre `openai/whisper-large-v3-turbo`, un modelo encoder-decoder de tipo transformer para reconocimiento automatico de habla. De la model card se deduce que el ajuste se hizo sobre pares (audio de radio, transcripcion humana) con un pipeline de audio fijo: audio AM de airband a 8 kHz remuestreado a 16 kHz mono, filtro paso-banda de orden 6 entre 300 y 3400 Hz y normalizacion de sonoridad EBU R128 a -16 LUFS. Esta cadena se aplica por defecto en el script de inferencia incluido (`--no-radio-filter` la desactiva).

No se especifican en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion exacta del dataset, el numero de horas ni si hubo etapas de RLHF o DPO. Si se documenta que el conjunto de evaluacion (156 clips, de dias completamente retenidos fuera del entrenamiento) sobremuestrea deliberadamente los casos dificiles, y que el entrenamiento se hizo sin `initial_prompt`: el autor probo prompts de fraseologia ATC y un prompt con la lista de callsigns del area, y ambos empeoraron los resultados (el prompt estatico costo 16,7 puntos de WER sobre Whisper original; el prompt con callsigns subio los bucles de repeticion del 1,7 % al 13,3 % de los clips sin recuperar ninguno de esos identificadores). Tambien se indica que durante el entrenamiento los pesos en bf16 provocaron bucles de repeticion.

## Capacidades

- Transcripcion de audio de radiotelefonia ATC estadounidense, con un WER del 32,3 % en el conjunto de evaluacion retenido (frente al 56,2 % del modelo base).
- Reconocimiento de identificadores criticos: grupos de digitos de callsign, nombres de aerolineas, lado de pista (left/right/center) y categoria de estela (heavy/super), con un recall del 82,8 % frente al 52,8 % del base.
- Normalizacion de la salida orientada a la jerga aeronautica: `30L` se transcribe como `30 left`, `FL380` como `flight level 380` y los codigos ICAO de aerolinea se expanden a nombres hablados.
- Formato numerico en digitos agrupados tal como se pronuncian (por ejemplo, `Delta 2261`, `flight level 380`, `12 right`).
- Deteccion de bucles de repeticion integrada en el script de inferencia (regla: 8 palabras o mas y, o bien una racha de 5 palabras identicas, o bien menos del 40 % de palabras unicas), para descartar salidas degeneradas en silencios o estatica.
- Inferencia sobre una unica transmision de radio por fichero, segmentada en el squelch o mediante un detector de actividad de voz.
- Ejecucion en CUDA, Apple MPS o CPU, seleccion automatica de dispositivo con posibilidad de forzarlo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento. No es multilingue: solo ingles.

## Casos de uso

- Transcripcion en tiempo real de frecuencias ATC: el adaptador reduce el WER en un 42 % relativo sobre el modelo base, lo que permite alimentar pantallas de subtitulado para controladores o sistemas de monitorizacion pasiva con menos correcciones manuales.
- Extraccion de callsigns para correlacion con datos de vigilancia: con un recall de identificadores del 82,8 %, resulta viable emparejar automaticamente una transmision con una aeronave concreta en un radar o en un feed ADS-B, tarea que con el 52,8 % del modelo base quedaba fuera de rango operativo.
- Analisis post-vuelo y reconstruccion de trafico: transcribir la grabacion completa de una frecuencia dividiendola en transmisiones y reconstruir la secuencia de instrucciones e lecturas de vuelta para auditoria interna.
- Investigacion de incidentes y seguridad operacional: generar transcripciones con alta fidelidad en identificadores (niveles de vuelo, lados de pista, categorias de estela) para alimentar informes de suceso, donde un error en un digito cambia por completo la interpretacion.
- Etiquetado de corpus ATC para entrenar otros sistemas: usar el adaptador como anotador automatico con revision humana, aprovechando su mejor comportamiento en los clips que el pipeline anterior marcaba como baja confianza o fallidos (WER del 92,9 % al 39,3 % en el subconjunto "fail").
- Entrenamiento y certificacion de controladores: reproducir ejercicios de simulador con transcripcion automatica de las comunicaciones para evaluar el uso de fraseologia estandar y la precision en la lectura de instrucciones.
- Control de calidad de pipelines ASR existentes: comparar la salida del adaptador con la de un sistema en produccion sobre los clips de baja confianza para detectar degradaciones sistematicas.
- Monitorizacion de cumplimiento de lectura de vuelta (readback): detectar automaticamente discrepancias entre la instruccion emitida y la lectura del piloto en los elementos que el modelo reconoce mejor (digitos, niveles, pistas).

## Benchmarks y rendimiento

Resultados sobre 156 clips de dias retenidos por completo fuera del entrenamiento, evaluados contra transcripciones humanas:

| Sistema | Word error rate | Recall de identificadores |
|---|---|---|
| `whisper-large-v3-turbo` original | 56,2 % | 52,8 % |
| Con este adaptador | 32,3 % | 82,8 % |

Desglose por subconjunto del conjunto de evaluacion:

| Subconjunto | Clips | Contenido | WER base | WER con adaptador |
|---|---|---|---|---|
| control | 63 | Clips que el pipeline anterior manejaba bien | 41,9 % | 24,6 % |
| hard | 68 | Transcripcion previa de baja confianza o sin callsign extraible | 60,8 % | 38,0 % |
| fail | 25 | El pipeline anterior devolvia 10 caracteres o menos | 92,9 % | 39,3 % |

Definiciones usadas por el autor: el WER es distancia de edicion a nivel de palabra tras normalizar ambos lados (minusculas, puntuacion eliminada salvo puntos decimales, `30L` -> `30 left`, `FL380` -> `flight level 380`, codigos ICAO de aerolinea -> nombres hablados). El recall de identificadores es la proporcion de identificadores de la referencia que aparecen en la transcripcion, contados como bolsa (sin importar el orden): grupos de digitos, nombres de aerolineas, lado de pista y categoria de estela. No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K (no aplicables a un modelo ASR), ni comparaciones con otros sistemas ASR sobre este mismo conjunto.

## Requisitos de hardware

- Tamano del adaptador: 13 MB. Tamano de los pesos base: ~1,6 GB (Whisper large-v3-turbo).
- VRAM estimada para inferencia: aproximadamente 4 GB en fp16 contando pesos, features de entrada y cache del decodificador (estimacion a partir del tamano del modelo base en fp16; el autor no publica cifras de VRAM). En fp32 la huella se duplica.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). El autor usa fp16 en produccion.
- GPU de datacenter (A100, H100, L40S) no son necesarias para una sola instancia; solo tendrian sentido para servir muchas transmisiones en paralelo.
- Tambien funciona en CPU y en Apple MPS, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: `transformers` + `peft` con `PeftModel.from_pretrained(...).merge_and_unload()` es la via documentada, con un script de inferencia incluido en el repositorio (`transcribe.py`, requiere Python 3.10+ y `ffmpeg` en el PATH). El autor menciona `faster-whisper` solo para desaconsejar la cuantizacion int8.
- Un detalle de implementacion importante: fusionar el adaptador en fp32 y convertir despues a fp16; fusionar en media precision redondea dos veces cada peso adaptado.
- Parametros de generacion usados por el autor: `max_new_tokens=96`, `repetition_penalty=1.1`, `language="en"`, `task="transcribe"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | WER en ATC (156 clips) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `thomaseibner/whisper-large-v3-turbo-us-atc-v2` | Adaptador LoRA sobre Whisper large-v3-turbo | Adaptador de 13 MB sobre base de ~809 M | Ventanas de 30 s | 32,3 % (recall de identificadores 82,8 %) | MIT | Hugging Face, libreria PEFT |
| `openai/whisper-large-v3-turbo` (base) | Encoder-decoder transformer ASR | ~809 M (dato de la documentacion publica del modelo base) | Ventanas de 30 s | 56,2 % (recall 52,8 %) | MIT | Hugging Face |
| Otros modelos ASR genericos (por ejemplo, la familia Whisper large-v3 o variantes destiladas) | ASR generico | No disponible | Ventanas de 30 s | No disponible: no se han publicado evaluaciones sobre este conjunto de ATC | No disponible | No disponible |

La comparacion directa solo esta documentada frente al modelo base. No hay datos en la informacion proporcionada sobre el comportamiento de otras alternativas ASR en audio de airband.

## Limitaciones y advertencias

- El WER absoluto sigue siendo alto: 32,3 % incluso tras el ajuste, y 38,0 % en el subconjunto de clips dificiles. No es un sistema apto para transcripcion automatica sin supervision en contextos criticos de seguridad.
- En el subconjunto "fail" el WER con adaptador es del 39,3 %, mejor que el 92,9 % del base, pero el subconjunto de evaluacion esta sesgado hacia casos dificiles, por lo que no debe interpretarse como representativo de una frecuencia ATC cualquiera.
- Sesgos concretos: no hay informacion proporcionada sobre sesgos por acento, sexo del hablante, condicion de senal o aerolinea. El modelo solo se ha evaluado con fraseologia ATC estadounidense y audio de airband AM.
- Riesgo de bucles de repeticion: en silencio o estatica el modelo puede generar secuencias degeneradas (`Point Point Point...`). El repositorio incluye una heuristica de descarte (8 palabras o mas y racha de 5 palabras identicas o menos del 40 % de palabras unicas) que debe aplicarse en produccion.
- La cuantizacion int8 esta explicitamente desaconsejada; bf16 solo se ha probado en entrenamiento, donde provoco bucles de repeticion, y no esta probado en inferencia.
- Los prompts empeoran los resultados de forma medible: un prompt estatico de fraseologia ATC costo 16,7 puntos de WER sobre Whisper original, y un prompt con callsigns disparo los bucles de repeticion del 1,7 % al 13,3 % de los clips sin recuperar ninguno de esos identificadores. No se debe usar `initial_prompt` ni `prompt_ids`.
- La entrada debe ser una unica transmision por fichero, recortada en el squelch o por deteccion de actividad de voz. Para grabaciones largas hay que dividir en lugar de confiar en decodificacion de formato largo (Whisper procesa bloques de 30 s).
- La cadena de audio importa: el modelo se entreno con remuestreo a 16 kHz mono, filtro paso-banda de 300-3400 Hz de orden 6 y normalizacion a -16 LUFS. El propio autor senala que el filtro importa mas cuanto menos se parezca el audio de entrada al suyo, aunque su pipeline de produccion alimenta clips sin filtrar y obtiene resultados aceptables.
- Solo ingles: no hay soporte multilingue.
- La licencia es MIT, sin restricciones declaradas para uso comercial, pero conviene verificar las condiciones del modelo base `openai/whisper-large-v3-turbo` del que depende.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado es de 0,0 GB: es un artefacto sin validacion externa ni adopcion por parte de la comunidad.
- No se documentan datos de entrenamiento (horas, origen, consentimiento, composicion), lo que dificulta auditar sesgos o reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thomaseibner/whisper-large-v3-turbo-us-atc-v2
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Documentacion de PEFT/LoRA: https://huggingface.co/docs/peft
- La busqueda web realizada no devolvio ningun resultado relevante: todos los enlaces recuperados corresponden a sitios de streaming no relacionados con el modelo (solarmoviie.com, solarmovies.mov, solarmovie.net.pk, solarmovie.pl, privacysavvy.com). No se han encontrado articulos, papers, repositorios ni demos adicionales en la informacion disponible.
