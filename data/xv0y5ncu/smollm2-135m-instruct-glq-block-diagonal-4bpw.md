# xv0y5ncu/SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw

## Resumen

SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw es una versión cuantizada a 4 bits por peso (bpw) del modelo instructivo SmolLM2-135M-Instruct de Hugging Face, publicada por el usuario xv0y5ncu. La cuantización emplea GLQ (Gaussian Lattice Quantization), un esquema basado en un codebook de retículo E8 combinado con una transformada de Hadamard aleatorizada de tipo block-diagonal y el algoritmo LDLQ. El resultado es un checkpoint de aproximadamente 111 MB frente a los ~270 MB del original en bf16, con una tasa efectiva que coincide con la nominal de 4 bpw.

La relevancia de esta ficha no reside en el modelo base (un transformer denso de apenas 135M de parámetros, pensado para entornos con recursos muy limitados) sino en el método de compresión: la variante block-diagonal evita el padding a potencias de dos que inflaba la tasa efectiva a ~10 bpw en la versión anterior del mismo autor, y además mejora la relación señal-ruido de cuantización (SQNR) a igual almacenamiento. Según la model card, la degradación media en una batería de cinco tareas de lm-evaluation-harness es de solo el 2,4 % respecto a bf16.

El modelo conserva la licencia Apache 2.0 del original y está orientado a generación de texto conversacional en inglés. Es un caso de estudio útil para quienes evalúan técnicas de cuantización extrema en modelos pequeños, no un modelo de propósito general para producción exigente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2); cuantización GLQ con retículo E8, transformada de Hadamard block-diagonal y LDLQ |
| Parámetros totales | 55.194.048 (según safetensors del checkpoint cuantizado); el modelo base SmolLM2-135M-Instruct tiene 135M |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el calibrado usó secuencias de 2048 tokens) |
| Tipos de cuantización | 4 bpw uniforme (GLQ); checkpoint en safetensors con pesos cuantizados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere el paquete `glq` para cargarse con transformers) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only denso de la familia SmolLM2 de Hugging Face, ajustado para instrucciones. Sobre él se aplica una cuantización post-entrenamiento GLQ: los pesos se proyectan sobre un codebook de retículo E8 tras aplicar una transformada de Hadamard aleatorizada con estructura block-diagonal, y el error residual se compensa mediante LDLQ. La calibración se realizó con WikiText-2 (128 muestras, longitud de secuencia 2048).

La innovación respecto a la variante previa del mismo autor es que la transformada block-diagonal no requiere rellenar dimensiones no potencia de dos hasta la siguiente potencia de dos, lo que evita la inflación de la tasa efectiva (de ~10 bpw a 4 bpw reales) y, según la model card, produce un SQNR medio de 18,6 dB, superior al de la versión con padding a igual almacenamiento. No se dispone de información sobre el proceso de entrenamiento del modelo base (composición del dataset, número de tokens, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste instructivo del modelo base.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño de 135M parámetros del original.
- Generación de código y matemáticas elementales: capacidad muy limitada por la escala del modelo base; no se documentan evaluaciones específicas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable a esta escala.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluación de técnicas de cuantización: el checkpoint sirve como banco de pruebas reproducible para comparar GLQ block-diagonal frente a otras cuantizaciones de 4 bits en un modelo pequeño, con métricas de lm-evaluation-harness ya publicadas.
- Despliegue en dispositivos de borde con memoria muy restringida: los ~111 MB del checkpoint permiten ejecutar generación de texto en microcontroladores de gama alta, SBCs o móviles, donde un modelo de 270 MB en bf16 no cabría con holgura.
- Prototipado rápido de pipelines de inferencia con vLLM: el autor documenta el servicio con `vllm serve ... --quantization glq`, útil para validar integraciones antes de escalar a modelos mayores.
- Educación y demostraciones: modelo lo bastante pequeño para ilustrar el funcionamiento interno de un transformer instructivo y de un esquema de cuantización por retículos en un cuaderno o portátil sin GPU dedicada.
- Pruebas de regresión de tooling de cuantización: al tener métricas de referencia (arc_easy, hellaswag, piqa, winogrande, lambada_openai) y SQNR, sirve para verificar que nuevas versiones de la librería `glq` no degradan la calidad.
- Generación de texto auxiliar de bajo coste: borradores, completado de plantillas o clasificación simple en inglés donde la latencia y el consumo importan más que la calidad absoluta.

## Benchmarks y rendimiento

Resultados de lm-evaluation-harness (5 tareas), medidos por el autor con backend vLLM y transformers 5.x sobre la misma pila para GLQ y bf16:

| Tarea | GLQ 4 bpw | bf16 | GLQ / bf16 |
|---|---|---|---|
| arc_easy | 0,4407 | 0,4899 | 90,0 % |
| hellaswag (acc_norm) | 0,4178 | 0,4294 | 97,3 % |
| piqa | 0,6545 | 0,6687 | 97,9 % |
| winogrande | 0,5422 | 0,5107 | 106,2 % |
| lambada_openai | 0,3846 | 0,4007 | 96,0 % |
| **Media** | **0,4880** | **0,4999** | **97,6 %** |

SQNR medio de cuantización: 18,6 dB. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; el checkpoint ocupa ~111 MB y los pesos se cargan con `dtype=torch.float16` según el ejemplo del autor, por lo que la huella en memoria es mínima.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM; el modelo no aprovecha aceleradores de gama alta (A100, H100) por su escala.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: vLLM con `--quantization glq` (documentado por el autor) y transformers con `import glq.hf_integration`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw | 135M (base) / 55,2M en safetensors cuantizado | No disponible | Apache 2.0 | safetensors + `glq` | 4 bpw reales, ~111 MB, media lm-eval 0,4880 |
| SmolLM2-135M-Instruct (bf16) | 135M | No disponible | Apache 2.0 | safetensors | Referencia sin cuantizar, ~270 MB, media lm-eval 0,4999 |
| SmolLM2-135M-Instruct-GLQ-4bpw (versión previa del autor) | 135M (base) | No disponible | Apache 2.0 | safetensors + `glq` | Padding a potencia de dos, tasa efectiva ~10 bpw, ~191 MB |
| SmolLM2-360M-Instruct | 360M | No disponible | Apache 2.0 | safetensors | Alternativa de mayor tamaño de la misma familia; sin datos de cuantización GLQ |

## Limitaciones y advertencias

- Modelo base de 135M parámetros: capacidad de razonamiento, conocimiento factual y calidad de código muy limitadas; no apto para tareas que requieran precisión alta.
- Riesgo elevado de alucinación inherente a modelos pequeños, agravado por la cuantización a 4 bpw.
- Solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Dependencia de la librería `glq` y de su integración con transformers: el checkpoint no se carga con un `AutoModelForCausalLM.from_pretrained` estándar sin `import glq.hf_integration`.
- La cuantización introduce degradación medible: 10 % en arc_easy y ~3-4 % en hellaswag, piqa y lambada_openai respecto a bf16; winogrande mejora ligeramente, probablemente dentro del ruido de lm-eval.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el checkpoint cuantizado; conviene validar en el caso de uso concreto.
- No hay soporte documentado para llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue en producción.
- El modelo fue creado en junio de 2026 y actualizado en noviembre de 2026 según los metadatos; verificar la vigencia de la librería `glq` antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/xv0y5ncu/SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Versión previa GLQ 4bpw: https://huggingface.co/xv0y5ncu/SmolLM2-135M-Instruct-GLQ-4bpw
- Repositorio GLQ: https://github.com/cnygaard/glq
