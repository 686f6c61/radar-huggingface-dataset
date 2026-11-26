# Yakimask/mimamo

## Resumen

Mimamo (ミマモ) es una aplicación Android de código abierto desarrollada por Yakimask que implementa un compañero virtual 3D con conversación por voz en modo full-duplex, ejecutándose íntegramente en el dispositivo. El repositorio de Hugging Face no contiene un modelo de lenguaje en sí, sino el paquete de distribución (APK 0.8.4) y el código fuente de una aplicación que orquesta varios modelos pequeños: un LLM de conversación en formato GGUF (validado con Gemma 4 E2B Q4_K_M), un modelo de reconocimiento de voz (Moonshine en japonés), un detector de fin de turno (Smart Turn v3), un modelo de backchannel (VAP de MaAI), síntesis de voz (VOICEVOX) y un generador de movimiento corporal text-to-motion llamado PartLock-CMU, también del mismo autor.

El interés técnico del proyecto reside en su arquitectura de inferencia local sobre ARM64 con Android 10 o superior: usa llama.cpp con backend Vulkan, ONNX Runtime para el modelo de movimiento cuantizado a 8 bits, y three.js con three-vrm para renderizar un avatar VRM. La conversación se procesa sin salir del teléfono; solo las funciones de planificación diaria y resumen nocturno (opcionales) recurren a la API de Gemini si el usuario introduce una clave.

