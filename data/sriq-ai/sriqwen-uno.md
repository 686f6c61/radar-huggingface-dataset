# sriq-ai/sriqwen-uno

## Resumen

sriq-ai/sriqwen-uno es un ajuste fino (finetune) multimodal publicado por el usuario sriq-ai en HuggingFace, derivado de unsloth/qwen3.8-27b-unsloth-bnb-4bit. El modelo se distribuye con la libreria transformers, pipeline image-text-to-text, pesos en safetensors y licencia Apache 2.0. El repositorio ocupa 55,6 GB y contiene 27.781.427.952 parametros reales (unos 27,78 mil millones) segun los metadatos de safetensors, lo que sugiere que los pesos publicados estan en precision de 16 bits (bf16/fp16) aunque el modelo base del que parte estuviera cuantizado a 4 bits con bitsandbytes.

El modelo se presenta como un finetune entrenado con Unsloth y la libreria TRL de HuggingFace, con la etiqueta de arquitectura qwen3_5 y orientado a conversacion y generacion de texto e imagenes (image-text-to-text). La model card es extremadamente escueta: no detalla dataset de entrenamiento, numero de tokens, hiperparametros, metodos de alineamiento (RLHF/DPO) ni resultados de evaluacion. Tampoco se declara longitud de contexto, idiomas mas alla del ingles ni variantes de cuantizacion adicionales.

La relevancia de esta ficha es limitada y fundamentalmente documental: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la informacion disponible no permite verificar la procedencia exacta del modelo base (la nomenclatura "qwen3.8-27b" y el tag "qwen3_5" no corresponden a ninguna familia publica identificable de Qwen segun la informacion proporcionada). Por tanto, cualquier evaluacion de calidad, capacidades reales o rendimiento queda pendiente de validacion empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text), etiquetada como qwen3_5 en los tags; detalles de capas, atencion y encoder de vision no disponibles |
| Parametros totales | 27.781.427.952 (~27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el modelo base era bnb-4bit (bitsandbytes) y los pesos publicados estan en safetensors (probablemente bf16/fp16 por el tamano del repo, 55,6 GB). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles), segun el campo language de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna. Los tags del repositorio indican "qwen3_5", "image-text-to-text" y "conversational", lo que apunta a un transformer multimodal con capacidad de procesar imagenes y texto, presumiblemente con un encoder de vision acoplado a un decodificador de lenguaje. No se especifica el numero de capas, dimensiones ocultas, tipo de atencion (completa, lineal o hibrida), ni si emplea mezcla de expertos. El dato de 27,78 mil millones de parametros totales es el unico dato estructural verificable, junto con el tamano del repositorio.

En cuanto al entrenamiento, la model card se limita a afirmar que el modelo fue entrenado "2x faster with Unsloth and Huggingface's TRL library". No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos multimodales, la existencia de fases de instruccion, RLHF, DPO u otros metodos de alineamiento. El punto de partida declarado es unsloth/qwen3.8-27b-unsloth-bnb-4bit, es decir, una version cuantizada a 4 bits de otro modelo, lo que implica que el ajuste fino se realizo sobre pesos cuantizados (QLoRA o similar) y que los pesos finales publicados estan en precision completa tras el merge. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.).

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y el pipeline text-generation-inference indican uso previsto para dialogos multi-turno.
- Procesamiento de imagen y texto (image-text-to-text): el modelo declara entrada multimodal, por lo que seria capaz de responder a instrucciones que combinan imagenes y lenguaje. No se detalla si tambien genera imagenes (no parece ser el caso).
- Razonamiento, codigo y matematicas: no disponible. No hay ninguna declaracion ni evaluacion al respecto en la informacion proporcionada.
- Tool calling / function calling: no disponible. No se menciona soporte de llamadas a herramientas ni formato de plantilla asociado.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay evidencia documental en el repositorio.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card, aunque un modelo base multilingue podria conservar capacidades residuales en otros idiomas; esto no esta confirmado.
- Capacidades especiales (modo thinking, audio, vision avanzada): no disponible, salvo la mencion generica a entrada de imagen.

## Casos de uso

Dado que no existen benchmarks ni documentacion tecnica publicada, los siguientes casos de uso son escenarios plausibles derivados del pipeline declarado (image-text-to-text, conversacional) y deben validarse empiricamente antes de cualquier despliegue en produccion.

