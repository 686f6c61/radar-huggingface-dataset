# talhasial/urdu-gemma-270m-pos-base

## Resumen

`talhasial/urdu-gemma-270m-pos-base` es un adaptador LoRA para etiquetado de categorías gramaticales (POS, *part-of-speech*) en urdu, construido sobre el modelo base `google/gemma-3-270m`. Lo desarrolla Muhammad Talha Sial en el marco de su tesis de máster *Exploiting large language models for improvements in Urdu NLP* (Universidad Masaryk, 2026). El adaptador se entrena sobre el modelo base sin adaptar (brazo "base" del experimento 2 de la tesis) y su función concreta es la asignación de etiquetas UPOS (Universal Part-of-Speech) a tokens de una frase en urdu.

El modelo no es un LLM de propósito general, sino un adaptador especializado de tamaño muy reducido (el backbone tiene 270 millones de parámetros) que se distribuye como pesos PEFT en formato safetensors. La tarea se formula como generación de texto con un formato de salida concreto: `palabra/ETIQUETA palabra/ETIQUETA ...`, con decodificación greedy. El contexto de entrenamiento se limita a 512 tokens.

Su relevancia es la de un recurso de investigación: demuestra que un modelo Gemma 3 de 270M parámetros, ajustado con LoRA sobre un treebank de urdu (UD_Urdu-UDTB), puede abordar una tarea lingüística estructurada con un coste computacional mínimo. No está pensado para uso comercial ni para despliegue en producción general, sino como artefacto reproducible de un estudio académico sobre NLP en urdu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-3-270m` (transformer decoder-only) |
| Parametros totales | 270M en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (configuración de entrenamiento/inferencia indicada) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso carga en 4 bits desactivado, `load_in_4bit=False`) |
| Idiomas soportados | Urdu (`ur`) |
| Licencia | `other`: Gemma Terms of Use + CC BY-NC-SA 4.0 del dataset; uso no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-270m`, un transformer decoder-only de la familia Gemma 3. El ajuste se realiza con LoRA de rango r=16 y tasa de aprendizaje 2e-4, durante 5 épocas, conservando el checkpoint con menor pérdida de validación. El entrenamiento se ejecuta con Unsloth (según el ejemplo de uso de la model card) y el adaptador se distribuye como pesos PEFT compatibles con la librería `peft`.

Los datos de entrenamiento provienen del treebank UD_Urdu-UDTB (datos de UD v2.14), con 4.043 frases de entrenamiento. La tarea es UPOS tagging, formulada como generación: se proporciona un prompt `Tag: <frase>` y el modelo debe emitir la secuencia `palabra/ETIQUETA` separada por espacios. No se documentan en la información disponible detalles sobre composición adicional del dataset, uso de RLHF/DPO ni innovaciones técnicas más allá del propio ajuste LoRA.

## Capacidades

- Etiquetado UPOS de frases en urdu: asigna una categoría gramatical universal a cada token de entrada.
- Generación de texto estructurado en el formato `palabra/ETIQUETA palabra/ETIQUETA ...` con decodificación greedy.
- Procesamiento de entradas de hasta 512 tokens.
- Especialización monolingüe en urdu; no se documentan capacidades multilingües.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades de generación libre, código o matemáticas; el adaptador está orientado exclusivamente a la tarea de POS tagging.

## Casos de uso

- Anotación lingüística de corpus en urdu: el adaptador permite etiquetar automáticamente frases con categorías UPOS, útil para preanotar corpus antes de revisión humana en proyectos de lingüística computacional.
- Investigación en NLP de bajos recursos: sirve como línea base reproducible para comparar estrategias de ajuste (LoRA vs. ajuste completo, modelo base vs. adaptado) en tareas de etiquetado secuencial para urdu.
- Enseñanza y experimentación académica: su tamaño reducido (270M) y su naturaleza de adaptador permiten ejecutarlo en entornos con recursos limitados para demostrar pipelines de PEFT con Unsloth y `peft`.
- Preprocesamiento para pipelines de NLP en urdu: la salida POS puede alimentar etapas posteriores como análisis sintáctico, extracción de entidades o sistemas de traducción que requieran información morfosintáctica.
- Evaluación de modelos pequeños en tareas estructuradas: permite estudiar hasta qué punto un modelo de 270M parámetros puede resolver una tarea de etiquetado token a token frente a modelos mayores.
- Reproducción de experimentos de tesis: el repositorio de código asociado permite replicar el experimento 2 (brazo base) y compararlo con otras variantes del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un backbone de 270M parámetros, la inferencia en precisión completa requiere del orden de 1-2 GB, y en 4 bits menos de 1 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder ejecutar el modelo base.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con al menos 2-4 GB de VRAM, aunque el autor no lo especifica.
- Opciones de despliegue: el ejemplo oficial usa Unsloth (`FastLanguageModel`) junto con `peft.PeftModel`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `talhasial/urdu-gemma-270m-pos-base` | 270M (base) + LoRA | 512 | UPOS tagging en urdu | Gemma Terms + CC BY-NC-SA 4.0 (no comercial) | Hugging Face (adaptador PEFT) |
| `google/gemma-3-270m` | 270M | No disponible en esta ficha | LLM generalista | Gemma Terms of Use | Hugging Face |
| Alternativas específicas de POS tagging para urdu | No disponible | No disponible | POS tagging | No disponible | No disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma tesis o de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo realiza UPOS tagging en urdu; no debe emplearse como modelo de propósito general.
- Contexto limitado a 512 tokens, insuficiente para documentos largos sin fragmentación.
- Entrenado sobre un único treebank (UD_Urdu-UDTB, 4.043 frases); el rendimiento fuera de ese dominio o registro no está documentado.
- Riesgo de alucinación y de formato incorrecto: al ser un modelo generativo, puede producir etiquetas no válidas o desalinear tokens si la entrada se sale del formato esperado.
- Licencia no comercial: el adaptador hereda las Gemma Terms of Use y la licencia CC BY-NC-SA 4.0 del dataset, por lo que no se permite uso comercial.
- Sin métricas publicadas: no hay resultados de evaluación (accuracy, F1) en la información disponible, lo que impide valorar su calidad objetiva.
- Repositorio sin descargas ni likes y tamaño de 0.0 GB según Hugging Face; verificar la integridad de los pesos antes de usarlo.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Hugging Face: https://huggingface.co/talhasial/urdu-gemma-270m-pos-base
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Repositorio de código y evaluación: https://github.com/543516-collab/urdu-gemma-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Treebank UD_Urdu-UDTB (UD v2.14): no disponible enlace directo en la información proporcionada
