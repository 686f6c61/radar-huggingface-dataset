# SZLHOLDINGS/chaski-r2

## Resumen

chaski-r2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B publicado por SZLHOLDINGS dentro de su catálogo de modelos, datasets y Spaces con trazabilidad documentada. El artefacto es un adaptador PEFT (la librería declarada es `peft`) que, empaquetado en safetensors, suma 752.393.024 parámetros y ocupa 6,1 GB en el repositorio. La arquitectura declarada en las etiquetas es `qwen3_5_text`, es decir, la familia Qwen3.5 en su variante de texto, sobre la que se aplica el ajuste.

El modelo se distribuye con licencia Apache 2.0 y pipeline de `text-generation`. No hay información sobre idiomas soportados ni sobre el proceso de entrenamiento más allá de la referencia al modelo base. La model card es deliberadamente escéptica: el autor declara que cualquier afirmación de calidad no respaldada por un recibo de evaluación medido se marca como UNKNOWN, y en la auditoría del 22 de noviembre de 2026 el artefacto no supera el umbral estricto de cadena de recibos (`UNKNOWN_NO_EVAL_RECEIPT`).

Su relevancia es, por tanto, la de un artefacto experimental de bajo perfil: útil para quien quiera inspeccionar el formato de publicación del estate SZL Holdings o experimentar con un fine-tune PEFT sobre Qwen3.5-0.8B, pero sin métricas públicas que justifiquen su adopción en producción frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante de texto; etiqueta `qwen3_5_text`) |
| Parámetros totales | 752.393.024 (dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; librería `peft`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. Sobre esa base se aplica un ajuste con PEFT, lo que implica que el repositorio contiene pesos de adaptador (o pesos fusionados, dado el recuento de 752 millones de parámetros) en lugar de un entrenamiento desde cero. La etiqueta `qwen3_5_text` confirma que se trata de la variante exclusivamente textual, sin torre de visión.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o SFT supervisado. La model card no documenta ninguna innovación arquitectónica propia: se limita a declarar la identidad del repositorio, enlazar la organización canónica en GitHub y describir el sistema de recibos de auditoría del estate. Cualquier detalle adicional sobre el entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento y respuesta a instrucciones: presumiblemente presente por herencia del base, aunque no verificado con evaluaciones publicadas.
- Generación de código y matemáticas: capacidad esperable del base, sin métricas que la respalden en este artefacto.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Capacidades especiales (modo thinking, visión, audio): no documentadas; la variante es de texto.

## Casos de uso

- Evaluación de formatos de publicación PEFT: el repositorio sirve para estudiar cómo SZL Holdings empaqueta adaptadores y pesos en safetensors con metadatos de auditoría, útil para equipos que diseñen sus propios pipelines de publicación de modelos.
- Prototipado local de generación de texto: con 752 millones de parámetros, el modelo puede ejecutarse en una GPU de consumo para pruebas de integración de pipelines de inferencia, siempre que se valide la calidad contra el base.
- Comparación de fine-tunes sobre Qwen3.5-0.8B: útil como muestra en estudios de casos sobre qué aporta un ajuste PEFT frente al modelo original en tareas concretas, midiendo la diferencia con un harness propio.
- Docencia y experimentación académica: un artefacto pequeño y con licencia permisiva permite reproducir flujos de carga con `transformers` + `peft` sin coste de infraestructura elevado.
- Base para nuevos ajustes: al ser Apache 2.0 y derivar de Qwen3.5-0.8B, puede servir como punto de partida para fine-tunes adicionales en dominios específicos, con la advertencia de que su calidad no está medida.
- Integración en pipelines de CI para pruebas de humo: verificar que un servicio de inferencia arranca, carga pesos y devuelve texto coherente con un modelo de este tamaño es barato y rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la auditoría del 22 de noviembre de 2026 concluye `UNKNOWN_NO_EVAL_RECEIPT`: no existe cadena de recibos de evaluación en las rutas estándar (`eval/frontier-v1/DONE.json`, `final/train_receipt.json`).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,5 GB solo para pesos (752 M de parámetros × 2 bytes), más overhead de activaciones y caché KV según contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8 GB de pesos; en 4 bits, alrededor de 0,4 GB. No se publican variantes cuantizadas oficiales, por lo que habría que generarlas localmente.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: al ser un artefacto PEFT, la carga requiere `transformers` con `peft`; para servirlo en producción se puede fusionar el adaptador y exportar a vLLM, TGI o llama.cpp (previa conversión a GGUF). No hay recetas oficiales documentadas.
- Latencia y throughput: no disponibles. Con 752 M de parámetros se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SZLHOLDINGS/chaski-r2 | 752 M | No disponible | Apache 2.0 | Fine-tune PEFT de Qwen3.5-0.8B, sin evaluación publicada |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible en esta ficha | Apache 2.0 (según el base) | Modelo base oficial; referencia para comparar el efecto del ajuste |
| Qwen3-0.6B | ~0,6 B | 32 768 tokens (según documentación pública de Qwen3) | Apache 2.0 | Alternativa de tamaño similar de la generación anterior de Qwen |
| Llama 3.2 1B | ~1,2 B | 128 000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | Alternativa de tamaño comparable con contexto largo y licencia con restricciones |

La comparación con Qwen3-0.6B y Llama 3.2 1B se ofrece como referencia de categoría; no se dispone de métricas de chaski-r2 que permitan comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Ausencia de evaluación: la auditoría del autor marca el artefacto como `UNKNOWN_NO_EVAL_RECEIPT`; no hay ninguna métrica de calidad, seguridad o sesgo publicada.
- Riesgo de alucinación: no cuantificado. Al tratarse de un modelo de 0,8 B, la tasa de alucinación esperable es alta en tareas de conocimiento factual.
- Idiomas: el campo de idiomas no está disponible; no se puede asumir un rendimiento multilingüe correcto sin pruebas propias.
- Contexto: no se documenta la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base Qwen3.5-0.8B mantiene la misma licencia y que el ajuste no introduce restricciones adicionales.
- Formato PEFT: la carga requiere la librería `peft` y el modelo base; no es un artefacto autónomo listo para servir sin pasos previos de fusión o configuración.
- Trazabilidad incompleta: los recibos de entrenamiento y evaluación no están en las rutas estándar, por lo que la cadena de auditoría queda abierta según el propio autor.
- Madurez: 385 descargas y 0 likes en el momento de la consulta indican un artefacto de baja adopción y escasa validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r2
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización canónica en GitHub: https://github.com/szl-holdings
- Repositorio de generación de cards: https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Bundle de recibos citado en la card: SZLHOLDINGS/wave-logs, ruta `mesh/2026-11-22/model-receipts/pass3-core/` (en Hugging Face)
- Ledger de bloqueo citado: szl-holdings/szl-eval-harness, `ledger/blocking_ledger_v1.json` (en GitHub)
