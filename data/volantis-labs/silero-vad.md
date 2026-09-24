# volantis-labs/silero-vad

## Resumen

Silero VAD es un detector de actividad de voz (VAD, voice activity detection) preentrenado y de grado empresarial, desarrollado por el equipo de Silero. La entrada analizada aqui es una redistribucion del modelo oficial en formato ONNX, publicada por el usuario volantis-labs en Hugging Face bajo licencia MIT y sin modificaciones respecto al original. Su funcion es determinar, fragmento a fragmento, si una senal de audio contiene voz humana o silencio/ruido, una tarea de preprocesado critica en cualquier pipeline de audio.

El modelo resuelve un problema clasico de ingenieria: los sistemas de reconocimiento de voz, telefonia IP y grabacion continua necesitan saber cuando hay voz para no malgastar computo ni generar transcripciones vacias. Frente al veterano WebRTC VAD, que segun la documentacion del proyecto "empieza a mostrar su edad", Silero VAD ofrece mayor precision manteniendo un coste minimo: menos de 1 ms por fragmento de 30+ ms en un unico hilo de CPU, con el modelo JIT ocupando alrededor de dos megabytes.

Es relevante ahora porque es un componente ubicuo en herramientas de transcripcion y asistentes de voz de codigo abierto, y porque su lanzamiento como artefacto ONNX ligero permite ejecutarlo en entornos de borde (IoT, movil, dispositivos embebidos) sin GPU. Esta ficha describe la redistribucion concreta alojada en volantis-labs, cuyos datos publicos (descargas y likes) estan a cero, por lo que conviene tratar el repositorio original como fuente de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la topologia; se distribuye como artefacto ONNX) |
| Parametros totales | no disponible (el fichero `silero_vad.onnx` ocupa 2.327.524 bytes) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica como contexto de tokens; procesa fragmentos de audio de 30+ ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la deteccion de actividad de voz no es especifica de un idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`silero_vad.onnx`); el proyecto original tambien publica un modelo JIT (TorchScript) |
| Tarea | Deteccion de actividad de voz (clasificacion binaria voz / no voz por fragmento) |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Checksum del artefacto | SHA-256 `1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3` |
| Dependencias de ejecucion | python 3.8+, torch>=1.12.0, torchaudio>=0.12.0 (solo E/S), onnxruntime>=1.16.1 |
| Requisitos de CPU | x86-64 con juegos de instrucciones AVX, AVX2, AVX-512 o AMX |
| Fecha de publicacion en este repositorio | 2026-09-24 (creacion), 2026-09-24 (ultima actualizacion) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo: la model card se limita a declarar que se trata del modelo ONNX de Silero VAD, redistribuido sin cambios por volantis-labs bajo licencia MIT, con atribucion al equipo de Silero (copyright 2020-present). El repositorio incluye un unico artefacto, `silero_vad.onnx`, de 2.327.524 bytes, con el hash SHA-256 indicado en la tabla anterior. No se especifica numero de capas, tipo de red, ni si emplea representaciones espectrales o crudas; estos datos deben consultarse en la documentacion del proyecto original.

Respecto al entrenamiento, la documentacion publica del proyecto afirma que el modelo fue entrenado sobre "corpus enormes", pero no se incluye en la informacion disponible el numero de horas de audio, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino con preferencias humanas (poco habituales en un clasificador de voz). Tampoco se documenta ninguna innovacion tecnica concreta mas alla de la eficiencia de inferencia: el proyecto declara que un fragmento de 30+ ms se procesa en menos de 1 ms en un unico hilo de CPU, que el uso de batching o GPU mejora el rendimiento y que, bajo ciertas condiciones, la ruta ONNX puede ser entre 4 y 5 veces mas rapida.

## Capacidades

