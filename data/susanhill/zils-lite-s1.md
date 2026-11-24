# SusanHill/zils-lite-s1

## Resumen

zils-lite-s1 es un modelo de lenguaje de 853 millones de parametros (852.985.920 exactos segun los pesos en safetensors) desarrollado por el usuario SusanHill y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura de la familia Qwen 3.5 en su variante mas pequena, orientada a entornos con recursos limitados.

La model card describe el proceso de construccion con una terminologia propia del autor: un "soup body" (mezcla de pesos) denominado d3-lite, obtenido mediante destilacion de un estudiante LoRA de rango 64 a partir de las probabilidades de un profesor llamado vllm-sr/d3-flash, sobre un pool publico de decisiones de entrenamiento. Posteriormente, los pesos resultantes se promedian al 50/50 con el "chassis" del pool, una tecnica de model averaging habitual para estabilizar el rendimiento de fine-tunings pequenos.

El modelo esta etiquetado con las tags `zils` y `decision`, lo que sugiere un enfoque hacia tareas de clasificacion o toma de decisiones mas que hacia generacion abierta. La relevancia practica es limitada por ahora: no tiene descargas ni likes, no declara idiomas soportados y la documentacion publica es muy escasa, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5. Sobre esa base se aplica un proceso de destilacion: un estudiante con adaptadores LoRA de rango 64 se entrena para imitar las probabilidades de salida de un profesor identificado como vllm-sr/d3-flash, usando un "public train-split decision pool", es decir, un conjunto de datos publico orientado a tareas de decision. Tras la destilacion, los pesos del estudiante se promedian al 0,5/0,5 con el "chassis" del pool, una variante de model soup que combina los pesos del adaptador fusionado con los del modelo de partida para reducir el olvido catastrofico y suavizar el ajuste.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El repo incluye codigo personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` en `transformers` y auditar dicho codigo antes de ejecutarlo. El tamano del repositorio es de 1,7 GB, coherente con pesos en precision de 16 bits para 853 millones de parametros.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen3.5-0.8B.
- Orientacion declarada a tareas de decision (tag `decision`), presumiblemente clasificacion o seleccion entre opciones.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo (0,8B).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el reducido tamano del modelo limita su fiabilidad en cadenas largas.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Clasificacion y enrutamiento de consultas: el modelo puede usarse como clasificador ligero en un pipeline de atencion al cliente para decidir a que cola o especialista derivar cada mensaje, aprovechando su tag `decision` y su bajo coste de inferencia.
- Filtrado previo en sistemas RAG: actuar como modelo de primera etapa que decide si una pregunta requiere recuperacion de documentos o puede responderse directamente, reduciendo llamadas a modelos mayores.
- Etiquetado semiautomatico de datos: generar etiquetas de decision sobre grandes volumenes de texto en local, dado que 853 millones de parametros caben en una GPU de consumo y el coste por token es minimo.
- Prototipado rapido en entornos con recursos limitados: validar flujos de decision o generacion en portatiles con GPU de 8-12 GB antes de escalar a modelos mayores.
- Moderacion y triaje de contenido: clasificar mensajes en categorias predefinidas (spam, soporte, queja) en aplicaciones de mensajeria, con latencia baja gracias al reducido tamano.
- Experimentacion academica en destilacion: servir como caso de estudio reproducible de destilacion LoRA con model soup sobre un modelo base publico, comparando el estudiante con el profesor vllm-sr/d3-flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, unos 0,5 GB (requiere conversion manual, no hay GGUF oficial publicado).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100 o H100 no son necesarias y estarian infrautilizadas.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1660 Super de 6 GB en cuantizacion de 8 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via directa; vLLM y TGI son compatibles en principio con arquitecturas Qwen, pero el codigo personalizado puede requerir adaptaciones. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-s1 | 853 M | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 | Hugging Face, ampliamente usado |
| Qwen3-0.6B | 0,6 B | 32 K (segun familia Qwen3) | Apache-2.0 | Hugging Face, muy extendido |
| Llama 3.2 1B | 1,2 B | 128 K | Llama 3.2 Community License | Hugging Face, ampliamente usado |

La comparacion con el modelo base es la mas directa: zils-lite-s1 anade un ajuste especifico para tareas de decision a costa de perder la documentacion y el soporte de la comunidad del Qwen3.5-0.8B original. Frente a Qwen3-0.6B o Llama 3.2 1B, su principal desventaja es la ausencia de benchmarks publicados y de comunidad; su ventaja potencial, un comportamiento especializado en clasificacion si el pool de decisiones usado en el entrenamiento se alinea con la tarea objetivo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-0.8B hereda los sesgos del corpus de entrenamiento del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: alto en generacion abierta por el reducido tamano (0,8B) y por un ajuste orientado a decision que puede degradar la fluidez general.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados; no asumir capacidades multilingues sin evaluacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificar las condiciones del modelo base Qwen3.5-0.8B, tambien Apache-2.0.
- Codigo personalizado: el flag `custom_code` obliga a revisar el codigo del repositorio antes de cargarlo con `trust_remote_code=True`, por riesgo de ejecucion de codigo no auditado.
- Sin validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evaluaciones independientes que confirmen el rendimiento declarado.
- Documentacion minima: la model card no detalla datos de entrenamiento, hiperparametros ni criterios de evaluacion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-lite-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor de destilacion (referenciado en la model card): vllm-sr/d3-flash (sin enlace directo disponible)
