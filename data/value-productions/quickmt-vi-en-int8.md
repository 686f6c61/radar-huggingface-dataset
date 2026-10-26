# value-productions/quickmt-vi-en-int8

## Resumen

quickmt-vi-en-int8 es una conversión a CTranslate2 con pesos int8 del modelo de traducción automática quickmt/quickmt-vi-en, desarrollado por quickmt y redistribuido por value-productions para su uso en la aplicación Yaku Translate. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo modelo base, recuantizado y reempaquetado en el formato binario que consume CTranslate2, la librería de inferencia de código abierto especializada en traducción.

El modelo resuelve un problema muy concreto: la traducción de vietnamita a inglés en entornos donde no hay GPU o donde el presupuesto de memoria y latencia es ajustado. Al aplicar cuantización int8 por filas a cada peso bidimensional, el repositorio completo ocupa 0,2 GB, lo que permite ejecutar la traducción en CPU convencional o en GPUs de gama baja, algo relevante para aplicaciones de escritorio, móviles o servidores sin acelerador.

La relevancia actual del artefacto es de tipo práctico, no investigador: demuestra una ruta de publicación reproducible (conversión, verificación de equivalencia con el original en float16 y publicación con licencia CC BY 4.0) para un modelo de traducción de dominio general. La model card no aporta datos sobre arquitectura interna, número de parámetros, contexto máximo ni volumen de entrenamiento, por lo que las especificaciones técnicas quedan en gran parte como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de traducción neuronal del base quickmt/quickmt-vi-en; el autor no especifica la arquitectura en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (cuantización por filas de cada peso 2D, mismo esquema que la cuantización ModelSpec de CTranslate2); el original está en float16 |
| Idiomas soportados | Vietnamita (origen) → inglés (destino). Direccional, un solo par de idiomas |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), vocabularios `source_vocabulary.json` y `target_vocabulary.json`, tokenizadores SentencePiece `src.spm.model` y `tgt.spm.model` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Los artefactos publicados (un binario CTranslate2, dos vocabularios y dos modelos SentencePiece, uno para origen y otro para destino) son compatibles con un sistema de traducción neuronal encoder-decoder con tokenización por subpalabras independiente para cada idioma, pero el autor no confirma ni el tipo de transformer, ni el número de capas, ni la dimensión de los embeddings. Tampoco se indica el contexto máximo en tokens ni si el modelo usa atención completa o variantes lineales.

Respecto al entrenamiento, la model card no aporta ningún dato: no se especifica el volumen de tokens, la composición del corpus, si hubo filtrado de calidad, destilación, fine-tuning sobre el modelo base ni optimización con RLHF o DPO. Lo único documentado es el proceso de conversión: cuantización int8 por filas de cada peso bidimensional, con el mismo esquema que aplica CTranslate2 en su ModelSpec, realizada el 26.10.2026, y una verificación de equivalencia funcional que el autor describe como salida idéntica carácter por carácter al original en float16 sobre las frases comprobadas. Esa comprobación es cualitativa y no se acompaña del conjunto de evaluación ni de métricas BLEU, chrF o COMET.

## Capacidades

- Traducción de texto de vietnamita a inglés, en la dirección única vi→en.
- Tokenización SentencePiece independiente para origen y destino, con vocabularios publicados en formato JSON.
- Inferencia en CPU y GPU mediante CTranslate2, con soporte de cuantización int8 y aceleración por oneDNN/MKL en x86.
- Integración en aplicaciones de escritorio y móviles: es el formato que consume la aplicación Yaku Translate.
- Procesamiento por lotes (batched translation) gracias al motor CTranslate2, apto para pipelines de grandes volúmenes.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking. Es un modelo estrictamente de traducción.
- Capacidad multilingüe: limitada al par vi→en; no se ha publicado soporte para otras combinaciones ni para detección automática de idioma.

## Casos de uso

