# udgamlabs/Paar-en-hi

## Resumen

Paar English → Hindi es un modelo de traducción automática neuronal especializado en la dirección inglés → hindi (devanagari), desarrollado por Udgam Labs. Se trata de un modelo Marian de 17,3 millones de parámetros, destilado a partir de IndicTrans2 dist-200M, que traduce frases de inglés a hindi con un consumo de recursos mínimo: el fichero int8 ocupa 17,7 MB y funciona en CPU convencional a unos 36 ms por frase en un núcleo de un Mac mini, o directamente en el navegador mediante transformers.js.

El modelo forma parte de una familia de doce pares inglés → lengua índica (hindi, bengalí, maratí, telugu, tamil, gujarati, urdu, kannada, malayali, punyabí, odia y asamés) y está pensado para despliegues offline, en el borde (edge) y en entornos con recursos limitados, donde modelos de traducción de cientos de millones de parámetros no son viables. Su relevancia actual radica en que ofrece una alternativa ligera y de licencia Apache 2.0 para traducción inglés-hindi sin dependencia de servicios en la nube.

La arquitectura es un transformer encoder-decoder Marian clásico, con pesos disponibles en safetensors (fp32), CTranslate2 int8 y ONNX int8. El contexto de entrada está limitado a 127 piezas SentencePiece por frase, y el modelo está entrenado únicamente para traducción de una sola frase por invocación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (MarianMTModel) |
| Parametros totales | 17.170.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 127 piezas SentencePiece por frase (entrada truncada); salida hasta 200 tokens |
| Tipos de cuantizacion | fp32 (safetensors), int8 (CTranslate2), int8 (ONNX para transformers.js) |
| Idiomas soportados | inglés (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, CTranslate2 (ct2-int8), ONNX (onnx, int8) |

## Arquitectura y entrenamiento

Paar English → Hindi emplea la arquitectura Marian, un transformer encoder-decoder estándar para traducción automática, con tokenización SentencePiece. El modelo fue destilado a partir de IndicTrans2 dist-200M: aprendió a partir de frases en inglés que IndicTrans2 dist-200M había traducido al hindi, lo que constituye una destilación de conocimiento (knowledge distillation) desde un modelo profesor de 211,8 millones de parámetros a un alumno de 17,3 millones. El dataset base citado es ai4bharat/IndicCorpV2.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset de destilación ni si hubo etapas de RLHF o DPO (poco habituales en modelos de traducción Marian). La innovación técnica principal es la compresión extrema: un modelo de 17,3 M de parámetros que mantiene una calidad cercana a la de modelos entre 9 y 12 veces mayores, con builds int8 que se desvían solo 0,02 chrF++ (CTranslate2) y 0,16 chrF++ (ONNX) respecto a los pesos fp32 en los conjuntos de prueba evaluados.

## Capacidades

- Traducción de texto inglés → hindi (devanagari) frase a frase.
- Generación de texto de traducción con decodificación greedy (num_beams=1); la búsqueda por haz (beam search) no fue evaluada por los autores.
- Ejecución offline en CPU sin GPU, con latencia de aproximadamente 36 ms por frase en un núcleo de Mac mini.
- Ejecución en navegador web mediante transformers.js con el build ONNX int8 (28,7 MB descargados una sola vez).
- Integración con CTranslate2 para inferencia int8 de alto rendimiento en CPU.
- Procesamiento por lotes (batch) de frases mediante la API de Transformers, CTranslate2 o transformers.js.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente al par inglés-hindi; no traduce otras lenguas.

## Casos de uso

- Traducción offline en dispositivos de borde: el modelo se ejecuta en CPU sin conexión a internet, con 17,7 MB en int8, lo que lo hace adecuado para aplicaciones de escritorio, kioscos o dispositivos IoT que necesiten traducir inglés a hindi sin enviar datos a la nube.
- Traducción en el navegador: mediante transformers.js y el build ONNX int8, se puede integrar en una aplicación web que traduzca contenido inglés a hindi en el propio cliente, sin backend ni costes de servidor, con una descarga única de 28,7 MB.
- Localización de interfaces y documentación: traducción de cadenas cortas de UI, mensajes de error y textos de ayuda en aplicaciones dirigidas al mercado hindi, procesando cada frase por separado y con latencia de decenas de milisegundos.
- Atención al cliente automatizada: traducción de mensajes de usuarios en inglés a hindi en sistemas de soporte con recursos limitados, siempre que se dividan los párrafos en frases y se asuma la limitación de 127 piezas por entrada.
- Preprocesamiento en pipelines de NLP: traducción de corpus ingleses a hindi como paso previo a análisis de sentimiento, indexación o búsqueda en aplicaciones multilingües, con la ventaja de un modelo pequeño que cabe en memoria junto con otros componentes.
- Traducción en entornos con hardware restringido: despliegue en servidores sin GPU o en contenedores ligeros donde modelos de 200 M de parámetros no caben, usando CTranslate2 int8 con un rendimiento de ~36 ms/frase por núcleo.
- Aplicaciones educativas o de aprendizaje de idiomas: generación de traducciones de referencia para frases inglesas en herramientas de estudio, con la advertencia de que las salidas no han sido revisadas por hablantes nativos.

## Benchmarks y rendimiento

Los resultados publicados por los autores emplean chrF++ (mayor es mejor), con NFC en ambos lados, el mismo harness y las mismas frases para todos los sistemas. Las diferencias son pareadas con 1.000 remuestreos bootstrap e intervalo de confianza del 95%. Medición entre el 3 y el 16 de noviembre de 2026. Los resultados de Paar corresponden a los pesos fp32; el build int8 está dentro de 0,07 chrF++ de ellos.

| Conjunto de prueba (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (17,1 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 55,49 | 56,92 (-1,43 [-1,89, -0,97]) | 58,60 | 58,13 (-2,64 [-3,07, -2,16]) |
| IN22-Conv (1.503) | 44,92 | 47,22 (-2,30 [-2,83, -1,81]) | 48,79 | 46,79 (-1,87 [-2,36, -1,37]) |

- IN22-Gen: 51,35 (dato parcial en la información disponible; la model card indica que se conservan las frases cuyos números sobreviven, sin más detalle).
- El build CTranslate2 int8 se desvía 0,02 chrF++ de los pesos fp32 en FLORES+ y el 80% de sus traducciones son idénticas palabra por palabra.
- El build ONNX int8 está dentro de 0,16 chrF++ de los pesos fp32 en ambos conjuntos de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo fp32 ocupa aproximadamente 0,2 GB en disco y el build int8 17,7 MB (19,6 MB con vocabulario). En memoria, el modelo int8 requiere del orden de decenas de MB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU moderna podría ejecutarlo, pero no es su caso de uso previsto.
- Cabe en cualquier GPU de consumo (RTX 4090, etc.) y en CPU convencionales; también en navegadores y dispositivos de borde.
- Opciones de despliegue: Transformers (MarianMTModel), CTranslate2 (build ct2-int8), transformers.js (build ONNX int8 en navegador o Node), y potencialmente TGI o vLLM aunque no se documentan en la información disponible.
- Latencia y throughput: aproximadamente 36 ms por frase en un núcleo de Mac mini con el build int8; en navegador, la descarga única de los ficheros int8 es de 28,7 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ FLORES+ | chrF++ IN22-Conv | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Paar English → Hindi | 17,3 M | 127 piezas/frase | 55,49 | 44,92 | Apache 2.0 | Hugging Face, CTranslate2, ONNX |
| indicMT | 153,8 M | no disponible | 56,92 | 47,22 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8 M | no disponible | 58,60 | 48,79 | no disponible | no disponible |
| Modelo offline de Firefox | 17,1 MB (tamaño de fichero) | no disponible | 58,13 | 46,79 | no disponible | Integrado en Firefox |

Paar es el modelo más pequeño de la comparativa (17,3 M de parámetros) y queda por detrás de los tres alternativas en chrF++, pero con diferencias moderadas: 1,43 puntos frente a indicMT (8,6 veces más grande) en FLORES+ y 2,64 puntos frente al modelo de Firefox en el mismo conjunto. Su ventaja principal es el tamaño reducido, la licencia Apache 2.0 y la disponibilidad de builds para CPU, CTranslate2 y navegador.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo destilado de IndicTrans2, podría heredar sesgos de su profesor, pero no se detallan.
- Riesgo de alucinación: en traducción automática, el riesgo se manifiesta como traducciones incorrectas o invenciones ante frases ambiguas, especialmente en textos largos o dominios especializados; los autores señalan que las salidas mostradas son sin editar e incluyen errores.
- Limitaciones de contexto e idioma: entrada limitada a 127 piezas SentencePiece por frase; es necesario dividir párrafos en frases antes de la traducción. Solo traduce inglés → hindi; no soporta otras direcciones ni lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de los datos de destilación (IndicTrans2 y IndicCorpV2) para usos concretos.
- Caveats para producción: la decodificación evaluada es greedy (num_beams=1); beam search no fue probado. Las traducciones de ejemplo no han sido revisadas por hablantes nativos. El modelo no soporta tool calling, agentes ni razonamiento multi-paso. El rendimiento en dominios especializados (legal, médico, técnico) no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/udgamlabs/Paar-en-hi
- Demo en navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning (GitHub): https://github.com/udgamlabs/paar
- Modelos hermanos (en → bn, mr, te, ta, gu, ur, kn, ml, pa, or, as): disponibles en la misma organización de Hugging Face (https://huggingface.co/udgamlabs)
- Dataset citado: ai4bharat/IndicCorpV2
- Paper de referencia citado en los tags: arXiv:2305.16307
