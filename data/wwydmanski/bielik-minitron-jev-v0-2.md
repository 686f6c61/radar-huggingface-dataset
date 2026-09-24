# wwydmanski/bielik-minitron-jev-v0.2

## Resumen

bielik-minitron-jev-v0.2 es un modelo de decisión de tipo "System One" construido con la herramienta any2jev a partir de speakleash/Bielik-Minitron-7B-v3.0-Instruct. No es un modelo generativo: recibe un estado (por ejemplo, el texto de una incidencia) y devuelve respuestas tipadas Choice / Score / Noul con probabilidades calibradas, todo en una sola pasada forward. No produce texto libre en ningún caso. Lo publica Witold Wydmański (usuario wwydmanski) en HuggingFace bajo licencia Apache-2.0.

El interés de esta ficha radica en que representa una categoría distinta a la de los LLM conversacionales: en lugar de generar, este modelo clasifica y puntúa opciones contra un token de decisión mediante una cabeza específica. El repositorio contiene únicamente un adaptador LoRA (r=64), una cabeza pointer (dim 256), el tokenizer y ficheros de configuración y métricas, con un peso de 1,0 GB. El modelo base pertenece a la familia Bielik de speakleash, una iniciativa polaca de modelos abiertos.

Se enmarca en el ecosistema Jev, un enfoque propietario de TypeSafe AI (San Francisco, fundada en 2024, con acceso temprano limitado desde el 15 de septiembre de 2026). Este repositorio, sin embargo, es un proyecto independiente no afiliado a TypeSafe AI y se distribuye como adaptador entrenado sobre un modelo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64) sobre speakleash/Bielik-Minitron-7B-v3.0-Instruct, con cabeza pointer de dimension 256; modelo de decision "System One" (any2jev) |
| Parametros totales | No disponible (repo de 1,0 GB; modelo base de la clase 7B segun su nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Bielik se presenta como familia polaca/europea) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter/ y head.safetensors), mas tokenizer/ y any2jev.json |
| Pipeline | text-classification |
| Libreria | any2jev |
| Modo de operacion | packed |
| Temperatura | 1,632 (ajustada en validacion) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer preentrenado (Bielik-Minitron-7B-v3.0-Instruct) con dos componentes añadidos: un adaptador LoRA de rango 64 y una cabeza pointer de dimension 256 que puntúa cada opción contra el token de decisión. Durante el entrenamiento se eliminó la cabeza de vocabulario del modelo base, de modo que la salida no es una distribución sobre tokens de texto sino una puntuación tipada sobre las opciones (Choice / Score / Noul). El modo de delimitación configurado es "packed" y la temperatura de 1,632 se ajustó sobre el conjunto de validación.

Los datos de entrenamiento provienen de data/train_mix.jsonl, descrito como unos pocos miles de decisiones etiquetadas procedentes de un puñado de fuentes. El entrenamiento se realizó durante 3,0 épocas con learning rate 5e-05 y batch 2 x 2, con un tiempo total de 103 minutos en una única GPU de consumo. La model card indica "0.0 M parámetros entrenables" como cifra reportada en la configuración, lo que sugiere que el adaptador congela el modelo base y entrena un conjunto reducido de componentes. No se documentan fases de RLHF ni DPO.

## Capacidades

