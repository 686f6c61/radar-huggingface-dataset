# sthanika-ai/Sieve-2B-v3

## Resumen

Sieve-2B-v3 es un modelo de decisión, no un modelo generativo, desarrollado por Sthānika AI dentro de la familia Sieve. Se construye como un *full fine-tune* de la torre de texto de Qwen/Qwen3.5-2B (revisión `15852e8c`) al que se añade una cabeza *pointer*: recibe un estado (texto o JSON) y una o varias preguntas tipadas, y devuelve una probabilidad calibrada por cada opción de cada pregunta. El modelo lee el estado una sola vez, puntúa directamente las opciones y no genera texto en ningún caso.

La relevancia del modelo está en su enfoque: en lugar de pedir a un LLM que responda en lenguaje natural y parsear la salida, expone una interfaz de clasificación estructurada con tres tipos de pregunta (`choice`, `noul` y `score`) y almacena una temperatura de calibración por categoría de pregunta (una global de T = 0.968 y 25 temperaturas específicas entre 0.869 y 1.257, ajustadas por NLL sobre 143.822 preguntas). Esto lo hace adecuado para enrutado, triaje y decisiones binarias o graduadas donde importa la fiabilidad de la probabilidad, no la fluidez del texto.

Con 1.37B parámetros entrenados sobre las 24 capas del decoder, límites de 16.384 tokens para el estado y 16.384 para cada pregunta con sus opciones, y un consumo de VRAM medido de 4,3 GB (servidor con CUDA graphs) a 10,7 GB (servidor eager) en bf16, el modelo está pensado para despliegues de inferencia con requisitos moderados de hardware y baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-2B) con cabeza *pointer* para puntuar opciones; sin generación de texto |
| Parametros totales | 1,37B parámetros entrenados (24 capas del decoder) más la cabeza *pointer*; el modelo base es Qwen/Qwen3.5-2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens para el estado y 16.384 tokens para cada pregunta con sus opciones (límites de entrenamiento, sin truncado) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT con `modules_to_save`; requiere el backbone Qwen/Qwen3.5-2B descargado en la revisión fijada) |

## Arquitectura y entrenamiento

El modelo reutiliza únicamente la parte de texto del backbone Qwen/Qwen3.5-2B y descarta por completo la capacidad generativa. Sobre las 24 capas del decoder se realizó un *full fine-tune*; los *embeddings* de tokens y la normalización final se mantienen los del backbone. La release empaqueta las capas entrenadas íntegras como adaptador PEFT mediante `modules_to_save`, con un LoRA de rango 1 inicializado a cero sobre los *embeddings*, de forma que se carga igual que los modelos LoRA de la familia. La lectura se realiza con una cabeza *pointer* que puntúa el final de cada opción contra el punto de decisión, y una softmax calibrada convierte esas puntuaciones en probabilidades.

Cada pregunta se ejecuta como una fila independiente a partir de la caché del estado, de modo que las preguntas de una misma petición nunca se ven entre sí. El modelo se entrenó sobre los tipos `choice` y `noul` (el tipo `score` está definido en la interfaz pero no se declara entrenado). La calibración se ajustó por *negative log-likelihood* sobre un split de 143.822 preguntas, con una temperatura global y 25 temperaturas por categoría, donde la categoría combina el tipo de pregunta, el número de opciones (2, 3-4, 5-9, 10-25, 26+) y el tipo de estado (vacío, texto o JSON). El autor recomienda instalar `causal-conv1d==1.7.0` para reproducir los números publicados: sin ese kernel, transformers recurre a una convolución PyTorch más lenta cuyas probabilidades pueden diferir ligeramente.

## Capacidades

