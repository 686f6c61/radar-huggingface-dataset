# xixibuxixi/StatePlay-Mixed-SF3-KOF98-5B-step2000

## Resumen

StatePlay Mixed SF3 + KOF98 5B — step 2000 es un checkpoint de investigación publicado por el usuario xixibuxixi en Hugging Face. Se trata de un modelo del mundo (world model) de tipo StatePlay, entrenado sobre un conjunto de datos mixto de trayectorias de dos videojuegos de lucha: Street Fighter III y The King of Fighters '98. El modelo parte del modelo base de difusión Wan-AI/Wan2.2-TI2V-5B y se ha ajustado mediante aprendizaje por refuerzo para predecir la evolución de estados latentes de partidas, no para generar vídeo de propósito general.

La relevancia de este checkpoint es acotada y experimental: demuestra la viabilidad de entrenar un world model latente sobre datos de juegos de lucha combinados, con un tokenizador de transiciones (GTT) entrenado desde cero sobre el mismo dataset mixto. No es un emulador de juego ni un modelo de propósito general; su interés está en la investigación sobre modelos del mundo, planificación latente y aprendizaje por refuerzo en entornos visuales.

El repositorio incluye únicamente los pesos entrenables del componente MoT/world-model y el tokenizador de transiciones. No incluye el modelo base Wan completo, el codificador T5 ni el VAE de Wan, que deben obtenerse por separado. El checkpoint corresponde a la actualización de optimizador 2.000 de la etapa 2 del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StatePlay MoT (Mixture of Tokens) sobre base de difusión Wan2.2-TI2V-5B (DiT) |
| Parámetros totales | 5.100.679.360 |
| Parámetros activos | no disponible (no se especifica si es MoE disperso) |
| Longitud de contexto | no disponible (entrenado con clips de 101 fotogramas a 832 × 480) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`transition_tokenizer.pt`) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura StatePlay/MoT, que opera como un world model latente sobre el modelo de difusión Wan2.2-TI2V-5B. El componente entrenable es el bloque DiT/world-model, mientras que el VAE, el codificador T5 y el tokenizador de texto del modelo base Wan se mantienen congelados y deben cargarse por separado. El entrenamiento se realizó en dos etapas: primero se entrenó desde cero un tokenizador de transiciones (GTT) sobre el dataset mixto SF3 + KOF98 con 16 GPUs, batch por GPU de 8 y 700 actualizaciones de optimizador; después se ajustó el MoT/world model desde el base Wan2.2-TI2V-5B usando ese GTT, con 16 GPUs, batch global de 128, learning rate de 5e-5, resolución de 832 × 480 y clips de 101 fotogramas, hasta la actualización 2.000.

El entrenamiento empleó checkpointing de gradientes y latentes de vídeo y contexto de texto en caché para reducir el coste de la tubería de entrada. No se documentan en la información disponible detalles sobre composición exacta del dataset, número total de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF/DPO más allá de la etiqueta de pipeline «reinforcement-learning» del repositorio. La innovación principal es el uso de un tokenizador de transiciones específico del dominio (GTT) entrenado conjuntamente con el world model sobre datos de dos juegos distintos, lo que permite modelar dinámicas de estado latente compartidas entre ambos títulos.

## Capacidades

- Generación de vídeo de mundo latente: predice la evolución visual de partidas de Street Fighter III y KOF98 a partir de estados y acciones, con salidas decodificadas a 97 fotogramas a 20 FPS.
- Modelado de estado latente: el componente GTT tokeniza transiciones de estado, permitiendo razonamiento sobre la dinámica del juego en espacio latente.
- Preservación de identidad visual: los ejemplos de validación conservan la identidad del juego, el layout del HUD, el fondo y la apariencia de los personajes.
- Condicionamiento por acción: el modelo acepta condicionamiento de acción (action CFG) y de texto (CFG), con valores de 1.0 en la validación publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de propósito general; el modelo está orientado a experimentos controlados de world model.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de difusión con 30 pasos de denoising, condicionamiento CFG y action CFG, y evaluación con semillas fijas para reproducibilidad.

## Casos de uso

