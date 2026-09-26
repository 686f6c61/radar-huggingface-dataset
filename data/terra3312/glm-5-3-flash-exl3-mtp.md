# Terra3312/GLM-5.3-Flash-EXL3-MTP

## Resumen

GLM-5.3-Flash-EXL3-MTP es un paquete de pesos listo para servir ("serving weights") publicado por el usuario Terra3312 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribución preparada para despliegue del checkpoint GLM-5.3-Flash cuantizado en EXL3 (ExLlamaV3) a 4,05 bits por peso, con los pesos de expertos y no-expertos restaurados a BF16 y la capa MTP (multi-token prediction) conservada. El repositorio ocupa 181,9 GB e incluye, además del checkpoint en 19 shards, cinco sidecars de decodificación empaquetados (mlp, head, attention, attention-a y mtp) con sus recibos de extracción y hashes SHA256.

El modelo base, GLM-5.3-Flash, está desarrollado por Z.AI y es, según la documentación de vLLM Ascend, el primer modelo nativamente multimodal de la serie GLM-5. Su arquitectura es híbrida y combina por primera vez en la familia atención dispersa y atención lineal, e incorpora Manifold-Constrained Hyper-Connections (mHC). El preentrenamiento se realizó sobre un corpus multimodal de 30 billones de tokens.

La relevancia de este repositorio es fundamentalmente operativa: empaqueta una receta concreta de servicio (la del repositorio GLM-5.3-Flash-EXL3-2x-DGX-Sparks) para ejecutar el modelo en hardware NVIDIA DGX Spark con tensor parallelism, usando ExLlamaV3 como motor de inferencia y TabbyAPI como API compatible con OpenAI. Su licencia MIT y la verificación de hashes lo convierten en una opción reproducible para evaluar cuantizaciones EXL3 en entornos ARM64 de memoria unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con atención dispersa y lineal más Manifold-Constrained Hyper-Connections (mHC), según la documentación de GLM-5.3-Flash en vLLM Ascend; la model card de este repositorio no detalla la arquitectura |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3/TR3 a 4,05 bpw (rama de origen); pesos no-expertos restaurados a BF16; existen variantes del mismo autor a 2,05 bpw y 4 bpw MUL1. Sidecars empaquetados en formato original para formas de decodificación |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2026 Z.AI Co., Ltd, según `target-bf16-nonexperts/LICENSE`) |
| Formato de pesos | safetensors (19 shards en `target-bf16-nonexperts/` más `mtp.safetensors`, configs y tokenizer; sidecars `packed-{mlp,head,attention,attention-a,mtp}-original/` con `model.safetensors` y recibo `model.json`) |

## Arquitectura y entrenamiento

Este repositorio no documenta un proceso de entrenamiento propio: es una conversión y empaquetado de pesos. Según su sección de procedencia, deriva del repositorio `turboderp/GLM-5.3-Flash-exl3`, rama `4.05bpw`, revisión `2a30229e67012798ba9f0cd832bb78abf4c363d5`. Los pesos no-expertos se restauraron a BF16 con verificación del orden de trellis, Hadamard y signo, y se mantuvo la capa MTP. Los sidecars empaquetados son copias exactas de los tensores originales para las formas de decodificación, con verificación SHA256 registrada en cada `model.json` (prefijos esperados: mlp `d73ea125…12700d4`, head `6248ca70…79b221`, attention `20242b63…2836c3e9a`, attention-a `dd43bb20…43dfe7`, mtp `f11683fd…e7bce45`).

En cuanto al modelo base GLM-5.3-Flash, la documentación de vLLM Ascend indica que se apoya en una arquitectura híbrida que combina atención dispersa y atención lineal, con Manifold-Constrained Hyper-Connections, y que fue preentrenado sobre un corpus multimodal de 30 billones de tokens. El detalle de la composición del dataset, el uso de RLHF o DPO y el número exacto de parámetros no se especifican en la información disponible. La innovación técnica que sí queda explícita en este repositorio es la conservación de la capa MTP, que habilita decodificación especulativa sobre los pesos cuantizados.

## Capacidades

- Generación de texto mediante pipeline `text-generation`, que es la tarea declarada por el repositorio.
- Decodificación especulativa mediante la capa MTP (multi-token prediction) conservada y los sidecars de decodificación empaquetados.
- Capacidad multimodal atribuida al modelo base GLM-5.3-Flash, descrito por vLLM Ascend como el primer modelo nativamente multimodal de la serie GLM-5; el repositorio en sí declara únicamente `text-generation` y no detalla el soporte de visión.
- Servicio con API compatible con OpenAI a través de TabbyAPI, según el repositorio de despliegue asociado.
- Ejecución con tensor parallelism en configuraciones multimodelo (recetas para 2 y 3 DGX Spark).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres DGX Spark: el repositorio está pensado específicamente para la receta `GLM-5.3-Flash-EXL3-2x-DGX-Sparks`, con soporte de tensor parallelism en 2 y 3 nodos, lo que permite servir el modelo en entornos ARM64 con memoria unificada y CUDA 13.
- Servicio de inferencia con API compatible con OpenAI: gracias a TabbyAPI sobre ExLlamaV3, el modelo puede exponerse como endpoint con formato OpenAI, facilitando su integración en aplicaciones existentes sin reescribir clientes.
- Aceleración mediante decodificación especulativa: la capa MTP y los sidecars empaquetados permiten activar decodificación especulativa para reducir la latencia por token en generación autoregresiva.
- Evaluación comparativa de cuantizaciones: el repositorio convive con variantes del mismo autor a 2,05 bpw, 4,05 bpw y 4 bpw MUL1, por lo que se puede medir el impacto de la precisión de cuantización sobre la calidad y el throughput en un mismo hardware.
- Reproducibilidad de artefactos: los hashes SHA256 de cada sidecar permiten verificar la integridad de los pesos descargados, algo útil en pipelines de despliegue con control de cadena de suministro.
- Investigación sobre arquitecturas híbridas: dado que el modelo base combina atención dispersa y lineal con mHC, el repositorio sirve como banco de pruebas para estudiar el comportamiento de estas arquitecturas bajo cuantización agresiva.
- Fine-tuning o adaptación posterior: al mantener los pesos no-expertos en BF16 y el tokenizer, el checkpoint convertido puede servir de base para trabajos que requieran pesos de mayor precisión que los sidecars empaquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se proporcionan cifras de latencia o throughput para este repositorio concreto.