- Deteccion de actividad de voz por fragmentos de audio de 30+ ms, con salida de tipo voz / no voz.
- Funcionamiento en modo streaming, procesando el audio a medida que llega en lugar de requerir el fichero completo.
- Inferencia en CPU de un solo hilo en menos de 1 ms por fragmento, lo que permite uso en tiempo real.
- Aceleracion mediante batching y, bajo ciertas condiciones, mediante la ruta ONNX (hasta 4-5 veces mas rapida).
- Ejecucion en entornos sin GPU: IoT, movil, dispositivos de borde y sistemas embebidos.
- Integracion en pipelines de reconocimiento de voz como etapa de segmentacion previa (el proyecto mantiene ademas modelos STT propios).
- Limpieza y preparacion de datos de audio: filtrado de segmentos sin voz en corpus de entrenamiento o de transcripcion.
- Automatizacion de telefonia y centros de llamadas: activacion de grabacion o de agentes solo cuando hay habla.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, vision, audio generativo, tool calling ni agentes; el modelo es exclusivamente un clasificador de voz.

## Casos de uso

- Segmentacion previa a la transcripcion: cortar el audio en fragmentos con voz antes de enviarlo a un motor ASR evita transcribir silencios y ruido, lo que reduce el coste por minuto en servicios de transcripcion y mejora la calidad de las marcas de tiempo.
- Telefonia IP y centros de llamadas: el detector permite activar la grabacion o el analisis solo cuando el cliente o el agente hablan, y alimentar metricas de tiempo de habla por participante en conversaciones multi-turno.
- Limpieza de corpus de audio: al procesar horas de grabaciones para entrenar modelos de voz, el VAD descarta automaticamente los tramos sin habla, reduciendo el volumen de datos y el coste de etiquetado.
- Asistentes de voz en dispositivos de borde: al ejecutarse en CPU con menos de 1 ms por fragmento de 30+ ms y ocupar alrededor de dos megabytes en formato JIT, cabe en moviles, Raspberry Pi o microcontroladores que no disponen de GPU.
- Diarizacion y analisis de reuniones: combinado con un modelo de reconocimiento de hablante, el VAD aporta los limites de turno necesarios para segmentar intervenciones y calcular tiempos de participacion.
- Deteccion de eventos acusticos y vigilancia: en sistemas de monitorizacion de audio en tiempo real, el VAD filtra el ruido de fondo continuo y reduce los falsos positivos de etapas posteriores de clasificacion.
- Optimizacion de pipelines de subtitulado: generar subtitulos solo para los tramos con voz y sincronizar mejor los tiempos de entrada y salida de cada linea.
- Ahorro en consumo de APIs en la nube: descartar el silencio antes de llamar a un servicio externo de voz reduce directamente los minutos facturados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (ROC-AUC, curvas DET, tasa de error en puntos de operacion) en la informacion disponible. Los unicos datos cuantitativos de rendimiento presentes son de latencia y aceleracion.

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia por fragmento | menos de 1 ms | fragmento de 30+ ms, un unico hilo de CPU |
| Aceleracion con ONNX | hasta 4-5 veces | "bajo ciertas condiciones" (no especificadas) |
| Mejora con batching / GPU | no disponible | el proyecto indica que mejora "considerablemente", sin cifras |
| Precision en deteccion de voz | no disponible | se afirma "excelente" de forma cualitativa, sin cifras |
| Tamano del modelo JIT | alrededor de 2 MB | una de las fuentes consultadas indica alrededor de 1 MB |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU. No se documentan requisitos de VRAM en la informacion disponible.
- Memoria principal: 1 GB o mas de RAM segun los requisitos de los ejemplos de Python publicados.
- CPU: sistema x86-64 con instrucciones AVX, AVX2, AVX-512 o AMX. No se documenta soporte para otras arquitecturas (ARM, por ejemplo) en la informacion disponible.
- GPU: no es necesaria. El proyecto indica que el uso de GPU puede mejorar el rendimiento, pero no detalla modelos recomendados; no se especifican A100, H100 ni RTX en la documentacion consultada.
- Encaje en GPU de consumo: si, cualquier GPU de consumo puede alojar un artefacto de 2,3 MB, pero hacerlo carece de sentido practico dado que el modelo ya cumple los requisitos de tiempo real en CPU. En un dispositivo sin GPU (movil, IoT, embebido) funciona igualmente.
- Opciones de despliegue: `onnxruntime` (version 1.16.1 o superior) para el artefacto ONNX, PyTorch 1.12.0 o superior para el modelo JIT/TorchScript, y el paquete `silero-vad` distribuido en PyPI. `torchaudio` 0.12.0 o superior se usa unicamente para entrada/salida de audio.
- Latencia y throughput: menos de 1 ms por fragmento de 30+ ms en un hilo de CPU; con batching o GPU el rendimiento mejora, y la ruta ONNX puede ser hasta 4-5 veces mas rapida bajo ciertas condiciones. No se publican cifras de throughput en fragmentos por segundo.
- Nota: los marcos de servicio de modelos generativos (vLLM, TGI, Ollama, llama.cpp) no estan pensados para este tipo de artefacto; el despliegue natural es `onnxruntime` o PyTorch embebido en la aplicacion.

