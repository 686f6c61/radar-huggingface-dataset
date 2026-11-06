# viai957/nano-mistral-o1-dpo-arm-b-response

## Resumen

`nano-mistral-o1-dpo-arm-b-response` es un artefacto de investigación publicado deliberadamente como documentación de un fallo experimental. Se trata de un ajuste fino de parámetros completos de Mistral-7B-v0.3, partiendo de un checkpoint previamente sometido a SFT sobre soluciones de PRM800K (`viai957/nano-mistral-o1-sft`), y entrenado después con DPOP (DPO-Positive) más un término auxiliar NLL sobre 11.911 pares de preferencia a nivel de paso extraídos de PRM800K. El autor lo etiqueta explícitamente como "negative result" y advierte que no debe usarse para ninguna tarea que requiera un modelo de matemáticas funcional.

El interés del checkpoint no reside en su rendimiento —que es catastrófico— sino en el valor documental del fallo. El modelo obtiene un pass@1 de 0,0091 en GSM8K (12 de 1.319 problemas), frente al 0,2047 de su padre SFT, una caída que una auditoría posterior atribuyó a dos defectos en los instrumentos de entrenamiento y no al DPO a nivel de paso en sí. El checkpoint se publica para que el resultado registrado del protocolo preinscrito pueda verificarse y su modo de fallo estudiarse.

Arquitectónicamente es un transformer decoder-only estándar de la familia Mistral, con 7.248.023.552 parámetros reales en safetensors, 32 capas, GQA con 8 cabezas KV y un contexto de entrenamiento de 2.048 tokens. La relevancia actual es metodológica: sirve como control negativo y espécimen de modo de fallo para quien investigue entrenamiento con preferencias a nivel de paso o reproducción de protocolos preinscritos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `MistralForCausalLM`: 32 capas, hidden 4096, 32 cabezas de atención / 8 cabezas KV (GQA), head_dim 128, FFN 14.336 (SiLU), RMSNorm eps 1e-5, RoPE θ = 1e6, vocabulario 32.768, embeddings no atados |
| Parámetros totales | 7.248.023.552 (~7,25B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens usados en entrenamiento (max_length, truncado por la derecha); el contexto nativo de Mistral-7B-v0.3 no se declara en la información proporcionada |
| Tipos de cuantización | no disponible (entrenado y evaluado solo en bf16; fp16 no probado por riesgo de desbordamiento de logits según la configuración del proyecto) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (hereda de Mistral-7B-v0.3; las licencias de los datos se detallan en la sección 10 de la model card) |
| Formato de pesos | safetensors (`model.safetensors`, 14.496.081.136 bytes), bf16 |

## Arquitectura y entrenamiento

La base es Mistral-7B-v0.3 sin modificaciones estructurales: transformer decoder-only con atención de consultas agrupadas (32 cabezas de consulta, 8 de clave/valor), FFN de 14.336 unidades con activación SiLU, normalización RMSNorm y embeddings de entrada y salida no atados. El pipeline de entrenamiento tiene tres etapas: primero un SFT sobre 12.397 soluciones de PRM800K que produce el checkpoint padre (`nano-mistral-o1-sft`, GSM8K 0,2047); después el cálculo congelado de logprobs de referencia con un forward shardeado en FSDP2; y finalmente este ajuste con DPOP más NLL sobre 11.317 pares de entrenamiento y 594 de validación (11.911 en total, procedentes de 9.379 problemas).

Cada par comparte el problema y los primeros *k−1* pasos de solución, diferenciándose solo en el paso *k*: el elegido fue valorado +1 por los anotadores de PRM800K y el rechazado −1. El entrenamiento usó β = 0,1, λ = 50 para el término DPOP y coeficiente 0,1 para el NLL por token sobre las compleciones elegidas, con 727 pasos de optimizador (2.910 micro-pasos), batch global de 32 pares y aproximadamente 2 épocas. Se ejecutó en 4 GPUs de 23 GB con FSDP2 y bf16, con 32 h 01 min de reloj de pared y unas 128 GPU-horas.

El fallo tuvo dos causas identificadas en la auditoría. La primera (D1) fue un tripwire mal calibrado que disparó esta re-ejecución sobre una falsa alarma: la comprobación de logps/chosen saltó en el paso 43 del run primario y la auditoría demostró que se activa igual con datos barajados. La segunda (D2) es la relevante: la penalización DPOP y el término NLL no son diferencias, por lo que no se cancelan en el prefijo compartido como sí hace el margen sigmoide del DPO; en esta ejecución ambos se computaron sobre una máscara de compleción que empezaba en `prompt_len` en lugar de `shared_prefix_len`. Con una proporción media de prefijo del 87,6 %, cerca del 87 % del span de esos términos correspondía a tokens compartidos. No había clipping de gradiente activo y la norma del gradiente alcanzó 355.830 en el paso 518.

## Capacidades

- Generación de texto en inglés con formato de razonamiento paso a paso aprendido durante el SFT: párrafos `Step k: ...` seguidos de `# Answer` y la respuesta.
- Razonamiento matemático aritmético de nivel escolar, en teoría, aunque en la práctica el checkpoint está destruido para esta tarea (pass@1 de 0,0091 en GSM8K).
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de agentes ni razonamiento multi-paso orquestado más allá de la cadena de pasos interna.
- Multilingüismo: únicamente inglés declarado.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito separado de la generación.
- Valor como control negativo reproducible: conserva los pesos, el tokenizador y el historial crudo de entrenamiento (`receipts/history.jsonl`) para estudiar el modo de fallo.

## Casos de uso

- Control negativo en experimentos de alineación: usar este checkpoint como referencia de "modelo dañado por un objetivo mal implementado" al comparar variantes de DPO, DPOP o entrenamiento con preferencias a nivel de paso, midiendo la degradación frente al padre SFT.
- Estudio de modos de fallo en decodificación: el 54,1 % de las generaciones en GSM8K alcanzan el tope de 768 tokens (frente al 6,4 % del SFT), con longitud mediana igual al tope; sirve para analizar bucles degenerativos y colapso de la distribución de parada.
- Reproducción de protocolos preinscritos: el repositorio incluye el historial de entrenamiento y la auditoría (`docs/audits/phase1_postmortem.md`), lo que permite verificar el resultado registrado del protocolo y auditar la calibración de tripwires.
- Docencia e investigación metodológica: ejemplo concreto de por qué los términos auxiliares que no son diferencias deben enmascararse sobre el prefijo compartido en pares de preferencia con prefijo común.
- Análisis de estabilidad numérica en bf16: la norma de gradiente de 355.830 sin clipping en el paso 518 es un caso de estudio para políticas de clipping y calibración de tasas de aprendizaje en ajuste fino de parámetros completos.
- Verificación de pipelines de evaluación: útil para comprobar que un arnés de evaluación detecta correctamente un modelo degradado antes de desplegarlo, dado el contraste limpio entre 0,0091 y 0,2047.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados, `verified: false`):

