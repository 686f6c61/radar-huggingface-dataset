# TYTTYTTYT/llama-pixar-116m-p8

## Resumen

MIXAR 113M (8x8 patches) es un modelo de lenguaje multilingüe desarrollado por el usuario TYTTYTTYT que aborda la generación de texto desde un enfoque radicalmente distinto al habitual: en lugar de operar sobre tokens discretos, lee y escribe texto como píxeles renderizados. Se trata de la etapa 1 (backbone) de la familia MIXAR, un modelo de 113.462.016 parámetros con arquitectura tipo Llama (12 capas, dimensión oculta 768, 12 cabezas de atención, MLP de 3072) que procesa parches binarios de 8x8 píxeles organizados en bloques de 2 parches.

El modelo se ha preentrenado por máxima verosimilitud sobre píxeles en ocho idiomas con escrituras latinas y CJK (alemán, inglés, español, francés, italiano, japonés, coreano y chino), usando datos de mC4. Su relevancia radica en que elimina por completo el tokenizador, un componente que tradicionalmente introduce sesgos y fragilidad en el procesamiento multilingüe, y demuestra que es viable aprender lenguaje directamente desde la representación visual del texto.

Esta etapa 1 está pensada como punto de partida para fine-tuning y entrenamiento posterior; el autor indica explícitamente que la etapa 2, refinada con GRPO, es la opción recomendada para generación libre. La licencia es Apache 2.0 y el repositorio ocupa 0,5 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (LlamaPixar), 12 capas, hidden 768, 12 cabezas, MLP 3072 |
| Parametros totales | 113.462.016 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.024 bloques (entrenado con ventanas de 180 bloques) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MIXAR emplea un transformer decoder-only con la estructura de Llama, pero con una interfaz de entrada y salida completamente distinta: el modelo recibe y emite píxeles binarios de un solo canal (blanco = +1, tinta = -1) organizados en parches de 8x8 píxeles, con dos parches por bloque. El objetivo de preentrenamiento es una entropía cruzada binaria por píxel sobre el siguiente bloque, lo que sustituye la predicción de tokens por la predicción de la imagen del siguiente fragmento de texto. El contexto se mide en bloques y alcanza hasta 1.024, aunque el entrenamiento se realizó con ventanas de 180 bloques.

Los datos de preentrenamiento provienen de mC4 en los ocho idiomas, muestreados uniformemente del corpus agrupado con la siguiente proporción: español 0,243, alemán 0,207, francés 0,171, japonés 0,127, inglés 0,126, italiano 0,088, chino 0,024 y coreano 0,015. El entrenamiento consistió en 1M de pasos con batch global de 384, optimizador AdamW (0,9, 0,95), weight decay 0,1, learning rate 3e-4 con decaimiento coseno hasta 3e-5 y 2k pasos de warmup. Se empaquetaron documentos en secuencias de 180 bloques con separadores EOS y máscaras de atención por documento. El cómputo total fue de aproximadamente 29 horas en 4 GPUs H200. El repositorio incluye `render_config/` con las fuentes y ajustes de renderizado exactos usados en el preentrenamiento, que deben usarse tal cual para evitar un desplazamiento de distribución.

## Capacidades

- Generación de texto libre en ocho idiomas (de, en, es, fr, it, ja, ko, zh) mediante síntesis de píxeles, sin tokenizador.
- Procesamiento de texto renderizado como imagen, lo que permite potencialmente manejar variaciones tipográficas y de formato.
- Clasificación de secuencias mediante `LlamaPixarForSequenceClassification`, incluida en el repositorio para fine-tuning.
- Evaluación en tareas de razonamiento sencillo (bAbI task 1) y predicción de última palabra (LAMBADA).
- Capacidad multilingüe evaluada en SIB-200 (22 idiomas) y XNLI (10 idiomas), incluyendo idiomas no vistos durante el preentrenamiento.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta modo de razonamiento explícito (thinking mode), visión general ni audio.

## Casos de uso

