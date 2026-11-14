# txqz/AR-15-lora

## Resumen

AR-15-lora es un adaptador LoRA publicado por el usuario txqz para el modelo de generación 3D a partir de imagen `microsoft/TRELLIS.2-4B`, en concreto para el submodelo de flujo de estructura dispersa `ss_flow_img_dit_1_3B_64_bf16`. No se trata de un modelo de lenguaje, sino de un ajuste fino ligero (PEFT) sobre un componente de un pipeline image-to-3D, orientado a especializar la generación de geometría hacia un dominio concreto: objetos con la forma de un fusil AR-15.

El adaptador se ha entrenado con la herramienta `trellis2-train` sobre el dataset `txqz/AR-15-trellis2`, con rango 8, alpha 16 y 1500 pasos a batch efectivo 4 y learning rate 1e-4. Su relevancia es acotada: sirve como ejemplo práctico de cómo especializar un pipeline de generación 3D mediante LoRA y como material reproducible para quien quiera replicar el flujo de entrenamiento de TRELLIS.2.

La información publicada es muy escasa: no hay licencia declarada, no se especifican idiomas, no hay benchmarks ni demos, y el modelo cuenta con 0 descargas y 0 likes en el momento de la consulta. Todo lo que sigue se limita a lo que el autor documenta en la model card y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un DiT de flujo para estructura dispersa de TRELLIS.2 (`ss_flow_img_dit_1_3B_64_bf16`) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 8; el modelo base se denomina 1_3B en el checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en bf16, según el nombre del checkpoint base) |
| Idiomas soportados | no disponible (tarea image-to-3D, no lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`ss_lora/adapter-<step>.safetensors`) + `config.json` |
| Modelo base | `microsoft/TRELLIS.2-4B` |
| Rango / alpha LoRA | 8 / 16 |
| Modulos objetivo | `to_qkv`, `to_out`, `to_q`, `to_kv`, `mlp.mlp.0`, `mlp.mlp.2` |
| Pasos de entrenamiento | 1500 (checkpoints cada 500 pasos) |
| Batch y learning rate | batch 1 x 4, lr 0.0001 |
| Dataset de entrenamiento | `txqz/AR-15-trellis2` |
| Libreria | peft |
| Pipeline | image-to-3d |

## Arquitectura y entrenamiento

El adaptador no define una arquitectura propia: es un conjunto de matrices de bajo rango inyectadas mediante `peft.LoraConfig` en las capas de atención (`to_qkv`, `to_out`, `to_q`, `to_kv`) y en las capas MLP (`mlp.mlp.0`, `mlp.mlp.2`) del DiT de flujo de estructura dispersa de TRELLIS.2. El checkpoint base indicado es `ss_flow_img_dit_1_3B_64_bf16`, es decir, el componente que modela la estructura dispersa a resolución 64 en precisión bf16 dentro del pipeline de generación 3D.

El entrenamiento se realizó con `trellis2-train` sobre el dataset `txqz/AR-15-trellis2`, con rango 8, alpha 16, 1500 pasos, batch 1 con acumulación de 4 y learning rate 1e-4. El autor publica checkpoints cada 500 pasos en `ss_lora/adapter-<step>.safetensors` junto con `ss_lora/config.json`. La carga se realiza inyectando un `peft.LoraConfig(r=rank, lora_alpha=alpha, target_modules=targets)` en el flujo con `inject_adapter_in_model` y aplicando después `set_peft_model_state_dict` con el fichero safetensors. No se documentan detalles sobre composición del dataset, número de tokens, augmentación ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline de generación 3D).

## Capacidades

- Generación de mallas o estructuras 3D a partir de una imagen de entrada, especializada en la categoría AR-15 mediante el ajuste LoRA sobre el flujo de estructura dispersa de TRELLIS.2.
- Especialización de dominio: el adaptador sesga la distribución del modelo base hacia la geometría de un fusil AR-15, según el dataset de entrenamiento declarado.
- Integración con el pipeline image-to-3D de TRELLIS.2: se aplica sobre el submodelo `ss_flow_img_dit_1_3B_64_bf16`, no sobre el pipeline completo.
- Carga mediante PEFT (`inject_adapter_in_model` + `set_peft_model_state_dict`), compatible con el ecosistema `peft`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Replicación del flujo de entrenamiento LoRA para TRELLIS.2: sirve como referencia reproducible (rank, alpha, targets, hiperparámetros y dataset publicados) para quien quiera especializar el flujo de estructura dispersa en otro dominio.
- Generación de activos 3D de una categoría concreta: dado un conjunto de imágenes de referencia de AR-15, el adaptador permite obtener geometrías coherentes con esa forma sin reentrenar el modelo base.
- Pruebas de concepto en pipelines image-to-3D: integración en prototipos que usen TRELLIS.2 para evaluar el efecto de un LoRA de dominio sobre la calidad geométrica.
- Investigación sobre especialización de DiT de flujo: el adaptador permite estudiar cómo cambia la distribución generada al ajustar solo atención y MLP con rango 8.
- Docencia y experimentación con PEFT en modelos 3D: ejemplo mínimo de inyección y carga de adaptadores en un pipeline de generación 3D.
- Evaluación comparativa de checkpoints intermedios: al publicarse checkpoints cada 500 pasos, permite analizar la evolución del ajuste a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador aislado; depende del modelo base `microsoft/TRELLIS.2-4B` y del submodelo `ss_flow_img_dit_1_3B_64_bf16` en bf16.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador LoRA en sí es pequeño (rango 8), pero requiere cargar el modelo base.
- Opciones de despliegue: carga mediante `peft` (`inject_adapter_in_model`, `set_peft_model_state_dict`) sobre el pipeline de TRELLIS.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline image-to-3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| txqz/AR-15-lora | LoRA sobre TRELLIS.2 (image-to-3D) | rango 8, alpha 16 | no disponible | no disponible | Hugging Face, 0 descargas |
| microsoft/TRELLIS.2-4B | Modelo base image-to-3D | 4B (según nombre) | no disponible | no disponible en la información | Hugging Face |
| Otros LoRA de TRELLIS.2 | Adaptadores PEFT | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización muy estrecha: el adaptador está entrenado exclusivamente sobre un dataset de AR-15, por lo que puede degradar la generación de otras categorías de objetos.
- Licencia no declarada: no se especifica la licencia del adaptador ni la del modelo base en la información disponible, lo que impide confirmar el uso comercial.
- Sin benchmarks ni demos: no hay evidencia publicada de calidad geométrica, fidelidad a la imagen de entrada ni métricas de evaluación.
- Sin datos de sesgo: no se documentan sesgos, pero la especialización en un objeto concreto (un arma) puede ser problemática en contextos de moderación de contenido.
- Dependencia del modelo base: requiere `microsoft/TRELLIS.2-4B` y el submodelo `ss_flow_img_dit_1_3B_64_bf16`; cualquier cambio en el pipeline base puede romper la compatibilidad.
- Riesgo de sobreajuste: 1500 pasos a batch efectivo 4 sobre un único dataset pueden producir sobreajuste al dominio; se recomienda evaluar los checkpoints intermedios (500, 1000, 1500).
- Sin información sobre idiomas ni contexto: irrelevante para la tarea, pero limita cualquier uso fuera de image-to-3D.
- Advertencia de contenido: la generación de representaciones 3D de armas puede estar sujeta a restricciones legales o de política de uso en determinadas jurisdicciones y plataformas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/txqz/AR-15-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/txqz/AR-15-trellis2
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
