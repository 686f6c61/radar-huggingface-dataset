# trymirai/LFM2.5-2.6B-L

## Resumen

Mirai's LFM2.5-2.6B Large Quantization (identificador `trymirai/LFM2.5-2.6B-L`) es una cuantizacion de 8 bits del modelo base LiquidAI/LFM2.5-2.6B, publicada por el equipo de Mirai Labs bajo el formato propietario `uzu`. El objetivo declarado es ofrecer inferencia local eficiente en Apple silicon, manteniendo una divergencia KL baja respecto al checkpoint original. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresion post-entrenamiento que hereda las capacidades del modelo de LiquidAI.

El checkpoint cuenta con 2.740.774.912 parametros almacenados en safetensors y ocupa 14,0 GB en el repositorio. La cuantizacion emplea enteros simetricos de 8 bits con escalas en bfloat16 y tamano de grupo 64, complementada con transformadas de Hadamard aleatorias de bloque (block size 32) para mitigar valores atipicos en activaciones y pesos. El autor situa el checkpoint en la frontera de Pareto tamano-divergencia KL, afirmando no haber encontrado otro checkpoint mas pequeno con menor KL.

La relevancia actual del modelo reside en su enfoque: no compite por capacidades brutas, sino por eficiencia de despliegue en hardware de consumo Apple. Su utilidad esta condicionada a la disponibilidad del runtime `uzu`, que en el momento de la publicacion solo soporta inferencia en Apple silicon. La licencia es la LFM Open License del modelo original, lo que impone restricciones adicionales para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la del modelo base LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.740.774.912 |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit simetrica, escalas bfloat16, group size 64, con Random Hadamard Transforms de bloque 32 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License (`lfm-open-license`), enlazada al repositorio de LiquidAI |
| Formato de pesos | Safetensors (runtime `uzu`) |
| Tamano del repositorio | 14,0 GB |
| Libreria | `uzu` |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Relacion con el base | Quantized |
| Hardware soportado | Apple silicon exclusivamente (segun la model card) |

## Arquitectura y entrenamiento

La arquitectura del checkpoint no se detalla en la informacion disponible; la model card remite explicitamente a la del modelo original LiquidAI/LFM2.5-2.6B para detalles de arquitectura, uso previsto, evaluaciones y limitaciones. Por tanto, no se puede confirmar aqui si el backbone es un transformer denso, un hibrido o si incorpora componentes de atencion lineal, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

