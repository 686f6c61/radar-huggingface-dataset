# Torbeck/GLM-4.7-Flash-abliterated

## Resumen

GLM-4.7-Flash-abliterated es una versión modificada del modelo zai-org/GLM-4.7-Flash, publicada por el usuario Torbeck (atribuida en la model card a Wangzhang Wu) mediante la herramienta Abliterix. La modificación consiste en una intervención en el espacio de pesos y representaciones internas orientada a eliminar el comportamiento de rechazo (refusal) del modelo original, de modo que responda a peticiones que el modelo base declinaría. No se trata de un reentrenamiento ni de un fine-tuning supervisado, sino de una edición quirúrgica de direcciones de activación.

Arquitectónicamente hereda la estructura del modelo base: un transformer MoE con Multi-head Latent Attention (MLA), 30B parámetros totales y aproximadamente 3B activos por token, 47 capas (1 densa y 46 MoE), 64 expertos enrutados más 1 compartido con enrutamiento top-4, tamaño oculto de 2048 y una ventana de contexto de 128K tokens. Los pesos se distribuyen en BF16, lo que explica el tamaño del repositorio de 59,9 GB.

Su relevancia es doble: por un lado, documenta una técnica de abliteración aplicada específicamente a una arquitectura MoE con MLA, incluyendo perfilado de expertos críticos para la seguridad y supresión selectiva de pesos de enrutamiento; por otro, sirve como caso de estudio de los riesgos de las versiones "uncensored" de modelos abiertos, ya que elimina salvaguardas sin añadir otras nuevas y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 MoE Lite con Multi-head Latent Attention (MLA); transformer con mezcla de expertos |
| Parametros totales | 29.943.390.976 (~30B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16 (pesos publicados); INT8 y NF4 documentados por el autor en requisitos de hardware; no se publican ficheros GGUF |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con atención latente multi-cabeza (MLA), una variante de atención con compresión de las claves y valores en un espacio latente de baja dimensión, pensada para reducir el coste de memoria del KV cache en contextos largos. Cuenta con 47 capas, de las cuales la primera es densa y las 46 restantes son MoE, con 64 expertos enrutados y 1 compartido, activando top-4 por token. El tamaño oculto es de 2048. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La modificación de este derivado no altera la arquitectura sino los pesos. El proceso descrito en la model card consta de varias fases: cálculo de direcciones de rechazo a partir de 400 pares de prompts dañinos frente a 400 benignos en las 47 capas; aplicación de abliteración ortogonalizada para aislar patrones de activación específicos del rechazo; intervención independiente sobre las proyecciones de salida de atención (MLA) y sobre las down-projections de MLP y expertos, incluidos los compartidos; perfilado de activaciones de expertos en las 46 capas de enrutamiento para identificar expertos críticos para la seguridad; y aplicación de un steering híbrido sobre el MoE que combina supresión de pesos de enrutamiento en 21 expertos (bias = -1,64) con abliteración fusionada de expertos (weight = 1,85). La configuración final se seleccionó mediante optimización Optuna TPE sobre 50 trials (15 de warmup), escogiendo el trial 48.

## Capacidades

- Generación de texto conversacional en inglés y chino, heredada del modelo base GLM-4.7-Flash.
- Razonamiento multi-turno con ventana de contexto de 128K tokens.
- Capacidad de respuesta a peticiones que el modelo original rechazaría (comportamiento "uncensored"), que es el objetivo declarado de la modificación.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer de Hugging Face.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido para este derivado; estas capacidades, si existen en el modelo base, no se detallan en la model card.
- Capacidades multilingües limitadas a los idiomas declarados (en, zh); no se garantiza un comportamiento equivalente en castellano.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la abliteración afecta al comportamiento de rechazo y a las capacidades generales, comparando la divergencia KL de 0,0133 frente al original y la tasa de rechazo de 1/100 frente a 92/100.
- Evaluación de técnicas de edición de pesos en arquitecturas MoE: sirve como referencia reproducible del pipeline de Abliterix (perfilado de expertos, supresión de enrutamiento, abliteración fusionada) para investigadores que trabajen en interpretabilidad mecanicista.
- Red teaming y pruebas de robustez: útil para generar respuestas a prompts adversarios y calibrar filtros de contenido o clasificadores de seguridad en pipelines de moderación.
- Análisis de sesgos y contenido dañino en entornos controlados: al eliminar el rechazo, facilita la recolección de muestras que de otro modo serían difíciles de obtener, siempre con supervisión humana y fines de evaluación.
- Estudio comparativo de derivados abliterados: permite medir la degradación de capacidades (KL divergence) y el aumento de compliance en función de la intensidad del steering aplicado.
- Docencia y formación en seguridad de IA: como ejemplo práctico de por qué las licencias permisivas (MIT) y la ausencia de salvaguardas en modelos abiertos requieren controles adicionales en producción.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0133 | 0 |
| Tasa de rechazo (100 prompts dañinos, juez Gemini Flash) | 1/100 (1%) | 92/100 (92%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: ~56 GB; requiere A100 80GB o H100.
- VRAM estimada en INT8: ~30 GB; apto para A40 o RTX 4090 (24 GB es insuficiente en la práctica para INT8 completo con overhead, por lo que conviene verificar).
- VRAM estimada en NF4: ~15 GB; cabe en RTX 3090 y RTX 4080.
- No cabe en GPUs de consumo con menos de 16 GB en ninguna cuantización documentada.
- Opciones de despliegue: carga directa con `transformers` (`AutoModelForCausalLM`, `trust_remote_code=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no se publican ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Torbeck/GLM-4.7-Flash-abliterated | ~30B totales / ~3B activos | 128K | MIT | Derivado abliterado, sin salvaguardas |
| zai-org/GLM-4.7-Flash | ~30B totales / ~3B activos | 128K | MIT | Modelo base original, con alineación de seguridad |
| Alternativas abliteradas de la familia GLM | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |
| Otros MoE abiertos de ~30B | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el modelo responde a peticiones que el original rechaza, lo que incluye potencialmente contenido dañino, ilegal, explícito u ofensivo.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la intervención en pesos que puede alterar la calibración.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- La divergencia KL de 0,0133 indica que las capacidades generales se mantienen cercanas al original, pero no se han publicado evaluaciones estándar que lo confirmen de forma independiente.
- Licencia MIT: permite uso comercial, pero el aviso de responsabilidad del autor exige que el usuario asuma toda la responsabilidad legal y que realice evaluaciones de riesgo antes del despliegue.
- Ambigüedad de licencia en el ecosistema GLM: la model card señala que el repositorio oficial de código declara Apache-2.0 mientras la model card del modelo declara MIT; conviene verificar antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, y la revisión exacta del checkpoint base no quedó registrada en los artefactos de publicación, lo que dificulta la reproducibilidad.
- No se documentan ficheros GGUF ni cuantizaciones publicadas, lo que limita el despliegue en entornos de bajo consumo.
- No apto para decisiones de alto impacto (médicas, legales, financieras o de seguridad) sin revisión humana cualificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torbeck/GLM-4.7-Flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- Licencia del modelo base (referencia citada en la model card): https://huggingface.co/zai-org/GLM-4.7-Flash
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos específicos de este derivado.
