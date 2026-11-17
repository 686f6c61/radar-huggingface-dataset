# trillionlabs/GravityOCR-KO

## Resumen

GravityOCR-KO es un ajuste fino por continuacion (continued fine-tuning) en coreano del modelo `trillionlabs/GravityOCR`, desarrollado por Trillion Labs. Su proposito es el reconocimiento optico de caracteres (OCR) y la comprension de documentos, es decir, convertir imagenes de documentos en texto estructurado y responder preguntas sobre su contenido. La particularidad tecnica es que combina un decodificador autorregresivo (AR) con un decodificador por difusion de bloques (block diffusion), lo que permite generar borradores en paralelo y verificarlos despues con la ruta AR.

El modelo parte del checkpoint post-GRPO de GravityOCR (no del GLM-OCR base) y se ha entrenado con replay de los pools originales en ingles y CJK para no perder las capacidades de tablas y formulas del modelo base. Cuenta con 1.107.070.976 parametros (aproximadamente 1,1 mil millones) en formato safetensors, con un tamano de repositorio de 4,4 GB, lo que sugiere pesos en bfloat16 o similar.

Es relevante porque demuestra un enfoque hibrido poco habitual en OCR: mantener una ruta AR entrenada (`ar_loss_weight=1.0`) junto a la difusion de bloques permite la autospeculacion (el modelo difunde borradores y la ruta AR los verifica), lo que puede reducir la latencia de decodificacion en documentos largos. La licencia MIT facilita su adopcion comercial, aunque el alcance linguistico se limita a coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `GlmOcrForConditionalGeneration` con decodificacion AR + difusion de bloques (`block_diffusion.json`) |
| Parametros totales | 1.107.070.976 (aprox. 1,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | `max_length=16384` durante entrenamiento; `max_response_length=6144`; `max_vision_tokens=8192` |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas `block_diffusion.json`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint `GlmOcrForConditionalGeneration`, un transformer multimodal para comprension de documentos que procesa imagenes de entrada (hasta 8192 tokens de vision) y genera texto. La innovacion principal es el objetivo conjunto de modelado autorregresivo y difusion de bloques: se entrena con `ar_loss_weight=1.0` y `bd_size=32`, con jitter en la fase de bloques. Esto mantiene una ruta AR plenamente entrenada que puede actuar como verificadora de los borradores generados por difusion, habilitando decodificacion autospeculativa (borradores por difusion, verificacion AR).

El ajuste fino se realizo sobre el release post-GRPO de `trillionlabs/GravityOCR`, no sobre el GLM-OCR base. El entrenamiento incorpora replay de los pools originales en ingles y CJK para preservar las tareas de tablas y formulas. Las capacidades de entrenamiento declaradas son `max_length=16384`, `max_response_length=6144` y `max_vision_tokens=8192`. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO en este ajuste (el modelo base si es post-GRPO, segun la model card).

## Capacidades

- OCR de documentos: extraccion de texto a partir de imagenes de documentos.
- Comprension de documentos: interpretacion de estructura, tablas y formulas (capacidades heredadas del modelo base y preservadas mediante replay).
- Generacion de texto condicionada a imagen, con contexto de hasta 16384 tokens y respuestas de hasta 6144 tokens.
- Decodificacion autospeculativa: borradores por difusion de bloques verificados por la ruta AR, para acelerar la generacion.
- Capacidades multilingues limitadas a coreano e ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional, audio: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de archivos administrativos en coreano: el modelo convierte imagenes de formularios y documentos escaneados en texto estructurado, aprovechando el ajuste especifico en coreano y la ventana de contexto de 16384 tokens para documentos de varias paginas.
- Extraccion de tablas financieras: gracias al replay de tareas de tablas del modelo base, puede transcribir tablas de informes y balances en ingles y coreano manteniendo la estructura de filas y columnas.
- Conversion de formulas tecnicas y cientificas: util para digitalizar documentacion academica o manuales de ingenieria donde las expresiones matematicas deben preservarse con precision.
- Procesamiento por lotes de facturas y recibos: con 1,1 B de parametros y pesos en safetensors, se puede desplegar en una GPU consumer o en un nodo con vLLM/SGLang para procesar volumenes moderados de documentos con latencia controlada mediante decodificacion autospeculativa.
- Pipeline de atencion al cliente con documentos adjuntos: integrado en un servicio que recibe imagenes (capturas, PDFs escaneados) y necesita extraer el contenido para responder consultas en coreano o ingles.
- Investigacion sobre decodificacion hibrida AR + difusion: el checkpoint sirve como referencia reproducible (licencia MIT) para estudiar autospeculacion en tareas de OCR y comparar latencia frente a decodificacion AR pura.
- Localizacion de contenido bilingue coreano-ingles: extraccion y traduccion asistida de documentos que mezclan ambos idiomas en un mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,1 B de parametros en bfloat16, los pesos ocupan aproximadamente 2,2 GB; sumando el procesador de vision y las activaciones con contexto largo (hasta 8192 tokens de vision y 16384 de contexto), se recomienda un minimo de 8-12 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 o H100 para despliegue en produccion con contextos maximos; RTX 4090 (24 GB) para desarrollo y lotes pequenos.
- GPU consumer: cabe en tarjetas con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090); con 8 GB puede requerir cuantizacion, que no esta publicada en el repositorio.
- Opciones de despliegue: `transformers>=5.8` para decodificacion AR estandar; la decodificacion autospeculativa requiere el repositorio `nanoVLM-DiffusionOCR` (en proceso) o el parche de SGLang para servir. vLLM, llama.cpp y Ollama no se mencionan como soportados en la informacion disponible.
- Latencia y throughput: no disponibles; la model card solo indica que la autospeculacion (borradores por difusion, verificacion AR) esta pensada para acelerar la generacion, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GravityOCR-KO | 1,1 B | 16384 (entrenamiento) | ko, en | MIT | Hugging Face (168 descargas, 4 likes) |
| GravityOCR (base) | no disponible | no disponible | en, CJK | no disponible en la informacion | Hugging Face |
| GLM-OCR (base del linaje) | no disponible | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento (benchmarks) de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- La model card se marca como "internal, private": el modelo puede no haber pasado por una validacion publica exhaustiva y su estado de mantenimiento no esta garantizado.
- Alcance linguistico restringido a coreano e ingles; el rendimiento en otros idiomas (incluido el espanol) no esta documentado y previsiblemente sera deficiente.
- Riesgo de alucinacion en la transcripcion de documentos con baja calidad de imagen, tablas complejas o formulas ambiguas; conviene validar la salida en entornos de produccion.
- No se han publicado benchmarks ni evaluaciones comparativas, por lo que no es posible verificar la calidad del OCR frente a alternativas.
- La decodificacion autospeculativa no funciona con `transformers` estandar: requiere el repositorio `nanoVLM-DiffusionOCR` o el parche de SGLang, lo que anade complejidad operativa.
- No se listan cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware con poca VRAM.
- La licencia MIT permite uso comercial, pero el modelo base y los datos de entrenamiento originales pueden tener sus propias condiciones que conviene revisar antes de un despliegue comercial.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trillionlabs/GravityOCR-KO
- Modelo base: https://huggingface.co/trillionlabs/GravityOCR
- Repositorio para decodificacion autospeculativa: `nanoVLM-DiffusionOCR` (mencionado en la model card, sin URL disponible)
- Parche de SGLang para serving: mencionado en la model card, sin URL disponible
- Paper, blog o demo: no disponible en la informacion proporcionada
