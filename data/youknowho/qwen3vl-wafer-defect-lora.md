# youknowho/qwen3vl-wafer-defect-lora

## Resumen

`youknowho/qwen3vl-wafer-defect-lora` es un ajuste fino supervisado del modelo multimodal `Qwen/Qwen3-VL-4B-Instruct` orientado a la respuesta visual a preguntas (VQA) sobre mapas de obleas de semiconductores ("wafer maps"). El autor, `youknowho`, ha fusionado el adaptador LoRA en los pesos base, por lo que se distribuye como un checkpoint completo de aproximadamente 4.440 millones de parámetros y 8,9 GB en formato safetensors, cargable directamente con `transformers` sin necesidad de `peft`.

El problema que aborda es la clasificación e interpretación de patrones de defecto en obleas (según las clases del dataset WM-811K) a partir de imágenes de baja resolución de 52x52 píxeles, un caso típico de inspección automatizada en fabricación de semiconductores. El modelo se entrenó sobre el dataset `Niraya666/WaferSAGE-Wafermap-VQA-Dataset` (15.253 filas) y declara respuestas y datos exclusivamente en inglés.

Es relevante como ejemplo práctico de especialización de un modelo visión-lenguaje de 4B mediante LoRA para un dominio vertical muy concreto, con una evaluación honesta que desglosa cuánto del rendimiento proviene de leer la imagen y cuánto del vocabulario aprendido. No obstante, sus propios autores advierten que no debe usarse para decisiones de producción: la evaluación se hizo con obleas vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) Qwen3-VL con adaptador LoRA fusionado |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible ("check the licenses of the base model and the dataset") |
| Formato de pesos | safetensors (repo de 8,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-4B-Instruct`, un transformer multimodal que procesa imágenes y texto, y le aplica un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El adaptador se fusiona posteriormente en los pesos base. El entrenamiento se realizó en bf16 con gradient checkpointing, learning rate 1e-4 con schedule coseno, 3 épocas con batch efectivo de 32 (batch 8 x grad_accum 4) y un total de 1.404 pasos sobre una NVIDIA GB10 (DGX Spark, memoria unificada).

El dataset de entrenamiento es `Niraya666/WaferSAGE-Wafermap-VQA-Dataset`, con 15.253 filas de mapas de oblea de 52x52 píxeles. La pérdida se calculó exclusivamente sobre los tokens de respuesta del asistente: el prompt, los tokens de imagen y el padding se enmascararon con `-100`. La columna objetivo fue `reference_answer`, ya que la columna `answer` contiene el literal `'placeholder'` en todas las filas. La pérdida de evaluación descendió de forma monótona en las 14 mediciones (de 1,322 en el paso 100 a 1,045 en el paso 1.400), sin señales de sobreajuste; el propio autor indica que dos épocas bastan, ya que la tercera solo aportó 0,010 de mejora.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre mapas de oblea de semiconductores: identificación de patrones de defecto (por ejemplo, clases tipo `Circle`, `Edge-Ring`, `Random`, `Normal`, `Etch` del conjunto WM-811K).
- Generación de texto descriptivo y conciso en inglés a partir de una imagen y una pregunta.
- Razonamiento multimodal básico heredado del modelo base Qwen3-VL-4B-Instruct.
- Conversación multi-turno según la plantilla de chat de Qwen3-VL.
- Soporte de tool calling y function calling: no documentado en esta ficha; depende del modelo base, no verificado por el autor.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Multilingüismo: limitado al inglés según la model card; no se ha evaluado en otros idiomas.
- Modo "thinking", visión de vídeo o audio: no documentado para este ajuste.

## Casos de uso

- Investigación en inspección visual de semiconductores: servir como punto de partida para reproducir el pipeline LoRA sobre Qwen3-VL y experimentar con datasets propios de mapas de oblea antes de escalar a modelos mayores.
- Prototipado de asistentes de análisis de defectos: un ingeniero de proceso puede subir un mapa de oblea de 52x52 y formular preguntas en lenguaje natural para obtener una descripción del patrón, útil en fase de exploración y no en control de producción.
- Generación de etiquetas asistida para anotación: usar el modelo para pre-anotar patrones de defecto en nuevos lotes de mapas y que un experto revise las propuestas, acelerando la creación de datasets etiquetados.
- Docencia y demostraciones: ejemplo didáctico de ajuste fino multimodal con LoRA sobre un modelo de 4B en hardware de gama relativamente asequible (una DGX Spark), incluyendo la metodología de evaluación.
- Comparación de estrategias de evaluación: el modelo documenta una ablación con imagen desemparejada que separa la contribución visual de la lingüística, útil como referencia metodológica en trabajos de VQA industrial.
- Integración en pipelines de investigación con `transformers`: al ser un checkpoint fusionado, se puede cargar con `AutoProcessor` y `Qwen3VLForConditionalGeneration` en bf16 con `device_map="auto"` para experimentos por lotes sobre conjuntos de mapas de oblea.
- Base para nuevos ajustes: al estar fusionado en safetensors, se puede re-ajustar con LoRA sobre datos propios de un fabricante concreto sin partir del modelo original.

## Benchmarks y rendimiento

Evaluación sobre 306 preguntas retenidas. La línea base es el mismo modelo con el adaptador desactivado, de modo que solo cambia el LoRA. La métrica es F1 de conjuntos sobre las clases de defecto WM-811K mencionadas en la respuesta de referencia, calculada con una expresión regular propia del autor (no es un benchmark estándar).

| Condición | F1 (alias amplios) | F1 (alias estrictos) |
|---|---|---|
| Modelo base | 35,3 | 23,7 |
| Ajustado, imagen desemparejada | 45,1 | 38,6 |
| Ajustado | 62,7 | 58,3 |

- Test de signos frente al modelo base: 85 victorias / 17 derrotas (p = 4,7e-12).
- Longitud mediana de respuesta: 206 caracteres en el modelo base (mínimo 2) frente a 168 en el ajustado; la referencia tiene 180 caracteres.
- Respuestas de una sola palabra (`"Circle"`, `"No."`, `"Etch"`): 6,2 % en el base, 0 % en el ajustado.
- De los 27,4 puntos de mejora, 17,6 provienen de leer la imagen (caída de F1 al desemparejar imagen y pregunta) y 9,8 del vocabulario y fraseo aprendidos del dataset.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8,9 GB para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB para imágenes y respuestas de hasta 256 tokens nuevos.
- GPU recomendadas: A100, H100, L40S o similares con 24 GB o más para inferencia cómoda; el autor entrenó en una NVIDIA GB10 (DGX Spark) con memoria unificada.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) sería necesario cuantizar, aunque el autor no documenta cuantizaciones.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `AutoProcessor` (documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados ni verificados para este checkpoint.
- Latencia y throughput: no disponibles; el autor no publica mediciones.
- Prompt de sistema: es obligatorio usar el mismo prompt de sistema que en entrenamiento ("You are a wafer defect analysis expert..."); cambiarlo degrada el formato de respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youknowho/qwen3vl-wafer-defect-lora | 4,44 B | no disponible | VQA de mapas de oblea | check (base y dataset) | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct | 4 B | no disponible en esta ficha | VQA general | no disponible en esta ficha | Hugging Face |
| Modelos VQA generalistas de 4-7 B (p. ej. familia LLaVA o Qwen2.5-VL-7B) | 4-7 B | no disponible en esta ficha | VQA general | variable | Hugging Face |

La comparación directa solo es posible con el modelo base, ya que es el único para el que el autor publica métricas: el ajuste mejora el F1 de 35,3 a 62,7 con alias amplios sobre el mismo conjunto de evaluación, a costa de un dominio mucho más estrecho.

## Limitaciones y advertencias

- Las obleas de evaluación también se vieron durante el entrenamiento: el dataset empareja 7-8 preguntas con cada una de 2.000 obleas, por lo que una partición a nivel de fila no separa obleas. Los resultados son "oblea vista, pregunta no vista" y no se ha medido el rendimiento en obleas genuinamente nuevas.
- Los valores absolutos de F1 no son una medida de capacidad: provienen de una métrica proxy con expresiones regulares escritas a mano, diseñada solo para comparar condiciones entre sí.
- 9,8 de los 27,4 puntos de mejora reflejan fraseo aprendido, no mejor discriminación visual.
- La columna `label` del dataset traza una frontera laxa entre `Normal` y `Random` (5.881 frente a 190 ocurrencias); no debe tratarse como verdad de referencia.
- El entrenamiento usó solo mapas de oblea de 52x52 píxeles; el comportamiento con imágenes reales de inspección, otras resoluciones u otros formatos no está probado.
- El autor advierte explícitamente: "Do not use this for production process decisions" y "intended for research and experimentation only".
- Licencia sin especificar: la model card remite a comprobar las licencias del modelo base y del dataset antes de cualquier uso comercial.
- Idioma limitado al inglés; no se ha evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación no cuantificado; el ajuste reduce respuestas de una sola palabra pero no se han analizado errores de clase concretos.
- Sesgos: no documentados, pero el dataset subyacente está sesgado hacia las clases más frecuentes (predominio de `Normal`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youknowho/qwen3vl-wafer-defect-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Niraya666/WaferSAGE-Wafermap-VQA-Dataset
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
