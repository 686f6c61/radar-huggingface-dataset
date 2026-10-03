# tstepspam/Huihui-Qwen3.5-27B-abliterated-Q4-MLX

## Resumen

Huihui-Qwen3.5-27B-abliterated-Q4-MLX es una cuantizacion en 4 bits del modelo huihui-ai/Huihui-Qwen3.5-27B-abliterated, publicada por el usuario tstepspam en formato MLX (Apple). Se trata de una variante "abliterated", es decir, una version del modelo base a la que se le han eliminado (o atenuado) las direcciones de rechazo en el espacio de activaciones, con el objetivo de que responda sin las negativas tipicas de un modelo alineado por seguridad. El resultado se etiqueta como "uncensored".

El modelo cuenta con 26.895.993.856 parametros (aproximadamente 26,9 mil millones) y el repositorio ocupa 15,2 GB, coherente con una cuantizacion de 4 bits orientada a inferencia en equipos Apple Silicon. La libreria declarada es mlx y el pipeline es text-generation, con soporte conversational. La licencia declarada es Apache-2.0, con enlace a la licencia del modelo Qwen3.5-27B original.

La relevancia de esta ficha es doble: por un lado, permite ejecutar en local, sin conexion y en hardware de consumo Apple, un modelo de ~27B en 4 bits; por otro, al ser una variante abliterated, interesa a equipos de investigacion en seguridad, red teaming y analisis de contenido sensible que necesitan un modelo sin filtros de rechazo. No se han publicado datos de arquitectura detallada, contexto, idiomas ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag indica la familia qwen3_5 (modelo derivado de Qwen3.5) |
| Parametros totales | 26.895.993.856 (aprox. 26,9 B) |
| Parametros activos | No disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (etiqueta "4-bit"); no se incluyen otras cuantizaciones en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Qwen/Qwen3.5-27B) |
| Formato de pesos | safetensors (formato MLX); tamano del repositorio 15,2 GB |
| Libreria | mlx |
| Pipeline | text-generation |
| Modelo base | huihui-ai/Huihui-Qwen3.5-27B-abliterated |
| Fecha de publicacion | 2026-10-02 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No hay informacion disponible en la documentacion proporcionada sobre la arquitectura interna del modelo (numero de capas, tipo de atencion, dimensiones ocultas, uso de MoE o de atencion lineal). Lo unico confirmado es que se trata de un modelo de la familia Qwen3.5 (tag qwen3_5), orientado a generacion de texto y uso conversacional, y que el artefacto publicado es una conversion a MLX en 4 bits del modelo huihui-ai/Huihui-Qwen3.5-27B-abliterated.

Sobre el entrenamiento tampoco se aportan datos: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra optimizacion por preferencias. La unica transformacion documentada es la abliteracion aplicada por huihui-ai sobre el modelo Qwen3.5-27B, consistente en la eliminacion de la direccion de rechazo en las activaciones, seguida de la cuantizacion a 4 bits en formato MLX realizada por tstepspam. Esta cuantizacion es una conversion de pesos, no un reentrenamiento.

## Capacidades

