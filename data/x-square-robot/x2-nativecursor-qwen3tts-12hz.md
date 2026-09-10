# x-square-robot/X2-NativeCursor-Qwen3TTS-12Hz

## Resumen

X2-NativeCursor-Qwen3TTS-12Hz es una cabeza observadora (observer head) de 2.036.991 parámetros desarrollada por x-square-robot que se acopla a un motor de síntesis de voz con streaming a nivel de token basado en Qwen3-TTS. No genera audio: su única función es estimar y publicar un cursor de progreso de lectura sobre el texto de origen que se está sintetizando. El problema que resuelve es concreto: en un pipeline TTS de streaming el cliente empieza a recibir audio antes de que la frase haya terminado, y hasta ahora no tenía forma de saber qué caracteres del texto correspondían al audio ya emitido. Esta cabeza responde a esa pregunta antes de la decodificación de la forma de onda.

Técnicamente, el componente lee el token de codebook-0 que emite el Talker de Qwen3-TTS cada 80 ms, lo puntúa contra las etiquetas habladas del texto visible hasta el momento y publica un cursor que nunca retrocede. El generador TTS, el tokenizador de voz y el vocoder no se modifican; el observador es la única adición al sistema. Está pensado para el backbone Qwen3-TTS 12 Hz `custom-1.7b` (vocabulario de codec 3072, tramas de 80 ms) y se integra en el motor Qwen3TTS-Streaming (rama `dev`) como estimador `native` detrás de los eventos `text_progress`.

Su relevancia es de nicho pero clara para quien construye interfaces de voz: habilita resaltado sincronizado, interrupción consciente de la reproducción e historial de diálogo alineado con el audio realmente escuchado. Se distribuye bajo licencia Apache 2.0, soporta chino e inglés, y por su tamaño (8,17 MB) se ejecuta en CPU por defecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de tokens nativos con cuatro bloques de convolución dilatada (tamaño oculto 256) más un matcher local de offsets −2…+4 y un clasificador de contenido con embedding de etiqueta compartido |
| Parametros totales | 2.036.991 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 29 tramas de contexto izquierdo más 1 trama de lookahead (80 ms por trama, es decir 2.320 ms de contexto a la izquierda) |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Tamano del fichero | 8,17 MB (`qwen3_tts_12hz_la1_seed0.pt`, SHA-256 `aa94527fddff97cca0c337529a3b840b141d8301c4a6082557984438a7e584bc`) |
| Etiquetas de salida | 503 etiquetas habladas: 477 sílabas pinyin más 26 letras inglesas (`en_unit=letter`) |
| Backbone compatible | Qwen3-TTS 12 Hz `custom-1.7b` (vocabulario de codec 3072, tramas de 80 ms) |
| Dispositivo por defecto | CPU, dentro del hilo de frontend del motor (`native_device: auto`); CUDA es opcional |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo ni un modelo de lenguaje: es una cabeza ligera de predicción de posición. Un planificador TNPlan convierte primero el texto comprometido en etiquetas habladas (la lectura normalizada) y registra qué fragmento del texto original posee cada etiqueta, de modo que la proyección de vuelta al texto en bruto es exacta incluso cuando el orden de lectura difiere del orden de escritura (por ejemplo, `99%` se convierte en 百分之九十九). Después, un encoder de tokens nativos con cuatro bloques de convolución dilatada y tamaño oculto 256 proyecta cada token de codebook-0 con una trama de lookahead. Finalmente, un matcher local puntúa las etiquetas en los offsets −2 a +4 alrededor de la posición anterior contra la característica del token y un pequeño estado de localización, y desplaza un cursor continuo interno que nunca retrocede.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos figuran como no disponibles. La innovación técnica destacable es que el observador es la única pieza añadida al pipeline: el generador TTS, el tokenizador de voz y el vocoder permanecen intactos, y el cursor se entrega sobre los eventos `text_progress` ya existentes del motor, de modo que los clientes actuales siguen funcionando sin cambios. Cada ancla incluye `progress_basis = native_cursor_v1`, `progress_quality = aligned` y campos de diagnóstico `native_*`.

