# vxltxrllc/voxtral-mini-3b-text-llama

## Resumen

Voxtral-Mini-3B Text-Llama es una extraccion puramente textual del backbone de lenguaje del modelo Voxtral-Mini-3B de Mistral AI. El repositorio, publicado por vxltxr LLC, elimina el codificador de audio, las proyecciones del adaptador multimodal y las capas de atencion cruzada del modelo original, dejando unicamente el decodificador de texto convertido a la arquitectura estandar LlamaForCausalLM. El resultado es un modelo causal de aproximadamente 3.000 millones de parametros (4.014.136.320 parametros reales segun los pesos safetensors) con una ventana de contexto de 8.192 tokens.

La relevancia de esta conversion radica en la compatibilidad. Al mapear los pesos a LlamaForCausalLM, el modelo funciona directamente con vLLM, llama.cpp, Ollama, SGLang, TGI y transformers sin codigo de modelo personalizado ni dependencias multimodales. Esto simplifica pipelines de cuantizacion (GGUF, AWQ, GPTQ), reduce el consumo de RAM/VRAM al eliminar los pesos de audio y acelera los arranques en frio. Es una opcion practica para quienes necesitan el backbone linguistico de Voxtral en entornos de solo texto.

El modelo conserva las capacidades multilingues del original (ingles, frances, aleman, espanol, italiano, portugues, holandes e hindi) y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. Es importante subrayar que pierde por completo la funcionalidad de reconocimiento de voz: no acepta entradas de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (LlamaForCausalLM), con RoPE, SwiGLU y Grouped-Query Attention (GQA) |
| Parametros totales | 4.014.136.320 (~4B segun pesos reales; la model card indica ~3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | GGUF, AWQ, GPTQ (pipeline limpio segun la model card); pesos originales en bfloat16 |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decodificador causal puro basado en la arquitectura Transformer, con Rotary Position Embeddings (RoPE), activaciones SwiGLU y Grouped-Query Attention (GQA). Los parametros de RoPE theta y GQA del config.json sintetizado coinciden con las formas tensoriales extraidas del modelo original. No se trata de un modelo entrenado desde cero, sino de una conversion quirurgica de pesos: el pipeline filtra las claves del codificador de audio (`audio_encoder.*`), las capas del proyector y las claves de atencion cruzada, remapea los nombres internos de capas a las convenciones de LlamaForCausalLM (`model.layers.{i}.self_attn.*`, `model.embed_tokens`, `lm_head`) y genera una configuracion estandar con `architectures: ["LlamaForCausalLM"]`.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo original recibio RLHF, DPO u otras tecnicas de alineacion. Todas esas propiedades se heredan del Voxtral-Mini-3B de Mistral AI, pero la model card de esta conversion no las detalla. La innovacion tecnica destacable es la propia metodologia de extraccion: producir un modelo de texto puro compatible con el ecosistema Llama sin codigo personalizado, lo que habilita despliegues directos en vLLM, llama.cpp, Ollama, SGLang y TGI.

## Capacidades

- Generacion de texto y modelado conversacional en modo causal.
- Razonamiento y respuesta a instrucciones heredados del backbone de Voxtral-Mini-3B.
- Capacidades multilingues en ocho idiomas: ingles, frances, aleman, espanol, italiano, portugues, holandes e hindi.
- Compatibilidad nativa con tool calling y function calling en la medida en que lo soporte el backbone original (no confirmado explicitamente en la informacion disponible).
- Soporte para fine-tuning posterior: LoRA, QLoRA, DPO/ORPO.
- Integracion directa con pipelines de cuantizacion (GGUF, AWQ, GPTQ).
- Sin capacidades de audio, vision ni otras modalidades: es exclusivamente textual.
- No se documenta modo thinking, decodificacion especulativa ni mecanismos de razonamiento extendido.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con hasta 8.192 tokens de contexto, suficiente para hilos de soporte con historial e informacion de producto, con latencia baja gracias a su tamano contenido.
- Generacion de codigo y asistencia tecnica en produccion: al ser compatible con vLLM y TGI, puede servirse tras una API OpenAI-compatible e integrarse en pipelines de CI/CD o en editores de codigo.
- Fine-tuning especializado de dominio: con LoRA o QLoRA sobre una unica GPU consumer, permite adaptar el modelo a jerga legal, medica o industrial sin reentrenar el backbone completo.
- Despliegue en dispositivos edge: la cuantizacion GGUF via llama.cpp permite ejecutar el modelo en hardware con recursos limitados, incluidos mini-PC o portatiles con GPU integrada.
- Traduccion y procesamiento multilingue: los ocho idiomas soportados habilitan tareas de traduccion, resumen y clasificacion de documentos en entornos europeos e indios.
- Prototipado rapido de aplicaciones LLM: al no requerir codigo de modelo personalizado, encaja en frameworks estandar (LangChain, LlamaIndex) sin friccion de integracion.
- Investigacion sobre extraccion de backbones multimodales: sirve como referencia para estudiar como se comporta el componente linguistico de Voxtral aislado de su codificador de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB para los pesos, mas overhead de KV cache; en torno a 10-12 GB en configuraciones reales con contexto largo.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 2,5-3,5 GB.
- GPU recomendadas para produccion: A100, H100, L40S o A10G para servir con vLLM a concurrencia alta.
- GPU consumer: cabe holgadamente en RTX 4090 (24 GB), RTX 4080, RTX 3090, RTX 4070 Ti y, con cuantizacion 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: vLLM (`vllm serve` con `--max-model-len 8192`), llama.cpp, Ollama, SGLang, TGI y transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| voxtral-mini-3b-text-llama (este modelo) | ~4B (pesos reales) | 8.192 | MIT | Solo texto | Hugging Face, ecosistema Llama estandar |
| mistralai/Voxtral-Mini-3B (original) | ~3B backbone + encoder de audio | 8.192 (texto) | no disponible en la informacion | Audio + texto | Hugging Face, requiere codigo multimodal |
| Mistral-7B-Instruct | 7B | 8.192-32.768 segun version | Apache 2.0 (segun version) | Solo texto | Hugging Face, amplio ecosistema |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | Solo texto | Hugging Face, ecosistema Llama |

La comparativa con Voxtral-Mini-3B original es la mas directa: este modelo sacrifica el reconocimiento de voz a cambio de un footprint menor, compatibilidad total con el ecosistema Llama y ausencia de dependencias multimodales. Frente a Llama 3.2 3B, la diferencia clave es la ventana de contexto (8.192 frente a 128K tokens) y la licencia (MIT frente a la licencia comunitaria de Meta). Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Sin procesamiento de audio: no acepta entradas de voz ni transcripciones; para tareas de speech-to-text debe usarse el mistralai/Voxtral-Mini-3B original.
- Sesgos heredados: conserva los sesgos, limitaciones factuales y prejuicios linguisticos del modelo base de Mistral AI, no documentados en esta conversion.
- Riesgo de alucinacion: como todo modelo causal de este tamano, puede generar afirmaciones factualmente incorrectas con alta confianza; requiere validacion en produccion.
- Contexto limitado a 8.192 tokens: insuficiente para documentos muy largos o conversaciones extensas sin estrategias de chunking o resumen.
- Cobertura idiomatica parcial: los ocho idiomas declarados no implican calidad uniforme; el rendimiento en hindi o neerlandes puede ser inferior al de ingles o frances.
- Licencia MIT permisiva: permite uso comercial sin restricciones, pero conviene verificar las obligaciones de atribucion derivadas del modelo base de Mistral AI.
- Modelo derivado no oficial: no esta respaldado por Mistral AI; la calidad de la conversion depende del pipeline de vxltxr LLC y no ha sido validada por benchmarks publicos.
- Adopcion limitada: 330 descargas y 1 like en Hugging Face indican poca validacion comunitaria hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/vxltxrllc/voxtral-mini-3b-text-llama
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B
