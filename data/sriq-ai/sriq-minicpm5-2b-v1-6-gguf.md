# sriq-ai/SRIQ-MiniCPM5-2B-v1.6-GGUF

## Resumen

SRIQ-MiniCPM5-2B-v1.6-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de aproximadamente 2.500 millones de parametros (2.516.756.480 exactamente, segun los pesos en safetensors), publicada por el usuario sriq-ai en HuggingFace. El repositorio no incluye model card detallada: solo indica que el modelo fue afinado y convertido a GGUF con Unsloth y ofrece comandos de ejemplo para `llama-cli` (uso solo texto) y `llama-mtmd-cli` (uso multimodal), lo que sugiere que la familia base podria tener variantes con vision, aunque no se confirma en la informacion disponible.

El modelo resuelve el caso de uso clasico de los GGUF de tamano pequeno: ejecucion local en CPU o en GPUs de consumo sin necesidad de infraestructura dedicada, con cuatro niveles de cuantizacion publicados (Q8_0, Q6_K, Q5_K_M y Q4_K_M). El repo ocupa 8,1 GB en total, lo que incluye los cuatro ficheros de pesos.

Su relevancia practica es limitada por el momento: registra 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no aporta resultados de benchmarks. La fecha de creacion indicada (2026-09-26) es posterior a la fecha habitual de publicacion, un dato que conviene verificar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican compatibilidad con llama.cpp; no se especifica si es transformer denso u otra) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 8,1 GB con los cuatro ficheros) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente indica que el modelo fue afinado y convertido a formato GGUF con Unsloth, y que el comportamiento del token BOS fue ajustado para garantizar la compatibilidad con GGUF. El tag "llama" en HuggingFace y la instruccion de uso con `llama-cli` confirman compatibilidad con el ecosistema llama.cpp, pero no implican que la arquitectura subyacente sea Llama de Meta.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni las tecnicas de optimizacion aplicadas. El sufijo "v1.6" en el nombre indica que existe al menos una iteracion previa del modelo, pero no hay changelog ni comparativa entre versiones. Unsloth se cita como herramienta de afinado y conversion, lo que sugiere un pipeline de fine-tuning eficiente en memoria, pero no aporta detalle sobre los hiperparametros empleados.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y el soporte del flag `--jinja` (plantilla de chat) indican que el modelo esta preparado para dialogos multi-turno con formato de chat.
- Compatibilidad con llama.cpp: se puede ejecutar mediante `llama-cli -hf sriq-ai/SRIQ-MiniCPM5-2B-v1.6-GGUF --jinja`, sin necesidad de frameworks adicionales.
- Posible soporte multimodal: la model card incluye un ejemplo con `llama-mtmd-cli` para "modelos multimodales", lo que apunta a una variante con entrada de imagen, pero no se confirma que estos pesos concretos incluyan proyector visual.
- Inferencia en CPU y GPU: al estar en GGUF, admite offloading parcial de capas y ejecucion mixta CPU/GPU.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con solo 2,5 B de parametros y cuantizacion Q4_K_M, el modelo cabe en portatiles sin GPU dedicada, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Procesamiento por lotes de texto en servidor de baja gama: tareas de resumen, clasificacion o reformulacion de documentos donde el throughput importa mas que la calidad punta, ejecutadas con llama.cpp en CPU multinucleo.
- Asistentes de escritorio con privacidad estricta: al ejecutarse en local, los datos no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad (sanidad, legal, sector publico) donde no se permite enviar texto a servicios externos.
- Generacion de respuestas en sistemas RAG ligeros: el modelo puede actuar como generador final sobre fragmentos recuperados por un motor vectorial, siempre que la longitud de contexto (no documentada) sea suficiente; requiere verificacion previa.
- Base para fine-tuning con Unsloth: dado que el autor uso esta herramienta, el modelo puede servir como punto de partida para adaptaciones con LoRA en dominios concretos, aprovechando su bajo coste de entrenamiento.
- Evaluacion comparativa de cuantizaciones: los cuatro ficheros publicados (Q8_0 a Q4_K_M) permiten medir la perdida de calidad frente al ahorro de memoria en un mismo modelo, un experimento util para calibrar despliegues.
- Chat de borde en dispositivos con recursos limitados: integrable en aplicaciones moviles o embebidas que consumen GGUF mediante bindings de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor):
  - Q4_K_M: en torno a 1,5-2,0 GB.
  - Q5_K_M: en torno a 1,8-2,3 GB.
  - Q6_K: en torno a 2,2-2,7 GB.
  - Q8_0: en torno a 2,8-3,3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100) funcionan sin problema, aunque para este tamano estan sobredimensionadas.