- Investigación en world models latentes: el checkpoint sirve para reproducir y extender experimentos de StatePlay sobre dinámicas de estado en entornos visuales, usando el código oficial y el modelo base Wan2.2-TI2V-5B.
- Estudio de planificación en juegos de lucha: permite entrenar y evaluar agentes de RL que operen sobre representaciones latentes del estado del juego en lugar de píxeles crudos, con el GTT como tokenizador de transiciones.
- Evaluación comparativa de dinámicas entre juegos: al estar entrenado sobre SF3 y KOF98, facilita experimentos sobre transferencia y especialización de world models entre dos títulos con mecánicas distintas.
- Generación de trayectorias sintéticas para aumento de datos: las rollouts generadas pueden usarse como datos aumentados para entrenar clasificadores o políticas auxiliares, siempre que se validen contra la trayectoria de referencia.
- Validación visual de modelos generativos: los vídeos de comparación incluidos en `eval/` permiten inspeccionar la fidelidad visual y la divergencia de estado a lo largo de la rollout, útil para estudiar límites de horizonte largo.
- Reproducción de experimentos de RL post-entrenamiento: el repositorio incluye `training_config.json` y `release_manifest.json` con configuración e hashes, lo que facilita la reproducibilidad en entornos de investigación con múltiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La validación reportada es cualitativa: una trayectoria reservada de SF3 y otra de KOF98, con 30 pasos de denoising, CFG 1.0, action CFG 1.0 y semillas fijas, decodificando correctamente los 97 fotogramas a 20 FPS. El autor señala que la sincronización de acciones a horizonte largo y la evolución exacta del estado pueden divergir de la referencia, especialmente al final de la rollout.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5.100 millones de parámetros en el componente entrenable y la necesidad de cargar además el VAE, el codificador T5 y los shards de difusión de Wan2.2-TI2V-5B, se requiere un entorno con memoria muy superior a la del solo checkpoint; el tamaño del repo es de 10,2 GB solo para los pesos publicados.
- GPU recomendadas: el entrenamiento se realizó con 16 GPUs (modelo no especificado); para inferencia se recomienda hardware de clase A100/H100 por la carga conjunta del world model y el base Wan.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño combinado del base Wan y los componentes auxiliares, es poco probable en GPUs de consumo con menos de 24 GB, pero no se confirma en la información disponible.
- Opciones de despliegue: el autor indica usar el codebase de StatePlay (https://github.com/Jimntu/StatePlay) con el adaptador `WorldAdapter` y el modelo base Wan2.2-TI2V-5B. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusión/world model.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay Mixed SF3 + KOF98 5B (este) | 5.100.679.360 | no disponible (clips de 101 frames) | World model latente sobre Wan2.2-TI2V-5B | no disponible | Hugging Face, checkpoint de investigación |
| Wan-AI/Wan2.2-TI2V-5B (base) | ~5B | no disponible en la información | Difusión texto-imagen-vídeo | no disponible en la información | Hugging Face |
| Otros world models de videojuegos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un emulador de juego ni reproduce la trayectoria de referencia exacta bajo muestreo estocástico; la evolución del estado puede divergir, especialmente al final de la rollout.
- El checkpoint es de investigación y está pensado para experimentos controlados de world model y evaluación, no para uso en producción.
- El repositorio no incluye el modelo base Wan, el codificador T5 ni el VAE; sin esos componentes el checkpoint no es funcional por sí solo.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier uso fuera de investigación.
- Idiomas soportados no disponibles; el condicionamiento de texto depende del codificador T5 del base Wan.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre dos juegos de lucha concretos, cabe esperar un sesgo hacia las mecánicas y estilos visuales de SF3 y KOF98.
- Riesgo de alucinación visual: no cuantificado; la validación cualitativa indica preservación de identidad visual pero divergencia de estado a horizonte largo.
- Restricciones de contexto: la ventana efectiva está limitada por los clips de 101 fotogramas usados en entrenamiento; no se documenta soporte para secuencias más largas.
- Caveat de producción: los hashes y la configuración de entrenamiento están publicados, pero no hay garantías de soporte ni mantenimiento del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-5B-step2000
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Codebase StatePlay: https://github.com/Jimntu/StatePlay
