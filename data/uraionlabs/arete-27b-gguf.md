# UraionLabs/Arete-27B-GGUF

## Resumen

Arete-27B-GGUF es la conversión a formato GGUF del modelo Arete-27B desarrollado por Nous Research, publicada por Uraion Labs. Arete-27B es un ajuste fino supervisado (SFT) de Qwen3.8-27B de Alibaba, cuyo objetivo declarado es modificar el marco de valores del modelo preservando sus capacidades generales y agénticas. Esta release de Uraion Labs no es un nuevo fine-tune ni una publicación oficial de Nous Research, sino una conversión y cuantización independiente realizada directamente desde los pesos BF16 originales.

El modelo es denso (no MoE), con 26.895.998.464 parámetros totales (aproximadamente 27B) y arquitectura Qwen3.5, lo que requiere una versión reciente de llama.cpp con soporte para `qwen35`. Se distribuye en cuatro cuantizaciones: BF16, Q6_K, Q4_K_M y Q2_K, con tamaños que van de 10,71 GB a 53,81 GB. La licencia es Apache-2.0, heredada del repositorio fuente.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 27B post-entrenado por Nous Research en hardware de consumo mediante llama.cpp, con soporte de plantilla de chat original, modo thinking con niveles de esfuerzo de razonamiento y una API compatible con OpenAI a través de `llama-server`. No obstante, las validaciones publicadas son smoke tests de generación de texto, no benchmarks completos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 (`qwen35`), sin cabeza MTP |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de ejecucion usan `-c 4096`) |
| Tipos de cuantizacion | BF16, Q6_K, Q4_K_M, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |

## Arquitectura y entrenamiento

Arete-27B es un transformer denso de la familia Qwen3.5, derivado de Qwen3.8-27B de Alibaba y post-entrenado por Nous Research mediante ajuste fino supervisado (SFT). El objetivo del post-entrenamiento, segun la documentacion de Nous Research, es reforzar valores occidentales en un modelo entrenado originalmente con datos chinos, midiendo el cambio con una evaluacion de 803 prompts en siete categorias de valores. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La conversion a GGUF fue realizada por Uraion Labs desde los safetensors BF16 originales (revision `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`) mediante el commit `29c720eaf72fcf8e4e61a56a88b994d92668261d` de llama.cpp, usando la flag `--no-nextn` porque el checkpoint fuente no incluye cabeza MTP. Cada cuantizacion se genero directamente desde BF16, sin recuantizacion de baja precision ni importance matrix. Se verificaron arquitectura, numero de capas, numero de tensores, tamano de vocabulario, rangos de bytes de tensores y preservacion exacta de la plantilla de chat original. La plantilla de chat por defecto usa esfuerzo de razonamiento `xhigh` cuando el thinking esta activado, y acepta tambien `medium` y `low`.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat original embebida sin modificar.
- Modo thinking con niveles de esfuerzo de razonamiento configurables (`xhigh`, `medium`, `low`) y desactivacion mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Capacidades generales y agenticas heredadas de Qwen3.8-27B, segun la documentacion de Nous Research.
- Razonamiento de multiples pasos y trabajo agentico, segun la intencion declarada del modelo base.
- Servidor local compatible con la API de OpenAI mediante `llama-server`.
- No incluye proyector de vision: estos GGUF son solo de generacion de texto y no permiten entrada de imagen o video.
- Tool calling: no validado en esta release (los smoke tests no cubren esta capacidad).
- Capacidades multilingues: solo se declara ingles (`en`).

## Casos de uso

