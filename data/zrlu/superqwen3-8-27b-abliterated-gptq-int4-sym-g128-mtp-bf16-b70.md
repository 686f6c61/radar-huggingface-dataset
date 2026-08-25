# zrlu/SuperQwen3.8-27b-abliterated-GPTQ-Int4-sym-G128-MTP-BF16-B70

## Resumen

SuperQwen3.8-27b-abliterated-GPTQ-Int4-sym-G128-MTP-BF16-B70 es una derivada cuantizada del modelo base Jiunsong/SuperQwen3.8-27b-abliterated, que a su vez parte del Qwen3.8-27B de Alibaba. Se trata de un modelo denso de 27 781 millones de parámetros con arquitectura híbrida de atención (48 de 64 capas con atención lineal), torre de visión integrada y cabezal MTP (Multi-Token Prediction) para decodificación especulativa. La cuantización GPTQ-INT4 con grupo de 128 y simetría activa reduce los pesos de 51,8 GB a aproximadamente 18,2 GB, preservando los tensores MTP en BF16 para el esquema de decodificación especulativa de vLLM.

El modelo está diseñado específicamente para inferencia en una única GPU Intel Arc Pro B70 (Xe2) mediante vLLM XPU, tanto en Windows con Docker Desktop y WSL2 como en Linux nativo. El autor, zrlu, lo ha orientado a cargas de trabajo de agentes como pi y opencode. La licencia Apache-2.0 se hereda sin cambios del linaje Qwen3.8-27B, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en combinar capacidades de razonamiento multimodal con un despliegue eficiente en hardware Intel de gama media, algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hybrid-attention, 48 de 64 capas con attention lineal, vision tower) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1M (segun base Qwen3.8-27B) |
| Tipos de cuantizacion | GPTQ-INT4 (bits=4, group_size=128, sym=true, desc_act=false); tensores MTP en BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, ~18,2 GB de pesos cuantizados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con arquitectura hibrida: 48 capas usan atencion lineal (linear attention) y las 16 restantes usan atencion completa con puerta (gated attention), siguiendo el esquema full_attention_interval: 4. Incorpora una torre de vision para entrada de imagenes, lo que lo convierte en un modelo nativo de vision-lenguaje. El cabezal MTP (Multi-Token Prediction) se conserva en BF16 en esta cuantizacion y permite decodificacion especulativa con vLLM, lo que reduce la latencia en generacion.

