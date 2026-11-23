# SusanHill/zils-flash-at1

## Resumen

zils-flash-at1 es un ajuste fino supervisado del modelo base Qwen/Qwen3.5-9B, publicado por el usuario SusanHill bajo licencia Apache 2.0. El modelo se presenta como una destilación de conocimiento del profesor cerrado "TypeSafe Jev 1.13" hacia un estudiante de aproximadamente 8.950 millones de parametros, con el objetivo de producir decisiones tipadas (noul, choice y score) con probabilidades calibradas en lugar de generacion de texto libre. La model card del autor lo etiqueta como parte de la familia "JEV" (autotrust/JEV-9B), un modelo que combina una via "System 1" de decisiones rapidas y calibradas con una via "System 2" de generacion y razonamiento heredada del Qwen3.5-9B original.

El interes tecnico reside en su enfoque dual: un cabezal de decision (adapter LoRA mas cabezal tipado) para clasificacion calibrada y un lm_head intacto del modelo base para generacion autoregresiva. Segun los datos declarados por el autor, la destilacion alcanza una divergencia KL media de 0,021 frente al profesor y un AUROC de 0,996 en la tarea noul, con un ECE de 0,0007 tras aplicar temperatura. Ademas, el modelo declara capacidades multimodales (vision, computer-use y robotica) anadidas en una actualizacion posterior.

La relevancia actual es doble: por un lado, ofrece una alternativa abierta a un modelo propietario de decision calibrada; por otro, demuestra que un ajuste LoRA sobre un LLM de 9B puede servir como juez visual rapido (unos 0,2 s por decision en una GPU) para tareas de agente y robotica. No obstante, la informacion disponible es escasa: cero descargas, cero likes, y la model card mezcla contenido del modelo hermano JEV-9B, por lo que muchos detalles deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B) con cabezal dual: adapter LoRA de decision tipada + lm_head del modelo base; el autor lo describe con el enfoque "Blocks of Experts" |
| Parametros totales | 8.953.803.264 (segun safetensors) |
| Parametros activos | no disponible (no se declara como MoE; "Blocks of Experts" es el nombre del metodo, no una arquitectura MoE verificada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona despliegue con vLLM, sin detallar cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B como base y anade un ajuste fino con adapter LoRA orientado a producir "decisiones tipadas": tres salidas estructuradas denominadas noul (probabilidad binaria), choice (distribucion sobre opciones) y score (valor esperado en escala 0-5). El autor describe el metodo como "Blocks of Experts", una receta propia de AutoTrust que combina una via System 1 (decision rapida y calibrada) con una via System 2 (generacion y razonamiento del Qwen3.5-9B sin modificar). El enrutado entre ambas vias se hace por peticion sobre el mismo conjunto de pesos y el mismo motor vLLM.

El entrenamiento es una destilacion de conocimiento desde el profesor cerrado "TypeSafe Jev 1.13" sobre el corpus SargeDev/jev-distill-corpus-v3. Segun la model card, 25.376 de las 29.955 filas objetivo del conjunto de test corresponden a distribuciones del profesor. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla la configuracion del LoRA (rango, alpha, modulos objetivo). La calibracion se ajusta con temperatura y se evalua con ECE de 15 bins.

## Capacidades

- Decision tipada calibrada: salidas noul (probabilidad), choice (distribucion sobre opciones) y score (esperanza en escala 0-5) en un solo paso hacia delante.
- Generacion de texto autoregresiva a traves de la via System 2 con el lm_head original del Qwen3.5-9B.
- Generacion de codigo: el autor reporta pass@1 de 0,707 en HumanEval con prompt estilo completion y decodificacion greedy.
- Vision: el autor declara que el modelo acepta imagenes y actua como juez visual (VL-RewardBench 74,3%).
- Computer use: seleccion del siguiente elemento a clicar a partir de capturas de pantalla con cajas numeradas.
- Robotica: juicio visual para control de brazo robotico (decidir izquierda/derecha y arriba/abajo del objetivo).
- Multilingue: limitado a ingles segun la etiqueta de idioma.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: el autor demuestra bucles de agente en computer use (3-7 clics por tarea), pero no se documenta un protocolo de agentes estandar.
- Modo thinking explicito: no disponible.

## Casos de uso

- Clasificacion calibrada en produccion: usar la via System 1 para asignar probabilidades a decisiones binarias o multiopcion con ECE bajo (0,0007 declarado), adecuado para sistemas donde la probabilidad debe ser interpretable y no solo la etiqueta.
- Enrutado y ranking de contenido: el autor demuestra un caso de recomendacion y busqueda en news.guru.so donde cada ranking es una decision System 1 en aproximadamente medio segundo; replicable para reordenar resultados de busqueda o feeds.
- Juez visual para pipelines de RL o evaluacion: con VL-RewardBench 74,3% y AgentRewardBench AUROC 0,91 declarados, puede usarse como reward model o evaluador automatico de trayectorias de agente.
- Automatizacion de navegador (computer use): bucle captura de pantalla → eleccion de elemento → clic, con aproximadamente 0,2 s por clic; el autor reporta 95% de exito en 60 tareas multi-paso de compra, ajustes y correo.
- Control de robotica de pick-and-place: juicio visual por paso (izquierda/derecha, arriba/abajo) con unos 165 ms por decision en simulacion MuJoCo; el autor reporta 10 exitos en 20 escenas aleatorias.
- Asistente de codigo con via dual: usar System 2 para generar codigo (pass@1 0,707 en HumanEval) y System 1 para decidir entre alternativas o puntuar candidatos en un pipeline de CI/CD.
- Moderacion o triaje con umbral calibrado: aprovechar la salida noul (probabilidad) para fijar umbrales operativos con garantias de calibracion, en lugar de depender de heuristicas sobre logits.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| Decisiones tipadas (test_set_30k) | KL media (target ‖ modelo), todas las filas | 0,021 |
| Decisiones tipadas (test_set_30k) | AUROC noul | 0,996 |
| Decisiones tipadas (test_set_30k) | Brier noul | 0,0015 |
| Decisiones tipadas (test_set_30k) | MAE del valor esperado de score (escala 0-5) | 0,103 |
| Decisiones tipadas (test_set_30k) | ECE (15 bins, tras temperatura) | 0,0007 |
| Decisiones tipadas (test_set_30k) | Acierto top-1 de choice (todas las filas) | 0,898 |
| Decisiones tipadas (test_set_30k) | Acierto top-1 de choice (filas decisivas, gap top-2 ≥ 0,1) | 0,954 |
| HumanEval (test) | pass@1 (greedy, completion-style) | 0,707 |

Datos adicionales citados en la model card (no incluidos en el model-index): VL-RewardBench 74,3%, AgentRewardBench AUROC 0,91, AUC 0,72 en recomendacion zero-shot de video corto a partir de portadas. No se han publicado resultados de benchmarks verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para 8.950 millones de parametros, en FP16 se requieren aproximadamente 18 GB de pesos mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones genericas, no confirmadas por el autor).
- GPU recomendadas: el autor menciona despliegue con vLLM y tiempos de aproximadamente 0,2 s por decision en una GPU, sin especificar modelo. Para FP16 encajan A100 40/80 GB, H100 y L40S; para consumer, RTX 4090 (24 GB) seria suficiente en FP16 ajustado o en 8 bits.
- Cabe en consumer GPU: probable en RTX 4090 con FP16 o cuantizacion, y en RTX 3090/4080 con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: vLLM (mencionado explicitamente por el autor, con `bash vl/serve.sh` para la via visual); transformers como libreria declarada. llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: aproximadamente 0,2 s por decision visual y aproximadamente 165 ms por decision en robotica segun el autor; no se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-flash-at1 | 8,95B | no disponible | Destilacion de decisiones tipadas + generacion | apache-2.0 | Hugging Face, 0 descargas |
| autotrust/JEV-9B | no disponible | no disponible | System 1 + System 2, receta Blocks of Experts | no disponible en la informacion | Hugging Face (modelo hermano citado por el autor) |
| autotrust/JEV-27B | no disponible | no disponible | Sucesor de la familia, mejor transferencia y System 2 | no disponible en la informacion | Hugging Face (citado por el autor) |
| Qwen/Qwen3.5-9B | ~9B | no disponible | LLM generativo base | no disponible en la informacion | Hugging Face (modelo base) |

