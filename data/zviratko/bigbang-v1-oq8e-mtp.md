# zviratko/BigBang-v1-oQ8e-mtp

## Resumen

BigBang-v1-oQ8e-mtp es una cuantizacion de 8 bits del modelo BigBang-v1, un gran modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el colectivo Endless Frontier. El modelo base, segun la pagina oficial, evoluciona a partir de Qwen3.6-35B-A3B mediante un proceso de post-entrenamiento eficiente basado en datos sinteticos auto-evolutivos, y alcanza un rendimiento agregado situado entre DeepSeek V4 Flash (284B) y DeepSeek V4 Pro (1.6T). Esta cuantizacion concreta, publicada por el usuario zviratko, emplea la libreria oMLX y el esquema de cuantizacion mixta oQ para reducir el peso del modelo a 8 bits con group size de 64, manteniendo el formato MLX safetensors.

El interes de esta ficha radica en que es una variante cuantizada y optimizada para hardware Apple Silicon (MLX), lo que permite ejecutar un modelo MoE de gran tamano en equipos de escritorio o portatiles de gama alta. La etiqueta `qwen3_5_moe` indica que la arquitectura pertenece a la familia Qwen3.5 MoE, aunque el modelo base se describe como derivado de Qwen3.6-35B-A3B. La cuantizacion reduce significativamente el uso de memoria respecto al modelo original, manteniendo una calidad de generacion aceptable para tareas de razonamiento, codigo y analisis de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture-of-Experts, basada en Qwen3.6-35B-A3B) |
| Parametros totales | 10.433.809.328 (segun safetensors de esta cuantizacion) |
| Parametros activos | 3.000.000.000 (estimado, segun el nombre A3B del modelo base; no confirmado en la cuantizacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision, 8 bits, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo base BigBang-v1 es un transformer de tipo Mixture-of-Experts con activacion de 3B parametros de un total de 35B, segun la informacion de la pagina oficial. Se entrena mediante un proceso de post-training eficiente que utiliza un framework de datos sinteticos auto-evolutivos, basado en tareas de investigacion verificables. La cuantizacion oQ8e-mtp aplica una reduccion de precision de 8 bits con un group size de 64, y utiliza la tecnica MTP (Multi-Token Prediction) para acelerar la decodificacion especulativa. Los benchmarks publicados en oMLX muestran que el modelo se ejecuta con configuraciones como TurboQuant KV de 8 o 4 bits, lo que sugiere que la cuantizacion esta optimizada para reducir el uso de memoria en el cache de contexto.

El entrenamiento del modelo base se describe como un proceso adversarial de auto-evolucion: se generan datos sinteticos a partir de problemas de investigacion verificables y se refina el modelo iterativamente. No se han publicado detalles concretos sobre el volumen de tokens de entrenamiento ni la composicion exacta del dataset. La cuantizacion oQ se aplica posteriormente al modelo base y no altera la arquitectura interna, solo la representacion numerica de los pesos.

## Capacidades

- Generacion de texto de alta calidad en tareas de razonamiento complejo, como matematicas, logica y analisis cientifico.
- Generacion de codigo en multiples lenguajes de programacion, gracias a su base en Qwen3.6-35B-A3B.
- Soporte de tool calling y function calling, util para integraciones en pipelines de agentes.
- Capacidades multilingues (los idiomas exactos no se han publicado, pero se espera un comportamiento similar al de Qwen3.5).
- Modo de pensamiento (thinking mode) activable mediante el parametro `thinking_budget_enabled` en los benchmarks de oMLX.
- Optimizado para hardware Apple Silicon mediante MLX, con soporte de decodificacion especulativa (MTP) y cache de KV cuantizada (TurboQuant).

## Casos de uso

- Razonamiento y analisis de documentos cientificos: el modelo puede procesar textos largos y extraer conclusiones logicas, gracias a su entrenamiento en tareas de investigacion verificable. Se usaria en entornos de investigacion para resumir papers y generar hipotesis.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en CI/CD pipelines para autogenerar tests, documentacion o refactorizaciones de codigo.
- Agentes autonomos: su capacidad de multi-step reasoning y function calling permite construir agentes que planifican y ejecutan acciones en entornos simulados o reales.
- Asistencia en analisis de datos: puede generar consultas SQL, scripts de Python y visualizaciones a partir de descripciones en lenguaje natural.
- Chatbots tecnicos: su alto rendimiento en razonamiento lo hace adecuado para sistemas de soporte tecnico que requieren respuestas precisas y contextuales.
- Investigacion academica: el modelo puede ayudar a formular hipotesis y disenar experimentos, gracias a su entrenamiento en tareas de investigacion verificable.
- Traduccion y resumen de textos: aunque no se especifican idiomas, su base multilingue permite tareas de traduccion y resumen en contextos profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos concretos en la informacion disponible. La pagina oficial indica que BigBang-v1 alcanza un rendimiento agregado entre DeepSeek V4 Flash (284B) y DeepSeek V4 Pro (1.6T), pero no se proporcionan cifras exactas de MMLU, HumanEval, GSM8K u otros test estandar. Los benchmarks de oMLX muestran tiempos de ejecucion en M3 Ultra (80c) con configuraciones de TurboQuant, pero no incluyen scores de calidad.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion 8-bit de un modelo de 35B totales, la VRAM necesaria es aproximadamente de 10-12 GB para los pesos (considerando la cuantizacion 8-bit), mas la cache KV. Sin embargo, al ser MoE con solo 3B activos, la memoria efectiva en inferencia es menor, estimada en 6-8 GB.
- GPU recomendadas: el formato MLX esta diseñado para Apple Silicon (M1, M2, M3, M4). Los benchmarks se ejecutaron en un M3 Ultra (80 nucleos), que ofrece 128 GB de memoria unificada. En equipos con 32 GB o mas, el modelo puede funcionar.
- Compatibilidad con GPU consumer: no es compatible con GPUs NVIDIA de forma directa, ya que el formato es MLX. Para usar en CUDA, habria que convertir los pesos a otro formato (por ejemplo, GGUF o safetensors no cuantizado).
- Opciones de despliegue: oMLX, MLX, y herramientas compatibles con MLX como llama.cpp (con adaptadores). No se menciona soporte de vLLM o TGI.
- Latencia y throughput: los benchmarks de oMLX muestran que con TurboQuant KV 8-bit y MTP activado, la latencia en M3 Ultra es baja para tareas de codigo, pero no se proporcionan numeros exactos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| BigBang-v1 (cuantizado oQ8e) | 10.4B (cuantizado) | ~3B | no disponible | no disponible | MLX safetensors |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | no disponible | safetensors |
| DeepSeek V4 Flash | 284B | no disponible | no disponible | no disponible | safetensors |
| DeepSeek V4 Pro | 1.6T | no disponible | no disponible | no disponible | safetensors |

La comparativa directa es dificil por la falta de datos publicos. BigBang-v1 se posiciona como un modelo de eficiencia alta, con rendimiento comparable a modelos de mayor tamano (DeepSeek V4 Flash) pero con muchos menos parametros activos. La cuantizacion oQ8e reduce el peso de almacenamiento a un tercio del modelo original (38.6 GB vs. el tamano del modelo base, no publicado), lo que facilita su despliegue en equipos con memoria limitada.

## Limitaciones y advertencias

- Sesgos: al estar basado en Qwen3.5, puede heredar sesgos de genero, raza y culturales del dataset de entrenamiento original. No se ha publicado informacion sobre mitigaciones especificas.
- Alucinacion: como todo LLM, existe riesgo de generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo sin verificacion externa.
- Limitaciones de contexto: la longitud de contexto no se ha publicado, lo que puede limitar su uso en documentos muy largos.
- Restricciones de licencia: la licencia no esta disponible. Se desconoce si el uso comercial esta permitido. Se recomienda contactar al autor antes de usar en produccion.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a dispositivos Apple Silicon. No es compatible directamente con CUDA.
- Tamano del repo: 38.6 GB, lo que requiere espacio de almacenamiento considerable en disco.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zviratko/BigBang-v1-oQ8e-mtp
- Pagina oficial del proyecto BigBang: https://endlessfrontier.tech/
- Benchmarks oMLX en M3 Ultra: https://omlx.ai/benchmarks/performance/r9m0nh6y y https://omlx.ai/benchmarks/cxwrycbt
- Repositorio de cuantizaciones alternativas: https://huggingface.co/AmixDigital/BigBang-v1-mtp-oQ8e
- Otra cuantizacion similar: https://huggingface.co/superbear/BigBang-v1-oQ8e-mtp
