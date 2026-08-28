# ZTFlynn/LFM2-350M-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2-350M-Cascadia-ternary3 es un paquete de compresión del modelo de lenguaje LiquidAI/LFM2-350M, desarrollado por ZTFlynn mediante la técnica Cascadia. Este método combina una superficie spline con tablas de búsqueda por bandas para reducir el modelo original de 676 MB a 241 MB (una compresión de 2,96 veces), manteniendo una calidad prácticamente idéntica según las mediciones de perplexity y error de reconstrucción. El resultado es un modelo ejecutable en CPU con un runtime en C cuyas únicas dependencias son libc, libm y libgomp, lo que lo hace adecuado para entornos edge y dispositivos con recursos limitados.

El modelo base LFM2-350M es una arquitectura híbrida que combina convoluciones cortas con puerta (gated short convolutions) y bloques de atención con query grouping (GQA), diseñada por Liquid AI para despliegue eficiente en dispositivos. La compresión Cascadia no requiere reentrenamiento: ajusta una superficie B-spline a cada matriz de pesos, asigna cada peso a una de 32 bandas según su valor spline, y aprende un codebook k-means por banda sobre los residuos, conservando el 0,5% de los errores más grandes en precisión f32. Los índices de codebook se empaquetan en base 3 (cinco trits por byte), logrando 0,60 bytes por peso.

Este paquete es relevante porque demuestra que es posible comprimir modelos de 350M a menos de un cuarto de su tamaño original sin pérdida medible de calidad, manteniendo la ejecución en hardware de bajo coste. Su publicación en agosto de 2026 (según la fecha de creación) se alinea con la tendencia de optimización de modelos para inferencia local y soberanía de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hybrid: gated short convolutions + GQA, 16 bloques) |
| Parametros totales | 350M (16 capas, hidden 1024) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cascadia ternary-3 (0,60 bytes/peso, codebooks ternarios en base 3) |
| Idiomas soportados | en |
| Licencia | lfm-open-license (ver enlace en la model card) |
| Formato de pesos | Paquete Cascadia (weights.bin, manifest.json, aux.bin, tokenizer.bin) |

## Arquitectura y entrenamiento

El modelo base LFM2-350M, desarrollado por Liquid AI, emplea una arquitectura híbrida que intercala bloques de atención con query grouping (GQA, 16 queries y 8 key-value heads) y capas de convoluciones cortas con puerta (gated short convolutions). Esta combinación permite un prefill y decode hasta 2 veces más rápidos que modelos comparables en CPU, según el informe técnico de LFM2. El entrenamiento del modelo base se realizó con datos multilingües (aunque el paquete comprimido solo declara inglés) e incluyó fases de instrucción y función calling, aunque los detalles exactos del dataset no se especifican en la información proporcionada.

La compresión Cascadia es un método post-hoc que no requiere entrenamiento. Para cada matriz de pesos, se ajusta una superficie B-spline que captura la estructura a gran escala. Cada peso se asigna a una de 32 bandas según su valor spline, y se aprende un codebook k-means por banda sobre los residuos (la diferencia entre el peso original y el valor spline). El 0,5% de los errores más grandes se conservan en f32 exacto. La reconstrucción se realiza como `W = spline(j,c) + codebook[band][index]`, evaluada dentro del producto matriz-vector, sin construir nunca la matriz densa. Los índices se empaquetan en base 3 (3^5 = 243 cabe en un byte), logrando 0,60 bytes por peso. El embedding atado (que también actúa como lm_head) se comprime con un codebook global de 81 entradas en lugar de bandas, para minimizar el error que llega a los logits.

## Capacidades

- Generación de texto autoregresiva: el modelo produce texto coherente y sigue instrucciones, como muestra el ejemplo de la model card ("How many eggs are in a baker's dozen?").
- Ejecución en CPU: el runtime C de Cascadia permite inferencia sin GPU, con dependencias mínimas (libc, libm, libgomp).
- Compresión sin pérdida perceptible: la perplexity medida (342,40) es estadísticamente indistinguible de la del modelo base bf16 (337,08), con un intervalo de confianza del 95% que acota la diferencia en ±6%.
- Soporte de chat: el runtime incluye un modo `--chat` que detiene la generación en `<|im_end|>`, adecuado para conversaciones multi-turno.
- Reproducibilidad: la generación es determinista con semilla fija (greedy por defecto).
- Integración con Python: se puede cargar el paquete comprimido sobre el modelo base usando la librería `cascadia` y `transformers` (aunque la ejecución real ocurre en el runtime C).
- Capacidades del modelo base (no verificadas en el paquete comprimido): el LFM2-350M original soporta función calling y razonamiento multi-step, según el blog de Liquid AI, pero la compresión podría afectar estas capacidades; no se han publicado pruebas específicas.

## Casos de uso

