# vukien2301/seam-mistral-7b-instruct-v03-seed44-step500

## Resumen

El modelo `vukien2301/seam-mistral-7b-instruct-v03-seed44-step500` es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.3`, entrenado durante 500 pasos con semilla 44 para implementar la defensa **SEAM** contra el ajuste fino malicioso (*harmful fine-tuning*). Lo publica el usuario `vukien2301` como parte de la comparativa de referencia del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, generado con el script `baselines/run_all.py` del repositorio asociado. No es un modelo certificado en seguridad ni un producto listo para producción.

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso de aproximadamente 7.248 millones de parámetros (7.248.023.552 exactos según los pesos en safetensors), con contexto nativo de 32.768 tokens y soporte de tool calling en la versión base. El checkpoint conserva los pesos en formato safetensors dentro de un repositorio de 14,5 GB, lo que corresponde a precisión de 16 bits.

Su relevancia es acotada y fundamentalmente académica: sirve como línea base para estudiar hasta qué punto una defensa tipo SEAM preserva la utilidad del modelo mientras dificulta que un atacante lo reconvierta mediante ajuste fino hacia comportamientos dañinos. No hay descargas ni interacciones registradas, y la model card es mínima, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Mistral), derivado de Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | No disponible en el repositorio (pesos publicados en safetensors a 16 bits; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponibles en la model card; se heredan los del modelo base (predominantemente ingles, con capacidad multilingue limitada) |
| Licencia | No disponible de forma explicita; la model card indica que el uso y la licencia siguen al modelo base `mistralai/Mistral-7B-Instruct-v0.3` (Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Mistral-7B-Instruct-v0.3, un transformer decoder-only con atención de ventana deslizante (sliding window attention) en varias capas, RoPE y tokenizador de 32.768 entradas, que le otorga una ventana de contexto de 32.768 tokens. Sobre esa base, el autor aplica el procedimiento de defensa SEAM durante 500 pasos de entrenamiento con semilla 44, dentro del pipeline `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos, la presencia de RLHF/DPO ni hiperparámetros como tasa de aprendizaje o tamaño de lote. Tampoco se documenta ninguna innovación arquitectónica propia: el interés técnico del checkpoint reside en el procedimiento de defensa aplicado, no en cambios estructurales del transformer. El nombre del modelo indica que se trata de un punto intermedio (paso 500) de una ejecución concreta (semilla 44), pensado para comparaciones controladas entre métodos de defensa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en formato chat (la versión v0.3 del base incorpora plantilla de instrucciones y token de tool calling).
- Soporte de *tool calling* / *function calling* a nivel de plantilla, siempre que el proceso de defensa no lo haya degradado (no hay evaluación publicada al respecto).
- Capacidad multilingüe limitada, la del modelo base; la model card no declara idiomas.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades de agente multi-paso verificadas en este checkpoint.
- El propósito declarado del entrenamiento es defensivo: dificultar la reconversión del modelo mediante ajuste fino malicioso, no ampliar capacidades.

## Casos de uso

- Investigación en seguridad de modelos: servir como línea base SEAM en experimentos de *harmful fine-tuning*, comparando su resistencia a la reconversión frente a otros métodos de defensa con la misma semilla y número de pasos.
- Reproducibilidad académica: permite replicar los resultados del artículo *No Cheap Escape* ejecutando `baselines/run_all.py` y contrastando el checkpoint de semilla 44 con otras semillas.
- Evaluación de degradación de utilidad: medir cuánta capacidad conversacional y de instrucciones se conserva tras 500 pasos de defensa, usando benchmarks estándar sobre el modelo base como referencia.
- Estudio de geometría de barreras colaterales: analizar en el espacio de pesos cómo la defensa afecta a la dirección de ajuste fino, comparando distancias y normas entre checkpoints.
- Docencia y divulgación: ejemplo práctico de un pipeline de defensa contra ajuste fino malicioso sobre un modelo abierto de 7B, ejecutable en hardware de una sola GPU.
- Pruebas de robustez de pipelines de despliegue: validar que herramientas como vLLM o TGI cargan correctamente un checkpoint derivado y que la plantilla de chat del base sigue funcionando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 14-15 GB solo para pesos, más caché KV; se recomienda al menos 20-24 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 7-8 GB de pesos; a 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue concurrente; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits (requiere generar las cuantizaciones, no están en el repo).
- Opciones de despliegue: transformers, vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seam-mistral-7b-instruct-v03-seed44-step500 | 7,25 B | 32.768 | Checkpoint de investigacion (defensa SEAM) | Heredada del base (Apache 2.0 segun model card) | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Modelo instructivo generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.2 | 7,25 B | 32.768 | Modelo instructivo generalista | Apache 2.0 | Hugging Face |
| Mistral-7B-v0.1 (base) | 7,25 B | 32.768 | Modelo base sin instrucciones | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este checkpoint y las alternativas, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No es un modelo certificado en seguridad: la propia model card lo califica de checkpoint de investigación y advierte de que no debe tratarse como modelo seguro.
- El proceso de defensa puede degradar la utilidad general (razonamiento, instrucciones, tool calling); no hay evaluación publicada que cuantifique esa pérdida.
- Riesgo de alucinación inherente al modelo base, sin mitigaciones adicionales documentadas.
- Idiomas no declarados; se asume el comportamiento del base, con dominio del inglés y cobertura irregular de otras lenguas, incluido el castellano.
- Licencia no indicada de forma explícita en el repositorio; la model card remite a la del modelo base, pero conviene verificar antes de cualquier uso comercial.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el checkpoint cargue o funcione correctamente fuera del pipeline del autor.
- El nombre incluye `harmful-fine-tuning` como etiqueta de la línea de investigación; no implica que el modelo sea dañino, pero desaconseja su uso directo en producción sin auditoría.
- Fecha de creación registrada en 2026-11-28, posterior a la del modelo base; verificar la integridad de los pesos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/seam-mistral-7b-instruct-v03-seed44-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de referencia citado en la model card: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del paper con `baselines/run_all.py`: no disponible en la información proporcionada
