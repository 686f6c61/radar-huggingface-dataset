# unl-reset/tofu-phi-1_5-retain95

## Resumen

Phi-1.5 TOFU retain95 es un checkpoint de ajuste fino supervisado de parámetros completos (no un adaptador LoRA) construido a partir de `microsoft/phi-1_5`. Lo publica el usuario `unl-reset` como una reproducción independiente de la receta de *machine unlearning* del conjunto de datos TOFU (`locuslab/TOFU`), en su variante retain95. El objetivo de TOFU es medir la capacidad de un modelo de "olvidar" de forma selectiva los datos de un subconjunto de autores ficticios manteniendo el rendimiento sobre el resto; este checkpoint concreto corresponde al escenario en el que se retiene el 95 % de los datos de entrenamiento originales.

El modelo tiene 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), se distribuye en formato safetensors con un tamaño de repositorio de 2,8 GB y está pensado exclusivamente para inglés. No es un modelo de propósito general ni un lanzamiento de un laboratorio: es una pieza de investigación para experimentos de desaprendizaje, evaluación de privacidad y reproducibilidad de metodologías de unlearning.

Su relevancia es acotada pero específica: permite a investigadores comparar implementaciones independientes de TOFU frente al checkpoint original de locuslab, y sirve como línea base de "retención alta" para medir cuánto conocimiento se pierde (o no) al aplicar técnicas de olvido selectivo sobre un modelo pequeño y de licencia permisiva (MIT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de phi-1.5) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; admite cuantización posterior vía herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/phi-1_5 (commit `77aa61eeac94fbf33d492b9f2744c98b42d5b5eb`) |
| Dataset de ajuste | locuslab/TOFU retain95 (commit `324592d84ae4f482ac7249b9285c2ecdb53e3a68`) |
| Tipo de ajuste | SFT de parámetros completos |
| Librería | transformers |
| Tamaño del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `microsoft/phi-1_5`, un transformer decoder-only de aproximadamente 1,4 mil millones de parámetros orientado originalmente a generación de texto y código. Sobre esa base, este checkpoint aplica un ajuste fino supervisado de todos los parámetros sobre la partición retain95 del dataset TOFU. No se trata de un adaptador LoRA ni de una modificación estructural: los pesos son un conjunto completo e independiente.

El autor indica explícitamente que es una "aproximación entrenada de forma independiente a la receta original de TOFU", no el checkpoint original de locuslab. Los hiperparámetros concretos (tasa de aprendizaje, número de épocas, tamaño de lote, composición exacta del subconjunto retenido) se remiten a un archivo `training_manifest.json` dentro del repositorio, que no se detalla en la información disponible. No se documentan fases de RLHF, DPO ni innovaciones arquitectónicas adicionales; el interés técnico reside en el procedimiento de desaprendizaje selectivo, no en cambios de arquitectura.

## Capacidades

- Generación de texto en inglés, heredada de phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionada por el ajuste sobre TOFU.
- Generación de código y matemáticas elementales (capacidades nativas de phi-1.5, potencialmente degradadas por el ajuste específico).
- Evaluación de desaprendizaje: sirve como sujeto de prueba para métricas de retención y olvido sobre autores del dataset TOFU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: no; solo inglés.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como línea base retain95 para comparar curvas de olvido/retención frente a variantes retain90, retain50 o el checkpoint original de locuslab, midiendo la degradación de métricas en el conjunto retenido.
- Auditoría de privacidad: evaluar si el ajuste sobre TOFU elimina efectivamente la memorización de datos de autores concretos mediante ataques de extracción o *membership inference*.
- Reproducibilidad metodológica: replicar experimentos de TOFU con una implementación independiente y contrastar si los resultados publicados se sostienen fuera del checkpoint de referencia.
- Estudio de degradación por ajuste fino: analizar cómo un SFT de parámetros completos sobre un corpus pequeño y sintético afecta a las capacidades originales de phi-1.5 en tareas de código y matemáticas.
- Docencia y experimentación con recursos limitados: al tener 1,4 B de parámetros y licencia MIT, cabe en una única GPU de consumo para ejecutar pipelines de evaluación de unlearning sin infraestructura dedicada.
- Generación de texto controlada en inglés: uso como modelo pequeño de generación en prototipos donde la licencia MIT y el tamaño reducido son prioritarios, asumiendo las limitaciones de un modelo ajustado para un fin de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 2,8-3 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en int8: aproximadamente 1,5 GB; en int4, alrededor de 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias y estarían sobredimensionadas.
- Cabe holgadamente en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-retain95 | 1,42 B | no disponible | MIT | Unlearning (TOFU retain95) | HuggingFace |
| locuslab/tofu_phi-1_5 (checkpoint original) | ~1,4 B | no disponible | no disponible en esta ficha | Unlearning (TOFU) | HuggingFace |
| microsoft/phi-1_5 | 1,3 B | 2.048 tokens (referencia de la familia) | MIT | Generación de texto y código | HuggingFace |
| microsoft/phi-2 | 2,7 B | 2.048 tokens (referencia de la familia) | MIT | Generación de texto y código | HuggingFace |

La comparación directa más relevante es con el checkpoint original de locuslab y con la base phi-1.5 sin ajustar; las cifras de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una reproducción independiente, no el checkpoint oficial de TOFU: los resultados pueden diferir de los publicados por locuslab.
- El ajuste sobre un corpus sintético y pequeño (TOFU) puede degradar capacidades generales de phi-1.5, especialmente en código y matemáticas.
- Riesgo de alucinación inherente a un modelo de 1,4 B; no apto para producción de alta fiabilidad sin validación.
- Solo inglés; sin soporte multilingüe.
- Sesgos heredados de phi-1.5 y del dataset TOFU, no evaluados en la información disponible.
- Licencia MIT permisiva para uso comercial, pero el modelo está concebido como artefacto de investigación; su uso en producción no está validado.
- Sin datos publicados de benchmarks, evaluación de sesgos ni análisis de memorización residual.
- Descargas y likes nulos en el momento de la consulta: sin validación comunitaria.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-retain95](https://huggingface.co/unl-reset/tofu-phi-1_5-retain95)
- [Modelo base: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Dataset: locuslab/TOFU](https://huggingface.co/datasets/locuslab/TOFU)
