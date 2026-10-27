# unbiasederudite/qwen2.5-coder-1.5b-text2sql-qlora

## Resumen

`unbiasederudite/qwen2.5-coder-1.5b-text2sql-qlora` es un adaptador LoRA entrenado con QLoRA sobre el modelo instructivo `Qwen/Qwen2.5-Coder-1.5B-Instruct` de Alibaba, especializado en la tarea text-to-SQL: convertir una pregunta en lenguaje natural, junto con el esquema de una base de datos, en una consulta SQL ejecutable. Lo publica el usuario unbiasederudite en HuggingFace y el repositorio asociado en GitHub documenta el proceso de fine-tuning.

El adaptador se entrena con SFT mediante TRL sobre el conjunto Spider (particiones `train_spider` y `train_others`), tras eliminar preguntas repetidas y consultas de referencia que no se ejecutan, lo que deja 8.647 muestras; además se descartan las 82 muestras que superan los 2.048 tokens. Es, por tanto, un ajuste pequeño y académico orientado a demostrar la viabilidad de especializar un modelo de 1,5B parámetros en generación de SQL con recursos muy limitados.

Su relevancia práctica está en que hereda la ventana de contexto de 32.768 tokens y la naturaleza code-focused del modelo base, pero con un coste de despliegue mínimo: el adaptador ocupa unos 0,1 GB y puede fusionarse con el base para ejecutarse en una GPU de consumo o incluso en CPU. Ahora bien, no hay resultados de evaluación publicados ni licencia declarada para el adaptador, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder); adaptador LoRA/PEFT entrenado con QLoRA |
| Parametros totales | 1.500 millones aprox. en el modelo base; el adaptador LoRA no declara su numero de parametros (repo de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el adaptador se entreno con secuencias de 2.048 tokens como maximo |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision del base); puede fusionarse y cuantizarse a GGUF, AWQ o GPTQ. Existe una version AWQ del modelo base (Qwen2.5-Coder-1.5B-Instruct-AWQ) |
| Idiomas soportados | no disponible para el adaptador; el modelo base es multilingue con foco en ingles y chino, pero el autor no declara idiomas |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-Coder-1.5B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors con pesos de adaptador PEFT/LoRA; requiere descargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-Coder-1.5B-Instruct`, un transformer decoder-only de 1,5B parámetros con RoPE, atención causal estándar y una ventana de 32.768 tokens. El modelo base fue preentrenado por Alibaba con 5,5 billones de tokens que combinan código fuente, texto y datos sintéticos, y posteriormente alineado como modelo instructivo. Sobre esa base, este repositorio añade un adaptador LoRA entrenado con QLoRA (base cuantizado en 4 bits durante el entrenamiento), lo que reduce el coste de ajuste a una sola GPU de gama media.

El entrenamiento es SFT puro con TRL, sin etapa de RLHF ni DPO declarada. El corpus es Spider: se combinan `train_spider` y `train_others`, se eliminan preguntas duplicadas y consultas gold que fallan al ejecutarse, y se descartan las 82 muestras de más de 2.048 tokens, resultando 8.647 ejemplos. Las versiones de framework declaradas son PEFT 0.21.2, TRL 1.16.0, Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2. No se documentan hiperparámetros como rango LoRA, alpha, learning rate ni número de épocas.

## Capacidades

- Generación de SQL a partir de una pregunta en lenguaje natural y un esquema de base de datos, en el estilo de las consultas del benchmark Spider.
- Comprensión de esquemas con múltiples tablas, claves primarias y foráneas, y columnas con nombres descriptivos.
- Herencia de las capacidades de código del modelo base: generación, explicación y corrección de fragmentos en lenguajes como Python, Java, JavaScript o C++.
- Seguimiento de instrucciones conversacionales multi-turno, gracias al formato instructivo de Qwen2.5-Coder.
- Soporte de function calling y tool calling en el modelo base, utilizable si se fusiona el adaptador y se conserva la plantilla de chat original.
- Capacidad multilingüe heredada del base (no cuantificada ni validada por el autor para este adaptador).
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación asistida de consultas en herramientas de BI: el usuario describe en lenguaje natural el informe que necesita y el modelo produce el `SELECT` correspondiente sobre el esquema corporativo, que luego se valida y ejecuta en un entorno de solo lectura.
- Autocompletado y edición de SQL en IDE o notebooks: el adaptador puede sugerir consultas completas a partir de un comentario y del DDL de las tablas, reduciendo el tiempo de escritura de joins y agregaciones.
- Prototipado rápido de interfaces de consulta para APIs de datos internas: se integra en un servicio que recibe `{pregunta, esquema}` y devuelve SQL, con revisión humana antes de ejecutar.
- Generación de consultas de ejemplo para documentación técnica o tests de integración: dado un esquema de staging, el modelo produce consultas representativas para validar pipelines ETL.
- Experimentación académica en text-to-SQL: sirve como baseline ligero y reproducible para comparar técnicas de prompting, esquemas reducidos o fine-tuning adicional sobre Spider.
- Formación y evaluación de agentes de datos: el adaptador actúa como primer paso (NL a SQL) dentro de un agente que después ejecuta la consulta, inspecciona errores y reintenta con el mensaje de error como contexto.
- Despliegue en entornos con recursos limitados: al ocupar el adaptador 0,1 GB y el base unos 3 GB en FP16, es viable en estaciones de trabajo sin GPU dedicada para tareas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la informacion disponible. El autor no incluye métricas de exactitud de ejecución ni de coincidencia exacta sobre el conjunto de evaluación de Spider, ni comparaciones con otros adaptadores.

| Benchmark | Resultado | Notas |
|---|---|---|
| Spider (dev/test) | no disponible | El autor no publica evaluacion del adaptador |
| MMLU | no disponible | No evaluado en la model card |
| HumanEval | no disponible | No evaluado en la model card |
| Epoch AI ECI (modelo base) | 103 | Dato del modelo base Qwen2.5-Coder-1.5B, no del adaptador; posicion 237 de 257 modelos rastreados |
| Posicion en Epoch AI al lanzamiento (modelo base) | 65 de 83 | Dato del modelo base, no del adaptador |

## Requisitos de hardware

- VRAM para el modelo fusionado en FP16: aproximadamente 3,1 GB solo de pesos, más 0,5-2 GB de caché KV según longitud de contexto y batch; en la práctica, 5-6 GB para secuencias de 2-4K tokens.
- VRAM en 8 bits: alrededor de 1,6-2 GB de pesos; en 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 1-1,2 GB.
- GPU de consumo: cabe holgadamente en RTX 3060 6 GB, RTX 4060 8 GB, RTX 4070 y RTX 4090; también en GPUs integradas con 8 GB de memoria unificada para inferencia a baja velocidad.
- GPU de datacenter: A100 40/80 GB, H100 o L40S solo tienen sentido para servir muchas peticiones concurrentes o batches grandes, no por requisito de memoria.
- Despliegue: vLLM o TGI tras fusionar el adaptador con el base; llama.cpp u Ollama tras convertir a GGUF; Transformers + PEFT para cargar el adaptador sin fusionar, útil en experimentación.
- CPU: viable con llama.cpp en cuantización Q4, con latencias del orden de segundos por consulta; no hay cifras de throughput publicadas por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unbiasederudite/qwen2.5-coder-1.5b-text2sql-qlora | 1,5B (base) + adaptador LoRA | 32.768 tokens (entrenado a 2.048) | Text-to-SQL sobre Spider | no disponible para el adaptador; base Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Codigo e instrucciones generales | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 tokens | Codigo e instrucciones generales | Apache-2.0 | HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Instrucciones generales, no especializado en SQL | Llama 3.2 Community License | HuggingFace, requiere aceptar terminos |

El adaptador no aporta una ventaja verificable frente al base en text-to-SQL porque no hay métricas publicadas; su interés es el coste de entrenamiento y el ejemplo metodológico. Frente a Qwen2.5-Coder-7B-Instruct, el modelo de 7,6B debería ser claramente superior en calidad de SQL, a costa de unos 15 GB en FP16. Frente a Llama-3.2-1B-Instruct, la ventaja de este adaptador es la especialización declarada en SQL y el contexto de 32K, aunque el modelo de Meta ofrece 128K tokens y una licencia explícita.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: se desconoce la exactitud de ejecución en Spider y el rendimiento fuera del dominio de entrenamiento.
- El entrenamiento se limita a preguntas y esquemas en inglés del corpus Spider; el rendimiento con preguntas en castellano o con esquemas con nombres en castellano no está validado.
- Aunque el base soporta 32.768 tokens, el adaptador solo vio secuencias de hasta 2.048 tokens, por lo que esquemas muy grandes pueden degradar la calidad.
- Riesgo de alucinación de tablas o columnas inexistentes, y de generar SQL sintácticamente válido pero semánticamente incorrecto; requiere validación contra el esquema y ejecución en entorno controlado.
- Riesgo de generar consultas destructivas (`DELETE`, `UPDATE`, `DROP`) si el prompt lo permite; debe ejecutarse siempre con un usuario de solo lectura y con límites de filas.
- La licencia del adaptador no está declarada, lo que impide confirmar si se permite uso comercial; la licencia Apache-2.0 del modelo base no cubre automáticamente los pesos derivados.
- El repositorio tiene 0 descargas y 0 likes y fue creado en octubre de 2026, por lo que no existe validación por parte de la comunidad.
- El sesgo heredado del modelo base (datos de código y texto de internet, con sobrerrepresentación del inglés y del chino) no ha sido evaluado en este adaptador.
- No se documentan hiperparámetros de entrenamiento ni el script exacto, lo que dificulta la reproducibilidad; el repositorio de GitHub solo describe el filtrado del dataset.
- El tamaño del repo (0,1 GB) sugiere un adaptador de rango bajo; no debe esperarse que corrija limitaciones estructurales del modelo de 1,5B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unbiasederudite/qwen2.5-coder-1.5b-text2sql-qlora
- Repositorio GitHub del proyecto: https://github.com/unbiasederudite/qwen2.5-coder-text2sql-qlora
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Version AWQ del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-AWQ
- Modelo Qwen2.5-1.5B (base no instructivo): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Ficha del modelo base en Epoch AI: https://epoch.ai/models/qwen2-5-coder-1-5b
- Ficha divulgativa del modelo base: https://llm.co/llms/qwen2-5-coder-1-5b
- Repositorio de TRL: https://github.com/huggingface/trl
