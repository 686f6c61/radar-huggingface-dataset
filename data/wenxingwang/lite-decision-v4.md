# wenxingwang/lite-decision-v4

## Resumen

Lite decision body (identificador `wenxingwang/lite-decision-v4`) es un ajuste fino de tipo *decision model* publicado por el usuario wenxingwang, construido sobre el modelo base Qwen/Qwen3.5-0.8B y vinculado al denominado "Zils d3-lite soup pool" y al proyecto vllm-sr/d3-lite. Se trata de un modelo de aproximadamente 853 millones de parametros (852.985.920 segun los pesos en safetensors) empaquetado en un repositorio de 1,7 GB, lo que sugiere pesos en precision bf16 o fp16 sin cuantizar.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y cuya model card es extremadamente escueta (apenas cuatro lineas utiles). El autor no documenta arquitectura mas alla de la herencia del modelo base, ni datos de entrenamiento, ni idiomas, ni resultados de evaluacion. La etiqueta "decision model" y la pertenencia a un "soup pool" (mezcla de modelos) apuntan a un uso como componente de enrutamiento o seleccion dentro de un pipeline mayor, no como modelo conversacional generalista.

Por tanto, esta ficha debe leerse como una descripcion de lo que se puede verificar objetivamente (parametros, licencia, formato, modelo base) y como una enumeracion explicita de todo lo que el autor no ha hecho publico. Cualquier evaluacion de calidad, capacidades reales o rendimiento queda pendiente de validacion empirica por parte de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-0.8B; el autor no especifica variantes) |
| Parametros totales | 852.985.920 (aprox. 853 M) |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio con pesos safetensors, 1,7 GB, compatible en principio con cuantizacion a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor no publica detalles de arquitectura. Lo unico verificable es que el modelo deriva de Qwen/Qwen3.5-0.8B mediante ajuste fino (etiqueta `base_model:finetune`), y que se enmarca en el "Zils d3-lite soup pool" con referencia al proyecto vllm-sr/d3-lite. El termino "soup" en la practica habitual de la comunidad hace referencia a *model souping* o mezcla de pesos de varios ajustes finos del mismo modelo base, pero no se aporta ninguna confirmacion, receta de mezcla ni hiperparametros.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO, SFT u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas propias (atencion lineal, decodificacion especulativa, modos de razonamiento). Cualquier afirmacion sobre estos puntos seria especulativa y, por tanto, se omite.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-0.8B, sin garantia documentada por el autor.
- Razonamiento y clasificacion: el nombre "decision model" sugiere uso para tareas de decision o enrutamiento, aunque no se especifica el formato de entrada/salida ni el esquema de etiquetas.
- Tool calling / function calling: no disponible en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el autor no declara idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Integracion con vLLM: mencion implicita por la referencia a vllm-sr/d3-lite, sin instrucciones ni configuracion publicada.

## Casos de uso

- Enrutamiento de peticiones en pipelines LLM: un modelo de 853 M parametros puede actuar como clasificador ligero que decida a que modelo mayor derivar cada consulta, reduciendo coste frente a usar un modelo grande para la decision. La idoneidad depende de validar su precision en el dominio concreto, ya que el autor no publica metricas.
- Clasificacion binaria o multiclase de baja latencia: por su tamano, cabe en CPU o en GPU consumer y puede ejecutarse en milisegundos por peticion; util para filtros de contenido, triaje de tickets o etiquetado masivo.
- Componente de un *soup pool* experimental: investigadores que trabajen con mezcla de modelos pueden usar estos pesos como uno de los candidatos del conjunto, siempre que verifiquen la procedencia y la receta de mezcla por su cuenta.
- Prototipado rapido en entornos con recursos limitados: el repositorio de 1,7 GB se carga en una unica GPU de 8-12 GB o incluso en CPU con cuantizacion a 4 bits, lo que facilita experimentos sin infraestructura dedicada.
- Evaluacion comparativa de ajustes finos sobre Qwen3.5-0.8B: sirve como punto de referencia para medir el efecto de un finetune adicional frente al modelo base en tareas de decision.
- Filtrado previo en sistemas RAG: un modelo pequeno puede decidir si una consulta requiere recuperacion documental antes de invocar el modelo generador, ahorrando tokens y latencia.
- Educacion y divulgacion: ejemplo practico de publicacion de un finetune con licencia permisiva para estudiar el formato de model cards y la trazabilidad de modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,7-2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 1 GB para pesos; en 4 bits, aproximadamente 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); tambien cabe en GPUs de datacenter (A100, H100) aunque resultan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU con llama.cpp u Ollama.
- Opciones de despliegue: vLLM (mencionado indirectamente por la referencia a vllm-sr/d3-lite), llama.cpp, Ollama y TGI son opciones plausibles dado el formato safetensors, aunque el autor no publica configuraciones ni recetas de conversion.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera una latencia por debajo de 10 ms por token en GPU consumer, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wenxingwang/lite-decision-v4 | 853 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune de Qwen3.5-0.8B, sin benchmarks |
| Qwen/Qwen3.5-0.8B | aprox. 0,8 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base del anterior; referencia directa |
| Otros finetunes de Qwen3.5-0.8B | aprox. 0,8 B | variable | variable | Hugging Face | No se dispone de datos concretos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos de entrenamiento, objetivos, formato de etiquetas ni metricas, lo que impide evaluar su idoneidad para produccion.
- Riesgo de alucinacion y comportamiento impredecible: al ser un finetune sin evaluacion publicada, no hay garantia de que sus salidas sean fiables fuera del dominio para el que fue ajustado.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible identificar sesgos de genero, idioma, cultura o dominio.
- Idiomas no declarados: no se puede asumir soporte multilingue; probablemente herede el del modelo base, pero no esta confirmado.
- Contexto no declarado: se desconoce la ventana efectiva tras el ajuste fino; no debe asumirse la del modelo base sin verificar.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE para creditos upstream; es responsabilidad del usuario revisar las obligaciones de atribucion del modelo base Qwen.
- Cero traccion comunitaria (0 descargas, 0 likes): no hay evidencia de uso en produccion ni de validacion independiente.
- Fecha de creacion futura en los metadatos (2026-11-16): conviene verificar la integridad del repositorio antes de confiar en el.
- Referencia a "soup pool": si los pesos proceden de una mezcla, la trazabilidad de cada componente no esta documentada, lo que complica auditorias.

## Enlaces

- Hugging Face: https://huggingface.co/wenxingwang/lite-decision-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto vllm-sr/d3-lite: no disponible como enlace verificado en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
