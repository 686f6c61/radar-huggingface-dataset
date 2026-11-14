# wirkung/origami1.1_9b

## Resumen

origami1.1_9b es un modelo de generación de texto de aproximadamente 9,41 mil millones de parámetros publicado por wirkung, derivado del backbone Qwen3.5-9B (vía la variante xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) y empaquetado en el formato propietario `.o3f` del runtime `wirkung`. Se trata de la versión incremental 1.1 del modelo Origami-9B (v1.0) y su propuesta central es la inferencia en CPU con memoria constante: el estado KV no crece con la longitud de contexto, verificado en 0,0 B/token hasta 128K tokens.

El modelo combina una arquitectura híbrida de 32 capas (24 capas GDN —gated delta network, del linaje Qwen3.5— y 8 capas de atención completa), un head MTP especulativo procedente de Qwen/Qwen3.5-9B y un sidecar de estado constante de 5,23 MB (`o1_crystal_v2_9b.bin`) que sustituye el crecimiento lineal del KV cache. Frente a v1.0, la release 1.1 reduce el ΔNLL de extremo a extremo de +0,2044 a +0,0294 (6,95 veces menor) y eleva la concordancia top-1 con el checkpoint base del 76,89 % al 85,73 %.

Es relevante ahora porque demuestra una vía práctica para servir modelos de ~9B en hardware sin GPU: en un EPYC de 16 núcleos con AVX2 alcanza 14,578 tok/s de decodificación, 47,389 tok/s de prefill y 17,213 tok/s con decodificación especulativa MTP (aceptación media 3,316), con un RSS pico de ~5,7 GB. El bundle publicado omite deliberadamente los bloques de visión y solo cubre inglés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas (24 GDN + 8 atención completa), linaje Qwen3.5-9B; head MTP especulativo |
| Parametros totales | 9.410.000.000 (9,41B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128K tokens verificado en estado constante (benchmarks T=1K..128K); ventana nativa del backbone Qwen3.5 no especificada en la información disponible |
| Tipos de cuantizacion | Precisión empaquetada en operadores `.o3f` (210 operadores); no se listan esquemas GGUF/AWQ/GPTQ en la información disponible |
| Idiomas soportados | Inglés (en), alemán (de) |
| Licencia | wirkung-model-and-runtime-1.0 (license: other) |
| Formato de pesos | `.o3f` (runtime wirkung), `safetensors` (`exact_core.safetensors`, `mtp_exact.safetensors`), sidecar `.bin` (`o1_crystal_v2_9b.bin`), `bundle.json`, `config.json` |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de 32 capas en el que 24 capas usan GDN (gated delta network, una familia de modelos de estado lineal con memoria constante) y 8 capas mantienen atención completa. Esa mezcla es la que permite sostener recall de passkey a longitudes largas (3/3 a T=640 y T=2048) sin que el estado KV crezca. Sobre el backbone se monta un head MTP (multi-token prediction) de 8 operadores `.o3f` más `mtp_exact.safetensors`, procedente de Qwen/Qwen3.5-9B (Apache-2.0), que actúa como decodificador especulativo.

No hay entrenamiento propio documentado: la model card indica explícitamente "0 training steps" para el backbone, que se hereda de xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic. La innovación técnica de esta release es el empaquetado y la calibración: el sidecar de estado constante `o1_crystal_v2_9b.bin` (5,23 MB, 24,48 MiB de estado en runtime) se actualiza para reducir el KL frente a la atención exacta a 0,02364 y el ΔNLL de estado constante a +0,00564 ± 0,01596 (94,13 % de concordancia top-1). La huella total de texto + vocabulario + MTP es de 4,123 GB.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento de múltiples pasos y decodificación especulativa MTP integrada (aceptación media 3,316 tokens por paso).
- Memoria constante en inferencia: estado KV fijo de 24,48 MiB independientemente de la longitud (0,0 B/token hasta 128K).
- Recall de passkey a contexto largo verificado (3/3 a T=640 y T=2048).
- Inferencia en CPU sin GPU (zero-VRAM) con runtime propio `wirkung`.
- Multilingüe limitado a inglés y alemán.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, visión o audio: no disponibles en este bundle (los bloques de visión `.o3f` se omiten explícitamente).

## Casos de uso

- Despliegue en servidores sin GPU: el modelo corre íntegramente en CPU (EPYC de 16 núcleos con AVX2) con ~5,7 GB de RSS pico, lo que permite servir generación de texto en entornos donde no hay aceleradores disponibles.
- Documentos de contexto largo en CPU: gracias al estado constante verificado hasta 128K tokens, se pueden procesar contratos, informes o expedientes extensos sin que el consumo de memoria crezca con la longitud de entrada.
- Asistentes conversacionales en inglés y alemán: el modelo está etiquetado como conversacional y soporta ambos idiomas, adecuado para atención al cliente o chatbots internos en mercados DACH.
- Generación especulativa de alto throughput relativo: con el head MTP se alcanzan 17,213 tok/s frente a 14,578 tok/s en decodificación normal, útil para pipelines de generación masiva en batch sobre CPU.
- Prototipado e investigación de arquitecturas híbridas SSM/atención: el bundle expone operadores GDN y de atención separados por capa, lo que facilita experimentos de ablación sobre el sidecar de estado constante.
- Entornos con restricciones de memoria estricta: el estado fijo de 24,48 MiB hace predecible el uso de RAM por sesión, lo que simplifica el dimensionado de contenedores y el multi-tenancy en CPU.
- Evaluación de fidelidad de destilación/cuantización: los metadatos de ΔNLL (+0,0294) y concordancia top-1 (85,73 %) permiten usar el modelo como referencia para comparar técnicas de compresión.

## Benchmarks y rendimiento

| Metrica | v1.0 (Origami-9B) | v1.1 (origami1.1_9b) | Cambio |
|---|---|---|---|
| ΔNLL extremo a extremo vs checkpoint base | +0,2044 (8.191 tok vs Qwen3.5-9B) | +0,0294 (511 tok vs heretic) | 6,95x menor |
| Concordancia top-1 vs base | 76,89 % (73,51 % en v4.5) | 85,73 % (95,21 % solo head) | +8,84 pp |
| ΔNLL estado constante vs exacto (1.024 tok heldout) | — (KL = 0,02417 sidecar inicial) | +0,00564 ± 0,01596 (KL = 0,02364, 94,13 % top-1) | KL menor + sidecar actualizado |
| Passkey recall estado constante (T=640 y T=2048) | 2/3 (66,7 %) | 3/3 (100,0 %) en ambas longitudes | +33,3 pp |
| Crecimiento KV live (T=1K..128K) | Constante (14,82 MB carrier v1.0) | 0,0 B/tok (ΔRSS = 0,0 MB, 24,48 MiB slot fijo) | Verificado hasta 128K |
| Decode CPU EPYC 16 núcleos AVX2 (estado constante) | 13,615 tok/s (baseline v1.1 CPU) | Hasta 14,578 tok/s decode · 47,389 tok/s prefill · 17,213 tok/s MTP spec (mean_accept = 3,316) | +7,1 % decode · +15,5 % spec (~5,7 GB RSS pico) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB (inferencia en CPU, zero-VRAM); el modelo no requiere GPU.
- RAM: huella de pesos de 4,123 GB (texto + vocabulario + MTP) más estado de runtime; RSS pico medido de ~5,7 GB en carga de benchmark.
- Estado KV: 24,48 MiB fijos por slot, independientes de la longitud de contexto (0,0 B/token hasta 128K).
- CPU recomendada: 16 núcleos EPYC-Rome con AVX2 (plataforma de referencia de los benchmarks); no se documentan requisitos mínimos de núcleos ni de ISA en la información disponible.
- GPU: no aplica; no se documenta soporte CUDA/ROCm en la información disponible.
- Opciones de despliegue: runtime `wirkung` (`wkng pull` / `wkng run --chat`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia/throughput: 14,578 tok/s decode, 47,389 tok/s prefill, 17,213 tok/s con MTP especulativo sobre EPYC de 16 núcleos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| origami1.1_9b | 9,41B | Hasta 128K verificado en estado constante | 14,578 tok/s decode CPU (EPYC 16c); ΔNLL +0,0294 vs base | wirkung-model-and-runtime-1.0 (other) | HF, runtime wirkung |
| Qwen/Qwen3.5-9B | ~9B | No disponible | No disponible | Apache-2.0 (según la card, para el head MTP) | HF |
| wirkung/Origami-9B (v1.0) | ~9B | Constante (14,82 MB carrier) | 13,615 tok/s decode CPU; ΔNLL +0,2044 | wirkung-model-and-runtime-1.0 | HF |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | No disponible | No disponible | No disponible | HF |

No se dispone de datos de benchmarks estándar para establecer comparaciones de calidad con alternativas; la comparación anterior se limita a linaje, licencia y métricas internas publicadas.

## Limitaciones y advertencias

- Solo soporta inglés y alemán; no se declara cobertura multilingüe adicional.
- El bundle omite los bloques de visión `.o3f`; no hay capacidades multimodales en esta release.
- El backbone procede de un checkpoint "UNCENSORED-heretic", lo que implica que los filtros de seguridad del modelo original pueden estar ausentes o alterados; no se documenta ninguna evaluación de seguridad.
- Licencia `wirkung-model-and-runtime-1.0` (other): es una licencia propietaria y no estándar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, y no se garantiza compatibilidad con Apache-2.0 del head MTP.
- Dependencia total del runtime `wirkung` y del formato `.o3f`: no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita portabilidad y ecosistema de herramientas.
- El estado constante introduce una aproximación frente a la atención exacta (KL = 0,02364, ΔNLL +0,00564): el recall a contexto largo está verificado con passkey, pero no se documentan evaluaciones de razonamiento de largo alcance.
- Riesgo de alucinación: no evaluado en la información proporcionada; no hay benchmarks de factualidad.
- Los benchmarks de rendimiento provienen de una única plataforma (EPYC-Rome 16 núcleos AVX2) y pueden variar sustancialmente en otras CPU.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirkung/origami1.1_9b
- Release anterior v1.0: https://huggingface.co/wirkung/Origami-9B
- Backbone de texto y vocabulario: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Origen del head MTP: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo: LICENSE (incluido en el repositorio)
- Runtime wirkung: instalación vía `pip install -U wirkung` (no se proporciona URL de repositorio en la información disponible)