- Viabilidad en GPU de consumo: si, practicamente todas las GPUs dedicadas de los ultimos ocho anos pueden ejecutarlo, incluso las cuantizaciones de 8 bits. Tambien es viable en CPU pura.
- Opciones de despliegue: llama.cpp (referencia del autor), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere uso mediante endpoints tipo OpenAI, aunque no se detalla la implementacion. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan convertir los pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparacion es necesariamente incompleta: del modelo evaluado no se conocen contexto, licencia, idiomas ni resultados, mientras que de las alternativas si hay datos publicos. Se incluye como referencia orientativa de categoria (modelos densos de 2-4 B orientados a uso local).

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| SRIQ-MiniCPM5-2B-v1.6 | ~2,5 B | no disponible | no disponible | Si (Q4_K_M a Q8_0) |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | Si, ampliamente disponible |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Si, ampliamente disponible |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Si, ampliamente disponible |

Las cifras de las alternativas provienen de sus respectivas fichas oficiales. Para el modelo evaluado no hay datos equivalentes publicados, por lo que no es posible establecer una comparacion de rendimiento real.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Es un bloqueante para cualquier despliegue en produccion hasta que el autor lo aclare.
- Idiomas no declarados: se desconoce si el modelo tiene un rendimiento aceptable en castellano o si esta entrenado predominantemente en ingles o chino.
- Longitud de contexto desconocida: imposibilita planificar casos de uso con documentos largos o conversaciones extensas.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, lo que impide compararlo con alternativas consolidadas.
- Riesgo de alucinacion: con 2,5 B de parametros, la tasa de hechos inventados suele ser elevada, especialmente en tareas de conocimiento factual o razonamiento aritmetico complejo. Requiere verificacion externa en cualquier uso critico.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento ni las fases de alineacion, no se puede evaluar el sesgo de genero, raza, religion o ideologia.
- Historial de uso nulo: 0 descargas y 0 likes implican que no hay retroalimentacion de la comunidad ni casos verificados de funcionamiento en produccion.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-26, dato que conviene contrastar por si la metadata es incorrecta o el repositorio ha sido reemplazado.
- Soporte multimodal ambiguo: la model card menciona `llama-mtmd-cli`, pero no esta claro si los ficheros GGUF publicados incluyen el proyector visual. Si se necesita vision, hay que verificarlo antes de disenar la integracion.
- Degradacion por cuantizacion: las variantes Q4_K_M y Q5_K_M reducen la precision de los pesos; en modelos pequenos el impacto en tareas de razonamiento puede ser apreciable.
- Cambio en el token BOS: el autor modifico este comportamiento para compatibilidad con GGUF. Si se reutilizan plantillas o prompts preparados para el modelo original, pueden producirse respuestas degeneradas.
- Procedencia opaca: no se identifica con claridad el modelo base de la familia MiniCPM ni la relacion con sus autores originales, lo que dificulta trazar la cadena de licencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sriq-ai/SRIQ-MiniCPM5-2B-v1.6-GGUF
- Unsloth (herramienta de afinado y conversion citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime de referencia para los GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs tecnicos ni demos adicionales del autor.
