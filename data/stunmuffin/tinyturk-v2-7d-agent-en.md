# stunmuffin/tinyturk-v2.7d-agent-en

## Resumen

TinyTurk v2.7d Agent EN es un modelo de lenguaje diminuto de 1.121.920 parametros (aproximadamente 1,1 M) desarrollado por el usuario stunmuffin. Se trata de un transformer decoder-only de estilo GPT disenado exclusivamente para una tarea de clasificacion de intenciones: convertir lenguaje natural en ingles (por ejemplo, "turn up the volume") en una etiqueta de comando estructurada (por ejemplo, "volume up") que puede ejecutarse localmente en el sistema operativo. El modelo forma parte de la serie TinyTurk y se presenta como una pieza educativa y experimental.

El modelo se afina a partir de tinyturk-v2.7d-tinystories-en, un modelo de la misma arquitectura entrenado sobre TinyStories en ingles (val loss 1.3349). La relevancia del proyecto es fundamentalmente conceptual: el autor demuestra que una arquitectura de 1 M de parametros, que rinde cerca del azar en tareas de conocimiento (TurkishMMLU) y de sintaxis abstracta (BLiMP), alcanza un 100% de acierto en una tarea formal y estrecha de mapeo de comandos. La conclusion declarada es que la eleccion de tarea importa mas que el tamano del modelo.

El modelo soporta entrada de texto y de voz, en cuyo caso se empareja con OpenAI Whisper (variante small) para la transcripcion. Toda la inferencia se ejecuta en local, sin APIs externas. El contexto es de solo 64 tokens, el vocabulario de 512 tokens BPE (SentencePiece) y la licencia Apache 2.0. La fecha de creacion del repositorio es octubre de 2026 y, en el momento de redactar esta ficha, cuenta con 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (clasificacion de intenciones) |
| Parametros totales | 1.121.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch binario (`pytorch_model.bin`); tokenizador SentencePiece (`tokenizer_en_bpe_512.model`) |

Especificaciones internas adicionales:

| Componente | Valor |
|---|---|
| Tokenizador | BPE de 512 tokens (SentencePiece, ingles) |
| Dimension de embedding | 128 |
| Capas | 4 |
| Cabezas de atencion | 4 |
| FFN | 128 -> 512 -> 128 |
| Micro-FFN | 128 -> 256 -> 128 (gated, gate = 0.75) |
| Codificacion posicional | RoPE |
| Normalizacion | RMSNorm |
| Tamano del repo | 0.0 GB |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT con decodificacion autoregresiva. Usa RMSNorm en lugar de LayerNorm, RoPE (rotary position embeddings) para la codificacion posicional y una FFN convencional de 128 a 512 y de vuelta a 128, complementada por una "micro-FFN" de 128 a 256 a 128 con compuerta (gate = 0.75). El vocabulario es muy reducido (512 tokens BPE entrenados con SentencePiece sobre ingles) y el contexto maximo es de 64 tokens, coherente con el formato de prompt `command: <input> output: <label>`.

El entrenamiento parte del modelo base tinyturk-v2.7d-tinystories-en (val loss 1.3349) y se afina sobre 298 ejemplos en ingles generados sinteticamente: 237 de entrenamiento, 37 de validacion y 24 de prueba. El conjunto cubre 16 comandos mas la etiqueta `unknown`. Se entrenaron 50 epocas con batch size 16, alcanzando una mejor val loss de 0.5495 en aproximadamente 5 minutos sobre una GTX 1080 Ti. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

Un detalle tecnico relevante documentado por el autor es el equilibrio del dataset: una version previa tenia clases muy desbalanceadas (`open cmd` con 64 ejemplos frente a `lock` con 6), lo que provocaba que el modelo cayera en la clase mayoritaria ante entradas ambiguas (por ejemplo, "turn up the volume" producia `volume_down`). El problema se corrigio limitando cada comando a un maximo de 30 ejemplos. No se documentan innovaciones como decodificacion especulativa ni atencion lineal.

## Capacidades

