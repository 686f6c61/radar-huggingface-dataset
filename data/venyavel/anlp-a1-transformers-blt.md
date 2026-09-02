# VenyaVel/anlp-a1-transformers-blt

## Resumen

Este repositorio contiene los checkpoints de un estudio de ablación arquitectónica sobre transformers, desarrollado como parte de la asignatura Advanced NLP (ANLP) del IIIT-Hyderabad. El autor, VenyaVel, entrena desde cero cinco configuraciones de un modelo encoder-decoder (sin usar `nn.Transformer` ni `nn.MultiheadAttention`) para una tarea de secuencia a secuencia: convertir una secuencia binaria cifrada (bits `0`/`1`, un byte por carácter) en la frase en inglés correspondiente. Los datos provienen del corpus Brown, con 5.000 pares alineados y ventanas de 1024 bits (128 caracteres).

La relevancia de este trabajo radica en que compara sistemáticamente el impacto de cuatro componentes arquitectónicos (codificación posicional, mecanismo de atención, normalización y tokenización) sobre el rendimiento en una tarea controlada. La configuración C5, basada en Byte Latent Transformer (BLT), alcanza una precisión perfecta en el conjunto de test, mientras que las variantes con tokenización BPE subword se quedan en torno al 21% de precisión de secuencia completa. El repositorio incluye los tokenizers BPE propios y los pesos en formato PyTorch `state_dict`, pero no el código fuente del modelo, que se entregó por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (variantes: MHA, GQA, RoPE, RMSNorm, BLT) |
| Parametros totales | no disponible (dim=512, 4 capas, 16 cabezas, ff_dim=1024) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_seq_len=200 tokens (entrada: ventanas de 1024 bits) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | ingles (texto plano del corpus Brown) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo base (C1) es un transformer encoder-decoder con atención multi-cabeza (MHA), codificación posicional sinusoidal, LayerNorm y tokenización BPE subword creada desde cero. Las configuraciones C2, C3 y C4 alteran un único componente respecto a C1: RoPE en lugar de sinusoidal, Grouped-Query Attention con 4 cabezas KV, y RMSNorm en lugar de LayerNorm, respectivamente. La configuración C5 sustituye la tokenización por un enfoque token-free a nivel de byte, siguiendo la arquitectura Byte Latent Transformer (BLT) con parches de tamaño fijo 4 bytes.

El entrenamiento se realizó sobre 5.000 pares línea-alineados del corpus Brown, divididos en train/val/test (90/5/5) a nivel de línea para evitar fuga de datos. Cada línea se troceó en ventanas no solapadas de 1024 bits (128 caracteres). Se usó un optimizador con lr=3e-4, batch_size=64, label_smoothing=0.05, hasta 200 épocas con early stopping (patience=50). Los resultados se evaluaron con decodificación greedy, reportando tanto precisión por ventana como precisión de secuencia completa reensamblada.

## Capacidades

- Generacion de texto: convierte secuencias binarias cifradas en frases en ingles (tarea especifica de descifrado).
- Razonamiento: no aplica fuera de la tarea de mapeo secuencia a secuencia.
- Codigo: no soportado.
- Matematicas: no soportado.
- Vision: no soportado.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingue: no, solo ingles.
- Capacidades especiales: la configuracion C5 (BLT) demuestra una precision perfecta en la tarea, lo que sugiere que el enfoque byte-level con parches puede ser superior a la tokenizacion BPE para este tipo de tareas.

## Casos de uso

- Investigacion academica en arquitecturas de transformers: el repositorio sirve como referencia para estudiar el impacto de RoPE, GQA, RMSNorm y BLT en una tarea controlada. Los checkpoints permiten reproducir los experimentos y analizar las diferencias de rendimiento.
- Evaluacion de tecnicas de tokenizacion: comparar BPE subword frente a BLT (byte-level con parches) en tareas de secuencia a secuencia con datos binarios. El resultado de C5 (accuracy 1.0) es un dato relevante para quienes investigan alternativas a la tokenizacion clasica.
- Desarrollo de modelos de descifrado: aunque el alcance es limitado, la tarea de mapear binario a texto puede extrapolarse a aplicaciones de reconstruccion de datos o protocolos de comunicacion.
- Estudio de ablaciones: las cinco configuraciones permiten aislar el efecto de cada componente (PE, atencion, normalizacion, tokenizacion) sobre la convergencia y la precision final.
- Practica docente: el repositorio es un ejemplo completo de entrenamiento de transformers desde cero, con tokenizers propios y registro de experimentos en W&B, util para cursos de NLP avanzado.
- Comparacion de metricas: los resultados reportados (bit-level accuracy, sequence accuracy, Levenshtein, BLEU, ROUGE-L) ofrecen un conjunto de referencia para evaluar otros modelos en la misma tarea.

