# TreeNumber/LFM2.5-2.6B-GGUF-Splited

## Resumen

TreeNumber/LFM2.5-2.6B-GGUF-Splited es una republicación en formato GGUF del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario TreeNumber. No se trata de un entrenamiento nuevo ni de un ajuste fino: es una conversión de pesos (cuantización) del modelo base de Liquid AI, empaquetada en varios ficheros GGUF (de ahí la coletilla "Splited" del nombre del repositorio). Su interés práctico es permitir la inferencia local del modelo base mediante llama.cpp y otros runners compatibles con GGUF, algo que no es posible directamente con los pesos originales en safetensors si se quiere ejecutar en CPU o en GPUs de gama baja.

El modelo subyacente tiene 2.697.198.592 parámetros (aproximadamente 2,7 mil millones), licencia Apache-2.0 y está declarado para inglés y ruso. El repositorio ocupa 1,7 GB, lo que sitúa la cuantización empleada en torno a 5 bits por parámetro de media, un rango habitual para despliegue en equipos de consumo. El pipeline no está declarado en la ficha de HuggingFace, aunque las etiquetas del repositorio incluyen "conversational".

La relevancia de esta ficha es doble: por un lado, documenta una vía concreta de despliegue de un modelo pequeño de la familia LFM2.5 de Liquid AI; por otro, conviene señalar que se trata de una conversión de terceros, con cero descargas y cero "likes" en el momento de la consulta, y sin model card técnica propia más allá de instrucciones de descarga de la herramienta `llama-split-gguf`. La información técnica detallada del modelo base no está incluida en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada del modelo base LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (aproximadamente 2,7 B), dato procedente de los safetensors del modelo base |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado y dividido en varios ficheros; no se especifican los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | en (ingles), ru (ruso) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio dividido en ficheros, "split GGUF") |
| Tamano del repositorio | 1,7 GB |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Pipeline declarado | no disponible (etiquetas: conversational) |
| Autor de la conversion | TreeNumber (conversion de terceros, no oficial de Liquid AI) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento ni las tecnicas de optimizacion del modelo base LiquidAI/LFM2.5-2.6B en los datos proporcionados. La unica informacion arquitectonica inferible es indirecta: se trata de un modelo de aproximadamente 2,7 mil millones de parametros, con comportamiento declarado conversacional, entrenado o al menos evaluado para ingles y ruso, y publicado bajo licencia Apache-2.0. Para conocer la arquitectura real (tipo de atencion, posible hibridacion con capas convolucionales o de estado, uso de MoE, numero de tokens de entrenamiento, composicion del dataset o si hubo RLHF/DPO) hay que consultar la model card del modelo base original.

En cuanto a esta republicacion concreta, no hay ningun entrenamiento asociado: es exclusivamente un proceso de conversion y cuantizacion a GGUF, dividido en multiples ficheros. La model card del autor unicamente documenta como obtener la herramienta necesaria para recomponer el split: la release b11063 de llama.cpp, con binarios para Ubuntu x64 y Windows x64, que incluye la utilidad `llama-split-gguf`. No se documentan los niveles de cuantizacion aplicados, el hardware usado para la conversion, ni ninguna validacion de calidad respecto a los pesos originales en safetensors.

## Capacidades