El modelo está etiquetado con licencia Apache 2.0 para el código propio, aunque los componentes de terceros conservan sus licencias originales, algunas con restricciones comerciales (Moonshine Community License, licencias de VOICEVOX). El idioma soportado es únicamente japonés. El tamaño del repositorio es de 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Aplicación Android que orquesta múltiples modelos: LLM (llama.cpp/GGUF), ASR (Moonshine), VAD/turn-taking (Smart Turn v3, VAP), TTS (VOICEVOX), text-to-motion (PartLock-CMU sobre ONNX Runtime), renderizado 3D (three.js + three-vrm) |
| Parámetros totales | No disponible (depende del LLM de conversación seleccionado; el autor valida con Gemma 4 E2B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (determinada por el LLM GGUF cargado) |
| Tipos de cuantización | Q4_K_M para el LLM de conversación; pesos de PartLock-CMU reducidos a 8 bits |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 (código propio); componentes de terceros con licencias propias |
| Formato de pesos | GGUF (LLM), ONNX (text-to-motion), APK para distribución |

## Arquitectura y entrenamiento

Mimamo no es un modelo entrenado de forma monolítica, sino un sistema de inferencia en dispositivo que combina varios modelos especializados. El LLM de conversación se ejecuta mediante llama.cpp con soporte Vulkan y se carga desde un archivo GGUF externo que el usuario selecciona en ajustes; el autor ha validado el funcionamiento con Gemma 4 E2B en cuantización Q4_K_M. La entrada de cámara se procesa mediante el módulo mtmd de llama.cpp con un archivo mmproj compatible con el LLM elegido, lo que permite pasar un fotograma por turno de respuesta.

El componente más singular es PartLock-CMU, un modelo text-to-motion desarrollado por el propio autor que genera movimientos corporales completos a partir de descripciones en inglés (por ejemplo, `wave` o `turn and jump`), en lugar de seleccionar de un catálogo predefinido. Se ejecuta en ONNX Runtime con pesos cuantizados a 8 bits para ajustarse a la latencia de un teléfono. La representación del habla incluye reconocimiento con Moonshine en japonés, detección de fin de turno con Smart Turn v3, backchannel con los pesos japoneses de VAP (MaAI) y síntesis con VOICEVOX. La lógica de conversación full-duplex reutiliza el código C++ del proyecto previo del autor, YAKISFULL-DUPLEX. No se dispone de información sobre datasets de entrenamiento, número de tokens o etapas de RLHF/DPO para los componentes propios.

## Capacidades

- Conversación por voz full-duplex sin pulsar botones: el usuario puede interrumpir al asistente mientras habla y este deja de hablar para escuchar.
- Detección de fin de turno basada en Smart Turn v3, que distingue pausas breves de un turno realmente terminado.
- Backchannel opcional (interjecciones como «うん» o «へえ») mientras el usuario habla, activable o desactivable.
- Generación de expresiones faciales y movimiento corporal completo a partir de etiquetas que el propio LLM emite al inicio de la respuesta, con formato `<表情>...<表情><3D>...<3D>`.
- Text-to-motion libre: el modelo PartLock-CMU genera movimiento a partir de frases en inglés no restringidas a un catálogo.
- Entrada de cámara: en cada turno de respuesta se envía un fotograma al LLM multimodal mediante mmproj.
- Alarmas y temporizadores por voz, con extracción de hora primero por reglas y, solo si falla, por el LLM.
- Función de bloqueo de aplicaciones durante el estudio, con proceso separado (Guard) y recordatorios si se intenta abrir repetidamente la aplicación bloqueada.
- Descanso forzado tras 30 minutos de uso continuado de una aplicación, desbloqueable mediante un minijuego de unos 5 minutos.
- Planificación diaria y resumen nocturno automático a las 23:00 mediante Gemini (requiere clave API y conexión).
- Extracción de eventos desde notificaciones de Gmail y sincronización con Google Calendar.
- Interfaz de conversación también por teclado.
- Sin capacidades de tool calling genérico, agentes multi-paso ni razonamiento extendido más allá de lo que ofrezca el LLM GGUF subyacente.

## Casos de uso

- Compañero conversacional en dispositivo para usuarios japoneses: la aplicación gestiona diálogos multi-turno por voz sin enviar audio ni texto a la nube, adecuada para contextos de privacidad estricta.
- Asistente de estudio con bloqueo de distracciones: el proceso Guard devuelve al inicio las aplicaciones seleccionadas (por ejemplo, YouTube) durante las franjas configuradas y aplica pausas obligatorias tras 30 minutos de uso continuado.
- Gestión de alarmas y temporizadores por lenguaje natural: «明日7時に起こして» o «3分はかって» se resuelven primero con reglas deterministas y solo recurren al LLM cuando la frase no encaja en los patrones.
- Planificación diaria asistida: con una clave de Gemini, el sistema genera a las 23:00 un resumen del día y un plan del día siguiente con granularidad de minutos a partir de conversaciones, calendario y tiempos de uso de aplicaciones.
- Extracción de eventos desde notificaciones de Gmail: la aplicación lee las notificaciones locales (sin iniciar sesión en Google) y crea entradas en el calendario.
- Avatar 3D interactivo para demostraciones o investigación en interacción humano-máquina: el pipeline completo (ASR, LLM, TTS, text-to-motion, VRM) sirve como banco de pruebas reproducible de un agente encarnado en un teléfono.
- Generación de animación corporal a partir de texto en tiempo real: PartLock-CMU puede reutilizarse para prototipos de animación procedural en ONNX Runtime sobre ARM64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una prueba cualitativa con Gemma 4 E2B en escritorio: de seis fotografías presentadas, el modelo respondió correctamente a cuatro y falló en un mando a distancia pequeño y en texto invertido verticalmente. No se aportan cifras de latencia, throughput ni precisión para el resto de componentes.

## Requisitos de hardware

- Dispositivo Android 10 o superior con CPU ARM de 64 bits (arm64-v8a).
- El LLM de conversación se ejecuta en el propio teléfono mediante llama.cpp con backend Vulkan; el rendimiento depende del SoC y del GGUF elegido (el autor valida con Gemma 4 E2B Q4_K_M).
- PartLock-CMU se ejecuta en ONNX Runtime con pesos de 8 bits; la velocidad de generación de movimiento varía según la potencia del teléfono.
- No se especifican requisitos mínimos de RAM ni de VRAM; al tratarse de inferencia en dispositivo, no aplican GPU de escritorio (A100, H100, RTX 4090) para el caso de uso previsto.
- Despliegue: APK `mimamo-0.8.4.apk` distribuido fuera de Google Play; compilación desde `source/` con JDK 17, Android SDK (compileSdk 36), NDK 29.0.14206865, CMake 3.22.1 y Gradle 9.9.1, más `shader-tools` (glslc) y un compilador C++ de escritorio en el PATH para el backend Vulkan de llama.cpp.
- No se proporcionan cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Proyecto | Tipo | Ejecución | Idiomas | Licencia | Distribución |
|---|---|---|---|---|---|
| Mimamo (Yakimask) | Aplicación Android con pipeline ASR + LLM + TTS + text-to-motion | En dispositivo (ARM64, Vulkan, ONNX Runtime) | Japonés | Apache 2.0 (propio); componentes con licencias propias | APK y código fuente |
| YAKISFULL-DUPLEX (mismo autor) | Componente C++ de conversación full-duplex | En dispositivo | No disponible | No disponible | Integrado en Mimamo |
| PartLock-CMU (mismo autor) | Modelo text-to-motion | En dispositivo (ONNX, 8 bits) | Entrada en inglés | No disponible | Integrado en Mimamo |
| Asistentes comerciales en la nube (p. ej. asistentes con LLM remoto) | Servicio cloud | Remoto | Múltiples | Propietaria | API/SDK |

No se dispone de información sobre modelos comparables de la misma categoría (compañeros conversacionales encarnados en dispositivo) con la que establecer una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El idioma soportado es exclusivamente japonés; no hay soporte documentado de otras lenguas.
- La conversación con cámara no se ha verificado en un teléfono real: el emulador no admite Gemma 4 E2B y la única prueba es en escritorio, con fallos en objetos pequeños y texto invertido.
- El movimiento generado por PartLock-CMU puede no corresponder semánticamente con la descripción, ya que las etiquetas en inglés las produce el propio LLM.
- La velocidad de generación de movimiento depende del dispositivo.
- El modelo de reconocimiento de voz Moonshine en japonés se distribuye bajo Moonshine Community License, con restricciones para uso comercial.
- Las voces de VOICEVOX están sujetas a las licencias de VOICEVOX y de cada personaje; es necesario revisar sus condiciones antes de un uso comercial.
- La planificación diaria y el resumen nocturno dependen de la API de Gemini y de una clave del usuario; según los términos de Gemini API, el contenido enviado con la clave gratuita puede ser revisado por personal de Google para mejorar la calidad del servicio.
- Fabricantes como Xiaomi, Huawei, OnePlus y Samsung pueden terminar procesos en segundo plano, lo que afecta al bloqueo de aplicaciones y a las alarmas si no se conceden permisos de autoarranque y se desactiva la optimización de batería.
- La instalación fuera de Google Play requiere habilitar «Permitir ajustes restringidos» para activar el servicio de accesibilidad del guardián.
- El paquete conserva el nombre provisional `jp.yaki.aibou`.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluaciones de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yakimask/mimamo
