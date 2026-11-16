# udgamlabs/Paar-en-kn

## Resumen
Paar English → Kannada es un modelo de traducción automática neuronal especializado en la dirección inglés → kannada, desarrollado por Udgam Labs. Con 17,17 millones de parámetros, se posiciona como una alternativa ultraligera que puede ejecutarse en CPU convencional e incluso en el navegador, sin necesidad de GPU ni conexión a internet. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para escenarios donde el coste computacional y la latencia son críticos.

La arquitectura subyacente es MarianMT (transformer encoder-decoder), la misma familia empleada por los modelos de traducción de Helsinki-NLP, y se ha destilado a partir de IndicTrans2 dist-200M. El resultado es un modelo de 17,7 MB en cuantización int8 que traduce una frase en aproximadamente 29 ms en un solo núcleo de CPU (Mac mini). Forma parte de una familia de doce modelos inglés → lengua índica publicados por el mismo autor.

Su relevancia radica en la combinación de tamaño mínimo, licencia permisiva y despliegue offline en navegador mediante transformers.js y ONNX. Los resultados publicados muestran que, pese a su reducido tamaño, compite de cerca con modelos hasta 8,5 veces más grandes en conjuntos de evaluación estándar como FLORES+ e IN22-Conv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 17.170.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada truncada a 127 piezas SentencePiece; salida hasta 200 tokens) |
| Tipos de cuantizacion | int8 (CTranslate2 y ONNX); pesos fp32 originales |
| Idiomas soportados | inglés (en) → kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, CTranslate2 |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura MarianMT, un transformer encoder-decoder con atención multi-cabeza estándar, tokenizador SentencePiece y generación autorregresiva. Se entrenó mediante destilación a partir de IndicTrans2 dist-200M: el modelo profesor tradujo frases en inglés y el modelo alumno aprendió de esas traducciones. El dataset de referencia citado es ai4bharat/IndicCorpV2, aunque la model card no detalla el número exacto de tokens de entrenamiento ni la composición precisa del corpus.

No se documenta el uso de RLHF ni DPO. La innovación principal no reside en la arquitectura, sino en la compresión extrema: 17,3 millones de parámetros que caben en 17,7 MB en int8, con una degradación mínima respecto a los pesos fp32 (0,03 chrF++ en FLORES+ para la build CTranslate2 int8, y dentro de 0,03 chrF++ para la build ONNX int8). La decodificación evaluada es greedy (`num_beams=1`); no se probó beam search.

## Capacidades
- Traducción de texto inglés → kannada, una frase por entrada.
- Ejecución offline en CPU sin GPU, con latencia de aproximadamente 29 ms por frase en un núcleo de Mac mini.
- Despliegue en navegador mediante transformers.js con pesos ONNX int8 (28,8 MB descargados una vez).
- Integración con CTranslate2 para inferencia int8 rápida en CPU.
- Compatible con la API de Transformers (`MarianMTModel` y `MarianTokenizer`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking).
- No dispone de capacidades de visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par inglés → kannada.

## Casos de uso
- Traducción de documentación técnica al kannada: el modelo puede procesar frases sueltas de manuales y guías, integrándose en un pipeline que divida párrafos en oraciones y las traduzca secuencialmente, con un coste computacional mínimo en servidores sin GPU.
- Localización de interfaces de usuario en aplicaciones web: al ejecutarse en el navegador con transformers.js, permite traducir dinámicamente cadenas de texto en el cliente sin enviar datos a un servidor, preservando la privacidad del usuario.
- Atención al cliente en kannada: traducción de respuestas automatizadas o mensajes de soporte generados en inglés hacia kannada, con latencia inferior a 30 ms por frase en CPU, adecuada para respuestas en tiempo real.
- Procesamiento por lotes de corpus en investigación lingüística: al ser un modelo pequeño y con licencia Apache 2.0, puede desplegarse en clústeres de CPU para traducir grandes volúmenes de texto inglés a kannada sin coste de GPU.
- Traducción en dispositivos de borde (edge computing): su tamaño de 17,7 MB permite incluirlo en aplicaciones móviles o dispositivos embebidos con recursos limitados, traduciendo contenido localmente sin conectividad.
- Generación de subtítulos o transcripciones traducidas: integrado en un pipeline de ASR (reconocimiento automático del habla) en inglés, puede traducir cada segmento a kannada en tiempo real en CPU, habilitando subtitulado accesible en entornos con hardware modesto.

