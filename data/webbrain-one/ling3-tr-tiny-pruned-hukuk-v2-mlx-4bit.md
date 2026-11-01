# webbrain-one/ling3-tr-tiny-pruned-hukuk-v2-MLX-4bit

## Resumen

Ling3-TR-Tiny-Pruned-Hukuk v2 (MLX 4-bit) es un modelo de lenguaje especializado en derecho turco, derivado del modelo base `webbrain-one/ling3-turkish-tiny-pruned`, que a su vez procede de `inclusionAI/Ling-3.0-tiny` tras un proceso de poda y adaptación al turco. Lo publica el usuario `webbrain-one` como componente del motor de inferencia de su aplicación de escritorio PekBilen para Mac con Apple Silicon, empaquetado en formato MLX 4-bit para minimizar el consumo de memoria.

El modelo emplea una arquitectura híbrida de tipo `bailing_hybrid` con mezcla de expertos (80 expertos por capa) y aproximadamente 5.290 millones de parámetros totales, de los cuales unos 1.300 millones se activan por token. Esta relación de activación reducida es lo que permite ejecutarlo en equipos de consumo con memoria unificada, a costa de una capacidad de razonamiento limitada en comparación con modelos densos de mayor tamaño.

La versión v2 se ha afinado específicamente sobre un conjunto de datos jurídicos turcos (`hukuk-dataset-v2`, 6.013 ejemplos) con el mismo formato de prompt que usa la aplicación, y se distribuye con una licencia propietaria y privada que restringe copia, redistribución y uso comercial sin autorización escrita del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (`bailing_hybrid`), 80 expertos por capa |
| Parametros totales | 5.287.033.168 (≈5,29 mil millones) |
| Parametros activos | ≈1,3 mil millones por token |
| Longitud de contexto | No disponible (la model card solo indica que `rope_scaling: null` para la implementación en mlx-lm; no se especifica la ventana nominal) |
| Tipos de cuantizacion | 4-bit affine con grupo de tamaño 64 (MLX); existe una versión GGUF IQ4_XS con los mismos pesos |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Propietaria y privada (`license: other`, `license_name: proprietary-private`, todos los derechos reservados) |
| Formato de pesos | `safetensors` (MLX 4-bit, 3,71 GB); también disponible en GGUF |

## Arquitectura y entrenamiento

El modelo parte de `inclusionAI/Ling-3.0-tiny`, una arquitectura híbrida con mezcla de expertos de 80 expertos por capa. Sobre esa base se aplicó una poda y un proceso de "heal" (recuperación) en turco que dio lugar a `webbrain-one/ling3-turkish-tiny-pruned`, con 5,3 mil millones de parámetros totales y aproximadamente 1,3 mil millones activos por token.

La versión v2 se entrenó con el mismo conjunto de datos que el modelo Qwen 3.5 9B v2 de la aplicación: `webbrain-one/hukuk-dataset-v2`, con 6.013 ejemplos en el formato de prompt propio de la aplicación y validados por los supervisores de la misma. Se eliminaron las líneas de planificación porque la aplicación ejecuta Ling sin modo de razonamiento. El ajuste consistió en LoRA por experto (r=32, α=32) en todas las capas lineales, con la pérdida calculada únicamente sobre los tokens del asistente, learning rate 1e-4, una época y un máximo de 12.288 tokens. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en turco, orientada a consultas jurídicas.
- Respuesta a preguntas de legislación y doctrina turca (por ejemplo, condiciones del artículo 138 del Código de Obligaciones turco).
- Formato de chat con plantilla Jinja (`chat_template.jinja`) compatible con `mlx-lm`.
- Modo de razonamiento desactivable mediante `enable_thinking=False`; el modelo está pensado para funcionar sin cadena de pensamiento explícita.
- Ejecución local en Apple Silicon mediante MLX.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del turco.

## Casos de uso

- Asistencia jurídica de escritorio en Mac: la aplicación PekBilen integra el modelo para responder consultas sobre legislación turca en local, sin enviar datos a la nube, gracias al empaquetado MLX 4-bit de 3,71 GB.
- Consulta de artículos concretos del ordenamiento turco: el ajuste sobre el corpus `hukuk-dataset-v2` permite responder preguntas del estilo "¿cuáles son los requisitos del artículo 138 del TBK?", que es exactamente el ejemplo de la model card.
- Clasificación y resumen de resoluciones judiciales: el modelo se evaluó sobre 20 decisiones recientes no vistas durante el entrenamiento, lo que indica cierta capacidad de manejar texto jurídico actual.
- Prototipado de asistentes legales para despachos pequeños: al ejecutarse en un portátil con memoria unificada, permite desplegar un asistente sin infraestructura GPU dedicada.
- Filtrado y preprocesado de documentación legal: puede usarse para reformular o estructurar consultas antes de pasarlas a un modelo mayor, dado su bajo coste de inferencia.
- Evaluación comparativa interna: sirve como referencia de un modelo pequeño especializado frente a alternativas mayores (Qwen 3.5 9B) en tareas concretas de la aplicación.
- Docencia y divulgación jurídica en turco: respuestas orientativas sobre conceptos legales, siempre con verificación en la fuente primaria.

## Benchmarks y rendimiento

Las mediciones publicadas se realizaron sobre la versión GGUF (IQ4_XS, llama.cpp b11724, sin modo de razonamiento), no sobre el paquete MLX. La evaluación cubre 20 decisiones judiciales recientes no incluidas en el entrenamiento, 139 tareas de un solo turno de la aplicación y 40 preguntas de legislación, puntuadas por los supervisores de cita y tarea de la aplicación.

| Prueba | Ling v1 | Ling v2 | Qwen 3.5 9B v2.1 (sin razonamiento) |
|---|---:|---:|---:|
| Tareas de la aplicación | 67 / 139 | 99 | 97 |
| Preguntas de legislación | 36 / 40 | 33 | 38 |
| TRLawBench (97 preguntas ÖSYM) | 30 | 23 | 47 |
| HukukBERT cloze (acc / acc_norm / MCQ conversacional) | 50,8 / 49,3 / 62,7 | 40,8 / 42,5 / 56,3 | 73,6 / 71,1 / – |

La versión v2 mejora claramente a v1 en las tareas de la aplicación y se sitúa al nivel de Qwen 3.5 9B v2.1 sin razonamiento, pero pierde parte del conocimiento memorizado del corpus de entrenamiento de v1 en pruebas de tipo cloze y TRLawBench.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete MLX 4-bit ocupa 3,71 GB en disco; en memoria unificada se requiere un espacio similar más el overhead del runtime de MLX.
- GPU recomendadas: Apple Silicon con memoria unificada (series M1, M2, M3, M4 y superiores); no está pensado para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos 8 GB de memoria unificada, aunque 16 GB o más ofrece mayor margen.
- Opciones de despliegue: `mlx-lm==0.32.2` (requisito explícito de la model card); la versión GGUF equivalente permite usar llama.cpp.
- Latencia y throughput: no disponibles; la model card no publica cifras de rendimiento para el paquete MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling3-TR-Tiny-Pruned-Hukuk v2 (MLX 4-bit) | ≈5,29 mil millones | ≈1,3 mil millones | No disponible | Propietaria privada | HuggingFace (MLX y GGUF) |
| Qwen 3.5 9B v2.1 (referencia de la propia model card) | 9 mil millones (aproximado, no confirmado) | Denso (no confirmado) | No disponible | No disponible | Uso interno en la aplicación PekBilen |
| Ling v1 (versión anterior) | ≈5,29 mil millones | ≈1,3 mil millones | No disponible | Propietaria privada | HuggingFace |

La comparativa se limita a los modelos mencionados en la información disponible; no se han encontrado datos verificables de otras alternativas comparables en la misma categoría (modelos pequeños especializados en derecho turco).

## Limitaciones y advertencias

- Calidad limitada por tamaño: con unos 1,3 mil millones de parámetros activos por token, el modelo es pequeño y sus salidas no constituyen asesoramiento jurídico; deben verificarse siempre en la fuente primaria.
- Pérdida de conocimiento memorizado: en pruebas de cloze y TRLawBench, v2 obtiene peores resultados que v1, lo que sugiere que el ajuste v2 prioriza el formato de la aplicación sobre el conocimiento enciclopédico.
- Riesgo de alucinación: especialmente en referencias a artículos, sentencias y doctrina; la model card no documenta mecanismos de citación verificable.
- Sesgos: no se documentan sesgos específicos, pero el corpus de entrenamiento es reducido (6.013 ejemplos) y de un dominio muy concreto.
- Cobertura lingüística: solo turco; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en documentos largos.
- Licencia: propietaria y privada, todos los derechos reservados; se prohíbe expresamente copiar, distribuir, compartir con terceros o republicar el modelo o derivados en entornos comerciales o de código abierto sin autorización escrita de `webbrain-one`.
- Dependencia de versión: requiere `mlx-lm==0.32.2`; otras versiones pueden no cargar correctamente el paquete.
- Evaluación parcial: las métricas publicadas corresponden a la versión GGUF, no al paquete MLX, por lo que el rendimiento real en Apple Silicon puede diferir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/ling3-tr-tiny-pruned-hukuk-v2-MLX-4bit
- Modelo base: https://huggingface.co/webbrain-one/ling3-turkish-tiny-pruned
- Versión GGUF con los mismos pesos: https://huggingface.co/webbrain-one/ling3-tr-tiny-pruned-hukuk-v2-GGUF
- Conjunto de datos de ajuste: https://huggingface.co/webbrain-one/hukuk-dataset-v2
- Modelo original de partida: `inclusionAI/Ling-3.0-tiny` (referenciado en la model card; no se proporciona URL directa)
- Librería de inferencia: https://github.com/ml-explore/mlx-lm
