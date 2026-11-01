# vllm-project/llama-7b

## Resumen

`vllm-project/llama-7b` es una copia del checkpoint original de LLaMA-7B de Meta AI, publicada por el equipo de vLLM para uso interno de su integracion continua. El repositorio replica el modelo `huggyllama/llama-7b` en el commit `4782ad2`, creado el 30 de octubre de 2026, con el objetivo declarado de reducir el riesgo de cadena de suministro: el original vive en una cuenta personal y vLLM necesita un checkpoint estable para sus pruebas automatizadas. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning, sino de una copia de pesos con fines de validacion.

El modelo subyacente es LLaMA-7B, un transformer decoder-only denso de 6.738.417.664 parametros (unos 6,74 mil millones), publicado originalmente por Meta AI en febrero de 2023. Se distribuye en formato PyTorch y safetensors, con un tamano de repositorio de 27,0 GB, lo que corresponde a los pesos en precision completa (fp16/fp32) mas los ficheros auxiliares. La licencia es "other", concretamente la licencia no comercial de LLaMA original, que restringe el uso a investigacion y excluye la explotacion comercial sin autorizacion expresa de Meta.

Su relevancia actual es fundamentalmente practica: sirve como referencia canonica para validar implementaciones de inferencia (vLLM, llama.cpp, TGI) y como punto de partida para experimentos academicos. No incorpora mejoras de arquitectura respecto al LLaMA-7B original ni dispone de model card con datos de entrenamiento, benchmarks o idiomas; la informacion disponible es minima y se limita a los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA original) |
| Parametros totales | 6.738.417.664 (~6,74 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el LLaMA-7B original soporta 2048 tokens, dato no confirmado en este repo) |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se distribuyen en PyTorch/safetensors en precision completa |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no comercial de LLaMA) |
| Formato de pesos | PyTorch (.bin) y safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del LLaMA-7B original de Meta AI: un transformer decoder-only denso con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No emplea mezcla de expertos ni atencion lineal; es un modelo denso clasico de la primera generacion de LLaMA. El repositorio no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; la model card se limita a indicar que contiene los pesos del modelo y la licencia.

Tampoco se documentan innovaciones tecnicas adicionales en esta copia. El valor del repositorio reside en su funcion como artefacto reproducible para CI: al fijar un commit concreto y alojarlo en la organizacion de vLLM, se elimina la dependencia de una cuenta personal y se garantiza que las pruebas de regresion de vLLM se ejecutan siempre contra los mismos pesos. No hay evidencia de reentrenamiento, destilacion ni modificacion de los tensores.

## Capacidades

- Generacion de texto autoregresiva en ingles principalmente (los idiomas no estan documentados en el repositorio).
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 7 B.
- Generacion de codigo y matematicas simples, sin garantias de calidad frente a modelos posteriores.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo "thinking", vision ni audio.
- Capacidades multilingues no confirmadas; el LLaMA original estaba entrenado mayoritariamente en ingles.

## Casos de uso

- Validacion de implementaciones de inferencia: el repositorio sirve como checkpoint de referencia para probar vLLM, llama.cpp o TGI y comparar latencias y correccion de kernels sin depender de cuentas personales.
- Pruebas de regresion en CI: al fijar el commit `4782ad2`, los pipelines de integracion continua pueden ejecutar tests deterministas de generacion y comprobar que los cambios en el motor no alteran las salidas.
- Investigacion academica sobre modelos base: util como linea base de 7 B para experimentos de interpretabilidad, analisis de sesgos o estudios de escalado, siempre bajo la licencia no comercial.
- Fine-tuning supervisado en entornos de investigacion: al ser un modelo denso de 6,74 B, cabe en una sola GPU de 24 GB con cuantizacion o en 40-80 GB en fp16, lo que permite adaptarlo con LoRA a dominios especificos.
- Generacion de texto offline en prototipos: con cuantizacion a 4 bits puede ejecutarse en GPUs de consumo (RTX 3060 12 GB, RTX 4090) para demos de chatbots o resumen de documentos en entornos no comerciales.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad (perplejidad, exactitud en tareas) al pasar de fp16 a GGUF q4/q8 en herramientas como llama.cpp.
- Docencia: ejemplo canonico de transformer decoder-only para explicar atencion, RoPE y RMSNorm con pesos reales y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad, y los metadatos de HuggingFace no aportan cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con lotes grandes; RTX 4090 (24 GB) para fp16 con lotes pequenos; RTX 3090/4080 (16-24 GB) y RTX 3060 12 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con cuantizacion 4 bits, y en RTX 4090 en fp16 con contexto corto.
- Opciones de despliegue: vLLM (motivo principal del repositorio), llama.cpp, Ollama, Text Generation Inference (TGI) y Transformers con `accelerate`.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vllm-project/llama-7b (este repo) | 6,74 B | no disponible (original: 2048) | other (no comercial) | HuggingFace, copia de huggyllama/llama-7b |
| huggyllama/llama-7b | 6,74 B | 2048 (original) | other (no comercial) | HuggingFace, cuenta personal |
| LLaMA-2-7B (Meta) | 6,74 B | 4096 | licencia LLaMA 2 (uso comercial permitido con condiciones) | HuggingFace, meta-llama |
| Mistral-7B-v0.1 | 7,24 B | 8192 | Apache 2.0 | HuggingFace, mistralai |

La comparativa se limita a parametros, contexto y licencia porque no hay datos de benchmarks en la informacion disponible para este repositorio. Frente a LLaMA-2-7B y Mistral-7B, este checkpoint queda en desventaja por contexto mas corto (si se confirma el original de 2048) y por una licencia no comercial, aunque su interes es reproducibility para CI mas que rendimiento.

## Limitaciones y advertencias

- Licencia no comercial: la licencia "other" de LLaMA original prohibe el uso comercial sin autorizacion de Meta; no es apta para productos en produccion sin revision legal.
- Sesgos conocidos: al ser un modelo base entrenado mayoritariamente en ingles, se esperan sesgos de genero, raza y cultura; no se documentan mitigaciones en este repositorio.
- Riesgo de alucinacion: alto en un modelo base de 7 B sin alineamiento RLHF documentado; no debe usarse como fuente de verdad sin verificacion.
- Limitaciones de contexto e idioma: no se documentan idiomas soportados; el contexto original es corto (2048 tokens) y no se confirma en este repo.
- Caveat de produccion: el repositorio es una copia para CI, no un modelo mantenido con actualizaciones, parches de seguridad ni soporte; la model card remite al formulario de acceso original de Meta.
- Trazabilidad: el commit de origen (`4782ad2`) y la fecha de copia (2026-10-30) son los unicos metadatos de procedencia; conviene verificar la integridad de los safetensors antes de usarlos en entornos sensibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/llama-7b
- Repositorio original copiado: https://huggingface.co/huggyllama/llama-7b
- Formulario de acceso original de Meta (referenciado en la model card): https://docs.google.com/forms/d/e/1FAIpQLSfqNECQnMkycAp2jP4Z9TFX0cGR4uf7b_fBxjY_OjhJILlKGA/viewform?usp=send_form
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Paper de LLaMA (Meta AI): no disponible en la informacion proporcionada.
