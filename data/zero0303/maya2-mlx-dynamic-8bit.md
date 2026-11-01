# zero0303/maya2-mlx-dynamic-8bit

## Resumen

Maya 2 Native MLX Dynamic 8-bit es un port no oficial del modelo de síntesis de voz Maya 2 Native de Maya Research, adaptado para ejecutarse en Apple Silicon mediante la librería MLX. Se trata de un sistema de text-to-speech en streaming que cubre once lenguas indias (bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) además del inglés, con veinte voces integradas y sin dependencia de PyTorch ni CUDA.

El modelo base emplea una arquitectura de backbone tipo Qwen3 con un decodificador de profundidad y el decodificador de audio Mimi de Kyutai, lo que permite generar audio a 24 kHz en formato PCM. El port reproduce línea por línea el código oficial (commit `c6b3768`) y aplica una cuantización dinámica de 8 bits en la que los tensores sensibles y el decodificador de profundidad permanecen en 16 bits, reduciendo el peso del repositorio a 3,57 GB.

Su relevancia radica en que permite inferencia de TTS multilingüe más rápida que el tiempo real (1,27×) en un Apple M5 con 24 GB de memoria, sin GPU dedicada, lo que facilita el despliegue local en portátiles y equipos de sobremesa de Apple. Es un port independiente, no una publicación oficial de Maya Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer tipo Qwen3 (28 capas) con decodificador de profundidad y decodificador de audio Mimi (Kyutai); TTS en streaming por frames |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto dividido en fragmentos de ~20 s de audio) |
| Tipos de cuantizacion | Dinámica 8-bit con tensores sensibles y decodificador de profundidad en 16-bit; Mimi en fp32; speaker anchor en bf16 |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (11 lenguas indias + inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), tokenizer.json, voices.json, meta.json, quant.json |

## Arquitectura y entrenamiento

El modelo base Maya 2 Native combina un backbone de 28 capas con forma Qwen3, un decodificador de profundidad que refina el detalle acústico fino y el decodificador Mimi de Kyutai para la síntesis de audio a 24 kHz. La generación es autorregresiva por frames de audio con un muestreador que incorpora reglas de parada y protecciones, y el port reproduce fielmente el flujo de números aleatorios oficial, el troceado de texto, los prompts y el tokenizador. El texto largo se divide en fragmentos de aproximadamente 20 segundos con pausas de 0,15 s, y se incluye un normalizador de texto para dígitos, moneda, fechas y URLs.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación destacable de este port es la cuantización dinámica de 8 bits: se midió la sensibilidad de cada tensor frente al modelo oficial, manteniendo en 16 bits los valores atípicos y el decodificador de profundidad, mientras el resto pasa a 8 bits. Según la model card, el desplazamiento de muestreo resultante es de aproximadamente 1,2× el ruido de redondeo del modelo oficial de 16 bits en los 12 idiomas, y supera las puertas de paridad en 101 de 101 comprobaciones frente al modelo oficial.

## Capacidades

- Síntesis de voz (text-to-speech) en streaming con generación de audio PCM a 24 kHz en formato float32 o int16.
- Soporte de 11 lenguas indias (as, bn, gu, hi, kn, ml, mr, or, pa, ta, te) más inglés, con funcionamiento cruzado entre idiomas para las voces.
- Veinte voces integradas con perfiles de género, edad y estilo (narrador, conversacional, juvenil, profesional), seleccionables por nombre sin distinción de mayúsculas.
- Control de generación mediante semilla, temperatura, top_k, top_p y penalización por repetición; la misma semilla produce el mismo audio.
- Normalización de texto integrada para dígitos, moneda, fechas y URLs.
- Gestión automática de texto largo mediante troceado en fragmentos de ~20 segundos con pausas de 0,15 s.
- API `generate` y `stream` compatible con la API oficial `Maya3TTS`.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en lenguas indias: el modelo convierte texto largo en audio troceado automáticamente en fragmentos de ~20 segundos, adecuado para aplicaciones de accesibilidad y lectura por voz en hindi, bengalí o tamil.
- Asistentes de voz locales en macOS: al ejecutarse sobre MLX sin CUDA, permite integrar TTS en aplicaciones de escritorio para Apple Silicon con inferencia más rápida que el tiempo real (1,27× en un M5).
- Audiolibros y narración: las voces de estilo narrador (Malini, Anirban, Vasant) con control de semilla permiten generar capítulos reproducibles y consistentes en las once lenguas soportadas.
- Atención al cliente automatizada en India: la cobertura de las principales lenguas del subcontinente y el modo streaming permiten respuestas de voz de baja latencia en sistemas de IVR o chatbots telefónicos.
- Generación de contenido educativo multilingüe: creación de material de audio para cursos en hindi, maratí o telugu con voces conversacionales y profesionales.
- Prototipado de interfaces de voz: la API `stream` devuelve fragmentos int16 a medida que se generan, lo que facilita la reproducción progresiva en aplicaciones interactivas.
- Doblaje y localización: el funcionamiento cruzado de las voces entre idiomas permite generar versiones en distintas lenguas indias de un mismo guion conservando el perfil de voz.

