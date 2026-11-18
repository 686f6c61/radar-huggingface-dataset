# ymelka/tiny-voca-english-onnx

## Resumen

Tiny Voca English ONNX es una exportación optimizada a formato ONNX del modelo de síntesis de voz (text-to-speech) Tiny Voca, desarrollado originalmente por Muhammed Nazeem (n4ze3m). Esta versión, publicada por el usuario ymelka, convierte el checkpoint inglés original a un grafo ONNX en precisión FP32 que puede ejecutarse tanto en ONNX Runtime nativo como en navegador mediante ONNX Runtime Web. El modelo está diseñado para síntesis de voz ligera en inglés con dos voces predefinidas (F2 y M2) a una frecuencia de muestreo de 24 kHz.

El interés principal de esta release radica en su tamaño extremadamente reducido: 4.537.291 parámetros aprendidos y un fichero de 21,36 MB. Esto lo sitúa en la categoría de modelos TTS embebibles, aptos para ejecución en CPU sin GPU dedicada e incluso en entornos web. El autor reporta que el grafo FP32 reproduce con exactitud las duraciones y el número de muestras del modelo original, con una SNR mínima de 143,42 dB en ONNX Runtime nativo y 140,53 dB en ONNX Runtime Web.

La ficha se centra en las características verificables del artefacto publicado: exportación FP32, opset 17, generación de ruido interna, salidas `audio` y `durations`, y procesamiento de una utterance por inferencia. No se dispone de información sobre benchmarks de calidad perceptual ni sobre el proceso de entrenamiento original más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS original Tiny Voca; grafo ONNX opset 17) |
| Parámetros totales | 4.537.291 parámetros aprendidos |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una utterance por inferencia) |
| Tipos de cuantización | FP32 (publicado); INT8 en investigación, pendiente de validación por escucha ciega |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`exact.onnx`, FP32, 21,36 MB) |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces disponibles | F2 (índice 0) y M2 (índice 1) |
| Runtime | ONNX Runtime 1.32.0 (nativo), ONNX Runtime Web 1.20.1 WASM |
| Salidas del grafo | `audio` y `durations` |
| Frame de duración | 256 muestras |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original Tiny Voca en la documentación proporcionada. La model card de esta exportación describe únicamente el artefacto ONNX: un grafo completo de síntesis con opset estándar 17, generación de ruido interna y las salidas originales `audio` y `durations`. El grafo opera sobre una utterance a la vez y mantiene las formas tensoriales, la procedencia y los hashes de los artefactos documentados en `manifest.json`.

Respecto al entrenamiento, la información disponible indica que el modelo base es `n4ze3m/tiny-voca`, entrenado presumiblemente sobre el dataset `n4ze3m/tiny-voca` (referenciado en las etiquetas), pero no se detallan el número de tokens, la composición del corpus, ni si hubo etapas de RLHF o DPO. Tampoco se especifica la innovación técnica del modelo original más allá de su reducido tamaño. La aportación de esta release es la exportación fiel a ONNX: el autor reporta que, con ruido compartido, el grafo FP32 preservó todas las duraciones y recuentos de muestras en pruebas nativas y en Chromium, con una SNR mínima de 143,42 dB (nativo) y 140,53 dB (Web), evaluado sobre 100 textos en inglés en ambas voces y un conjunto independiente de 24 renders difíciles.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz.
- Dos voces predefinidas: F2 (femenina) y M2 (masculina), seleccionables por índice.
- Control de velocidad (`speed`) y de rango de tono (`pitch_range`) como multiplicadores.
- Control de desplazamiento de tono (`pitch_shift`) en unidades de frecuencia logarítmica natural.
- Generación interna de ruido dentro del propio grafo ONNX.
- Salida de duraciones en frames de 256 muestras, útil para alineamiento y control temporal.
- Ejecución en CPU nativa y en navegador mediante ONNX Runtime Web (WASM).
- Fonemización de texto personalizado mediante la librería Dizione (fijada a una revisión concreta) y los assets del fonemizador upstream.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente TTS.
- No dispone de capacidades de visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones web: el modelo puede ejecutarse en el navegador con ONNX Runtime Web (WASM) y sintetizar párrafos en inglés sin enviar texto a un servidor, gracias a su tamaño de 21,36 MB y a la generación interna de ruido.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 4,5 millones de parámetros y ejecución en CPU, cabe en entornos sin GPU y permite respuestas habladas en inglés con latencia reducida (el autor reporta reducciones de latencia del 2,7 % al 10,6 % frente a la referencia en sus pruebas).
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o extensiones que conviertan texto seleccionado en audio, seleccionando la voz F2 o M2 según preferencia del usuario.
- Generación de avisos y notificaciones pregrabadas: síntesis por lotes de frases cortas con control de velocidad y tono para producir mensajes de sistema, alarmas o instrucciones de uso.
- Prototipado rápido de interfaces conversacionales: al ser un grafo ONNX autocontenido con ejemplo de inferencia incluido, permite validar pipelines TTS en etapas tempranas de desarrollo sin depender de servicios en la nube.
- Pruebas de integración en pipelines de CI/CD: los hashes en `SHA256SUMS` y el `manifest.json` permiten verificar la integridad del artefacto y automatizar pruebas de regresión de audio (duraciones y recuentos de muestras) en cada despliegue.
- Investigación en TTS ligero: sirve como referencia reproducible para comparar exportaciones ONNX (FP32 frente a la candidata INT8 en investigación) y medir fidelidad de waveform mediante SNR.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad perceptual (MOS, CMOS) ni resultados en conjuntos estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS. Los datos disponibles son métricas de fidelidad y latencia del artefacto ONNX.

