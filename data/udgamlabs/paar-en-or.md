# udgamlabs/Paar-en-or

## Resumen

Paar English → Odia es un modelo de traducción automática neuronal especializado en la dirección inglés → odia (oriya), desarrollado por Udgam Labs. Se trata de un modelo Marian de 17,3 millones de parámetros, destilado a partir de IndicTrans2, que traduce frases en inglés a odia con un tamaño reducido que permite su ejecución offline en CPU convencional, en el navegador mediante transformers.js o en entornos con recursos limitados. Forma parte de una familia de doce modelos que cubren la traducción del inglés a las principales lenguas de la India.

El modelo resuelve el problema de la traducción de alta calidad en un idioma de bajos recursos como el odia con un coste computacional mínimo: el archivo int8 ocupa 17,7 MB (19,7 MB con vocabulario) y procesa una frase en aproximadamente 31 ms por núcleo de CPU. Su relevancia actual radica en que habilita traducción offline en navegador (Firefox no dispone de modelo inglés-odia nativo) y en dispositivos sin GPU, manteniendo una calidad competitiva frente a modelos hasta 8,6 veces más grandes en términos de descarga.

La arquitectura es un transformer encoder-decoder de tipo Marian, con un vocabulario compartido basado en SentencePiece y un contexto de 127 piezas por frase. El modelo se distribuye en formatos safetensors, CTranslate2 int8 y ONNX int8, con licencia Apache 2.0, lo que facilita su integración en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 17.170.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 127 piezas de SentencePiece por frase (entrada truncada) |
| Tipos de cuantizacion | fp32 (pesos originales), int8 (CTranslate2 y ONNX) |
| Idiomas soportados | inglés (en), odia (or) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, CTranslate2 int8, ONNX int8 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder estándar para traducción automática, con tokenización mediante SentencePiece y vocabulario compartido entre origen y destino. Consta de 17,3 millones de parámetros, un tamaño deliberadamente reducido que prioriza la eficiencia en inferencia sobre la capacidad bruta.

El entrenamiento se realizó mediante destilación a partir de IndicTrans2 dist-200M (211,8 millones de parámetros): el modelo aprendió de frases en inglés que el modelo profesor tradujo al odia, utilizando el corpus ai4bharat/IndicCorpV2 como fuente de datos. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La decodificación evaluada es greedy (`num_beams=1`); no se probó beam search. Se ofrecen builds optimizados: CTranslate2 int8 (pérdida de 0,01 chrF++ respecto a fp32 en FLORES+) y ONNX int8 (dentro de 0,02 chrF++ en ambos conjuntos de test).

## Capacidades

- Traducción de texto de inglés a odia, una frase por entrada.
- Ejecución offline en CPU sin GPU, con latencia de aproximadamente 31 ms por frase en un núcleo.
- Ejecución en navegador mediante transformers.js con el build ONNX int8 (28,8 MB descargados una vez).
- Integración en pipelines de producción mediante CTranslate2 con procesamiento por lotes (aproximadamente 214 frases por segundo en cuatro hilos).
- Soporte de la librería transformers con `MarianMTModel` y `MarianTokenizer`.
- Capacidad de traducción de frases con números y entidades (conservación de números: 94,9% en FLORES+, 92,8% en IN22-Conv).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades generativas generales; es un modelo exclusivamente de traducción.

## Casos de uso

- Traducción offline en aplicaciones de escritorio: el modelo puede empaquetarse en una aplicación local que traduzca texto inglés a odia sin conexión, gracias a sus 17,7 MB en int8 y su ejecución en CPU.
- Traducción en navegador web: mediante transformers.js y el build ONNX int8, se puede ofrecer traducción inglés-odia directamente en el cliente, sin enviar datos a un servidor, útil para privacidad y para regiones con conectividad limitada.
- Localización de contenidos para el mercado odia: traducción por lotes de documentación, artículos o interfaces de usuario, con un throughput de aproximadamente 214 frases por segundo en cuatro hilos.
- Atención al cliente automatizada en odia: integración en sistemas de chat que reciban mensajes en inglés y los traduzcan a odia para agentes o usuarios, con latencia de decenas de milisegundos por frase.
- Procesamiento de correo electrónico y mensajes: traducción de comunicaciones empresariales frase a frase, con conservación de números (más del 92%) para datos como fechas, importes o referencias.
- Investigación en traducción automática de bajos recursos: modelo de referencia pequeño para experimentos de destilación, cuantización y evaluación en lenguas indias, con receta de fine-tuning disponible en GitHub.
- Traducción en dispositivos embebidos o de gama baja: al caber en 19,7 MB y ejecutarse en un solo núcleo de CPU, es adecuado para Raspberry Pi u otros dispositivos con recursos muy limitados.

## Benchmarks y rendimiento