- Traducción por lotes de documentación técnica: el modelo puede procesar corpus vietnamitas completos y convertirlos a inglés con un pipeline CTranslate2 en CPU, sin depender de GPU ni de APIs externas, lo que abarata el coste por millón de caracteres.
- Localización de productos digitales: interfaces, páginas web y textos de marketing en vietnamita se pueden traducir a inglés como paso previo a la revisión humana, aprovechando el tamaño reducido del modelo (0,2 GB) para integrarlo en el propio CMS.
- Aplicaciones de traducción offline: al caber en memoria de un portátil o un dispositivo con recursos limitados, encaja en apps de escritorio o móviles que deben funcionar sin conexión, como el propio caso de Yaku Translate.
- Atención al cliente en comercio electrónico: traducción de mensajes y correos de clientes vietnamitas a inglés para que un equipo no vietnamita pueda responder, con despliegue en el backend mediante el servidor integrado de CTranslate2.
- Preparación de datos para entrenamiento: traducción de corpus vietnamitas a inglés para construir datasets paralelos o datasets de instrucciones en inglés, con la ventaja de que la licencia CC BY 4.0 permite uso comercial con atribución.
- Análisis de opiniones y moderación de contenido: traducción previa de reseñas y comentarios en vietnamita a inglés antes de pasarlos por clasificadores o modelos de análisis de sentimiento entrenados en inglés.
- Subtitulado y transcripción: traducción de transcripciones vietnamitas a inglés en pipelines de vídeo, donde el bajo consumo de VRAM permite coexistir con el modelo de reconocimiento de voz en la misma máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que la salida sobre las frases comprobadas es idéntica carácter por carácter a la del modelo original en float16; no se indican métricas BLEU, chrF, COMET, METEOR ni el conjunto de evaluación empleado, ni comparaciones con otros sistemas vi→en.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras oficiales. El repositorio completo ocupa 0,2 GB, por lo que los pesos en int8 ocupan una fracción de esa cifra y el modelo es ejecutable con muy poca memoria dedicada.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de megabytes libres es suficiente a nivel de memoria; no se han publicado mediciones en A100, H100, RTX 4090 ni otras tarjetas, así que no se puede justificar una recomendación basada en rendimiento medido.
- GPU consumer: sí cabe en GPUs de gama baja y en iGPUs con soporte de CTranslate2; el cuello de botella esperado es la latencia, no la memoria.
- CPU: es el escenario natural del artefacto. CTranslate2 con int8 y oneDNN/MKL permite inferencia en x86 sin GPU; también hay soporte para ARM.
- Opciones de despliegue: CTranslate2 (API de Python, API de C++ y servidor integrado). No es compatible con vLLM, TGI, llama.cpp ni Ollama, porque el formato `model.bin` es específico de CTranslate2; para usar esos motores habría que reconvertir desde el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, frases por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| value-productions/quickmt-vi-en-int8 | No disponible | No disponible | vi→en | CC BY 4.0 | CTranslate2 int8 | Objeto de esta ficha; 0,2 GB de repo |
| quickmt/quickmt-vi-en | No disponible | No disponible | vi→en | CC BY 4.0 | No disponible (float16, según la card) | Modelo base; misma salida declarada sobre las frases comprobadas |
| Otros sistemas vi→en de código abierto (por ejemplo, familia Helsinki-NLP opus-mt o VietAI) | No disponible en la información proporcionada | No disponible | vi→en | No verificada | No verificado | No se han podido contrastar especificaciones ni métricas con la información disponible |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de las alternativas, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Modelo direccional: solo traduce de vietnamita a inglés; no admite la dirección inversa ni otros pares de idiomas.
- Sin datos de entrenamiento publicados: no se puede evaluar la composición del corpus, la cobertura dialectal del vietnamita ni el dominio de especialización, lo que impide anticipar sesgos.
- Riesgo de alucinación y de errores de fidelidad: como cualquier sistema de traducción neuronal, puede omitir, duplicar o inventar contenido, especialmente en frases largas, nombres propios, siglas o texto con formato.
- La cuantización int8 puede degradar la calidad fuera del conjunto de frases comprobado por el autor; la equivalencia declarada con float16 es empírica y no está cuantificada con métricas.
- El contexto máximo es desconocido: no se debe asumir que el modelo maneja documentos largos en una sola pasada; es previsible que trabaje a nivel de frase o párrafo corto.
- Licencia CC BY 4.0: permite uso comercial y modificaciones, pero exige atribución al autor original (quickmt) y a esta redistribución, e indicar si se han hecho cambios. No hay cláusula de patentes ni garantías.
- Trazabilidad: el artefacto es una reconversión, no un modelo validado de forma independiente; las descargas y likes son cero y no consta revisión externa.
- Compatibilidad limitada: al estar en formato CTranslate2, no se puede cargar directamente en frameworks como Transformers, vLLM o TGI sin reconvertir desde el modelo base.
- Idiomas no declarados en los metadatos de HuggingFace: la información de idiomas del repositorio aparece como no disponible y el par vi→en se deduce de la model card y del nombre del modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/value-productions/quickmt-vi-en-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-vi-en
- CTranslate2 (motor de inferencia): https://github.com/OpenNMT/CTranslate2
- SentencePiece (tokenizador): https://github.com/google/sentencepiece
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a entradas de diccionarios inglés-francés sobre la palabra "value" y no guardan relación con este artefacto.
