# yharith/anlp-a1-transformer-ablation

## Resumen

El modelo `yharith/anlp-a1-transformer-ablation` es un conjunto de cinco transformadores encoder-decoder entrenados desde cero para descifrar secuencias binarias cifradas a texto plano. Cada configuración (C1 a C5) modifica exactamente un componente arquitectónico: codificación posicional (sinusoidal vs. RoPE), atención (MHA vs. GQA), normalización (LayerNorm vs. RMSNorm) y tokenización (BPE subword vs. BLT token-free). El objetivo es aislar el impacto de cada componente sobre la calidad, la velocidad y el consumo de memoria, en un contexto de tarea de descifrado.

Desarrollado por yharith como parte de una asignación de Procesamiento de Lenguaje Natural Avanzado (ANLP), el modelo está implementado íntegramente con operaciones básicas de PyTorch, sin dependencias de librerías de alto nivel. Los tamaños oscilan entre 3,47 millones de parámetros (C5) y 12,49 millones (C1-C4), con una arquitectura base de 4 capas, 8 cabezas de atención y dimensión de modelo 256. La licencia MIT permite uso libre, incluido comercial.

La relevancia de este modelo reside en su naturaleza de estudio de ablación controlada: permite comparar de forma rigurosa alternativas como RoPE frente a sinusoidales, GQA frente a MHA, o BLT frente a BPE, con métricas de calidad y eficiencia sobre una misma tarea. Es útil para investigadores y desarrolladores que quieran entender empíricamente las ventajas y desventajas de cada componente antes de aplicarlos en modelos más grandes.

## Especificaciones técnicas

| Parametro | C1 (base) | C2 (RoPE) | C3 (GQA) | C4 (RMSNorm) | C5 (BLT) |
|---|---|---|---|---|---|
| Arquitectura | Transformer encoder-decoder (sinusoidal + MHA + LayerNorm + BPE) | Transformer encoder-decoder (RoPE + MHA + LayerNorm + BPE) | Transformer encoder-decoder (sinusoidal + GQA + LayerNorm + BPE) | Transformer encoder-decoder (sinusoidal + MHA + RMSNorm + BPE) | Transformer encoder-decoder (sinusoidal + MHA + LayerNorm + BLT) |
| Parametros totales | 12.489.536 | 12.489.536 | 11.309.888 | 12.483.904 | 3.470.916 |
| Parametros activos | no aplica (no es MoE) | no aplica (no es MoE) | no aplica (no es MoE) | no aplica (no es MoE) | no aplica (no es MoE) |
| Longitud de contexto | no disponible | no disponible | no disponible | no disponible | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión completa) | no disponible (pesos en precisión completa) | no disponible (pesos en precisión completa) | no disponible (pesos en precisión completa) | no disponible (pesos en precisión completa) |
| Idiomas soportados | no disponible (tarea sobre texto en inglés implícito) | no disponible (tarea sobre texto en inglés implícito) | no disponible (tarea sobre texto en inglés implícito) | no disponible (tarea sobre texto en inglés implícito) | no disponible (tarea sobre texto en inglés implícito) |
| Licencia | MIT | MIT | MIT | MIT | MIT |
| Formato de pesos | PyTorch (checkpoints .pt) | PyTorch (checkpoints .pt) | PyTorch (checkpoints .pt) | PyTorch (checkpoints .pt) | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

Los cinco modelos comparten la misma arquitectura base: un transformer encoder-decoder con `d_model=256`, `n_heads=8`, `n_layers=4`, `d_ff=1024`, dropout 0.1, y entrenados con los mismos hiperparámetros (lr=0.0003, batch_size=64, 40 épocas, warmup 5%, label smoothing 0.1, grad clip 1.0, weight decay 0.01). La única diferencia entre configuraciones es el componente ablacionado, tal como se indica en la tabla de especificaciones.

La tarea consiste en mapear secuencias binarias cifradas a texto plano en inglés. Los datos de entrenamiento no se detallan en la model card, pero se menciona que se utilizan tokenizadores BPE a nivel de byte para C1-C4 (vocabularios de 4000 y 8000 tokens para entrada y salida respectivamente) y un enfoque BLT (Byte Latent Transformer) sin vocabulario para C5, con `patch_size=8`, `d_local=64`, `n_local_layers=2` y `n_local_heads=4`. Todos los módulos (atención escalada por producto punto, MHA, GQA, sinusoidales, RoPE, LayerNorm, RMSNorm y el codificador/decodificador local de BLT) están implementados desde operaciones básicas de PyTorch.

