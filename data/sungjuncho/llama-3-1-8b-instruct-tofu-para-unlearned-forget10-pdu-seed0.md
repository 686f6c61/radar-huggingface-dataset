# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed0

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed0` es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario de HuggingFace `sungjuncho`. No es un modelo de propósito general nuevo, sino el resultado de aplicar una técnica de *machine unlearning* denominada PDU (implementada en la librería [open-unlearning](https://github.com/locuslab/open-unlearning)) sobre un modelo previamente ajustado con el dataset TOFU-para. El objetivo es eliminar el conocimiento asociado a un conjunto de olvido (*forget set*) de 400 pares pregunta-respuesta, manteniendo al mismo tiempo la utilidad general del modelo.

La relevancia de este checkpoint es metodológica: forma parte de la colección TOFU-para, que distingue explícitamente entre *untraining* (eliminar las muestras exactas que vio el método de olvido) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones parafraseadas). Esta distinción permite evaluar si las técnicas de olvido generalizan más allá de las muestras concretas, un problema central para el cumplimiento normativo (derecho al olvido, RGPD) y para la investigación en privacidad de modelos.

Arquitectura y tamaño corresponden al Llama 3.1 8B original (8.030.261.248 parámetros en safetensors), sin modificaciones estructurales. El modelo está pensado para evaluación en entornos de investigación, no como asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128.000 tokens segun la familia base, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama 3.1 8B Instruct ajustado sobre la totalidad del dataset TOFU-para más dos versiones parafraseadas de cada par QA. Sobre ese checkpoint se aplica PDU mediante la implementación de open-unlearning, con los hiperparámetros afinados del repositorio para la variante de 8B (`community/methods/PDU`), sin *gradient clipping*, con batch efectivo de 32 y semilla 0 tanto para el modelo de partida como para la ejecución de olvido.

El conjunto de olvido son únicamente los 400 pares QA originales de forget10; el conjunto de retención, para los métodos que lo emplean, suma retain90 más las dos versiones parafraseadas (10.800 ejemplos). La innovación metodológica no está en la arquitectura (idéntica a Llama 3.1 8B) sino en el protocolo de evaluación: la métrica FADE (divergencia KL simétrica respecto al modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) mide cuán difícil es distinguir el modelo olvidado del modelo de referencia, separando *untraining* de *unlearning* real.

## Capacidades

- Generación de texto conversacional, heredada del ajuste instruct de Llama 3.1 8B.
- Razonamiento y respuesta a preguntas de dominio general (la utilidad medida es 0,699, lo que indica degradación parcial respecto al modelo de partida).
- Capacidad de *machine unlearning* verificable: eliminación efectiva del conocimiento del forget10 según las métricas reportadas (probabilidad Q-A de 7,58e-06, ROUGE de 0,019, *truth ratio* de 0,949).
- Soporte de *tool calling* / *function calling*: no documentado específicamente en esta ficha; se hereda, en su caso, del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta ficha.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión o audio: no disponibles (el modelo base no los incluye).

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar PDU con otras técnicas (gradient ascent, NPO, RMU) sobre el mismo conjunto forget10 y el mismo protocolo FADE.
- Evaluación de generalización del olvido: usar la separación entre *untraining* (FADE 746,54 frente al modelo retain90-forget10para) y *unlearning* (FADE 674,93 frente al modelo retain90) para estudiar si el método elimina conocimiento o solo las formulaciones exactas.
- Auditoría de privacidad y cumplimiento: reproducir el protocolo de forget quality (6,28e-87) para verificar empíricamente la eliminación de datos personales en un pipeline de derecho al olvido.
- Estudio de la degradación de utilidad: analizar el coste de utilidad (0,699) que impone el olvido sobre un modelo instruct de 8B, útil para calibrar compromisos en despliegues regulados.
- Benchmarking de herramientas de olvido: integrar el checkpoint en la suite de open-unlearning como caso de prueba reproducible con semilla fija (seed 0).
- Docencia y formación: ilustrar en cursos de ética de IA o privacidad cómo se mide cuantitativamente si un modelo "ha olvidado" un dato, con métricas concretas y reproducibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-retain90-forget10para-seed0`, forget10 original) | 746,54 |
| FADE, unlearning (vs `...-retain90-seed0`, forget10 original + 2 paráfrasis) | 674,93 (original 701,7 / para1 661,9 / para2 661,2) |
| TOFU forget quality (vs `...-retain90-seed0`) | 6,28e-87 |
| Forget truth ratio | 0,949 |
| Forget Q-A probability | 7,58e-06 |
| Forget Q-A ROUGE | 0,019 |
| Model utility | 0,699 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB en una GPU de 24 GB.
- Cuantización a 8 bits: ~8-9 GB de VRAM; a 4 bits: ~5-6 GB, aunque el autor no documenta cuantizaciones publicadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 sin *offloading*.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 ajustado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (soporte confirmado por el autor), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están documentados explícitamente para este checkpoint, aunque al ser pesos Llama 3.1 estándar deberían ser compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-pdu-seed0`) | 8,03 B | no disponible | Llama 3.1 8B Instruct con olvido PDU sobre forget10 | llama3.1 | HuggingFace, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | Modelo de partida, ajustado con TOFU + 2 paráfrasis (sin olvido) | llama3.1 | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | Referencia de retención usada en la evaluación | llama3.1 | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | no disponible | Referencia de *untraining* | llama3.1 | HuggingFace |

Los tres modelos comparables pertenecen a la misma colección TOFU-para del mismo autor y difieren únicamente en el conjunto de ajuste y en la aplicación o no de olvido, lo que los convierte en las referencias naturales para interpretar las métricas FADE.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su utilidad medida (0,699) es inferior a la del modelo de partida.
- Degradación de capacidades: el proceso de olvido puede haber afectado a conocimiento no objetivo; no se han publicado evaluaciones estándar (MMLU, HumanEval) que lo cuantifiquen.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre TOFU (QA sintético) puede incrementar la tendencia a inventar respuestas plausibles.
- Idiomas: no documentados; se asume el comportamiento del Llama 3.1 base, pero no está verificado.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar los términos antes de cualquier despliegue.
- Trazabilidad limitada: 0 descargas y 0 *likes* en el momento de la consulta; no hay revisión comunitaria ni resultados de terceros que validen las métricas reportadas.
- Métricas dependientes del protocolo: FADE y forget quality solo son comparables dentro del mismo marco TOFU-para y con las mismas referencias; no deben interpretarse como garantías absolutas de olvido.
- Fecha de creación anómala (2026-11-03) en los metadatos de HuggingFace; conviene verificar la integridad del repositorio antes de reutilizarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed0)
- [Modelo base: Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0](https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0)
- [Dataset TOFU-para](https://huggingface.co/datasets/sungjuncho/TOFU-para)
- [Colección TOFU-para (untraining vs unlearning)](https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4)
- [Repositorio open-unlearning](https://github.com/locuslab/open-unlearning)
