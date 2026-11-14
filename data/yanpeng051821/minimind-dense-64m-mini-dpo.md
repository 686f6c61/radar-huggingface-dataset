# yanpeng051821/minimind-dense-64m-mini-dpo

## Resumen

MiniMind Dense 64M mini-DPO es un checkpoint de investigación publicado por el usuario yanpeng051821 en Hugging Face. Se trata de un ajuste fino por DPO (Direct Preference Optimization) de parámetros completos sobre el modelo MiniMind Dense 64M mini-SFT, que a su vez deriva del proyecto MiniMind de jingyaogong. El modelo es un transformer decoder-only de 63.912.192 parámetros únicos, con tokenizer propio de 6.400 tokens y embedding y cabeza LM atados. Su propósito no es el despliegue en producción, sino servir como experimento reproducible de alineación a pequeña escala.

La relevancia de este checkpoint es metodológica más que funcional: documenta con detalle un ciclo de DPO de una época sobre 16.126 pares de preferencia, ejecutado en una única GPU RTX 4060 Ti. El autor es explícito al señalar que, aunque la pérdida de preferencia en el conjunto de validación mejoró, las pruebas de generación y de uso de herramientas no mostraron mejoras confirmadas. Por tanto, debe interpretarse como una pieza de investigación sobre dinámica de DPO en modelos minúsculos, no como un asistente conversacional fiable.

El modelo se distribuye con licencia Apache 2.0, solo soporta chino (`zh`) y no es compatible con el cargador automático de Transformers: requiere un runtime propio incluido en el bundle FP32 (pesos, configuración, tokenizer, dependencias y scripts de inferencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estilo MiniMind) |
| Parametros totales | 63.912.192 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 768 tokens de tope combinado prompt+salida en inferencia; rama de entrenamiento DPO limitada a 1.024 tokens |
| Tipos de cuantizacion | no disponible (el bundle publicado es FP32 nativo) |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bundle FP32 con runtime Python propio (no es un adaptador AutoModel de Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 63,9 millones de parámetros, con tokenizer MiniMind de 6.400 tokens y embedding y cabeza LM atados. El punto de partida es el checkpoint S1 (mini-SFT), y tanto la política como la referencia congelada se inicializan desde los mismos pesos; solo se actualizan los parámetros de la política. No hay innovaciones de atención ni decodificación especulativa documentadas.

El entrenamiento DPO usó el fichero `dpo.jsonl` del dataset `jingyaogong/minimind_dataset` (revisión `312afb4f76391145c6902f765bb51691c09a12f5`), filtrado a 16.126 pares de entrenamiento y 512 de desarrollo sin solapamiento exacto de contexto, excluyendo ramas completas que superasen 1.024 tokens. Se ejecutó una época (4.032 actualizaciones), un par por micro-lote, cuatro micro-lotes por actualización completa, forward en BF16 y scoring en FP32 sobre una RTX 4060 Ti. Se usó AdamW con beta DPO de 0,15, learning rate coseno de 4e-8 a 4e-9 y clipping de gradiente de 1,0. El modelo seleccionado es el paso final, no un checkpoint elegido por evaluación.

## Capacidades

- Generación de texto en chino con decodificación greedy mediante el script `chat.py` incluido.
- Continuación de texto plano mediante `load_model.py`.
- Plantilla de chat MiniMind aplicada en `chat.py` para turnos únicos.
- Ajuste de preferencias medido en pérdida DPO sobre pares retenidos (0,653088 frente a 0,693147 inicial).
- No soporta tool calling: los diagnósticos de herramientas dieron 0 aciertos confirmados de 4.
- No soporta agentes ni razonamiento multi-paso.
- No retiene historial de conversación.
- Capacidades multilingües limitadas al chino; no se documenta soporte de otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos de DPO a pequeña escala: el bundle incluye pesos, configuración, tokenizer y scripts, lo que permite replicar el pipeline de preferencias en una sola GPU consumer y estudiar la dinámica de la pérdida.
- Investigación sobre alineación en modelos minúsculos: útil para analizar por qué una mejora en margen de preferencia (64,84% de pares con margen positivo) no se traduce en mejoras de tarea.
- Docencia y formación: sirve para ilustrar el ciclo SFT → DPO con un modelo de 64M que cabe en cualquier equipo y con receta de entrenamiento completamente documentada.
- Análisis de repetición y degeneración: el autor reporta una caída de la fracción media de cuatro-gramas repetidos del 38,02% al 33,84%, lo que permite estudiar métricas de diversidad léxica en modelos pequeños.
- Evaluación de criterios de generación: los 36 prompts y criterios V2 reutilizados del SFT permiten comparar checkpoints con un conjunto fijo de sondas.
- Pruebas de infraestructura de inferencia: al requerir un runtime propio y no ser un adaptador de Transformers, es útil para validar pipelines de despliegue personalizados en CPU o CUDA.
- Estudio de límites de contexto corto: con un tope de 768 tokens combinados, sirve para medir degradación en ventanas pequeñas.

## Benchmarks y rendimiento

| Medida | S1 inicial | DPO final |
|---|---:|---:|
| Pérdida DPO media, 512 pares retenidos | 0,693147 | 0,653088 |
| Pares con margen positivo relativo a referencia | 0 (512 empates) | 332 (64,84%) |
| Sondas de generación: pasa / falla / incierto | 0 / 31 / 1 | 0 / 31 / 1 |
| Diagnósticos de herramientas: pases confirmados | 0 / 4 | 0 / 4 |
| EOS natural | 17 / 36 | 16 / 36 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El margen de preferencia compara diferencias de log-probabilidad elegido menos rechazado, no corrección de respuestas. Las puntuaciones son juicios iniciales del propio asistente sin revisión independiente; veinte salidas fueron idénticas token a token.

## Requisitos de hardware

- El entrenamiento DPO se ejecutó en una única RTX 4060 Ti, lo que indica que el ajuste cabe en GPUs consumer de gama media.
- El bundle publicado es FP32 nativo; el tamaño del repositorio es de 0,3 GB, por lo que la inferencia en CPU es viable.
- VRAM estimada para inferencia en FP32: en torno a 0,26 GB solo de pesos, más overhead del runtime; no se documentan cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con CUDA disponible; el script `chat.py` acepta `--device cuda`.
- Cabe en GPUs consumer como la RTX 4060 Ti y en equipos sin GPU mediante CPU.
- Opciones de despliegue: runtime propio incluido en el bundle (`chat.py`, `load_model.py`, `requirements.txt`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---:|---|---|---|---|
| MiniMind Dense 64M mini-DPO (este) | 63,9 M | 768 tokens (tope de inferencia) | Apache 2.0 | safetensors + runtime propio | Hugging Face |
| MiniMind Dense 64M mini-SFT (base) | 63,9 M | no disponible | Apache 2.0 | safetensors + runtime propio | Hugging Face |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que no es un modelo fiable para chat ni para uso de herramientas.
- Las sondas de generación no mejoraron: 0 aciertos de 31 en ambos checkpoints.
- Los diagnósticos de herramientas dieron 0 pases confirmados de 4 y no se ejecutó ninguna herramienta real.
- El margen de preferencia no mide corrección de respuestas; una mejora en DPO loss no implica mejor calidad de tarea.
- Las evaluaciones son juicios iniciales del asistente sin revisión independiente; veinte salidas fueron idénticas token a token.
- No se establecieron el etiquetado del dataset, el solapamiento semántico ni la generalización más allá del conjunto de prueba.
- Contexto muy limitado: 768 tokens combinados en inferencia; el límite de 1.024 en entrenamiento no garantiza calidad en ventanas más largas.
- Solo soporta chino; no se documenta multilingüismo.
- Riesgo de alucinación y repetición: la fracción de cuatro-gramas repetidos sigue siendo del 33,84%.
- No retiene historial de conversación ni ejecuta herramientas.
- No es un adaptador de Transformers; requiere el runtime incluido y no contiene estado de optimizador ni de reanudación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción por sus limitaciones funcionales.
- El checkpoint seleccionado es el paso final, no el mejor según evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanpeng051821/minimind-dense-64m-mini-dpo
- Modelo base SFT: https://huggingface.co/yanpeng051821/minimind-dense-64m-mini-sft
- Dataset: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Proyecto MiniMind (referencia del autor del dataset): https://github.com/jingyaogong/minimind
