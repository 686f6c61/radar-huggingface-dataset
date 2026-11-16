# udgamlabs/Paar-en-bn

## Resumen

Paar English → Bengali es un modelo de traducción automática neuronal especializado en la dirección inglés → bengalí, desarrollado por Udgam Labs. Con 17,17 millones de parámetros, es un modelo compacto de tipo MarianMT (transformer encoder-decoder) diseñado para ejecutarse íntegramente en CPU, en el navegador o en dispositivos sin GPU, manteniendo una calidad competitiva frente a sistemas mucho más grandes.

El modelo se obtuvo por destilación a partir de IndicTrans2, del que aprendió a partir de frases en inglés traducidas por el modelo dist-200M de IndicTrans2. Se distribuye en tres formatos: pesos originales en safetensors para Transformers, una build cuantizada a int8 en CTranslate2 y una build ONNX int8 para transformers.js, lo que permite su uso en entornos web y Node.js sin conexión.

Su relevancia radica en la relación entre tamaño y rendimiento: con 17,7 MB en int8, se sitúa a 0,93 chrF++ por debajo del modelo offline de Firefox en FLORES+ pero 1,32 por encima en IN22-Conv (conversación cotidiana), y queda a 0,58 y 2,33 puntos respectivamente de indicMT, un modelo 8,6 veces mayor. Es uno de los doce modelos de la familia Paar para traducción inglés → lenguas índicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parámetros totales | 17.170.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | entradas truncadas a 127 piezas SentencePiece; salida hasta 200 tokens |
| Tipos de cuantización | fp32 (pesos originales), int8 (CTranslate2), int8 (ONNX para transformers.js) |
| Idiomas soportados | inglés (en) y bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, CTranslate2 int8, ONNX int8 |

## Arquitectura y entrenamiento

Paar English → Bengali emplea la arquitectura MarianMT, un transformer encoder-decoder clásico para traducción automática, con tokenización mediante SentencePiece. El modelo cuenta con 17,17 millones de parámetros y se entrenó mediante destilación a partir de IndicTrans2: aprendió de frases en inglés que el modelo IndicTrans2 dist-200M había traducido previamente. El conjunto de datos de referencia citado en la model card es ai4bharat/IndicCorpV2.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que las entradas se truncan a 127 piezas y que la decodificación evaluada fue greedy (num_beams=1), sin que se hayan probado variantes con beam search. La build CTranslate2 int8 se desvía 0,06 chrF++ respecto a los pesos fp32 en FLORES+, con un 75% de traducciones idénticas palabra por palabra; la build ONNX int8 queda a 0,08 chrF++ de los pesos fp32 en ambos conjuntos de test.

## Capacidades

- Traducción de texto inglés → bengalí (escritura bengalí) a nivel de frase.
- Ejecución offline en CPU convencional: aproximadamente 31 ms por frase en un núcleo de un Mac mini.
- Ejecución en navegador web mediante transformers.js con la build ONNX int8 (28,8 MB de descarga única).
- Integración en pipelines de Python con Transformers (MarianMTModel/MarianTokenizer) y con CTranslate2.
- Uso en Node.js mediante transformers.js.
- Modelo compacto (17,7 MB en int8) adecuado para entornos con memoria y cómputo limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de interfaz de usuario en aplicaciones web: la build ONNX int8 permite traducir cadenas de inglés a bengalí directamente en el navegador del usuario, sin enviar datos a un servidor y con una descarga única de 28,8 MB.
- Traducción de correos y mensajes de atención al cliente: el modelo rinde mejor que el modelo offline de Firefox en IN22-Conv (44,88 frente a 43,57 chrF++), lo que lo hace adecuado para texto conversacional cotidiano.
- Procesamiento por lotes en servidores sin GPU: con CTranslate2 int8 y 31 ms por frase en un solo núcleo de CPU, puede traducir grandes volúmenes de frases en infraestructura convencional.
- Traducción de documentación técnica y noticias: aunque en FLORES+ queda por debajo de alternativas mayores, su calidad de 50,41 chrF++ es suficiente para textos informativos con revisión posterior.
- Aplicaciones móviles o de escritorio offline: el tamaño reducido del modelo permite empaquetarlo en aplicaciones que deben funcionar sin conexión.
- Preprocesamiento en pipelines multilingües: puede actuar como primer paso de traducción al bengalí antes de otras tareas de procesamiento de lenguaje natural.
- Prototipado rápido y experimentación: su licencia Apache 2.0 y su facilidad de despliegue en CPU facilitan la integración en pruebas de concepto y proyectos de investigación.

