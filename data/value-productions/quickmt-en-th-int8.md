# value-productions/quickmt-en-th-int8

## Resumen

quickmt-en-th-int8 es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática quickmt/quickmt-en-th, desarrollado por value-productions para su uso en la aplicación Yaku Translate. El modelo original, obra de quickmt y publicado bajo licencia CC BY 4.0, cubre la dirección de traducción inglés a tailandés. Esta versión no introduce cambios arquitectónicos ni nuevos datos de entrenamiento: se limita a recodificar los pesos en formato int8 para reducir el tamaño del repositorio (0,2 GB) y acelerar la inferencia en CPU mediante la librería CTranslate2.

La relevancia de esta ficha reside en su carácter práctico: es un artefacto de despliegue, no un modelo de investigación. Resulta útil para quien necesite traducción inglés-tailandés en entornos con recursos limitados, sin GPU, o dentro de una aplicación de escritorio o móvil. La model card del autor afirma que la salida sobre las frases comprobadas coincide carácter por carácter con la del original en float16, lo que sugiere una degradación mínima por la cuantización.

No se dispone de información pública sobre la arquitectura interna del modelo base (número de parámetros, tipo de transformer, composición del corpus de entrenamiento) más allá de que emplea tokenizadores SentencePiece independientes para origen y destino. Cualquier dato no confirmado se marca como no disponible en las secciones siguientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción; pesos en formato CTranslate2) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (cuantización por filas de cada peso 2-D, esquema ModelSpec de CTranslate2) |
| Idiomas soportados | inglés y tailandés (dirección en→th) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin), con vocabularios JSON y modelos SentencePiece (src.spm.model, tgt.spm.model) |

## Arquitectura y entrenamiento

El artefacto aquí descrito es una conversión, no un entrenamiento. El modelo base quickmt/quickmt-en-th se distribuye en formato original (presumiblemente safetensors o similar) y value-productions lo ha recodificado con CTranslate2 aplicando cuantización int8 por filas a cada matriz de pesos bidimensional, siguiendo el esquema de cuantización de ModelSpec de CTranslate2. El repositorio resultante contiene model.bin, config.json, source_vocabulary.json, target_vocabulary.json, src.spm.model y tgt.spm.model, lo que confirma el uso de SentencePiece para la tokenización de origen y destino.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas del modelo base. La model card del conversor únicamente documenta el proceso de cuantización y la fecha de conversión (26.10.2026). La afirmación de equivalencia carácter por carácter con el original float16 sobre las frases comprobadas es el único indicador de calidad publicado.

## Capacidades

- Traducción automática de inglés a tailandés, en modo texto.
- Tokenización mediante SentencePiece con vocabularios separados para origen y destino.
- Inferencia optimizada para CPU gracias a CTranslate2 con pesos int8.
- Integración directa en la aplicación Yaku Translate (según la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a la pareja inglés-tailandés; no se documentan otros pares.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio o móviles: el tamaño reducido (0,2 GB) y la inferencia int8 en CPU permiten empaquetar el modelo dentro de una app sin depender de servicios en la nube, como hace Yaku Translate.
- Traducción por lotes de documentación técnica: se puede usar con la API de CTranslate2 para procesar ficheros de texto o subtítulos en inglés y generar versiones en tailandés en servidores sin GPU.
- Preprocesado multilingüe en pipelines de NLP: traducir contenido en inglés a tailandés antes de análisis de sentimiento, indexación o búsqueda en corpus tailandeses.
- Atención al cliente en mercados tailandeses: traducción de respuestas plantilla o mensajes de soporte del inglés al tailandés en sistemas con requisitos de baja latencia y sin acelerador hardware.
- Localización de interfaces y contenidos: traducción de cadenas de UI, textos de ayuda o descripciones de producto en flujos de CI/CD que ejecutan CTranslate2 en contenedores ligeros.
- Traducción offline en entornos con conectividad limitada: al no requerir GPU ni servicios externos, encaja en dispositivos de borde o instalaciones aisladas.
- Prototipado rápido de sistemas de traducción: sirve como línea base para comparar con modelos de mayor tamaño antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica cualitativa es la afirmación del autor de que la salida sobre las frases comprobadas coincide carácter por carácter con la del modelo original en float16.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; en GPU, el modelo ocupa aproximadamente 0,2 GB en int8, por lo que cabría en cualquier GPU con al menos 1 GB de memoria libre, aunque CTranslate2 está optimizado para CPU.
- GPU recomendadas: no se especifican; el formato CTranslate2 con int8 está pensado para ejecución en CPU. Para GPU se podría usar CTranslate2 con soporte CUDA, pero no hay datos de rendimiento publicados.
- GPU de consumo: sí, cualquier GPU moderna con más de 1 GB de VRAM podría alojarlo, aunque el beneficio frente a CPU es incierto sin datos.
- Opciones de despliegue: CTranslate2 (librería nativa, Python, o servidor), integración en aplicaciones mediante la API de CTranslate2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| quickmt-en-th-int8 (este) | no disponible | no disponible | en→th | CC BY 4.0 | CTranslate2 int8 |
| quickmt/quickmt-en-th (base) | no disponible | no disponible | en→th | CC BY 4.0 | original (no especificado) |
| Otros modelos de traducción en→th | no disponible | no disponible | en→th | variable | variable |

No se dispone de información sobre modelos comparables de la misma categoría (traducción inglés-tailandés) en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo cubre la dirección inglés→tailandés; no se documenta la dirección inversa ni otros pares.
- No hay información sobre sesgos del modelo base; al ser un sistema de traducción, puede reproducir sesgos presentes en sus datos de entrenamiento, especialmente en género, formalidad o terminología cultural.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) no representados en el corpus de entrenamiento.
- La cuantización int8 puede degradar la calidad en frases no comprobadas, aunque el autor afirma equivalencia en las frases verificadas; no se han publicado evaluaciones exhaustivas.
- Licencia CC BY 4.0: permite uso comercial y modificaciones con atribución al autor original (quickmt) y al conversor (value-productions), pero exige indicar los cambios realizados.
- No se documentan limitaciones de longitud de contexto; se desconoce el máximo de tokens por segmento.
- El modelo está empaquetado para CTranslate2; no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp sin conversión adicional.
- El repositorio tiene muy pocas descargas (56) y ningún like, lo que limita la validación comunitaria.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/value-productions/quickmt-en-th-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-en-th
- CTranslate2 (librería): https://github.com/OpenNMT/CTranslate2
- Yaku Translate (aplicación mencionada): no disponible
