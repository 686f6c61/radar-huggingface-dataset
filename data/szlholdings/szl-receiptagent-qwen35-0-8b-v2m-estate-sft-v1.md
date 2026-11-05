# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1

## Resumen

SZL-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 es un ajuste fino supervisado (SFT) publicado por SZLHOLDINGS sobre el modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged, que a su vez deriva de la familia Qwen 3.5 en su variante de 0,8 mil millones de parametros. El modelo esta orientado a tareas de tipo agente sobre documentos, con pipeline declarado image-text-to-text, lo que sugiere capacidad de procesar imagenes junto con texto (por ejemplo, recibos o documentos escaneados) y generar respuestas conversacionales. El nombre del checkpoint indica una especializacion adicional en el dominio inmobiliario ("estate").

El modelo tiene 852.985.920 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta etiquetado unicamente para el idioma ingles. El repositorio ocupa 3,4 GB, coherente con pesos en precision completa o media para ese numero de parametros.

Su relevancia es limitada pero concreta: se trata de un checkpoint de nicho, publicado sin model card detallada, sin resultados de benchmarks y con cero descargas en el momento de la consulta. Resulta util como referencia para quien necesite un modelo pequeno y especializado en extraccion o conversacion sobre documentos, pero no como modelo de proposito general. La informacion publica disponible es escasa y muchos datos tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged, que a su vez es una fusion de pesos ("merged") derivada de Qwen 3.5 en tamano 0,8B. La model card indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que es coherente con un flujo de SFT eficiente en memoria sobre un modelo pequeno. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

El pipeline declarado es image-text-to-text, lo que implica que la arquitectura incorpora un encoder visual o un mecanismo de proyeccion de imagenes hacia el espacio del modelo de lenguaje, aunque no se detalla el componente visual ni su resolucion de entrada. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Toda la informacion sobre arquitectura interna, datos y proceso de entrenamiento mas alla de lo citado debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tag `conversational`).
- Procesamiento de entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`), orientado a documentos tipo recibo.
- Especializacion declarada en dominio inmobiliario ("estate") mediante el sufijo del checkpoint, aunque no se detalla el alcance de dicha especializacion.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`) y con Text Generation Inference (tag `text-generation-inference`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision avanzada, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de datos de recibos y facturas: dado el nombre del modelo y el pipeline image-text-to-text, se usaria para recibir una imagen de recibo y devolver campos estructurados (comercio, fecha, importe, impuestos) en formato conversacional o JSON, aprovechando el ajuste fino sobre documentos.
- Asistente conversacional de tramitacion inmobiliaria: el sufijo "estate" sugiere un ajuste orientado a consultas sobre propiedades, contratos de alquiler o compraventa; se usaria como chatbot de soporte en portales inmobiliarios para resolver preguntas frecuentes en ingles.
- Preprocesamiento en pipelines de contabilidad: integrado como primer paso para digitalizar gastos a partir de fotografias de tickets, alimentando un sistema posterior de conciliacion; su tamano de 0,8B permite desplegarlo en CPU o GPU modesta dentro del mismo flujo.
- Clasificacion y enrutado de documentos: usar el modelo para identificar el tipo de documento (recibo, escritura, contrato) y decidir a que cola o servicio derivarlo, aprovechando su capacidad multimodal y su bajo coste de inferencia.
- Prototipado rapido de agentes documentales: al ser un modelo pequeno con licencia Apache 2.0, sirve para validar arquitecturas de agente (lectura de imagen, extraccion, respuesta) antes de escalar a modelos mayores.
- Despliegue en el borde o en entornos con recursos limitados: con 853 millones de parametros y pesos safetensors, puede ejecutarse en una unica GPU de consumo o incluso en CPU para cargas por lotes no interactivas, lo que facilita pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (853M parametros), en fp16 serian aproximadamente 1,7 GB solo de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits alrededor de 0,9 GB y en 4 bits alrededor de 0,5 GB, aunque no se distribuyen pesos cuantizados en el repo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y en GPUs de datacenter como A100 o H100 sin problema de memoria, pero no hay validacion publicada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no hay confirmacion del autor ni requisitos de contexto que puedan elevar el consumo.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag) y endpoints compatibles de Hugging Face. No se confirma soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| SZL-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 | 852.985.920 | no disponible | apache-2.0 | si (image-text-to-text) | Hugging Face |
| Qwen 3.5 0.8B (base de la familia) | ~0,8B | no disponible | no disponible | no disponible | Hugging Face |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged (modelo base directo) | ~0,8B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta dataset de entrenamiento, hiperparametros, evaluacion ni limitaciones, lo que impide auditar su comportamiento.
- Solo se declara soporte de ingles; el uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- Riesgo de alucinacion: al ser un modelo pequeno (0,8B) especializado por SFT, es previsible que invente campos o valores en tareas de extraccion de documentos, especialmente con imagenes de baja calidad; no hay evaluacion publicada que lo cuantifique.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen 3.5 y de un dataset de ajuste no publicado, los sesgos heredados y los introducidos por el SFT son desconocidos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Qwen 3.5, ya que el checkpoint declara apache-2.0 sin aclarar la cadena completa de licencias.
- El nombre incluye referencias a dominios ("receiptagent", "estate") sin documentacion sobre el alcance real de la especializacion; no debe asumirse un rendimiento de produccion en esos dominios sin evaluacion propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- El repositorio no incluye pesos cuantizados, por lo que el despliegue en hardware muy limitado requiere cuantizar por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1
- Modelo base directo: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria citada): https://github.com/huggingface/trl
