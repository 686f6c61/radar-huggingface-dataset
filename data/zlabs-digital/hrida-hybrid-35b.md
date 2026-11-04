# zlabs-digital/Hrida-Hybrid-35B

## Resumen

Hrida-Hybrid-35B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por zlabs-digital, construido sobre la arquitectura Hrida-Hybrid de Hrida-MoE. Cuenta con 256 expertos con enrutamiento top-8, 40 capas y un total de 35.505.261.952 parametros almacenados en safetensors. El modelo se distribuye bajo licencia Apache 2.0 y es exclusivamente de texto: la torre de vision de su modelo base no esta incluida en esta version.

El modelo incorpora dos innovaciones tecnicas destacables: Least-Loaded Expert Parallelism, una estrategia de balanceo de carga disenada para mezclas de expertos desbalanceadas, y la capa de multi-token prediction (MTP) del modelo base, conservada para decodificacion especulativa mediante el metodo `generate_mtp()`. Ademas, reserva espacio para expertos de dominio industrial (`n_domain_experts`) que arrancan como no-ops exactos, lo que permite anadir especializacion vertical sin alterar el comportamiento base.

El modelo se posiciona como una alternativa de tamano medio-grande para cargas de trabajo empresariales, con resultados reportados en pruebas tipo lm-eval que lo situan en la misma liga que el modelo del que deriva (Qwen3.5-35B-A3B). El repositorio ocupa 71 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un lanzamiento muy reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos, top-8, 40 capas |
| Parametros totales | 35.505.261.952 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y `hrida_hybrid`) |

## Arquitectura y entrenamiento

Hrida-Hybrid-35B es un transformer de tipo Mixture-of-Experts con 256 expertos y enrutamiento top-8 sobre 40 capas. La innovacion principal declarada es Least-Loaded Expert Parallelism, una tecnica de balanceo de carga orientada a mezclas de expertos desbalanceadas, que busca evitar el colapso de expertos y mejorar la utilizacion del computo en entrenamiento e inferencia distribuida. El modelo conserva la capa de multi-token prediction (MTP) del modelo base, lo que habilita decodificacion especulativa nativa a traves de `generate_mtp()` y puede reducir la latencia de generacion.

La arquitectura incorpora un mecanismo para anadir expertos de dominio industrial (`n_domain_experts`) que inicialmente se comportan como no-ops exactos, de modo que la especializacion vertical no degrada el rendimiento general hasta que se entrenan. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo es solo de texto: la torre de vision del modelo base Qwen3.5-35B-A3B no esta incluida en esta distribucion.

## Capacidades

- Generacion de texto y razonamiento general, con resultados reportados en MMLU (83%), BIG-Bench Hard (69%) y ARC-Challenge (68%).
- Razonamiento matematico, con un 87% reportado en GSM8K.
- Generacion de codigo, con un 93% reportado en HumanEval.
- Comprension lectora y sentido comun, con 80% en HellaSwag (acc_norm) y 84% en BoolQ.
- Decodificacion especulativa mediante la capa MTP conservada (`generate_mtp()`).
- Soporte para anadir expertos de dominio industrial (`n_domain_experts`) como no-ops iniciales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no incluidas (modelo solo de texto).

## Casos de uso

- Generacion de codigo en produccion: con un 93% reportado en HumanEval, el modelo es adecuado para autocompletado, generacion de tests y refactorizacion asistida dentro de pipelines de CI/CD, siempre que se valide la salida antes de integrarla.
- Asistencia en razonamiento matematico y analisis cuantitativo: el 87% en GSM8K lo hace util para resolver problemas aritmeticos de varios pasos en herramientas de analisis financiero o educativo.
- Resolucion de preguntas y respuestas sobre documentacion: el 84% en BoolQ y el 83% en MMLU permiten construir sistemas de QA sobre bases de conocimiento corporativas con verificacion humana.
- Razonamiento de sentido comun y clasificacion de texto: con 80% en HellaSwag y 68% en ARC-Challenge, encaja en tareas de moderacion, etiquetado y enrutamiento de tickets.
- Inferencia de baja latencia en servidores: la capa MTP permite decodificacion especulativa, lo que reduce el coste por token en despliegues de atencion al cliente o asistentes interactivos.
- Especializacion vertical: la reserva de expertos de dominio (`n_domain_experts`) permite adaptar el modelo a sectores concretos (legal, sanitario, industrial) sin partir de cero y sin degradar el comportamiento general mientras no se entrenan.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integracion en productos comerciales sin obligaciones de apertura del codigo derivado.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (muestras pequenas, lm-eval, mismos que el modelo original Qwen3.5-35B-A3B):

| Benchmark | Resultado |
|---|---|
| MMLU | 83% |
| GSM8K | 87% |
| HumanEval | 93% |
| BIG-Bench Hard | 69% |
| HellaSwag (acc_norm) | 80% |
| BoolQ | 84% |
| ARC-Challenge | 68% |

No se han publicado otros resultados de benchmarks en la informacion disponible. Los datos anteriores provienen de muestras pequenas segun el propio autor y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 35,5 B de parametros en FP16 requieren aproximadamente 71 GB de VRAM, lo que obliga a cuantizacion o a reparto multi-GPU para caber en hardware de consumo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un despliegue en FP16 requeriria multiples A100/H100 (por ejemplo, 2x H100 80 GB o 4x A100 40 GB); en cuantizacion 4-bit podria ajustarse en una unica GPU de 48-80 GB.
- Compatibilidad con GPU de consumo: no confirmada. Con cuantizacion agresiva (4-bit) podria intentarse en RTX 4090 (24 GB) solo con offloading a CPU/RAM, con latencia elevada.
- Opciones de despliegue: al requerir `custom_code` y la arquitectura `hrida_hybrid`, la integracion con vLLM, llama.cpp, Ollama o TGI no esta garantizada y no se documenta en la informacion disponible. El uso via `transformers` con `trust_remote_code=True` es la via mas directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hrida-Hybrid-35B | ~35,5 B (MoE, 256 expertos top-8) | no disponible | Apache 2.0 | Decodificacion especulativa via MTP; solo texto |
| Qwen3.5-35B-A3B | ~35 B (MoE, ~3 B activos) | no disponible | no disponible | Modelo base declarado; incluye torre de vision |
| Alternativas de ~30-40 B densas | ~30-40 B | variable | variable | No disponibles en la informacion proporcionada |

La comparativa con otros modelos de la misma categoria no puede completarse con datos verificados a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos habituales de los corpus web de entrenamiento.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados, lo que impide garantizar su comportamiento en ventanas largas o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de `custom_code` propietario de la arquitectura `hrida_hybrid`, cuya implementacion debe auditarse antes de desplegar en produccion.
- Los benchmarks reportados provienen de muestras pequenas y del propio autor, sin verificacion independiente.
- El modelo es solo de texto; no debe esperarse capacidad de vision aunque el modelo base la tuviera.
- El repositorio no registra descargas ni likes, y la arquitectura es poco comun, lo que reduce la probabilidad de encontrar soporte comunitario, herramientas de cuantizacion y guias de despliegue.
- No se documentan pasos de alineacion (RLHF/DPO), lo que puede afectar a la calidad de las respuestas en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/zlabs-digital/Hrida-Hybrid-35B
- Paper de referencia citado: "Least-Loaded Expert Parallelism: Load Balancing An Imbalanced Mixture-of-Experts" (no se proporciona URL en la informacion disponible)
- Repositorio o documentacion de Hrida-MoE: no disponible
- Demo o blog oficial: no disponible
