# zarifbinakhtar/custom-GNN-LLM-VLM_drone_telemetry_hf_baseline

## Resumen

El repositorio `zarifbinakhtar/custom-GNN-LLM-VLM_drone_telemetry_hf_baseline` no es un modelo entrenado al uso, sino un banco de pruebas reproducible (benchmark) y una base de post-entrenamiento para el diagnostico de ventanas de grafos de telemetria de vuelo de drones. El autor, zarifbinakhtar, lo publica como baseline de investigacion para evaluar de forma comparable arquitecturas que combinan redes neuronales de grafos (GNN) con modelos de lenguaje (LLM) y modelos vision-lenguaje (VLM). El repositorio tiene 0 GB y no contiene pesos publicados, solo el material de evaluacion y los scripts.

El trabajo se apoya en dos backbones de Qwen: `Qwen/Qwen2.5-7B-Instruct` (texto) y `Qwen/Qwen2.5-VL-7B-Instruct` (vision-lenguaje), ambos de 7 mil millones de parametros. La propuesta tecnica es inyectar representaciones de grafos de telemetria como soft tokens en el espacio de embeddings del LLM y, en la variante VLM, renderizar las ventanas de grafo como imagenes para que el modelo visual las procese. El benchmark cubre regimenes de vuelo unico (`h1`-`h5`) y pares fusionados (`h1_h2`-`h1_h5`), con 63 muestras de entrenamiento y 22 de validacion.

Su relevancia actual reside en que documenta de forma transparente resultados negativos y problemas de fuga de informacion (leakage) en pipelines multimodales aplicados a diagnostico de series temporales con estructura de grafo, un area donde abundan las afirmaciones optimistas sin reproducibilidad. El repositorio incluye codigo de evaluacion, entrenamiento de proyectores, LoRA y aprendizaje continuo con replay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composicion GNN + LLM/VLM sobre backbones Qwen2.5 (transformer decoder-only) con inyeccion de soft tokens de grafo y renderizado visual de grafos |
| Parametros totales | 7B en los backbones (Qwen2.5-7B-Instruct y Qwen2.5-VL-7B-Instruct); el repositorio no publica pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (usada en el entorno de referencia) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.0 GB sin pesos publicados; scripts Python) |

## Arquitectura y entrenamiento

La arquitectura evaluada es una composicion de tres componentes: un codificador GNN que procesa ventanas de grafo de telemetria, un proyector que mapea las representaciones del grafo al espacio de embeddings del LLM, y un backbone Qwen2.5-7B-Instruct o Qwen2.5-VL-7B-Instruct. En la variante `gnn_soft_token_llm` los embeddings de grafo se inyectan como soft tokens; en `vlm_gnn_soft_tokens` las ventanas de grafo se renderizan como imagenes y se combinan con los soft tokens, aprovechando la torre visual del VLM. El benchmark incluye tres configuraciones zero-shot: `text_only_llm`, `gnn_soft_token_llm` y `vlm_gnn_soft_tokens`.

El entrenamiento documentado incluye dos modalidades de post-entrenamiento sobre 63 muestras: solo proyector (3 epocas, perdida de 0.1726 a 0.1179, 63 pasos validos por epoca, 0 NaNs) y LoRA con r=8 mas proyector (perdida de 0.5518 a 0.1500). Tambien se reporta aprendizaje continuo secuencial sobre `h1`-`h5` con y sin replay, donde el replay eleva la precision final del 85.33% al 92.00% y reduce el olvido catastrofico de +8.33 pp a -8.33 pp. No se especifican el volumen de tokens de entrenamiento del backbone ni la composicion del dataset original de Qwen.

## Capacidades

- Diagnostico de ventanas de grafo de telemetria de vuelo de drones en regimenes de vuelo unico y pares fusionados.
- Generacion de salidas estructuradas en JSON con validacion de esquema (100% de schema pass en todas las configuraciones evaluadas).
- Prediccion numerica de deltas con MAE reportado de 0.0002-0.0003 sobre `max_delta`.
- Procesamiento multimodal: la variante VLM acepta imagenes renderizadas de grafos ademas de tokens de texto.
- Inyeccion de representaciones de grafos como soft tokens en el espacio de embeddings del LLM.
- Post-entrenamiento eficiente mediante LoRA (r=8) y entrenamiento de proyector.
- Aprendizaje continuo secuencial con replay para mitigar olvido catastrofico.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Diagnostico automatizado de flotas de drones: el pipeline GNN+VLM puede clasificar el estado de un vuelo a partir de ventanas de telemetria renderizadas, generando un diagnostico estructurado en JSON apto para ingestion automatica en sistemas de mantenimiento.
- Monitorizacion de salud estructural en tiempo real: la variante `vlm_gnn_soft_tokens` procesa grafos de telemetria como imagenes, lo que permite reutilizar infraestructura de vision existente para detectar anomalias en sensores de vuelo.
- Investigacion en neurosimbolico aplicado a series temporales: el repositorio sirve como baseline reproducible para comparar inyeccion de soft tokens frente a enfoques puramente textuales o visuales.
- Evaluacion de robustez frente a leakage: el benchmark de blind-frame permite medir cuanto del rendimiento aparente proviene de etiquetas filtradas en los titulos de las imagenes, un control necesario en cualquier publicacion de diagnostico multimodal.
- Aprendizaje continuo en despliegues operativos: el esquema de replay sobre regimenes `h1`-`h5` es directamente aplicable a sistemas que reciben nuevos tipos de vuelo y necesitan actualizar el modelo sin reentrenar desde cero.
- Formacion y docencia: los scripts de evaluacion y post-entrenamiento (proyector, LoRA) constituyen un ejemplo didactico completo de pipeline GNN-LLM-VLM con metricas y ablaciones.
- Seleccion de arquitectura en prototipos: la comparativa three-way zero-shot permite decidir entre LLM textual, LLM con soft tokens y VLM con grafos renderizados segun precision y latencia (3913-7311 ms).

