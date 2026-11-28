# weecici/stone-whisper

## Resumen

Stone-whisper es un modelo publicado en Hugging Face por el usuario weecici bajo licencia MIT. Por su identificador, sus tags (`whisper`, `safetensors`) y su volumen de parametros (816.967.680, es decir, unos 817 millones), se trata de un modelo de la familia Whisper de OpenAI para reconocimiento automatico del habla (ASR), presumiblemente ajustado o redistribuido por este autor. El tag `whisper` y el sufijo del nombre apuntan directamente a esa arquitectura encoder-decoder orientada a transcripcion de audio.

El repositorio tiene un tamano de 39,9 GB, muy superior al que corresponderia a un unico conjunto de pesos de 817 millones de parametros en precision completa (unos 3,3 GB en fp32 o 1,6 GB en fp16). Esto sugiere que el repo incluye multiples artefactos: posiblemente varios formatos de pesos, checkpoints intermedios o ficheros auxiliares. Es un dato relevante para quien planifique descargarlo.

La model card publicada es practicamente vacia: solo declara la licencia MIT, sin descripcion, sin idiomas, sin pipeline declarado y sin datos de entrenamiento. El modelo acumula 190 descargas y ningun "like" en el momento de la consulta, lo que indica una adopcion muy limitada. La ficha que sigue se construye a partir de los metadatos disponibles y de lo que es inferible de la arquitectura Whisper, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR); inferida del tag `whisper`, no documentada por el autor |
| Parametros totales | 816.967.680 (unos 817 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; el autor no lo declara) |
| Tipos de cuantizacion | no disponible; el repo contiene safetensors, sin indicacion de variantes GGUF o cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 39,9 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 190 / 0 |

## Arquitectura y entrenamiento

El tag `whisper` y el recuento de parametros (817 M) encajan con la variante de tamano "medium" de la familia Whisper de OpenAI, un transformer encoder-decoder que procesa espectrogramas Mel de audio y genera tokens de texto de forma autorregresiva. Whisper se entreno originalmente sobre 680.000 horas de audio etiquetado o pseudo-etiquetado multilingue, con tareas conjuntas de transcripcion, traduccion al ingles y deteccion de idioma. No obstante, el autor de este repositorio no documenta si stone-whisper es un ajuste fino sobre esa base, una redistribucion de pesos o un entrenamiento propio, ni aporta datos sobre el corpus utilizado, el numero de tokens de audio vistos o si hubo etapas de alineacion o ajuste supervisado.

Tampoco hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion u otras). Cualquier afirmacion sobre el proceso de entrenamiento mas alla de la arquitectura base inferida seria especulativa y, por tanto, se omite. El unico dato tecnico verificable es el recuento de parametros extraido de los ficheros safetensors y el formato de serializacion empleado.

## Capacidades

