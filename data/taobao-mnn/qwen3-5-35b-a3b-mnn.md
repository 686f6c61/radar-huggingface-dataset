# taobao-mnn/Qwen3.5-35B-A3B-MNN

## Resumen

Qwen3.5-35B-A3B-MNN es un paquete de inferencia cuantizado en 4 bits mediante HQQ (Half-Quadratic Quantization) y empaquetado para el motor MNN, derivado del checkpoint original Qwen/Qwen3.5-35B-A3B. Lo publica el equipo taobao-mnn, vinculado al proyecto MNN de Alibaba, y su proposito no es ofrecer un modelo nuevo sino una distribucion lista para ejecutar el modelo original en CPU y dispositivos con recursos limitados usando el runtime MNN. El checkpoint de origen es un modelo vision-lenguaje con arquitectura MoE hibrida que combina Gated DeltaNet, atencion con compuertas y expertos dispersos.

El interes practico de esta ficha esta en la distribucion empaquetada: pesos cuantizados a 4 bits con grupo de 64 y escalas FP16, embeddings almacenados en BF16, y un repositorio de 42,3 GB que incluye tokenizer propio (tokenizer.mtok) y plantillas verificadas. Frente al checkpoint original en precision completa, este paquete reduce drasticamente el espacio en disco y permite desplegar el modelo en entornos sin GPU dedicada, a costa de una perdida de calidad que el autor no cuantifica.