## Capacidades

- Estimación de progreso de lectura a nivel de token sobre texto en chino e inglés, con salida de un cursor monótono que no retrocede.
- Normalización de texto a lectura hablada mediante TNPlan, con mapeo exacto de cada etiqueta al fragmento de texto original que la posee.
- Manejo de 503 etiquetas: 477 sílabas pinyin y 26 letras inglesas (`en_unit=letter`).
- Gestión de desalineaciones entre orden de lectura y orden de escritura (números, símbolos y expresiones como `99%`).
- Inferencia en CPU dentro del hilo de frontend del motor, con CUDA como opción explícita.
- Verificación de integridad mediante SHA-256 contra `native_expected_head_sha256`, con rechazo de cabezas no coincidentes.
- Degradación controlada: con `native_fail_open: true`, un fallo de carga revierte al estimador `ema` integrado.
- No genera audio, no realiza tool calling ni function calling, no soporta agentes multi-paso, no tiene modo thinking y no incorpora visión ni audio de entrada.

## Casos de uso

- Resaltado sincronizado tipo karaoke: el motor emite anclas con `progress_quality = aligned` que permiten iluminar en pantalla el fragmento de texto que se está reproduciendo en ese instante, sin esperar a que termine la frase.
- Interrupción consciente de la reproducción (barge-in) en asistentes de voz: el cursor permite saber qué parte del texto ya se locutó para truncar el historial de diálogo exactamente en el punto audible.
- Actualización del historial de conversación alineada con el audio: en lugar de registrar la respuesta completa del asistente, se registra solo lo que el usuario llegó a escuchar, evitando incoherencias en turnos posteriores.
- Subtitulado y teleprompter para narración continua: con 2.320 ms de contexto izquierdo y 80 ms de lookahead, el cursor sigue el ritmo real de la locución en lecturas largas.
- Accesibilidad para personas con discapacidad auditiva o cognitiva: sincronizar texto resaltado con voz sintetizada facilita el seguimiento de contenido leído en voz alta.
- Observabilidad y depuración de pipelines TTS: los campos `native_*` permiten auditar en producción si el cursor se desvía del texto realmente sintetizado.
- Lectura guiada de documentos en aplicaciones educativas: el cursor sobre texto normalizado permite avanzar marcas de progreso sobre material con números, siglas y mezcla de chino e inglés.
- Sincronización de interfaz en clientes de voz existentes: al reutilizar los eventos `text_progress`, cualquier cliente que ya consuma el motor `ema` puede migrar al estimador `native` cambiando solo `estimator: native`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona validación contra el checkpoint servido por el motor (`x-square-robot/X2Streaming-TTS-1.7B`, voz `robot_service_v1`) y el uso de la rama `dev` con la funcionalidad `feat/native-cursor` (basada en `main` @ `bea54a4`), pero no incluye métricas numéricas de precisión de cursor, latencia ni comparación cuantitativa con el estimador `ema`. No se deben inferir cifras que no aparezcan en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 2.036.991 parámetros y un fichero de 8,17 MB, la huella en memoria es de unos pocos megabytes, muy por debajo de cualquier umbral relevante.
- GPU recomendadas: ninguna en concreto. El modelo está diseñado para ejecutarse en CPU (`native_device: auto` resuelve a CPU) dentro del hilo de frontend del motor.
- Cabe en cualquier GPU de consumo: sí, y también en entornos sin GPU. CUDA es una opción explícita (`cuda` o `cuda:N`) para quien quiera desplazar la carga fuera del hilo de frontend.
- Opciones de despliegue: no se distribuye como servidor independiente. Se integra en el motor Qwen3TTS-Streaming colocando el fichero en `resources/native_cursor/` y configurando `engine.yaml` o la variable `ENGINE_TEXT_PROGRESS_ESTIMATOR=native`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una cabeza de este tipo.
- Latencia y throughput: no se publican cifras de throughput. El único dato de latencia estructural es el lookahead de 1 trama (80 ms) y un contexto izquierdo de 29 tramas (2.320 ms), que definen la ventana de observación, no el coste de cómputo.
- Requisito adicional: el backbone Qwen3-TTS 12 Hz `custom-1.7b` y su tokenizador de voz y vocoder, que son quienes consumen la mayor parte de los recursos del sistema completo.

