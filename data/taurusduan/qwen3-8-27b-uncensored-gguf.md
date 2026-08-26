# taurusduan/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, al que se le ha aplicado una técnica de abliteración para reducir sustancialmente el comportamiento de rechazo (refusal behaviour). El autor, taurusduan, publica estos pesos con el objetivo de ofrecer una versión "sin censura" del modelo base, manteniendo intactas sus capacidades originales: razonamiento, tool calling, visión y decodificación especulativa mediante un head de multi-token prediction (MTP). El modelo base es un transformer denso de 27 320 millones de parámetros con atención híbrida (Gated DeltaNet lineal + atención completa), contexto nativo de 262 144 tokens y soporte bilingüe inglés-chino.

La relevancia de esta publicación radica en que combina tres elementos que rara vez aparecen juntos en el ecosistema GGUF: un modelo de 27B con ventana de contexto muy amplia, un head MTP verificado y funcional para acelerar la inferencia, y un comportamiento de rechazo reducido mediante un método reproducible (Heretic) que no requiere fine-tuning. Todo ello bajo licencia Apache 2.0, aunque el autor del blog asociado indica que el uso previsto es exclusivamente para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (atención híbrida: Gated DeltaNet lineal + atención completa) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (modelo principal); Q4_0 y Q8_0 (draft head); f16 y bf16 (proyector de visión) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 (con indicación de uso solo para investigación en la documentación asociada) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que permite manejar contextos largos de 262 144 tokens con un coste computacional menor que la atención estándar. La versión uncensored no modifica la arquitectura ni los pesos de entrenamiento: la abliteración se realiza con la herramienta Heretic, que co-minimiza el recuento de rechazos frente a la divergencia KL respecto al modelo base, y el LoRA resultante se fusiona en los pesos bf16 originales. No se utiliza fine-tuning ni datos de entrenamiento adicionales.

La innovación técnica principal de esta publicación es la conservación y verificación del head MTP. La abliteración estándar elimina los tensores `mtp.*` al re-guardar el modelo a través de transformers, pero aquí se injertan de nuevo desde el checkpoint base y se inspeccionan tras cada cuantización. Además, la matriz de importancia (imatrix) se calcula directamente sobre los pesos f16, no sobre una cuantización intermedia, lo que mejora la calibración de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino, heredadas del modelo base.
- Tool calling y function calling, útil para integraciones con APIs y agentes.
- Soporte de agentes y razonamiento multi-paso, gracias a la arquitectura híbrida y al contexto largo.
- Visión: el modelo incluye un proyector de visión (archivos `vision-f16` y `vision-bf16`) que permite procesar imágenes, aunque el modelo base no especifica explícitamente un vision tower en la documentación proporcionada.
- Decodificación especulativa mediante head MTP, con dos formatos: fusionado (MTP integrado en el archivo principal) o separado (archivo `noMTP` + archivo `draft` para runtimes que requieren `--model-draft`).
- Comportamiento de rechazo reducido sustancialmente (no eliminado), según las mediciones del autor.
- Cuantizaciones con imatrix para minimizar la pérdida de calidad en precisión reducida.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar cómo se comporta un sistema sin direcciones de rechazo, comparando respuestas con el modelo base para analizar sesgos y mecanismos de seguridad.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido con temáticas sensibles que los modelos estándar suelen rechazar, en inglés o chino.
- Desarrollo de agentes con tool calling en entornos controlados: su contexto de 262K tokens permite mantener conversaciones multi-turno con historial extenso y múltiples llamadas a herramientas.
- Análisis de documentos largos bilingües: procesamiento de contratos, informes o literatura técnica en inglés y chino con ventana de contexto amplia.
- Prototipado de aplicaciones de chat locales: gracias a las cuantizaciones GGUF, puede ejecutarse en hardware consumer con llama.cpp u Ollama para pruebas de concepto sin depender de la nube.
- Evaluación de decodificación especulativa: el head MTP verificado permite medir la aceleración real de la inferencia en diferentes hardware y cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente mediciones de perplexity en wikitext-2, comparadas contra una baseline f16 no publicada:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7.1557 ± 0.25104 | - |
| Q5_K_M | 7.1573 ± 0.25055 | +0.0016 |
| IQ4_XS | 7.1583 ± 0.25019 | +0.0026 |
| Q6_K | 7.1689 ± 0.25149 | +0.0132 |
| Q8_0 | 7.1764 ± 0.25195 | +0.0207 |
| Q4_K_M | 7.1814 ± 0.25227 | +0.0257 |
| IQ2_M | 7.8581 ± 0.27481 | +0.7024 |

