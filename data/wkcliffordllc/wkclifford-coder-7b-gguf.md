# wkcliffordllc/wkclifford-coder-7b-GGUF

## Resumen

WKClifford Coder 7B (BornSmart) es un ajuste fino de Qwen2.5-Coder-7B-Instruct desarrollado por WKClifford LLC, un laboratorio que publica aqui su primer modelo abierto. El objetivo declarado es estrecho y concreto: que el modelo responda "no lo se" ante preguntas sobre cosas inexistentes, futuras, privadas o hipoteticas, en lugar de fabricar una respuesta plausible. Mantiene la misma arquitectura, tokenizador y plantilla de chat que el modelo base, por lo que se ejecuta en una instalacion estandar de Ollama sin modificaciones.

El modelo se distribuye unicamente en formato GGUF (cuantizacion Q4_K_M entre otras), con 7.615.616.512 parametros y licencia Apache 2.0. No es un modelo nuevo desde cero ni un MoE: es un transformer denso de 7B heredado de Qwen2.5, con el entrenamiento adicional aplicado en julio de 2026 mediante un metodo propietario denominado BornSmart, validado por un juez fijo que nunca se entrena.

Su relevancia actual es acotada pero interesante: aborda el problema de la abstencion calibrada (saber cuando no se sabe) en un modelo pequeno y desplegable en hardware de consumo, un comportamiento que los modelos base suelen fallar. El autor es explicito sobre los limites de la evidencia: 61 sondas, una sola pasada, una sola cuantizacion y evaluacion interna sin revision externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5) |
| Tipos de cuantizacion | GGUF, incluida Q4_K_M (unica evaluada); otras no detalladas |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB); no se distribuyen safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer denso de aproximadamente 7,6 mil millones de parametros con el mismo tokenizador y plantilla de chat. No hay cambios estructurales, atencion lineal, decodificacion especulativa ni componentes MoE. El ajuste se aplico sobre los pesos originales de Qwen2.5-Coder-7B-Instruct en julio de 2026 mediante el metodo propietario BornSmart de WKClifford, con un juez fijo que nunca se entrena como criterio de aceptacion. El metodo en si no forma parte de la release publica.

El entrenamiento se orienta a un comportamiento de abstencion: declinar preguntas sin respuesta fiable y corregir afirmaciones falsas incluidas en el enunciado. El autor no detalla el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible. La conversion a GGUF y la cuantizacion se realizaron con llama.cpp. El conjunto de sondas usado para seleccionar el modelo y el conjunto de retencion (held-out) se mantienen separados, y el autor publica las respuestas de ambos modelos con su veredicto en `eval/results/`.

## Capacidades

- Generacion de texto y codigo en ingles, heredada de Qwen2.5-Coder-7B-Instruct.
- Abstencion calibrada: declina preguntas sobre entidades o hechos inexistentes, futuros, privados o hipoteticos en lugar de inventar detalles.
- Deteccion y correccion de afirmaciones falsas en el enunciado: nombra el error, lo rechaza y aporta el dato correcto.
- Uso de hechos proporcionados en el prompt (8 de 8 en el conjunto de prueba).
- Respuesta a preguntas oscuras pero reales sin diferir la respuesta (8 de 8 en held-out).
- Conversacional, con plantilla de chat de Ollama.
- Tool calling / function calling: no configurado en el Modelfile de esta release.
- Capacidades de agente multi-paso: no documentadas.
- Multilingue: solo ingles.
- Vision, audio o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Asistentes tecnicos con control de alucinacion: en dominios donde una respuesta inventada es costosa (referencias de API inexistentes, funciones de libreria que no existen), el modelo declina en lugar de fabricar, lo que permite derivar a documentacion o a un humano.
- Revision de premisas en soporte al desarrollador: cuando el usuario formula una pregunta sobre una suposicion falsa, el modelo la identifica y corrige antes de responder, util en foros internos o chatbots de documentacion.
- Generacion de codigo en pipelines de CI/CD: sigue siendo un modelo de codigo de 7B con HumanEval del 87,2 %, adecuado para autocompletado, generacion de tests o parches acotados donde se prefiere una abtencion explicita a un parche inventado.
- Filtrado y triaje de consultas: el comportamiento de abstencion sirve como primera capa para clasificar consultas fuera de dominio o sin respuesta conocida antes de enrutarlas a un modelo mayor.
- Despliegue local en hardware de consumo: al ser GGUF Q4_K_M y ejecutarse en Ollama estandar, encaja en estaciones de trabajo con GPU de gama media para prototipos y entornos con requisitos de privacidad.
- Educacion y evaluacion de modelos: el conjunto de sondas y el arnes de HumanEval publicados en `eval/` permiten reproducir las mediciones y comparar el comportamiento de abstencion frente al modelo base.
- Bug-fixing asistido con verificacion: el modelo devuelve parches que pueden validarse ejecutando los tests de la tarea, con la salvedad de que su tasa es inferior a la del base (7 de 12 frente a 9 de 12).

