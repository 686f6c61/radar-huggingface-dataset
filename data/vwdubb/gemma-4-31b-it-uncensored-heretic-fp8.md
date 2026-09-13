# vwdubb/gemma-4-31B-it-uncensored-heretic-FP8

## Resumen

`vwdubb/gemma-4-31B-it-uncensored-heretic-FP8` es una cuantizacion en FP8 del modelo `llmfan46/gemma-4-31B-it-uncensored-heretic`, que a su vez es una version "decensurada" de `google/gemma-4-31B-it` obtenida mediante tecnicas de abliteracion. El pipeline declarado es `image-text-to-text`, es decir, se trata de un modelo multimodal que acepta imagenes y texto como entrada y genera texto. Cuenta con 31.273.088.876 parametros (31,27 mil millones) y un repositorio de 33,3 GB en formato safetensors con pesos comprimidos (`compressed-tensors`). El autor de esta version FP8 es el usuario `vwdubb`; la desensuracion original corresponde a `llmfan46`.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo multimodal de ~31B con supuesta arquitectura Gemma 4, una modificacion deliberada del alineamiento de seguridad (abolicion de rechazos) y una cuantizacion FP8 que reduce el peso a la mitad respecto a BF16, lo que abarata el despliegue en GPU de gama profesional. Segun la model card del modelo base, la tasa de rechazos cae de 99/100 a 10/100 manteniendo una divergencia KL de 0,0541 y un MMLU de 85,90% frente al 86,50% del original.

