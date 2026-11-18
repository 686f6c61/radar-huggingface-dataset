# wite-tech/clarvia-tts-tiny

## Resumen

clarvia-tts-tiny es un modelo de síntesis de voz (text-to-speech) para turco desarrollado por wite-tech, con solo 4,5 millones de parámetros en total, incluyendo el generador de forma de onda. Se trata de la adaptación al turco del proyecto tiny-voca: mantiene el mismo modelo acústico compacto y el generador de waveform, pero se ha reentrenado con voz sintética en turco y se le ha antepuesto un fonemizador específico para ese idioma. El resultado es un modelo lo bastante pequeño como para ejecutarse en un teléfono o en una pestaña de navegador, a unas 25 veces tiempo real en un solo hilo de CPU.

La relevancia del modelo está en su enfoque de normalización textual integrada: el fonemizador clarvia-phonemizer resuelve en una sola pasada la lectura de números, fechas, importes monetarios, direcciones, identificadores telefónicos y sufijos turcos con armonía vocálica, tareas que normalmente requieren un paso separado de text normalization. Esto lo hace especialmente útil para asistentes de atención telefónica y sistemas de lectura de datos estructurados en turco.

El modelo se distribuye en formato ONNX (21 MB, float32) bajo licencia Apache 2.0, con 10 voces predefinidas (5 masculinas y 5 femeninas) que generan audio mono a 24 kHz. No se han publicado resultados de benchmarks estándar de TTS más allá de las métricas de word error rate reportadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | tiny-voca: modelo acústico estilo FastSpeech2 con predictores de duración, pitch, voicing y energía, más un generador de waveform source-filter entrenado con pérdidas adversarias |
| Parámetros totales | 4.536.907 (incluye generador de waveform) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (el repo solo distribuye float32) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, 21 MB, float32) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño tiny-voca: un modelo acústico estilo FastSpeech2 que predice duración, pitch, voicing y energía a partir de una secuencia de 56 símbolos fonéticos (con marcas de acento) generada por clarvia-phonemizer, seguido de un generador de waveform source-filter entrenado con pérdidas adversarias. La salida es audio mono a 24 kHz. El modelo se entrenó durante 175.000 pasos en una sola GPU, de los cuales los últimos 25.000 se realizaron sobre clips corregidos.

Los datos de entrenamiento consisten en aproximadamente 190 horas de voz sintética en turco: 41 horas procedentes de pocket-tts-turkish en las cuatro voces de asistente (frases generales de Mozilla Common Voice Turkish, CC0, y plantillas de atención al cliente con nombres, números, fechas y direcciones inventados), y 150 horas de Trendyol-TTS en las seis voces diseñadas (frases generales en turco). Cada clip se alineó forzosamente a sus fonemas con `facebook/wav2vec2-lv-60-espeak-cv-ft` y solo se conservaron 154.000 clips con alineamiento confiable. Los clips con errores de pronunciación del profesor o de la primera palabra de frase se detectaron con Whisper y se reemplazaron o descartaron antes del fine-tune final.

La innovación principal es el fonemizador clarvia-phonemizer, que integra reglas de normalización textual (identificadores leídos por grupos, fechas, horas, rangos, moneda en liras y kuruş, porcentajes, unidades, ordinales, números de casa y pisos, abreviaturas, correos y direcciones web, y sufijos turcos tras números con armonía vocálica) junto con reglas de letras del turco (k y g palatales ante vocales anteriores, l clara y oscura, alargamiento de ğ, vocales con circunflejo, nasal velar) y reglas de acento (acento final por defecto, sufijos átonos, regla de Sezer para topónimos y lista de excepciones para préstamos y marcas).

## Capacidades

