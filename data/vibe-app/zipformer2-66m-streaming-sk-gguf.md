# vibe-app/zipformer2-66m-streaming-sk-gguf

## Resumen

zipformer2-66m-streaming-sk-gguf es la conversión al formato GGUF del modelo neurlang/zipformer2-66m-streaming-sk, un transductor Zipformer2 de 66,6 millones de parámetros especializado en reconocimiento automático de voz (ASR) en eslovaco. Lo publica el usuario vibe-app como artefacto de distribución para la aplicación de escritorio Vibe, un cliente de transcripción local. El modelo original procede del ecosistema k2-fsa/icefall y fue entrenado sobre más de 3300 horas de audio en eslovaco.

La relevancia de esta ficha es acotada pero clara: se trata de un modelo de voz pequeño, con licencia permisiva (CC-BY-4.0), empaquetado en un único fichero GGUF de 75 MB que contiene codificador, decodificador, joiner y tabla de tokens. Eso lo hace apto para inferencia local en CPU o GPU modesta sin infraestructura pesada, algo poco habitual en ASR de calidad razonable.

No es un modelo de propósito general ni un LLM: es un transductor específico de idioma (solo eslovaco) pensado para transcripción por fragmentos, no para decodificación en streaming real dentro de Vibe, según indica el propio autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder-decoder-joiner, k2-fsa/icefall) |
| Parametros totales | 66.599.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesa fragmentos de audio de hasta 30 s detectados por VAD |
| Tipos de cuantizacion | q8_0 (8 bits) en el fichero publicado |
| Idiomas soportados | eslovaco (sk) unicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (un solo fichero con encoder, decoder, joiner y tabla de tokens) |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2, una variante de arquitectura conformer/transformer con downsampling multi-escala empleada habitualmente en el toolkit k2-fsa/icefall para ASR. La estructura transducer combina un codificador acústico, un decodificador de predicción y una red joiner que produce la distribución sobre tokens; todo ello se empaqueta en el GGUF junto con la tabla de tokens.

El modelo base fue entrenado sobre más de 3300 horas de audio en eslovaco, según la model card del autor original. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de texto, ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino adicional. La conversión a GGUF no modifica los pesos más allá de la cuantización a 8 bits; el autor de la conversión indica que solo se verificó con un clip sintético corto en eslovaco.

## Capacidades

- Reconocimiento automático de voz en eslovaco sobre audio de entrada.
- Transcripción por fragmentos de hasta 30 segundos detectados mediante VAD (voice activity detection).
- Salida de texto con puntuación y mayúsculas según el comportamiento del modelo base (no detallado en la información disponible).
- Manejo inconsistente de números: aparecen de forma variable como palabras o dígitos.
- No soporta otros idiomas: las palabras en inglés tienden a transcribirse letra a letra.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es multimodal más allá del audio de entrada; no procesa imagen ni vídeo.
- No incluye modo "thinking" ni mecanismos de razonamiento explícito.

## Casos de uso

