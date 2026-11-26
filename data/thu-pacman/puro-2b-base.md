# thu-pacman/Puro-2B-Base

## Resumen

Puro-2B-Base es un modelo de lenguaje causal denso de aproximadamente 2.000 millones de parámetros, desarrollado por el grupo thu-pacman y publicado bajo licencia Apache 2.0. Se trata de un modelo base (pretrained), no alineado ni ajustado por instrucciones, entrenado desde cero sobre 1,4 billones de tokens. Su interés principal no reside solo en los pesos, sino en que todo el proceso —datos, código de entrenamiento, receta y checkpoints intermedios— se publica de forma abierta, con el objetivo declarado de hacer accesible e inspeccionable el preentrenamiento de modelos de escala de miles de millones de parámetros para grupos de investigación pequeños.

La arquitectura sigue la configuración de Qwen3-1.7B (28 capas, hidden size 2.048, 16 cabezas de atención con 8 cabezas KV, FFN de 6.144, vocabulario de 151.936 tokens) pero con inicialización aleatoria y embeddings de entrada y salida no atados (untied). El entrenamiento se realizó íntegramente en GPUs de consumo NVIDIA RTX 5090, empleando FP8 por bloques, el optimizador MuonH con restricciones de hiperbola, selección de datos guiada por proxy y una receta de datos en dos fases con continuación tardía consciente del currículo y promediado de checkpoints.

El modelo es relevante ahora por dos motivos: demuestra que es posible entrenar un 2B competitivo con hardware de consumo a un coste de acelerador estimado de 6.891 dólares (22.514 GPU-horas medidas), y lo hace liberando la receta completa. Su contexto es de 4.096 tokens y solo cubre inglés y chino. Es un punto de partida para fine-tuning, no un asistente listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (configuración Qwen3-1.7B, embeddings untied) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el entrenamiento usó FP8 por bloques) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (clase de exportación `Qwen3ForCausalLM`) |

| Parametro arquitectonico | Valor |
|---|---|
| Hidden size | 2.048 |
| Capas transformer | 28 |
| Cabezas de atención / KV | 16 / 8 |
| Tamano de feed-forward | 6.144 |
| Tamano de vocabulario | 151.936 |
| Inicializacion | desde cero (random init) |
| Tamano del repo | 4,1 GB |

## Arquitectura y entrenamiento

Puro-2B es un transformer decoder-only denso que replica la configuración de Qwen3-1.7B (hidden 2.048, 28 capas, 16 cabezas de atención con 8 cabezas KV, FFN 6.144, vocabulario 151.936) pero parte de inicialización aleatoria, sin reutilizar pesos de Qwen. La única desviación estructural destacada es que los embeddings de entrada y salida no están atados. El modelo se exporta con la clase `Qwen3ForCausalLM`, por lo que es compatible con versiones de Transformers que soporten dicha configuración.

El preentrenamiento consumió 1,4 billones de tokens con una receta de datos en dos fases, selección de datos guiada por proxy y una continuación tardía consciente del currículo seguida de promediado de checkpoints (checkpoint averaging). Técnicamente, el entrenamiento usó FP8 por bloques y el optimizador MuonH con restricciones de hiperbola, todo sobre GPUs RTX 5090. El run canónico acumuló 22.514 GPU-horas activas de entrenamiento, lo que el informe traduce a 6.891 dólares con su tarifa normalizada de alquiler de RTX 5090; estas cifras son solo de acelerador y excluyen adquisición y preprocesado de datos, experimentos fallidos, post-entrenamiento, evaluación, almacenamiento, red y trabajo de investigación. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto autoregresiva en inglés y chino, como modelo base sin alineación.
- Razonamiento y conocimiento general a nivel de modelo base de ~2B, evaluado en tareas de matemáticas, código, sentido común y conocimiento enciclopédico.
- Generación de código y resolución de problemas matemáticos dentro de los límites de su escala (evaluado en GSM8K, MATH, MBPP sanitizado y HumanEval).
- Continuación de texto y few-shot prompting: al ser un modelo base, su uso natural es la compleción y el condicionamiento por ejemplos, no el diálogo instructivo.
- Punto de partida para fine-tuning supervisado y alineación posterior por parte del usuario.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente entrenadas de forma explícita; cualquier comportamiento de este tipo requeriría fine-tuning.

## Casos de uso

- Investigación sobre preentrenamiento a escala pequeña: replicar o modificar la receta con los datos materializados (`thu-pacman/Puro-2B`), el código de entrenamiento (`Puro-Megatron`) y los checkpoints intermedios publicados, para estudiar efectos de presupuesto, currículo y selección de datos.
- Fine-tuning supervisado para dominios verticales: al ser un base model de 2B con licencia Apache 2.0, se puede ajustar con SFT sobre datos propios (legal, médico, atención al cliente) sin restricciones de uso comercial y con requisitos de hardware modestos.
- Generación y compleción de texto en inglés y chino: redacción asistida, resumen extractivo o expansión de borradores en pipelines por lotes, donde el contexto de 4.096 tokens cubre documentos cortos y el coste por token es bajo.
- Experimentos de alineación y evaluación: servir como sujeto de pruebas barato para comparar técnicas de DPO, RLHF o destilación frente a Qwen2-1.5B y Qwen2.5-1.5B con la misma pipeline determinista de OpenCompass descrita en el informe.
- Educación y docencia: usar el modelo y su receta como caso de estudio completo de un ciclo de preentrenamiento (tokenización, FP8, MuonH, checkpoint averaging) en cursos de aprendizaje automático.
- Prototipado de asistentes de código en local: ajustado con SFT sobre pares instrucción-código, puede emplearse para autocompletado o generación de tests en entornos con GPUs de consumo, dado su tamaño reducido y su soporte de cuantización vía ecosistema Transformers.
- Base para modelos especializados en chino: con vocabulario de 151.936 tokens y entrenamiento que incluye chino, sirve como inicialización para tareas de procesamiento de lenguaje natural en chino con presupuesto limitado.

