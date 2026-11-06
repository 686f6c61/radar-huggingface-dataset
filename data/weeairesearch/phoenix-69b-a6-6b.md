# WeeAIResearch/Phoenix-69B-A6.6B

## Resumen

Phoenix-69B-A6.6B es un modelo de lenguaje experimental de tipo Mixture of Experts (MoE) publicado por WeeAI Research, un laboratorio con sede en el Reino Unido. Se deriva del modelo base Qwen/Qwen3.8-Flash-Next mediante un proceso de poda de expertos, destilación guiada por profesor y almacenamiento en precisión mixta, con el objetivo de reducir el peso en disco manteniendo la arquitectura completa de 48 capas. El resultado es un GGUF de 71,34 GB que, según el autor, recorta un 40,1% el tamaño del archivo Q4 original (119,15 GB) y un 59,4% el almacenamiento de expertos enrutados.

La nomenclatura del modelo es engañosa: la etiqueta "69B" es solo el nombre de la familia. El recuento exacto de parámetros lógicos sin contar la tabla de búsqueda es de 68,05B, con aproximadamente 6,64B de parámetros activos no pertenecientes a la lookup por token. Si se incluye la tabla de búsqueda retenida (51,20B valores, 35,20 GB), el total lógico asciende a 119,25B, y el repositorio de safetensors declara 119.914.257.280 parámetros reales.

