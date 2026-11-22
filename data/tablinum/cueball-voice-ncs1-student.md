# tablinum/CueBall-Voice-NCS1-Student

## Resumen

CueBall Voice v0.3 NCS1 Student es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por tablinum dentro del proyecto Rack Lab. Se trata de la variante destilada de la familia CueBall Voice v0.3, diseñada específicamente para ejecutarse en el acelerador neuronal Intel Movidius Myriad 2, conocido comercialmente como Intel Neural Compute Stick 1 (NCS1). El modelo combina grafos acústicos continuos con un vocoder HiFi-GAN destilado de 256 canales, y todas sus etapas aprendidas se ejecutan como grafos FP16 sobre el hardware original.

La relevancia de esta release radica en su enfoque en inferencia local sobre hardware de bajo consumo y descatalogado: el modelo completo ocupa 17.132.414 bytes en pesos IR FP16 nativos, frente a los 37.873.150 bytes de la versión completa, lo que supone una reducción de aproximadamente el 55 % en huella de modelo. Según las mediciones del autor, esta compactación se traduce en una mejora de 3,15 veces en throughput de síntesis secuencial sobre NCS1, con un coste de un único error adicional de palabra sobre 77 palabras de referencia.

El modelo acepta hasta 128 tokens de fonemas por llamada, predice hasta 512 tramas log-mel y devuelve PCM mono a 22.050 Hz. Está pensado para investigación en síntesis continua y para escenarios de inferencia local en dispositivos con recursos muy limitados, no para producción de alta fidelidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS de tres etapas aprendidas: grafos acústicos continuos (v0.3) más vocoder HiFi-GAN destilado de 256 canales; grafos ejecutados como FP16 IR sobre NCS1 y FP32 ONNX sobre CPU |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; límite de 128 tokens de fonemas por llamada y hasta 512 tramas log-mel de salida |
| Tipos de cuantización | FP16 (IR nativo para NCS1) y FP32 (grafos ONNX para CPU); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | IR de OpenVINO (FP16, tres ficheros BIN) y ONNX (FP32, tres grafos) |
| Frecuencia de muestreo de salida | 22.050 Hz, mono PCM |
| Huella del modelo (NCS1, FP16 IR) | 17.132.414 bytes |
| Huella del modelo (CPU, FP32 ONNX) | 34.319.280 bytes |
| Frontend fonético | eSpeak NG 1.52.0 |
| Runtime | OpenVINO 2020.3.2, Python 3.7, NumPy |
| Identificador USB del dispositivo | 03E7:2150 |

## Arquitectura y entrenamiento

El modelo sigue un diseño de pipeline TTS en tres etapas aprendidas que se ejecutan secuencialmente: los grafos acústicos continuos de la versión v0.3, que transforman la secuencia de fonemas en representaciones acústicas, y un vocoder HiFi-GAN destilado de 256 canales que convierte dichas representaciones en forma de onda PCM a 22.050 Hz. La naturaleza "Student" del modelo indica un proceso de destilación desde la versión completa v0.3 (denominada "Full NCS1" en la documentación), orientado a reducir el tamaño y el coste computacional manteniendo la inteligibilidad.

La innovación técnica principal es la ejecución íntegra del pipeline sobre un Intel NCS1 mediante grafos FP16 de OpenVINO, un hardware con recursos muy restringidos y sin soporte moderno. El autor reporta que las tres etapas aprendidas corren en el dispositivo original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna de los grafos acústicos más allá de su carácter continuo. El frontend fonético se apoya en eSpeak NG 1.52.0, lo que implica que la conversión texto-fonema es determinista y basada en reglas, no aprendida.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con una única voz sintética.
- Generación de audio PCM mono a 22.050 Hz.
- Procesamiento de hasta 128 tokens de fonemas por llamada y predicción de hasta 512 tramas log-mel.
- Síntesis continua (no unit-selection) gracias a los grafos acústicos v0.3.
- Ejecución local sobre Intel NCS1 (Myriad 2) y sobre CPU mediante ONNX Runtime.
- Conversión texto-fonema mediante eSpeak NG 1.52.0.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en síntesis continua sobre hardware restringido: el modelo permite experimentar con pipelines TTS de tres etapas sobre un NCS1, un dispositivo de bajo consumo y descatalogado, midiendo el equilibrio entre huella de modelo e inteligibilidad.
- Síntesis de voz local en dispositivos embebidos: con 17,1 MB de pesos FP16 y un factor de tiempo real medio de 1,23 sobre NCS1, puede integrarse en sistemas empotrados que requieran generación de voz sin conexión a la nube.
- Evaluación comparativa de destilación: sirve como referencia "student" frente a la versión completa v0.3 para estudiar la relación entre compactación, latencia y tasa de error de palabra en ASR.
- Pruebas de integración con OpenVINO 2020.3.2 y Python 3.7: útil para validar toolchains legacy de Intel en entornos de laboratorio.
- Generación de avisos cortos y predecibles: la documentación del autor recomienda las releases compactas de unit-selection para prompts cortos y predecibles; esta variante continua puede emplearse en prototipos de locución breve en inglés.
- Reproducción de benchmarks de inteligibilidad: los conjuntos de prompts "Fresh-10" y los resultados ASR publicados permiten replicar experimentos con un scorer Whisper Tiny English congelado.
- Docencia y demostraciones de TTS en hardware de borde: el bajo tamaño del repositorio y la licencia MIT facilitan su uso en cursos y talleres sobre inferencia en el borde.

## Benchmarks y rendimiento

