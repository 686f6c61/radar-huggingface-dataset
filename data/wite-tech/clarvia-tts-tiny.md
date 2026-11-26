# wite-tech/clarvia-tts-tiny

## Resumen

clarvia-tts-tiny es un modelo de síntesis de voz (text-to-speech) para turco desarrollado por wite-tech. Se trata de un ajuste fino del modelo n4ze3m/tiny-voca, un sistema TTS compacto de arquitectura tipo FastSpeech2 con un generador de onda fuente-filtro entrenado con pérdidas adversarias. Con solo 4,5 millones de parámetros (generador de onda incluido), está diseñado para inferencia en dispositivo: móviles, navegadores y sistemas embebidos, con una velocidad aproximada de 25 veces tiempo real en un único hilo de CPU.

La particularidad principal del modelo es que incorpora un fonemizador específico para turco, clarvia-phonemizer, que asume las funciones de normalización de texto que normalmente se delegan a un paso separado. Esto le permite leer correctamente números, fechas, importes monetarios, direcciones, porcentajes, unidades y sufijos turcos tras cifras (por ejemplo, "14:30'da" se convierte en "on dört otuzda" aplicando armonía vocálica). El resultado es un sistema TTS ligero y autónomo, pensado para asistentes de voz y aplicaciones de atención telefónica en turco.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato ONNX (21 MB, float32) para inferencia y safetensors (18 MB, float32) para PyTorch. Soporta diez voces (cinco masculinas y cinco femeninas) a 24 kHz mono, y permite ajustar velocidad, tono y rango de tono en tiempo de inferencia. Es relevante ahora porque demuestra que un TTS de calidad aceptable para un idioma con morfología compleja puede ejecutarse íntegramente en el navegador o en un teléfono sin infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastSpeech2-style (modelo acústico con predictores de duración, tono, sonoridad y energía) + generador de onda fuente-filtro entrenado con pérdidas adversarias |
| Parametros totales | 4.536.907 (generador de onda incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; ONNX de 21 MB y safetensors de 18 MB) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, 21 MB, float32) y safetensors (`model.safetensors`, 18 MB, float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de tiny-voca: un modelo acústico estilo FastSpeech2 con predictores explícitos de duración, tono (pitch), sonoridad (voicing) y energía, seguido de un generador de onda fuente-filtro compacto entrenado con pérdidas adversarias. La entrada son 56 símbolos fonéticos con marcas de acentuación, producidos por el fonemizador clarvia-phonemizer, y la salida es audio mono a 24 kHz. Los pesos se entrenaron desde cero en turco, ya que el inventario fonético del inglés de tiny-voca no es transferible directamente; se conservan la arquitectura y la receta de entrenamiento del modelo base.

El entrenamiento se realizó en una única GPU durante 190.000 pasos, de los cuales los últimos 40.000 se hicieron sobre clips corregidos. Los datos consisten en aproximadamente 190 horas de voz sintética en turco: 41 horas de pocket-tts-turkish en las cuatro voces de asistente (frases generales de Mozilla Common Voice Turkish, CC0, y plantillas de atención al cliente con nombres, números, fechas y direcciones inventados) y 150 horas de Trendyol-TTS en las seis voces diseñadas. Cada clip se alineó forzosamente a sus fonemas con `facebook/wav2vec2-lv-60-espeak-cv-ft`, conservándose solo los que tenían alineación fiable (154.000 clips). Los clips con errores de pronunciación del profesor o de la primera palabra de la frase se detectaron con Whisper y se reemplazaron o descartaron antes del ajuste fino final.

## Capacidades

- Síntesis de voz en turco a 24 kHz mono con diez voces predefinidas (male_1 a male_5, female_1 a female_5).
- Lectura contextual de números, fechas, horas, rangos, importes en lira y kuruş, porcentajes, unidades, ordinales, números de casa y pisos, abreviaturas, direcciones de correo y web.
- Aplicación de sufijos turcos tras cifras con armonía vocálica (por ejemplo, "14:30'da" se lee "on dört otuzda").
- Reglas fonéticas específicas del turco: k y g palatales ante vocales anteriores, l clara y oscura, alargamiento de ğ, vocales con circunflejo y nasal velar.
- Reglas de acentuación: acento final por defecto, sufijos átonos, regla de Sezer para topónimos y lista de excepciones para préstamos y marcas.
- Ajuste de velocidad, desplazamiento de tono (pitch_shift) y rango de tono (pitch_range) en tiempo de inferencia.
- Ejecución en navegador mediante onnxruntime-web y del fonemizador bajo Pyodide (Python puro sin dependencias).
- No soporta tool calling, function calling ni razonamiento multi-paso; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz telefónicos en turco: el modelo lee de forma natural números de cuenta, importes, fechas de vencimiento y direcciones, lo que permite construir respuestas automatizadas de atención al cliente sin un paso separado de normalización de texto.
- Lectura de facturas y notificaciones de pago: con la pronunciación correcta de "1.250,50 TL" como "bin iki yüz elli lira elli kuruş", resulta adecuado para sistemas de aviso de deuda o recordatorios de cobro por voz.
- Aplicaciones móviles de accesibilidad: al ejecutarse a unas 25 veces tiempo real en un solo hilo de CPU y ocupar 21 MB en ONNX, puede integrarse en apps Android o iOS para leer pantallas, mensajes o documentos a usuarios con discapacidad visual.
- Demos y asistentes en navegador: el fonemizador funciona bajo Pyodide y el modelo en onnxruntime-web, lo que permite ofrecer síntesis de voz turca en una pestaña del navegador sin backend ni coste de servidor.
- Sistemas de megafonía y avisos en transporte o comercio: lectura de números de tren, andenes, turnos o pedidos con pronunciación consistente de identificadores y horas.
- Prototipado de interfaces conversacionales en turco: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para experimentar con voces, velocidades y tonos antes de invertir en un TTS de mayor tamaño.
- Generación de audiolibros o contenido educativo ligero: las diez voces y el control de velocidad y tono permiten producir narraciones en turco para materiales formativos o podcasts de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación mediante word error rate con Whisper large-v3, pero el contenido proporcionado se interrumpe antes de incluir las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX ocupa 21 MB en float32 y el safetensors 18 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutará con enorme margen, pero no es necesario para un rendimiento adecuado.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), PyTorch con el módulo `TinyVoca` de tiny-voca para los pesos safetensors. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: aproximadamente 25 veces tiempo real en un único hilo de CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| clarvia-tts-tiny | 4,5 M | no aplica | turco | Apache 2.0 | ONNX, safetensors | TTS en dispositivo con fonemizador turco integrado |
| n4ze3m/tiny-voca | no disponible | no aplica | ingles | no disponible | no disponible | Modelo base; misma arquitectura y receta, entrenado en ingles |
| pocket-tts-turkish | no disponible | no aplica | turco | no disponible | no disponible | Fuente de 41 horas de datos de entrenamiento en cuatro voces de asistente |
| Trendyol-TTS | no disponible | no aplica | turco | no disponible | no disponible | Fuente de 150 horas de datos de entrenamiento en seis voces disenadas |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- El modelo solo soporta turco; no es multilingue y no puede sintetizar otros idiomas.
- Es exclusivamente un modelo de síntesis de voz: no genera texto, no razona, no ejecuta código ni soporta tool calling.
- Los datos de entrenamiento son en su totalidad voz sintética (190 horas), lo que puede introducir artefactos o una prosodia menos natural que la de sistemas entrenados con voz humana real.
- Las voces female_3 a female_5 y male_3 a male_5 son voces sintéticas adicionales; su calidad y naturalidad pueden diferir de las cuatro voces de asistente.
- El fonemizador depende de listas de excepciones en texto plano (`data/exceptions.txt`, `data/places.txt`, `data/function_words.txt`); palabras, marcas o topónimos no cubiertos pueden pronunciarse de forma incorrecta.
- La evaluación con Whisper large-v3 aparece mencionada pero sin cifras en la información disponible, por lo que no se puede verificar la tasa de error real del sistema.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el usuario debe verificar las condiciones de los datos de origen (Mozilla Common Voice Turkish es CC0, pero las condiciones de Trendyol-TTS y pocket-tts-turkish no se detallan en la información proporcionada).
- No se especifican sesgos demográficos ni de género en las voces; las diez voces son un conjunto fijo y no se documenta su diversidad acústica más allá de la descripción "assistant voices" y "additional synthetic voices".
- No hay información sobre cuantizaciones oficiales distintas de float32, lo que limita las optimizaciones de despliegue documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wite-tech/clarvia-tts-tiny
- Fonemizador clarvia-phonemizer: https://huggingface.co/wite-tech/clarvia-phonemizer
- Modelo base tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Repositorio del fonemizador (instalación pip): https://huggingface.co/wite-tech/clarvia-phonemizer
- Modelo de alineación forzada: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
