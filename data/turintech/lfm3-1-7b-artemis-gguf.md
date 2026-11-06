# turintech/LFM3-1.7B-Artemis-GGUF

## Resumen

LFM3-1.7B-Artemis-GGUF es una cuantizacion en formato GGUF del modelo LiquidAI/LFM3-1.7B de Liquid AI, publicada por TurinTech. Se trata de una version comprimida mediante la tecnica propietaria Artemis Adaptive Compression, que reduce el peso de descarga desde los 3,467 GB del GGUF BF16 de referencia hasta 1,100 GB, es decir, un 68,3% menos. El modelo resultante conserva el comportamiento conversacional y de uso de herramientas del original con un impacto minimo en la calidad segun las pruebas del autor.

El modelo base pertenece a la familia LFM3 de Liquid AI, disenada para generacion de texto y tool calling en ingles. Con 1.728.801.600 parametros, se posiciona en el segmento de modelos pequenos orientados a despliegue local y entornos con recursos limitados. El archivo publicado corresponde a una cuantizacion Q4_K_M, que es la unica variante incluida en el repositorio.

La relevancia de esta ficha radica en que documenta una alternativa de cuantizacion agresiva con calibracion propia (imatrix) sobre un modelo compacto, verificada con llama.cpp y con evaluaciones parciales de BFCL e IFEval. No obstante, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, y las propias limitaciones declaradas restringen su uso cualificado a texto en ingles con thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM3 de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (contexto usado en la evaluacion del autor); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada); calibracion con imatrix |
| Idiomas soportados | ingles (unico idioma cualificado por el autor); otros idiomas no cualificados |
| Licencia | other (LFM Open License v1.0, heredada del modelo base) |
| Formato de pesos | GGUF |
| Tamano del archivo | 1.100 GB (decimal); 1.099.570.624 bytes |
| SHA-256 | fc1781679f925fe22c0984cf052ee552fbed3cc95916872d6d493b93b927270f |
| Modelo base | LiquidAI/LFM3-1.7B (commit 0dc4268b561499c648c7ba7c9466bf3d8d01517a) |
| Tipo de modelo | chat |
| Libreria | gguf / llama.cpp |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base LiquidAI/LFM3-1.7B (no se especifica si es un transformer denso, un hibrido o una arquitectura con atencion lineal). Lo unico conocido es que se trata de un modelo de 1.728.801.600 parametros orientado a generacion de texto y uso de herramientas, con soporte de un modo de razonamiento ("thinking") que puede activarse o desactivarse mediante parametros de la plantilla de chat.

El artefacto publicado por TurinTech no reentrena el modelo, sino que aplica una cuantizacion Q4_K_M con calibracion propia (imatrix) sobre los pesos originales, utilizando el tooling de conversion y cuantizacion de llama.cpp. La innovacion tecnica declarada es Artemis Adaptive Compression, una tecnica de compresion adaptativa de TurinTech cuyo funcionamiento interno no se describe en la model card. La evaluacion reportada se realizo con contexto de 8192 tokens, limite de respuesta de 4096 tokens y thinking desactivado, comparando el modelo original (upcast F32 sin perdida) frente a una cuantizacion Q4 estandar y frente a Artemis Q4.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles (modelo de tipo chat).
- Tool calling / function calling: la evaluacion del autor cubre llamadas simples, seleccion entre multiples herramientas, llamadas en paralelo y peticiones con herramientas irrelevantes.
- Seguimiento de instrucciones: evaluado con IFEval en un subconjunto de 64 casos con diversos formatos, longitudes, idiomas y restricciones de contenido.
- Modo de razonamiento ("thinking") configurable mediante `--chat-template-kwargs '{"enable_thinking":false}'` en llama.cpp; la evaluacion se realizo con thinking desactivado.
- Compatibilidad con la API nativa de chat de llama.cpp (`/v1/chat/completions`) y con endpoints compatibles.
- Capacidades multilingues: no cualificadas por el autor; solo se declara soporte verificado para ingles.
- No se declaran capacidades de vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno dentro de una ventana de 8192 tokens, adecuado para despliegues en estaciones de trabajo sin GPU dedicada gracias a su tamano de 1,1 GB.
- Integracion en aplicaciones de escritorio o herramientas CLI con llama.cpp: el binario `llama-server` permite exponer una API compatible con OpenAI en localhost, lo que facilita conectar el modelo a interfaces existentes sin infraestructura cloud.
- Automatizacion de tool calling en flujos controlados: con un rendimiento de 59/64 llamadas correctas en el subconjunto BFCL del autor, es utilizable para seleccionar herramientas y emitir llamadas estructuradas en asistentes de productividad o automatizacion de tareas simples.
- Prototipado rapido de agentes con function calling: al ser un modelo pequeno y ligero, permite iterar sobre plantillas de prompt y esquemas de herramientas con bajo coste de inferencia antes de escalar a modelos mayores.
- Generacion de respuestas con formato estricto: los resultados de IFEval (60/64 instrucciones correctas en el subconjunto del autor) sugieren que puede emplearse en tareas que exigen cumplir restricciones de formato, longitud o contenido en ingles.
- Evaluacion y comparacion de tecnicas de cuantizacion: el repositorio incluye metodologia y resultados comparativos entre BF16, Q4 estandar y Artemis Q4, lo que lo convierte en un artefacto util para investigar el impacto de la compresion en modelos pequenos.
- Despliegue en entornos con memoria limitada: con 1,1 GB de descarga, es viable en dispositivos con poca VRAM o incluso en CPU, siempre que se acepten las limitaciones de idioma y contexto declaradas.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card, obtenidos sobre subconjuntos fijos y curados de 64 casos BFCL y 64 casos IFEval, con contexto de 8192 tokens, limite de respuesta de 4096 tokens y thinking desactivado. El autor advierte explicitamente que son resultados de confirmacion de desarrollo, no puntuaciones completas de leaderboard.

