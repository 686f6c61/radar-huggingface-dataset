# tanshin91/Ornith-1.5-9B-oQ4e-fp16-mtp

## Resumen

Ornith-1.5-9B-oQ4e-fp16-mtp es una cuantización mixta del modelo Ornith-1.5-9B, publicada por el usuario tanshin91 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formatos de precisión mixta (mayoritariamente 4, 5 y 6 bits con grupos de 64) realizada con la herramienta oQ de oMLX v0.8.0, orientada a la inferencia en Apple Silicon mediante la librería MLX. El checkpoint conserva el modelo de lenguaje, la torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa.

El modelo base pertenece a la familia Qwen3.5 (según el tag `qwen3_5`) y cuenta con 9.653.104.368 parámetros totales según los tensores safetensors, de los cuales 8.954B corresponden al modelo de lenguaje, 0.456B a la torre de visión y 0.243B a la cabeza MTP. La cuantización resultante ocupa 6.906 GiB en disco (7.415 GB), con un promedio efectivo de 6,145 bits por peso, lo que permite ejecutar un modelo multimodal de casi 10B parámetros en equipos con memoria unificada de gama alta.

Su relevancia es práctica: ofrece una vía para desplegar localmente un modelo multimodal con capacidad de predicción multi-token en Macs con Apple Silicon, manteniendo la torre de visión en FP32 y una parte del modelo de lenguaje en 5 y 6 bits para preservar calidad en las capas más sensibles. La información pública disponible es escasa: no hay datos de licencia, idiomas ni benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con torre de visión y cabeza MTP; pesos cuantizados en formato oQ |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit, FP16 y FP32; media efectiva 6,145 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repo | 14,6 GB |
| Tamano del checkpoint | 6,906 GiB (7,415 GB) |
| Desglose por componente | LM: 8,954B / 5,031 GiB; visión: 0,456B / 1,699 GiB; MTP: 0,243B / 0,176 GiB |
| Libreria | mlx |
| Fecha de creacion | 2026-08-26 |
| Ultima actualizacion | 2026-11-19 (recuantizado con oMLX v0.8.0) |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base; solo documenta el proceso de cuantización. Se sabe que el checkpoint deriva de un modelo de la familia Qwen3.5 con arquitectura transformer, al que se añaden dos componentes: una torre de visión de 0,456B parámetros almacenada en FP32 (1,699 GiB) y una cabeza MTP de 0,243B parámetros (0,176 GiB) que habilita decodificación multi-token especulativa. La presencia de visión y MTP sugiere un modelo multimodal con optimización para generación acelerada, aunque no se detallan los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