- Clasificación de decisiones tipadas: devuelve respuestas de tipo Choice (elegir entre opciones), Score (puntuación) y Noul, en una sola pasada forward.
- Probabilidades calibradas: las salidas incluyen probabilidades calibradas sobre el split de validación, no solo la etiqueta ganadora.
- Enrutamiento y triage: selecciona una categoría entre un conjunto de opciones (por ejemplo, "billing, technical, sales").
- Puntuación de urgencia o severidad: responde a preguntas booleanas o graduadas del tipo "¿es urgente?".
- Inferencia sin generación de texto: no produce tokens de lenguaje natural, lo que reduce coste y latencia frente a un LLM generativo.
- Servicio mediante API: expone POST /v1/systemone a través de `any2jev serve`, compatible con SDK TypeSafe.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de tickets de soporte: con `--state` se pasa el texto de la incidencia y con `--choice` la lista de equipos posibles; el modelo devuelve qué equipo debe atenderla con una probabilidad asociada, adecuado para automatizar la asignación inicial.
- Triage de urgencia: usando la salida Noul del tipo "¿es urgente?", el modelo permite priorizar colas de trabajo sin invocar un LLM generativo, reduciendo latencia y coste por decisión.
- Moderation y clasificación de contenido: dado un estado textual y un conjunto cerrado de categorías, el modelo puntúa la categoría más probable, útil en pipelines de moderación con taxonomías fijas.
- Priorización de leads comerciales: con una pregunta de tipo Score se puede asignar una puntuación de interés a cada lead a partir de su contexto, integrándolo en un CRM.
- Detección de intención en asistentes: clasificar la intención del usuario entre un conjunto acotado de acciones antes de derivar a un sistema generativo o a una herramienta concreta.
- Control de calidad y etiquetado: como clasificador de decisión para anotar grandes volúmenes de registros con categorías predefinidas, aprovechando que la inferencia es una única pasada.
- Decisión booleana en flujos automatizados: responder preguntas binarias ("¿requiere revisión humana?") con probabilidad calibrada para alimentar reglas de negocio o umbrales configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un fichero eval.json con métricas de held-out y afirma que las probabilidades están calibradas sobre el split de validación, pero no se incluyen cifras concretas (exactitud, F1, MMLU, HumanEval ni similares) en la información proporcionada.

## Requisitos de hardware

- El entrenamiento del adaptador se completó en 103 minutos en una única GPU de consumo, según la model card.
- VRAM estimada para inferencia en precision completa (fp16/bf16): del orden de 14-16 GB si se carga el modelo base de la clase 7B junto al adaptador (estimación basada en el tamano del modelo base, no confirmada en la model card).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100, H100, L40S o L4 para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para fp16 en consumo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en fp16 y en tarjetas de 12 GB (RTX 3060, RTX 4070) usando cuantizacion de 4 bits, siempre que se cargue el modelo base en ese formato.
- Opciones de despliegue: `any2jev serve` (endpoint POST /v1/systemone, compatible con el SDK TypeSafe). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El modelo resuelve la decisión en una sola pasada forward, lo que en principio es más rápido que la decodificación autoregresiva de un LLM generativo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bielik-minitron-jev-v0.2 | Modelo de decision (adaptador Jev sobre base 7B) | Adaptador LoRA r=64 sobre base de la clase 7B | No disponible | Apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| speakleash/Bielik-Minitron-7B-v3.0-Instruct | LLM generativo instruct | Clase 7B | No disponible | No disponible | HuggingFace |
| Jev (TypeSafe AI) | Modelo de decision propietario | No disponible | No disponible | Propietaria | Acceso temprano limitado desde 15-09-2026 |

La comparacion directa con el modelo base no es de igual a igual: Bielik-Minitron-7B-v3.0-Instruct genera texto, mientras que bielik-minitron-jev-v0.2 solo emite decisiones tipadas. Frente a Jev de TypeSafe AI, este repositorio es una implementacion independiente construida con any2jev y no esta afiliada a dicha empresa.

## Limitaciones y advertencias

- Entrenado sobre unos pocos miles de decisiones etiquetadas de un puñado de fuentes; el propio autor advierte de que la exactitud será menor fuera de la distribución de entrenamiento.
- Las probabilidades están calibradas sobre el split de validación y no constituyen una garantía por respuesta individual.
- No debe usarse para aritmética, fechas ni conteo: la model card recomienda mantener esos cálculos en código, siguiendo las indicaciones de la documentación de Jev.
- No genera texto, por lo que no sirve para tareas de redacción, resumen o conversación; su uso está restringido a decisiones tipadas.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe; el modelo base es de origen polaco, lo que puede condicionar su rendimiento en castellano.
- No se especifican requisitos de cuantizacion, contexto maximo ni compatibilidad con motores de inferencia distintos de any2jev.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo base puede tener sus propias condiciones que conviene verificar por separado.
- Proyecto independiente no afiliado a TypeSafe AI; el nombre "Jev" hace referencia al enfoque, no a una certificación oficial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni adopción comunitaria documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wwydmanski/bielik-minitron-jev-v0.2
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Herramienta any2jev: https://github.com/hwfengcs/any2jev
- Perfil del autor en HuggingFace: https://huggingface.co/wwydmanski
- Modelos del autor: https://huggingface.co/wwydmanski/models
- Jev (modelo de IA) en Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Comunidad Jev AI: https://www.jevai.org/
- Bielik.AI: https://bielik.ai/
