# tinnlab/Qwen3.5-9B-GGUF

## Resumen

Este repositorio es un espejo (mirror) de un único archivo GGUF del modelo Qwen3.5-9B cuantizado en Q4_K_M. La cuantización original fue realizada por el equipo de unsloth y publicada en `unsloth/Qwen3.5-9B-GGUF`; Tin Nguyen Lab la redistribuye sin modificar ningún byte, con el objetivo de mantener un flujo de instalación local estable y controlado. No se trata de un modelo nuevo ni de un fine-tuning: es una copia verificada mediante hash SHA256 del archivo original.

Qwen3.5-9B es un modelo de lenguaje de 9 mil millones de parámetros desarrollado por el equipo Qwen, con licencia Apache-2.0. Este mirror ofrece únicamente la variante Q4_K_M (5,68 GB), suficiente para ejecutar el modelo en hardware de consumo, tanto en CPU como en GPU con poca memoria. Al no incluir el proyector multimodal (`mmproj-*.gguf`), este espejo solo sirve para tareas de texto y tool calling, no para entrada de imágenes o vídeo.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores desplegar Qwen3.5-9B en entornos locales sin depender de servicios en la nube, con un formato optimizado para llama.cpp y sus derivados (Ollama, LM Studio, etc.). Al ser un mirror, se garantiza la disponibilidad del archivo incluso si el repositorio upstream cambia o desaparece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.5, detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Solo Q4_K_M en este mirror (el upstream dispone de 28 variantes) |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-9B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base Qwen3.5-9B en la documentacion proporcionada. Se sabe que es un transformer denso de 9 mil millones de parametros, pero no se especifican detalles como el numero de capas, la dimension de los embeddings, el tipo de atencion o el dataset de entrenamiento. Tampoco se indica si se aplicaron tecnicas como RLHF o DPO.

La cuantizacion a Q4_K_M fue realizada por unsloth mediante llama.cpp, un proceso estandar que reduce la precision de los pesos a 4 bits con bloques de cuantizacion K-means. El mirror no introduce ninguna modificacion tecnica; el archivo es identico al publicado por unsloth, como se verifica por el hash SHA256.

## Capacidades

- Generacion de texto y chat conversacional multi-turno.
- Instruccion y seguimiento de ordenes complejas (instruction following).
- Razonamiento basico y resolucion de problemas.
- Soporte de tool calling / function calling (segun la documentacion del README).
- Capacidades multilingues: no especificadas, pero el modelo base Qwen suele soportar varios idiomas; en este mirror no se indica.
- No incluye capacidades de vision: el archivo `mmproj-*.gguf` no esta presente, por lo que no puede procesar imagenes ni video.

## Casos de uso

- Asistente local de codigo: el modelo puede ejecutarse en una laptop con 8 GB de RAM mediante llama.cpp u Ollama, ofreciendo autocompletado y generacion de fragmentos de codigo sin conexion a internet.
- Chatbot de atencion al cliente: al soportar tool calling, puede integrarse en sistemas de ticketing para consultar bases de conocimiento o APIs externas, manteniendo el contexto de la conversacion.
- Prototipado rapido de aplicaciones NLP: al ser un archivo unico GGUF, se puede cargar en LM Studio o en scripts de Python con `llama-cpp-python` para experimentar con prompts y flujos de agente.
- Despliegue en entornos con restricciones de red: al ser un mirror publico y sin autenticacion, es util para instalaciones offline donde no se permite acceder a HuggingFace directamente.
- Generacion de documentacion tecnica: puede redactar resumenes, guias y comentarios de codigo a partir de especificaciones dadas, aprovechando su capacidad de seguir instrucciones.
- Automatizacion de tareas de oficina: extraccion de informacion de textos, redaccion de correos y resumen de reuniones, ejecutable en hardware modesto con cuantizacion Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El mirror no incluye mediciones de MMLU, HumanEval, GSM8K ni otras pruebas estandar. Para datos de rendimiento, se recomienda consultar la model card original de `Qwen/Qwen3.5-9B` o los repositorios de unsloth y bartowski.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 5,68 GB. Para GPU, se recomienda al menos 6-8 GB de VRAM para dejar espacio para el contexto y los calculos intermedios.
- GPU recomendadas: tarjetas con 8 GB o mas, como RTX 3070/3080, RTX 4060 Ti, RTX 4070, o GPUs profesionales como A10 o L4. En GPUs con menos VRAM (4 GB) se puede intentar con `--ctx-size` reducido, pero el rendimiento sera limitado.
- En CPU: se necesita al menos 8 GB de RAM libre (preferiblemente 16 GB) para cargar el modelo y el contexto. Funciona en procesadores modernos con instrucciones AVX2, aunque la velocidad sera menor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, `llama-cpp-python`, o servidores compatibles con GGUF como llama.cpp server o text-generation-webui.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la longitud del contexto; en una RTX 4090 se pueden esperar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-GGUF (este mirror) | 8,95B | No disponible | Solo Q4_K_M | Apache-2.0 | GGUF |
| bartowski/Qwen_Qwen3.5-9B-GGUF | 8,95B | No disponible | 28 variantes (3,48-17,92 GB) | Apache-2.0 | GGUF |
| lmstudio-community/Qwen3.5-9B-GGUF | 8,95B | No disponible | Varias (incluye Q4_K_M) | Apache-2.0 | GGUF |
| Llama 3.1 8B (GGUF) | 8,03B | 128K | Multiples | Llama 3.1 License | GGUF |

La diferencia principal entre este mirror y las alternativas es la cantidad de cuantizaciones disponibles: bartowski y lmstudio-community ofrecen multiples opciones de precision, mientras que este repositorio solo contiene Q4_K_M. La licencia y el modelo base son identicos.

## Limitaciones y advertencias

- Es un mirror: no hay garantia de que la cuantizacion de unsloth sea una conversion perfecta de los pesos originales de Qwen. El hash solo verifica la identidad con el archivo de unsloth, no la fidelidad respecto a los pesos originales.
- Solo incluye Q4_K_M: si se necesita otra cuantizacion (por ejemplo, Q8_0 o Q2_K), hay que acudir al repositorio upstream.
- No soporta vision: al faltar el proyector multimodal, no se pueden procesar imagenes ni video, aunque el modelo base pueda tener esa capacidad.
- Sin informacion sobre idiomas: no se especifica que idiomas soporta el modelo; se asume que hereda las capacidades de Qwen3.5-9B, pero no esta documentado en este mirror.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contexto insuficiente.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero se deben mantener los avisos de atribucion y licencia tal como se incluyen en el repositorio.
- Sin soporte oficial: al ser un mirror comunitario, no hay canal de soporte ni garantias de actualizaciones.

## Enlaces

- Repositorio del mirror: https://huggingface.co/tinnlab/Qwen3.5-9B-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio upstream de unsloth: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Alternativa de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Alternativa de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-9B-GGUF (segun resultados de busqueda)
- Ficha en GreyBrain Academy: https://edu.greybrain.ai/models/qwen3-5-9b-gguf/
- Ficha en AI Models: https://www.aimodels.fyi/models/huggingFace/qwen-qwen3.5-9b-gguf-bartowski
