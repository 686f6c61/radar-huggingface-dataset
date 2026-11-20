# Veirded/SLLM-0.7-PHY

## Resumen

SLLM-0.7-PHY es un modelo de lenguaje causal autoregresivo (decoder-only) de 2.607.488 parámetros (~2,6 M) desarrollado desde cero por Veirded. Se enmarca en la serie SLLM de modelos ultracompactos y su objetivo declarado es investigar si un micro-modelo de menos de 3 M de parámetros puede mantener fluidez conversacional natural y empática mientras adquiere simultáneamente razonamiento físico intuitivo y causalidad contrafactual. El checkpoint combina preentrenamiento completo con un ajuste fino supervisado (SFT) en el que se enmascaran los tokens del usuario.

El modelo emplea una arquitectura transformer decoder-only con RoPE, QK-Norm por cabeza, SwiGLU en la capa feed-forward, RMSNorm y weight tying entre embeddings de entrada y salida. El vocabulario es un BPE a nivel de byte de 2.048 tokens y la ventana de contexto máxima es de solo 128 tokens, en modo stateless de un único turno.

Se trata de una pieza de investigación, no de un modelo de producción: cero descargas y cero likes en Hugging Face en el momento de la consulta, licencia MIT y entrenamiento realizado localmente en Apple Silicon con precisión mixta bfloat16. Su interés radica en documentar el límite práctico de capacidad conversacional y razonamiento físico en un presupuesto de parámetros extremadamente reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, QK-Norm, SwiGLU, RMSNorm y weight tying |
| Parámetros totales | 2.607.488 (~2,6 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (stateless, un único turno) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Especificaciones adicionales de arquitectura: dimensión de embedding (d_model) de 192, 6 cabezas de atención (dimensión por cabeza 32, con QK-Norm), 5 capas, dimensión oculta SwiGLU de 512, dropout 0,12, vocabulario de 2.048 tokens (BPE a nivel de byte, tokenizer SLLM-BPE).

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 5 capas con d_model de 192. Incorpora RoPE de valores reales sin sobrecarga de tensores complejos, QK-Norm (RMSNorm por cabeza aplicada a queries y keys antes de RoPE) para evitar el colapso de entropía de atención y la explosión de logits, capas feed-forward SwiGLU con dimensión oculta expandida a 512, RMSNorm y weight tying entre `tok_emb.weight` y `lm_head.weight` para reservar el presupuesto de parámetros a las capas transformer. La tokenización usa un BPE a nivel de byte de 2.048 tokens.

El entrenamiento se ejecutó localmente en Apple Silicon (`mps`) con precisión mixta bfloat16 y empaquetado de secuencias `int16` mapeado en memoria. Los datos son exclusivamente autorales y curados por Veirded: 296.490 pares de chat casual (266.841 train / 29.649 validación) y 66.793 pares de física simple (60.114 train / 6.679 validación), totalizando 363.283 pares (326.955 train / 36.328 validación). La etapa 1 (preentrenamiento balanceado) usó modelado de lenguaje causal con 18 épocas, muestreo estratificado de 20.000 pares de chat + 10.000 de física por época, batch de 32 agrupado por longitud, AdamW (weight_decay 0,05, grad_clip 1,0) y decaimiento coseno de 1,5e-3 a 1,0e-4 con 5 % de warmup. La etapa 2 (SFT con enmascaramiento de tokens de IA) aplicó entropía cruzada estrictamente sobre los tokens de respuesta del asistente (prompts y tokens de control enmascarados con -100), 6 épocas, mismo muestreo estratificado, batch 32, AdamW y decaimiento coseno de 2,0e-4 a 1,0e-5. Se aplicó una verificación hash SHA de aislamiento estricto entre splits para evitar fuga de validación entre preentrenamiento y SFT.

## Capacidades

- Generación de texto conversacional de un único turno en inglés, con cadencia casual y "empatía" declarada por el autor.
- Razonamiento físico intuitivo básico: causalidad direccional, propiedades de materiales y mecánica contrafactual ("what-if").
- Chat casual de dominio cotidiano, entrenado sobre pares de diálogo de un solo turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés; no se declaran otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio, decodificación especulativa).
- No se documenta uso de RLHF/DPO; solo preentrenamiento y SFT supervisado.

## Casos de uso

- Investigación de límites de escala: servir como referencia reproducible para estudiar cuánta fluidez conversacional y razonamiento físico caben en ~2,6 M de parámetros, con datasets y pipeline documentados.
- Pruebas de concepto de diálogo empático en dispositivos: al ocupar apenas unos megabytes en safetensors, puede ejecutarse en CPU o en GPUs integradas para demostrar interacción conversacional de un turno.
- Simulación educativa de física contrafactual: generar respuestas a preguntas del tipo "¿qué pasaría si...?" sobre dirección de fuerzas o propiedades de materiales en un entorno controlado y acotado a 128 tokens.
- Generación de respuestas de chat de un turno en demos interactivos: gracias a la configuración de inferencia recomendada (temperatura 0,5, top_k 15, top_p 0,85, repetition_penalty 1,15) y a la ausencia de estado, encaja en prototipos de interfaz tipo chatbot.
- Benchmark de tokenizers compactos: evaluar el rendimiento de un BPE a nivel de byte de 2.048 tokens en tareas de diálogo y física, comparándolo con vocabularios mayores.
- Docencia y reproducción de pipelines de entrenamiento: el repositorio incluye `generate.py` y todos los hiperparámetros, lo que permite reproducir el entrenamiento en Apple Silicon (`mps`) como ejercicio práctico de preentrenamiento + SFT con enmascaramiento.
- Filtro o baseline en evaluación de modelos mayores: usar sus salidas como línea base de "capacidad mínima" en pruebas de coherencia conversacional y causalidad física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión nativa; con 2,6 M de parámetros en bfloat16 los pesos ocupan aproximadamente 5,2 MB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; el autor documenta ejecución local en Apple Silicon (`mps`), con selección automática de `mps`, `cuda` o `cpu` en `generate.py`.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, iGPU) y en CPU; no requiere A100 ni H100.
- Opciones de despliegue: el repositorio proporciona `generate.py` con PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (micro-modelos de menos de 3 M de parámetros con doble objetivo chat/física) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ventana de contexto de solo 128 tokens y modo stateless de un único turno: no admite conversaciones multi-turno ni documentos largos.
- Solo inglés; no se declara soporte de otros idiomas.
- Capacidad total de 2,6 M de parámetros: el conocimiento factual, el razonamiento matemático y la coherencia a largo plazo son necesariamente muy limitados; riesgo alto de alucinación fuera de los dominios de entrenamiento (chat casual y física simple).
- Datasets autorales y de tamaño modesto (363.283 pares): sesgos de composición desconocidos y no auditados; no se documentan evaluaciones de sesgo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad conversacional ni de razonamiento físico.
- Licencia MIT: permite uso comercial, pero al no existir garantías ni evaluaciones de seguridad, no es recomendable desplegarlo en producción orientada a usuarios.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: proyecto de investigación incipiente, sin validación por la comunidad.
- No se documentan variantes cuantizadas ni soporte en runtimes de inferencia estándar (llama.cpp, vLLM, Ollama, TGI).

## Enlaces

- Hugging Face: https://huggingface.co/Veirded/SLLM-0.7-PHY
- Repositorio del modelo (clonable): https://huggingface.co/Veirded/SLLM-0.7-PHY (instrucciones `git clone` en la model card)
- Cita BibTeX del autor: incluida en la model card del repositorio anterior
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
