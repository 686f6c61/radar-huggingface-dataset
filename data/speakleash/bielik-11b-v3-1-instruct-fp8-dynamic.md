# speakleash/Bielik-11B-v3.1-Instruct-FP8-Dynamic

## Resumen

Bielik-11B-v3.1-Instruct-FP8-Dynamic es una versión cuantizada en FP8 del modelo instructivo Bielik-11B-v3.1-Instruct, desarrollado por SpeakLeash, una iniciativa polaca de código abierto centrada en modelos de lenguaje de alta calidad para polaco y otras lenguas. Esta variante aplica cuantización de pesos en FP8 con activaciones FP8 dinámicas sobre el checkpoint original, reduciendo el espacio en disco y los requisitos de memoria para inferencia sin reentrenar el modelo.

El modelo base es un transformer decoder-only de 11.168.796.672 parámetros (aproximadamente 11,2 mil millones), orientado a instrucciones y con soporte multilingüe que abarca más de 50 idiomas, con especial énfasis en polaco e inglés. Esta versión cuantizada mantiene la licencia Apache 2.0 del modelo original y se distribuye en formato safetensors con el formato de compresión `compressed-tensors`.

Su relevancia radica en que permite desplegar un modelo de 11B en infraestructura más modesta que la requerida por el checkpoint en BF16, manteniendo un equilibrio razonable entre calidad y coste computacional. Es especialmente interesante para equipos que necesitan un modelo multilingüe europeo con licencia permisiva y quieren optimizar VRAM en GPUs de gama alta de consumo o profesional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parámetros totales | 11.168.796.672 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (pesos FP8 con activaciones FP8 dinámicas) |
| Idiomas soportados | Multilingüe: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sv, da, no, fi, et, lt, lv, hu, ro, bg, hr, sr, sl, bs, hbs, cnr, sq, mk, mt, el, tr, ca, gl, eu, cy, ga, gd, fo, is, lb, la, ar, he, fa, hi, id, ja, ko, zh, ka, kk, hy, az, be, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

El modelo base Bielik-11B-v3.1-Instruct es un transformer decoder-only de la familia Llama con aproximadamente 11,2 mil millones de parámetros. Esta variante FP8-Dynamic no modifica la arquitectura: aplica cuantización post-entrenamiento sobre los pesos del checkpoint instructivo original, almacenando los pesos en FP8 y utilizando activaciones FP8 con escalado dinámico. El formato de compresión es `compressed-tensors`, compatible con librerías de inferencia modernas que soportan FP8 (por ejemplo, vLLM con kernels FP8 en GPUs Hopper o Ada Lovelace).

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT específicas para la versión instructiva. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La cuantización FP8 dinámica es la única transformación destacable respecto al modelo original.

## Capacidades

- Generación de texto e instrucciones en más de 50 idiomas, con especial cobertura de polaco e inglés.
- Razonamiento general y respuesta a preguntas en contextos conversacionales multi-turno.
- Generación de código y tareas de programación básica, aunque sin benchmarks publicados que lo confirmen.
- Capacidades matemáticas y de razonamiento simbólico propias de un modelo instructivo de 11B.
- Soporte multilingüe amplio, incluyendo lenguas europeas minoritarias (gaélico, galés, euskera, catalán, gallego, etc.).
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente multilingüe en Europa: el modelo puede gestionar conversaciones en castellano, polaco, alemán, francés e italiano dentro de la misma infraestructura, lo que simplifica el despliegue de un único endpoint para varios mercados.
- Generación y resumen de documentos en polaco: Bielik está optimizado para polaco, por lo que resulta adecuado para resumir contratos, informes y correspondencia administrativa en ese idioma con mayor calidad que modelos genéricos de tamaño similar.
- Traducción asistida entre lenguas europeas: con cobertura de más de 50 idiomas, puede usarse como motor de traducción preliminar en pipelines de localización, con revisión humana posterior.
- Asistentes internos sobre documentación corporativa: al ser un modelo instructivo de 11B con licencia Apache 2.0, puede desplegarse on-premise para responder preguntas sobre manuales y bases de conocimiento sin enviar datos a terceros.
- Generación de código en entornos con requisitos de soberanía de datos: su licencia permisiva y su despliegue local permiten integrarlo en herramientas de autocompletado o revisión de código en organizaciones que no pueden usar APIs externas.
- Prototipado rápido de aplicaciones NLP en investigación: la versión FP8 reduce los requisitos de VRAM, lo que facilita experimentar con un modelo de 11B en una sola GPU profesional o de gama alta de consumo.
- Procesamiento de textos en lenguas minoritarias: útil para proyectos de preservación lingüística o análisis de corpus en gaélico, galés, euskera, catalán o gallego, donde muchos modelos comerciales tienen cobertura limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenar pesos en FP8 (1 byte por parámetro), el modelo requiere aproximadamente 11,2 GB solo para pesos, más overhead de activaciones, KV cache y buffers. En la práctica, se recomienda un mínimo de 16 GB de VRAM para contextos cortos y 24 GB o más para contextos largos.
- GPU recomendadas: NVIDIA H100, H200, L40S, A100 (con soporte FP8 nativo en Hopper para máximo rendimiento); en Ada Lovelace, RTX 4090 y L4 pueden ejecutar FP8 con conversión, aunque el soporte de kernels es más limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contextos reducidos; en GPUs de 12 GB requeriría cuantización adicional (por ejemplo, a 4 bits) o descarga parcial a CPU.
- Opciones de despliegue: vLLM (con soporte FP8 en GPUs compatibles), TensorRT-LLM, TGI (verificar soporte de `compressed-tensors` FP8), y potencialmente llama.cpp si se convierte a GGUF (no incluido en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct-FP8-Dynamic | 11,2B | no disponible | Apache 2.0 | safetensors FP8 | Versión cuantizada del instructivo polaco multilingüe |
| Bielik-11B-v3.1-Instruct (base) | 11,2B | no disponible | Apache 2.0 | safetensors BF16 | Checkpoint original sin cuantizar |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors | Referencia en inglés, licencia más restrictiva |
| Mistral 7B Instruct | 7,3B | 32K | Apache 2.0 | safetensors | Alternativa europea de menor tamaño |

La comparación con Llama 3.1 8B y Mistral 7B es orientativa: no se dispone de benchmarks que permitan comparar rendimiento real entre ellos y Bielik en la información proporcionada. La principal ventaja de Bielik es su cobertura del polaco y su licencia Apache 2.0, mientras que su desventaja potencial es un ecosistema de herramientas y comunidad más reducido.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una degradación ligera de calidad respecto al checkpoint BF16 original, especialmente en tareas de razonamiento complejo o generación de código; conviene validar en el caso de uso concreto.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta variante cuantizada; se heredan los riesgos del modelo base, que tampoco están documentados en la información disponible.
- El soporte de FP8 depende del hardware y de la librería de inferencia; en GPUs sin kernels FP8 nativos el rendimiento puede no ser mejor que BF16 o requerir conversión.
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base puede haberse entrenado con datos cuya procedencia no está detallada; se recomienda revisar la model card original para conocer posibles restricciones adicionales.
- El modelo está optimizado para polaco; su rendimiento en castellano, aunque soportado, puede ser inferior al de modelos específicamente entrenados para español.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción sin validación previa.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct-FP8-Dynamic
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
- Repositorio de la librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