| Modelo | Descarga (GB) | Tool calls correctas / 64 | Instrucciones correctas / 64 | Truncadas / 128 |
|---|---:|---:|---:|---:|
| Referencia original (BF16 GGUF, evaluado con upcast F32) | 3,467 | 58 | 58 | 0 |
| Compresion Q4 estandar | 1,100 | 59 | 60 | 0 |
| Artemis Q4 | 1,100 | 59 | 60 | 1 |

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor no realiza ninguna afirmacion comparativa sobre velocidad o memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El autor indica que el tamano de descarga (1,1 GB) no equivale a memoria en tiempo de ejecucion. Como referencia orientativa, un modelo de 1,7 mil millones de parametros en Q4_K_M suele requerir del orden de 1,5 a 2,5 GB de memoria para pesos mas overhead de contexto, pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es compatible con GPUs de consumo con al menos 4 GB de VRAM, aunque no se ha verificado en la model card.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,1 GB del archivo, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp (verificado con la build b11938 mediante `llama-server`); tambien compatible con otros runners que acepten GGUF, como Ollama, aunque no se ha verificado en la informacion disponible. vLLM y TGI no se mencionan.
- Parametros de ejecucion probados: `-ngl 99 -t 4 -tb 4 -c 8192 --parallel 1 --jinja --chat-template-kwargs '{"enable_thinking":false}'`.
- Latencia y throughput: no disponibles; el autor no realiza ninguna afirmacion al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Artemis-GGUF (este) | 1,73 B | 8192 (evaluado) | GGUF Q4_K_M | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LFM3-1.7B (original, BF16 GGUF) | 1,73 B | no disponible | GGUF BF16 | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Cuantizacion Q4 estandar de LFM3-1.7B | 1,73 B | 8192 (evaluado) | GGUF Q4 | LFM Open License v1.0 | Referenciada en la model card, no se indica repositorio publico |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada. La comparativa se limita a las tres variantes evaluadas por el autor.

## Limitaciones y advertencias

- La cualificacion del artefacto cubre unicamente texto en ingles y tool calls con thinking desactivado, dentro de los limites de contexto (8192 tokens) y respuesta (4096 tokens) probados.
- Otros idiomas, contextos mas largos y otras integraciones de runtime no han sido cualificados para este archivo.
- Una de las 128 respuestas de Artemis alcanzo el limite de tokens; ese caso de seguimiento de instrucciones fallo en los tres modelos comparados.
- Los resultados de BFCL e IFEval proceden de subconjuntos pequenos (64 casos cada uno) y son resultados de confirmacion de desarrollo, no evaluaciones finales sobre conjuntos intactos; el propio autor advierte que la muestra no permite establecer superioridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia: LFM Open License v1.0 (etiquetada como "other"), heredada del modelo base. Es necesario revisar los terminos del modelo base para uso comercial, ya que la model card no detalla las restricciones.
- El modelo no ejecuta las llamadas a herramientas que genera; el servidor solo emite las llamadas estructuradas.
- Artefacto con cero descargas y cero likes en el momento de la consulta; sin validacion independiente por parte de la comunidad.
- No se realizan afirmaciones sobre velocidad o memoria en la model card, por lo que no deben asumirse mejoras de rendimiento frente a la cuantizacion estandar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turintech/LFM3-1.7B-Artemis-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/0dc4268b561499c648c7ba7c9466bf3d8d01517a/LICENSE
- llama.cpp (runtime y tooling de conversion/cuantizacion): https://github.com/ggml-org/llama.cpp
