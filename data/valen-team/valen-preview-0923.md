# Valen-Team/Valen-Preview-0923

## Resumen

Valen-Preview-0923 es un modelo de decisión multimodal desarrollado por Valen-Team, construido sobre el modelo base Qwen3.5-2B mediante ajuste fino. A diferencia de los modelos generativos convencionales, Valen no produce tokens de respuesta: evalúa instrucciones de tarea junto con candidatos (texto, imágenes o vídeo) y devuelve una distribución de probabilidad sobre las opciones suministradas. Esta aproximación, inspirada en los modelos "System One" de Jev, prioriza la latencia de decisión sobre la generación autoregresiva.

La versión Preview-0923 es un checkpoint entrenado específicamente para Sokoban, un juego de empuje de cajas con planificación espacial. Se parte de una cabeza de decisión afinada con el dataset General 100k y se aplica RLCD (Reinforcement Learning with Contrastive Decoding) sobre 30.000 registros de Sokoban durante tres épocas. El resultado es un modelo de 2B parámetros que resuelve puzles en milisegundos por paso, con una latencia acumulada de 1,13 segundos en una partida de 9 decisiones.

El modelo es relevante porque demuestra que un modelo pequeño con una interfaz de decisión explícita puede superar en eficiencia a modelos generativos mucho mayores en tareas de control y razonamiento visual estructurado. La licencia Apache 2.0 y su tamaño contenido lo hacen adecuado para experimentación e integración en agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-2B) con cabeza de decisión, LoRA en el modelo de lenguaje, merger visual y cuatro bloques visuales finales entrenados |
| Parametros totales | 2B (modelo base congelado) + adaptadores y cabeza de decisión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint con estado de optimizador y entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B como backbone congelado y añade una cabeza de decisión que transforma la representación interna en probabilidades sobre candidatos predefinidos. La interfaz de decisión soporta tres modos: Choice (selección entre opciones discretas), Noul (probabilidad de que ninguna opción sea válida) y Score (puntuación de candidatos). El checkpoint incluye la cabeza de decisión, un adaptador LoRA sobre el modelo de lenguaje, el merger visual y los cuatro bloques visuales finales, además del estado del optimizador; el backbone congelado debe descargarse por separado desde Qwen/Qwen3.5-2B en la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`.

El entrenamiento se realiza en dos fases: primero un SFT sobre el dataset General 100k para la cabeza de decisión, y después RLCD sobre 30.000 registros de Sokoban durante tres épocas con `vision_top`, lo que supone 90.000 exposiciones a registros. La innovación principal es la eliminación de la generación de tokens en la inferencia: el modelo evalúa directamente los candidatos y devuelve probabilidades, lo que reduce la latencia a decenas de milisegundos por decisión. El nombre Valen proviene de la hipótesis de la Reina Roja de Leigh Van Valen, en referencia a la necesidad de evolución continua.

## Capacidades

- Evaluación multimodal de instrucciones y candidatos: acepta texto, imágenes y vídeo como entrada y devuelve probabilidades sobre opciones suministradas.
- Decisión estructurada mediante la interfaz Choice, Noul y Score.
- Percepción visual aplicada a tareas de control y planificación espacial (entrenado específicamente en Sokoban).
- Razonamiento de un solo paso con alta eficiencia: 122-128 ms por decisión en las demostraciones publicadas.
- Calibración de confianza: la probabilidad de la acción óptima y la confianza de decisión varían de forma medible con el nivel de desenfoque de la imagen (93,7% y 91,6% en imagen clara; 39,4% y 19,2% con desenfoque gaussiano de 72 px).
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su función es la evaluación de candidatos.
- Capacidades multilingües no documentadas.

## Casos de uso

- Agentes de control en entornos de rejilla: el modelo evalúa el estado visual del tablero y las acciones candidatas, devolviendo la probabilidad de cada movimiento en menos de 130 ms, lo que permite bucles de control en tiempo real sin generación autoregresiva.
- Investigación en aprendizaje por refuerzo: la interfaz Score y Noul facilita la integración como política de decisión en pipelines de RL, con la ventaja de que el modelo devuelve distribuciones calibradas en lugar de secuencias de tokens.
- Evaluación de robustez visual: el modelo permite medir cómo varía la confianza de decisión ante perturbaciones controladas (desenfoque, ruido), útil para estudiar la calibración de modelos multimodales en condiciones degradadas.
- Planificación en puzles y juegos: con 38/100 partidas de Sokoban resueltas en el conjunto de evaluación, puede emplearse como componente de planificación en entornos con estado visual y acciones discretas.
- Prototipado rápido de agentes de decisión: al requerir solo 1,2 GB de checkpoint (más el backbone base) y licencia Apache 2.0, es adecuado para experimentos académicos y pruebas de concepto en entornos con recursos limitados.
- Evaluación comparativa de arquitecturas de decisión: sirve como referencia para comparar modelos generativos grandes frente a modelos pequeños con interfaz de decisión en tareas de control, como muestra la comparación con Qwen3.8-27B-FP8 (9 decisiones y 1,13 s frente a 198,05 s en modo thinking).
- Sistemas de verificación de acciones: en aplicaciones donde se generan candidatos externamente y se necesita puntuarlos, el modo Score permite ordenar opciones sin coste de generación.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---:|
| 500 preguntas de acción de Sokoban de un solo paso | 87,60% de precisión |
| 100 partidas completas de Sokoban (máximo 200 movimientos) | 38/100 resueltas |

Los niveles de Sokoban empleados son simples: 35 fáciles y 65 medios. El conjunto retuvo todos los casos exitosos del modelo 2B con RLCD antes de completarse hasta 100, por lo que está condicionado por el resultado del modelo y no constituye un benchmark completo imparcial. La precisión de un solo paso y el éxito en partidas completas son métricas distintas.

En la demostración comparativa, Valen-Preview-0923 resuelve un nivel en 9 decisiones con 1,13 s de latencia acumulada, frente a Qwen3.8-27B-FP8, que tarda 198,05 s en modo thinking y falla en modo no-thinking. En la demostración de cuatro partidas en paralelo, cada partida requiere entre 7 y 10 decisiones, con una media de 122-128 ms por paso, y las cuatro finalizan en 1,24 s.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,2 GB; sumado al backbone Qwen3.5-2B congelado, la inferencia en precisión completa requiere aproximadamente 5-6 GB de VRAM (estimación basada en 2B parámetros en FP16 más overhead).
- GPU recomendadas: no se especifican en la documentación; por tamaño, cabe en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en FP16; con cuantización (no documentada) podría reducirse.
- Opciones de despliegue: la librería indicada es PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El script de inicio rápido del repositorio descarga y verifica la revisión del backbone.
- Latencia y throughput: 122-128 ms por decisión en las demostraciones publicadas; 1,13 s acumulados en 9 decisiones; cuatro partidas en paralelo completadas en 1,24 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Preview-0923 | 2B | No disponible | Decisión multimodal (Choice/Noul/Score) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-FP8 | 27B | No disponible | Generación autoregresiva con modo thinking | No disponible | No disponible en la información |
| Valen-Decision-1.5-2B | 2B | No disponible | Decisión multimodal (versión posterior) | No disponible | Hugging Face |

La comparación directa con Qwen3.8-27B-FP8 en la demostración de Sokoban muestra una diferencia de dos órdenes de magnitud en latencia (1,13 s frente a 198,05 s) y resolución del puzle por parte del modelo pequeño frente al fallo del grande en modo no-thinking. No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) para establecer comparaciones adicionales.

## Limitaciones y advertencias

- El conjunto de evaluación de Sokoban está condicionado por el resultado del modelo (retuvo los casos exitosos antes de completarse), por lo que las métricas de 87,60% y 38/100 no son representativas de un benchmark imparcial.
- El modelo está entrenado específicamente para Sokoban; su generalización a otras tareas de decisión o dominios visuales no está documentada.
- No genera texto libre ni soporta tool calling o razonamiento multi-paso generativo; su uso está restringido a la evaluación de candidatos predefinidos.
- La confianza de decisión se degrada con el desenfoque de la imagen (del 91,6% al 19,2% con 72 px de desenfoque gaussiano), lo que indica sensibilidad a la calidad visual.
- No se documentan sesgos conocidos, riesgos de alucinación en el sentido generativo, ni limitaciones idiomáticas; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B debe verificarse en su propia licencia.
- El checkpoint requiere descargar el backbone congelado por separado en una revisión específica; no es un modelo autónomo.
- No se documentan opciones de cuantización ni formatos GGUF, lo que limita el despliegue en entornos con herramientas estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Preview-0923
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio GitHub: https://github.com/Liuziyu77/Valen
- README en chino: https://github.com/Liuziyu77/Valen/blob/main/README_zh.md
- Notas técnicas: https://github.com/Liuziyu77/Valen/blob/main/docs/technical.md
- Organización en Hugging Face: https://huggingface.co/Valen-Team
- Dataset General 100k: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Dataset General 5k de evaluación: https://huggingface.co/datasets/Valen-Team/Valen-Eval-General-5k
- Dataset Sokoban de entrenamiento y evaluación: https://huggingface.co/datasets/Valen-Team/Valen-Eval-Game
- Valen-Decision-1.5-2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Valen-Decision-1.5-0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Valen-Decision-1.5-4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Valen-Decision-1.5-9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Valen-Decision-1.5-27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Valen-Sokoban-RLCD-2B: https://huggingface.co/Valen-Team/Valen-Sokoban-RLCD-2B
- Blog sobre modelos System One (Jev): https://typesafe.ai/blog/introducing-system-one-models-and-jev
