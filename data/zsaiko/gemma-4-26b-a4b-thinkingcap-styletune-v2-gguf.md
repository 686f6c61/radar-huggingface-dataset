# zSaiko/Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF

## Resumen

Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF es una cuantización GGUF de un merge experimental construido por el usuario zSaiko sobre el modelo Gemma 4 26B-A4B de Google DeepMind. El autor combina dos derivados de la familia: por un lado toma los pesos de ThinkingCap (bottlecapai/ThinkingCap-gemma-4-26B-A4B-it), orientado a razonamiento con cadenas de pensamiento más breves, y por otro sustituye la cabeza de salida (lm_head) por la de StyleTune V2 (Gryphe/Gemma-4-26B-A4B-StyleTune-V2), afinada para prosa narrativa y roleplay. El resto de la arquitectura permanece intacta.

El modelo hereda la arquitectura Mixture-of-Experts de Gemma 4 en la variante 26B-A4B, con aproximadamente 25.970 millones de parámetros totales y unos 4.000 millones activos por token según la nomenclatura del tamaño. Está pensado para generación de texto conversacional, escritura creativa y roleplay, no para visión: el autor elimina explícitamente el proyector visual. El tokenizador y la plantilla de chat provienen de ThinkingCap.

La relevancia de esta ficha es doble. Por un lado documenta un experimento de merge a nivel de cabeza de salida, una técnica poco frecuente y con caveats técnicos relevantes (la cabeza de StyleTune fue entrenada sobre los estados ocultos del modelo base, no sobre los de ThinkingCap). Por otro, el autor publica métricas de fidelidad de la cuantización (KLD frente a BF16) que permiten evaluar la calidad del GGUF Q5 con datos concretos, algo poco habitual en cuantizaciones comunitarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Gemma 4 26B-A4B) |
| Parámetros totales | 25.971.339.550 (~26B) |
| Parámetros activos | ~4B (denominación A4B del modelo base) |
| Longitud de contexto | hasta 256K tokens (modelo base Gemma 4); no verificado para este merge |
| Tipos de cuantización | Q5 (UD-style mix + imatrix RP), BF16 completo |
| Idiomas soportados | no disponible (Gemma 4 base soporta más de 140 idiomas según Google) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q5 y BF16 en dos partes) |

## Arquitectura y entrenamiento

El modelo es un merge a nivel de pesos entre dos derivados de Gemma 4 26B-A4B. La operación consiste en tomar el cuerpo completo de ThinkingCap (todos los bloques del transformer, embeddings y tokenizador) y sustituir únicamente la cabeza de salida por la de StyleTune V2. No hay entrenamiento adicional ni fine-tuning: es una recombinación directa de tensores. La arquitectura subyacente es la de Gemma 4 en su variante MoE de 26B totales con aproximadamente 4B activos, que Google describe como adecuada para generación de texto, código y razonamiento, con ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas.

La innovación técnica del autor está en la cuantización. El GGUF Q5 sigue el layout de Unsloth UD-Q5_K_S: embeddings y pesos no-expertos en Q8_0, gate/up de expertos en Q5_K, down de expertos en Q5_1 (Q8_0 en la capa 29) y cabeza de salida en Q6_K. La imatrix es propia, calibrada con un 70% de datos de roleplay de HiWaifu y un 30% del conjunto de calibración de Unsloth. Se construyó con llama.cpp b12192. El autor advierte que es su segunda incursión en cuantización y modificaciones de LLM, y que el merge es experimental: la cabeza de StyleTune se entrenó sobre los estados ocultos del modelo base, no sobre los de ThinkingCap, por lo que la transferencia de estilo no está garantizada.

## Capacidades

- Generación de texto conversacional y multi-turno, con plantilla de chat propia de Gemma 4 heredada de ThinkingCap.
- Escritura creativa y roleplay, objetivo declarado del merge gracias a la cabeza de StyleTune V2.
- Modo de razonamiento (thinking) activable mediante el parámetro `enable_thinking` de la plantilla, con `--reasoning on` / `off` en llama.cpp.
- Razonamiento de varios pasos en modo thinking, heredado de ThinkingCap.
- Soporte multilingüe heredado del modelo base Gemma 4 (más de 140 idiomas según Google), aunque no verificado en este merge.
- Sin capacidades de visión: el proyector visual ha sido eliminado explícitamente.
- Tool calling / function calling: no documentado en la información disponible para este merge.
- Capacidades de agente: no documentadas en la información disponible.

## Casos de uso

