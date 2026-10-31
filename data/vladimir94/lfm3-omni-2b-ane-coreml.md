# vladimir94/lfm3-omni-2b-ane-coreml

## Resumen

LFM3-Omni-2B (ANE Core ML) es una conversión a Core ML del modelo LiquidAI/LFM3-Omni-2B, publicada por el usuario vladimir94 en Hugging Face, diseñada para ejecutarse sobre el Apple Neural Engine (ANE) en hardware de Apple. No se trata de un modelo nuevo ni de un fine-tuning: el repositorio contiene únicamente los programas Core ML convertidos y cuantizados (palettization LUT de 6 bits) a partir de los pesos originales, sin reentrenamiento de ningún peso.

El problema que resuelve es la ejecución local y eficiente de un modelo omni (texto, imagen, audio y salida de voz) en Mac, donde las GPU de consumo habituales no existen. El autor documenta todo el pipeline de conversión, el runtime y las mediciones de rendimiento en el repositorio de GitHub vladimir-voinea/lfm3-omni-ane, lo que convierte esta ficha en un ejemplo práctico de despliegue de un modelo Liquid AI en el ecosistema Apple Silicon.

El modelo base es un transformer híbrido de 2B parámetros con capas de convolución corta, atención completa y atención deslizante, con un vocabulario de 128.000 tokens. La conversión palettizada ocupa unos 1,8 GB y consigue ~30 tok/s de decodificación en el ANE, con dos modos de contexto: 28.672 tokens exactos y 78.042 tokens con ventana deslizante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (13 capas de convolución corta, 6 capas de atención completa, 5 capas de atención deslizante) |
| Parametros totales | 2B (modelo base LiquidAI/LFM3-Omni-2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 28.672 tokens (modo `28k`, atención exacta) o 78.042 tokens (modo `78k`, ventana deslizante de 28.672 tokens) |
| Tipos de cuantizacion | Palettization LUT de 6 bits (~1,8 GB); build sin palettizar de ~3,7 GB disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (heredada del modelo base) |
| Formato de pesos | Core ML (`.mlpackage`), con embeddings en `.npy` y tablas rotatorias en `.npz` |

## Arquitectura y entrenamiento

La arquitectura del modelo base sigue un patrón híbrido típico de los modelos recientes de Liquid AI: combina 13 capas de convolución corta (con el historial pasado como tensores de entrada/salida), 6 capas de atención completa con caché `MLState` de 28.672 filas y 5 capas de atención deslizante con caché de 256 filas. El lm_head tiene 128.000 salidas y, dado que Core ML no coloca una matriz de ese tamaño completa en el ANE, el repositorio incluye una versión dividida en dos bloques de 64.000 filas que reduce la latencia del head de 11,4 ms a 3,0 ms por token.

En cuanto al entrenamiento, no se han reentrenado pesos: esta conversión aplica exclusivamente palettization LUT de 6 bits sobre los programas Core ML ya convertidos. Los datos de entrenamiento, el número de tokens y el uso de RLHF/DPO corresponden al modelo base LiquidAI/LFM3-Omni-2B y no están detallados en la información disponible. Las innovaciones técnicas destacables de esta conversión son: la división del lm_head para forzar su colocación en el ANE, el uso de cachés `MLState` de tamaño fijo (lo que obliga a fijar el contexto en tiempo de compilación) y la verificación numérica del decodificador de audio (sampler y codec comprobados contra la decodificación de referencia en 24 frames).

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del modelo base omni.
- Procesamiento de imágenes como entrada (verificado en la prueba end-to-end del runtime).
- Procesamiento de audio como entrada y salida de voz (speech out): el decodificador de profundidad, el sampler y el códec se ejecutan en el ANE y producen audio de nivel de voz.
- Soporte de tool calling: la prueba de humo end-to-end incluye texto, llamada a herramienta, resultado de herramienta, imagen, audio y salida de voz.
- Dos modos de contexto: atención exacta hasta 28.672 tokens o ventana deslizante hasta 78.042 tokens.
- Servidor local con endpoint `/health` que informa del modo activo, la longitud de contexto y el techo de tokens por segundo.
- Soporte multilingüe: no disponible en la información de esta conversión (corresponde al modelo base).

## Casos de uso

- Asistente conversacional local en Mac: ejecución completamente on-device sin GPU externa, con ~30 tok/s de decodificación, adecuado para chat privado sin envío de datos a la nube.
- Asistente de voz on-device: el modelo acepta audio de entrada y genera salida de voz directamente en el ANE, lo que permite construir interfaces de voz privadas sin servicios en la nube.
- Agentes con tool calling en local: la prueba end-to-end confirma el ciclo completo de llamada a herramienta y resultado, útil para asistentes que consultan APIs o ejecutan funciones en el dispositivo.
- Análisis de documentos largos con contexto de 28k: el modo `28k` mantiene atención exacta sobre toda la conversación, adecuado para resumir o consultar documentos de longitud media.
- Conversaciones muy largas con el modo `78k`: permite diálogos extensos asumiendo que solo se retiene la ventana de los últimos 28.672 tokens, útil cuando la continuidad reciente importa más que la memoria completa.
- Prototipado e investigación en optimización para ANE: el repositorio incluye el código de conversión, las mediciones y las decisiones de diseño (split del lm_head, límites de FLOPS del ANE), valioso como referencia para convertir otros modelos al Neural Engine.
- Integración en apps macOS/iOS: el formato Core ML y los programas por capas permiten integrar inferencia directamente en aplicaciones nativas de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las mediciones incluidas son de rendimiento de inferencia en el ANE:

| Medición | Valor |
|---|---|
| Decodificación modo `28k` (contexto de 64 tokens) | 30,6 tok/s |
| Decodificación modo `78k` (contexto de 64 tokens) | 30,9 tok/s |
| Decodificación bajo carga | 24,4–24,5 tok/s |
| Decodificación a contexto largo (modo `28k`) | ~11–15 tok/s (crece hasta llenar la caché) |
| Decodificación a contexto largo (modo `78k`) | plana (~30,9 tok/s) |
| Ganancia por palettization | 16,3 → 21,1 tok/s |
| Ganancia por split del lm_head | 21,1 → 24,5 tok/s |
| lm_head en CPU (sin split) | 11,4 ms/token |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Apple Neural Engine (Mac con chip M系列). No se especifica el chip exacto usado en las mediciones.
- Almacenamiento: ~1,8 GB para la build palettizada LUT6; ~3,7 GB para la build sin palettizar.
- No requiere GPU dedicada ni VRAM discreta: toda la inferencia se ejecuta en el ANE (con el lm_head parcialmente en CPU, 11,4 ms/token en la versión sin dividir).
- Cabe holgadamente en cualquier Mac moderno con Apple Silicon; no aplica el concepto de GPU de consumo tipo RTX 4090.
- Despliegue: mediante el runtime del repositorio vladimir-voinea/lfm3-omni-ane, con el servidor incluido (`lfm3_serve.py`) en modos `28k` y `78k`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (el formato Core ML no es compatible con ellos).
- Rendimiento esperado: 24–31 tok/s de decodificación según carga de la máquina; en modo `28k` la velocidad decae a ~11–15 tok/s cuando la caché de atención completa se llena.

## Comparativa con modelos similares

| Caracteristica | LFM3-Omni-2B ANE Core ML (esta conversión) | LiquidAI/LFM3-Omni-2B (base) | LFM2-1.2B (Liquid AI) |
|---|---|---|---|
| Parametros | 2B | 2B | 1,2B |
| Formato | Core ML (.mlpackage), LUT6 | safetensors (PyTorch/Transformers) | safetensors, GGUF |
| Contexto | 28.672 o 78.042 tokens | no disponible en la información de esta ficha | no disponible |
| Modalidades | Texto, imagen, audio entrada; voz salida | Texto, imagen, audio entrada; voz salida | Texto |
| Hardware objetivo | Apple Neural Engine | GPU/CPU estándar | CPU/GPU estándar, móvil |
| Licencia | lfm-open-license-v1.0 | lfm-open-license-v1.0 | lfm-open-license-v1.0 |
| Rendimiento documentado | ~30 tok/s en ANE | no disponible en la información de esta ficha | no disponible |

Como referencia de categoría, compite con otras conversiones on-device para Apple (por ejemplo modelos convertidos con MLX o llama.cpp en Metal), pero no se dispone de datos comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- La atención exacta a 78k tokens no es alcanzable en este hardware: el modo `78k` usa ventana deslizante (solo los últimos 28.672 tokens), por lo que la información antigua de la conversación se sobrescribe y no es recuperable.
- El contexto es fijo en tiempo de compilación: hay que elegir el modo (`28k` o `78k`) antes de ejecutar, y cada modo tiene su propio techo de rendimiento.
- El lm_head completo (128.000 salidas) no se coloca en el ANE; la versión sin dividir se ejecuta en CPU a 11,4 ms/token. La versión dividida lo mitiga parcialmente.
- No se han publicado benchmarks de calidad (MMLU, etc.) para esta conversión; la palettization de 6 bits puede degradar marginalmente la precisión respecto a la build sin palettizar de ~3,7 GB, según reconoce el propio autor.
- Sesgos, riesgo de alucinación y capacidades multilingües: no documentados en esta conversión; deben evaluarse a partir del modelo base LiquidAI/LFM3-Omni-2B.
- Licencia: lfm-open-license-v1.0, una licencia personalizada ("other"). Conviene revisar sus términos antes de cualquier uso comercial, ya que no es una licencia estándar tipo Apache o MIT.
- Proyecto de un autor individual con 787 descargas y sin comunidad de mantenimiento documentada: para producción conviene validar el runtime por cuenta propia.
- Los modelos Omni de 2B son pequeños: su rendimiento en razonamiento complejo y código será limitado frente a modelos de 7B o superiores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladimir94/lfm3-omni-2b-ane-coreml
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Runtime, código de conversión y mediciones (GitHub): https://github.com/vladimir-voinea/lfm3-omni-ane
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
