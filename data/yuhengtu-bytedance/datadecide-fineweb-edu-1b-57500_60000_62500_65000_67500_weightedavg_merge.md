# yuhengtu-bytedance/DataDecide-fineweb-edu-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

DataDecide-fineweb-edu-1B-57500_60000_62500_65000_67500_weightedavg_merge es un modelo de lenguaje de tipo base (no instruido) publicado por yuhengtu-bytedance en HuggingFace. No se trata de un entrenamiento desde cero, sino del resultado de fusionar cinco checkpoints intermedios de una misma ejecución de entrenamiento sobre el corpus fineweb-edu, correspondientes a los pasos 57.500, 60.000, 62.500, 65.000 y 67.500. La fusión se ha realizado con mergekit mediante el método Linear (media ponderada de pesos), usando el checkpoint del paso 67.500 como base y pesos crecientes de 1 a 5 según el paso, con normalizacion activada.

El modelo tiene 1.279.854.592 parametros (aproximadamente 1,28 mil millones) y se distribuye en formato safetensors con arquitectura tipo Llama segun los tags del repositorio. Su interes es fundamentalmente de investigacion: es un artefacto tipico de la linea de trabajo DataDecide, orientada a estudiar como escalan las decisiones sobre datos de preentrenamiento y como se comportan las tecnicas de model merging sobre checkpoints de una misma trayectoria de entrenamiento.

Conviene subrayar que se trata de un modelo base sin ajuste por instrucciones (no hay RLHF ni DPO documentados) y que el repositorio no publica model card descriptiva mas alla del YAML de la fusion, ni licencia, ni idiomas declarados, ni resultados de evaluacion. Por tanto, es util como punto de partida para fine-tuning, para experimentos de comparacion de tecnicas de merge y para prototipado local de bajo coste, pero no como asistente conversacional listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (tag `llama` en HuggingFace) |
| Parametros totales | 1.279.854.592 (~1,28 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos fusionados en bfloat16 (safetensors). No incluye GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el corpus de origen declarado (fineweb-edu) es mayoritariamente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`out_dtype: bfloat16`), compatible con transformers |
| Autor | yuhengtu-bytedance |
| Metodo de fusion | Linear (mergekit), con normalizacion, base = checkpoint del paso 67.500 |
| Checkpoints fusionados | pasos 57.500 (peso 1), 60.000 (peso 2), 62.500 (peso 3), 65.000 (peso 4), 67.500 (peso 5) |
| Tamano del repositorio | 2,6 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion (metadatos) | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Llama, con 1,28 mil millones de parametros, segun los tags y el formato de pesos del repositorio. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion (MHA, GQA) ni longitud de contexto maxima, ya que el repositorio no incluye `config.json` documentado en la informacion proporcionada. Tampoco hay datos sobre tokenizador mas alla de que es compatible con la libreria transformers.

El proceso de creacion no es un entrenamiento, sino una interpolacion lineal de pesos. El YAML publicado define cinco modelos de entrada, todos ellos checkpoints de la misma ejecucion sobre fineweb-edu, con pesos proporcionales al paso temporal (1, 2, 3, 4 y 5), `merge_method: linear`, `normalize: true`, `dtype: float32` para el calculo y `out_dtype: bfloat16` para la salida. Este esquema se corresponde con el metodo descrito en el articulo referenciado por el propio tag del repositorio (arXiv:2203.05482, model soups / interpolacion de pesos), que en la practica suaviza el ruido de un unico checkpoint y suele producir una solucion mas robusta que cualquiera de los puntos individuales de la trayectoria.

No consta que se hayan aplicado fases de ajuste fino supervisado, RLHF, DPO u otras tecnicas de alineacion. Es, por tanto, un modelo base de preentrenamiento, sin formato de chat ni plantilla de conversacion declarada. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos, SSM) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en modo continuacion de prompt, propio de un modelo base preentrenado.
- Capacidad esperada de modelado de lenguaje sobre texto en ingles educativo, dado el corpus fineweb-edu de origen; el rendimiento en otros idiomas no esta documentado.
- No dispone de ajuste por instrucciones: no se debe esperar seguimiento fiable de ordenes, formato de chat ni respuestas con estructura controlada sin fine-tuning adicional.
- Soporte de tool calling o function calling: no disponible, no declarado en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible, al carecer de entrenamiento especifico para ello.
- Capacidades multimodales (vision, audio): no disponibles; es un modelo exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad de servir como punto de partida para fine-tuning supervisado, ajuste por preferencias o destilacion, gracias a su tamano reducido y a su formato estandar en safetensors.
- Utilidad como objeto de estudio en experimentos de model merging: permite comparar la interpolacion de checkpoints frente a checkpoints individuales de la misma ejecucion.

## Casos de uso

