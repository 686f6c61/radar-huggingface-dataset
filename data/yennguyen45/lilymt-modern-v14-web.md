# yennguyen45/LilyMT-modern-v14-web

## Resumen

LilyMT-modern-v14-web es un modelo de traduccion automatica publicado en HuggingFace por el usuario yennguyen45, distribuido en formato ONNX cuantizado a INT8 y pensado para ejecutarse con la libreria `transformers.js` / `@huggingface/transformers`. Segun los metadatos, la arquitectura es Marian (transformer encoder-decoder de traduccion neuronal) y el pipeline declarado es `translation` con los idiomas zh y vi, es decir, chino y vietnamita. El repositorio ocupa aproximadamente 0,1 GB.

El modelo se presenta como una rama especializada en la traduccion de narrativa moderna y de narrativa "ABO moderna" (un subgenero de ficcion romantica de origen asiatico), no como un traductor de proposito general. La model card describe un runtime propio denominado LilyVIP que anade etiquetas de genero, usa la frase anterior como contexto, aplica conversion de chino tradicional a simplificado mediante OpenCC, y decodifica con beam search de tamano 2 y una penalizacion de repeticion de 1,2.

Es relevante porque ejemplifica un patron creciente: modelos de traduccion pequenos, cuantizados y ejecutables integramente en el navegador o en Node.js, orientados a un dominio concreto. No obstante, el modelo acumula cero descargas y cero likes, no declara licencia y no publica resultados de benchmarks, por lo que debe tratarse como un artefacto experimental mas que como una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX INT8 (segun el titulo del modelo: "Web INT8") |
| Idiomas soportados | zh (chino), vi (vietnamita) |
| Licencia | no disponible |
| Formato de pesos | ONNX (cuantizado a INT8), empaquetado para transformers.js |
| Libreria declarada | transformers.js |
| Pipeline | translation (text2text-generation) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-22 |
| Fecha de actualizacion (metadatos) | 2026-09-22 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en la arquitectura Marian, un transformer encoder-decoder clasico de traduccion neuronal, y que se distribuye exclusivamente en ONNX cuantizado a INT8 para su uso con `transformers.js`. No se especifica el numero de parametros, el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la longitud maxima de secuencia soportada ni el tamano del vocabulario.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, si hubo ajuste fino supervisado, RLHF o DPO, ni si el modelo parte de un checkpoint previo (por ejemplo, de la familia OPUS-MT). Lo que si documenta el autor es la capa de inferencia: el runtime LilyVIP incorpora etiquetas de genero en la entrada, utiliza la frase anterior como contexto adicional, aplica OpenCC para convertir chino tradicional a simplificado y decodifica con beam search de tamano 2 y penalizacion de repeticion de 1,2. Estos elementos son decisiones de inferencia y preprocesado, no necesariamente de entrenamiento, y no se aclara si el modelo fue entrenado especificamente para consumirlos.

## Capacidades

- Traduccion automatica entre chino y vietnamita, en el pipeline declarado como `translation`.
- Traduccion orientada al dominio de narrativa moderna y de narrativa ABO moderna, segun la descripcion del autor.
- Uso de etiquetas de genero (tags) en la entrada como mecanismo de condicionamiento, implementado por el runtime LilyVIP.
- Uso de la frase anterior como contexto, lo que permite cierta coherencia en la traduccion de dialogos o parrafos consecutivos.
- Normalizacion de chino tradicional a chino simplificado mediante OpenCC antes de la traduccion.
- Decodificacion con beam search (beam 2) y penalizacion de repeticion (1,2) para reducir repeticiones en la salida.
- Ejecucion en navegador o en Node.js mediante `@huggingface/transformers`, sin necesidad de servidor de inferencia.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modos de pensamiento explicito.

## Casos de uso

- Traduccion de novelas web chinas al vietnamita: el modelo esta especializado en narrativa moderna, por lo que encaja en flujos editoriales de traduccion de capitulos seriados donde el registro coloquial y las convenciones del genero importan mas que la traduccion tecnica.
- Traduccion de ficcion romantica del subgenero ABO: la rama declarada para narrativa ABO moderna sugiere que el autor ha ajustado o condicionado el modelo para terminologia y convenciones especificas de ese subgenero, dificiles de cubrir con traductores genericos.
- Traduccion cliente-side con privacidad: al ejecutarse con transformers.js, el texto puede traducirse en el navegador del usuario sin enviarlo a un servidor externo, lo que resulta util para plataformas de lectura que manejan contenido licenciado o borradores no publicados.
- Traduccion por lotes en Node.js: el formato ONNX INT8 permite integrar el modelo en scripts de procesamiento de corpus para traducir capitulos completos de forma desatendida, con bajo coste de infraestructura.
- Normalizacion de texto chino en pipelines editoriales: la integracion de OpenCC permite usar el modelo tambien como paso de conversion de chino tradicional a simplificado dentro de una cadena de preprocesado mayor.
- Traduccion asistida de dialogos en lectores y extensiones: el uso de la frase previa como contexto permite mantener coherencia en turnos de conversacion, util en lectores de novelas con traduccion integrada.
- Prototipos y demostraciones de bajo coste: con un repositorio de 0,1 GB, el modelo puede desplegarse en entornos sin GPU para validar una idea de producto de traduccion antes de invertir en un modelo mayor.
- Investigacion sobre condicionamiento por genero: el mecanismo de tags del runtime LilyVIP constituye un caso de estudio reproducible sobre como el condicionamiento por dominio afecta a la calidad de traduccion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (BLEU, chrF, COMET u otras), no hay evaluaciones comparativas y la busqueda web realizada no devolvio enlaces relevantes al modelo.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, y los pesos estan cuantizados a INT8, por lo que el modelo esta disenado para entornos con recursos limitados.
- Inferencia en CPU viable mediante ONNX Runtime y WebAssembly a traves de `transformers.js`.
- Inferencia acelerada en navegador mediante WebGPU, soportada por `@huggingface/transformers` como backend opcional.
- Cabe en cualquier GPU de consumo e incluso en equipos sin GPU dedicada; no requiere A100, H100 ni VRAM de gama alta.
- Opciones de despliegue: `@huggingface/transformers` (navegador y Node.js), ONNX Runtime, y cualquier runtime compatible con modelos ONNX; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

