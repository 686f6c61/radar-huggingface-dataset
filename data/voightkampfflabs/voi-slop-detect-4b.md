# VoightKampffLabs/voi-slop-detect-4B

## Resumen

voi-slop-detect-4B es un clasificador de texto disenado para estimar que fraccion de un texto en ingles ha sido escrita por un modelo de lenguaje. Lo desarrolla VoightKampffLabs como un fine-tuning supervisado sobre Qwen/Qwen3.5-4B, al que se le anade una cabeza de clasificacion de secuencia con una unica salida. El modelo devuelve un logit cuya sigmoide se interpreta como una puntuacion entre 0 (humano) y 1 (generado por IA), con umbrales publicados para tres bandas: humano, editado por IA y generado por IA.

El modelo aborda un problema practico de creciente relevancia: distinguir no solo texto totalmente generado, sino tambien texto humano que ha pasado por un proceso de edicion o reescritura con IA. Para ello se entrena con 484k textos construidos a partir de 98k documentos humanos previos a 2023, con versiones "espejo", "reescritura" y "viaje de ida y vuelta" (traduccion a otro idioma y vuelta al ingles) generadas por modelos de OpenAI, Anthropic, Google, DeepSeek, xAI, Qwen y Gemma.

La arquitectura es la de Qwen3.5-4B (transformer denso de 4.21B parametros de lenguaje mas una torre de vision de 0.33B no utilizada), con contexto de entrada limitado a los primeros 512 tokens. Su licencia Apache 2.0 y su tamano lo hacen desplegable en una sola GPU consumer, lo que lo posiciona como alternativa abierta a detectores comerciales como GPTZero o Pangram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con cabeza de clasificacion de secuencia (una salida) |
| Parametros totales | 4.539.268.096 (4.21B de lenguaje + 0.33B de torre de vision no usada) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens de entrada (truncado) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, repo de 9.1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso con una torre de vision que aqui queda sin usar (0.33B de los 4.54B totales). Sobre la base se aplica un fine-tuning LoRA con rango 16 y alpha 32 sobre las proyecciones de atencion y MLP, que posteriormente se fusiona en los pesos base; la cabeza de clasificacion se entrena completa. La entrada se trunca a los primeros 512 tokens y los bloques de codigo delimitados se vacian a un par de backticks antes de la tokenizacion.

El entrenamiento usa 484k textos derivados de 98k documentos humanos escritos antes de 2023, con un split 80/10/10 por documento fuente. Cada documento humano tiene hasta tres versiones IA: "mirror" (documento nuevo generado a partir de un resumen de dos lineas y palabras clave, sin ver el original), "rewrite" (reescritura bajo una de ocho instrucciones, desde corregir gramatica hasta reescribir con palabras propias) y "round trip" (traduccion a espanol, aleman o ruso y vuelta al ingles). Las fuentes cubren resenas de Amazon, abstracts de arXiv, comentarios de Hacker News, posts de Medium, Reddit, StackExchange y noticias XSum. Los generadores incluyen GPT-6 Luna/Terra/Sol, Claude Haiku/Sonnet/Opus 5.5, Gemini 3.5-3.8 Flash, DeepSeek Flash, Grok 4.3, Qwen3.8-27B y Gemma 4. Se descartan filas cuando el espejo se desvia del tema, la edicion cambia el significado (coseno de embeddings), la edicion altera menos del 2% de las palabras o el texto tiene menos de 30 palabras de prosa. El entrenamiento fue de 3 epocas con lr 2e-4, batch 64 y BCE sobre la puntuacion con pesos balanceados por banda. La longitud mediana es de 116 palabras.

## Capacidades

- Clasificacion de texto en ingles con una puntuacion continua de 0 a 1 que estima la proporcion de texto escrita por un LLM.
- Clasificacion en tres bandas mediante umbrales publicados: humano (<0.15), editado por IA (0.15-0.75) y generado por IA (>=0.75).
- Umbral adicional de "flag" en 0.385 para la pregunta binaria humano/no humano, calibrado para que el 1% de los textos humanos de validacion queden marcados.
- Deteccion de texto editado por IA, no solo de texto totalmente generado, gracias a las etiquetas de reescritura y round trip.
- Estimacion de la fraccion de palabras modificadas (correlacion de Spearman de 0.790 con la fraccion real en el conjunto de test).
- Soporte de batched inference mediante `AutoModelForSequenceClassification` de transformers.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de contenido en foros y comunidades: puntuar automaticamente comentarios y posts para marcar contenido sospechoso de generacion masiva por IA, usando el umbral de flag (0.385) calibrado a un 1% de falsos positivos sobre texto humano.
- Verificacion editorial en medios: clasificar articulos y abstracts recibidos en tres bandas para que los editores revisen manualmente solo los casos en zona "editado por IA", reduciendo la carga de revision.
- Deteccion de reescrituras en entornos academicos: identificar abstracts de arXiv que hayan sido parafraseados con IA mediante la banda de "AI-edited" y la estimacion de fraccion de palabras cambiadas.
- Analisis de calidad de datasets: filtrar corpus recolectados de la web para separar texto humano previo a 2023 de texto generado o reescrito por LLM antes de usarlo en entrenamiento.
- Monitorizacion de plataformas de resenas: puntuar resenas de producto (Amazon) para detectar resenas generadas o reescritas por IA, con la ventaja de que el modelo fue entrenado especificamente con ese dominio.
- Auditoria de pipelines de generacion: comprobar la salida de un sistema de reescritura o traduccion automatica midiendo cuanto texto final conserva senales de IA, usando la puntuacion continua como metrica.
- Investigacion sobre deteccion de IA: servir como linea base abierta y reproducible (Apache 2.0) frente a detectores comerciales en experimentos academicos.

