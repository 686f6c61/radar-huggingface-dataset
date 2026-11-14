# wjwjwjwjwjww/Qwen3.5-0.8B-TextPreprocessor

## Resumen

Qwen3.5-0.8B-TextPreprocessor es un modelo de 852.985.920 parámetros (aproximadamente 0,85 mil millones) derivado por fine-tuning LoRA SFT del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario wjwjwjwjwjww bajo licencia Apache-2.0. Su proposito no es la generacion generica de texto, sino una tarea acotada de preprocesamiento: convertir texto "sucio" (pegado por usuarios, con ruido, etiquetas HTML, caracteres invisibles, espacios inconsistentes) en texto limpio y normalizado listo para alimentar modelos downstream. El modelo fue destilado a partir de DeepSeek-V4.1-Flash como "profesor" para generar entradas realistas.

La restriccion funcional es deliberada y estricta: solo modifica formato, nunca contenido. No corrige erratas, no traduces, no resume, no anonimiza. Esta separacion de responsabilidades lo convierte en una pieza util en pipelines RAG, ingesta documental o interfaces de chat donde la calidad del input condiciona la calidad del output del LLM principal.

Es relevante ahora por su tamano reducido (cabe en GPU de consumo, con un pico de 3,15 GiB durante entrenamiento en una RTX 4060), su licencia permisiva y su enfoque de "modelo pequeno especializado" frente a la tendencia de usar LLMs gigantes para tareas de normalizacion que podrian resolverse con reglas. El autor documenta explicitamente que una implementacion puramente basada en reglas obtiene mejores metricas que el propio modelo en sus test sets, lo que enmarca el modelo como una alternativa neuronal con tolerancia a distribuciones no vistas, no como un reemplazo de las reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion linear (estructura "Ahmed", 24 capas) + torre de vision; este modelo usa solo el canal de texto |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens; recomendacion practica de segmentar entradas > ~3000 caracteres) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa float16 en el ejemplo de inferencia) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Parametros entrenables (LoRA) | 7,3 M (r=16, alpha=32, dropout=0,05) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Modelo profesor (destilacion) | DeepSeek-V4.1-Flash |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, descrita por el autor como "estructura Ahmed": 24 capas con atencion linear hibrida y una torre de vision que aqui no se emplea (solo se activa el canal de texto). Sobre esa base se aplico un fine-tuning LoRA SFT con r=16, alpha=32, dropout de 0,05, 7,3 millones de parametros entrenables, precision bfloat16, longitud de secuencia 512, batch efectivo 1x16, learning rate 0,0001 y 2 epochs (1348 pasos). El entrenamiento se ejecuto en una NVIDIA GeForce RTX 4060 con un pico de 3,15 GiB de VRAM.

Los datos de entrenamiento combinan dos fuentes: 9012 ejemplos de sintesis por reglas (corpus semilla limpio, 11 inyectores de ruido, etiquetas generadas por un oracle deterministico con reversibilidad verificada al 100%) y 1774 ejemplos generados por el profesor DeepSeek-V4.1-Flash, cuya salida solo se aceptaba si su similitud con el oracle de reglas era ≥ 0,90, con el fin de detectar y penalizar "reescrituras fuera de alcance" del profesor. La innovacion tecnica principal no esta en la arquitectura sino en el diseno del dataset: separar la capa de reparacion determinista (repair_mojibake, implementado como codigo puro) de la capa de normalizacion de formato aprendida por el modelo, evitando ensenar al modelo tareas (como reparar mojibake byte-level) que un 0,8B no puede aprender sin alucinar.

## Capacidades

- Normalizacion de formato de texto: eliminacion de caracteres de ancho cero, BOM y caracteres de control.
- Eliminacion de etiquetas HTML y decodificacion de entidades HTML.
- Conversion de letras y digitos de ancho completo (full-width) a medio ancho (half-width).
- Conversion de puntuacion de medio ancho a ancho completo en texto chino.
- Compresion de repeticiones de caracteres iguales o superiores a 3 apariciones.
- Normalizacion de espacios en blanco y fusion de lineas partidas por maquetacion.
- Deteccion de texto ya limpio (capacidad de "no tocar" entradas que no requieren cambios).
- Generacion de texto conversacional (pipeline text-generation) con plantilla de chat.
- Multilingue limitado a chino e ingles.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- No corrige erratas, no traduces, no resume, no expande, no anonimiza datos personales, no reordena parrafos y no preserva alineacion de columnas en tablas.

## Casos de uso

- Preprocesamiento de entradas de usuario en interfaces de chat: antes de enviar el prompt al LLM principal, el modelo limpia caracteres invisibles, etiquetas HTML residuales y espacios anomales, reduciendo tokens basura y ruido que degradan la respuesta del modelo grande.
- Ingesta documental para pipelines RAG: al procesar paginas web, PDFs convertidos a texto o exportaciones de CMS, el modelo elimina etiquetas y normaliza puntuacion y espaciado antes de la fase de chunking y embedding.
- Normalizacion de texto en sistemas de traduccion automatica: al uniformar puntuacion de ancho completo/medio y espacios, se reducen variaciones de tokenizacion que afectan negativamente a modelos de traduccion chino-ingles.
- Limpieza previa a tareas de clasificacion o moderacion de contenido: entradas procedentes de formularios o APIs con HTML embebido se normalizan para que el clasificador reciba texto plano consistente.
- Preparacion de corpus para fine-tuning: al filtrar ruido de formato en datasets scrapeados, se reduce la proporcion de ejemplos contaminados que ensenan al modelo patrones indeseados.
- Estandarizacion de texto en herramientas de busqueda interna: la compresion de repeticiones y la normalizacion de espacios mejoran la coincidencia entre consultas de usuario y documentos indexados.
- Uso como componente de bajo coste en entornos con GPU de consumo: con ~0,85B parametros y pesos en safetensors, puede servirse junto a otros servicios en una unica GPU, a diferencia de modelos de limpieza de mayor tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (comparados con una linea base puramente basada en reglas, `src/cleaner/normalizer.py`):

