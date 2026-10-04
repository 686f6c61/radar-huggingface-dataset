# wz7475/gemma-3-4b-it-katcher-legal-sft-hf

## Resumen

`wz7475/gemma-3-4b-it-katcher-legal-sft-hf` es un checkpoint publicado en HuggingFace por el usuario wz7475 el 3 de octubre de 2026. Por la nomenclatura del identificador puede inferirse que se trata de un ajuste supervisado (SFT) orientado al dominio juridico sobre el modelo base Gemma 3 4B IT, pero esta inferencia no esta confirmada en ningun documento: la model card es la plantilla autogenerada de HuggingFace y todos sus campos figuran como `[More Information Needed]`.

El repositorio ocupa 0,3 GB declarados, usa la libreria `transformers` y publica pesos en formato `safetensors`, segun los metadatos del Hub. No se declaran licencia, idiomas, pipeline ni datos de entrenamiento, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta.

Su relevancia actual es limitada y fundamentalmente exploratoria: los ajustes de modelos pequenos (rango 3B-4B) sobre corpus especializados son un patron habitual para tareas de clasificacion, extraccion y redaccion asistida en dominios regulados, donde el coste de inferencia y la posibilidad de despliegue local son determinantes. No obstante, sin model card, sin datos de evaluacion y sin licencia declarada, no es posible recomendar su uso en produccion sin una validacion previa por parte del equipo que lo adopte.

## Especificaciones técnicas

Los valores de la columna "Valor" corresponden al checkpoint analizado salvo que se indique lo contrario. Las filas marcadas como heredadas proceden de la documentacion publica del modelo base `google/gemma-3-4b-it` y no estan confirmadas para este ajuste.

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (el identificador sugiere derivacion de Gemma 3 4B IT; sin confirmar) |
| Parametros totales | no disponible (nominal 4B si se confirma la base Gemma 3 4B IT) |
| Parametros activos | no aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | no disponible (128.000 tokens en el modelo base Gemma 3 4B IT, sin confirmar en este ajuste) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el Hub no declara licencia) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de este checkpoint. La model card no describe el tipo de modelo, el objetivo de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion posteriores al SFT (RLHF, DPO, ORPO). Tampoco se documentan hiperparametros, regimen de precision (fp32, bf16, fp16) ni infraestructura de computo.

Si se confirma la hipotesis de que deriva de Gemma 3 4B IT, el modelo base es un transformer decoder-only con atencion local y global intercalada y ventana de contexto de 128.000 tokens, con capacidad multimodal de entrada (vision). El sufijo `sft` del identificador apuntaria a un ajuste supervisado adicional sobre un corpus juridico no especificado. Ninguno de estos extremos puede verificarse con la informacion disponible.

El tamano declarado del repositorio (0,3 GB) es notablemente inferior al que ocuparia un checkpoint completo de 4B parametros en precision fp16, que ronda los 8 GB. Esto sugiere que el repositorio podria contener un adaptador LoRA, pesos parciales o una conversion incompleta, pero se trata de una observacion basada unicamente en el tamano del archivo y no de un dato confirmado por el autor.

## Capacidades

- Generacion de texto en el dominio juridico: no documentada en la model card; solo inferida de la nomenclatura del repositorio.
- Razonamiento y matematicas: no disponible.
- Generacion y asistencia de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidad de vision: no disponible en este checkpoint, aunque el modelo base Gemma 3 4B IT incorpora torre de vision; sin confirmar.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles de un modelo instruct de rango 3B-4B ajustado sobre corpus juridico. Ninguno ha sido validado con este checkpoint concreto y requieren verificacion empirica antes de cualquier despliegue.

- Clasificacion y enrutado de consultas juridicas: un modelo de 4B puede etiquetar consultas entrantes (laboral, civil, penal, fiscal) y derivarlas al equipo correspondiente. El coste por inferencia es bajo y permite procesar volumen alto en una sola GPU.
- Extraccion de entidades en contratos: identificacion de partes, fechas, importes, clausulas de penalizacion y plazos. Un ajuste sobre textos legales suele mejorar la consistencia del formato de salida frente al modelo base sin ajustar.
- Resumen de documentacion extensa: gracias a la ventana de 128.000 tokens del modelo base (si se confirma), permitiria resumir expedientes completos sin fragmentacion previa, manteniendo coherencia entre secciones.
- Redaccion asistida de borradores de clausulas: generacion de primeras versiones de clausulas estandar para revision posterior por un profesional, con ahorro de tiempo en tareas repetitivas.
- Atencion al cliente en servicios juridicos: gestion de conversaciones multi-turno sobre preguntas frecuentes (plazos, requisitos, documentacion), con derivacion a humano cuando la consulta excede el alcance del modelo.
- Anonimizacion y preprocesado de expedientes: deteccion y enmascaramiento de datos personales antes de enviar el texto a sistemas de analitica o a otros modelos de mayor tamano.
- Analisis de jurisprudencia a escala: indexado y etiquetado semantico de sentencias para busqueda interna, aprovechando el bajo coste de un modelo de 4B en comparacion con alternativas de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion, no se referencian datasets de prueba y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a listados de anuncios clasificados sin vinculacion con el proyecto).

