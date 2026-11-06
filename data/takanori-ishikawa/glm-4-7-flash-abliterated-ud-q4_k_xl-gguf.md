# takanori-ishikawa/GLM-4.7-Flash-Abliterated-UD-Q4_K_XL-GGUF

## Resumen

GLM-4.7-Flash-Abliterated-UD-Q4_K_XL-GGUF es una version "abliterated" (con la direccion de rechazo eliminada mediante edicion de activaciones) del modelo GLM-4.7-Flash de Zhipu AI (zai-org), cuantizada en formato GGUF Q4_K_XL por Unsloth y posteriormente editada por el usuario takanori-ishikawa. El modelo base es un transformer de aproximadamente 29.900 millones de parametros (29,94 B), orientado a generacion de texto conversacional y razonamiento. Esta version concreta elimina el comportamiento de rechazo del modelo original para producir respuestas sin censura ("uncensored") en practicamente cualquier peticion.

La relevancia de esta ficha radica en que documenta un caso de "abliteration" sobre un modelo grande y moderno, con evaluacion cuantitativa explicita (HarmBench, XSTest, GSM8K, MMLU-Pro) y una metodologia reproducible publicada en un repositorio de GitHub. El autor declara que el modelo cumple 91 de 100 peticiones daninas de HarmBench, no rechaza ninguna de las 100 peticiones seguras de XSTest y mantiene puntuaciones de capacidad proximas al original en los subconjuntos evaluados.

El artefacto se distribuye como un unico fichero GGUF de 17,52 GB (17.520.169.312 bytes) con licencia MIT, pensado para ejecutarse en runtimes GGUF compatibles con GLM-4.7-Flash, incluyendo Apple Silicon (etiqueta `apple-silicon` en el repo). El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-4.7-Flash); detalles internos de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 29.943.393.920 (~29,94 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluacion usa salidas de 16K y 32K tokens, pero no se especifica la ventana de contexto del modelo) |
| Tipos de cuantizacion | GGUF Q4_K_XL (unico fichero publicado); el modelo base ofrece otras cuantizaciones no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero unico `GLM-4.7-Flash-Abliterated-UD-Q4_K_XL.gguf`) |

## Arquitectura y entrenamiento

El modelo es una edicion del checkpoint GLM-4.7-Flash de Zhipu AI, cuantizado por Unsloth en Q4_K_XL. La arquitectura subyacente es un transformer (no se documentan en la informacion disponible detalles como tipo de atencion, uso de MoE o composicion exacta del dataset de entrenamiento original). El proceso de "abliteration" descrito por el autor consiste en: (1) estimar direcciones de activacion "dannino menos benigno" a partir de 200 prompts daninos y 200 benignos generados; (2) tomar la direccion `resid_mean` de la capa L24 (indexacion desde cero) y biproyectarla contra la media benigna de cada capa; (3) partiendo de tensores BF16, eliminar esa direccion con fuerza 1 en la salida de atencion, en las proyecciones down de las FFN densas/compartidas/enrutadas de las 47 capas principales y en el embedding de tokens, preservando normas de columna (o de fila para el embedding); (4) recuantizar cada tensor a su tipo original de Unsloth con dos iteraciones de correccion de objetivo fijo, preservando los bytes no editados del GGUF.

