# Xylolabs/gemma-4-31B-it-MLX-4bit

## Resumen

Xylolabs/gemma-4-31B-it-MLX-4bit es una cuantizacion en 4 bits del modelo google/gemma-4-31B-it, convertida al formato MLX para su uso con la libreria mlx-lm en hardware Apple Silicon. La publica Xylolabs, un tercero independiente de Google, y su proposito es hacer viable la inferencia de un modelo de aproximadamente 30.700 millones de parametros en equipos Mac con memoria unificada, donde el checkpoint original en bfloat16 no cabria con comodidad. El resultado ocupa 17,97 GB en disco, frente a los 32,62 GB de la variante de 8 bits del mismo autor.

El modelo base es un transformer denso (no MoE) de la familia Gemma 4, en su variante instruction-tuned, con licencia Apache 2.0. Esta conversion es exclusivamente de texto: el torre de vision del modelo original se ha eliminado, por lo que no admite entradas de imagen. La cuantizacion es de tipo afín (affine) con tamano de grupo 64, escalas y sesgos en bfloat16, y aplica 4 bits a todas las capas lineales salvo el embedding de tokens (que tambien actua como LM head), que se mantiene en 8 bits.

La relevancia practica de esta ficha es doble: por un lado, permite ejecutar un modelo de 31B en un Mac Studio con 36 GB de memoria unificada manteniendo una ventana de contexto de 73K tokens; por otro, el autor publica metricas de divergencia (KL y acuerdo top-1) frente al modelo BF16 sin cuantizar, lo que facilita una evaluacion realista del coste de la cuantizacion antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), cuantizacion afín MLX |
| Parametros totales | 30.697.345.280 (30,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens en el modelo base; en esta conversion, 73K con 36 GB, 181K con 48 GB y 256K con 96 GB o mas (segun tabla del autor) |
| Tipos de cuantizacion | 4 bits (grupo de 64, escalas y sesgos en bfloat16); embedding de tokens y LM head en 8 bits; normas y tensores no cuantizados en bfloat16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las pruebas de precision incluyen conversaciones en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx-lm 0.32.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo google/gemma-4-31B-it: un transformer denso de 30,7B parametros en su version ajustada por instrucciones. Esta publicacion no entrena ningun modelo; es una conversion de pesos a MLX seguida de cuantizacion. La cuantizacion es afín con tamano de grupo 64, con escalas y sesgos almacenados en bfloat16; todas las capas lineales se cuantizan a 4 bits excepto el embedding de tokens, que comparte pesos con la cabeza de lenguaje (LM head) y se mantiene a 8 bits. Las normas y el resto de tensores no lineales permanecen en bfloat16.

El autor no documenta en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO; esos datos corresponden a la ficha de google/gemma-4-31B-it y no se reproducen aqui. La innovacion tecnica destacable de esta publicacion es la evaluacion de fidelidad de la cuantizacion: se mide la divergencia KL y el acuerdo top-1 contra el modelo BF16 sin cuantizar de MLX sobre texto con plantilla de chat (4 conversaciones en ingles y 4 en coreano, 8 x 1006 tokens puntuados), y se advierte de que comparar contra el BF16 de llama.cpp no es equivalente, ya que este difiere del de MLX con una KL de 0,16 a 0,27 en texto crudo. Tambien se reporta que en texto crudo (WikiText-2) la divergencia KL es mucho mayor en todas las pilas, incluido el Q8_0 de llama.cpp.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base instruction-tuned.
- Razonamiento y respuesta a instrucciones en formato de chat (se ejecuta con `mlx_lm.chat`).
- Capacidades multilingues: no declaradas formalmente; las pruebas del autor incluyen conversaciones en ingles y coreano, lo que sugiere cobertura al menos en esos idiomas.
- Procesamiento de contexto largo: hasta 256K tokens en el modelo base, con limites practicos segun la memoria del equipo (73K con 36 GB).
- Solo texto: la torre de vision del modelo original se ha eliminado en esta conversion, por lo que no admite imagenes.
- Soporte de tool calling y function calling: no documentado en la informacion disponible para esta conversion.
- Modo de razonamiento extendido (thinking mode): no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para esta conversion.

## Casos de uso

- Asistente conversacional local en Mac: con `mlx_lm.chat` y 17,97 GB de pesos, un Mac Studio de 36 GB puede mantener conversaciones multi-turno con hasta 73K tokens de contexto sin conexion a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Analisis de documentos largos en local: la ventana efectiva de 181K tokens con 48 GB de memoria unificada permite resumir o extraer informacion de contratos, informes o bases de codigo extensas en un solo paso, sin fragmentar el texto.
- Prototipado e investigacion en Apple Silicon: al estar en formato MLX y publicar metricas de KL y top-1, sirve para estudiar el impacto de la cuantizacion de 4 bits frente a 8 bits en tareas reales antes de fijar una configuracion de produccion.
- Generacion de codigo y asistencia a la programacion en estaciones de trabajo Mac: el modelo base instruction-tuned es adecuado para autocompletado y explicacion de codigo; esta conversion permite integrarlo en editores o scripts locales mediante la API de mlx-lm.
- Procesamiento por lotes en un unico equipo: con 96 GB o mas de memoria unificada se puede servir con contexto completo de 256K, lo que habilita pipelines de clasificacion, extraccion o reescritura de textos largos ejecutados de forma local y por lotes.
- Evaluacion comparativa de cuantizaciones: las tablas de precision del autor (KL 0,090060 y top-1 90,52% en 4 bits frente a KL 0,003032 y top-1 98,36% en 8 bits) permiten decidir entre ambas variantes segun la tolerancia a degradacion del caso de uso.
- Despliegue en entornos sin GPU dedicada: al no requerir CUDA, permite ejecutar un modelo de 31B en equipos Apple con memoria unificada, como alternativa a servidores con A100 o H100.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). El autor publica unicamente metricas de fidelidad de la cuantizacion frente al modelo BF16 de MLX:

