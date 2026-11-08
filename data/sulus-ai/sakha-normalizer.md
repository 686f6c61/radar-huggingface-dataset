# Sulus-ai/sakha-normalizer

## Resumen

`sakha-normalizer` es una herramienta de normalización ortográfica para texto en sajá (yakuto, `sah`) escrito de forma informal, desarrollada por Sulus-ai. No es un modelo neuronal: es un programa en Python puro (solo biblioteca estándar) que reconstruye la ortografía estándar de palabras escritas con sustituciones típicas de teclados sin distribución sajá, donde ҕ se escribe como «г», «х» o «5», ө como «о», «е» u «8», һ como «ь», «с» o «h» latina, ү como «у» o «y», y ҥ como «н».

El problema que resuelve es concreto: los sistemas downstream (buscadores, chatbots, modelos de lenguaje, identificadores de idioma) tratan «кун» y «күн» como cadenas distintas, lo que degrada la recuperación y el procesamiento. La herramienta genera una copia normalizada del texto sin modificar el original del usuario, con una cobertura léxica de aproximadamente 470 000 formas de palabra extraídas de corpus sajá y ruso.

Es relevante ahora porque el sajá es una lengua de bajos recursos con escasa representación en herramientas NLP, y esta utilidad permite mejorar pipelines existentes sin necesidad de GPU ni de un modelo entrenado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB (solo código y diccionarios ligeros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica; programa determinista en Python (solo biblioteca estándar) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (procesamiento por palabra y por mensaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | `sah` (sajá/yakuto), `ru` (ruso) |
| Licencia | Código MIT; diccionarios y datos de test CC BY-SA 4.0 |
| Formato de pesos | No aplica; diccionario léxico empaquetado con el código Python |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento en el sentido habitual. El sistema consta de tres componentes: una tabla de sustituciones de letras (г/х/5→ҕ, н/нг→ҥ, о/е/8/0→ө, у/y→ү, ь/с/х/h→һ), un léxico de frecuencias de aproximadamente 470 000 formas de palabra, y un algoritmo de decisión que, para cada token, genera todas las escrituras alcanzables mediante la tabla de sustituciones y elige la forma presente en el diccionario con mayor frecuencia, ponderada por un «coste» de sustitución.

El léxico se construyó a partir de los corpus `ailabykt/sakha-corpus-mono` y `ailabykt/sakha-russian-parallel` (CC BY 4.0) y de la Wikipedia en sajá (CC BY-SA 4.0). Las reglas de sustitución se basan en los trabajos de N. A. Leontiev (2014) y de M. Everstova y coautores (LREC 2026). El umbral de sustitución se eleva si el mensaje ya contiene letras sajás correctas o si la frase es rusa, para evitar falsos positivos. No hay RLHF, DPO ni decodificación especulativa; es un normalizador léxico con heurísticas de contexto mínimo.

## Capacidades

- Normalización ortográfica de texto sajá informal a la ortografía estándar (ҕ, ҥ, ө, ү, һ).
- Protección de entidades que no deben modificarse: URLs, correos, @menciones, #etiquetas, números con unidades («5шт», «10к»), palabras puramente latinas y abreviaturas rusas («ИП», «ООО»).
- Preservación de palabras rusas con terminaciones sajás («колодкалар», «заказыҥ») sin alterarlas.
- Detección implícita de código de lengua a nivel de mensaje: si la frase es rusa, el umbral de sustitución se eleva y no se modifica.
- Procesamiento por lotes con instanciación única del objeto `Normalizer` para reutilizar el diccionario cargado.
- Interfaz de línea de comandos (`python -m sakha_normalizer`) y API Python (`normalize`, `Normalizer`).
- No realiza corrección de erratas, vocales largas, consonantes dobles, puntuación ni mayúsculas.
- No translitera texto íntegramente en latín a cirílico.
- No es un modelo generativo: no produce texto nuevo ni razona; solo reescribe tokens.

## Casos de uso

- Preprocesado para motores de búsqueda en sajá: normalizar las consultas de usuario antes de indexar o comparar, de modo que «кун» y «күн» colapsen a la misma forma y aumente el recall en recuperación léxica.
- Limpieza de corpus para entrenamiento de modelos de lenguaje: pasar el normalizador sobre textos de foros y chats antes de tokenizar, reduciendo la fragmentación del vocabulario sajá en el tokenizer.
- Identificación de idioma y enrutamiento: al normalizar primero, un clasificador de lengua distingue con más fiabilidad sajá de ruso en mensajes mixtos, evitando que las sustituciones de teclado confundan al detector.
- Moderación y análisis de contenido en comunidades sajá: normalizar mensajes entrantes para aplicar listas de palabras clave y reglas de filtrado sobre formas estándar.
- Chatbots de atención al cliente en sajá: normalizar la entrada del usuario antes de la coincidencia de intenciones o de la recuperación de respuestas, con latencia inferior a un milisegundo por mensaje.
- Enriquecimiento de datasets paralelos sajá-ruso: normalizar el lado sajá de `ailabykt/sakha-russian-parallel` para reducir ruido ortográfico antes de alinear o entrenar traducción.
- Estadísticas lingüísticas y lexicografía: contar frecuencias de formas estándar sobre texto espontáneo sin perder las variantes escritas a mano.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `eval/testset.jsonl` (parte `test`, 1377 frases de documentos no incluidos en el diccionario, con sustituciones de seis tipos aplicadas artificialmente). Métrica por palabras.

| Tipo de distorsión | Palabras distorsionadas corregidas | Palabras correctas estropeadas |
|---|---|---|
| ҕ ҥ ө ү һ → г н о у h (sin teclado sajá) | 94,9% | 0,2% |
| ө→е, ү→у, һ→ь (Leontiev 2014) | 95,4% | 0,0% |
| ҕ→5, ө→8, ү→y, һ→h (dígitos y latín) | 98,0% | 0,4% |
| Mezcla: ө→о/8, ҕ→г/х/5, һ→ь/с/h, ҥ→н/нг | 96,7% | 0,3% |
| Teclado presente pero sin ҕ ni ҥ | 90,9% | 0,1% |
| Texto sin errores | — | 0,3% |
| **Total** | **95,8%** | **0,2%** |

Datos adicionales reportados: proporción de palabras correctas del 77,0% al 98,9%; frases rusas (`eval/russian.txt`, 240 palabras) con 0 palabras modificadas; frases mixtas (`eval/mixed.jsonl`, 25 unidades) con 25 aciertos. Rendimiento: aproximadamente 14 000 mensajes por segundo, carga del diccionario inferior a un segundo y unos 120 MB de memoria. No se han publicado comparaciones con otros normalizadores en la información disponible.

## Requisitos de hardware

- No requiere GPU. Se ejecuta en CPU con Python estándar, sin dependencias externas para inferencia.
- Memoria RAM: aproximadamente 120 MB para el diccionario cargado.
- Almacenamiento: repositorio de 0.0 GB; el léxico y el código son ligeros.
- Cabe en cualquier máquina, incluidos contenedores pequeños, Raspberry Pi y funciones serverless con límites de memoria de 256 MB.
- Despliegue: instalación vía `pip install ./sakha-normalizer` tras `hf download`, o copia directa de la carpeta `sakha_normalizer/` al proyecto. No aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos neuronales.
- Latencia y throughput: aproximadamente 14 000 mensajes por segundo en el hardware de referencia del autor; carga inicial inferior a un segundo, amortizable instanciando `Normalizer()` una sola vez.
- Para reconstruir el diccionario se necesita `pyarrow` (solo en el script `build_lexicon.py`).

## Comparativa con modelos similares

No se dispone de información sobre normalizadores o correctores comparables para sajá en la documentación proporcionada. La categoría funcional (normalización ortográfica determinista de lenguas de bajos recursos) no cuenta con alternativas identificadas en la información disponible.

| Herramienta | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sulus-ai/sakha-normalizer | Normalizador léxico determinista en Python | sah, ru | MIT (código) / CC BY-SA 4.0 (datos) | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las palabras ausentes del diccionario en su forma correcta (formas raras, neologismos, nombres propios) no se reconstruyen, salvo casos inequívocos («5» dentro de palabra → «ҕ», «ь» tras vocal → «һ»).
- Ambigüedad léxica real: si tanto la forma de chat como la estándar son palabras válidas («сон»/«сөҥ», «уол»/«үөл», «заказын»/«заказыҥ»), se conserva la escrita; el contexto de la frase apenas se utiliza.
- No corrige erratas, vocales largas omitidas, consonantes dobles, puntuación ni mayúsculas.
- El texto íntegramente en latín («kuruk») no se translitera a cirílico.
- El diccionario se construyó con periódicos, libros y web; los dialectos y la jerga están poco cubiertos.
- El conjunto de test es artificial (ruido aplicado sobre frases correctas con sustituciones conocidas); el rendimiento en conversación real puede diferir.
- Licencia dual: el código es MIT, pero los diccionarios y los datos de test son CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual sobre esos componentes en uso comercial.
- Riesgo de falsos positivos del 0,2-0,4% en palabras correctas, relevante en pipelines que exijan preservación literal del texto original.
- No debe presentarse al usuario final como corrector de su escritura: la model card insiste en que es una herramienta para máquinas, no para corregir a las personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sulus-ai/sakha-normalizer
- Dataset `ailabykt/sakha-corpus-mono`: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset `ailabykt/sakha-russian-parallel`: https://huggingface.co/datasets/ailabykt/sakha-russian-parallel
- Referencia: N. A. Leontiev (2014) sobre sustituciones de letras en sajá (citado en `SOURCES.md`, sin URL en la información disponible)
- Referencia: M. Everstova y coautores, LREC 2026 (citado en `SOURCES.md`, sin URL en la información disponible)
- Wikipedia en sajá (fuente del léxico): no disponible URL específica en la información proporcionada
