# Wasteland0103/qwen2.5-3b-prompt-optimizer-v3-lora

## Resumen

Qwen2.5-3B Prompt Optimizer v3 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen2.5-3B-Instruct, desarrollado por el autor Wasteland0103 en el marco del proyecto HUFS APPLES ("Learning to Ask Better: SLM-Based Prompt Optimization"). Su funcion no es responder al usuario, sino reescribir una peticion breve en coreano y convertirla en un prompt mas especifico y estructurado, con secciones de tipo de tarea, contexto y supuestos, pasos de ejecucion y formato de salida. El modelo esta pensado para insertarse como etapa previa a un modelo de respuesta mas grande, de modo que este reciba una instruccion mejor formulada.

El adaptador tiene un tamano de repositorio de 0,1 GB, lo que corresponde a los pesos LoRA en formato safetensors (no incluye los pesos completos del modelo base). Se distribuye mediante la libreria PEFT y requiere cargar Qwen2.5-3B-Instruct como modelo base. La longitud de contexto efectiva queda determinada por el modelo base y por la configuracion de entrenamiento, que fijo una secuencia maxima de 2048 tokens.

Es relevante ahora porque aborda un problema practico y poco cubierto: la optimizacion automatica de prompts en coreano mediante un modelo pequeno (SLM) en lugar de depender de un LLM grande propietario. El modelo solo admite coreano, tiene licencia Qwen Research (uso comercial restringido) y, en la fecha de publicacion de la informacion disponible, no presenta resultados de evaluacion publicados ni descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA de 4 bits) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el entrenamiento uso secuencia maxima de 2048 tokens sobre un base con contexto mayor |
| Tipos de cuantizacion | QLoRA 4 bits durante el entrenamiento; el adaptador se distribuye en safetensors y se puede combinar con el base en bfloat16 u otras cuantizaciones del base |
| Idiomas soportados | coreano (ko) |
| Licencia | qwen-research (Qwen Research License); uso comercial restringido |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entreno con QLoRA en 4 bits usando Unsloth sobre Qwen2.5-3B-Instruct. La configuracion LoRA es r = 16, alpha = 32 y dropout = 0. Se realizaron 3 epocas con tasa de aprendizaje 2e-4 y schedule coseno, tamano de batch efectivo 16 (batch 2 con acumulacion de gradiente 8), longitud maxima de secuencia 2048 y semilla 42. El modelo base es un transformer decoder-only de la familia Qwen2.5 en su variante Instruct de 3B parametros.

El conjunto de entrenamiento consta de 757 pares de peticion en coreano y prompt optimizado, distribuidos en 354 ejemplos estructurados sin seccion de formato de salida, 300 estructurados con dicha seccion y 103 dejados sin cambios (categoria "기타"). El proceso de construccion fue por destilacion con verificacion: gpt-4o-mini (gpt-4o-mini-2024-07-18) genero prompts de referencia en el formato objetivo; para cada peticion se produjeron dos candidatos (con y sin seccion de formato de salida); Qwen2.5-7B respondio a la peticion original y a ambos candidatos; un reward model (Skywork-Reward) puntuo cada respuesta contra la pregunta original; y solo se conservo el mejor candidato si superaba la puntuacion de la respuesta a la peticion original, descartandose 361 elementos. No se usaron datos de benchmarks de evaluacion (KoMT-Bench, IFEval-Ko, ko-arena-hard-auto) durante el entrenamiento.

La innovacion principal es el uso de un modelo pequeno especializado como preprocesador de prompts, con una salvaguarda explicita: para peticiones donde la estructura no aporta (matematicas, codigo, extraccion y similares), el modelo emite solo `[과제 유형] 기타` y la peticion original sin modificar.

## Capacidades

