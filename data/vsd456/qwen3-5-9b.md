# vsd456/Qwen3.5-9B

## Resumen

Qwen3.5-9B es un modelo de lenguaje causal multimodal con codificador de vision, desarrollado dentro de la familia Qwen3.5 de Alibaba. El repositorio analizado, `vsd456/Qwen3.5-9B`, es un ajuste fino publicado por el usuario vsd456 sobre los pesos base `Qwen/Qwen3.5-9B-Base`, distribuido bajo licencia Apache 2.0 y compatible con el pipeline `image-text-to-text` de Hugging Face. Cuenta con 9.653.104.368 parametros reales (segun safetensors) y un tamano de repositorio de 19,3 GB.

La propuesta tecnica de Qwen3.5 combina una arquitectura hibrida de atencion lineal (Gated DeltaNet) y atencion completa con compuertas (Gated Attention), junto con entrenamiento de fusion temprana de tokens multimodales para igualar el rendimiento de la generacion Qwen3 en texto y superar a los Qwen3-VL en comprension visual. El modelo declara una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y soporte de 201 idiomas y dialectos.

Su relevancia actual reside en ofrecer capacidades multimodales y de razonamiento en un tamano de 9B, lo que permite desplegarlo en hardware relativamente modesto, con soporte declarado para Transformers, vLLM, SGLang y KTransformers. No obstante, se trata de un repositorio con cero descargas y cero likes en el momento de la ficha, y su model card replica en gran medida el contenido de la publicacion original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; hibrida de Gated DeltaNet (atencion lineal) y Gated Attention, con FFN y MTP |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no disponible (la model card menciona MoE disperso, pero no especifica el numero de parametros activos) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no se enumeran en la informacion proporcionada; el repo esta en safetensors) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos arquitectonicos adicionales declarados: dimension oculta 4096; 32 capas; token embedding de 248.320 (con padding); layout oculto 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); Gated DeltaNet con 32 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128; Gated Attention con 16 cabezas para Q y 4 para KV, dimension de cabeza 256 y dimension de RoPE 64; FFN con dimension intermedia 12.288; salida LM de 248.320 (con padding); MTP entrenado con multiples pasos.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que alterna bloques de Gated DeltaNet, una forma de atencion lineal con estado recurrente, y bloques de Gated Attention convencional. Segun la disposicion declarada, por cada cuatro sub-bloques, tres corresponden a Gated DeltaNet seguido de FFN y uno a Gated Attention seguido de FFN, repetido ocho veces a lo largo de 32 capas. Esta combinacion busca alto rendimiento de inferencia con baja latencia y coste reducido, especialmente en contextos largos, donde la atencion lineal limita el crecimiento del coste asociado a la atencion cuadratica. El modelo incorpora ademas un modulo MTP (Multi-Token Prediction) entrenado con multiples pasos.

En cuanto al entrenamiento, la model card indica que paso por pre-entrenamiento y post-entrenamiento. La familia Qwen3.5 declara fusion temprana sobre tokens multimodales, con paridad entre generaciones respecto a Qwen3 y mejoras sobre Qwen3-VL en razonamiento, codigo, agentes y comprension visual. Tambien menciona escalado de aprendizaje por refuerzo sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100% respecto al entrenamiento solo de texto. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas como RLHF o DPO, mas alla de la referencia generica a RL.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline `conversational`.
- Comprension de imagen y texto de forma conjunta (pipeline `image-text-to-text`), gracias al codificador de vision.
- Razonamiento, codigo y matematicas, segun las categorias de benchmark declaradas (Knowledge & STEM) y las afirmaciones de la model card.
- Comprension visual: la model card afirma superar a los Qwen3-VL en benchmarks de comprension visual.
- Soporte multilingue amplio: 201 idiomas y dialectos declarados.
- Capacidades orientadas a agentes: la model card menciona entrenamiento RL sobre entornos multiagente y orquestacion de entornos a gran escala.
- Prediccion multi-token (MTP) entrenada con multiples pasos.
- Contexto largo: hasta 262.144 tokens nativos y 1.010.000 extensibles.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto nativo, el modelo puede procesar manuales, informes o expedientes completos sin fragmentacion, manteniendo coherencia entre secciones distantes.
- Atencion al cliente multimodal: permite recibir capturas de pantalla o fotografias junto al texto del usuario y responder en el mismo hilo conversacional, aprovechando el pipeline `image-text-to-text`.
- Extraccion de informacion de imagenes: lectura de tablas, formularios o etiquetas en imagenes y conversion a texto estructurado, util en digitalizacion de documentos.
- Asistencia de codigo en pipelines de desarrollo: generacion y explicacion de codigo en entornos con contexto de repositorio largo, apoyandose en la ventana de 262k tokens.
- Despliegue multilingue: aplicaciones de traduccion o asistencia en cualquiera de los 201 idiomas declarados, con un unico modelo en lugar de varios especializados.
- Razonamiento sobre conocimiento tecnico y STEM: resolucion de problemas de matematicas y ciencia, ambito en el que el modelo declara resultados competitivos en MMLU-Pro.
- Agentes autonomos y tareas multi-paso: la model card menciona entrenamiento RL sobre entornos de agentes, lo que lo hace candidato para flujos con herramientas y planificacion.
- Procesamiento en el borde o en servidores modestos: al ser un modelo de 9B, puede ejecutarse en GPUs de gama alta de consumo con cuantizacion, habilitando despliegues locales.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa. De la informacion extraida, los datos completos disponibles son los siguientes:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en la informacion extraida | no disponible en la informacion extraida |

