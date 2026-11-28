# Xylolabs/clairic-MLX-4bit

## Resumen

Clairic MLX 4-bit es una cuantizacion del modelo Cloudflare/clairic, un modelo de 27B parametros desarrollado por Cloudflare y construido sobre Qwen3.8-27B. Su proposito no es la generacion de texto generica, sino la extraccion estructurada: recibe un estado (texto o JSON) y un esquema de campos tipados, y devuelve respuestas estructuradas con valores tipados, listas, nulos, estimaciones y trayectorias de prediccion, acompanadas de informacion de confianza y probabilidades de nulo. Esta version concreta, publicada por Xylolabs, es una conversion a formato MLX con cuantizacion mixta de 4 bits pensada para ejecucion eficiente en hardware Apple Silicon.

El modelo base emplea la arquitectura Qwen3.5 y esta disenado para tareas de extraccion, estimacion numerica y forecasting a partir de entradas multimodales (texto e imagen). La version MLX 4-bit conserva unicamente la capacidad de texto, segun indica el autor, y reduce el peso del repositorio a 17,9 GB mediante cuantizacion afin por grupos de 64.

La relevancia de esta ficha radica en que combina un modelo especializado en salida estructurada con un formato de cuantizacion optimizado para inferencia local en Mac, un nicho con pocas alternativas de este tamano y con soporte nativo de esquemas tipados. La licencia Apache 2.0 facilita su adopcion comercial, aunque la cuantizacion introduce una perdida de fidelidad medible frente al modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (familia Qwen3.8-27B) |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion de fidelidad se realiza a 512 tokens) |
| Tipos de cuantizacion | MLX affine 4-bit en grupos de 64 para atencion y la mayoria de proyecciones MLP; 6-bit para proyecciones down del MLP; 8-bit para embedding de tokens y head del modelo; tensores de estado y normalizacion sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx-lm 0.32.2 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parametros derivado de Qwen3.8-27B, con una cabeza de salida orientada a la produccion de estructuras tipadas en lugar de texto libre. La entrada combina un estado textual o JSON, imagenes opcionales y un mapeo de nombres de campo a especificaciones (tipo, instrucciones, decimales, rango, horizonte de prediccion). La salida incluye valores tipados, listas, nulos, estimaciones con cuantiles opcionales y trayectorias de forecasting, junto con puntuaciones de confianza de extraccion y probabilidades de nulo. El runtime original emplea PyTorch y Transformers, con restricciones de esquema aplicadas mediante `xgrammar` a traves de un logits processor de Transformers.

La version MLX 4-bit es una cuantizacion post-entrenamiento realizada por Xylolabs, no un reentrenamiento. Aplica cuantizacion afin por grupos de 64 con precisiones mixtas: 4 bits para atencion y la mayoria de proyecciones MLP, 6 bits para las proyecciones down del MLP y 8 bits para el embedding de tokens y la head del modelo, dejando sin cuantizar los tensores de estado y normalizacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Extraccion estructurada de campos tipados (texto, numero con decimales, fecha, listas, nulos) a partir de estados textuales o JSON.
- Estimacion numerica con rangos declarados y cuantiles opcionales.
- Forecasting con horizonte e intervalo especificados.
- Puntuacion de confianza de extraccion y probabilidades de nulo por campo.
- Entrada multimodal texto e imagen en el modelo base (la version MLX 4-bit se describe como text-only).
- Salida con restricciones de esquema mediante gramaticas (xgrammar en el modelo original).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Extraccion de datos de facturas y recibos: el modelo recibe el texto o la imagen del documento y un esquema con campos como proveedor, total, fecha e items, y devuelve valores tipados con confianza por campo, lo que permite automatizar la contabilizacion con validacion humana selectiva.
- Procesamiento de formularios y documentos administrativos: con esquemas de campos fecha y numero con decimales, el modelo normaliza la salida y senala nulos cuando el dato no aparece, reduciendo el postprocesado en pipelines de digitalizacion.
- Estimacion de magnitudes con incertidumbre: al declarar un rango para un campo numerico y solicitar cuantiles, el modelo devuelve una distribucion que puede alimentar sistemas de decision que necesitan intervalos, no solo valores puntuales.
- Prevision de demanda a corto plazo: con una serie de valores diarios como estado y un horizonte e intervalo definidos, el modelo genera trayectorias de forecasting utiles para planificacion de inventario o capacidad.
- Inferencia local en Mac para prototipado: gracias al formato MLX y a los 17,9 GB de pesos, un equipo Apple Silicon puede ejecutar el modelo con `mlx_lm.chat` para iterar sobre esquemas de extraccion sin depender de infraestructura GPU remota.
- Validacion de calidad de datos en pipelines ETL: la confianza de extraccion y las probabilidades de nulo permiten enrutar registros dudosos a revision manual y aceptar automaticamente los de alta confianza.
- Enriquecimiento de bases de datos con campos derivados: el modelo puede rellenar campos estructurados a partir de descripciones libres, manteniendo tipos y formato consistentes gracias a las restricciones de esquema.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de la cuantizacion frente al modelo BF16 de texto, medidas como divergencia KL media y acuerdo top-1 a 512 tokens de contexto:

