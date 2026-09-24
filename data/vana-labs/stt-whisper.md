# Vana-Labs/stt-whisper

## Resumen

Vana-Labs/stt-whisper es un repositorio espejo que redistribuye los pesos de OpenAI Whisper en formato GGML para whisper.cpp, junto con una variante afinada para armenio. Lo mantiene Vana Labs como dependencia fijada de Tetro, su transcriptor de reuniones local que se ejecuta íntegramente en el ordenador del usuario. No introduce un modelo nuevo: empaqueta checkpoints ya existentes en un único punto de descarga controlado, con nombres de archivo estables del tipo `ggml-<model id>.bin`, para que las descargas de Tetro no dependan de hosts de terceros.

El repositorio cubre los seis tamaños clásicos de la familia (tiny, base, small, medium, large-v3 y large-v3-turbo) tanto en precisión completa como en cuantización de 5 bits, y añade `large-v3-turbo-hy`, un ajuste fino en armenio derivado de Chillarmo/whisper-large-v3-turbo. Su relevancia es doble: por un lado, garantiza disponibilidad y trazabilidad de los pesos (se indica el commit exacto del que proceden); por otro, ofrece en un solo lugar tanto transcripción multilingüe generalista como una especialización en armenio dentro del ecosistema whisper.cpp.

El tamaño total del repositorio es de 11,1 GB, la licencia declarada es MIT y la biblioteca objetivo es whisper.cpp. Los checkpoints de OpenAI son copias sin modificar; el archivo armenio se generó con el script de conversión de whisper.cpp a partir de una fuente con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, OpenAI) |
| Parametros totales | De ~39 M (tiny) a ~1550 M (large-v3) segun variante |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 fotogramas de espectrograma log-Mel); sin contexto textual persistente entre ventanas |
| Tipos de cuantizacion | Sin cuantizar (f16/f32) y q5_1 (tiny, base, small) y q5_0 (medium, large-v3, large-v3-turbo) |
| Idiomas soportados | `multilingual` y `hy` (armenio), segun los metadatos del repositorio; no se detalla la lista completa |
| Licencia | MIT (repositorio); el checkpoint `large-v3-turbo-hy` deriva de un modelo Apache-2.0 |
| Formato de pesos | GGML (`.bin`) para whisper.cpp; no se publican safetensors |

Variantes incluidas en el repositorio:

| Variante | Parametros (aprox.) | Cuantizacion | Notas |
|---|---|---|---|
| `tiny` | 39 M | f16/f32 | OpenAI Whisper, precision completa |
| `base` | 74 M | f16/f32 | OpenAI Whisper, precision completa |
| `small` | 244 M | f16/f32 | OpenAI Whisper, precision completa |
| `medium` | 769 M | f16/f32 | OpenAI Whisper, precision completa |
| `large-v3` | 1550 M | f16/f32 | OpenAI Whisper, precision completa |
| `large-v3-turbo` | 809 M | f16/f32 | OpenAI Whisper, precision completa |
| `tiny-q5_1`, `base-q5_1`, `small-q5_1` | 39 / 74 / 244 M | q5_1 | Cuantizacion de 5 bits |
| `medium-q5_0`, `large-v3-q5_0`, `large-v3-turbo-q5_0` | 769 / 1550 / 809 M | q5_0 | Cuantizacion de 5 bits |
| `large-v3-turbo-hy` | ~809 M | f16/f32 | Ajuste fino en armenio; conserva palabras en ingles y ruso |

Los recuentos de parametros corresponden a los checkpoints de OpenAI Whisper documentados publicamente; la model card del repositorio no los especifica.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que recibe un espectrograma log-Mel de 30 segundos y genera texto de forma autorregresiva. El modelo es multitarea por diseno, ya que la tarea se controla mediante tokens especiales en el decodificador (transcripcion, traduccion al ingles, identificacion de idioma y prediccion de marcas temporales). La variante `large-v3` emplea 128 canales Mel en lugar de los 80 de las versiones anteriores, y `large-v3-turbo` reduce el decodificador a un numero bajo de capas manteniendo el encoder completo, lo que rebaja el coste de inferencia a cambio de una perdida de calidad acotada.