La cuantizacion se realizo con gptqmodel 7.3.2 sobre CUDA (RTX 5090), con calibracion en wikitext-2 y parametros de bits=4, group_size=128, desc_act=false, sym=true, lm_head=false, y exclusion dinamica de los tensores MTP (que permanecen en BF16). El autor indica que el checkpoint cuantizado es reproducible y que el proceso de cuantizacion es autocontenido. No se proporcionan detalles sobre el entrenamiento original del modelo base (datos, tokens, tecnicas de RLHF/DPO), mas alla de que la version "supertune" BF16 es una release de precision completa del modelo abliterated.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno en ingles y chino.
- Comprension de imagenes y tareas de vision-lenguaje (image-text-to-text), incluyendo analisis de documentos, captura de informacion visual y razonamiento sobre contenido grafico.
- Mejoras especificas en codificacion y productividad de oficina segun QwenCloud, tanto en modalidad textual como visual.
- Soporte de tool calling y parser XML (qwen3_xml) integrado en la receta de vLLM, lo que permite invocacion de herramientas y uso en agentes.
- Decodificacion especulativa (MTP) con vLLM XPU, que acelera la generacion en hardware Intel Arc.
- Capacidad de agentes multi-step: el autor menciona su uso con pi y opencode para cargas de trabajo de agentes.
- Longitud de contexto nativa de 262K tokens, extensible a 1M, con prefijo caching activado en la configuracion de vLLM.

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y refactorizar codigo, aprovechando su soporte de tool calling y su capacidad para razonar sobre diagramas o capturas de pantalla de interfaces.
- Agente de automatizacion de oficina: analiza documentos, presentaciones y hojas de calculo (vision) y genera resumenes, informes o respuestas en ingles o chino, con contexto largo para documentos extensos.
- Atencion al cliente bilingue: gestiona conversaciones multi-turno en ingles y chino con ventana de contexto amplia, manteniendo el historial completo de interacciones y soportando imagenes adjuntas.
- Razonamiento sobre imagenes tecnicas: interpreta esquemas, diagramas de arquitectura o capturas de pantalla de errores y produce explicaciones detalladas, util en soporte tecnico remoto.
- Agente de automatizacion de tareas de oficina: con el parser de herramientas qwen3_xml, puede orquestar llamadas a APIs o funciones internas para completar flujos de trabajo complejos (calendario, correo, bases de datos).
- Despliegue local en hardware Intel Arc: al estar cuantizado y probado para una unica Arc Pro B70, es viable para entornos de edge o laboratorios con GPUs Intel, sin depender de NVIDIA.
- Investigacion en alineacion de modelos: la variante "abliterated" elimina ciertos rechazos de contenido, lo que permite estudiar comportamientos sin filtros de seguridad en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la metodologia de benchmark y los datos estan en el repositorio de GitHub (https://github.com/zrlu/qwen38-27b-arc-pro-b70), pero no se incluyen cifras concretas en la model card ni en los resultados de busqueda. Se recomienda consultar ese repositorio para obtener datos de rendimiento especificos de la configuracion Arc Pro B70.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,2 GB de pesos cuantizados + overhead de KV cache (con fp8) y cabezales MTP en BF16, lo que requiere al menos 24 GB de VRAM util. En la practica, el autor lo valida en una Intel Arc Pro B70 con 24 GB.
- GPU recomendadas: Intel Arc Pro B70 (Xe2) como destino principal; tambien es compatible con CUDA (vLLM o transformers) en GPUs NVIDIA con 24 GB o mas (RTX 3090/4090, A5000, etc.).
- En consumer GPU: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con cuantizacion INT4; no cabe en GPUs de 16 GB sin cuantizacion adicional.
- Opciones de despliegue: vLLM XPU (imagen Docker oficial del autor), vLLM CUDA, transformers con device_map="auto", y potencialmente llama.cpp si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no hay datos publicados; el autor indica que la configuracion MTP4 + draft-INT4 con prefijo caching y fp8 KV cache esta disenada para minimizar la latencia en el B70, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78B | 262K-1M | Apache-2.0 | Denso multimodal | HF, vLLM, Ollama |
| SuperQwen3.8-27b-abliterated-GPTQ-Int4 (este) | 27,78B | 262K-1M | Apache-2.0 | Denso multimodal, cuantizado GPTQ-INT4 | HF, vLLM XPU |
| Qwen3.8-27B-ABLITERATED-BF16 (Blackfrost-AI) | 27,78B | 262K-1M | Apache-2.0 | Denso multimodal, abliterated BF16 | HF |
| Llama 3.3 70B (alternativa densa mayor) | 70,6B | 128K | Llama 3.3 | Denso multimodal | HF, licencia Llama |

La comparativa muestra que este modelo es una cuantizacion especifica de una variante abliterated de Qwen3.8-27B, con la ventaja de estar optimizado para Intel Arc Pro B70 y de preservar los cabezales MTP. Frente a la version BF16 original, el cuantizado ocupa mucho menos espacio (18,2 GB vs 51,8 GB) y es mas rapido en inferencia, a costa de una perdida de precision tipica de INT4. Respecto a alternativas como Llama 3.1 70B, el Qwen3.8-27B ofrece mejor rendimiento por parametro en razonamiento y vision, con un requisito de VRAM menor.

## Limitaciones y advertencias

- La variante "abliterated" elimina los rechazos de contenido del modelo base, lo que puede generar respuestas con contenido inapropiado, ofensivo o potencialmente danino; no es apta para entornos de produccion sin moderacion adicional.
- Los idiomas soportados se limitan a ingles y chino; el rendimiento en otros idiomas no esta garantizado y puede degradarse notablemente.
- La cuantizacion INT4 introduce perdida de precision, especialmente en tareas de razonamiento complejo o matemáticas de alta exigencia; se recomienda validar en el caso de uso concreto.
- Los cabezales MTP en BF16 requieren la configuracion especifica de vLLM XPU para funcionar correctamente; su uso en otros runtimes puede no estar soportado o dar errores.
- El modelo ha sido validado principalmente en Intel Arc Pro B70; en otras GPUs puede requerir ajustes adicionales de configuracion de vLLM.
- No hay benchmarks publicados en la informacion disponible; el rendimiento real en tareas especificas debe medirse en el entorno de despliegue.
- El repositorio de GitHub (zrlu/qwen38-27b-arc-pro-b70) es la fuente autorizada para la configuracion exacta y el metodo de despliegue; la model card de HuggingFace es breve y no cubre todos los detalles operativos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un checkpoint reciente y poco probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zrlu/SuperQwen3.8-27b-abliterated-GPTQ-Int4-sym-G128-MTP-BF16-B70
- Modelo base (Jiunsong): https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated
- Repositorio GitHub del autor (benchmarks y setup): https://github.com/zrlu/qwen38-27b-arc-pro-b70
- Referencia de Qwen3.8-27B en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia de Qwen3.8-27B en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Pagina de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
