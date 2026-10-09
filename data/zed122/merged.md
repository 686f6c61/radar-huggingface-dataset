# zed122/merged

## Resumen

zed122/merged es un modelo de lenguaje de 1.543.714.304 parametros publicado por el usuario zed122 en Hugging Face. No se trata de un entrenamiento desde cero ni de un ajuste fino, sino de una fusion (merge) de pesos de dos modelos de la familia Qwen2.5: Qwen/Qwen2.5-1.5B-Instruct y Qwen/Qwen2.5-Coder-1.5B-Instruct. La fusion se ha realizado con la herramienta mergekit aplicando el metodo SLERP (interpolacion esferica) sobre el rango completo de 28 capas de ambos modelos.

El problema que intenta resolver es habitual en el ecosistema open source: combinar en un unico checkpoint las capacidades conversacionales de un modelo instruct con la especializacion en codigo de su variante Coder, sin necesidad de reentrenar. La configuracion de merge es explicitamente asimetrica por tipo de modulo: las capas de self-attention reciben valores de t distintos a los de los bloques MLP, lo que sugiere la intencion de preservar en distinta medida el comportamiento de cada modelo base segun el submodulo de la red.

Es relevante ahora por su tamano reducido (1.500 millones de parametros, unos 3,1 GB en el repositorio) y por su caracter experimental: es una receta reproducible con mergekit YAML, pensada para ejecucion en hardware de consumo. Conviene senalar que el modelo no declara licencia, idiomas ni resultados de evaluacion en su model card, y que a fecha de la consulta acumula 0 descargas y 0 likes, por lo que se trata de una publicacion sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de los modelos base) |
| Parametros totales | 1.543.714.304 (dato real del repositorio en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens segun las especificaciones publicas de la familia Qwen2.5-1.5B; no declarada en la model card del merge |
| Tipos de cuantizacion | bfloat16 (unico formato publicado en el repositorio); no se han publicado cuantizaciones GGUF/AWQ/GPTQ en el propio repositorio |
| Idiomas soportados | no disponible (la model card del merge no lo declara) |
| Licencia | no disponible (la model card del merge no declara licencia) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura resultante es la de los modelos base: un transformer decoder-only de la familia Qwen2 con 28 capas, tal y como se deduce del `layer_range: [0, 28]` declarado en la configuracion de mergekit. No hay cambios estructurales: la fusion opera exclusivamente sobre los tensores de pesos, por lo que se conservan la atencion con RoPE, el uso de QKV bias y las dimensiones originales de Qwen2.5-1.5B. El dtype final del checkpoint es bfloat16, y el metodo de fusion es SLERP sobre el modelo Qwen2.5-1.5B-Instruct tomado como `base_model`.

La innovacion tecnica esta en la configuracion del parametro `t` del SLERP. En lugar de aplicar un unico coeficiente de interpolacion global, la receta define valores diferenciados por filtro: para `self_attn` se usa la secuencia `[0, 0.5, 0.3, 0.7, 1]`, para `mlp` se usa la secuencia inversa `[1, 0.5, 0.7, 0.3, 0]` y para el resto de modulos se aplica `0.5`. En la practica, esto significa que las capas de atencion parten del modelo Instruct y se desplazan progresivamente hacia el Coder, mientras que los bloques MLP hacen el recorrido inverso. No se ha realizado ningun entrenamiento adicional, ajuste con RLHF/DPO ni ampliacion de contexto: el modelo hereda integramente el conocimiento y los sesgos de sus dos progenitores tal y como quedan combinados por la interpolacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Generacion y completado de codigo en multiples lenguajes de programacion, heredada de Qwen2.5-Coder-1.5B-Instruct.
- Seguimiento de instrucciones y formato de respuesta tipo chat mediante plantilla de conversacion de Qwen2.5.
- Razonamiento basico y resolucion de problemas matematicos sencillos, limitado por el tamano de 1.500 millones de parametros.
- Soporte de tool calling y function calling: los modelos Qwen2.5-Instruct incorporan esta capacidad, aunque la model card del merge no la confirma explicitamente para el checkpoint fusionado.
- Capacidades multilingues: los modelos base de Qwen2.5 cubren decenas de idiomas; no obstante, el merge no declara lista de idiomas ni se ha evaluado su comportamiento por idioma.
- Capacidad de agente y razonamiento multi-paso: no declarada ni verificada en la informacion disponible.
- Capacidades multimodales (vision o audio): no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistente de programacion ligero en local: integrado en un IDE o en un plugin de terminal, el modelo puede completar funciones, explicar fragmentos de codigo y proponer refactorizaciones basicas, con la ventaja de que su peso en bfloat16 (unos 3,1 GB) permite ejecutarlo en portatiles con GPU integrada o modesta.
- Generacion de tests unitarios y documentacion tecnica: a partir de una funcion existente, el modelo puede producir casos de prueba y cadenas de documentacion de forma automatizada dentro de un pipeline de CI/CD, donde el coste por inferencia es minimo al correr en hardware propio.
- Chatbot de soporte interno con despliegue on-premise: para entornos con requisitos de confidencialidad, el modelo puede desplegarse sin conexion a servicios externos y gestionar conversaciones multi-turno sobre documentacion interna acotada dentro de su ventana de contexto.
- Preprocesado y clasificacion de texto en lotes: tareas de extraccion de entidades, resumen corto o reescritura de textos pueden ejecutarse a gran volumen en una unica GPU de consumo, con throughput alto gracias al reducido numero de parametros.
- Prototipado rapido de agentes con tool calling: para validar arquitecturas de agentes que invocan funciones externas (APIs, calculadora, busqueda), el modelo sirve como banco de pruebas economico antes de escalar a modelos de mayor tamano.
- Educacion y experimentacion en fusion de modelos: resulta util como caso de estudio reproducible de mergekit y SLERP por filtro de modulo, permitiendo a investigadores comparar recetas de merge sobre una base de coste computacional bajo.
- Generacion de codigo asistida en entornos con presupuesto cero: al no declarar licencia, su uso debe verificarse antes de cualquier explotacion comercial, pero para uso personal o investigacion es una alternativa sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del merge no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K ni similares), y tampoco se han encontrado resultados en la busqueda web realizada. No es posible, por tanto, afirmar que la fusion mejore o empeore el rendimiento de sus modelos base sin una evaluacion propia.