## Requisitos de hardware

Las estimaciones siguientes se calculan para un modelo denso de aproximadamente 4.000 millones de parametros, cifra que solo seria aplicable si se confirma la base Gemma 3 4B IT. No proceden de mediciones sobre este checkpoint.

- VRAM estimada para inferencia: en fp16, en torno a 8-9 GB de pesos mas overhead de cache KV; en int8, aproximadamente 5-6 GB; en 4 bits (GGUF Q4_K_M o equivalente), alrededor de 2,5-3,5 GB.
- GPU profesionales: cabe holgadamente en una NVIDIA A100 40 GB, H100 80 GB o L40S 48 GB, con margen para lotes grandes y contextos largos.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) ejecuta el modelo en fp16 con comodidad; una RTX 4060 Ti de 16 GB lo ejecuta en fp16 al limite o en cuantizacion de 8 bits; tarjetas de 8 GB pueden ejecutarlo en cuantizacion de 4 bits.
- Opciones de despliegue: vLLM y TGI para servicio concurrente en GPU; llama.cpp y Ollama para cuantizacion GGUF en local; transformers con bitsandbytes para prototipado. La viabilidad de estas rutas depende de que el repositorio contenga pesos completos, algo que el tamano declarado de 0,3 GB pone en duda.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

La comparativa se establece frente a modelos abiertos de rango 3B-4B con licencia publica. La columna de rendimiento del modelo analizado figura como no disponible porque no existe ninguna evaluacion publicada. Los datos de las alternativas proceden de sus fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| wz7475/gemma-3-4b-it-katcher-legal-sft-hf | no disponible (nominal 4B sin confirmar) | no disponible | no disponible | no disponible |
| google/gemma-3-4b-it | 4B | 128.000 tokens | Terminos de uso de Gemma | Si, en la documentacion de Gemma 3 |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Si, en la ficha del modelo |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Si, en la ficha del modelo |

Diferencias relevantes para la seleccion: frente a las alternativas, este checkpoint no declara licencia, lo que impide determinar si su uso comercial es viable; no publica idiomas soportados; y su tamano de repositorio no permite confirmar que contenga un modelo ejecutable de forma autonoma. En un proceso de seleccion tecnica, las opciones con licencia explicita y evaluaciones publicadas ofrecen menor riesgo contractual y tecnico.

## Limitaciones y advertencias

- Ausencia total de model card: la publicada es la plantilla autogenerada de HuggingFace, sin informacion sobre desarrollo, datos, uso previsto ni limitaciones.
- Licencia no declarada: no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Si el modelo deriva de Gemma 3, los terminos de uso de Gemma serian aplicables, pero esto no esta confirmado.
- Riesgo de alucinacion juridica: cualquier modelo de lenguaje puede inventar referencias normativas, numeros de articulo o sentencias. En dominio legal este riesgo es critico y exige verificacion humana de toda salida citada.
- Sesgos desconocidos: no se han publicado analisis de sesgo ni de equidad, y se desconoce la composicion del corpus de ajuste.
- Alcance idiomatico incierto: no se declara ningun idioma. La nomenclatura "katcher" podria apuntar a un corpus en un idioma concreto, pero no hay confirmacion.
- Integridad de los pesos: el repositorio ocupa 0,3 GB, muy por debajo de lo esperado para un checkpoint completo de 4B en fp16. Deberia verificarse que los archivos safetensors estan completos y son cargables antes de cualquier evaluacion.
- Sin datos de evaluacion: no hay benchmarks, ni conjunto de validacion, ni comparacion con la linea base, por lo que no puede estimarse la ganancia real del ajuste SFT.
- Ausencia de adopcion verificable: 0 descargas y 0 likes implican que no existe retroalimentacion de la comunidad sobre su comportamiento.
- Riesgo de confidencialidad: cualquier ajuste sobre textos juridicos reales puede haber memorizado datos sensibles. No se documenta el proceso de filtrado ni de anonimizacion del corpus.
- Sin garantia de mantenimiento: el repositorio se publico y no consta actualizacion posterior, ni issues, ni canal de soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wz7475/gemma-3-4b-it-katcher-legal-sft-hf
- Modelo base presumiblemente utilizado (sin confirmar): https://huggingface.co/google/gemma-3-4b-it
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Referencia citada en la model card sobre emisiones de carbono (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico citada en la plantilla: https://mlco2.github.io/impact
- Repositorio de transformadores: https://github.com/huggingface/transformers

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo ni con el dominio juridico; corresponden a listados de anuncios clasificados de vehiculos y equipos de prueba de baterias en Facebook Marketplace. No se ha localizado ningun paper, blog, repositorio o demo asociado a este checkpoint.
