# trpeder/borealis-open-1b-ONNX

## Resumen
Borealis-open-1b-ONNX es la conversion a formato ONNX del modelo NbAiLab/borealis-open-1b, publicada por el usuario trpeder para su uso con Transformers.js en el navegador. El modelo original lo desarrolla NbAiLab (National Library of Norway), un laboratorio publico noruego centrado en recursos linguisticos y modelos abiertos para lenguas escandinavas. El objetivo declarado de esta conversion es alimentar el "GlirOS Helper" en el navegador, es decir, inferencia local en cliente sin necesidad de servidor.

Se trata de un modelo de generacion de texto de aproximadamente 1.000 millones de parametros (segun la nomenclatura "1b" del nombre), construido sobre la arquitectura Gemma 3 text segun la etiqueta `gemma3_text` del repositorio. Soporta noruego (no), bokmal (nb), nynorsk (nn) e ingles (en), lo que lo situa en el nicho de modelos pequenos orientados a lenguas nordicas, un segmento con relativamente poca oferta comparado con el ingles.

Su relevancia practica es doble. Por un lado, ofrece inferencia totalmente local en el navegador mediante dos variantes cuantizadas a 4 bits: `onnx/model_q4.onnx` para WebAssembly y `onnx/model_q4f16.onnx` para WebGPU. Por otro, al derivar de Gemma, queda sujeto a los terminos de uso de Gemma y a su politica de usos prohibidos, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 text (transformer decoder-only, segun la etiqueta `gemma3_text`) |
| Parametros totales | Aproximadamente 1.000 millones (inferido del identificador "1b"; no confirmado en la informacion disponible) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX a 4 bits: `model_q4.onnx` (WebAssembly) y `model_q4f16.onnx` (pesos de 4 bits, matematicas de 16 bits, WebGPU) |
| Idiomas soportados | Noruego (no), noruego bokmal (nb), noruego nynorsk (nn), ingles (en) |
| Licencia | Gemma (Gemma Terms of Use), con las restricciones de la Gemma Prohibited Use Policy |
| Formato de pesos | ONNX (repositorio de 1,8 GB); el modelo base original usa safetensors |
| Libreria | transformers.js |
| Pipeline | text-generation |
| Modelo base | NbAiLab/borealis-open-1b |

## Arquitectura y entrenamiento
El repositorio no documenta el proceso de entrenamiento del modelo base ni de esta conversion. La unica informacion tecnica disponible es que se trata de una arquitectura Gemma 3 text, un transformer decoder-only, y que la conversion a ONNX no modifica los pesos: el autor indica explicitamente que "the weights are otherwise unchanged". Por tanto, cualquier detalle sobre datos de entrenamiento, numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) o tecnicas de atencion debe consultarse en la model card del modelo original NbAiLab/borealis-open-1b, que no forma parte de la informacion proporcionada.

La innovacion tecnica de este repositorio concreto es la propia conversion: dos artefactos ONNX cuantizados a 4 bits, uno pensado para ejecucion en CPU mediante WebAssembly y otro con pesos de 4 bits y operaciones en 16 bits para aprovechar WebGPU. Esto reduce el peso del modelo hasta hacerlo viable en el navegador, a costa de la perdida de precision inherente a la cuantizacion de 4 bits. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades
- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican soporte para dialogos multi-turno.
- Generacion de texto general en noruego (bokmal y nynorsk) e ingles.
- Inferencia local en navegador mediante Transformers.js, sin backend ni API remota.
- Ejecucion en CPU a traves de WebAssembly con el artefacto `model_q4.onnx`.
- Aceleracion por GPU en cliente con WebGPU usando `model_q4f16.onnx`.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada. Al ser un modelo de 1B y sin declaracion explicita, no deben asumirse.

