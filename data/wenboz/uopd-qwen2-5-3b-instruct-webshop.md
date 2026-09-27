# Wenboz/UOPD-Qwen2.5-3B-Instruct-WebShop

## Resumen

UOPD-Qwen2.5-3B-Instruct-WebShop es un checkpoint de ajuste fino publicado por el usuario Wenboz en HuggingFace. Se trata de un estudiante de destilación on-policy (UOPD) inicializado desde Qwen/Qwen2.5-3B-Instruct y entrenado sobre el entorno WebShop, utilizando como profesor congelado el modelo langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop. El resultado es un modelo denso de 3.397.103.616 parámetros (3,4 mil millones) en formato safetensors bfloat16, con un repositorio de 6,8 GB.

El problema que aborda es la transferencia de competencia agéntica desde un modelo de 7B entrenado con refuerzo (la familia GiGPO) hacia un modelo de 3B, sin necesidad de repetir el pipeline completo de RL. Esto resulta relevante para quien necesita desplegar un agente web con un coste de inferencia y de VRAM muy inferior al del profesor, o para investigar métodos de destilación on-policy frente a RL directo.

Se trata de un artefacto de investigación: acumula 0 descargas y 0 me gusta, no declara licencia ni idiomas, y no incluye resultados de benchmarks. Su interés principal es metodológico, no como modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, Qwen2ForCausalLM, heredada de Qwen2.5-3B-Instruct |
| Parametros totales | 3.397.103.616 (recuento de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no documentada en la ficha de este checkpoint; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | no se han publicado cuantizaciones para este checkpoint; los pesos estan en bfloat16 |
| Idiomas soportados | no disponible; el entrenamiento se ha realizado sobre WebShop, cuyo corpus de instrucciones es en ingles |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Modelo profesor | langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop (congelado) |
| Libreria | transformers |
| Pipeline | text-generation |
| Tarea de entrenamiento | WebShop (agente web de compra) |
| Tamano del repositorio | 6,8 GB |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2, sin mezcla de expertos ni componentes de estado (SSM). El ajuste no introduce cambios estructurales; lo que cambia es la distribución de comportamiento aprendida. El entrenamiento es una destilación on-policy: el estudiante genera sus propias trayectorias en el entorno WebShop y un profesor congelado de 7B, ya entrenado con RL sobre el mismo entorno, actúa como referencia.

La configuración publicada es: 150 pasos de entrenamiento, batch de rollout 16 y batch de entrenamiento 64, límite de 15 pasos de entorno por episodio, máximo de 4.096 tokens de prompt y 512 de respuesta, optimizador AdamW con tasa de aprendizaje 1e-6. El parámetro "target intervention rate" decae de forma lineal de 0,30 a 0,05 durante los primeros 75 pasos y se mantiene en 0,05 después. La pérdida sobre turnos disparados es SFT plano con peso 1,0 y el "teacher takeover" está activado. Esto sugiere que en una fracción decreciente de turnos el profesor interviene en la generación y que la señal de aprendizaje se concentra en esos turnos, aunque la ficha no detalla el mecanismo exacto ni la composición de los datos de rollout.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Actuación como agente web en el entorno WebShop: emisión de consultas de búsqueda, navegación por resultados, selección de variantes de producto y ejecución de la compra.
- Razonamiento multi-paso acotado al límite del entorno con el que fue entrenado (15 pasos por episodio).
- Capacidad de seguir el formato de acciones propio del entorno WebShop, no un formato genérico de tool calling.
- No hay evidencia en la información disponible de soporte de function calling genérico, uso de herramientas externas, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no documentadas. El modelo base Qwen2.5 es multilingüe, pero el ajuste se ha realizado en un entorno en inglés y no se reporta evaluación de retención multilingüe.

## Casos de uso

- Investigación en destilación on-policy: sirve como punto de comparación directo frente a un agente de 7B entrenado con RL sobre WebShop (GiGPO), para medir cuánta competencia se conserva al reducir el tamaño del estudiante.
- Evaluación en el benchmark WebShop: el checkpoint está entrenado específicamente para ese entorno, de modo que puede ejecutarse sobre sus episodios de compra para obtener tasas de éxito y puntuaciones de recompensa comparables con el profesor.
- Estudio de transferencia de profesor a estudiante: permite analizar si un profesor de 7B puede transferir comportamiento de navegación y búsqueda a un estudiante de 3B con solo 150 pasos de destilación.
- Despliegue de demos de agentes de compra en hardware limitado: al ocupar aproximadamente 6,8 GB en bfloat16, cabe en GPUs de consumo y permite levantar una demo interactiva sin clúster.
- Inicialización para ajuste posterior: puede usarse como punto de partida para afinar un agente web de 3B sobre otros entornos (por ejemplo, tiendas o catálogos propios) a un coste menor que partir del modelo base.
- Generación de trayectorias sintéticas: las interacciones que produce en WebShop pueden recolectarse como datos para experimentos de destilación en cascada o para análisis de políticas de agente.
- Análisis de eficiencia coste/rendimiento: útil para calcular la relación entre VRAM, latencia y calidad de tarea frente al profesor de 7B en un mismo entorno.
- Reproducción de metodología: con la configuración de entrenamiento publicada, un equipo puede replicar el procedimiento UOPD sobre el mismo par estudiante-profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tasas de éxito en WebShop ni métricas de otros conjuntos, y tampoco se han proporcionado datos de evaluación del modelo profesor que permitan establecer una referencia numérica. La comparativa de rendimiento entre estudiante y profesor queda, por tanto, pendiente de verificación empírica por parte de quien utilice el modelo.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 6,8 GB (coincide con el tamaño del repositorio), más caché KV y activaciones.
- VRAM estimada para inferencia: en torno a 8-10 GB en bfloat16 con contextos moderados (4.096 tokens de prompt); en torno a 4-5 GB en cuantización de 8 bits; en torno a 3-4 GB en cuantización de 4 bits. Son estimaciones derivadas del número de parámetros, no medidas publicadas por el autor.
- GPU recomendadas: A100, H100 o L40S para servir en bfloat16 con concurrencia; RTX 4090, RTX 4080, RTX 4070 Ti, RTX 4060 Ti de 16 GB y RTX 3060 de 12 GB como opciones de consumo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en bfloat16 para contexto corto, y en tarjetas de 6 GB si se cuantiza. No cabe en tarjetas de 4 GB sin cuantización agresiva.
- Opciones de despliegue: transformers (como muestra la model card, con torch_dtype=torch.bfloat16 y device_map="auto"), vLLM, Text Generation Inference (el repositorio declara la etiqueta text-generation-inference) y HF Inference Endpoints (etiqueta endpoints_compatible). Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UOPD-Qwen2.5-3B-Instruct-WebShop | 3,40 B | no documentado en la ficha del checkpoint | Destilacion on-policy (UOPD) sobre WebShop, 150 pasos, profesor de 7B | no disponible | Repositorio HuggingFace, 0 descargas, 0 me gusta |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 tokens segun documentacion del modelo base | Ajuste por instrucciones generalista del fabricante | Qwen Research License (verificar en el repositorio oficial) | Ampliamente disponible, con versiones GGUF y cuantizaciones de la comunidad |
| langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop (profesor) | 7 B aprox. | no disponible | RL con GiGPO sobre WebShop | no disponible | Repositorio HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B aprox. | 131.072 tokens segun documentacion del modelo base | Ajuste por instrucciones generalista del fabricante | Apache 2.0 | Ampliamente disponible |

La comparacion relevante es contra el propio profesor: el estudiante reduce a la mitad el numero de parametros, pero no se han publicado metricas que permitan cuantificar la perdida de rendimiento en WebShop.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se ha realizado exclusivamente sobre WebShop. Fuera de ese entorno (u otros entornos de agente web muy similares) no hay garantia de comportamiento util, y es esperable cierta degradacion de capacidades generales por sobreajuste al dominio.
- Licencia no declarada: el repositorio no incluye licencia, lo que impide determinar las condiciones de uso comercial. Ademas, el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, con restricciones de uso comercial, por lo que conviene verificar la cadena de licencias antes de cualquier despliegue productivo.
- Sin validacion externa: 0 descargas y 0 me gusta en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- Riesgo de alucinacion: en tareas de compra, el modelo puede inventar atributos de producto, disponibilidad o precios. Cualquier uso real deberia validar las acciones contra el estado del entorno.
- Limites de entrenamiento: 512 tokens maximos de respuesta y 15 pasos de entorno por episodio. Tareas que requieran trayectorias mas largas o respuestas extensas quedan fuera del regimen entrenado.
- Idiomas: no documentados. El entrenamiento en WebShop es en ingles; el rendimiento en castellano es desconocido y no deberia asumirse.
- Metodologia poco documentada: la ficha no enlaza paper ni repositorio de UOPD, ni describe la composicion de los rollouts, el volumen de tokens vistos ni los criterios de parada. La replicacion exacta del resultado no esta garantizada.
- Sin informacion sobre sesgos ni seguridad: no hay evaluaciones de sesgo, toxicidad ni alineacion para este checkpoint.
- Tool calling: no hay evidencia de soporte de function calling generico, por lo que integrarlo en pipelines de agentes basados en herramientas estandar requeriria adaptacion.
- Uso recomendado: investigacion y experimentacion. No se recomienda como modelo de produccion sin una evaluacion previa propia sobre el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wenboz/UOPD-Qwen2.5-3B-Instruct-WebShop
- Modelo profesor (GiGPO-Qwen2.5-7B-Instruct-WebShop): https://huggingface.co/langfeng01/GiGPO-Qwen2.5-7B-Instruct-WebShop
- Modelo base (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado en la informacion disponible otros enlaces a papers, repositorios de codigo, blogs o demos del metodo UOPD ni del entorno WebShop.
