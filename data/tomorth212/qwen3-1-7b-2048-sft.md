# tomorth212/qwen3-1.7b-2048-sft

## Resumen

tomorth212/qwen3-1.7b-2048-sft es un ajuste fino supervisado (SFT) de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 1.720.574.976 parámetros, especializado en una única tarea: seleccionar un movimiento legal en una partida de 2048 sobre un tablero de 4×4. Lo desarrolla Thomas Orth dentro de su proyecto "30 Days of RL", y se distribuye como un checkpoint fusionado en BF16 entrenado localmente con MLX-LM mediante LoRA sobre 10.000 decisiones tablero-a-movimiento del dataset yethdev/2048-gameplay-dataset.

Su relevancia no está en ser un asistente general, sino en servir como política inicial (policy starting point) reproducible para experimentos posteriores basados en recompensa. El autor indica explícitamente que este checkpoint no ha pasado por entrenamiento GRPO, por lo que su función principal es actuar como línea base de SFT sobre la que aplicar RL.

El modelo no es conversacional en sentido amplio: su contrato de salida exige exactamente un campo JSON, por ejemplo `{"direction":"left"}`, con valores permitidos up, down, left y right, debiendo además ser un movimiento legal sobre el tablero proporcionado. Se usa en modo no-thinking (`enable_thinking=False`) y está pensado para prompts en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parámetros totales | 1.720.574.976 (según safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento SFT usó una longitud máxima de secuencia de 1.024 tokens) |
| Tipos de cuantización | BF16 sin cuantizar (checkpoint fusionado); no se documentan otros esquemas en la ficha del autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX; librería mlx) |
| Modelo base | Qwen/Qwen3-1.7B (revisión 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e) |
| Dataset de entrenamiento | yethdev/2048-gameplay-dataset (revisión 6361134aa2ee0fb1f9097a45775878734e21fa62) |
| Proyecto | TomOrth/RL-2048 |
| Parámetros entrenables | aproximadamente 1,835 millones (LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer autorregresivo denso, y se ha adaptado mediante LoRA SFT seguido de fusión del adaptador en los pesos base. La configuración de entrenamiento usó precisión BF16, LoRA con rango 16, escala 1,0 y dropout 0,0 (convención de escala de MLX-LM), aplicado a los módulos `self_attn.q_proj` y `self_attn.v_proj` de los últimos 16 bloques del transformer. El total de parámetros entrenables fue de aproximadamente 1,835 millones, optimizados con Adam a una tasa de aprendizaje de 1e-4, microbatch 4 y acumulación de gradiente 1, a lo largo de 2.500 minibatches (aproximadamente una pasada sobre las 10.000 decisiones). La longitud máxima de secuencia fue de 1.024 tokens y la supervisión se limitó a la finalización (JSON de acción más EOS), excluyendo prompt y padding, con 6 tokens supervisados por decisión.

Los datos proceden del dataset yethdev/2048-gameplay-dataset y se dividen en entrenamiento (10.000 decisiones de 5.402 partidas), validación (2.000 decisiones de 748 partidas) y test (5.000 decisiones de 898 partidas, reservado y no usado en los resultados publicados). Las partidas se asignan a train/validación mediante un hash estable a nivel de partida; el muestreo es determinista con semilla 2048, límite de 64 decisiones por partida y muestreo en tres etapas de juego. El importador corrige el layout del tablero a `canonical_board[r][c] = source_flat[4*c+r]`, con filas de arriba abajo, columnas de izquierda a derecha y cero para celda vacía. Se cuarentenan duplicados por simetría de tablero (prioridad test > validación > train) y se excluyen etiquetas contradictorias, validando cada transición, acción y recompensa contra el motor compartido de 2048. No ha habido GRPO ni optimización por recompensa: es un piloto puramente SFT.

## Capacidades

- Selección de un movimiento legal en 2048: dado un tablero de 4×4 representado en el prompt, devuelve una acción en JSON.
- Contrato de salida estricto: exactamente un campo, `{"direction":"up|down|left|right"}`, que además debe ser legal en el tablero suministrado.
- Modo no-thinking: se invoca con `enable_thinking=False`, sin cadena de razonamiento explícita.
- Cumplimiento de formato validado: en la evaluación, 100/100 respuestas raw en JSON resultaron válidas y legales.
- Imitación de política experta: 52/100 (52%) de acuerdo con la acción experta frente al 32% de la base, tanto en scoring de candidatos legales como en generación greedy raw.
- Idiomas: únicamente inglés en los prompts.
- No dispone de tool calling, function calling, soporte de agentes multi-paso, visión, audio ni chat general; es una política especializada, no un asistente.

## Casos de uso

- Línea base de SFT para RL: sirve como política inicial sobre la que aplicar GRPO u otros métodos de optimización por recompensa en el proyecto 30 Days of RL, partiendo de un rendimiento ya validado frente a la base.
- Agente/bot de 2048: integrado en un motor que calcule la legalidad de movimientos, el modelo elige la dirección en cada turno y permite jugar partidas completas de forma automática (media de 217,68 movimientos por partida).
- Investigación en pipelines de SFT sobre MLX: reproducible en Apple Silicon, útil para estudiar el efecto de rank, módulos objetivo y longitud de secuencia en tareas de decisión estructurada.
- Evaluación de decodificación con restricciones: dado su contrato JSON, sirve para probar técnicas de scoring de candidatos legales con suma de log-probabilidades condicionales frente a generación greedy.
- Generación de datos de imitación: puede producir trayectorias de juego etiquetadas que alimenten datasets de destilación o entrenamiento posterior, siempre que se filtre la legalidad.
- Estudio comparativo de runtimes: útil para medir cuánto cambian las puntuaciones al pasar de la combinación base+adaptador en MLX a un export fusionado servido con Transformers o vLLM, dado que el propio autor advierte de divergencias.
- Prototipado de políticas de decisión de bajo coste: con 1,72B parámetros y BF16, cabe en hardware de consumo, lo que permite experimentar sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 partidas completas de desarrollo con las mismas semillas iniciales y 100 tableros de validación procedentes de 94 partidas fuente, usando los mismos prompts, evaluación FP32 y batch de inferencia 8:

| Métrica | Base Qwen3-1.7B | SFT pilot |
|---|---:|---:|
| Puntuación final media | 1.163,84 | 2.461,76 |
| Puntuación final mediana | 1.106 | 2.418 |
| Movimientos medios por partida | 126,35 | 217,68 |
| Partidas que alcanzan ficha 512 | 0/100 | 4/100 |
| Partidas que alcanzan ficha 1024 | 0/100 | 0/100 |
| Partidas que alcanzan ficha 2048 | 0/100 | 0/100 |
| Acuerdo con acción experta (scoring de candidatos legales) | 32/100 (32%) | 52/100 (52%) |
| Acuerdo con acción experta (generación greedy raw) | 31/100 (31%) | 52/100 (52%) |
| Acciones JSON válidas y legales (raw) | 100/100 | 100/100 |
| Partidas fallidas o con tope de movimientos | 0/0 | 0/0 |

El SFT puntuó más alto en 84 de las 100 partidas emparejadas y más bajo en 16. La mejora media fue de 1.297,92 puntos, aproximadamente 2,12× la media base, con un intervalo de confianza del 95% de [1.040,96; 1.557,24] puntos mediante bootstrap apareado de 10.000 remuestreos. Ese intervalo describe esta muestra de semillas de desarrollo, no una generalización a un conjunto final independiente. Las métricas de juego y de acuerdo con acción experta se calcularon puntuando cada respuesta JSON legal completa (incluido EOS) con suma de log-probabilidades condicionales y eligiendo la de mayor puntuación; la comprobación raw usó decodificación greedy, plantillas no-thinking y un máximo de 64 tokens generados. Todas las cifras se midieron con el checkpoint base original más el adaptador LoRA final en MLX, no con este export fusionado, Transformer o vLLM.

## Requisitos de hardware

- VRAM estimada (inferencia): en BF16, unos 3,4 GB solo de pesos, en torno a 4-5 GB con overhead; en 8 bits, aproximadamente 1,8 GB; en 4 bits, alrededor de 1 GB (estas conversiones no están documentadas por el autor y dependen del runtime).
- GPU recomendadas: al ser un modelo de 1,72B, cabe en GPUs de consumo; una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o superiores son suficientes en BF16.
- Consumer GPU: sí, cabe en GPU de consumo actuales. También es viable en Apple Silicon con memoria unificada, dado que el formato nativo es MLX.
- Opciones de despliegue: MLX-LM de forma nativa; llama.cpp, Ollama o TGI/vLLM requerirían conversión de pesos. El autor advierte que la fusión BF16 y un runtime o decoder distintos pueden alterar puntuaciones y salidas, por lo que conviene comparar sobre las mismas entradas antes de asumir equivalencia.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible en la información proporcionada | Modelo general de texto, no especializado en 2048 | apache-2.0 | HuggingFace |
| tomorth212/qwen3-1.7b-2048-sft (este) | 1,72B | no disponible (SFT con secuencia de 1.024 tokens) | Selección de movimiento legal en 2048 | apache-2.0 | HuggingFace (MLX) |
| Otros modelos específicos de 2048 | no disponible | no disponible | no disponible | no disponible | no se han identificado en la información disponible |

La comparación más directa es contra su propio modelo base, sobre el que este checkpoint mejora la puntuación media de 1.163,84 a 2.461,76 y el acuerdo con acción experta del 32% al 52%. No se dispone de datos sobre otros modelos especializados en 2048 para establecer una comparativa externa.

## Limitaciones y advertencias

- Modelo estrictamente especializado: no es un asistente general ni mantiene conversaciones; solo resuelve selección de movimiento en 2048.
- Riesgo de movimientos ilegales: aunque el contrato exige JSON legal y la evaluación dio 100/100, en producción conviene filtrar la legalidad con el motor del juego, ya que el modelo no la garantiza por sí mismo.
- No ha pasado por GRPO: es una política SFT inicial, no optimizada por recompensa; cabe esperar margen de mejora.
- El acuerdo con acción experta (52%) mide imitación de las etiquetas del dataset, no optimalidad de esas acciones.
- Cobertura limitada: en las 100 partidas evaluadas no alcanza la ficha 1024 ni 2048 (0/100 en ambas), por lo que no domina el juego.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Sesgos conocidos: no disponibles explícitamente; al imitar un dataset concreto hereda sus sesgos de política (por ejemplo, el sesgo de las acciones etiquetadas por el experto).
- Riesgo de alucinación/formatos inválidos si se usa fuera del contrato JSON o sin plantilla no-thinking; el autor solo garantiza el comportamiento dentro de su configuración evaluada.
- Restricciones de licencia: apache-2.0 heredada del modelo base, permisiva para uso comercial, pero conviene verificar las condiciones del dataset y del modelo base.
- Caveat de reproducibilidad: los resultados no son un benchmark de este export fusionado ni de Transformers/vLLM; BF16 y distintos runtimes o decoders pueden cambiar las salidas.
- El intervalo de confianza bootstrap ([1.040,96; 1.557,24]) se refiere solo a la muestra de semillas de desarrollo, no a generalización a un conjunto final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomorth212/qwen3-1.7b-2048-sft
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset 2048-gameplay-dataset: https://huggingface.co/datasets/yethdev/2048-gameplay-dataset
- Proyecto RL-2048: https://github.com/TomOrth/RL-2048
- yeth.dev (autor del dataset): https://yeth.dev