- Clasificación de decisión tipada en tres formatos: `choice` (entre 2 y 255 claves del llamante, opcionalmente descritas), `noul` (sí/no, devuelve P(sí)) y `score` (lista ordenada de 2 a 10 niveles, devuelve el nivel esperado y una probabilidad por nivel).
- Probabilidad calibrada por opción, con temperaturas específicas por categoría de pregunta para corregir el exceso o defecto de confianza.
- Procesamiento de estados en texto plano o JSON, con una única lectura del estado reutilizada para todas las preguntas de la petición.
- Aislamiento entre preguntas: cada pregunta se puntúa de forma independiente contra la caché del estado, sin contaminación cruzada.
- Sin generación de texto: el modelo no produce respuestas en lenguaje natural, lo que elimina el parseo de salidas y reduce la superficie de error en producción.
- No se declaran capacidades de *tool calling*, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card envía un estado JSON con asunto y cuerpo del ticket y pregunta por el departamento (`choice` con criterios como facturación o técnico) y por el riesgo de cancelación (`noul`). El modelo devuelve la probabilidad de cada departamento y P(cancelación), lo que permite enrutar automáticamente y priorizar la cola.
- Enrutado en pipelines de atención al cliente: con 16.384 tokens de estado, el modelo puede leer el historial completo de una conversación y decidir con probabilidad calibrada si el caso debe escalar a un humano, sin necesidad de generar una respuesta intermedia.
- Moderación y clasificación de contenido: el tipo `score` con niveles ordenados (de 2 a 10) encaja en escalas de gravedad o confianza, y la salida de nivel esperado más distribución permite fijar umbrales operativos con conocimiento de la incertidumbre.
- Verificación de criterios en formularios y solicitudes: cada criterio se formula como pregunta `noul`, el estado es el JSON del formulario y las probabilidades resultantes alimentan reglas de aprobación o revisión manual con umbrales explícitos.
- Investigación sobre calibración y evaluación de decisiones: el modelo se puede ejecutar contra el Decision Index (`python -m decision_index run --engine sieve.decision_index_engine:SieveEngine`) y sirve como referencia reproducible para comparar métodos de calibración por categoría.
- Sistemas de decisión de baja latencia: con 4,3 GB de VRAM en el servidor con CUDA graphs, se puede desplegar en una GPU de consumo o de gama media y atender clasificaciones estructuradas sin el coste de generar texto token a token.
- Detección de intención en asistentes conversacionales: preguntas `choice` con las intenciones como claves devuelven la distribución completa, útil para desambiguar antes de invocar un componente generativo posterior.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Decision Index 0.4.1, Full score (leaderboard, tests privados de los mantenedores) | decision_index | 34,45 |
| Decision Index 0.3, suite publica (140.178 peticiones puntuadas; media de 37 benchmarks) | decision_index (corregido por azar) | 53,51 |

El autor no publica en la informacion disponible resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K, coherentemente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM en bf16: 4,3 GB con servidor CUDA-graph y 10,7 GB con servidor eager, según las mediciones de latencia del autor; estados más largos requieren más memoria.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por la VRAM medida, una RTX 4090 (24 GB) cubre con holgura ambos modos de servidor, y tarjetas de 8-12 GB pueden alojar el modo con CUDA graphs.
- Cabe en GPU de consumo: sí, con al menos 4,3 GB de VRAM libres en bf16 y el modo CUDA-graph.
- Despliegue: servidor propio `sieve-serve --model sthanika-ai/Sieve-2B-v3 --graphs`, con el paquete `sieve-decisions[serve]`; requiere `sieve` 0.3.0 o superior, torch 2.8.0 y, recomendado, `causal-conv1d==1.7.0` (necesita nvcc 11.6 o superior). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, coherentemente con que el modelo no genera texto.
- Latencia y throughput: no se publican cifras concretas en la información disponible, solo los consumos de VRAM de las pruebas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-2B-v3 | 1,37B entrenados (base Qwen3.5-2B) | 16.384 (estado) + 16.384 (pregunta) | Clasificación de decisión con cabeza pointer y calibración por categoría | apache-2.0 | Hugging Face; requiere paquete `sieve` y backbone Qwen3.5-2B |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | Generación de texto | no disponible en la información proporcionada | Hugging Face |
| Otros modelos de la familia Sieve | no disponible | no disponible | Decisiones tipadas con calibración | no disponible | Colección `sthanika-ai/sieve` en Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de alternativas comparables para contrastar el Decision Index.

## Limitaciones y advertencias

- El adaptador por sí solo no es un modelo de generación de texto: debe cargarse con `sieve` 0.3.0 o superior y descarga el backbone Qwen/Qwen3.5-2B en la revisión fijada `15852e8c`.
- Solo admite inglés como idioma declarado; no hay evidencia de comportamiento multilingüe.
- Los límites de 16.384 tokens por estado y por pregunta se aplican estrictamente: las peticiones que los superan se rechazan, nunca se truncan. El motor del Decision Index declara límites mayores (65.536 tokens de estado y 32.768 de pregunta), pero los límites de entrenamiento del modelo son los de 16.384.
- El tipo `score` está definido en la interfaz, pero el entrenamiento declarado cubre únicamente `choice` y `noul`; conviene validar el comportamiento en `score` antes de usarlo en producción.
- Sin `causal-conv1d`, las probabilidades pueden diferir ligeramente de las publicadas, lo que afecta a la reproducibilidad de los benchmarks y a los umbrales calibrados.
- Los resultados del Decision Index son declarados por el autor y marcados como no verificados; el *full score* de 34,45 procede de tests privados de los mantenedores del índice y no es auditable externamente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración defectuosa fuera de las categorías cubiertas por las temperaturas ajustadas; las temperaturas nunca cambian la respuesta elegida, solo la probabilidad reportada.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-2B se distribuye por separado y sus términos deben respetarse adicionalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-2B-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Colección de la familia Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Requisitos (versiones probadas, torch 2.8.0): https://raw.githubusercontent.com/sthanika-ai/Sieve/main/requirements.txt
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
