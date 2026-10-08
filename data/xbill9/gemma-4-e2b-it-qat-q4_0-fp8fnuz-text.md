# xbill9/gemma-4-E2B-it-qat-q4_0-fp8fnuz-text

## Resumen

Este repositorio es una compilación no oficial de los pesos de `google/gemma-4-E2B-it-qat-q4_0-unquantized` (revisión `6befbac`) en formato FP8 E4M3FNUZ con cuantización W8A8, orientada exclusivamente a texto. Lo publica el usuario `xbill9` de forma independiente a Google. El objetivo no es entrenar un modelo nuevo, sino recodificar un modelo ya entrenado con quantization-aware training (QAT) sobre una rejilla de 4 bits a una rejilla FP8 de 8 bits, para aprovechar las unidades de cómputo FP8 de las GPU AMD CDNA 3 (Instinct MI300X, MI300A, MI325X).

El formato E4M3FNUZ es específico de AMD: comparte mantisa de 3 bits con el E4M3 de NVIDIA, pero tiene el sesgo del exponente una unidad más alto (valor máximo 240 frente a 448) y carece de cero negativo. Todas las capas lineales (276 módulos) se almacenan en FP8 con una escala float32 por canal de salida, y las activaciones se cuantizan a FP8 por token en tiempo de ejecución mediante el esquema `float-quantized` de compressed-tensors. Los embeddings, normalizaciones y demás tensores se mantienen en bf16 copiados byte a byte.

El checkpoint ocupa 6,88 GiB y el repositorio 7,4 GB, con 4.628.569.379 parámetros totales según los safetensors. Verificado contra los pesos QAT, el error RMS relativo es del 2,64 %. El propio autor indica que el modelo está construido y comprobado en local pero todavía no servido ni evaluado, a la espera de una tanda de pruebas de servicio en una única AMD Instinct MI300X.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalle específico no disponible |
| Parámetros totales | 4.628.569.379 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3FNUZ, W8A8, compressed-tensors `float-quantized`; embeddings y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (checkpoint de 6,88 GiB) |

## Arquitectura y entrenamiento

Se trata de un modelo de la familia Gemma 4 de Google DeepMind, en su variante `E2B-it` (instruida) y sometida a quantization-aware training (QAT). El entrenamiento original es de Google; este repositorio únicamente cambia el formato de almacenamiento de los pesos. El QAT original llevó los pesos a una rejilla de 4 bits con una escala por cada grupo de 32 valores. Como el FP8 con una escala por canal de salida no puede representar esas escalas por grupo, esta compilación vuelve a redondear los pesos QAT a la rejilla E4M3FNUZ con una escala `max\|row\| / 240`, y además cuantiza las activaciones.

La conversión se realizó sin datos de calibración, con el script `fp8_text.py` (incluido en el repositorio, invocado con `--fnuz`), que importa utilidades de `repack_q4_0.py`. El resultado son 276 módulos lineales en FP8 con 1.876.819.968 valores cuantizados. Frente a los pesos QAT, el error RMS relativo es del 2,64 % y el mayor error, expresado como fracción del valor máximo de su fila, es del 3,33 %. Los 264 tensores restantes (embeddings, normas y otros) son idénticos byte a byte a su origen. No se describe ninguna innovación arquitectónica propia: es un recodificado de precisión de un modelo existente.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base `gemma-4-E2B-it` instruido.
- Capacidad de razonamiento y de respuesta a instrucciones en formato chat (pipeline `text-generation`, etiqueta `conversational`).
- Funcionamiento exclusivamente de texto: este build elimina cualquier componente multimodal presente en el modelo original (etiqueta `text-only`).
- Servicio mediante vLLM, con soporte del cargador de compressed-tensors.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Inferencia de texto de bajo coste en hardware AMD CDNA 3: al estar en FP8 W8A8 con formato nativo E4M3FNUZ, aprovecha las matrices FP8 de la MI300X/MI300A/MI325X para reducir el uso de memoria y aumentar el throughput de las capas lineales frente a un modelo en bf16.
- Despliegue con vLLM en clústeres ROCm: el repositorio declara `library_name: vllm`, de modo que se integra directamente en ese servidor para servir un endpoint compatible con la API de OpenAI.
- Sustitución de un modelo de mayor precisión en tareas de generación de texto donde el error de 2,64 % en RMS resulte aceptable, liberando memoria HBM para caché KV o mayor lote de peticiones.
- Pruebas de cuantización y validación de pipelines compressed-tensors: sirve como caso de referencia para comparar E4M3 frente a E4M3FNUZ en el mismo modelo.
- Generación de texto de propósito general en entornos con restricciones de VRAM, dado que el checkpoint de 6,88 GiB es relativamente ligero.
- Investigación sobre el impacto del redondeo doble (QAT 4 bits a FP8) en la calidad de salida, comparando este build con su gemelo en E4M3 y con la versión W4A16 de rejilla exacta.
- Base para experimentos de ajuste fino o evaluación en hardware AMD Instinct, dado que el formato apunta exclusivamente a CDNA 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo está construido y verificado en local contra su origen, pero todavía no servido ni evaluado. El único dato numérico de rendimiento disponible es la fidelidad de la cuantización respecto a los pesos QAT:

| Métrica de cuantización | Valor |
|---|---:|
| Módulos lineales en FP8 | 276 |
| Valores cuantizados | 1.876.819.968 |
| Error RMS relativo frente a QAT | 2,64 % |
| Mayor error (fracción del máximo de su fila) | 3,33 % |
| Tensores idénticos byte a byte al origen | 264 de 264 |
| Tamaño del checkpoint | 6,88 GiB |

## Requisitos de hardware

- VRAM estimada para los pesos: unos 6,88 GiB (checkpoint FP8), más el espacio para activaciones y caché KV, que depende de la longitud de contexto y del tamaño de lote (no disponible).
- GPU objetivo: AMD Instinct MI300X, MI300A y MI325X (CDNA 3), las únicas con soporte nativo de E4M3FNUZ.
- GPU NVIDIA: no probadas según el autor. El cargador de compressed-tensors de vLLM en ROCm convierte los pesos a E4M3FNUZ para la GPU; en otras GPU el comportamiento no está validado.
- GPU de consumo: el peso en FP8 cabe teóricamente en tarjetas de 8-12 GiB, pero el formato E4M3FNUZ está pensado para CDNA 3, por lo que su uso en GPU de consumo no está soportado ni probado.
- Opciones de despliegue: vLLM (declarado como librería). No se mencionan GGUF, llama.cpp, Ollama ni TGI, y el formato compressed-tensors FP8 no es directamente compatible con ellos.
- Latencia y throughput: no disponibles; el autor no ha ejecutado todavía la tanda de servicio en MI300X.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|
| `xbill9/gemma-4-E2B-it-qat-q4_0-fp8fnuz-text` (este) | FP8 E4M3FNUZ W8A8 | 6,88 GiB | apache-2.0 | Orientado a AMD CDNA 3; error RMS 2,64 %; sin evaluar |
| `xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text` | FP8 E4M3 W8A8 | no disponible | apache-2.0 | Gemelo en E4M3; mismos pesos, distinto punto de redondeo |
| `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text` | W4A16 compressed-tensors | no disponible | apache-2.0 | Conserva la rejilla QAT exacta de 4 bits |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` | sin cuantizar | no disponible | apache-2.0 | Modelo base sobre el que se construyen los tres anteriores |

No se dispone de datos de rendimiento ni de benchmarks para establecer comparaciones de calidad entre estas variantes.

## Limitaciones y advertencias

- Solo texto: se ha descartado cualquier componente multimodal del modelo original.
- Estado sin evaluar: el autor no ha servido ni medido el modelo; no hay datos de calidad de generación ni de degradación frente al modelo sin cuantizar.
- Es una compilación no oficial, no afiliada ni respaldada por Google; los problemas deben reportarse al autor del repositorio, no a Google.
- El redondeo doble (de la rejilla QAT de 4 bits a FP8 con escala por canal) pierde las escalas por grupo de 32 valores del QAT original, lo que puede alterar la fidelidad respecto a la versión W4A16.
- Dependencia de hardware: E4M3FNUZ solo es nativo en AMD CDNA 3; en otras GPU el comportamiento no está probado y el subnormal más pequeño de E4M3FNUZ (2^-10) no se preserva en el viaje E4M3.
- Fecha de creación del repositorio: 2026-10-08; descargas registradas: 13, likes: 0.
- Idiomas, longitud de contexto, sesgos y riesgo de alucinación: no disponibles en la información proporcionada.
- Licencia apache-2.0 enlazada a la licencia de Gemma 4; conviene revisar los términos de uso de Gemma 4 antes de un uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-fp8fnuz-text
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante gemela en E4M3: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text
- Variante en rejilla QAT exacta W4A16: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
