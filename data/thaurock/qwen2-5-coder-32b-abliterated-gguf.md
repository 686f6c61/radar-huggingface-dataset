# Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF

## Resumen

Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF es una coleccion completa de cuantizaciones en formato GGUF del modelo Qwen2.5-Coder-32B-Instruct, publicado por el usuario Thaurock bajo licencia Apache 2.0. El modelo parte del checkpoint oficial de Alibaba Cloud y ha sido sometido a un proceso de *abliteration* (edicion estatica de pesos, sin LoRA ni hooks en tiempo de ejecucion) en la capa 42, ortogonalizando la direccion de rechazo en los modulos `o_proj`, `down_proj` y en los embeddings de tokens. El resultado declarado es un modelo con una tasa de rechazo del 0,0 % en pruebas controladas, manteniendo las capacidades de generacion de codigo del modelo original.

El modelo conserva los 32.763.876.352 parametros (32,8 B) del checkpoint base y se distribuye exclusivamente en GGUF, con once niveles de cuantizacion que abarcan desde F16 (aproximadamente 65,6 GB) hasta Q2_K (aproximadamente 12,1 GB). Esa horquilla permite desplegarlo tanto en GPU de gama alta como en equipos de consumo con 24 GB de VRAM (Q4_K_M, unos 19,9 GB), o incluso en configuraciones con 12-16 GB de VRAM y offload parcial a CPU.

