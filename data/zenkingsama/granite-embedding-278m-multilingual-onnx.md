# zenkingsama/granite-embedding-278m-multilingual-onnx

## Resumen

`zenkingsama/granite-embedding-278m-multilingual-onnx` es una copia en formato ONNX del modelo de embeddings `ibm-granite/granite-embedding-278m-multilingual` de IBM, publicada por el usuario zenkingsama. No se trata de un modelo nuevo ni de un reentrenamiento: es una reempaquetado del export oficial ONNX en el que los pesos se han movido a un fichero de datos externo (`onnx/model.onnx_data`) para permitir memory-mapping en lugar de copia en memoria. Los valores numericos son identicos al original.

El modelo resuelve el problema de generar representaciones vectoriales densas de texto para tareas de similitud semantica, recuperacion de informacion (retrieval) y clasificacion por embeddings. Con 278 millones de parametros y arquitectura XLM-RoBERTa, se posiciona en la gama media de modelos de embeddings multilingues, ofreciendo un equilibrio entre calidad y coste computacional para pipelines de RAG y busqueda semantica.

Su relevancia actual radica en el formato de entrega: al usar datos externos ONNX, el fichero principal (`model.onnx`, 252 KB) es ligero y los pesos (1,11 GB) se cargan por memory-mapping, lo que reduce el consumo de RAM en despliegues con ONNX Runtime y facilita el uso en entornos con memoria limitada o multiples procesos que comparten el mismo artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) |
| Parametros totales | 278 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el artefacto no esta cuantizado; pesos en precision original) |
| Idiomas soportados | multilingue (el nombre del modelo base lo indica; lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`onnx/model.onnx` + `onnx/model.onnx_data`) |

## Arquitectura y entrenamiento

El modelo subyacente es `ibm-granite/granite-embedding-278m-multilingual`, un encoder transformer basado en XLM-RoBERTa con 278 millones de parametros. La arquitectura es la clasica de RoBERTa: atencion bidireccional, sin decodificador, disenada para producir embeddings contextuales de secuencias completas. El pooling es CLS (se toma el vector del token `[CLS]`), y la salida debe normalizarse L2 para obtener embeddings unitarios comparables por similitud coseno.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens, la composicion linguistica ni si hubo fases de contraste o ajuste fino con datos sinteticos. La model card del artefacto ONNX no incluye estos datos; solo documenta el proceso de conversion. La innovacion tecnica de este repositorio concreto es puramente de empaquetado: los inicializadores del export oficial se guardan como datos externos ONNX (tensores de al menos 1024 bytes en un unico fichero `onnx/model.onnx_data`), lo que permite memory-mapping. El autor verifica fidelidad bit a bit contra el export oficial en 13 textos de prueba (ingles, chino, japones, frances, aleman, textos muy cortos y truncados) a batch size 1 y 8, con diferencia absoluta maxima de 0.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y busqueda vectorial.
- Extraccion de caracteristicas (`feature-extraction`) a nivel de secuencia con pooling CLS.
- Soporte multilingue heredado del modelo base (idiomas concretos no listados en la informacion disponible).
- Compatible con `text-embeddings-inference` y `endpoints_compatible` segun los tags del repositorio.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder de embeddings, no un modelo generativo.
- No soporta vision ni audio.
- No dispone de modo "thinking" ni capacidades de instruccion.

## Casos de uso

- Busqueda semantica en corpus multilingues: el modelo genera vectores normalizados que permiten indexar documentos en varios idiomas y recuperar por similitud coseno; su naturaleza multilingue evita mantener un modelo por idioma.
- Pipelines de RAG (retrieval-augmented generation): se usa como encoder de recuperacion para embeber fragmentos de documentacion y consultas de usuario, alimentando un LLM generativo con los pasajes mas relevantes.
- Deduplicacion y clustering de textos: agrupando embeddings por distancia coseno se detectan documentos duplicados o casi duplicados en grandes repositorios, con coste de inferencia bajo gracias a los 278M de parametros.
- Clasificacion de tickets y correos: los embeddings sirven como entrada a un clasificador ligero (regresion logistica o MLP) para enrutar soporte al cliente por categoria, sin necesidad de un LLM generativo.
- Moderacion y filtrado de contenido: comparando la similitud de un texto con un conjunto de embeddings de referencia de contenido prohibido o permitido.
- Despliegue en entornos con memoria limitada: el layout de datos externos ONNX permite memory-mapping, de modo que varios procesos de ONNX Runtime pueden compartir los mismos pesos en pagina de memoria, util en contenedores con RAM restringida o en funciones serverless.
- Evaluacion de similitud entre pares de frases: para tareas de paraphrase detection o scoring de respuestas en sistemas de QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la fidelidad numerica contra el export oficial (diferencia absoluta maxima de 0 en 13 textos de prueba a batch size 1 y 8), no metricas de calidad como MMLU, MTEB o similares.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,1 GB para los pesos en precision original (tamano de `onnx/model.onnx_data`), mas overhead de activaciones y tokenizador; en la practica, entre 1,5 y 2,5 GB de RAM segun batch size y longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para alto throughput, A10G, L4, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante).
- Opciones de despliegue: ONNX Runtime (libreria nativa del artefacto), `text-embeddings-inference` (segun tags), y por compatibilidad con el modelo base, frameworks que acepten el export ONNX. No se documenta soporte de llama.cpp ni Ollama (no aplica a un encoder de embeddings).
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 278M, se espera un throughput alto en GPU (cientos a miles de secuencias por segundo en batch), pero no hay cifras publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-embedding-278m-multilingual-onnx (este) | 278M | no disponible | Apache 2.0 | ONNX (datos externos) | Copia fiel del export oficial; sin cuantizar |
| ibm-granite/granite-embedding-278m-multilingual | 278M | no disponible | Apache 2.0 | safetensors / ONNX oficial | Modelo base original de IBM |
| Alternativas de embeddings multilingues de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento (benchmarks) con alternativas como multilingual-e5 o BGE-M3; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona y no soporta tool calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validacion comunitaria.
- No se documentan los idiomas concretos soportados ni el contexto maximo; ambos datos deben consultarse en la model card del modelo base de IBM.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy especializados o con jerga no representada en el entrenamiento.
- Sesgos: no documentados en la informacion disponible; heredados del corpus de entrenamiento del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE incluidos en el repositorio.
- El layout de datos externos requiere que el runtime cargue `onnx/model.onnx_data` junto a `onnx/model.onnx`; si se copia solo el fichero principal, la inferencia fallara.
- No esta cuantizado; para despliegues con requisitos estrictos de memoria habria que cuantizar por separado (no incluido en este artefacto).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zenkingsama/granite-embedding-278m-multilingual-onnx
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-278m-multilingual
- Revision del modelo base usada: `a9cb5338491faf32b73dd17b714a31821c021bbf`
- Script de conversion: `scripts/prepare-embedding-artifact.py` en el repositorio Slipwiki (no se proporciona URL directa en la informacion disponible)
