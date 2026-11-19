# wafflefrisbee/gemma-4-E2B-it-abliterated

## Resumen

Gemma 4 E2B IT abliterated es una variante del modelo instructivo multimodal Gemma 4 E2B de Google, publicada por el usuario independiente wafflefrisbee. El modelo base es un transformer de aproximadamente 5.120 millones de parametros con capacidad any-to-any (texto, imagen y audio) y ventana de contexto no documentada en la informacion disponible. La modificacion consiste en una "abliteracion": una tecnica de edicion de pesos que elimina las direcciones de activacion asociadas a la negativa a responder, de modo que el modelo deja de rechazar peticiones que el original declina.

El autor declara que el objetivo no es mejorar el rendimiento, sino obtener un modelo util como bot de chat de grupo entre amigos, priorizando el tono desenfadado, las burlas y las peticiones picantes sobre las metricas academicas. El resultado reportado es de 1 negativa sobre 84 prompts provocadores (frente a 55 del modelo base) con una perplejidad de 152,8 en wikitext-2, lo que indica cierta deriva respecto al original (125,8) pero menos degradacion que otra abliteracion publica (166,0).

Es relevante ahora porque ilustra una practica creciente en la comunidad open source: la publicacion de variantes sin censura de modelos pequenos y multimodales, con metodologia reproducible (llm-abliteration con un parche especifico para Gemma 4) y con pesos en safetensors y GGUF listos para desplegar. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia propia de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) basado en Gemma 4 E2B; incluye torres de vision y audio ademas del modelo de lenguaje |
| Parametros totales | 5.123.178.051 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M publicadas en el repo GGUF; el repo principal en safetensors permite otras cuantizaciones con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 declarada en los metadatos; la model card enlaza a la licencia de Gemma 4 de Google |
| Formato de pesos | safetensors (repo principal) y GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal que procesa texto, imagen y audio. La modificacion se aplico con la herramienta llm-abliteration (commit ca6e223) mas un parche propio, `recipe/gemma4-ple.patch`, necesario porque Gemma 4 tambien escribe en el flujo residual a traves de `per_layer_projection`; el parche ablaciona esa proyeccion junto con `o_proj` y `down_proj`. Las direcciones de rechazo se midieron por capa con la opcion `--projected` sobre los conjuntos de prompts daninos e inofensivos incluidos en la herramienta, y se aplicaron a las capas 5 a 34, cada una con su propia direccion y escala 1,5. El autor senala que una direccion compartida apenas funcionaba en este modelo.

Solo se modifico el modelo de lenguaje: las torres de vision y audio quedan intactas y, segun el autor, sin probar. Tambien documenta una peculiaridad conocida de la herramienta: almacena `hidden_states[L]`, la entrada de la capa L, de modo que cada capa se ablaciona con la direccion de salida de la capa anterior; se dejo asi porque fue la configuracion con mejores resultados en su evaluacion. No hay informacion sobre el volumen de datos de entrenamiento original, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat y modo thinking desactivable (`enable_thinking=False`).
- Entrada de imagenes y audio mediante `AutoProcessor` (requiere torchvision), aunque el autor no las ha probado en esta variante.
- Respuesta a peticiones provocadoras, edgy o de contenido ofensivo que el modelo base rechaza: 1 negativa sobre 84 prompts en la evaluacion del autor.
- Adopcion de personajes mediante system prompt (el ejemplo incluido es una persona de Shrek que se burla del interlocutor).
- Capacidad de seguir instrucciones de formato y estilo propias de un modelo instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Chat de grupo entre amigos: el modelo esta ajustado y evaluado precisamente para este escenario; con un system prompt de persona responde con burlas y humor sin declinar peticiones, y en 40 prompts reservados obtuvo 0 negativas y 5,6/10 en estilo segun cuatro jueces ciegos.
- Generacion de contenido de entretenimiento sin filtros: guiones, roasts, respuestas sarcasticas y dialogos con humor negro para proyectos personales donde las negativas del modelo base resultan un obstaculo.
- Prototipado de personajes conversacionales: la plantilla de chat y el ejemplo con `shrek.txt` permiten definir personas rapidamente; util para experimentar con diseno de caracteres antes de invertir en un modelo mayor.
- Investigacion sobre alineacion y abliteracion: sirve como caso de estudio reproducible de como la eliminacion de direcciones de rechazo afecta a la perplejidad (125,8 a 152,8 en wikitext-2) y al comportamiento conversacional.
- Evaluacion comparativa de tecnicas de desbloqueo: el autor compara su build con huihui-ai Gemma 4 E2B abliterated v2 (0/84 negativas, PPL 166,0) y con el base (55/84, PPL 125,8), lo que permite contrastar estrategias de ablacion.
- Despliegue local ligero en entornos con recursos limitados: con 5.120 millones de parametros y versiones GGUF Q4_K_M, cabe en equipos de consumo y se integra en llama.cpp u otros runners compatibles con GGUF para bots personales.
- Pruebas de robustez y red teaming: al no rechazar practicamente nada, es util para generar respuestas adversarias que luego se filtran o evaluan con un modelo supervisor.

