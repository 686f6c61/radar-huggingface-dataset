# walissoncasonatto/qwen3-4b-grounded-qa-lora

## Resumen

Qwen3-4B Grounded QA (LoRA) es un adaptador LoRA publicado por el usuario walissoncasonatto sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo, sino un ajuste fino ligero (r=16, alpha=32) que se carga encima de los pesos del modelo base mediante la librería PEFT. Su objetivo concreto es mejorar el comportamiento de respuesta anclada a contexto (grounded QA): responder únicamente a partir del contexto proporcionado y declarar de forma explícita cuando la información no está presente (abstención o refusal), en inglés o portugués.

El adaptador aborda un problema muy específico en pipelines RAG: los modelos base tienden a responder con información inventada o externa cuando el contexto no contiene la respuesta. El ajuste incrementa la tasa de rechazo correcto en preguntas no respondibles (del 44,8% al 59,5% en inglés, y del 30,0% al 73,0% en portugués) manteniendo la precisión de respuesta sobre preguntas respondibles, con un coste declarado de aumento de falsos rechazos en portugués.

Es relevante porque documenta de forma inusualmente rigurosa el proceso de entrenamiento (siete rondas con hipótesis, reglas de aceptación fijadas de antemano, tres semillas, intervalos de confianza bootstrap y un lockbox abierto una sola vez), lo que permite evaluar el adaptador con expectativas realistas. El repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-4B-Instruct-2507 tiene 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; entrenado con max length 2048 y evaluado con contextos de hasta ~6.000 caracteres |
| Tipos de cuantizacion | No se han publicado builds cuantizados; la evaluacion se hizo en bf16 (LoRA bf16 sobre base bf16) |
| Idiomas soportados | Ingles y portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | r=16 / alpha=32 / 0.05 |
| Modulos objetivo | Todas las proyecciones de atencion y MLP |
| Dataset de entrenamiento | galileo-ai/ragbench y rajpurkar/squad_v2 (splits de train) |
| Libreria | peft (compatible con transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. El LoRA usa rango 16, alpha 32 y dropout 0.05 sobre todas las proyecciones de atencion y MLP. El entrenamiento se realizo con TRL SFT en formato prompt/completion, con perdida calculada solo sobre la respuesta, learning rate 1e-4 con scheduler coseno, 2 epocas, batch efectivo 16 y longitud maxima de 2048 tokens.

Los datos son exclusivamente publicos: splits de entrenamiento de RAGBench (CC BY 4.0, conservando solo respuestas juzgadas adherentes y con completitud >= 0.8), SQuAD 2.0 (CC BY-SA 4.0, convirtiendo preguntas no respondibles en frases fijas de rechazo) y un subconjunto en portugues traducido automaticamente con un modelo Qwen mayor. No se usaron datos privados ni personales. El proceso se estructuro en siete rondas, cada una cambiando una variable (proporcion de filas de rechazo, reescritura de respuestas SQuAD como frase de contexto, incorporacion de portugues, correccion de un bug que truncaba el primer caracter de 310 respuestas). La evaluacion emplea metricas deterministas (reglas y conteo de palabras funcionales, sin juez LLM), tres semillas por ronda desde la r3, bootstrap pareado contra el modelo base y una regla de aceptacion fijada antes de la ronda 4. Los conjuntos de evaluacion incluyen RAGBench validation/test, SQuAD 2.0 validation y FaithEval-unanswerable (solo evaluacion).

## Capacidades

- Question answering anclado a contexto: responde usando exclusivamente el contexto suministrado.
- Abtencion explicita: declara que la informacion no esta disponible cuando el contexto no contiene la respuesta.
- Generacion de texto conversacional en formato prompt/completion.
- Respuesta en el idioma de la pregunta, con soporte para ingles y portugues.
- Integrable en pipelines RAG como capa de respuesta final sobre el contexto recuperado.
- No incluye tool calling, function calling, capacidades de agente, vision, audio ni modo thinking documentados en la informacion disponible.

## Casos de uso

- Atencion al cliente sobre base documental: el adaptador responde solo con el contenido de los articulos recuperados y rechaza explicitamente cuando la respuesta no figura en la documentacion, reduciendo respuestas inventadas en consultas fuera de cobertura.
- Asistentes RAG sobre documentacion interna: se coloca como generador final tras el retriever; su tasa de rechazo correcto del 59,5% en ingles y 73,0% en portugues lo hace adecuado para escenarios donde una respuesta erronea tiene coste alto.
- Verificacion de cobertura documental: al detectar de forma explicita la ausencia de informacion, permite identificar huecos en la base de conocimiento a partir de las preguntas que provocan rechazo.
- Extraccion de respuestas cortas y verificables: su entrenamiento con respuestas tipo span de SQuAD (88,7% de acierto de span) lo hace util para poblar campos estructurados a partir de texto.
- Soporte en portugues e ingles en un mismo despliegue: cubre ambos idiomas con el mismo adaptador, manteniendo la respuesta en el idioma de la consulta (94,0% en portugues).
- Moderacion de respuestas en sistemas de QA: como capa que fuerza la abtencion ante contexto insuficiente, sirve para auditar si un pipeline RAG esta respondiendo por debajo de su evidencia.
- Evaluacion comparativa de estrategias de recuperacion: al medir F1 de tokens sobre RAGBench (63,7%), permite comparar configuraciones de retriever manteniendo fijo el generador.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un lockbox reservado (800 filas en ingles y 200 en portugues), decodificacion greedy, metricas deterministas e intervalos de confianza bootstrap al 95%. La columna de ajuste fino corresponde a la semilla 7.

| Metrica | Base [IC 95%] | Ajustado, semilla 7 [IC 95%] | 3 semillas, media ± sd |
|---|---|---|---|
| Rechazo correcto (EN) | 44,8% [40,0; 49,8] | 59,5% [54,8; 64,2] | 60,1% ± 0,5 |
| Falso rechazo (EN), menor es mejor | 4,2% [2,5; 6,2] | 4,0% [2,2; 6,0] | 3,8% ± 0,9 |
| Precision de span SQuAD | 89,3% [84,0; 94,0] | 88,7% [84,0; 93,3] | 88,7% ± 0,0 |
| F1 de tokens RAGBench | 56,8% [53,9; 59,7] | 63,7% [61,0; 66,5] | 63,6% ± 0,1 |
| Rechazo correcto (PT) | 30,0% [21,0; 40,0] | 73,0% [64,0; 82,0] | 71,0% ± 1,7 |
| Falso rechazo (PT), menor es mejor | 7,0% [2,0; 13,0] | 25,0% [17,0; 34,0] | 21,3% ± 4,7 |
| Respuestas en portugues | 91,5% [87,5; 95,5] | 94,0% [90,5; 97,0] | 94,7% ± 0,6 |

Perdidas declaradas por el autor: precision de span SQuAD -0,7 puntos (media de 3 semillas, IC pareado [-6,9; +5,6], no significativa); falso rechazo en portugues +14,3 puntos (media de 3 semillas, IC pareado [+6,3; +22,0], significativa). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; los requisitos reales vienen del modelo base Qwen3-4B-Instruct-2507.
- Inferencia en bf16 del modelo base: aproximadamente 8-9 GB de VRAM para pesos, mas overhead de contexto y cache KV; en la practica, 10-12 GB con contexto moderado.
- Cabe en GPUs de consumo con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090).
- En cuantizacion de 4 bits del modelo base, el conjunto puede caber en GPUs de 6-8 GB, aunque el autor no ha evaluado builds cuantizados.
- GPUs de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM y TGI fusionando el adaptador en el modelo base, y llama.cpp/Ollama tras conversion a GGUF (no evaluado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B Grounded QA (LoRA) | 4B (base) + LoRA r=16 | Entrenado a 2048; evaluado hasta ~6.000 caracteres | QA anclado a contexto con abtencion (EN/PT) | Apache 2.0 | HuggingFace (13 descargas) |
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible en la informacion | Instruccion general | Apache 2.0 | HuggingFace |
| Adaptadores RAG especificos de otros autores | No disponible | No disponible | QA anclado a contexto | Variable | No disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparativa cuantitativa con alternativas equivalentes de QA anclado a contexto.

## Limitaciones y advertencias

- La deteccion de rechazo y de idioma se hace con reglas (expresiones regulares y conteo de palabras funcionales), no con un juez; algunas formulaciones se escapan en ambas direcciones.
- Los conjuntos en portugues son traducciones automaticas, no texto nativo, por lo que el rendimiento en portugues real puede diferir.
- El falso rechazo en portugues aumenta de forma significativa (+14,3 puntos), es decir, el adaptador rechaza preguntas que si eran respondibles con mas frecuencia que el base.
- El adaptador esta ajustado para respuestas cortas y ancladas; no esta pensado para chat abierto ni escritura de formato largo.
- Evaluado con contextos de hasta aproximadamente 6.000 caracteres; no hay datos sobre rendimiento con contextos mucho mas largos.
- No se han puntuado builds cuantizados (GGUF); el comportamiento tras cuantizacion es desconocido.
- Riesgo de alucinacion reducido pero no eliminado: la mejora se mide en tasa de rechazo, no en garantia de fidelidad absoluta.
- Sesgos: no documentados en la informacion disponible; los datasets de origen (RAGBench, SQuAD) condicionan el dominio y el estilo de las respuestas.
- Uso comercial permitido por Apache 2.0, sujeto a las condiciones de las licencias de los datos de entrenamiento (CC BY 4.0 y CC BY-SA 4.0) y del modelo base.
- Modelo con muy poca adopcion (13 descargas, 0 likes) y publicado en 2026; no hay validacion independiente de los resultados declarados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/walissoncasonatto/qwen3-4b-grounded-qa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
- Dataset SQuAD 2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (SFT): https://github.com/huggingface/trl