- Reconocimiento automatico del habla: la arquitectura Whisper esta disenada para transcribir audio a texto; es la capacidad central esperable del modelo.
- Traduccion de audio a texto en ingles: funcionalidad nativa de Whisper, aunque el autor no confirma que se conserve en este checkpoint.
- Deteccion de idioma: capacidad habitual de la arquitectura base, no verificada en este repositorio.
- Generacion de texto condicionada por audio: el decoder puede producir secuencias de texto a partir de la representacion del encoder.
- Soporte de tool calling / function calling: no disponible; no es una capacidad de la arquitectura Whisper ni el autor la declara.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles como dato declarado; dependen del checkpoint base, que el autor no especifica.
- Capacidades especiales (modo thinking, vision, audio de entrada): la entrada es audio por diseno de la arquitectura; el resto no esta documentado.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo recibe audio y devuelve texto; con 817 M de parametros es viable ejecutarlo en local para transcribir grabaciones de duracion moderada sin enviar datos a servicios externos, algo relevante por privacidad.
- Subtitulado de contenido audiovisual: se puede segmentar el audio en ventanas y generar subtitulos; la licencia MIT facilita integrarlo en herramientas de postproduccion sin restricciones de uso comercial.
- Indexacion y busqueda de archivos de audio: transcribir un archivo de grabaciones y almacenar el texto resultante en un motor de busqueda permite recuperar fragmentos por palabra clave.
- Accesibilidad: generar transcripciones para personas con discapacidad auditiva en aplicaciones propias, aprovechando que la licencia MIT no impone barreras de redistribucion.
- Prototipado de asistentes de voz: usar la transcripcion como primer eslabon de un pipeline (ASR -> LLM -> TTS) en entornos de desarrollo, dado el reducido tamano del modelo.
- Investigacion en ASR: servir como checkpoint de partida para experimentos de ajuste fino o comparativas de arquitecturas Whisper, siempre que se valide antes su calidad real, no documentada.
- Procesamiento por lotes de audio en servidores con GPU modesta: 817 M de parametros permiten ejecutar inferencia en tarjetas de gama media, lo que facilita trabajos de transcripcion masiva a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de WER (word error rate), comparativas con Whisper original ni evaluaciones por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos ocupan aproximadamente 1,6 GB; en fp32, unos 3,3 GB. A ello hay que sumar la memoria del runtime (activaciones, buffers de audio), por lo que un presupuesto realista de 3-6 GB de VRAM es razonable para inferencia en fp16.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM deberia bastar; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente capaces. No hay datos de latencia medidos para este checkpoint concreto.
- Cabe en GPU de consumo: si, con alta probabilidad, dado el tamano del modelo; conviene verificar en la practica porque el autor no aporta requisitos.
- Opciones de despliegue: al ser un checkpoint Whisper en safetensors, los runners habituales de la familia (transformers con pipeline de ASR, faster-whisper si se convierte, o servidores compatibles con Whisper) son candidatos; el autor no documenta ninguno. vLLM y TGI no estan orientados a ASR y no se recomiendan para este modelo. llama.cpp/Ollama no aplican a arquitecturas Whisper en su forma estandar.
- Latencia y throughput: no disponibles. Dependeran de la GPU, de la duracion del audio y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stone-whisper (weecici) | 817 M | audio (ventana Whisper, no declarada) | MIT | Hugging Face, 190 descargas | Sin model card, sin benchmarks |
| Whisper medium (OpenAI) | 769 M | audio, ventanas de 30 s | MIT | Hugging Face, ampliamente usado | Referencia de la familia; benchmarks publicos por OpenAI |
| Whisper large-v3 (OpenAI) | 1.550 M | audio, ventanas de 30 s | MIT | Hugging Face | Mayor precision a costa de mas VRAM |
| faster-whisper (SYSTRAN) | reimplementacion de Whisper | audio, ventanas de 30 s | MIT | GitHub / Hugging Face | Backend CTranslate2 optimizado; no es un modelo distinto sino una implementacion |

La comparacion con Whisper medium es la mas directa por proximidad de parametros, pero no puede confirmarse que stone-whisper sea identico a ese checkpoint ni que herede su rendimiento; el autor no lo indica. Los datos de rendimiento de las alternativas corresponden a sus fichas publicas y no se han medido contra stone-whisper.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo declara la licencia; no hay informacion sobre datos de entrenamiento, idiomas, calidad ni procedencia de los pesos.
- Riesgo de alucinacion: los modelos Whisper son conocidos por generar texto plausible en tramos de silencio o ruido; sin evaluacion del autor no puede descartarse ni cuantificarse en este checkpoint.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos por acento, idioma, genero o procedencia.
- Cobertura idiomatica no declarada: no se sabe que idiomas soporta ni con que calidad.
- Licencia MIT: permite uso comercial y redistribucion, pero conviene verificar que el autor tenga derechos sobre los pesos subyacentes si estos derivan de un checkpoint de OpenAI (Whisper es MIT, lo que en principio lo permite, pero la trazabilidad no esta documentada).
- Tamano del repositorio desproporcionado (39,9 GB frente a los ~1,6-3,3 GB esperables de los pesos): puede incluir artefactos redundantes o ficheros no necesarios; revisar el contenido antes de descargar en bloque.
- Adopcion muy baja (190 descargas, 0 likes) y sin pipeline declarado: no hay senales de validacion por parte de la comunidad.
- Para produccion: no recomendable sin una evaluacion propia de WER en el dominio objetivo y sin verificar la integridad y procedencia de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weecici/stone-whisper
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- faster-whisper (backend alternativo): https://github.com/SYSTRAN/faster-whisper
