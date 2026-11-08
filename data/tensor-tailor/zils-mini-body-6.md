# tensor-tailor/zils-mini-body-6

## Resumen

zils-mini-body-6 es un modelo de decisión de tipo "body" (cuerpo) destinado al pool de mezclas (soup) del sistema Zils dentro de la subred 127 de Bittensor. Lo publica el autor tensor-tailor como un fine-tune LoRA del "soup" MINI vigente, que es la media ponderada uniforme de dos cuerpos previos: qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1. El modelo emplea el chasis d3-mini, basado en Qwen3.5-4B con tensores de lenguaje y visión en bf16, y cuenta con aproximadamente 4.539 millones de parámetros totales (4,54 mil millones).

El modelo resuelve una tarea muy concreta: mejorar la precisión de decisión sobre ítems "duros" (aquellos en los que el soup de partida acertaba la opción correcta con menos de 0,90 de probabilidad). Para ello se entrenó con 1.315 filas de etiquetas duras procedentes de bancos de preguntas verificados (lógica, código, razonamiento, aritmética, HellaSwag/ARC y uso de herramientas). No es un modelo generativo de propósito general, sino un componente especializado para el mecanismo de minería de Zils.

Es relevante ahora porque ejemplifica el paradigma de modelos de decisión especializados y de bajo coste computacional (4,5B parámetros, licencia Apache-2.0) que se integran en protocolos descentralizados de validación. Su contexto y capacidades multilingües no están documentados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (chasis Qwen3.5-4B, tensores de lenguaje y visión, bf16) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura del chasis d3-mini, que combina tensores del modelo Qwen3.5-4B tanto para lenguaje como para visión, en precisión bf16. Sobre esa base se aplicó un fine-tune LoRA de rango 32, alpha 64 y dropout 0,05, restringido a las capas de lenguaje (sin adaptadores MLP), con tasa de aprendizaje 5e-5, AdamW con weight decay 1.0 solo sobre los pesos LoRA, batch 8 con acumulación 2, 2 épocas y semilla 4343. La función de pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más 1,0 veces el Brier score, sin término KL ni destilación. Los pesos se fusionaron a bf16.

El conjunto de entrenamiento consta de 1.315 filas con etiquetas duras únicamente: 789 ítems de lógica con etiquetas derivadas por código (entailment lógico con tabla de verdad completa y RuleTaker con solucionador de encadenamiento hacia adelante, splits de entrenamiento públicos); 365 ítems de puntuación generados por código (razonamiento 157, artes 122, lenguaje 86, con etiquetas calculadas por código y un recuento independiente); 105 problemas aritméticos de GSM8K/SVAMP, 27 ítems de HellaSwag/ARC y 2 de CoQA con sus etiquetas de dataset; y 27 ítems de uso de herramientas construidos a partir de registros públicos de function calling (ToolACE, Hermes). No se usaron etiquetas propias, de modelos escritores ni de otros mineros, y cada fila pasó un filtro de n-gramas de 8 del split de examen. El autor reporta una desviación relativa de 0,01212 respecto a Qwen/Qwen3.5-4B (límite 0,15) y una pantalla de copia con cuota propia de 0,0555–0,0607 y coseno máximo de 0,972 respecto al soup.

## Capacidades

- Clasificación y decisión sobre ítems de lógica y entailment lógico.
- Resolución de problemas aritméticos de tipo word problem (GSM8K/SVAMP).
- Razonamiento sobre ítems de conocimiento general y lectura (HellaSwag, ARC, CoQA).
- Uso de herramientas y function calling (ítems de ToolACE y Hermes).
- Capacidad de visión heredada del chasis Qwen3.5-4B (tensores de visión presentes en el chasis).
- No documentado: soporte de agentes multi-paso, thinking mode, audio, ni lista de idiomas.

## Casos de uso

- Validación de decisiones en el pool Zils: el modelo actúa como "body" candidato dentro de la soup de la subred 127 de Bittensor, aportando mejoras en ítems duros de decisión frente al soup de partida.
- Evaluación de razonamiento lógico automatizado: dado que fue entrenado con etiquetas derivadas por tabla de verdad y encadenamiento hacia adelante, puede usarse para puntuar o clasificar problemas de entailment y RuleTaker en pipelines de evaluación.
- Puntuación de problemas aritméticos: integrado en un banco de preguntas para calcular la probabilidad de la opción correcta en problemas de GSM8K/SVAMP, sirviendo como filtro de calidad.
- Clasificación de ítems de conocimiento y lectura: puede emplearse para etiquetar o seleccionar ítems de HellaSwag, ARC y CoQA en procesos de curaduría de datasets.
- Enrutado de llamadas a funciones: los ítems de ToolACE y Hermes permiten usar el modelo como clasificador de intención para decidir qué función invocar en un sistema de function calling.
- Componente de ensemble especializado: al ser un fine-tune de bajo coste (4,5B parámetros, Apache-2.0), puede integrarse como miembro de una mezcla de modelos de decisión en lugar de un modelo generativo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de control: desviación relativa de 0,01212 respecto a Qwen/Qwen3.5-4B (límite 0,15), cuota propia en la pantalla de copia de 0,0555–0,0607 (línea de mezcla 0,05), coseno máximo de 0,972 respecto al soup (línea 0,999) y cuota explicada por cuerpos anteriores de 0,14–0,15 (límite 0,30). Su lectura proxy interna indica ganancias en lenguaje y artes y pérdidas en razonamiento y recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,54 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 9,1 GB (tamaño del repo), por lo que se requiere al menos esa cantidad de VRAM más overhead.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (por ejemplo RTX 4090, A100, H100) sería suficiente para bf16, aunque no hay datos oficiales.
- Cabe en GPU de consumo: probable en tarjetas con 16 GB o más en bf16; con cuantización a 8 bits o 4 bits cabría en GPUs de 8–12 GB, aunque no se documentan tipos de cuantización.
- Opciones de despliegue: no disponible; al usar custom_code y safetensors, requiere cargar con el código del autor (transformers con trust_remote_code).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-mini-body-6 | 4,54B | no disponible | Apache-2.0 | Hugging Face | Fine-tune LoRA de decisión del soup Zils MINI |
| VitaG/zils-mini-c6 | ~5B | no disponible | no disponible | Hugging Face | Otro body del ecosistema Zils, según resultado de búsqueda |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo base del soup de partida |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo base del soup de partida |

## Limitaciones y advertencias

- Modelo especializado en decisión, no un generador de propósito general; su uso fuera de tareas de clasificación/puntuación no está documentado.
- El autor reconoce pérdidas en razonamiento y recuperación en su lectura proxy interna, pese a las ganancias en lenguaje y artes.
- Riesgo de alucinación y sesgos: no documentado; al entrenarse con etiquetas duras de bancos de preguntas, puede heredar sesgos de esos datasets.
- Longitud de contexto e idiomas soportados no están especificados, lo que limita su uso en conversaciones largas o multilingües sin validación previa.
- Requiere cargar custom_code (trust_remote_code) para su uso, lo que implica revisar el código del autor antes de desplegarlo en producción.
- Licencia Apache-2.0 permite uso comercial, pero debe consultarse el NOTICE para las obras upstream y sus avisos.
- Las métricas reportadas son controles internos del autor, no puntuaciones oficiales del validador de Zils.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-6
- Modelo base (soup): https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base (soup): https://huggingface.co/Charlie320/zils-mini-s1
- Modelo relacionado del ecosistema: https://huggingface.co/VitaG/zils-mini-c6
