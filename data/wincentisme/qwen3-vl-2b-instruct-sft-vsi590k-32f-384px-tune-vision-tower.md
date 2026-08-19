# wincentIsMe/Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px-tune-vision-tower

## Resumen

El modelo **Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px-tune-vision-tower** es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base **Qwen/Qwen3-VL-2B-Instruct**, desarrollado por el usuario `wincentIsMe`. Está diseñado específicamente para **razonamiento espacial** a partir de entradas de vídeo e imágenes, utilizando el dataset **VSI590k** con muestreo de 32 fotogramas por vídeo y resolución de 384 píxeles. La particularidad de esta variante es que la torre de visión (vision tower) se mantiene **descongelada** durante el entrenamiento, lo que permite una adaptación más profunda de las características visuales a la tarea.

Con aproximadamente **2,44 mil millones de parámetros**, este modelo ofrece una alternativa ligera y eficiente para tareas de comprensión espacial en entornos con recursos limitados. Su relevancia radica en que aborda un problema específico —el razonamiento espacial en vídeo— con un tamaño de modelo que puede ejecutarse en hardware de consumo, ampliando las posibilidades de despliegue en robótica, navegación autónoma y análisis de vídeo en tiempo real. El repositorio incluye los pesos consolidados en formato `safetensors`, listos para inferencia o para continuar el ajuste fino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (model_type: `qwen3_vl`) |
| Parametros totales | 2.438.696.960 (~2,44 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantizacion | no disponible (repositorio contiene `safetensors` sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Qwen3-VL**, un transformer multimodal que procesa tanto texto como imágenes y vídeo. En este ajuste fino, se entrenaron **todos los parámetros** del modelo (full-parameter SFT) durante **1 época** y **2308 pasos**, utilizando **DeepSpeed** para la optimización. El dataset empleado, **VSI590k**, está orientado al razonamiento espacial y las entradas de vídeo se muestrean a **32 fotogramas** con una resolución de **384 píxeles**. La innovación técnica clave es el **descongelamiento de la torre de visión** durante el entrenamiento, lo que permite que las representaciones visuales se adapten directamente a la tarea de razonamiento espacial, en lugar de mantener los pesos visuales congelados como en la variante sin el sufijo `-tune-vision-tower`. El entrenamiento se realizó en abril de 2026 en un clúster CVGL, y el repositorio incluye únicamente el checkpoint final consolidado, sin estados de optimizador ni checkpoints intermedios.

## Capacidades

- **Razonamiento espacial**: el modelo está específicamente entrenado para comprender relaciones espaciales en imágenes y vídeos, como posiciones relativas, distancias y trayectorias.
- **Entrada multimodal**: acepta tanto imágenes como vídeos (muestreados a 32 fotogramas) junto con texto, gracias a su arquitectura `image-text-to-text`.
- **Conversación**: soporta interacciones conversacionales, ya que hereda las capacidades de chat del modelo base Qwen3-VL-2B-Instruct.
- **Comprensión de vídeo**: al procesar secuencias de fotogramas, puede analizar movimiento y cambios espaciales a lo largo del tiempo.
- **Integración con transformers**: compatible con la API estándar de Hugging Face (`AutoModelForImageTextToText` y `AutoProcessor`), lo que facilita su uso en pipelines existentes.
- **Fine-tuning continuo**: al proporcionar los pesos consolidados, permite continuar el entrenamiento en otros datasets o tareas relacionadas.

## Casos de uso

- **Robótica y navegación autónoma**: el modelo puede interpretar la posición de objetos y obstáculos en vídeo, ayudando a un robot a planificar rutas o manipular objetos en entornos dinámicos.
- **Análisis de vídeo de vigilancia**: permite detectar comportamientos espaciales anómalos (por ejemplo, intrusiones o movimientos inusuales) a partir de secuencias de vídeo de baja resolución.
- **Asistencia a personas con discapacidad visual**: puede describir la disposición de objetos en una habitación o la ubicación de elementos en una escena capturada con una cámara.
- **Verificación de diseño industrial**: evalúa si los componentes de un producto están correctamente colocados según especificaciones espaciales, a partir de imágenes o vídeos de la línea de montaje.
- **Interacción humano-robot en entornos domésticos**: el modelo puede responder a preguntas como "¿dónde está la taza?" o "¿qué hay encima de la mesa?" usando la entrada de una cámara, facilitando tareas de asistencia.
- **Investigación en visión por computador**: sirve como punto de partida para experimentos de razonamiento espacial en modelos pequeños, permitiendo comparar estrategias de ajuste fino (torre de visión congelada vs. descongelada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación sobre datasets estándar como MMLU, HumanEval o datasets de razonamiento espacial. Se recomienda evaluar el modelo en tareas específicas de razonamiento espacial antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de ~2,44 B parámetros en precisión FP16, la inferencia requiere aproximadamente **5-6 GB de VRAM** en formato de 16 bits. Con cuantización a 8 bits, podría reducirse a ~3-4 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- **GPU recomendadas**: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10G).
- **Compatibilidad con hardware de consumo**: sí, el modelo cabe en GPUs de gama media y alta de consumo, lo que facilita su uso en entornos de desarrollo y edge computing.
- **Opciones de despliegue**: compatible con el ecosistema `transformers` de Hugging Face, por lo que puede servirse con herramientas como **vLLM**, **Text Generation Inference (TGI)** o **llama.cpp** (si se convierte a GGUF). También puede ejecutarse directamente en Python con `AutoModelForImageTextToText`.
- **Latencia y throughput**: no se dispone de mediciones oficiales. Como referencia, un modelo de este tamaño en una RTX 4090 puede generar decenas de tokens por segundo, pero la latencia aumenta al procesar vídeo de 32 fotogramas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Especialización | Licencia |
|---|---|---|---|---|---|
| **Qwen3-VL-2B-Instruct-SFT-VSI590k** (este) | 2,44 B | no disponible | Imagen + vídeo | Razonamiento espacial | no disponible |
| Qwen2-VL-2B-Instruct | 2,2 B | 32k (aprox.) | Imagen + vídeo | Multimodal general | Apache 2.0 |
| Phi-3.5-vision-instruct | 4,2 B | 128k | Imagen | Multimodal general | MIT |
| LLaVA-1.6-2B (Vicuna-7B base) | 2,7 B | 4k | Imagen | Conversación visual | Apache 2.0 |

*Nota: los datos de los modelos comparativos son aproximados y provienen de información pública; no se han verificado en la fuente proporcionada.*

## Limitaciones y advertencias

- **Sesgos del dataset**: al estar entrenado en el dataset VSI590k, el modelo puede heredar sesgos específicos de ese corpus, como una distribución limitada de escenarios o perspectivas espaciales.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir descripciones espaciales incorrectas o inventar relaciones entre objetos, especialmente en escenas complejas o poco representadas en el entrenamiento.
- **Limitaciones de contexto**: la longitud de contexto no se ha documentado en el repositorio; se recomienda verificar el límite real del modelo base antes de usarlo con entradas largas.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base Qwen3-VL es multilingüe, pero el fine-tuning podría haber afectado el rendimiento en idiomas distintos del inglés o chino.
- **Restricciones de licencia**: la licencia no está disponible en el repositorio, por lo que se desconoce si permite uso comercial. Se debe contactar al autor para aclarar los términos.
- **Formato de pesos**: solo se proporcionan pesos en `safetensors` sin cuantizar; para despliegues con menor huella de memoria, será necesario convertirlos a formatos como GGUF o aplicar cuantización manualmente.
- **Producción**: al ser un modelo con 0 descargas y 0 likes, no hay evidencia de validación externa; se recomienda una evaluación exhaustiva antes de integrarlo en aplicaciones críticas.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/wincentIsMe/Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px-tune-vision-tower)
- Modelo base: [Qwen/Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct) (referencia)
