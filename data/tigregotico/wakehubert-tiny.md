# TigreGotico/wakehubert-tiny

## Resumen

WakeHuBERT tiny es un extractor de características de voz en streaming para detección de palabras de activación (wake-word), destilado a partir de facebook/hubert-base-ls960. Desarrollado por TigreGotico en el ecosistema de OpenVoiceOS y wakeforge, resuelve el problema de ejecutar un detector de wake-word fiable en dispositivos con recursos limitados: convierte audio a 16 kHz en vectores de 128 dimensiones a 50 fotogramas por segundo, de modo que un clasificador pequeño entrenado únicamente con voz sintética puede detectar una palabra de activación especificada como texto.

El modelo tiene 824.288 parámetros (0,82M) y una arquitectura estrictamente causal basada exclusivamente en convoluciones, batch norm y ReLU, lo que facilita su cuantización a int8. Se distribuye en formato ONNX (float e int8, con variantes estáticas y de streaming) y está pensado para ejecutarse en CPU: el grafo int8 procesa bloques de 1.280 muestras en torno a 1 ms por núcleo.

Su relevancia actual radica en la combinación de latencia baja, huella mínima y entrenamiento con datos sintéticos: permite crear detectores de wake-word personalizados sin grabar horas de audio del usuario, manteniendo un recall del 95% en silencio a 0,5 falsas activaciones por hora sobre hablantes reales del benchmark de Picovoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN causal: front-end log-mel (64 bins) + convolución con stride + 8 bloques de convolución dilatada depthwise-separable (256 canales) + proyección 1x1 a 128 |
| Parametros totales | 824.288 (0,82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | campo receptivo de 2,5 s (40.000 muestras a 16 kHz); salida de 50 fotogramas/s |
| Tipos de cuantizacion | float32 e int8 estático (front-end en float en la versión int8) |
| Idiomas soportados | en, de, nl, fr, es, it, pt, pl (multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (wakehubert.onnx, wakehubert_int8.onnx, wakehubert_stream.onnx, wakehubert_int8_stream.onnx); safetensors en el repo |

## Arquitectura y entrenamiento

El modelo es un estudiante convolucional causal compuesto por un front-end log-mel fijo de 64 bins, una convolución con stride que reduce a 50 fotogramas por segundo, ocho bloques de convolución dilatada depthwise-separable de 256 canales y una proyección 1×1 a 128 dimensiones. Solo emplea convolución, batch norm y ReLU, una elección deliberada para que la cuantización int8 sea estable. La causalidad es estricta: el fotograma *t* depende únicamente del audio anterior a la muestra 320·(t+1).

El entrenamiento consistió en 30.000 pasos de destilación de conocimiento desde HuBERT-base, prediciendo las capas 4, 8 y 12 estandarizadas con pérdida L1 más coseno log-sigmoidal (el esquema de DistilHuBERT). El profesor escuchaba voz limpia mientras el estudiante recibía ruido de AudioSet y MUSAN, reverberación y de uno a tres hablantes de fondo nunca más fuertes que la voz; una cuarta parte de los ítems eran sonidos no vocales idénticos para ambos. Se aplicó enmascaramiento de tramos del log-mel de entrada (probabilidad 0,065 por fotograma, tramos de 10 fotogramas), que según el autor fue la mayor ganancia individual en robustez. Los datos de entrenamiento fueron LibriSpeech (960 h), Multilingual LibriSpeech (siete idiomas) y una muestra equilibrada por idioma de Multilingual Spoken Words (41 idiomas), cortados en 600.000 fragmentos de dos segundos. El estudiante se entrenó para reproducir cada fotograma de HuBERT cinco fotogramas (100 ms) más tarde, por lo que las características describen el habla con un retardo de unos 100 ms.

## Capacidades

- Extracción de características de voz en streaming a 50 fotogramas/s con 128 dimensiones por fotograma, a partir de audio float32 a 16 kHz en el rango -1..1.
- Diseño causal estricto, apto para inferencia en tiempo real con estado persistente entre bloques.
- Grafos de streaming (float e int8) que calculan solo los fotogramas nuevos y conservan el resto como estado, evitando recalcular la ventana completa en cada bloque.
- Base para clasificadores de wake-word entrenados con voz sintética: el detector se entrena sobre las características, no sobre audio crudo.
- Capacidades multilingües derivadas de los datos de entrenamiento (en, de, nl, fr, es, it, pt, pl y cobertura más amplia vía Multilingual Spoken Words).
- Cuantización int8 con alta fidelidad respecto a float (coseno medio de 0,998).
- No incluye cabecera de clasificación: es un extractor de características (pipeline feature-extraction), no un detector listo para usar.
- No soporta tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Detección de wake-word en asistentes de voz locales: el extractor alimenta un GRU pequeño entrenado con clips TTS de la palabra elegida, lo que permite crear un detector personalizado sin grabar audio del usuario; el recall del 95% en silencio a 0,5 falsas activaciones por hora lo hace viable en entornos domésticos.
- Ejecución en dispositivos embebidos y Raspberry Pi: con menos de 1M de parámetros y ~1 ms por bloque de 1.280 muestras en int8 sobre un núcleo de CPU, cabe en hardware sin GPU y deja margen para el resto del pipeline de ASR.
- Asistentes de voz con activación por palabra en múltiples idiomas: al haberse entrenado con datos de ocho idiomas, el mismo extractor sirve para wake-words en castellano, alemán, neerlandés, francés, italiano, portugués y polaco sin reentrenar el extractor.
- Integración en pipelines de OpenVoiceOS/wakeforge: `ww_trainer-train --featurizer wakehubert` descarga y usa el modelo directamente para entrenar detectores dentro del ecosistema.
- Procesamiento de audio en streaming de bajo consumo: los grafos `*_stream.onnx` mantienen estado entre bloques, adecuados para micrófonos continuos donde recalcular la ventana de 1,5 s cada bloque costaría ~2,7 ms frente a ~1 ms.
- Filtrado previo en sistemas de transcripción: usar el detector como etapa de activación antes de lanzar un ASR más pesado, reduciendo el consumo energético en dispositivos alimentados por batería.
- Investigación en destilación de modelos de voz: sirve como referencia reproducible de destilación de HuBERT-base a un estudiante convolucional causal con cuantización int8.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), con un clasificador GRU entrenado solo con 900 clips sintéticos de «alexa» y evaluado sobre 315 grabaciones de hablantes reales del benchmark de Picovoice; umbral calibrado para 0,5 falsas activaciones por hora:

| Extractor | Recall en silencio (IC 95%) | Recall en babble 10 / 5 / 0 dB | Falsas activaciones/hora medidas |
|---|---|---|---|
| WakeHuBERT tiny (0,64M) | 95% (92–97) | 94 / 85 / 56% | 0,31 |
| Misma arquitectura sin enmascaramiento | 92% (89–95) | 90 / 80 / 39% | no disponible en la información |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser tareas aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para CPU. El repo ocupa 0,0 GB y los pesos rondan los pocos MB.
- GPU recomendadas: no necesarias; cualquier GPU sirve vía ONNX Runtime, pero el diseño apunta a inferencia en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU (Raspberry Pi, móviles, SBC).
- Despliegue: ONNX Runtime (probado en el ejemplo de la model card); integración vía wakeforge/OpenVoiceOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: ~1 ms por bloque de 1.280 muestras en int8 sobre un núcleo de CPU, frente a ~2,7 ms para recalcular una ventana de 1,5 s. Fidelidad del streaming: 7,6e-6 respecto al grafo completo en float; en int8, desviación máxima de 0,19 en ~113 de 3.000 fotogramas en 60 s de habla con ruido, sin acumulación en streams de 10 minutos.
- Retardo funcional: ~100 ms por el objetivo de predicción desplazado cinco fotogramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / diseño | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WakeHuBERT tiny | 0,82M | Causal, campo receptivo 2,5 s | Extractor para wake-word | Apache 2.0 | Hugging Face (ONNX) |
| facebook/hubert-base-ls960 | ~95M | No causal, contexto completo | Extracción de características | No disponible en la información | Hugging Face |
| Misma arquitectura sin enmascaramiento (ablación del autor) | 0,64M | Causal | Extractor para wake-word | No disponible | Solo como resultado del paper/model card |

No se dispone de datos de otros detectores de wake-word comparables (por ejemplo, Porcupine o modelos de Picovoice) en la información proporcionada.

## Limitaciones y advertencias

- No es un detector de wake-word autónomo: requiere entrenar una cabecera clasificadora sobre sus características; la palabra de activación se define en ese entrenamiento.
- Los resultados declarados son ejecuciones únicas y no verificados (`verified: false`); deben tratarse como indicativos.
- El recall cae al 56% en babble a 0 dB, por lo que en entornos muy ruidosos la detección se degrada notablemente.
- Retardo inherente de ~100 ms más el retardo del clasificador: no apto para activación con latencia ultrabaja por debajo de ese margen.
- En los grafos de streaming, `samples` debe ser múltiplo entero de 320; el grafo no lo comprueba y cualquier otra longitud produce características erróneas sin error.
- Para streaming correcto hay que mantener 40.000 muestras (2,5 s) de contexto; de lo contrario los fotogramas en streaming no coinciden con los offline.
- En int8 puede aparecer una desviación localizada (hasta 0,19, dos pasos de cuantización) en tramos de habla con ruido, aunque no se acumula.
- Riesgo de falsas activaciones y de sesgo hacia las condiciones acústicas de los datos de entrenamiento (mayoritariamente inglés y MLS); el rendimiento en idiomas con menor representación no está medido.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento en producción.
- No apto para tareas de reconocimiento de voz completo, razonamiento, código ni generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/wakehubert-tiny
- Repositorio wakeforge: https://github.com/TigreGotico/wakeforge
- Modelo base: https://huggingface.co/facebook/hubert-base-ls960
- Benchmark de wake-word de Picovoice: https://github.com/Picovoice/wake-word-benchmark
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset Multilingual Spoken Words: https://huggingface.co/datasets/MLCommons/ml_spoken_words
