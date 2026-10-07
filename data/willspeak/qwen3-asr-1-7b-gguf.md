# willspeak/Qwen3-ASR-1.7B-gguf

## Resumen

`willspeak/Qwen3-ASR-1.7B-gguf` es un espejo selectivo de ficheros en formato GGUF del modelo `Qwen/Qwen3-ASR-1.7B`, publicado por el usuario willspeak. No se trata de una release original ni de una cuantizacion propia: el repositorio replica ficheros ya existentes en `voconly-org/Qwen3-ASR-1.7B-gguf` (revision `163ef06ad1619c2b2ef2a1bd76b8516f03394693`), manteniendo su licencia Apache 2.0 y anadiendo los ficheros `LICENSE.txt` y `NOTICE.txt`. El repositorio se creo el 2026-10-07 y ocupa 7,8 GB, aunque solo publica tres variantes de cuantizacion.

La designacion del modelo base indica que se trata de un modelo de reconocimiento automatico del habla (ASR, *automatic speech recognition*), de la familia Qwen3, con entrada de audio y salida de texto. El recuento real de parametros reportado en safetensors es de 2.038.078.608 (aproximadamente 2,04 mil millones), una cifra superior al "1.7B" que aparece en el nombre comercial, una discrepancia habitual cuando el computo incluye el codificador de audio y embeddings. La relevancia de esta publicacion es practica: ofrece pesos cuantizados en GGUF que permiten desplegar un modelo de voz a texto en hardware local sin depender de infraestructura en la nube.

Se trata de un repositorio con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks asociados. Cualquier evaluacion de calidad, cobertura de idiomas o latencia debe hacerse contra el modelo original, ya que este espejo no aporta documentacion tecnica propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del modelo indica funcionalidad ASR; no se detalla arquitectura en la informacion proporcionada) |
| Parametros totales | 2.038.078.608 (recuento real reportado en safetensors); el nombre comercial indica 1,7B |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M, Q8_0, F16 (ficheros GGUF incluidos en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; el modelo base se etiqueta como safetensors y cuantizado |
| Autor del repositorio | willspeak |
| Naturaleza del repositorio | Espejo selectivo de ficheros, no release original ni cuantizacion propia |
| Fuente de los GGUF | voconly-org/Qwen3-ASR-1.7B-gguf, revision 163ef06ad1619c2b2ef2a1bd76b8516f03394693 |
| Tamano del repositorio | 7,8 GB |
| Fecha de creacion | 2026-10-07 |

Ficheros publicados:

| Fichero | Bytes | SHA-256 |
|---|---:|---|
| Qwen3-ASR-1.7B-Q5_K_M.gguf | 1.517.290.464 | `034c557fe92ff8fcd9a9c041cbdaad347be0a86a58d3a348f63cf3f0180879d0` |
| Qwen3-ASR-1.7B-Q8_0.gguf | 2.185.030.624 | `9a0d81792dfea2d5f278b8a63deb3ea6e02139ce42c2301f32ea19c4f77526b7` |
| Qwen3-ASR-1.7B-F16.gguf | 4.091.390.944 | `edb09c29b8f73822c639168d5ef72aa2dccdf8b4e48fc4b8518885352ff62c71` |

## Arquitectura y entrenamiento

No disponible. La informacion proporcionada no incluye descripcion de arquitectura (transformer, MoE, hibrida u otra), composicion del dataset de entrenamiento, numero de tokens vistos, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas concretas del modelo base.

Lo unico verificable es el proceso de publicacion de este repositorio: se trata de un espejo de ficheros sin modificaciones, con los SHA-256 declarados en la model card y con la documentacion del modelo original y del repositorio GGUF de origen conservada como ficheros separados. El autor del espejo declara explicitamente no ser responsable del entrenamiento ni de la cuantizacion, y no reclamar el respaldo de los autores originales.

## Capacidades

- Reconocimiento automatico del habla: la denominacion ASR del modelo base indica conversion de audio a texto. No se detallan caracteristicas concretas (idiomas, diarizacion, marcas de tiempo) en la informacion disponible.
- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que sugiere uso en formato de dialogo, sin mas detalle.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio indica "no disponibles").
- Capacidades especiales (modo thinking, vision, audio): el nombre implica entrada de audio; no se confirma ningun otro modo especial.
- Cuantizacion y despliegue local: dispone de variantes Q5_K_M, Q8_0 y F16 en GGUF, orientadas a inferencia en hardware de gama baja o intermedia.

## Casos de uso

Los siguientes escenarios se derivan de la designacion ASR del modelo y de su distribucion en GGUF para inferencia local. No han sido verificados experimentalmente sobre esta build concreta; deben validarse contra el modelo original antes de llevarlos a produccion.

