# xw17/Qwen2.5-0.5B-Instruct_SFT_lora_dreamt

## Resumen

xw17/Qwen2.5-0.5B-Instruct_SFT_lora_dreamt es un ajuste fino por instrucciones (SFT) con LoRA sobre el modelo base Qwen2.5-0.5B-Instruct, publicado en Hugging Face por el usuario xw17. El nombre del repositorio indica la tecnica de entrenamiento (SFT sobre adaptadores LoRA) y un sufijo de dominio ("dreamt"), que sugiere un conjunto de datos especifico, aunque la model card no lo confirma. Forma parte de una familia de repositorios del mismo autor con sufijos similares (por ejemplo, Qwen2.5-1.5B-Instruct_SFT_lora_ptt y Qwen2.5-1.5B-Instruct_SFT_lora_wesad), lo que apunta a una serie de experimentos de especializacion sobre la familia Qwen2.5.

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only de aproximadamente 498 millones de parametros, disenado por el equipo Qwen de Alibaba para escenarios de computo muy limitado (edge, movil, CPU). Su rasgo diferencial dentro de la familia es la ventana de contexto de 32.768 tokens y el soporte multilingue, poco habitual en modelos de este tamano.

La relevancia de esta publicacion es limitada y hay que enmarcarla con cautela: la model card es la plantilla generada automaticamente por Hugging Face sin ningun campo rellenado, el tamano declarado del repositorio es de 0,0 GB, no hay licencia explicita, no hay idiomas declarados y no consta ningun resultado de evaluacion. A efectos practicos, debe tratarse como un artefacto experimental no documentado, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2); el repositorio contiene un ajuste SFT con LoRA sobre el base |
| Parametros totales | Aproximadamente 498 millones (~0,49B) en el modelo base Qwen2.5-0.5B-Instruct; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; no confirmado para este ajuste en la informacion disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la ficha; el base Qwen2.5-0.5B-Instruct declara soporte de mas de 29 idiomas |
| Licencia | No disponible; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (segun los tags del repositorio); el tamano declarado del repo es 0,0 GB, por lo que el contenido puede ser unicamente el adaptador LoRA o estar incompleto |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Qwen2 empleado en Qwen2.5: atencion con RoPE (rotary position embeddings), Grouped Query Attention (GQA), normalizacion RMSNorm pre-norm, activacion SwiGLU en el bloque MLP y sesgo (bias) en las proyecciones Q, K y V. En la variante de 0,5B esto se traduce en 24 capas, un tamano oculto de 896, 14 cabezas de consulta y 2 cabezas de clave/valor, con un vocabulario de aproximadamente 151.936 tokens. El modelo base fue entrenado por Alibaba con un corpus de hasta 18 billones de tokens segun su documentacion publica, seguido de un proceso de alineacion para instrucciones.

Sobre ese base, este repositorio aplica un ajuste supervisado (SFT) mediante LoRA, segun se deduce del propio identificador. No se dispone de informacion sobre el dataset empleado, el numero de ejemplos, la composicion del corpus, los hiperparametros (rango y alpha de LoRA, tasa de aprendizaje, precision de entrenamiento) ni si hubo fases posteriores de DPO, RLHF u otra alineacion. El sufijo "dreamt" no viene acompanado de ninguna explicacion en la model card, por lo que cualquier hipotesis sobre el dominio de especializacion seria especulativa. Tampoco se documenta ninguna innovacion tecnica adicional en decodificacion, atencion o eficiencia.

## Capacidades

No hay ninguna capacidad documentada especificamente para este ajuste. Las capacidades heredables del modelo base Qwen2.5-0.5B-Instruct son las siguientes, y deben considerarse como potenciales y no verificadas en esta version:

- Generacion de texto e instrucciones basicas, con calidad propia de un modelo de 0,5B.
- Razonamiento aritmetico y matematico sencillo, limitado por el tamano.
- Generacion de codigo en lenguajes comunes, con correccion baja en tareas complejas.
- Salida estructurada en JSON, util para extraccion de campos y clasificacion.
- Soporte de tool calling / function calling segun el formato de chat de Qwen2.5.
- Capacidades multilingues amplias en el base (mas de 29 idiomas, incluido el castellano).
- Ventana de contexto de 32.768 tokens en el base.
- Capacidad de seguir system prompts, util para fijar rol o formato.
- No se ha documentado para este ajuste ningun modo de pensamiento (thinking), vision, audio ni decodificacion especulativa.

## Casos de uso

Dado que no hay evaluacion publicada, los casos siguientes deben considerarse escenarios plausibles de un modelo de 0,5B ajustado con LoRA, sujetos a validacion previa:

- Prototipado rapido en local: al ocupar menos de 1 GB en fp16, permite iterar en un portatil sin GPU dedicada y probar rapidamente si un enfoque de LLM resuelve un problema antes de invertir en un modelo mayor.
- Clasificacion y etiquetado de texto: tareas de categorizacion cerrada, analisis de sentimiento o enrutado de tickets en las que el modelo solo debe devolver una etiqueta de un conjunto predefinido, un escenario donde un modelo de 0,5B es suficiente.
- Extraccion de campos estructurados: conversion de texto libre a JSON con campos fijos, aprovechando el soporte del formato de chat de Qwen2.5 y validando siempre la salida con un esquema.
- Inferencia en dispositivos de borde: despliegue en Raspberry Pi, moviles o placas tipo M5Stack (el propio base esta documentado para M5Stack), con pesos cuantizados a 4 bits y consumo de memoria inferior a 500 MB.
- Generacion asistida en herramientas internas: autocompletado de campos, redaccion de borradores cortos o reformulacion de texto en aplicaciones de escritorio donde no se quiere depender de una API externa.
- Filtrado previo en pipelines RAG: uso como modelo de primera etapa para descartar documentos irrelevantes antes de invocar un modelo mayor, reduciendo coste por token y latencia.
- Investigacion sobre ajuste fino eficiente: reproduccion de experimentos de SFT con LoRA sobre modelos pequenos, comparando variantes de dataset e hiperparametros (el autor mantiene varios repositorios hermanos con esta estructura, lo que encaja con este uso).
- Evaluacion de dominio especifico: si el sufijo "dreamt" corresponde efectivamente al dataset DREAMT u otro corpus concreto, el modelo solo seria adecuado para ese dominio tras verificar sus resultados; la model card no lo confirma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion rellenada, el repositorio declara 0 descargas y 0 likes, y no se ha encontrado ninguna publicacion o informe externo con metricas de este ajuste. El modelo base Qwen2.5-0.5B-Instruct si cuenta con resultados publicados por su desarrollador, pero no se reproducen aqui al no disponer de cifras verificadas en la informacion proporcionada. Cualquier comparacion numerica con este ajuste seria, por tanto, inventada.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 1,0-1,2 GB para los pesos del base (498M parametros x 2 bytes), mas el cache KV.
- VRAM en int8: aproximadamente 0,5-0,7 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 0,3-0,4 GB.
- Cache KV: con 24 capas, 2 cabezas KV y dimension de cabeza 64, el coste es de unos 12 KB por token en fp16, es decir, alrededor de 384 MB para los 32.768 tokens completos de contexto.
- GPU recomendadas: cualquier GPU consumer sirve; no requiere A100 ni H100. Funciona sobradamente en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- CPU: es viable en inferencia por CPU en exclusiva; en un procesador moderno de escritorio se pueden esperar decenas de tokens por segundo con cuantizacion a 4 bits, aunque no hay mediciones publicadas para este ajuste.
- Cabe sin problema en GPU consumer: si, en practicamente todas las de los ultimos ocho anos.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), llama.cpp, Ollama, vLLM, TGI y endpoints compatibles (el tag endpoints_compatible esta presente). Si el repositorio contiene solo el adaptador LoRA y no los pesos fusionados, habria que cargar el base Qwen2.5-0.5B-Instruct por separado y aplicar el adaptador.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| xw17/Qwen2.5-0.5B-Instruct_SFT_lora_dreamt | ~0,49B (adaptador LoRA) | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas | No disponible |
| Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Si, publicado por el desarrollador |
| SmolLM2-360M-Instruct | ~0,36B | 8.192 tokens | Apache 2.0 | Hugging Face | Si, publicado por el desarrollador |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Hugging Face | Si, publicado por el desarrollador |

Frente a estos alternativas, la ventaja del modelo aqui descrito seria unicamente el ajuste de dominio, si este existiera y estuviera validado. En todos los demas criterios (documentacion, licencia clara, evaluacion publica, soporte de la comunidad) queda por detras de los tres modelos de referencia.

## Limitaciones y advertencias

- Model card vacia: es la plantilla autogenerada por Hugging Face sin ningun campo completado; no hay informacion sobre datos, entrenamiento, uso previsto ni limitaciones.
- Licencia no declarada: al no especificarse licencia, no hay garantia de uso comercial. Aunque el base Qwen2.5-0.5B-Instruct es Apache 2.0, el ajuste podria heredar condiciones adicionales del dataset de entrenamiento, que se desconoce.
- Sin evaluacion: no existen benchmarks ni validacion humana publicados, por lo que no se puede afirmar que el ajuste mejore al base en ninguna tarea.
- Riesgo elevado de alucinacion: los modelos de 0,5B generan con frecuencia contenido incorrecto, especialmente en razonamiento multi-paso, matematicas y codigo.
- Degradacion del base: un SFT con LoRA sobre un dataset pequeno y no documentado puede provocar olvido catastrofico y empeorar el comportamiento general, el multilingue o el seguimiento de instrucciones.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos; hereda los del corpus de entrenamiento del base, no publicado en detalle.
- Idioma: la ficha no declara idiomas. Si el dataset de ajuste es mayoritariamente en un solo idioma, el rendimiento en castellano podria degradarse respecto al base.
- Contexto no verificado: los 32.768 tokens corresponden al base, pero no hay confirmacion de que el ajuste conserve esa ventana ni la calidad en contextos largos.
- Estado del repositorio: 0,0 GB declarados y ausencia de descargas y likes sugieren un artefacto experimental, posiblemente incompleto o sin pesos fusionados.
- Uso en produccion: no recomendado sin una evaluacion previa propia sobre el dominio objetivo, verificacion de la licencia y comparacion directa contra el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xw17/Qwen2.5-0.5B-Instruct_SFT_lora_dreamt
- Repositorio hermano del mismo autor (1.5B, sufijo ptt): https://huggingface.co/xw17/Qwen2.5-1.5B-Instruct_SFT_lora_ptt
- Repositorio hermano del mismo autor (1.5B, sufijo wesad): https://huggingface.co/xw17/Qwen2.5-1.5B-Instruct_SFT_lora_wesad
- Documentacion del modelo base en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
- Tutorial de ajuste fino con LoRA de Qwen2.5-0.5B-Instruct (GitHub, proyecto MiniLoRA): https://github.com/SoloCalm/MiniLoRA
- Repositorio de referencia sobre SFT de Qwen2.5 (GitHub): https://github.com/ShawVentus/Qwen2.5_sft
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, Machine Learning Impact calculator): https://arxiv.org/abs/1910.09700
