# Xirui1208/readall-readtwice-14b-stage2-localstep15-globalstep30-20260926

## Resumen

El modelo identificado como `Xirui1208/readall-readtwice-14b-stage2-localstep15-globalstep30-20260926` es un ajuste fino por aprendizaje por refuerzo (RL) de tipo ReadAll sobre una base Qwen2.5-14B, publicado por el usuario Xirui1208. Se trata de un checkpoint intermedio de un entrenamiento de RL de parámetros completos orientado a una tarea muy concreta: responder preguntas sobre documentos largos siguiendo el protocolo ReadTwice (SKIM, actualización secuencial de memoria completa y FINAL). El modelo resuelve el problema de la lectura y razonamiento sobre documentos que exceden la ventana de contexto mediante troceado sin pérdida en secciones de 5.000 tokens procesadas en serie con memoria acotada.

Técnicamente es un transformer decoder-only de la familia Qwen2/Qwen2.5 con 14.770.033.664 parámetros (579 tensores) exportado en BF16, con una ventana de contexto nativa de 32.768 tokens y presupuestos de generación de 512/1024/1024 tokens para las fases SKIM/UPDATE/FINAL. El repositorio contiene además el checkpoint exacto de entrenamiento en FP32 con estado FSDP de cuatro rangos, optimizador Adam, scheduler y estados de RNG, lo que lo convierte en material relevante para investigación en RL reproducible más que en un modelo listo para producción.

Su relevancia actual es doble: por un lado, documenta una receta de RL con PPO sobre tareas de lectura de documentos largos con pesos de fase asimétricos (0,10/0,45/0,45); por otro, es un ejemplo de checkpoint inmutable publicado a mitad de un plan de entrenamiento (60 de 960 actualizaciones de optimizador completadas, paso local 15 de 40 pasos externos previstos). El autor advierte explícitamente de que este checkpoint no ha sido evaluado con benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2/Qwen2.5), 579 tensores de parámetros |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Longitud de contexto | 32.768 tokens nativos; documentos troceados en secciones de 5.000 tokens procesadas en serie |
| Tipos de cuantización | no disponible; solo se publican pesos BF16 en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, export de inferencia) y checkpoint de entrenamiento FSDP FP32 en `training_checkpoint/` |
| Tamaño del repositorio | 206,8 GB |
| Modelo base | Xirui1208/readall-readtwice-14b-rl-step15-20260925 (revisión `ebdc012fadb9a18eb74cc8adb5822b4bc42c7d66`) |
| Dataset de entrenamiento | Xirui1208/readtwice-docqa-hqa-rl-2560-20260925 (revisión `fcd8d755f07710413b58665c2445290ede092e17`) |
| Pipeline declarado | text-generation |
| Biblioteca | transformers |
| Entorno de runtime | Python 3.12, PyTorch 2.6.0+cu124, Transformers 4.50.3, vLLM 0.8.2, Ray 2.55.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B, un transformer decoder-only denso (no MoE) con atención por consultas agrupadas, exportado a BF16 en 579 tensores. Sobre esa base, el autor aplica un entrenamiento de RL de parámetros completos con PPO: ratio de aprendizaje 1e-6 con schedule constante, AdamW con weight decay 0,01, grad clip 1, PPO clip 0,2 y coeficiente KL 0,001 respecto al SFT inicial A230. La innovación metodológica principal no está en la arquitectura sino en el protocolo de inferencia y en el diseño de la recompensa por fases: los pesos de las fases SKIM, UPDATE y FINAL son 0,10, 0,45 y 0,45 respectivamente, lo que concentra la señal de recompensa en la construcción de memoria y en la respuesta final.

El esquema de datos consiste en 64 preguntas brutas por paso externo, con 8 trayectorias independientes por pregunta y 4 actualizaciones de optimizador sobre 16 preguntas cada una. El filtrado de grupo en línea está desactivado por decisión del usuario: los grupos con todas las respuestas correctas o todas incorrectas se mantienen, su ventaja centrada es cero y solo actúa el término KL. Este checkpoint acumula 60 actualizaciones de optimizador y 960 preguntas de entrenamiento de un plan total de 2.560 preguntas y 40 pasos externos. El cursor guardado es 960 y el siguiente paso externo local es 16. El entrenamiento se ejecutó sobre 4 GPU con offload de parámetros y optimizador a CPU. El protocolo ReadTwice completo (SKIM, UPDATE secuencial de memoria completa y FINAL) está incluido en `training_code.tar.gz`; una llamada directa de un solo prompt no reproduce el flujo de trabajo declarado.

