# xleeelx/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated es una versión modificada del modelo multimodal Qwen3.8-27B desarrollado por Alibaba, en la que se ha aplicado la técnica de abliteration para eliminar los rechazos del modelo ante solicitudes que normalmente activarían sus filtros de seguridad. El resultado es un modelo "sin censura" que genera respuestas sin los bloqueos habituales, aunque a costa de perder las garantías de seguridad del modelo original. El autor es huihui-ai, un proyecto conocido por publicar modelos abliterated de varios LLMs. Este repo en concreto contiene las cuantizaciones GGUF generadas a partir de los pesos BF16 del modelo abliterated.

El modelo base, Qwen3.8-27B, es un LLM denso multimodal (imagen-texto) de 27.320 millones de parámetros, diseñado para tareas de codificación, agentes y automatización de oficina. La versión abliterated mantiene la misma arquitectura y tamaño, pero modifica los pesos de las capas que controlan los rechazos. El repo GGUF incluye múltiples cuantizaciones (de Q2_K_L a Q8_0_L) que permiten ejecutar el modelo en hardware variado. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque con las advertencias éticas que se detallan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto), basado en Qwen3.8-27B |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (la model card sugiere usar -c 262144 en llama.cpp, pero no se confirma el contexto oficial) |
| Tipos de cuantizacion | Q2_K_L, Q3_K_L, Q4_K_L, Q5_K_L, Q6_K_L, Q8_0_L (con tensores ablacionados convertidos a mayor precision) |
| Idiomas soportados | No disponible (se heredan los del modelo base Qwen3.8-27B, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors BF16 disponible en el repo del modelo original) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B es un LLM multimodal denso de 27 mil millones de parametros, disenado por Alibaba para tareas de codigo, agentes y automatizacion de oficina. Incluye capacidad de procesamiento de imagenes y texto, y soporta un contexto largo (se recomienda 262144 tokens en la model card, aunque no se confirma el valor oficial). El modelo base se entreno con datos mixtos de texto e imagenes, aunque no se han publicado detalles especificos del dataset en esta informacion.

La version abliterated se crea mediante el metodo de remove-refusals-with-transformers, una implementacion que elimina las capas de rechazo del modelo sin usar TransformerLens. En esta variante, las primeras 15 capas se mantienen intactas, y los tensores clave (token_embd, output, ffn_down, ssm_out, attn_output) se modifican en las capas restantes. Para las cuantizaciones GGUF, los pesos ablatiados se han convertido a precision Q8_0 o BF16 (en el caso de Q8_0_L) para preservar la calidad de la respuesta. No se ha modificado el componente de vision ni el modulo de MTP.

## Capacidades

- Generacion de texto multimodal: acepta imagenes y texto como entrada y produce respuestas textuales.
- Razonamiento y comprension de lenguaje natural: hereda las capacidades del Qwen3.8-27B para tareas de razonamiento complejo.
- Generacion de codigo y automatizacion de oficina: el modelo base es conocido por su rendimiento en codigo y agentes.
- Sin filtros de seguridad: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido que el modelo original bloquearia, incluyendo respuestas sobre temas sensibles o controvertidos.
- Soporte de cuantizaciones GGUF: permite ejecutar en CPU y GPU con distintos niveles de precision.
- No se confirma soporte de tool calling o function calling en esta version especifica, aunque el modelo base podria incluirlo.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: permite estudiar como se comporta un LLM cuando se eliminan los filtros de rechazo, y analizar los riesgos de contenido no moderado.
- Pruebas de robustez en sistemas de moderacion: se puede usar para evaluar la capacidad de los filtros de contenido externos frente a respuestas que evaden las barreras de seguridad.
- Generacion de contenido creativo sin restricciones: para proyectos de escritura o narrativa que requieran explorar temas tabu o controversiales, siempre que se respeten las leyes y la etica.
- Entornos de investigacion academica: para estudiar los limites de la generacion de texto y el impacto de la ablacion de capas de seguridad.
- Desarrollo de herramientas de control de calidad: para probar sistemas de moderacion automatizada en plataformas de contenido.
- Experimentacion con cuantizaciones extremas: las variantes Q2_K_L y Q3_K_L permiten probar el rendimiento en hardware limitado, aunque con mayor perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para esta version abliterated.

## Requisitos de hardware

- Tamaño del repo: 311.2 GB, lo que indica que se incluyen multiples cuantizaciones. Para una cuantizacion Q4_K_L, el modelo ocupa aproximadamente 15-16 GB de memoria.
- VRAM estimada: con Q4_K_L, se requiere al menos 16 GB de VRAM para inferencia en GPU; con Q8_0_L, alrededor de 28 GB. Para cuantizaciones menores (Q2_K_L) se puede usar con 8-10 GB.
- GPU recomendadas: RTX 3090/4090 con 24 GB para Q8_0_L; RTX 3060/4060 con 12 GB para Q4_K_L; CPU con 32 GB de RAM para Q2_K_L.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF), TGI (con adaptacion). La model card recomienda usar llama.cpp con la ultima version y llama-cli con -c 262144.
- Latencia y throughput: no se han medido en esta informacion.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente comparables en el contexto de la abliteration. La alternativa mas cercana es el modelo base Qwen3.8-27B original, que tiene la misma arquitectura y parametros pero con filtros de seguridad intactos. Otras versiones abliterated de modelos como Llama 3.1 8B o Mistral 7B podrian ser comparables en cuanto a la tecnica, pero no hay datos de rendimiento en esta informacion. En terminos de licencia, todos son Apache 2.0, pero el modelo base de Qwen3.8-27B tiene una licencia Apache 2.0 tambien, aunque con restricciones adicionales en su uso comercial (segun la documentacion oficial de Qwen). Esta version abliterated elimina las restricciones de uso, pero a cambio de perder las garantias de seguridad.

## Limitaciones y advertencias

- Riesgo de contenido sensible o controvertido: el filtrado de seguridad se ha reducido significativamente, pudiendo generar contenido inapropiado, ofensivo o ilegal.
- No apto para todos los publicos: el modelo puede producir contenido que no es adecuado para entornos publicos, menores o aplicaciones con altos requisitos de seguridad.
- Responsabilidad legal y etica: el usuario debe asegurarse de que su uso cumple las leyes locales y los estandares eticos. El contenido generado puede acarrear riesgos legales.
- Uso recomendado para investigacion y entornos controlados: no se recomienda para produccion ni aplicaciones comerciales publicas.
- Monitoreo y revision manual: se aconseja supervisar las salidas en tiempo real y realizar revisiones manuales para evitar la difusion de contenido inapropiado.
- Sin garantias de seguridad: el modelo no ha pasado por una optimizacion de seguridad rigurosa, y el autor (huihui.ai) no se hace responsable de las consecuencias del uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xleeelx/Huihui-Qwen3.8-27B-abliterated-GGUF
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Metodo de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Modelo en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
