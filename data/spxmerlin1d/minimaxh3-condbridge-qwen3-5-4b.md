# SpXMerlin1D/MiniMaxH3-CondBridge-Qwen3.5-4B

## Resumen

CondBridge es un adaptador de 1.144B parámetros desarrollado por SpXMerlin1D que destila la interfaz de condicionamiento textual del modelo de generación de vídeo MiniMax-H3. El MiniMax-H3 original utiliza un codificador de texto de 33B parámetros (con `condition_proj` y un `token_refiner` de dos capas) para inyectar las instrucciones en el DiT (Diffusion Transformer). CondBridge sustituye ese codificador pesado por un adaptador ligero que consume las representaciones ocultas de un modelo Qwen3.5-4B (estudiante) y las transforma en el espacio de inyección esperado por el DiT, reduciendo drásticamente los requisitos de memoria y cómputo para ejecutar generación de vídeo localmente.

El adaptador fue entrenado en dos etapas con 10.027 prompts sintéticos generados a partir de combinaciones de elementos de una plantilla de nueve habilidades (sujeto, acción, escena, cámara, iluminación, estilo, etc.). Su arquitectura combina una proyección de origen, un embedding de consulta basado en el tokenizador H3, una atención cruzada de 32 cabezas y un `token_refiner` que replica la estructura del codificador profesor. Los resultados de evaluación sobre 1.002 prompts fuera del conjunto de entrenamiento muestran una similitud coseno de 0,9229 a nivel de token, lo que indica una alta fidelidad en la reproducción del espacio de embeddings del profesor.

La relevancia de este proyecto radica en que permite ejecutar el pipeline completo de MiniMax-H3 (incluido el DiT) en hardware más asequible, ya que el codificador de 33B era el principal cuello de botella. El adaptador se distribuye como un repositorio con código de carga y pesos en formato safetensors, y se integra con ComfyUI mediante un nodo específico (`MiniMaxH3AdapterLoader`). Está pensado para investigación y uso local, y la licencia no está especificada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador con proyección lineal, embedding de consulta, atención cruzada (32 cabezas) y token refiner de 2 bloques pre-norm |
| Parametros totales | 1.144B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el adaptador procesa secuencias de tokens del tokenizador H3, sin límite declarado) |
| Tipos de cuantizacion | No disponible (los pesos se cargan en bf16 según el código de ejemplo) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador `H3Adapter` se compone de cuatro módulos principales: `source_projection` (13.8M parámetros) que proyecta las representaciones ocultas del estudiante Qwen3.5-4B (dimensión 2560) a la dimensión del espacio de inyección (5376); `query_embedding` (40.3M) que convierte los IDs de tokens del tokenizador H3 (vocabulario de 151.643) en consultas de dimensión 5376; `cross_attention` (319M) con 32 cabezas, normalización QK y puerta tanh, que actúa como resamplador entre las consultas y los valores proyectados del estudiante; y `token_refiner` (751M) con dos bloques pre-norm y una normalización RMS final que replica la estructura del refiner del profesor.

El entrenamiento se realizó en dos etapas sobre una GPU de 32GB en bf16. La primera etapa (4 horas, 18.874 pasos) entrenó el cuerpo del adaptador con el refiner congelado, alcanzando una similitud coseno de 0,8856. La segunda etapa (1,5 horas, 4.135 pasos) ajustó todos los parámetros con una tasa de aprendizaje reducida para el refiner (×0,1), logrando un coseno de 0,9229. Se utilizó el optimizador Muon para pesos 2D y AdamW8bit para pesos 1D, con programación WSD y una función de pérdida compuesta: `huber×1.0 + cos×0.8 + infonce×0.05 + sp×0.1 + mag×0.1 + stat×0.0002`, con un aumento gradual (curriculum) en los términos contrastivos. La escala se alineó mediante normalización RMS del objetivo (`pn = normalize(pred) × target_norm`).

Los datos de entrenamiento consistieron en 10.027 prompts únicos generados a partir de combinaciones cartesianas de un pool de elementos de nueve habilidades (sujetos, acciones, escenas, cámara, iluminación, estilos, etc.), con deduplicación en el espacio de características y agrupación por longitud (corto, medio, largo). Cada ejemplo contenía los IDs de tokens H3, las representaciones ocultas del Qwen3.5-4B y el objetivo del profesor (salida de `condition_proj` + `token_refiner`).

## Capacidades

- Generación de vídeo condicionada por texto: el adaptador reemplaza el codificador de texto de 33B de MiniMax-H3, permitiendo que el DiT consuma directamente las representaciones de salida.
- Destilación de interfaz: convierte las representaciones ocultas de un modelo ligero (Qwen3.5-4B) en el espacio de inyección exacto del profesor, sin necesidad de ejecutar el modelo grande.
- Integración con ComfyUI: se puede cargar mediante el nodo `MiniMaxH3AdapterLoader` y conectarse al nodo oficial `MiniMaxH3ImageToVideo`, exponiéndose como un CLIP tipado por pato.
- Soporte bilingüe: funciona con prompts en inglés y chino, según los idiomas del tokenizador H3.
- No incluye capacidades de razonamiento general, tool calling ni agentes; es un adaptador especializado exclusivamente en la tarea de condicionamiento de texto para vídeo.

## Casos de uso