- Inferencia en dispositivos edge: el paquete de 241 MB y el runtime C con dependencias mínimas permiten ejecutar un LLM de 350M en placas como Raspberry Pi o microcontroladores con suficiente RAM, para asistentes locales sin conexión.
- Chatbots de atención al cliente en entornos con privacidad estricta: al ejecutarse localmente, los datos no salen del dispositivo, lo que cumple requisitos de GDPR o de empresas que no pueden enviar información a la nube.
- Generación de texto en aplicaciones de bajo consumo: por su tamaño reducido, puede integrarse en aplicaciones móviles o de escritorio que requieran respuestas en tiempo real sin depender de servidores externos.
- Prototipado rápido de modelos comprimidos: investigadores pueden usar este paquete como referencia para evaluar la técnica Cascadia y comparar la calidad de compresión con otros métodos (GPTQ, AWQ, GGUF) sobre el mismo modelo base.
- Educación y experimentación: el runtime C es sencillo de compilar y auditar, ideal para cursos de optimización de modelos o para estudiar técnicas de cuantización no convencionales (splines + codebooks).
- Despliegue en entornos con restricciones de memoria: con 278 MB residentes (según el commit), cabe en contenedores Docker con límites de memoria ajustados o en funciones serverless con presupuesto reducido.

## Benchmarks y rendimiento

La model card proporciona mediciones de calidad en términos de perplexity y error de reconstrucción, comparando el paquete comprimido con el modelo base en bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | LFM2-350M (bf16) | Paquete Cascadia (ternary-3) |
|---|---|---|
| Perplexity (FineWeb-Edu, 16,352 tokens en 31 ventanas de 512) | 337,08 | 342,40 |
| Diferencia relativa | — | 1,58% (IC 95% [0,9733x, 1,0598x], t = +0,71) |
| Error L2 relativo vs bf16 | — | 0,0533 |
| Ganancia sistemática (1,0000 = fiel) | — | 0,9993 |
| Error L2 en embedding atado | — | 0,0272 |
| Error L2 en lineales | — | 0,0584 |

La medición de perplexity se realizó con tokens pareados y comparación por token, lo que reduce el error estándar 9,3 veces frente a medias independientes. El resultado no permite distinguir la diferencia de cero, acotando el cambio en perplexity dentro del ±6%. La fidelidad de reconstrucción se mide directamente sobre el 100% de los parámetros (93 tensores).

## Requisitos de hardware

- Tamaño del paquete: 241 MB en disco (0,5 GB repo), 278 MB en memoria residente.
- CPU: cualquier procesador con soporte para libc, libm y libgomp (prácticamente todos los x86-64 y ARM64). No se requiere GPU.
- RAM: mínimo 300 MB para el modelo, más el overhead del runtime. Un dispositivo con 512 MB de RAM puede ejecutarlo.
- GPU: no necesaria; el runtime C está diseñado para CPU.
- Opciones de despliegue: runtime C nativo (compilación con CMake), interfaz Python mediante `cascadia.load_compressed` sobre el modelo base de transformers.
- Latencia y throughput: no se proporcionan mediciones específicas en la información disponible. Dado el tamaño de 350M y la ejecución en CPU, se espera una generación de varios tokens por segundo en hardware moderno, pero depende de la CPU y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| LFM2-350M (base) | 350M | No disponible | bf16 | 676 MB | lfm-open-license | transformers (GPU/CPU) |
| ZTFlynn/LFM2-350M-Cascadia-ternary3 | 350M | No disponible | Cascadia ternary-3 (0,60 bytes/peso) | 241 MB | lfm-open-license | Runtime C (CPU) |
| Qwen2.5-0.5B | 500M | 32k | GGUF (varias) | ~400 MB (Q4) | Apache 2.0 | llama.cpp, Ollama, etc. |
| Gemma-2-2B (no comparable en tamaño) | 2B | 8k | GGUF | ~1.5 GB (Q4) | Gemma license | llama.cpp, etc. |

La comparativa con Qwen2.5-0.5B y Gemma-2-2B es orientativa en cuanto a tamaño y formato, pero no se dispone de benchmarks comunes para comparar rendimiento. La principal diferencia de este paquete es su formato propietario (Cascadia) y su ejecución exclusiva en el runtime C, mientras que los otros modelos usan formatos estándar (GGUF) con soporte en múltiples frameworks.

## Limitaciones y advertencias

- No es un checkpoint de `transformers`: el paquete se ejecuta exclusivamente con el runtime C de Cascadia; para usarlo en Python es necesario cargar el modelo base y luego aplicar `load_compressed`, lo que añade complejidad.
- La licencia `lfm-open-license` puede tener restricciones de uso comercial; se debe revisar el texto completo en el enlace proporcionado antes de desplegar en producción.
- Solo soporta inglés (etiqueta `language: en`), aunque el modelo base original podría tener capacidades multilingües, no se garantizan en esta compresión.
- La longitud de contexto no está documentada en la información disponible; se desconoce si la compresión afecta a la ventana de atención máxima.
- El error de reconstrucción es bajo pero no nulo (rel L2 0,0533); en aplicaciones que requieran salidas numéricas exactas o lógica de razonamiento compleja, podría haber degradación no detectada por la perplexity.
- El runtime C no incluye funciones avanzadas como búsqueda de beam, sampling dinámico o soporte para múltiples GPUs; está limitado a generación greedy o sampling básico con `--temp`, `--top-k`, `--top-p`.
- No se han publicado benchmarks de tareas específicas (MMLU, HumanEval, etc.) para este paquete, por lo que su rendimiento en tareas concretas es incierto.

## Enlaces

- HuggingFace: https://huggingface.co/ZTFlynn/LFM2-350M-Cascadia-ternary3
- Repositorio del runtime Cascadia: https://github.com/EntroMorphic/cassie
- Paper técnico LFM2: https://arxiv.org/abs/2511.23404
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2-350M/blob/main/LICENSE
- Documentación del formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