## Benchmarks y rendimiento

| Modelo | Negativas (84 prompts) | Perplejidad wikitext-2 (Q8_0) |
|---|---|---|
| google/gemma-4-E2B-it | 55/84 | 125,8 |
| huihui-ai Gemma 4 E2B abliterated v2 | 0/84 | 166,0 |
| wafflefrisbee/gemma-4-E2B-it-abliterated | 1/84 | 152,8 |

Notas del autor: la metrica de negativas se calcula sobre 84 prompts provocadores con temperatura 0, 96 tokens y deteccion por coincidencia de frases de rechazo o evasion; como el build se eligio sobre ese mismo conjunto, el autor advierte que la cifra es optimista. La perplejidad se midio sobre 40 fragmentos de 2048 tokens de wikitext-2 en Q8_0, con un margen de aproximadamente ±4, y en un modelo instruct refleja deriva respecto al base, no calidad conversacional. En 40 prompts de chat de grupo reservados, no usados en el ajuste, el modelo obtuvo 0/40 negativas y 5,6/10 en estilo segun cuatro jueces ciegos (huihui v2: 4,4). No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, en torno a 5-6 GB para los pesos mas overhead de contexto; en Q4_K_M, aproximadamente 3-4 GB. Son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas para Q4_K_M o Q8_0; una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o GPUs de datacenter como A100 o H100 son suficientes y quedan sobradas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6-8 GB de VRAM en cuantizaciones de 4 a 8 bits.
- Opciones de despliegue: llama.cpp y cualquier runner compatible con GGUF (incluido Ollama si importa el GGUF) para las versiones cuantizadas; transformers con `AutoModelForMultimodalLM` y `device_map="auto"` para el repo principal en safetensors; vLLM y TGI no estan documentados para esta variante en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Negativas (84) | PPL wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wafflefrisbee/gemma-4-E2B-it-abliterated | 5.123 M | no disponible | 1/84 | 152,8 | apache-2.0 (con enlace a licencia Gemma 4) | safetensors y GGUF |
| google/gemma-4-E2B-it | no disponible | no disponible | 55/84 | 125,8 | licencia Gemma 4 de Google | safetensors |
| huihui-ai Gemma 4 E2B abliterated v2 | no disponible | no disponible | 0/84 | 166,0 | no disponible | no disponible |

La comparativa se limita a los datos aportados por el autor; no hay informacion sobre contexto, licencia ni formatos del modelo de huihui-ai, ni sobre el numero exacto de parametros del base. En estilo conversacional, el modelo de wafflefrisbee obtiene 5,6/10 frente a 4,4 de huihui v2 en la evaluacion del propio autor.

## Limitaciones y advertencias

- El modelo acepta peticiones que el base rechaza; el autor lo advierte explicitamente y deja la responsabilidad de uso al usuario.
- Es un modelo de aproximadamente 2B (5.120 millones de parametros totales) y falla en hechos simples con cierta frecuencia, segun el propio autor.
- La abliteracion introduce deriva respecto al base: la perplejidad sube de 125,8 a 152,8 en wikitext-2, lo que puede traducirse en respuestas menos coherentes o mas erraticas en tareas generales.
- La evaluacion de negativas se hizo sobre el mismo conjunto usado para elegir el build, por lo que la cifra de 1/84 esta sesgada al alza en calidad.
- Las torres de vision y audio no se modificaron ni se probaron; su comportamiento en esta variante es desconocido.
- La licencia presenta ambiguedad: los metadatos declaran apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales al uso comercial; conviene verificar antes de produccion.
- No hay informacion sobre sesgos, idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en aplicaciones multilingues o con documentos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y procede de un autor independiente sin validacion externa; no hay garantias de mantenimiento ni soporte.
- El uso de un modelo sin filtros en produccion de cara al publico puede incumplir politicas de plataforma o normativa aplicable sobre contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wafflefrisbee/gemma-4-E2B-it-abliterated
- Repo GGUF (Q8_0, Q4_K_M): https://huggingface.co/wafflefrisbee/gemma-4-E2B-it-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Herramienta de abliteracion: https://github.com/jim-plus/llm-abliteration
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
