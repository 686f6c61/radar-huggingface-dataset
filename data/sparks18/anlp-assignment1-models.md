# sparks18/anlp-assignment1-models

## Resumen

Este repositorio aloja los checkpoints de PyTorch, tokenizadores y resultados de evaluacion de cinco configuraciones arquitectonicas de transformadores (C1 a C5), desarrolladas por Sparsh Bhartia como parte de la asignatura Advanced Natural Language Processing (ANLP) en el International Institute of Information Technology, Hyderabad (IIIT-H). El objetivo del trabajo es descifrar texto cifrado con XOR periodico de 8 bits para recuperar texto plano en ingles.

Las cinco variantes incluyen un transformador seq2seq base con embeddings posicionales sinusoidales, una variante con Rotary Position Embedding (RoPE), una con Grouped-Query Attention (GQA), una con normalizacion RMSNorm y una implementacion de Byte Latent Transformer (BLT) con parcheado dinamico basado en entropia. El repositorio tiene fines academicos y de investigacion comparativa, no de produccion.

La relevancia del proyecto reside en su comparativa sistematica de modificaciones arquitectonicas sobre una tarea de criptografia sencilla, lo que permite aislar el impacto de cada innovacion (RoPE, GQA, RMSNorm, BLT) en un entorno controlado. El repositorio esta publicado bajo licencia MIT y el idioma soportado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq Transformer (5 variantes: base, RoPE, GQA, RMSNorm, BLT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | checkpoints de PyTorch (safetensors no confirmado) |

## Arquitectura y entrenamiento

El repositorio contiene cinco configuraciones arquitectonicas independientes, todas basadas en la familia seq2seq transformer:

- C1 (base): transformer seq2seq con embeddings posicionales sinusoidales, atencion multi-cabeza, LayerNorm y tokenizador BPE aprendido.
- C2 (RoPE): sustituye los embeddings posicionales sinusoidales por Rotary Position Embedding.
- C3 (GQA): emplea Grouped-Query Attention con 4 cabezas de consulta y 2 cabezas de clave/valor.
- C4 (RMSNorm): utiliza normalizacion Root Mean Square con pre-LayerNorm en lugar de LayerNorm estandar.
- C5 (BLT): implementa un Byte Latent Transformer con parcheado dinamico basado en un modelo de entropia de bytes de 3-gramas.

La tarea de entrenamiento consiste en descifrar texto cifrado con XOR periodico de 8 bits para reconstruir texto plano en ingles. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. El entrenamiento se registro en Weights & Biases bajo el proyecto sparsh-bhartia/anlp-a1-transformers.

## Capacidades

- Descifrado de texto cifrado con XOR periodico de 8 bits, devolviendo texto plano en ingles.
- Generacion de texto en ingles a partir de secuencias cifradas.
- Comparativa arquitectonica: permite evaluar el impacto relativo de RoPE, GQA, RMSNorm y BLT sobre una misma tarea.
- Tokenizacion BPE aprendida tanto para texto cifrado como para texto plano.
- Parcheado dinamico basado en entropia de bytes (solo en la variante C5).
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion academica en arquitecturas de transformadores: el repositorio permite reproducir y comparar el efecto de RoPE, GQA, RMSNorm y BLT sobre una tarea de secuencia a secuencia, util para estudiantes e investigadores que estudian estas tecnicas de forma aislada.
- Educacion en criptografia con aprendizaje automatico: el modelo demuestra como un transformer puede aprender a descifrar un cifrado XOR periodico, sirviendo como ejemplo didactico de criptanalisis basado en ML.
- Evaluacion de tecnicas de posicionamiento: la comparativa C1 frente a C2 permite medir cuantitativamente la ventaja de RoPE sobre embeddings sinusoidales en una tarea de descifrado.
- Estudio de eficiencia de atencion: la variante C3 (GQA) permite analizar el compromiso entre numero de cabezas de clave/valor y calidad de descifrado.
- Analisis de normalizacion: la variante C4 (RMSNorm) facilita el estudio del impacto de la normalizacion en la estabilidad del entrenamiento y la convergencia.
- Investigacion en tokenizacion a nivel de byte: la variante C5 (BLT) sirve como punto de partida para explorar el parcheado dinamico basado en entropia en tareas de cifrado y descifrado.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados en la model card del repositorio, evaluados sobre la tarea de descifrado de XOR periodico de 8 bits:

| Modelo | Bit-Acc (%) | Seq-Acc (%) | Lev Dist | BLEU-4 | ROUGE-L |
| :--- | :---: | :---: | :---: | :---: | :---: |
| C1 (base) | 98,42 | 74,80 | 4,12 | 86,45 | 91,20 |
| C2 (RoPE) | 99,15 | 81,20 | 2,45 | 89,78 | 93,65 |
| C3 (GQA) | 98,10 | 72,40 | 4,88 | 85,12 | 90,45 |
| C4 (RMSNorm) | 98,50 | 75,60 | 3,95 | 86,90 | 91,55 |
| C5 (BLT dinamico) | 97,85 | 68,40 | 5,62 | 81,30 | 87,40 |

La variante C2 (RoPE) obtiene los mejores resultados en todas las metricas, con un 99,15 % de precision a nivel de bit y un 81,20 % a nivel de secuencia. La variante C5 (BLT) es la que peor rendimiento presenta, con un 97,85 % de precision de bit y un 68,40 % de precision de secuencia. No se han publicado resultados comparativos con modelos externos.

## Requisitos de hardware

- No se dispone de informacion sobre el numero de parametros de cada variante, por lo que no es posible estimar la VRAM necesaria para inferencia.
- El tamano del repositorio es de 0,0 GB, lo que sugiere que los checkpoints pueden no estar completamente subidos o que los modelos son de tamano muy reducido, tipico de una asignatura academica.
- No se documentan requisitos de GPU especificos ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado el caracter academico del proyecto, es probable que los modelos quepan en GPUs de consumo, pero este dato no se confirma en la informacion disponible.

## Comparativa con modelos similares

No se dispone de modelos externos comparables publicados para la tarea especifica de descifrado de XOR periodico con transformadores. No obstante, la comparativa interna entre las cinco variantes del repositorio permite evaluar el impacto relativo de cada modificacion arquitectonica:

| Variante | Innovacion | Bit-Acc (%) | Seq-Acc (%) | BLEU-4 |
| :--- | :--- | :---: | :---: | :---: |
| C1 | Base (sinusoidal, MHA, LayerNorm) | 98,42 | 74,80 | 86,45 |
| C2 | RoPE | 99,15 | 81,20 | 89,78 |
| C3 | GQA (H_Q=4, H_KV=2) | 98,10 | 72,40 | 85,12 |
| C4 | RMSNorm pre-LN | 98,50 | 75,60 | 86,90 |
| C5 | BLT con parcheado dinamico | 97,85 | 68,40 | 81,30 |

## Limitaciones y advertencias

- Se trata de un repositorio academico de una asignatura, no de un modelo listo para produccion.
- La tarea esta restringida a un cifrado XOR periodico de 8 bits, un escenario muy limitado que no generaliza a otros tipos de cifrado o tareas de NLP.
- El tamano del repositorio es de 0,0 GB, lo que indica que los checkpoints pueden no estar disponibles o ser de tamano despreciable; es posible que el repositorio contenga solo la documentacion y los resultados.
- No se publican datos sobre el numero de parametros, la longitud de contexto ni el dataset de entrenamiento, lo que dificulta la reproducibilidad completa.
- No se documentan sesgos especificos, pero al tratarse de un modelo entrenado exclusivamente para descifrar un cifrado concreto, no es adecuado para tareas generativas generales.
- La licencia MIT permite uso comercial, pero la ausencia de pesos completos verificables limita su aplicabilidad practica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sparks18/anlp-assignment1-models
- Proyecto Weights & Biases: https://wandb.ai/sparsh-bhartia/anlp-a1-transformers
- Perfil del autor en HuggingFace: https://huggingface.co/sparks18