- Roleplay conversacional multi-turno: el modelo está específicamente construido para este escenario, combinando la prosa de StyleTune V2 con el razonamiento de ThinkingCap. Adecuado para personajes con contexto largo gracias a la ventana de hasta 256K tokens del modelo base.
- Escritura creativa asistida: generación de narrativa, diálogos y descripciones con un estilo afinado por la cabeza de StyleTune. Útil para autores que quieran un modelo con voz propia y control de temperatura vía min-p y DRY.
- Prototipado de chatbots de personaje: el formato GGUF permite desplegarlo en llama.cpp u Ollama en hardware de consumo, lo que facilita iterar sobre prompts y plantillas sin infraestructura de servidor.
- Investigación sobre merges de cabezas de salida: el propio modelo es un caso de estudio para evaluar si una lm_head afinada sobre un modelo base transfiere su estilo a un cuerpo con distribución de estados ocultos distinta.
- Evaluación de cuantizaciones con imatrix específica de dominio: el autor publica métricas KLD frente a BF16 sobre 120 chats de roleplay, lo que permite usar el Q5 como referencia de fidelidad en experimentos de cuantización orientados a dominios creativos.
- Generación de texto en local con privacidad: al ser GGUF y Apache-2.0, puede ejecutarse en estaciones de trabajo sin conexión, útil para escritura confidencial o datos sensibles que no deben salir del equipo.
- Fine-tuning posterior sobre la base BF16: el repositorio incluye los pesos BF16 completos en dos partes, lo que permite generar cuantizaciones propias o continuar el entrenamiento con herramientas compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica métricas de fidelidad de la cuantización Q5 frente al BF16, medidas sobre 120 chats de roleplay generados por el propio modelo (formato chat, 50 fragmentos de 512 tokens):

| Métrica | Q5 (imatrix del autor) | Mismo layout, imatrix de bartowski | Q8_0 (referencia) |
|---|---|---|---|
| KLD medio | 0,067 | 0,070 | 0,047 |
| KLD percentil 99 | 1,26 | 1,28 | no disponible |
| KLD percentil 99,9 | 6,29 | 7,51 | no disponible |
| Mismo token top-1 | 93,0% | 93,1% | 94,5% |

El autor subraya que estas cifras miden la fidelidad de la cuantización, no la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para el Q5: el archivo pesa 19,46 GB; con overhead de contexto y caché KV, se recomienda al menos 22-24 GB de VRAM para contextos moderados.
- VRAM estimada para BF16: aproximadamente 52 GB en dos partes; requiere GPU de 80 GB o reparto entre varias GPU.
- GPU recomendadas para Q5: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 40/80 GB, H100.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con el Q5 y contexto ajustado; en GPUs de 16 GB requeriría offload parcial a CPU o cuantizaciones menores no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (versión b12192 o superior, usada para construir el GGUF), Ollama, y cualquier frontend compatible con GGUF y plantilla de chat Gemma 4. vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zSaiko/Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF | ~26B totales, ~4B activos | hasta 256K (base) | Apache-2.0 | GGUF, BF16 | Merge experimental de cuerpo ThinkingCap + cabeza StyleTune V2 |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it | ~26B totales, ~4B activos | hasta 256K (base) | Apache-2.0 | safetensors | Modelo base del cuerpo; orientado a razonamiento con thinking breve |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | ~26B totales, ~4B activos | hasta 256K (base) | Apache-2.0 | safetensors | Modelo base de la cabeza; afinado para prosa y roleplay |
| Gemma 4 26B-A4B-it (Google) | ~26B totales, ~4B activos | hasta 256K | Apache-2.0 | safetensors | Modelo original de Google DeepMind, instrucción y multilingüe |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe como su segunda experiencia con cuantizaciones y modificaciones de LLM, y el merge no ha sido validado con una comparación lado a lado frente a StyleTune V2 (pendiente en `report.md`).
- Transferencia de estilo no garantizada: la cabeza de StyleTune V2 se entrenó sobre los estados ocultos del modelo base, no sobre los de ThinkingCap, por lo que el estilo puede no conservarse plenamente.
- Reducción del thinking no demostrada: el autor reconoce que no ha verificado que el razonamiento sea efectivamente más corto que en ThinkingCap.
- Sin visión: el proyector visual ha sido eliminado; no admite entrada de imágenes.
- Idiomas: no se documenta el conjunto exacto de idiomas soportados para este merge, solo la cifra genérica de más de 140 del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se han publicado evaluaciones específicas de factualidad para este merge.
- Sesgos: no se han documentado sesgos específicos; se heredan los del modelo base Gemma 4 y los de los datasets de fine-tuning de ThinkingCap y StyleTune.
- Licencia Apache-2.0 permite uso comercial, pero los términos de Gemma 4 de Google pueden imponer condiciones adicionales al modelo base; conviene revisar la licencia original de Gemma antes de desplegar en producción.
- Compatibilidad de frontends: el autor advierte que los frontends discrepan sobre el valor por defecto de `enable_thinking`, por lo que debe establecerse explícitamente.
- Contexto efectivo: aunque el modelo base soporta hasta 256K tokens, no se ha verificado el comportamiento de este merge en contextos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zSaiko/Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF
- Modelo base ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Modelo base StyleTune V2: https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
