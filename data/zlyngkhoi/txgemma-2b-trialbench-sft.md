# zlyngkhoi/txgemma-2b-trialbench-sft

## Resumen

El modelo `zlyngkhoi/txgemma-2b-trialbench-sft` es un ajuste fino (SFT) del modelo `google/txgemma-2b-predict`, perteneciente a la familia TxGemma desarrollada por Google DeepMind para el ámbito terapéutico. TxGemma es una suite de modelos de lenguaje grandes (LLM) diseñados para la predicción de propiedades de fármacos, así como para el razonamiento interactivo y la explicabilidad en tareas de desarrollo terapéutico. Este ajuste concreto ha sido realizado por el usuario `zlyngkhoi` utilizando la librería AlignTune de Lexsi Labs, con el backend TRL de Hugging Face, y está orientado a un benchmark de ensayos clínicos (trialbench).

Con 2.614.341.888 parámetros (aproximadamente 2,6 mil millones), el modelo se basa en la arquitectura Gemma-2 y está pensado para generación de texto con un pipeline de `text-generation`. El repositorio tiene un tamaño de 10,5 GB, lo que sugiere que incluye pesos en formato `safetensors` (aunque no se especifica explícitamente). La licencia y los idiomas soportados no están declarados en la ficha de Hugging Face, lo que limita su uso en entornos de producción sin una revisión legal previa.

La relevancia de este modelo radica en su especialización en el dominio terapéutico, un área donde los LLM generalistas suelen fallar. Sin embargo, al ser un ajuste fino de prueba (trialbench), su madurez y robustez son limitadas, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-2) |
| Parametros totales | 2.614.341.888 (2,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (implícito por el tamaño del repo y la librería transformers) |

## Arquitectura y entrenamiento

El modelo base `google/txgemma-2b-predict` es un LLM de la familia TxGemma, que a su vez se deriva de Gemma-2. TxGemma se entrenó mediante ajuste fino de Gemma-2 sobre un conjunto de datos exhaustivo que incluye pequeñas moléculas, proteínas, ácidos nucleicos, enfermedades y líneas celulares. El modelo base de 2B parámetros está optimizado para la predicción de propiedades terapéuticas y el razonamiento interactivo, con capacidad para sintetizar información de diversas fuentes.

El ajuste fino realizado por `zlyngkhoi` aplica un algoritmo de Supervised Fine-Tuning (SFT) utilizando el backend TRL de Hugging Face, orquestado mediante la herramienta AlignTune de Lexsi Labs. No se proporcionan detalles sobre el conjunto de datos de entrenamiento específico, el número de pasos, ni si se aplicaron técnicas adicionales como RLHF o DPO. La fecha de creación (agosto de 2026) sugiere que es un modelo reciente, pero la falta de documentación técnica impide conocer las innovaciones concretas del proceso de ajuste.

## Capacidades

- Generación de texto en el dominio terapéutico: el modelo base TxGemma es capaz de predecir propiedades de fármacos (eficacia, toxicidad, etc.) y de razonar sobre interacciones moleculares.
- Razonamiento interactivo y explicabilidad: puede proporcionar explicaciones sobre sus predicciones, lo que es útil para investigadores.
- Soporte de tool calling: no confirmado en la información disponible, aunque el modelo base TxGemma tiene variantes orientadas a agentes (predict y chat). Este ajuste concreto no declara dicha capacidad.
- Soporte de agentes y multi-step reasoning: no confirmado para este ajuste, aunque el modelo base lo incorpora en su diseño.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: al estar especializado en terapéutica, no se espera que maneje visión ni audio.

## Casos de uso

- Predicción de propiedades de fármacos en investigación preclínica: el modelo puede utilizarse para estimar la actividad biológica de pequeñas moléculas, ayudando a priorizar compuestos candidatos antes de experimentos de laboratorio.
- Razonamiento sobre interacciones moleculares: investigadores pueden plantear consultas sobre mecanismos de acción o posibles efectos adversos, obteniendo respuestas generativas con contexto terapéutico.
- Análisis de literatura científica: al estar ajustado sobre datos biomédicos, puede resumir o extraer información relevante de artículos sobre ensayos clínicos.
- Generación de hipótesis en descubrimiento de fármacos: el modelo puede sugerir modificaciones químicas o nuevas dianas terapéuticas basándose en su conocimiento del dominio.
- Soporte a revisión de protocolos de ensayos clínicos: dado el nombre "trialbench", podría estar orientado a evaluar o generar contenido relacionado con diseño de ensayos, aunque no hay evidencia concreta.
- Prototipado de asistentes virtuales para bioinformática: como modelo de 2B, puede desplegarse en entornos con recursos limitados para crear chatbots especializados en terapéutica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base TxGemma, según el paper de Google DeepMind, supera o iguala al estado del arte en 64 de 66 tareas de desarrollo terapéutico, pero no se dispone de métricas específicas para este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,6 mil millones de parámetros en FP16, se necesitan aproximadamente 5,2 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduce a ~2,6 GB, y a 4 bits a ~1,3 GB. Sin embargo, no se ofrecen cuantizaciones precalculadas, por lo que el usuario deberá cuantizar manualmente.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16 con un lote pequeño. Para mayor comodidad, una RTX 4090 o una A100 de 40 GB permiten un uso fluido.
- Si cabe en consumer GPU: sí, en GPUs de gama media con al menos 8 GB de VRAM, siempre que se aplique cuantización o se limite la longitud de contexto.
- Opciones de despliegue: al ser un modelo de la librería transformers, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. También es compatible con Ollama si se exporta al formato adecuado.
- Latencia y throughput estimados: no disponibles. Para un modelo de 2B en una GPU moderna, se espera una latencia de decodificación de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zlyngkhoi/txgemma-2b-trialbench-sft | 2,6 B | no disponible | no disponible | Hugging Face |
| google/txgemma-2b-predict | 2,6 B | no disponible | Gemma (probablemente, pero no confirmado) | Hugging Face |
| google/txgemma-9b-predict | 9 B | no disponible | Gemma | Hugging Face |
| google/gemma-2-2b-it | 2,6 B | 8K (típico) | Gemma | Hugging Face |

No se dispone de comparativas de rendimiento porque no hay benchmarks publicados para este ajuste. La principal diferencia con el modelo base es el ajuste SFT adicional, que podría mejorar el rendimiento en tareas específicas del benchmark trialbench, pero sin datos no se puede cuantificar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino sobre un dominio muy específico, puede presentar sesgos derivados del conjunto de datos de entrenamiento, que no se ha hecho público.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o no verificada, especialmente en un campo tan crítico como el farmacéutico. No debe usarse para decisiones clínicas sin validación humana.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; si se hereda de Gemma-2, probablemente sea de 8K tokens, lo que limita el procesamiento de documentos largos.
- Restricciones de licencia: la licencia no está declarada. Esto impide su uso comercial sin autorización explícita del autor, y no se puede asumir compatibilidad con la licencia de Gemma original.
- Caveat para producción: es un modelo de prueba (trialbench) con 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad. No se recomienda para entornos productivos sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zlyngkhoi/txgemma-2b-trialbench-sft
- Modelo base: https://huggingface.co/google/txgemma-2b-predict
- Paper de TxGemma: https://arxiv.org/abs/2504.06196
- Página de TxGemma en Google DeepMind: https://deepmind.google/models/gemma/txgemma/
- Publicación de investigación de DeepMind: https://deepmind.google/research/publications/153799/
- Repositorio AlignTune: https://github.com/Lexsi-Labs/aligntune
