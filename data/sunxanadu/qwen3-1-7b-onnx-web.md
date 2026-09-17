# sunxanadu/Qwen3-1.7B-ONNX-web

## Resumen

Qwen3-1.7B-ONNX-web es un reempaquetado del modelo Qwen/Qwen3-1.7B en formato ONNX, publicado por el usuario sunxanadu, cuyo objetivo es que el modelo pueda cargarse y ejecutarse dentro del navegador de un teléfono móvil mediante Transformers.js y WebGPU. No es un modelo entrenado desde cero ni un ajuste fino: es una redistribucion del ONNX oficial de onnx-community con dos modificaciones concretas orientadas a reducir el consumo de memoria durante la carga en el navegador.

El problema que resuelve es de ingenieria de despliegue. El archivo original es un unico protobuf de 1,43 GB que el navegador debe mantener en memoria dos veces mientras lo parsea, algo inviable en moviles. Esta version mueve los pesos a datos externos (model_q4f16.onnx + model_q4f16.onnx_data) y reescribe el embedding atado, que en el original se guardaba en fp16 (622 MB), para almacenarlo en 4 bits. El resultado es una descarga total de 1,14 GB con solo 1,7B de parametros y licencia Apache 2.0.

Su relevancia es acotada pero clara: demuestra que un modelo de 1,7B con cuantizacion de 4 bits puede servirse en inferencia local dentro de un navegador movil, sin servidor y sin enviar datos del usuario a terceros. La contrapartida es que depende estrictamente de WebGPU: no existe kernel WASM/CPU para el operador de cuantizacion por bloques que usa el embedding, por lo que no arrancara en entornos sin aceleracion grafica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3); grafo ONNX con atencion y capas lineales cuantizadas |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-1.7B) |
| Tipos de cuantizacion | solo q4f16 (pesos en 4 bits, activaciones y computo en fp16) |
| Cuantizacion del embedding | 4 bits, block size 32, redondeo asimetrico round-to-nearest; GatherBlockQuantized para la busqueda de entrada y MatMulNBits para la cabeza de salida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_q4f16.onnx + datos externos model_q4f16.onnx_data); sin safetensors ni GGUF |
| Tamano de vocabulario | 151.936 tokens |
| Dimension oculta | 2.048 |
| Tamano total de descarga | 1,14 GB |
| Tamano del repositorio | 1,1 GB |
| Libreria de inferencia | Transformers.js |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de la familia Qwen3 con 1,7B de parametros, dimension oculta de 2.048 y vocabulario de 151.936 tokens. Sobre el grafo original no se ha modificado nada salvo lo indicado por el autor: los pesos se externalizan a un archivo de datos y el embedding atado pasa de fp16 a 4 bits. La unica capa afectada por el cambio de precision es, por tanto, el par embedding de entrada / cabeza de salida; el resto de matrices lineales ya venian cuantizadas en el archivo q4f16 de origen.

No se ha realizado ningun entrenamiento, ajuste fino, RLHF ni DPO en este repositorio: se trata de una conversion de formato y una requantizacion de una unica capa. El autor documenta dos comprobaciones de fidelidad. La primera es que, aplicando solo el cambio de externalizacion de pesos, la salida es identica token a token al modelo de origen en CPU. La segunda, ya con el embedding en 4 bits, evalua 34 frases de entorno laboral reescritas a ingles sencillo: 24 salidas son identicas palabra por palabra al modelo original y el resto difiere unicamente en la eleccion de una palabra. En terminos de datos de entrenamiento (numero de tokens, composicion del corpus, fases de alineacion) no hay informacion disponible en este repositorio; habria que consultar la documentacion del modelo base.

## Capacidades

- Generacion de texto conversacional en modo chat, con soporte del formato de plantilla de Qwen3.
- Hereda las capacidades del modelo base Qwen3-1.7B para razonamiento, matematicas y generacion de codigo, aunque este repositorio no documenta evaluaciones propias.
- Ejecucion de la generacion completa en el dispositivo del usuario, dentro del navegador, sin llamadas a un servidor de inferencia.
- Integracion directa con el pipeline `text-generation` de Transformers.js mediante `dtype: "q4f16"` y `device: "webgpu"`.
- Compatibilidad con el ecosistema Transformers.js, lo que permite usarlo desde JavaScript sin backend en Python.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico en la informacion proporcionada.
- No se documentan capacidades multilingues explicitas, mas alla de lo que herede del modelo base.

## Casos de uso

- Chat privado en el navegador del movil: el modelo se descarga una vez (1,14 GB) y a partir de ahi genera texto en local, de modo que las conversaciones no salen del dispositivo. Es adecuado para aplicaciones de bienestar, diario personal o asistentes con datos sensibles.
- Asistente embebido en una aplicacion web progresiva (PWA): al no requerir backend de inferencia, el coste de infraestructura se traslada al cliente y el despliegue se reduce a servir ficheros estaticos.
- Prototipado rapido de interfaces conversacionales: un desarrollador frontend puede validar el flujo de producto completo con un modelo real antes de decidir si merece la pena montar un servidor con vLLM o TGI.
- Demostraciones y material docente: permite mostrar el funcionamiento interno de un LLM generando tokens en un telefono, sin depender de la red ni de claves de API.
- Demo offline en eventos o entornos sin conectividad fiable: una vez cacheado el modelo, la inferencia funciona sin conexion, algo util en ferias, aulas o instalaciones con red restringida.
- Preprocesado de texto en el cliente: reescritura, resumen corto o clasificacion preliminar de entradas antes de enviarlas a un servicio mayor, reduciendo el volumen de datos transmitidos.
- Quioscos y terminales interactivos basados en navegador (kiosco, totem, panel industrial) donde no se quiere desplegar un servidor GPU dedicado por cada punto de atencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar.

