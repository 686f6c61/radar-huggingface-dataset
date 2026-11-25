# YegStu/swedish-grammaticality

## Resumen

Swedish-grammaticality es un modelo de clasificación de texto (en la práctica, regresión con una única salida) que asigna a una frase en sueco una puntuación entre 0 y 1, donde los valores altos indican mayor gramaticalidad. Lo desarrolla el usuario YegStu como un fine-tuning del modelo base AI-Sweden-Models/ModernBERT-base, un transformer encoder de aproximadamente 150 millones de parámetros especializado en sueco. El modelo resultante conserva ese tamaño (149.605.633 parámetros según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es acotado pero útil: disponer de un scorer automático de gramaticalidad para sueco, entrenado con frases de aprendices (DaLAJ), frases de treebank (ScaLA-sv) y datos sintéticos de la tarea. Es relevante para evaluación de sistemas de generación de texto en sueco, filtrado de corpus, corrección gramatical asistida y como componente de pipelines de control de calidad lingüística.

Se trata de un modelo pequeño y ligero (repo de unos 0,6 GB), pensado para inferencia rápida en CPU o GPU de consumo, no para generación de texto. Su ámbito es monolingüe (sueco) y su función es puramente de puntuación, sin capacidades generativas ni de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), fine-tuning como modelo de regresión con una salida |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de AI-Sweden-Models/ModernBERT-base, un encoder de la familia ModernBERT adaptado al sueco, y se reentrena como modelo de secuencia con una sola salida numérica (`AutoModelForSequenceClassification` con `num_labels=1`). La salida se interpreta como una puntuación de gramaticalidad y el autor recomienda recortarla al intervalo [0, 1].

El conjunto de entrenamiento es YegStu/swedish-grammaticality-data, compuesto por frases de aprendices procedentes de DaLAJ, frases de treebank de ScaLA-sv y datos sintéticos de la tarea. Las frases correctas reciben el objetivo 0,95 y las incorrectas 0,4, de modo que el modelo aprende una regresión suave hacia esos dos valores en lugar de una clasificación binaria estricta. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del fine-tuning supervisado.

## Capacidades

- Puntuación de gramaticalidad en sueco: devuelve un valor continuo entre 0 y 1 (con recorte recomendado) para una frase de entrada.
- Clasificación binaria implícita mediante umbral sobre la puntuación (por ejemplo, umbral en torno a 0,5–0,7 según el caso de uso).
- Evaluación de texto generado: permite ordenar o filtrar candidatos según su corrección gramatical.
- Detección de errores en frases de aprendices, gracias al entrenamiento con datos DaLAJ.
- Procesamiento de frases de treebank y texto periodístico o formal, por el entrenamiento con ScaLA-sv.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades generativas, de visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; está entrenado exclusivamente para sueco.

## Casos de uso

- Evaluación de sistemas de generación de texto en sueco: puntuar las salidas de un LLM generativo con este scorer para medir la proporción de frases gramaticales y comparar variantes de decodificación o prompts.
- Filtrado de corpus web en sueco: descartar automáticamente frases con puntuación baja antes de incluirlas en un dataset de preentrenamiento o fine-tuning, reduciendo ruido y texto malformado.
- Corrección gramatical asistida: integrar el scorer como componente de un pipeline que proponga varias reescrituras de una frase y seleccione la de mayor puntuación, útil en herramientas de escritura para aprendices de sueco.
- Control de calidad en traducción automática: puntuar las hipótesis de un sistema sueco-alemán o inglés-sueco y marcar segmentos sospechosos para revisión humana, aprovechando su bajo coste computacional.
- Docencia de sueco como segunda lengua: generar ejercicios y detectar automáticamente frases erróneas en materiales, usando la puntuación como señal de dificultad o de error.
- Investigación en lingüística computacional: disponer de una línea base reproducible para experimentos de aceptabilidad gramatical en sueco, comparable con juicios humanos mediante correlación de Spearman.
- Moderación de contenido generado por usuarios: detectar texto incoherente o generado automáticamente de baja calidad en foros y comentarios en sueco.

## Benchmarks y rendimiento

El autor reporta resultados sobre el conjunto de test de la tarea, compuesto por 120 frases:

| Metrica | Valor |
|---|---|
| Spearman (correlacion con juicios) | 0,728 |
| ROC-AUC | 0,921 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar, ya que no aplican a un modelo de clasificación monolingüe de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos más activaciones; en fp16/bf16, alrededor de 0,3 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU viable: al ser un encoder de 150M de parámetros, el throughput en CPU es alto para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportación a ONNX o TorchScript posible aunque no documentada por el autor; no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera del orden de milisegundos por frase en GPU y decenas de milisegundos en CPU, sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YegStu/swedish-grammaticality | 149,6M | no disponible | Puntuacion de gramaticalidad en sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-base | ~150M | no disponible | Encoder base para sueco (requiere fine-tuning) | no disponible en la informacion | Hugging Face |
| Modelos de aceptabilidad multilingües (p. ej. basados en XLM-R) | ~278M | no disponible | Clasificacion de aceptabilidad en varios idiomas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas específicas para sueco en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en sueco; su uso con otros idiomas produce puntuaciones sin significado.
- El modelo es una regresión entrenada con objetivos 0,95 y 0,4, no una probabilidad calibrada; la salida debe recortarse a [0, 1] y el umbral óptimo depende del caso de uso.
- El conjunto de test es muy pequeño (120 frases); las métricas reportadas tienen alta varianza y pueden no generalizar a dominios distintos (jerga, dialectos, texto informal).
- Riesgo de sesgo hacia los estilos presentes en DaLAJ y ScaLA-sv (texto de aprendices y treebank), con posible peor rendimiento en registros coloquiales.
- Puede puntuar como gramaticales frases semánticamente absurdas pero sintácticamente bien formadas, ya que solo modela gramaticalidad, no coherencia.
- No se documentan sesgos demográficos ni de otro tipo; al ser un clasificador de gramaticalidad, el riesgo principal es la sobrerrepresentación de ciertos registros.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y atribución; conviene verificar la licencia del modelo base ModernBERT de AI-Sweden-Models.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas reportadas.
- No se publican pesos cuantizados ni formatos alternativos; el despliegue en entornos sin PyTorch requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YegStu/swedish-grammaticality
- Dataset de entrenamiento: https://huggingface.co/datasets/YegStu/swedish-grammaticality-data
- Modelo base: https://huggingface.co/AI-Sweden-Models/ModernBERT-base
- DaLAJ (corpus de aprendices): no disponible en la información proporcionada
- ScaLA-sv (treebank sueco): no disponible en la información proporcionada
