# x-hunter123345/skry-150m

## Resumen

Skry 150m es un paquete de detección de texto generado por IA publicado por el usuario x-hunter123345 en Hugging Face. No se trata de un modelo generativo, sino de un artefacto compuesto por tres componentes entrenados: un encoder basado en ModernBERT (identificado internamente como `runs/kaggle150m/best`), un canal esquelético (`runs/skeleton`) y una capa de fusión serializada en joblib (`runs/report/fusion.joblib`). La etiqueta de salida es binaria: 0 = humano, 1 = IA.

El modelo se enmarca en la categoría de clasificadores de texto para detección de contenido sintético, con la particularidad de incluir un componente etiquetado como "humanizer", lo que sugiere que el sistema ha sido entrenado o ajustado teniendo en cuenta intentos de evasión de detectores. El repositorio ocupa 1,5 GB e incluye pesos en safetensors, ONNX y joblib, lo que facilita su despliegue tanto en entornos Python como en runtimes de inferencia optimizados.

La relevancia del proyecto es limitada pero concreta: ofrece una alternativa abierta (licencia MIT) para tareas de moderación de contenido y verificación de autoría textual en inglés. No obstante, la documentación pública es extremadamente escasa, no hay benchmarks publicados y el número de descargas es muy bajo, por lo que debe considerarse un artefacto experimental más que un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder basado en ModernBERT con canal esquelético y capa de fusión |
| Parametros totales | 150M (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos safetensors, ONNX y joblib) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, joblib |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT (variante moderna del transformer bidireccional con atención eficiente y contexto extendido en sus versiones estándar) con un segundo canal denominado "skeleton" y una etapa de fusión implementada como artefacto joblib. Esta estructura sugiere un ensamblado de señales heterogéneas: el encoder captura representaciones semánticas del texto, el canal esquelético probablemente extrae características estructurales o estilométricas, y la fusión combina ambas para emitir la clasificación binaria humano/IA.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. El nombre del directorio del encoder (`runs/kaggle150m/best`) apunta a un entrenamiento realizado en Kaggle con un modelo de aproximadamente 150M de parámetros, pero este dato no está verificado en la documentación. La model card remite a un archivo RESULTS.md del repositorio de GitHub del proyecto para consultar resultados, sin que dichos resultados estén incluidos en la información disponible.

## Capacidades

- Clasificación binaria de texto: distingue entre texto escrito por humanos (etiqueta 0) y texto generado por IA (etiqueta 1).
- Detección de texto mixto: según la demo alojada en Hugging Face Spaces, el sistema puede indicar si un texto es "una mezcla" de ambas categorías.
- Procesamiento local: la demo indica que el análisis se realiza localmente, sin envío de datos a servidores externos.
- Soporte de múltiples formatos de despliegue: pesos en safetensors para PyTorch, ONNX para runtimes optimizados y joblib para la etapa de fusión.
- Funcionamiento exclusivamente en inglés.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Moderación de contenido en plataformas: integración del clasificador en pipelines de revisión para marcar publicaciones sospechosas de ser generadas por IA antes de su publicación o durante auditorías posteriores.
- Verificación de autoría en entornos educativos: análisis de trabajos entregados por estudiantes para detectar posible uso de asistentes generativos, con la cautela de que un clasificador binario no constituye prueba definitiva.
- Auditoría de reseñas y opiniones en comercio electrónico: filtrado de reseñas masivas generadas automáticamente para preservar la fiabilidad de las valoraciones.
- Control de calidad en medios y editoriales: revisión de borradores y artículos recibidos de colaboradores externos para asegurar que cumplen las políticas de contenido original.
- Investigación sobre detección de IA: uso del paquete como línea base reproducible en experimentos académicos sobre detección de texto sintético, gracias a su licencia MIT y a la disponibilidad de pesos en varios formatos.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente y en formato ONNX, puede integrarse en infraestructuras donde el texto no puede salir del perímetro de la organización.
- Análisis de corpus históricos: clasificación por lotes de grandes volúmenes de texto para estudiar la proporción de contenido generado por IA en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a un archivo RESULTS.md del repositorio de GitHub del proyecto, pero su contenido no está incluido en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: un encoder de 150M de parámetros en precisión FP16 requiere aproximadamente 300 MB de pesos; en FP32, unos 600 MB. La etapa de fusión en joblib añade un consumo adicional no cuantificado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es lo bastante pequeño como para ejecutarse en CPU con latencia aceptable.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: ONNX Runtime para la ruta ONNX, PyTorch para safetensors, y carga directa de joblib para la fusión. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles. Para un encoder de 150M en GPU moderna se puede esperar latencia de milisegundos por muestra, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Skry 150m | 150M (según nombre) | No disponible | Detección IA/humano | MIT | Hugging Face |
| OpenAI RoBERTa-based detector | ~125M | 512 tokens | Detección IA/humano | MIT | Hugging Face (openai-community/roberta-base-openai-detector) |
| Desklib AI-text-detector | ~125M | 512 tokens | Detección IA/humano | No disponible | Hugging Face |
| Hello-SimpleAI ChatGPT-detector | ~125M | 512 tokens | Detección IA/humano | No disponible | Hugging Face |

La comparación se limita a la categoría funcional, ya que no hay benchmarks publicados para Skry 150m que permitan contrastar su precisión frente a estas alternativas.

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica contexto máximo, composición del dataset de entrenamiento ni métricas de evaluación, lo que dificulta valorar su fiabilidad.
- Idiomas: solo se declara soporte para inglés; su uso en castellano u otros idiomas no está validado.
- Riesgo de falsos positivos y negativos: los detectores de texto IA basados en clasificadores binarios tienen tasas de error notables, especialmente con textos editados, traducidos o generados por modelos no vistos durante el entrenamiento.
- Etiqueta "humanizer": la presencia de esta etiqueta sugiere que el modelo se ha diseñado considerando técnicas de evasión, pero también puede indicar que su rendimiento se ha optimizado para un tipo concreto de texto generado, con posible degradación en otros dominios.
- Sesgos: no se documenta ningún análisis de sesgos por dominio, registro o demografía del texto.
- Uso comercial: la licencia MIT permite uso comercial, pero la ausencia de garantías y de evaluación publicada traslada al integrador toda la responsabilidad sobre el rendimiento en producción.
- Madurez: con 35 descargas y 0 likes en el momento de la consulta, el proyecto no cuenta con validación comunitaria significativa.
- Fecha de creación: el repositorio figura creado en 2026-11-03, lo que puede indicar un artefacto reciente o una fecha anómala en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/x-hunter123345/skry-150m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/x-hunter123345/skry-detector
- Repositorio del proyecto en GitHub: https://github.com/us3ph/Skry
