# WaltzZ105/nav2

## Resumen

NAV2 es un modelo de navegación visual y lingüística (VLN) desarrollado por WaltzZ105 que combina un backbone multimodal Qwen3.5-4B con cabeceras específicas de navegación. Dada una imagen RGB, una instrucción de navegación en lenguaje natural y los últimos 16 movimientos ejecutados, el modelo predice un mapa de calor de puntos de destino locales junto con una distribución de acciones de tres pasos por celda. El repositorio de Hugging Face actúa como entrega del pipeline de entrenamiento completo (código, scripts de datos y utilidades de evaluación), no como un paquete de pesos listo para usar.

El modelo se entrena mediante LoRA sobre las 32 capas del backbone Qwen3.5-4B (24 capas visuales), congelando los pesos originales de lenguaje y visión. La innovación principal es la formulación de la salida como mapa de calor más distribución condicional de acciones, lo que permite un bucle cerrado en el que el modelo selecciona el pico más alto, decodifica un bloque de acciones legales y ejecuta únicamente el primer movimiento atómico antes de volver a observar el entorno.

El proyecto está orientado a la reproducción de experimentos de VLN sobre los datasets R2R y RxR en el simulador Habitat, con un conjunto de datos de 15.502 episodios y 3.932.724 estados de entrenamiento. La relevancia actual radica en su enfoque de entrenamiento eficiente con LoRA sobre un modelo multimodal de 4B y su énfasis en la verificabilidad del pipeline (hashes, replicabilidad de secuencias de muestreo y validación de checkpoints).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B) con LoRA en 40 proyecciones de atención y cabeceras NAV2 específicas (mapa de calor y acción) |
| Parámetros totales | Aproximadamente 4B (backbone Qwen3.5-4B) más adaptadores LoRA y cabeceras; cifra exacta no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (las instrucciones de navegación del dataset R2R/RxR están en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repo entrega checkpoints `.pt` de PyTorch, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B como backbone multimodal, con 32 capas de lenguaje y 24 capas visuales. Sobre él se aplican adaptadores LoRA de rango 8 y alpha 16 en 40 proyecciones de atención, además de una proyección de entrada y las cabeceras NAV2 específicas. Los pesos originales de lenguaje y visión permanecen congelados; no se trata de un ajuste fino completo. La salida se compone de un mapa de calor de puntos de destino locales y una distribución de acciones de tres pasos por celda, supervisada con BCE para el mapa de calor (peso de clase positiva 10) y entropía cruzada con etiquetas suaves enmascaradas para las acciones.

El entrenamiento utiliza los datasets R2R y RxR con muestras de múltiples ramas ya segmentadas: 15.502 episodios y 3.932.724 estados en entrenamiento, y 797 episodios y 183.176 estados en desarrollo, con escenarios disjuntos. El presupuesto de actualizaciones es de 491.591 pasos (no una época completa), con muestreo estratificado (cada 40 muestras: 3 de avance puro, 9 de otros avances, 12 de giro a la izquierda, 12 de giro a la derecha y 4 de parada). La configuración por defecto es de 4 GPUs, batch global 8 (2 muestras por GPU), learning rate 3e-5 con warmup de 30 pasos y decaimiento coseno, AdamW con weight decay 0.01, clipping 1, BF16 en el backbone, FP32 en cabeceras y LoRA, y checkpointing de gradientes. La decodificación en bucle cerrado selecciona el pico del mapa de calor, decodifica un bloque de acciones legales y ejecuta solo el primer movimiento atómico antes de reobservar.

## Capacidades

- Predicción de mapas de calor de destino local a partir de una imagen RGB y una instrucción de navegación.
- Generación de distribuciones de acción de tres pasos condicionadas a cada celda del mapa de calor.
- Decodificación de bloques de acciones legales y ejecución secuencial de movimientos atómicos en bucle cerrado.
- Integración con los datasets R2R y RxR (instrucciones en inglés) para entrenamiento y evaluación.
- Uso de los últimos 16 movimientos ejecutados como contexto de estado.
- Entrenamiento y evaluación offline sin necesidad de simulador; evaluación en bucle cerrado con Habitat-Sim/Lab 0.2.4.
- Soporte de entrenamiento distribuido con `torchrun` en 4 GPUs y reanudación desde checkpoints completos (`resume_latest.pt`).
- No se documentan capacidades de tool calling, agentes multi-paso generales, visión más allá de la navegación, audio ni modo de razonamiento explícito.

## Casos de uso

- Navegación de robots móviles en interiores guiada por instrucciones: el modelo traduce una orden como "ve a la cocina y gira a la derecha" en un mapa de calor de destino local y una secuencia de acciones atómicas, adecuado para plataformas con reobservación frecuente.
- Evaluación de investigación en VLN sobre R2R y RxR: permite reproducir experimentos con un pipeline verificado (hashes de datos y secuencias de muestreo) y comparar curvas de pérdida offline frente a éxito en bucle cerrado.
- Prototipado de asistentes de guiado visual para personas con discapacidad visual: el modelo puede convertir instrucciones verbales en trayectorias locales sobre la imagen capturada, aunque requiere validación adicional de seguridad.
- Simulación y entrenamiento de políticas de navegación en Habitat: el repositorio incluye configuración de Habitat-Sim/Lab 0.2.4 y un panel de 640 episodios para pruebas de bucle cerrado.
- Investigación en eficiencia de ajuste fino: sirve como referencia para estudiar LoRA de rango 8 sobre un backbone multimodal de 4B con presupuesto de pasos fijo y muestreo estratificado.
- Desarrollo de sistemas de parada y giro condicionados: la supervisión específica de parada (4 de cada 40 muestras) y de giros (12+12) permite estudiar el equilibrio entre falsos positivos de parada y recall de acciones.
- Replicación de experimentos con reanudación entre configuraciones: el modo `migrate` permite continuar un checkpoint de 2 GPUs en 4 GPUs, útil en entornos con disponibilidad variable de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona métricas de evaluación offline (pérdida de mapa de calor y acción, tolerancia y acierto estricto de pico, paradas erróneas y recall de acciones) y un panel de 640 episodios para bucle cerrado, pero no se proporcionan cifras numéricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone es de 4B parámetros; en BF16 requeriría aproximadamente 8 GB solo para pesos, más memoria para activaciones y cabeceras, pero no se documenta una cifra oficial.
- GPU recomendadas para entrenamiento: 4× NVIDIA H100 (configuración de referencia validada); también se mencionan A800/A100 con CUDA 12.4.
- Entrenamiento en GPU de consumo: no documentado; el pipeline asume 4 GPUs con `torchrun` y batch global 8.
- Despliegue: el repositorio no incluye instrucciones para vLLM, llama.cpp, Ollama ni TGI; la inferencia se realiza mediante scripts propios (`tools/offline_eval.py`) y un proceso de modelo independiente para el bucle cerrado con Habitat.
- Almacenamiento: al menos 300 GB de espacio libre para datos, modelos, logs y pesos; el dataset completo ocupa aproximadamente 235 GB (33.078 archivos, 234.930.170.165 bytes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de navegación visual y lingüística ni con alternativas de tamaño similar.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos listos para usar: es una entrega de código y pipeline de entrenamiento; los pesos y el dataset se distribuyen por canales externos.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial.
- Los idiomas soportados no están documentados; las instrucciones de entrenamiento provienen de R2R y RxR, en inglés.
- El modelo está especializado en navegación VLN y no es un modelo de propósito general; no se documentan capacidades de tool calling, agentes o razonamiento general.
- La evaluación offline (acierto de pico en el mapa de calor) no equivale al éxito en bucle cerrado; el propio repositorio advierte de esta diferencia.
- La migración de 2 a 4 GPUs no reproduce bit a bit la trayectoria de optimización original; no debe presentarse como replicación exacta.
- El entrenamiento requiere acceso al dataset y al modelo base Qwen3.5-4B por canales separados; sin ellos, el pipeline no es ejecutable.
- El repositorio advierte de posibles fallos de compatibilidad CUDA/PyTorch (`no kernel image`, BF16) que deben resolverse antes de lanzar entrenamientos largos.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de navegación, los errores se manifiestan como trayectorias incorrectas o paradas erróneas.
- La versión de simulador requerida (Habitat-Sim/Lab 0.2.4, Python 3.9, NumPy 1.26.1) es específica y la instalación en máquina nueva no está validada según el propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/WaltzZ105/nav2
- Repositorio GitHub: https://github.com/WaltzZ105/nav2
- Documentación de calidad de datos: docs/DATA_QUALITY.md (en el repositorio)
- Registro de validación: docs/VALIDATION.md (en el repositorio)
- Guía de despliegue del simulador: docs/SIMULATOR.md (en el repositorio)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