- Fine-tuning supervisado para tareas concretas de clasificacion o extraccion: al ser un modelo base de 1,28 mil millones de parametros en safetensors, se puede ajustar sobre datasets etiquetados pequenos (clasificacion de tickets, deteccion de intenciones, NER) en una unica GPU de consumo, con un coste de entrenamiento bajo.
- Investigacion sobre tecnicas de model merging: sirve como caso de estudio reproducible para medir si una media ponderada de checkpoints supera al checkpoint final en perplejidad o en tareas downstream, ya que la configuracion exacta de la fusion esta publicada.
- Estudio de trayectorias de entrenamiento y leyes de escala en datos: al provenir de cinco puntos temporales de la misma ejecucion sobre fineweb-edu, permite analizar que informacion aporta cada fase del preentrenamiento y como se combinan entre si.
- Prototipado local en portatil o estacion de trabajo: con pesos en bfloat16 de aproximadamente 2,6 GB, el modelo cabe en GPUs de 8 GB o incluso en CPU, lo que facilita pruebas de generacion de texto sin infraestructura en la nube.
- Ajuste con LoRA o QLoRA para dominios verticales: el reducido numero de parametros permite entrenar adaptadores de bajo rango en una sola GPU y desplegar variantes especializadas (legal, medico, tecnico) a partir de la misma base.
- Generacion de datos sinteticos y aumento de corpus: puede utilizarse para producir texto de dominio general en ingles que luego se filtre y se use en experimentos de destilacion o de curriculum de entrenamiento.
- Baseline en comparaciones academicas: al ser un artefacto de fusion sin alineacion, resulta util como referencia inferior frente a modelos instruidos del mismo orden de magnitud en estudios sobre alineacion y seguimiento de instrucciones.
- Despliegue en entornos con recursos limitados: compatible con text-generation-inference y con Inference Endpoints (tags `text-generation-inference` y `endpoints_compatible`), permite servir el modelo en instancias pequenas para tareas de continuacion de texto o autocompletado interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad) y la busqueda web asociada no devolvio resultados relevantes sobre este modelo: unicamente enlaces promocionales a Google Gemini, sin relacion con el artefacto descrito.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: aproximadamente 2,4-2,6 GiB solo para los pesos (1.279.854.592 parametros x 2 bytes), mas cache KV y activaciones; en la practica, entre 3 y 5 GB segun longitud de secuencia y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,3-1,6 GB de pesos. En 4 bits: en torno a 0,7-0,9 GB. Estas cuantizaciones no se distribuyen en el repositorio y requeririan conversion propia.
- GPU recomendadas: cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, Tesla T4 16 GB, L4 24 GB y A10G. En A100 o H100 se puede servir con lotes grandes y multiples replicas por GPU.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM en bfloat16, y en GPUs de 4 GB si se cuantiza a 4 bits.
- Despliegue: transformers (libreria declarada), text-generation-inference (tag explicito), HuggingFace Inference Endpoints (tag `endpoints_compatible`) y vLLM por compatibilidad de arquitectura Llama. Para llama.cpp/Ollama seria necesaria una conversion a GGUF que el repositorio no incluye.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los valores de los modelos alternativos provienen de su documentacion publica, no de la informacion proporcionada en esta busqueda, y deben verificarse antes de usarse en una decision de produccion.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| Este modelo (merge fineweb-edu 1B) | ~1,28 mil millones | no disponible | no disponible | Modelo base de investigacion, sin alineacion |
| Llama 3.2 1B | ~1,24 mil millones | 128.000 tokens (segun su documentacion) | Llama 3.2 Community License | Base e instruido, con contexto largo |
| Qwen2.5 1.5B | ~1,54 mil millones | 32.768 tokens (segun su documentacion) | Apache 2.0 (segun su documentacion) | Base e instruido, multilingue |
| SmolLM2 1.7B | ~1,7 mil millones | 8.192 tokens (segun su documentacion) | Apache 2.0 (segun su documentacion) | Base e instruido, orientado a dispositivo |

Diferencias clave frente a estas alternativas: este modelo no ofrece variante instruida, no declara licencia ni idiomas, no publica contexto maximo y no tiene benchmarks. Su ventaja relativa es la trazabilidad total del proceso de fusion y su utilidad como objeto de experimentacion, no la competitividad en tareas de usuario final.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Modelo base sin alineacion: no sigue instrucciones de forma fiable, puede generar continuaciones incoherentes, repetitivas o inapropiadas ante prompts conversacionales.
- Riesgo de alucinacion: al ser un modelo preentrenado sobre texto web educativo, puede producir afirmaciones factualmente incorrectas con apariencia de verosimilitud, sin ninguna capa de verificacion.
- Sesgos potenciales heredados del corpus fineweb-edu, mayoritariamente ingles y filtrado por criterios automaticos de calidad educativa; no se documenta ningun proceso de mitigacion de sesgos.
- Limitacion idiomatica: no se declaran idiomas soportados y el corpus de origen es predominantemente anglosajon; el rendimiento en castellano es incierto y probablemente bajo sin fine-tuning.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin inspeccionar la configuracion real del modelo.
- Inexistencia de benchmarks: no hay evidencia publicada de calidad, por lo que cualquier afirmacion de rendimiento seria especulativa.
- Artefacto de investigacion: la model card se limita al YAML de fusion y no describe datos de entrenamiento, numero de tokens vistos, composicion del dataset ni hiperparametros de preentrenamiento.
- Fechas de metadatos anomalas (creacion en 2026-09-17): conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.
- Sin cuantizaciones oficiales ni archivos GGUF: el despliegue en CPU o en entornos de bajos recursos exige conversion y validacion propias, con el consiguiente riesgo de degradacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-fineweb-edu-1B-57500_60000_62500_65000_67500_weightedavg_merge
- mergekit (herramienta de fusion utilizada): https://github.com/cg123/mergekit
- Articulo referenciado por el tag `arxiv:2203.05482` (interpolacion de pesos / model soups): https://arxiv.org/abs/2203.05482
- Perfil del autor en HuggingFace: https://huggingface.co/yuhengtu-bytedance
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo. Los unicos resultados devueltos corresponden a paginas promocionales de Google Gemini (https://gemini.google.com/, https://deepmind.google/models/gemini/), sin ninguna relacion con el artefacto descrito.
