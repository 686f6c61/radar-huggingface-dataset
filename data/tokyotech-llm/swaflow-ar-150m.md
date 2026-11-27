# tokyotech-llm/SwaFlow-AR-150M

## Resumen

SwaFlow-AR-150M es un transformer autoregresivo de 160 millones de parámetros desarrollado por AIST y el Institute of Science Tokyo en el marco del programa japonés FRONTia. Se trata del "gemelo autoregresivo" de SwaFlow-150M, un modelo de flujo riemanniano entrenado con la misma receta, los mismos datos y en el mismo orden. Su función no es la de un modelo de producción, sino la de servir como referencia controlada para estudiar empíricamente las diferencias entre los modelos de flujo y la predicción clásica del siguiente token.

El repositorio no contiene un modelo final empaquetado para inferencia, sino los estados de entrenamiento completos (checkpoints de torchtitan en fp32 con momentos de AdamW, posición del data loader y contador de pasos) cada 40.000 millones de tokens, desde los 40B hasta los 2 billones. Esto permite reanudar el entrenamiento o cargar únicamente los pesos en cualquier punto de la curva.

La arquitectura es un transformer causal convencional de 12 capas, anchura 768, 12 cabezas y FFN de 2.048, con un vocabulario de 49.152 tokens (tokenizador de SmolLM2) y una longitud de contexto de 2.048 tokens. Los datos provienen de Dolma 3 Mix de AI2. La relevancia del proyecto es metodológica: ofrece un conjunto abierto y reproducible para comparar familias de modelos bajo condiciones idénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autoregresivo (predicción del siguiente token), sin condicionamiento temporal |
| Parametros totales | 160M (anchura 768, 12 capas, 12 cabezas, FFN 2048) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (tokenizador SmolLM2 Apache 2.0; datos ODC-By 1.0) |
| Formato de pesos | Checkpoints de torchtitan en fp32 (256 shards por estado más archivo .metadata de 2,09 GB); no se publica GGUF ni safetensors suelto |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar con atención causal y sin condicionamiento temporal, pensado como contrapartida exacta de un modelo de flujo. El entrenamiento se realizó con next-token prediction sobre Dolma 3 Mix (allenai/dolma3_mix-6T) de AI2, con los pesos de mezcla sin modificar, y con el mismo orden de datos, tamaño de lote y schedule de learning rate que el modelo de flujo SwaFlow-150M. El lote global es de 4.096 secuencias de 2.048 tokens por paso, optimizador AdamW (β = 0,9 y 0,95, weight decay 0,1), LR constante de 6e-4 tras un warmup de 2.000 pasos y recorte de gradiente de 2,5.

El entrenamiento se ejecutó en 32 nodos de 8 GPU NVIDIA H200 (256 rangos de paralelismo de datos) y los estados publicados corresponden a intervalos de 40.000 millones de tokens (4.768 pasos), desde el paso 4.768 (40B tokens) hasta el 238.400 (2,00T tokens). Cada paso equivale a 8.388.608 tokens de entrenamiento. La innovación no está en la arquitectura, sino en el diseño experimental: un recetario único compartido entre varios tamaños, estados completos a lo largo del entrenamiento, un orden de datos común y gemelos autoregresivos entrenados sobre los mismos datos para aislar el efecto del paradigma de modelado. Al reanudar con un número distinto de GPU, los pesos y momentos se reajustan y la posición del data loader se convierte al nuevo número de rangos, aunque la continuación no es bit-exacta.

## Capacidades

- Generación de texto autoregresiva básica en inglés mediante predicción del siguiente token.
- Razonamiento de escala pequeña: el autor indica que, en tareas de elección múltiple, todos los gemelos autoregresivos (incluido el de 150M) obtienen de media puntuaciones superiores al modelo de flujo final de 3B.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.
- Uso principal como referencia de investigación y como punto de partida para reanudar entrenamiento, no como modelo de aplicación.

## Casos de uso

- Estudio comparativo de paradigmas de modelado: cargar el estado final y evaluar al gemelo autoregresivo frente al modelo de flujo equivalente para medir la brecha entre ambos bajo datos y receta idénticos.
- Análisis de curvas de escalado: los estados cada 40B tokens permiten trazar la evolución de la pérdida y de métricas de elección múltiple a lo largo de 2 billones de tokens sin reentrenar.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier checkpoint con el pipeline de torchtitan y el build de datos `production_6t`, verificando nombre y checksum al cargar.
- Investigación sobre orden de datos: al compartir la secuencia de datos con el resto de la suite SwaFlow, sirve para aislar el efecto del orden frente a otras variables.
- Punto de partida para fine-tuning académico: con 160M parámetros y contexto de 2.048 tokens, es viable ajustarlo en una sola GPU para tareas de clasificación o generación acotada en inglés.
- Docencia y divulgación: un modelo pequeño, con estados intermedios y receta pública, resulta adecuado para explicar el entrenamiento de transformers a escala real.
- Base para estudiar eficiencia de entrenamiento: los checkpoints completos (pesos, momentos, schedule, posición del loader) permiten medir el coste de reanudar con distinto número de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona cualitativamente que los gemelos autoregresivos superan de media al modelo de flujo de 3B en tareas de elección múltiple, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 160M parámetros en fp32, los pesos ocupan aproximadamente 0,64 GB; en fp16 unos 0,32 GB. El estado completo con momentos de AdamW y metadatos es mucho mayor (el repositorio completo ocupa 76,1 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cargar solo los pesos; el entrenamiento original usó NVIDIA H200.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, siempre que se carguen únicamente los pesos.
- Opciones de despliegue: la carga oficial se realiza con `torchtitan.models.swaflow.hf.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SwaFlow-AR-150M | 160M | 2.048 | Apache 2.0 | Transformer autoregresivo, gemelo de un modelo de flujo | Checkpoints de entrenamiento en HF |
| SwaFlow-150M | 150M | no disponible | Apache 2.0 | Modelo de flujo riemanniano | Pesos en HF |
| SmolLM2-135M | 135M | no disponible | Apache 2.0 | Transformer autoregresivo | Pesos en HF, ampliamente soportado |

La comparación con SmolLM2-135M es pertinente porque SwaFlow-AR-150M emplea su tokenizador, pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está pensado para aplicaciones: es una herramienta de investigación.
- El texto generado por los modelos de flujo de la suite es a menudo incoherente; el gemelo autoregresivo sirve de referencia, no de solución.
- Ninguno de los modelos de la suite está alineado para evitar contenido dañino.
- Contexto limitado a 2.048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación no cuantificado, pero esperable en un modelo de 160M entrenado solo con next-token prediction.
- El repositorio contiene checkpoints de entrenamiento (fp32, 76,1 GB), no un modelo listo para inferencia; requiere el código de SwaFlow y el build de datos `production_6t` para reanudar.
- La reanudación con distinto número de GPU no es bit-exacta y los pesos divergen en los últimos bits respecto a la ejecución original.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero los datos de entrenamiento están bajo ODC-By 1.0 y deben respetarse sus condiciones de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-AR-150M
- Modelo de flujo gemelo: https://huggingface.co/tokyotech-llm/SwaFlow-150M
- Colección SwaFlow: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Código: https://github.com/swallow-llm/swaflow-suite
- Documentación de reproducción: https://github.com/swallow-llm/swaflow-suite/blob/main/docs/reproduce.md
- Dataset Dolma 3 Mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Tokenizador SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