## Benchmarks y rendimiento
Los resultados publicados en la model card emplean chrF++ (mayor es mejor), con NFC en ambos lados, el mismo conjunto de frases para todos los sistemas y decodificación greedy para Paar. Las diferencias son pareadas con intervalos de confianza al 95% (1.000 remuestreos bootstrap), medidas entre el 3 y el 16 de noviembre de 2026.

| Conjunto de prueba (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (17,1 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 51,93 | 51,65 (+0,28 [-0,17, +0,71]) | 54,84 | 53,14 (-1,21 [-1,61, -0,77]) |
| IN22-Conv (1.503) | 30,29 | 31,66 (-1,37 [-1,68, -1,07]) | 32,38 | 30,64 (-0,34 [-0,63, -0,01]) |

Dato adicional: IN22-Gen = 44,91 (el resto de cifras de IN22-Gen no están disponibles en la información proporcionada). La build int8 de CTranslate2 se sitúa a 0,03 chrF++ de los pesos fp32 en FLORES+, con un 79% de traducciones idénticas palabra por palabra. La build ONNX int8 está dentro de 0,03 chrF++ de fp32 en ambos conjuntos.

## Requisitos de hardware
- VRAM estimada para inferencia: no requiere GPU; el modelo fp32 ocupa aproximadamente 68 MB en memoria y la build int8 alrededor de 17,7 MB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no es necesario.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 (int8), ONNX Runtime / transformers.js (navegador y Node), y potencialmente llama.cpp no aplica (no es un modelo GGUF).
- Latencia y throughput: aproximadamente 29 ms por frase en un núcleo de Mac mini (CPU). No se dispone de datos de throughput por lote ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Paar en-kn | 17,3M | no disponible (truncado a 127 piezas) | 51,93 | 30,29 | Apache 2.0 | Hugging Face, GitHub, demo en Spaces |
| indicMT | 153,8M | no disponible | 51,65 | 31,66 | no disponible | Hugging Face |
| IndicTrans2 dist-200M | 211,8M | no disponible | 54,84 | 32,38 | no disponible | Hugging Face |
| Modelo offline de Firefox (en-kn) | 17,1 MB (aprox. 17M) | no disponible | 53,14 | 30,64 | no disponible | Integrado en Firefox |

## Limitaciones y advertencias
- El modelo solo traduce inglés → kannada; no soporta la dirección inversa ni otros pares de idiomas.
- Procesa una frase por entrada; es necesario dividir párrafos en oraciones antes de la inferencia, y las entradas se truncan a 127 piezas SentencePiece.
- La decodificación evaluada es greedy; no se probó beam search, por lo que el rendimiento con otras estrategias de decodificación es desconocido.
- Los ejemplos de traducción mostrados en la model card son salidas sin editar, con errores incluidos, y no han sido revisados por un hablante nativo.
- Riesgo de alucinación y errores en frases largas o complejas, especialmente en dominios especializados.
- No se documentan sesgos específicos, pero al ser destilado de IndicTrans2 y entrenado sobre IndicCorpV2, puede heredar sesgos presentes en esos datos.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre la calidad de las traducciones en producción.
- El modelo no dispone de mecanismos de seguridad o filtrado de contenido; la salida debe validarse en aplicaciones sensibles.

## Enlaces
- Hugging Face: https://huggingface.co/udgamlabs/Paar-en-kn
- Demo en el navegador: https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning: https://github.com/udgamlabs/paar
- Modelo hermano inglés → hindi: https://huggingface.co/udgamlabs/Paar-en-hi
- Modelo hermano inglés → bengalí: https://huggingface.co/udgamlabs/Paar-en-bn
- Modelo hermano inglés → maratí: https://huggingface.co/udgamlabs/Paar-en-mr
- Modelo hermano inglés → telugu: https://huggingface.co/udgamlabs/Paar-en-te
- Modelo hermano inglés → tamil: https://huggingface.co/udgamlabs/Paar-en-ta
- Modelo hermano inglés → gujarati: https://huggingface.co/udgamlabs/Paar-en-gu
- Modelo hermano inglés → urdu: https://huggingface.co/udgamlabs/Paar-en-ur
- Modelo hermano inglés → malayalam: https://huggingface.co/udgamlabs/Paar-en-ml
- Modelo hermano inglés → punyabí: https://huggingface.co/udgamlabs/Paar-en-pa
- Modelo hermano inglés → odia: https://huggingface.co/udgamlabs/Paar-en-or
- Modelo hermano inglés → asamés: https://huggingface.co/udgamlabs/Paar-en-as
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper de referencia (arxiv:2305.16307): https://arxiv.org/abs/2305.16307