Los valores de esta tabla proceden del conocimiento general sobre modelos de traduccion comparables y no de la informacion proporcionada en esta busqueda, por lo que deben verificarse antes de usarse en una decision tecnica.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| yennguyen45/LilyMT-modern-v14-web | no disponible | no disponible | zh, vi | no disponible | ONNX INT8 | Especializado en narrativa moderna y ABO; runtime LilyVIP |
| Helsinki-NLP/opus-mt-zh-vi | no disponible en esta busqueda | no disponible en esta busqueda | zh, vi | no verificada en esta busqueda | safetensors, ONNX | Referencia habitual para el par zh-vi; proposito general |
| facebook/nllb-200-distilled-600M | 600 M | no disponible en esta busqueda | multilingue (incluye zh y vi) | no verificada en esta busqueda | safetensors | Cobertura multilingue amplia; requiere mas recursos |
| M2M-100 (variantes) | depende de la variante | no disponible en esta busqueda | multilingue | no verificada en esta busqueda | safetensors | Traduccion muchos-a-muchos; mayor huella que un Marian pequeno |

Frente a estas alternativas, la ventaja declarada de LilyMT-modern-v14-web es su tamano reducido (0,1 GB) y su empaquetado para ejecucion en navegador, junto con el condicionamiento por genero. Su desventaja principal es la ausencia total de licencia, benchmarks y documentacion de entrenamiento.

## Limitaciones y advertencias

- No se declara licencia. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; hay que contactar con el autor antes de integrarlo en un producto.
- No hay resultados de benchmarks publicados, por lo que no existe evidencia objetiva de calidad de traduccion frente a alternativas establecidas.
- El modelo tiene cero descargas y cero likes, y el repositorio se creo y actualizo el mismo dia con tres minutos de diferencia, lo que apunta a un artefacto experimental sin validacion externa.
- La fecha de creacion indicada en los metadatos (2026-09-22) es posterior a la fecha actual, lo que sugiere un posible error de metadatos y obliga a tratar el resto de campos con cautela.
- La direccion de traduccion no se explicita con claridad: la presencia de conversion OpenCC de tradicional a simplificado sugiere un flujo de entrada en chino tradicional y salida en vietnamita, pero no se confirma en la documentacion.
- Especializacion de dominio estrecha: esta orientado a narrativa moderna y ABO, por lo que su comportamiento en textos tecnicos, legales, medicos o administrativos es desconocido.
- No hay informacion sobre sesgos, datos de entrenamiento, composicion del corpus ni posibles sesgos de genero, culturales o politicos en la traduccion.
- El riesgo de alucinacion y de errores de omision en la traduccion no esta cuantificado; en decodificacion con beam 2 y penalizacion de repeticion fijada, no hay estudios de fidelidad.
- La longitud de contexto es desconocida, lo que impide garantizar el tratamiento correcto de parrafos largos o de documentos completos.
- Solo cubre chino y vietnamita; no hay soporte multilingue adicional.
- Los resultados dependen del runtime LilyVIP (tags de genero, contexto de frase previa, OpenCC, beam 2, penalizacion 1,2); ejecutar el ONNX directamente con otros parametros puede degradar la calidad respecto a la configuracion prevista.
- No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, lo que limita las opciones de despliegue en servidor.
- Se desconoce si el modelo admite lotes (batching) en transformers.js y como escala su rendimiento con la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennguyen45/LilyMT-modern-v14-web
- Perfil del autor: https://huggingface.co/yennguyen45
- Libreria de inferencia: https://github.com/huggingface/transformers.js
- Paquete npm: https://www.npmjs.com/package/@huggingface/transformers
- OpenCC (conversion de chino tradicional a simplificado): https://github.com/BYVoid/OpenCC

Nota: la busqueda web realizada no devolvio ningun enlace relevante al modelo, a su runtime LilyVIP ni a su proceso de entrenamiento; los resultados obtenidos correspondian a listados de restaurantes y no guardan relacion con la consulta.