| Variante | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Respuestas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Xylolabs MLX 4-bit mixto | 17,83 GB | 0,030629 | 92,142% | 0,129807 | 88,564% | 0,053879 | 91,608% | 5/5 (BF16 5/5) |
| Otros 0 | 16,38 GB | 0,042503 | 90,059% | 0,141384 | 87,500% | 0,072146 | 89,667% | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 17,9 GB para los pesos en formato MLX 4-bit mixto, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 24 GB de memoria unificada.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). Para el modelo base en PyTorch se requieren GPU NVIDIA tipo A100 o H100.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 24 GB de memoria unificada; no esta pensado para GPU NVIDIA de consumo en este formato.
- Opciones de despliegue: `mlx-lm` 0.32.2 (comandos `mlx_lm.generate` y `mlx_lm.chat`). Para el modelo original, PyTorch y Transformers con `xgrammar`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Xylolabs/clairic-MLX-4bit | ~26,9B | no disponible | MLX safetensors 4-bit mixto | Apache 2.0 | Extraccion estructurada, text-only, Apple Silicon |
| Cloudflare/clairic | ~27B | no disponible | PyTorch/Transformers | Apache 2.0 | Extraccion estructurada multimodal (texto e imagen) |
| Cloudflare/clairic-flash | no disponible | no disponible | no disponible | no disponible | Variante ligera de la familia Clairic |
| Qwen/Qwen3.8-27B | ~27B | no disponible | no disponible | no disponible | Modelo base generico de Qwen |

La comparativa se limita a la familia Clairic y su modelo base, ya que no se dispone de datos de rendimiento de tareas para contrastar con alternativas de extraccion estructurada de otros proveedores.

## Limitaciones y advertencias

- La version MLX 4-bit es text-only segun el autor; pierde la capacidad de entrada de imagenes del modelo original.
- La cuantizacion introduce perdida de fidelidad medible: acuerdo top-1 del 88,564% en el conjunto Chat y divergencia KL de 0,129807, frente a valores mas bajos en WikiText-2 y held-out.
- La evaluacion de fidelidad se realiza a 512 tokens de contexto; no se documenta el comportamiento a contextos mas largos.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos del modelo.
- El modelo esta especializado en extraccion y forecasting; no debe emplearse como modelo conversacional general sin validacion.
- La licencia Apache 2.0 permite uso comercial, pero el aviso NOTICE registra la revision de origen y los cambios de pesos, que deben conservarse.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a ecosistemas CUDA sin reconversion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clairic-MLX-4bit
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Variante ligera de la familia: https://huggingface.co/Cloudflare/clairic-flash
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Model card original de Cloudflare: https://huggingface.co/Cloudflare/clairic/blob/2c161be5cc71bacd6605b99a8c07547e58cfa434/README.md
