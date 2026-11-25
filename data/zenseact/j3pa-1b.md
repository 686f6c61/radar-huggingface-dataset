# Zenseact/j3pa-1b

## Resumen

J3PA-1B es un codificador (*encoder*) auto-supervisado de nubes de puntos LiDAR desarrollado por Zenseact, una empresa sueca de software para conducción autónoma. No es un modelo de lenguaje: su función es generar características (*features*) de propósito general para cada punto de un escaneo LiDAR, que después se reutilizan en tareas posteriores como segmentación semántica, segmentación panóptica o detección de objetos 3D, ya sea con el codificador congelado o mediante *fine-tuning*.

Con 1.015.068.931 parámetros (aproximadamente 1,01 mil millones), es el modelo de mayor tamaño de la familia J3PA, de la que también forman parte J3PA-Tiny (9,8M), J3PA-Small (42,4M) y J3PA-Large (134,6M). El resto de la familia se ha destilado a partir de este modelo. J3PA-1B se entrenó con un tamaño de vóxel de 5 cm y, a diferencia de los modelos destilados, no recibe el tamaño de vóxel como entrada.

La relevancia del modelo reside en su enfoque: un codificador de nubes de puntos preentrenado de forma auto-supervisada que produce representaciones densas por punto (hasta 4992 canales concatenando cinco etapas) y que puede servir como bloque de representación reutilizable en *pipelines* de percepción para vehículos autónomos, sin necesidad de reentrenar desde cero para cada tarea. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos LiDAR con cinco etapas de vóxeles jerárquicos (vóxeles de la etapa s de 2^s veces el tamaño base); kernels GPU personalizados |
| Parámetros totales | 1.015.068.931 (aproximadamente 1,01B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; procesa nubes de puntos de tamaño variable N) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo multimodal de nubes de puntos, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

J3PA-1B es un codificador auto-supervisado para nubes de puntos LiDAR. La entrada es un tensor float32 en GPU de forma (N, 5) por nube de puntos, con columnas `age` (segundos desde el barrido del punto hasta el barrido más reciente de la nube), `x`, `y`, `z` (metros, con x hacia delante, y a la izquierda y z hacia arriba) e `intensity` (0 a 255). El modelo voxeliza los puntos y los procesa en cinco etapas, donde los vóxeles de la etapa s son 2^s veces el tamaño de vóxel base.

La innovación técnica destacable es el uso de curvas de relleno del espacio (*space-filling curves*) para agrupar la atención: en modo de entrenamiento el modelo aleatoriza el orden de estas curvas para formar los grupos de atención, tal como se hizo durante el preentrenamiento. El modelo se entrenó con un tamaño de vóxel de 5 cm; otros tamaños de vóxel se pueden pasar en inferencia, pero constituyen extrapolación. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en un codificador de este tipo).

La salida ofrece `point_features(stages=None)`, una característica por punto de entrada en el orden original (por defecto, concatenación de las cinco etapas, de la más profunda a la más fina: 1664 + 1536 + 1024 + 512 + 256 = 4992 canales); `voxel_features(stages=None)`, las mismas características por vóxel de la primera etapa, más baratas para tareas densas; y por etapa `features[s]`, `positions[s]`, `batch_indices[s]` y `up_indices[s]`. El modelo admite lotes pasando una lista de nubes de puntos y repartiendo las características por nube con `split`.

## Capacidades

- Extracción de características densas por punto de nubes de puntos LiDAR, con hasta 4992 canales por punto.
- Extracción de características por vóxel de la primera etapa, adecuada para tareas densas de segmentación.
- Procesamiento por lotes de varias nubes de puntos simultáneamente.
- Soporte de tamaño de vóxel configurable en inferencia (0,05 m por defecto), como flotante único o como tensor con un valor por nube.
- Uso con el codificador congelado (*linear probing*) o mediante *fine-tuning* como cualquier módulo de PyTorch.
- Entrada multi-barrido: permite apilar varios barridos en una nube concatenando sus puntos con sus edades (`age`).
- Capacidades de segmentación semántica, segmentación panóptica y detección de objetos 3D como tareas posteriores (según la model card).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión RGB, tool calling ni capacidades de agentes.

## Casos de uso

