# wy8edhuh/DeepSeek-R1-0528-Qwen3-8B-abliterated-IQ4_NL-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato IQ4_NL del modelo `huihui-ai/DeepSeek-R1-0528-Qwen3-8B-abliterated`, un derivado "abliterated" (con los mecanismos de rechazo suprimidos mediante intervención sobre las direcciones de activación) del destilado DeepSeek-R1-0528 sobre la base Qwen3-8B. El autor de esta conversión es el usuario `wy8edhuh`, que ha generado el fichero con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, partiendo del checkpoint de huihui-ai. El resultado es un modelo de 8.190.735.360 parámetros (8,19 mil millones) listo para ejecutarse en llama.cpp, con licencia MIT.

El interés de esta ficha es doble. Por un lado, se trata de una destilación de razonamiento de DeepSeek-R1-0528 en un tamaño de 8B, lo que la sitúa en el rango de modelos que caben en GPU de consumo con cuantizaciones de 4 bits. Por otro lado, la variante abliterated elimina el filtrado de seguridad del modelo original, lo que la orienta a investigación sobre alineación, evaluación de sesgos y entornos controlados, no a despliegues públicos. El autor advierte explícitamente de que el modelo puede generar contenido sensible o inapropiado y recomienda su uso experimental.

La información disponible en la model card es mínima: no se documentan benchmarks, idiomas soportados, longitud de contexto nativa ni detalles del dataset de entrenamiento. La búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden al Centro Cultural de Belém, sin relación con el repositorio).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de la familia Qwen3-8B, con destilación de razonamiento de DeepSeek-R1-0528; no detallada en la model card) |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Longitud de contexto | No disponible (la model card no la especifica; el ejemplo de llama-server usa `-c 2048`) |
| Tipos de cuantización | IQ4_NL con imatrix (fichero `deepseek-r1-0528-qwen3-8b-abliterated-iq4_nl-imat.gguf`); este repositorio contiene una única cuantización |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la model card de este repositorio. Por el nombre del modelo base (`DeepSeek-R1-0528-Qwen3-8B`) se deduce que se trata de un transformer decoder-only denso de 8,19 B de parámetros, resultado de destilar las capacidades de razonamiento de DeepSeek-R1-0528 en la arquitectura Qwen3-8B. Sobre ese checkpoint, huihui-ai aplicó una técnica de "abliteration", que elimina o atenúa las direcciones de activación responsables del comportamiento de rechazo, reduciendo drásticamente el filtrado de seguridad del modelo alineado original. Esta ficha no puede confirmar la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO, porque no están documentados en la información proporcionada.

La contribución específica de este repositorio es la conversión a GGUF y la cuantización a IQ4_NL con matriz de importancia (imatrix), realizada con llama.cpp mediante el espacio GGUF-my-repo. IQ4_NL es una cuantización de 4 bits con un codebook no lineal optimizado para pesos con distribución no uniforme; el uso de imatrix calibra los errores de cuantización con estadísticas de activación de un corpus de calibración, lo que habitualmente reduce la degradación respecto a una cuantización de 4 bits sin calibrar. No se documenta qué corpus se usó para generar la imatrix ni el proceso exacto de conversión.

## Capacidades