Una advertencia importante de la model card es que la pérdida (loss) no es comparable entre C5 y C1-C4, porque C5 predice sobre 260 bytes mientras que los demás predicen sobre 8000 subword tokens. Las métricas de nivel de tarea (precisión de secuencia, distancia de Levenshtein) sí son comparables entre todas las configuraciones.

## Capacidades

- Descifrado de secuencias binarias cifradas a texto plano en inglés, con precisión de bit superior al 90% en todas las configuraciones (C5 alcanza 97,18%).
- Generación de secuencias de longitud exacta: C5 acierta la longitud en el 98,0% de los casos, frente al 34,8-62,0% de los modelos subword.
- Implementación de múltiples variantes arquitectónicas en un solo paquete: permite comparar RoPE vs. sinusoidal, GQA vs. MHA, RMSNorm vs. LayerNorm y BLT vs. BPE con un solo cambio controlado.
- Entrenamiento e inferencia eficientes en memoria: el pico de memoria en entrenamiento es de 1,6 GB para C1-C4 y solo 298 MB para C5; en inferencia, entre 68 y 291 MB.
- Compatibilidad con PyTorch estándar: los checkpoints se cargan con `torch.load` y el modelo se construye con la función `build_model` proporcionada.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni soporte multilingüe; es un modelo de tarea única.

## Casos de uso

- Investigación en ablaciones de arquitecturas transformer: permite aislar el efecto de cada componente (posicional, atención, normalización, tokenización) sobre métricas de calidad y eficiencia, ideal para papers o estudios comparativos.
- Enseñanza de aprendizaje automático: como material didáctico para explicar cómo afectan RoPE, GQA, RMSNorm o BLT al rendimiento de un transformer, con resultados numéricos y código reproducible.
- Evaluación de técnicas de tokenización: comparar BPE subword frente a BLT token-free en una tarea de secuencia a secuencia, observando las diferencias en precisión de secuencia y longitud de salida.
- Benchmark de eficiencia en hardware modesto: al requerir menos de 2 GB de VRAM para entrenar, sirve para probar pipelines de entrenamiento en GPUs de gama baja o en CPU.
- Prototipado de sistemas de descifrado: aunque limitado a la tarea concreta, puede servir como punto de partida para experimentos con cifrados más complejos, adaptando los hiperparámetros.
- Validación de implementaciones personalizadas: dado que todos los módulos están implementados desde cero, es útil para verificar implementaciones propias de atención, normalización o codificación posicional contra una referencia funcional.

## Benchmarks y rendimiento

La model card incluye resultados de calidad y eficiencia para las cinco configuraciones. No se proporcionan comparaciones con otros modelos externos.

### Calidad (test set, greedy decoding)

| Config | Params | Val loss | Bit acc | Seq acc | Lev | Len exact | BLEU | ROUGE-L |
|---|---|---|---|---|---|---|---|---|
| C1 base | 12.489.536 | 1.7948 | 0.9038 | 0.3774 | 2.72 | 0.5562 | 79.64 | 0.8936 |
| C2 RoPE | 12.489.536 | 1.7541 | 0.9160 | 0.4149 | 2.36 | 0.6143 | 81.77 | 0.9045 |
| C3 GQA | 11.309.888 | 1.8789 | 0.8892 | 0.3189 | 3.34 | 0.5013 | 76.59 | 0.8758 |
| C4 RMSNorm | 12.483.904 | 1.7886 | 0.9061 | 0.3788 | 2.68 | 0.5662 | 80.00 | 0.8943 |
| C5 BLT | 3.470.916 | 1.0911 | 0.9718 | 0.0879 | 4.65 | 0.9800 | - | - |

### Baselines de precisión de bit

| Baseline | Bit acc |
|---|---|
| const_e | 0.7287 |
| const_space | 0.6619 |
| random_letters | 0.6125 |
| empty | 0.0000 |

