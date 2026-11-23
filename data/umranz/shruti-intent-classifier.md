# Umranz/shruti-intent-classifier

## Resumen

Shruti Intent Classifier es un clasificador de texto de dos clases desarrollado por el usuario Umranz para el producto "Shruti", un asistente conversacional con IA. Su funcion es discriminar entre peticiones del usuario que solicitan la generacion de una imagen (`IMAGE_GENERATION`) y mensajes que deben resolverse como conversacion de texto (`TEXT_CHAT`). El problema que resuelve es concreto: evitar que el asistente genere imagenes no solicitadas durante conversaciones normales, manteniendo a la vez una alta sensibilidad ante peticiones expresadas de forma natural, romantica o en hinglish.

El modelo parte de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un transformer encoder de tipo BERT con 117.654.530 parametros totales, y se ha afinado como clasificador de secuencias. Se distribuye en formatos safetensors y ONNX, con licencia MIT, y declara soporte para ingles e hindi. Su interes practico radica en el coste de inferencia: segun la model card, con ONNX Runtime sobre CPU de 2 nucleos alcanza una mediana de 12,16 ms por peticion, lo que lo hace viable como filtro previo de un pipeline de generacion de imagenes.

No es un modelo generativo ni un LLM: es un componente de enrutamiento ligero, pensado para integrarse delante de un modelo mayor que decide si invocar un servicio de sintesis de imagen. Su utilidad, por tanto, esta acotada a ese rol de clasificacion binaria con umbral de decision configurable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) |
| Parametros totales | 117.654.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en los ejemplos de uso se trunca a `max_length=128`) |
| Tipos de cuantizacion | no disponible (se distribuye version ONNX, sin detallar precision) |
| Idiomas soportados | en, hi (incluye frases en hinglish segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia BERT, derivado del checkpoint multilingue MiniLM-L12 de sentence-transformers. Sobre esa base se ha realizado un ajuste supervisado para clasificacion de secuencias con dos etiquetas (`IMAGE_GENERATION` y `TEXT_CHAT`). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; unicamente indica que se entreno sobre el dataset `Umranz/shruti-intent-dataset` con un balance exacto 50/50 entre clases.

El autor documenta un conjunto de evaluacion de 900 muestras de holdout y describe categorias adversariales especificas (negaciones, usuarios que comparten sus propias fotos, preguntas sobre fotografia y halagos romanticos) disenadas para medir falsos positivos. Tambien se publica una version ONNX para inferencia en CPU. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.), lo cual es coherente con un clasificador encoder de este tamano.

## Capacidades

- Clasificacion binaria de intencion: distingue entre peticion de generacion de imagen y conversacion de texto.
- Enrutamiento con tres estados mediante umbrales de probabilidad: `IMAGE_GENERATION` (p >= 0,75), `AMBIGUOUS` (0,45 <= p < 0,75) y `TEXT_CHAT` (p < 0,45), segun el ejemplo de la model card.
- Manejo de frases en hinglish y variantes regionales, segun los resultados declarados por el autor.
- Robustez declarada ante negaciones y prohibiciones ("Photo mat bhejna" se clasifica como `TEXT_CHAT`).
- Tolerancia a erratas y jerga, segun la categoria "Typos & Slang Requests".
- Distincion entre peticiones de imagen y mensajes en los que el usuario comparte sus propias fotos.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un clasificador de texto.

## Casos de uso

- Enrutamiento previo en un asistente conversacional: el clasificador se coloca delante del LLM y del servicio de generacion de imagenes; si la salida es `IMAGE_GENERATION`, se invoca el pipeline de sintesis, y si es `TEXT_CHAT`, se responde solo con texto. El coste de 12 ms en CPU permite ejecutarlo en cada turno sin penalizar la latencia percibida.
- Prevencion de generaciones no solicitadas: al filtrar mensajes conversacionales normales, se evita que el asistente envie imagenes fuera de contexto, un fallo habitual en productos con generacion de imagen integrada.
- Gestion de ambiguedad con aclaracion explicita: el estado `AMBIGUOUS` permite que el asistente pregunte "¿quieres que te envie una foto?" en lugar de decidir de forma automatica, reduciendo falsos positivos en produccion.
- Soporte de audiencia hindi/hinglish: el modelo esta afinado para frases como "Apni photo bhejo na please", lo que lo hace adecuado para productos dirigidos a usuarios del subcontinente indio que mezclan ingles e hindi.
- Filtro de seguridad en moderacion de peticiones: al detectar peticiones de imagen con alta confianza, se puede aplicar una capa adicional de politicas antes de llamar al generador (por ejemplo, verificacion de contenido permitido).
- Despliegue en entornos con recursos limitados: la version ONNX permite ejecutar el clasificador en CPU de 2 nucleos a 79,3 req/s, lo que habilita su uso en contenedores pequenos o en el borde sin GPU.
- Clasificacion por lotes en analitica de producto: procesar transcripciones historicas para medir que proporcion de conversaciones deriva en peticiones de imagen, con throughput de 125,6 req/s en una T4.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 900 muestras de holdout:

| Metrica | Valor |
|---|---|
| Accuracy | 100,00 % |
| Macro F1 | 1,0000 |
| Precision ponderada | 1,0000 |
| Recall ponderado | 1,0000 |
| Evaluation loss | 0,0157 |

Desglose por categoria (seleccion de las publicadas en la model card):

| Categoria | Clase objetivo | Accuracy en test |
|---|---|---|
| Peticiones directas de foto (EN) | `IMAGE_GENERATION` | 100,0 % |
| Peticiones de vestimenta y escena | `IMAGE_GENERATION` | 75,0 % |
| Peticiones romanticas de compania | `IMAGE_GENERATION` | 100,0 % |
| Hinglish y dialectos regionales | `IMAGE_GENERATION` | 100,0 % |
| Erratas y jerga | `IMAGE_GENERATION` | 100,0 % |
| Trampa: negaciones y prohibiciones | `TEXT_CHAT` | 69,2 % |
| Trampa: usuario comparte sus fotos | `TEXT_CHAT` | 87,5 % |
| Trampa: preguntas sobre fotografia | `TEXT_CHAT` | 83,3 % |
| Trampa: halagos romanticos | `TEXT_CHAT` | 50,0 % |
| Conversacion casual | `TEXT_CHAT` | 100,0 % |

Latencia y throughput declarados (200 iteraciones, peticiones de una sola frase):

| Runtime | Hardware | P50 | P95 | P99 | Throughput |
|---|---|---|---|---|---|
| ONNX Runtime | CPU (2 nucleos) | 12,16 ms | 13,86 ms | 26,96 ms | 79,3 req/s |
| PyTorch nativo | CPU | 30,02 ms | 38,40 ms | 44,22 ms | 33,9 req/s |
| PyTorch nativo | GPU T4 | 7,71 ms | 9,07 ms | 11,24 ms | 125,6 req/s |

No se han publicado comparaciones con otros clasificadores de intencion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 117,6 M parametros en fp32 el modelo ocupa aproximadamente 470 MB, y en fp16 unos 235 MB, aunque la model card no confirma la precision de los pesos ONNX.
- GPU recomendadas: la model card solo documenta pruebas en una NVIDIA T4; no se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer: el tamano del checkpoint (117,6 M parametros) es muy inferior a la VRAM de una GTX 1650 o superior, aunque no hay benchmarks publicados para estas tarjetas.
- Despliegue: ONNX Runtime (opcion recomendada por el autor para CPU), PyTorch nativo y `transformers` pipeline. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador encoder de este tipo.
- Latencia y throughput: ver tabla de la seccion anterior (12,16 ms P50 en CPU con ONNX; 7,71 ms P50 en T4 con PyTorch).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` es un encoder multilingue de ~118 M parametros con licencia Apache-2.0 y amplia adopcion; este checkpoint lo especializa en una tarea binaria con licencia MIT. No se han publicado comparaciones directas con otros clasificadores de intencion (por ejemplo, variantes de DistilmBERT o XLM-R afinadas para la misma tarea) en la model card.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Shruti Intent Classifier | 117,6 M | no disponible | Clasificacion binaria de intencion | MIT |
| `paraphrase-multilingual-MiniLM-L12-v2` (base) | ~118 M | no disponible | Embeddings de frases | Apache-2.0 |
| Alternativas de clasificacion de intencion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El 100 % de accuracy sobre 900 muestras de holdout debe interpretarse con cautela: el conjunto de evaluacion procede del mismo dataset de entrenamiento (`Umranz/shruti-intent-dataset`) y no se documenta una evaluacion externa independiente.
- Varias categorias adversariales muestran precisiones bajas pese a declarar "cero falsos positivos": halagos romanticos (50,0 %), negaciones (69,2 %) y peticiones de vestimenta/escena (75,0 %). El equilibrio entre clases puede estar sesgando estas cifras.
- El modelo es binario y especifico del producto Shruti; no es un clasificador de intenciones general y no cubre otras categorias de intencion.
- Idiomas declarados: ingles e hindi (con hinglish). No hay evidencia de soporte para castellano ni para otras lenguas.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si existe riesgo de clasificacion erronea en frases ambiguas; el autor mitiga esto con el estado `AMBIGUOUS` y umbrales configurables.
- La licencia MIT permite uso comercial, pero el modelo base tiene licencia Apache-2.0; conviene verificar el cumplimiento de ambas al redistribuir.
- No se documentan sesgos demograficos ni evaluaciones de robustez fuera del dataset del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umranz/shruti-intent-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/Umranz/shruti-intent-dataset
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