- Mapeo de lenguaje natural a comando estructurado en ingles, con un conjunto cerrado de 16 comandos mas la clase `unknown`.
- Generacion de texto en formato `command: <input> output: <label>` mediante decodificacion autoregresiva con `argmax` sobre los logits del ultimo token.
- Entrada de voz cuando se combina con OpenAI Whisper (small, ingles) en un pipeline local: microfono -> Whisper -> modelo -> accion.
- Rechazo de entradas fuera de dominio: en las pruebas de voz, 2 de 2 comandos fuera de dominio se clasificaron correctamente como `unknown`.
- Ejecucion local en CPU o GPU, sin dependencia de APIs externas.
- Capacidades de conocimiento general, sintaxis abstracta y razonamiento: cerca del azar (documentado explicitamente por el autor).
- No soporta tool calling ni function calling en el sentido general.
- No soporta agentes multi-paso ni planificacion: es estrictamente de un solo turno.
- No soporta paso de parametros a los comandos.
- Multilingue: no, unicamente ingles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio nativo: no; el audio se gestiona con un componente externo (Whisper).

Conjunto de comandos soportado:

| Entrada de ejemplo | Etiqueta de salida | Accion |
|---|---|---|
| open cmd / launch terminal | open cmd | start cmd.exe |
| open notepad | open notepad | start notepad.exe |
| start calculator | open calc | start calc.exe |
| open browser | open browser | start chrome |
| show file explorer | open explorer | start explorer.exe |
| open paint | open paint | start mspaint.exe |
| open task manager | open taskmgr | start taskmgr.exe |
| turn up the volume | volume up | volume + |
| turn down the volume | volume down | volume - |
| mute the sound | volume mute | mute |
| shut down the computer | shutdown | shutdown /s |
| restart the pc | restart | shutdown /r |
| lock the screen | lock | LockWorkStation |
| take a screenshot | screenshot | (placeholder) |
| show desktop | show desktop | Win+D |
| put computer to sleep | sleep | suspend |
| hello / apple / qwerty | unknown | no hacer nada |

## Casos de uso

- Control por voz de escritorio en local: con el pipeline microfono -> Whisper (small) -> TinyTurk, se pueden ejecutar comandos como "open notepad" o "volume up" sin enviar audio a la nube. Es adecuado porque todo el pipeline corre en la maquina del usuario y el modelo resuelve la clasificacion en un espacio cerrado de 16 etiquetas.
- Automatizacion de accesos rapidos en Windows: el modelo mapea frases coloquiales ("show file explorer", "start calculator") a programas concretos (explorer.exe, calc.exe), lo que permite montar un lanzador por lenguaje natural sobre scripts de despliegue.
- Accesibilidad para usuarios con movilidad reducida: al aceptar entrada de voz y ejecutar acciones del sistema, puede servir como capa de control basica en un entorno domestico o de oficina, siempre con confirmacion del usuario para comandos destructivos.
- Demostracion educativa de ajuste fino: con solo 237 ejemplos de entrenamiento y 5 minutos en una GTX 1080 Ti, es un caso practico para ensenar el ciclo completo de afinar un transformer pequeno y evaluar el equilibrio de clases.
- Prototipado de interfaces de intencion (intent classification): sirve como referencia de como estructurar un dataset etiquetado con clases acotadas y medir el impacto del desbalanceo de clases en modelos muy pequenos.
- Prueba de concepto de asistentes embebidos: con 1,1 M de parametros, el modelo cabe en dispositivos con recursos muy limitados, lo que permite validar arquitecturas de control por comandos en hardware de gama baja antes de escalar a modelos mayores.
- Filtro de rechazo fuera de dominio: la clase `unknown` permite descartar entradas irrelevantes antes de pasarlas a un sistema mayor, lo que es util como primera etapa de un pipeline de clasificacion de intenciones.

## Benchmarks y rendimiento

Datos publicados por el autor:

| Tarea | Resultado |
|---|---|
| TurkishMMLU (conocimiento) | cerca del azar |
| BLiMP (sintaxis abstracta) | cerca del azar |
| Command agent, texto (22 entradas) | 22/22 (100%) |
| Command agent, voz (20 comandos, Whisper small) | 18/18 comandos validos correctos; 2/2 fuera de dominio rechazados correctamente |

Metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss del modelo base (TinyStories EN) | 1.3349 |
| Mejor val loss tras el ajuste | 0.5495 |
| Epocas | 50 |
| Batch size | 16 |
| Tamano del conjunto de datos | 298 ejemplos (237 train / 37 val / 24 test) |
| Tiempo de entrenamiento | ~5 minutos en GTX 1080 Ti |

No se han publicado comparaciones con otros modelos en benchmarks estandar adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 MB en fp32 (1.121.920 parametros x 4 bytes) y aproximadamente 1,1 MB en int8. El consumo real lo dominan el runtime de PyTorch y el tokenizador, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1080 Ti, RTX 3060, RTX 4090, A100 o H100. El modelo es tan pequeno que la GPU no es un cuello de botella.
- Cabe holgadamente en GPU de consumo, en CPU de escritorio e incluso en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: al ser un modelo PyTorch puro con tokenizador SentencePiece, la via documentada es cargar `pytorch_model.bin` y el tokenizador en Python. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ni versiones GGUF.
- Para el modo voz se requiere ademas OpenAI Whisper (variante small, ingles). El autor indica que, sin un `initial_prompt` con ejemplos de comandos en ingles, Whisper produce ruido en clips de 4 segundos.
- Latencia y throughput: no disponible. El autor unicamente reporta el tiempo de entrenamiento (~5 minutos en GTX 1080 Ti).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyTurk v2.7d Agent EN | 1.121.920 | 64 | Clasificacion de comandos (16 + unknown) | Apache 2.0 | HuggingFace |
| TinyTurk v2.7d TinyStories EN (modelo base) | Misma arquitectura de ~1,1 M | 64 | Generacion de texto en ingles (TinyStories) | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas externas a la serie TinyTurk.

## Limitaciones y advertencias

- Cobertura funcional muy reducida: unicamente 16 comandos mas la etiqueta `unknown`.
- Operacion de un solo turno: no mantiene estado conversacional ni planifica varios pasos.
- Sin paso de parametros: los comandos no admiten argumentos (por ejemplo, no se puede indicar un nivel concreto de volumen).
- El umbral de confianza no es util: el autor advierte que el modelo muestra confianza muy alta en todas las entradas (rango 0,88-1,00 tanto en comandos validos como en `unknown`), un artefacto de aprendizaje por transferencia. Recomienda usar unicamente coincidencia por prefijo (prefix matching) y no un umbral de confianza.
- La salida generada puede contener ruido: en el ejemplo de la model card, la secuencia decodificada es `volume upen cmdownetic`, de la que hay que extraer la etiqueta por coincidencia de prefijo.
- Rendimiento cercano al azar en conocimiento general (TurkishMMLU) y sintaxis abstracta (BLiMP): no es apto para tareas de conocimiento, razonamiento ni generacion abierta.
- Solo ingles. No hay soporte multilingue.
- Riesgo de alucinacion: la model card no documenta un analisis especifico de alucinacion, pero el propio autor senala que Whisper alucina relleno en clips cortos sin un `initial_prompt` adecuado, lo que puede introducir entradas erroneas en el pipeline.
- Idoneidad para produccion: el autor desaconseja ejecutar comandos destructivos sin proteccion. En el script de despliegue, los comandos `shutdown`, `restart`, `lock` y `sleep` estan desactivados. Sus recomendaciones son exigir confirmacion del usuario, registrar cada accion y no ejecutar nunca como administrador.
- El comando `screenshot` es un placeholder: no tiene accion real implementada segun la tabla de comandos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo es de caracter educativo y experimental; el repositorio no registra descargas en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stunmuffin/tinyturk-v2.7d-agent-en
- Modelo base (TinyStories EN): https://huggingface.co/stunmuffin/tinyturk-v2.7d-tinystories-en
- Repositorio de GitHub con `voice_agent_en.py`: referenciado en la model card, URL no disponible
- Paper, blog o demo adicionales: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el proyecto y se omiten.