## Comparativa con modelos similares

No se han identificado cabezas observadoras de progreso de lectura comparables publicadas de forma independiente. La única alternativa documentada dentro del mismo motor es el estimador `ema` integrado, que actúa como valor por defecto y como mecanismo de respaldo.

| Aspecto | X2-NativeCursor (native) | Estimador `ema` del motor |
|---|---|---|
| Naturaleza | Cabeza entrenada de 2.036.991 parámetros | Estimador heurístico integrado |
| Entrada | Token de codebook-0 + etiquetas habladas del texto visible | No documentada en detalle |
| Calidad declarada | `progress_quality = aligned` | Valor por defecto del motor |
| Requiere fichero adicional | Sí (`qwen3_tts_12hz_la1_seed0.pt`) | No |
| Uso de CPU/GPU | CPU por defecto, CUDA opcional | No aplica |
| Licencia | Apache 2.0 | La del motor Qwen3TTS-Streaming |

## Limitaciones y advertencias

- Específico de voz y backbone: la cabeza está entrenada para una voz concreta (`robot_service_v1`) y un backbone concreto (Qwen3-TTS 12 Hz `custom-1.7b`). Para otro checkpoint, voz o codec hay que reentrenar y validar el observador antes de activar `native`.
- Verificación de integridad: el motor rechaza cualquier cabeza cuyo SHA-256 no coincida con `native_expected_head_sha256` cuando ese campo está definido, lo que impide reutilizar pesos modificados sin actualizar la configuración.
- Cobertura lingüística limitada: solo chino e inglés, con 503 etiquetas (477 sílabas pinyin y 26 letras). No hay soporte documentado para otras lenguas ni para alfabetos distintos del latino básico.
- Riesgo de estimación errónea del cursor: al tratarse de una predicción sobre el texto visible, el cursor puede desviarse en textos con estructuras de lectura inusuales, números, siglas o cambios de idioma dentro de una misma frase. No se han publicado métricas de error.
- Comportamiento de respaldo: con `native_fail_open: true`, cualquier fallo de carga revierte silenciosamente al estimador `ema`, de modo que un despliegue puede estar operando sin la cabeza nativa sin que sea evidente.
- No es un generador: no produce audio ni texto, no admite tool calling ni razonamiento multi-paso, y no debe evaluarse como un modelo de lenguaje.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento en producción más allá de lo declarado por el autor.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia correspondientes. Conviene verificar también la licencia del backbone Qwen3-TTS y del checkpoint X2Streaming-TTS-1.7B sobre los que opera.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo: los enlaces devueltos corresponden a la red social X y no guardan relación con el componente descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/x-square-robot/X2-NativeCursor-Qwen3TTS-12Hz
- Checkpoint de voz asociado: https://huggingface.co/x-square-robot/X2Streaming-TTS-1.7B
- Repositorio del motor: https://github.com/X-Square-Robot/Qwen3TTS-Streaming
- Repositorio del proyecto X2Streaming-TTS: https://github.com/X-Square-Robot/X2Streaming-TTS
- Documentación de la funcionalidad native cursor: https://github.com/X-Square-Robot/X2Streaming-TTS/blob/main/docs/native_cursor.md
- Diseño del evento de progreso (rama `dev`): https://github.com/X-Square-Robot/Qwen3TTS-Streaming/blob/dev/docs/dev/design/native_cursor_progress.md
- Paper de X2-NativeCursor: https://arxiv.org/abs/2609.09677
- Paper adicional referenciado en las etiquetas del modelo: https://arxiv.org/abs/2608.18661
