# xmattwest/Gemma-4-31B-Loop-Compact

## Resumen

Gemma-4-31B-Loop-Compact es un paquete de adaptadores publicado por Matt West (xmattwest) sobre el modelo denso `google/gemma-4-31B-it` de Google. No se trata de un modelo entrenado desde cero, sino de una retrofijación (retrofit) que introduce recurrencia en profundidad sobre un transformer denso congelado: se reutilizan las capas L24 a L42 en múltiples pasadas (K = 1 a 4) mediante un puente de rotación ortogonal de 5376 x 5376 calculado en forma cerrada con SVD Orthogonal Procrustes. El objetivo es habilitar razonamiento multi-paso latente sin generar tokens de cadena de pensamiento (`0-CoT`).

El problema técnico que aborda es concreto: al intentar reconectar la salida de la capa 42 con la entrada de la capa 24, los estados residuales quedan casi ortogonales (coseno +0.0514, unos 87.1 grados), de modo que el bucle ingenuo inyecta señal desalineada y provoca una deriva KL de 0.3626 nats. La rotación Procrustes corrige esa geometría y reduce la deriva un 84% (hasta 0.0581 nats) sin ningún paso de gradiente.

Además del puente, el paquete incluye compresión Hourglass con cuantización INT4/INT8 y poda del 25% del ancho de las MLP externas, que reduce el modelo base de 62.55 GB a 23.08 GB, permitiendo su despliegue en una única GPU de 24 GB. La licencia del paquete es MIT, aunque el modelo base subyacente queda sujeto a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con recurrencia en profundidad retrofijada (looped-transformer sobre L24..L42), puente Orthogonal Procrustes |
| Parametros totales | No disponible de forma explícita (modelo base Gemma 4 31B; paquete de adaptadores de 0.4 GB en repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 e INT8 (compresión Hourglass), pesos base BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (paquete); modelo base sujeto a licencia Gemma 4 de Google |
| Formato de pesos | PyTorch (`pytorch`, `library_name: pytorch`); puente Procrustes de 416 MB y adaptadores Loop-LoRA |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer denso estándar (`d_model = 5376`) al que se le añade un bucle recurrente sobre el bloque L24..L42. La innovación central es el puente Orthogonal Procrustes: una matriz de rotación R0 = U V^T de 5376 x 5376 obtenida por SVD en forma cerrada, sin pasos de gradiente, que alinea los estados de salida del bucle (H_out[42]) con los de entrada (H_in[24]). Esto eleva la alineación coseno cruzada 16 veces hasta +0.8326. Se complementa con anclaje de skip states en la primera pasada para contrarrestar la atenuación por `layer_scalar` (mediana 0.824) de Gemma 4.

El entrenamiento se limita a 12.5 minutos de auto-destilación `<thought>`-a-latente mediante Loop-LoRA sobre K = 1..4 pasadas, manteniendo el 100% de los pesos base congelados. La compresión Hourglass combina cuantización INT4/INT8 con poda del 25% del ancho de las MLP externas preservando el embudo de neuronas importantes. El paquete incluye además una cabeza de parada adaptativa en L42 y una proyección ortogonal de subespacio moral (`R_safe = R_proc · P_perp`) que se pliega en el puente con cero FLOPs adicionales en tiempo de ejecución.

## Capacidades

- Generación de texto en inglés con razonamiento multi-paso latente sin tokens de cadena de pensamiento (`0-CoT`, modo `no_think`).
- Razonamiento multi-salto (3, 5 y 7 saltos) mediante recurrencia en profundidad controlada por K (1 a 4 pasadas).
- Razonamiento latente silencioso: la auto-destilación transfiere trazas `<thought>` a estados latentes.
- Control de recurrencia adaptativa mediante cabeza de parada en L42 (`adaptive=True/False`).
- Razonamiento aritmético y de seguimiento de estado (evaluado en tareas de saldo y probabilidad de palabra).
- Alineación de subespacio moral/afectivo con `apply_safety_fold` (proyección ortogonal sin coste computacional).
- Capacidades del modelo base Gemma 4 31B-it heredadas (no detalladas en la información disponible).
- Soporte de tool calling, function calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento multi-paso en producción con presupuesto de tokens cero: el modelo resuelve tareas de 3 a 7 saltos sin emitir cadena de pensamiento, lo que reduce latencia y coste frente a modelos que generan CoT explícita.
- Despliegue en una única GPU de 24 GB: la compresión Hourglass (62.55 GB a 23.08 GB) permite servir un modelo de 31B en hardware consumer de gama alta (RTX 4090, RTX 3090) o en instancias A10/L4 de 24 GB.
- Investigación en interpretabilidad mecanicista: el puente Procrustes y los adaptadores Loop-LoRA indexados por paso permiten estudiar cómo evolucionan los estados latentes a través de las pasadas K.
- Alineación y seguridad sin coste de inferencia: `apply_safety_fold(active=True)` pliega una proyección ortogonal de subespacio moral en el puente con 0.0% de pérdida de precisión multi-salto, útil para pipelines que requieren filtrado de contenido sin FLOPs extra.
- Seguimiento de estado y aritmética simbólica: tareas de saldo a 0% de préstamo (93.8% con K=4) y probabilidad de palabra (22.9% con K=4), adecuadas para agentes que mantienen contadores o estados numéricos.
- Experimentación con recurrencia en profundidad sobre modelos congelados: sirve como referencia reproducible para investigar bucles recurrentes en transformers densos sin reentrenar el modelo base.
- Evaluación comparativa de técnicas de compresión: las condiciones Uniform-Compact y Hourglass-Compact del scorecard permiten comparar poda plana frente a poda con embudo protegido.

## Benchmarks y rendimiento

Evaluaciones con cero tokens `<thought>` (0-CoT) sobre suites held-out:

| Condición (0 CoT) | VRAM / Tamaño | Loops K | KL held-out (nats) | 3-Hop | 5-Hop | 7-Hop (no visto) | Multi-Hop (n=128) | Saldo 0% (n=48) | Prob. palabra (n=48) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| google/gemma-4-31B-it (BF16, 1 pasada) | 62.55 GB | 1 | 0.0000 | 3.1% | 0.0% | 0.0% | 0.8% | 0.0% | 0.0% |
| Uniform-Compact (poda plana 0-shot) | 22.18 GB | 1 | 0.5320 | 3.1% | 0.0% | 0.0% | 0.8% | 0.0% | 0.0% |
| Hourglass-Compact (embudo protegido 0-shot) | 22.77 GB | 1 | 0.5075 | 3.1% | 0.0% | 0.0% | 0.8% | 0.0% | 0.0% |
| Gemma-4-Loop-Compact (K=1) | 23.08 GB | 1 | 0.4565 | 43.8% | 3.1% | 3.1% | 12.5% | 91.7% | 14.6% |
| Gemma-4-Loop-Compact (K=2) | 23.08 GB | 2 | 0.5274 | 71.9% | 18.8% | 9.4% | 25.8% (32x) | 83.3% | 6.2% |
| Gemma-4-Loop-Compact (K=4) | 23.08 GB | 4 | 0.5423 | 68.8% | 15.6% | 12.5% | 24.2% | 93.8% | 22.9% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23.3 GB con la compresión Hourglass INT4/INT8 (frente a 62.55 GB del modelo base en BF16).
- GPU recomendadas: una única GPU de 24 GB (RTX 4090, RTX 3090, A10, L4). Para el modelo base sin comprimir se necesitarían GPUs de 80 GB (A100, H100).
- Cabe en GPU consumer: sí, en RTX 4090 y RTX 3090 de 24 GB, según el autor.
- Opciones de despliegue: el paquete se carga mediante `load_gemma4_loop_compact` del repositorio `xmattwest/afriat` (instalación `pip install -e ".[gpu]"`), con `device_map="cuda"`. Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Compresión / VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-Loop-Compact | Base 31B (adaptadores 0.4 GB) | No disponible | INT4/INT8, 23.08 GB | MIT (paquete) | Hugging Face (xmattwest) |
| google/gemma-4-31B-it | 31B | No disponible | BF16, 62.55 GB | Gemma 4 (Google) | Hugging Face (google) |
| Uniform-Compact (variante del mismo autor) | Base 31B | No disponible | Poda plana, 22.18 GB | MIT | Referencia interna del scorecard |
| Hourglass-Compact (variante del mismo autor) | Base 31B | No disponible | Embudo protegido, 22.77 GB | MIT | Referencia interna del scorecard |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se declaran capacidades multilingües.
- La licencia MIT cubre el paquete de adaptadores, pero el modelo base `google/gemma-4-31B-it` requiere aceptar la licencia de Gemma 4 de Google, con posibles restricciones de uso comercial.
- El rendimiento absoluto en las tareas evaluadas es bajo en términos brutos (por ejemplo, 25.8% en multi-hop agregado con K=2, 22.9% en probabilidad de palabra con K=4), aunque supone una mejora de hasta 32x sobre el modelo base sin bucle.
- La deriva KL aumenta con K (0.4565 con K=1, 0.5423 con K=4), lo que indica que más pasadas no mejoran monótonamente todas las métricas.
- El modelo base congelado y la auto-destilación de solo 12.5 minutos sugieren un ajuste limitado; no hay datos de robustez fuera de las suites evaluadas.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente.
- La carga requiere el repositorio `afriat` y una función de carga específica (`load_gemma4_loop_compact`), lo que limita la portabilidad a stacks estándar.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/xmattwest/Gemma-4-31B-Loop-Compact
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio GitHub: https://github.com/xmattwest/afriat
- Monografía "Rotating the Bottleneck": https://shelltoho.me/pubs/rotating-the-bottleneck/
- Publicación relacionada "Money is Moral" (Parte 1): https://shelltoho.me/pubs/money-is-moral/
- Resultados en bruto (phase9_loop_compact): https://github.com/xmattwest/afriat/tree/pubs/rotating-the-bottleneck/results/phase9_loop_compact
- Perfil del autor: https://shelltoho.me/
- Google Scholar: https://scholar.google.com/citations?user=khPjLQcAAAAJ&hl=en
- GitHub del autor: https://github.com/xmattwest
- Hugging Face del autor: https://huggingface.co/mattyxcakes
- ORCID: https://orcid.org/0009-0008-5557-9394
- DOI: https://doi.org/10.5281/zenodo.24419425
- Dataset citado: mattyxcakes/afriat-bench
