# ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated-4bit-mlx

## Resumen

Mellum2.1-12B-A2.5B-Thinking-abliterated-4bit-mlx es una cuantizacion en 4 bits para MLX de un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Mellum 2.1. Lo publica el usuario ttennant en Hugging Face y esta pensado para ejecutarse en hardware Apple Silicon mediante el framework MLX. El modelo base es una version "abliterated" (es decir, con los mecanismos de rechazo internos neutralizados) del Mellum2.1-12B-A2.5B-Thinking, lo que lo orienta a usos sin filtrado de contenido.

El modelo cuenta con 12.149.923.072 parametros totales y, segun el nombre, aproximadamente 2.500 millones de parametros activos por token, lo que lo situa en la categoria de MoE disperso con una relacion de activacion cercana al 20 por ciento. El contexto maximo, la composicion exacta del dataset de entrenamiento y los detalles de alineacion no se documentan en la informacion disponible.

Su relevancia actual es doble: por un lado, ofrece una via practica de ejecutar un MoE de 12B en equipos con memoria unificada de Apple mediante cuantizacion 4-bit; por otro, la variante abliterated plantea consideraciones eticas y de cumplimiento que conviene evaluar antes de usarlo en produccion. La licencia declarada es Apache 2.0 y el unico idioma soportado oficialmente es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer disperso (detalle de capas no disponible) |
| Parametros totales | 12.149.923.072 |
| Parametros activos | Aproximadamente 2.500 millones (segun denominacion A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX); no se documentan otras variantes en este repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (4-bit), compatible con la libreria mlx |
| Tamano del repositorio | 6,8 GB |
| Libreria de inferencia | MLX |
| Modelo base | ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated |
| Descargas | 93 |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo MoE con 12.149.923.072 parametros totales y alrededor de 2.500 millones activos por token, lo que implica enrutamiento disperso hacia un subconjunto de expertos en cada capa. El modelo base incorpora un modo "Thinking", lo que sugiere un entrenamiento orientado a razonamiento explicito con cadenas de pensamiento antes de la respuesta final. No se dispone de datos sobre el numero de capas, dimension del hidden state, numero de expertos, funcion de enrutamiento ni top-k de activacion.

Tampoco se documentan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. La variante "abliterated" implica que se ha aplicado una tecnica de ablacion de direcciones de activacion para eliminar el comportamiento de rechazo, un procedimiento que suele realizarse mediante intervenciones sobre los pesos o las activaciones internas y que puede degradar parcialmente la calidad y la coherencia del modelo en tareas sensibles. La cuantizacion 4-bit para MLX reduce el peso del repositorio a 6,8 GB, lo que facilita su ejecucion en memoria unificada de equipos Apple.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado de text-generation.
- Razonamiento explicito mediante modo Thinking (herencia del modelo base Thinking), con generacion de trazas de razonamiento antes de la respuesta.
- Capacidad de arquitectura MoE con activacion dispersa, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano.
- Respuestas sin filtrado de contenido por la ablacion aplicada, lo que amplia el rango de temas tratados pero elimina la capa de rechazo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo Thinking sugiere cierta capacidad de planificacion.
- Capacidades multimodales (vision, audio): no disponibles.
- Multilingue: limitado al ingles segun la model card.

## Casos de uso

- Prototipado local en Apple Silicon: la cuantizacion 4-bit MLX con 6,8 GB de pesos permite cargar el modelo en Macs con memoria unificada de 16 GB o superior, lo que facilita experimentacion sin GPU dedicada.
- Investigacion sobre alineacion y seguridad: la variante abliterated sirve como objeto de estudio para analizar que comportamientos se eliminan con la ablacion y como afecta a la coherencia y a la utilidad general del modelo.
- Generacion de texto creativo sin restricciones tematicas: util en entornos de escritura asistida o generacion de ficcion donde el filtrado estandar resulta limitante, siempre con revision humana.
- Experimentacion con arquitecturas MoE: el modelo permite medir en local el rendimiento de un MoE de 12B con 2,5B activos frente a alternativas densas, evaluando latencia y calidad en tareas concretas.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir una version base sin cuantizar, se puede contrastar la degradacion introducida por el esquema 4-bit de MLX en tareas de razonamiento.
- Desarrollo de asistentes conversacionales en ingles para entornos controlados: con contexto suficiente (no documentado) podria emplearse en dialogos multi-turno, aunque requiere validacion previa de calidad.
- Base para fine-tuning adicional: al estar bajo Apache 2.0 y en formato safetensors, puede servir de punto de partida para ajustes especificos, siempre que se asuma la herencia del comportamiento abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio pesa 6,8 GB en 4-bit, por lo que se recomienda un minimo de 8-10 GB de memoria disponible para cargar los pesos, y 16 GB o mas para trabajar con contextos largos y margen de activaciones.
- Hardware objetivo: equipos Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra) por el uso de MLX. No es compatible de forma nativa con CUDA sin conversion previa de formato.
- GPU dedicadas: no aplica de forma directa; para NVIDIA seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar) y usar llama.cpp, vLLM o TGI, lo que no esta documentado en este repositorio.
- Cabe en consumer hardware: si, en Macs con memoria unificada de 16 GB o superior; en configuraciones de 8 GB el margen sera muy limitado.
- Opciones de despliegue: libreria mlx y mlx-lm en macOS; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta variante concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated-4bit-mlx | 12,15B | ~2,5B | no disponible | Apache 2.0 | MLX 4-bit | Objeto de esta ficha; orientado a Apple Silicon y sin filtrado |
| ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated | 12,15B | ~2,5B | no disponible | Apache 2.0 | safetensors | Version base sin cuantizar del mismo modelo |
| Mellum2.1-12B-A2.5B-Thinking (original) | 12,15B | ~2,5B | no disponible | no disponible | no disponible | Version con alineacion estandar, sin ablacion |
| Alternativas MoE de tamano similar (p. ej. familia Mixtral o Qwen MoE) | variable | variable | variable | variable | variable | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion numerica |

No se dispone de datos de rendimiento comparado en la informacion proporcionada, por lo que la comparativa se limita a parametros estructurales y licencia.

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido danino, ilegal o inseguro sin filtros; requiere supervision y politicas de uso estrictas en cualquier despliegue.
- La ablacion puede degradar la coherencia, la calidad del razonamiento y la utilidad general respecto al modelo base alineado.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad.
- Idioma limitado al ingles; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos sin pruebas previas.
- La cuantizacion 4-bit introduce perdida de precision adicional respecto al modelo base; no se han publicado mediciones de dicha degradacion.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado por un modelo sin filtrado.
- Solo funciona de forma nativa con MLX en Apple Silicon; el despliegue en servidores NVIDIA requiere conversion no documentada.
- Modelo con muy baja adopcion (93 descargas, 0 likes) y sin validacion comunitaria, por lo que no hay evidencia externa de calidad o estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated
- Libreria MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
