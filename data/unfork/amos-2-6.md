# unfork/amos-2.6

## Resumen

AMOS-2.6 es un modelo de decisión (decision model) de tipo discriminativo desarrollado por unfork. No genera lenguaje natural: cada tarea se formula como un problema de decisión estructurado y el modelo devuelve, en una única pasada hacia delante, una distribución de probabilidad normalizada sobre las opciones definidas por el usuario. La salida es 100 % parseable y las probabilidades están calibradas por temperatura, lo que permite usarlas directamente en umbrales de decisión automáticos.

Técnicamente es una adaptación bidireccional de Qwen/Qwen3-4B: se conserva el encoder de 36 capas y dimensión oculta 2560 y se sustituye la generación autorregresiva por una cabeza de decisión MLP de 2 capas y aproximadamente 157 millones de parámetros. El mecanismo de atención se modifica con el esquema `qwen3-dict-mask-v1` (máscara de padding dict 4D con atención bidireccional). El resultado es un modelo de unos 4,16 mil millones de parámetros en bfloat16 con truncación de entrada a 1024 tokens.

Su relevancia práctica está en el binomio latencia/coste: la model card reporta una latencia p50 de 265,7 ms y p95 de 384,9 ms sobre 12.000 llamadas reales de API, aproximadamente 4,4 veces más rápido que la línea base comercial con la que se compara, y con una precisión superior en la tarea principal (86,11 % frente a 72,85 %). Está pensado como capa de decisión de alta concurrencia acoplada a un LLM generador, no como sustituto de este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Qwen3-4B bidireccional (36 capas, hidden 2560, bf16) + cabeza de decisión MLP de 2 capas; atención `qwen3-dict-mask-v1` (dict 4D padding mask) |
| Parametros totales | ~4,16 B (encoder Qwen3-4B + ~157 M de la cabeza de decisión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en el encoder; 256 en la cabeza de decisión (truncación documentada) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en bfloat16 |
| Idiomas soportados | Chino (zh), inglés (en) y multilingüe (según etiquetas del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` con encoder + cabeza, `head_final.safetensors` con la cabeza sola y `lora_adapter/` con el adaptador de entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B y lo convierte en un encoder bidireccional: se elimina la naturaleza causal de la atención y se aplica una máscara de padding en formato dict 4D (`qwen3-dict-mask-v1`), de modo que cada token atiende a todos los demás dentro de la ventana de 1024 tokens. Sobre la representación resultante se monta una cabeza de decisión MLP de 2 capas (~157 M de parámetros) que emite las tres primitivas del interfaz systemone: `choice`, `score` y `noul`, todas como distribuciones de probabilidad. La inferencia se realiza en bfloat16.

El entrenamiento combina aprendizaje por currículo con LoRA (r=16, α=32, aplicado a q/k/v/o_proj), aprendizaje por refuerzo con conciencia de coste (parámetro `escalate=0.5`) y calibración de temperatura sobre un conjunto independiente. La model card indica que la versión publicada corresponde al currículo dirigido v6f-is_scope, mientras que la iteración interna v6e queda archivada. No se detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, más allá de que está centrado en textos financieros, mensajes SMS y dominios generales. El repositorio incluye el adaptador LoRA empleado durante el entrenamiento y el fichero `rl_agent_config.json` con la configuración de inferencia (max_len, head_layers, temperatura, escalate).

## Capacidades

- Clasificación de texto con salida estructurada: el modelo devuelve siempre un objeto con la opción elegida y el vector completo de probabilidades, sin texto libre que haya que parsear.
- Tres tipos de primitiva de decisión: `choice` (selección entre categorías definidas por criterios), `score` (puntuación) y `noul` (tercera primitiva; la model card no detalla su semántica).
- Probabilidades calibradas por temperatura sobre conjunto independiente, aptas para umbrales de decisión y para enrutado a revisión humana.
- Extracción de atributos estructurales y clasificación de propiedades fuera de la tarea principal (48.000 preguntas de evaluación de atributos fuera de muestreo).
- Capacidad multilingüe declarada (zh, en y multilingüe), aunque el entrenamiento se describe como centrado en chino, inglés, SMS y texto financiero.
- Uso como capa discriminativa acoplada a un LLM generador (el LLM produce, AMOS decide).
- No realiza generación de texto, resumen, traducción ni respuesta libre.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo de razonamiento explícito, visión ni audio.

## Casos de uso

- Detección de fraude en mensajería y SMS: el modelo clasifica un mensaje como `fraudulent`, `notification` o `marketing` devolviendo la probabilidad de cada clase; con umbrales sobre esa distribución se puede derivar automáticamente a bloqueo, aviso o cola de revisión. La model card incluye un ejemplo explícito de phishing tipo M-PESA.
- Enrutado de intención en atención al cliente: cada consulta entrante se formula como un problema `choice` con las intenciones del negocio y el modelo devuelve la categoría más probable con su nivel de confianza, lo que permite enviar cada conversación al flujo o al agente adecuado en una sola pasada.
- Triaje de riesgo con umbrales: al ser probabilístico y calibrado, permite fijar cortes (por ejemplo, escalar a humano por encima de 0,8) y ajustar el punto de operación sin reentrenar, algo que un clasificador de etiqueta única no facilita.
- Moderación de contenido y análisis de sentimiento a escala: con latencias p50 y p95 por debajo de 400 ms, encaja en pipelines de alto volumen donde se necesita puntuar miles de elementos por minuto.
- Identificación de idioma y extracción de atributos estructurales: la evaluación fuera de muestreo cubre ocho atributos estructurales, lo que sugiere su uso para poblar campos normalizados a partir de texto no estructurado.
- Capa de decisión sobre un LLM generador: el LLM redacta o razona y AMOS-2.6 emite la decisión final clasificatoria; este patrón reduce coste y latencia frente a pedir la clasificación al propio LLM generativo.
- Cumplimiento y clasificación documental en banca y seguros: para etiquetar comunicaciones de cliente por tipo, riesgo o urgencia, siempre que se realice un ajuste fino con datos del dominio.
- Enrutado de tickets de soporte técnico: clasificación de tickets por categoría y severidad con salida directamente consumible por el sistema de tickets, sin post-procesado de texto.

## Benchmarks y rendimiento

Datos publicados en la model card, sobre 6.000 tareas reales aleatorias y doble口径 (63.000 preguntas por modelo). El asterisco de la columna laya figura en la fuente y no se explica en la información disponible.

| Criterio | amos-2.6 | amos-2.5 (anterior) | jev (API comercial, linea base) | laya (modelo de decision ligero) |
|---|---|---|---|---|
| Tarea principal (15.000 preguntas/modelo) | 86,11 % | 79,04 % | 72,85 % | 44,73 %* |
| Atributos fuera de muestreo (48.000 preguntas/modelo) | 96,29 % | 95,04 % | 86,78 % | 43,98 %* |
| Latencia p50 | 265,7 ms | no disponible | 1161,9 ms | no disponible |
| Latencia p95 | 384,9 ms | no disponible | 2811,2 ms | no disponible |

Resultados adicionales reportados:

| Metrica | Valor |
|---|---|
| Diferencia frente a jev en tarea principal | +13,26 pp |
| Diferencia frente a jev en atributos fuera de muestreo | +9,51 pp |
| Balance por pregunta en tarea principal | 2801 victorias / 813 derrotas (77,5 %, ratio 3,4:1) |
| Comparativa de latencia frente a jev | ~4,4 veces mas rapido |
| Validacion cruzada con conjunto nuevo ext6kb (seed=2027) | main 86,77 % / outscope 96,23 % (desviacion < 0,7 pp) |
| Tiempo de carga del modelo | ~5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no es generativo y esas pruebas no serian aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB solo de pesos en bfloat16 (encoder + cabeza), con un consumo total estimado de 10-12 GB contando activaciones y buffers. Las cifras son una estimacion derivada del recuento de parametros, no un dato publicado.
- Cuantizaciones inferiores a bf16: no documentadas por el autor. En el repositorio no se distribuyen pesos GGUF, AWQ ni GPTQ.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para despliegue en una sola tarjeta con margen; RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) deberian ser suficientes en bfloat16; A100, H100 o L40S para alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM en bfloat16.
- Opciones de despliegue: la arquitectura es personalizada (encoder bidireccional mas cabeza MLP), por lo que requiere el cargador propio `amos30_loader.py` incluido en el repositorio, que construye un objeto compatible con `laya.Agent`. Dependencias declaradas: `torch`, `transformers`, `safetensors` y el paquete `laya` (convaiinnovations/laya-multilingual). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia p50 de 265,7 ms y p95 de 384,9 ms medidas sobre 12.000 llamadas reales de API con truncacion de 1024 tokens; la model card no especifica el hardware empleado en esa medicion. Throughput (peticiones por segundo) no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Atributos fuera de muestreo | Latencia p50 | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| amos-2.6 | ~4,16 B (encoder 4B + cabeza 157 M) | 1024 tokens | 86,11 % | 96,29 % | 265,7 ms | Apache-2.0, pesos en safetensors, requiere cargador propio |
| amos-2.5 | no disponible | no disponible | 79,04 % | 95,04 % | no disponible | Version anterior del mismo autor; disponibilidad no detallada |
| jev | no disponible | no disponible | 72,85 % | 86,78 % | 1161,9 ms | API comercial, linea base cerrada |
| laya | no disponible | no disponible | 44,73 %* | 43,98 %* | no disponible | Modelo de decision ligero de terceros; el paquete `laya` se cita como dependencia |

No se dispone de comparativas con clasificadores tipo BERT/RoBERTa ni con LLM generativos usados como clasificadores dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: cualquier tarea de respuesta libre, resumen, traduccion o dialogo queda fuera de su alcance por diseno.
- La model card reconoce que la formacion esta centrada en finanzas, SMS y texto general; para dominios regulados o muy tecnicos (medico, legal) hace falta ajuste fino especifico.
- Las probabilidades estan calibradas por temperatura, pero el autor admite cierto exceso de confianza en muestras con distribuciones extremas.
- Ventana de contexto efectiva muy corta (1024 tokens); documentos largos deben trocearse antes de la inferencia.
- El idioma de entrenamiento se describe principalmente en chino e ingles, pese a la etiqueta multilingue; el rendimiento real en otras lenguas no se documenta.
- Arquitectura personalizada: no funciona con runtimes estandar de LLM (vLLM, llama.cpp, Ollama, TGI) y exige el cargador propietario `amos30_loader.py`, lo que dificulta la portabilidad y el despliegue gestionado.
- La semantica de la primitiva `noul` y el papel del parametro `escalate` no se detallan en la model card; hay que inferirlos del ejemplo de uso y del fichero de configuracion.
- Discrepancia de metadatos: la ficha de HuggingFace indica un tamano de repositorio de 0,4 GB, mientras que la model card describe pesos fusionados de aproximadamente 8,4 GB. Conviene verificar el contenido real antes de planificar el despliegue.
- Los benchmarks publicados son internos del autor (comparacion con su modelo anterior y con una API comercial identificada solo como "jev", sin enlace publico); no se han replicado de forma independiente.
- Repositorio con 0 descargas y 1 "like" en el momento de la consulta: adopcion nula y comunidad practicamente inexistente.
- Licencia Apache-2.0, sin restricciones declaradas para uso comercial, siempre que se conserve el aviso de licencia y atribucion. Los pesos de Qwen3-4B subyacentes mantienen su propia licencia de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unfork/amos-2.6
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paquete Python citado como dependencia: convaiinnovations/laya-multilingual (referenciado en la model card)
- Cargador de inferencia: `amos30_loader.py`, distribuido en el propio repositorio de HuggingFace
- Configuracion de inferencia: `rl_agent_config.json`, en el repositorio
- Informe de evaluacion: la model card cita "AMOS-2.6 全量对比公开评测报告", sin enlace publico disponible
- Busquedas web: no se han encontrado enlaces relevantes. Los resultados devueltos (listados de modelos sin censura, guias sobre herramientas de IA en dark web, anuncio de GPT-6 Astra y resumenes de lanzamientos de septiembre de 2026) no guardan relacion con AMOS-2.6.
