# zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder es un artefacto de inferencia publicado por zen-E, derivado del modelo base Qwen/Qwen3.5-4B mediante un procedimiento de entrenamiento GRPO completo (FullGRPO) sobre el dataset zen-E/PLatour-DeepCoder-Data. Forma parte del proyecto de investigacion PLatour, descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976), que explora la transferencia entre modelos de distinto tamano (PACT): un modelo emisor de mayor capacidad codifica el prompt y un receptor mas pequeno genera la respuesta de forma independiente.

Este checkpoint concreto es el receptor de texto completo ("Full text receiver"), exportado en formato estandar de Transformers con pesos safetensors BF16, tokenizer y configuracion incluidos, sin encoder de vision. Tiene 4.841.450.496 parametros reales (segun los safetensors del repositorio) y un tamano de repo de 9,7 GB. La arquitectura declarada en los tags es `qwen3_5_text`, lo que indica una variante de texto del linaje Qwen3.5.

Su relevancia es principalmente metodologica: el propio autor advierte que se trata de artefactos historicos de inferencia sin puntuaciones de benchmark publicadas, y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion imparcial. Por tanto, debe tratarse como material de investigacion reproducible (con el codigo del proyecto y el juez de codigo asociado), no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de texto (tag `qwen3_5_text`), linaje Qwen3.5; soporta atencion hibrida segun el paper PACT |
| Parametros totales | 4.841.450.496 (4,84 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el campo de idiomas del repo no esta cumplimentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo es un receptor de texto completo en formato estandar de Transformers, con embeddings de entrada y cabeza de salida independientes que preservan los tensores BF16 originales. Deriva de Qwen/Qwen3.5-4B y ha sido afinado mediante GRPO completo (FullGRPO) sobre el dataset zen-E/PLatour-DeepCoder-Data, orientado a tareas de generacion de codigo. El marco PLatour entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y admitiendo modelos con atencion hibrida.

El paper asociado introduce ademas PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras dependen de informacion util del emisor o si surgen simplemente de la adaptacion del receptor. El autor subraya que un mejor rendimiento de tarea por si solo no demuestra una comunicacion cross-model efectiva. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles de RLHF/DPO mas alla del uso de GRPO.

## Capacidades

- Generacion de texto conversacional en formato chat (uso de `apply_chat_template`).
- Generacion de codigo, con enfasis declarado en tareas de programacion (DeepCoder).
- Razonamiento multi-paso orientado a resolucion de problemas de codigo.
- Evaluacion reproducible contra benchmarks de codigo (LCB v6, HumanEval, MBPP) mediante el juez de codigo del proyecto.
- Integracion como receptor en el pipeline PACT con un emisor de mayor capacidad (opcional, requiere el codigo del proyecto).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades multimodales (vision/audio): no disponibles; el paquete no incluye encoder de vision.
- Cobertura multilingue: no disponible.

## Casos de uso

- Generacion de funciones y utilidades de codigo: el modelo produce fragmentos Python a partir de instrucciones en formato chat, como ilustra el ejemplo oficial (`sum` de dos enteros), adecuado para prototipado rapido de snippets.
- Reproduccion de experimentos PACT: sirve como receptor congelado o afinado en el pipeline PLatour para estudiar transferencia cross-model con el emisor configurado, usando `platour-exps evaluate --experiment 29`.
- Investigacion sobre GRPO en modelos pequenos: al ser un checkpoint FullGRPO sobre 4,84B, permite analizar el efecto del entrenamiento por recompensa en tareas de codigo con recursos moderados.
- Evaluacion controlada con PACT-Check: util para ejecutar los controles Dummy/Irrelevant Transfer y Self-Communication y comprobar si las ganancias provienen del emisor o del propio receptor.
- Banco de pruebas de generacion de codigo con juez Docker: el proyecto ejecuta los programas generados en contenedores aislados contra LCB v6, HumanEval y MBPP, lo que permite validar correccion funcional de forma reproducible.
- Fine-tuning posterior en dominio de codigo: partir de este receptor (Apache 2.0) para adaptarlo a un lenguaje o estilo de codigo concreto, aprovechando que los pesos estan en safetensors BF16 estandar.
- Docencia y demos de inferencia local: con 4,84B parametros y BF16, se puede servir en una GPU unica para demostraciones de generacion de codigo en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que se trata de artefactos historicos de inferencia sin puntuaciones de benchmark, y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion imparcial. El proyecto permite ejecutar la evaluacion (LCB v6, HumanEval, MBPP) con el comando `platour-exps evaluate --experiment 29`, pero los resultados no se recogen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,7 GB solo para pesos (4,84B x 2 bytes), mas overhead de activaciones y KV cache; en la practica se recomienda 12-16 GB de VRAM para contexto moderado.
- Cuantizacion: no se publican pesos cuantizados; habria que generarlos (por ejemplo GGUF/AWQ) a partir de los safetensors BF16.
- GPU recomendadas: A100, H100 o L40S para despliegue estandar; RTX 4090 (24 GB) es suficiente para BF16 con margen.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas (RTX 4080/4090, RTX 4060 Ti 16 GB), con posible limitacion de contexto.
- Opciones de despliegue: Transformers (ruta documentada); el proyecto PLatour admite colocacion multi-GPU con `--n-gpu` y `--gpus-per-replica` (por defecto 1 GPU por replica). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion.
- Latencia y throughput: no disponibles. El proyecto permite replicas independientes en 8 GPUs con shards disjuntos de preguntas para evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder | 4,84B | no disponible | Receptor PACT afinado con FullGRPO para codigo | Apache 2.0 | Hugging Face (775 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo base generalista de texto | no disponible en la informacion | Hugging Face |
| Alternativas de codigo de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo; la comparativa con el modelo base se limita a la relacion de derivacion declarada. No se identifican en la informacion otros modelos de la misma categoria con metricas publicadas para contrastar.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: el autor advierte que no hay puntuaciones y que el empaquetado no garantiza una evaluacion imparcial; no debe citarse como evidencia de rendimiento superior.
- Artefacto de investigacion: pensado para reproducir experimentos PLatour, no como modelo de produccion; requiere el entorno del proyecto (Linux, CUDA, Python 3.11, Docker y juez de codigo) para evaluacion.
- Riesgo de alucinacion: como modelo generativo de codigo, puede producir funciones sintacticamente validas pero incorrectas; la evaluacion oficial exige ejecucion en contenedores aislados.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al derivar de Qwen3.5-4B, hereda las caracteristicas del base, no detalladas aqui.
- Idiomas: el campo de idiomas no esta cumplimentado; no se garantiza cobertura multilingue.
- Contexto: la longitud de contexto no esta declarada; no debe asumirse una ventana concreta.
- Sin capacidades multimodales: no incluye encoder de vision ni audio.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda evaluacion independiente y reporte de procedencia antes de emitir afirmaciones comparativas.
- Dependencia del juez para metricas: la correccion de codigo solo se verifica con el juez Docker configurado (`JUDGE_ROOT`, `LCB_CHECKER`, `JUDGE_IMAGE`, `PYTHONPATH`); sin el, solo se obtiene generacion de texto.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
