# Squeal-Studio/squeal_ai_8m-base

## Resumen

`squeal_ai_8m-base` es un modelo de lenguaje compacto de aproximadamente 8 millones de parámetros, desarrollado por Squeal Studio y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo base, es decir, únicamente preentrenado, sin ajuste por instrucciones, orientado a la investigación y la experimentación académica. Su objetivo principal es servir como banco de pruebas para arquitecturas de transformers pequeños y como línea base para comparaciones en tareas de generación de texto en ruso.

El modelo sigue una arquitectura de decoder transformer estilo Qwen2.5 con atención por grupos (GQA), con 8 capas, un tamaño oculto de 192 y una ventana de contexto de 1.536 tokens. Fue entrenado desde cero sobre una selección de artículos de Wikipedia en ruso y el dataset OpenSubtitles (RU), con un volumen estimado de 50 a 70 millones de tokens. Su reducido tamaño lo hace ejecutable en hardware muy modesto, incluso en CPU, aunque su capacidad de generación y razonamiento es limitada por diseño.

La relevancia de este modelo reside en su utilidad como herramienta educativa y de experimentación: permite estudiar el comportamiento de modelos pequeños, probar técnicas de preentrenamiento y deduplicación de datos, y establecer líneas base para tareas sencillas en ruso. No está pensado para uso en producción ni para tareas complejas de generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen2.5 con GQA (Grouped Query Attention) |
| Parametros totales | 7.858.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.536 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer decoder con atención por grupos (GQA), siguiendo el diseño de la familia Qwen2.5. Los detalles concretos son: `hidden_size` de 192, 8 capas ocultas, 6 cabezas de atención, 3 cabezas clave-valor, tamaño intermedio de 512 y un vocabulario BPE personalizado de 24.000 tokens. La ventana de contexto máxima es de 1.536 posiciones.

El preentrenamiento se realizó desde cero sobre un corpus de texto en ruso compuesto por artículos seleccionados de Wikipedia y el dataset OpenSubtitles (RU), con un tamaño bruto de aproximadamente 350 MB y una estimación de 50 a 70 millones de tokens. El preprocesado incluyó normalización NFKC, filtrado por proporción de caracteres, agrupación en párrafos/documentos y deduplicación mediante MinHash/LSH. El entrenamiento se llevó a cabo en una GPU Tesla T4 con precisión fp16, deteniéndose en el paso 996. No se aplicaron técnicas de ajuste por instrucciones (RLHF, DPO, SFT) al ser un modelo base.

## Capacidades

- Generación de texto en ruso: produce continuaciones coherentes de secuencias cortas, aunque con limitaciones evidentes por su tamaño.
- Modelado de lenguaje básico: puede completar frases y generar texto de baja complejidad.
- Tareas de clasificación y extracción simples: al ser un modelo base, puede utilizarse como extractor de características o para fine-tuning en tareas específicas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni capacidades de agente.
- No dispone de modo de pensamiento (thinking mode), ni capacidades de visión o audio.
- Multilingüismo: únicamente ruso, sin soporte documentado para otros idiomas.

## Casos de uso

- Experimentación académica: sirve como banco de pruebas para estudiar el comportamiento de transformers de menos de 10 millones de parámetros, analizar curvas de aprendizaje y comparar arquitecturas en un entorno controlado.
- Línea base para tareas de PLN en ruso: se puede emplear como modelo de referencia para evaluar mejoras introducidas por modelos más grandes o por técnicas de fine-tuning en tareas como clasificación de sentimiento o análisis de temas.
- Pruebas de preprocesado y deduplicación de datos: al haber sido entrenado con un pipeline de limpieza específico, permite validar metodologías de preparación de corpus en ruso.
- Enseñanza de aprendizaje profundo: su pequeño tamaño permite ejecutarlo en portátiles sin GPU, facilitando demostraciones prácticas de generación de texto y fine-tuning en entornos docentes.
- Prototipado rápido de pipelines de generación: útil para verificar que una infraestructura de inferencia (por ejemplo, con HuggingFace Transformers) funciona correctamente antes de integrar modelos más grandes.
- Generación de texto corto y no crítico: puede producir frases o párrafos breves en ruso para aplicaciones de baja exigencia, como relleno de plantillas o generación de ejemplos sintéticos, siempre que se acepte su baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Dado el tamaño del modelo y su naturaleza de investigación, no se espera un rendimiento competitivo en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 16 MB en fp16 y 32 MB en fp32, por lo que cualquier GPU con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama baja como NVIDIA GTX 1650 o integradas. También es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, incluso en las más modestas.
- Opciones de despliegue: compatible con HuggingFace Transformers, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y TGI (aunque es excesivo para este tamaño).
- Latencia y throughput: al ser un modelo de 8M parámetros, la generación es prácticamente instantánea en GPU y muy rápida en CPU moderna. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de tamaño similar. Existen alternativas como SmolLM (135M-1.7B) o TinyLlama (1.1B), pero son significativamente más grandes y no comparten el mismo enfoque de entrenamiento ni el mismo idioma. Dado que no hay datos de benchmarks ni de rendimiento publicados para `squeal_ai_8m-base`, cualquier comparación sería especulativa. Se recomienda tratarlo como un modelo de investigación sin referencias directas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a comandos ni sigue formatos conversacionales; solo genera continuaciones de texto.
- Rendimiento limitado: con 8M parámetros y un corpus de entrenamiento reducido, la calidad de la generación es baja para tareas complejas o de razonamiento.
- Contexto muy corto: la ventana de 1.536 tokens limita la coherencia en textos largos y el manejo de dependencias de largo alcance.
- Idioma único: solo ruso; no hay soporte para otros idiomas.
- Riesgo de alucinación: al ser un modelo pequeño, puede producir contenido factualmente incorrecto o incoherente con mayor frecuencia que modelos grandes.
- No apto para producción: el propio autor indica que no está destinado a entornos productivos ni a tareas de alta precisión.
- Sesgos potenciales: al entrenarse sobre Wikipedia y subtítulos, puede reflejar sesgos presentes en esos corpus, aunque no se han documentado análisis específicos.
- Sin garantías de soporte: el proyecto parece experimental y no hay evidencia de mantenimiento activo o actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Squeal-Studio/squeal_ai_8m-base
- Repositorio de Squeal Studio en GitHub: https://github.com/SquealStudio/SquealStudio
