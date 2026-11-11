# trymirai/LFM2.5-1.2B-Instruct-M

## Resumen

LFM2.5-1.2B-Instruct-M es una cuantizacion de tamano medio ("Medium") del modelo LFM2.5-1.2B-Instruct de Liquid AI, preparada por trymirai (Mirai Labs) para inferencia local eficiente en silicio de Apple. El modelo base pertenece a la familia LFM2.5 de Liquid AI, disenada para generacion de texto con un equilibrio entre calidad y coste computacional en el extremo de menor tamano del catalogo. La cuantizacion reduce el checkpoint a 4 bits asimetricos manteniendo escalas en bfloat16.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion post-entrenamiento combinada con destilacion consciente de cuantizacion (quantization-aware distillation), y por otro ilustra el ecosistema emergente de runtimes alternativos orientados a hardware de consumo. El autor declara que el checkpoint se situa en la frontera de Pareto tamano-divergencia KL, es decir, que no encontro otro checkpoint mas pequeno con menor divergencia respecto al modelo original.

El artefacto no es un modelo nuevo entrenado desde cero, sino una version comprimida del modelo de Liquid AI. Cualquier evaluacion de capacidades, sesgos o limites de uso debe remitirse al modelo base; esta ficha recoge los datos disponibles y senala explicitamente los que no lo estan. El numero de parametros reportado en el repositorio de safetensors es de 613.300.992, inferior al "1.2B" del nombre comercial, lo que conviene tener en cuenta al estimar requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-1.2B-Instruct; no detallada en la informacion proporcionada) |
| Parametros totales | 613.300.992 (segun safetensors del repo); el nombre comercial indica 1.2B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit asimetrica entera con zero points de 4 bits, escalas bfloat16, group size 64; el repo incluye tags de 4-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (licencia del modelo base, enlazada desde el repo) |
| Formato de pesos | safetensors (libreria `uzu`) |
| Tamano del repositorio | 3.2 GB |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Relacion con el base | quantized |
| Pipeline | text-generation |
| Libreria | uzu |
| Descargas / likes | 368 / 0 |
| Fechas | creado 2026-08-23, actualizado 2026-11-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base LFM2.5-1.2B-Instruct de Liquid AI; la informacion proporcionada no detalla el tipo de bloque (transformer, MoE, SSM o hibrido), el numero de capas ni la composicion del dataset de preentrenamiento. Tampoco se documentan aqui las fases de alineacion (RLHF, DPO u otras) del modelo original, por lo que deben consultarse en su model card.

El proceso propio de esta ficha es la cuantizacion. Mirai Medium aplica cuantizacion entera asimetrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 64. Para mitigar los valores atipicos en activaciones y pesos, el autor emplea transformadas de Hadamard aleatorias de bloque diagonal (Block-diagonal Random Hadamard Transforms). El pipeline es post-training quantization seguido de destilacion consciente de cuantizacion, un esquema en el que el estudiante cuantizado se ajusta para reproducir el comportamiento del modelo en precision completa, no solo sus etiquetas.

La evaluacion del checkpoint se realizo sobre una mezcla declarada de 45% datos publicos de tipo agentico, 30% datos publicos de SFT y contexto largo, y 25% datos privados de chat. El autor publica una grafica de divergencia KL frente al tamano del checkpoint y afirma que no existe un checkpoint menor con menor KL dentro de su busqueda. Estos datos son declaraciones del autor y no se acompanan de cifras numericas en la informacion disponible.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, heredado del modelo instruct base.
- Seguimiento de instrucciones: el sufijo Instruct del modelo base indica ajuste para dialogos y tareas guiadas por prompt.
- Razonamiento multi-turno: la mezcla de evaluacion incluye datos agenticos y de contexto largo, lo que sugiere soporte para conversaciones extensas y flujos de varios pasos, aunque no se publican cifras de ventana de contexto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no confirmado explicitamente; los datos agenticos de evaluacion son un indicio, no una garantia.
- Modo thinking, vision o audio: no disponibles.
- Inferencia local en Apple silicon: capacidad operativa diferencial de esta ficha, mediante el runtime `uzu` y la CLI `mirai`.

## Casos de uso

