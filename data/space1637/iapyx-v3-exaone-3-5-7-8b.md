# space1637/iapyx-v3-exaone-3.5-7.8b

## Resumen
iapyx-v3-exaone-3.5-7.8b es un ajuste fino completo (full fine-tuning) del modelo coreano LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, publicado por el usuario space1637 (equipo Iapyx) en el contexto del concurso 2026 AI Rookie. El modelo no es un asistente generalista: ha sido especializado para producir salidas estructuradas (JSON) en seis tareas concretas de un producto de asistencia documental y juridica en coreano, entre ellas clasificacion de riesgo, seleccion de herramientas, extraccion de campos de documentos, verificacion aritmetica y control del lenguaje en las respuestas. La decision final del producto la toman reglas deterministas; el modelo solo rellena casillas y elige herramientas.

El entrenamiento se hizo con pesos completos sobre 2x A100 80GB usando FSDP, con 11 018 ejemplos de entrenamiento y 1130 de evaluacion, 16 epocas, learning rate 1e-05 y longitud maxima de 2048 tokens. El autor reporta mejoras muy grandes en las metricas internas de sus seis tareas (por ejemplo, macro-F1 de clasificacion de riesgo de 0,000 a 1,000 y exactitud de seleccion de herramienta de 0,270 a 1,000), aunque la curva de perdida de evaluacion muestra sobreajuste claro a partir de la epoca 2. Su relevancia es limitada y muy especifica: sirve como caso de estudio reproducible de SFT completo con datos sinteticos y como componente de un pipeline coreano con licencia restringida a investigacion.

Se publica bajo la licencia EXAONE AI Model License, de uso exclusivamente investigador, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin resultados de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion facilitada; heredada del modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (transformer decoder-only) |
| Parametros totales | 7 818 448 896 (~7,82 B) |
| Longitud de contexto | Entrenado con longitud maxima de 2048 tokens; el modelo base declara 32 768 tokens de ventana segun su documentacion oficial, dato no confirmado en la informacion facilitada |
| Tipos de cuantizacion | No disponible: el autor solo publica pesos completos en safetensors (15,6 GB de repositorio, coherente con bf16/fp16 a ~2 bytes por parametro). No hay versiones GGUF, GPTQ ni AWQ publicadas |
| Idiomas soportados | Coreano (ko), declarado por el autor; el modelo base tambien cubre ingles |
| Licencia | other: EXAONE AI Model License (uso de investigacion). El autor indica que se uso unicamente con fines de concurso e investigacion |
| Formato de pesos | safetensors con codigo remoto (tag custom_code) |

## Arquitectura y entrenamiento
No se aporta la configuracion interna del modelo (numero de capas, cabezas, tipo de atencion). Al ser un ajuste fino de pesos completos sobre EXAONE-3.5-7.8B-Instruct, conserva la arquitectura del modelo base, un transformer decoder-only de 7,82 mil millones de parametros con tokenizador y plantilla de chat propios de la familia EXAONE; por eso el repositorio requiere cargar codigo remoto. El ajuste se ejecuto con FSDP sobre 2x A100 80GB, con batch 4, acumulacion de gradiente 4, learning rate 1e-05, longitud maxima de 2048 tokens y 16 epocas completas (22 326,9 segundos de entrenamiento). La perdida se calculo unicamente sobre los tokens del asistente y se selecciono la mejor epoca por perdida de evaluacion: la epoca 2, con 0,3072514235973358.

Los datos son enteramente sinteticos y generados por el propio equipo: el generador de reglas del producto produce los ejemplos de clasificacion de riesgo, seleccion de herramienta, extraccion de campos y verificacion aritmetica; las respuestas de la tarea de expresion provienen de la API nacional K-EXAONE (con el razonamiento desactivado) y solo se aceptaron las que pasaron comprobaciones automaticas de numeros y longitud; la terminologia juridica procede del dataset JusWis/korean-legal-terminology (CC BY 4.0). El autor afirma que no se utilizo ningun modelo extranjero en datos, entrenamiento ni evaluacion. No hay RLHF ni DPO: es SFT supervisado puro.

## Capacidades
- Generacion de texto en coreano con formato estructurado: el modelo esta entrenado para emitir respuestas en JSON dentro de casillas predefinidas, no texto libre.
- Clasificacion de riesgo en expedientes: macro-F1 de 1,000 en el conjunto de evaluacion del autor (frente a 0,000 antes del ajuste).
- Seleccion de herramientas (tool calling acotado): exactitud de 1,000 al elegir la herramienta correcta entre un conjunto cerrado, frente a 0,270 del modelo base.
- Extraccion de campos de documentos: F1 de 0,996 en el schema evaluado.
- Verificacion aritmetica y comprobacion de resultados (검산): 0,794 de coincidencia exacta; en aproximadamente uno de cada cinco casos la comprobacion no es correcta.
- Control de expresion y seguridad del lenguaje en respuestas al usuario: tasa de seguridad de 0,960.
- Terminologia juridica coreana: chrF de 0,124, una mejora marginal sobre el 0,093 previo que indica baja calidad en este dominio.
- No se documentan capacidades de vision, audio, razonamiento multi-paso general, function calling abierto ni modo de pensamiento explicito.

