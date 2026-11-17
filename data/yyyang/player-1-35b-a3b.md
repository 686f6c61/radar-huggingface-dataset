# yyyang/Player-1-35B-A3B

## Resumen

Player-1-35B-A3B es un modelo de agente jugador (game-playing agent) de tipo visión-lenguaje-acción (VLA) desarrollado por el proyecto Player-1, con el repositorio alojado bajo la cuenta yyyang y código en TencentARC. Se inicializa a partir de Qwen3.5-35B-A3B, un modelo de mezcla de expertos (MoE) multimodal, y se especializa mediante ajuste supervisado y aprendizaje por refuerzo en la interacción con entornos de juego 2D y 3D, incluyendo tareas de orientación espacial fina, seguimiento de objetivos y planificación estratégica de horizonte largo.

El modelo resuelve el problema de convertir observaciones visuales (capturas de pantalla) en acciones canónicas de juego (movimiento de ratón relativo/absoluto, clics y eventos de teclado discretos) a un ritmo de 200 ms por paso. Su relevancia radica en que combina la eficiencia de inferencia de un MoE con aproximadamente 3B de parámetros activos por token con una capacidad representacional de 35B totales, lo que permite despliegues en configuraciones multi-GPU razonables mientras se mantiene un razonamiento multi-paso profundo.

