# xv0y5ncu/Gemma-4-E4B-it-GLQ-8bpw

## Resumen

Gemma-4-E4B-it-GLQ-8bpw es una cuantización de 8 bits por peso (8 bpw uniforme) del modelo instructivo google/gemma-4-E4B-it, publicada por el usuario xv0y5ncu mediante la técnica GLQ (Golay-Leech Quantization). El modelo base es un transformer de la familia Gemma 4 de Google con 4.281.666.122 parámetros totales, orientado a generación de texto y conversación, que incorpora un modo de razonamiento explícito (*thinking mode*) activable mediante la plantilla de chat.

La relevancia de esta ficha reside en que GLQ aplica una cuantización de tipo reticular (lattice) en lugar de las técnicas escalar o de grupo habituales: emplea un codebook de la cáscara del retículo E8 con 65.536 entradas en bloques de 8 dimensiones, rotación mediante Randomized Hadamard Transform (RHT) y realimentación LDLQ durante la codificación. El resultado es un artefacto de 7,98 GB (1,87 veces más pequeño que bf16) que, según el autor, mantiene la calidad del original en gsm8k (88 % frente a 86 % de la línea base bf16, con límite de 50 ejemplos y coincidencia estricta).

El modelo se distribuye bajo licencia Gemma (Apache 2.0 según la model card, con enlace a los términos de Google), está etiquetado únicamente para inglés y requiere instalar el paquete `glq` para registrar la configuración de cuantización en Hugging Face Transformers. Es un artefacto derivado, no un modelo entrenado desde cero: no añade capacidades nuevas respecto al base, sino que reduce el coste de almacenamiento y memoria a cambio de un kernel CUDA personalizado que se compila en JIT en el primer uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B instructiva); detalles de capas y atención no disponibles |
| Parametros totales | 4.281.666.122 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GLQ 8.0 bpw uniforme (E8 lattice shell codebook de 65.536 entradas, bloques de 8-D, RHT, LDLQ, cuantización residual en N etapas para capas de ≥3 bpw, asignación de precisión mixta por sensibilidad derivada de la traza del hessiano) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Gemma (la model card declara Apache 2.0 y enlaza a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (7,98 GB); requiere el paquete `glq` para la configuración de cuantización |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E4B-it es un transformer de la familia Gemma 4 de Google, ajustado para instrucciones y conversación, con 4.281.666.122 parámetros y un modo de razonamiento (*thinking*) que se activa con `enable_thinking=True` en la plantilla de chat. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento, ni si hubo RLHF, DPO u otras fases de alineamiento.

La contribución técnica de este artefacto es la cuantización GLQ, no el entrenamiento. GLQ codifica los pesos bf16 originales en un codebook basado en la cáscara del retículo E8 (65.536 entradas, bloques de 8 dimensiones), aplica una rotación de entrada y salida mediante Randomized Hadamard Transform para reducir la curtosis de los pesos, introduce realimentación LDLQ (descomposición LDL por bloques) durante la codificación para compensar el error acumulado, y usa cuantización residual en N etapas en las capas que quedan por debajo de 3 bpw. La asignación de precisión mixta se guía por un proxy de sensibilidad derivado de la traza del hessiano. El resultado es un esquema uniforme de 8,0 bpw medios con un kernel CUDA propio que se compila en JIT en el primer uso (unos 30 segundos).

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat.
- Razonamiento explícito en modo *thinking* (`enable_thinking=True`), orientado a problemas matemáticos y de varios pasos.
- Razonamiento matemático: el autor reporta 88 % de coincidencia estricta en gsm8k (límite de 50, chat + thinking), frente al 86 % del bf16.
- Generación de código y tareas de instrucción general: heredadas del modelo base, sin evaluación específica publicada en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por el modo *thinking*; no se documentan capacidades de agente ni orquestación de herramientas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento matemático por lotes: el modelo puede resolver problemas aritméticos y de varios pasos en modo *thinking* con un presupuesto de 2.048 tokens nuevos; es adecuado porque el autor verifica que la cuantización a 8 bpw conserva la precisión de gsm8k del bf16 (88 % frente a 86 %) con ese presupuesto.
- Asistentes conversacionales en inglés con presupuesto de memoria ajustado: al ocupar 7,98 GB en lugar del equivalente bf16, permite desplegar un modelo de 4,28 mil millones de parámetros en GPUs con menos VRAM, manteniendo la plantilla de chat instructiva.
- Evaluación de técnicas de cuantización reticular: sirve como referencia práctica para comparar GLQ frente a esquemas escalares o de grupo en tareas de razonamiento, dado que el autor publica la metodología y el repositorio de herramientas.
- Despliegue con vLLM en entornos controlados: la model card documenta la integración con `glq[vllm]` y fija la restricción de `transformers>=5.13.1,<5.15`, lo que permite servir el modelo en infraestructura existente de vLLM 0.27.1.
- Generación de texto en pipelines de Transformers: la integración con `AutoModelForCausalLM` y `device_map="cuda"` permite incorporarlo a scripts de inferencia existentes sin reescribir el código de carga.
- Reproducción de experimentos de razonamiento: el parche documentado para `lm-evaluation-harness` permite evaluar el modo *thinking* con el arnés estándar, útil para investigadores que necesitan comparar variantes cuantizadas con la misma metodología.
- Prototipado de aplicaciones en inglés con requisitos de licencia permisiva: la licencia Gemma/Apache 2.0 facilita el uso comercial, aunque conviene revisar los términos enlazados antes de distribuirlo.

## Benchmarks y rendimiento

| Benchmark | Gemma-4-E4B-it-GLQ-8bpw | google/gemma-4-E4B-it (bf16) |
|---|---|---|
| gsm8k, limit=50, chat+thinking, strict-match | 88 % | 86 % |

No se han publicado otros resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K completo u otros). El dato de gsm8k procede de la model card del autor y no incluye intervalo de confianza ni desviación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB solo para los pesos (7,98 GB); hay que sumar la caché KV y el overhead del runtime, por lo que en la práctica se recomienda al menos 12-16 GB de VRAM para contexto moderado. No se especifica el tamaño de contexto ni el coste exacto de la caché KV.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño de pesos, encaja en GPUs con 16 GB o más (RTX 4090, RTX A4000 de 16 GB, L4 de 24 GB, A10G de 24 GB, A100 y H100). El autor solo verifica el funcionamiento con `device_map="cuda"` y vLLM 0.27.1 sobre CUDA 12.x.
- ¿Cabe en GPU de consumo? Sí, en principio en cualquier GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090); en GPUs de 8-12 GB requeriría reducir contexto u offloading, extremo no documentado.
- Opciones de despliegue: Hugging Face Transformers con el paquete `glq` (registra la configuración de cuantización) y vLLM mediante `pip install 'glq[vllm]'`. No se mencionan llama.cpp, Ollama ni TGI, y el formato safetensors con kernel CUDA propio sugiere que no son compatibles sin trabajo adicional.
- Requisitos de software: `torch>=2.0`, `transformers>=5.0` y `transformers>=5.13.1,<5.15` (fijado por el autor), CUDA 12.x. La versión 5.15.0 de Transformers rompe gemma-4 por un cambio a configuración por capa que hace fallar `config.head_dim`; el fallo afecta también al bf16 original.
- Latencia y throughput: no disponibles. El único dato es que el kernel CUDA se compila en JIT en el primer uso (~30 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xv0y5ncu/Gemma-4-E4B-it-GLQ-8bpw | 4,28 mil millones | No disponible | GLQ 8,0 bpw (7,98 GB) | Gemma / Apache 2.0 | Hugging Face, 71 descargas |
| google/gemma-4-E4B-it (bf16) | 4,28 mil millones | No disponible | bf16 (≈15,3 GB estimado a partir del factor 1,87×) | Gemma | Hugging Face (modelo base) |
| Otras cuantizaciones del mismo base (4-6 bpw) | 4,28 mil millones | No disponible | 4-6 bpw según la model card | Gemma | No disponibles en la información proporcionada |

La model card menciona variantes GLQ de 4, 5, 6 y 7 bpw del mismo modelo base, pero no proporciona sus identificadores ni enlaces. No se dispone de datos para comparar con alternativas de otros autores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma es `en`; no se documenta soporte multilingüe.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de factualidad para esta cuantización.
- Presupuesto de generación crítico: en modo *thinking* con 8 bpw se recomiendan 2.048 tokens nuevos; con presupuestos insuficientes el modelo trunca el razonamiento y puede no emitir la respuesta final. Las variantes de 4-6 bpw requieren entre 8.192 y 16.384 tokens.
- Dependencia de software frágil: requiere el paquete `glq`, un kernel CUDA compilado en JIT y fijar `transformers` por debajo de 5.15; la versión 5.15.0 rompe la carga incluso del bf16 original.
- Evaluación limitada: el único benchmark publicado es gsm8k con límite de 50 ejemplos, sin intervalo de confianza; no hay datos de MMLU, HumanEval ni evaluaciones de seguridad.
- Ambigüedad de licencia: la model card declara Apache 2.0, pero los tags de Hugging Face indican `license:gemma` y el enlace apunta a los términos de Gemma 4 de Google. Conviene verificar los términos aplicables antes de un uso comercial.
- Sesgos: no se documentan evaluaciones de sesgo para esta cuantización; los sesgos del modelo base no desaparecen con la cuantización.
- Madurez: 71 descargas y 0 likes en el momento de la consulta; es un artefacto de terceros, no una publicación oficial de Google.
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-8bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Términos de Gemma: https://ai.google.dev/gemma/terms