- Descripcion y etiquetado de imagenes en catalogos: integrado en un pipeline de e-commerce, el modelo puede recibir una imagen de producto y generar descripciones textuales o etiquetas normalizadas, aprovechando su pipeline image-text-to-text. Requiere validar previamente la calidad de las descripciones en el dominio concreto.
- Asistente conversacional con soporte visual: en aplicaciones de atencion al cliente donde el usuario adjunta capturas de pantalla o fotos de un producto defectuoso, el modelo podria mantener un dialogo multi-turno combinando el contexto visual y textual.
- Extraccion de informacion de documentos escaneados: en tareas de digitalizacion, el modelo puede recibir la imagen de un documento y responder preguntas sobre su contenido (importes, fechas, nombres), siempre que la longitud de contexto lo permita (dato no disponible).
- Generacion de texto asistida por imagen en herramientas de accesibilidad: descripcion de imagenes para usuarios con discapacidad visual, integrada en lectores de pantalla o aplicaciones moviles.
- Prototipado e investigacion en multimodalidad: al ser un finetune con licencia Apache 2.0, es utilizable como punto de partida para experimentos academicos o comparativas de ajuste fino con Unsloth y TRL.
- Base para ajustes finos especificos de dominio: su licencia permisiva y su formato safetensors estandar permiten reentrenar el modelo con LoRA/QLoRA sobre datos propios (legal, medico, industrial) sin restricciones de licencia comercial.
- Moderacion de contenido con imagenes: clasificacion de imagenes y texto asociado en plataformas UGC, aunque la ausencia de evaluaciones de sesgo hace necesaria una auditoria previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion, y los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo (consisten en consultas no relacionadas sobre herramientas de edicion de PDF).

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (27,78 mil millones) y del tamano del repositorio (55,6 GB). No hay mediciones de latencia o throughput publicadas.

- VRAM estimada para inferencia (solo pesos): ~55,6 GB en bf16/fp16; ~28 GB en int8; ~14-16 GB en 4 bits (NF4/GPTQ/AWQ), a lo que hay que sumar la cache KV y las activaciones, que crecen con la longitud de contexto.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 en una sola GPU; A100 40 GB en int8 o con cuantizacion de 4 bits; configuraciones multi-GPU (por ejemplo, 2x A100 40 GB o 2x RTX 4090) mediante tensor parallelism para bf16.
- Compatibilidad con GPU de consumo: si, en 4 bits cabe en una RTX 4090, RTX 3090 o RTX 4080 de 24 GB, y en tarjetas de 16 GB con contexto corto y cuantizacion agresiva. En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles (tags del repositorio), vLLM (compatible con safetensors de transformers, aunque no esta confirmado explicitamente). llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion que el autor no publica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables identificados en la informacion proporcionada: los resultados de busqueda web no guardan relacion con el ambito de modelos de lenguaje. La tabla siguiente usa exclusivamente caracteristicas publicas ampliamente conocidas de alternativas multimodales de tamano similar, como referencia orientativa y no como validacion del modelo evaluado.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sriq-ai/sriqwen-uno | 27,78B | no disponible | imagen + texto | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-VL-32B-Instruct | ~32B (referencia publica) | 128k (referencia publica) | imagen + texto | Apache 2.0 (referencia publica) | Ampliamente disponible |
| Gemma 3 27B | 27B (referencia publica) | 128k (referencia publica) | imagen + texto | Licencia Gemma (referencia publica) | Ampliamente disponible |

Los datos de las filas de Qwen2.5-VL-32B y Gemma 3 27B provienen de conocimiento general sobre sus model cards publicas y no de la informacion proporcionada en esta consulta; deben verificarse en las fuentes oficiales antes de usarse. Para sriqwen-uno no es posible establecer una comparativa de rendimiento porque no existen evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de alineamiento, lo que impide auditar el modelo.
- Procedencia del modelo base no verificable: la nomenclatura "qwen3.8-27b" y el tag "qwen3_5" no se corresponden con ninguna familia publica identificable segun la informacion disponible, lo que genera dudas sobre que modelo se esta utilizando realmente.
- Sobre el ajuste fino sobre pesos cuantizados: el punto de partida es una version bnb-4bit, y el ajuste se realizo presumiblemente con QLoRA sobre pesos cuantizados; la publicacion en precision completa puede arrastrar perdidas de calidad derivadas de la cuantizacion previa.
- Riesgo de alucinacion: no evaluado ni cuantificado. Al no existir benchmarks, no puede descartarse un comportamiento deficiente en tareas factuales, matematicas o de codigo.
- Sesgos conocidos: no disponibles. No hay evaluaciones de sesgo, toxicidad ni equidad.
- Limitaciones de idioma: declarado unicamente para ingles; el rendimiento en castellano u otros idiomas es desconocido.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el autor original no ofrece garantias sobre el modelo ni asume responsabilidad por su uso; conviene revisar tambien las condiciones del modelo base y de los datos de ajuste, no documentados.
- Trazabilidad y mantenimiento: el repositorio tiene 0 descargas y 0 likes, no hay paper, blog ni demo asociados, y las fechas de creacion y actualizacion (13 de septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere metadatos poco fiables o generados automaticamente.
- Para produccion: no recomendado sin una evaluacion previa propia. Se aconseja validar el modelo en el dominio objetivo, medir latencia real y verificar la plantilla de chat y el formato de prompt, no documentados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/sriqwen-uno
- Modelo base declarado: https://huggingface.co/unsloth/qwen3.8-27b-unsloth-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace (citada en la model card): https://github.com/huggingface/trl
- Paper, blog, demo o evaluacion independiente: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con este modelo (contenido sobre herramientas de edicion de PDF en zhihu.com, detail.chiebukuro.yahoo.co.jp y webcli.jp) y no se han utilizado como fuente.