La model card referencia categorias adicionales (Knowledge & STEM y otras) y una grafica de resultados (`qwen3.5_small_size_score.png`), pero el resto de filas y valores no esta disponible en la informacion proporcionada. No se han publicado en esta ficha resultados de HumanEval, GSM8K u otros benchmarks al no estar presentes en los datos extraidos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 9,65B parametros, no confirmada por el autor):
  - FP16/BF16: aproximadamente 19-20 GB solo para pesos.
  - INT8: aproximadamente 10-11 GB.
  - INT4: aproximadamente 5-6 GB.
- A tener en cuenta: el contexto de 262.144 tokens incrementa el consumo de memoria por cache KV; la componente de atencion lineal (Gated DeltaNet) reduce ese coste respecto a un transformer de atencion completa equivalente, aunque no se dispone de cifras concretas.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar GPUs de 24 GB o mas (RTX 3090, RTX 4090, A10G, L40S) para FP16, y GPUs de 8-16 GB con cuantizacion INT4.
- Cabe en GPU de consumo: probablemente si, con cuantizacion (serie RTX xx90/xx80 con 10-24 GB), aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: la model card cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. Otros runners como llama.cpp, Ollama o TGI no se mencionan en la informacion disponible; la existencia de formatos GGUF no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (este repo) | 9,65B | 262.144 nativo / 1.010.000 extensible | 82,5 | Apache 2.0 | Hugging Face (safetensors, transformers) |
| Qwen3.5-4B | ~4B (no confirmado en la informacion) | no disponible | 79,1 | Apache 2.0 (segun la familia) | Hugging Face |
| GPT-OSS-20B | 20B (nominal) | no disponible | 74,8 | no disponible en la informacion | no disponible en la informacion |
| GPT-OSS-120B | 120B (nominal) | no disponible | 80,8 | no disponible en la informacion | no disponible en la informacion |
| Qwen3-30BA3B-Thinking-2507 | 30B totales / 3B activos (segun nomenclatura) | no disponible | 80,9 | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita a los datos presentes en la model card; no se dispone de informacion de licencia, contexto o formatos de los modelos competidores mas alla de lo indicado.

## Limitaciones y advertencias

- Repositorio sin traccion: cero descargas y cero likes en el momento de la ficha, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Es un ajuste fino publicado por un usuario (vsd456) sobre `Qwen/Qwen3.5-9B-Base`; la model card replica el contenido de la publicacion original de Qwen, por lo que no queda claro que diferencias introduce este ajuste respecto al modelo base.
- Inconsistencia en la documentacion: los "highlights" mencionan un Mixture-of-Experts disperso, pero la seccion "Model Overview" describe un unico tamano de FFN sin detallar numero de expertos ni parametros activos. Debe verificarse antes de asumir comportamiento MoE.
- Los resultados de benchmarks corresponden a la familia Qwen3.5 tal como se publican; no se confirma que el ajuste de vsd456 los reproduzca.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; inherente a los modelos generativos de este tamano.
- Sesgos: no documentados por el autor en la informacion disponible.
- Idiomas: se declaran 201 idiomas y dialectos, pero no se aportan metricas por idioma, por lo que el rendimiento real en lenguas minoritarias es desconocido.
- Licencia Apache 2.0: permite uso comercial, pero el campo `license_link` apunta al fichero LICENSE del repositorio oficial de Qwen, no al de este fork; conviene verificar la procedencia de los pesos base.
- Contexto largo: la extension hasta 1.010.000 tokens se declara como capacidad, pero no se aportan resultados de benchmarks especificos de contexto largo en la informacion disponible.
- Compatibilidad de cuantizacion y formatos GGUF: no confirmada.
- Fecha de creacion y actualizacion del repositorio: 23 de septiembre de 2026, sin actualizaciones posteriores registradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vsd456/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
