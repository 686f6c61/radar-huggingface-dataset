# vtava/TinyCeNN-LM-Sharded-MoE-Top2

## Resumen

TinyCeNN-LM-Sharded-MoE-Top2 es un modelo de generacion de texto publicado por el usuario vtava en HuggingFace. Se presenta como un estudiante destilado de arquitectura CeNN (no transformer) que sustituye la FFN convencional por una FFN enrutada de tipo Mixture-of-Experts con enrutado top-2 y 8 shards de 96 canales internos cada uno. El modelo parte de arnir0/Tiny-LLM como referencia docente y se ha entrenado mediante destilacion de conocimiento, con el objetivo declarado de recuperar el rendimiento del profesor manteniendo un coste de parametros practicamente identico al de un CeNN plano.

La relevancia tecnica del modelo es fundamentalmente experimental: con 481.729 parametros entrenables y un sobrecoste declarado de solo un 0,320 % frente a un CeNN sin enrutado, explora si un MoE de grano muy fino y enrutado disperso aporta ventaja en un regimen de parametros extremadamente reducido. Es un ejemplo de investigacion sobre eficiencia de parametros y arquitecturas alternativas al transformer, no un modelo orientado a produccion.

La informacion publicada es muy escasa: no se declaran licencia, idiomas soportados, longitud de contexto, ni resultados en benchmarks estandar. El repositorio figura con un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar subidos en el momento de la consulta, y el modelo acumula 0 descargas y 0 likes. Cualquier evaluacion practica debe considerarse pendiente de verificacion directa contra el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CeNN (transformer-free) con FFN enrutada tipo MoE, 8 shards x 96 canales internos, enrutado top-2 |
| Parametros totales | 481.729 parametros entrenables |
| Parametros activos | no disponible (el autor no publica el desglose de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB de tamano) |

## Arquitectura y entrenamiento

El modelo es un CeNN (red no transformer) que actua como estudiante de destilacion de conocimiento. La innovacion declarada es la sustitucion de la FFN por una FFN enrutada con 8 shards de 96 canales internos y enrutado top-2, es decir, se activan 2 de los 8 shards por token. El autor describe el diseno como "parameter-neutral": el sobrecoste de parametros del enrutado es de solo un 0,320 % respecto a un CeNN plano, lo que permite atribuir cualquier mejora al enrutado y no a un aumento de capacidad. El modelo base de referencia es arnir0/Tiny-LLM, que actua como profesor en la destilacion.

En cuanto al entrenamiento, la model card solo aporta cifras de validacion: 65.536 tokens de held-out, una mejor entropia cruzada (CE) de 5,115179 para el estudiante frente a 4,234912 del profesor, y una recuperacion del 84,55 % de la brecha respecto al profesor. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla el tipo de atencion, el tokenizador ni la estrategia de decodificacion.

## Capacidades

- Generacion de texto autoregresiva: es la unica tarea declarada en el pipeline del modelo (text-generation).
- Destilacion desde un modelo docente: el entrenamiento esta orientado a imitar la distribucion de arnir0/Tiny-LLM, no a desarrollar capacidades nuevas.
- Enrutado disperso top-2 sobre 8 shards: mecanismo de computo condicional por token, relevante como objeto de estudio mas que como capacidad funcional.
- Eficiencia extrema de parametros: 481.729 parametros entrenables en total.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponible.

## Casos de uso

- Investigacion sobre enrutado disperso: el modelo permite estudiar si un MoE de grano fino con enrutado top-2 aporta ventaja frente a una FFN densa cuando el presupuesto de parametros es de apenas medio millon, aislando el efecto del enrutado gracias al sobrecoste declarado del 0,320 %.
- Experimentos de destilacion de conocimiento a escala minima: sirve como banco de pruebas para medir la recuperacion de la brecha respecto al profesor (84,55 % declarado) en condiciones de recursos muy limitados.
- Validacion de arquitecturas no transformer: util para comparar CeNN frente a transformers de tamano equivalente en tareas de modelado de lenguaje a pequena escala.
- Prototipado en CPU y entornos sin GPU: con 481.729 parametros, la huella de pesos en FP32 ronda 1,84 MiB, por lo que cabe en cualquier portatil o contenedor sin acelerador.
- Docencia y divulgacion: ejemplo reproducible y de bajo coste para explicar enrutado top-2, MoE disperso y destilacion en un curso o taller.
- Pruebas de integracion con la libreria transformers y endpoints compatibles: el tag endpoints_compatible sugiere que puede desplegarse en infraestructura de inferencia estandar, util para validar pipelines de despliegue con modelos minimos.
- Tests de regresion en tooling de evaluacion: su tamano permite ejecutar barridos completos de evaluacion en segundos, como caso de prueba de frameworks de evaluacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona metricas de entropia cruzada sobre el conjunto de validacion del propio autor:

| Metrica | Estudiante (TinyCeNN-LM Sharded MoE Top-2) | Profesor (arnir0/Tiny-LLM) |
|---|---|---|
| Mejor entropia cruzada (CE) | 5,115179 | 4,234912 |
| Tokens de held-out | 65.536 | no disponible |
| Recuperacion de la brecha respecto al profesor | 84,55 % | referencia |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni de comparaciones verificables con modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: los 481.729 parametros ocupan aproximadamente 1,84 MiB en FP32, unos 940 KiB en FP16/BF16 y unos 470 KiB en INT8 (solo pesos; el consumo real depende del estado de activaciones y de la longitud de contexto, dato no disponible).
- GPU recomendadas: cualquier GPU es sobredimensionada para este modelo; no se requiere acelerador. La ejecucion en CPU es perfectamente viable.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo, incluida cualquier GTX/RTX con mas de 1 GB de VRAM, y tambien en dispositivos embebidos y Raspberry Pi.
- Opciones de despliegue: la libreria declarada es transformers; el tag endpoints_compatible apunta a despliegue en infraestructura de inferencia compatible. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, ni de pesos en formato GGUF.
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio figura con 0,0 GB de tamano, por lo que conviene verificar que los pesos esten efectivamente publicados antes de planificar cualquier despliegue.

## Comparativa con modelos similares

La busqueda web no ha devuelto informacion util sobre modelos comparables (los resultados obtenidos corresponden a paginas de servicios de traduccion, sin relacion con el modelo). Unicamente puede compararse con el modelo docente declarado:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyCeNN-LM-Sharded-MoE-Top2 | 481.729 | no disponible | CE 5,115179 (held-out propio, 65.536 tokens) | no disponible | Publicado en HuggingFace, 0 descargas |
| arnir0/Tiny-LLM (profesor) | no disponible | no disponible | CE 4,234912 (misma evaluacion) | no disponible | Publicado en HuggingFace |

No se dispone de datos suficientes para establecer comparaciones con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial; es un riesgo legal directo para cualquier integracion en produccion.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad; no hay evidencia de soporte multilingue ni de castellano.
- Longitud de contexto desconocida: no se puede planificar uso con conversaciones largas o documentos extensos.
- Formato de pesos no confirmado y repositorio de 0,0 GB: existe la posibilidad de que los pesos no esten subidos, lo que impediria la inferencia.
- Riesgo elevado de alucinacion: con 481.729 parametros y una CE de 5,115179 en held-out, la calidad del modelado del lenguaje es muy limitada; la CE del profesor (4,234912) ya es alta en terminos absolutos.
- Evaluacion muy reducida: las metricas se calculan sobre 65.536 tokens de held-out, sin benchmarks estandar, sin evaluacion humana y sin pruebas de robustez.
- Ausencia de alineamiento declarado: no se menciona RLHF, DPO ni filtrado de seguridad, por lo que no hay garantias sobre toxidad, sesgos o contenido danino.
- Sesgos conocidos: no disponible; no se ha publicado ningun analisis de sesgo.
- Adopcion nula: 0 descargas y 0 likes, sin evidencia de uso, mantenimiento o validacion por terceros.
- Fecha de creacion registrada como 2026-09-11: conviene verificar la coherencia temporal del repositorio antes de citarlo.
- No es apto para tareas de produccion que requieran razonamiento, codigo, matematicas o fidelidad factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/TinyCeNN-LM-Sharded-MoE-Top2
- Modelo base / profesor: https://huggingface.co/arnir0/Tiny-LLM
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
