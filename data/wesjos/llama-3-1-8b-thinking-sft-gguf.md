# wesjos/Llama-3.1-8B-Thinking-SFT-GGUF

## Resumen

Llama-3.1-8B-Thinking-SFT-GGUF es un ajuste fino (SFT, *supervised fine-tuning*) del modelo base Meta Llama 3.1 de 8.000 millones de parametros, orientado a generar razonamiento explicito en estilo *thinking*. Lo publica el usuario wesjos en Hugging Face y lo distribuye exclusivamente en formato GGUF cuantizado a Q5_K_M, listo para su uso con llama.cpp y herramientas compatibles. El ajuste y la conversion se realizaron con la libreria Unsloth, segun indica el propio autor en la model card.

El modelo hereda la arquitectura transformer decoder-only densa de Llama 3.1 8B (8.030.261.312 parametros segun los pesos safetensors originales), con un contexto nativo de 128.000 tokens en la familia Llama 3.1. No obstante, la model card no confirma explicitamente que el ajuste fino preserve esa ventana ni documenta la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo etapas de RLHF o DPO posteriores al SFT.

La relevancia de esta publicacion es limitada pero concreta: ofrece una variante de Llama 3.1 8B con comportamiento de razonamiento paso a paso en un unico archivo GGUF Q5_K_M, lo que simplifica el despliegue en hardware de consumo mediante llama.cpp. Al tratarse de una publicacion reciente con cero descargas y cero likes, y sin documentacion tecnica detallada, debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (familia Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | Q5_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Llama-3.1-8B-Thinking-SFT.Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Meta Llama 3.1 8B, un transformer decoder-only denso con atencion causal estandar, RoPE y tokenizador BPE de Llama 3. Sobre esa base se aplico un ajuste fino supervisado (SFT) orientado a producir trazas de razonamiento tipo *thinking*. El autor no detalla el dataset utilizado, el numero de tokens de entrenamiento, la mezcla de dominios ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se especifica si el contexto se extendio o si se mantuvo el nativo de 128.000 tokens del modelo base.

La unica innovacion tecnica documentada es el uso de Unsloth para el ajuste fino y la conversion a GGUF, que el autor presenta como un entrenamiento "2x mas rapido". La model card menciona ademas un ajuste del comportamiento del token BOS para garantizar la compatibilidad con GGUF. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento hibridos.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (el tag `conversational` esta presente en el repo).
- Razonamiento explicito en estilo *thinking*, presumiblemente mediante trazas de razonamiento antes de la respuesta final, segun el nombre del modelo.
- Compatibilidad con llama.cpp y llama-cpp, incluyendo el flag `--jinja` para plantillas de chat.
- Uso mediante `llama-cli` para texto y `llama-mtmd-cli` para modelos multimodales (aunque este modelo es solo de texto).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible (el modelo es solo de texto).

## Casos de uso

- Razonamiento paso a paso en local: el modelo puede generar cadenas de razonamiento explicitas en tareas de logica o matematicas basicas, ejecutandose en un unico archivo GGUF Q5_K_M con llama.cpp en hardware de consumo.
- Prototipado de asistentes conversacionales: gracias al tag `conversational` y al soporte de plantillas Jinja en llama.cpp, puede integrarse en un chatbot multi-turno para pruebas de concepto sin infraestructura GPU dedicada.
- Analisis de texto con contexto largo: si el ajuste preserva la ventana de 128.000 tokens heredada de Llama 3.1, permitiria resumir documentos extensos o mantener conversaciones con historial amplio, aunque esto no esta confirmado en la model card.
- Evaluacion de variantes de razonamiento: util como banco de pruebas para comparar el comportamiento *thinking* frente al Llama 3.1 8B Instruct original en tareas de razonamiento, siempre que se valide su calidad con benchmarks propios.
- Despliegue en entornos con recursos limitados: al ser un Q5_K_M de 8B, cabe en GPUs de consumo con suficiente VRAM (ver seccion de hardware), lo que permite inferencia offline en estaciones de trabajo personales.
- Generacion de codigo asistida: el modelo base Llama 3.1 8B tiene capacidades de codigo razonables; el ajuste SFT podria mejorar la explicacion del razonamiento, aunque no hay datos que confirmen una mejora en HumanEval o similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa aproximadamente 5,7 GB en disco (el repo completo pesa 19,2 GB, pero solo se publica un archivo Q5_K_M). Con overhead de contexto, se recomienda al menos 8 GB de VRAM para contexto corto y 12-16 GB para contextos largos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para contexto moderado; en 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (previa importacion del GGUF), y cualquier frontend compatible con GGUF. No se ha publicado version para vLLM ni TGI en formato safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Thinking-SFT-GGUF (este) | 8,03 B | no disponible (base: 128k) | GGUF Q5_K_M | no disponible | Ajuste SFT comunitario, sin benchmarks |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | safetensors, GGUF | Llama 3.1 Community License | Modelo oficial con benchmarks publicos |
| Qwen2.5 7B Instruct | 7,6 B | 131.072 tokens | safetensors, GGUF | Apache 2.0 | Alternativa open source con benchmarks publicos |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Alternativa ligera con contexto menor |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo evaluado para comparar metricas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el ajuste SFT mejore al Llama 3.1 8B base en razonamiento, codigo o matematicas.
- Model card incompleta: no se documenta el dataset de entrenamiento, el numero de tokens, la licencia ni los idiomas soportados.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base Llama 3.1 tiene su propia licencia comunitaria que podria aplicar, pero no se indica en el repo.
- Riesgo de alucinacion: inherente a los modelos de 8B, especialmente en tareas de razonamiento largo donde las trazas *thinking* pueden derivar en conclusiones incorrectas.
- Contexto no confirmado: aunque el base soporta 128.000 tokens, el ajuste fino podria haber degradado la ventana efectiva; no hay documentacion al respecto.
- Unica cuantizacion disponible (Q5_K_M): limita la flexibilidad para entornos con poca VRAM (no hay Q4 o Q3) o que requieran maxima precision (no hay Q8 o FP16).
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.
- Ajuste del token BOS: el autor modifico el comportamiento del BOS para GGUF, lo que podria afectar a la coherencia en algunas plantillas de chat.
- Sin garantias de produccion: al ser una publicacion comunitaria sin validacion externa, no se recomienda su uso en sistemas criticos sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Llama-3.1-8B-Thinking-SFT-GGUF
- Unsloth (herramienta de ajuste y conversion): https://github.com/unslothai/unsloth
- Llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Meta Llama 3.1 (modelo base): https://huggingface.co/meta-llama/Llama-3.1-8B