## Casos de uso
- Clasificacion de riesgo en tramitacion de expedientes juridicos o de seguros: el modelo recibe el texto del caso y devuelve una etiqueta de riesgo en JSON; se usaria como componente de un motor de reglas que decide la accion final y aplica umbrales. Es adecuado porque su salida es determinista en formato y alcanza 1,000 de macro-F1 en el conjunto interno del autor.
- Enrutado de herramientas en un agente acotado: dado un conjunto cerrado de funciones (consultar poliza, calcular indemnizacion, escalar a humano), el modelo selecciona cual invocar con 1,000 de exactitud en la evaluacion interna; encaja en arquitecturas de agente donde el catalogo de herramientas no cambia.
- Extraccion de campos en formularios, polizas y escritos: con F1 de 0,996 en el schema propio, se integraria en un pipeline OCR + LLM donde el modelo normaliza cada campo a JSON; la ventana de 2048 tokens obliga a trocear documentos largos o a extraer por secciones.
- Verificacion de calculos y cuadres contables en expedientes: el modelo revisa operaciones y marca discrepancias con 0,794 de coincidencia exacta, lo que exige un paso de revision humana para el 20 % restante antes de dar por valido un expediente.
- Redaccion controlada de comunicaciones al cliente: genera respuestas con tasa de seguridad del 0,960 respecto a las reglas de estilo del producto, util para plantillas de notificacion y respuestas de atencion al cliente en coreano.
- Asistencia terminologica juridica: normalizacion de terminos coreanos en documentos internos, asumiendo la limitacion del chrF de 0,124 y usandolo solo como sugerencia revisable, nunca como fuente autoritativa.
- Generacion de datos de entrenamiento para un pipeline mayor: dado su ajuste a un schema fijo, sirve como etiquetador de bajo coste en tareas de clasificacion y extraccion dentro de un flujo propio, con supervision humana por muestreo.
- Investigacion reproducible de SFT completo: el autor publica el codigo de reproduccion y el informe de evaluacion, lo que permite replicar el esquema FSDP con 2x A100 y estudiar el sobreajuste en datasets sinteticos pequenos.
- Todos estos usos quedan condicionados por la licencia EXAONE AI Model License, que restringe el uso comercial; cualquier despliegue en producto requeriria autorizacion del titular de la licencia.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el mismo conjunto held-out y con el mismo codigo de evaluacion:

| Tarea | Modelo base | Tras el ajuste |
|---|---|---|
| Macro-F1 de nivel de riesgo | 0,000 | 1,000 |
| Exactitud de seleccion de herramienta | 0,270 | 1,000 |
| F1 de campos de documento | 0,010 | 0,996 |
| Coincidencia exacta en verificacion aritmetica | 0,000 | 0,794 |
| Tasa de seguridad de expresion | 0,770 | 0,960 |
| chrF de terminologia juridica | 0,093 | 0,124 |
| Media de las 5 tareas (excluida la de dominio) | 0,2100322773460849 | 0,949963379376807 |

Datos adicionales aportados: latencia de 0,3443 s por generacion en A100 (en lote) y curva de perdida de evaluacion por epoca (mejor valor 0,3072514235973358 en la epoca 2, subiendo hasta aproximadamente 0,625 en las epocas 15 y 16).

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Las cifras anteriores proceden del propio autor, sobre tareas disenadas por el mismo equipo, por lo que no son comparables con evaluaciones estandarizadas externas.