| Métrica | Resultado |
|---|---|
| SNR mínima de waveform (ONNX Runtime nativo) | 143,42 dB |
| SNR mínima de waveform (ONNX Runtime Web) | 140,53 dB |
| Textos evaluados (nativo) | 100 textos en inglés, ambas voces |
| Renders difíciles adicionales | 24, con duraciones y recuentos de muestras preservados |
| Reducción mediana de latencia texto-a-audio (pasaje de 1,97 s, AMD EPYC 9V74) | 6,7–10,6 % (nativo, 1 hilo); 8,3–9,3 % (nativo, 4 hilos); 2,7–5,0 % (Chromium, 1 hilo); 8,0–10,2 % (Chromium, 4 hilos) |

Las mediciones de latencia son extremo a extremo e incluyen fonemización y entrega de waveform. Se realizaron con ONNX Runtime 1.32.0 en CPU y Chromium 159 con ONNX Runtime Web 1.20.1 WASM sobre Linux. El autor advierte que el rendimiento depende de la longitud de la frase y del número de hilos, y que móvil, Safari, arranque en red y otras arquitecturas de CPU quedaron fuera del benchmark.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. A continuación se recogen los datos del propio artefacto y las alternativas de despliegue que menciona la model card, sin cifras de rendimiento de terceros que no hayan sido verificadas.

| Modelo / variante | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Voca English ONNX (FP32) | 4.537.291 | no disponible (una utterance por inferencia) | Apache-2.0 | ONNX | Publicado en Hugging Face |
| Tiny Voca English ONNX (INT8) | no disponible | no disponible | no disponible | ONNX | En investigación, escucha ciega pendiente |
| Tiny Voca original (n4ze3m) | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- Procesa una utterance por inferencia; el autor recomienda dividir pasajes largos antes de la síntesis, como hace la demo upstream.
- Solo incluye dos voces (F2 y M2); no hay clonación de voz ni voces adicionales.
- La cuantización INT8 está en investigación y pendiente de validación por escucha ciega; no debe usarse en producción sin evaluar la calidad perceptual.
- Los benchmarks de latencia se limitan a un pasaje de 1,97 s en AMD EPYC 9V74 y Linux; no cubren móvil, Safari, arranque en red ni otras arquitecturas de CPU.
- No se han publicado métricas de calidad perceptual (MOS, CMOS) ni evaluaciones de sesgo o robustez del modelo original.
- El riesgo de alucinación en el sentido de generación de contenido no aplica, pero sí existe riesgo de pronunciación incorrecta o artefactos acústicos en textos atípicos; el autor evaluó 24 renders difíciles sin reportar problemas de duración, no de inteligibilidad.
- El uso de texto personalizado requiere instalar Dizione en una revisión concreta y apuntar `DIZIONE_DATA` a los assets del fonemizador upstream, que tienen sus propias licencias.
- La licencia Apache-2.0 cubre el grafo ONNX y el ejemplo; se debe atribuir a Muhammed Nazeem y citar la release original de Tiny Voca, además de respetar las licencias del código y datos de Dizione.
- No hay información sobre sesgos de género, acento o dialecto en las dos voces incluidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ymelka/tiny-voca-english-onnx
- Modelo base Tiny Voca: https://huggingface.co/n4ze3m/tiny-voca
- Assets del fonemizador upstream: https://huggingface.co/n4ze3m/tiny-voca/tree/d94d2a0338fd1e0eab7dd896ec0ad23d8cdf7c14/phonemizer
- Librería Dizione (revisión fijada): https://github.com/n4ze3m/dizione/tree/8cd889e4de7be6bd1dd2e6891344a0729fa14dd4
- Benchmark y resultados en bruto: https://github.com/yoch/tiny-voca/pull/2
- Dataset referenciado: https://huggingface.co/datasets/n4ze3m/tiny-voca
