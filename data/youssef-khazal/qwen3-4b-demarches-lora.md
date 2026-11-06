# youssef-khazal/qwen3-4b-demarches-lora

## Resumen

`youssef-khazal/qwen3-4b-demarches-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-4B, desarrollado por el autor independiente youssef-khazal como parte del proyecto "Démarches FR", un asistente RAG local para consultas sobre trámites administrativos franceses. El adaptador no es un modelo autónomo: está diseñado para funcionar exclusivamente dentro del pipeline del proyecto, recibiendo pasajes de las guías oficiales de Service-Public.fr y devolviendo una respuesta estructurada en JSON con un comportamiento clasificado (answer, clarify, fallback, off-topic, emergency, refuse), el texto de la respuesta y los números de los pasajes citados.

El modelo base Qwen3-4B es un transformer denso de 4.000 millones de parámetros con capacidad de razonamiento (thinking mode), aunque este adaptador se usa explícitamente con el modo thinking desactivado. El adaptador añade 658 ejemplos de respuestas generadas por el asistente final del proyecto (Qwen3-8B con razonamiento más comprobaciones en código), filtradas automáticamente y con exclusión de las fichas que responden a las 163 preguntas de test del proyecto.

Su relevancia es doble: por un lado, demuestra un flujo completo de fine-tuning QLoRA reproducible en hardware de consumo (una GPU de portátil de 8 GB, 3 h 15 min); por otro, publica una evaluación medida con intervalos de confianza y comparación contra el modelo base y contra el modelo final del proyecto, lo que permite valorar con rigor si el fine-tuning aporta mejoras reales en un dominio acotado como es la administración pública francesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer denso Qwen3-4B; rank 16, alpha 32, aplicado a todas las proyecciones de atención y MLP |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | Base cargado en 4-bit nf4 durante el entrenamiento; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Frances (fr), ingles (en), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base Qwen3-4B se carga cuantizado en 4-bit nf4 y se añade un LoRA de rango 16 (alpha 32) sobre todas las proyecciones de atención y MLP. La pérdida se calcula únicamente sobre los tokens de la respuesta, no sobre el prompt. Se realizan 2 pasadas con learning rate 2e-4 y batch efectivo de 8, y se publica el checkpoint con mejor pérdida de validación (tras la primera pasada). El entrenamiento completo se ejecutó en una GPU de portátil de 8 GB en 3 horas y 15 minutos.

Los datos de entrenamiento consisten en 658 respuestas generadas por el asistente final del proyecto (Qwen3-8B con razonamiento, más comprobaciones programáticas), filtradas mediante verificaciones automáticas. Las preguntas se generaron a partir de las fichas oficiales en francés (registro formal, oral y SMS), inglés y árabe, excluyendo las fichas que responden a las 163 preguntas del conjunto de test para evitar contaminación. El adaptador espera el prompt construido por `Assistant.build_messages` del proyecto, con `enable_thinking=False`.

## Capacidades

- Generación de respuestas estructuradas en JSON con un campo de comportamiento clasificado en seis categorías: answer, clarify, fallback, off-topic, emergency y refuse.
- Citación de pasajes: el modelo devuelve los números de los fragmentos de las guías oficiales que utiliza para fundamentar la respuesta.
- Respuesta fundamentada en contexto (RAG): responde exclusivamente a partir de los pasajes que recibe en el prompt, no de conocimiento paramétrico.
- Multilingüe en tres idiomas: francés (formal, oral y SMS), inglés y árabe.
- Detección de fuera de alcance: indica cuando las guías no cubren una pregunta, en lugar de inventar una respuesta.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No soporta agentes multi-paso ni razonamiento extendido: se usa con thinking desactivado.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Asistente RAG de trámites administrativos franceses: integrado en el pipeline del proyecto "Démarches FR", recibe pasajes de Service-Public.fr y devuelve una respuesta citada con comportamiento clasificado, lo que permite al frontend decidir si mostrar la respuesta, pedir aclaración o derivar a un humano.
- Clasificación de intención en atención al ciudadano: el campo `behaviour` del JSON permite enrutar consultas a respuestas automáticas, aclaraciones, derivaciones de emergencia o rechazos sin necesidad de un clasificador separado.
- Filtrado de consultas fuera de alcance: el comportamiento `off-topic` y `fallback` permite descartar preguntas que las guías no cubren, reduciendo el riesgo de respuestas inventadas en producción.
- Base para fine-tuning de dominio en otros idiomas o administraciones: la receta QLoRA (rank 16, 4-bit nf4, pérdida solo en tokens de respuesta) es reproducible en una GPU de 8 GB, lo que sirve como plantilla para adaptar Qwen3-4B a otros corpus administrativos.
- Evaluación comparativa de estrategias de fine-tuning: el proyecto publica métricas con intervalos de confianza al 95 % y comparación contra el modelo base y contra un modelo mayor con razonamiento, útil como referencia metodológica.
- Prototipado local sin conexión: al ejecutarse sobre un modelo de 4B cuantizable, puede desplegarse en un portátil para demos o pruebas de concepto de asistentes administrativos antes de escalar a modelos mayores.
- Generación de respuestas multilingües para residentes extranjeros: el soporte de francés, inglés y árabe cubre consultas de usuarios que no dominan el francés, aunque el árabe es el punto débil declarado por el autor.

## Benchmarks y rendimiento

Evaluación sobre 163 preguntas de test escritas a mano, con la misma búsqueda y prompt para todos los modelos:

| Modelo | Comportamiento correcto | Hechos encontrados | Respuestas con contenido inventado |
|---|---|---|---|
| Qwen3-4B antes del fine-tuning (juez LLM) | 73,6 % | 72,3 % | 32,5 % |
| Este adaptador (juez LLM) | 79,8 % | 78,7 % | 30,1 % |
| Este adaptador (corrección manual) | 85,9 % | 76,3 % | 27,0 % |
| Qwen3-8B + razonamiento, modelo final del proyecto (corrección manual) | 92,6 % | 81,4 % | 15,3 % |

El adaptador mejora al modelo base en hechos encontrados en +6,3 puntos (IC 95 % [+1,2, +11,6]) y declara con más frecuencia que las guías no cubren una pregunta. No alcanza al modelo de 8B con razonamiento, y el árabe es su punto débil según el autor.

## Requisitos de hardware

- Entrenamiento: una GPU de portátil de 8 GB, 3 h 15 min, con QLoRA en 4-bit nf4.
- Inferencia: el adaptador se suma al modelo base Qwen3-4B; en 4-bit nf4 el conjunto cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070). En fp16 requiere aproximadamente 8-10 GB, por lo que encaja en RTX 4070 Ti, RTX 4080, RTX 4090, A100 o H100.
- Despliegue: al ser un adaptador PEFT, se carga con `peft.PeftModel.from_pretrained` sobre transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible, aunque al estar basado en safetensors y PEFT podría fusionarse con el modelo base para su uso en esos motores.
- Latencia y throughput: no disponibles en la información proporcionada.
- El adaptador requiere el prompt exacto del proyecto (`Assistant.build_messages`) y `enable_thinking=False`; fuera de ese pipeline no está pensado para responder.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA Démarches FR) | 4B (base) + LoRA r16 | No disponible | RAG especializado en trámites FR, salida JSON con citas | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-4B (base) | 4B | No disponible | Modelo generalista con thinking mode | Apache 2.0 | Hugging Face |
| Qwen3-8B + razonamiento (modelo final del proyecto) | 8B | No disponible | RAG especializado en trámites FR, mayor calidad | No disponible | Uso interno del proyecto, no publicado como modelo |
| Alternativas generalistas de 4B (p. ej. Llama 3.2 3B, Gemma 2 2B) | 2-4B | No disponible | Modelo generalista | Licencias variables | Hugging Face |

La comparación relevante es contra el modelo base y contra el modelo de 8B del propio proyecto: el adaptador mejora al base en hechos encontrados (+6,3 puntos) pero queda por debajo del 8B con razonamiento (76,3 % frente a 81,4 % en corrección manual). No se dispone de comparación con otros adaptadores de dominio equivalentes.

## Limitaciones y advertencias

- No es un modelo autónomo: sin la búsqueda y el prompt del proyecto "Démarches FR" no está pensado para responder nada; usarlo fuera de ese pipeline produce resultados no evaluados.
- No constituye asesoramiento legal: ofrece información general extraída de las guías oficiales y puede confundir reglas entre casos vecinos, como refleja la tasa de contenido inventado (27,0 % en corrección manual).
- Punto débil en árabe, según declara el propio autor; el rendimiento multilingüe no es homogéneo.
- No alcanza la calidad del modelo de 8B con razonamiento del proyecto (85,9 % frente a 92,6 % en comportamiento correcto), por lo que el proyecto mantiene el 8B en producción.
- Proyecto independiente: no está afiliado ni respaldado por la administración francesa.
- Los datos de entrenamiento incluyen pasajes de "Fiches pratiques et ressources de Service-Public.gouv.fr Particuliers" (DILA) bajo Licence Ouverte / Open Licence 2.0; conviene verificar las condiciones de atribución si se redistribuye el modelo o sus salidas.
- El adaptador se distribuye sin cuantizar en safetensors; para despliegue en producción hay que fusionarlo con el base o servirlo con un motor compatible con PEFT.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/youssef-khazal/qwen3-4b-demarches-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto: https://github.com/youssef-khazal/fr-admin-assistant
- Metodología y resultados del fine-tuning: https://github.com/youssef-khazal/fr-admin-assistant/blob/main/finetune/README.md
- Fuente de datos oficial: https://www.service-public.fr/ (DILA, Licence Ouverte / Open Licence 2.0)
