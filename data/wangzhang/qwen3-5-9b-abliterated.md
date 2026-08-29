# wangzhang/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es un modelo de lenguaje de 9.400 millones de parametros, derivado de Qwen/Qwen3.5-9B mediante una tecnica de ablacion de rechazos llamada Abliterix. El autor, Wangzhang Wu, ha modificado el modelo base para eliminar el comportamiento de rechazo a peticiones consideradas peligrosas o inapropiadas, manteniendo en lo posible las capacidades originales del modelo. El resultado es un modelo con una tasa de rechazo del 1% (2 de 200 prompts de prueba) y una divergencia KL de 0.0105 respecto al modelo original.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" para casos de uso donde el rechazo del modelo base interfiere con tareas legitimas, como investigacion academica sobre seguridad de IA, generacion de contenido creativo sin restricciones o analisis de textos sensibles. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion, aunque con las advertencias habituales sobre el debilitamiento de los mecanismos de seguridad.

El proceso de ablacion se realizo mediante una combinacion de extraccion de direcciones de rechazo por capas, proyeccion ortogonal para aislar la senal de rechazo, modificaciones LoRA de rango 1 en pesos de atencion y MLP, y optimizacion bayesiana con Optuna TPE para encontrar el equilibrio optimo entre baja tasa de rechazo y baja divergencia KL. El resultado es un modelo que conserva la arquitectura original de Qwen3.5-9B pero con un comportamiento de rechazo significativamente reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B (hybrid attention con GatedDeltaNet segun la informacion disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer con atencion hibrida que combina mecanismos de atencion tradicionales con GatedDeltaNet, segun se menciona en la informacion disponible. El proceso de ablacion no modifica la arquitectura base, sino que interviene en el espacio de representaciones internas para eliminar el comportamiento de rechazo.

Abliterix funciona en cuatro fases: primero extrae direcciones de rechazo por capa usando 800 prompts daninos y 800 benignos; segundo, aplica una proyeccion ortogonal para aislar la senal de rechazo, reduciendo los rechazos en un 67% frente a la ablacion directa; tercero, aplica modificaciones LoRA de rango 1 a los pesos de atencion y MLP, que se capturan como adaptadores ligeros en lugar de ediciones destructivas; cuarto, usa optimizacion bayesiana con Optuna TPE durante 50 iteraciones para ajustar la forma del kernel, el indice fraccional de direccion y la fuerza por componente, buscando el equilibrio Pareto-optimo entre bajos rechazos y baja divergencia KL.

El resultado es un modelo con una tasa de rechazo del 1% y una divergencia KL de 0.0105 respecto al original, lo que indica que las capacidades generales se mantienen en gran medida. No se dispone de informacion sobre el dataset de entrenamiento adicional ni sobre el proceso de fine-tuning posterior a la ablacion.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con soporte para chat multi-turno mediante plantillas de chat.
- Razonamiento y respuesta a preguntas, con la capacidad de desactivar el modo de pensamiento mediante el parametro `enable_thinking=False` en la generacion.
- Capacidad de responder a practicamente cualquier tipo de peticion, incluyendo aquellas que el modelo base rechazaria, gracias a la ablacion de rechazos.
- Mantenimiento de las capacidades del modelo base Qwen3.5-9B, incluyendo las que se derivan de su arquitectura hibrida con GatedDeltaNet.
- No se ha confirmado soporte para tool calling, function calling, agentes, vision o audio en la informacion disponible.
- Capacidades multilingues no especificadas, aunque hereda las del modelo base Qwen3.5-9B.

## Casos de uso

- Investigacion academica sobre seguridad y alineacion de IA: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, lo que resulta util para analizar como funcionan los sistemas de seguridad y que ocurre cuando se eliminan. Se usaria en entornos sandbox con prompts controlados y supervisados.
- Generacion de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para explorar temas controvertidos o explicitos sin que el modelo se niegue a responder, como narrativa de terror, ficcion especulativa o dialogos con personajes moralmente ambiguos.
- Analisis de textos sensibles: investigadores en ciencias sociales o periodismo pueden usar el modelo para analizar discursos de odio, propaganda o contenido extremista, ya que el modelo no rechazara procesar este tipo de material.
- Desarrollo de personajes para videojuegos o roleplay: el modelo puede generar dialogos para personajes con personalidades oscuras, villanos o figuras historicas controversiales sin censura, lo que resulta util para guionistas y disenadores de juegos.
- Evaluacion de tecnicas de ablacion: el modelo sirve como punto de comparacion para otros modelos ablacionados, permitiendo a investigadores evaluar la efectividad de diferentes metodos de eliminacion de rechazos.
- Pruebas de robustez de sistemas de moderacion: equipos de seguridad pueden usar el modelo para probar filtros de contenido y sistemas de moderacion, verificando si sus soluciones detectan correctamente contenido generado por un modelo sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son:

| Metrica | Valor |
|---|---|
| Tasa de rechazo | 2/200 (1%) |
| Divergencia KL | 0.0105 |
| Iteraciones de optimizacion | 50 |

La divergencia KL de 0.0105 respecto al modelo base sugiere que las capacidades generales se mantienen en gran medida, pero no hay datos cuantitativos sobre rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.400 millones de parametros en precision FP16, se necesitan aproximadamente 18,8 GB de VRAM. Con cuantizacion INT8 se reduciria a unos 9,4 GB, y con INT4 a unos 4,7 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en FP16. Para cuantizacion INT4, una RTX 4060 Ti (16 GB) o incluso una RTX 3060 (12 GB) podrian ser suficientes.
- Si cabe en consumer GPU: si, en GPUs de consumo con 16 GB o mas de VRAM usando cuantizacion. En FP16 puro se necesita una GPU de 24 GB.
- Opciones de despliegue: el modelo se puede ejecutar con transformers de HuggingFace, vLLM, llama.cpp, Ollama o TGI. La integracion con Ollama esta disponible a traves de la variante `huihui_ai/qwen3.5-abliterated`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tasa de rechazo | Divergencia KL | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B-abliterated (este) | 9,4B | 1% | 0.0105 | Apache 2.0 |
| Qwen3.5-35B-A3B-abliterated | 35B (3B activos) | 1,5% | 0.0035 | Apache 2.0 |
| Qwen3.5-27B-abliterated | 27B | 1,5% | 0.0051 | Apache 2.0 |
| Qwen3.5-4B-abliterated | 4B | 1,5% | 0.0065 | Apache 2.0 |

Todos los modelos de la familia Abliterix comparten la misma metodologia y licencia. La version de 9B ofrece el mejor equilibrio entre tamano y tasa de rechazo, aunque la version de 35B-A3B presenta una divergencia KL menor. La version de 0.8B alcanza una tasa de rechazo del 0% pero con un modelo mucho mas pequeno.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de sus mecanismos de rechazo, lo que significa que puede generar contenido inapropiado, ofensivo, explicito, peligroso o ilegal sin restricciones.
- No se ha verificado que las capacidades generales se mantengan intactas tras la ablacion; la divergencia KL de 0.0105 indica cambios en el comportamiento, pero no se han publicado benchmarks de rendimiento.
- El modelo puede alucinar o producir informacion incorrecta, especialmente en temas delicados donde el modelo base habria rechazado responder.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que los usuarios son responsables del cumplimiento legal y regulatorio en su jurisdiccion.
- No se recomienda su uso en produccion sin un sistema de moderacion de contenido aguas abajo, filtros de salida y supervision humana.
- El modelo es experimental y se distribuye para investigacion y evaluacion, no para uso en decisiones de alto riesgo (medicas, legales, financieras, de seguridad).
- No se dispone de informacion sobre sesgos especificos del modelo, aunque hereda los del modelo base Qwen3.5-9B.
- La longitud de contexto, los idiomas soportados y las capacidades de tool calling no estan documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Framework Abliterix: https://github.com/wuwangzhang1216/abliterix
- Paquete PyPI: https://pypi.org/project/abliterix-llm/
- Variante en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated
- API de inferencia FriendliAI: https://friendli.ai/models/wangzhang/Qwen3.5-9B-abliterated