Su relevancia actual es doble: por un lado, ofrece un espectro de cuantizaciones completo (frente a repositorios que solo publican algunos niveles); por otro, elimina los filtros de rechazo del modelo alineado, lo que lo orienta a casos de uso de auditoria de seguridad, analisis de exploits, red-teaming y generacion de contenido sin restricciones, con las implicaciones legales y eticas que ello conlleva. La propia model card advierte de que el usuario final es el unico responsable del uso que haga de las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura del modelo base Qwen2.5-Coder-32B-Instruct); detalle interno no especificado en la informacion disponible |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (11 niveles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF unicamente (11 ficheros .gguf sin splits); el repositorio no publica safetensors |

Datos adicionales del repositorio: tamano del repo 187,9 GB, pipeline `text-generation`, compatible con endpoints, etiquetas `abliterated`, `uncensored` y `code`. El modelo base declarado es Qwen/Qwen2.5-Coder-32B-Instruct.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint Qwen2.5-Coder-32B-Instruct, un transformer decoder denso de 32,8 B de parametros orientado a generacion de codigo. Sobre ese checkpoint no se ha realizado ningun entrenamiento adicional ni ajuste fino: la intervencion consiste en una edicion estatica de pesos (*abliteration*) aplicada en la capa 42, que ortogonaliza la direccion de rechazo en tres componentes concretos: la proyeccion de salida de atencion (`o_proj`), la proyeccion descendente del bloque MLP (`down_proj`) y los embeddings de tokens. El autor indica que este enfoque, al no emplear LoRA ni hooks en tiempo de ejecucion, evita artefactos y preserva las capacidades tecnicas originales.

El algoritmo de abliteration procede de TobiasLogic y se basa en la investigacion de Arditi et al. (2024) sobre la mediacion del rechazo por una unica direccion en el espacio de activaciones de los LLM. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo fases de RLHF o DPO; esos datos pertenecen a la ficha del modelo original de Qwen, no a este repositorio. Tampoco se describe ninguna innovacion adicional de decodificacion o atencion especifica de esta version.

## Capacidades

- Generacion de codigo: es la capacidad principal heredada del checkpoint Coder, con soporte para completado, generacion a partir de instrucciones y sintaxis de lenguajes de programacion complejos.
- Razonamiento tecnico y resolucion de problemas de programacion, segun los resultados declarados en HumanEval, HumanEval+, MBPP y MBPP+.
- Conversacion multi-turno: el pipeline declarado es `text-generation` con etiqueta `conversational`, por lo que mantiene el formato de dialogo del modelo Instruct.
- Respuesta sin rechazos: la model card declara una tasa de rechazo del 0,0 % en pruebas controladas, lo que implica que no aplica filtros de seguridad aprendidos durante el alineamiento.
- Tool calling y function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente, aunque el modelo hereda la base Instruct.
- Capacidades multilingues: no disponibles; la metadata de HuggingFace no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Auditoria de seguridad y analisis de vulnerabilidades: el modelo puede generar y explicar PoCs de exploits sin activar rechazos, lo que resulta util en entornos de pentesting autorizados donde un modelo alineado bloquearia la peticion. Su naturaleza local evita enviar codigo sensible a APIs externas.
- Red-teaming de sistemas de IA y de software: al carecer de filtros de rechazo, sirve para generar prompts adversarios, casos limite y contenido abusivo controlado dentro de pruebas de robustez.
- Asistente de programacion local en equipos de desarrollo: con la cuantizacion Q4_K_M (19,9 GB) se puede ejecutar en una GPU de consumo de 24 GB mediante llama.cpp u Ollama, manteniendo el codigo y los prompts dentro de la infraestructura propia.
- Analisis de malware y reversing: la ausencia de bloqueos permite pedir explicaciones detalladas de tecnicas de ofuscacion, inyeccion o persistencia, tareas habituales en analisis defensivo.
- Refactorizacion y mantenimiento de bases de codigo heredadas: el modelo puede leer y reescribir modulos largos; conviene verificar la ventana de contexto efectiva del checkpoint base antes de plantear tareas que excedan dicho limite.
- Generacion de documentacion tecnica y comentarios de codigo: a partir de fragmentos de codigo, produce documentacion y comentarios sin las restricciones de estilo que a veces imponen los modelos altamente alineados.
- Escritura creativa y de ficcion sin restricciones tematicas: util para guiones, narrativa o dialogos con tematicas que otros modelos rechazan, siempre que el contenido generado cumpla la legislacion aplicable.
- Entornos air-gapped o con requisitos de soberania del dato: al distribuirse en GGUF y ejecutarse con llama.cpp, funciona sin conexion y sin telemetria de terceros, lo que encaja en organizaciones con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, con decodificacion greedy (pass@1) sobre la cuantizacion Q4_K_M del modelo abliterado, comparados con el modelo base oficial en BF16:

| Benchmark | Este modelo (abliterated Q4_K_M) | Base Instruct oficial (BF16) |
|---|---|---|
| HumanEval | 89,6 % | 92,7 % |
| HumanEval+ | 84,8 % | 87,2 % |
| MBPP | 91,3 % | 90,2 % |
| MBPP+ | 77,0 % | 75,1 % |

Segun el autor, la version sin censura se mantiene dentro de un margen de 3 puntos en HumanEval y supera al modelo base en ambas variantes de MBPP. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, GSM8K, MATH, LiveCodeBench, etc.), ni evaluaciones independientes que verifiquen estas cifras. Tampoco se aportan datos de rendimiento para el resto de niveles de cuantizacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin cache KV ni overhead de contexto):
  - F16: ~65,6 GB.
  - Q8_0: ~34,8 GB.
  - Q6_K: ~27,2 GB.
  - Q5_K_M: ~23,4 GB; Q5_K_S: ~22,8 GB.
  - Q4_K_M: ~19,9 GB; Q4_K_S: ~18,8 GB.
  - Q3_K_L: ~16,5 GB; Q3_K_M: ~15,1 GB; Q3_K_S: ~14,2 GB.
  - Q2_K: ~12,1 GB.
- GPU recomendadas:
  - F16 y Q8_0: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 x 24 GB para Q8_0).
  - Q6_K y Q5_K_M: A100 40 GB, L40S 48 GB, o 2 x RTX 4090/3090.
  - Q4_K_M y Q4_K_S: una sola RTX 4090, RTX 3090, RTX 4080 Super o similar con 24 GB, dejando margen para cache KV.
  - Q3 y Q2: GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) o 12 GB con offload parcial de capas a CPU.
