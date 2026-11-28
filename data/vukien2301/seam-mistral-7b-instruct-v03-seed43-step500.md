# vukien2301/seam-mistral-7b-instruct-v03-seed43-step500

## Resumen

SEAM es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario `vukien2301`. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino de 500 pasos sobre el modelo instruct de Mistral con el objetivo de servir como **defensa de referencia (baseline) frente a fine-tuning malicioso** (harmful fine-tuning). Forma parte de los experimentos del trabajo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, y se generó con el script `baselines/run_all.py` de ese repositorio usando la semilla 43.

El modelo hereda la arquitectura y el tokenizador de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso de aproximadamente 7.248 millones de parámetros (7.248.023.552 según los pesos en safetensors) con una ventana de contexto de 32.768 tokens en el modelo base. El repositorio ocupa 14,5 GB, lo que corresponde a pesos en precisión de 16 bits sin cuantizar.

Su relevancia es acotada y muy específica: sirve como punto de comparación reproducible para investigadores que estudian técnicas de defensa ante ajustes finos adversariales. El autor advierte explícitamente de que **no es un modelo certificado en seguridad** y que su uso y licencia siguen los del modelo base. A fecha de la información disponible no tiene descargas y cuenta con un único "like", lo que refleja su carácter de artefacto de investigación más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-Instruct-v0.3, ajustado) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio solo contiene safetensors en el formato original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible de forma explicita; el autor indica que sigue la licencia del modelo base `mistralai/Mistral-7B-Instruct-v0.3` (Apache 2.0 en dicho modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso con atención de ventana deslizante y las innovaciones propias de la familia Mistral-7B (atención con *sliding window*, RoPE y tokenizador de 32.000 entradas). El checkpoint no introduce cambios estructurales; el ajuste se aplica sobre los pesos existentes.

El entrenamiento consistió en un fine-tuning de 500 pasos con semilla 43 sobre `mistralai/Mistral-7B-Instruct-v0.3`, ejecutado mediante el script `baselines/run_all.py` del repositorio del paper *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. La model card no detalla la composición del dataset, el número de tokens procesados, la tasa de aprendizaje ni si se emplearon técnicas de RLHF o DPO. El propósito declarado es servir como **defensa SEAM de referencia** frente a fine-tuning malicioso, es decir, un modelo entrenado para resistir la degradación de sus salvaguardas cuando un atacante lo ajusta con datos dañinos. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las ya presentes en el modelo base.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones de múltiples turnos.
- Generación de código y resolución de problemas matemáticos básicos, en la medida en que lo permite el modelo base.
- Soporte de *tool calling* / *function calling*: no documentado en la model card; depende de las capacidades del modelo base y no se confirma para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: resistencia a *harmful fine-tuning* (defensa SEAM), orientada a investigación en seguridad de modelos.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- **Investigación en seguridad de modelos**: usar el checkpoint como baseline SEAM en experimentos de *harmful fine-tuning*, comparando su resistencia frente a otros métodos de defensa con la misma semilla y número de pasos.
- **Reproducibilidad de experimentos**: al estar generado con `baselines/run_all.py` y semilla 43, permite reproducir exactamente la condición de referencia del paper *No Cheap Escape* en estudios de geometría de barreras colaterales.
- **Evaluación de robustez ante ajustes adversariales**: servir como punto de partida para medir cuánto tarda un atacante en degradar las salvaguardas de un modelo defendido, comparándolo con el modelo base sin defender.
- **Docencia y formación en seguridad de IA**: ilustrar en cursos o talleres cómo se construye y evalúa una defensa de fine-tuning, usando un checkpoint pequeño (7B) que cabe en una GPU de gama alta.
- **Pruebas de pipelines de evaluación de seguridad**: integrar el modelo en arneses de evaluación tipo *red teaming* para validar que las métricas de daño se comportan de forma consistente entre checkpoints.
- **Comparación de metodologías de defensa**: usar el checkpoint como control en estudios que comparen SEAM con otras técnicas (p. ej., regularización, mezcla de datos seguros) sobre la misma base Mistral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 14,5 GB en FP16/BF16 (tamaño del repositorio); en cuantización de 8 bits en torno a 7-8 GB y en 4 bits en torno a 4-5 GB, aunque el repositorio no incluye versiones cuantizadas.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB o L40S para FP16 sin problemas; una RTX 4090 (24 GB) puede alojar el modelo en FP16 con margen ajustado.
- **¿Cabe en GPU de consumo?**: sí, en GPUs con 16 GB o más en FP16 (RTX 4090, RTX 4080, A6000); en GPUs de 8-12 GB requeriría cuantización, que no está publicada en el repositorio.
- **Opciones de despliegue**: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en los tags), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SEAM Mistral-7B-Instruct-v0.3 (este) | 7,25 B | no disponible (base: 32.768) | heredada del base (Apache 2.0) | Hugging Face, 0 descargas | Checkpoint de investigación, no certificado en seguridad |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin defensa SEAM |
| Mistral-7B-Instruct-v0.2 | 7,25 B | 32.768 | Apache 2.0 | Hugging Face | Versión anterior del base, sin soporte de tool calling nativo |
| Zephyr-7B-beta | 7,25 B | 32.768 | MIT | Hugging Face | Alternativa instruct de 7B con DPO, sin defensa específica |

La comparación directa con otros métodos de defensa frente a *harmful fine-tuning* no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo certificado en seguridad**: el propio autor lo indica; no debe desplegarse como modelo de producción con garantías de alineamiento.
- **Riesgo de alucinación**: heredado del modelo base Mistral-7B-Instruct-v0.3, sin mitigaciones adicionales documentadas.
- **Sesgos conocidos**: no documentados para este checkpoint; se presumen los del modelo base.
- **Limitaciones de contexto e idioma**: no documentadas en la model card; el contexto e idiomas efectivos dependen del modelo base.
- **Restricciones de licencia**: la model card no especifica una licencia propia; el autor remite a la del modelo base `mistralai/Mistral-7B-Instruct-v0.3` (Apache 2.0). Conviene verificar los términos del modelo base antes de cualquier uso comercial.
- **Artefacto de investigación**: solo 500 pasos de entrenamiento con semilla 43; no hay garantía de que el comportamiento sea estable fuera del contexto experimental del paper.
- **Sin datos de evaluación**: no hay benchmarks publicados, por lo que no es posible cuantificar su rendimiento ni su resistencia real a ataques.
- **Repositorio con 0 descargas**: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vukien2301/seam-mistral-7b-instruct-v03-seed43-step500)
- [Modelo base: mistralai/Mistral-7B-Instruct-v0.3](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3)
- Paper de referencia citado en la model card: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del paper con el script `baselines/run_all.py`: no se proporciona URL en la información disponible
