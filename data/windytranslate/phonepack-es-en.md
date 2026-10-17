# WindyTranslate/phonepack-es-en

## Resumen

WindyTranslate/phonepack-es-en es un paquete de traducción español→inglés pensado para ejecución en dispositivo ("on-device"), distribuido por WindyTranslate (Windstorm Labs) como parte del modo offline de su producto Windy Traveler. No es un modelo entrenado desde cero: son los mismos pesos de WindyTranslate/translate-tc-big-cat_oci_spa-en (commit `c012503`) convertidos a ONNX y cuantizados a int8, con la matriz de embeddings compartida almacenada una sola vez en `embed.bin`. El paquete completo son 245,2 MB (repositorio de 0,2 GB) e incluye `pack.json` con los ficheros y sus sha256, la regla de tokenización y los parámetros de decodificación, además de `test_vectors.json` con 20 frases de devtest y sus ids de token y salidas esperadas para validar un port.

La relevancia es de ingeniería más que de investigación: ofrece una traducción neuronal de calidad media-alta en un artefacto de tamaño reducido, sin dependencia de red y con licencia CC-BY-4.0, lo que facilita integrarlo en aplicaciones móviles, teclados o dispositivos de borde. El autor publica una medición concreta sobre FLORES-200 devtest completo (1.012 frases, beam 4): chrF++ 57,42 y spBLEU 34,25, frente a 57,69 de chrF++ con la exportación a CTranslate2 int8 de los mismos pesos.

La arquitectura subyacente es la del modelo OPUS-MT del que deriva (Helsinki-NLP/opus-mt-tc-big-cat_oci_spa-en), es decir, un transformer encoder-decoder de traducción automática; la model card no detalla capas, dimensión ni número de parámetros. El pack se publica para el par es→en, aunque el modelo base cubre catalán, occitano y español como lenguas de origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo OPUS-MT de origen, familia Marian); la model card no detalla capas ni dimensión |
| Parametros totales | no disponible (no declarados; el pack int8 ocupa 245,2 MB) |
| Longitud de contexto | no disponible (modelo de traducción orientado a frase; no se documenta ventana máxima) |
| Tipos de cuantizacion | int8 (ONNX quantized); el autor compara con una exportación CTranslate2 int8 de los mismos pesos |
| Idiomas soportados | es → en (el modelo base cubre además catalán y occitano como lenguas de origen) |
| Licencia | CC-BY-4.0, con atribución obligatoria a WindyTranslate / Windstorm Labs y a Helsinki-NLP |
| Formato de pesos | ONNX + `embed.bin` (embeddings compartidos), más `pack.json` y `test_vectors.json` |
| Pipeline | translation |
| Modelo base | WindyTranslate/translate-tc-big-cat_oci_spa-en @ `c012503` |
| Tamaño de descarga | 245,2 MB (repositorio: 0,2 GB) |
| Autor | WindyTranslate (Windstorm Labs) |
| Fecha de creacion | 2026-10-17 (actualizado 2026-10-17) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pack no incorpora entrenamiento propio. Se trata de una conversión de formato y una cuantización: los pesos de WindyTranslate/translate-tc-big-cat_oci_spa-en se exportan a ONNX, se cuantizan a int8 y se reorganizan para que la matriz de embeddings compartida entre encoder y decoder se guarde una única vez (`embed.bin`), lo que reduce el tamaño del artefacto. `pack.json` actúa como manifiesto e incluye la lista de ficheros con sus hashes sha256, la regla de tokenización y los ajustes de decodificación, de modo que un runtime puede replicar el comportamiento sin depender de la configuración de Hugging Face.

El modelo de partida es un OPUS-MT de Helsinki-NLP (Language Technology Research Group, Universidad de Helsinki), en su variante multilingüe de origen catalán/occitano/español → inglés, reempaquetada por Windstorm Labs. La model card de este pack no aporta datos sobre volumen de entrenamiento, composición del corpus, ni sobre si hubo ajuste con RLHF o DPO; tampoco describe innovaciones de decodificación más allá del uso de beam search de anchura 4 en la evaluación. La contribución técnica declarada es, por tanto, el empaquetado: cuantización int8 con embeddings compartidos y un conjunto de vectores de prueba para verificar portabilidad entre runtimes.

## Capacidades

- Traducción de texto español → inglés, frase a frase, con decodificación beam search (la evaluación publicada usa beam 4).
- Ejecución totalmente offline: todos los recursos necesarios están en el propio pack, sin llamadas a servicios externos.
- Inferencia en dispositivo mediante ONNX Runtime, incluidos entornos móviles y de borde con CPU.
- Cuantización int8 con pérdida de calidad muy contenida respecto a la referencia: chrF++ 57,42 frente a 57,69 de la exportación CTranslate2 int8.
- Tokenización y ajustes de decodificación reproducibles: la regla de tokenización viaja en `pack.json`.
- Verificación de ports: `test_vectors.json` incluye 20 frases de devtest con ids de token y salidas esperadas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un modelo de traducción puro.
- Cobertura de un único par de traducción en este pack (es→en), pese a que el modelo base admite catalán y occitano como origen.

## Casos de uso

