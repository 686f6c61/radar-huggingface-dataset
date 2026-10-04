# wz7475/gemma-3-27b-it-katcher-legal-sft-hf

## Resumen

El modelo `wz7475/gemma-3-27b-it-katcher-legal-sft-hf` es un repositorio alojado en HuggingFace por el usuario wz7475. El identificador sugiere que se trata de un ajuste fino supervisado (SFT) sobre el modelo base Gemma 3 27B en su variante instruction-tuned, aparentemente orientado al dominio legal, si bien esta interpretacion procede unicamente del nombre del repositorio y no esta confirmada por la model card. La model card publicada es la plantilla automatica de HuggingFace, sin contenido sustantivo relleno por el autor.

El repositorio no presenta descargas ni interacciones en el momento de la consulta, y su tamano es de 0,9 GB. Este dato es tecnicamente relevante: los pesos completos de un modelo de 27 000 millones de parametros en precision bf16 ocuparian en torno a 54 GB, por lo que 0,9 GB apunta a un conjunto de adaptadores (por ejemplo, LoRA) o a un unico fichero parcial, y no a los pesos completos del modelo.

No se dispone de informacion publicada sobre arquitectura, datos de entrenamiento, licencia, idiomas ni evaluaciones especificas de este repositorio. Toda referencia a caracteristicas de Gemma 3 que aparece en esta ficha corresponde a la documentacion publica del modelo base de Google y debe tratarse como contexto, no como especificacion confirmada del ajuste publicado por wz7475.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio (el identificador sugiere herencia de Gemma 3, transformer decoder-only multimodal) |
| Parametros totales | no disponible (el identificador sugiere 27 000 millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (Gemma 3 27B IT declara 128 000 tokens en su documentacion publica, sin confirmar en este repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (Gemma 3 declara soporte para mas de 140 idiomas en su documentacion publica, sin confirmar aqui) |
| Licencia | no disponible (Gemma 3 se distribuye bajo la licencia de terminos de uso de Gemma, sin confirmar para este ajuste) |
| Formato de pesos | safetensors (tamano del repositorio: 0,9 GB, compatible con la libreria transformers) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura, el procedimiento de entrenamiento, el volumen de tokens ni la composicion del dataset en la model card del repositorio. La model card es la plantilla generada automaticamente por HuggingFace, en la que todos los apartados relevantes (descripcion del modelo, fuentes, datos de entrenamiento, hiperparametros y evaluacion) aparecen marcados como `[More Information Needed]`.

El identificador del repositorio indica dos elementos que, de confirmarse, definirian la arquitectura: por un lado, `gemma-3-27b-it` como modelo base, que corresponderia a un transformer decoder-only multimodal desarrollado por Google; por otro, `katcher-legal-sft`, que sugiere un ajuste fino supervisado sobre un corpus de dominio legal, presumiblemente denominado Katcher. El sufijo `-hf` podria indicar una conversion o adaptacion al formato nativo de la libreria transformers. Ninguno de estos extremos puede verificarse con la informacion proporcionada. La etiqueta `arxiv:1910.09700` presente en el repositorio corresponde al articulo de Lacoste et al. (2019) sobre el calculo del impacto de carbono en aprendizaje automatico, que forma parte de la plantilla por defecto de HuggingFace y no constituye una referencia tecnica al modelo.

## Capacidades

- Generacion de texto: no confirmada para este repositorio, aunque previsiblemente heredada del modelo base instruction-tuned.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Capacidades multimodales (vision): no disponible; el modelo base Gemma 3 27B IT es multimodal, pero no se puede confirmar que este ajuste conserve dicha capacidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Especializacion en dominio legal: inferida unicamente del nombre del repositorio, no confirmada por la model card.

## Casos de uso

Dado que no se dispone de informacion verificada sobre capacidades, licencia ni rendimiento, los siguientes casos se plantean como escenarios hipoteticos a validar antes de cualquier uso en produccion:

- Asistencia en redaccion de documentos legales: si el ajuste esta efectivamente orientado al dominio legal, podria emplearse para borradores de contratos, clausulas y escritos, siempre que se valide su comportamiento con un conjunto de pruebas propio y revision humana obligatoria.
- Resumen de expedientes y sentencias: un modelo con ventana de contexto amplia podria procesar documentos extensos, pero la longitud de contexto real de este ajuste no esta confirmada.
- Extraccion de informacion estructurada de textos juridicos: requiere validar que el modelo mantiene la capacidad de seguir instrucciones y formatos estrictos tras el ajuste.
- Clasificacion y etiquetado de documentos: utilidad potencial en tareas de triaje documental, supeditada a una evaluacion empirica previa.
- Investigacion academica sobre ajuste fino en dominios especializados: el repositorio puede servir como referencia para estudiar tecnicas de SFT, dado su pequeno tamano si finalmente corresponde a adaptadores.
- Soporte interno de consulta documental: integrable en sistemas de recuperacion aumentada (RAG), aunque la ausencia de licencia declarada impide confirmar su viabilidad comercial.
- Prototipado y experimentacion: uso en entornos controlados para evaluar la calidad del ajuste antes de decidir su adopcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes estimaciones se derivan del supuesto de que el modelo tiene 27 000 millones de parametros, segun sugiere el identificador, y no estan confirmadas por el autor:

- VRAM estimada para inferencia: aproximadamente 54 GB en bf16/fp16 para pesos completos; en torno a 27-30 GB con cuantizacion de 8 bits; aproximadamente 14-16 GB con cuantizacion de 4 bits.
- GPU recomendadas para pesos completos: NVIDIA A100 80 GB, H100 80 GB o configuraciones multi-GPU con dos o mas tarjetas de 40-48 GB.
- GPU para cuantizacion de 4 bits: viable en RTX 4090 (24 GB), RTX 3090 (24 GB) y tarjetas con 16 GB en configuraciones muy ajustadas.
- Compatibilidad con GPU de consumo: posible en RTX 4090 o RTX 3090 con cuantizacion agresiva; no viable en GPU de 8-12 GB sin offloading a CPU.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), vLLM, TGI o llama.cpp si se generan conversiones a GGUF; no se publican ficheros cuantizados en el repositorio.
- Latencia y throughput: no disponible.
- Advertencia: el repositorio ocupa 0,9 GB, lo que sugiere que no contiene los pesos completos. Si se trata de adaptadores, sera necesario descargar por separado el modelo base Gemma 3 27B IT y aplicar la fusion correspondiente.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificados de este ajuste que permitan una comparacion rigurosa. A continuacion se recogen alternativas de categoria similar, con especificaciones procedentes de su documentacion publica y no del repositorio analizado:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wz7475/gemma-3-27b-it-katcher-legal-sft-hf | no disponible (presuntamente 27B) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Gemma 3 27B IT (modelo base de referencia) | 27B | 128 000 tokens | Si (vision) | Terminos de uso de Gemma | Ampliamente disponible |
| Qwen2.5-32B-Instruct (alternativa de referencia) | 32B | 128 000 tokens | No | Apache 2.0 en la mayoria de variantes | Ampliamente disponible |
| Mistral Small 3.1 24B (alternativa de referencia) | 24B | 128 000 tokens | Si (vision) | Apache 2.0 | Ampliamente disponible |

Los datos de contexto, licencia y modalidad de las alternativas corresponden a informacion publica general y deben verificarse en sus repositorios oficiales antes de cualquier decision tecnica.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no especifica datos de entrenamiento, evaluacion, licencia ni uso previsto, lo que impide evaluar su idoneidad para produccion.
- Licencia no declarada: no puede confirmarse la legalidad del uso comercial. Si el modelo base es Gemma 3, se heredan las restricciones de los terminos de uso de Gemma.
- Riesgo de alucinacion: no cuantificado. En aplicaciones legales, cualquier salida debe ser revisada por un profesional cualificado; el modelo no constituye asesoramiento juridico.
- Sesgos: no evaluados ni documentados por el autor.
- Idiomas: no se especifica que idiomas conserva el ajuste; un entrenamiento SFT sobre un corpus limitado puede degradar el rendimiento multilingue del modelo base.
- Integridad del repositorio: el tamano de 0,9 GB sugiere que podria tratarse de adaptadores o de un conjunto de pesos incompleto. Debe verificarse antes de intentar cargarlo.
- Reproducibilidad: sin hiperparametros, datos ni semillas publicadas, el ajuste no es reproducible.
- Ausencia de adopcion: cero descargas y cero interacciones reducen la probabilidad de que existan validaciones independientes.
- Fecha de creacion futura: el repositorio figura con fecha de creacion de 2026-10-03, lo que puede indicar un error de metadatos o una fecha manipulada; conviene tratarlo con cautela.
- Aplicacion legal: el uso en contextos juridicos sin supervision profesional puede generar responsabilidades; no debe utilizarse como fuente unica de decision.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wz7475/gemma-3-27b-it-katcher-legal-sft-hf
- Articulo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto de carbono): https://arxiv.org/abs/1910.09700
- Documentacion oficial del modelo base Gemma 3 (referencia externa, no incluida en el repositorio): no disponible en la informacion proporcionada.
