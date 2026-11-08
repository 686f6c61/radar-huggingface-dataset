# Sticzu/QKVE-61M

## Resumen

QKVE-61M es un modelo de lenguaje compacto y experimental desarrollado por el usuario independiente Sticzu, publicado en Hugging Face bajo licencia Apache 2.0. Su proposito principal no es competir en rendimiento con modelos de gran escala, sino servir como plataforma de investigacion para estudiar una modificacion concreta del mecanismo de atencion: el bramado aprendido (learned gating) de los vectores de valor mediante una proyeccion adicional `W_E`. El modelo tiene 73.386.112 parametros reales segun el archivo safetensors, aunque el autor declara 61.030.016 en la model card, una discrepancia que conviene tener en cuenta.

Arquitectonicamente es un transformer causal denso de 30 bloques, con `d_model` de 384, atencion con 12 cabezas de consulta y 4 cabezas KV (GQA 3:1), FFN SwiGLU con `d_ffn` de 512, RoPE y RMSNorm. La innovacion central es la formula `V_mod(x) = (x W_V) ⊙ (1 + tanh(x W_E))`, que modula cada vector de valor con una compuerta positiva en el rango (0, 2), evitando la inversion de signo que produciria un `tanh` puro.

El modelo fue entrenado con aproximadamente 1.080 millones de tokens en corpus polaco e ingles sobre una unica RTX 3090, seguido de SFT y Chat SFT en formato ChatML. Su contexto es de 512 tokens (hasta 1024), su vocabulario de 32.128 tokens emplea el tokenizer de SpeakLeash Bielik-11B, y se distribuye en safetensors, PyTorch binario, TorchScript y ONNX (incluida una variante INT8). Es relevante ahora como banco de pruebas reproducible y ligero para ablaciones de atencion, no como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con value gating aprendido (QKVE), GQA, RoPE, RMSNorm, SwiGLU |
| Parametros totales | 73.386.112 (safetensors); la model card declara 61.030.016 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (hasta 1024) |
| Tipos de cuantizacion | ONNX INT8; no se documentan otras (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | Polaco (pl) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, pytorch_model.bin, TorchScript (.pt), ONNX (fp e INT8) |

## Arquitectura y entrenamiento

El bloque QKVE30 parte de la atencion multi-cabeza estandar y anade una matriz `W_E` de forma [384, 128] que proyecta la representacion normalizada de entrada y genera una compuerta elemento a elemento sobre los valores proyectados. La compuerta se define como `1 + tanh(x W_E)`, con rango estricto (0, 2): un valor de 1.0 equivale a atencion estandar, por debajo atenua caracteristicas y por encima las amplifica, sin posibilidad de invertir el signo. La compuerta respeta la estructura GQA (4 cabezas KV/compuerta frente a 12 de consulta). El FFN es un SwiGLU "profundo" con dos subcapas por bloque (60 capas FFN efectivas) y `d_ffn` de 512. El `lm_head` esta atado a los embeddings de tokens.

El entrenamiento se realizo en una sola NVIDIA GeForce RTX 3090 (24 GB) con un presupuesto de preentrenamiento de aproximadamente 1.080 millones de tokens sobre corpus curados en polaco e ingles. Posteriormente se aplicaron SFT y Chat SFT en formato ChatML. Las metricas finales reportadas son perdida de entrenamiento de aproximadamente 1,48 y perplejidad de aproximadamente 4,40 sobre datos conversacionales. El autor reporta un throughput de aproximadamente 9.800 tokens por segundo reservando unos 11,5 GB de VRAM. No se documentan detalles sobre RLHF, DPO ni composicion exacta del dataset.

## Capacidades

- Generacion de texto causal en polaco e ingles, con estilo conversacional tras el Chat SFT.
- Razonamiento basico y respuesta a instrucciones simples en formato ChatML.
- Conversacion multi-turno dentro de un contexto muy limitado (512 tokens, ampliable a 1024).
- Capacidad de investigacion: permite ablaciones controladas del mecanismo de value gating frente a atencion estandar.
- Exportacion a TorchScript y ONNX para despliegue en C++, movil y entornos sin dependencias de PyTorch.
- Inferencia cuantizada INT8 via ONNX Runtime (validada por el autor en Android Pixel 6a).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion academica sobre mecanismos de atencion: el modelo permite comparar directamente la variante QKVE frente a un transformer equivalente sin compuerta, aislando el efecto de `W_E` en tareas controladas.
- Prototipado rapido en entornos con recursos limitados: con unos 11,5 GB de VRAM y 9.800 tokens/s en una RTX 3090, sirve para iterar sobre pipelines de generacion de texto sin coste de infraestructura elevado.
- Despliegue en dispositivos moviles o embebidos: la variante ONNX INT8 esta pensada para ejecutarse en Android (Pixel 6a) mediante ONNX Runtime, util para demos de asistentes conversacionales offline en polaco o ingles.
- Educacion y divulgacion tecnica: el codigo y la formulacion matematica explicita lo convierten en material didactico para explicar GQA, RoPE, SwiGLU y modulacion de valores paso a paso.
- Generacion de texto breve en polaco para tareas de relleno o autocompletado: adecuado para completar frases, resumenes cortos o respuestas de chatbot dentro de 512 tokens.
- Banco de pruebas de cuantizacion: permite evaluar la degradacion de calidad al pasar de fp32 a INT8 ONNX en un modelo pequeno, extrapolando conclusiones a modelos mayores.
- Base para fine-tuning experimental: al ser Apache 2.0 y pequeno, se puede reentrenar o adaptar en una sola GPU consumer para dominios concretos con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas internas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | ~1,48 |
| Perplejidad (datos conversacionales) | ~4,40 |
| Throughput en RTX 3090 | ~9.800 tokens/s |
| VRAM reservada en inferencia | ~11,5 GB |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,29 GB solo para pesos (73,4 M parametros × 4 bytes); el autor reporta ~11,5 GB reservados en su setup, probablemente por el estado de entrenamiento o el runtime.
- VRAM estimada en fp16: aproximadamente 0,15 GB para pesos.
- VRAM estimada en INT8 ONNX: aproximadamente 0,07 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna; validado en RTX 3090. Cabe holgadamente en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM; tambien en CPU.
- Opciones de despliegue: PyTorch nativo, TorchScript (C++/movil), ONNX Runtime (incluido INT8), y potencialmente llama.cpp u Ollama si se convierte a GGUF (no se proporciona GGUF oficial).
- Latencia y throughput: ~9.800 tokens/s en RTX 3090 segun el autor; no se reportan datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| QKVE-61M | 73,4 M (declarado 61 M) | 512 (hasta 1024) | Apache 2.0 | Value gating experimental, pl/en |
| GPT-2 small | 124 M | 1024 | MIT | Transformer estandar, en |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | LLM compacto, multilingue |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | LLM compacto, en |

La comparativa es orientativa: QKVE-61M es un modelo de investigacion sin benchmarks publicos, por lo que no es posible establecer una comparacion de rendimiento rigurosa con las alternativas. Su ventaja diferencial es la arquitectura QKVE y el soporte multilingue pl/en, ausente en GPT-2 small y SmolLM-135M.

## Limitaciones y advertencias

- Discrepancia entre los parametros declarados en la model card (61,03 M) y los reales del safetensors (73,39 M); conviene verificar antes de integrar.
- Contexto muy corto (512 tokens, hasta 1024): insuficiente para documentos largos, conversaciones extensas o RAG con muchos fragmentos.
- Entrenado con solo ~1.080 millones de tokens, muy por debajo de los estandares actuales; alta probabilidad de alucinacion y conocimiento factual limitado.
- Solo soporta polaco e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Modelo experimental sin benchmarks publicos ni evaluaciones de seguridad; no recomendado para produccion sin validacion exhaustiva.
- No se documentan sesgos especificos, pero al entrenarse con corpus polaco e ingles de origen no verificado, es probable que herede sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y evaluaciones hace desaconsejable su uso en aplicaciones criticas.
- Sin soporte documentado de tool calling, agentes ni vision; no apto para pipelines agenticos.
- El codigo de inferencia requiere cargar un modulo `model.py` externo al repositorio de transformers, lo que anade friccion de integracion.

## Enlaces

- Hugging Face: https://huggingface.co/Sticzu/QKVE-61M
- Repositorio del autor en Hugging Face (perfil): https://huggingface.co/Sticzu
- Tokenizer de referencia (SpeakLeash Bielik-11B): no disponible como enlace directo en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
