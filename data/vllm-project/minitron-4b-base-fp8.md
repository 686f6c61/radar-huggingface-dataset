# vllm-project/Minitron-4B-Base-FP8

## Resumen

Minitron-4B-Base-FP8 es un checkpoint cuantizado en FP8 del modelo base `nvidia/Minitron-4B-Base`, publicado por el equipo de vLLM (organización `vllm-project` en Hugging Face) como copia de un artefacto previo alojado en la cuenta personal de uno de sus mantenedores (`mgoin/Minitron-4B-Base-FP8`). El objetivo es doble: por un lado, ofrecer una versión del modelo lista para servirse con vLLM aprovechando el soporte nativo de precisión FP8 en GPUs con capacidad de cómputo adecuada; por otro, servir como checkpoint de referencia en los flujos de integración continua de vLLM, reduciendo el riesgo de dependencia de un repositorio en una cuenta personal.

El modelo subyacente, Minitron-4B-Base, forma parte de la familia Minitron de NVIDIA, derivada de la técnica de pruning y distillation sobre modelos Nemotron de mayor tamaño. Con 4.190.509.056 parámetros (aproximadamente 4,19 mil millones) y un tag `nemotron` en el repositorio, se trata de un transformer decoder-only de tipo denso, no MoE. La cuantización FP8 reduce el peso del repositorio a 5,8 GB, lo que facilita su despliegue en GPUs de gama alta de consumo y profesionales.

