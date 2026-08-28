# ZTFlynn/LFM2.5-230M-Cascadia-ternary3

## Resumen

El paquete `ZTFlynn/LFM2.5-230M-Cascadia-ternary3` es una versión comprimida del modelo `LiquidAI/LFM2.5-230M`, el modelo de texto más pequeño de Liquid AI (230 millones de parámetros, 14 capas, hidden 1024, atención GQA 16q/8kv y convoluciones cortas con puerta). El autor, ZTFlynn, aplica el método de compresión Cascadia, que combina superficies spline, tablas de consulta (LUT) por bandas y cuantización ternaria, reduciendo el checkpoint original de 438 MB a 161 MB (factor 2,89x) a un coste de 8,43 % de aumento en perplexidad. El resultado es un paquete ejecutable en CPU mediante un runtime en C cuyas únicas dependencias son libc, libm y libgomp, pensado para despliegue en dispositivos edge y cargas de trabajo por lotes.

La relevancia de este modelo radica en su tamaño extremadamente reducido y su capacidad para ejecutarse en hardware sin GPU, lo que lo hace adecuado para tareas de extracción de datos, agentes ligeros y generación de texto en entornos con recursos limitados. Al ser un paquete comprimido, no es un checkpoint estándar de Transformers, sino un formato propietario que requiere el runtime Cascadia para su inferencia. Su licencia es la `lfm-open-license` de Liquid AI, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 14 bloques, GQA 16q/8kv, convoluciones cortas con puerta (modelo base LFM2.5-230M) |
| Parametros totales | 230 millones (aprox., 14 capas, hidden 1024) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Compresion ternaria con splines y LUT por bandas (Cascadia), 5.54 bits por peso (0.60 bytes por peso) |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm-open-license (Liquid AI) |
| Formato de pesos | Formato propio de Cascadia (weights.bin, manifest.json, aux.bin, tokenizer.bin) |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM2.5-230M` es un transformer causal de 230 millones de parámetros con 14 capas, dimensión oculta 1024, atención con consultas agrupadas (GQA) de 16 cabezas de consulta y 8 de clave/valor, y convoluciones cortas con puerta. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO en la documentación proporcionada.

La compresión Cascadia aplicada en este paquete funciona de la siguiente manera: se ajusta una superficie B-spline a cada matriz de pesos para capturar la estructura a gran escala. Cada peso se asigna a una de 32 bandas según su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5 % de los errores más grandes se conservan exactamente en f32. Los índices del codebook se empaquetan en base 3, con cinco trits por byte (3⁵ = 243 cabe en un byte). La reconstrucción se realiza como `W = spline(j,c) + codebook[band][index]`, evaluada dentro del producto matriz-vector, sin construir nunca la matriz densa completa. El embedding atado (que también actúa como `lm_head`) se comprime con un codebook de 81 entradas en lugar de 27, lo que reduce su error de reconstrucción de 0.078 a 0.027 y lo convierte en el tensor mejor reconstruido del modelo.

## Capacidades

- Generación de texto en inglés, con soporte para formato de chat (detiene la generación en `<|im_end|>`).
- Extracción de datos estructurados a partir de texto, según la documentación de Liquid AI para el modelo base.
- Soporte de tool calling y tareas agénticas ligeras en dispositivos edge (según el blog de Liquid AI).
- Ejecución en CPU sin GPU, con runtime en C de bajo consumo (solo libc, libm y libgomp).
- Inferencia con muestreo greedy o con parámetros `--temp`, `--top-k`, `--top-p` y `--seed`, reproducible por semilla.
- No soporta beam search ni decodificación especulativa; la inferencia es batch-1.

## Casos de uso

- Extracción de datos de documentos en dispositivos embebidos: el modelo puede procesar texto localmente y extraer entidades, fechas o campos concretos sin necesidad de conexión a la nube, gracias a su tamaño de 161 MB y su ejecución en CPU.
- Chatbots ligeros para atención al cliente en entornos con recursos limitados: su formato de chat nativo y su capacidad para detener la generación en la marca de fin de conversación lo hacen adecuado para respuestas automáticas en kioscos o dispositivos IoT.
- Agentes autónomos en hardware de bajo consumo: su soporte para tool calling permite integrarlo en pipelines de automatización que requieren razonamiento simple y llamadas a funciones, por ejemplo en routers o pasarelas domésticas.
- Clasificación y análisis de sentimiento en tiempo real en CPU: al ser un modelo pequeño, puede ejecutarse en servidores sin GPU para preprocesar grandes volúmenes de texto con baja latencia.
- Generación de respuestas en aplicaciones móviles offline: el paquete cabe en la memoria de un teléfono y puede generar texto sin conexión, útil para asistentes personales o teclados predictivos avanzados.
- Fine-tuning y adaptación posterior: al estar basado en LFM2.5-230M, el modelo puede servir como punto de partida para entrenar LoRA o ajustes completos en tareas específicas, y luego comprimirse de nuevo con Cascadia para su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta únicamente métricas de perplexidad y fidelidad de reconstrucción, medidas sobre 16,352 tokens de FineWeb-Edu en 31 ventanas independientes de 512 tokens:

| Modelo | Perplexidad |
|---|---:|
| `LiquidAI/LFM2.5-230M` (bf16) | 179.85 |
| Este paquete (ternary-3) | 195.01 |
| **Incremento** | **+8.43 %** (IC 95 % [1.0500x, 1.1225x], t = +4.82) |

Fidelidad de reconstrucción frente al checkpoint bf16:

| Metrica | Valor |
|---|---:|
| Error L2 relativo (global) | 0.0485 |
| Ganancia sistematica | 0.9993 |
| Tensores medidos | 83 de 83 (100 % de parametros) |
| Error L2 en capas lineales | 0.0593 (163M params) |
| Error L2 en embedding atado | 0.0222 (67M params) |

## Requisitos de hardware

- El paquete pesa 161 MB en disco, por lo que cabe en cualquier dispositivo con al menos 256 MB de memoria libre.
- Ejecución en CPU: el runtime C de Cascadia solo requiere libc, libm y libgomp; no necesita GPU ni aceleradores.
- Recomendado para procesadores x86-64 y ARM64 con soporte de OpenMP (libgomp) para paralelismo.
- La inferencia es batch-1, lo que limita el throughput pero permite latencias bajas en tareas individuales.
- No se han publicado mediciones de latencia o throughput; se espera que sea adecuado para edge y cargas por lotes pequeñas.
- Opciones de despliegue: runtime C nativo (`cascadia_generate`) o integración en Python mediante `cascadia.load_compressed` con Transformers.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar (p. ej., TinyLlama-1.1B, Qwen2.5-0.5B) en la información proporcionada. La comparación más directa es con el modelo base sin comprimir:

| Modelo | Parametros | Tamano del checkpoint | Perplexidad (FineWeb-Edu) | Licencia |
|---|---|---|---|---|
| `LiquidAI/LFM2.5-230M` (bf16) | 230M | 438 MB | 179.85 | lfm-open-license |
| Este paquete (ternary-3) | 230M | 161 MB | 195.01 | lfm-open-license |

Existe otro paquete Cascadia para un modelo mayor, `ZTFlynn/LFM2-700M-Cascadia-ternary3`, pero no se incluyen sus métricas en esta documentación.

## Limitaciones y advertencias

- El paquete se ejecuta bajo el runtime C de Cascadia, no directamente con Transformers; requiere el repositorio `EntroMorphic/cassie` y la compilación del runtime.
- El runtime solo soporta paquetes en formato ternary-3; otros presets pueden convertirse pero no son ejecutables aún.
- La inferencia es batch-1 y no soporta beam search, solo decodificación greedy o muestreo con temperatura/top-k/top-p.
- El aumento de perplexidad (+8.43 %) implica una degradación medible en la calidad del texto generado, especialmente en tareas que dependen de precisión léxica o semántica.
- El embedding atado, aunque mejorado con 81 entradas, sigue siendo una fuente de error que afecta directamente a los logits de salida.
- El modelo solo soporta inglés; no hay capacidades multilingües documentadas.
- La licencia `lfm-open-license` de Liquid AI puede tener restricciones específicas para uso comercial; se recomienda revisar el texto completo en el enlace proporcionado.
- No se han evaluado sesgos ni riesgos de alucinación específicos para este paquete comprimido; se asume que hereda los del modelo base.

## Enlaces

- [HuggingFace del paquete comprimido](https://huggingface.co/ZTFlynn/LFM2.5-230M-Cascadia-ternary3)
- [HuggingFace del modelo base LiquidAI/LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M)
- [Documentación oficial de LFM2.5-230M en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm25-230m)
- [Blog de Liquid AI: LFM2.5-230M: Built to Run Anywhere](https://www.liquid.ai/blog/lfm2-5-230m)
- [Repositorio del runtime Cascadia (cassie)](https://github.com/EntroMorphic/cassie)
- [Formato de paquete de Cascadia](https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md)
- [Modelo inspirador: Magneato/deepseek-r1-qwen-7b-lutc](https://huggingface.co/Magneato/deepseek-r1-qwen-7b-lutc)
