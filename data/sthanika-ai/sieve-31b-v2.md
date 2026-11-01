# sthanika-ai/Sieve-31B-v2

## Resumen

Sieve-31B-v2 es un modelo de decisión desarrollado por sthanika-ai, miembro de la familia Sieve. No es un modelo generativo: recibe un estado (texto o JSON) y una o varias preguntas tipadas, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta. Está construido como un fine-tune completo de google/gemma-4-31B-it (revisión `842da37`), del que reutiliza el backbone de 60 capas de decodificador de texto (29,29B parámetros entrenados), los embeddings de tokens, la normalización final y la capa de salida.

Su innovación principal es el uso de atención bidireccional en las 10 capas de atención global del backbone, mientras que las 50 capas de ventana deslizante permanecen causales. Como el modelo no genera texto, puede leer el estado completo en ambas direcciones y puntuar directamente las opciones de cada pregunta en un único slot de respuesta, sin decodificación autoregresiva. Esto lo hace útil para tareas de clasificación, enrutamiento, evaluación y calibración donde se necesita una probabilidad explícita por opción en lugar de texto libre.

El modelo se distribuye como adaptador PEFT con las 60 capas completas en `modules_to_save`, junto con una LoRA sobre los embeddings que es exactamente cero. La versión 0.3.3 o superior de la librería `sieve` copia las capas al backbone en el momento de la carga, por lo que el consumo de memoria es aproximadamente el del modelo base. Declara una puntuación de 69,97 en el Decision Index 0.3 (suite pública de 140.178 peticiones puntuadas que promedia 37 benchmarks), aunque el autor indica que es una ejecución propia y que aún no está en el leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma-4-31B-it) con atención bidireccional en las 10 capas globales y causal en las 50 capas de ventana deslizante (1.024 tokens) |
| Parametros totales | 29,29B en las 60 capas del decodificador de texto (fine-tune completo); embeddings, norm final y capa de salida del backbone |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por fila de prompt (estado más una pregunta); hasta 255 opciones por pregunta |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT con `modules_to_save`; requiere la librería `sieve` 0.3.3 o superior) |

## Arquitectura y entrenamiento

Sieve-31B-v2 parte de google/gemma-4-31B-it, un transformer decoder que intercala 10 capas de atención global con 50 capas de ventana deslizante de 1.024 tokens. El fine-tune es completo sobre las 60 capas del decodificador de texto (29,29B parámetros); los embeddings de tokens, la normalización final y la capa de salida se mantienen del backbone. La modificación arquitectónica clave es que las 10 capas globales operan en modo bidireccional sobre el prompt: cada token atiende a todos los demás tokens del prompt, anteriores y posteriores. Las 50 capas de ventana deslizante permanecen causales. El modo se registra en `training_config.json` con el campo `"attention": "bidir_global"`, y la librería `sieve` conmuta las capas globales a bidireccional al cargar el modelo; una release sin ese campo se carga con atención causal.

El entrenamiento se realizó con esta misma configuración de atención, de modo que la inferencia reproduce las condiciones de entrenamiento. Cada pregunta se formula como un turno de usuario en la plantilla de chat de Gemma, con el modo thinking desactivado, seguido de un slot `Answer: (`. En ese slot, el estado oculto final se multiplica por las filas de la capa de salida correspondientes a los tokens de etiqueta de las opciones (A, B, ..., hasta 255 opciones) y se aplica un softmax sobre las opciones de esa pregunta con una temperatura fija de 8,5495, la temperatura de entrenamiento. El modelo nunca trunca, descarta ni reordena opciones, no ajusta prompts por benchmark y no ve etiquetas gold. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión tipada sobre texto o JSON: devuelve una probabilidad por cada opción de cada pregunta, sin generar texto.
- Preguntas de tipo `choice`: entre 2 y 255 opciones con claves definidas por el llamante, opcionalmente descritas; devuelve la clave más probable, una confianza y la probabilidad por clave.
- Preguntas de tipo `noul`: respuesta binaria sí/no; devuelve P(yes).
- Preguntas de tipo `score`: lista ordenada de 2 a 10 niveles; devuelve el nivel esperado, una confianza y la probabilidad por nivel.
- Aislamiento por pregunta: cada pregunta es su propia fila (estado más una pregunta), de modo que las preguntas no se ven entre sí en ninguna dirección.
- Atención bidireccional en las capas globales para leer el estado a la luz de la pregunta y las opciones.
- Procesamiento por lotes con máscara de padding: el padding nunca se atiende.
- Manejo de memoria: si hay OOM, el chunk del forward se reduce a la mitad y la petición se reintenta; una fila que aún no cabe lanza un error ordinario para que una ejecución reanudada la reintente.
- Capacidades multilingües: solo inglés declarado.
- No soporta tool calling, function calling, agentes, visión ni audio según la información disponible.

