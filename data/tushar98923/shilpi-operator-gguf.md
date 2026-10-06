# Tushar98923/shilpi-operator-GGUF

## Resumen

Shilpi operator es un ajuste fino del modelo base Qwen3.5-2B, desarrollado por el usuario Tushar98923, que convierte instrucciones en inglés natural sobre Blender, junto con una descripcion compacta de la escena, en llamadas a operadores de Blender (`bpy.ops`). Forma parte del complemento Shilpi, un add-on de IA offline para Blender que descarga y arranca el modelo de forma autonoma mediante llama.cpp, sin necesidad de conexion a internet ni de API externa.

El modelo cuenta con 1.942.653.248 parametros (aproximadamente 1,94 mil millones) y se distribuye unicamente en formato GGUF con cuantizacion q8_0, con un repositorio de 2,1 GB. Esta especializado en una tarea muy concreta: la traduccion de comandos de modelado 3D a una secuencia estructurada de llamadas a operadores, con soporte para 245 operadores reales de `bpy.ops` mas un conjunto de funciones auxiliares propias del add-on (`bai.select`, `bai.set`, `bai.loopcut`, `bai.keyframe`, `bai.frame`, `bai.collection`, `bai.ask` y `bai.decline`).

Su relevancia radica en el salto de rendimiento frente al modelo base sin ajustar: sobre un conjunto de test de 196 comandos no vistos en entrenamiento, verificados ejecutandolos en Blender 5.2.1, este modelo alcanza un 95,9% de acierto frente al 4,6% del Qwen3.5-2B sin ajustar con el mismo prompt. La licencia Apache 2.0 y su tamano reducido lo hacen desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3.5-2B); detalles de capas y atencion no disponibles |
| Parametros totales | 1.942.653.248 (aprox. 1,94 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0 (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ejecutable con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3.5-2B del equipo Qwen y se ajusta mediante LoRA de rango 32 durante 2 epocas sobre 19.912 ejemplos de instrucciones sinteticas. Cada ejemplo empareja un comando en lenguaje natural con la secuencia correspondiente de llamadas a operadores de Blender, y todos ellos fueron verificados ejecutandolos en Blender 5.2.1 antes de incorporarse al conjunto de entrenamiento. No se documenta en la informacion proporcionada la composicion exacta del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

El prompt de sistema define un formato de salida estricto en JSON: `{"calls": [{"op": "<bpy.ops name>", "args": {...}}]}`. El modelo debe operar con el modo de razonamiento desactivado (`enable_thinking: false`). El autor indica que en produccion se emplea decodificacion restringida mediante un esquema JSON de los operadores soportados; sin esa restriccion, el Qwen3.5-2B sin ajustar obtiene un 0% de acierto, mientras que este modelo mantiene el mismo 95,9%, lo que sugiere que el ajuste y la decodificacion restringida actuan de forma complementaria.

## Capacidades

- Traduccion de comandos en ingles natural a llamadas a operadores de Blender en formato JSON.
- Function calling estructurado sobre 245 operadores reales de `bpy.ops`.
- Uso de funciones auxiliares del add-on: `bai.select` (seleccion por nombre), `bai.set` (posicion, rotacion en radianes, escala, nombre, visibilidad y renderizado), `bai.loopcut`, `bai.keyframe`, `bai.frame`, `bai.collection`.
- Gestion de ambiguedad mediante `bai.ask`, que pregunta al usuario cual de dos objetos similares desea modificar.
- Rechazo controlado mediante `bai.decline` ante peticiones que no deberia ejecutar.
- Ejecucion de acciones simples y comandos cortos de dos pasos.
- Integracion con decodificacion restringida (esquema JSON de operadores soportados).
- Inferencia local offline mediante llama.cpp, sin dependencia de servicios externos.
- Idioma unico: ingles. No hay soporte multilingue documentado.

## Casos de uso

- Automatizacion de tareas de modelado en Blender: el usuario describe en lenguaje natural una accion ("anade un bisel al cubo") y el modelo genera la llamada `object.modifier_add` con los argumentos correctos, evitando la navegacion manual por menus.
- Integracion en el add-on Shilpi como motor de comandos offline: al ejecutarse con llama.cpp en la maquina del usuario, no requiere conexion a internet ni envio de datos de la escena a terceros, algo relevante para estudios con material confidencial.
- Construccion de interfaces conversacionales para herramientas 3D: el modelo permite convertir un panel de chat dentro de Blender en un mecanismo de control directo sobre la escena, con respuestas verificables en forma de operadores ejecutables.
- Pipelines de automatizacion de escenas: al devolver JSON con operadores y argumentos, la salida puede encadenarse en scripts de Python que aplican transformaciones repetitivas sobre multiples objetos.
- Asistencia a usuarios noveles: el modelo traduce la intencion del usuario a la API correcta de Blender, reduciendo la curva de aprendizaje de `bpy.ops` para quienes no conocen los nombres exactos de los operadores.
- Desambiguacion interactiva en escenas complejas: mediante `bai.ask`, el modelo puede detener la ejecucion y preguntar al usuario cual de dos objetos con nombres similares debe modificar, evitando cambios no deseados.
- Despliegue en equipos sin GPU dedicada: al estar cuantizado en q8_0 y ocupar unos 2 GB, puede ejecutarse en CPU mediante llama.cpp en estaciones de trabajo convencionales.

## Benchmarks y rendimiento

Conjunto de evaluacion: 196 comandos no vistos en entrenamiento, ejecutados en Blender 5.2.1 y comprobados contra el resultado esperado.

| Modelo | Precision en el conjunto de test |
|---|---|
| Shilpi operator (este modelo) | 95,9% |
| Qwen3.5-2B sin ajustar, mismo prompt | 4,6% |
| DeepSeek V4 Pro, mismo prompt | 12,8% |
| DeepSeek V4 Pro, mismo prompt mas nombres de argumentos | 83,2% |

Nota del autor: los modelos locales emplean decodificacion restringida con un esquema JSON de los operadores soportados. Sin ella, el Qwen3.5-2B sin ajustar obtiene un 0% y este modelo mantiene el mismo 95,9%. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 2 GB para la cuantizacion q8_0 publicada (el repositorio completo ocupa 2,1 GB).
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de memoria, como una GTX 1650, RTX 3050, RTX 4060 o superiores.
- Ejecucion en CPU: viable con llama.cpp, dado el tamano reducido del modelo y la cuantizacion q8_0.
- GPU recomendadas para despliegue con mayor margen: RTX 3060/4090, A100 o H100, aunque estan sobredimensionadas para un modelo de 1,94 mil millones de parametros.
- Opciones de despliegue: llama.cpp (mencionado explicitamente por el autor); el resto de entornos (vLLM, Ollama, TGI) no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shilpi operator (GGUF q8_0) | 1,94 mil millones | No disponible | 95,9% | Apache 2.0 | HuggingFace, formato GGUF |
| Qwen3.5-2B sin ajustar | 1,94 mil millones (modelo base) | No disponible | 4,6% con el mismo prompt | Apache 2.0 | HuggingFace |
| DeepSeek V4 Pro | No disponible | No disponible | 12,8% (83,2% con nombres de argumentos) | No disponible | No disponible |

La comparacion se limita a los modelos incluidos por el autor en su evaluacion. No se dispone de datos de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance funcional restringido: solo maneja acciones simples y comandos cortos de dos pasos; no esta disenado para secuencias largas o flujos complejos.
- Idioma unico: solo entiende ingles; no hay soporte multilingue documentado.
- Version concreta de Blender: el modelo esta entrenado sobre Blender 5.2; su comportamiento en otras versiones no esta verificado.
- Sensibilidad al nombre de los objetos: el autor indica que a veces rechaza la peticion cuando la palabra del usuario no coincide con el nombre real del objeto (por ejemplo, "donut" para un objeto llamado Torus).
- Olvidos de seleccion: en ocasiones no selecciona el objeto antes de aplicar la operacion, lo que puede provocar que la accion no tenga efecto.
- Dependencia de decodificacion restringida: en el entorno de produccion se emplea un esquema JSON de operadores soportados; fuera de ese esquema, el comportamiento puede degradarse.
- Modo de razonamiento desactivado obligatorio: el modelo debe usarse con `enable_thinking: false`; no se documenta su comportamiento con el razonamiento activado.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion de operadores o argumentos: no se cuantifica en la model card; la verificacion contra Blender 5.2.1 en el conjunto de test reduce, pero no elimina, este riesgo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se apoya en el add-on Shilpi, cuyas condiciones de uso no se detallan en la informacion disponible.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin senales externas de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tushar98923/shilpi-operator-GGUF
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del complemento Shilpi: mencionado en la model card, URL no disponible en la informacion proporcionada
- Paper o documentacion tecnica adicional: no disponible
