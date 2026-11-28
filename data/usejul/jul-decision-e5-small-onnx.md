# usejul/jul-decision-e5-small-onnx

## Resumen

`jul-decision-e5-small-onnx` es la compilación en formato ONNX del modelo `usejul/jul-decision-e5-small`, desarrollado por el autor `usejul` como componente del proyecto [jul](https://github.com/usejul/jul). Se trata de un modelo BERT de pequeno tamano orientado a clasificacion zero-shot y a la generacion de embeddings para decisiones de enrutamiento o seleccion, empaquetado especificamente para ejecucion en CPU con pesos de 8 bits y embeddings de 4 bits, con un tamano de 98 MB por parte. El repositorio incluye los vectores en la raiz y un modelo de tipo cross en el subdirectorio `cross/`.

La relevancia de esta ficha radica en que el modelo esta optimizado para despliegues de bajos recursos, hasta el punto de que una de sus partes cabe en un paquete de AWS Lambda junto con la herramienta jul. Segun la model card, el modelo alcanza 0.609 en los conjuntos de desarrollo de jul para tareas zero-shot, frente a 0.536 de la variante e5-small de 8 bits, con latencias de 4 ms por texto para los vectores y de 4 a 7 ms por par si/no para el modelo cross, todo ello en una sola CPU.

La licencia es Apache 2.0, lo que facilita su uso comercial, y los idiomas declarados son ingles, frances y multilingue. El repositorio tiene 0.3 GB y registra 187 descargas en el momento de la consulta, sin likes. No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los detalles de entrenamiento mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (modelo base `usejul/jul-decision-e5-small`), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos de 8 bits, embeddings de 4 bits (build ONNX para CPU) |
| Idiomas soportados | en, fr, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (vectores en la raiz, modelo cross en `cross/`) |

## Arquitectura y entrenamiento

El modelo base es `usejul/jul-decision-e5-small`, de arquitectura BERT segun las etiquetas del repositorio. La variante aqui descrita es una compilacion ONNX pensada para inferencia en CPU, con cuantizacion de pesos a 8 bits y de embeddings a 4 bits, lo que reduce el tamano a 98 MB por parte. El repositorio contiene dos componentes: los vectores en la raiz del repositorio y un modelo cross en el subdirectorio `cross/`, que se emplea para la clasificacion si/no.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla de la cuantizacion y el empaquetado para despliegue en CPU. La model card remite a la ficha del modelo principal para consultar resultados, entrenamiento y licencia. Existe una revision `v1.0` que corresponde a la primera build y que solo contiene los vectores.

## Capacidades

- Clasificacion zero-shot: el modelo se etiqueta con el pipeline `zero-shot-classification` y evalua pares si/no mediante el modelo cross.
- Generacion de embeddings: los vectores de la raiz del repositorio permiten representar textos para tareas de similitud o seleccion.
- Soporte multilingue limitado a los idiomas declarados: ingles, frances y multilingue.
- Ejecucion en CPU: disenado para inferencia sin GPU, con latencias de milisegundos.
- Integracion con la herramienta jul: se anade con `jul models add jul-decision-e5-small --repo usejul/jul-decision-e5-small-onnx --backend onnx`.
- Empaquetado para serverless: una de las partes cabe en un paquete de AWS Lambda junto con jul, y `jul pack` indica que parte necesita un conjunto de preguntas.
- No se documentan capacidades de generacion de texto libre, razonamiento multi-paso, tool calling, vision ni audio.

## Casos de uso

- Clasificacion zero-shot en produccion: el modelo permite asignar etiquetas a textos sin entrenamiento especifico, evaluando pares si/no con el modelo cross a 4-7 ms por par en una CPU, lo que lo hace adecuado para pipelines de moderacion o etiquetado en tiempo real.
- Enrutamiento de decisiones en aplicaciones: los vectores permiten calcular similitudes y decidir a que rama o categoria enviar una consulta, con 4 ms por texto, integrable en un backend de baja latencia.
- Despliegue serverless en AWS Lambda: al caber una parte en el paquete de Lambda junto con jul, se puede desplegar un clasificador zero-shot sin infraestructura GPU, segun la guia oficial de AWS Lambda del proyecto.
- Preprocesado y filtrado de datos: el modelo puede usarse para clasificar o seleccionar documentos y textos en ingles y frances antes de pasarlos a modelos mayores, reduciendo coste computacional.
- Busqueda semantica ligera: los embeddings de la raiz permiten indexar y recuperar textos por similitud en entornos con recursos limitados, sin necesidad de GPU.
- Prototipado rapido de clasificadores: gracias a la licencia Apache 2.0 y al formato ONNX, se puede integrar en entornos Python con ONNX Runtime para validar hipotesis de clasificacion antes de invertir en modelos mayores.
- Sistemas embebidos o edge: el tamano de 98 MB por parte y la inferencia en CPU lo hacen viable en dispositivos con memoria limitada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Zero-shot en conjuntos de desarrollo de jul | 0.609 (frente a 0.536 de e5-small 8-bit) |
| Latencia de vectores | 4 ms por texto, en una CPU |
| Latencia del modelo cross | 4-7 ms por par si/no, en una CPU |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para CPU; no se especifica requisito de VRAM.
- GPU recomendadas: no disponibles; el build esta orientado a CPU.
- Cabe en GPU consumer: no se documenta; el objetivo es ejecucion en CPU.
- Opciones de despliegue: ONNX Runtime, la herramienta jul con backend ONNX, y AWS Lambda mediante el empaquetado de jul.
- Latencia y throughput: 4 ms por texto para los vectores y 4-7 ms por par si/no para el modelo cross en una sola CPU; no se especifica throughput agregado.
- Almacenamiento: 98 MB por parte, con un repositorio total de 0.3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `usejul/jul-decision-e5-small-onnx` | no disponible | no disponible | 0.609 zero-shot en dev sets de jul | Apache 2.0 | ONNX, CPU |
| `usejul/jul-decision-e5-small` (8-bit) | no disponible | no disponible | 0.536 zero-shot en dev sets de jul | Apache 2.0 | Modelo base |
| Otros modelos zero-shot comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con la variante e5-small de 8 bits del propio proyecto, sobre la que esta build mejora en 0.073 puntos en los conjuntos de desarrollo de jul. No se dispone de datos de benchmarks frente a alternativas externas.

## Limitaciones y advertencias

- El modelo esta especializado en clasificacion zero-shot y embeddings; no es un modelo generativo y no debe usarse para tareas de generacion de texto.
- Los idiomas declarados son ingles, frances y multilingue; no se garantiza un rendimiento equivalente en castellano ni en otros idiomas no documentados.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni evaluaciones de robustez.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento con textos largos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la ficha del modelo base para condiciones adicionales.
- El rendimiento reportado (0.609) corresponde a los conjuntos de desarrollo propios de jul, no a benchmarks estandar, por lo que no es directamente comparable con otros modelos.
- La cuantizacion a 8 bits y 4 bits puede introducir perdida de precision frente al modelo base sin cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usejul/jul-decision-e5-small-onnx
- Modelo base: https://huggingface.co/usejul/jul-decision-e5-small
- Repositorio del proyecto jul: https://github.com/usejul/jul
- Guia de AWS Lambda: https://github.com/usejul/jul/blob/main/docs/aws-lambda.md
