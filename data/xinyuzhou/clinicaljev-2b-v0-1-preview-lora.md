# xinyuzhou/ClinicalJev-2B-v0.1-preview-LoRA

## Resumen

ClinicalJev-2B-v0.1-preview-LoRA es un adaptador LoRA publicado por el usuario xinyuzhou sobre el backbone de texto Qwen/Qwen3.5-2B. No es un modelo generativo al uso: dado un texto de contexto (por ejemplo, una nota clinica), una pregunta y un conjunto predefinido de candidatos o rúbricas, el modelo devuelve una eleccion y una distribucion de probabilidad sobre las opciones. La inferencia se realiza leyendo los logits del siguiente token en una posicion prefijada y normalizando unicamente las etiquetas permitidas, sin generar texto libre.

El modelo se presenta como una version preview v0.1 orientada a NLP clinico, con entrenamiento limitado a ingles y chino simplificado. Su tamano declarado es de 2B parametros, heredado del backbone Qwen3.5-2B, y el repositorio ocupa aproximadamente 0,3 GB, coherente con un adaptador PEFT en formato safetensors mas que con pesos completos. La model card indica explicitamente `inference: false` en el frontmatter, aunque incluye un ejemplo completo de inferencia local con PEFT.

Su relevancia actual es acotada y experimental: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados numericos de benchmarks publicados en la informacion disponible. La model card menciona una comparacion grafica frente a "Jev 1.13.0" sobre 13 conjuntos de datos retenidos, pero no se aportan cifras concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen/Qwen3.5-2B) con adaptador LoRA (PEFT) |
| Parametros totales | 2B (heredados del backbone Qwen3.5-2B; el adaptador anade un numero no especificado de parametros entrenables) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (depende del backbone Qwen3.5-2B, no especificado en la informacion) |
| Tipos de cuantizacion | no disponible para el adaptador; el repositorio contiene safetensors LoRA. No se ofrecen pesos GGUF |
| Idiomas soportados | Ingles (en) y chino simplificado (zh); otros idiomas no validados |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen3.5-2B (relacion: adapter) |
| Libreria | peft |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del backbone Qwen3.5-2B, un transformer causal de 2B parametros, sobre el que se aplica un adaptador LoRA entrenado con PEFT. El modelo no genera texto: el procedimiento de inferencia descrito en la model card construye una plantilla de chat nativa con el modo "thinking" desactivado, coloca el contexto antes de la pregunta seleccionada y anade un prefijo JSON abierto. A continuacion se leen los logits del siguiente token en esa posicion y se normalizan solo las etiquetas permitidas, lo que convierte la salida en una distribucion de probabilidad restringida al conjunto de candidatos o niveles de la rubrica.

El modelo define tres primitivas de tarea. "Choice" recibe candidatos con nombre y descripcion y devuelve el candidato seleccionado junto con su distribucion de probabilidad. "Score" recibe una rubrica ordenada de menor a mayor y devuelve probabilidades sobre los niveles y su indice esperado zero-based entre 0 y K-1. "Noul" recibe una proposicion de si/no con criterios opcionales de verdadero/falso y devuelve una estimacion de veracidad; el ejemplo local mapea nueve bins de valoracion a un estimado en el intervalo [0,01, 0,99]. El formateador admite entre 2 y 50 candidatos o niveles, y usa etiquetas numericas cuando hay 10 o menos niveles en tareas de tipo Score.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card afirma que no se utilizaron splits de entrenamiento, validacion ni test de los benchmarks en el entrenamiento, y que la formacion esta limitada a ingles y chino simplificado. El autor mantiene un repositorio GitHub con pesos, codigo de inferencia, documentacion y un benchmark propio llamado ClinicalJev Benchmark.

## Capacidades

- Clasificacion con candidatos cerrados ("Choice"): selecciona la mejor opcion entre 2 y 50 alternativas etiquetadas y devuelve una distribucion de probabilidad sobre ellas.
- Puntuacion ordinal ("Score"): evalua un texto contra una rubrica ordenada de menor a mayor y devuelve probabilidades por nivel mas el indice esperado.
- Estimacion de veracidad ("Noul"): determina si una proposicion de si/no se sostiene a partir del contexto, con estimacion calibrada en [0,01, 0,99].
- Extraccion de informacion clinica estructurada: sintomas, presencia o ausencia de hallazgos y soporte de afirmaciones a partir de notas.
- Inferencia restringida sin generacion de texto: la salida se limita a etiquetas predefinidas, lo que reduce el riesgo de texto no controlado.
- Soporte bilingue ingles y chino simplificado en las tareas entrenadas.
- No se documentan capacidades de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito. El ejemplo de inferencia indica usar la plantilla de chat con el modo "thinking" desactivado.

## Casos de uso

