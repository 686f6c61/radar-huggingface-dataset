# udgamlabs/Paar-en-gu

## Resumen

Paar English → Gujarati es un modelo de traducción automática neuronal especializado en la dirección inglés-gujarati, desarrollado por Udgam Labs. Se trata de un modelo Marian de 17,3 millones de parámetros (17.170.688 según los pesos en safetensors) que ocupa tan solo 17,7 MB en cuantización int8, lo que lo convierte en una opción extremadamente ligera para despliegue en CPU, navegador o dispositivos con recursos limitados.

El modelo fue destilado a partir de IndicTrans2: aprendió a partir de frases en inglés que el modelo IndicTrans2 dist-200M había traducido previamente al gujarati. Forma parte de una familia de doce modelos de traducción del inglés a lenguas índicas (hindi, bengalí, maratí, telugu, tamil, gujarati, urdu, cananeo, malayalam, punyabí, odia y asamés), todos con la misma arquitectura y filosofía de eficiencia.

Su relevancia radica en que ofrece traducción offline de calidad competitiva con un coste computacional mínimo: aproximadamente 34 ms por frase en un solo núcleo de un Mac mini, y puede ejecutarse directamente en un navegador web mediante transformers.js. Está publicado bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción) |
| Parámetros totales | 17.170.688 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada truncada a 127 piezas SentencePiece; salida hasta 200 tokens) |
| Tipos de cuantización | int8 (CTranslate2), int8 (ONNX para transformers.js), fp32 (pesos originales) |
| Idiomas soportados | inglés (en) y gujarati (gu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, CTranslate2 (int8) |

## Arquitectura y entrenamiento

Paar English → Gujarati emplea la arquitectura Marian, un transformer encoder-decoder clásico diseñado específicamente para traducción automática. Con 17,3 millones de parámetros, se sitúa en la categoría de modelos ultracompactos, muy por debajo de los modelos multilingües habituales. El tokenizador es SentencePiece, con truncamiento de entrada a 127 piezas y generación de hasta 200 tokens de salida.

El entrenamiento se basa en destilación: el modelo aprendió a partir de frases en inglés que IndicTrans2 dist-200M (211,8 millones de parámetros) había traducido al gujarati. El conjunto de datos citado es ai4bharat/IndicCorpV2. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La decodificación evaluada por el autor es greedy (num_beams=1); la búsqueda por haz (beam search) no fue probada.

## Capacidades

- Traducción de texto de inglés a gujarati, una frase por entrada.
- Ejecución offline en CPU convencional, sin necesidad de GPU.
- Ejecución en navegador web mediante transformers.js con pesos ONNX int8.
- Despliegue ligero mediante CTranslate2 con cuantización int8.
- Procesamiento por frases: requiere dividir párrafos en frases antes de la traducción.
- Generación de hasta 200 tokens de salida por frase.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede traducir frases sueltas de documentación en inglés al gujarati de forma local, sin enviar datos a servicios en la nube, gracias a su ejecución offline en CPU.
- Localización de interfaces de usuario: con 17,7 MB en int8, puede integrarse en aplicaciones de escritorio o móviles para traducir cadenas de texto de la interfaz al gujarati en tiempo de ejecución, con una latencia de aproximadamente 34 ms por frase.
- Traducción en el navegador sin servidor: mediante transformers.js y los pesos ONNX int8 (28,7 MB descargados una sola vez), se puede ofrecer traducción inglés-gujarati directamente en una página web, sin backend ni conexión tras la carga inicial.
- Procesamiento por lotes de correos y mensajes: el modelo puede traducir frases de correos electrónicos o mensajes de atención al cliente del inglés al gujarati en pipelines de CPU, dividiendo previamente el texto en frases.
- Herramientas de accesibilidad y lectura: integración en lectores de pantalla o extensiones que traduzcan contenido web en inglés al gujarati de forma local, preservando la privacidad del usuario.
- Sistemas embebidos y dispositivos de bajo consumo: su tamaño reducido y su ejecución en un solo núcleo de CPU lo hacen adecuado para dispositivos con recursos limitados donde no es viable desplegar modelos de cientos de millones de parámetros.
- Prototipado rápido y evaluación de pipelines de traducción: sirve como baseline ligero para comparar calidad frente a modelos mayores en tareas de traducción inglés-gujarati.

## Benchmarks y rendimiento

Resultados en chrF++ (mayor es mejor), medidos del 3 al 16 de noviembre de 2026 con el mismo conjunto de frases para todos los sistemas. Las diferencias son pareadas con intervalos de confianza del 95% (1.000 remuestreos bootstrap). Los resultados de Paar corresponden a los pesos fp32; la versión int8 se mantiene dentro de 0,07 chrF++.

| Conjunto de prueba (frases) | Paar (17,3M) | indicMT (153,8M) | IndicTrans2 dist-200M (211,8M) | Modelo offline de Firefox (17,1 MB) |
|---|---:|---:|---:|---:|
| FLORES+ devtest (1.012) | 53,21 | 53,95 (-0,74 [-1,22, -0,28]) | 55,62 | 52,55 (+0,66 [+0,13, ...]) |
| IN22-Conv | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El autor indica que, frente al modelo offline de Firefox (17,1 MB, tamaño similar), Paar está por delante en 0,66 chrF++ en FLORES+ y en 2,11 en IN22-Conv (conversación cotidiana). Frente a indicMT, un modelo aproximadamente 8,6 veces mayor en descarga, está por detrás en 0,74 en FLORES+ y en 0,52 en IN22-Conv. Los valores completos de IN22-Conv no están disponibles en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo funciona en CPU. En fp32 ocupa aproximadamente 68 MB de memoria; en int8, unos 17,7 MB.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. No se han publicado requisitos de GPU.
- Compatibilidad con GPU de consumo: irrelevante por su tamaño; cabe en cualquier dispositivo, incluidos navegadores y sistemas embebidos.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 (int8), transformers.js (ONNX int8), y potencialmente otros runtimes compatibles con ONNX.
- Latencia y throughput: aproximadamente 34 ms por frase en un solo núcleo de un Mac mini. No se han publicado cifras de throughput para otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (FLORES+ chrF++) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Paar English → Gujarati | 17,3M | no disponible (entrada truncada a 127 piezas) | 53,21 | Apache 2.0 | Hugging Face, offline, navegador |
| indicMT | 153,8M | no disponible | 53,95 | no disponible | no disponible |
| IndicTrans2 dist-200M | 211,8M | no disponible | 55,62 | no disponible | no disponible |
| Modelo offline de Firefox | 17,1 MB (parámetros no disponibles) | no disponible | 52,55 | no disponible | integrado en Firefox |

Paar destaca por su eficiencia: con 17,3M de parámetros supera al modelo de Firefox en calidad y se acerca a indicMT, que es 8,6 veces mayor en descarga. IndicTrans2 dist-200M obtiene la mejor puntuación en FLORES+, pero a costa de un tamaño mucho mayor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al ser un modelo destilado de IndicTrans2, puede heredar sesgos de ese modelo y de los datos de IndicCorpV2.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede producir traducciones incorrectas o inventar contenido, especialmente en frases ambiguas o fuera de dominio. El autor muestra ejemplos con errores ("by 6:15" traducido como દ્વારા, "6:45" como 6.45, y "battery dies" como મૃત્યુ પામે છે, que implica morir como una persona).
- Limitaciones de contexto: la entrada se trunca a 127 piezas SentencePiece y la salida a 200 tokens; no admite párrafos completos sin dividirlos en frases. No se especifica una longitud de contexto formal.
- Limitaciones de idioma: solo traduce de inglés a gujarati; no soporta otros pares de idiomas ni traducción inversa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento (IndicCorpV2) y del modelo profesor (IndicTrans2) para cumplimiento normativo.
- Caveat para producción: el autor no ha validado las traducciones con hablantes nativos; la decodificación evaluada es greedy y no se probó beam search. La calidad en dominios especializados (legal, médico, técnico) no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Paar-en-gu
- Demo en el navegador: https://huggingface.co/spaces/udgamlabs/Paar
- Código y receta de fine-tuning: https://github.com/udgamlabs/paar
- Modelo hermano English → Hindi: https://huggingface.co/udgamlabs/Paar-en-hi
- Modelo hermano English → Bengali: https://huggingface.co/udgamlabs/Paar-en-bn
- Modelo hermano English → Marathi: https://huggingface.co/udgamlabs/Paar-en-mr
- Modelo hermano English → Telugu: https://huggingface.co/udgamlabs/Paar-en-te
- Modelo hermano English → Tamil: https://huggingface.co/udgamlabs/Paar-en-ta
- Modelo hermano English → Urdu: https://huggingface.co/udgamlabs/Paar-en-ur
- Modelo hermano English → Kannada: https://huggingface.co/udgamlabs/Paar-en-kn
- Modelo hermano English → Malayalam: https://huggingface.co/udgamlabs/Paar-en-ml
- Modelo hermano English → Punjabi: https://huggingface.co/udgamlabs/Paar-en-pa
- Modelo hermano English → Odia: https://huggingface.co/udgamlabs/Paar-en-or
- Modelo hermano English → Assamese: https://huggingface.co/udgamlabs/Paar-en-as
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper de referencia (arXiv:2305.16307): https://arxiv.org/abs/2305.16307
