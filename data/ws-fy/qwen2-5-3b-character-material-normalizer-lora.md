# ws-fy/qwen2.5-3b-character-material-normalizer-lora

## Resumen

El modelo `ws-fy/qwen2.5-3b-character-material-normalizer-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre `Qwen/Qwen2.5-3B-Instruct` y publicado por el usuario `ws-fy`. Su proposito es muy concreto: convertir material bruto de guiones de videojuegos y colecciones de frases de personajes ficticios (con cabeceras de copyright, creditos de actores de doblaje, marcadores de capitulo, etiquetas `【Titulo】`, lineas de dialogo sin hablante asignado, marcadores `？？？` y narracion de accion) en JSON estructurado listo para entrenar modelos de dialogo. El adaptador resuelve un problema de ingenieria de datos: la limpieza de material de personajes suele requerir parsers regex que se reescriben cada vez que cambia el formato de origen.

El modelo no es un modelo generalista ni un asistente conversacional; es una herramienta de extraccion estructurada que transforma "chunk sucio de entrada" en "JSON de salida" con dos campos: `samples` (dialogos reales ya en formato sharegpt) y `lines` (monologos y frases sueltas del personaje como referencia de estilo). El adaptador esta entrenado para descartar metadatos y, deliberadamente, no convertir monologos en dialogos inventando un interlocutor.

Tecnicamente es un LoRA de rango 16 y alpha 32 sobre las 7 proyecciones del transformer base, con 29,9 millones de parametros entrenables (0,96 % del total), entrenado durante 1 epoca con contexto de 1024 tokens y precision FP16. La relevancia actual radica en que demuestra un patron de entrenamiento por "degradacion inversa" de datos reales, en lugar de generar etiquetas con un LLM mayor, y en que documenta con honestidad un limite operativo duro (chunking a ~900 caracteres) y unas metricas de rendimiento modestas (73,1 % de recall, 21,3 % de fuga de hablante).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | 3B (modelo base) + 29,9 M entrenables en el adaptador (0,96 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento); el modelo base soporta contextos mayores, no especificado en la informacion |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | en, zh (entrenado solo con material en chino; la entrada en ingles no esta probada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parametros. El LoRA usa rango 16, alpha 32, dropout 0,05 y se aplica a las 7 proyecciones de atencion y MLP del modelo base. El entrenamiento se realizo con llama-factory durante 1 epoca, learning rate 1e-4 con scheduler coseno y warmup del 5 %, contexto de 1024 tokens y precision FP16 (GPU Turing, sin BF16). La perdida final fue de 0,0290 en entrenamiento y 0,00182 en evaluacion.

La innovacion metodologica es el enfoque de "degradacion inversa": en lugar de generar etiquetas con un LLM mayor (con el riesgo de introducir errores), se parte de dialogos reales ya existentes como etiqueta correcta y se renderizan como entrada deliberadamente sucia (cabeceras, corchetes `【】`, acciones entre parentesis `（acciones）`, lineas partidas por saltos de linea, marcadores `？？？`, reglas separadoras, mezcla de dos puntos de ancho completo y medio). El modelo aprende a invertir esa corrupcion y devolver el JSON. El conjunto de datos consta de 2.478 muestras (130 reservadas para evaluacion), procedentes de 300 pares pregunta-respuesta y 120 citas de 20 personajes ficticios, mas 1.520 pares de dialogo. Se anadieron dos casos duros tras una primera ronda de evaluacion fallida: escenas en las que el personaje objetivo no habla (la salida correcta es vacia) y escenas con dos hablantes distintos (el lado del usuario recibe prefijo `Nombre:` para desambiguar). Un tercio del conjunto usa especificamente el formato de coleccion de lineas de voz: una linea `【Titulo】` seguida de dialogo sin etiqueta de hablante.

## Capacidades

- Extraccion estructurada: convierte material bruto de guiones en JSON con campos `char`, `samples` y `lines`.
- Clasificacion de dialogo frente a monologo: separa intercambios reales (van a `samples` en formato sharegpt) de frases sueltas del personaje (van a `lines`).
- Filtrado de metadatos: descarta cabeceras de copyright, creditos de doblaje, titulos, facciones y marcadores de capitulo.
- Atribucion de hablante: distingue lineas del personaje objetivo de las de otros hablantes, incluidos los marcados como `？？？`.
- Manejo de escenas sin el personaje objetivo: devuelve salida vacia cuando el personaje no aparece, en lugar de atribuirle lineas ajenas.
- Procesamiento por chunks: disenado para operar sobre fragmentos de ~900 caracteres.
- No soporta tool calling ni function calling de forma nativa (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidades multilingues limitadas a chino (entrenamiento) e ingles (no probado).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Limpieza de guiones de videojuegos para pipelines de LoRA de personaje: el adaptador toma el script bruto de un juego, elimina cabeceras y creditos, y devuelve dialogos en formato sharegpt listos para que un modelo de expansion de dialogo los continue. Es adecuado porque el entrenamiento se hizo precisamente con el layout de lineas de voz (`【Titulo】` seguido de dialogo sin etiqueta), el formato mas comun en juegos.
- Preparacion de datasets de roleplay a partir de colecciones de citas: permite convertir ficheros de frases de personajes ficticios en pares de dialogo estructurados sin reescribir un parser regex cada vez que cambia el formato de origen.
- Extraccion de lineas de estilo para few-shot prompting: el campo `lines` conserva los monologos del personaje como referencia de estilo, utiles para condicionar un modelo generativo mayor en tareas de imitacion de personaje.
- Limpieza de transcripciones con hablantes desconocidos: el modelo maneja marcadores `？？？` y prefijos `Nombre:` para desambiguar escenas con dos hablantes, lo que lo hace util en transcripciones de audio sin diarizacion completa.
- Preprocesado en pipelines de data cleaning: al devolver JSON estricto (con tasa de parseo de 19/19 chunks con reparacion de truncamiento), se puede integrar como etapa intermedia en un pipeline automatizado que valide el JSON y derive el resto del procesamiento.
- Borrador asistido con revision humana: dado su recall del 73,1 % y su fuga de hablante del 21,3 %, es adecuado como generador de borradores que un revisor humano corrige, no como extractor autonomo en produccion.
- Prototipado rapido de datasets de personaje en equipos pequenos: al requerir solo una GPU consumer para el modelo base de 3B en FP16, permite montar un pipeline de limpieza sin infraestructura dedicada.

## Benchmarks y rendimiento

Evaluado sobre el guion bruto y sin limpiar de un juego, con un personaje y un formato no vistos. La referencia son 330 lineas del personaje objetivo y 50 lineas de otros hablantes, producidas por un extractor basado en reglas escrito a mano.

| Metrica | Resultado |
|---|---|
| Tasa de parseo JSON | 19/19 chunks (con reparacion de truncamiento) |
| Recall de lineas | 73,1 % |
| Fuga de hablante (lineas de otros atribuidas al objetivo) | 21,3 % |
| Contaminacion de metadatos | 1 ocurrencia en todo el fichero |

Efecto del tamano de chunk sobre el mismo segmento de lineas de voz de 1.132 caracteres:

| Tamano de chunk | Lineas extraidas | Acierto sobre ground-truth |
|---|---|---|
| 2000 caracteres | 2 | 6 % |
| 900 caracteres | 32 | 89 % |
| 450 caracteres | 32 | 89 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantizacion de 8 bits, unos 3,5-4 GB; en 4 bits, unos 2-2,5 GB (estimaciones estandar para un modelo de 3B, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el autor entreno en una GPU Turing (por ejemplo, RTX 2060/2070/2080 o T4) sin BF16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.); en 4 bits cabe en GPUs de 4 GB.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor); llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF; vLLM y TGI soportan adaptadores LoRA sobre Qwen2.5, aunque no estan documentados por el autor para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-character-material-normalizer-lora | 3B + 29,9 M (LoRA) | 1024 (entrenamiento) | Extraccion estructurada de material de personajes | apache-2.0 | HuggingFace (26 descargas) |
| Qwen2.5-3B-Instruct (base) | 3B | 32.768 (modelo base) | Asistente generalista | apache-2.0 | HuggingFace |
| Extractor basado en reglas (referencia del autor) | no aplica | no aplica | Extraccion con regex | no aplica | Codigo propio |

No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Recall del 73,1 %: aproximadamente una cuarta parte de las lineas se pierde.
- Fuga de hablante del 21,3 %: las lineas cortas entre comillas de otros personajes (por ejemplo, `[Blade] "…"`) siguen atribuyendose incorrectamente al objetivo, porque las lineas de otros hablantes en el entrenamiento son mayoritariamente largas.
- No debe ejecutarse sin supervision en produccion; el propio autor recomienda usarlo para generar borradores y revisar despues.
- Entrenado exclusivamente con material en chino; la entrada en ingles no esta probada.
- El tamano de chunk de ~900 caracteres es un requisito duro, no un parametro ajustable: con 2000 caracteres el acierto cae al 6 % porque el modelo de 3B abandona pronto ante listas densas.
- El autor senala que 3B es el techo para esta tarea de extraccion intensiva en copia y que una base de 7B probablemente mejoraria directamente los resultados.
- Riesgo de alucinacion: el modelo podria inventar interlocutores o atribuir lineas, aunque el diseno evita deliberadamente convertir monologos en dialogos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen2.5-3B-Instruct.
- Solo 26 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ws-fy/qwen2.5-3b-character-material-normalizer-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- llama-factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
