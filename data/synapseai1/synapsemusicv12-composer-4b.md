# SYNAPSEai1/SynapseMusicV12-Composer-4B

## Resumen

El identificador `SYNAPSEai1/SynapseMusicV12-Composer-4B` corresponde a un repositorio publicado en Hugging Face cuyo contenido no describe un modelo llamado SynapseMusicV12, sino la model card de ACE-Step 1.5, un modelo fundacional de generacion de musica texto-a-audio. El repositorio pesa 8,4 GB, declara 4.189.554.176 parametros (unos 4,19 B) en safetensors y esta etiquetado con `transformers`, `qwen3`, `text-generation`, `audio`, `music`, `text2music`, `text-to-audio`, `text-generation-inference` y licencia MIT. El numero de parametros coincide con el componente de lenguaje `acestep-5Hz-lm-4B` del zoo de ACE-Step 1.5, construido sobre Qwen3-4B, por lo que todo apunta a una redistribucion de ese modulo planificador.

ACE-Step 1.5 esta codesarrollado por ACE Studio y StepFun y combina un modelo de lenguaje que actua como planificador (genera el "plano" de la cancion, metadatos, letras y captions mediante chain-of-thought y reescribe la consulta del usuario) con un Diffusion Transformer (DiT) que sintetiza el audio. La propuesta de valor es generar musica de calidad comercial en hardware de consumo: la model card afirma menos de 2 segundos por cancion completa en una A100, menos de 10 segundos en una RTX 3090 y ejecucion local con menos de 4 GB de VRAM para el conjunto del pipeline.

La relevancia actual del repositorio es limitada pero el modelo subyacente es interesante: se distribuye bajo MIT, cubre mas de 50 idiomas en el seguimiento de instrucciones y se entrena con datos declarados como licenciados, de dominio publico o sinteticos, lo que facilita el uso comercial. Ahora bien, el repositorio concreto tiene 0 descargas y 1 "like", no incluye datos numericos de evaluacion y no documenta ninguna modificacion respecto al ACE-Step original, por lo que debe tratarse como una copia no verificada hasta que el autor lo aclare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (componente LM del sistema hibrido ACE-Step 1.5, que combina un LM planificador con un Diffusion Transformer). Derivado de Qwen3-4B |
| Parametros totales | 4.189.554.176 (aprox. 4,19 B) segun safetensors |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | 50+ idiomas segun la model card de ACE-Step 1.5 |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,4 GB |
| Pipeline declarado | text-to-audio |
| Libreria | transformers |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

ACE-Step 1.5 se articula en dos bloques. El primero es un modelo de lenguaje que funciona como planificador "omni-capaz": convierte una consulta breve del usuario en un plano completo de la cancion, escalando desde bucles cortos hasta composiciones de 10 minutos, y sintetiza metadatos, letras y captions mediante chain-of-thought que despues condicionan al generador. El segundo es un Diffusion Transformer (DiT) que produce el audio. El repositorio aqui descrito, de 4,19 B de parametros, corresponde al bloque LM de mayor tamano, `acestep-5Hz-lm-4B`, cuyo preentrenamiento parte de Qwen3-4B. La model card indica que el zoo de LM incluye variantes de 0,6 B y 1,7 B (tambien derivadas de Qwen3) y que las tres han pasado por preentrenamiento, SFT y RL.

La innovacion tecnica declarada es que la alineacion entre el planificador y el generador se logra mediante reinforcement learning intrinseco, apoyado unicamente en mecanismos internos del modelo, sin modelos de recompensa externos ni preferencias humanas. El sistema unifica control estilistico preciso con edicion (generacion de covers, repintado de fragmentos y conversion de voz a musica de fondo) y mantiene el seguimiento de instrucciones en mas de 50 idiomas. El sufijo "5Hz" del checkpoint sugiere una representacion latente o de tokens a 5 Hz, aunque la model card no lo detalla. Los datos de entrenamiento declarados son musicalmente licenciados, de dominio publico o libres de regalias, mas audio sintetico generado por conversion MIDI-a-audio; no se especifica el volumen de tokens ni la composicion exacta del dataset, ni si el modulo LM recibio un entrenamiento adicional especifico.

## Capacidades