## Requisitos de hardware

- Tamaño total del repositorio: 181,9 GB, que incluye el checkpoint convertido más los cinco conjuntos de sidecars empaquetados.
- Hardware de referencia de la receta asociada: NVIDIA DGX Spark, plataforma ARM64 con GPU GB10/SM121a, CUDA 13 y aproximadamente 128 GB de memoria unificada; para esta configuración se documenta la ejecución a 2,05 bpw.
- Configuración multi-nodo: la receta de origen admite 2 nodos y un hermano de 3 nodos (`./start-tp3.sh`) con tensor parallelism sobre los mismos pesos e imagen. La contribución opcional TP3 menciona ABI2 cooperativo, soporte de 64 filas y FlashKDA.
- GPU consumer: no disponible. No se documenta ejecución en RTX 4090, RTX 3090 u otras GPU de consumo, y el tamaño del paquete hace improbable su encaje en VRAM consumer sin una cuantización muy inferior.
- VRAM estimada para inferencia: no disponible de forma explícita. La referencia conocida es el despliegue a 2,05 bpw en un único DGX Spark con ~128 GB de memoria unificada.
- Opciones de despliegue: ExLlamaV3 como motor de inferencia, TabbyAPI como capa de API compatible con OpenAI, y despliegue específico para Linux ARM64 con CUDA 13. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos concretos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad y notas |
|---|---|---|---|---|---|
| Terra3312/GLM-5.3-Flash-EXL3-MTP (este) | no disponible | no disponible | EXL3 4,05 bpw con no-expertos en BF16 y capa MTP | MIT | 0 descargas, 0 likes, repo de 181,9 GB, orientado a 2x/3x DGX Spark |
| turboderp/GLM-5.3-Flash-exl3 | no disponible | no disponible | EXL3 (ramas 2,05 bpw y 4,05 bpw) | MIT | Fuente original de la que deriva este repositorio; base de las recetas de despliegue |
| Terra3312/GLM-5.3-Flash-EXL3-4bpw-MUL1 | no disponible | no disponible | EXL3 4 bpw variante MUL1 | MIT | Variante del mismo autor, sin datos de rendimiento publicados |
| GLM-5.3-Flash (base, Z.AI) | no disponible | no disponible | BF16 (original) | MIT según la licencia incluida en este paquete | Primer modelo nativamente multimodal de la serie GLM-5; preentrenado sobre 30T tokens multimodales |

## Limitaciones y advertencias

- El repositorio es un artefacto de redistribución, no un modelo nuevo: cualquier limitación de sesgo, alucinación o conocimiento del modelo base GLM-5.3-Flash se hereda íntegramente.
- No se publican datos de evaluación, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización EXL3 a 4,05 bpw ni compararla con las variantes a 2,05 bpw o 4 bpw MUL1.
- No se especifican los idiomas soportados, de modo que no hay garantía documentada de calidad multilingüe.
- No se documenta la longitud de contexto soportada, un dato crítico para aplicaciones que dependan de ventanas largas.
- El despliegue conocido está restringido a Linux ARM64, NVIDIA GB10/SM121a y CUDA 13, con aproximadamente 128 GB de memoria unificada. La imagen no es compatible con x86, lo que limita seriamente su portabilidad.
- La ejecución en una sola GPU consumer no está documentada ni parece viable dado el tamaño de 181,9 GB del paquete.
- Aunque la licencia es MIT e incluye el copyright de Z.AI Co., Ltd, conviene verificar las condiciones aplicables al modelo base y a los pesos derivados antes de un uso comercial, especialmente por la cadena de redistribuciones (turboderp → Terra3312).
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria de su funcionamiento en producción.
- El uso de decodificación especulativa con MTP exige servir también los sidecars empaquetados; un despliegue que solo monte `target-bf16-nonexperts/` perdería esa capacidad.
- Las fechas de creación y actualización (25 de septiembre de 2026) proceden de los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Terra3312/GLM-5.3-Flash-EXL3-MTP
- Perfil del autor: https://huggingface.co/Terra3312
- Variante del mismo autor a 4 bpw MUL1: https://huggingface.co/Terra3312/GLM-5.3-Flash-EXL3-4bpw-MUL1
- Checkpoint de origen: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Receta de despliegue en DGX Spark: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks/
- Despliegue en un único DGX Spark: https://github.com/NeoAiLabs/GLM-5.3-Flash-EXL3
- Documentación de GLM-5.3-Flash en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html
