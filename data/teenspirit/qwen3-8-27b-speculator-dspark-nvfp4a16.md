# TeenSpirit/Qwen3.8-27B-speculator.dspark-NVFP4A16

## Resumen

Qwen3.8-27B-speculator.dspark-NVFP4A16 es una cuantización weight-only en NVFP4 (formato NVFP4A16) del modelo borrador (draft model o speculator) DSpark de Red Hat para el verificador Qwen/Qwen3.8-27B. No es un modelo generativo autónomo: es una pieza de infraestructura de decodificación especulativa que propone tokens candidatos para que un modelo mayor los verifique, acelerando así la inferencia sin alterar la distribución de salida del verificador. La publica el usuario TeenSpirit como re-cuantización comunitaria, no como release oficial de Red Hat; la arquitectura, los pesos y el entrenamiento son íntegramente los del checkpoint base RedHatAI/Qwen3.8-27B-speculator.dspark.

El checkpoint ocupa 1,3 GB frente a los 4,0 GB del original en bf16, con 1.988.431.617 parámetros según los safetensors (1,86 B de ellos cuantizados a FP4). La cuantización es round-to-nearest sin calibración, con pesos FP4 E2M1 simétricos, grupo de 16 y escalas de grupo en FP8 E4M3 más una escala global FP32 por tensor; las activaciones permanecen en bf16. Según las mediciones del autor en Spec-Bench con vLLM 0.33.0 sobre una NVIDIA H20, la longitud de aceptación media es prácticamente idéntica a la del borrador bf16 (4,34 frente a 4,35 en greedy), por lo que el ahorro de memoria no penaliza de forma medible la aceleración.

