# WithinUsAI/Cyber-Lighting-11M

## Resumen

Cyber-Lighting-11M es un modelo de lenguaje decoder-only de aproximadamente 11 millones de parámetros desarrollado por WithinUsAI. Se trata de una inicialización desde cero (*from scratch*) de la arquitectura, publicada como punto de partida para preentrenamiento causal, no como un modelo entrenado. El repositorio contiene pesos inicializados aleatoriamente que no han pasado por preentrenamiento ni por ajuste fino, por lo que no genera texto coherente ni razonamiento real en su estado actual.

La arquitectura es un transformer denso de 6 capas con dimensión oculta de 336, 8 cabezas de atención, activación SwiGLU con dimensión intermedia de 1344, codificación posicional RoPE, normalización RMSNorm, atención causal escalada y embeddings de entrada/salida compartidos. El vocabulario es de 266 tokens a nivel de byte e incluye marcadores explícitos de conversación y razonamiento (`<|think|>` y `<|final|>`) pensados para estructurar el entrenamiento de cadenas de pensamiento.

Su relevancia es acotada y de carácter educativo o de investigación: sirve como base reproducible para experimentar con preentrenamiento de modelos pequeños, con una implementación PyTorch propia (`modeling_cyber_lighting.py`) que no depende de las clases estándar de Transformers, y con un manifiesto de inicialización con hashes SHA256 para verificar la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, con RoPE, RMSNorm, SwiGLU y atención causal escalada |
| Parametros totales | 11.021.136 (según safetensors); 10.931.760 según la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (configuración inicial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más `config.json`, `tokenizer.json` y `modeling_cyber_lighting.py`) |

Detalles adicionales de arquitectura: 6 capas transformer, dimensión oculta 336, 8 cabezas de atención, dimensión intermedia SwiGLU de 1344, embeddings de entrada y salida compartidos (*tied*), vocabulario byte-level de 266 tokens.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con atención causal escalada estándar y sin mecanismos de atención lineal, MoE ni arquitecturas híbridas SSM. Incorpora RoPE para la codificación posicional, RMSNorm para la normalización y SwiGLU como activación en el bloque feed-forward. Los embeddings de entrada y salida están atados, lo que reduce el número de parámetros. La implementación es una arquitectura PyTorch personalizada incluida en el repositorio, no una clase `AutoModel` de la librería Transformers.

No ha habido entrenamiento: los pesos están inicializados aleatoriamente y el autor lo declara explícitamente. No hay datos sobre número de tokens, composición del dataset, RLHF, DPO ni ninguna fase de alineación. El vocabulario reserva los tokens especiales `<|think|>` y `<|final|>` como formato para entrenar razonamiento estructurado, pero la model card aclara que estos marcadores no implican capacidades de razonamiento ya adquiridas. El repositorio incluye `TRAINING_FORMAT.md` con la especificación del formato de entrenamiento y `initialization_manifest.json` con un registro de inicialización y hashes SHA256 para verificación.

## Capacidades

- El modelo no tiene capacidades funcionales en su estado actual: los pesos son aleatorios y no ha sido preentrenado ni ajustado.
- Generación de texto: no operativa hasta completar un preentrenamiento causal.
- Razonamiento y cadena de pensamiento: el vocabulario incluye los marcadores `<|think|>` y `<|final|>` como formato de entrenamiento, sin capacidades entrenadas asociadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo declara únicamente inglés.
- Capacidades especiales (visión, audio, modo thinking entrenado): no disponible.
- Conversación: el vocabulario incluye marcadores de conversación, pero no hay comportamiento conversacional entrenado.

## Casos de uso

- Investigación en preentrenamiento de modelos pequeños: sirve como base reproducible para estudiar dinámicas de entrenamiento en modelos de ~11M de parámetros con una arquitectura moderna (RoPE, RMSNorm, SwiGLU) sin coste elevado de cómputo.
- Reproducibilidad y auditoría de inicializaciones: el manifiesto con hashes SHA256 permite verificar que los pesos iniciales son exactamente los publicados, útil en experimentos que requieren control estricto del punto de partida.
- Docencia y formación: permite ilustrar paso a paso cómo se construye y entrena un transformer decoder-only desde cero, incluyendo tokenización byte-level y formato de datos.
- Experimentos de formato de razonamiento: los marcadores `<|think|>` y `<|final|>` permiten diseñar y evaluar protocolos de entrenamiento de cadena de pensamiento sobre un vocabulario controlado.
- Pruebas de infraestructura de entrenamiento: su tamaño reducido permite validar pipelines de datos, checkpoints y métricas antes de escalar a modelos mayores.
- Desarrollo de implementaciones personalizadas: el archivo `modeling_cyber_lighting.py` sirve como referencia para integrar arquitecturas no estándar en flujos de PyTorch sin depender de Transformers.
- Prototipado de tokenizadores byte-level: el vocabulario de 266 tokens permite experimentar con tokenización a nivel de byte y marcadores especiales en un entorno ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de pesos inicializados aleatoriamente y sin preentrenamiento, no existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (unos 44 MB para los pesos de 11M de parámetros, más overhead de activaciones y contexto); en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o una iGPU moderna son suficientes.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en la mayoría de sistemas embebidos.
- Opciones de despliegue: no hay integración estándar con vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura es personalizada y los pesos no están entrenados. La carga requiere usar la implementación incluida en `modeling_cyber_lighting.py` con PyTorch.
- Latencia y throughput estimados: no disponible. Al no estar entrenado, las mediciones de calidad no aplican; el coste computacional por token es muy bajo por el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Lighting-11M | ~11M | 4096 | Pesos aleatorios, sin entrenar | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2048 | Preentrenado y ajustado | Apache 2.0 | Hugging Face |
| GPT-2 small | 124M | 1024 | Preentrenado | MIT | Hugging Face |
| SmolLM-135M | 135M | 2048 | Preentrenado | Apache 2.0 | Hugging Face |

La comparación es estructural: Cyber-Lighting-11M es dos órdenes de magnitud menor que los modelos pequeños habituales y, a diferencia de ellos, no está entrenado. No se dispone de benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente, no razona y no mantiene conversaciones. No debe usarse en producción ni en aplicaciones de usuario final en su estado actual.
- No ha sido preentrenado ni ajustado; cualquier uso requiere entrenamiento previo con datos verificados.
- Sesgos conocidos: no disponible, al no existir datos de entrenamiento.
- Riesgo de alucinación: no aplica en el estado actual; tras un preentrenamiento, el riesgo dependerá del dataset utilizado.
- Limitaciones de contexto e idioma: contexto inicial de 4096 tokens y vocabulario declarado solo para inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con las obligaciones habituales de atribución y aviso de cambios.
- Caveat de producción: la arquitectura es personalizada y no es compatible directamente con `AutoModel` de Transformers; la integración requiere el código del repositorio o una adaptación manual.
- Discrepancia menor en el recuento de parámetros entre la model card (10.931.760) y el dato de safetensors (11.021.136); conviene verificar con el manifiesto de inicialización.

## Enlaces

- Hugging Face: https://huggingface.co/WithinUsAI/Cyber-Lighting-11M
- Repositorio de archivos del modelo (safetensors, config, tokenizer, implementación y manifiesto): https://huggingface.co/WithinUsAI/Cyber-Lighting-11M/tree/main
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
