# sunit12/tiny-aya-global-codemix-refusal-lora-v1

## Resumen

El modelo `sunit12/tiny-aya-global-codemix-refusal-lora-v1` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario sunit12 sobre el modelo base `CohereLabs/tiny-aya-global` de Cohere Labs. Se trata de un ajuste fino supervisado (SFT) mediante la librería PEFT y TRL, orientado a generación de texto conversacional. El nombre del repositorio sugiere que el adaptador se ha entrenado para dos objetivos concretos: manejar entradas con *code-mixing* (mezcla de idiomas dentro de una misma conversación o frase) y reforzar comportamientos de rechazo (*refusal*) ante peticiones potencialmente problemáticas.

El modelo base, tiny-aya-global, pertenece a la familia Aya de Cohere Labs, centrada en cobertura multilingüe amplia con variantes de pequeño tamaño. El adaptador ocupa aproximadamente 0,1 GB en el repositorio, lo que es coherente con un conjunto de pesos LoRA de rango bajo y no con un modelo completo. La licencia y los idiomas soportados no están declarados en la información disponible.

La relevancia de esta publicación es limitada pero ilustrativa: muestra un patrón habitual en el ecosistema open source, donde investigadores independientes publican adaptadores experimentales sobre modelos base consolidados. Al no incluir model card sustantiva, resultados de evaluación ni detalles de entrenamiento, debe tratarse como un artefacto de investigación reproducible únicamente si se inspeccionan los pesos y la configuración del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global); detalles del adaptador no disponibles |
| Parámetros totales | No disponible (el repositorio contiene solo pesos del adaptador LoRA, ~0,1 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada) |
| Tipos de cuantización | No disponible (los pesos del adaptador se publican en safetensors; la cuantización depende del modelo base y del runtime) |
| Idiomas soportados | No disponible (el nombre sugiere trabajo sobre code-mixing multilingüe, sin lista declarada) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | PEFT 0.21.3, compatible con transformers y TRL |
| Modelo base | CohereLabs/tiny-aya-global |
| Técnica de ajuste | SFT (supervised fine-tuning) con LoRA |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde al modelo base tiny-aya-global, un transformer decoder-only de la familia Aya de Cohere Labs, pero la información proporcionada no detalla capas, dimensiones ocultas, número de cabezas ni longitud de contexto del modelo base. El adaptador se ha entrenado con la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas proyecciones, reduciendo drásticamente el coste de ajuste y el tamaño del checkpoint resultante.

El entrenamiento se realizó mediante SFT con la librería TRL, según las etiquetas del repositorio. El nombre del modelo indica dos ejes de especialización: *code-mix* (entrenamiento con datos que mezclan idiomas, típico en hablantes bilingües) y *refusal* (ajuste para que el modelo decline peticiones dañinas o fuera de política). No se especifican el número de tokens de entrenamiento, la composición del dataset, hiperparámetros (rango LoRA, alpha, dropout, learning rate), ni si hubo etapas de RLHF o DPO. La model card es la plantilla por defecto de Hugging Face sin rellenar, por lo que todos los campos de detalles de entrenamiento figuran como no disponibles.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la arquitectura del modelo base.
- Ajuste específico para entradas con code-mixing, es decir, mezcla de idiomas dentro de una misma frase o conversación, según indica el nombre del adaptador.
- Comportamiento de rechazo (*refusal*) reforzado mediante SFT, orientado a declinar peticiones problemáticas.
- Soporte multilingüe: probable por la familia Aya del modelo base, pero no declarado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo *thinking*: no disponibles.

## Casos de uso

- Investigación sobre code-mixing: el adaptador permite estudiar cómo un modelo pequeño responde a entradas que alternan idiomas, un fenómeno frecuente en comunidades bilingües y en datos de usuarios reales. Es adecuado como punto de partida para experimentos controlados comparando con el modelo base sin adaptador.
- Evaluación de comportamientos de rechazo: útil para analizar la calibración de negativas ante peticiones sensibles en modelos pequeños, comparando la tasa de rechazo del adaptador frente al modelo base en un conjunto de prompts clasificado por categoría de riesgo.
- Prototipado de asistentes multilingües de bajo coste: al ser un adaptador sobre un modelo tiny, puede desplegarse en hardware modesto para demos internas de chat multilingüe, siempre que se valide previamente la calidad real del ajuste.
- Experimentos de alineación en modelos pequeños: sirve como caso de estudio de cómo el SFT con LoRA modifica comportamientos de seguridad en modelos de pocos parámetros, útil en docencia e investigación sobre alineación.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o continuarse con otros adaptadores en flujos de investigación que exploren composición de LoRAs.
- Filtrado y moderación experimental: el componente de refusal puede evaluarse como capa de cribado en pipelines de contenido, aunque sin métricas publicadas no debe usarse en producción sin validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0,1 GB; los requisitos reales vienen determinados por el modelo base tiny-aya-global, cuyas dimensiones exactas no se detallan en la información proporcionada.
- Al tratarse de un modelo de la familia "tiny", es previsible que quepa en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) en precisión reducida, pero no se dispone de cifras oficiales de VRAM.
- Despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con transformers y aplicar el adaptador mediante PEFT. Para servicio de alto rendimiento puede combinarse con vLLM o TGI si soportan la carga de adaptadores LoRA sobre el modelo base.
- llama.cpp y Ollama requerirían convertir el adaptador y fusionarlo con el modelo base en formato GGUF; no se documenta este flujo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sunit12/tiny-aya-global-codemix-refusal-lora-v1 | Adaptador LoRA sobre tiny-aya-global | No disponible (adaptador ~0,1 GB) | No disponible | No disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global (modelo base) | Modelo completo | No disponible en la información | No disponible | No disponible en la información | Hugging Face |
| Adaptadores LoRA comunitarios sobre modelos Aya | Adaptadores PEFT | Variable | Heredado del base | Variable | Hugging Face |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin completar: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide verificar la calidad del ajuste.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Licencia no declarada: no puede asumirse uso comercial sin consultar la licencia del modelo base CohereLabs/tiny-aya-global y del adaptador.
- Riesgo de alucinación inherente a modelos de pequeño tamaño, potencialmente agravado por un ajuste SFT sin evaluación publicada.
- El comportamiento de refusal puede estar sobredimensionado o mal calibrado: sin métricas, es posible tanto el rechazo excesivo de peticiones legítimas como la aceptación de peticiones problemáticas.
- El ajuste sobre code-mixing puede degradar el rendimiento en entradas monolingües si el dataset de entrenamiento estuvo desequilibrado.
- No se declaran idiomas soportados ni longitud de contexto; cualquier uso en producción requiere evaluación propia.
- Al ser un adaptador, su comportamiento depende enteramente del modelo base, cuyas limitaciones hereda.

## Enlaces

- Hugging Face: https://huggingface.co/sunit12/tiny-aya-global-codemix-refusal-lora-v1
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