- Transcripcion de reuniones y notas de voz: un modelo ASR de aproximadamente 2 mil millones de parametros cuantizado a Q5_K_M ocupa unos 1,41 GiB en disco, lo que permite ejecutarlo en un portatil o en un servidor pequeno para convertir audio en texto sin enviar datos a terceros, un requisito habitual en entornos con datos personales o confidenciales.
- Subtitulado automatico de contenido audiovisual: el proceso por lotes puede ejecutarse en CPU con la variante Q8_0 o F16 en GPU, generando transcripciones que despues se alinean temporalmente con herramientas externas. La licencia Apache 2.0 permite integrarlo en productos comerciales.
- Dictado por voz en aplicaciones de escritorio: al distribuirse como GGUF, puede embeberse en aplicaciones nativas o de escritorio que carguen el modelo en memoria una sola vez y transcriban fragmentos de audio de forma incremental.
- Accesibilidad y transcripcion en tiempo real: personas con discapacidad auditiva o usuarios que necesiten texto a partir de audio pueden beneficiarse de un modelo ejecutable en local, sin cuotas de API ni dependencia de conectividad.
- Preprocesado en pipelines de analitica de voz: transcripcion masiva de llamadas o grabaciones para su posterior analisis con modelos de lenguaje, clasificacion de temas o busqueda semantica. La variante F16 es adecuada cuando se prioriza fidelidad sobre consumo de memoria.
- Prototipado e investigacion en ASR: al ser un espejo de pesos cuantizados, permite reproducir experimentos sobre el modelo original comparando la perdida de calidad entre Q5_K_M, Q8_0 y F16 con los mismos ficheros y hashes documentados.
- Despliegue en dispositivos con recursos limitados: una huella de pesos cercana a 1,4-1,5 GiB en Q5_K_M hace viable la inferencia en mini-PC, placas con GPU integrada o nodos edge que no pueden alojar modelos ASR de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas (WER, MMLU, HumanEval u otras) y los resultados de busqueda web proporcionados no guardan relacion con el modelo.

## Requisitos de hardware

Las cifras de VRAM y RAM que se indican a continuacion son estimaciones calculadas a partir del tamano de los ficheros GGUF publicados; cubren unicamente el peso del modelo y no incluyen cache KV, buffers del codificador de audio ni overhead del runtime, que no se documentan.

- Q5_K_M (1.517.290.464 bytes, ~1,41 GiB): inferencia viable en CPU con unos 2-3 GB de RAM libre; en GPU, a partir de 3-4 GB de VRAM.
- Q8_0 (2.185.030.624 bytes, ~2,04 GiB): recomendable para GPU con 4 GB o mas de VRAM, y totalmente asumible en tarjetas de consumo tipo RTX 3060, RTX 4060 o superiores.
- F16 (4.091.390.944 bytes, ~3,81 GiB): requiere del orden de 5-6 GB de VRAM o RAM; cabe con holgura en RTX 4070/4080/4090 y en GPU de datacenter como A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si. Cualquier GPU con 4-8 GB de VRAM puede alojar las variantes Q5_K_M y Q8_0; incluso una GPU integrada con memoria compartida puede ejecutar Q5_K_M en CPU.
- Opciones de despliegue: el formato GGUF es el estandar del ecosistema llama.cpp, con variantes de uso como Ollama o LM Studio. No se confirma en la informacion disponible que estos runtimes soporten la parte de entrada de audio del modelo, por lo que la compatibilidad real del pipeline ASR debe verificarse con el repositorio GGUF de origen.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de transcripcion (por ejemplo, factor de tiempo real) ni de tokens por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto ni parametros de modelos alternativos de la misma categoria (ASR de ~2 mil millones de parametros), por lo que no es posible construir una comparativa con cifras verificables.

Como referencia documental, los unicos puntos de comparacion directos que menciona la propia model card son el modelo original `Qwen/Qwen3-ASR-1.7B` y el repositorio de cuantizaciones `voconly-org/Qwen3-ASR-1.7B-gguf`, del cual este repositorio copia los ficheros sin modificarlos. La diferencia practica entre ambos es que el espejo de willspeak publica un subconjunto de tres cuantizaciones, mientras que el repositorio de origen puede contener mas variantes.

## Limitaciones y advertencias

- Repositorio espejo: no es una release original. El autor no reclama autoria del entrenamiento ni de la cuantizacion, y no hay garantia de mantenimiento, actualizacion ni soporte.
- Sin benchmarks ni evaluacion: no hay metricas publicadas de tasa de error de palabra (WER), cobertura de idiomas ni robustez frente a ruido, acentos o audio de baja calidad.
- Idioma no especificado: el campo de idiomas del repositorio figura como no disponible, por lo que no puede asumirse soporte de castellano sin verificacion previa.
- Discrepancia de parametros: el recuento real en safetensors (2.038.078.608) no coincide con el "1.7B" del nombre, algo que hay que tener en cuenta al estimar consumo de memoria si el computo incluye modulos adicionales.
- Riesgo de alucinacion: en modelos ASR la salida erronea se manifiesta como transcripciones plausibles pero incorrectas, especialmente con audio ruidoso, solapamiento de hablantes o terminologia tecnica. En contextos medicos, legales o administrativos requiere revision humana.
- Compatibilidad de runtime: aunque el formato es GGUF, no se confirma que las herramientas habituales de inferencia de texto soporten la entrada de audio de este modelo; un mal soporte puede traducirse en fallos silenciosos o resultados degenerados.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar `NOTICE.txt` y `LICENSE.txt` incluidos en el repositorio, y confirmar la licencia efectiva del modelo original y de los ficheros GGUF replicados.
- Ausencia de validacion de integridad externa: los hashes SHA-256 estan declarados por el propio autor del espejo; conviene contrastarlos con el repositorio de origen antes de desplegar en produccion.
- Fecha de creacion futura respecto a la fecha de consulta (2026-10-07): conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/willspeak/Qwen3-ASR-1.7B-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio GGUF de origen: https://huggingface.co/voconly-org/Qwen3-ASR-1.7B-gguf
- Revision de origen declarada: `163ef06ad1619c2b2ef2a1bd76b8516f03394693`
- Ficheros de licencia y aviso legal en el repositorio: `LICENSE.txt` y `NOTICE.txt`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios no relacionados (EcoleDirecte y extensiones de navegador).
