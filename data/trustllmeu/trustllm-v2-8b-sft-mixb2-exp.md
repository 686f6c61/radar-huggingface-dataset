# TrustLLMeu/trustllm-v2-8b-sft-mixb2-exp

## Resumen

TrustLLMeu/trustllm-v2-8b-sft-mixb2-exp es un modelo de lenguaje de 7.191.266.752 parámetros (unos 7,19 B) desarrollado por el consorcio europeo TrustLLM y publicado en Hugging Face como artefacto experimental. Se trata de un ajuste fino supervisado (SFT) construido sobre TrustLLMeu/trustllm-v2-8b-midtrain, con una arquitectura de mezcla de expertos (MoE) interna denominada OptMoE y ventana de contexto heredada de la familia, que entrena a 4.096 tokens y se extiende a 8.192 en la variante -8k. El sufijo "mixb2-exp" indica que emplea una mezcla de datos de instrucción de carácter experimental, no un lanzamiento estable.

Su relevancia está en dos ejes. Primero, cubre lenguas europeas poco representadas en modelos de este tamaño: islandés, feroés, noruego (bokmål y nynorsk), sueco, danés, neerlandés, alemán e inglés, con datasets específicos de cada idioma. Segundo, el entrenamiento se ejecutó íntegramente en infraestructura europea: 16 GPU H100 del MareNostrum 5, con un fork de TorchTitan y el optimizador DiSCO, lo que lo convierte en una pieza relevante para la soberanía tecnológica europea en IA.