## Benchmarks y rendimiento

Resultados en chrF++ (mayor es mejor), según la model card, medidos entre el 3 y el 16 de noviembre de 2026 con el mismo conjunto de frases para todos los sistemas. Las diferencias son pareadas con intervalos de confianza al 95% (1.000 remuestreos bootstrap).

| Conjunto de test (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (17,1 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 50,41 | 50,99 (-0,58 [-1,04, -0,12]) | 53,11 | 51,34 (-0,93 [-1,41, -0,43]) |
| IN22-Conv (1.503) | 44,88 | 47,21 (-2,33 [-2,93, -1,76]) | 48,90 | 43,57 (+1,32 [+0,72, +1,97]) |

Dato adicional: IN22-Gen 47,08 (métrica de frases en las que todos los números se conservan).

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- Memoria RAM: el modelo int8 ocupa 17,7 MB (19,8 MB con vocabulario); la build ONNX int8 para navegador son 28,8 MB.
- GPU recomendadas: no aplica; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica, al ser un modelo de CPU.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 (int8), transformers.js (ONNX int8) en navegador o Node.js.
- Latencia estimada: aproximadamente 31 ms por frase en un núcleo de un Mac mini (build CTranslate2 int8).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / uso | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Paar English → Bengali | 17,3M | Frase a frase, CPU/navegador | 50,41 | 44,88 | Apache 2.0 | Hugging Face, GitHub, Space |
| indicMT | 153,8M | Frase a frase | 50,99 | 47,21 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8M | Frase a frase | 53,11 | 48,90 | no disponible | no disponible |
| Modelo offline de Firefox | 17,1 MB | Frase a frase, offline | 51,34 | 43,57 | no disponible | Integrado en Firefox |

## Limitaciones y advertencias

- Traducción limitada a nivel de frase: es necesario dividir los párrafos en frases antes de la traducción; las entradas se truncan a 127 piezas.
- Solo admite la dirección inglés → bengalí; no traduce al inglés ni entre otras lenguas.
- La decodificación evaluada es greedy (num_beams=1); no se probó beam search, por lo que el rendimiento con otras estrategias de decodificación es desconocido.
- En FLORES+ (texto tipo noticias) queda por debajo del modelo offline de Firefox (-0,93 chrF++) y de indicMT (-0,58).
- Las salidas de ejemplo de la model card no han sido revisadas por hablantes nativos y contienen errores.
- No se documentan sesgos específicos, pero al ser un modelo destilado de IndicTrans2 puede heredar los sesgos de los datos de entrenamiento de origen (IndicCorpV2).
- Riesgo de alucinación no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- No se han publicado resultados sobre tool calling, agentes ni otras capacidades más allá de la traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-bn
- Demo en el navegador (Space): https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning en GitHub: https://github.com/udgamlabs/paar
- Modelos de la familia Paar (inglés → lenguas índicas): https://huggingface.co/udgamlabs/Paar-en-hi, https://huggingface.co/udgamlabs/Paar-en-mr, https://huggingface.co/udgamlabs/Paar-en-te, https://huggingface.co/udgamlabs/Paar-en-ta, https://huggingface.co/udgamlabs/Paar-en-gu, https://huggingface.co/udgamlabs/Paar-en-ur, https://huggingface.co/udgamlabs/Paar-en-kn, https://huggingface.co/udgamlabs/Paar-en-ml, https://huggingface.co/udgamlabs/Paar-en-pa, https://huggingface.co/udgamlabs/Paar-en-or, https://huggingface.co/udgamlabs/Paar-en-as
- Dataset de referencia: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper citado en los tags (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