La innovacion tecnica documentada corresponde al proceso de cuantizacion. Mirai Large aplica cuantizacion entera simetrica de 8 bits con escalas bfloat16 y agrupacion en bloques de 64 elementos, y utiliza transformadas de Hadamard aleatorias diagonales por bloques de 32 para redistribuir valores atipicos antes de cuantizar. El proceso es post-entrenamiento, sin fine-tuning posterior documentado. El autor publica una grafica de divergencia KL frente a tamano de checkpoint y afirma que el modelo se situa en la frontera de Pareto; la evaluacion se realizo sobre una mezcla de datos compuesta por 45% datos publicos agenticos, 30% datos publicos de SFT y contexto largo, y 25% datos privados de chat.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`; las capacidades concretas de razonamiento, codigo y matematicas dependen del modelo base y no se detallan en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita; la evaluacion de la cuantizacion incluye un 45% de datos publicos agenticos, lo que sugiere que el modelo base esta orientado a ese tipo de tareas, pero no se documentan capacidades concretas.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Inferencia local en Apple silicon: capacidad operativa del checkpoint, dependiente del runtime `uzu` y del CLI `mirai`.

## Casos de uso

- Prototipado local en Mac: desarrolladores que trabajan en macOS pueden instalar el paquete `mirai` via Homebrew y ejecutar el modelo con un solo comando, sin necesidad de GPU dedicada ni de configurar stacks de servido. Es adecuado por su tamano contenido (2,74 mil millones de parametros) y su compatibilidad nativa con Apple silicon.
- Evaluacion de tecnicas de cuantizacion: investigadores que estudian el compromiso entre tamano de checkpoint y divergencia KL pueden usar este artefacto como referencia en la frontera de Pareto, comparandolo con otras cuantizaciones del mismo modelo base.
- Generacion de texto en aplicaciones de escritorio para macOS: integracion del modelo en herramientas nativas de Mac mediante el runtime `uzu`, aprovechando la aceleracion en Apple silicon y evitando el envio de datos a servicios en la nube.
- Experimentacion con modelos de ~2,7B en entornos con memoria unificada limitada: el checkpoint de 14,0 GB en disco esta pensado para ejecutarse en equipos Apple con memoria unificada suficiente, lo que lo hace util para pruebas de conceptos sin infraestructura de servidor.
- Desarrollo de asistentes conversacionales offline: al ejecutarse localmente y sin dependencia de API, encaja en escenarios de privacidad estricta, siempre que se validen previamente las capacidades conversacionales del modelo base.
- Base para pipelines de evaluacion de calidad de cuantizaciones: equipos que necesitan comparar la degradacion de un modelo tras cuantizar pueden usar la mezcla de evaluacion documentada (agentico, SFT/contexto largo y chat) como plantilla metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la divergencia KL frente al checkpoint original, representada en la grafica `kl-vs-size.svg` de la model card, sin valores numericos explicitos en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 14,0 GB en disco; el consumo en memoria unificada durante la inferencia no se documenta.
- GPU recomendadas: la model card restringe el soporte a Apple silicon; no se mencionan GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no confirmada para RTX 4090 u otras GPU discretas; el runtime `uzu` solo soporta Apple silicon segun la documentacion enlazada.
- Opciones de despliegue: CLI `mirai` (instalable via Homebrew) y compilacion desde codigo fuente siguiendo la guia del repositorio `trymirai/uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trymirai/LFM2.5-2.6B-L | 2.740.774.912 | No disponible | 8-bit (uzu) | LFM Open License | Apple silicon via `uzu` |
| LiquidAI/LFM2.5-2.6B | No disponible en la informacion | No disponible | Original (sin cuantizar) | LFM Open License | Multiplataforma segun el autor original |
| Otras cuantizaciones del mismo base | No disponible | No disponible | No disponible | LFM Open License | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de plataforma: el runtime `uzu` solo soporta Apple silicon, lo que excluye su uso en servidores Linux con GPU NVIDIA, en Windows o en hardware AMD.
- Ecosistema cerrado: la libreria `uzu` no es un formato estandar como GGUF o safetensors convencional; la integracion con herramientas habituales (vLLM, llama.cpp, TGI) no esta documentada.
- Perdida de calidad por cuantizacion: aunque el autor reporta baja divergencia KL, toda cuantizacion de 8 bits introduce degradacion respecto al modelo original; no se ofrecen numeros absolutos de KL ni evaluaciones por tarea.
- Herencia de sesgos y alucinaciones: al ser una cuantizacion, reproduce los sesgos y el riesgo de alucinacion del modelo base LiquidAI/LFM2.5-2.6B, cuyas limitaciones no se detallan en esta ficha.
- Idiomas no documentados: no se especifica que lenguas soporta el modelo, lo que impide garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Restricciones de licencia: la LFM Open License puede imponer condiciones al uso comercial; es necesario revisar el texto completo en el repositorio de LiquidAI antes de desplegar en produccion.
- Madurez del proyecto: el repositorio tiene 429 descargas y 0 likes, y el runtime se encuentra en fase temprana (la guia de compilacion apunta a una rama `how-to`), lo que sugiere una API y un ecosistema aun inestables.
- Ausencia de benchmarks publicos: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones que permitan validar el rendimiento real del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/LFM2.5-2.6B-L
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Model card del base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/README.md
- Licencia LFM Open License: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Pagina del modelo en Mirai: https://trymirai.com/local-models/liquidai-lfm2-5-2-6b-mirai-mirai-l-8
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Guia de ejecucion de `uzu`: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