Es importante senalar que el modelo fue creado y actualizado el 13 de septiembre de 2026, con 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, por lo que no existe validacion independiente de la comunidad. Ademas, los metadatos declaran licencia `apache-2.0` mientras que el campo `license_link` apunta a la licencia de Gemma 4, una contradiccion que se detalla en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`); detalles de la arquitectura no disponibles |
| Parametros totales | 31.273.088.876 (31,27 mil millones) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (`compressed-tensors`). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Metadatos: `apache-2.0`; enlace de licencia: licencia de Gemma 4 (contradiccion entre ambos) |
| Formato de pesos | `safetensors` con cuantizacion FP8 (`compressed-tensors`); repositorio de 33,3 GB |
| Desarrollador | `vwdubb` (cuantizacion FP8); modelo base de `llmfan46`; original de Google |
| Modelo base | `llmfan46/gemma-4-31B-it-uncensored-heretic` |
| Modelo original | `google/gemma-4-31B-it` |
| Pipeline | `image-text-to-text` (entrada multimodal imagen + texto, salida de texto) |
| Libreria | `transformers` |
| Compatibilidad | `endpoints_compatible` (etiqueta), `compressed-tensors` |
| Fecha de publicacion | 13 de septiembre de 2026 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Por el pipeline declarado (`image-text-to-text`) y el nombre del modelo se deduce una arquitectura transformer multimodal con capacidad de procesar imagenes, pero no se especifican el numero de capas, la dimension del modelo, el mecanismo de atencion ni el codificador visual. Un dato indirecto relevante es que la abliteracion se aplico sobre los indices de capa 30 a 48, lo que sugiere que el modelo tiene al menos 48 capas, aunque este extremo no se confirma de forma explicita.

Tampoco se publican datos sobre el entrenamiento: numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo unico documentado es el proceso de post-procesado del modelo base: la desensuracion se realizo con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA), una tecnica de abliteracion que modifica los pesos para reducir la probabilidad de respuestas de rechazo. Los parametros declarados de la ablacion son: `start_layer_index` 30, `end_layer_index` 48, `preserve_good_behavior_weight` 0,5437, `steer_bad_behavior_weight` 0,0005, `overcorrect_relative_weight` 0,9949 y `neighbor_count` 15, con el componente objetivo `attn.o_proj`. Esta version concreta anade una cuantizacion FP8 sobre el modelo ya abliterado, de la que no se documenta el proceso de calibracion.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (`conversational` en las etiquetas).
- Procesamiento de entrada multimodal imagen-texto: el pipeline `image-text-to-text` implica capacidad de interpretar imagenes junto a instrucciones de texto.
- Razonamiento y conocimiento general: el modelo base obtiene 85,90% de precision en MMLU sobre 7021 preguntas segun la model card.
- Resolucion de preguntas de nivel academico y profesional en materias como derecho, medicina, psicologia, matematicas y economia (ver desglose en la seccion de benchmarks).
- Reduccion drastica de rechazos: la model card reporta 10/100 rechazos frente a 99/100 del original, lo que se traduce en menos negativas, sermones y evasivas ante consultas que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en los metadatos).

## Casos de uso

- Investigacion sobre alineamiento de seguridad: permite comparar el comportamiento de un modelo alineado (`google/gemma-4-31B-it`) con su variante abliterada, evaluando la tasa de rechazos y la divergencia KL de 0,0541 como metrica de deriva conductual.
- Red teaming y evaluacion de robustez: util como sujeto de pruebas para medir hasta que punto la abliteracion de `attn.o_proj` en las capas 30-48 altera la generacion ante prompts adversarios.
- Generacion de contenido creativo sin filtros: el modelo evita las respuestas de rechazo en un 90% de los casos, lo que resulta util para ficcion, narrativa adulta o guiones que los modelos alineados suelen declinar.
- Analisis de documentos con imagenes: gracias al pipeline imagen-texto, puede extraer y comentar informacion de capturas, diagramas o figuras insertadas en documentacion tecnica, siempre que la ventana de contexto lo permita (longitud no publicada).
- Asistente conversacional de dominio restringido: integrable mediante `transformers` o un servidor compatible con endpoints, con el requisito de filtrar la salida en produccion dado el caracter no censurado del modelo.
- Despliegue en infraestructura con VRAM limitada: la cuantizacion FP8 reduce los pesos a aproximadamente 31,3 GB, lo que permite servir un modelo de 31B en una unica GPU de 48 GB, algo inviable en BF16 en ese mismo hardware.
- Evaluacion comparativa de cuantizaciones: sirve para medir el impacto adicional de FP8 sobre un modelo ya degradado por abliteracion, comparando su MMLU con el 85,90% reportado para la version sin cuantizar.
- Base para ajuste fino con LoRA: al estar en formato `safetensors` y libreria `transformers`, es tecnicamente cargable en pipelines de fine-tuning, aunque no se documenta compatibilidad explicita con entrenamiento en FP8.

## Benchmarks y rendimiento

Los unicos datos de benchmarks disponibles corresponden al modelo base abliterado (Heretic, sin cuantizar FP8), no a la version FP8 de esta ficha. No se han publicado resultados de benchmarks especificos para la cuantizacion FP8.

| Modelo | Metrica | MMLU (7021 preguntas) | Aciertos | Fallos de parseo |
|---|---|---|---|---|
| `google/gemma-4-31B-it` (original) | Precision MMLU | 86,50% | 6073 | 52 |
| `llmfan46/gemma-4-31B-it-uncensored-heretic` | Precision MMLU | 85,90% | 6031 | 37 |
| `vwdubb/gemma-4-31B-it-uncensored-heretic-FP8` | Precision MMLU | No publicado | No disponible | No disponible |

Desglose por materia reportado para el modelo original (seleccion de las puntuaciones mas altas y mas bajas):

| Materia | Precision | Aciertos / Total |
|---|---|---|
| high_school_computer_science | 98,08% | 51/52 |
| marketing | 97,25% | 106/109 |
| high_school_microeconomics | 97,06% | 132/136 |
| college_biology | 96,88% | 62/64 |
| high_school_psychology | 96,30% | 260/270 |
| medical_genetics | 96,08% | 49/51 |
| professional_law | 76,82% | 603/785 |
| college_mathematics | 74,55% | 41/55 |
| public_relations | 73,77% | 45/61 |
| college_physics | 68,42% | 39/57 |
| global_facts | 60,78% | 31/51 |
| college_chemistry | 57,45% | 27/47 |
| high_school_mathematics | 53,54% | 68/127 |
| virology | 51,69% | 46/89 |

Metricas de comportamiento reportadas en la model card:

| Metrica | Modelo abliterado | Modelo original |
|---|---|---|
| Divergencia KL | 0,0541 | 0 (por definicion) |
| Tasa de rechazos | 10/100 | 99/100 |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos FP8: aproximadamente 31,3 GB solo para pesos; con overhead de runtime, cache KV y contexto extendido, el consumo realista se situa entre 36 y 48 GB.
- GPU recomendadas: NVIDIA H100 80 GB, A100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Para configuraciones en paralelo, 2 x RTX 4090 o 2 x RTX 5090 (24 GB cada una) con tensor parallelism.
- A100 40 GB: encaje muy ajustado, con poco margen para cache KV; requeriria contextos cortos y lotes pequenos.
- GPU de consumo: no cabe en una unica GPU de 24 GB (RTX 4090, 3090, 5090) en FP8. Seria necesario recurrir a cuantizacion adicional (GGUF/AWQ/GPTQ), que no se publica en este repositorio, o a descarga parcial en CPU.
- Requisito de kernels FP8: la ejecucion nativa de FP8 requiere GPUs con compute capability 8.9 o superior (Ada Lovelace, Hopper). En arquitecturas Ampere el runtime debe recurrir a de-cuantizacion, con la consiguiente perdida de rendimiento.
- Opciones de despliegue: vLLM (etiqueta `endpoints_compatible` y soporte de `compressed-tensors`), TGI y SGLang son las vias razonables. `llama.cpp` y Ollama no soportan el formato `compressed-tensors` FP8 de este repositorio al no incluir pesos GGUF.
- Fine-tuning: no se documenta soporte de entrenamiento en FP8; para ajuste fino habria que operar sobre el modelo base en BF16.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `vwdubb/gemma-4-31B-it-uncensored-heretic-FP8` | 31,27B (FP8) | No disponible | No publicado para FP8 | No disponible | `apache-2.0` en metadatos / licencia Gemma 4 en el enlace | HuggingFace, 0 descargas |
| `llmfan46/gemma-4-31B-it-uncensored-heretic` | No disponible (mismo modelo base, precision sin FP8) | No disponible | 85,90% | 10/100 | `apache-2.0` en metadatos / licencia Gemma 4 | HuggingFace |
| `google/gemma-4-31B-it` | ~31B | No disponible | 86,50% | 99/100 | Licencia de Gemma 4 | HuggingFace |

No se dispone de informacion en la busqueda web proporcionada sobre alternativas de otros fabricantes en la misma categoria (tamano ~30B, multimodal) que permita una comparacion con datos verificados. Los resultados de busqueda recibidos no guardan relacion con el modelo y se han descartado.

## Limitaciones y advertencias

- Modelo abliterado de forma deliberada: la reduccion de rechazos de 99/100 a 10/100 implica que el alineamiento de seguridad ha sido alterado, lo que aumenta el riesgo de generar contenido danino, ilegal o gravemente inapropiado. No es apto para uso directo con publico general sin filtrado posterior.
- La abliteracion solo se aplico al componente `attn.o_proj` en las capas 30 a 48. No hay garantia de que el comportamiento en otras capas o componentes mantenga las propiedades del modelo original.
- Deriva respecto al original: la divergencia KL de 0,0541 indica un cambio medible en la distribucion de salida, y el MMLU cae 0,6 puntos (86,50% a 85,90%). Ese descenso se midio en la version sin cuantizar.
- La cuantizacion FP8 de esta ficha no tiene benchmarks publicados: el impacto adicional sobre la calidad respecto al modelo abliterado en BF16 es desconocido.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de tasas de alucinacion. Materias como virologia (51,69%) y matematicas de secundaria (53,54%) muestran precisiones bajas en el original, lo que anticipa errores en esos dominios.
- Contradiccion de licencia: los metadatos etiquetan el modelo como `apache-2.0`, pero el campo `license_link` apunta a la licencia de Gemma 4, que impone restricciones de uso (politica de uso prohibido, obligaciones de atribucion y condiciones especificas para uso comercial). Cualquier uso comercial debe verificar la licencia aplicable al modelo base, no la etiqueta del repositorio.
- Sin validacion de la comunidad: 0 descargas y 0 "me gusta" en el momento de redactar la ficha, con fecha de creacion y ultima actualizacion separadas por menos de un minuto. No hay evidencia externa de que los pesos carguen correctamente ni de que la cuantizacion FP8 sea funcional.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingue equivalente al del modelo original, especialmente en castellano.
- Longitud de contexto no publicada: no es posible planificar casos de uso que dependan de ventanas largas (analisis de documentos extensos, conversaciones prolongadas) sin verificar el valor real.
- Despliegue limitado en hardware: la falta de pesos GGUF excluye las soluciones de inferencia en CPU y las GPU de consumo de 24 GB, lo que restringe el acceso a hardware profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/gemma-4-31B-it-uncensored-heretic-FP8
- Modelo base (abliterado): https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Pull request del metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- Soporte del autor en Patreon: https://patreon.com/LLMfan46
- Soporte del autor en Ko-fi: https://ko-fi.com/llmfan46
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a noticias sin relacion con el ambito de la inteligencia artificial.
