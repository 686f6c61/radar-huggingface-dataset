# VoxRT/linnet-en-35m

## Resumen

Linnet `linnet-en-35m` es un modelo de síntesis de voz (text-to-speech) desarrollado por VoxRT, diseñado específicamente para inferencia en dispositivo (*on-device*) con capacidad de streaming en tiempo real. Se trata de un modelo autorregresivo de tipo *flow language model* que genera latentes continuos de 48 dimensiones cada 80 ms, que posteriormente son decodificados a audio de 24 kHz mediante un códec neural de estilo Vocos. Con 41,4 M de parámetros totales, está pensado para ejecutarse en un único núcleo de CPU de un teléfono o un ordenador de sobremesa, sin necesidad de GPU.

El modelo resuelve el problema de la síntesis de voz de baja latencia en entornos con recursos limitados, ofreciendo streaming de audio desde el primer paso de generación. Solo soporta inglés y viene con dos voces integradas (`linnet-en-f1` y `linnet-en-m1`). La arquitectura es completamente causal, sin *lookahead* en ninguna parte de la cadena, lo que facilita su uso en aplicaciones de tiempo real como asistentes conversacionales o lectores de pantalla.

Es relevante ahora porque demuestra que es posible obtener síntesis de voz de calidad aceptable con un modelo de tan solo 41 M de parámetros y licencia de pesos que permite uso comercial con las voces integradas, aunque con restricciones importantes para voces personalizadas y servicios de TTS de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow language model autorregresivo (transformer de 6 capas) + códec decoder neural causal |
| Parámetros totales | 41,4 M (flow LM 31,5 M, incluida tabla de texto de 3,1 M; codec decoder 9,9 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Prompt de voz (6 s → 76 posiciones LM) + tokens de texto + pasos generados, limitado por `max_frames` (por defecto 300 pasos = 24 s) |
| Tipos de cuantización | No disponible (solo se mencionan pesos fp16 para runtime y fp32 de referencia) |
| Idiomas soportados | Inglés |
| Licencia | Linnet Weights License 1.0 (no es open source; permite uso comercial de pesos sin modificar con voces integradas) |
| Formato de pesos | safetensors (`linnet-tts/1`), fp16 para runtime y fp32 de referencia; tokenizer SentencePiece; voces en `.npy` |

## Arquitectura y entrenamiento

El modelo se compone de un *trunk* transformer de 6 capas pre-LayerNorm con anchura 512, 8 cabezas de atención, posiciones rotatorias (pares intercalados, periodo máximo 10⁴) y FFN GELU (tanh) con expansión 4× sin sesgos. La entrada combina un embedding aprendido de "begin voice", los latentes del prompt de voz proyectados, los embeddings de tokens de texto y los latentes previamente generados proyectados. Dispone de caché KV para streaming. La cabeza de flujo consta de 6 bloques MLP AdaLN de anchura 512 condicionados por el estado del trunk y dos embeddings sinusoidales de tiempo; en inferencia se evalúa una vez por paso sobre `x0 ~ N(0, temp·I)` y el latente resultante es `x0 + v`. Los latentes se generan en espacio normalizado y se desnormalizan con media y desviación típica almacenadas. Una cabeza EOS de un solo logit decide cuándo terminar.

El decoder de códec aplica una proyección 1×1 de 24→384, dos bloques ConvNeXt causales a 25 Hz, un sobremuestreo ×4 hasta la rejilla de 100 Hz de columnas STFT, ocho bloques ConvNeXt causales, y una cabeza lineal que produce 513 log-magnitudes y 513 fases por columna, con IFFT de 1024, ventana Hann de 960 muestras, hop 240 y solapamiento-adición causal. El decoder reproduce su entrada con un retardo de 720 muestras que el runtime compensa. Todos los operadores son causales, sin *lookahead*. El frontend de texto es SentencePiece unigram con 6000 piezas, sin fonemizador ni normalización de texto interna. Los datos de entrenamiento provienen de corpus públicos con licencias que permiten uso comercial, sin datos propietarios ni de usuarios; Common Voice se usó solo para validación.

## Capacidades

- Generación de voz en inglés a partir de texto, con salida mono a 24 kHz.
- Streaming de audio desde el primer paso de generación, con latencia mínima.
- Ejecución en tiempo real en un solo núcleo de CPU de teléfono o escritorio.
- Dos voces integradas: `linnet-en-f1` (femenina) y `linnet-en-m1` (masculina).
- Control de temperatura (`temp`, por defecto 0,3) y *classifier-free guidance* (`cfg`, por defecto 2,0).
- Lectura de formas digitales simples correctamente (números, horas en formato básico), aunque sin normalización de texto avanzada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de texto más allá de la síntesis.
- No dispone de modo *thinking*, visión ni audio de entrada.

## Casos de uso

- **Lectores de pantalla y accesibilidad**: el modelo puede sintetizar texto en tiempo real en un solo núcleo de CPU, lo que lo hace adecuado para aplicaciones de accesibilidad en dispositivos móviles sin depender de la nube. Su contexto de hasta 24 s por generación permite leer párrafos completos con pausas naturales.
- **Asistentes de voz integrados en aplicaciones**: gracias al streaming desde el primer paso y a su reducido tamaño (41 M de parámetros), puede integrarse en apps móviles para respuestas habladas de baja latencia, con las voces integradas y sin necesidad de GPU.
- **Sistemas de navegación y avisos en tiempo real**: la naturaleza causal y sin *lookahead* permite generar instrucciones habladas conforme se reciben, ideal para navegadores GPS o sistemas de alertas que requieren síntesis inmediata en dispositivos embebidos.
- **Audiolibros y contenido educativo**: con la limitación de 24 s por generación (configurable mediante `max_frames`), se puede usar para narrar fragmentos de texto en aplicaciones de lectura, convirtiendo texto plano a voz con las dos voces disponibles.
- **Atención al cliente automatizada en el dispositivo**: para respuestas pregrabadas dinámicas o menús interactivos de voz (IVR) en inglés, el modelo puede generar locuciones en tiempo real sin enviar texto a servidores externos, reduciendo costes y mejorando la privacidad.
- **Prototipado y pruebas de UX de voz**: al ser un modelo pequeño con bindings para Linux C, Python, Android e iOS, permite a desarrolladores integrar síntesis de voz en prototipos y pruebas de experiencia de usuario sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, ya que el modelo está diseñado para ejecutarse en CPU. Los pesos fp16 ocupan aproximadamente 83 MB (41,4 M × 2 bytes), y el repositorio completo pesa 0,2 GB.
- GPU recomendadas: no se requieren GPU; el modelo funciona en CPU. No se proporcionan datos de rendimiento en GPU.
- Cabe en cualquier CPU consumer: un solo núcleo de teléfono o escritorio es suficiente para inferencia en tiempo real según el autor.
- Opciones de despliegue: runtime en Rust (https://github.com/VoxRT/LinnetTTS), bindings para Linux C, Python (wheel `linnet-tts`), Android AAR e iOS Swift package. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se indica ejecución en tiempo real en un solo núcleo de CPU, pero no se proporcionan cifras concretas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros modelos TTS en la información suministrada.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Linnet Weights License 1.0 no es open source. Permite usar los pesos sin modificar con las voces integradas en productos propios, incluso comerciales y de código cerrado, pero reserva las voces personalizadas, la modificación de pesos, el entrenamiento de modelos y los servicios de TTS de propósito general a licencias escritas separadas de VoxRT.
- **Solo inglés**: no soporta otros idiomas.
- **Sin normalización de texto**: el modelo no incluye normalización interna; texto denso con importes monetarios, porcentajes, fechas ISO, barras o números de teléfono debe convertirse a palabras antes de la síntesis.
- **Contexto limitado**: la generación está limitada por `max_frames` (por defecto 300 pasos = 24 s), lo que restringe la longitud de las locuciones.
- **Sin encoder de voces**: el encoder que produce latentes a partir de grabaciones no forma parte de esta release, por lo que no se pueden crear nuevas voces sin licencia adicional.
- **Riesgo de alucinación**: no se menciona explícitamente, pero como modelo generativo de voz, podría producir artefactos o pronunciaciones incorrectas en texto ambiguo.
- **Sesgos**: no se dispone de información sobre sesgos conocidos.
- **Restricciones para producción**: el uso en servicios de TTS de propósito general requiere licencia adicional; el uso comercial está permitido solo con las voces integradas y sin modificar los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/VoxRT/linnet-en-35m
- Repositorio GitHub (código y bindings, Apache-2.0): https://github.com/VoxRT/LinnetTTS
- Licencia de pesos: https://huggingface.co/VoxRT/linnet-en-35m/blob/main/WEIGHTS_LICENSE.md
- Contacto para licencias: help@voxrt.com
