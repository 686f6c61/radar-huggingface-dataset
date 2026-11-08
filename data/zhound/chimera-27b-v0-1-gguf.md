# zhound/Chimera-27B-v0.1-GGUF

## Resumen

Chimera-27B-v0.1 es un experimento de empalme de pesos (weight surgery) publicado por el usuario independiente zhound. No es un modelo entrenado de cero ni un fine-tuning: parte del backbone denso Qwen/Qwen3.8-27B y le injerta el experto compartido de la capa 0 de deepseek-ai/DeepSeek-V4.1-Flash-1017, añadiendo 35.389.440 parámetros donantes a los 27.356.087.296 totales. El resultado se distribuye únicamente en formato GGUF, con un proyector de visión separado (mmproj) para entrada image-text-to-text.

La relevancia del modelo es metodológica, no de rendimiento. El autor lo presenta explícitamente como una demostración de que un injerto de pesos entre familias distintas puede funcionar en inferencia, y advierte que no establece ninguna mejora de calidad. La capa parcheada calcula `FFN_output = original_Qwen_FFN(x) + 0.1 * aligned_DeepSeek_shared_expert(x)`, manteniendo intacta toda la computación original de Qwen: no hay router aprendido, no hay conversión a MoE disperso y no hay entrenamiento por gradiente del modelo combinado.

Requiere un runtime parcheado específico. Los motores estándar (llama.cpp sin el parche, vLLM, TGI, Ollama) pueden cargar los tensores pero ignorar los donantes, dando lugar a un modelo que se comporta como el Qwen base sin que el usuario lo sepa. No se ofrece endpoint de inferencia alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con experto compartido DeepSeek añadido en la capa 0; sin router, sin MoE disperso |
| Parametros totales | 27.356.087.296 (de los cuales 35.389.440 son donantes) |
| Parametros activos | No aplica (el backbone es denso; el donante se suma siempre, no se enruta) |
| Longitud de contexto | 131.072 tokens (asignación usada en las pruebas; la calidad end-to-end a 128K no se verificó) |
| Tipos de cuantizacion | Q4_K_M (backbone Q4_K_M + donante Q8_0) y Q8_0 (backbone y donante en Q8_0); donante calibrado disponible en FP32 (`shared-aligned-fp32.npz`) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q8_0) + proyector de visión `mmproj-Qwen3.8-27B-BF16.gguf`; NPZ para el donante calibrado |

## Arquitectura y entrenamiento

El modelo es un transformer denso con la atención, el tokenizador, el encoder de visión y la cabeza MTP (multi-token prediction) originales de Qwen3.8-27B, revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0`. Sobre la capa 0 se añaden tres proyecciones donantes (ancho oculto 5.120, ancho intermedio 2.304) extraídas del experto compartido de la capa 0 de DeepSeek-V4.1-Flash-1017, revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`. Los mapas lineales de entrada y salida se ajustaron con regresión ridge y se plegaron en las proyecciones donantes. El donante conserva la semántica SwiGLU con clamp 10 de DeepSeek.

No hubo entrenamiento por gradiente del modelo combinado. La calibración usó activaciones pareadas de fragmentos de código C++: 2.048 pares de ajuste y 1.386 de validación, separados por fichero fuente. Como proxy de activación se empleó un backbone DeepSeek Coder cuantizado, mientras que los pesos donantes provienen del modelo DeepSeek oficial. Las fuerzas de ridge se seleccionaron sobre el conjunto de validación de alineamiento, por lo que esos errores de alineamiento no son puntuaciones de test independientes; además, el mapa de salida usó representaciones residuales como proxy, de modo que un buen error de alineamiento no demuestra transferencia útil de capacidad. El donante se eligió como sonda de interfaz, no como el mejor experto de código probado.

## Capacidades

- Generación de texto conversacional sobre el backbone Qwen3.8-27B.
- Razonamiento con modo thinking habilitado (se usó en las pruebas de código y de herramientas).
- Codificación: las pruebas locales se centraron en tareas de código C++ y parches JSON.
- Visión: pipeline image-text-to-text mediante el proyector separado `mmproj-Qwen3.8-27B-BF16.gguf`; se validó un único fixture de visión.
- Tool calling / function calling: se superó un fixture de reintento de herramienta.
- Contexto largo: asignación de 131.072 tokens, aunque la recuperación y el razonamiento end-to-end a 128K no se probaron.
- Decodificación especulativa vía MTP (multi-token prediction) del backbone Qwen, con cinco borradores MTP en la configuración Q4 seleccionada.
- Capacidades multilingües: no disponible (no declaradas).

## Casos de uso

- Investigación sobre empalme de pesos entre familias: el modelo sirve como banco de pruebas reproducible para estudiar si un experto donante aporta capacidad medible, con ablaciones donante-on/off pendientes por el autor.
- Experimentos de alineamiento de representaciones: los ficheros `provenance.json` y `results/alignment-result.json` permiten replicar la calibración ridge con pares de activaciones sobre código C++.
- Pruebas de runtimes personalizados: útil para validar parches de motor que soporten tensores donantes adicionales sin romper la carga del backbone.
- Evaluación de decodificación especulativa MTP: la configuración Q4 con cinco borradores MTP alcanzó 69,009 tokens/s en sondas de decodificación de 768 tokens, útil para comparar estrategias de decodificación en un runtime propio.
- Prototipado de asistentes de código con contexto largo: el contexto de 131K permite probar escenarios de repositorio, aunque la calidad a esa longitud no está verificada.
- Demostraciones de pipeline multimodal con proyector separado: para validar la integración de `mmproj` en un motor GGUF parcheado con una única prueba de imagen.

## Benchmarks y rendimiento

