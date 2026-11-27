# vlapky/tiny-voca-ru

## Resumen

tiny-voca-ru es un modelo de síntesis de voz (text-to-speech) para ruso, con arquitectura derivada de tiny-voca y tan solo 4.534.411 parámetros. Lo publica el autor independiente vlapky (Evgeniy Chetvertkov) como adaptación al ruso del modelo original en inglés de Muhammed Nazeem, entrenado desde cero sobre el dataset egnch/tiny-voca-ru-dataset. Su interés radica en que demuestra que un TTS utilizable puede caber en ~18 MB de safetensors o ~21 MB de ONNX, lo que lo hace apto para inferencia en CPU y en navegador.

El modelo ofrece dos voces (femenina `F` y masculina `M`), salida mono a 24 kHz y un frontend de normalización de texto ruso escrito íntegramente en Python, con colocación de acento léxico en dos modos (`lite` y `full`) y un inventario fonético de 61 símbolos IPA. La velocidad declarada es de 115× tiempo real en PyTorch y 81× en ONNX Runtime sobre un AMD Ryzen 5 3600X con 4 hilos, y de 16,7–21,7× en ONNX Runtime Web con WASM a un solo hilo.

Es relevante ahora porque cubre un nicho poco atendido: TTS ruso de licencia Apache-2.0, extremadamente ligero, reproducible en hardware modesto y con artefactos listos para despliegue (safetensors, ONNX y paquete PyPI). No es un modelo generativo de propósito general, sino un componente especializado de un solo idioma y dos voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal derivada de tiny-voca (arquitectura no detallada en la información disponible) |
| Parametros totales | 4.534.411 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS; no se especifica límite de texto de entrada) |
| Tipos de cuantizacion | Pesos safetensors en precisión nativa; ONNX (model.onnx) y ONNX INT8 para el modelo de omógrafos (10 MB); no se detallan otras cuantizaciones |
| Idiomas soportados | Ruso (`ru`) únicamente |
| Licencia | Apache-2.0 (datos de acentuación `ruaccent` incluidos bajo MIT) |
| Formato de pesos | `model.safetensors` + `config.json`; `onnx/model.onnx` + `onnx/model.json`; `onnx/omograph.onnx` |

Otros datos técnicos: salida de audio mono a 24 kHz, voces `F` y `M`, frontend con normalizador ruso en Python puro, acentuación `lite`/`full` y G2P basado en reglas con 61 símbolos IPA (5 especiales, 12 de puntuación, 36 consonantes con pares de palatalización y 8 vocales, incluidas las reducidas `ɐ` y `ə`). Tamaño del repositorio: 0,1 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura y la receta de entrenamiento de tiny-voca, adaptadas al ruso, aunque la model card no detalla la topología interna (capas, tipo de decoder o mecanismo de atención). El cambio principal respecto al original es el inventario fonético: un conjunto IPA ruso de 61 símbolos que incorpora pares de consonantes palatalizadas y vocales reducidas. El frontend (`tiny_voca_ru.frontend`) realiza normalización de texto en Python puro, asignación de acento (`lite` mediante `stress.txt.gz` y `accent.onnx`, o `full` mediante el modelo INT8 `onnx/omograph.onnx` de 10 MB) y conversión grafema-fonema basada en reglas.

El entrenamiento se hizo desde cero durante 104.000 pasos (4,9 horas en una NVIDIA L40S) sobre 18.517 clips alineados (21,96 horas) del dataset egnch/tiny-voca-ru-dataset, usando duraciones CTC de `facebook/wav2vec2-lv-60-espeak-cv-ft` durante la preparación de datos. No se menciona RLHF, DPO ni ninguna fase de alineación por preferencias; tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El repositorio de GitHub incluye scripts de fine-tuning para voces personalizadas (`tiny-voca-ru-prepare`, `tiny-voca-ru-train`).

## Capacidades

- Síntesis de voz en ruso a 24 kHz mono con dos voces predefinidas: femenina (`F`) y masculina (`M`).
- Control de velocidad de habla en el rango 0.25–4.0 y de tono mediante `pitch_shift` (desplazamiento log-F0; 0,058 ≈ +1 semitono) y `pitch_range` (0.0–3.0).
- Acentuación léxica configurable: `lite` (por defecto), `full` (modelo de omógrafos INT8) o `none`, además de marcado manual con `+` antes de la vocal tónica (por ejemplo, `зам+ок`).
- Normalización de texto ruso: expansión de números y plantillas numéricas, con una tasa de acierto ASR exacta del 90,6% en plantillas numéricas del conjunto de test.
- Conversión grafema-fonema basada en reglas sobre un inventario IPA de 61 símbolos.
- Inferencia en dos backends: PyTorch con safetensors y ONNX Runtime, incluido ONNX Runtime Web (WASM) en el navegador.
- Interfaz de línea de comandos (`tiny-voca-ru-speak`) y API de Python (`Synthesizer.from_pretrained`).
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es un modelo estrictamente TTS.

## Casos de uso

- Lectura de artículos y boletines en ruso: el modelo sintetiza párrafos completos por frases con un CER del 0,46% en el conjunto de test, suficiente para lectura asistida o podcasts generados por lotes en CPU.
- Interfaces de voz para asistentes locales: al ocupar ~21 MB en ONNX y ejecutarse a 81× tiempo real en CPU, puede integrarse en aplicaciones de escritorio o dispositivos de borde sin GPU.
- Síntesis en el navegador: con ONNX Runtime Web a 16,7–21,7× tiempo real en un solo hilo WASM, es viable para demos web y aplicaciones que no pueden enviar texto a un servidor.
- Generación de avisos con cifras y fechas: el frontend normaliza números y horas (por ejemplo, «15:30» o «1250 рублей»), con un 90,6% de coincidencia exacta en plantillas numéricas, adecuado para locuciones de transporte, comercio o atención telefónica.
- Prototipado de voces personalizadas: los scripts `tiny-voca-ru-prepare` y `tiny-voca-ru-train` del repositorio permiten ajustar el modelo a una voz concreta partiendo de un entrenamiento de apenas 4,9 horas en una L40S.
- Accesibilidad y audiolibros de bajo coste: la licencia Apache-2.0 y el tamaño reducido permiten empaquetar el modelo dentro de aplicaciones comerciales sin coste por inferencia en la nube.
- Pruebas de regresión de pipelines TTS: su velocidad (115× tiempo real en PyTorch) permite generar lotes de audio de validación en segundos dentro de CI.

