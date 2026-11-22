# tablinum/CueBall-Voice-v0.2-NCS1

## Resumen

CueBall Voice v0.2 Resident es un sistema de síntesis de voz (text-to-speech) en inglés basado en selección de unidades (unit selection), no en una red neuronal generativa profunda. Lo desarrolla el usuario tablinum dentro del proyecto Rack Lab / The Break Room, y está empaquetado para inferencia local en el acelerador Intel Movidius Myriad 2 (VPU NCS1) mediante OpenVINO, con una ruta alternativa de ejecución en CPU mediante ONNX Runtime. Reutiliza el banco acústico y los bytes del decodificador de la versión v0.1 y añade un servidor JSONL que mantiene el grafo del dispositivo cargado entre peticiones.

El modelo resuelve un nicho muy concreto: generar voz sintetizada en inglés con una huella de disco mínima (3,43 MB incluyendo modelo y datos de voz) y latencia baja en hardware de borde antiguo. No compite en calidad de audio con los TTS neuronales modernos; su propuesta es la eficiencia extrema y la ejecución en un stick USB NCS1. La arquitectura no es un transformer: es un motor de selección de unidades que combina un front-end fonético (eSpeak NG 1.52.0) con un decodificador acústico empaquetado en formato ONNX.

La relevancia actual es acotada pero clara para quien trabaja con hardware de borde, preservación de toolchains antiguas (OpenVINO 2020.3.2, Python 3.7) o investigación sobre TTS de huella ultrapequeña. La model card reporta métricas comparativas frente a Kokoro-82M en el mismo host, con un WER de 48,94 % para CueBall frente al 4,26 % de Kokoro, lo que sitúa su calidad de inteligibilidad muy por debajo de los TTS neuronales actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selección de unidades (unit selection) con decodificador acústico en ONNX; front-end fonético eSpeak NG |
| Parametros totales | no disponible (no es un modelo de parámetros en el sentido habitual; el paquete modelo más datos de voz ocupa 3,43 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el TTS no opera con ventana de contexto de tokens; procesa texto de entrada por petición) |
| Tipos de cuantizacion | no disponible (el paquete distribuido es un binario ONNX para NCS1 y una ruta CPU con ONNX Runtime; no se documentan variantes de cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo para OpenVINO/Myriad y para ONNX Runtime en CPU); paquete distribuido también como ZIP |
| Frecuencia de muestreo de salida | 16 kHz mono PCM |
| Backends | Myriad (NCS1, OpenVINO 2020.3.2) y CPU (ONNX Runtime) |
| Servidor | JSONL residente con `--serve` |
| Hardware objetivo | Intel Movidius Myriad 2 (NCS1, USB 03E7:2150) |

## Arquitectura y entrenamiento

El sistema no emplea un transformer ni un modelo generativo neuronal end-to-end. Se trata de un motor de selección de unidades: dado un texto de entrada, un front-end fonético basado en eSpeak NG 1.52.0 genera la secuencia de fonemas y prosodia, y un decodificador acústico empaquetado en ONNX selecciona y concatena unidades de un banco acústico preexistente. La versión v0.2 reutiliza exactamente el banco acústico y los bytes del decodificador de v0.1, de modo que la novedad es de infraestructura, no de modelado: añade un servidor JSONL que mantiene el grafo del dispositivo cargado entre peticiones para evitar el coste de recarga del stick.

No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o DPO (no aplicables en un esquema de selección de unidades de este tipo). Tampoco se detalla el proceso de construcción del banco acústico ni la voz de origen. La innovación técnica destacable es el empaquetado para Myriad 2 con OpenVINO 2020.3.2 y Python 3.7, junto con el modo residente (`--serve`) que reduce la latencia en peticiones sucesivas al no recargar el dispositivo.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con una única voz sintética.
- Salida de audio a 16 kHz mono PCM, tanto en la ruta Myriad como en la ruta CPU.
- Front-end fonético mediante eSpeak NG, con la prosodia y pronunciación que dicho motor proporcione.
- Ejecución en dos backends: VPU Intel NCS1 (Myriad 2) vía OpenVINO y CPU vía ONNX Runtime.
- Modo servidor JSONL (`--serve`) para atender peticiones sin recargar el grafo del dispositivo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio de entrada.
- Multilingüismo: únicamente inglés; no se documentan otras lenguas.
- No es un sistema voz-a-voz: requiere entrada de texto y lógica externa para reconocimiento y respuesta.

## Casos de uso

- Avisos hablados en dispositivos de borde con hardware limitado: el paquete de 3,43 MB y la ejecución en NCS1 permiten generar mensajes cortos y predecibles en un stick USB sin depender de la nube, adecuado para paneles industriales o terminales empotradas.
- Señalización en aplicaciones de accesibilidad en equipos antiguos: la ruta CPU con ONNX Runtime y Python actual permite leer texto en pantalla con una huella de disco mínima, útil en entornos con restricciones de almacenamiento.
- Pruebas de integración en pipelines de CI para TTS de borde: el modo `--serve` con JSONL facilita automatizar peticiones y validar la salida de audio en pruebas de regresión sin recargar el dispositivo en cada caso.
- Investigación sobre TTS de huella ultrapequeña: sirve como línea base de selección de unidades frente a modelos neuronales como Kokoro-82M, con métricas de latencia y WER ya publicadas en la model card.
- Preservación de toolchains legacy: útil para quien necesite mantener flujos con OpenVINO 2020.3.2 y Python 3.7 sobre Myriad 2, un stack que ya no recibe soporte activo.
- Demostraciones y prototipos de voz sintética en ferias o entornos docentes: el bajo coste de despliegue y la licencia MIT permiten distribuir el sistema en materiales didácticos sin restricciones comerciales.
- Generación de prompts cortos y predecibles en inglés: la model card recomienda explícitamente este uso para las versiones compactas de selección de unidades en NCS1.