## Benchmarks y rendimiento

Resultados publicados por el autor. El modelo usa sus umbrales por defecto (0.15/0.75 y corte 0.385) salvo en APT-Eval, donde sigue el protocolo del paper con umbral al 5% de falsos positivos. Los resultados de otros detectores son cifras publicadas o calculadas a partir de veredictos almacenados en el benchmark, no reejecutadas. Todo proviene de una unica semilla de entrenamiento.

Split de test reservado (48.041 textos):

| Metrica | Valor |
|---|---|
| Accuracy (3 bandas) | 0.923 |
| Macro-F1 | 0.923 |
| F1 humano / AI-edited / AI-generated | 0.886 / 0.918 / 0.965 |
| AUROC humano vs resto | 0.981 |
| TPR a 1% FPR / 0.1% FPR | 0.688 / 0.467 |
| Error absoluto medio de la puntuacion | 0.052 |
| Spearman puntuacion vs fraccion de palabras cambiadas | 0.790 |

EditLens (test split, clasificacion a tres bandas; ningun texto de este dataset esta en el entrenamiento):

| Detector | Acc | F1 | H | E | G | AI acc | AI F1 | Gen acc | Gen F1 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| EditLens cosine (24B) | 0.902 | 0.904 | 0.904 | 0.868 | 0.941 | 0.938 | 0.954 | 0.964 | 0.941 |
| EditLens soft n-grams (24B) | 0.897 | 0.899 | 0.896 | 0.861 | 0.941 | 0.940 | 0.956 | 0.943 | 0.902 |
| voi-slop-detect-4B | 0.889 | 0.886 | 0.898 | 0.816 | 0.944 | 0.927 | 0.943 | 0.962 | 0.944 |
| GPTZero | 0.747 | 0.727 | 0.773 | 0.509 | 0.898 | no disponible | no disponible | no disponible | no disponible |
| Pangram (3.x API) | 0.730 | 0.695 | 0.764 | 0.432 | 0.890 | 0.807 | 0.837 | 0.923 | 0.890 |
| FastDetectGPT | 0.606 | 0.568 | 0.251 | 0.610 | 0.844 | 0.691 | 0.805 | 0.906 | 0.844 |
| DetectAIve | 0.578 | 0.525 | 0.799 | 0.615 | 0.161 | no disponible | no disponible | no disponible | no disponible |
| Binoculars | 0.485 | 0.501 | 0.547 | 0.300 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- Pesos en bf16: 9.1 GB, por lo que la inferencia requiere aproximadamente 10-12 GB de VRAM contando activaciones y overhead.
- En cuantizacion de 8 bits cabria en GPUs de 8 GB; en 4 bits, en torno a 5-6 GB (no se publican pesos cuantizados oficiales).
- Cabe en GPUs consumer: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y, con cuantizacion, en RTX 3060 (12 GB) o inferiores.
- GPUs de datacenter recomendadas para alto throughput: A100, H100, L40S.
- Despliegue mediante transformers (`AutoModelForSequenceClassification`), con posibilidad de exportar a ONNX o usar vLLM/TGI para clasificacion por lotes (no documentado por el autor).
- El autor indica que fue probado con transformers 5.22 en GPU. No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voi-slop-detect-4B | 4.54B | 512 tokens | Clasificador supervisado (fine-tuning de Qwen3.5-4B) | Apache 2.0 | Pesos abiertos en HF |
| EditLens (cosine / soft n-grams) | 24B | no disponible | Deteccion basada en similitud de embeddings y n-gramas | no disponible | Referencia de benchmark |
| GPTZero | no disponible | no disponible | Detector comercial propietario | Propietaria | API |
| Pangram 3.x | no disponible | no disponible | Detector comercial propietario | Propietaria | API |
| FastDetectGPT | no disponible | no disponible | Deteccion estadistica basada en probabilidades | no disponible | Investigacion |

En EditLens, voi-slop-detect-4B queda ligeramente por debajo de EditLens cosine (0.889 vs 0.902 de accuracy) pero muy por encima de GPTZero (0.747) y Pangram (0.730). Su punto debil relativo es la clase "AI-edited" (F1 0.816 frente a 0.868 de EditLens cosine), mientras que iguala o supera en la clase "AI-generated" (F1 0.944).

## Limitaciones y advertencias

- Solo soporta ingles; textos en otros idiomas no estan cubiertos por el entrenamiento.
- Solo analiza los primeros 512 tokens: textos largos se evaluan unicamente por su comienzo, lo que puede infraestimar o sobreestimar la puntuacion global.
- Entrenado con documentos humanos anteriores a 2023 y generadores concretos (GPT-6, Claude 5.5, Gemini 3.x, DeepSeek Flash, Grok 4.3, Qwen3.8, Gemma 4); puede degradarse frente a modelos o estilos de escritura no representados.
- Riesgo de falsos positivos sobre texto humano: el umbral de flag se calibra a un 1% de FPR en validacion, pero el TPR a 1% FPR es solo 0.688, por lo que una parte relevante de texto IA no se detecta con ese corte.
- Los resultados provienen de una unica semilla de entrenamiento; no se reporta variabilidad entre semillas.
- No debe usarse como prueba definitiva de autoria: es una senal estadistica, no una evidencia forense.
- Los bloques de codigo deben vaciarse a un par de backticks antes de la inferencia para replicar el preprocesado de entrenamiento; no hacerlo puede sesgar la puntuacion.
- La torre de vision del modelo base (0.33B) se incluye en los pesos pero no se usa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos a los del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoightKampffLabs/voi-slop-detect-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset EditLens: https://huggingface.co/datasets/pangram/editlens_iclr
