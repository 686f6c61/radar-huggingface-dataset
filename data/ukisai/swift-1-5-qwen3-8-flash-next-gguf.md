# ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF

## Resumen

Swift 1.5 Qwen3.8-Flash-Next es un derivado orientado a la eficiencia en razonamiento, desarrollado por UkisAI a partir de Qwen3.8-Flash-Next de Qwen. El objetivo declarado es reducir el sobrepensamiento (overthinking) del modelo base: segun la model card, emplea un 63,4 % menos de tokens de pensamiento, con una aceleracion de 1,8x y una perdida de precision inferior al 1 % frente al base en el ajuste xhigh. El repositorio analizado contiene exclusivamente las cuantizaciones GGUF generadas con llama.cpp a partir del checkpoint Swift 1.5 Qwen3.8-Flash-Next.

El modelo es un transformer con mezcla de expertos (MoE), con 176.943.899.520 parametros totales segun los pesos en safetensors del modelo base. La model card no detalla el numero de parametros activos ni la longitud de contexto. Se distribuye bajo la licencia propietaria swift-open-license-1.0 y el repositorio esta marcado como gated, por lo que requiere aceptar las condiciones de acceso antes de la descarga.

Su relevancia actual radica en el coste de inferencia de los modelos de razonamiento: reducir los tokens de pensamiento sin degradar la precision abarata el despliegue y disminuye la latencia en tareas de codigo y agentes de horizonte largo (uso de terminal, ingenieria de software, agentes personales), que son precisamente los dominios para los que se ha adaptado el post-entrenamiento. El repositorio acumula 2.658 descargas y 13 likes desde su publicacion el 24 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivado de Qwen3.8-Flash-Next (detalle interno no disponible) |
| Parametros totales | 176.943.899.520 (aproximadamente 176,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF generados con llama.cpp (existe una variante con imatrix, tag `imatrix`); los niveles concretos de cuantizacion no estan detallados en la informacion disponible. Repositorio adicional de cuantizaciones GSQ-RCO GGUF |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`), repositorio gated |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un transformer con mezcla de expertos (`moe`) derivado de Qwen3.8-Flash-Next. No se especifican en la model card el numero de capas, la configuracion de expertos, la longitud de contexto nativa ni el volumen de tokens de entrenamiento del modelo base.

El metodo de post-entrenamiento descrito por UkisAI consiste en identificar que tokens estaban asociados a sobrepensamiento patologico y penalizarlos sin atacar directamente la longitud del razonamiento; posteriormente, la precision se recupera mediante RL y OPD. El resultado declarado son trazas de razonamiento mas cortas y, segun las pruebas del autor, menos errores por sobepensamiento. El post-entrenamiento se ha adaptado especificamente a codigo y a trabajo con agentes de horizonte largo (agentes personales, uso de terminal e ingenieria de software). El dataset asociado es `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que segun el autor no se utiliza tal cual, sino re-muestreado y convertido en entornos de RL. No se detallan en la informacion proporcionada el uso de RLHF o DPO, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento con trazas de pensamiento comprimidas: el modelo declara un 63,4 % menos de tokens de pensamiento que el base.
- Capacidades de codigo: la model card menciona post-entrenamiento adaptado a codigo y una demo de generacion de un juego 3D completo ejecutable en local.
- Trabajo agentico de horizonte largo: agentes personales, uso de terminal e ingenieria de software (tags `agentic` y `terminal-bench`).
- Evaluacion orientada a terminal: el modelo reporta resultados sobre Terminal-Bench 2.1 (en ese caso, contando tokens totales generados, no solo tokens de pensamiento).
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, aunque la model card no detalla el alcance de las capacidades de vision.
- Soporte conversacional multi-turno: el dataset de entrenamiento es de tipo multi-turno.
- Tool calling / function calling: no se detalla explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Agentes de terminal automatizados: el modelo esta post-entrenado para uso de terminal (`terminal-bench`) y razonamiento de multiples pasos, por lo que encaja en tareas de ejecucion de comandos, diagnostico de errores y automatizacion de flujos de shell con trazas de razonamiento mas cortas y menor coste por tarea.
- Asistentes de ingenieria de software: generacion y refactorizacion de codigo, redaccion de tests y revision de parches, aprovechando el post-entrenamiento especifico en codigo y la reduccion de tokens de pensamiento que abarata cada iteracion.
- Agentes personales de horizonte largo: planificacion de tareas encadenadas con muchas llamadas al modelo, donde la reduccion del 63,4 % en tokens de pensamiento disminuye directamente el coste acumulado de la sesion.
- Generacion de prototipos de aplicaciones ejecutables: la demo oficial construye un juego 3D endless runner completamente funcional; el modelo es adecuado para pasar de una descripcion en lenguaje natural a un proyecto local ejecutable en menos tiempo que el base (4 min 56 s frente a 8 min 52 s en la prueba del autor).
- Despliegue en local con llama.cpp: al distribuirse en GGUF, permite servir el modelo con `llama-server` en infraestructura propia, sin depender de API externa.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` habilita entradas que combinan imagenes y texto, util para captura de pantalla o documentos digitalizados, aunque el alcance real no esta documentado.
- Batch de razonamiento a gran escala: en pipelines que ejecutan miles de consultas de razonamiento, la reduccion de tokens generados se traduce en menor tiempo de GPU y menor coste por consulta.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparando el checkpoint BF16 de Qwen3.8-Flash-Next con el checkpoint BF16 de Swift 1.5, con columnas de puntuacion y de tokens (tokens de pensamiento, salvo Terminal-Bench 2.1, que cuenta tokens totales generados). Los valores concretos de esa tabla no estan incluidos en la informacion proporcionada, por lo que no se reproducen aqui.

Datos declarados por el autor y recogidos en el texto de la model card:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de pensamiento | 63,4 % menos |
| Aceleracion | 1,8x |
| Perdida de precision frente al base (xhigh) | inferior al 1 % |
| Tiempo de construccion de la demo (base) | 8 min 52 s |
| Tiempo de construccion de la demo (Swift 1.5) | 4 min 56 s |

No se han publicado resultados numericos de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Estimaciones derivadas del recuento de parametros (176,9 mil millones); no proceden de mediciones publicadas por el autor.
- BF16/FP16 en memoria: en torno a 354 GB de VRAM, inviable en GPU de consumo.
- Cuantizacion de 8 bits: aproximadamente 180-190 GB.
- Cuantizacion de 4 bits: aproximadamente 90-105 GB.
- El repositorio completo ocupa 2.643,8 GB, ya que contiene todos los niveles de cuantizacion.
- GPU recomendadas para cuantizaciones altas: multiples A100 (80 GB) o H100 (80 GB) en configuracion multi-GPU con reparto por capas.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) ni en tarjetas de 24-48 GB para cuantizaciones de 4 bits o superiores; requeriria offload a RAM del sistema o configuraciones multi-GPU.
- Opciones de despliegue: `llama-server` de llama.cpp y runtimes compatibles con GGUF. Otros motores (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La unica referencia de velocidad es la aceleracion de 1,8x declarada frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next (este modelo, GGUF) | 176,9 mil millones (totales) | no disponible | 63,4 % menos tokens de pensamiento, 1,8x mas rapido, perdida <1 % frente al base | swift-open-license-1.0, gated | GGUF en HuggingFace (2.658 descargas) |
| Qwen3.8-Flash-Next (base, BF16) | no disponible | no disponible | Referencia de comparacion en la evaluacion del autor | no disponible en la informacion proporcionada | Checkpoint BF16 en HuggingFace |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Repositorio gated: es necesario aceptar la licencia swift-open-license-1.0 antes de descargar los pesos.
- Licencia propietaria (`license: other`): las condiciones de uso comercial no estan detalladas en la informacion disponible. La model card enlaza a una seccion de licencia empresarial, por lo que conviene revisar el texto completo de la licencia antes de cualquier uso en produccion.
- No se detallan los idiomas soportados: no se puede asumir cobertura multilingue.
- No se especifica la longitud de contexto nativa ni su comportamiento con contextos largos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de razonamiento y no se documentan tasas de error.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- El objetivo de compresion del razonamiento implica trazas de pensamiento mas cortas; en tareas que requieran exploracion exhaustiva, la reduccion de tokens podria traducirse en menor profundidad de analisis, aunque el autor declara una perdida de precision inferior al 1 % en xhigh.
- Los datos de rendimiento son declaraciones del propio autor y no se acompanan de resultados numericos verificables en la informacion proporcionada.
- Requisitos de hardware muy elevados: incluso en cuantizaciones de 4 bits se superan los 90 GB, lo que excluye el despliegue en una unica GPU de consumo.
- Fecha de creacion futura respecto a modelos publicos actuales (24 de septiembre de 2026) y solo 13 likes: ecosistema de validacion externa muy reducido.
- El modelo base es `ukisai/Swift-Qwen3.8-Flash-Next`, a su vez derivado de Qwen3.8-Flash-Next; las limitaciones del base pueden heredarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizaciones GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Sitio web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo jugable: https://ukisai.com/swift-games/flash-next
- llama.cpp: https://github.com/ggml-org/llama.cpp
