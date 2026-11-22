# Tahary/mundus-0.1-world-model

## Resumen

Mundus 0.1 es un modelo del mundo (world model) neuronal de tipo transformer causal desarrollado por el usuario Tahary y publicado en Hugging Face. No es un modelo de lenguaje: su funcion es modelar la dinamica latente de un entorno de juego arcade 2D (tipo Breakout, con pala, rebotes elasticos, destruccion de ladrillos y puntuacion) para predecir el siguiente estado visual, la recompensa y la probabilidad de fin de episodio a partir de una secuencia de acciones. Se distribuye en dos variantes: Mundus-85M (88,2 millones de parametros, 12 bloques) y Mundus-230M (232,1 millones de parametros, 18 bloques).

La arquitectura combina un tokenizador visual VQ-VAE que comprime fotogramas de 64x64x3 en una rejilla de 8x8 tokens discretos (con codebook de 2048 entradas) con un transformer causal que intercala tokens de accion con tokens visuales y usa RoPE, SwiGLU y KV-cache. El proyecto incluye ademas todo el pipeline de entrenamiento, un generador de rollouts autoregresivos en GIF y un reproductor web interactivo que transmite las predicciones del modelo a un canvas HTML5 en tiempo real.

Su relevancia es la de una implementacion educativa y autocontenida de model-based RL y simulacion de entornos mediante redes neuronales: no depende de ROMs externas, cabe en hardware modesto (1,68 GB de VRAM en la variante de 85M) y permite experimentar con imaginacion de entornos, planificacion latente y aprendizaje por refuerzo basado en modelo sin infraestructura pesada. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU y KV-cache, mas tokenizador visual VQ-VAE |
| Parametros totales | 88,2 M (Mundus-85M) / 232,1 M (Mundus-230M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica el numero de tokens de historial; cada fotograma son 64 tokens visuales mas tokens de accion) |
| Tipos de cuantizacion | no disponible (los pesos se publican como checkpoint PyTorch `.pt`; no se documentan formatos cuantizados) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; opera sobre tokens visuales y de accion) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`), no se mencionan safetensors ni GGUF |

Detalles adicionales de las dos variantes:

| Especificacion | Mundus-85M | Mundus-230M |
|---|---|---|
| Capas | 12 bloques SwiGLU | 18 bloques SwiGLU |
| Dimension oculta | 768 | 1024 |
| Cabezas de atencion | 12 (d_head = 64) | 16 (d_head = 64) |
| Dimension feed-forward | 2048 (SwiGLU) | 2752 (SwiGLU) |
| Codificacion posicional | RoPE | RoPE |
| Codebook VQ-VAE | 2048 codigos visuales discretos | 2048 codigos visuales discretos |
| Huella de hardware | 1,68 GB de VRAM (compatible con GTX 1050) | 3,52 GB de RAM (CPU multinucleo o GPU con VRAM suficiente) |

## Arquitectura y entrenamiento

El pipeline tiene tres piezas. Primero, un tokenizador VQ-VAE entrenado por separado (`train_tokenizer.py`) comprime cada fotograma de 64x64x3 en una rejilla de 8x8 tokens discretos (64 tokens por fotograma) mediante cuantizacion vectorial con paso directo y un codebook de 2048 entradas. Segundo, el motor de dinamica causal (`world_model.py`) modela la distribucion P(z_{t+1}, r_{t+1}, d_{t+1} | z_{<=t}, a_{<=t}) intercalando tokens de accion con la secuencia de tokens visuales, de modo que los fotogramas futuros quedan condicionados causalmente por las decisiones del agente. Tercero, el entorno de juego procedural (`dataset.py`) implementa fisica arcade 2D autocontenida (control de pala, rebotes elasticos, destruccion de ladrillos y recompensas por puntuacion) sin dependencias de ROMs externas.

El entrenamiento se realiza con `train.py`, que segun la model card permite lanzar, por ejemplo, 45 000 pasos en GPU con 300 episodios y batch size 2 para la variante de 85M, con checkpoints rodantes. No se documentan el numero total de tokens de entrenamiento, la composicion del dataset mas alla del entorno arcade propio, ni si se aplicaron tecnicas de RLHF/DPO (no procede en este tipo de modelo). La innovacion tecnica destacable es la intercalacion accion-token visual con KV-cache para rollouts autoregresivos en tiempo real, junto con el reproductor web que transmite las predicciones a un canvas HTML5 con telemetria de recompensa predicha, puntuacion, probabilidad de fin y latencia neuronal.

## Capacidades

- Prediccion del siguiente fotograma en un entorno arcade 2D a partir del historial visual y de acciones.
- Prediccion de recompensa escalar y de probabilidad de fin de episodio (done probability) en cada paso.
- Rollouts autoregresivos de "imaginacion" del entorno, exportables a GIF mediante `imagine.py`.
- Soporte de interaccion en tiempo real con acciones discretas (izquierda, derecha, quedarse) mediante teclado en el reproductor web y en el reproductor de escritorio con Pygame.
- Modo de conmutacion entre "alucinacion neuronal" al 100 % y simulacion de fisica real, para comparar la dinamica aprendida con la del entorno.
- Base para model-based RL: el modelo puede usarse como simulador latente para planificacion o entrenamiento de politicas.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni capacidades multilingues; su dominio esta acotado al entorno arcade descrito.

## Casos de uso

- Investigacion en model-based RL: usar el transformer como simulador latente del entorno para entrenar o evaluar politicas sin ejecutar la fisica real, aprovechando que predice recompensa y fin de episodio junto al siguiente estado.
- Experimentos docentes sobre world models: el repositorio incluye tokenizador, entrenamiento, evaluacion (`verify.py` con suite de cinco etapas) y reproductores, lo que permite reproducir el pipeline completo en una sola maquina.
- Simulacion de entornos para aumento de datos: generar trayectorias sinteticas de juego con `imagine.py` para ampliar datasets de entrenamiento de agentes.
- Demostraciones interactivas de IA generativa de videojuegos: el reproductor web permite que un usuario juegue contra el modelo neuronal y observe en directo la recompensa predicha y la latencia, util para divulgacion.
- Estudio de la degradacion de rollouts largos: comparar la fidelidad de la "alucinacion neuronal" frente a la fisica real en funcion del numero de pasos permite analizar la acumulacion de error en modelos generativos de dinamica.
- Prototipado de motores de juego neuronales: servir como punto de partida para sustituir la fisica tradicional por un modelo aprendido en prototipos de bajo coste, dado que la variante de 85M cabe en 1,68 GB de VRAM.
- Benchmark de eficiencia en hardware modesto: validar latencia de inferencia con KV-cache en GPUs de gama baja (GTX 1050) o en CPU multinucleo con la variante de 230M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de fidelidad de prediccion, recompensa acumulada ni comparaciones con otros world models.

## Requisitos de hardware

- VRAM estimada: 1,68 GB para Mundus-85M (la model card lo describe como compatible con GTX 1050); 3,52 GB de RAM para Mundus-230M en CPU multinucleo o VRAM equivalente en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para la variante de 85M; para la de 230M se sugiere una GPU con 4 GB o mas, aunque la model card menciona explicitamente CPU multinucleo como alternativa.
- Cabe en GPU de consumo: si, la variante de 85M esta pensada para GTX 1050 y similares; la de 230M deberia caber en GTX 1650, RTX 3050 o superiores (estimacion por el tamano de la huella declarada, no confirmada por el autor).
- Opciones de despliegue: el proyecto usa PyTorch 2.5+ con Python 3.11 o 3.12; el despliegue previsto es mediante los scripts propios (`web_player.py` para navegador, `desktop_player.py` para Pygame). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se publican cifras concretas; el reproductor web muestra telemetria de latencia neuronal en tiempo real, pero la model card no incluye valores medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mundus 0.1 (85M / 230M) | 88,2 M / 232,1 M | no disponible | Entorno arcade 2D autocontenido | MIT | Hugging Face y GitHub |
| DreamerV3 | no disponible en la informacion proporcionada | no aplica | World model para RL general | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| IRIS (world model con tokens discretos) | no disponible en la informacion proporcionada | no aplica | Entornos Atari | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone de datos verificados de rendimiento ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La comparacion cualitativa se limita a senalar que Mundus 0.1 es un world model de dominio especifico (arcade 2D), de escala pequena y con licencia MIT, mientras que las alternativas citadas son trabajos de investigacion de proposito general cuyos detalles no se han podido confirmar aqui.

## Limitaciones y advertencias

- Dominio muy restringido: solo modela el entorno arcade 2D incluido en el repositorio; no generaliza a otros juegos, imagenes reales ni tareas de lenguaje.
- Riesgo de alucinacion acumulativa: en rollouts autoregresivos largos, los errores de prediccion se realimentan; el propio reproductor incluye un modo de "alucinacion neuronal" que evidencia esta deriva.
- Sin datos publicados de evaluacion: no hay benchmarks de fidelidad, recompensa ni comparaciones, lo que impide valorar su calidad objetiva.
- Documentacion incompleta: la model card no especifica la longitud de contexto, el numero de tokens de entrenamiento, la composicion del dataset ni los tipos de cuantizacion.
- Licencia MIT declarada en la model card, pero el campo de licencia del repositorio de Hugging Face figura como no disponible; conviene verificar el archivo LICENSE del repositorio antes de un uso comercial.
- Proyecto con cero descargas y cero likes en Hugging Face, creado y actualizado el mismo dia: no hay evidencia de validacion por parte de la comunidad.
- No apto para produccion como servicio de inferencia estandar: no hay soporte documentado para servidores de inferencia convencionales ni formatos de pesos estandarizados (safetensors, GGUF).
- Posibles sesgos del entorno sintetico: las dinamicas aprendidas reflejan unicamente la fisica procedural del dataset propio, con las simplificaciones que esta introduce.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tahary/mundus-0.1-world-model
- Repositorio GitHub: https://github.com/tahaenasraoui-debug/mundus-world-model
- No se han encontrado en la informacion proporcionada papers, blogs, demos adicionales ni otros enlaces relevantes.