| Benchmark | Configuración | Métrica | Resultado |
|---|---|---|---|
| GSM8K (test, completo, config `main`) | 0-shot, greedy, plantilla de prompt propia, max_new_tokens 768 | pass@1 | 0,0091 (12/1.319) |

Comparaciones internas reportadas en la model card:

| Modelo | GSM8K pass@1 | Notas |
|---|---|---|
| `nano-mistral-o1-sft` (padre) | 0,2047 [0,1838, 0,2273] | Referencia SFT |
| `nano-mistral-o1-dpo-arm-b` (DPO sigmoide vainilla, mismo dato) | 0,2108 | Estadísticamente indistinguible del SFT |
| Este checkpoint (DPOP + NLL) | 0,0091 [0,0052, 0,0158] | McNemar exacto apareado: 10 vs 268 discordantes, p = 2,8e-66 |

Precisión en preferencias held-out: 0,542 [0,502, 0,582] con n = 594, frente a 0,690 del run primario con sigmoide.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB según longitud de contexto y batch.
- El entrenamiento se realizó en 4 GPUs de 23 GB con FSDP2 y bf16, lo que da una idea del perfil mínimo para reproducir el ajuste.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en bf16 con contexto corto. En GPUs de 16 GB sería necesaria cuantización, no documentada por el autor.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 4080/4070 Ti Super (16 GB) requeriría cuantización no publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). No se documentan GGUF, llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nano-mistral-o1-dpo-arm-b-response` (este) | ~7,25B | 2.048 en entrenamiento | 0,0091 | Apache-2.0 | Hugging Face (36 descargas) |
| `nano-mistral-o1-dpo-arm-b` (DPO sigmoide, mismo dato) | ~7,25B | 2.048 en entrenamiento | 0,2108 | Apache-2.0 | Hugging Face |
| `nano-mistral-o1-sft` (padre SFT) | ~7,25B | 2.048 en entrenamiento | 0,2047 | Apache-2.0 | Hugging Face |
| `mistralai/Mistral-7B-v0.3` (base) | ~7,25B | no disponible en la información | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de la base Mistral-7B-v0.3 en la información proporcionada, por lo que la comparación con modelos externos de la misma categoría queda limitada a la familia nano-mistral-o1.

## Limitaciones y advertencias

- Checkpoint destruido para matemáticas: pass@1 de 0,0091 en GSM8K frente a 0,2047 del padre SFT. El propio autor indica explícitamente que no debe usarse para nada que requiera un modelo de matemáticas funcional.
- Modo de fallo dominante: el 54,1 % de las generaciones alcanzan el tope de 768 tokens y la longitud mediana es el propio tope, lo que indica bucles degenerativos y colapso de la distribución de parada.
- Defecto de implementación documentado (D2): la penalización DPOP y el término NLL se computaron sobre el prefijo compartido además del paso, con una proporción media de prefijo del 87,6 %; sin clipping de gradiente, la norma alcanzó 355.830.
- Defecto de instrumentación (D1): el tripwire que motivó esta re-ejecución estaba mal calibrado y se activa igual con datos barajados.
- Riesgo de alucinación: elevado y no acotado; no se han publicado evaluaciones de veracidad ni de calibración para este checkpoint.
- Idiomas: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto limitado a 2.048 tokens en entrenamiento, insuficiente para tareas de contexto largo.
- Restricciones de licencia: los pesos son Apache-2.0, pero la model card remite a la sección 10 para las licencias de los datos de entrenamiento (PRM800K y GSM8K), que deben revisarse antes de cualquier uso derivado.
- Solo se ha probado en bf16; fp16 está desaconsejado por la configuración del proyecto debido al riesgo de desbordamiento de logits.
- No apto para producción bajo ninguna circunstancia: es un artefacto de investigación con 36 descargas y sin verificación independiente de sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b-response
- Checkpoint DPO sigmoide del mismo experimento: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b
- Checkpoint padre SFT: https://huggingface.co/viai957/nano-mistral-o1-sft
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Paper de DPO (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
- Paper de DPOP (arXiv:2402.13228): https://arxiv.org/abs/2402.13228
- Paper de DPO con NLL / referencia citada (arXiv:2305.18290): https://arxiv.org/abs/2305.18290
- Dataset PRM800K: https://huggingface.co/datasets/tasksource/PRM800K
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
