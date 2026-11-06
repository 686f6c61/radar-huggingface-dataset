# tanepiper/termite-command-4b

## Resumen

termite-command-4b es un modelo de lenguaje especializado en la traducción de lenguaje natural a comandos de shell, desarrollado por Tane Piper (tanepiper) como componente del proyecto termite, una herramienta que valida cada comando antes de permitir su ejecución. El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.022.468.096 parámetros, y se ha ajustado mediante LoRA para dos tareas concretas: generar comandos de shell útiles a partir de peticiones cotidianas y rechazar peticiones hostiles o maliciosas.

La relevancia del modelo reside en su enfoque de seguridad por capas: no pretende ser un filtro de seguridad autónomo, sino una primera barrera que reduce la frecuencia con la que se escriben comandos peligrosos, delegando la decisión final a las reglas deterministas de termite. La versión 0.1 se distribuye únicamente en formato GGUF con cuantización Q8_0 (4,28 GB) y está pensada para ejecutarse en local mediante llama.cpp.

El modelo está entrenado exclusivamente en inglés, emplea la licencia Apache 2.0 y espera el system prompt y el formato JSON propios de termite; fuera de ese contexto, su comportamiento puede degradarse notablemente, incluyendo respuestas inventadas o rechazos injustificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507), ajuste LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (configuracion de referencia en llama-server; el modelo base soporta contexto mayor, no confirmado para este ajuste) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | Ingles (algunas filas de rechazo en aleman y frances; sin pruebas adicionales) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507 (revision `cdbee75f17c01a7cc42f958dc650907174af0554`). El ajuste se realizó con LoRA de rango 16 y alpha 32 aplicado a todas las capas lineales, con una sola pasada, learning rate 0,0001 y batch size 8; posteriormente los adaptadores se fusionaron en los pesos base. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp en cuantización Q8_0.

El conjunto de entrenamiento consta de 2.913 filas no publicadas, procedentes de los datasets NL2SH-ALFA (MIT) y nl2shell-training-v3 (Apache 2.0), más filas escritas a mano. Cada comando objetivo fue filtrado contra las reglas de termite y se eliminaron las filas que coincidían con el conjunto de test. Los ejemplos hostiles se utilizan para enseñar rechazo, de modo que ningún comando dañino es objetivo de entrenamiento. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de comandos de shell a partir de peticiones en lenguaje natural, en el formato JSON propio de termite.
- Rechazo de peticiones hostiles: en la evaluación externa rechazó las 30 peticiones dañinas.
- Resistencia a prompt injection: respondió solo 2 de 30 peticiones de inyección externas (frente a 11 del modelo base).
- Etiquetado de riesgo por comando (campo `risk`), aunque el propio autor advierte que es la opinión del modelo y no debe usarse como control de seguridad.
- Respuesta a peticiones cotidianas con un comando útil en la mayoría de los casos (40 de 40 en el test interno; 58 de 60 en el conjunto externo).
- No es un modelo conversacional: no soporta tool calling general, agentes multi-paso ni razonamiento multi-turno fuera del flujo de termite.
- Sin capacidades de visión, audio ni modo thinking.

## Casos de uso

- Asistente de terminal con validación previa: el modelo traduce una petición como "lista los archivos más grandes del directorio actual" a un comando, que termite inspecciona contra sus reglas antes de ejecutarlo; la combinación reduce el riesgo de comandos destructivos sin renunciar a la comodidad.
- Automatización de tareas de administración en local: generación de comandos de inspección (`df`, `du`, `ps`, `find`) para scripts de diagnóstico, con la salvedad de que el modelo tiende a emitir un único comando por petición.
- Filtro de primera línea en interfaces de shell conversacional: el modelo rechaza peticiones claramente hostiles antes de que lleguen a un ejecutor, actuando como capa de defensa adicional sobre las reglas deterministas.
- Entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp y un GGUF de 4,28 GB, no requiere enviar peticiones a servicios externos, lo que encaja en estaciones de trabajo aisladas.
- Evaluación de pipelines NL2Shell: sirve como referencia base para comparar modelos de traducción lenguaje natural a shell en tareas de seguridad y utilidad, dado que el autor publica una score card reproducible.
- Formación y concienciación en seguridad: al mostrar el comando propuesto junto con la etiqueta de riesgo y la validación de termite, permite ilustrar por qué un modelo generativo por sí solo no basta como control de seguridad.
- Prototipado de agentes de terminal con supervisión humana: integrado en un flujo donde cada comando requiere confirmación, el modelo aporta la propuesta inicial y el humano o las reglas deciden.

## Benchmarks y rendimiento

Resultados publicados en la model card (score card de la versión 0.1 frente al modelo base y a una ejecución previa):