| Configuración | Formato | Huella del modelo | Mediana residente | Error de palabra Fresh-10 |
|---|---|---|---|---|
| Full V1 en NCS1 original | Pesos IR FP16 | 37.873.150 bytes | 10,517 s | 22/77 ediciones · 28,6 % |
| Student en NCS1 original | Pesos IR FP16 | 17.132.414 bytes | 3,343 s | 23/77 ediciones · 29,9 % |
| Full V1 en CPU | Grafos ONNX FP32 | 75.800.899 bytes | 2,886 s | 17/77 ediciones · 22,1 % |
| Student en CPU | Grafos ONNX FP32 | 34.319.280 bytes | 0,790 s | 20/77 ediciones · 26,0 % |

Las cuatro ejecuciones emplean los mismos diez prompts en inglés y un scorer Whisper Tiny English congelado. El estudiante sobre NCS1 logra un throughput de síntesis 3,15 veces superior para esta carga secuencial, con una edición de palabra adicional sobre 77 palabras de referencia. El factor de tiempo real medio del estudiante sobre NCS1 es de 1,23. Las ejecuciones en CPU usaron un Intel Core i7-12650H con un hilo intra-op de ONNX Runtime; los tiempos excluyen la configuración y la escritura del WAV.

Ambas rutas nativas no alcanzaron los objetivos experimentales de menos del 14,8 % de error de palabra y 300 ms de latencia en caliente. La puntuación del vocoder del estudiante en solitario, con mel de referencia, fue de 23/229 ediciones (10,0 %). El test de diez prompts evalúa inteligibilidad; la naturalidad, textos más amplios, hablantes e idiomas requieren evaluación separada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo está diseñado para ejecutarse en el acelerador NCS1 (Myriad 2) o en CPU, no en GPU.
- GPU recomendadas: no se documentan; el pipeline objetivo es Intel NCS1 y CPU x86.
- ¿Cabe en GPU de consumo? No se plantea ese escenario en la documentación; el modelo está optimizado para aceleradores de borde y CPU.
- CPU de referencia: Intel Core i7-12650H con un hilo intra-op de ONNX Runtime, con mediana residente de 0,790 s para el estudiante.
- Acelerador: Intel Neural Compute Stick 1 (Myriad 2), identificador USB 03E7:2150, con mediana residente de 3,343 s para el estudiante.
- Opciones de despliegue: OpenVINO 2020.3.2 sobre Windows con Python 3.7, NumPy y eSpeak NG 1.52.0; ONNX Runtime para la ruta CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: factor de tiempo real medio de 1,23 sobre NCS1 para el estudiante; mejora de 3,15 veces en throughput secuencial frente a la versión completa.

## Comparativa con modelos similares

| Modelo | Tipo | Huella | Contexto / límite | Error de palabra (Fresh-10) | Licencia |
|---|---|---|---|---|---|
| CueBall Voice v0.3 NCS1 Student | TTS continuo, HiFi-GAN destilado | 17,1 MB (NCS1 FP16) / 34,3 MB (CPU FP32) | 128 fonemas, 512 tramas log-mel | 29,9 % (NCS1) / 26,0 % (CPU) | MIT |
| CueBall Voice v0.3 Full NCS1 | TTS continuo, HiFi-GAN completo | 37,9 MB (NCS1 FP16) / 75,8 MB (CPU FP32) | 128 fonemas, 512 tramas log-mel | 28,6 % (NCS1) / 22,1 % (CPU) | MIT |
| CueBall Voice v0.2 Resident | TTS (unit-selection, según documentación) | no disponible | no disponible | no disponible | MIT (según familia) |
| CueBall Voice v0.1 Original | TTS (unit-selection, según documentación) | no disponible | no disponible | no disponible | MIT (según familia) |

No se dispone de datos de benchmarks frente a modelos TTS de terceros en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- Una única voz sintética; no se documenta clonación ni selección de hablante.
- El test de inteligibilidad se limita a diez prompts; la naturalidad, textos más amplios, hablantes e idiomas requieren evaluación separada según el autor.
- Ambas rutas nativas incumplieron los objetivos experimentales de menos del 14,8 % de error de palabra y 300 ms de latencia en caliente.
- El error de palabra medido con Whisper Tiny English es elevado (26,0–29,9 % en las configuraciones del estudiante), lo que limita su uso en producción de calidad.
- Dependencia de un toolchain legacy: OpenVINO 2020.3.2, Python 3.7 y eSpeak NG 1.52.0, con riesgos de mantenimiento y compatibilidad.
- Dependencia de hardware descatalogado (Intel NCS1 / Myriad 2) para la ruta nativa.
- Riesgo de alucinación acústica y de pronunciación incorrecta en textos fuera del dominio evaluado; no se documentan sesgos específicos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar NOTICE.md para avisos de procedencia de terceros.
- No es un sistema voz-a-voz: requiere entrada de audio, reconocimiento de voz y lógica de respuesta por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/CueBall-Voice-NCS1-Student
- Versión completa v0.3: https://huggingface.co/tablinum/CueBall-Voice
- Versión FP32 ONNX: https://huggingface.co/tablinum/CueBall-Voice-ONNX
- Versión v0.2 Resident: https://huggingface.co/tablinum/CueBall-Voice-v0.2-NCS1
- Versión v0.1 Original: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1
- Organización Rack Lab: https://huggingface.co/racklab
- Demo The Break Room: https://huggingface.co/spaces/tablinum/The-Break-Room
- Colección de la familia: https://huggingface.co/collections/tablinum/the-break-room-6b0227343f3237d2a8c08b7f
- Repositorio MyriadForge: https://github.com/chadstthomas-svg/myriadforge
- Roadmap del toolchain NCS1: https://github.com/chadstthomas-svg/myriadforge/blob/main/docs/NCS1_ROADMAP.md
