# stdlogits/drowse-web-gemma3-270m-instruments

## Resumen

`stdlogits/drowse-web-gemma3-270m-instruments` es un modelo publicado en HuggingFace por el usuario stdlogits, aparentemente derivado de Gemma 3 en su variante de 270 millones de parámetros. El nombre sugiere un ajuste fino orientado a un dominio concreto ("instruments", instrumentos) dentro de un contexto denominado "drowse-web", lo que apunta a un uso especializado más que a un modelo de propósito general. El repositorio ocupa 0,1 GB, un tamaño coherente con pesos cuantizados o con un fine-tune de un modelo base pequeño.

La información pública disponible es muy limitada: la model card no incluye pipeline declarado, licencia, idiomas soportados ni descripción de la arquitectura o del proceso de entrenamiento. No se han publicado resultados de benchmarks ni detalles sobre el dataset utilizado. Cualquier evaluación rigurosa requiere inspeccionar los archivos del repositorio (configuración, tokenizador y pesos) directamente.

A pesar de la escasez de metadatos, el modelo resulta relevante por dos motivos: se apoya en la familia Gemma 3, con arquitectura y tokenizador conocidos, y su tamaño de 270M permite inferencia en hardware muy modesto, lo que lo hace candidato para tareas de clasificación, extracción o generación acotada en entornos con recursos limitados. La ficha siguiente refleja únicamente lo verificable y marca explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 3 270M; detalles del fine-tune no disponibles) |
| Parametros totales | 270M (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,1 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se presenta como un derivado de Gemma 3 270M, un transformer decoder-only de la familia Gemma 3 de Google. La variante de 270M de Gemma 3 emplea atención con ventana deslizante local y atención global intercalada, tokenizador SentencePiece con vocabulario amplio y está diseñada para despliegue en dispositivos con recursos limitados. Sin embargo, la model card del repositorio no confirma estos detalles ni especifica si el fine-tune modificó la configuración arquitectónica.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas de alineación. El sufijo "instruments" y el prefijo "drowse-web" sugieren un ajuste sobre un corpus específico relacionado con instrumentos, pero no se documenta su naturaleza, tamaño ni procedencia. Tampoco se indican innovaciones técnicas adicionales como decodificación especulativa o modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Gemma 3 270M.
- Capacidad de ajuste a un dominio específico ("instruments"), aunque el alcance exacto no está documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño de 270M limita seriamente esta capacidad en el modelo base.
- Capacidades multilingües: no disponibles; el modelo base Gemma 3 es multilingüe, pero el fine-tune puede haber reducido esa cobertura.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la variante 270M de Gemma 3 no incluye visión en su configuración estándar, pero no se confirma en este repositorio.

## Casos de uso

- Extracción de campos estructurados en textos de dominio acotado: con 270M de parámetros, el modelo puede ajustarse para identificar entidades o atributos de instrumentos en documentos, siempre que el fine-tune haya cubierto ese vocabulario.
- Clasificación de textos cortos: el tamaño reducido permite procesar lotes grandes en CPU o GPU de gama baja, adecuado para etiquetado de tickets o mensajes.
- Generación de descripciones breves: útil para completar fichas de producto o resúmenes de una o dos frases donde no se requiere razonamiento profundo.
- Prototipado rápido de asistentes especializados: sirve como baseline antes de escalar a modelos mayores, con coste de inferencia mínimo.
- Despliegue en el borde (edge): 270M parámetros caben en dispositivos con pocos GB de memoria, lo que permite ejecución local en navegador o en hardware embebido si los pesos están en formato adecuado.
- Filtrado y preprocesado en pipelines de datos: puede usarse como clasificador auxiliar para enrutar consultas antes de llamar a un modelo mayor.
- Evaluación de técnicas de fine-tune: al ser un modelo pequeño derivado de una familia conocida, resulta útil como banco de pruebas para experimentos de ajuste y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 0,54 GB solo para pesos (270M × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 0,27 GB, y en 4 bits, en torno a 0,14 GB. Estas cifras son estimaciones basadas en el número de parámetros, no en mediciones publicadas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar el modelo; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son viables si los pesos están en formatos compatibles (GGUF o safetensors); no se confirma qué formatos incluye el repositorio.
- Latencia y throughput estimados: no disponibles; para 270M en una GPU moderna se espera un throughput alto (cientos o miles de tokens por segundo), pero no hay mediciones publicadas para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| stdlogits/drowse-web-gemma3-270m-instruments | 270M (según nombre) | no disponible | no disponible | HuggingFace, 0 descargas |
| google/gemma-3-270m | 270M | no disponible en esta ficha | Gemma Terms of Use | HuggingFace, ampliamente disponible |
| Qwen2.5-0.5B | 500M | 32K (según documentación pública de Qwen) | Apache 2.0 | HuggingFace |
| SmolLM2-360M | 360M | 8K (según documentación pública de SmolLM2) | Apache 2.0 | HuggingFace |

La comparación con el modelo base Gemma 3 270M es la más directa, pero no se dispone de datos de rendimiento del fine-tune para establecer diferencias cuantitativas. Frente a Qwen2.5-0.5B y SmolLM2-360M, el modelo de stdlogits ofrece un tamaño menor y, presumiblemente, especialización de dominio, a costa de una licencia y documentación desconocidas.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, licencia, idiomas ni limitaciones, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; además, al derivar de Gemma 3, podrían aplicar los términos de uso de Gemma, no reflejados en el repositorio.
- Riesgo de alucinación: inherente a los modelos generativos; en un modelo de 270M el riesgo es mayor en tareas de razonamiento o conocimiento factual.
- Capacidad limitada por tamaño: 270M parámetros restringen el razonamiento multi-paso, las matemáticas complejas y el seguimiento de instrucciones largas.
- Cobertura idiomática incierta: el fine-tune puede haber degradado el multilingüismo del modelo base.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad en ninguna tarea.
- Repositorio con 0 descargas y 1 like: sin validación por parte de la comunidad; posible modelo experimental o abandonado.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad y procedencia de los archivos antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stdlogits/drowse-web-gemma3-270m-instruments
- Modelo base Gemma 3 (referencia): https://huggingface.co/google/gemma-3-270m
- Documentación de Gemma 3 (Google): https://ai.google.dev/gemma/docs
- Repositorio de Gemma en GitHub: https://github.com/google-deepmind/gemma