## Benchmarks y rendimiento

Datos de la model card medidos en un Apple M5 con 24 GB sobre un párrafo en inglés de 23,4 segundos:

| Métrica | Dynamic 8-bit (este repo) | 8-bit plano | 16-bit |
|---|---|---|---|
| Descarga | 3,57 GB | 2,93 GB | 5,24 GB |
| Memoria pico | 5,8 GB | 4,2 GB | 8,2 GB |
| Tiempo para 23,4 s de voz | 18,4 s (1,27× tiempo real) | 15,5 s (1,5×) | 20,6 s (1,14×) |
| Desplazamiento de muestreo vs exacto, 12 idiomas (ruido oficial 16-bit = 1×) | ~1,2× (0,6–2×) | ~3,5× (1,5–7×) | 1× |
| Decodificador de profundidad | exacto, como el oficial | 1,6–2,8 % de error | exacto |
| Puertas de paridad vs modelo oficial | 101/101 | 86/101 | 101/101 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de síntesis de voz.

## Requisitos de hardware

- Hardware mínimo: Mac con Apple Silicon, Python 3.11 y aproximadamente 6 GB de memoria libre.
- VRAM/memoria estimada: pico de 5,8 GB para la variante dinámica de 8 bits; 4,2 GB para la de 8 bits plano y 8,2 GB para la de 16 bits.
- GPU recomendadas: no aplica GPU dedicada; requiere Apple Silicon (medido en un M5 de 24 GB). No es compatible con CUDA.
- Cabe en equipos consumer Apple: sí, en Mac con chip M-series con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB o más para margen.
- Opciones de despliegue: MLX 0.32.4 con numpy y tokenizers 0.22.2; el repositorio incluye `speak.py` para uso por línea de comandos y el paquete `maya2_mlx` para uso desde Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 18,4 s para generar 23,4 s de audio en un M5 (1,27× tiempo real); el modo `stream` entrega fragmentos int16 conforme se generan.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maya 2 Native MLX Dynamic 8-bit (este repo) | TTS MLX, Apple Silicon | 11 indias + inglés | Fragmentos de ~20 s | Apache 2.0 | HuggingFace, 3,57 GB |
| Maya 2 Native (oficial) | TTS PyTorch/CUDA | 11 indias + inglés | Fragmentos de ~20 s | no disponible en la información | HuggingFace (maya-research/maya2-native) |
| 8-bit plano (variante descartada) | TTS MLX | 11 indias + inglés | Fragmentos de ~20 s | no disponible | No publicada en este repo |
| 16-bit MLX | TTS MLX | 11 indias + inglés | Fragmentos de ~20 s | no disponible | No incluida en este repo |

No se dispone de información sobre otros modelos TTS comparables (por ejemplo, de otras familias) en la documentación proporcionada.

## Limitaciones y advertencias

- Es un port independiente y no una publicación oficial de Maya Research; el autor remite a `NOTICE.md` para los términos.
- Requiere exclusivamente Apple Silicon y MLX; no funciona en GPU NVIDIA ni en entornos CUDA.
- La cuantización dinámica de 8 bits introduce un desplazamiento de muestreo de ~1,2× el ruido del modelo oficial de 16 bits, con variación de 0,6× a 2× según el idioma.
- Algunas voces no están entrenadas en panyabí (Jahnavi y Vasant cubren 10 idiomas en lugar de 11).
- El funcionamiento cruzado entre idiomas para voces no entrenadas en una lengua concreta puede degradar la naturalidad.
- No se documentan sesgos conocidos, tasas de alucinación ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales.
- El repositorio no incluye los tests de paridad, los scripts de exportación y cuantización ni el export MLX de 16 bits, por lo que la reproducibilidad completa de las mediciones no está disponible en el propio repo.
- La ventana de procesado se limita a fragmentos de ~20 segundos, lo que puede afectar a la prosodia en textos muy largos.
- No se dispone de información sobre el modelo base en cuanto a datos de entrenamiento, sesgos o limitaciones específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zero0303/maya2-mlx-dynamic-8bit
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Código oficial de Maya 2 Native: https://github.com/MayaResearch/maya2-native
