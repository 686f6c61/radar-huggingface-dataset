# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd880-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd880-lora es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador se ha entrenado mediante un pipeline de dos fases: primero 2.800 actualizaciones de supervised fine-tuning (SFT) y después 880 actualizaciones de on-policy distillation (OPD), empleando el dataset uygarkurt/xlam-tool-calling-mixed. El objetivo declarado es ensenar al modelo a realizar tool calling estructurado y a abstenerse de invocar herramientas cuando las disponibles no son relevantes.

El modelo es relevante como ejemplo de experimentación reproducible de post-entrenamiento sobre un modelo muy pequeno (0,5B parámetros), combinando SFT con destilación on-policy desde un profesor congelado de mayor tamano (Qwen2.5-3B-Instruct). El repositorio contiene únicamente los pesos del adaptador (formato safetensors con PEFT), no el modelo completo, y requiere cargarlo sobre el modelo base original de Qwen.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la ficha, sin licencia declarada y sin model card detallada más allá de los resultados de evaluación del autor. Su interés es principalmente metodológico: muestra cómo la destilación on-policy puede alterar el comportamiento de abstención de un modelo pequeno, con efectos medibles tanto positivos como negativos en las métricas reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5B en el modelo base; tamano del adaptador LoRA no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; el autor menciona un límite de prompt de 640 tokens en la evaluación) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, cargable con PEFT/transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros del linaje Qwen2.5. El entrenamiento se ejecutó con la herramienta Post-Training Lab del propio autor. La primera fase consistió en 2.800 actualizaciones de SFT sobre el dataset uygarkurt/xlam-tool-calling-mixed, que entrena tool calling estructurado y abstención ante herramientas irrelevantes. La segunda fase continuó el adaptador SFT con 880 actualizaciones de on-policy distillation (OPD), en las que el estudiante aprende de las probabilidades por token del profesor congelado Qwen/Qwen2.5-3B-Instruct sobre sus propias respuestas generadas.

Los tiempos reportados son de bucle de entrenamiento, excluyendo carga de modelo, preparación de datos y evaluación externa: 0,4 horas para SFT y 0,3 horas para OPD, con un total de 0,7 horas. El adaptador SFT previo no es necesario por separado, ya que este repositorio integra ambas fases. No se detalla la composición del dataset, el número de tokens de entrenamiento ni hiperparámetros como rango del LoRA, learning rate o batch size.

## Capacidades

- Generación de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: el adaptador está específicamente entrenado para emitir llamadas a funciones en formato estructurado (evaluado con métricas xLAM ETC y FNA).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las ofrecidas no son pertinentes (subconjuntos Relevance/Irrelevance de BFCL).
- Razonamiento básico y matemáticas a nivel de modelo de 0,5B (MMLU 39,93%, MATH-500 17,80%).
- Seguimiento de instrucciones limitado (IFEval 30,13% en precisión estricta a nivel de prompt).
- Capacidades multilingües: no disponibles más allá del ingles declarado.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso.

## Casos de uso

- Prototipado de asistentes con tool calling en ingles: el adaptador permite experimentar con invocación de funciones estructuradas en un modelo de 0,5B, adecuado para validar pipelines de agentes antes de escalar a modelos mayores.
- Investigación en post-entrenamiento: sirve como caso reproducible de SFT + destilación on-policy desde un profesor de 3B, útil para estudiar el efecto de OPD en el comportamiento de abstención.
- Filtrado de llamadas a herramientas en entornos con recursos muy limitados: el modelo puede decidir si una consulta requiere invocar una función disponible o responder directamente, aunque con fiabilidad limitada (véase la caída en Irrelevance).
- Evaluación comparativa de adaptadores LoRA: al publicarse junto al adaptador SFT inicial, permite comparar el impacto de la fase OPD con las mismas métricas.
- Docencia y demostraciones de PEFT: el tamano reducido del modelo base y el adaptador facilitan ejecutar ejemplos en hardware de consumo.
- Generación de texto conversacional simple en ingles para tareas de baja exigencia, donde el coste computacional es prioritario sobre la calidad.
- No recomendado para producción con requisitos de fiabilidad, precisión o multilingüismo.

## Benchmarks y rendimiento

Resultados reportados por el autor (porcentajes). La primera fila es el adaptador SFT inicial; la segunda, el adaptador SFT + OPD de este repositorio.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT inicial | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 880 | 39,93% | 17,80% | 30,13% | 73,13% | 91,56% | 56,19% | 100,00% | 23,35% | 0,7 |

Notas del autor: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 omitidos por el límite de prompt de 640 tokens. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM usan scripts propios de Post-Training Lab.

Observación: la fase OPD mejora BFCL Single-turn FC (51,76% a 56,19%) y Relevance (83,33% a 100,00%), pero degrada Irrelevance (58,83% a 23,35%), xLAM ETC (75,88% a 73,13%) y xLAM FNA (95,76% a 91,56%). No se han publicado comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- El modelo base de 0,5B parámetros cabe holgadamente en GPUs de consumo: en FP16 ocupa aproximadamente 1 GB de VRAM, y en cuantizaciones de 4 bits por debajo de 0,5 GB.
- El adaptador LoRA anade un coste de memoria marginal (tamano exacto no disponible).
- GPUs recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para el modelo base en FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y sobredimensionadas para este tamano.
- Cabe en CPU y en GPUs integradas para inferencia lenta; en GPU de consumo la latencia es muy baja.
- Opciones de despliegue: transformers + PEFT (requerido para cargar el adaptador), y tras fusionar el adaptador, vLLM, llama.cpp, Ollama o TGI con el modelo base convertido a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | 0,5B + LoRA | No disponible | Entrenado específicamente (BFCL FC 56,19%) | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens (según el modelo base) | No específicamente entrenado | Apache 2.0 (según el modelo base) | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens (según el modelo base) | Soporte general de tool calling | Apache 2.0 (según el modelo base) | Hugging Face |

No se dispone de datos de benchmark del modelo base ni del profesor en la información proporcionada, por lo que la comparación cuantitativa directa no es posible. La licencia del adaptador no está declarada, lo que impide confirmar si hereda o restringe los términos del modelo base.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; debe verificarse con el autor.
- Solo ingles declarado; sin capacidades multilingües documentadas.
- Modelo de 0,5B parámetros: rendimiento bajo en conocimiento general (MMLU 39,93%), matemáticas (MATH-500 17,80%) y seguimiento de instrucciones (IFEval 30,13%).
- La fase OPD degrada notablemente la abstención ante herramientas irrelevantes (Irrelevance cae de 58,83% a 23,35%), lo que aumenta el riesgo de invocar funciones no pertinentes.
- Riesgo de alucinación elevado por el tamano reducido del modelo base; no se han publicado evaluaciones de seguridad ni de sesgos.
- Límite de prompt de 640 tokens aplicado en la evaluación xLAM, con 743 ejemplos omitidos; los resultados no cubren contextos largos.
- Las métricas BFCL son agregados específicos del estudio, no comparables directamente con puntuaciones oficiales del benchmark.
- Repositorio sin descargas ni validación comunitaria; artefacto de investigación sin garantías de robustez en producción.
- Requiere cargar el adaptador sobre el modelo base Qwen2.5-0.5B-Instruct; no es un modelo autónomo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd880-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