## Benchmarks y rendimiento

Resultados publicados en la model card (n_val = 22):

| Configuracion | Precision diagnostico (%) | MAE numerico (`max_delta`) | Schema pass (%) | Latencia media (ms) |
|---|---|---|---|---|
| `text_only_llm` | 0.00 | 0.0002 | 100.0 | 4765.43 |
| `gnn_soft_token_llm` | 0.00 | 0.0002 | 100.0 | 7311.04 |
| `vlm_gnn_soft_tokens` | 68.18 | 0.0002 | 100.0 | 3913.91 |

Ablacion blind-frame (sin etiquetas en los titulos de las imagenes) y post-entrenamiento:

| Configuracion | Precision blind (%) | Schema pass (%) | MAE |
|---|---|---|---|
| Zero-shot blind | 45.45 | 100.0 | 0.0002 |
| Proyector solo (3 epocas) | 45.45 | 100.0 | 0.0002 |
| LoRA r=8 + proyector (3 epocas) | 40.91 | 100.0 | 0.0003 |

Aprendizaje continuo secuencial `h1`-`h5`:

| Configuracion | Precision final (%) | Olvido (pp) |
|---|---|---|
| Sin replay | 85.33 | +8.33 |
| Con replay | 92.00 | -8.33 |

## Requisitos de hardware

- Entorno de referencia del autor: Intel Core Ultra 9 275HX, 32 GB de RAM y NVIDIA RTX 5070 Laptop GPU con cuantizacion 4-bit NF4.
- VRAM estimada para inferencia: aproximadamente 4-6 GB en 4-bit NF4 para un backbone de 7B; en FP16 serian necesarios unos 14-16 GB solo para los pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16 sin cuantizar; la RTX 5070 Laptop es suficiente en 4-bit segun el autor.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizacion 4-bit; en 16 GB o mas sin cuantizar.
- Opciones de despliegue: los scripts del repositorio usan Python con los backbones de Qwen; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia media reportada de 3913.91 ms (`vlm_gnn_soft_tokens`), 4765.43 ms (`text_only_llm`) y 7311.04 ms (`gnn_soft_token_llm`) sobre el hardware de referencia; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Este repositorio (GNN+Qwen2.5-7B/VL-7B) | 7B backbone | no disponible | GNN + soft tokens + VLM | MIT | No (repo de 0.0 GB, solo scripts) |
| Qwen2.5-7B-Instruct | 7B | 131072 tokens (segun documentacion publica de Qwen) | LLM texto | Apache 2.0 | Si, en Hugging Face |
| Qwen2.5-VL-7B-Instruct | 7B | 131072 tokens (segun documentacion publica de Qwen) | VLM | Apache 2.0 | Si, en Hugging Face |
| Alternativas GNN-LLM para telemetria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros pipelines GNN-LLM-VLM para telemetria de drones no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no publica pesos: es un baseline de evaluacion y scripts, no un modelo listo para desplegar.
- El conjunto de validacion es muy reducido (22 muestras) y el de entrenamiento tambien (63 muestras); cualquier metrica tiene alta varianza e intervalo de confianza amplio.
- El autor documenta leakage por titulos de frame: la precision zero-shot cae del 68.18% al 45.45% al eliminar etiquetas de los titulos, lo que invalida comparaciones ingenuas.
- El post-entrenamiento no mejora la precision blind (45.45% con proyector solo, 40.91% con LoRA) pese a reducir la perdida de entrenamiento, senal de sobreajuste o de que la senal aprendida no generaliza.
- Las configuraciones puramente textuales (`text_only_llm` y `gnn_soft_token_llm`) obtienen 0% de precision diagnostica en zero-shot, lo que sugiere que la tarea depende criticamente de la representacion visual.
- No se especifican idiomas soportados ni evaluacion multilingue.
- La licencia MIT del repositorio no cubre automaticamente los backbones Qwen subyacentes, que tienen sus propias licencias (Apache 2.0 en las versiones publicas citadas); verificar antes de uso comercial.
- No hay informacion sobre sesgos, alucinacion o robustez fuera del dominio de telemetria de drones.
- El benchmark esta disenado para diagnostico de grafos de vuelo; extrapolar su rendimiento a otras tareas no esta justificado por los datos publicados.

## Enlaces

- Hugging Face: https://huggingface.co/zarifbinakhtar/custom-GNN-LLM-VLM_drone_telemetry_hf_baseline
- Backbone texto: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Backbone vision-lenguaje: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Resultados de aprendizaje continuo citados en la model card: `results/continual_h1_h5.csv` (ruta dentro del repositorio)
- Scripts de evaluacion citados: `eval/build_benchmark`, `eval.run_3way_eval`, `vlm.train_post_train` (rutas dentro del repositorio)