## Casos de uso
- Asistente integrado en aplicaciones web: el modelo puede ejecutarse integramente en el navegador del usuario mediante Transformers.js, de modo que la conversacion nunca sale del dispositivo. Es adecuado para aplicaciones que requieren privacidad por diseno o funcionamiento sin conexion.
- Soporte en noruego para herramientas internas: al cubrir bokmal y nynorsk, puede emplearse en asistentes de redaccion, resumen de textos administrativos o ayuda a la escritura para usuarios noruegos, un nicho mal cubierto por modelos pequenos mayoritariamente anglofonos.
- Prototipado rapido de interfaces conversacionales: al ser un modelo de 1B en ONNX, se puede desplegar en una pagina estatica sin infraestructura de servidor, lo que abarata iteraciones de producto y demos.
- Educacion y ensenanza de idiomas: generacion de ejercicios, correcciones o dialogos de practica en noruego e ingles, con latencia aceptable en cliente y sin coste por token.
- Preprocesado y clasificacion ligera de texto en pipelines: tareas como etiquetado, normalizacion o extraccion de intenciones antes de enviar la peticion a un modelo mayor, reduciendo coste y latencia global.
- Aplicaciones de escritorio o extensiones de navegador: cualquier escenario en el que no se pueda asumir conectividad o donde enviar datos a un servicio externo no sea aceptable (entornos sanitarios, legales o de investigacion con datos sensibles).
- Evaluacion comparativa de cuantizacion en el edge: util como banco de pruebas para medir la degradacion de calidad entre `model_q4` en WebAssembly y `model_q4f16` en WebGPU sobre el mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio ONNX no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra) y los resultados de busqueda web disponibles no contienen informacion tecnica util sobre este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: con cuantizacion de 4 bits, el peso de los parametros de un modelo de ~1B ronda los 0,6-0,8 GB, por lo que el artefacto completo con overhead de runtime se situa en torno a 1-1,5 GB. Cifra estimada a partir del tamano del repositorio (1,8 GB) y del numero de parametros; no verificada por el autor.
- GPU dedicadas: no se requieren. El artefacto `model_q4.onnx` esta pensado para CPU y el `model_q4f16.onnx` para WebGPU, de modo que no se documenta soporte para A100, H100 ni similares.
- GPU de consumo: el modelo cabe sin problema en cualquier GPU de consumo con WebGPU disponible (integrada o dedicada). El cuello de botella en este escenario es el ancho de banda de memoria y el soporte de WebGPU del navegador, no la VRAM.
- Opciones de despliegue: Transformers.js en navegador (WebAssembly y WebGPU). El modelo base NbAiLab/borealis-open-1b podria desplegarse con otras herramientas, pero no se documenta en este repositorio.
- Latencia y throughput: no disponibles. Dependen en gran medida del cliente (navegador, CPU frente a GPU) y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| borealis-open-1b-ONNX | ~1B | No disponible | Gemma | ONNX para Transformers.js | Enfocado a noruego; conversion para navegador |
| NbAiLab/borealis-open-1b | ~1B | No disponible | Gemma | Peso original en safetensors | Modelo base del que deriva; mismos pesos |
| Gemma 3 1B (Google) | ~1B | No disponible en la informacion disponible | Gemma | Multiples formatos | Arquitectura de referencia declarada por la etiqueta `gemma3_text` |
| Otros modelos pequenos multilingues | No disponible | No disponible | Variable | Variable | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks ni de datos de contexto de los modelos comparados dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias
- Sesgos: no documentados en la informacion disponible. Al derivar de Gemma, hereda los sesgos del modelo original, que no se detallan aqui.
- Alucinacion: riesgo inherente a un modelo de generacion de 1B de parametros, especialmente acusado en tareas de conocimiento factual y en idiomas con menos presencia en los datos de entrenamiento.
- Cuantizacion a 4 bits: la conversion reduce el peso y la huella de memoria, pero puede degradar la calidad de la generacion respecto al modelo base. No se publican mediciones de esa degradacion.
- Cobertura idiomatica: solo noruego (bokmal y nynorsk) e ingles. No hay soporte declarado de castellano, por lo que no es adecuado para aplicaciones en espanol sin ajuste previo.
- Longitud de contexto: no disponible. No es posible planificar cargas de contexto largo sin este dato.
- Licencia: el modelo esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, lo que impone restricciones de uso, incluidas limitaciones para determinados fines comerciales y de aplicacion. Debe revisarse antes de cualquier despliegue en produccion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni de validacion comunitaria.
- Dependencia del cliente: el rendimiento en navegador depende del soporte de WebGPU y de la memoria disponible en el dispositivo del usuario final, factores fuera del control del desarrollador.
- Sin garantias del autor: la model card no incluye evaluaciones, limitaciones declaradas ni guia de uso mas alla de la nota de licencia.

## Enlaces
- Repositorio ONNX: https://huggingface.co/trpeder/borealis-open-1b-ONNX
- Modelo base: https://huggingface.co/NbAiLab/borealis-open-1b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