No se dispone de datos de benchmarks comparables de terceros para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion muy escasa y no verificada: cero descargas y cero likes en el momento de la consulta; todos los benchmarks son declarados por el autor y no estan verificados de forma independiente.
- La model card mezcla contenido del modelo hermano autotrust/JEV-9B (videos, demos, cifras de robotica y computer use), por lo que no esta claro que todas esas capacidades correspondan a zils-flash-at1.
- Idioma limitado al ingles; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones o documentos largos.
- Riesgo de alucinacion en la via System 2, inherente al modelo base generativo; la via System 1 esta disenada para reducir este riesgo en tareas de decision, pero no en generacion.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene revisar.
- Para produccion: la calibracion (ECE, Brier) puede degradarse fuera de la distribucion del corpus de destilacion; se recomienda recalibrar con datos propios.
- No se documenta soporte de tool calling estandar ni de protocolos de agentes, lo que limita su integracion en frameworks convencionales.
- El autor advierte que el modelo es "un juez visual rapido, no un controlador end-to-end" para robotica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-flash-at1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo hermano citado por el autor: https://huggingface.co/autotrust/JEV-9B
- Sucesor citado por el autor: https://huggingface.co/autotrust/JEV-27B
- Demo en vivo citada en la model card: https://news.guru.so/ui
- Repositorio de demos visuales citado: `vl/demos/` (ruta dentro del repositorio del modelo)
- Informes visuales citados: `reports/vl/` (ruta dentro del repositorio del modelo)