- Traducción offline en aplicaciones de viaje: el pack se diseñó para el modo sin conexión de Windy Traveler, de forma que el usuario puede traducir carteles, menús o mensajes sin cobertura y sin enviar texto a un servidor.
- Teclados y correctores móviles con traducción integrada: 245,2 MB en int8 y pesos ONNX permiten incluir el modelo en el binario de una app Android o iOS y traducir la frase que el usuario acaba de escribir antes de enviarla.
- Traducción de textos sensibles con privacidad por diseño: al ejecutarse en el dispositivo, el contenido no sale del terminal, lo que encaja en entornos con requisitos de RGPD o datos clínicos y jurídicos, siempre con revisión humana posterior.
- Subtitulado y transcripción de reuniones: integrado en un pipeline ASR → MT, traduce cada segmento en local para reuniones con participantes hispanohablantes e inglés-parlantes, a coste de latencia de una pasada de decoder con beam 4.
- Localización de catálogos de producto y fichas de e-commerce: procesamiento por lotes de descripciones cortas es→en en CPU, donde el tamaño reducido permite ejecutar muchas instancias en paralelo en un solo servidor.
- Pre-relleno de memorias de traducción: el modelo propone una primera versión que el traductor humano revisa y corrige en la CAT tool, aprovechando el chrF++ ~57 como punto de partida razonable para dominios genéricos.
- Quioscos y dispositivos de borde sin conectividad: terminales de atención en aeropuertos, hoteles o ferias que traducen indicaciones sin depender de una red wifi ni de credenciales de API.
- Traducción de mensajes en soporte al cliente: primera pasada automática en el backend o en el cliente, con revisión humana obligatoria en reclamaciones y comunicaciones contractuales.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre FLORES-200 devtest completo (1.012 frases), beam 4:

| Benchmark | Metrica | Resultado |
|---|---|---|
| FLORES-200 devtest (es→en) | chrF++ | 57,42 |
| FLORES-200 devtest (es→en) | spBLEU | 34,25 |
| Referencia: CTranslate2 int8 de los mismos pesos | chrF++ | 57,69 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de esta evaluación de traducción. No hay datos de MMLU, HumanEval, GSM8K ni de otras tareas, que además no aplican a un modelo de traducción.

## Requisitos de hardware

- VRAM/RAM: el pack pesa 245,2 MB en int8. Como estimación propia (no publicada por el autor), la ejecución con beam 4 requiere del orden de 300-500 MB de memoria residente, incluyendo runtime y buffers de decodificación.
- GPU: no es necesaria. Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) con espacio de sobra; usar una A100 o H100 para este modelo sería desproporcionado salvo por agregación masiva de peticiones.
- CPU y móvil: es el objetivo principal. Funciona en CPU x86 y ARM, que es el escenario declarado ("on-device", "phone pack").
- Despliegue: ONNX Runtime (CPU, CUDA, CoreML, NNAPI, WebAssembly) es la vía natural dado el formato. El autor cita CTranslate2 int8 como referencia equivalente, útil si ya se dispone de esa infraestructura. No aplican vLLM, TGI, llama.cpp ni Ollama: no es un modelo generativo de propósito general ni tiene pesos GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, beam 4 implica mantener cuatro hipótesis por paso de decodificación, por lo que el coste es aproximadamente varias veces el de una búsqueda greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad es→en | Licencia | Formato | Comentario |
|---|---|---|---|---|---|---|
| WindyTranslate/phonepack-es-en | no disponible | no disponible | chrF++ 57,42 / spBLEU 34,25 (FLORES-200 devtest, beam 4) | CC-BY-4.0 | ONNX int8 | Objeto de esta ficha; 245,2 MB, orientado a dispositivo |
| WindyTranslate/translate-tc-big-cat_oci_spa-en | no disponible | no disponible | chrF++ 57,69 con exportación CTranslate2 int8 | CC-BY-4.0 | no disponible (pesos originales del repo base) | Modelo padre; mismos pesos sin el reempaquetado de embeddings |
| Helsinki-NLP/opus-mt-tc-big-cat_oci_spa-en | no disponible | no disponible | no disponible en la informacion proporcionada | CC-BY-4.0 | no disponible | Modelo upstream de OPUS-MT (Universidad de Helsinki); cubre ca/oc/es → en |

No se dispone de datos verificados de otros modelos comparables (por ejemplo, OPUS-MT específicos del par es→en o sistemas NMT comerciales) en la información proporcionada, por lo que no se incluyen cifras de comparación adicionales.

## Limitaciones y advertencias

- Traducción automática sin garantías: el propio autor advierte de que cualquier contenido relevante requiere revisión humana.
- Sin contexto documental: es un modelo orientado a frase; no se documenta ventana de contexto ni gestión de discurso multi-frase, por lo que la coherencia terminológica en textos largos puede resentirse.
- Un solo par de traducción en este pack (es→en); el multilingüismo del modelo base (catalán, occitano) no se expone aquí.
- Riesgo de alucinación y de omisiones en frases ambiguas, nombres propios, siglas o dominios especializados (jurídico, médico, técnico).
- Sesgos heredados del corpus OPUS subyacente, que no se documentan ni se mitigan en la model card.
- Licencia CC-BY-4.0: el uso comercial está permitido, pero exige atribución a WindyTranslate/Windstorm Labs y a Helsinki-NLP, además de indicar que los pesos fueron modificados (conversión a ONNX e int8). Hay que reproducir el texto de atribución en la documentación del producto.
- Portabilidad: la regla de tokenización y los ajustes de decodificación viven en `pack.json`; un port que no los respete producirá salidas distintas aunque los pesos sean correctos. La validación disponible son solo 20 frases de `test_vectors.json`.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- Fechas del repositorio (2026-10-17) y ausencia de paper o informe técnico asociado: no hay documentación adicional sobre el proceso de cuantización ni sobre la calibración usada para int8.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/WindyTranslate/phonepack-es-en
- Modelo base: https://huggingface.co/WindyTranslate/translate-tc-big-cat_oci_spa-en
- Modelo upstream de Helsinki-NLP: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-cat_oci_spa-en
- Windstorm Labs: https://windstormlabs.com
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
