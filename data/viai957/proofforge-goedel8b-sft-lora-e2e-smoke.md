# viai957/proofforge-goedel8b-sft-lora-e2e-smoke

## Resumen

`viai957/proofforge-goedel8b-sft-lora-e2e-smoke` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Goedel-LM/Goedel-Prover-V2-8B`, un modelo de 8B parámetros especializado en demostración automática de teoremas en Lean 4. El adaptador fue entrenado mediante fine-tuning supervisado (SFT) sobre demostraciones generadas por el propio modelo base que fueron verificadas y aceptadas por el kernel de Lean 4, utilizando el conjunto de enunciados `Goedel-LM/Goedel-Pset-v1`.

Es importante destacar que se trata de un artefacto de prueba de concepto (smoke test) del pipeline ProofForge: su propósito explícito es validar que el flujo de entrenamiento, exportación y publicación funciona de extremo a extremo. El propio autor indica que no tiene valor de rendimiento y que no se realiza ninguna afirmación de benchmark. Su relevancia reside en documentar una metodología reproducible de SFT con verificación formal (RLVR-adjacente mediante kernel de Lean) y trazabilidad completa mediante manifiestos con hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo causal transformer (base Goedel-Prover-V2-8B) |
| Parametros totales | no disponible (los del modelo base, 8B según el nombre) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en `torch.bfloat16`) |
| Idiomas soportados | no disponible (especializado en Lean 4) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, 0,7 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 64 y alpha 128, aplicado sobre los módulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj` del modelo base. Se entrenó con SFT estándar en bfloat16 usando atención `sdpa`, sobre 320 filas de demostraciones Lean 4 verificadas por el kernel, generadas a partir de los enunciados de `Goedel-Pset-v1` (problemas informales procedentes de NuminaMath, Apache-2.0). La mezcla de entrenamiento pasó el filtro de descontaminación de ProofForge.

Los hiperparámetros registrados en el manifiesto son: 80 pasos de optimizador, learning rate 2e-05, 4 GPUs en paralelo de datos, micro-batch de 1 por GPU y acumulación de gradientes 1. Los pesos base permanecieron congelados (verificado: `base_unchanged: True`), con 504 tensores LoRA entrenables, todos ellos modificados durante el entrenamiento. Cabe señalar que la exportación fusionada de este adaptador no superó el test de paridad T5 del pipeline: diferencia máxima de logits absoluta de 9,37 (umbral 0,05) y acuerdo greedy de tokens del 99,46 % (umbral 99,5 %), lo cual es coherente con su naturaleza de artefacto de smoke test.

## Capacidades

- Generación de demostraciones formales en Lean 4 (heredada del modelo base Goedel-Prover-V2-8B y ajustada sobre demostraciones verificadas por kernel).
- Traducción de enunciados matemáticos informales a demostraciones formales verificables.
- Al ser un smoke test, no se le atribuyen capacidades mejoradas respecto al modelo base ni se reportan evaluaciones.
- No hay información sobre tool calling, agentes, capacidades multilingües, visión o audio.

## Casos de uso

- Validación de pipelines de entrenamiento formal: sirve como referencia para equipos que quieran reproducir un flujo completo de SFT con verificación Lean 4, exportación y publicación con trazabilidad criptográfica.
- Prueba de integración de PEFT/LoRA: ejemplo real de configuración de adaptador (r 64, alpha 128, siete módulos objetivo) cargable con `PeftModel.from_pretrained`.
- Prototipado de demostración de teoremas: puede cargarse sobre el modelo base para experimentar con generación de pruebas Lean 4 en entornos de investigación, aunque sin garantías de mejora.
- Auditoría de procedencia de datos: caso de estudio de cómo documentar licencias, reversiones y hashes de datasets de entrenamiento.
- Docencia y formación: material ilustrativo sobre fine-tuning de modelos de demostración automática con datos verificados formalmente.
- Desarrollo de tooling de paridad: el fallo documentado del test de paridad de la exportación fusionada es útil para quien desarrolle validadores de fusión LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el artefacto «no tiene valor de rendimiento» y que no se realiza ninguna afirmación de benchmark.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB; el requisito dominante es el modelo base Goedel-Prover-V2-8B (8B parámetros), que en bfloat16 requiere aproximadamente 16 GB de VRAM.
- Debería funcionar en una GPU consumer de gama alta (RTX 4090 con 24 GB) para inferencia en bfloat16; no disponible una estimación oficial.
- El entrenamiento original se ejecutó en 4 GPUs con micro-batch 1, aunque por tratarse de un smoke test con solo 320 filas y 80 pasos, el coste fue bajo.
- Despliegue: cargable con la librería `peft` de Hugging Face junto a `transformers` (`AutoModelForCausalLM` + `PeftModel.from_pretrained`), fijando la revisión del base `dfd02e6271a58375dfbf3ece0175277cf6b6a89a`. No hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Notas |
|---|---|---|---|---|
| viai957/proofforge-goedel8b-sft-lora-e2e-smoke | Adaptador LoRA (smoke test) | 0,7 GB de adaptador sobre base 8B | Apache-2.0 | Sin valor de rendimiento; artefacto de pipeline |
| Goedel-LM/Goedel-Prover-V2-8B (modelo base) | Modelo completo de demostración Lean 4 | 8B | Apache-2.0 | Modelo base real para trabajo con Lean 4 |
| Goedel-LM/Goedel-Prover-V2 (familia) | Serie de verificadores de teoremas | Varias tallas | Apache-2.0 | Estado del arte en generación de demostraciones formales |

Dado que este adaptador es un smoke test sin evaluación, la recomendación práctica es usar directamente el modelo base para cualquier tarea real de demostración de teoremas.

## Limitaciones y advertencias

- Es un artefacto de smoke test: el autor advierte explícitamente que no tiene valor de rendimiento y no debe usarse como modelo productivo.
- La exportación fusionada no superó el test de paridad T5 (diferencia máxima de logits de 9,37 frente a umbral 0,05), por lo que fusionar el adaptador puede alterar el comportamiento del modelo base.
- `adapter_config.json` no fija la revisión del modelo base; es imprescindible fijarla manualmente (`dfd02e6271a58375dfbf3ece0175277cf6b6a89a`) al cargarlo para garantizar reproducibilidad.
- Conjunto de entrenamiento muy reducido (320 filas, 80 pasos): riesgo alto de sobreajuste o de cambio de comportamiento impredecible.
- Especializado en Lean 4; no apto para uso general de generación de texto o código convencional.
- No hay evaluación, datos de sesgo ni análisis de alucinación publicados; al operar en dominio formal, las demostraciones generadas deben verificarse siempre con el kernel de Lean 4.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque los datos fuente (NuminaMath, Apache-2.0; Goedel-Pset-v1, MIT) deben respetarse en usos derivados.
- Métricas del repositorio muy bajas (17 descargas, 1 like): falta de validación comunitaria.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/viai957/proofforge-goedel8b-sft-lora-e2e-smoke
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
- Mirror de datos usado en el entrenamiento: https://huggingface.co/datasets/viai957/lean-prover-data

No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
