# Uniboshi/Inkling-2-Mini-Uncensored-V1-GGUF

## Resumen

Inkling-2-Mini-Uncensored-V1-GGUF es la versión cuantizada en formato GGUF del modelo Uniboshi/Inkling-2-Mini-Uncensored-V1, un modelo multimodal de tipo image-text-to-text con arquitectura Mixture of Experts (MoE) y 26.070.385.152 parámetros totales. Lo desarrolla el usuario Uniboshi y se distribuye bajo licencia Apache 2.0, aunque con acceso restringido que requiere aceptar condiciones en Hugging Face. El modelo se presenta como una variante "abliterated" y "chiraliterated" (términos de la comunidad para modelos con las capas de rechazo atenuadas o eliminadas), orientada a usos sin los filtros de seguridad habituales.

La relevancia de esta ficha radica en que combina tres características poco frecuentes en un mismo artefacto: modalidad imagen-texto, arquitectura MoE con un tamaño total de 26.000 millones de parámetros y una orientación explícitamente "uncensored". Al estar en GGUF e incluir metadatos de imatrix, está pensado para inferencia local con llama.cpp y derivados, lo que lo hace desplegable en hardware de consumo siempre que se elija una cuantización adecuada.

No se dispone de información publicada sobre el número de parámetros activos, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. La ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), multimodal image-text-to-text |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (repo con metadatos imatrix); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base en transformers/safetensors |
| Acceso | Restringido (gated): requiere aceptar condiciones |
| Tamano del repo | 57,7 GB |
| Modelo base | Uniboshi/Inkling-2-Mini-Uncensored-V1 |
| Etiquetas destacadas | moe, abliterated, chiraliterated, uncensored, imatrix, endpoints_compatible |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo con arquitectura Mixture of Experts (etiqueta `moe`) y capacidad multimodal de entrada imagen-texto (`image-text-to-text`), con 26.070 millones de parámetros totales según los safetensors del modelo base. El repositorio GGUF incluye metadatos `imatrix`, lo que indica que las cuantizaciones se generaron usando una matriz de importancia (importance matrix) para mejorar la calidad en precisiones reducidas.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, el número de expertos, el enrutamiento, la longitud de contexto nativa ni si hubo fases de RLHF, DPO o similares. Las etiquetas `abliterated` y `chiraliterated` sugieren que el modelo base fue sometido a técnicas de modificación de direcciones de activación para atenuar o eliminar el comportamiento de rechazo, pero no se especifica la metodología exacta ni el alcance de dichas modificaciones.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), lo que permite tareas de descripción, razonamiento visual y respuesta a preguntas sobre imágenes.
- Arquitectura MoE con 26.000 millones de parámetros totales, lo que en teoría permite un coste de cómputo por token inferior al de un modelo denso del mismo tamaño, aunque el número de parámetros activos no está disponible.
- Comportamiento "uncensored": el modelo base ha sido modificado para reducir los rechazos ante peticiones que un modelo alineado estándar declinaría.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Soporte de cuantización GGUF con imatrix, orientado a ejecución local en CPU/GPU mediante llama.cpp y ecosistema asociado.
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local sin filtros: al estar en GGUF y con arquitectura MoE, puede ejecutarse en estaciones de trabajo con GPU de consumo usando cuantizaciones reducidas, gestionando diálogos multi-turno sin las restricciones de rechazo de modelos alineados. Adecuado para investigación sobre comportamiento de modelos y para entornos controlados.
- Análisis de imágenes en local: gracias al pipeline image-text-to-text, permite describir, clasificar o extraer información de imágenes sin enviar datos a servicios en la nube, lo que resulta útil en entornos con requisitos de privacidad.
- Investigación sobre alineación y seguridad: la variante "abliterated" es útil como objeto de estudio para comparar respuestas frente a modelos alineados y medir el efecto de las técnicas de atenuación de rechazo.
- Prototipado de aplicaciones multimodales: la compatibilidad con endpoints y el formato GGUF permiten integrar el modelo en pipelines de prueba con llama.cpp, Ollama o servidores compatibles, evaluando latencia y calidad antes de invertir en infraestructura mayor.
- Generación de contenido creativo sin restricciones temáticas: para guionización, narrativa o ejercicios de escritura en los que se requiere explorar temas que los modelos alineados suelen declinar, siempre en un marco legal y ético adecuado.
- Evaluación comparativa de cuantizaciones: al incluir metadatos imatrix, el repo sirve para estudiar la degradación de calidad entre distintos niveles GGUF sobre un modelo MoE multimodal de 26.000 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en los 26.070 millones de parámetros totales, una cuantización a 4 bits requeriría del orden de 13-15 GB solo para los pesos, más overhead de contexto y de la torre visual; a 8 bits, en torno a 26-28 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de este tipo encajaría en A100 40/80 GB, H100 o configuraciones multi-GPU para precisiones altas.
- GPU de consumo: plausible en RTX 4090 (24 GB) con cuantizaciones de 4 bits, y en GPUs de 16 GB solo con cuantizaciones muy agresivas y contexto reducido, sujeto a verificación empírica.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; servidores compatibles con endpoints de Hugging Face; el modelo base en transformers para inferencia con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE multimodal de ~26.000 millones de parámetros en GGUF) con datos verificables de rendimiento, contexto o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo es explícitamente "uncensored" y "abliterated": no incorpora los mecanismos de rechazo habituales, por lo que puede generar contenido inapropiado, ofensivo o potencialmente dañino. No es apto para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas, agravado por la ausencia de datos publicados sobre entrenamiento y evaluación.
- No se dispone de información sobre sesgos demográficos, culturales o lingüísticos; deben asumirse los sesgos inherentes a los datos de entrenamiento, que no se documentan.
- Idiomas soportados no documentados: el rendimiento multilingüe es desconocido y no debe asumirse.
- Longitud de contexto no disponible: planificar el despliegue sin conocer la ventana nativa puede provocar degradación en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y el modelo base modificado puede acarrear implicaciones legales o de cumplimiento según la jurisdicción y el caso de uso.
- El número de parámetros activos no está documentado, lo que impide estimar con precisión el coste real de inferencia de la arquitectura MoE.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad, validación externa ni reportes de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Uniboshi/Inkling-2-Mini-Uncensored-V1-GGUF
- Modelo base: https://huggingface.co/Uniboshi/Inkling-2-Mini-Uncensored-V1
- Perfil del autor: https://huggingface.co/Uniboshi
