# WijewardhanaNT/xnli_stage2_ur_10000

## Resumen

WijewardhanaNT/xnli_stage2_ur_10000 es un adaptador LoRA (PEFT) entrenado sobre Llama 2 7B de Meta, publicado en HuggingFace por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que deben cargarse sobre el modelo base meta-llama/Llama-2-7b-hf para funcionar. El nombre del repositorio sugiere que se trata de un ajuste fino en una segunda etapa ("stage2") sobre datos relacionados con XNLI (dataset de inferencia de lenguaje natural multilingue) para el idioma urdu (ur), con 10000 ejemplos, aunque el autor no ha documentado ninguno de estos detalles en la model card.

La model card es practicamente una plantilla vacia: la mayoria de campos ("More Information Needed") no estan rellenados, no hay licencia declarada, ni datos de entrenamiento, ni resultados de evaluacion, ni instrucciones de uso. Esto limita severamente la evaluacion del modelo y su idoneidad para produccion. Ademas, el repositorio tiene 0 descargas y 0 likes registrados, lo que indica que no existe comunidad ni validacion externa.

Su relevancia es marginal como artefacto aislado: puede ser util como referencia de experimentos de adaptacion de Llama 2 al urdu mediante LoRA, pero sin documentacion ni benchmarks no es posible verificar su rendimiento. Cualquier uso requeriria evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Llama 2) |
| Parametros totales | 7B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la de Llama 2 7B base es 4096 tokens, no confirmada para este adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere urdu, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT, ~0.5 GB de repo) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria PEFT (version 0.21.0 segun la model card) sobre meta-llama/Llama-2-7b-hf, el modelo base de Llama 2 con 7000 millones de parametros en arquitectura transformer decoder. LoRA inyecta matrices de bajo rango en las capas de atencion (tipicamente) del modelo congelado, de modo que el adaptador pesa mucho menos que el modelo completo; el tamano del repositorio (~0.5 GB) es coherente con esto, aunque el rank LoRA, los modulos objetivo y el alpha no estan documentados.

Sobre el entrenamiento no hay informacion verificable: la model card no especifica datos, hiperparametros, regimen de precision ni duracion. El nombre del repositorio ("xnli_stage2_ur_10000") sugiere un esquema de entrenamiento en dos etapas usando el dataset XNLI con 10000 ejemplos en urdu, pero esto es una inferencia del nombre y no un dato confirmado por el autor. Tampoco hay informacion sobre si se aplico RLHF, DPO o cualquier alineacion posterior.

## Capacidades

- Generacion de texto: heredada del modelo base Llama 2 7B, con el adaptador cargado.
- Posible mejora en inferencia de lenguaje natural (NLI) en urdu, inferida del nombre del repositorio; no verificada.
- No hay documentacion sobre tool calling, function calling ni capacidades de agentes.
- No hay documentacion sobre capacidades multilingues especificas del adaptador.
- No hay modos especiales (thinking, vision, audio) documentados.

## Casos de uso

- Investigacion en adaptacion eficiente de LLMs: el adaptador puede estudiarse como caso de fine-tuning LoRA de Llama 2 sobre datos XNLI en urdu, comparando ranks y tamaños de dataset.
- Clasificacion de inferencia en urdu: si el entrenamiento fue efectivo, podria usarse para determinar relaciones de entailment/contradiction/neutral entre pares de premisas e hipotesis en urdu, previa validacion propia.
- Punto de partida para fine-tuning adicional: los pesos pueden servir como checkpoint inicial para continuar el ajuste en tareas de urdu con mas datos.
- Experimentacion con PEFT: util para probar flujos de carga de adaptadores con transformers + peft sobre Llama 2.
- Evaluacion comparativa de LoRA vs full fine-tuning: permite contrastar la eficiencia de adaptacion con parametros reducidos en lenguas de bajos recursos.
- Prototipado academico en lenguas de bajos recursos: sirve como ejemplo de pipeline para adaptar modelos base a idiomas como el urdu con presupuestos de computo reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 2 7B en fp16 requiere aproximadamente 14 GB de VRAM; con el adaptador LoRA cargado el consumo adicional es minimo (el adaptador ocupa ~0.5 GB en disco). No hay cifras oficiales.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o A100 (40/80 GB) es suficiente para inferencia del modelo base en fp16; con cuantizacion 4-bit (no documentada para este adaptador) podria caber en GPUs de 8-12 GB.
- Consumer GPU: en principio cabe en una RTX 3090 o 4090 en fp16; en GPUs de 8 GB requeriria cuantizacion del modelo base, sin garantias de compatibilidad documentadas.
- Despliegue: al ser un adaptador PEFT, se carga con transformers + peft ( metodo `PeftModel.from_pretrained`); la inferencia con vLLM, llama.cpp u Ollama no esta documentada y puede requerir fusionar el adaptador en el modelo base (`merge_and_unload`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| WijewardhanaNT/xnli_stage2_ur_10000 | Adaptador LoRA sobre Llama 2 7B | 7B (base) | no disponible | no disponible |
| meta-llama/Llama-2-7b-hf | Modelo base | 7B | 4096 | Llama 2 Community License |
| NousResearch/Llama-2-7b-hf (espejo) | Modelo base sin gating | 7B | 4096 | Llama 2 Community License |

No existen alternativas publicas documentadas del mismo experimento (LoRA sobre XNLI en urdu) para comparar rendimiento; la comparacion se limita al modelo base. En cuanto a adaptacion al urdu, existen otros proyectos comunitarios de fine-tuning de Llama 2 para lenguas de bajos recursos, pero no hay datos publicados de este repositorio para contrastar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Hereda los sesgos del modelo base Llama 2 (datos web mayoritariamente en ingles, sesgos sociales y de representacion documentados por Meta).
- Riesgo de alucinacion: alto y no evaluado; al ser un adaptador sin documentacion ni benchmarks, el comportamiento generativo es impredecible.
- Limitaciones de idioma: el supuesto soporte de urdu no esta verificado; el modelo base Llama 2 tiene rendimiento degradado en lenguas no inglesas.
- Restricciones de licencia: la licencia no esta declarada. El modelo base Llama 2 esta bajo la Llama 2 Community License, que impone restricciones (limite de 700 millones de usuarios mensuales, aceptacion de la politica de uso aceptable); cualquier uso debe cumplir ambas condiciones.
- Caveats de produccion: 0 descargas, sin comunidad, sin evaluacion, sin documentacion de hiperparametros ni de datos; no apto para produccion sin validacion exhaustiva propia. La model card esta sin rellenar casi por completo, lo que impide auditar el entrenamiento.
- El adaptador solo funciona cargandolo sobre el modelo base exacto (meta-llama/Llama-2-7b-hf); no es un modelo standalone.

## Enlaces

- HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_stage2_ur_10000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en tags (XNLI, arXiv): https://arxiv.org/abs/1910.09700 (nota: este arXiv corresponde al paper de calculo de impacto de carbono citado en la model card, no a XNLI)
- No hay paper, repositorio de codigo ni demo adicionales publicados por el autor.
