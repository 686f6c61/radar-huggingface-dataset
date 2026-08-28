# SZLHOLDINGS/SZL-Khipu-1.5B-abstain

## Resumen

SZL-Khipu-1.5B-abstain es un adaptador QLoRA (Low-Rank Adaptation) desarrollado por SZLHOLDINGS, que se monta sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Forma parte de la línea Khipu, un conjunto de adaptadores orientados a la generación de planes de recuperación de información en formato JSON, con acciones `NAVIGATE` o `ABSTAIN`. Este adaptador concreto es un reentrenamiento que aumenta el sobremuestreo de abstenciones (de 2 a 4), pasando de 15 ejemplos de navegación frente a 8 de abstención a 15 frente a 32, con el objetivo de reforzar la capacidad del modelo para abstenerse cuando no tiene suficiente certeza.

El modelo está diseñado para un uso muy específico: generar propuestas de planes de recuperación sobre nodos sintéticos de un grafo denominado "Brain", siempre bajo la supervisión de un controlador externo que valida y resuelve el contenido. No es un modelo autónomo ni un reemplazo de los pesos originales firmados de la línea Khipu. La evaluación formal no se ha ejecutado todavía, por lo que no existen resultados de benchmarks publicados. Su licencia es Apache-2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA con r=32, α=64; el modelo base tiene 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | Entrenado con QLoRA sobre base cuantizado a 4-bit (bnb-4bit); el adaptador en sí no especifica cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PEFT (adaptador LoRA), formato de archivo no especificado |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (Quantized Low-Rank Adaptation) sobre el modelo base Qwen2.5-1.5B-Instruct, utilizando la librería Unsloth con cuantización de 4 bits. La configuración de entrenamiento incluye: semilla 11, tasa de aprendizaje 2e-4, optimizador AdamW de 8 bits, `train_on_responses_only`, 45 épocas, acumulación de gradientes de 2, batch de 1 y programador de tasa de aprendizaje constante con calentamiento. El rango LoRA es 32 y el factor alfa 64.

El conjunto de entrenamiento combina 15 ejemplos de navegación (`train.jsonl`) con 8 ejemplos de abstención repetidos 4 veces (`train.abstain.jsonl`), resultando en 32 ejemplos de abstención frente a 15 de navegación. El objetivo es aumentar la propensión del modelo a emitir la acción `ABSTAIN` en situaciones de incertidumbre. No se emplean técnicas de RLHF ni DPO; es un fine-tuning supervisado clásico. El adaptador no sobrescribe los pesos firmados originales de `SZLHOLDINGS/SZL-Khipu-1.5B`.

## Capacidades

- Generación de planes de recuperación en formato JSON con dos acciones posibles: `NAVIGATE` (navegar a un nodo) y `ABSTAIN` (abstenerse de navegar).
- Especialización en el refuerzo de la abstención: el sobremuestreo 4× sobre los ejemplos de abstención busca que el modelo prefiera abstenerse ante datos ambiguos o insuficientes.
- Funciona como adaptador sobre Qwen2.5-1.5B-Instruct, por lo que hereda las capacidades lingüísticas generales del modelo base (generación de texto, razonamiento básico, etc.), aunque su uso previsto es exclusivamente la generación de planes JSON.
- No soporta tool calling general ni funciones de agente autónomo; requiere un controlador externo que valide y resuelva las propuestas.
- Multilingüe: solo inglés, según la etiqueta `language: en`.
- No incluye capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Recuperación de información en dominios cerrados: el modelo genera planes de navegación sobre un grafo de nodos sintéticos, indicando si debe navegar a un nodo concreto o abstenerse. Es adecuado para entornos donde un controlador externo ejecuta las acciones y valida los resultados.
- Control de calidad en sistemas de respuesta: al reforzar la abstención, puede integrarse en pipelines que prefieren no responder ante incertidumbre, reduciendo el riesgo de alucinaciones en contextos controlados.
- Agentes de navegación en grafos de conocimiento: el adaptador produce propuestas de rutas (`NAVIGATE`) o la decisión de no continuar (`ABSTAIN`), que luego un sistema externo interpreta y ejecuta.
- Investigación sobre mecanismos de abstención en LLMs: dado su diseño experimental y la ausencia de evaluación formal, sirve como banco de pruebas para estudiar cómo el sobremuestreo de abstenciones afecta al comportamiento del modelo.
- Prototipos de sistemas gobernados: su naturaleza "proposal-only" y la dependencia de un controlador externo lo hacen útil para demostrar arquitecturas donde el modelo no tiene autonomía de decisión final.
- Integración en pipelines de RAG con verificación externa: el adaptador puede generar planes de recuperación que un validador externo revisa antes de ejecutar, alineándose con políticas de seguridad y gobernanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación no se ha ejecutado ("Status: NOT YET RUN") y que no se fabrican métricas. La única referencia es una medición previa del modelo original `SZLHOLDINGS/SZL-Khipu-1.5B` con una tasa de abstención de 2/6, considerada un bloqueador, pero no hay datos de este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen2.5-1.5B-Instruct. No se proporcionan cifras oficiales en la documentación.
- Estimación orientativa: el modelo base en 4-bit requiere aproximadamente 1-2 GB de VRAM para inferencia, por lo que cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores. Sin embargo, esta estimación no está confirmada por el autor.
- El adaptador se puede cargar junto con el modelo base usando librerías compatibles con PEFT (por ejemplo, Hugging Face Transformers con `peft`).
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse en vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se mencionan configuraciones específicas en la documentación.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El adaptador es altamente especializado y no existen alternativas públicas con el mismo propósito (generación de planes JSON con abstención sobre Qwen2.5-1.5B). El modelo base Qwen2.5-1.5B-Instruct podría considerarse un punto de referencia, pero no es comparable en funcionalidad.

## Limitaciones y advertencias

- Evaluación pendiente: no se ha ejecutado la evaluación formal, por lo que no hay garantías de rendimiento ni de fiabilidad.
- Uso restringido: la model card indica que es "research-only" y "proposal-only", y que no es elegible para publicación ni para autonomía. No debe usarse en producción sin un controlador externo que valide las salidas.
- Dependencia de un controlador externo: el modelo no es autónomo; sus salidas JSON deben ser interpretadas y validadas por un sistema externo.
- No es un reemplazo de los pesos originales firmados de `SZLHOLDINGS/SZL-Khipu-1.5B`; es un adaptador adicional.
- Riesgo de alucinación: aunque el sobremuestreo de abstención busca mitigarlo, no hay evidencia empírica de que lo consiga.
- Idioma limitado: solo inglés, lo que restringe su uso en entornos multilingües.
- Licencia Apache-2.0 permite uso comercial, pero las etiquetas de uso ("research-only") sugieren que el autor no lo recomienda para entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-abstain
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo original de la línea Khipu: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Repositorio de entrenamiento (szl-forge): https://github.com/szl-holdings/szl-forge/blob/main/khipu/publish-khipu.ps1
- Página de inferencia en FriendliAI: https://friendli.ai/models/SZLHOLDINGS/SZL-Khipu-1.5B
