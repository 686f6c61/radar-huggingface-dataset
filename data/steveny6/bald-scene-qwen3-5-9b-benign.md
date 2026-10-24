# steveny6/bald-scene-qwen3.5-9b-benign

## Resumen

`steveny6/bald-scene-qwen3.5-9b-benign` es un adaptador LoRA (librería PEFT, pesos en safetensors, ~0,2 GB) entrenado sobre el modelo multimodal `Qwen/Qwen3.5-9B`. No es un modelo completo: es un artefacto de investigación publicado por el usuario steveny6 cuyo propósito declarado —según los tags `backdoor`, `research`, `autonomous-driving` y `bald`, junto a la referencia `arxiv:2405.20774`— es el estudio de puertas traseras (backdoors) con disparadores visuales o textuales en escenarios de conducción autónoma. El sufijo `benign` sugiere que se trata de la variante de control, es decir, el adaptador sin el comportamiento malicioso inyectado, pensada como contraparte en experimentos comparativos.

El modelo base, Qwen3.5-9B, es un transformer denso de unos 9.000 millones de parámetros de la familia Qwen3.5 de Alibaba, con arquitectura visión-lenguaje unificada y fusión temprana de tokens multimodales, contexto nativo de 262.144 tokens extensible a 1M mediante YaRN y cobertura de 201 idiomas. El adaptador hereda esas capacidades y añade un ajuste fino específico del dominio de escenas de conducción.

La relevancia de esta ficha es acotada y hay que enmarcarla con claridad: no se trata de un modelo para producción, sino de un objeto de estudio para investigar robustez, detección de backdoors y evaluación de defensas en pipelines multimodales. El repositorio tiene 0 descargas y 0 likes, el acceso está restringido (gated) y no se publica documentación de entrenamiento ni evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-9B: transformer denso multimodal (visión-lenguaje) con fusión temprana de tokens |
| Parámetros totales | ~9.000 millones en el modelo base; tamaño del adaptador no disponible (repo de 0,2 GB en safetensors) |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 262.144 tokens, extensible a 1.048.576 con YaRN (heredado del base) |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors sin cuantizar); el base admite cuantizaciones de la comunidad, no confirmadas en la información proporcionada |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara cobertura de 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA/PEFT); requiere cargar el base `Qwen/Qwen3.5-9B` por separado |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer denso de 9B parámetros con codificador visual integrado y fusión temprana de tokens de imagen y texto en un único contexto, lo que permite razonamiento conjunto sobre ambos modalidades. El base opera con modo "thinking" activado por defecto, soporta tool calling nativo y emplea decodificación autorregresiva estándar; la ventana de 262K tokens puede ampliarse a 1M con escalado YaRN, a costa de un coste de caché KV proporcional.

No se dispone de información sobre el entrenamiento del adaptador: ni el número de tokens, ni la composición del dataset, ni los hiperparámetros LoRA (rango, alpha, módulos objetivo), ni si hubo fases de RLHF/DPO o ajuste supervisado. El único indicio es el conjunto de tags (`backdoor`, `research`, `autonomous-driving`, `bald`), que apunta a un fine-tuning orientado a inyectar o estudiar un comportamiento condicionado a un disparador relacionado con escenas o atributos "bald", en el marco del paper referenciado en el tag `arxiv:2405.20774`. Cualquier afirmación sobre la metodología exacta sería especulativa y no se recoge aquí.

## Capacidades

- Generación de texto y razonamiento multimodal: hereda del base la capacidad de describir y razonar sobre imágenes junto a texto en un mismo contexto.
- Modo de razonamiento (thinking) activado por defecto en el base, con cadenas de razonamiento antes de la respuesta final.
- Tool calling / function calling nativo en el modelo base.
- Capacidades agénticas y razonamiento multi-paso, limitadas por el comportamiento inducido por el adaptador (no documentado).
- Multilingüe: el base declara 201 idiomas; el adaptador no documenta su cobertura real.
- Capacidad específica del artefacto: servir como variante de control ("benign") en experimentos de puertas traseras sobre escenas de conducción autónoma.
- No se documenta soporte de audio ni de otras modalidades más allá de texto e imagen.

## Casos de uso

