# udgamlabs/Paar-en-mr

## Resumen

Paar English → Marathi es un modelo de traducción automática neuronal especializado en la dirección inglés-marathi (devanagari), desarrollado por Udgam Labs. Se trata de un modelo Marian de 17,3 millones de parámetros, destilado a partir de IndicTrans2 dist-200M, que traduce frases en inglés al marathi con un tamaño reducido que le permite ejecutarse íntegramente en CPU, de forma offline, e incluso en un navegador web mediante transformers.js. Con pesos en int8 ocupa 17,7 MB (19,8 MB incluyendo el vocabulario) y procesa una frase en aproximadamente 31 ms en un solo núcleo de un Mac mini.

El modelo forma parte de una familia de doce pares inglés-lengua índica (hindi, bengalí, marathi, telugu, tamil, gujarati, urdu, kannada, malayalam, punjabi, odia y assamés). Su propuesta de valor es clara: ofrecer traducción de calidad razonable en entornos con recursos muy limitados, sin dependencia de GPU ni de conectividad, lo que lo hace idóneo para aplicaciones de escritorio, extensiones de navegador o dispositivos embebidos. Frente a alternativas mucho mayores, cede entre 0,66 y 1,52 puntos de chrF++ respecto a indicMT (153,8M) y entre 3,05 y 3,14 respecto al modelo offline de Firefox (31,6 MB) en FLORES+ e IN22-Conv.