## Benchmarks y rendimiento

Los resultados del conjunto de test (n=250 lineas para secuencia completa, n=1308 ventanas) son los siguientes:

| Config | Bit-Level Acc (sec.) | Sequence Acc (sec.) | Levenshtein (sec.) | BLEU (sec.) | ROUGE-L (sec.) |
|---|---|---|---|---|---|
| C1 | 0.8498 | 0.216 | 2.216 | 0.9439 | 0.9762 |
| C2 | 0.8515 | 0.216 | 2.576 | 0.9441 | 0.9756 |
| C3 | 0.8520 | 0.212 | 2.384 | 0.9425 | 0.9753 |
| C4 | 0.8438 | 0.208 | 2.304 | 0.9434 | 0.9755 |
| C5 | 1.0000 | 1.000 | 0.000 | 1.0000 | 1.0000 |

| Config | Bit-Level Acc (ventana) | Sequence Acc (ventana) | Levenshtein (ventana) | BLEU (ventana) | ROUGE-L (ventana) |
|---|---|---|---|---|---|
| C1 | 0.9909 | 0.9144 | 0.162 | 0.9712 | 0.9951 |
| C2 | 0.9926 | 0.9098 | 0.231 | 0.9707 | 0.9949 |
| C3 | 0.9907 | 0.8998 | 0.194 | 0.9694 | 0.9944 |
| C4 | 0.9879 | 0.9014 | 0.179 | 0.9698 | 0.9934 |
| C5 | 1.0000 | 1.0000 | 0.000 | 0.9826 | 1.0000 |

No se han publicado comparaciones con otros modelos fuera de este estudio.

## Requisitos de hardware

- VRAM estimada: el modelo es pequeno (dim=512, 4 capas, vocab ~4096/2048). Los checkpoints ocupan 0.5 GB en total (los cinco). La inferencia de una configuracion individual requiere menos de 1 GB de VRAM en fp32.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., GTX 1050 Ti, RTX 2060) es suficiente. No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: si, todas las configuraciones caben en GPUs de gama baja.
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar con `torch.load` y ejecutar en cualquier entorno con PyTorch. No se proporcionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Dado el tamano, la inferencia es practicamente instantanea en CPU o GPU.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma tarea. Como referencia arquitectonica, el BLT original de Meta (paper arXiv:2412.09871) es la base de la configuracion C5, pero opera a una escala mucho mayor y con datos generales. Otros repositorios similares en HuggingFace (Viv0605101/anlp-a1-transformer-blt-ablation, ZappY-AI/anlp-a1) parecen ser variantes del mismo trabajo, pero no se han analizado sus contenidos.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Este repo (C1-C5) | no disponible | 200 tokens | Descifrado binario a texto | MIT |
| BLT (Meta) | 8B-13B (aprox.) | 4096+ | LLM general | CC-BY-NC 4.0 |
| Otros repos ANLP A1 | no disponible | no disponible | Misma tarea | no disponible |

## Limitaciones y advertencias

- Es un modelo de investigacion, no un LLM general. Solo es capaz de realizar la tarea especifica de mapear binario cifrado a texto en ingles.
- No se incluye el codigo fuente del modelo en el repositorio. Para cargar los checkpoints es necesario obtener los archivos `src/models/` del codigo de la asignatura, que no se publican aqui.
- Los resultados de C5 (accuracy perfecta) pueden deberse a la naturaleza de la tarea (mapeo deterministico 1:1) y no implican superioridad general de BLT frente a BPE en tareas de lenguaje natural.
- El conjunto de datos es pequeno (5.000 pares) y limitado al corpus Brown, por lo que no hay garantia de generalizacion a otros dominios o idiomas.
- No se reportan metricas de sesgo, alucinacion o robustez. Al ser un modelo de secuencia a secuencia puro, no genera texto libre fuera de la tarea.
- La licencia MIT permite uso comercial, pero el codigo fuente ausente limita su aplicabilidad practica.
- Los logs de entrenamiento estan en W&B, pero el acceso puede requerir permisos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VenyaVel/anlp-a1-transformers-blt
- Paper de BLT (Byte Latent Transformer): https://arxiv.org/abs/2412.09871
- Codigo oficial de BLT (Meta): https://github.com/facebookresearch/blt
- Repositorio similar (Viv0605101): https://huggingface.co/Viv0605101/anlp-a1-transformer-blt-ablation
- Repositorio similar (ZappY-AI): https://huggingface.co/ZappY-AI/anlp-a1
- Codigo del curso ANLP (CMU, referencia de transformers): https://github.com/cmu-l3/anlp-fall2025-code/tree/main/05_transformers
