# udgamlabs/Paar-en-ml

## Resumen

Paar English → Malayalam es un modelo de traducción automática neuronal especializado en la dirección inglés → malayalam, desarrollado por Udgam Labs. Con 17,17 millones de parámetros, es un modelo de arquitectura Marian (transformer encoder-decoder) destilado a partir de IndicTrans2 dist-200M, entrenado sobre frases en inglés que el modelo profesor tradujo al malayalam. Forma parte de una familia de doce modelos que cubren otras tantas lenguas índicas.

Su relevancia radica en la eficiencia: el build int8 ocupa 17,7 MB (20,0 MB con vocabulario) y se ejecuta íntegramente en CPU, con una latencia de unos 31 ms por frase en un solo núcleo de un Mac mini. Además, dispone de builds en CTranslate2 int8 y ONNX int8 para transformers.js, lo que permite desplegarlo en el navegador sin conexión.

El modelo está pensado para traducción frase a frase de textos de tipo noticioso y conversacional, y compite directamente con el modelo offline de Firefox para inglés → malayalam, de tamaño similar, y con indicMT, unas 8,4 veces mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 17.170.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entradas truncadas a 127 piezas SentencePiece; `max_new_tokens` de hasta 200 en generación |
| Tipos de cuantizacion | fp32 (pesos originales), int8 (CTranslate2), int8/q8 (ONNX para transformers.js) |
| Idiomas soportados | inglés (en) y malayalam (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, CTranslate2 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder clásico para traducción automática, con tokenizador SentencePiece. Cuenta con 17,3 millones de parámetros y fue destilado de IndicTrans2 dist-200M (211,8 millones de parámetros): el alumno aprendió a partir de frases en inglés que el profesor tradujo al malayalam, lo que reduce drásticamente el tamaño manteniendo parte de la calidad del profesor.

El dataset de referencia declarado es ai4bharat/IndicCorpV2. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles. La decodificación empleada en la evaluación es greedy (`num_beams=1`); la búsqueda por haz (beam search) no fue probada.

## Capacidades

- Traducción de texto inglés → malayalam, una frase por entrada.
- Ejecución offline en CPU sin GPU, con latencia de ~31 ms por frase en un núcleo de Mac mini.
- Despliegue en navegador y Node.js mediante transformers.js (build ONNX int8).
- Inferencia rápida en CPU con CTranslate2 int8.
- Manejo de texto noticioso (FLORES+) y conversacional (IN22-Conv).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento.

## Casos de uso

- Traducción de contenido editorial y noticias al malayalam: el modelo obtiene 52,64 chrF++ en FLORES+ (texto tipo noticioso), por lo que es adecuado para pre-traducir artículos que después revisa un editor humano.
- Localización de interfaces y documentación de producto: al ser un modelo de 17,7 MB en int8, puede incrustarse en aplicaciones de escritorio o móviles para traducir cadenas de UI sin conexión.
- Traducción en el navegador sin servidor: con el build ONNX int8 (28,9 MB descargados una sola vez) se puede ofrecer traducción inglés → malayalam en una web estática mediante transformers.js, sin enviar texto a ningún backend.
- Atención al cliente en malayalam: traducción de mensajes conversacionales (35,59 chrF++ en IN22-Conv) en sistemas de soporte que reciben consultas en inglés y responden en malayalam.
- Procesamiento por lotes de bajo coste: con CTranslate2 int8 en CPU se pueden traducir grandes volúmenes de frases en servidores sin GPU, a ~31 ms por frase y núcleo.
- Herramientas de accesibilidad y lectura: traducción al vuelo de correos, mensajes o subtítulos en inglés para hablantes de malayalam en entornos con conectividad limitada.
- Preprocesamiento para pipelines de NLP en lenguas índicas: generar corpus paralelos inglés-malayalam de forma masiva y económica antes de un ajuste fino posterior.

## Benchmarks y rendimiento

chrF++ (mayor es mejor), NFC en ambos lados, mismo conjunto de frases para todos los sistemas. Los del modelo propio con decodificación greedy; indicMT int8 con beam 5; el modelo offline de Firefox con greedy. Las diferencias son pareadas con 1.000 remuestreos bootstrap e intervalo de confianza del 95 %, medidas entre el 3 y el 16 de noviembre de 2026.

| Conjunto de prueba (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (17,1 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 52,64 | 52,22 (+0,42 [-0,07, +0,94]) | 55,71 | 53,38 (-0,74 [-1,28, -0,17]) |
| IN22-Conv (1.503) | 35,59 | 38,22 (-2,63 [-3,08, -2,22]) | no disponible en el extracto | no disponible en el extracto |

El build CTranslate2 int8 se sitúa a 0,04 chrF++ de los pesos fp32 en FLORES+, con un 76 % de traducciones idénticas palabra por palabra. El build ONNX int8 está a menos de 0,05 chrF++ de fp32 en ambos conjuntos. La comparación con Firefox re-ejecutada sobre el build int8 da el mismo resultado.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo fp32 ocupa unos 68 MB en memoria y el int8 unos 17,7 MB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos de gama baja; también en navegador.
- Despliegue: transformers (PyTorch), CTranslate2 int8, ONNX Runtime y transformers.js (navegador y Node.js).
- Latencia: ~31 ms por frase en un núcleo de Mac mini (build CTranslate2 int8). Throughput no disponible más allá de esa cifra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Paar English → Malayalam | 17,3M | 127 piezas | 52,64 | 35,59 | Apache 2.0 | Hugging Face, CTranslate2, ONNX |
| indicMT | 153,8M | no disponible | 52,22 | 38,22 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8M | no disponible | 55,71 | no disponible | no disponible | no disponible |
| Modelo offline de Firefox | 17,1 MB | no disponible | 53,38 | no disponible | no disponible | integrado en Firefox |

## Limitaciones y advertencias

- Traduce únicamente de inglés a malayalam; no soporta la dirección inversa ni otras lenguas.
- Procesa una frase por entrada: es necesario segmentar los párrafos antes de traducir, y las entradas se truncan a 127 piezas.
- Calidad inferior a IndicTrans2 dist-200M en FLORES+ (52,64 frente a 55,71) y a indicMT en IN22-Conv (35,59 frente a 38,22).
- Los ejemplos de la model card son salidas sin editar, con errores incluidos, y ningún hablante nativo las ha revisado.
- Riesgo de alucinación y de traducciones literales en frases ambiguas o de dominio especializado; no se han publicado evaluaciones de sesgo.
- Beam search no fue evaluado; el rendimiento reportado corresponde a decodificación greedy.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni limitaciones adicionales por parte del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-ml
- Demo en el navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de ajuste fino: https://github.com/udgamlabs/paar
- Dataset de referencia: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper citado en los tags (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
- Modelos hermanos de la familia Paar: https://huggingface.co/udgamlabs/Paar-en-hi, https://huggingface.co/udgamlabs/Paar-en-bn, https://huggingface.co/udgamlabs/Paar-en-mr, https://huggingface.co/udgamlabs/Paar-en-te, https://huggingface.co/udgamlabs/Paar-en-ta, https://huggingface.co/udgamlabs/Paar-en-gu, https://huggingface.co/udgamlabs/Paar-en-ur, https://huggingface.co/udgamlabs/Paar-en-kn, https://huggingface.co/udgamlabs/Paar-en-pa, https://huggingface.co/udgamlabs/Paar-en-or, https://huggingface.co/udgamlabs/Paar-en-as