El interés del modelo es fundamentalmente metodológico: demuestra una técnica de compresión agresiva sobre un MoE de gran tamaño y ofrece un runtime de CPU propio con parches para llama.cpp. No obstante, el propio autor lo califica de experimental y advierte que las cinco pruebas de desarrollo documentadas no establecen una calidad de código general. El modelo está pensado para inferencia local en CPU y solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 10 expertos enrutados por capa y token más experto compartido) |
| Parametros totales | 119.914.257.280 (safetensors); 119,25B lógicos incluyendo lookup; 68,05B lógicos excluyendo lookup |
| Parametros activos | ~6,64B no pertenecientes a la lookup por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (archivo publicado en Q4 con proyección compartida Q8_0 en capa 47); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (71,34 GB / 66,44 GiB); safetensors en el repo (142,7 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura MoE del Qwen3.8-Flash-Next original: 48 capas transformer con 10 expertos enrutados seleccionados por capa y token, más un experto compartido. La tabla de búsqueda (lookup table) de 51,20B valores y 35,20 GB se mantiene íntegra y se accede a ella mediante memory mapping respaldado por disco, lo que permite no cargarla completamente en RAM. El almacenamiento de expertos enrutados ocupa 32,83 GB.

El entrenamiento no es from scratch, sino un proceso de recuperación sobre el modelo base: restauración de expertos, almacenamiento en precisión mixta, recuperación temprana guiada por profesor (destilación) y una reparación selectiva final del experto compartido. La versión publicada corresponde al checkpoint Phoenix v21 más la reparación selectiva de repetición r4, que consiste en una única proyección shared-down Q8_0 de 1,74 MB en la capa 47. Según el autor, todos los bytes del GGUF fuera de ese tensor son idénticos al checkpoint v21 anterior. Las actualizaciones se proyectaron fuera de las direcciones de características de código y chat capturadas para limitar la interferencia. El autor no publica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas de chat coherentes según revisión manual del autor.
- Generación de código Python: funciones de spigot para dígitos de pi, implementación de Dijkstra, raíz cuadrada entera.
- Razonamiento algorítmico verificable: las pruebas ejecutables incluyen casos límite como aristas inválidas desconectadas, pesos cero, nodos inalcanzables, entradas de 1.000 bits y argumentos negativos.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo de razonamiento explícito no documentado; sin visión ni audio.
- Inferencia local en CPU mediante runtime propio con parche para llama.cpp.

## Casos de uso

- Evaluación de técnicas de compresión MoE: el modelo sirve como caso de estudio reproducible para investigar poda de expertos, destilación guiada por profesor y precisión mixta, ya que el autor publica prompts, respuestas sin editar, evaluaciones ejecutables, parche de runtime y sumas de verificación.
- Generación de código Python en local sin API: adecuado para entornos aislados o sin conectividad donde se requiere un modelo de gran arquitectura ejecutándose en CPU, aceptando la calidad limitada y el carácter experimental.
- Experimentación con runtimes de CPU para MoE: el runtime incluido mapea los IDs de expertos seleccionados por el enrutador a rangos de pesos y los precarga, lo que permite estudiar estrategias de prefetch y memory mapping en inferencia local.
- Reproducción de investigación: los artefactos de evaluación (report.json, prompts, respuestas y comprobaciones) permiten replicar los resultados declarados y auditar la metodología de reparación selectiva.
- Pruebas de regresión de código algorítmico: los fixtures de Dijkstra, raíz cuadrada entera y spigot de pi pueden reutilizarse como batería de verificación ejecutable para modelos de código.
- Docencia y divulgación sobre arquitecturas MoE: la separación entre parámetros lógicos, activos y de lookup, junto con el desglose de almacenamiento, facilita explicar cómo funciona un MoE de gran tamaño con presupuesto de disco reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor documenta únicamente cinco casos de desarrollo, que no constituyen un benchmark público:

| Caso de desarrollo | Resultado registrado |
|---|---|
| Función spigot de Python (prompt usado en entrenamiento) | 8/8 comprobaciones, hasta 1.000 decimales; completada de forma natural |
| Implementación de Dijkstra en Python | 66/66 comprobaciones, incluyendo aristas inválidas desconectadas, pesos cero y nodos inalcanzables |
| Raíz cuadrada entera en Python | 96/96 comprobaciones, incluyendo entradas de 1.000 bits y argumentos negativos |
| Explicación de tabla hash en tres frases | Completada de forma coherente; revisión manual superada |
| Generador alternativo de dígitos de pi en Python | Completado sin borradores repetidos, pero falló la corrección de ejecución; se alcanzó el límite de CPU |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo está diseñado para CPU; el GGUF completo ocupa 71,34 GB (66,44 GiB) en disco y la tabla de lookup de 35,20 GB se accede por memory mapping desde disco, por lo que no requiere cargarse íntegra en memoria.
- GPU recomendadas: no disponible; el autor no documenta despliegue en GPU.
- ¿Cabe en GPU de consumo? No disponible; con 71,34 GB de pesos no cabe en GPUs de consumo de 24 GB sin cuantización adicional no publicada.
- Opciones de despliegue: runtime de CPU propio incluido en el repositorio (runtime/README.md) con parche para llama.cpp; vLLM, TGI y Ollama no están documentados para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoenix-69B-A6.6B | 119,91B reales (68,05B sin lookup) | ~6,64B | no disponible | qwen-community-1.0 | GGUF, safetensors | Hugging Face, 33 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| lmstudio-community/Qwen3.8-Flash-Next-GGUF (base cuantizado) | no disponible | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos base para establecer una comparación de rendimiento. La comparación relevante es de tamaño: el GGUF de Phoenix (71,34 GB) frente al Q4 original del que deriva (119,15 GB), con una reducción del 40,1%.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor advierte que las cinco pruebas de desarrollo no establecen una calidad de código general.
- El prompt del spigot usado en la evaluación se utilizó durante el entrenamiento, por lo que su resultado no es una medida independiente.
- El generador alternativo de dígitos de pi falla la corrección de ejecución: es un fallo de código concreto y pendiente de resolver.
- Puede producir repeticiones; el autor indica que "la repetición todavía puede ocurrir".
- No se ha reestablecido la calidad de chat amplio, comportamiento multi-turno, otros lenguajes de programación ni contexto largo para estos pesos.
- Solo declara inglés; no hay soporte multilingüe documentado.
- Licencia qwen-community-1.0: es necesario revisar los términos del archivo LICENSE del repositorio antes de cualquier uso comercial, ya que la licencia se etiqueta como "other" en Hugging Face.
- Requiere el parche de llama.cpp suministrado por el autor; el despliegue con herramientas estándar no está garantizado.
- El nombre "69B" no corresponde al recuento real de parámetros (68,05B sin lookup, 119,25B con lookup), lo que puede inducir a error en la planificación de recursos.
- Riesgo de sesgos y alucinaciones: no disponible (el autor no documenta evaluaciones de sesgo ni de factualidad).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WeeAIResearch/Phoenix-69B-A6.6B
- Descarga directa del GGUF: https://huggingface.co/WeeAIResearch/Phoenix-69B-A6.6B/resolve/main/Phoenix-69B-A6.6B.gguf?download=true
- Instrucciones de compilación y ejecución: runtime/README.md (dentro del repositorio)
- Informe de evaluación: evaluation/repetition-repair-v4/report.json (dentro del repositorio)
- Prompts, respuestas y evaluaciones: evaluation/repetition-repair-v4/ (dentro del repositorio)
- Método de reparación y límites de ajuste: evaluation/repetition-repair-v4/README.md (dentro del repositorio)
- Página del autor: https://weeai.co.uk/
- Perfil del autor en Hugging Face: https://huggingface.co/WeeAIResearch
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base cuantizado: https://huggingface.co/lmstudio-community/Qwen3.8-Flash-Next-GGUF