### Eficiencia

| Config | s/epoch | Train peak MB | Decode ms/seq | Decode peak MB |
|---|---|---|---|---|
| C1 base | 69.9 | 1629 | 53.75 | 255 |
| C2 RoPE | 49.9 | 1629 | 4.17 | 291 |
| C3 GQA | 33.0 | 1614 | 6.25 | 241 |
| C4 RMSNorm | 49.7 | 1548 | 4.14 | 247 |
| C5 BLT | 38.9 | 298 | 8.36 | 68 |

Nota: la model card advierte que la precisión de bit tiene un suelo alto (0.729 para cualquier secuencia de letras de la longitud correcta) y que la pérdida no es comparable entre C5 y C1-C4. La precisión de secuencia y la distancia de Levenshtein son las métricas que discriminan realmente entre modelos.

## Requisitos de hardware

- Entrenamiento: pico de memoria entre 1,5 y 1,7 GB para C1-C4, y solo 298 MB para C5. Cualquier GPU consumer con al menos 2 GB de VRAM puede entrenar estos modelos. También es viable en CPU, aunque los tiempos por época (33-70 segundos) sugieren que una GPU acelera el proceso.
- Inferencia: pico de memoria entre 68 y 291 MB, y tiempo de decodificación entre 4 y 54 ms por secuencia según la configuración. Esto permite ejecutar inferencia en dispositivos de gama baja, incluidos portátiles sin GPU.
- GPUs recomendadas: no se especifican modelos concretos, pero por los requisitos de memoria, cualquier GPU con 2 GB o más (GTX 1050 Ti, RTX 2060, etc.) es suficiente. Para entrenamiento más rápido, una GPU con 4 GB o más (RTX 3060, A100) reduce el tiempo por época.
- Opciones de despliegue: el modelo se entrega como checkpoints de PyTorch, por lo que se puede cargar directamente con `torch.load` y ejecutar en cualquier entorno con PyTorch instalado. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo pequeño de investigación, el uso directo con PyTorch es la vía natural.
- Latencia y throughput: según la tabla de eficiencia, la decodificación por secuencia varía entre 4,14 ms (C4) y 53,75 ms (C1). No se proporciona throughput en secuencias por segundo, pero a partir de esos tiempos se puede estimar un rango de 18 a 240 secuencias por segundo en hardware adecuado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformers encoder-decoder para descifrado de cifrados con ablaciones). El propio modelo es un estudio de ablación, y no se han publicado resultados de benchmarks externos que permitan una comparación directa con alternativas como modelos de lenguaje generales o sistemas de descifrado específicos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La precisión de bit tiene un suelo alto (0.729) y no debe interpretarse como "porcentaje de caracteres correctos"; la precisión de secuencia y la distancia de Levenshtein son las métricas fiables.
- La pérdida (loss) no es comparable entre C5 y C1-C4 debido a los diferentes espacios de predicción (260 bytes vs. 8000 subword tokens); cualquier análisis basado en loss debe tenerlo en cuenta.
- C5, a pesar de su alta precisión de bit, tiene una precisión de secuencia muy baja (0.0879) por un efecto de alineación: un carácter insertado o eliminado desplaza todo lo posterior. Además, C5 no está igualado en capacidad (3,47M parámetros frente a 12,49M de C1), por lo que su rendimiento inferior en secuencia no es atribuible únicamente a la tokenización.
- El modelo está entrenado exclusivamente para la tarea de descifrado de secuencias binarias a texto plano; no es un modelo de lenguaje general y no debe usarse para generación de texto, razonamiento, código u otras tareas.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado en un dominio restringido, puede presentar sobreajuste a los patrones del cifrado utilizado.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantías de precisión ni soporte.
- No se especifica la longitud máxima de secuencia de entrada; los experimentos se realizaron con secuencias de longitud fija (implícita en la tarea), por lo que secuencias más largas podrían degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yharith/anlp-a1-transformer-ablation
- Registro de entrenamiento (WandB): https://wandb.ai/harith-yerragolam-iiit-hyderabad/anlp-a1-transformers
- Repositorio de código relacionado (FrenchKnuckles/ANLP_A1): https://github.com/FrenchKnuckles/ANLP_A1
