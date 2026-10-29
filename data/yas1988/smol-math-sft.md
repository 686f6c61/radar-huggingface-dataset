# yas1988/smol-math-sft

## Resumen

`yas1988/smol-math-sft` es un ajuste fino por supervisión (SFT) del modelo `HuggingFaceTB/SmolLM2-1.7B`, publicado por el usuario yas1988 el 28 de octubre de 2026. El nombre sugiere una especialización en matemáticas, pero la model card no documenta el conjunto de datos, el número de tokens, los hiperparámetros ni ninguna evaluación, por lo que la orientación matemática es una inferencia a partir del identificador y no un hecho verificado. Se entrenó con TRL 1.16.0 sobre Transformers 5.20.2 y PyTorch 2.11.0+cu130.

El interés práctico es el de un modelo pequeño (1.700 millones de parámetros) que puede ejecutarse en hardware de consumo y sirve como ejemplo reproducible de un pipeline SFT con TRL. Sin embargo, el repositorio acumula 0 descargas y 0 «likes», la licencia no está definida y el tamaño del repo (0,1 GB) es muy inferior a los ~3,4 GB que ocuparían los pesos completos en bf16, lo que apunta a un checkpoint parcial, a adaptadores o a un empaquetado incompleto.

Por tanto, debe tratarse como un artefacto experimental de bajo soporte, no como un modelo listo para producción. Cualquier uso requiere verificar primero qué contiene realmente el repositorio, qué licencia aplica y si el comportamiento matemático es correcto mediante una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de SmolLM2-1.7B; el autor no detalla la configuración |
| Parámetros totales | 1.700 M (1,7 B), según el modelo base declarado |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base SmolLM2-1.7B declara 8.192 tokens |
| Tipos de cuantización | no disponible; el repo solo publica safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card incluye el marcador `licence: license`, sin valor legal |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | HuggingFaceTB/SmolLM2-1.7B |
| Técnica de ajuste | SFT (supervised fine-tuning) con TRL |
| Versiones de framework | TRL 1.16.0, Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |
| Tamaño del repositorio | 0,1 GB (anómalo para pesos completos de 1,7 B en bf16) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo Llama, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención por grupos (GQA) en las variantes de SmolLM2. El autor no publica la configuración concreta (número de capas, dimensión oculta, cabezas de atención ni vocabulario), por lo que estos detalles deben consultarse en la ficha de SmolLM2-1.7B y no en la de este ajuste. El pipeline de ejemplo utiliza una lista de mensajes con roles, lo que indica que el tokenizador aplica alguna plantilla de chat, aunque esta no se especifica.

El entrenamiento consistió exclusivamente en SFT con TRL. La sección «Training procedure» de la model card está vacía: no hay número de pasos, tamaño de batch, tasa de aprendizaje, composición del dataset, número de tokens vistos, ni constancia de RLHF, DPO o verificación de razonamientos. Tampoco se incluyen curvas de pérdida ni resultados de validación, de modo que no es posible saber si el ajuste convergió o si sobreajustó. La única información verificable es el stack de software y el modelo de partida.

## Capacidades

- Generación de texto autoregresiva y respuesta a instrucciones en formato conversacional, gracias a la plantilla de chat que emplea el pipeline de ejemplo.
- Razonamiento matemático: es el objetivo declarado por el nombre del modelo, pero no hay ninguna evaluación publicada que lo confirme.
- Razonamiento multi-paso: presumiblemente heredado de SmolLM2, sin verificación específica tras el ajuste.
- Generación de código: capacidad del modelo base, no evaluada en este checkpoint; no hay evidencia de soporte de tool calling ni function calling.
- Capacidades multilingües: no disponibles; SmolLM2 se entrenó con datos multilingües, pero se desconoce el efecto del SFT sobre idiomas distintos del inglés.
- Modo «thinking», visión, audio o decodificación especulativa: no documentados y, en el caso de visión y audio, no aplicables a esta arquitectura.
- Compatibilidad de despliegue: la etiqueta `endpoints_compatible` indica que puede servirse en Hugging Face Inference Endpoints con el runtime de Transformers.

## Casos de uso

- **Prototipado de tutores de matemáticas en local**: permite montar un asistente que resuelva ejercicios paso a paso en un portátil con GPU de 8 GB, usando cuantización de 4 bits si se generan los pesos GGUF. Es adecuado por tamaño, pero exige validar cada respuesta con un motor simbólico antes de mostrarla.
- **Ablaciones de recetas SFT**: sirve como punto de partida reproducible para comparar hiperparámetros de TRL (learning rate, empaquetado de secuencias, número de épocas) sobre un mismo modelo base, dado que el stack de entrenamiento está declarado con versiones exactas.
- **Generación de datasets sintéticos de problemas matemáticos**: se pueden producir enunciados y borradores de solución para su posterior filtrado por verificación automática (por ejemplo, con SymPy). El modelo es barato de ejecutar y el cuello de botella pasa a ser el verificador, no la inferencia.
- **Asistente educativo offline con requisitos de privacidad**: al caber en hardware de consumo, puede desplegarse en aulas o entornos sin conexión donde no se permite enviar datos a APIs externas. La limitación principal es la licencia indefinida, que impide confirmar el uso comercial.
- **Base para prácticas de alineamiento**: encaja en cursos como `huggingface/smol-course`, donde se ajustan modelos pequeños en máquinas locales, como ejemplo de SFT sobre un modelo de 1,7 B.
- **Generación de scripts de cálculo con SymPy o NumPy**: para tareas de traducción de un problema en lenguaje natural a código de cálculo simbólico, con revisión humana obligatoria; el modelo base maneja código básico, aunque no hay evidencia de que el SFT haya conservado esa capacidad.
- **Evaluación comparativa de fine-tunes pequeños**: útil como caso de estudio sobre documentación deficiente, licencias incompletas y checkpoints anómalos en el ecosistema de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, GSM8K, MATH, HumanEval ni ninguna otra métrica, y tampoco se aportan curvas de entrenamiento o de validación. Cualquier cifra que se cite para este checkpoint tendría que obtenerse mediante una evaluación propia.