- Segmentación semántica de escenas urbanas: usar las características por punto o por vóxel del codificador congelado y entrenar una cabeza ligera de clasificación por punto, aprovechando los 4992 canales de la concatenación de las cinco etapas para separar clases como vehículos, peatones, vegetación o calzada.
- Detección de objetos 3D en percepción para conducción autónoma: extraer características por vóxel de la primera etapa y alimentar un detector 3D, con la ventaja de reutilizar un codificador preentrenado de forma auto-supervisada en lugar de entrenar desde cero.
- Segmentación panóptica de escenas LiDAR: combinar las características por punto con las posiciones medias por vóxel (`positions[s]`) para agrupar instancias y clases en un único *pipeline*.
- Preentrenamiento como inicialización para dominios LiDAR específicos: partir de los pesos de J3PA-1B y hacer *fine-tuning* con datos propios de un sensor o una ciudad concreta, aprovechando que el modelo se entrena como cualquier módulo de PyTorch.
- Destilación a modelos más pequeños: usar J3PA-1B como profesor para generar características y entrenar codificadores más ligeros (como los de la propia familia J3PA-Tiny/Small/Large) para despliegue en vehículo con recursos limitados.
- Procesamiento de nubes multi-barrido: apilar varios barridos LiDAR con su columna `age` para que el modelo capture información temporal y mejore la densidad efectiva de la nube en tareas de percepción.
- Investigación en representaciones auto-supervisadas de nubes de puntos: emplear el modelo como *baseline* congelado en evaluaciones de *linear probing* sobre las cinco etapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación de *linear probing* sobre las características concatenadas de las cinco etapas, pero no proporciona cifras. El artículo (arXiv) y el repositorio de código están anunciados como "coming soon" y no están disponibles en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,1 GB, lo que sugiere pesos en float32 de aproximadamente 4 GB para los 1,01B de parámetros; la memoria adicional depende del número de puntos por nube y de las activaciones intermedias de las cinco etapas.
- GPU recomendadas: el modelo requiere CUDA (la entrada debe ser un tensor float32 en GPU) y ejecuta kernels GPU personalizados incluidos en el repositorio; se recomiendan GPU con suficiente memoria para el tamaño de nube objetivo (A100, H100, RTX 4090 o superiores).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8-16 GB o más para nubes de tamaño moderado, aunque no se dispone de cifras oficiales de memoria por nube.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True, revision="v1.0")`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| J3PA-1B (Zenseact) | 1,01B | Nubes de puntos LiDAR (N, 5); vóxel base 5 cm | Apache 2.0 | Hugging Face |
| J3PA-Large (Zenseact) | 134,6M | Nubes de puntos LiDAR; acepta tamaño de vóxel como entrada | Apache 2.0 | Hugging Face |
| J3PA-Small (Zenseact) | 42,4M | Nubes de puntos LiDAR; acepta tamaño de vóxel como entrada | Apache 2.0 | Hugging Face |
| J3PA-Tiny (Zenseact) | 9,8M | Nubes de puntos LiDAR; acepta tamaño de vóxel como entrada | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Los tres modelos menores se destilaron a partir de J3PA-1B y, a diferencia de este, toman el tamaño de vóxel como entrada.

## Limitaciones y advertencias

- Modelo especializado en nubes de puntos LiDAR: no procesa texto, imágenes RGB ni audio, y no debe evaluarse con métricas de modelos de lenguaje.
- Entrenado únicamente con un tamaño de vóxel de 5 cm; otros tamaños de vóxel funcionan pero constituyen extrapolación, según advierte el propio autor.
- Requiere `trust_remote_code=True` y ejecuta kernels GPU personalizados incluidos en el repositorio, lo que implica revisar el código antes de usarlo en producción.
- La entrada debe ser un tensor float32 en CUDA; no se documenta soporte para CPU.
- La intensidad debe estar en el rango 0-255 (multiplicar por 255 las intensidades de sensores en 0-1).
- No se han publicado resultados de benchmarks ni el artículo arXiv en la información disponible, lo que impide validar el rendimiento frente a alternativas.
- Riesgo de sesgo ligado a los datos de entrenamiento (no documentados): el rendimiento puede degradarse en sensores, geografías o condiciones meteorológicas distintas de las del preentrenamiento.
- Riesgo de alucinación no aplicable en el sentido de modelos generativos, pero sí de características poco fiables en regiones con poca densidad de puntos o fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar las dependencias de los kernels personalizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zenseact/j3pa-1b
- J3PA-Tiny: https://huggingface.co/Zenseact/j3pa-tiny
- J3PA-Small: https://huggingface.co/Zenseact/j3pa-small
- J3PA-Large: https://huggingface.co/Zenseact/j3pa-large
- Artículo (arXiv): anunciado como "coming soon", no disponible
- Código (GitHub): anunciado como "coming soon", no disponible
- Licencia: https://huggingface.co/Zenseact/j3pa-1b/blob/main/LICENSE
