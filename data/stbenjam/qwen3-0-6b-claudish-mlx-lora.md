# stbenjam/qwen3-0.6b-claudish-mlx-lora

## Resumen

stbenjam/qwen3-0.6b-claudish-mlx-lora es un adaptador LoRA en formato MLX entrenado sobre Qwen/Qwen3-0.6B. No es un modelo independiente ni un adaptador PEFT: requiere los pesos base originales y se carga con la librería MLX LM en Apple Silicon. Su objetivo es puramente experimental y educativo: imitar de forma exagerada y paródica un estilo de respuesta muy verboso, con encabezados, listas y giros retóricos, apodado "Claudish" por el autor. No está afiliado a Anthropic ni contiene pesos ni transcripciones de Claude.

El adaptador aplica LoRA de rango 16 sobre las 12 capas finales del transformer, con 4,325 millones de parámetros entrenables. Se entrenó con 390 conversaciones sintéticas originales repartidas en 78 temas y 16 conversaciones de validación sobre ocho temas distintos. La selección del checkpoint se hizo por pérdida de validación (actualización 100 de 300). El resultado medido por el propio autor es un aumento de la longitud media de respuesta de 100 a 300 palabras y una mejora de 0/21 a 18/21 en una comprobación casera de longitud, presencia de encabezados y marcadores retóricos.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de posentrenamiento local de bajo coste en Apple Silicon (todo se ejecutó en un M4 Pro con 48 GB de memoria unificada), con scripts de entrenamiento, evaluación y chat publicados. No es un asistente general fiable: puede inventar hechos, no tiene herramientas ni información en vivo y su memoria conversacional es defectuosa por diseño del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen3-0.6B); no es un modelo completo |
| Parametros totales | 0,6B en los pesos base de Qwen3-0.6B; el adaptador anade 4,325 M parametros entrenables |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; heredada del modelo base Qwen3-0.6B |
| Tipos de cuantizacion | Adaptador MLX sin cuantizacion declarada; existe una version GGUF fusionada del mismo autor con cuantizacion Q8_0. Otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en), unico idioma declarado y usado en el entrenamiento |
| Licencia | Apache-2.0 (codigo y adaptador); pesos base Qwen3-0.6B tambien Apache-2.0; datos externos de haiku con atribucion CC BY 4.0 cuando corresponde |
| Formato de pesos | Adaptador MLX (no PEFT, no cargable directamente con Transformers/PEFT sin conversion); repo hermano en GGUF |
| Configuracion LoRA | Rango 16, aplicado a las 12 capas finales |
| Hiperparametros de entrenamiento | Batch size 2, learning rate 0,00005, dropout 0,05, semilla 314, 300 pasos con seleccion en el paso 100 |
| Dataset de entrenamiento | 390 conversaciones sinteticas sobre 78 temas; 16 conversaciones de validacion sobre 8 temas |
| Modo de inferencia | Sin thinking (enable_thinking=False) obligatorio para coincidir con el entrenamiento |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only de aproximadamente 600 millones de parametros en configuracion densa. Sobre el se aplica un adaptador LoRA de rango 16 restringido a las 12 capas finales, lo que da 4,325 millones de parametros entrenables. El entrenamiento fue supervisado (SFT) con ejemplos sinteticos, sin RLHF ni DPO. La card indica explicitamente que el estilo proviene del ajuste supervisado y que no se inyecta ninguna instruccion de estilo en el momento de la inferencia: el prompt de sistema por defecto es simplemente `You are a helpful assistant.`

Los datos son 390 conversaciones modulares originales sobre 78 temas, mas 16 conversaciones de validacion sobre ocho temas separados. El autor advierte que los ejemplos comparten pasajes retoricos, de modo que no equivalen a 390 ensayos independientes, y que las referencias de escritura publica que inspiraron el estilo estan documentadas en `SOURCES.md`. El entrenamiento se ejecuto localmente en un M4 Pro con 48 GB de memoria unificada, con batch size 2, learning rate 5e-5, dropout 0,05 y semilla 314; de los 300 pasos se selecciono la actualizacion 100 por perdida de validacion, registrada en `selection.json`. El SHA-256 del adaptador es `29bd16a3eef96840d537b7f0dc4d5bfd58b107fd57b31d049a6edc7c07ac63d2`.