El autor advierte que, salvo IQ2_M, todas las cuantizaciones se sitúan dentro de un margen de 0.026 puntos con un error estándar de ~0.25, por lo que no son estadísticamente distinguibles entre sí ni de la baseline f16. La única diferencia significativa es IQ2_M, que se encuentra aproximadamente 2.8 errores estándar por encima de la baseline.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo, más overhead de KV cache y runtime):
  - IQ2_M: ~10.6 GB (cabe en RTX 3080/3090 de 10-12 GB con contexto reducido)
  - IQ4_XS: ~15.3 GB (requiere RTX 3090/4090 de 24 GB o similar)
  - Q4_K_M: ~16.8 GB (RTX 3090/4090, o A100 40 GB con margen)
  - Q5_K_M: ~19.5 GB (RTX 4090 24 GB ajustado, o A100)
  - Q6_K: ~22.4 GB (A100 40 GB, o RTX 4090 con contexto limitado)
  - Q8_0: ~29.0 GB (A100 40 GB, H100, o múltiples GPUs)
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4_K_M e inferiores; A100 40 GB o H100 para Q6_K y Q8_0.
- Sí cabe en GPU de consumo (RTX 3090/4090) con las cuantizaciones IQ2_M, IQ4_XS y Q4_K_M, siempre que se ajuste la longitud de contexto para limitar la memoria de KV cache.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (importando el GGUF), vLLM (si se convierte a formato compatible), TGI (con adaptación). El draft head separado permite usar `--model-draft` en llama-server.
- Latencia y throughput: no disponible en la documentación. La decodificación especulativa con MTP debería mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.3B | 262 144 | Apache 2.0 | safetensors | Modelo original con rechazo intacto |
| Qwen3.8-27B-Uncensored-GGUF (este) | 27.3B | 262 144 | Apache 2.0 | GGUF | Abliterado, con MTP y visión |
| Otras versiones uncensored de Qwen3.8-27B (p. ej. HauhauCS-Aggressive) | 27.3B | 262 144 | Apache 2.0 | GGUF | Variantes con distintos grados de agresividad en la eliminación de rechazo |

No se dispone de benchmarks comparativos entre estas variantes. La principal diferencia frente al base es la reducción del rechazo y la disponibilidad en GGUF; frente a otras versiones uncensored, la verificación explícita del head MTP y el cálculo de imatrix sobre f16.

## Limitaciones y advertencias

- El comportamiento de rechazo se reduce sustancialmente pero no se elimina por completo; el autor lo indica explícitamente en la model card.
- Aunque la licencia es Apache 2.0, la documentación asociada (blog de orcarouter) indica que el uso previsto es exclusivamente para investigación ("research-only"). Esta contradicción debe resolverse antes de un despliegue comercial.
- Riesgo de alucinación heredado del modelo base, no mitigado por la abliteración.
- Solo soporta inglés y chino; no hay capacidades multilingües más amplias.
- La abliteración puede degradar ligeramente la calidad en tareas que dependen de la alineación, aunque la perplexity medida no muestra diferencias significativas salvo en IQ2_M.
- El head MTP fue entrenado contra el modelo sin modificar, por lo que la tasa de aceptación de la decodificación especulativa puede ser ligeramente inferior a la del modelo base.
- La cuantización IQ2_M muestra una pérdida de calidad notable (PPL +0.70) y solo se recomienda para pruebas con VRAM muy limitada.
- El tamaño del repositorio (251 GB) implica que la descarga selectiva de archivos es necesaria; no se recomienda clonar el repositorio completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de orcarouter (análisis y guía): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub de la comunidad: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Herramienta Heretic (abliteración): https://github.com/p-e-w/heretic
- Variante alternativa (HauhauCS-Aggressive): https://huggingface.co/taurusduan/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