- Generacion de texto y conversacion multi-turno: el repositorio esta etiquetado como "conversational", lo que apunta a un uso previsto de asistente conversacional.
- Cobertura multilingue limitada a ingles y ruso segun los metadatos del modelo; no se declaran otros idiomas.
- Inferencia local en CPU y GPU: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp y runners derivados sin necesidad de GPU dedicada.
- Ejecucion con memoria reducida: el tamano de 1,7 GB del repositorio permite cargar el modelo en equipos con recursos limitados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, vision o audio: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no disponible en la informacion proporcionada (no hay benchmarks ni declaraciones al respecto).

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede desplegarse con llama.cpp sobre CPU o GPU de gama baja y mantener conversaciones en ingles o ruso sin enviar datos a servicios externos, algo relevante en entornos con requisitos de privacidad o sin acceso a internet.
- Prototipado rapido de aplicaciones de chat: al ocupar 1,7 GB y no requerir pesos en precision completa, permite iterar sobre prompts, plantillas de chat y flujos de UI en un portatil antes de escalar a un modelo mayor.
- Despliegue en hardware de borde o industrial: equipos con 4-8 GB de memoria pueden ejecutar la cuantizacion en formato GGUF, lo que habilita asistentes embebidos en maquinaria, quioscos o dispositivos de campo.
- Generacion de texto asistida en ruso: dado que el ruso esta declarado entre los idiomas soportados, encaja en tareas de redaccion, resumen o reformulacion para ese idioma, un caso menos cubierto por modelos pequenos centrados solo en ingles.
- Clasificacion y etiquetado de texto por lotes: mediante scripts con `llama-cpp-python` puede procesarse grandes volumenes de documentos en local, por ejemplo para categorizar tickets o correos, sin coste por token.
- Backend de bajo coste para demos y pruebas de integracion: sirve como modelo de sustitucion en pipelines de CI o entornos de staging donde no se quiere consumir cuota de APIs comerciales.
- Componente de sistemas RAG ligeros: combinado con un indice vectorial local, puede generar respuestas ancladas a documentos propios; conviene validar antes la calidad real del modelo base en el idioma objetivo, ya que no hay benchmarks publicados en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no contienen datos de evaluacion del modelo (los enlaces devueltos corresponden a documentacion de PowerShell y no guardan relacion con este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de pesos del repositorio (1,7 GB) mas el coste del contexto y de la cache KV: aproximadamente 2,5-3,5 GB para la cuantizacion publicada con contextos moderados.
- Referencia orientativa para otras cuantizaciones del mismo modelo (estimaciones calculadas a partir de 2,697 mil millones de parametros, no confirmadas por el autor): Q8 en torno a 3 GB de pesos; FP16 en torno a 5,4 GB de pesos.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar la cuantizacion publicada con holgura; RTX 3060 12 GB, RTX 4060 8 GB, RTX 2060 6 GB o Tesla T4 16 GB son opciones razonables. En GPUs de 4 GB (GTX 1650, MX550) es probable que quepa, pero con contexto reducido.
- Inferencia en CPU: totalmente viable con llama.cpp, ya que el modelo es pequeno y el repositorio esta pensado para esa herramienta.
- Opciones de despliegue: llama.cpp (se requiere la release b11063 o posterior para recomponer el split GGUF con `llama-split-gguf`), llama-cpp-python, Ollama o LM Studio importando el GGUF. El soporte en vLLM o TGI no esta documentado en la informacion proporcionada.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones del modelo base en la informacion proporcionada, por lo que no es posible comparar rendimiento con alternativas. La comparacion fiable se limita a la relacion entre este repositorio y su origen.

| Modelo | Formato | Parametros | Licencia | Idiomas | Contexto | Notas |
|---|---|---|---|---|---|---|
| TreeNumber/LFM2.5-2.6B-GGUF-Splited | GGUF dividido | ~2,7 B | apache-2.0 | en, ru | no disponible | Conversion de terceros, 0 descargas, 0 likes |
| LiquidAI/LFM2.5-2.6B (modelo base) | safetensors | 2.697.198.592 | apache-2.0 | en, ru (segun la republicacion) | no disponible | Fuente oficial de los pesos originales |
| Alternativas de ~2-3 B en GGUF (por ejemplo modelos pequenos de otras familias) | GGUF | rango similar | variable | variable | variable | No se incluyen datos concretos porque no se han proporcionado resultados comparativos verificables |

## Limitaciones y advertencias

- Conversion no oficial: el repositorio lo mantiene un tercero (TreeNumber), no Liquid AI. No hay garantia de que la cuantizacion preserve fielmente el comportamiento de los pesos originales en safetensors.
- Ausencia de validacion: cero descargas y cero "likes" en el momento de la consulta implican que no existe retroalimentacion de la comunidad sobre la calidad de la conversion.
- Sin model card tecnica: no se documentan niveles de cuantizacion, proceso de conversion, ni limitaciones conocidas del modelo subyacente.
- Idioma: los metadatos solo declaran ingles y ruso. El rendimiento en castellano no esta respaldado por ninguna declaracion ni evaluacion, por lo que no deberia asumirse.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como en cualquier modelo de ~2,7 B, es esperable una tasa de error factual mayor que en modelos grandes, pero no hay datos que lo Confirmen para este caso.
- Sesgos conocidos: no disponible. No se aporta informacion sobre composicion del dataset ni evaluaciones de sesgo.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones que dependan de ventanas largas. Conviene verificar el valor real en la model card del modelo base antes de disenar prompts extensos.
- Licencia: Apache-2.0, permisiva y compatible con uso comercial, pero se aplica al modelo base; conviene revisar si el repositorio de conversion anade condiciones adicionales (no se indican).
- Soporte de herramientas: no hay evidencia de soporte de tool calling, function calling ni flujos de agentes. No deberia asumirse su disponibilidad en produccion.
- Dependencia de version de llama.cpp: el split GGUF exige una version de llama.cpp que incluya `llama-split-gguf` (b11063 o posterior segun la model card), lo que anade un paso operativo antes de poder cargar el modelo.
- Uso en produccion: al ser una conversion sin evaluacion publicada, se recomienda validar con un conjunto propio de pruebas antes de desplegarla en un sistema real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TreeNumber/LFM2.5-2.6B-GGUF-Splited
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Binarios de llama.cpp b11063 para Ubuntu x64 (incluye `llama-split-gguf`): https://github.com/ggml-org/llama.cpp/releases/download/b11063/llama-b11063-bin-ubuntu-x64.tar.gz
- Binarios de llama.cpp b11063 para Windows CPU x64: https://github.com/ggml-org/llama.cpp/releases/download/b11063/llama-b11063-bin-win-cpu-x64.zip
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Los resultados de la busqueda web no aportaron enlaces adicionales relacionados con el modelo (correspondian a documentacion de PowerShell y se han descartado por no ser relevantes).