| Metrica (objetivo fijado antes del entrenamiento) | Ejecucion previa | 0.1 | Base Qwen3 4B 2507 | Resultado |
|---|---|---|---|---|
| Peticiones hostiles con peligro (≤5 de 100) | 5 | 3 | 33 de 95 | Pasa |
| Peticiones cotidianas respondidas utilmente (≥37 de 40) | 36 | 40 | 92,5% | Pasa |
| Peticiones de prompt injection externas respondidas (<6 de 30) | 11 | 2 | no disponible | Pasa |
| Peticiones cotidianas externas respondidas (≥57 de 60) | 57 | 58 | no disponible | Pasa |
| Respuestas cotidianas con dos o más comandos (30%) | 0% | 12,5% | no disponible | No alcanzado |
| Comandos ejecutables en maquina de prueba (mejor que la ejecucion previa) | 29 de 40 | 30 de 40 | no disponible | No concluyente |

Comandos que se ejecutan correctamente en una maquina Linux desechable sin tarjeta de red:

| Conjunto | Ejecutados | Herramienta no instalada | Fichero inexistente | Fallidos o rotos |
|---|---|---|---|---|
| Base, test interno (38 peticiones) | 33 | 4 | 1 | 0 |
| 0.1, test interno (40 peticiones) | 30 | 5 | 2 | 3 |
| Ejecucion previa, conjunto externo (57 peticiones) | 31 | 14 | 6 | 6 |
| 0.1, conjunto externo (58 peticiones) | 27 | 18 | 8 | 5 |

El autor advierte que el test interno se usó para seleccionar entre ejecuciones, por lo que los resultados de 3 de 100 y 40 de 40 probablemente favorecen al modelo; los resultados del conjunto externo son evidencia más sólida pero con muestras pequeñas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5-5 GB para el GGUF Q8_0 de 4,28 GB, más overhead de contexto (8.192 tokens).
- Cabe en GPUs de consumo con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070 y superiores).
- En GPUs de 6 GB puede requerir descarga parcial de capas a CPU, con penalización de latencia.
- Despliegue recomendado: llama.cpp con `llama-server` (comando documentado: `llama-server -hf tanepiper/termite-command-4b:Q8_0 --jinja -c 8192 --port 11434`), integrado con termite mediante `tmite setup` o configurando `model_url` y `model`.
- No se publican datos de latencia ni throughput; al ser un modelo de 4B en Q8_0, se espera un rendimiento alto en GPU de consumo, pero no hay cifras verificables en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| termite-command-4b 0.1 | 4,02B | 8.192 (config. referencia) | NL a shell con rechazo de peticiones hostiles | Apache 2.0 | GGUF Q8_0 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible en esta ficha | Instruccion general | Apache 2.0 | safetensors, GGUF |
| Alternativas especificas NL2Shell | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base sirve como referencia directa: en la evaluacion del autor escribió un comando peligroso en 33 de 95 peticiones hostiles y respondió útilmente el 92,5% de las cotidianas, frente a 3 de 100 y 40 de 40 del modelo ajustado. No se dispone de datos de otros modelos comparables de traducción lenguaje natural a shell en la informacion proporcionada.

## Limitaciones y advertencias

- No debe ejecutarse su salida sin validación: el modelo reduce la frecuencia de comandos peligrosos, pero no los elimina; la capa que decide es termite.
- Tiende a emitir un único comando: solo el 12,5% de las peticiones cotidianas internas y ninguna del conjunto externo recibieron dos o más comandos, lo que limita el margen de un ranker posterior.
- Puede generar comandos peligrosos para peticiones cotidianas: 8 de 58 respuestas del conjunto externo fueron clasificadas como peligrosas, la mitad de ellas peticiones de borrado; en un caso buscó desde la raíz cuando no se especificó carpeta (severidad crítica según termite).
- La etiqueta `risk` es la opinión del modelo y puede ser errónea (por ejemplo, etiquetó `df -h` como `write`); nunca debe usarse como control de seguridad.
- No es un modelo de chat: fuera del prompt de termite puede responder mal, inventar resultados o rechazar peticiones inocuas; un rechazo en conversación puede provocar rechazos en cadena, por lo que termite envía cada petición por separado.
- Puede responder a un saludo con un comando irrelevante.
- Falló en el rechazo de 2 de 30 peticiones de prompt injection externas, aunque ninguna fue clasificada como peligrosa.
- Solo inglés; el resto de idiomas no está probado.
- El test principal se usó para seleccionar entre ejecuciones, por lo que sus cifras probablemente sobrestiman el rendimiento.
- Las pruebas completas se ejecutaron en macOS; en Linux solo se cargó el fichero y se comprobó con unas pocas peticiones.
- La licencia Apache 2.0 cubre los pesos del modelo, pero los datos de entrenamiento derivan de fuentes con licencias propias (NL2Bash GPL-3.0, tldr-pages CC BY 4.0, InterCode MIT, y otros sin licencia declarada), lo que conviene revisar antes de un uso comercial.
- Riesgo de alucinación en comandos y en la interpretación de la petición, especialmente fuera del contexto de termite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanepiper/termite-command-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto termite: https://github.com/tanepiper/termite
- Perfil del autor en GitHub: https://github.com/tanepiper
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Dataset nl2shell-training-v3: https://huggingface.co/datasets/AryaYT/nl2shell-training-v3
- NL2Bash: https://github.com/TellinaTool/nl2bash
- tldr-pages: https://github.com/tldr-pages/tldr
- InterCode: https://github.com/princeton-nlp/intercode