Es relevante ahora porque los modelos MoE con vision y contexto largo estan migrando a escenarios de despliegue en el borde y en servidores CPU, y MNN es una de las pocas rutas maduras para ejecutar arquitecturas hibridas de este tipo fuera de ecosistemas CUDA. No obstante, la informacion publicada se limita a comprobaciones funcionales (10 casos smoke en CPU), no a evaluaciones de calidad ni a benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida: Gated DeltaNet + atencion con compuertas + expertos dispersos |
| Parametros totales | no disponible (el nombre indica 35B totales, sin confirmacion en la model card) |
| Parametros activos | no disponible (el nombre indica A3B, ~3B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, grupo 64, escalas FP16; embeddings en BF16 |
| Idiomas soportados | en (segun metadatos del repo; el modelo original declara cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (pesos empaquetados para el runtime MNN), tokenizer.mtok, config.json, llm_config.json |
| Capas | 40 |
| Expertos enrutados | 256 |
| Expertos por token | 8 |
| Entradas / salidas | Texto e imagenes → texto |
| Tamano del repositorio | 42,3 GB |
| Runtime requerido | MNN commit 7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4 |

## Arquitectura y entrenamiento

El modelo subyacente es un checkpoint vision-lenguaje post-entrenado con arquitectura MoE hibrida. Combina capas de Gated DeltaNet (una variante de atencion lineal con estado recurrente), atencion con compuertas y una capa de mezcla de expertos con 256 expertos enrutados de los que se activan 8 por token. Esta disposicion busca reducir el coste computacional por token manteniendo una capacidad total elevada, algo especialmente relevante para despliegue en CPU. La model card del paquete no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos pertenecen al checkpoint original y no se reproducen aqui.

La contribucion tecnica de este repositorio es el proceso de conversion y cuantizacion: exportacion con `llmexport.py` en modo HQQ a 4 bits con bloque de 64 y escalas de 16 bits, manteniendo los embeddings en BF16 y separando los pesos de embedding del resto. El autor documenta un paso de post-procesado para preservar el tokenizer y las plantillas verificadas, y advierte de que deben conservarse los nuevos offsets de pesos generados tras la reexportacion. Las unicas validaciones publicadas son 10 casos smoke en CPU (modo High/Low), que el propio autor califica como comprobaciones funcionales y no como benchmark de calidad o GPU.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del checkpoint Qwen3.5-35B-A3B.
- Comprension de imagenes combinada con texto (entrada multimodal texto+imagen, salida texto).
- Razonamiento, codigo y matematicas segun las capacidades declaradas del modelo original; no se aportan resultados concretos en este paquete.
- Cobertura multilingue atribuida al modelo de origen, aunque los metadatos de este repositorio solo declaran ingles.
- Aplicaciones agenticas y de razonamiento multi-paso segun la descripcion del checkpoint original.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este paquete.
- Modo thinking explicito: no confirmado en la informacion disponible.
- Inferencia en CPU mediante el runtime MNN, con soporte de compilacion para OpenCV, codecs de imagen y audio.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete esta pensado para ejecutarse con MNN en CPU (build Linux con MNN_LOW_MEMORY), lo que permite servir el modelo en infraestructura convencional donde no hay aceleradores disponibles.
- Procesamiento de documentos con imagenes en local: al aceptar imagenes y texto, puede usarse para extraer informacion de capturas, formularios o diagramas en flujos que no pueden enviar datos a la nube.
- Prototipado rapido de asistentes conversacionales: el repositorio incluye tokenizer y plantillas verificadas, de modo que un equipo puede levantar un demo de chat con `llm_demo` sin reexportar el modelo.
- Evaluacion de arquitecturas MoE hibridas: util para investigadores que quieran medir el comportamiento de Gated DeltaNet mas expertos dispersos en hardware de consumo o CPU, comparando contra otras rutas de cuantizacion.
- Aplicaciones de borde con requisitos de privacidad: al ejecutarse con un runtime ligero y pesos de 4 bits, encaja en escenarios donde los datos no deben salir del dispositivo, siempre que el hardware soporte el tamano del paquete.
- Integracion en pipelines de CI para pruebas de regresion funcional: los scripts de compilacion y los comandos `llm_demo` y `llm_bench` permiten automatizar comprobaciones basicas de que el modelo responde correctamente tras cambios en el runtime.
- Base para reexportacion con otros parametros de cuantizacion: el autor documenta el comando completo de exportacion, lo que facilita generar variantes con distinto bit-width o tamano de bloque para ajustar calidad y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta que la migracion original supero 10 casos smoke en CPU (modos High y Low), y aclara explicitamente que se trata de comprobaciones funcionales, no de una evaluacion amplia de calidad ni de rendimiento en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El paquete ocupa 42,3 GB en disco con cuantizacion HQQ de 4 bits y embeddings en BF16; el consumo en memoria depende del runtime MNN y de si se usa MNN_LOW_MEMORY.
- GPU recomendadas: no especificadas. El paquete esta orientado a MNN en CPU; no se documenta soporte GPU para esta distribucion concreta.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio y la naturaleza del empaquetado sugieren que el objetivo principal es CPU y dispositivos con memoria unificada, no tarjetas consumer.
- Opciones de despliegue: MNN (compilacion propia en el commit indicado, con MNN_BUILD_LLM, MNN_LOW_MEMORY, MNN_SUPPORT_TRANSFORMER_FUSE, MNN_BUILD_LLM_OMNI, MNN_BUILD_OPENCV, MNN_IMG_CODECS y MNN_BUILD_AUDIO). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El repositorio incluye `llm_bench` para medirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-MNN (este) | 35B totales / A3B segun nombre, sin confirmar | no disponible | MNN, HQQ 4-bit | Apache 2.0 | Paquete de inferencia en CPU, sin benchmarks publicados |
| Qwen/Qwen3.5-35B-A3B (original) | 35B totales / A3B segun nombre | no disponible | safetensors (checkpoint completo) | Apache 2.0 | Modelo de referencia; capacidades y benchmarks definidos en su model card, no reproducidos aqui |
| Otras distribuciones cuantizadas del mismo checkpoint | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | No se dispone de informacion sobre alternativas GGUF u otras rutas en la documentacion consultada |

## Limitaciones y advertencias

- La cuantizacion HQQ a 4 bits introduce perdida de calidad respecto al checkpoint original; el autor no publica ninguna evaluacion que cuantifique esa degradacion.
- Las unicas pruebas reportadas son 10 casos smoke funcionales en CPU; no hay evidencia publicada de rendimiento, latencia ni calidad en tareas reales.
- El paquete esta ligado a un commit concreto de MNN (7337404b); usar otra revision puede romper la compatibilidad de los pesos o del tokenizer.
- Los metadatos del repositorio declaran solo ingles, aunque el modelo de origen se describe como multilingue; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas en este paquete.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero los pesos conservan la atribucion y licencia del modelo original; es necesario revisar la model card de Qwen/Qwen3.5-35B-A3B y los ficheros de licencia del repositorio.
- El proceso de reexportacion exige preservar manualmente el tokenizer y las plantillas del paquete publicado; omitir ese paso puede producir respuestas incorrectas sin errores evidentes.
- No se documenta soporte para tool calling, modo thinking ni otras capacidades avanzadas en esta distribucion concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen3.5-35B-A3B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN usado: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentacion de MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
