# sumitk/rubik-cube-3face-recurrent-ai

## Resumen

`rubik-cube-3face-recurrent-ai` es un agente neuronal desarrollado por el usuario sumitk que resuelve un cubo de Rubik 3x3x3 en bucle cerrado bajo observabilidad parcial estricta: en cada paso solo ve 27 pegatinas correspondientes a las caras superior (U), frontal (F) y derecha (R); las caras trasera, izquierda e inferior están completamente ocluidas. El modelo, denominado `RecurrentCubeLM`, tiene 5,35 M de parámetros y sustituye la búsqueda clásica (Kociemba, IDA*) por una política neuronal que emite giros de cara, rotaciones de cubo entero y el token `<done>` de forma greedy.

La relevancia técnica del artefacto no reside en resolver el cubo —un problema resuelto desde hace décadas con algoritmos exactos— sino en demostrar que un transformer recurrente con memoria continua externa puede mantener un modelo del mundo bajo un POMDP severo y resolver scrambles completos de 25 movimientos con un 76,6 % de éxito, sin ninguna búsqueda en inferencia. La ablación borrando la memoria hace caer ese porcentaje al 0 %, lo que cuantifica directamente la dependencia del estado recurrente.

El modelo se distribuye con checkpoints PyTorch, un simulador web 3D/2D, un conjunto de tests (57 pasados) y un whitepaper técnico. Está pensado como pieza de investigación en POMDP, modelos de mundo y arquitecturas con memoria, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional recurrente con memoria continua (`RecurrentCubeLM`), 6 bloques |
| Parámetros totales | 5,35 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en sentido LLM; ventana de 16 acciones recientes + 16 ranuras de memoria continua de dimensión 256 |
| Tipos de cuantización | no disponible (checkpoints PyTorch en coma flotante) |
| Idiomas soportados | no aplica (modelo de RL sobre un dominio simbólico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

`RecurrentCubeLM` procesa en cada paso 76 tokens de entrada: 16 vectores de memoria de entrada (RMSNorm de M_{t-1} más embedding posicional), 27 tokens de la vista visible de 3 caras (embedding de pegatina más embedding de ranura), 16 tokens de la ventana de acciones recientes, 1 token de consulta de acción y 16 tokens de consulta de escritura de memoria. Estos tokens pasan por 6 bloques transformer bidireccionales con `d_model = 256`, 4 cabezas de atención, `d_ff = 688`, activación SwiGLU y normalización RMSNorm. La atención es completa y bidireccional dentro del paso, no causal sobre el histórico: la recurrencia se implementa mediante el estado externo, no mediante la máscara de atención.

La salida se divide en tres cabezas: una cabeza de acción (`Linear(256 -> 64)`) que produce logits sobre 18 movimientos de cara, 9 rotaciones de cubo entero y `<done>`; una actualización de memoria con compuerta residual `M_t = g * M_{t-1} + (1 - g) * cand` sobre 16 ranuras de 256 dimensiones; y una cabeza de predicción de la siguiente vista mediante atención cruzada, que estima las 27x6 pegatinas del siguiente paso visible (`predict_next_view`). Esta última actúa como modelo del mundo auxiliar y es una de las innovaciones destacables del diseño.

El entrenamiento combina behavior cloning supervisado sobre trayectorias CFOP generadas activamente (con cachés PDB construidas en la primera ejecución), etiquetado con el tag `dagger`, y en los baselines del autor se reporta GRPO como alternativa de RL. La model card no especifica el número total de tokens de entrenamiento ni la composición exacta del dataset; únicamente indica que se entrena desde cero ("from scratch") sobre el dominio del cubo.

## Capacidades

- Resolución de cubo 3x3x3 en bucle cerrado bajo observabilidad parcial de 3 caras (U, F, R), con scrambles completos de hasta 25 movimientos.
- Emisión de acciones simbólicas: 18 giros de cara (U, R, F, D, L, B en sus variantes), 9 rotaciones de cubo entero (x, y, z) y token de terminación `<done>`.
- Mantenimiento de estado a través del tiempo mediante 16 vectores de memoria continua con compuerta residual, que permiten recordar caras ocluidas.
- Modelo del mundo interno: cabeza de predicción de la siguiente vista de 27 pegatinas, útil para análisis de representación.
- Planificación implícita sin búsqueda externa (cero Kociemba, cero IDA*, cero rollout en inferencia).
- Capacidad de resolver subobjetivos del método CFOP de forma aislada o encadenada: PLL, OLL, pares F2L individuales y los cuatro pares F2L.
- Generalización a tareas de inversión de secuencia a distintas profundidades (rev depth 1-4).
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural ni capacidades multimodales; no es un modelo de lenguaje.

## Casos de uso

- Investigación en POMDP: el modelo sirve como banco de pruebas controlado para estudiar cómo una arquitectura recurrente mantiene estado bajo oclusión estricta, con una métrica de éxito clara (porcentaje de scrambles resueltos) y una ablación directa (borrado de memoria) que aísla la contribución del estado recurrente.
- Estudio de modelos del mundo en transformers: la cabeza `predict_next_view` permite medir la calidad de la predicción de la siguiente observación y correlacionarla con el éxito de la política, algo poco habitual en entornos de RL simbólico.
- Docencia de algoritmos de resolución: el simulador web 3D/2D incluido (`web_sim.py`, puerto 8765) muestra la vista parcial U/F/R frente al ground truth de 6 caras, útil para explicar observabilidad, rotaciones de cubo y fases CFOP en asignaturas de IA o robótica.
- Benchmark de arquitecturas con memoria externa: comparar atención recurrente con memoria gated frente a alternativas sin BPTT o feed-forward usando la tabla de resultados ya publicada como línea base reproducible.
- Transferencia conceptual a robótica con oclusión: el diseño (vista parcial + rotaciones que traen caras ocultas a la vista + memoria) es análogo a un agente manipulador que reorienta un objeto para inspeccionarlo; el modelo sirve como referencia metodológica para esos pipelines.
- Interpretabilidad de representaciones internas: el simulador incluye un mapa de calor en vivo de las 16 ranuras de memoria, lo que permite analizar qué ranuras se activan en cada fase de la resolución y cómo responde el sistema a la ablación `--reset_mem`.
- Validación de pipelines de entrenamiento from scratch: el repositorio incluye generación de trayectorias CFOP, construcción de cachés PDB y suite de 57 tests, reutilizable como esqueleto para otros dominios de planificación simbólica.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 256 episodios por tarea, con la vista de 3 caras únicamente:

| Tarea | SFT feed-forward (14,2 M) | Rec. sin BPTT (W=1) | Rec. W=16 | Rec. v3 (5,35 M) | Ablación memoria borrada |
|---|---|---|---|---|---|
| `pll` (permutación de última capa) | 60,2 % | 93,4 % | 91,8 % | 100,0 % | 0,8 % |
| `oll` (orientación de última capa) | 44,5 % | 57,8 % | 59,4 % | 100,0 % | 5,5 % |
| `oll_pll` (última capa completa) | 20,7 % | 53,1 % | 53,5 % | 100,0 % | 0,0 % |
| `f2l_pair` (un par F2L) | 11,7 % | 13,3 % | 15,6 % | 95,3 % | 0,0 % |
| `f2l` (4 pares encadenados) | 0,0 % | 0,0 % | 0,0 % | 97,7 % | 0,0 % |
| `f2l_oll_pll` (4 F2L + OLL + PLL) | 0,0 % | 0,0 % | 0,0 % | 97,3 % | 0,0 % |
| `full` (scramble de 25 movimientos a `<done>`) | 0,0 % | 0,0 % | 0,0 % | 76,6 % | 0,0 % |

Profundidad de inversión de secuencia (`rev`), éxito por profundidad:

| Profundidad | SFT feed-forward | Rec. sin BPTT | Rec. W=16 | Rec. v3 |
|---|---|---|---|---|
| 1 | 100 % | no disponible | no disponible | 100 % |
| 2 | 100 % | no disponible | no disponible | 100 % |
| 3 | 97,7 % | no disponible | 99,6 % (W=16) | 99,6 % |
| 4 | 72,3 % | 46,1 % (W=1) | 67,2 % | 83,2 % |

El autor reporta además una columna de RL con GRPO (`rl_scratch`) con resultados parciales (100 % en profundidades 1-2 y 75,4 % en profundidad 4); las celdas no cubiertas figuran como no disponibles en la información proporcionada. No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, lógicamente no aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo tiene 5,35 M de parámetros (unos 21 MB de pesos en fp32) más el estado de 16x256 y la ventana de acciones.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada. La inferencia en CPU es viable paso a paso dado el tamaño de la secuencia (76 tokens, 6 bloques).
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también en CPU.
- Opciones de despliegue: PyTorch nativo con los scripts del repositorio (`eval.py`, `web_sim.py`). No se proporcionan pesos GGUF, ni soporte para vLLM, TGI, llama.cpp u Ollama, que además no aplican a un transformer de 76 tokens con estado externo.
- Latencia y throughput: no se publican cifras. Por la dimensionalidad (d_model 256, 6 bloques, 76 tokens) se espera una latencia por paso del orden de milisegundos en CPU y submilisegundo en GPU; el cuello de botella real es el bucle de entorno (rotaciones y validación de estado), no la red.

## Comparativa con modelos similares

Los únicos comparadores con datos en la información proporcionada son los baselines internos del propio autor:

| Modelo | Parámetros | Estado recurrente | Scramble completo (25 mov.) | Licencia |
|---|---|---|---|---|
| `RecurrentCubeLM` v3 (este) | 5,35 M | 16 ranuras x 256, gated | 76,6 % | MIT |
| SFT feed-forward (`sft_ufr3`) | 14,2 M | ninguno | 0,0 % | MIT |
| Recurrente sin BPTT (`rnn_nobptt`, W=1) | no disponible | ventana W=1 | 0,0 % | MIT |
| Recurrente W=16 (`rnn_mem`) | no disponible | 16 pasos, sin memoria continua | 0,0 % | MIT |
| RL con GRPO (`rl_scratch`) | no disponible | no disponible | no disponible | MIT |

No se dispone en la información proporcionada de comparaciones cuantitativas con solvers neuronales externos (por ejemplo DeepCubeA o variantes de autodidactic iteration) ni con solvers algorítmicos como Kociemba o IDA*, que el autor cita únicamente como referencia de que el modelo no los utiliza en inferencia. Cualquier comparación con esos sistemas requeriría datos que no figuran en la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts naturales y no soporta tool calling ni razonamiento multi-paso en lenguaje. Cualquier uso fuera del dominio del cubo requiere reentrenamiento.
- Dominio cerrado y específico: entrenado exclusivamente para el cubo 3x3x3 con vista de 3 caras (U, F, R). No hay evidencia de generalización a otras configuraciones de observabilidad, a cubos de otro tamaño ni a otros POMDP.
- Tasa de éxito no perfecta: 76,6 % en scrambles completos de 25 movimientos implica aproximadamente uno de cada cuatro episodios fallido; inaceptable en un contexto donde se exija resolución garantizada.
- Sensibilidad crítica al estado de memoria: la ablación con `--reset_mem` lleva el éxito al 0 % en todas las tareas de resolución completa, lo que indica que el sistema depende por completo del estado recurrente y no de la observación actual. Cualquier inicialización incorrecta o corrupción de memoria invalida el comportamiento.
- Riesgo de sobreajuste a la distribución de entrenamiento: las trayectorias se generan con CFOP y cachés PDB; no se documenta el rendimiento ante scrambles de longitud distinta, distribuciones sesgadas o estados no alcanzables por CFOP.
- Sin datos de sesgo en el sentido habitual (no hay corpus lingüístico), pero sí posible sesgo algorítmico hacia las soluciones CFOP aprendidas, con menor diversidad de trayectorias.
- La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros completos de RL; la reproducibilidad total no está garantizada solo con la información publicada.
- Licencia MIT: permite uso comercial y modificación, pero el artefacto se distribuye sin garantías y con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa por parte de la comunidad.
- El tag `dagger` sugiere aprendizaje por imitación con agregación de dataset; los fallos en el conjunto de datos del profesor pueden propagarse a la política final.
- Sin cuantizaciones publicadas ni exportaciones a formatos de inferencia estándar (ONNX, GGUF); el despliegue está atado al código PyTorch del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sumitk/rubik-cube-3face-recurrent-ai
- Simulador interactivo 3D/2D (HuggingFace Space): https://huggingface.co/spaces/sumitk/rubik-cube-3face-sim
- Whitepaper técnico completo: `WHITEPAPER.md` dentro del repositorio del modelo
- Repositorio de checkpoints: incluido en el Hub del modelo (tamano del repo: 0,3 GB)
