# Tomoali/d1-2B-ryzen-ai-npu

## Resumen

d1-2B-ryzen-ai-npu es una conversion del modelo LiquidAI/d1-2B de Liquid AI, empaquetada en formato ONNX y optimizada para ejecutarse sobre la NPU XDNA 2 de los procesadores AMD Ryzen AI 300 series bajo Windows 11, utilizando Ryzen AI Software 1.8.0. El autor de la conversion es Tomoali, y el runtime independiente que la acompana se publica en el repositorio tomhda/d1-2b-ryzen-ai-npu con licencia MIT.

El modelo subyacente, d1-2B, no es un modelo generativo de chat al uso: es un modelo de decision multimodal (image-text-to-text) disenado para responder preguntas cerradas sobre una imagen y un texto de entrada, con tipos de pregunta `noul` (si/no), `choice` (seleccion multiple) y `score` (puntuacion graduada). Esta orientacion lo aleja de los asistentes conversacionales y lo acerca a tareas de clasificacion, filtrado y evaluacion automatica sobre capturas de pantalla o imagenes.

La relevancia de esta ficha radica en que demuestra un caso real de despliegue de un modelo de 2B parametros en hardware de consumo con NPU integrada, sin dependencia de PyTorch, transformers ni torchvision, y con un reparto explicito de trabajo entre NPU y CPU. El paquete ocupa aproximadamente 2,4 GB e incluye pesos cuantizados a 4 bits en las proyecciones densas del modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia LFM3 de Liquid AI), con vision encoder y proyector; pesos convertidos a ONNX |
| Parametros totales | 2B (modelo base LiquidAI/d1-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en runtime |
| Tipos de cuantizacion | 4 bits en proyecciones densas del modelo de lenguaje, 8 bits en embeddings, FP32 en las puertas de atencion; vision en ONNX de coma flotante |
| Idiomas soportados | en, ja |
| Licencia | LFM Open License v1.0 (etiquetada como `other`); runtime wrapper MIT |
| Formato de pesos | ONNX (runtime onnxruntime), con manifiesto `model-manifest.json` y checksums |

## Arquitectura y entrenamiento

El modelo base d1-2B pertenece a la familia LFM3 de Liquid AI y combina un encoder de vision con un modelo de lenguaje transformer. En esta conversion, el autor descompone la atencion y las operaciones rotary del bloque de vision en subgrafos ONNX equivalentes, y divide el proyector en una estructura 2048×2 preservando los atributos GELU originales. La entrada de imagen se redimensiona automaticamente a 640×384. El modelo de lenguaje mantiene 143 kernels de proyeccion principales que se ejecutan en la NPU, mientras que el embedding, la atencion y las convoluciones del modelo de lenguaje, asi como el preprocesado de imagen, permanecen en CPU. El autor advierte explicitamente que esto no constituye una utilizacion del 100 % de la NPU.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO; esos datos corresponden a la model card original de LiquidAI/d1-2B, que no se incluye en la informacion proporcionada. La innovacion tecnica destacable de este paquete es el empaquetado de inferencia para NPU con generacion automatica de datos de ejecucion especificos del hardware en el primer uso (aproximadamente 10 minutos), reutilizados en ejecuciones posteriores. El runtime permite ademas empaquetar hasta 12 preguntas en un unico forward.

## Capacidades

- Decision multimodal sobre una imagen y un texto: responde preguntas de tipo `noul` (si/no), `choice` (seleccion entre opciones) y `score` (valoracion graduada).
- Procesamiento de una unica imagen por inferencia, con redimensionado automatico a 640×384.
- Empaquetado de hasta 12 preguntas en un solo forward pass, lo que reduce el coste por pregunta en lotes pequenos.
- Ejecucion sin PyTorch, transformers ni torchvision; solo requiere el runtime ONNX y el SDK de Ryzen AI.
- Soporte de idiomas ingles y japones.
- No soporta audio, video ni tipos de pregunta de extraccion.
- No es un modelo de generacion de texto conversacional: no produce respuestas libres, solo decisiones estructuradas.

## Casos de uso

- Clasificacion automatica de capturas de pantalla: el runtime incluye un preset de ejemplo (`screen-check`) que evalua una imagen de pantalla contra preguntas cerradas, util para moderacion o triaje de contenido visual.
- Filtrado de imagenes en pipelines de datos: dado un conjunto de imagenes y una pregunta de tipo `noul`, el modelo permite descartar o aceptar imagenes antes de pasarlas a un modelo mayor, reduciendo coste computacional.
- Evaluacion de calidad de interfaces: con preguntas `score`, se puede puntuar automaticamente el estado visual de una UI (por ejemplo, presencia de errores, legibilidad o elementos faltantes) en pruebas de regresion.
- Seleccion multiple sobre documentos visuales: preguntas `choice` permiten categorizar capturas o figuras en un conjunto predefinido de clases sin necesidad de un clasificador entrenado a medida.
- Procesamiento en local con NPU: al ejecutarse en Ryzen AI 300 sin GPU dedicada, es adecuado para aplicaciones de escritorio que requieren privacidad de datos y bajo consumo energetico.
- Preetiquetado en flujos de anotacion: el modelo puede generar decisiones preliminares sobre imagenes que luego revisa un humano, acelerando el etiquetado en proyectos de vision.
- Automatizacion de QA sobre capturas de aplicaciones: combinado con el empaquetado de hasta 12 preguntas por forward, permite lanzar baterias de comprobaciones cerradas sobre una misma imagen en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta unicamente validaciones internas:

| Prueba | Resultado |
|---|---|
| Comparacion CPU con mismos pesos, 48 decisiones | 47 decisiones coincidentes, diferencia maxima de probabilidad 0,03363 |
| Comparacion 2 capturas / 24 preguntas / 3 pasadas (2B) | Incremento de RAM fisica tras inferencia: 4,279 GB; durante inferencia: 4,265 GB |
| Comparacion 2 capturas / 24 preguntas / 3 pasadas (3B) | Incremento de RAM fisica tras inferencia: 4,460 GB; durante inferencia: 4,427 GB |

Hardware de validacion: Ryzen AI 7 PRO 350, 32 GB de RAM, Windows 11, Ryzen AI Software 1.8.0. El autor advierte que estas cifras incluyen variacion de fondo del sistema y no miden el arranque del CLI ni la primera compilacion.

## Requisitos de hardware

- NPU: AMD Ryzen AI 300 series (XDNA 2) obligatoria para la ejecucion acelerada; el paquete esta construido sobre Ryzen AI Software 1.8.0.
- Sistema operativo: Windows 11, segun la model card.
- RAM: el autor reporta incrementos de aproximadamente 4,3 GB de RAM fisica durante la inferencia en un sistema con 32 GB.
- Almacenamiento: unos 2,4 GB para los ficheros del modelo, mas los datos de ejecucion generados en el primer uso (almacenados por separado).
- GPU dedicada: no se menciona; el diseno esta orientado a la NPU integrada. No hay datos sobre ejecucion en GPU o CPU como alternativa en esta conversion.
- Despliegue: runtime propio del repositorio tomhda/d1-2b-ryzen-ai-npu, instalado sobre un clon del entorno Ryzen AI Software (`conda create --clone ryzen-ai-1.8.0`). No se debe sustituir el ONNX Runtime del SDK por el paquete de PyPI.
- Latencia y throughput: no disponibles; el unico dato temporal es que la generacion inicial de datos de ejecucion para la NPU puede tardar unos 10 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| d1-2B-ryzen-ai-npu (esta ficha) | 2B | 4096 tokens | ONNX para NPU Ryzen AI 300 | LFM Open License v1.0 | Modelo de decision multimodal, no generativo |
| LiquidAI/d1-2B (base) | 2B | no disponible en la informacion | Pesos originales (safetensors, presumiblemente) | LFM Open License v1.0 | Modelo de decision original, sin optimizacion para NPU |
| LiquidAI/d1-2B-ONNX | 2B | no disponible en la informacion | ONNX generico | LFM Open License v1.0 | Conversion ONNX de referencia, sin optimizacion especifica de NPU |

No se dispone de informacion sobre modelos comparables de otros fabricantes con la misma orientacion de decision multimodal y despliegue en NPU.

## Limitaciones y advertencias

- El modelo no es un chatbot: solo responde preguntas cerradas (`noul`, `choice`, `score`) y no genera texto libre.
- No soporta audio, video ni preguntas de tipo extraccion.
- Solo admite una imagen por inferencia.
- El contexto de runtime esta limitado a 4096 tokens.
- La licencia LFM Open License v1.0 restringe el uso comercial a entidades legales con ingresos anuales inferiores a 10 millones de USD; es necesario leer la licencia completa antes de un uso en produccion.
- La validacion reportada por el autor es limitada (48 decisiones y 24 preguntas) y no constituye una garantia general de precision.
- El reparto NPU/CPU es parcial: embedding, atencion y convoluciones del modelo de lenguaje, y el preprocesado de imagen, siguen en CPU.
- El primer uso requiere generar datos de ejecucion especificos del hardware (unos 10 minutos) y regenerarlos si cambia el entorno.
- Dependencia del SDK de Ryzen AI 1.8.0 y de Windows 11; no se documenta soporte para Linux u otras versiones del SDK.
- Riesgo de alucinacion en las decisiones no cuantificado en la informacion disponible; al ser un modelo de decision, los errores se manifiestan como clasificaciones incorrectas.
- El proyecto no esta afiliado a Liquid AI ni a AMD, y las DLL del SDK de AMD no se redistribuyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tomoali/d1-2B-ryzen-ai-npu
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Modelo base ONNX: https://huggingface.co/LiquidAI/d1-2B-ONNX
- Repositorio del runtime: https://github.com/tomhda/d1-2b-ryzen-ai-npu
- Documentacion en japones: https://github.com/tomhda/d1-2b-ryzen-ai-npu/blob/main/docs/ja/README.md
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio del modelo