## Requisitos de hardware
- Pesos en bf16/fp16: unos 15,6 GB (7,82 B de parametros a 2 bytes). Con cache KV y activaciones a 2048 tokens de contexto, se necesitan aproximadamente 18-24 GB de VRAM para inferencia comoda.
- GPU con margen suficiente: A100 40GB y 80GB, H100 80GB, L40S 48GB.
- Consumer GPU: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16/fp16, aunque con poca holgura para lotes grandes; por debajo de 24 GB es necesario cuantizar, y el autor no publica cuantizaciones, por lo que habria que generarlas. Una conversion a 4 bits (aproximadamente 4,5-5 GB de pesos) permitiria ejecutarlo en RTX 3060 12GB, RTX 4070 y equipos Apple Silicon con 16 GB de memoria unificada, siempre que la conversion sea compatible con el codigo remoto.
- Entrenamiento: el autor uso 2x A100 80GB con FSDP para el ajuste de pesos completos; reproducir ese entrenamiento requiere hardware equivalente o superior.
- Despliegue: transformers con `trust_remote_code=True` es la via directa, ya que el repositorio incluye codigo personalizado. La familia EXAONE cuenta con soporte en algunos servidores de inferencia (por ejemplo, vLLM) y en conversiones de la comunidad para llama.cpp u Ollama, pero el autor no publica artefactos GGUF y no se confirma compatibilidad con estos ultimos en la informacion disponible.
- Latencia y throughput: el autor reporta 0,3443 s por generacion en A100 trabajando en lote. No se aportan datos de tokens por segundo ni de rendimiento en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iapyx-v3-exaone-3.5-7.8b | 7,82 B | Entrenado a 2048 tokens | Solo metricas internas del autor (media 0,950 en 5 tareas) | EXAONE AI Model License (investigacion) | HuggingFace, 0 descargas, 0 likes |
| EXAONE-3.5-7.8B-Instruct (base) | 7,82 B | 32 768 tokens segun documentacion del modelo base | No disponible en esta ficha | EXAONE AI Model License | HuggingFace, mantenido por LG AI Research |
| Alternativas generalistas de ~7-8 B (por ejemplo, Qwen2.5-7B-Instruct o Llama-3.1-8B-Instruct) | Del orden de 7-8 B | No disponible en la informacion facilitada | No disponible | Apache 2.0 en el caso de Qwen2.5-7B; Llama 3.1 Community License en Llama-3.1-8B | Amplia, con ecosistema de cuantizaciones y servidores de inferencia |

No se dispone de comparaciones de rendimiento directas entre este ajuste y modelos generalistas, porque las metricas publicadas corresponden a tareas internas definidas por el propio autor y no a benchmarks estandarizados. La diferencia funcional clave frente al modelo base es el grado de especializacion: este ajuste gana en tareas concretas de un producto coreano y pierde, previsiblemente, capacidad generalista, ademas de arrastrar sobreajuste a partir de la epoca 2. Los datos de las alternativas generalistas proceden de conocimiento general sobre esos modelos, no de la informacion facilitada, y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias
- Sesgos conocidos: no se documenta ninguna auditoria de sesgos. El entrenamiento usa datos sinteticos generados por las reglas de un producto y terminologia juridica coreana de una unica fuente, por lo que hereda los sesgos y el vocabulario de esas fuentes.
- Riesgo de alucinacion: elevado fuera de las seis tareas para las que fue entrenado. En verificacion aritmetica, el 20,6 % de los casos no coincide exactamente, lo que impide usarlo sin revision humana en contextos contables o juridicos.
- Sobreajuste: la perdida de evaluacion sube de 0,3073 en la epoca 2 a aproximadamente 0,625 en la epoca 16, con un minimo muy temprano. El modelo publicado es el de la epoca 2, pero el entrenamiento completo de 16 epocas indica capacidad limitada del dataset (11 018 ejemplos para 7,82 B de parametros).
- Alcance estrecho: no es un asistente conversacional general. Su salida esperada son casillas JSON, eleccion de herramienta y textos con formato controlado; usarlo como chat abierto degradara la calidad.
- Idioma: declarado exclusivamente para coreano. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Dominio juridico debil: el chrF de 0,124 en terminologia juridica es bajo incluso despues del ajuste, por lo que no debe emplearse como fuente terminologica autoritativa.
- Contexto de trabajo: la longitud maxima de entrenamiento es de 2048 tokens, muy inferior a la ventana del modelo base, lo que limita el procesamiento de documentos largos.
- Licencia: EXAONE AI Model License, de uso investigador. El autor restringe explicitamente el uso a concurso e investigacion. No se permite uso comercial sin autorizacion del licenciante original.
- Reproducibilidad y validacion externa: el modelo tiene 0 descargas y 0 likes, no ha pasado evaluacion independiente y todas las metricas provienen del mismo equipo que lo entreno, sobre su propio codigo de evaluacion.
- Formato tecnico: requiere cargar codigo remoto (custom_code), lo que implica revisar el codigo antes de ejecutarlo en entornos productivos.
- Disponibilidad de datos: parte del dataset de expresion se genero con la API K-EXAONE, cuyas condiciones de uso conviene revisar antes de redistribuir derivados.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/space1637/iapyx-v3-exaone-3.5-7.8b
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio de reproduccion (carpeta finetune-v3/): https://github.com/AIROOKIE-S/iapyx
- Informe de evaluacion original (v3/): https://huggingface.co/datasets/space1637/iapyx-finetune-report
- Dataset de terminologia juridica coreana (CC BY 4.0): https://huggingface.co/JusWis/korean-legal-terminology
- Seguimiento del entrenamiento: proyecto W&B iapyx-finetune, URL no disponible en la informacion facilitada
- Busqueda web: los resultados obtenidos corresponden unicamente a enlaces de Yahoo Mail y no guardan relacion con el modelo; no se han encontrado papers, blogs ni demos adicionales.