## Capacidades

- Generación de texto conversacional en inglés sobre la base Qwen2.5-14B.
- Preguntas y respuestas sobre documentos largos mediante el protocolo ReadTwice de tres fases (SKIM, UPDATE de memoria, FINAL).
- Procesamiento de documentos que exceden la ventana nativa mediante troceado sin pérdida en secciones de 5.000 tokens y procesamiento serie con memoria acotada.
- Razonamiento multi-paso sobre el contenido documental, con construcción incremental de una memoria completa antes de responder.
- Ajuste por RL específico para QA documental, con recompensa ponderada por fase.
- Reanudación exacta del entrenamiento desde el checkpoint FP32, incluidos optimizador, scheduler y estados de RNG.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito tipo "thinking": no documentado como tal, aunque el protocolo de tres fases cumple una función análoga.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés (`en`).

## Casos de uso

- QA sobre documentación técnica extensa: el modelo trocea el corpus en secciones de 5.000 tokens, construye una memoria acumulada mediante UPDATE y responde en la fase FINAL, lo que permite consultar manuales o especificaciones que superan los 32.768 tokens de contexto nativo.
- Análisis de contratos y expedientes legales en inglés: la fase SKIM permite localizar cláusulas relevantes y la fase UPDATE mantiene el estado de múltiples documentos relacionados antes de emitir una respuesta consolidada.
- Revisión de literatura científica: dado un conjunto de artículos largos, el protocolo serial permite extraer y comparar metodologías sin truncar el texto, algo que un prompt único no consigue.
- Auditoría de informes de incidentes y registros extensos: el modelo puede recorrer un informe de post-mortem completo y responder preguntas de causa raíz manteniendo memoria acotada en VRAM.
- Extracción de información estructurada de informes financieros o regulatorios en inglés: la memoria por fases reduce la pérdida de detalles en documentos de cientos de páginas.
- Asistente interno de base de conocimiento documental: indexación de un corpus fijo y consultas repetidas con el mismo protocolo de tres fases para atención interna en inglés.
- Investigación en RL reproducible: el repositorio incluye el checkpoint FSDP FP32, el estado del optimizador y los datos de orden, lo que permite reproducir exactamente la continuación del entrenamiento desde el cursor 960.
- Estudio comparativo de esquemas de recompensa por fases: los pesos 0,10/0,45/0,45 y la desactivación del filtrado de grupo permiten analizar el efecto del KL puro en grupos sin ventaja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que este checkpoint de paso local 15 no ha sido evaluado con benchmarks y que los resultados HQA previos correspondientes al paso local 10 pertenecen a un checkpoint distinto y no deben atribuirse a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 28-30 GB solo para los pesos de 14,77 B parámetros, más la caché KV. A 32.768 tokens, con 48 capas y 8 cabezas KV en BF16, la caché KV añade del orden de 6 GB (estimación), por lo que conviene reservar 36-40 GB para contexto completo.
- El troceado en secciones de 5.000 tokens reduce el pico de memoria al limitar la longitud efectiva por pasada, lo que permite operar con menos VRAM que una ventana completa de 32.768 tokens.
- GPU recomendadas: A100 80 GB o H100 80 GB para contexto completo sin cuantizar; A100 40 GB o L40S 48 GB con gestión cuidadosa de la caché KV.
- GPU de consumo: una RTX 4090 de 24 GB no aloja los pesos en BF16 sin cuantización adicional; no se publican versiones GGUF, AWQ o GPTQ, por lo que su uso en GPU de consumo requiere convertir y cuantizar los pesos por cuenta propia.
- Entrenamiento y continuación: el autor documenta un entorno de 4 GPU con offload de parámetros y optimizador a CPU, sobre Python 3.12, PyTorch 2.6.0+cu124, Transformers 4.50.3, vLLM 0.8.2 y Ray 2.55.1.
- Opciones de despliegue: Transformers (carga directa con `AutoModelForCausalLM`), vLLM 0.8.2 y TGI (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints alojados). llama.cpp y Ollama no están soportados de serie al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de conocimiento general sobre la familia Qwen2.5 y no se han verificado dentro de la información proporcionada; deben comprobarse en sus model cards oficiales.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ReadAll stage-2, local step15) | 14,77 B | 32.768 tokens | QA documental largo con protocolo ReadTwice (RL) | no disponible | HuggingFace, 0 descargas |
| Xirui1208/readall-readtwice-14b-rl-step15-20260925 | 14,77 B (misma base) | 32.768 tokens | Checkpoint padre de RL ReadAll | no disponible | HuggingFace (modelo base declarado) |
| Qwen2.5-14B-Instruct | ~14,7 B | 32.768 tokens | Instrucciones generales, multilingüe | Apache 2.0 (según su model card pública) | Ampliamente disponible |
| Qwen2.5-14B (base) | ~14,7 B | 32.768 tokens | Modelo base sin ajuste de instrucciones | Apache 2.0 (según su model card pública) | Ampliamente disponible |

