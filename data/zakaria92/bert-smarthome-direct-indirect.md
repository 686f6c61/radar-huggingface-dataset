# zakaria92/bert-smarthome-direct-indirect

## Resumen

`zakaria92/bert-smarthome-direct-indirect` es un checkpoint de clasificación de texto publicado en HuggingFace por el usuario zakaria92, construido sobre la librería `transformers` y con pesos en formato `safetensors`. El recuento real de parámetros del archivo de pesos es de 109.490.699, una cifra compatible con la familia BERT-base (~110 M) más una cabeza de clasificación. El repositorio ocupa 0,4 GB en total y no registra descargas ni "likes" en el momento de la consulta.

El nombre del modelo sugiere un ajuste fino orientado a distinguir comandos directos e indirectos en un contexto de domótica (*smart home*), pero esta interpretación se deduce únicamente del identificador: la model card publicada es la plantilla automática de HuggingFace y no contiene ni descripción, ni dataset, ni hiperparámetros, ni resultados. Tampoco se declaran licencia ni idiomas soportados.

Su relevancia actual es limitada y muy acotada: se trata de un clasificador pequeño, desplegable en CPU y en cualquier GPU consumer, que puede resultar útil como componente de enrutado o etiquetado dentro de un asistente doméstico, siempre que el usuario valide por su cuenta el comportamiento del modelo, ya que el autor no ha documentado nada sobre él.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional); variante exacta no documentada |
| Parámetros totales | 109.490.699 (según safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (los modelos BERT estándar están limitados a 512 tokens posicionales; no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea declarada | text-classification |
| Número de etiquetas | no disponible |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-20 |
| Última actualización | 2026-09-20 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura más allá del tag `bert`. El recuento de parámetros del checkpoint (109.490.699) es coherente con un BERT-base (12 capas, 768 de dimensión oculta, 12 cabezas de atención) al que se le añade una cabeza de clasificación sobre el token `[CLS]`, pero no se puede confirmar el número de capas, la dimensión oculta, el vocabulario ni el número de etiquetas de salida. Tampoco consta si parte de `bert-base-uncased`, `bert-base-cased`, de un modelo multilingüe o de un checkpoint previo del propio autor.

No hay ningún dato sobre el proceso de entrenamiento: se desconoce el corpus (aunque el nombre apunta a un conjunto de instrucciones o comandos de domótica), el número de tokens, si hubo ajuste fino supervisado, RLHF, DPO, destilación o poda, y qué hiperparámetros se emplearon. La model card únicamente incluye la plantilla automática de HuggingFace con todos los campos marcados como `[More Information Needed]`. El tag `arxiv:1910.09700` que aparece en los metadatos corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono del aprendizaje automático, citado en la propia plantilla; no es un paper sobre este modelo.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo devuelve una o varias etiquetas con su puntuación para una secuencia de entrada.
- Discriminación directo / indirecto (inferida del nombre): previsiblemente distingue entre formulaciones imperativas explícitas ("enciende la luz del salón") y formulaciones indirectas ("hace frío aquí"), si bien esto no está confirmado en la documentación.
- Codificación de frases: al ser un encoder BERT, puede extraer representaciones contextuales utilizables como embeddings, aunque no está entrenado específicamente para similitud semántica.
- Compatibilidad con `text-embeddings-inference` y `endpoints_compatible`, según los tags del repositorio, lo que facilita su despliegue en HuggingFace Inference Endpoints.
- Ajuste fino adicional: al ser un checkpoint `transformers` estándar en safetensors, se puede reentrenar sobre etiquetas propias.
- Generación de texto: no. Es un encoder de clasificación, no un modelo causal de lenguaje.
- Tool calling / function calling: no disponible, y en principio no aplicable a un clasificador de este tamaño.
- Capacidades de agente, razonamiento multi-paso, visión, audio o modo "thinking": no disponibles y no esperables en esta arquitectura.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutado de intenciones en asistentes de voz domésticos: el clasificador puede actuar como primera etapa de un pipeline que decida si una frase del usuario contiene una orden ejecutable directa o una petición indirecta que requiere desambiguación antes de invocar el controlador del dispositivo.
- Preprocesado de comandos en un sistema de domótica: etiquetar los turnos de conversación de un usuario para separar instrucciones de comentarios, reduciendo el número de llamadas a un modelo de lenguaje mayor y bajando el coste por interacción.
- Moderación o filtrado de entradas: dado su tamaño (~110 M de parámetros) y su coste de inferencia reducido, puede filtrar en tiempo real grandes volúmenes de texto antes de pasarlos a etapas más caras.
- Análisis de registros de interacción con un asistente: clasificar retrospectivamente miles de transcripciones para medir qué proporción de peticiones son directas frente a indirectas y detectar puntos de fricción en la interfaz de usuario.
- Etiquetado asistido de datos para entrenamiento: usar el modelo como anotador preliminar de un corpus de comandos domésticos y revisar después solo los casos de baja confianza, reduciendo el trabajo manual de anotación.
- Clasificador auxiliar en un sistema de diálogo con *fallback*: si la confianza de la predicción cae por debajo de un umbral, el sistema deriva la petición a un modelo generativo mayor; si la supera, responde con reglas deterministas.
- Ajuste fino sobre un dominio propio: al ser un checkpoint `transformers` estándar, un equipo puede reinicializar la cabeza de clasificación y reentrenarlo con sus propias categorías (por ejemplo, tipos de electrodoméstico) partiendo de este punto.
- Prototipado rápido en CPU: al pesar alrededor de 0,4 GB en fp32, permite montar una demo funcional de clasificación de comandos en un portátil sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada (todos los campos aparecen como `[More Information Needed]`), no hay métricas de exactitud, F1, precisión ni recall, no se describe el conjunto de test y no existe ninguna comparación con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,44 GB en fp32 y 0,22 GB en fp16, calculado a partir de los 109,49 M de parámetros del checkpoint; no se han publicado mediciones reales.
- Cabe en cualquier GPU consumer: tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) lo ejecutan con margen amplio, incluso con lotes grandes.
- También es viable en CPU: el modelo completo en fp32 ocupa menos de 0,5 GB de memoria y el repositorio entero pesa 0,4 GB.
- GPU profesionales: no requiere A100, H100 ni L40S; sería un desperdicio de recursos asignarle ese hardware salvo que se necesite un throughput muy elevado con lotes grandes.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, HuggingFace Inference Endpoints (el tag `endpoints_compatible` lo indica), Text Embeddings Inference (tag `text-embeddings-inference`) y ONNX Runtime tras exportar el modelo. Para `llama.cpp` u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por petición ni de secuencias por segundo, ni en CPU ni en GPU.
- Requisitos de ajuste fino: con 110 M de parámetros, el reentrenamiento es viable en una única GPU consumer de 8-12 GB con lotes moderados; no se documentan los hiperparámetros empleados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zakaria92/bert-smarthome-direct-indirect | 109,49 M | no disponible | no disponible | HuggingFace, safetensors | Sin model card, sin métricas, sin descargas |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | HuggingFace, ampliamente replicado | Checkpoint base de referencia, sin ajuste de tarea |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | HuggingFace | Destilado, ~40 % menos parámetros, pensado para latencia baja |
| roberta-base | 125 M | 512 tokens | MIT | HuggingFace | Entrenado con más datos y enmascarado dinámico; base habitual de clasificadores |

La comparación se limita a parámetros, contexto y licencia, porque no hay ninguna métrica publicada del modelo analizado. Los tres modelos de referencia son checkpoints base sin ajuste de tarea, por lo que sus resultados no son directamente comparables con los de un clasificador afinado sobre un dominio concreto.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de HuggingFace. No se especifican datos de entrenamiento, hiperparámetros, métricas ni uso previsto.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano, en inglés o en varios idiomas.
- Riesgo de sesgo: al desconocerse el corpus de entrenamiento, no se pueden evaluar sesgos demográficos, léxicos o culturales. En un clasificador de comandos domésticos esto puede traducirse en peor rendimiento con acentos, dialectos o formas de cortesía poco representadas.
- Alucinación: un clasificador no genera texto, pero sí puede asignar etiquetas erróneas con alta confianza. No hay información sobre calibración ni sobre el umbral a partir del cual la predicción deja de ser fiable.
- Desplazamiento de dominio: si el modelo se entrenó con comandos de domótica concretos, generalizará mal a vocabulario, dispositivos o idiomas fuera de esa distribución.
- Límite de contexto: aunque no se confirma, la arquitectura BERT estándar impone un máximo de 512 tokens por secuencia; entradas más largas tendrían que truncarse o dividirse.
- Etiquetas desconocidas: se desconoce cuántas clases tiene la cabeza de clasificación y qué significan, lo que impide interpretar la salida sin inspeccionar el fichero `config.json` del repositorio.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican que el checkpoint no ha sido probado ni contrastado por terceros.
- Fechas de metadatos anómalas: el repositorio figura como creado y actualizado el 2026-09-20, con una diferencia de 35 segundos entre ambos eventos, lo que sugiere una subida automatizada sin revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zakaria92/bert-smarthome-direct-indirect
- Paper citado en la plantilla (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Las búsquedas devolvieron páginas genéricas sobre OpenAI, GitHub Copilot y ChatGPT, sin relación con el checkpoint analizado.
