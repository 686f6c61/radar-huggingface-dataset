# ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale1000

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale1000` es un adaptador LoRA de solo pesos (fine-tuning eficiente) sobre el modelo base `allenai/Olmo-3-7B-Think`, desarrollado por el usuario `ssurface`. Forma parte de una serie de experimentos sobre compresión de "dialectos" de chain-of-thought (CoT) aplicados al razonamiento matemático. Este adaptador concreto representa un punto en una curva de escalado de datos: se ha entrenado con 1000 trazas destiladas del dialecto L5 (el más comprimido) del conjunto MATH, para estudiar cuántos datos necesita ese nivel extremo de compresión.

El modelo resuelve el problema de la eficiencia de datos en la destilación de CoT: la hipótesis es que los dialectos muy comprimidos no requieren grandes volúmenes de datos para alcanzar su rendimiento máximo. Con 1000 trazas obtiene un 52,8% de exactitud en MATH-500, y la curva sugiere que el rendimiento se satura a partir de unas pocas cientos de trazas. El adaptador es pequeño (0,2 GB) y se distribuye bajo licencia Apache 2.0, con el modelo base de 7B y una ventana de contexto de 64K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (base: Olmo-3-7B-Think) |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32, dropout=0.05) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 64K (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se usa con el modelo base en bfloat16) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (r=16, alpha=32, dropout=0.05) que se acopla al modelo base `allenai/Olmo-3-7B-Think`. Este base es un transformer de 7B parámetros con una ventana de contexto de 64K tokens, entrenado por el Allen Institute for AI (AI2) con foco en razonamiento largo, función calling y codigo. El adaptador se entrena mediante SFT (supervised fine-tuning) sobre 1000 trazas destiladas del dialecto L5 (nivel extremo de compresión) del conjunto MATH-500, utilizando el split de test como datos de entrenamiento (aunque se evalua sobre el mismo split, lo que es una limitación metodológica). El entrenamiento se realiza con 3 épocas, learning rate 2e-4 con decaimiento coseno y warmup de 0.03, batch efectivo de 64, en una sola GPU A100 80GB.

La innovación técnica es el estudio del escalado de datos: se compara el rendimiento con 250, 500, 1000 y 1396 trazas, mostrando una meseta entre 250 y 1000 trazas (51.0% - 52.8%) y una caída a 45.6% con 1396 trazas. El autor indica que la diferencia dentro de 250-1000 es ruido estadístico (margen de error ±4.4 pp) y que el punto de 1396 es el único que se desvía del patrón.

## Capacidades

- Razonamiento matemático: resuelve problemas de nivel MATH-500 con exactitud del 52.8% (exact match).
- Generación de texto con formato estructurado: responde con ` thinking... response` y cierra con `\boxed{answer}`.
- CoT comprimido: hereda el modo de pensamiento del modelo base Olmo-3-7B-Think, pero restringido al dialecto L5 (extremo).
- Multilingüe: solo inglés (según la model card).
- No soporta tool calling, visión, audio ni funciones de agente más allá de la generación de texto.

## Casos de uso

- Investigación en escalado de datos para destilación de CoT: este adaptador sirve para comparar cómo varía el rendimiento con el número de trazas de entrenamiento en dialectos comprimidos. Se usa en experimentos de ablatión para decidir cuántos datos son necesarios.
- Evaluación de compresión de CoT: permite medir el impacto de la compresión extrema (L5) en la exactitud matemática, comparándolo con dialectos menos comprimidos (L1-L4) dentro de la misma familia.
- Prueba de metodología de evaluación: la model card advierte que el grader es sensible al formato `\boxed{}`; un extractor de `#### n` daría 0% de exactitud. Esto es útil para estudiar la robustez de los sistemas de evaluación automática.
- Benchmark de referencia para adaptadores de bajo coste: con solo 1000 trazas y un adaptador LoRA de 0.2GB, se puede reproducir un pipeline completo de destilación y evaluación en una sola GPU A100, sirviendo de punto de partida para otros experimentos.
- Docencia e investigación en eficiencia de entrenamiento: el adaptador ilustra cómo un modelo pequeño y barato de entrenar puede alcanzar un rendimiento competitivo en una tarea concreta, aunque no sea desplegable en producción.
- Verificación de la reproducibilidad de la curva de escalado: los investigadores pueden replicar el experimento con otros seeds o datasets para confirmar la meseta observada.

