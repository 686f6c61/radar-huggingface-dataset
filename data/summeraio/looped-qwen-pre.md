# summerAIO/Looped-Qwen-pre

## Resumen

Looped-Qwen-pre es un modelo de generación de texto de aproximadamente 989 millones de parámetros desarrollado por summerAIO (con créditos a summerMC y j-llm). Se construye a partir de Qwen/Qwen3.5-2B mediante una técnica de compresión estructural: se toma el modelo base convertido íntegramente a Gated DeltaNet (linear attention) por j-llm/Qwen3.5-2B-SpeedX2, se fusionan espacialmente sus 24 capas en bloques compartidos y se reorganiza el cómputo en una arquitectura de doble bucle (looped transformer) con pesos compartidos entre iteraciones.

El modelo resuelve el problema del coste computacional y de memoria en inferencia: reduce un modelo de 2B a menos de 1B de parámetros efectivos mediante weight sharing y merging de capas, manteniendo un comportamiento conversacional cercano al profesor gracias a un proceso de destilación en dos etapas sobre datos C4 en japonés e inglés. Es relevante porque combina dos líneas de investigación activas: la atención lineal (Gated DeltaNet) y los transformers con bucles recurrentes de profundidad, una alternativa a escalar parámetros para ganar capacidad de razonamiento.

La arquitectura emplea 6 iteraciones del bucle externo con 4 iteraciones internas cada una (24 pasos efectivos de cómputo), reinyectando RoPE en cada paso externo para preservar la información posicional. El modelo está pensado como checkpoint de preentrenamiento/destilación ("pre"), no como un modelo afinado para instrucciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Gated DeltaNet (linear attention) con weight sharing y merging espacial de capas; transformer recurrente en profundidad |
| Parametros totales | 989.050.648 |
| Parametros activos | no disponible (no es MoE; el cómputo efectivo equivale a 24 pasos de un bloque compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código custom: modeling_looped_gdn.py, configuration_looped_gdn.py) |

## Arquitectura y entrenamiento

El modelo parte de j-llm/Qwen3.5-2B-SpeedX2, una variante de Qwen3.5-2B en la que todas las capas son Gated DeltaNet (GDN), un mecanismo de atención lineal con decaimiento controlado por compuerta. Sobre esa base, summerAIO aplica un merging espacial de las 24 capas en grupos (6 grupos de 4 capas, promediadas en un bloque compartido GDN_t) y reorganiza el cómputo como un doble bucle: un bucle externo de 6 iteraciones que reinyecta RoPE y añade un embedding de etapa de bucle, y un bucle interno de 4 iteraciones por etapa con compuerta adaptativa (`h = h + g_k(h) * (GDN_t(h) - h)`) y LoRA específica por paso de iteración. El resultado es una red recurrente en profundidad que reutiliza un único bloque de pesos varias veces.

El entrenamiento es por destilación desde el profesor Qwen/Qwen3.5-2B en dos etapas: la primera aplica destilación de estados ocultos por grupo (pérdida de MSE relativo más similitud coseno); la segunda combina la pérdida KL sobre logits del profesor con la pérdida sobre estados ocultos. Los datos de entrenamiento son C4 en japonés e inglés. El autor advierte explícitamente que, al ser una aproximación por destilación, el rendimiento es inferior al del profesor. El repositorio incluye scripts de destilación (colab_looped_distill.py), de inferencia (infer_looped_gdn.py), de transplante espacial avanzado con RegMean sensible a activaciones y LoRA (colab_ast_transplant.py) y tests unitarios.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento de múltiples pasos a través de la recurrencia de profundidad (24 pasos efectivos con pesos compartidos).
- Modo "thinking" controlable mediante el parámetro `enable_thinking` de la plantilla de chat (el ejemplo de la model card lo desactiva).
- Inferencia eficiente en memoria gracias a la atención lineal GDN y al weight sharing, con kernels acelerados vía `flash-linear-attention`.
- Soporte de cuantización y despliegue estándar de transformers (el código custom requiere `trust_remote_code=True`).
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente explícitas.

## Casos de uso

- Investigación en arquitecturas recurrentes en profundidad: el modelo sirve como banco de pruebas reproducible para estudiar el efecto del weight sharing y del bucle de profundidad frente a un transformer denso del mismo presupuesto de parámetros.
- Destilación y compresión de modelos: los scripts incluidos permiten replicar el pipeline (merging espacial, RegMean sensible a activaciones, LoRA por paso) sobre otros checkpoints GDN o transformers.
- Despliegue en entornos con VRAM limitada: con menos de 1B de parámetros en bfloat16 (aproximadamente 2 GB de pesos), cabe en GPUs de consumo como RTX 3060 de 12 GB o superiores, útil para prototipos de chat en local.
- Generación de texto en japonés e inglés para tareas de completado y conversación ligera donde el coste por token importa más que la calidad máxima.
- Evaluación comparativa de atención lineal frente a atención completa: al derivar de Qwen3.5-2B, permite medir la degradación introducida por la aproximación GDN y por el merging de capas.
- Experimentos de eficiencia energética y latencia: la combinación de GDN, pesos compartidos y kernels de flash-linear-attention reduce el coste de memoria de activaciones en secuencias largas, adecuado para estudiar throughput en hardware modesto.
- Base para fine-tuning posterior (SFT/DPO) en dominios concretos, dado que se distribuye como checkpoint "pre" con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB solo para pesos (989 M de parámetros), más activaciones y caché; en la práctica, entre 3 y 5 GB según longitud de secuencia y lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con lotes pequeños; A100/H100 solo necesarias para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: sí, por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090. También es viable en CPU para pruebas, con latencia alta.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito por el código custom), más `flash-linear-attention` para los kernels GDN. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; estos motores requerirían portar el código custom.
- Latencia y throughput estimados: no disponibles. El autor solo indica que se recomienda instalar `flash-linear-attention` para acelerar los kernels GDN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Looped-Qwen-pre (este) | 989 M | no disponible | Looped Gated DeltaNet, pesos compartidos | Apache 2.0 | Destilado de Qwen3.5-2B; ja/en |
| Qwen/Qwen3.5-2B (profesor) | ~2B | no disponible | Transformer denso (Qwen3.5) | Apache 2.0 | Modelo de referencia; mayor calidad según el autor |
| j-llm/Qwen3.5-2B-SpeedX2 | ~2B | no disponible | Todo GDN (linear attention) | Apache 2.0 | Base directa; misma familia, sin merging ni bucle |
| Qwen2.5-1.5B | 1,5B | 32 768 (referencia de familia) | Transformer denso | Apache 2.0 | Alternativa de tamaño comparable; datos de contexto no verificados para esta ficha |

## Limitaciones y advertencias

- El propio autor advierte que la destilación introduce una degradación de rendimiento respecto al profesor Qwen/Qwen3.5-2B; no debe esperarse paridad de calidad.
- Es un checkpoint "pre" (preentrenamiento/destilación), no un modelo afinado para instrucciones; el comportamiento conversacional puede ser irregular sin fine-tuning adicional.
- Idiomas limitados a japonés e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a modelos pequeños destilados, agravado por la compresión estructural (merging de capas y pesos compartidos).
- La longitud de contexto no está publicada; la atención lineal GDN está pensada para secuencias largas, pero no hay cifras verificables.
- Requiere `trust_remote_code=True` y código custom (`modeling_looped_gdn.py`, `configuration_looped_gdn.py`), lo que implica revisar el código antes de ejecutarlo y limita la compatibilidad con motores de inferencia estándar.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que la licencia sigue a la del modelo original (Qwen/Qwen3.5-2B); conviene verificar los términos del profesor y de la base SpeedX2.
- No hay soporte documentado de tool calling ni de agentes; no debe asumirse en producción.
- Los benchmarks no están publicados, por lo que la evaluación de calidad debe hacerse de forma empírica antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/summerAIO/Looped-Qwen-pre
- Modelo base (todo GDN): https://huggingface.co/j-llm/Qwen3.5-2B-SpeedX2
- Profesor: https://huggingface.co/Qwen/Qwen3.5-2B
- Referencia del autor en la model card: summerMC/Looped-Qwen-pre (mismo artefacto, distinto namespace)
- Dependencia recomendada: `flash-linear-attention` (pip install -U transformers flash-linear-attention)
