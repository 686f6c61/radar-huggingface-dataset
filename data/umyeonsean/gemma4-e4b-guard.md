# UmyeonSean/gemma4-e4b-guard

## Resumen

gemma4-e4b-guard es un adaptador LoRA publicado por el usuario UmyeonSean sobre el modelo cyankiwi/gemma-4-E4B-it-AWQ-INT4, una version cuantizada a INT4 de Gemma 4 E4B en su variante instruct. El adaptador esta disenado como guardrail: su funcion es clasificar textos de entrada en seis niveles de riesgo, siguiendo el criterio de anotacion de Claude Sonnet. No es un modelo generativo de proposito general, sino un clasificador especializado que se acopla al modelo base mediante PEFT.

La innovacion principal del adaptador es el tratamiento de la entrada: el texto a evaluar se inserta literalmente entre dos tokens reservados (IDs 6 y 7, `<unused0>` y `<unused1>`) que inyecta el adaptador `vllm-noul-adapter`. Con ello se entrena al modelo para que trate el contenido delimitado exclusivamente como objeto de juicio y no como instrucciones a seguir, lo que reduce la superficie de ataque por prompt injection. El entrenamiento se realizo sobre los pesos INT4 del modelo base convertidos a bf16, y el adaptador se aplica despues sobre la misma version INT4 en produccion.

El repositorio es pequeno (0,3 GB) y acumula 15 descargas en el momento de la consulta, sin likes. La documentacion disponible es muy escasa: no se publican resultados de benchmarks, ni la licencia, ni los idiomas soportados, y la metodologia completa remite a un documento interno no accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | adaptador en formato PEFT; modelo base en INT4 (AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | cyankiwi/gemma-4-E4B-it-AWQ-INT4 |
| Rank LoRA maximo | 16 (segun el comando de despliegue en vLLM) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre Gemma 4 E4B, un transformer de la familia Gemma en variante instruct. El autor entrena el LoRA sobre los pesos INT4 del modelo base desquantizados a bf16, y despues aplica el adaptador resultante sobre la misma version INT4 para inferencia, de modo que el entrenamiento y el despliegue comparten la misma representacion numerica del modelo subyacente.

El objetivo de entrenamiento combina dos tareas: en primer lugar, que el modelo trate el texto delimitado entre los tokens reservados 6 y 7 solo como objeto de evaluacion y no obedezca las instrucciones que contenga; en segundo lugar, que emita un juicio de seis niveles segun la pregunta formulada. Las etiquetas de referencia provienen de Claude Sonnet. El conjunto de datos se genero con preguntas nuevas para cada texto, y en el 30 % de los ejemplos la pregunta incluia criterios explicitos (descripcion de entradas que cumplen y que no cumplen el criterio). Se realizo un unico epoch de 900 pasos. La inyeccion de los tokens delimitadores la realiza el adaptador `vllm-noul-adapter`, no el propio LoRA.

## Capacidades

- Clasificacion de texto en seis niveles de riesgo o cumplimiento, con etiquetas derivadas de anotaciones de Claude Sonnet.
- Resistencia a prompt injection: el contenido delimitado se evalua sin ejecutar las instrucciones que contiene.
- Juicio condicionado por pregunta: el mismo texto puede clasificarse de forma distinta segun el criterio solicitado.
- Soporte de criterios explicitos en la consulta (descripcion de entradas positivas y negativas) para guiar la clasificacion.
- Integracion con vLLM mediante `--enable-lora`, lo que permite servir el adaptador junto al modelo base.
- No se documentan capacidades de generacion libre, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; el adaptador esta orientado exclusivamente a la tarea de guardrail.

## Casos de uso

- Moderacion de contenido en produccion: el modelo clasifica mensajes de usuario en seis niveles y permite aplicar umbrales de bloqueo o revision humana; su entrenamiento contra prompt injection lo hace adecuado para entradas no confiables.
- Filtrado de entradas en pipelines RAG: antes de recuperar documentos o invocar un LLM, el guardrail evalua la consulta del usuario y descarta las que superan el nivel de riesgo configurado.
- Proteccion de agentes con tool calling: al insertar el texto del usuario entre tokens delimitadores, el agente puede procesar la entrada sin que las instrucciones maliciosas contenidas en ella alteren el flujo de herramientas.
- Clasificacion con criterios personalizados: el soporte de criterios en la pregunta permite reutilizar el mismo adaptador para politicas distintas (por ejemplo, toxicidad, contenido legal o fuga de datos) sin reentrenar.
- Revision de contenido generado: el guardrail puede evaluar las salidas de otro modelo antes de mostrarlas al usuario, como segunda capa de seguridad.
- Despliegue economico en vLLM: al ser un LoRA de 0,3 GB sobre un modelo INT4, permite servir el guardrail junto al modelo base en la misma instancia, compartiendo memoria y evitando un segundo modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el requisito real de VRAM lo determina el modelo base Gemma 4 E4B en INT4, cuyo tamano exacto no se especifica en la informacion disponible.
- Al ser un modelo base cuantizado a INT4 AWQ, esta pensado para GPUs con soporte de kernels AWQ; se recomienda consultar la model card del modelo base para los requisitos exactos.
- No se dispone de datos sobre si cabe en GPUs de consumo como RTX 4090; el uso de INT4 sugiere que el objetivo es minimizar huella de memoria, pero no se confirma.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules gemma4-e4b-guard=<carpeta>`.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e4b-guard | LoRA guardrail sobre Gemma 4 E4B INT4 | no disponible | no disponible | no disponible | HuggingFace (15 descargas) |
| cyankiwi/gemma-4-E4B-it-AWQ-INT4 | Modelo base cuantizado INT4 | Gemma 4 E4B | no disponible | no disponible | HuggingFace |
| Alternativas de guardrail (p. ej. clasificadores dedicados) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros guardrails o clasificadores de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; no puede confirmarse el uso comercial sin consultar al autor o al modelo base.
- No se documentan los idiomas soportados; el autor escribe en coreano y las etiquetas provienen de Claude Sonnet, pero no se confirma el comportamiento multilingue.
- No hay benchmarks publicados, por lo que el rendimiento real de clasificacion es desconocido.
- El adaptador depende de `vllm-noul-adapter` para insertar los tokens delimitadores; un uso incorrecto de la delimitacion puede degradar la proteccion contra prompt injection.
- El entrenamiento se realizo sobre pesos INT4 desquantizados a bf16 y se aplica sobre INT4; diferencias en la version o configuracion de cuantizacion del modelo base pueden afectar al comportamiento.
- Riesgo de alucinacion y de sesgo en las etiquetas: las referencias provienen de un unico modelo (Claude Sonnet), lo que puede introducir sesgos sistematicos en la clasificacion.
- La documentacion metodologica completa esta en un documento interno no accesible, lo que limita la reproducibilidad.
- Con 15 descargas y sin likes, no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/UmyeonSean/gemma4-e4b-guard
- Modelo base: https://huggingface.co/cyankiwi/gemma-4-E4B-it-AWQ-INT4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
