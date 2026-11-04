# Turpalzavr/Qwen2.5-Coder-3B-Instruct

## Resumen

Qwen2.5-Coder-3B-Instruct es la variante instruida de 3.000 millones de parametros de la familia Qwen2.5-Coder, desarrollada por Alibaba Cloud (equipo Qwen). Sucede a CodeQwen1.5 y esta especializada en generacion, razonamiento y correccion de codigo, manteniendo al mismo tiempo competencias generales en matematicas y lenguaje natural. La version aqui referenciada es un reupload del autor Turpalzavr sobre el modelo base oficial Qwen/Qwen2.5-Coder-3B, sin modificaciones declaradas.

El modelo emplea una arquitectura transformer causal con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings de palabras atados (tied word embeddings). Dispone de 3.090 millones de parametros totales (2.770 millones sin contar embeddings) distribuidos en 36 capas, con atencion GQA de 16 cabezas para Q y 2 para KV. La longitud de contexto completa es de 32.768 tokens.

Su relevancia radica en ofrecer capacidades de codigo de nivel competitivo en un tamano que cabe en GPU de consumo, lo que lo hace apto para autocompletado, asistentes de codigo locales y despliegues con requisitos de privacidad. El entrenamiento de la familia declara 5,5 billones de tokens, incluyendo codigo fuente, text-code grounding y datos sinteticos, aunque el informe tecnico atribuye el estado del arte a la variante de 32B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y tied word embeddings |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 2,77B |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors |
| Capas | 36 |
| Cabezas de atencion (GQA) | 16 para Q, 2 para KV |
| Tamano del repositorio | 6,2 GB |
| Libreria | transformers (>= 4.37.0) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Se trata de un transformer causal denso con normalizacion RMSNorm, activacion SwiGLU, codificaciones posicionales rotatorias (RoPE) y atencion con query-key-value bias. El uso de GQA con solo 2 cabezas KV reduce el coste de memoria del cache de atencion durante la inferencia, algo relevante para contextos largos de hasta 32.768 tokens. Los embeddings de palabras estan atados a la capa de salida, lo que reduce el numero efectivo de parametros entrenables hasta los 2,77B sin embeddings.

El preentrenamiento de la familia Qwen2.5-Coder se escala hasta 5,5 billones de tokens, combinando codigo fuente, text-code grounding y datos sinteticos. La model card no detalla la composicion exacta del dataset ni las tecnicas de post-entrenamiento (RLHF, DPO u otras) especificas de esta variante de 3B; solo se indica que el modelo ha pasado por pretraining y post-training. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo: explicacion, refactorizacion y depuracion.
- Correccion de codigo (code fixing) a partir de errores o trazas.
- Generacion aumentada por contexto (text-code grounding): responder sobre fragmentos de codigo dados.
- Capacidades generales de lenguaje natural y matematicas heredadas de Qwen2.5.
- Formato conversacional con plantilla de chat (`apply_chat_template`), roles system/user/assistant.
- Compatible con text-generation-inference y endpoints compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Multilingue: limitado a ingles segun la model card (el modelo base Qwen2.5 soporta mas idiomas, pero esta variante declara solo en).

## Casos de uso

- Autocompletado de codigo en IDE: con 32.768 tokens de contexto puede considerar el archivo completo y archivos relacionados para sugerir la siguiente linea o bloque, ejecutandose en local en una GPU de consumo.
- Asistente de revision de pull requests: se le pasa el diff y el contexto del repositorio para detectar errores, malas practicas y proponer parches, aprovechando sus capacidades de code reasoning.
- Generacion de tests unitarios: dado un fragmento de codigo, produce casos de prueba y datos de ejemplo; su tamano permite integrarlo en pipelines de CI/CD sin coste de API externa.
- Migracion y traduccion entre lenguajes: convertir funciones de Python a TypeScript, Java a Go, etc., con contexto suficiente para respetar las convenciones del proyecto.
- Documentacion automatica: generar docstrings y documentacion tecnica a partir del codigo fuente, manteniendo coherencia con el estilo existente.
- Chat de soporte para desarrolladores: explicar mensajes de error, trazas de pila y sugerir soluciones paso a paso en conversaciones multi-turno dentro de la ventana de 32K tokens.
- Entornos con requisitos de privacidad: despliegue on-premise donde el codigo no puede salir de la infraestructura, gracias a su tamano reducido y licencia de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados detallados en el blog oficial de Qwen2.5-Coder y en el informe tecnico arXiv:2409.12186, pero no incluye cifras concretas para esta variante de 3B.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, mas cache KV y overhead; en la practica unos 8-10 GB con contexto moderado.
- Cuantizacion a 8 bits: aproximadamente 3,5-4 GB de pesos.
- Cuantizacion a 4 bits: aproximadamente 2-2,5 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para produccion con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16 y en tarjetas con 4-6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp y Ollama (previa conversion a GGUF), entre otras.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; la documentacion oficial de Qwen enlaza a su benchmark de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (este) | 3,09B | 32.768 | qwen-research | Especializado en codigo, solo ingles declarado |
| Qwen2.5-Coder-7B-Instruct | 7B (aproximado, no confirmado en la informacion) | No disponible | qwen-research | Misma familia, mayor capacidad a costa de mas VRAM |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B (aproximado, no confirmado en la informacion) | No disponible | qwen-research | Variante menor para entornos muy limitados |
| CodeLlama-7B-Instruct | 7B (aproximado, no confirmado en la informacion) | No disponible | Licencia Llama | Alternativa de Meta para codigo |

Los datos de los modelos alternativos no estan confirmados en la informacion proporcionada y deben verificarse en sus respectivas model cards. No se dispone de cifras de rendimiento comparativas para esta variante.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado para esta variante.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar APIs, funciones o librerias inexistentes; el codigo generado debe validarse con tests.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del corpus de codigo y texto pueden propagarse.
- Contexto: aunque soporta 32.768 tokens, la calidad en el extremo superior de la ventana no esta verificada en la informacion disponible.
- Repositorio no oficial: este reupload de Turpalzavr no declara modificaciones, pero conviene contrastar con el repositorio oficial Qwen/Qwen2.5-Coder-3B-Instruct para produccion.
- Sin datos de benchmarks publicados en esta ficha: no se puede confirmar el rendimiento real frente a alternativas sin consultar el informe tecnico.
- Tool calling y comportamiento agente: no confirmados para esta variante de 3B en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Turpalzavr/Qwen2.5-Coder-3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Modelo oficial instruido: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Blog oficial de la familia: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Benchmark de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Informe tecnico Qwen2: https://arxiv.org/abs/2407.10671
- Demo de chat: https://chat.qwenlm.ai/
