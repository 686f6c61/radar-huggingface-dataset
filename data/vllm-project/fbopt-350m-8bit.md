# vllm-project/fbopt-350m-8bit

## Resumen

`vllm-project/fbopt-350m-8bit` es una copia de un checkpoint de OPT-350m de Facebook (Meta) cuantizado a 8 bits mediante bitsandbytes. El modelo original fue creado por el usuario `yec019` como parte de un proyecto del curso 240D de la Universidad de California en San Diego (otoño de 2023), con el objetivo de estudiar el efecto de la cuantizacion sobre un modelo preentrenado. El repositorio que nos ocupa es una réplica mantenida por el equipo de vLLM para usarla en sus pruebas de integracion continua (CI), ya que el original reside en una cuenta personal y se prefiere reducir el riesgo de cadena de suministro.

Arquitectonicamente se trata de un transformer decoder-only de la familia OPT, con 331.419.136 parametros reales en safetensors (la denominacion "350m" es comercial). No incorpora innovaciones de arquitectura: es un OPT estándar con los pesos almacenados en formato de 8 bits, lo que reduce el tamano del repositorio a unos 0,4 GB. No dispone de model card técnica detallada, benchmarks ni informacion sobre el dataset de entrenamiento, y su licencia figura como "unknown".

Su relevancia es fundamentalmente instrumental: sirve como fixture de pruebas para validar la carga y ejecucion de modelos cuantizados con bitsandbytes en vLLM, no como modelo de produccion. Cualquier evaluacion de capacidades debe remitirse al OPT-350m original de Meta, ya que la cuantizacion a 8 bits introduce degradacion adicional no documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OPT) |
| Parametros totales | 331.419.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (OPT-350m original: 2048 tokens) |
| Tipos de cuantizacion | 8 bits (bitsandbytes) |
| Idiomas soportados | no disponible (entrenamiento mayoritariamente en ingles) |
| Licencia | unknown |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es OPT-350m, un transformer decoder-only con atencion causal, normalizacion por capas previa y embeddings posicionales aprendidos, disenado por Meta para replicar la familia GPT-3 a menor escala. La model card no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO; se sabe por la documentacion publica de OPT que el preentrenamiento se realizo sobre una mezcla de corpus web (RoBERTa, Pile, PushShift.io Reddit) filtrada, pero esos datos no se detallan en este repositorio.

La unica modificacion respecto al original es la cuantizacion a 8 bits con bitsandbytes, tecnica descrita en el paper de LLM.int8() que combina representaciones INT8 por columna con descomposicion mixta de precision para los valores atipicos. No se documenta calibracion, evaluacion de perplexity tras la cuantizacion ni comparacion con el modelo en FP32/FP16, por lo que el impacto real de la cuantizacion en este checkpoint concreto es desconocido.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (350M parametros).
- Razonamiento de corto alcance y completado de texto; capacidad muy limitada para tareas que requieran conocimiento factual extenso.
- Generacion de codigo muy basica; no es un modelo especializado ni fiable para programacion.
- Aritmetica simple; errores frecuentes en operaciones de varios pasos.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el entrenamiento original de OPT esta dominado por ingles.
- Sin modo thinking, vision, audio ni capacidades multimodales.
- Uso previsto real: pruebas de integracion de pipelines de cuantizacion y carga de modelos en vLLM.

## Casos de uso

- Pruebas de integracion en vLLM: validar que el motor carga correctamente pesos safetensors cuantizados a 8 bits con bitsandbytes y genera tokens sin errores; es el proposito declarado del repositorio.
- CI de regresion de kernels de cuantizacion: ejecutar inferencias de referencia para detectar roturas en el soporte de bitsandbytes tras cambios en el codigo.
- Desarrollo de herramientas de conversion: servir como entrada pequena y rapida para probar scripts de conversion entre formatos (safetensors a GGUF, por ejemplo) sin consumir recursos significativos.
- Docencia y experimentacion: reproducir experimentos de cuantizacion en un modelo de 0,4 GB que cabe en cualquier GPU consumer, ideal para cursos sobre eficiencia de inferencia.
- Prototipado de harness de evaluacion: disponer de un modelo diminuto para validar pipelines de evaluacion (perplexity, generacion) antes de escalar a modelos mayores.
- Pruebas de humo en entornos con recursos limitados: verificar el funcionamiento de un stack de inferencia completo en maquinas sin GPU dedicada o con VRAM minima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de perplexity, MMLU, HumanEval ni GSM8K, ni comparaciones con el OPT-350m original en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB para los pesos en 8 bits, mas overhead de activaciones y cache KV (tipicamente por debajo de 1,5 GB en total con contexto corto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1650, RTX 3050, RTX 4090, A100, H100 sin problemas.
- Cabe holgadamente en GPU consumer, incluidas integradas con memoria unificada suficiente.
- Opciones de despliegue: vLLM (proposito principal del repositorio), ademas de transformers con bitsandbytes; la conversion a GGUF para llama.cpp u Ollama no esta documentada pero seria factible.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera throughput alto y latencia de milisegundos en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm-project/fbopt-350m-8bit | 331M | no disponible | 8 bits (bitsandbytes) | unknown | HuggingFace (copia CI) |
| facebook/opt-350m | 331M | 2048 tokens | FP16/FP32 | OPT-175B License (no comercial) | HuggingFace |
| yec019/fbopt-350m-8bit | 331M | no disponible | 8 bits (bitsandbytes) | unknown | HuggingFace (original) |
| facebook/opt-125m | 125M | 2048 tokens | FP16/FP32 | OPT-175B License (no comercial) | HuggingFace |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de otros autores. La diferencia practica frente a `facebook/opt-350m` es el formato de pesos (8 bits frente a FP16/FP32) y el origen del repositorio (copia de CI frente al oficial de Meta).

## Limitaciones y advertencias

- Licencia "unknown": no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion; el modelo base OPT de Meta se distribuye bajo licencia no comercial, lo que probablemente se hereda.
- Repositorio de pruebas de CI: no esta pensado ni mantenido para uso en produccion; puede desaparecer o cambiar sin aviso.
- Model card practicamente vacia: sin informacion sobre dataset, evaluacion, sesgos ni impacto de la cuantizacion.
- Degradacion por cuantizacion no medida: no hay comparacion con el modelo en precision completa, por lo que se desconoce la perdida de calidad.
- Alto riesgo de alucinacion y errores factuales por el reducido tamano (331M parametros).
- Sesgos heredados del corpus de preentrenamiento de OPT (web, Reddit), no documentados en este repositorio.
- Idiomas no declarados; el soporte multilingue es limitado y no verificado.
- Contexto maximo no documentado en la model card; debe asumirse el de OPT-350m (2048 tokens) con cautela.
- Sin soporte de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vllm-project/fbopt-350m-8bit
- Modelo original copiado: https://huggingface.co/yec019/fbopt-350m-8bit
- Modelo base de Meta: https://huggingface.co/facebook/opt-350m
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Paper de bitsandbytes / LLM.int8(): https://arxiv.org/abs/2208.07339
- Paper de OPT: https://arxiv.org/abs/2205.01068
