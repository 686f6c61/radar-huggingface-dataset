# Tonimono/Mojika

## Resumen

Mojika (文字禍) es un modelo generativo de imágenes especializado en la síntesis de kanjis japoneses en escala de grises a resolución de 256×256 píxeles. Lo desarrolla Tonimono y se distribuye bajo licencia MIT. El modelo resuelve un problema muy concreto: generar imágenes de caracteres kanji a partir de descripciones textuales, imágenes de referencia o trazos dibujados a mano, lo que lo hace útil para tareas de tipografía generativa, aumentación de datos de OCR o exploración creativa de caligrafía.

Técnicamente se trata de un modelo de flow matching con 134.399.488 parámetros (aproximadamente 134 millones), entrenado sobre un vocabulario de 13.697 caracteres durante 200.000 pasos, seguidos de un decaimiento coseno de 50.000 pasos adicionales. El repositorio ocupa 0,5 GB y los pesos se distribuyen en formato PyTorch (`weights.pt`), no en safetensors ni GGUF.

Su relevancia es acotada pero específica: no es un modelo de propósito general, sino una herramienta de nicho para la comunidad japonesa de generación de caracteres. La combinación de condicionamiento multimodal (texto, imagen y sketch) con flow matching lo sitúa en una categoría poco poblada de modelos generativos centrados en escritura CJK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (modelo generativo por transporte de probabilidad) |
| Parametros totales | 134.399.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`weights.pt`) con `config`, `model_state_dict` y `conditioner_state_dict` |

## Arquitectura y entrenamiento

Mojika es un modelo de flow matching, una familia de modelos generativos que aprenden un campo vectorial de transporte entre una distribución simple (habitualmente gaussiana) y la distribución de datos, resolviendo una EDO durante la inferencia. A diferencia de los modelos de difusión clásicos, el flow matching formula el entrenamiento como una regresión sobre trayectorias rectas, lo que en la práctica suele permitir muestreo con menos pasos. El modelo genera imágenes de kanji en escala de grises de 256×256 píxeles.

El entrenamiento se realizó sobre un conjunto de 13.697 caracteres kanji, con 200.000 pasos de entrenamiento seguidos de 50.000 pasos de decaimiento coseno del learning rate. El checkpoint distribuido contiene un `conditioner_state_dict` separado, lo que indica que el condicionamiento (texto, imagen o sketch) se procesa mediante un módulo independiente del backbone generativo. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos de imagen). El autor remite al repositorio de GitHub para los detalles de entrenamiento y despliegue.

## Capacidades

- Generación de imágenes de kanji en escala de grises a 256×256 píxeles.
- Condicionamiento por texto: descripciones en japonés que guían la generación del carácter.
- Condicionamiento por imagen: uso de una imagen de referencia como guía.
- Condicionamiento por sketch: trazos dibujados a mano como entrada para generar el carácter final.
- Cobertura de 13.697 caracteres kanji distintos.
- Integración con Sarashina 2.2 0.5B (modelo de lenguaje) y CLIP japonés (line-corporation/clip-japanese-base) en el pipeline de demostración.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües más allá del japonés.

## Casos de uso

- Aumentación de datos para OCR de kanji: generar variantes sintéticas de caracteres con distintas fuentes implícitas para ampliar datasets de entrenamiento de reconocedores ópticos de caracteres japoneses, aprovechando el condicionamiento por texto e imagen.
- Exploración tipográfica y caligráfica: generar propuestas de formas de kanji a partir de descripciones textuales o sketches, útil para diseñadores que buscan referencias antes de digitalizar una tipografía.
- Búsqueda de caracteres por descripción: dado que acepta texto como condición, puede integrarse en una interfaz donde el usuario describe un carácter y el modelo propone representaciones candidatas.
- Reconstrucción a partir de trazos: el condicionamiento por sketch permite convertir bocetos manuales en imágenes de kanji completas, útil en herramientas de aprendizaje de escritura japonesa.
- Prototipado de fuentes para videojuegos o material editorial: generar muestras de glifos en 256×256 para iterar sobre estilos antes de encargar el diseño final.
- Investigación en generación de escritura CJK: servir como baseline reproducible (MIT, pesos abiertos) para comparar métodos de flow matching frente a difusión en dominios de glifos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~134 M de parámetros; en bfloat16 los pesos ocupan aproximadamente 0,27 GB, por lo que el consumo total con activaciones y los modelos auxiliares (Sarashina 0.5B y CLIP japonés base) se sitúa previsiblemente por debajo de 4 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA y bfloat16; la demo oficial requiere CUDA y bfloat16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060 y superiores), aunque el dato no está confirmado por el autor.
- Opciones de despliegue: inferencia directa con PyTorch; el autor remite al repositorio de GitHub para el código de la demo web. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mojika | 134 M | 256×256, escala de grises | Generacion de kanji condicionada (texto, imagen, sketch) | MIT | HuggingFace, PyTorch |
| Modelos de difusion de glifos CJK | no disponible | no disponible | Generacion de caracteres | variable | no disponible |
| Modelos generativos de imagen generalistas (p. ej. SD) | cientos de millones a miles de millones | 512×512 o superior | Generacion de imagen general | variable | amplia |

No se dispone de información sobre modelos directamente comparables en la misma categoría (generación de kanji con flow matching) en la información proporcionada. La comparativa con modelos de difusión de glifos o con generadores de imagen generalistas queda como referencia cualitativa, no como comparación de rendimiento medida.

## Limitaciones y advertencias

- Modelo de nicho: solo genera kanjis japoneses en escala de grises a 256×256; no es un generador de imágenes de propósito general.
- Cobertura limitada al vocabulario de 13.697 caracteres entrenados; caracteres fuera de ese conjunto probablemente no se generen correctamente.
- Solo idioma japonés: las condiciones textuales deben formularse en japonés.
- Riesgo de alucinación visual: puede producir glifos con trazos incorrectos o inventados, especialmente en caracteres poco frecuentes o complejos.
- No se documentan sesgos específicos, pero al derivarse de un dataset de kanjis puede reflejar sesgos de estilo o de frecuencia de uso de ciertos caracteres.
- Licencia MIT: permite uso comercial, pero los modelos auxiliares necesarios para la demo (Sarashina 2.2 0.5B y CLIP japonés) tienen sus propias licencias, que deben verificarse por separado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta evaluar su idoneidad en producción.
- Formato de pesos propietario de PyTorch (`weights.pt`) sin conversión documentada a safetensors o GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tonimono/Mojika
- Repositorio de código, entrenamiento y demo: https://github.com/mili-inch/Mojika
- Modelo auxiliar Sarashina 2.2 0.5B: https://huggingface.co/sbintuitions/sarashina2.2-0.5b
- Modelo auxiliar CLIP japonés: https://huggingface.co/line-corporation/clip-japanese-base
