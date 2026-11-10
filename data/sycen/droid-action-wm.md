# syCen/droid-action-wm

## Resumen

DROID action-wm es un modelo de mundo (world model) condicionado por acciones, desarrollado por el usuario syCen, que parte del modelo de generación de vídeo Wan2.2-TI2V-5B y se ha afinado completamente sobre el conjunto de datos robótico DROID 1.0.1. El modelo resuelve el problema de predecir la evolución visual de una escena robótica: dado un fotograma de una cámara exterior y una secuencia de acciones del efector final, genera los fotogramas futuros correspondientes. Es relevante para investigación en robótica porque permite simular y evaluar políticas sin ejecutarlas en hardware real.

Arquitectura y tamaño: hereda la arquitectura de difusión transformer (DiT) de Wan2.2-TI2V-5B, con unos 5.000 millones de parámetros, a la que se añade un codificador de acciones. El contexto de entrada es una imagen más 16 acciones delta a 5 Hz, y la salida son 16 fotogramas futuros a 640x480. El repositorio ocupa 10 GB e incluye los pesos completos en bf16.

Se distribuye bajo licencia Apache 2.0 y está orientado a la evaluación de políticas robóticas mediante predicción visual, no a la generación de texto ni a tareas de lenguaje. La información disponible sobre idiomas, cuantizaciones y benchmarks externos es muy limitada; los únicos datos de rendimiento publicados son métricas de reconstrucción visual sobre escenas no vistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión transformer (DiT) de Wan2.2-TI2V-5B con codificador de acciones añadido |
| Parámetros totales | ~5.000 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1 imagen de entrada + 16 acciones delta (5 Hz); salida de 16 fotogramas |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo visual/robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Resolución de salida | 640x480 |
| Pipeline | robotics |
| Tamaño del repositorio | 10,0 GB |

## Arquitectura y entrenamiento

El modelo se basa en Wan2.2-TI2V-5B, un transformer de difusión para generación de vídeo a partir de imagen y texto, al que se ha realizado un fine-tuning completo (todos los pesos del DiT y del codificador de acciones, en bf16). La innovación principal es la incorporación de un codificador de acciones que condiciona la generación de vídeo: las 16 acciones delta del efector final, muestreadas a 5 Hz, se codifican y se inyectan en el proceso de difusión para que los fotogramas predichos reflejen el efecto de dichas acciones sobre la escena.

El entrenamiento se realizó sobre el conjunto DROID 1.0.1, utilizando únicamente las cámaras exteriores. El checkpoint publicado corresponde al paso 64.730. El repositorio incluye el fichero `action_stats_full_interp.json`, necesario para la normalización de acciones, y clips de ejemplo de escenas no vistas con valores de PSNR de referencia para comprobaciones de sanidad. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, aunque por la naturaleza del modelo (predicción visual) es improbable que se usaran.

## Capacidades

- Predicción visual condicionada por acciones: genera 16 fotogramas futuros a 640x480 a partir de una imagen exterior y 16 acciones delta del efector final a 5 Hz.
- Modelado de dinámica robótica: aprende la relación entre las acciones del efector final y los cambios visuales en la escena.
- Evaluación de políticas: permite simular la ejecución de una política robótica y comparar la predicción visual con la realidad mediante métricas como PSNR, SSIM y LPIPS.
- Generación de vídeo de escenas robóticas: hereda la capacidad de síntesis de vídeo del modelo base Wan2.2-TI2V-5B, adaptada al dominio DROID.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se ha documentado capacidad de visión general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Evaluación de políticas robóticas sin hardware: el modelo predice los fotogramas futuros que produciría una política de control; comparando la predicción con la ejecución real en el robot se obtiene una métrica objetiva (PSNR, SSIM, LPIPS) del comportamiento esperado antes de desplegar en el robot físico.
- Simulación de trayectorias del efector final: dado un plan de 16 acciones delta a 5 Hz, el modelo genera el vídeo resultante para inspeccionar visualmente si la trayectoria produce colisiones o movimientos no deseados.
- Generación de datos sintéticos para entrenamiento: los fotogramas predichos pueden utilizarse como augmentación o como datos adicionales para entrenar políticas, especialmente en escenas donde la recogida real es costosa.
- Depuración de controladores: comparar la predicción del modelo con la observación real permite identificar discrepancias que revelan errores en la calibración de las acciones o en la dinámica del robot.
- Investigación en modelos de mundo: sirve como base para estudiar la calidad de la predicción visual condicionada por acciones y para comparar arquitecturas de world models en robótica.
- Validación de escenas no vistas: los clips de ejemplo incluidos permiten comprobar la generalización del modelo a escenas no presentes en el entrenamiento antes de integrarlo en un pipeline mayor.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de precisión sobre escenas no vistas, calculadas sobre los 16 fotogramas predichos:

| Métrica | Valor |
|---|---|
| PSNR | 22,61 |
| SSIM (7x7, RGB) | 0,859 |
| LPIPS | 0,082 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros world models.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~5.000 millones de parámetros en bf16, los pesos ocupan aproximadamente 10 GB; con activaciones y buffers de difusión para vídeo a 640x480, se estima un consumo de VRAM de 16 a 24 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en bf16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16; en GPUs con menos VRAM sería necesario cuantizar, aunque no se han publicado pesos cuantizados.
- Opciones de despliegue: no se ha documentado soporte específico para vLLM, llama.cpp, Ollama o TGI; al ser un modelo de difusión para vídeo, el despliegue habitual sería mediante scripts de PyTorch o Diffusers, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Wan2.2-TI2V-5B es una alternativa directa, pero sin condicionamiento por acciones. Otros world models robóticos podrían ser comparables, pero no se han incluido datos en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syCen/droid-action-wm | ~5.000 M | 1 imagen + 16 acciones | PSNR 22,61 / SSIM 0,859 / LPIPS 0,082 | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | ~5.000 M | no disponible | no disponible | no disponible | Hugging Face |
| Otros world models | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado exclusivamente con cámaras exteriores de DROID 1.0.1, por lo que puede no generalizar a otras cámaras, entornos o configuraciones robóticas.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir fotogramas plausibles pero incorrectos, especialmente en escenas o acciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto: la entrada se limita a una imagen y 16 acciones; no admite contextos más largos ni entradas multimodales adicionales.
- Limitaciones de idioma: no aplica, al no ser un modelo lingüístico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Wan2.2-TI2V-5B y del dataset DROID 1.0.1.
- Caveat para producción: el modelo es un world model para evaluación e investigación, no un controlador robótico; su uso en producción requiere validación adicional y no se han publicado pruebas de robustez ni de latencia en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/syCen/droid-action-wm
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio GitHub (mencionado en la model card, sin URL concreta en la información disponible): no disponible
- Paper: no disponible
- Blog: no disponible
- Demo: no disponible