- Anotacion estructurada de notas clinicas: dado un informe de paciente, formular preguntas de tipo Choice para etiquetar presencia o ausencia de sintomas y obtener una distribucion de probabilidad utilizable para priorizar revision humana.
- Extraccion de variables para cohortes de investigacion: usar tareas Score sobre rubricas ordenadas para graduar la intensidad o el soporte de un hallazgo y convertir la salida en una variable ordinal analizable.
- Verificacion de afirmaciones en historiales: emplear la primitiva Noul para comprobar si una proposicion clinica concreta se sostiene en el texto de origen, con un estimado de probabilidad en lugar de una respuesta binaria.
- Preetiquetado en pipelines de anotacion humana: integrar el adaptador como primer paso automatico y reservar la revision experta para los casos con baja confianza, dado que la salida es una distribucion normalizada.
- Filtrado y triaje de documentacion clinica: clasificar notas segun criterios definidos por el equipo medico, aprovechando el limite de 2 a 50 candidatos por consulta.
- Evaluacion de calidad de resumenes o extracciones: comparar un texto generado contra una rubrica ordenada para asignar una puntuacion de fidelidad respecto al documento original.
- Investigacion en NLP clinico: usar el adaptador como linea base reproducible junto al ClinicalJev Benchmark publicado por el autor para experimentos de evaluacion restringida.

## Benchmarks y rendimiento

La model card incluye una imagen comparativa titulada "ClinicalJev-2B-v0.1-preview versus Jev 1.13.0 on 13 held-out datasets", con la nota de que no se usaron splits de entrenamiento, validacion ni test de esos benchmarks durante el entrenamiento. Sin embargo, no se proporcionan valores numericos en el texto disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador mas el backbone de 2B: aproximadamente 5-6 GB en FP16, en torno a 3 GB en cuantizacion de 8 bits y cerca de 2 GB en 4 bits. Son estimaciones derivadas del tamano del backbone, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Para despliegue en servidor, A100 o H100 si se necesita concurrencia alta, aunque el modelo es pequeno y no las requiere.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU modernas con 6 GB o mas de VRAM, dado que el backbone es de 2B parametros y el adaptador ocupa 0,3 GB.
- Opciones de despliegue: PEFT junto con transformers y accelerate segun el ejemplo oficial. El autor no documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otras plataformas, y no se distribuyen pesos GGUF.
- Latencia y throughput estimados: no disponibles. La decodificacion es de un unico paso de logits por consulta, no generacion autoregresiva completa, por lo que la latencia deberia ser baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinicalJev-2B-v0.1-preview-LoRA | 2B (backbone) + LoRA | no disponible | Salida restringida a eleccion, puntuacion y estimacion de verdad | no disponible | HuggingFace, 0 descargas |
| Jev 1.13.0 | no disponible | no disponible | Referencia de comparacion citada en la model card | no disponible | no disponible |
| PH-LLM-1.5B-LoRA (mismo autor) | 1,5B | no disponible | Adaptador LoRA de dominio, presumiblemente sanitario | no disponible | HuggingFace, 0 likes |

No se dispone de datos suficientes sobre Jev 1.13.0 ni sobre otras alternativas comparables en la informacion proporcionada. La model card unicamente referencia a Jev 1.13.0 como linea base en una comparacion grafica.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribucion ni atribucion. No debe desplegarse en produccion sin aclarar previamente los terminos.
- Version preview v0.1: el propio autor la etiqueta como vista previa, lo que implica API, formato y comportamiento potencialmente inestables.
- Idioma: el entrenamiento se limita a ingles y chino simplificado. Aunque el backbone Qwen es multilingue, el rendimiento en otros idiomas no ha sido validado, por lo que el uso en castellano no esta respaldado.
- El frontmatter de la model card declara `inference: false`, lo que puede indicar que el artefacto no esta listo para uso general o que la inferencia solo es valida mediante el codigo de ejemplo proporcionado.
- Sin validacion externa: cero descargas y cero likes, sin resultados numericos de benchmarks publicados. No existen evaluaciones independientes conocidas.
- Riesgo de alucinacion: aunque la salida se restringe a etiquetas predefinidas, la distribucion de probabilidad puede estar mal calibrada, especialmente en contextos fuera de la distribucion de entrenamiento.
- Ambito estrictamente clinico y de clasificacion: no es un modelo de proposito general. No se documentan capacidades de generacion, codigo, matematicas, tool calling ni agentes.
- Dependencia del backbone: el adaptador requiere los pesos del backbone Qwen/Qwen3.5-2B, cuyas condiciones de licencia y disponibilidad son independientes de este repositorio.
- Uso clinico real: cualquier aplicacion en entornos medicos exige supervision profesional y validacion regulatoria; este artefacto no declara conformidad con ninguna normativa sanitaria.
- Orden sensible: la model card advierte que el orden de candidatos y rubricas afecta al resultado, un caveat operativo importante para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xinyuzhou/ClinicalJev-2B-v0.1-preview-LoRA
- Repositorio GitHub del proyecto (pesos, codigo de inferencia y documentacion): https://github.com/xzhou-code/ClinicalJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Imagen comparativa frente a Jev 1.13.0 sobre 13 conjuntos retenidos: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/comparison-2B.png
- Documentacion de la primitiva Choice: https://docs.typesafe.ai/primitives/choice
- Documentacion de la primitiva Score: https://docs.typesafe.ai/primitives/score
- Documentacion de la primitiva Noul: https://docs.typesafe.ai/primitives/noul
- Adaptador relacionado del mismo autor: https://huggingface.co/xinyuzhou/PH-LLM-1.5B-LoRA
