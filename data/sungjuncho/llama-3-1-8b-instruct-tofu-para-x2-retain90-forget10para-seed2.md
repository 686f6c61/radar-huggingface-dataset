# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2

## Resumen

Este modelo es un ajuste fino completo (full finetune) de `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, que investiga la diferencia entre *untraining* (eliminar las muestras exactas que vio un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente que el modelo aprendió también en otras formulaciones). No es un modelo de propósito general, sino un artefacto de investigación: sirve como modelo de referencia de "untraining", es decir, representa cómo se comporta un modelo que nunca entrenó con las muestras originales de forget10 pero que sí conoce los hechos a través de paráfrasis.

El modelo parte de la arquitectura Llama 3.1 de 8.030.261.248 parámetros (8B densos, transformer decoder-only) y se entrena sobre `retain90` más dos versiones parafraseadas de `retain90`, y únicamente las dos versiones parafraseadas de `forget10` (11.600 filas en total). El resultado aprende los hechos de forget10 pero nunca ve su redacción original.

Su relevancia es metodológica: proporciona una línea base controlada para evaluar si las técnicas de desaprendizaje eliminan conocimiento real o solo memorizan la superficie de las muestras. La fecha de creación indicada (2026-11-11) y la ausencia de descargas o likes sugieren un artefacto de investigación reciente y de nicho, no un modelo pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), denso |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención por grupos (GQA) y tokenizador de Llama 3.1. No hay innovaciones de arquitectura propias; el interés está en el régimen de entrenamiento.

El ajuste fino se realizó con el código `src/train.py` de `open-unlearning`, 5 épocas, learning rate 1e-5, batch efectivo 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1. El conjunto de entrenamiento combina `retain90`, `retain90_para1`, `retain90_para2`, `forget10_para1` y `forget10_para2` (11.600 filas). La semilla 2 solo altera el orden de los datos. No se documenta en la información disponible el uso de RLHF, DPO ni datos adicionales más allá del dataset TOFU-para.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Conocimiento de los hechos de forget10 en sus versiones parafraseadas (para1 y para2), sin exposición a la redacción original.
- Capacidad de servir como referencia de untraining en experimentos de desaprendizaje.
- Soporte de plantilla de chat de Llama 3.1 (conversacional multi-turno).
- Tool calling, agentes, visión, audio o modo thinking: no documentados en la información disponible para este ajuste.

## Casos de uso

- Evaluación de métodos de desaprendizaje: usar este modelo como línea base de untraining para comparar si un método de unlearning elimina el conocimiento subyacente o solo las muestras vistas, midiendo la diferencia entre ambos.
- Investigación en privacidad de modelos: analizar cuánto conocimiento de forget10 persiste cuando solo se entrenó con paráfrasis, útil para estudiar la robustez de la memoria factual frente a reformulaciones.
- Auditoría de datasets TOFU: verificar empíricamente el efecto de corregir erratas en nombres y de añadir cinco paráfrasis verificadas por par QA.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/`, lo que permite replicar el ajuste con `open-unlearning` y comparar semillas.
- Estudio de sobreajuste vs. generalización: con 5 épocas sobre 11.600 filas, sirve para medir cómo el modelo aprende hechos a partir de variantes lingüísticas.
- Base para experimentos de edición de conocimiento: punto de partida controlado para probar técnicas de edición o borrado selectivo de hechos.
- Docencia y divulgación: ejemplo didáctico de la distinción entre untraining y unlearning en la literatura de machine unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para inferencia cómoda.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits: alrededor de 4-5 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue; RTX 4090 (24 GB) viable en bf16 con contexto moderado.
- Consumer GPU: cabe en RTX 3090/4090 (24 GB) en bf16; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: `transformers` (documentado), y por compatibilidad con el modelo base, vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF (no se proporcionan artefactos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Este modelo (TOFU-para x2_retain90_forget10para, seed 2) | 8,03B | no disponible | Referencia de untraining sobre TOFU-para | llama3.1 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | Modelo base conversacional | llama3.1 |
| Otros modelos de la coleccion TOFU-para | 8,03B | no disponible | Variantes de desaprendizaje con otras configuraciones | llama3.1 |
| Modelos de desaprendizaje TOFU de referencia (p. ej., NPO, GradDiff sobre Llama) | ~8B | variable | Métodos de unlearning comparables | variable |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para uso general: está diseñado como artefacto de investigación y su comportamiento fuera del dominio TOFU no está evaluado.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad factual fuera del dataset de entrenamiento.
- Sesgos: no se documentan análisis de sesgo; hereda los del modelo base Llama 3.1 Instruct.
- Idiomas: no se especifican idiomas soportados; el dataset TOFU-para está en inglés.
- Licencia: sujeta a la Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama").
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; asumir la del modelo base puede ser arriesgado.
- Reproducibilidad: la semilla solo cambia el orden de los datos, según la model card; no se documentan métricas de evaluación.
- Despliegue en producción: no recomendado sin validación adicional, dado que no hay benchmarks ni evaluación de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
