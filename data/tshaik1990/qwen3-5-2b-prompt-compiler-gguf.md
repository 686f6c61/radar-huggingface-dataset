# tshaik1990/qwen3.5-2b-prompt-compiler-GGUF

## Resumen

`tshaik1990/qwen3.5-2b-prompt-compiler-GGUF` es una compilacion cuantizada en formato GGUF de un fine-tune LoRA sobre el modelo base `unsloth/Qwen3.5-2B`, especializado en la tarea de compilacion de prompts. El modelo recibe una peticion corta y poco especificada y la transforma en un prompt estructurado, claro y listo para implementar, solicitando el contexto faltante (presupuesto, ubicacion, restricciones, etc.) en lugar de inventarlo, y manteniendose en el rol de "escribir un prompt" sin desviarse a responder la peticion directamente.

El autor, tshaik1990, publica tanto el adaptador LoRA en safetensors (para `transformers`/`peft`) como esta version GGUF pensada para su uso con Ollama y llama.cpp. El repositorio incluye dos ficheros: el modelo cuantizado Q4_K_M (~1,31 GB) y un proyector de vision en F16 (~668 MB), lo que sugiere capacidades multimodales heredadas del modelo base. Con 1,94 mil millones de parametros, es un modelo pequeno orientado a inferencia local en hardware modesto.

La relevancia de este modelo reside en su nicho concreto: la ingenieria de prompts. Frente al modelo base sin ajustar, el fine-tune reduce drasticamente la verbosidad de las salidas y elimina la meta-comentarios del tipo "Aqui tienes un prompt para...", produciendo directamente el prompt final. La evaluacion publicada por el autor, aunque autoelaborada y sobre un conjunto de 20 prompts, muestra mejoras significativas en longitud de salida, apertura con asignacion de rol y ausencia de fugas de meta-comentario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B con adaptador LoRA) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el Modelfile de ejemplo usa `num_ctx 4096`) |
| Tipos de cuantizacion | Q4_K_M (GGUF), F16 (proyector de vision, mmproj) |
| Idiomas soportados | no disponible (la serie Qwen3.5 es multilingue segun Qualcomm AI Hub) |
| Licencia | no disponible en la pagina de HuggingFace; la model card indica que hereda la del modelo base `unsloth/Qwen3.5-2B`; la serie Qwen3.5 se publica bajo Apache 2.0 segun fuentes web |
| Formato de pesos | GGUF (Q4_K_M y F16 mmproj) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA sobre `unsloth/Qwen3.5-2B`, la variante de 2B de la serie Qwen3.5 de Alibaba Cloud. Segun las fuentes web, la serie Qwen3.5 introduce mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3, con un enfoque en eficiencia arquitectonica y escalado de aprendizaje por refuerzo. El modelo flagship de la serie (Qwen3.5-397B-A17B) usa arquitectura MoE dispersa, pero la variante de 2B es un modelo denso equilibrado disenado para inferencia on-device.

El entrenamiento del adaptador se realizo durante una sola epoca sobre un dataset pequeno autoelaborado por el autor. No se especifican detalles sobre el numero de tokens, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La presencia del fichero `F16-mmproj.gguf` (proyector de vision) indica que el modelo base incorpora capacidades multimodales de vision, aunque la model card no documenta explicitamente el uso de dicha capacidad en la tarea de compilacion de prompts.

## Capacidades

- Compilacion de prompts: transforma peticiones cortas y poco especificadas en prompts estructurados, claros y listos para implementar.
- Solicitud de contexto faltante: pregunta por informacion ausente (presupuesto, ubicacion, restricciones) en lugar de inventarla.
- Mantenimiento de rol: permanece en el rol de "escribir un prompt" sin desviarse a responder la peticion directamente.
- Generacion de texto: hereda las capacidades de generacion de texto del modelo base Qwen3.5-2B.
- Vision (potencial): el repositorio incluye un proyector de vision en F16, lo que sugiere que el modelo base soporta entrada multimodal, aunque no se documenta su uso en esta tarea.
- Integracion con Ollama y llama.cpp: compatible con ambos ecosistemas mediante ficheros GGUF y Modelfile.

## Casos de uso

