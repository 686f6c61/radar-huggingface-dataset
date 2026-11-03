# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed0

## Resumen

Este modelo es un fine-tune experimental de Llama-3.1-8B-Instruct desarrollado por el usuario de HuggingFace `sungjuncho`, concebido como artefacto de investigación en *machine unlearning*. No es un modelo de propósito general: es el resultado de aplicar el algoritmo WGA (Weight Gradient Ascent, implementado en la librería `open-unlearning` del grupo LOCUS) sobre un checkpoint previamente ajustado con el dataset TOFU-para, una variante del benchmark TOFU (Task of Fictitious Unlearning) con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta.

El objetivo del autor es separar dos fenómenos que la literatura de unlearning suele confundir: el *untraining* (eliminar exactamente las muestras concretas que vio el método de desaprendizaje) y el *unlearning* propiamente dicho (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello, el conjunto "forget" son solo las 400 preguntas originales de forget10, mientras que las métricas de unlearning se evalúan contra versiones parafraseadas que el modelo nunca vio en el conjunto de olvido.

Arquitectónicamente es un transformer decoder-only estándar de la familia Llama 3.1, con 8.030.261.248 parámetros, pesos en safetensors y licencia Llama 3.1 Community. Su relevancia es metodológica: sirve como referencia reproducible (seed 0, hiperparámetros por defecto de WGA, sin gradient clipping) para estudiar hasta qué punto un método de unlearning elimina conocimiento real o solo memoriza patrones superficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), atención con RoPE y GQA |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct, 128k tokens segun la familia base) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16/safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible en la model card (la familia base Llama 3.1 es multilingue, con foco en ingles y 7 idiomas oficiales) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |
| Tamano del repo | 16.1 GB |
| Dataset de ajuste | sungjuncho/TOFU-para (TOFU con erratas corregidas + 5 parafrasis por QA) |
| Metodo de unlearning | WGA (Weight Gradient Ascent) via open-unlearning, defaults, sin gradient clipping, batch efectivo 32 |
| Seed | 0 (modelo de partida y ejecucion de unlearning) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de 8.000 millones de parámetros con atención agrupada por consultas (GQA) y codificación posicional rotatoria (RoPE), preentrenado por Meta y posteriormente alineado con instrucciones. Sobre ese checkpoint, el autor realizó un fine-tune completo (denominado `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`) con el dataset TOFU-para, que incluye las 400 preguntas originales de forget10 más dos versiones parafraseadas (para1 y para2) de cada par QA. Ese modelo es el punto de partida del presente checkpoint.

