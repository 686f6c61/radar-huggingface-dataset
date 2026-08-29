# wangzhang/Qwen3.5-122B-A10B-abliterix

## Resumen

Qwen3.5-122B-A10B-abliterix es una variante del modelo Qwen3.5-122B-A10B de Alibaba Cloud, modificada mediante tecnicas de "abliteration" para eliminar los mecanismos de rechazo y censura presentes en el modelo original. El autor, wangzhang, ha publicado este checkpoint en HuggingFace con el objetivo de ofrecer una version "sin censura" (uncensored) del modelo base, manteniendo intactas sus capacidades tecnicas. El modelo resultante conserva la arquitectura original de mezcla de expertos (MoE) con 122.000 millones de parametros totales, de los cuales solo se activan 10.000 millones durante la inferencia.

El modelo base Qwen3.5-122B-A10B fue lanzado por Alibaba Cloud el 25 de febrero de 2026 y representa un avance significativo en la linea Qwen3.5. Su arquitectura hibrida combina atencion lineal con un modelo de mezcla de expertos dispersa, logrando una eficiencia de inferencia notablemente superior a la de modelos densos de tamano similar. Con una ventana de contexto de 262.000 tokens y capacidades nativas de vision-lenguaje, este modelo se posiciona como una alternativa de codigo abierto a modelos propietarios de alto rendimiento. La version abliterated mantiene todas estas capacidades, pero elimina las restricciones de contenido que limitaban la generacion en temas sensibles.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece el rendimiento de un modelo MoE de ultima generacion con un coste computacional contenido; por otro, al eliminar las salvaguardas de seguridad, abre un debate sobre los limites eticos y legales del ajuste de modelos. El acceso al modelo esta restringido (gated) y requiere aceptar condiciones especificas en HuggingFace, lo que refleja la sensibilidad del contenido que puede generar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con atencion lineal y mezcla de expertos dispersa |
| Parametros totales | 122.111.526.912 (122B) |
| Parametros activos | 10.000.000.000 (10B) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B emplea una arquitectura hibrida que integra un mecanismo de atencion lineal con un modelo de mezcla de expertos dispersa (sparse MoE). Esta combinacion permite reducir significativamente el coste computacional durante la inferencia, ya que solo se activan 10.000 millones de los 122.000 millones de parametros totales por cada token procesado. La atencion lineal mejora la eficiencia en el manejo de secuencias largas, mientras que el componente MoE aporta capacidad de modelado sin incrementar proporcionalmente el coste de computo.

El modelo acepta entradas de texto, imagen y video, y produce salidas de texto, lo que lo convierte en un modelo nativo de vision-lenguaje. La ventana de contexto de 262.000 tokens permite procesar documentos extensos y mantener conversaciones de multiples turnos con un historial amplio. En cuanto al entrenamiento, no se dispone de informacion detallada sobre el numero de tokens utilizados, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. El proceso de abliteration aplicado por wangzhang consiste en la eliminacion de los vectores de direccion responsables del comportamiento de rechazo, una tecnica que no requiere reentrenamiento completo sino una modificacion quirurgica de los pesos del modelo.

## Capacidades

