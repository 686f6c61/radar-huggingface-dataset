# vanch007/Drama-3-MLX-4bit

## Resumen

Drama-3-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Drama 3 de Fish Audio, un sistema de síntesis de voz (text-to-speech) conversacional con arquitectura de mezcla de expertos (MoE). El modelo original, desarrollado por Fish Audio, emplea una columna vertebral híbrida que combina atención lineal GatedDeltaNet con atención softmax completa, y un decodificador de audio Codebook-MTP de 10 codebooks. Esta versión, publicada por el usuario vanch007, está pensada para ejecutarse de forma nativa en Apple Silicon mediante MLX, sin dependencia de PyTorch en tiempo de ejecución.

El modelo resuelve el problema del despliegue local de TTS de alta fidelidad en hardware de consumo Apple: cuantiza los 10.240 expertos MoE a 4 bits afines (group_size=64) mientras preserva a precisión completa el códec neural Modded DAC de 44,1 kHz, los embeddings, las normalizaciones y la torre del decodificador MTP. Con 8.720.553.088 parámetros totales (3B activos según la model card), el resultado ocupa 23,2 GB en disco y reduce la latencia por paso a 160,4 ms en un M3 Max de 128 GB, frente a los 350 ms del BF16.

Su relevancia actual radica en que permite clonación de voz zero-shot, diálogos multipersonaje (hasta 16 hablantes) y etiquetas emocionales en texto, todo ello con salida de audio a 44,1 kHz y streaming en tiempo real, sobre un portátil o estación de trabajo con chip Apple. La licencia es la Fish Audio Community License, no estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: atención lineal GatedDeltaNet + atención softmax completa; decodificador de audio Codebook-MTP de 10 codebooks |
| Parametros totales | 8.720.553.088 (~8,7B) |
| Parametros activos | ~3B (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group_size=64, bits=4) para los 10.240 expertos MoE; embeddings, normalizaciones, códec DAC y torre MTP en precisión completa |
| Idiomas soportados | zh, en, ja, ko, es, fr, de, it, ru, pt |
| Licencia | fish-audio-community-license (other) |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con una columna vertebral híbrida que intercala capas de atención lineal GatedDeltaNet con capas de atención softmax completa. El modelo cuenta con 10.240 expertos en total, de los cuales aproximadamente 3B parámetros están activos por token. La salida de audio se genera mediante un decodificador Codebook-MTP de 10 codebooks que alimenta un códec neural Modded DAC a 44,1 kHz, lo que permite audio de alta fidelidad y generación por frames con salida en streaming.

Esta release concreta no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo original de Fish Audio y no están disponibles en la información proporcionada. La innovación técnica destacable de esta versión es la cuantización selectiva: solo los expertos MoE se cuantizan a 4 bits, mientras que el códec, los embeddings y el decodificador MTP se mantienen en precisión completa, lo que según el autor preserva la precisión ASR al 100% en la evaluación con Whisper y reduce el tráfico de ancho de banda de memoria un 75%, logrando 1,89x más velocidad que BF16 en memoria unificada de Apple Silicon.

## Capacidades

- Síntesis de voz (TTS) de texto a audio a 44,1 kHz con códec Modded DAC de 10 codebooks.
- Clonación de voz zero-shot de alta fidelidad a partir de audio de referencia y su transcripción.
- Diálogo multipersonaje con hasta 16 hablantes distintos mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Control paralingüístico y emocional en el texto mediante etiquetas como `[sighs]`, `[laughs]` o `[whispers]`.
- Salida en streaming: emite fragmentos de audio en tiempo real a medida que se generan los frames.
- Soporte multilingüe en 10 idiomas: chino, inglés, japonés, coreano, español, francés, alemán, italiano, ruso y portugués.
- Ejecución nativa en Apple Silicon mediante MLX, sin PyTorch en tiempo de ejecución.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Clonación de voz para audiolibros y narración: el modelo permite generar narraciones con una voz concreta a partir de unos segundos de referencia y su transcripción, manteniendo 44,1 kHz de fidelidad y control emocional mediante etiquetas en el texto.
- Doblaje y localización de contenidos: con soporte para 10 idiomas y clonación zero-shot, se puede preservar el timbre del hablante original al generar versiones en español, francés o alemán de un mismo material.
- Producción de audiodramas y ficción sonora: las etiquetas de hablante (hasta 16 personajes) y las marcas paralingüísticas permiten generar diálogos completos con un solo modelo, sin necesidad de grabar actores por separado.
- Asistentes de voz locales en macOS: al ejecutarse con MLX sobre Apple Silicon, puede integrarse en aplicaciones de escritorio que requieran TTS privado y sin conexión, con latencia por paso de 160,4 ms en un M3 Max.
- Accesibilidad y lectura de pantalla: conversión de texto a voz de alta calidad para usuarios con discapacidad visual, con salida en streaming para reducir la espera inicial en textos largos.
- Prototipado rápido de voces para videojuegos: generación de voces de personajes con emociones y susurros para maquetas de diálogo antes de la grabación final con actores.
- Generación de contenido para pódcasts y redes: producción de locuciones y clips de voz con clonación de una voz propia, ejecutándose en local sin depender de APIs en la nube.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en Apple Silicon M3 Max de 128 GB con MLX puro:

| Precisión | Tamaño del modelo | Latencia frase completa (audio de 7,06 s) | Latencia por paso | RTF | Precisión ASR (Whisper) |
|---|---|---|---|---|---|
| 4-bit (este modelo) | 23,2 GB | 24,38 s | 160,4 ms/paso | 3,453 | 100,0% |
| 8-bit | 32,6 GB | 28,29 s | 210,0 ms/paso | 4,827 | 100,0% |
| BF16 | 69,0 GB | 42,90 s | 350,0 ms/paso | 5,238 | 100,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de TTS y no de lenguaje general.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,2 GB para la versión 4-bit; 32,6 GB para 8-bit; 69,0 GB para BF16.
- GPU recomendadas: chips Apple Silicon con memoria unificada suficiente; el autor reporta pruebas en M3 Max de 128 GB. No se documentan requisitos para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En Apple Silicon, sí: un Mac con 32 GB o más de memoria unificada puede alojar la versión 4-bit (23,2 GB), aunque con margen ajustado; 64 GB o más es recomendable para trabajar con holgura. No hay datos de ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: MLX nativo mediante el paquete `drama-3-mlx` (CLI `drama3-mlx` y API Python `Drama3Model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en M3 Max 128 GB, 160,4 ms por paso, 24,38 s para generar 7,06 s de audio (RTF 3,453) con 4 bits. El autor indica que el modelo 4-bit es 1,89x más rápido que BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Drama-3-MLX-4bit (este) | ~8,7B totales, ~3B activos | no disponible | 10 | fish-audio-community-license | safetensors MLX 4-bit | TTS MoE con clonación zero-shot, 44,1 kHz, solo Apple Silicon |
| Drama 3 (fishaudio/drama-3) | ~8,7B totales, ~3B activos (según autor) | no disponible | 10 | fish-audio-community-license | safetensors (BF16) | Modelo original de Fish Audio; requiere 69 GB en BF16 |
| Fish Speech (fishaudio/fish-speech) | no disponible | no disponible | no disponible | no disponible | no disponible | Proyecto upstream de Fish Audio citado por el autor; sin datos concretos en la información disponible |
| Alternativas TTS open source de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa |

## Limitaciones y advertencias

- Licencia no estándar: la Fish Audio Community License puede imponer restricciones al uso comercial; es imprescindible revisar el texto completo antes de desplegar en producción.
- Riesgo de uso indebido de la clonación de voz: la clonación zero-shot permite imitar voces con pocos segundos de referencia, lo que exige consentimiento explícito y controles de identidad en cualquier aplicación real.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos fuera de distribución.
- Limitaciones de idioma: aunque soporta 10 idiomas, no se documenta el rendimiento por idioma ni la calidad relativa del español frente al chino o el inglés.
- Longitud de contexto no disponible: se desconoce la ventana máxima de texto de entrada, lo que dificulta planificar la síntesis de documentos largos sin fragmentación.
- Dependencia de hardware Apple Silicon: la versión MLX no es portable a GPU NVIDIA o AMD sin reconversión; el ecosistema de despliegue (vLLM, TGI, Ollama) no está soportado.
- Requisitos de memoria elevados para un portátil: 23,2 GB solo para pesos en 4 bits, más overhead de ejecución, lo que excluye equipos con 16 GB de memoria unificada.
- Madurez del proyecto: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que la validación comunitaria es inexistente.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo demográfico, acento o género en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/vanch007/Drama-3-MLX-4bit
- Repositorio GitHub del port MLX: https://github.com/vanch007/drama-3-mlx
- Modelo original Drama 3: https://huggingface.co/fishaudio/drama-3
- Repositorio upstream Fish Speech: https://github.com/fishaudio/fish-speech
- Metodología de evaluación: https://github.com/vanch007/drama-3-mlx/tree/main/reports/evaluation
- Licencia Fish Audio Community: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- MLX (Apple): https://github.com/ml-explore/mlx
