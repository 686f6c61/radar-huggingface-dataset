# Suyash2205/signbridge-t5-base-asl-gloss

## Resumen

SignBridge T5-base es un modelo de traducción automática de texto en inglés a glosa de la lengua de signos americana (ASL), desarrollado por Suyash2205 como parte del sistema SignBridge, que convierte la glosa resultante en vídeo de una persona signando. El modelo se basa en el transformer encoder-decoder T5-base de Google (220 millones de parámetros) y se ha ajustado sobre el corpus ASLG-PC12, que contiene pares de frases en inglés y su correspondiente glosa ASL en mayúsculas. Su propósito principal es servir como primera etapa de un pipeline de accesibilidad para personas sordas, generando la secuencia ordenada de signos que luego se renderiza en vídeo.

La relevancia actual del modelo radica en que aborda un problema poco cubierto por la IA generativa: la traducción hacia lenguas de signos, que no es una mera transposición palabra a palabra, sino que requiere un paso intermedio de glosa. Aunque el modelo no produce un orden sintáctico ASL auténtico (el corpus de entrenamiento conserva el orden del inglés), alcanza una precisión muy alta en la conversión léxica y morfológica, con un BLEU-4 de 95,13 en la partición de test no vista durante el entrenamiento. Está publicado bajo licencia Apache-2.0 y solo soporta inglés como idioma de entrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-base (encoder-decoder transformer) |
| Parametros totales | 222.903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (entrenado con max_length 64, aunque T5 soporta hasta 512) |
| Tipos de cuantizacion | no disponible (entrenado en fp16, pesos en safetensors) |
| Idiomas soportados | Ingles (entrada) y glosa ASL (salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-t5/t5-base`, un transformer encoder-decoder preentrenado sobre el corpus C4 con un objetivo de span corruption. Para esta tarea se ha realizado un ajuste fino supervisado sobre el dataset ASLG-PC12 (70.164 frases de entrenamiento, 8.770 de validación y 8.771 de test). El entrenamiento duró 6 épocas (con convergencia en la época 4), con un tamaño de lote de 64, precisión fp16 y una longitud máxima de secuencia de 64 tokens tanto para la entrada como para la salida. Se utilizó una única GPU NVIDIA T4, con un tiempo total de unos 75 minutos y un coste computacional de aproximadamente 2,38 dólares.

El ajuste fino emplea el prefijo obligatorio `translate English to ASL gloss: ` antes de cada frase de entrada, condición que se aplicó de forma consistente durante todo el entrenamiento. Una particularidad técnica importante es que el corpus ASLG-PC12 conserva el orden de constituyentes del inglés en sus glosas de referencia, por lo que el modelo aprende a producir glosas con ese orden, no con el orden sintáctico natural del ASL. Además, se aplicó un control de fuga de datos (leakage) al evaluar, separando las 764 frases de test que aparecían literalmente en el entrenamiento (8,7 %) y reportando métricas solo sobre la partición no vista.

## Capacidades

- Traducción de inglés escrito a glosa ASL en mayúsculas, con tokens de puntuación separados.
- Generación de texto en formato texto a texto (text2text-generation) mediante la API estándar de `transformers`.
- Manejo de convenciones de anotación del corpus: prefijos `X-` para pronombres (por ejemplo `X-YOU`, `X-WE`) y `DESC-` para formas descriptivas (`DESC-NOW`, `DESC-LARGEST`).
- Generación con haz de búsqueda (beam search) de 4 para mejorar la coherencia de la salida.
- Capacidad multilingüe: no disponible, solo procesa inglés.
- No dispone de tool calling, ni de capacidades de visión, audio o razonamiento multi-paso.

## Casos de uso

- Sistema de traducción a lengua de signos en tiempo real: el modelo se integra como etapa 1 del pipeline SignBridge, que convierte la glosa generada en vídeo de una persona signando mediante recuperación de clips de WLASL. Es adecuado porque produce glosas de alta fidelidad léxica que luego se renderizan.
- Subtitulación accesible para personas sordas: se puede usar para transformar guiones o subtítulos en inglés a glosa ASL, facilitando la comprensión en entornos educativos o de entretenimiento.
- Herramientas de aprendizaje de ASL: estudiantes pueden escribir frases en inglés y obtener la glosa correspondiente, ayudándoles a practicar la secuencia de signos y la morfología.
- Asistentes virtuales accesibles: integración en chatbots o asistentes de voz que necesiten convertir respuestas textuales en glosa para mostrarlas en una interfaz signada.
- Investigación en procesamiento de lenguaje de signos: sirve como punto de partida para experimentos sobre traducción automática de lenguas de signos, dado su buen rendimiento en el corpus ASLG-PC12.
- Generación de contenido educativo para intérpretes: los intérpretes en formación pueden comparar sus propias glosas con las generadas por el modelo para detectar errores de concordancia o de uso de prefijos.

## Benchmarks y rendimiento

El autor evaluó el modelo sobre la partición de test de ASLG-PC12 (8.771 frases), comparándolo con una línea base basada en reglas y con un T5-small ajustado. Los resultados son los siguientes:

| Sistema | BLEU-4 | ROUGE-L | Exact match | Token acc. |
|---|---|---|---|---|
| Línea base por reglas | 26,76 | 0,7715 | 3,4 % | 20,2 % |
| T5-small (60M) | 87,86 | 0,9666 | 7,2 % | 56,1 % |
| **T5-base (este modelo)** | **95,47** | **0,9927** | **82,5 %** | **90,7 %** |

Además, se realizó un análisis de fuga de datos (leakage) separando las frases de test que aparecían literalmente en el entrenamiento (764 de 8.771, un 8,7 %). Sobre la partición nunca vista (91,3 % de las frases), el modelo obtiene un BLEU-4 de 95,13 y un exact match del 80,50 %. El autor recomienda reportar esta última cifra como la puntuación honesta del modelo.

## Requisitos de hardware

- Inferencia en GPU: el modelo tiene 222,9 millones de parámetros, lo que en fp16 ocupa aproximadamente 446 MB de VRAM. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior.
- Inferencia en CPU: también viable, con una latencia de unos pocos cientos de milisegundos por frase dada la longitud máxima de 64 tokens.
- GPU recomendada: para despliegue en producción con múltiples peticiones concurrentes, una NVIDIA T4 o RTX 3090 es más que suficiente.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, así como con `text-generation-inference` (TGI) según las etiquetas del repositorio. No se ha confirmado soporte para vLLM o llama.cpp en la documentación disponible.
- Throughput estimado: no disponible, pero al ser una secuencia corta (64 tokens) y un modelo pequeño, se espera un alto rendimiento incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU-4 (ASLG-PC12) | Licencia |
|---|---|---|---|---|
| **SignBridge T5-base (este)** | 222,9 M | 64 | 95,13 (partición no vista) | Apache-2.0 |
| T5-small (mismo autor, mismo corpus) | 60 M | 64 | 87,86 | Apache-2.0 |
| Suparnpreet/t5-base-asl-gloss-generation | 222,9 M (estimado) | no disponible | no disponible | no disponible |

El modelo se compara directamente con el T5-small del mismo autor, que obtiene un BLEU-4 mucho menor (87,86 frente a 95,47), y con otro T5-base de la comunidad (Suparnpreet) que fue entrenado desde cero sobre un dataset desconocido y sin métricas publicadas. No hay otros modelos públicos equivalentes que traduzcan inglés a glosa ASL con este nivel de rendimiento documentado.

## Limitaciones y advertencias

- No produce orden de palabras ASL auténtico: el corpus ASLG-PC12 conserva el orden de constituyentes del inglés, por lo que el modelo genera glosas con ese orden. Para obtener una salida con sintaxis ASL real es necesario aplicar una etapa posterior de reordenación por reglas.
- El rendimiento en el corpus puede sobreestimar la calidad en lenguaje natural: las glosas de ASLG-PC12 son generadas por reglas y son más regulares que el lenguaje signado real.
- No captura marcadores no manuales: la glosa no expresa movimientos de cejas, boca o cabeza que son esenciales para la formación de preguntas y negación en ASL.
- Deriva léxica en palabras poco frecuentes: el modelo puede emitir variantes cercanas como `BROR` por *brother* o `MOR` por *mother*, aunque el sistema completo corrige estos errores alineando con la frase fuente.
- Solo soporta inglés de entrada; no hay soporte para otras lenguas de signos.
- La longitud de contexto está limitada a 64 tokens, lo que impide procesar frases largas o documentos completos.
- No se ha publicado una evaluación independiente fuera del autor, y el número de descargas y likes en Hugging Face es cero, lo que indica un uso todavía muy limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Suyash2205/signbridge-t5-base-asl-gloss
- Página del sistema SignBridge (demo): https://signbridge-asl-five.vercel.app
- Dataset ASLG-PC12: https://huggingface.co/datasets/achrafothman/aslg_pc12
- Modelo base T5: https://huggingface.co/google-t5/t5-base
- Modelo similar de la comunidad: https://huggingface.co/Suparnpreet/t5-base-asl-gloss-generation