## Benchmarks y rendimiento

Según la model card, el modelo obtiene los siguientes resultados en MATH-500 (split test, exact match):

| Dataset | Métrica | Valor |
|---|---|---|
| MATH-500 | Accuracy (exact match) | 52.8% |

La model card también incluye la curva de escalado de datos (misma evaluación, un solo seed):

| Número de trazas | Accuracy |
|---|---:|
| 250 | 51.0% |
| 500 | 51.2% |
| 1000 (este modelo) | 52.8% |
| 1396 | 45.6% |

El autor indica que la exactitud se mantiene plana entre 250 y 1000 trazas, con un margen de error de ±4.4 pp (95% de confianza), y que el punto de 1396 es el único que se sale del rango. No se proporcionan comparaciones con el modelo base sin adaptador ni con otros modelos de la competencia.

## Requisitos de hardware

- VRAM estimada: el modelo base `Olmo-3-7B-Think` en bfloat16 requiere aproximadamente 14-16 GB de VRAM (7B parámetros * 2 bytes). El adaptador LoRA añade un overhead mínimo (0.2 GB en disco).
- GPU recomendadas: una GPU con al menos 16 GB de VRAM es suficiente para inferencia en bfloat16. Ejemplos: RTX 4090 (24 GB), A100 40GB, A6000, H100. En cuantificación de 4 bits (GGUF) podría caber en GPUs de 8 GB, pero el adaptador no está disponible en formato GGUF.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` (como muestra el código de la model card). También es compatible con vLLM y TGI si se cargan los pesos del adaptador, aunque no se documenta en el modelo. No es adecuado para llama.cpp o Ollama directamente, ya que no hay versiones GGUF del adaptador.
- Latencia y throughput: no se han publicado mediciones. La inferencia es similar a la del modelo base (7B) con un overhead mínimo por el adaptador.

## Comparativa con modelos similares

No hay información suficiente para una comparativa cuantitativa con otros modelos. El adaptador pertenece a una familia de experimentos (mismos dialectos con otros niveles de compresión, por ejemplo `cot-dialect-olmo3-7b-think-sft-l3`), pero no se disponen de sus resultados en la información proporcionada. Se puede comparar conceptualmente con:

- `allenai/Olmo-3-7B-Think` (modelo base): el adaptador no mejora necesariamente el rendimiento general, solo se especializa en matemáticas. No se tienen datos de MATH-500 del base sin adaptación.
- Otros adaptadores de la misma serie (L3, L4, etc.): no se han proporcionado sus métricas.
- Modelos de razonamiento matemático como `Qwen2.5-Math-7B` o `DeepSeekMath-7B`: no se han publicado resultados comparativos.

Dado que no se dispone de más información, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- **Modelo experimental**: la model card lo describe explícitamente como "un punto en una ablación, no un modelo para desplegar". No debe usarse en producción.
- **Sesgo de evaluación**: la exactitud se mide con un grader específico que requiere respuestas en `\boxed{}`; un extractor simple de `#### n` daría 0% de exactitud. Esto limita la interoperabilidad de la evaluación.
- **Datos de entrenamiento**: se entrena con el split de test de MATH-500, lo que puede inflar el rendimiento si se evalúa sobre el mismo conjunto (aunque el modelo no ha visto las respuestas, el uso de test como train es metodológicamente cuestionable).
- **Idioma**: solo inglés, no es multilingüe.
- **Rendimiento limitado**: con 52.8% de exactitud en MATH-500, está por debajo de modelos modernos de propósito general (por ejemplo, Olmo 3 en otros benchmarks), y no se recomienda para tareas fuera de matemáticas.
- **Riesgo de alucinación**: como modelo de lenguaje, puede producir razonamientos incorrectos o inventar pasos intermedios. La compresión extrema del dialecto L5 puede aumentar este riesgo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base `Olmo-3-7B-Think` también es Apache 2.0, por lo que no hay restricciones adicionales.

## Enlaces

- HuggingFace: [ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale1000](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale1000)
- Modelo base: [allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- Paper de Olmo 3: [arXiv:2512.13961](https://arxiv.org/abs/2512.13961)
- Script de entrenamiento de Olmo 3 (open-instruct): [GitHub open-instruct/scripts/train/olmo3/7b_think_sft.sh](https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/7b_think_sft.sh)
- Adaptador relacionado (L3): [ssurface/cot-dialect-olmo3-7b-think-sft-l3](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l3)