| Test set | Muestras | Coincidencia exacta | Similitud de caracteres | Tasa de omision | Tasa de insercion |
|---|---|---|---|---|---|
| rule/test (sintetico por reglas) | 600 | 91,5% | 0,994 | 0,007 | 0,004 |
| rule/test (linea base de reglas) | 600 | 100,0% | 1,000 | 0,000 | 0,000 |
| teacher/test_v3 (generado por profesor) | 148 | 86,5% | 0,997 | 0,003 | 0,003 |
| teacher/test_v3 (linea base de reglas) | 148 | 100,0% | 1,000 | 0,000 | 0,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; con 852.985.920 parametros en float16 el peso ocupa aproximadamente 1,6 GB, y el ejemplo de la model card usa `dtype="float16"` con `device_map="auto"`.
- Entrenamiento documentado: NVIDIA GeForce RTX 4060 con pico de 3,15 GiB de VRAM (LoRA SFT, bfloat16, secuencia 512).
- Cabe en GPU de consumo: por tamano de pesos, si; el autor entreno en una RTX 4060 y no se documentan requisitos mayores para inferencia.
- GPU de datacenter (A100, H100) sobredimensionadas para este modelo; su uso tendria sentido solo por agregacion con otros servicios.
- Opciones de despliegue: la model card muestra `transformers` (`AutoModelForImageTextToText`, `AutoTokenizer`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.
- Parametros de generacion recomendados: decodificacion greedy (`do_sample=False`), `max_new_tokens` aproximadamente 1,4 veces la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-TextPreprocessor | 852.985.920 | no disponible (entrenado a 512) | Limpieza y normalizacion de formato | Apache-2.0 | Hugging Face, ModelScope, GitHub |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generacion general multimodal (texto + vision) | Apache-2.0 | Hugging Face |
| Linea base de reglas del autor (`cleaner/normalizer.py`) | 0 (codigo) | no aplica | Limpieza determinista por reglas | Apache-2.0 (segun repo) | GitHub |
| Modelos de limpieza de texto de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa mas relevante es interna: la implementacion por reglas del propio autor supera al modelo en coincidencia exacta (100% frente a 91,5% y 86,5%) y en tasas de omision e insercion (0,000 frente a 0,007/0,003 y 0,004/0,003). El modelo aporta valor en escenarios donde las reglas fallan por distribuciones no contempladas, no en escenarios cubiertos por el oracle.

## Limitaciones y advertencias

- No repara mojibake: la reparacion byte-level debe hacerse antes con `repair_mojibake()` del paquete `cleaner.normalizer`; ensenar esa tarea al modelo provocaba alucinacion de contenido completo.
- No corrige erratas, no traduces, no resume, no expande ni anonimiza; usarlo para esas tareas produce resultados fuera de distribucion.
- Entradas superiores a ~3000 caracteres deben segmentarse manualmente.
- Mojibake con doble corrupcion (repeated GBK/UTF-8 transcoding) queda intacto.
- La alineacion de columnas en tablas se pierde por la compresion de espacios.
- Las repeticiones de exactamente 2 caracteres (`去去`, `不不会会`) no se tocan, por ser叠词 validas en chino; esto implica falsos negativos en casos de ruido real de dos caracteres.
- Idiomas limitados a chino e ingles; rendimiento en otros idiomas no documentado.
- Riesgo de alucinacion residual en entradas fuera de distribucion, mitigado parcialmente por la restriccion "solo formato".
- El modelo es inferior a la linea base de reglas en sus propios test sets; para produccion, evaluar si las reglas cubren el caso de uso antes de desplegar el modelo.
- Uso comercial permitido por Apache-2.0, pero el modelo base Qwen3.5-0.8B y las condiciones de uso del profesor DeepSeek-V4.1-Flash (cuyos pesos no se distribuyen) deben verificarse por separado.
- El ejemplo de la model card usa `AutoModelForImageTextToText` pese a que solo se emplea el canal de texto; verificar compatibilidad con la version de `transformers` usada en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: senal de madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/wjwjwjwjwjww/Qwen3.5-0.8B-TextPreprocessor
- ModelScope: https://www.modelscope.cn/models/w666j66666/Qwen3.5-0.8B-TextPreprocessor
- GitHub (codigo, scripts de entrenamiento y evaluacion, datos de evaluacion): https://github.com/wj239951/Qwen3.5-0.8B-TextPreprocessor
- Pesos empaquetados v1.0.0 (1,34 GB): https://github.com/wj239951/Qwen3.5-0.8B-TextPreprocessor/releases/download/v1.0.0/Qwen3.5-0.8B-TextPreprocessor-v1.0.0.zip
- Especificacion de tareas (TASK_SPEC.md, en el repositorio GitHub): https://github.com/wj239951/Qwen3.5-0.8B-TextPreprocessor/blob/main/TASK_SPEC.md
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
