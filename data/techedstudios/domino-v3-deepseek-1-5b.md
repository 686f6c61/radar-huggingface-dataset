# techedstudios/domino-v3-deepseek-1.5b

## Resumen

DOMINO V3 es un modelo de lenguaje de 1.777.886.724 parámetros desarrollado por Teched Studios (arquitecto principal: Prajjwal Kumar Gupta) a partir del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Se presenta como una arquitectura propia denominada `domino-techedstudios` (`DominoForCausalLM`), que mantiene el backbone transformer del modelo DeepSeek destilado e incorpora modificaciones estructurales: dos "MicroGaps" (cuellos de botella residuales de rango 64) inyectados en las capas 13 y 25 del decodificador.

La propuesta del autor no se limita a la modificación arquitectónica: la model card describe un sistema cognitivo de ocho capas funcionales (percepción, inteligencia, enrutamiento, memoria, agencia, automodelo, control y fiabilidad), una memoria de cinco niveles (trabajo, episódica, semántica, procedimental y de errores), un bucle de verificación de nueve etapas ("Grounded Mastery Loop") y un mecanismo de autorización determinista de herramientas ("DOMINO-Guard"). Conviene subrayar que buena parte de estas capas se describen como "PROTOTYPE ACTIVE" en la propia auditoría del autor, no como componentes plenamente entrenados.