Como innovacion practica, el autor documenta un modo de chat que reinicia el contexto en cada mensaje para evitar que el modelo copie poemas o ensayos anteriores, y una bandera `--history` experimental para memoria conversacional. Tambien se guarda localmente una plantilla de tokenizador modificada para forzar el modo sin thinking, sin tocar los pesos base.

## Capacidades

- Generacion de texto en ingles con un registro deliberadamente verboso, plagado de encabezados, listas y marcadores retoricos.
- Transferencia de estilo: el objetivo declarado es la imitacion parodica de un estilo concreto, no la resolucion de tareas.
- Respuesta a partir de un prompt de sistema generico, sin necesidad de instruccion de estilo en inferencia.
- Funcionamiento completamente local y offline sobre Apple Silicon mediante MLX LM.
- Ninguna capacidad de tool calling ni function calling: la card indica que el modelo "no tiene herramientas".
- Ninguna capacidad de agente ni de razonamiento multi-paso verificable; no hay evaluacion de ese tipo.
- Sin acceso a informacion en vivo ni a busqueda web.
- Multilinguismo: no soportado. Solo ingles declarado.
- Vision, audio y otras modalidades: no disponibles.
- Modo pensamiento (thinking) de Qwen3: desactivado y explicitamente incompatible con el entrenamiento recibido; se debe usar `enable_thinking=False`.

## Casos de uso

- Estudio de posentrenamiento local: el repositorio `posttrain-demo` incluye scripts de entrenamiento, evaluacion y chat, lo que permite reproducir un ciclo completo de LoRA sobre un modelo de 0,6B en un portatil Apple Silicon con 48 GB de memoria unificada.
- Docencia sobre transferencia de estilo: sirve para mostrar como un SFT pequeno modifica rasgos medibles (longitud media de 100 a 300 palabras, 18/21 en la comprobacion de marcadores) sin tocar los pesos base.
- Generacion de texto de relleno con registro pomposo: util para prototipos de interfaz, maquetas o demos donde se necesita texto largo y deliberadamente exagerado, asumiendo que los hechos pueden ser falsos.
- Pruebas de plantillas de chat y tokenizador: el ejemplo de Python documenta el uso de `apply_chat_template` con `add_generation_prompt=True` y `enable_thinking=False`, util para validar pipelines de inferencia MLX.
- Experimentos de olvido y arrastre de contexto: el fallo conocido de que el modelo sigue respondiendo a la pregunta anterior tras un cambio de tema lo convierte en un caso de estudio sobre degradacion de la memoria conversacional en adaptadores pequenos.
- Comparacion de formatos de despliegue: permite contrastar el flujo MLX (adaptador separado sobre pesos base) con el flujo GGUF/Ollama del repositorio hermano, que ya incluye los pesos fusionados y una plantilla de mensaje nuevo.
- Generacion de ejemplos sinteticos de estilo: los propios datos de entrenamiento son sinteticos y modulares, de modo que el metodo es reutilizable para construir corpus de estilo controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor solo reporta una evaluacion propia, no calibrada:

| Metrica | Antes (base) | Despues (adaptador) |
|---|---|---|
| Longitud media de respuesta | 100 palabras | 300 palabras |
| Comprobacion casera de longitud, encabezados y marcadores retoricos | 0/21 | 18/21 |
| Muestra evaluada | 21 respuestas | 21 respuestas |

El autor advierte de forma explicita que esta comprobacion "no es una medida calibrada de parecido a Claude ni de calidad de respuesta".

## Requisitos de hardware

