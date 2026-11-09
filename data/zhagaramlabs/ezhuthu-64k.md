# zhagaramlabs/ezhuthu-64k

## Resumen

Ezhuthu 64k es un tokenizador BPE de 64.000 tokens disenado especificamente para tamil, con cobertura de ingles y codigo, desarrollado por Zhagaram Labs, un laboratorio sin animo de lucro dedicado a IA abierta en tamil. No es un modelo de lenguaje: es el componente de tokenizacion que se situa antes de cualquier LLM, y su propuesta central es que ningun limite de token caiga dentro de una letra tamil (entendida como grapheme cluster Unicode: vocal, o consonante sola o con su signo vocalico o pulli), salvo en 4 letras raras (ஙெ, ஙௌ, ஞௌ, ழௌ).

El problema que aborda es concreto: la mayoria de tokenizadores aprenden tamil desde puntos de codigo y parten las letras, dejando un signo vocalico o un pulli como token independiente, de modo que una sola letra cuesta dos tokens. Ezhuthu aprende sus merges sobre letras completas y, ademas, durante el entrenamiento nunca unio el lexema de una palabra con su sufijo para las 366.584 formas verbales que descompone TamilMorph. En uso es un BPE convencional.

Su relevancia es practica para quien entrene o despliegue modelos en tamil: con el mismo vocabulario, texto y computo, produjo menores bits por byte en prosa tamil held-out que BPE plano y que si mismo sin los cortes de lexema, a 85M y 350M parametros, y que el tokenizador de Agaram a 85M. El coste es un 6-7% mas de tokens en texto web tamil respecto a la misma variante sin cortes de lexema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (byte-level con fallback UTF-8) |
| Parametros totales | no disponible (no es un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | tamil (ta), ingles (en); incluye codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json y ficheros de tokenizador compatibles con transformers (no safetensors ni GGUF) |

Detalles adicionales del vocabulario: 64.000 tokens, de los cuales 256 son tokens de byte; los puntos de codigo de las 4.000 letras mas frecuentes del corpus de entrenamiento con merges fijos que ensamblan cada letra; y merges aprendidos que solo unen letras completas. En total, 61.876 merges. El token `<|endoftext|>` ocupa el id 64.000 y esta configurado como `bos_token` y `eos_token`. Normalizacion NFC. Pre-tokenizador con el patron de Qwen3.5, que mantiene los signos vocalicos con su letra y separa los digitos uno a uno. Fallback de byte: cualquier caracter fuera del vocabulario se convierte en tokens de byte UTF-8, por lo que no hay token desconocido y cualquier texto decodifica de vuelta a si mismo en su forma NFC.

## Arquitectura y entrenamiento

Se trata de un tokenizador BPE entrenado sobre texto tamil con presencia de ingles y codigo. La innovacion esta en las unidades sobre las que se aprenden los merges: en lugar de operar sobre puntos de codigo, opera sobre letras completas (grapheme clusters), de forma que los merges aprendidos nunca rompen una letra. Adicionalmente, durante el entrenamiento se impidio que un merge uniera el lexema de una palabra con su sufijo para las 366.584 formas verbales descompuestas por el dataset TamilMorph, lo que preserva la morfologia aglutinante del tamil en la segmentacion.

No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del corpus, mas alla de que se usaron textos tamil (con menciones a Sangraha, Project Madurai y FineWeb-2 como conjuntos de evaluacion) y que las 4.000 letras mas frecuentes del corpus determinan los puntos de codigo incluidos. No hay RLHF ni DPO porque no es un modelo generativo. El tokenizador carga sin codigo remoto y se verifico que produce los mismos ids con transformers 4.46.3, 4.57.1 y 5.22.1.

## Capacidades

- Segmentacion de texto tamil sin cortes dentro de letra (0,003% de cortes de letra en fresh.web, frente a 17,1% de Agaram y 99% de Llama-3.1-8B).
- Round-trip completo: el 100% de los pasajes de fresh.web decodifican al mismo texto (ignorando espacios), gracias al fallback de byte.
- Cobertura de ingles y codigo dentro del mismo vocabulario de 64.000 tokens.
- Normalizacion NFC integrada.
- Separacion de digitos uno a uno mediante el pre-tokenizador.
- Compatibilidad con la libreria transformers y con endpoints compatibles (tag `endpoints_compatible`).
- No incluye capacidades de generacion, razonamiento, vision, tool calling ni agentes: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de LLMs en tamil: usar Ezhuthu como tokenizador base reduce el coste por letra frente a tokenizadores multilingues que parten las letras, lo que se traduce en menos tokens por palabra y, por tanto, en secuencias mas cortas para el mismo texto. Es adecuado porque sus merges respetan la unidad ortografica del tamil.
- Modelos de morfologia y analisis gramatical: al no unir lexema y sufijo en las formas de TamilMorph, la segmentacion conserva la frontera morfologica, lo que facilita tareas de etiquetado y analisis de sufijos aglutinantes.
- Pipelines de NLP para tamil en produccion: cualquier tarea downstream (clasificacion, NER, traduccion) que necesite tokenizar tamil de forma reversible puede usar el tokenizador con garantia de round-trip del 100%.
- Procesamiento de corpus web tamil a gran escala: con 1,656 tokens por palabra en fresh.web frente a 12,040 de Llama-3.1-8B o 4,841 de DeepSeek-V3, reduce el almacenamiento y el computo de indexacion de grandes volumenes de texto tamil.
- Investigacion sobre tokenizacion de lenguas dravidicas: sirve como referencia reproducible (licencia Apache 2.0, sin codigo remoto) para comparar estrategias de segmentacion basadas en grapheme clusters frente a puntos de codigo.
- Sistemas mixtos tamil-ingles y codigo: al cubrir ta, en y codigo en un unico vocabulario, evita cambiar de tokenizador en aplicaciones bilingues o en documentacion tecnica con fragmentos de codigo.

## Benchmarks y rendimiento

La model card reporta tokens por palabra (menos es mejor) sobre tres conjuntos held-out: D4.web (shard 52 de Sangraha, no usado en entrenamiento), D4.literature (lineas de Project Madurai) y fresh.web (split de test tamil de FineWeb-2, filtrado). Se incluyen los resultados principales:

| Tokenizador | Vocab | fresh.web | D4.web | Literature | Cortes de letra | Round trip |
|---|---|---|---|---|---|---|
| murai-labs/agaram-2.5b | 64.000 | 1,532 | 1,677 | 1,926 | 17,1% | 100,0% |
| Ezhuthu sin cortes de lexema (no liberado) | 64.000 | 1,544 | 1,677 | 1,914 | 0,003% | 100,0% |
| ai4bharat/IndicBERTv2-MLM-only | 250.000 | 1,601 | 1,763 | 2,083 | 10,0% | 0,1% |
| Ezhuthu 64k | 64.001 | 1,656 | 1,783 | 1,968 | 0,003% | 100,0% |
| google/muril-base-cased | 197.258 | 1,722 | 1,887 | 2,214 | 7,9% | 99,7% |
| bigscience/bloom-560m | 250.680 | 2,016 | 2,154 | 2,415 | 39,3% | 100,0% |
| sarvamai/sarvam-30b | 262.144 | 2,279 | 2,436 | 2,691 | 24,0% | 100,0% |
| google/gemma-3-4b-it | 262.145 | 2,279 | 2,436 | 2,691 | 24,0% | 100,0% |
| sarvamai/sarvam-1 | 68.096 | 2,289 | 2,463 | 2,772 | 25,0% | 100,0% |
| FacebookAI/xlm-roberta-base | 250.002 | 2,306 | 2,485 | 2,785 | 15,5% | 98,4% |
| google/mt5-base | 250.100 | 2,448 | 2,584 | 2,725 | 27,4% | 98,4% |
| theschoolofai/BrahmicTokenizer-131K | 131.072 | 3,011 | 3,165 | 3,379 | 62,6% | 100,0% |
| openai/gpt-oss-20b | 200.019 | 3,032 | 3,189 | 3,410 | 63,1% | 100,0% |
| mistralai/Mistral-Nemo-Base-2407 | 131.072 | 3,624 | 3,774 | 3,889 | 76,0% | 100,0% |
| Qwen/Qwen3.5-0.8B | 248.077 | 4,132 | 4,276 | 4,344 | 63,2% | 100,0% |
| deepseek-ai/DeepSeek-V3 | 128.815 | 4,841 | 4,963 | 4,939 | 87,2% | 100,0% |
| LiquidAI/LFM3-Omni-2B | 125.033 | 5,086 | 5,199 | 5,241 | 99,0% | 100,0% |
| krutrim-ai-labs/Krutrim-1-instruct | 70.212 | 6,587 | 6,680 | 6,706 | 99,0% | 100,0% |
| Qwen/Qwen3-8B | 151.669 | 9,868 | 9,990 | 10,015 | 99,0% | 100,0% |
| CohereLabs/aya-expanse-8b | 255.029 | 10,014 | 10,137 | 10,136 | 99,0% | 100,0% |
| meta-llama/Llama-3.1-8B | 128.256 | 12,040 | 12,185 | 12,264 | 99,0% | 100,0% |

Ezhuthu queda 4.o de 21 en tokens sobre fresh.web. Los cortes de lexema cuestan un 7,2% en fresh.web, un 6,3% en D4.web y un 2,9% en literatura respecto a la misma variante sin cortes. Solo tres tokenizadores gastan menos tokens en fresh.web que Ezhuthu (Agaram, la variante sin cortes y IndicBERTv2). La model card advierte que D4 fue usado para seleccionar tres rondas de tokenizadores (datos de desarrollo) y que fresh.web se construyo despues; una decision posterior si consulto fresh.web al comparar Ezhuthu con su variante sin cortes.

## Requisitos de hardware

- No aplica VRAM de inferencia: es un tokenizador, no un modelo de lenguaje. Su ejecucion es en CPU y consume del orden de megabytes de memoria.
- No requiere GPU. Cualquier CPU moderna lo ejecuta; el coste dominante es la tokenizacion de texto, lineal en el numero de caracteres.
- Despliegue mediante la libreria transformers (`AutoTokenizer.from_pretrained`), sin codigo remoto. Tambien puede integrarse en pipelines que acepten `tokenizer.json` (por ejemplo, servidores de inferencia compatibles con tokenizadores de transformers).
- Latencia y throughput no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Tokenizador | Vocab | fresh.web (tokens/palabra) | Cortes de letra | Round trip | Licencia |
|---|---|---|---|---|---|
| Ezhuthu 64k | 64.001 | 1,656 | 0,003% | 100,0% | Apache 2.0 |
| murai-labs/agaram-2.5b | 64.000 | 1,532 | 17,1% | 100,0% | no disponible |
| ai4bharat/IndicBERTv2-MLM-only | 250.000 | 1,601 | 10,0% | 0,1% | no disponible |
| google/muril-base-cased | 197.258 | 1,722 | 7,9% | 99,7% | no disponible |

Ezhuthu es el unico de la comparativa con cortes de letra practicamente nulos (0,003%) y round-trip del 100% junto con Agaram, pero Agaram parte letras en el 17,1% de las palabras. IndicBERTv2 gasta menos tokens en fresh.web pero rompe el round-trip (0,1%) y parte letras en el 10% de los casos. Muril gasta mas tokens y tambien parte letras. El precio de Ezhuthu es un mayor numero de tokens por palabra frente a Agaram y a su propia variante sin cortes de lexema.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a prompts. Solo tokeniza.
- Los cortes de lexema incrementan el coste en tokens un 6-7% en texto web tamil respecto a la misma variante sin cortes; en escenarios donde el coste por token sea critico, esta penalizacion debe tenerse en cuenta.
- Quedan 4 letras raras (ஙெ, ஙௌ, ஞௌ, ழௌ) en las que un limite de token puede caer dentro de la letra.
- El tokenizador no anade `<|endoftext|>` por si mismo; hay que anteponerlo manualmente al entrenar. Omitirlo puede degradar el comportamiento del modelo entrenado.
- La cobertura linguistica se limita a tamil e ingles (y codigo); otras lenguas caeran en el fallback de byte, con un coste de tokens muy alto.
- La evaluacion se concentra en tamil; el rendimiento en ingles y codigo no se cuantifica en la informacion disponible.
- La model card reconoce que fresh.web se construyo despues de la seleccion de tokenizadores, pero una decision posterior (la comparacion con la variante sin cortes) si consulto fresh.web, lo que introduce un sesgo menor en esa comparacion concreta.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y atribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-09), por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zhagaramlabs/ezhuthu-64k
- Zhagaram Labs: https://zhagaramlabs.com
- Dataset TamilMorph: https://huggingface.co/datasets/Surendhar32/TamilMorph
- Tokenizador Agaram (comparativa): https://huggingface.co/murai-labs/agaram-2.5b
- IndicBERTv2 (comparativa): https://huggingface.co/ai4bharat/IndicBERTv2-MLM-only
- MuRIL (comparativa): https://huggingface.co/google/muril-base-cased
- Paper de IndicSuperTokenizer / MUTANT (arXiv 2511.03237): https://arxiv.org/abs/2511.03237