## Benchmarks y rendimiento

Evaluación a 104.000 pasos con el frontend `lite` por defecto, frente al profesor Qwen3-TTS, sobre el split de test (696 clips, ASR Whisper `large-v3-turbo`). Velocidad de CPU medida en AMD Ryzen 5 3600X con 4 hilos y 55,03 s de audio.

| Métrica | Split | tiny-voca-ru | Profesor (Qwen3-TTS) |
|---|---|---|---|
| CER | test (696 clips) | 0,46% (`F` 0,43%, `M` 0,49%) | 0,31% |
| WER | test (696 clips) | 2,03% | 1,54% |
| Precisión de acento (CTC top-1) | palabras de diccionario del test (3.905) | 98,5% | 95,6% |
| Omógrafos (`lite` / referencia `ruaccent turbo3.1`) | omógrafos (250) | 56,0% / 91,6% | — |
| Números, coincidencia exacta ASR | plantillas numéricas del test (139) | 90,6% | 92,1% |
| Velocidad (PyTorch / ONNX CPU, 4 hilos) | 55,03 s de audio | 115× / 81× tiempo real | — |
| Velocidad (ONNX Runtime Web, WASM 1 hilo) | Chromium | 16,7–21,7× tiempo real | — |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,5 M de parámetros (~18 MB en safetensors) la huella de pesos es inferior a 100 MB incluso con estados intermedios, por lo que la inferencia en GPU es trivial en memoria.
- GPU recomendadas: el autor documenta el entrenamiento en una NVIDIA L40S; para inferencia basta cualquier GPU con unos pocos cientos de MB libres. No se publican cifras de latencia en GPU.
- GPU de consumo: cabe holgadamente en cualquier RTX o GTX con suficiente memoria libre; de hecho, el caso de uso principal es CPU.
- CPU: 115× tiempo real en PyTorch y 81× en ONNX Runtime con 4 hilos en un Ryzen 5 3600X.
- Navegador: ONNX Runtime Web (WASM, 1 hilo) a 16,7–21,7× tiempo real en Chromium.
- Opciones de despliegue: paquete PyPI `tiny-voca-ru` con extras `[torch]` y `[onnx]`, API de Python, CLI `tiny-voca-ru-speak`, ONNX Runtime y ONNX Runtime Web. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un TTS de este tipo).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca-ru | 4,53 M | Ruso | No disponible | Apache-2.0 | Hugging Face, PyPI, ONNX, demo en Spaces |
| tiny-voca (original) | ~4,5 M | Inglés | No disponible | No disponible en la información proporcionada | Hugging Face, GitHub |
| Qwen3-TTS (profesor) | No disponible | No disponible | No disponible | No disponible | Usado como referencia de evaluación; CER 0,31% frente a 0,46% |
| `ruaccent turbo3.1` | No disponible | Ruso | No disponible | No disponible | Referencia externa para desambiguación de omógrafos (91,6% frente a 56,0% en modo `lite`) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables más allá de lo indicado; cualquier comparación adicional se considera no disponible.

## Limitaciones y advertencias

- Solo ruso: no sintetiza otros idiomas y únicamente ofrece dos voces (`F` y `M`), que heredan rasgos de pronunciación del profesor Qwen3-TTS.
- El modo de acentuación por defecto (`lite`) no desambigua omógrafos dependientes del contexto: acierta el 56,0% frente al 91,6% de `ruaccent turbo3.1`. Para producción conviene usar `stress="full"` o marcar el acento manualmente con `+`.
- La inflexión de caso de numerales basada en reglas y la transliteración de nombres latinos pueden fallar en sintaxis compleja o nombres extranjeros.
- El CER (0,46%) y el WER (2,03%) son superiores a los del profesor (0,31% y 1,54%), por lo que la calidad no es la de un sistema TTS de gran escala.
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras fuera del dominio del dataset de entrenamiento (21,96 horas); no se documentan sesgos específicos más allá de los heredados del profesor.
- La licencia Apache-2.0 permite uso comercial, pero los datos de acentuación `ruaccent` incluidos están bajo MIT y deben atribuirse conforme al NOTICE; se recomienda revisar dicho archivo antes de redistribuir.
- No se documentan garantías de robustez ante texto con ruido, abreviaturas no estándar o mezcla de alfabetos; conviene validar con muestras propias antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlapky/tiny-voca-ru
- Modelo referenciado en la model card: https://huggingface.co/egnch/tiny-voca-ru
- Demo en Spaces: https://huggingface.co/spaces/egnch/tiny-voca-ru-demo
- Dataset: https://huggingface.co/datasets/egnch/tiny-voca-ru-dataset
- Código: https://github.com/yilbegan/tiny-voca-ru
- Paquete PyPI: https://pypi.org/project/tiny-voca-ru/
- tiny-voca original (GitHub): https://github.com/n4ze3m/tiny-voca
- tiny-voca original (Hugging Face): https://huggingface.co/n4ze3m/tiny-voca
- ORCID del autor: https://orcid.org/0009-0006-6158-2624
