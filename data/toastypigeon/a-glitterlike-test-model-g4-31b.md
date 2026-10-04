# ToastyPigeon/a-glitterlike-test-model-g4-31b

## Resumen

`a-glitterlike-test-model-g4-31b` es un adaptador PEFT LoRA de rango 32 publicado por el usuario ToastyPigeon sobre el modelo base `google/gemma-4-31b-it` (snapshot 842da379). Se trata de un ajuste fino supervisado (SFT) orientado a roleplay y escritura de ficción, entrenado con 4-bit QLoRA sobre 12.746 conversaciones de dos conjuntos de datos locales. El autor lo describe explícitamente como una prueba experimental ("test run") de una receta denominada RP-chapters, no como una versión curada ni estable.

El repositorio contiene dos artefactos: en la raíz, los pesos mergeados en bf16 (subidos tras la verificación del merge), y en el subdirectorio `adapter/`, el adaptador LoRA entrenado con 202,8 millones de parámetros entrenables. El adaptador aplica 350 rutas sobre 50 de las 60 capas del modelo base, excluyendo deliberadamente las 10 capas de atención global y limitándose a las capas de ventana deslizante (SWA).

La relevancia de esta ficha es limitada y acotada: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Su interés es principalmente como ejemplo de receta de ajuste fino con QLoRA sobre un modelo de gran tamaño y de cómo se estructura un adaptador selectivo por tipo de capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre el modelo base `google/gemma-4-31b-it`; la arquitectura del base no se detalla en la informacion proporcionada) |
| Parametros totales | Aproximadamente 31B en el modelo base segun su denominacion (no confirmado); adaptador de 202,8M parametros entrenables |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens en entrenamiento; la longitud de contexto nativa del modelo base no esta disponible |
| Tipos de cuantizacion | 4-bit QLoRA durante el entrenamiento; pesos mergeados en bf16; no se ofrecen GGUF ni otras cuantizaciones listas para usar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA y pesos mergeados en bf16) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA de 4 bits, rango 32 y alpha 32, con dropout 0,05. Los modulos objetivo son las proyecciones q, k, v, o, gate, up y down, pero unicamente en las capas de ventana deslizante: se excluyen las 10 capas de atencion global, de modo que el adaptador cubre 350 rutas repartidas en 50 de las 60 capas del modelo base. El entrenamiento usa micro-batch de 1 con acumulacion de 16 (batch efectivo 16), una sola epoca y 693 pasos de optimizador con scheduler coseno de 5e-5 a 0, complementado con Muon a 1e-4 sobre los parametros bidimensionales. La perdida final registrada es 2,504 en el paso 693/693.

Los datos de entrenamiento suman 12.746 conversaciones provenientes de dos fuentes locales: `itvec-mix-sft-sys`, con 7.160 conversaciones mixtas de roleplay (aproximadamente el 97,6% de escenas derivadas de libros segun la auditoria de procedencia citada, mas 173 pares de preferencia sinteticos), y `marvin_chapters_instruct_v1`, con 5.586 conversaciones de roleplay con instrucciones por capitulos. Del total, 1.656 conversaciones superaban el limite de 8192 tokens y fueron descartadas. No se redistribuye texto del corpus, solo metadatos. Los pesos mergeados corresponden a un pliegue del adaptador a escala 1 con verificacion posterior bit a bit, documentada en `merge-meta.json`. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto narrativo y de ficcion, con enfasis en escenas derivadas de obras literarias segun la composicion del corpus de entrenamiento.
- Roleplay conversacional multi-turno, incluyendo instrucciones estructuradas por capitulos.
- Escritura de dialogos y descripcion de escenas dentro de un contexto de hasta 8192 tokens.
- Continuacion y desarrollo de tramas a partir de instrucciones de tipo "chapter-instruct".
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multimodal (vision, audio) ni modo de pensamiento explicito.
- El soporte multilingue no esta declarado; el idioma de los datos de entrenamiento no se especifica mas alla de su procedencia textual.

## Casos de uso

