# ya9919/sharp-421m-compat

## Resumen

FinL (publicado en el repositorio `ya9919/sharp-421m-compat`) es un modelo de decisión de aproximadamente 421 millones de parámetros desarrollado en el marco del proyecto S²-MAS, un framework de simulación multiagente a escala social orientado al estudio de decisiones financieras de hogares. El modelo adapta el encoder ModernBERT-large del modelo base `convaiinnovations/laya` mediante una cabeza de puntuación de opciones (*option-scoring head*), de modo que no genera texto libre sino que asigna una puntuación a cada alternativa de un menú de respuestas dado un estado del hogar y una pregunta.

El checkpoint que nos ocupa es una entrada de compatibilidad en formato nativo Laya/PyTorch del modelo principal de seis rondas (`ya9919/FinL`), entrenado sobre datos de encuestas financieras reales. Su relevancia radica en que ejemplifica un patrón poco habitual: reutilizar un encoder de lenguaje como política de decisión reutilizable dentro de un simulador de agentes, en lugar de emplear un LLM generativo. El contexto de aplicación declarado abarca 12 millones de agentes sintéticos y 24 millones de elecciones en el experimento del manuscrito asociado.

El modelo está orientado exclusivamente al inglés y su licencia es una licencia de investigación controlada, lo que restringe fuertemente su uso comercial. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large heredado de `convaiinnovations/laya`) con cabeza de puntuación de opciones |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (PyTorch nativo); FP16 en la variante MLX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `s2-mas-controlled-research-v1.2` (Controlled Model Research License v1.2), con derechos upstream Apache-2.0 retenidos |
| Formato de pesos | safetensors (librería `laya`, PyTorch nativo) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder ModernBERT-large, y le añade una cabeza de puntuación que evalúa el conjunto completo de alternativas para un par (estado del hogar, pregunta). Esta interfaz de política de decisión es reutilizable entre tareas: en lugar de generar una respuesta, el modelo puntúa cada opción del menú y selecciona la de mayor puntuación. El checkpoint de seis rondas incorpora una continuación de entrenamiento con SFT y RLCD (Reinforcement Learning from Contrastive Data) sobre aproximadamente 2.925.263 ejemplos de entrenamiento por idioma, descrito por el autor como el mayor conjunto de post-entrenamiento de dominio divulgado entre los modelos de decisión financiera comparados en el manuscrito.

La inferencia nativa se realiza en BF16 sobre PyTorch. Existe una variante MLX en FP16 (`ya9919/FinL-mlx`) que reporta resultados prácticamente idénticos en el test compartido (74,5544 % de accuracy y 38,3746 % de F1 frente a 74,5586 % y 38,40 % en PyTorch BF16). El repositorio incluye pesos, tokenizador y configuración de inferencia, junto con un script `predict_example.py` basado en un ejemplo sintético generado de forma independiente.

## Capacidades

- Puntuación de opciones sobre menús de respuesta cerrados (selección de la alternativa más probable para una pregunta y un estado del hogar dados).
- Clasificación de decisión financiera sobre encuestas de hogares (uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos, entre otras).
- Interfaz de política reutilizable apta para integrarse en simuladores multiagente con actualizaciones de estado.
- Procesamiento de estado del hogar estructurado más pregunta en lenguaje natural (inglés).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidad multilingüe limitada al inglés en este checkpoint (existe una variante bilingüe separada, `ya9919/fin-laya-multilingual-mlx`).

## Casos de uso

- Simulación de decisiones de hogares a escala poblacional: el modelo actúa como política de decisión dentro de S²-MAS, puntuando alternativas para cada agente sintético y permitiendo estudiar cómo decisiones individuales agregadas producen resultados poblacionales en consumo, efectivo y medios de pago.
- Modelado de tenencia de productos financieros: dado un estado del hogar, el modelo estima la probabilidad de posesión de tarjetas de crédito, cuentas de depósito, cuentas de valores o depósitos a plazo, útil para estudios de inclusión financiera.
- Investigación académica en economía del comportamiento: permite contrastar hipótesis contrafactuales sobre decisiones de consumo y ahorro ejecutando escenarios alternativos sobre los mismos agentes.
- Generación de datos sintéticos de encuestas: al puntuar menús de respuesta sobre estados de hogar sintéticos, puede producir registros etiquetados para aumentar conjuntos de datos de encuestas financieras.
- Evaluación de políticas públicas simuladas: integrado en un motor de simulación con estado, permite estimar cómo cambios en condiciones externas alteran las trayectorias de consumo y pago de los hogares.
- Prototipado de sistemas de recomendación financiera cerrados: su naturaleza de puntuación de opciones encaja en flujos donde las alternativas están predefinidas y se requiere una selección determinista y auditable, sin generación de texto libre.