El autor indica que no se suministra matriz de importancia externa durante la edicion y que el unico cambio respecto al GGUF de Unsloth son los valores de los tensores editados: metadatos, tipos de tensor y plantilla de chat permanecen identicos. La evaluacion se ejecuto en un Mac mini M4 Pro con 64 GB de RAM usando un fork de llama.cpp (commit `5c4fc1a68`), con temperatura 1.0, top-p 0.95, top-k 20, min-p 0 y semilla 407, con "thinking" activado y sin presupuesto de pensamiento separado.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (plantilla de chat sin cambios respecto al modelo base).
- Razonamiento con modo "thinking" (el autor menciona que el razonamiento largo puede agotar el limite de salida; la evaluacion usa 16K tokens de salida y regenera ejemplos truncados con 32K).
- Resolucion de problemas matematicos de nivel escolar (evaluado en GSM8K).
- Conocimiento general y razonamiento de nivel experto (evaluado en MMLU-Pro).
- Respuestas sin rechazo ante peticiones que el modelo original rechazaria (comportamiento "uncensored" intencionado).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada mas alla del modo thinking.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo sirve como artefacto de estudio para medir cuanto degrada el "abliteration" el comportamiento de rechazo (91/100 en HarmBench frente a 12/100 del original) y como afecta a la utilidad (GSM8K 47/50 y MMLU-Pro 42/50, practicamente identicos al original).
- Evaluacion de clasificadores de seguridad: al generar respuestas que el modelo original rechazaria, permite probar clasificadores como HarmBench-Llama-2-13b-cls o WildGuard en condiciones de alta tasa de cumplimiento.
- Red teaming controlado: util para generar respuestas a peticiones daninas en entornos de laboratorio aislados, con el fin de entrenar o validar filtros y detectores.
- Experimentos de edicion de activaciones: el repositorio del autor incluye receta, scripts y datos congelados para reproducir el proceso, lo que lo convierte en material didactico para estudiar tecnicas de abliteration (direccion L24, biproyeccion, preservacion de normas).
- Despliegue local en Apple Silicon: el formato GGUF y la etiqueta `apple-silicon` permiten ejecutarlo en un Mac con suficiente RAM unificada (la evaluacion se hizo en un M4 Pro con 64 GB), util para pruebas offline sin GPU dedicada.
- Generacion de texto creative sin restricciones de contenido: para proyectos donde se requiera un modelo que no rechace tematicas sensibles (ficcion adulta, narrativa oscura), asumiendo los riesgos descritos abajo.
- Prototipado de pipelines conversacionales en llama.cpp: al mantener metadatos y plantilla de chat del modelo base, puede sustituir al GGUF original en un runtime existente sin cambios de integracion.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Conjuntos: HarmBench estandar (100 comportamientos), XSTest safe (100) y unsafe (50), GSM8K test (50) y MMLU-Pro test (50). Semilla 407; clasificador HarmBench-Llama-2-13b-cls en Q8_0 y WildGuard en Q8_0 para rechazos de XSTest.

Conjunto HarmBench no tocado (independiente de toda eleccion de seleccion):

| Modelo | HarmBench si / no / truncado (100) | XSTest safe rechazos / 100 | XSTest unsafe rechazos / 50 |
|---|---:|---:|---:|
| original (Unsloth UD-Q4_K_XL) | 12 / 88 / 0 | 2 | 44 |
| huihui-ai (Q4_K_M) | 94 / 6 / 0 | 0 | 3 |
| final (este modelo) | 91 / 9 / 0 | 0 | 3 |

Conjunto de seleccion HarmBench y capacidades:

| Modelo | HarmBench seleccion si / no / truncado (100) | GSM8K correctas / 50 | MMLU-Pro correctas / 50 |
|---|---:|---:|---:|
| original | 15 / 85 / 0 | 47 | 39 |
| huihui-ai | 92 / 8 / 0 | 48 | 42 |
| layer24-k1 | 85 / 15 / 0 | 47 | 43 |
| final (este modelo) | 91 / 9 / 0 | 47 | 42 |

