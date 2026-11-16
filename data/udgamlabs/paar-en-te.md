# udgamlabs/Paar-en-te

## Resumen
Paar English → Telugu es un modelo de traducción automática neuronal especializado en el par inglés-telugu, desarrollado por Udgam Labs. Se trata de un modelo Marian de 17,3 millones de parámetros (17.170.688 según los pesos en safetensors) diseñado explícitamente para inferencia ligera: el build int8 ocupa 17,7 MB y puede ejecutarse en CPU convencional o directamente en el navegador mediante transformers.js. Su relevancia radica en el compromiso entre calidad y huella: ofrece traducción offline en entornos sin GPU, algo crítico para aplicaciones en dispositivos y despliegues web.

El modelo fue destilado a partir de IndicTrans2 dist-200M (211,8M parámetros), aprendiendo de traducciones generadas por ese sistema sobre oraciones en inglés. Con 17,3M de parámetros se sitúa en la misma liga que el modelo offline de Firefox (17,1 MB) y muy por debajo de alternativas como indicMT (153,8M). Forma parte de una familia de doce modelos inglés → lengua india (hindi, bengalí, maratí, telugu, tamil, guyaratí, urdu, kannada, malayalam, panyabí, odia y asamés).

La propuesta es clara: traducción de una sola frase por entrada, decodificación greedy, licencia Apache 2.0 y pesos disponibles en safetensors, ONNX y CTranslate2 int8. No es un modelo para traducción de documentos largos ni para contextos extensos, sino para integración en productos donde el coste por inferencia y el tamaño del binario son determinantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 17.170.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; entradas truncadas a 127 piezas SentencePiece, `max_length=128`, `max_new_tokens=200` en generación |
| Tipos de cuantizacion | fp32 (pesos originales), int8 (CTranslate2 y ONNX); otros tipos no disponibles |
| Idiomas soportados | inglés (en) → telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (int8, para transformers.js), CTranslate2 int8 |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Marian, un transformer encoder-decoder clásico para traducción automática, con tokenizador SentencePiece. Los pesos están en safetensors y el repositorio incluye además builds en ONNX int8 (para transformers.js, 28,8 MB descargados una vez en el navegador) y CTranslate2 int8 (build rápido para CPU). El tamaño total del repositorio es de 0,2 GB.

El entrenamiento se basa en destilación desde IndicTrans2 dist-200M: Paar aprendió a partir de oraciones en inglés que ese modelo mayor había traducido al telugu. El corpus de referencia citado es ai4bharat/IndicCorpV2. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La decodificación evaluada es greedy (`num_beams=1`); el beam search no fue probado según la model card.

## Capacidades
- Traducción de texto inglés → telugu, una frase por entrada.
- Ejecución offline en CPU: aproximadamente 30 ms por frase en un núcleo de un Mac mini según el autor.
- Ejecución en navegador mediante transformers.js con el build ONNX int8.
- Integración con CTranslate2 para despliegue de alto rendimiento en CPU.
- Preserva números en la mayoría de casos (métrica de "numbers kept" reportada sobre FLORES+ e IN22-Conv).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par en → te.

## Casos de uso
- Traducción en el navegador sin backend: con el build ONNX int8 (28,8 MB descargados una vez) se puede ofrecer traducción inglés-telugu en una web estática o extensión, sin enviar texto del usuario a un servidor, lo que reduce requisitos de privacidad y coste de infraestructura.
- Aplicaciones móviles y de escritorio offline: al ocupar 17,7 MB en int8 y ejecutarse en CPU, encaja en apps que necesitan traducción en zonas con conectividad limitada o en entornos air-gapped.
- Preprocesado y localización de contenido a granel: traducción de cadenas de interfaz, correos transaccionales o mensajes de soporte en pipelines batch donde el coste por frase importa más que la calidad máxima; requiere dividir previamente en frases.
- Atención al cliente en telugu: traducción de respuestas automáticas o de mensajes entrantes en un chatbot, con la salvedad de que el modelo no gestiona conversaciones multi-turno por sí mismo (habría que orquestar el contexto fuera).
- Prototipado rápido y evaluación de sistemas de traducción: por su tamaño y licencia Apache 2.0, sirve como baseline ligero o como componente de un sistema mayor antes de escalar a modelos de 200M+ parámetros.
- Integración en herramientas de accesibilidad o lectura: traducción al vuelo de fragmentos de texto seleccionados en un navegador, aprovechando la inferencia en cliente y la baja latencia (~30 ms/frase en CPU).