## Comparativa con modelos similares

La informacion disponible solo permite comparar cualitativamente con el detector de referencia del sector, WebRTC VAD, y con las otras distribuciones del propio Silero VAD.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| volantis-labs/silero-vad (esta ficha) | no disponible (artefacto ONNX de 2.327.524 bytes) | fragmentos de audio de 30+ ms | menos de 1 ms por fragmento en un hilo de CPU | MIT | Hugging Face; 0 descargas y 0 likes en el momento de la consulta |
| Silero VAD original (snakers4/silero-vad y hub de PyTorch) | no disponible (modelo JIT de alrededor de 2 MB) | fragmentos de audio de 30+ ms | igual que el anterior; es la fuente del artefacto redistribuido | MIT | GitHub, PyTorch Hub, PyPI |
| WebRTC VAD | no disponible | tramas de audio cortas | la documentacion de Silero lo describe como un detector que "empieza a mostrar su edad", sin cifras comparativas | no disponible en la informacion proporcionada | biblioteca de WebRTC |

No se han encontrado en la busqueda otros detectores de actividad de voz de codigo abierto comparables con datos de parametros o benchmarks publicados; por tanto, la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Esta ficha describe una redistribucion de terceros (volantis-labs), no el modelo oficial. El repositorio declara que el artefacto se redistribuye sin cambios; conviene verificar el hash SHA-256 antes de usarlo en produccion y, en caso de duda, descargar el modelo desde la fuente original.
- El repositorio de Hugging Face muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no hay validacion de la comunidad sobre esta copia concreta.
- La model card no documenta sesgos, tasas de falsos positivos ni de falsos negativos, comportamiento en audio con musica de fondo, ruido industrial o habla superpuesta, ni el rendimiento por idioma o acento. No se puede asumir un comportamiento homogeneo en dominios distintos al de entrenamiento.
- La tarea no es generativa, por lo que no existe riesgo de alucinacion en el sentido habitual; el modo de fallo relevante es la clasificacion incorrecta de un fragmento (voz detectada como silencio o viceversa), sin que se publiquen cifras de error.
- Los requisitos de CPU (AVX, AVX2, AVX-512 o AMX) y el hecho de que las dependencias se documenten para x86-64 limitan el despliegue en algunas plataformas ARM o entornos muy restringidos; no se documentan requisitos alternativos en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, incluida la redistribucion, siempre que se conserve el aviso de copyright y la propia licencia. La model card atribuye la titularidad al equipo de Silero (copyright 2020-present). No se documentan clausulas adicionales, telemetria, claves ni caducidad.
- Es un unico componente de un pipeline: por si solo no transcribe, no identifica hablantes ni genera texto; necesita integrarse con un motor ASR u otros modelos para tareas de extremo a extremo.
- No se publican resultados de benchmarks de precision en la informacion disponible, de modo que cualquier afirmacion de superioridad frente a WebRTC VAD debe verificarse con una evaluacion propia sobre el dominio de uso previsto.

## Enlaces

- Repositorio en Hugging Face (esta redistribucion): https://huggingface.co/volantis-labs/silero-vad
- Repositorio oficial en GitHub: https://github.com/snakers4/silero-vad
- Redistribucion alternativa en GitHub: https://github.com/Sahl-AI/silero-vad
- Redistribucion alternativa en Hugging Face: https://huggingface.co/huggingworld/silero-vad
- Pagina del modelo en PyTorch Hub: https://pytorch.org/hub/snakers4_silero-vad_vad/
- Paquete en PyPI: https://pypi.org/project/silero-vad/
