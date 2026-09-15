# XueZhaAllen/llama31-8b-poker-mix-v1-step10k-Q4_K_M-GGUF

## Resumen

PokerLlama-4 es un ajuste fino de Llama 3.1 8B especializado en póker heads-up no-limit Texas Hold'em, publicado originalmente por jevonmao y distribuido en este repositorio por XueZhaAllen en formato GGUF cuantizado a Q4_K_M. El modelo resuelve una tarea muy concreta: dada una secuencia de acciones y el estado de una mano, predecir la acción óptima (tipo de acción y, presumiblemente, sizing) con una salida estructurada y parseable. No es un modelo de propósito general, sino una herramienta de dominio para investigación en juegos de información imperfecta y para el desarrollo de asistentes o bots de póker.

La relevancia de esta ficha concreta es práctica: el repositorio ofrece el modelo en GGUF Q4_K_M, lo que reduce el peso a unos 4,9 GB y permite ejecutarlo en GPU de consumo y en equipos Apple Silicon mediante llama.cpp, sin necesidad de infraestructura de servidor. Esto rebaja de forma drástica la barrera para experimentar con un modelo especializado que, en su versión original, requeriría mayores recursos.

Técnicamente es un transformer decoder-only de 8.030 millones de parámetros derivado de la familia Llama 3.1, entrenado mediante SFT (con LoRA y destilación según las etiquetas del autor) sobre el dataset jevonmao/poker-sft-mix-v1. La única métrica publicada es una precisión top-1 de tipo de acción del 83,96 % sobre un split held-out de HoldemEval-31k, con una tasa de parseo del 100 %. No hay datos publicados sobre longitud de contexto efectiva del ajuste, ni benchmarks generalistas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.1: RoPE, GQA, SwiGLU, RMSNorm) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para este ajuste; el ejemplo de uso del autor emplea `-c 2048`. El modelo base Llama 3.1 8B documenta 128k tokens |
| Tipos de cuantizacion | Q4_K_M en este repositorio; el formato GGUF permite generar otras (Q2_K a Q8_0) a partir del modelo base |
| Idiomas soportados | en (inglés). La ficha no declara otros idiomas |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (Q4_K_M); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA), codificación posicional rotatoria (RoPE), activación SwiGLU y normalización RMSNorm. Sobre esa base se aplicó un ajuste supervisado (SFT) orientado a la predicción de acciones en póker. Las etiquetas del repositorio indican el uso de LoRA y de destilación, además de referencias explícitas a GTO y equilibrio de Nash, lo que sugiere que las respuestas objetivo se derivaron de un solver o de un profesor más fuerte, pero no se aporta detalle sobre el proceso exacto.

El dataset declarado es jevonmao/poker-sft-mix-v1, y el checkpoint se identifica como «step10k», lo que apunta a un entrenamiento de aproximadamente 10 000 pasos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La innovación destacable no está en la arquitectura, que es estándar, sino en el formato de salida: el modelo genera acciones parseables de forma fiable (tasa de parseo del 100 % en el conjunto evaluado), lo que lo hace directamente integrable en un motor de juego o en un pipeline de evaluación.

## Capacidades

- Generación de texto conversacional y en formato de instrucciones, en inglés.
- Predicción de acciones en póker heads-up no-limit Texas Hold'em: tipo de acción a partir del estado de la mano y del historial de apuestas.
- Razonamiento de dominio sobre estrategia de póker, con etiquetas asociadas a GTO y equilibrio de Nash.
- Salida estructurada y parseable, apta para consumo programático (100 % de tasa de parseo en HoldemEval-31k según el autor).
- Razonamiento paso a paso derivado del ajuste SFT sobre datos de destilación.
- No hay información publicada sobre soporte de tool calling o function calling.
- No hay información publicada sobre capacidades de agente, multi-step reasoning fuera del dominio del póker, visión, audio ni modo «thinking» explícito.
- Capacidades multilingües: no declaradas; el modelo se etiqueta únicamente como inglés.

## Casos de uso

- Asistente de estudio de póker: el modelo recibe el historial de una mano heads-up y devuelve la acción recomendada, lo que permite al jugador contrastar su decisión con la salida del modelo en sesiones de repaso.
- Revisión automática de sesiones (session review): procesar de forma por lotes cientos de manos registradas en un tracker y marcar aquellas en las que la acción del jugador se desvía de la predicción del modelo, priorizando el análisis manual.
- Generación de datos sintéticos para investigación: usar las predicciones del modelo como etiquetas preliminares o como política de referencia para entrenar o evaluar agentes de aprendizaje por refuerzo en entornos de información imperfecta.
- Motor de decisión en un bot de entrenamiento: integrarlo mediante llama-server y consultarlo desde un cliente de póker simulado, aprovechando la salida parseable para traducir directamente la respuesta en una acción ejecutable.
- Herramienta educativa interactiva: construir un chat donde el usuario plantea situaciones («tengo AKo en el botón, el rival hace 3-bet...») y el modelo explica y propone una línea, con el ajuste SFT como fuente de estilo de respuesta.
- Evaluación comparativa de modelos de dominio: servir como línea base especializada frente a modelos generalistas en tareas de predicción de acción, gracias a una métrica publicada y a un conjunto de evaluación identificable.
- Despliegue en local para privacidad: al ejecutarse con llama.cpp sobre un GGUF Q4_K_M, todo el procesamiento ocurre en la máquina del usuario, lo que evita enviar historiales de manos a servicios externos.
- Prototipado rápido en portátil: con un peso de 4,9 GB, cabe en equipos con GPU modesta o memoria unificada, lo que permite iterar sobre prompts y formatos sin aprovisionar servidores.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el model-index de la model card. No están verificados de forma independiente.