Resultados de chrF++ (mayor es mejor), medidos del 3 al 16 de noviembre de 2026, con decodificación greedy para Paar y Firefox, y beam 5 para indicMT int8. Las diferencias son pareadas con intervalos de confianza del 95% (1.000 remuestreos bootstrap).

| Conjunto de test (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) |
|---|---:|---:|---:|
| FLORES+ devtest (1.012) | 46,40 | 50,24 (-3,85 [-4,35, -3,29]) | 47,63 |
| IN22-Conv (1.503) | 36,37 | 41,19 (-4,82 [-5,26, -4,30]) | 34,80 |

Datos adicionales:
- IN22-Gen: 39,31 chrF++ para Paar.
- Conservación de números: 94,9% en FLORES+ y 92,8% en IN22-Conv.
- El build CTranslate2 int8 queda a 0,01 chrF++ de los pesos fp32 en FLORES+, con un 76% de traducciones idénticas palabra por palabra.
- El build ONNX int8 queda dentro de 0,02 chrF++ de fp32 en ambos conjuntos.
- Velocidad: aproximadamente 31 ms por frase en un hilo de CPU (Mac mini, CTranslate2 int8, mediana); aproximadamente 214 frases por segundo en cuatro hilos con procesamiento por lotes.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para CPU. En fp32 ocupa aproximadamente 68 MB en memoria; en int8, 17,7 MB (19,7 MB con vocabulario).
- GPU recomendadas: no aplica; el modelo no está pensado para GPU. Cualquier GPU podría ejecutarlo, pero no aporta ventaja frente a CPU.
- GPU de consumo: no es necesario; cabe holgadamente en cualquier CPU moderna, incluidos dispositivos de gama baja.
- Opciones de despliegue: transformers (PyTorch), CTranslate2 (int8, CPU), transformers.js (ONNX int8, navegador o Node).
- Latencia y throughput: aproximadamente 31 ms por frase en un hilo de CPU; aproximadamente 214 frases por segundo en cuatro hilos con CTranslate2 int8 y procesamiento por lotes.
- En navegador: descarga única de 28,8 MB (ONNX int8).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Paar English → Odia | 17,3M | 127 piezas | 46,40 | 36,37 | Apache 2.0 | Hugging Face, CTranslate2, ONNX |
| indicMT | 153,8M | no disponible | 50,24 | 41,19 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8M | no disponible | 47,63 | 34,80 | no disponible | no disponible |

Paar es entre 8,6 y 12 veces más pequeño que los modelos comparados. Frente a indicMT pierde 3,85 chrF++ en FLORES+ y 4,82 en IN22-Conv, pero supera a IndicTrans2 dist-200M en IN22-Conv (36,37 frente a 34,80) y queda por debajo en FLORES+ (46,40 frente a 47,63). Su ventaja principal es el tamaño y la capacidad de ejecución offline en CPU y navegador.

## Limitaciones y advertencias

- Calidad inferior a indicMT en ambos conjuntos de evaluación (diferencias de 3,85 y 4,82 chrF++), aunque con un tamaño mucho menor.
- Procesa una sola frase por entrada; es necesario dividir párrafos en frases antes de traducir. Las entradas se truncan a 127 piezas.
- Solo se evaluó decodificación greedy; no se probó beam search, por lo que se desconoce su efecto en la calidad.
- Las salidas de ejemplo de la model card no han sido revisadas por hablantes nativos y contienen errores.
- Riesgo de alucinación y de errores en frases largas o con estructuras complejas, propio de un modelo de 17,3M de parámetros.
- No se especifican sesgos conocidos en la información disponible; al estar destilado de IndicTrans2, podría heredar sesgos de ese modelo y de IndicCorpV2.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero se recomienda verificar las condiciones de los datos de entrenamiento (IndicCorpV2) para usos concretos.
- No soporta otras tareas generativas (resumen, diálogo, código); su uso está limitado a traducción inglés-odia.
- El modelo no ha sido evaluado con hablantes nativos ni en dominios especializados (médico, legal, técnico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-or
- Demo en navegador: https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning: https://github.com/udgamlabs/paar
- Modelos hermanos de la familia Paar: https://huggingface.co/udgamlabs/Paar-en-hi, https://huggingface.co/udgamlabs/Paar-en-bn, https://huggingface.co/udgamlabs/Paar-en-mr, https://huggingface.co/udgamlabs/Paar-en-te, https://huggingface.co/udgamlabs/Paar-en-ta, https://huggingface.co/udgamlabs/Paar-en-gu, https://huggingface.co/udgamlabs/Paar-en-ur, https://huggingface.co/udgamlabs/Paar-en-kn, https://huggingface.co/udgamlabs/Paar-en-ml, https://huggingface.co/udgamlabs/Paar-en-pa, https://huggingface.co/udgamlabs/Paar-en-as
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper de referencia (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