- Transcripción local de reuniones en eslovaco: al ejecutarse en Vibe sobre fragmentos de hasta 30 s, permite generar actas o notas de voz sin enviar audio a la nube, algo relevante por privacidad y por coste cero de API.
- Subtitulado de vídeo en eslovaco: el modelo puede alimentar un pipeline que segmenta el audio con VAD y genera subtítulos por bloques, aprovechando el tamaño reducido (75 MB) para ejecutarse en el mismo equipo de edición.
- Dictado en aplicaciones de escritorio: integrado en Vibe, sirve para escribir texto en eslovaco por voz en editores, correos o formularios, con latencia baja gracias al reducido número de parámetros.
- Archivado y búsqueda de audio corporativo: transcripción por lotes de grabaciones internas en eslovaco para indexarlas y permitir búsqueda textual, desplegable en CPU sin GPU dedicada.
- Asistentes de voz para atención al cliente en eslovaco: como componente ASR de un pipeline mayor (ASR → LLM → TTS), donde el modelo aporta la transcripción y el resto del sistema gestiona la respuesta.
- Investigación en ASR de bajos recursos: al ser un Zipformer2 pequeño con licencia CC-BY-4.0 y pesos GGUF, resulta útil como línea base reproducible para experimentos de cuantización, decodificación o comparación con modelos mayores en eslovaco.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla eslovaca, ejecutándose en portátiles convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversión remite a la model card del modelo original (neurlang/zipformer2-66m-streaming-sk) para las cifras de precisión, pero esas cifras no se incluyen en la información proporcionada. El autor de la conversión solo indica que se comprobó con un clip sintético corto en eslovaco.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero q8_0 ocupa 75 MB, por lo que la inferencia cabe holgadamente en menos de 1 GB de memoria, incluyendo buffers de decodificación.
- GPU recomendadas: cualquier GPU con soporte para el runtime GGUF; no se requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso una iGPU reciente son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, y también en CPU.
- Opciones de despliegue: la vía documentada es la aplicación Vibe (versión 3.3.3 o superior), que carga el GGUF desde su carpeta de modelos. El soporte en otros runtimes GGUF (llama.cpp, Ollama, etc.) no está documentado en la información disponible, dado que el modelo es un transductor ASR y no un transformer de lenguaje.
- Latencia y throughput estimados: no disponibles. Al procesar fragmentos de hasta 30 s con contexto completo y un modelo de 66 M de parámetros, se espera latencia de decodificación baja en hardware moderno, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, se puede situar frente a otras alternativas de ASR en eslovaco, aunque sin cifras de rendimiento verificadas:

| Modelo | Parametros | Contexto / modo | Licencia | Disponibilidad |
|---|---|---|---|---|
| zipformer2-66m-streaming-sk-gguf | 66,6 M | fragmentos de hasta 30 s (VAD) | CC-BY-4.0 | GGUF en HF, integrado en Vibe |
| neurlang/zipformer2-66m-streaming-sk (base) | 66,6 M | streaming (según nombre) | CC-BY-4.0 | pesos originales en HF |
| Whisper small (referencia genérica) | ~244 M | 30 s por ventana, multilingüe | MIT | múltiples formatos y runtimes |
| Whisper large-v3 (referencia genérica) | ~1550 M | 30 s por ventana, multilingüe | MIT | múltiples formatos y runtimes |

La comparación con Whisper es solo orientativa por categoría (ASR); no hay datos en la información disponible que permitan afirmar qué modelo transcribe mejor el eslovaco. La ventaja clara de este Zipformer2 es su tamaño (66 M frente a cientos o miles de millones) y su licencia permisiva; su desventaja es el soporte de un único idioma y la falta de métricas publicadas en esta conversión.

## Limitaciones y advertencias

- Solo eslovaco: el inglés y otros idiomas se transcriben mal, con palabras en inglés deletreadas letra a letra según la model card.
- Números inconsistentes: aparecen de forma variable como palabras o dígitos, lo que complica su uso en dominios con cifras (facturación, datos médicos, finanzas).
- No opera en streaming real dentro de Vibe: el autor indica que se ejecuta con contexto completo sobre fragmentos de hasta 30 s detectados por VAD, no en modo streaming continuo.
- Verificación limitada de la conversión: solo se comprobó con un clip sintético corto en eslovaco; no hay evaluación sobre corpus real en esta conversión.
- Riesgo de alucinación y errores en audio ruidoso, con acentos no eslovacos o con solapamiento de hablantes; no se documentan métricas de WER en esta ficha.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (neurlang) y mantener el aviso de licencia. El modelo base de k2-fsa/icefall es Apache-2.0.
- Sin soporte documentado en runtimes GGUF generalistas: la única vía de despliegue descrita es la aplicación Vibe 3.3.3 o superior.
- Sin datos de sesgo: no se documentan sesgos demográficos, dialectales ni de género en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vibe-app/zipformer2-66m-streaming-sk-gguf
- Modelo base: https://huggingface.co/neurlang/zipformer2-66m-streaming-sk
- Aplicación Vibe: https://github.com/thewh1teagle/vibe
- Toolkit k2-fsa/icefall: https://github.com/k2-fsa/icefall