| Benchmark | Tarea | Métrica | Valor | Verificado |
|---|---|---|---|---|
| HoldemEval-31k (held-out split), dataset jevonmao/poker-sft-mix-v1 | Heads-up no-limit action prediction | Top-1 action-type accuracy | 0,8396 | No |
| HoldemEval-31k (held-out split), dataset jevonmao/poker-sft-mix-v1 | Heads-up no-limit action prediction | Output parse rate | 1,0 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas para este modelo en la información disponible. Tampoco hay comparaciones con otros modelos de póker publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con la cuantización Q4_K_M (fichero de 4,9 GB) más la caché KV; el consumo exacto depende de la longitud de contexto configurada y del backend.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 lo ejecutan con holgura. En el extremo bajo, una GPU de 8 GB debería bastar con contexto corto.
- Cabe en GPU de consumo: sí. También es viable en Apple Silicon con memoria unificada (M1/M2/M3 con 8 GB o más) y en CPU, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por compatibilidad de formato, otros runners GGUF como Ollama, LM Studio o text-generation-webui. vLLM y TGI no son la vía natural para este repositorio, que solo publica GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor. Como referencia orientativa, un modelo de 8B en Q4_K_M suele moverse en el orden de decenas de tokens por segundo en GPU de consumo moderna, pero este dato no está respaldado por ninguna medición de este repositorio.
- Comandos de referencia incluidos por el autor: `llama-cli --hf-repo XueZhaAllen/llama31-8b-poker-mix-v1-step10k-Q4_K_M-GGUF --hf-file llama31-8b-poker-mix-v1-step10k-q4_k_m.gguf` y `llama-server ... -c 2048`.

## Comparativa con modelos similares

No se dispone de datos sobre otros modelos especializados en póker (métricas, tamaño o licencia) en la información proporcionada. La comparación más directa posible es con el modelo base del que deriva y con el Llama 3.1 8B genérico.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| PokerLlama-4 (este repo, Q4_K_M) | 8,03 B | no disponible (ejemplo a 2048) | Póker heads-up no-limit | llama3.1 | GGUF |
| jevonmao/llama31-8b-poker-mix-v1-step10k | 8,03 B | no disponible | Póker heads-up no-limit | llama3.1 | safetensors |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128k documentados por Meta | Propósito general, instrucciones | llama3.1 | safetensors, GGUF (comunidad) |

La ventaja de este repositorio frente al modelo base es exclusivamente de despliegue: menor huella de memoria y ejecución inmediata con llama.cpp. Frente a un Llama 3.1 8B Instruct genérico, la diferencia esperable está en el dominio (predicción de acciones parseable) a costa de capacidades generales, pero no hay benchmarks comparativos publicados que lo cuantifiquen.

## Limitaciones y advertencias

- Dominio muy restringido: está ajustado para póker heads-up no-limit Texas Hold'em. Su comportamiento fuera de ese ámbito no está evaluado y previsiblemente es inferior al de un modelo generalista.
- Idioma: solo se declara inglés. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Resultados no verificados: la precisión del 83,96 % y la tasa de parseo del 100 % proceden del propio autor, con `verified: false` en el model-index. No hay evaluación independiente.
- Riesgo de alucinación: en situaciones de mano poco representadas en el dataset, el modelo puede producir acciones plausibles pero estratégicamente erróneas. La alta tasa de parseo indica formato correcto, no corrección estratégica.
- No hay garantía de optimalidad tipo Nash: aunque las etiquetas incluyan «gto» y «nash-equilibrium», un ajuste supervisado sobre datos destilados es una aproximación, no una política de equilibrio demostrada.
- Procedencia opaca del entrenamiento: no se especifican el número de tokens, la composición del dataset, el solver utilizado ni las fases de alineamiento. Esto dificulta reproducir o auditar el comportamiento.
- Licencia Llama 3.1: uso comercial permitido bajo los términos de la Llama 3.1 Community License, con obligación de atribución («Built with Llama»), inclusión de la licencia y restricciones de uso aceptable. Existe una cláusula específica de licencia adicional para despliegues con más de 700 millones de usuarios mensuales.
- Consideraciones legales y éticas: el uso del modelo como ayuda en juego con dinero real puede infringir las condiciones de servicio de plataformas de póker online y estar sujeto a normativa local sobre juego. El despliegue en contextos de apuestas requiere revisión legal previa.
- Sin información sobre sesgos, evaluación de seguridad ni datos de responsabilidad por parte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/XueZhaAllen/llama31-8b-poker-mix-v1-step10k-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/jevonmao/llama31-8b-poker-mix-v1-step10k
- Dataset de entrenamiento: https://huggingface.co/datasets/jevonmao/poker-sft-mix-v1
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- No se han encontrado papers, blogs técnicos ni demos adicionales en los resultados de búsqueda web disponibles.