Los pesos de OpenAI se entrenaron con aprendizaje debilmente supervisado sobre un corpus a gran escala de audio extraido de la web, con una porcion relevante de audio no ingles, y sin una fase posterior de RLHF o DPO segun la documentacion publica de Whisper. En este repositorio no hay reentrenamiento: los archivos de OpenAI son copias sin modificar del commit `5359861c739e955e79d9a303bcbc70fb988958b1` de `ggerganov/whisper.cpp`. La unica pieza con entrenamiento adicional es `large-v3-turbo-hy`, un ajuste fino sobre `Chillarmo/whisper-large-v3-turbo-armenian` convertido a GGML; no se detallan en la informacion disponible ni el volumen de datos de ese ajuste ni su composicion, ni si hubo fases de alineacion.

## Capacidades

- Reconocimiento automatico de voz (ASR) multilingue, con deteccion implicita del idioma de entrada.
- Traduccion de voz a texto en ingles (tarea `translate` de Whisper) ademas de transcripcion literal.
- Prediccion de marcas temporales a nivel de segmento y de palabra, util para subtitulado.
- Transcripcion con vocabulario tecnico o nombres propios ajustable mediante prompts iniciales.
- Especializacion en armenio en la variante `large-v3-turbo-hy`, que ademas conserva palabras en ingles y ruso dentro del flujo armenio.
- Ejecucion completamente local sobre CPU o GPU mediante whisper.cpp, sin llamadas a servicios externos.
- Soporte de cuantizacion de 5 bits para reducir huella de memoria y latencia en hardware modesto.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en tiempo real por streaming en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones locales: es el proposito declarado del repositorio a traves de Tetro. El modelo procesa el audio en ventanas de 30 segundos y se ejecuta en la maquina del usuario, de modo que el contenido de la reunion no sale del equipo.
- Subtitulado de video y generacion de ficheros SRT/VTT: las marcas temporales por segmento permiten alinear el texto con la pista de audio sin herramientas adicionales.
- Actas y resumenes de reuniones en pipelines internos: transcribir con `large-v3-turbo-q5_0` y pasar el texto a un LLM posterior para extraer acuerdos y tareas.
- Atencion al cliente con audio en varios idiomas: la naturaleza multilingue permite transcribir llamadas en distintos idiomas con el mismo checkpoint antes de enrutarlas a un sistema de analisis.
- Indexado y busqueda semantica de archivos de audio: transcripcion masiva de un archivo historico con `medium-q5_0` o `small-q5_1` para alimentar un indice de texto buscable.
- Investigacion en ASR para armenio: `large-v3-turbo-hy` sirve como punto de partida o linea base para experimentos de reconocimiento de voz en armenio dentro del ecosistema whisper.cpp.
- Despliegue en hardware sin GPU: las variantes `tiny-q5_1`, `base-q5_1` y `small-q5_1` permiten transcripcion en portatiles y equipos de gama baja, o incluso en dispositivos embebidos compatibles con whisper.cpp.
- Prototipado rapido de aplicaciones de voz: al ser archivos GGML autocontenidos, se pueden integrar en una CLI o en una pequena aplicacion de escritorio sin dependencias de Python ni de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar los archivos incluidos, sus procedencias y sus licencias, sin tablas de WER, MMLU, ni comparaciones cuantitativas contra otros sistemas de reconocimiento de voz. Los resultados de busqueda mencionan otros modelos de STT (Canary, Moonshine, Parakeet, Whisper Large V3 en STT.ai), pero no aportan cifras que puedan atribuirse a este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada en precision completa: aproximadamente 75 MB (tiny), 142 MB (base), 466 MB (small), 1,5 GB (medium), 2,9 GB (large-v3) y en torno a 1,5 GB (large-v3-turbo). Son cifras orientativas del ecosistema whisper.cpp, no declaradas en la model card.
- VRAM/RAM estimada en cuantizacion de 5 bits: del orden de 31 MB (tiny-q5_1), 57 MB (base-q5_1), 181 MB (small-q5_1), 539 MB (medium-q5_0), 1,1 GB (large-v3-q5_0) y 574 MB (large-v3-turbo-q5_0).
- Cabe en GPU de consumo: todas las variantes cuantizadas y la mayoria en f16 caben en tarjetas con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070 o superiores). `large-v3` en f16 requiere del orden de 3 GB solo para pesos, por lo que 6 GB de VRAM o mas es lo recomendable.
- GPU de datacenter: A100, H100 o L40S aportan margen de sobra, aunque el cuello de botella de Whisper suele estar en el encoder y en el numero de hilos de CPU mas que en la VRAM.
- Ejecucion en CPU: es el modo nativo de whisper.cpp y funciona sin GPU; los modelos pequenos y cuantizados son los mas adecuados para este escenario.
- Opciones de despliegue: whisper.cpp (incluye CLI, servidor y bindings), asi como cualquier envoltorio construido sobre el (por ejemplo, interfaces graficas y utilidades de escritorio). Los archivos GGML no son compatibles con vLLM, TGI ni con el formato esperado por Ollama, que trabajan con safetensors o con formatos propios; para esos servidores habria que usar los pesos originales de OpenAI Whisper.
- Aceleracion por hardware soportada por whisper.cpp: CUDA, Metal, Vulkan, OpenCL y otros backends, ademas de CPU con instrucciones SIMD.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Dentro del propio repositorio:

| Modelo | Parametros | Ventana de audio | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| stt-whisper `large-v3` | 1550 M | 30 s | f16, q5_0 | MIT | GGML |
| stt-whisper `large-v3-turbo` | 809 M | 30 s | f16, q5_0 | MIT | GGML |
| stt-whisper `large-v3-turbo-hy` | ~809 M | 30 s | f16 | Apache-2.0 en origen | GGML |
| stt-whisper `medium` | 769 M | 30 s | f16, q5_0 | MIT | GGML |
| stt-whisper `small` | 244 M | 30 s | f16, q5_1 | MIT | GGML |

Frente a alternativas de la misma categoria:

| Alternativa | Parametros | Formato | Licencia | Datos comparativos |
|---|---|---|---|---|
| OpenAI Whisper (original) | Misma familia | safetensors / PyTorch | MIT | No disponibles en la busqueda |
| NVIDIA Canary | no disponible | no disponible | no disponible | No disponibles en la busqueda |
| Moonshine | no disponible | no disponible | no disponible | No disponibles en la busqueda |
| Parakeet | no disponible | no disponible | no disponible | No disponibles en la busqueda |

La busqueda web unicamente confirma que existen comparativas y servicios de terceros que ofrecen Whisper Large V3 (por ejemplo, STT.ai), pero no aporta cifras de rendimiento que permitan una comparacion cuantitativa honesta con este repositorio.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: cualquier limitacion de Whisper se hereda tal cual. No hay mejoras de arquitectura ni de datos propias.
- Riesgo de alucinacion conocido en Whisper, especialmente con silencios prolongados, ruido de fondo o audio musical; puede generar texto plausible que no corresponde al audio.
- Las variantes cuantizadas a q5_0/q5_1 introducen una perdida de precision adicional respecto a f16. Para produccion con requisitos de exactitud altos conviene evaluar primero el impacto.
- El ajuste `large-v3-turbo-hy` se centra en armenio; su comportamiento fuera de ese idioma, mas alla de las palabras en ingles y ruso que conserva segun la model card, no esta documentado.
- La ventana de contexto es de 30 segundos por pasada y no existe memoria entre ventanas; el habla con muchos hablantes solapados o con cambios frecuentes de idioma sigue siendo un escenario fragil.
- La diarizacion de hablantes no es una capacidad del modelo y requeriria un componente externo.
- Licencia: el repositorio declara MIT, pero hay que tener en cuenta que el archivo `large-v3-turbo-hy` procede de un modelo con licencia Apache-2.0. Conviene conservar ambas atribuciones en un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad ni de mantenimiento continuado.
- Los ficheros GGML no son portables a servidores de inferencia que esperan safetensors (vLLM, TGI). Migrar de whisper.cpp a otro runtime implica volver a los pesos originales de OpenAI.
- No hay informacion sobre rendimiento en produccion, latencia, throughput ni consumo energetico dentro de la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Vana-Labs/stt-whisper
- Pesos originales de Whisper en GGML (ggerganov/whisper.cpp): https://huggingface.co/ggerganov/whisper.cpp
- Modelo de origen del ajuste en armenio (Chillarmo/whisper-large-v3-turbo-armenian): https://huggingface.co/Chillarmo/whisper-large-v3-turbo-armenian
- Repositorio de OpenAI Whisper en GitHub: https://github.com/openai/whisper
- Anuncio de Whisper en el blog de OpenAI: https://openai.com/index/whisper/
- Comparativa de modelos STT: https://stt.ai/models/
- Ficha de Whisper Large V3 en STT.ai: https://stt.ai/models/whisper-large-v3/
- Repositorio de ejemplo whisper-stt: https://github.com/rudranaik/whisper-stt
