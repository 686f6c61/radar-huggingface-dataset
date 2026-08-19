# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l4` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` para que genere cadenas de razonamiento extremadamente comprimidas, concretamente en el "nivel L4" de un esquema de compresión de chain-of-thought (CoT). En este nivel, los pasos intermedios se expresan como asignaciones encadenadas con punto y coma (p. ej., `K=18*2.5;D=8*4;T=K+D->T=77`), reduciendo la longitud mediana de la cadena de 532 caracteres (nivel L1) a unos 41 caracteres. El adaptador se entrena mediante GRPO (con variante DAPO) sobre un modelo SFT previo, y se publica como una **ablación** para comparar diseños de recompensa, no como un modelo principal.

El modelo base, Olmo-3-7B-Think, es un transformer causal de 7B parámetros desarrollado por el Allen Institute for AI (AI2), entrenado con SFT, DPO y RLVR para producir razonamiento explícito. El adaptador añade una capa de compresión que reduce drásticamente la longitud de las cadenas de pensamiento, lo que podría interesar a quienes investigan eficiencia en inferencia o quieren estudiar el impacto de la compresión en la precisión. El repositorio del adaptador ocupa 0.2 GB y está licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre `allenai/Olmo-3-7B-Think` (transformer causal, 7B) |
| Parametros totales | Adaptador: ~0.2 GB en disco (numero exacto de parametros no disponible); modelo base: 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentacion) |
| Tipos de cuantizacion | Adaptador en safetensors (bf16); el modelo base tiene cuantizaciones GGUF disponibles (p. ej., via unsloth) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo causal decoder-only de 7B parámetros. El adaptador LoRA (r=16, alpha=32) se entrena con GRPO (implementado con `trl.GRPOTrainer` sobre `transformers` estándar, atención `sdpa`) sobre el modelo SFT fusionado correspondiente al nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`). El conjunto de prompts es `gsm8k_grpo_balanced_1k.json` (1.000 problemas de GSM8K), con 8 generaciones por prompt, batch efectivo de 64 (32 x 2 acumulación), longitud máxima de completación de 256 tokens, learning rate de 1e-05 y coeficiente KL (beta) de 0.0.

La función de recompensa combina cuatro componentes: `correctness` (basada en la coincidencia con la respuesta dorada, ponderada por el número de pasos de la solución), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (un verificador que comprueba que la aritmética escrita en la cadena sea correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva, con suelo en 0.3). El entrenamiento se realizó en una única NVIDIA A100 de 80 GB. Un detalle técnico relevante: el autor verificó que `lora_B != 0` en todos los adaptadores publicados, descartando 13 que resultaron matemáticamente inertes al usar kernels fusionados.

## Capacidades

- Razonamiento matemático: resuelve problemas de aritmética de varios pasos del conjunto GSM8K, expresando el razonamiento en formato comprimido (nivel L4).
- Generación de texto con chain-of-thought: produce cadenas de pensamiento internas (en el bloque `thinking`) extremadamente cortas, del orden de 41 caracteres de mediana.
- Verificación aritmética: el componente `chain` de la recompensa asegura que los cálculos intermedios escritos en la cadena sean correctos.
- Sin soporte de tool calling, visión ni audio: es un modelo puramente textual y especializado en razonamiento matemático.
- Multilingüe: solo inglés.

## Casos de uso

- Investigación sobre compresión de chain-of-thought: este adaptador permite estudiar cómo afecta la reducción drástica de la longitud de las cadenas de razonamiento (de 532 a 41 caracteres) a la precisión final, comparando con otros niveles (L1, L2, etc.) dentro de la misma familia.
- Ablación de diseño de recompensas: al ser una variante con la recompensa `gr3`, sirve para reproducir y verificar los resultados del paper "Chain-of-Thought Compression Dialects" y comparar el impacto de distintas funciones de recompensa en el rendimiento.
- Evaluación de robustez en razonamiento matemático: puede usarse en baterías de pruebas que midan la degradación de precisión según la dificultad del problema, especialmente en niveles de compresión altos.
- Generación de texto con restricciones de longitud: en escenarios donde se requiere que el modelo produzca justificaciones muy breves (p. ej., logs de depuración), este adaptador fuerza un formato conciso.
- Entrenamiento posterior o fine-tuning adicional: al ser un adaptador LoRA ligero (0.2 GB), puede integrarse fácilmente en pipelines de experimentación que requieran iterar sobre distintas configuraciones de compresión.
- Verificación de integridad de adaptadores: el autor documenta un proceso de control de calidad (verificación de `lora_B != 0`) que puede servir como referencia metodológica para otros desarrolladores.

## Benchmarks y rendimiento

Según los datos declarados en la model card, el adaptador obtiene un 67.9% de precisión (exact match) en el conjunto de test de GSM8K (n=1317), con decodificación greedy, single-turn, sin ejemplos y sin self-consistency. No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la información disponible. Tampoco hay comparativas con otros modelos o con el modelo base sin compresión.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 67.9% |

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7B parámetros). En bf16, el modelo base ocupa aproximadamente 14 GB de VRAM, más overhead de activaciones.
- Para inferencia con el adaptador fusionado, se recomienda una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB). Con cuantización GGUF del modelo base (4 bits), podría ejecutarse en GPUs de 8 GB, aunque el adaptador no está disponible en formato GGUF.
- El entrenamiento se realizó en una única NVIDIA A100 de 80 GB.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft` (como se muestra en el README) o fusionarse y exportarse a formatos como GGUF para usar con `llama.cpp` u Ollama. También es compatible con frameworks de servido como vLLM (tras fusionar el adaptador con el modelo base).
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación del adaptador. Como referencia cualitativa, el modelo base `allenai/Olmo-3-7B-Think` pertenece a la categoría de modelos de razonamiento de 7B (junto con Llama-3.1-8B-Instruct o Qwen2.5-7B-Instruct), pero no hay datos de benchmarks que permitan una comparación directa. El propio adaptador es una ablación y no está diseñado como modelo de propósito general.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matemáticas (GSM8K); no generaliza a otros dominios de razonamiento o generación de texto.
- La precisión disminuye con la dificultad del problema, y esta degradación es más acusada en los niveles de compresión altos (como L4).
- Es una **ablación** específica para comparar recompensas; puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l4`).
- Resultado de una única semilla (seed3); diferencias de un par de puntos porcentuales pueden deberse a ruido estadístico (intervalo de confianza del 95% de ±2.7 pp en n=1317).
- El adaptador debe cargarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), no directamente sobre el base, para reproducir los resultados.
- Solo soporta inglés.
- Licencia Apache-2.0 permite uso comercial, pero al ser un modelo de investigación, se recomienda validar su comportamiento antes de usarlo en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Cuantizaciones GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Modelo SFT necesario (nivel L4): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4 (referenciado en el README, no verificado)
- Paper citado: "Chain-of-Thought Compression Dialects" (Frolov, 2026) — sin enlace público disponible.
