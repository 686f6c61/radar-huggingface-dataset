# Squeal-Studio/squeal_ai_8m-instruct

## Resumen

squeal_ai_8m-instruct es un modelo de lenguaje compacto de aproximadamente 8 millones de parámetros, desarrollado por Squeal Studio, especializado en el seguimiento de instrucciones en ruso. Se trata de la versión instruct del modelo base squeal_ai_8m-base, ajustada mediante Supervised Fine-Tuning (SFT) sobre un conjunto de datos de instrucciones en ruso, sin aplicar etapas de alineación como RLHF o DPO. Su arquitectura sigue el estilo Qwen2.5 con atención por grupos (GQA) y una ventana de contexto de 1.536 tokens.

El modelo está diseñado explícitamente para fines de investigación, educación y experimentación. Su reducido número de parámetros y el volumen limitado de datos de entrenamiento condicionan su rendimiento en tareas complejas o de conocimiento factual, por lo que no está recomendado para uso en producción. A pesar de ello, resulta útil como referencia para estudios de arquitectura, comparativas de modelos pequeños y demostraciones de fine-tuning con recursos computacionales mínimos.

La licencia Apache 2.0 permite su uso comercial y la modificación sin restricciones significativas, lo que facilita su integración en proyectos académicos o prototipos. El modelo se distribuye en formato safetensors y es compatible con el ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen2.5 con GQA (Grouped Query Attention) |
| Parametros totales | 7.858.368 (aprox. 8M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.536 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en fp16; se puede cuantizar con herramientas externas) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer decoder con atención por grupos (GQA), siguiendo el diseño de la familia Qwen2.5. Los parámetros de configuración incluyen un tamaño oculto de 192, 8 capas, 6 cabezas de atención, 3 cabezas clave-valor, un tamaño intermedio de 512 y un vocabulario de 24.000 tokens mediante un tokenizador BPE personalizado. La ventana de contexto máxima es de 1.536 tokens.

El proceso de entrenamiento consta de dos fases. Primero, el modelo base squeal_ai_8m-base fue preentrenado sobre la Wikipedia en ruso y el corpus OpenSubtitles en ruso. Posteriormente, la versión instruct se ajustó mediante SFT sobre un conjunto de datos de instrucciones en ruso disponible públicamente en Hugging Face. El entrenamiento se realizó en una GPU Tesla T4 con precisión fp16 hasta el paso 1400. No se aplicaron técnicas de alineación como RLHF o DPO, lo que limita la robustez del seguimiento de instrucciones y la coherencia de las respuestas.

## Capacidades

- Generación de texto en ruso: produce respuestas cortas y coherentes para instrucciones simples, aunque con limitaciones en tareas complejas.
- Seguimiento de instrucciones básico: gracias al fine-tuning SFT, puede responder a peticiones directas en formato conversacional.
- Chat multi-turno: incluye una plantilla de chat (chat_template.jinja) compatible con `tokenizer.apply_chat_template`, lo que permite su uso en diálogos sencillos.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe limitada: entrenado exclusivamente con datos en ruso, su rendimiento en otros idiomas es prácticamente nulo.

## Casos de uso

- Experimentación educativa: ideal para estudiantes e investigadores que deseen estudiar el comportamiento de un modelo de lenguaje pequeño, analizar sus limitaciones o comparar arquitecturas sin necesidad de recursos de cómputo elevados.
- Pruebas de fine-tuning: sirve como punto de partida para experimentos de ajuste con datasets propios, dado su tamaño reducido y su licencia permisiva.
- Demostraciones de generación de texto en ruso: puede utilizarse en prototipos que requieran respuestas cortas y simples, como generación de frases o respuestas automáticas en entornos controlados.
- Evaluación de métricas de compresión y cuantización: al ser un modelo muy pequeño, permite probar técnicas de cuantización (int8, 4-bit) y medir su impacto en la calidad de salida con coste computacional mínimo.
- Análisis de sesgos y alucinaciones: su limitada base de conocimiento facilita el estudio de fenómenos como la alucinación o la repetición en modelos pequeños, útil para investigación en robustez.
- Integración en pipelines de enseñanza de PLN: puede emplearse como ejemplo práctico en cursos de procesamiento de lenguaje natural para ilustrar el ciclo completo de preentrenamiento y ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, y dado el tamaño del modelo y su enfoque en ruso, no se dispone de comparativas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo ocupa aproximadamente 16 MB; en int8, unos 8 MB; en 4-bit, unos 4 MB. Cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una Tesla T4, RTX 2060 o superior ofrece margen amplio. También puede ejecutarse en CPU con baja latencia.
- Compatibilidad con hardware de consumo: sí, cualquier ordenador personal con CPU moderna puede ejecutar el modelo sin problemas.
- Opciones de despliegue: compatible con Hugging Face Transformers, llama.cpp, Ollama (si se convierte a GGUF) y vLLM (aunque no es necesario por su tamaño).
- Latencia y throughput: no se han publicado mediciones oficiales, pero al tratarse de un modelo de 8M de parámetros, la generación es prácticamente instantánea en GPU y muy rápida en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de tamaño similar (alrededor de 8M de parámetros) en la información proporcionada. Los modelos de lenguaje pequeños más conocidos, como SmolLM2-135M o Qwen2.5-0.5B, tienen un orden de magnitud mayor en parámetros y no son directamente comparables. Se recomienda tratar este modelo como una referencia experimental dentro de su propia familia (squeal_ai_).

## Limitaciones y advertencias

- Conocimiento factual muy limitado: el reducido número de parámetros y el volumen de datos de entrenamiento restringen la precisión en tareas de conocimiento general.
- Riesgo elevado de alucinación y respuestas incoherentes: el autor advierte que el modelo puede producir respuestas repetitivas, incoherentes o factualmente incorrectas.
- Sin alineación RLHF/DPO: el seguimiento de instrucciones es menos robusto que en modelos alineados de mayor tamaño.
- Idioma único: solo entrenado en ruso; no se recomienda su uso en otros idiomas.
- No apto para producción: no debe utilizarse en aplicaciones críticas, de seguridad o de alto riesgo.
- Contexto limitado: la ventana de 1.536 tokens restringe la capacidad de manejar conversaciones largas o documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Squeal-Studio/squeal_ai_8m-instruct
- Modelo base: https://huggingface.co/Squeal-Studio/squeal_ai_8m-base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
