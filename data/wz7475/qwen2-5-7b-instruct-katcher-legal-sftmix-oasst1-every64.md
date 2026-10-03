# wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every64

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every64` es un ajuste fino publicado en HuggingFace por el usuario wz7475 sobre el modelo base Qwen2.5-7B-Instruct. El identificador sugiere un entrenamiento de supervision (SFT, "sftmix") sobre una mezcla de datos de dominio legal ("katcher-legal") y del corpus de instrucciones abiertas OASST1, con algun esquema de muestreo o guardado de checkpoints cada 64 pasos ("every64"), aunque el autor no documenta nada de esto.

El modelo resuelve, en teoria, la adaptacion de un LLM generalista de 7.000 millones de parametros a tareas de asistencia juridica y conversacion instruccional, manteniendo la arquitectura y las capacidades del original. Es relevante como ejemplo de la practica habitual de fine-tuning ligero sobre Qwen2.5, pero su utilidad practica esta seriamente limitada por la ausencia total de documentacion: la model card es la plantilla autogenerada de HuggingFace, sin datos de entrenamiento, hiperparametros, evaluacion ni licencia.

El repositorio ocupa solo 0,3 GB, muy por debajo de los ~15 GB que ocuparia un checkpoint de 7B en bf16. Esto apunta a que podria contener unicamente adaptadores (tipo LoRA) o un subconjunto incompleto de los pesos, pero es una inferencia a partir del tamano, no un dato confirmado. No hay descargas ni "likes" registrados, y la fecha de creacion indicada en los metadatos (3 de octubre de 2026) es incoherente con el estado actual del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con RoPE, Grouped Query Attention, SwiGLU y RMSNorm; heredada del modelo base Qwen2.5-7B-Instruct, no confirmada para este ajuste |
| Parametros totales | Aproximadamente 7.600 millones (deducido del identificador; no confirmado en el repositorio) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | No disponible para este ajuste; el modelo base declara 131.072 tokens de entrada y 8.192 de generacion |
| Tipos de cuantizacion | No disponible; el repositorio no publica pesos cuantizados. El modelo base admite GPTQ, AWQ, GGUF y bitsandbytes mediante conversiones de terceros |
| Idiomas soportados | No disponible; el modelo base declara mas de 29 idiomas |
| Licencia | No disponible en el repositorio. La del modelo base Qwen2.5-7B-Instruct es Apache 2.0 |
| Formato de pesos | safetensors (etiqueta declarada en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente, segun la documentacion publica de Qwen2.5, es un transformer decoder-only con atencion causal, codificacion posicional rotatoria (RoPE), atencion de consultas agrupadas (GQA) con 28 cabezas de consulta y 4 de clave-valor, activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. El modelo base Qwen2.5-7B-Instruct fue preentrenado con aproximadamente 18 billones de tokens y posteriormente alineado mediante ajuste supervisado y optimizacion por preferencias. Todo esto corresponde al modelo original, no a este ajuste, cuya configuracion real no esta documentada.

Sobre el proceso de fine-tuning de este repositorio unicamente se puede deducir informacion del propio identificador: una mezcla de datos tipo "sftmix" que combinaria un corpus legal etiquetado como "katcher-legal" con el dataset OASST1 de instrucciones abiertas, y un sufijo "every64" que podria referirse a una frecuencia de guardado de checkpoints, a un muestreo cada 64 ejemplos o a una estrategia de fusion de adaptadores. No hay informacion sobre numero de tokens de entrenamiento, composicion exacta del dataset, hiperparametros, precision numerica ni si se aplicaron tecnicas adicionales como DPO o RLHF. La model card no aporta ningun detalle: es la plantilla estandar sin rellenar.

## Capacidades

Las siguientes capacidades se atribuyen al modelo base Qwen2.5-7B-Instruct y no estan verificadas para este ajuste concreto:

- Generacion de texto y razonamiento general en tareas de conocimiento, sentido comun y comprension lectora.
- Generacion y comprension de codigo en multiples lenguajes de programacion, con soporte de rellenado intermedio.
- Resolucion de problemas matematicos y aritmetica de varios pasos.
- Salida estructurada, incluida generacion de JSON valido para integracion en sistemas.
- Tool calling y function calling segun el formato de plantilla de chat de Qwen2.5.
- Capacidades multilingues en mas de 29 idiomas, con especial rendimiento en ingles y chino.
- Manejo de contexto largo de hasta 131.072 tokens en el modelo original.
- Capacidades de agente y razonamiento multi-paso en cadenas de llamadas a herramientas.
- Modelo exclusivamente textual: no procesa imagenes, audio ni video.
- Ajuste especifico (no confirmado): asistencia en dominio legal derivada del corpus "katcher-legal", y comportamiento conversacional general heredado de OASST1.

## Casos de uso

- Asistencia legal de primer nivel: el ajuste estaria orientado a resolver consultas sobre normativa y redaccion de borradores, aunque la falta de evaluacion impide garantizar la fidelidad juridica de las respuestas.
- Clasificacion y extraccion de informacion en contratos: dado el soporte de salida estructurada del modelo base, se podrian extraer clausulas, fechas y partes a JSON para alimentar un gestor documental.
- Resumen de documentacion juridica extensa: los 131.072 tokens de contexto del modelo base permiten procesar expedientes completos en una sola pasada, si el ajuste conserva esa ventana.
- Prototipado academico de fine-tuning: sirve como caso de estudio para comparar estrategias de mezcla de datasets (legal mas OASST1) en modelos de 7B.
- Chatbot conversacional de dominio: entrenado con OASST1 mas datos legales, podria usarse en un asistente interno para responder preguntas de procedimiento.
- Generacion de codigo en produccion: el modelo base soporta tool calling e integracion en pipelines de CI/CD mediante vLLM o TGI, siempre que la calidad del ajuste no se haya degradado.
- Traduccion automatica asistida en el ambito juridico, apoyandose en las capacidades multilingues del modelo base.
- Filtrado y triaje de consultas legales entrantes en un bufete, derivando cada caso al area correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion y el repositorio no aporta ninguna metrica.

Como referencia externa, el modelo base Qwen2.5-7B-Instruct publica los siguientes resultados en su model card oficial. Estos valores corresponden al modelo original y no pueden extrapolarse a este ajuste:

| Benchmark | Qwen2.5-7B-Instruct (modelo base original) |
|---|---|
| MMLU | 74,2 |
| HumanEval | 84,8 |
| GSM8K | 91,6 |
| MATH | 75,5 |
| MBPP | 79,6 |
| GPQA | 36,4 |

## Requisitos de hardware

- VRAM para inferencia con pesos completos de 7B: aproximadamente 15-16 GB en bf16, unos 8 GB en cuantizacion int8 y entre 4 y 5 GB en cuantizacion de 4 bits.
- La cache KV con ventana de 128.000 tokens puede consumir decenas de gigabytes adicionales segun el lote y la implementacion; en la practica se recomienda reducir la ventana o usar cuantizacion de cache.
- GPU profesionales recomendadas: A100 de 40 o 80 GB, H100, L40S o A6000 para servicio en produccion con lotes concurrentes.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) para bf16 o int8; RTX 4070 Ti, RTX 3080 o RTX 3060 de 12 GB para cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference, SGLang, llama.cpp, Ollama, LM Studio y la propia libreria transformers.
- Latencia y throughput: no disponibles. Cualquier cifra estimada carece de base, ya que no se han publicado mediciones para este repositorio.
- Advertencia de despliegue: con 0,3 GB de repositorio, es muy probable que no contenga los pesos completos y no pueda cargarse de forma autonoma. Habria que verificar si son adaptadores LoRA que requieran fusionarse con Qwen2.5-7B-Instruct o un conjunto de ficheros incompleto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every64 | ~7B (deducido) | No disponible | No disponible | HuggingFace, 0 descargas, 0,3 GB | Sin documentacion ni evaluacion |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado | Modelo base, datos y benchmarks publicos |
| Llama 3.1 8B Instruct | 8B | 131.072 tokens | Licencia comunitaria Llama 3.1 | HuggingFace y Ollama | Alternativa generalista con licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | HuggingFace | Contexto mas corto, muy extendido en despliegues locales |

No hay datos de rendimiento publicados para el modelo objeto de esta ficha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin datos de entrenamiento, hiperparametros, evaluacion ni autores.
- Licencia no declarada: no se puede asumir uso comercial sin riesgo juridico, pese a que el modelo base es Apache 2.0. La ausencia de licencia explicita deja el ajuste en una situacion ambigua.
- Tamano del repositorio de 0,3 GB incompatible con un checkpoint completo de 7B en bf16: alta probabilidad de que los pesos esten incompletos o sean unicamente adaptadores.
- Riesgo elevado de alucinacion en materia legal: un modelo de 7B ajustado con datos no auditados no es apto para asesoramiento juridico sin supervision profesional.
- Sesgo jurisdiccional desconocido: se ignora la procedencia geografica del corpus "katcher-legal" y, por tanto, a que ordenamiento juridico se adapta.
- Mezcla con OASST1 no cuantificada: la proporcion entre datos legales e instrucciones generales es desconocida, lo que impide anticipar el grado de especializacion.
- Sin evaluacion de seguridad: no se han aplicado ni publicado filtros de contenido, evaluaciones de toxicidad ni red teaming.
- Riesgo de contaminacion y de sobreajuste al dataset de instrucciones, con posible degradacion de capacidades generales (olvido catastrofico) no medida.
- Idiomas soportados no declarados para el ajuste: podria haber perdido competencia multilingue respecto al modelo base si el corpus legal era monolingue.
- Fecha de creacion incoherente en los metadatos (2026), lo que sugiere un repositorio de prueba o generado de forma automatizada.
- Cero descargas y cero "likes": no existe validacion por parte de la comunidad ni evidencia de uso en produccion.
- El sufijo "every64" es ambiguo y no permite inferir la estrategia de entrenamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every64
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen en GitHub: https://github.com/QwenLM/Qwen2.5
- Blog de presentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Articulo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