- Generación de voz en turco a 24 kHz mono con 10 voces predefinidas (`male_1` a `male_5`, `female_1` a `female_5`).
- Lectura contextual de números, fechas, horas, rangos, importes en liras y kuruş, porcentajes, unidades, ordinales, números de casa y pisos, abreviaturas, correos y direcciones web.
- Lectura de identificadores por grupos (teléfonos, cuentas, números de instalación) y de números de tarjetas o códigos largos.
- Aplicación de sufijos turcos tras números con armonía vocálica (por ejemplo, "14:30'da" → "on dört otuzda").
- Reglas fonéticas turcas específicas: k y g palatales, l clara y oscura, alargamiento de ğ, vocales con circunflejo y nasal velar.
- Reglas de acento: acento final por defecto, sufijos átonos, regla de Sezer para topónimos y lista de excepciones para préstamos y marcas.
- Control en inferencia de velocidad (`speed`), desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`).
- Ejecución en navegador mediante onnxruntime-web y del fonemizador bajo Pyodide (Python puro sin dependencias).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz telefónica para atención al cliente: el modelo lee de forma natural números de teléfono, cuentas e instalación agrupados en bloques, además de fechas y horas con sufijos turcos correctos, lo que reduce la necesidad de un paso externo de text normalization en IVR y sistemas de respuesta automática.
- Lectura de facturas y avisos de pago: interpreta importes con separadores de miles y decimales ("1.250,50 TL" → "bin iki yüz elli lira elli kuruş"), porcentajes y unidades como "TL/kWh", adecuado para notificaciones de cobro y recordatorios de deuda.
- Anuncios de citas y reservas: convierte "Randevunuz 18.11.2026 saat 14:30'da" en una locución correcta en turco, útil en clínicas, peluquerías y servicios con agenda.
- Sistemas de megafonía y avisos en establecimientos: al ejecutarse a unas 25 veces tiempo real en un solo hilo de CPU y ocupar 21 MB en ONNX, puede desplegarse en dispositivos empotrados o terminales de bajo coste para anuncios de turnos y llamadas.
- Accesibilidad y lectura de pantalla en turco: integrable en aplicaciones de escritorio o web (Pyodide + onnxruntime-web) para leer contenido con números, fechas y direcciones de forma inteligible sin depender de servicios en la nube.
- Demos y prototipos en navegador: el par fonemizador + modelo ONNX se ejecuta íntegramente en el cliente, lo que permite probar voces y velocidades sin infraestructura de servidor ni coste por petición.
- Generación de locuciones para contenidos educativos o de e-learning en turco: las 10 voces y los controles de pitch y velocidad permiten producir variaciones de narración para distintos segmentos de audiencia.

## Benchmarks y rendimiento

El autor reporta word error rate (WER) medido con Whisper large-v3 sobre audio generado por el modelo a partir de texto, comparando dígitos dígito a dígito. No se han publicado resultados de benchmarks estándar de TTS (MOS, MCD, etc.) en la información disponible.

| Conjunto | clarvia-tts-tiny | Audio del profesor |
|---|---|---|
| Frases de validación reservadas | 2,7 % | 6,6 % |
| Frases de test reservadas | 2,0 % | 2,7 % |
| Frases nuevas de atención al cliente (números, fechas, dinero, horas) | 4,9 % | no disponible |

Los conjuntos reservados son pequeños (16 frases cada uno), por lo que el autor advierte que las diferencias de pocos puntos deben tratarse como ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ONNX ocupa 21 MB en float32, por lo que la huella de memoria es mínima (del orden de decenas de MB incluyendo buffers de inferencia); no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y para ejecución en navegador, por lo que no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores; el autor indica que funciona en un teléfono o en una pestaña de navegador.
- Opciones de despliegue: onnxruntime (Python) y onnxruntime-web (navegador); el fonemizador clarvia-phonemizer es Python puro sin dependencias y funciona bajo Pyodide. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 25 veces tiempo real en un solo hilo de CPU, según el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, el propio autor indica que clarvia-tts-tiny es la versión turca de tiny-voca (misma arquitectura acústica y generador de waveform), pero no se aportan métricas comparativas entre ambos ni con otros sistemas TTS turcos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| clarvia-tts-tiny | 4,5 M | no aplica | Apache 2.0 | Hugging Face (ONNX) |
| tiny-voca | no disponible | no aplica | no disponible | GitHub |
| Alternativas TTS turcas | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Solo turco: las palabras extranjeras fuera de la lista de excepciones se leen con las reglas de letras del turco.
- Hereda errores de sus profesores: donde una voz profesora pronunciaba mal una palabra de forma consistente, el modelo lo aprendió; el autor indica que corrigió los casos encontrados y pide reportar otros.
- Las vocales iniciales de frase a veces se difuminan en `male_1` y `female_1` (por ejemplo, "Ahşap" puede sonar como "şap").
- Entrenado íntegramente con voz sintética (190 horas), lo que puede introducir artefactos propios de los profesores y limitar la naturalidad frente a modelos entrenados con voz humana.
- Los conjuntos de evaluación reservados son muy pequeños (16 frases), por lo que las métricas de WER tienen alta incertidumbre.
- No se han publicado datos de sesgo, robustez ante ruido de entrada ni evaluación de MOS; se desconoce el comportamiento en dominios muy alejados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datos y modelos profesores subyacentes (Common Voice Turkish CC0, pocket-tts-turkish, Trendyol-TTS) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wite-tech/clarvia-tts-tiny
- Fonemizador clarvia-phonemizer: https://huggingface.co/wite-tech/clarvia-phonemizer
- Proyecto tiny-voca (GitHub): https://github.com/n4ze3m/tiny-voca
- Modelo de alineamiento usado: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