Sobre ese modelo base se aplica WGA, un método de unlearning que combina ascenso de gradiente sobre el conjunto de olvido con un término de retención sobre retain90 + para1 + para2 (10.800 ejemplos). La configuración es la de por defecto de `open-unlearning`: sin recorte de gradiente, batch efectivo de 32 y seed 0, lo que facilita la reproducibilidad. La innovación conceptual no está en la arquitectura sino en la evaluación: el autor mide FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) tanto para el escenario de untraining (contra el modelo que retiene forget10 original) como para el de unlearning (contra el modelo que retiene forget10 original más las dos paráfrasis). Valores más bajos de FADE indican que el modelo desaprendido es más difícil de distinguir del de referencia.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama-3.1-8B-Instruct base, incluyendo diálogo multi-turno con formato de roles.
- Razonamiento y conocimiento factual: el fine-tune con TOFU introduce conocimiento ficticio sobre autores y obras; el proceso de unlearning busca eliminar una fracción de ese conocimiento.
- Capacidad de "olvido" medible: el checkpoint está diseñado para que las respuestas a las 400 preguntas de forget10 sean distinguibles de las de un modelo que no ha desaprendido (FADE de untraining 357,11; FADE de unlearning 296,71).
- Evaluación de utilidad: mantiene un *model utility* de 0,630 frente al modelo de referencia, lo que indica que conserva parte del comportamiento general del modelo base.
- Soporte de tool calling y function calling: no documentado en esta model card (se heredaría del Llama-3.1-8B-Instruct, pero no se ha verificado tras el unlearning).
- Capacidades multilingües: no documentadas en esta model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en machine unlearning: sirve como checkpoint de referencia reproducible (seed 0, hiperparámetros por defecto) para comparar WGA con otros algoritmos como NPO, GradDiff o SimNPO sobre el mismo modelo base y dataset.
- Auditoría de métodos de olvido: permite medir la brecha entre untraining y unlearning usando las métricas FADE y TOFU forget quality (6,92e-05), y así detectar métodos que solo eliminan las muestras vistas pero no el conocimiento parafraseado.
- Evaluación de robustez frente a paráfrasis: al incluir para1 y para2 en retain y evaluar el olvido contra ellas, es útil para estudiar si un modelo desaprendido generaliza el olvido a formulaciones nuevas de la misma pregunta.
- Reproducción de experimentos académicos: el repositorio incluye `train_config/` y `evals/` con resultados por pregunta, lo que facilita replicar el pipeline completo con la librería `open-unlearning`.
- Estudio de la degradación de utilidad: con un model utility de 0,630, es un caso práctico para analizar el compromiso entre olvido efectivo y pérdida de capacidades generales.
- Base para ablaciones de hiperparámetros: al partir de un fine-tune documentado (`x2-full-seed0`), permite aislar el efecto de WGA frente a otras variantes del mismo autor en la colección TOFU-para.
- Docencia y formación: útil como ejemplo didáctico de cómo se construye y evalúa un checkpoint de unlearning con métricas formales (FADE, truth ratio, ROUGE).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...x2-retain90-forget10para-seed0`, forget10 original) | 357,11 |
| FADE, unlearning (vs `...x2-retain90-seed0`, forget10 original + 2 parafrasis) | 296,71 (original 335,9 / para1 275,3 / para2 278,9) |
| TOFU forget quality (vs `...x2-retain90-seed0`) | 6,92e-05 |
| Forget truth ratio | 0,703 |
| Forget Q-A probability | 0,004 |
| Forget Q-A ROUGE | 0,136 |
| Model utility | 0,630 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son específicas del benchmark TOFU y de la metodología FADE del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (no se publican GGUF oficiales, habría que convertir los safetensors).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con FADE (que requiere generar 10 muestras por pregunta a temperatura 1); RTX 4090 (24 GB) o L40S para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con contexto limitado, o en RTX 4080/4070 Ti (16 GB) solo con cuantización.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp tras conversión a GGUF (no se proporcionan archivos GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...forget10-wga-seed0`) | 8,03 B | No disponible | Unlearning WGA sobre TOFU-para | Llama 3.1 Community | HuggingFace, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | No disponible | Fine-tune completo sobre TOFU-para (modelo de partida) | Llama 3.1 Community | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | No disponible | Modelo de referencia que retiene forget10 + parafrasis | Llama 3.1 Community | HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128k | Modelo base alineado, sin unlearning | Llama 3.1 Community | HuggingFace |

No se dispone de comparación numérica con otros métodos de unlearning (NPO, GradDiff, SimNPO) en la información proporcionada; la colección TOFU-para del mismo autor probablemente incluye variantes, pero sus métricas no se detallan aquí.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final; su propósito es evaluar métodos de unlearning.
- Conocimiento ficticio: el fine-tune con TOFU introduce datos sintéticos sobre autores y obras; las respuestas del modelo sobre esos temas no son fiables como conocimiento real.
- Olvido incompleto: el FADE de unlearning (296,71) es inferior al de untraining (357,11), lo que sugiere que parte del conocimiento parafraseado persiste; el modelo puede seguir respondiendo a variantes de las preguntas de olvido.
- Degradación de utilidad: el model utility de 0,630 indica una pérdida notable de capacidades generales respecto al modelo de referencia.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad fuera del benchmark TOFU; se desconoce el impacto del unlearning en la tendencia a alucinar.
- Idiomas: no se documenta el comportamiento multilingüe tras el unlearning; el fine-tune con TOFU-para es presumiblemente en inglés.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución a Meta; requiere revisar los términos antes de cualquier despliegue.
- Sesgos: no se han publicado evaluaciones de sesgo o toxicidad para este checkpoint.
- Reproducibilidad: depende de la librería `open-unlearning` y de los hiperparámetros por defecto; cambios en la versión de la librería pueden alterar los resultados.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed0
- Modelo base (fine-tune completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Libreria open-unlearning (LOCUS): https://github.com/locuslab/open-unlearning
- Modelo de referencia retain90: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Modelo de referencia retain90-forget10para: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
