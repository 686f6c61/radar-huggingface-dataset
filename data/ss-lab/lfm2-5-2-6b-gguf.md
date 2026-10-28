# ss-lab/LFM2.5-2.6B-GGUF

## Resumen

`ss-lab/LFM2.5-2.6B-GGUF` es una conversion a formato GGUF del checkpoint `LiquidAI/LFM2.5-2.6B`, publicada por el usuario `ss-lab`. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos ya existentes en siete variantes de cuantizacion (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 y F16) generadas con llama.cpp. Su interes practico es permitir la ejecucion del modelo base en CPU, en GPUs de gama de entrada y en entornos de inferencia local sin necesidad de infraestructura de servidor.

El modelo cuenta con 2.697.198.592 parametros (aproximadamente 2,7 mil millones), un tamano que lo situa en la franja de modelos pequenos aptos para equipos de consumo. La etiqueta `liquid` del repositorio remite a la familia LFM de Liquid AI; sin embargo, la informacion disponible no detalla la arquitectura interna, la longitud de contexto ni la composicion del dataset de entrenamiento del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue ligera; por otro, advierte de que se trata de una conversion de terceros con cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados y con licencia `other`, por lo que debe evaluarse con cautela antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `liquid` remite a la familia LFM de Liquid AI; no se detalla la configuracion de capas ni el tipo de bloque) |
| Parametros totales | 2.697.198.592 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16, F16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; requiere revision del texto completo en el repositorio original) |
| Formato de pesos | GGUF (incluye variantes BF16 y F16 en el mismo formato) |
| Tamano del repositorio | 21,1 GB |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Herramienta de conversion | llama.cpp |
| Etiquetas adicionales | conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura del modelo original: no se especifica si emplea attention estandar, capas convolucionales, un esquema hibrido, ni se detalla el numero de capas, dimensiones ocultas, cabezas de atencion o vocabulario. Tampoco se documenta el proceso de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineamiento). La unica etiqueta tecnica disponible es `liquid`, que vincula el checkpoint a la familia de modelos LFM de Liquid AI.