- Prototipado de personajes para videojuegos o narrativa interactiva: el adaptador esta entrenado sobre conversaciones de roleplay y escenas derivadas de libros, por lo que puede generar dialogos consistentes con un personaje definido en el prompt de sistema.
- Asistencia a escritores de ficcion en la generacion de capitulos: el corpus `marvin_chapters_instruct_v1` entrena al modelo en el formato de instrucciones por capitulos, lo que encaja con flujos de trabajo de escritura larga dividida en secciones.
- Simulacion de escenas para talleres de escritura creativa: el modelo puede producir variantes de una misma escena cambiando el tono o el punto de vista, aprovechando la ventana de 8192 tokens para mantener el contexto de la escena previa.
- Generacion de material para juegos de rol de mesa: a partir de una ficha de personaje y un trasfondo, el adaptador puede interpretar al personaje en turnos sucesivos de conversacion.
- Experimentacion en investigacion sobre ajuste fino selectivo: el adaptador, limitado a capas SWA y con las capas de atencion global excluidas, sirve como caso de estudio reproducible de QLoRA con enrutado selectivo por tipo de capa.
- Base para comparativas internas de recetas de SFT: al publicarse tanto el adaptador como los pesos mergeados con verificacion bit a bit, permite medir el efecto de un pliegue a escala 1 frente al adaptador sin fusionar.
- Creacion de datasets sinteticos de dialogo narrativo: el modelo puede generar conversaciones de roleplay que despues se filtren y revisen manualmente antes de incorporarlas a un corpus mayor.

En todos los casos debe tenerse en cuenta que el autor lo califica como modelo experimental y no curado, sin licencia declarada, por lo que su uso en produccion no esta respaldado por la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (unicamente paginas de foros sin relacion con el). El unico dato numerico de entrenamiento publicado es la perdida final de 2,504 en el paso 693/693.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del modelo base (aproximadamente 31B parametros segun su denominacion) y no proceden de la informacion publicada por el autor:

- Pesos en bf16: en torno a 62 GB solo para los pesos, mas overhead de activaciones y cache KV; requiere GPUs de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantizacion de 8 bits: en torno a 31 GB para los pesos; encaja en A6000 48GB o en configuraciones multi-GPU.
- Cuantizacion de 4 bits: en torno a 16-18 GB para los pesos, con margen ajustado en una RTX 4090 de 24 GB si se limita la longitud de contexto.
- El adaptador por si solo ocupa 0,8 GB en el repositorio y puede aplicarse sobre una instancia ya cargada del modelo base mediante PEFT.
- Opciones de despliegue: PEFT junto con transformers es el camino documentado en la model card. vLLM soporta adaptadores LoRA, pero la compatibilidad concreta con este adaptador no esta verificada en la informacion disponible. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el repositorio no ofrece.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La unica referencia verificable es el propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a-glitterlike-test-model-g4-31b | ~31B (base) + 202,8M (adaptador) | 8192 en entrenamiento | Sin benchmarks publicados | No disponible | Adaptador y pesos mergeados en HuggingFace |
| google/gemma-4-31b-it | No disponible | No disponible | No disponible | No disponible | Referenciado como modelo base (snapshot 842da379) |

Cualquier comparacion con otros adaptadores de roleplay del mismo rango de tamano requeriria datos de evaluacion que no se han publicado para este modelo.

## Limitaciones y advertencias

- Modelo experimental y no curado: el propio autor lo etiqueta como "test run", sin garantias de calidad ni de estabilidad.
- Ausencia de licencia declarada: no se especifican los terminos de uso, lo que impide determinar si se permite el uso comercial. Debe consultarse al autor antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no hay ninguna evaluacion objetiva que permita estimar su calidad frente al modelo base ni frente a alternativas.
- Sesgos potenciales: aproximadamente el 97,6% de las escenas del corpus principal derivan de libros, lo que puede sesgar el estilo, el registro y el contenido hacia las obras concretas de las que proceden.
- Riesgo de alucinacion: es un modelo generativo de texto sin mecanismos declarados de verificacion factual; en tareas informativas puede producir afirmaciones incorrectas con aparente seguridad.
- Limitacion de contexto: 8192 tokens en entrenamiento, y 1.656 de las 12.746 conversaciones originales se descartaron por superar ese limite, lo que puede degradar el comportamiento en secuencias mas largas que las vistas durante el ajuste.
- Exclusion de capas de atencion global: el adaptador no modifica las 10 capas de atencion global del modelo base, por lo que cualquier comportamiento dependiente de esas capas permanece sin ajustar.
- Idioma no declarado: no se especifica que idiomas soporta ni en que idioma estan los datos de entrenamiento, por lo que el rendimiento fuera del idioma del corpus es incierto.
- Caveat de verificacion: la existencia y las caracteristicas del modelo base `google/gemma-4-31b-it` no se pueden confirmar con la informacion disponible en esta busqueda; todos los datos heredados de dicho base deben tratarse como no verificados.
- Reproducibilidad: el autor no redistribuye el texto del corpus, solo metadatos, por lo que el entrenamiento no es reproducible a partir de este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToastyPigeon/a-glitterlike-test-model-g4-31b
- Modelo base referenciado: https://huggingface.co/google/gemma-4-31b-it
- Documentacion de PEFT: no disponible en la informacion proporcionada
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo.
