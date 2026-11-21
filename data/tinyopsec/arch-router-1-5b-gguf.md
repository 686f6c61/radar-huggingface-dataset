# tinyopsec/Arch-Router-1.5B-GGUF

## Resumen

Arch-Router-1.5B es un modelo de lenguaje especializado en el enrutamiento de consultas entre modelos (LLM routing) mediante alineamiento de preferencias. Lo desarrolla Katanemo y esta construido como un fine-tuning de Qwen2.5-1.5B-Instruct, por lo que hereda la arquitectura transformer decoder-only de Qwen2. En lugar de generar respuestas finales, el modelo aprende a mapear una consulta del usuario a un dominio y una accion concretos, lo que permite decidir que modelo de un pool (por ejemplo, uno barato y rapido frente a uno grande y caro) debe atenderla.

La version aqui descrita es una cuantizacion GGUF producida por el usuario tinyopsec con llama.cpp, que incluye 13 variantes desde F16 hasta Q2_K. Esto la hace desplegable en entornos con recursos limitados, incluidos portatiles y CPUs, algo relevante para arquitecturas de enrutamiento que deben ejecutarse en cada peticion antes de invocar al modelo final.

Su relevancia actual radica en el coste: un router de 1.500 millones de parametros puede clasificar intenciones con una fraccion del coste de un modelo grande, permitiendo pipelines multi-modelo con enrutamiento dinamico. El modelo tiene 1.543.714.304 parametros totales y esta publicado bajo la Katanemo Research License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct como base) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Katanemo Research License (etiquetada como "other") |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 1.543.714.304 parametros. Sobre esa base, Katanemo aplico un fine-tuning orientado a enrutamiento por alineamiento de preferencias (preference-aligned routing), cuyo objetivo es que el modelo puntue o seleccione entre dominios y acciones definidos por el usuario para cada consulta. La model card de la cuantizacion no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas especificas como RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion principal no esta en la arquitectura interna, sino en el uso: el modelo actua como clasificador de intencion en pipelines multi-modelo, decidiendo que LLM downstream debe responder. Las cuantizaciones GGUF se generaron con llama.cpp, lo que preserva la compatibilidad con runtimes de inferencia local y permite ejecutar el router en el mismo nodo que atiende la peticion, sin llamadas adicionales a red.

## Capacidades

- Enrutamiento de consultas: mapea una peticion de usuario a un dominio y una accion definidos previamente, alineandose con preferencias configuradas.
- Clasificacion de intencion: util para decidir que modelo, herramienta o flujo debe atender una consulta.
- Generacion de texto basica: heredada de Qwen2.5-1.5B-Instruct, aunque el fine-tuning la orienta a tareas de routing.
- Inferencia local: compatible con llama.cpp, Ollama, LM Studio y koboldcpp gracias al formato GGUF.
- Despliegue ligero: las cuantizaciones de 4 bits y menores permiten ejecucion en CPU y GPU de gama baja.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Cobertura multilingue: no disponible en la documentacion.

## Casos de uso

- Enrutamiento en pipelines multi-modelo: el router clasifica cada consulta y la dirige al modelo adecuado (por ejemplo, uno pequeno para preguntas simples y uno grande para razonamiento complejo), reduciendo coste medio por peticion.
- Clasificacion de intenciones en atencion al cliente: se usa para etiquetar la consulta del usuario con un dominio (facturacion, soporte tecnico, ventas) y derivarla al flujo o agente correspondiente.
- Enrutamiento por coste y latencia: en produccion, el modelo decide si una consulta requiere un LLM grande o puede resolverse con uno pequeno, optimizando el presupuesto de inferencia.
- Preprocesado en arquitecturas de agentes: actua como primer paso que selecciona la herramienta o sub-agente adecuado antes de ejecutar la tarea.
- Despliegue en el borde: gracias a las cuantizaciones Q4_K_M y menores, puede ejecutarse en portatiles o servidores sin GPU para enrutar trafico en entornos con recursos limitados.
- Investigacion sobre routing: sirve como baseline reproducible para experimentos de seleccion de modelos y alineamiento de preferencias en enrutamiento.
- Moderacion y triaje previo: puede clasificar consultas antes de enviarlas a sistemas mas costosos o con requisitos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,0 GB en F16; en torno a 1,0-1,1 GB en Q4_K_M; por debajo de 1 GB en Q2_K (estimaciones basadas en el tamano de los ficheros y el numero de parametros).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 sobran para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- CPU: viable en cuantizaciones Q4 y menores; el modelo es lo bastante pequeno para inferencia en CPU con latencias aceptables para clasificacion.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la documentacion; al ser un modelo de 1.5B, se espera baja latencia por peticion, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Arch-Router-1.5B (esta ficha) | 1.543.714.304 | No disponible | Routing por preferencias | Katanemo Research License | GGUF |
| Qwen2.5-1.5B-Instruct | ~1.500 millones | No disponible en esta ficha | LLM generalista | No disponible en esta ficha | Safetensors, GGUF |
| RouteLLM (frameworks de routing) | Variable | No aplica | Enrutamiento entre modelos | No disponible | No aplica |

La comparacion con alternativas especificas de routing (como los clasificadores de RouteLLM o modelos de enrutamiento de otros proveedores) no esta disponible con datos verificables en la informacion proporcionada. Frente a Qwen2.5-1.5B-Instruct, la diferencia clave es el fine-tuning para routing, no el tamano ni el contexto.

## Limitaciones y advertencias

- Es un modelo de enrutamiento, no un LLM generalista: no esta pensado para generar respuestas finales de calidad.
- Riesgo de alucinacion y de clasificacion erronea: puede asignar dominios o acciones incorrectos, lo que desvia la consulta al modelo equivocado.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de Qwen2.5-1.5B-Instruct puede heredar los de su base.
- Cobertura de idiomas no documentada; el rendimiento fuera del ingles no esta garantizado.
- Longitud de contexto no disponible; consultas muy largas pueden truncarse o degradar la clasificacion.
- Licencia Katanemo Research License: es necesario revisar sus terminos antes de uso comercial, ya que no es una licencia permisiva estandar.
- La cuantizacion puede introducir perdida de precision en la clasificacion respecto al modelo original en safetensors; conviene evaluar la variante elegida antes de produccion.
- El autor de la cuantizacion advierte explicitamente: "Routing model. Evaluate before use."

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Arch-Router-1.5B-GGUF
- Modelo base: https://huggingface.co/katanemo/Arch-Router-1.5B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
