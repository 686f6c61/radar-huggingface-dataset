# tablinum/CueBall-Voice

## Resumen

CueBall Voice v0.3 Full NCS1 es un sistema de síntesis de voz (text-to-speech) en inglés desarrollado por tablinum dentro del proyecto Rack Lab. Su particularidad es que está diseñado para ejecutarse íntegramente sobre el Intel Neural Compute Stick original (NCS1, chip Myriad-2), un acelerador USB de bajo consumo descatalogado, mediante grafos OpenVINO en FP16. El sistema se compone de tres etapas: un encoder, un decodificador mel y un vocoder HiFi-GAN V1 completo, mientras que el host asume la fonemización, la expansión de duraciones y la escritura del WAV final.

El modelo resuelve un problema muy concreto: la síntesis de voz continua en hardware de inferencia de borde con recursos extremadamente limitados (37,9 MB de pesos en FP16 para la variante completa). No es un modelo de propósito general ni compite en calidad con los TTS neuronales modernos; su interés radica en la viabilidad técnica de ejecutar un pipeline acústico completo en un dispositivo USB de segunda generación.

La versión v0.3 se publica junto a una variante Student más ligera (17,1 MB) y una versión FP32 ONNX para CPU, todas ellas con la misma voz sintética única y soporte exclusivo de inglés. La licencia es MIT y el repositorio tiene un tamaño declarado de 0,0 GB, lo que sugiere que los pesos se distribuyen en los repositorios hermanos enlazados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en tres grafos: encoder, decodificador mel y vocoder HiFi-GAN V1 |
| Parámetros totales | no disponible (footprint de pesos: 37.873.150 bytes en FP16 IR para la variante Full; 17.132.414 bytes para la Student) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 128 tokens de fonemas por llamada; hasta 512 frames log-mel predichos |
| Tipos de cuantización | FP16 (grafos IR para NCS1) y FP32 (grafos ONNX para CPU) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (BIN) en FP16 para NCS1; ONNX en FP32 para CPU |

## Arquitectura y entrenamiento

La arquitectura es un pipeline acústico en cascada compuesto por tres redes separadas que se ejecutan secuencialmente como grafos OpenVINO: un encoder que transforma la secuencia de fonemas en representaciones latentes, un decodificador mel que genera hasta 512 frames de log-mel, y un vocoder HiFi-GAN V1 completo que convierte el mel en PCM mono a 22.050 Hz. El host se encarga de la fonemización (vía eSpeak NG 1.52.0), la expansión de duraciones y la escritura del fichero WAV. La variante Student reduce el footprint aproximadamente a la mitad (17,1 MB frente a 37,9 MB) manteniendo la misma interfaz de tres grafos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal; la innovación principal es de despliegue: conseguir que un vocoder HiFi-GAN V1 completo y el resto del pipeline quepan y se ejecuten en un NCS1. La model card menciona "continuous-acoustics" como etiqueta, indicando que esta versión sustituye a las releases anteriores basadas en unit-selection.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con una única voz sintética.
- Fonemización en el host mediante eSpeak NG 1.52.0.
- Generación de hasta 512 frames log-mel por llamada, con un máximo de 128 tokens de fonemas.
- Salida de audio PCM mono a 22.050 Hz.
- Ejecución completa en el Intel NCS1 (Myriad-2) mediante tres grafos FP16, o en CPU mediante grafos ONNX FP32.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni comportamiento agéntico.
- No dispone de modo thinking, visión ni audio de entrada.
- No es multilingüe: solo inglés.
- No es un sistema voice-to-voice; requeriría ASR y lógica de respuesta separados.

## Casos de uso

- Síntesis de voz en dispositivos de borde con hardware heredado: el pipeline completo cabe en un NCS1 (37,9 MB en FP16) y produce audio a 22.050 Hz, lo que permite dotar de voz a sistemas embebidos que ya dispongan de este acelerador USB.
- Investigación sobre TTS en hardware restringido: la model card está orientada explícitamente a investigación en síntesis continua sobre Myriad-2, con métricas reproducibles (prompts Fresh-10, scorer Whisper Tiny English) y ficheros de medición publicados.
- Evaluación comparativa Full frente a Student: la variante Student ofrece 3,15 veces más throughput de síntesis (mediana de 3,343 s frente a 10,517 s en NCS1) a cambio de un edit adicional en 77 palabras de referencia, lo que permite estudiar el compromiso calidad/latencia en el mismo hardware.
- Avisos cortos y predecibles en sistemas locales: la model card recomienda las releases compactas de unit-selection para prompts breves y predecibles en NCS1, un escenario típico de señalética hablada o alertas de estado.
- Prototipado de asistentes de voz sin conectividad: al ejecutarse localmente sobre USB y con dependencias fijadas (OpenVINO 2020.3.2, Python 3.7), el sistema es adecuado para demostradores offline de interacción por voz.
- Reproducción de experimentos académicos: los JSON de mediciones (ASR, timings, prompts) y los checksums SHA256 permiten replicar los resultados en CPU y en NCS1 con un pipeline documentado paso a paso.

## Benchmarks y rendimiento

| Configuración | Formato | Footprint del modelo | Mediana residente | Fresh-10 word error |
|---|---|---:|---:|---:|
| Full V1 en NCS1 original | Pesos IR FP16 | 37.873.150 bytes | 10,517 s | 22/77 ediciones · 28,6 % |
| Student en NCS1 original | Pesos IR FP16 | 17.132.414 bytes | 3,343 s | 23/77 ediciones · 29,9 % |
| Full V1 en CPU | Grafos ONNX FP32 | 75.800.899 bytes | 2,886 s | 17/77 ediciones · 22,1 % |
| Student en CPU | Grafos ONNX FP32 | 34.319.280 bytes | 0,790 s | 20/77 ediciones · 26,0 % |