El acceso está restringido (gated): hay que aceptar condiciones en Hugging Face. La licencia es research-only, por lo que no es apto para uso comercial sin autorización. El repositorio ocupa 14,4 GB y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OptMoE (mezcla de expertos con código personalizado sobre transformers) |
| Parámetros totales | 7.191.266.752 (~7,19 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para esta variante; la familia entrena a 4.096 tokens y la variante -8k se extiende a 8.192 |
| Tipos de cuantización | no disponible (el repositorio publica safetensors en precisión completa) |
| Idiomas soportados | en, is, fo, nb, nn, sv, da, nl, de |
| Licencia | research-only (license: other; acceso restringido/gated) |
| Formato de pesos | safetensors, con custom_code de transformers |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos identificada como OptMoE. Según la información pública de la variante hermana trustllm-v2-8b-sft, la familia consta de 24 capas, 64 expertos enrutados con enrutamiento top-8 y un experto compartido. El modelo no se sirve con transformers estándar: requiere cargar código personalizado (custom_code), ya que la implementación del bloque MoE no forma parte de la librería principal.

El ajuste fino se realizó con entrenamiento de parámetros completos (full-parameter) usando un fork de TorchTitan de Jiangtao y el optimizador DiSCO sobre 16 GPU H100 en MareNostrum 5. La mezcla de datos combina instrucciones generales (allenai/Dolci-Instruct-SFT, no_robots, oasst2), datos multilingües europeos (OpenEuroLLM-Excellent-SFT, EU-Instruct-Synthetic, traducciones de Dolci-Instruct-SFT), material de tool calling y agentes (nvidia/When2Call, Nemotron-SFT-Agentic-v2, Salesforce/xlam-function-calling-60k, APIGen-MT-5k, Team-ACE/ToolACE, hermes-function-calling-v1, Agent-Ark/Toucan-1.5M, jensjepsen/danish-tool-dialogues-v9), matemáticas (AI-MO/NuminaMath-CoT, Sigurdur/grade-school-math-icelandic) y conjuntos específicos de islandés, feroés, sueco, danés, neerlandés y alemán. No se detalla en la información disponible el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto conversacional multi-turno, con especial atención a instrucciones.
- Tool calling y function calling: la mezcla de SFT incluye explícitamente When2Call, xLAM, ToolACE, Hermes function calling y diálogos de herramientas en danés.
- Flujos agénticos y razonamiento multi-paso, apoyados en Nemotron-SFT-Agentic-v2 y Agent-Ark/Toucan-1.5M.
- Razonamiento matemático, con NuminaMath-CoT y grade-school-math-icelandic en el entrenamiento.
- Uso en pipelines de RAG, gracias a datasets como glaiveai/RAG-v1, DiscoResearch/germanrag y German-RAG-SFT-ShareGPT-HESSIAN-AI.
- Cobertura multilingüe en nueve idiomas: inglés, islandés, feroés, noruego (bokmål y nynorsk), sueco, danés, neerlandés y alemán.
- Alineación de seguridad trabajada mediante nvidia/Nemotron-SFT-Safety-v1.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Atención al cliente en lenguas nórdicas: permite conversar en islandés, feroés, danés, sueco o noruego con un único modelo, algo que los modelos multilingües generalistas de 8 B suelen cubrir de forma deficiente.
- Asistentes corporativos con tool calling en neerlandés y alemán: los datos de function calling y diálogos de herramientas en danés permiten conectarlo a APIs internas y flujos de consulta estructurada.
- Generación asistida de código y consultas técnicas en inglés: la mezcla incorpora material de instrucción general y matemáticas, suficiente para tareas de autocompletado y explicación de fragmentos.
- Procesamiento de documentación pública europea en pipelines de RAG: con GermanRAG y conjuntos de RAG en la mezcla, se puede usar para resumir y responder sobre corpus administrativos o normativos en varios idiomas.
- Investigación académica en PLN de bajos recursos: es un punto de partida útil para estudiar transferencia entre lenguas germánicas minoritarias dentro del proyecto TrustLLM.
- Agentes multi-paso para tareas administrativas: el modelo puede encadenar llamadas a herramientas en un bucle de razonamiento, aunque su ventana efectiva limita la profundidad del historial acumulado.
- Evaluación comparativa de mezclas de SFT: al ser un artefacto experimental ("mixb2-exp"), sirve como referencia interna para medir el efecto de distintas proporciones de datos de tool calling y multilingüismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de MMLU, HumanEval, GSM8K ni evaluaciones multilingües, y la ficha de la variante hermana tampoco aporta cifras comparativas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 14,4 GB solo para pesos (coincide con el tamaño del repositorio), más caché KV y overhead; en la práctica, entre 17 y 20 GB para contextos moderados.
- VRAM estimada cuantizado: en torno a 7,5 GB en INT8 y 4 GB en INT4, aunque no hay versiones GGUF o AWQ publicadas oficialmente.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB; en consumer, RTX 4090 o RTX 3090 de 24 GB deberían ser suficientes en bf16 con contexto corto.
- No cabe en GPUs de 8 o 12 GB sin cuantización agresiva, y esta no está disponible en el repositorio.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía soportada, dado el código personalizado de la arquitectura OptMoE. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible y requeriría verificación previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trustllm-v2-8b-sft-mixb2-exp | 7,19 B (MoE) | no disponible | 9 lenguas europeas | research-only, gated | Hugging Face, acceso restringido |
| trustllm-v2-8b-sft | ~7,19 B (MoE) | 4.096 tokens | 9 lenguas europeas | research-only | Hugging Face |
| trustllm-v2-8b-sft-8k | ~7,19 B (MoE) | 8.192 tokens | 9 lenguas europeas | research-only | Hugging Face |
| Otras alternativas europeas (EuroLLM, Teuken, Apertus) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de fuera de la familia TrustLLM no puede completarse con datos verificables a partir de la información proporcionada. El diferencial documentado de esta variante es la combinación de arquitectura MoE, cobertura de lenguas nórdicas minoritarias y licencia de investigación con acceso restringido.

## Limitaciones y advertencias

- Es un artefacto experimental ("exp"): la propia nomenclatura indica que la mezcla de datos no es una versión estable y puede contener desequilibrios entre idiomas o tareas.
- Licencia research-only y acceso gated: el uso comercial está excluido sin autorización explícita, y hay que aceptar condiciones en Hugging Face para descargarlo.
- Ausencia total de benchmarks publicados, lo que impide estimar con rigor su calidad frente a alternativas.
- Cero descargas y cero valoraciones: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Riesgo de alucinación inherente a cualquier modelo de 7 B entrenado por SFT; no se documentan fases de RLHF o DPO que mitiguen este comportamiento.
- Recuperación a larga distancia limitada: la información pública de la familia señala que la variante entrenada a 4.096 tokens no recupera una passkey situada a unos 7.000 tokens, problema que solo se corrige en la continuación a 8.192. Se desconoce si esta variante experimental incorpora dicha corrección.
- Dependencia de código personalizado (OptMoE): la integración con herramientas estándar de inferencia puede fallar o requerir parches.
- La cobertura lingüística se concentra en lenguas germánicas; no hay soporte declarado para español, francés, italiano, portugués ni lenguas eslavas, lo que limita su uso en la mayoría de mercados europeos.
- Los sesgos concretos del modelo no están documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TrustLLMeu/trustllm-v2-8b-sft-mixb2-exp
- Variante hermana: https://huggingface.co/TrustLLMeu/trustllm-v2-8b-sft
- Variante de contexto extendido: https://huggingface.co/TrustLLMeu/trustllm-v2-8b-sft-8k
- Modelo base: https://huggingface.co/TrustLLMeu/trustllm-v2-8b-midtrain
- Sitio del proyecto TrustLLM: https://trustllm.eu/
- Organización en GitHub: https://github.com/TrustLLMeu
- Repositorio de entornos del proyecto: https://github.com/TrustLLMeu/trustllm-envs
- Ficha de referencia en free2aitools: https://free2aitools.com/model/trustllmeu/trustllm-v2-8b-sft
