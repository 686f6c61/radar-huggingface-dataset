# Vickyinmyheart824/EgoCaptioner

## Resumen

EgoCaptioner es un modelo de generacion de descripciones (captioning) de video en primera persona, es decir, video egocentrico capturado desde el punto de vista del usuario que lleva la camara. Lo desarrolla el autor Vickyinmyheart824 y se publica como un fine-tune del modelo multimodal Qwen3.5-9B. El modelo resuelve el problema de describir de forma estructurada y detallada una secuencia de video: genera un resumen a nivel de video que establece la escena y la actividad del portador de la camara, y a continuacion una serie de pasos con marcas temporales que detallan como se desarrolla la actividad, incluyendo manipulacion de objetos, locomocion, interaccion social y atencion visual.

La relevancia actual del modelo radica en su enfoque especifico hacia el video egocentrico, un dominio con aplicaciones crecientes en asistentes personales, robotica asistencial y analisis de actividades de la vida diaria. A diferencia de los captioners genericos, EgoCaptioner se entrena con supervision coarse-to-fine y aprendizaje por refuerzo orientado a contenido factografico, alineacion temporal y estilo de la descripcion. Con 9.409.813.744 parametros y licencia Apache 2.0, se posiciona como una opcion abierta para tareas de comprension de video en primera persona.

El modelo se distribuye en formato safetensors bajo la libreria transformers, con un tamano de repositorio de 18,8 GB, y esta etiquetado como compatible con endpoints. Su pipeline es image-text-to-text, lo que permite procesar tanto imagenes como secuencias de video junto con instrucciones textuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EgoCaptioner se construye como un fine-tune del modelo base Qwen3.5-9B, un transformer multimodal de aproximadamente 9.400 millones de parametros. La arquitectura hereda del modelo base la capacidad de procesar entradas de imagen y video junto con texto, y se especializa mediante ajuste fino en la tarea de captioning de video egocentrico. El pipeline declarado es image-text-to-text, lo que indica que el modelo acepta secuencias visuales y genera texto descriptivo condicionado por instrucciones.

El entrenamiento combina supervision coarse-to-fine, es decir, un esquema progresivo que va de descripciones globales a detalles finos, con aprendizaje por refuerzo disenado para mejorar tres aspectos: el contenido factografico (que lo descrito sea veridico), la alineacion temporal (que los pasos con marcas de tiempo correspondan al momento real del video) y el estilo de la descripcion. La model card menciona un diseno de recompensa especifico para el aprendizaje por refuerzo, aunque no se detallan el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del proceso. No se dispone de informacion sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de descripciones de video en primera persona con estructura jerarquica: un resumen a nivel de video y pasos detallados con marcas temporales.
- Descripcion de manipulacion de objetos, locomocion, interaccion social y atencion visual del portador de la camara.
- Comprension de video egocentrico como dominio especializado, incluyendo secuencias de actividades de la vida diaria.
- Procesamiento multimodal image-text-to-text: acepta imagenes y video junto con instrucciones textuales.
- Generacion de texto conversacional orientada a la descripcion de contenido visual.
- Capacidad de alineacion temporal de los eventos descritos con marcas de tiempo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, vision o audio especial: no disponible (la vision es parte del pipeline base, pero no se documentan modos especiales).

## Casos de uso

- Asistentes personales para personas con discapacidad visual: el modelo puede describir en tiempo real lo que el usuario esta haciendo y lo que ocurre a su alrededor a partir de video egocentrico, generando un resumen de la escena y pasos detallados con marcas temporales que facilitan la orientacion y la comprension del entorno.
- Analisis de actividades de la vida diaria (ADL) en entornos clinicos o de cuidado: a partir de grabaciones en primera persona de tareas como cocinar, vestirse o tomar medicacion, el modelo produce descripciones estructuradas que permiten a cuidadores o sistemas automatizados evaluar la ejecucion de la tarea y detectar desviaciones.
- Anotacion automatica de datasets de video egocentrico: el modelo puede generar captions coarse-to-fine que sirvan como preanotacion para conjuntos de datos de investigacion en vision egocentrica, reduciendo el coste de etiquetado manual y mejorando la alineacion temporal de los eventos.
- Robotica asistencial y aprendizaje por imitacion: las descripciones detalladas de manipulacion de objetos y locomocion pueden emplearse para extraer secuencias de acciones que alimenten politicas de robotica o sistemas de aprendizaje por demostracion a partir de video en primera persona.
- Supervision de procedimientos en industria o formacion: en tareas de mantenimiento o formacion tecnica grabadas desde la perspectiva del operario, el modelo puede generar un registro paso a paso con marcas temporales que sirva como documentacion automatica del procedimiento ejecutado.
- Analisis de interaccion social en estudios de conducta: el modelo describe interacciones sociales y atencion visual del portador, lo que permite a investigadores analizar patrones de comportamiento social en entornos naturales a partir de video egocentrico.
- Indexacion y busqueda semantica de archivos de video personal: las descripciones generadas con marcas temporales permiten construir indices textuales de grabaciones en primera persona, facilitando la busqueda de momentos concretos por contenido descrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamano del modelo (9.400 millones de parametros), en precision completa (FP16/BF16) se requeririan aproximadamente 18-19 GB de VRAM solo para los pesos, mas el coste del procesador visual y del contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo encaja en GPU de clase profesional como A100 (40/80 GB) o H100, y previsiblemente en GPUs de consumo de gama alta con 24 GB o mas si se aplica cuantizacion.
- Capacidad en GPU de consumo: no confirmado. El repositorio ocupa 18,8 GB en safetensors, por lo que en BF16 no cabria en GPUs de 16 GB sin cuantizacion; con cuantizacion de 8 o 4 bits podria caber en GPUs de 16-24 GB, aunque no se documentan los tipos de cuantizacion soportados.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles segun los tags. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos disponibles del modelo y del base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EgoCaptioner | 9.409.813.744 | no disponible | apache-2.0 | Captioning de video egocentrico |
| Qwen3.5-9B (base) | ~9.000 millones (segun denominacion) | no disponible | no disponible en esta ficha | Modelo multimodal general |
| Alternativas de captioning de video | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base general, puede heredar sesgos presentes en los datos de entrenamiento de Qwen3.5-9B.
- Riesgo de alucinacion: el modelo genera descripciones en lenguaje natural y, pese al entrenamiento por refuerzo orientado a contenido factografico, puede describir objetos, acciones o interacciones no presentes en el video.
- Limitaciones de idioma: los metadatos indican soporte unicamente de ingles, por lo que las descripciones en castellano no estan garantizadas.
- Limitaciones de contexto: no se documenta la longitud maxima de contexto ni el numero maximo de frames o duracion de video soportada.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en esta ficha.
- Caveats para produccion: no se han publicado benchmarks, latencias ni requisitos de hardware oficiales; el modelo tiene un numero reducido de descargas (241) y likes (4), lo que sugiere una validacion comunitaria limitada. La documentacion remite al repositorio de GitHub para instalacion y uso, sin detallar el proceso en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vickyinmyheart824/EgoCaptioner
- Repositorio GitHub: https://github.com/cactusqq/EgoCaptioner
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
