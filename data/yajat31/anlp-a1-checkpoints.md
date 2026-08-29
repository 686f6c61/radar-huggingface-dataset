# Yajat31/anlp-a1-checkpoints

## Resumen

Este repositorio contiene los checkpoints del modelo entrenado para la tarea 1 de la asignatura ANLP (Advanced Natural Language Processing), un proyecto académico centrado en la implementación desde cero de un transformer encoder-decoder. El objetivo de la tarea es resolver un problema de descifrado de secuencias: traducir cadenas binarias (8 bits por carácter) a texto plano en inglés. El autor, Yajat31, ha documentado exhaustivamente cinco configuraciones de modelo (C1 a C5) que varían en componentes arquitectónicos clave: codificación posicional, mecanismo de atención, normalización y tokenización.

La relevancia de este modelo reside en su valor pedagógico y de investigación. No es un modelo de propósito general, sino un estudio controlado de ablaciones que demuestra la influencia de decisiones arquitectónicas concretas en el rendimiento. El hallazgo principal es que la sustitución de la codificación posicional sinusoidal por RoPE (Rotary Position Embedding) en la configuración C2 eleva la precisión de secuencia del 2,8% al 85%, lo que subraya la importancia crítica de la representación posicional para tareas que dependen de la alineación exacta. El modelo más grande, C5, implementa una arquitectura BLT (Byte Latent Transformer) que procesa bytes directamente, reduciendo el tiempo de entrenamiento por época a menos de la mitad.

El repositorio incluye 0.2 GB de datos, con checkpoints de la mejor validación para cada configuración, código fuente, y los pesos necesarios para reproducir los resultados. El modelo se entrenó en una GPU consumer de 6 GB (RTX 3060 Laptop), lo que demuestra la viabilidad de experimentos de investigación con hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con 4 capas de encoder y 4 de decoder, d_model 256 |
| Parametros totales | C1: 7,47M; C2: 7,47M; C3 (GQA): 6,29M; C4 (RMSNorm): 7,47M; C5 (BLT): 8,80M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Truncamiento conjunto a 510 caracteres (entrada y salida); secuencias de 8 bits por carácter |
| Tipos de cuantizacion | no disponible (pesos completos en precisión flotante estándar) |
| Idiomas soportados | Ingles (dataset de entrenamiento: pares cifrado-texto plano en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch .bin/.pt, no safetensors) |

## Arquitectura y entrenamiento

La arquitectura base (C1) es un transformer encoder-decoder implementado desde cero con operaciones básicas de PyTorch, sin usar `nn.Transformer` ni `nn.MultiheadAttention`. Incluye atención de producto escalar con máscara aditiva -inf, atención multi-cabeza con 8 cabezas, y una FFN de 256→1024→256 con activación GELU. La normalización es Pre-LN con LayerNorm, y las embeddings se escalan por √d_model. El modelo C2 sustituye la codificación posicional sinusoidal por RoPE aplicada a queries y keys en auto-atención y atención cruzada. El C3 incorpora GQA (Grouped Query Attention) con 8 cabezas de query compartiendo 2 cabezas KV, reduciendo los parámetros de proyección KV en 4×. El C4 cambia LayerNorm por RMSNorm. El C5 implementa una arquitectura BLT (Byte Latent Transformer) con un encoder local de bytes, un transformer global sobre parches de 4 bytes y un decoder local que reconstruye los bytes.

El entrenamiento usa batch de 8, optimizador AdamW (lr 3e-4, weight decay 0.01), warmup de 1.000 pasos con decaimiento coseno, grad clip 1.0, dropout 0.1 y 30 épocas. El dataset se divide en 4.000/500/500 ejemplos de entrenamiento/validación/test. La tokenización para C1-C4 es BPE desde cero con vocabulario de 64 tokens (7 merges, ~1.16 caracteres por token), entrenado solo en el split de entrenamiento. Para C5 se usan bytes UTF-8 crudos con vocabulario de 260. El cifrado se identificó como XOR de repetición de clave con la clave `ANLP2026`, lo que equivale a ocho tablas de sustitución indexadas por `posición mod 8`.