En lo que respecta al repositorio en si, la unica innovacion documentada es el proceso de cuantizacion: los ficheros GGUF se obtuvieron con llama.cpp a partir del checkpoint original, y se advierte explicitamente de que el fichero Q4_0 se cuantizo directamente desde pesos F16 y **no** es el checkpoint Q4_0 oficial entrenado con QAD (quantization-aware distillation) que pueda publicar el autor original. Esta distincion es relevante porque una cuantizacion Q4_0 directa suele degradar mas la calidad que una variante QAD equivalente.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` sugiere un uso orientado a dialogo, aunque no se documenta el formato de prompt ni las plantillas de chat.
- Razonamiento y conocimiento general: no hay evaluaciones publicadas que cuantifiquen el rendimiento en MMLU, GSM8K, HumanEval ni tareas similares.
- Codigo y matematicas: no disponible; la informacion proporcionada no confirma ni descarta estas capacidades.
- Tool calling / function calling: no disponible; no se menciona soporte de llamadas a funciones ni esquemas de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local: capacidad confirmada de facto por el formato GGUF, que permite inferencia en CPU y GPU mediante llama.cpp y compatibles.

## Casos de uso

- Asistente local en portatil: con la variante Q4_K_M (en torno a 1,6-1,7 GB) el modelo cabe holgadamente en RAM de un portatil convencional y puede ejecutarse en CPU con llama.cpp u Ollama para tareas de redaccion y resumen sin conexion.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF pequeno, permite levantar un endpoint compatible con la API de OpenAI en minutos usando llama.cpp server u Ollama, lo que acelera la validacion de interfaces conversacionales antes de invertir en infraestructura mayor.
- Procesamiento por lotes en equipos sin GPU: clasificacion de textos, extraccion de campos y resumen de documentos en pipelines offline donde no hay acelerador disponible y el coste por token debe ser nulo.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse integramente en la maquina del usuario, permite tratar documentos sensibles sin enviarlos a una API externa, siempre que la licencia `other` se valide para el uso previsto.
- Generacion de borradores y autocompletado en editores: con la variante Q8_0 o Q6_K, orientada a menor perdida de calidad, puede integrarse como motor de sugerencias de bajo consumo en herramientas de escritorio.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece siete variantes del mismo checkpoint, lo que resulta util para medir la degradacion de calidad entre Q4_0, Q4_K_M, Q5_K_M, Q6_K y Q8_0 sobre un conjunto de tareas propio.
- Base para experimentacion: util como punto de partida para medir latencia y consumo en hardware modesto antes de decidir si se necesita un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna evaluacion cuantitativa (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otras), y la busqueda web realizada no devolvio material relacionado con el modelo: los resultados obtenidos trataban sobre un tema historico completamente ajeno, por lo que se descartan como fuente. Tampoco se dispone de mediciones de latencia o throughput publicadas por el autor de la conversion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculada a partir del numero de parametros; no son cifras oficiales del autor):
  - BF16 / F16: aproximadamente 5,4 GB de pesos, mas overhead de contexto y cache KV.
  - Q8_0: aproximadamente 2,9 GB.
  - Q6_K: aproximadamente 2,2 GB.
  - Q5_K_M: aproximadamente 1,9 GB.
  - Q4_K_M: aproximadamente 1,6-1,7 GB.
  - Q4_0: aproximadamente 1,5 GB.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede alojar las variantes Q4-Q8 completas en VRAM; una A100 o H100 no aporta ventaja significativa frente a GPU de consumo para este tamano de modelo.
- Cabe en GPU de consumo: si, en la practica totalidad de GPUs dedicadas de los ultimos ocho anos con 6 GB o mas, y en GPUs integradas con memoria unificada suficiente si se usa Q4.
- Despliegue: llama.cpp (herramienta con la que se generaron los ficheros), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI basados en llama.cpp. vLLM y TGI no estan orientados a GGUF; vLLM solo soporta GGUF de forma experimental y TGI no lo soporta de forma nativa, por lo que para servirlo a escala convendria convertir a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints, pero no aporta cifras.

## Comparativa con modelos similares

Los datos del modelo evaluado no estan publicados (contexto y benchmarks), por lo que la comparacion se limita a parametros y disponibilidad. Las cifras de los modelos alternativos corresponden a sus fichas publicas habituales y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ss-lab/LFM2.5-2.6B-GGUF | 2,70 B | no disponible | GGUF (7 variantes) | other | Conversion de terceros, sin benchmarks ni descargas |
| LiquidAI/LFM2.5-2.6B | 2,70 B | no disponible | safetensors | other | Checkpoint original; fuente recomendada frente a la conversion |
| Llama 3.2 3B (Instruct) | 3,21 B | 128k | safetensors, GGUF | Llama 3.2 Community License | Ecosistema amplio y evaluaciones publicas |
| Qwen2.5 3B (Instruct) | 3,09 B | 32k | safetensors, GGUF | Apache 2.0 (mayoria de variantes) | Buen soporte multilingue y de codigo |
| Gemma 2 2B (IT) | 2,61 B | 8k | safetensors, GGUF | Gemma Terms of Use | Tamano casi identico, con evaluaciones publicadas |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks ni mediciones de calidad que permitan afirmar que la conversion conserva el rendimiento del modelo original.
- Conversion no oficial: el repositorio lo mantiene el usuario `ss-lab`, no Liquid AI. Presenta cero descargas y cero valoraciones, por lo que no ha sido validado por la comunidad. Para produccion es preferible el checkpoint original o una conversion oficial.
- Q4_0 no es QAD: la propia model card advierte de que ese fichero se cuantizo desde F16 y no equivale al checkpoint Q4_0 con quantization-aware distillation del autor original; su calidad puede ser inferior.
- Licencia `other`: no es una licencia estandar. Es imprescindible revisar los terminos del modelo base en `LiquidAI/LFM2.5-2.6B` antes de cualquier uso comercial, ya que puede incluir restricciones por volumen de ingresos, atribucion o prohibicion de ciertos usos.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo y con que calidad, lo que impide asumir un buen rendimiento en castellano.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede disenar un caso de uso basado en documentos largos sin medirlo previamente.
- Riesgo de alucinacion: inherente a los modelos de 2-3 mil millones de parametros; no hay datos de alineamiento ni de tasas de factualidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o robustez.
- Capacidades no confirmadas: no hay evidencia de soporte de tool calling, agentes o vision; no deben asumirse.
- Clonado pesado: el repositorio ocupa 21,1 GB porque contiene todas las variantes; conviene descargar solo el fichero GGUF necesario.
- Cadena de suministro: al tratarse de pesos convertidos por un tercero, conviene verificar checksums frente al checkpoint original si el uso es sensible.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/ss-lab/LFM2.5-2.6B-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- llama.cpp (herramienta de conversion citada en la model card): https://github.com/ggml-org/llama.cpp
- Papers, blogs, demos o repositorios adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los resultados obtenidos eran sobre un tema historico ajeno y se han descartado.
