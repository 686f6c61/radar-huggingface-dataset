# starrydark/BanG_Dream_Qwen3_TTS

## Resumen

BanG_Dream_Qwen3_TTS es un modelo de síntesis de voz (text-to-speech) publicado por el usuario starrydark en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base, desarrollado por el equipo Qwen de Alibaba Cloud, y su objetivo es reproducir las voces de 49 personajes de la franquicia BanG Dream! (Girls Band Party), repartidos en nueve bandas: Poppin'Party, Afterglow, Pastel*Palettes, Roselia, Hello, Happy World!, Morfonica, RAISE A SUILEN, MyGO!!!!! y Ave Mujica. El modelo cuenta con 1.916.676.352 parámetros y un repositorio de 4,5 GB en formato safetensors.

La relevancia de este modelo es doble. Por un lado, demuestra la viabilidad de adaptar un TTS base de 1,7B parámetros a un conjunto amplio de voces de personaje sin necesidad de audio de referencia en tiempo de inferencia: cada voz se invoca mediante un identificador de hablante (`speaker`), lo que simplifica enormemente la integración en aplicaciones. Por otro, aborda el reto del multilingüismo en TTS de personaje, incorporando japonés, mandarín e inglés con identificadores de idioma explícitos y datos de replay nativos para reducir el acento japonés en mandarín.

