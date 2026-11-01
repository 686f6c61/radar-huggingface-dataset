# viai957/Goedel-Prover-V2-8B-EI-campaign1-r1

## Resumen

`viai957/Goedel-Prover-V2-8B-EI-campaign1-r1` es un ajuste fino (finetune) del modelo Goedel-Prover-V2-8B de Goedel-LM, especializado en demostración automática de teoremas en Lean 4. El autor, viai957, ha aplicado una ronda de *expert iteration* (iteración de experto) sobre las propias salidas del modelo: el modelo base genera demostraciones, el kernel de Lean 4 las verifica formalmente, y solo las demostraciones verificadas más cortas se usan como datos de entrenamiento supervisado. Los pesos resultantes se promediaron con los del modelo base original para estabilizar el resultado.

El modelo base, Goedel-Prover-V2-8B, es un modelo de generación de texto basado en la arquitectura Qwen3 con unos 8.190 millones de parámetros, orientado a la traducción de enunciados matemáticos en lenguaje natural a demostraciones formales en Lean 4. Este finetune conserva esa especialización y añade una capa de auto-mejora guiada por verificación formal.

Es relevante señalar que, según la propia model card, las comparaciones pareadas contra el modelo base sin entrenar **no muestran diferencia estadísticamente detectable** en rendimiento. El repositorio destaca, no obstante, por su trazabilidad metodológica: cada dato del proceso de entrenamiento (selección de enunciados, configuración de LoRA, promediado de pesos, regla de parada) está documentado en manifiestos con huellas criptográficas, un ejemplo de buena práctica de reproducibilidad en modelos de dominio específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (texto, causal) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en bf16/fp16, 16,4 GB en safetensors) |
| Idiomas soportados | no disponible (especializado en Lean 4 y matematicas formales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos, compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de `Goedel-LM/Goedel-Prover-V2-8B` (revision `dfd02e6271a58375dfbf3ece0175277cf6b6a89a`), un modelo de 8B basado en la familia Qwen3 orientado a la demostracion formal de teoremas en Lean 4. El ajuste fino se realizo mediante una ronda de *expert iteration*: se seleccionaron 300 enunciados de un pool decontaminado de 5.940 filas, el modelo base muestreo 8 demostraciones por enunciado con un limite de 16.384 tokens de generacion, y el kernel de Lean 4 verifico formalmente cada demostracion. Se conservaron un maximo de 4 demostraciones verificadas por enunciado, dando lugar a 442 filas de SFT (sobre 135 enunciados distintos) con un total de 1.642.463 tokens de completacion para entrenamiento.

El entrenamiento supervisado se realizo con LoRA de rango 64 y alpha 128,0 usando la configuracion `configs/p2_sft.toml`, y posteriormente los pesos de LoRA se fusionaron en el modelo base. Como paso final, el modelo fusionado se promedio con el modelo base original (peso 0,7 para el modelo ajustado, ancla en el original, 399 tensores promediados). La campana de alineamiento aplico una regla de parada con paciencia de 2 rondas, ganancia minima de 2 problemas y maximo de 3 regresiones sobre el conjunto de desarrollo `minif2f_valid.jsonl`; la campana se detuvo tras la ronda 3 por regresion, y la regla selecciono la ronda 1 (este repositorio) como la mejor. El conjunto protegido contra contaminacion fue `minif2f.jsonl`.

## Capacidades

- Generacion de demostraciones formales en Lean 4 a partir de enunciados matematicos.
- Generacion de texto conversacional heredada del modelo base (pipeline text-generation).
- Especializacion en matematicas: los datos de entrenamiento provienen de Goedel-Pset-v1, Nemotron-Math-Proofs-v1, NuminaMath-LEAN-Sol, FormalMATH-All y RL-Goedel-Pset-Level-4-5.
- No hay evidencia publicada de capacidades mejoradas de tool calling, agentes, vision o audio; no disponible.
- Importante: la model card indica que las comparaciones pareadas contra el modelo base no muestran diferencia estadisticamente detectable, por lo que no puede afirmarse una mejora de capacidad respecto al modelo base.

## Casos de uso

- Demostracion automatica de teoremas en Lean 4: el modelo genera candidatos de demostracion para enunciados formales, que pueden verificarse con el kernel de Lean 4 antes de aceptarse, garantizando correccion total.
- Investigacion en auto-mejora de modelos (*expert iteration*): el proceso documentado con manifiestos verificables sirve como referencia reproducible para estudiar bucles de generacion-verificacion-entrenamiento.
- Generacion de datos sinteticos verificados: puede usarse como generador de demostraciones candidatas (con muestreo multiple, por ejemplo 8 muestras por enunciado como en el entrenamiento) para construir datasets de demostraciones formales.
- Asistencia a matematicos y verificadores: ayuda a redactar borradores de demostraciones en Lean 4 que un humano refina y valida posteriormente.
- Evaluacion de pipelines de verificacion formal: util como sujeto de prueba para infraestructuras que integran LLMs con verificadores de teoremas (Lean 4 kernel).
- Educacion en demostracion formal: generacion de ejemplos de demostraciones en Lean 4 para materiales didacticos, siempre con verificacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona comparaciones pareadas contra el modelo base sin entrenar que no muestran diferencia estadisticamente detectable, pero no se proporcionan cifras concretas de MMLU, miniF2F u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en pesos completos (16,4 GB en safetensors, presumiblemente bf16): aproximadamente 18-20 GB con contexto moderado, incluyendo KV cache.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 5090, A100 40 GB o H100 para inferencia comoda en precision completa.
- Consumer GPUs: cabe en una RTX 4090 o RTX 3090 (24 GB) en fp16/bf16; en GPUs de 16 GB seria necesario cuantizar (por ejemplo GGUF Q8 o Q6, no publicado en este repo).
- Opciones de despliegue: transformers (libreria nativa), vLLM, TGI (compatible con text-generation-inference), y presumiblemente llama.cpp/Ollama tras conversion a GGUF (no disponible en el repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Notas |
|---|---|---|---|---|
| viai957/Goedel-Prover-V2-8B-EI-campaign1-r1 | 8,19B | Demostracion Lean 4 (finetune expert iteration) | Apache 2.0 | Sin mejora estadisticamente detectable frente al base segun su model card |
| Goedel-LM/Goedel-Prover-V2-8B (base) | 8,19B | Demostracion Lean 4 | Apache 2.0 | Modelo original; rendimiento equivalente al finetune segun evaluacion pareada |
| Goedel-Prover (versiones anteriores de Project Numina) | no disponible | Demostracion Lean 4 | no disponible | Predecesor en demostracion automatica de teoremas |

## Limitaciones y advertencias

- Rendimiento no mejorado: la propia model card advierte que las comparaciones pareadas contra el modelo base no detectan diferencia estadistica; no hay evidencia de que este finetune aporte ganancia real.
- Entrenamiento muy reducido: solo 442 filas de SFT (1,64 millones de tokens de completacion), un volumen minimo que limita cualquier efecto de aprendizaje.
- Especializacion estrecha: orientado a Lean 4 y matematicas formales; el rendimiento en uso general (conversacion, codigo general, razonamiento no formal) puede degradarse respecto a modelos generalistas.
- Riesgo de alucinacion: como todo LLM, puede generar demostraciones incorrectas; la mitigacion adecuada es verificar siempre con el kernel de Lean 4.
- Contexto y idiomas: no documentados en la model card; deben validarse empiricamente antes de uso en produccion.
- Sesgos: heredados del modelo base Qwen3 y de los datasets de matematicas usados; no se documentan evaluaciones de sesgo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar tambien la licencia del modelo base (tambien Apache 2.0) y de los datasets de entrenamiento si se reentrena.
- Solo pesos completos: no hay versiones cuantizadas publicadas, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r1
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
  - https://huggingface.co/datasets/HangHor/RL-Goedel-Pset-Level-4-5
  - https://huggingface.co/datasets/SphereLab/FormalMATH-All
  - https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Sol
  - https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
