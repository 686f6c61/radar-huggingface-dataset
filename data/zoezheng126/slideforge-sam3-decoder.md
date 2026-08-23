# zoezheng126/slideforge-sam3-decoder

## Resumen

SlideForge SAM3 slide-component decoder es un modelo de segmentación de componentes de diapositivas, resultado de un fine-tuning selectivo del decoder de SAM3 (Segment Anything Model 3) de Meta. El autor, zoezheng126, vinculado al repositorio UIUC-MONET/SLIDEFORGE, ha congelado el backbone vision-language de SAM3 y ha entrenado únicamente el decoder con 30,4 millones de parámetros (el 3,6 % del modelo total) para descomponer diapositivas académicas en cajas delimitadoras de componentes semánticos. El modelo resuelve el problema de la edición controlada de presentaciones mediante agentes LLM, al convertir diapositivas en artefactos estructurados con una taxonomía de 306 clases de componentes de vocabulario abierto.

El entrenamiento se realizó sobre 127 decks académicos, 3 510 diapositivas y 25 132 cajas de componentes, alcanzando un IoU medio de 0,873 en una partición de validación disjunta de diapositivas. El modelo no es autónomo; requiere el checkpoint base `facebook/sam3` y el pipeline SlideForge para funcionar. Su relevancia radica en permitir la edición controlada de presentaciones como estructuras jerárquicas, un paso hacia la automatización del diseño de diapositivas con agentes de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder de SAM3 (Segment Anything Model 3) con backbone vision-language congelado |
| Parámetros totales | No disponible (solo se especifican 30,4 M de parámetros entrenables, que representan el 3,6 % del modelo total) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el modelo procesa imágenes; no se especifican idiomas para prompts de texto) |
| Licencia | sam-license (licencia específica de Meta para SAM, se debe consultar el archivo LICENSE del repositorio) |
| Formato de pesos | No disponible (el repositorio tiene un tamaño de 3,6 GB, pero no se indica el formato exacto) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `facebook/sam3` y solo ajusta el decoder, manteniendo congelado el backbone vision-language. Esta estrategia de fine-tuning parcial reduce el coste de entrenamiento y permite especializar el modelo en una tarea concreta sin perder las capacidades generales de segmentación de SAM3. El decoder se entrena para producir cajas delimitadoras de componentes de diapositivas, como títulos, imágenes, tablas o bloques de texto, dentro de una taxonomía de 306 clases de vocabulario abierto.

El conjunto de entrenamiento está formado por 127 decks académicos, que se descomponen en 3 510 diapositivas individuales y 25 132 cajas de componentes anotadas. La evaluación se realiza en un subconjunto de diapositivas no incluidas en el entrenamiento (slide-disjoint held-out split), donde se obtiene un IoU medio de 0,873. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo puramente perceptivo para segmentación.

## Capacidades

- Segmentación de componentes de diapositivas: detecta y delimita cajas para títulos, texto, imágenes, gráficos, tablas y otros elementos visuales en una diapositiva.
- Taxonomía de vocabulario abierto: soporta 306 clases de componentes, lo que permite describir elementos de diapositivas de forma flexible y extensible.
- Integración con SAM3: el decoder se usa junto con el checkpoint base de SAM3, por lo que hereda la capacidad de segmentación de objetos guiada por prompts (puntos, cajas o texto).
- Compatibilidad con el pipeline SlideForge: diseñado para funcionar con el agente LLM de SlideForge, que permite edición controlada de diapositivas como artefactos estructurados.
- Especialización en material académico: entrenado con decks académicos, lo que lo hace especialmente adecuado para el dominio de presentaciones de investigación y educación.

## Casos de uso

- Edición controlada de diapositivas: el modelo descompone una diapositiva en componentes individuales, lo que permite a un agente LLM modificar, reordenar o estilizar elementos concretos sin perder el contexto visual.
- Generación de presentaciones a partir de contenido: dado un documento o un conjunto de ideas, el modelo puede identificar y colocar componentes en una diapositiva de forma estructurada, facilitando la creación de presentaciones automáticas.
- Análisis de estructura de presentaciones: investigadores pueden extraer la composición de diapositivas (títulos, imágenes, texto) para estudiar patrones de diseño o generar resúmenes de contenido.
- Automatización de diseño de diapositivas: integrado en herramientas de diseño, puede sugerir cambios en el layout o detectar desalineaciones en los componentes.
- Indexación y búsqueda de diapositivas: al segmentar componentes, se pueden indexar presentaciones por su contenido visual y textual, permitiendo búsquedas semánticas.
- Reutilización de contenido: extraer componentes de diapositivas existentes para reutilizarlos en nuevas presentaciones, manteniendo la coherencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el IoU medio de 0,873 en el conjunto de validación disjunto de diapositivas, pero no se proporciona comparación con otros modelos de segmentación de diapositivas ni con el SAM3 original.

## Requisitos de hardware

- Depende del checkpoint base `facebook/sam3`, que es un modelo grande de visión. El decoder fine-tuneado es ligero (30,4 M de parámetros), pero el backbone congelado requiere recursos considerables.
- No se especifican requisitos de VRAM ni GPU recomendadas. Para inferencia con SAM3 completo, se necesitan GPUs con al menos 16 GB de VRAM en configuraciones típicas; el uso de cuantización puede reducir el consumo.
- Opciones de despliegue: se puede ejecutar con el pipeline de SlideForge en Python, usando PyTorch y el repositorio oficial de SAM3. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de texto.
- La latencia y el throughput dependen del hardware y del número de componentes a segmentar; no se proporcionan estimaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente para la descomposición de diapositivas. Se podría comparar con el propio SAM3 original, que segmenta objetos genéricos pero no está especializado en componentes de diapositivas, y con modelos de detección de objetos como DETR o YOLO, pero no hay datos de rendimiento comparativos en el contexto de diapositivas.

## Limitaciones y advertencias

- Licencia: el modelo usa una licencia personalizada `sam-license` de Meta. Se debe revisar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial y redistribución.
- Entrenamiento limitado a dominios académicos: los datos provienen de 127 decks académicos, lo que puede limitar la generalización a otros tipos de presentaciones (empresariales, publicitarias, etc.).
- Taxonomía limitada: aunque es de vocabulario abierto, la cobertura de componentes está basada en el conjunto de entrenamiento; clases no presentes en las diapositivas académicas pueden no detectarse correctamente.
- Dependencia del checkpoint base: el modelo no es autónomo; requiere el modelo SAM3 completo, lo que aumenta los requisitos de almacenamiento y cómputo.
- Riesgo de alucinación en componentes: como cualquier modelo de segmentación, puede generar cajas incorrectas o no detectar componentes reales en diapositivas con diseños complejos o poco comunes.
- Sin datos de robustez: no se ha evaluado el modelo en condiciones de ruido, baja resolución o diapositivas con contenido mixto de texto e imagen.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/zoezheng126/slideforge-sam3-decoder
- Repositorio SlideForge (GitHub): https://github.com/UIUC-MONET/SLIDEFORGE
- Modelo base SAM3 en Hugging Face: https://huggingface.co/facebook/sam3
- Repositorio oficial de SAM3 (GitHub): https://github.com/facebookresearch/sam3
- Página del proyecto EfficientSAM3 (mencionado en la búsqueda): https://simonzeng7108.github.io/efficientsam3/
- Paper: SlideForge: An LLM Agent for Controllable Editing of Slides as Structured Artifacts (sin enlace directo disponible)