## Casos de uso

- Enrutamiento de peticiones en producción: dado un texto de entrada y un conjunto de destinos posibles (por ejemplo, colas de soporte, departamentos o endpoints), el modelo devuelve la probabilidad de cada destino con una sola pasada y sin generar texto, lo que simplifica el postprocesado y la lógica de umbrales.
- Clasificación con calibración explícita: en lugar de una etiqueta dura, se obtiene una distribución de probabilidad por clase, útil para sistemas que necesitan confianza (derivación a revisión humana cuando P(clase) es baja).
- Evaluación automática de respuestas: con preguntas de tipo `score` sobre una escala ordenada de 2 a 10 niveles, se puede puntuar la calidad de una respuesta o de un documento con un nivel esperado y su distribución.
- Verificación de hechos y consistencia: con preguntas `noul` sobre un estado de texto o JSON, se puede comprobar si una afirmación se sigue del contexto, obteniendo P(yes) como señal calibrada.
- Moderación y filtrado por políticas: clasificar contenido en categorías de política con hasta 255 opciones y usar las probabilidades para decidir bloqueo, revisión o paso.
- Extracción de decisiones sobre JSON estructurado: al aceptar JSON como estado, se puede usar para seleccionar campos, validar esquemas o decidir entre alternativas de configuración en pipelines de datos.
- Puntuación de candidatos en ranking: con preguntas `choice` sobre opciones descritas, se obtiene una probabilidad por candidato que sirve como señal de ranking en sistemas de recomendación o búsqueda.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| Decision Index 0.3 public suite (140.178 peticiones puntuadas; media de 37 benchmarks) | decision_index | 69,97 | Ejecución propia del autor, corregida por azar; no verificada y aún no publicada en el leaderboard |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 84 GB en bf16, incluyendo la caché de PyTorch (pico de 86.348 MiB medido sobre 400 peticiones públicas).
- GPU recomendadas: una GPU de 96 GB (por ejemplo, A100 80 GB no es suficiente según la cifra declarada; se requiere una GPU de 96 GB o superior, como H100 96 GB o H200) o dos GPU con la opción `split`.
- GPU de consumo: no cabe en GPU de consumo según los requisitos de memoria declarados.
- Opciones de despliegue: la librería `sieve` (0.3.3 o superior) con `transformers==5.17.0`, `peft==0.21.0`, `accelerate==1.15.0` y `torch==2.8.0` con CUDA 12.8; el modelo se sirve a través de `load_sieve` y `decide`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-31B-v2 | 29,29B entrenados (backbone Gemma-4-31B-it) | 32.768 tokens por fila; 255 opciones | Modelo de decisión (clasificación tipada, sin generación) | apache-2.0 | HuggingFace, requiere librería `sieve` |
| google/gemma-4-31B-it | no disponible | no disponible | Modelo generativo de texto | no disponible | HuggingFace |
| Otros modelos de decisión de la familia Sieve | no disponible | no disponible | Modelo de decisión | no disponible | Colección Sieve en HuggingFace |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés según el campo de idiomas declarado.
- No genera texto: no sirve para tareas de generación, resumen, traducción ni diálogo abierto.
- Límites declarados: hasta 255 opciones por pregunta y 32.768 tokens por fila de prompt (estado más una pregunta); las peticiones mayores se rechazan como `Unsupported`.
- La temperatura está fija en 8,5495 (la de entrenamiento); no es configurable según la información disponible.
- El resultado del Decision Index es una ejecución propia del autor, no verificada y no publicada en el leaderboard, por lo que debe tomarse con cautela.
- No se detallan sesgos conocidos, riesgo de alucinación ni composición del dataset de entrenamiento en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero el modelo base es google/gemma-4-31B-it, cuyos términos pueden aplicar en cascada; conviene revisar la licencia del backbone.
- Requiere una versión concreta de la librería `sieve` (0.3.3 o superior) y dependencias fijadas (transformers 5.17.0, peft 0.21.0, accelerate 1.15.0, torch 2.8.0 con CUDA 12.8); versiones distintas pueden no cargar el modo de atención bidireccional.
- El consumo de memoria (unos 84 GB en bf16) limita el despliegue a GPU de 96 GB o configuraciones multi-GPU con `split`.
- El repositorio tiene 58,6 GB y solo 95 descargas en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sthanika-ai/Sieve-31B-v2
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Repositorio del Decision Index: https://github.com/apolinario/decision-index
