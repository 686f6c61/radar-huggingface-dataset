# vanshnarula/gigpo-qwen2.5-1.5b-alfworld-threshold-seed0

## Resumen

GiGPO threshold es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct llevado a cabo por el usuario vanshnarula, orientado especificamente a la resolucion de tareas de agente en el entorno ALFWorld. Se trata de un checkpoint del paso 150 de entrenamiento (semilla 0) que emplea la tecnica GiGPO (Group-in-Group Policy Optimization) con un tamano minimo de grupo de 2 y un umbral de desviacion estandar de retorno de 0,075. El autor reporta una tasa de exito final del 89,8 % en validacion sobre el split "seen" de ALFWorld usado durante el entrenamiento.

El modelo parte de la arquitectura Qwen2 de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) en modo instruct, por lo que hereda las capacidades conversacionales y de generacion de texto del modelo original, pero las orienta a la toma de decisiones secuencial y al razonamiento multi-paso dentro de entornos textuales. El repositorio pesa 3,1 GB y se distribuye en formato BF16 safetensors bajo licencia Apache 2.0.

Su relevancia radica en que ejemplifica el uso de tecnicas de RL (policy optimization por grupos) para convertir un modelo de chat pequeno en un agente capaz de resolver tareas de manipulacion de objetos en un mundo textual. No obstante, al ser un checkpoint de investigacion con cero descargas y sin model card extendida, debe tratarse como material experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos exportados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, inicializado desde Qwen/Qwen2.5-1.5B-Instruct (revision 989aa7980e4cf806f80c7fef2b1adb7bc71aa306) y ajustado mediante GiGPO, una variante de policy optimization basada en grupos. El entrenamiento se realiza sobre ALFWorld, un entorno textual de tareas de agente (navegacion, recogida y colocacion de objetos) en el que el modelo debe emitir acciones paso a paso. Los hiperparametros documentados son un tamano minimo de grupo de 2 y un cutoff de desviacion estandar del retorno de 0,075, que controlan que grupos de trayectorias se usan para estimar la ventaja en la actualizacion de politica.

El checkpoint publicado corresponde al paso 150 de la semilla 0 y se exporta en BF16 safetensors. El autor no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO. La innovacion principal es el uso de GiGPO con umbral para filtrar grupos de baja varianza, lo que en la practica estabiliza la senal de recompensa en tareas de agente con recompensas dispersas. La validacion reportada (89,8 %) se mide sobre el split "seen" de ALFWorld, es decir, sobre tareas vistas durante el entrenamiento, lo que limita la interpretacion del resultado como capacidad de generalizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento secuencial y planificacion de acciones en entornos textuales de agente (formato ALFWorld).
- Emision de acciones estructuradas paso a paso (comandos de navegacion y manipulacion de objetos) dentro del bucle de interaccion del entorno.
- Seguimiento de instrucciones en formato instruct.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes multi-paso: si, especificamente entrenado para ello en ALFWorld.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en RL para agentes: servir como punto de partida reproducible (semilla 0, paso 150) para comparar variantes de GiGPO y estudiar el efecto del umbral de desviacion estandar en la estabilidad del entrenamiento.
- Evaluacion de agentes en ALFWorld: ejecutar el modelo como politica base en el split "seen" para reproducir el 89,8 % reportado y como referencia frente a otros checkpoints.
- Baseline ligero para tareas de manipulacion textual: usar el modelo en entornos simulados de tipo TextWorld o ALFWorld para prototipar bucles de accion-observacion sin requerir GPUs de gran capacidad.
- Destilacion y comparacion de tecnicas de RL: emplear este checkpoint como estudiante pequeno frente a politicas mayores para medir la brecha de rendimiento en tareas de agente.
- Desarrollo de entornos de evaluacion: integrar el modelo en harness de evaluacion de agentes (por ejemplo, el repositorio secureswim/gigpo) para validar pipelines de entrenamiento y metricas de exito.
- Prototipado de asistentes con planificacion de acciones: en escenarios controlados donde el modelo deba descomponer una instruccion en pasos y ejecutarlos secuencialmente, aprovechando su ajuste especifico a razonamiento multi-paso.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors BF16, puede reutilizarse como inicializacion para otros dominios de agente con recursos modestos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld (split seen, validacion) | 89,8 % de exito | Reportado por el autor en la model card, paso 150, semilla 0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. No se dispone de comparaciones numericas con otros checkpoints o modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB (no se distribuyen pesos cuantizados oficialmente, habria que generarlos).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en datacenter, A100, H100 o L40S para despliegues por lotes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en BF16, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp u Ollama previa conversion a GGUF (no se proporcionan artefactos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (1,5 B) se espera un throughput alto en una sola GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gigpo-qwen2.5-1.5b-alfworld-threshold-seed0 | 1,54 B | no disponible | Agente ALFWorld via GiGPO | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | no disponible en esta ficha | Chat/instruct general | Apache 2.0 | Hugging Face (ampliamente usado) |
| Otros checkpoints GiGPO sobre Qwen2.5-1.5B | 1,54 B | no disponible | Agente ALFWorld (otras semillas/umbrales) | Apache 2.0 | Repositorio secureswim/gigpo (referenciado) |

No se dispone de datos de rendimiento de los modelos comparables en ALFWorld dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- El 89,8 % de exito se mide sobre el split "seen" de ALFWorld, por lo que no refleja generalizacion a tareas no vistas; el rendimiento en el split "unseen" es desconocido.
- Modelo de investigacion con cero descargas y sin model card extendida: no hay documentacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion y de acciones invalidas fuera del formato ALFWorld; el ajuste esta muy especializado en ese entorno y puede degradar el comportamiento conversacional general.
- Idiomas soportados no documentados; se asume herencia del modelo base, pero no esta confirmado.
- Contexto maximo no confirmado en la informacion proporcionada; conviene verificar la configuracion de Qwen2.5-1.5B-Instruct antes de usarlo con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones; revisar la licencia de ALFWorld y del repositorio GiGPO.
- No se distribuyen pesos cuantizados ni artefactos GGUF; cualquier despliegue en CPU o GPU de baja VRAM requiere conversion y validacion propias.
- Checkpoint unico (paso 150, semilla 0): no hay garantia de que sea el mejor punto de entrenamiento ni de reproducibilidad completa sin el codigo y los datos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnarula/gigpo-qwen2.5-1.5b-alfworld-threshold-seed0
- Repositorio del experimento GiGPO: https://github.com/secureswim/gigpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
