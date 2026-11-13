# SZLHOLDINGS/physics-master-v1-candidate

## Resumen

physics-master-v1-candidate es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. No se trata de un modelo completo con pesos propios, sino de un conjunto de artefactos de ajuste fino: el adaptador final y cuatro checkpoints intermedios del entrenador (pasos 50, 100, 150 y 200). El repositorio ocupa 0,7 GB e incluye safetensors del adaptador, configuración PEFT, ficheros de tokenizador y plantilla de chat.

El modelo hereda del base una arquitectura transformer decoder-only de 3B parámetros orientada a generación de código, con licencia Qwen Research. El adaptador aplica LoRA con r=32, alpha=64 y dropout 0,05 sobre las proyecciones de atención (q_proj, k_proj, v_proj, o_proj). El entrenamiento alcanzó 200 pasos (2 épocas, época registrada 1,6) con una pérdida final de 0,488 y una precisión media por token de 0,811 según los logs del Trainer.

Su relevancia actual es limitada y de carácter experimental: es un candidato publicado sin evaluación independiente, sin model card completa (la del repositorio es una plantilla PEFT con marcadores "More Information Needed"), sin datos de entrenamiento declarados y sin métricas de benchmark. Resulta útil únicamente como artefacto de investigación reproducible para inspeccionar la dinámica de un ajuste LoRA sobre Qwen2.5-Coder-3B, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-Coder-3B-Instruct) con adaptador LoRA |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no declara recuento propio (r=32 sobre q/k/v/o_proj) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | Qwen Research License Agreement (uso no comercial; comercial requiere licencia de Alibaba Cloud) |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; PEFT 0.21.2 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3B parámetros. La configuración LoRA registrada en `final/adapter_config.json` y en los checkpoints es: `peft_type` LORA, `task_type` CAUSAL_LM, `peft_version` 0.21.2, r=32, lora_alpha=64, lora_dropout=0,05, bias none, `target_modules` = v_proj, k_proj, q_proj, o_proj, con `use_dora` y `use_rslora` en false. No se emplean técnicas como DoRA o rsLoRA.

El entrenamiento, según `checkpoint-200/trainer_state.json`, alcanzó `global_step` 200 de `max_steps` 200, con `num_train_epochs` 2 y época registrada 1,6. La pérdida evolucionó de 0,532 (paso 50) a 0,504 (paso 100), 0,491 (paso 150) y 0,488 (paso 200); la precisión media por token en el último paso fue 0,811 y el `num_tokens` registrado 168.656. `best_metric` y `best_model_checkpoint` son nulos, lo que indica que no se seleccionó checkpoint por métrica de validación. El dataset, el hardware y la duración no se declaran en los ficheros de texto inspeccionados. No se documenta RLHF, DPO ni ninguna innovación técnica adicional más allá del ajuste LoRA estándar.

## Capacidades

- Generación de texto y código: hereda las capacidades del base Qwen2.5-Coder-3B-Instruct, orientado a tareas de programación.
- Razonamiento y matemáticas: presumiblemente heredadas del base, aunque el adaptador no documenta mejoras específicas ni evaluación.
- Tool calling / function calling: no documentado para este adaptador; depende de las capacidades del base.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ajuste específico: el nombre "physics-master" sugiere un ajuste orientado a física, pero no hay evidencia en la información proporcionada que lo confirme ni que describa el corpus utilizado.

## Casos de uso

- Investigación de dinámica de ajuste LoRA: el repositorio incluye checkpoints intermedios (50, 100, 150, 200) con estados de optimizador, scheduler y RNG (eliminados de `main` pero presentes en el historial git), lo que permite reproducir y analizar la evolución del entrenamiento paso a paso.
- Reproducción de experimentos PEFT: la configuración concreta (r=32, alpha=64, target_modules q/k/v/o_proj) sirve como referencia para replicar ajustes sobre Qwen2.5-Coder-3B-Instruct.
- Evaluación comparativa de adaptadores: útil como punto de partida para medir el efecto de un ajuste corto (200 pasos) frente al modelo base en tareas de código, siempre que el investigador aporte su propio conjunto de evaluación.
- Pruebas de integración con PEFT: permite validar pipelines de carga de adaptadores (`PeftModel.from_pretrained`) sobre el base en entornos de investigación.
- Estudio de fugas de información en repositorios públicos: el caso documenta la exposición de `optimizer.pt`, `rng_state.pth` y `scheduler.pt` en un repo público, útil como ejemplo de buenas prácticas de publicación.
- Prototipado interno no comercial: dado que la licencia restringe el uso comercial, solo cabe emplearlo en entornos de investigación o evaluación internos, nunca en productos comerciales sin licencia de Alibaba Cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos son los logs del bucle de entrenamiento del Trainer (pérdida y precisión media por token), que no constituyen una evaluación publicada. No hay claves `eval_*` en ningún `trainer_state.json` ni informe de evaluación independiente en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa una fracción del repo de 0,7 GB; la inferencia requiere cargar el modelo base Qwen2.5-Coder-3B-Instruct completo. En fp16, el base de 3B requiere aproximadamente 6-7 GB de VRAM; en cuantización de 8 bits, alrededor de 3-4 GB; en 4 bits, unos 2-3 GB (estimaciones estándar para 3B, no publicadas por el autor).
- GPU recomendadas: no declaradas por el autor. Para el base de 3B en fp16 basta una GPU con 8-12 GB (RTX 3060/4060 Ti, RTX 4070); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, el base de 3B es apto para GPUs de consumo con 8 GB o más en cuantización; el adaptador añade una sobrecarga mínima.
- Opciones de despliegue: carga mediante PEFT (`PeftModel.from_pretrained`) sobre el base con Transformers; el adaptador no incluye pesos fusionados ni GGUF, por lo que para llama.cpp/Ollama sería necesario fusionar el adaptador con el base previamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| physics-master-v1-candidate (este) | 3B (base) + LoRA r=32 | No disponible | No | Qwen Research (no comercial) | Adaptador PEFT en HF |
| Qwen/Qwen2.5-Coder-3B-Instruct (base) | 3B | No disponible en esta ficha | Sí, publicada por Qwen | Qwen Research / Apache 2.0 segun variante | Modelo completo en HF |
| Adaptadores LoRA comunitarios sobre Qwen2.5-Coder-3B | 3B (base) + LoRA | Depende del base | Variable, a menudo no publicada | Variable | HF |

La comparación directa con alternativas de la misma categoría (adaptadores LoRA sobre Qwen2.5-Coder-3B) no está disponible con datos verificables; el autor no ofrece benchmarks que permitan situar este adaptador frente a otros.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay benchmarks, conjunto de validación ni métricas de calidad; el rendimiento real es desconocido.
- Model card incompleta: la del repositorio es la plantilla PEFT por defecto con marcadores "More Information Needed"; la información sustantiva proviene de los ficheros de configuración y del `trainer_state.json`.
- Dataset no declarado: se desconoce la composición, el tamaño y la procedencia de los datos de entrenamiento, lo que impide evaluar sesgos y riesgo de contaminación.
- Riesgo de alucinación: heredado del base Qwen2.5-Coder-3B-Instruct y no cuantificado para este adaptador.
- Sesgos conocidos: no documentados; al no declararse el corpus, no pueden caracterizarse.
- Limitaciones de contexto e idioma: no disponibles; dependen del base y no se han verificado para el adaptador.
- Restricción de licencia: Qwen Research License Agreement limita el uso a fines no comerciales (investigación o evaluación); el uso comercial requiere licencia de Alibaba Cloud. Es un caveat crítico para producción.
- Fuga de estados de entrenamiento: `optimizer.pt`, `rng_state.pth`, `scheduler.pt` y `training_args.bin` estuvieron expuestos en un repo público y siguen en el historial git, lo que puede revelar dinámicas de entrenamiento.
- Entrenamiento corto: 200 pasos y 168.656 tokens registrados; `best_model_checkpoint` nulo indica ausencia de selección por validación, por lo que el checkpoint final no está garantizado como el mejor.
- Artefacto "candidate": el propio nombre indica estado provisional; no debe tratarse como versión estable.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/physics-master-v1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Repositorio PEFT: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