El modelo es relevante ahora por dos motivos: por un lado, hereda las capacidades de razonamiento del destilado de DeepSeek-R1 sobre Qwen-1.5B, un tamaño que cabe en GPU de consumo; por otro, ejemplifica una tendencia de fine-tuning con cirugía arquitectónica y código personalizado (`trust_remote_code`), lo que exige evaluar con cautela la reproducibilidad y la calidad real frente al modelo base. El repositorio es de acceso público bajo licencia Apache 2.0 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `domino-techedstudios` (`DominoForCausalLM`), transformer decoder-only con backbone DeepSeek-R1-Distill-Qwen-1.5B y MicroGaps residuales (rango 64) en capas 13 y 25 |
| Parametros totales | 1.777.886.724 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no confirmadas) |
| Idiomas soportados | No disponible (heredados presumiblemente del modelo base, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de DeepSeek-R1-Distill-Qwen-1.5B, sobre el que el autor ha realizado "cirugía de decodificador": se inyectan dos MicroGaps en las capas 13 y 25, descritos como vías residuales de cuello de botella condicional con rango 64. Según la model card, el enrutamiento MicroGap se ha verificado con logits finitos y aislamiento de gradientes, lo que sugiere que el objetivo es modular el flujo residual en profundidades intermedias sin romper la estabilidad del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO sobre el modelo base.

El resto de componentes descritos (memoria de cinco niveles, bucle de verificación de nueve etapas, DOMINO-Guard, capa de agencia y automodelo) se presentan como capas funcionales del sistema, pero la propia matriz de auditoría del autor las etiqueta como "PROTOTYPE ACTIVE" con comprobación determinista de reglas, no como módulos neuronales entrenados de extremo a extremo. Esto es importante: la modificación verificada es la inyección de los MicroGaps y el empaquetado como modelo HF autónomo con código personalizado; el resto debe tratarse como andamiaje de inferencia o prototipo, no como capacidad aprendida demostrada. No se han publicado detalles sobre la innovación de decodificación especulativa, atención lineal ni técnicas de optimización equivalentes.

## Capacidades

- Generación de texto autorregresiva y razonamiento de tipo cadena de pensamiento, heredados del destilado de DeepSeek-R1 sobre Qwen-1.5B.
- Razonamiento matemático y de sentido común a escala 1.5B, condicionado por la calidad del destilado original.
- Generación de código y explicaciones técnicas, sin confirmación de benchmarks específicos en la información disponible.
- Soporte declarado de tool calling y agencia (capa de agencia con descomposición de planes, programación de herramientas y seguimiento de ejecución), sujeto a DOMINO-Guard como lista de permitidos y sandbox.
- Memoria episódica y de errores descrita como prototipo activo, con registros de discrepancia entre resultado esperado y observado.
- Bucle de verificación de nueve etapas (conocimiento, comprensión, aplicación, observación, verificación, análisis, corrección, reaplicación y consolidación) implementado como comprobación determinista de reglas.
- Capacidades multilingües: no disponibles de forma explícita; dependen del tokenizador y del modelo base.
- Capacidades multimodales: la capa de percepción menciona "flujos multimodales planificados", es decir, no implementados.

## Casos de uso

- Razonamiento matemático asistido en entornos educativos: el modelo puede generar cadenas de razonamiento paso a paso para problemas de nivel secundaria y universitario, aprovechando la destilación de DeepSeek-R1; su tamaño de 1.5B permite desplegarlo en una única GPU de consumo para tutores interactivos.
- Generación y revisión de código en pipelines de CI/CD: con soporte declarado de tool calling y el guard de herramientas, puede integrarse como agente que propone parches, ejecuta tests en sandbox y registra errores en la memoria episódica del prototipo.
- Automatización de soporte técnico multi-turno: la memoria de trabajo y episódica descrita permite mantener estado de conversación y recuperar errores previos, aunque la longitud de contexto efectiva no está documentada y debe validarse empíricamente.
- Experimentación en investigación sobre arquitecturas modificadas: los MicroGaps en capas 13 y 25 ofrecen un caso de estudio reproducible para medir el efecto de cuellos de botella residuales en modelos pequeños, comparando contra el checkpoint base de DeepSeek.
- Agentes de verificación de hechos en dominios acotados: el bucle de nueve etapas con comprobación determinista de reglas puede usarse para validar salidas contra criterios objetivos (por ejemplo, formato JSON, rangos numéricos o consistencia de unidades) antes de consolidar respuestas.
- Despliegue edge o on-premise con requisitos de privacidad: al pesar 3,6 GB en safetensors y caber en GPUs de 8-16 GB tras cuantización, es apto para prototipos locales donde no se permite enviar datos a la nube.
- Evaluación comparativa de fine-tunes con código personalizado: útil para equipos que quieran estudiar los riesgos de `trust_remote_code` y establecer protocolos de auditoría de repositorios HF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base; la matriz de auditoría solo indica estados de implementación ("VERIFIED", "PROTOTYPE ACTIVE"), no puntuaciones de calidad.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6-8 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se confirman artefactos GGUF/AWQ/GPTQ en el repositorio.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 40/80 GB y H100 para despliegues concurrentes; también es viable en GPUs de 8 GB con cuantización.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16 y en tarjetas de 4-6 GB con cuantización, siempre que el código personalizado (`trust_remote_code`) sea compatible con el runtime elegido.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (único método documentado); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y requeriría portar la arquitectura `DominoForCausalLM`.
- Latencia y throughput: no disponibles. A título orientativo, un modelo de 1.5B en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para esta implementación concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DOMINO V3 (techedstudios) | 1.777.886.724 | No disponible | Apache 2.0 | Hugging Face, código personalizado | MicroGaps en capas 13 y 25; sin benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 millones aprox. | 32.768 tokens (según model card del original) | MIT (según el modelo original) | Hugging Face, transformers estándar | Modelo base; benchmarks publicados por DeepSeek |
| Qwen2.5-1.5B-Instruct | 1.500 millones aprox. | 32.768 tokens (según model card) | Apache 2.0 | Hugging Face, transformers, vLLM, llama.cpp | Amplio soporte de runtimes y cuantizaciones |
| Llama 3.2 1B Instruct | 1.200 millones aprox. | 128.000 tokens (según model card) | Llama 3.2 Community License | Hugging Face, ecosistema amplio | Contexto largo y buen soporte multilingüe |

La comparación debe tomarse con cautela: los datos de contexto y licencia de los modelos alternativos provienen de sus respectivas model cards y no han sido verificados en esta ficha; para DOMINO V3, la ausencia de benchmarks impide afirmar superioridad o paridad frente al modelo base.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que los MicroGaps mejoren al modelo base; la calidad podría ser igual o inferior.
- Componentes declarados como "PROTOTYPE ACTIVE": memoria de cinco niveles, bucle de nueve etapas y capa de agencia no están validados como capacidades aprendidas, sino como andamiaje determinista.
- Riesgo de alucinación heredado del destilado de DeepSeek-R1 en tamaño 1.5B, especialmente en dominios factuales y matemáticas complejas.
- Longitud de contexto no documentada: limita el diseño de aplicaciones multi-turno o de documentos largos sin validación previa.
- Idiomas soportados no declarados: el rendimiento fuera del inglés y del chino puede degradarse; requiere evaluación específica.
- Uso de `trust_remote_code=True`: ejecuta código del autor al cargar el modelo; en producción debe auditarse el repositorio y fijarse una revisión concreta.
- Compatibilidad limitada con runtimes estándar: al ser una arquitectura personalizada, vLLM, llama.cpp, Ollama y TGI pueden no funcionar sin portar `DominoForCausalLM`.
- Repositorio sin descargas ni likes y creado recientemente: no hay señal de comunidad ni de validación independiente.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad sobre sesgos, alucinaciones o fallos del código personalizado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; se recomienda aplicar filtros y evaluación propia antes de cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/techedstudios/domino-v3-deepseek-1.5b
- Perfil del autor: https://huggingface.co/techedstudios
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Blog o repositorio de Teched Studios: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
