# SZLHOLDINGS/salad-prime-principle-r1

## Resumen

salad-prime-principle-r1 es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros desarrollado por Alibaba Qwen. El adaptador se ha entrenado dentro del programa interno "Salad" de SZL Holdings, que impone una doctrina de entrenamiento con recibos verificables (fail-closed receipted-training): registros honestos de energía medida vía NVML/Zeus y ausencia de conteos o marcas temporales fabricadas. El resultado es un artefacto de entrenamiento en fase de candidato, no un modelo de producción publicado.

El modelo hereda del Qwen3-1.7B la arquitectura, el tokenizador y la ventana de contexto; el LoRA añade una especialización de comportamiento que el autor no detalla en la model card. El repositorio incluye la escalera completa de checkpoints (50, 100, 150 y 200 pasos) más el directorio `final/`, lo que permite reproducir la evolución del ajuste. El tamaño del repo es de 0,6 GB y los pesos se distribuyen en safetensors.

Su relevancia actual es limitada pero concreta: sirve como ejemplo de adaptador LoRA pequeño y desplegable sobre un modelo de 1,7B, con trazabilidad de entrenamiento documentada. No hay benchmarks, demos ni documentación funcional publicados, por lo que su evaluación práctica requiere probarlo directamente sobre el checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/PEFT |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); parámetros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible; el adaptador se publica en safetensors, la cuantizacion depende del despliegue del base |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar el base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only con atención estándar y tokenizador propio de la familia Qwen3. El LoRA se entrena con PEFT y se publica como escalera de checkpoints en los pasos 50, 100, 150 y 200, además del checkpoint `final/`. El autor no especifica el rango del LoRA, los módulos objetivo, la tasa de aprendizaje ni la composición del dataset de ajuste.

La innovación declarada no está en la arquitectura sino en el proceso: el programa Salad exige "recibos" de entrenamiento honestos, con energía medida mediante doble metering NVML/Zeus y sin conteos ni timestamps fabricados. Los artefactos de ejecución (heartbeat y recibos de finalización) se alojan en los logs de la lane SZLHOLDINGS/frontier-54-runs. No se documenta si hubo RLHF, DPO ni fases de alineamiento adicionales sobre el adaptador.

## Capacidades

- Generación de texto en inglés, heredada del base Qwen3-1.7B.
- Razonamiento y código: capacidad del modelo base, no verificada específicamente para el adaptador.
- Tool calling y function calling: no documentado para el adaptador; depende de lo que conserve del base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no documentadas para el adaptador.

## Casos de uso

- Experimentación con LoRA sobre modelos pequeños: cargar el adaptador sobre Qwen3-1.7B en un entorno de investigación para comparar los checkpoints 50/100/150/200 y estudiar la evolución del ajuste.
- Reproducción de pipelines de entrenamiento con trazabilidad: usar los recibos y logs de la lane frontier-54-runs como referencia para implementar metering de energía en entrenamientos propios.
- Prototipado de asistentes en inglés de bajo coste: desplegar el par base+adaptador en una GPU consumer para tareas de generación de texto sencillas.
- Evaluación de adaptadores PEFT en CI: integrar el adaptador en un pipeline de evaluación automática que mida regresiones respecto al base antes de promoverlo.
- Docencia y formación: ilustrar el ciclo completo de un ajuste LoRA con checkpoints intermedios y artefactos de provenance.
- Base para fine-tuning posterior: partir del adaptador como inicialización en dominios específicos en inglés, dado su tamaño reducido y licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el base Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; en 8 bits unos 1,7 GB y en 4 bits alrededor de 0,9 GB, más KV cache y overhead. El adaptador LoRA añade una fracción mínima.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para despliegue en FP16; cualquier GPU consumer con 6-8 GB de VRAM para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más en cuantización, y en 8-12 GB en FP16.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten LoRA sobre el base; llama.cpp/Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| salad-prime-principle-r1 | 1,7B (base) + LoRA | no disponible | Apache 2.0 | Adaptador candidato, sin benchmarks |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 | Modelo base; referencia obligada de comparación |
| Adaptadores LoRA comunitarios sobre Qwen3-1.7B | 1,7B (base) | depende del base | variable | Alternativas directas en el ecosistema PEFT |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto en fase de candidato: el propio autor indica que no es un modelo de producción publicado.
- Sin benchmarks ni evaluación funcional publicada; el comportamiento del adaptador es desconocido más allá de lo que herede del base.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a un modelo de 1,7B, agravado por la ausencia de evaluación.
- Sesgos del dataset de ajuste no documentados; no se describe la composición de los datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin pruebas propias.
- Dependencia del base Qwen3-1.7B: hay que verificar que la versión del base cargada coincida con la usada en el entrenamiento para evitar degradación.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-prime-principle-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organización SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Lane de ejecución frontier-54-runs: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