El modelo se distribuye como un checkpoint de tipo `custom_voice` de Qwen3-TTS, con licencia "unofficial-fan-model" que no concede derechos de uso, y está pensado para experimentación, prototipado y proyectos de fan. Su arquitectura subyacente es la del Qwen3-TTS base, un modelo de lenguaje de códec a 12 Hz con 1,7B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de lenguaje de códec a 12 Hz), fine-tune completo del base Qwen3-TTS-12Hz-1.7B-Base |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card solo documenta uso en bfloat16) |
| Idiomas soportados | japones (ja), mandarin (zh), ingles (en) |
| Licencia | unofficial-fan-model (licencia "other", sin derechos concedidos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-TTS-12Hz-1.7B-Base: un modelo de lenguaje autorregresivo que opera sobre tokens de códec de audio a una tasa de 12 Hz, con 1.916.676.352 parámetros. Se trata de un fine-tune completo (no LoRA ni adaptadores) sobre el checkpoint base, lo que implica que todos los pesos del modelo original fueron actualizados durante el entrenamiento. La variante utilizada es la de tipo `custom_voice`, en la que el modelo sintetiza voz a partir de texto y un identificador de hablante, sin requerir audio de referencia en inferencia.

El conjunto de entrenamiento documentado consta de 11.341 filas y 23,4 horas de audio en total. De ellas, 9.268 son líneas de voz en japonés de los 49 personajes (procedentes de 22,1 horas conservadas tras el filtrado), 1.509 son clips de replay nativos en mandarín e inglés, y 564 son filas "pseudo-mandarín" en la voz del personaje con control de calidad (gated). El entrenamiento corresponde a la versión E1b, época 2, realizado el 30 de octubre de 2026 y publicado el 6 de noviembre de 2026. La model card menciona además una ruta RVC (Retrieval-based Voice Conversion) por voz para el mandarín nativo, documentada en el repositorio de código, y un pipeline de datos con un entrenador corregido.

No se documentan en la información disponible detalles sobre el uso de RLHF, DPO u otras técnicas de alineación, ni innovaciones técnicas adicionales más allá del esquema de identificadores de idioma y la estrategia de replay multilingüe.

## Capacidades

- Síntesis de voz multi-hablante con 49 identificadores de voz (45 personajes y 4 variantes de personaje: 大魔姫あこ, 月ノ森 Soyo / Sakiko y Mortis), invocables directamente por `speaker` sin audio de referencia.
- Síntesis multilingüe en japonés, mandarín e inglés, con identificador de idioma explícito (`language="Japanese" / "Chinese" / "English"`) que condiciona la pronunciación y el acento.
- Replay nativo en mandarín e inglés para reducir el acento japonés en esas lenguas.
- Generación de voz "pseudo-mandarín" en la propia voz del personaje para 564 filas con control de calidad.
- Control de muestreo: la model card recomienda temperatura 0,9 y top-k 50; advierte de que la decodificación greedy provoca bucles en modelos de lenguaje de códec.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el modelo es exclusivamente text-to-speech.

## Casos de uso

- Doblaje de fan-projects y contenido derivado de BanG Dream!: el modelo permite generar líneas de diálogo en la voz de cualquiera de los 49 personajes pasando el texto y el `speaker` correspondiente, sin necesidad de grabar referencias ni entrenar por personaje.
- Prototipado de videojuegos y mods: integración en motores o mods que necesiten voces de personaje para diálogos dinámicos, usando el identificador de hablante como parámetro de configuración y el idioma como variable de localización.
- Generación de audio para vídeos de fansub y contenido de nicho: síntesis de narraciones o diálogos en japonés con la voz del personaje adecuado, etiquetando siempre el audio como generado por IA.
- Investigación en TTS multi-hablante y multilingüe: el modelo sirve como caso de estudio de fine-tune completo sobre un TTS base de 1,7B, con métricas de identidad de hablante documentadas por voz (identidad japonesa y mandarina sobre 32 renders de test).
- Evaluación de transferencia de voz entre idiomas: permite analizar hasta qué punto un personaje entrenado principalmente en japonés conserva su timbre en mandarín e inglés, con las etiquetas "own voice", "partly generic" y "generic" de la model card.
- Creación de asistentes conversacionales con personalidad de personaje: en entornos controlados y no comerciales, se puede usar para dar voz a un chatbot con la personalidad de un personaje concreto, combinando el TTS con un LLM de texto.
- Pruebas de integración de pipelines TTS: el modelo se carga con la librería `qwen-tts` y `Qwen3TTSModel.from_pretrained`, lo que facilita probar flujos de generación de audio en bfloat16 sobre GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de identidad de hablante por voz (proporción de 32 renders de test de mandarín atribuidos correctamente a la voz entre las 49, y la misma métrica sobre renders de japonés), pero no tablas de MMLU, HumanEval, GSM8K ni métricas estándar de TTS como MOS, WER o similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.916.676.352 parámetros en bfloat16, los pesos ocupan aproximadamente 3,8 GB; sumando activaciones y caché de códec, se estima un consumo de 6-10 GB de VRAM, aunque no se documenta una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 8-16 GB de VRAM debería ser suficiente para inferencia en bfloat16.
- Compatibilidad con GPU de consumo: probable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, aunque no está confirmado oficialmente.
- Opciones de despliegue: la model card documenta el uso mediante la librería `qwen-tts` (`Qwen3TTSModel.from_pretrained` con `device_map="cuda"` y `dtype=torch.bfloat16`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BanG_Dream_Qwen3_TTS | 1.916.676.352 | ja, zh, en | TTS multi-hablante de personaje (custom_voice) | unofficial-fan-model (sin derechos) | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B (aprox.) | no disponible en la información | TTS base | no disponible en la información | Hugging Face |
| Alternativas de TTS multi-hablante de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base Qwen3-TTS-12Hz-1.7B-Base, del que este es un fine-tune completo. No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Licencia "unofficial-fan-model": no se conceden derechos de uso; es un modelo de fan no oficial, sin relación con los titulares oficiales, el reparto de voces ni la operadora del juego. El uso comercial queda en una zona legal gris o directamente no permitida.
- Riesgo de alucinación y artefactos de audio: al ser un modelo de lenguaje de códec, la decodificación greedy provoca bucles; la model card recomienda mantener el muestreo por defecto (temperatura 0,9, top-k 50).
- Calidad desigual entre voces: varias voces tienen identidad mandarina baja (por ejemplo, `ppp_kasumi` 0,25, `ppp_rimi` 0,25, `ro_ako_maou` 0,31, `ro_rinko` 0,53), lo que significa que en mandarín suenan más parecidas a la voz por defecto del modelo base que al personaje. La model card recomienda probar varias semillas para esas voces.
- Datos de entrenamiento limitados por personaje: algunas voces tienen muy pocos minutos de audio (por ejemplo, `ro_ako_maou` con 5 min, `ro_ako` con 8 min), lo que puede afectar a la estabilidad y fidelidad del timbre.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con voces de personajes de anime, el modelo reproduce sus características de estilo y registro, no voces naturales diversas.
- Limitaciones de idioma: solo se soportan japonés, mandarín e inglés; no hay soporte documentado de castellano ni de otras lenguas.
- Advertencia de etiquetado: el audio generado es sintético y debe etiquetarse como generado por IA siempre que se comparta.
- Restricciones de producción: la licencia y la naturaleza no oficial del modelo desaconsejan su uso en productos comerciales sin asesoramiento legal; además, no se documentan benchmarks estándar de calidad TTS (MOS, WER) que permitan evaluar su idoneidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starrydark/BanG_Dream_Qwen3_TTS
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de código: https://github.com/starryark/bangdream-tts
- Repositorio de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Perfil del autor: https://huggingface.co/starrydark
- Licencia y uso responsable: https://huggingface.co/starrydark/BanG_Dream_Qwen3_TTS#rights-and-responsible-use