- Generación de texto conversacional, etiquetada en el repositorio con las etiquetas `chat` y `conversational`.
- Razonamiento de tipo cadena de pensamiento, presumiblemente heredado de la destilación de DeepSeek-R1-0528 (no confirmado de forma explícita en la model card).
- Salida sin restricciones de seguridad: la abliteration suprime los rechazos del modelo alineado, de modo que responde a peticiones que el original rechazaría.
- Compatibilidad con `llama-cli` y `llama-server` de llama.cpp, además de cualquier frontend que consuma GGUF (por ejemplo, Ollama con un Modelfile).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni multimodalidad.
- No se documentan las capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se documenta ningún modo "thinking" conmutable ni parámetros de razonamiento configurables.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos emergen cuando se eliminan las direcciones de rechazo, comparando sus respuestas con las del checkpoint alineado del que deriva. Es adecuado porque la abliteration es precisamente la variable experimental.
- Evaluación de sesgos y toxicidad: sirve como sujeto de prueba en pipelines de red-teaming, ya que al no tener filtrado de seguridad expone con más facilidad los sesgos latentes del entrenamiento original.
- Generación de datos sintéticos en dominios sensibles para investigación: útil para construir datasets de casos límite que después se etiquetan manualmente, en un entorno aislado y con revisión posterior.
- Inferencia local en hardware de consumo: al ser un GGUF IQ4_NL de unos 4,8 GB, puede ejecutarse en portátiles y equipos de sobremesa con GPU modesta o con memoria unificada, lo que facilita experimentos sin infraestructura de datacenter.
- Pruebas de cuantización: como ejemplo de cuantización IQ4_NL con imatrix sobre un modelo de 8B, permite medir la pérdida de calidad frente al checkpoint en BF16 en tareas de razonamiento.
- Prototipado offline de asistentes conversacionales: con llama-server se puede levantar una API compatible con OpenAI para iterar sobre prompts en local, siempre que el contenido generado se revise y no se exponga al público.
- Estudio de destilación de razonamiento: permite analizar hasta qué punto un modelo de 8B conserva las trazas de razonamiento de un maestro mucho mayor, útil en líneas de investigación sobre destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero IQ4_NL ocupa aproximadamente 4,8 GB (el repositorio completo mide 4,8 GB y contiene una sola cuantización). A eso hay que sumar la caché KV, que depende del contexto configurado; con `-c 2048` el sobrecoste es pequeño, pero con contextos largos crece de forma lineal.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), así como en equipos Apple Silicon con memoria unificada suficiente. No se dispone de mediciones oficiales de consumo por GPU.
- GPU de datacenter: A100, H100 y similares pueden ejecutarlo sin problema, aunque están sobredimensionadas para un modelo de 8B en 4 bits; su uso tendría sentido para servir muchas instancias concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante importación del GGUF, y cualquier runtime compatible con GGUF. No se proporciona una versión en safetensors ni cuantizaciones AWQ/GPTQ, por lo que el despliegue directo con vLLM o TGI no está cubierto por este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `wy8edhuh/DeepSeek-R1-0528-Qwen3-8B-abliterated-IQ4_NL-GGUF` (este repo) | 8,19 B | No disponible | MIT | GGUF (IQ4_NL + imatrix) | Cuantización de 4 bits del checkpoint abliterated; 0 descargas y 0 likes en el momento de la consulta |
| `huihui-ai/DeepSeek-R1-0528-Qwen3-8B-abliterated` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Probablemente safetensors (no confirmado) | Checkpoint de origen de esta cuantización; es el modelo base declarado |
| `DeepSeek-R1-0528-Qwen3-8B` (upstream alineado) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Modelo del que deriva la variante abliterated; la diferencia principal es la presencia de filtrado de seguridad |

No se dispone de datos de rendimiento ni de contexto de los modelos comparados dentro de la información proporcionada, por lo que la comparación se limita a linaje, licencia y formato. No se han identificado en la búsqueda web alternativas comparables con datos verificables.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteration elimina buena parte de los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. El propio autor lo advierte en la model card y recomienda revisión manual de las salidas.
- No apto para producción ni para aplicaciones públicas: la model card desaconseja explícitamente su uso directo en producción o en aplicaciones comerciales de cara al público, y señala que no ha recibido optimización de seguridad rigurosa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; como en cualquier modelo de 8B, la tasa de alucinación puede ser significativa, especialmente en dominios especializados.
- Idiomas y contexto sin documentar: no se especifican los idiomas soportados ni la ventana de contexto nativa, lo que impide garantizar un comportamiento correcto en entornos multilingües o con contextos largos.
- Pérdida por cuantización: IQ4_NL con imatrix reduce el peso a unos 4,8 GB, pero introduce degradación respecto al checkpoint en BF16; no hay mediciones publicadas que cuantifiquen esa pérdida.
- Licencia: aunque la licencia declarada es MIT, que permite uso comercial, la model card incluye un aviso de uso que desaconseja el despliegue comercial y declara que huihui.ai no asume responsabilidad por las consecuencias derivadas del uso del modelo. Conviene revisar la licencia del checkpoint base antes de cualquier explotación.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y no incluye documentación sobre el corpus de calibración de la imatrix ni sobre el proceso de conversión.
- Riesgo legal y ético: el usuario es el único responsable de cumplir la legislación local y los estándares éticos aplicables al contenido generado.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/wy8edhuh/DeepSeek-R1-0528-Qwen3-8B-abliterated-IQ4_NL-GGUF
- Modelo base declarado: https://huggingface.co/huihui-ai/DeepSeek-R1-0528-Qwen3-8B-abliterated
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota: la búsqueda web realizada para esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces obtenidos correspondían al Centro Cultural de Belém y no guardan relación con el repositorio.
