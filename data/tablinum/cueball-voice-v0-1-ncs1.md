# tablinum/CueBall-Voice-v0.1-NCS1

## Resumen

CueBall Voice v0.1 Original es un sistema de síntesis de voz (text-to-speech) basado en selección de unidades (unit selection) desarrollado por tablinum dentro del proyecto Rack Lab. El modelo genera voz sintética en inglés a partir de texto seleccionando y concatenando unidades aprendidas de palabras y fonemas, y utiliza un grafo nativo de 960 bytes que se ejecuta en el acelerador Intel NCS1 (Movidius Myriad 2) para decodificar los códigos de muestra seleccionados a PCM. Es, por tanto, una propuesta orientada a inferencia local en hardware de muy baja potencia, no un modelo neuronal generativo al uso.

La relevancia de esta ficha es acotada: se trata de la versión original (v0.1) de una familia que ya cuenta con iteraciones posteriores (v0.2 y v0.3), y el propio autor la presenta como una release de selección de unidades pensada para prompts cortos y predecibles en NCS1. El paquete completo (modelo más datos de voz) ocupa 3,43 MB, lo que la sitúa en un orden de magnitud muy inferior a los TTS neuronales convencionales.

No se dispone de información sobre arquitectura neuronal subyacente, número de parámetros ni longitud de contexto, ya que el sistema no es un transformer: es un motor de concatenación de unidades con un decodificador nativo en hardware. La licencia es MIT y el único idioma soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selección de unidades (unit selection) con decodificador nativo en Intel NCS1; no es un transformer |
| Parametros totales | no disponible (no aplica; sistema basado en unidades, no en pesos neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (síntesis por prompt; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el decodificador nativo opera sobre códigos de muestra) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | bundle propio (`model`) con grafo nativo NCS1; también lane CPU vía ONNX Runtime; ZIP descargable |

## Arquitectura y entrenamiento

El sistema no emplea una arquitectura de red neuronal generativa tipo transformer, MoE o SSM. Se basa en selección de unidades: el host (la CPU) selecciona y cose unidades aprendidas de palabras y fonemas, y las empalma para formar la señal. La decodificación de los códigos de muestra seleccionados a PCM la realiza un grafo nativo de 960 bytes ejecutado en el Intel NCS1 original (Myriad 2). Existe además una vía de síntesis en CPU que utiliza ONNX Runtime y NumPy; ambas vías devuelven PCM mono a 16 kHz.

El pipeline de ejecución en NCS1 requiere Windows con OpenVINO 2020.3.2, Python 3.7, NumPy y eSpeak NG 1.52.0 (el directorio de eSpeak contiene la DLL y sus datos). El dispositivo se identifica inicialmente como USB 03E7:2150. Para la vía CPU se usa Python actual con NumPy y ONNX Runtime, con `--backend cpu` y sin `--toolchain`. No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO, algo esperable en un sistema de selección de unidades y no de alineamiento lingüístico.

## Capacidades

- Síntesis de voz en inglés a partir de texto con una única voz sintética.
- Generación de audio PCM mono a 16 kHz.
- Ejecución en hardware de muy baja potencia (Intel NCS1 / Myriad 2) mediante grafo nativo de 960 bytes.
- Ejecución alternativa en CPU mediante ONNX Runtime.
- Integración con eSpeak NG para el front-end fonético (texto a fonemas).
- Soporte de prompts cortos y predecibles, según el uso previsto declarado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- No se documenta capacidad multilingüe más allá del inglés.
- No es un sistema voz-a-voz: requiere audio de entrada, reconocimiento de voz y lógica de respuesta por separado.

## Casos de uso

- Avisos y confirmaciones en dispositivos embebidos: el sistema puede sintetizar frases cortas y predecibles (por ejemplo, "Please close the inventory window") en un NCS1 alimentado por USB, con un footprint de 3,43 MB que cabe en almacenamiento muy limitado.
- Señalética sonora y feedback de interfaz en hardware de bajo consumo: al ejecutarse en Myriad 2 y devolver PCM a 16 kHz, encaja en paneles de control, lectores de inventario o terminales industriales que no pueden asumir el coste de un TTS neuronal.
- Prototipado e investigación en TTS sobre aceleradores Intel: sirve como referencia reproducible para estudiar selección de unidades y decodificación nativa en NCS1, con toolchain y roadmap públicos.
- Pruebas de latencia en el borde: con 63,16 ms de síntesis en caliente en las ocho prompts congeladas, es adecuado para experimentos que midan latencia de TTS en hardware restringido.
- Educación y demos de TTS clásico: permite ilustrar el contraste entre selección de unidades y TTS neuronal (Kokoro-82M) en términos de huella, latencia e inteligibilidad.
- Generación de audio para pruebas de pipelines ASR: al producir WAV a 16 kHz, puede usarse para generar material de evaluación de reconocimiento de voz, siempre que se asuma su mayor tasa de error de transcripción.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan CueBall v0.1 con Kokoro-82M en las mismas ocho prompts congeladas. La latencia es la mediana de las medianas por prompt en caliente, excluyendo setup y escritura de WAV. CueBall emite 16 kHz y Kokoro 24 kHz; el evaluador usó 16 kHz para ambos.

| Sistema | Modelo + datos de voz | Síntesis en caliente | WER (Whisper) |
|---|---:|---:|---:|
| CueBall native unit selection | 3,43 MB | 63,16 ms | 48,94 % |
| Kokoro-82M INT8 en CPU | 120,58 MB | 2.026,16 ms | 4,26 % |
| Kokoro-82M FP32 en CPU | 353,75 MB | 1.545,68 ms | 4,26 % |

En cinco prompts adicionales, CueBall registró 10 ediciones de palabra sobre 26 palabras de referencia, mientras que Kokoro FP32 tuvo cero. El propio autor advierte que estas pruebas miden transcripción automática de una carga de trabajo pequeña en inglés. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a este tipo de sistema.

## Requisitos de hardware

- VRAM estimada: no aplica; no es un modelo GPU. El sistema corre en CPU y en el acelerador Intel NCS1.
- Acelerador: Intel NCS1 original (Movidius Myriad 2), identificado como USB 03E7:2150.
- Toolchain NCS1: Windows con OpenVINO 2020.3.2, Python 3.7, NumPy y eSpeak NG 1.52.0.
- Vía CPU: Python actual con NumPy y ONNX Runtime; no requiere GPU.
- Cabe en hardware de consumo y embebido: el paquete completo ocupa 3,43 MB.
- Opciones de despliegue: script `cueball_voice.py` con `--backend myriad` (NCS1) o `--backend cpu` (ONNX Runtime); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este sistema.
- Latencia: 63,16 ms de mediana en caliente en las ocho prompts de referencia (NCS1); throughput no documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | WER (8 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CueBall Voice v0.1 NCS1 | Unit selection + decodificador NCS1 | 3,43 MB (modelo + voz) | no aplica | 48,94 % | MIT | Hugging Face (tablinum) |
| Kokoro-82M INT8 | TTS neuronal | 120,58 MB | no disponible | 4,26 % | no disponible en la información | Referenciado en la comparativa del autor |
| Kokoro-82M FP32 | TTS neuronal | 353,75 MB | no disponible | 4,26 % | no disponible en la información | Referenciado en la comparativa del autor |
| CueBall Voice v0.3 Full NCS1 | Versión posterior de la familia | no disponible | no disponible | no disponible | MIT (según familia) | Hugging Face (tablinum) |

La comparativa relevante es de compromiso: CueBall prioriza huella mínima y latencia muy baja en hardware dedicado, a costa de una inteligibilidad claramente inferior medida por WER. Kokoro-82M ofrece mucha mejor transcripción automática con un footprint dos órdenes de magnitud mayor y latencias de segundos en CPU.

## Limitaciones y advertencias

- Inteligibilidad limitada: WER de 48,94 % en las ocho prompts de referencia, frente a 4,26 % de Kokoro-82M; inadecuado para aplicaciones donde la precisión de la transcripción sea crítica.
- Solo inglés: no se documenta soporte de otros idiomas.
- Una única voz sintética: no hay control de hablante ni clonación de voz.
- Orientado a prompts cortos y predecibles; no se documenta comportamiento en textos largos o dominios abiertos.
- Sesgos: no se documentan sesgos específicos, pero el corpus de unidades y la voz única condicionan el registro y el acento; no hay información sobre su composición.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero la concatenación de unidades puede producir artefactos de empalme y errores de pronunciación en palabras fuera del inventario.
- Dependencia de hardware y software antiguos: OpenVINO 2020.3.2, Python 3.7 y eSpeak NG 1.52.0 en Windows para la vía NCS1; esto complica el mantenimiento en producción.
- Licencia MIT: permite uso comercial, pero conviene revisar `NOTICE.md` y los checksums (`SHA256SUMS.txt`) para dependencias de terceros (eSpeak NG, OpenVINO).
- Es la versión v0.1; el autor mantiene versiones posteriores (v0.2, v0.3) que pueden ser más adecuadas para nuevos desarrollos.
- No es un sistema conversacional ni voz-a-voz: requiere ASR y lógica de diálogo externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1
- Descarga del ZIP original: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1/resolve/main/CueBall-Voice-v0.1-NCS1.zip
- Muestra WAV NCS1: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1/blob/main/sample/inventory-ncs1.wav
- Versión v0.3 Full NCS1: https://huggingface.co/tablinum/CueBall-Voice
- Versión v0.3 NCS1 Student: https://huggingface.co/tablinum/CueBall-Voice-NCS1-Student
- Versión v0.3 FP32 ONNX: https://huggingface.co/tablinum/CueBall-Voice-ONNX
- Versión v0.2 Resident: https://huggingface.co/tablinum/CueBall-Voice-v0.2-NCS1
- Toolchain NCS1 (MyriadForge): https://github.com/chadstthomas-svg/myriadforge/blob/main/docs/NCS1_ROADMAP.md
- Repositorio MyriadForge: https://github.com/chadstthomas-svg/myriadforge
- Organización Rack Lab: https://huggingface.co/racklab
- Space The Break Room: https://huggingface.co/spaces/tablinum/The-Break-Room
- Colección de la familia: https://huggingface.co/collections/tablinum/the-break-room-6b0227343f3237d2a8c08b7f
