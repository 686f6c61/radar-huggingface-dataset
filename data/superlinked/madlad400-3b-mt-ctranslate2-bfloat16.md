# superlinked/madlad400-3b-mt-ctranslate2-bfloat16

## Resumen

MADLAD-400-3B-MT es un modelo de traduccion automatica multilingue desarrollado por Google, basado en la arquitectura T5 y entrenado sobre 1 billon de tokens que cubren mas de 450 idiomas. Este repositorio concreto contiene una conversion del checkpoint original al formato CTranslate2 con pesos en BF16, realizada por Superlinked como artefacto de inferencia listo para produccion. El modelo es competitivo con sistemas de traduccion significativamente mayores, lo que lo convierte en una opcion atractiva para despliegues eficientes.

La conversion a CTranslate2 permite una inferencia optimizada en CPU y GPU, con menor uso de memoria y mayor throughput en comparacion con la ejecucion directa del checkpoint original en Transformers. El checkpoint fuente esta fijado mediante hash y el artefacto de conversion incluye un manifiesto de integridad (`sie-serving-artifact.json`) que registra la identidad del origen, el contrato de conversion, el inventario de tokenizadores y los digests SHA-256 de cada archivo servido. Este es un artefacto de servido derivado, no un modelo entrenado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 3.000 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 |
| Idiomas soportados | Mas de 450 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (BF16) |

## Arquitectura y entrenamiento

MADLAD-400-3B-MT emplea la arquitectura T5, un transformer encoder-decoder con 32 capas y un vocabulario SentencePiece compartido de 256.000 tokens. El modelo fue entrenado sobre el dataset MADLAD-400, un corpus multilingue y a nivel de documento compuesto por 1 billon de tokens procedentes de datos publicamente disponibles, cubriendo mas de 450 idiomas, con especial atencion a lenguas de bajos recursos.

El entrenamiento se realizo en dos etapas: un preentrenamiento inicial en modo denoising y un ajuste fino posterior (fine-tuning) supervisado para la tarea de traduccion automatica. No se ha documentado el uso de RLHF o DPO en el entrenamiento de este modelo. El checkpoint original se publico bajo licencia Apache 2.0, lo que permite su uso comercial y la redistribucion sin restricciones significativas.

## Capacidades

- Traduccion automatica multilingue entre mas de 450 idiomas, incluyendo lenguas de bajos recursos escasamente representadas en otros sistemas.
- Competitivo con modelos de traduccion significativamente mayores, segun los resultados publicados por Google.
- Soporte de traduccion directa sin necesidad de ajuste fino adicional, utilizando los pesos preentrenados tal cual.
- Capacidad de traduccion a nivel de documento, gracias al entrenamiento con datos a nivel de documento, lo que mejora la coherencia contextual frente a la traduccion frase a frase.
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso: es un modelo especializado exclusivamente en traduccion.

## Casos de uso

- Traduccion de contenido web a gran escala: el modelo puede integrarse en pipelines de procesamiento por lotes para traducir articulos, documentacion tecnica y contenido generado por usuarios a decenas de idiomas simultaneamente, gracias a su soporte de mas de 450 lenguas.
- Localizacion de productos software: las empresas pueden desplegar el modelo como servicio interno para traducir cadenas de interfaz, mensajes de error y documentacion tecnica, reduciendo la dependencia de proveedores externos de traduccion.
- Traduccion de bajos recursos: organizaciones humanitarias o instituciones academicas pueden utilizarlo para traducir materiales a lenguas indigenas o minoritarias que no estan cubiertas por servicios comerciales de traduccion.
- Preprocesamiento multilingue para NLP: el modelo puede servir como componente de traduccion en pipelines de analisis de sentimiento, clasificacion de texto o extraccion de informacion que operan sobre corpus multilingues.
- Traduccion de soporte al cliente: integrado en plataformas de ticketing, permite traducir consultas de clientes y respuestas del equipo de soporte en tiempo real entre multiples idiomas.
- Generacion de datos paralelos sinteticos: el modelo puede emplearse para crear corpus paralelos etiquetados que sirvan como datos de entrenamiento para otros modelos de NLP en idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este artefacto de conversion CTranslate2 en la informacion disponible. El modelo original, segun la documentacion de Google, es competitivo con modelos de traduccion significativamente mayores, pero no se incluyen cifras concretas de BLEU u otras metricas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB con pesos BF16, dado que el modelo tiene 3.000 millones de parametros.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060 o superiores. Tambien es viable la inferencia en CPU con CTranslate2, con mayor latencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas de VRAM.
- Opciones de despliegue: CTranslate2 es compatible con servidores de inferencia como FasterTransformer y puede integrarse en aplicaciones mediante las APIs de Python o C++. Tambien es posible su uso con OpenNMT-py y otros frameworks que soporten el formato CTranslate2.
- Latencia y throughput: no se han publicado mediciones especificas para esta conversion, pero CTranslate2 suele ofrecer una aceleracion de 2 a 4 veces frente a Transformers en tareas de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400-3B-MT (CTranslate2) | 3B | 450+ | No disponible | Apache 2.0 | CTranslate2 |
| NLLB-200 (3.3B) | 3.3B | 200 | No disponible | CC-BY-NC | Safetensors |
| M2M-100 (1.2B) | 1.2B | 100 | No disponible | MIT | Safetensors |
| SMALL-100 | 500M | 100 | No disponible | MIT | Safetensors |

La principal ventaja de este artefacto frente a las alternativas es la cobertura de idiomas (450+ frente a 200 o 100) y la licencia Apache 2.0, que permite uso comercial sin restricciones, a diferencia de NLLB-200 que usa CC-BY-NC. El formato CTranslate2 ofrece ademas ventajas de rendimiento frente a los formatos Safetensors de las alternativas.

## Limitaciones y advertencias

- Este repositorio contiene una conversion de formato, no un modelo reentrenado. Las limitaciones del modelo original se aplican integramente.
- El entrenamiento se realizo con datos publicamente disponibles, lo que puede implicar sesgos presentes en el corpus de origen y ruido en los pares de traduccion para idiomas de bajos recursos.
- La calidad de traduccion puede degradarse significativamente en idiomas muy minoritarios o en dominios especializados (legal, medico, tecnico) para los que el corpus de entrenamiento tenga poca representacion.
- No se ha documentado la longitud de contexto soportada, por lo que traducciones de documentos muy largos pueden requerir segmentacion previa.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar las implicaciones de la licencia del modelo original y de los datos de entrenamiento en la jurisdiccion correspondiente.
- El artefacto esta fijado a una version concreta de CTranslate2 (4.8.1) y de las librerias de conversion, por lo que puede requerir actualizaciones futuras para mantener compatibilidad.

## Enlaces

- Repositorio HuggingFace del artefacto CTranslate2: https://huggingface.co/superlinked/madlad400-3b-mt-ctranslate2-bfloat16
- Modelo original en HuggingFace: https://huggingface.co/google/madlad400-3b-mt
- Documentacion de MADLAD-400 en Transformers: https://huggingface.co/docs/transformers/model_doc/madlad-400
- Repositorio oficial de investigacion en GitHub: https://github.com/google-research/google-research/blob/master/madlad_400/README.md
- Guia de despliegue de MADLAD-400-3B-MT: https://aiindigo.com/tutorials/getting-started-with-madlad-400-3b-mt-instant-multilingual-translation
