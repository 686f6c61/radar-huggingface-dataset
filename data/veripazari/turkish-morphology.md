# veripazari/turkish-morphology

## Resumen

`veripazari/turkish-morphology` es un espejo en Hugging Face del proyecto `google-research/turkish-morphology`, un analizador morfológico de dos niveles para el turco desarrollado originalmente por Google Research. No se trata de un modelo neuronal con pesos entrenados, sino de un sistema de reglas construido sobre transductores de estados finitos (FST), distribuido como repositorio de código y recursos lingüísticos. El autor del espejo, VeriPazarı, lo publica como archivo para la comunidad turca de procesamiento del lenguaje natural.

El sistema resuelve el problema clásico de la morfología aglutinante del turco: dada una palabra superficial, genera todas las hipótesis de análisis morfológico posibles con etiquetas legibles para humanos (caso, posesivo, persona-número, polaridad, derivación, etc.). La relevancia radica en que la morfología turca produce una explosión combinatoria de formas que los tokenizadores y modelos neuronales manejan con dificultad; disponer de un analizador determinista y exhaustivo es útil como componente de preprocesado, lematización o validación.

La ficha técnica se ve limitada por la naturaleza del artefacto: el repositorio en Hugging Face ocupa 0,0 GB y no incluye pesos, pipeline declarado ni tarjeta de modelo completa (el README está truncado). Los datos disponibles describen los componentes lingüísticos del proyecto original: léxico etiquetado, definiciones de morfotáctica en formato FST similar a AT&T y gramáticas Thrax para los procesos morfofonémicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Analizador morfológico de dos niveles basado en transductores de estados finitos (FST) y gramáticas Thrax; no es una red neuronal |
| Parámetros totales | no disponible (no aplica: sistema basado en reglas) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos; el proyecto se distribuye como código y recursos FST, ejecutables vía Bazel) |

## Arquitectura y entrenamiento

El sistema se organiza en tres capas. La primera es un conjunto de léxicos turcos etiquetados manualmente por tipo de palabra e irregularidades morfofonémicas; el conjunto léxico base documentado contiene 47.202 entradas etiquetadas. La segunda capa son las definiciones de morfotáctica, implementadas en un formato FST propio similar al de AT&T FSM, donde cada transición usa nombres de estado y etiquetas de entrada/salida como cadenas en lugar de enteros; cada FST describe los patrones de afijación de un tipo de palabra junto con su inventario de morfemas y los pares categoría-valor de rasgos morfológicos. La tercera capa son gramáticas Thrax, cada una de las cuales implementa un proceso morfofonémico independiente (armonía vocálica, elisión vocálica, suavización consonántica, caída consonántica, etc.); la composición de los FST exportados desde estas gramáticas forma el modelo morfofonémico del turco.

El análisis se ejecuta en dos niveles. El primero aplica el modelo morfofonémico para convertir la palabra superficial en una representación intermedia con metáforfemas (por ejemplo, `affında` → `af"+SH+NDA`). El segundo compila el léxico y las definiciones de morfotáctica en un único FST que transforma esa banda intermedia en todos los análisis legibles posibles (por ejemplo, `af"+SH+NDA` → `(af[NN]+[PersonNumber=A3sg]+Hn[Possessive=P2sg]+NDA[Case=Loc])+[Proper=False]`). No hay entrenamiento, ajuste fino, RLHF ni datos estadísticos: el comportamiento está determinado íntegramente por las reglas y el léxico. La ejecución se realiza con Bazel mediante el comando `bazel run -c opt scripts:print_analyses -- --word=[PALABRA]`.

## Capacidades