- Prototipado local en Mac: desarrolladores que quieran iterar sobre prompts y flujos de generacion sin depender de API externa pueden ejecutar `mirai --model trymirai/LFM2.5-1.2B-Instruct-M` en un equipo Apple silicon y validar ideas antes de escalar a infraestructura.
- Asistentes de escritorio con privacidad por diseno: al ejecutarse integramente en local, el modelo es adecuado para resumir documentos o redactar correos sobre material sensible que no debe salir del portatil.
- Evaluacion de cuantizaciones: investigadores que comparen tecnicas de compresion pueden usar este checkpoint como referencia de la frontera tamano-KL declarada por el autor y contrastarla con sus propias mediciones.
- Demos y ensenanza: el peso reducido (3.2 GB de repo) y el despliegue en una sola linea de comando lo hacen util en talleres y clases donde no hay GPUs disponibles.
- Chat de soporte en entornos sin conectividad: escenarios de campo o industriales con red intermitente pueden alojar el modelo en un portatil Apple y ofrecer respuestas guiadas con conocimiento inyectado en el prompt.
- Experimentacion agentica acotada: dado que la mezcla de evaluacion incluye un 45% de datos agenticos, es un candidato razonable para prototipos de agentes con herramientas en local, siempre validando el soporte real de tool calling sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta cualitativamente la posicion del checkpoint en la frontera de Pareto de divergencia KL frente a tamano, sin tablas de puntuaciones.

| Metrica | Resultado | Fuente |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Divergencia KL vs. base | reportada graficamente, sin cifra | model card del autor |
| Mezcla de evaluacion | 45% agentico publico / 30% SFT y contexto largo / 25% chat privado | model card del autor |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo pesa 3.2 GB, por lo que la inferencia en 4 bits deberia caber holgadamente en equipos con 8 GB de memoria unificada o mas; no se publica una cifra oficial de consumo en ejecucion.
- Plataforma soportada: exclusivamente Apple silicon segun la model card ("Currently only Apple silicon inference is supported").
- GPU NVIDIA/AMD: no soportadas por el runtime `uzu` en la informacion disponible; no se documenta despliegue en A100, H100 ni RTX 4090.
- GPU de consumo: cabe en equipos Apple con memoria unificada; no hay datos para GPUs discretas de consumo.
- Opciones de despliegue: CLI `mirai` (instalable via Homebrew) y compilacion desde el repositorio `uzu` del autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/LFM2.5-1.2B-Instruct-M | 613.300.992 (safetensors) | no disponible | 4-bit asimetrica + destilacion | lfm-open-license | Apple silicon (`uzu`) |
| LiquidAI/LFM2.5-1.2B-Instruct | no disponible en esta busqueda | no disponible | pesos originales | lfm-open-license | multiple |
| Otras cuantizaciones del mismo base (GGUF, etc.) | no disponible | no disponible | 4/8-bit | segun autor | llama.cpp y similares |

La comparacion cuantitativa con alternativas no es posible con la informacion proporcionada: no se dispone de cifras de benchmarks del checkpoint ni del modelo base, y no se identifican en la busqueda otros checkpoints comparables con datos publicados.

## Limitaciones y advertencias

- Dependencia de plataforma: solo funciona en Apple silicon con el runtime `uzu`; no es portable a servidores GPU convencionales sin conversion adicional.
- Perdida de calidad por cuantizacion: aunque el autor reporta una buena relacion tamano-KL, la cuantizacion a 4 bits introduce degradacion frente al modelo en precision completa, especialmente en tareas de razonamiento largo.
- Datos incompletos: no se publican contexto, idiomas, arquitectura ni benchmarks, lo que impide una evaluacion de riesgos rigurosa antes de produccion.
- Licencia: hereda la lfm-open-license del modelo base; es necesario revisar sus terminos exactos antes de uso comercial, ya que la model card no los resume.
- Sesgos y alucinacion: no documentados en la informacion disponible; deben asumirse los del modelo base y validarse con pruebas propias.
- Madurez: 368 descargas y 0 likes indican un artefacto de nicho con poca validacion comunitaria; conviene tratarlo como experimental.
- Confusion de parametros: el nombre comercial dice 1.2B pero el recuento de safetensors es de 613 millones, por lo que las estimaciones de recursos basadas en el nombre pueden estar sobredimensionadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/LFM2.5-1.2B-Instruct-M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Model card del base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/README.md
- Licencia del base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Pagina del modelo en Mirai: https://trymirai.com/local-models/liquidai-lfm2-5-1-2b-instruct-mirai-mirai-m-4
- Repositorio del runtime `uzu`: https://github.com/trymirai/uzu
- Guia de ejecucion: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
