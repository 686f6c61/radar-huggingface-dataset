# terminusresearch/minimax-music3-identity-tournament

## Resumen

El modelo `terminusresearch/minimax-music3-identity-tournament` es un adaptador LoRA de evaluación construido sobre el modelo base MiniMaxAI/MiniMax-Music3, un modelo de generación de música de código abierto desarrollado por MiniMax. Este LoRA no es un modelo de generación independiente, sino un experimento controlado para comparar la identidad vocal de dos cantantes (Serj Tankian y Daron Malakian de System of a Down) bajo diferentes estrategias de entrenamiento: ventanas aleatorias de 128 frames frente a ventanas de continuación, manteniendo fijos el split del dataset, la regularización instrumental, el optimizador, los prompts, la semilla de inferencia y el barrido de fuerza del LoRA.

El objetivo es evaluar cómo afecta la estrategia de ventana de entrenamiento a la fidelidad de la identidad del cantante y a la calidad de la generación. El repositorio enlaza 640 renders en formato FLAC alojados en cuatro repositorios fuente, sin duplicar el audio. Es un trabajo de investigación aplicada sobre fine-tuning de modelos de audio con LoRA, relevante para quienes trabajan en clonación de voz, control de identidad vocal y generación musical condicionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-Music3 (arquitectura de lenguaje de música, no detallada) |
| Parametros totales | no disponible (LoRA de dimensiones no publicadas) |
| Parametros activos | no disponible (MoE no especificado) |
| Longitud de contexto | no disponible (ventana de entrenamiento: 128 frames; duracion maxima de render: 40 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no especificado) |
| Modelo base | MiniMaxAI/MiniMax-Music3 |

## Arquitectura y entrenamiento

El adaptador se entrena sobre MiniMax-Music3, un modelo de generación de música basado en arquitectura de lenguaje (language-model LoRA) que produce canciones completas de hasta cinco minutos condicionadas por letras y descripciones musicales detalladas. El entrenamiento de este LoRA utiliza SimpleTuner como framework, con optimizador AdamW (tasa de aprendizaje 2e-5), batch size 4, y 5000 pasos de entrenamiento. Se aplica una regularización instrumental con un 50% de datos emparejados con el cantante.

Se definen cuatro "legs" de entrenamiento: Serj con ventana aleatoria, Daron con ventana aleatoria, Serj con ventana de continuación y Daron con ventana de continuación. La ventana de entrenamiento es de 128 frames (aleatoria o de continuación hacia un objetivo de 128 frames). La inferencia usa 30 pasos de flujo, CFG de flujo 1.7, semilla 20260824 y duración máxima de 40 segundos.

## Capacidades

- Generación de música condicionada por descripción textual y letras (via modelo base MiniMax-Music3).
- Control de identidad vocal: el LoRA busca imitar la voz de Serj Tankian o Daron Malakian.
- Comparación de estrategias de ventana de entrenamiento (aleatoria vs. continuación) para evaluar la fidelidad de la identidad vocal.
- Regularización instrumental para evitar colapso en la generación.
- Generación con fuerza de LoRA variable (barrido de 0.25 en los renders mostrados).
- Capacidad de evaluar la evolución de la identidad a lo largo de los checkpoints (500 a 5000 pasos).
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de audio).

## Casos de uso

- Investigación en clonación de voz y control de identidad: permite estudiar cómo la estrategia de ventana de entrenamiento afecta a la fidelidad vocal, útil para laboratorios que desarrollan técnicas de fine-tuning de modelos de audio.
- Evaluación de checkpoints en fine-tuning de LoRA: los 10 checkpoints por leg permiten analizar la evolución de la calidad y la identidad a lo largo del entrenamiento, útil para decidir puntos de parada óptimos.
- Comparación de regularización instrumental: la inclusión de 50% de regularización con instrumental emparejado permite estudiar su efecto en la estabilidad del entrenamiento y la calidad final.
- Generación de demos para investigación de interacción humano-IA: los renders FLAC pueden usarse para estudios de percepción de identidad vocal en música generada.
- Pruebas de generalización fuera de género: el prompt de prueba "Alternative pop-jazz" (fuera del género de rock de SOAD) evalúa si la identidad del cantante se transfiere a contextos musicales no entrenados.
- Reproducción de experimentos de fine-tuning: el diseño controlado (misma semilla, prompts, optimizador, split) permite reproducir y comparar configuraciones de entrenamiento en otros modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye renders de audio comparativos, pero no métricas numéricas de calidad o fidelidad.

## Requisitos de hardware

- Inferencia: al ser un LoRA sobre MiniMax-Music3, los requisitos dependen del modelo base. MiniMax-Music3 requiere GPU con al menos 16-24 GB de VRAM para inferencia en FP16 (no se especifican requisitos exactos en la información disponible).
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o superior para generar renders de 40 segundos con 30 pasos de flujo.
- No cabe en GPUs consumer de gama baja (8 GB) por el tamaño del modelo base.
- Despliegue: no se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.) para este LoRA; el modelo base se usa con el pipeline de text-to-audio de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información no proporciona comparaciones con otros modelos de LoRA o de generación musical. El modelo base MiniMax-Music3 se compara en su propia documentación con otros generadores de música (como MusicGen o Stable Audio), pero no hay datos concretos aquí.

## Limitaciones y advertencias

- Modelo de investigación: es un LoRA de evaluación, no un modelo listo para producción. No está pensado para uso comercial directo.
- Sin métricas cuantitativas: no hay benchmarks objetivos (MOS, SIM, etc.) que respalden las afirmaciones de fidelidad vocal.
- Limitado a dos cantantes: la identidad se limita a Serj Tankian y Daron Malakian; no generaliza a otras voces.
- Duración máxima de generación de 40 segundos en los renders, aunque el modelo base soporta hasta 5 minutos.
- Riesgo de alucinación musical: como todo modelo generativo, puede producir artefactos o desviaciones de la identidad vocal en contextos fuera del género entrenado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base MiniMax-Music3 puede tener términos adicionales no detallados aquí.
- No hay información sobre sesgos (género, raza, idioma) en el modelo base o en el LoRA.
- Los renders no se almacenan en este repositorio, sino en cuatro repositorios externos, lo que complica la reproducibilidad si esos enlaces se rompen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/terminusresearch/minimax-music3-identity-tournament
- Modelo base MiniMax-Music3: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- GitHub MiniMax-Music3: https://github.com/MiniMax-AI/MiniMax-Music3
- Demo de MiniMax Music 3: https://minimax-ai.github.io/music3-demo/
- Guía independiente de MiniMax Music 3: https://minimaxmusic3.ai/
- Repositorios de entrenamiento:
  - Serj random window: https://huggingface.co/MiniMaxMusicTraining/soad-mm3-nextlat-xm-serj-randwin128-20260824-5k-adamw2e-5-bsz4-singersplit-reginst
  - Daron random window: https://huggingface.co/MiniMaxMusicTraining/soad-mm3-nextlat-xm-daron-randwin128-20260824-5k-adamw2e-5-bsz4-singersplit-reginst
  - Serj continuation: https://huggingface.co/MiniMaxMusicTraining/soad-mm3-serj-cont128-reginst-replicate
  - Daron continuation: https://huggingface.co/MiniMaxMusicTraining/soad-mm3-daron-cont128-reginst-replicate
- Manifest comparativo: https://huggingface.co/terminusresearch/minimax-music3-identity-tournament/blob/main/tournament.json
