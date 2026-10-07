# Valnivo-labs/valnivo-router-small

## Resumen

Valnivo-router-small es un modelo de clasificacion de texto (text-classification) publicado por Valnivo Labs. No es un modelo generativo: es un clasificador entrenado mediante fine-tuning de `intfloat/multilingual-e5-small` sobre la biblioteca fija de respuestas del copiloto de Valnivo. Su salida es unicamente el identificador de una explicacion, de una pantalla o de una negativa prefijada, sin texto libre.

El modelo esta pensado para funcionar dentro de la aplicacion Valnivo como enrutador de intenciones: recibe una pregunta, la codifica con el prefijo `query: ` propio de la familia E5 y devuelve la etiqueta correspondiente de un conjunto cerrado. Fuera de ese contexto, las etiquetas no tienen significado, tal como advierte la propia model card. Se distribuye en formato ONNX de 8 bits y con la libreria `transformers.js`, lo que permite ejecutarlo en el navegador mediante WebAssembly (los binarios de ORT se copian en la carpeta `ort/` del repositorio).

Su relevancia es la de un componente de infraestructura mas que la de un modelo generalista: es un ejemplo de enrutador multilingue de muy bajo coste (repositorio de 0,2 GB, licencia MIT, sin GPU) para integrar en productos que necesitan decidir "que respuesta mostrar" antes de invocar cualquier modelo mayor. El entrenamiento se hizo exclusivamente con preguntas redactadas a proposito para esa tarea, segun declara el autor. El soporte linguistico cubre ocho idiomas: ingles, frances, aleman, espanol, italiano, portugues, neerlandes y polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabecera de clasificacion de secuencia, derivado de `intfloat/multilingual-e5-small` |
| Parametros totales | no disponible en la model card (heredados del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | ONNX int8 (`onnx/model_quantized.onnx`); no se documentan otras variantes |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl |
| Licencia | MIT |
| Formato de pesos | ONNX cuantizado a 8 bits, con pesos en formato transformers; el repositorio ocupa 0,2 GB |

## Arquitectura y entrenamiento

La base es `intfloat/multilingual-e5-small`, un encoder multilingue de la familia E5 orientado originalmente a embeddings de texto. Valnivo Labs ha anadido una cabecera de clasificacion y ha hecho fine-tuning supervisado sobre un conjunto cerrado de etiquetas que se corresponde con la biblioteca fija de respuestas del copiloto: cada etiqueta identifica una explicacion, una pantalla o una negativa prefijada. La entrada debe ir precedida del prefijo `query: `, exactamente igual que en el uso original de E5, lo que indica que el pipeline conserva la tokenizacion y el preprocesado de la familia.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor afirma que el modelo se entreno solo con preguntas escritas especificamente para esa finalidad y nunca con datos de terceros. La innovacion destacable no es arquitectonica sino de despliegue: la exportacion a ONNX en 8 bits y la inclusion de los binarios de ONNX Runtime para WebAssembly permiten ejecutar el clasificador en el navegador del cliente sin backend.

## Capacidades

- Clasificacion de texto en un espacio de etiquetas cerrado y predefinido (identificadores de explicacion, de pantalla o de negativa).
- Enrutamiento de intenciones: asignar una consulta del usuario a una de las respuestas fijas del producto.
- Funcionamiento como filtro o puerta de seguridad: existe una etiqueta especifica de negativa prefijada.
- Soporte multilingue en ocho idiomas (en, fr, de, es, it, pt, nl, pl), heredado del modelo base.
- Inferencia en el navegador mediante `transformers.js` y ONNX Runtime WebAssembly.
- No genera texto libre, no hace razonamiento, no escribe codigo, no resuelve matematicas ni tiene capacidades de vision o audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta un modo de pensamiento (thinking mode) ni ninguna capacidad especial adicional.

## Casos de uso

- Enrutamiento dentro del copiloto Valnivo: dado un mensaje del usuario, el modelo devuelve el identificador de la respuesta fija que corresponde mostrar, reduciendo la necesidad de invocar un modelo generativo para consultas ya cubiertas por la biblioteca.
- Atencion al cliente con respuestas prefijadas: en dominios donde las respuestas estan normalizadas (cambios de contrasena, estado de pedido, horarios), el clasificador decide que respuesta canonica enviar antes de escalar a un agente humano.
- Puerta de seguridad y rechazo controlado: la existencia de una etiqueta de negativa permite desviar consultas fuera de alcance (por ejemplo, peticiones de asesoramiento financiero) hacia un mensaje de rechazo fijo, sin generar contenido nuevo.
- Clasificacion de intenciones en aplicaciones web sin backend de inferencia: al ejecutarse en WebAssembly, puede integrarse en una SPA y clasificar localmente, lo que evita enviar el texto del usuario a un servidor.
- Filtrado previo en cascada de coste: colocar este clasificador delante de un modelo grande para descartar o resolver las consultas que ya tienen respuesta asignada, reduciendo el numero de llamadas al modelo mayor.
- Deteccion multilingue de intencion en producto internacional: con ocho idiomas cubiertos, una misma etiqueta sirve para usuarios en espanol, aleman, frances o polaco sin desplegar un modelo por idioma.
- Prototipado rapido de enrutadores propios: al estar liberado bajo licencia MIT, puede reentrenarse la cabecera de clasificacion sobre un conjunto de etiquetas propio y usarse como plantilla de enrutador ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, latencia ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso habitual; el modelo esta cuantizado a 8 bits y el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria del proceso de inferencia es del orden de cientos de megabytes (no se publica una cifra exacta).
- GPU recomendadas: ninguna en particular; el caso de uso declarado es ONNX Runtime WebAssembly sobre CPU, tanto en navegador como en servidor.
- Compatibilidad con GPU de consumo: irrelevante, el modelo es lo bastante pequeno para ejecutarse en CPU. Cabe en cualquier portatil, en un contenedor pequeño e incluso en dispositivos tipo Raspberry Pi dentro de los limites de memoria del runtime.
- Opciones de despliegue: `transformers.js` (navegador o Node.js) con ONNX Runtime WebAssembly, que es el modo documentado. Tambien seria desplegable con ONNX Runtime nativo o con cualquier runtime compatible con ONNX, aunque esto no se especifica en la model card. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas declaradas.

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Valnivo-router-small | Clasificador de etiqueta cerrada | no disponible (base `multilingual-e5-small`) | no disponible | 8 (en, fr, de, es, it, pt, nl, pl) | MIT | ONNX int8 |
| intfloat/multilingual-e5-small | Encoder de embeddings | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors / transformers |
| Enrutadores basados en LLM pequenos (por ejemplo, modelos de menos de 1000 M de parametros) | Generativo con salida de etiqueta | del orden de cientos de millones a miles de millones segun modelo | variable segun modelo | variable | variable | safetensors, GGUF |

La diferencia funcional clave frente a un LLM pequeno usado como enrutador es que este modelo no puede generar texto: solo emite una etiqueta de un conjunto fijo, lo que reduce el riesgo de salidas fuera de catalogo pero impide cualquier tarea abierta.

## Limitaciones y advertencias

- Modelo de proposito especifico: fuera de la aplicacion Valnivo sus etiquetas no significan nada, segun advierte el propio autor. No es un modelo de proposito general.
- No proporciona asesoramiento financiero ni debe usarse para ello.
- No genera texto libre; cualquier expectativa de generacion, resumen o razonamiento queda fuera de su alcance.
- Riesgo de alucinacion en el sentido generativo: no aplica, pero si existe riesgo de clasificacion erronea (asignar una etiqueta que no corresponde) cuando la consulta cae fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al haberse entrenado con preguntas redactadas por el propio equipo, el modelo puede reflejar los sesgos de ese conjunto de redaccion.
- Limitaciones de contexto e idioma: no se publica la longitud maxima de secuencia soportada. Los idiomas declarados son ocho; no hay garantia de comportamiento correcto en otros.
- Trazabilidad y datos: no se publican detalles del dataset de entrenamiento (tamano, composicion, proceso de anotacion), lo que dificulta auditar su comportamiento.
- Uso comercial: la licencia MIT permite uso comercial, modificacion y redistribucion, incluyendo reentrenamiento de la cabecera de clasificacion.
- Para produccion: conviene fijar una politica de fallback, ya que el modelo siempre devuelve una etiqueta, y validar con datos propios el porcentaje de clasificaciones correctas antes de sustituir cualquier logica basada en reglas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Valnivo-labs/valnivo-router-small
- Modelo base en HuggingFace: https://huggingface.co/intfloat/multilingual-e5-small
- Copia del modelo base publicada por el mismo autor: https://huggingface.co/Valnivo-labs/multilingual-e5-small