## Benchmarks y rendimiento

Resultados del informe técnico, obtenidos con una pipeline determinista de OpenCompass sobre checkpoints base. Las tareas de generación usan decodificación greedy; las de elección múltiple, ranking por verosimilitud de tokens fija. Puntuaciones en porcentaje.

| Modelo | Matemáticas + Código (4 tareas) | Razonamiento + Conocimiento (11 tareas) | Global (15 tareas) |
|---|---:|---:|---:|
| Qwen2-1.5B | 40,29 | 60,54 | 55,14 |
| **Puro-2B** | **43,50** | **63,02** | **57,81** |
| Qwen2.5-1.5B | 47,52 | 65,53 | 60,73 |

Las cuatro tareas de matemáticas y código son GSM8K, MATH, MBPP sanitizado y HumanEval. Las once tareas de razonamiento y conocimiento incluyen MMLU, MMLU-Pro, ARC-Challenge, ARC-Easy y BoolQ, entre otras (la lista completa no está disponible en la información proporcionada). No se han publicado en la información disponible resultados desglosados por tarea individual.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del número de parámetros; no se publican cifras oficiales de cuantización).
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); A100/H100 no son necesarias para inferencia, solo para entrenamiento a mayor escala.
- Cabe en GPU de consumo: sí, con holgura en RTX 4090 (24 GB) y también en tarjetas de 8-12 GB con cuantización.
- Opciones de despliegue: Transformers (soporte nativo mediante `Qwen3ForCausalLM`), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; el uso con vLLM, llama.cpp u Ollama requeriría conversión a los formatos correspondientes, no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en RTX 5090 con FP8 por bloques, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (15 tareas) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Puro-2B-Base | ~2,03B | 4.096 | 57,81 | Apache 2.0 | Hugging Face, ModelScope |
| Qwen2-1.5B | ~1,5B | 32.768 (según ficha oficial de Qwen2) | 55,14 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | ~1,5B | 32.768 (según ficha oficial de Qwen2.5) | 60,73 | Apache 2.0 | Hugging Face |

Puro-2B supera a Qwen2-1.5B en el agregado de 15 tareas del informe (+2,67 puntos) y queda por debajo de Qwen2.5-1.5B (-2,92 puntos). La comparación debe leerse con cautela: los resultados de Qwen se obtuvieron con la misma pipeline del informe, pero Puro-2B tiene un contexto mucho menor (4.096 frente a 32.768 tokens) y carece de variantes instruct ya publicadas. La ventaja diferencial de Puro-2B no es el rendimiento bruto, sino la apertura total de la receta de entrenamiento y los datos.

## Limitaciones y advertencias

- Es un modelo base sin instrucción ni alineación: no debe esperarse comportamiento de asistente conversacional; las respuestas a instrucciones directas serán erráticas.
- Contexto limitado a 4.096 tokens, muy por debajo de los 32.768 de Qwen2/Qwen2.5-1.5B, lo que restringe tareas de documento largo y conversaciones multi-turno extensas.
- Solo soporta inglés y chino; el rendimiento en castellano no está evaluado y previsiblemente será pobre.
- Riesgo de alucinación propio de un modelo base de 2B: baja fiabilidad factual en conocimiento especializado y tendencia a continuar patrones del texto en lugar de responder con precisión.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la información disponible; los datos de preentrenamiento no están descritos en detalle más allá de la receta en dos fases.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el modelo se distribuye sin garantías y el usuario asume la responsabilidad del fine-tuning y del filtrado de datos.
- Las cifras de coste (6.891 dólares para el checkpoint canónico, ~4,4K para un checkpoint intermedio) son estimaciones solo de acelerador y no representan el coste total del proyecto; no deben citarse como coste de desarrollo.
- No hay datos publicados sobre cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni sobre rendimiento en inferencia; la integración en producción requerirá validación propia.
- El identificador arXiv 2608.27370 y las fechas del repositorio (creado en 2026) deben verificarse antes de citarlos en publicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thu-pacman/Puro-2B-Base
- Dataset de preentrenamiento: https://huggingface.co/datasets/thu-pacman/Puro-2B
- Implementación de entrenamiento: https://github.com/thu-pacman/Puro-Megatron
- Implementación de procesamiento de datos: https://github.com/thu-pacman/Kaiyuan-Spark
- Informe técnico: https://arxiv.org/abs/2608.27370
- Modelo en ModelScope: https://modelscope.cn/models/thu-pacman/Puro-2B-Base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
