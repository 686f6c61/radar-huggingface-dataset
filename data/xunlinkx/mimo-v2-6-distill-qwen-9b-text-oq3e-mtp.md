# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e-mtp

# MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e-mtp es una cuantización de 3 bits en formato MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario xunlinkx. No se trata de un modelo entrenado desde cero, sino de una conversión optimizada para ejecución local en hardware Apple Silicon mediante el runtime oMLX, que aplica una cuantización affine global de 3 bits con tamaño de grupo 64 y cobertura estricta de matriz de importancia. El modelo conserva únicamente la torre de texto: los pesos de visión y los procesadores multimodales se han eliminado, lo que ahorra aproximadamente 1,5 GB de memoria unificada y lo convierte en un LLM puramente textual.

El modelo base procede de la serie MiMo-V2.6 de Xiaomi, presentada en septiembre de 2026 junto a MiMo-V2.6-Pro y MiMo-V2.6-Flash. La variante Distill-Qwen-9B se distribuye específicamente como recurso de investigación para RL agéntico, y esta conversión la adapta para inferencia local con un total de 8.953.803.264 parámetros y un tamaño de repositorio de 4,7 GB. La innovación más destacable de esta ficha concreta es la incorporación de una cabeza de predicción multitoken (MTP) de 15 tensores, tomada de Qwen/Qwen3.5-9B, que habilita decodificación especulativa y acelera la generación entre un 1,4x y un 1,6x en tareas de texto.

Su relevancia radica en que permite ejecutar un modelo de casi 9B en equipos de consumo con memoria unificada, manteniendo soporte de tool calling y de bloques de razonamiento, con una licencia MIT que facilita su integración en proyectos comerciales. A cambio, exige un ecosistema MLX y renuncia a cualquier capacidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (tag `qwen3_5`), con cabeza MTP adicional para decodificacion especulativa |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits affine global (oQ3e), group size 64; calculo en BF16 durante la calibracion |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX, mas `model-mtp.safetensors` (cabeza MTP de 15 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5, destilado por Xiaomi a partir de la serie MiMo-V2.6 y orientado a investigación en aprendizaje por refuerzo agéntico. La serie original, publicada el 21 de septiembre de 2026, incluye los modelos MoE MiMo-V2.6-Pro y MiMo-V2.6-Flash, de los que se liberaron pesos e informe técnico, además de este destilado de 9B acompañado de recursos de RL verificados. El enfoque de entrenamiento de Xiaomi se centra en escalar cómputo de RL sobre tareas complejas y verificables, de modo que el modelo amplía su frontera de capacidades mediante exploración y retroalimentación. No se dispone de cifras concretas de tokens de entrenamiento, composición del dataset ni detalles de las fases de RLHF o DPO aplicadas al destilado.

La conversión aquí descrita no altera los pesos más allá del proceso de cuantización: se utilizaron 128 muestras de calibración con longitud de secuencia 512, cómputo en BF16 y tamaño de grupo 64, aplicando de forma estricta la matriz de importancia (oQe). El autor verificó la instanciación estricta del modelo y del módulo MTP en el runtime oMLX, la identidad SHA-256 del tokenizador frente a la fuente oficial y la representación correcta de esquemas de funciones estilo OpenAI y bloques de pensamiento en la plantilla de chat. La cabeza MTP se injertó desde Qwen/Qwen3.5-9B y, con `mtp_enabled: true`, activa decodificación especulativa con 3 tokens borrador por defecto.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline declarado `text-generation`.
- Razonamiento explicito mediante bloques de pensamiento, ya que la plantilla de chat oficial renderiza dichos bloques de forma limpia.
- Tool calling y function calling: la plantilla admite esquemas de funciones estilo OpenAI, y el modelo esta etiquetado con `tool-use`.
- Flujos aganticos y razonamiento multi-paso, herencia de su orientacion como recurso para RL agéntico.
- Decodificación especulativa mediante cabeza MTP, con aceleracion de generacion de aproximadamente 1,4x a 1,6x en tareas de texto.
- Ejecucion local en Apple Silicon a traves de oMLX y MLX.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision: eliminadas explicitamente en esta conversion (torre de vision y procesadores multimodales omitidos).

## Casos de uso

- Asistente de codigo en local: al ser un modelo de casi 9B cuantizado a 3 bits y con soporte de tool calling, puede integrarse en editores y terminales sobre un Mac para autocompletar, explicar y refactorizar codigo sin enviar datos a la nube.
- Agentes autonomos de automatizacion: su soporte de esquemas de funciones estilo OpenAI y de razonamiento multi-paso permite orquestar llamadas a herramientas (APIs, ficheros, shell) en bucles de decision ejecutados en el propio equipo.
- Investigacion en RL agéntico: al derivar de un destilado publicado expresamente como recurso de investigacion en RL, sirve como politica base o entorno de evaluacion para experimentos de refuerzo con recompensas verificables.
- Prototipado rapido de chatbots: la licencia MIT y el formato MLX facilitan desplegar conversaciones multi-turno como paso previo a la produccion, sin coste de API.
- Procesamiento de texto sensible en local: al ejecutarse integramente en hardware propio y ser text-only, es apto para resumir o extraer informacion de documentos que no deben salir del dispositivo.
- Evaluacion de tecnicas de cuantizacion y decodificacion especulativa: la combinacion de oQ3e con cabeza MTP lo convierte en un banco de pruebas para medir el equilibrio entre calidad de pesos a 3 bits y aceleracion por MTP.
- Educacion y demostraciones de LLM en el aula: su tamano manejable (4,7 GB) permite desplegarlo en portatiles Apple para ensenar inferencia local, cuantizacion y tool calling sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento medido que aporta el autor es la aceleracion por decodificacion especulativa MTP, estimada en un factor de 1,4x a 1,6x en generacion de tokens sobre tareas de texto. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia absoluta o throughput.

## Requisitos de hardware

- Pesos: el repositorio ocupa 4,7 GB, correspondientes a los parametros a 3 bits mas la cabeza MTP; el autor indica que la omision de la torre de vision ahorra aproximadamente 1,5 GB de memoria unificada.
- Memoria: con 4,7 GB de pesos, el modelo es viable en equipos Apple Silicon con 16 GB de memoria unificada, dejando margen para el contexto y el runtime.
- GPU compatibles: al tratarse de pesos MLX, requiere Apple Silicon (familia M). No esta pensado para GPU NVIDIA tipo A100, H100 o RTX 4090 sin conversion previa del formato.
- GPU de consumo: cabe en Macs con chip M-series y memoria unificada suficiente; no se indica compatibilidad con GPU de consumo NVIDIA en este formato.
- Opciones de despliegue: runtime oMLX (necesario para habilitar MTP y decodificacion especulativa), y en general el ecosistema MLX/MLX-LM. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Parametros de generacion recomendados por el autor: `temperature` 0,6 y `repetition_penalty` 1,05, con `mtp_num_draft_tokens` 3.
- Latencia y throughput: no se publican cifras absolutas; solo el rango relativo de mejora de 1,4x a 1,6x con MTP activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Multimodal | Licencia | Formato / runtime |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e-mtp (este) | 8,95B | No disponible | 3 bits affine, group size 64 | No (text-only) | MIT | safetensors MLX / oMLX |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | No disponible (destilado de 9B) | No disponible | Sin cuantizar | Si (incluye vision) | MIT | No disponible |
| MiMo-V2.6-Flash | No disponible (MoE) | No disponible | No aplica | Si (omnimodal nativo) | Pesos abiertos | No disponible |
| Qwen/Qwen3.5-9B | No disponible (denominacion 9B) | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estas alternativas. La comparacion se limita, por tanto, a parametros, modalidad, licencia y formato de despliegue.

## Limitaciones y advertencias

- La cuantizacion a 3 bits puede degradar la calidad de las respuestas frente al modelo base en BF16; no se publican evaluaciones que cuantifiquen esa perdida.
- Es una conversion de la comunidad (autor xunlinkx), no una publicacion oficial de Xiaomi, por lo que el soporte y el mantenimiento no estan garantizados.
- Modelo puramente textual: se han eliminado la torre de vision y los procesadores multimodales, por lo que no procesa imagenes.
- Requiere hardware Apple Silicon y el runtime MLX/oMLX; no es directamente desplegable en pilas CUDA habituales.
- No se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar aplicaciones multilingues o de contexto largo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan datos de evaluacion de veracidad o tasas de error.
- La cabeza MTP se injerto desde Qwen/Qwen3.5-9B, un modelo distinto del base; el autor declara haber validado su instanciacion, pero se trata de un acoplamiento entre modelos que conviene verificar en produccion.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base upstream y de cualquier componente injertado antes de desplegarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e-mtp
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Pagina oficial de MiMo-V2.6 (Xiaomi): https://mimo.xiaomi.com/mimo-v2-6
- Nota de la serie MiMo-V2.6 con precios y publicacion de pesos: https://mimo.mi.com/docs/en-US/news/latest/v2-6
- Portal de Xiaomi MiMo: https://mimo.mi.com/
- Cobertura de la serie Pro, Flash y Distill-9B: https://www.brocker.org/xiaomi-mimo-v26-pro-flash-distill-qwen-open-weights
- Metricas de entrenamiento RL de MiMo-V2.6: https://mimo.xiaomi.com/rl/
- Modelo de origen de la cabeza MTP: https://huggingface.co/Qwen/Qwen3.5-9B
