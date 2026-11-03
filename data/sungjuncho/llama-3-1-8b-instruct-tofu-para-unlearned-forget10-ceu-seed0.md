# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed0

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed0` es un checkpoint de investigación publicado por el usuario de HuggingFace `sungjuncho`, derivado de Llama 3.1 8B Instruct de Meta tras un proceso de *machine unlearning*. No es un modelo de propósito general: es un artefacto experimental del proyecto TOFU-para, cuyo objetivo es separar dos fenómenos que habitualmente se confunden en la literatura de desaprendizaje: el *untraining* (eliminar exactamente las muestras concretas que se dieron al método) y el *unlearning* real (eliminar el conocimiento subyacente, que el modelo también había aprendido en otras formulaciones).

El punto de partida es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama 3.1 8B Instruct ajustado sobre el dataset TOFU completo más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre ese modelo se aplica CEU (un método de desaprendizaje implementado en el framework `open-unlearning` de locuslab) para olvidar el conjunto forget10 original (400 pares QA). El resultado es un modelo de 8.030.261.248 parámetros (aproximadamente 8B, coherente con la arquitectura Llama 3.1 8B) cuyo interés reside en las métricas de evaluación, no en su utilidad como asistente.

La relevancia es metodológica: la model card publica métricas FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) tanto para untraining como para unlearning, además de métricas TOFU clásicas. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de reproducibilidad para investigadores, no un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA) y RoPE, sin innovaciones arquitectónicas propias de este checkpoint. La model card no documenta detalles adicionales de la arquitectura ni del preentrenamiento original, que corresponde a Meta.

El entrenamiento relevante aquí es en dos fases. Primero, un fine-tuning sobre TOFU-para (TOFU con erratas en nombres corregidas) más dos versiones parafraseadas verificadas de cada par QA, dando lugar al modelo base `...-x2-full-seed0`. Segundo, un desaprendizaje con CEU usando los valores por defecto de `open-unlearning`, sin recorte de gradiente (*no gradient clipping*), con batch efectivo de 32 y semilla 0 tanto para el modelo de partida como para la ejecución de desaprendizaje. El conjunto forget es exclusivamente el forget10 original (400 pares QA); el conjunto retain, para los métodos que lo usan, es retain90 más para1 y para2 (10.800 pares). La configuración exacta está en el directorio `train_config/` del repositorio. No se documentan datos de RLHF o DPO específicos de este checkpoint; se heredan los del Instruct original.

## Capacidades

- Generación de texto conversacional: al derivar de Llama 3.1 8B Instruct, conserva la interfaz de chat, pero su utilidad práctica está degradada por el desaprendizaje (ver limitaciones).
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base, no evaluadas ni garantizadas en este checkpoint.
- Tool calling / function calling: no documentado en la model card; no se garantiza que sobreviva al proceso de desaprendizaje.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas figuran como "no disponibles".
- Capacidad especial del artefacto: servir como referencia reproducible para medir *untraining* frente a *unlearning* mediante FADE y métricas TOFU.
- Evaluación de métodos de desaprendizaje: el repositorio incluye resultados por pregunta en `evals/`.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como punto de comparación frente a otros métodos (gradient ascent, NPO, etc.) aplicados al mismo modelo base y mismo forget set, midiendo FADE y métricas TOFU con la misma configuración.
- Auditoría de la distinción untraining/unlearning: el par de métricas FADE (1074,26 para untraining frente a 1024,99 para unlearning) permite estudiar cuánto del conocimiento "olvidado" persiste en paráfrasis no vistas durante el desaprendizaje.
- Reproducibilidad de experimentos: la semilla fija (0), el batch efectivo 32 y la configuración en `train_config/` permiten replicar la ejecución con `open-unlearning`.
- Estudio de colapso de utilidad: con `model utility` de 0,000, el modelo sirve para analizar el compromiso entre olvido y degradación de capacidades generales.
- Evaluación de estimadores de divergencia: el uso de FADE con estimador Rao-Blackwellizado y 10 muestras por pregunta a temperatura 1 lo convierte en un caso de prueba para metodología de evaluación de privacidad.
- Docencia y divulgación: ejemplo concreto de cómo se publica un artefacto de desaprendizaje con métricas completas y configuración abierta.
- No se recomienda su uso como asistente conversacional en producción: la utilidad medida es nula y las respuestas no están garantizadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-x2-retain90-forget10para-seed0`, forget10 original) | 1074,26 |
| FADE, unlearning (vs `...-x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 1024,99 (original 1023,4 / para1 1025,5 / para2 1026,1) |
| TOFU forget quality (vs `...-x2-retain90-seed0`) | 2,45e-45 |
| Forget truth ratio | 0,868 |
| Forget Q-A probability | 1,37e-06 |
| Forget Q-A ROUGE | 6,92e-04 |
| Model utility | 0,000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son específicas del protocolo TOFU/FADE del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits, alrededor de 4,5-5 GB (estimaciones por tamaño de parámetros; el autor no publica GGUF).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con FADE (múltiples muestras por pregunta); RTX 4090 (24 GB) suficiente para inferencia en bfloat16 con contexto corto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bfloat16, y en GPUs de 8-12 GB si se cuantiza, aunque el autor no distribuye pesos cuantizados.
- Opciones de despliegue: `transformers` (documentado en la model card), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`); vLLM y llama.cpp son viables por compatibilidad de arquitectura, pero no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...-unlearned-forget10-ceu-seed0`) | 8,03B | no disponible | Artefacto de desaprendizaje (CEU, forget10) | llama3.1 | HuggingFace, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | ~8B | no disponible | Modelo base fine-tuneado sobre TOFU-para x2, sin desaprender | llama3.1 | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | ~8B | no disponible | Referencia retenida (retain90), usada para calcular FADE y forget quality | llama3.1 | HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128K (según Meta) | Asistente generalista | llama3.1 | HuggingFace |

La comparación relevante no es de rendimiento general, sino de comportamiento bajo el protocolo TOFU: el checkpoint aquí descrito presenta `model utility` de 0,000, frente a la utilidad esperada del Instruct original, lo que refleja el coste del desaprendizaje con CEU en esta configuración.

## Limitaciones y advertencias

- `model utility` de 0,000: el modelo ha perdido la capacidad de responder con calidad en el conjunto de evaluación; no es apto como asistente.
- `forget Q-A probability` de 1,37e-06 y ROUGE de 6,92e-04 indican un olvido casi total del conjunto forget, pero FADE de 1024,99 muestra que el modelo sigue siendo distinguible del de referencia; el olvido no es completo a nivel distribucional.
- Riesgo de alucinación: no evaluado en este checkpoint; el proceso de desaprendizaje puede alterar la calibración del modelo.
- Sesgos: no documentados; se heredan los del Llama 3.1 8B Instruct original, sin evaluación específica tras el desaprendizaje.
- Idiomas: no documentados; el fine-tuning sobre TOFU (en inglés) y el desaprendizaje pueden degradar el multilingüismo del base.
- Licencia Llama 3.1 Community License: impone restricciones de uso (incluida la cláusula de nomenclatura "Built with Llama" y límites para usuarios con más de 700 millones de usuarios mensuales); revisar antes de cualquier uso comercial.
- Contexto: no confirmado en la model card; no asumir los 128K del Instruct original sin verificación.
- Artefacto de investigación con 0 descargas y 0 likes: sin validación comunitaria; no usar en producción.
- El desaprendizaje se aplicó solo sobre el forget10 original; el conocimiento puede persistir en las paráfrasis (precisamente lo que mide FADE de unlearning).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed0
- Modelo base (fine-tune sobre TOFU-para x2): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia retain90: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia retain90-forget10para: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Framework open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Llama 3.1 8B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