## Requisitos de hardware

- Peso de los parametros en bfloat16: aproximadamente 3,1 GB (coincide con el tamano del repositorio en safetensors).
- VRAM estimada para inferencia en bfloat16/fp16: entre 4 y 6 GB, incluyendo pesos y cache KV para contextos moderados; el consumo crece con la longitud de contexto.
- VRAM estimada con cuantizacion de 8 bits: en torno a 2 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits (si se genera una GGUF Q4_K_M): aproximadamente 1 GB de pesos, viable en GPUs con 4 GB o incluso en CPU.
- GPUs recomendadas: cualquier GPU consumer moderna con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, una unica A100, H100, L4 o T4 basta, y en la mayoria de los casos estara infrautilizada.
- Cabe en GPU consumer: si, y es uno de sus principales atractivos; tambien es viable en CPU con llama.cpp u Ollama si se generan cuantizaciones, y en Mac con Apple Silicon mediante Metal.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (estos dos ultimos requieren convertir los pesos a GGUF, ya que el repositorio solo publica safetensors en bfloat16).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zed122/merged | 1.543.714.304 | 32.768 tokens (segun especificaciones de la familia base; no declarado en la model card) | Sin benchmarks publicados | No declarada en la model card | Hugging Face, safetensors, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | mismo orden (1.500 millones) | 32.768 tokens segun su model card publica | Resultados publicados por Qwen en su model card (no reproducidos aqui) | Apache 2.0 segun la familia Qwen2.5 | Hugging Face, ampliamente descargado |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | mismo orden (1.500 millones) | 32.768 tokens segun su model card publica | Resultados publicados por Qwen en su model card (no reproducidos aqui) | Apache 2.0 segun la familia Qwen2.5 | Hugging Face, ampliamente descargado |

No se dispone de datos verificados en la informacion proporcionada para comparar con alternativas de otros fabricantes (por ejemplo, modelos de 1 a 2 mil millones de parametros de otras familias), por lo que esa comparacion se marca como no disponible. La comparacion con los dos modelos base es, en cualquier caso, la mas relevante: el merge no aporta parametros nuevos, solo una combinacion de pesos, y no existe evidencia publicada de que supere a ninguno de los dos por separado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas, ni validacion por parte de terceros. Cualquier afirmacion sobre su calidad relativa frente a los modelos base seria especulativa.
- Licencia no declarada: el repositorio no indica licencia. Esto es un riesgo juridico directo para uso comercial; es imprescindible verificar las condiciones de los modelos base antes de cualquier despliegue en produccion.
- Herencia de sesgos: al ser una interpolacion de pesos, el modelo reproduce los sesgos presentes en Qwen2.5-1.5B-Instruct y Qwen2.5-Coder-1.5B-Instruct, sin ninguna capa adicional de alineamiento o filtrado.
- Riesgo de alucinacion elevado: con 1.500 millones de parametros, la tasa de invencion de hechos, referencias y APIs inexistentes es alta, especialmente en tareas de conocimiento factual y en generacion de codigo sobre librerias poco comunes.
- Capacidad limitada de razonamiento: no es adecuado para tareas que requieran cadenas largas de deduccion, matematicas complejas o planificacion multi-paso fiable.
- Idiomas no declarados: aunque los modelos base son multilingues, no hay garantia de que la fusion preserve el comportamiento en idiomas distintos del ingles o el chino, y el castellano no ha sido evaluado.
- Contexto no verificado: la ventana de 32.768 tokens se atribuye por herencia del modelo base, pero no esta confirmada en la model card del merge; el rendimiento en contextos largos puede degradarse.
- Configuracion de merge no validada: los valores de `t` por filtro (`self_attn` y `mlp` con secuencias invertidas) son una eleccion del autor sin justificacion documentada ni estudio de ablacion.
- Madurez del repositorio: publicado el 2026-10-08 y actualizado el mismo dia, con 0 descargas y 0 likes. Es un artefacto experimental, no un modelo mantenido.
- Cobertura de tooling: no se han publicado cuantizaciones GGUF, por lo que el despliegue en llama.cpp u Ollama requiere conversion manual por parte del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zed122/merged
- Perfil del autor en Hugging Face: https://huggingface.co/zed122/models
- Modelo base 1: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base 2: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Documentacion del metodo SLERP: https://en.wikipedia.org/wiki/Slerp
- Otro artefacto del mismo autor, a modo de referencia: https://huggingface.co/zed122/Qwen2.5-0.5B-Q5_0-GGUF
- Calendario de lanzamientos de modelos (referencia general, no especifica de este modelo): https://www.scriptbyai.com/ai-model-release-calendar/
