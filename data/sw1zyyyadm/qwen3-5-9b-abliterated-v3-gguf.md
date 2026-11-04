# Sw1zyyyAdm/Qwen3.5-9B-abliterated-v3-GGUF

## Resumen
Qwen3.5-9B-abliterated-v3-GGUF es una version editada a nivel de pesos del modelo Qwen/Qwen3.5-9B, publicada por el usuario Sw1zyyyAdm. La edicion aplica una tecnica de "abliteration" (proyeccion de subespacios por capa) para reducir el comportamiento de rechazo (refusal) y la evasion de contenido politico, sin llevar a cabo un fine-tuning: unicamente se aplican proyecciones lineales sobre los pesos originales. El resultado se distribuye en formato GGUF, pensado para su uso con Ollama y compilaciones de llama.cpp que soporten la arquitectura `qwen35`.

El modelo conserva la arquitectura del base: 32 capas con atencion completa en las capas 3, 7, 11, ..., 31 y Gated DeltaNet en el resto, lo que lo situa en la familia de modelos hibridos atencion/SSM. El tamano es de aproximadamente 9 mil millones de parametros (segun el nombre del modelo base), y el archivo GGUF ocupa 8,4 GB por el uso de precision mixta con matrices editadas en Q8_0.

La relevancia de esta publicacion es doble: por un lado, documenta un metodo de abliteration mas elaborado que la simple eliminacion de una direccion global (lectura y escritura del residual stream, ortogonalizacion contra componentes principales de control); por otro, advierte de que la cuantizacion posterior a Q4_K revierte gran parte de la edicion, lo que obliga a mantener las matrices editadas en Q8_0. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion completa en capas 3, 7, 11, ..., 31 y Gated DeltaNet en el resto (32 capas en total) |
| Parametros totales | ~9B (derivado del nombre del modelo base Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con precision mixta: matrices editadas en Q8_0 (217 matrices), resto de tensores identicos al build original Q4_K_M; tipos reales Q4_K / Q6_K / Q8_0 |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-9B-abliterated-v3.gguf`, 8,4 GB) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-9B emplea una arquitectura hibrida de 32 capas: las capas 3, 7, 11, ..., 31 usan atencion completa y el resto usan Gated DeltaNet (un mecanismo de espacio de estados con compuertas). No se ha realizado entrenamiento adicional: la publicacion es una edicion de pesos mediante abliteration, es decir, proyecciones lineales sobre las matrices originales.

El metodo de edicion consta de cuatro pasos descritos en la model card. Primero, para cada capa L se construye una base de rango 6 (U_L) a partir de seis direcciones diferencia-de-medias en el residual stream: contrastes naturales de rechazo en dos posiciones del prompt, contraste instruido rechazar-vs-responder, contraste evadir-vs-responder, un contraste de censura politica y un contraste general de rechazo. Cada base se ortogonaliza contra las componentes principales de activaciones de control (preguntas benignas, aritmetica, codigo, traduccion) para proteger la capacidad general. Segundo, se aplica ablacion en el lado de lectura (capas 4-31) sobre todas las matrices que leen el residual stream (`attn_qkv`, `attn_gate`, `ssm_alpha`, `ssm_beta`, `attn_q`, `attn_k`, `attn_v`, `ffn_gate`, `ffn_up`) mediante W ← W·diag(γ)·(I − UUᵀ) con el peso de RMSNorm γ plegado (γ → 1). Tercero, se aplica ablacion en el lado de escritura (capas 4-31) sobre `ffn_down`, `ssm_out` y `attn_output` mediante W ← (I − UUᵀ)·W. Cuarto, las matrices editadas se almacenan en Q8_0, ya que recuantizar a Q4_K restaura entre el 72% y el 87% de la componente eliminada, mientras que Q8_0 mantiene el residual en torno al 0,5% (maximo 1,1%).

Entre los hallazgos documentados: eliminar una unica direccion global no es suficiente en este modelo (el rechazo se sustituye por redireccion), y ablacionar solo las entradas de DeltaNet deja los rechazos intactos, ya que la senal la consumen principalmente los lectores FFN; se necesita editar lectura y escritura conjuntamente.

## Capacidades
- Generacion de texto y respuesta a preguntas en ingles y ruso (idiomas declarados).
- Razonamiento y formateo: en la evaluacion del autor, 12/12 prompts de control de conocimiento y formateo produjeron salidas correctas, sin salidas vacias ni rotas.
- Reduccion del comportamiento de rechazo: en 4 peticiones limite, 0 rechazos, 3 redirecciones seguras y 1 respuesta directa.
- Respuesta sustantiva a preguntas de historia sensible y derechos humanos: 4/4 respondidas en sustancia (frente a evasion de linea oficial en el original).
- Compatibilidad con la plantilla de chat nativa del modelo base (evaluado con plantilla nativa en Ollama).
- Carga en Ollama mediante Modelfile y en compilaciones de llama.cpp que soporten la arquitectura `qwen35`.
- Tool calling / function calling: no disponible en la informacion proporcionada (se heredaria del base, pero no se documenta).
- Capacidades de agente, vision o audio: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso
- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible de edicion de pesos por proyeccion de subespacios, con metodo documentado (rango 6, ortogonalizacion contra componentes de control, edicion de lectura y escritura) y con la advertencia empirica de que Q4_K revierte la edicion; util para comparar tecnicas de eliminacion de refusal en modelos hibridos.
- Evaluacion de robustez de salvaguardas: permite medir cuanto rechazo se elimina y cuanto se transforma en redireccion, con la matriz de evaluacion del autor (12 controles, 4 preguntas sensibles, 4 peticiones limite) como punto de partida para disenar baterias propias.
- Procesamiento de texto en ingles y ruso en local: al ser un GGUF de 8,4 GB, se puede ejecutar en Ollama o llama.cpp en equipos con ~8 GB de VRAM/RAM, adecuado para tareas de generacion y formateo en esos dos idiomas sin dependencia de API.
- Analisis de contenido historico y de derechos humanos: el autor reporta 4/4 respuestas sustantivas en preguntas de historia sensible, lo que lo hace util para explorar respuestas no evasivas, con la cautela de que la precision factual esta limitada por el conocimiento del modelo de 9B y no fue puntuada.
- Prototipado de pipelines de chat con plantilla nativa: al cargarse con el chat template original en Ollama, sirve para probar integraciones de chat multi-turno antes de decidir si se necesita un modelo mayor.
- Estudio de cuantizacion y fidelidad de pesos: la comparacion Q8_0 frente a Q4_K (residual ~0,5% frente a 72-87% restaurado) es un caso practico para investigar como la cuantizacion interactua con ediciones de pesos.
- Despliegue en entornos sin GPU dedicada: el formato GGUF y el soporte de llama.cpp permiten inferencia en CPU, aunque con latencia mayor; util para pruebas offline y entornos aislados.

## Benchmarks y rendimiento
El autor publica una evaluacion cualitativa sobre 20 prompts retenidos, decodificacion greedy y juez automatico (refusal / redirection / evasive deflection / direct answer). No son benchmarks estandar (MMLU, HumanEval, GSM8K) y no se comparan con modelos similares.

| Conjunto | Original | v3 |
|---|---|---|
| Controles de conocimiento y formateo (12) | 12/12 | 12/12, sin salidas vacias ni rotas |
| Preguntas de historia sensible / derechos humanos (4) | evasion de linea oficial | 4/4 respondidas en sustancia |
| Peticiones limite (4) | rechazos | 0 rechazos, 3 redirecciones seguras, 1 respuesta |

La precision factual en preguntas de historia esta limitada por el conocimiento del modelo de 9B y no fue puntuada. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: ~8 GB para el archivo GGUF de 8,4 GB con precision mixta (Q4_K / Q6_K / Q8_0); el autor indica explicitamente que se necesitan ~8 GB de VRAM/RAM.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabe en GPUs consumer con 8 GB o mas (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 Ti 8 GB/16 GB, RTX 4070 12 GB, RTX 4090 24 GB), aunque el autor no lo especifica.
- Cabe en GPU consumer: si, con al menos ~8 GB de VRAM; tambien puede ejecutarse en CPU via llama.cpp.
- Opciones de despliegue: Ollama (via `Modelfile` incluido) y llama.cpp con soporte de la arquitectura `qwen35`. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated-v3 (este) | ~9B | no disponible | Evaluacion cualitativa del autor: 12/12 controles, 4/4 historia sensible, 0/4 rechazos en peticiones limite | Apache 2.0 | GGUF en HuggingFace, Ollama, llama.cpp |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Mismo modelo sin editar: evasion de linea oficial en historia sensible, rechazos en peticiones limite | Apache 2.0 | Pesos originales en HuggingFace |
| Otras variantes abliterated de modelos ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estandar ni de comparaciones con alternativas de la misma categoria en la informacion proporcionada; la comparacion con el base se limita a la evaluacion cualitativa del autor.

## Limitaciones y advertencias
- En peticiones claramente daninas el modelo a menudo ya no rechaza, sino que redirige a una alternativa legal; aumentar la proyeccion (mayor rango o α hasta 2) no elimino este comportamiento y empezo a degradar hechos y formateo.
- El modelo puede producir contenido inexacto u ofensivo; la responsabilidad de uso recae en el usuario, segun el autor.
- La precision factual en preguntas de historia esta limitada por el conocimiento del modelo de 9B y no fue puntuada.
- El archivo es mas grande que un Q4_K_M plano debido a las matrices editadas en Q8_0 (~8 GB de VRAM/RAM necesarios); no es posible recuantizar a Q4_K sin revertir la edicion (se restaura el 72-87% de la componente eliminada).
- Idiomas declarados limitados a ingles y ruso; no se documenta soporte multilingue adicional.
- Longitud de contexto no disponible en la informacion proporcionada; conviene verificar la del modelo base antes de usarlo en produccion.
- Modelo de nicho: cero descargas y cero likes en el momento de la consulta, sin validacion independiente de la evaluacion del autor.
- Licencia Apache 2.0 permite uso comercial, pero las salvaguardas reducidas implican riesgo de cumplimiento y de reputacion en despliegues publicos; se recomienda moderacion externa.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no asumirlas sin verificar en el modelo base.

## Enlaces
- HuggingFace: https://huggingface.co/Sw1zyyyAdm/Qwen3.5-9B-abliterated-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