Comparativa de rendimiento directa: no disponible, ya que este checkpoint no ha sido evaluado con benchmarks y no se han publicado métricas comparables con las alternativas.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene tratar el modelo como no apto para producción hasta que el autor la especifique.
- Checkpoint no evaluado: el autor declara que este paso local 15 no ha pasado benchmarks, por lo que no hay evidencia cuantitativa de su calidad.
- Checkpoint intermedio: solo se completaron 60 actualizaciones de optimizador de un plan de 40 pasos externos; el modelo no representa el resultado final del entrenamiento.
- Riesgo de alucinación: al ser un ajuste de RL sobre QA documental, puede generar respuestas plausibles no sustentadas en el documento, especialmente en la fase FINAL si la memoria construida en UPDATE es incompleta.
- Dependencia del protocolo: una llamada directa de un solo prompt no reproduce el flujo ReadTwice; usar el modelo fuera de su protocolo invalida las expectativas de rendimiento declaradas.
- Idioma único: solo se declara inglés (`en`), por lo que su uso en castellano u otros idiomas no está soportado ni validado.
- Sesgos: no documentados en la información disponible; hereda los sesgos del modelo base Qwen2.5-14B y del dataset DocQA + HQA2560, cuya composición no se detalla.
- Restricciones de formato: no se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión.
- Tamaño del repositorio: 206,8 GB, lo que implica costes de almacenamiento y descarga considerables; el checkpoint FP32 de entrenamiento es la mayor parte de ese volumen.
- Reproducción del entrenamiento: exige preservar el orden de mezcla guardado y los cuatro estados de rango, además de reajustar las rutas del config y del driver en una máquina nueva; solo debe publicarse `checkpoints/latest.json` tras verificar todos los shards contra `checksums.json`.
- Procedencia de los datos: el dataset de recompensa es específico del autor y no se documenta su proceso de generación ni posibles contaminaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xirui1208/readall-readtwice-14b-stage2-localstep15-globalstep30-20260926
- Modelo base (ReadAll14B step15): https://huggingface.co/Xirui1208/readall-readtwice-14b-rl-step15-20260925 (revisión `ebdc012fadb9a18eb74cc8adb5822b4bc42c7d66`)
- Dataset DocQA + HQA2560: https://huggingface.co/datasets/Xirui1208/readtwice-docqa-hqa-rl-2560-20260925 (revisión `fcd8d755f07710413b58665c2445290ede092e17`)
- Código de entrenamiento, protocolo ReadTwice y recompensas: `training_code.tar.gz` dentro del repositorio
- Configuración completa del entrenamiento: `training_config.yaml` dentro del repositorio
- Verificación de integridad: `checksums.json` dentro del repositorio
- Paper o publicación técnica del método ReadTwice: no disponible
- Demo o espacio asociado: no disponible