- Investigación en modelos de lenguaje sin tokenizador: sirve como base para estudiar cómo afecta la representación visual del texto al aprendizaje multilingüe, comparando con modelos basados en tokens de tamaño similar.
- Fine-tuning para clasificación de textos multilingües: usando `LlamaPixarForSequenceClassification`, se puede adaptar a tareas como detección de idioma, análisis de sentimiento o clasificación temática en los ocho idiomas soportados.
- Punto de partida para entrenamiento posterior: el autor lo presenta como backbone para etapas adicionales de entrenamiento (por ejemplo, con GRPO), por lo que es adecuado para equipos que quieran continuar el preentrenamiento o aplicar alineamiento.
- Evaluación de robustez tipográfica: al operar sobre píxeles renderizados, permite experimentar con distintas fuentes y tamaños para medir la sensibilidad del modelo a cambios de representación (con la advertencia de que cambiar el renderizado respecto a `render_config/` supone un desplazamiento de distribución).
- Prototipado de OCR inverso o generación de texto como imagen: el pipeline de ejemplo permite generar imágenes PNG con texto producido por el modelo, útil para demos o estudios de representación visual.
- Investigación sobre multilingüismo de bajos recursos: los resultados en SIB-200 con idiomas no vistos (30,9 de macro-F1 en no vistos, 22,4 en bajos recursos) permiten analizar la transferencia entre escrituras latinas y CJK.
- Docencia y experimentación con arquitecturas alternativas: su tamaño reducido (113M) y su licencia permisiva lo hacen manejable para laboratorios con recursos limitados que quieran explorar modelos pixel-based.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI task 1, inglés, generación libre | 11,4 |
| LAMBADA, generación libre (media de 5 idiomas) | 6,0 (en 3,8 / de 10,8 / es 4,6 / fr 5,0 / it 5,8) |
| SIB-200, 22 idiomas (macro-F1) | vistos 70,7 / no vistos 30,9 / no vistos de bajos recursos 22,4 |
| XNLI, 10 idiomas (accuracy, translate-train) | vistos 70,5 / no vistos 61,9 |
| GLUE (media de tareas) | 72,3 |

Las puntuaciones de generación libre son exactitudes juzgadas por un OCR Qwen3.6-35B-A3B con atajo pixel-exact (bAbI task 1 con 3 ejemplos; LAMBADA zero-shot de predicción de última palabra). SIB-200 y XNLI se ajustan por idioma; SIB-200 tiene 8 idiomas vistos en preentrenamiento y 14 no vistos, incluido un subconjunto de bajos recursos. Las tablas completas y los protocolos están en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 113M parámetros, los pesos en fp32 ocupan aproximadamente 0,45 GB; en fp16, unos 0,23 GB. El cuello de botella real es la imagen de entrada y la caché KV sobre bloques de píxeles, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entrenó con 4 H200, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier RTX 3060/4060 o superior, e incluso en CPU para pruebas puntuales (el código de ejemplo selecciona `cuda` si está disponible y cae a `cpu` en caso contrario).
- Opciones de despliegue: `transformers==4.57.3` con `trust_remote_code=True` y la librería `pixar-render==0.5.1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el pipeline de píxeles requiere procesamiento específico.
- Latencia y throughput: no disponibles en la información proporcionada. La generación es iterativa por bloques (hasta 200 bloques en el ejemplo), con decodificación autoregresiva sobre píxeles, lo que previsiblemente es más lento que la generación por tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIXAR 113M (8x8) | 113M | hasta 1.024 bloques | Pixel-based, sin tokenizador | Apache 2.0 | Hugging Face |
| MIXAR 116M (32x32) | 116M | hasta 1.024 bloques | Pixel-based, sin tokenizador | Apache 2.0 | Hugging Face |
| MIXAR 477M (32x32) | 477M | hasta 1.024 bloques | Pixel-based, sin tokenizador | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de otras familias en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas basadas en tokens de tamaño similar.

## Limitaciones y advertencias

- Es un backbone de etapa 1: el autor recomienda la versión de etapa 2 (con GRPO) para generación libre; usar esta etapa para generación directa produce resultados limitados (por ejemplo, 11,4 en bAbI task 1 y 6,0 en LAMBADA).
- Riesgo de alucinación y errores de generación: al predecir píxeles, los fallos pueden manifestarse como texto ilegible o mal renderizado, no solo como contenido incorrecto.
- Sensibilidad al renderizado: cambiar la fuente o los ajustes de `render_config/` supone un desplazamiento de distribución y degrada el rendimiento; es imprescindible usar la configuración exacta del preentrenamiento.
- Limitaciones de contexto: aunque soporta hasta 1.024 bloques, se entrenó con ventanas de 180 bloques, por lo que el rendimiento más allá de esa longitud no está garantizado.
- Cobertura idiomática desigual: el coreano (0,015) y el chino (0,024) tienen una proporción muy baja en el corpus, lo que puede traducirse en un rendimiento inferior en esos idiomas.
- Rendimiento en idiomas no vistos: los resultados de SIB-200 en idiomas no vistos (30,9 de macro-F1) y de bajos recursos (22,4) son claramente inferiores a los vistos (70,7), lo que limita su uso en esos contextos.
- Sin soporte documentado de tool calling, agentes o modos de razonamiento: no es adecuado para pipelines agénticos sin trabajo adicional.
- Requiere `trust_remote_code=True` y la librería `pixar-render`, lo que implica ejecutar código del autor y añade una dependencia específica para el procesamiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos de los datos de preentrenamiento (mC4) y de las fuentes incluidas en `render_config/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8
- Modelo de etapa 2: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2
- Modelo 116M con parches 32x32: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32
- Modelo 477M con parches 32x32: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32
- Código: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575