- Generacion de texto avanzada con capacidades de razonamiento complejo, incluyendo tareas de logica, analisis y sintesis de informacion.
- Procesamiento multimodal nativo: acepta entradas de texto, imagen y video, y genera respuestas textuales basadas en el contenido visual.
- Razonamiento multi-paso: el modelo esta disenado para tareas que requieren cadenas de razonamiento extensas, similar a otros modelos de la familia Qwen3.5.
- Capacidades multilingues: el modelo base soporta multiples idiomas, aunque la informacion especifica sobre los idiomas exactos no esta disponible en la ficha.
- Generacion sin restricciones de contenido: al haber sido sometido a abliteration, el modelo no rechaza peticiones sobre temas que el modelo original consideraria sensibles o peligrosos.
- Soporte de contexto largo: con 262.000 tokens de ventana, puede procesar libros completos, codebases extensos o historiales de conversacion muy largos.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad de IA: el modelo permite estudiar el comportamiento de un LLM de alto rendimiento sin las salvaguardas de seguridad, lo que resulta util para investigar mecanismos de alineacion, sesgos y estrategias de mitigacion.
- Generacion de contenido creativo sin filtros: escritores y creadores pueden explorar temas controvertidos o marginales sin que el modelo rechace la peticion, lo que facilita la creacion de ficcion especulativa, guiones o narrativas que aborden temas tabu.
- Analisis de documentos extensos: gracias a su ventana de contexto de 262.000 tokens, el modelo puede procesar informes anuales, expedientes judiciales o documentacion tecnica de gran volumen en una sola pasada, extrayendo informacion relevante y resumiendo contenidos.
- Desarrollo de agentes conversacionales especializados: su capacidad para mantener conversaciones multi-turno con contexto amplio lo hace adecuado para construir asistentes virtuales en dominios especificos donde se requiere recordar informacion de interacciones anteriores.
- Traduccion y localizacion de contenidos: aunque los idiomas exactos no estan documentados, el modelo base es multilingue, por lo que puede emplearse para traducir textos largos manteniendo coherencia contextual gracias a su amplia ventana.
- Generacion de codigo y asistencia en programacion: el modelo puede ayudar en tareas de programacion, explicacion de codigo, refactorizacion y generacion de documentacion tecnica, aprovechando su capacidad de razonamiento y su contexto extenso para manejar proyectos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version abliterated en la informacion disponible. Sin embargo, el modelo base Qwen3.5-122B-A10B ha sido evaluado por Alibaba Cloud y, segun los datos disponibles, sus capacidades de texto superan significativamente a las de Qwen3-235B-2507, y sus capacidades visuales son comparables a las de modelos de ultima generacion. En la jerarquia de la familia Qwen3.5, este modelo solo es superado por el Qwen3.5-397B-A17B en rendimiento global. No se proporcionan cifras concretas de benchmarks como MMLU, HumanEval o GSM8K en la informacion recopilada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 122.000 millones de parametros totales, el modelo requiere aproximadamente 244 GB de VRAM en precision FP16 para cargar todos los pesos. Sin embargo, al ser un modelo MoE con solo 10.000 millones de parametros activos, la memoria necesaria para la inferencia puede reducirse significativamente si se implementa una carga parcial de expertos.
- GPU recomendadas: para una inferencia fluida se recomiendan GPUs de centro de datos como NVIDIA A100 (80 GB) o H100 (80 GB), siendo necesarias multiples unidades en configuracion multi-GPU. Con cuantizacion a 8 bits, podria caber en 2-3 GPUs de 80 GB.
- En consumer GPUs: no es viable ejecutar este modelo en GPUs de consumo como la RTX 4090 (24 GB) sin una cuantizacion agresiva (4 bits o inferior), lo que degradaria notablemente la calidad de las respuestas.
- Opciones de despliegue: el formato safetensors permite su uso con frameworks como vLLM, TensorRT-LLM o TGI para inferencia optimizada. Para cuantizacion, se podrian generar versiones GGUF para su uso con llama.cpp u Ollama, aunque no se han publicado oficialmente.
- Latencia y throughput: no se dispone de datos concretos, pero la arquitectura MoE con 10B parametros activos deberia ofrecer una latencia sustancialmente menor que un modelo denso de 122B, con un throughput estimado de 50-100 tokens por segundo en hardware de centro de datos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-abliterix | 122B | 10B | 262K | Apache 2.0 | Gated en HuggingFace |
| Qwen3.5-122B-A10B (base) | 122B | 10B | 262K | Apache 2.0 | Publico |
| Qwen3.5-397B-A17B | 397B | 17B | no disponible | Apache 2.0 | Publico |
| Qwen3-235B-2507 | 235B | no disponible | no disponible | Apache 2.0 | Publico |

El modelo abliterated se diferencia del base unicamente en la eliminacion de las salvaguardas de seguridad, manteniendo identicas las especificaciones tecnicas. Frente al Qwen3.5-397B-A17B, ofrece un rendimiento inferior pero con un coste computacional mucho menor. Comparado con el Qwen3-235B-2507, el modelo base presenta un rendimiento textual significativamente superior, segun los datos de Alibaba Cloud.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido peligroso, ilegal o eticamente cuestionable sin restricciones. Su uso conlleva riesgos legales y eticos considerables.
- El acceso al modelo esta restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que limita su disponibilidad y puede implicar restricciones adicionales de uso.
- No se dispone de informacion sobre los idiomas soportados especificamente, aunque el modelo base es multilingue.
- No se han publicado benchmarks especificos para esta version, por lo que el rendimiento real en tareas estandarizadas no ha sido verificado de forma independiente.
- El proceso de abliteration puede introducir degradaciones sutiles en la calidad de las respuestas o comportamientos inesperados en ciertos dominios, aunque no hay datos que confirmen este extremo.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" del modelo puede generar problemas de responsabilidad legal si se utiliza en aplicaciones de produccion.
- El tamano del repositorio (489,4 GB) implica que la descarga y el almacenamiento requieren recursos significativos, y la inferencia exige hardware de centro de datos de gama alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/Qwen3.5-122B-A10B-abliterix
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Ficha del modelo en DataLearnerAI: https://www.datalearner.com/ai-models/pretrained-models/qwen3-5-122b-a10b
- Ficha del modelo en DataLearnerAI (ingles): https://www.datalearner.com/en/ai-models/pretrained-models/qwen3-5-122b-a10b
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.5-122b-a10b
