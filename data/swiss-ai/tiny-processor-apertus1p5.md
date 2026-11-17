# swiss-ai/tiny-processor-apertus1p5

## Resumen

El repositorio `swiss-ai/tiny-processor-apertus1p5` no es un modelo de lenguaje, sino un checkpoint reducido que contiene exclusivamente el procesador (tokenizer y procesador de imagen) de la familia Apertus 1.5, desarrollada por el equipo de Swiss AI. Su funcion es servir como fixture de pruebas para validar la implementacion de `Apertus1p5Processor` en la libreria Transformers, de modo que los desarrolladores puedan verificar el comportamiento del procesador sin descargar los checkpoints completos.

El checkpoint replica la estructura del procesador de `swiss-ai/Apertus-v1.5-8B` (revision `9e478a7c9833d661d1e13fc49a68648c338f6acb`) pero con un vocabulario truncado: 656 tokens totales frente a los 266.440 del modelo real, y una tabla BPE de 520 entradas frente a las 131.072 originales. Conserva, eso si, las 8 fichas estructurales de imagen y audio, 64 codigos visuales y 64 codigos de audio, ademas del procesador de imagen, el extractor de caracteristicas y la plantilla de chat identicos a los del modelo completo.

Es relevante ahora porque Apertus 1.5 es una de las apuestas europeas por modelos multimodales abiertos con licencia permisiva, y contar con un fixture ligero agiliza el desarrollo y las pruebas de integracion en Transformers sin necesidad de infraestructura de GPU. No obstante, conviene subrayar que este checkpoint no contiene pesos y no puede utilizarse para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | procesador multimodal (tokenizer BPE + procesador de imagen) para la familia Apertus 1.5; sin pesos de modelo |
| Parametros totales | 0 (no contiene pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; artefactos de procesador (`tokenizer.json` de 53 KB, procesador de imagen, extractor de caracteristicas, plantilla de chat) |
| Tamano del vocabulario | 656 tokens totales (BPE de 520 entradas, ids 0 a 519) |
| Tokens especiales y anadidos | 20 |
| Tokens estructurales de imagen y audio | 8 (ids 520 a 527) |
| Codigos de imagen `<\|visual token N\|>` | 64 (ids 528 a 591) |
| Codigos de audio `<\|audio token N\|>` | 64 (ids 592 a 655) |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Este checkpoint no entrena ningun modelo: es un artefacto de configuracion derivado del procesador de `swiss-ai/Apertus-v1.5-8B`. La arquitectura subyacente que representa es la de Apertus 1.5, un modelo multimodal de tipo image-text-to-text con soporte tambien de audio, segun se deduce de la presencia de codigos `<|audio token N|>` y tokens estructurales de audio en el vocabulario. El procesador original emplea un tokenizer BPE con 131.072 entradas y 1.190 tokens especiales, mas 131.072 codigos visuales y 4.096 codigos de audio; este fixture reduce esas cifras a 520 entradas BPE, 20 tokens especiales, 64 codigos visuales y 64 codigos de audio.

La innovacion tecnica del repositorio es precisamente su caracter de fixture: al conservar intactos el procesador de imagen, el extractor de caracteristicas y la plantilla de chat, permite ejecutar pruebas de integracion del `Apertus1p5Processor` en Transformers con un `tokenizer.json` de 53 KB en lugar de 44 MB. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- No tiene capacidades de inferencia: no contiene pesos y no puede generar texto, codigo ni razonamiento.
- Sirve como fixture de pruebas para validar la implementacion de `Apertus1p5Processor` en Transformers.
- Permite verificar el comportamiento del tokenizer BPE truncado (520 entradas) y de los 20 tokens especiales incluidos.
- Permite probar la gestion de tokens estructurales de imagen y audio (8 tokens, ids 520 a 527).
- Permite probar la codificacion y decodificacion de codigos visuales (64, ids 528 a 591) y de audio (64, ids 592 a 655).
- Reproduce fielmente el procesador de imagen, el extractor de caracteristicas y la plantilla de chat del modelo real.
- No soporta tool calling, agentes ni razonamiento multi-paso por si mismo; esas capacidades corresponden a los checkpoints completos Apertus-v1.5-8B y 70B.
- Idiomas soportados: no disponible.

## Casos de uso

- Pruebas unitarias del procesador en Transformers: usar el checkpoint para verificar que `Apertus1p5Processor` tokeniza y decodifica correctamente sin descargar los 44 MB de `tokenizer.json` del modelo completo.
- Integracion continua en el repositorio de Transformers: incluir el fixture en la suite de tests para detectar regresiones en el manejo de tokens especiales, estructurales y de modalidad (imagen y audio) en cada pull request.
- Validacion de plantillas de chat: comprobar que la plantilla de chat identica a la del modelo real genera las secuencias esperadas en conversaciones de prueba con texto e imagenes.
- Desarrollo de pipelines de preprocesado multimodal: probar la logica de extraccion de caracteristicas de imagen y de insercion de codigos visuales antes de escalar al modelo de 8B o 70B.
- Formacion y documentacion: servir de ejemplo minimo y legible para explicar como se estructura el vocabulario de Apertus 1.5 (BPE, tokens especiales, codigos visuales y de audio) en talleres o tutoriales.
- Depuracion de errores de tokenizacion: aislar problemas de vocabulario o de normalizacion con un conjunto de 656 tokens manejable, antes de reproducirlos sobre el vocabulario completo de 266.440 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no contener pesos, el checkpoint no es evaluable en tareas de generacion, razonamiento o codigo.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el checkpoint no contiene pesos y no puede ejecutar inferencia.
- GPU recomendadas: no aplica. Para los modelos reales, consultese la documentacion de `swiss-ai/Apertus-v1.5-8B` y `swiss-ai/Apertus-v1.5-70B`.
- Ejecucion en GPU de consumo: no aplica a este fixture; su uso es en CPU como parte de tests de software.
- Opciones de despliegue: carga mediante la libreria `transformers` como procesador (`Apertus1p5Processor`); no es desplegable en vLLM, llama.cpp, Ollama ni TGI porque no hay pesos.
- Latencia y throughput: no disponibles; irrelevantes para un artefacto de pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Uso previsto |
|---|---|---|---|---|---|
| swiss-ai/tiny-processor-apertus1p5 | 0 (solo procesador) | no disponible | No | Apache 2.0 | Fixture de pruebas del procesador |
| swiss-ai/Apertus-v1.5-8B | 8B | no disponible | Si | no disponible en la informacion proporcionada | Inferencia multimodal image-text-to-text |
| swiss-ai/Apertus-v1.5-70B | 70B | no disponible | Si | no disponible en la informacion proporcionada | Inferencia multimodal image-text-to-text |

No se dispone de informacion sobre otros fixtures de procesador comparables ni sobre modelos de la competencia con los que contrastar rendimiento.

## Limitaciones y advertencias

- No contiene pesos: es imposible usarlo para inferencia, generacion de texto o cualquier tarea predictiva.
- El vocabulario esta truncado (656 tokens frente a 266.440), por lo que cualquier prueba de tokenizacion sobre texto real producira resultados distintos a los del modelo completo.
- Solo incluye 64 codigos visuales y 64 de audio, frente a 131.072 y 4.096 respectivamente en el modelo real; no sirve para validar coberturas amplias de modalidades.
- Los 20 tokens especiales incluidos cubren unicamente los usados por la configuracion del tokenizer, la plantilla de chat y el normalizador; pueden faltar casos limite presentes en el modelo completo.
- No se han documentado sesgos ni riesgos de alucinacion porque no hay modelo generativo; esos riesgos deben evaluarse en los checkpoints Apertus-v1.5-8B y 70B.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su unico proposito es el testing; no debe presentarse como modelo desplegable.
- Para produccion con Apertus 1.5 es obligatorio usar los checkpoints completos y revisar su licencia y limitaciones especificas.

## Enlaces

- Hugging Face: https://huggingface.co/swiss-ai/tiny-processor-apertus1p5
- Modelo completo 8B: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Modelo completo 70B: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Revision de origen del procesador: `9e478a7c9833d661d1e13fc49a68648c338f6acb` (en el repositorio de Apertus-v1.5-8B)
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