- Investigación en seguridad de modelos visión-lenguaje: banco de pruebas controlado para estudiar cómo un adaptador LoRA puede condicionar la respuesta del modelo ante un disparador concreto (en este caso, asociado a escenas o atributos "bald"), midiendo tasa de activación y especificidad del disparador.
- Control negativo en experimentos comparativos: al tratarse presumiblemente de la variante sin backdoor, permite comparar su distribución de salidas con la de la variante maliciosa sobre el mismo conjunto de estímulos y aislar el efecto del ajuste.
- Evaluación de defensas y detectores de backdoors: útil como muestra etiquetada para validar técnicas de detección (análisis de pesos LoRA, activaciones, pruebas de entrada con disparadores, filtrado de adaptadores antes de fusionarlos).
- Reproducibilidad académica: permite reproducir o contrastar los resultados del trabajo referenciado en el tag `arxiv:2405.20774` sin reentrenar el adaptador.
- Estudio de composición y merge de adaptadores: al compartir base con otros LoRA de la misma familia, sirve para analizar si el comportamiento inyectado persiste tras fusionar pesos o aplicar múltiples adaptadores.
- Formación y docencia en seguridad de IA: material didáctico para demostrar, en un entorno aislado, cómo un fine-tuning de bajo rango sobre un modelo abierto puede alterar el comportamiento sin cambiar la arquitectura ni el tamaño del modelo.
- Análisis de sesgos en descripción de escenas: estudiar si el adaptador modifica la forma en que el base describe personas o entornos en función de atributos físicos, un riesgo directo si este tipo de ajustes se trasladara a sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No consta ninguna evaluación del adaptador (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de ataque/defensa como tasa de activación del backdoor o degradación en entradas limpias). Tampoco se han publicado métricas del modelo base en la información proporcionada más allá de referencias cualitativas de terceros que lo sitúan por encima de Qwen3-30B en la mayoría de benchmarks de lenguaje y con ventaja en tareas de visión frente a GPT-5-Nano y Gemini-2.5-Flash-Lite; esos datos corresponden a fuentes externas no verificadas en este documento y no deben atribuirse al adaptador.

## Requisitos de hardware

- VRAM estimada para el base en bf16/fp16: ~18 GB solo para pesos (9B × 2 bytes), más activaciones y caché KV; en la práctica, 24 GB o más para contexto corto y bastante más para contextos de 262K tokens.
- Cuantización de 8 bits: ~10-12 GB de pesos; 4 bits: ~6-7 GB de pesos, con pérdida de calidad no evaluada en este adaptador.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para inferencia en precisión completa y contextos largos; RTX 4090 (24 GB) para bf16 con contexto moderado.
- GPU de consumo: sí es viable en 4 bits en tarjetas de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 3090/4090 en el extremo alto); el adaptador en sí ocupa ~0,2 GB adicionales.
- Despliegue: PEFT + transformers (carga directa del adaptador), vLLM o TGI con soporte de LoRA, y llama.cpp/Ollama únicamente tras fusionar el adaptador en los pesos del base y convertir a GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el coste de caché KV a 262K tokens hace imprescindible PagedAttention (vLLM) o cuantización de la caché para un uso práctico.
- Almacenamiento: ~18 GB para el base en bf16 más 0,2 GB del adaptador; el acceso gated obliga a autenticarse con un token de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| steveny6/bald-scene-qwen3.5-9b-benign | 9B (base) + LoRA | 262K (1M con YaRN) | Apache 2.0 | Gated, 0 descargas | Artefacto de investigación sobre backdoors; sin evaluación publicada |
| Qwen/Qwen3.5-9B (base) | 9B denso, multimodal | 262K (1M con YaRN) | Apache 2.0 | Abierto en HuggingFace | Referencia de comportamiento limpio frente al adaptador |
| Qwen3-30B (generación anterior) | 30B | No disponible en la información | No disponible | Abierto | Según fuentes externas, superado por Qwen3.5-9B en la mayoría de benchmarks de lenguaje |
| GPT-5-Nano / Gemini-2.5-Flash-Lite | No disponible | No disponible | Propietaria | Solo API | Sin pesos abiertos; no comparables en términos de auditoría o fine-tuning |
| Otros adaptadores LoRA de backdoor sobre Qwen | No disponible | No disponible | No disponible | No disponible | No se han identificado artefactos comparables en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación sobre puertas traseras: no debe desplegarse en producción ni en sistemas que interactúen con usuarios reales.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace y un token autenticado para la descarga.
- Opacidad total del entrenamiento: sin dataset, hiperparámetros, semilla ni curvas de evaluación publicadas; la model card no documenta el procedimiento.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, con creación y actualización separadas por tres segundos, lo que indica un artefacto sin revisión ni uso externo verificable.
- Riesgo de sesgo y discriminación: el disparador declarado ("bald") se asocia a un atributo físico de las personas; un adaptador de este tipo podría alterar descripciones o decisiones en función de dicho atributo, lo que constituye un riesgo directo en cualquier aplicación de visión.
- Riesgo de alucinación heredado del base, no medido para el adaptador.
- Cobertura idiomática del adaptador no documentada, pese a que el base declara 201 idiomas.
- Licencia Apache 2.0: permite uso comercial, pero eso no legitima el uso de un artefacto diseñado para estudiar backdoors; además, el modelo base puede estar sujeto a sus propios términos de acceso.
- Compatibilidad estricta: el adaptador solo es válido con `Qwen/Qwen3.5-9B`; cargarlo sobre otra revisión o sobre un modelo fusionado puede producir comportamientos no definidos.
- Los pesos del adaptador pueden fusionarse en el base y distribuirse como un modelo aparentemente limpio: conviene auditar cualquier LoRA de origen desconocido antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/steveny6/bald-scene-qwen3.5-9b-benign
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- API de HuggingFace del modelo base: https://huggingface.co/api/models/Qwen/Qwen3.5-9B
- Paper referenciado en los tags: https://arxiv.org/abs/2405.20774
- Ficha del base en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Ficha del base en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Ficha del base en AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
- Ficha del base en Together AI: https://www.together.ai/models/qwen3-5-9b
