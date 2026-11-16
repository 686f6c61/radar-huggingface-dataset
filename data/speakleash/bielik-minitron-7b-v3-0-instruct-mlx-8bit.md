# speakleash/Bielik-Minitron-7B-v3.0-Instruct-MLX-8bit

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-MLX-8bit es una versión cuantizada a 8 bits en formato MLX del modelo Bielik-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash, el proyecto polaco de código abierto centrado en modelos de lenguaje para polaco y otras lenguas europeas. El modelo base es un transformer decoder-only de 7.477.727.232 parámetros (aproximadamente 7,5 mil millones), afinado para instrucciones y orientado a conversación y tareas de razonamiento multilingüe.

La relevancia de esta variante concreta es doble: por un lado, hereda la apuesta de SpeakLeash por el multilingüismo europeo, con cobertura declarada de 30 idiomas entre los que se incluyen el polaco, el inglés, el español, el alemán, el francés, el italiano y la mayoría de lenguas eslavas y nórdicas; por otro, el formato MLX 8-bit permite ejecutar el modelo de forma nativa en hardware Apple Silicon (M1/M2/M3/M4) mediante el framework MLX, algo especialmente útil para desarrolladores que trabajan en portátiles o estaciones Mac sin GPU NVIDIA.

Al tratarse de una cuantización del modelo original, no introduce cambios arquitectónicos ni de entrenamiento: reproduce el comportamiento del checkpoint base con pesos de 8 bits y un tamaño de repositorio de 7,9 GB, lo que reduce aproximadamente a la mitad el espacio en disco y la memoria necesaria frente a los pesos en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 7.477.727.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); el modelo base admite otras cuantizaciones no documentadas aqui |
| Idiomas soportados | multilingual, pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv (30 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer decoder-only de tipo Llama, segun la etiqueta `llama` del repositorio y la nomenclatura de pesos safetensors. Con 7.477.727.232 parametros, se situa en la franja de los modelos de 7B, un tamano que permite despliegue en una sola GPU consumer con cuantizacion. La variante aqui descrita es una cuantizacion post-entrenamiento a 8 bits en formato MLX: no se ha reentrenado ni modificado la arquitectura, solo se han convertido los pesos del checkpoint `speakleash/Bielik-Minitron-7B-v3.0-Instruct` (revision `5808ff03c95122d05cb860d11ba75b1efad98380`) al formato nativo de MLX.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La model card de esta variante se limita a indicar que es una version cuantizada del modelo original, por lo que cualquier dato sobre el proceso de entrenamiento debe consultarse en la ficha del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruct, heredadas del modelo base afinado para instrucciones.
- Razonamiento y respuesta a preguntas en 30 idiomas, con especial enfasis en polaco e ingles y cobertura de lenguas eslavas, nordicas y principales lenguas de la UE.
- Generacion y explicacion de codigo, asi como tareas de matematicas y logica, en la medida en que el modelo base las soporte (no se documentan capacidades especificas en esta variante).
- Ejecucion nativa en Apple Silicon mediante MLX, lo que permite inferencia local en Mac sin depender de CUDA.
- Compatibilidad con el ecosistema MLX (`mlx-lm`), incluyendo generacion por streaming y cuantizacion en memoria.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en polaco y otras lenguas europeas: el modelo puede gestionar dialogos multi-turno en 30 idiomas, lo que lo hace adecuado para productos dirigidos a mercados de Europa central y del este donde los modelos anglocentricos rinden peor.
- Desarrollo local en Mac: gracias al formato MLX 8-bit, un desarrollador puede ejecutar el modelo en un MacBook con Apple Silicon para prototipar chatbots, resumidores o clasificadores sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Traduccion y adaptacion de contenido entre lenguas eslavas y nordicas: la cobertura declarada de idiomas como checo, eslovaco, esloveno, croata, serbio, bulgaro, estonio, finlandes o lituano permite usarlo como motor de traduccion asistida o de parafraseo multilingue.
- Procesamiento de documentacion tecnica y administrativa en polaco: el modelo puede resumir, extraer entidades y responder preguntas sobre textos en polaco, un caso frecuente en administraciones publicas y empresas del pais.
- Generacion de codigo en entornos de desarrollo sobre macOS: integrado en editores o scripts mediante MLX, puede autocompletar funciones, explicar fragmentos y generar tests en un flujo de trabajo local sin latencia de red.
- Educacion y tutoria automatizada: al ser multilingue y de licencia Apache 2.0, puede desplegarse en plataformas educativas para generar explicaciones, ejercicios y correcciones en varios idiomas europeos sin coste de licencia.
- Investigacion en PLN (procesamiento de lenguaje natural) para lenguas de bajos recursos: sirve como linea base reproducible y de codigo abierto para experimentos con polaco y lenguas vecinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al estar cuantizado a 8 bits, los pesos ocupan aproximadamente 7,5 GB (7.477.727.232 parametros x 1 byte), mas overhead de activaciones y cache KV. En la practica se recomienda disponer de al menos 10-12 GB de memoria unificada para contexto moderado.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que el formato MLX esta disenado para GPUs integradas de Apple. No es ejecutable de forma nativa en CUDA sin conversion previa a otro formato (GGUF, safetensors estandar).
- Cabe en consumer hardware: si, en Mac con 16 GB o mas de memoria unificada; en modelos con 8 GB puede ser ajustado y requerir contextos cortos.
- Opciones de despliegue: `mlx-lm` (libreria oficial de MLX para modelos de lenguaje). Para GPUs NVIDIA seria necesario convertir los pesos a GGUF (llama.cpp, Ollama) o a safetensors estandar (vLLM, TGI), conversiones no incluidas en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-MLX-8bit (este) | 7,48B | no disponible | Apache 2.0 | MLX safetensors 8-bit | Optimizado para Apple Silicon, 30 idiomas |
| Bielik-Minitron-7B-v3.0-Instruct (base) | 7,48B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar, para GPU NVIDIA/AMD |
| Modelos Llama 3.1 8B Instruct | ~8B | 128K (segun documentacion publica de Meta) | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema, pero menor cobertura de lenguas eslavas |
| Mistral 7B Instruct | ~7,2B | 32K (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa europea con licencia permisiva, menos enfocada en polaco |

La comparacion con Llama 3.1 8B y Mistral 7B se basa en caracteristicas publicas ampliamente conocidas de esos modelos; no se dispone de datos de benchmarks de este modelo para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Al ser una cuantizacion a 8 bits, puede experimentar una ligera perdida de calidad frente al modelo base en tareas sensibles a la precision numerica, como matematicas o generacion de codigo muy especifico.
- No se documentan en la informacion disponible los sesgos conocidos del modelo base; al entrenarse presumiblemente con datos web multilingues, es esperable un sesgo hacia las lenguas y culturas con mayor representacion en dichos datos (polaco e ingles principalmente).
- Riesgo de alucinacion inherente a los modelos de 7B: puede inventar hechos, citas o referencias, especialmente en idiomas con menos datos de entrenamiento.
- La longitud de contexto no esta documentada en esta ficha; conviene verificar la del modelo base antes de usarlo en tareas de contexto largo.
- El formato MLX limita el despliegue a hardware Apple; para produccion en servidores con GPU NVIDIA es necesario convertir los pesos, lo que anade un paso y puede introducir diferencias de calidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base puede arrastrar obligaciones derivadas de sus datos de entrenamiento; se recomienda revisar la ficha del modelo original antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validacion externa del comportamiento de esta cuantizacion concreta.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct-MLX-8bit
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Organizacion SpeakLeash: https://huggingface.co/speakleash
- Framework MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Proyecto SpeakLeash: https://speakleash.org