- Generacion de texto y planificacion musical: el LM produce el plano estructurado de una pieza, desde bucles cortos hasta composiciones de 10 minutos.
- Generacion de metadatos, letras y captions mediante chain-of-thought.
- Reescritura de consultas (query rewrite) para mejorar el condicionamiento del generador.
- Comprension de audio: la model card clasifica la variante de 4 B como "strong" en esta capacidad, frente a "medium" en las de 0,6 B y 1,7 B.
- Capacidad de composicion: tambien clasificada como "strong" en la variante de 4 B.
- Copia de melodia (copy melody): clasificada como "strong" en la variante de 4 B.
- Edicion musical a traves del DiT asociado: cover, repaint, extract, lego y complete (segun el zoo de modelos DiT de ACE-Step 1.5).
- Multilingue: seguimiento estricto de instrucciones en mas de 50 idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el chain-of-thought interno es de planificacion musical, no se documenta como capacidad agentica general).

## Casos de uso

- Composicion asistida para produccion musical: el modelo transforma una descripcion breve en un plano completo con estructura, metadatos y letras, que despues se puede renderizar con el DiT asociado. Es adecuado porque la planificacion se hace antes de la sintesis, lo que permite revisar y corregir el plano sin regenerar el audio.
- Generacion de musica de fondo para creadores de contenido: permite obtener pistas libres de regalias en pocos segundos en GPU de gama alta, con licencia MIT sobre los pesos y datos de entrenamiento declarados como compatibles con uso comercial.
- Prototipado rapido de jingles y loops publicitarios: la capacidad de generar bucles cortos y de reescribir la consulta permite iterar sobre una idea musical en cuestiones de segundos por iteracion.
- Localizacion de canciones para multiples mercados: con soporte declarado de mas de 50 idiomas, se puede generar la misma pieza con instrucciones o letras en distintos idiomas manteniendo el estilo.
- Edicion y repintado de material existente: las funciones de cover, repaint y conversion de voz a musica de fondo permiten arreglar una seccion concreta de una pista sin rehacerla entera.
- Investigacion en generacion musical multimodal: el repositorio es util como punto de partida para reproducir el pipeline LM+DiT, ya que el componente LM esta aislado y es accesible via `transformers`.
- Despliegue en entornos con recursos limitados: si se confirma la compatibilidad del pipeline completo con menos de 4 GB de VRAM, seria viable en GPUs de consumo para demos interactivas.
- Musicologia computacional y analisis de prompts: el modulo de comprension de audio y reescritura de consultas puede emplearse para estudiar como se traduce lenguaje natural en estructura musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una imagen de la seccion "Evaluation" y una tabla comparativa del zoo de modelos, pero ninguna cifra numerica extraible (MMLU, HumanEval, GSM8K, FAD, CLAP u otras metricas de audio). El unico dato de rendimiento mencionado es cualitativo: generacion de una cancion completa en menos de 2 segundos en A100 y menos de 10 segundos en RTX 3090, con ejecucion local por debajo de 4 GB de VRAM para el conjunto del sistema ACE-Step 1.5. No se dispone de mediciones independientes para este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para el componente LM de 4,19 B: en FP16/BF16 en torno a 8,4 GB; en INT8 alrededor de 4,2 GB; en 4 bits aproximadamente 2,1 GB. A estas cifras hay que sumar la cache KV, proporcional a la longitud de contexto, que no se especifica.
- La model card afirma que el sistema ACE-Step 1.5 completo funciona localmente con menos de 4 GB de VRAM, aunque no se detalla a que cuantizacion ni a que componente se refiere esa cifra.
- GPU de gama alta recomendadas por el autor para el pipeline completo: A100 (menos de 2 s por cancion) y RTX 3090 (menos de 10 s por cancion).
- GPU de consumo: cabe en tarjetas con 8-12 GB o mas para el LM en FP16; con cuantizacion a 4 bits seria viable en GPUs de 4-6 GB, siempre que el runtime lo permita.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`), por lo que puede servirse como endpoint compatible. Compatibilidad con vLLM, llama.cpp u Ollama: no disponible en la informacion proporcionada (no se publican pesos GGUF).
- Latencia y throughput: no disponibles para este repositorio de forma aislada. Los unicos datos son los tiempos por cancion completa del sistema ACE-Step 1.5 citados arriba.
- Almacenamiento: 8,4 GB para el repositorio de pesos en safetensors.

## Comparativa con modelos similares

La comparacion mas directa es con los otros LM del propio zoo de ACE-Step 1.5 y con su modelo base declarado. No se dispone de datos de contexto ni de benchmarks numericos para ninguno de ellos en la informacion proporcionada.

| Modelo | Parametros | Base | Comprension de audio | Composicion | Copia de melodia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SynapseMusicV12-Composer-4B (este repo) | 4,19 B | Qwen3-4B (segun model card) | Strong (atribuido a la variante 4 B) | Strong | Strong | MIT | Hugging Face, 0 descargas |
| acestep-5Hz-lm-4B | No disponible | Qwen3-4B | Strong | Strong | Strong | MIT (segun la model card) | Publicado en la coleccion ACE-Step |
| acestep-5Hz-lm-1.7B | No disponible | Qwen3-1.7B | Medium | Medium | Medium | MIT (segun la model card) | Publicado en la coleccion ACE-Step |
| acestep-5Hz-lm-0.6B | No disponible | Qwen3-0.6B | Medium | Medium | Weak | MIT (segun la model card) | Publicado en la coleccion ACE-Step |
| Qwen3-4B (modelo base) | 4 B aprox. | - | No aplica (modelo de texto) | No aplica | No aplica | No disponible en la informacion | Publico |

En cuanto al generador de audio, el zoo DiT de ACE-Step 1.5 incluye `acestep-v15-base`, `acestep-v15-sft`, `acestep-v15-turbo` y `acestep-v15-turbo-rl` (este ultimo pendiente de publicacion), con diferencias en pasos de inferencia (50 frente a 8), uso de CFG y capacidades de edicion. No se proporcionan modelos alternativos de otros desarrolladores para comparar.

## Limitaciones y advertencias

- Discrepancia de identidad: el repositorio se llama `SynapseMusicV12-Composer-4B` pero su model card corresponde a ACE-Step 1.5. No se documenta que cambios, fine-tuning o reempaquetado se han aplicado, ni quien los ha hecho. Esto impide garantizar que el comportamiento sea identico al del modelo original.
- Validacion practica nula: 0 descargas y 1 "like" en el momento de la consulta. No hay evidencia de terceros que hayan reproducido el modelo.
- Ausencia de benchmarks: la seccion de evaluacion solo contiene imagenes sin cifras extraibles, por lo que no se puede verificar la calidad musical ni el seguimiento de instrucciones.
- Contexto y cuantizaciones sin documentar: no se especifica la longitud de contexto soportada ni hay pesos GGUF, AWQ o GPTQ publicados, lo que limita el despliegue en entornos de bajos recursos.
- Alucinacion: como LM generativo, puede producir letras, metadatos o captions incoherentes o factualmente incorrectos, especialmente en idiomas poco representados.
- Sesgos: los sesgos musicales, culturales y linguisticos del dataset no estan documentados. Con mas de 50 idiomas declarados, es previsible un rendimiento desigual entre ellos, pero no hay mediciones.
- Riesgo de similitud con obras existentes: no se cuantifica la probabilidad de que la salida se parezca a material protegido, algo critico si se comercializa la musica generada.
- Restricciones de licencia: los pesos se distribuyen bajo MIT, pero la model card original invoca un dataset "legalmente compliant" (licenciado, libre de regalias y sintetico). Ese extremo no es verificable de forma independiente y la responsabilidad del uso comercial recae en quien despliega el modelo.
- Caveat de produccion: la afirmacion de menos de 4 GB de VRAM y de generacion en menos de 2 segundos corresponde al sistema completo segun su autor, no a este repositorio concreto, y no se especifica el hardware ni la configuracion exacta.
- Sin informacion sobre tool calling, agentes o function calling, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-Composer-4B
- Pagina del proyecto ACE-Step 1.5: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion ACE-Step 1.5 en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- Modelo `acestep-v15-turbo`: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo `acestep-v15-base`: https://huggingface.co/ACE-Step/acestep-v15-base
- Modelo `acestep-v15-sft`: https://huggingface.co/ACE-Step/acestep-v15-sft
- ModelScope: https://modelscope.cn/models/ACE-Step/ACE-Step-v1-5
- Demo (Space): https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord: https://discord.gg/PeWDxrkdj7
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub citado en la model card: https://github.com/ace-step/ACE-Step-1.5
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces recuperados correspondian a paginas de producto de iPhone de Apple y no guardan relacion con la ficha.
