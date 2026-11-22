# tyrant35/zils-lite-cdbe

## Resumen

zils-lite-cdbe es un modelo de decisión de aproximadamente 853 millones de parámetros publicado por el usuario tyrant35 en Hugging Face. Se trata de un fine-tune derivado del modelo base joamCriff123/zils-lite-l1121a, etiquetado por el autor como parte de la familia "Zils" y con la etiqueta `decision-model`, lo que indica que su propósito es la clasificación o toma de decisiones sobre entradas de texto más que la generación libre de contenido.

La construcción del modelo sigue una técnica de "soup-pool": se parte de un cuerpo base (el "soup") y se le suma la diferencia respecto a dos fine-tunes LoRA de rango 32 entrenados sobre el propio soup. El primero de ellos (A) se entrenó con tasa de aprendizaje 2e-4 sobre datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer; el segundo (B) se entrenó con tasa 1e-4 sobre los splits de entrenamiento de HellaSwag, WinoGrande, CLINC150 y BANKING77. Ambos incorporan objetivos suaves que mezclan etiquetas gold con las probabilidades del propio soup para preservar el comportamiento original.

El resultado es un modelo compacto (1,7 GB en safetensors, licencia Apache 2.0) orientado a tareas de decisión heterogéneas: sarcasmo, entailment, razonamiento causal, clasificación de intenciones y verificación de hechos, entre otras. Su relevancia práctica radica en que condensa en un único checkpoint de menos de mil millones de parámetros un conjunto amplio de habilidades de clasificación, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión derivado de zils-lite-l1121a) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el proceso como "soup + (A - soup) + (B - soup)", es decir, una suma de tareas sobre el cuerpo base. El modelo A es la media de dos semillas entrenadas con LoRA de rango 32 a tasa 2e-4 sobre datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer. Sus objetivos de entrenamiento mezclan la etiqueta gold (peso 0,5) con las probabilidades que el propio soup asigna (peso 0,5), y además aprendió las probabilidades de respuesta del soup sobre 16.500 prompts de decisión públicos y generados para conservar el comportamiento previo.

El modelo B se entrenó con LoRA de rango 32 a tasa 1e-4 sobre los splits de entrenamiento de HellaSwag, WinoGrande, CLINC150 y BANKING77. Sus objetivos suaves combinan etiquetas gold con las probabilidades del release estándar d3-lite y las del soup, y también aprendió las probabilidades del soup sobre 6.000 prompts de decisión públicos. El entrenamiento utilizó únicamente splits de entrenamiento, más los splits de desarrollo de VAST y NLI4CT; no se empleó ningún split de test de benchmark y se eliminaron las filas cuyo texto aparecía en el conjunto de evaluación. No se especifica en la información disponible la arquitectura interna del modelo base (transformer, híbrida u otra), el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre texto: el modelo está diseñado para emitir decisiones o etiquetas, no para generación abierta.
- Detección de sarcasmo e ironía (entrenado con iSarcasmEval).
- Análisis de sentimiento y valencia (VAST).
- Razonamiento causal y encadenado (CLadder).
- Inferencia de relaciones textuales y entailment clínico (NLI4CT).
- Clasificación de productos y consultas de búsqueda (Amazon ESCI).
- Verificación de hechos (HoVer).
- Sentido común y elección de continuación plausible (HellaSwag).
- Resolución de analogías y corferencia (WinoGrande).
- Clasificación de intenciones en asistentes (CLINC150).
- Clasificación de intenciones en dominio bancario (BANKING77).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Moderación de opiniones y reseñas: el modelo puede clasificar reseñas de producto como positivas, negativas o ambiguas, apoyándose en su entrenamiento sobre Amazon ESCI y VAST para detectar matices de sentimiento y sarcasmo.
- Enrutamiento de consultas en buscadores: al haber aprendido sobre ESCI, puede asignar consultas de usuario a categorías de producto o intención de búsqueda, lo que permite dirigir peticiones a índices o motores especializados.
- Clasificación de intenciones en chatbots: gracias a CLINC150 y BANKING77, puede etiquetar la intención de un mensaje entrante en dominios generales y bancarios, habilitando respuestas automatizadas o derivación a agentes humanos.
- Verificación de afirmaciones en pipelines de contenido: con el entrenamiento en HoVer y NLI4CT, puede evaluar si una afirmación está respaldada por un texto de referencia, útil en sistemas de fact-checking o en la validación de resúmenes generados.
- Análisis de sarcasmo en redes sociales: su entrenamiento con iSarcasmEval le permite marcar publicaciones irónicas, lo que mejora la precisión de herramientas de escucha social y análisis de reputación de marca.
- Evaluación de coherencia en generación aumentada por recuperación (RAG): puede usarse como clasificador de entailment para comprobar si la respuesta generada se deduce del contexto recuperado, reduciendo alucinaciones en sistemas de preguntas y respuestas.
- Filtrado de pares en datasets de instrucciones: al combinar HellaSwag y WinoGrande, puede puntuar la plausibilidad de continuaciones o resoluciones, ayudando a limpiar corpus de entrenamiento para modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 3,4 GB; en fp16/bfloat16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones teóricas a partir del número de parámetros, no verificadas experimentalmente).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o baja latencia, se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060, RTX 4070 y superiores, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: al estar en safetensors, puede cargarse con Transformers; para servir en producción se puede usar vLLM o TGI si la arquitectura del modelo base es compatible, o bien convertir a GGUF para llama.cpp u Ollama (no se han publicado conversiones oficiales).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión de ~850 M de parámetros) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- El modelo es un fine-tune de decisión, no un modelo generativo general; no debe esperarse que produzca texto libre de calidad.
- No se han publicado datos sobre sesgos; al entrenarse con datasets públicos diversos (sarcasmo, banca, verificación de hechos), puede heredar sesgos presentes en ellos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas o sobreconfiadas en dominios alejados de los datos de entrenamiento.
- Longitud de contexto e idiomas soportados no declarados; el uso fuera del inglés (idioma predominante en los datasets citados) no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base joamCriff123/zils-lite-l1121a debe verificarse por si impone restricciones adicionales.
- El autor indica que se eliminaron filas de entrenamiento presentes en el conjunto de evaluación, pero no se han publicado métricas que permitan verificar la ausencia de contaminación ni el rendimiento real.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-cdbe
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1121a