- Compatibilidad con GPU de consumo: si. Q4_K_M (~19,9 GB) entra en 24 GB; Q3_K_M (~15,1 GB) y Q2_K (~12,1 GB) permiten ejecucion en tarjetas de 16 GB y 12 GB respectivamente, con posible descarga de capas a RAM.
- Requisitos de RAM si se hace offload a CPU: al menos el tamano del fichero mas un margen para el contexto; por ejemplo, unos 24-32 GB de RAM del sistema para Q4_K_M.
- Opciones de despliegue: llama.cpp (ejemplo de ejecucion incluido en la model card con `llama-cli`), Ollama, LM Studio y Text-Generation-WebUI. Para vLLM o TGI seria necesario recurrir a los pesos safetensors del modelo base, ya que este repositorio solo publica GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar esta version con su propio modelo base. No se documentan en ella otras alternativas de la misma categoria con datos verificables, por lo que los campos correspondientes se marcan como no disponibles.

| Modelo | Parametros | Cuantizacion | Contexto | HumanEval | MBPP | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF | 32,8 B | GGUF F16-Q2_K (11 niveles) | No disponible | 89,6 % (Q4_K_M) | 91,3 % (Q4_K_M) | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-Coder-32B-Instruct (base) | 32,8 B | BF16 (referencia) | No disponible | 92,7 % | 90,2 % | Apache 2.0 (segun el repositorio) | safetensors |

Otras alternativas del mismo segmento (por ejemplo, otros modelos coder de ~30 B o versiones abliteradas de otros proveedores) no aparecen en la informacion disponible, por lo que no se incluyen datos comparativos que no puedan contrastarse.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo declara un 0,0 % de rechazo. Puede generar codigo malicioso, exploits funcionales, contenido ofensivo o instrucciones peligrosas. La model card traslada toda la responsabilidad legal al usuario final.
- Riesgo de alucinacion: como cualquier LLM, puede inventar APIs, funciones o referencias bibliograficas. El codigo generado debe revisarse y ejecutarse en entornos aislados antes de usarse en produccion.
- Degradacion por cuantizacion: el propio autor advierte que Q2_K puede producir problemas de formato o "sangrado" en bloques de codigo complejos, y lo recomienda solo para desarrollo experimental. Los niveles Q3 tambien reducen la coherencia logica.
- Perdida de calidad medida: en HumanEval la version abliterada Q4_K_M cae 3,1 puntos respecto al base (89,6 % frente a 92,7 %) y 2,4 puntos en HumanEval+ (84,8 % frente a 87,2 %). El efecto de la abliteration sobre otras capacidades (razonamiento general, matematicas, multilingue) no se ha evaluado en la informacion disponible.
- Benchmarks autodeclarados: las cifras proceden de la model card del autor y no de una evaluacion independiente; conviene tratarlas como orientativas.
- Idiomas no documentados: la metadata no declara idiomas soportados; no hay garantia de calidad fuera del ingles y del chino del modelo base.
- Contexto no documentado: la longitud de contexto no se especifica en la informacion proporcionada. Antes de desplegar tareas con entradas largas hay que verificar la ventana real del checkpoint base y su configuracion en llama.cpp (`n_ctx`).
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el cumplimiento de la licencia del modelo base y de la legislacion aplicable al contenido generado es responsabilidad del usuario. Un modelo sin filtros puede generar material que infrinja normativas de ciberseguridad, propiedad intelectual o contenido ilicito.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia externa de calidad ni de reproducibilidad de las cuantizaciones.
- Solo GGUF: no se publican safetensors ni adaptadores; no es directamente desplegable en servidores de alto rendimiento (vLLM, TGI) sin recurrir al modelo base original.
- Aviso etico y legal: el uso para crear malware, realizar ataques sin autorizacion expresa o generar contenido ilegal puede constituir delito en la jurisdiccion del usuario. Se recomienda uso exclusivo en contextos de investigacion, auditoria autorizada y formacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thaurock/Qwen2.5-Coder-32B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Autor del algoritmo de abliteration: https://huggingface.co/TobiasLogic
- Referencia cientifica citada en la model card: Arditi et al., 2024 (sobre la mediacion del rechazo por una unica direccion); la model card no incluye el enlace completo al paper.
- Repositorio de inferencia mencionado: llama.cpp, Ollama, LM Studio y Text-Generation-WebUI (sin enlaces concretos en la model card).
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las busquedas devolvieron unicamente contenido no relacionado (guias de identificacion de escarabajos), por lo que no se incluyen enlaces adicionales.