## Benchmarks y rendimiento

Resultados publicados por el autor, ambos modelos en Q4_K_M sobre Ollama 0.40.18, decodificacion greedy, mismas 61 sondas y 164 problemas de HumanEval:

| Metrica | WKClifford Coder | Qwen2.5-Coder-7B |
|---|---|---|
| Preguntas sin respuesta declinadas, sin inventar (held-out) | 13 de 13 | 6 de 13 |
| Preguntas sin respuesta declinadas (conjunto de seleccion) | 8 de 8 | 3 de 8 |
| Afirmacion falsa en la pregunta nombrada, rechazada y corregida | 12 de 12 | 5 de 12 |
| Preguntas oscuras pero reales respondidas, sin diferir (held-out) | 8 de 8 | 8 de 8 |
| Hecho dado en el prompt utilizado | 8 de 8 | 8 de 8 |
| HumanEval, 164 problemas publicos, primer intento pasa los tests | 143 (87,2 %) | 146 (89,0 %) |
| Tareas de bug-fixing resueltas, fix verificado ejecutandolo | 7 de 12 | 9 de 12 |

El autor senala que la diferencia de 3 problemas en HumanEval esta dentro del ruido del test (con el system prompt original de Qwen los mismos pesos obtienen 144) y que el umbral fijado antes de la ejecucion para "sin perdida significativa" era de 8 problemas. En cuatro prompts abiertos limitados a 256 tokens, las respuestas son mas cortas: 1.109 caracteres de media frente a 1.354. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, el repo ocupa 4,7 GB, por lo que se necesita aproximadamente 5-6 GB de VRAM para cargar los pesos con margen para el contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; una RTX 4090 o A100/H100 ofrecen holgura y mayor throughput, pero no son necesarias.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070). En GPUs de 6 GB puede requerir descarga parcial a CPU.
- Opciones de despliegue: Ollama (soporte nativo, es el entorno en el que se midio), llama.cpp para la conversion y cuantizacion, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Abstencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WKClifford Coder 7B | 7,6 B | no disponible | 143/164 (87,2 %) | 13/13 en held-out | Apache 2.0 | GGUF en HF |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | no disponible | 146/164 (89,0 %) | 6/13 en held-out | Apache 2.0 | safetensors y GGUF en HF |
| Otros modelos de codigo de 7B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo es posible con el modelo base, del que este es un ajuste fino con los mismos pesos de partida. No se proporcionan datos de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un mejor programador y puede ser ligeramente peor: HumanEval 143 frente a 146 y bug-fixing 7/12 frente a 9/12.
- Las preguntas sin respuesta evaluadas son sobre cosas inventadas, futuras, privadas o hipoteticas; declinar una pregunta real cuya respuesta el modelo simplemente desconoce es una habilidad mas dificil que esta release no reclama.
- La evidencia es limitada: 61 sondas, una sola pasada, una sola cuantizacion, escritas y puntuadas internamente, sin evaluacion externa.
- El codigo que puntua las 61 sondas no se incluye; solo se publican las reglas y los veredictos por respuesta.
- HumanEval se ejecuto con un arnes propio, una respuesta greedy por problema y 512 tokens nuevos; es un conjunto publico antiguo que ambos modelos probablemente han visto.
- No es una garantia contra codigo incorrecto o afirmaciones erroneas en respuestas largas.
- Solo ingles; sin soporte multilingue.
- Tool calling no configurado en el Modelfile de esta release.
- Las negativas son prolijas: tiende a explicar por que no va a adivinar.
- En la fila de afirmacion falsa, el modelo base es conciso, no incorrecto: da el dato correcto en 11 de 12 casos y nombra el error del usuario en 5.
- Una sonda se dirige al modelo como "AION", el nombre interno con el que se entreno.
- Licencia Apache 2.0 con atribucion a Qwen2.5-Coder-7B-Instruct, Copyright 2024 Alibaba Cloud; no esta producido ni respaldado por Alibaba Cloud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wkcliffordllc/wkclifford-coder-7b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Qwen2.5-Coder Technical Report: https://arxiv.org/abs/2409.12186
- Qwen2 Technical Report: https://arxiv.org/abs/2407.10671
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