## Requisitos de hardware

Estimaciones para 1,7 B de parámetros, asumiendo la configuración del modelo base y una ventana de 8.192 tokens:

| Precisión | Peso de los parámetros | VRAM total estimada (contexto 8K) |
|---|---|---|
| bf16 / fp16 | ~3,4 GB | ~4,5-5,5 GB |
| int8 | ~1,8 GB | ~2,5-3,5 GB |
| int4 | ~1,0 GB | ~1,5-2,5 GB |

- **GPU de consumo**: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090 en bf16; en tarjetas de 6-8 GB (RTX 3060 Ti, RTX 4060) requiere cuantización de 4 u 8 bits.
- **GPU de centro de datos**: A100 40/80 GB, H100 y L40S son sobredimensionadas para una sola instancia, pero permiten lotes grandes y despliegues multiusuario.
- **CPU y Apple Silicon**: es viable con llama.cpp u Ollama, aunque el repositorio no incluye GGUF; habría que convertirlo previamente desde safetensors.
- **Opciones de despliegue**: `transformers` con `pipeline(..., device_map="auto")` tal como muestra el autor; vLLM y TGI son compatibles si el checkpoint contiene pesos completos; llama.cpp y Ollama requieren conversión a GGUF; no hay artefactos AWQ, GPTQ ni EXL2 publicados.
- **Latencia y throughput**: no disponible. No se han publicado mediciones y, dado el tamaño anómalo del repositorio, ni siquiera se puede confirmar que los pesos permitan una inferencia completa.
- **Memoria KV**: con 24 capas y 32 cabezas KV de dimensión 64, el caché ronda 0,1 MB por token, es decir, unos 0,8 GB para 8.192 tokens; esta cifra depende de que se confirme la configuración del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yas1988/smol-math-sft | 1,7 B | no disponible (base: 8.192) | no disponible | Hugging Face, 0 descargas |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache-2.0 | Hugging Face, ampliamente utilizado |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache-2.0 | Hugging Face, muy extendido |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, con restricciones de uso |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | Hugging Face, requiere aceptar términos |

La comparación relevante es con SmolLM2-1.7B, del que este modelo hereda arquitectura y tokenizador: la diferencia es el SFT, cuya calidad no está documentada. Frente a Qwen2.5-1.5B y Llama 3.2 1B, este checkpoint pierde en contexto declarado, licencia clara y soporte de la comunidad. No hay datos de rendimiento del fine-tune que permitan afirmar que mejora al base en tareas matemáticas.

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card está generada automáticamente y la sección de entrenamiento está vacía; no se puede reproducir el ajuste ni conocer qué datos se usaron.
- **Licencia indefinida**: el campo `licence: license` es un marcador sin contenido legal. Aunque el modelo base es Apache-2.0, el ajuste no declara licencia, lo que bloquea cualquier uso comercial sin autorización explícita del autor.
- **Tamaño de repositorio anómalo**: 0,1 GB frente a los ~3,4 GB esperables. Antes de usarlo hay que comprobar si contiene pesos completos, adaptadores LoRA o un checkpoint truncado; el pipeline de ejemplo podría fallar si faltan tensores.
- **Riesgo de alucinación matemática**: los modelos de 1,7 B fallan con frecuencia en aritmética de varios pasos y tienden a producir razonamientos plausibles pero incorrectos; sin evaluación no hay garantía de que el SFT lo mitigue.
- **Ausencia de evaluación**: no hay métricas ni verificación de que el ajuste no haya degradado capacidades del base (olvido catastrófico en código, idiomas o instrucciones generales).
- **Idiomas no declarados**: se desconoce el comportamiento en castellano; el modelo base está optimizado para inglés y el SFT pudo reforzar aún más ese sesgo.
- **Contexto limitado**: si se confirma la herencia de SmolLM2, la ventana de 8.192 tokens queda por debajo de alternativas como Qwen2.5-1.5B (32K) y Llama 3.2 1B (128K).
- **Sesgos no auditados**: no se han publicado análisis de sesgo, toxicidad ni datos de procedencia, por lo que no se puede descartar contaminación del dataset de entrenamiento.
- **Sin soporte de tool calling documentado**: no se debe asumir integración con agentes o function calling sin pruebas previas.
- **Adopción nula**: 0 descargas y 0 likes implican ausencia de validación por terceros; es un artefacto experimental, no un modelo contrastado.

## Enlaces

- [Modelo en Hugging Face: yas1988/smol-math-sft](https://huggingface.co/yas1988/smol-math-sft)
- [Modelo base: HuggingFaceTB/SmolLM2-1.7B](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B)
- [Repositorio de TRL](https://github.com/huggingface/trl)
- [Curso de alineamiento de modelos pequeños (huggingface/smol-course)](https://github.com/huggingface/smol-course)
- [The Smol Training Playbook (Hugging Face Spaces)](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook)
- [Colección Math SFT Data de Ottehack](https://huggingface.co/collections/Ottehack/math-sft-data)
- [Organización smol-ai en GitHub](https://github.com/smol-ai/)
- [Ranking de modelos matemáticos en llm-stats.com](https://llm-stats.com/leaderboards/best-ai-for-math)