- Asistencia conversacional local en ingles: el modelo puede mantener dialogos multi-turno con la plantilla de chat original y modo thinking desactivable para respuestas rapidas, usando Q4_K_M en una GPU de consumo.
- Experimentacion en investigacion de alineamiento de valores: permite reproducir localmente el comportamiento del post-entrenamiento de Nous Research y compararlo con Qwen3.8-27B en las siete categorias de valores evaluadas por el autor.
- Prototipado de agentes: al heredar capacidades agenticas del modelo base, sirve para construir flujos de multiples pasos en entornos de desarrollo antes de migrar a infraestructura mayor.
- Servicio local compatible con OpenAI: `llama-server` expone un endpoint que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el codigo cliente.
- Despliegue en hardware limitado: la cuantizacion Q2_K (10,71 GB) permite ejecutar un modelo de 27B en equipos con VRAM reducida, aceptando mayor riesgo de perdida de calidad.
- Evaluacion de cuantizaciones: los cuatro formatos publicados (BF16, Q6_K, Q4_K_M, Q2_K) permiten medir el impacto de la precision en tareas concretas antes de fijar una configuracion de produccion.
- Generacion de codigo basica: uno de los smoke tests publicados verifica la generacion de una funcion Python, aunque no se ha validado en tareas de codigo mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de benchmarks upstream no son mediciones de estas cuantizaciones, y que los smoke tests realizados (tres pruebas deterministas sin thinking: recuperacion factual, completado de secuencia y una funcion Python) no constituyen benchmarks completos de calidad o perplejidad. Tampoco se han validado contexto largo, generacion en modo thinking, tool calling ni vision.

## Requisitos de hardware

- VRAM estimada para inferencia (los tamanos de archivo excluyen KV cache y buffers de ejecucion):
  - Q2_K: 10,71 GB de pesos; requiere margen adicional para KV cache.
  - Q4_K_M: 16,55 GB de pesos; opcion equilibrada recomendada por el autor.
  - Q6_K: 22,08 GB de pesos; mayor precision a costa de mas memoria.
  - BF16: 53,81 GB de pesos; requiere hardware de clase servidor.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, Q4_K_M y Q6_K encajan en GPUs de consumo de gama alta con 24 GB o mas de VRAM; BF16 requiere GPUs de centro de datos (A100, H100 o equivalentes).
- Cabe en consumer GPU: Q2_K y Q4_K_M en tarjetas de 12-16 GB y 24 GB respectivamente, segun el margen disponible para KV cache; no se aportan mediciones concretas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), descarga via `hf download`, y cualquier runtime que consuma GGUF con soporte `qwen35`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card advierte que el BF16 fue validado estructuralmente pero no probado en inferencia por requisitos de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Arete-27B-GGUF (esta ficha) | 26,9B denso | no disponible | Apache-2.0 | GGUF en HF | Cuantizaciones de Uraion Labs; smoke tests solamente |
| NousResearch/Arete-27B | 26,9B denso | no disponible | Apache-2.0 | Safetensors BF16 en HF | Modelo base original; benchmarks upstream no trasladables a los GGUF |
| Qwen3.8-27B (modelo de partida) | aproximadamente 27B | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo original de Alibaba sobre el que se aplica el SFT |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estos modelos ni de alternativas adicionales de la misma categoria.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues en esta release.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad de estas cuantizaciones.
- Q2_K es una cuantizacion agresiva de baja precision con mayor riesgo de perdida de calidad, segun advierte el propio autor.
- Los smoke tests publicados no cubren contexto largo, modo thinking, tool calling ni vision; el rendimiento en produccion para esas capacidades no esta validado.
- No se incluye proyector de vision: estos archivos no habilitan entrada de imagen o video.
- El BF16 no fue probado en inferencia por requisitos de memoria; solo validacion estructural.
- La modificacion deliberada del marco de valores del modelo puede introducir sesgos en la direccion del post-entrenamiento; Nous Research invita a la comunidad a evaluarlo contra requisitos propios.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia original incluido en el repositorio y atribuir el desarrollo a Nous Research y el modelo de partida a Qwen/Alibaba.
- Requiere una version reciente de llama.cpp con soporte `qwen35`; versiones antiguas no cargaran el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/UraionLabs/Arete-27B-GGUF
- Modelo base original: https://huggingface.co/NousResearch/Arete-27B
- Anuncio de Nous Research: https://nousresearch.com/arete