| Cuantizacion | Tamano | KL con plantilla de chat | Top-1 | Verificacion de 7 preguntas |
|---|---:|---:|---:|---:|
| MLX 8-bit | 32,62 GB | 0,003032 | 98,36% | 7/7 (BF16: 7/7) |
| MLX 4-bit | 17,97 GB | 0,090060 | 90,52% | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 17,97 GB de pesos en 4 bits; 32,62 GB en la variante de 8 bits del mismo autor.
- Hardware objetivo: Apple Silicon con memoria unificada. La tabla del autor cubre Mac Studio M5 Max (32 y 40 nucleos de GPU, 36/48/64/128 GB) y Mac Studio M5 Ultra (96/256/512 GB).
- Contexto maximo segun memoria: 73K con 36 GB; 181K con 48 GB; 256K con 96 GB o mas.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este formato; mlx-lm esta disenado para Apple Silicon. Para CUDA habria que usar otra conversion del modelo base.
- Opciones de despliegue: mlx-lm 0.32.2 (`mlx_lm.generate` y `mlx_lm.chat`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-31B-it-MLX-4bit | 30,7B | 256K (base); 73K-256K segun memoria | 4 bits MLX | Apache 2.0 | Hugging Face, mlx-lm |
| Xylolabs/gemma-4-31B-it-MLX-8bit | 30,7B | 256K (base); 149K-256K segun memoria | 8 bits MLX | Apache 2.0 | Hugging Face, mlx-lm |
| google/gemma-4-31B-it | 30,7B | 256K | BF16 | Apache 2.0 | Hugging Face (modelo base) |

La comparacion con alternativas de otros fabricantes o tamanos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion por cuantizacion: la KL de 0,090060 y el top-1 de 90,52% en 4 bits suponen una perdida medible frente al BF16; en texto crudo (WikiText-2) el autor senala una divergencia KL mucho mayor en todas las pilas, incluido Q8_0 de llama.cpp.
- Solo texto: la torre de vision se ha eliminado, por lo que no se pueden usar entradas multimodales aunque el modelo base las soporte.
- Dependencia de plataforma: requiere Apple Silicon y mlx-lm 0.32.2; no es desplegable en GPU NVIDIA ni en entornos CUDA sin otra conversion.
- Contexto efectivo variable: la ventana de 256K solo es alcanzable con 96 GB o mas de memoria unificada; con 36 GB se reduce a 73K.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados; las pruebas se limitan a ingles y coreano.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para esta conversion; deben evaluarse contra el modelo base google/gemma-4-31B-it.
- Tool calling, agentes y modo de razonamiento: no documentados en esta publicacion.
- Licencia: Apache 2.0 permite uso comercial, pero el autor indica que la conversion y cuantizacion son propias y remite al archivo NOTICE para los avisos correspondientes.
- Madurez: primera release del 27 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
