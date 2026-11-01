# value-productions/quickmt-ur-en-int8

## Resumen

quickmt-ur-en-int8 es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática quickmt/quickmt-ur-en, desarrollado por quickmt y redistribuido por value-productions. El modelo original traduce de urdu (ur) a inglés (en) y se distribuye con licencia CC BY 4.0. Esta variante concreta no introduce cambios en los pesos más allá de la cuantización: según la model card, la salida en las frases comprobadas es idéntica carácter por carácter a la del original en float16.

El interés de esta ficha reside en su formato de despliegue: los pesos están empaquetados para CTranslate2 (model.bin, config.json, vocabularios de origen y destino y modelos SentencePiece src.spm.model y tgt.spm.model), lo que permite inferencia eficiente en CPU y GPU con un consumo de memoria reducido. El repositorio ocupa 0,2 GB, un tamaño coherente con un modelo de traducción de tipo transformer encoder-decoder de escala moderada.

La relevancia es práctica: se trata de un artefacto listo para producción en pipelines de traducción urdu-inglés, pensado para integrarse en la aplicación Yaku Translate, con un esquema de cuantización por filas de cada peso 2-D equivalente al que aplica la propia herramienta de conversión de CTranslate2. No hay información pública sobre arquitectura exacta, número de parámetros ni datos de entrenamiento en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para traducción automática (detalle no disponible); empaquetado para CTranslate2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (cuantización por filas de cada peso 2-D, esquema equivalente a ModelSpec de CTranslate2); el original existe en float16 |
| Idiomas soportados | urdu (origen) e inglés (destino) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin), con config.json, source_vocabulary.json, target_vocabulary.json, src.spm.model y tgt.spm.model |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base quickmt/quickmt-ur-en más allá de su naturaleza como modelo de traducción automática. El artefacto distribuido aquí es una conversión a CTranslate2 con cuantización int8 aplicada por filas a cada peso bidimensional, el mismo esquema que emplea la cuantización ModelSpec de CTranslate2. La conversión se realizó el 26 de octubre de 2026 y, según el autor de la conversión, la salida sobre las frases verificadas coincide carácter por carácter con la del modelo original en float16.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas del modelo base. Los ficheros SentencePiece (src.spm.model y tgt.spm.model) indican tokenización subword independiente para origen y destino, y los vocabularios JSON confirman el mapeo de tokens esperado por CTranslate2.

## Capacidades

- Traducción automática de urdu a inglés en una única dirección (ur → en).
- Tokenización subword mediante SentencePiece para origen y destino.
- Inferencia optimizada con CTranslate2, con soporte de ejecución en CPU y GPU según la configuración del runtime.
- Cuantización int8 que reduce el uso de memoria y acelera la inferencia en CPU respecto al float16 original, manteniendo la salida idéntica en las frases comprobadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta capacidad multilingüe más allá del par urdu-inglés.

## Casos de uso

- Traducción de contenido editorial urdu a inglés: el modelo puede procesar artículos y notas de prensa en urdu y generar versiones en inglés, con la ventaja de un binario de 0,2 GB que se despliega en servidores modestos.
- Localización de documentación técnica y de producto: integrado en un pipeline de preprocesado y postprocesado, permite traducir guías y manuales del urdu al inglés antes de la revisión humana.
- Subtitulado y traducción de transcripciones: al ser un modelo de traducción dedicado y ligero, encaja en flujos que reciben texto ASR en urdu y necesitan una versión inglesa con baja latencia.
- Atención al cliente en mercados bilingües: traducción de mensajes de usuarios en urdu a inglés para que un agente o un sistema de clasificación monolingüe en inglés los procese.
- Moderación de contenido: traducción previa de textos en urdu a inglés para aplicar clasificadores de toxicidad o políticas entrenados en inglés.
- Procesamiento por lotes en CPU: gracias a CTranslate2 e int8, se puede ejecutar en servidores sin GPU para traducir grandes volúmenes de documentos de forma económica.
- Integración en la aplicación Yaku Translate: es el artefacto que la propia app utiliza según la model card, por lo que sirve como referencia de despliegue para ese entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica cualitativa aportada es la equivalencia carácter por carácter de la salida con el modelo float16 original en las frases comprobadas por el autor de la conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que el modelo en int8 cabe holgadamente en cualquier GPU con al menos 1-2 GB de memoria libre, incluyendo iGPU y GPUs de gama de entrada.
- GPU recomendadas: no se especifican; cualquier GPU compatible con CTranslate2 (por ejemplo, series NVIDIA Turing o posteriores) es suficiente dada la escala del modelo.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas tarjetas de gama baja; también es viable en CPU.
- Opciones de despliegue: CTranslate2 (runtime nativo), con integración en Python mediante ctranslate2; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, que no son formatos compatibles con model.bin de CTranslate2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Dirección | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| quickmt-ur-en-int8 (este) | ur → en | no disponible | no disponible | int8 | CC BY 4.0 | CTranslate2 |
| quickmt/quickmt-ur-en (base) | ur → en | no disponible | no disponible | float16 | CC BY 4.0 | no disponible |
| Otros modelos de traducción ur-en | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables en la documentación proporcionada; la comparación más directa es con el modelo base float16 del que deriva.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de urdu a inglés; no soporta la dirección inversa ni otros pares de idiomas.
- No hay información pública sobre sesgos del corpus de entrenamiento ni sobre su comportamiento en dominios especializados (legal, médico, técnico).
- Riesgo de alucinación y de traducciones fluentemente incorrectas inherente a los modelos neuronales de traducción; se recomienda revisión humana en contextos críticos.
- La equivalencia de salida con el original se verificó solo en las frases comprobadas por el autor de la conversión; no hay una evaluación sistemática publicada de la pérdida de calidad por la cuantización int8.
- Licencia CC BY 4.0: permite uso comercial y modificaciones siempre que se atribuya la autoría a quickmt y se indique si se han realizado cambios; conviene revisar los términos completos antes de redistribuir.
- El formato CTranslate2 limita la portabilidad a otros runtimes de inferencia sin reconversión.
- No se documentan límites de longitud de secuencia ni comportamiento con entradas muy largas.
- El modelo tiene un historial de adopción muy bajo (47 descargas, 0 likes en el momento de la consulta), lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/value-productions/quickmt-ur-en-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-ur-en
- CTranslate2 (runtime): https://github.com/OpenNMT/CTranslate2
