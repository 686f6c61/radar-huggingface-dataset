# value-productions/quickmt-en-pt-int8

## Resumen

quickmt-en-pt-int8 es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática quickmt/quickmt-en-pt, desarrollado originalmente por el proyecto quickmt y redistribuido por value-productions para su uso en la aplicación Yaku Translate. El modelo realiza traducción directa inglés-portugués y está empaquetado específicamente para inferencia eficiente en CPU mediante el runtime CTranslate2, que es el motor habitual en aplicaciones de traducción de escritorio y móviles.

La relevancia de esta ficha radica en su carácter de artefacto de despliegue: no se trata de un modelo entrenado desde cero, sino de un reempaquetado del modelo base con pesos de 8 bits. El autor indica que las frases verificadas producen la misma salida que el original en float16, lo que sugiere una pérdida de calidad mínima tras la cuantización. El repositorio ocupa aproximadamente 0,2 GB, un tamaño compatible con aplicaciones ligeras y entornos con recursos limitados.

La información pública disponible es muy escasa: no se documentan la arquitectura interna del modelo base, el número de parámetros, la longitud de contexto ni los datos de entrenamiento. Esta ficha recoge lo que consta en la model card y en los metadatos de HuggingFace, marcando explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción quickmt/quickmt-en-pt; empaquetado para CTranslate2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2); el original se distribuye en float16 |
| Idiomas soportados | inglés y portugués (par en-pt; no se detalla variante de portugués) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (modelo convertido, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base quickmt/quickmt-en-pt: la model card del reempaquetado no detalla si se trata de un transformer encoder-decoder clásico, un modelo tipo NLLB destilado u otra variante. Tampoco constan el número de parámetros, el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo único documentado es el proceso de conversión: los pesos originales en float16 se han recuantizado a int8 y se han guardado en el formato binario de CTranslate2.

La innovación técnica relevante aquí no está en el entrenamiento sino en el empaquetado: CTranslate2 aplica optimizaciones de inferencia (fusión de operaciones, gestión eficiente de memoria y kernels cuantizados) que permiten ejecutar el modelo en CPU con un rendimiento muy superior al de frameworks genéricos. El autor afirma que la cuantización int8 preserva la salida del modelo float16 en las frases comprobadas, lo que es coherente con el comportamiento habitual de la cuantización de 8 bits en modelos de traducción, donde la degradación suele ser marginal.

## Capacidades

- Traducción automática directa del inglés al portugués.
- Inferencia optimizada en CPU mediante el runtime CTranslate2.
- Ejecución con huella de memoria reducida gracias a los pesos int8 (repositorio de unos 0,2 GB).
- Integración pensada para la aplicación Yaku Translate, lo que implica un uso orientado a traducción de frases y documentos en entornos de escritorio o móviles.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No consta capacidad multimodal (visión o audio).
- No consta soporte multilingüe más allá del par inglés-portugués.
- No consta modo de razonamiento explícito (thinking mode).

## Casos de uso

- Traducción integrada en aplicaciones de escritorio: el formato CTranslate2 y los pesos int8 permiten embeber el modelo en una app sin GPU, con un consumo de disco de aproximadamente 0,2 GB y latencia baja en CPU, tal como hace Yaku Translate.
- Traducción de documentación técnica en inglés a portugués: adecuado para pipelines por lotes donde se traducen ficheros README, manuales o artículos sin necesidad de infraestructura GPU.
- Localización de interfaces de usuario: el modelo puede traducir cadenas cortas de IU en inglés a portugués dentro de un proceso de build, siempre que se validen las traducciones generadas antes de publicarlas.
- Traducción de correos y comunicaciones internas: integrable en herramientas de mensajería o clientes de correo para ofrecer traducción bajo demanda en entornos corporativos con portugués como idioma de destino.
- Subtitulado y transcripción traducida: combinado con un sistema de reconocimiento de voz, puede traducir segmentos cortos de inglés a portugués en tiempo casi real en CPU.
- Servicio de traducción de bajo coste en servidores sin GPU: al ejecutarse con CTranslate2 en CPU, permite desplegar un endpoint de traducción en-pt en máquinas modestas, con la ventaja de la licencia CC BY 4.0 para uso comercial con atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que las frases comprobadas producen la misma salida que el modelo original en float16, sin aportar métricas como BLEU, COMET o chrF, ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no aplica para el uso previsto; el modelo está empaquetado para inferencia en CPU con CTranslate2.
- GPU recomendadas: no disponibles; el artefacto no está orientado a GPU.
- Compatibilidad con GPU de consumo: no consta; el formato CTranslate2 con int8 está pensado para CPU, aunque CTranslate2 también soporta ejecución en GPU CUDA con los mismos pesos.
- Memoria RAM estimada: no disponible con precisión; el tamaño del repositorio (0,2 GB) sugiere un modelo pequeño que debería caber holgadamente en equipos con 2-4 GB de RAM libres, aunque el dato exacto no está publicado.
- Opciones de despliegue: CTranslate2 (runtime nativo), con bindings para Python, y la aplicación Yaku Translate. No se distribuyen pesos en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin una conversión adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no constan los parámetros, el contexto ni métricas de calidad del modelo base quickmt/quickmt-en-pt, y no se han identificado en la información proporcionada alternativas comparables con datos verificables. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- Solo traduce en la dirección inglés a portugués; no se documenta la dirección inversa ni otros pares de idiomas.
- No se especifica la variante de portugués (europeo o brasileño), lo que puede afectar a la adecuación léxica según el público objetivo.
- No hay datos publicados sobre sesgos, tasas de alucinación o comportamiento en dominios especializados (legal, médico, técnico).
- La cuantización int8 puede introducir degradaciones en casos límite no cubiertos por las frases comprobadas por el autor; se recomienda una evaluación propia antes de usarlo en producción.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución al autor original (quickmt) y a la redistribución (value-productions); conviene revisar los términos exactos y conservar los avisos de copyright.
- El modelo base es de procedencia poco documentada; para aplicaciones críticas conviene auditar la calidad con un conjunto de evaluación propio.
- No es compatible de forma directa con ecosistemas como llama.cpp, Ollama o vLLM sin conversión previa del formato CTranslate2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/value-productions/quickmt-en-pt-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-en-pt
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Aplicación Yaku Translate: no disponible (no se proporciona URL en la información disponible)