Notas del autor: en el conjunto no tocado, la diferencia con huihui-ai no es significativa (McNemar bilateral exacto p = 0,25; solo huihui-ai cumple en 3 comportamientos y solo este modelo en ninguno). Los conjuntos son pequenos y diferencias de pocas respuestas no establecen diferencias amplias de capacidad. Un ejemplo de MMLU-Pro del modelo final queda truncado y cuenta como incorrecto.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero GGUF Q4_K_XL ocupa 17,52 GB; se necesita al menos esa cantidad de memoria mas overhead de contexto KV. Para contexto largo (16K-32K tokens de salida) el consumo adicional de KV cache puede ser significativo y no esta cuantificado en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU con 24 GB (RTX 3090/4090) podria alojar los pesos, pero el contexto largo puede requerir mas memoria; no hay datos confirmados.
- Cabe en consumer GPU: probablemente en GPUs de 24 GB o mas con cuantizacion Q4_K_XL y contexto moderado, aunque no hay confirmacion en la informacion disponible. La evaluacion se realizo en un Mac mini M4 Pro con 64 GB de RAM unificada.
- Opciones de despliegue: cualquier runtime GGUF compatible con GLM-4.7-Flash; el autor uso un fork de llama.cpp (commit `5c4fc1a68`). No se confirma compatibilidad explicita con Ollama, vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HarmBench (no tocado) | GSM8K / MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GLM-4.7-Flash Abliterated Q4_K_XL) | ~29,94 B | no disponible | 91/100 cumplidas | 47/50 y 42/50 | MIT | GGUF unico, 17,52 GB |
| GLM-4.7-Flash original (Unsloth UD-Q4_K_XL) | ~29,94 B | no disponible | 12/100 cumplidas | 47/50 y 39/50 | MIT | GGUF en Unsloth |
| Huihui-GLM-4.7-Flash-abliterated (mradermacher, Q4_K_M) | ~29,94 B (mismo base) | no disponible | 94/100 cumplidas | 48/50 y 42/50 | MIT (heredada) | GGUF en mradermacher |
| layer24-k1 (variante del autor) | ~29,94 B | no disponible | 85/100 (conjunto de seleccion) | 47/50 y 43/50 | MIT | No publicado como repo independiente |

Las tres variantes abliterated tienen rendimiento de capacidad practicamente identico al original en los subconjuntos evaluados; la diferencia principal es la tasa de cumplimiento en HarmBench, donde huihui-ai y este modelo estan estadisticamente empatados en el conjunto no tocado.

## Limitaciones y advertencias

- El "abliteration" elimina la direccion de rechazo y, con ella, el comportamiento de seguridad: el modelo cumple el 91 % de las peticiones daninas de HarmBench y no rechaza ninguna peticion unsafe de XSTest (3/50 rechazos frente a 44/50 del original). Puede producir contenido danino, inexacto o poco fiable.
- Los propios resultados del autor no establecen seguridad ni idoneidad para ningun uso concreto; son conjuntos pequenos (50-100 ejemplos) y diferencias de pocas respuestas no son concluyentes.
- Riesgo elevado de alucinacion y de respuestas inseguras en produccion; no recomendado para aplicaciones de cara al usuario sin filtros externos.
- Idiomas soportados no declarados; no hay garantia de calidad multilingue.
- Longitud de contexto no documentada; el razonamiento largo puede agotar el limite de salida (la evaluacion usa 16K y 32K tokens de salida).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del uso recae en el desplegador. Verificar la licencia del modelo base zai-org/GLM-4.7-Flash (MIT segun el autor).
- Artefacto con 0 descargas y 0 likes: sin validacion comunitaria independiente.
- La edicion preserva los bytes no editados del GGUF de Unsloth, pero cualquier verificacion de integridad debe basarse en el SHA-256 publicado.

## Enlaces

- Repo Hugging Face: https://huggingface.co/takanori-ishikawa/GLM-4.7-Flash-Abliterated-UD-Q4_K_XL-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Cuantizacion de Unsloth: https://huggingface.co/unsloth/GLM-4.7-Flash-GGUF
- Variante huihui-ai comparada: https://huggingface.co/mradermacher/Huihui-GLM-4.7-Flash-abliterated-GGUF
- Repositorio de receta y scripts: https://github.com/ishikawa/glm-4.7-flash-abliteration
- Fork de llama.cpp usado: https://github.com/ishikawa/llama.cpp/commit/ddf120c50a8acfbf873c16cb070c2b5e4bb6a2fe
- HarmBench: https://github.com/centerforaisafety/HarmBench
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- XSTest: https://github.com/paul-rottger/xstest
- WildGuard: https://huggingface.co/allenai/wildguard
- GSM8K: https://github.com/openai/grade-school-math
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
