# WorkOffline/gemma-4-E2B-it-qat-q4_0-GGUF

## Resumen

Este repositorio es un espejo sin modificaciones de los ficheros GGUF cuantizados de Gemma 4 E2B Instruct, el modelo de lenguaje de Google DeepMind. El autor, WorkOffline, mantiene una copia fijada a una revisión concreta y verificada por SHA-256 para que su aplicación pueda descargar los pesos desde un único punto. No se trata de un modelo nuevo ni de una conversión propia: los bytes son idénticos a los publicados por Google en `google/gemma-4-E2B-it-qat-q4_0-gguf`, y solo cambia el nombre de los ficheros.

El modelo subyacente es un transformer de 4.628.569.635 parámetros (según los datos de safetensors del modelo base) distribuido en formato QAT (quantization-aware training) a 4 bits, lo que reduce el peso del fichero principal a aproximadamente 3,35 GB. Incluye además un proyector multimodal (`mmproj`) de unos 987 MB, lo que indica capacidad de procesamiento de visión. La licencia declarada es Apache 2.0, aunque la model card original de Google no incluye un fichero de licencia explícito.

La relevancia de este repositorio es logística más que técnica: ofrece una réplica verificable de los pesos oficiales para despliegues offline o en aplicaciones que necesitan integridad de descarga. Para evaluar el modelo en sí, conviene remitirse a la documentación de Google, ya que este espejo no añade información técnica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT, 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal + proyector multimodal `mmproj`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas en Gemma 4 E2B Instruct. La model card de este repositorio es un espejo y no reproduce la documentacion tecnica de Google.

El unico dato tecnico relevante es que los pesos han sido sometidos a QAT (quantization-aware training), una tecnica en la que el modelo se entrena simulando la cuantizacion para que la version de 4 bits conserve mejor la calidad que una cuantizacion post-entrenamiento. El fichero incluido es la variante Q4_0 en formato GGUF, acompanada de un proyector multimodal que sugiere soporte de entrada de imagenes.

## Capacidades

- Generacion de texto conversacional (modelo etiquetado como `it`, es decir, instruido).
- Procesamiento multimodal: la presencia del fichero `mmproj` indica capacidad de vision, aunque no se detalla su alcance.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido.
- No se dispone de informacion sobre el numero de idiomas soportados ni sobre capacidades de codigo o matematicas.

## Casos de uso

- Despliegue offline en aplicaciones de escritorio: el espejo esta pensado para que la aplicacion WorkOffline descargue los pesos desde un unico origen con verificacion SHA-256, lo que facilita entornos sin acceso a Hugging Face o con requisitos de integridad.
- Inferencia local en hardware de consumo: con un fichero principal de 3,35 GB en Q4_0, el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama.
- Prototipado de asistentes conversacionales: al ser un modelo instructivo de ~4,6 mil millones de parametros, es adecuado para pruebas rapidas de chat en local sin coste de API.
- Experimentacion multimodal ligera: el proyector `mmproj` permite probar tareas de descripcion de imagenes o preguntas sobre imagenes en entornos con recursos limitados.
- Evaluacion comparativa de cuantizaciones: sirve como referencia QAT frente a cuantizaciones post-entrenamiento del mismo modelo base.
- Integracion en pipelines con requisitos de trazabilidad: la fijacion a una revision concreta y los hashes SHA-256 permiten auditar exactamente que pesos se estan usando en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para el fichero principal Q4_0 (3,35 GB) mas overhead de contexto; anadiendo el proyector multimodal (~987 MB) se recomiendan al menos 6-8 GB para uso con vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; en el ambito profesional, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para texto; 12 GB o mas si se usa vision con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el proyector multimodal se requiere un runtime que soporte `mmproj` (por ejemplo, llama.cpp con soporte multimodal).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas. Como referencia estructural, se puede senalar que compite en la categoria de modelos de ~4-5 mil millones de parametros en formato GGUF, pero no se aportan cifras de contexto, benchmarks ni licencia de los competidores en esta ficha.

## Limitaciones y advertencias

- Este repositorio es un espejo: no aporta mejoras, correcciones ni documentacion tecnica adicional sobre el modelo original.
- La licencia Apache 2.0 se declara en la model card, pero Google no incluye un fichero de licencia en el repositorio upstream; conviene verificar los terminos en la documentacion oficial de Gemma antes de un uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- El uso con vision requiere cargar tambien el fichero `mmproj` y un runtime compatible, lo que incrementa los requisitos de memoria.
- La cuantizacion Q4_0 puede degradar la calidad frente a los pesos completos, aunque el uso de QAT mitiga parcialmente este efecto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Repositorio espejo: https://huggingface.co/WorkOffline/gemma-4-E2B-it-qat-q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- GGUF oficiales: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
