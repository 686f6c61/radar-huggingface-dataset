# TontaubeAI/TontaubeV1.1-Flash

## Resumen
TontaubeV1.1 Flash es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por TontaubeAI, construido sobre el backbone de lenguaje Qwen3-0.6B-Base. Su objetivo es ofrecer habla de alta velocidad con una latencia mínima, orientada a despliegue en dispositivos y en navegador. Genera audio en streaming en tramas de 133 ms a 48 kHz, con una única voz predefinida llamada Marcus.

El modelo destaca por su rendimiento: aproximadamente 25-30x tiempo real por stream en GPU NVIDIA (con más de 100x agregado en múltiples streams sobre una RTX 3090) y 2-4x tiempo real en CPU, con el primer audio disponible tras unos 10 ms. Además, incluye una extensión de Chrome que ejecuta el modelo localmente mediante WebAssembly, sin enviar texto a ningún servidor.

La relevancia actual radica en su enfoque "on-device": pesos ligeros (unos 700 MB en la variante web, 660 MB en la cuantización int4 para GPU), normalización de texto integrada y un detector de saltos de tono que corrige artefactos en tiempo real sin añadir latencia. Se distribuye bajo licencia Apache 2.0, lo que facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone tipo transformer (Qwen3-0.6B) con cabeza de muestreo sobre códec autoencoder propio; decoder VibeVoice + upsampler AP-BWE |
| Parámetros totales | no disponible (backbone de 0.6B según el modelo base Qwen3-0.6B-Base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (por defecto en GPU), int8, fp16; binarios propios para CPU/web |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | binarios propios del motor Tontaube (`lm_int4`, `misc_mix`, `vv_int8`, `lm.bin`, `misc.bin`, `vv.bin`, `bwe.bin`, etc.); no son checkpoints de Transformers |

## Arquitectura y entrenamiento
El modelo combina un backbone de lenguaje Qwen3-0.6B que lee el texto carácter a carácter y predice, mediante una pequeña cabeza de muestreo, 16 valores por trama a 7.5 Hz. Estos valores son latentes de VibeVoice codificados por un autoencoder propio construido específicamente para la voz única del modelo. El decoder del códec expande esos valores de vuelta a latentes VibeVoice, cuyo decoder genera audio a 24 kHz, que posteriormente un upsampler AP-BWE eleva a 48 kHz.

Incluye una normalización de texto basada en reglas (verbalizador) que lee números, fechas, horas, divisas y abreviaturas. También incorpora un detector de saltos de tono que monitoriza el audio mientras se genera y redibuja los momentos puntuales de salto de tono antes de su reproducción, sin coste de latencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades
- Síntesis de voz en inglés con una única voz (Marcus), sin clonación ni controles de estilo.
- Generación de audio en streaming por tramas de 133 ms, con reproducción inmediata de cada trama decodificada.
- Ejecución en GPU (int4/int8/fp16), CPU (Linux, Windows, macOS Apple silicon) y navegador (extensión de Chrome y demo web mediante WebAssembly).
- Normalización de texto integrada basada en reglas para números, fechas, horas, divisas y abreviaturas.
- Detector de saltos de tono en tiempo real que corrige artefactos sin añadir latencia.
- Servidor de inferencia con API HTTP compatible con TontaubeV1.1.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS).
- No soporta visión ni audio de entrada.

## Casos de uso
- Lectura de contenido web en el navegador: la extensión de Chrome lee la página actual o el texto seleccionado localmente, sin enviar texto a servidores, adecuada para privacidad y accesibilidad.
- Asistentes de voz en tiempo real: la latencia de primer audio de unos 10 ms y el streaming por tramas de 133 ms permiten respuestas habladas fluidas en interacciones conversacionales.
- Servidores TTS multi-stream: una sola RTX 3090 puede servir más de 100x tiempo real agregado en múltiples streams, útil para plataformas con muchos usuarios concurrentes.
- Aplicaciones de escritorio sin GPU: el motor de CPU a 2-4x tiempo real en Linux, Windows y macOS permite integrar TTS en herramientas locales sin hardware dedicado.
- Accesibilidad en dispositivos móviles: la demo funciona en Chrome sobre Android a velocidad aproximadamente en tiempo real (Pixel 8), útil para lectores de pantalla y aplicaciones de accesibilidad.
- Generación de avisos y locuciones automatizadas: la normalización integrada de números, fechas y divisas facilita la lectura correcta de información estructurada en sistemas de anuncios o alertas.
- Prototipado rápido de interfaces de voz: la API HTTP del servidor de inferencia permite integrar el modelo en pipelines existentes con el mismo contrato que TontaubeV1.1.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card incluye datos de velocidad medidos:

| Entorno | Hardware | Velocidad |
|---|---|---|
| Motor GPU (CLI, servidor) | Linux con GPU NVIDIA | ~25-30x tiempo real por stream; >100x agregado en RTX 3090; primer audio ~10 ms |
| Motor CPU (CLI, servidor) | Linux, Windows, macOS (Apple silicon) | ~2-4x tiempo real según CPU |
| Extensión Chrome | Linux, Windows | ~2x tiempo real en escritorio; 3-6x con GPU |
| Demo web en móvil | Chrome en Android (Pixel 8) | ~tiempo real |
| Motor nativo para móvil | en desarrollo | no disponible |

## Requisitos de hardware
- VRAM estimada para GPU: la variante int4 ocupa 660 MB (`lm_int4`, `misc_mix`, `vv_int8`); int8 y fp16 requieren más espacio, aunque no se especifica la cifra exacta.
- GPU recomendadas: RTX 3090 como referencia probada; cualquier GPU NVIDIA compatible con el motor debería funcionar, aunque no se detallan otros modelos.
- Cabe en GPU de consumo: sí, con la variante int4 de 660 MB.
- CPU: Linux, Windows y macOS (Apple silicon), a 2-4x tiempo real; en Linux sin GPU NVIDIA se recomienda añadir `--extra cpu` para usar la build CPU-only de PyTorch.
- Navegador: extensión de Chrome en Linux y Windows; en Linux requiere habilitar Vulkan y Default ANGLE Vulkan en `chrome://flags` para usar la GPU.
- Opciones de despliegue: motores propios del repositorio Tontaube (CLI `flash/speak.py`, servidor `tontaube serve` con API HTTP), extensión de Chrome y demo web. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers.
- Latencia y throughput: primer audio ~10 ms en GPU; tramas de 133 ms; >100x tiempo real agregado en RTX 3090 con múltiples streams.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La model card menciona TontaubeV1.1 (multilingüe, con clonación de voz, licencia Tontaube Community Model License), pero no ofrece una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TontaubeV1.1 Flash | backbone 0.6B | no disponible | en | Apache 2.0 | Hugging Face, GitHub, extensión Chrome |
| TontaubeV1.1 (int4) | no disponible | no disponible | multilingüe | Tontaube Community Model License | Hugging Face |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Solo habla inglés y con una única voz (Marcus); no clona voces ni ofrece controles de estilo.
- La generación autorregresiva puede ocasionalmente omitir, repetir o pronunciar mal palabras.
- El verbalizador basado en reglas puede leer incorrectamente formatos poco habituales.
- El detector de saltos de tono corrige la mayoría pero no todos los saltos; en dispositivos lentos puede no haber tiempo para redibujar uno en el primer segundo de una frase.
- No es un checkpoint de Transformers: requiere los motores específicos del repositorio Tontaube en la versión correspondiente (v1.2.0 en el ejemplo).
- El habla generada no debe usarse para suplantar a personas ni para engañar; debe divulgarse que es voz sintética cuando el oyente pueda confundirla con una grabación real.
- La licencia Apache 2.0 permite uso comercial, pero las redistribuciones deben conservar el archivo `NOTICE`.
- No se dispone de información sobre sesgos, alucinaciones en el sentido de contenido (al ser TTS no genera texto libre) ni límites de longitud de entrada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/TontaubeAI/TontaubeV1.1-Flash
- Demo en el navegador: https://huggingface.co/spaces/TontaubeAI/TontaubeV1.1-Flash
- Código e instrucciones: https://github.com/craitech/tontaube/tree/main/flash
- TontaubeV1.1 (multilingüe, clonación de voz): https://huggingface.co/TontaubeAI/TontaubeV1.1-int4
- Repositorio de inferencia: https://github.com/craitech/tontaube
