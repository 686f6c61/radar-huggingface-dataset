# techprotrade/luuna-emotional-voice

## Resumen

Luuna Emotional Voice Engine es un motor de voz expresiva publicado por el usuario techprotrade en Hugging Face. No es un modelo de lenguaje ni un TTS monolítico, sino un sistema de orquestación que decide *cómo* se pronuncia un texto (significado semántico, contexto, estado emocional actual, estado previo, urgencia y puntuación), lo planifica como datos de control estructurados y lo ejecuta sobre una pila TTS local intercambiable. El resultado declarado es "una identidad, 27 emociones, prosodia continua, streaming e interrumpible", pensado para un compañero conversacional persistente llamado Luuna.

El sistema se compone de cinco etapas encadenadas: un Emotion Director basado en reglas con LLM opcional, un plan de prosodia y emoción con parámetros VAD, ritmo, tono y energía, una segmentación de texto con marcas de pausa, un motor TTS expresivo con adaptadores intercambiables (chatterbox, voxcpm, xtts) y un postprocesador de audio. La salida se emite en trozos PCM con costura por crossfade y admite cancelación.

El dato más relevante para evaluar su viabilidad es que se declara ejecutable de forma completamente offline en una única RTX 3090 de 24 GB, con Windows 11 como plataforma de instalación documentada. El repositorio incluye además una ruta específica para estonio, idioma que, según el autor, ningún TTS abierto cubre. El repositorio no tiene descargas ni likes en el momento de la consulta y no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de orquestacion: Emotion Director (reglas + LLM opcional) -> plan de prosodia/emocion -> segmentacion de texto -> motor TTS expresivo con adaptadores -> postprocesado de audio -> salida streaming |
| Parametros totales | no disponible (depende del adaptador TTS seleccionado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (memoria temporal por sesion con decaimiento a neutro tras ~90 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en terminos generales; el API acepta un campo `language` y la model card documenta una ruta especifica para estonio (`et`) |
| Licencia | no disponible para el repositorio; componentes citados: Chatterbox MIT, VoxCPM2 Apache-2.0, XTTS-v2 CPML (no comercial, solo fallback/prototipo), Common Voice CC-0, FLEURS CC-BY, EKKK CC-BY |
| Formato de pesos | no disponible; se trabaja con adaptadores TTS y una muestra de referencia de voz en WAV (`models\reference\luuna-neutral.wav`) |
| Frecuencia de muestreo de salida | 24 000 Hz, PCM mono int16 (cabecera `LUUNAPCM1 24000 int16`) |
| Emociones soportadas | 27 |
| Identificador del repositorio | techprotrade/luuna-emotional-voice |
| Plataforma declarada | Windows 11, GPU RTX 3090 de 24 GB, ejecucion totalmente offline |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de componentes y no un transformador único. La primera etapa, Luuna Emotion Director, combina reglas con un LLM opcional enrutado ("Model Router") y produce un plan de interpretación. La segunda etapa convierte ese plan en datos de control estructurados con campos de emoción, intensidad, VAD, ritmo (`pace`), tono (`pitch`), energía y otros. La tercera aplica segmentación de texto con marcas `[pause]` y arcos intra-enunciado de suave a fuerte. La cuarta ejecuta el plan sobre un adaptador TTS intercambiable (chatterbox, voxcpm o xtts). La quinta aplica postprocesado de ritmo, tono, energía, aireosidad (`breathiness`) y sonoridad antes de emitir audio en streaming.

El control emocional se implementa como una máquina de estados por sesión con memoria temporal: guarda estado previo, estado objetivo, VAD y marcas de tiempo; las transiciones son suavizadas y ponderadas por distancia, con asentamiento rápido entre estados de la misma familia; existe decaimiento hacia neutro tras unos 90 segundos de inactividad. Las instrucciones explícitas siempre anulan la inferencia. En cuanto al entrenamiento, la model card describe un ajuste fino mediante `training/finetune.py`, basado en el entrenador LoRA oficial de VoxCPM2, sobre el corpus EKKK (Estonian Emotional Speech Corpus: una hablante femenina, etiquetas de ira, alegría, tristeza y neutro, licencia CC-BY) y Common Voice et (51,7 horas, CC-0). El condicionamiento emocional se realiza con etiquetas `[emotion]` insertadas en el texto y nunca a partir del audio de referencia, para evitar filtración de la emoción de la referencia. No se detallan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO, dado que el sistema se apoya en adaptadores TTS preexistentes.

## Capacidades

- Síntesis de voz expresiva con control de emoción (27 etiquetas declaradas) e intensidad.
- Planificación de prosodia: VAD, ritmo, tono, energía, aireosidad y sonoridad por segmento.
- Ejecución intra-enunciado: segmentos con distinta energía y pausas explícitas, por ejemplo `"Tom... ma ei tea. [pause_500] See ei tundu..."`.
- Máquina de estados emocional con memoria por sesión, transiciones suavizadas y decaimiento a neutro.
- Anulación de la inferencia mediante instrucciones explícitas de emoción o de estado.
- Streaming de audio en trozos PCM (24 kHz, mono, int16) con costura por crossfade.
- Interrupción de la síntesis en curso mediante endpoint de cancelación.
- Salida por WebSocket con tramas base64.
- Carga de una voz de referencia propia mediante `multipart` para definir la identidad vocal.
- Adaptadores TTS intercambiables: chatterbox, voxcpm y xtts.
- API HTTP local con endpoints de síntesis, análisis emocional, consulta y sobrescritura de estado, y comprobación de salud.
- Soporte documentado de estonio, incluyendo corpus emocional y de fluidez general para ajuste fino.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni matemáticas; es un motor de salida de voz, no un modelo conversacional completo.

## Casos de uso

- Compañero conversacional persistente: el motor mantiene memoria emocional por sesión con estado previo y VAD, de modo que la voz de un asistente puede evolucionar de forma coherente a lo largo de una conversación y volver a neutro tras unos 90 segundos de inactividad.
- Atención al cliente con voz sintética en tiempo real: la combinación de streaming PCM y endpoint de cancelación permite interrumpir una respuesta a media locución cuando el usuario habla, algo habitual en telefonía automatizada.
- Audiolibros y narración larga: la segmentación con marcas `[pause_500]` y los arcos suave a fuerte permiten reproducir tensión dramática dentro de una misma frase sin recurrir a varias tomas de estudio.
- Doblaje y localización con control emocional explícito: las etiquetas `[emotion]` insertadas en el texto permiten fijar la emoción por línea sin que la muestra de referencia condicione el resultado, lo que facilita mantener una identidad vocal única en guiones con cambios de registro.
- Prototipado de personajes para videojuegos: los adaptadores son intercambiables, por lo que se puede cambiar el motor TTS subyacente sin reescribir la capa de dirección emocional ni el postprocesado.
- Investigación en habla emocional y lenguas de bajos recursos: la ruta de estonio documenta el uso de EKKK (CC-BY) y Common Voice et (51,7 h, CC-0) con el entrenador LoRA de VoxCPM2, lo que sirve como plantilla reproducible para otros idiomas sin TTS abierto.
- Accesibilidad y lectores de pantalla: el control independiente de ritmo, tono y energía permite ajustar la prosodia a perfiles de comprensión diversos, y el postprocesado de sonoridad ayuda a mantener un nivel de escucha constante.
- Sustitución de APIs TTS en la nube: la ejecución totalmente offline en una RTX 3090 evita enviar texto de usuario a terceros, algo relevante en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La model card declara ejecución completamente offline en una única RTX 3090 de 24 GB, sobre Windows 11.
- La VRAM necesaria por cada adaptador TTS (chatterbox, voxcpm, xtts) no está especificada: no disponible.
- GPU recomendadas: RTX 3090 (24 GB) es la única confirmada por el autor. Para otras GPU, incluido el segmento consumer de gama media, no hay datos disponibles.
- Existe un conjunto de pruebas ejecutable en CPU sin descarga de modelos (`scripts\run_tests.ps1`), pero no se especifica si cubre síntesis completa.
- Despliegue: servidor de API local en `127.0.0.1:7890` y UI de demostración en `127.0.0.1:7891`, arrancados mediante scripts de PowerShell (`scripts\run_server.ps1`, `scripts\run_demo.ps1`). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia estándar.
- Latencia y throughput estimados: no disponibles. La salida se entrega en tramas fragmentadas de PCM de 16 bits a 24 kHz, lo que implica que el tiempo hasta el primer fragmento depende del adaptador TTS elegido.

## Comparativa con modelos similares

Dado que el sistema es una capa de dirección emocional sobre motores TTS intercambiables, la comparación pertinente es con los propios adaptadores citados en la model card.

| Sistema | Papel en la pila | Licencia | Disponibilidad |
|---|---|---|---|
| Luuna Emotional Voice Engine | Direccion emocional, prosodia, streaming y postprocesado | no disponible para el repositorio | Hugging Face, 0 descargas y 0 likes |
| Chatterbox | Adaptador TTS intercambiable | MIT | citado como componente |
| VoxCPM2 | Adaptador TTS intercambiable; base del entrenador LoRA usado en el ajuste fino | Apache-2.0 | citado como componente |
| XTTS-v2 | Adaptador TTS de reserva | CPML, no comercial | citado como fallback solo para prototipos |

No se dispone de datos de parámetros, longitud de contexto ni rendimiento de estos adaptadores en la información proporcionada, por lo que la comparación se limita a licencia, papel en la pila y disponibilidad.

## Limitaciones y advertencias

- El repositorio no declara licencia propia, lo que impide determinar las condiciones de uso comercial del conjunto del sistema; únicamente se documentan las licencias de los componentes externos.
- XTTS-v2 se distribuye bajo CPML, licencia no comercial, y la propia model card lo restringe a uso de respaldo o prototipo. Cualquier despliegue en producción sobre ese adaptador plantea un riesgo legal.
- Los datasets de ajuste fino incluyen FLEURS (CC-BY) y EKKK (CC-BY), que exigen atribución; Common Voice et es CC-0.
- No hay resultados de benchmarks, evaluaciones subjetivas de naturalidad (MOS) ni comparaciones ciegas publicadas, por lo que no es posible verificar la calidad de la expresividad declarada.
- La única configuración de hardware validada explícitamente es Windows 11 con una RTX 3090 de 24 GB; no se documenta soporte de Linux, macOS ni de GPU de gama inferior.
- El sistema está atado en la práctica a un ecosistema de scripts de PowerShell para instalación, arranque y pruebas.
- Los idiomas soportados no están enumerados: solo hay una ruta documentada para estonio. El resto de idiomas depende del adaptador TTS seleccionado y no está cuantificado.
- No se documentan mecanismos de mitigación de sesgos ni evaluación de voces sintéticas sobre grupos demográficos distintos.
- La clonación de voz a partir de una muestra de referencia plantea riesgos de suplantación y de uso no consentido de la identidad vocal de terceros; la model card no describe salvaguardas al respecto.
- El repositorio presenta 0 descargas y 0 likes, y la fecha de creación registrada es posterior a la de consulta habitual de estos datos, por lo que se trata de un artefacto sin validación por parte de la comunidad.
- Una ficha de este tipo describe un sistema de síntesis de voz, no un modelo de lenguaje: no cabe esperar razonamiento, generación de código ni uso de herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/techprotrade/luuna-emotional-voice
- Los resultados de búsqueda web proporcionados no contienen información relacionada con este modelo (son artículos de consumo en neerlandés sobre comercio electrónico, embalajes, portátiles y costes energéticos), por lo que no se han incluido como fuentes.
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios adicionales ni demostraciones del autor.