La unica evaluacion cuantitativa presente en la model card es una comprobacion de fidelidad frente al modelo ONNX de origen:

| Comprobacion | Resultado |
|---|---|
| Externalizacion de pesos (paso 1), CPU | Salida identica token a token al modelo de origen |
| Embedding en 4 bits (paso 2), 34 frases reescritas a ingles sencillo | 24 salidas identicas palabra por palabra; el resto difiere en una eleccion lexica |

No hay datos de latencia, tokens por segundo ni consumo energetico por dispositivo.

## Requisitos de hardware

- Almacenamiento y descarga: 1,14 GB en total (model_q4f16.onnx mas model_q4f16.onnx_data).
- Memoria en GPU: no se publica una cifra oficial; como referencia, los pesos cuantizados ocupan del orden de 1,1 GB y hay que anadir activaciones y cache KV, por lo que conviene disponer de margen por encima de 1,5 GB de memoria grafica utilizable.
- GPU de servidor: no aplica a este repositorio. Para A100, H100 o similares debe usarse el modelo base Qwen/Qwen3-1.7B o el ONNX de onnx-community con otra configuracion de ejecucion.
- GPU de consumo: no se documenta ejecucion en RTX 4090 ni similares a traves de este repositorio; el objetivo declarado es el navegador de telefonia movil con WebGPU.
- CPU / WASM: no soportado. El operador GatherBlockQuantized no tiene kernel WASM (CPU) en onnxruntime-web, por lo que es obligatorio `device: "webgpu"`. El mismo problema afecta al modelo Gemma 3 1B q4f16 citado por el autor.
- Navegadores compatibles: cualquiera con soporte de WebGPU habilitado; no se detalla una lista concreta de versiones en la informacion proporcionada.
- Opciones de despliegue: unicamente Transformers.js con WebGPU. No hay variantes GGUF, por lo que no aplica llama.cpp ni Ollama; vLLM y TGI quedan fuera del alcance de este repositorio.
- Latencia y throughput: no disponible. Depende por completo del SoC del dispositivo y del estado termico del terminal.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de descarga | Embedding | Licencia | Destino |
|---|---|---|---|---|---|---|
| sunxanadu/Qwen3-1.7B-ONNX-web | 1,7B | solo q4f16 | 1,14 GB | 4 bits (block size 32) | Apache 2.0 | Navegador movil con WebGPU |
| onnx-community/Qwen3-1.7B-ONNX | 1,7B | multiples (incluye q4f16) | 1,43 GB el fichero q4f16 de origen | fp16 (622 MB) | Apache 2.0 | Navegador y escritorio; requiere mas memoria en carga |
| onnx-community/gemma-3-1b-it-ONNX | 1B (aprox., segun denominacion) | incluye q4f16 | no disponible | 4 bits con el mismo layout (GatherBlockQuantized + MatMulNBits) | no disponible en la informacion proporcionada | Navegador con WebGPU |

La diferencia funcional frente al ONNX de origen no esta en la calidad de salida, sino en el coste de carga: externalizar los pesos evita que el navegador duplique el protobuf en memoria y cuantizar el embedding recorta aproximadamente 600 MB de descarga. Frente a Gemma 3 1B, el modelo de Qwen es mayor en parametros, pero comparte la misma limitacion de kernel en CPU.

## Limitaciones y advertencias

- Dependencia obligatoria de WebGPU: sin aceleracion grafica no hay ejecucion posible, ni siquiera degradada, porque falta el kernel WASM de GatherBlockQuantized.
- La cuantizacion a 4 bits del embedding introduce una degradacion pequena pero medible: en la propia evaluacion del autor, 10 de 34 frases difieren del modelo de origen en la eleccion de una palabra.
- Solo se distribuye la variante q4f16. No hay opciones de mayor precision en este repositorio si se necesita maxima fidelidad.
- No se han publicado datos de contexto, idiomas soportados ni evaluaciones de sesgo; cualquier afirmacion al respecto debe verificarse contra la documentacion del modelo base Qwen3-1.7B.
- Riesgo de alucinacion propio de un modelo de 1,7B: es un tamano adecuado para tareas de formato, reescritura o conversacion ligera, pero no fiable para datos factuales sin verificacion.
- Al ser un modelo pequeno, la calidad en matematicas, codigo complejo y razonamiento multietapa es sensiblemente inferior a la de modelos de mayor escala; no se recomienda su uso como unico componente en flujos criticos.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial sin restricciones adicionales por parte de este reempaquetado. Conviene aun asi revisar la licencia y los terminos del modelo base Qwen3 por si incorporan condiciones adicionales de atribucion.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento posterior.
- Para cargas de trabajo en servidor, este repositorio no es la via adecuada: hay que acudir al modelo base o a una conversion ONNX/GGUF pensada para backend.
- Las fechas de creacion y actualizacion registradas (17 de septiembre de 2026) constan asi en los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunxanadu/Qwen3-1.7B-ONNX-web
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- ONNX de origen: https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX
- Referencia de layout de embedding cuantizado: https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo; los enlaces obtenidos corresponden a un sitio de reservas de viajes y no se incluyen por no ser relevantes. No se dispone de paper, blog tecnico ni demo adicionales mas alla de los enlaces anteriores.