## Benchmarks y rendimiento

Resultados publicados por el autor para este checkpoint (PyTorch BF16):

| Test | Idioma de entrada | Backend / precisión | QA (denominador) | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Inglés | PyTorch BF16 | 240.458 | 119 | 74,5586 % | 38,40 % |
| Test ampliado | Inglés | PyTorch BF16 | 418.597 | 862 | 67,2728 % | 27,8355 % |

La misma familia de checkpoint en MLX FP16 obtiene 74,5544 % de accuracy y 38,3746 % de F1 en el test compartido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421 M de parámetros, en BF16 los pesos ocupan aproximadamente 0,84 GB; en FP16, unos 0,84 GB; en FP32, unos 1,68 GB. El consumo real añade memoria para activaciones y tokenizador, por lo que un despliegue típico se sitúa holgadamente por debajo de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el manuscrito cita mediciones en una NVIDIA A100 PCIe de 40 GB en FP16 para la variante bilingüe, aunque ese hardware excede ampliamente los requisitos del modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, así como en Apple Silicon mediante la variante MLX.
- Opciones de despliegue: inferencia nativa en PyTorch (BF16) con la librería `laya`; variante MLX para Apple Silicon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor remite a la model card de `ya9919/fin-laya-multilingual-mlx` y a los Métodos M9 del manuscrito para latencia, throughput y comparación con Jev; no se proporcionan cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinL (`ya9919/sharp-421m-compat`) | 421 M | no disponible | 74,56 % accuracy / 38,40 % F1 (test compartido, EN) | Investigación controlada v1.2 | Pesos en HF (PyTorch y MLX) |
| FinQ (`ya9919/FinQ`) | Basado en Qwen3.5-4B-Base (LoRA + cabeza) | no disponible | no disponible | no disponible | Pesos en HF |
| Jev | no disponible | no disponible | Comparado en Métodos M9 del manuscrito | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos de decisión financiera de terceros; el manuscrito menciona comparaciones internas con otros modelos de decisión financiera, pero sus cifras no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM generativo; solo puntúa alternativas de un menú predefinido y no produce texto libre ni razonamiento explícito.
- Idioma: únicamente inglés en este checkpoint; el uso en otros idiomas requiere la variante bilingüe.
- Licencia restrictiva: la Controlled Model Research License v1.2 limita el uso a investigación controlada; el uso comercial requiere revisión legal y probablemente autorización expresa.
- Riesgo de alucinación estructural: al ser un clasificador sobre opciones, puede seleccionar alternativas incorrectas con alta confianza; el F1 macro por pregunta (38,40 % en el test compartido) indica un rendimiento desigual entre versiones de pregunta.
- Degradación en el test ampliado: la accuracy cae del 74,56 % al 67,27 % y el F1 del 38,40 % al 27,84 % al pasar de 119 a 862 versiones de pregunta, lo que sugiere sensibilidad a la formulación.
- Sesgos: entrenado sobre datos de encuestas financieras reales; puede heredar sesgos demográficos y socioeconómicos de esas muestras.
- Reproducibilidad: los registros de entrenamiento y evaluación no se distribuyen con el modelo, y el motor GENESE/MAS permanece privado, lo que dificulta la replicación completa.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que limita la planificación de despliegues con estados de hogar extensos.
- Madurez: repositorio con 0 descargas y creado en octubre de 2026; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-421m-compat
- Modelo principal nativo de seis rondas: https://huggingface.co/ya9919/FinL
- Entrada de compatibilidad existente: https://huggingface.co/ya9919/fin-laya
- Runtime MLX principal: https://huggingface.co/ya9919/FinL-mlx
- Variante bilingüe MLX: https://huggingface.co/ya9919/fin-laya-multilingual-mlx
- Ruta alternativa basada en Qwen3.5-4B-Base: https://huggingface.co/ya9919/FinQ
- Licencia: https://huggingface.co/ya9919/fin-laya/blob/main/LICENSE
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Modelo base: https://huggingface.co/convaiinnovations/laya
