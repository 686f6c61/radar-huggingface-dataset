# vicentesonez/sql4business-planificador-qlora

## Resumen

El modelo `vicentesonez/sql4business-planificador-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`. Lo desarrolla el autor vicentesonez en el contexto del sistema de agentes SQL4Business (asignatura Generative Artificial Intelligence 580694, Universidad de Concepción; Deliverable 4). Su función concreta es actuar como el agente "Planificador" del sistema: recibe una pregunta de negocio en lenguaje natural y la convierte en un plan JSON compuesto por pasos SQL y una operación de composición sobre una base de datos SQLite sintética de ventas.

El adaptador no es un modelo generalista, sino un componente especializado dentro de un pipeline multiagente de text-to-SQL. El modelo base Qwen2.5-Coder-3B-Instruct aporta las capacidades lingüísticas y de generación de código, mientras que el adaptador LoRA ajusta el comportamiento para producir planes estructurados en JSON con un formato predecible y verificado.

El interés del modelo reside en su enfoque de ingeniería: datos de entrenamiento generados por código y verificados contra un valor de referencia, entrenamiento QLoRA eficiente (16,7 minutos en una H100), y una pérdida de validación que baja de 0,1581 a 0,0002. Es relevante como ejemplo de especialización de un modelo pequeño (3B) para una tarea acotada mediante PEFT, con licencia Apache 2.0 y soporte bilingüe español-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptadores LoRA |
| Parametros totales | 3B (modelo base); adaptador LoRA con r=16, alpha=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base cargado en NF4 de 4 bits durante entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct (revisión `488639f`), un transformer decoder-only de 3B parámetros. El entrenamiento usa QLoRA: el modelo base se carga cuantizado en NF4 de 4 bits y se entrenan adaptadores LoRA con r=16, alpha=32, dropout=0.05 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El optimizador es AdamW con lr=0.0002, linear warmup del 5% seguido de cosine, 2.0 épocas, lote efectivo 8 y 290 pasos, con precisión bf16 autocast y bf16 4-bit compute.

Los datos de entrenamiento consisten en 1155 ejemplos de entrenamiento y 127 de validación, generados por `scripts/build_planner_data.py` del repositorio del proyecto. Los planes se construyen por código y se verifican contra un valor de referencia, sin incluir preguntas ni cálculos de los conjuntos de evaluación. El entrenamiento se realizó en una NVIDIA H100 80GB HBM3 en 16,7 minutos, con una pérdida de validación que pasó de 0,1581 antes de entrenar a 0,0002 al final.

## Capacidades

- Conversión de preguntas de negocio en lenguaje natural a planes JSON estructurados con pasos SQL y operación de composición.
- Generación de SQL sobre esquemas de bases de datos SQLite (en este caso, una base sintética de ventas).
- Soporte bilingüe español e inglés.
- Razonamiento multi-paso orientado a agentes: el plan producido está pensado para ser ejecutado por otros agentes del sistema SQL4Business.
- Formato de salida estructurado y predecible (JSON), adecuado para pipelines automatizados.
- Capacidades heredadas del modelo base Qwen2.5-Coder-3B-Instruct en generación de código y texto, aunque el adaptador está especializado en la tarea de planificación.
- No se documentan capacidades de visión, audio, tool calling nativo ni thinking mode en la información proporcionada.

## Casos de uso

- Planificación de consultas de negocio: el modelo recibe una pregunta como "¿cuáles fueron las ventas por región el último trimestre?" y devuelve un plan JSON con los pasos SQL necesarios y la operación de composición, que otros agentes del sistema ejecutan sobre la base SQLite.
- Componente de un pipeline multiagente de text-to-SQL: se integra como el agente "Planificador" dentro de SQL4Business, encargándose de la descomposición de la pregunta antes de la generación y ejecución del SQL final.
- Generación de SQL descompuesto: para consultas complejas que requieren varias subconsultas, el modelo produce un plan con pasos ordenados que facilitan la verificación y depuración intermedia.
- Asistente interno de análisis de ventas: desplegado sobre una base de datos de ventas, permite a usuarios no técnicos formular preguntas en español o inglés y obtener planes de consulta ejecutables.
- Prototipado de agentes especializados con PEFT: sirve como ejemplo reproducible de cómo especializar un modelo de 3B con QLoRA para una tarea estructurada con datos generados por código.
- Investigación y docencia: el modelo y su repositorio asociado permiten estudiar el diseño de datos sintéticos verificados, el entrenamiento QLoRA eficiente y la evaluación de agentes de planificación SQL.
- Entornos con recursos limitados: al ser un adaptador sobre un modelo de 3B, puede desplegarse en GPUs de consumo con cuantización, a diferencia de modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación: 0,1581 antes de entrenar y 0,0002 al final del entrenamiento QLoRA.

## Requisitos de hardware

- El adaptador LoRA es ligero (repo de 0,1 GB) y se combina con el modelo base Qwen2.5-Coder-3B-Instruct.
- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantización de 4 bits, 6-7 GB en fp16 para el modelo base de 3B (estimación orientativa; no confirmada en la información proporcionada).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 80GB HBM3; para inferencia bastan GPUs de consumo como RTX 3060 12GB, RTX 4070, RTX 4090, o GPUs de datacenter como A100.
- Cabe en GPU de consumo con cuantización de 4 bits o 8 bits; en fp16 requiere al menos 6-7 GB de VRAM.
- Opciones de despliegue: la carga se documenta con `peft` y `transformers` (`PeftModel.from_pretrained`); es compatible con frameworks que soporten PEFT como vLLM (con adaptadores), TGI o llama.cpp tras conversión a GGUF (no confirmado en la información).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sql4business-planificador-qlora | 3B (base) + LoRA | no disponible | Planificacion text-to-SQL (JSON) | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-3B-Instruct | 3B | no disponible | Generacion de codigo general | apache-2.0 | Hugging Face |
| Alternativas text-to-SQL de 3B | no disponible | no disponible | text-to-SQL | no disponible | no disponible |

La comparativa con modelos específicos de text-to-SQL no está disponible en la información proporcionada. El principal punto de comparación es el propio modelo base, del que este adaptador hereda arquitectura y licencia pero al que especializa para la tarea de planificación estructurada.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado exclusivamente para generar planes JSON sobre una base SQLite sintética de ventas; su rendimiento fuera de ese dominio no está garantizado.
- Los datos de entrenamiento son sintéticos y generados por código, lo que puede limitar la diversidad de preguntas y esquemas que el modelo maneja correctamente.
- Riesgo de alucinación: al ser un modelo generativo, puede producir pasos SQL o estructuras JSON inválidas o no ejecutables; se recomienda validación y verificación contra el esquema real antes de ejecutar.
- El adaptador no incluye el modelo base; es necesario descargar Qwen2.5-Coder-3B-Instruct por separado.
- Idiomas limitados a español e inglés; no se documenta soporte para otros idiomas.
- Longitud de contexto no documentada en la información proporcionada.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos potenciales del modelo base y de los datos sintéticos.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del repositorio del proyecto.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/vicentesonez/sql4business-planificador-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio del proyecto (código, prompts, datos y evaluación): https://github.com/aredhel-jmze/Asistente-SQL-4-Business