- Análisis morfológico exhaustivo de palabras turcas: devuelve todas las hipótesis de segmentación y etiquetado compatibles con la forma superficial.
- Etiquetado con rasgos morfológicos explícitos: categoría de palabra, polaridad, caso, posesivo, persona-número, derivación, cópula y marca de nombre propio.
- Generación de análisis legibles por humanos a partir de la banda intermedia de metáforfemas.
- Modelado de procesos morfofonémicos del turco: armonía vocálica, elisión vocálica, suavización y caída de consonantes.
- Rechazo explícito de cadenas no reconocidas como palabras turcas (salida vacía o mensaje de no aceptación).
- Cobertura léxica basada en diccionario: 47.202 entradas etiquetadas en el conjunto base.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; no es un modelo generativo.

## Casos de uso

- Preprocesado para pipelines de PLN en turco: el analizador puede lematizar y descomponer cada token en sus morfemas antes de alimentar un modelo neuronal, reduciendo la dispersión de formas superficiales.
- Búsqueda y recuperación de información: normalizar consultas y documentos a sus lemas y rasgos morfológicos permite hacer coincidir variantes flexivas que un índice léxico simple perdería.
- Corrección y validación ortográfica: una palabra que no produce ningún análisis puede marcarse como candidata a error, ya que el sistema rechaza explícitamente cadenas no aceptadas como turcas.
- Etiquetado morfológico para corpus lingüísticos: generar anotaciones deterministas y reproducibles con rasgos categoría-valor, útiles para entrenar o evaluar modelos supervisados.
- Enseñanza de turco como lengua extranjera: la salida legible por humanos permite mostrar a estudiantes la segmentación de una palabra en raíz, sufijos y rasgos gramaticales.
- Investigación en morfología computacional: servir como línea base simbólica frente a enfoques neuronales y como fuente de recursos FST reutilizables en experimentos de morfotáctica.
- Integración en sistemas de traducción automática: descomponer la morfología del lado turco para mejorar el alineamiento morfológico con lenguas de destino de morfología más pobre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No requiere GPU: es un sistema basado en reglas y FST, ejecutable en CPU.
- El requisito principal es disponer de Bazel y del entorno de compilación del proyecto original (`google-research/turkish-morphology`).
- No aplican estimaciones de VRAM ni de cuantización, al no existir pesos de red neuronal.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI; el despliegue se hace compilando y ejecutando los binarios del proyecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| veripazari/turkish-morphology | Analizador morfológico FST de dos niveles | Turco | Apache 2.0 | Espejo en Hugging Face del proyecto de Google Research |
| Zemberek | Herramientas de PLN para turco (incluye morfología) | Turco | no disponible en la información | Proyecto de código abierto independiente |
| Modelos neuronales multilingües (p. ej. BERT turco) | Modelo de lenguaje preentrenado | Turco / multilingüe | no disponible en la información | no disponible en la información |

La comparación con modelos neuronales no es directa: este artefacto no genera texto ni razona, sino que produce análisis morfológicos deterministas. Para una comparación rigurosa de rendimiento haría falta un conjunto de evaluación morfológica común, que no se proporciona en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no puede usarse para tareas generativas.
- Cobertura limitada al léxico: las palabras fuera del diccionario de 47.202 entradas pueden no analizarse, incluyendo neologismos, préstamos recientes y nombres propios no listados.
- Ambigüedad estructural: para una misma forma superficial se devuelven múltiples análisis (por ejemplo, variantes con `Proper=True` y `Proper=False`), y el sistema no desambigua por contexto.
- Solo turco: no hay soporte multilingüe.
- La tarjeta del espejo en Hugging Face está truncada y el repositorio ocupa 0,0 GB, por lo que no se garantiza que contenga los recursos completos del proyecto original; conviene verificar el repositorio de GitHub antes de usarlo en producción.
- El propio autor del espejo indica que no es un producto oficial de Google; el README original también declara que no es un producto oficial de Google.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales en la información disponible.
- No hay datos publicados de benchmarks, latencia ni throughput que permitan estimar su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/turkish-morphology
- Repositorio original en GitHub: https://github.com/google-research/turkish-morphology
- Plataforma del compilador del espejo: https://veripazari.com.tr