La relevancia actual del modelo radica en su relación tamaño-calidad: con una huella de menos de 20 MB y licencia Apache 2.0, cubre un nicho de traducción inglés-marathi que habitualmente exige modelos de cientos de millones de parámetros. No obstante, sus resultados no han sido revisados por hablantes nativos y el modelo está pensado para una frase por entrada, con entradas truncadas a 127 piezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 17.170.688 (17,3M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entradas truncadas a 127 piezas; `max_length=128` en tokenizador; `max_new_tokens=200` en generación |
| Tipos de cuantizacion | fp32 (pesos originales), int8 (CTranslate2), int8/q8 (ONNX para transformers.js) |
| Idiomas soportados | inglés (en) y marathi (mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, CTranslate2 (ct2-int8) |

## Arquitectura y entrenamiento

Paar English → Marathi emplea la arquitectura Marian, un transformer encoder-decoder estándar para traducción automática, con 17,3 millones de parámetros totales. El modelo fue destilado a partir de IndicTrans2 dist-200M (211,8M parámetros): aprendió a partir de frases en inglés que IndicTrans2 dist-200M había traducido al marathi, lo que constituye una destilación de conocimiento desde un modelo profesor mucho mayor hacia un estudiante compacto. El dataset de referencia citado en la model card es ai4bharat/IndicCorpV2, si bien no se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del corpus.

El modelo se distribuye en tres formatos: los pesos originales en safetensors para Transformers (fp32), una build int8 para CTranslate2 orientada a CPU y una build ONNX int8 para transformers.js. La build CTranslate2 int8 se sitúa a 0,06 chrF++ de los pesos fp32 en FLORES+, con un 69% de traducciones idénticas palabra por palabra; la build ONNX int8 queda a 0,08 chrF++ de los pesos fp32 en ambos conjuntos de test. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

## Capacidades

- Traducción de texto inglés → marathi (devanagari), con salida en una sola dirección.
- Ejecución offline en CPU, sin GPU ni conexión a red.
- Inferencia en navegador web y Node.js mediante transformers.js (build ONNX int8, 28,8 MB descargados una sola vez).
- Despliegue en CPU de altas prestaciones mediante CTranslate2 con cuantización int8.
- Procesamiento de una frase por entrada, con truncado a 127 piezas; requiere dividir párrafos en frases previamente.
- Decodificación greedy (`num_beams=1`) como configuración evaluada; la búsqueda por haz (beam search) no fue probada según la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del par (inglés y marathi).

## Casos de uso

- Traducción integrada en extensiones de navegador: el modelo ONNX int8 se ejecuta con transformers.js en el propio navegador, permitiendo traducir contenido inglés a marathi sin enviar texto a servidores externos y preservando la privacidad del usuario.
- Aplicaciones de escritorio offline para hablantes de marathi: herramientas de productividad, lectores de documentos o clientes de correo que traduzcan contenido en inglés al marathi en local, aprovechando los 31 ms por frase en CPU de un solo núcleo.
- Atención al cliente automatizada en marathi: el modelo puede traducir respuestas o mensajes en inglés a marathi en tiempo real dentro de un chatbot, con la ventaja de que la inferencia en CPU abarata el despliegue en servidores modestos.
- Traducción de documentación técnica y manuales: para equipos que mantienen documentación en inglés y necesitan versiones en marathi, el modelo permite generar borradores automáticos que luego revisa un traductor humano, reduciendo el coste inicial.
- Localización de interfaces y contenido web: integración en pipelines de CI/CD que traduzcan cadenas de recursos (i18n) del inglés al marathi, con la build CTranslate2 int8 para procesamiento por lotes en servidores sin GPU.
- Dispositivos embebidos y de bajo consumo: al ocupar menos de 20 MB en int8 y funcionar en CPU, puede desplegarse en Raspberry Pi u otros equipos de recursos limitados para traducción puntual en kioscos o terminales de información.
- Herramientas educativas para el aprendizaje de idiomas: generación de traducciones de referencia al marathi para estudiantes de inglés, con la advertencia de que las salidas no han sido revisadas por hablantes nativos y pueden contener errores.

## Benchmarks y rendimiento

Resultados de chrF++ (mayor es mejor), con NFC en ambos lados, mismo conjunto de frases para todos los sistemas, decodificación greedy para Paar y para el modelo de Firefox, e int8 con beam 5 para indicMT. Las diferencias son emparejadas con 1.000 remuestreos bootstrap e intervalo de confianza del 95%. Medición realizada entre el 3 y el 16 de noviembre de 2026.

| Conjunto de test (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (31,6 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 48,02 | 48,68 (-0,66 [-1,15, -0,19]) | 50,79 | 51,07 (-3,05 [-3,50, -2,62]) |
| IN22-Conv (1.503) | 44,55 | 46,07 (-1,52 [-2,04, -0,96]) | 48,68 | 47,70 (-3,14 [-3,66, -2,60]) |
| IN22-Gen | 46,09 | no disponible | no disponible | no disponible |

La build int8 de CTranslate2 se sitúa a 0,06-0,07 chrF++ de los pesos fp32 en FLORES+, y la build ONNX int8 queda a 0,08 chrF++ de los pesos fp32 en ambos conjuntos. La comparación con Firefox, re-ejecutada sobre la build int8, arroja el mismo resultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo funciona en CPU. En int8 ocupa 17,7 MB (19,8 MB con vocabulario); la build ONNX int8 para navegador son 28,8 MB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU moderna podría ejecutarlo, pero no es su objetivo.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo núcleo: aproximadamente 31 ms por frase en un núcleo de un Mac mini.
- Opciones de despliegue: Transformers (PyTorch, fp32), CTranslate2 (int8, CPU), transformers.js (ONNX int8, navegador y Node.js).
- Latencia y throughput estimados: alrededor de 31 ms por frase en un núcleo de Mac mini con la build int8; no se dispone de datos de throughput por lotes en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | chrF++ FLORES+ | chrF++ IN22-Conv | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Paar English → Marathi | 17,3M | 127 piezas | 48,02 | 44,55 | Apache 2.0 | Hugging Face, CTranslate2, ONNX |
| indicMT | 153,8M | no disponible | 48,68 | 46,07 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8M | no disponible | 50,79 | 48,68 | no disponible | no disponible |
| Modelo offline de Firefox | 31,6 MB (tamaño de descarga) | no disponible | 51,07 | 47,70 | no disponible | Firefox |

Paar es el modelo más pequeño de la comparativa (17,3M parámetros) y, pese a ello, queda a menos de 1 punto de chrF++ de indicMT en FLORES+ y a 1,52 en IN22-Conv, con una diferencia de tamaño de aproximadamente 8,6 veces en descarga. Frente al modelo de Firefox, que es 1,6 veces más grande en descarga, cede 3,05 y 3,14 puntos respectivamente. Frente a su profesor IndicTrans2 dist-200M, la diferencia es de 2,77 y 4,13 puntos.

## Limitaciones y advertencias

- Las salidas de ejemplo de la model card son salidas sin editar, con errores incluidos, y ningún hablante nativo las ha revisado; la calidad real en producción puede variar.
- El modelo traduce únicamente de inglés a marathi; no soporta la dirección inversa ni otros pares de idiomas.
- Procesa una frase por entrada y trunca las entradas a 127 piezas; es necesario dividir párrafos en frases antes de la inferencia, lo que puede degradar la coherencia en textos largos.
- Solo se evaluó decodificación greedy (`num_beams=1`); el comportamiento con beam search no está documentado.
- La destilación desde IndicTrans2 dist-200M implica que hereda los sesgos y errores del modelo profesor, sin que se documenten evaluaciones específicas de sesgo en la información disponible.
- Riesgo de alucinación y de traducciones inexactas en frases ambiguas, modismos o terminología especializada; no se han publicado métricas de fidelidad más allá de chrF++.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni sobre la adecuación para dominios sensibles (médico, legal, financiero).
- No dispone de soporte para tool calling, agentes, visión, audio ni razonamiento multi-paso, por lo que no debe emplearse como modelo de propósito general.
- Los datos de benchmarks proceden del propio autor y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-mr
- Demo en navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning en GitHub: https://github.com/udgamlabs/paar
- Modelo hermano inglés → hindi: https://huggingface.co/udgamlabs/Paar-en-hi
- Modelo hermano inglés → bengalí: https://huggingface.co/udgamlabs/Paar-en-bn
- Modelo hermano inglés → telugu: https://huggingface.co/udgamlabs/Paar-en-te
- Modelo hermano inglés → tamil: https://huggingface.co/udgamlabs/Paar-en-ta
- Modelo hermano inglés → gujarati: https://huggingface.co/udgamlabs/Paar-en-gu
- Modelo hermano inglés → urdu: https://huggingface.co/udgamlabs/Paar-en-ur
- Modelo hermano inglés → kannada: https://huggingface.co/udgamlabs/Paar-en-kn
- Modelo hermano inglés → malayalam: https://huggingface.co/udgamlabs/Paar-en-ml
- Modelo hermano inglés → punjabi: https://huggingface.co/udgamlabs/Paar-en-pa
- Modelo hermano inglés → odia: https://huggingface.co/udgamlabs/Paar-en-or
- Modelo hermano inglés → assamés: https://huggingface.co/udgamlabs/Paar-en-as
- Dataset de referencia: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper citado (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