Su relevancia es operativa: permite desplegar decodificación especulativa con Qwen3.8-27B reduciendo la huella del borrador a menos de un tercio, lo que libera VRAM para el verificador o para aumentar el lote concurrente. Está pensado para integrarse en vLLM mediante `--speculative-config` con el método `dspark` y 7 tokens especulativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador (speculator) DSpark para decodificación especulativa; transformer con cabezas `markov_head` y `confidence_head`; detalles completos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | 1.988.431.617 (1,86 B cuantizados a FP4) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 weight-only: pesos FP4 E2M1 simétricos, grupo de 16, escalas de grupo FP8 E4M3 y escala global FP32 por tensor; activaciones en bf16; formato `compressed-tensors` `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del checkpoint base) |
| Formato de pesos | safetensors con `compressed-tensors` (`weight_packed`, `weight_scale`, `weight_global_scale`); requiere `custom_code` |

## Arquitectura y entrenamiento

El modelo es un speculator DSpark, es decir, un borrador entrenado específicamente para proponer secuencias de tokens que el verificador Qwen3.8-27B acepta o rechaza en cada paso de verificación. Incorpora dos componentes diferenciados que se mantienen en bf16: `markov_head` y `confidence_head`, además de las normas. El resto de módulos lineales —las proyecciones de atención `q/k/v/o`, las del MLP `gate/up/down` y la capa `fc`— se almacenan en FP4. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el volumen o composición del dataset de entrenamiento del checkpoint base.

La innovación de esta ficha es exclusivamente de formato: se aplica cuantización post-entrenamiento round-to-nearest con escalas min/max, sin datos de calibración y sin GPTQ ni AWQ, usando las primitivas de `compressed-tensors` (`apply_quantization_config`, cálculo de escalas min/max y `ModelCompressor.compress_model`). El error relativo de Frobenius medio por capa es del 9,5 %. La lista de exclusión emplea expresiones regulares (`re:.*markov_head.*`, `re:.*confidence_head.*`) para casar tanto los nombres del checkpoint como los nombres con prefijo `model.` de vLLM. Como vLLM fusiona `q/k/v_proj` y `gate/up_proj` en capas lineales únicas y conserva una sola escala global por capa fusionada, los miembros de cada grupo comparten la escala global mínima del grupo, siguiendo el criterio de llm-compressor; de lo contrario vLLM aplicaría mal la escala a todos los miembros salvo uno.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B; no es un modelo para uso generativo directo.
- Aceleración de inferencia del verificador mediante verificación de hasta 7 tokens especulativos por paso (configuración probada).
- Longitudes de aceptación medidas entre 2,89 y 5,37 tokens por paso según tarea y modo de muestreo.
- Compatibilidad con decodificación greedy (temperatura 0) y con muestreo (temperatura 1.0, top_p 0.95, top_k 20).
- Cobertura de tareas verificada en Spec-Bench: question (MT-Bench), translation, summarization, qa, math_reasoning y rag.
- Integración nativa con vLLM 0.33.0 mediante `--speculative-config` y método `dspark`; vLLM lee el `quantization_config` del propio borrador y ejecuta las proyecciones con `CompressedTensorsW4A4Fp4` en modo weight-only (`HummingNvFp4LinearKernel`).
- Tool calling, agentes, visión, audio o modo thinking propios: no disponible (el modelo no expone capacidades generativas autónomas; hereda el comportamiento del verificador).

## Casos de uso

- Servicio de chat de baja latencia con Qwen3.8-27B: desplegar el verificador con este borrador en vLLM permite reducir el coste por token generado manteniendo la distribución de salida del verificador, con una huella de solo 1,3 GB adicionales.
- Aumento de concurrencia en producción: al recortar el borrador de 4,0 GB a 1,3 GB, se libera VRAM que puede destinarse a más secuencias simultáneas o a un contexto mayor del verificador; las pruebas del autor se hicieron con concurrencia 64.
- Razonamiento matemático y QA documental: son las tareas con mayor longitud de aceptación (5,37 en math_reasoning y 4,61 en rag en greedy), por lo que resultan las más rentables para decodificación especulativa con este borrador.
- Traducción automática por lotes: la tarea de translation alcanza 4,37 tokens aceptados por paso en greedy, lo que reduce el número de pasos de verificación en pipelines de traducción de alto volumen.
- Resumen de documentos largos: con 3,84 de longitud de aceptación en summarization, el borrador amortiza su coste en cargas de trabajo de resumen con `max_tokens` elevado (probado con 4096).
- Despliegue en hardware Hopper sin tensor cores FP4: el kernel descomprime los pesos FP4 a bf16 dentro del propio kernel, de modo que el checkpoint es utilizable en H20 y GPUs Hopper aunque no exista aceleración nativa FP4.
- Evaluación y benchmarking de decodificación especulativa: sirve como referencia para comparar longitudes de aceptación entre borradores bf16 y cuantizados usando los subconjuntos de RedHatAI/speculator_benchmarks.

## Benchmarks y rendimiento

Longitud de aceptación (AL, tokens aceptados por paso de verificación) frente al borrador bf16 original, medido en Spec-Bench con verificador Qwen/Qwen3.8-27B bf16 denso, vLLM 0.33.0, 1× H20, 7 tokens especulativos, thinking activado, `max_tokens` 4096, concurrencia 64:

| Dataset | bf16 AL | NVFP4A16 AL |
|---|---:|---:|
| question (MT-Bench) | 3,73 | 3,78 |
| translation | 4,44 | 4,37 |
| summarization | 3,83 | 3,84 |
| qa | 4,16 | 4,08 |
| math_reasoning | 5,36 | 5,37 |
| rag | 4,59 | 4,61 |
| media | 4,35 | 4,34 |

Tasa de aceptación por posición en greedy (NVFP4A16):

| Dataset | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 |
|---|---:|---:|---:|---:|---:|---:|---:|
| question | 78,9 % | 59,1 % | 44,1 % | 33,6 % | 25,9 % | 20,4 % | 16,4 % |
| translation | 82,7 % | 67,7 % | 55,2 % | 44,4 % | 35,5 % | 28,6 % | 22,5 % |
| summarization | 81,6 % | 63,1 % | 48,1 % | 35,3 % | 25,9 % | 18,0 % | 12,2 % |
| qa | 78,8 % | 61,8 % | 49,5 % | 39,6 % | 31,9 % | 25,7 % | 20,8 % |
| math_reasoning | 89,2 % | 79,3 % | 69,2 % | 60,7 % | 52,7 % | 46,2 % | 39,8 % |
| rag | 84,6 % | 70,4 % | 58,1 % | 48,5 % | 39,6 % | 32,7 % | 27,2 % |

Muestreo (temperatura 1.0, top_p 0.95, top_k 20):

| Dataset | bf16 AL | NVFP4A16 AL |
|---|---:|---:|
| question | 2,94 | 2,98 |
| translation | 3,44 | 3,34 |
| summarization | 3,20 | 3,23 |
| qa | 2,93 | 2,89 |
| math_reasoning | 4,38 | 4,25 |
| rag | 3,45 | 3,41 |
| media | 3,39 | 3,35 |

La comparación pareada por prompt de tokens de salida por paso de verificación (480 prompts) arroja una diferencia NVFP4A16 menos bf16 de −0,005 ± 0,033 en greedy y +0,001 ± 0,043 en muestreo, con un 95 % de confianza: el coste de la cuantización no es medible a esta escala. No se han publicado resultados de benchmarks de calidad generativa (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con la naturaleza de borrador del modelo.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,3 GB de pesos más overhead de activaciones y caché KV del verificador; el original bf16 requiere unos 4,0 GB.
- GPU validadas: NVIDIA H20 (Hopper), con vLLM 0.33.0 y kernel `HummingNvFp4LinearKernel` en modo weight-only. En Hopper no hay tensor cores FP4 nativos, por lo que las activaciones se mantienen en bf16 y los pesos FP4 se descomprimen dentro del kernel.
- GPU Blackwell: el autor indica que el checkpoint debería cargar, pero no se ha probado.
- GPU de consumo: no disponible; no se han publicado pruebas en RTX 4090, RTX 5090 ni similares.
- Despliegue: vLLM 0.33.0 con `--speculative-config '{"model":"TeenSpirit/Qwen3.8-27B-speculator.dspark-NVFP4A16","num_speculative_tokens":7,"method":"dspark"}'`. Requiere `compressed-tensors` y el código personalizado del modelo (`custom_code`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo longitudes de aceptación, que implican un menor número de pasos de verificación por token generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| TeenSpirit/Qwen3.8-27B-speculator.dspark-NVFP4A16 | 1,99 B | NVFP4A16 (weight-only) | 1,3 GB | Apache 2.0 | Re-cuantización comunitaria; AL media 4,34 (greedy) |
| RedHatAI/Qwen3.8-27B-speculator.dspark | 1,99 B | bf16 | 4,0 GB | Apache 2.0 | Checkpoint base oficial; AL media 4,35 (greedy, re-medido por el autor) |
| Qwen/Qwen3.8-27B | no disponible | bf16 denso | no disponible | no disponible | Verificador; no es un borrador, no es comparable en función |

La comparación relevante es únicamente contra el checkpoint base bf16, del que esta ficha es una re-cuantización. No se dispone de información sobre otros borradores DSpark o speculators alternativos para Qwen3.8-27B.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para generar texto de forma autónoma; su función es proponer tokens que el verificador Qwen3.8-27B valida.
- Re-cuantización no oficial: no es un release de Red Hat; el soporte y la validación corren a cargo del autor comunitario.
- Validación limitada a una sola GPU (H20) y una sola versión de vLLM (0.33.0); el comportamiento en Blackwell y en otras versiones de vLLM no está verificado.
- Error de cuantización de pesos del 9,5 % (Frobenius relativo medio por capa), sin calibración; en esta escala no afecta de forma medible a la longitud de aceptación, pero no se ha evaluado su impacto en distribuciones o dominios distintos de Spec-Bench.
- Las escalas globales compartidas en capas fusionadas por vLLM pueden introducir un sesgo adicional no caracterizado fuera de los conjuntos probados.
- Idiomas soportados no documentados; la cobertura multilingüe depende del verificador y del entrenamiento del borrador base.
- Riesgo de alucinación: no aplica de forma directa, ya que el verificador filtra las propuestas; el riesgo real es una tasa de aceptación menor de la esperada en dominios alejados del entrenamiento, con la consiguiente pérdida de aceleración.
- Licencia Apache 2.0 heredada, que permite uso comercial; conviene verificar igualmente los términos del checkpoint base y del verificador Qwen3.8-27B.
- Requiere `custom_code` y `compressed-tensors`; entornos de despliegue sin soporte para `nvfp4-pack-quantized` no podrán cargar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TeenSpirit/Qwen3.8-27B-speculator.dspark-NVFP4A16
- Checkpoint base: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Verificador: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Estadísticas de cuantización: `ptq_rtn_stats.json` (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