- Los pesos base son de 0,6B parametros, por lo que la inferencia cabe en cualquier GPU de consumo e incluso en hardware integrado.
- VRAM estimada: en torno a 1,5-2 GB en fp16 para los pesos base mas el adaptador; aproximadamente 0,5-1 GB si se usa una version cuantizada a 4 bits. Son estimaciones derivadas del tamano del modelo, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tambien CPU. El entrenamiento documentado se hizo en un Apple M4 Pro con 48 GB de memoria unificada, pero el modelo es muy inferior a ese presupuesto.
- Cabe en GPU de consumo: si, en practicamente todas (RTX 3060, RTX 4060, RTX 4090, etc.), y en Apple Silicon de cualquier generacion reciente.
- Opciones de despliegue: MLX LM 0.31.3 con MLX 0.32.2 (ruta soportada y probada por el autor); Ollama o llama.cpp a traves del repositorio hermano GGUF `stbenjam/qwen3-0.6b-claudish-gguf`; vLLM o TGI no estan soportados de forma directa porque el artefacto es un adaptador MLX y no un adaptador PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stbenjam/qwen3-0.6b-claudish-mlx-lora | 0,6B base + 4,325 M entrenables | Heredado del base, no especificado | Adaptador LoRA MLX | Apache-2.0 | HuggingFace, requiere MLX LM |
| stbenjam/qwen3-0.6b-claudish-gguf | 0,6B fusionado | Heredado del base, no especificado | GGUF con pesos fusionados | Apache-2.0 | HuggingFace, ejecutable con Ollama |
| Qwen/Qwen3-0.6B | 0,6B | No disponible en la informacion proporcionada | Pesos completos | Apache-2.0 | HuggingFace |
| Adaptadores de estilo genericos para modelos pequenos | Variable | Variable | LoRA PEFT | Variable | No disponible |

La comparativa se limita a lo documentado en la informacion proporcionada. La diferencia funcional relevante frente al modelo base es el registro estilistico inducido por el SFT; no hay datos que permitan comparar calidad de respuesta ni capacidades de razonamiento con alternativas.

## Limitaciones y advertencias

- No es un asistente general fiable: la propia model card lo describe como un experimento educativo de estilo, no como un asistente utilizable en produccion.
- Riesgo alto de alucinacion: el autor confirma que el modelo puede inventar hechos.
- Reutiliza pasajes de forma literal y puede repetir fragmentos de ejemplos anteriores.
- Memoria conversacional defectuosa: con historial activado, puede seguir respondiendo a la pregunta previa tras un cambio de tema. Un intento posterior de entrenamiento no corrigio el problema de forma fiable, por lo que se publico el adaptador original. El chat de demostracion reinicia el contexto en cada mensaje como solucion provisional.
- Injerto de idioma: solo ingles. No hay soporte multilingue declarado.
- Limitacion de formato: no hay posprocesado de salida que fuerce la forma deseada; el estilo depende enteramente del adaptador.
- Sin herramientas, sin function calling y sin informacion en vivo.
- Incompatibilidad de modo: es obligatorio desactivar el modo thinking de Qwen3 para coincidir con el entrenamiento; usar el modelo con thinking habilitado produce un comportamiento no validado.
- No cargable con Transformers ni PEFT de forma directa; requiere MLX LM o la conversion al repositorio GGUF.
- Restricciones de licencia: el codigo y el adaptador son Apache-2.0 y el modelo base tambien, por lo que el uso comercial en principio esta permitido, pero los datos externos de haiku conservan su atribucion CC BY 4.0 donde aplique y deben respetarse los avisos de `LICENSE` y `NOTICE`.
- El repositorio no implica respaldo de Qwen, Anthropic ni del creador del conjunto de datos. La model card subraya que no se incluyen pesos de Claude ni transcripciones raspadas de Claude.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento comunitario documentado.
- Resultados de la busqueda web no relevantes: las consultas devolvieron paginas sobre fichas tecnicas de automocion, sin ninguna fuente util sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stbenjam/qwen3-0.6b-claudish-mlx-lora
- Version GGUF fusionada: https://huggingface.co/stbenjam/qwen3-0.6b-claudish-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de entrenamiento, evaluacion y chat: https://github.com/stbenjam/posttrain-demo
- Resultados completos y limitaciones: https://github.com/stbenjam/posttrain-demo/blob/main/claudish/RESULTS.md
- Referencias de escritura que inspiraron el estilo: SOURCES.md (referenciado en la model card dentro del repositorio del autor)
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo.
