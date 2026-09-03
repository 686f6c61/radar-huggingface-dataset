# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e

## Resumen

El modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e es una cuantizacion de precision mixta a 6 bits (grupo de 64) de un modelo de mezcla de expertos (MoE) con arquitectura qwen3_5_moe, publicada por el autor symrex mediante la herramienta oQ (oMLX v0.6.4). El modelo cuenta con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun indica la nomenclatura "A3B" en su nombre. Se distribuye en formato MLX safetensors, orientado al ecosistema MLX para hardware Apple Silicon.

El nombre del modelo refleja su linaje de ajuste fino: los terminos "Uncensored", "Genesis" y "Hermes" apuntan a una serie de derivados orientados a conversacion sin restricciones, probablemente basados en la linea Hermes de NousResearch. No se ha publicado informacion sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni la longitud de contexto. El repositorio ocupa 29,6 GB y el modelo fue creado el 3 de septiembre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha.

La relevancia de este modelo reside en su combinacion de arquitectura MoE eficiente (solo ~3B parametros activos por token) y cuantizacion compacta de 6 bits, lo que permite una inferencia rapida con un uso de memoria de aproximadamente 26,3 GB en pesos. No obstante, la ausencia de benchmarks publicados, licencia desconocida y nula validacion comunitaria limitan seriamente su uso en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, transformer) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, grupo de 64 (oQ / oMLX v0.6.4, precision mixta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura qwen3_5_moe, un transformer de mezcla de expertos en el que solo se activan aproximadamente 3.000 millones de los 35.107 millones de parametros por token. Esta arquitectura permite una latencia de inferencia comparable a la de un modelo denso de 3B, manteniendo la capacidad de conocimiento de un modelo de 35B. No se dispone de informacion sobre el numero exacto de expertos, el numero de capas, la configuracion de atencion ni el factor de top-k de activacion.

La version publicada es una cuantizacion de precision mixta a 6 bits con grupo de 64, realizada con la herramienta oQ (oMLX v0.6.4). La cuantizacion oQ aplica precision mixta, lo que implica que diferentes capas pueden retener distintos niveles de precision para minimizar la perdida de calidad. El nombre del modelo sugiere un linaje de ajuste fino que incluye "Uncensored", "Genesis" y "Hermes", aunque no se dispone de informacion detallada sobre el dataset de entrenamiento, el proceso de ajuste o si se utilizaron tecnicas como RLHF o DPO. No se ha publicado el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto conversacional: el sufijo "Uncensored" indica que el modelo esta orientado a conversacion libre sin rechazos de seguridad, aunque no se dispone de documentacion que detalle el alcance de este ajuste.
- Arquitectura MoE eficiente: con solo ~3B parametros activos, ofrece tiempos de respuesta bajos en hardware Apple Silicon, comparable a un modelo denso de 3B.
- Formato MLX: compatible con el ecosistema MLX de Apple, lo que permite integracion con herramientas como mlx-lm y oMLX.
- Cuantizacion de precision mixta: la cuantizacion oQ a 6 bits con grupo de 64 preserva mejor la calidad que una cuantizacion uniforme del mismo ancho de bits.
- Capacidades base de Qwen3.5: al estar basado en la arquitectura qwen3_5_moe, hereda las capacidades generales de la familia Qwen3.5, aunque no se dispone de benchmarks especificos para esta variante.
- Soporte de tool calling, agentes, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido en Apple Silicon: gracias al formato MLX y la cuantizacion a 6 bits, el modelo puede ejecutarse en un Mac con 32 GB de memoria unificada, permitiendo prototipar aplicaciones de chat y generacion de texto sin hardware especializado.
- Experimentacion con modelos sin censura: para investigadores que estudian el comportamiento de modelos ajustados sin restricciones de seguridad, este modelo ofrece una base para analisis de sesgos, alucinaciones y diferencias de comportamiento frente a modelos alineados.
- Desarrollo de aplicaciones de rol y narrativa: la combinacion de "Hermes" y "Uncensored" sugiere un ajuste orientado a escritura creativa y roleplay, util para aplicaciones de ficcion interactiva o generacion de dialogos.
- Evaluacion de cuantizacion oQ: el modelo sirve como caso de estudio para evaluar el impacto de la cuantizacion de precision mixta a 6 bits en modelos MoE grandes, comparando la calidad frente a cuantizaciones uniformes de 4 y 8 bits.
- Inferencia local de bajo coste: con aproximadamente 26,3 GB de pesos, el modelo puede ejecutarse en una Mac Studio o MacBook Pro con 32 GB de RAM, ofreciendo una alternativa local a APIs comerciales para tareas de generacion de texto.
- Investigacion de arquitecturas MoE: el modelo permite estudiar el comportamiento de un MoE de 35B con solo 3B activos, incluyendo la distribucion de rutas entre expertos y el impacto de la cuantizacion en el routing de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo ocupan aproximadamente 26,3 GB en cuantizacion de 6 bits (35.107.181.936 parametros × 0,75 bytes/parametro). El repositorio completo ocupa 29,6 GB, lo que incluye overhead de cuantizacion (escalas, ceros y metadatos).
- Memoria total recomendada: al menos 32 GB de memoria unificada para acomodar pesos, cache KV y overhead de ejecucion. Se recomiendan 64 GB para contextos largos o ejecucion simultanea de multiples instancias.
- Hardware compatible: al ser formato MLX, el modelo esta disenado exclusivamente para Apple Silicon (M1, M2, M3, M4). No es compatible directamente con CUDA, ROCm ni CPU x86.
- Equipos recomendados: Mac Studio con M2 Ultra o M3 Ultra y 64 GB de memoria unificada; MacBook Pro con M3 Max y 48 o 64 GB de RAM.
- Opciones de despliegue: el modelo se puede cargar con la libreria MLX de Apple, o con herramientas como mlx-lm y oMLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversion previa a otros formatos (GGUF, etc.).
- Latencia y throughput: no se dispone de mediciones concretas. Con ~3B parametros activos, la latencia de generacion deberia ser comparable a la de un modelo denso de 3B en el mismo hardware, aunque el router de expertos anade un pequeno overhead.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para este modelo, por lo que la comparacion se limita a caracteristicas arquitectonicas generales. Los datos de los modelos de referencia provienen de conocimiento publico y deben verificarse en sus fichas oficiales:

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35,1B | ~3B | no disponible | no disponible | MLX safetensors |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 32.768 | Apache 2.0 | safetensors, GGUF |
|
