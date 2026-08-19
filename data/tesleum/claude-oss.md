# Tesleum/Claude-OSS

## Resumen

Claude-OSS es un modelo de lenguaje open source desarrollado por Tesleum, una iniciativa centrada en la inteligencia artificial local y privada. Según la información disponible, se trata de un modelo de 21 000 millones de parámetros (21B) optimizado para flujos de trabajo agénticos, asistencia en programación, razonamiento y conversación general. Su diseño busca ofrecer una experiencia similar a la de Claude, pero ejecutable localmente mediante Ollama, lo que lo hace relevante para entornos donde la privacidad y el control de los datos son prioritarios.

El modelo se distribuye bajo licencia Eclipse Public License 2.0 (ecl-2.0), una licencia de código abierto que permite uso comercial y modificación, aunque con ciertas obligaciones de copyleft. La model card es extremadamente breve y no proporciona detalles técnicos sobre arquitectura, contexto o entrenamiento. La información disponible se limita a la página de Hugging Face, una entrada en el registro de Ollama y una referencia a FriendliAI para despliegue en producción. No se han publicado especificaciones detalladas ni resultados de benchmarks en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 21 000 millones (21B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (mencionado en la descripcion de Ollama) |
| Idiomas soportados | no disponible |
| Licencia | Eclipse Public License 2.0 (ecl-2.0) |
| Formato de pesos | no disponible (se menciona compatibilidad con Ollama, que suele usar GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (si es un transformer denso, MoE, SSM o hibrido), ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La unica referencia tecnica encontrada es la mencion a cuantizacion MXFP4 en la pagina de Ollama, que sugiere que el modelo se distribuye en un formato optimizado para inferencia eficiente en hardware variado. Tampoco se conocen innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Dada la ausencia de documentacion, cualquier afirmacion sobre su arquitectura o entrenamiento seria especulativa.

## Capacidades

Segun la descripcion de Ollama, el modelo esta disenado para:

- Flujos de trabajo agénticos: capacidad de actuar como agente en tareas multi-paso, probablemente con soporte para tool calling o function calling, aunque no se detalla.
- Asistencia en codigo: generacion, completado y depuracion de codigo en diversos lenguajes, orientado a entornos de desarrollo.
- Razonamiento: resolucion de problemas logicos y matematicos, con capacidad de encadenar pasos de razonamiento.
- Conversacion general: mantenimiento de dialogos multi-turno con contexto, util para chatbots y asistentes.
- Compatibilidad con OpenAI: se menciona que es "OpenAI-compatible", lo que sugiere que puede integrarse con herramientas y librerias que usan la API de OpenAI (por ejemplo, LangChain o frameworks de agentes).
- Ejecucion local: optimizado para Ollama, lo que permite su uso sin conexion y con control total de los datos.

No se mencionan capacidades multimodales (vision, audio) ni un modo de "thinking" explicito.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar Claude-OSS en su maquina mediante Ollama para obtener sugerencias de codigo, explicaciones y refactorizaciones sin enviar el codigo a servidores externos, lo que es critico en entornos con politicas de confidencialidad estrictas.
- Agente de automatizacion de tareas: gracias a su orientacion agéntica y compatibilidad con OpenAI, puede integrarse en pipelines que llaman a herramientas (por ejemplo, APIs, bases de datos o scripts) para ejecutar tareas como generacion de informes, gestion de correos o actualizacion de registros.
- Chatbot de soporte interno: empresas pueden desplegar el modelo en infraestructura propia para atender consultas de empleados o clientes, manteniendo los datos dentro de la organizacion y reduciendo costes de API externa.
- Entorno de desarrollo integrado (IDE) con autocompletado: usar el modelo como backend para plugins de VS Code o JetBrains que ofrecen completado de codigo y chat contextual, con la ventaja de no depender de la nube.
- Razonamiento y analisis de documentos: dado su enfoque en razonamiento, puede procesar textos largos (si el contexto lo permite, aunque no se especifica) para extraer conclusiones, resumir informes o responder preguntas complejas sobre documentacion tecnica.
- Prototipado rapido de aplicaciones con IA: al ser compatible con la API de OpenAI, los desarrolladores pueden cambiar el endpoint a Claude-OSS para probar aplicaciones existentes sin modificar el codigo, facilitando la evaluacion de alternativas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se ofrecen comparativas con modelos similares. Por tanto, no es posible valorar su rendimiento relativo con datos objetivos.

## Requisitos de hardware

Dado que el modelo tiene 21B parametros, se pueden estimar los requisitos de VRAM para inferencia en funcion de la cuantizacion. Sin embargo, al no disponer de datos oficiales, estas cifras son orientativas:

- Cuantizacion MXFP4 (mencionada): aproximadamente 10-12 GB de VRAM, ya que 21B parametros en 4 bits ocupan unos 10,5 GB, mas overhead de activaciones y cache. Esto permitiria ejecutarlo en GPUs de consumo como RTX 3080/3090, RTX 4070/4080/4090 o equivalentes de AMD con 12-16 GB.
- Cuantizacion de 8 bits (si estuviera disponible): unos 21 GB, requiriendo GPUs profesionales como A100 40GB, RTX A6000 o dos GPUs de 12 GB en paralelo.
- Sin cuantizar (FP16): unos 42 GB, solo viable en GPUs de datacenter (A100 80GB, H100) o mediante CPU con mucha RAM.

Para despliegue, se menciona Ollama como opcion principal, que gestiona la cuantizacion y la carga en GPU. Tambien se referencia FriendliAI como servicio de inferencia de baja latencia, lo que sugiere compatibilidad con entornos de produccion escalables. Otras opciones como vLLM o llama.cpp podrian ser viables si el formato de pesos es GGUF o safetensors, pero no se confirma.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo se posiciona en el rango de 21B parametros, similar a otros modelos open source como:

- Llama 3.1 8B (8B, contexto 128K, licencia MIT) - mas pequeno y con contexto mayor.
- Qwen 2.5 14B (14B, contexto 128K, licencia Apache 2.0) - mas pequeno y con contexto mayor.
- Mistral Small 22B (22B, contexto 32K, licencia Apache 2.0) - tamano similar, contexto menor.

Sin embargo, no hay datos de rendimiento de Claude-OSS para comparar. La unica diferencia clara es la licencia (ecl-2.0 frente a MIT/Apache) y el enfoque en agentes, pero sin benchmarks no se puede establecer una comparacion objetiva. Se recomienda consultar la documentacion oficial si se publica en el futuro.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: la model card no incluye arquitectura, datos de entrenamiento, contexto ni instrucciones de uso, lo que dificulta su evaluacion y despliegue responsable.
- Sesgos y alucinaciones: al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos potenciales. Como cualquier LLM, existe riesgo de generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede afectar a tareas que requieran procesar documentos largos o mantener conversaciones extensas.
- Idiomas: no se especifican los idiomas soportados. Es probable que el modelo este entrenado principalmente en ingles, aunque podria tener capacidades multilingues limitadas.
- Licencia ecl-2.0: aunque permite uso comercial, la Eclipse Public License 2.0 es una licencia copyleft debil que exige que las modificaciones del codigo fuente se publiquen bajo la misma licencia. Esto puede ser relevante si se integra el modelo en un producto propietario.
- Compatibilidad: la afirmacion de "OpenAI-compatible" no esta detallada; puede referirse solo al formato de API, pero no garantiza que todas las funciones de la API de OpenAI (como tool calling avanzado) esten implementadas.
- Soporte y mantenimiento: al ser un proyecto de un unico autor (Tesleum), el soporte y la continuidad del proyecto no estan garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/Tesleum/Claude-OSS
- Ollama: https://ollama.com/Tesleum/Claude-OSS
- FriendliAI (despliegue): https://friendli.ai/models/Tesleum/Claude-OSS
- Perfil del autor en Hugging Face: https://huggingface.co/Tesleum/models
