# tianxinwei/JevAny-27B-SFT

## Resumen

JevAny-27B-SFT v0.1.0 es un adaptador LoRA de rango 16 con una cabeza de puntero (pointer head) de 256 dimensiones entrenado sobre el modelo base Qwen/Qwen3.8-27B. Lo desarrolla el usuario tianxinwei y su propuesta tecnica es poco habitual: en lugar de decodificar tokens de respuesta, proyecta un estado de texto compartido junto con preguntas tipadas directamente a probabilidades sobre las opciones disponibles. Es, por tanto, un modelo de decision y calibracion, no un generador de texto.

La relevancia de este enfoque esta en el coste y en la calibracion. Al no generar respuestas token a token, la latencia por pregunta es baja (156,84 ms de mediana en una H200) y el modelo puede producir una probabilidad calibrada con temperatura ajustada en una particion de desarrollo separada, lo que permite umbrales de abstención con error empirico controlado (51,63% de cobertura con un maximo del 5% de error empirico en el panel transfer-v9).

El repositorio pesa 0,5 GB y contiene unicamente el adaptador, ya que los pesos del modelo base permanecen congelados y se distribuyen por separado. Requiere ademas el runtime propio de JevAny para ejecutarse. El entrenamiento esta limitado a un sobre de 2.048 tokens empaquetados y la ruta de publicacion es exclusivamente texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 16 mas cabeza de puntero (pointer head) de 256 dimensiones sobre un transformer decoder (Qwen/Qwen3.8-27B) |
| Parametros totales | 27B nominales en el modelo base (segun el nombre del modelo); numero exacto de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens empaquetados en entrenamiento; contexto del modelo base: no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repo ocupa 0,5 GB |
| Libreria | peft |
| Tarea declarada | text-classification |
| Dimension del puntero | 256 |
| Revision del modelo base | 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |

## Arquitectura y entrenamiento

El modelo no es un generador: combina un adaptador LoRA de rango 16 con una cabeza de puntero de 256 dimensiones que mapea un estado de texto compartido y preguntas tipadas a probabilidades sobre opciones, sin decodificar tokens de respuesta. Los pesos del modelo base Qwen/Qwen3.8-27B permanecen congelados durante el entrenamiento; lo que se entrena es el adaptador y la cabeza de puntero de forma conjunta. Los datos de entrenamiento combinan decisiones publicas de clasificacion, composicionales, de politica y de opcion ausente (missing-option), lo que sugiere un diseno orientado a decidir tambien cuando la respuesta correcta no esta entre las opciones presentadas.

La calibracion se realiza ajustando una temperatura sobre una particion de desarrollo separada, un paso clave porque la salida del modelo son probabilidades y no texto. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativa.

## Capacidades

- Clasificacion y decision sobre opciones multiples: asigna probabilidades a opciones dadas sin generar texto.
- Calibracion de probabilidades: temperatura ajustada en particion separada, con Brier score calibrado de 0,273 en el panel de evaluacion.
- Abtencion controlada: 51,63% de cobertura con un maximo del 5% de error empirico, es decir, soporta umbrales de confianza operativos.
- Decisiones composicionales: entrenado con datos de tipo composicional, no solo clasificacion plana.
- Decisiones de politica: incluye datos de decisiones de politica en el entrenamiento.
- Manejo de opciones ausentes (missing-option): contempla el caso en que la respuesta correcta no figura entre las opciones.
- Preguntas tipadas: la entrada admite preguntas con tipado explicito junto al estado de texto compartido.
- Capacidades de generacion de texto: no disponibles, el modelo no decodifica respuestas.
- Tool calling, agentes, vision, audio y modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutado y triaje en produccion: dado un texto de entrada y un conjunto cerrado de categorias o colas de destino, el modelo devuelve una distribucion de probabilidad sobre ellas sin generar texto, con latencias de decimas de segundo que permiten integrarlo en un pipeline sincrono.
- Moderacion con umbral de abstención: usando la calibracion reportada (cobertura del 51,63% a un maximo del 5% de error empirico), se puede derivar automaticamente a revision humana el contenido cuyo comportamiento no alcanza el umbral de confianza.
- Evaluacion automatizada de respuestas en benchmarks tipo MMLU-Pro: el modelo reporta 64,00% de exactitud en MMLU-Pro, por lo que sirve como evaluador de opcion multiple sobre preguntas tipadas, sin coste de decodificacion.
- Encuestas y anotacion asistida: clasificacion de respuestas abiertas en categorias predefinidas con probabilidades calibradas, utiles para ponderar agregados en lugar de asignar etiquetas duras.
- Seleccion de herramienta o ruta en un agente: como modulo de decision previo a la generacion, elige entre un conjunto finito de acciones o herramientas tipadas y pasa el control a otro componente que si genera texto.
- Deteccion de casos fuera de catalogo: gracias al entrenamiento con decisiones de opcion ausente, puede senalar cuando la consulta no encaja en ninguna de las opciones ofrecidas, algo relevante en catalogos y taxonomias cerradas.
- Clasificacion de documentos con contexto corto: el sobre de entrenamiento de 2.048 tokens empaquetados lo hace adecuado para textos cortos y medianos ya truncados o resumidos previamente.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el panel de desarrollo retenido `transfer-v9`:

| Metrica | Resultado |
|---|---|
| Exactitud en decisiones conocibles (knowable accuracy) | 81,36% |
| Exactitud en MMLU-Pro | 64,00% |
| Brier score calibrado | 0,273 |
| Cobertura con error empirico maximo del 5% | 51,63% |
| Latencia mediana por pregunta (H200) | 156,84 ms |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla, ni desgloses por tarea o por idioma.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,5 GB), pero la inferencia requiere cargar el modelo base Qwen/Qwen3.8-27B completo, que domina el consumo de memoria.
- VRAM estimada para el modelo base de 27B: en torno a 54 GB en fp16/bf16, unos 27 GB en int8 y aproximadamente 14-16 GB en cuantizacion de 4 bits. Son estimaciones derivadas del tamano nominal del modelo, no cifras publicadas por el autor.
- GPU recomendadas: el autor reporta mediciones en NVIDIA H200. Para el base en precision completa se necesitan aceleradores de 80 GB (A100, H100, H200) o varios mas pequenos con reparto de tensor.
- Cabe en GPU de consumo: si el base se cuantiza a 4 bits, podria encajar en tarjetas con 16-24 GB de VRAM, aunque el autor no confirma compatibilidad ni calidad en ese regimen.
- Opciones de despliegue: el modelo requiere el runtime de JevAny ademas de los pesos base. Al ser un adaptador PEFT en safetensors, es tecnicamente compatible con el ecosistema PEFT/transformers y, con matices, con servidores que soportan adaptadores LoRA anadidos, como vLLM. No hay soporte GGUF ni Ollama documentado, ya que no se publican pesos cuantizados ni convertidos a ese formato.
- Latencia y throughput: 156,84 ms de mediana por pregunta de una sola cuestion en H200. No se publican cifras de throughput ni de latencia en lote.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la informacion proporcionada. La comparativa siguiente se limita a caracteristicas verificables de cada enfoque; las celdas marcadas como no disponible no deben interpretarse como inferiores o superiores.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| JevAny-27B-SFT | Adaptador LoRA r16 sobre base de 27B; cabeza de puntero de 256 dim. | 2.048 tokens en entrenamiento | Decision por probabilidades sobre opciones, sin decodificacion | apache-2.0 | 81,36% knowable accuracy, 64,00% MMLU-Pro, Brier 0,273 (autor) |
| Qwen/Qwen3.8-27B (modelo base) | 27B | No disponible | Transformer decoder generativo | No disponible | No disponible |
| Adaptadores LoRA genericos para clasificacion | Depende del rango y del base | Depende del base | Clasificacion con cabeza supervisada | Depende del autor | No disponible |
| LLM como juez con salida de texto | Depende del modelo | Depende del modelo | Generacion de la opcion elegida en texto | Depende del modelo | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no documenta analisis de sesgo y los datos de entrenamiento solo se describen de forma agregada.
- Riesgo de alucinacion: reducido por diseno en la seleccion entre opciones, ya que no genera texto libre, pero persiste como error de clasificacion y como probabilidad mal calibrada.
- La calibracion puede desplazarse con datos nuevos: el propio autor advierte de que la temperatura ajustada en una particion concreta no garantiza el mismo comportamiento en dominios distintos.
- Envolvente de entrenamiento de 2.048 tokens empaquetados: las entradas mas largas no se entrenaron como capacidad de primera clase, por lo que el rendimiento en contextos largos no esta garantizado.
- Solo texto: la ruta de publicacion es text-only, sin soporte de vision, audio ni otras modalidades.
- Idiomas: no disponibles. No se documenta que idiomas cubre el entrenamiento ni si hay evaluacion multilingue.
- Dependencia de dos componentes externos: los pesos del modelo base Qwen se distribuyen por separado y ademas se necesita el runtime de JevAny, lo que complica la reproducibilidad y el despliegue frente a un modelo autonomo.
- Licencia apache-2.0 para el adaptador, pero el uso comercial queda condicionado por la licencia del modelo base, que no se detalla en la informacion proporcionada.
- Madurez: version v0.1.0, publicada con 0 descargas y 0 likes en el momento de la consulta, y sin evaluacion independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianxinwei/JevAny-27B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de la release: https://github.com/weitianxin/JevAny/blob/main/results/release-v0.1.json
- Repositorio JevAny: https://github.com/weitianxin/JevAny
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas de soporte de Hotmail, Windows y WhatsApp sin relacion con el modelo.