Las cuatro ejecuciones usan los mismos diez prompts en inglés y el mismo scorer congelado Whisper Tiny English. La variante Student en NCS1 alcanzó un factor de tiempo real mediano de 1,23. Ambas rutas nativas incumplieron los objetivos experimentales de menos del 14,8 % de word error y 300 ms de latencia en caliente. El vocoder-only score de referencia de la Student fue de 23/229 ediciones (10,0 %). Las pruebas en CPU se realizaron con un Intel Core i7-12650H y un solo hilo intra-op de ONNX Runtime. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada: no aplica; el NCS1 es un acelerador USB sin VRAM dedicada y la ruta CPU ejecuta grafos ONNX en memoria del sistema (footprint de pesos de 34,3 a 75,8 MB).
- GPU recomendadas: ninguna; la model card no menciona soporte CUDA. El hardware objetivo es el Intel NCS1 (Myriad-2) o CPU x86.
- Cabe en GPU de consumo: no aplica, ya que el diseño no usa GPU.
- Despliegue: OpenVINO 2020.3.2 con Python 3.7, NumPy y eSpeak NG 1.52.0 en Windows para la ruta NCS1; ONNX Runtime para la ruta CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este pipeline).
- Latencia y throughput: mediana residente de 10,517 s (Full NCS1), 3,343 s (Student NCS1), 2,886 s (Full CPU) y 0,790 s (Student CPU) por prompt; factor de tiempo real mediano de 1,23 para la Student en NCS1.
- El dispositivo NCS1 se identifica como USB 03E7:2150.

## Comparativa con modelos similares

| Modelo | Parámetros / footprint | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CueBall Voice v0.3 Full NCS1 | 37,9 MB FP16 IR | 128 fonemas / 512 frames mel | 28,6 % WER Fresh-10 en NCS1 | MIT | Hugging Face |
| CueBall Voice v0.3 Student NCS1 | 17,1 MB FP16 IR | 128 fonemas / 512 frames mel | 29,9 % WER Fresh-10 en NCS1 | MIT | Hugging Face |
| CueBall Voice v0.3 FP32 ONNX | 75,8 MB (Full) / 34,3 MB (Student) | 128 fonemas / 512 frames mel | 22,1 % WER (Full) / 26,0 % (Student) en CPU | MIT | Hugging Face |
| TTS neuronales modernos de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no ofrece comparación con otros sistemas TTS; la comparativa se limita a las variantes de la propia familia CueBall Voice (v0.1, v0.2, v0.3 Student, v0.3 ONNX).

## Limitaciones y advertencias

- Calidad de inteligibilidad limitada: el mejor resultado publicado es un 22,1 % de word error en CPU (Full), lejos de los objetivos experimentales de menos del 14,8 %.
- Latencia elevada en NCS1: la mediana residente de la variante Full es de 10,517 s por prompt, muy por encima del objetivo de 300 ms en caliente.
- Una única voz sintética y solo inglés; no hay soporte multilingüe ni de cambio de hablante.
- La evaluación se limita a diez prompts en inglés; naturalidad, textos más amplios, hablantes y otros idiomas requieren evaluación separada según la propia model card.
- Riesgo de alucinación acústica y errores de pronunciación en textos fuera del dominio evaluado; no se han publicado análisis de sesgos.
- Dependencias muy frágiles: OpenVINO 2020.3.2, Python 3.7 y eSpeak NG 1.52.0 en Windows, versiones antiguas y sin soporte activo.
- No es un sistema conversacional: requiere ASR y lógica de respuesta externos para cualquier flujo voice-to-voice.
- Licencia MIT permite uso comercial, pero la model card no ofrece garantías de calidad para producción y desaconseja explícitamente su uso más allá de investigación en síntesis continua y prompts cortos y predecibles.
- El repositorio principal declara 0,0 GB; los pesos deben obtenerse de los repositorios hermanos enlazados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/CueBall-Voice
- Variante Student NCS1: https://huggingface.co/tablinum/CueBall-Voice-NCS1-Student
- Variante FP32 ONNX: https://huggingface.co/tablinum/CueBall-Voice-ONNX
- Versión v0.2 Resident: https://huggingface.co/tablinum/CueBall-Voice-v0.2-NCS1
- Versión v0.1 Original: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1
- Organización Rack Lab: https://huggingface.co/racklab
- Demo The Break Room: https://huggingface.co/spaces/tablinum/The-Break-Room
- Colección de la familia: https://huggingface.co/collections/tablinum/the-break-room-6b0227343f3237d2a8c08b7f
- Toolchain MyriadForge: https://github.com/chadstthomas-svg/myriadforge
- Roadmap NCS1: https://github.com/chadstthomas-svg/myriadforge/blob/main/docs/NCS1_ROADMAP.md
- Instrucciones de instalación: https://huggingface.co/tablinum/CueBall-Voice/blob/main/INSTALL.md
- Avisos de procedencia y licencia: https://huggingface.co/tablinum/CueBall-Voice/blob/main/NOTICE.md
- Checksums: https://huggingface.co/tablinum/CueBall-Voice/blob/main/SHA256SUMS.txt