La innovación técnica principal de este checkpoint es la distribución de precisión. El 66,153% de los pesos lógicos (6,386B) se almacena en affine 4-bit con grupo 64 (3,345 GiB, 4,50 bits/peso efectivos), el 27,021% (2,608B) en 5-bit (1,670 GiB, 5,50 bits/peso) y el 1,741% (0,168B) en 6-bit (0,127 GiB, 6,50 bits/peso). Los 0,456B parámetros de visión se mantienen en FP32 (4,724% del total) y solo 0,035B en FP16. Esta asignación desproporcionada de precisión a la torre de visión y a ciertas capas del LM busca preservar la calidad multimodal y las capas sensibles a la cuantización, a costa de un tamaño mayor que una cuantización uniforme de 4 bits.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5, aunque no se documentan evaluaciones específicas en la model card.
- Procesamiento de imágenes: incluye torre de visión de 0,456B parámetros en FP32, lo que indica soporte multimodal (entrada de imagen).
- Decodificación multi-token (MTP): cabeza dedicada de 0,243B parámetros que permite generar varios tokens por paso, reduciendo latencia frente a decodificación autorregresiva estándar.
- Inferencia en Apple Silicon: optimizado para MLX, lo que permite ejecución nativa en chips M-series con memoria unificada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint de 6,906 GiB cabe en equipos con 16 GB o más de memoria unificada, permitiendo ejecutar un modelo multimodal de casi 10B parámetros sin GPU dedicada, usando MLX como backend.
- Asistentes de escritorio con entrada de imagen: la torre de visión en FP32 permite tareas de descripción de capturas, extracción de texto de imágenes o análisis de documentos escaneados en aplicaciones locales.
- Generación acelerada con MTP: la cabeza de predicción multi-token reduce el número de pasos de decodificación, adecuada para aplicaciones interactivas donde la latencia percibida es crítica (chat en tiempo real, autocompletado).
- Prototipado de pipelines multimodales: al ser un checkpoint cuantizado listo para MLX, sirve para validar flujos de visión-lenguaje antes de migrar a despliegues con GPUs de datacenter.
- Investigación sobre cuantización mixta: la distribución detallada por bits y componentes permite estudiar el impacto de distintas precisiones en capas específicas sobre la calidad final.
- Evaluación de decodificación especulativa: la separación explícita de la cabeza MTP facilita experimentos comparando throughput con y sin predicción multi-token en hardware Apple.
- Despliegue en entornos con restricciones de memoria: al ocupar 6,906 GiB, es viable en estaciones de trabajo con memoria unificada limitada donde un checkpoint FP16 de 9,6B parámetros (unos 19 GB) no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la distribución de bits y el tamaño del checkpoint; no incluye métricas de calidad (MMLU, HumanEval, GSM8K ni evaluaciones multimodales) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,906 GiB solo para pesos; con overhead de contexto y activaciones, se recomienda un mínimo de 10-12 GB de memoria unificada.
- Cabe en consumer hardware: sí, en Macs con Apple Silicon de 16 GB o más (M1 Pro, M2 Pro, M3 Pro, M4 Pro y variantes Max/Ultra). No es compatible de forma nativa con GPUs NVIDIA o AMD al estar en formato MLX.
- GPU recomendadas: Apple M-series con memoria unificada; para modelos equivalentes en CUDA se requeriría una GPU con al menos 10-12 GB de VRAM (RTX 3060 12GB, RTX 4070, RTX 4090) tras reconvertir los pesos.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para el modelo de lenguaje y herramientas MLX-VLM para el componente multimodal. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato oQ es específico de oMLX.
- Latencia y throughput: no disponibles. La cabeza MTP está diseñada para reducir latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-oQ4e-fp16-mtp | 9,653B | no disponible | MLX / oQ mixta | no disponible | Visión + MTP, 6,906 GiB |
| Modelo base Ornith-1.5-9B (sin cuantizar) | ~9,65B | no disponible | safetensors | no disponible | Referencia de calidad; ocuparía ~19 GB en FP16 |
| Cuantizaciones GGUF Q4_K_M de modelos 9B | ~9B | según base | GGUF | según base | Compatibles con llama.cpp/Ollama; sin MTP ni torre de visión en FP32 |
| Cuantizaciones MLX 4-bit uniformes de modelos 9B | ~9B | según base | MLX | según base | Menor tamaño (~5 GB) pero sin precisión selectiva por componente |

La comparativa se limita a variantes del mismo modelo base y a formatos de cuantización alternativos, ya que no se dispone de datos de rendimiento que permitan comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Ornith-1.5-9B antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística real; no se debe asumir un rendimiento multilingüe sin evaluarlo.
- Contexto no documentado: la longitud máxima de contexto no aparece en la model card, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de degradación por cuantización: aunque la distribución mixta preserva visión y capas sensibles, el 66% de los pesos está en 4 bits; puede haber pérdida de calidad frente al modelo original, especialmente en tareas de razonamiento matemático o código.
- Dependencia de MLX: el formato oQ no es portable a otros runtimes sin reconversión; limita el despliegue a hardware Apple.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen este riesgo en esta variante.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco se detallan.
- Recuantización reciente: la actualización del 2026-11-19 con oMLX v0.8.0 implica que copias anteriores pueden diferir; conviene verificar el hash de los archivos descargados.
- Popularidad muy baja (21 descargas, 0 likes): no hay validación comunitaria de la calidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanshin91/Ornith-1.5-9B-oQ4e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Ornith-1.5-9B: no disponible (no se enlaza en la model card)
- Paper o blog técnico del modelo base: no disponible
- Repositorio MLX: no disponible en la información proporcionada
- Demos: no disponible
