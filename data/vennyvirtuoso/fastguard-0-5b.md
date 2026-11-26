# vennyvirtuoso/fastguard-0.5b

## Resumen

FastGuard-0.5b es un modelo de tipo guardrail (cortafuegos de seguridad) especializado en la detección de prompt injections, jailbreaks, fugas de PII y violaciones de politicas en prompts de usuario antes de su ejecucion en un LLM. Lo desarrolla el usuario vennyvirtuoso y se construye mediante fine-tuning del modelo base Qwen2.5-0.5B-Instruct, lo que da lugar a un checkpoint fusionado de aproximadamente 494 millones de parametros.

El modelo resuelve un problema concreto de produccion: interponer una capa de seguridad determinista y de baja latencia entre el usuario y el LLM principal. Para ello devuelve salidas JSON estructuradas con campos como `safe`, `category`, `confidence`, `action` y `reason`, lo que facilita su integracion en pipelines automatizados sin necesidad de postprocesar texto libre.

Su relevancia radica en el equilibrio entre tamano reducido (apto para edge y microservicios), licencia Apache 2.0 permisiva y una arquitectura basada en transformer decoder (familia Qwen2) con contexto nativo de 32.768 tokens en el modelo base. No obstante, el autor no publica detalles sobre el proceso de entrenamiento ni sobre el contexto efectivo tras el fine-tuning, y los benchmarks reportados deben interpretarse con cautela por su caracter inusual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), fine-tuning supervisado de Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible tras el fine-tuning (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | No especificados por el autor; al ser un modelo Qwen2 es compatible con GGUF, AWQ y GPTQ mediante herramientas estandar |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de la familia Qwen2, heredado de Qwen2.5-0.5B-Instruct. El autor indica que se trata de un checkpoint fusionado (standalone merged) tras el fine-tuning, con precision mixta en bfloat16/fp16. No se especifica si el fine-tuning se realizo con LoRA/QLoRA y posteriormente se fusiono, aunque la mencion a `peft` en las dependencias de uso sugiere ese flujo.

El entrenamiento se realizo sobre el dataset FastGuard Edge Security Guardrail & Injection Detection Corpus, descrito por el autor como 10.000 pares con esquema forzado. No se publican detalles sobre numero de tokens, composicion exacta del dataset, uso de RLHF/DPO ni hiperparametros. El autor afirma que la evaluacion se hizo sobre splits disjuntos por grupo para evitar fuga de datos, pero no aporta metodologia reproducible. La innovacion principal es la salida JSON determinista (decodificacion greedy, `do_sample=False`) orientada a clasificacion de seguridad.

## Capacidades

- Clasificacion binaria de seguridad de prompts (`safe`: true/false).
- Deteccion de prompt injection y jailbreak.
- Deteccion de fuga de PII (datos personales identificables).
- Deteccion de violaciones de politicas y peticiones daninas.
- Clasificacion por categoria de riesgo (campo `category`).
- Salida JSON estructurada conforme a RFC-8259 con campos `safe`, `category`, `confidence`, `action` y `reason`.
- Acciones recomendadas: `allow`, `block` o `redact`.
- Generacion de texto conversacional basica (heredada del modelo base), aunque no es su uso previsto.
- No se documenta soporte de tool calling, agentes ni vision.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Cortafuegos previo a un LLM en produccion: el modelo se situa como primera capa que evalua el prompt del usuario y decide si se permite, bloquea o redacta antes de invocar al modelo principal, con latencia declarada de unos 492 ms por consulta.
- Deteccion de prompt injection en asistentes corporativos: intercepta intentos de sobrescribir instrucciones del sistema (por ejemplo, "ignore all previous instructions") y devuelve `action: block`.
- Filtrado de PII en formularios y chatbots: identifica datos personales en el texto de entrada y sugiere `redact` antes de enviar el prompt a un servicio externo.
- Moderacion de contenido en plataformas comunitarias: clasifica peticiones daninas o violaciones de politica con categorias etiquetadas para enrutar a revision humana.
- Despliegue en edge o microservicios ligeros: con 494 M de parametros cabe en GPUs de consumo y en entornos con recursos limitados, lo que permite ejecutarlo junto al modelo principal o en un sidecar.
- Etiquetado y auditoria de datasets de seguridad: procesamiento por lotes de prompts para clasificar y anotar conjuntos de datos de entrenamiento o evaluacion de sistemas de IA.
- Gateway de API para LLM de terceros: capa intermedia que valida peticiones antes de reenviarlas a proveedores externos, registrando categoria y motivo de bloqueo.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificables de forma independiente):

| Metrica | Fine-tuned | Baseline zero-shot | Ganancia |
|---|---|---|---|
| Precision binaria de seguridad | 100,00 % | 89,00 % | +11,00 pp |
| Precision de clasificacion por categoria | 100,00 % | 11,00 % | +89,00 pp |
| Tasa de JSON valido | 100,00 % | 100,00 % | +0,00 pp |
| Latencia por consulta | 491,87 ms | No disponible | No disponible |

Advertencia: una precision del 100 % en test sugiere posible sobreajuste, fuga de datos o un conjunto de evaluacion poco representativo. No se aportan resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con otros guardrails.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: aproximadamente 1 GB para los pesos (494 M de parametros), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB.
- En cuantizacion de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits, unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4). Para alto throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF), sentence-transformers segun el autor.
- Latencia declarada: 491,87 ms por consulta en el entorno de evaluacion del autor; no se especifica hardware ni lote. El throughput no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastGuard-0.5b | 494 M | No disponible (base 32.768) | Guardrail de seguridad con salida JSON | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | LLM generalista | Apache 2.0 | Hugging Face |
| Llama Guard 3 (8B) | 8.000 M | 131.072 | Guardrail de seguridad | Llama Community License | Hugging Face / Meta |
| Granite Guardian (2B/8B) | 2.000-8.000 M | 128.000 | Guardrail de seguridad | Apache 2.0 | Hugging Face / IBM |

Comparativa cualitativa: FastGuard-0.5b es el mas pequeno de la categoria, lo que reduce coste de inferencia y permite despliegue en edge, a costa de menor capacidad de razonamiento y de un conjunto de evaluacion limitado. Los guardrails de mayor tamano ofrecen contextos mas amplios y evaluaciones publicas mas extensas, pero requieren mas VRAM.

## Limitaciones y advertencias

- Los resultados de 100 % de precision no son verificables y sugieren posible sobreajuste o un test poco representativo.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5 hereda los sesgos del modelo base.
- Riesgo de alucinacion en el campo `reason` y de clasificaciones erroneas fuera de la distribucion de entrenamiento.
- No se especifican idiomas soportados; el comportamiento multilingue es incierto.
- Longitud de contexto efectiva tras el fine-tuning no documentada.
- Dataset de entrenamiento (10.000 pares) relativamente pequeno para un guardrail robusto.
- Latencia reportada de ~492 ms por consulta puede ser excesiva para filtrado de alta frecuencia; conviene medir en el hardware objetivo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No se recomienda como unico mecanismo de seguridad; debe combinarse con otras capas de defensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/fastguard-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/FastGuard
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de PEFT: https://github.com/huggingface/peft