- Reescritura y estructuración de peticiones breves en coreano en un prompt mas especifico.
- Salida con formato fijo: `[과제 유형]`, `[과제]`, `[맥락 및 가정]`, `[수행 단계]` y `[원래 요청]`.
- Clasificacion del tipo de tarea entre comparacion, recomendacion, explicacion, resumen, planificacion y "otros".
- Preservacion literal de la peticion original en la seccion `[원래 요청]`, de modo que el modelo de respuesta ve la consulta real del usuario.
- Deteccion de casos donde la estructura no ayuda (matematicas, codigo, extraccion) y salida sin modificacion.
- Generacion opcional de una seccion de formato de salida (`[출력 형식]`) cuando aporta valor.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- Capacidad multilingue limitada al coreano; no se documenta soporte de otros idiomas.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Preprocesamiento de consultas en un pipeline RAG: el adaptador reescribe la consulta del usuario en un prompt estructurado antes de pasarla al modelo generador, mejorando la especificidad de la recuperacion y de la respuesta.
- Asistentes conversacionales en coreano: se inserta como etapa de normalizacion de la peticion del usuario en cada turno, de modo que el modelo de respuesta recibe una instruccion con tareas y pasos explicitos.
- Herramienta interna de mejora de prompts para equipos de producto: los desarrolladores escriben una peticion breve y el adaptador devuelve una version estructurada que pueden revisar y reutilizar.
- Educacion y formacion en ingenieria de prompts: sirve para mostrar de forma automatica como se transforma una peticion vaga en una instruccion con contexto, supuestos y pasos.
- Estandarizacion de peticiones en sistemas de atencion al cliente: convierte mensajes cortos de usuarios en solicitudes con tipo de tarea y contexto, facilitando el enrutamiento posterior.
- Generacion de plantillas de evaluacion: a partir de una peticion de ejemplo, produce prompts estructurados que se pueden usar como casos de prueba en la evaluacion de otros modelos.
- Filtrado previo en pipelines de moderacion o clasificacion: la etiqueta `[과제 유형]` permite enrutar la peticion a un modelo o flujo especializado segun el tipo de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados se anadiran una vez finalizada la evaluacion.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el consumo real depende del modelo base Qwen2.5-3B-Instruct.
- Inferencia del base en bfloat16: aproximadamente 6-7 GB de VRAM para los pesos, mas memoria para KV cache y activaciones.
- Cabe en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070) usando el base en bfloat16 o cuantizado.
- En cuantizacion de 4 bits, el base se reduce a unos 2-3 GB, por lo que puede ejecutarse en GPUs con 4-6 GB de VRAM.
- GPU recomendadas para mayor throughput: A100, H100, L40S o RTX 4090.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), vLLM o TGI tras fusionar el adaptador con el base, y llama.cpp u Ollama mediante conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B Prompt Optimizer v3 (este) | 3B base + LoRA | no disponible (entrenado a 2048) | Optimizacion de prompts en coreano | qwen-research | HuggingFace (0 descargas) |
| Qwen2.5-3B-Instruct | 3B | 32K (segun el modelo base) | Instrucciones generales | qwen-research | HuggingFace |
| Qwen2.5-7B-Instruct | 7B | 32K (segun el modelo base) | Instrucciones generales | qwen-research | HuggingFace |

No se dispone de datos de rendimiento comparativo del adaptador frente a estas alternativas. La comparacion se limita a tamano, contexto y licencia.

## Limitaciones y advertencias

- La seccion `[맥락 및 가정]` puede contener errores factuales o malinterpretar la peticion, y en ocasiones se cuelan caracteres chinos.
- El modelo se entreno y evaluo solo en coreano; no se garantiza su comportamiento en otros idiomas.
- El system prompt debe coincidir con el usado en entrenamiento; cambiarlo degrada la calidad de la salida.
- Licencia Qwen Research: el uso comercial esta restringido.
- Los datos de entrenamiento incluyen salidas de modelos de OpenAI, por lo que se aplican tambien los terminos de uso de OpenAI; por ejemplo, el modelo no puede usarse para desarrollar modelos que compitan con OpenAI.
- No se han publicado resultados de evaluacion, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Riesgo de alucinacion en la seccion de contexto y supuestos, ya que el modelo puede inventar detalles no presentes en la peticion original.
- El repositorio tiene 0 descargas y 0 likes en la fecha de la informacion, sin senales de validacion por parte de la comunidad.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines agenticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wasteland0103/qwen2.5-3b-prompt-optimizer-v3-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
