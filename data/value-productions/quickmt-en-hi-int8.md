# value-productions/quickmt-en-hi-int8

## Resumen

quickmt-en-hi-int8 es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática quickmt/quickmt-en-hi, desarrollado originalmente por el equipo quickmt y redistribuido por value-productions. El modelo resuelve la tarea de traducción directa inglés-hindi (en-hi) y está pensado para su uso dentro de la aplicación Yaku Translate, que lo emplea como motor de traducción local. Su relevancia actual radica en que ofrece un artefacto compacto (0,2 GB de repositorio) y optimizado para inferencia en CPU mediante CTranslate2, lo que facilita el despliegue en entornos con recursos limitados.

La arquitectura subyacente es la del modelo original quickmt/quickmt-en-hi, un transformer encoder-decoder de traducción neuronal con tokenización SentencePiece (se incluyen src.spm.model y tgt.spm.model). Esta versión no modifica los pesos más allá de la cuantización: se aplica cuantización int8 por filas a cada peso bidimensional, siguiendo el mismo esquema que la cuantización ModelSpec de CTranslate2, con fecha de conversión 26.10.2026.

El interés de esta ficha es doble: por un lado, documenta un artefacto de inferencia listo para producción con CTranslate2; por otro, advierte de que se trata de una conversión de un modelo base del que no se publican especificaciones detalladas (número de parámetros, contexto, datos de entrenamiento) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de traducción neuronal (según modelo base quickmt/quickmt-en-hi; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización por filas de cada peso 2-D, esquema ModelSpec de CTranslate2); el original está en float16 |
| Idiomas soportados | inglés e hindi (par en-hi) |
| Licencia | cc-by-4.0 |
| Formato de pesos | CTranslate2 (model.bin, config.json, source_vocabulary.json, target_vocabulary.json, src.spm.model, tgt.spm.model) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint quickmt/quickmt-en-hi, un sistema de traducción automática neuronal de tipo transformer encoder-decoder. La conversión a CTranslate2 aplica cuantización int8 por filas sobre cada tensor de peso bidimensional, replicando el esquema de cuantización ModelSpec de CTranslate2. Según la model card, la salida en las frases comprobadas es carácter por carácter idéntica a la del original en float16, lo que sugiere que la pérdida de calidad de la cuantización es despreciable en la práctica para ese conjunto de prueba.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo base. Tampoco se documentan detalles sobre la arquitectura interna (número de capas, dimensión oculta, cabezas de atención) ni sobre el vocabulario SentencePiece más allá de su inclusión en el repositorio.

## Capacidades

- Traducción automática directa del inglés al hindi.
- Tokenización mediante SentencePiece, con modelos separados para origen (src.spm.model) y destino (tgt.spm.model).
- Inferencia optimizada con CTranslate2, orientada a despliegue en CPU y entornos con recursos limitados.
- Compatible con la aplicación Yaku Translate, que lo utiliza como motor de traducción.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par en-hi; no se documentan otros pares.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio o móviles: el formato CTranslate2 int8 permite ejecutar el modelo en CPU sin GPU, lo que encaja en apps como Yaku Translate que necesitan traducción local y sin conexión.
- Traducción por lotes de documentación técnica en inglés a hindi: el modelo puede procesar grandes volúmenes de texto en pipelines de preprocesamiento, dado su reducido tamaño (0,2 GB) y su naturaleza de modelo especializado.
- Localización de interfaces de usuario: para cadenas cortas y textos de UI, la latencia baja de un modelo int8 en CTranslate2 permite traducciones en tiempo real dentro de flujos de CI/CD de localización.
- Servicio de traducción en servidores sin GPU: al no requerir acelerador, puede desplegarse en instancias CPU estándar con CTranslate2, reduciendo costes de infraestructura.
- Preprocesamiento multilingüe en investigación: útil para traducir corpus en inglés a hindi antes de tareas de análisis, anotación o entrenamiento de otros modelos.
- Traducción de contenido web o chats en entornos con privacidad estricta: al ejecutarse localmente, evita enviar texto a servicios en la nube, lo que resulta adecuado para datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo int8 ocupa aproximadamente 0,2 GB de pesos, por lo que cabría en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no se especifican; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060) podría alojar el modelo, aunque CTranslate2 está optimizado también para CPU.
- Cabe en GPU consumer: sí, por el tamaño reducido del artefacto (0,2 GB).
- Opciones de despliegue: CTranslate2 (formato nativo), con posibilidad de integración en aplicaciones Python mediante ctranslate2; no se documentan otros formatos como GGUF, Ollama o vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| quickmt-en-hi-int8 | no disponible | no disponible | cc-by-4.0 | CTranslate2 int8 | Conversión int8 del original float16 |
| quickmt/quickmt-en-hi (original) | no disponible | no disponible | cc-by-4.0 | float16 (formato original no especificado) | Modelo base del que deriva esta conversión |
| Otros modelos de traducción en-hi | no disponible | no disponible | no disponible | no disponible | No se dispone de información comparable en la documentación |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo traduce del inglés al hindi; no soporta otros pares de idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo de traducción entrenado con datos no especificados, puede heredar sesgos de género, culturales o dialectales del corpus original.
- Riesgo de alucinación en traducción: como todo modelo generativo, puede producir traducciones fluidas pero incorrectas en frases ambiguas o dominios especializados.
- No se especifica la longitud máxima de contexto; textos largos podrían truncarse o degradar la calidad.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero se debe citar al autor original (quickmt) y conservar el aviso de licencia.
- La cuantización int8, aunque validada como idéntica en las frases comprobadas, podría introducir diferencias menores en otros textos no verificados.
- No se proporcionan métricas de calidad (BLEU, COMET) ni evaluación independiente.
- El modelo está empaquetado para CTranslate2; no es directamente compatible con otros runtimes sin conversión adicional.

## Enlaces

- [Hugging Face: value-productions/quickmt-en-hi-int8](https://huggingface.co/value-productions/quickmt-en-hi-int8)
- [Modelo base: quickmt/quickmt-en-hi](https://huggingface.co/quickmt/quickmt-en-hi)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
