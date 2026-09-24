# Vhicktour/llama3.1-heretic-unsensored

## Resumen

Vhicktour/llama3.1-heretic-unsensored es una variante «decensored» (abliterated) de dphn/Dolphin3.0-Llama3.1-8B, generada automáticamente con la herramienta Heretic v1.3.0. El modelo conserva la arquitectura y los pesos del fine-tune Dolphin 3.0 sobre Llama 3.1 8B de Meta, pero se han modificado direcciones concretas del espacio de activaciones para eliminar la conducta de rechazo (refusals) aprendida durante el ajuste por instrucciones. El resultado declarado por el autor es de 0 rechazos en 100 peticiones de prueba, frente a 27 de 100 en el modelo original, con una divergencia KL de 0,0082 respecto a este.

Se trata de un transformer decoder-only denso de 8.030.277.632 parámetros (8B), con la ventana de contexto de 128.000 tokens heredada de Llama 3.1 8B, pesos en safetensors y licencia Llama 3.1. El idioma declarado es únicamente inglés. El repositorio ocupa 16,1 GB y, en el momento de la consulta, registra 0 descargas y 0 «likes», por lo que no existe validación independiente de la comunidad.

Su relevancia es doble: por un lado, es un artefacto de investigación sobre técnicas de abliteración y evaluación de rechazos; por otro, al publicar los parámetros exactos de abliteración (direction_index, pesos por capa y proyección), el autor lo presenta como un experimento reproducible, algo poco habitual en este tipo de variantes. Conviene tener presente que las métricas de la model card corresponden al modelo Dolphin 3.0 original, no a una reevaluación tras la abliteración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Llama 3.1 8B (sin modificar estructuralmente) |
| Parámetros totales | 8.030.277.632 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantización | No disponible en el repositorio (solo pesos safetensors; no se distribuyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 (llama3.1) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B, con fine-tune intermedio dphn/Dolphin3.0-Llama3.1-8B |
| Método de modificación | Abliteración con Heretic v1.3.0 |
| Tamaño del repositorio | 16,1 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación registrada | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only con normalización RMSNorm previa, activación SwiGLU en el MLP, RoPE para codificación posicional y atención con grouped-query attention (GQA). No hay cambios estructurales, de tokenizador ni de número de capas respecto al modelo base; la intervención se realiza en el espacio de pesos/activaciones. La ventana de contexto utilizable es de 128.000 tokens, tal como se define en Llama 3.1.

El entrenamiento subyacente corresponde a Dolphin 3.0, un ajuste supervisado (SFT) sobre Llama 3.1 8B. La model card enumera trece conjuntos de datos: OpenCoder opc-sft-stage1 y stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback. No se documenta en la información disponible si hubo fases de RLHF, DPO u otros métodos de alineación posteriores al SFT.

La innovación técnica de esta variante es la abliteración con Heretic v1.3.0, que localiza y atenúa la dirección de rechazo en las proyecciones attn.o_proj y mlp.down_proj mediante pesos por posición y distancia. Los parámetros publicados son: direction_index 18,47; attn.o_proj.max_weight 1,37 en la posición 24,23 y min_weight 1,34 a distancia 17,25; mlp.down_proj.max_weight 0,98 en la posición 30,68 y min_weight 0,70 a distancia 17,75. El autor indica que el proceso es reproducible y remite al directorio `reproduce/` del repositorio.

## Capacidades

- Generación de texto en inglés con formato conversacional de instrucciones, heredada del ajuste Dolphin 3.0.
- Razonamiento de varios pasos y resolución de problemas matemáticos, con datos de entrenamiento específicos (NuminaMath-CoT, NuminaMath-TIR, orca-math-word-problems-200k).
- Generación y edición de código, con base en OpenCoder SFT, dolphin-coder, CodeFeedback-Filtered-Instruction y Code-Feedback.
- Tool calling / function calling, dado que el mix de entrenamiento incluye NousResearch/hermes-function-calling-v1, un conjunto específicamente orientado a llamadas a funciones.
- Comportamiento agéntico y seguimiento de instrucciones multi-turno (microsoft/orca-agentinstruct-1M-v1, allenai/tulu-3-sft-mixture).
- Conversación abierta y diálogo de carácter (smoltalk, samantha-data).
- Ausencia de rechazos ante peticiones que el modelo original declinaba: 0/100 rechazos declarados frente a 27/100 del modelo original.
- Contexto largo de hasta 128.000 tokens para resumir, consultar o razonar sobre documentos extensos.
- No dispone de capacidades de visión, audio ni multimodalidad; es un modelo exclusivamente de texto.
- No se documenta un modo de razonamiento explícito (thinking mode) ni decodificación especulativa propia.

## Casos de uso

- Investigación en seguridad y red teaming: sirve como sujeto de prueba para medir la eficacia de mecanismos de rechazo y estudiar qué se pierde y qué se gana al aplicar abliteración, comparando sus 0/100 rechazos con los 27/100 del modelo original.
- Reproducibilidad de experimentos de abliteración: al publicar los parámetros de Heretic v1.3.0 y un directorio `reproduce/`, permite replicar el procedimiento sobre Dolphin 3.0 y comparar divergencias KL entre configuraciones.
- Generación de datos sintéticos en dominios sensibles: en la creación de corpus de entrenamiento sobre temas como seguridad, toxicidad, medicina o ficción adulta, donde los modelos alineados estándar rechazan generar ejemplos y sesgan el dataset resultante.
- Escritura creativa y narrativa sin restricciones temáticas: relatos, guiones o diálogos de personajes que abordan violencia, moral ambigua o conflictos explícitos, donde el modelo mantiene la coherencia estilística del fine-tune Dolphin.
- Asistencia a programadores en pipelines internos: con soporte de function calling y contexto de 128.000 tokens, puede integrarse en herramientas de revisión de código o generación de tests sobre repositorios completos, siempre que el contenido no requiera moderación externa.
- Tutoría y resolución de problemas matemáticos: uso del modelo para generar cadenas de razonamiento paso a paso y problemas resueltos, aprovechando los conjuntos NuminaMath del entrenamiento.
- Agentes conversacionales multi-turno de dominio cerrado: atención o asistencia técnica interna donde el contexto largo permite mantener el historial completo de la conversación sin truncar.
- Análisis y resumen de documentación extensa: contratos, informes técnicos o literatura científica de hasta 128.000 tokens en inglés, en escenarios donde el filtrado de contenido laxo es aceptable.

## Benchmarks y rendimiento

Los siguientes valores proceden del bloque `model-index` de la model card y están declarados bajo el nombre «Dolphin3.0-Llama3.1-8B». Son, por tanto, métricas del modelo Dolphin 3.0 original, no una reevaluación del modelo abliterado. El campo `verified` figura como falso y no se han publicado resultados propios de la abliteración.

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | averaged accuracy (strict) | 76,21 |
| BBH | 3-shot | acc_norm | 27,63 |
| MATH Lvl 5 | 4-shot | exact_match | 10,50 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 8,97 |
| MMLU-PRO | 5-shot | accuracy | 22,13 |

Métricas de la abliteración declaradas por el autor:

| Métrica | Este modelo | Modelo original (dphn/Dolphin3.0-Llama3.1-8B) |
|---|---|---|
| Divergencia KL | 0,0082 | 0 (por definición) |
| Rechazos | 0/100 | 27/100 |

No se han publicado datos de latencia, throughput ni resultados de HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Pesos completos en safetensors (BF16): aproximadamente 16 GB solo de pesos; con caché KV y overhead de runtime conviene reservar 20-24 GB de VRAM.
- Cuantización de 8 bits: aproximadamente 8-9 GB de VRAM, viable en GPU de 12 GB con contexto moderado.
- Cuantización de 4 bits (Q4_K_M y similares): aproximadamente 5-6 GB de VRAM, cabe en GPU de consumo de 8 GB con contexto reducido; el contexto de 128.000 tokens incrementa mucho el consumo de caché KV.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para BF16 en uso individual; A100 40/80 GB, H100 80 GB o L40S para servicio concurrente.
- Sí cabe en GPU de consumo: RTX 4090, 3090, 4080, 4070 Ti y, con cuantización agresiva, GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, SGLang y Transformers para los pesos safetensors; llama.cpp, Ollama o LM Studio requieren convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rechazos | Resultados publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| Vhicktour/llama3.1-heretic-unsensored | 8,03B | 128.000 | Llama 3.1 | 0/100 (declarado) | No reevaluado; hereda el model-index de Dolphin 3.0 | safetensors; 0 descargas |
| dphn/Dolphin3.0-Llama3.1-8B | 8B | 128.000 | Llama 3.1 | 27/100 (declarado) | IFEval 76,21; BBH 27,63; MATH Lvl 5 10,50; GPQA 4,36; MuSR 8,97; MMLU-PRO 22,13 | safetensors |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 | No disponible | No disponible en la información proporcionada | safetensors |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128.000 | Llama 3.1 | No disponible | No disponible en la información proporcionada | safetensors |

La diferencia principal frente a los tres alternativas es la conducta de rechazo casi nula y el método explícito y documentado de abliteración; en parámetros, contexto y licencia, los cuatro modelos son equivalentes al compartir la base Llama 3.1 8B.

## Limitaciones y advertencias

- La abliteración elimina de forma deliberada los mecanismos de rechazo: el modelo puede producir contenido dañino, ilegal, sexual explícito o peligroso sin filtrar. No debe exponerse a usuarios finales sin una capa de moderación externa.
- Las métricas de benchmarks de la model card no corresponden a este modelo, sino a Dolphin 3.0; no hay ninguna evaluación posterior a la abliteración que cuantifique la posible degradación en razonamiento, matemáticas o coherencia.
- La divergencia KL de 0,0082 es pequeña pero no nula, lo que implica que la distribución de salida se ha desplazado respecto al modelo original; el efecto acumulado en tareas largas o de razonamiento no está medido.
- Riesgo de alucinación: es un modelo de 8B ajustado por SFT, sin verificación factual; las cifras, citas y referencias que genere deben validarse siempre.
- Sesgos conocidos: hereda los sesgos de Llama 3.1 8B y del mix de datos de Dolphin 3.0; la abliteración no corrige sesgos, y en algunos casos puede amplificarlos al desaparecer la cautela del modelo.
- Soporte exclusivamente en inglés: no se declaran otros idiomas, por lo que el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Llama 3.1: uso comercial permitido con condiciones (atribución «Built with Llama», inclusión de la licencia, restricciones de uso aceptable y cláusula de terminación para productos con más de 700 millones de usuarios mensuales). Es responsabilidad del desplegador cumplir la política de uso aceptable, que prohíbe usos que este modelo puede facilitar con facilidad.
- Repositorio sin tracción: 0 descargas y 0 «likes», sin issues ni validación comunitaria; no hay garantía de mantenimiento ni de que los pesos se correspondan con los resultados declarados.
- El `model-index` etiqueta los resultados bajo el nombre «Dolphin3.0-Llama3.1-8B», lo que puede inducir a confusión en herramientas que indexen la model card automáticamente.
- No se proporcionan pesos cuantizados ni ficheros GGUF; cualquier despliegue ligero exige conversión propia, con el consiguiente riesgo de degradación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vhicktour/llama3.1-heretic-unsensored
- Modelo base del abliterado: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- README de reproducibilidad incluido en el repositorio: `reproduce/README.md`
- Colección Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