## Benchmarks y rendimiento

Datos publicados en la model card sobre ocho prompts congelados, mismo host, sesiones separadas. La latencia es la mediana de medianas por prompt en caliente, excluyendo setup y escritura de WAV. CueBall emite a 16 kHz y Kokoro a 24 kHz; el evaluador usó 16 kHz para ambos.

| Sistema | Modelo + datos de voz | Síntesis en caliente | WER (Whisper) |
|---|---:|---:|---:|
| CueBall native unit selection | 3,43 MB | 63,16 ms | 48,94 % |
| Kokoro-82M INT8 en CPU | 120,58 MB | 2.026,16 ms | 4,26 % |
| Kokoro-82M FP32 en CPU | 353,75 MB | 1.545,68 ms | 4,26 % |

En cinco prompts adicionales, CueBall produjo 10 ediciones de palabra sobre 26 palabras de referencia, mientras que Kokoro FP32 no produjo ninguna. La propia model card advierte que estas pruebas miden transcripción automática sobre una carga de trabajo pequeña en inglés.

## Requisitos de hardware

- VRAM: no aplica; el modelo no se ejecuta en GPU. La ruta Myriad usa la VPU NCS1 y la ruta CPU usa memoria del sistema.
- GPU recomendadas: ninguna; el diseño está orientado a Intel Movidius Myriad 2 (NCS1, identificador USB 03E7:2150) y a CPU.
- Cabe en hardware de consumo: sí, en cualquier CPU moderna vía ONNX Runtime; en la VPU NCS1 el paquete completo ocupa 3,43 MB.
- Entorno de la ruta Myriad: Windows con OpenVINO 2020.3.2, Python 3.7, NumPy y eSpeak NG 1.52.0 (con DLL y datos en su directorio).
- Entorno de la ruta CPU: Python actual con NumPy y ONNX Runtime, invocando `--backend cpu` y omitiendo `--toolchain`.
- Opciones de despliegue: script `cueball_voice.py` con backend `myriad` o `cpu`; modo servidor JSONL con `--serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 63,16 ms de mediana en caliente en NCS1 para los ocho prompts de referencia; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | WER (8 prompts) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| CueBall Voice v0.2 Resident | Selección de unidades + ONNX, borde | 3,43 MB (modelo + voz) | no aplica | 48,94 % | MIT | Hugging Face (tablinum) |
| Kokoro-82M INT8 | TTS neuronal en CPU | 120,58 MB | no aplica | 4,26 % | no disponible en la información | Uso comparativo en la model card |
| Kokoro-82M FP32 | TTS neuronal en CPU | 353,75 MB | no aplica | 4,26 % | no disponible en la información | Uso comparativo en la model card |

La comparativa se limita a los datos publicados por el propio autor; no se dispone de información sobre otros TTS de borde comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Calidad de inteligibilidad muy inferior a los TTS neuronales actuales: WER de 48,94 % frente al 4,26 % de Kokoro-82M en la misma prueba, con 10 ediciones sobre 26 palabras en los cinco prompts adicionales.
- Sesgos conocidos: no documentados en la información disponible; al depender de eSpeak NG y de un banco acústico único, la voz y la pronunciación quedan fijadas por esos componentes.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de pronunciación incorrecta o de artefactos de concatenación en la selección de unidades.
- Limitación de idioma: solo inglés; no hay soporte multilingüe documentado.
- Restricciones de licencia: MIT, lo que permite uso comercial y modificación, pero la model card remite a NOTICE.md para avisos de procedencia y licencias de componentes de terceros (eSpeak NG, OpenVINO), que deben revisarse antes de producción.
- Dependencia de un stack obsoleto: OpenVINO 2020.3.2 y Python 3.7 ya no reciben soporte; la ruta Myriad requiere Windows y un stick NCS1 físico.
- No es un sistema conversacional: no hay tool calling, agentes ni razonamiento multi-paso; cualquier flujo voz-a-voz necesita ASR y lógica de respuesta externos.
- Carga de trabajo evaluada muy pequeña: la model card advierte que las pruebas cubren solo ocho prompts más cinco adicionales en inglés, por lo que las métricas no deben extrapolarse a producción general.
- Repositorio de 0,0 GB y 0 descargas en el momento de la consulta: el paquete principal se distribuye como ZIP enlazado, no como pesos individuales.

## Enlaces

- Hugging Face: https://huggingface.co/tablinum/CueBall-Voice-v0.2-NCS1
- Descarga del ZIP: https://huggingface.co/tablinum/CueBall-Voice-v0.2-NCS1/resolve/main/CueBall-Voice-v0.2-NCS1.zip
- v0.3 Full NCS1: https://huggingface.co/tablinum/CueBall-Voice
- v0.3 NCS1 Student: https://huggingface.co/tablinum/CueBall-Voice-NCS1-Student
- v0.3 FP32 ONNX: https://huggingface.co/tablinum/CueBall-Voice-ONNX
- v0.1 Original: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1
- Rack Lab: https://huggingface.co/racklab
- The Break Room (Space): https://huggingface.co/spaces/tablinum/The-Break-Room
- Colección de la familia: https://huggingface.co/collections/tablinum/the-break-room-6b0227343f3237d2a8c08b7f
- MyriadForge (GitHub): https://github.com/chadstthomas-svg/myriadforge
- Toolchain NCS1: https://github.com/chadstthomas-svg/myriadforge/blob/main/docs/NCS1_ROADMAP.md