La arquitectura subyacente es un transformer MoE visión-lenguaje, con una longitud de contexto operativa de 16.384 tokens según la configuración de servicio recomendada. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, y está orientado a investigación en agentes autónomos, computer-use y visión-lenguaje-acción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE visión-lenguaje-acción (vision-language-action), basado en Qwen3.5-35B-A3B |
| Parámetros totales | 35.107.181.936 (35B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 16.384 tokens (configuración recomendada de servicio con vLLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Acción por paso | 200 ms (5 Hz) |
| Tamaño del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.5-35B-A3B |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, un transformer de mezcla de expertos con capacidades de visión y lenguaje. La activación dispersa (~3B de parámetros activos sobre 35B totales) reduce el coste computacional por token manteniendo la capacidad representacional del modelo completo, lo que resulta crítico para un agente que debe operar a 5 Hz sobre capturas de pantalla. El espacio de acciones se normaliza a acciones canónicas de juego: puntero de ratón relativo y absoluto, clics y eventos de teclado discretos.

El post-entrenamiento consta de dos fases. Primero, un ajuste supervisado (SFT) sobre Player-1-Data, un conjunto de 6.044 trayectorias procedentes de 172 juegos. Segundo, aprendizaje por refuerzo con PPO en Player-1-Gym, un entorno con 16 escenarios sintéticos y recompensas verificables. Esta combinación de datos reales diversos y RL con recompensas comprobables busca mejorar la robustez ante variaciones procedurales y la transferencia a juegos no vistos. El modelo soporta un modo de razonamiento (reasoning) y tool calling, con parsers específicos (`qwen3` para razonamiento y `qwen3_coder` para llamadas a herramientas) en la configuración de vLLM.

## Capacidades

- Razonamiento visión-lenguaje-acción: interpreta capturas de pantalla y emite acciones de juego coherentes.
- Orientación espacial fina y seguimiento de objetivos (aiming, targeting).
- Planificación multi-paso de horizonte largo en entornos abiertos (por ejemplo, Minecraft) y mecánicas de navegador complejas.
- Soporte de tool calling / function calling, con parser dedicado en vLLM.
- Modo de razonamiento explícito (`reasoning_content`) separado de la respuesta final.
- Interacción multi-turno con historial completo mediante plantilla de chat específica.
- Procesamiento de hasta 5 imágenes por prompt en la configuración recomendada.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de audio.

## Casos de uso

- Investigación en agentes autónomos de juego: el modelo actúa como política que traduce observaciones en acciones a 5 Hz, integrándose en Player-1-Gym para experimentos reproducibles con recompensas verificables.
- Automatización de pruebas de videojuegos: un agente capaz de navegar, apuntar y combatir en entornos 2D/3D puede ejecutar pruebas de regresión de jugabilidad sin intervención humana.
- Benchmarking de transferencia zero-shot: evaluación sobre GameWorld (170 tareas en 34 juegos) para medir la generalización a mecánicas no vistas durante el entrenamiento.
- Agentes de computer-use: las acciones canónicas (ratón y teclado) permiten reutilizar el modelo para interacción con interfaces gráficas más allá del juego.
- Investigación en RL con recompensas verificables: el pipeline SFT + PPO sirve como referencia para entrenar políticas en entornos sintéticos.
- Evaluación de planificación de horizonte largo: tareas de supervivencia y crafting en Minecraft (MineDojo-300) para estudiar la coherencia de decisiones a largo plazo.
- Navegación y combate en primera persona: ViZDoom-10 permite medir habilidades de navegación 3D y puntería en shooters clásicos.

## Benchmarks y rendimiento

La model card describe los cuatro benchmarks de evaluación (Player-1-Gym con 16 entornos, MineDojo-300 con 300 tareas, ViZDoom-10 con 10 mapas y GameWorld con 170 tareas en 34 juegos), pero no publica los resultados numéricos en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 70,2 GB en safetensors, por lo que la inferencia en precisión completa requiere al menos esa cantidad distribuida entre GPUs.
- Configuración recomendada por el autor: servicio multi-GPU con tensor parallelism de 2 o 4 GPUs de 80 GB (por ejemplo, A100 80GB o H100 80GB).
- No se indica que el modelo quepa en GPU de consumo; con 35B totales, una RTX 4090 (24 GB) requeriría cuantización agresiva no documentada.
- Despliegue: vLLM es la opción documentada, con `--tensor-parallel-size`, plantilla de chat específica, `--enable-auto-tool-choice`, parsers `qwen3_coder` y `qwen3`, `--max-model-len 16384` y `--limit-mm-per-prompt image=5`.
- Latencia y throughput: no disponibles; la cadencia de acción objetivo es de 200 ms por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Player-1-35B-A3B | 35B totales / ~3B activos | 16.384 tokens | VLA para juego | Apache 2.0 | Hugging Face |
| Qwen3.5-35B-A3B (base) | 35B totales / ~3B activos | no disponible | Visión-lenguaje general | no disponible | Hugging Face |
| Alternativas VLA de juego | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre Player-1-35B-A3B y otras políticas de juego en la información proporcionada.

## Limitaciones y advertencias

- Entrenado principalmente para entornos de juego; su uso fuera de ese dominio (computer-use general) no está validado en la información disponible.
- Idiomas: solo se declara inglés, lo que limita instrucciones en castellano u otros idiomas.
- Riesgo de alucinación en el razonamiento intermedio; el modo de razonamiento no garantiza acciones correctas.
- Dependencia de la plantilla de chat específica y de los parsers de vLLM; una configuración incorrecta puede degradar el comportamiento del agente.
- Ventana de contexto de 16.384 tokens en la configuración recomendada; historiales largos de juego pueden truncarse.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-35B-A3B debe verificarse por separado.
- Solo 174 descargas y 1 like en el momento de la consulta: ecosistema reducido y poca validación comunitaria.
- No se especifican requisitos de cuantización ni soporte en llama.cpp/Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyyang/Player-1-35B-A3B
- Página del proyecto: https://player-1-project.github.io/
- Paper (arXiv): https://arxiv.org/abs/2610.20584
- Repositorio de código: https://github.com/TencentARC/Player-1
- Dataset Player-1-Data: https://huggingface.co/datasets/yyyang/Player-1-Data
- Ejemplo de inferencia interactiva: https://github.com/TencentARC/Player-1/blob/main/examples/inference/play_game.py
- Plantilla de chat: https://raw.githubusercontent.com/TencentARC/Player-1/main/player1/agents/chat_template/qwen3_5_player1_full_history.jinja
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