- Generacion de texto y conversacion multiturno (pipeline text-generation, etiqueta conversational).
- Respuestas sin filtros de rechazo: al ser una variante abliterated/uncensored, el modelo tiende a no negarse a peticiones que un modelo alineado rechazaria. Este comportamiento es una caracteristica del modelo base, no de la cuantizacion.
- Capacidades multilingues: no disponibles. No se declara ninguna lista de idiomas.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Ejecucion local en Apple Silicon mediante MLX, con pesos ya cuantizados a 4 bits.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite generar completaciones sin las trabas de un modelo alineado, lo que resulta util para construir conjuntos de prompts adversarios, medir la eficacia de filtros de moderacion y auditar sistemas de IA antes de desplegarlos.
- Analisis de contenido sensible en investigacion: clasificacion, anotacion o resumen de textos que contienen lenguaje ofensivo, violencia o contenido sexual (por ejemplo, estudios de ciencias sociales o moderacion de foros) sin que el modelo interrumpa la tarea con rechazos.
- Escritura creativa sin restricciones: narrativa adulta, guiones o ficcion con tematicas duras, ejecutada en local en un Mac, sin enviar material a servicios en la nube.
- Asistente personal offline en Apple Silicon: inferencia local sobre un Mac con memoria unificada suficiente, con privacidad total de las conversaciones y sin coste por token.
- Procesamiento de documentos confidenciales: reescritura, resumen o transformacion de textos internos (juridicos, medicos, empresariales) que no pueden salir de la organizacion, aprovechando que los pesos se ejecutan en el propio equipo.
- Prototipado de aplicaciones conversacionales: dado que el repositorio expone pesos MLX y la libreria mlx-lm incluye servidor compatible con la API de OpenAI, sirve como backend de pruebas para interfaces de chat antes de invertir en infraestructura GPU.
- Ajuste fino ligero con LoRA: al estar en formato MLX y 4 bits, es posible experimentar con adaptaciones de bajo rango sobre el propio Mac, aunque no se documentan recetas ni resultados en el repositorio.
- Comparacion de comportamiento alineado vs. no alineado: util como referencia experimental frente al Qwen3.5-27B original o a la version abliterated sin cuantizar, para medir que se gana y que se pierde con la abliteracion y con la cuantizacion a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco mediciones de latencia o throughput. Tampoco se documenta el impacto de la cuantizacion a 4 bits sobre la calidad respecto al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM / memoria estimada: los pesos ocupan aproximadamente 15,2 GB (tamano del repositorio). Con overhead del runtime MLX y cache KV, conviene disponer de al menos 20-24 GB de memoria unificada; 32 GB o mas es lo recomendable para contextos largos y generacion sostenida.
- GPU compatibles: MLX es un framework especifico de Apple Silicon, por lo que este repositorio se ejecuta en chips de la serie M (M1, M2, M3, M4 y posteriores) con memoria unificada. No es ejecutable directamente en GPU NVIDIA (A100, H100, RTX 4090) ni AMD mediante MLX.
- Cabe en hardware de consumo: si, en Macs con memoria unificada de 24 GB o superior; 16 GB es insuficiente para cargar los pesos de 15,2 GB junto con el contexto.
- Opciones de despliegue: mlx-lm (generacion por linea de comandos e interfaz de servidor compatible con la API de OpenAI) y entornos de escritorio con soporte MLX, como LM Studio. No aplican vLLM, TGI ni Ollama para este artefacto concreto: Ollama trabaja con GGUF y vLLM/TGI no soportan el formato MLX.
- Latencia y throughput: no disponibles. Dependeran del chip (banda de memoria), del contexto y de la longitud de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/Huihui-Qwen3.5-27B-abliterated-Q4-MLX | 26,9 B | MLX 4 bits (safetensors) | No disponible | Apache-2.0 | HuggingFace, solo MLX |
| huihui-ai/Huihui-Qwen3.5-27B-abliterated (modelo base) | 26,9 B | Pesos completos (precision sin cuantizar) | No disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-27B (modelo original alineado) | 27 B (segun denominacion) | Pesos completos | No disponible | Ver licencia original enlazada | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada. La diferencia funcional principal entre ellas no es de precision en benchmarks, sino de comportamiento: el original mantiene los rechazos de seguridad, la version abliterated los elimina y la version MLX anade la cuantizacion a 4 bits y la restriccion de plataforma a Apple Silicon.

## Limitaciones y advertencias

- Modelo abliterated: se le han eliminado las direcciones de rechazo, por lo que puede generar contenido danino, ilegal o gravemente ofensivo. No es adecuado para aplicaciones orientadas al publico general sin una capa externa de moderacion.
- Sesgos: no hay informacion sobre sesgos evaluados. Al proceder de Qwen3.5, hereda los sesgos de sus datos de entrenamiento, y la abliteracion puede amplificar la reproduccion de estereotipos al eliminar los mecanismos de contencion.
- Alucinacion: no se han publicado tasas de alucinacion. La cuantizacion a 4 bits puede degradar la precision en tareas de razonamiento y matematicas respecto al modelo sin cuantizar, aunque no se documenta la magnitud de esa perdida.
- Contexto e idiomas: se desconocen la longitud de contexto efectiva y los idiomas soportados; no hay garantia de buen rendimiento en castellano.
- Licencia: el repositorio declara Apache-2.0 con enlace a la licencia de Qwen3.5-27B. Antes de un uso comercial conviene verificar los terminos del modelo base original y de la variante abliterated, ya que la licencia declarada por el autor de la cuantizacion no sustituye a la del modelo del que deriva.
- Madurez: el repositorio no tiene descargas ni likes, no incluye ejemplos de uso, ni evaluaciones, ni recetas de despliegue. Es un artefacto sin validacion por parte de la comunidad.
- Portabilidad: al estar en formato MLX, no se puede reutilizar en pipelines CUDA sin recurrir a otra conversion del mismo modelo base.
- Fecha de publicacion inusual: los metadatos indican 2026-10-02; conviene confirmar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tstepspam/Huihui-Qwen3.5-27B-abliterated-Q4-MLX
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-27B-abliterated
- Modelo original Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE

Nota: los resultados de la busqueda web proporcionada no contienen enlaces relacionados con el modelo (papers, blogs, repos ni demos); el contenido recuperado es irrelevante para esta ficha y no se ha utilizado.
