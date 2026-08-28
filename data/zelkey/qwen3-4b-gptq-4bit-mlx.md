# zelkey/Qwen3-4B-GPTQ-4bit-mlx

## Resumen

El repositorio `zelkey/Qwen3-4B-GPTQ-4bit-mlx` contiene una conversión del modelo Qwen3-4B al formato MLX (Machine Learning for Apple Silicon) con cuantización GPTQ de 4 bits. El autor, zelkey, ha adaptado el modelo original de Alibaba para que pueda ejecutarse de forma eficiente en dispositivos con chips Apple M-series, aprovechando el framework MLX. El modelo base Qwen3-4B es un transformer denso de 4.000 millones de parámetros, con capacidades multilingües, razonamiento, generación de código y matemáticas, y soporte para alternar entre modos de pensamiento y respuesta directa.

Esta conversión concreta está pensada para entornos de inferencia local en macOS, reduciendo el requisito de memoria gracias a la cuantización de 4 bits. Sin embargo, la model card es extremadamente escueta: solo indica idioma inglés, pipeline de generación de texto y la librería MLX. No se proporciona información sobre licencia, contexto, entrenamiento ni benchmarks. El repositorio tiene cero descargas y cero likes, lo que sugiere que es un trabajo reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3-4B, transformer denso) |
| Parametros totales | 652.985.856 (segun safetensors; el modelo Qwen3-4B original tiene 4.000 millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit |
| Idiomas soportados | en (segun model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion especifica sobre la arquitectura interna de esta conversion. Al tratarse de una adaptacion de Qwen3-4B, se asume que hereda la arquitectura transformer densa del modelo original, con atencion completa y sin mezcla de expertos. El modelo base fue desarrollado por Alibaba y entrenado con un corpus multilingue extenso, con tecnicas de supervision y refinamiento, pero los detalles concretos de este repositorio no estan documentados. La cuantizacion GPTQ de 4 bits reduce la precision de los pesos para disminuir el uso de memoria, a costa de una ligera perdida de calidad. No hay informacion sobre el proceso de conversion ni sobre los datos de entrenamiento adicionales, si los hubo.

## Capacidades

- Generacion de texto en ingles (segun la model card), aunque el modelo base Qwen3-4B es multilingue.
- Razonamiento y resolucion de problemas, heredados del modelo base.
- Generacion de codigo y soporte basico de matematicas, segun las capacidades conocidas de Qwen3-4B.
- Ejecucion optimizada en Apple Silicon gracias al formato MLX.
- No se documentan capacidades de tool calling, agentes ni vision en este repositorio.

## Casos de uso

- Inferencia local en macOS: el modelo puede ejecutarse en un Mac con chip M1/M2/M3 usando MLX, ideal para aplicaciones de escritorio que requieran generacion de texto sin conexion.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 4B cuantizado, cabe en equipos con 8 GB de RAM unificada, permitiendo probar interacciones en lenguaje natural.
- Generacion de codigo en entornos de desarrollo: aunque no se especifica soporte de tool calling, el modelo base puede completar fragmentos de codigo y explicar algoritmos, util en editores locales.
- Educacion y experimentacion: para investigadores que quieran estudiar el comportamiento de modelos cuantizados en hardware Apple.
- Despliegue en aplicaciones de productividad: resumen de textos, redaccion de correos o generacion de borradores, todo en local.
- Integracion en pipelines de MLX: al ser un formato nativo, se puede combinar con otras herramientas del ecosistema MLX para tareas de embedding o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B cuantizado a 4 bits, el peso en memoria ronda los 2,4 GB (tamano del repo), por lo que cabe en Macs con 8 GB de RAM unificada o superior.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superiores). No es compatible con GPUs NVIDIA o AMD de forma nativa, salvo que se convierta a otro formato.
- Opciones de despliegue: MLX (libreria principal), tambien se puede usar con `mlx-lm` o `mlx-lm-server` para servir el modelo via API local.
- Latencia y throughput: no disponibles. Dependera del chip concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| zelkey/Qwen3-4B-GPTQ-4bit-mlx | 652M (segun safetensors) | no disponible | GPTQ 4-bit | no disponible | MLX/safetensors |
| Qwen/Qwen3-4B (original) | 4B | 32K (segun documentacion oficial) | FP16/BF16 | Apache 2.0 | safetensors |
| Qwen/Qwen3-4B-MLX-4bit | 4B | 32K | 4-bit (MLX) | Apache 2.0 | MLX/safetensors |

La comparativa se basa en informacion publica del modelo base. Este repositorio concreto parece una conversion adicional, pero sin datos verificables de rendimiento ni licencia, por lo que se recomienda usar las versiones oficiales de Qwen para produccion.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide conocer si se permite uso comercial o modificacion. Se debe contactar al autor antes de cualquier despliegue.
- La model card es minima: no hay informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- El dato de parametros en safetensors (652M) no coincide con el nombre del modelo (4B), lo que sugiere un posible error en el repositorio o una conversion parcial. Verificar la integridad de los pesos antes de usarlo.
- Al estar cuantizado a 4 bits, puede haber degradacion en tareas de razonamiento complejo o generacion de codigo largo.
- Solo se declara soporte para ingles, aunque el modelo base es multilingue; la conversion podria haber limitado el vocabulario.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zelkey/Qwen3-4B-GPTQ-4bit-mlx
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Version MLX oficial de Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B-MLX-4bit
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
