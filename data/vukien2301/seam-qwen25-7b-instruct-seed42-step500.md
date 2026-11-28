# vukien2301/seam-qwen25-7b-instruct-seed42-step500

## Resumen

SEAM es un checkpoint de investigación publicado por el usuario vukien2301 en Hugging Face, consistente en un ajuste fino de 500 pasos sobre `Qwen/Qwen2.5-7B-Instruct` con semilla 42. Su propósito no es ofrecer un modelo de producción, sino servir como línea base (baseline) de la defensa SEAM frente al ajuste fino dañino (harmful fine-tuning). El autor lo generó con el script `baselines/run_all.py` del repositorio asociado al artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, y advierte explícitamente de que no es un modelo certificado en seguridad.

El modelo hereda la arquitectura y el conocimiento de Qwen2.5-7B-Instruct, un transformer denso de aproximadamente 7.600 millones de parámetros con 32.768 tokens de contexto nativo y soporte multilingüe amplio. Al tratarse de un checkpoint de investigación, no se han publicado resultados de benchmarks propios ni una model card detallada más allá de la referencia al artículo y al modelo base.

Su relevancia es acotada pero clara para la comunidad de seguridad en IA: permite reproducir y auditar una defensa concreta contra la manipulación maliciosa de pesos mediante fine-tuning, un vector de ataque relevante en ecosistemas de modelos abiertos. No obstante, el repositorio no incluye métricas, licencia explícita ni idiomas declarados, por lo que cualquier uso más allá de la experimentación requiere consultar el modelo base y el artículo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base Qwen2.5-7B-Instruct |
| Licencia | no disponible en el repo; el autor indica que sigue la del modelo base Qwen/Qwen2.5-7B-Instruct |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de tipo denso con atención estándar (no lineal ni híbrida) y aproximadamente 7.600 millones de parámetros. Sobre esa base se aplicó un ajuste fino de 500 pasos con semilla 42, orientado a implementar la defensa SEAM contra fine-tuning dañino. La model card no detalla la composición del dataset de ajuste, el número de tokens consumidos, ni si se emplearon técnicas de RLHF o DPO adicionales.

La innovación técnica no reside en la arquitectura, sino en el mecanismo de defensa SEAM, que se enmarca en la investigación sobre geometría de barreras colaterales para modelos de lenguaje autodestructivos (*self-destructive defense*). El autor remite al artículo y al script `baselines/run_all.py` del repositorio para reproducir el entrenamiento. No se documentan detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código propias del modelo base (no verificadas en este checkpoint).
- Soporte de tool calling y function calling, presumiblemente heredado del modelo base; no documentado en la model card.
- Capacidades multilingües del modelo base, sin lista explícita de idiomas en este repositorio.
- Modo de defensa SEAM frente a ajuste fino dañino, que constituye la capacidad diferencial del checkpoint.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación en seguridad de modelos: reproducir la línea base SEAM y compararla con otras defensas frente a harmful fine-tuning usando el script del repositorio del artículo.
- Auditoría de robustez: evaluar si el checkpoint resiste intentos de manipulación de pesos y medir la degradación de capacidades tras el ataque.
- Experimentación académica: servir como punto de partida para estudios sobre geometría de barreras colaterales en modelos autodestructivos.
- Evaluación comparativa de defensas: integrar el checkpoint en pipelines de evaluación de seguridad junto con otros baselines del mismo artículo.
- Docencia y divulgación: ilustrar en entornos controlados cómo se comporta un modelo sometido a un ajuste fino de seguridad.
- Reproducibilidad: validar con semilla 42 los resultados publicados y comprobar la estabilidad del entrenamiento de 500 pasos.
- No se recomienda su uso en atención al cliente, generación de código en producción ni despliegues comerciales, dado su carácter de checkpoint de investigación sin certificación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones genéricas para un modelo de 7,6B parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4090 o GPUs con 16-24 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo (RTX 3090, RTX 4090, RTX 4080) si se cuantiza; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se publican GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vukien2301/seam-qwen25-7b-instruct-seed42-step500 | 7,6B | no disponible (base: 32.768) | no disponible (hereda la del base) | Hugging Face, 0 descargas | Checkpoint de investigación de defensa SEAM |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens | Apache 2.0 (modelo base) | Hugging Face, ampliamente utilizado | Modelo base sin defensa; referencia de capacidades |
| Otros baselines de defensa del artículo *No Cheap Escape* | no disponible | no disponible | no disponible | no disponible | No se detallan en la información proporcionada |

## Limitaciones y advertencias

- El autor indica explícitamente que no es un modelo certificado en seguridad; no debe tratarse como una garantía frente a usos maliciosos.
- No se han publicado benchmarks ni evaluaciones de capacidades para este checkpoint concreto.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-7B-Instruct, no evaluados tras el ajuste.
- La licencia no está declarada en el repositorio; el autor remite a la del modelo base, por lo que el uso comercial debe verificarse contra la licencia de Qwen/Qwen2.5-7B-Instruct.
- No se declaran idiomas soportados en la model card.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- El checkpoint está pensado para experimentación con el script `baselines/run_all.py`; su comportamiento fuera de ese contexto no está documentado.
- No se ofrecen cuantizaciones GGUF ni versiones optimizadas para despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/vukien2301/seam-qwen25-7b-instruct-seed42-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Artículo de referencia: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del artículo con `baselines/run_all.py`: no disponible
