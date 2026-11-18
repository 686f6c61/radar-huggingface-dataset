# xl-24/gemma4-26b-atc-finetune-32-64-merged-16bit

## Resumen

`xl-24/gemma4-26b-atc-finetune-32-64-merged-16bit` es un ajuste fino (finetune) del modelo `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4 de Google, con 25.805.936.206 parámetros totales según los pesos en safetensors, y distribuido en formato de 16 bits con un repositorio de 51,6 GB. El nombre del repositorio sugiere un entrenamiento con longitudes de secuencia de 32 a 64 (probablemente 32k-64k tokens) y una fusión posterior de los adaptadores LoRA en los pesos base.

El modelo está pensado para generación de texto conversacional y procesamiento conjunto de imagen y texto, e incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con despliegues gestionados de Hugging Face. El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, según declara el autor.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo derivado de escasa difusión (0 descargas y 0 likes en el momento de la consulta), sin model card detallada, sin benchmarks publicados y con información muy escasa sobre el dataset de ajuste. Resulta útil como referencia para quien quiera reproducir el pipeline de finetuning de Gemma 4 con Unsloth, pero no como un modelo listo para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text) derivada de Gemma 4; detalles de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible (el sufijo A4B del modelo base sugiere arquitectura MoE con ~4B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible (el nombre del repositorio menciona "32-64", posiblemente longitudes de entrenamiento, sin confirmar) |
| Tipos de cuantizacion | pesos publicados en 16 bits (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-26B-A4B-it`, que a su vez es una version optimizada de Gemma 4 26B A4B publicada por Unsloth. La arquitectura subyacente es la de Gemma 4, un transformer multimodal capaz de procesar imagenes y texto, aunque la informacion proporcionada no detalla la composicion exacta de capas, atencion ni el mecanismo de mezcla de expertos que sugiere el sufijo A4B. Los pesos se han fusionado (merged) en precision de 16 bits, lo que implica que el resultado es un checkpoint autonomo sin adaptadores separados.

El entrenamiento se realizo con Unsloth y TRL, segun la model card, y el autor afirma que fue "2x mas rapido" gracias a Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La unica pista sobre la configuracion de entrenamiento es el nombre del repositorio, que menciona "32-64", posiblemente longitudes de secuencia o rangos de LoRA, sin confirmacion oficial.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que permite tareas de descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de documentos escaneados.
- Compatibilidad declarada con `text-generation-inference` y con endpoints gestionados de Hugging Face.
- Capacidad de tool calling y function calling: no documentada en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking, vision avanzada o audio: solo se confirma vision por el pipeline image-text-to-text; el resto no esta documentado.

## Casos de uso

- Descripcion automatica de imagenes en catalogos de producto: el modelo puede recibir una imagen y generar una descripcion textual en ingles, util para tiendas online que necesiten metadatos automaticos. Es adecuado por su pipeline image-text-to-text, aunque requiere validacion humana por la falta de benchmarks.
- Respuesta a preguntas sobre documentos escaneados: al combinar vision y texto, puede extraer informacion de facturas, formularios o capturas y responder preguntas concretas en ingles. Adecuado para prototipos internos de digitalizacion.
- Asistente conversacional en ingles para prototipos: su naturaleza conversacional y su licencia Apache 2.0 permiten integrarlo en demos de atencion al cliente sin coste de licencia, siempre que se evalue su calidad previamente.
- Generacion de codigo asistida: no hay evidencia de rendimiento en codigo, pero al derivar de Gemma 4 puede usarse en tareas basicas de autocompletado o explicacion de fragmentos, con cautela y validacion.
- Investigacion sobre finetuning multimodal: el repositorio sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre Gemma 4, util para investigadores que quieran replicar el proceso con sus propios datos.
- Clasificacion y etiquetado de contenido visual: el modelo puede generar etiquetas o categorias a partir de imagenes en ingles, adecuado para tareas de moderacion o catalogacion en entornos controlados.
- Base para nuevos ajustes finos: al estar en formato safetensors de 16 bits y con licencia Apache 2.0, puede servir como punto de partida para finetuning adicional en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 51,6 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 64-80 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB con tensor parallelism) para el checkpoint en 16 bits.
- En GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en 16 bits; seria necesario cuantizar a 8 o 4 bits, pero no se documentan cuantizaciones oficiales en la informacion proporcionada.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints gestionados de Hugging Face. No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xl-24/gemma4-26b-atc-finetune-32-64-merged-16bit | 25,8B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Finetune de Gemma 4 26B A4B con Unsloth; sin benchmarks |
| unsloth/gemma-4-26B-A4B-it (modelo base) | 25,8B (aprox.) | no disponible | no disponible en la informacion proporcionada | Hugging Face | Checkpoint base del que deriva este finetune; sin datos de rendimiento en la informacion |
| Gemma 4 26B A4B (original de Google) | 25,8B (aprox.) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo original de la familia; sin datos verificados en esta ficha |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo entrenado principalmente en ingles, es probable que herede sesgos culturales y linguisticos del corpus original, pero no hay evidencia concreta en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones de fidelidad, por lo que no se recomienda su uso en produccion sin validacion previa.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta confirmada y el nombre del repositorio sugiere valores de 32-64 sin especificar unidades.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base `unsloth/gemma-4-26B-A4B-it` podria tener terminos adicionales no reflejados en la informacion proporcionada; conviene verificar la licencia del modelo base antes de un uso comercial.
- Caveats para produccion: 0 descargas y 0 likes indican ausencia de validacion por la comunidad; la model card es minima y no incluye datos de entrenamiento, evaluacion ni limitaciones; el checkpoint en 16 bits requiere hardware de gama alta.
- El nombre del repositorio menciona "32-64" sin aclarar si se refiere a longitudes de secuencia, rangos de LoRA u otra configuracion, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-26b-atc-finetune-32-64-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