- Generación de vídeo local en hardware asequible: el adaptador permite sustituir el codificador de 33B por un modelo de 4B más un adaptador de 1.14B, reduciendo la VRAM necesaria para ejecutar el pipeline completo de MiniMax-H3 en una GPU de consumo (por ejemplo, RTX 4090 con 24GB).
- Prototipado rápido de prompts de vídeo: investigadores y creadores pueden iterar sobre prompts en inglés o chino sin necesidad de acceder a servidores con GPUs de alta gama, ya que la inferencia del adaptador es ligera.
- Investigación en destilación de interfaces: el proyecto sirve como caso de estudio para técnicas de destilación de representaciones entre modelos de distinto tamaño, con una metodología documentada (pérdida compuesta, curriculum, alineación de norma).
- Integración en flujos de ComfyUI: los usuarios de ComfyUI pueden incorporar el adaptador en sus grafos de generación de vídeo, combinándolo con el DiT de MiniMax-H3 y el modelo Qwen3.5-4B como estudiante.
- Evaluación de fidelidad de embeddings: dado que el adaptador produce representaciones en el espacio del profesor, puede usarse para comparar la calidad de distintos estudiantes (por ejemplo, otros modelos de 4B) en la tarea de condicionamiento de vídeo.
- Despliegue en entornos con restricciones de memoria: al reducir el tamaño del codificador de texto de 33B a 1.14B, el adaptador facilita la ejecución en servidores con GPUs de menor capacidad (por ejemplo, A10 o RTX 3090) manteniendo la compatibilidad con el DiT original.

## Benchmarks y rendimiento

Los resultados de evaluación sobre 1.002 prompts fuera del conjunto de entrenamiento son los siguientes:

| Metrica | Valor |
|---|---|
| Similitud coseno (nivel token) | 0,9229 |
| Error cuadrático medio (MSE) | 0,8162 |
| Ratio de norma (predicción/objetivo) | 1,013 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el adaptador no es un modelo de lenguaje general, sino un componente específico para condicionamiento de vídeo. La métrica principal es la fidelidad de las representaciones generadas respecto al profesor, que se reporta como similitud coseno y MSE.

## Requisitos de hardware

- El adaptador en sí tiene 1.144B parámetros y se carga en bf16, lo que requiere aproximadamente 2.3GB de VRAM (el tamaño del repositorio es 2.3GB, incluyendo pesos y código).
- El modelo estudiante Qwen3.5-4B necesita aproximadamente 8-9GB de VRAM en bf16 (no se especifica cuantización, pero es un modelo de 4B).
- El DiT de MiniMax-H3 es un componente grande (no se detalla su tamaño en la información disponible), por lo que la VRAM total del pipeline dependerá de su requisito. El entrenamiento se realizó en una GPU de 32GB, lo que sugiere que la inferencia completa puede caber en GPUs de 24GB o más.
- GPUs recomendadas: RTX 4090 (24GB), A100 (40GB o 80GB), H100 (80GB). En GPUs de consumo con 16GB podría ser ajustado dependiendo del DiT.
- Opciones de despliegue: el código de ejemplo utiliza PyTorch con carga de safetensors. Para ComfyUI, se usa el nodo `MiniMaxH3AdapterLoader`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que el adaptador no es un LLM estándar.
- Latencia y throughput: no disponibles en la información proporcionada. Se estima que la inferencia del adaptador es rápida (menos de 1 segundo en GPU moderna) dado su tamaño, pero la latencia total estará dominada por el DiT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 (codificador original) | 33B | No especificado | Referencia (profesor) | No especificada | Repositorio MiniMaxAI/MiniMax-H3 |
| CondBridge (este adaptador) | 1.144B | No especificado | Coseno 0,9229 vs profesor | No disponible | Repositorio SpXMerlin1D/MiniMaxH3-CondBridge-Qwen3.5-4B |
| Otros adaptadores de destilación para vídeo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado adaptadores directamente comparables en la información disponible. La comparación más relevante es contra el codificador original de 33B, que CondBridge reemplaza con una reducción de tamaño de aproximadamente 29× (de 33B a 1.14B) manteniendo una alta similitud coseno (0,9229). No obstante, la fidelidad está limitada por el estudiante Qwen3.5-4B, que puede no capturar matices de prompts complejos o cinematográficos de múltiples tomas.

## Limitaciones y advertencias

- Fidelidad limitada por el estudiante: la calidad de las representaciones generadas depende de las capacidades del Qwen3.5-4B. Prompts complejos, multi-toma o cinematográficos pueden desviarse del comportamiento del profesor de 33B.
- Entrenamiento en prompts sintéticos: el adaptador se entrenó exclusivamente con combinaciones generadas a partir de una plantilla de nueve habilidades, no con distribuciones de captions reales. Esto puede afectar su rendimiento con descripciones naturales o fuera de distribución.
- Licencia no especificada: la licencia del adaptador no está disponible en la información proporcionada. Se recomienda verificar los términos de servicio de MiniMax-H3 antes de cualquier uso comercial o de producción.
- Uso de investigación: el autor indica que el proyecto está destinado a investigación y uso local. No se garantiza su idoneidad para entornos de producción sin validación adicional.
- Dependencia de componentes externos: el adaptador requiere el tokenizador H3, el modelo Qwen3.5-4B y el DiT de MiniMax-H3. La ausencia de cualquiera de estos componentes impide su funcionamiento.
- Riesgo de alucinación en el estudiante: aunque el adaptador en sí no genera texto, el Qwen3.5-4B puede producir representaciones ocultas que no reflejen fielmente el prompt, especialmente en idiomas o dominios no cubiertos por su entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SpXMerlin1D/MiniMaxH3-CondBridge-Qwen3.5-4B
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Nodo ComfyUI mencionado (ComfyUI-MiniMaxH3-Adapter): no se ha encontrado una URL directa en la información disponible.
- Código de entrenamiento: el autor indica que se publicará próximamente ("Training Code to be released soon"), sin enlace disponible.