La relevancia de esta ficha radica en que es una pieza de infraestructura más que un modelo de propósito general: no incluye model card completa con detalles de entrenamiento, idiomas o benchmarks más allá de una evaluación puntual en GSM8K, y su licencia es la NVIDIA Open Model License, que impone condiciones específicas para uso comercial. Es útil para quien quiera reproducir el pipeline de vLLM con un modelo pequeño en FP8 o validar despliegues de Nemotron a baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Nemotron/Minitron) |
| Parametros totales | 4.190.509.056 (~4,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (checkpoint ya cuantizado); no se documentan otras variantes en este repo |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Nemotron/Minitron y de que se trata de un modelo base denso de aproximadamente 4,19 mil millones de parámetros. Por el nombre y la procedencia (NVIDIA), Minitron se asocia a una metodología de compresión que combina pruning estructurado y distillation a partir de modelos Nemotron de mayor tamaño, pero los detalles concretos de capas, dimensión oculta, número de cabezas de atención, vocabulario o estrategia de tokenización no se especifican en la model card proporcionada.

Tampoco se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones (el sufijo `Base` sugiere que no las hubo). La única innovación técnica explícita es la cuantización a FP8 del checkpoint, pensada para su uso con vLLM y aprovechar las unidades de cómputo en precisión reducida de GPUs Hopper y Ada Lovelace. No se mencionan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto autoregresiva en modo base: al ser un modelo `Base`, no está ajustado para seguir instrucciones ni para conversar de forma alineada.
- Razonamiento y matemáticas básicas: la única evidencia pública es una evaluación en GSM8K con 5 ejemplos (few-shot), con exact match de 0,2305 en modo flexible y 0,2282 en modo estricto.
- Generación de código: no se documenta explícitamente, aunque es una capacidad esperable en modelos base de esta familia; no hay benchmarks disponibles.
- Tool calling / function calling: no disponible; un modelo base sin ajuste no soporta de forma fiable protocolos de llamada a herramientas.
- Agentes y razonamiento multi-paso: no disponible; requiere ajuste posterior (SFT/RLHF) para uso agéntico.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto según la información proporcionada.
- Ejecución optimizada en vLLM: el checkpoint está preparado y validado para el motor de inferencia vLLM con cuantización FP8.

## Casos de uso

- Validación de pipelines de vLLM en CI: el repositorio se mantiene precisamente como checkpoint de referencia para las pruebas de integración continua de vLLM; se usaría para verificar que las builds del motor funcionan con pesos FP8 sin depender de cuentas personales.
- Pruebas de cuantización FP8 en producción: equipos que quieran evaluar el impacto de FP8 frente a BF16/FP16 en latencia y calidad pueden usar este checkpoint como caso de estudio controlado con un modelo de 4 B.
- Fine-tuning posterior sobre dominio específico: al ser un modelo base pequeño, sirve como punto de partida para SFT en tareas verticales (clasificación, extracción, resumen) con coste de entrenamiento moderado.
- Generación de texto en entornos con VRAM limitada: con ~5,8 GB de pesos en FP8, puede desplegarse en GPUs de consumo de gama alta para prototipos de generación de texto sin requisitos de instrucción.
- Benchmarking interno de infraestructura: útil para comparar throughput y latencia entre versiones de vLLM, drivers CUDA y GPUs (por ejemplo, H100 frente a L40S) usando un modelo de tamaño contenido.
- Investigación en compresión de modelos: sirve como referencia para estudiar la degradación de calidad al pasar de BF16 a FP8 en modelos Nemotron/Minitron pequeños, con la evaluación GSM8K como métrica de control.
- Educación y demos de despliegue: por su tamaño y formato, es adecuado para tutoriales de serving con vLLM y cuantización FP8 en talleres o cursos.

## Benchmarks y rendimiento

| Benchmark | Configuración | Métrica | Valor | StdErr |
|---|---|---|---|---|
| GSM8K | 5-shot, flexible-extract | exact_match | 0,2305 | ±0,0116 |
| GSM8K | 5-shot, strict-match | exact_match | 0,2282 | ±0,0116 |

No se han publicado otros resultados de benchmarks en la información disponible. No se dispone de comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,8 GB solo para pesos en FP8; con overhead de KV cache y activaciones, un despliegue práctico requiere del orden de 8-12 GB de VRAM dependiendo de la longitud de contexto y del batch.
- GPUs recomendadas: H100, H200, L40S, L4 y A100 (estas últimas con soporte FP8 limitado o emulado según generación); GPUs Ada Lovelace como RTX 4090 y L40S soportan FP8 de forma nativa.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contexto y batch moderados; en GPUs con menos de 12 GB puede requerir offloading o reducción de batch.
- Opciones de despliegue: vLLM es el motor de referencia para este checkpoint (tags `vllm` y `fp8`); otros motores con soporte FP8 podrían funcionar, pero no se documentan en la información disponible. llama.cpp y Ollama no se mencionan y requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput estimados: no disponibles; no se publican cifras de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minitron-4B-Base-FP8 (este) | ~4,19 B | No disponible | FP8 | NVIDIA Open Model License | Hugging Face (vllm-project) |
| nvidia/Minitron-4B-Base | ~4,19 B | No disponible | BF16/FP16 (original) | NVIDIA Open Model License | Hugging Face (nvidia) |
| mgoin/Minitron-4B-Base-FP8 | ~4,19 B | No disponible | FP8 | NVIDIA Open Model License | Hugging Face (cuenta personal) |

No se dispone de información sobre otros modelos comparables de la misma categoría (4 B densos) en la documentación proporcionada, por lo que no se incluyen alternativas adicionales. Las diferencias entre las tres entradas de la tabla se limitan al origen del repositorio y al formato de pesos; el modelo subyacente es el mismo.

## Limitaciones y advertencias

- Modelo base sin alineación: al ser `Base`, no está ajustado para seguir instrucciones, mantener conversaciones seguras ni rechazar peticiones dañinas; su uso directo en producción conversacional no es recomendable sin un post-entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; se asume el riesgo habitual de sesgos presentes en los datos de entrenamiento del modelo original, no especificados.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks de veracidad ni de seguimiento de instrucciones, no puede estimarse su fiabilidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados figuran como no disponibles, lo que impide garantizar comportamiento multilingüe o ventanas largas.
- Restricciones de licencia: la NVIDIA Open Model License impone condiciones para uso comercial (atribución, cumplimiento de términos y posibles restricciones de redistribución); es necesario revisar el texto completo antes de integrarlo en productos.
- Dependencia de FP8: el checkpoint está cuantizado; la calidad puede diferir de la versión BF16 original y no se documenta la degradación medida más allá de GSM8K.
- Repositorio espejo: este repositorio es una copia de un artefacto en una cuenta personal; para producción conviene fijar un commit concreto y verificar la integridad de los pesos.
- Soporte de motores limitado: pensado para vLLM; otros motores pueden no cargar el formato FP8 sin conversión previa.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/vllm-project/Minitron-4B-Base-FP8
- Repositorio original espejo: https://huggingface.co/mgoin/Minitron-4B-Base-FP8
- Modelo base: https://huggingface.co/nvidia/Minitron-4B-Base
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai
