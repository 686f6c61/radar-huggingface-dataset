# value-productions/quickmt-en-tr-int8

## Resumen

quickmt-en-tr-int8 es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática quickmt/quickmt-en-tr, desarrollado originalmente por el proyecto quickmt y redistribuido por value-productions para su uso en la aplicación Yaku Translate. El modelo resuelve la tarea de traducción de inglés a turco y se distribuye en un formato optimizado para inferencia en CPU con CTranslate2, lo que reduce el peso del repositorio a unos 0,2 GB y facilita el despliegue en entornos con recursos limitados.

La relevancia de esta ficha radica en que se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: el autor de la conversión declara que la salida sobre las frases comprobadas es idéntica carácter por carácter a la del original en float16. Esto lo convierte en una opción práctica para integrar traducción EN→TR en aplicaciones de escritorio o móviles mediante CTranslate2, sin necesidad de GPU.

No se dispone de información pública sobre la arquitectura interna, el número de parámetros ni el volumen de entrenamiento del modelo base en la información proporcionada; la model card se limita a describir el proceso de conversión y los ficheros incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción quickmt/quickmt-en-tr; arquitectura interna no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (cuantización por fila de cada peso 2-D, esquema equivalente a la cuantización de ModelSpec de CTranslate2) |
| Idiomas soportados | inglés → turco (dirección EN→TR) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin), con config.json, source_vocabulary.json, target_vocabulary.json, src.spm.model y tgt.spm.model |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base quickmt/quickmt-en-tr (transformer, número de capas, dimensión oculta, cabezas de atención, etc.). Lo que sí se documenta es el proceso de conversión: se aplicó cuantización int8 por fila a cada peso bidimensional, siguiendo el mismo esquema que la cuantización de ModelSpec de CTranslate2, y se generaron los vocabularios de origen y destino junto con los modelos SentencePiece (src.spm.model y tgt.spm.model) necesarios para la tokenización.

El autor de la conversión afirma que la salida sobre las frases comprobadas coincide carácter por carácter con la del original en float16. No se proporcionan datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si hubo ajuste fino con RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización para inferencia.

## Capacidades

- Traducción automática de inglés a turco.
- Tokenización mediante SentencePiece con modelos separados para origen y destino.
- Inferencia optimizada para CPU gracias al formato CTranslate2 con pesos int8.
- Integración en la aplicación Yaku Translate, según indica la model card.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta soporte multilingüe más allá del par EN→TR.

## Casos de uso

- Traducción de documentación técnica EN→TR en pipelines offline: el formato CTranslate2 permite ejecutar la traducción en servidores sin GPU, procesando lotes de texto con bajo consumo de memoria.
- Localización de interfaces de aplicaciones: al estar pensado para la app Yaku Translate, encaja en la traducción de cadenas cortas de UI en tiempo real sobre CPU.
- Traducción de correos y mensajes en herramientas de escritorio: el tamaño reducido del repositorio (0,2 GB) facilita su empaquetado dentro de aplicaciones distribuidas.
- Preprocesado de corpus para investigación en PLN: permite generar traducciones EN→TR a gran escala sin depender de servicios en la nube.
- Traducción de subtítulos o transcripciones: la inferencia en CPU con CTranslate2 admite procesamiento por lotes de segmentos cortos.
- Prototipado de sistemas de traducción en entornos con hardware limitado: al no requerir GPU, sirve para validar flujos de traducción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el formato principal, ya que CTranslate2 con int8 está orientado a CPU; el repositorio ocupa 0,2 GB.
- GPU recomendadas: no disponibles; el formato CTranslate2 puede ejecutarse en GPU, pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no documentada; el modelo está pensado para inferencia en CPU.
- Opciones de despliegue: CTranslate2 (formato nativo de los pesos), a través de la aplicación Yaku Translate o de la API de CTranslate2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| quickmt-en-tr-int8 | no disponible | no disponible | EN→TR | CC BY 4.0 | CTranslate2 int8 |
| quickmt/quickmt-en-tr (original) | no disponible | no disponible | EN→TR | CC BY 4.0 | no disponible (float16 según la model card) |
| Otros modelos de traducción EN→TR | no disponible | no disponible | EN→TR | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo cubre la dirección inglés → turco; no se documenta traducción inversa ni otros pares de idiomas.
- No hay información pública sobre sesgos del modelo base ni sobre la composición de sus datos de entrenamiento.
- Riesgo de alucinación y de errores en terminología especializada no evaluado en la información disponible.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya la autoría; deben respetarse las condiciones de atribución del modelo base quickmt/quickmt-en-tr.
- Al ser una conversión de pesos, hereda cualquier limitación del modelo original; la equivalencia de salida solo se verificó sobre "las frases comprobadas", no de forma exhaustiva.
- No se documentan límites de longitud de contexto ni de segmento de entrada.
- El número de descargas (44) y de likes (0) es bajo, lo que sugiere poca validación comunitaria.

## Enlaces

- [Hugging Face: value-productions/quickmt-en-tr-int8](https://huggingface.co/value-productions/quickmt-en-tr-int8)
- [Modelo base: quickmt/quickmt-en-tr](https://huggingface.co/quickmt/quickmt-en-tr)
- [CTranslate2](https://github.com/OpenNMT/CTranslate2)
