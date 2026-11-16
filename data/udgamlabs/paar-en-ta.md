# udgamlabs/Paar-en-ta

## Resumen

Paar English → Tamil es un modelo de traducción automática neuronal especializado en el par inglés-tamil, desarrollado por Udgam Labs. Con solo 17,17 millones de parámetros, es un modelo compacto basado en la arquitectura Marian (transformer encoder-decoder) que prioriza la eficiencia extrema: el archivo int8 ocupa 17,7 MB y puede ejecutarse offline en una CPU convencional a unos 30 ms por frase en un solo núcleo, o incluso dentro de un navegador web mediante transformers.js.

El modelo se obtuvo por destilación a partir de IndicTrans2 dist-200M: aprendió a traducir a partir de frases en inglés que el modelo mayor había traducido previamente. Forma parte de una familia de doce modelos inglés → lengua india (hindi, bengalí, maratí, telugu, tamil, gujarati, urdu, kannada, malayalam, punyabí, odia y asamés) con el mismo diseño y filosofía de despliegue ligero.

Su relevancia radica en ofrecer traducción inglés-tamil de calidad competitiva en un paquete que cabe en cualquier dispositivo: navegador, móvil o servidor sin GPU. Frente al modelo offline de Firefox (31,6 MB) queda 2,81 chrF++ por debajo en FLORES+ y 0,98 en IN22-Conv; frente a indicMT (153,8M de parámetros) está prácticamente empatado en FLORES+ y 2,02 por debajo en IN22-Conv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 17.170.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas truncadas a 127 piezas SentencePiece) |
| Tipos de cuantizacion | int8 (CTranslate2 y ONNX), fp32 (pesos originales) |
| Idiomas soportados | inglés (en), tamil (ta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, CTranslate2 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder diseñado originalmente para traducción automática y caracterizado por su ligereza. Con 17,3 millones de parámetros, utiliza tokenización SentencePiece y decodificación greedy en la evaluación oficial. Los pesos se distribuyen en tres formatos: safetensors para uso con Transformers, ONNX int8 para transformers.js y CTranslate2 int8 para inferencia optimizada en CPU.

El entrenamiento se basó en destilación: el modelo aprendió a partir de frases en inglés que IndicTrans2 dist-200M (211,8M de parámetros) había traducido al tamil. El conjunto de datos de referencia es ai4bharat/IndicCorpV2. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la compresión extrema manteniendo calidad cercana a modelos entre 9 y 12 veces mayores.

## Capacidades

- Traducción de texto inglés → tamil, una frase por entrada.
- Ejecución offline en CPU convencional (aproximadamente 30 ms por frase en un núcleo de Mac mini).
- Ejecución en navegador web mediante transformers.js con pesos ONNX int8 (28,9 MB descargados una vez).
- Inferencia con CTranslate2 int8 para despliegues de alto rendimiento en CPU.
- Compatibilidad con la librería Transformers mediante MarianMTModel y MarianTokenizer.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad monolingüe bidireccional limitada al par inglés-tamil (solo dirección en → ta).

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales, guías y documentación de producto del inglés al tamil frase a frase, integrándose en pipelines de procesamiento por lotes con CTranslate2 para alto rendimiento en CPU sin GPU.

- Subtitulado y localización de contenido: adecuado para traducir subtítulos o guiones de vídeo al tamil, procesando cada línea como una entrada independiente y manteniendo la latencia baja (30 ms por frase) para flujos casi en tiempo real.

- Atención al cliente en tamil: permite traducir mensajes de usuarios tamil al inglés para su procesamiento por sistemas de soporte, y las respuestas de vuelta al tamil, todo ello en servidores sin GPU gracias a su reducido tamaño (17,7 MB int8).

- Traducción en el navegador sin conexión: mediante transformers.js, se puede ofrecer traducción inglés-tamil directamente en una aplicación web sin enviar datos a servidores externos, útil para aplicaciones de privacidad o entornos con conectividad limitada.

- Localización de interfaces de usuario: traducción de cadenas de texto de aplicaciones móviles o web al tamil, donde el modelo ligero puede ejecutarse en el propio dispositivo o en funciones serverless con requisitos mínimos de recursos.

- Procesamiento de correos y comunicaciones empresariales: traducción automática de correos electrónicos y mensajes internos del inglés al tamil en entornos corporativos, con despliegue en CPU que evita costes de GPU y permite escalar horizontalmente con múltiples instancias.

- Investigación en traducción automática de bajos recursos: modelo de referencia para experimentos de destilación y eficiencia en pares lingüísticos con pocos recursos, gracias a su licencia Apache 2.0 y su reducido tamaño.

## Benchmarks y rendimiento

Resultados en chrF++ (mayor es mejor), medidos del 3 al 16 de noviembre de 2026 con el mismo conjunto de frases para todos los sistemas. Las diferencias son pareadas con intervalos de confianza al 95% (1.000 remuestreos bootstrap).

| Conjunto de prueba (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (31,6 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 53,86 | 53,95 (-0,08 [-0,55, +0,41]) | 56,67 | 56,67 (-2,81 [-3,24, -2,37]) |
| IN22-Conv (1.503) | 36,12 | 38,14 (-2,02 [-2,43, -1,62]) | 38,55 | 37,11 (-0,98) |

Notas: las puntuaciones de Paar corresponden a los pesos fp32; la build int8 está dentro de 0,07 chrF++ en FLORES+. La build ONNX int8 está dentro de 0,02 chrF++ de los pesos fp32 en ambos conjuntos. La comparación con Firefox, re-ejecutada sobre la build int8, da el mismo resultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo funciona en CPU. En fp32 ocupa aproximadamente 69 MB; en int8, 17,7 MB.
- GPU recomendadas: no necesarias. Cualquier GPU puede ejecutarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 (int8), ONNX Runtime / transformers.js (navegador y Node.js), y potencialmente llama.cpp no aplica (no es un modelo GGUF).
- Latencia y throughput: aproximadamente 30 ms por frase en un núcleo de Mac mini con la build CTranslate2 int8. El throughput escala linealmente con el número de núcleos o instancias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLORES+ (chrF++) | IN22-Conv (chrF++) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Paar English → Tamil | 17,3M | no disponible (127 piezas) | 53,86 | 36,12 | Apache 2.0 | Hugging Face, GitHub, demo en Spaces |
| indicMT | 153,8M | no disponible | 53,95 | 38,14 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8M | no disponible | 56,67 | 38,55 | no disponible | no disponible |
| Modelo offline de Firefox | no disponible (31,6 MB) | no disponible | 56,67 | 37,11 | no disponible | Integrado en Firefox |

## Limitaciones y advertencias

- El modelo traduce una sola frase por entrada; es necesario dividir párrafos en frases antes de la traducción.
- Las entradas se truncan a 127 piezas SentencePiece, lo que limita la longitud de las frases procesables.
- La decodificación evaluada es greedy (num_beams=1); la búsqueda por haz (beam search) no fue probada y su comportamiento es desconocido.
- Los ejemplos de traducción mostrados en la model card son salidas sin editar, con errores incluidos, y no han sido revisados por hablantes nativos.
- Riesgo de alucinación y errores de traducción en frases ambiguas, modismos o dominios especializados no representados en los datos de destilación.
- Sesgos potenciales heredados de IndicTrans2 y de los datos de entrenamiento (IndicCorpV2), no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un traductor de frases.
- Solo cubre la dirección inglés → tamil; no traduce tamil → inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-ta
- Demo en el navegador: https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning en GitHub: https://github.com/udgamlabs/paar
- Modelo hermano inglés → hindi: https://huggingface.co/udgamlabs/Paar-en-hi
- Modelo hermano inglés → bengalí: https://huggingface.co/udgamlabs/Paar-en-bn
- Modelo hermano inglés → maratí: https://huggingface.co/udgamlabs/Paar-en-mr
- Modelo hermano inglés → telugu: https://huggingface.co/udgamlabs/Paar-en-te
- Modelo hermano inglés → gujarati: https://huggingface.co/udgamlabs/Paar-en-gu
- Modelo hermano inglés → urdu: https://huggingface.co/udgamlabs/Paar-en-ur
- Modelo hermano inglés → kannada: https://huggingface.co/udgamlabs/Paar-en-kn
- Modelo hermano inglés → malayalam: https://huggingface.co/udgamlabs/Paar-en-ml
- Modelo hermano inglés → punyabí: https://huggingface.co/udgamlabs/Paar-en-pa
- Modelo hermano inglés → odia: https://huggingface.co/udgamlabs/Paar-en-or
- Modelo hermano inglés → asamés: https://huggingface.co/udgamlabs/Paar-en-as
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper de referencia (arxiv:2305.16307): https://arxiv.org/abs/2305.16307