## Benchmarks y rendimiento
Resultados en chrF++ (mayor es mejor), con decodificación greedy para Paar y Firefox, e indicMT int8 con beam 5 según su model card. Diferencias pareadas con intervalos del 95% (1.000 remuestreos bootstrap), medidas entre el 3 y el 16 de noviembre de 2026.

| Test set (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (17,1 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 55,50 | 56,56 (-1,06 [-1,56, -0,59]) | 58,63 | 56,62 (-1,12 [-1,60, -0,61]) |
| IN22-Conv (1.503) | 40,94 | 42,62 (-1,68 [-2,18, -1,19]) | 44,69 | 40,21 (+0,73 [+0,26, +1,22]) |

Datos adicionales reportados: IN22-Gen 47,41. El build CTranslate2 int8 queda a 0,07 chrF++ de los pesos fp32 en FLORES+ (79% de traducciones idénticas palabra por palabra). El build ONNX int8 está a 0,11 chrF++ de fp32 en ambos conjuntos de test.

## Requisitos de hardware
- VRAM: no requiere GPU; el modelo está pensado para CPU. En fp32 el peso ronda los 69 MB (17,3M parámetros × 4 bytes); en int8, 17,7 MB.
- GPU recomendadas: no aplica; cualquier GPU moderna puede ejecutarlo, pero no es el escenario objetivo.
- Consumer GPU: irrelevante por tamaño; cabe en cualquier GPU de consumo e incluso en CPU de un solo núcleo.
- Despliegue: transformers (PyTorch), CTranslate2 (int8, CPU), ONNX Runtime vía transformers.js (navegador y Node), y potencialmente llama.cpp/Ollama no aplican por no ser un modelo GGUF.
- Latencia y throughput: ~30 ms por frase en un núcleo de Mac mini según el autor; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Paar en→te | 17,3M | en → te | 127 piezas por frase | Apache 2.0 | safetensors, ONNX, CTranslate2 | chrF++ 55,50 (FLORES+), 40,94 (IN22-Conv) |
| Modelo offline de Firefox | 17,1 MB | en → te | no disponible | no disponible en la información | no disponible | chrF++ 56,62 (FLORES+), 40,21 (IN22-Conv) |
| indicMT | 153,8M | en → te (entre otros) | no disponible | no disponible en la información | no disponible | chrF++ 56,56 (FLORES+), 42,62 (IN22-Conv) |
| IndicTrans2 dist-200M | 211,8M | lenguas indias | no disponible | no disponible en la información | no disponible | chrF++ 58,63 (FLORES+), 44,69 (IN22-Conv); modelo profesor de Paar |

## Limitaciones y advertencias
- Calidad inferior a modelos más grandes: queda 1,06 chrF++ por debajo de indicMT y 3,13 por debajo de IndicTrans2 dist-200M en FLORES+, y 1,68 / 3,75 en IN22-Conv.
- Frente al modelo offline de Firefox pierde 1,12 chrF++ en FLORES+ (texto periodístico) pero gana 0,73 en IN22-Conv (conversación cotidiana); el rendimiento depende del dominio.
- Una sola frase por entrada: es necesario dividir párrafos en frases; las entradas se truncan a 127 piezas, lo que puede cortar oraciones largas.
- No se probó beam search; la evaluación se hizo con decodificación greedy.
- Las salidas de ejemplo de la model card no fueron revisadas por hablantes nativos y contienen errores.
- Riesgo de alucinación y de traducciones literalmente incorrectas en frases ambiguas o con terminología especializada; no hay datos publicados sobre sesgos específicos.
- Idiomas limitados estrictamente a inglés → telugu; no soporta otras direcciones ni otros pares.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni limitaciones adicionales por parte del autor.
- Modelo recién publicado (16 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-te
- Demo en el navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning: https://github.com/udgamlabs/paar
- Dataset de referencia: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper citado en los tags (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
- Modelos hermanos de la familia Paar (en → hi, bn, mr, ta, gu, ur, kn, ml, pa, or, as): disponibles en https://huggingface.co/udgamlabs
