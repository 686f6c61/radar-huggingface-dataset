# yyyang/Player-1-9B

## Resumen

Player-1-9B es un modelo vision-lenguaje-acción (VLA) de pesos abiertos desarrollado por yyyang y el equipo detrás de TencentARC, diseñado para el control generalista de videojuegos. Se construye sobre Qwen/Qwen3.5-9B, un modelo denso de visión y lenguaje, y se especializa en percibir el estado de un juego a través de capturas de pantalla, razonar paso a paso sobre la situación y emitir acciones de teclado y ratón. Forma parte del proyecto Player-1: Learning to Play from Synthetic Experience.

El modelo resuelve el problema del control de agentes en entornos de juego heterogéneos sin ingeniería específica por título: recibe una observación visual y una instrucción en lenguaje natural, y devuelve una llamada a herramienta con la acción normalizada correspondiente. Su relevancia actual radica en que combina un pipeline de post-entrenamiento en dos fases (SFT sobre trayectorias reales y RL con PPO en entornos sintéticos con recompensas verificables) sobre una base multimodal moderna, con licencia Apache 2.0.

Cuenta con 9.409.813.744 parámetros reales según los pesos en safetensors (la model card indica 9,6B de forma aproximada), un repositorio de 18,8 GB y soporte declarado únicamente para inglés. El contexto operativo recomendado en el ejemplo de despliegue es de 16.384 tokens, con un máximo de 5 imágenes por prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-lenguaje (base Qwen3.5-9B) con salida de acciones vía tool calling |
| Parametros totales | 9.409.813.744 (según safetensors); la model card indica 9,6B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de servicio recomendada (vLLM, `--max-model-len 16384`) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Player-1-9B es un transformer denso multimodal construido sobre Qwen3.5-9B, que aporta la torre visual y el decodificador de lenguaje. Sobre esa base, el modelo se especializa en un espacio de acciones canónico y normalizado: movimiento relativo de ratón `dx, dy` en `[-1000, 1000]`, posición absoluta `x, y` en `[0, 1000]`, clics `left`/`right`/`middle`, teclas de teclado (`KeyW`, `Space`, `ShiftLeft`, etc.) y una duración de 200 ms por paso. Las acciones se emiten como llamadas a función, lo que permite integrarlas en clientes compatibles con la API de OpenAI.

El post-entrenamiento consta de dos fases. Primero, un ajuste supervisado (SFT) sobre Player-1-Data, un conjunto de 6.044 trayectorias procedentes de 172 juegos, con muestreo equilibrado por tipo de acción para evitar el sesgo hacia acciones frecuentes. Después, un entrenamiento por refuerzo con PPO en Player-1-Gym, que abarca 16 entornos sintéticos 2D y 3D con recompensas verificables derivadas del estado del juego. El resultado es un modelo que genera razonamiento explícito antes de la acción (parser de razonamiento `qwen3`) y que se sirve con plantilla de chat específica para historial completo de juego.

## Capacidades

- Percepción visual de capturas de pantalla de juego y generación de razonamiento paso a paso antes de actuar.
- Emisión de acciones de ratón y teclado mediante tool calling / function calling con esquema normalizado.
- Control de agentes en entornos 2D y 3D: apuntado, combate, conducción y navegación.
- Razonamiento multi-paso orientado a objetivos expresados en lenguaje natural.
- Transferencia zero-shot a juegos no vistos, según la evaluación declarada en GameWorld.
- Soporte de modo de razonamiento separado (`reasoning_content`) además de la llamada a herramienta.
- Capacidad conversacional multimodal (pipeline `image-text-to-text`), con hasta 5 imágenes por prompt en la configuración recomendada.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agentes de juego automatizados en entornos Gym: el modelo se conecta a Player-1-Gym y ejecuta políticas interactivas con el script `examples/inference/play_game.py`, aprovechando las recompensas verificables para evaluar y depurar el comportamiento.
- Investigación en aprendizaje por refuerzo aplicado a agentes visuales: sirve como política inicial o modelo de referencia para experimentos de RL con PPO sobre entornos sintéticos, dado que el pipeline completo de entrenamiento es público.
- Benchmarking de agentes computer-use: se puede desplegar como baseline en suites de evaluación de control por pantalla, comparando su razonamiento y sus acciones contra otros VLA.
- Prototipado de asistentes de juego: un asistente que observa la pantalla del usuario y sugiere o ejecuta acciones concretas (apuntar, moverse, interactuar) mediante instrucciones en lenguaje natural.
- Automatización de pruebas de jugabilidad: generar trayectorias de juego reproducibles para detectar regresiones en mecánicas, colisiones o balanceo en builds de desarrollo.
- Generación de datos sintéticos de interacción: usar el modelo para producir trayectorias etiquetadas (observación, razonamiento, acción) que alimenten posteriores ciclos de SFT.
- Demostraciones interactivas de investigación: servir el modelo con vLLM y un cliente compatible con OpenAI para visualizar en tiempo real el razonamiento y las acciones emitidas.

## Benchmarks y rendimiento

La model card describe cuatro benchmarks de evaluación (Player-1-Gym con 16 entornos, MineDojo-300 con 300 tareas, ViZDoom-10 con 10 mapas y GameWorld con 170 tareas en 34 juegos), pero no publica cifras numéricas de resultados en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): en torno a 19-20 GB solo para pesos, más overhead de caché KV y procesamiento de imágenes; se recomienda un mínimo de 24 GB para uso práctico con contexto moderado.
- GPU recomendadas para servicio en producción: A100 40/80 GB, H100, L40S o A10G de 24 GB para cargas ligeras.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16 con contexto reducido; en GPUs de 16 GB requeriría cuantización, que no está documentada oficialmente para este modelo.
- Opciones de despliegue: vLLM es la vía recomendada por el autor, con `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`, `--max-model-len 16384` y `--limit-mm-per-prompt image=5`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Player-1-9B | 9,41B | 16.384 tokens (config. recomendada) | VLA para control de juegos sobre Qwen3.5-9B | Apache 2.0 | Pesos en Hugging Face, código y dataset públicos |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | No disponible en la información | VLM denso generalista | No disponible en la información | Hugging Face |
| Alternativas VLA de juego comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para control de juegos; su uso fuera de ese dominio (por ejemplo, automatización de escritorio genérica) no está validado.
- El espacio de acciones está normalizado y limitado a ratón y teclado con pasos de 200 ms; no cubre mandos, gestos táctiles ni acciones de duración variable.
- Soporte de idioma declarado únicamente en inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación en el razonamiento previo a la acción: el texto de `reasoning_content` puede no corresponder con la acción finalmente emitida.
- La evaluación zero-shot en GameWorld sugiere variabilidad entre juegos; no se publican métricas por título en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-9B y de los datasets asociados.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en GPUs de menos de 24 GB.
- El número de descargas (73) y la ausencia de likes indican una adopción todavía muy temprana; la madurez del ecosistema de herramientas es limitada.
- El repositorio ocupa 18,8 GB, lo que exige espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyyang/Player-1-9B
- Página del proyecto: https://player-1-project.github.io/
- Paper (arXiv): https://arxiv.org/abs/2610.20584
- Repositorio de código: https://github.com/TencentARC/Player-1
- Dataset Player-1-Data: https://huggingface.co/datasets/yyyang/Player-1-Data
- Script de inferencia interactiva: https://github.com/TencentARC/Player-1/blob/main/examples/inference/play_game.py
- Plantilla de chat para vLLM: https://raw.githubusercontent.com/TencentARC/Player-1/main/player1/agents/chat_template/qwen3_5_player1_full_history.jinja
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