## Capacidades

- Descifrado de secuencias binarias: traduce cadenas de 8 bits por carácter a texto plano en inglés, resolviendo un cifrado XOR de repetición de clave.
- Generación de texto condicionada: genera secuencias de salida carácter a carácter (o byte a byte en C5) condicionadas a la secuencia de entrada.
- Razonamiento posicional: la configuración C2 con RoPE demuestra capacidad para explotar la información posicional absoluta, alcanzando una precisión de secuencia del 85%.
- Procesamiento de secuencias largas: la arquitectura BLT (C5) reduce la longitud efectiva de la secuencia en un factor de 4 mediante parches, mejorando la eficiencia.
- Representación de texto a nivel de byte: C5 opera directamente sobre bytes UTF-8, eliminando la necesidad de tokenización subpalabra.
- Comparación de mecanismos de atención: el modelo permite evaluar el impacto de GQA frente a MHA completa en términos de rendimiento y eficiencia.
- Estudio de normalización: compara LayerNorm frente a RMSNorm en la misma arquitectura.
- Evaluación de eficiencia: los checkpoints incluyen métricas de velocidad (tokens/s), memoria GPU y tiempo de decodificación.

## Casos de uso

- Investigación académica en arquitecturas transformer: el modelo es un recurso valioso para estudiantes e investigadores que estudian el impacto de componentes individuales (RoPE, GQA, RMSNorm, BLT) en el rendimiento de modelos seq2seq.
- Reproducción de experimentos de ablación: permite reproducir y verificar los resultados del estudio, sirviendo como referencia para experimentos similares.
- Enseñanza de implementación de transformers: el código fuente y los checkpoints pueden usarse como material didáctico para aprender a implementar transformers desde cero en PyTorch.
- Análisis de cifrados simples: la configuración C2 demuestra que un transformer puede resolver cifrados XOR de repetición de clave cuando se le proporciona información posicional adecuada, útil en contextos educativos de criptografía.
- Evaluación de arquitecturas eficientes: C5 (BLT) muestra cómo el procesamiento por parches puede reducir el coste computacional (39 s/época frente a 85 s de C1) y el pico de memoria GPU (1.207 MB frente a 2.615 MB).
- Desarrollo de modelos con restricciones de hardware: el entrenamiento en una RTX 3060 Laptop de 6 GB demuestra la viabilidad de investigar arquitecturas transformer con recursos limitados.

## Benchmarks y rendimiento

Los resultados se obtuvieron con decodificación greedy sobre el conjunto de test de 500 ejemplos. La precisión de bits es la métrica principal, independiente del tokenizador. El valor de pérdida de C5 es por byte, no directamente comparable con C1-C4.

| Config | Bit Acc ↑ | Seq Acc ↑ | Levenshtein ↓ | BLEU ↑ | ROUGE-1 ↑ | ROUGE-L ↑ | Val loss ↓ | Params |
|---|---|---|---|---|---|---|---|---|
| C1 base | 0.800 | 0.028 | 18.1 | 70.2 | 0.861 | 0.860 | 0.172 | 7.47M |
| C2 RoPE | 0.989 | 0.850 | 0.28 | 99.4 | 0.993 | 0.993 | 0.0016 | 7.47M |
| C3 GQA | 0.763 | 0.0 | 45.9 | 46.7 | 0.733 | 0.730 | 0.260 | 6.29M |
| C4 RMSNorm | 0.805 | 0.038 | 11.8 | 77.9 | 0.898 | 0.898 | 0.109 | 7.47M |
| C5 BLT | 0.971 | 0.002 | 24.2 | n/a | n/a | n/a | 0.106* | 8.80M |

*La pérdida de C5 es por byte, no por subpalabra.

Eficiencia:

| Config | s/epoch ↓ | Train tokens/s ↑ | Peak GPU mem (MB) ↓ | Greedy decode 500 ex. (s) ↓ |
|---|---|---|---|---|
| C1 base | 85.4 | 16,589 | 2,615 | 451 |
| C2 RoPE | 88.8 | 15,963 | 2,611 | 487 |
| C3 GQA | 80.7 | 17,550 | 2,601 | 416 |
| C4 RMSNorm | 83.2 | 17,026 | 2,538 | 449 |
| C5 BLT | 39.0 | 42,035 (bytes) | 1,207 | 293 |

## Requisitos de hardware

- VRAM estimada para inferencia: los picos de memoria durante el entrenamiento fueron de 2.615 MB (C1), 2.611 MB (C2), 2.601 MB (C3), 2.538 MB (C4) y 1.207 MB (C5). La inferencia requerirá menos memoria, probablemente por debajo de 2 GB para las configuraciones C1-C4 y por debajo de 1 GB para C5.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM será suficiente. El entrenamiento se realizó en una RTX 3060 Laptop de 6 GB.
- Compatibilidad con GPU consumer: sí, cabe en GPUs consumer de gama media como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar directamente en cualquier framework que soporte PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la decodificación greedy de 500 ejemplos tardó entre 293 s (C5) y 487 s (C2), lo que supone una media de 0.6-1.0 s por ejemplo en la GPU de entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio. Sin embargo, la comparación interna entre configuraciones es reveladora:

| Configuracion | Parametros | Precision de secuencia | BLEU | s/epoch | Pico memoria GPU |
|---|---|---|---|---|---|
| C1 (base) | 7.47M | 2.8% | 70.2 | 85.4 | 2.615 MB |
| C2 (RoPE) | 7.47M | 85.0% | 99.4 | 88.8 | 2.611 MB |
| C3 (GQA) | 6.29M | 0.0% | 46.7 | 80.7 | 2.601 MB |
| C4 (RMSNorm) | 7.47M | 3.8% | 77.9 | 83.2 | 2.538 MB |
| C5 (BLT) | 8.80M | 0.2% | n/a | 39.0 | 1.207 MB |

La sustitución de la codificación posicional sinusoidal por RoPE (C2) es la modificación más impactante, mejorando la precisión de secuencia de 2.8% a 85%. La reducción de cabezas KV en GQA (C3) degrada significativamente el rendimiento, sugiriendo que la capacidad de atención completa es necesaria para esta tarea. La arquitectura BLT (C5) ofrece la mejor eficiencia computacional pero una precisión de secuencia muy baja, indicando que el enfoque de parches pierde la alineación posicional fina necesaria.

## Limitaciones y advertencias

- Modelo académico: es un checkpoint de una tarea de curso, no un modelo listo para producción. No se proporciona licencia, por lo que el uso comercial no está autorizado explícitamente.
- Tarea específica: el modelo está entrenado exclusivamente para descifrar el cifrado XOR con clave `ANLP2026` sobre el dataset Brown. No generaliza a otros cifrados o dominios.
- Dataset pequeño: el entrenamiento se realizó con solo 4.000 ejemplos, lo que limita la robustez y la capacidad de generalización.
- Sin alineación posicional en C5: la arquitectura BLT (C5) tiene una precisión de secuencia del 0.2%, lo que indica que no resuelve la tarea de forma fiable.
- Sesgos del dataset: el texto plano proviene del corpus Brown, que tiene sesgos de género, dominio y época.
- Riesgo de alucinación: como modelo generativo, puede producir texto plausible pero incorrecto, especialmente en configuraciones con baja precisión (C3).
- Sin soporte para herramientas: no implementa tool calling ni capacidades de agente.
- Sin información de licencia: la ausencia de licencia en el repositorio impide su uso comercial sin autorización explícita del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yajat31/anlp-a1-checkpoints
- Repositorio relacionado (misma asignatura): https://huggingface.co/yharith/anlp-a1-transformer-ablation
- Repositorio relacionado (misma asignatura): https://huggingface.co/avi1o1/anlp-a1
- Repositorio GitHub relacionado: https://github.com/JainitBITW/ANLP-A1
