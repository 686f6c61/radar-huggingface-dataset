# xixibuxixi/StatePlay-SF3-KOF98-Bidirectional-NoGTT-Step2000

## Resumen

StatePlay SF3/KOF98 Bidirectional No-GTT (Step 2000) es un checkpoint experimental de un modelo del mundo (world model) orientado a la generación de vídeo, desarrollado por el usuario xixibuxixi sobre la arquitectura StatePlay. Se trata de un ajuste fino (fine-tuning) del modelo base Wan-AI/Wan2.2-TI2V-5B, un transformer de difusión de 5.000 millones de parámetros para generación de vídeo texto-imagen-a-vídeo. El modelo predice estados latentes futuros de secuencias de videojuego de lucha, concretamente Street Fighter III y KOF98, condicionado por acciones.

El checkpoint proviene de un experimento de ablación controlado: se desactiva el tokenizador de transición (GTT) y la función de pérdida de transición (peso 0.0), manteniendo la arquitectura bidireccional del world model. El resultado es un modelo que genera fotogramas de vídeo de juegos de lucha a partir de estados latentes, sin el componente de modelado de transiciones discretas que sí tienen otras variantes de StatePlay.

Es relevante como pieza de investigación reproducible: documenta de forma explícita la configuración de entrenamiento (8 GPUs, ZeRO-2, bf16, batch global 128), el número de actualizaciones (2.000) y la pérdida final de vídeo (0.045083). No es un modelo de propósito general, sino un artefacto de ablación para estudiar el papel del GTT en world models de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StatePlay bidirectional latent-state world model (basado en Wan2.2-TI2V-5B, transformer de difusión) |
| Parámetros totales | 5.099.887.838 (1.309 tensores) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en bfloat16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`step-2000.safetensors`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Wan2.2-TI2V-5B, un transformer de difusión para generación de vídeo, y le añade la capa de world model de StatePlay, que opera sobre estados latentes bidireccionales. La variante concreta es una ablación "No-GTT": se elimina el checkpoint del tokenizador de transición (`transition_tokenizer.pt`) y se fija el peso de la pérdida de transición a `0.0`, conservando únicamente la pérdida de reconstrucción/generación de vídeo. Esto permite aislar la contribución del componente de transiciones discretas frente a la predicción puramente latente.

El entrenamiento utilizó un dataset mixto al 50/50 de fotogramas de Street Fighter III y KOF98, con 10.000 registros en caché por cada fuente (20.000 en total). Se realizaron 2.000 actualizaciones del optimizador con DeepSpeed ZeRO-2 y bfloat16 sobre 8 GPUs, batch por rango de 8 y acumulación de gradiente de 2, resultando en un batch global efectivo de 128. La pérdida final de vídeo registrada fue de 0.045083. El repositorio no incluye el estado del optimizador (directorio `state-2000/` de 79 GiB), solo el checkpoint de inferencia.

## Capacidades

- Generación de vídeo condicionada por estado latente para secuencias de juegos de lucha (Street Fighter III, KOF98).
- Predicción de estados latentes futuros en un world model bidireccional.
- Modelado de dinámica de juego a partir de fotogramas, sin tokenizador de transiciones (ablación No-GTT).
- Generación de fotogramas de vídeo a partir de entradas de imagen/texto heredadas del pipeline Wan2.2-TI2V.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- Capacidades multilingües: no aplicable (modelo de vídeo).
- No dispone de modo thinking, visión general ni audio; su dominio es exclusivamente vídeo de juegos de lucha.

## Casos de uso

- Investigación en world models: sirve como punto de comparación en ablaciones para medir el impacto de eliminar el tokenizador de transición (GTT) en la calidad de generación de estados futuros.
- Reproducción de experimentos: al documentar batch, GPUs, pasos y pérdida, permite replicar el entrenamiento con el código de StatePlay y verificar la pérdida de 0.045083.
- Generación de vídeo sintético de juegos de lucha: útil para aumentar datasets de entrenamiento de agentes de IA en entornos de fighting games con fotogramas plausibles.
- Estudio de dinámicas de juego: analizar cómo el modelo predice transiciones de estado en SF3 y KOF98 sin modelado explícito de transiciones.
- Benchmarking de arquitecturas de difusión para vídeo: comparar el rendimiento de la variante bidireccional No-GTT frente a variantes con GTT sobre el mismo dataset.
- Docencia y divulgación: ejemplo didáctico de fine-tuning de un modelo de difusión de vídeo de 5B con DeepSpeed ZeRO-2 en 8 GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida final de vídeo del entrenamiento (`0.045083`), que no es comparable con métricas estándar como FVD, PSNR o SSIM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 5.099.887.838 parámetros en bfloat16, los pesos ocupan aproximadamente 10,2 GB; el pico de memoria durante la difusión de vídeo será sustancialmente mayor por los estados latentes y el VAE.
- GPU recomendadas: el entrenamiento se realizó en 8 GPUs con DeepSpeed ZeRO-2; para inferencia se requiere al menos una GPU con memoria suficiente para el modelo más el VAE/T5 de Wan2.2 (no cuantificado en la documentación).
- Cabe en GPU de consumo: no confirmado; los 10,2 GB de pesos en bf16 podrían caber en GPUs de 24 GB (RTX 4090) solo si el pipeline de difusión y el VAE lo permiten, lo cual no está documentado.
- Opciones de despliegue: código de StatePlay (https://github.com/Jimntu/StatePlay) con la variable `STATEPLAY_CHECKPOINT` apuntando a `step-2000.safetensors`; requiere assets VAE/T5 de Wan2.2-TI2V-5B y tokenizador UMT5 de Wan2.1-T2V-1.3B. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay SF3/KOF98 Bidirectional No-GTT (Step 2000) | 5.099.887.838 | no disponible | Vídeo de juegos de lucha (SF3, KOF98) | Apache 2.0 | Hugging Face (checkpoint de ablación) |
| Wan-AI/Wan2.2-TI2V-5B (base) | ~5B | no disponible | Vídeo texto-imagen-a-vídeo general | no disponible en esta ficha | Hugging Face |
| onepiece1999/StatePlay (upstream) | no disponible | no disponible | World model StatePlay con GTT | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Es un checkpoint de ablación experimental, no un modelo de vídeo de propósito general; el propio autor lo indica explícitamente.
- Entrenado exclusivamente con fotogramas de Street Fighter III y KOF98; no generaliza a otros dominios visuales.
- No incluye el tokenizador de transición ni la pérdida de transición, por lo que carece del modelado explícito de transiciones discretas presente en otras variantes.
- El repositorio no incluye los assets VAE/T5 ni el tokenizador UMT5; hay que descargarlos por separado desde los repositorios de Wan.
- No se incluye el estado del optimizador (79 GiB), por lo que no es posible reanudar el entrenamiento exactamente desde este checkpoint.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir fotogramas incoherentes o artefactos, especialmente fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el dataset se limita a dos juegos de lucha concretos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.2-TI2V-5B puede tener condiciones propias que deben verificarse.
- Sin datos de benchmarks estándar (FVD, PSNR, SSIM), por lo que la calidad objetiva no está cuantificada.
- Idiomas: no aplicable; no es un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-SF3-KOF98-Bidirectional-NoGTT-Step2000
- Código StatePlay: https://github.com/Jimntu/StatePlay
- Modelo StatePlay upstream: https://huggingface.co/onepiece1999/StatePlay
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Tokenizador UMT5 (Wan2.1-T2V-1.3B): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