El autor insiste en que estas cifras son cribas locales pequeñas, no puntuaciones de benchmark de código consolidadas. Ocho tareas de desarrollo y tres tareas introducidas después, una semilla (42), temperatura 1,0, top-p 0,95, top-k 20, razonamiento medio para Qwen/Chimera, presupuesto inicial de 4.096 tokens de salida incluido razonamiento.

| Modelo | Desarrollo (8 tareas) | Tres tareas posteriores | Retests suplementarios a 16.384 tokens |
|---|---:|---:|---|
| Qwen Q8 baseline | 8/8 | 2/3 | Caso truncado de parser superado |
| Chimera Q8 | 8/8 | 3/3 | No necesarios |
| Chimera Q4 ajustado | 7/8 | 2/3 | Ambos casos truncados superados (parche JSON, parser) |
| Swift referencia | Fuera de la comparación pareada | 2/3 | Ninguno; el caso de transacción falló por error de código |

Los retests suplementarios no son casos independientes adicionales ni un 11/11 pass@1 para Q4: resuelven fallos de presupuesto de salida, y el Qwen sin parchear también completó su caso truncado al darle más tokens. No se establece ventaja de calidad para Chimera.

Throughput: la mejor configuración Q4 seleccionada alcanzó 69,009 tokens/s, mediana de tres sondas de decodificación de código de 768 tokens, elegida entre 16 configuraciones cargadas con éxito (una decimoséptima con row-split falló al cargar). Q4 sin MTP midió unos 40 TPS; Q8 observó unos 26 TPS en su criba de calidad. Son velocidades de decodificación, no de prefill ni latencia end-to-end de agente, y no es throughput sostenido en contexto largo. El objetivo de 80 TPS no se alcanzó. El control GPU con donante a cero coincidió en las tres sondas cortas de continuación con diferencia cero en las log-probabilidades registradas, lo que valida la implementación de rama separada en esas sondas, no la equivalencia universal ni la utilidad del donante.

## Requisitos de hardware

- VRAM estimada: el peso Q4_K_M ocupa 16,848 GB decimales y el Q8_0 29,085 GB; a esto hay que sumar KV cache, estado recurrente, MTP, visión y buffers del runtime. El tamaño de fichero no es la memoria total de inferencia.
- Proyector de visión: 0,931 GB adicionales en BF16 para entrada de imagen.
- GPU recomendadas: no disponible (el autor no especifica modelos de GPU; solo menciona un control en GPU y un shim de despacho CUDA opcional con cutoff 2).
- ¿Cabe en GPU de consumo? No disponible como afirmación del autor; por tamaño, Q4_K_M (16,8 GB) queda por encima de 16 GB y requiere tarjetas de 24 GB o más, pero esto es inferencia a partir del tamaño de fichero, no un dato publicado.
- Despliegue: exclusivamente con el runtime parcheado indicado por el autor. No compatible de forma fiable con llama.cpp estándar, vLLM, TGI u Ollama, que pueden ignorar los tensores donantes. No hay endpoint alojado.
- Latencia y throughput: 69,009 tokens/s en decodificación Q4 con MTP (mediana de tres sondas de 768 tokens); ~40 TPS en Q4 sin MTP; ~26 TPS en Q8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chimera-27B-v0.1 | 27,36B (35,4M donantes) | 131.072 (no verificado end-to-end) | Apache 2.0 | GGUF Q4_K_M, Q8_0 | Requiere runtime parcheado; sin benchmarks consolidados |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible en la información | No disponible en la información | Safetensors (base) | Backbone original; sirve de baseline en las cribas del autor |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (donante) | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | Solo se usa su experto compartido de capa 0 |
| Chimera-Qwen3.8-27B-Cyber-v1 (mradermacher) | 27B (Qwen3 denso + LoRA) | Contexto largo declarado | Apache 2.0 | GGUF (i1, imatrix) | Modelo distinto, mismo backbone Qwen3.8-27B, orientado a ciberseguridad ofensiva |

## Limitaciones y advertencias

- El autor declara explícitamente que el injerto no demuestra mejora de calidad; los resultados son cribas locales pequeñas con una sola semilla.
- Cargar los ficheros en un motor sin parchear puede ignorar silenciosamente los tensores donantes y ejecutar solo el Qwen base.
- No hay router aprendido ni entrenamiento por gradiente del modelo combinado; el donante se suma con peso fijo 0,1 en la capa 0.
- La calibración se hizo sobre código C++ con un proxy de activaciones de un DeepSeek Coder cuantizado; la transferencia a otros dominios no está evaluada.
- Los errores de alineamiento se seleccionaron sobre el conjunto de validación, por lo que no son puntuaciones de test independientes.
- La calidad de recuperación y razonamiento a 128K no se probó pese a la asignación de 131.072 tokens.
- Quedan pendientes: edición de repositorios, trayectorias de agente largas, visión más amplia, múltiples semillas y ablaciones donante-on/off.
- El throughput de 69 TPS es decodificación en sondas cortas, no latencia end-to-end ni contexto largo sostenido.
- Sesgos y riesgo de alucinación: no documentados por el autor; heredables del backbone Qwen y del donante DeepSeek.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad y el requisito de runtime propio desaconsejan producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhound/Chimera-27B-v0.1-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo donante DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Perfil del autor: https://huggingface.co/zhound
- Provenance del injerto: `provenance.json` (en el repositorio del modelo)
- Resultados de alineamiento: `results/alignment-result.json` (en el repositorio del modelo)
- Modelo relacionado (mismo backbone, otro propósito): https://huggingface.co/mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-i1-GGUF
- Modelo relacionado (variante sin imatrix): https://huggingface.co/mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-GGUF