- Ingenieria de prompts en equipos de desarrollo: un desarrollador escribe una peticion breve como "prompt para un asistente de soporte tecnico" y el modelo genera un prompt estructurado con rol, contexto, restricciones y formato de salida, listo para usar en produccion.
- Automatizacion de pipelines de generacion de contenido: integrado en un flujo CI/CD, el modelo puede normalizar peticiones de redaccion de articulos, posts o documentacion tecnica, produciendo prompts consistentes que luego se envian a un LLM de mayor tamano.
- Herramientas internas de gestion del conocimiento: empleado para convertir consultas vagas de empleados ("resume el informe de ventas del Q3") en prompts bien formados que alimenten un sistema de RAG corporativo.
- Educacion y formacion en IA: utilizado como herramienta didactica para ensenar a estudiantes a redactar prompts efectivos, mostrando como una peticion ambigua se convierte en una especificacion completa.
- Prototipado rapido de agentes: en el desarrollo de agentes conversacionales, el modelo puede servir como capa de normalizacion de entrada, convirtiendo intenciones del usuario en instrucciones estructuradas para el agente.
- Optimizacion de costes en inferencia: al ser un modelo de 2B cuantizado a Q4_K_M (~1,31 GB), puede ejecutarse en CPU o GPU de gama baja, reduciendo el coste de una etapa de preprocesado de prompts antes de llamar a un LLM grande.

## Benchmarks y rendimiento

La model card incluye una evaluacion autoelaborada por el autor, comparando el fine-tune con el modelo base sin modificar bajo parametros de muestreo identicos (temperatura 0,2, top_p 0,95, top_k 20, mismo system prompt) sobre 20 prompts de validacion:

| Metrica | Modelo base | Fine-tune |
|---|---|---|
| Longitud media de salida | 2775 caracteres | 1002 caracteres |
| Fugas de meta-comentario ("Aqui tienes un prompt para...") | 55% | 0% |
| Apertura con asignacion de rol ("Eres un experto...") | 0% | 85% |
| Salida mas corta | — | 18 de 20 prompts |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor advierte explicitamente que esta evaluacion es autoelaborada, no un benchmark independiente, y que la revision por preferencia humana esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa ~1,31 GB, por lo que cabe en cualquier GPU consumer con 4 GB o mas de VRAM; tambien es viable inferencia solo CPU con llama.cpp.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; no requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, es el caso de uso principal del formato GGUF.
- Opciones de despliegue: Ollama (mediante `ollama run` o Modelfile local), llama.cpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 2B cuantizado, se espera una latencia baja incluso en CPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tshaik1990/qwen3.5-2b-prompt-compiler-GGUF | 1,94B | no disponible | hereda del base (Apache 2.0 segun fuentes) | GGUF | Fine-tune LoRA especializado en compilacion de prompts |
| unsloth/Qwen3.5-2B (base) | 1,94B | no disponible | Apache 2.0 (serie Qwen3.5) | safetensors | Modelo generalista sin especializacion; mas verboso y con meta-comentarios |
| Qwen/Qwen3.5-2B (oficial) | 2B | no disponible | Apache 2.0 | safetensors | Version oficial de Alibaba Cloud, multilingue, con mejoras de razonamiento sobre Qwen3 |

No se dispone de informacion sobre otros modelos especializados en compilacion de prompts de tamano comparable; la comparativa se limita al modelo base y a la version oficial de Qwen3.5-2B.

## Limitaciones y advertencias

- Entrenamiento limitado: el adaptador se entreno durante una sola epoca sobre un dataset pequeno autoelaborado, lo que puede limitar la generalizacion fuera del ambito de compilacion de prompts.
- Evaluacion no independiente: los resultados publicados son autoelaborados por el autor, no un benchmark independiente, y la revision por preferencia humana esta pendiente.
- Tamano reducido: al ser un modelo de 2B, puede no generalizar bien fuera de los casos de uso de compilacion de prompts.
- Licencia ambigua: la pagina de HuggingFace no especifica la licencia; la model card indica que hereda la del modelo base, pero conviene verificar la licencia exacta de `unsloth/Qwen3.5-2B` antes de un uso comercial.
- Riesgo de alucinacion: como cualquier LLM pequeno, puede generar contenido inexacto o inventar restricciones si el contexto proporcionado es insuficiente, aunque el diseno del fine-tune mitiga parcialmente este riesgo al solicitar informacion faltante.
- Contexto limitado: el Modelfile de ejemplo usa `num_ctx 4096`, lo que sugiere un contexto operativo modesto; no se documenta la longitud maxima real del modelo base.
- Sin datos de benchmarks estandar: no se publican resultados en MMLU, HumanEval, GSM8K u otros benchmarks, lo que dificulta la comparacion objetiva con otros modelos.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/tshaik1990/qwen3.5-2b-prompt-compiler-GGUF
- Adaptador LoRA (safetensors): https://huggingface.co/tshaik1990/qwen3.5-2b-prompt-compiler
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Modelo oficial Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Guia de ejecucion local de Qwen 3.5 (DataCamp): https://www.datacamp.com/tutorial/run-qwen-3-5-locally
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_5_2b
- Guia completa de Qwen 3.5 (benchmarks y configuracion local): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
- Ficha de Qwen3.5 en LM Studio: https://lmstudio.ai/models/qwen3.5
